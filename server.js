import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// ===== DEV AUTO LOGIN (ca să nu mai fie nevoie de autentificare la test) =====
const DEV_NO_AUTH = (process.env.DEV_NO_AUTH || '').toLowerCase() === 'true';

// --- DB ---
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    age_verified INTEGER DEFAULT 0,
    subscribed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE,
    ai_generated INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    spec_json TEXT,
    amount_cents INTEGER,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'created',
    provider TEXT DEFAULT 'CCBill',
    provider_ref TEXT,
    result_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    kind TEXT,
    status TEXT,
    input_json TEXT,
    output_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    meta_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

async function currentUser(req) {
  if (!req.session.userId) return null;
  return await get('SELECT * FROM users WHERE id=?', [req.session.userId]);
}

// ===== autologin pt DEV_NO_AUTH =====
app.use(async (req, res, next) => {
  try {
    if (DEV_NO_AUTH && !req.session.userId) {
      let u = await get('SELECT * FROM users WHERE email=?', ['dev@local.test']);
      if (!u) {
        const r = await run(
          'INSERT INTO users(email, age_verified, subscribed) VALUES(?,?,?)',
          ['dev@local.test', 1, 1]
        );
        req.session.userId = r.lastID;
      } else {
        req.session.userId = u.id;
      }
    }
  } catch {}
  next();
});

// seed demo media
(async () => {
  const files = ['/demo/ai1.jpg', '/demo/ai2.jpg', '/demo/ai3.jpg'];
  for (const p of files) {
    try { await run('INSERT OR IGNORE INTO media(path, ai_generated) VALUES(?,1)', [p]); } catch {}
  }
})();

// policy filter (simplu)
function allowed(text = '') {
  const bad = ['deepfake','real person','celebr','undress','remove clothes','minor','under 18',' teen ','bestial','rape','nonconsens'];
  const t = text.toLowerCase();
  return !bad.some(w => t.includes(w));
}

// auth
app.post('/api/login', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  let user = await get('SELECT * FROM users WHERE email=?', [email]);
  if (!user) {
    const r = await run('INSERT INTO users(email) VALUES(?)', [email]);
    user = await get('SELECT * FROM users WHERE id=?', [r.lastID]);
  }
  req.session.userId = user.id;
  res.json({ ok: true, user });
});

// age & subscribe (demo)
app.post('/api/verify-age/mock', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  await run('UPDATE users SET age_verified=1 WHERE id=?', [user.id]);
  res.json({ ok: true });
});
app.post('/api/subscribe/mock', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  await run('UPDATE users SET subscribed=1 WHERE id=?', [user.id]);
  res.json({ ok: true });
});

// image gen (demo -> returnează aleator o imagine din /demo)
const demoImgs = ['/demo/ai1.jpg','/demo/ai2.jpg','/demo/ai3.jpg'];
app.post('/api/gen/image', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  const { prompt = '' } = req.body || {};
  if (!allowed(prompt)) return res.status(400).json({ error: 'Prompt not allowed' });
  const url = demoImgs[Math.floor(Math.random()*demoImgs.length)];
  res.json({ ok: true, url });
});

// video gen (stub)
app.post('/api/gen/video', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  const { storyboard = '' } = req.body || {};
  if (!allowed(storyboard)) return res.status(400).json({ error: 'Storyboard not allowed' });
  res.json({ ok: true, url: '/demo/video-placeholder.mp4' });
});

// eraser (AI-only)
app.post('/api/erase', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  const { mediaPath = '' } = req.body || {};
  const row = await get('SELECT * FROM media WHERE path=?', [mediaPath]);
  if (!row || !row.ai_generated) return res.status(400).json({ error: 'AI-only media allowed' });
  res.json({ ok: true, message: 'Eraser accepted (demo)' });
});

// signed media (local fallback)
app.post('/api/media/sign', async (req, res) => {
  const user = await currentUser(req); if (!user) return res.status(401).json({ error: 'Not logged in' });
  if (!user.age_verified) return res.status(403).json({ error: 'Age not verified' });
  if (!user.subscribed) return res.status(403).json({ error: 'Not subscribed' });
  const { path: mediaPath = '/demo/ai2.jpg' } = req.body || {};
  res.json({ url: mediaPath });
});

// admin
app.get('/api/admin/stats', async (req, res) => {
  const users = await get('SELECT COUNT(*) c FROM users');
  const orders = await get('SELECT COUNT(*) c FROM orders');
  const jobs = await get('SELECT COUNT(*) c FROM jobs');
  res.json({ users: users?.c || 0, orders: orders?.c || 0, jobs: jobs?.c || 0 });
});

// static
app.use('/demo', express.static(path.join(__dirname, 'public', 'demo')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The Future — PRO running on http://localhost:${PORT}`));

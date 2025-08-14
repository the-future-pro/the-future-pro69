import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

import Stripe from 'stripe';
import SQLiteStoreFactory from 'connect-sqlite3';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));

// ---------- Stripe webhook (raw) ----------
const stripe = new Stripe(process.env.STRIPE_SECRET || '');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const ref = event.data.object.client_reference_id;
      run('UPDATE users SET subscribed=1 WHERE id=?', [ref]).catch(console.error);
      // TODO: dacă e pachet de credite, adaugă aici creditele în funcție de price ID
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
}));

// ---------- DB ----------
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    age_verified INTEGER DEFAULT 0,
    subscribed INTEGER DEFAULT 0,
    credits INTEGER DEFAULT 0,
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
    provider TEXT DEFAULT 'Stripe',
    provider_ref TEXT,
    result_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    kind TEXT,                -- 'image' | 'short' | 'video'
    status TEXT,              -- 'queued' | 'running' | 'completed' | 'failed'
    input_json TEXT,
    output_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    body TEXT,
    category TEXT,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

// tiny helpers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}
async function currentUser(req) {
  if (!req.session.userId) return null;
  return await get('SELECT * FROM users WHERE id=?', [req.session.userId]);
}

// seed demo media
(async () => {
  for (const p of ['/demo/ai1.jpg','/demo/ai2.jpg','/demo/ai3.jpg']) {
    try { await run('INSERT OR IGNORE INTO media(path, ai_generated) VALUES(?,1)', [p]); } catch {}
  }
})();

// basic policy filter
function allowed(text = '') {
  const bad = ['deepfake','real person','celebr','undress','remove clothes','minor','under 18',' teen ','bestial','rape','nonconsens'];
  const t = (text||'').toLowerCase();
  return !bad.some(w => t.includes(w));
}

// ------------ PRICES (în credite) — ajustează cum vrei ------------
const PRICES = {
  image: { '1024': 15, 'uhd': 25 },
  short: { 3: 25, 5: 40, 8: 55 },
  video: { 15: 120 }
};

// ------------ AUTH ------------
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

app.post('/api/verify-age/mock', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  await run('UPDATE users SET age_verified=1 WHERE id=?', [u.id]);
  res.json({ ok: true });
});
app.post('/api/subscribe/mock', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  await run('UPDATE users SET subscribed=1, credits=credits+100 WHERE id=?', [u.id]); // bonus demo
  res.json({ ok: true, added_credits: 100 });
});

// ------------ STRIPE CHECKOUT (abonament) ------------
app.post('/api/checkout/create', async (req, res) => {
  const u = await currentUser(req);
  if (!u) return res.status(401).json({ error: 'Not logged in' });
  try {
    const sess = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: String(u.id),
      success_url: `${process.env.PUBLIC_BASE}/premium.html?paid=1`,
      cancel_url: `${process.env.PUBLIC_BASE}/premium.html?canceled=1`
    });
    res.json({ url: sess.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------ JOBS API ------------
function costFor(kind, opts) {
  if (kind === 'image') {
    const resKey = (String(opts.res||'1024').toLowerCase().includes('uhd')) ? 'uhd' : '1024';
    return PRICES.image[resKey] || 15;
  }
  if (kind === 'short') {
    const s = Number(opts.seconds||3);
    if (s <= 3) return PRICES.short[3];
    if (s <= 5) return PRICES.short[5];
    return PRICES.short[8];
  }
  if (kind === 'video') {
    return PRICES.video[15];
  }
  return 10;
}

app.post('/api/jobs', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  const { kind = 'image', options = {} } = req.body || {};
  const prompt = options.prompt || options.storyboard || '';
  if (!allowed(prompt)) return res.status(400).json({ error: 'Content not allowed' });

  const price = costFor(kind, options);
  const row = await get('SELECT credits FROM users WHERE id=?', [u.id]);
  if ((row?.credits||0) < price) {
    return res.status(402).json({ error: 'INSUFFICIENT_CREDITS', need: price, have: row?.credits||0 });
  }

  await run('UPDATE users SET credits = credits - ? WHERE id=?', [price, u.id]);
  const r = await run(
    `INSERT INTO jobs(user_id,kind,status,input_json) VALUES(?,?,'queued',?)`,
    [u.id, String(kind), JSON.stringify(options)]
  );
  res.json({ ok: true, job_id: r.lastID, debited: price, balance: (row.credits - price) });
});

app.get('/api/jobs/:id', async (req, res) => {
  const id = Number(req.params.id);
  const j = await get('SELECT id,user_id,kind,status,input_json,output_json,created_at FROM jobs WHERE id=?', [id]);
  if (!j) return res.status(404).json({ error: 'Not found' });
  res.json(j);
});

// ------------ DEMO GEN (vechi) ------------
app.post('/api/gen/image', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  const { prompt = '' } = req.body || {};
  if (!allowed(prompt)) return res.status(400).json({ error: 'Prompt not allowed' });
  res.json({ ok: true, url: '/demo/ai1.jpg' });
});
app.post('/api/gen/video', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  const { storyboard = '' } = req.body || {};
  if (!allowed(storyboard)) return res.status(400).json({ error: 'Storyboard not allowed' });
  res.json({ ok: true, url: '/demo/video-placeholder.mp4' });
});

// ------------ MEDIA SIGN & ERASER ------------
app.post('/api/media/sign', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  if (!u.age_verified) return res.status(403).json({ error: 'Age not verified' });
  if (!u.subscribed) return res.status(403).json({ error: 'Not subscribed' });
  const { path: mediaPath = '/demo/ai2.jpg' } = req.body || {};
  res.json({ url: mediaPath });
});

app.post('/api/erase', async (req, res) => {
  const u = await currentUser(req); if (!u) return res.status(401).json({ error: 'Not logged in' });
  const { mediaPath = '' } = req.body || {};
  const row = await get('SELECT * FROM media WHERE path=?', [mediaPath]);
  if (!row || !row.ai_generated) return res.status(400).json({ error: 'AI-only media allowed' });
  res.json({ ok: true, message: 'Eraser accepted (demo)' });
});

// ------------ FEEDBACK ------------
app.get('/api/feedback', async (req, res) => {
  const rows = await all(`SELECT id,title,body,category,votes,status,created_at FROM suggestions ORDER BY votes DESC, datetime(created_at) DESC LIMIT 200`);
  res.json(rows);
});
app.post('/api/feedback', async (req, res) => {
  const u = await currentUser(req).catch(()=>null);
  const { title = '', body = '', category = 'General' } = req.body || {};
  if (!title.trim() || !body.trim()) return res.status(400).json({ error: 'Title and body required' });
  if (!allowed(title) || !allowed(body)) return res.status(400).json({ error: 'Content not allowed' });
  const r = await run(`INSERT INTO suggestions(user_id,title,body,category) VALUES(?,?,?,?)`, [u?.id || null, title.trim(), body.trim(), String(category).slice(0,40)]);
  const row = await get(`SELECT id,title,body,category,votes,status,created_at FROM suggestions WHERE id=?`, [r.lastID]);
  req.session.voted = Array.isArray(req.session.voted) ? req.session.voted : [];
  req.session.voted.push(row.id);
  res.json(row);
});
app.post('/api/feedback/:id/vote', async (req, res) => {
  const sid = Number(req.params.id);
  req.session.voted = Array.isArray(req.session.voted) ? req.session.voted : [];
  if (req.session.voted.includes(sid)) return res.json({ ok: true, already: true });
  await run(`UPDATE suggestions SET votes = votes + 1 WHERE id=?`, [sid]);
  req.session.voted.push(sid);
  const row = await get(`SELECT id,votes FROM suggestions WHERE id=?`, [sid]);
  res.json({ ok: true, id: sid, votes: row?.votes || 0 });
});

// ------------ ADMIN ----------
app.get('/api/admin/stats', async (req, res) => {
  const users = await get('SELECT COUNT(*) c FROM users');
  const orders = await get('SELECT COUNT(*) c FROM orders');
  const jobs = await get('SELECT COUNT(*) c FROM jobs');
  const ideas = await get('SELECT COUNT(*) c FROM suggestions');
  res.json({ users: users?.c || 0, orders: orders?.c || 0, jobs: jobs?.c || 0, ideas: ideas?.c || 0 });
});

// ------------ Static ----------
app.use('/demo', express.static(path.join(__dirname, 'public', 'demo')));
app.use(express.static(path.join(__dirname, 'public')));

// ------------ WORKER (demo provider) ----------
let workerBusy = false;
async function processOne() {
  if (workerBusy) return;
  workerBusy = true;
  try {
    const job = await get(`SELECT * FROM jobs WHERE status='queued' ORDER BY id ASC LIMIT 1`);
    if (!job) return;
    await run(`UPDATE jobs SET status='running' WHERE id=?`, [job.id]);
    const input = JSON.parse(job.input_json || '{}');
    const kind = job.kind;

    // TODO: înlocuiește cu Venice/Replicate. Deocamdată simulăm:
    let url = '/demo/ai1.jpg';
    if (kind === 'short' || kind === 'video') url = '/demo/video-placeholder.mp4';

    // simulăm timp de execuție
    await new Promise(r => setTimeout(r, kind === 'image' ? 1500 : 2500));

    await run(`UPDATE jobs SET status='completed', output_json=? WHERE id=?`, [JSON.stringify({ url }), job.id]);
    if (kind === 'image') await run(`INSERT OR IGNORE INTO media(path, ai_generated) VALUES(?,1)`, [url]);
  } catch (e) {
    console.error(e);
  } finally {
    workerBusy = false;
  }
}
setInterval(processOne, 2000);

// ------------ Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The Future — PRO running on http://localhost:${PORT}`));

// server.js (ESM) — real video via Replicate
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Replicate from 'replicate';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// ---------- middlewares ----------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// sesiuni pe disc (SQLite)
const SESS_DIR = path.join(__dirname, 'db');
try { fs.mkdirSync(SESS_DIR, { recursive: true }); } catch {}
const SQLiteStore = connectSqlite3(session);

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: SESS_DIR }),
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 30*24*60*60*1000)
  }
}));

// static /public
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
}));

// ---------- helpers ----------
const TIERS = ['BASIC', 'PLUS', 'PRO'];
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN || '' });
const DREAM_VER  = process.env.DREAM_MACHINE_VERSION || 'luma/dream-machine:latest';

function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ ok:false, error:'unauthorized' });
}
function hasActiveSub(req) {
  const s = req.session?.sub;
  return !!(s && s.until > Date.now());
}
function requirePro(req, res, next) {
  if (hasActiveSub(req)) return next();
  return res.status(402).json({ ok:false, error:'subscription_required' });
}

// ---------- API: basic ----------
app.get('/api/ping', (_req, res) => res.json({ ok:true }));

app.get('/api/me', (req, res) => {
  if (req.session?.user) return res.json({ ok:true, user:req.session.user });
  return res.json({ ok:false, error:'login_required' });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body?.email || '').trim() || 'user@example.com';
  req.session.user = { id: Date.now()%100000, email };
  req.session.save(() => res.json({ ok:true, user:req.session.user }));
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok:true }));
});

// abonament mock
app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) return res.status(400).json({ ok:false, error:'invalid_tier' });
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  const until = Date.now() + days*24*60*60*1000;
  req.session.sub = { tier, until };
  req.session.save(() => res.json({ ok:true, sub:req.session.sub }));
});

app.get('/api/sub/check', (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until > Date.now());
  res.json({ ok:true, active, sub });
});

// ---------- API: video real (Replicate / Luma Dream Machine) ----------
app.post('/api/video', requireAuth, requirePro, async (req, res) => {
  const { storyboard, negativeExtra, seconds, quality } = req.body || {};

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ ok:false, error:'REPLICATE_API_TOKEN missing' });
  }
  try {
    // Luma acceptă: prompt, negative_prompt, seconds, aspect_ratio/resolution.
    const input = {
      prompt: String(storyboard || '').slice(0, 1500),
      negative_prompt: String(negativeExtra || ''),
      seconds: Math.min(Math.max(Number(seconds || 10), 2), 20),
      resolution: ['540p','720p','1080p'].includes(quality) ? quality : '540p'
    };

    const output = await replicate.run(DREAM_VER, { input });

    // Luma returnează de obicei un URL (delivery) sau obiect cu url; împachetăm generic:
    const url = typeof output === 'string' ? output
              : (output?.output ?? output?.url ?? output?.video ?? null);

    res.json({ ok:true, url, model: DREAM_VER, input });
  } catch (err) {
    console.error('replicate error:', err);
    res.status(500).json({ ok:false, error: String(err?.message || err) });
  }
});

// ---------- debug ----------
app.get('/api/debug/cookie', (req, res) => {
  res.json({ cookie: req.headers.cookie || '' });
});

// ---------- convenience ----------
app.get('/', (_req, res) => res.redirect('/gen-video.html'));

// ---------- start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

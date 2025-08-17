// server.js (ESM, production-ready)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- rezolvăm __dirname în ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --- app
const app = express();
app.set('trust proxy', 1); // necesar pe Render/HTTPS

// --- middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- asigurăm directorul pentru fișierele de sesiune
const SESS_DIR = path.join(__dirname, 'db');
try { fs.mkdirSync(SESS_DIR, { recursive: true }); } catch { /* ignore */ }

// --- sesiuni pe disc (SQLite)
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: SESS_DIR
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // pe Render e HTTPS
      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000) // 30 zile
    }
  })
);

// --- servește /public dacă ai fișiere statice (ex: /generator)
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
  })
);

// ----------------- API -----------------
const TIERS = ['BASIC', 'PLUS', 'PRO'];

app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// stare user
app.get('/api/me', (req, res) => {
  if (req.session?.user) return res.json({ ok: true, user: req.session.user });
  return res.json({ ok: false, error: 'login_required' });
});

// login mock (aliasuri incluse)
app.get(['/api/mock-login', '/api/debug/login'], (req, res) => {
  const email = (req.query.email || '').trim() || 'user@example.com';
  req.session.user = { id: Date.now() % 100000, email };
  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});

// logout (alias)
app.get(['/api/logout', '/api/debug/logout'], (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// activare „abonament” mock
app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) return res.status(400).json({ ok: false, error: 'invalid_tier' });

  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  const until = Date.now() + days * 24 * 60 * 60 * 1000;

  req.session.sub = { tier, until };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});

// verificare abonament
app.get('/api/sub/check', (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until > Date.now());
  res.json({ ok: true, active, sub });
});

// debug cookie
app.get('/api/debug/cookie', (req, res) => {
  res.json({ cookie: req.headers.cookie || '' });
});

// --------------- UI de test ---------------
// /premium — totul inline pentru a nu depinde de alte fișiere
app.get('/premium', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="ro"><meta charset="utf-8"/>
<title>Premium</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:40px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,button,a{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 16px;text-decoration:none}
  button{background:#1e293b;cursor:pointer}
  button.primary{background:#3b82f6}
  pre{background:#0f172a;border:1px solid #223047;border-radius:12px;padding:16px;overflow:auto}
</style>
<h1>Premium</h1>
<div class="row">
  <input id="email" value="itudorache53@gmail.com" style="min-width:280px"/>
  <button id="btnLogin" class="primary">Login</button>
</div>
<div class="row">
  <button data-tier="BASIC">BASIC</button>
  <button data-tier="PLUS">PLUS</button>
  <button data-tier="PRO" class="primary">PRO</button>
</div>
<div class="row">
  <button id="btnMe">Vezi /api/me</button>
  <a id="lnkCookie" href="/api/debug/cookie" target="_blank">Vezi cookie</a>
  <a id="lnkLogout" href="/api/logout">Logout</a>
</div>
<pre id="out">{ "hint": "apasă pe butoane" }</pre>
<script>
  const out = document.getElementById('out');
  const show = (x) => out.textContent = JSON.stringify(x, null, 2);

  document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const r = await fetch('/api/mock-login?email=' + encodeURIComponent(email), { credentials: 'include' });
    show(await r.json());
  };

  document.getElementById('btnMe').onclick = async () => {
    const r = await fetch('/api/me', { credentials: 'include' });
    show(await r.json());
  };

  for (const b of document.querySelectorAll('[data-tier]')) {
    b.onclick = async () => {
      const tier = b.getAttribute('data-tier');
      const r = await fetch('/api/sub/mock-activate/' + tier, { credentials: 'include' });
      show(await r.json());
    };
  }
</script>
</html>`);
});

// redirect simplu către UI-ul de test
app.get('/', (_req, res) => res.redirect('/premium'));

// --------------- start server ---------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

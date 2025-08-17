// src/server.js (ESM, production-ready pe Render)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// === Render rulează în spatele unui proxy -> necesar pt cookie.secure ===
app.set('trust proxy', 1);

// --- middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- asigură directorul pentru fișierele de sesiune (fix SQLITE_CANTOPEN)
const SESS_DIR = path.join(__dirname, 'db');
try { fs.mkdirSync(SESS_DIR, { recursive: true }); }
catch (e) { console.error('Cannot create sessions dir:', SESS_DIR, e); }

const SQLiteStore = connectSqlite3(session);

// --- configurație sesiune
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',     // fișier DB pentru sesiuni
    dir: SESS_DIR
  }),
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true, // OK pe Render (HTTPS) împreună cu trust proxy
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 zile
  }
}));

// --- statice (dacă mai pui fișiere în /public)
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
  })
);

// Helpers
const TIERS = ['BASIC', 'PLUS', 'PRO'];
const DAYS = Number(process.env.SUB_DEFAULT_DAYS || 30);

// === API ===

// stare user
app.get('/api/me', (req, res) => {
  if (req.session?.user) return res.json({ ok: true, user: req.session.user });
  return res.json({ ok: false, error: 'login_required' });
});

// login (mock) – 3 aliasuri ca să nu mai fie 404 în niciun scenariu
app.get(['/api/mock-login', '/api/debug/login', '/api/login'], (req, res) => {
  const email = (req.query.email || '').trim() || 'user@example.com';
  req.session.user = { id: Date.now() % 100000, email };
  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});

// logout
app.get(['/api/logout', '/api/debug/logout'], (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// abonament mock (activare BASIC/PLUS/PRO)
app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) return res.status(400).json({ ok: false, error: 'invalid_tier' });

  const until = Date.now() + DAYS * 24 * 60 * 60 * 1000;
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

// === DEBUG routes (pentru verificare rapidă) ===
app.get('/api/debug/ping', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get('/api/debug/routes', (_req, res) => {
  const routes = [];
  app._router.stack.forEach((m) => {
    if (m.route?.path) {
      routes.push({ methods: Object.keys(m.route.methods), path: m.route.path });
    } else if (m.name === 'router' && m.handle?.stack) {
      m.handle.stack.forEach((h) => {
        if (h.route?.path) routes.push({ methods: Object.keys(h.route.methods), path: h.route.path });
      });
    }
  });
  res.json({ ok: true, count: routes.length, routes });
});

// === UI simplu: /premium ===
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
  <button data-tier="PRO"  class="primary">PRO</button>
</div>
<div class="row">
  <button id="btnMe">Vezi /api/me</button>
  <a id="lnkCookie" href="/api/debug/cookie">Vezi cookie</a>
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

// === UI integrat: /generator (mock), ca să nu depindem de fișiere externe)
app.get('/generator', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="ro"><meta charset="utf-8"/>
<title>Generator (mock)</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:36px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,select,button{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 16px}
  button{background:#3b82f6;cursor:pointer}
  pre{background:#0f172a;border:1px solid #223047;border-radius:12px;padding:16px;overflow:auto}
  .chip{display:inline-block;background:#111827;border:1px solid #2a3343;border-radius:999px;padding:6px 10px;margin-right:6px}
</style>
<h1>Generator (mock) — Images & Video</h1>
<div class="row"><textarea id="prompt" rows="6" style="min-width:320px;flex:1">
Storyboard: fast drone flyover above a futuristic city at night with neon lights, smooth cinematic motion
</textarea></div>
<div>Negative (fixed, locked):
  <span class="chip">bad anatomy</span>
  <span class="chip">extra fingers</span>
  <span class="chip">blurry</span>
  <span class="chip">logo</span>
  <span class="chip">watermark</span>
</div>
<div class="row">
  <label>Type&nbsp;</label>
  <select id="type">
    <option>Video 10s 1080p</option>
    <option>Image 1024x1024</option>
  </select>
  <label>Quality&nbsp;</label>
  <select id="quality">
    <option>8K (PRO)</option>
    <option>4K (PLUS)</option>
    <option>HD (BASIC)</option>
  </select>
</div>
<div class="row">
  <button id="btnLogin">Login</button>
  <button id="btnBasic">BASIC</button>
  <button id="btnPlus">PLUS</button>
  <button id="btnPro">PRO</button>
</div>
<pre id="out">{ "hint": "Folosește butoanele; este doar un demo mock." }</pre>
<script>
  const out = document.getElementById('out');
  const show = (x) => out.textContent = JSON.stringify(x, null, 2);

  document.getElementById('btnLogin').onclick = async () => {
    const r = await fetch('/api/mock-login?email=' + encodeURIComponent('itudorache53@gmail.com'), { credentials:'include' });
    show(await r.json());
  };
  document.getElementById('btnBasic').onclick = async () => {
    const r = await fetch('/api/sub/mock-activate/BASIC', { credentials:'include' });
    show(await r.json());
  };
  document.getElementById('btnPlus').onclick = async () => {
    const r = await fetch('/api/sub/mock-activate/PLUS', { credentials:'include' });
    show(await r.json());
  };
  document.getElementById('btnPro').onclick = async () => {
    const r = await fetch('/api/sub/mock-activate/PRO', { credentials:'include' });
    show(await r.json());
  };
</script>
</html>`);
});

// rădăcină: trimite spre /premium ca „homepage”
app.get('/', (_req, res) => res.redirect('/premium'));

// --- pornire
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

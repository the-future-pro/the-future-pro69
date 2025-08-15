// src/server.js (ESM)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// --- middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// servește /public (generator.html, css/js etc.)
app.use(express.static(path.join(__dirname, 'public')));

// --- sesiune (SQLite store pe disc, sigur pe Render)
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: path.join(__dirname, 'db'), // va crea /db/sessions.sqlite
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: true, // Render servește https
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 zile
    }
  })
);

// Helpers
const TIERS = ['BASIC', 'PLUS', 'PRO'];

// --- API: stare user
app.get('/api/me', (req, res) => {
  res.json({
    ok: true,
    user: req.session.user || null,
    sub: req.session.sub || null,
    credits: req.session.credits || 0,
    logged: !!req.session.user
  });
});

// --- API: login (mock) – aliasuri ca să nu mai apară 404
app.get(['/api/mock-login', '/api/debug/login'], (req, res) => {
  const email = (req.query.email || '').trim() || 'user@example.com';
  req.session.user = { id: Date.now() % 100000, email };
  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});

// --- API: logout
app.get(['/api/logout', '/api/debug/logout'], (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// --- API: „abonament” mock (activare pentru BASIC/PLUS/PRO)
app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) {
    return res.status(400).json({ ok: false, error: 'invalid_tier' });
  }
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  req.session.sub = { tier, until };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});

// --- API: verificare abonament
app.get('/api/sub/check', (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until > Date.now());
  res.json({ ok: true, active, sub });
});

// --- API: credite mock
app.get('/api/credits/mock-add/:n', (req, res) => {
  const n = Number(req.params.n || 0) || 0;
  req.session.credits = Math.max(0, (req.session.credits || 0) + n);
  req.session.save(() => res.json({ ok: true, credits: req.session.credits }));
});
app.get('/api/credits/balance', (req, res) => {
  res.json({ ok: true, credits: req.session.credits || 0 });
});

// --- API: GENERATE (mock) — răspunde mereu cu JSON ca să vezi ceva în UI
app.post('/api/gen/mock', (req, res) => {
  const { prompt = '', type = 'Image', quality = '4K' } = req.body || {};

  if (!req.session?.user) return res.status(401).json({ ok: false, error: 'login_required' });
  const sub = req.session?.sub;
  if (!sub || !TIERS.includes(sub.tier)) {
    return res.status(402).json({ ok: false, error: 'subscription_required' });
  }

  // doar ca exemplu de reguli mock
  if (String(quality).includes('8K') && sub.tier !== 'PRO') {
    return res.status(403).json({ ok: false, error: 'quality_not_allowed_for_tier' });
  }
  if (typeof prompt === 'string' && /real person|celebrity|minor/i.test(prompt)) {
    return res.status(400).json({ ok: false, error: 'prompt_blocked' });
  }
  if ((req.session.credits || 0) <= 0) {
    return res.status(402).json({ ok: false, error: 'not_enough_credits' });
  }

  // consumă 1 credit mock
  req.session.credits = (req.session.credits || 0) - 1;

  const isVideo = String(type).toLowerCase().includes('video');
  const url = isVideo ? '/api/demo/video' : '/api/demo/img';

  req.session.save(() => {
    res.json({
      ok: true,
      kind: isVideo ? 'video' : 'image',
      prompt,
      type,
      quality,
      url,
      credits: req.session.credits
    });
  });
});

// --- Pagini demo pentru „rezultat”
app.get('/api/demo/img', (_req, res) => {
  const r = Math.floor(Math.random() * 100000);
  res.type('html').send(`
    <!doctype html><meta charset="utf-8">
    <title>Mock Image</title>
    <body style="margin:0;background:#000;display:grid;place-items:center;height:100vh">
      <img src="https://picsum.photos/seed/${r}/1280/720" style="max-width:100%;height:auto"/>
    </body>
  `);
});

app.get('/api/demo/video', (_req, res) => {
  res.type('html').send(`
    <!doctype html><meta charset="utf-8">
    <title>Mock Video</title>
    <body style="margin:0;background:#000;display:grid;place-items:center;height:100vh">
      <video controls autoplay style="width:min(100vw,1000px);height:auto">
        <source src="https://samplelib.com/lib/preview/mp4/sample-10s.mp4" type="video/mp4"/>
      </video>
    </body>
  `);
});

// --- UI simplu vechi: /premium
app.get('/premium', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="ro"><meta charset="utf-8"/>
<title>Premium</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:40px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,button,a{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 16px}
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
  function show(x){ out.textContent = JSON.stringify(x, null, 2); }
  async function call(url){ 
    try{
      const r = await fetch(url, { credentials:'include' });
      const ct = r.headers.get('content-type')||'';
      const data = ct.includes('application/json') ? await r.json() : await r.text();
      show({ http:r.status, data });
    }catch(e){ show({ ok:false, error:String(e) }) }
  }

  document.getElementById('btnLogin').onclick = () => call('/api/mock-login?email=' + encodeURIComponent(document.getElementById('email').value.trim()));
  document.getElementById('btnMe').onclick = () => call('/api/me');
  for (const b of document.querySelectorAll('[data-tier]')) b.onclick = () => call('/api/sub/mock-activate/' + b.getAttribute('data-tier'));
</script>
</html>`);
});

// --- rută pentru generator static: /generator -> public/generator.html
app.get('/generator', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'generator.html'));
});

// --- pornire
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

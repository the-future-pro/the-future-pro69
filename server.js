// server.js (ESM, production-ready) — with Replicate video
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --- app
const app = express();
app.set('trust proxy', 1); // Render/HTTPS

// --- middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// --- sessions (SQLite on disk)
const SESS_DIR = path.join(__dirname, 'db');
try { fs.mkdirSync(SESS_DIR, { recursive: true }); } catch {}
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: SESS_DIR }),
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000)
    }
  })
);

// --- static
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
  })
);

// ---------------- Helpers & Guards ----------------
const TIERS = ['BASIC', 'PLUS', 'PRO'];

function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ ok:false, error:'login_required' });
}
function requireSub(tierRequired = 'BASIC') {
  return (req, res, next) => {
    const sub = req.session?.sub;
    if (!sub || sub.until <= Date.now())
      return res.status(402).json({ ok:false, error:'subscription_required' });
    const ord = (t) => TIERS.indexOf(t);
    if (ord(sub.tier) < ord(tierRequired))
      return res.status(403).json({ ok:false, error:'tier_too_low', have: sub.tier, need: tierRequired });
    next();
  };
}

// --------------- Basic APIs ---------------
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

app.get('/api/me', (req, res) => {
  if (req.session?.user) return res.json({ ok: true, user: req.session.user });
  return res.json({ ok: false, error: 'login_required' });
});

app.get(['/api/mock-login', '/api/debug/login'], (req, res) => {
  const email = (req.query.email || '').trim() || 'user@example.com';
  req.session.user = { id: Date.now() % 100000, email };
  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});

app.get(['/api/logout', '/api/debug/logout'], (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) return res.status(400).json({ ok: false, error: 'invalid_tier' });
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  req.session.sub = { tier, until };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});

app.get('/api/sub/check', (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until > Date.now());
  res.json({ ok: true, active, sub });
});

app.get('/api/debug/cookie', (req, res) => {
  res.json({ cookie: req.headers.cookie || '' });
});

// --------------- Admin debug (opțional) ---------------
app.get('/api/admin/stats', requireAuth, requireSub('PRO'), async (_req, res) => {
  try {
    // demo stats (înlocuiește cu ce vrei)
    const users = 1;
    const subsActive = 2;
    const logins24h = 4;
    res.json({ ok:true, stats:{ users, subs_active: subsActive, logins_24h: logins24h }});
  } catch (e) {
    res.status(500).json({ ok:false, error:'server_error', detail:String(e) });
  }
});

// --------------- Replicate: VIDEO ---------------
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const REPLICATE_MODEL     = process.env.REPLICATE_MODEL || '';   // ex: "luma/dream-machine"
const REPLICATE_VERSION   = process.env.REPLICATE_VERSION || ''; // optional
const REPLICATE_POLL_MS   = Number(process.env.REPLICATE_POLL_MS || 2500);

// helper: call Replicate
async function replicateJSON(path, opts = {}) {
  const u = `https://api.replicate.com/v1/${path.replace(/^\/+/, '')}`;
  const r = await fetch(u, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = j?.error?.message || j?.message || r.statusText;
    throw new Error(`Replicate ${r.status}: ${msg}`);
  }
  return j;
}

/**
 * Start job video
 * body: { storyboard, negativeExtra, seconds, quality }
 */
app.post('/api/video/start', requireAuth, requireSub('PLUS'), async (req, res) => {
  try {
    if (!REPLICATE_API_TOKEN || !REPLICATE_MODEL)
      return res.status(500).json({ ok:false, error:'replicate_not_configured' });

    const { storyboard = '', negativeExtra = '', seconds = 10, quality = '4k' } = req.body || {};

    // Construiește payload-ul în formatul modelului ales.
    // Cele mai multe modele acceptă o cheie "prompt" / "story" + setări.
    const input = {
      prompt: storyboard,
      negative_prompt: negativeExtra,
      duration: Number(seconds) || 10,
      quality
    };

    const body = {
      model: REPLICATE_MODEL,
      input
    };
    if (REPLICATE_VERSION) body.version = REPLICATE_VERSION;

    const j = await replicateJSON('predictions', { method:'POST', body: JSON.stringify(body) });
    // j.id — prediction id
    res.json({ ok:true, id: j.id, status: j.status, urls: j.urls });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e.message || e) });
  }
});

// Status job
app.get('/api/video/status/:id', requireAuth, requireSub('PLUS'), async (req, res) => {
  try {
    const j = await replicateJSON(`predictions/${encodeURIComponent(req.params.id)}`);
    // când e gata: j.status === "succeeded" și j.output conține URL video
    res.json({ ok:true, status: j.status, output: j.output || null, error: j.error || null });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e.message || e) });
  }
});

// --------------- Premium UI de test ---------------
app.get('/premium', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="ro"><meta charset="utf-8"/>
<title>Premium</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:40px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,button,a,select{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 16px;text-decoration:none}
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

// redirect
app.get('/', (_req, res) => res.redirect('/premium'));

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

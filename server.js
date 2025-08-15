// src/server.js (ESM, hardened + Generator & Credits)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// ——— config
const APP_ORIGIN = process.env.APP_ORIGIN || 'https://the-future-pro69.onrender.com';
const SUB_DEFAULT_DAYS = Number(process.env.SUB_DEFAULT_DAYS || 30);
const TIERS = ['BASIC', 'PLUS', 'PRO'];

// ——— securitate & performanță
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan('combined'));

// ——— CORS strict
app.use(cors({
  origin: (origin, cb) => (!origin || origin === APP_ORIGIN) ? cb(null, true) : cb(new Error('CORS blocked')),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ——— sesiune (SQLite file)
const SQLiteStore = connectSqlite3(session);
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

// ——— rate limit pe API
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));

// ——— static (opțional)
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// ——— healthcheck
app.get('/api/healthz', (_req, res) => res.json({ ok: true }));

// ====== MOCK AUTH + SUB ======
app.get('/api/me', (req, res) => {
  if (req.session?.user) return res.json({ ok: true, user: req.session.user, sub: req.session.sub || null, credits: req.session.credits||0 });
  res.json({ ok: false, error: 'login_required' });
});

app.get(['/api/mock-login', '/api/debug/login'], (req, res) => {
  const email = (req.query.email || '').toString().trim() || 'user@example.com';
  req.session.user = { id: Date.now() % 100000, email };
  if (typeof req.session.credits !== 'number') req.session.credits = 350; // start demo
  req.session.save(() => res.json({ ok: true, user: req.session.user, credits: req.session.credits }));
});

app.get(['/api/logout', '/api/debug/logout'], (req, res) => {
  req.session.destroy(() => { res.clearCookie('connect.sid', { path: '/' }); res.json({ ok: true }); });
});

app.get('/api/sub/mock-activate/:tier', (req, res) => {
  const tier = String(req.params.tier || '').toUpperCase();
  if (!TIERS.includes(tier)) return res.status(400).json({ ok: false, error: 'invalid_tier' });
  const until = Date.now() + SUB_DEFAULT_DAYS * 24 * 60 * 60 * 1000;
  req.session.sub = { tier, until };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});

app.get('/api/sub/check', (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until > Date.now());
  res.json({ ok: true, active, sub });
});

// ====== CREDITE (mock) ======
app.get('/api/credits/balance', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ ok:false, error:'login_required' });
  if (typeof req.session.credits !== 'number') req.session.credits = 350;
  res.json({ ok:true, credits: req.session.credits });
});
app.get('/api/credits/mock-add/:amt', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ ok:false, error:'login_required' });
  const amt = Math.max(0, Math.min(5000, Number(req.params.amt||0)));
  req.session.credits = (req.session.credits||0) + amt;
  req.session.save(()=> res.json({ ok:true, credits:req.session.credits }));
});

// ====== SAFETY / NEGATIVE PACKS ======
const FIXED_NEG_IMAGE = [
  'lowres','blurry','out of focus','jpeg artifacts','compression artifacts',
  'text','watermark','logo','signature',
  'bad anatomy','bad proportions','deformed','disfigured','mutation','mutated',
  'bad hands','deformed hands','malformed hands',
  'extra fingers','missing fingers','fused fingers',
  'extra limbs','missing limbs','long neck',
  'cloned face','duplicate body','cross-eye','deformed face',
  'overexposed','underexposed','chromatic aberration','extreme lens distortion',
  'cropped','out of frame'
].join(', ');

const FIXED_NEG_VIDEO = [
  'lowres','blurry','noise','compression artifacts','banding',
  'flicker','temporal inconsistency','ghosting','frame blending',
  'rolling shutter','warping','stutter','jitter','double exposure',
  'bad anatomy','bad proportions','deformed hands','malformed hands',
  'extra fingers','fused fingers','extra limbs','missing limbs',
  'text','watermark','logo','signature'
].join(', ');

// Safety keywords blocante
const SAFETY_BLOCK = ['deepfake','real person','celebr','minor','under 18',' teen ','nonconsens','bestial','rape','incest'];
const isAllowed = (t='') => !SAFETY_BLOCK.some(w => String(t).toLowerCase().includes(w));
const negPack = (kind, extra='') => [kind==='video'?FIXED_NEG_VIDEO:FIXED_NEG_IMAGE, extra].filter(Boolean).join(', ');

// ====== GATING CALITATE & PREȚURI ======
const priceImage = (quality) => {
  // 1024:20 | 2048:+15 | 8k:+50
  if (quality==='8k')   return 70;
  if (quality==='2048') return 35;
  return 20;
};
const priceVideo = (seconds, quality) => {
  // 10s:90 | 20s:150 | +70 pentru 4k
  if (seconds<=10) return 90;
  return (quality==='4k') ? 220 : 150;
};
const tierAllowsImage = (tier, quality) => {
  if (quality==='8k')   return tier==='PRO';
  if (quality==='2048') return tier==='PLUS' || tier==='PRO';
  return true;
};
const tierAllowsVideo = (tier, seconds, quality) => {
  if (seconds>10 && (tier==='PLUS' || tier==='PRO')) {
    if (quality==='4k') return tier==='PRO';
    return true;
  }
  return seconds<=10; // BASIC: doar 10s 1080p
};

// ====== DEMO MEDIA ======
const DEMO_SVG = (label='DEMO') =>
  `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="640"><rect width="100%" height="100%" fill="#0b0f16"/><text x="50%" y="50%" fill="#e6e9ef" font-size="64" text-anchor="middle" font-family="Segoe UI,Roboto,Arial">`+label+`</text></svg>`;
app.get('/api/demo/img', (_req, res)=>{ res.type('image/svg+xml').send(DEMO_SVG('IMAGE • DEMO')); });
app.get('/api/demo/video', (_req, res)=>{ res.type('image/svg+xml').send(DEMO_SVG('VIDEO • DEMO')); });

// ====== GENERATOR (mock, fără cost extern) ======
app.post('/api/gen/image', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ ok:false, error:'login_required' });
  const sub = req.session.sub || null;
  const active = !!(sub && sub.until > Date.now());
  if (!active) return res.status(402).json({ ok:false, error:'subscription_required' });

  const { prompt='', quality='1024', negativeExtra='' } = req.body||{};
  if (!isAllowed(prompt)) return res.status(400).json({ ok:false, error:'prompt_blocked' });

  const tier = sub.tier;
  if (!tierAllowsImage(tier, quality)) return res.status(403).json({ ok:false, error:'quality_not_allowed_for_tier' });

  const price = priceImage(quality);
  if ((req.session.credits||0) < price) return res.status(402).json({ ok:false, error:'not_enough_credits', need:price });

  req.session.credits -= price;
  req.session.save(()=> res.json({
    ok:true,
    debited: price,
    negative: negPack('image', negativeExtra||''),
    url: '/api/demo/img'
  }));
});

app.post('/api/gen/video', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ ok:false, error:'login_required' });
  const sub = req.session.sub || null;
  const active = !!(sub && sub.until > Date.now());
  if (!active) return res.status(402).json({ ok:false, error:'subscription_required' });

  const { storyboard='', seconds=10, quality='1080p', negativeExtra='' } = req.body||{};
  if (!isAllowed(storyboard)) return res.status(400).json({ ok:false, error:'story_blocked' });

  const tier = sub.tier;
  if (!tierAllowsVideo(tier, Number(seconds), quality)) return res.status(403).json({ ok:false, error:'quality_not_allowed_for_tier' });

  const price = priceVideo(Number(seconds), quality);
  if ((req.session.credits||0) < price) return res.status(402).json({ ok:false, error:'not_enough_credits', need:price });

  req.session.credits -= price;
  req.session.save(()=> res.json({
    ok:true,
    debited: price,
    negative: negPack('video', negativeExtra||''),
    url: '/api/demo/video'
  }));
});

// ====== UI: /premium (test abonamente) — păstrat
app.get('/premium', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="ro"><meta charset="utf-8"/>
<title>Premium</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root { color-scheme: dark; }
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:40px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,button,a,select,textarea{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 16px;text-decoration:none}
  button{background:#1e293b;cursor:pointer}
  button.primary{background:#3b82f6}
  pre{background:#0f172a;border:1px solid #223047;border-radius:12px;padding:16px;overflow:auto}
</style>
<h1>Premium</h1>
<div class="row">
  <input id="email" value="itudorache53@gmail.com" style="min-width:280px"/>
  <button id="btnLogin" class="primary">Login</button>
  <a href="/api/logout">Logout</a>
</div>
<div class="row">
  <button data-tier="BASIC">BASIC</button>
  <button data-tier="PLUS">PLUS</button>
  <button data-tier="PRO"  class="primary">PRO</button>
  <a href="/api/sub/check">/api/sub/check</a>
</div>
<div class="row">
  <a href="/api/credits/balance">Credite</a>
  <a href="/api/credits/mock-add/200">+200 cr</a>
  <a href="/api/debug/cookie">Cookie</a>
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
  for (const b of document.querySelectorAll('[data-tier]')) {
    b.onclick = async () => {
      const tier = b.getAttribute('data-tier');
      const r = await fetch('/api/sub/mock-activate/' + tier, { credentials: 'include' });
      show(await r.json());
    };
  }
</script>`);
});

// ====== UI: /generator (profesional – mock)
app.get('/generator', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en"><meta charset="utf-8"/>
<title>Generator • The Future</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root { color-scheme: dark; }
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:32px;margin:0 0 16px}
  .grid{display:grid;grid-template-columns:1fr;gap:16px;max-width:820px}
  label{font-size:14px;opacity:.9}
  input,select,textarea,button{font-size:16px;border-radius:12px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:12px 14px}
  textarea{min-height:110px}
  button{background:#1e293b;cursor:pointer}
  button.primary{background:#3b82f6}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .muted{opacity:.8}
  .pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #2a3343;background:#0f172a;margin-right:6px}
  img,iframe{max-width:100%;border-radius:12px;border:1px solid #223047;background:#0f172a}
</style>
<h1>Generator (mock) — Images & Video</h1>
<div class="grid">
  <div>
    <label>Prompt</label>
    <textarea id="prompt" placeholder="Describe the scene (no real persons, no minors, no non-consent)"></textarea>
  </div>
  <div>
    <label>Negative (fixed, locked):</label><div class="muted"><span class="pill">bad anatomy</span><span class="pill">extra fingers</span><span class="pill">blurry</span><span class="pill">logo</span><span class="pill">watermark</span> …</div>
    <label>Extra negative (optional)</label>
    <input id="neg" placeholder="e.g. harsh shadows, extreme fisheye"/>
  </div>
  <div class="row">
    <div><label>Type</label><select id="type"><option value="image">Image</option><option value="video10">Video 10s 1080p</option><option value="video20">Video 20s 1080p</option><option value="video20_4k">Video 20s 4K</option></select></div>
    <div><label>Quality</label><select id="qimg"><option value="1024">1024</option><option value="2048">2048 (PLUS+)</option><option value="8k">8K (PRO)</option></select></div>
  </div>
  <div class="row">
    <button id="btnLogin">Login</button>
    <button id="btnBasic">BASIC</button>
    <button id="btnPlus">PLUS</button>
    <button id="btnPro" class="primary">PRO</button>
    <button id="btnCredits">+200 cr</button>
  </div>
  <div class="row">
    <button id="btnRun" class="primary">Generate</button>
    <span id="bill" class="muted"></span>
  </div>
  <div id="result"></div>
</div>
<script>
  async function me(){ const r=await fetch('/api/me',{credentials:'include'}); return r.json(); }
  async function quote(){
    const t=document.getElementById('type').value;
    const q=document.getElementById('qimg').value;
    let price=0;
    if(t==='image') price = (q==='8k'?70:(q==='2048'?35:20));
    else if(t==='video10') price=90;
    else if(t==='video20') price=150;
    else if(t==='video20_4k') price=220;
    document.getElementById('bill').textContent='Estimated: '+price+' credits';
  }
  quote();
  document.getElementById('type').onchange=quote;
  document.getElementById('qimg').onchange=quote;

  document.getElementById('btnLogin').onclick=async()=>{
    const r=await fetch('/api/mock-login?email=itudorache53%40gmail.com',{credentials:'include'}); alert('Logged');
  };
  document.getElementById('btnBasic').onclick=async()=>{await fetch('/api/sub/mock-activate/BASIC',{credentials:'include'}); alert('BASIC');};
  document.getElementById('btnPlus').onclick=async()=>{await fetch('/api/sub/mock-activate/PLUS',{credentials:'include'}); alert('PLUS');};
  document.getElementById('btnPro').onclick=async()=>{await fetch('/api/sub/mock-activate/PRO',{credentials:'include'}); alert('PRO');};
  document.getElementById('btnCredits').onclick=async()=>{await fetch('/api/credits/mock-add/200',{credentials:'include'}); alert('+200 credits');};

  document.getElementById('btnRun').onclick=async()=>{
    const type=document.getElementById('type').value;
    const prompt=document.getElementById('prompt').value.trim();
    const neg=document.getElementById('neg').value.trim();
    const q=document.getElementById('qimg').value;
    const body = type==='image'
      ? { prompt, quality:q, negativeExtra:neg }
      : (type==='video10'
            ? { storyboard:prompt, seconds:10, quality:'1080p', negativeExtra:neg }
            : (type==='video20_4k'
                ? { storyboard:prompt, seconds:20, quality:'4k', negativeExtra:neg }
                : { storyboard:prompt, seconds:20, quality:'1080p', negativeExtra:neg }));
    const url = type==='image'?'/api/gen/image':'/api/gen/video';
    const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)});
    const j = await r.json();
    if(!j.ok){ alert('Error: '+(j.error||'unknown')); return; }
    document.getElementById('result').innerHTML = (type==='image')
      ? '<img src="'+j.url+'" alt="result"/>'
      : '<iframe src="'+j.url+'" style="width:100%;aspect-ratio:16/9;"></iframe>';
  };
</script>`);
});

// ——— 404 & 500
app.use((req, res) => res.status(404).json({ ok: false, error: 'not_found' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ ok: false, error: 'server_error' }); });

// ——— start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ready on :' + PORT));

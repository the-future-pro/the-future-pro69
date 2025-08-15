// The Future — PRO (full server, ready-to-paste)
// Features: tiers BASIC/PLUS/PRO, quality gating, fixed negative packs,
// chat offer + unlock, image/video generation jobs (demo worker),
// preview blur, credits charging, personas CRUD basic.

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import SQLiteStoreFactory from 'connect-sqlite3';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // necesar pe Render pentru secure cookies
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '6mb' }));
app.use(cookieParser());

const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,                       // Render servește HTTPS => secure cookie
    maxAge: 1000*60*60*24*30            // 30 zile
  }
}));

// ---------------- DB ----------------
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    age_verified INTEGER DEFAULT 0,
    credits INTEGER DEFAULT 100,
    sub_expires_at INTEGER DEFAULT 0,
    sub_tier TEXT DEFAULT 'BASIC',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS personas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    name TEXT,
    type TEXT,
    role TEXT,
    category TEXT,
    appearance_json TEXT,
    tone TEXT,
    tags_json TEXT,
    media_prices_json TEXT,
    opener_templates_json TEXT,
    preset INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chat_messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER,
    user_id INTEGER,
    sender_type TEXT, -- user|persona|system
    kind TEXT,        -- text|media_locked|media_unlocked
    text TEXT,
    media_id INTEGER,
    created_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER,
    type TEXT, -- image|video
    preview_url TEXT,
    full_url TEXT,
    price_credits INTEGER DEFAULT 0,
    duration_sec INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ready',
    meta_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media_access(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    media_id INTEGER,
    unlocked_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,                 -- credits|sub|image|video
    amount_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'CR',
    meta_json TEXT,
    status TEXT DEFAULT 'created',
    provider TEXT DEFAULT 'internal',
    provider_ref TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    kind TEXT, -- image|short|video
    status TEXT, -- queued|running|completed|failed
    input_json TEXT,
    output_json TEXT,
    created_at INTEGER
  )`);

  // safe migrations (ignoră erorile dacă există deja)
  db.run(`ALTER TABLE media ADD COLUMN duration_sec INTEGER DEFAULT 0`, ()=>{});
  db.run(`ALTER TABLE media ADD COLUMN meta_json TEXT`, ()=>{});
  db.run(`ALTER TABLE users ADD COLUMN sub_tier TEXT DEFAULT 'BASIC'`, ()=>{});
});

// --------------- Helpers ---------------
const nowSec = ()=> Math.floor(Date.now()/1000);
const ENFORCE_SUB_REQUIRED = String(process.env.ENFORCE_SUB_REQUIRED||'').toLowerCase()==='true';
const SUB_DEFAULT_DAYS = Number(process.env.SUB_DEFAULT_DAYS||30);
function run(sql, p=[]){ return new Promise((ok,ko)=>db.run(sql,p,function(e){e?ko(e):ok(this)})); }
function get(sql, p=[]){ return new Promise((ok,ko)=>db.get(sql,p,(e,r)=>e?ko(e):ok(r))); }
function all(sql, p=[]){ return new Promise((ok,ko)=>db.all(sql,p,(e,r)=>e?ko(e):ok(r))); }
const hasActiveSub = (u)=> Number(u?.sub_expires_at||0) > nowSec();
const userTier = (u)=> String(u?.sub_tier||'BASIC').toUpperCase();

function slugify(s){ return String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

// Safety allowlist (server-side)
function allowed(text=''){
  const bad = ['deepfake','real person','celebr','undress','remove clothes',
               'minor','under 18',' teen ','bestial','rape','nonconsens'];
  const t = String(text||'').toLowerCase();
  return !bad.some(w => t.includes(w));
}

// Fixed negative packs (LOCKED)
const FIXED_NEG_IMAGE = [
  'lowres','blurry','out of focus','jpeg artifacts','compression artifacts',
  'text','watermark','logo','signature',
  'bad anatomy','bad proportions','deformed','disfigured','mutation','mutated',
  'bad hands','deformed hands','malformed hands','poorly drawn hands',
  'extra fingers','missing fingers','fused fingers',
  'extra limbs','missing limbs','malformed limbs','long neck',
  'cloned face','duplicate body','cross-eye','lazy eye','deformed face',
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

const FIXED_NEG_SAFETY = [
  'real person','deepfake','celebrity','underage','minor','teen','young-looking',
  'nonconsensual','sexual violence','incest','bestiality'
].join(', ');

function mergeNeg(kind, userExtra=''){
  const base = kind==='video' ? FIXED_NEG_VIDEO : FIXED_NEG_IMAGE;
  const safety = FIXED_NEG_SAFETY;
  const extra = String(userExtra||'').trim();
  return [base, safety, extra].filter(Boolean).join(', ');
}

// Quality gating + price calculation (tiers)
function qualityAllowed(u, kind, opt){
  const tier = userTier(u);
  if(kind==='image'){
    if(opt.quality==='8k')   return tier==='PRO';
    if(opt.quality==='2048') return tier==='PLUS' || tier==='PRO';
    return true; // 1024 pentru toți
  }
  if(kind==='video'){
    if(opt.quality==='4k')        return tier==='PRO' && Number(opt.seconds)===20;
    if(Number(opt.seconds)===20)  return tier==='PLUS' || tier==='PRO';
    return true; // 10s 1080p pentru toți
  }
  return true;
}
function computePriceBase(kind, opt, base){
  if(kind==='image'){
    const q = opt.quality || '1024';
    const b = Number(base.image || 20);
    if(q==='1024') return b;
    if(q==='2048') return b + 15;  // +15 cr UHD
    if(q==='8k')   return b + 50;  // +50 cr 8K (tiled upscale)
  }
  if(kind==='video'){
    const sec = Number(opt.seconds||10);
    const q = opt.quality || '1080p';
    if(sec<=10) return Number(base.video10 || 90);
    if(q==='4k') return Number(base.video20 || 150) + 70; // +70 cr 4K
    return Number(base.video20 || 150);
  }
  return 20;
}

// Credits charge
async function chargeCredits(userId, amount, reason='unlock', meta={}){
  const row = await get(`SELECT credits FROM users WHERE id=?`,[userId]);
  const bal = Number(row?.credits||0);
  if(bal < amount) throw new Error('not_enough_credits');
  await run(`UPDATE users SET credits=credits-? WHERE id=?`,[amount, userId]);
  await run(`INSERT INTO orders(user_id,type,amount_cents,currency,meta_json,status,provider)
             VALUES(?,?,?,?,?,?,?)`,
            [userId,'credits',0,'CR',JSON.stringify({reason,amount,meta}),'captured','internal']);
}

// --------------- Auth ---------------
app.post('/api/login', async (req,res)=>{
  try{
    const { email } = req.body||{};
    if(!email) return res.status(400).json({ error:'Email required' });

    let u = await get(`SELECT * FROM users WHERE email=?`,[email]);
    if(!u){
      const r = await run(`INSERT INTO users(email) VALUES(?)`,[email]);
      u = await get(`SELECT * FROM users WHERE id=?`,[r.lastID]);
    }

    // regenerează sesiunea ca să forțăm setarea cookie-ului pe Render
    req.session.regenerate(err=>{
      if(err) return res.status(500).json({ ok:false, error:'session_regenerate_failed' });
      req.session.user_id = u.id;
      req.session.save(err2=>{
        if(err2) return res.status(500).json({ ok:false, error:'session_save_failed' });
        res.json({ ok:true, user:{ id:u.id, email:u.email }});
      });
    });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
});

app.use(async (req,res,next)=>{
  if(!req.session?.user_id) return next();
  const u = await get(`SELECT id,email,credits,sub_expires_at,sub_tier FROM users WHERE id=?`,
                      [req.session.user_id]).catch(()=>null);
  if(u) req.user = u;
  next();
});

const requireLogin = (req,res,next)=> !req.user ? res.status(401).json({ok:false,error:'login_required'}) : next();
const requireSub   = (req,res,next)=>{
  if(!ENFORCE_SUB_REQUIRED) return next();
  if(!req.user) return res.status(401).json({ok:false,error:'login_required'});
  if(!hasActiveSub(req.user)) return res.status(402).json({ok:false,error:'subscription_required'});
  next();
};

app.get('/api/me',(req,res)=>{
  if(!req.user) return res.json({ ok:true, logged:false });
  res.json({
    ok:true, logged:true,
    email:req.user.email,
    credits:Number(req.user.credits||0),
    subActive:hasActiveSub(req.user),
    sub_expires_at:Number(req.user.sub_expires_at||0),
    subTier:userTier(req.user)
  });
});

// ===== Debug & test helpers (GET) =====

// Login rapid din link (setează cookie)
app.get('/api/login/easy', async (req, res) => {
  try {
    const email = String(req.query.email || 'demo@demo.ro').trim().toLowerCase();
    if (!email) return res.status(400).json({ ok:false, error:'email_required' });

    let u = await get(`SELECT * FROM users WHERE email=?`, [email]);
    if (!u) {
      const r = await run(`INSERT INTO users(email) VALUES(?)`, [email]);
      u = await get(`SELECT * FROM users WHERE id=?`, [r.lastID]);
    }

    req.session.regenerate(err => {
      if (err) return res.status(500).json({ ok:false, error:'session_regenerate_failed' });
      req.session.user_id = u.id;
      req.session.save(err2 => {
        if (err2) return res.status(500).json({ ok:false, error:'session_save_failed' });
        res.json({ ok:true, user:{ id:u.id, email:u.email } });
      });
    });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
});

// Activează abonamentul din link (mock) — GET alias
app.get('/api/sub/mock-activate/:tier?', requireLogin, async (req, res) => {
  const until = nowSec() + SUB_DEFAULT_DAYS * 86400;
  const tier  = String(req.params.tier || 'PRO').toUpperCase(); // BASIC|PLUS|PRO
  await run(`UPDATE users SET sub_expires_at=?, sub_tier=? WHERE id=?`, [until, tier, req.user.id]);
  res.json({ ok:true, subActive:true, until, subTier:tier });
});

// Vezi ce cookie primește serverul
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies || {},
    session_id: req.sessionID || null,
    user_id: req.session?.user_id || null,
    secure: req.secure,
  });
});

// --------------- Personas ---------------
const allowedTypes = ['female','male','anime'];
const allowedRoles = [
  'Asistentă medicală','Profesoară','Secretară','Asistentă birou',
  'Girlfriend','Goth','MILF','Boyfriend','CEO/Boss','Personal Trainer',
  'Catgirl','Elf Queen'
];

app.get('/api/personas', async (req,res)=>{
  const rows = await all(`SELECT id,slug,name,type,role,category,
                                 appearance_json AS appearance,
                                 tone,tags_json AS tags,media_prices_json AS mediaPrices,preset
                          FROM personas
                          ORDER BY preset DESC, type, role, name`);
  res.json({ ok:true, items: rows.map(r=>({
    ...r,
    appearance: r.appearance? JSON.parse(r.appearance):{},
    tags: r.tags? JSON.parse(r.tags):[],
    mediaPrices: r.mediaPrices? JSON.parse(r.mediaPrices):{}
  }))});
});

app.get('/api/personas/:slug', async (req,res)=>{
  const p = await get(`SELECT id,slug,name,type,role,category,
                              appearance_json AS appearance,
                              tone,tags_json AS tags,media_prices_json AS mediaPrices
                       FROM personas WHERE slug=?`,[req.params.slug]);
  if(!p) return res.status(404).json({ok:false,error:'persona_not_found'});
  p.appearance   = p.appearance? JSON.parse(p.appearance):{};
  p.tags         = p.tags? JSON.parse(p.tags):[];
  p.mediaPrices  = p.mediaPrices? JSON.parse(p.mediaPrices):{};
  res.json({ ok:true, persona:p });
});

app.post('/api/personas', requireLogin, requireSub, async (req,res)=>{
  const { name, type, role, category, appearance, tone, tags, mediaPrices, openerTemplates } = req.body||{};
  if(!name||!type||!role) return res.status(400).json({ok:false,error:'name,type,role required'});
  if(!allowedTypes.includes(type)) return res.status(400).json({ok:false,error:'invalid type'});
  if(!allowedRoles.includes(role)) return res.status(400).json({ok:false,error:'invalid role'});

  const rawMP = mediaPrices || {};
  const normMP = {
    image:  Number(rawMP.image  ?? 20),
    video10:Number(rawMP.video10?? 90),
    video20:Number(rawMP.video20?? 150)
  };

  const slug = slugify(`${name}-${role}`);
  try{
    await run(`INSERT INTO personas(slug,name,type,role,category,appearance_json,tone,tags_json,media_prices_json,opener_templates_json,preset)
               VALUES(?,?,?,?,?,?,?,?,?,?,0)`,
              [slug,name,type,role,category||'Roleplay',
               JSON.stringify(appearance||{}), tone||'',
               JSON.stringify(tags||[]), JSON.stringify(normMP),
               JSON.stringify(openerTemplates||[]), 0]);
    res.json({ ok:true, slug });
  }catch(e){
    if(String(e.message||'').includes('UNIQUE')) return res.status(409).json({ok:false,error:'slug_exists'});
    res.status(500).json({ok:false,error:e.message});
  }
});

// --------------- Chat ---------------
app.get('/api/chat/:slug/history', requireLogin, requireSub, async (req,res)=>{
  const p = await get(`SELECT id FROM personas WHERE slug=?`,[req.params.slug]);
  if(!p) return res.status(404).json({ok:false,error:'persona_not_found'});
  const after = Number(req.query.after||0);
  const rows = await all(`SELECT id, sender_type, kind, text, media_id, created_at
                          FROM chat_messages
                          WHERE persona_id=? AND user_id=? AND id>? ORDER BY id ASC LIMIT 50`,
                          [p.id, req.user.id, after]);
  const out = [];
  for(const m of rows){
    if(m.media_id){
      const med = await get(`SELECT id,type,preview_url,full_url,price_credits,duration_sec,meta_json FROM media WHERE id=?`,[m.media_id]).catch(()=>null);
      out.push({ ...m, media: med || null });
    } else out.push(m);
  }
  res.json({ ok:true, items: out });
});

app.post('/api/chat/:slug/send', requireLogin, requireSub, async (req,res)=>{
  const { text } = req.body||{};
  if(!text || text.length>500) return res.status(400).json({ok:false,error:'message_invalid'});
  if(!allowed(text)) return res.status(400).json({ok:false,error:'content_not_allowed'});
  const p = await get(`SELECT id,role FROM personas WHERE slug=?`,[req.params.slug]);
  if(!p) return res.status(404).json({ok:false,error:'persona_not_found'});

  const ts = nowSec();
  await run(`INSERT INTO chat_messages(persona_id,user_id,sender_type,kind,text,created_at)
             VALUES(?,?,?,?,?,?)`, [p.id, req.user.id, 'user','text', text, ts]);

  const upsellMap = {
    'Profesoară':        'Ți-am pregătit o „lecție” privată — vrei un preview blurat? 😈',
    'Asistentă medicală':'Un control complet… îți trimit un teaser? 🩺',
    'Secretară':         'Am un fișier „confidențial”. Îți trimit un preview blurat? 📂'
  };
  const auto = upsellMap[p.role] || 'Ți-am pregătit un teaser blurat. Îl vrei?';
  await run(`INSERT INTO chat_messages(persona_id,user_id,sender_type,kind,text,created_at)
             VALUES(?,?,?,?,?,?)`, [p.id, req.user.id, 'persona','text', auto, ts+1]);
  res.json({ ok:true });
});

// Offer preview (image/video) cu quality + negative + pricing
app.post('/api/chat/:slug/offer', requireLogin, requireSub, async (req,res)=>{
  const { kind='image', duration=0, quality, price, negative='' } = req.body||{};
  const p = await get(`SELECT id, media_prices_json FROM personas WHERE slug=?`,[req.params.slug]);
  if(!p) return res.status(404).json({ok:false,error:'persona_not_found'});

  const opt = {
    seconds: Number(duration)|| (kind==='video'?10:0),
    quality: (kind==='image' ? (quality||'1024') : (quality||'1080p'))
  };
  if(!qualityAllowed(req.user, kind, opt)){
    return res.status(403).json({ ok:false, error:'quality_not_allowed_for_tier' });
  }

  const prices = JSON.parse(p.media_prices_json||'{}');
  const finalPrice = Number(price ?? computePriceBase(kind, opt, prices));

  // DEMO assets (înlocuiești cu URL-uri reale când legi generatorul)
  const preview = kind==='image' ? '/demo/ai2.jpg' : '/demo/video-placeholder.mp4';
  const full    = kind==='image' ? '/demo/ai1.jpg' : '/demo/video-placeholder.mp4';

  const meta = { negative: mergeNeg(kind, negative), quality: opt.quality };
  const d = (kind==='video') ? opt.seconds : 0;

  const med = await run(
    `INSERT INTO media(persona_id,type,preview_url,full_url,price_credits,duration_sec,status,meta_json)
     VALUES(?,?,?,?,?,?,?,?)`,
    [p.id, kind, preview, full, finalPrice, d, 'ready', JSON.stringify(meta)]
  );

  const ts = nowSec();
  await run(`INSERT INTO chat_messages(persona_id,user_id,sender_type,kind,media_id,created_at)
             VALUES(?,?,?,?,?,?)`, [p.id, req.user.id, 'persona','media_locked', med.lastID, ts]);

  res.json({ ok:true, media_id: med.lastID, price: finalPrice });
});

app.post('/api/media/:id/unlock', requireLogin, requireSub, async (req,res)=>{
  const m = await get(`SELECT * FROM media WHERE id=?`,[Number(req.params.id)]);
  if(!m) return res.status(404).json({ok:false,error:'media_not_found'});
  try{
    await chargeCredits(req.user.id, Number(m.price_credits||0), 'unlock', { media_id:m.id });
  }catch(e){
    if(String(e.message).includes('not_enough_credits')) return res.status(402).json({ok:false,error:'not_enough_credits'});
    return res.status(500).json({ok:false,error:e.message});
  }
  const ts = nowSec();
  await run(`INSERT INTO chat_messages(persona_id,user_id,sender_type,kind,media_id,created_at)
             VALUES(?,?,?,?,?,?)`, [m.persona_id, req.user.id, 'system','media_unlocked', m.id, ts]);
  await run(`INSERT INTO media_access(user_id,media_id,unlocked_at) VALUES(?,?,?)`,[req.user.id, m.id, ts]);
  res.json({ ok:true, url: m.full_url });
});

// --------------- Jobs (generator general: image/video) ---------------
app.post('/api/jobs', requireLogin, requireSub, async (req,res)=>{
  const { kind, options } = req.body||{};
  if(!kind) return res.status(400).json({ok:false,error:'kind_required'});
  if(kind!=='image' && kind!=='short' && kind!=='video')
    return res.status(400).json({ok:false,error:'invalid_kind'});

  const opt = options||{};
  if(kind==='image'){
    const quality = opt.quality || '1024';
    if(!qualityAllowed(req.user, 'image', {quality}))
      return res.status(403).json({ok:false,error:'quality_not_allowed_for_tier'});
    const base = { image:20, video10:90, video20:150 };
    const price = computePriceBase('image', {quality}, base);
    try{ await chargeCredits(req.user.id, price, 'image_job', {quality}); }
    catch(e){ return res.status(402).json({ok:false,error:'INSUFFICIENT_CREDITS'}); }
    const input = { kind, prompt: opt.prompt||'', negative: mergeNeg('image', opt.negative||''), quality };
    const r = await run(`INSERT INTO jobs(user_id,kind,status,input_json,created_at)
                         VALUES(?,?,?,?,?)`,
                        [req.user.id,'image','queued',JSON.stringify(input), nowSec()]);
    return res.json({ ok:true, job_id: r.lastID, debited: price });
  }

  // short/video (10s/20s)
  const seconds = Number(opt.seconds|| (kind==='short'?10:20));
  const quality = opt.quality || '1080p';
  if(!qualityAllowed(req.user, 'video', {seconds, quality}))
    return res.status(403).json({ok:false,error:'quality_not_allowed_for_tier'});

  const base = { image:20, video10:90, video20:150 };
  const price = computePriceBase('video', {seconds, quality}, base);
  try{ await chargeCredits(req.user.id, price, 'video_job', {seconds,quality}); }
  catch(e){ return res.status(402).json({ok:false,error:'INSUFFICIENT_CREDITS'}); }

  const input = { kind:(seconds<=10?'short':'video'),
                  storyboard: opt.storyboard||'',
                  negative: mergeNeg('video', opt.negative||''),
                  seconds, quality };
  const r = await run(`INSERT INTO jobs(user_id,kind,status,input_json,created_at)
                       VALUES(?,?,?,?,?)`,
                      [req.user.id,(seconds<=10?'short':'video'),'queued',JSON.stringify(input), nowSec()]);
  return res.json({ ok:true, job_id: r.lastID, debited: price });
});

app.get('/api/jobs/:id', requireLogin, async (req,res)=>{
  const j = await get(`SELECT id, kind, status, input_json, output_json
                       FROM jobs WHERE id=? AND user_id=?`,
                      [Number(req.params.id), req.user.id]);
  if(!j) return res.status(404).json({ok:false,error:'job_not_found'});
  res.json(j);
});

// --------------- Demo worker (mock) ---------------
let busy=false;
setInterval(async ()=>{
  if(busy) return; busy=true;
  try{
    const j = await get(`SELECT * FROM jobs WHERE status='queued' ORDER BY id ASC LIMIT 1`);
    if(!j){ busy=false; return; }
    await run(`UPDATE jobs SET status='running' WHERE id=?`,[j.id]);
    await new Promise(r=>setTimeout(r, j.kind==='image'?1500:2500));
    const url = (j.kind==='image')? '/demo/ai1.jpg' : '/demo/video-placeholder.mp4';
    await run(`UPDATE jobs SET status='completed', output_json=? WHERE id=?`,
              [JSON.stringify({url}), j.id]);
  }catch(e){ console.error(e); }
  finally{ busy=false; }
}, 1200);

// --------------- Admin / Stats ---------------
app.get('/api/admin/stats', async (req,res)=>{
  const users     = await get('SELECT COUNT(*) c FROM users');
  const orders    = await get('SELECT COUNT(*) c FROM orders');
  const jobs      = await get('SELECT COUNT(*) c FROM jobs');
  const personas  = await get('SELECT COUNT(*) c FROM personas');
  const msgs      = await get('SELECT COUNT(*) c FROM chat_messages');
  res.json({
    users:users?.c||0,
    orders:orders?.c||0,
    jobs:jobs?.c||0,
    personas:personas?.c||0,
    chat_messages:msgs?.c||0
  });
});

// --------------- Static ---------------
app.use('/demo', express.static(path.join(__dirname,'public','demo')));
app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`The Future — PRO running on http://localhost:${PORT}`));
// ---- helpers pentru login/diagnostic pe mobil ----

// login prin link + redirect (setează cookie-ul apoi te duce în /premium)
app.get('/api/login/link', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim();
    if (!email) return res.status(400).send('email required');
    let u = await get(`SELECT * FROM users WHERE email=?`, [email]);
    if (!u) {
      const r = await run(`INSERT INTO users(email) VALUES(?)`, [email]);
      u = await get(`SELECT * FROM users WHERE id=?`, [r.lastID]);
    }
    req.session.regenerate(err => {
      if (err) return res.status(500).send('session_regenerate_failed');
      req.session.user_id = u.id;
      req.session.save(err2 => {
        if (err2) return res.status(500).send('session_save_failed');
        // redirect în pagină normală ca să fie clar că s-a setat cookie-ul
        res.redirect('/premium');
      });
    });
  } catch (e) {
    res.status(500).send(String(e.message || e));
  }
});

// end-point de debug: verifică ce vede serverul despre sesiune/cookie
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    ok: true,
    sid: req.sessionID || null,
    hasSession: !!req.session,
    user_id: req.session?.user_id || null,
    cookies: req.cookies || {}
  });
});

// seed rapid: adaugă o persoană demo dacă nu există
app.get('/api/personas/mock-add', async (req, res) => {
  const exists = await get(`SELECT id FROM personas WHERE slug=?`, ['luna-asistenta-medicala']).catch(()=>null);
  if (!exists) {
    const appearance = { hair: 'brunetă', eyes: 'café', style: 'scrubs', vibe: 'sweet but teasing' };
    const tags = ['Nurse','Roleplay','Teasing'];
    const prices = { image: 20, video10: 90, video20: 150 };
    const openers = ['Hei, ai programare? Pot să-ți fac un control rapid… 😇'];
    await run(
      `INSERT INTO personas(slug,name,type,role,category,appearance_json,tone,tags_json,media_prices_json,opener_templates_json,preset)
       VALUES(?,?,?,?,?,?,?,?,?,?,1)`,
      ['luna-asistenta-medicala','Luna','female','Asistentă medicală','Roleplay',
       JSON.stringify(appearance),'playful, teasing',
       JSON.stringify(tags), JSON.stringify(prices), JSON.stringify(openers), 1]
    );
  }
  res.json({ ok:true, slug:'luna-asistenta-medicala' });
});

// activare sub prin GET (shortcut)
app.get('/api/sub/mock-activate/:tier', async (req,res)=>{
  if(!req.session?.user_id) return res.status(401).json({ok:false,error:'login_required'});
  const until = Math.floor(Date.now()/1000) + (Number(process.env.SUB_DEFAULT_DAYS||30)*86400);
  const tier = String(req.params.tier||'PRO').toUpperCase();
  await run(`UPDATE users SET sub_expires_at=?, sub_tier=? WHERE id=?`, [until, tier, req.session.user_id]);
  res.json({ ok:true, subActive:true, until, subTier:tier });
});

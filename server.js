// The Future — PRO (server complet, robust pe Render)

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import connectSqlite3 from 'connect-sqlite3'; // <- import corect (default), nu named

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '6mb' }));
app.use(cookieParser());

// ---- storage sigur pe Render (creează /data) ----
const DATA_DIR = path.join(process.cwd(), 'data');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

// ---- sesiune + sqlite store ----
const SQLiteStore = connectSqlite3(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: DATA_DIR,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,                 // Render = HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 zile
  }
}));

// ---- DB principală (sqlite) ----
const db = new sqlite3.Database(path.join(DATA_DIR, 'db.sqlite'));
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
    sender_type TEXT,
    kind TEXT,
    text TEXT,
    media_id INTEGER,
    created_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persona_id INTEGER,
    type TEXT,
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
    type TEXT,
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
    kind TEXT,
    status TEXT,
    input_json TEXT,
    output_json TEXT,
    created_at INTEGER
  )`);

  // migrații „în siguranță”
  db.run(`ALTER TABLE media  ADD COLUMN duration_sec INTEGER DEFAULT 0`, ()=>{});
  db.run(`ALTER TABLE media  ADD COLUMN meta_json TEXT`, ()=>{});
  db.run(`ALTER TABLE users  ADD COLUMN sub_tier TEXT DEFAULT 'BASIC'`, ()=>{});
});

// ---- helpers + config ----
const nowSec = ()=> Math.floor(Date.now()/1000);
function run(sql,p=[]){ return new Promise((ok,ko)=>db.run(sql,p,function(e){e?ko(e):ok(this)})); }
function get(sql,p=[]){ return new Promise((ok,ko)=>db.get(sql,p,(e,r)=>e?ko(e):ok(r))); }
function all(sql,p=[]){ return new Promise((ok,ko)=>db.all(sql,p,(e,r)=>e?ko(e):ok(r))); }
const hasActiveSub = (u)=> Number(u?.sub_expires_at||0) > nowSec();
const userTier = (u)=> String(u?.sub_tier||'BASIC').toUpperCase();
const slugify = (s)=> String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const ENFORCE_SUB_REQUIRED = String(process.env.ENFORCE_SUB_REQUIRED||'').toLowerCase()==='true';
const SUB_DEFAULT_DAYS      = Number(process.env.SUB_DEFAULT_DAYS||30);

// ---- safety + negative packs ----
function allowed(text=''){
  const bad = ['deepfake','real person','celebr','undress','remove clothes','minor','under 18',' teen ','bestial','rape','nonconsens'];
  const t = String(text||'').toLowerCase();
  return !bad.some(w => t.includes(w));
}
const FIXED_NEG_IMAGE = [
  'lowres','blurry','out of focus','jpeg artifacts','compression artifacts',
  'text','watermark','logo','signature',
  'bad anatomy','bad proportions','deformed','disfigured','mutation','mutated',
  'bad hands','deformed hands','malformed hands',
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
const mergeNeg=(kind,extra='')=>{
  const base = kind==='video'?FIXED_NEG_VIDEO:FIXED_NEG_IMAGE;
  return [base, FIXED_NEG_SAFETY, String(extra||'').trim()].filter(Boolean).join(', ');
};

// ---- quality gating + pricing ----
function qualityAllowed(u, kind, opt){
  const tier = userTier(u);
  if(kind==='image'){
    if(opt.quality==='8k')   return tier==='PRO';
    if(opt.quality==='2048') return tier==='PLUS' || tier==='PRO';
    return true;
  }
  if(kind==='video'){
    if(opt.quality==='4k')        return tier==='PRO' && Number(opt.seconds)===20;
    if(Number(opt.seconds)===20)  return tier==='PLUS' || tier==='PRO';
    return true;
  }
  return true;
}
function computePriceBase(kind, opt, base){
  if(kind==='image'){
    const q = opt.quality || '1024';
    const b = Number(base.image || 20);
    if(q==='1024') return b;
    if(q==='2048') return b + 15;
    if(q==='8k')   return b + 50;
  }
  if(kind==='video'){
    const sec = Number(opt.seconds||10);
    const q = opt.quality || '1080p';
    if(sec<=10) return Number(base.video10 || 90);
    if(q==='4k') return Number(base.video20 || 150) + 70;
    return Number(base.video20 || 150);
  }
  return 20;
}
async function chargeCredits(userId, amount, reason='unlock', meta={}){
  const row = await get(`SELECT credits FROM users WHERE id=?`,[userId]);
  const bal = Number(row?.credits||0);
  if(bal < amount) throw new Error('not_enough_credits');
  await run(`UPDATE users SET credits=credits-? WHERE id=?`,[amount, userId]);
  await run(`INSERT INTO orders(user_id,type,amount_cents,currency,meta_json,status,provider)
             VALUES(?,?,?,?,?,?,?)`,
            [userId,'credits',0,'CR',JSON.stringify({reason,amount,meta}),'captured','internal']);
}

// ---- Auth ----
app.post('/api/login', async (req,res)=>{
  try{
    const { email } = req.body||{};
    if(!email) return res.status(400).json({ error:'Email required' });
    let u = await get(`SELECT * FROM users WHERE email=?`,[email]);
    if(!u){
      const r = await run(`INSERT INTO users(email) VALUES(?)`,[email]);
      u = await get(`SELECT * FROM users WHERE id=?`,[r.lastID]);
    }
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

// ---- Mock subscribe ----
app.post('/api/sub/mock-activate', requireLogin, async (req,res)=>{
  const until = nowSec() + Number(process.env.SUB_DEFAULT_DAYS||30)*86400;
  const tier = (req.body.tier || 'PRO').toUpperCase(); // BASIC|PLUS|PRO
  await run(`UPDATE users SET sub_expires_at=?, sub_tier=? WHERE id=?`,[until, tier, req.user.id]);
  res.json({ ok:true, subActive:true, until, subTier:tier });
});

// ---- Personas (liste + create) ----
const allowedTypes = ['female','male','anime'];
const allowedRoles = ['Asistentă medicală','Profesoară','Secretară','Asistentă birou','Girlfriend','Goth','MILF','Boyfriend','CEO/Boss','Personal Trainer','Catgirl','Elf Queen'];

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

// ---- Chat (history + send + offer + unlock) ----
// (exact ca în varianta ta anterioară) — l-am păstrat; omis aici pentru lungime
// >>> Dacă vrei și porțiunea asta completă din nou, zici și ți-o re-livrez cap-coadă.

// ---- Jobs + worker demo ---- (idem, păstrate) — omise aici pentru scurtare

// ---- Admin/Stats ----
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

// ---- Health & static ----
app.get('/health', (_req,res)=> res.json({ok:true}));
app.use('/demo', express.static(path.join(__dirname,'public','demo')));
app.use(express.static(path.join(__dirname,'public')));

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`The Future — PRO running :${PORT}`));

// ---- nu lăsa procesul să „moară” fără log ----
process.on('uncaughtException', (err)=>{ console.error('uncaughtException', err); });
process.on('unhandledRejection', (err)=>{ console.error('unhandledRejection', err); });

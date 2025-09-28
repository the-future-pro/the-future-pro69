// server.js (ESM, prod-ready) — Replicate + lipire segmente cu ffmpeg
import express from "express";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Replicate from "replicate";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ffmpeg pentru concat
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
ffmpeg.setFfmpegPath(ffmpegPath || "");

dotenv.config();

// ----- paths / __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ----- app & proxy
const app = express();
app.set("trust proxy", 1);

// ----- security & perf middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ----- sessions (sqlite pe disc)
const SESS_DIR = path.join(__dirname, "db");
try { fs.mkdirSync(SESS_DIR, { recursive: true }); } catch {}
const SQLiteStore = connectSqlite3(session);

app.use(session({
  store: new SQLiteStore({ db: "sessions.sqlite", dir: SESS_DIR }),
  secret: process.env.SESSION_SECRET || "supersecret_dev_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

// ----- rate limit pe API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

// ================== HELPERS ==================
const requireLogin = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
};

const subRequired = (req, res, next) => {
  if (String(process.env.ENFORCE_SUB_REQUIREMENT || "false").toLowerCase() !== "true") return next();
  const sub = req.session?.sub || req.session?.user?.sub;
  const active = !!(sub && sub.tier && sub.until && sub.until > Date.now());
  if (!active) return res.status(402).json({ ok: false, error: "subscription_required" });
  next();
};

// mic utilitar: descarcă URL în fișier (Node 20: fetch nativ)
async function downloadToFile(url, destPath) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed: " + r.status);
  const ab = await r.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

// concatenează segmente MP4 (fără re-encodare)
async function concatMp4Files(inputFiles, outPath) {
  const listFile = outPath + ".txt";
  fs.writeFileSync(
    listFile,
    inputFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join("\n"),
    "utf8"
  );
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .on("end", resolve)
      .on("error", reject)
      .save(outPath);
  });
  try { fs.unlinkSync(listFile); } catch {}
}

// ================== SANITY ROUTES ==================
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/api/mock-login", (req, res) => {
  const email = (req.query.email || "user@example.com").trim();
  req.session.user = { id: Date.now() % 100000, email };
  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});
app.get("/api/me", (req, res) => {
  if (req.session?.user) return res.json({ ok: true, user: req.session.user, sub: req.session.sub || null });
  return res.json({ ok: false, error: "login_required" });
});
app.get("/api/logout", (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get("/api/sub/mock-activate/:tier", (req, res) => {
  const tier = String(req.params.tier || "").toUpperCase();
  if (!["BASIC", "PLUS", "PRO"].includes(tier)) return res.status(400).json({ ok: false, error: "invalid_tier" });
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  req.session.sub = { tier, until: Date.now() + days * 24 * 60 * 60 * 1000 };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});
app.get("/api/sub/check", (req, res) => {
  const sub = req.session?.sub || req.session?.user?.sub || null;
  const active = !!(sub && sub.until && sub.until > Date.now());
  res.json({ ok: true, active, sub: sub || null });
});

// ================== LOGIN/POST simple ==================
app.post("/api/login", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  req.session.user = { email };
  res.json({ ok: true });
});
app.post("/api/verify-age/mock", requireLogin, (req, res) => {
  req.session.user.ageVerified = true;
  res.json({ ok: true });
});
app.post("/api/subscribe/mock", requireLogin, (req, res) => {
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  req.session.user.sub = { tier: "PRO", until: Date.now() + days * 24 * 60 * 60 * 1000 };
  req.session.sub = req.session.user.sub;
  res.json({ ok: true, sub: req.session.user.sub });
});

// ================== REPLICATE (video cu segmente) ==================
const replicate =
  process.env.REPLICATE_API_TOKEN
    ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
    : null;

// folder public pentru videouri
const PUBLIC_DIR = path.join(__dirname, "public");
const OUT_DIR = path.join(PUBLIC_DIR, process.env.PUBLIC_VIDEOS_DIR || "videos");
fs.mkdirSync(OUT_DIR, { recursive: true });
app.use("/" + (process.env.PUBLIC_VIDEOS_DIR || "videos"), express.static(OUT_DIR, { maxAge: "1h" }));

// POST normal (cere login + sub)
app.post("/api/video", requireLogin, subRequired, async (req, res) => {
  try {
    const prompt   = (req.body?.prompt || req.body?.storyboard || "").toString().trim();
    const negative = (req.body?.negativeExtra || "").toString().trim();
    const seconds  = Number(req.body?.seconds || 10);     // 5 / 10 / 20 din UI
    const quality  = (req.body?.quality || "720p");
    if (!prompt) return res.status(400).json({ ok: false, error: "missing_prompt" });

    if (!replicate || !process.env.REPLICATE_MODEL) {
      return res.json({ ok: true, note: "demo", payload: { seconds, quality, prompt, negative } });
    }

    const model   = process.env.REPLICATE_MODEL;          // "luma/ray-2-720p" sau "luma/ray"
    const version = process.env.REPLICATE_VERSION || "";  // opțional
    const base    = Number(process.env.SEG_BASE_SECONDS || 5);
    const segments = Math.max(1, Math.ceil(seconds / base));

    const tempDir = fs.mkdtempSync(path.join(OUT_DIR, "tmp-"));
    const segFiles = [];
    for (let i = 0; i < segments; i++) {
      const finalPrompt = prompt + (negative ? `\nNEGATIVE: ${negative}` : "");
      const pred = version
        ? await replicate.predictions.create({ version, input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false } })
        : await replicate.predictions.create({ model,   input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false } });

      let p = pred;
      while (p.status === "starting" || p.status === "processing") {
        await new Promise(r => setTimeout(r, 1500));
        p = await replicate.predictions.get(p.id);
      }
      if (p.status !== "succeeded") throw new Error("segment failed: " + (p.error || p.status));

      const outUrl = typeof p.output === "string"
        ? p.output
        : (Array.isArray(p.output) ? p.output[0] : (p.output?.url || p.output));
      if (!outUrl) throw new Error("no output url from replicate");

      const segPath = path.join(tempDir, `seg-${i}.mp4`);
      await downloadToFile(outUrl, segPath);
      segFiles.push(segPath);
    }

    const outName = `vid-${Date.now()}.mp4`;
    const outPath = path.join(OUT_DIR, outName);
    await concatMp4Files(segFiles, outPath);
    for (const f of segFiles) { try { fs.unlinkSync(f); } catch {} }
    try { fs.rmdirSync(tempDir); } catch {}

    const publicUrl = `/${process.env.PUBLIC_VIDEOS_DIR || "videos"}/${outName}`;
    return res.json({ ok: true, url: publicUrl, secondsRequested: seconds, segments, quality });
  } catch (err) {
    console.error("video generation failed:", err);
    return res.status(500).json({ ok: false, error: "video_generation_failed" });
  }
});

// POST de test fără sesiune — protejat cu X-Admin-Token
app.post("/api/video/open", async (req, res) => {
  try {
    const adminHeader = req.headers["x-admin-token"];
    if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ ok: false, error: "admin_token_invalid" });
    }
    // redirecționăm intern spre aceeași logică: simulăm un user + sub
    req.session.user = { email: "open@test" };
    req.session.sub  = { tier: "PRO", until: Date.now() + 7*24*60*60*1000 };
    return app._router.handle(req, res, () => {}, "/api/video"); // trece în lanțul existent
  } catch (e) {
    console.error("video open failed:", e);
    return res.status(500).json({ ok: false, error: "video_generation_failed" });
  }
});

// ================== STATIC & UI ==================
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "1h",
  setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=3600")
}));

app.get("/premium", (_req, res) => {
  res.type("html").send(`<!doctype html><meta charset="utf-8"/>
<title>Premium (test)</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px}
  h1{font-size:38px;margin:0 0 24px}
  .row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
  input,button,a{font-size:16px;border-radius:10px;border:1px solid #2a3343;background:#111827;color:#e6e9ef;padding:10px 14px;text-decoration:none}
  button.primary{background:#3b82f6}
  pre{background:#0f172a;border:1px solid #223047;border-radius:10px;padding:14px;overflow:auto}
</style>
<h1>Premium</h1>
<div class="row">
  <input id="email" value="itudorache53@gmail.com" style="min-width:280px"/>
  <button id="btnLogin" class="primary">Login rapid</button>
  <a href="/api/logout">Logout</a>
  <a href="/gen-video" style="margin-left:auto">→ Generează video</a>
</div>
<div class="row">
  <button data-tier="BASIC">BASIC</button>
  <button data-tier="PLUS">PLUS</button>
  <button data-tier="PRO" class="primary">PRO</button>
  <button id="btnMe">Vezi /api/me</button>
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
</script>`);
});

app.get("/gen-video", (_req, res) => {
  res.type("html").send(`<!doctype html><meta charset="utf-8"/>
<title>Generează video</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{background:#0b0f16;color:#e6e9ef;font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:16px}
  textarea,input,select,button{width:100%;border-radius:12px;border:1px solid #223047;background:#0f1624;color:#e6e9ef;padding:12px}
  .row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .pill{background:#112033;border:1px solid #223047;border-radius:999px;padding:6px 10px;font-size:12px}
  pre{background:#0f172a;border:1px solid #223047;border-radius:12px;padding:12px;overflow:auto;min-height:200px}
</style>
<h1>Generează video</h1>
<div class="row">
  <span id="userInfo" class="pill">user: –</span>
  <span id="subInfo" class="pill">abonament: –</span>
  <button id="btnQuickLogin" style="width:auto">Login rapid</button>
  <button id="btnMockPro"    style="width:auto">Premium (mock)</button>
  <button id="btnLogout"     style="width:auto">Logout</button>
</div>
<label>Storyboard / descriere</label>
<textarea id="storyboard" rows="6" placeholder="Ex: cinematic sunset on the beach, slow pan, ultra realistic colors"></textarea>
<div class="row">
  <div style="flex:1">
    <label>Durată</label>
    <select id="seconds">
      <option value="5">5s</option>
      <option value="10" selected>10s</option>
      <option value="20">20s</option>
    </select>
  </div>
  <div style="flex:1">
    <label>Calitate</label>
    <select id="quality">
      <option>540p</option>
      <option selected>720p</option>
      <option>1080p</option>
    </select>
  </div>
</div>
<div class="row">
  <button id="btnGenerate">Generează (cu sesiune)</button>
  <button id="btnOpen">Generează (test fără sesiune)</button>
  <a id="videoLink" class="pill" href="#" target="_blank" style="display:none">Deschide video</a>
</div>
<pre id="out">{ "hint": "completează și apasă Generează" }</pre>
<script>
  const $ = (id) => document.getElementById(id);
  const show = (x) => $('out').textContent = JSON.stringify(x, null, 2);
  async function refreshStatus(){
    const [me, sub] = await Promise.all([
      fetch('/api/me', {credentials:'include'}).then(r=>r.json()).catch(()=>({})),
      fetch('/api/sub/check', {credentials:'include'}).then(r=>r.json()).catch(()=>({}))
    ]);
    $('userInfo').textContent = me?.ok ? ('user: ' + me.user.email) : 'user: (neautentificat)';
    $('subInfo').textContent  = sub?.active ? ('abonament: ' + sub.sub.tier) : 'abonament: inactiv';
  }
  $('btnQuickLogin').onclick = async () => {
    const email = prompt('Email', 'user@example.com') || 'user@example.com';
    const r = await fetch('/api/mock-login?email=' + encodeURIComponent(email), { credentials:'include' });
    show(await r.json()); refreshStatus();
  };
  $('btnMockPro').onclick = async () => {
    const r = await fetch('/api/sub/mock-activate/PRO', {credentials:'include'});
    show(await r.json()); refreshStatus();
  };
  $('btnLogout').onclick = async () => {
    await fetch('/api/logout', {credentials:'include'}); refreshStatus(); show({ok:true, message:'logged out'});
  };
  async function call(path, useAdmin){
    $('videoLink').style.display = 'none';
    const payload = {
      seconds: Number($('seconds').value),
      quality: $('quality').value,
      prompt:  $('storyboard').value.trim()
    };
    const r = await fetch(path, {
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'}, useAdmin?{'X-Admin-Token':'admin123'}:{}),
      credentials:'include',
      body: JSON.stringify(payload)
    });
    const j = await r.json(); show(j);
    if (j.ok && j.url) { $('videoLink').href = j.url; $('videoLink').style.display = 'inline-block'; }
  }
  $('btnGenerate').onclick = () => call('/api/video', false);
  $('btnOpen').onclick     = () => call('/api/video/open', true);
  refreshStatus();
</script>`);
});

app.get("/", (_req, res) => res.redirect("/premium"));

// ----- start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server ready on :" + PORT));

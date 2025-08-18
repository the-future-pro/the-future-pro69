// server.js (prod-ready, ESM)
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

// ================== SANITY ROUTES ==================
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// login rapid (GET) de test
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

// mock „abonament”
app.get("/api/sub/mock-activate/:tier", (req, res) => {
  const tier = String(req.params.tier || "").toUpperCase();
  if (!["BASIC", "PLUS", "PRO"].includes(tier)) return res.status(400).json({ ok: false, error: "invalid_tier" });
  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);
  req.session.sub = { tier, until: Date.now() + days * 24 * 60 * 60 * 1000 };
  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
});

// ================== RUTELE TALE ==================
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

// ================== REPLICATE (video) ==================
const replicate =
  process.env.REPLICATE_API_TOKEN
    ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
    : null;

// POST /api/video  -> generează video cu modelul din env
app.post("/api/video", requireLogin, subRequired, async (req, res) => {
  try {
    const prompt = (req.body?.prompt || "").toString().trim();
    if (!prompt) return res.status(400).json({ ok: false, error: "missing_prompt" });

    if (!replicate || !process.env.REPLICATE_MODEL || !process.env.REPLICATE_VERSION) {
      // demo fallback dacă nu sunt chei/versiuni
      return res.json({
        ok: true,
        note: "demo (fără apel real la model)",
        payload: {
          kind: "video",
          options: { seconds: 20, quality: "720p", prompt }
        }
      });
    }

    const model = process.env.REPLICATE_MODEL;     // ex: "luma/dream-machine" sau "luma/ray"
    const version = process.env.REPLICATE_VERSION; // ex: hashul versiunii

    const prediction = await replicate.predictions.create({
      version,
      input: {
        prompt,             // promptul primit
        // câteva opțiuni uzuale (ajustează după schema modelului ales)
        num_frames: 240,    // ~10s @24fps
        fps: 24
      },
      // opțional: webhook pentru status
      // webhook: process.env.RENDER_EXTERNAL_URL + "/api/video/webhook",
      // webhook_events_filter: ["completed"]
    });

    return res.json({ ok: true, id: prediction.id, status: prediction.status, output: prediction.output || null });
  } catch (err) {
    console.error("video generation failed:", err);
    return res.status(500).json({ ok: false, error: "video_generation_failed" });
  }
});

// ================== STATIC & /premium UI ==================
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

// root -> premium
app.get("/", (_req, res) => res.redirect("/premium"));

// ----- start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server ready on :" + PORT));

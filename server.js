// server.js — The Future PRO
// ESM + Express + Sessions + Replicate Video + Static Pages + Translate API

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

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// ================== MIDDLEWARE ==================
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ================== SESSION ==================
const SESS_DIR = path.join(__dirname, "db");
fs.mkdirSync(SESS_DIR, { recursive: true });

const SQLiteStore = connectSqlite3(session);

app.use(session({
  store: new SQLiteStore({
    db: "sessions.sqlite",
    dir: SESS_DIR
  }),
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

// ================== RATE LIMIT ==================
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", apiLimiter);

// ================== PATHS ==================
const PUBLIC_DIR = path.join(__dirname, "public");
const VIDEOS_DIR_NAME = process.env.PUBLIC_VIDEOS_DIR || "videos";
const OUT_DIR = path.join(PUBLIC_DIR, VIDEOS_DIR_NAME);

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// ================== HELPERS ==================
function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

function subRequired(req, res, next) {
  if (String(process.env.ENFORCE_SUB_REQUIREMENT || "false").toLowerCase() !== "true") {
    return next();
  }

  const sub = req.session?.sub || req.session?.user?.sub;
  const active = !!(sub && sub.tier && sub.until && sub.until > Date.now());

  if (!active) {
    return res.status(402).json({ ok: false, error: "subscription_required" });
  }

  next();
}

async function downloadToFile(url, destPath) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed: " + r.status);
  const ab = await r.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

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

// ================== REPLICATE ==================
const replicate = process.env.REPLICATE_API_TOKEN
  ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
  : null;

// ================== TRANSLATION SYSTEM ==================
// Pentru traducere reală setezi în Render ENV:
// TRANSLATE_API_URL=https://.../translate
// TRANSLATE_API_KEY=optional
//
// Compatibil cu LibreTranslate-style API:
// POST { q, source, target, format, api_key }

const TRANSLATE_CACHE = new Map();

const SUPPORTED_LANGS = new Set([
  "ro", "en", "fr", "es", "de", "it", "pt", "nl", "pl", "hu",
  "bg", "cs", "sk", "hr", "sr", "tr", "ru", "uk", "ar", "hi",
  "zh", "ja", "ko"
]);

function normalizeLang(lang) {
  const clean = String(lang || "en").toLowerCase().trim();
  return SUPPORTED_LANGS.has(clean) ? clean : "en";
}

function cacheKey(text, target, source = "auto") {
  return `${source}:${target}:${text}`;
}

async function translateText({ text, target, source = "auto" }) {
  const cleanText = String(text || "").trim();
  const targetLang = normalizeLang(target);
  const sourceLang = String(source || "auto").toLowerCase().trim();

  if (!cleanText) {
    return {
      ok: true,
      translatedText: "",
      target: targetLang,
      source: sourceLang,
      provider: "none"
    };
  }

  if (targetLang === "en" && sourceLang === "en") {
    return {
      ok: true,
      translatedText: cleanText,
      target: targetLang,
      source: sourceLang,
      provider: "same_language"
    };
  }

  const key = cacheKey(cleanText, targetLang, sourceLang);
  if (TRANSLATE_CACHE.has(key)) {
    return {
      ok: true,
      translatedText: TRANSLATE_CACHE.get(key),
      target: targetLang,
      source: sourceLang,
      provider: "cache"
    };
  }

  const url = process.env.TRANSLATE_API_URL;
  const apiKey = process.env.TRANSLATE_API_KEY || "";

  if (!url) {
    return {
      ok: true,
      translatedText: cleanText,
      target: targetLang,
      source: sourceLang,
      provider: "not_configured",
      warning: "TRANSLATE_API_URL is not configured, returning original text"
    };
  }

  const body = {
    q: cleanText,
    source: sourceLang === "auto" ? "auto" : sourceLang,
    target: targetLang,
    format: "text"
  };

  if (apiKey) {
    body.api_key = apiKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("translation_provider_failed_" + response.status);
  }

  const data = await response.json();

  const translated =
    data.translatedText ||
    data.translation ||
    data.text ||
    cleanText;

  TRANSLATE_CACHE.set(key, translated);

  return {
    ok: true,
    translatedText: translated,
    target: targetLang,
    source: sourceLang,
    provider: "external"
  };
}

// ================== BASIC API ==================
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ================== TRANSLATE API ==================
app.post("/api/translate", async (req, res) => {
  try {
    const text = (req.body?.text || "").toString();
    const target = normalizeLang(req.body?.target || req.body?.lang || "en");
    const source = (req.body?.source || "auto").toString();

    const result = await translateText({ text, target, source });

    res.json(result);
  } catch (err) {
    console.error("translate failed:", err);
    res.status(500).json({
      ok: false,
      error: "translation_failed",
      details: String(err?.message || err)
    });
  }
});

app.post("/api/translate/batch", async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const target = normalizeLang(req.body?.target || req.body?.lang || "en");
    const source = (req.body?.source || "auto").toString();

    const results = [];

    for (const item of items) {
      const text = typeof item === "string" ? item : String(item?.text || "");
      const id = typeof item === "object" ? item.id : undefined;

      const result = await translateText({ text, target, source });

      results.push({
        id,
        text,
        translatedText: result.translatedText,
        target,
        source,
        provider: result.provider
      });
    }

    res.json({
      ok: true,
      target,
      source,
      items: results
    });
  } catch (err) {
    console.error("translate batch failed:", err);
    res.status(500).json({
      ok: false,
      error: "translation_batch_failed",
      details: String(err?.message || err)
    });
  }
});

// ================== LOGIN TEST ==================
app.get("/api/mock-login", (req, res) => {
  const email = (req.query.email || "user@example.com").toString().trim();

  req.session.user = {
    id: Date.now() % 100000,
    email
  };

  req.session.save(() => {
    res.json({ ok: true, user: req.session.user });
  });
});

app.post("/api/login", (req, res) => {
  const email = (req.body?.email || "user@example.com").toString().trim();

  req.session.user = {
    id: Date.now() % 100000,
    email
  };

  req.session.save(() => {
    res.json({ ok: true, user: req.session.user });
  });
});

app.get("/api/me", (req, res) => {
  if (req.session?.user) {
    const sub = req.session.sub || null;
    const subActive = !!(sub && sub.until && sub.until > Date.now());

    return res.json({
      ok: true,
      logged: true,
      user: req.session.user,
      sub,
      subActive
    });
  }

  res.json({
    ok: false,
    logged: false,
    error: "login_required"
  });
});

app.get("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ================== SUBSCRIPTIONS MOCK ==================
function activateSub(req, res, tierRaw) {
  const tier = String(tierRaw || "").toUpperCase();

  if (!["BASIC", "PLUS", "PRO"].includes(tier)) {
    return res.status(400).json({ ok: false, error: "invalid_tier" });
  }

  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);

  req.session.sub = {
    tier,
    until: Date.now() + days * 24 * 60 * 60 * 1000
  };

  req.session.save(() => {
    res.json({ ok: true, sub: req.session.sub });
  });
}

app.get("/api/sub/mock-activate/:tier", (req, res) => {
  activateSub(req, res, req.params.tier);
});

app.post("/api/sub/mock-activate", (req, res) => {
  activateSub(req, res, req.body?.tier);
});

app.get("/api/sub/check", (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until && sub.until > Date.now());

  res.json({
    ok: true,
    active,
    sub
  });
});

// ================== PERSONAS MOCK ==================
const personas = [
  {
    id: 1,
    slug: "ava-noir",
    name: "Ava Noir",
    type: "female",
    role: "Dark Luxury",
    category: "Cinematic",
    tone: "mysterious, elegant, intense",
    mediaPrices: { image: 20, video10: 90, video20: 150 }
  },
  {
    id: 2,
    slug: "mira-vale",
    name: "Mira Vale",
    type: "female",
    role: "Girl Next Door",
    category: "Romance",
    tone: "warm, sweet, emotional",
    mediaPrices: { image: 20, video10: 90, video20: 150 }
  },
  {
    id: 3,
    slug: "kira-voss",
    name: "Kira Voss",
    type: "female",
    role: "Cyberpunk Muse",
    category: "Futuristic",
    tone: "confident, cold, magnetic",
    mediaPrices: { image: 20, video10: 90, video20: 150 }
  },
  {
    id: 4,
    slug: "luna-sable",
    name: "Luna Sable",
    type: "female",
    role: "Goth Romantic",
    category: "Dark Romance",
    tone: "poetic, intense, obsessive",
    mediaPrices: { image: 20, video10: 90, video20: 150 }
  }
];

app.get("/api/personas", (_req, res) => {
  res.json({ ok: true, items: personas });
});

app.post("/api/personas", requireLogin, (req, res) => {
  const body = req.body || {};

  const name = (body.name || "AI Companion").toString().trim();

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const item = {
    id: Date.now(),
    slug,
    name,
    type: body.type || "female",
    role: body.role || "Companion",
    category: body.category || "Roleplay",
    tone: body.tone || "cinematic, private, elegant",
    mediaPrices: body.mediaPrices || { image: 20, video10: 90, video20: 150 }
  };

  personas.push(item);

  res.json({ ok: true, item });
});

// ================== CHAT MOCK ==================
const chatHistory = {};

app.get("/api/chat/:slug/history", (req, res) => {
  const slug = req.params.slug;
  const after = Number(req.query.after || 0);
  const lang = normalizeLang(req.query.lang || req.query.target || "en");

  if (!chatHistory[slug]) {
    chatHistory[slug] = [
      {
        id: 1,
        sender_type: "persona",
        kind: "text",
        text: "I am here. Tell me what kind of experience you want to create tonight."
      }
    ];
  }

  const items = chatHistory[slug].filter(m => Number(m.id || 0) > after);

  res.json({
    ok: true,
    lang,
    items
  });
});

app.post("/api/chat/:slug/send", requireLogin, (req, res) => {
  const slug = req.params.slug;

  if (!chatHistory[slug]) {
    chatHistory[slug] = [];
  }

  const text = (req.body?.text || "").toString().trim();

  if (!text) {
    return res.status(400).json({ ok: false, error: "missing_text" });
  }

  const now = Date.now();

  chatHistory[slug].push({
    id: now,
    sender_type: "user",
    kind: "text",
    text
  });

  chatHistory[slug].push({
    id: now + 1,
    sender_type: "persona",
    kind: "text",
    text: "I understand. I’ll keep the experience private, cinematic and tailored to your style."
  });

  res.json({ ok: true });
});

app.post("/api/chat/:slug/offer", requireLogin, (req, res) => {
  const slug = req.params.slug;

  if (!chatHistory[slug]) {
    chatHistory[slug] = [];
  }

  const kind = req.body?.kind || "image";
  const price = kind === "video" ? 90 : 20;

  const mediaId = "media-" + Date.now();

  chatHistory[slug].push({
    id: Date.now(),
    sender_type: "persona",
    kind: "media_locked",
    media: {
      id: mediaId,
      type: kind,
      price_credits: price,
      preview_url: kind === "video" ? "/demo/video-placeholder.mp4" : "/demo/image-placeholder.jpg",
      full_url: kind === "video" ? "/demo/video-placeholder.mp4" : "/demo/image-placeholder.jpg",
      duration_sec: kind === "video" ? Number(req.body?.duration || 10) : null
    }
  });

  res.json({ ok: true });
});

app.post("/api/media/:id/unlock", requireLogin, (req, res) => {
  res.json({
    ok: true,
    unlocked: true,
    id: req.params.id
  });
});

// ================== IMAGE GENERATION MOCK ==================
app.post("/api/image/open", (req, res) => {
  const adminHeader = req.headers["x-admin-token"];

  if (process.env.ADMIN_TOKEN && adminHeader !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "admin_token_invalid" });
  }

  const prompt = (req.body?.prompt || "").toString().trim();
  const negative = (req.body?.negative || "").toString().trim();
  const quality = req.body?.quality || "1024";

  if (!prompt) {
    return res.status(400).json({ ok: false, error: "missing_prompt" });
  }

  res.json({
    ok: true,
    mode: "mock",
    note: "image endpoint connected; real AI image generation will be added next",
    prompt,
    negative,
    quality
  });
});

// ================== VIDEO GENERATION ==================
app.use("/" + VIDEOS_DIR_NAME, express.static(OUT_DIR, { maxAge: "1h" }));

app.post("/api/video", requireLogin, subRequired, handlerGenerateVideo);

app.post("/api/video/open", async (req, res, next) => {
  const adminHeader = req.headers["x-admin-token"];

  if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "admin_token_invalid" });
  }

  return handlerGenerateVideo(req, res, next);
});

async function handlerGenerateVideo(req, res) {
  try {
    const prompt = (req.body?.prompt || req.body?.storyboard || "").toString().trim();
    const negative = (req.body?.negativeExtra || "").toString().trim();
    const seconds = Number(req.body?.seconds || 10);
    const quality = req.body?.quality || "720p";

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "missing_prompt" });
    }

    if (!replicate || !process.env.REPLICATE_MODEL) {
      return res.json({
        ok: true,
        note: "demo mode — no real Replicate call",
        payload: {
          kind: "video",
          options: { seconds, quality, prompt, negative }
        }
      });
    }

    const model = process.env.REPLICATE_MODEL;
    const version = process.env.REPLICATE_VERSION || "";
    const baseSeconds = Number(process.env.SEG_BASE_SECONDS || 5);
    const segments = Math.max(1, Math.ceil(seconds / baseSeconds));

    const tempDir = fs.mkdtempSync(path.join(OUT_DIR, "tmp-"));
    const segFiles = [];

    for (let i = 0; i < segments; i++) {
      const finalPrompt = prompt + (negative ? `\nNEGATIVE: ${negative}` : "");

      const pred = version
        ? await replicate.predictions.create({
            version,
            input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false }
          })
        : await replicate.predictions.create({
            model,
            input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false }
          });

      let p = pred;

      while (p.status === "starting" || p.status === "processing") {
        await new Promise(r => setTimeout(r, 1500));
        p = await replicate.predictions.get(p.id);
      }

      if (p.status !== "succeeded") {
        throw new Error("segment failed: " + (p.error || p.status));
      }

      const outUrl =
        typeof p.output === "string"
          ? p.output
          : Array.isArray(p.output)
            ? p.output[0]
            : (p.output?.url || p.output);

      if (!outUrl) throw new Error("no output url from replicate");

      const segPath = path.join(tempDir, `seg-${i}.mp4`);
      await downloadToFile(outUrl, segPath);
      segFiles.push(segPath);
    }

    const outName = `vid-${Date.now()}.mp4`;
    const outPath = path.join(OUT_DIR, outName);

    await concatMp4Files(segFiles, outPath);

    for (const f of segFiles) {
      try { fs.unlinkSync(f); } catch {}
    }

    try { fs.rmdirSync(tempDir); } catch {}

    const publicUrl = `/${VIDEOS_DIR_NAME}/${outName}`;

    return res.json({
      ok: true,
      url: publicUrl,
      secondsRequested: seconds,
      segments,
      quality
    });

  } catch (err) {
    console.error("video generation failed:", err);

    return res.status(500).json({
      ok: false,
      error: "video_generation_failed",
      details: String(err?.message || err)
    });
  }
}

// ================== ADMIN STATS ==================
app.get("/api/admin/stats", (_req, res) => {
  res.json({
    ok: true,
    users: 1,
    personas: personas.length,
    chat_messages: Object.values(chatHistory).flat().length,
    jobs: 0
  });
});

// ================== STATIC + HTML ROUTES ==================
app.use(express.static(PUBLIC_DIR, {
  maxAge: "1h",
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
}));

app.get("/", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/premium", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "premium.html"));
});

app.get("/gen-image.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "gen-image.html"));
});

app.get("/gen-video.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "gen-video.html"));
});

app.get("/chat.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "chat.html"));
});

app.get("/upgrade.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "upgrade.html"));
});

app.get("/privacy.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "privacy.html"));
});

app.get("/terms.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "terms.html"));
});

app.get("/safety.html", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "safety.html"));
});

// ================== START ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server ready on :" + PORT);
});

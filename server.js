// server.js — The Future PRO — stable v5005 + OpenAI Translate Fixed

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
import OpenAI from "openai";
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

const PUBLIC_DIR = path.join(__dirname, "public");
const VIDEOS_DIR_NAME = process.env.PUBLIC_VIDEOS_DIR || "videos";
const OUT_DIR = path.join(PUBLIC_DIR, VIDEOS_DIR_NAME);
const SESS_DIR = path.join(__dirname, "db");

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SESS_DIR, { recursive: true });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: SESS_DIR,
    }),
    secret: process.env.SESSION_SECRET || "supersecret_dev_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

function subRequired(req, res, next) {
  if (
    String(process.env.ENFORCE_SUB_REQUIREMENT || "false").toLowerCase() !==
    "true"
  ) {
    return next();
  }

  const sub = req.session?.sub || req.session?.user?.sub;
  const active = !!(sub && sub.tier && sub.until && sub.until > Date.now());

  if (!active) {
    return res.status(402).json({
      ok: false,
      error: "subscription_required",
    });
  }

  next();
}

function sendHtml(res, fileName) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(path.join(PUBLIC_DIR, fileName));
}

async function downloadToFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("download_failed_" + response.status);

  const ab = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

async function concatMp4Files(inputFiles, outPath) {
  const listFile = outPath + ".txt";

  fs.writeFileSync(
    listFile,
    inputFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n"),
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

  try {
    fs.unlinkSync(listFile);
  } catch {}
}

function normalizeReplicateOutputUrl(output) {
  if (!output) return null;
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    const first = output[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (first?.url) return String(first.url);
    if (typeof first?.url === "function") return String(first.url());
  }

  if (output?.url) return String(output.url);
  if (typeof output?.url === "function") return String(output.url());

  return null;
}

const replicate = process.env.REPLICATE_API_TOKEN
  ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ================== TRANSLATION SYSTEM ==================

const TRANSLATE_CACHE = new Map();
const TRANSLATE_CACHE_MAX = 5000;

const SUPPORTED_LANGS = new Set([
  "ro",
  "en",
  "fr",
  "es",
  "de",
  "it",
  "pt",
  "nl",
  "tr",
  "ru",
  "ar",
  "zh",
]);

const LANG_NAMES = {
  ro: "Romanian",
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  tr: "Turkish",
  ru: "Russian",
  ar: "Arabic",
  zh: "Chinese",
};

function normalizeLang(lang) {
  const clean = String(lang || "en").toLowerCase().trim();
  return SUPPORTED_LANGS.has(clean) ? clean : "en";
}

function normalizeSourceLang(lang) {
  const clean = String(lang || "en").toLowerCase().trim();
  if (!clean || clean === "auto") return "en";
  return SUPPORTED_LANGS.has(clean) ? clean : "en";
}

function translationCacheKey(text, target, source = "en") {
  return `${source}:${target}:${text}`;
}

function rememberTranslation(key, value) {
  if (!key || !value) return;

  TRANSLATE_CACHE.set(key, value);

  if (TRANSLATE_CACHE.size > TRANSLATE_CACHE_MAX) {
    const oldest = TRANSLATE_CACHE.keys().next().value;
    if (oldest) TRANSLATE_CACHE.delete(oldest);
  }
}

async function translateWithOpenAI(cleanText, sourceLang, targetLang) {
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a professional website UI translator. Translate naturally. Return only the translated text. Do not add explanations. Keep brand names, character names, prices, URLs, emails, API keys, JSON, code and technical tokens unchanged.",
      },
      {
        role: "user",
        content:
          `Translate from ${LANG_NAMES[sourceLang] || sourceLang} to ${
            LANG_NAMES[targetLang] || targetLang
          }:\n\n` + cleanText,
      },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || null;
}

async function translateWithEnvProvider(cleanText, sourceLang, targetLang) {
  const envUrl = process.env.TRANSLATE_API_URL;
  const apiKey = process.env.TRANSLATE_API_KEY || "";

  if (!envUrl) return null;

  const body = {
    q: cleanText,
    source: sourceLang,
    target: targetLang,
    format: "text",
  };

  if (apiKey) body.api_key = apiKey;

  const response = await fetch(envUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("translation_provider_failed_" + response.status);
  }

  const data = await response.json();
  return data?.translatedText || data?.translation || data?.text || null;
}

async function translateWithMyMemory(cleanText, sourceLang, targetLang) {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(cleanText) +
    "&langpair=" +
    encodeURIComponent(`${sourceLang}|${targetLang}`);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("mymemory_failed_" + response.status);

  const data = await response.json();
  return data?.responseData?.translatedText || null;
}

async function translateText({ text, target, source = "en" }) {
  const cleanText = String(text || "").trim();
  const targetLang = normalizeLang(target);
  const sourceLang = normalizeSourceLang(source);

  if (!cleanText) {
    return {
      ok: true,
      translatedText: "",
      target: targetLang,
      source: sourceLang,
      provider: "none",
    };
  }

  if (targetLang === sourceLang) {
    return {
      ok: true,
      translatedText: cleanText,
      target: targetLang,
      source: sourceLang,
      provider: "same_language",
    };
  }

  const key = translationCacheKey(cleanText, targetLang, sourceLang);

  if (TRANSLATE_CACHE.has(key)) {
    return {
      ok: true,
      translatedText: TRANSLATE_CACHE.get(key),
      target: targetLang,
      source: sourceLang,
      provider: "cache",
    };
  }

  try {
    const translated = await translateWithOpenAI(
      cleanText,
      sourceLang,
      targetLang
    );

    if (translated) {
      rememberTranslation(key, translated);

      return {
        ok: true,
        translatedText: translated,
        target: targetLang,
        source: sourceLang,
        provider: "openai",
      };
    }
  } catch (err) {
    console.warn("OpenAI translate failed:", err.message);
  }

  try {
    const translated = await translateWithEnvProvider(
      cleanText,
      sourceLang,
      targetLang
    );

    if (translated) {
      rememberTranslation(key, translated);

      return {
        ok: true,
        translatedText: translated,
        target: targetLang,
        source: sourceLang,
        provider: "env",
      };
    }
  } catch (err) {
    console.warn("ENV translate failed:", err.message);
  }

  try {
    const translated = await translateWithMyMemory(
      cleanText,
      sourceLang,
      targetLang
    );

    if (translated) {
      rememberTranslation(key, translated);

      return {
        ok: true,
        translatedText: translated,
        target: targetLang,
        source: sourceLang,
        provider: "mymemory",
      };
    }
  } catch (err) {
    console.warn("MyMemory translate failed:", err.message);
  }

  return {
    ok: true,
    translatedText: cleanText,
    target: targetLang,
    source: sourceLang,
    provider: "fallback_original",
  };
}

// ================== BASIC API ==================

app.get("/api/ping", (_req, res) => {
  res.json({
    ok: true,
    version: "v5005",
    ts: Date.now(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    envTranslateConfigured: !!process.env.TRANSLATE_API_URL,
    replicateConfigured: !!process.env.REPLICATE_API_TOKEN,
    langs: Array.from(SUPPORTED_LANGS),
  });
});

// ================== TRANSLATE API ==================

app.get("/api/translate", (_req, res) => {
  res.status(405).json({
    ok: false,
    error: "method_not_allowed",
    hint: "Use POST /api/translate with JSON body.",
  });
});

app.post("/api/translate", async (req, res) => {
  try {
    const text = String(req.body?.text || "");
    const target = normalizeLang(req.body?.target || req.body?.lang || "en");
    const source = normalizeSourceLang(req.body?.source || "en");

    const result = await translateText({ text, target, source });

    res.json(result);
  } catch (err) {
    console.error("translate failed:", err);

    res.status(500).json({
      ok: false,
      error: "translation_failed",
      details: String(err?.message || err),
    });
  }
});

app.post("/api/translate/batch", async (req, res) => {
  try {
    const target = normalizeLang(
      req.body?.targetLang || req.body?.target || req.body?.lang || "en"
    );
    const source = normalizeSourceLang(req.body?.source || "en");

    const textsFromArray = Array.isArray(req.body?.texts)
      ? req.body.texts
      : null;
    const itemsFromArray = Array.isArray(req.body?.items)
      ? req.body.items
      : null;

    const rawItems = textsFromArray
      ? textsFromArray.map((text, index) => ({ id: index, text }))
      : itemsFromArray || [];

    const results = [];

    for (const item of rawItems.slice(0, 80)) {
      const text = typeof item === "string" ? item : String(item?.text || "");
      const id = typeof item === "object" && item ? item.id : undefined;

      const translated = await translateText({
        text,
        target,
        source,
      });

      results.push({
        id,
        text,
        translatedText: translated.translatedText,
        target,
        source,
        provider: translated.provider,
      });
    }

    res.json({
      ok: true,
      target,
      source,
      items: results,
      translations: results.map((x) => x.translatedText),
    });
  } catch (err) {
    console.error("translate batch failed:", err);

    res.status(500).json({
      ok: false,
      error: "translation_batch_failed",
      details: String(err?.message || err),
    });
  }
});

app.get("/api/translate-test", async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang || "de");

    const result = await translateText({
      text: "Create image",
      target: lang,
      source: "en",
    });

    res.json({
      ok: true,
      lang,
      original: "Create image",
      translated: result.translatedText,
      provider: result.provider,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "translate_test_failed",
      details: String(err?.message || err),
    });
  }
});

// ================== LOGIN TEST ==================

app.get("/api/mock-login", (req, res) => {
  const email = String(req.query.email || "user@example.com").trim();

  req.session.user = {
    id: Date.now() % 100000,
    email,
  };

  req.session.save(() => {
    res.json({
      ok: true,
      user: req.session.user,
    });
  });
});

app.post("/api/login", (req, res) => {
  const email = String(req.body?.email || "user@example.com").trim();

  req.session.user = {
    id: Date.now() % 100000,
    email,
  };

  req.session.save(() => {
    res.json({
      ok: true,
      user: req.session.user,
    });
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
      subActive,
    });
  }

  res.json({
    ok: false,
    logged: false,
    error: "login_required",
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
    return res.status(400).json({
      ok: false,
      error: "invalid_tier",
    });
  }

  const days = Number(process.env.SUB_DEFAULT_DAYS || 30);

  req.session.sub = {
    tier,
    until: Date.now() + days * 24 * 60 * 60 * 1000,
  };

  req.session.save(() => {
    res.json({
      ok: true,
      sub: req.session.sub,
    });
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
    sub,
  });
});

// ================== PERSONAS ==================

const personas = [
  {
    id: 1,
    slug: "ava-noir",
    name: "Ava Noir",
    type: "female",
    role: "Dark Luxury",
    category: "Cinematic",
    tone: "mysterious, elegant, intense",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
  {
    id: 2,
    slug: "mira-vale",
    name: "Mira Vale",
    type: "female",
    role: "Girl Next Door",
    category: "Romance",
    tone: "warm, sweet, emotional",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
  {
    id: 3,
    slug: "kira-voss",
    name: "Kira Voss",
    type: "female",
    role: "Cyberpunk Muse",
    category: "Futuristic",
    tone: "confident, cold, magnetic",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
  {
    id: 4,
    slug: "luna-sable",
    name: "Luna Sable",
    type: "female",
    role: "Goth Romantic",
    category: "Dark Romance",
    tone: "poetic, intense, obsessive",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
];

app.get("/api/personas", (_req, res) => {
  res.json({
    ok: true,
    items: personas,
  });
});

app.post("/api/personas", requireLogin, (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "AI Companion").trim();

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
    mediaPrices: body.mediaPrices || {
      image: 20,
      video10: 90,
      video20: 150,
    },
  };

  personas.push(item);

  res.json({
    ok: true,
    item,
  });
});

// ================== CHAT MOCK ==================

const chatHistory = {};

app.get("/api/chat/:slug/history", async (req, res) => {
  const slug = req.params.slug;
  const after = Number(req.query.after || 0);
  const lang = normalizeLang(req.query.lang || req.query.target || "en");

  if (!chatHistory[slug]) {
    chatHistory[slug] = [
      {
        id: 1,
        sender_type: "persona",
        kind: "text",
        text: "I am here. Tell me what kind of experience you want to create tonight.",
      },
    ];
  }

  const items = chatHistory[slug]
    .filter((m) => Number(m.id || 0) > after)
    .map((m) => ({ ...m }));

  if (lang !== "en") {
    for (const item of items) {
      if (item.kind === "text" && item.text) {
        const translated = await translateText({
          text: item.text,
          target: lang,
          source: "en",
        });

        item.translatedText = translated.translatedText;
      }
    }
  }

  res.json({
    ok: true,
    lang,
    items,
  });
});

app.post("/api/chat/:slug/send", requireLogin, (req, res) => {
  const slug = req.params.slug;

  if (!chatHistory[slug]) chatHistory[slug] = [];

  const text = String(req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({
      ok: false,
      error: "missing_text",
    });
  }

  const now = Date.now();

  chatHistory[slug].push({
    id: now,
    sender_type: "user",
    kind: "text",
    text,
  });

  chatHistory[slug].push({
    id: now + 1,
    sender_type: "persona",
    kind: "text",
    text: "I understand. I’ll keep the experience private, cinematic and tailored to your style.",
  });

  res.json({ ok: true });
});

app.post("/api/chat/:slug/offer", requireLogin, (req, res) => {
  const slug = req.params.slug;

  if (!chatHistory[slug]) chatHistory[slug] = [];

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
      preview_url:
        kind === "video"
          ? "/demo/video-placeholder.mp4"
          : "/demo/image-placeholder.jpg",
      full_url:
        kind === "video"
          ? "/demo/video-placeholder.mp4"
          : "/demo/image-placeholder.jpg",
      duration_sec: kind === "video" ? Number(req.body?.duration || 10) : null,
    },
  });

  res.json({ ok: true });
});

app.post("/api/media/:id/unlock", requireLogin, (req, res) => {
  res.json({
    ok: true,
    unlocked: true,
    id: req.params.id,
  });
});

// ================== IMAGE GENERATION MOCK ==================

app.post("/api/image/open", (req, res) => {
  const adminHeader = req.headers["x-admin-token"];

  if (process.env.ADMIN_TOKEN && adminHeader !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({
      ok: false,
      error: "admin_token_invalid",
    });
  }

  const prompt = String(req.body?.prompt || "").trim();
  const negative = String(req.body?.negative || "").trim();
  const quality = req.body?.quality || "1024";

  if (!prompt) {
    return res.status(400).json({
      ok: false,
      error: "missing_prompt",
    });
  }

  res.json({
    ok: true,
    mode: "mock",
    note: "image endpoint connected; real AI image generation will be added next",
    prompt,
    negative,
    quality,
  });
});

// ================== VIDEO GENERATION ==================

app.use(
  "/" + VIDEOS_DIR_NAME,
  express.static(OUT_DIR, {
    maxAge: "1h",
  })
);

app.post("/api/video", requireLogin, subRequired, handlerGenerateVideo);

app.post("/api/video/open", async (req, res, next) => {
  const adminHeader = req.headers["x-admin-token"];

  if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({
      ok: false,
      error: "admin_token_invalid",
    });
  }

  return handlerGenerateVideo(req, res, next);
});

async function handlerGenerateVideo(req, res) {
  try {
    const prompt = String(req.body?.prompt || req.body?.storyboard || "").trim();
    const negative = String(
      req.body?.negativeExtra || req.body?.negative || ""
    ).trim();
    const seconds = Math.max(5, Math.min(20, Number(req.body?.seconds || 10)));
    const quality = req.body?.quality || "720p";

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "missing_prompt",
      });
    }

    if (!replicate || !process.env.REPLICATE_MODEL) {
      return res.json({
        ok: true,
        note: "demo mode — no real Replicate call",
        payload: {
          kind: "video",
          options: {
            seconds,
            quality,
            prompt,
            negative,
          },
        },
      });
    }

    const model = String(process.env.REPLICATE_MODEL || "").trim();
    const version = String(process.env.REPLICATE_VERSION || "").trim();
    const baseSeconds = Math.max(1, Number(process.env.SEG_BASE_SECONDS || 5));
    const segments = Math.max(1, Math.ceil(seconds / baseSeconds));

    const tempDir = fs.mkdtempSync(path.join(OUT_DIR, "tmp-"));
    const segFiles = [];

    try {
      for (let i = 0; i < segments; i++) {
        const finalPrompt =
          prompt + (negative ? `\nNEGATIVE: ${negative}` : "");

        const prediction = version
          ? await replicate.predictions.create({
              version,
              input: {
                prompt: finalPrompt,
                aspect_ratio: "16:9",
                loop: false,
              },
            })
          : await replicate.predictions.create({
              model,
              input: {
                prompt: finalPrompt,
                aspect_ratio: "16:9",
                loop: false,
              },
            });

        let current = prediction;

        while (
          current.status === "starting" ||
          current.status === "processing"
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          current = await replicate.predictions.get(current.id);
        }

        if (current.status !== "succeeded") {
          throw new Error("segment_failed_" + (current.error || current.status));
        }

        const outUrl = normalizeReplicateOutputUrl(current.output);
        if (!outUrl) throw new Error("no_output_url_from_replicate");

        const segPath = path.join(tempDir, `seg-${i}.mp4`);
        await downloadToFile(outUrl, segPath);

        segFiles.push(segPath);
      }

      const outName = `vid-${Date.now()}.mp4`;
      const outPath = path.join(OUT_DIR, outName);

      await concatMp4Files(segFiles, outPath);

      return res.json({
        ok: true,
        url: `/${VIDEOS_DIR_NAME}/${outName}`,
        secondsRequested: seconds,
        segments,
        quality,
      });
    } finally {
      for (const file of segFiles) {
        try {
          fs.unlinkSync(file);
        } catch {}
      }

      try {
        fs.rmSync(tempDir, {
          recursive: true,
          force: true,
        });
      } catch {}
    }
  } catch (err) {
    console.error("video generation failed:", err);

    return res.status(500).json({
      ok: false,
      error: "video_generation_failed",
      details: String(err?.message || err),
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
    jobs: 0,
  });
});

// ================== STATIC + HTML ROUTES ==================

app.use(
  express.static(PUBLIC_DIR, {
    etag: true,
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html") || filePath.endsWith("i18n.js")) {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return;
      }

      res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    },
  })
);

app.get("/", (_req, res) => sendHtml(res, "index.html"));
app.get("/premium", (_req, res) => sendHtml(res, "premium.html"));
app.get("/gen-image.html", (_req, res) => sendHtml(res, "gen-image.html"));
app.get("/gen-video.html", (_req, res) => sendHtml(res, "gen-video.html"));
app.get("/chat.html", (_req, res) => sendHtml(res, "chat.html"));
app.get("/upgrade.html", (_req, res) => sendHtml(res, "upgrade.html"));
app.get("/privacy.html", (_req, res) => sendHtml(res, "privacy.html"));
app.get("/terms.html", (_req, res) => sendHtml(res, "terms.html"));
app.get("/safety.html", (_req, res) => sendHtml(res, "safety.html"));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      ok: false,
      error: "api_not_found",
      path: req.path,
    });
  }

  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The Future PRO v5005 running on :" + PORT);
});

// server.js — The Future PRO — v5011 + persistent mock chat

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

const PUBLIC_DIR = path.join(__dirname, "public");
const VIDEOS_DIR_NAME = process.env.PUBLIC_VIDEOS_DIR || "videos";
const IMAGES_DIR_NAME = process.env.PUBLIC_IMAGES_DIR || "images";
const OUT_DIR = path.join(PUBLIC_DIR, VIDEOS_DIR_NAME);
const IMG_DIR = path.join(PUBLIC_DIR, IMAGES_DIR_NAME);
const SESS_DIR = path.join(__dirname, "db");
const CHAT_FILE = path.join(SESS_DIR, "chat-history.json");
const WALLET_FILE = path.join(SESS_DIR, "wallet-state.json");
const GALLERY_FILE = path.join(SESS_DIR, "image-gallery.json");

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(SESS_DIR, { recursive: true });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

function userKey(req) {
  return String(req.session?.user?.email || req.session?.user?.id || "guest");
}

function loadJsonSafe(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJsonSafe(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

let walletState = loadJsonSafe(WALLET_FILE, {});
let galleryState = loadJsonSafe(GALLERY_FILE, {});

function ensureWallet(key) {
  if (!walletState[key]) {
    walletState[key] = { balance: 240, unlocks: {}, history: [] };
    saveJsonSafe(WALLET_FILE, walletState);
  }
  return walletState[key];
}


const PREMIUM_CATALOG = {
  private_cinematic_image: { cost: 20, label: "Imagine cinematică privată" },
  special_story: { cost: 300, label: "Story special" },
  premium_video_teaser: { cost: 90, label: "Video teaser premium" },
};

function getPremiumItem(type) {
  return PREMIUM_CATALOG[String(type || "").trim()] || null;
}

function hasPremiumUnlock(req, type) {
  const wallet = ensureWallet(userKey(req));
  return !!wallet.unlocks?.[type];
}

function premiumLockedResponse(res, type) {
  const item = getPremiumItem(type);
  if (!item) return res.status(400).json({ ok: false, error: "invalid_premium_type" });
  return res.status(403).json({
    ok: false,
    error: "PREMIUM_LOCKED",
    message: `Deblochează ${item.label} cu ${item.cost} CR înainte de generare.`,
  });
}

function requirePremiumUnlock(typeResolver) {
  return (req, res, next) => {
    const type = typeof typeResolver === "function" ? typeResolver(req) : typeResolver;
    if (!type) return next();
    if (hasPremiumUnlock(req, type)) return next();
    return premiumLockedResponse(res, type);
  };
}

function subRequired(req, res, next) {
  if (String(process.env.ENFORCE_SUB_REQUIREMENT || "false").toLowerCase() !== "true") return next();

  const sub = req.session?.sub || req.session?.user?.sub;
  const active = !!(sub && sub.tier && sub.until && sub.until > Date.now());

  if (!active) return res.status(402).json({ ok: false, error: "subscription_required" });
  next();
}

function sendHtml(res, fileName) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
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

  try { fs.unlinkSync(listFile); } catch {}
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

function imageExtensionFromUrl(url) {
  const clean = String(url || "").split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return "png";
  if (clean.endsWith(".jpg")) return "jpg";
  if (clean.endsWith(".jpeg")) return "jpg";
  if (clean.endsWith(".webp")) return "webp";
  return "webp";
}

function buildImagePrompt(prompt, negative = "") {
  const base = String(prompt || "").trim();
  const avoid = String(negative || "").trim();

  let finalPrompt =
    base +
    "\n\nStyle: cinematic, premium realism, detailed lighting, realistic texture, high quality, fictional AI character only.";

  if (avoid) finalPrompt += "\nAvoid: " + avoid;

  finalPrompt += "\nSafety: fictional adult characters only, no real-person identity, no minors, no deepfake.";

  return finalPrompt;
}

const replicate = process.env.REPLICATE_API_TOKEN
  ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN.trim() })
  : null;

// ================== TRANSLATION ==================

const TRANSLATE_CACHE = new Map();
const TRANSLATE_CACHE_MAX = 5000;

const SUPPORTED_LANGS = new Set(["ro","en","fr","es","de","it","pt","nl","tr","ru","ar","zh"]);

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

async function translateWithGoogleFree(cleanText, sourceLang, targetLang) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(sourceLang) +
    "&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(cleanText);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) throw new Error("google_free_failed_" + response.status);

  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  return data[0].map((part) => Array.isArray(part) ? part[0] : "").join("").trim();
}

async function translateWithMyMemory(cleanText, sourceLang, targetLang) {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(cleanText) +
    "&langpair=" +
    encodeURIComponent(`${sourceLang}|${targetLang}`);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("mymemory_failed_" + response.status);

  const data = await response.json();
  return data?.responseData?.translatedText || null;
}

async function translateText({ text, target, source = "en" }) {
  const cleanText = String(text || "").trim();
  const targetLang = normalizeLang(target);
  const sourceLang = normalizeSourceLang(source);

  if (!cleanText) {
    return { ok: true, translatedText: "", target: targetLang, source: sourceLang, provider: "none" };
  }

  if (targetLang === sourceLang) {
    return { ok: true, translatedText: cleanText, target: targetLang, source: sourceLang, provider: "same_language" };
  }

  const key = translationCacheKey(cleanText, targetLang, sourceLang);

  if (TRANSLATE_CACHE.has(key)) {
    return { ok: true, translatedText: TRANSLATE_CACHE.get(key), target: targetLang, source: sourceLang, provider: "cache" };
  }

  try {
    const translated = await translateWithGoogleFree(cleanText, sourceLang, targetLang);
    if (translated && translated !== cleanText) {
      rememberTranslation(key, translated);
      return { ok: true, translatedText: translated, target: targetLang, source: sourceLang, provider: "google_free" };
    }
  } catch (err) {
    console.warn("Google free translate failed:", err.message);
  }

  try {
    const translated = await translateWithMyMemory(cleanText, sourceLang, targetLang);
    if (translated && translated !== cleanText) {
      rememberTranslation(key, translated);
      return { ok: true, translatedText: translated, target: targetLang, source: sourceLang, provider: "mymemory" };
    }
  } catch (err) {
    console.warn("MyMemory translate failed:", err.message);
  }

  return { ok: true, translatedText: cleanText, target: targetLang, source: sourceLang, provider: "fallback_original" };
}

// ================== BASIC API ==================

app.get("/api/ping", (_req, res) => {
  res.json({
    ok: true,
    version: "v5011-persistent-chat",
    ts: Date.now(),
    translateMode: "free_google",
    googleFreeEnabled: true,
    myMemoryEnabled: true,
    replicateConfigured: !!process.env.REPLICATE_API_TOKEN,
    imageModelConfigured: !!process.env.REPLICATE_IMAGE_MODEL,
    imageModel: process.env.REPLICATE_IMAGE_MODEL || null,
    videoModelConfigured: !!process.env.REPLICATE_MODEL,
    chatPersistence: "json_file_mock",
    langs: Array.from(SUPPORTED_LANGS),
  });
});

// ================== TRANSLATE API ==================

app.get("/api/translate", (_req, res) => {
  res.status(405).json({ ok: false, error: "method_not_allowed", hint: "Use POST /api/translate with JSON body." });
});

app.post("/api/translate", async (req, res) => {
  try {
    const text = String(req.body?.text || "");
    const target = normalizeLang(req.body?.target || req.body?.lang || "en");
    const source = normalizeSourceLang(req.body?.source || "en");
    const result = await translateText({ text, target, source });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: "translation_failed", details: String(err?.message || err) });
  }
});

app.post("/api/translate/batch", async (req, res) => {
  try {
    const target = normalizeLang(req.body?.targetLang || req.body?.target || req.body?.lang || "en");
    const source = normalizeSourceLang(req.body?.source || "en");

    const textsFromArray = Array.isArray(req.body?.texts) ? req.body.texts : null;
    const itemsFromArray = Array.isArray(req.body?.items) ? req.body.items : null;

    const rawItems = textsFromArray
      ? textsFromArray.map((text, index) => ({ id: index, text }))
      : itemsFromArray || [];

    const results = [];

    for (const item of rawItems.slice(0, 80)) {
      const text = typeof item === "string" ? item : String(item?.text || "");
      const id = typeof item === "object" && item ? item.id : undefined;
      const translated = await translateText({ text, target, source });

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
    res.status(500).json({ ok: false, error: "translation_batch_failed", details: String(err?.message || err) });
  }
});

app.get("/api/translate-test", async (req, res) => {
  try {
    const lang = normalizeLang(req.query.lang || "de");
    const result = await translateText({ text: "Create image", target: lang, source: "en" });

    res.json({
      ok: true,
      lang,
      original: "Create image",
      translated: result.translatedText,
      provider: result.provider,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "translate_test_failed", message: err?.message || null });
  }
});

// ================== LOGIN TEST ==================

app.get("/api/mock-login", (req, res) => {
  const email = String(req.query.email || "user@example.com").trim();

  req.session.user = {
    id: Date.now() % 100000,
    email,
  };

  req.session.save(() => res.json({ ok: true, user: req.session.user }));
});

app.post("/api/login", (req, res) => {
  const email = String(req.body?.email || "user@example.com").trim();

  req.session.user = {
    id: Date.now() % 100000,
    email,
  };

  req.session.save(() => res.json({ ok: true, user: req.session.user }));
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

  res.json({ ok: false, logged: false, error: "login_required" });
});

app.get("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
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
    until: Date.now() + days * 24 * 60 * 60 * 1000,
  };

  req.session.save(() => res.json({ ok: true, sub: req.session.sub }));
}

app.get("/api/sub/mock-activate/:tier", (req, res) => activateSub(req, res, req.params.tier));
app.post("/api/sub/mock-activate", (req, res) => activateSub(req, res, req.body?.tier));

app.get("/api/sub/check", (req, res) => {
  const sub = req.session?.sub || null;
  const active = !!(sub && sub.until && sub.until > Date.now());
  res.json({ ok: true, active, sub });
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
  {
    id: 5,
    slug: "dante-vale",
    name: "Dante Vale",
    type: "male",
    role: "Masculine Luxury",
    category: "Dark Romance",
    tone: "calm, protective, dangerous",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
  {
    id: 6,
    slug: "noah-sterling",
    name: "Noah Sterling",
    type: "male",
    role: "Elegant CEO",
    category: "Luxury",
    tone: "intelligent, precise, premium",
    mediaPrices: { image: 20, video10: 90, video20: 150 },
  },
];

app.get("/api/personas", (_req, res) => {
  res.json({ ok: true, items: personas });
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
    mediaPrices: body.mediaPrices || { image: 20, video10: 90, video20: 150 },
  };

  personas.push(item);
  res.json({ ok: true, item });
});

// ================== CHAT PERSISTENT MOCK ==================

const personaChatProfiles = {
  "ava-noir": {
    name: "Ava Noir",
    intro: "Sunt aici. Spune-mi ce fel de experiență vrei să creăm în seara asta.",
    replies: [
      "Îmi place direcția asta. O putem face mai cinematică, mai lentă și mult mai intensă.",
      "Înțeleg. Păstrez atmosfera privată, elegantă și adaptată stilului tău.",
      "Asta sună ca o scenă cu lumină joasă, tensiune subtilă și lux întunecat.",
      "Pot transforma ideea într-un moment premium, memorabil și vizual."
    ],
  },
  "mira-vale": {
    name: "Mira Vale",
    intro: "Sunt aici cu tine. Spune-mi ce ai nevoie să simți acum.",
    replies: [
      "Sună foarte personal. Aș păstra tonul cald, apropiat și sincer.",
      "Îmi place. Putem construi o scenă blândă, emoțională și foarte intimă ca atmosferă.",
      "Asta merită spus încet, cu grijă, fără grabă.",
      "Pot să duc conversația într-o zonă mai caldă, mai liniștitoare."
    ],
  },
  "kira-voss": {
    name: "Kira Voss",
    intro: "Sistem pornit. Spune-mi ce scenă vrei să aprindem în neon.",
    replies: [
      "Perfect. Asta cere neon, ritm rece și o atmosferă futuristă.",
      "Îmi place energia. O facem magnetică, directă și vizuală.",
      "Scena asta poate deveni mult mai electrică dacă păstrăm tensiunea controlată.",
      "Bun. Vibe-ul e cyberpunk, rece și premium."
    ],
  },
  "luna-sable": {
    name: "Luna Sable",
    intro: "Sunt aici. Spune-mi ce poveste vrei să ardă încet.",
    replies: [
      "Asta are gust de noapte, poezie și dark romance.",
      "Îmi place fragilitatea ideii. O putem face intensă, dar elegantă.",
      "Unele scene nu trebuie grăbite. Trebuie lăsate să doară frumos.",
      "Pot să transform asta într-un moment poetic, întunecat și memorabil."
    ],
  },
  "dante-vale": {
    name: "Dante Vale",
    intro: "Sunt aici. Spune-mi ce fel de experiență vrei să creezi în seara asta.",
    replies: [
      "Înțeleg. O ținem controlată, elegantă și cu tensiune calmă.",
      "Asta sună ca o scenă premium: puține cuvinte, multă prezență.",
      "Pot să construiesc atmosfera în jurul protecției, luxului și controlului.",
      "Bun. Direcția e clară: calm, intens, memorabil."
    ],
  },
  "noah-sterling": {
    name: "Noah Sterling",
    intro: "Sunt aici. Spune-mi obiectivul, iar eu îl transform într-o experiență precisă.",
    replies: [
      "Bună alegere. Asta cere rafinament, ritm și detalii atent controlate.",
      "Pot să structurez scena elegant, inteligent și premium.",
      "Asta funcționează cel mai bine cu tensiune subtilă și dialog precis.",
      "Înțeleg perfect. O facem curat, sofisticat și memorabil."
    ],
  },
};

function loadChatHistory() {
  try {
    if (!fs.existsSync(CHAT_FILE)) return {};
    const raw = fs.readFileSync(CHAT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn("chat history load failed:", err.message);
    return {};
  }
}

function saveChatHistory() {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chatHistory, null, 2), "utf8");
  } catch (err) {
    console.warn("chat history save failed:", err.message);
  }
}

const chatHistory = loadChatHistory();

function getPersonaChat(slug) {
  return personaChatProfiles[slug] || personaChatProfiles["ava-noir"];
}

function ensureChat(slug) {
  if (!chatHistory[slug]) {
    const persona = getPersonaChat(slug);

    chatHistory[slug] = [
      {
        id: Date.now(),
        sender_type: "persona",
        kind: "text",
        text: persona.intro,
        created_at: new Date().toISOString(),
      },
    ];

    saveChatHistory();
  }

  return chatHistory[slug];
}

function choosePersonaReply(slug, userText) {
  const persona = getPersonaChat(slug);
  const text = String(userText || "").toLowerCase();

  if (text.includes("imagine") || text.includes("poza") || text.includes("photo")) {
    return "Pot transforma ideea într-un prompt cinematic pentru Image Studio. Păstrăm personajul fictiv, adult și cu vibe premium.";
  }

  if (text.includes("video") || text.includes("clip")) {
    return "Putem construi un teaser scurt, cu atmosferă clară, lumină controlată și identitate vizuală constantă.";
  }

  if (text.includes("profil") || text.includes("personaj")) {
    return "Putem dezvolta profilul: lore, mood, relație progresivă, galerie blocată și stil vizual constant.";
  }

  const replies = persona.replies || personaChatProfiles["ava-noir"].replies;
  const index = Math.abs(
    String(userText || "")
      .split("")
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  ) % replies.length;

  return replies[index];
}

app.get("/api/chat/:slug/history", async (req, res) => {
  const slug = req.params.slug;
  const after = Number(req.query.after || 0);
  const lang = normalizeLang(req.query.lang || req.query.target || "ro");

  const history = ensureChat(slug);

  const items = history
    .filter((m) => Number(m.id || 0) > after)
    .map((m) => ({ ...m }));

  if (lang !== "ro") {
    for (const item of items) {
      if (item.kind === "text" && item.text) {
        const translated = await translateText({
          text: item.text,
          target: lang,
          source: "ro",
        });

        item.translatedText = translated.translatedText;
      }
    }
  }

  res.json({
    ok: true,
    slug,
    persona: getPersonaChat(slug).name,
    lang,
    count: items.length,
    items,
  });
});

app.post("/api/chat/:slug/send", requireLogin, requirePremiumUnlock("special_story"), (req, res) => {
  const slug = req.params.slug;
  const history = ensureChat(slug);

  const text = String(req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({ ok: false, error: "missing_text" });
  }

  const now = Date.now();
  const reply = choosePersonaReply(slug, text);

  const userMessage = {
    id: now,
    sender_type: "user",
    kind: "text",
    text,
    created_at: new Date().toISOString(),
  };

  const personaMessage = {
    id: now + 1,
    sender_type: "persona",
    kind: "text",
    text: reply,
    created_at: new Date().toISOString(),
  };

  history.push(userMessage, personaMessage);

  if (history.length > 200) {
    chatHistory[slug] = history.slice(-200);
  }

  saveChatHistory();

  res.json({
    ok: true,
    userMessage,
    personaMessage,
  });
});

app.post("/api/chat/:slug/offer", requireLogin, (req, res) => {
  const slug = req.params.slug;
  const history = ensureChat(slug);

  const kind = req.body?.kind || "image";
  const price = kind === "video" ? 90 : 20;
  const mediaId = "media-" + Date.now();

  const item = {
    id: Date.now(),
    sender_type: "persona",
    kind: "media_locked",
    created_at: new Date().toISOString(),
    media: {
      id: mediaId,
      type: kind,
      price_credits: price,
      preview_url: kind === "video" ? "/demo/video-placeholder.mp4" : "/demo/image-placeholder.jpg",
      full_url: kind === "video" ? "/demo/video-placeholder.mp4" : "/demo/image-placeholder.jpg",
      duration_sec: kind === "video" ? Number(req.body?.duration || 10) : null,
    },
  };

  history.push(item);
  saveChatHistory();

  res.json({ ok: true, item });
});

app.post("/api/chat/:slug/reset", requireLogin, (req, res) => {
  const slug = req.params.slug;
  delete chatHistory[slug];
  ensureChat(slug);
  saveChatHistory();

  res.json({ ok: true, reset: true, slug });
});

app.post("/api/media/:id/unlock", requireLogin, (req, res) => {
  res.json({ ok: true, unlocked: true, id: req.params.id });
});

app.get("/api/wallet", requireLogin, (req, res) => {
  const wallet = ensureWallet(userKey(req));
  res.json({ ok: true, balance: wallet.balance });
});

app.get("/api/wallet/transactions", requireLogin, (req, res) => {
  const wallet = ensureWallet(userKey(req));
  res.json({ ok: true, transactions: wallet.history });
});

app.post("/api/wallet/add", requireLogin, (req, res) => {
  const amount = Math.max(0, Number(req.body?.amount || 0));
  if (!amount) return res.status(400).json({ ok: false, error: "invalid_amount" });
  const wallet = ensureWallet(userKey(req));
  wallet.balance += amount;
  const transaction = {
    amount,
    type: "topup",
    label: String(req.body?.text || "Pachet credits"),
    balanceAfter: wallet.balance,
    status: "success",
    createdAt: new Date().toISOString(),
  };
  wallet.history.unshift(transaction);
  wallet.history = wallet.history.slice(0, 100);
  saveJsonSafe(WALLET_FILE, walletState);
  res.json({ ok: true, balance: wallet.balance, transaction });
});

app.get("/api/premium/unlocks", requireLogin, (req, res) => {
  const wallet = ensureWallet(userKey(req));
  const unlocks = Object.entries(wallet.unlocks || {}).map(([type, data]) => ({
    type,
    createdAt: data?.createdAt || data?.unlockedAt || new Date().toISOString(),
  }));
  res.json({ ok: true, unlocks });
});

app.post("/api/premium/unlock", requireLogin, (req, res) => {
  const type = String(req.body?.type || "").trim();
  const item = getPremiumItem(type);
  if (!item) return res.status(400).json({ ok: false, error: "invalid_premium_type" });

  const wallet = ensureWallet(userKey(req));
  if (wallet.unlocks[type]) {
    return res.json({ ok: true, type, unlocked: true, alreadyUnlocked: true, balance: wallet.balance });
  }

  if (wallet.balance < item.cost) {
    return res.status(400).json({ ok: false, error: "INSUFFICIENT_CREDITS", message: "Nu ai suficiente credite." });
  }

  wallet.balance -= item.cost;
  wallet.unlocks[type] = { unlocked: true, createdAt: new Date().toISOString(), cost: item.cost, label: item.label };
  const transaction = {
    amount: -item.cost,
    type: "premium_unlock",
    label: item.label,
    unlockType: type,
    balanceAfter: wallet.balance,
    status: "success",
    createdAt: new Date().toISOString(),
  };
  wallet.history.unshift(transaction);
  wallet.history = wallet.history.slice(0, 100);
  saveJsonSafe(WALLET_FILE, walletState);

  res.json({ ok: true, type, unlocked: true, alreadyUnlocked: false, balance: wallet.balance });
});

app.get("/api/gallery", requireLogin, (req, res) => {
  const key = userKey(req);
  res.json({ ok: true, items: galleryState[key] || [] });
});

app.post("/api/gallery/save", requireLogin, (req, res) => {
  const key = userKey(req);
  const imageUrl = String(req.body?.url || "").trim();
  if (!imageUrl) return res.status(400).json({ ok: false, error: "missing_url" });
  if (!galleryState[key]) galleryState[key] = [];
  const image = {
    image_id: "img_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    owner: key,
    prompt: String(req.body?.prompt || ""),
    negative: String(req.body?.negative || ""),
    quality: String(req.body?.quality || "1024"),
    url: imageUrl,
    unlocked: !!req.body?.unlocked,
    created_at: new Date().toISOString()
  };
  galleryState[key].unshift(image);
  galleryState[key] = galleryState[key].slice(0, 200);
  saveJsonSafe(GALLERY_FILE, galleryState);
  res.json({ ok: true, image, items: galleryState[key] });
});

// ================== REAL IMAGE GENERATION ==================

app.use("/" + IMAGES_DIR_NAME, express.static(IMG_DIR, { maxAge: "1h" }));

app.post("/api/image/open", requireLogin, requirePremiumUnlock("private_cinematic_image"), async (req, res) => {
  try {
    const adminHeader = req.headers["x-admin-token"];

    if (process.env.ADMIN_TOKEN && adminHeader !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ ok: false, error: "admin_token_invalid" });
    }

    const prompt = String(req.body?.prompt || "").trim();
    const negative = String(req.body?.negative || "").trim();
    const quality = String(req.body?.quality || "1024").trim();

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "missing_prompt" });
    }

    if (!replicate || !process.env.REPLICATE_IMAGE_MODEL) {
      return res.json({
        ok: true,
        mode: "mock",
        note: "image endpoint connected; set REPLICATE_API_TOKEN and REPLICATE_IMAGE_MODEL for real generation",
        prompt,
        negative,
        quality,
      });
    }

    const model = String(process.env.REPLICATE_IMAGE_MODEL || "").trim();
    const finalPrompt = buildImagePrompt(prompt, negative);

    const input = {
      prompt: finalPrompt,
      output_format: "webp",
      output_quality: 90,
    };

    if (quality === "2048") input.megapixels = "1";
    if (quality === "8k") {
      input.megapixels = "1";
      input.num_outputs = 1;
    }

    const output = await replicate.run(model, { input });
    const imageUrl = normalizeReplicateOutputUrl(output);

    if (!imageUrl) {
      return res.status(500).json({ ok: false, error: "no_image_output_url", output });
    }

    const ext = imageExtensionFromUrl(imageUrl);
    const outName = `img-${Date.now()}.${ext}`;
    const outPath = path.join(IMG_DIR, outName);

    await downloadToFile(imageUrl, outPath);

    return res.json({
      ok: true,
      mode: "real",
      provider: "replicate",
      model,
      url: `/${IMAGES_DIR_NAME}/${outName}`,
      originalUrl: imageUrl,
      prompt,
      finalPrompt,
      negative,
      quality,
    });
  } catch (err) {
    console.error("image generation failed:", err);

    return res.status(500).json({
      ok: false,
      error: "image_generation_failed",
      details: String(err?.message || err),
    });
  }
});

// ================== VIDEO GENERATION ==================

app.use("/" + VIDEOS_DIR_NAME, express.static(OUT_DIR, { maxAge: "1h" }));

app.post("/api/video", requireLogin, subRequired, requirePremiumUnlock("premium_video_teaser"), handlerGenerateVideo);

app.post("/api/video/open", requireLogin, requirePremiumUnlock("premium_video_teaser"), async (req, res, next) => {
  const adminHeader = req.headers["x-admin-token"];

  if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "admin_token_invalid" });
  }

  return handlerGenerateVideo(req, res, next);
});

async function handlerGenerateVideo(req, res) {
  try {
    const prompt = String(req.body?.prompt || req.body?.storyboard || "").trim();
    const negative = String(req.body?.negativeExtra || req.body?.negative || "").trim();
    const seconds = Math.max(5, Math.min(20, Number(req.body?.seconds || 10)));
    const quality = req.body?.quality || "720p";

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "missing_prompt" });
    }

    if (!replicate || !process.env.REPLICATE_MODEL) {
      return res.json({
        ok: true,
        note: "demo mode — no real Replicate call",
        payload: { kind: "video", options: { seconds, quality, prompt, negative } },
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
        const finalPrompt = prompt + (negative ? `\nNEGATIVE: ${negative}` : "");

        const prediction = version
          ? await replicate.predictions.create({
              version,
              input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false },
            })
          : await replicate.predictions.create({
              model,
              input: { prompt: finalPrompt, aspect_ratio: "16:9", loop: false },
            });

        let current = prediction;

        while (current.status === "starting" || current.status === "processing") {
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
        try { fs.unlinkSync(file); } catch {}
      }

      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  } catch (err) {
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

app.use(express.static(PUBLIC_DIR, {
  etag: true,
  maxAge: "1h",
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html") || filePath.endsWith("i18n.js")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return;
    }

    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  },
}));

app.get("/", (_req, res) => sendHtml(res, "index.html"));
app.get("/premium", (_req, res) => sendHtml(res, "premium.html"));
app.get("/premium.html", (_req, res) => sendHtml(res, "premium.html"));
app.get("/discover.html", (_req, res) => sendHtml(res, "discover.html"));
app.get("/feed.html", (_req, res) => sendHtml(res, "feed.html"));
app.get("/profile.html", (_req, res) => sendHtml(res, "profile.html"));
app.get("/credits.html", (_req, res) => sendHtml(res, "credits.html"));
app.get("/gen-image.html", (_req, res) => sendHtml(res, "gen-image.html"));
app.get("/gen-video.html", (_req, res) => sendHtml(res, "gen-video.html"));
app.get("/chat.html", (_req, res) => sendHtml(res, "chat.html"));
app.get("/upgrade.html", (_req, res) => sendHtml(res, "upgrade.html"));
app.get("/privacy.html", (_req, res) => sendHtml(res, "privacy.html"));
app.get("/terms.html", (_req, res) => sendHtml(res, "terms.html"));
app.get("/safety.html", (_req, res) => sendHtml(res, "safety.html"));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "api_not_found", path: req.path });
  }

  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The Future PRO v5011 persistent chat running on :" + PORT);
});

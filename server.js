import express from "express";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Replicate from "replicate";

dotenv.config();

const app = express();
const SQLiteStoreSession = SQLiteStore(session);

// 🔑 Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 🔧 Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// 📂 Sesiuni
app.use(
  session({
    store: new SQLiteStoreSession({ db: "sessions.sqlite" }),
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// 🔒 Middleware pentru autentificare
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// 📌 Rute simple
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  req.session.user = { email };
  res.json({ ok: true });
});

app.post("/api/verify-age/mock", requireLogin, (req, res) => {
  req.session.user.ageVerified = true;
  res.json({ ok: true });
});

app.post("/api/subscribe/mock", requireLogin, (req, res) => {
  req.session.user.subscribed = true;
  res.json({ ok: true });
});

// 🖼️ Rute statice
app.use(express.static("public"));

// 🎥 Generare video cu Replicate
app.post("/api/video", requireLogin, async (req, res) => {
  try {
    const prompt = req.body.prompt || "A realistic cinematic scene of a futuristic city at sunset";

    const prediction = await replicate.predictions.create({
      version: "your-model-version-id-here", // <-- aici pui versiunea exactă din Replicate (dream-machine sau ray)
      input: { prompt }
    });

    res.json({ ok: true, prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video generation failed" });
  }
});

// 🚀 Pornire server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import Replicate from "replicate";

const app = express();

// --- Config sesiuni ---
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(express.static("public"));

// --- Middleware pentru verificare login ---
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  next();
}

// --- Middleware pentru verificare vârstă ---
function requireAge(req, res, next) {
  if (!req.session.ageVerified) {
    return res.status(403).json({ error: "Age not verified" });
  }
  next();
}

// --- Middleware pentru verificare abonament ---
function requireSub(req, res, next) {
  if (!req.session.subscribed) {
    return res.status(403).json({ error: "Subscription required" });
  }
  next();
}

// --- Rute login/logout ---
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  req.session.user = { email };
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// --- Mock pentru verificare vârstă ---
app.post("/api/verify-age/mock", requireLogin, (req, res) => {
  req.session.ageVerified = true;
  res.json({ ok: true });
});

// --- Mock pentru abonament ---
app.post("/api/subscribe/mock", requireLogin, (req, res) => {
  req.session.subscribed = true;
  res.json({ ok: true });
});

// --- Replicate setup ---
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// --- Ruta generare video (protejată) ---
app.post("/api/generate-video", requireLogin, requireAge, requireSub, async (req, res) => {
  try {
    const { prompt, negativePrompt, seconds, quality } = req.body;

    const output = await replicate.run(
      "luma/dream-machine:07fe0620ff41e3aa2984670fd4bb417cf07a9e95f9e83b56098e4235b7877e71", // model + versiune
      {
        input: {
          prompt: prompt || "A cinematic landscape",
          negative_prompt: negativePrompt || "",
          seconds: seconds || 10,
          quality: quality || "720p",
        },
      }
    );

    res.json({ ok: true, video: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video generation failed" });
  }
});

// --- Pornire server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

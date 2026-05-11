// public/i18n.js — stable v4003

(function () {

  const CACHE_VERSION = "v4003";

  window.LANG_OPTIONS = [
    ["ro", "🇷🇴 RO"],
    ["en", "🇺🇸 EN"],
    ["fr", "🇫🇷 FR"],
    ["es", "🇪🇸 ES"],
    ["de", "🇩🇪 DE"],
    ["it", "🇮🇹 IT"],
    ["pt", "🇵🇹 PT"],
    ["nl", "🇳🇱 NL"],
    ["tr", "🇹🇷 TR"],
    ["ru", "🇷🇺 RU"],
    ["ar", "🇸🇦 AR"],
    ["zh", "🇨🇳 ZH"]
  ];

  // =========================
  // ENGLISH BASE
  // =========================

  const EN = {
    top_subtitle: "Private AI Universe",
    login: "Login",
    enter_platform: "Enter",
    image_btn: "Try Image Studio",
    member_area: "Open Member Area",
    privacy: "Privacy",
    terms: "Terms",
    safety: "Safety",

    eyebrow: "PRIVATE • CINEMATIC • AI COMPANIONS",

    hero_title:
      "The line between AI and reality no longer exists.",

    hero_text:
      "Create ultra-realistic fictional AI companions, private conversations, cinematic images and interactive experiences inside a premium ecosystem.",

    warning_18: "18+ only",
    fictional_only: "Fictional characters only",
    private_exp: "Private experience",
    no_deepfake: "No real-person deepfakes",

    ava_card_title: "Dark Luxury",

    ava_card_text:
      "Mysterious, cinematic, emotionally adaptive.",

    image_realism: "Image realism",
    image_realism_text: "8K style preview",

    video_scene: "Video scene",
    video_scene_text: "10–20s premium clips",

    explore: "EXPLORE",

    trending_title: "Your private AI universe",

    trending_text:
      "Everything is built for realism, discretion and cinematic experience.",

    online: "online",

    ava_role:
      "Dark Luxury • elegant • mysterious",

    mira_role:
      "Girl Next Door • warm • emotional",

    kira_role:
      "Cyberpunk Muse • confident • magnetic",

    luna_role:
      "Goth Romantic • poetic • intense",

    create: "CREATE",

    multi_title:
      "One platform. Multiple experiences.",

    multi_text:
      "We build the product around the most important areas: chat, image, video and recurring characters.",

    card1_title: "Create AI companions",

    card1_text:
      "Generate fictional characters with name, role, personality, tone and media prices.",

    card2_title: "Private DM-style chat",

    card2_text:
      "Cinematic chat, online status, typing indicator and social app experience.",

    card3_title: "AI Image Studio",

    card3_text:
      "Cinematic prompts, realism, lighting, camera feel and premium preview.",

    card4_title: "AI Video Studio",

    card4_text:
      "Short premium scenes, 5–20 seconds, created for teasing and unlock.",

    premium_access: "PREMIUM ACCESS",

    unlock_title:
      "Unlock your private AI world.",

    unlock_text:
      "Premium AI experience with cinematic characters, private chat and advanced image/video generation."
  };

  // =========================
  // ROMANIAN
  // =========================

  const RO = {
    top_subtitle: "Univers AI privat",
    login: "Autentificare",
    enter_platform: "Intră",
    image_btn: "Încearcă Image Studio",
    member_area: "Deschide zona de membri",
    privacy: "Confidențialitate",
    terms: "Termeni",
    safety: "Siguranță",

    eyebrow:
      "PRIVAT • CINEMATIC • COMPANIONS AI",

    hero_title:
      "Linia dintre AI și realitate nu mai există.",

    hero_text:
      "Creează personaje AI fictive, ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",

    warning_18: "Doar 18+",
    fictional_only: "Doar personaje fictive",
    private_exp: "Experiență privată",
    no_deepfake: "Fără deepfake-uri cu persoane reale",

    ava_card_title: "Lux întunecat",

    ava_card_text:
      "Misterioasă, cinematică, adaptivă emoțional.",

    image_realism: "Realism imagine",
    image_realism_text: "Preview stil 8K",

    video_scene: "Scenă video",
    video_scene_text: "Clipuri premium 10–20s",

    explore: "EXPLOREAZĂ",

    trending_title: "Universul tău privat AI",

    trending_text:
      "Totul este construit pentru realism, discreție și experiență cinematică.",

    online: "online",

    ava_role:
      "Lux întunecat • elegantă • misterioasă",

    mira_role:
      "Fata de alături • caldă • emoțională",

    kira_role:
      "Muză cyberpunk • încrezătoare • magnetică",

    luna_role:
      "Romantic goth • poetică • intensă",

    create: "CREEAZĂ",

    multi_title:
      "O platformă. Mai multe experiențe.",

    multi_text:
      "Construim produsul în jurul celor mai importante zone: chat, imagine, video și personaje recurente.",

    card1_title: "Creează companions AI",

    card1_text:
      "Generează personaje fictive cu nume, rol, personalitate și ton.",

    card2_title: "Chat privat tip DM",

    card2_text:
      "Chat cinematic, status online și experiență tip social app.",

    card3_title: "AI Image Studio",

    card3_text:
      "Prompturi cinematice, realism și preview premium.",

    card4_title: "AI Video Studio",

    card4_text:
      "Scene premium scurte pentru teasing și unlock.",

    premium_access: "ACCES PREMIUM",

    unlock_title:
      "Deblochează lumea ta privată AI.",

    unlock_text:
      "Experiență AI premium cu personaje cinematice, chat privat și generare imagine/video."
  };

  // =========================
  // AUTO LANGS
  // =========================

  const AUTO = {};

  [
    "fr",
    "es",
    "de",
    "it",
    "pt",
    "nl",
    "tr",
    "ru",
    "ar",
    "zh"
  ].forEach(lang => {
    AUTO[lang] = {};
  });

  // =========================

  window.I18N = {
    en: EN,
    ro: Object.assign({}, EN, RO),
    fr: Object.assign({}, EN, AUTO.fr),
    es: Object.assign({}, EN, AUTO.es),
    de: Object.assign({}, EN, AUTO.de),
    it: Object.assign({}, EN, AUTO.it),
    pt: Object.assign({}, EN, AUTO.pt),
    nl: Object.assign({}, EN, AUTO.nl),
    tr: Object.assign({}, EN, AUTO.tr),
    ru: Object.assign({}, EN, AUTO.ru),
    ar: Object.assign({}, EN, AUTO.ar),
    zh: Object.assign({}, EN, AUTO.zh)
  };

  // =========================

  if (!localStorage.getItem("site_lang")) {
    localStorage.setItem("site_lang", "ro");
  }

  window.getLangCode = function () {
    return localStorage.getItem("site_lang") || "ro";
  };

  window.setLang = function (lang) {
    localStorage.setItem("site_lang", lang);
    location.reload();
  };

  function safeBase64(text) {
    try {
      return btoa(unescape(encodeURIComponent(text))).slice(0, 80);
    } catch {
      return String(text).slice(0, 80);
    }
  }

  function cacheKey(lang, text) {
    return (
      "tr_" +
      CACHE_VERSION +
      "*" +
      lang +
      "*" +
      safeBase64(text)
    );
  }

  async function translateViaServer(text, lang) {

    if (!text) return "";

    if (lang === "en") {
      return text;
    }

    const key = cacheKey(lang, text);
    const cached = localStorage.getItem(key);

    if (cached) {
      return cached;
    }

    try {

      const response = await fetch("/api/translate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text,
          target: lang,
          source: "en"
        })
      });

      const data = await response.json();

      if (data.ok && data.translatedText) {

        localStorage.setItem(
          key,
          data.translatedText
        );

        return data.translatedText;
      }

      return text;

    } catch (err) {

      console.warn("translation failed", err);
      return text;
    }
  }

  // =========================

  window.applyTranslations = async function () {

    const lang = window.getLangCode();

    document.documentElement.lang = lang;

    const switcher =
      document.getElementById("langSwitcher");

    if (switcher) {

      switcher.innerHTML = "";

      window.LANG_OPTIONS.forEach(([code, label]) => {

        const opt = document.createElement("option");

        opt.value = code;
        opt.textContent = label;

        switcher.appendChild(opt);
      });

      switcher.value = lang;

      switcher.onchange = function () {
        window.setLang(this.value);
      };
    }

    const elements =
      document.querySelectorAll("[data-i18n]");

    for (const el of elements) {

      const key =
        el.getAttribute("data-i18n");

      const englishText =
        window.I18N.en[key] || key;

      if (lang === "ro") {

        el.textContent =
          window.I18N.ro[key] || englishText;

      } else if (lang === "en") {

        el.textContent = englishText;

      } else {

        el.textContent =
          await translateViaServer(
            englishText,
            lang
          );
      }
    }
  };

  // =========================

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      window.applyTranslations();
    }
  );

})();

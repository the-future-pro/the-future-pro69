(function () {
  const BASE_LANG = "en";
  const CACHE_VERSION = "v2000";

  window.LANG_OPTIONS = [
    ["ro","🇷🇴 RO"],["en","🇺🇸 EN"],["fr","🇫🇷 FR"],["es","🇪🇸 ES"],["de","🇩🇪 DE"],
    ["it","🇮🇹 IT"],["pt","🇵🇹 PT"],["nl","🇳🇱 NL"],["pl","🇵🇱 PL"],["hu","🇭🇺 HU"],
    ["bg","🇧🇬 BG"],["cs","🇨🇿 CZ"],["sk","🇸🇰 SK"],["hr","🇭🇷 HR"],["sr","🇷🇸 SR"],
    ["tr","🇹🇷 TR"],["ru","🇷🇺 RU"],["uk","🇺🇦 UK"],["ar","🇸🇦 AR"],["hi","🇮🇳 HI"],
    ["zh","🇨🇳 ZH"],["ja","🇯🇵 JA"],["ko","🇰🇷 KO"]
  ];

  const EN = {
    lang_name: "English",
    top_subtitle: "Private AI Universe",
    login: "Login",
    enter_platform: "Enter",
    image_btn: "Try Image Studio",
    member_area: "Open Member Area",
    privacy: "Privacy",
    terms: "Terms",
    safety: "Safety",
    logout: "Logout",

    eyebrow: "PRIVATE • CINEMATIC • AI COMPANIONS",
    hero_title: "The line between AI and reality no longer exists.",
    hero_text: "Create ultra-realistic fictional AI companions, private conversations, cinematic images and interactive experiences inside a premium ecosystem.",

    warning_18: "18+ only",
    fictional_only: "Fictional characters only",
    private_exp: "Private experience",
    no_deepfake: "No real-person deepfakes",

    ava_card_title: "Dark Luxury",
    ava_card_text: "Mysterious, cinematic, emotionally adaptive.",
    image_realism: "Image realism",
    image_realism_text: "8K style preview",
    video_scene: "Video scene",
    video_scene_text: "10–20s premium clips",

    explore: "EXPLORE",
    trending_title: "Your private AI universe",
    trending_text: "Everything is built for realism, discretion and cinematic experience.",
    online: "online",

    ava_role: "Dark Luxury • elegant • mysterious",
    mira_role: "Girl Next Door • warm • emotional",
    kira_role: "Cyberpunk Muse • confident • magnetic",
    luna_role: "Goth Romantic • poetic • intense",

    create: "CREATE",
    multi_title: "One platform. Multiple experiences.",
    multi_text: "We build the product around the most important areas: chat, image, video and recurring characters.",

    card1_title: "Create AI companions",
    card1_text: "Generate fictional characters with name, role, personality, tone and media prices.",
    card2_title: "Private DM-style chat",
    card2_text: "Cinematic chat, online status, typing indicator and social app experience.",
    card3_title: "AI Image Studio",
    card3_text: "Cinematic prompts, realism, lighting, camera feel and premium preview.",
    card4_title: "AI Video Studio",
    card4_text: "Short premium scenes, 5–20 seconds, created for teasing and unlock.",

    premium_access: "PREMIUM ACCESS",
    unlock_title: "Unlock your private AI world.",
    unlock_text: "For the MVP, we keep it simple: premium experience, a few strong characters, image/video generation and monetization through subscriptions + credits.",

    age_title: "Age confirmation",
    age_text: "This platform is intended only for adults aged 18 or older.",
    age_confirm: "I confirm I am 18+",
    age_exit: "Exit",

    safety_title: "Safety rules",
    safety_intro: "To keep the platform safe and compliant, you must follow these rules.",
    allowed_title: "Allowed",
    forbidden_title: "Forbidden",

    allowed_1: "Fictional adult AI characters.",
    allowed_2: "Private fantasy roleplay with fictional characters.",
    allowed_3: "Cinematic images and videos generated from fictional prompts.",
    allowed_4: "Consensual adult-themed fictional experiences where legal.",

    forbidden_1: "No minors or young-looking sexualized characters.",
    forbidden_2: "No real people without explicit consent.",
    forbidden_3: "No celebrities, influencers or public figures.",
    forbidden_4: "No non-consensual intimate imagery.",
    forbidden_5: "No revenge, blackmail, harassment or impersonation.",
    forbidden_6: "No real-person deepfakes.",
    forbidden_7: "No illegal, exploitative or abusive content.",
    forbidden_8: "No uploads intended to undress or sexualize real people.",

    safety_checkbox: "I confirm that all characters are fictional, 18+, and I will not generate real-person deepfakes or illegal content.",

    image_studio_title: "AI Image Studio",
    image_studio_text: "Generate fictional, cinematic and realistic AI images. No real people. No minors. No deepfakes.",
    video_studio_title: "AI Video Studio",
    video_studio_text: "Generate short fictional cinematic scenes.",
    chat_title: "Private chat",
    premium_title: "Your private AI experience starts here.",
    choose_plan: "Choose your plan"
  };

  const RO = {
    lang_name: "Română",
    top_subtitle: "Univers AI privat",
    enter_platform: "Intră",
    image_btn: "Încearcă Image Studio",
    member_area: "Deschide zona de membri",
    privacy: "Confidențialitate",
    terms: "Termeni",
    safety: "Siguranță",
    logout: "Ieșire",

    eyebrow: "PRIVAT • CINEMATIC • COMPANIONS AI",
    hero_title: "Linia dintre AI și realitate nu mai există.",
    hero_text: "Creează companions AI fictive, ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",

    warning_18: "Doar 18+",
    fictional_only: "Doar personaje fictive",
    private_exp: "Experiență privată",
    no_deepfake: "Fără deepfake-uri cu persoane reale",

    ava_card_title: "Lux întunecat",
    ava_card_text: "Misterioasă, cinematică, adaptivă emoțional.",
    image_realism: "Realism imagine",
    image_realism_text: "Preview stil 8K",
    video_scene: "Scenă video",
    video_scene_text: "Clipuri premium 10–20s",

    explore: "EXPLOREAZĂ",
    trending_title: "Universul tău privat AI",
    trending_text: "Totul este construit pentru realism, discreție și experiență cinematică.",

    ava_role: "Lux întunecat • elegantă • misterioasă",
    mira_role: "Fata de alături • caldă • emoțională",
    kira_role: "Muză cyberpunk • încrezătoare • magnetică",
    luna_role: "Romantic goth • poetică • intensă",

    create: "CREEAZĂ",
    multi_title: "O platformă. Mai multe experiențe.",
    multi_text: "Construim produsul în jurul celor mai importante zone: chat, imagine, video și personaje recurente.",

    card1_title: "Creează companions AI",
    card1_text: "Generează personaje fictive cu nume, rol, personalitate, ton și prețuri media.",
    card2_title: "Chat privat tip DM",
    card2_text: "Chat cinematic, status online, typing indicator și experiență tip social app.",
    card3_text: "Prompturi cinematice, realism, lumină, cameră și preview premium.",
    card4_text: "Scene scurte premium, 5–20 secunde, create pentru teasing și unlock.",

    premium_access: "ACCES PREMIUM",
    unlock_title: "Deblochează lumea ta privată AI.",
    unlock_text: "Pentru MVP, păstrăm totul simplu: experiență premium, câteva personaje foarte bune, generare imagine/video și monetizare prin abonamente + credite."
  };

  window.I18N = {
    en: EN,
    ro: Object.assign({}, EN, RO)
  };

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
    return "tr_" + CACHE_VERSION + "_" + lang + "_" + safeBase64(text);
  }

  async function translateViaServer(text, lang) {
    if (!text) return "";
    if (lang === BASE_LANG) return text;

    const key = cacheKey(lang, text);
    const cached = localStorage.getItem(key);

    if (cached) return cached;

    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          target: lang,
          source: "en"
        })
      });

      const j = await r.json();

      if (j.ok && j.translatedText) {
        localStorage.setItem(key, j.translatedText);
        return j.translatedText;
      }

      return text;
    } catch (err) {
      console.warn("translation failed", err);
      return text;
    }
  }

  window.t = function (key) {
    const lang = window.getLangCode();
    const local = window.I18N[lang];

    if (local && local[key]) return local[key];
    if (window.I18N.en[key]) return window.I18N.en[key];

    return key;
  };

  window.translateDynamicText = async function (text, targetLang) {
    const lang = targetLang || window.getLangCode();
    return await translateViaServer(text, lang);
  };

  window.applyTranslations = async function () {
    const lang = window.getLangCode();

    document.documentElement.lang = lang;

    const switcher = document.getElementById("langSwitcher");
    if (switcher) {
      switcher.value = lang;
    }

    const elements = document.querySelectorAll("[data-i18n]");

    for (const el of elements) {
      const key = el.getAttribute("data-i18n");
      const local = window.I18N[lang];

      if (local && local[key]) {
        el.textContent = local[key];
      } else {
        const englishText = window.I18N.en[key] || key;
        el.textContent = await translateViaServer(englishText, lang);
      }
    }

    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");

    for (const el of placeholders) {
      const key = el.getAttribute("data-i18n-placeholder");
      const local = window.I18N[lang];

      if (local && local[key]) {
        el.setAttribute("placeholder", local[key]);
      } else {
        const englishText = window.I18N.en[key] || key;
        el.setAttribute("placeholder", await translateViaServer(englishText, lang));
      }
    }
  };
})();

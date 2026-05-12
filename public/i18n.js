// public/i18n.js — stable local translator v4005

(function () {

  const DEFAULT_LANG = "ro";

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
    ["ru", "🇷🇺 RU"]
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

    eyebrow:
      "PRIVATE • CINEMATIC • AI COMPANIONS",

    hero_title:
      "The line between AI and reality no longer exists.",

    hero_text:
      "Create ultra-realistic fictional AI companions, private conversations, cinematic images and interactive experiences inside a premium ecosystem.",

    warning_18:
      "18+ only",

    fictional_only:
      "Fictional characters only",

    private_exp:
      "Private experience",

    no_deepfake:
      "No real-person deepfakes",

    ava_card_title:
      "Dark Luxury",

    ava_card_text:
      "Mysterious, cinematic, emotionally adaptive.",

    image_realism:
      "Image realism",

    image_realism_text:
      "8K style preview",

    video_scene:
      "Video scene",

    video_scene_text:
      "10–20s premium clips",

    explore:
      "EXPLORE",

    trending_title:
      "Your private AI universe",

    trending_text:
      "Everything is built for realism, discretion and cinematic experience.",

    online:
      "online",

    ava_role:
      "Dark Luxury • elegant • mysterious",

    mira_role:
      "Girl Next Door • warm • emotional",

    kira_role:
      "Cyberpunk Muse • confident • magnetic",

    luna_role:
      "Goth Romantic • poetic • intense",

    create:
      "CREATE",

    multi_title:
      "One platform. Multiple experiences.",

    multi_text:
      "We build the product around the most important areas: chat, image, video and recurring characters.",

    card1_title:
      "Create AI companions",

    card1_text:
      "Generate fictional characters with name, role, personality and tone.",

    card2_title:
      "Private DM-style chat",

    card2_text:
      "Cinematic chat, online status and social experience.",

    card3_title:
      "AI Image Studio",

    card3_text:
      "Cinematic prompts, realism and premium preview.",

    card4_title:
      "AI Video Studio",

    card4_text:
      "Short premium scenes for teasing and unlock.",

    premium_access:
      "PREMIUM ACCESS",

    unlock_title:
      "Unlock your private AI world.",

    unlock_text:
      "Premium AI experience with cinematic characters, private chat and image/video generation."
  };

  // =========================
  // ROMANIAN
  // =========================

  const RO = {

    top_subtitle:
      "Univers AI privat",

    login:
      "Autentificare",

    enter_platform:
      "Intră",

    image_btn:
      "Încearcă Image Studio",

    member_area:
      "Deschide zona de membri",

    privacy:
      "Confidențialitate",

    terms:
      "Termeni",

    safety:
      "Siguranță",

    eyebrow:
      "PRIVAT • CINEMATIC • AI COMPANIONS",

    hero_title:
      "Linia dintre AI și realitate nu mai există.",

    hero_text:
      "Creează personaje AI fictive, ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",

    warning_18:
      "Doar 18+",

    fictional_only:
      "Doar personaje fictive",

    private_exp:
      "Experiență privată",

    no_deepfake:
      "Fără deepfake-uri cu persoane reale",

    ava_card_title:
      "Lux întunecat",

    ava_card_text:
      "Misterioasă, cinematică, adaptivă emoțional.",

    image_realism:
      "Realism imagine",

    image_realism_text:
      "Preview stil 8K",

    video_scene:
      "Scenă video",

    video_scene_text:
      "Clipuri premium 10–20s",

    explore:
      "EXPLOREAZĂ",

    trending_title:
      "Universul tău privat AI",

    trending_text:
      "Totul este construit pentru realism, discreție și experiență cinematică.",

    online:
      "online",

    ava_role:
      "Lux întunecat • elegantă • misterioasă",

    mira_role:
      "Fata de alături • caldă • emoțională",

    kira_role:
      "Muză cyberpunk • încrezătoare • magnetică",

    luna_role:
      "Romantic goth • poetică • intensă",

    create:
      "CREEAZĂ",

    multi_title:
      "O platformă. Mai multe experiențe.",

    multi_text:
      "Construim produsul în jurul celor mai importante zone: chat, imagine, video și personaje recurente.",

    card1_title:
      "Creează companions AI",

    card1_text:
      "Generează personaje fictive cu nume, rol, personalitate și ton.",

    card2_title:
      "Chat privat tip DM",

    card2_text:
      "Chat cinematic, status online și experiență socială.",

    card3_title:
      "AI Image Studio",

    card3_text:
      "Prompturi cinematice, realism și preview premium.",

    card4_title:
      "AI Video Studio",

    card4_text:
      "Scene premium scurte pentru teasing și unlock.",

    premium_access:
      "ACCES PREMIUM",

    unlock_title:
      "Deblochează lumea ta privată AI.",

    unlock_text:
      "Experiență AI premium cu personaje cinematice, chat privat și generare imagine/video."
  };

  // =========================
  // SIMPLE LOCAL LANGS
  // =========================

  const FR = {
    login: "Connexion",
    enter_platform: "Entrer",
    image_btn: "Essayer Image Studio",
    member_area: "Ouvrir l'espace membre",
    privacy: "Confidentialité",
    terms: "Conditions",
    safety: "Sécurité",
    explore: "EXPLORER",
    create: "CRÉER",
    online: "en ligne"
  };

  const ES = {
    login: "Iniciar sesión",
    enter_platform: "Entrar",
    image_btn: "Probar Image Studio",
    member_area: "Abrir área premium",
    privacy: "Privacidad",
    terms: "Términos",
    safety: "Seguridad",
    explore: "EXPLORAR",
    create: "CREAR",
    online: "en línea"
  };

  const DE = {
    login: "Anmelden",
    enter_platform: "Betreten",
    image_btn: "Image Studio testen",
    member_area: "Mitgliederbereich öffnen",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    safety: "Sicherheit",
    explore: "ENTDECKEN",
    create: "ERSTELLEN",
    online: "online"
  };

  const IT = {
    login: "Accesso",
    enter_platform: "Entra",
    image_btn: "Prova Image Studio",
    member_area: "Apri area membri",
    privacy: "Privacy",
    terms: "Termini",
    safety: "Sicurezza",
    explore: "ESPLORA",
    create: "CREA",
    online: "online"
  };

  const PT = {
    login: "Entrar",
    enter_platform: "Acessar",
    image_btn: "Experimentar Image Studio",
    member_area: "Abrir área premium",
    privacy: "Privacidade",
    terms: "Termos",
    safety: "Segurança",
    explore: "EXPLORAR",
    create: "CRIAR",
    online: "online"
  };

  const NL = {
    login: "Inloggen",
    enter_platform: "Openen",
    image_btn: "Probeer Image Studio",
    member_area: "Open ledenruimte",
    privacy: "Privacy",
    terms: "Voorwaarden",
    safety: "Veiligheid",
    explore: "ONTDEK",
    create: "MAKEN",
    online: "online"
  };

  const TR = {
    login: "Giriş",
    enter_platform: "Gir",
    image_btn: "Image Studio Dene",
    member_area: "Üye alanını aç",
    privacy: "Gizlilik",
    terms: "Şartlar",
    safety: "Güvenlik",
    explore: "KEŞFET",
    create: "OLUŞTUR",
    online: "çevrimiçi"
  };

  const RU = {
    login: "Войти",
    enter_platform: "Открыть",
    image_btn: "Попробовать Image Studio",
    member_area: "Открыть премиум",
    privacy: "Конфиденциальность",
    terms: "Условия",
    safety: "Безопасность",
    explore: "ИССЛЕДОВАТЬ",
    create: "СОЗДАТЬ",
    online: "онлайн"
  };

  // =========================

  window.I18N = {
    en: EN,
    ro: Object.assign({}, EN, RO),
    fr: Object.assign({}, EN, FR),
    es: Object.assign({}, EN, ES),
    de: Object.assign({}, EN, DE),
    it: Object.assign({}, EN, IT),
    pt: Object.assign({}, EN, PT),
    nl: Object.assign({}, EN, NL),
    tr: Object.assign({}, EN, TR),
    ru: Object.assign({}, EN, RU)
  };

  // =========================

  if (!localStorage.getItem("site_lang")) {
    localStorage.setItem("site_lang", DEFAULT_LANG);
  }

  function getLangCode() {
    return localStorage.getItem("site_lang") || DEFAULT_LANG;
  }

  window.getLangCode = getLangCode;

  window.setLang = function (lang) {
    localStorage.setItem("site_lang", lang);
    location.reload();
  };

  // =========================

  window.applyTranslations = function () {

    const lang = getLangCode();

    document.documentElement.lang = lang;

    const switcher =
      document.getElementById("langSwitcher");

    if (switcher) {

      switcher.innerHTML = "";

      window.LANG_OPTIONS.forEach(
        function ([code, label]) {

          const opt =
            document.createElement("option");

          opt.value = code;
          opt.textContent = label;

          switcher.appendChild(opt);
        }
      );

      switcher.value = lang;

      switcher.onchange = function () {
        window.setLang(this.value);
      };
    }

    const local =
      window.I18N[lang] || EN;

    document
      .querySelectorAll("[data-i18n]")
      .forEach(function (el) {

        const key =
          el.getAttribute("data-i18n");

        if (local[key]) {
          el.textContent = local[key];
        }
      });
  };

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      window.applyTranslations();
    }
  );

})();

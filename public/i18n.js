// public/i18n.js — The Future PRO — stable local translator v4006

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

  const EN = {
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
    card1_text: "Generate fictional characters with name, role, personality and tone.",
    card2_title: "Private DM-style chat",
    card2_text: "Cinematic chat, online status and social experience.",
    card3_title: "AI Image Studio",
    card3_text: "Cinematic prompts, realism and premium preview.",
    card4_title: "AI Video Studio",
    card4_text: "Short premium scenes for teasing and unlock.",

    premium_access: "PREMIUM ACCESS",
    premium_title: "Your private AI experience starts here.",
    unlock_title: "Unlock your private AI world.",
    unlock_text: "Premium AI experience with cinematic characters, private chat and image/video generation.",
    choose_plan: "Choose your plan",

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

    loading: "Loading...",
    generating: "Generating...",
    send: "Send",
    prompt: "Prompt",
    negative_prompt: "Extra style / negative prompt",
    quality: "Quality",
    seconds: "Seconds",
    unlock: "Unlock",
    credits: "credits",
    subscription_required: "Subscription required",
    login_required: "Login required",

    chat_empty: "Choose a companion from Premium or start the conversation.",
    typing: "AI is typing...",
    chat_placeholder: "Write a message...",
    generate_teaser: "Generate teaser"
  };

  const RO = {
    top_subtitle: "Univers AI privat",
    login: "Autentificare",
    enter_platform: "Intră",
    image_btn: "Încearcă Image Studio",
    member_area: "Deschide zona de membri",
    privacy: "Confidențialitate",
    terms: "Termeni",
    safety: "Siguranță",
    logout: "Ieșire",

    eyebrow: "PRIVAT • CINEMATIC • AI COMPANIONS",
    hero_title: "Linia dintre AI și realitate nu mai există.",
    hero_text: "Creează personaje AI fictive, ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",

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
    online: "online",

    ava_role: "Lux întunecat • elegantă • misterioasă",
    mira_role: "Fata de alături • caldă • emoțională",
    kira_role: "Muză cyberpunk • încrezătoare • magnetică",
    luna_role: "Romantic goth • poetică • intensă",

    create: "CREEAZĂ",
    multi_title: "O platformă. Mai multe experiențe.",
    multi_text: "Construim produsul în jurul celor mai importante zone: chat, imagine, video și personaje recurente.",

    card1_title: "Creează companions AI",
    card1_text: "Generează personaje fictive cu nume, rol, personalitate și ton.",
    card2_title: "Chat privat tip DM",
    card2_text: "Chat cinematic, status online și experiență socială.",
    card3_title: "AI Image Studio",
    card3_text: "Prompturi cinematice, realism și preview premium.",
    card4_title: "AI Video Studio",
    card4_text: "Scene premium scurte pentru teasing și unlock.",

    premium_access: "ACCES PREMIUM",
    premium_title: "Experiența ta AI privată începe aici.",
    unlock_title: "Deblochează lumea ta privată AI.",
    unlock_text: "Experiență AI premium cu personaje cinematice, chat privat și generare imagine/video.",
    choose_plan: "Alege planul",

    age_title: "Confirmare vârstă",
    age_text: "Această platformă este destinată exclusiv adulților de minimum 18 ani.",
    age_confirm: "Confirm că am 18+",
    age_exit: "Ieșire",

    safety_title: "Reguli de siguranță",
    safety_intro: "Pentru ca platforma să rămână sigură și conformă, trebuie respectate aceste reguli.",
    allowed_title: "Permis",
    forbidden_title: "Interzis",
    allowed_1: "Personaje AI fictive adulte.",
    allowed_2: "Roleplay privat cu personaje fictive.",
    allowed_3: "Imagini și videoclipuri cinematice generate din prompturi fictive.",
    allowed_4: "Experiențe fictive adulte consensuale, acolo unde este legal.",
    forbidden_1: "Fără minori sau personaje sexualizate care par minore.",
    forbidden_2: "Fără persoane reale fără consimțământ explicit.",
    forbidden_3: "Fără celebrități, influenceri sau persoane publice.",
    forbidden_4: "Fără imagini intime neconsensuale.",
    forbidden_5: "Fără răzbunare, șantaj, hărțuire sau impersonare.",
    forbidden_6: "Fără deepfake-uri cu persoane reale.",
    forbidden_7: "Fără conținut ilegal, exploatator sau abuziv.",
    forbidden_8: "Fără upload-uri destinate dezbrăcării sau sexualizării persoanelor reale.",
    safety_checkbox: "Confirm că toate personajele sunt fictive, 18+, și nu voi genera deepfake-uri cu persoane reale sau conținut ilegal.",

    image_studio_title: "AI Image Studio",
    image_studio_text: "Generează imagini AI fictive, cinematice și realiste. Fără persoane reale. Fără minori. Fără deepfake-uri.",
    video_studio_title: "AI Video Studio",
    video_studio_text: "Generează scene scurte fictive și cinematice.",
    chat_title: "Chat privat",

    loading: "Se încarcă...",
    generating: "Se generează...",
    send: "Trimite",
    prompt: "Prompt",
    negative_prompt: "Extra stil / negative prompt",
    quality: "Calitate",
    seconds: "Secunde",
    unlock: "Deblochează",
    credits: "credite",
    subscription_required: "Abonament necesar",
    login_required: "Autentificare necesară",

    chat_empty: "Alege un companion din Premium sau începe conversația.",
    typing: "AI scrie...",
    chat_placeholder: "Scrie un mesaj...",
    generate_teaser: "Generează teaser"
  };

  const FR = {
    login: "Connexion",
    enter_platform: "Entrer",
    image_btn: "Essayer Image Studio",
    member_area: "Ouvrir l’espace membre",
    privacy: "Confidentialité",
    terms: "Conditions",
    safety: "Sécurité",
    explore: "EXPLORER",
    create: "CRÉER",
    online: "en ligne",
    premium_access: "ACCÈS PREMIUM",
    premium_title: "Votre expérience IA privée commence ici.",
    choose_plan: "Choisissez votre plan",
    chat_title: "Chat privé",
    send: "Envoyer",
    chat_empty: "Choisissez un compagnon depuis Premium ou commencez la conversation.",
    typing: "L’IA écrit...",
    chat_placeholder: "Écrivez un message...",
    generate_teaser: "Générer un teaser"
  };

  const ES = {
    login: "Iniciar sesión",
    enter_platform: "Entrar",
    image_btn: "Probar Image Studio",
    member_area: "Abrir área de miembros",
    privacy: "Privacidad",
    terms: "Términos",
    safety: "Seguridad",
    explore: "EXPLORAR",
    create: "CREAR",
    online: "en línea",
    premium_access: "ACCESO PREMIUM",
    premium_title: "Tu experiencia privada de IA empieza aquí.",
    choose_plan: "Elige tu plan",
    chat_title: "Chat privado",
    send: "Enviar",
    chat_empty: "Elige un companion desde Premium o empieza la conversación.",
    typing: "La IA está escribiendo...",
    chat_placeholder: "Escribe un mensaje...",
    generate_teaser: "Generar teaser"
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
    online: "online",
    premium_access: "PREMIUM-ZUGANG",
    premium_title: "Dein privates KI-Erlebnis beginnt hier.",
    choose_plan: "Plan wählen",
    chat_title: "Privater Chat",
    send: "Senden",
    chat_empty: "Wähle einen Companion aus Premium oder beginne das Gespräch.",
    typing: "KI schreibt...",
    chat_placeholder: "Nachricht schreiben...",
    generate_teaser: "Teaser generieren"
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
    online: "online",
    premium_access: "ACCESSO PREMIUM",
    premium_title: "La tua esperienza IA privata inizia qui.",
    choose_plan: "Scegli il piano",
    chat_title: "Chat privata",
    send: "Invia",
    chat_empty: "Scegli un companion da Premium o inizia la conversazione.",
    typing: "L’IA sta scrivendo...",
    chat_placeholder: "Scrivi un messaggio...",
    generate_teaser: "Genera teaser"
  };

  const PT = {
    login: "Entrar",
    enter_platform: "Acessar",
    image_btn: "Experimentar Image Studio",
    member_area: "Abrir área de membros",
    privacy: "Privacidade",
    terms: "Termos",
    safety: "Segurança",
    explore: "EXPLORAR",
    create: "CRIAR",
    online: "online",
    premium_access: "ACESSO PREMIUM",
    premium_title: "A sua experiência privada de IA começa aqui.",
    choose_plan: "Escolha o plano",
    chat_title: "Chat privado",
    send: "Enviar",
    chat_empty: "Escolha um companion no Premium ou comece a conversa.",
    typing: "A IA está escrevendo...",
    chat_placeholder: "Escreva uma mensagem...",
    generate_teaser: "Gerar teaser"
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
    online: "online",
    premium_access: "PREMIUM TOEGANG",
    premium_title: "Je privé AI-ervaring begint hier.",
    choose_plan: "Kies je plan",
    chat_title: "Privéchat",
    send: "Versturen",
    chat_empty: "Kies een companion via Premium of start het gesprek.",
    typing: "AI typt...",
    chat_placeholder: "Schrijf een bericht...",
    generate_teaser: "Teaser genereren"
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
    online: "çevrimiçi",
    premium_access: "PREMIUM ERİŞİM",
    premium_title: "Özel AI deneyimin burada başlar.",
    choose_plan: "Planını seç",
    chat_title: "Özel sohbet",
    send: "Gönder",
    chat_empty: "Premium’dan bir companion seç veya sohbeti başlat.",
    typing: "AI yazıyor...",
    chat_placeholder: "Bir mesaj yaz...",
    generate_teaser: "Teaser oluştur"
  };

  const RU = {
    login: "Войти",
    enter_platform: "Открыть",
    image_btn: "Попробовать Image Studio",
    member_area: "Открыть зону участников",
    privacy: "Конфиденциальность",
    terms: "Условия",
    safety: "Безопасность",
    explore: "ИССЛЕДОВАТЬ",
    create: "СОЗДАТЬ",
    online: "онлайн",
    premium_access: "ПРЕМИУМ ДОСТУП",
    premium_title: "Ваш приватный AI-опыт начинается здесь.",
    choose_plan: "Выберите план",
    chat_title: "Приватный чат",
    send: "Отправить",
    chat_empty: "Выберите companion в Premium или начните разговор.",
    typing: "AI печатает...",
    chat_placeholder: "Напишите сообщение...",
    generate_teaser: "Создать тизер"
  };

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

  function normalizeLang(lang) {
    const clean = String(lang || DEFAULT_LANG).toLowerCase().trim();
    return window.I18N[clean] ? clean : DEFAULT_LANG;
  }

  if (!localStorage.getItem("site_lang")) {
    localStorage.setItem("site_lang", DEFAULT_LANG);
  }

  window.getLangCode = function () {
    return normalizeLang(localStorage.getItem("site_lang"));
  };

  window.setLang = function (lang) {
    localStorage.setItem("site_lang", normalizeLang(lang));
    location.reload();
  };

  window.t = function (key) {
    const lang = window.getLangCode();
    const local = window.I18N[lang] || EN;
    return local[key] || EN[key] || key;
  };

  window.applyTranslations = function () {
    const lang = window.getLangCode();
    const local = window.I18N[lang] || EN;

    document.documentElement.lang = lang;

    const switcher = document.getElementById("langSwitcher");

    if (switcher) {
      switcher.innerHTML = "";

      window.LANG_OPTIONS.forEach(function ([code, label]) {
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

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (local[key] || EN[key]) {
        el.textContent = local[key] || EN[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      if (local[key] || EN[key]) {
        el.setAttribute("placeholder", local[key] || EN[key]);
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-title");
      if (local[key] || EN[key]) {
        el.setAttribute("title", local[key] || EN[key]);
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-aria-label");
      if (local[key] || EN[key]) {
        el.setAttribute("aria-label", local[key] || EN[key]);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.applyTranslations();
  });
})();

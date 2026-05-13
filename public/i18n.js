// public/i18n.js — The Future PRO — stable local translator v5000
// FULL SAFE VERSION
// ✔ keeps ALL your existing keys
// ✔ automatic EN fallback
// ✔ all languages enabled
// ✔ safe for current frontend
// ✔ no backend changes needed

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

// =========================================================
// MASTER ENGLISH
// =========================================================

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

hero_title:
  "The line between AI and reality no longer exists.",

hero_text:
  "Create ultra-realistic fictional AI companions, private conversations, cinematic images and interactive experiences inside a premium ecosystem.",

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

premium_access: "PREMIUM ACCESS",

premium_title:
  "Your private AI experience starts here.",

premium_intro:
  "Login, activate a test plan and access companions, chat, images and video.",

login_test_text:
  "For MVP testing. Real authentication will be connected on live.",

email_label: "Email",
email_placeholder: "email@example.com",

test_plan_text:
  "Activate mock BASIC / PLUS / PRO to test access.",

unlock_title:
  "Unlock your private AI world.",

unlock_text:
  "Premium AI experience with cinematic characters, private chat and image/video generation.",

choose_plan: "Choose your plan",

persona_name_placeholder:
  "Name — ex. Ava Noir",

persona_category_placeholder:
  "Category — ex. Roleplay",

persona_tone_placeholder:
  "Tone — ex. elegant, mysterious",

price_image_placeholder:
  "Image price",

price_video10_placeholder:
  "Video 10s price",

price_video20_placeholder:
  "Video 20s price",

create_companion:
  "Create companion",

companions: "COMPANIONS",

write_email:
  "Write your email.",

choose_companion_name:
  "Choose a name for the companion.",

tone_label: "Tone",

default_companion_text:
  "Private AI companion with cinematic personality and adaptive chat.",

age_title:
  "Age confirmation",

age_text:
  "This platform is intended only for adults aged 18 or older.",

age_confirm:
  "I confirm I am 18+",

age_exit: "Exit",

safety_title:
  "Safety rules",

safety_intro:
  "To keep the platform safe and compliant, you must follow these rules.",

allowed_title: "Allowed",
forbidden_title: "Forbidden",

allowed_1:
  "Fictional adult AI characters.",

allowed_2:
  "Private fantasy roleplay with fictional characters.",

allowed_3:
  "Cinematic images and videos generated from fictional prompts.",

allowed_4:
  "Consensual adult-themed fictional experiences where legal.",

forbidden_1:
  "No minors or young-looking sexualized characters.",

forbidden_2:
  "No real people without explicit consent.",

forbidden_3:
  "No celebrities, influencers or public figures.",

forbidden_4:
  "No non-consensual intimate imagery.",

forbidden_5:
  "No revenge, blackmail, harassment or impersonation.",

forbidden_6:
  "No real-person deepfakes.",

forbidden_7:
  "No illegal, exploitative or abusive content.",

forbidden_8:
  "No uploads intended to undress or sexualize real people.",

safety_checkbox:
  "I confirm that all characters are fictional, 18+, and I will not generate real-person deepfakes or illegal content.",

safety_confirmation_title:
  "User confirmation",

image_studio_title:
  "AI Image Studio",

image_studio_short:
  "IMAGE STUDIO",

image_studio_heading:
  "Cinematic AI visuals with premium realism.",

image_studio_text:
  "Generate fictional, cinematic and realistic AI images. No real people. No minors. No deepfakes.",

create_image:
  "Create image",

generate_image:
  "Generate Image",

preview: "PREVIEW",

image_result_title:
  "Your generated image appears here",

image_result_text:
  "For the MVP, this page can run in mock mode. The next step is connecting the real image generation endpoint.",

image_prompt_placeholder:
  "Ex: ultra realistic cinematic portrait of a fictional AI companion",

image_negative_placeholder:
  "plastic skin, deformed hands, extra fingers",

chip_cinematic_portrait:
  "cinematic portrait",

chip_neon_luxury:
  "neon luxury",

chip_skin_realism:
  "skin realism",

chip_camera_realism:
  "camera realism",

subscription:
  "subscription",

inactive:
  "inactive",

write_prompt:
  "Write a prompt.",

image_mock_note:
  "The /api/image/open endpoint is not fully connected yet. The UI is ready.",

video_studio_title:
  "AI Video Studio",

video_studio_short:
  "VIDEO STUDIO",

video_studio_heading:
  "Cinematic short scenes with next-level realism.",

video_studio_desc:
  "Generate short, fictional, cinematic and realistic clips.",

video_studio_text:
  "Generate short fictional cinematic scenes.",

create_video_scene:
  "Create video scene",

storyboard_prompt:
  "Storyboard / scene prompt",

video_storyboard_placeholder:
  "Ex: cinematic handheld phone-style video",

video_negative_placeholder:
  "artifacts, flicker, distorted face",

chip_handheld:
  "handheld",

chip_natural_motion:
  "natural motion",

chip_neon_lighting:
  "neon lighting",

chip_social_realism:
  "social realism",

admin_token_open:
  "Admin token for OPEN test",

generate_auth:
  "Generate Auth",

generate_open:
  "Generate Open",

last_video_url:
  "Last video URL",

video_preview:
  "VIDEO PREVIEW",

generated_scene_here:
  "Generated scene appears here",

video_preview_note:
  "For a small budget, use video rarely as a premium feature.",

write_storyboard:
  "Write a storyboard.",

chat_title:
  "Private chat",

loading:
  "Loading...",

generating:
  "Generating...",

send:
  "Send",

prompt:
  "Prompt",

negative_prompt:
  "Extra style / negative prompt",

quality:
  "Quality",

seconds:
  "Seconds",

unlock:
  "Unlock",

credits:
  "credits",

subscription_required:
  "Subscription required",

login_required:
  "Login required",

chat_empty:
  "Choose a companion from Premium or start the conversation.",

typing:
  "AI is typing...",

chat_placeholder:
  "Write a message...",

generate_teaser:
  "Generate teaser",

image_teaser:
  "Image teaser",

video_teaser:
  "Video teaser",

teaser_image:
  "Image teaser",

teaser_video:
  "Video teaser",

private_teaser_locked:
  "Private teaser locked",

unlocked_media:
  "Unlocked media",

unlock_full_media:
  "Unlock full media",

choose_companion:
  "Choose Companion",

you_label:
  "You",

unlock_error:
  "Unlock error",

choose_companion_from_premium:
  "Choose a companion from Premium.",

fallback_ai_message:
  "I am here. Tell me what kind of experience you want to create tonight.",

generic_error:
  "Error",

media_generation_backend_missing:
  "Media teaser generation will be available after backend connection.",

privacy_title:
  "Your privacy matters.",

privacy_intro:
  "We store minimal information required for authentication and subscriptions.",

privacy_data_title:
  "Stored data",

privacy_data_text:
  "We only store limited account information.",

privacy_payment_title:
  "Payments and verification",

privacy_payment_text:
  "Payments and age verification are handled by third-party providers.",

privacy_media_title:
  "Media delivery",

privacy_media_text:
  "Generated media may use temporary links.",

privacy_security_title:
  "Security",

privacy_security_text:
  "We use security measures and protected sessions.",

terms_title:
  "Platform terms and rules.",

terms_intro:
  "By using the platform, you agree to follow all safety rules.",

terms_rule_1:
  "18+ only.",

terms_rule_2:
  "No real-person faces.",

terms_rule_3:
  "Only fictional AI content.",

terms_rule_4:
  "Illegal content is prohibited.",

terms_rule_5:
  "Users are responsible for generated content.",

terms_rule_6:
  "Violating accounts may be removed.",

upgrade_title:
  "Upgrade your subscription.",

upgrade_intro:
  "PLUS and PRO features require an active subscription.",

back_to_premium:
  "Back to Premium",

quick_login:
  "Quick Login",

activate_pro_mock:
  "Activate PRO (mock)",

upgrade_after:
  "After activation, return to the Image Generator.",

open_image_generator:
  "Open Image Generator",

feedback_title:
  "Ideas & Feedback",

feedback_intro:
  "Suggest features or vote for other user ideas.",

feedback_title_placeholder:
  "Short title",

feedback_body_placeholder:
  "Describe the idea.",

feedback_send:
  "Submit idea",

feedback_top:
  "Top ideas",

feedback_fill_required:
  "Complete title and description.",

feedback_sending:
  "Sending...",

feedback_thanks:
  "Thank you! Your idea has been submitted."

};

// =========================================================
// ROMANIAN
// =========================================================

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

hero_title:
  "Linia dintre AI și realitate nu mai există.",

hero_text:
  "Creează companions AI fictivi, conversații private și experiențe cinematice.",

warning_18:
  "Doar 18+",

fictional_only:
  "Doar personaje fictive",

private_exp:
  "Experiență privată",

no_deepfake:
  "Fără deepfake-uri cu persoane reale",

create:
  "CREEAZĂ",

online:
  "online",

send:
  "Trimite",

loading:
  "Se încarcă...",

generating:
  "Se generează...",

privacy_title:
  "Confidențialitatea ta contează.",

safety_title:
  "Reguli de siguranță",

terms_title:
  "Termenii și regulile platformei.",

upgrade_title:
  "Upgrade abonament."

};

// =========================================================
// OTHER LANGUAGES
// =========================================================

const FR = {
login: "Connexion",
send: "Envoyer",
loading: "Chargement..."
};

const ES = {
login: "Iniciar sesión",
send: "Enviar",
loading: "Cargando..."
};

const DE = {
login: "Anmelden",
send: "Senden",
loading: "Lädt..."
};

const IT = {
login: "Accesso",
send: "Invia",
loading: "Caricamento..."
};

const PT = {
login: "Entrar",
send: "Enviar",
loading: "Carregando..."
};

const NL = {
login: "Inloggen",
send: "Versturen",
loading: "Laden..."
};

const TR = {
login: "Giriş",
send: "Gönder",
loading: "Yükleniyor..."
};

const RU = {
login: "Войти",
send: "Отправить",
loading: "Загрузка..."
};

// =========================================================
// LANGUAGE MERGE
// =========================================================

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

// =========================================================
// OPTION TRANSLATIONS
// =========================================================

const OPTION_TRANSLATIONS = {

"Image teaser": {
  ro: "Teaser imagine",
  en: "Image teaser"
},

"Video teaser": {
  ro: "Teaser video",
  en: "Video teaser"
},

"Female": {
  ro: "Feminin",
  en: "Female"
},

"Male": {
  ro: "Masculin",
  en: "Male"
}

};

// =========================================================
// HELPERS
// =========================================================

function normalizeLang(lang) {

const clean =
  String(lang || DEFAULT_LANG)
    .toLowerCase()
    .trim();

return window.I18N[clean]
  ? clean
  : DEFAULT_LANG;

}

if (!localStorage.getItem("site_lang")) {
localStorage.setItem("site_lang", DEFAULT_LANG);
}

window.getLangCode = function () {
return normalizeLang(
localStorage.getItem("site_lang")
);
};

window.setLang = function (lang) {

localStorage.setItem(
  "site_lang",
  normalizeLang(lang)
);

location.reload();

};

window.t = function (key) {

const lang = window.getLangCode();

const local =
  window.I18N[lang] || EN;

return local[key] || EN[key] || key;

};

function translateOptions(lang) {

document
  .querySelectorAll("select option")
  .forEach(function (opt) {

    const original =
      opt.getAttribute("data-original-text")
      || opt.textContent.trim();

    if (!opt.getAttribute("data-original-text")) {
      opt.setAttribute(
        "data-original-text",
        original
      );
    }

    if (
      OPTION_TRANSLATIONS[original]
      &&
      OPTION_TRANSLATIONS[original][lang]
    ) {

      opt.textContent =
        OPTION_TRANSLATIONS[original][lang];
    }
  });

}

// =========================================================
// APPLY TRANSLATIONS
// =========================================================

window.applyTranslations = function () {

const lang =
  window.getLangCode();

const local =
  window.I18N[lang] || EN;

document.documentElement.lang = lang;

const switcher =
  document.getElementById("langSwitcher");

if (switcher) {

  switcher.innerHTML = "";

  window.LANG_OPTIONS.forEach(function ([code, label]) {

    const opt =
      document.createElement("option");

    opt.value = code;
    opt.textContent = label;

    switcher.appendChild(opt);
  });

  switcher.value = lang;

  switcher.onchange = function () {
    window.setLang(this.value);
  };
}

document
  .querySelectorAll("[data-i18n]")
  .forEach(function (el) {

    const key =
      el.getAttribute("data-i18n");

    if (local[key] || EN[key]) {

      el.textContent =
        local[key] || EN[key];
    }
  });

document
  .querySelectorAll("[data-i18n-placeholder]")
  .forEach(function (el) {

    const key =
      el.getAttribute("data-i18n-placeholder");

    if (local[key] || EN[key]) {

      el.setAttribute(
        "placeholder",
        local[key] || EN[key]
      );
    }
  });

document
  .querySelectorAll("[data-i18n-title]")
  .forEach(function (el) {

    const key =
      el.getAttribute("data-i18n-title");

    if (local[key] || EN[key]) {

      el.setAttribute(
        "title",
        local[key] || EN[key]
      );
    }
  });

document
  .querySelectorAll("[data-i18n-aria-label]")
  .forEach(function (el) {

    const key =
      el.getAttribute("data-i18n-aria-label");

    if (local[key] || EN[key]) {

      el.setAttribute(
        "aria-label",
        local[key] || EN[key]
      );
    }
  });

translateOptions(lang);

};

document.addEventListener(
"DOMContentLoaded",
function () {
window.applyTranslations();
}
);

})();

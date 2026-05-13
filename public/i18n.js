// public/i18n.js — The Future PRO — Auto Translate Engine v1

(function () {

const DEFAULT_LANG = "ro";

// =========================================================
// LANGUAGES
// =========================================================

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
// STATIC FALLBACK ONLY
// =========================================================

const STATIC = {

ro: {

login: "Autentificare",
logout: "Ieșire",

loading: "Se încarcă...",
generating: "Se generează...",

send: "Trimite",

privacy: "Confidențialitate",
terms: "Termeni",
safety: "Siguranță",

subscription_required: "Abonament necesar",
login_required: "Autentificare necesară",

chat_placeholder: "Scrie un mesaj...",

image_btn: "Încearcă Image Studio",

member_area: "Deschide zona de membri",

create_image: "Creează imagine",
generate_image: "Generează imagine",

create_video_scene: "Creează scenă video",

upgrade_title: "Upgrade abonament",

feedback_title: "Idei & Feedback"

},

en: {}

};

// =========================================================
// HELPERS
// =========================================================

function normalizeLang(lang) {

const clean =
String(lang || DEFAULT_LANG)
.toLowerCase()
.trim();

const allowed =
window.LANG_OPTIONS.map(function (x) {
return x[0];
});

return allowed.includes(clean)
? clean
: DEFAULT_LANG;

}

if (!localStorage.getItem("site_lang")) {

localStorage.setItem(
"site_lang",
DEFAULT_LANG
);

}

// =========================================================
// GET CURRENT LANG
// =========================================================

window.getLangCode = function () {

return normalizeLang(
localStorage.getItem("site_lang")
);

};

// =========================================================
// SET LANGUAGE
// =========================================================

window.setLang = function (lang) {

localStorage.setItem(
"site_lang",
normalizeLang(lang)
);

location.reload();

};

// =========================================================
// STATIC TRANSLATION
// =========================================================

window.t = function (key) {

const lang =
window.getLangCode();

return (
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key]
||
key
);

};

// =========================================================
// LANGUAGE SWITCHER
// =========================================================

function setupLangSwitcher() {

const switcher =
document.getElementById(
"langSwitcher"
);

if (!switcher) return;

switcher.innerHTML = "";

window.LANG_OPTIONS.forEach(
function ([code, label]) {

const opt =
document.createElement(
"option"
);

opt.value = code;
opt.textContent = label;

switcher.appendChild(opt);

}
);

switcher.value =
window.getLangCode();

switcher.onchange =
function () {

window.setLang(
this.value
);

};

}

// =========================================================
// APPLY STATIC KEYS
// =========================================================

function applyStaticKeys() {

const lang =
window.getLangCode();

document.documentElement.lang =
lang;

// -------------------------------------
// textContent
// -------------------------------------

document
.querySelectorAll("[data-i18n]")
.forEach(function (el) {

const key =
el.getAttribute(
"data-i18n"
);

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {
el.textContent = value;
}

});

// -------------------------------------
// placeholders
// -------------------------------------

document
.querySelectorAll(
"[data-i18n-placeholder]"
)
.forEach(function (el) {

const key =
el.getAttribute(
"data-i18n-placeholder"
);

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {

el.setAttribute(
"placeholder",
value
);

}

});

// -------------------------------------
// title
// -------------------------------------

document
.querySelectorAll(
"[data-i18n-title]"
)
.forEach(function (el) {

const key =
el.getAttribute(
"data-i18n-title"
);

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {

el.setAttribute(
"title",
value
);

}

});

// -------------------------------------
// aria-label
// -------------------------------------

document
.querySelectorAll(
"[data-i18n-aria-label]"
)
.forEach(function (el) {

const key =
el.getAttribute(
"data-i18n-aria-label"
);

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {

el.setAttribute(
"aria-label",
value
);

}

});

}

// =========================================================
// AUTO TRANSLATE ENGINE PLACEHOLDER
// =========================================================

window.autoTranslatePage =
async function () {

console.log(
"[i18n] Auto translate engine loaded."
);

};

// =========================================================
// MAIN APPLY
// =========================================================

window.applyTranslations =
async function () {

setupLangSwitcher();

applyStaticKeys();

await window.autoTranslatePage();

};

// =========================================================
// INIT
// =========================================================

document.addEventListener(
"DOMContentLoaded",
function () {

window.applyTranslations();

}
);

})();

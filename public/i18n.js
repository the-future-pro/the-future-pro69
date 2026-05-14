// public/i18n.js — The Future PRO — Auto Translate Engine v3
// Safe scanner: detects page texts, skips JSON/code/debug, no visible [LANG] prefixes

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

function setupLangSwitcher() {

const switcher =
document.getElementById("langSwitcher");

if (!switcher) return;

switcher.innerHTML = "";

window.LANG_OPTIONS.forEach(function ([code, label]) {

const opt =
document.createElement("option");

opt.value = code;
opt.textContent = label;

switcher.appendChild(opt);

});

switcher.value =
window.getLangCode();

switcher.onchange = function () {
window.setLang(this.value);
};

}

function applyStaticKeys() {

const lang =
window.getLangCode();

document.documentElement.lang = lang;

document.querySelectorAll("[data-i18n]").forEach(function (el) {

const key =
el.getAttribute("data-i18n");

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {
el.textContent = value;
}

});

document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {

const key =
el.getAttribute("data-i18n-placeholder");

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {
el.setAttribute("placeholder", value);
}

});

document.querySelectorAll("[data-i18n-title]").forEach(function (el) {

const key =
el.getAttribute("data-i18n-title");

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {
el.setAttribute("title", value);
}

});

document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {

const key =
el.getAttribute("data-i18n-aria-label");

const value =
STATIC?.[lang]?.[key]
||
STATIC?.en?.[key];

if (value) {
el.setAttribute("aria-label", value);
}

});

}

function shouldSkipElement(el) {

if (!el) return true;

if (el.closest("[data-no-translate]")) {
return true;
}

const tag =
el.tagName;

if ([
"SCRIPT",
"STYLE",
"NOSCRIPT",
"TEXTAREA",
"CODE",
"PRE",
"INPUT",
"SELECT",
"OPTION",
"JSON-VIEWER"
].includes(tag)) {
return true;
}

const cls =
(el.className || "")
.toString()
.toLowerCase();

const id =
(el.id || "")
.toString()
.toLowerCase();

if (
cls.includes("json") ||
cls.includes("debug") ||
cls.includes("console") ||
cls.includes("code") ||
cls.includes("api") ||
cls.includes("response") ||
id.includes("json") ||
id.includes("debug") ||
id.includes("console") ||
id.includes("code") ||
id.includes("api") ||
id.includes("response")
) {
return true;
}

const blockText =
(el.innerText || "")
.trim();

if (
blockText.startsWith("{") ||
blockText.startsWith("[") ||
blockText.includes('"ok"') ||
blockText.includes('"error"') ||
blockText.includes('"logged"') ||
blockText.includes('"message"') ||
blockText.includes("login_required") ||
blockText.includes("subscription_required")
) {
return true;
}

return false;

}

function isTranslatableText(text) {

if (!text) return false;

const clean =
text.trim();

if (clean.length < 2) return false;

if (/^\d+$/.test(clean)) return false;

if (/^[\d\s.,:;!?€$£%+\-()]+$/.test(clean)) return false;

if (/^https?:\/\//i.test(clean)) return false;

if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return false;

if (/^[A-Z0-9_]{2,}$/.test(clean)) return false;

if (clean.startsWith("{") || clean.endsWith("}")) return false;

if (clean.includes('"ok"')) return false;
if (clean.includes('"error"')) return false;
if (clean.includes('"logged"')) return false;
if (clean.includes("login_required")) return false;

return true;

}

window.autoTranslatePage = async function () {

const lang =
window.getLangCode();

if (lang === "en") {
console.log("[i18n] English selected. Auto translate skipped.");
return;
}

const walker =
document.createTreeWalker(
document.body,
NodeFilter.SHOW_TEXT,
{
acceptNode: function (node) {

const parent =
node.parentElement;

if (shouldSkipElement(parent)) {
return NodeFilter.FILTER_REJECT;
}

const text =
node.nodeValue.trim();

if (!isTranslatableText(text)) {
return NodeFilter.FILTER_REJECT;
}

return NodeFilter.FILTER_ACCEPT;

}
}
);

const textNodes = [];

while (walker.nextNode()) {
textNodes.push(walker.currentNode);
}

textNodes.forEach(function (node) {

if (node.__autoTranslated) return;

node.__autoTranslated = true;
node.__originalText = node.nodeValue;

// IMPORTANT:
// momentan nu modificăm vizibil textul.
// aici se va conecta traducerea reală prin backend.

});

console.log(
"[i18n] Auto translate scan complete. Text nodes detected:",
textNodes.length
);

};

function observeDynamicText() {

let timer = null;

const observer =
new MutationObserver(function () {

clearTimeout(timer);

timer =
setTimeout(function () {
window.autoTranslatePage();
}, 500);

});

observer.observe(
document.body,
{
childList: true,
subtree: true,
characterData: true
}
);

}

window.applyTranslations =
async function () {

setupLangSwitcher();

applyStaticKeys();

await window.autoTranslatePage();

observeDynamicText();

};

document.addEventListener(
"DOMContentLoaded",
function () {
window.applyTranslations();
}
);

})();

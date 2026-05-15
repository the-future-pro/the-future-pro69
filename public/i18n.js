// public/i18n.js — The Future PRO — Auto Translate Engine v10
// Source language: RO
// Backend: /api/translate/batch
// Full page translation + automatic prompt warning

(function () {
  const DEFAULT_LANG = "ro";
  const SOURCE_LANG = "ro";
  const LOCAL_TRANSLATE_CACHE_KEY = "tfp_translate_cache_v10";
  const MAX_TEXTS_PER_BATCH = 35;
  const MAX_TOTAL_TEXTS = 350;

  const PROMPT_HINT_TEXT =
    "✨ Prompturile pot fi scrise în orice limbă, însă pentru cele mai precise și cinematice rezultate recomandăm limba engleză.";

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

  let isTranslating = false;
  let observerStarted = false;

  function normalizeLang(lang) {
    const clean = String(lang || DEFAULT_LANG).toLowerCase().trim();
    const allowed = window.LANG_OPTIONS.map((x) => x[0]);
    return allowed.includes(clean) ? clean : DEFAULT_LANG;
  }

  function loadLocalCache() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_TRANSLATE_CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveLocalCache(cache) {
    try {
      localStorage.setItem(LOCAL_TRANSLATE_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  }

  let LOCAL_CACHE = loadLocalCache();

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

  window.clearTranslateCache = function () {
    try {
      localStorage.removeItem(LOCAL_TRANSLATE_CACHE_KEY);
      LOCAL_CACHE = {};
      console.log("[i18n] Translation cache cleared.");
    } catch {}
  };

  function setupLangSwitcher() {
    const switcher = document.getElementById("langSwitcher");
    if (!switcher) return;

    switcher.innerHTML = "";

    window.LANG_OPTIONS.forEach(function ([code, label]) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = label;
      switcher.appendChild(opt);
    });

    switcher.value = window.getLangCode();

    switcher.onchange = function () {
      window.clearTranslateCache();
      window.setLang(this.value);
    };
  }

  function injectPromptHints() {
    const fields = document.querySelectorAll("textarea, input[type='text'], input:not([type])");

    fields.forEach(function (field) {
      const id = String(field.id || "").toLowerCase();
      const name = String(field.name || "").toLowerCase();
      const placeholder = String(field.getAttribute("placeholder") || "").toLowerCase();

      const isPromptField =
        id.includes("prompt") ||
        id.includes("storyboard") ||
        name.includes("prompt") ||
        name.includes("storyboard") ||
        placeholder.includes("prompt") ||
        placeholder.includes("storyboard") ||
        placeholder.includes("cinematic") ||
        placeholder.includes("ultra realistic") ||
        placeholder.includes("portret cinematic");

      if (!isPromptField) return;

      const parent = field.parentElement;
      if (!parent) return;

      if (parent.querySelector(".tfp-prompt-hint")) return;

      const hint = document.createElement("div");
      hint.className = "tfp-prompt-hint";
      hint.style.fontSize = "12px";
      hint.style.lineHeight = "1.45";
      hint.style.opacity = "0.72";
      hint.style.marginTop = "6px";
      hint.style.marginBottom = "8px";
      hint.textContent = PROMPT_HINT_TEXT;

      field.insertAdjacentElement("afterend", hint);
    });
  }

  function shouldSkipElement(el) {
    if (!el) return true;
    if (el.closest("[data-no-translate]")) return true;

    const tag = el.tagName;

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

    const cls = (el.className || "").toString().toLowerCase();
    const id = (el.id || "").toString().toLowerCase();

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

    return false;
  }

  function isTranslatableText(text) {
    if (!text) return false;

    const clean = String(text || "").trim();

    if (clean.length < 2) return false;
    if (clean.length > 700) return false;

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
    if (clean.includes("subscription_required")) return false;

    return true;
  }

  function collectTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;

          if (shouldSkipElement(parent)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.nodeValue.trim();

          if (!isTranslatableText(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function getCacheKey(lang, text) {
    return SOURCE_LANG + "::" + lang + "::" + text;
  }

  async function translateBatch(texts, lang) {
    if (!texts.length) return [];

    const response = await fetch("/api/translate/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target: lang,
        source: SOURCE_LANG,
        items: texts
      })
    });

    if (!response.ok) {
      throw new Error("translate_batch_http_" + response.status);
    }

    const data = await response.json();

    console.log("[i18n] translate response:", data);

    if (!data || !data.ok) {
      throw new Error(data?.error || "translate_batch_failed");
    }

    if (Array.isArray(data.items)) {
      return data.items.map(function (item) {
        return item.translatedText || item.text || "";
      });
    }

    if (Array.isArray(data.translations)) {
      return data.translations;
    }

    return texts;
  }

  function applyCachedTranslations(textNodes, lang) {
    textNodes.forEach(function (node) {
      if (!node.__originalText) {
        node.__originalText = node.nodeValue;
      }

      const original = String(node.__originalText || "").trim();

      if (!isTranslatableText(original)) return;

      const cacheKey = getCacheKey(lang, original);

      if (LOCAL_CACHE[cacheKey]) {
        node.nodeValue = node.__originalText.replace(original, LOCAL_CACHE[cacheKey]);
        node.__autoTranslated = true;
      }
    });
  }

  window.autoTranslatePage = async function () {
    if (isTranslating) return;

    injectPromptHints();

    const lang = window.getLangCode();

    document.documentElement.lang = lang;

    if (lang === SOURCE_LANG) {
      console.log("[i18n] Romanian selected. Translation skipped.");
      return;
    }

    isTranslating = true;

    try {
      const textNodes = collectTextNodes();

      textNodes.forEach(function (node) {
        if (!node.__originalText) {
          node.__originalText = node.nodeValue;
        }
      });

      applyCachedTranslations(textNodes, lang);

      const uniqueTexts = [];

      textNodes.forEach(function (node) {
        const original = String(node.__originalText || "").trim();

        if (!isTranslatableText(original)) return;

        const cacheKey = getCacheKey(lang, original);

        if (LOCAL_CACHE[cacheKey]) return;

        if (!uniqueTexts.includes(original)) {
          uniqueTexts.push(original);
        }
      });

      const limitedTexts = uniqueTexts.slice(0, MAX_TOTAL_TEXTS);

      if (!limitedTexts.length) {
        console.log("[i18n] Nothing new to translate.");
        return;
      }

      console.log("[i18n] Total texts to translate:", limitedTexts.length);

      for (let i = 0; i < limitedTexts.length; i += MAX_TEXTS_PER_BATCH) {
        const batch = limitedTexts.slice(i, i + MAX_TEXTS_PER_BATCH);

        console.log("[i18n] Sending batch:", {
          source: SOURCE_LANG,
          target: lang,
          from: i,
          count: batch.length
        });

        const translations = await translateBatch(batch, lang);

        batch.forEach(function (original, index) {
          const translated = translations[index] || original;
          const cacheKey = getCacheKey(lang, original);
          LOCAL_CACHE[cacheKey] = translated;
        });

        saveLocalCache(LOCAL_CACHE);
        applyCachedTranslations(textNodes, lang);

        await new Promise(function (resolve) {
          setTimeout(resolve, 180);
        });
      }

      console.log("[i18n] Full page auto translation complete.");
    } catch (err) {
      console.warn("[i18n] Auto translation failed:", err);
    } finally {
      isTranslating = false;
    }
  };

  function observeDynamicText() {
    if (observerStarted) return;

    observerStarted = true;

    let timer = null;

    const observer = new MutationObserver(function () {
      clearTimeout(timer);

      timer = setTimeout(function () {
        window.autoTranslatePage();
      }, 1200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  window.applyTranslations = async function () {
    setupLangSwitcher();
    injectPromptHints();
    await window.autoTranslatePage();
    observeDynamicText();
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.applyTranslations();
  });
})();

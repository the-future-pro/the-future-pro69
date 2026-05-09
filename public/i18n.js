window.I18N = {
  ro: {
    lang_name:"Română",
    top_subtitle:"Univers AI privat",
    login:"Login",
    enter_platform:"Intră",
    image_btn:"Încearcă Image Studio",
    eyebrow:"PRIVATE • CINEMATIC • AI COMPANIONS",
    hero_title:"Linia dintre AI și realitate nu mai există.",
    hero_text:"Creează companions AI ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",
    warning_18:"18+ doar",
    fictional_only:"Personaje fictive doar",
    private_exp:"Experiență privată",
    no_deepfake:"Fără deepfake-uri cu persoane reale",

    explore:"EXPLOREAZĂ",
    trending_title:"Universul tău privat AI",
    trending_text:"Totul este construit pentru realism, discreție și experiență cinematică.",
    online:"online",

    ava_role:"Dark Luxury • elegantă • misterioasă",
    mira_role:"Girl Next Door • caldă • emoțională",
    kira_role:"Cyberpunk Muse • încrezătoare • magnetică",
    luna_role:"Goth Romantic • poetică • intensă",

    create:"CREEAZĂ",
    multi_title:"O platformă. Mai multe experiențe.",
    multi_text:"Construim produsul în jurul celor mai importante zone: chat, imagine, video și personaje recurente.",

    card1_title:"Creează companions AI",
    card1_text:"Generează personaje fictive cu nume, rol, personalitate, ton și prețuri media.",
    card2_title:"Chat privat tip DM",
    card2_text:"Chat cinematic, status online, typing indicator și experiență tip social app.",
    card3_title:"AI Image Studio",
    card3_text:"Prompturi cinematice, realism, lumină, cameră și preview premium.",
    card4_title:"AI Video Studio",
    card4_text:"Scene scurte premium, 5–20 secunde, create pentru teasing și unlock.",

    premium_access:"ACCES PREMIUM",
    unlock_title:"Deblochează lumea ta privată AI.",
    unlock_text:"Pentru MVP, păstrăm totul simplu: experiență premium, câteva personaje foarte bune, generare imagine/video și monetizare prin abonamente + credite.",
    member_area:"Deschide zona de membri",

    privacy:"Confidențialitate",
    terms:"Termeni"
  },

  en: {
    lang_name:"English",
    top_subtitle:"Private AI Universe",
    login:"Login",
    enter_platform:"Enter",
    image_btn:"Try Image Studio",
    eyebrow:"PRIVATE • CINEMATIC • AI COMPANIONS",
    hero_title:"The line between AI and reality no longer exists.",
    hero_text:"Create ultra-realistic AI companions, private conversations, cinematic images and interactive experiences inside a premium ecosystem.",
    warning_18:"18+ only",
    fictional_only:"Fictional characters only",
    private_exp:"Private experience",
    no_deepfake:"No real-person deepfakes",

    explore:"EXPLORE",
    trending_title:"Your private AI universe",
    trending_text:"Everything is built for realism, discretion and cinematic experience.",
    online:"online",

    ava_role:"Dark Luxury • elegant • mysterious",
    mira_role:"Girl Next Door • warm • emotional",
    kira_role:"Cyberpunk Muse • confident • magnetic",
    luna_role:"Goth Romantic • poetic • intense",

    create:"CREATE",
    multi_title:"One platform. Multiple experiences.",
    multi_text:"We build the product around the most important areas: chat, image, video and recurring characters.",

    card1_title:"Create AI companions",
    card1_text:"Generate fictional characters with name, role, personality, tone and media prices.",
    card2_title:"Private DM-style chat",
    card2_text:"Cinematic chat, online status, typing indicator and social app experience.",
    card3_title:"AI Image Studio",
    card3_text:"Cinematic prompts, realism, lighting, camera feel and premium preview.",
    card4_title:"AI Video Studio",
    card4_text:"Short premium scenes, 5–20 seconds, created for teasing and unlock.",

    premium_access:"PREMIUM ACCESS",
    unlock_title:"Unlock your private AI world.",
    unlock_text:"For the MVP, we keep it simple: premium experience, a few strong characters, image/video generation and monetization through subscriptions + credits.",
    member_area:"Open Member Area",

    privacy:"Privacy",
    terms:"Terms"
  },

  fr: {
    lang_name:"Français",
    top_subtitle:"Univers IA privé",
    login:"Connexion",
    enter_platform:"Entrer",
    image_btn:"Essayer Image Studio",
    eyebrow:"PRIVÉ • CINÉMATIQUE • COMPAGNONS IA",
    hero_title:"La frontière entre l’IA et la réalité n’existe plus.",
    hero_text:"Créez des compagnons IA ultra réalistes, des conversations privées, des images cinématographiques et des expériences interactives dans un écosystème premium.",
    warning_18:"18+ uniquement",
    fictional_only:"Personnages fictifs uniquement",
    private_exp:"Expérience privée",
    no_deepfake:"Pas de deepfake réel",

    explore:"EXPLORER",
    trending_title:"Votre univers IA privé",
    trending_text:"Tout est conçu pour le réalisme, la discrétion et une expérience cinématographique.",
    online:"en ligne",

    ava_role:"Dark Luxury • élégante • mystérieuse",
    mira_role:"Girl Next Door • chaleureuse • émotionnelle",
    kira_role:"Cyberpunk Muse • confiante • magnétique",
    luna_role:"Goth Romantic • poétique • intense",

    create:"CRÉER",
    multi_title:"Une plateforme. Plusieurs expériences.",
    multi_text:"Nous construisons le produit autour des zones essentielles : chat, image, vidéo et personnages récurrents.",

    card1_title:"Créer des compagnons IA",
    card1_text:"Générez des personnages fictifs avec nom, rôle, personnalité, ton et prix média.",
    card2_title:"Chat privé type DM",
    card2_text:"Chat cinématographique, statut en ligne, indicateur de saisie et expérience type réseau social.",
    card3_title:"AI Image Studio",
    card3_text:"Prompts cinématographiques, réalisme, éclairage, rendu caméra et aperçu premium.",
    card4_title:"AI Video Studio",
    card4_text:"Scènes premium courtes, 5–20 secondes, créées pour teasing et déverrouillage.",

    premium_access:"ACCÈS PREMIUM",
    unlock_title:"Déverrouillez votre monde IA privé.",
    unlock_text:"Pour le MVP, nous gardons les choses simples : expérience premium, quelques personnages forts, génération image/vidéo et monétisation par abonnements + crédits.",
    member_area:"Ouvrir l’espace membre",

    privacy:"Confidentialité",
    terms:"Conditions"
  },

  es:{lang_name:"Español"},
  de:{lang_name:"Deutsch"},
  it:{lang_name:"Italiano"},
  pt:{lang_name:"Português"}
};

if (!localStorage.getItem("site_lang")) {
  localStorage.setItem("site_lang", "ro");
}

window.getLangCode = function () {
  return localStorage.getItem("site_lang") || "ro";
};

window.getLang = function () {
  const code = window.getLangCode();
  return window.I18N[code] || window.I18N.en;
};

window.t = function (key) {
  const lang = window.getLang();
  return lang[key] || window.I18N.en[key] || window.I18N.ro[key] || key;
};

window.setLang = function (lang) {
  localStorage.setItem("site_lang", lang);
  location.reload();
};

window.applyTranslations = function () {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = window.t(el.getAttribute("data-i18n"));
  });
};

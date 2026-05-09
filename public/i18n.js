window.I18N = {
  ro: {
    lang_name: "Română",
    hero_title: "Linia dintre AI și realitate nu mai există.",
    hero_text: "Creează companions AI ultra-realiste, conversații private, imagini cinematice și experiențe interactive premium.",
    enter_btn: "Intră în experiență",
    explore_btn: "Explorează companions",
    premium_access: "Acces Premium",
    image_studio: "Studio AI Imagini",
    video_studio: "Studio AI Video",
    ai_companions: "AI Companions",
    choose_plan: "Alege abonamentul",
    warning_18: "Doar pentru persoane 18+",
    fictional_only: "Doar personaje fictive",
    no_deepfake: "Fără deepfake-uri reale",
    private_exp: "Experiență privată"
  },

  en: {
    lang_name: "English",
    hero_title: "The line between AI and reality no longer exists.",
    hero_text: "Create ultra-realistic AI companions, private conversations, cinematic images and premium interactive experiences.",
    enter_btn: "Enter experience",
    explore_btn: "Explore companions",
    premium_access: "Premium Access",
    image_studio: "AI Image Studio",
    video_studio: "AI Video Studio",
    ai_companions: "AI Companions",
    choose_plan: "Choose your plan",
    warning_18: "18+ only",
    fictional_only: "Fictional characters only",
    no_deepfake: "No real-person deepfakes",
    private_exp: "Private experience"
  },

  es: {
    lang_name: "Español",
    hero_title: "La línea entre la IA y la realidad ya no existe.",
    hero_text: "Crea compañeros IA ultra realistas, conversaciones privadas e imágenes cinematográficas.",
    enter_btn: "Entrar",
    explore_btn: "Explorar",
    premium_access: "Acceso Premium",
    image_studio: "Estudio IA",
    video_studio: "Video IA",
    ai_companions: "Compañeros IA",
    choose_plan: "Elegir plan",
    warning_18: "Solo para mayores de 18",
    fictional_only: "Solo personajes ficticios",
    no_deepfake: "Sin deepfakes reales",
    private_exp: "Experiencia privada"
  },

  fr: {
    lang_name: "Français",
    hero_title: "La frontière entre l'IA et la réalité n'existe plus.",
    hero_text: "Créez des compagnons IA ultra réalistes et des expériences cinématographiques privées.",
    enter_btn: "Entrer",
    explore_btn: "Explorer",
    premium_access: "Accès Premium",
    image_studio: "Studio IA",
    video_studio: "Vidéo IA",
    ai_companions: "Compagnons IA",
    choose_plan: "Choisir un abonnement",
    warning_18: "18+ uniquement",
    fictional_only: "Personnages fictifs uniquement",
    no_deepfake: "Pas de deepfake réel",
    private_exp: "Expérience privée"
  },

  de: {
    lang_name: "Deutsch",
    hero_title: "Die Grenze zwischen KI und Realität existiert nicht mehr.",
    hero_text: "Erstelle ultra-realistische KI-Companions und private cineastische Erlebnisse.",
    enter_btn: "Betreten",
    explore_btn: "Entdecken",
    premium_access: "Premium Zugang",
    image_studio: "KI Bildstudio",
    video_studio: "KI Video Studio",
    ai_companions: "KI Companions",
    choose_plan: "Abo wählen",
    warning_18: "Nur für Erwachsene",
    fictional_only: "Nur fiktive Charaktere",
    no_deepfake: "Keine echten Deepfakes",
    private_exp: "Private Erfahrung"
  },

  it: {
    lang_name: "Italiano",
    hero_title: "Il confine tra IA e realtà non esiste più.",
    hero_text: "Crea companion IA ultra realistici ed esperienze cinematografiche private.",
    enter_btn: "Entra",
    explore_btn: "Esplora",
    premium_access: "Accesso Premium",
    image_studio: "Studio IA",
    video_studio: "Video IA",
    ai_companions: "Companion IA",
    choose_plan: "Scegli piano",
    warning_18: "Solo 18+",
    fictional_only: "Solo personaggi fittizi",
    no_deepfake: "No deepfake reali",
    private_exp: "Esperienza privata"
  },

  pt: {
    lang_name: "Português",
    hero_title: "A linha entre IA e realidade não existe mais.",
    hero_text: "Crie companions IA ultra-realistas e experiências cinematográficas privadas.",
    enter_btn: "Entrar",
    explore_btn: "Explorar",
    premium_access: "Acesso Premium",
    image_studio: "Estúdio IA",
    video_studio: "Vídeo IA",
    ai_companions: "Companions IA",
    choose_plan: "Escolha o plano",
    warning_18: "Apenas 18+",
    fictional_only: "Apenas personagens fictícios",
    no_deepfake: "Sem deepfakes reais",
    private_exp: "Experiência privada"
  }
};

// limba implicită
if (!localStorage.getItem("site_lang")) {
  localStorage.setItem("site_lang", "ro");
}

window.getLang = function () {
  const lang = localStorage.getItem("site_lang") || "ro";
  return window.I18N[lang] || window.I18N.en;
};

window.setLang = function (lang) {
  localStorage.setItem("site_lang", lang);
  location.reload();
};

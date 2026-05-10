(function () {
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
    report_abuse: "Report abuse",
    takedown: "Takedown request",
    ai_disclosure: "All characters and media are AI-generated or AI-assisted fictional content.",

    image_studio_title: "AI Image Studio",
    image_studio_text: "Generate fictional, cinematic and realistic AI images. No real people. No minors. No deepfakes.",
    prompt_label: "Prompt",
    negative_label: "Negative / avoid",
    quality_label: "Quality",
    generate_image: "Generate Image",

    video_studio_title: "AI Video Studio",
    video_studio_text: "Generate short fictional cinematic scenes. Video should be used carefully as a premium feature.",
    storyboard_label: "Storyboard / scene prompt",
    duration_label: "Duration",
    generate_video: "Generate Video",

    chat_title: "Private chat",
    chat_placeholder: "Write a message...",
    send: "Send",
    generate_teaser: "Generate teaser",
    unlock_media: "Unlock media",

    premium_title: "Your private AI experience starts here.",
    premium_text: "Login, activate a test plan and access companions, chat, images and video.",
    choose_plan: "Choose your plan"
  };

  const make = (o) => Object.assign({}, EN, o);

  window.LANG_OPTIONS = [
    ["ro","🇷🇴 RO"],["en","🇺🇸 EN"],["fr","🇫🇷 FR"],["es","🇪🇸 ES"],["de","🇩🇪 DE"],
    ["it","🇮🇹 IT"],["pt","🇵🇹 PT"],["nl","🇳🇱 NL"],["pl","🇵🇱 PL"],["hu","🇭🇺 HU"],
    ["bg","🇧🇬 BG"],["cs","🇨🇿 CZ"],["sk","🇸🇰 SK"],["hr","🇭🇷 HR"],["sr","🇷🇸 SR"],
    ["tr","🇹🇷 TR"],["ru","🇷🇺 RU"],["uk","🇺🇦 UK"],["ar","🇸🇦 AR"],["hi","🇮🇳 HI"],
    ["zh","🇨🇳 ZH"],["ja","🇯🇵 JA"],["ko","🇰🇷 KO"]
  ];

  window.I18N = {
    en: EN,

    ro: make({
      lang_name: "Română",
      top_subtitle: "Univers AI privat",
      login: "Login",
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
      online: "online",

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
      card3_title: "AI Image Studio",
      card3_text: "Prompturi cinematice, realism, lumină, cameră și preview premium.",
      card4_title: "AI Video Studio",
      card4_text: "Scene scurte premium, 5–20 secunde, create pentru teasing și unlock.",

      premium_access: "ACCES PREMIUM",
      unlock_title: "Deblochează lumea ta privată AI.",
      unlock_text: "Pentru MVP, păstrăm totul simplu: experiență premium, câteva personaje foarte bune, generare imagine/video și monetizare prin abonamente + credite.",

      age_title: "Confirmare vârstă",
      age_text: "Această platformă este destinată doar persoanelor adulte, de minimum 18 ani.",
      age_confirm: "Confirm că am 18+",
      age_exit: "Ieșire",

      safety_title: "Reguli de siguranță",
      safety_intro: "Pentru ca platforma să rămână sigură și conformă, trebuie respectate aceste reguli.",
      allowed_title: "Permis",
      forbidden_title: "Interzis",

      allowed_1: "Personaje AI fictive adulte.",
      allowed_2: "Roleplay privat cu personaje fictive.",
      allowed_3: "Imagini și videoclipuri cinematice generate din prompturi fictive.",
      allowed_4: "Experiențe fictive cu tematică adultă consensuală, unde este legal.",

      forbidden_1: "Fără minori sau personaje sexualizate care par minore.",
      forbidden_2: "Fără persoane reale fără consimțământ explicit.",
      forbidden_3: "Fără celebrități, influenceri sau persoane publice.",
      forbidden_4: "Fără imagini intime neconsensuale.",
      forbidden_5: "Fără răzbunare, șantaj, hărțuire sau impersonare.",
      forbidden_6: "Fără deepfake-uri cu persoane reale.",
      forbidden_7: "Fără conținut ilegal, exploatator sau abuziv.",
      forbidden_8: "Fără upload-uri făcute pentru a dezbrăca sau sexualiza persoane reale.",

      safety_checkbox: "Confirm că toate personajele sunt fictive, 18+, și nu voi genera deepfake-uri cu persoane reale sau conținut ilegal.",
      report_abuse: "Raportează abuz",
      takedown: "Cerere eliminare conținut",
      ai_disclosure: "Toate personajele și materialele media sunt conținut fictiv generat sau asistat de AI.",

      image_studio_title: "AI Image Studio",
      image_studio_text: "Generează imagini AI fictive, cinematice și realiste. Fără persoane reale. Fără minori. Fără deepfake.",
      prompt_label: "Prompt",
      negative_label: "Negative / evită",
      quality_label: "Calitate",
      generate_image: "Generează imagine",

      video_studio_title: "AI Video Studio",
      video_studio_text: "Generează scene scurte fictive și cinematice. Video-ul trebuie folosit atent ca funcție premium.",
      storyboard_label: "Storyboard / descriere scenă",
      duration_label: "Durată",
      generate_video: "Generează video",

      chat_title: "Chat privat",
      chat_placeholder: "Scrie un mesaj...",
      send: "Trimite",
      generate_teaser: "Generează teaser",
      unlock_media: "Deblochează media",

      premium_title: "Experiența ta AI privată începe aici.",
      premium_text: "Login, activează un plan de test și accesează companions, chat, imagini și video.",
      choose_plan: "Alege abonamentul"
    }),

    fr: make({
      lang_name: "Français",
      top_subtitle: "Univers IA privé",
      login: "Connexion",
      enter_platform: "Entrer",
      image_btn: "Essayer Image Studio",
      member_area: "Ouvrir l’espace membre",
      privacy: "Confidentialité",
      terms: "Conditions",
      safety: "Sécurité",

      eyebrow: "PRIVÉ • CINÉMATIQUE • COMPAGNONS IA",
      hero_title: "La frontière entre l’IA et la réalité n’existe plus.",
      hero_text: "Créez des compagnons IA fictifs ultra réalistes, des conversations privées, des images cinématographiques et des expériences interactives premium.",

      warning_18: "18+ uniquement",
      fictional_only: "Personnages fictifs uniquement",
      private_exp: "Expérience privée",
      no_deepfake: "Pas de deepfake de personne réelle",

      ava_card_title: "Luxe sombre",
      ava_card_text: "Mystérieuse, cinématique, émotionnellement adaptative.",
      image_realism: "Réalisme image",
      image_realism_text: "Aperçu style 8K",
      video_scene: "Scène vidéo",
      video_scene_text: "Clips premium 10–20s",

      explore: "EXPLORER",
      trending_title: "Votre univers IA privé",
      trending_text: "Tout est conçu pour le réalisme, la discrétion et une expérience cinématographique.",
      online: "en ligne",

      ava_role: "Luxe sombre • élégante • mystérieuse",
      mira_role: "Girl Next Door • chaleureuse • émotionnelle",
      kira_role: "Muse cyberpunk • confiante • magnétique",
      luna_role: "Romantique goth • poétique • intense",

      create: "CRÉER",
      multi_title: "Une plateforme. Plusieurs expériences.",
      multi_text: "Nous construisons le produit autour des zones essentielles : chat, image, vidéo et personnages récurrents.",

      card1_title: "Créer des compagnons IA",
      card1_text: "Générez des personnages fictifs avec nom, rôle, personnalité, ton et prix média.",
      card2_title: "Chat privé type DM",
      card2_text: "Chat cinématographique, statut en ligne, indicateur de saisie et expérience type réseau social.",
      card3_title: "AI Image Studio",
      card3_text: "Prompts cinématographiques, réalisme, éclairage, rendu caméra et aperçu premium.",
      card4_title: "AI Video Studio",
      card4_text: "Scènes premium courtes, 5–20 secondes, créées pour teasing et déverrouillage.",

      premium_access: "ACCÈS PREMIUM",
      unlock_title: "Déverrouillez votre monde IA privé.",
      unlock_text: "Pour le MVP, nous gardons les choses simples : expérience premium, quelques personnages forts, génération image/vidéo et monétisation par abonnements + crédits.",

      age_title: "Confirmation d’âge",
      age_text: "Cette plateforme est réservée aux adultes de 18 ans ou plus.",
      age_confirm: "Je confirme avoir 18+",
      age_exit: "Quitter",

      safety_title: "Règles de sécurité",
      safety_intro: "Pour garder la plateforme sûre et conforme, vous devez respecter ces règles.",
      allowed_title: "Autorisé",
      forbidden_title: "Interdit",

      forbidden_1: "Aucun mineur ou personnage sexualisé paraissant mineur.",
      forbidden_2: "Aucune personne réelle sans consentement explicite.",
      forbidden_3: "Aucune célébrité, influenceur ou personnalité publique.",
      forbidden_4: "Aucune image intime non consensuelle.",
      forbidden_5: "Aucune vengeance, chantage, harcèlement ou usurpation.",
      forbidden_6: "Aucun deepfake de personne réelle.",
      forbidden_7: "Aucun contenu illégal, exploiteur ou abusif.",
      forbidden_8: "Aucun upload destiné à déshabiller ou sexualiser une personne réelle.",

      safety_checkbox: "Je confirme que tous les personnages sont fictifs, 18+, et que je ne générerai aucun deepfake réel ni contenu illégal."
    }),

    es: make({
      lang_name: "Español",
      top_subtitle: "Universo IA privado",
      login: "Iniciar sesión",
      enter_platform: "Entrar",
      image_btn: "Probar Image Studio",
      member_area: "Abrir zona de miembros",
      privacy: "Privacidad",
      terms: "Términos",
      safety: "Seguridad",

      eyebrow: "PRIVADO • CINEMÁTICO • COMPAÑEROS IA",
      hero_title: "La línea entre la IA y la realidad ya no existe.",
      hero_text: "Crea compañeros IA ficticios ultra realistas, conversaciones privadas, imágenes cinematográficas y experiencias interactivas premium.",

      warning_18: "Solo 18+",
      fictional_only: "Solo personajes ficticios",
      private_exp: "Experiencia privada",
      no_deepfake: "Sin deepfakes de personas reales",

      ava_card_title: "Lujo oscuro",
      ava_card_text: "Misteriosa, cinematográfica y emocionalmente adaptable.",
      image_realism: "Realismo de imagen",
      image_realism_text: "Vista previa estilo 8K",
      video_scene: "Escena de video",
      video_scene_text: "Clips premium 10–20s",

      explore: "EXPLORAR",
      trending_title: "Tu universo IA privado",
      trending_text: "Todo está construido para realismo, discreción y experiencia cinematográfica.",
      online: "en línea",

      ava_role: "Lujo oscuro • elegante • misteriosa",
      mira_role: "Girl Next Door • cálida • emocional",
      kira_role: "Musa cyberpunk • segura • magnética",
      luna_role: "Romance goth • poética • intensa",

      create: "CREAR",
      multi_title: "Una plataforma. Múltiples experiencias.",
      multi_text: "Construimos el producto alrededor de chat, imagen, video y personajes recurrentes.",

      card1_title: "Crear compañeros IA",
      card1_text: "Genera personajes ficticios con nombre, rol, personalidad, tono y precios multimedia.",
      card2_title: "Chat privado estilo DM",
      card2_text: "Chat cinematográfico, estado online, indicador de escritura y experiencia tipo app social.",
      card3_title: "AI Image Studio",
      card3_text: "Prompts cinematográficos, realismo, iluminación, sensación de cámara y preview premium.",
      card4_title: "AI Video Studio",
      card4_text: "Escenas premium cortas, 5–20 segundos, creadas para teaser y desbloqueo.",

      premium_access: "ACCESO PREMIUM",
      unlock_title: "Desbloquea tu mundo IA privado.",
      unlock_text: "Para el MVP mantenemos todo simple: experiencia premium, pocos personajes fuertes, generación imagen/video y monetización por suscripciones + créditos.",

      age_title: "Confirmación de edad",
      age_text: "Esta plataforma está destinada solo a adultos de 18 años o más.",
      age_confirm: "Confirmo que tengo 18+",
      age_exit: "Salir",

      safety_title: "Reglas de seguridad",
      safety_intro: "Para mantener la plataforma segura y conforme, debes seguir estas reglas.",
      allowed_title: "Permitido",
      forbidden_title: "Prohibido",

      forbidden_1: "No menores ni personajes sexualizados que parezcan menores.",
      forbidden_2: "No personas reales sin consentimiento explícito.",
      forbidden_3: "No celebridades, influencers o figuras públicas.",
      forbidden_4: "No imágenes íntimas no consensuadas.",
      forbidden_5: "No venganza, chantaje, acoso o suplantación.",
      forbidden_6: "No deepfakes de personas reales.",
      forbidden_7: "No contenido ilegal, explotador o abusivo.",
      forbidden_8: "No uploads destinados a desnudar o sexualizar personas reales.",

      safety_checkbox: "Confirmo que todos los personajes son ficticios, 18+, y no generaré deepfakes reales ni contenido ilegal."
    })
  };

  const minimal = {
    de: ["Deutsch", "Privates KI-Universum", "Login", "Betreten", "Nur 18+", "Nur fiktive Charaktere", "Keine Deepfakes realer Personen"],
    it: ["Italiano", "Universo IA privato", "Accedi", "Entra", "Solo 18+", "Solo personaggi fittizi", "Nessun deepfake di persone reali"],
    pt: ["Português", "Universo IA privado", "Entrar", "Entrar", "Apenas 18+", "Apenas personagens fictícios", "Sem deepfakes de pessoas reais"],
    nl: ["Nederlands", "Privé AI-universum", "Inloggen", "Betreden", "Alleen 18+", "Alleen fictieve personages", "Geen deepfakes van echte personen"],
    pl: ["Polski", "Prywatny świat AI", "Zaloguj", "Wejdź", "Tylko 18+", "Tylko fikcyjne postacie", "Bez deepfake prawdziwych osób"],
    hu: ["Magyar", "Privát AI-univerzum", "Belépés", "Belépés", "Csak 18+", "Csak kitalált karakterek", "Nincs valódi személyes deepfake"],
    bg: ["Български", "Частна AI вселена", "Вход", "Влез", "Само 18+", "Само измислени персонажи", "Без deepfake на реални хора"],
    cs: ["Čeština", "Soukromý AI vesmír", "Přihlášení", "Vstoupit", "Pouze 18+", "Pouze fiktivní postavy", "Žádné deepfaky skutečných osob"],
    sk: ["Slovenčina", "Súkromný AI vesmír", "Prihlásiť", "Vstúpiť", "Iba 18+", "Iba fiktívne postavy", "Žiadne deepfaky skutočných osôb"],
    hr: ["Hrvatski", "Privatni AI svijet", "Prijava", "Uđi", "Samo 18+", "Samo izmišljeni likovi", "Bez deepfakea stvarnih osoba"],
    sr: ["Srpski", "Privatni AI svet", "Prijava", "Uđi", "Samo 18+", "Samo izmišljeni likovi", "Bez deepfake-a stvarnih osoba"],
    tr: ["Türkçe", "Özel AI evreni", "Giriş", "Gir", "Sadece 18+", "Sadece kurgusal karakterler", "Gerçek kişi deepfake yok"],
    ru: ["Русский", "Частная AI-вселенная", "Войти", "Войти", "Только 18+", "Только вымышленные персонажи", "Без deepfake реальных людей"],
    uk: ["Українська", "Приватний AI-всесвіт", "Увійти", "Увійти", "Лише 18+", "Лише вигадані персонажі", "Без deepfake реальних людей"],
    ar: ["العربية", "عالم ذكاء اصطناعي خاص", "تسجيل الدخول", "دخول", "لمن هم 18+ فقط", "شخصيات خيالية فقط", "لا لتزييف الأشخاص الحقيقيين"],
    hi: ["हिन्दी", "निजी AI यूनिवर्स", "लॉगिन", "प्रवेश", "केवल 18+", "केवल काल्पनिक पात्र", "वास्तविक लोगों के डीपफेक नहीं"],
    zh: ["中文", "私人 AI 宇宙", "登录", "进入", "仅限18+", "仅限虚构角色", "禁止真实人物 deepfake"],
    ja: ["日本語", "プライベートAIユニバース", "ログイン", "入る", "18歳以上のみ", "架空キャラクターのみ", "実在人物のディープフェイク禁止"],
    ko: ["한국어", "프라이빗 AI 유니버스", "로그인", "입장", "18세 이상만", "가상 캐릭터만", "실존 인물 딥페이크 금지"]
  };

  for (const [code, v] of Object.entries(minimal)) {
    window.I18N[code] = make({
      lang_name: v[0],
      top_subtitle: v[1],
      login: v[2],
      enter_platform: v[3],
      warning_18: v[4],
      fictional_only: v[5],
      no_deepfake: v[6],
      safety_checkbox: v[5] + ". " + v[6] + "."
    });
  }

  if (!localStorage.getItem("site_lang")) {
    localStorage.setItem("site_lang", "ro");
  }

  window.getLangCode = function () {
    return localStorage.getItem("site_lang") || "ro";
  };

  window.getLang = function () {
    return window.I18N[window.getLangCode()] || window.I18N.en;
  };

  window.t = function (key) {
    return window.getLang()[key] || window.I18N.en[key] || key;
  };

  window.setLang = function (lang) {
    localStorage.setItem("site_lang", lang);
    location.reload();
  };

  window.applyTranslations = function () {
    document.documentElement.lang = window.getLangCode();

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = window.t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", window.t(el.getAttribute("data-i18n-placeholder")));
    });

    const switcher = document.getElementById("langSwitcher");
    if (switcher) {
      switcher.value = window.getLangCode();
    }
  };
})();

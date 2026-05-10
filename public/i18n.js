(function () {
  const base = {
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

  const make = (o) => Object.assign({}, base, o);

  window.LANG_OPTIONS = [
    ["ro","🇷🇴 RO"],["en","🇺🇸 EN"],["fr","🇫🇷 FR"],["es","🇪🇸 ES"],["de","🇩🇪 DE"],
    ["it","🇮🇹 IT"],["pt","🇵🇹 PT"],["nl","🇳🇱 NL"],["pl","🇵🇱 PL"],["hu","🇭🇺 HU"],
    ["bg","🇧🇬 BG"],["cs","🇨🇿 CZ"],["sk","🇸🇰 SK"],["hr","🇭🇷 HR"],["sr","🇷🇸 SR"],
    ["tr","🇹🇷 TR"],["ru","🇷🇺 RU"],["uk","🇺🇦 UK"],["ar","🇸🇦 AR"],["hi","🇮🇳 HI"],
    ["zh","🇨🇳 ZH"],["ja","🇯🇵 JA"],["ko","🇰🇷 KO"]
  ];

  window.I18N = {
    en: base,

    ro: make({
      lang_name:"Română",
      top_subtitle:"Univers AI privat",
      login:"Login",
      enter_platform:"Intră",
      image_btn:"Încearcă Image Studio",
      member_area:"Deschide zona de membri",
      privacy:"Confidențialitate",
      terms:"Termeni",
      safety:"Siguranță",
      eyebrow:"PRIVAT • CINEMATIC • COMPANIONS AI",
      hero_title:"Linia dintre AI și realitate nu mai există.",
      hero_text:"Creează companions AI fictive, ultra-realiste, conversații private, imagini cinematice și experiențe interactive într-un ecosistem premium.",
      warning_18:"Doar 18+",
      fictional_only:"Doar personaje fictive",
      private_exp:"Experiență privată",
      no_deepfake:"Fără deepfake-uri cu persoane reale",
      ava_card_title:"Lux întunecat",
      ava_card_text:"Misterioasă, cinematică, adaptivă emoțional.",
      image_realism:"Realism imagine",
      image_realism_text:"Preview stil 8K",
      video_scene:"Scenă video",
      video_scene_text:"Clipuri premium 10–20s",
      explore:"EXPLOREAZĂ",
      trending_title:"Universul tău privat AI",
      trending_text:"Totul este construit pentru realism, discreție și experiență cinematică.",
      online:"online",
      ava_role:"Lux întunecat • elegantă • misterioasă",
      mira_role:"Fata de alături • caldă • emoțională",
      kira_role:"Muză cyberpunk • încrezătoare • magnetică",
      luna_role:"Romantic goth • poetică • intensă",
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
      unlock_text:"Pentru MVP, păstrăm totul simplu: experiență premium, câteva personaje foarte bune, generare imagine/video și monetizare prin abonamente + credite."
    }),

    es: make({
      lang_name:"Español",
      top_subtitle:"Universo IA privado",
      login:"Iniciar sesión",
      enter_platform:"Entrar",
      image_btn:"Probar Image Studio",
      member_area:"Abrir zona de miembros",
      privacy:"Privacidad",
      terms:"Términos",
      safety:"Seguridad",
      eyebrow:"PRIVADO • CINEMÁTICO • COMPAÑEROS IA",
      hero_title:"La línea entre la IA y la realidad ya no existe.",
      hero_text:"Crea compañeros IA ficticios ultra realistas, conversaciones privadas, imágenes cinematográficas y experiencias interactivas en un ecosistema premium.",
      warning_18:"Solo 18+",
      fictional_only:"Solo personajes ficticios",
      private_exp:"Experiencia privada",
      no_deepfake:"Sin deepfakes de personas reales",
      ava_card_title:"Lujo oscuro",
      ava_card_text:"Misteriosa, cinematográfica y emocionalmente adaptable.",
      image_realism:"Realismo de imagen",
      image_realism_text:"Vista previa estilo 8K",
      video_scene:"Escena de video",
      video_scene_text:"Clips premium 10–20s",
      explore:"EXPLORAR",
      trending_title:"Tu universo IA privado",
      trending_text:"Todo está construido para realismo, discreción y experiencia cinematográfica.",
      online:"en línea",
      ava_role:"Lujo oscuro • elegante • misteriosa",
      mira_role:"Chica de al lado • cálida • emocional",
      kira_role:"Musa cyberpunk • segura • magnética",
      luna_role:"Romance goth • poética • intensa",
      create:"CREAR",
      multi_title:"Una plataforma. Múltiples experiencias.",
      multi_text:"Construimos el producto alrededor de chat, imagen, video y personajes recurrentes.",
      card1_title:"Crear compañeros IA",
      card1_text:"Genera personajes ficticios con nombre, rol, personalidad, tono y precios multimedia.",
      card2_title:"Chat privado estilo DM",
      card2_text:"Chat cinematográfico, estado online, indicador de escritura y experiencia tipo app social.",
      card3_title:"AI Image Studio",
      card3_text:"Prompts cinematográficos, realismo, iluminación, sensación de cámara y preview premium.",
      card4_title:"AI Video Studio",
      card4_text:"Escenas premium cortas, 5–20 segundos, creadas para teaser y desbloqueo.",
      premium_access:"ACCESO PREMIUM",
      unlock_title:"Desbloquea tu mundo IA privado.",
      unlock_text:"Para el MVP mantenemos todo simple: experiencia premium, pocos personajes fuertes, generación imagen/video y monetización por suscripciones + créditos."
    }),

    fr: make({
      lang_name:"Français",
      top_subtitle:"Univers IA privé",
      login:"Connexion",
      enter_platform:"Entrer",
      image_btn:"Essayer Image Studio",
      member_area:"Ouvrir l’espace membre",
      privacy:"Confidentialité",
      terms:"Conditions",
      safety:"Sécurité",
      eyebrow:"PRIVÉ • CINÉMATIQUE • COMPAGNONS IA",
      hero_title:"La frontière entre l’IA et la réalité n’existe plus.",
      hero_text:"Créez des compagnons IA fictifs ultra réalistes, des conversations privées, des images cinématographiques et des expériences interactives dans un écosystème premium.",
      warning_18:"18+ uniquement",
      fictional_only:"Personnages fictifs uniquement",
      private_exp:"Expérience privée",
      no_deepfake:"Pas de deepfake de personne réelle",
      ava_card_title:"Luxe sombre",
      ava_card_text:"Mystérieuse, cinématique, émotionnellement adaptative.",
      image_realism:"Réalisme image",
      image_realism_text:"Aperçu style 8K",
      video_scene:"Scène vidéo",
      video_scene_text:"Clips premium 10–20s",
      explore:"EXPLORER",
      trending_title:"Votre univers IA privé",
      trending_text:"Tout est conçu pour le réalisme, la discrétion et une expérience cinématographique.",
      online:"en ligne",
      create:"CRÉER",
      multi_title:"Une plateforme. Plusieurs expériences.",
      multi_text:"Nous construisons le produit autour du chat, de l’image, de la vidéo et des personnages récurrents.",
      card1_title:"Créer des compagnons IA",
      card1_text:"Générez des personnages fictifs avec nom, rôle, personnalité, ton et prix média.",
      card2_title:"Chat privé type DM",
      card2_text:"Chat cinématographique, statut en ligne, indicateur de saisie et expérience type réseau social.",
      card3_text:"Prompts cinématographiques, réalisme, éclairage, rendu caméra et aperçu premium.",
      card4_text:"Scènes premium courtes, 5–20 secondes, créées pour teasing et déverrouillage.",
      premium_access:"ACCÈS PREMIUM",
      unlock_title:"Déverrouillez votre monde IA privé.",
      unlock_text:"Pour le MVP, nous gardons les choses simples : expérience premium, quelques personnages forts, génération image/vidéo et monétisation par abonnements + crédits."
    }),

    zh: make({
      lang_name:"中文",
      top_subtitle:"私人 AI 宇宙",
      login:"登录",
      enter_platform:"进入",
      image_btn:"试用图像工作室",
      member_area:"打开会员区",
      privacy:"隐私",
      terms:"条款",
      safety:"安全",
      eyebrow:"私密 • 电影感 • AI 伴侣",
      hero_title:"AI 与现实之间的界限已不复存在。",
      hero_text:"创建超真实的虚构 AI 伴侣、私人对话、电影感图像以及高级互动体验。",
      warning_18:"仅限18+",
      fictional_only:"仅限虚构角色",
      private_exp:"私人体验",
      no_deepfake:"禁止真实人物 deepfake",
      ava_card_title:"暗黑奢华",
      ava_card_text:"神秘、电影感、情感自适应。",
      image_realism:"图像真实感",
      image_realism_text:"8K 风格预览",
      video_scene:"视频场景",
      video_scene_text:"10–20秒高级短片",
      explore:"探索",
      trending_title:"你的私人 AI 宇宙",
      trending_text:"一切都围绕真实感、私密性和电影级体验构建。",
      online:"在线",
      ava_role:"暗黑奢华 • 优雅 • 神秘",
      mira_role:"邻家女孩 • 温暖 • 情感化",
      kira_role:"赛博朋克缪斯 • 自信 • 有吸引力",
      luna_role:"哥特浪漫 • 诗意 • 强烈",
      create:"创建",
      multi_title:"一个平台，多种体验。",
      multi_text:"我们围绕聊天、图像、视频和持续角色体验来构建产品。",
      card1_title:"创建 AI 伴侣",
      card1_text:"生成带有姓名、角色、个性、语气和媒体价格的虚构角色。",
      card2_title:"私人 DM 聊天",
      card2_text:"电影感聊天、在线状态、输入提示和社交应用体验。",
      card3_title:"AI 图像工作室",
      card3_text:"电影感提示词、真实感、光影、镜头感和高级预览。",
      card4_title:"AI 视频工作室",
      card4_text:"5–20秒高级短场景，用于预览和解锁。",
      premium_access:"高级访问",
      unlock_title:"解锁你的私人 AI 世界。",
      unlock_text:"MVP 阶段保持简单：高级体验、少量强角色、图像/视频生成，以及订阅 + 积分变现。"
    }),

    de: make({
      lang_name:"Deutsch",
      top_subtitle:"Privates KI-Universum",
      login:"Login",
      enter_platform:"Betreten",
      image_btn:"Image Studio testen",
      member_area:"Mitgliederbereich öffnen",
      privacy:"Datenschutz",
      terms:"Bedingungen",
      safety:"Sicherheit",
      eyebrow:"PRIVAT • KINEMATISCH • KI-COMPANIONS",
      hero_title:"Die Grenze zwischen KI und Realität existiert nicht mehr.",
      hero_text:"Erstelle ultra-realistische fiktive KI-Companions, private Gespräche, cineastische Bilder und interaktive Premium-Erlebnisse.",
      warning_18:"Nur 18+",
      fictional_only:"Nur fiktive Charaktere",
      private_exp:"Private Erfahrung",
      no_deepfake:"Keine Deepfakes realer Personen",
      explore:"ENTDECKEN",
      trending_title:"Dein privates KI-Universum",
      trending_text:"Alles ist für Realismus, Diskretion und ein cineastisches Erlebnis gebaut.",
      create:"ERSTELLEN",
      multi_title:"Eine Plattform. Mehrere Erlebnisse.",
      premium_access:"PREMIUM-ZUGANG",
      unlock_title:"Schalte deine private KI-Welt frei."
    }),

    it: make({
      lang_name:"Italiano",
      top_subtitle:"Universo IA privato",
      login:"Accedi",
      enter_platform:"Entra",
      image_btn:"Prova Image Studio",
      member_area:"Apri area membri",
      privacy:"Privacy",
      terms:"Termini",
      safety:"Sicurezza",
      eyebrow:"PRIVATO • CINEMATICO • COMPANION IA",
      hero_title:"Il confine tra IA e realtà non esiste più.",
      hero_text:"Crea companion IA fittizi ultra realistici, conversazioni private, immagini cinematografiche ed esperienze interattive premium.",
      warning_18:"Solo 18+",
      fictional_only:"Solo personaggi fittizi",
      private_exp:"Esperienza privata",
      no_deepfake:"Nessun deepfake di persone reali",
      explore:"ESPLORA",
      trending_title:"Il tuo universo IA privato",
      create:"CREA",
      multi_title:"Una piattaforma. Più esperienze.",
      premium_access:"ACCESSO PREMIUM",
      unlock_title:"Sblocca il tuo mondo IA privato."
    }),

    pt: make({
      lang_name:"Português",
      top_subtitle:"Universo IA privado",
      login:"Entrar",
      enter_platform:"Entrar",
      image_btn:"Testar Image Studio",
      member_area:"Abrir área de membros",
      privacy:"Privacidade",
      terms:"Termos",
      safety:"Segurança",
      eyebrow:"PRIVADO • CINEMÁTICO • COMPANIONS IA",
      hero_title:"A linha entre IA e realidade já não existe.",
      hero_text:"Crie companions IA fictícios ultra-realistas, conversas privadas, imagens cinematográficas e experiências interativas premium.",
      warning_18:"Apenas 18+",
      fictional_only:"Apenas personagens fictícios",
      private_exp:"Experiência privada",
      no_deepfake:"Sem deepfakes de pessoas reais",
      explore:"EXPLORAR",
      trending_title:"O seu universo IA privado",
      create:"CRIAR",
      multi_title:"Uma plataforma. Múltiplas experiências.",
      premium_access:"ACESSO PREMIUM",
      unlock_title:"Desbloqueie o seu mundo IA privado."
    })
  };

  const minimal = {
    nl:["Nederlands","Privé AI-universum","Inloggen","Betreden","Alleen 18+","Alleen fictieve personages","Geen deepfakes van echte personen"],
    pl:["Polski","Prywatny świat AI","Zaloguj","Wejdź","Tylko 18+","Tylko fikcyjne postacie","Bez deepfake prawdziwych osób"],
    hu:["Magyar","Privát AI-univerzum","Belépés","Belépés","Csak 18+","Csak kitalált karakterek","Nincs valódi személyes deepfake"],
    bg:["Български","Частна AI вселена","Вход","Влез","Само 18+","Само измислени персонажи","Без deepfake на реални хора"],
    cs:["Čeština","Soukromý AI vesmír","Přihlášení","Vstoupit","Pouze 18+","Pouze fiktivní postavy","Žádné deepfaky skutečných osob"],
    sk:["Slovenčina","Súkromný AI vesmír","Prihlásiť","Vstúpiť","Iba 18+","Iba fiktívne postavy","Žiadne deepfaky skutočných osôb"],
    hr:["Hrvatski","Privatni AI svijet","Prijava","Uđi","Samo 18+","Samo izmišljeni likovi","Bez deepfakea stvarnih osoba"],
    sr:["Srpski","Privatni AI svet","Prijava","Uđi","Samo 18+","Samo izmišljeni likovi","Bez deepfake-a stvarnih osoba"],
    tr:["Türkçe","Özel AI evreni","Giriş","Gir","Sadece 18+","Sadece kurgusal karakterler","Gerçek kişi deepfake yok"],
    ru:["Русский","Частная AI-вселенная","Войти","Войти","Только 18+","Только вымышленные персонажи","Без deepfake реальных людей"],
    uk:["Українська","Приватний AI-всесвіт","Увійти","Увійти","Лише 18+","Лише вигадані персонажі","Без deepfake реальних людей"],
    ar:["العربية","عالم ذكاء اصطناعي خاص","تسجيل الدخول","دخول","لمن هم 18+ فقط","شخصيات خيالية فقط","لا لتزييف الأشخاص الحقيقيين"],
    hi:["हिन्दी","निजी AI यूनिवर्स","लॉगिन","प्रवेश","केवल 18+","केवल काल्पनिक पात्र","वास्तविक लोगों के डीपफेक नहीं"],
    ja:["日本語","プライベートAIユニバース","ログイン","入る","18歳以上のみ","架空キャラクターのみ","実在人物のディープフェイク禁止"],
    ko:["한국어","프라이빗 AI 유니버스","로그인","입장","18세 이상만","가상 캐릭터만","실존 인물 딥페이크 금지"]
  };

  for (const [code, v] of Object.entries(minimal)) {
    window.I18N[code] = make({
      lang_name:v[0],
      top_subtitle:v[1],
      login:v[2],
      enter_platform:v[3],
      warning_18:v[4],
      fictional_only:v[5],
      no_deepfake:v[6]
    });
  }

  if (!localStorage.getItem("site_lang")) localStorage.setItem("site_lang", "ro");

  window.getLangCode = () => localStorage.getItem("site_lang") || "ro";
  window.getLang = () => window.I18N[window.getLangCode()] || window.I18N.en;
  window.t = (key) => window.getLang()[key] || window.I18N.en[key] || key;

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
    if (switcher) switcher.value = window.getLangCode();
  };
})();

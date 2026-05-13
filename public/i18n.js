// public/i18n.js — The Future PRO — stable local translator v4008

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
    premium_intro: "Login, activate a test plan and access companions, chat, images and video.",
    login_test_text: "For MVP testing. Real authentication will be connected on live.",
    email_label: "Email",
    email_placeholder: "email@example.com",
    test_plan_text: "Activate mock BASIC / PLUS / PRO to test access.",
    unlock_title: "Unlock your private AI world.",
    unlock_text: "Premium AI experience with cinematic characters, private chat and image/video generation.",
    choose_plan: "Choose your plan",

    persona_name_placeholder: "Name — ex. Ava Noir",
    persona_category_placeholder: "Category — ex. Roleplay",
    persona_tone_placeholder: "Tone — ex. elegant, mysterious",
    price_image_placeholder: "Image price",
    price_video10_placeholder: "Video 10s price",
    price_video20_placeholder: "Video 20s price",
    create_companion: "Create companion",
    companions: "COMPANIONS",
    write_email: "Write your email.",
    choose_companion_name: "Choose a name for the companion.",
    tone_label: "Tone",
    default_companion_text: "Private AI companion with cinematic personality and adaptive chat.",

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
    safety_confirmation_title: "User confirmation",

    image_studio_title: "AI Image Studio",
    image_studio_short: "IMAGE STUDIO",
    image_studio_heading: "Cinematic AI visuals with premium realism.",
    image_studio_text: "Generate fictional, cinematic and realistic AI images. No real people. No minors. No deepfakes.",
    create_image: "Create image",
    generate_image: "Generate Image",
    preview: "PREVIEW",
    image_result_title: "Your generated image appears here",
    image_result_text: "For the MVP, this page can run in mock mode. The next step is connecting the real image generation endpoint.",
    image_prompt_placeholder: "Ex: ultra realistic cinematic portrait of a fictional AI companion, soft neon lighting, luxury apartment, natural skin texture, expressive eyes, 35mm lens, subtle film grain",
    image_negative_placeholder: "plastic skin, deformed hands, extra fingers, fake CGI look",
    chip_cinematic_portrait: "cinematic portrait",
    chip_neon_luxury: "neon luxury",
    chip_skin_realism: "skin realism",
    chip_camera_realism: "camera realism",
    subscription: "subscription",
    inactive: "inactive",
    write_prompt: "Write a prompt.",
    image_mock_note: "The /api/image/open endpoint is not fully connected yet. The UI is ready.",

    video_studio_title: "AI Video Studio",
    video_studio_short: "VIDEO STUDIO",
    video_studio_heading: "Cinematic short scenes with next-level realism.",
    video_studio_desc: "Generate short, fictional, cinematic and realistic clips.",
    video_studio_text: "Generate short fictional cinematic scenes.",
    create_video_scene: "Create video scene",
    storyboard_prompt: "Storyboard / scene prompt",
    video_storyboard_placeholder: "Ex: cinematic handheld phone-style video of a fictional AI companion in a neon-lit luxury room, subtle movement, natural facial expression, realistic lighting, shallow depth of field",
    video_negative_placeholder: "artifacts, flicker, temporal inconsistency, distorted face, bad hands, extra fingers, watermark, logo, plastic skin",
    chip_handheld: "handheld",
    chip_natural_motion: "natural motion",
    chip_neon_lighting: "neon lighting",
    chip_social_realism: "social realism",
    admin_token_open: "Admin token for OPEN test",
    generate_auth: "Generate Auth",
    generate_open: "Generate Open",
    last_video_url: "Last video URL",
    video_preview: "VIDEO PREVIEW",
    generated_scene_here: "Generated scene appears here",
    video_preview_note: "For a small budget, use video rarely as a premium feature.",
    write_storyboard: "Write a storyboard.",

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
    generate_teaser: "Generate teaser",
    image_teaser: "Image teaser",
    video_teaser: "Video teaser",
    teaser_image: "Image teaser",
    teaser_video: "Video teaser",
    private_teaser_locked: "Private teaser locked",
    unlocked_media: "Unlocked media",
    unlock_full_media: "Unlock full media",
    choose_companion: "Choose Companion",
    you_label: "You",
    unlock_error: "Unlock error",
    choose_companion_from_premium: "Choose a companion from Premium.",
    fallback_ai_message: "I am here. Tell me what kind of experience you want to create tonight.",
    generic_error: "Error",
    media_generation_backend_missing: "Media teaser generation will be available after the backend route is connected.",

    privacy_title: "Your privacy matters.",
    privacy_intro: "We store minimal information required for authentication, subscriptions and platform functionality.",
    privacy_data_title: "Data we store",
    privacy_data_text: "We only store limited account information, session data and subscription status necessary for the platform to function.",
    privacy_payment_title: "Payments and verification",
    privacy_payment_text: "Payments and age verification are handled by third-party providers. We only store confirmation flags and subscription status.",
    privacy_media_title: "Media delivery",
    privacy_media_text: "Generated media may be delivered through temporary or signed links for security and privacy purposes.",
    privacy_security_title: "Security",
    privacy_security_text: "We use security measures, rate limits and protected sessions to reduce abuse and unauthorized access.",

    terms_title: "Platform terms and rules.",
    terms_intro: "By using the platform, you agree to follow all safety, content and usage rules.",
    terms_rule_1: "18+ only.",
    terms_rule_2: "No real persons' faces and no AI undressing of real people.",
    terms_rule_3: "Only AI-generated fictional content from this platform may be edited with advanced tools.",
    terms_rule_4: "Prohibited content includes minors, bestiality, sexual violence, non-consensual content and illegal activity.",
    terms_rule_5: "Users are responsible for how generated content is used or distributed.",
    terms_rule_6: "Accounts violating platform rules may be suspended or removed.",

    upgrade_title: "Upgrade your subscription.",
    upgrade_intro: "PLUS and PRO features require an active subscription.",
    back_to_premium: "Back to Premium",
    quick_login: "Quick Login",
    activate_pro_mock: "Activate PRO (mock)",
    upgrade_after: "After activation, return to the Image Generator.",
    open_image_generator: "Open Image Generator",

    feedback_title: "Ideas & Feedback",
    feedback_intro: "Suggest features or vote for other user ideas. AI-fantasy only, no real people.",
    feedback_title_placeholder: "Short title",
    feedback_body_placeholder: "Describe the idea in 1–3 paragraphs.",
    feedback_send: "Submit idea",
    feedback_top: "Top ideas",
    feedback_fill_required: "Complete the title and description.",
    feedback_sending: "Sending...",
    feedback_thanks: "Thank you! Your idea has been submitted."
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
    premium_intro: "Autentifică-te, activează un plan de test și accesează companions, chat, imagini și video.",
    login_test_text: "Pentru test MVP. Pe live se va conecta autentificare reală.",
    email_label: "Email",
    email_placeholder: "email@example.com",
    test_plan_text: "Activează mock BASIC / PLUS / PRO pentru a testa accesul.",
    unlock_title: "Deblochează lumea ta privată AI.",
    unlock_text: "Experiență AI premium cu personaje cinematice, chat privat și generare imagine/video.",
    choose_plan: "Alege planul",

    persona_name_placeholder: "Nume — ex. Ava Noir",
    persona_category_placeholder: "Categorie — ex. Roleplay",
    persona_tone_placeholder: "Ton — ex. elegant, misterios",
    price_image_placeholder: "Preț imagine",
    price_video10_placeholder: "Preț video 10s",
    price_video20_placeholder: "Preț video 20s",
    create_companion: "Creează companion",
    companions: "COMPANIONS",
    write_email: "Scrie emailul.",
    choose_companion_name: "Alege un nume pentru companion.",
    tone_label: "Ton",
    default_companion_text: "Companion AI privat cu personalitate cinematică și chat adaptiv.",

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
    safety_confirmation_title: "Confirmare utilizator",

    image_studio_title: "AI Image Studio",
    image_studio_short: "IMAGE STUDIO",
    image_studio_heading: "Vizualuri AI cinematice cu realism premium.",
    image_studio_text: "Generează imagini AI fictive, cinematice și realiste. Fără persoane reale. Fără minori. Fără deepfake-uri.",
    create_image: "Creează imagine",
    generate_image: "Generează imagine",
    preview: "PREVIEW",
    image_result_title: "Imaginea generată va apărea aici",
    image_result_text: "Pentru MVP, pagina poate porni în mock mode. Următorul pas este conectarea endpointului real de image generation.",
    image_prompt_placeholder: "Ex: portret cinematic ultra-realist al unui companion AI fictiv, lumină neon soft, apartament luxury, textură naturală a pielii, ochi expresivi, obiectiv 35mm, film grain subtil",
    image_negative_placeholder: "piele de plastic, mâini deformate, degete în plus, aspect CGI fals",
    chip_cinematic_portrait: "portret cinematic",
    chip_neon_luxury: "neon luxury",
    chip_skin_realism: "realism piele",
    chip_camera_realism: "realism cameră",
    subscription: "abonament",
    inactive: "inactiv",
    write_prompt: "Scrie un prompt.",
    image_mock_note: "Endpointul /api/image/open nu este încă legat complet. UI-ul este pregătit.",

    video_studio_title: "AI Video Studio",
    video_studio_short: "VIDEO STUDIO",
    video_studio_heading: "Scene scurte cinematice cu realism avansat.",
    video_studio_desc: "Generează clipuri scurte, fictive, cinematice și realiste.",
    video_studio_text: "Generează scene scurte fictive și cinematice.",
    create_video_scene: "Creează scenă video",
    storyboard_prompt: "Storyboard / prompt scenă",
    video_storyboard_placeholder: "Ex: video cinematic stil telefon, cu un companion AI fictiv într-o cameră luxury cu lumină neon, mișcare subtilă, expresie naturală, lumină realistă, profunzime redusă de câmp",
    video_negative_placeholder: "artefacte, flicker, inconsistență temporală, față distorsionată, mâini greșite, degete în plus, watermark, logo, piele de plastic",
    chip_handheld: "handheld",
    chip_natural_motion: "mișcare naturală",
    chip_neon_lighting: "lumină neon",
    chip_social_realism: "realism social",
    admin_token_open: "Admin token pentru test OPEN",
    generate_auth: "Generează Auth",
    generate_open: "Generează Open",
    last_video_url: "Ultimul URL video",
    video_preview: "VIDEO PREVIEW",
    generated_scene_here: "Scena generată va apărea aici",
    video_preview_note: "Pentru buget mic, folosește video rar, ca feature premium.",
    write_storyboard: "Scrie un storyboard.",

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
    generate_teaser: "Generează teaser",
    image_teaser: "Teaser imagine",
    video_teaser: "Teaser video",
    teaser_image: "Teaser imagine",
    teaser_video: "Teaser video",
    private_teaser_locked: "Teaser privat blocat",
    unlocked_media: "Media deblocată",
    unlock_full_media: "Deblochează media completă",
    choose_companion: "Alege companion",
    you_label: "Tu",
    unlock_error: "Eroare la deblocare",
    choose_companion_from_premium: "Alege un companion din Premium.",
    fallback_ai_message: "Sunt aici. Spune-mi ce tip de experiență vrei să creezi în această seară.",
    generic_error: "Eroare",
    media_generation_backend_missing: "Generarea teaserelor media va fi disponibilă după conectarea backendului.",

    privacy_title: "Confidențialitatea ta contează.",
    privacy_intro: "Stocăm doar informațiile minime necesare pentru autentificare, abonamente și funcționarea platformei.",
    privacy_data_title: "Date stocate",
    privacy_data_text: "Stocăm doar informații limitate despre cont, sesiune și statusul abonamentului necesare funcționării platformei.",
    privacy_payment_title: "Plăți și verificare",
    privacy_payment_text: "Plățile și verificarea vârstei sunt gestionate de furnizori terți. Noi stocăm doar confirmările și statusul abonamentului.",
    privacy_media_title: "Livrare media",
    privacy_media_text: "Media generată poate fi livrată prin linkuri temporare sau semnate, pentru siguranță și confidențialitate.",
    privacy_security_title: "Securitate",
    privacy_security_text: "Folosim măsuri de securitate, rate limits și sesiuni protejate pentru a reduce abuzul și accesul neautorizat.",

    terms_title: "Termenii și regulile platformei.",
    terms_intro: "Prin utilizarea platformei accepți toate regulile de siguranță, conținut și utilizare.",
    terms_rule_1: "Doar 18+.",
    terms_rule_2: "Fără fețe ale persoanelor reale și fără dezbrăcarea AI a persoanelor reale.",
    terms_rule_3: "Doar conținutul fictiv generat de platformă poate fi editat cu instrumente avansate.",
    terms_rule_4: "Conținutul interzis include minori, bestialitate, violență sexuală, conținut neconsensual și activități ilegale.",
    terms_rule_5: "Utilizatorii sunt responsabili pentru modul în care folosesc sau distribuie conținutul generat.",
    terms_rule_6: "Conturile care încalcă regulile platformei pot fi suspendate sau eliminate.",

    upgrade_title: "Upgrade abonament.",
    upgrade_intro: "Funcțiile PLUS și PRO necesită un abonament activ.",
    back_to_premium: "Înapoi la Premium",
    quick_login: "Login rapid",
    activate_pro_mock: "Activează PRO (mock)",
    upgrade_after: "După activare, revino la Generatorul de Imagini.",
    open_image_generator: "Deschide Generator Imagine",

    feedback_title: "Idei & Feedback",
    feedback_intro: "Propune ce să dezvoltăm sau votează ideile altor utilizatori. AI-fantasy only, fără persoane reale.",
    feedback_title_placeholder: "Titlu scurt",
    feedback_body_placeholder: "Descrie ideea în 1–3 paragrafe.",
    feedback_send: "Trimite propunerea",
    feedback_top: "Top idei",
    feedback_fill_required: "Completează titlul și descrierea.",
    feedback_sending: "Se trimite...",
    feedback_thanks: "Mulțumim! Ideea ta a fost înregistrată."
  };

  const FR = {
    login: "Connexion",
    enter_platform: "Entrer",
    image_btn: "Essayer Image Studio",
    member_area: "Espace membre",
    privacy: "Confidentialité",
    terms: "Conditions",
    safety: "Sécurité",
    logout: "Déconnexion",
    create: "CRÉER",
    online: "en ligne",
    premium_access: "ACCÈS PREMIUM",
    premium_title: "Votre expérience IA privée commence ici.",
    premium_intro: "Connectez-vous, activez un plan de test et accédez aux companions, au chat, aux images et aux vidéos.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Chat privé",
    image_studio_heading: "Visuels IA cinématiques avec un réalisme premium.",
    image_studio_text: "Générez des images IA fictives, cinématiques et réalistes. Pas de vraies personnes. Pas de mineurs. Pas de deepfakes.",
    video_studio_heading: "Courtes scènes cinématiques avec un réalisme avancé.",
    video_studio_desc: "Générez de courts clips fictifs, cinématiques et réalistes.",
    create_image: "Créer une image",
    create_video_scene: "Créer une scène vidéo",
    generate_image: "Générer l’image",
    generate_teaser: "Générer un teaser",
    send: "Envoyer",
    chat_placeholder: "Écrivez un message...",
    privacy_title: "Votre vie privée compte.",
    terms_title: "Conditions et règles de la plateforme.",
    safety_title: "Règles de sécurité",
    upgrade_title: "Améliorez votre abonnement."
  };

  const ES = {
    login: "Iniciar sesión",
    enter_platform: "Entrar",
    image_btn: "Probar Image Studio",
    member_area: "Área de miembros",
    privacy: "Privacidad",
    terms: "Términos",
    safety: "Seguridad",
    logout: "Cerrar sesión",
    create: "CREAR",
    online: "en línea",
    premium_access: "ACCESO PREMIUM",
    premium_title: "Tu experiencia privada de IA empieza aquí.",
    premium_intro: "Inicia sesión, activa un plan de prueba y accede a companions, chat, imágenes y video.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Chat privado",
    image_studio_heading: "Visuales IA cinematográficos con realismo premium.",
    image_studio_text: "Genera imágenes IA ficticias, cinematográficas y realistas. Sin personas reales. Sin menores. Sin deepfakes.",
    video_studio_heading: "Escenas cortas cinematográficas con realismo avanzado.",
    video_studio_desc: "Genera clips cortos ficticios, cinematográficos y realistas.",
    create_image: "Crear imagen",
    create_video_scene: "Crear escena de video",
    generate_image: "Generar imagen",
    generate_teaser: "Generar teaser",
    send: "Enviar",
    chat_placeholder: "Escribe un mensaje...",
    privacy_title: "Tu privacidad importa.",
    terms_title: "Términos y reglas de la plataforma.",
    safety_title: "Reglas de seguridad",
    upgrade_title: "Mejora tu suscripción."
  };

  const DE = {
    login: "Anmelden",
    enter_platform: "Betreten",
    image_btn: "Image Studio testen",
    member_area: "Mitgliederbereich",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    safety: "Sicherheit",
    logout: "Abmelden",
    create: "ERSTELLEN",
    online: "online",
    premium_access: "PREMIUM-ZUGANG",
    premium_title: "Dein privates KI-Erlebnis beginnt hier.",
    premium_intro: "Melde dich an, aktiviere einen Testplan und greife auf Companions, Chat, Bilder und Videos zu.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Privater Chat",
    image_studio_heading: "Kinematische KI-Bilder mit Premium-Realismus.",
    image_studio_text: "Erzeuge fiktive, kinematische und realistische KI-Bilder. Keine echten Personen. Keine Minderjährigen. Keine Deepfakes.",
    video_studio_heading: "Kurze kinematische Szenen mit fortgeschrittenem Realismus.",
    video_studio_desc: "Erzeuge kurze fiktive, kinematische und realistische Clips.",
    create_image: "Bild erstellen",
    create_video_scene: "Videoszene erstellen",
    generate_image: "Bild generieren",
    generate_teaser: "Teaser generieren",
    send: "Senden",
    chat_placeholder: "Nachricht schreiben...",
    privacy_title: "Deine Privatsphäre ist wichtig.",
    terms_title: "Plattformbedingungen und Regeln.",
    safety_title: "Sicherheitsregeln",
    upgrade_title: "Abo upgraden."
  };

  const IT = {
    login: "Accesso",
    enter_platform: "Entra",
    image_btn: "Prova Image Studio",
    member_area: "Area membri",
    privacy: "Privacy",
    terms: "Termini",
    safety: "Sicurezza",
    logout: "Esci",
    create: "CREA",
    online: "online",
    premium_access: "ACCESSO PREMIUM",
    premium_title: "La tua esperienza IA privata inizia qui.",
    premium_intro: "Accedi, attiva un piano di test e usa companion, chat, immagini e video.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Chat privata",
    image_studio_heading: "Visual IA cinematografici con realismo premium.",
    image_studio_text: "Genera immagini IA fittizie, cinematografiche e realistiche. Nessuna persona reale. Nessun minore. Nessun deepfake.",
    video_studio_heading: "Brevi scene cinematografiche con realismo avanzato.",
    video_studio_desc: "Genera brevi clip fittizie, cinematografiche e realistiche.",
    create_image: "Crea immagine",
    create_video_scene: "Crea scena video",
    generate_image: "Genera immagine",
    generate_teaser: "Genera teaser",
    send: "Invia",
    chat_placeholder: "Scrivi un messaggio...",
    privacy_title: "La tua privacy è importante.",
    terms_title: "Termini e regole della piattaforma.",
    safety_title: "Regole di sicurezza",
    upgrade_title: "Aggiorna il tuo abbonamento."
  };

  const PT = {
    login: "Entrar",
    enter_platform: "Acessar",
    image_btn: "Experimentar Image Studio",
    member_area: "Área de membros",
    privacy: "Privacidade",
    terms: "Termos",
    safety: "Segurança",
    logout: "Sair",
    create: "CRIAR",
    online: "online",
    premium_access: "ACESSO PREMIUM",
    premium_title: "A sua experiência privada de IA começa aqui.",
    premium_intro: "Entre, ative um plano de teste e acesse companions, chat, imagens e vídeo.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Chat privado",
    image_studio_heading: "Visuais IA cinematográficos com realismo premium.",
    image_studio_text: "Gere imagens IA fictícias, cinematográficas e realistas. Sem pessoas reais. Sem menores. Sem deepfakes.",
    video_studio_heading: "Cenas curtas cinematográficas com realismo avançado.",
    video_studio_desc: "Gere clipes curtos fictícios, cinematográficos e realistas.",
    create_image: "Criar imagem",
    create_video_scene: "Criar cena de vídeo",
    generate_image: "Gerar imagem",
    generate_teaser: "Gerar teaser",
    send: "Enviar",
    chat_placeholder: "Escreva uma mensagem...",
    privacy_title: "A sua privacidade importa.",
    terms_title: "Termos e regras da plataforma.",
    safety_title: "Regras de segurança",
    upgrade_title: "Atualize a sua assinatura."
  };

  const NL = {
    login: "Inloggen",
    enter_platform: "Openen",
    image_btn: "Probeer Image Studio",
    member_area: "Ledenruimte",
    privacy: "Privacy",
    terms: "Voorwaarden",
    safety: "Veiligheid",
    logout: "Uitloggen",
    create: "MAKEN",
    online: "online",
    premium_access: "PREMIUM TOEGANG",
    premium_title: "Je privé AI-ervaring begint hier.",
    premium_intro: "Log in, activeer een testplan en krijg toegang tot companions, chat, afbeeldingen en video.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Privéchat",
    image_studio_heading: "Cinematische AI-beelden met premium realisme.",
    image_studio_text: "Genereer fictieve, cinematografische en realistische AI-afbeeldingen. Geen echte mensen. Geen minderjarigen. Geen deepfakes.",
    video_studio_heading: "Korte cinematografische scènes met geavanceerd realisme.",
    video_studio_desc: "Genereer korte fictieve, cinematografische en realistische clips.",
    create_image: "Afbeelding maken",
    create_video_scene: "Videoscène maken",
    generate_image: "Afbeelding genereren",
    generate_teaser: "Teaser genereren",
    send: "Versturen",
    chat_placeholder: "Schrijf een bericht...",
    privacy_title: "Je privacy is belangrijk.",
    terms_title: "Platformvoorwaarden en regels.",
    safety_title: "Veiligheidsregels",
    upgrade_title: "Upgrade je abonnement."
  };

  const TR = {
    login: "Giriş",
    enter_platform: "Gir",
    image_btn: "Image Studio Dene",
    member_area: "Üye alanı",
    privacy: "Gizlilik",
    terms: "Şartlar",
    safety: "Güvenlik",
    logout: "Çıkış",
    create: "OLUŞTUR",
    online: "çevrimiçi",
    premium_access: "PREMIUM ERİŞİM",
    premium_title: "Özel AI deneyimin burada başlar.",
    premium_intro: "Giriş yap, test planını etkinleştir ve companion, sohbet, görsel ve videoya eriş.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Özel sohbet",
    image_studio_heading: "Premium gerçekçilikte sinematik AI görselleri.",
    image_studio_text: "Kurgusal, sinematik ve gerçekçi AI görselleri oluştur. Gerçek kişiler yok. Reşit olmayanlar yok. Deepfake yok.",
    video_studio_heading: "Üst düzey gerçekçilikte kısa sinematik sahneler.",
    video_studio_desc: "Kısa, kurgusal, sinematik ve gerçekçi klipler oluştur.",
    create_image: "Görsel oluştur",
    create_video_scene: "Video sahnesi oluştur",
    generate_image: "Görsel üret",
    generate_teaser: "Teaser oluştur",
    send: "Gönder",
    chat_placeholder: "Bir mesaj yaz...",
    privacy_title: "Gizliliğin önemlidir.",
    terms_title: "Platform şartları ve kuralları.",
    safety_title: "Güvenlik kuralları",
    upgrade_title: "Aboneliğini yükselt."
  };

  const RU = {
    login: "Войти",
    enter_platform: "Открыть",
    image_btn: "Попробовать Image Studio",
    member_area: "Зона участников",
    privacy: "Конфиденциальность",
    terms: "Условия",
    safety: "Безопасность",
    logout: "Выйти",
    create: "СОЗДАТЬ",
    online: "онлайн",
    premium_access: "ПРЕМИУМ ДОСТУП",
    premium_title: "Ваш приватный AI-опыт начинается здесь.",
    premium_intro: "Войдите, активируйте тестовый план и получите доступ к companions, чату, изображениям и видео.",
    image_studio_title: "AI Image Studio",
    video_studio_title: "AI Video Studio",
    chat_title: "Приватный чат",
    image_studio_heading: "Кинематографичные AI-визуалы с премиальным реализмом.",
    image_studio_text: "Создавайте вымышленные, кинематографичные и реалистичные AI-изображения. Без реальных людей. Без несовершеннолетних. Без дипфейков.",
    video_studio_heading: "Короткие кинематографичные сцены с высоким реализмом.",
    video_studio_desc: "Создавайте короткие вымышленные, кинематографичные и реалистичные клипы.",
    create_image: "Создать изображение",
    create_video_scene: "Создать видеосцену",
    generate_image: "Сгенерировать изображение",
    generate_teaser: "Создать тизер",
    send: "Отправить",
    chat_placeholder: "Напишите сообщение...",
    privacy_title: "Ваша конфиденциальность важна.",
    privacy_intro: "Мы храним минимальную информацию, необходимую для аутентификации, подписок и работы платформы.",
    privacy_data_title: "Данные, которые мы храним",
    privacy_data_text: "Мы храним только ограниченную информацию об аккаунте, данные сессии и статус подписки, необходимые для работы платформы.",
    privacy_payment_title: "Платежи и проверка",
    privacy_payment_text: "Платежи и проверка возраста выполняются сторонними провайдерами. Мы храним только подтверждения и статус подписки.",
    privacy_media_title: "Доставка медиа",
    privacy_media_text: "Сгенерированные медиа могут доставляться через временные или подписанные ссылки для безопасности и конфиденциальности.",
    privacy_security_title: "Безопасность",
    privacy_security_text: "Мы используем меры безопасности, лимиты запросов и защищенные сессии для снижения злоупотреблений и несанкционированного доступа.",
    terms_title: "Условия и правила платформы.",
    terms_intro: "Используя платформу, вы соглашаетесь соблюдать все правила безопасности, контента и использования.",
    safety_title: "Правила безопасности",
    safety_intro: "Чтобы платформа оставалась безопасной и соответствовала требованиям, вы должны соблюдать эти правила.",
    upgrade_title: "Обновите подписку.",
    upgrade_intro: "Функции PLUS и PRO требуют активной подписки."
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

  const OPTION_TRANSLATIONS = {
    "Image teaser": { ro:"Teaser imagine", en:"Image teaser", fr:"Teaser image", es:"Teaser de imagen", de:"Bild-Teaser", it:"Teaser immagine", pt:"Teaser de imagem", nl:"Afbeelding teaser", tr:"Görsel teaser", ru:"Тизер изображения" },
    "Video teaser": { ro:"Teaser video", en:"Video teaser", fr:"Teaser vidéo", es:"Teaser de video", de:"Video-Teaser", it:"Teaser video", pt:"Teaser de vídeo", nl:"Video teaser", tr:"Video teaser", ru:"Видео тизер" },
    "Female": { ro:"Feminin", en:"Female", fr:"Féminin", es:"Femenino", de:"Weiblich", it:"Femminile", pt:"Feminino", nl:"Vrouwelijk", tr:"Kadın", ru:"Женский" },
    "Male": { ro:"Masculin", en:"Male", fr:"Masculin", es:"Masculino", de:"Männlich", it:"Maschile", pt:"Masculino", nl:"Mannelijk", tr:"Erkek", ru:"Мужской" },
    "Anime": { ro:"Anime", en:"Anime", fr:"Anime", es:"Anime", de:"Anime", it:"Anime", pt:"Anime", nl:"Anime", tr:"Anime", ru:"Аниме" },
    "Girlfriend": { ro:"Iubită", en:"Girlfriend", fr:"Petite amie", es:"Novia", de:"Freundin", it:"Fidanzata", pt:"Namorada", nl:"Vriendin", tr:"Kız arkadaş", ru:"Девушка" },
    "Goth": { ro:"Goth", en:"Goth", fr:"Gothique", es:"Gótica", de:"Gothic", it:"Gotica", pt:"Gótica", nl:"Gothic", tr:"Gotik", ru:"Готика" },
    "CEO / Boss": { ro:"CEO / Șefă", en:"CEO / Boss", fr:"PDG / Patronne", es:"CEO / Jefa", de:"CEO / Chefin", it:"CEO / Capo", pt:"CEO / Chefe", nl:"CEO / Baas", tr:"CEO / Patron", ru:"CEO / Босс" },
    "Personal Trainer": { ro:"Antrenoare personală", en:"Personal Trainer", fr:"Coach personnel", es:"Entrenadora personal", de:"Personal Trainerin", it:"Personal trainer", pt:"Personal trainer", nl:"Personal trainer", tr:"Kişisel antrenör", ru:"Персональный тренер" },
    "Soft Romantic": { ro:"Romantică delicată", en:"Soft Romantic", fr:"Romantique douce", es:"Romántica suave", de:"Sanft romantisch", it:"Romantica dolce", pt:"Romântica suave", nl:"Zacht romantisch", tr:"Yumuşak romantik", ru:"Нежная романтика" },
    "Cyberpunk Muse": { ro:"Muză cyberpunk", en:"Cyberpunk Muse", fr:"Muse cyberpunk", es:"Musa cyberpunk", de:"Cyberpunk-Muse", it:"Musa cyberpunk", pt:"Musa cyberpunk", nl:"Cyberpunk muze", tr:"Cyberpunk ilham perisi", ru:"Киберпанк-муза" },
    "Elf Queen": { ro:"Regină elfă", en:"Elf Queen", fr:"Reine elfe", es:"Reina elfa", de:"Elfenkönigin", it:"Regina elfica", pt:"Rainha elfa", nl:"Elfenkoningin", tr:"Elf kraliçesi", ru:"Эльфийская королева" },
    "Bookish Introvert": { ro:"Introvertită pasionată de cărți", en:"Bookish Introvert", fr:"Introvertie littéraire", es:"Introvertida lectora", de:"Bücherliebende Introvertierte", it:"Introversa amante dei libri", pt:"Introvertida literária", nl:"Boekige introvert", tr:"Kitap kurdu içe dönük", ru:"Книжная интровертка" },
    "1080p": { ro:"1080p", en:"1080p", fr:"1080p", es:"1080p", de:"1080p", it:"1080p", pt:"1080p", nl:"1080p", tr:"1080p", ru:"1080p" },
    "4k": { ro:"4K", en:"4K", fr:"4K", es:"4K", de:"4K", it:"4K", pt:"4K", nl:"4K", tr:"4K", ru:"4K" }
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

  function translateOptions(lang) {
    document.querySelectorAll("select option").forEach(function (opt) {
      const original = opt.getAttribute("data-original-text") || opt.textContent.trim();

      if (!opt.getAttribute("data-original-text")) {
        opt.setAttribute("data-original-text", original);
      }

      if (OPTION_TRANSLATIONS[original] && OPTION_TRANSLATIONS[original][lang]) {
        opt.textContent = OPTION_TRANSLATIONS[original][lang];
      }
    });
  }

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
        opt.setAttribute("data-original-text", label);
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

    translateOptions(lang);
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.applyTranslations();
  });
})();

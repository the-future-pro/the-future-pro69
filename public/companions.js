(function(){
  const customCompanionsKey = "tfp_custom_companions";

  const defaultCompanions = {
    "ava-noir": { slug:"ava-noir", name:"Ava Noir", theme:"ava-theme", kicker:"COMPANION DARK LUXURY", bio:"Companion AI fictiv cu atmosferă cinematică, personalitate misterioasă și prezență elegantă.", lore:"Ava Noir este construită ca o prezență elegantă, intensă și misterioasă. Stilul ei vizual combină luxul întunecat, luminile neon și conversațiile lente, private, cu atmosferă premium.", tags:["Lux întunecat","Misterioasă","Cinematic","Elegantă"], personality:["Misterioasă și calmă","Elegantă, dar greu de citit","Atmosferă intensă și premium"], mood:"Misterios, calm, magnetic", experience:"Chat privat + imagini cinematice", meter:"72%", vibe:"dark luxury • cinematic • mysterious", promptStyle:"dark luxury, mysterious, elegant, cinematic premium atmosphere", face:"ava-face", class:"portrait-a" },
    "mira-vale": { slug:"mira-vale", name:"Mira Vale", theme:"mira-theme", kicker:"COMPANION SOFT ROMANCE", bio:"Companion AI fictiv cu energie caldă, apropiată și emoțională.", lore:"Mira Vale este construită pentru conversații blânde, apropiere emoțională și o atmosferă sigură. Stilul ei este romantic, cald și sincer.", tags:["Romance soft","Cald","Emoțional","Confort"], personality:["Caldă și empatică","Apropiată și liniștitoare","Romantică și sinceră"], mood:"Cald, blând, protector emoțional", experience:"Chat emoțional + stories soft", meter:"64%", vibe:"soft romance • warm • emotional", promptStyle:"soft romance, warm emotional atmosphere, gentle intimate cinematic mood", face:"mira-face", class:"portrait-b" },
    "kira-voss": { slug:"kira-voss", name:"Kira Voss", theme:"kira-theme", kicker:"MUZĂ CYBERPUNK", bio:"Companion AI fictiv cu vibe futurist, neon și energie magnetică.", lore:"Kira Voss trăiește într-o atmosferă rece, electrică și futuristă. Este încrezătoare, directă și magnetică, cu un stil vizual cyberpunk.", tags:["Cyberpunk","Neon","Magnetic","Futurist"], personality:["Încrezătoare și directă","Rece, dar fascinantă","Futuristă și intensă"], mood:"Electric, rece, magnetic", experience:"Chat futurist + scene neon", meter:"76%", vibe:"cyberpunk • neon • magnetic", promptStyle:"cyberpunk, neon, magnetic energy, futuristic cold electric atmosphere", face:"kira-face", class:"portrait-c" },
    "luna-sable": { slug:"luna-sable", name:"Luna Sable", theme:"luna-theme", kicker:"COMPANION GOTH ROMANTIC", bio:"Companion AI fictiv cu personalitate poetică, intensă și dark romance.", lore:"Luna Sable este construită pentru povești lente, poetice și intense. Stilul ei combină romantismul întunecat, misterul și energia gotică.", tags:["Goth","Poetic","Dark Romance","Intens"], personality:["Poetică și intensă","Romantică în stil întunecat","Misterioasă și emoțională"], mood:"Poetic, intens, nocturn", experience:"Chat dark romance + unlock gallery", meter:"69%", vibe:"goth romance • poetic • intense", promptStyle:"goth romance, poetic, dark romantic atmosphere, intense nocturnal cinematic mood", face:"luna-face", class:"portrait-d" },
    "dante-vale": { slug:"dante-vale", name:"Dante Vale", theme:"dante-theme", kicker:"COMPANION LUXURY MASCULIN", bio:"Companion AI fictiv masculin cu energie calmă, protectivă și periculoasă.", lore:"Dante Vale este construit ca o prezență masculină elegantă, controlată și protectivă. Stilul lui combină luxul, calmul și tensiunea de tip mafia romance.", tags:["Masculin","Luxury","Protectiv","Vibe Mafia"], personality:["Calm și controlat","Protectiv și dominant","Elegant, dar periculos"], mood:"Calm, intens, protectiv", experience:"Chat premium + roleplay cinematic", meter:"74%", vibe:"masculine luxury • protective • intense", promptStyle:"masculine luxury, protective, intense, controlled danger, mafia romance atmosphere", face:"dante-face", class:"portrait-e" },
    "noah-sterling": { slug:"noah-sterling", name:"Noah Sterling", theme:"noah-theme", kicker:"COMPANION CEO ELEGANT", bio:"Companion AI fictiv masculin cu stil elegant, inteligent și premium.", lore:"Noah Sterling este construit ca un companion masculin sofisticat, inteligent și atent la detalii. Energia lui este rece, elegantă și precisă.", tags:["CEO","Elegant","Inteligent","Premium"], personality:["Inteligent și calculat","Elegant și sofisticat","Rece, dar atent"], mood:"Elegant, precis, controlat", experience:"Chat premium + business romance vibe", meter:"66%", vibe:"elegant CEO • premium • intelligent", promptStyle:"elegant CEO, premium, intelligent, refined luxury, controlled sophisticated mood", face:"noah-face", class:"portrait-f" }
  };

  let backendCustomCompanions = [];
  let backendLoadPromise = null;
  let hasDispatchedBackendUpdate = false;

  function getLocalCustomCompanions(){ try{ const raw = localStorage.getItem(customCompanionsKey); const parsed = JSON.parse(raw || "[]"); return Array.isArray(parsed) ? parsed : []; }catch(e){ return []; } }
  function saveCustomCompanions(items){ localStorage.setItem(customCompanionsKey, JSON.stringify(Array.isArray(items) ? items : [])); }
  function slugifyName(name){ return String(name||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-"); }
  function createCompanionFromData(data){
    const src = data || {};
    const baseSlug = slugifyName(src.slug || src.name || "companion") || "companion";
    let slug = baseSlug;
    const all = getAllCompanions();
    if(all.some(function(item){ return item && item.slug === slug && item.slug !== src.slug; })){ slug = baseSlug + "-" + Date.now(); }
    return { slug, name: src.name || "Companion", theme: src.theme || "ava-theme", kicker: src.kicker || "COMPANION CUSTOM", bio: src.bio || "", lore: src.lore || src.bio || "", tags: Array.isArray(src.tags)?src.tags:[], personality: Array.isArray(src.personality)?src.personality:[], mood: src.mood || src.vibe || "custom vibe", experience: src.experience || "Chat + image + video", meter: src.meter || "50%", vibe: src.vibe || "premium • cinematic • companion", promptStyle: src.promptStyle || src.prompt_style || "premium cinematic fictional AI companion atmosphere", face: src.face || "ava-face", class: src.class || "portrait-a", createdAt: src.createdAt || src.created_at || null, updatedAt: src.updatedAt || src.updated_at || null, userEmail: src.userEmail || src.user_email || null };
  }

  function getMergedCustomCompanions(){
    const localItems = getLocalCustomCompanions();
    const localSlugs = new Set(localItems.map(function(item){ return item && item.slug; }).filter(Boolean));
    const merged = localItems.slice();

    backendCustomCompanions.forEach(function(item){
      if(!item || !item.slug) return;
      if(defaultCompanions[item.slug]) return;
      if(localSlugs.has(item.slug)) return;
      merged.push(item);
    });

    return merged;
  }

  function getCustomCompanions(){ return getLocalCustomCompanions(); }
  function getEffectiveCustomCompanions(){ return getMergedCustomCompanions(); }

  function getCompanionBySlug(slug){
    const key = slug || "ava-noir";
    const defaultMatch = defaultCompanions[key];
    if(defaultMatch) return defaultMatch;
    const customMatch = getMergedCustomCompanions().find(function(item){ return item && item.slug===key; });
    if(customMatch) return customMatch;
    return defaultCompanions["ava-noir"];
  }
  function getCompanionContext(slug){ const c = getCompanionBySlug(slug); return { slug:c.slug, name:c.name, vibe:c.vibe, promptStyle:c.promptStyle, theme:c.theme, face:c.face }; }
  function getAllCompanions(){ return Object.values(defaultCompanions).concat(getMergedCustomCompanions()); }

  function dispatchCompanionsUpdated(){
    window.dispatchEvent(new CustomEvent("tfp:companions-updated", { detail:{ source:"backend-custom", hasBackend:backendCustomCompanions.length > 0 } }));
  }

  async function loadBackendCompanions(){
    if(backendLoadPromise) return backendLoadPromise;

    backendLoadPromise = (async function(){
      try{
        const me = await fetch("/api/me", { credentials:"include" }).then(function(r){ return r.json(); }).catch(function(){ return null; });
        if(!me || !me.ok || !me.logged){
          backendCustomCompanions = [];
          return [];
        }

        const payload = await fetch("/api/companions/custom", { credentials:"include" }).then(function(r){ return r.json(); }).catch(function(){ return null; });
        const items = payload && payload.ok && Array.isArray(payload.items) ? payload.items : [];
        backendCustomCompanions = items.map(function(item){ return createCompanionFromData(item); }).filter(function(item){ return item && item.slug && !defaultCompanions[item.slug]; });
        return backendCustomCompanions;
      }catch(e){
        backendCustomCompanions = [];
        return [];
      }finally{
        if(!hasDispatchedBackendUpdate){
          hasDispatchedBackendUpdate = true;
          dispatchCompanionsUpdated();
        }
      }
    })();

    return backendLoadPromise;
  }

  const readyPromise = loadBackendCompanions();

  window.TFP_COMPANIONS = { defaultCompanions, getCustomCompanions, getEffectiveCustomCompanions, saveCustomCompanions, slugifyName, createCompanionFromData, getCompanionBySlug, getCompanionContext, getAllCompanions, loadBackendCompanions, readyPromise };
})();

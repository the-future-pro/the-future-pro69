(function(){
  function getCompanions(){
    return window.TFP_COMPANIONS || {};
  }

  function getCompanion(slug){
    const companions = getCompanions();
    return companions[slug] || companions["ava-noir"] || null;
  }

  function companionUrl(slug){
    const companion = getCompanion(slug);
    return companion && companion.profileLink ? companion.profileLink : "/profile.html?slug=ava-noir";
  }

  function chatUrl(slug){
    const companion = getCompanion(slug);
    return companion && companion.chatLink ? companion.chatLink : "/chat.html?slug=ava-noir";
  }

  function renderMiniAvatar(slug){
    const companion = getCompanion(slug);
    const wrapper = document.createElement("div");
    wrapper.className = "story-avatar";

    const face = document.createElement("div");
    face.className = "ai-face " + ((companion && companion.face) || "ava-face");

    wrapper.appendChild(face);
    return wrapper;
  }

  function renderStoryRow(containerSelector, slugs){
    const container = document.querySelector(containerSelector);
    if(!container || !Array.isArray(slugs)) return;

    container.textContent = "";
    slugs.forEach(function(slug){
      const companion = getCompanion(slug);
      if(!companion) return;

      const link = document.createElement("a");
      link.className = "story";
      link.href = companionUrl(slug);

      link.appendChild(renderMiniAvatar(slug));

      const label = document.createElement("span");
      label.textContent = (companion.name || "Ava Noir").split(" ")[0];
      link.appendChild(label);

      container.appendChild(link);
    });
  }

  function renderCompanionCards(containerSelector, slugs){
    const container = document.querySelector(containerSelector);
    if(!container || !Array.isArray(slugs)) return;

    container.textContent = "";
    slugs.forEach(function(slug){
      const companion = getCompanion(slug);
      if(!companion) return;

      const card = document.createElement("a");
      card.className = "character-card";
      card.href = companionUrl(slug);

      const art = document.createElement("div");
      art.className = "character-art " + (companion.portrait || "portrait-a");
      card.appendChild(art);

      const info = document.createElement("div");
      info.className = "character-info";

      const live = document.createElement("span");
      live.className = "live";
      const dot = document.createElement("i");
      live.appendChild(dot);
      live.appendChild(document.createTextNode(" " + (companion.status || "online acum")));
      info.appendChild(live);

      const h3 = document.createElement("h3");
      h3.setAttribute("data-no-translate", "");
      h3.textContent = companion.name || "Ava Noir";
      info.appendChild(h3);

      const p = document.createElement("p");
      p.textContent = companion.bio || "";
      info.appendChild(p);

      const tags = document.createElement("div");
      tags.className = "tags";
      (companion.tags || []).slice(0,3).forEach(function(tagName){
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = tagName;
        tags.appendChild(tag);
      });
      info.appendChild(tags);

      const actions = document.createElement("div");
      actions.className = "card-actions";
      const profileBadge = document.createElement("span");
      profileBadge.className = "mini-link";
      profileBadge.textContent = "Vezi profil";
      const chatBadge = document.createElement("span");
      chatBadge.className = "mini-link";
      chatBadge.textContent = "Chat";
      actions.appendChild(profileBadge);
      actions.appendChild(chatBadge);
      info.appendChild(actions);

      card.appendChild(info);
      container.appendChild(card);
    });
  }

  window.TFP_RENDER = {
    getCompanion: getCompanion,
    companionUrl: companionUrl,
    chatUrl: chatUrl,
    renderMiniAvatar: renderMiniAvatar,
    renderStoryRow: renderStoryRow,
    renderCompanionCards: renderCompanionCards
  };
})();

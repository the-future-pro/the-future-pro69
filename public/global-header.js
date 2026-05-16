// global-header.js — The Future PRO global header widgets auto-injected

(function(){

  function getNav(){
    return document.querySelector(".nav-actions");
  }

  function ensureGlobalHeader(){
    const nav = getNav();

    if(!nav){
      return;
    }

    if(!document.getElementById("globalHeaderGroup")){
      const group = document.createElement("div");

      group.id = "globalHeaderGroup";
      group.style.display = "inline-flex";
      group.style.alignItems = "center";
      group.style.gap = "8px";
      group.style.flexWrap = "wrap";

      group.innerHTML = `
        <button
          id="globalNotifyPill"
          class="ghost-btn"
          type="button"
          style="border:1px solid var(--line)"
        >
          🔔 0
        </button>

        <a
          id="globalWalletPill"
          href="/credits.html"
          class="ghost-btn"
          style="display:inline-flex;align-items:center;gap:6px"
        >
          💳 <span id="globalCreditsBalance">240</span> cr
        </a>
      `;

      nav.insertBefore(group, nav.firstChild);
    }

    const notifyBtn = document.getElementById("globalNotifyPill");

    if(notifyBtn){
      notifyBtn.onclick = toggleNotificationsPanel;
    }

    renderWalletPill();
    renderNotifications();
  }

  function renderWalletPill(){
    const el = document.getElementById("globalCreditsBalance");

    if(!el){
      return;
    }

    if(window.TFP_WALLET){
      el.textContent = TFP_WALLET.getBalance();
    }else{
      el.textContent = "240";
    }
  }

  function renderNotifications(){
    const btn = document.getElementById("globalNotifyPill");

    if(!btn){
      return;
    }

    const count =
      window.TFP_STATE
        ? TFP_STATE.unreadCount()
        : 0;

    btn.innerHTML = `🔔 ${count}`;
  }

  function toggleNotificationsPanel(){
    let panel = document.getElementById("globalNotificationsPanel");

    if(panel){
      panel.remove();
      return;
    }

    const items =
      window.TFP_STATE
        ? TFP_STATE.getNotifications()
        : [];

    panel = document.createElement("div");
    panel.id = "globalNotificationsPanel";

    panel.style.position = "fixed";
    panel.style.right = "18px";
    panel.style.top = "78px";
    panel.style.width = "320px";
    panel.style.maxWidth = "calc(100vw - 36px)";
    panel.style.zIndex = "9999";
    panel.style.border = "1px solid var(--line)";
    panel.style.borderRadius = "22px";
    panel.style.padding = "14px";
    panel.style.background = "rgba(10,10,16,.96)";
    panel.style.boxShadow = "0 24px 80px rgba(0,0,0,.55)";
    panel.style.backdropFilter = "blur(16px)";

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px">
        <strong>Notificări</strong>

        <button
          id="markNotifRead"
          class="ghost-btn"
          style="border:1px solid var(--line);padding:7px 10px"
        >
          citite
        </button>
      </div>

      <div id="notifList" style="display:grid;gap:10px"></div>
    `;

    document.body.appendChild(panel);

    const list = document.getElementById("notifList");

    if(!items.length){
      list.innerHTML = `
        <div style="color:var(--muted);line-height:1.5">
          Nu ai notificări momentan.
        </div>
      `;
    }else{
      list.innerHTML = items.map(item=>`
        <a
          href="${escapeHtml(item.url)}"
          style="
            display:block;
            text-decoration:none;
            color:inherit;
            border:1px solid var(--line);
            border-radius:16px;
            padding:12px;
            background:rgba(255,255,255,.04);
          "
        >
          <div style="display:flex;gap:10px;align-items:flex-start">
            <span>${escapeHtml(item.icon)}</span>

            <span style="line-height:1.45;color:${item.read ? 'var(--muted)' : 'var(--ink)'}">
              ${escapeHtml(item.text)}
            </span>
          </div>
        </a>
      `).join("");
    }

    document.getElementById("markNotifRead").onclick = function(){
      if(window.TFP_STATE){
        TFP_STATE.markNotificationsRead();
      }

      renderNotifications();
      panel.remove();
    };
  }

  function escapeHtml(str){
    return String(str || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  window.addEventListener("DOMContentLoaded",function(){
    ensureGlobalHeader();
  });

  window.addEventListener("tfp:wallet-updated",function(){
    renderWalletPill();
  });

  window.addEventListener("tfp:state-updated",function(){
    renderNotifications();
  });

})();

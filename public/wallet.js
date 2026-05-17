// wallet.js — The Future PRO unified wallet system

(function(){

  const TFP_WALLET = {

    balanceKey: "tfp_mock_credits_balance",
    historyKey: "tfp_mock_credits_history",
    unlockKey: "tfp_mock_unlocks",

    defaultBalance: 240,

    getBalance(){
      return Number(
        localStorage.getItem(this.balanceKey) ||
        this.defaultBalance
      );
    },

    setBalance(value){

      const safeValue = Math.max(
        0,
        Number(value || 0)
      );

      localStorage.setItem(
        this.balanceKey,
        String(safeValue)
      );

      window.dispatchEvent(
        new CustomEvent(
          "tfp:wallet-updated",
          {
            detail:{
              balance:safeValue
            }
          }
        )
      );

      return safeValue;
    },

    getHistory(){

      try{
        const raw = JSON.parse(
          localStorage.getItem(this.historyKey) || "[]"
        );

        if(!Array.isArray(raw)){
          return [];
        }

        return raw.map((item) => this.normalizeHistoryEntry(item));
      }catch(e){
        return [];
      }

    },

    saveHistory(items){

      localStorage.setItem(
        this.historyKey,
        JSON.stringify(items.slice(0,50))
      );

    },


    normalizeHistoryEntry(raw){

      const item = raw && typeof raw === "object" ? raw : {};

      const normalizeText = (value, fallback) => {
        if(typeof value === "string"){
          return value;
        }

        if(value && typeof value === "object"){
          if(typeof value.text === "string"){
            return value.text;
          }
          if(typeof value.label === "string"){
            return value.label;
          }
        }

        return fallback;
      };

      const normalizeParams =
        item.params && typeof item.params === "object"
          ? item.params
          : {};

      return {
        text: normalizeText(item.text || item.label, "Activitate credits"),
        labelKey: typeof item.labelKey === "string" ? item.labelKey : "",
        params: normalizeParams,
        amount: normalizeText(item.amount, "0 cr"),
        type: item.type === "bad" ? "bad" : "good",
        icon: normalizeText(item.icon, "🔓"),
        date: normalizeText(item.date, new Date().toLocaleString("ro-RO"))
      };

    },

    addHistory(entryOrText,amount,type,icon){

      const items = this.getHistory();

      const entryIsObject =
        entryOrText &&
        typeof entryOrText === "object" &&
        !Array.isArray(entryOrText);

      const entry = entryIsObject
        ? entryOrText
        : {
            text: entryOrText || "Activitate credits",
            amount: amount || "0 cr",
            type: type || "bad",
            icon: icon || "🔓"
          };

      items.unshift(
        this.normalizeHistoryEntry({
          text: entry.text,
          label: entry.label,
          labelKey: entry.labelKey,
          params: entry.params,
          amount: entry.amount,
          type: entry.type || "bad",
          icon: entry.icon,
          date: entry.date
        })
      );

      this.saveHistory(items);

    },

    add(amount,labelOrConfig,icon){

      const value = Number(amount || 0);

      if(value <= 0){
        return false;
      }

      const current = this.getBalance();

      this.setBalance(current + value);

      const config =
        labelOrConfig && typeof labelOrConfig === "object"
          ? labelOrConfig
          : { text: labelOrConfig, icon: icon };

      this.addHistory({
        text: config.text || "Pachet credits mock adăugat",
        labelKey: config.labelKey || "credits_purchase",
        params: config.params || {},
        amount: "+" + value + " cr",
        type: "good",
        icon: config.icon || "💳"
      });

      return true;
    },

    spend(amount,labelOrConfig,icon){

      const value = Number(amount || 0);

      if(value <= 0){
        return false;
      }

      const current = this.getBalance();

      if(current < value){

        alert(
          "Nu ai suficiente credits."
        );

        return false;
      }

      this.setBalance(current - value);

      const config =
        labelOrConfig && typeof labelOrConfig === "object"
          ? labelOrConfig
          : { text: labelOrConfig, icon: icon };

      this.addHistory({
        text: config.text || "Unlock premium mock",
        labelKey: config.labelKey || "premium_unlock",
        params: config.params || {},
        amount: "-" + value + " cr",
        type: "bad",
        icon: config.icon || "🔓"
      });

      return true;
    },

    getUnlocks(){

      try{
        return JSON.parse(
          localStorage.getItem(this.unlockKey) || "{}"
        );
      }catch(e){
        return {};
      }

    },

    saveUnlocks(data){

      localStorage.setItem(
        this.unlockKey,
        JSON.stringify(data || {})
      );

    },

    unlock(key){

      if(!key){
        return;
      }

      const data = this.getUnlocks();

      data[key] = true;

      this.saveUnlocks(data);

    },

    isUnlocked(key){

      const data = this.getUnlocks();

      return !!data[key];
    },

    spendAndUnlock(config){

      if(!config){
        return false;
      }

      const ok = this.spend(
        config.amount,
        {
          text: config.label,
          labelKey: config.labelKey,
          params: config.params,
          icon: config.icon
        }
      );

      if(!ok){
        return false;
      }

      if(config.unlockKey){
        this.unlock(config.unlockKey);
      }

      return true;
    },

    handleUrlSpend(){

      const params =
        new URLSearchParams(location.search);

      const spend =
        Number(params.get("spend") || 0);

      const label =
        params.get("label") ||
        "Unlock premium mock";

      const labelKey =
        params.get("labelKey") ||
        "premium_unlock";

      let parsedParams = {};

      try{
        parsedParams = JSON.parse(
          params.get("params") || "{}"
        );
      }catch(e){
        parsedParams = {};
      }

      const icon =
        params.get("icon") ||
        "🔓";

      const unlockKey =
        params.get("unlock") || "";

      if(!spend){
        return false;
      }

      const sessionKey =
        "tfp_url_spend_" +
        location.search;

      if(
        sessionStorage.getItem(sessionKey)
      ){

        history.replaceState(
          {},
          "",
          location.pathname
        );

        return false;
      }

      sessionStorage.setItem(
        sessionKey,
        "1"
      );

      const ok = this.spend(
        spend,
        {
          text: label,
          labelKey: labelKey,
          params: parsedParams,
          icon: icon
        }
      );

      if(ok && unlockKey){
        this.unlock(unlockKey);
      }

      history.replaceState(
        {},
        "",
        location.pathname
      );

      return ok;
    },

    reset(){

      localStorage.removeItem(this.balanceKey);
      localStorage.removeItem(this.historyKey);
      localStorage.removeItem(this.unlockKey);

      location.reload();
    }

  };

  window.TFP_WALLET = TFP_WALLET;

})();

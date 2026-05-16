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
        return JSON.parse(
          localStorage.getItem(this.historyKey) || "[]"
        );
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

    addHistory(text,amount,type,icon){

      const items = this.getHistory();

      items.unshift({
        text:text || "Activitate credits",
        amount:amount || "0 cr",
        type:type || "bad",
        icon:icon || "🔓",
        date:new Date().toLocaleString("ro-RO")
      });

      this.saveHistory(items);

    },

    add(amount,label,icon){

      const value = Number(amount || 0);

      if(value <= 0){
        return false;
      }

      const current = this.getBalance();

      this.setBalance(current + value);

      this.addHistory(
        label || "Pachet credits mock adăugat",
        "+" + value + " cr",
        "good",
        icon || "💳"
      );

      return true;
    },

    spend(amount,label,icon){

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

      this.addHistory(
        label || "Unlock premium mock",
        "-" + value + " cr",
        "bad",
        icon || "🔓"
      );

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
        config.label,
        config.icon
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
        label,
        icon
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

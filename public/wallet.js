// wallet.js — The Future PRO global mock credits system

const TFP_WALLET = {
  balanceKey: "tfp_mock_credits_balance",
  historyKey: "tfp_mock_credits_history",
  defaultBalance: 240,

  getBalance(){
    return Number(localStorage.getItem(this.balanceKey) || this.defaultBalance);
  },

  setBalance(value){
    const safeValue = Math.max(0, Number(value || 0));
    localStorage.setItem(this.balanceKey, String(safeValue));
    window.dispatchEvent(new CustomEvent("tfp:wallet-updated", {
      detail: { balance: safeValue }
    }));
    return safeValue;
  },

  getHistory(){
    try{
      return JSON.parse(localStorage.getItem(this.historyKey) || "[]");
    }catch(e){
      return [];
    }
  },

  saveHistory(items){
    localStorage.setItem(this.historyKey, JSON.stringify(items.slice(0, 30)));
  },

  addHistory(text, amount, type, icon){
    const items = this.getHistory();

    items.unshift({
      text: text || "Activitate credits",
      amount: amount,
      type: type || "bad",
      icon: icon || "🔓",
      date: new Date().toLocaleString("ro-RO")
    });

    this.saveHistory(items);
  },

  add(amount, label, icon){
    const value = Number(amount || 0);
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

  spend(amount, label, icon){
    const value = Number(amount || 0);
    const current = this.getBalance();

    if(current < value){
      alert("Nu ai suficiente credits.");
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

  handleUrlSpend(){
    const params = new URLSearchParams(location.search);

    const spend = Number(params.get("spend") || 0);
    const label = params.get("label") || "Unlock premium mock";
    const icon = params.get("icon") || "🔓";

    if(!spend) return false;

    const key = "tfp_url_spend_handled_" + location.search;

    if(sessionStorage.getItem(key)){
      history.replaceState({}, "", location.pathname);
      return false;
    }

    sessionStorage.setItem(key, "1");

    const ok = this.spend(spend, label, icon);

    history.replaceState({}, "", location.pathname);

    return ok;
  }
};

window.TFP_WALLET = TFP_WALLET;

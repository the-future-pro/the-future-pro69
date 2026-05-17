(function(){
  const TFP_WALLET = {
    cache: { balance: 240, unlocks: {}, history: [] },

    async sync(){
      const r = await fetch('/api/wallet',{credentials:'include'});
      const j = await r.json();
      if(j.ok && j.wallet){
        this.cache = j.wallet;
        window.dispatchEvent(new CustomEvent('tfp:wallet-updated',{detail:{balance:this.cache.balance}}));
      }
      return this.cache;
    },

    getBalance(){ return Number(this.cache.balance || 0); },
    getHistory(){ return Array.isArray(this.cache.history) ? this.cache.history : []; },
    isUnlocked(key){ return !!(this.cache.unlocks && this.cache.unlocks[key]); },

    async add(amount,labelOrConfig){
      const cfg = labelOrConfig && typeof labelOrConfig === 'object' ? labelOrConfig : {text:labelOrConfig};
      const r = await fetch('/api/wallet/add',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,text:cfg.text})});
      const j = await r.json();
      if(j.ok){ this.cache = j.wallet; window.dispatchEvent(new CustomEvent('tfp:wallet-updated',{detail:{balance:this.cache.balance}})); return true; }
      return false;
    },


    async spend(amount,labelOrConfig){
      const cfg = labelOrConfig && typeof labelOrConfig === 'object' ? labelOrConfig : {text:labelOrConfig};
      const type = cfg.unlockType || 'manual_spend';
      const r = await fetch('/api/premium/unlock',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,cost:amount})});
      const j = await r.json();
      if(j.wallet) this.cache = j.wallet;
      window.dispatchEvent(new CustomEvent('tfp:wallet-updated',{detail:{balance:this.cache.balance}}));
      return !!j.ok;
    },

    async unlockPremium(type,cost){
      const r = await fetch('/api/premium/unlock',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,cost})});
      const j = await r.json();
      if(j.wallet) this.cache = j.wallet;
      window.dispatchEvent(new CustomEvent('tfp:wallet-updated',{detail:{balance:this.cache.balance}}));
      return j;
    }
  };
  window.TFP_WALLET = TFP_WALLET;
})();

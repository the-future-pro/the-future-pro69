(function(){
  const TFP_WALLET = {
    cache: { balance: 240, unlocks: {}, history: [] },

    async sync(){
      const [w,u,t] = await Promise.all([
        fetch('/api/wallet',{credentials:'include'}),
        fetch('/api/premium/unlocks',{credentials:'include'}),
        fetch('/api/wallet/transactions',{credentials:'include'})
      ]);
      const [wj,uj,tj] = await Promise.all([w.json(),u.json(),t.json()]);
      if(wj.ok) this.cache.balance = Number(wj.balance || 0);
      if(uj.ok) this.cache.unlocks = Object.fromEntries((uj.unlocks || []).map((x)=>[x.type,x]));
      if(tj.ok) this.cache.history = tj.transactions || [];
      window.dispatchEvent(new CustomEvent('tfp:wallet-updated',{detail:{balance:this.cache.balance}}));
      return this.cache;
    },

    getBalance(){ return Number(this.cache.balance || 0); },
    getHistory(){ return Array.isArray(this.cache.history) ? this.cache.history : []; },
    isUnlocked(key){ return !!(this.cache.unlocks && this.cache.unlocks[key]); },

    async add(amount,labelOrConfig){
      const cfg = labelOrConfig && typeof labelOrConfig === 'object' ? labelOrConfig : {text:labelOrConfig};
      const r = await fetch('/api/wallet/add',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,text:cfg.text})});
      const j = await r.json();
      if(j.ok){ await this.sync(); return true; }
      return false;
    },

    async spend(amount,labelOrConfig){
      const cfg = labelOrConfig && typeof labelOrConfig === 'object' ? labelOrConfig : {};
      const type = cfg.unlockType || 'private_cinematic_image';
      const r = await this.unlockPremium(type);
      return !!r.ok;
    },

    async unlockPremium(type){
      const r = await fetch('/api/premium/unlock',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type})});
      const j = await r.json();
      await this.sync();
      return j;
    },

    handleUrlSpend(){}
  };
  window.TFP_WALLET = TFP_WALLET;
})();

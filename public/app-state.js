// app-state.js — The Future PRO global app state

(function(){

  const APP_STATE = {
    keys:{
      likes:"tfp_state_likes",
      saves:"tfp_state_saves",
      follows:"tfp_state_follows",
      notifications:"tfp_state_notifications",
      relationships:"tfp_state_relationships"
    },

    read(key,fallback){
      try{
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
      }catch(e){
        return fallback;
      }
    },

    write(key,value){
      localStorage.setItem(key,JSON.stringify(value));
      window.dispatchEvent(new CustomEvent("tfp:state-updated"));
    },

    toggleGroup(group,key){
      const store = this.read(this.keys[group],{});
      store[key] = !store[key];
      this.write(this.keys[group],store);
      return store[key];
    },

    isActive(group,key){
      const store = this.read(this.keys[group],{});
      return !!store[key];
    },

    like(key){
      return this.toggleGroup("likes",key);
    },

    save(key){
      return this.toggleGroup("saves",key);
    },

    follow(key){
      return this.toggleGroup("follows",key);
    },

    getNotifications(){
      return this.read(this.keys.notifications,[
        {
          id:"n1",
          icon:"💬",
          text:"Ava Noir ți-a trimis un mesaj nou.",
          url:"/chat.html?slug=ava-noir",
          read:false
        },
        {
          id:"n2",
          icon:"🔒",
          text:"Luna Sable are un premium drop blocat.",
          url:"/feed.html",
          read:false
        },
        {
          id:"n3",
          icon:"💳",
          text:"Ai wallet-ul credits activ pentru test MVP.",
          url:"/credits.html",
          read:false
        }
      ]);
    },

    unreadCount(){
      return this.getNotifications().filter(n=>!n.read).length;
    },

    markNotificationsRead(){
      const items = this.getNotifications().map(n=>({
        ...n,
        read:true
      }));

      this.write(this.keys.notifications,items);
      return items;
    },

    getRelationship(slug){
      const store = this.read(this.keys.relationships,{});
      return store[slug] || {
        level:1,
        xp:0,
        mood:"new connection"
      };
    },

    addRelationshipXp(slug,amount){
      const store = this.read(this.keys.relationships,{});
      const current = store[slug] || {
        level:1,
        xp:0,
        mood:"new connection"
      };

      current.xp += Number(amount || 0);

      if(current.xp >= current.level * 100){
        current.level += 1;
        current.xp = 0;
        current.mood = "closer connection";
      }

      store[slug] = current;
      this.write(this.keys.relationships,store);

      return current;
    }
  };

  window.TFP_STATE = APP_STATE;

})();

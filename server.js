// --- SESSIONS (fix Render cookie) ---
const SQLiteStore = SQLiteStoreFactory(session);
app.set('trust proxy', 1);
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true, // IMPORTANT pe Render
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 1000*60*60*24*30
  }
}));

// --- DEBUG + LOGIN EASY (pentru test rapid din browser) ---
app.get('/api/login/easy', async (req, res) => {
  try{
    const email = String(req.query.email||'test@example.com').trim().toLowerCase();
    if(!email) return res.status(400).json({ ok:false, error:'email_required' });

    let u = await get(`SELECT * FROM users WHERE email=?`,[email]);
    if(!u){
      const r = await run(`INSERT INTO users(email) VALUES(?)`,[email]);
      u = await get(`SELECT * FROM users WHERE id=?`,[r.lastID]);
    }

    req.session.regenerate(err=>{
      if(err) return res.status(500).json({ ok:false, error:'session_regenerate_failed' });
      req.session.user_id = u.id;
      req.session.save(err2=>{
        if(err2) return res.status(500).json({ ok:false, error:'session_save_failed' });
        res.json({ ok:true, user:{ id:u.id, email:u.email }});
      });
    });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
});

app.get('/api/debug/session', (req,res)=>{
  res.json({
    ok:true,
    sid: req.sessionID || null,
    user_id: req.session?.user_id || null,
    cookies_in: req.headers.cookie || null
  });
});

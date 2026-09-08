const ORIGIN="https://castorlucjulesmichel.github.io";
const FBKEY="AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA";

export default{async fetch(req,env){
 try{
  if(req.method==="OPTIONS")return out({},204);
  await setup(env.DB);
  const u=new URL(req.url),p=u.pathname;

  if(p==="/")return out({ok:true,app:"MystroParyaj",api:"online"});
  if(p==="/api/rates"){
   const r=await fetch("https://open.er-api.com/v6/latest/USD").then(x=>x.json());
   return out({rates:r.rates});
  }
  if(p==="/api/events"){
   const q=await env.DB.prepare("SELECT * FROM events WHERE status='open' ORDER BY start").all();
   return out({items:q.results.map(e=>({...e,markets:JSON.parse(e.markets)}))});
  }

  const me=await user(req);
  if(!me)return out({error:"Connexion requise"},401);

  await env.DB.prepare(
   "INSERT OR IGNORE INTO users(uid,email,role) VALUES(?,?,?)"
  ).bind(me.uid,me.email,me.uid===env.ADMIN_UID?"admin":"player").run();

  if(p==="/api/me"){
   const x=await env.DB.prepare("SELECT * FROM users WHERE uid=?").bind(me.uid).first();
   return out({...x,role:me.uid===env.ADMIN_UID?"admin":x.role});
  }

  if(p==="/api/wallet"){
   const q=await env.DB.prepare("SELECT currency,balance FROM wallets WHERE uid=?").bind(me.uid).all();
   const b={HTG:0,USD:0,EUR:0,CAD:0,DOP:0};
   q.results.forEach(x=>b[x.currency]=+x.balance);
   return out({balances:b});
  }

  if(p==="/api/history"){
   const q=await env.DB.prepare(
    "SELECT * FROM tx WHERE uid=? ORDER BY id DESC LIMIT 100"
   ).bind(me.uid).all();
   return out({items:q.results});
  }

  if(p==="/api/exchange"&&req.method==="POST"){
   const x=await req.json(),a=+x.amount;
   if(!(a>0)||x.from===x.to)return out({error:"Echanj pa valab"},400);

   const r=await fetch("https://open.er-api.com/v6/latest/USD").then(z=>z.json());
   const got=a/r.rates[x.from]*r.rates[x.to];

   const w=await bal(env,me.uid,x.from);
   if(w<a)return out({error:"Solde insuffisant"},400);

   await env.DB.batch([
    env.DB.prepare("UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=?")
      .bind(a,me.uid,x.from),
    env.DB.prepare(`INSERT INTO wallets VALUES(?,?,?)
      ON CONFLICT(uid,currency) DO UPDATE SET balance=balance+?`)
      .bind(me.uid,x.to,got,got),
    env.DB.prepare("INSERT INTO tx(uid,type,amount,currency,status) VALUES(?,'exchange',?,?,'paid')")
      .bind(me.uid,a,x.from)
   ]);
   return out({ok:true,received:got,currency:x.to});
  }

  if(p==="/api/bet"&&req.method==="POST"){
   const x=await req.json(),stake=+x.stake;
   if(!(stake>0)||!x.eventId||!x.market)return out({error:"Tikè invalide"},400);

   const e=await env.DB.prepare(
    "SELECT * FROM events WHERE id=? AND status='open'"
   ).bind(x.eventId).first();

   if(!e)return out({error:"Evènman fèmen"},400);

   const m=JSON.parse(e.markets||"{}"),odds=+m[x.market];
   if(!odds)return out({error:"Kòt invalide"},400);

   const w=await bal(env,me.uid,x.currency);
   if(w<stake)return out({error:"Solde insuffisant"},400);

   const us=await env.DB.prepare(
    "SELECT linked_agent FROM users WHERE uid=?"
   ).bind(me.uid).first();

   const agent=us?.linked_agent||null;
   const agentShare=agent?stake*.10:0;
   const platformShare=agent?stake*.30:stake*.40;
   const reserve=stake*.60;

   const b=await env.DB.prepare(`INSERT INTO bets
    (uid,event_id,market,stake,currency,odds,payout,agent,status)
    VALUES(?,?,?,?,?,?,?,?,'open')`)
    .bind(me.uid,x.eventId,x.market,stake,x.currency,odds,stake*odds,agent).run();

   await env.DB.batch([
    env.DB.prepare("UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=?")
      .bind(stake,me.uid,x.currency),
    env.DB.prepare(`INSERT INTO ledger
      (bet_id,reserve,agent_share,platform_share,currency,agent)
      VALUES(?,?,?,?,?,?)`)
      .bind(b.meta.last_row_id,reserve,agentShare,platformShare,x.currency,agent)
   ]);

   return out({ok:true,id:b.meta.last_row_id,potentialReturn:stake*odds});
  }

  if(p==="/api/agent/apply"&&req.method==="POST"){
   const x=await req.json();
   await env.DB.prepare(`INSERT INTO agents
    (uid,name,phone,city,address,cin,status)
    VALUES(?,?,?,?,?,?,'pending')
    ON CONFLICT(uid) DO UPDATE SET
    name=?,phone=?,city=?,address=?,cin=?,status='pending'`)
    .bind(me.uid,x.name,x.phone,x.city,x.address,x.cin,
          x.name,x.phone,x.city,x.address,x.cin).run();
   return out({ok:true});
  }

  if(p.startsWith("/api/admin/")&&me.uid!==env.ADMIN_UID)
   return out({error:"Accès admin refusé"},403);

  if(p==="/api/admin/event"&&req.method==="POST"){
   const x=await req.json();
   const r=await env.DB.prepare(`INSERT INTO events
    (sport,league,home,away,start,markets,status)
    VALUES(?,?,?,?,?,?,'open')`)
    .bind(x.sport,x.league,x.home,x.away,x.start,JSON.stringify(x.markets)).run();
   return out({ok:true,id:r.meta.last_row_id});
  }

  if(p==="/api/admin/agent"&&req.method==="POST"){
   const x=await req.json();
   const code=x.status==="approved"
    ?"MP-"+crypto.randomUUID().slice(0,6).toUpperCase():null;

   await env.DB.batch([
    env.DB.prepare("UPDATE agents SET status=?,code=COALESCE(?,code) WHERE uid=?")
      .bind(x.status,code,x.uid),
    env.DB.prepare("UPDATE users SET role=?,agent_code=COALESCE(?,agent_code) WHERE uid=?")
      .bind(x.status==="approved"?"agent":"player",code,x.uid)
   ]);
   return out({ok:true,code});
  }

  if(p==="/api/admin/settle"&&req.method==="POST"){
   const x=await req.json();

   await env.DB.prepare(
    "UPDATE events SET status='settled',winner=? WHERE id=?"
   ).bind(x.winner,x.eventId).run();

   const q=await env.DB.prepare(
    "SELECT * FROM bets WHERE event_id=? AND status='open'"
   ).bind(x.eventId).all();

   let paid=0;
   for(const b of q.results){
    if(b.market!==x.winner){
     await env.DB.prepare("UPDATE bets SET status='lost' WHERE id=?").bind(b.id).run();
     continue;
    }

    const done=await env.DB.prepare(
     "SELECT id FROM tx WHERE type='win' AND reference=?"
    ).bind(String(b.id)).first();
    if(done)continue;

    await env.DB.batch([
     env.DB.prepare("UPDATE bets SET status='won' WHERE id=?").bind(b.id),
     env.DB.prepare(`INSERT INTO wallets VALUES(?,?,?)
      ON CONFLICT(uid,currency) DO UPDATE SET balance=balance+?`)
      .bind(b.uid,b.currency,b.payout,b.payout),
     env.DB.prepare(`INSERT INTO tx(uid,type,amount,currency,status,reference)
      VALUES(?,'win',?,?,'paid',?)`)
      .bind(b.uid,b.payout,b.currency,String(b.id))
    ]);
    paid++;
   }
   return out({ok:true,paid});
  }

  if(p==="/api/admin/stats"){
   const players=await one(env,"SELECT COUNT(*) n FROM users WHERE role='player'");
   const agents=await one(env,"SELECT COUNT(*) n FROM users WHERE role='agent'");
   const stakes=await one(env,"SELECT COALESCE(SUM(stake),0) n FROM bets");
   const wins=await one(env,"SELECT COALESCE(SUM(amount),0) n FROM tx WHERE type='win'");
   const ac=await one(env,"SELECT COALESCE(SUM(agent_share),0) n FROM ledger");
   const profit=+stakes.n-(+wins.n)-(+ac.n);

   return out({
    players:+players.n,
    agents:+agents.n,
    totalStakes:+stakes.n,
    winnersPaid:+wins.n,
    agentCommission:+ac.n,
    mystroProfit:profit,
    withdrawableProfit:Math.max(0,profit)
   });
  }

  return out({error:"Route introuvable"},404);
 }catch(e){return out({error:e.message},500)}
}};

async function user(req){
 const t=(req.headers.get("Authorization")||"").replace("Bearer ","");
 if(!t)return null;
 const r=await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FBKEY}`,
  {method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({idToken:t})}
 );
 if(!r.ok)return null;
 const d=await r.json(),u=d.users?.[0];
 return u?{uid:u.localId,email:u.email||""}:null;
}

async function bal(env,uid,c){
 const x=await env.DB.prepare(
  "SELECT balance FROM wallets WHERE uid=? AND currency=?"
 ).bind(uid,c).first();
 return +(x?.balance||0);
}

async function one(env,s){
 return await env.DB.prepare(s).first()||{n:0};
}

async function setup(db){
 await db.batch([
  db.prepare("CREATE TABLE IF NOT EXISTS users(uid TEXT PRIMARY KEY,email TEXT,role TEXT,agent_code TEXT,linked_agent TEXT)"),
  db.prepare("CREATE TABLE IF NOT EXISTS wallets(uid TEXT,currency TEXT,balance REAL DEFAULT 0,PRIMARY KEY(uid,currency))"),
  db.prepare("CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,sport TEXT,league TEXT,home TEXT,away TEXT,start TEXT,markets TEXT,status TEXT,winner TEXT)"),
  db.prepare("CREATE TABLE IF NOT EXISTS bets(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,event_id INTEGER,market TEXT,stake REAL,currency TEXT,odds REAL,payout REAL,agent TEXT,status TEXT)"),
  db.prepare("CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY AUTOINCREMENT,bet_id INTEGER,reserve REAL,agent_share REAL,platform_share REAL,currency TEXT,agent TEXT)"),
  db.prepare("CREATE TABLE IF NOT EXISTS tx(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,type TEXT,amount REAL,currency TEXT,status TEXT,reference TEXT)"),
  db.prepare("CREATE TABLE IF NOT EXISTS agents(uid TEXT PRIMARY KEY,name TEXT,phone TEXT,city TEXT,address TEXT,cin TEXT,status TEXT,code TEXT)")
 ]);
}

function out(x,s=200){
 return new Response(JSON.stringify(x),{
  status:s,
  headers:{
   "Content-Type":"application/json",
   "Access-Control-Allow-Origin":ORIGIN,
   "Access-Control-Allow-Headers":"Authorization,Content-Type",
   "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
  }
 });
    }

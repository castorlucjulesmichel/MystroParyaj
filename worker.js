const ORIGIN="https://castorlucjulesmichel.github.io";
const FIREBASE_KEY="AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA";
const CURRENCIES=["HTG","USD","EUR","CAD","DOP"];
const CORS={"access-control-allow-origin":ORIGIN,"access-control-allow-headers":"Authorization,Content-Type,X-Admin-Session","access-control-allow-methods":"GET,POST,OPTIONS","access-control-max-age":"86400"};

export default{async fetch(req,env){try{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
  if(!env.DB)throw err("D1 DB binding missing",500);
  await setup(env.DB);
  const p=new URL(req.url).pathname;
  if(p==="/")return out({ok:true,app:"MystroParyaj",database:true,sportmonks:!!env.SPORTMONKS_TOKEN,moncashConfigured:!!(env.MONCASH_CLIENT_ID&&env.MONCASH_CLIENT_SECRET)});
  if(p==="/api/rates")return rates();
  if(p==="/api/events")return events(env);
  const me=await auth(req);if(!me)throw err("Connexion requise",401);
  await ensure(env,me);
  const admin=!!env.ADMIN_UID&&me.uid===String(env.ADMIN_UID).trim();
  if(p==="/api/me")return profile(env,me,admin);
  if(p==="/api/wallet")return wallet(env,me.uid);
  if(p==="/api/history")return history(env,me.uid);
  if(p==="/api/exchange"&&req.method==="POST")return exchange(req,env,me.uid);
  if(p==="/api/bet"&&req.method==="POST")return bet(req,env,me.uid);
  if(p==="/api/agent/apply"&&req.method==="POST")return agentApply(req,env,me);
  if(p==="/api/agent/dashboard")return agentDashboard(env,me.uid);
  if(p==="/api/agent/bet"&&req.method==="POST")return agentBet(req,env,me.uid);
  if(p==="/api/payment/moncash/deposit"||p==="/api/payment/moncash/withdraw")throw err("MonCash merchant credentials/API payout dwe verifye anvan tranzaksyon reyèl aktive.",503);
  if(p==="/api/admin/cin/setup"&&req.method==="POST"){guard(admin);return cinSetup(req,env,me.uid)}
  if(p==="/api/admin/cin/verify"&&req.method==="POST"){guard(admin);return cinVerify(req,env,me.uid)}
  if(p.startsWith("/api/admin/")){guard(admin);await session(req,env,me.uid);if(p==="/api/admin/stats")return adminStats(env);if(p==="/api/admin/agents")return adminAgents(env);if(p==="/api/admin/agent-review"&&req.method==="POST")return agentReview(req,env);if(p==="/api/admin/settle"&&req.method==="POST")return settle(req,env)}
  throw err("Route introuvable",404);
}catch(e){return out({error:e.message||"Server error"},e.status||500)}}};

function out(x,s=200){return new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json",...CORS,"cache-control":"no-store"}})}
function err(m,s=400){let e=new Error(m);e.status=s;return e}
function guard(v){if(!v)throw err("Accès admin refusé",403)}
const round=n=>Math.round(Number(n)*100)/100;
const cin=v=>String(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
async function hash(v){let b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function addCol(db,table,def){try{await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${def}`).run()}catch(e){if(!String(e.message).toLowerCase().includes("duplicate column"))throw e}}

async function setup(db){
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS users(uid TEXT PRIMARY KEY,email TEXT,role TEXT DEFAULT 'player',full_name TEXT,linked_agent TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS wallets(uid TEXT,currency TEXT,balance REAL DEFAULT 0,PRIMARY KEY(uid,currency))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS tx(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,type TEXT,amount REAL,currency TEXT,status TEXT,reference TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS bets(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,event_id TEXT,market TEXT,stake REAL,currency TEXT,agent TEXT,status TEXT DEFAULT 'open',payout REAL DEFAULT 0,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS agents(uid TEXT PRIMARY KEY,name TEXT,phone TEXT,city TEXT,address TEXT,cin_hash TEXT,status TEXT DEFAULT 'pending',code TEXT,commission_balance REAL DEFAULT 0)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_security(uid TEXT PRIMARY KEY,cin_hash TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions(token_hash TEXT PRIMARY KEY,uid TEXT,expires_at INTEGER)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS platform_wallet(currency TEXT PRIMARY KEY,balance REAL DEFAULT 0)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS reserve_wallet(currency TEXT PRIMARY KEY,balance REAL DEFAULT 0)`)
  ]);
  for(const d of [
    ["users","email TEXT"],["users","role TEXT DEFAULT 'player'"],["users","full_name TEXT"],["users","linked_agent TEXT"],
    ["wallets","currency TEXT"],["wallets","balance REAL DEFAULT 0"],
    ["bets","event_id TEXT"],["bets","market TEXT"],["bets","stake REAL DEFAULT 0"],["bets","currency TEXT DEFAULT 'HTG'"],["bets","agent TEXT"],["bets","status TEXT DEFAULT 'open'"],["bets","payout REAL DEFAULT 0"],
    ["agents","name TEXT"],["agents","phone TEXT"],["agents","city TEXT"],["agents","address TEXT"],["agents","cin_hash TEXT"],["agents","status TEXT DEFAULT 'pending'"],["agents","code TEXT"],["agents","commission_balance REAL DEFAULT 0"]
  ])await addCol(db,d[0],d[1]);
  for(const c of CURRENCIES){await db.prepare(`INSERT OR IGNORE INTO platform_wallet(currency,balance) VALUES(?,0)`).bind(c).run();await db.prepare(`INSERT OR IGNORE INTO reserve_wallet(currency,balance) VALUES(?,0)`).bind(c).run()}
}

async function auth(req){let h=req.headers.get("authorization")||"";if(!h.startsWith("Bearer "))return null;let r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_KEY}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken:h.slice(7)})}),d=await r.json();if(!r.ok)return null;return d.users?.[0]?{uid:d.users[0].localId,email:d.users[0].email||""}:null}
async function ensure(env,me){await env.DB.prepare(`INSERT INTO users(uid,email) VALUES(?,?) ON CONFLICT(uid) DO UPDATE SET email=excluded.email`).bind(me.uid,me.email).run();for(const c of CURRENCIES)await env.DB.prepare(`INSERT OR IGNORE INTO wallets(uid,currency,balance) VALUES(?,?,0)`).bind(me.uid,c).run()}
async function profile(env,me,a){let u=await env.DB.prepare(`SELECT * FROM users WHERE uid=?`).bind(me.uid).first(),g=await env.DB.prepare(`SELECT * FROM agents WHERE uid=?`).bind(me.uid).first(),s=a?await env.DB.prepare(`SELECT cin_hash FROM admin_security WHERE uid=?`).bind(me.uid).first():null,approved=g?.status==="approved",role=a?"admin":approved?"agent":"player";return out({uid:me.uid,email:me.email,role,accountType:role,fullName:u?.full_name||g?.name||"",linkedAgent:u?.linked_agent||null,agentStatus:g?.status||"none",agentCode:approved?g.code:null,isApprovedAgent:approved,isAdmin:a,canAccessAgent:approved&&!a,canAccessAdmin:a,cinConfigured:a?!!s:false})}
async function wallet(env,uid){let r=await env.DB.prepare(`SELECT currency,balance FROM wallets WHERE uid=?`).bind(uid).all(),b={HTG:0,USD:0,EUR:0,CAD:0,DOP:0};r.results.forEach(x=>b[x.currency]=Number(x.balance||0));return out({balances:b})}
async function history(env,uid){let r=await env.DB.prepare(`SELECT * FROM tx WHERE uid=? ORDER BY id DESC LIMIT 100`).bind(uid).all();return out({items:r.results})}
async function rates(){let r=await fetch("https://open.er-api.com/v6/latest/USD"),d=await r.json();return out({ok:r.ok,base:"USD",rates:d.rates||{}},r.ok?200:502)}

async function events(env){
  if(!env.SPORTMONKS_TOKEN)throw err("SPORTMONKS_TOKEN missing",503);
  let ds=[0,1,2,3,4,5,6].map(i=>{let d=new Date();d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)}),all=[];
  for(const date of ds){let u=`https://api.sportmonks.com/v3/football/fixtures/date/${date}?api_token=${encodeURIComponent(env.SPORTMONKS_TOKEN)}&include=participants;league;odds`,r=await fetch(u),d=await r.json();if(!r.ok){u=`https://api.sportmonks.com/v3/football/fixtures/date/${date}?api_token=${encodeURIComponent(env.SPORTMONKS_TOKEN)}&include=participants;league`;r=await fetch(u);d=await r.json()}if(r.ok)all.push(...(d.data||[]))}
  const seen=new Set();all=all.filter(x=>!seen.has(x.id)&&seen.add(x.id));
  return out({real:true,source:"Sportmonks",days:7,items:all.map(f=>{let ps=f.participants||[],home=ps.find(x=>x.meta?.location==="home")?.name||ps[0]?.name||"Home",away=ps.find(x=>x.meta?.location==="away")?.name||ps[1]?.name||"Away",m={};for(const o of f.odds||[]){let l=String(o.label||"").toLowerCase(),v=Number(o.value);if(v>1){if(!m.home&&(l==="1"||l.includes("home")))m.home=v;if(!m.draw&&(l==="x"||l.includes("draw")))m.draw=v;if(!m.away&&(l==="2"||l.includes("away")))m.away=v}}return{id:String(f.id),sport:"Football",league:f.league?.name||"Football",home,away,start:f.starting_at||"",markets:Object.keys(m).length?m:null,source:"Sportmonks"}})})}

async function exchange(req,env,uid){let b=await req.json(),a=Number(b.amount),f=String(b.from||"").toUpperCase(),t=String(b.to||"").toUpperCase();if(!(a>0)||!CURRENCIES.includes(f)||!CURRENCIES.includes(t)||f===t)throw err("Echanj pa valab");let bal=await env.DB.prepare(`SELECT balance FROM wallets WHERE uid=? AND currency=?`).bind(uid,f).first();if(Number(bal?.balance||0)<a)throw err("Solde insuffisant");let r=await fetch("https://open.er-api.com/v6/latest/USD"),d=await r.json(),got=round(a/d.rates[f]*d.rates[t]);await env.DB.batch([env.DB.prepare(`UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=?`).bind(a,uid,f),env.DB.prepare(`UPDATE wallets SET balance=balance+? WHERE uid=? AND currency=?`).bind(got,uid,t),env.DB.prepare(`INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'exchange',?,?,'paid',?)`).bind(uid,a,f,`${f}->${t}`)]);return out({ok:true,received:got,to:t})}
async function fixture(env,id){let u=`https://api.sportmonks.com/v3/football/fixtures/${encodeURIComponent(id)}?api_token=${encodeURIComponent(env.SPORTMONKS_TOKEN)}&include=participants;odds`,r=await fetch(u),d=await r.json();if(!r.ok||!d.data)throw err("Evènman Sportmonks pa disponib");return d.data}
async function bet(req,env,uid){let b=await req.json(),a=Number(b.stake),c=String(b.currency||"HTG"),m=String(b.market||"");if(!(a>0)||!CURRENCIES.includes(c)||!["home","draw","away"].includes(m))throw err("Tikè invalide");await fixture(env,b.eventId);let bal=await env.DB.prepare(`SELECT balance FROM wallets WHERE uid=? AND currency=?`).bind(uid,c).first();if(Number(bal?.balance||0)<a)throw err("Solde insuffisant");let u=await env.DB.prepare(`SELECT linked_agent FROM users WHERE uid=?`).bind(uid).first();await env.DB.batch([env.DB.prepare(`UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=? AND balance>=?`).bind(a,uid,c,a),env.DB.prepare(`INSERT INTO bets(uid,event_id,market,stake,currency,agent) VALUES(?,?,?,?,?,?)`).bind(uid,String(b.eventId),m,a,c,u?.linked_agent||null),env.DB.prepare(`INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'bet',?,?,'paid',?)`).bind(uid,a,c,String(b.eventId))]);return out({ok:true,message:"Tikè anrejistre."})}
async function agentApply(req,env,me){let b=await req.json(),n=String(b.name||"").trim(),p=String(b.phone||"").trim(),city=String(b.city||"").trim(),ad=String(b.address||"").trim(),ci=cin(b.cin);if(!n||!p||!city||!ad||ci.length<5)throw err("Ranpli tout enfòmasyon ajan yo");await env.DB.prepare(`INSERT INTO agents(uid,name,phone,city,address,cin_hash,status) VALUES(?,?,?,?,?,?,'pending') ON CONFLICT(uid) DO UPDATE SET name=excluded.name,phone=excluded.phone,city=excluded.city,address=excluded.address,cin_hash=excluded.cin_hash,status='pending'`).bind(me.uid,n,p,city,ad,await hash(ci)).run();return out({ok:true,status:"pending"})}
async function approved(env,uid){let a=await env.DB.prepare(`SELECT * FROM agents WHERE uid=?`).bind(uid).first();if(!a||a.status!=="approved")throw err("Aksè ajan refize",403);return a}
async function agentDashboard(env,uid){let a=await approved(env,uid),p=await env.DB.prepare(`SELECT uid,email,full_name FROM users WHERE linked_agent=?`).bind(a.code).all();return out({agentCode:a.code,commission:Number(a.commission_balance||0),players:p.results})}
async function agentBet(req,env,uid){let a=await approved(env,uid),b=await req.json(),p=await env.DB.prepare(`SELECT linked_agent FROM users WHERE uid=?`).bind(b.playerUid).first();if(p?.linked_agent!==a.code)throw err("Jwè sa pa lye ak ajan sa",403);return bet(new Request(req.url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({eventId:b.eventId,market:b.market,stake:b.stake,currency:b.currency||"HTG"})}),env,b.playerUid)}

async function newSession(env,uid){let t=crypto.randomUUID()+crypto.randomUUID(),h=await hash(t),x=Date.now()+1800000;await env.DB.prepare(`DELETE FROM admin_sessions WHERE uid=? OR expires_at<?`).bind(uid,Date.now()).run();await env.DB.prepare(`INSERT INTO admin_sessions(token_hash,uid,expires_at) VALUES(?,?,?)`).bind(h,uid,x).run();return{ok:true,session:t,expiresAt:x}}
async function cinSetup(req,env,uid){let b=await req.json(),c=cin(b.cin),n=String(b.fullName||"").trim();if(c.length<5||!n)throw err("Non konplè ak CIN obligatwa");let old=await env.DB.prepare(`SELECT * FROM admin_security WHERE uid=?`).bind(uid).first();if(old)throw err("CIN deja configuré",409);await env.DB.batch([env.DB.prepare(`INSERT INTO admin_security(uid,cin_hash) VALUES(?,?)`).bind(uid,await hash(c)),env.DB.prepare(`UPDATE users SET full_name=? WHERE uid=?`).bind(n,uid)]);return out(await newSession(env,uid))}
async function cinVerify(req,env,uid){let b=await req.json(),s=await env.DB.prepare(`SELECT cin_hash FROM admin_security WHERE uid=?`).bind(uid).first();if(!s)throw err("CIN poko configuré",428);if(await hash(cin(b.cin))!==s.cin_hash)throw err("CIN pa koresponn",403);return out(await newSession(env,uid))}
async function session(req,env,uid){let t=req.headers.get("X-Admin-Session")||"";if(!t)throw err("CIN verification requise",401);let s=await env.DB.prepare(`SELECT * FROM admin_sessions WHERE token_hash=?`).bind(await hash(t)).first();if(!s||s.uid!==uid||Number(s.expires_at)<Date.now())throw err("CIN verification requise",401)}
async function adminStats(env){let u=await env.DB.prepare(`SELECT COUNT(*) n FROM users`).first(),b=await env.DB.prepare(`SELECT COUNT(*) n FROM bets WHERE status='open'`).first(),p=await env.DB.prepare(`SELECT balance FROM platform_wallet WHERE currency='HTG'`).first();return out({users:Number(u.n),openBets:Number(b.n),platformBalance:Number(p?.balance||0)})}
async function adminAgents(env){let a=await env.DB.prepare(`SELECT uid,name,phone,city,address,status,code FROM agents ORDER BY status DESC`).all();return out({agents:a.results})}
async function agentReview(req,env){let b=await req.json(),s=String(b.status);if(!["approved","rejected"].includes(s))throw err("Estati pa valab");let code=s==="approved"?`AG${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`:null;await env.DB.prepare(`UPDATE agents SET status=?,code=? WHERE uid=?`).bind(s,code,b.uid).run();return out({ok:true})}
async function settle(req,env){let b=await req.json(),id=String(b.eventId||""),w=String(b.winner||"");if(!["home","draw","away"].includes(w))throw err("Rezilta pa valab");let r=await env.DB.prepare(`SELECT * FROM bets WHERE event_id=? AND status='open'`).bind(id).all(),groups={};for(const x of r.results)(groups[x.currency]??=[]).push(x);for(const[c,bs]of Object.entries(groups)){let total=bs.reduce((s,x)=>s+Number(x.stake),0),wins=bs.filter(x=>x.market===w),ws=wins.reduce((s,x)=>s+Number(x.stake),0),pool=round(total*.6),platform=0,agents={};for(const x of bs){if(x.agent){platform+=Number(x.stake)*.3;agents[x.agent]=(agents[x.agent]||0)+Number(x.stake)*.1}else platform+=Number(x.stake)*.4}for(const x of bs){let pay=x.market===w&&ws>0?round(pool*Number(x.stake)/ws):0,status=x.market===w&&ws>0?"won":"lost";if(pay)await env.DB.prepare(`UPDATE wallets SET balance=balance+? WHERE uid=? AND currency=?`).bind(pay,x.uid,c).run();await env.DB.prepare(`UPDATE bets SET status=?,payout=? WHERE id=?`).bind(status,pay,x.id).run()}await env.DB.prepare(`UPDATE platform_wallet SET balance=balance+? WHERE currency=?`).bind(round(platform),c).run();if(ws===0)await env.DB.prepare(`UPDATE reserve_wallet SET balance=balance+? WHERE currency=?`).bind(pool,c).run();for(const[k,v]of Object.entries(agents))await env.DB.prepare(`UPDATE agents SET commission_balance=commission_balance+? WHERE code=?`).bind(round(v),k).run()}return out({ok:true})}

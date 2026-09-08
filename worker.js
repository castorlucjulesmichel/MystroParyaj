const ORIGIN="https://castorlucjulesmichel.github.io";
const FBKEY="AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA";

export default {
  async fetch(req,env){
    try{
      const u=new URL(req.url), p=u.pathname;

      if(req.method==="OPTIONS") return res({},204);

      if(p==="/"){
        return res({ok:true,app:"MystroParyaj",api:"online",db:!!env.DB});
      }

      if(p==="/api/rates"){
        const r=await fetch("https://open.er-api.com/v6/latest/USD").then(x=>x.json());
        return res({rates:r.rates});
      }

      if(p==="/api/events" && req.method==="GET"){
        const q=await env.DB.prepare(
          "SELECT * FROM events WHERE status='open' ORDER BY start"
        ).all();

        return res({
          items:q.results.map(e=>({
            ...e,
            markets:JSON.parse(e.markets||"{}")
          }))
        });
      }

      const me=await auth(req);
      if(!me) return res({error:"Connexion requise"},401);

      await env.DB.prepare(
        "INSERT OR IGNORE INTO users(uid,email,role) VALUES(?,?,?)"
      ).bind(
        me.uid,
        me.email||"",
        me.uid===env.ADMIN_UID ? "admin":"player"
      ).run();

      if(p==="/api/me"){
        const x=await env.DB.prepare(
          "SELECT * FROM users WHERE uid=?"
        ).bind(me.uid).first();

        return res({
          ...x,
          role:me.uid===env.ADMIN_UID ? "admin":x?.role
        });
      }

      if(p==="/api/wallet"){
        const q=await env.DB.prepare(
          "SELECT currency,balance FROM wallets WHERE uid=?"
        ).bind(me.uid).all();

        const b={HTG:0,USD:0,EUR:0,CAD:0,DOP:0};
        q.results.forEach(x=>b[x.currency]=Number(x.balance||0));

        return res({balances:b});
      }

      if(p==="/api/history"){
        const q=await env.DB.prepare(
          "SELECT * FROM tx WHERE uid=? ORDER BY id DESC LIMIT 100"
        ).bind(me.uid).all();

        return res({items:q.results});
      }

      if(p==="/api/exchange" && req.method==="POST"){
        const x=await req.json();
        const amount=Number(x.amount);

        if(!(amount>0) || x.from===x.to)
          return res({error:"Echanj pa valab"},400);

        const rr=await fetch(
          "https://open.er-api.com/v6/latest/USD"
        ).then(z=>z.json());

        const received=
          amount/Number(rr.rates[x.from])*
          Number(rr.rates[x.to]);

        const current=await balance(env,me.uid,x.from);

        if(current<amount)
          return res({error:"Solde insuffisant"},400);

        await env.DB.batch([
          env.DB.prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=?"
          ).bind(amount,me.uid,x.from),

          env.DB.prepare(`
            INSERT INTO wallets(uid,currency,balance)
            VALUES(?,?,?)
            ON CONFLICT(uid,currency)
            DO UPDATE SET balance=balance+?
          `).bind(me.uid,x.to,received,received),

          env.DB.prepare(`
            INSERT INTO tx(uid,type,amount,currency,status,reference)
            VALUES(?,'exchange',?,?,'paid',?)
          `).bind(
            me.uid,
            amount,
            x.from,
            `${x.from}->${x.to}`
          )
        ]);

        return res({
          ok:true,
          received,
          currency:x.to
        });
      }

      if(p==="/api/bet" && req.method==="POST"){
        const x=await req.json();
        const stake=Number(x.stake);

        if(!(stake>0) || !x.eventId || !x.market)
          return res({error:"Tikè invalide"},400);

        const e=await env.DB.prepare(
          "SELECT * FROM events WHERE id=? AND status='open'"
        ).bind(x.eventId).first();

        if(!e) return res({error:"Evènman fèmen"},400);

        const markets=JSON.parse(e.markets||"{}");
        const odds=Number(markets[x.market]);

        if(!(odds>0))
          return res({error:"Kòt invalide"},400);

        const current=await balance(env,me.uid,x.currency);

        if(current<stake)
          return res({error:"Solde insuffisant"},400);

        const usr=await env.DB.prepare(
          "SELECT linked_agent FROM users WHERE uid=?"
        ).bind(me.uid).first();

        const agent=usr?.linked_agent||null;

        const winnerReserve=stake*0.60;
        const agentShare=agent ? stake*0.10 : 0;
        const platformShare=agent ? stake*0.30 : stake*0.40;
        const payout=stake*odds;

        const b=await env.DB.prepare(`
          INSERT INTO bets
          (uid,event_id,market,stake,currency,odds,payout,agent,status)
          VALUES(?,?,?,?,?,?,?,?,'open')
        `).bind(
          me.uid,
          x.eventId,
          x.market,
          stake,
          x.currency,
          odds,
          payout,
          agent
        ).run();

        await env.DB.batch([
          env.DB.prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=?"
          ).bind(stake,me.uid,x.currency),

          env.DB.prepare(`
            INSERT INTO ledger
            (bet_id,reserve,agent_share,platform_share,currency,agent)
            VALUES(?,?,?,?,?,?)
          `).bind(
            b.meta.last_row_id,
            winnerReserve,
            agentShare,
            platformShare,
            x.currency,
            agent
          ),

          env.DB.prepare(`
            INSERT INTO tx(uid,type,amount,currency,status,reference)
            VALUES(?,'bet',?,?,'paid',?)
          `).bind(
            me.uid,
            stake,
            x.currency,
            String(b.meta.last_row_id)
          )
        ]);

        return res({
          ok:true,
          id:b.meta.last_row_id,
          totalOdds:odds,
          potentialReturn:payout
        });
      }

      if(p==="/api/agent/apply" && req.method==="POST"){
        const x=await req.json();

        await env.DB.prepare(`
          INSERT INTO agents
          (uid,name,phone,city,address,cin,status)
          VALUES(?,?,?,?,?,?,'pending')
          ON CONFLICT(uid) DO UPDATE SET
          name=excluded.name,
          phone=excluded.phone,
          city=excluded.city,
          address=excluded.address,
          cin=excluded.cin,
          status='pending'
        `).bind(
          me.uid,
          x.name||"",
          x.phone||"",
          x.city||"",
          x.address||"",
          x.cin||""
        ).run();

        return res({ok:true,status:"pending"});
      }

      if(p.startsWith("/api/admin/") && me.uid!==env.ADMIN_UID){
        return res({error:"Accès admin refusé"},403);
      }

      if(p==="/api/admin/event" && req.method==="POST"){
        const x=await req.json();

        const r=await env.DB.prepare(`
          INSERT INTO events
          (sport,league,home,away,start,markets,status)
          VALUES(?,?,?,?,?,?,'open')
        `).bind(
          x.sport,
          x.league,
          x.home,
          x.away,
          x.start,
          JSON.stringify(x.markets||{})
        ).run();

        return res({ok:true,id:r.meta.last_row_id});
      }

      if(p==="/api/admin/agent" && req.method==="POST"){
        const x=await req.json();

        if(!["approved","rejected"].includes(x.status))
          return res({error:"Estati pa valab"},400);

        const code=
          x.status==="approved"
          ? "MP-"+crypto.randomUUID().slice(0,6).toUpperCase()
          : null;

        await env.DB.batch([
          env.DB.prepare(
            "UPDATE agents SET status=?,code=COALESCE(?,code) WHERE uid=?"
          ).bind(x.status,code,x.uid),

          env.DB.prepare(
            "UPDATE users SET role=?,agent_code=COALESCE(?,agent_code) WHERE uid=?"
          ).bind(
            x.status==="approved" ? "agent":"player",
            code,
            x.uid
          )
        ]);

        return res({ok:true,code});
      }

      if(p==="/api/admin/settle" && req.method==="POST"){
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
            await env.DB.prepare(
              "UPDATE bets SET status='lost' WHERE id=?"
            ).bind(b.id).run();
            continue;
          }

          const already=await env.DB.prepare(
            "SELECT id FROM tx WHERE type='win' AND reference=?"
          ).bind(String(b.id)).first();

          if(already) continue;

          await env.DB.batch([
            env.DB.prepare(
              "UPDATE bets SET status='won' WHERE id=?"
            ).bind(b.id),

            env.DB.prepare(`
              INSERT INTO wallets(uid,currency,balance)
              VALUES(?,?,?)
              ON CONFLICT(uid,currency)
              DO UPDATE SET balance=balance+?
            `).bind(
              b.uid,
              b.currency,
              b.payout,
              b.payout
            ),

            env.DB.prepare(`
              INSERT INTO tx(uid,type,amount,currency,status,reference)
              VALUES(?,'win',?,?,'paid',?)
            `).bind(
              b.uid,
              b.payout,
              b.currency,
              String(b.id)
            )
          ]);

          paid++;
        }

        return res({ok:true,paid});
      }

      if(p==="/api/admin/stats"){
        const players=await one(env,
          "SELECT COUNT(*) n FROM users WHERE role='player'"
        );

        const agents=await one(env,
          "SELECT COUNT(*) n FROM users WHERE role='agent'"
        );

        const stakes=await one(env,
          "SELECT COALESCE(SUM(stake),0) n FROM bets"
        );

        const wins=await one(env,
          "SELECT COALESCE(SUM(amount),0) n FROM tx WHERE type='win'"
        );

        const agentCommission=await one(env,
          "SELECT COALESCE(SUM(agent_share),0) n FROM ledger"
        );

        const realized=
          Number(stakes.n)-
          Number(wins.n)-
          Number(agentCommission.n);

        return res({
          players:Number(players.n),
          agents:Number(agents.n),
          totalStakes:Number(stakes.n),
          winnersPaid:Number(wins.n),
          agentCommission:Number(agentCommission.n),
          mystroProfit:realized,
          withdrawableProfit:Math.max(0,realized)
        });
      }

      return res({error:"Route introuvable"},404);

    }catch(e){
      return res({error:e.message||"Erreur serveur"},500);
    }
  }
};

async function auth(req){
  const token=(req.headers.get("Authorization")||"")
    .replace("Bearer ","");

  if(!token) return null;

  const r=await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FBKEY}`,
    {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({idToken:token})
    }
  );

  if(!r.ok) return null;

  const d=await r.json();
  const u=d.users?.[0];

  return u
    ? {uid:u.localId,email:u.email||""}
    : null;
}

async function balance(env,uid,currency){
  const x=await env.DB.prepare(
    "SELECT balance FROM wallets WHERE uid=? AND currency=?"
  ).bind(uid,currency).first();

  return Number(x?.balance||0);
}

async function one(env,sql){
  return await env.DB.prepare(sql).first() || {n:0};
}

function res(data,status=200){
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:{
        "Content-Type":"application/json",
        "Access-Control-Allow-Origin":ORIGIN,
        "Access-Control-Allow-Headers":"Authorization,Content-Type",
        "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
      }
    }
  );
    }

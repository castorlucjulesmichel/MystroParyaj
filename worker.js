const ORIGIN="https://castorlucjulesmichel.github.io";

export default{
  async fetch(req,env){
    try{

      const u=new URL(req.url);
      const p=u.pathname;

      if(req.method==="OPTIONS"){
        return J({},204);
      }

      if(!env.DB){
        return J({
          error:"D1 DB binding missing"
        },500);
      }

      await setup(env.DB);

      /* =========================
         ROOT
      ========================= */

      if(p==="/"){
        return J({
          ok:true,
          app:"MystroParyaj",
          api:"online",
          database:true
        });
      }

      /* =========================
         EXCHANGE RATES
      ========================= */

      if(p==="/api/rates"){
        const r=await fetch(
          "https://open.er-api.com/v6/latest/USD"
        );

        const d=await r.json();

        return J({
          ok:r.ok,
          base:"USD",
          rates:d.rates||{}
        });
      }

      /* =========================
         EVENTS
      ========================= */

      if(p==="/api/events"){

        const q=
          await env.DB
          .prepare(
            "SELECT * FROM events WHERE status='open' ORDER BY start"
          )
          .all();

        return J({
          items:q.results.map(
            e=>({
              ...e,
              markets:parse(
                e.markets
              )
            })
          )
        });
      }

      /* =========================
         AUTH
      ========================= */

      const me=
        await user(
          req,
          env
        );

      if(!me){
        return J({
          error:"Connexion requise"
        },401);
      }

      await ensure(
        env,
        me
      );

      const admin=
        me.uid===
        env.ADMIN_UID;

      /* =========================
         PROFILE
      ========================= */

      if(p==="/api/me"){

        const x=
          await env.DB
          .prepare(
            "SELECT * FROM users WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .first();

        const s=
          admin
          ?
          await env.DB
          .prepare(
            "SELECT cin_hash FROM admin_security WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .first()
          :
          null;

        return J({
          uid:me.uid,
          email:me.email,
          role:
            admin
            ?
            "admin"
            :
            x?.role||
            "player",
          cinConfigured:
            !!s?.cin_hash,
          fullName:
            x?.full_name||
            ""
        });
      }

      /* =========================
         ADMIN CIN SETUP
      ========================= */

      if(
        p==="/api/admin/cin/setup"
        &&
        req.method==="POST"
      ){

        if(!admin){
          return J({
            error:
              "Accès admin refusé"
          },403);
        }

        const x=
          await req.json();

        const cin=
          N(x.cin);

        const name=
          String(
            x.fullName||
            ""
          ).trim();

        if(
          cin.length<5
          ||
          !name
        ){
          return J({
            error:
              "Nom complet ak CIN obligatwa"
          },400);
        }

        const old=
          await env.DB
          .prepare(
            "SELECT cin_hash FROM admin_security WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .first();

        if(
          old?.cin_hash
        ){
          return J({
            error:
              "CIN deja configuré"
          },409);
        }

        await env.DB.batch([

          env.DB
          .prepare(
            "INSERT INTO admin_security(uid,cin_hash) VALUES(?,?)"
          )
          .bind(
            me.uid,
            await H(cin)
          ),

          env.DB
          .prepare(
            "UPDATE users SET full_name=? WHERE uid=?"
          )
          .bind(
            name,
            me.uid
          )

        ]);

        return J(
          await session(
            env,
            me.uid
          )
        );
      }

      /* =========================
         ADMIN CIN VERIFY
      ========================= */

      if(
        p==="/api/admin/cin/verify"
        &&
        req.method==="POST"
      ){

        if(!admin){
          return J({
            error:
              "Accès admin refusé"
          },403);
        }

        const x=
          await req.json();

        const row=
          await env.DB
          .prepare(
            "SELECT cin_hash FROM admin_security WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .first();

        if(!row){
          return J({
            error:
              "CIN poko configuré",
            setupRequired:true
          },428);
        }

        if(
          await H(
            N(x.cin)
          )
          !==
          row.cin_hash
        ){
          return J({
            error:
              "CIN pa koresponn"
          },403);
        }

        return J(
          await session(
            env,
            me.uid
          )
        );
      }

      /* =========================
         WALLET
      ========================= */

      if(
        p==="/api/wallet"
      ){

        const q=
          await env.DB
          .prepare(
            "SELECT currency,balance FROM wallets WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .all();

        const b={
          HTG:0,
          USD:0,
          EUR:0,
          CAD:0,
          DOP:0
        };

        q.results.forEach(
          x=>{
            b[x.currency]=
              +x.balance||
              0;
          }
        );

        return J({
          balances:b
        });
      }

      /* =========================
         HISTORY
      ========================= */

      if(
        p==="/api/history"
      ){

        const q=
          await env.DB
          .prepare(
            "SELECT * FROM tx WHERE uid=? ORDER BY id DESC LIMIT 150"
          )
          .bind(
            me.uid
          )
          .all();

        return J({
          items:q.results
        });
      }

      /* =========================
         EXCHANGE
      ========================= */

      if(
        p==="/api/exchange"
        &&
        req.method==="POST"
      ){

        const x=
          await req.json();

        const a=
          +x.amount;

        const f=
          C(x.from);

        const t=
          C(x.to);

        if(
          !(a>0)
          ||
          !f
          ||
          !t
          ||
          f===t
        ){
          return J({
            error:
              "Echanj pa valab"
          },400);
        }

        const rr=
          await fetch(
            "https://open.er-api.com/v6/latest/USD"
          );

        const d=
          await rr.json();

        const r=
          d.rates||
          {};

        const bal=
          await B(
            env,
            me.uid,
            f
          );

        if(
          bal<a
        ){
          return J({
            error:
              "Solde insuffisant"
          },400);
        }

        const got=
          R(
            a/
            r[f]*
            r[t]
          );

        await env.DB.batch([

          env.DB
          .prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=? AND balance>=?"
          )
          .bind(
            a,
            me.uid,
            f,
            a
          ),

          env.DB
          .prepare(
            "INSERT INTO wallets(uid,currency,balance) VALUES(?,?,?) ON CONFLICT(uid,currency) DO UPDATE SET balance=balance+?"
          )
          .bind(
            me.uid,
            t,
            got,
            got
          ),

          env.DB
          .prepare(
            "INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'exchange',?,?,'paid',?)"
          )
          .bind(
            me.uid,
            a,
            f,
            f+"->"+t
          )

        ]);

        return J({
          ok:true,
          received:got,
          to:t
        });
      }

      /* =========================
         PLAYER BET
      ========================= */

      if(
        p==="/api/bet"
        &&
        req.method==="POST"
      ){

        const x=
          await req.json();

        const stake=
          +x.stake;

        const cur=
          C(
            x.currency||
            "HTG"
          );

        if(
          !(stake>0)
          ||
          !cur
        ){
          return J({
            error:
              "Tikè invalide"
          },400);
        }

        const e=
          await env.DB
          .prepare(
            "SELECT * FROM events WHERE id=? AND status='open'"
          )
          .bind(
            x.eventId
          )
          .first();

        if(!e){
          return J({
            error:
              "Evènman fèmen"
          },400);
        }

        const odds=
          +parse(
            e.markets
          )[x.market];

        if(
          !(odds>0)
        ){
          return J({
            error:
              "Kòt pa valab"
          },400);
        }

        if(
          await B(
            env,
            me.uid,
            cur
          )
          <
          stake
        ){
          return J({
            error:
              "Solde insuffisant"
          },400);
        }

        const pr=
          await env.DB
          .prepare(
            "SELECT linked_agent FROM users WHERE uid=?"
          )
          .bind(
            me.uid
          )
          .first();

        const ag=
          pr?.linked_agent||
          null;

        const pay=
          R(
            stake*
            odds
          );

        const bs=
          await env.DB
          .prepare(
            "INSERT INTO bets(uid,event_id,market,stake,currency,odds,payout,agent,status) VALUES(?,?,?,?,?,?,?,?,'open')"
          )
          .bind(
            me.uid,
            x.eventId,
            x.market,
            stake,
            cur,
            odds,
            pay,
            ag
          )
          .run();

        await env.DB.batch([

          env.DB
          .prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=? AND balance>=?"
          )
          .bind(
            stake,
            me.uid,
            cur,
            stake
          ),

          env.DB
          .prepare(
            "INSERT INTO ledger(bet_id,reserve,agent_share,platform_share,currency,agent) VALUES(?,?,?,?,?,?)"
          )
          .bind(
            bs.meta.last_row_id,
            R(stake*.6),
            ag
              ?
              R(stake*.1)
              :
              0,
            ag
              ?
              R(stake*.3)
              :
              R(stake*.4),
            cur,
            ag
          ),

          env.DB
          .prepare(
            "INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'bet',?,?,'paid',?)"
          )
          .bind(
            me.uid,
            stake,
            cur,
            String(
              bs.meta.last_row_id
            )
          )

        ]);

        return J({
          ok:true,
          betId:
            bs.meta.last_row_id,
          potentialReturn:
            pay
        });
      }

      /* =========================
         AGENT PLAYERS
      ========================= */

      if(
        p==="/api/agent/players"
      ){

        const ag=
          await env.DB
          .prepare(
            "SELECT code FROM agents WHERE uid=? AND status='approved'"
          )
          .bind(
            me.uid
          )
          .first();

        if(!ag){
          return J({
            error:
              "Kont ajan pa apwouve"
          },403);
        }

        const q=
          await env.DB
          .prepare(
            "SELECT uid,email,full_name FROM users WHERE linked_agent=? ORDER BY email"
          )
          .bind(
            ag.code
          )
          .all();

        return J({
          items:
            q.results
        });
      }

      /* =========================
         AGENT MAKES BET FOR PLAYER
      ========================= */

      if(
        p==="/api/agent/bet"
        &&
        req.method==="POST"
      ){

        const ag=
          await env.DB
          .prepare(
            "SELECT code FROM agents WHERE uid=? AND status='approved'"
          )
          .bind(
            me.uid
          )
          .first();

        if(!ag){
          return J({
            error:
              "Kont ajan pa apwouve"
          },403);
        }

        const x=
          await req.json();

        const player=
          String(
            x.playerUid||
            ""
          );

        const stake=
          +x.stake;

        const cur=
          C(
            x.currency||
            "HTG"
          );

        if(
          !player
          ||
          !(stake>0)
          ||
          !cur
          ||
          !x.eventId
          ||
          !x.market
        ){
          return J({
            error:
              "Fich la pa valab"
          },400);
        }

        const linked=
          await env.DB
          .prepare(
            "SELECT uid FROM users WHERE uid=? AND linked_agent=?"
          )
          .bind(
            player,
            ag.code
          )
          .first();

        if(!linked){
          return J({
            error:
              "Jwè sa a pa lye ak kont ajan ou"
          },403);
        }

        const e=
          await env.DB
          .prepare(
            "SELECT * FROM events WHERE id=? AND status='open'"
          )
          .bind(
            x.eventId
          )
          .first();

        if(!e){
          return J({
            error:
              "Evènman fèmen"
          },400);
        }

        const odds=
          +parse(
            e.markets
          )[x.market];

        if(
          !(odds>0)
        ){
          return J({
            error:
              "Kòt pa valab"
          },400);
        }

        if(
          await B(
            env,
            player,
            cur
          )
          <
          stake
        ){
          return J({
            error:
              "Balans jwè a pa sifi"
          },400);
        }

        const pay=
          R(
            stake*
            odds
          );

        const bs=
          await env.DB
          .prepare(
            "INSERT INTO bets(uid,event_id,market,stake,currency,odds,payout,agent,status,created_by_agent_uid) VALUES(?,?,?,?,?,?,?,?,'open',?)"
          )
          .bind(
            player,
            x.eventId,
            x.market,
            stake,
            cur,
            odds,
            pay,
            ag.code,
            me.uid
          )
          .run();

        await env.DB.batch([

          env.DB
          .prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=? AND balance>=?"
          )
          .bind(
            stake,
            player,
            cur,
            stake
          ),

          env.DB
          .prepare(
            "INSERT INTO ledger(bet_id,reserve,agent_share,platform_share,currency,agent) VALUES(?,?,?,?,?,?)"
          )
          .bind(
            bs.meta.last_row_id,
            R(stake*.6),
            R(stake*.1),
            R(stake*.3),
            cur,
            ag.code
          ),

          env.DB
          .prepare(
            "INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'agent_bet',?,?,'paid',?)"
          )
          .bind(
            player,
            stake,
            cur,
            String(
              bs.meta.last_row_id
            )
          )

        ]);

        return J({
          ok:true,
          betId:
            bs.meta.last_row_id,
          potentialReturn:
            pay
        });
      }

      /* =========================
         AGENT PAYOUT REQUEST
      ========================= */

      if(
        p==="/api/agent/payout-request"
        &&
        req.method==="POST"
      ){

        const ag=
          await env.DB
          .prepare(
            "SELECT code FROM agents WHERE uid=? AND status='approved'"
          )
          .bind(
            me.uid
          )
          .first();

        if(!ag){
          return J({
            error:
              "Kont ajan pa apwouve"
          },403);
        }

        const x=
          await req.json();

        const betId=
          +x.betId;

        const b=
          await env.DB
          .prepare(
            "SELECT * FROM bets WHERE id=? AND agent=?"
          )
          .bind(
            betId,
            ag.code
          )
          .first();

        if(!b){
          return J({
            error:
              "Pari sa a pa pou yon jwè ki anba ajan sa a"
          },404);
        }

        if(
          b.status!=="won"
        ){
          return J({
            error:
              "Se sèlman pari gagnan ki ka mande peman"
          },400);
        }

        const old=
          await env.DB
          .prepare(
            "SELECT id,status FROM payout_requests WHERE bet_id=? AND status IN ('pending','approved','paid')"
          )
          .bind(
            betId
          )
          .first();

        if(old){
          return J({
            error:
              "Gen yon demann peman deja pou pari sa a",
            requestId:
              old.id,
            status:
              old.status
          },409);
        }

        const bal=
          await B(
            env,
            b.uid,
            b.currency
          );

        if(
          bal<
          Number(
            b.payout
          )
        ){
          return J({
            error:
              "Gain lan pa disponib ankò nan bous jwè a"
          },400);
        }

        const r=
          await env.DB
          .prepare(
            "INSERT INTO payout_requests(agent_uid,player_uid,bet_id,amount,currency,status) VALUES(?,?,?,?,?,'pending')"
          )
          .bind(
            me.uid,
            b.uid,
            b.id,
            b.payout,
            b.currency
          )
          .run();

        await env.DB.batch([

          env.DB
          .prepare(
            "UPDATE wallets SET balance=balance-? WHERE uid=? AND currency=? AND balance>=?"
          )
          .bind(
            b.payout,
            b.uid,
            b.currency,
            b.payout
          ),

          env.DB
          .prepare(
            "INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'payout_reserve',?,?,'pending',?)"
          )
          .bind(
            b.uid,
            b.payout,
            b.currency,
            String(
              r.meta.last_row_id
            )
          )

        ]);

        return J({
          ok:true,
          requestId:
            r.meta.last_row_id,
          status:
            "pending"
        });
      }

      /* =========================
         AGENT PAYOUT HISTORY
      ========================= */

      if(
        p==="/api/agent/payout-requests"
      ){

        const q=
          await env.DB
          .prepare(
            "SELECT * FROM payout_requests WHERE agent_uid=? ORDER BY id DESC LIMIT 100"
          )
          .bind(
            me.uid
          )
          .all();

        return J({
          items:
            q.results
        });
      }

      /* =========================
         ADMIN SECURITY GATE
      ========================= */

      if(
        p.startsWith(
          "/api/admin/"
        )
      ){

        if(!admin){
          return J({
            error:
              "Accès admin refusé"
          },403);
        }

        if(
          !await check(
            req,
            env,
            me.uid
          )
        ){
          return J({
            error:
              "Konfimasyon CIN nesesè",
            cinRequired:true
          },401);
        }
      }

      /* =========================
         ADMIN STATS
      ========================= */

      if(
        p==="/api/admin/stats"
      ){

        return J({

          players:
            await S(
              env,
              "SELECT COUNT(*) n FROM users WHERE role='player'"
            ),

          agents:
            await S(
              env,
              "SELECT COUNT(*) n FROM agents WHERE status='approved'"
            ),

          totalBets:
            await S(
              env,
              "SELECT COUNT(*) n FROM bets"
            ),

          openBets:
            await S(
              env,
              "SELECT COUNT(*) n FROM bets WHERE status='open'"
            ),

          transactions:
            await S(
              env,
              "SELECT COUNT(*) n FROM tx"
            )

        });
      }

      /* =========================
         ADMIN PAYOUT REQUESTS
      ========================= */

      if(
        p==="/api/admin/payout-requests"
      ){

        const q=
          await env.DB
          .prepare(
            "SELECT pr.*,u.email,u.full_name,a.name agent_name FROM payout_requests pr LEFT JOIN users u ON u.uid=pr.player_uid LEFT JOIN agents a ON a.uid=pr.agent_uid ORDER BY pr.id DESC LIMIT 200"
          )
          .all();

        return J({
          items:
            q.results
        });
      }

      /* =========================
         ADMIN PAYOUT REVIEW
      ========================= */

      if(
        p==="/api/admin/payout-review"
        &&
        req.method==="POST"
      ){

        const x=
          await req.json();

        const id=
          +x.id;

        const status=
          String(
            x.status||
            ""
          );

        if(
          ![
            "approved",
            "rejected",
            "paid"
          ].includes(
            status
          )
        ){
          return J({
            error:
              "Estati peman pa valab"
          },400);
        }

        const pr=
          await env.DB
          .prepare(
            "SELECT * FROM payout_requests WHERE id=?"
          )
          .bind(
            id
          )
          .first();

        if(!pr){
          return J({
            error:
              "Demann peman pa jwenn"
          },404);
        }

        if(
          [
            "rejected",
            "paid"
          ].includes(
            pr.status
          )
        ){
          return J({
            error:
              "Demann sa a deja fèmen"
          },409);
        }

        if(
          status==="rejected"
        ){

          await env.DB.batch([

            env.DB
            .prepare(
              "UPDATE payout_requests SET status='rejected',reviewed_at=CURRENT_TIMESTAMP WHERE id=?"
            )
            .bind(
              id
            ),

            env.DB
            .prepare(
              "INSERT INTO wallets(uid,currency,balance) VALUES(?,?,?) ON CONFLICT(uid,currency) DO UPDATE SET balance=balance+?"
            )
            .bind(
              pr.player_uid,
              pr.currency,
              pr.amount,
              pr.amount
            ),

            env.DB
            .prepare(
              "UPDATE tx SET status='rejected' WHERE type='payout_reserve' AND reference=?"
            )
            .bind(
              String(id)
            )

          ]);

          return J({
            ok:true,
            status:
              "rejected",
            refunded:true
          });
        }

        await env.DB
        .prepare(
          "UPDATE payout_requests SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?"
        )
        .bind(
          status,
          id
        )
        .run();

        if(
          status==="paid"
        ){
          await env.DB
          .prepare(
            "UPDATE tx SET status='paid' WHERE type='payout_reserve' AND reference=?"
          )
          .bind(
            String(id)
          )
          .run();
        }

        return J({
          ok:true,
          status
        });
      }

      /* =========================
         ADMIN CREATE EVENT
      ========================= */

      if(
        p==="/api/admin/event"
        &&
        req.method==="POST"
      ){

        const x=
          await req.json();

        const r=
          await env.DB
          .prepare(
            "INSERT INTO events(sport,league,home,away,start,markets,status) VALUES(?,?,?,?,?,?,'open')"
          )
          .bind(
            x.sport,
            x.league||
            "",
            x.home,
            x.away,
            x.start,
            JSON.stringify(
              x.markets||
              {}
            )
          )
          .run();

        return J({
          ok:true,
          id:
            r.meta.last_row_id
        });
      }

      /* =========================
         ADMIN SETTLE EVENT
      ========================= */

      if(
        p==="/api/admin/settle"
        &&
        req.method==="POST"
      ){

        const x=
          await req.json();

        const id=
          +x.eventId;

        const w=
          String(
            x.winner||
            ""
          );

        await env.DB
        .prepare(
          "UPDATE events SET status='settled',winner=? WHERE id=?"
        )
        .bind(
          w,
          id
        )
        .run();

        const q=
          await env.DB
          .prepare(
            "SELECT * FROM bets WHERE event_id=? AND status='open'"
          )
          .bind(
            id
          )
          .all();

        let won=0;
        let lost=0;

        for(
          const b of q.results
        ){

          if(
            b.market!==w
          ){

            await env.DB
            .prepare(
              "UPDATE bets SET status='lost' WHERE id=?"
            )
            .bind(
              b.id
            )
            .run();

            lost++;

            continue;
          }

          await env.DB.batch([

            env.DB
            .prepare(
              "UPDATE bets SET status='won' WHERE id=?"
            )
            .bind(
              b.id
            ),

            env.DB
            .prepare(
              "INSERT INTO wallets(uid,currency,balance) VALUES(?,?,?) ON CONFLICT(uid,currency) DO UPDATE SET balance=balance+?"
            )
            .bind(
              b.uid,
              b.currency,
              b.payout,
              b.payout
            ),

            env.DB
            .prepare(
              "INSERT INTO tx(uid,type,amount,currency,status,reference) VALUES(?,'win',?,?,'paid',?)"
            )
            .bind(
              b.uid,
              b.payout,
              b.currency,
              String(
                b.id
              )
            )

          ]);

          won++;
        }

        return J({
          ok:true,
          won,
          lost
        });
      }

      return J({
        error:
          "Route introuvable"
      },404);

    }catch(e){

      return J({
        error:
          e.message||
          "Erreur serveur"
      },500);

    }
  }
};


/* =========================
   DATABASE SETUP
========================= */

async function setup(db){

  await db.batch([

    db.prepare(
      "CREATE TABLE IF NOT EXISTS users(uid TEXT PRIMARY KEY,email TEXT,role TEXT DEFAULT 'player',agent_code TEXT,linked_agent TEXT,full_name TEXT)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS wallets(uid TEXT,currency TEXT,balance REAL DEFAULT 0,PRIMARY KEY(uid,currency))"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,sport TEXT,league TEXT,home TEXT,away TEXT,start TEXT,markets TEXT,status TEXT DEFAULT 'open',winner TEXT)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS bets(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,event_id INTEGER,market TEXT,stake REAL,currency TEXT,odds REAL,payout REAL,agent TEXT,status TEXT DEFAULT 'open')"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY AUTOINCREMENT,bet_id INTEGER,reserve REAL,agent_share REAL,platform_share REAL,currency TEXT,agent TEXT)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS tx(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,type TEXT,amount REAL,currency TEXT,status TEXT,reference TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS agents(uid TEXT PRIMARY KEY,name TEXT,phone TEXT,city TEXT,address TEXT,cin TEXT,status TEXT DEFAULT 'pending',code TEXT)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS admin_security(uid TEXT PRIMARY KEY,cin_hash TEXT NOT NULL)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS admin_sessions(id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT,token_hash TEXT,expires_at TEXT)"
    ),

    db.prepare(
      "CREATE TABLE IF NOT EXISTS payout_requests(id INTEGER PRIMARY KEY AUTOINCREMENT,agent_uid TEXT,player_uid TEXT,bet_id INTEGER,amount REAL,currency TEXT,status TEXT DEFAULT 'pending',created_at TEXT DEFAULT CURRENT_TIMESTAMP,reviewed_at TEXT)"
    )

  ]);

  for(
    const [
      t,
      c,
      ty
    ]
    of
    [
      [
        "users",
        "full_name",
        "TEXT"
      ],
      [
        "events",
        "winner",
        "TEXT"
      ],
      [
        "bets",
        "created_by_agent_uid",
        "TEXT"
      ]
    ]
  ){

    try{

      await db
      .prepare(
        `ALTER TABLE ${t} ADD COLUMN ${c} ${ty}`
      )
      .run();

    }catch{}

  }
}


/* =========================
   FIREBASE USER VERIFY
========================= */

async function user(
  req,
  env
){

  const t=
    (
      req.headers.get(
        "Authorization"
      )||
      ""
    )
    .replace(
      "Bearer ",
      ""
    );

  if(!t){
    return null;
  }

  const k=
    env.FIREBASE_WEB_API_KEY
    ||
    "AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA";

  const r=
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${k}`,
      {
        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            idToken:t
          })
      }
    );

  if(!r.ok){
    return null;
  }

  const d=
    await r.json();

  const u=
    d.users?.[0];

  return u
  ?
  {
    uid:u.localId,
    email:
      u.email||
      ""
  }
  :
  null;
}


/* =========================
   ENSURE USER
========================= */

async function ensure(
  env,
  me
){

  await env.DB
  .prepare(
    "INSERT INTO users(uid,email,role) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET email=excluded.email,role=CASE WHEN users.uid=? THEN 'admin' ELSE users.role END"
  )
  .bind(
    me.uid,
    me.email,
    me.uid===
    env.ADMIN_UID
    ?
    "admin"
    :
    "player",
    env.ADMIN_UID||
    ""
  )
  .run();
}


/* =========================
   ADMIN SESSION
========================= */

async function session(
  env,
  uid
){

  const raw=
    crypto.randomUUID()
    +
    crypto.randomUUID();

  const h=
    await H(raw);

  const exp=
    new Date(
      Date.now()
      +
      1800000
    )
    .toISOString();

  await env.DB.batch([

    env.DB
    .prepare(
      "DELETE FROM admin_sessions WHERE uid=?"
    )
    .bind(
      uid
    ),

    env.DB
    .prepare(
      "INSERT INTO admin_sessions(uid,token_hash,expires_at) VALUES(?,?,?)"
    )
    .bind(
      uid,
      h,
      exp
    )

  ]);

  return{
    ok:true,
    sessionToken:
      raw,
    expiresAt:
      exp
  };
}


/* =========================
   CHECK ADMIN SESSION
========================= */

async function check(
  req,
  env,
  uid
){

  const raw=
    req.headers.get(
      "X-Admin-Session"
    )||
    "";

  if(!raw){
    return false;
  }

  const x=
    await env.DB
    .prepare(
      "SELECT token_hash,expires_at FROM admin_sessions WHERE uid=? ORDER BY id DESC LIMIT 1"
    )
    .bind(
      uid
    )
    .first();

  return(
    !!x
    &&
    new Date(
      x.expires_at
    )
    >
    new Date()
    &&
    await H(raw)
    ===
    x.token_hash
  );
}


/* =========================
   SHA256
========================= */

async function H(v){

  const b=
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder()
      .encode(v)
    );

  return[
    ...new Uint8Array(b)
  ]
  .map(
    x=>
      x
      .toString(16)
      .padStart(
        2,
        "0"
      )
  )
  .join("");
}


/* =========================
   BALANCE
========================= */

async function B(
  env,
  u,
  c
){

  const x=
    await env.DB
    .prepare(
      "SELECT balance FROM wallets WHERE uid=? AND currency=?"
    )
    .bind(
      u,
      c
    )
    .first();

  return(
    +x?.balance||
    0
  );
}


/* =========================
   SCALAR
========================= */

async function S(
  env,
  q
){

  const x=
    await env.DB
    .prepare(q)
    .first();

  return(
    +x?.n||
    0
  );
}


/* =========================
   HELPERS
========================= */

const N=
  v=>
    String(
      v||
      ""
    )
    .replace(
      /\s+/g,
      ""
    )
    .toUpperCase();


const C=
  v=>
    [
      "HTG",
      "USD",
      "EUR",
      "CAD",
      "DOP"
    ]
    .includes(
      String(
        v||
        ""
      )
      .toUpperCase()
    )
    ?
    String(v)
    .toUpperCase()
    :
    null;


const R=
  n=>
    Math.round(
      n*100
    )/
    100;


const parse=
  v=>{
    try{
      return JSON.parse(
        v||
        "{}"
      );
    }catch{
      return{};
    }
  };


/* =========================
   RESPONSE + CORS
========================= */

function J(
  d,
  s=200
){

  return new Response(
    s===204
    ?
    null
    :
    JSON.stringify(d),
    {
      status:s,

      headers:{
        "Content-Type":
          "application/json",

        "Access-Control-Allow-Origin":
          ORIGIN,

        "Access-Control-Allow-Headers":
          "Authorization,Content-Type,X-Admin-Session",

        "Access-Control-Allow-Methods":
          "GET,POST,OPTIONS"
      }
    }
  );
    }

const ORIGIN =
  "https://castorlucjulesmichel.github.io";


export default {

  async fetch(
    req,
    env
  ){

    try{

      const url =
        new URL(
          req.url
        );


      const path =
        url.pathname;


      if(
        req.method ===
        "OPTIONS"
      ){

        return response(
          {},
          204
        );

      }


      if(!env.DB){

        return response(
          {
            error:
              "D1 DB binding missing"
          },
          500
        );

      }


      await setupDatabase(
        env.DB
      );


      /* ROOT */

      if(
        path === "/"
      ){

        return response({

          ok:true,

          app:
            "MystroParyaj",

          api:
            "online",

          database:
            true

        });

      }


      /* RATES */

      if(
        path ===
        "/api/rates"
      ){

        const rateResponse =
          await fetch(
            "https://open.er-api.com/v6/latest/USD"
          );


        const data =
          await rateResponse
          .json();


        return response({

          ok:
            rateResponse.ok,

          base:
            "USD",

          rates:
            data.rates ||
            {}

        });

      }


      /* PUBLIC EVENTS */

      if(
        path ===
        "/api/events"
      ){

        const events =
          await env.DB
          .prepare(
            `
            SELECT *
            FROM events
            WHERE status='open'
            ORDER BY start
            `
          )
          .all();


        return response({

          items:
            events.results
            .map(
              item => ({

                ...item,

                markets:
                  parseJSON(
                    item.markets
                  )

              })
            )

        });

      }


      /* MONCASH RETURN */

      if(
        path ===
        "/api/moncash/return"
      ){

        return moncashReturn(
          req,
          env
        );

      }


      /* AUTH */

      const me =
        await firebaseUser(
          req,
          env
        );


      if(!me){

        return response(
          {
            error:
              "Connexion requise"
          },
          401
        );

      }


      await ensureUser(
        env,
        me
      );


      const isAdmin =
        me.uid ===
        env.ADMIN_UID;


      /* =========================
         PROFILE
      ========================= */

      if(
        path ===
        "/api/me"
      ){

        const profile =
          await env.DB
          .prepare(
            `
            SELECT *
            FROM users
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first();


        const agent =
          await env.DB
          .prepare(
            `
            SELECT
              status,
              code,
              name
            FROM agents
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first();


        const adminSecurity =
          isAdmin
          ?
          await env.DB
          .prepare(
            `
            SELECT cin_hash
            FROM admin_security
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first()
          :
          null;


        const agentApproved =
          agent?.status ===
          "approved";


        let role =
          "player";


        if(agentApproved){

          role =
            "agent";

        }


        if(isAdmin){

          role =
            "admin";

        }


        return response({

          uid:
            me.uid,

          email:
            me.email,

          role,

          accountType:
            role,

          fullName:
            profile
              ?.full_name
            ||
            agent?.name
            ||
            "",

          linkedAgent:
            profile
              ?.linked_agent
            ||
            null,

          agentStatus:
            agent
              ?.status
            ||
            "none",

          agentCode:
            agentApproved
            ?
            agent.code
            :
            null,

          canAccessAgent:
            agentApproved
            &&
            !isAdmin,

          canAccessAdmin:
            isAdmin,

          cinConfigured:
            isAdmin
            ?
            !!adminSecurity
              ?.cin_hash
            :
            false

        });

      }


      /* =========================
         ADMIN CIN SETUP
      ========================= */

      if(
        path ===
          "/api/admin/cin/setup"
        &&
        req.method ===
          "POST"
      ){

        if(!isAdmin){

          return response(
            {
              error:
                "Accès admin refusé"
            },
            403
          );

        }


        const body =
          await req.json();


        const cin =
          normalizeCIN(
            body.cin
          );


        const fullName =
          String(
            body.fullName ||
            ""
          )
          .trim();


        if(
          cin.length < 5 ||
          !fullName
        ){

          return response(
            {
              error:
                "Nom complet ak CIN obligatwa"
            },
            400
          );

        }


        const old =
          await env.DB
          .prepare(
            `
            SELECT cin_hash
            FROM admin_security
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first();


        if(
          old?.cin_hash
        ){

          return response(
            {
              error:
                "CIN deja configuré"
            },
            409
          );

        }


        await env.DB.batch([

          env.DB
          .prepare(
            `
            INSERT INTO admin_security(
              uid,
              cin_hash
            )
            VALUES(?,?)
            `
          )
          .bind(
            me.uid,
            await sha256(
              cin
            )
          ),

          env.DB
          .prepare(
            `
            UPDATE users
            SET full_name=?
            WHERE uid=?
            `
          )
          .bind(
            fullName,
            me.uid
          )

        ]);


        return response(
          await createAdminSession(
            env,
            me.uid
          )
        );

      }


      /* =========================
         ADMIN CIN VERIFY
      ========================= */

      if(
        path ===
          "/api/admin/cin/verify"
        &&
        req.method ===
          "POST"
      ){

        if(!isAdmin){

          return response(
            {
              error:
                "Accès admin refusé"
            },
            403
          );

        }


        const body =
          await req.json();


        const security =
          await env.DB
          .prepare(
            `
            SELECT cin_hash
            FROM admin_security
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first();


        if(!security){

          return response(
            {
              error:
                "CIN poko configuré",

              setupRequired:
                true
            },
            428
          );

        }


        const enteredHash =
          await sha256(
            normalizeCIN(
              body.cin
            )
          );


        if(
          enteredHash !==
          security.cin_hash
        ){

          return response(
            {
              error:
                "CIN pa koresponn"
            },
            403
          );

        }


        return response(
          await createAdminSession(
            env,
            me.uid
          )
        );

      }


      /* =========================
         WALLET
      ========================= */

      if(
        path ===
        "/api/wallet"
      ){

        const wallets =
          await env.DB
          .prepare(
            `
            SELECT
              currency,
              balance
            FROM wallets
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .all();


        const balances = {

          HTG:0,

          USD:0,

          EUR:0,

          CAD:0,

          DOP:0

        };


        wallets.results
          .forEach(
            item => {

              balances[
                item.currency
              ] =
                Number(
                  item.balance ||
                  0
                );

            }
          );


        return response({
          balances
        });

      }


      /* =========================
         HISTORY
      ========================= */

      if(
        path ===
        "/api/history"
      ){

        const history =
          await env.DB
          .prepare(
            `
            SELECT *
            FROM tx
            WHERE uid=?
            ORDER BY id DESC
            LIMIT 150
            `
          )
          .bind(
            me.uid
          )
          .all();


        return response({

          items:
            history.results

        });

      }


      /* =========================
         EXCHANGE
      ========================= */

      if(
        path ===
          "/api/exchange"
        &&
        req.method ===
          "POST"
      ){

        const body =
          await req.json();


        const amount =
          Number(
            body.amount
          );


        const from =
          validCurrency(
            body.from
          );


        const to =
          validCurrency(
            body.to
          );


        if(
          !(amount > 0)
          ||
          !from
          ||
          !to
          ||
          from === to
        ){

          return response(
            {
              error:
                "Echanj pa valab"
            },
            400
          );

        }


        const ratesResponse =
          await fetch(
            "https://open.er-api.com/v6/latest/USD"
          );


        const ratesData =
          await ratesResponse
          .json();


        const rates =
          ratesData.rates ||
          {};


        if(
          !rates[from]
          ||
          !rates[to]
        ){

          return response(
            {
              error:
                "Deviz pa disponib"
            },
            400
          );

        }


        const current =
          await getBalance(
            env,
            me.uid,
            from
          );


        if(
          current < amount
        ){

          return response(
            {
              error:
                "Solde insuffisant"
            },
            400
          );

        }


        const received =
          roundMoney(
            amount /
            rates[from] *
            rates[to]
          );


        await env.DB.batch([

          env.DB
          .prepare(
            `
            UPDATE wallets
            SET balance=
              balance-?
            WHERE uid=?
            AND currency=?
            AND balance>=?
            `
          )
          .bind(
            amount,
            me.uid,
            from,
            amount
          ),

          env.DB
          .prepare(
            `
            INSERT INTO wallets(
              uid,
              currency,
              balance
            )
            VALUES(?,?,?)
            ON CONFLICT(
              uid,
              currency
            )
            DO UPDATE SET
              balance=
                balance+?
            `
          )
          .bind(
            me.uid,
            to,
            received,
            received
          ),

          env.DB
          .prepare(
            `
            INSERT INTO tx(
              uid,
              type,
              amount,
              currency,
              status,
              reference
            )
            VALUES(
              ?,
              'exchange',
              ?,
              ?,
              'paid',
              ?
            )
            `
          )
          .bind(
            me.uid,
            amount,
            from,
            from +
            "->" +
            to
          )

        ]);


        return response({

          ok:true,

          received,

          to

        });

      }


      /* =========================
         PLAYER BET
      ========================= */

      if(
        path ===
          "/api/bet"
        &&
        req.method ===
          "POST"
      ){

        const body =
          await req.json();


        const stake =
          Number(
            body.stake
          );


        const currency =
          validCurrency(
            body.currency ||
            "HTG"
          );


        if(
          !(stake > 0)
          ||
          !currency
          ||
          !body.eventId
          ||
          !body.market
        ){

          return response(
            {
              error:
                "Tikè invalide"
            },
            400
          );

        }


        const event =
          await env.DB
          .prepare(
            `
            SELECT *
            FROM events
            WHERE id=?
            AND status='open'
            `
          )
          .bind(
            body.eventId
          )
          .first();


        if(!event){

          return response(
            {
              error:
                "Evènman fèmen"
            },
            400
          );

        }


        const markets =
          parseJSON(
            event.markets
          );


        const odds =
          Number(
            markets[
              body.market
            ]
          );


        if(
          !(odds > 0)
        ){

          return response(
            {
              error:
                "Kòt pa valab"
            },
            400
          );

        }


        const currentBalance =
          await getBalance(
            env,
            me.uid,
            currency
          );


        if(
          currentBalance <
          stake
        ){

          return response(
            {
              error:
                "Solde insuffisant"
            },
            400
          );

        }


        const player =
          await env.DB
          .prepare(
            `
            SELECT linked_agent
            FROM users
            WHERE uid=?
            `
          )
          .bind(
            me.uid
          )
          .first();


        const linkedAgent =
          player
            ?.linked_agent
          ||
          null;


        const payout =
          roundMoney(
            stake *
            odds
          );


        const betResult =
          await env.DB
          .prepare(
            `
            INSERT INTO bets(
              uid,
              event_id,
              market,
              stake,
              currency,
              odds,
              payout,
              agent,
              status
            )
            VALUES(
              ?,?,?,?,?,?,?,?,
              'open'
            )
            `
          )
          .bind(
            me.uid,
            body.eventId,
            body.market,
            stake,
            currency,
            odds,
            payout,
            linkedAgent
          )
          .run();


        const betId =
          betResult.meta
            .last_row_id;


        await env.DB.batch([

          env.DB
          .prepare(
            `
            UPDATE wallets
            SET balance=
              balance-?
            WHERE uid=?
            AND currency=?
            AND balance>=?
            `
          )
          .bind(
            stake,
            me.uid,
            currency,
            stake
          ),

          env.DB
          .prepare(
            `
            INSERT INTO ledger(
              bet_id,
              reserve,
              agent_share,
              platform_share,
              currency,
              agent
            )
            VALUES(?,?,?,?,?,?)
            `
          )
          .bind(
            betId,
            roundMoney(
              stake *
              0.60

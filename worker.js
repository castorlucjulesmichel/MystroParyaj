const ORIGIN = "https://castorlucjulesmichel.github.io";

export default {
  async fetch(req, env) {
    try {
      const u = new URL(req.url);
      const p = u.pathname;

      if (req.method === "OPTIONS") {
        return cors({}, 204);
      }

      await setup(env.DB);

      // =====================================================
      // PUBLIC
      // =====================================================

      if (p === "/") {
        return json({
          ok: true,
          app: "MystroParyaj",
          api: "online",
          database: !!env.DB
        });
      }

      if (p === "/api/rates") {
        return rates();
      }

      if (p === "/api/events" && req.method === "GET") {
        const q = await env.DB.prepare(`
          SELECT *
          FROM events
          WHERE status='open'
          ORDER BY start
        `).all();

        return json({
          items: q.results.map(eventOut)
        });
      }

      if (p === "/api/moncash/return") {
        return moncashReturn(req, env);
      }

      // =====================================================
      // AUTH
      // =====================================================

      const me = await firebaseUser(req, env);

      if (!me) {
        return json({
          error: "Connexion requise"
        }, 401);
      }

      await ensureUser(env, me);

      const profile = await env.DB.prepare(`
        SELECT *
        FROM users
        WHERE uid=?
      `).bind(me.uid).first();

      const isAdmin =
        me.uid === env.ADMIN_UID;

      // =====================================================
      // PROFILE
      // =====================================================

      if (p === "/api/me") {
        return json({
          uid: me.uid,
          email: me.email || "",
          role: isAdmin
            ? "admin"
            : profile?.role || "player",
          agentCode:
            profile?.agent_code || null,
          linkedAgent:
            profile?.linked_agent || null,
          admin: isAdmin
            ? {
                code:
                  env.ADMIN_CODE || "",
                email:
                  env.ADMIN_EMAIL ||
                  me.email ||
                  "",
                phone:
                  env.ADMIN_PHONE || "",
                cin:
                  mask(
                    env.ADMIN_CIN || ""
                  )
              }
            : null
        });
      }

      // =====================================================
      // WALLET
      // =====================================================

      if (p === "/api/wallet") {
        return userWallet(
          env,
          me.uid
        );
      }

      if (p === "/api/history") {
        const q = await env.DB.prepare(`
          SELECT *
          FROM tx
          WHERE uid=?
          ORDER BY id DESC
          LIMIT 150
        `).bind(me.uid).all();

        return json({
          items: q.results
        });
      }

      // =====================================================
      // EXCHANGE
      // =====================================================

      if (
        p === "/api/exchange" &&
        req.method === "POST"
      ) {
        const x = await req.json();

        const amount =
          Number(x.amount);

        const from =
          cleanCurrency(x.from);

        const to =
          cleanCurrency(x.to);

        if (
          !(amount > 0) ||
          !from ||
          !to ||
          from === to
        ) {
          return json({
            error:
              "Echanj pa valab"
          }, 400);
        }

        const rr =
          await getRates();

        if (
          !rr[from] ||
          !rr[to]
        ) {
          return json({
            error:
              "Deviz pa disponib"
          }, 400);
        }

        const current =
          await balance(
            env,
            me.uid,
            from
          );

        if (current < amount) {
          return json({
            error:
              "Solde insuffisant"
          }, 400);
        }

        const received =
          (amount /
            Number(rr[from])) *
          Number(rr[to]);

        await env.DB.batch([
          env.DB.prepare(`
            UPDATE wallets
            SET balance=balance-?
            WHERE uid=?
              AND currency=?
          `).bind(
            amount,
            me.uid,
            from
          ),

          env.DB.prepare(`
            INSERT INTO wallets(
              uid,
              currency,
              balance
            )
            VALUES(
              ?,?,?
            )
            ON CONFLICT(
              uid,
              currency
            )
            DO UPDATE SET
              balance=
                balance+?
          `).bind(
            me.uid,
            to,
            received,
            received
          ),

          env.DB.prepare(`
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
          `).bind(
            me.uid,
            amount,
            from,
            `${from}->${to}`
          )
        ]);

        return json({
          ok: true,
          amount,
          from,
          received,
          to
        });
      }

      // =====================================================
      // BET HISTORY
      // =====================================================

      if (p === "/api/bets") {
        const q = await env.DB.prepare(`
          SELECT *
          FROM bets
          WHERE uid=?
          ORDER BY id DESC
          LIMIT 100
        `).bind(me.uid).all();

        return json({
          items: q.results
        });
      }

      // =====================================================
      // PLACE BET
      // =====================================================

      if (
        p === "/api/bet" &&
        req.method === "POST"
      ) {
        return placeBet(
          req,
          env,
          me
        );
      }

      // =====================================================
      // AGENT REQUEST
      // =====================================================

      if (
        p === "/api/agent/apply" &&
        req.method === "POST"
      ) {
        const x = await req.json();

        if (
          !x.name ||
          !x.phone ||
          !x.city ||
          !x.address ||
          !x.cin
        ) {
          return json({
            error:
              "Ranpli tout enfòmasyon ajan yo."
          }, 400);
        }

        await env.DB.prepare(`
          INSERT INTO agents(
            uid,
            name,
            phone,
            city,
            address,
            cin,
            status
          )
          VALUES(
            ?,?,?,?,?,?,
            'pending'
          )
          ON CONFLICT(uid)
          DO UPDATE SET
            name=excluded.name,
            phone=excluded.phone,
            city=excluded.city,
            address=excluded.address,
            cin=excluded.cin,
            status='pending'
        `).bind(
          me.uid,
          String(x.name).trim(),
          String(x.phone).trim(),
          String(x.city).trim(),
          String(x.address).trim(),
          String(x.cin).trim()
        ).run();

        return json({
          ok: true,
          status: "pending"
        });
      }

      if (
        p === "/api/agent/status"
      ) {
        const a =
          await env.DB.prepare(`
            SELECT
              uid,
              name,
              phone,
              city,
              address,
              status,
              code
            FROM agents
            WHERE uid=?
          `).bind(
            me.uid
          ).first();

        return json({
          request: a || null
        });
      }

      // =====================================================
      // LINK PLAYER TO AGENT
      // =====================================================

      if (
        p === "/api/agent/link" &&
        req.method === "POST"
      ) {
        const x = await req.json();

        const code =
          String(
            x.code || ""
          )
            .trim()
            .toUpperCase();

        const agent =
          await env.DB.prepare(`
            SELECT
              uid,
              code
            FROM agents
            WHERE code=?
              AND status='approved'
          `).bind(
            code
          ).first();

        if (!agent) {
          return json({
            error:
              "Kòd ajan pa valab."
          }, 404);
        }

        if (
          agent.uid === me.uid
        ) {
          return json({
            error:
              "Yon ajan pa ka lye kont li ak tèt li."
          }, 400);
        }

        await env.DB.prepare(`
          UPDATE users
          SET linked_agent=?
          WHERE uid=?
        `).bind(
          code,
          me.uid
        ).run();

        return json({
          ok: true,
          linkedAgent: code
        });
      }

      // =====================================================
      // AGENT DASHBOARD
      // =====================================================

      if (
        p ===
        "/api/agent/dashboard"
      ) {
        const a =
          await env.DB.prepare(`
            SELECT *
            FROM agents
            WHERE uid=?
              AND status='approved'
          `).bind(
            me.uid
          ).first();

        if (!a) {
          return json({
            error:
              "Kont ajan pa apwouve."
          }, 403);
        }

        const players =
          await env.DB.prepare(`
            SELECT
              uid,
              email
            FROM users
            WHERE linked_agent=?
            ORDER BY email
          `).bind(
            a.code
          ).all();

        const commission =
          await env.DB.prepare(`
            SELECT
              currency,
              COALESCE(
                SUM(agent_share),
                0
              ) total
            FROM ledger
            WHERE agent=?
            GROUP BY currency
          `).bind(
            a.code
          ).all();

        const bets =
          await env.DB.prepare(`
            SELECT
              currency,
              COUNT(*) tickets,
              COALESCE(
                SUM(stake),
                0
              ) stakes
            FROM bets
            WHERE agent=?
            GROUP BY currency
          `).bind(
            a.code
          ).all();

        return json({
          code: a.code,
          status: a.status,
          players:
            players.results,
          commission:
            commission.results,
          activity:
            bets.results
        });
      }

      // =====================================================
      // MONCASH DEPOSIT
      // =====================================================

      if (
        p ===
          "/api/deposit/moncash" &&
        req.method === "POST"
      ) {
        const x = await req.json();

        const amount =
          Number(x.amount);

        if (!(amount > 0)) {
          return json({
            error:
              "Montant invalide"
          }, 400);
        }

        const orderId =
          "MPD-" +
          Date.now() +
          "-" +
          crypto.randomUUID()
            .slice(0, 8);

        await env.DB.prepare(`
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
            'deposit',
            ?,
            'HTG',
            'pending',
            ?
          )
        `).bind(
          me.uid,
          amount,
          orderId
        ).run();

        const token =
          await moncashToken(env);

        const api =
          moncashBase(env);

        const r = await fetch(
          `${api}/v1/CreatePayment`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                amount,
                orderId
              })
          }
        );

        const data =
          await r.json();

        if (
          !r.ok ||
          !data.payment_token
            ?.token
        ) {
          return json({
            error:
              "MonCash pa aksepte peman an.",
            details: data
          }, 502);
        }

        const gateway =
          env.MONCASH_MODE ===
          "live"
            ? "https://moncashbutton.digicelgroup.com/Moncash-middleware"
            : "https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware";

        return json({
          ok: true,
          orderId,
          redirect:
            `${gateway}/Payment/Redirect?token=` +
            encodeURIComponent(
              data.payment_token.token
            )
        });
      }

      // =====================================================
      // MONCASH WITHDRAW
      // =====================================================

      if (
        p ===
          "/api/withdraw/moncash" &&
        req.method === "POST"
      ) {
        const x = await req.json();

        const amount =
          Number(x.amount);

        const phone =
          String(
            x.phone || ""
          ).trim();

        if (
          !(amount > 0) ||
          !phone
        ) {
          return json({
            error:
              "Montant oswa nimewo MonCash invalide."
          }, 400);
        }

        const current =
          await balance(
            env,
            me.uid,
            "HTG"
          );

        if (
          current < amount
        ) {
          return json({
            error:
              "Solde insuffisant"
          }, 400);
        }

        const ref =
          "MPW-" +
          Date.now() +
          "-" +
          crypto.randomUUID()
            .slice(0, 8);

        await env.DB.batch([
          env.DB.prepare(`
            UPDATE wallets
            SET balance=balance-?
            WHERE uid=?
              AND currency='HTG'
          `).bind(
            amount,
            me.uid
          ),

          env.DB.prepare(`
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
              'withdraw',
              ?,
              'HTG',
              'processing',
              ?
            )
          `).bind(
            me.uid,
            amount,
            ref
          )
        ]);

        try {
          const token =
            await moncashToken(env);

          const api =
            moncashBase(env);

          const rr =
            await fetch(
              `${api}/v1/Transfert`,
              {
                method: "POST",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json"
                },
                body:
                  JSON.stringify({
                    amount,
                    receiver:
                      phone,
                    desc:
                      "MystroParyaj withdrawal",
                    reference:
                      ref
                  })
              }
            );

          const data =
            await rr.json();

          if (!rr.ok) {
            throw new Error(
              data.message ||
              "MonCash withdrawal failed"
            );
          }

          await env.DB.prepare(`
            UPDATE tx
            SET status='paid'
            WHERE reference=?
          `).bind(
            ref
          ).run();

          return json({
            ok: true,
            reference: ref,
            status: "paid",
            moncash: data
          });

        } catch (e) {

          await env.DB.batch([
            env.DB.prepare(`
              INSERT INTO wallets(
                uid,
                currency,
                balance
              )
              VALUES(
                ?,
                'HTG',
                ?
              )
              ON CONFLICT(
                uid,
                currency
              )
              DO UPDATE SET
                balance=
                  balance+?
            `).bind(
              me.uid,
              amount,
              amount
            ),

            env.DB.prepare(`
              UPDATE tx
              SET status='failed'
              WHERE reference=?
            `).bind(
              ref
            )
          ]);

          return json({
            error:
              "Retrè MonCash echwe. Lajan an retounen nan bous la.",
            details:
              e.message
          }, 502);
        }
      }

      // =====================================================
      // NATCASH
      // =====================================================

      if (
        p ===
          "/api/deposit/natcash" ||
        p ===
          "/api/withdraw/natcash"
      ) {
        return json({
          ok: false,
          provider:
            "NatCash",
          status:
            "not_configured",
          message:
            "API marchand NatCash ofisyèl la poko konekte."
        }, 501);
      }

      // =====================================================
      // ADMIN GUARD
      // =====================================================

      if (
        p.startsWith(
          "/api/admin/"
        ) &&
        !isAdmin
      ) {
        return json({
          error:
            "Accès admin refusé"
        }, 403);
      }

      // =====================================================
      // ADMIN STATS
      // =====================================================

      if (
        p ===
        "/api/admin/stats"
      ) {
        return adminStats(
          env
        );
      }

      // =====================================================
      // ADMIN PLAYERS
      // =====================================================

      if (
        p ===
        "/api/admin/players"
      ) {
        const q =
          await env.DB.prepare(`
            SELECT
              uid,
              email,
              role,
              linked_agent
            FROM users
            ORDER BY email
            LIMIT 500
          `).all();

        return json({
          items:
            q.results
        });
      }

      // =====================================================
      // ADMIN AGENTS
      // =====================================================

      if (
        p ===
        "/api/admin/agents"
      ) {
        const q =
          await env.DB.prepare(`
            SELECT
              uid,
              name,
              phone,
              city,
              address,
              status,
              code
            FROM agents
            ORDER BY
              status,
              name
          `).all();

        return json({
          items:
            q.results
        });
      }

      // =====================================================
      // ADMIN APPROVE / REJECT AGENT
      // =====================================================

      if (
        p ===
          "/api/admin/agent-review" &&
        req.method === "POST"
      ) {
        const x =
          await req.json();

        if (
          ![
            "approved",
            "rejected"
          ].includes(
            x.status
          )
        ) {
          return json({
            error:
              "Estati pa valab."
          }, 400);
        }

        const agent =
          await env.DB.prepare(`
            SELECT *
            FROM agents
            WHERE uid=?
          `).bind(
            x.uid
          ).first();

        if (!agent) {
          return json({
            error:
              "Demann ajan pa jwenn."
          }, 404);
        }

        const code =
          x.status ===
          "approved"
            ? (
                agent.code ||
                "MP-" +
                crypto
                  .randomUUID()
                  .slice(0, 6)
                  .toUpperCase()
              )
            : null;

        await env.DB.batch([
          env.DB.prepare(`
            UPDATE agents
            SET
              status=?,
              code=
                COALESCE(
                  ?,
                  code
                )
            WHERE uid=?
          `).bind(
            x.status,
            code,
            x.uid
          ),

          env.DB.prepare(`
            UPDATE users
            SET
              role=?,
              agent_code=
                COALESCE(
                  ?,
                  agent_code
                )
            WHERE uid=?
          `).bind(
            x.status ===
            "approved"
              ? "agent"
              : "player",
            code,
            x.uid
          )
        ]);

        return json({
          ok: true,
          status:
            x.status,
          code
        });
      }

      // =====================================================
      // ADMIN CREATE EVENT
      // =====================================================

      if (
        p ===
          "/api/admin/event" &&
        req.method === "POST"
      ) {
        const x =
          await req.json();

        if (
          !x.sport ||
          !x.home ||
          !x.away ||
          !x.start ||
          !x.markets
        ) {
          return json({
            error:
              "Enfòmasyon evènman an pa konplè."
          }, 400);
        }

        const r =
          await env.DB.prepare(`
            INSERT INTO events(
              sport,
              league,
              home,
              away,
              start,
              markets,
              status
            )
            VALUES(
              ?,?,?,?,?,?,
              'open'
            )
          `).bind(
            x.sport,
            x.league || "",
            x.home,
            x.away,
            x.start,
            JSON.stringify(
              x.markets
            )
          ).run();

        return json({
          ok: true,
          id:
            r.meta.last_row_id
        });
      }

      // =====================================================
      // ADMIN SETTLEMENT
      // =====================================================

      if (
        p ===
          "/api/admin/settle" &&
        req.method === "POST"
      ) {
        return settleEvent(
          req,
          env
        );
      }

      // =====================================================
      // PLATFORM WALLET
      // =====================================================

      if (
        p ===
        "/api/admin/platform-wallet"
      ) {
        const q =
          await env.DB.prepare(`
            SELECT
              currency,
              realized_profit,
              withdrawn,
              realized_profit -
                withdrawn
                AS available
            FROM platform_wallet
            ORDER BY currency
          `).all();

        return json({
          balances:
            q.results
        });
      }

      // =====================================================
      // PLATFORM PROFIT WITHDRAW
      // =====================================================

      if (
        p ===
          "/api/admin/platform-withdraw" &&
        req.method === "POST"
      ) {
        const x =
          await req.json();

        const amount =
          Number(x.amount);

        const currency =
          cleanCurrency(
            x.currency ||
            "HTG"
          );

        if (!(amount > 0)) {
          return json({
            error:
              "Montant invalide."
          }, 400);
        }

        const platform =
          await env.DB.prepare(`
            SELECT
              realized_profit,
              withdrawn
            FROM platform_wallet
            WHERE currency=?
          `).bind(
            currency
          ).first();

        const available =
          Number(
            platform
              ?.realized_profit ||
            0
          ) -
          Number(
            platform
              ?.withdrawn ||
            0
          );

        if (
          available < amount
        ) {
          return json({
            error:
              "Pwofi MystroParyaj disponib la pa sifi."
          }, 400);
        }

        if (
          currency !== "HTG" ||
          x.method !==
            "moncash"
        ) {
          return json({
            error:
              "Pou kounye a retrè pwofi otomatik sèlman konekte ak MonCash HTG."
          }, 400);
        }

        const phone =
          String(
            x.phone || ""
          ).trim();

        if (!phone) {
          return json({
            error:
              "Nimewo MonCash obligatwa."
          }, 400);
        }

        const ref =
          "MPP-" +
          Date.now() +
          "-" +
          crypto.randomUUID()
            .slice(0, 8);

        const w =
          await env.DB.prepare(`
            INSERT INTO
              platform_withdrawals(
                amount,
                currency,
                method,
                status
              )
            VALUES(
              ?,
              ?,
              'moncash',
              'processing'
            )
          `).bind(
            amount,
            currency
          ).run();

        const withdrawalId =
          w.meta.last_row_id;

        try {
          const token =
            await moncashToken(env);

          const r =
            await fetch(
              `${moncashBase(env)}/v1/Transfert`,
              {
                method:
                  "POST",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json"
                },
                body:
                  JSON.stringify({
                    amount,
                    receiver:
                      phone,
                    desc:
                      "MystroParyaj platform profit",
                    reference:
                      ref
                  })
              }
            );

          const data =
            await r.json();

          if (!r.ok) {
            throw new Error(
              data.message ||
              "MonCash error"
            );
          }

          await env.DB.batch([
            env.DB.prepare(`
              INSERT INTO
                platform_wallet(
                  currency,
                  realized_profit,
                  withdrawn
                )
              VALUES(
                ?,
                0,
                ?
              )
              ON CONFLICT(
                currency
              )
              DO UPDATE SET
                withdrawn=
                  withdrawn+?
            `).bind(
              currency,
              amount,
              amount
            ),

            env.DB.prepare(`
              UPDATE
                platform_withdrawals
              SET status='paid'
              WHERE id=?
            `).bind(
              withdrawalId
            )
          ]);

          return json({
            ok: true,
            amount,
            currency,
            reference:
              ref
          });

        } catch (e) {
          await env.DB.prepare(`
            UPDATE
              platform_withdrawals
            SET status='failed'
            WHERE id=?
          `).bind(
            withdrawalId
          ).run();

          return json({
            error:
              "Retrè pwofi echwe.",
            details:
              e.message
          }, 502);
        }
      }

      return json({
        error:
          "Route introuvable"
      }, 404);

    } catch (e) {
      return json({
        error:
          e?.message ||
          "Erreur serveur"
      }, 500);
    }
  }
};

// =====================================================
// PLACE BET
// =====================================================

async function placeBet(
  req,
  env,
  me
) {
  const x =
    await req.json();

  const stake =
    Number(x.stake);

  const currency =
    cleanCurrency(
      x.currency ||
      "HTG"
    );

  if (
    !(stake > 0) ||
    !currency ||
    !x.eventId ||
    !x.market
  ) {
    return json({
      error:
        "Tikè invalide."
    }, 400);
  }

  const event =
    await env.DB.prepare(`
      SELECT *
      FROM events
      WHERE id=?
        AND status='open'
    `).bind(
      x.eventId
    ).first();

  if (!event) {
    return json({
      error:
        "Evènman fèmen."
    }, 400);
  }

  if (
    event.start &&
    new Date(
      event.start
    ).getTime() <=
      Date.now()
  ) {
    return json({
      error:
        "Evènman sa a deja kòmanse."
    }, 400);
  }

  const markets =
    JSON.parse(
      event.markets ||
      "{}"
    );

  const odds =
    Number(
      markets[
        x.market
      ]
    );

  if (!(odds > 0)) {
    return json({
      error:
        "Kòt pa valab."
    }, 400);
  }

  const current =
    await balance(
      env,
      me.uid,
      currency
    );

  if (
    current < stake
  ) {
    return json({
      error:
        "Solde insuffisant."
    }, 400);
  }

  const profile =
    await env.DB.prepare(`
      SELECT
        linked_agent
      FROM users
      WHERE uid=?
    `).bind(
      me.uid
    ).first();

  const agent =
    profile
      ?.linked_agent ||
    null;

  // INTERNAL RULES:
  // direct player:
  // 60% winners / 40% platform
  //
  // linked player:
  // 60% winners
  // 10% agent
  // 30% platform

  const reserve =
    round2(
      stake * 0.60
    );

  const agentShare =
    agent
      ? round2(
          stake * 0.10
        )
      : 0;

  const platformShare =
    agent
      ? round2(
          stake * 0.30
        )
      : round2(
          stake * 0.40
        );

  const payout =
    round2(
      stake * odds
    );

  const bet =
    await env.DB.prepare(`
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
    `).bind(
      me.uid,
      x.eventId,
      x.market,
      stake,
      currency,
      odds,
      payout,
      agent
    ).run();

  await env.DB.batch([
    env.DB.prepare(`
      UPDATE wallets
      SET balance=
        balance-?
      WHERE uid=?
        AND currency=?
    `).bind(
      stake,
      me.uid,
      currency
    ),

    env.DB.prepare(`
      INSERT INTO ledger(
        bet_id,
        reserve,
        agent_share,
        platform_share,
        currency,
        agent
      )
      VALUES(
        ?,?,?,?,?,?
      )
    `).bind(
      bet.meta
        .last_row_id,
      reserve,
      agentShare,
      platformShare,
      currency,
      agent
    ),

    env.DB.prepare(`
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
        'bet',
        ?,
        ?,
        'paid',
        ?
      )
    `).bind(
      me.uid,
      stake,
      currency,
      String(
        bet.meta
          .last_row_id
      )
    )
  ]);

  return json({
    ok: true,
    betId:
      bet.meta
        .last_row_id,
    totalOdds:
      odds,
    potentialReturn:
      payout
  });
}

// =====================================================
// SETTLE EVENT
// =====================================================

async function settleEvent(
  req,
  env
) {
  const x =
    await req.json();

  const eventId =
    Number(
      x.eventId
    );

  const winner =
    String(
      x.winner || ""
    ).trim();

  if (
    !eventId ||
    !winner
  ) {
    return json({
      error:
        "Rezilta pa valab."
    }, 400);
  }

  const event =
    await env.DB.prepare(`
      SELECT *
      FROM events
      WHERE id=?
    `).bind(
      eventId
    ).first();

  if (!event) {
    return json({
      error:
        "Evènman pa jwenn."
    }, 404);
  }

  await env.DB.prepare(`
    UPDATE events
    SET
      status='settled',
      winner=?
    WHERE id=?
  `).bind(
    winner,
    eventId
  ).run();

  const q =
    await env.DB.prepare(`
      SELECT *
      FROM bets
      WHERE event_id=?
        AND status='open'
    `).bind(
      eventId
    ).all();

  let won = 0;
  let lost = 0;

  for (
    const b of q.results
  ) {
    const ledger =
      await env.DB.prepare(`
        SELECT *
        FROM ledger
        WHERE bet_id=?
      `).bind(
        b.id
      ).first();

    if (
      b.market !==
      winner
    ) {
      await env.DB.prepare(`
        UPDATE bets
        SET status='lost'
        WHERE id=?
      `).bind(
        b.id
      ).run();

      await realizeShares(
        env,
        b,
        ledger
      );

      lost++;
      continue;
    }

    const duplicate =
      await env.DB.prepare(`
        SELECT id
        FROM tx
        WHERE
          type='win'
          AND reference=?
      `).bind(
        String(
          b.id
        )
      ).first();

    if (duplicate) {
      continue;
    }

    await env.DB.batch([
      env.DB.prepare(`
        UPDATE bets
        SET status='won'
        WHERE id=?
      `).bind(
        b.id
      ),

      env.DB.prepare(`
        INSERT INTO wallets(
          uid,
          currency,
          balance
        )
        VALUES(
          ?,?,?
        )
        ON CONFLICT(
          uid,
          currency
        )
        DO UPDATE SET
          balance=
            balance+?
      `).bind(
        b.uid,
        b.currency,
        b.payout,
        b.payout
      ),

      env.DB.prepare(`
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
          'win',
          ?,
          ?,
          'paid',
          ?
        )
      `).bind(
        b.uid,
        b.payout,
        b.currency,
        String(
          b.id
        )
      )
    ]);

    await realizeShares(
      env,
      b,
      ledger
    );

    won++;
  }

  return json({
    ok: true,
    eventId,
    winner,
    won,
    lost
  });
}

// =====================================================
// REALIZE AGENT + PLATFORM SHARES
// =====================================================

async function realizeShares(
  env,
  bet,
  ledger
) {
  if (!ledger) {
    return;
  }

  const reference =
    `share-${bet.id}`;

  const already =
    await env.DB.prepare(`
      SELECT id
      FROM tx
      WHERE
        type='shares_realized'
        AND reference=?
    `).bind(
      reference
    ).first();

  if (already) {
    return;
  }

  const jobs = [];

  jobs.push(
    env.DB.prepare(`
      INSERT INTO platform_wallet(
        currency,
        realized_profit,
        withdrawn
      )
      VALUES(
        ?,?,0
      )
      ON CONFLICT(
        currency
      )
      DO UPDATE SET
        realized_profit=
          realized_profit+?
    `).bind(
      bet.currency,
      Number(
        ledger
          .platform_share ||
        0
      ),
      Number(
        ledger
          .platform_share ||
        0
      )
    )
  );

  if (
    ledger.agent &&
    Number(
      ledger.agent_share ||
      0
    ) > 0
  ) {
    const agent =
      await env.DB.prepare(`
        SELECT uid
        FROM agents
        WHERE code=?
          AND status='approved'
      `).bind(
        ledger.agent
      ).first();

    if (agent?.uid) {
      jobs.push(
        env.DB.prepare(`
          INSERT INTO wallets(
            uid,
            currency,
            balance
          )
          VALUES(
            ?,?,?
          )
          ON CONFLICT(
            uid,
            currency
          )
          DO UPDATE SET
            balance=
              balance+?
        `).bind(
          agent.uid,
          bet.currency,
          Number(
            ledger.agent_share
          ),
          Number(
            ledger.agent_share
          )
        )
      );

      jobs.push(
        env.DB.prepare(`
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
            'agent_commission',
            ?,
            ?,
            'paid',
            ?
          )
        `).bind(
          agent.uid,
          Number(
            ledger.agent_share
          ),
          bet.currency,
          String(
            bet.id
          )
        )
      );
    }
  }

  jobs.push(
    env.DB.prepare(`
      INSERT INTO tx(
        uid,
        type,
        amount,
        currency,
        status,
        reference
      )
      VALUES(
        'platform',
        'shares_realized',
        ?,
        ?,
        'paid',
        ?
      )
    `).bind(
      Number(
        ledger
          .platform_share ||
        0
      ),
      bet.currency,
      reference
    )
  );

  await env.DB.batch(
    jobs
  );
}

// =====================================================
// ADMIN STATS
// =====================================================

async function adminStats(
  env
) {
  const players =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM users
        WHERE role='player'
      `
    );

  const agents =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM agents
        WHERE status='approved'
      `
    );

  const pendingAgents =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM agents
        WHERE status='pending'
      `
    );

  const totalBets =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM bets
      `
    );

  const openBets =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM bets
        WHERE status='open'
      `
    );

  const wonBets =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM bets
        WHERE status='won'
      `
    );

  const lostBets =
    await scalar(
      env,
      `
        SELECT COUNT(*) n
        FROM bets
        WHERE status='lost'
      `
    );

  const stakes =
    await env.DB.prepare(`
      SELECT
        currency,
        COALESCE(
          SUM(stake),
          0
        ) total
      FROM bets
      GROUP BY currency
    `).all();

  const wins =
    await env.DB.prepare(`
      SELECT
        currency,
        COALESCE(
          SUM(amount),
          0
        ) total
      FROM tx
      WHERE
        type='win'
        AND status='paid'
      GROUP BY currency
    `).all();

  const commissions =
    await env.DB.prepare(`
      SELECT
        currency,
        COALESCE(
          SUM(amount),
          0
        ) total
      FROM tx
      WHERE
        type='agent_commission'
        AND status='paid'
      GROUP BY currency
    `).all();

  const platform =
    await env.DB.prepare(`
      SELECT
        currency,
        realized_profit,
        withdrawn,
        realized_profit -
          withdrawn
          AS available
      FROM platform_wallet
    `).all();

  return json({
    players,
    agents,
    pendingAgents,
    bets: {
      total:
        totalBets,
      open:
        openBets,
      won:
        wonBets,
      lost:
        lostBets
    },
    stakes:
      stakes.results,
    winnersPaid:
      wins.results,
    agentCommissions:
      commissions.results,
    platform:
      platform.results
  });
}

// =====================================================
// MONCASH RETURN
// =====================================================

async function moncashReturn(
  req,
  env
) {
  const u =
    new URL(
      req.url
    );

  const transactionId =
    u.searchParams.get(
      "transactionId"
    );

  if (!transactionId) {
    return redirectApp(
      "payment=failed"
    );
  }

  try {
    const token =
      await moncashToken(
        env
      );

    const r =
      await fetch(
        `${moncashBase(env)}/v1/RetrieveTransactionPayment`,
        {
          method:
            "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              transactionId
            })
        }
      );

    const data =
      await r.json();

    const payment =
      data.payment ||
      data.transaction ||
      data;

    const orderId =
      payment.reference ||
      payment.orderId;

    if (!orderId) {
      return redirectApp(
        "payment=failed"
      );
    }

    const tx =
      await env.DB.prepare(`
        SELECT *
        FROM tx
        WHERE
          type='deposit'
          AND reference=?
      `).bind(
        orderId
      ).first();

    if (!tx) {
      return redirectApp(
        "payment=unknown"
      );
    }

    if (
      tx.status ===
      "paid"
    ) {
      return redirectApp(
        "payment=success"
      );
    }

    const paidAmount =
      Number(
        payment.cost ||
        payment.amount ||
        tx.amount
      );

    if (
      Math.abs(
        paidAmount -
        Number(
          tx.amount
        )
      ) > 0.01
    ) {
      return redirectApp(
        "payment=amount_error"
      );
    }

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO wallets(
          uid,
          currency,
          balance
        )
        VALUES(
          ?,
          'HTG',
          ?
        )
        ON CONFLICT(
          uid,
          currency
        )
        DO UPDATE SET
          balance=
            balance+?
      `).bind(
        tx.uid,
        Number(
          tx.amount
        ),
        Number(
          tx.amount
        )
      ),

      env.DB.prepare(`
        UPDATE tx
        SET status='paid'
        WHERE id=?
      `).bind(
        tx.id
      )
    ]);

    return redirectApp(
      "payment=success"
    );

  } catch (e) {
    return redirectApp(
      "payment=failed"
    );
  }
}

// =====================================================
// FIREBASE USER
// =====================================================

async function firebaseUser(
  req,
  env
) {
  const token =
    (
      req.headers.get(
        "Authorization"
      ) ||
      ""
    )
      .replace(
        "Bearer ",
        ""
      )
      .trim();

  if (!token) {
    return null;
  }

  const key =
    env.FIREBASE_WEB_API_KEY ||
    "AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA";

  const r =
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify({
            idToken:
              token
          })
      }
    );

  if (!r.ok) {
    return null;
  }

  const d =
    await r.json();

  const u =
    d.users?.[0];

  if (!u) {
    return null;
  }

  return {
    uid:
      u.localId,
    email:
      u.email ||
      ""
  };
}

// =====================================================
// MONCASH HELPERS
// =====================================================

function moncashBase(
  env
) {
  return (
    env.MONCASH_MODE ===
    "live"
  )
    ? "https://moncashbutton.digicelgroup.com/Api"
    : "https://sandbox.moncashbutton.digicelgroup.com/Api";
}

async function moncashToken(
  env
) {
  if (
    !env.MONCASH_CLIENT_ID ||
    !env.MONCASH_CLIENT_SECRET
  ) {
    throw new Error(
      "MonCash credentials missing"
    );
  }

  const raw =
    `${env.MONCASH_CLIENT_ID}:${env.MONCASH_CLIENT_SECRET}`;

  const encoded =
    btoa(raw);

  const r =
    await fetch(
      `${moncashBase(env)}/oauth/token`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Basic ${encoded}`,
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body:
          "scope=read,write&grant_type=client_credentials"
      }
    );

  const d =
    await r.json();

  if (
    !r.ok ||
    !d.access_token
  ) {
    throw new Error(
      d.error_description ||
      "MonCash authentication failed"
    );
  }

  return d.access_token;
}

// =====================================================
// RATES
// =====================================================

async function rates() {
  try {
    const r =
      await getRates();

    return json({
      ok: true,
      base: "USD",
      rates: r
    });

  } catch (e) {
    return json({
      error:
        "To echanj yo pa disponib kounye a."
    }, 502);
  }
}

async function getRates() {
  const r =
    await fetch(
      "https://open.er-api.com/v6/latest/USD"
    );

  if (!r.ok) {
    throw new Error(
      "Rates service unavailable"
    );
  }

  const d =
    await r.json();

  return d.rates || {};
}

// =====================================================
// USERS + WALLET
// =====================================================

async function ensureUser(
  env,
  me
) {
  const role =
    me.uid ===
    env.ADMIN_UID
      ? "admin"
      : "player";

  await env.DB.prepare(`
    INSERT INTO users(
      uid,
      email,
      role
    )
    VALUES(
      ?,?,?
    )
    ON CONFLICT(uid)
    DO UPDATE SET
      email=
        excluded.email,
      role=
        CASE
          WHEN users.uid=?
          THEN 'admin'
          ELSE users.role
        END
  `).bind(
    me.uid,
    me.email || "",
    role,
    env.ADMIN_UID || ""
  ).run();
}

async function userWallet(
  env,
  uid
) {
  const q =
    await env.DB.prepare(`
      SELECT
        currency,
        balance
      FROM wallets
      WHERE uid=?
    `).bind(
      uid
    ).all();

  const balances = {
    HTG: 0,
    USD: 0,
    EUR: 0,
    CAD: 0,
    DOP: 0
  };

  q.results.forEach(
    x => {
      balances[
        x.currency
      ] =
        Number(
          x.balance ||
          0
        );
    }
  );

  return json({
    balances
  });
}

async function balance(
  env,
  uid,
  currency
) {
  const x =
    await env.DB.prepare(`
      SELECT balance
      FROM wallets
      WHERE uid=?
        AND currency=?
    `).bind(
      uid,
      currency
    ).first();

  return Number(
    x?.balance ||
    0
  );
}

async function scalar(
  env,
  sql
) {
  const x =
    await env.DB.prepare(
      sql
    ).first();

  return Number(
    x?.n ||
    0
  );
}

// =====================================================
// DB SETUP
// =====================================================

async function setup(
  db
) {
  await db.batch([
    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS users(
        uid TEXT
          PRIMARY KEY,
        email TEXT,
        role TEXT
          DEFAULT 'player',
        agent_code TEXT,
        linked_agent TEXT
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS wallets(
        uid TEXT,
        currency TEXT,
        balance REAL
          DEFAULT 0,
        PRIMARY KEY(
          uid,
          currency
        )
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS events(
        id INTEGER
          PRIMARY KEY
          AUTOINCREMENT,
        sport TEXT,
        league TEXT,
        home TEXT,
        away TEXT,
        start TEXT,
        markets TEXT,
        status TEXT
          DEFAULT 'open',
        winner TEXT
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS bets(
        id INTEGER
          PRIMARY KEY
          AUTOINCREMENT,
        uid TEXT,
        event_id INTEGER,
        market TEXT,
        stake REAL,
        currency TEXT,
        odds REAL,
        payout REAL,
        agent TEXT,
        status TEXT
          DEFAULT 'open'
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS ledger(
        id INTEGER
          PRIMARY KEY
          AUTOINCREMENT,
        bet_id INTEGER,
        reserve REAL,
        agent_share REAL,
        platform_share REAL,
        currency TEXT,
        agent TEXT
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS tx(
        id INTEGER
          PRIMARY KEY
          AUTOINCREMENT,
        uid TEXT,
        type TEXT,
        amount REAL,
        currency TEXT,
        status TEXT,
        reference TEXT,
        created_at TEXT
          DEFAULT
          CURRENT_TIMESTAMP
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS agents(
        uid TEXT
          PRIMARY KEY,
        name TEXT,
        phone TEXT,
        city TEXT,
        address TEXT,
        cin TEXT,
        status TEXT
          DEFAULT 'pending',
        code TEXT
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS platform_wallet(
        currency TEXT
          PRIMARY KEY,
        realized_profit REAL
          DEFAULT 0,
        withdrawn REAL
          DEFAULT 0
      )
    `),

    db.prepare(`
      CREATE TABLE
      IF NOT EXISTS
      platform_withdrawals(
        id INTEGER
          PRIMARY KEY
          AUTOINCREMENT,
        amount REAL,
        currency TEXT,
        method TEXT,
        status TEXT
          DEFAULT 'pending',
        created_at TEXT
          DEFAULT
          CURRENT_TIMESTAMP
      )
    `)
  ]);
}

// =====================================================
// HELPERS
// =====================================================

function eventOut(e) {
  return {
    id: e.id,
    sport: e.sport,
    league: e.league,
    home: e.home,
    away: e.away,
    start: e.start,
    markets:
      JSON.parse(
        e.markets ||
        "{}"
      ),
    status: e.status
  };
}

function cleanCurrency(
  c
) {
  const v =
    String(
      c || ""
    ).toUpperCase();

  return [
    "HTG",
    "USD",
    "EUR",
    "CAD",
    "DOP"
  ].includes(v)
    ? v
    : null;
}

function round2(
  n
) {
  return (
    Math.round(
      Number(n) *
      100
    ) /
    100
  );
}

function mask(
  v
) {
  if (!v) {
    return "";
  }

  const s =
    String(v);

  if (
    s.length <= 4
  ) {
    return "****";
  }

  return (
    "*".repeat(
      Math.max(
        4,
        s.length - 4
      )
    ) +
    s.slice(-4)
  );
}

function redirectApp(
  q
) {
  return Response.redirect(
    `https://castorlucjulesmichel.github.io/MystroParyaj/?${q}`,
    302
  );
}

function json(
  data,
  status = 200
) {
  return cors(
    data,
    status
  );
}

function cors(
  data,
  status = 200
) {
  return new Response(
    status === 204
      ? null
      : JSON.stringify(
          data
        ),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
        "Access-Control-Allow-Origin":
          ORIGIN,
        "Access-Control-Allow-Headers":
          "Authorization,Content-Type",
        "Access-Control-Allow-Methods":
          "GET,POST,OPTIONS"
      }
    }
  );
    }

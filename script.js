const API =
  "https://mystroparyaj-api.castormystro.workers.dev";

const $ = (id) =>
  document.getElementById(id);

const st = {
  user: null,
  me: null,
  adm:
    sessionStorage.getItem(
      "mp_admin_session"
    ) || ""
};

function M(id, text, type = "") {
  const el = $(id);

  if (!el) return;

  el.textContent = text;
  el.className =
    "msg " + type;
}

async function A(
  path,
  options = {}
) {
  const headers = {
    "Content-Type":
      "application/json",
    ...(options.headers || {})
  };

  if (st.user) {
    const token =
      await st.user.getIdToken();

    headers.Authorization =
      "Bearer " + token;
  }

  if (
    st.adm &&
    path.startsWith(
      "/api/admin/"
    )
  ) {
    headers[
      "X-Admin-Session"
    ] = st.adm;
  }

  const response =
    await fetch(
      API + path,
      {
        ...options,
        headers
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {}

  if (!response.ok) {
    const error =
      new Error(
        data.error ||
        "Erreur"
      );

    error.data = data;
    error.status =
      response.status;

    throw error;
  }

  return data;
}

function page(name) {
  document
    .querySelectorAll(
      "main section"
    )
    .forEach((section) =>
      section.classList.add(
        "hidden"
      )
    );

  const target =
    $("p-" + name);

  if (target) {
    target.classList.remove(
      "hidden"
    );
  }

  $("side")?.classList.add(
    "hidden"
  );

  if (name === "admin") {
    admin();
  }

  if (name === "wallet") {
    wallet();
  }

  if (name === "agent") {
    agentDashboard();
  }

  if (
    name === "sports" ||
    name === "home"
  ) {
    events();
  }
}

async function me() {
  st.me =
    await A("/api/me");

  $("adminNav")
    ?.classList.toggle(
      "hidden",
      st.me.role !== "admin"
    );

  if (
    st.me.role === "admin" &&
    !st.adm
  ) {
    cinPrompt();
  }
}

function cinPrompt() {
  const setup =
    st.me?.cinConfigured ===
    false;

  $("cinModal")
    .classList.remove(
      "hidden"
    );

  $("nameWrap")
    .classList.toggle(
      "hidden",
      !setup
    );

  $("cinTitle").textContent =
    setup
      ? "Konfigire CIN Admin"
      : "Konfime CIN Admin";

  $("cinText").textContent =
    setup
      ? "Premye fwa: antre non konplè ak CIN ou. CIN lan ap estoke kòm hash."
      : "Antre CIN ou pou konfime se ou menm.";
}

async function cin() {
  try {
    const setup =
      st.me.cinConfigured ===
      false;

    const body =
      setup
        ? {
            cin:
              $("cin").value,
            fullName:
              $("fullName")
                .value
          }
        : {
            cin:
              $("cin").value
          };

    const data =
      await A(
        setup
          ? "/api/admin/cin/setup"
          : "/api/admin/cin/verify",
        {
          method: "POST",
          body:
            JSON.stringify(
              body
            )
        }
      );

    st.adm =
      data.sessionToken;

    sessionStorage.setItem(
      "mp_admin_session",
      st.adm
    );

    st.me.cinConfigured =
      true;

    $("cinModal")
      .classList.add(
        "hidden"
      );

    admin();
  } catch (error) {
    M(
      "cinMsg",
      error.message,
      "error"
    );
  }
}

async function admin() {
  if (
    st.me?.role !== "admin"
  ) {
    return;
  }

  if (!st.adm) {
    return cinPrompt();
  }

  try {
    const data =
      await A(
        "/api/admin/stats"
      );

    await adminPayouts();

    $("stats").innerHTML =
      `
      <p>
        Itilizatè:
        ${data.players}
      </p>

      <p>
        Ajan:
        ${data.agents}
      </p>

      <p>
        Pari:
        ${data.totalBets}
      </p>

      <p>
        Pari ouvè:
        ${data.openBets}
      </p>

      <p>
        Tranzaksyon:
        ${data.transactions}
      </p>
      `;
  } catch (error) {
    if (
      error.data
        ?.cinRequired
    ) {
      st.adm = "";

      sessionStorage
        .removeItem(
          "mp_admin_session"
        );

      cinPrompt();
    } else {
      M(
        "adminMsg",
        error.message,
        "error"
      );
    }
  }
}

/* =========================
   ESPAS AJAN
========================= */

async function agentDashboard() {
  try {
    const players =
      await A(
        "/api/agent/players"
      );

    if (
      $("agentPlayers")
    ) {
      $("agentPlayers")
        .innerHTML =
        players.items.length
          ? players.items
              .map(
                (player) =>
                  `
                  <div>
                    <b>
                      ${
                        player.full_name ||
                        player.email ||
                        player.uid
                      }
                    </b>

                    <br>

                    <small>
                      ${
                        player.email ||
                        ""
                      }
                    </small>
                  </div>
                  `
              )
              .join("")
          : `
            <p>
              Pa gen jwè lye
              ak ajan sa a.
            </p>
            `;
    }

    if (
      $("agentPlayer")
    ) {
      $("agentPlayer")
        .innerHTML =
        players.items
          .map(
            (player) =>
              `
              <option
                value="${player.uid}"
              >
                ${
                  player.full_name ||
                  player.email ||
                  player.uid
                }
              </option>
              `
          )
          .join("");
    }

    const requests =
      await A(
        "/api/agent/payout-requests"
      );

    if (
      $("agentPayouts")
    ) {
      $("agentPayouts")
        .innerHTML =
        requests.items.length
          ? requests.items
              .map(
                (request) =>
                  `
                  <div>
                    Demann
                    #${request.id}

                    · Bet
                    #${request.bet_id}

                    · ${request.amount}
                    ${request.currency}

                    ·
                    <b>
                      ${request.status}
                    </b>
                  </div>
                  `
              )
              .join("")
          : `
            <p>
              Pa gen demann
              peman.
            </p>
            `;
    }
  } catch (error) {
    if (
      $("agentPlayers")
    ) {
      $("agentPlayers")
        .innerHTML =
        `
        <p>
          ${error.message}
        </p>
        `;
    }
  }
}

/* =========================
   AJAN FÈ FICH POU JWÈ
========================= */

async function agentBet() {
  try {
    const data =
      await A(
        "/api/agent/bet",
        {
          method: "POST",

          body:
            JSON.stringify({
              playerUid:
                $("agentPlayer")
                  .value,

              eventId:
                +$("agentEvent")
                  .value,

              market:
                $("agentMarket")
                  .value
                  .trim(),

              stake:
                +$("agentStake")
                  .value,

              currency:
                $("currency")
                  .value
            })
        }
      );

    M(
      "agentBetMsg",
      `Fich #${data.betId} kreye. Retou potansyèl: ${data.potentialReturn}`,
      "ok"
    );

    await agentDashboard();
  } catch (error) {
    M(
      "agentBetMsg",
      error.message,
      "error"
    );
  }
}

/* =========================
   AJAN MANDE PEMAN GAGNAN
========================= */

async function payoutRequest() {
  try {
    const data =
      await A(
        "/api/agent/payout-request",
        {
          method: "POST",

          body:
            JSON.stringify({
              betId:
                +$("payoutBetId")
                  .value
            })
        }
      );

    M(
      "payoutMsg",
      `Demann #${data.requestId} voye bay Admin.`,
      "ok"
    );

    await agentDashboard();
  } catch (error) {
    M(
      "payoutMsg",
      error.message,
      "error"
    );
  }
}

/* =========================
   ADMIN WÈ DEMANN PEMAN
========================= */

async function adminPayouts() {
  try {
    const data =
      await A(
        "/api/admin/payout-requests"
      );

    if (
      !$("adminPayouts")
    ) {
      return;
    }

    $("adminPayouts")
      .innerHTML =
      data.items.length
        ? data.items
            .map(
              (request) =>
                `
                <div
                  style="
                    padding:10px;
                    border-bottom:
                    1px solid #ddd;
                  "
                >

                  <b>
                    Demann
                    #${request.id}
                  </b>

                  · Bet
                  #${request.bet_id}

                  <br>

                  ${
                    request.full_name ||
                    request.email ||
                    request.player_uid
                  }

                  <br>

                  ${request.amount}
                  ${request.currency}

                  ·

                  <b>
                    ${request.status}
                  </b>

                  <br>

                  ${
                    request.status ===
                    "pending"
                      ? `
                        <button
                          onclick="
                            window.reviewPayout(
                              ${request.id},
                              'approved'
                            )
                          "
                        >
                          Apwouve
                        </button>

                        <button
                          onclick="
                            window.reviewPayout(
                              ${request.id},
                              'rejected'
                            )
                          "
                        >
                          Rejte
                        </button>
                        `
                      : ""
                  }

                  ${
                    request.status ===
                    "approved"
                      ? `
                        <button
                          onclick="
                            window.reviewPayout(
                              ${request.id},
                              'paid'
                            )
                          "
                        >
                          Make Peye
                        </button>
                        `
                      : ""
                  }

                </div>
                `
            )
            .join("")
        : `
          <p>
            Pa gen demann
            peman.
          </p>
          `;
  } catch (error) {
    if (
      $("adminPayouts")
    ) {
      $("adminPayouts")
        .textContent =
        error.message;
    }
  }
}

window.reviewPayout =
  async function (
    id,
    status
  ) {
    try {
      await A(
        "/api/admin/payout-review",
        {
          method: "POST",

          body:
            JSON.stringify({
              id,
              status
            })
        }
      );

      await adminPayouts();
    } catch (error) {
      M(
        "adminMsg",
        error.message,
        "error"
      );
    }
  };

/* =========================
   WALLET
========================= */

async function wallet() {
  try {
    const data =
      await A(
        "/api/wallet"
      );

    if ($("wallet")) {
      $("wallet")
        .textContent =
        JSON.stringify(
          data.balances,
          null,
          2
        );
    }
  } catch (error) {
    if ($("wallet")) {
      $("wallet")
        .textContent =
        error.message;
    }
  }
}

/* =========================
   EVENTS
========================= */

async function events() {
  try {
    const data =
      await A(
        "/api/events"
      );

    const html =
      data.items.length
        ? data.items
            .map(
              (event) =>
                `
                <article>

                  <b>
                    ${event.sport}
                  </b>

                  <div>
                    ${event.home}
                    vs
                    ${event.away}
                  </div>

                  <small>
                    ID
                    ${event.id}
                  </small>

                  <pre>
${JSON.stringify(
  event.markets
)}
                  </pre>

                </article>
                `
            )
            .join("")
        : `
          <p>
            Pa gen evènman
            ouvè.
          </p>
          `;

    if ($("events")) {
      $("events")
        .innerHTML =
        html;
    }

    if ($("homeEvents")) {
      $("homeEvents")
        .innerHTML =
        html;
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   MENU
========================= */

$("menuBtn").onclick =
  () => {
    $("side")
      .classList.toggle(
        "hidden"
      );
  };

document
  .querySelectorAll(
    "[data-p]"
  )
  .forEach(
    (button) => {
      button.onclick =
        () =>
          page(
            button.dataset.p
          );
    }
  );

$("profileBtn").onclick =
  () => {
    page(
      st.me?.role ===
      "admin"
        ? "admin"
        : "wallet"
    );
  };

/* =========================
   CIN
========================= */

$("cinBtn").onclick =
  cin;

/* =========================
   JWÈ ACHTE TIKÈ
========================= */

$("betBtn").onclick =
  async () => {
    try {
      const data =
        await A(
          "/api/bet",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                eventId:
                  +$("betEvent")
                    .value,

                market:
                  $("betMarket")
                    .value,

                stake:
                  +$("betStake")
                    .value,

                currency:
                  $("currency")
                    .value
              })
          }
        );

      M(
        "betMsg",
        "Tikè #" +
          data.betId +
          " achte.",
        "ok"
      );

      await wallet();
    } catch (error) {
      M(
        "betMsg",
        error.message,
        "error"
      );
    }
  };

/* =========================
   ECHANJ
========================= */

$("exchangeBtn").onclick =
  async () => {
    try {
      const data =
        await A(
          "/api/exchange",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                amount:
                  +$("amount")
                    .value,

                from:
                  $("from")
                    .value,

                to:
                  $("to")
                    .value
              })
          }
        );

      M(
        "exMsg",
        `Ou resevwa ${data.received} ${data.to}`,
        "ok"
      );

      await wallet();
    } catch (error) {
      M(
        "exMsg",
        error.message,
        "error"
      );
    }
  };

/* =========================
   ADMIN KREYE EVENT
========================= */

$("eventBtn").onclick =
  async () => {
    try {
      const data =
        await A(
          "/api/admin/event",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                sport:
                  $("sport")
                    .value,

                league:
                  $("league")
                    .value,

                home:
                  $("home")
                    .value,

                away:
                  $("away")
                    .value,

                start:
                  $("start")
                    .value,

                markets: {
                  home:
                    +$("oh")
                      .value,

                  draw:
                    +$("od")
                      .value,

                  away:
                    +$("oa")
                      .value
                }
              })
          }
        );

      M(
        "adminMsg",
        "Evènman #" +
          data.id +
          " kreye.",
        "ok"
      );

      await events();
    } catch (error) {
      M(
        "adminMsg",
        error.message,
        "error"
      );
    }
  };

/* =========================
   FIREBASE AUTH
========================= */

async function auth() {
  for (
    let i = 0;
    i < 50 &&
    !window.MPAuth;
    i++
  ) {
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100
        )
    );
  }

  if (!window.MPAuth) {
    throw new Error(
      "Firebase Auth pa chaje"
    );
  }

  const auth =
    window.MPAuth;

  auth.onAuthStateChanged(
    async (user) => {
      st.user = user;

      if (user) {
        $("auth")
          .classList.add(
            "hidden"
          );

        await me();

        await wallet();

        await events();
      } else {
        $("auth")
          .classList.remove(
            "hidden"
          );

        st.me = null;
        st.adm = "";

        sessionStorage
          .removeItem(
            "mp_admin_session"
          );
      }
    }
  );

  $("login").onclick =
    async () => {
      try {
        await auth.login(
          $("email").value,
          $("pass").value
        );
      } catch (error) {
        M(
          "authMsg",
          error.message,
          "error"
        );
      }
    };

  $("register").onclick =
    async () => {
      try {
        await auth.register(
          $("email").value,
          $("pass").value
        );
      } catch (error) {
        M(
          "authMsg",
          error.message,
          "error"
        );
      }
    };

  $("logout").onclick =
    () =>
      auth.logout();
}

/* =========================
   BOUTON AJAN
========================= */

if ($("agentBetBtn")) {
  $("agentBetBtn").onclick =
    agentBet;
}

if ($("payoutReqBtn")) {
  $("payoutReqBtn").onclick =
    payoutRequest;
}

/* =========================
   START
========================= */

auth();

events();

if (
  "serviceWorker"
  in navigator
) {
  navigator
    .serviceWorker
    .register("sw.js")
    .catch(() => {});
    }

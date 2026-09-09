const API =
  "https://mystroparyaj-api.castormystro.workers.dev";


const $ =
  id =>
    document.getElementById(id);


const state = {

  user: null,

  me: null,

  events: [],

  wallet: {
    HTG: 0,
    USD: 0,
    EUR: 0,
    CAD: 0,
    DOP: 0
  },

  rates: {},

  selectedSport: "Tout",

  paymentMode: "deposit",

  paymentMethod: "moncash",

  adminSession:
    sessionStorage.getItem(
      "mp_admin_session"
    ) || ""

};


const SPORTS = [

  ["Football","⚽"],

  ["Basketball","🏀"],

  ["Baseball","⚾"],

  ["Tennis","🎾"],

  ["Volleyball","🏐"],

  ["Hockey","🏒"],

  ["Boxing/MMA","🥊"],

  ["Horse racing","🏇"],

  ["Esports","🎮"],

  ["Lottery","🎱"],

  ["Borlette","🔢"],

  ["Virtual football","🖥️"],

  ["Virtual basketball","🏀"],

  ["Jackpot","💎"],

  ["Live betting","🔴"]

];


function showMessage(
  id,
  text,
  type = ""
){

  const element =
    $(id);

  if(!element){
    return;
  }

  element.textContent =
    text || "";

  element.className =
    "message " + type;

}


function escapeHtml(
  value
){

  return String(
    value ?? ""
  )
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");

}


async function api(
  path,
  options = {}
){

  const headers = {

    "Content-Type":
      "application/json",

    ...(options.headers || {})

  };


  if(state.user){

    headers.Authorization =
      "Bearer " +
      await state.user
        .getIdToken();

  }


  if(
    state.adminSession &&
    path.startsWith(
      "/api/admin/"
    )
  ){

    headers[
      "X-Admin-Session"
    ] =
      state.adminSession;

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


  try{

    data =
      await response.json();

  }catch{}


  if(!response.ok){

    const error =
      new Error(
        data.error ||
        "Erè sèvè"
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;

  }


  return data;

}


/* =============================
   ROLES
============================= */

function updateRoleUI(){

  const isAdmin =
    state.me?.canAccessAdmin ===
    true;


  const isAgent =
    state.me?.canAccessAgent ===
    true;


  $("adminNav")
    ?.classList.toggle(
      "hidden",
      !isAdmin
    );


  $("agentNav")
    ?.classList.toggle(
      "hidden",
      !isAgent
    );


  const mayApply =
    !isAdmin &&
    !isAgent &&
    (
      state.me?.agentStatus ===
        "none"
      ||
      state.me?.agentStatus ===
        "rejected"
    );


  $("agentApplication")
    ?.classList.toggle(
      "hidden",
      !mayApply
    );

}


/* =============================
   NAVIGATION
============================= */

function openPage(
  page
){

  if(
    page === "agent" &&
    state.me?.canAccessAgent !==
      true
  ){

    openPage(
      "profile"
    );

    return;

  }


  if(
    page === "admin" &&
    state.me?.canAccessAdmin !==
      true
  ){

    openPage(
      "profile"
    );

    return;

  }


  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      section => {

        section.classList.add(
          "hidden"
        );

      }
    );


  $("page-" + page)
    ?.classList.remove(
      "hidden"
    );


  $("side")
    ?.classList.add(
      "hidden"
    );


  document
    .querySelectorAll(
      ".bottom-nav button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.open ===
            page
        );

      }
    );


  if(page === "sports"){

    renderSports();

    renderEvents();

  }


  if(page === "wallet"){

    loadWallet();

  }


  if(page === "history"){

    loadHistory();

  }


  if(page === "profile"){

    renderProfile();

  }


  if(page === "agent"){

    loadAgent();

  }


  if(page === "admin"){

    openAdmin();

  }

}


/* =============================
   PROFILE
============================= */

function renderProfile(){

  if(!state.me){
    return;
  }


  let roleText =
    "Kont Jwè";


  if(
    state.me.role ===
    "agent"
  ){

    roleText =
      "Kont Ajan";

  }


  if(
    state.me.role ===
    "admin"
  ){

    roleText =
      "Administratè";

  }


  const name =
    state.me.fullName ||
    state.me.email
      ?.split("@")[0] ||
    "Itilizatè";


  $("profileName")
    .textContent =
      name;


  $("profileRole")
    .textContent =
      roleText;


  $("profileEmail")
    .textContent =
      state.me.email ||
      "-";


  $("profileType")
    .textContent =
      roleText;


  let agentStatus =
    "Pa ajan";


  if(
    state.me.agentStatus ===
    "pending"
  ){

    agentStatus =
      "Demann an atant";

  }


  if(
    state.me.agentStatus ===
    "approved"
  ){

    agentStatus =
      "Ajan apwouve";

  }


  if(
    state.me.agentStatus ===
    "rejected"
  ){

    agentStatus =
      "Demann rejte";

  }


  $("profileAgentStatus")
    .textContent =
      agentStatus;


  $("profileAgentCode")
    .textContent =
      state.me.agentCode ||
      "-";


  $("profileLinkedAgent")
    .textContent =
      state.me.linkedAgent ||
      "Pa gen";


  updateRoleUI();

}


/* =============================
   SPORTS
============================= */

function renderSports(){

  const targets = [

    $("homeSports"),

    $("sportCategories")

  ];


  for(
    const container
    of targets
  ){

    if(!container){
      continue;
    }


    container.innerHTML =
      SPORTS
      .map(
        ([name,icon]) => `

          <button
            class="sport-card ${
              state.selectedSport === name
              ?
              "active"
              :
              ""
            }"
            data-sport="${escapeHtml(name)}"
          >

            <span class="sport-icon">
              ${icon}
            </span>

            <strong>
              ${escapeHtml(name)}
            </strong>

          </button>

        `
      )
      .join("");


    container
      .querySelectorAll(
        "[data-sport]"
      )
      .forEach(
        button => {

          button.onclick =
            () => {

              state.selectedSport =
                button.dataset.sport;

              openPage(
                "sports"
              );

              renderSports();

              renderEvents();

            };

        }
      );

  }

}


/* =============================
   EVENTS
============================= */

async function loadEvents(){

  try{

    const data =
      await api(
        "/api/events"
      );


    state.events =
      Array.isArray(
        data.items
      )
      ?
      data.items
      :
      [];


    renderEvents();

  }catch(
    error
  ){

    console.error(
      error
    );

  }

}


function renderEvents(){

  let list =
    state.events;


  if(
    state.selectedSport !==
    "Tout"
  ){

    list =
      state.events.filter(
        event =>

          String(
            event.sport ||
            ""
          )
          .toLowerCase()
          ===
          state.selectedSport
          .toLowerCase()

      );

  }


  if(
    $("sportTitle")
  ){

    $("sportTitle")
      .textContent =
        state.selectedSport ===
        "Tout"
        ?
        "Tout evènman"
        :
        state.selectedSport;

  }


  const listHtml =
    list.length
    ?
    list
    .map(
      createEventCard
    )
    .join("")
    :
    `
      <div class="empty">
        Pa gen evènman ouvè nan kategori sa a.
      </div>
    `;


  if(
    $("eventsList")
  ){

    $("eventsList")
      .innerHTML =
        listHtml;

  }


  const homeEvents =
    state.events
    .slice(
      0,
      5
    );


  if(
    $("homeEvents")
  ){

    $("homeEvents")
      .innerHTML =
        homeEvents.length
        ?
        homeEvents
        .map(
          createEventCard
        )
        .join("")
        :
        `
          <div class="empty">
            Pa gen evènman ouvè kounye a.
          </div>
        `;

  }


  document
    .querySelectorAll(
      ".odd-btn"
    )
    .forEach(
      button => {

        button.onclick =
          () => {

            $("betEventId")
              .value =
                button.dataset.event;

            $("betMarket")
              .value =
                button.dataset.market;

            openPage(
              "bet"
            );

          };

      }
    );

}


function createEventCard(
  event
){

  const markets =
    event.markets ||
    {};


  return `

    <article class="event-card">

      <div class="event-header">

        <div>

          <div class="event-league">

            ${escapeHtml(
              event.sport ||
              ""
            )}

            ·

            ${escapeHtml(
              event.league ||
              ""
            )}

          </div>

          <div class="event-time">

            ${escapeHtml(
              event.start ||
              ""
            )}

          </div>

        </div>

        <strong>
          #${event.id}
        </strong>

      </div>


      <div class="event-teams">

        <strong>
          ${escapeHtml(
            event.home ||
            ""
          )}
        </strong>

        <span>
          vs
        </span>

        <strong>
          ${escapeHtml(
            event.away ||
            ""
          )}
        </strong>

      </div>


      <div class="odds-buttons">

        <button
          class="odd-btn"
          data-event="${event.id}"
          data-market="home"
        >

          <span>1</span>

          ${markets.home || "-"}

        </button>


        <button
          class="odd-btn"
          data-event="${event.id}"
          data-market="draw"
        >

          <span>X</span>

          ${markets.draw || "-"}

        </button>


        <button
          class="odd-btn"
          data-event="${event.id}"
          data-market="away"
        >

          <span>2</span>

          ${markets.away || "-"}

        </button>

      </div>

    </article>

  `;

}


/* =============================
   WALLET
============================= */

function formatMoney(
  amount,
  currency
){

  return (
    Number(
      amount ||
      0
    )
    .toLocaleString(
      undefined,
      {
        maximumFractionDigits:
          2
      }
    )
    +
    " "
    +
    currency
  );

}


async function loadWallet(){

  if(!state.user){
    return;
  }


  try{

    const data =
      await api(
        "/api/wallet"
      );


    state.wallet =
      {

        HTG:
          Number(
            data.balances?.HTG ||
            0
          ),

        USD:
          Number(
            data.balances?.USD ||
            0
          ),

        EUR:
          Number(
            data.balances?.EUR ||
            0
          ),

        CAD:
          Number(
            data.balances?.CAD ||
            0
          ),

        DOP:
          Number(
            data.balances?.DOP ||
            0
          )

      };


    renderWallet();

  }catch(
    error
  ){

    showMessage(
      "walletMsg",
      error.message,
      "error"
    );

  }

}


function renderWallet(){

  const currency =
    $("currency")
      ?.value ||
    "HTG";


  $("walletMainBalance")
    .textContent =
      formatMoney(
        state.wallet[
          currency
        ] ||
        0,
        currency
      );


  $("homeBalance")
    .textContent =
      formatMoney(
        state.wallet.HTG ||
        0,
        "HTG"
      );


  $("currencyBalances")
    .innerHTML =
      Object.entries(
        state.wallet
      )
      .map(
        ([code,value]) => `

          <div class="currency-card">

            <span>
              ${code}
            </span>

            <strong>
              ${formatMoney(
                value,
                code
              )}
            </strong>

          </div>

        `
      )
      .join("");

}


/* =============================
   PAYMENT
============================= */

function openPayment(
  mode
){

  state.paymentMode =
    mode;


  $("paymentPanel")
    .classList.remove(
      "hidden"
    );


  $("paymentTitle")
    .textContent =
      mode === "deposit"
      ?
      "Depoze lajan"
      :
      "Retire lajan";


  $("paymentPhoneBox")
    .classList.toggle(
      "hidden",
      mode !==
      "withdraw"
    );


  $("paymentBtn")
    .textContent =
      mode === "deposit"
      ?
      "Kontinye ak depo"
      :
      "Kontinye ak retrè";

}


function choosePaymentMethod(
  method
){

  state.paymentMethod =
    method;


  document
    .querySelectorAll(
      ".payment-method"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.paymentMethod ===
          method
        );

      }
    );

}


async function submitPayment(){

  const amount =
    Number(
      $("paymentAmount")
        .value
    );


  if(!(amount > 0)){

    showMessage(
      "walletMsg",
      "Antre yon montan valab.",
      "error"
    );

    return;

  }


  try{

    if(
      state.paymentMethod ===
      "natcash"
    ){

      showMessage(
        "walletMsg",
        "NatCash poko konekte ak API marchand ofisyèl la.",
        "error"
      );

      return;

    }


    if(
      state.paymentMode ===
      "deposit"
    ){

      const data =
        await api(
          "/api/deposit/moncash",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                amount
              })
          }
        );


      if(
        data.redirect
      ){

        window.location.href =
          data.redirect;

      }

      return;

    }


    const phone =
      $("paymentPhone")
        .value
        .trim();


    if(!phone){

      showMessage(
        "walletMsg",
        "Antre nimewo MonCash la.",
        "error"
      );

      return;

    }


    const result =
      await api(
        "/api/withdraw/moncash",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              amount,
              phone
            })
        }
      );


    showMessage(
      "walletMsg",
      "Retrè: " +
      (
        result.status ||
        "processing"
      ),
      "ok"
    );


    await loadWallet();

  }catch(
    error
  ){

    showMessage(
      "walletMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   EXCHANGE
============================= */

async function loadRates(){

  try{

    const data =
      await api(
        "/api/rates"
      );


    state.rates =
      data.rates ||
      {};


    updateExchangePreview();

  }catch{}

}


function updateExchangePreview(){

  const amount =
    Number(
      $("exchangeAmount")
        ?.value ||
      0
    );


  const from =
    $("exchangeFrom")
      ?.value;


  const to =
    $("exchangeTo")
      ?.value;


  if(
    !amount ||
    !state.rates[from] ||
    !state.rates[to]
  ){

    $("exchangePreview")
      .textContent =
        "Antre yon montan.";

    return;

  }


  const converted =
    (
      amount /
      state.rates[from]
    )
    *
    state.rates[to];


  $("exchangePreview")
    .textContent =
      `Estimasyon: ${converted.toFixed(
        2
      )} ${to}`;

}


async function exchangeMoney(){

  try{

    const data =
      await api(
        "/api/exchange",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              amount:
                Number(
                  $("exchangeAmount")
                    .value
                ),

              from:
                $("exchangeFrom")
                  .value,

              to:
                $("exchangeTo")
                  .value

            })
        }
      );


    showMessage(
      "exchangeMsg",
      `Ou resevwa ${data.received} ${data.to}.`,
      "ok"
    );


    await loadWallet();

  }catch(
    error
  ){

    showMessage(
      "exchangeMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   PLAYER BET
============================= */

async function placeBet(){

  try{

    const data =
      await api(
        "/api/bet",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              eventId:
                Number(
                  $("betEventId")
                    .value
                ),

              market:
                $("betMarket")
                  .value,

              stake:
                Number(
                  $("betStake")
                    .value
                ),

              currency:
                $("currency")
                  .value

            })
        }
      );


    showMessage(
      "betMsg",
      `Tikè #${data.betId} achte. Retou potansyèl: ${data.potentialReturn}`,
      "ok"
    );


    await loadWallet();

  }catch(
    error
  ){

    showMessage(
      "betMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   HISTORY
============================= */

async function loadHistory(){

  try{

    const data =
      await api(
        "/api/history"
      );


    const list =
      data.items ||
      [];


    $("homeTransactions")
      .textContent =
        list.length;


    $("historyList")
      .innerHTML =
        list.length
        ?
        list
        .map(
          item => `

            <div class="history-item">

              <div>

                <strong>
                  ${escapeHtml(
                    item.type ||
                    "Tranzaksyon"
                  )}
                </strong>

                <small>
                  ${escapeHtml(
                    item.status ||
                    ""
                  )}
                </small>

              </div>

              <strong>

                ${formatMoney(
                  item.amount,
                  item.currency
                )}

              </strong>

            </div>

          `
        )
        .join("")
        :
        `
          <div class="empty">
            Pa gen tranzaksyon.
          </div>
        `;

  }catch(
    error
  ){

    console.error(
      error
    );

  }

}


/* =============================
   APPLY AGENT
============================= */

async function applyAgent(){

  try{

    const data =
      await api(
        "/api/agent/apply",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              name:
                $("agentName")
                  .value
                  .trim(),

              phone:
                $("agentPhone")
                  .value
                  .trim(),

              city:
                $("agentCity")
                  .value
                  .trim(),

              address:
                $("agentAddress")
                  .value
                  .trim(),

              cin:
                $("agentCin")
                  .value
                  .trim()

            })
        }
      );


    state.me.agentStatus =
      data.status ||
      "pending";


    showMessage(
      "agentApplyMsg",
      "Demann Ajan an voye bay Admin.",
      "ok"
    );


    renderProfile();

  }catch(
    error
  ){

    showMessage(
      "agentApplyMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   AGENT
============================= */

async function loadAgent(){

  if(
    state.me?.canAccessAgent !==
    true
  ){

    openPage(
      "profile"
    );

    return;

  }


  $("agentCodeDisplay")
    .textContent =
      state.me.agentCode ||
      "-";


  try{

    const playersData =
      await api(
        "/api/agent/players"
      );


    const players =
      playersData.items ||
      [];


    $("agentPlayers")
      .innerHTML =
        players.length
        ?
        players
        .map(
          player => `

            <div class="profile-line">

              <div>

                <strong>
                  ${escapeHtml(
                    player.full_name ||
                    player.email ||
                    "Jwè"
                  )}
                </strong>

                <small>
                  ${escapeHtml(
                    player.email ||
                    ""
                  )}
                </small>

              </div>

            </div>

          `
        )
        .join("")
        :
        `
          <p class="muted">
            Pa gen jwè lye ak kont ajan ou.
          </p>
        `;


    $("agentPlayerSelect")
      .innerHTML =
        players
        .map(
          player => `

            <option
              value="${escapeHtml(
                player.uid
              )}"
            >

              ${escapeHtml(
                player.full_name ||
                player.email ||
                player.uid
              )}

            </option>

          `
        )
        .join("");


    const payoutData =
      await api(
        "/api/agent/payout-requests"
      );


    $("agentPayoutList")
      .innerHTML =
        payoutData.items
        ?.length
        ?
        payoutData.items
        .map(
          item => `

            <div class="history-item">

              <div>

                <strong>
                  Demann #${item.id}
                </strong>

                <small>
                  Bet #${item.bet_id}
                  ·
                  ${escapeHtml(
                    item.status
                  )}
                </small>

              </div>

              <strong>
                ${formatMoney(
                  item.amount,
                  item.currency
                )}
              </strong>

            </div>

          `
        )
        .join("")
        :
        `
          <p class="muted">
            Pa gen demann peman.
          </p>
        `;

  }catch(
    error
  ){

    $("agentPlayers")
      .innerHTML =
        `
          <div class="empty">
            ${escapeHtml(
              error.message
            )}
          </div>
        `;

  }

}


async function agentBet(){

  try{

    const data =
      await api(
        "/api/agent/bet",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              playerUid:
                $("agentPlayerSelect")
                  .value,

              eventId:
                Number(
                  $("agentEventId")
                    .value
                ),

              market:
                $("agentMarket")
                  .value,

              stake:
                Number(
                  $("agentStake")
                    .value
                ),

              currency:
                $("currency")
                  .value

            })
        }
      );


    showMessage(
      "agentBetMsg",
      `Fich #${data.betId} kreye.`,
      "ok"
    );


    await loadAgent();

  }catch(
    error
  ){

    showMessage(
      "agentBetMsg",
      error.message,
      "error"
    );

  }

}


async function requestWinnerPayout(){

  try{

    const data =
      await api(
        "/api/agent/payout-request",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              betId:
                Number(
                  $("agentWinnerBetId")
                    .value
                )

            })
        }
      );


    showMessage(
      "agentPayoutMsg",
      `Demann #${data.requestId} voye bay Admin.`,
      "ok"
    );


    await loadAgent();

  }catch(
    error
  ){

    showMessage(
      "agentPayoutMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   ADMIN CIN
============================= */

function showCin(){

  const firstTime =
    state.me
      ?.cinConfigured ===
    false;


  $("cinModal")
    .classList.remove(
      "hidden"
    );


  $("adminNameBox")
    .classList.toggle(
      "hidden",
      !firstTime
    );


  $("cinTitle")
    .textContent =
      firstTime
      ?
      "Konfigire CIN Admin"
      :
      "Konfime CIN Admin";


  $("cinInfo")
    .textContent =
      firstTime
      ?
      "Premye fwa sèlman: antre non konplè ak CIN ou."
      :
      "Antre CIN ou pou konfime se ou menm.";

}


async function verifyCin(){

  try{

    const firstTime =
      state.me
        ?.cinConfigured ===
      false;


    const path =
      firstTime
      ?
      "/api/admin/cin/setup"
      :
      "/api/admin/cin/verify";


    const body =
      firstTime
      ?
      {

        cin:
          $("adminCin")
            .value,

        fullName:
          $("adminFullName")
            .value

      }
      :
      {

        cin:
          $("adminCin")
            .value

      };


    const data =
      await api(
        path,
        {
          method:
            "POST",

          body:
            JSON.stringify(
              body
            )
        }
      );


    state.adminSession =
      data.sessionToken;


    sessionStorage.setItem(
      "mp_admin_session",
      state.adminSession
    );


    state.me.cinConfigured =
      true;


    $("adminCin")
      .value =
        "";


    $("cinModal")
      .classList.add(
        "hidden"
      );


    await loadAdmin();

  }catch(
    error
  ){

    showMessage(
      "cinMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   ADMIN
============================= */

async function openAdmin(){

  if(
    state.me
      ?.canAccessAdmin !==
    true
  ){

    return;

  }


  if(
    !state.adminSession
  ){

    showCin();

    return;

  }


  await loadAdmin();

}


async function loadAdmin(){

  try{

    const stats =
      await api(
        "/api/admin/stats"
      );


    $("adminStats")
      .innerHTML =
        `

          <div class="stat-card">
            <span>Jwè</span>
            <strong>${stats.players || 0}</strong>
          </div>

          <div class="stat-card">
            <span>Ajan</span>
            <strong>${stats.agents || 0}</strong>
          </div>

          <div class="stat-card">
            <span>Pari</span>
            <strong>${stats.totalBets || 0}</strong>
          </div>

          <div class="stat-card">
            <span>Ouvè</span>
            <strong>${stats.openBets || 0}</strong>
          </div>

          <div class="stat-card">
            <span>Tranzaksyon</span>
            <strong>${stats.transactions || 0}</strong>
          </div>

        `;


    await loadAdminAgents();

    await loadAdminPayouts();

  }catch(
    error
  ){

    if(
      error.status ===
      401 &&
      error.data
        ?.cinRequired
    ){

      state.adminSession =
        "";


      sessionStorage.removeItem(
        "mp_admin_session"
      );


      showCin();

      return;

    }


    console.error(
      error
    );

  }

}


async function loadAdminAgents(){

  const data =
    await api(
      "/api/admin/agents"
    );


  const agents =
    data.items ||
    [];


  $("adminAgentRequests")
    .innerHTML =
      agents.length
      ?
      agents
      .map(
        item => `

          <div class="request-card">

            <strong>
              ${escapeHtml(
                item.name ||
                item.uid
              )}
            </strong>

            <p>
              ${escapeHtml(
                item.phone ||
                ""
              )}
            </p>

            <p>
              ${escapeHtml(
                item.city ||
                ""
              )}
            </p>

            <p>
              Estati:
              <b>
                ${escapeHtml(
                  item.status
                )}
              </b>
            </p>

            ${
              item.status ===
              "pending"
              ?
              `

                <div class="request-actions">

                  <button
                    class="mini-btn approve"
                    data-agent-review="${escapeHtml(
                      item.uid
                    )}"
                    data-status="approved"
                  >
                    Apwouve
                  </button>

                  <button
                    class="mini-btn reject"
                    data-agent-review="${escapeHtml(
                      item.uid
                    )}"
                    data-status="rejected"
                  >
                    Rejte
                  </button>

                </div>

              `
              :
              ""
            }

          </div>

        `
      )
      .join("")
      :
      `
        <p class="muted">
          Pa gen demann Ajan.
        </p>
      `;


  document
    .querySelectorAll(
      "[data-agent-review]"
    )
    .forEach(
      button => {

        button.onclick =
          async () => {

            try{

              await api(
                "/api/admin/agent-review",
                {
                  method:
                    "POST",

                  body:
                    JSON.stringify({

                      uid:
                        button.dataset
                        .agentReview,

                      status:
                        button.dataset
                        .status

                    })
                }
              );


              await loadAdminAgents();

            }catch(
              error
            ){

              alert(
                error.message
              );

            }

          };

      }
    );

}


async function loadAdminPayouts(){

  const data =
    await api(
      "/api/admin/payout-requests"
    );


  const list =
    data.items ||
    [];


  $("adminPayoutRequests")
    .innerHTML =
      list.length
      ?
      list
      .map(
        item => `

          <div class="request-card">

            <strong>
              Demann #${item.id}
            </strong>

            <p>
              Bet #${item.bet_id}
            </p>

            <p>
              ${formatMoney(
                item.amount,
                item.currency
              )}
            </p>

            <p>
              Estati:
              <b>
                ${escapeHtml(
                  item.status
                )}
              </b>
            </p>

            ${
              item.status ===
              "pending"
              ?
              `

                <div class="request-actions">

                  <button
                    class="mini-btn approve"
                    data-payout-review="${item.id}"
                    data-status="approved"
                  >
                    Apwouve
                  </button>

                  <button
                    class="mini-btn reject"
                    data-payout-review="${item.id}"
                    data-status="rejected"
                  >
                    Rejte
                  </button>

                </div>

              `
              :
              ""
            }

            ${
              item.status ===
              "approved"
              ?
              `

                <button
                  class="mini-btn pay"
                  data-payout-review="${item.id}"
                  data-status="paid"
                >
                  Make kòm peye
                </button>

              `
              :
              ""
            }

          </div>

        `
      )
      .join("")
      :
      `
        <p class="muted">
          Pa gen demann peman.
        </p>
      `;


  document
    .querySelectorAll(
      "[data-payout-review]"
    )
    .forEach(
      button => {

        button.onclick =
          async () => {

            try{

              await api(
                "/api/admin/payout-review",
                {
                  method:
                    "POST",

                  body:
                    JSON.stringify({

                      id:
                        Number(
                          button.dataset
                          .payoutReview
                        ),

                      status:
                        button.dataset
                        .status

                    })
                }
              );


              await loadAdminPayouts();

            }catch(
              error
            ){

              alert(
                error.message
              );

            }

          };

      }
    );

}


async function createAdminEvent(){

  try{

    const data =
      await api(
        "/api/admin/event",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              sport:
                $("adminSport")
                  .value,

              league:
                $("adminLeague")
                  .value
                  .trim(),

              home:
                $("adminHome")
                  .value
                  .trim(),

              away:
                $("adminAway")
                  .value
                  .trim(),

              start:
                $("adminStart")
                  .value,

              markets:{

                home:
                  Number(
                    $("adminOddHome")
                      .value
                  ),

                draw:
                  Number(
                    $("adminOddDraw")
                      .value
                  ),

                away:
                  Number(
                    $("adminOddAway")
                      .value
                  )

              }

            })
        }
      );


    showMessage(
      "adminEventMsg",
      `Evènman #${data.id} kreye.`,
      "ok"
    );


    await loadEvents();

  }catch(
    error
  ){

    showMessage(
      "adminEventMsg",
      error.message,
      "error"
    );

  }

}


async function settleEvent(){

  try{

    const data =
      await api(
        "/api/admin/settle",
        {
          method:
            "POST",

          body:
            JSON.stringify({

              eventId:
                Number(
                  $("settleEventId")
                    .value
                ),

              winner:
                $("settleWinner")
                  .value

            })
        }
      );


    showMessage(
      "settleMsg",
      `${data.won} gagnan · ${data.lost} pèdan`,
      "ok"
    );


    await loadEvents();

  }catch(
    error
  ){

    showMessage(
      "settleMsg",
      error.message,
      "error"
    );

  }

}


/* =============================
   AUTH
============================= */

async function waitForAuth(){

  for(
    let i = 0;
    i < 80;
    i++
  ){

    if(
      window.MPAuth
    ){

      return window.MPAuth;

    }


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          100
        )
    );

  }


  throw new Error(
    "Firebase Auth pa chaje."
  );

}


async function initializeAuth(){

  const auth =
    await waitForAuth();


  auth.onAuthStateChanged(
    async user => {

      state.user =
        user ||
        null;


      if(!user){

        state.me =
          null;


        state.adminSession =
          "";


        sessionStorage.removeItem(
          "mp_admin_session"
        );


        $("agentNav")
          .classList.add(
            "hidden"
          );


        $("adminNav")
          .classList.add(
            "hidden"
          );


        $("authModal")
          .classList.remove(
            "hidden"
          );


        return;

      }


      $("authModal")
        .classList.add(
          "hidden"
        );


      try{

        state.me =
          await api(
            "/api/me"
          );


        updateRoleUI();

        renderProfile();

        renderSports();


        await Promise.all([

          loadWallet(),

          loadEvents(),

          loadHistory(),

          loadRates()

        ]);


        if(
          state.me
            .canAccessAdmin ===
          true
          &&
          !state.adminSession
        ){

          showCin();

        }

      }catch(
        error
      ){

        console.error(
          error
        );

      }

    }
  );


  $("loginBtn").onclick =
    async () => {

      try{

        await auth.login(

          $("loginEmail")
            .value
            .trim(),

          $("loginPassword")
            .value

        );

      }catch(
        error
      ){

        showMessage(
          "authMsg",
          error.message,
          "error"
        );

      }

    };


  $("registerBtn").onclick =
    async () => {

      try{

        await auth.register(

          $("loginEmail")
            .value
            .trim(),

          $("loginPassword")
            .value

        );


        showMessage(
          "authMsg",
          "Kont Jwè kreye.",
          "ok"
        );

      }catch(
        error
      ){

        showMessage(
          "authMsg",
          error.message,
          "error"
        );

      }

    };


  async function logout(){

    state.adminSession =
      "";


    sessionStorage.removeItem(
      "mp_admin_session"
    );


    await auth.logout();

  }


  $("logoutBtn").onclick =
    logout;


  $("profileLogoutBtn").onclick =
    logout;

}


/* =============================
   BUTTONS
============================= */

$("menuBtn").onclick =
  () => {

    $("side")
      .classList.toggle(
        "hidden"
      );

  };


$("profileBtn").onclick =
  () => {

    openPage(
      "profile"
    );

  };


document
  .querySelectorAll(
    "[data-page]"
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          openPage(
            button.dataset.page
          );

        };

    }
  );


document
  .querySelectorAll(
    "[data-open]"
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          openPage(
            button.dataset.open
          );

        };

    }
  );


document
  .querySelectorAll(
    "[data-wallet-action]"
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          openPayment(
            button.dataset
            .walletAction
          );

        };

    }
  );


document
  .querySelectorAll(
    "[data-payment-method]"
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          choosePaymentMethod(
            button.dataset
            .paymentMethod
          );

        };

    }
  );


$("currency").onchange =
  () => {

    $("ticketCurrency")
      .textContent =
        $("currency")
          .value;


    renderWallet();

  };


$("exchangeAmount").oninput =
  updateExchangePreview;


$("exchangeFrom").onchange =
  updateExchangePreview;


$("exchangeTo").onchange =
  updateExchangePreview;


$("placeBetBtn").onclick =
  placeBet;


$("paymentBtn").onclick =
  submitPayment;


$("exchangeBtn").onclick =
  exchangeMoney;


$("agentApplyBtn").onclick =
  applyAgent;


$("agentBetBtn").onclick =
  agentBet;


$("agentPayoutBtn").onclick =
  requestWinnerPayout;


$("verifyCinBtn").onclick =
  verifyCin;


$("adminCreateEventBtn").onclick =
  createAdminEvent;


$("settleBtn").onclick =
  settleEvent;


/* =============================
   START
============================= */

renderSports();

loadEvents();

loadRates();

initializeAuth()
.catch(
  error => {

    showMessage(
      "authMsg",
      error.message,
      "error"
    );

  }
);


if(
  "serviceWorker"
  in navigator
){

  navigator
    .serviceWorker
    .register(
      "sw.js"
    )
    .catch(
      () => {}
    );

  }

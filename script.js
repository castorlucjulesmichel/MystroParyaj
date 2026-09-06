import {
  auth,
  configured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "./firebase-config.js";


// ========================================
// MYSTROPARYAJ
// CONFIGURATION
// ========================================

const WORKER_URL =
  localStorage.getItem(
    "MYSTROPARYAJ_WORKER_URL"
  ) ||
  "https://VOTRE-WORKER.workers.dev";


const state = {

  lang:
    localStorage.getItem(
      "mystroparyaj_lang"
    ) || "fr",

  currency:
    localStorage.getItem(
      "mystroparyaj_currency"
    ) || "HTG",

  balance:
    Number(
      localStorage.getItem(
        "mystroparyaj_balance"
      ) || 0
    ),

  bets:
    JSON.parse(
      localStorage.getItem(
        "mystroparyaj_bets"
      ) || "[]"
    ),

  history:
    JSON.parse(
      localStorage.getItem(
        "mystroparyaj_history"
      ) || "[]"
    ),

  user:
    JSON.parse(
      localStorage.getItem(
        "mystroparyaj_user"
      ) || "null"
    ),

  provider: "moncash",

  paymentMode: "deposit",

  sport: "football",

  totalStakes:
    Number(
      localStorage.getItem(
        "mystroparyaj_total_stakes"
      ) || 0
    )
};


// ========================================
// TRADUCTIONS
// ========================================

const T = {

  fr: {

    tagline:
      "Paris sportifs & portefeuille",

    home:
      "Accueil",

    sports:
      "Sports",

    betslip:
      "Ticket",

    wallet:
      "Portefeuille",

    exchange:
      "Change",

    history:
      "Historique",

    profile:
      "Profil",

    admin:
      "Administration",

    responsible:
      "Jouez de façon responsable.",

    limits:
      "Mes limites",

    login:
      "Connexion",

    livePlatform:
      "Plateforme de démonstration",

    heroTitle:
      "Pariez simplement. Suivez tout clairement.",

    heroText:
      "15 catégories, portefeuille multi-devises, MonCash, NatCash et statistiques.",

    startBet:
      "Voir les paris",

    manageWallet:
      "Gérer le portefeuille",

    securePlatform:
      "Plateforme sécurisée",

    securePlatformText:
      "Paris, portefeuille et paiements réunis dans une seule application.",

    balance:
      "Solde",

    available:
      "Disponible",

    openBets:
      "Paris ouverts",

    activeTickets:
      "Tickets actifs",

    todayBets:
      "Paris du jour",

    activity:
      "Activité",

    transactions:
      "Transactions",

    featured:
      "Événements en vedette",

    seeAll:
      "Tout voir",

    weeklyActivity:
      "Activité hebdomadaire",

    chooseEvent:
      "Choisissez une catégorie puis un pari.",

    allEvents:
      "Tous les événements",

    searchEvent:
      "Rechercher un événement",

    betslipHelp:
      "Vérifiez vos sélections avant validation.",

    stake:
      "Mise",

    totalOdds:
      "Cote totale",

    potentialReturn:
      "Retour potentiel",

    placeBet:
      "Valider le pari",

    demoWarning:
      "Mode démo tant que les paiements réels ne sont pas activés.",

    walletText:
      "Dépôts, retraits et soldes.",

    availableBalance:
      "Solde disponible",

    deposit:
      "Dépôt",

    withdraw:
      "Retrait",

    paymentMethod:
      "Méthode de paiement",

    mobileMoney:
      "Mobile Money",

    phone:
      "Numéro de téléphone",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount:
      "Montant",

    continue:
      "Continuer",

    exchangeText:
      "Convertissez entre les devises disponibles.",

    from:
      "De",

    to:
      "Vers",

    convert:
      "Convertir",

    rateNotice:
      "Les taux affichés sont indicatifs en mode démo.",

    historyText:
      "Vos paris et mouvements de portefeuille.",

    date:
      "Date",

    type:
      "Type",

    details:
      "Détails",

    status:
      "Statut",

    profileText:
      "Compte, sécurité et jeu responsable.",

    language:
      "Langue",

    mainCurrency:
      "Devise principale",

    responsibleGaming:
      "Jeu responsable",

    dailyDepositLimit:
      "Limite dépôt/jour",

    dailyBetLimit:
      "Limite mises/jour",

    save:
      "Enregistrer",

    selfExclude:
      "Auto-exclusion",

    adminText:
      "Vue des opérations.",

    totalStakes:
      "Mises totales",

    users:
      "Utilisateurs",

    systemControl:
      "Contrôle du système",

    systemControlText:
      "Les calculs financiers sensibles sont effectués côté serveur et ne sont pas affichés aux utilisateurs.",

    loginRegister:
      "Connexion / Inscription",

    otpText:
      "Entrez votre numéro puis le code reçu.",

    ageConfirm:
      "Je confirme avoir au moins 18 ans.",

    sendCode:
      "Envoyer le code",

    code:
      "Code",

    verify:
      "Vérifier",

    limitsInfo:
      "Définissez vos limites de jeu.",

    manageLimits:
      "Gérer les limites",

    emptyTicket:
      "Aucune sélection pour le moment.",

    betPlaced:
      "Pari enregistré.",

    loginRequired:
      "Connectez-vous d'abord.",

    ageRequired:
      "Vous devez confirmer avoir 18 ans ou plus.",

    otpSent:
      "Code envoyé.",

    demoOtp:
      "Firebase n'est pas encore configuré.",

    paymentPending:
      "Ouverture du paiement…",

    paymentUnavailable:
      "Cette méthode n'est pas encore configurée.",

    saved:
      "Enregistré.",

    selfExcluded:
      "Auto-exclusion activée.",

    invalidAmount:
      "Montant invalide.",

    converted:
      "Conversion calculée."

  },


  ht: {

    tagline:
      "Pari espòtif & bous",

    home:
      "Akèy",

    sports:
      "Espò",

    betslip:
      "Tikè",

    wallet:
      "Bous",

    exchange:
      "Chanj",

    history:
      "Istwa",

    profile:
      "Pwofil",

    admin:
      "Administrasyon",

    responsible:
      "Jwe avèk responsabilite.",

    limits:
      "Limit mwen",

    login:
      "Konekte",

    livePlatform:
      "Platfòm demonstrasyon",

    heroTitle:
      "Parye fasil. Swiv tout bagay klè.",

    heroText:
      "15 kategori, plizyè lajan, MonCash, NatCash ak estatistik.",

    startBet:
      "Gade paryaj",

    manageWallet:
      "Jere bous la",

    securePlatform:
      "Platfòm sekirize",

    securePlatformText:
      "Paryaj, bous ak peman ansanm nan yon sèl aplikasyon.",

    balance:
      "Balans",

    available:
      "Disponib",

    openBets:
      "Paryaj ouvè",

    activeTickets:
      "Tikè aktif",

    todayBets:
      "Paryaj jodi a",

    activity:
      "Aktivite",

    transactions:
      "Tranzaksyon",

    featured:
      "Evènman vedèt",

    seeAll:
      "Wè tout",

    weeklyActivity:
      "Aktivite semèn",

    chooseEvent:
      "Chwazi yon kategori epi yon paryaj.",

    allEvents:
      "Tout evènman",

    searchEvent:
      "Chèche yon evènman",

    betslipHelp:
      "Verifye seleksyon ou anvan validasyon.",

    stake:
      "Miz",

    totalOdds:
      "Kòt total",

    potentialReturn:
      "Retou posib",

    placeBet:
      "Valide paryaj",

    demoWarning:
      "Mòd demo jiskaske peman reyèl aktive.",

    walletText:
      "Depo, retrè ak balans.",

    availableBalance:
      "Balans disponib",

    deposit:
      "Depo",

    withdraw:
      "Retrè",

    paymentMethod:
      "Metòd peman",

    mobileMoney:
      "Lajan mobil",

    phone:
      "Nimewo telefòn",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount:
      "Montan",

    continue:
      "Kontinye",

    exchangeText:
      "Konvèti ant lajan ki disponib.",

    from:
      "Soti",

    to:
      "Pou",

    convert:
      "Konvèti",

    rateNotice:
      "To yo se egzanp nan mòd demo.",

    historyText:
      "Paryaj ak mouvman bous ou.",

    date:
      "Dat",

    type:
      "Tip",

    details:
      "Detay",

    status:
      "Estati",

    profileText:
      "Kont, sekirite ak jwèt responsab.",

    language:
      "Lang",

    mainCurrency:
      "Lajan prensipal",

    responsibleGaming:
      "Jwèt responsab",

    dailyDepositLimit:
      "Limit depo/jou",

    dailyBetLimit:
      "Limit miz/jou",

    save:
      "Anrejistre",

    selfExclude:
      "Oto-ekskli",

    adminText:
      "Vizyalizasyon operasyon yo.",

    totalStakes:
      "Total miz",

    users:
      "Itilizatè",

    systemControl:
      "Kontwòl sistèm",

    systemControlText:
      "Kalkil finansye sansib yo fèt sou sèvè a epi yo pa parèt pou itilizatè yo.",

    loginRegister:
      "Konekte / Enskri",

    otpText:
      "Antre nimewo ou epi kòd ou resevwa.",

    ageConfirm:
      "Mwen konfime mwen gen omwen 18 an.",

    sendCode:
      "Voye kòd",

    code:
      "Kòd",

    verify:
      "Verifye",

    limitsInfo:
      "Mete limit jwèt ou.",

    manageLimits:
      "Jere limit yo",

    emptyTicket:
      "Pa gen seleksyon kounye a.",

    betPlaced:
      "Paryaj anrejistre.",

    loginRequired:
      "Konekte anvan.",

    ageRequired:
      "Ou dwe konfime ou gen omwen 18 an.",

    otpSent:
      "Kòd voye.",

    demoOtp:
      "Firebase poko konfigire.",

    paymentPending:
      "Peman ap louvri…",

    paymentUnavailable:
      "Metòd sa a poko konfigire.",

    saved:
      "Anrejistre.",

    selfExcluded:
      "Oto-eksklizyon aktive.",

    invalidAmount:
      "Montan pa valab.",

    converted:
      "Konvèsyon kalkile."

  }

};


// ========================================
// ENGLISH
// ========================================

T.en = {

  ...T.fr,

  tagline:
    "Sports betting & wallet",

  home:
    "Home",

  sports:
    "Sports",

  betslip:
    "Betslip",

  wallet:
    "Wallet",

  exchange:
    "Exchange",

  history:
    "History",

  profile:
    "Profile",

  admin:
    "Administration",

  responsible:
    "Gamble responsibly.",

  limits:
    "My limits",

  login:
    "Sign in",

  livePlatform:
    "Demo platform",

  heroTitle:
    "Bet simply. Track everything clearly.",

  heroText:
    "15 categories, multi-currency wallet, MonCash, NatCash and statistics.",

  startBet:
    "View bets",

  manageWallet:
    "Manage wallet",

  securePlatform:
    "Secure platform",

  securePlatformText:
    "Betting, wallet and payments in one application.",

  balance:
    "Balance",

  available:
    "Available",

  openBets:
    "Open bets",

  activeTickets:
    "Active tickets",

  todayBets:
    "Today's bets",

  activity:
    "Activity",

  transactions:
    "Transactions",

  featured:
    "Featured events",

  seeAll:
    "See all",

  weeklyActivity:
    "Weekly activity",

  chooseEvent:
    "Choose a category and then a bet.",

  allEvents:
    "All events",

  searchEvent:
    "Search event",

  betslipHelp:
    "Review your selections before submitting.",

  stake:
    "Stake",

  totalOdds:
    "Total odds",

  potentialReturn:
    "Potential return",

  placeBet:
    "Place bet",

  demoWarning:
    "Demo mode until real payments are activated.",

  walletText:
    "Deposits, withdrawals and balances.",

  availableBalance:
    "Available balance",

  deposit:
    "Deposit",

  withdraw:
    "Withdraw",

  paymentMethod:
    "Payment method",

  phone:
    "Phone number",

  amount:
    "Amount",

  continue:
    "Continue",

  exchangeText:
    "Convert between available currencies.",

  from:
    "From",

  to:
    "To",

  convert:
    "Convert",

  historyText:
    "Your bets and wallet movements.",

  date:
    "Date",

  type:
    "Type",

  details:
    "Details",

  status:
    "Status",

  profileText:
    "Account, security and responsible gaming.",

  language:
    "Language",

  mainCurrency:
    "Main currency",

  responsibleGaming:
    "Responsible gaming",

  dailyDepositLimit:
    "Daily deposit limit",

  dailyBetLimit:
    "Daily bet limit",

  save:
    "Save",

  selfExclude:
    "Self-exclude",

  totalStakes:
    "Total stakes",

  users:
    "Users",

  systemControl:
    "System control",

  systemControlText:
    "Sensitive financial calculations are performed on the server and are not shown to users.",

  loginRegister:
    "Sign in / Register",

  otpText:
    "Enter your number and the code received.",

  ageConfirm:
    "I confirm I am at least 18 years old.",

  sendCode:
    "Send code",

  code:
    "Code",

  verify:
    "Verify",

  emptyTicket:
    "No selections yet.",

  loginRequired:
    "Sign in first.",

  invalidAmount:
    "Invalid amount.",

  saved:
    "Saved."

};


// ========================================
// ESPAÑOL
// ========================================

T.es = {

  ...T.fr,

  tagline:
    "Apuestas deportivas y billetera",

  home:
    "Inicio",

  sports:
    "Deportes",

  betslip:
    "Boleto",

  wallet:
    "Billetera",

  exchange:
    "Cambio",

  history:
    "Historial",

  profile:
    "Perfil",

  admin:
    "Administración",

  responsible:
    "Juega responsablemente.",

  limits:
    "Mis límites",

  login:
    "Iniciar sesión",

  livePlatform:
    "Plataforma demo",

  heroTitle:
    "Apuesta fácil. Controla todo con claridad.",

  heroText:
    "15 categorías, MonCash, NatCash y billetera multidivisa.",

  startBet:
    "Ver apuestas",

  manageWallet:
    "Gestionar billetera",

  securePlatform:
    "Plataforma segura",

  securePlatformText:
    "Apuestas, billetera y pagos en una sola aplicación.",

  balance:
    "Saldo",

  available:
    "Disponible",

  openBets:
    "Apuestas abiertas",

  activeTickets:
    "Boletos activos",

  todayBets:
    "Apuestas de hoy",

  activity:
    "Actividad",

  transactions:
    "Transacciones",

  featured:
    "Eventos destacados",

  seeAll:
    "Ver todo",

  weeklyActivity:
    "Actividad semanal",

  chooseEvent:
    "Elige una categoría y luego una apuesta.",

  allEvents:
    "Todos los eventos",

  searchEvent:
    "Buscar evento",

  betslipHelp:
    "Revisa tus selecciones antes de validar.",

  stake:
    "Apuesta",

  totalOdds:
    "Cuota total",

  potentialReturn:
    "Retorno potencial",

  placeBet:
    "Validar apuesta",

  walletText:
    "Depósitos, retiros y saldos.",

  availableBalance:
    "Saldo disponible",

  deposit:
    "Depósito",

  withdraw:
    "Retiro",

  paymentMethod:
    "Método de pago",

  phone:
    "Número de teléfono",

  amount:
    "Monto",

  continue:
    "Continuar",

  exchangeText:
    "Convierte entre las monedas disponibles.",

  from:
    "De",

  to:
    "A",

  convert:
    "Convertir",

  historyText:
    "Tus apuestas y movimientos.",

  date:
    "Fecha",

  type:
    "Tipo",

  details:
    "Detalles",

  status:
    "Estado",

  profileText:
    "Cuenta, seguridad y juego responsable.",

  language:
    "Idioma",

  mainCurrency:
    "Moneda principal",

  responsibleGaming:
    "Juego responsable",

  dailyDepositLimit:
    "Límite depósito/día",

  dailyBetLimit:
    "Límite apuestas/día",

  save:
    "Guardar",

  selfExclude:
    "Autoexclusión",

  totalStakes:
    "Apuestas totales",

  users:
    "Usuarios",

  systemControl:
    "Control del sistema",

  systemControlText:
    "Los cálculos financieros sensibles se realizan en el servidor y no se muestran a los usuarios.",

  loginRegister:
    "Iniciar sesión / Registro",

  otpText:
    "Introduce tu número y el código recibido.",

  ageConfirm:
    "Confirmo que tengo al menos 18 años.",

  sendCode:
    "Enviar código",

  code:
    "Código",

  verify:
    "Verificar",

  emptyTicket:
    "No hay selecciones.",

  loginRequired:
    "Inicia sesión primero.",

  invalidAmount:
    "Monto inválido.",

  saved:
    "Guardado."

};


// ========================================
// 15 CATÉGORIES DE JEUX
// ========================================

const sports = [

  [
    "football",
    "⚽",
    "Football"
  ],

  [
    "basketball",
    "🏀",
    "Basketball"
  ],

  [
    "tennis",
    "🎾",
    "Tennis"
  ],

  [
    "baseball",
    "⚾",
    "Baseball"
  ],

  [
    "volleyball",
    "🏐",
    "Volleyball"
  ],

  [
    "hockey",
    "🏒",
    "Hockey"
  ],

  [
    "handball",
    "🤾",
    "Handball"
  ],

  [
    "mma",
    "🥊",
    "Boxe / MMA"
  ],

  [
    "tabletennis",
    "🏓",
    "Tennis de table"
  ],

  [
    "cricket",
    "🏏",
    "Cricket"
  ],

  [
    "rugby",
    "🏉",
    "Rugby"
  ],

  [
    "esports",
    "🎮",
    "eFootball / eSports"
  ],

  [
    "motorsport",
    "🏎️",
    "Course auto"
  ],

  [
    "horses",
    "🏇",
    "Course hippique"
  ],

  [
    "virtual",
    "🎲",
    "Jeux virtuels"
  ]

];


// ========================================
// ÉVÉNEMENTS DE DÉMONSTRATION
// ========================================

const demoEvents = [

  {

    id:
      "f1",

    sport:
      "football",

    league:
      "International",

    time:
      "18:30",

    home:
      "Aquila FC",

    away:
      "Cap Sud",

    markets: [

      [
        "1",
        1.95
      ],

      [
        "X",
        3.20
      ],

      [
        "2",
        2.70
      ]

    ]

  },


  {

    id:
      "f2",

    sport:
      "football",

    league:
      "Premier",

    time:
      "20:00",

    home:
      "Union",

    away:
      "Royal",

    markets: [

      [
        "1",
        2.15
      ],

      [
        "X",
        3.10
      ],

      [
        "2",
        2.40
      ]

    ]

  },


  {

    id:
      "b1",

    sport:
      "basketball",

    league:
      "Pro Basket",

    time:
      "19:15",

    home:
      "Tigers",

    away:
      "Stars",

    markets: [

      [
        "1",
        1.72
      ],

      [
        "2",
        2.05
      ]

    ]

  },


  {

    id:
      "t1",

    sport:
      "tennis",

    league:
      "Open",

    time:
      "17:45",

    home:
      "Player A",

    away:
      "Player B",

    markets: [

      [
        "1",
        1.62
      ],

      [
        "2",
        2.22
      ]

    ]

  },


  {

    id:
      "m1",

    sport:
      "mma",

    league:
      "Fight Night",

    time:
      "21:00",

    home:
      "Fighter A",

    away:
      "Fighter B",

    markets: [

      [
        "1",
        1.80
      ],

      [
        "2",
        1.95
      ]

    ]

  },


  {

    id:
      "e1",

    sport:
      "esports",

    league:
      "eFootball",

    time:
      "16:10",

    home:
      "Phoenix",

    away:
      "Orbit",

    markets: [

      [
        "1",
        1.88
      ],

      [
        "X",
        3.40
      ],

      [
        "2",
        2.55
      ]

    ]

  }

];


// ========================================
// TAUX DE CHANGE DÉMO
// ========================================

const rates = {

  HTG:
    1,

  USD:
    132,

  EUR:
    143,

  CAD:
    97,

  DOP:
    2.25

};


// ========================================
// OUTILS
// ========================================

const $ =
  selector =>
    document.querySelector(
      selector
    );


const $$ =
  selector =>
    [
      ...document.querySelectorAll(
        selector
      )
    ];


const tr =
  key =>
    T[state.lang]?.[key] ||
    T.fr[key] ||
    key;


function money(value) {

  return (

    Number(
      value || 0
    ).toLocaleString(

      undefined,

      {
        maximumFractionDigits: 2
      }

    )

    +

    " "

    +

    state.currency

  );

}


// ========================================
// SAUVEGARDE LOCALE
// ========================================

function persist() {

  localStorage.setItem(

    "mystroparyaj_lang",

    state.lang

  );


  localStorage.setItem(

    "mystroparyaj_currency",

    state.currency

  );


  localStorage.setItem(

    "mystroparyaj_balance",

    state.balance

  );


  localStorage.setItem(

    "mystroparyaj_bets",

    JSON.stringify(
      state.bets
    )

  );


  localStorage.setItem(

    "mystroparyaj_history",

    JSON.stringify(
      state.history
    )

  );


  localStorage.setItem(

    "mystroparyaj_user",

    JSON.stringify(
      state.user
    )

  );


  localStorage.setItem(

    "mystroparyaj_total_stakes",

    state.totalStakes

  );

}


// ========================================
// LANGUES
// ========================================

function applyLanguage() {

  document.documentElement.lang =
    state.lang;


  $$(
    "[data-i18n]"
  ).forEach(

    element => {

      element.textContent =
        tr(
          element.dataset.i18n
        );

    }

  );


  $$(
    "[data-i18n-placeholder]"
  ).forEach(

    element => {

      element.placeholder =
        tr(
          element.dataset
            .i18nPlaceholder
        );

    }

  );


  const languageSelect =
    $("#languageSelect");


  if (languageSelect) {

    languageSelect.value =
      state.lang;

  }


  const profileLanguage =
    $("#profileLanguage");


  if (profileLanguage) {

    profileLanguage.value = {

      fr:
        "Français",

      ht:
        "Kreyòl",

      en:
        "English",

      es:
        "Español"

    }[state.lang];

  }


  renderAll();

}


// ========================================
// NAVIGATION
// ========================================

function showPage(name) {

  $$(".page").forEach(

    page => {

      page.classList.toggle(

        "active",

        page.id ===
          `page-${name}`

      );

    }

  );


  $$(".nav-link").forEach(

    button => {

      button.classList.toggle(

        "active",

        button.dataset.page ===
          name

      );

    }

  );


  const sidebar =
    $("#sidebar");


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });

}


// ========================================
// TOAST
// ========================================

function toast(message) {

  const element =
    $("#toast");


  if (!element) return;


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  setTimeout(

    () => {

      element.classList.remove(
        "show"
      );

    },

    2400

  );

}


// ========================================
// MODALES
// ========================================

function openModal(id) {

  const modal =
    $("#" + id);


  if (modal) {

    modal.classList.add(
      "open"
    );

  }

}


function closeModal(id) {

  const modal =
    $("#" + id);


  if (modal) {

    modal.classList.remove(
      "open"
    );

  }

}


// ========================================
// CATÉGORIES
// ========================================

function renderCategories() {

  const grid =
    $("#categoryGrid");


  if (!grid) return;


  grid.innerHTML =
    sports.map(

      ([id, icon, name]) => `

        <button
          class="category ${
            state.sport === id
              ? "active"
              : ""
          }"
          data-sport="${id}"
        >

          <span>
            ${icon}
          </span>

          <strong>
            ${name}
          </strong>

        </button>

      `

    ).join("");


  $$(".category").forEach(

    button => {

      button.onclick =
        () => {

          state.sport =
            button.dataset.sport;


          renderCategories();

          renderEvents();

        };

    }

  );

}


// ========================================
// AFFICHAGE D'UN ÉVÉNEMENT
// ========================================

function eventHTML(event) {

  return `

    <article class="event">

      <div>

        <div class="event-meta">

          <span>
            ${event.league}
          </span>

          <span>
            •
          </span>

          <span>
            ${event.time}
          </span>

        </div>


        <h3>

          ${event.home}

          —

          ${event.away}

        </h3>

      </div>


      <div class="odds">

        ${event.markets.map(

          ([label, odd]) => `

            <button
              class="odd"
              data-event="${event.id}"
              data-label="${label}"
              data-odd="${odd}"
            >

              <small>
                ${label}
              </small>

              <strong>
                ${odd.toFixed(2)}
              </strong>

            </button>

          `

        ).join("")}

      </div>

    </article>

  `;

}


// ========================================
// COTES
// ========================================

function bindOdds() {

  $$(".odd").forEach(

    button => {

      button.onclick =
        () => {

          toggleBet(

            button.dataset.event,

            button.dataset.label,

            Number(
              button.dataset.odd
            )

          );

        };

    }

  );

}


// ========================================
// ÉVÉNEMENTS
// ========================================

function renderEvents() {

  const listElement =
    $("#eventsList");


  if (!listElement) return;


  let list =
    demoEvents.filter(

      event =>
        event.sport ===
        state.sport

    );


  const search =
    (
      $("#eventSearch")?.value ||
      ""
    ).toLowerCase();


  if (search) {

    list =
      list.filter(

        event =>

          (
            event.home +
            " " +
            event.away +
            " " +
            event.league
          )
          .toLowerCase()
          .includes(
            search
          )

      );

  }


  listElement.innerHTML =

    list.length

      ?

      list
        .map(
          eventHTML
        )
        .join("")

      :

      `<p>${tr(
        "emptyTicket"
      )}</p>`;


  bindOdds();

}


// ========================================
// ÉVÉNEMENTS EN VEDETTE
// ========================================

function renderFeatured() {

  const container =
    $("#featuredEvents");


  if (!container) return;


  container.innerHTML =

    demoEvents

      .slice(
        0,
        3
      )

      .map(
        eventHTML
      )

      .join("");


  bindOdds();

}


// ========================================
// AJOUT AU TICKET
// ========================================

function toggleBet(
  eventId,
  label,
  odd
) {

  const event =
    demoEvents.find(

      item =>
        item.id ===
        eventId

    );


  if (!event) return;


  state.bets =
    state.bets.filter(

      bet =>
        bet.eventId !==
        eventId

    );


  state.bets.push({

    eventId,

    label,

    odd,

    title:
      `${event.home} — ${event.away}`

  });


  persist();

  renderAll();

  toast(
    tr(
      "betslip"
    )
  );

}


// ========================================
// TICKET
// ========================================

function renderBets() {

  const box =
    $("#betSelections");


  if (!box) return;


  if (!state.bets.length) {

    box.innerHTML =
      `<p>${tr(
        "emptyTicket"
      )}</p>`;

  }

  else {

    box.innerHTML =

      state.bets.map(

        (bet, index) => `

          <div class="bet-row">

            <div class="bet-row-head">

              <div>

                <strong>

                  ${bet.title}

                </strong>

                <div>

                  ${bet.label}

                  •

                  ${bet.odd.toFixed(2)}

                </div>

              </div>


              <button
                class="remove-bet"
                data-i="${index}"
              >

                ×

              </button>

            </div>

          </div>

        `

      ).join("");

  }


  $$(".remove-bet").forEach(

    button => {

      button.onclick =
        () => {

          state.bets.splice(

            Number(
              button.dataset.i
            ),

            1

          );


          persist();

          renderAll();

        };

    }

  );


  updateBetCalc();

}


// ========================================
// CALCUL DU TICKET
// ========================================

function updateBetCalc() {

  const totalOddsElement =
    $("#totalOdds");


  const potentialReturnElement =
    $("#potentialReturn");


  const stakeInput =
    $("#stakeInput");


  if (
    !totalOddsElement ||
    !potentialReturnElement ||
    !stakeInput
  ) {

    return;

  }


  const odds =
    state.bets.reduce(

      (
        total,
        bet
      ) =>
        total * bet.odd,

      1

    );


  const stake =
    Number(
      stakeInput.value ||
      0
    );


  totalOddsElement.textContent =
    odds.toFixed(2);


  potentialReturnElement.textContent =
    money(
      stake * odds
    );

}


// ========================================
// VALIDATION DU PARI
// ========================================

function placeBet() {

  if (!state.user) {

    toast(
      tr(
        "loginRequired"
      )
    );


    openModal(
      "authModal"
    );


    return;

  }


  if (!state.bets.length) {

    toast(
      tr(
        "emptyTicket"
      )
    );


    return;

  }


  const stake =
    Number(
      $("#stakeInput")?.value ||
      0
    );


  if (stake <= 0) {

    toast(
      tr(
        "invalidAmount"
      )
    );


    return;

  }


  const limit =
    Number(

      localStorage.getItem(
        "mystroparyaj_bet_limit"
      )

      ||

      3000

    );


  if (stake > limit) {

    toast(
      tr(
        "limits"
      )
    );


    return;

  }


  if (
    state.balance <
    stake
  ) {

    toast(
      tr(
        "balance"
      )
    );


    return;

  }


  state.balance -=
    stake;


  state.totalStakes +=
    stake;


  state.history.unshift({

    date:
      new Date()
        .toLocaleString(),

    type:
      "BET",

    details:
      `${state.bets.length} sélection(s)`,

    amount:
      -stake,

    status:
      "OK"

  });


  state.bets =
    [];


  persist();

  renderAll();


  toast(
    tr(
      "betPlaced"
    )
  );

}


// ========================================
// HISTORIQUE
// ========================================

function renderHistory() {

  const body =
    $("#historyBody");


  if (!body) return;


  if (!state.history.length) {

    body.innerHTML = `

      <tr>

        <td colspan="5">

          ${tr(
            "emptyTicket"
          )}

        </td>

      </tr>

    `;


    return;

  }


  body.innerHTML =

    state.history.map(

      item => `

        <tr>

          <td>
            ${item.date}
          </td>

          <td>
            ${item.type}
          </td>

          <td>
            ${item.details}
          </td>

          <td>
            ${money(
              item.amount
            )}
          </td>

          <td>

            <span class="badge">

              ${item.status}

            </span>

          </td>

        </tr>

      `

    ).join("");

}


// ========================================
// STATISTIQUES
// ========================================

function renderStats() {

  const todayBets =
    state.history.filter(

      item =>
        item.type ===
        "BET"

    ).length;


  const transactionCount =
    state.history.length;


  if (
    $("#balanceValue")
  ) {

    $("#balanceValue").textContent =
      money(
        state.balance
      );

  }


  if (
    $("#walletBalance")
  ) {

    $("#walletBalance").textContent =
      money(
        state.balance
      );

  }


  if (
    $("#openBetsValue")
  ) {

    $("#openBetsValue").textContent =
      state.bets.length;

  }


  if (
    $("#todayBetsValue")
  ) {

    $("#todayBetsValue").textContent =
      todayBets;

  }


  if (
    $("#transactionCountValue")
  ) {

    $("#transactionCountValue").textContent =
      transactionCount;

  }


  if (
    $("#adminStakes")
  ) {

    $("#adminStakes").textContent =
      money(
        state.totalStakes
      );

  }


  if (
    $("#adminOpenBets")
  ) {

    $("#adminOpenBets").textContent =
      state.bets.length;

  }


  if (
    $("#adminTransactions")
  ) {

    $("#adminTransactions").textContent =
      transactionCount;

  }


  if (
    $("#stakeCurrency")
  ) {

    $("#stakeCurrency").textContent =
      state.currency;

  }


  if (
    $("#paymentCurrency")
  ) {

    $("#paymentCurrency").textContent =
      state.currency;

  }


  if (
    $("#currencySelect")
  ) {

    $("#currencySelect").value =
      state.currency;

  }


  if (
    $("#profileCurrency")
  ) {

    $("#profileCurrency").value =
      state.currency;

  }


  if (
    $("#profilePhone")
  ) {

    $("#profilePhone").value =
      state.user?.phone ||
      "—";

  }

}


// ========================================
// GRAPHIQUE ACTIVITÉ
// ========================================

function renderChart() {

  const chart =
    $("#barChart");


  if (!chart) return;


  const values =
    [
      35,
      60,
      48,
      80,
      66,
      92,
      74
    ];


  const days =
    [
      "L",
      "M",
      "M",
      "J",
      "V",
      "S",
      "D"
    ];


  chart.innerHTML =

    values.map(

      (
        value,
        index
      ) => `

        <div class="bar-item">

          <div
            class="bar"
            data-value="${value}"
            style="height:${value}%"
          >
          </div>

          <span>

            ${days[index]}

          </span>

        </div>

      `

    ).join("");

}


// ========================================
// RENDU GLOBAL
// ========================================

function renderAll() {

  renderCategories();

  renderEvents();

  renderFeatured();

  renderBets();

  renderHistory();

  renderStats();

  renderChart();

}


// ========================================
// API CLOUDFLARE
// ========================================

async function api(
  path,
  body
) {

  const response =
    await fetch(

      `${WORKER_URL}${path}`,

      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(
            body
          )

      }

    );


  const data =
    await response
      .json()
      .catch(
        () => ({})
      );


  if (
    !response.ok
  ) {

    throw new Error(

      data.error

      ||

      `HTTP ${response.status}`

    );

  }


  return data;

}


// ========================================
// MONCASH / NATCASH
// ========================================

async function paymentSubmit() {

  if (
    !state.user
  ) {

    toast(
      tr(
        "loginRequired"
      )
    );


    openModal(
      "authModal"
    );


    return;

  }


  const amount =
    Number(

      $("#paymentAmount")?.value

      ||

      0

    );


  const phone =
    $("#paymentPhone")
      ?.value
      ?.trim()
      ||
      "";


  if (
    amount <= 0
  ) {

    toast(
      tr(
        "invalidAmount"
      )
    );


    return;

  }


  if (
    $("#paymentStatus")
  ) {

    $("#paymentStatus").textContent =
      tr(
        "paymentPending"
      );

  }


  try {

    const data =
      await api(

        `/api/${state.paymentMode}`,

        {

          provider:
            state.provider,

          amount,

          currency:
            state.currency,

          phone

        }

      );


    if (
      data.redirectUrl
    ) {

      window.location.href =
        data.redirectUrl;


      return;

    }


    if (
      $("#paymentStatus")
    ) {

      $("#paymentStatus").textContent =
        data.message ||
        "OK";

    }

  }

  catch (error) {

    if (
      $("#paymentStatus")
    ) {

      $("#paymentStatus").textContent =
        error.message;


      $("#paymentStatus")
        .className =
        "status error";

    }

  }

}


// ========================================
// CHANGE DE MONNAIE
// ========================================

function calcExchange() {

  const amountInput =
    $("#exchangeAmount");


  const fromInput =
    $("#fromCurrency");


  const toInput =
    $("#toCurrency");


  const resultInput =
    $("#exchangeResult");


  if (
    !amountInput ||
    !fromInput ||
    !toInput ||
    !resultInput
  ) {

    return 0;

  }


  const amount =
    Number(
      amountInput.value ||
      0
    );


  const from =
    fromInput.value;


  const to =
    toInput.value;


  const htg =
    amount *
    rates[from];


  const result =
    htg /
    rates[to];


  resultInput.value =
    result.toFixed(2);


  return result;

}


// ========================================
// MODE DÉPÔT / RETRAIT
// ========================================

function switchPaymentMode(
  mode
) {

  state.paymentMode =
    mode;


  if (
    $("#paymentFormTitle")
  ) {

    $("#paymentFormTitle").textContent =
      tr(
        mode
      );

  }


  if (
    $("#paymentSubmit")
  ) {

    $("#paymentSubmit").textContent =
      tr(
        "continue"
      );

  }

}


// ========================================
// FIREBASE OTP
// ========================================

let confirmationResult =
  null;


async function sendOtp() {

  const phone =
    $("#authPhone")
      ?.value
      ?.trim()
      ||
      "";


  const ageCheck =
    $("#ageCheck");


  if (
    !ageCheck?.checked
  ) {

    if (
      $("#authStatus")
    ) {

      $("#authStatus").textContent =
        tr(
          "ageRequired"
        );

    }


    return;

  }


  if (
    !phone
  ) {

    if (
      $("#authStatus")
    ) {

      $("#authStatus").textContent =
        tr(
          "phone"
        );

    }


    return;

  }


  if (
    !configured
  ) {

    state.user = {

      phone,

      uid:
        "demo-" +
        Date.now()

    };


    persist();


    closeModal(
      "authModal"
    );


    renderStats();


    toast(
      tr(
        "demoOtp"
      )
    );


    return;

  }


  try {

    if (
      !window.recaptchaVerifier
    ) {

      window.recaptchaVerifier =
        new RecaptchaVerifier(

          auth,

          "recaptcha-container",

          {

            size:
              "normal"

          }

        );

    }


    confirmationResult =
      await signInWithPhoneNumber(

        auth,

        phone,

        window.recaptchaVerifier

      );


    if (
      $("#otpArea")
    ) {

      $("#otpArea")
        .classList
        .remove(
          "hidden"
        );

    }


    if (
      $("#authStatus")
    ) {

      $("#authStatus").textContent =
        tr(
          "otpSent"
        );

    }

  }

  catch (error) {

    if (
      $("#authStatus")
    ) {

      $("#authStatus").textContent =
        error.message;

    }

  }

}


// ========================================
// VÉRIFICATION OTP
// ========================================

async function verifyOtp() {

  try {

    const code =
      $("#otpCode")
        ?.value
        ?.trim()
        ||
        "";


    const credential =
      await confirmationResult.confirm(
        code
      );


    state.user = {

      phone:
        credential
          .user
          .phoneNumber,

      uid:
        credential
          .user
          .uid

    };


    persist();


    closeModal(
      "authModal"
    );


    renderStats();


    toast(
      "OK"
    );

  }

  catch (error) {

    if (
      $("#authStatus")
    ) {

      $("#authStatus").textContent =
        error.message;

    }

  }

}


// ========================================
// MENU
// ========================================

if (
  $("#menuBtn")
) {

  $("#menuBtn").onclick =
    () => {

      $("#sidebar")
        ?.classList
        .toggle(
          "open"
        );

    };

}


// ========================================
// NAVIGATION
// ========================================

$$(".nav-link").forEach(

  button => {

    button.onclick =
      () => {

        showPage(
          button.dataset.page
        );

      };

  }

);


$$("[data-go]").forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        showPage(
          button.dataset.go
        );

      }

    );

  }

);


$$("[data-close]").forEach(

  button => {

    button.addEventListener(

      "click",

      () => {

        closeModal(
          button.dataset.close
        );

      }

    );

  }

);


// ========================================
// CONNEXION
// ========================================

if (
  $("#loginBtn")
) {

  $("#loginBtn").onclick =
    () => {

      openModal(
        "authModal"
      );

    };

}


// ========================================
// LIMITES
// ========================================

if (
  $("#limitsBtn")
) {

  $("#limitsBtn").onclick =
    () => {

      openModal(
        "limitsModal"
      );

    };

}


// ========================================
// LANGUE
// ========================================

if (
  $("#languageSelect")
) {

  $("#languageSelect").onchange =
    event => {

      state.lang =
        event.target.value;


      persist();

      applyLanguage();

    };

}


// ========================================
// DEVISE
// ========================================

if (
  $("#currencySelect")
) {

  $("#currencySelect").onchange =
    event => {

      state.currency =
        event.target.value;


      persist();

      renderAll();

    };

}


// ========================================
// RECHERCHE ÉVÉNEMENTS
// ========================================

if (
  $("#eventSearch")
) {

  $("#eventSearch").oninput =
    renderEvents;

}


// ========================================
// MISE
// ========================================

if (
  $("#stakeInput")
) {

  $("#stakeInput").oninput =
    updateBetCalc;

}


// ========================================
// VALIDATION PARI
// ========================================

if (
  $("#placeBetBtn")
) {

  $("#placeBetBtn").onclick =
    placeBet;

}


// ========================================
// DÉPÔT
// ========================================

if (
  $("#depositTabBtn")
) {

  $("#depositTabBtn").onclick =
    () => {

      switchPaymentMode(
        "deposit"
      );

    };

}


// ========================================
// RETRAIT
// ========================================

if (
  $("#withdrawTabBtn")
) {

  $("#withdrawTabBtn").onclick =
    () => {

      switchPaymentMode(
        "withdraw"
      );

    };

}


// ========================================
// CHOIX MONCASH / NATCASH
// ========================================

$$(".payment").forEach(

  button => {

    button.onclick =
      () => {

        $$(".payment").forEach(

          item => {

            item.classList.remove(
              "active"
            );

          }

        );


        button.classList.add(
          "active"
        );


        state.provider =
          button.dataset.provider;

      };

  }

);


// ========================================
// PAIEMENT
// ========================================

if (
  $("#paymentSubmit")
) {

  $("#paymentSubmit").onclick =
    paymentSubmit;

}


// ========================================
// CHANGE
// ========================================

if (
  $("#exchangeAmount")
) {

  $("#exchangeAmount").oninput =
    calcExchange;

}


if (
  $("#fromCurrency")
) {

  $("#fromCurrency").onchange =
    calcExchange;

}


if (
  $("#toCurrency")
) {

  $("#toCurrency").onchange =
    calcExchange;

}


if (
  $("#swapCurrencies")
) {

  $("#swapCurrencies").onclick =
    () => {

      const from =
        $("#fromCurrency");


      const to =
        $("#toCurrency");


      if (
        !from ||
        !to
      ) {

        return;

      }


      const current =
        from.value;


      from.value =
        to.value;


      to.value =
        current;


      calcExchange();

    };

}


if (
  $("#exchangeBtn")
) {

  $("#exchangeBtn").onclick =
    () => {

      calcExchange();


      toast(
        tr(
          "converted"
        )
      );

    };

}


// ========================================
// LIMITES UTILISATEUR
// ========================================

if (
  $("#saveLimitsBtn")
) {

  $("#saveLimitsBtn").onclick =
    () => {

      localStorage.setItem(

        "mystroparyaj_deposit_limit",

        $("#depositLimit")
          ?.value
          ||
          0

      );


      localStorage.setItem(

        "mystroparyaj_bet_limit",

        $("#betLimit")
          ?.value
          ||
          0

      );


      toast(
        tr(
          "saved"
        )
      );

    };

}


// ========================================
// AUTO-EXCLUSION
// ========================================

if (
  $("#selfExcludeBtn")
) {

  $("#selfExcludeBtn").onclick =
    () => {

      localStorage.setItem(

        "mystroparyaj_self_excluded",

        "1"

      );


      toast(
        tr(
          "selfExcluded"
        )
      );

    };

}


// ========================================
// ENVOI OTP
// ========================================

if (
  $("#sendOtpBtn")
) {

  $("#sendOtpBtn").onclick =
    sendOtp;

}


// ========================================
// VÉRIFICATION OTP
// ========================================

if (
  $("#verifyOtpBtn")
) {

  $("#verifyOtpBtn").onclick =
    verifyOtp;

}


// ========================================
// FIREBASE AUTH STATE
// ========================================

if (
  configured &&
  auth
) {

  onAuthStateChanged(

    auth,

    user => {

      if (
        user
      ) {

        state.user = {

          phone:
            user.phoneNumber,

          uid:
            user.uid

        };


        persist();

        renderStats();

      }

    }

  );

}


// ========================================
// DÉMARRAGE
// ========================================

applyLanguage();

calcExchange();

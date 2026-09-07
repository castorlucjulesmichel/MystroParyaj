// =====================================================
// MYSTROPARYAJ - FINAL SCRIPT.JS
// Firebase Auth + Worker API + Multi-language
// =====================================================

import {
  auth,
  db,
  registerWithEmail,
  loginWithEmail,
  resetPassword,
  watchAuth,
  logoutUser
} from "./firebase-config.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// =====================================================
// API
// =====================================================

const API_BASE =
  "https://mystroparyaj-api.castormystro.workers.dev";


// =====================================================
// DOM
// =====================================================

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];


// =====================================================
// STATE
// =====================================================

const state = {
  lang:
    localStorage.getItem("mp_lang") || "ht",

  currency:
    localStorage.getItem("mp_currency") || "HTG",

  user: null,

  profile: null,

  isAdmin: false,

  isAgent: false,

  paymentMode: "deposit",

  provider: "moncash",

  sport: "football",

  selections: [],

  balances: {
    HTG: 0,
    USD: 0,
    EUR: 0,
    CAD: 0,
    DOP: 0
  },

  history: [],

  rates: null
};


// =====================================================
// TRANSLATIONS
// =====================================================

const I18N = {

  ht: {
    home: "Akèy",
    sports: "Espò",
    betslip: "Tikè",
    wallet: "Bous",
    exchange: "Chanj",
    history: "Istwa",
    profile: "Pwofil",
    admin: "Administrasyon",
    agentSpace: "Espas ajan",

    responsible: "Jwe avèk responsabilite.",
    limits: "Limit mwen",

    securePlatform: "Platfòm sekirize",
    heroTitle: "Parye fasil. Swiv tout bagay klè.",
    heroText:
      "15 kategori, plizyè lajan, MonCash, NatCash ak estatistik.",
    startBet: "Gade paryaj",
    manageWallet: "Jere bous la",
    securePlatformText:
      "Paryaj, bous ak peman nan yon sèl aplikasyon.",

    balance: "Balans",
    available: "Disponib",
    openBets: "Paryaj ouvè",
    activeTickets: "Tikè aktif",
    todayBets: "Paryaj jodi a",
    activity: "Aktivite",
    transactions: "Tranzaksyon",

    featured: "Evènman vedèt",
    seeAll: "Wè tout",
    weeklyActivity: "Aktivite semèn",

    chooseEvent:
      "Chwazi yon kategori epi yon paryaj.",
    allEvents: "Tout evènman",
    searchEvent: "Chèche yon evènman",

    betslipHelp:
      "Verifye seleksyon yo anvan ou valide.",
    stake: "Miz",
    totalOdds: "Kòt total",
    potentialReturn: "Retou posib",
    placeBet: "Valide paryaj",

    legalNotice:
      "Operasyon ak lajan reyèl mande otorizasyon legal ak yon backend sekirize.",

    walletText:
      "Depo, retrè ak balans ou.",
    availableBalance: "Balans disponib",
    deposit: "Depo",
    withdraw: "Retrè",
    paymentMethod: "Metòd peman",
    mobileMoney: "Lajan mobil",
    phone: "Nimewo telefòn",
    phonePlaceholder: "+509 XX XX XX XX",
    amount: "Montan",
    continue: "Kontinye",

    exchangeText:
      "Konvèti ant lajan ki disponib.",
    from: "Soti",
    to: "Pou",
    convert: "Konvèti",
    rateNotice:
      "To yo soti nan sèvè MystroParyaj.",

    historyText:
      "Paryaj ak tranzaksyon ou yo.",
    date: "Dat",
    type: "Tip",
    details: "Detay",
    status: "Estati",

    profileText:
      "Kont, sekirite ak jwèt responsab.",
    email: "Adrès e-mail",
    accountType: "Kalite kont",
    language: "Lang",
    mainCurrency: "Lajan prensipal",

    responsibleGaming: "Jwèt responsab",
    dailyDepositLimit: "Limit depo/jou",
    dailyBetLimit: "Limit miz/jou",
    save: "Anrejistre",
    selfExclude: "Oto-ekskli",

    agentSpaceText:
      "Zòn rezève pou ajan MystroParyaj ki valide.",
    agentClients: "Jwè asosye",
    agentCommission: "Komisyon",

    adminText:
      "Jesyon sekirize MystroParyaj.",
    totalStakes: "Total miz",
    users: "Itilizatè",

    loginRegister: "Konekte / Enskri",
    emailAuthText:
      "Konekte oswa kreye kont ou ak e-mail ou.",
    password: "Modpas",
    emailPlaceholder: "egzanp@email.com",
    passwordPlaceholder: "Omwen 6 karaktè",
    playerAccount: "Kont jwè",
    playerAccountText:
      "Pou jwe epi jere bous ou.",
    agentAccount: "Kont ajan",
    agentAccountText:
      "Demann kont ajan an dwe valide.",
    ageConfirm:
      "Mwen konfime mwen gen omwen 18 an.",
    login: "Konekte",
    register: "Kreye kont",
    logout: "Dekonekte",
    forgotPassword: "Ou bliye modpas?",

    limitsInfo:
      "Jere limit jwèt responsab ou yo.",
    manageLimits: "Jere limit yo",

    player: "Kont jwè",
    agentPending: "Demann ajan an ap tann",
    agent: "Kont ajan",

    loginRequired: "Konekte anvan.",
    ageRequired:
      "Ou dwe konfime ou gen omwen 18 an.",
    invalidEmail:
      "Adrès e-mail la pa valab.",
    invalidPassword:
      "Modpas la dwe gen omwen 6 karaktè.",
    accountCreated:
      "Kont lan kreye avèk siksè.",
    agentRequestCreated:
      "Kont lan kreye. Demann ajan an ap tann validasyon.",
    loginSuccess:
      "Ou konekte avèk siksè.",
    resetSent:
      "E-mail pou chanje modpas la voye.",
    invalidCredentials:
      "E-mail oswa modpas la pa kòrèk.",
    emailUsed:
      "E-mail sa a deja gen yon kont.",

    emptyTicket:
      "Pa gen seleksyon nan tikè a.",
    selectionAdded:
      "Seleksyon ajoute nan tikè a.",
    invalidAmount:
      "Montan an pa valab.",
    serverError:
      "Sèvè a pa reponn kòrèkteman.",
    paymentProcessing:
      "Demann nan ap trete...",
    saved: "Anrejistre.",
    excluded:
      "Oto-eksklizyon aktive.",
    noHistory:
      "Pa gen tranzaksyon pou montre."
  },


  fr: {
    home: "Accueil",
    sports: "Sports",
    betslip: "Ticket",
    wallet: "Portefeuille",
    exchange: "Change",
    history: "Historique",
    profile: "Profil",
    admin: "Administration",
    agentSpace: "Espace agent",

    responsible: "Jouez de façon responsable.",
    limits: "Mes limites",

    securePlatform: "Plateforme sécurisée",
    heroTitle:
      "Pariez simplement. Suivez tout clairement.",
    heroText:
      "15 catégories, portefeuille multi-devises, MonCash, NatCash et statistiques.",
    startBet: "Voir les paris",
    manageWallet: "Gérer le portefeuille",
    securePlatformText:
      "Paris, portefeuille et paiements réunis dans une seule application.",

    balance: "Solde",
    available: "Disponible",
    openBets: "Paris ouverts",
    activeTickets: "Tickets actifs",
    todayBets: "Paris du jour",
    activity: "Activité",
    transactions: "Transactions",

    featured: "Événements en vedette",
    seeAll: "Tout voir",
    weeklyActivity: "Activité hebdomadaire",

    chooseEvent:
      "Choisissez une catégorie puis un pari.",
    allEvents: "Tous les événements",
    searchEvent: "Rechercher un événement",

    betslipHelp:
      "Vérifiez vos sélections avant validation.",
    stake: "Mise",
    totalOdds: "Cote totale",
    potentialReturn: "Retour potentiel",
    placeBet: "Valider le pari",

    legalNotice:
      "Les opérations réelles nécessitent une autorisation légale et un serveur sécurisé.",

    walletText:
      "Dépôts, retraits et soldes.",
    availableBalance: "Solde disponible",
    deposit: "Dépôt",
    withdraw: "Retrait",
    paymentMethod: "Méthode de paiement",
    mobileMoney: "Mobile Money",
    phone: "Numéro de téléphone",
    phonePlaceholder: "+509 XX XX XX XX",
    amount: "Montant",
    continue: "Continuer",

    exchangeText:
      "Convertissez entre les devises disponibles.",
    from: "De",
    to: "Vers",
    convert: "Convertir",
    rateNotice:
      "Les taux proviennent du serveur MystroParyaj.",

    historyText:
      "Vos paris et transactions.",
    date: "Date",
    type: "Type",
    details: "Détails",
    status: "Statut",

    profileText:
      "Compte, sécurité et jeu responsable.",
    email: "Adresse e-mail",
    accountType: "Type de compte",
    language: "Langue",
    mainCurrency: "Devise principale",

    responsibleGaming: "Jeu responsable",
    dailyDepositLimit: "Limite dépôt/jour",
    dailyBetLimit: "Limite mises/jour",
    save: "Enregistrer",
    selfExclude: "Auto-exclusion",

    agentSpaceText:
      "Zone réservée aux agents MystroParyaj validés.",
    agentClients: "Joueurs associés",
    agentCommission: "Commission",

    adminText:
      "Gestion sécurisée de MystroParyaj.",
    totalStakes: "Mises totales",
    users: "Utilisateurs",

    loginRegister: "Connexion / Inscription",
    emailAuthText:
      "Connectez-vous ou créez votre compte avec votre e-mail.",
    password: "Mot de passe",
    emailPlaceholder: "exemple@email.com",
    passwordPlaceholder: "Minimum 6 caractères",
    playerAccount: "Compte joueur",
    playerAccountText:
      "Pour jouer et gérer votre portefeuille.",
    agentAccount: "Compte agent",
    agentAccountText:
      "La demande d'agent doit être validée.",
    ageConfirm:
      "Je confirme avoir au moins 18 ans.",
    login: "Connexion",
    register: "Créer un compte",
    logout: "Déconnexion",
    forgotPassword: "Mot de passe oublié ?",

    limitsInfo:
      "Gérez vos limites de jeu responsable.",
    manageLimits: "Gérer les limites",

    player: "Compte joueur",
    agentPending: "Demande agent en attente",
    agent: "Compte agent",

    loginRequired: "Connectez-vous d'abord.",
    ageRequired:
      "Vous devez confirmer avoir au moins 18 ans.",
    invalidEmail: "Adresse e-mail invalide.",
    invalidPassword:
      "Le mot de passe doit contenir au moins 6 caractères.",
    accountCreated: "Compte créé avec succès.",
    agentRequestCreated:
      "Compte créé. La demande agent attend une validation.",
    loginSuccess: "Connexion réussie.",
    resetSent:
      "E-mail de réinitialisation envoyé.",
    invalidCredentials:
      "E-mail ou mot de passe incorrect.",
    emailUsed:
      "Cette adresse e-mail possède déjà un compte.",

    emptyTicket: "Aucune sélection.",
    selectionAdded:
      "Sélection ajoutée au ticket.",
    invalidAmount: "Montant invalide.",
    serverError: "Erreur du serveur.",
    paymentProcessing:
      "Traitement de la demande...",
    saved: "Enregistré.",
    excluded: "Auto-exclusion activée.",
    noHistory: "Aucune transaction."
  },


  en: {
    home: "Home",
    sports: "Sports",
    betslip: "Betslip",
    wallet: "Wallet",
    exchange: "Exchange",
    history: "History",
    profile: "Profile",
    admin: "Administration",
    agentSpace: "Agent area",

    responsible: "Gamble responsibly.",
    limits: "My limits",

    securePlatform: "Secure platform",
    heroTitle: "Bet simply. Track everything clearly.",
    heroText:
      "15 categories, multi-currency wallet, MonCash, NatCash and statistics.",
    startBet: "View bets",
    manageWallet: "Manage wallet",
    securePlatformText:
      "Betting, wallet and payments in one application.",

    balance: "Balance",
    available: "Available",
    openBets: "Open bets",
    activeTickets: "Active tickets",
    todayBets: "Today's bets",
    activity: "Activity",
    transactions: "Transactions",

    featured: "Featured events",
    seeAll: "See all",
    weeklyActivity: "Weekly activity",

    chooseEvent:
      "Choose a category and then a bet.",
    allEvents: "All events",
    searchEvent: "Search event",

    betslipHelp:
      "Review your selections before submitting.",
    stake: "Stake",
    totalOdds: "Total odds",
    potentialReturn: "Potential return",
    placeBet: "Place bet",

    legalNotice:
      "Real-money operations require legal authorization and a secure server.",

    walletText:
      "Deposits, withdrawals and balances.",
    availableBalance: "Available balance",
    deposit: "Deposit",
    withdraw: "Withdraw",
    paymentMethod: "Payment method",
    mobileMoney: "Mobile Money",
    phone: "Phone number",
    phonePlaceholder: "+509 XX XX XX XX",
    amount: "Amount",
    continue: "Continue",

    exchangeText:
      "Convert between available currencies.",
    from: "From",
    to: "To",
    convert: "Convert",
    rateNotice:
      "Rates are retrieved from the MystroParyaj server.",

    historyText:
      "Your bets and transactions.",
    date: "Date",
    type: "Type",
    details: "Details",
    status: "Status",

    profileText:
      "Account, security and responsible gaming.",
    email: "Email address",
    accountType: "Account type",
    language: "Language",
    mainCurrency: "Main currency",

    responsibleGaming: "Responsible gaming",
    dailyDepositLimit: "Daily deposit limit",
    dailyBetLimit: "Daily betting limit",
    save: "Save",
    selfExclude: "Self-exclusion",

    agentSpaceText:
      "Area reserved for approved MystroParyaj agents.",
    agentClients: "Linked players",
    agentCommission: "Commission",

    adminText: "Secure MystroParyaj management.",
    totalStakes: "Total stakes",
    users: "Users",

    loginRegister: "Sign in / Register",
    emailAuthText:
      "Sign in or create your account with email.",
    password: "Password",
    emailPlaceholder: "example@email.com",
    passwordPlaceholder: "Minimum 6 characters",
    playerAccount: "Player account",
    playerAccountText:
      "For betting and managing your wallet.",
    agentAccount: "Agent account",
    agentAccountText:
      "Agent requests require approval.",
    ageConfirm:
      "I confirm that I am at least 18 years old.",
    login: "Sign in",
    register: "Create account",
    logout: "Sign out",
    forgotPassword: "Forgot password?",

    limitsInfo:
      "Manage your responsible gaming limits.",
    manageLimits: "Manage limits",

    player: "Player account",
    agentPending: "Agent request pending",
    agent: "Agent account",

    loginRequired: "Sign in first.",
    ageRequired:
      "You must confirm that you are at least 18.",
    invalidEmail: "Invalid email address.",
    invalidPassword:
      "Password must contain at least 6 characters.",
    accountCreated: "Account created successfully.",
    agentRequestCreated:
      "Account created. Agent request is pending approval.",
    loginSuccess: "Signed in successfully.",
    resetSent: "Password reset email sent.",
    invalidCredentials: "Incorrect email or password.",
    emailUsed:
      "An account already exists with this email.",

    emptyTicket: "No selections.",
    selectionAdded: "Selection added.",
    invalidAmount: "Invalid amount.",
    serverError: "Server error.",
    paymentProcessing: "Processing request...",
    saved: "Saved.",
    excluded: "Self-exclusion enabled.",
    noHistory: "No transactions."
  },


  es: {
    home: "Inicio",
    sports: "Deportes",
    betslip: "Boleto",
    wallet: "Billetera",
    exchange: "Cambio",
    history: "Historial",
    profile: "Perfil",
    admin: "Administración",
    agentSpace: "Área de agente",

    responsible: "Juega responsablemente.",
    limits: "Mis límites",

    securePlatform: "Plataforma segura",
    heroTitle:
      "Apuesta fácilmente. Sigue todo claramente.",
    heroText:
      "15 categorías, billetera multidivisa, MonCash, NatCash y estadísticas.",
    startBet: "Ver apuestas",
    manageWallet: "Gestionar billetera",
    securePlatformText:
      "Apuestas, billetera y pagos en una sola aplicación.",

    balance: "Saldo",
    available: "Disponible",
    openBets: "Apuestas abiertas",
    activeTickets: "Boletos activos",
    todayBets: "Apuestas de hoy",
    activity: "Actividad",
    transactions: "Transacciones",

    featured: "Eventos destacados",
    seeAll: "Ver todo",
    weeklyActivity: "Actividad semanal",

    chooseEvent:
      "Elige una categoría y luego una apuesta.",
    allEvents: "Todos los eventos",
    searchEvent: "Buscar evento",

    betslipHelp:
      "Comprueba tus selecciones antes de validar.",
    stake: "Apuesta",
    totalOdds: "Cuota total",
    potentialReturn: "Retorno potencial",
    placeBet: "Validar apuesta",

    legalNotice:
      "Las operaciones con dinero real requieren autorización legal y un servidor seguro.",

    walletText:
      "Depósitos, retiros y saldos.",
    availableBalance: "Saldo disponible",
    deposit: "Depósito",
    withdraw: "Retiro",
    paymentMethod: "Método de pago",
    mobileMoney: "Dinero móvil",
    phone: "Número de teléfono",
    phonePlaceholder: "+509 XX XX XX XX",
    amount: "Monto",
    continue: "Continuar",

    exchangeText:
      "Convierte entre las monedas disponibles.",
    from: "De",
    to: "A",
    convert: "Convertir",
    rateNotice:
      "Las tasas provienen del servidor MystroParyaj.",

    historyText:
      "Tus apuestas y transacciones.",
    date: "Fecha",
    type: "Tipo",
    details: "Detalles",
    status: "Estado",

    profileText:
      "Cuenta, seguridad y juego responsable.",
    email: "Correo electrónico",
    accountType: "Tipo de cuenta",
    language: "Idioma",
    mainCurrency: "Moneda principal",

    responsibleGaming: "Juego responsable",
    dailyDepositLimit: "Límite diario de depósito",
    dailyBetLimit: "Límite diario de apuestas",
    save: "Guardar",
    selfExclude: "Autoexclusión",

    agentSpaceText:
      "Área reservada para agentes MystroParyaj aprobados.",
    agentClients: "Jugadores asociados",
    agentCommission: "Comisión",

    adminText:
      "Gestión segura de MystroParyaj.",
    totalStakes: "Apuestas totales",
    users: "Usuarios",

    loginRegister: "Iniciar sesión / Registro",
    emailAuthText:
      "Inicia sesión o crea tu cuenta con tu correo electrónico.",
    password: "Contraseña",
    emailPlaceholder: "ejemplo@email.com",
    passwordPlaceholder: "Mínimo 6 caracteres",
    playerAccount: "Cuenta de jugador",
    playerAccountText:
      "Para apostar y gestionar tu billetera.",
    agentAccount: "Cuenta de agente",
    agentAccountText:
      "La solicitud de agente debe ser aprobada.",
    ageConfirm:
      "Confirmo que tengo al menos 18 años.",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    logout: "Cerrar sesión",
    forgotPassword: "¿Olvidaste tu contraseña?",

    limitsInfo:
      "Gestiona tus límites de juego responsable.",
    manageLimits: "Gestionar límites",

    player: "Cuenta de jugador",
    agentPending: "Solicitud de agente pendiente",
    agent: "Cuenta de agente",

    loginRequired: "Inicia sesión primero.",
    ageRequired:
      "Debes confirmar que tienes al menos 18 años.",
    invalidEmail: "Correo electrónico no válido.",
    invalidPassword:
      "La contraseña debe contener al menos 6 caracteres.",
    accountCreated: "Cuenta creada correctamente.",
    agentRequestCreated:
      "Cuenta creada. La solicitud de agente está pendiente.",
    loginSuccess: "Sesión iniciada correctamente.",
    resetSent:
      "Correo de recuperación enviado.",
    invalidCredentials:
      "Correo o contraseña incorrectos.",
    emailUsed:
      "Ya existe una cuenta con este correo.",

    emptyTicket: "No hay selecciones.",
    selectionAdded:
      "Selección añadida al boleto.",
    invalidAmount: "Monto no válido.",
    serverError: "Error del servidor.",
    paymentProcessing:
      "Procesando solicitud...",
    saved: "Guardado.",
    excluded: "Autoexclusión activada.",
    noHistory: "No hay transacciones."
  }

};


// =====================================================
// TRANSLATION HELPER
// =====================================================

function tr(key) {
  return (
    I18N[state.lang]?.[key] ||
    I18N.ht[key] ||
    key
  );
}


// =====================================================
// SPORTS
// =====================================================

const SPORTS = [
  ["football", "⚽", "Football"],
  ["basketball", "🏀", "Basketball"],
  ["baseball", "⚾", "Baseball"],
  ["tennis", "🎾", "Tennis"],
  ["volleyball", "🏐", "Volleyball"],
  ["hockey", "🏒", "Hockey"],
  ["mma", "🥊", "Boxe / MMA"],
  ["horses", "🏇", "Course hippique"],
  ["esports", "🎮", "eSports"],
  ["lottery", "🎰", "Loterie"],
  ["borlette", "🔢", "Borlette"],
  ["virtualfootball", "⚽", "Football virtuel"],
  ["virtualbasketball", "🏀", "Basket virtuel"],
  ["jackpot", "💰", "Jackpot"],
  ["live", "🔴", "Paris Live"]
];


// =====================================================
// DEMO EVENTS
// Do not present as live data.
// =====================================================

const EVENTS = [
  {
    id: "demo-football-1",
    sport: "football",
    league: "Demo League",
    time: "18:30",
    home: "Aquila FC",
    away: "Cap Sud",
    markets: [
      ["1", 1.95],
      ["X", 3.20],
      ["2", 2.70]
    ]
  },

  {
    id: "demo-basket-1",
    sport: "basketball",
    league: "Demo Basket",
    time: "19:15",
    home: "Tigers",
    away: "Stars",
    markets: [
      ["1", 1.72],
      ["2", 2.05]
    ]
  },

  {
    id: "demo-tennis-1",
    sport: "tennis",
    league: "Demo Open",
    time: "17:45",
    home: "Player A",
    away: "Player B",
    markets: [
      ["1", 1.62],
      ["2", 2.22]
    ]
  }
];


// =====================================================
// STORAGE
// =====================================================

function selectionKey() {
  return (
    "mp_bets_" +
    (state.user?.uid || "guest")
  );
}

function loadSelections() {
  try {
    state.selections =
      JSON.parse(
        localStorage.getItem(selectionKey()) ||
        "[]"
      );
  } catch {
    state.selections = [];
  }
}

function saveSelections() {
  localStorage.setItem(
    selectionKey(),
    JSON.stringify(state.selections)
  );
}

function savePreferences() {
  localStorage.setItem("mp_lang", state.lang);
  localStorage.setItem(
    "mp_currency",
    state.currency
  );
}


// =====================================================
// DISPLAY MONEY
// =====================================================

function money(
  amount,
  currency = state.currency
) {
  return (
    Number(amount || 0).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2
      }
    ) +
    " " +
    currency
  );
}


// =====================================================
// TOAST
// =====================================================

let toastTimer = null;

function toast(message) {
  const el = $("#toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {
      el.classList.remove("show");
    }, 2600);
}


// =====================================================
// MODALS
// =====================================================

function openModal(id) {
  $("#" + id)?.classList.add("open");
}

function closeModal(id) {
  $("#" + id)?.classList.remove("open");
}


// =====================================================
// SIDEBAR
// =====================================================

function openSidebar() {
  $("#sidebar")?.classList.add("open");
  $("#sidebarOverlay")?.classList.add("open");

  $("#menuBtn")?.setAttribute(
    "aria-expanded",
    "true"
  );
}

function closeSidebar() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarOverlay")?.classList.remove("open");

  $("#menuBtn")?.setAttribute(
    "aria-expanded",
    "false"
  );
}


// =====================================================
// NAVIGATION
// =====================================================

function showPage(pageName) {

  if (
    pageName === "admin" &&
    !state.isAdmin
  ) {
    return;
  }

  if (
    pageName === "agent" &&
    !state.isAgent
  ) {
    return;
  }

  $$(".page").forEach(page => {
    page.classList.toggle(
      "active",
      page.id === `page-${pageName}`
    );
  });

  $$(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  closeSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =====================================================
// LANGUAGE
// =====================================================

function applyLanguage() {

  document.documentElement.lang =
    state.lang;

  $$("[data-i18n]").forEach(el => {
    el.textContent =
      tr(el.dataset.i18n);
  });

  $$("[data-i18n-placeholder]")
    .forEach(el => {
      el.placeholder =
        tr(
          el.dataset.i18nPlaceholder
        );
    });

  if ($("#languageSelect")) {
    $("#languageSelect").value =
      state.lang;
  }

  if ($("#profileLanguage")) {

    const labels = {
      ht: "Kreyòl",
      fr: "Français",
      en: "English",
      es: "Español"
    };

    $("#profileLanguage").value =
      labels[state.lang];
  }

  renderEverything();
}


// =====================================================
// FIREBASE ERROR
// =====================================================

function firebaseError(error) {

  const code =
    error?.code || "";

  if (
    code.includes("email-already-in-use")
  ) {
    return tr("emailUsed");
  }

  if (
    code.includes("invalid-email")
  ) {
    return tr("invalidEmail");
  }

  if (
    code.includes("weak-password")
  ) {
    return tr("invalidPassword");
  }

  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found")
  ) {
    return tr("invalidCredentials");
  }

  return (
    error?.message ||
    tr("serverError")
  );
}


// =====================================================
// REGISTRATION
// =====================================================

async function registerUser() {

  const email =
    $("#authEmail")?.value.trim() || "";

  const password =
    $("#authPassword")?.value || "";

  const ageAccepted =
    $("#ageCheck")?.checked === true;

  const accountChoice =
    document.querySelector(
      'input[name="accountType"]:checked'
    )?.value || "player";

  const status =
    $("#authStatus");

  if (!ageAccepted) {
    status.textContent =
      tr("ageRequired");

    status.className =
      "status error";

    return;
  }

  if (!email.includes("@")) {
    status.textContent =
      tr("invalidEmail");

    status.className =
      "status error";

    return;
  }

  if (password.length < 6) {
    status.textContent =
      tr("invalidPassword");

    status.className =
      "status error";

    return;
  }

  const button =
    $("#emailRegisterBtn");

  try {

    button.disabled = true;

    await registerWithEmail(
      email,
      password,
      accountChoice
    );

    status.textContent =
      accountChoice === "agent"
        ? tr("agentRequestCreated")
        : tr("accountCreated");

    status.className =
      "status success";

  } catch (error) {

    status.textContent =
      firebaseError(error);

    status.className =
      "status error";

  } finally {

    button.disabled = false;
  }
}


// =====================================================
// LOGIN
// =====================================================

async function loginUser() {

  const email =
    $("#authEmail")?.value.trim() || "";

  const password =
    $("#authPassword")?.value || "";

  const status =
    $("#authStatus");

  if (!email.includes("@")) {
    status.textContent =
      tr("invalidEmail");

    status.className =
      "status error";

    return;
  }

  if (password.length < 6) {
    status.textContent =
      tr("invalidPassword");

    status.className =
      "status error";

    return;
  }

  try {

    $("#emailLoginBtn").disabled =
      true;

    await loginWithEmail(
      email,
      password
    );

    status.textContent =
      tr("loginSuccess");

    status.className =
      "status success";

    setTimeout(() => {
      closeModal("authModal");
    }, 600);

  } catch (error) {

    status.textContent =
      firebaseError(error);

    status.className =
      "status error";

  } finally {

    $("#emailLoginBtn").disabled =
      false;
  }
}


// =====================================================
// PASSWORD RESET
// =====================================================

async function forgotPassword() {

  const email =
    $("#authEmail")?.value.trim() || "";

  const status =
    $("#authStatus");

  if (!email.includes("@")) {
    status.textContent =
      tr("invalidEmail");

    status.className =
      "status error";

    return;
  }

  try {

    await resetPassword(email);

    status.textContent =
      tr("resetSent");

    status.className =
      "status success";

  } catch (error) {

    status.textContent =
      firebaseError(error);

    status.className =
      "status error";
  }
}


// =====================================================
// PROFILE
// =====================================================

async function loadProfile() {

  state.profile = null;

  if (!state.user) {
    return;
  }

  try {

    const snap =
      await getDoc(
        doc(
          db,
          "users",
          state.user.uid
        )
      );

    if (snap.exists()) {
      state.profile =
        snap.data();
    }

  } catch (error) {
    console.error(error);
  }
}


// =====================================================
// CUSTOM CLAIMS
// =====================================================

async function loadPermissions(user) {

  state.isAdmin = false;
  state.isAgent = false;

  if (user) {

    try {

      const tokenResult =
        await user.getIdTokenResult(
          true
        );

      state.isAdmin =
        tokenResult.claims.admin === true;

      state.isAgent =
        tokenResult.claims.agent === true;

    } catch (error) {
      console.error(error);
    }
  }

  $$(".admin-only").forEach(el => {
    el.hidden =
      !state.isAdmin;
  });

  $$(".agent-only").forEach(el => {
    el.hidden =
      !state.isAgent;
  });
}


// =====================================================
// AUTH DISPLAY
// =====================================================

function updateProfileUI() {

  if ($("#profileEmail")) {
    $("#profileEmail").value =
      state.user?.email || "—";
  }

  if ($("#profileCurrency")) {
    $("#profileCurrency").value =
      state.currency;
  }

  if ($("#profileAccountType")) {

    let accountLabel =
      tr("player");

    if (state.isAgent) {
      accountLabel =
        tr("agent");
    }

    else if (
      state.profile?.requestedAccountType ===
        "agent" &&
      state.profile?.agentRequestStatus ===
        "pending"
    ) {
      accountLabel =
        tr("agentPending");
    }

    $("#profileAccountType").value =
      accountLabel;
  }

  $("#logoutBtn")?.classList.toggle(
    "hidden",
    !state.user
  );
}


// =====================================================
// AUTH WATCHER
// =====================================================

watchAuth(async user => {

  state.user =
    user || null;

  await loadPermissions(user);
  await loadProfile();

  loadSelections();

  updateProfileUI();
  renderEverything();
});


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

  await logoutUser();

  state.user = null;
  state.profile = null;

  state.isAdmin = false;
  state.isAgent = false;

  state.history = [];

  loadSelections();

  showPage("home");
  renderEverything();
}


// =====================================================
// API FETCH
// =====================================================

async function apiFetch(
  path,
  options = {}
) {

  let token = "";

  if (auth.currentUser) {
    token =
      await auth.currentUser
        .getIdToken();
  }

  const response =
    await fetch(
      API_BASE + path,
      {
        method:
          options.method || "GET",

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`
              }
            : {})
        },

        body:
          options.body
            ? JSON.stringify(
                options.body
              )
            : undefined
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      `HTTP ${response.status}`
    );
  }

  return data;
}


// =====================================================
// RATES
// =====================================================

async function loadRates() {

  try {

    const data =
      await apiFetch(
        "/api/rates?base=USD"
      );

    if (data.rates) {
      state.rates =
        data.rates;

      calculateExchange();
    }

  } catch (error) {
    console.error(
      "Rates:",
      error
    );
  }
}


// =====================================================
// EXCHANGE CALC
// =====================================================

function calculateExchange() {

  const amount =
    Number(
      $("#exchangeAmount")
        ?.value || 0
    );

  const from =
    $("#fromCurrency")?.value;

  const to =
    $("#toCurrency")?.value;

  if (
    !state.rates ||
    !from ||
    !to ||
    !$("#exchangeResult")
  ) {
    return;
  }

  const fromRate =
    state.rates[from];

  const toRate =
    state.rates[to];

  if (
    !fromRate ||
    !toRate
  ) {
    return;
  }

  const amountUSD =
    amount / fromRate;

  const result =
    amountUSD * toRate;

  $("#exchangeResult").value =
    result.toFixed(2);
}


// =====================================================
// CATEGORIES
// =====================================================

function renderCategories() {

  const grid =
    $("#categoryGrid");

  if (!grid) return;

  grid.innerHTML =
    SPORTS.map(
      ([id, icon, label]) => `
        <button
          type="button"
          class="category ${
            state.sport === id
              ? "active"
              : ""
          }"
          data-sport="${id}"
        >
          <span>${icon}</span>
          <strong>${label}</strong>
        </button>
      `
    ).join("");

  $$(".category").forEach(button => {

    button.onclick =
      () => {

        state.sport =
          button.dataset.sport;

        renderCategories();
        renderEvents();
      };
  });
}


// =====================================================
// EVENT CARD
// =====================================================

function eventHtml(event) {

  return `
    <article class="event">

      <div>

        <div class="event-meta">
          ${event.league}
          •
          ${event.time}
        </div>

        <h3>
          ${event.home}
          —
          ${event.away}
        </h3>

      </div>

      <div class="odds">

        ${event.markets.map(
          ([label, odd]) => {

            const selected =
              state.selections.some(
                item =>
                  item.eventId ===
                    event.id &&
                  item.label ===
                    label
              );

            return `
              <button
                type="button"
                class="odd ${
                  selected
                    ? "selected"
                    : ""
                }"
                data-event="${event.id}"
                data-label="${label}"
                data-odd="${odd}"
              >
                <small>${label}</small>
                <strong>
                  ${odd.toFixed(2)}
                </strong>
              </button>
            `;
          }
        ).join("")}

      </div>

    </article>
  `;
}


// =====================================================
// ODDS EVENTS
// =====================================================

function bindOdds() {

  $$(".odd").forEach(button => {

    button.onclick =
      () => {

        const event =
          EVENTS.find(
            e =>
              e.id ===
              button.dataset.event
          );

        if (!event) return;

        state.selections =
          state.selections.filter(
            item =>
              item.eventId !==
              event.id
          );

        state.selections.push({
          eventId: event.id,
          label:
            button.dataset.label,
          odd:
            Number(
              button.dataset.odd
            ),
          title:
            `${event.home} — ${event.away}`
        });

        saveSelections();

        renderEverything();

        toast(
          tr("selectionAdded")
        );
      };
  });
}


// =====================================================
// EVENTS
// =====================================================

function renderEvents() {

  const box =
    $("#eventsList");

  if (!box) return;

  let list =
    EVENTS.filter(
      e =>
        e.sport ===
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
        e =>
          (
            e.home +
            " " +
            e.away +
            " " +
            e.league
          )
            .toLowerCase()
            .includes(search)
      );
  }

  box.innerHTML =
    list.length
      ? list
          .map(eventHtml)
          .join("")
      : `<p>—</p>`;

  bindOdds();
}


// =====================================================
// FEATURED
// =====================================================

function renderFeatured() {

  const box =
    $("#featuredEvents");

  if (!box) return;

  box.innerHTML =
    EVENTS.slice(0, 3)
      .map(eventHtml)
      .join("");

  bindOdds();
}


// =====================================================
// BETSLIP
// =====================================================

function renderBetslip() {

  const box =
    $("#betSelections");

  if (!box) return;

  if (!state.selections.length) {
    box.innerHTML =
      `<p>${tr("emptyTicket")}</p>`;
  } else {

    box.innerHTML =
      state.selections.map(
        (item, index) => `
          <div class="bet-row">

            <strong>
              ${item.title}
            </strong>

            <p>
              ${item.label}
              •
              ${Number(
                item.odd
              ).toFixed(2)}
            </p>

            <button
              type="button"
              class="remove-bet"
              data-index="${index}"
            >
              ×
            </button>

          </div>
        `
      ).join("");
  }

  $$(".remove-bet")
    .forEach(button => {

      button.onclick =
        () => {

          state.selections.splice(
            Number(
              button.dataset.index
            ),
            1
          );

          saveSelections();

          renderEverything();
        };
    });

  updateBetCalculation();
}


// =====================================================
// BET CALCULATION
// =====================================================

function updateBetCalculation() {

  const odds =
    state.selections.reduce(
      (total, item) =>
        total *
        Number(item.odd),
      1
    );

  const stake =
    Number(
      $("#stakeInput")
        ?.value || 0
    );

  if ($("#totalOdds")) {
    $("#totalOdds").textContent =
      odds.toFixed(2);
  }

  if ($("#potentialReturn")) {
    $("#potentialReturn").textContent =
      money(stake * odds);
  }
}


// =====================================================
// PLACE BET
// =====================================================

async function placeBet() {

  if (!state.user) {
    openModal("authModal");
    toast(tr("loginRequired"));
    return;
  }

  if (!state.selections.length) {
    toast(tr("emptyTicket"));
    return;
  }

  const stake =
    Number(
      $("#stakeInput")?.value
    );

  if (
    !Number.isFinite(stake) ||
    stake <= 0
  ) {
    toast(tr("invalidAmount"));
    return;
  }

  try {

    $("#placeBetBtn").disabled =
      true;

    const response =
      await apiFetch(
        "/api/bet",
        {
          method: "POST",

          body: {
            stake,
            currency:
              state.currency,

            selections:
              state.selections.map(
                item => ({
                  eventId:
                    item.eventId,

                  market:
                    item.label,

                  odd:
                    item.odd
                })
              )
          }
        }
      );

    state.selections = [];
    saveSelections();

    renderEverything();

    toast(
      response.message ||
      "OK"
    );

  } catch (error) {

    toast(error.message);

  } finally {

    $("#placeBetBtn").disabled =
      false;
  }
}


// =====================================================
// PAYMENT
// =====================================================

async function submitPayment() {

  if (!state.user) {
    openModal("authModal");
    toast(tr("loginRequired"));
    return;
  }

  const amount =
    Number(
      $("#paymentAmount")?.value
    );

  const phone =
    $("#paymentPhone")
      ?.value.trim() || "";

  const status =
    $("#paymentStatus");

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    status.textContent =
      tr("invalidAmount");

    status.className =
      "status error";

    return;
  }

  try {

    status.textContent =
      tr("paymentProcessing");

    status.className =
      "status";

    const result =
      await apiFetch(
        `/api/${state.paymentMode}`,
        {
          method: "POST",

          body: {
            provider:
              state.provider,

            amount,

            currency:
              state.currency,

            phone
          }
        }
      );

    if (result.redirectUrl) {
      window.location.href =
        result.redirectUrl;

      return;
    }

    status.textContent =
      result.message || "OK";

    status.className =
      "status success";

  } catch (error) {

    status.textContent =
      error.message;

    status.className =
      "status error";
  }
}


// =====================================================
// BALANCE DISPLAY
// =====================================================

function renderBalances() {

  const amount =
    state.balances[
      state.currency
    ] || 0;

  $("#balanceValue") &&
    ($("#balanceValue").textContent =
      money(amount));

  $("#walletBalance") &&
    ($("#walletBalance").textContent =
      money(amount));

  $("#stakeCurrency") &&
    ($("#stakeCurrency").textContent =
      state.currency);

  $("#paymentCurrency") &&
    ($("#paymentCurrency").textContent =
      state.currency);

  $("#profileCurrency") &&
    ($("#profileCurrency").value =
      state.currency);

  $("#currencySelect") &&
    ($("#currencySelect").value =
      state.currency);

  $("#openBetsValue") &&
    ($("#openBetsValue").textContent =
      state.selections.length);

  $("#todayBetsValue") &&
    ($("#todayBetsValue").textContent =
      "0");

  $("#transactionCountValue") &&
    ($("#transactionCountValue")
      .textContent =
      state.history.length);
}


// =====================================================
// HISTORY
// =====================================================

function renderHistory() {

  const body =
    $("#historyBody");

  if (!body) return;

  if (!state.history.length) {

    body.innerHTML = `
      <tr>
        <td colspan="5">
          ${tr("noHistory")}
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    state.history.map(
      item => `
        <tr>
          <td>${item.date}</td>
          <td>${item.type}</td>
          <td>${item.details}</td>
          <td>
            ${money(
              item.amount,
              item.currency
            )}
          </td>
          <td>${item.status}</td>
        </tr>
      `
    ).join("");
}


// =====================================================
// CHART
// =====================================================

function renderChart() {

  const chart =
    $("#barChart");

  if (!chart) return;

  const values =
    [28, 45, 35, 62, 53, 75, 68];

  chart.innerHTML =
    values.map(
      (value, index) => `
        <div class="bar-item">
          <div
            class="bar"
            style="height:${value}%"
          ></div>
          <span>
            ${index + 1}
          </span>
        </div>
      `
    ).join("");
}


// =====================================================
// ALL RENDER
// =====================================================

function renderEverything() {

  renderCategories();
  renderEvents();
  renderFeatured();
  renderBetslip();
  renderBalances();
  renderHistory();
  renderChart();

  updateProfileUI();
}


// =====================================================
// GENERAL EVENTS
// =====================================================

$("#menuBtn")?.addEventListener(
  "click",
  () => {

    if (
      $("#sidebar")
        ?.classList
        .contains("open")
    ) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
);


$("#sidebarOverlay")
  ?.addEventListener(
    "click",
    closeSidebar
  );


$$(".nav-link").forEach(button => {

  button.addEventListener(
    "click",
    () => {
      showPage(
        button.dataset.page
      );
    }
  );
});


$$("[data-go]").forEach(button => {

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();

      showPage(
        button.dataset.go
      );
    }
  );
});


$$("[data-close]").forEach(button => {

  button.addEventListener(
    "click",
    () => {

      closeModal(
        button.dataset.close
      );
    }
  );
});


$("#loginBtn")?.addEventListener(
  "click",
  () => {

    if (state.user) {
      showPage("profile");
    } else {
      openModal("authModal");
    }
  }
);


$("#emailRegisterBtn")
  ?.addEventListener(
    "click",
    registerUser
  );


$("#emailLoginBtn")
  ?.addEventListener(
    "click",
    loginUser
  );


$("#forgotPasswordBtn")
  ?.addEventListener(
    "click",
    forgotPassword
  );


$("#logoutBtn")?.addEventListener(
  "click",
  logout
);


$("#languageSelect")
  ?.addEventListener(
    "change",
    event => {

      state.lang =
        event.target.value;

      savePreferences();
      applyLanguage();
    }
  );


$("#currencySelect")
  ?.addEventListener(
    "change",
    event => {

      state.currency =
        event.target.value;

      savePreferences();
      renderEverything();
    }
  );


$("#eventSearch")
  ?.addEventListener(
    "input",
    renderEvents
  );


$("#stakeInput")
  ?.addEventListener(
    "input",
    updateBetCalculation
  );


$("#placeBetBtn")
  ?.addEventListener(
    "click",
    placeBet
  );


$("#depositTabBtn")
  ?.addEventListener(
    "click",
    () => {

      state.paymentMode =
        "deposit";

      $("#paymentFormTitle").textContent =
        tr("deposit");
    }
  );


$("#withdrawTabBtn")
  ?.addEventListener(
    "click",
    () => {

      state.paymentMode =
        "withdraw";

      $("#paymentFormTitle").textContent =
        tr("withdraw");
    }
  );


$$(".payment").forEach(button => {

  button.addEventListener(
    "click",
    () => {

      $$(".payment")
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );

      button.classList.add(
        "active"
      );

      state.provider =
        button.dataset.provider;
    }
  );
});


$("#paymentSubmit")
  ?.addEventListener(
    "click",
    submitPayment
  );


$("#exchangeAmount")
  ?.addEventListener(
    "input",
    calculateExchange
  );


$("#fromCurrency")
  ?.addEventListener(
    "change",
    calculateExchange
  );


$("#toCurrency")
  ?.addEventListener(
    "change",
    calculateExchange
  );


$("#swapCurrencies")
  ?.addEventListener(
    "click",
    () => {

      const from =
        $("#fromCurrency");

      const to =
        $("#toCurrency");

      const old =
        from.value;

      from.value =
        to.value;

      to.value =
        old;

      calculateExchange();
    }
  );


$("#exchangeBtn")
  ?.addEventListener(
    "click",
    calculateExchange
  );


$("#limitsBtn")
  ?.addEventListener(
    "click",
    () =>
      openModal("limitsModal")
  );


$("#saveLimitsBtn")
  ?.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "mp_deposit_limit",
        $("#depositLimit")?.value ||
          "0"
      );

      localStorage.setItem(
        "mp_bet_limit",
        $("#betLimit")?.value ||
          "0"
      );

      toast(tr("saved"));
    }
  );


$("#selfExcludeBtn")
  ?.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "mp_self_excluded",
        "1"
      );

      toast(tr("excluded"));
    }
  );


// =====================================================
// START
// =====================================================

$("#languageSelect").value =
  state.lang;

$("#currencySelect").value =
  state.currency;

loadSelections();

applyLanguage();

loadRates();

renderEverything();

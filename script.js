// ======================================================
// MYSTROPARYAJ - SCRIPT.JS
// Firebase Auth + Interface + Worker API
// ======================================================

import {
  auth,
  db,
  sendPhoneCode,
  verifyPhoneCode,
  watchAuth,
  logoutUser
} from "./firebase-config.js";


// ======================================================
// CONFIGURATION
// ======================================================

const DEFAULT_WORKER_URL = "https://VOTRE-WORKER.workers.dev";

const WORKER_URL =
  localStorage.getItem("MYSTROPARYAJ_WORKER_URL") ||
  DEFAULT_WORKER_URL;


// ======================================================
// OUTILS DOM
// ======================================================

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


// ======================================================
// ETAT APPLICATION
// ======================================================

const state = {
  lang:
    localStorage.getItem("mystroparyaj_lang") ||
    "fr",

  currency:
    localStorage.getItem("mystroparyaj_currency") ||
    "HTG",

  user: null,

  isAdmin: false,

  provider: "moncash",

  paymentMode: "deposit",

  sport: "football",

  selections: [],

  balance: 0,

  history: []
};


// ======================================================
// TRADUCTIONS
// ======================================================

const T = {

  fr: {
    tagline: "Paris sportifs & portefeuille",
    home: "Accueil",
    sports: "Sports",
    betslip: "Ticket",
    wallet: "Portefeuille",
    exchange: "Change",
    history: "Historique",
    profile: "Profil",
    admin: "Administration",
    responsible: "Jouez de façon responsable.",
    limits: "Mes limites",
    login: "Connexion",
    logout: "Déconnexion",

    livePlatform: "Plateforme sécurisée",

    heroTitle:
      "Pariez simplement. Suivez tout clairement.",

    heroText:
      "15 catégories, portefeuille multi-devises, MonCash, NatCash et statistiques.",

    startBet: "Voir les paris",
    manageWallet: "Gérer le portefeuille",

    securePlatform: "Plateforme sécurisée",

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

    demoWarning:
      "Les opérations réelles nécessitent une activation légale et serveur sécurisée.",

    walletText: "Dépôts, retraits et soldes.",
    availableBalance: "Solde disponible",

    deposit: "Dépôt",
    withdraw: "Retrait",

    paymentMethod: "Méthode de paiement",
    mobileMoney: "Mobile Money",

    phone: "Numéro de téléphone",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount: "Montant",
    continue: "Continuer",

    exchangeText:
      "Convertissez entre les devises disponibles.",

    from: "De",
    to: "Vers",
    convert: "Convertir",

    rateNotice:
      "Les taux doivent être récupérés depuis une source fiable côté serveur.",

    historyText:
      "Vos paris et mouvements de portefeuille.",

    date: "Date",
    type: "Type",
    details: "Détails",
    status: "Statut",

    profileText:
      "Compte, sécurité et jeu responsable.",

    language: "Langue",
    mainCurrency: "Devise principale",

    responsibleGaming:
      "Jeu responsable",

    dailyDepositLimit:
      "Limite dépôt/jour",

    dailyBetLimit:
      "Limite mises/jour",

    save: "Enregistrer",

    selfExclude:
      "Auto-exclusion",

    adminText:
      "Gestion sécurisée des opérations.",

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
      "Définissez des limites de jeu.",

    manageLimits:
      "Gérer les limites",

    emptyTicket:
      "Aucune sélection pour le moment.",

    loginRequired:
      "Connectez-vous d'abord.",

    ageRequired:
      "Vous devez confirmer avoir au moins 18 ans.",

    otpSent:
      "Le code SMS a été envoyé.",

    otpVerified:
      "Connexion réussie.",

    paymentPending:
      "Traitement de la demande…",

    invalidAmount:
      "Montant invalide.",

    converted:
      "Conversion calculée.",

    saved:
      "Enregistré.",

    selfExcluded:
      "Auto-exclusion activée.",

    serverNotConfigured:
      "L'adresse du serveur MystroParyaj n'est pas encore configurée.",

    authError:
      "Impossible de vous connecter.",

    invalidPhone:
      "Entrez un numéro complet, par exemple +509XXXXXXXX.",

    selectBet:
      "Sélection ajoutée au ticket.",

    betSending:
      "Validation du pari…",

    betAccepted:
      "Pari envoyé au serveur.",

    noBalance:
      "Solde insuffisant."
  },


  ht: {
    tagline: "Pari espòtif & bous",
    home: "Akèy",
    sports: "Espò",
    betslip: "Tikè",
    wallet: "Bous",
    exchange: "Chanj",
    history: "Istwa",
    profile: "Pwofil",
    admin: "Administrasyon",
    responsible: "Jwe avèk responsabilite.",
    limits: "Limit mwen",
    login: "Konekte",
    logout: "Dekonekte",

    livePlatform: "Platfòm sekirize",

    heroTitle:
      "Parye fasil. Swiv tout bagay klè.",

    heroText:
      "15 kategori, plizyè lajan, MonCash, NatCash ak estatistik.",

    startBet: "Gade paryaj",
    manageWallet: "Jere bous la",

    securePlatform:
      "Platfòm sekirize",

    securePlatformText:
      "Paryaj, bous ak peman ansanm nan yon sèl aplikasyon.",

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

    demoWarning:
      "Operasyon ak lajan reyèl mande aktivasyon legal ak yon sèvè sekirize.",

    walletText:
      "Depo, retrè ak balans.",

    availableBalance:
      "Balans disponib",

    deposit: "Depo",
    withdraw: "Retrè",

    paymentMethod:
      "Metòd peman",

    mobileMoney:
      "Lajan mobil",

    phone:
      "Nimewo telefòn",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount: "Montan",
    continue: "Kontinye",

    exchangeText:
      "Konvèti ant lajan ki disponib.",

    from: "Soti",
    to: "Pou",
    convert: "Konvèti",

    rateNotice:
      "To yo dwe soti nan yon sous serye sou sèvè a.",

    historyText:
      "Paryaj ak mouvman bous ou.",

    date: "Dat",
    type: "Tip",
    details: "Detay",
    status: "Estati",

    profileText:
      "Kont, sekirite ak jwèt responsab.",

    language: "Lang",
    mainCurrency: "Lajan prensipal",

    responsibleGaming:
      "Jwèt responsab",

    dailyDepositLimit:
      "Limit depo/jou",

    dailyBetLimit:
      "Limit miz/jou",

    save: "Anrejistre",

    selfExclude:
      "Oto-ekskli",

    adminText:
      "Jesyon sekirize operasyon yo.",

    totalStakes:
      "Total miz",

    users:
      "Itilizatè",

    systemControl:
      "Kontwòl sistèm",

    systemControlText:
      "Kalkil finansye sansib yo fèt sou sèvè a epi yo pa vizib pou itilizatè yo.",

    loginRegister:
      "Konekte / Enskri",

    otpText:
      "Antre nimewo ou epi kòd SMS ou resevwa.",

    ageConfirm:
      "Mwen konfime mwen gen omwen 18 an.",

    sendCode:
      "Voye kòd",

    code: "Kòd",
    verify: "Verifye",

    limitsInfo:
      "Defini limit jwèt ou.",

    manageLimits:
      "Jere limit yo",

    emptyTicket:
      "Pa gen okenn seleksyon kounye a.",

    loginRequired:
      "Konekte anvan.",

    ageRequired:
      "Ou dwe konfime ou gen omwen 18 an.",

    otpSent:
      "Kòd SMS la voye.",

    otpVerified:
      "Ou konekte avèk siksè.",

    paymentPending:
      "Demann nan ap trete…",

    invalidAmount:
      "Montan an pa valab.",

    converted:
      "Konvèsyon kalkile.",

    saved:
      "Anrejistre.",

    selfExcluded:
      "Oto-eksklizyon aktive.",

    serverNotConfigured:
      "Adrès sèvè MystroParyaj la poko konfigire.",

    authError:
      "Koneksyon an echwe.",

    invalidPhone:
      "Antre nimewo konplè a, pa egzanp +509XXXXXXXX.",

    selectBet:
      "Seleksyon ajoute nan tikè a.",

    betSending:
      "Paryaj la ap valide…",

    betAccepted:
      "Paryaj la voye sou sèvè a.",

    noBalance:
      "Balans pa sifi."
  },


  en: {
    tagline: "Sports betting & wallet",
    home: "Home",
    sports: "Sports",
    betslip: "Betslip",
    wallet: "Wallet",
    exchange: "Exchange",
    history: "History",
    profile: "Profile",
    admin: "Administration",
    responsible: "Gamble responsibly.",
    limits: "My limits",
    login: "Sign in",
    logout: "Sign out",

    livePlatform: "Secure platform",

    heroTitle:
      "Bet simply. Track everything clearly.",

    heroText:
      "15 categories, multi-currency wallet, MonCash, NatCash and statistics.",

    startBet: "View bets",
    manageWallet: "Manage wallet",

    securePlatform: "Secure platform",

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
      "Choose a category and a bet.",

    allEvents: "All events",
    searchEvent: "Search event",

    betslipHelp:
      "Review your selections before submitting.",

    stake: "Stake",
    totalOdds: "Total odds",
    potentialReturn: "Potential return",
    placeBet: "Place bet",

    demoWarning:
      "Real-money operations require legal activation and a secure server.",

    walletText:
      "Deposits, withdrawals and balances.",

    availableBalance:
      "Available balance",

    deposit: "Deposit",
    withdraw: "Withdraw",

    paymentMethod:
      "Payment method",

    mobileMoney:
      "Mobile Money",

    phone:
      "Phone number",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount: "Amount",
    continue: "Continue",

    exchangeText:
      "Convert between available currencies.",

    from: "From",
    to: "To",
    convert: "Convert",

    rateNotice:
      "Rates must come from a trusted server-side source.",

    historyText:
      "Your bets and wallet movements.",

    date: "Date",
    type: "Type",
    details: "Details",
    status: "Status",

    profileText:
      "Account, security and responsible gaming.",

    language: "Language",
    mainCurrency: "Main currency",

    responsibleGaming:
      "Responsible gaming",

    dailyDepositLimit:
      "Daily deposit limit",

    dailyBetLimit:
      "Daily bet limit",

    save: "Save",
    selfExclude: "Self-exclude",

    adminText:
      "Secure operations management.",

    totalStakes:
      "Total stakes",

    users: "Users",

    systemControl:
      "System control",

    systemControlText:
      "Sensitive financial calculations are performed on the server and are not shown to users.",

    loginRegister:
      "Sign in / Register",

    otpText:
      "Enter your number and the SMS code received.",

    ageConfirm:
      "I confirm I am at least 18 years old.",

    sendCode:
      "Send code",

    code: "Code",
    verify: "Verify",

    limitsInfo:
      "Set your gaming limits.",

    manageLimits:
      "Manage limits",

    emptyTicket:
      "No selections yet.",

    loginRequired:
      "Sign in first.",

    ageRequired:
      "You must confirm you are at least 18.",

    otpSent:
      "SMS code sent.",

    otpVerified:
      "Signed in successfully.",

    paymentPending:
      "Processing request…",

    invalidAmount:
      "Invalid amount.",

    converted:
      "Conversion calculated.",

    saved: "Saved.",

    selfExcluded:
      "Self-exclusion activated.",

    serverNotConfigured:
      "MystroParyaj server address is not configured yet.",

    authError:
      "Authentication failed.",

    invalidPhone:
      "Enter a full number, for example +509XXXXXXXX.",

    selectBet:
      "Selection added to betslip.",

    betSending:
      "Submitting bet…",

    betAccepted:
      "Bet submitted to server.",

    noBalance:
      "Insufficient balance."
  },


  es: {
    tagline: "Apuestas deportivas y billetera",
    home: "Inicio",
    sports: "Deportes",
    betslip: "Boleto",
    wallet: "Billetera",
    exchange: "Cambio",
    history: "Historial",
    profile: "Perfil",
    admin: "Administración",
    responsible: "Juega responsablemente.",
    limits: "Mis límites",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",

    livePlatform: "Plataforma segura",

    heroTitle:
      "Apuesta fácilmente. Controla todo claramente.",

    heroText:
      "15 categorías, billetera multidivisa, MonCash, NatCash y estadísticas.",

    startBet: "Ver apuestas",
    manageWallet: "Gestionar billetera",

    securePlatform:
      "Plataforma segura",

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
      "Elige una categoría y una apuesta.",

    allEvents: "Todos los eventos",
    searchEvent: "Buscar evento",

    betslipHelp:
      "Revisa tus selecciones antes de validar.",

    stake: "Apuesta",
    totalOdds: "Cuota total",
    potentialReturn: "Retorno potencial",
    placeBet: "Validar apuesta",

    demoWarning:
      "Las operaciones con dinero real requieren activación legal y servidor seguro.",

    walletText:
      "Depósitos, retiros y saldos.",

    availableBalance:
      "Saldo disponible",

    deposit: "Depósito",
    withdraw: "Retiro",

    paymentMethod:
      "Método de pago",

    mobileMoney:
      "Dinero móvil",

    phone:
      "Número de teléfono",

    phonePlaceholder:
      "+509 XX XX XX XX",

    amount: "Monto",
    continue: "Continuar",

    exchangeText:
      "Convierte entre las monedas disponibles.",

    from: "De",
    to: "A",
    convert: "Convertir",

    rateNotice:
      "Las tasas deben provenir de una fuente fiable del servidor.",

    historyText:
      "Tus apuestas y movimientos.",

    date: "Fecha",
    type: "Tipo",
    details: "Detalles",
    status: "Estado",

    profileText:
      "Cuenta, seguridad y juego responsable.",

    language: "Idioma",
    mainCurrency: "Moneda principal",

    responsibleGaming:
      "Juego responsable",

    dailyDepositLimit:
      "Límite depósito/día",

    dailyBetLimit:
      "Límite apuestas/día",

    save: "Guardar",

    selfExclude:
      "Autoexclusión",

    adminText:
      "Gestión segura de operaciones.",

    totalStakes:
      "Apuestas totales",

    users:
      "Usuarios",

    systemControl:
      "Control del sistema",

    systemControlText:
      "Los cálculos financieros sensibles se realizan en el servidor y no se muestran a los usuarios.",

    loginRegister:
      "Inicio de sesión / Registro",

    otpText:
      "Introduce tu número y el código SMS recibido.",

    ageConfirm:
      "Confirmo que tengo al menos 18 años.",

    sendCode:
      "Enviar código",

    code: "Código",
    verify: "Verificar",

    limitsInfo:
      "Define tus límites de juego.",

    manageLimits:
      "Gestionar límites",

    emptyTicket:
      "No hay selecciones.",

    loginRequired:
      "Inicia sesión primero.",

    ageRequired:
      "Debes confirmar que tienes al menos 18 años.",

    otpSent:
      "Código SMS enviado.",

    otpVerified:
      "Sesión iniciada correctamente.",

    paymentPending:
      "Procesando solicitud…",

    invalidAmount:
      "Monto inválido.",

    converted:
      "Conversión calculada.",

    saved:
      "Guardado.",

    selfExcluded:
      "Autoexclusión activada.",

    serverNotConfigured:
      "La dirección del servidor MystroParyaj aún no está configurada.",

    authError:
      "Error de autenticación.",

    invalidPhone:
      "Introduce un número completo, por ejemplo +509XXXXXXXX.",

    selectBet:
      "Selección añadida al boleto.",

    betSending:
      "Validando apuesta…",

    betAccepted:
      "Apuesta enviada al servidor.",

    noBalance:
      "Saldo insuficiente."
  }

};


function tr(key) {
  return (
    T[state.lang]?.[key] ||
    T.fr[key] ||
    key
  );
}


// ======================================================
// SPORTS - 15 CATEGORIES
// ======================================================

const sports = [
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


// ======================================================
// EVENEMENTS TEMPORAIRES
// ======================================================

const demoEvents = [

  {
    id: "f1",
    sport: "football",
    league: "International",
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
    id: "f2",
    sport: "football",
    league: "Premier",
    time: "20:00",
    home: "Union",
    away: "Royal",
    markets: [
      ["1", 2.15],
      ["X", 3.10],
      ["2", 2.40]
    ]
  },

  {
    id: "b1",
    sport: "basketball",
    league: "Pro Basket",
    time: "19:15",
    home: "Tigers",
    away: "Stars",
    markets: [
      ["1", 1.72],
      ["2", 2.05]
    ]
  },

  {
    id: "t1",
    sport: "tennis",
    league: "Open",
    time: "17:45",
    home: "Player A",
    away: "Player B",
    markets: [
      ["1", 1.62],
      ["2", 2.22]
    ]
  },

  {
    id: "m1",
    sport: "mma",
    league: "Fight Night",
    time: "21:00",
    home: "Fighter A",
    away: "Fighter B",
    markets: [
      ["1", 1.80],
      ["2", 1.95]
    ]
  },

  {
    id: "e1",
    sport: "esports",
    league: "eFootball",
    time: "16:10",
    home: "Phoenix",
    away: "Orbit",
    markets: [
      ["1", 1.88],
      ["X", 3.40],
      ["2", 2.55]
    ]
  }

];


// ======================================================
// TAUX DE SECOURS
// Seulement pour affichage avant réponse serveur.
// ======================================================

const fallbackRates = {
  HTG: 1,
  USD: 132,
  EUR: 143,
  CAD: 97,
  DOP: 2.25
};


// ======================================================
// LOCAL STORAGE
// Ticket uniquement, pas portefeuille réel.
// ======================================================

function selectionStorageKey() {

  const uid =
    state.user?.uid ||
    "guest";

  return (
    "mystroparyaj_selections_" +
    uid
  );
}


function loadSelections() {

  try {

    state.selections =
      JSON.parse(
        localStorage.getItem(
          selectionStorageKey()
        ) || "[]"
      );

  } catch {

    state.selections = [];

  }

}


function saveSelections() {

  localStorage.setItem(
    selectionStorageKey(),
    JSON.stringify(
      state.selections
    )
  );

}


function savePreferences() {

  localStorage.setItem(
    "mystroparyaj_lang",
    state.lang
  );

  localStorage.setItem(
    "mystroparyaj_currency",
    state.currency
  );

}


// ======================================================
// ARGENT
// ======================================================

function money(value, currency = state.currency) {

  return (
    Number(value || 0)
      .toLocaleString(
        undefined,
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      )
    +
    " "
    +
    currency
  );

}


// ======================================================
// TOAST
// ======================================================

let toastTimer = null;


function toast(message) {

  const box = $("#toast");

  if (!box) return;

  box.textContent =
    message;

  box.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {
        box.classList.remove(
          "show"
        );
      },
      2600
    );

}


// ======================================================
// MODAL
// ======================================================

function openModal(id) {

  const modal =
    $("#" + id);

  modal?.classList.add(
    "open"
  );

}


function closeModal(id) {

  const modal =
    $("#" + id);

  modal?.classList.remove(
    "open"
  );

}


// ======================================================
// MENU
// ======================================================

function openSidebar() {

  $("#sidebar")
    ?.classList
    .add("open");

  $("#sidebarOverlay")
    ?.classList
    .add("open");

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "true"
    );

}


function closeSidebar() {

  $("#sidebar")
    ?.classList
    .remove("open");

  $("#sidebarOverlay")
    ?.classList
    .remove("open");

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "false"
    );

}


// ======================================================
// NAVIGATION
// ======================================================

function showPage(name) {

  if (
    name === "admin" &&
    !state.isAdmin
  ) {

    return;

  }

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


  closeSidebar();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ======================================================
// LANGUES
// ======================================================

function applyLanguage() {

  document.documentElement.lang =
    state.lang;


  $$("[data-i18n]")
    .forEach(
      element => {

        element.textContent =
          tr(
            element.dataset.i18n
          );

      }
    );


  $$("[data-i18n-placeholder]")
    .forEach(
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


  if ($("#profileLanguage")) {

    const names = {
      fr: "Français",
      ht: "Kreyòl",
      en: "English",
      es: "Español"
    };

    $("#profileLanguage").value =
      names[state.lang] ||
      state.lang;

  }


  updateAuthUI();

  renderAll();

}


// ======================================================
// AUTH UI
// ======================================================

function updateAuthUI() {

  const loginBtn =
    $("#loginBtn");

  const logoutBtn =
    $("#logoutBtn");


  if (state.user) {

    if (loginBtn) {

      const phone =
        state.user.phoneNumber ||
        state.user.phone ||
        "";

      loginBtn.textContent =
        phone
          ? phone.replace(
              "+509",
              ""
            )
          : tr("profile");

    }

    logoutBtn?.classList.remove(
      "hidden"
    );

  }

  else {

    if (loginBtn) {

      loginBtn.textContent =
        tr("login");

    }

    logoutBtn?.classList.add(
      "hidden"
    );

  }


  if ($("#profilePhone")) {

    $("#profilePhone").value =
      state.user?.phoneNumber ||
      state.user?.phone ||
      "—";

  }

}


// ======================================================
// ADMIN
// ======================================================

async function updateAdminAccess(user) {

  state.isAdmin = false;

  const adminLinks =
    $$(".admin-only");


  adminLinks.forEach(
    element => {

      element.hidden = true;

    }
  );


  if (!user) return;


  try {

    const tokenResult =
      await user.getIdTokenResult(
        true
      );


    state.isAdmin =
      tokenResult.claims.admin === true;


    adminLinks.forEach(
      element => {

        element.hidden =
          !state.isAdmin;

      }
    );

  }

  catch (error) {

    console.error(
      "Admin claim:",
      error
    );

  }

}


// ======================================================
// FIREBASE PHONE AUTH
// ======================================================

async function sendOtp() {

  const phone =
    $("#authPhone")
      ?.value
      ?.replace(/\s+/g, "")
      .trim() || "";


  const ageAccepted =
    $("#ageCheck")
      ?.checked;


  const status =
    $("#authStatus");


  if (!ageAccepted) {

    if (status) {

      status.textContent =
        tr("ageRequired");

      status.className =
        "status error";

    }

    return;

  }


  if (
    !phone.startsWith("+") ||
    phone.length < 8
  ) {

    if (status) {

      status.textContent =
        tr("invalidPhone");

      status.className =
        "status error";

    }

    return;

  }


  const button =
    $("#sendOtpBtn");


  try {

    button &&
      (button.disabled = true);


    if (status) {

      status.textContent =
        tr("paymentPending");

      status.className =
        "status";

    }


    await sendPhoneCode(
      phone,
      "recaptcha-container"
    );


    $("#otpArea")
      ?.classList
      .remove("hidden");


    if (status) {

      status.textContent =
        tr("otpSent");

      status.className =
        "status success";

    }

  }

  catch (error) {

    console.error(
      "Firebase SMS:",
      error
    );


    if (status) {

      status.textContent =
        firebaseErrorMessage(
          error
        );

      status.className =
        "status error";

    }

  }

  finally {

    button &&
      (button.disabled = false);

  }

}


async function confirmOtp() {

  const code =
    $("#otpCode")
      ?.value
      ?.trim() || "";


  const status =
    $("#authStatus");


  if (
    code.length < 6
  ) {

    if (status) {

      status.textContent =
        tr("code");

      status.className =
        "status error";

    }

    return;

  }


  const button =
    $("#verifyOtpBtn");


  try {

    button &&
      (button.disabled = true);


    const user =
      await verifyPhoneCode(
        code
      );


    state.user =
      user;


    await updateAdminAccess(
      user
    );


    loadSelections();

    updateAuthUI();

    renderAll();


    if (status) {

      status.textContent =
        tr("otpVerified");

      status.className =
        "status success";

    }


    setTimeout(
      () => {

        closeModal(
          "authModal"
        );

      },
      700
    );

  }

  catch (error) {

    console.error(
      "OTP verification:",
      error
    );


    if (status) {

      status.textContent =
        firebaseErrorMessage(
          error
        );

      status.className =
        "status error";

    }

  }

  finally {

    button &&
      (button.disabled = false);

  }

}


function firebaseErrorMessage(error) {

  const code =
    error?.code || "";


  if (
    code.includes(
      "invalid-phone-number"
    )
  ) {

    return tr(
      "invalidPhone"
    );

  }


  if (
    code.includes(
      "invalid-verification-code"
    )
  ) {

    return (
      state.lang === "ht"
        ? "Kòd la pa kòrèk."
        : state.lang === "en"
        ? "Incorrect verification code."
        : state.lang === "es"
        ? "Código incorrecto."
        : "Le code est incorrect."
    );

  }


  if (
    code.includes(
      "too-many-requests"
    )
  ) {

    return (
      state.lang === "ht"
        ? "Twòp tantativ. Eseye ankò pita."
        : state.lang === "en"
        ? "Too many attempts. Try again later."
        : state.lang === "es"
        ? "Demasiados intentos. Inténtalo más tarde."
        : "Trop de tentatives. Réessayez plus tard."
    );

  }


  if (
    code.includes(
      "quota-exceeded"
    )
  ) {

    return (
      state.lang === "ht"
        ? "Kota SMS Firebase la rive nan limit li."
        : state.lang === "en"
        ? "Firebase SMS quota has been reached."
        : state.lang === "es"
        ? "Se alcanzó la cuota SMS de Firebase."
        : "Le quota SMS Firebase a été atteint."
    );

  }


  return (
    error?.message ||
    tr("authError")
  );

}


// ======================================================
// AUTH STATE
// ======================================================

watchAuth(
  async user => {

    state.user =
      user || null;


    await updateAdminAccess(
      user
    );


    loadSelections();

    updateAuthUI();

    renderAll();

  }
);


// ======================================================
// DECONNEXION
// ======================================================

async function logout() {

  try {

    await logoutUser();

    state.user = null;

    state.isAdmin = false;

    state.balance = 0;

    state.history = [];

    loadSelections();

    updateAuthUI();

    renderAll();

    showPage("home");

  }

  catch (error) {

    console.error(
      "Logout:",
      error
    );

  }

}


// ======================================================
// CATEGORIES
// ======================================================

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
          type="button"
        >
          <span>${icon}</span>
          <strong>${name}</strong>
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


// ======================================================
// EVENEMENT HTML
// ======================================================

function eventHTML(event) {

  return `

    <article class="event">

      <div>

        <div class="event-meta">
          <span>${event.league}</span>
          <span>•</span>
          <span>${event.time}</span>
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
              type="button"
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


// ======================================================
// ODDS
// ======================================================

function bindOdds() {

  $$(".odd").forEach(
    button => {

      button.onclick =
        () => {

          toggleSelection(
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


// ======================================================
// EVENEMENTS
// ======================================================

function renderEvents() {

  const box =
    $("#eventsList");

  if (!box) return;


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
    )
      .trim()
      .toLowerCase();


  if (search) {

    list =
      list.filter(
        event => {

          const text =
            `${event.home} ${event.away} ${event.league}`
              .toLowerCase();

          return text.includes(
            search
          );

        }
      );

  }


  box.innerHTML =
    list.length
      ? list.map(eventHTML).join("")
      : `<p>${tr("emptyTicket")}</p>`;


  bindOdds();

}


// ======================================================
// FEATURED
// ======================================================

function renderFeatured() {

  const box =
    $("#featuredEvents");

  if (!box) return;


  box.innerHTML =
    demoEvents
      .slice(0, 3)
      .map(eventHTML)
      .join("");


  bindOdds();

}


// ======================================================
// SELECTION
// ======================================================

function toggleSelection(
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


  state.selections =
    state.selections.filter(
      item =>
        item.eventId !==
        eventId
    );


  state.selections.push({
    eventId,
    label,
    odd,
    title:
      `${event.home} — ${event.away}`
  });


  saveSelections();

  renderBets();

  renderStats();

  toast(
    tr("selectBet")
  );

}


// ======================================================
// TICKET
// ======================================================

function renderBets() {

  const box =
    $("#betSelections");

  if (!box) return;


  if (
    !state.selections.length
  ) {

    box.innerHTML =
      `<p>${tr("emptyTicket")}</p>`;

  }

  else {

    box.innerHTML =
      state.selections.map(
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
                  ${Number(
                    bet.odd
                  ).toFixed(2)}
                </div>

              </div>

              <button
                type="button"
                class="remove-bet"
                data-index="${index}">
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

          state.selections.splice(
            Number(
              button.dataset.index
            ),
            1
          );

          saveSelections();

          renderBets();

          renderStats();

        };

    }
  );


  updateBetCalc();

}


// ======================================================
// BET CALC
// ======================================================

function updateBetCalc() {

  const odds =
    state.selections.reduce(
      (total, item) =>
        total *
        Number(item.odd),
      1
    );


  const stake =
    Number(
      $("#stakeInput")?.value ||
      0
    );


  if ($("#totalOdds")) {

    $("#totalOdds").textContent =
      odds.toFixed(2);

  }


  if ($("#potentialReturn")) {

    $("#potentialReturn").textContent =
      money(
        stake * odds
      );

  }

}


// ======================================================
// API
// ======================================================

function serverConfigured() {

  return (
    WORKER_URL &&
    !WORKER_URL.includes(
      "VOTRE-WORKER"
    )
  );

}


async function api(
  path,
  options = {}
) {

  if (
    !serverConfigured()
  ) {

    throw new Error(
      tr(
        "serverNotConfigured"
      )
    );

  }


  let token = "";


  if (auth.currentUser) {

    token =
      await auth.currentUser
        .getIdToken();

  }


  const response =
    await fetch(
      `${WORKER_URL}${path}`,
      {
        method:
          options.method ||
          "POST",

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
      .catch(
        () => ({})
      );


  if (!response.ok) {

    throw new Error(
      data.error ||
      data.message ||
      `HTTP ${response.status}`
    );

  }


  return data;

}


// ======================================================
// PLACE BET
// ======================================================

async function placeBet() {

  if (!state.user) {

    toast(
      tr("loginRequired")
    );

    openModal(
      "authModal"
    );

    return;

  }


  if (
    !state.selections.length
  ) {

    toast(
      tr("emptyTicket")
    );

    return;

  }


  const stake =
    Number(
      $("#stakeInput")?.value ||
      0
    );


  if (
    !Number.isFinite(stake) ||
    stake <= 0
  ) {

    toast(
      tr("invalidAmount")
    );

    return;

  }


  const button =
    $("#placeBetBtn");


  try {

    if (button) {

      button.disabled = true;

      button.textContent =
        tr("betSending");

    }


    const data =
      await api(
        "/api/bet",
        {
          method: "POST",

          body: {
            currency:
              state.currency,

            stake,

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

    renderAll();


    toast(
      data.message ||
      tr("betAccepted")
    );

  }

  catch (error) {

    console.error(
      "Bet:",
      error
    );

    toast(
      error.message
    );

  }

  finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        tr("placeBet");

    }

  }

}


// ======================================================
// PAYMENT
// ======================================================

async function submitPayment() {

  if (!state.user) {

    toast(
      tr("loginRequired")
    );

    openModal(
      "authModal"
    );

    return;

  }


  const amount =
    Number(
      $("#paymentAmount")
        ?.value ||
      0
    );


  const phone =
    $("#paymentPhone")
      ?.value
      ?.trim() || "";


  const status =
    $("#paymentStatus");


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      tr("invalidAmount")
    );

    return;

  }


  try {

    if (status) {

      status.textContent =
        tr(
          "paymentPending"
        );

      status.className =
        "status";

    }


    const data =
      await api(
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


    if (
      data.redirectUrl
    ) {

      window.location.href =
        data.redirectUrl;

      return;

    }


    if (status) {

      status.textContent =
        data.message ||
        "OK";

      status.className =
        "status success";

    }

  }

  catch (error) {

    console.error(
      "Payment:",
      error
    );


    if (status) {

      status.textContent =
        error.message;

      status.className =
        "status error";

    }

  }

}


// ======================================================
// EXCHANGE
// ======================================================

function calcExchange() {

  const amount =
    Number(
      $("#exchangeAmount")
        ?.value ||
      0
    );


  const from =
    $("#fromCurrency")
      ?.value;


  const to =
    $("#toCurrency")
      ?.value;


  if (
    !from ||
    !to ||
    !$("#exchangeResult")
  ) {

    return;

  }


  const fromRate =
    fallbackRates[from];


  const toRate =
    fallbackRates[to];


  if (
    !fromRate ||
    !toRate
  ) {

    return;

  }


  const valueHTG =
    amount *
    fromRate;


  const result =
    valueHTG /
    toRate;


  $("#exchangeResult").value =
    Number.isFinite(result)
      ? result.toFixed(2)
      : "0.00";

}


// ======================================================
// HISTORY
// ======================================================

function renderHistory() {

  const body =
    $("#historyBody");

  if (!body) return;


  if (
    !state.history.length
  ) {

    body.innerHTML = `
      <tr>
        <td colspan="5">
          —
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
            ${item.date || ""}
          </td>

          <td>
            ${item.type || ""}
          </td>

          <td>
            ${item.details || ""}
          </td>

          <td>
            ${money(
              item.amount ||
              0,
              item.currency ||
              state.currency
            )}
          </td>

          <td>
            <span class="badge">
              ${item.status || ""}
            </span>
          </td>

        </tr>

      `
    ).join("");

}


// ======================================================
// STATS
// ======================================================

function renderStats() {

  if ($("#balanceValue")) {

    $("#balanceValue").textContent =
      money(
        state.balance
      );

  }


  if ($("#walletBalance")) {

    $("#walletBalance").textContent =
      money(
        state.balance
      );

  }


  if ($("#openBetsValue")) {

    $("#openBetsValue").textContent =
      state.selections.length;

  }


  if ($("#todayBetsValue")) {

    $("#todayBetsValue").textContent =
      0;

  }


  if ($("#transactionCountValue")) {

    $("#transactionCountValue").textContent =
      state.history.length;

  }


  if ($("#stakeCurrency")) {

    $("#stakeCurrency").textContent =
      state.currency;

  }


  if ($("#paymentCurrency")) {

    $("#paymentCurrency").textContent =
      state.currency;

  }


  if ($("#profileCurrency")) {

    $("#profileCurrency").value =
      state.currency;

  }


  if ($("#currencySelect")) {

    $("#currencySelect").value =
      state.currency;

  }


  if ($("#adminStakes")) {

    $("#adminStakes").textContent =
      money(0);

  }


  if ($("#adminOpenBets")) {

    $("#adminOpenBets").textContent =
      0;

  }


  if ($("#adminTransactions")) {

    $("#adminTransactions").textContent =
      0;

  }


  if ($("#adminUsers")) {

    $("#adminUsers").textContent =
      0;

  }

}


// ======================================================
// CHART
// ======================================================

function renderChart() {

  const box =
    $("#barChart");

  if (!box) return;


  const values =
    [35, 60, 48, 80, 66, 92, 74];

  const days =
    ["L", "M", "M", "J", "V", "S", "D"];


  box.innerHTML =
    values.map(
      (value, index) => `

        <div class="bar-item">

          <div
            class="bar"
            style="height:${value}%">
          </div>

          <span>
            ${days[index]}
          </span>

        </div>

      `
    ).join("");

}


// ======================================================
// GLOBAL RENDER
// ======================================================

function renderAll() {

  renderCategories();

  renderEvents();

  renderFeatured();

  renderBets();

  renderHistory();

  renderStats();

  renderChart();

  updateAuthUI();

}


// ======================================================
// PAYMENT MODE
// ======================================================

function switchPaymentMode(
  mode
) {

  state.paymentMode =
    mode;


  if ($("#paymentFormTitle")) {

    $("#paymentFormTitle").textContent =
      tr(mode);

  }


  $("#depositTabBtn")
    ?.classList
    .toggle(
      "primary",
      mode === "deposit"
    );


  $("#withdrawTabBtn")
    ?.classList
    .toggle(
      "primary",
      mode === "withdraw"
    );

}


// ======================================================
// EVENT LISTENERS
// ======================================================

$("#menuBtn")
  ?.addEventListener(
    "click",
    () => {

      if (
        $("#sidebar")
          ?.classList
          .contains("open")
      ) {

        closeSidebar();

      }

      else {

        openSidebar();

      }

    }
  );


$("#sidebarOverlay")
  ?.addEventListener(
    "click",
    closeSidebar
  );


$$(".nav-link")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showPage(
            button.dataset.page
          );

        }
      );

    }
  );


$$("[data-go]")
  .forEach(
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


$$("[data-close]")
  .forEach(
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


$("#loginBtn")
  ?.addEventListener(
    "click",
    () => {

      if (state.user) {

        showPage(
          "profile"
        );

      }

      else {

        openModal(
          "authModal"
        );

      }

    }
  );


$("#logoutBtn")
  ?.addEventListener(
    "click",
    logout
  );


$("#limitsBtn")
  ?.addEventListener(
    "click",
    () => {

      openModal(
        "limitsModal"
      );

    }
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

      renderAll();

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
    updateBetCalc
  );


$("#placeBetBtn")
  ?.addEventListener(
    "click",
    placeBet
  );


$("#depositTabBtn")
  ?.addEventListener(
    "click",
    () =>
      switchPaymentMode(
        "deposit"
      )
  );


$("#withdrawTabBtn")
  ?.addEventListener(
    "click",
    () =>
      switchPaymentMode(
        "withdraw"
      )
  );


$$(".payment")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          $$(".payment")
            .forEach(
              item =>
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

    }
  );


$("#paymentSubmit")
  ?.addEventListener(
    "click",
    submitPayment
  );


$("#exchangeAmount")
  ?.addEventListener(
    "input",
    calcExchange
  );


$("#fromCurrency")
  ?.addEventListener(
    "change",
    calcExchange
  );


$("#toCurrency")
  ?.addEventListener(
    "change",
    calcExchange
  );


$("#swapCurrencies")
  ?.addEventListener(
    "click",
    () => {

      const from =
        $("#fromCurrency");

      const to =
        $("#toCurrency");


      if (!from || !to) return;


      const current =
        from.value;

      from.value =
        to.value;

      to.value =
        current;

      calcExchange();

    }
  );


$("#exchangeBtn")
  ?.addEventListener(
    "click",
    () => {

      calcExchange();

      toast(
        tr("converted")
      );

    }
  );


$("#saveLimitsBtn")
  ?.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "mystroparyaj_deposit_limit",
        $("#depositLimit")?.value ||
        "0"
      );


      localStorage.setItem(
        "mystroparyaj_bet_limit",
        $("#betLimit")?.value ||
        "0"
      );


      toast(
        tr("saved")
      );

    }
  );


$("#selfExcludeBtn")
  ?.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "mystroparyaj_self_excluded",
        "1"
      );


      toast(
        tr("selfExcluded")
      );

    }
  );


$("#sendOtpBtn")
  ?.addEventListener(
    "click",
    sendOtp
  );


$("#verifyOtpBtn")
  ?.addEventListener(
    "click",
    confirmOtp
  );


// ======================================================
// DEMARRAGE
// ======================================================

loadSelections();

applyLanguage();

calcExchange();

renderAll();

// ======================================================
// MYSTROPARYAJ - SCRIPT.JS
// Firebase Email/Password + Interface + Worker API
// ======================================================

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


// ======================================================
// CONFIGURATION
// ======================================================

const DEFAULT_WORKER_URL =
  "https://VOTRE-WORKER.workers.dev";

const WORKER_URL =
  localStorage.getItem(
    "MYSTROPARYAJ_WORKER_URL"
  ) || DEFAULT_WORKER_URL;


// ======================================================
// DOM
// ======================================================

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];


// ======================================================
// ETAT
// ======================================================

const state = {

  lang:
    localStorage.getItem(
      "mystroparyaj_lang"
    ) || "fr",

  currency:
    localStorage.getItem(
      "mystroparyaj_currency"
    ) || "HTG",

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

    logout:
      "Déconnexion",

    register:
      "Créer un compte",

    email:
      "Adresse e-mail",

    password:
      "Mot de passe",

    emailPlaceholder:
      "exemple@email.com",

    passwordPlaceholder:
      "Minimum 6 caractères",

    forgotPassword:
      "Mot de passe oublié ?",

    emailAuthText:
      "Connectez-vous ou créez votre compte avec votre adresse e-mail.",

    livePlatform:
      "Plateforme sécurisée",

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
      "Les opérations réelles nécessitent une activation légale et serveur sécurisée.",

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
      "Les taux doivent être récupérés depuis une source fiable côté serveur.",

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

    ageConfirm:
      "Je confirme avoir au moins 18 ans.",

    limitsInfo:
      "Définissez vos limites de jeu.",

    manageLimits:
      "Gérer les limites",

    emptyTicket:
      "Aucune sélection pour le moment.",

    loginRequired:
      "Connectez-vous d'abord.",

    ageRequired:
      "Vous devez confirmer avoir au moins 18 ans.",

    invalidEmail:
      "Adresse e-mail invalide.",

    invalidPassword:
      "Le mot de passe doit contenir au moins 6 caractères.",

    accountCreated:
      "Compte créé avec succès.",

    loginSuccess:
      "Connexion réussie.",

    passwordReset:
      "E-mail de réinitialisation envoyé.",

    invalidCredentials:
      "E-mail ou mot de passe incorrect.",

    emailInUse:
      "Cette adresse e-mail possède déjà un compte.",

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

    selectBet:
      "Sélection ajoutée au ticket.",

    betSending:
      "Validation du pari…",

    betAccepted:
      "Pari envoyé au serveur."

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

    logout:
      "Dekonekte",

    register:
      "Kreye kont",

    email:
      "Adrès e-mail",

    password:
      "Modpas",

    emailPlaceholder:
      "egzanp@email.com",

    passwordPlaceholder:
      "Omwen 6 karaktè",

    forgotPassword:
      "Ou bliye modpas?",

    emailAuthText:
      "Konekte oswa kreye kont ou avèk adrès e-mail ou.",

    livePlatform:
      "Platfòm sekirize",

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
      "Verifye seleksyon yo anvan ou valide.",

    stake:
      "Miz",

    totalOdds:
      "Kòt total",

    potentialReturn:
      "Retou posib",

    placeBet:
      "Valide paryaj",

    demoWarning:
      "Operasyon ak lajan reyèl mande aktivasyon legal ak yon sèvè sekirize.",

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
      "To yo dwe soti nan yon sous serye sou sèvè a.",

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

    ageConfirm:
      "Mwen konfime mwen gen omwen 18 an.",

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

    invalidEmail:
      "Adrès e-mail la pa valab.",

    invalidPassword:
      "Modpas la dwe gen omwen 6 karaktè.",

    accountCreated:
      "Kont lan kreye avèk siksè.",

    loginSuccess:
      "Ou konekte avèk siksè.",

    passwordReset:
      "E-mail pou chanje modpas la voye.",

    invalidCredentials:
      "E-mail oswa modpas la pa kòrèk.",

    emailInUse:
      "Adrès e-mail sa a deja gen yon kont.",

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

    selectBet:
      "Seleksyon ajoute nan tikè a.",

    betSending:
      "Paryaj la ap valide…",

    betAccepted:
      "Paryaj la voye sou sèvè a."

  }

};


// ======================================================
// ENGLISH
// ======================================================

T.en = {
  ...T.fr,

  tagline:
    "Sports betting & wallet",

  home:
    "Home",

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

  responsible:
    "Gamble responsibly.",

  limits:
    "My limits",

  login:
    "Sign in",

  logout:
    "Sign out",

  register:
    "Create account",

  email:
    "Email address",

  password:
    "Password",

  emailPlaceholder:
    "example@email.com",

  passwordPlaceholder:
    "Minimum 6 characters",

  forgotPassword:
    "Forgot password?",

  emailAuthText:
    "Sign in or create your account with your email address.",

  accountCreated:
    "Account created successfully.",

  loginSuccess:
    "Signed in successfully.",

  passwordReset:
    "Password reset email sent.",

  invalidCredentials:
    "Incorrect email or password.",

  emailInUse:
    "An account already exists with this email."
};


// ======================================================
// ESPAÑOL
// ======================================================

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

  responsible:
    "Juega responsablemente.",

  login:
    "Iniciar sesión",

  logout:
    "Cerrar sesión",

  register:
    "Crear cuenta",

  email:
    "Correo electrónico",

  password:
    "Contraseña",

  emailPlaceholder:
    "ejemplo@email.com",

  passwordPlaceholder:
    "Mínimo 6 caracteres",

  forgotPassword:
    "¿Olvidaste tu contraseña?",

  emailAuthText:
    "Inicia sesión o crea tu cuenta con tu correo electrónico.",

  accountCreated:
    "Cuenta creada correctamente.",

  loginSuccess:
    "Sesión iniciada correctamente.",

  passwordReset:
    "Correo de recuperación enviado.",

  invalidCredentials:
    "Correo o contraseña incorrectos.",

  emailInUse:
    "Ya existe una cuenta con este correo."
};


// ======================================================
// TRADUCTION
// ======================================================

function tr(key) {

  return (
    T[state.lang]?.[key] ||
    T.fr[key] ||
    key
  );

}


// ======================================================
// SPORTS
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

  [
    "virtualfootball",
    "⚽",
    "Football virtuel"
  ],

  [
    "virtualbasketball",
    "🏀",
    "Basket virtuel"
  ],

  ["jackpot", "💰", "Jackpot"],

  ["live", "🔴", "Paris Live"]

];


// ======================================================
// EVENEMENTS DEMO
// ======================================================

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
      ["1", 1.95],
      ["X", 3.20],
      ["2", 2.70]
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
      ["1", 2.15],
      ["X", 3.10],
      ["2", 2.40]
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
      ["1", 1.72],
      ["2", 2.05]
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
      ["1", 1.62],
      ["2", 2.22]
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
      ["1", 1.80],
      ["2", 1.95]
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
      ["1", 1.88],
      ["X", 3.40],
      ["2", 2.55]
    ]

  }

];


// ======================================================
// TAUX TEMPORAIRES
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
// ======================================================

function selectionStorageKey() {

  return (
    "mystroparyaj_selections_" +
    (state.user?.uid || "guest")
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

  }

  catch {

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
// MONEY
// ======================================================

function money(
  value,
  currency = state.currency
) {

  return (
    Number(value || 0)
      .toLocaleString(
        undefined,
        {
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

let toastTimer;


function toast(message) {

  const box =
    $("#toast");


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

      2500
    );

}


// ======================================================
// MODALES
// ======================================================

function openModal(id) {

  $("#" + id)
    ?.classList
    .add("open");

}


function closeModal(id) {

  $("#" + id)
    ?.classList
    .remove("open");

}


// ======================================================
// SIDEBAR
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
// LANGUE
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


  $$(
    "[data-i18n-placeholder]"
  )
    .forEach(
      element => {

        element.placeholder =
          tr(
            element.dataset
              .i18nPlaceholder
          );

      }
    );


  if ($("#languageSelect")) {

    $("#languageSelect").value =
      state.lang;

  }


  if ($("#profileLanguage")) {

    const names = {

      fr:
        "Français",

      ht:
        "Kreyòl",

      en:
        "English",

      es:
        "Español"

    };


    $("#profileLanguage").value =
      names[state.lang];

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

      loginBtn.textContent =
        state.user.email ||
        tr("profile");

    }


    logoutBtn
      ?.classList
      .remove("hidden");

  }

  else {

    if (loginBtn) {

      loginBtn.textContent =
        tr("login");

    }


    logoutBtn
      ?.classList
      .add("hidden");

  }


  if ($("#profileEmail")) {

    $("#profileEmail").value =
      state.user?.email ||
      "—";

  }

}


// ======================================================
// FIREBASE ERRORS
// ======================================================

function firebaseMessage(error) {

  const code =
    error?.code || "";


  if (
    code.includes(
      "email-already-in-use"
    )
  ) {

    return tr(
      "emailInUse"
    );

  }


  if (
    code.includes(
      "invalid-email"
    )
  ) {

    return tr(
      "invalidEmail"
    );

  }


  if (
    code.includes(
      "weak-password"
    )
  ) {

    return tr(
      "invalidPassword"
    );

  }


  if (
    code.includes(
      "invalid-credential"
    ) ||
    code.includes(
      "wrong-password"
    ) ||
    code.includes(
      "user-not-found"
    )
  ) {

    return tr(
      "invalidCredentials"
    );

  }


  if (
    code.includes(
      "too-many-requests"
    )
  ) {

    return state.lang === "ht"
      ? "Twòp tantativ. Eseye ankò pita."
      : "Trop de tentatives. Réessayez plus tard.";

  }


  return (
    error?.message ||
    "Firebase error"
  );

}


// ======================================================
// REGISTER
// ======================================================

async function registerUser() {

  const email =
    $("#authEmail")
      ?.value
      ?.trim() || "";


  const password =
    $("#authPassword")
      ?.value || "";


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
    !email.includes("@")
  ) {

    if (status) {

      status.textContent =
        tr("invalidEmail");

      status.className =
        "status error";

    }

    return;

  }


  if (
    password.length < 6
  ) {

    if (status) {

      status.textContent =
        tr("invalidPassword");

      status.className =
        "status error";

    }

    return;

  }


  const button =
    $("#emailRegisterBtn");


  try {

    if (button) {

      button.disabled =
        true;

    }


    const user =
      await registerWithEmail(
        email,
        password
      );


    state.user =
      user;


    loadSelections();

    updateAuthUI();

    renderAll();


    if (status) {

      status.textContent =
        tr("accountCreated");

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
      "Register:",
      error
    );


    if (status) {

      status.textContent =
        firebaseMessage(
          error
        );

      status.className =
        "status error";

    }

  }

  finally {

    if (button) {

      button.disabled =
        false;

    }

  }

}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const email =
    $("#authEmail")
      ?.value
      ?.trim() || "";


  const password =
    $("#authPassword")
      ?.value || "";


  const status =
    $("#authStatus");


  if (
    !email.includes("@")
  ) {

    if (status) {

      status.textContent =
        tr("invalidEmail");

      status.className =
        "status error";

    }

    return;

  }


  if (
    password.length < 6
  ) {

    if (status) {

      status.textContent =
        tr("invalidPassword");

      status.className =
        "status error";

    }

    return;

  }


  const button =
    $("#emailLoginBtn");


  try {

    if (button) {

      button.disabled =
        true;

    }


    const user =
      await loginWithEmail(
        email,
        password
      );


    state.user =
      user;


    loadSelections();

    updateAuthUI();

    renderAll();


    if (status) {

      status.textContent =
        tr("loginSuccess");

      status.className =
        "status success";

    }


    setTimeout(
      () => {

        closeModal(
          "authModal"
        );

      },
      600
    );

  }

  catch (error) {

    console.error(
      "Login:",
      error
    );


    if (status) {

      status.textContent =
        firebaseMessage(
          error
        );

      status.className =
        "status error";

    }

  }

  finally {

    if (button) {

      button.disabled =
        false;

    }

  }

}


// ======================================================
// RESET PASSWORD
// ======================================================

async function forgotPassword() {

  const email =
    $("#authEmail")
      ?.value
      ?.trim() || "";


  const status =
    $("#authStatus");


  if (
    !email.includes("@")
  ) {

    if (status) {

      status.textContent =
        tr("invalidEmail");

      status.className =
        "status error";

    }

    return;

  }


  try {

    await resetPassword(
      email
    );


    if (status) {

      status.textContent =
        tr("passwordReset");

      status.className =
        "status success";

    }

  }

  catch (error) {

    if (status) {

      status.textContent =
        firebaseMessage(
          error
        );

      status.className =
        "status error";

    }

  }

}


// ======================================================
// ADMIN
// ======================================================

async function updateAdminAccess(user) {

  state.isAdmin =
    false;


  $$(".admin-only")
    .forEach(
      element => {

        element.hidden =
          true;

      }
    );


  if (!user) {

    return;

  }


  try {

    const token =
      await user
        .getIdTokenResult(
          true
        );


    state.isAdmin =
      token.claims.admin ===
      true;


    $$(".admin-only")
      .forEach(
        element => {

          element.hidden =
            !state.isAdmin;

        }
      );

  }

  catch (error) {

    console.error(
      "Admin:",
      error
    );

  }

}


// ======================================================
// USER PROFILE FIRESTORE
// ======================================================

async function loadUserProfile() {

  if (!state.user) {

    state.balance =
      0;

    state.history =
      [];

    return;

  }


  try {

    const reference =
      doc(
        db,
        "users",
        state.user.uid
      );


    const snapshot =
      await getDoc(
        reference
      );


    if (
      snapshot.exists()
    ) {

      const data =
        snapshot.data();


      if (
        typeof data.balance ===
        "number"
      ) {

        state.balance =
          data.balance;

      }

    }

  }

  catch (error) {

    console.error(
      "Profile:",
      error
    );

  }

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


    await loadUserProfile();


    loadSelections();

    updateAuthUI();

    renderAll();

  }
);


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

  try {

    await logoutUser();


    state.user =
      null;


    state.balance =
      0;


    state.history =
      [];


    state.isAdmin =
      false;


    loadSelections();

    updateAuthUI();

    renderAll();

    showPage(
      "home"
    );

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

  const box =
    $("#categoryGrid");


  if (!box) return;


  box.innerHTML =
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

          <span>
            ${icon}
          </span>

          <strong>
            ${name}
          </strong>

        </button>

      `

    ).join("");


  $$(".category")
    .forEach(
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
// EVENT HTML
// ======================================================

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

  $$(".odd")
    .forEach(
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
// EVENTS
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
      $("#eventSearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();


  if (search) {

    list =
      list.filter(

        event =>

          `${event.home} ${event.away} ${event.league}`
            .toLowerCase()
            .includes(
              search
            )

      );

  }


  box.innerHTML =
    list.length
      ?
        list
          .map(eventHTML)
          .join("")
      :
        `<p>${tr(
          "emptyTicket"
        )}</p>`;


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
    tr(
      "selectBet"
    )
  );

}


// ======================================================
// BETSLIP
// ======================================================

function renderBets() {

  const box =
    $("#betSelections");


  if (!box) return;


  if (
    !state.selections.length
  ) {

    box.innerHTML =
      `<p>${tr(
        "emptyTicket"
      )}</p>`;

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
                data-index="${index}"
              >
                ×
              </button>

            </div>

          </div>

        `

      ).join("");

  }


  $$(".remove-bet")
    .forEach(
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

      (
        total,
        item
      ) =>
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
      money(
        stake * odds
      );

  }

}


// ======================================================
// SERVER
// ======================================================

function serverConfigured() {

  return (
    WORKER_URL &&
    !WORKER_URL.includes(
      "VOTRE-WORKER"
    )
  );

}


// ======================================================
// API
// ======================================================

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


  let token =
    "";


  if (
    auth.currentUser
  ) {

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
            ?
              JSON.stringify(
                options.body
              )
            :
              undefined

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


  if (
    !state.selections.length
  ) {

    toast(
      tr(
        "emptyTicket"
      )
    );


    return;

  }


  const stake =
    Number(

      $("#stakeInput")
        ?.value || 0

    );


  if (
    !Number.isFinite(
      stake
    ) ||
    stake <= 0
  ) {

    toast(
      tr(
        "invalidAmount"
      )
    );


    return;

  }


  const button =
    $("#placeBetBtn");


  try {

    if (button) {

      button.disabled =
        true;


      button.textContent =
        tr(
          "betSending"
        );

    }


    const data =
      await api(

        "/api/bet",

        {

          method:
            "POST",

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


    state.selections =
      [];


    saveSelections();

    renderAll();


    toast(

      data.message ||
      tr(
        "betAccepted"
      )

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

      button.disabled =
        false;


      button.textContent =
        tr(
          "placeBet"
        );

    }

  }

}


// ======================================================
// PAYMENT
// ======================================================

async function submitPayment() {

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

      $("#paymentAmount")
        ?.value || 0

    );


  const phone =
    $("#paymentPhone")
      ?.value
      ?.trim() || "";


  const status =
    $("#paymentStatus");


  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {

    toast(
      tr(
        "invalidAmount"
      )
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

          method:
            "POST",

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
        ?.value || 0

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


  const valueHTG =
    amount *
    fromRate;


  const result =
    valueHTG /
    toRate;


  $("#exchangeResult").value =
    Number.isFinite(
      result
    )
      ?
        result.toFixed(2)
      :
        "0.00";

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
              item.amount || 0,
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


  if ($("#currencySelect")) {

    $("#currencySelect").value =
      state.currency;

  }


  if ($("#profileCurrency")) {

    $("#profileCurrency").value =
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


  box.innerHTML =
    values.map(

      (
        value,
        index
      ) => `

        <div class="bar-item">

          <div
            class="bar"
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

}


// ======================================================
// EVENTS
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

      if (
        state.user
      ) {

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
    () => {

      switchPaymentMode(
        "deposit"
      );

    }
  );


$("#withdrawTabBtn")
  ?.addEventListener(
    "click",
    () => {

      switchPaymentMode(
        "withdraw"
      );

    }
  );


$$(".payment")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          $$(".payment")
            .forEach(
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


      if (
        !from ||
        !to
      ) {

        return;

      }


      const oldValue =
        from.value;


      from.value =
        to.value;


      to.value =
        oldValue;


      calcExchange();

    }
  );


$("#exchangeBtn")
  ?.addEventListener(
    "click",
    () => {

      calcExchange();


      toast(
        tr(
          "converted"
        )
      );

    }
  );


$("#saveLimitsBtn")
  ?.addEventListener(
    "click",
    () => {

      localStorage.setItem(

        "mystroparyaj_deposit_limit",

        $("#depositLimit")
          ?.value || "0"

      );


      localStorage.setItem(

        "mystroparyaj_bet_limit",

        $("#betLimit")
          ?.value || "0"

      );


      toast(
        tr(
          "saved"
        )
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
        tr(
          "selfExcluded"
        )
      );

    }
  );


// ======================================================
// DEMARRAGE
// ======================================================

loadSelections();

applyLanguage();

calcExchange();

renderAll();

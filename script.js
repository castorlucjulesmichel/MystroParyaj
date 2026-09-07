// =====================================================
// MYSTROPARYAJ - SCRIPT.JS COMPLET
// Firebase Auth + Worker API + Wallet + Agent + Admin
// Multi-language + PWA
// =====================================================

import {
  auth,
  registerWithEmail,
  loginWithEmail,
  resetPassword,
  watchAuth,
  logoutUser
} from "./firebase-config.js";


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
    localStorage.getItem("mp_lang") ||
    "ht",

  currency:
    localStorage.getItem("mp_currency") ||
    "HTG",

  user: null,
  me: null,

  isAdmin: false,
  isAgent: false,

  paymentMode: "deposit",
  provider: "moncash",

  sport: "football",

  events: [],
  selections: [],

  wallet: {
    balances: {
      HTG: 0,
      USD: 0,
      EUR: 0,
      CAD: 0,
      DOP: 0
    }
  },

  history: [],
  bets: [],
  rates: null,
  agentRequest: null
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
    agentRequest: "Demann ajan",

    responsible:
      "Jwe avèk responsabilite.",

    limits:
      "Limit mwen",

    securePlatform:
      "Platfòm sekirize",

    heroTitle:
      "Parye fasil. Swiv tout bagay klè.",

    heroText:
      "15 kategori, plizyè lajan, MonCash, NatCash ak estatistik.",

    startBet:
      "Gade paryaj",

    manageWallet:
      "Jere bous la",

    securePlatformText:
      "Paryaj, bous ak peman nan yon sèl aplikasyon.",

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

    betSecurity:
      "Kòt ak balans yo verifye sou sèvè a anvan tikè a aksepte.",

    walletText:
      "Depo, retrè ak balans ou.",

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
      "To yo soti nan sèvè MystroParyaj.",

    historyText:
      "Paryaj ak tranzaksyon ou yo.",

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

    email:
      "Adrès e-mail",

    accountType:
      "Kalite kont",

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

    agentSpaceText:
      "Zòn rezève pou ajan MystroParyaj ki valide.",

    agentClients:
      "Jwè asosye",

    agentCommission:
      "Komisyon",

    agentCode:
      "Kòd ajan",

    agentCodePlaceholder:
      "Eg. MP-A1B2C3",

    linkAgent:
      "Lye ajan",

    linkedPlayers:
      "Jwè asosye",

    adminText:
      "Jesyon sekirize MystroParyaj.",

    totalStakes:
      "Total miz",

    users:
      "Itilizatè",

    loginRegister:
      "Konekte / Enskri",

    emailAuthText:
      "Konekte oswa kreye kont ou ak e-mail ou.",

    password:
      "Modpas",

    emailPlaceholder:
      "egzanp@email.com",

    passwordPlaceholder:
      "Omwen 6 karaktè",

    playerAccount:
      "Kont jwè",

    playerAccountText:
      "Pou jwe epi jere bous ou.",

    agentAccount:
      "Kont ajan",

    agentAccountText:
      "W ap ranpli demann ajan an apre enskripsyon.",

    ageConfirm:
      "Mwen konfime mwen gen omwen 18 an.",

    login:
      "Konekte",

    register:
      "Kreye kont",

    logout:
      "Dekonekte",

    forgotPassword:
      "Ou bliye modpas?",

    limitsInfo:
      "Jere limit jwèt responsab ou yo.",

    manageLimits:
      "Jere limit yo",

    agentRequestHelp:
      "Ranpli enfòmasyon yo. Kont ajan an aktive sèlman apre verifikasyon.",

    fullName:
      "Non konplè",

    city:
      "Vil / komin",

    address:
      "Adrès",

    idType:
      "Kalite pyès idantite",

    idNumber:
      "Nimewo pyès la",

    agentTerms:
      "Mwen aksepte verifikasyon ak kondisyon kont ajan yo.",

    submitRequest:
      "Voye demann",

    agentCriteria:
      "Kritè kont ajan",

    criteria18:
      "Gen omwen 18 an.",

    criteriaIdentity:
      "Bay enfòmasyon idantite ki kòrèk.",

    criteriaContact:
      "Gen nimewo telefòn ak adrès ki valab.",

    criteriaReview:
      "MystroParyaj dwe valide demann nan anvan kont lan aktive.",

    criteriaRules:
      "Respekte règ jwèt responsab, KYC/AML ak règleman platfòm nan.",

    createEvent:
      "Kreye evènman",

    league:
      "Lig",

    homeTeam:
      "Ekip/Jwè 1",

    awayTeam:
      "Ekip/Jwè 2",

    startTime:
      "Dat/lè",

    markets:
      "Mache/kòt",

    create:
      "Kreye",

    settleEvent:
      "Regle evènman",

    winningMarket:
      "Mache gagnan",

    settle:
      "Regle epi peye gagnan yo",

    settleNotice:
      "Lè rezilta a verifye epi regle sou sèvè a, tikè gagnan yo kredite otomatikman.",

    agentRequests:
      "Demann ajan",

    refresh:
      "Rafrechi",

    actions:
      "Aksyon",

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

    agentStart:
      "Kont lan kreye. Ranpli demann ajan an.",

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

    saved:
      "Anrejistre.",

    excluded:
      "Oto-eksklizyon aktive.",

    noHistory:
      "Pa gen tranzaksyon pou montre.",

    noEvents:
      "Pa gen evènman ouvè kounye a.",

    natcashUnavailable:
      "NatCash mande API marchand ofisyèl anvan tranzaksyon reyèl kapab aktive.",

    moncashLive:
      "MonCash itilize mòd ki konfigire sou sèvè MystroParyaj la."
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
    agentRequest: "Demande agent",

    responsible:
      "Jouez de façon responsable.",

    limits:
      "Mes limites",

    securePlatform:
      "Plateforme sécurisée",

    heroTitle:
      "Pariez simplement. Suivez tout clairement.",

    heroText:
      "15 catégories, portefeuille multi-devises, MonCash, NatCash et statistiques.",

    startBet:
      "Voir les paris",

    manageWallet:
      "Gérer le portefeuille",

    securePlatformText:
      "Paris, portefeuille et paiements dans une seule application.",

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

    betSecurity:
      "Les cotes et le solde sont vérifiés par le serveur avant validation.",

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
      "Les taux proviennent du serveur MystroParyaj.",

    historyText:
      "Vos paris et transactions.",

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

    email:
      "Adresse e-mail",

    accountType:
      "Type de compte",

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

    agentSpaceText:
      "Zone réservée aux agents approuvés.",

    agentClients:
      "Joueurs associés",

    agentCommission:
      "Commission",

    agentCode:
      "Code agent",

    agentCodePlaceholder:
      "Ex. MP-A1B2C3",

    linkAgent:
      "Associer",

    linkedPlayers:
      "Joueurs associés",

    adminText:
      "Gestion sécurisée de MystroParyaj.",

    totalStakes:
      "Mises totales",

    users:
      "Utilisateurs",

    loginRegister:
      "Connexion / Inscription",

    emailAuthText:
      "Connectez-vous ou créez votre compte avec votre e-mail.",

    password:
      "Mot de passe",

    emailPlaceholder:
      "exemple@email.com",

    passwordPlaceholder:
      "Minimum 6 caractères",

    playerAccount:
      "Compte joueur",

    playerAccountText:
      "Pour jouer et gérer votre portefeuille.",

    agentAccount:
      "Compte agent",

    agentAccountText:
      "Vous remplirez la demande agent après l'inscription.",

    ageConfirm:
      "Je confirme avoir au moins 18 ans.",

    login:
      "Connexion",

    register:
      "Créer un compte",

    logout:
      "Déconnexion",

    forgotPassword:
      "Mot de passe oublié ?",

    limitsInfo:
      "Gérez vos limites de jeu responsable.",

    manageLimits:
      "Gérer les limites",

    agentRequestHelp:
      "Remplissez les informations. Le compte agent est activé après vérification.",

    fullName:
      "Nom complet",

    city:
      "Ville / commune",

    address:
      "Adresse",

    idType:
      "Type de pièce d'identité",

    idNumber:
      "Numéro de la pièce",

    agentTerms:
      "J'accepte la vérification et les conditions du compte agent.",

    submitRequest:
      "Envoyer la demande",

    agentCriteria:
      "Critères du compte agent",

    criteria18:
      "Avoir au moins 18 ans.",

    criteriaIdentity:
      "Fournir des informations d'identité correctes.",

    criteriaContact:
      "Avoir un numéro et une adresse valides.",

    criteriaReview:
      "MystroParyaj doit approuver la demande avant activation.",

    criteriaRules:
      "Respecter les règles de jeu responsable et les exigences KYC/AML.",

    createEvent:
      "Créer un événement",

    league:
      "Ligue",

    homeTeam:
      "Équipe/Joueur 1",

    awayTeam:
      "Équipe/Joueur 2",

    startTime:
      "Date/heure",

    markets:
      "Marchés/cotes",

    create:
      "Créer",

    settleEvent:
      "Régler l'événement",

    winningMarket:
      "Marché gagnant",

    settle:
      "Régler et payer les gagnants",

    settleNotice:
      "Après validation du résultat, les gagnants sont crédités automatiquement.",

    agentRequests:
      "Demandes agents",

    refresh:
      "Actualiser",

    actions:
      "Actions",

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

    agentStart:
      "Compte créé. Complétez maintenant votre demande agent.",

    loginSuccess:
      "Connexion réussie.",

    resetSent:
      "E-mail de réinitialisation envoyé.",

    invalidCredentials:
      "E-mail ou mot de passe incorrect.",

    emailUsed:
      "Cette adresse e-mail possède déjà un compte.",

    emptyTicket:
      "Aucune sélection.",

    selectionAdded:
      "Sélection ajoutée au ticket.",

    invalidAmount:
      "Montant invalide.",

    serverError:
      "Erreur du serveur.",

    paymentProcessing:
      "Traitement de la demande...",

    saved:
      "Enregistré.",

    excluded:
      "Auto-exclusion activée.",

    noHistory:
      "Aucune transaction.",

    noEvents:
      "Aucun événement ouvert.",

    natcashUnavailable:
      "NatCash nécessite l'API marchand officielle avant l'activation des transactions réelles.",

    moncashLive:
      "MonCash utilise le mode configuré sur le serveur MystroParyaj."
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
    agentRequest: "Agent application",

    responsible:
      "Gamble responsibly.",

    limits:
      "My limits",

    securePlatform:
      "Secure platform",

    heroTitle:
      "Bet simply. Track everything clearly.",

    heroText:
      "15 categories, multi-currency wallet, MonCash, NatCash and statistics.",

    startBet:
      "View bets",

    manageWallet:
      "Manage wallet",

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

    chooseEvent:
      "Choose a category and a bet.",

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

    betSecurity:
      "Odds and balance are verified by the server before the ticket is accepted.",

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

    mobileMoney:
      "Mobile Money",

    phone:
      "Phone number",

    phonePlaceholder:
      "+509 XX XX XX XX",

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

    rateNotice:
      "Rates come from the MystroParyaj server.",

    historyText:
      "Your bets and transactions.",

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

    email:
      "Email address",

    accountType:
      "Account type",

    language:
      "Language",

    mainCurrency:
      "Main currency",

    responsibleGaming:
      "Responsible gaming",

    dailyDepositLimit:
      "Daily deposit limit",

    dailyBetLimit:
      "Daily betting limit",

    save:
      "Save",

    selfExclude:
      "Self-exclusion",

    agentSpaceText:
      "Area reserved for approved MystroParyaj agents.",

    agentClients:
      "Linked players",

    agentCommission:
      "Commission",

    agentCode:
      "Agent code",

    agentCodePlaceholder:
      "Ex. MP-A1B2C3",

    linkAgent:
      "Link agent",

    linkedPlayers:
      "Linked players",

    adminText:
      "Secure MystroParyaj management.",

    totalStakes:
      "Total stakes",

    users:
      "Users",

    loginRegister:
      "Sign in / Register",

    emailAuthText:
      "Sign in or create your account with email.",

    password:
      "Password",

    emailPlaceholder:
      "example@email.com",

    passwordPlaceholder:
      "Minimum 6 characters",

    playerAccount:
      "Player account",

    playerAccountText:
      "For betting and managing your wallet.",

    agentAccount:
      "Agent account",

    agentAccountText:
      "Complete the agent application after registration.",

    ageConfirm:
      "I confirm that I am at least 18 years old.",

    login:
      "Sign in",

    register:
      "Create account",

    logout:
      "Sign out",

    forgotPassword:
      "Forgot password?",

    limitsInfo:
      "Manage your responsible gaming limits.",

    manageLimits:
      "Manage limits",

    agentRequestHelp:
      "Complete the information. Agent access is activated only after verification.",

    fullName:
      "Full name",

    city:
      "City / commune",

    address:
      "Address",

    idType:
      "ID type",

    idNumber:
      "ID number",

    agentTerms:
      "I accept verification and the agent account terms.",

    submitRequest:
      "Submit application",

    agentCriteria:
      "Agent account criteria",

    criteria18:
      "Be at least 18 years old.",

    criteriaIdentity:
      "Provide correct identity information.",

    criteriaContact:
      "Provide a valid phone number and address.",

    criteriaReview:
      "MystroParyaj must approve the application before activation.",

    criteriaRules:
      "Respect responsible gaming and KYC/AML requirements.",

    createEvent:
      "Create event",

    league:
      "League",

    homeTeam:
      "Team/Player 1",

    awayTeam:
      "Team/Player 2",

    startTime:
      "Date/time",

    markets:
      "Markets/odds",

    create:
      "Create",

    settleEvent:
      "Settle event",

    winningMarket:
      "Winning market",

    settle:
      "Settle and pay winners",

    settleNotice:
      "After the result is verified, winning wallets are automatically credited.",

    agentRequests:
      "Agent applications",

    refresh:
      "Refresh",

    actions:
      "Actions",

    loginRequired:
      "Sign in first.",

    ageRequired:
      "You must confirm that you are at least 18.",

    invalidEmail:
      "Invalid email address.",

    invalidPassword:
      "Password must contain at least 6 characters.",

    accountCreated:
      "Account created successfully.",

    agentStart:
      "Account created. Complete your agent application.",

    loginSuccess:
      "Signed in successfully.",

    resetSent:
      "Password reset email sent.",

    invalidCredentials:
      "Incorrect email or password.",

    emailUsed:
      "An account already exists with this email.",

    emptyTicket:
      "No selections.",

    selectionAdded:
      "Selection added.",

    invalidAmount:
      "Invalid amount.",

    serverError:
      "Server error.",

    paymentProcessing:
      "Processing request...",

    saved:
      "Saved.",

    excluded:
      "Self-exclusion enabled.",

    noHistory:
      "No transactions.",

    noEvents:
      "No open events.",

    natcashUnavailable:
      "NatCash requires its official merchant API before real transactions can be enabled.",

    moncashLive:
      "MonCash uses the mode configured on the MystroParyaj server."
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
    agentRequest: "Solicitud de agente",

    responsible:
      "Juega responsablemente.",

    limits:
      "Mis límites",

    securePlatform:
      "Plataforma segura",

    heroTitle:
      "Apuesta fácilmente. Sigue todo claramente.",

    heroText:
      "15 categorías, billetera multidivisa, MonCash, NatCash y estadísticas.",

    startBet:
      "Ver apuestas",

    manageWallet:
      "Gestionar billetera",

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

    chooseEvent:
      "Elige una categoría y una apuesta.",

    allEvents:
      "Todos los eventos",

    searchEvent:
      "Buscar evento",

    betslipHelp:
      "Comprueba tus selecciones antes de validar.",

    stake:
      "Apuesta",

    totalOdds:
      "Cuota total",

    potentialReturn:
      "Retorno potencial",

    placeBet:
      "Validar apuesta",

    betSecurity:
      "Las cuotas y el saldo son verificados por el servidor antes de aceptar el boleto.",

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

    mobileMoney:
      "Dinero móvil",

    phone:
      "Número de teléfono",

    phonePlaceholder:
      "+509 XX XX XX XX",

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

    rateNotice:
      "Las tasas provienen del servidor MystroParyaj.",

    historyText:
      "Tus apuestas y transacciones.",

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

    email:
      "Correo electrónico",

    accountType:
      "Tipo de cuenta",

    language:
      "Idioma",

    mainCurrency:
      "Moneda principal",

    responsibleGaming:
      "Juego responsable",

    dailyDepositLimit:
      "Límite diario de depósito",

    dailyBetLimit:
      "Límite diario de apuestas",

    save:
      "Guardar",

    selfExclude:
      "Autoexclusión",

    agentSpaceText:
      "Área reservada para agentes aprobados.",

    agentClients:
      "Jugadores asociados",

    agentCommission:
      "Comisión",

    agentCode:
      "Código de agente",

    agentCodePlaceholder:
      "Ej. MP-A1B2C3",

    linkAgent:
      "Vincular agente",

    linkedPlayers:
      "Jugadores asociados",

    adminText:
      "Gestión segura de MystroParyaj.",

    totalStakes:
      "Apuestas totales",

    users:
      "Usuarios",

    loginRegister:
      "Iniciar sesión / Registro",

    emailAuthText:
      "Inicia sesión o crea tu cuenta con correo electrónico.",

    password:
      "Contraseña",

    emailPlaceholder:
      "ejemplo@email.com",

    passwordPlaceholder:
      "Mínimo 6 caracteres",

    playerAccount:
      "Cuenta de jugador",

    playerAccountText:
      "Para apostar y gestionar tu billetera.",

    agentAccount:
      "Cuenta de agente",

    agentAccountText:
      "Completa la solicitud de agente después del registro.",

    ageConfirm:
      "Confirmo que tengo al menos 18 años.",

    login:
      "Iniciar sesión",

    register:
      "Crear cuenta",

    logout:
      "Cerrar sesión",

    forgotPassword:
      "¿Olvidaste tu contraseña?",

    limitsInfo:
      "Gestiona tus límites de juego responsable.",

    manageLimits:
      "Gestionar límites",

    agentRequestHelp:
      "Completa la información. La cuenta de agente se activa después de la verificación.",

    fullName:
      "Nombre completo",

    city:
      "Ciudad / comuna",

    address:
      "Dirección",

    idType:
      "Tipo de identificación",

    idNumber:
      "Número de identificación",

    agentTerms:
      "Acepto la verificación y las condiciones de la cuenta de agente.",

    submitRequest:
      "Enviar solicitud",

    agentCriteria:
      "Criterios de cuenta de agente",

    criteria18:
      "Tener al menos 18 años.",

    criteriaIdentity:
      "Proporcionar información de identidad correcta.",

    criteriaContact:
      "Tener un número y dirección válidos.",

    criteriaReview:
      "MystroParyaj debe aprobar la solicitud antes de activar la cuenta.",

    criteriaRules:
      "Respetar las reglas de juego responsable y KYC/AML.",

    createEvent:
      "Crear evento",

    league:
      "Liga",

    homeTeam:
      "Equipo/Jugador 1",

    awayTeam:
      "Equipo/Jugador 2",

    startTime:
      "Fecha/hora",

    markets:
      "Mercados/cuotas",

    create:
      "Crear",

    settleEvent:
      "Liquidar evento",

    winningMarket:
      "Mercado ganador",

    settle:
      "Liquidar y pagar ganadores",

    settleNotice:
      "Después de verificar el resultado, las billeteras ganadoras se acreditan automáticamente.",

    agentRequests:
      "Solicitudes de agentes",

    refresh:
      "Actualizar",

    actions:
      "Acciones",

    loginRequired:
      "Inicia sesión primero.",

    ageRequired:
      "Debes confirmar que tienes al menos 18 años.",

    invalidEmail:
      "Correo electrónico no válido.",

    invalidPassword:
      "La contraseña debe contener al menos 6 caracteres.",

    accountCreated:
      "Cuenta creada correctamente.",

    agentStart:
      "Cuenta creada. Completa tu solicitud de agente.",

    loginSuccess:
      "Sesión iniciada correctamente.",

    resetSent:
      "Correo de recuperación enviado.",

    invalidCredentials:
      "Correo o contraseña incorrectos.",

    emailUsed:
      "Ya existe una cuenta con este correo.",

    emptyTicket:
      "No hay selecciones.",

    selectionAdded:
      "Selección añadida al boleto.",

    invalidAmount:
      "Monto no válido.",

    serverError:
      "Error del servidor.",

    paymentProcessing:
      "Procesando solicitud...",

    saved:
      "Guardado.",

    excluded:
      "Autoexclusión activada.",

    noHistory:
      "No hay transacciones.",

    noEvents:
      "No hay eventos abiertos.",

    natcashUnavailable:
      "NatCash requiere su API comercial oficial antes de activar transacciones reales.",

    moncashLive:
      "MonCash utiliza el modo configurado en el servidor MystroParyaj."
  }
};


// =====================================================
// TRANSLATION
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
// HELPERS
// =====================================================

function escapeHtml(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function money(
  amount,
  currency = state.currency
) {

  return (
    Number(amount || 0)
      .toLocaleString(
        undefined,
        {
          maximumFractionDigits: 2
        }
      ) +
    " " +
    currency
  );
}


let toastTimer = null;


function toast(message) {

  const element = $("#toast");

  if (!element) return;

  element.textContent =
    message;

  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(
      () => {
        element.classList.remove(
          "show"
        );
      },
      2800
    );
}


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
        localStorage.getItem(
          selectionKey()
        ) || "[]"
      );

  } catch {

    state.selections = [];
  }
}


function saveSelections() {

  localStorage.setItem(
    selectionKey(),
    JSON.stringify(
      state.selections
    )
  );
}


function savePreferences() {

  localStorage.setItem(
    "mp_lang",
    state.lang
  );

  localStorage.setItem(
    "mp_currency",
    state.currency
  );
}


// =====================================================
// MODALS
// =====================================================

function openModal(id) {

  $("#" + id)?.classList.add(
    "open"
  );
}


function closeModal(id) {

  $("#" + id)?.classList.remove(
    "open"
  );
}


// =====================================================
// SIDEBAR
// =====================================================

function openSidebar() {

  $("#sidebar")?.classList.add(
    "open"
  );

  $("#sidebarOverlay")
    ?.classList.add("open");

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "true"
    );
}


function closeSidebar() {

  $("#sidebar")
    ?.classList.remove("open");

  $("#sidebarOverlay")
    ?.classList.remove("open");

  $("#menuBtn")
    ?.setAttribute(
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
    toast("Accès refusé.");
    return;
  }

  if (
    pageName === "agent" &&
    !state.isAgent
  ) {
    toast("Accès refusé.");
    return;
  }

  $$(".page").forEach(page => {

    page.classList.toggle(
      "active",
      page.id ===
        `page-${pageName}`
    );
  });

  $$(".nav-link")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page ===
          pageName
      );
    });

  closeSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (
    pageName === "admin" &&
    state.isAdmin
  ) {
    loadAdmin();
  }

  if (
    pageName === "agent" &&
    state.isAgent
  ) {
    loadAgentDashboard();
  }
}


// =====================================================
// LANGUAGE
// =====================================================

function applyLanguage() {

  document.documentElement.lang =
    state.lang;

  $$("[data-i18n]")
    .forEach(element => {

      element.textContent =
        tr(
          element.dataset.i18n
        );
    });

  $$("[data-i18n-placeholder]")
    .forEach(element => {

      element.placeholder =
        tr(
          element.dataset
            .i18nPlaceholder
        );
    });

  if ($("#languageSelect")) {

    $("#languageSelect").value =
      state.lang;
  }

  if ($("#profileLanguage")) {

    const names = {
      ht: "Kreyòl",
      fr: "Français",
      en: "English",
      es: "Español"
    };

    $("#profileLanguage").value =
      names[state.lang];
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
    code.includes(
      "email-already-in-use"
    )
  ) {
    return tr("emailUsed");
  }

  if (
    code.includes(
      "invalid-email"
    )
  ) {
    return tr("invalidEmail");
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

  return (
    error?.message ||
    tr("serverError")
  );
}


// =====================================================
// API
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
          options.method ||
          "GET",

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
// REGISTER
// =====================================================

async function registerUser() {

  const email =
    $("#authEmail")
      ?.value.trim() || "";

  const password =
    $("#authPassword")
      ?.value || "";

  const ageAccepted =
    $("#ageCheck")
      ?.checked === true;

  const accountChoice =
    document.querySelector(
      'input[name="accountType"]:checked'
    )?.value ||
    "player";

  const status =
    $("#authStatus");

  if (!ageAccepted) {

    status.textContent =
      tr("ageRequired");

    status.className =
      "status error";

    return;
  }

  if (
    !email.includes("@")
  ) {

    status.textContent =
      tr("invalidEmail");

    status.className =
      "status error";

    return;
  }

  if (
    password.length < 6
  ) {

    status.textContent =
      tr("invalidPassword");

    status.className =
      "status error";

    return;
  }

  try {

    $("#emailRegisterBtn")
      .disabled = true;

    await registerWithEmail(
      email,
      password,
      accountChoice
    );

    status.textContent =
      accountChoice === "agent"
        ? tr("agentStart")
        : tr("accountCreated");

    status.className =
      "status success";

    setTimeout(
      () => {

        closeModal(
          "authModal"
        );

        if (
          accountChoice ===
          "agent"
        ) {
          showPage(
            "agent-request"
          );
        }
      },
      700
    );

  } catch (error) {

    status.textContent =
      firebaseError(error);

    status.className =
      "status error";

  } finally {

    $("#emailRegisterBtn")
      .disabled = false;
  }
}


// =====================================================
// LOGIN
// =====================================================

async function loginUser() {

  const email =
    $("#authEmail")
      ?.value.trim() || "";

  const password =
    $("#authPassword")
      ?.value || "";

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

    $("#emailLoginBtn")
      .disabled = true;

    await loginWithEmail(
      email,
      password
    );

    status.textContent =
      tr("loginSuccess");

    status.className =
      "status success";

    setTimeout(
      () =>
        closeModal(
          "authModal"
        ),
      500
    );

  } catch (error) {

    status.textContent =
      firebaseError(error);

    status.className =
      "status error";

  } finally {

    $("#emailLoginBtn")
      .disabled = false;
  }
}


// =====================================================
// RESET PASSWORD
// =====================================================

async function forgotPassword() {

  const email =
    $("#authEmail")
      ?.value.trim() || "";

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
// SESSION DATA
// =====================================================

async function loadSessionData() {

  if (!state.user) {

    state.me = null;

    state.isAdmin =
      false;

    state.isAgent =
      false;

    state.wallet = {
      balances: {
        HTG: 0,
        USD: 0,
        EUR: 0,
        CAD: 0,
        DOP: 0
      }
    };

    state.history = [];
    state.bets = [];

    return;
  }

  const [
    me,
    wallet,
    history,
    bets
  ] =
    await Promise.all([
      apiFetch("/api/me"),
      apiFetch("/api/wallet"),
      apiFetch("/api/history"),
      apiFetch("/api/bets")
    ]);

  state.me = me;

  state.isAdmin =
    me.role === "admin";

  state.isAgent =
    me.role === "agent" &&
    me.agentStatus ===
      "approved";

  state.wallet =
    wallet || {
      balances: {}
    };

  state.history =
    history.items || [];

  state.bets =
    bets.items || [];

  state.agentRequest =
    me.agentRequest ||
    null;
}


// =====================================================
// ROLE UI
// =====================================================

function updateRoleUI() {

  $$(".admin-only")
    .forEach(element => {

      element.hidden =
        !state.isAdmin;
    });

  $$(".agent-only")
    .forEach(element => {

      element.hidden =
        !state.isAgent;
    });

  const wantsAgent =
    state.me
      ?.requestedAccountType ===
        "agent" ||
    (
      state.me
        ?.agentRequestStatus &&
      state.me
        ?.agentRequestStatus !==
        "none"
    );

  $$(".agent-request-link")
    .forEach(element => {

      element.hidden =
        !state.user ||
        state.isAgent ||
        !wantsAgent;
    });

  $("#logoutBtn")
    ?.classList.toggle(
      "hidden",
      !state.user
    );

  if ($("#profileEmail")) {

    $("#profileEmail").value =
      state.user?.email ||
      "—";
  }

  if ($("#profileCurrency")) {

    $("#profileCurrency").value =
      state.currency;
  }

  if ($("#profileAccountType")) {

    let accountLabel =
      tr("playerAccount");

    if (state.isAgent) {

      accountLabel =
        tr("agentAccount");
    }

    else if (
      state.me
        ?.agentRequestStatus ===
        "pending"
    ) {

      accountLabel =
        state.lang === "fr"
          ? "Demande agent en attente"
          : state.lang === "en"
            ? "Agent request pending"
            : state.lang === "es"
              ? "Solicitud de agente pendiente"
              : "Demann ajan an ap tann";
    }

    else if (
      state.me
        ?.agentRequestStatus ===
        "rejected"
    ) {

      accountLabel =
        state.lang === "fr"
          ? "Demande agent refusée"
          : state.lang === "en"
            ? "Agent request rejected"
            : state.lang === "es"
              ? "Solicitud de agente rechazada"
              : "Demann ajan refize";
    }

    $("#profileAccountType").value =
      accountLabel;
  }

  if ($("#linkedAgentInfo")) {

    $("#linkedAgentInfo")
      .textContent =
        state.me
          ?.linkedAgentCode
          ? `Agent: ${
              state.me
                .linkedAgentCode
            }`
          : "";
  }

  if ($("#agentLinkArea")) {

    $("#agentLinkArea")
      .style.display =
        state.isAgent
          ? "none"
          : "block";
  }

  if ($("#depositLimit")) {

    $("#depositLimit").value =
      state.me
        ?.limits
        ?.dailyDeposit ??
      5000;
  }

  if ($("#betLimit")) {

    $("#betLimit").value =
      state.me
        ?.limits
        ?.dailyBet ??
      3000;
  }

  renderAgentRequestStatus();
}


// =====================================================
// AUTH WATCHER
// =====================================================

watchAuth(
  async user => {

    state.user =
      user || null;

    loadSelections();

    try {

      await loadSessionData();

    } catch (error) {

      console.error(error);

      toast(
        error.message
      );
    }

    updateRoleUI();

    renderEverything();
  }
);


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

  await logoutUser();

  state.user = null;

  await loadSessionData();

  loadSelections();

  updateRoleUI();

  showPage("home");

  renderEverything();
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

    state.rates =
      data.rates || null;

    if (
      $("#environmentBadge")
    ) {

      $("#environmentBadge")
        .textContent =
          (
            data.mode ||
            "API"
          ).toUpperCase();
    }

    calculateExchange();

  } catch (error) {

    console.error(
      "Rates:",
      error
    );
  }
}


// =====================================================
// EVENTS
// =====================================================

async function loadEvents() {

  try {

    const data =
      await apiFetch(
        "/api/events"
      );

    state.events =
      data.items || [];

  } catch (error) {

    console.error(
      "Events:",
      error
    );

    state.events = [];
  }

  renderEvents();
  renderFeatured();
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
          <strong>
            ${escapeHtml(label)}
          </strong>
        </button>
      `
    ).join("");

  $$(".category")
    .forEach(button => {

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
// EVENT HTML
// =====================================================

function eventHtml(event) {

  const markets =
    Object.entries(
      event.markets || {}
    );

  return `
    <article class="event">

      <div>

        <div class="event-meta">
          ${escapeHtml(
            event.league || ""
          )}
          •
          ${escapeHtml(
            event.startLabel ||
            event.startTime ||
            ""
          )}
        </div>

        <h3>
          ${escapeHtml(
            event.home || ""
          )}
          —
          ${escapeHtml(
            event.away || ""
          )}
        </h3>

      </div>

      <div class="odds">

        ${markets.map(
          ([market, odd]) => {

            const selected =
              state.selections
                .some(
                  item =>
                    item.eventId ===
                      event.id &&
                    item.market ===
                      market
                );

            return `
              <button
                type="button"
                class="odd ${
                  selected
                    ? "selected"
                    : ""
                }"
                data-event="${
                  escapeHtml(
                    event.id
                  )
                }"
                data-market="${
                  escapeHtml(
                    market
                  )
                }"
              >
                <small>
                  ${escapeHtml(
                    market
                  )}
                </small>

                <strong>
                  ${
                    Number(odd)
                      .toFixed(2)
                  }
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
// BIND ODDS
// =====================================================

function bindOdds() {

  $$(".odd")
    .forEach(button => {

      button.onclick =
        () => {

          const event =
            state.events.find(
              item =>
                item.id ===
                button.dataset.event
            );

          if (!event) return;

          const market =
            button.dataset.market;

          const odd =
            Number(
              event.markets
                ?.[market]
            );

          if (
            !Number.isFinite(odd)
          ) {
            return;
          }

          state.selections =
            state.selections
              .filter(
                item =>
                  item.eventId !==
                  event.id
              );

          state.selections.push({
            eventId:
              event.id,

            market,

            odd,

            title:
              `${event.home} — ${event.away}`
          });

          saveSelections();

          renderEverything();

          toast(
            tr(
              "selectionAdded"
            )
          );
        };
    });
}


// =====================================================
// RENDER EVENTS
// =====================================================

function renderEvents() {

  const box =
    $("#eventsList");

  if (!box) return;

  const search =
    (
      $("#eventSearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();

  let list =
    state.events.filter(
      event =>
        event.sport ===
          state.sport &&
        event.status ===
          "open"
    );

  if (search) {

    list =
      list.filter(
        event =>
          (
            `${event.home} ${event.away} ${event.league}`
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
      : `<p>${
          tr("noEvents")
        }</p>`;

  bindOdds();
}


// =====================================================
// FEATURED
// =====================================================

function renderFeatured() {

  const box =
    $("#featuredEvents");

  if (!box) return;

  const events =
    state.events
      .filter(
        item =>
          item.status ===
          "open"
      )
      .slice(0, 3);

  box.innerHTML =
    events.length
      ? events
          .map(eventHtml)
          .join("")
      : `<p>${
          tr("noEvents")
        }</p>`;

  bindOdds();
}


// =====================================================
// BETSLIP
// =====================================================

function renderBetslip() {

  const box =
    $("#betSelections");

  if (!box) return;

  if (
    !state.selections.length
  ) {

    box.innerHTML =
      `<p>${
        tr("emptyTicket")
      }</p>`;

  } else {

    box.innerHTML =
      state.selections
        .map(
          (item, index) => `
            <div class="event">

              <div>
                <strong>
                  ${escapeHtml(
                    item.title
                  )}
                </strong>

                <p>
                  ${escapeHtml(
                    item.market
                  )}
                  •
                  ${
                    Number(
                      item.odd
                    ).toFixed(2)
                  }
                </p>
              </div>

              <button
                type="button"
                class="danger remove-bet"
                data-index="${index}"
              >
                ×
              </button>

            </div>
          `
        )
        .join("");
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

    $("#totalOdds")
      .textContent =
        odds.toFixed(2);
  }

  if ($("#potentialReturn")) {

    $("#potentialReturn")
      .textContent =
        money(
          stake * odds
        );
  }
}


// =====================================================
// PLACE BET
// =====================================================

async function placeBet() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    toast(
      tr(
        "loginRequired"
      )
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
        ?.value
    );

  if (
    !Number.isFinite(stake) ||
    stake <= 0
  ) {

    toast(
      tr(
        "invalidAmount"
      )
    );

    return;
  }

  try {

    $("#placeBetBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/bet",
        {
          method:
            "POST",

          body: {
            stake,

            currency:
              state.currency,

            selections:
              state.selections
                .map(
                  item => ({
                    eventId:
                      item.eventId,

                    market:
                      item.market
                  })
                )
          }
        }
      );

    state.selections = [];

    saveSelections();

    await loadSessionData();

    updateRoleUI();

    renderEverything();

    toast(
      response.message ||
      "OK"
    );

  } catch (error) {

    toast(
      error.message
    );

  } finally {

    $("#placeBetBtn")
      .disabled = false;
  }
}


// =====================================================
// BALANCES
// =====================================================

function renderBalances() {

  const balances =
    state.wallet
      ?.balances || {};

  const amount =
    Number(
      balances[
        state.currency
      ] || 0
    );

  if ($("#balanceValue")) {

    $("#balanceValue")
      .textContent =
        money(amount);
  }

  if ($("#walletBalance")) {

    $("#walletBalance")
      .textContent =
        money(amount);
  }

  if ($("#stakeCurrency")) {

    $("#stakeCurrency")
      .textContent =
        state.currency;
  }

  if ($("#paymentCurrency")) {

    $("#paymentCurrency")
      .textContent =
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

  if ($("#openBetsValue")) {

    $("#openBetsValue")
      .textContent =
        state.bets
          .filter(
            item =>
              item.status ===
                "open" ||
              item.status ===
                "partially_settled"
          )
          .length;
  }

  if ($("#todayBetsValue")) {

    const today =
      new Date()
        .toDateString();

    $("#todayBetsValue")
      .textContent =
        state.bets
          .filter(
            item =>
              item.createdAt &&
              new Date(
                item.createdAt
              )
                .toDateString() ===
              today
          )
          .length;
  }

  if (
    $("#transactionCountValue")
  ) {

    $("#transactionCountValue")
      .textContent =
        state.history.length;
  }
}


// =====================================================
// HISTORY
// =====================================================

function renderHistory() {

  const body =
    $("#historyBody");

  if (!body) return;

  const items = [

    ...state.history.map(
      item => ({
        date:
          item.createdAt,

        type:
          item.type,

        details:
          item.provider ||
          item.reference ||
          "",

        amount:
          item.amount,

        currency:
          item.currency,

        status:
          item.status
      })
    ),

    ...state.bets.map(
      item => ({
        date:
          item.createdAt,

        type:
          "bet",

        details:
          item.id,

        amount:
          item.stake,

        currency:
          item.currency,

        status:
          item.status
      })
    )
  ];

  items.sort(
    (a, b) =>
      new Date(
        b.date || 0
      ) -
      new Date(
        a.date || 0
      )
  );

  if (!items.length) {

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
    items.map(
      item => `
        <tr>

          <td>
            ${
              item.date
                ? new Date(
                    item.date
                  )
                    .toLocaleString()
                : "—"
            }
          </td>

          <td>
            ${escapeHtml(
              item.type
            )}
          </td>

          <td>
            ${escapeHtml(
              item.details
            )}
          </td>

          <td>
            ${money(
              item.amount,
              item.currency
            )}
          </td>

          <td>
            <span
              class="status-badge ${
                escapeHtml(
                  item.status
                )
              }"
            >
              ${escapeHtml(
                item.status
              )}
            </span>
          </td>

        </tr>
      `
    ).join("");
}


// =====================================================
// PAYMENT
// =====================================================

async function submitPayment() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    toast(
      tr(
        "loginRequired"
      )
    );

    return;
  }

  const amount =
    Number(
      $("#paymentAmount")
        ?.value
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
      tr(
        "invalidAmount"
      );

    status.className =
      "status error";

    return;
  }

  try {

    $("#paymentSubmit")
      .disabled = true;

    status.textContent =
      tr(
        "paymentProcessing"
      );

    status.className =
      "status";

    const response =
      await apiFetch(
        `/api/${
          state.paymentMode
        }`,
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
      response.redirectUrl
    ) {

      window.location.href =
        response.redirectUrl;

      return;
    }

    status.textContent =
      response.message ||
      "OK";

    status.className =
      "status success";

    await loadSessionData();

    renderEverything();

  } catch (error) {

    status.textContent =
      error.message;

    status.className =
      "status error";

  } finally {

    $("#paymentSubmit")
      .disabled = false;
  }
}


// =====================================================
// PROVIDER MESSAGE
// =====================================================

function providerNotice() {

  const element =
    $("#providerNotice");

  if (!element) return;

  if (
    state.provider ===
    "natcash"
  ) {

    element.textContent =
      tr(
        "natcashUnavailable"
      );

  } else {

    element.textContent =
      tr(
        "moncashLive"
      );
  }
}


// =====================================================
// EXCHANGE
// =====================================================

function calculateExchange() {

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
    !state.rates ||
    !from ||
    !to
  ) {
    return;
  }

  const fromRate =
    Number(
      state.rates[from]
    );

  const toRate =
    Number(
      state.rates[to]
    );

  if (
    !fromRate ||
    !toRate
  ) {
    return;
  }

  const amountUsd =
    amount / fromRate;

  const result =
    amountUsd * toRate;

  if ($("#exchangeResult")) {

    $("#exchangeResult").value =
      result.toFixed(2);
  }
}


// =====================================================
// EXECUTE EXCHANGE
// =====================================================

async function executeExchange() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    return;
  }

  const amount =
    Number(
      $("#exchangeAmount")
        ?.value
    );

  const from =
    $("#fromCurrency")
      ?.value;

  const to =
    $("#toCurrency")
      ?.value;

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      tr(
        "invalidAmount"
      )
    );

    return;
  }

  if (from === to) {

    toast(
      "Chwazi 2 lajan diferan."
    );

    return;
  }

  try {

    $("#exchangeBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/exchange",
        {
          method:
            "POST",

          body: {
            amount,
            from,
            to
          }
        }
      );

    await loadSessionData();

    renderEverything();

    calculateExchange();

    toast(
      response.message ||
      "OK"
    );

  } catch (error) {

    toast(
      error.message
    );

  } finally {

    $("#exchangeBtn")
      .disabled = false;
  }
}


// =====================================================
// RESPONSIBLE GAMING LIMITS
// =====================================================

async function saveLimits() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    return;
  }

  const dailyDeposit =
    Number(
      $("#depositLimit")
        ?.value || 0
    );

  const dailyBet =
    Number(
      $("#betLimit")
        ?.value || 0
    );

  try {

    await apiFetch(
      "/api/limits",
      {
        method:
          "POST",

        body: {
          dailyDeposit,
          dailyBet
        }
      }
    );

    await loadSessionData();

    updateRoleUI();

    toast(
      tr("saved")
    );

  } catch (error) {

    toast(
      error.message
    );
  }
}


// =====================================================
// SELF EXCLUSION
// =====================================================

async function selfExclude() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    return;
  }

  const confirmed =
    confirm(
      "Konfime oto-eksklizyon an?"
    );

  if (!confirmed) return;

  try {

    await apiFetch(
      "/api/self-exclude",
      {
        method:
          "POST",

        body: {
          enabled:
            true
        }
      }
    );

    await loadSessionData();

    updateRoleUI();

    toast(
      tr(
        "excluded"
      )
    );

  } catch (error) {

    toast(
      error.message
    );
  }
}


// =====================================================
// AGENT REQUEST STATUS
// =====================================================

function renderAgentRequestStatus() {

  const box =
    $("#agentRequestStatusBox");

  if (!box) return;

  if (!state.user) {

    box.textContent =
      tr(
        "loginRequired"
      );

    return;
  }

  const requestStatus =
    state.me
      ?.agentRequestStatus ||
    "not_submitted";

  const messages = {

    not_submitted:
      state.lang === "fr"
        ? "La demande agent n'a pas encore été envoyée."
        : state.lang === "en"
          ? "Agent application has not been submitted yet."
          : state.lang === "es"
            ? "La solicitud de agente aún no ha sido enviada."
            : "Demann ajan poko voye.",

    pending:
      state.lang === "fr"
        ? "La demande agent est en cours de vérification."
        : state.lang === "en"
          ? "Agent application is pending verification."
          : state.lang === "es"
            ? "La solicitud de agente está en revisión."
            : "Demann ajan an ap tann verifikasyon.",

    approved:
      state.lang === "fr"
        ? "Le compte agent est approuvé."
        : state.lang === "en"
          ? "Agent account is approved."
          : state.lang === "es"
            ? "La cuenta de agente está aprobada."
            : "Kont ajan an apwouve.",

    rejected:
      state.lang === "fr"
        ? "La demande a été refusée. Vous pouvez corriger les informations et la soumettre à nouveau."
        : state.lang === "en"
          ? "The application was rejected. You can correct the information and resubmit it."
          : state.lang === "es"
            ? "La solicitud fue rechazada. Puedes corregirla y volver a enviarla."
            : "Demann ajan an refize. Ou ka korije enfòmasyon yo epi re-soumèt."
  };

  box.innerHTML = `
    <strong>
      ${
        escapeHtml(
          messages[
            requestStatus
          ] ||
          requestStatus
        )
      }
    </strong>
  `;
}


// =====================================================
// SUBMIT AGENT REQUEST
// =====================================================

async function submitAgentRequest() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    return;
  }

  if (
    !$("#agentTermsCheck")
      ?.checked
  ) {

    toast(
      "Aksepte kondisyon ajan yo."
    );

    return;
  }

  const body = {

    fullName:
      $("#agentFullName")
        ?.value.trim(),

    phone:
      $("#agentPhone")
        ?.value.trim(),

    city:
      $("#agentCity")
        ?.value.trim(),

    address:
      $("#agentAddress")
        ?.value.trim(),

    idType:
      $("#agentIdType")
        ?.value,

    idNumber:
      $("#agentIdNumber")
        ?.value.trim()
  };

  if (
    !body.fullName ||
    !body.phone ||
    !body.city ||
    !body.address ||
    !body.idNumber
  ) {

    toast(
      "Ranpli tout chan obligatwa yo."
    );

    return;
  }

  const status =
    $("#agentRequestFormStatus");

  try {

    $("#submitAgentRequestBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/agent/apply",
        {
          method:
            "POST",

          body
        }
      );

    status.textContent =
      response.message ||
      "OK";

    status.className =
      "status success";

    await loadSessionData();

    updateRoleUI();

  } catch (error) {

    status.textContent =
      error.message;

    status.className =
      "status error";

  } finally {

    $("#submitAgentRequestBtn")
      .disabled = false;
  }
}


// =====================================================
// LINK PLAYER TO AGENT
// =====================================================

async function linkAgent() {

  if (!state.user) {

    openModal(
      "authModal"
    );

    return;
  }

  const code =
    $("#agentCodeInput")
      ?.value
      .trim()
      .toUpperCase();

  if (!code) {

    toast(
      "Antre kòd ajan an."
    );

    return;
  }

  try {

    $("#linkAgentBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/agent/link",
        {
          method:
            "POST",

          body: {
            code
          }
        }
      );

    await loadSessionData();

    updateRoleUI();

    toast(
      response.message ||
      "OK"
    );

  } catch (error) {

    toast(
      error.message
    );

  } finally {

    $("#linkAgentBtn")
      .disabled = false;
  }
}


// =====================================================
// AGENT DASHBOARD
// =====================================================

async function loadAgentDashboard() {

  if (!state.isAgent) return;

  try {

    const data =
      await apiFetch(
        "/api/agent/dashboard"
      );

    if ($("#agentCode")) {

      $("#agentCode")
        .textContent =
          data.agentCode ||
          "—";
    }

    if ($("#agentClients")) {

      $("#agentClients")
        .textContent =
          data.players
            ?.length || 0;
    }

    if ($("#agentCommission")) {

      $("#agentCommission")
        .textContent =
          money(
            data.commissionHTG ||
            0,
            "HTG"
          );
    }

    if ($("#agentStatus")) {

      $("#agentStatus")
        .textContent =
          data.status ||
          "—";
    }

    const body =
      $("#agentPlayersBody");

    if (body) {

      const players =
        data.players || [];

      body.innerHTML =
        players.length
          ? players
              .map(
                player => `
                  <tr>
                    <td>
                      ${
                        escapeHtml(
                          player.email ||
                          "—"
                        )
                      }
                    </td>

                    <td>
                      ${
                        player.linkedAt
                          ? new Date(
                              player.linkedAt
                            )
                              .toLocaleString()
                          : "—"
                      }
                    </td>
                  </tr>
                `
              )
              .join("")
          : `
              <tr>
                <td colspan="2">
                  —
                </td>
              </tr>
            `;
    }

  } catch (error) {

    toast(
      error.message
    );
  }
}


// =====================================================
// ADMIN
// =====================================================

async function loadAdmin() {

  if (!state.isAdmin) return;

  try {

    const dashboard =
      await apiFetch(
        "/api/admin/dashboard"
      );

    if ($("#adminStakes")) {

      $("#adminStakes")
        .textContent =
          money(
            dashboard
              .totalStakesHTG ||
            0,
            "HTG"
          );
    }

    if ($("#adminOpenBets")) {

      $("#adminOpenBets")
        .textContent =
          dashboard
            .openBets || 0;
    }

    if (
      $("#adminTransactions")
    ) {

      $("#adminTransactions")
        .textContent =
          dashboard
            .transactions || 0;
    }

    if ($("#adminUsers")) {

      $("#adminUsers")
        .textContent =
          dashboard
            .users || 0;
    }


    const requests =
      await apiFetch(
        "/api/admin/agent-requests"
      );

    const body =
      $("#adminAgentRequestsBody");

    if (body) {

      const items =
        requests.items || [];

      body.innerHTML =
        items.length
          ? items
              .map(
                item => `
                  <tr>

                    <td>
                      ${
                        escapeHtml(
                          item.email ||
                          ""
                        )
                      }
                    </td>

                    <td>
                      ${
                        escapeHtml(
                          item.fullName ||
                          ""
                        )
                      }
                    </td>

                    <td>
                      ${
                        escapeHtml(
                          item.city ||
                          ""
                        )
                      }
                    </td>

                    <td>
                      <span
                        class="status-badge ${
                          escapeHtml(
                            item.status ||
                            "pending"
                          )
                        }"
                      >
                        ${
                          escapeHtml(
                            item.status ||
                            "pending"
                          )
                        }
                      </span>
                    </td>

                    <td>

                      <button
                        type="button"
                        class="primary small agent-approve"
                        data-uid="${
                          escapeHtml(
                            item.uid
                          )
                        }"
                      >
                        ✓
                      </button>

                      <button
                        type="button"
                        class="danger small agent-reject"
                        data-uid="${
                          escapeHtml(
                            item.uid
                          )
                        }"
                      >
                        ×
                      </button>

                    </td>

                  </tr>
                `
              )
              .join("")
          : `
              <tr>
                <td colspan="5">
                  —
                </td>
              </tr>
            `;
    }

    $$(".agent-approve")
      .forEach(button => {

        button.onclick =
          () =>
            reviewAgent(
              button.dataset.uid,
              "approved"
            );
      });

    $$(".agent-reject")
      .forEach(button => {

        button.onclick =
          () =>
            reviewAgent(
              button.dataset.uid,
              "rejected"
            );
      });

  } catch (error) {

    toast(
      error.message
    );
  }
}


// =====================================================
// REVIEW AGENT
// =====================================================

async function reviewAgent(
  uid,
  status
) {

  try {

    await apiFetch(
      "/api/admin/agent-review",
      {
        method:
          "POST",

        body: {
          uid,
          status
        }
      }
    );

    toast("OK");

    await loadAdmin();

  } catch (error) {

    toast(
      error.message
    );
  }
}


// =====================================================
// ADMIN CREATE EVENT
// =====================================================

async function createEvent() {

  if (!state.isAdmin) return;

  const markets = {};

  const raw =
    $("#adminMarkets")
      ?.value || "";

  raw.split(",")
    .forEach(item => {

      const [
        market,
        odd
      ] =
        item.split(":");

      const value =
        Number(odd);

      if (
        market &&
        Number.isFinite(value) &&
        value > 1
      ) {

        markets[
          market.trim()
        ] =
          value;
      }
    });

  const body = {

    sport:
      $("#adminSport")
        ?.value,

    league:
      $("#adminLeague")
        ?.value.trim(),

    home:
      $("#adminHome")
        ?.value.trim(),

    away:
      $("#adminAway")
        ?.value.trim(),

    startTime:
      $("#adminStart")
        ?.value,

    markets
  };

  const status =
    $("#adminEventStatus");

  try {

    $("#adminCreateEventBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/admin/events",
        {
          method:
            "POST",

          body
        }
      );

    status.textContent =
      response.message ||
      response.id ||
      "OK";

    status.className =
      "status success";

    await loadEvents();

  } catch (error) {

    status.textContent =
      error.message;

    status.className =
      "status error";

  } finally {

    $("#adminCreateEventBtn")
      .disabled = false;
  }
}


// =====================================================
// ADMIN SETTLEMENT
// =====================================================

async function settleEvent() {

  if (!state.isAdmin) return;

  const eventId =
    $("#settleEventId")
      ?.value.trim();

  const winningMarket =
    $("#settleMarket")
      ?.value.trim();

  if (
    !eventId ||
    !winningMarket
  ) {

    toast(
      "Antre Event ID ak mache gagnan an."
    );

    return;
  }

  const confirmed =
    confirm(
      "Konfime rezilta sa a? Aksyon sa ka kredite jwè ki genyen yo."
    );

  if (!confirmed) return;

  const status =
    $("#adminSettleStatus");

  try {

    $("#adminSettleBtn")
      .disabled = true;

    const response =
      await apiFetch(
        "/api/admin/settle",
        {
          method:
            "POST",

          body: {
            eventId,
            winningMarket
          }
        }
      );

    status.textContent =
      response.message ||
      "OK";

    status.className =
      "status success";

    await loadEvents();

    await loadAdmin();

  } catch (error) {

    status.textContent =
      error.message;

    status.className =
      "status error";

  } finally {

    $("#adminSettleBtn")
      .disabled = false;
  }
}


// =====================================================
// RENDER EVERYTHING
// =====================================================

function renderEverything() {

  renderCategories();

  renderEvents();

  renderFeatured();

  renderBetslip();

  renderBalances();

  renderHistory();

  updateRoleUI();

  providerNotice();
}


// =====================================================
// MENU
// =====================================================

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


// =====================================================
// NAV LINKS
// =====================================================

$$(".nav-link")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showPage(
          button.dataset.page
        );
      }
    );
  });


$$("[data-go]")
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const page =
          button.dataset.go;

        if (page) {

          showPage(page);
        }
      }
    );
  });


$$("[data-close]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const modal =
          button.dataset.close;

        if (modal) {

          closeModal(modal);
        }
      }
    );
  });


// =====================================================
// PROFILE BUTTON
// =====================================================

$("#loginBtn")
  ?.addEventListener(
    "click",
    () => {

      if (state.user) {

        showPage(
          "profile"
        );

      } else {

        openModal(
          "authModal"
        );
      }
    }
  );


// =====================================================
// AUTH BUTTONS
// =====================================================

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


// =====================================================
// LANGUAGE
// =====================================================

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


// =====================================================
// CURRENCY
// =====================================================

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


// =====================================================
// SEARCH
// =====================================================

$("#eventSearch")
  ?.addEventListener(
    "input",
    renderEvents
  );


// =====================================================
// STAKE
// =====================================================

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


// =====================================================
// DEPOSIT / WITHDRAW TABS
// =====================================================

$("#depositTabBtn")
  ?.addEventListener(
    "click",
    () => {

      state.paymentMode =
        "deposit";

      $("#paymentFormTitle")
        .textContent =
          tr("deposit");

      $("#depositTabBtn")
        .className =
          "primary";

      $("#withdrawTabBtn")
        .className =
          "secondary";
    }
  );


$("#withdrawTabBtn")
  ?.addEventListener(
    "click",
    () => {

      state.paymentMode =
        "withdraw";

      $("#paymentFormTitle")
        .textContent =
          tr("withdraw");

      $("#withdrawTabBtn")
        .className =
          "primary";

      $("#depositTabBtn")
        .className =
          "secondary";
    }
  );


// =====================================================
// PAYMENT PROVIDER
// =====================================================

$$(".payment")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        $$(".payment")
          .forEach(item => {

            item.classList.remove(
              "active"
            );
          });

        button.classList.add(
          "active"
        );

        state.provider =
          button.dataset.provider;

        providerNotice();
      }
    );
  });


$("#paymentSubmit")
  ?.addEventListener(
    "click",
    submitPayment
  );


// =====================================================
// EXCHANGE
// =====================================================

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

      calculateExchange();
    }
  );


$("#exchangeBtn")
  ?.addEventListener(
    "click",
    executeExchange
  );


// =====================================================
// LIMITS
// =====================================================

$("#limitsBtn")
  ?.addEventListener(
    "click",
    () =>
      openModal(
        "limitsModal"
      )
  );


$("#saveLimitsBtn")
  ?.addEventListener(
    "click",
    saveLimits
  );


$("#selfExcludeBtn")
  ?.addEventListener(
    "click",
    selfExclude
  );


// =====================================================
// AGENT
// =====================================================

$("#submitAgentRequestBtn")
  ?.addEventListener(
    "click",
    submitAgentRequest
  );


$("#linkAgentBtn")
  ?.addEventListener(
    "click",
    linkAgent
  );


// =====================================================
// ADMIN
// =====================================================

$("#refreshAdminBtn")
  ?.addEventListener(
    "click",
    loadAdmin
  );


$("#adminCreateEventBtn")
  ?.addEventListener(
    "click",
    createEvent
  );


$("#adminSettleBtn")
  ?.addEventListener(
    "click",
    settleEvent
  );


// =====================================================
// ADMIN SPORTS SELECT
// =====================================================

if ($("#adminSport")) {

  $("#adminSport")
    .innerHTML =
      SPORTS.map(
        ([id, , label]) => `
          <option
            value="${id}"
          >
            ${escapeHtml(label)}
          </option>
        `
      ).join("");
}


// =====================================================
// PAYMENT RETURN MESSAGE
// =====================================================

function checkPaymentReturn() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const payment =
    params.get("payment");

  if (!payment) return;

  if (
    payment === "success"
  ) {

    toast(
      state.lang === "fr"
        ? "Paiement confirmé."
        : state.lang === "en"
          ? "Payment confirmed."
          : state.lang === "es"
            ? "Pago confirmado."
            : "Peman konfime."
    );

  } else {

    toast(
      state.lang === "fr"
        ? "Le paiement n'a pas été confirmé."
        : state.lang === "en"
          ? "Payment was not confirmed."
          : state.lang === "es"
            ? "El pago no fue confirmado."
            : "Peman an pa t konfime."
    );
  }

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}


// =====================================================
// PWA
// =====================================================

function registerServiceWorker() {

  if (
    "serviceWorker" in
    navigator
  ) {

    navigator
      .serviceWorker
      .register("./sw.js")
      .catch(error => {

        console.error(
          "Service Worker:",
          error
        );
      });
  }
}


// =====================================================
// START APP
// =====================================================

if ($("#languageSelect")) {

  $("#languageSelect").value =
    state.lang;
}


if ($("#currencySelect")) {

  $("#currencySelect").value =
    state.currency;
}


loadSelections();

applyLanguage();

loadRates();

loadEvents();

checkPaymentReturn();

registerServiceWorker();

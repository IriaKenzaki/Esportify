import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/liste-event", "Liste event", "/pages/event/liste-event.html"),
    new Route("/signin", "Connexion", "/pages/auth/signin.html"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html"),
    new Route("/myaccount", "Gestion du compte", "/pages/account/myaccount.html"),
    new Route("/accounts", "Gestion des comptes", "/pages/account/accounts.html"),
    new Route("/user-account", "Gestion d'un comptes", "/pages/account/user-account.html"),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Esportify";
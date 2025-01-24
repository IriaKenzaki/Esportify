import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", []),
    new Route("/liste-event", "Liste event", "/pages/event/liste-event.html", []),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/myaccount", "Gestion du compte", "/pages/account/myaccount.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/accounts", "Gestion des comptes", "/pages/account/accounts.html", ["ROLE_ADMIN"], "/js/account/accounts.js"),
    new Route("/useraccount", "Gestion d'un compte", "/pages/account/useraccount.html", ["ROLE_ADMIN"]),
    new Route("/scores", "Scores", "/pages/scores.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/liste-participant", "Liste participant", "/pages/event/liste-participant.html", ["ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/new-event", "Création d'évènement", "/pages/event/new-event.html", ["ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/new-event.js"),
    new Route("/inscription", "Mes inscriptions", "/pages/event/inscription.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/my-event", "Mes évènements", "/pages/event/my-event.html",["ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/validation", "Validation d'évènement", "/pages/event/validation.html", ["ROLE_ADMIN"]),
    new Route("/contact", "Contact", "/pages/contact.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/avis", "Avis", "/pages/avis/avis.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/liste-avis", "Liste des Avis", "/pages/avis/liste-avis.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/event", "Evènement", "/pages/event/event.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"]),
    new Route("/dashboard", "Tableau de bord", "/pages/dashboard.html", ["ROLE_ADMIN"]),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Esportify";
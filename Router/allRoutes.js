import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", [], "/js/home.js"),
    new Route("/liste-event", "Liste event", "/pages/event/liste-event.html", [], "/js/event/liste-event.js"),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/myaccount", "Gestion du compte", "/pages/account/myaccount.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/account/myaccount.js"),
    new Route("/accounts", "Gestion des comptes", "/pages/account/accounts.html", ["ROLE_ADMIN"], "/js/account/accounts.js"),
    new Route("/useraccount", "Gestion d'un compte", "/pages/account/useraccount.html", ["ROLE_ADMIN"], "/js/account/useraccount.js"),
    new Route("/scores", "Scores", "/pages/event/scores.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/scores.js"),
    new Route("/liste-participant", "Liste participant", "/pages/event/liste-participant.html", ["ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/liste-participant.js"),
    new Route("/new-event", "Création d'évènement", "/pages/event/new-event.html", ["ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/new-event.js"),
    new Route("/inscription", "Mes inscriptions", "/pages/event/inscription.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/inscription.js"),
    new Route("/my-event", "Mes évènements", "/pages/event/my-event.html",["ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/event/my-event.js"),
    new Route("/validation", "Validation d'évènement", "/pages/event/validation.html", ["ROLE_ADMIN"], "/js/event/validation.js"),
    new Route("/contact", "Contact", "/pages/dashboard/contact.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/dashboard/contact.js"),
    new Route("/avis", "Avis", "/pages/avis/avis.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/avis/avis.js"),
    new Route("/liste-avis", "Liste des Avis", "/pages/avis/liste-avis.html", [], "/js/avis/liste-avis.js"),
    new Route("/event", "Evènement", "/pages/event/event.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/game/loadgame.js"),
    new Route("/dashboard", "Tableau de bord", "/pages/dashboard/dashboard.html", ["ROLE_ADMIN"], "/js/dashboard/dashboard.js"),
    new Route("/Yams", "Yams", "/pages/game/yams.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/game/yams.js"),
    new Route("/Pendu", "Pendu", "/pages/game/pendu.html", ["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"], "/js/game/pendu.js"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Esportify";
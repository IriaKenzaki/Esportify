import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", []),
    new Route("/liste-event", "Liste event", "/pages/event/liste-event.html", []),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/myaccount", "Gestion du compte", "/pages/account/myaccount.html", ["user", "organisateur", "admin"]),
    new Route("/accounts", "Gestion des comptes", "/pages/account/accounts.html", ["admin"]),
    new Route("/useraccount", "Gestion d'un compte", "/pages/account/useraccount.html", ["admin"]),
    new Route("/scores", "Scores", "/pages/scores.html", ["user", "organisateur", "admin"]),
    new Route("/liste-participant", "Liste participant", "/pages/event/liste-participant.html", ["organisateur", "admin"]),
    new Route("/new-event", "Création d'évènement", "/pages/event/new-event.html", ["organisateur", "admin"]),
    new Route("/inscription", "Mes inscriptions", "/pages/event/inscription.html", ["user", "organisateur", "admin"]),
    new Route("/my-event", "Mes évènements", "/pages/event/my-event.html",["organisateur", "admin"]),
    new Route("/validation", "Validation d'évènement", "/pages/event/validation.html", ["admin"]),
    new Route("/contact", "Contact", "/pages/contact.html", ["user", "organisateur", "admin"]),
    new Route("/avis", "Avis", "/pages/avis/avis.html", ["user", "organisateur", "admin"]),
    new Route("/liste-avis", "Liste des Avis", "/pages/avis/liste-avis.html", ["user", "organisateur", "admin"]),
    new Route("/event", "Evènement", "/pages/event/event.html", ["user", "organisateur", "admin"]),
    new Route("/dashboard", "Tableau de bord", "/pages/dashboard.html", ["admin"]),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Esportify";
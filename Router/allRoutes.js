import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/liste-event", "Liste Event", "/pages/liste-event.html"),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Esportify";
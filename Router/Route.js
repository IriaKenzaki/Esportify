export default class Route {
  constructor(url, title, pathHtml, authorize, pathJS = "") {
    this.url = url;
    this.title = title;
    this.pathHtml = pathHtml;
    this.pathJS = pathJS;
    this.authorize = authorize;
  }
}

/* 
[] -> Tout le monde peut y accéder
["disconnected"] -> Réserver aux utilisateurs déconnecté 
["connected"] -> réserver aux utilisateur connecté
["ROLE_USER"] -> Réserver aux utilisateurs avec le rôle user 
["ROLE_ADMIN"] -> Réserver aux utilisateurs avec le rôle admin
["ROLE_ORGANISATEUR"] -> Réserver aux utilisateurs avec le rôle organisateur
["ROLE_USER", "ROLE_ORGANISATEUR"] -> Réserver aux utilisateurs avec le rôle user OU organisateur
["ROLE_USER", "ROLE_ORGANISATEUR", "ROLE_ADMIN"] -> Réserver aux utilisateurs avec le rôle user OU organisateur OU admin
*/
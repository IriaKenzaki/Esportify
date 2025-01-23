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
["user"] -> Réserver aux utilisateurs avec le rôle user 
["admin"] -> Réserver aux utilisateurs avec le rôle admin
["organisateur"] -> Réserver aux utilisateurs avec le rôle organisateur
["user", "organisateur"] -> Réserver aux utilisateurs avec le rôle user OU organisateur
["user", "organisateur", "admin"] -> Réserver aux utilisateurs avec le rôle user OU organisateur OU admin
*/
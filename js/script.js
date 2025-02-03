const tokenCookieName = "accesstoken";
const signoutBtn = document.getElementById("signout-btn");
const RoleCookieName = "role";
const apiUrl = "https://main-bvxea6i-u3bqvlpugi4lo.fr-4.platformsh.site/api/";
const apiUrlImage = 'https://main-bvxea6i-u3bqvlpugi4lo.fr-4.platformsh.site/uploads/images/';

signoutBtn.addEventListener("click", signout);

function signout(){
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    window.location.reload();
}

function getRole(){
    return getCookie(RoleCookieName);
}

function setToken(token){
    setCookie(tokenCookieName, token, 7);
}

function getToken(){
    return getCookie(tokenCookieName);
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function isConnected(){
    if(getToken() ==  null || getToken == undefined){
        return false;
    }else{
        return true;
    }
}

/* 
disconnected
connected (admin ou organisateur ou user)
    - admin
    - user
    - organisateur
*/

const showAndHideElementsForRoles = () => {
    const userRole = getRole(); // Récupère le rôle de l'utilisateur
    const isUserConnected = isConnected(); // Vérifie si l'utilisateur est connecté
  
    console.log("User Role:", userRole); // Vérifier le rôle de l'utilisateur
    console.log("User Connected:", isUserConnected); // Vérifier si l'utilisateur est connecté
  
    // Sélectionner tous les éléments avec un attribut 'data-show'
    const elements = document.querySelectorAll('[data-show]');
    console.log("Elements to check:", elements);
  
    elements.forEach((element) => {
      const allowedRoles = element.getAttribute('data-show').split(',');
      console.log("Allowed Roles for element:", allowedRoles);
  
      // Vérification de l'affichage
      if ((allowedRoles.includes("connected") && isUserConnected) || 
          (allowedRoles.includes("disconnected") && !isUserConnected) || 
          allowedRoles.includes(userRole)) {
        console.log("Displaying:", element); // Si affichage
        element.style.display = "block"; // Afficher l'élément
      } else {
        console.log("Hiding:", element); // Si masquage
        element.style.display = "none"; // Masquer l'élément
      }
    });
  };


function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML; 
}

const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type !== "number") {
                input.value = sanitizeHtml(input.value);
            }
        });
        form.submit();
    });

    const buttons = form.querySelectorAll('button[type="button"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (input.type !== "number") {
                    input.value = sanitizeHtml(input.value);
                }
            });

            form.submit();
        });
    });
});

function getInfosUser(){
    let myHeaders = new Headers();
    myHeaders.append("X-AUTH-TOKEN", getToken());

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(apiUrl+"account/me", requestOptions)
    .then(response =>{
        if(response.ok){
            return response.json();
        }
        else{
            console.log("Impossible de récupérer les informations utilisateur");
        }
    })
    .then(result => {
        return result;
    })
    .catch(error =>{
        console.error("erreur lors de la récupération des données utilisateur", error);
    });
}    

function formatDate(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0'); 
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
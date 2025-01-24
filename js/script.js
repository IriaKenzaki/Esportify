const tokenCookieName = "accesstoken";
const signoutBtn = document.getElementById("signout-btn");
const RoleCookieName = "role";
const apiUrl = "https://127.0.0.1:8000/api/";

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

function showAndHideElementsForRoles(){
    const userConnected = isConnected();
    const role = getRole();

    let allElementsToEdit = document.querySelectorAll('[data-show]');

    allElementsToEdit.forEach(element =>{
        switch(element.dataset.show){
            case 'disconnected': 
                if(userConnected){
                    element.classList.add("d-none");
                }
                break;
            case 'connected':
                if(!userConnected){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_ADMIN': 
                if(!userConnected || role != "ROLE_ADMIN"){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_USER': 
                if(!userConnected || role != "ROLE_USER"){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_ORGANISATEUR': 
                if(!userConnected || role != "ROLE_ORGANISATEUR"){
                    element.classList.add("d-none");
                }
                break;
        }

    })
}

function sanitizeHtml(text){
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}
document.querySelector('form').addEventListener('submit', function(event) {
    const searchQuery = this.querySelector('input[name="query"]').value;
    this.querySelector('input[name="query"]').value = sanitizeHtml(searchQuery);
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
        console.log(result);
        return result;
    })
    .catch(error =>{
        console.error("erreur lors de la récupération des données utilisateur", error);
    });
}    
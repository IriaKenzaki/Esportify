const tokenCookieName = "accesstoken";
const signoutBtn = document.getElementById("signout-btn");
const signoutBtnF = document.getElementById("signout-btn-f");
const RoleCookieName = "role";
const apiUrl = "https://main-bvxea6i-u3bqvlpugi4lo.fr-4.platformsh.site/api/";
const apiUrlImage = 'https://main-bvxea6i-u3bqvlpugi4lo.fr-4.platformsh.site/uploads/images/';

signoutBtn.addEventListener("click", signout);
signoutBtnF.addEventListener("click", signout);

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
    let elements = document.querySelectorAll('[data-show]');

    elements.forEach(element =>{
        switch(element.dataset.show){
            case 'disconnected': 
                if (!userConnected) {
                    element.classList.remove("d-none"); 
                } else {
                    element.classList.add("d-none");
                }
                break;
            case 'connected':
                if(!userConnected){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_ADMIN': 
                if(!userConnected || !(new Array("ROLE_ADMIN").includes(role) 
                )){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_USER': 
                if(!userConnected || !(new Array("ROLE_ADMIN", "ROLE_ORGANISATEUR", "ROLE_USER").includes(role) 
                )){
                    element.classList.add("d-none");
                }
                break;
            case 'ROLE_ORGANISATEUR': 
                if(!userConnected || !(new Array("ROLE_ADMIN", "ROLE_ORGANISATEUR").includes(role) 
                )){
                    element.classList.add("d-none");
                }
                break;
        }
    })
}

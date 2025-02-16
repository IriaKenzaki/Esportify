const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput");
const btnSingin = document.getElementById("btnSignin");
const signinForm = document.getElementById("signinForm");

btnSingin.addEventListener("click", checkCredentials);

function checkCredentials(event) {
    event.preventDefault();

    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
        alert("Veuillez remplir le reCAPTCHA !");
        return;
    }

    let dataForm = new FormData(signinForm);
    
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        "username": dataForm.get("Email"),
        "password": dataForm.get("Password"),
        "g-recaptcha-response": captchaResponse
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(apiUrl+"login", requestOptions)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        else{
            mailInput.classList.add("is-invalid");
            passwordInput.classList.add("is-invalid");
        }
    })
    .then(result => {
        const token = result.apiToken;
        setToken(token);

        setCookie(RoleCookieName, result.roles[0], 7);
        window.location.replace("/");
    })
    .catch(error => console.error("Erreur lors de la connexion:", error));
}

function reloadRecaptcha() {
    let script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?timestamp=" + new Date().getTime();
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
}

let oldScript = document.querySelector("script[src*='recaptcha/api.js']");
if (oldScript) {
    oldScript.remove();
}
reloadRecaptcha();

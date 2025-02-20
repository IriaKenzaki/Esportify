const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const inputUsername = document.getElementById("UsernameInput"); 
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");

inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);
inputUsername.addEventListener("keyup", validateForm);
btnValidation.addEventListener("click", InscrireUtilisateur);


function validateForm(){
    const mailOk = validateRequired(inputMail);
    const passwordOk = validateRequired(inputPassword);
    const validationPasswordOk = validateRequired(inputValidationPassword);
    const usernameOk = validateRequired(inputUsername);
    const validateMailOk = validateMail(inputMail);
    const validatePasswordOk = validatePassword(inputPassword);
    const passwordConfirmOk = validateConfirmationPassword(inputPassword, inputValidationPassword);
    const captchaOk = grecaptcha.getResponse();
    const captchaValid = captchaOk.length > 0;

    if(mailOk && passwordOk && validateMailOk && validationPasswordOk && usernameOk && validatePasswordOk && passwordConfirmOk && captchaValid){
        btnValidation.disabled = false;
    }else{
        btnValidation.disabled = true;
    }
}

function onCaptchaSuccess() {
    validateForm();
}

function validateConfirmationPassword(inputPwd, inputConfirmPwd){
    if(inputPwd.value == inputConfirmPwd.value){
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    }else{
        inputConfirmPwd.classList.remove("is-valid");
        inputConfirmPwd.classList.add("is-invalid");
        return false;
    }
}

function validateMail(input){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = inputMail.value;
    if(mailUser.match(emailRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function validateRequired(input){
    if(input.value != ''){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function validatePassword(input){
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;
    if(passwordUser.match(passwordRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function InscrireUtilisateur(){

    let dataForm = new FormData(formInscription);
    let username = dataForm.get("Username").trim();
    if (username === "") {
        alert("Le pseudo ne peut pas être vide !");
        return;
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      "email": dataForm.get("Email"),
      "password": dataForm.get("Password"),
      "username": username
    });

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(apiUrl+"registration", requestOptions)
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        else{
            alert("Erreur lors de l'inscription");
            return;
        } 
    })
    .then((result) => {
        alert("Bravo, vous êtes maintenant inscrit, vous pouvez vous connecter.");
        document.location.href="/signin";
    })
    .catch((error) => console.error(error));
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

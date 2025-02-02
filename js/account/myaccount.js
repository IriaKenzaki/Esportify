function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

function validateConfirmationPassword(inputPwd, inputConfirmPwd){
    if(inputPwd.value == inputConfirmPwd.value){
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    } else {
        inputConfirmPwd.classList.remove("is-valid");
        inputConfirmPwd.classList.add("is-invalid");
        return false;
    }
}

const form = document.querySelector('form');
const submitButton = document.getElementById('submitButton');
const token = getToken();

const passwordInput = document.getElementById('PasswordInput');
const validatePasswordInput = document.getElementById('ValidatePasswordInput');

validatePasswordInput.addEventListener('input', () => {
    validateConfirmationPassword(passwordInput, validatePasswordInput);
});

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const username = document.getElementById('UsernameInput').value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = validatePasswordInput.value.trim();
    
    let dataToSend = {};

    if (username) {
        dataToSend.username = username;
    }

    if (password || confirmPassword) {
        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        dataToSend.password = password;
    }

    if (Object.keys(dataToSend).length === 0) {
        alert('Veuillez remplir au moins un champ (pseudo ou mot de passe).');
        return;
    }

    try {
        const headers = new Headers({
            "X-AUTH-TOKEN": token,
            "Content-Type": "application/json",
        });

        const body = JSON.stringify(dataToSend);
        const response = await fetch(apiUrl + 'account/edit', {
            method: 'PUT',
            headers: headers,
            body: body,
        });

        if (response.ok) {
            const result = await response.json();
            alert('Compte modifié avec succès.');
        } else {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.message || 'Impossible de modifier le compte.'}`);
            console.error('Erreur serveur:', errorData);
        }
    } catch (error) {
        console.error('Erreur réseau ou autre:', error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
});

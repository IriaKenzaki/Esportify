const inputTitle = document.getElementById("TitleInput");
const inputDateStart = document.getElementById("DateStartInput");
const inputDateEnd = document.getElementById("DateEndInput");
const inputTimeStart = document.getElementById("TimeStartInput");
const inputTimeEnd = document.getElementById("TimeEndInput");
const inputPlayers = document.getElementById("PlayersInput");
const inputGameSelect = document.getElementById("GameSelectInput");
const inputImage = document.getElementById("imageUpload");
const inputDescription = document.getElementById("DescriptionInput");
const btnCreation = document.getElementById("btn-creation");
const formEvent = document.getElementById("formEvent");

const maxImageSize = 2 * 1024 * 1024;
const maxImageSizeErrorMessage = "L'image est trop grande. La taille maximale autorisée est de 2 Mo.";

btnCreation.addEventListener("click", CreeEvent);
inputTitle.addEventListener("keyup", validateForm);
inputDateStart.addEventListener("keyup", validateForm);
inputDateEnd.addEventListener("keyup", validateForm);
inputTimeStart.addEventListener("keyup", validateForm);
inputTimeEnd.addEventListener("keyup", validateForm);
inputPlayers.addEventListener("keyup", validateForm);
inputGameSelect.addEventListener("keyup", validateForm);
inputImage.addEventListener("change", validateImageSize);
inputDescription.addEventListener("keyup", validateForm);

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

function validateForm() {
    const titleOk = validateRequired(inputTitle);
    const dateStartOk = validateRequired(inputDateStart);
    const dateEndOk = validateRequired(inputDateEnd);
    const timeStartOk = validateRequired(inputTimeStart);
    const timeEndOk = validateRequired(inputTimeEnd);
    const playersOk = validateRequired(inputPlayers);
    const gameSelectOk = validateRequired(inputGameSelect);
    const descriptionOk = validateRequired(inputDescription);

    if (
        titleOk &&
        dateStartOk &&
        dateEndOk &&
        timeStartOk &&
        timeEndOk &&
        playersOk &&
        gameSelectOk &&
        descriptionOk
    ) {
        btnCreation.disabled = false;
    } else {
        btnCreation.disabled = true;
    }
}

function validateRequired(input) {
    if (input.value != "") {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function CreeEvent() {
    const dataForm = new FormData(formEvent);

    const dateTimeStart = `${dataForm.get("DateStartInput")}T${dataForm.get("TimeStartInput")}:00`;
    const dateTimeEnd = `${dataForm.get("DateEndInput")}T${dataForm.get("TimeEndInput")}:00`;

    const playersValue = parseInt(dataForm.get("PlayersInput"), 10);
    const imageFile = dataForm.get("imageUpload");

    if (isNaN(playersValue) || playersValue < 0) {
        alert("Le nombre de joueurs doit être un nombre positif.");
        return;
    }

    if (imageFile && imageFile.size > maxImageSize) {
        alert(maxImageSizeErrorMessage);
        return;
    }

    const formData = new FormData();
    formData.append("title", dataForm.get("Title"));
    formData.append("description", dataForm.get("Description"));
    formData.append("players", playersValue);
    formData.append("dateTimeStart", dateTimeStart);
    formData.append("dateTimeEnd", dateTimeEnd);
    formData.append("game", dataForm.get("GameSelectInput"));
    formData.append("visibility", false);

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token
    });

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: formData,
        redirect: "follow"
    };

    fetch(apiUrl + "event", requestOptions)
        .then((response) => {
            if (!response.ok) {
                alert("Erreur lors de la création de l'événement. Veuillez réessayer.");
                return;
            }
            return response.json();
        })
        .then((result) => {
            if (result) {
                alert("Bravo, votre événement est créé, vous pouvez le retrouver dans vos événements créés.");
                document.location.href = "/my-event";
            }
        })
        .catch((error) => {
            console.error(error);
            alert("Une erreur s'est produite lors de la création de l'événement.");
        });
}

function validateImageSize() {
    const imageFile = inputImage.files[0];
    if (imageFile && imageFile.size > maxImageSize) {
        alert(maxImageSizeErrorMessage);
        inputImage.value = '';
    }
}

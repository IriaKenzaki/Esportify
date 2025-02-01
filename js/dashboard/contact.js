const form = document.querySelector("form");
const titleInput = document.getElementById("TitleInput");
const messageInput = document.querySelector("textarea");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value;
    const message = messageInput.value;

    if (!title || !message) {
        alert("Tous les champs sont requis.");
        return;
    }

    const data = {
        title: title,
        text: message
    };
    const token = getToken();
    fetch(apiUrl+'contact', {
        method: 'POST',
        headers: {
            "X-AUTH-TOKEN": token, 
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors de l'envoi du message.");
        }
        return response.json();
    })
    .then(responseData => {
        alert("Message envoyé avec succès !");
        form.reset();
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
    });
});
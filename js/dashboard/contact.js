const form = document.querySelector("form");
const titleInput = document.getElementById("TitleInput");
const messageInput = document.querySelector("textarea");

form.addEventListener("submit", function (event) {
    event.preventDefault(); // Empêcher le rechargement de la page lors de la soumission du formulaire

    // Récupérer les valeurs des champs du formulaire
    const title = titleInput.value;
    const message = messageInput.value;

    // Valider les champs
    if (!title || !message) {
        alert("Tous les champs sont requis.");
        return;
    }

    // Créer l'objet de données à envoyer à l'API
    const data = {
        title: title, // Utilisation de l'email comme titre
        text: message // Utilisation du message comme texte
    };
    const token = getToken();
    // Envoyer la requête POST à l'API
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
        // Afficher une alerte si l'envoi est réussi
        alert("Message envoyé avec succès !");
        form.reset(); // Réinitialiser le formulaire après l'envoi
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
    });
});
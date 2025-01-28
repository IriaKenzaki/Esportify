function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

document.getElementById('avisForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const title = document.getElementById('AvisInput').value;
    const rate = document.querySelector('input[name="rate"]:checked')?.value;
    const message = document.getElementById('message').value;

    if (!rate) {
        alert("Veuillez sélectionner une évaluation.");
        return;
    }

    if (!title || !rate || !message) {
        alert("Veuillez remplir tous les champs.");
        return;
    }
    const data = {
        title: title,
        rating: parseInt(rate, 10),
        content: message
    };
    const token = getToken();
    console.log("Token récupéré :", token);
    if (!token) {
        alert("Erreur d'authentification : le jeton est manquant.");
        return;
    }
    try {
        console.log(data); 
        const response = await fetch(apiUrl+'avis', {
            method: 'POST',
            headers: {
                "X-AUTH-TOKEN": token, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get("content-type");

        if (response.ok && contentType && contentType.includes("application/json")) {
            const responseData = await response.json();
            alert('Votre avis a bien été envoyé. Merci pour votre retour !');
            document.getElementById('avisForm').reset();
        } else if (contentType && contentType.includes("text/html")) {
            console.error("Le serveur a renvoyé une page HTML. Vérifiez l'erreur côté backend.");
            const errorText = await response.text();
            console.log("HTML reçu :", errorText);
            alert("Une erreur serveur est survenue. Veuillez contacter l'administrateur.");
        } else {
            const errorData = await response.json();
            console.error('Erreur API :', errorData);
            alert('Erreur lors de l\'envoi : ' + (errorData.message || 'Veuillez réessayer.'));
        }
    } catch (error) {
        console.error('Erreur réseau :', error);
        alert('Une erreur réseau est survenue. Veuillez réessayer.');
    }
});
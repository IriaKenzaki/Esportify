// Sélectionner les boutons "Rejoindre"

// Conteneur principal où le jeu sera injecté
const gameContainer = document.getElementById("gameEvent");

// Fonction pour charger le jeu dynamiquement
async function loadGame(gameName, eventId) {
    try {
        // Construire le chemin du fichier HTML du jeu
        const gameHtmlPath = `/${gameName}`;

        // Charger le contenu HTML du jeu
        const response = await fetch(gameHtmlPath);
        if (!response.ok) {
            throw new Error(`Erreur lors du chargement du jeu ${gameName}.`);
        }

        const gameHtml = await response.text();
        gameContainer.innerHTML = gameHtml;

        // Charger dynamiquement le script associé au jeu
        const script = document.createElement("script");
        script.src = `/js/game/${gameName}.js`;
        document.body.appendChild(script);

        // Ajouter l'ID de l'événement dans le localStorage
        localStorage.setItem("eventId", eventId);
        
        // Réinitialiser le localStorage après 5 secondes
        setTimeout(() => {
            localStorage.removeItem("eventId");
        }, 5000); // Ajustez ce délai selon vos besoins
    } catch (error) {
        console.error("Erreur lors du chargement du jeu :", error);
        gameContainer.innerHTML = `<p>${error.message}</p>`;
    }
}

// Fonction qui charge automatiquement le jeu lorsqu'on arrive sur la page de l'événement
(async () => {
    const eventId = localStorage.getItem('eventId');
    console.log('eventId:', eventId); 
    if (!eventId) {
        alert("Aucun ID d'événement trouvé. Veuillez vous inscrire à un événement.");
        console.log("Aucun ID d'événement trouvé dans le localStorage.");
        return; // Ne continuez pas si l'eventId n'est pas disponible
    }
    const token = getToken();
    if (!token) {
        console.error("Aucun token trouvé. L'utilisateur doit se connecter.");
        alert("Veuillez vous connecter pour accéder à l'événement.");
        window.location.href = "/signin";
        return;
    }
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });
    if (eventId) {
        try {
            const response = await fetch(apiUrl+`${eventId}/details`,{
                method: "GET",
                headers: headers,
            });
            if (!response.ok) {
                throw new Error(`Erreur API : ${response.status}`);
            }

            const eventData = await response.json();
            const gameName = eventData.game;

            if (!gameName) {
                throw new Error("Aucun jeu associé à cet événement.");
            }

            gameContainer.style.display = "block";

            await loadGame(gameName, eventId);
        } catch (error) {
            console.error("Erreur lors du chargement de l'événement :", error);
            alert("Une erreur est survenue lors du chargement de l'événement.");
        }
    } else {
        alert("Aucun ID d'événement trouvé. Veuillez vous inscrire à un événement.");
    }
})();

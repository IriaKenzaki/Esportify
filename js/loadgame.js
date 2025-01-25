
// Sélectionner les boutons "Rejoindre"
const joinButtons = document.querySelectorAll(".join-event");

// Conteneur principal où le jeu sera injecté
const containerPageEvent = document.getElementById("containerPageEvent");
const gameContainer = document.getElementById("gameEvent");

// Ajouter un écouteur d'événements sur chaque bouton "Rejoindre"
joinButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
        const eventId = event.target.getAttribute("data-event-id"); // Récupérer l'ID de l'événement
        if (!eventId) {
            console.error("Aucun ID d'événement trouvé.");
            return;
        }

        // Charger les détails de l'événement depuis l'API
        try {
            const response = await fetch(`${apiBaseUrl}/${eventId}`);
            if (!response.ok) {
                throw new Error(`Erreur API : ${response.status}`);
            }

            // Récupérer les données de l'événement
            const eventData = await response.json();

            // Récupérer le jeu associé (exemple : "yams" ou "pendu")
            const gameName = eventData.getGame;

            if (!gameName) {
                throw new Error("Aucun jeu associé à cet événement.");
            }

            // Masquer la liste d'événements et afficher le conteneur du jeu
            document.querySelector(".event-list").style.display = "none";
            containerPageEvent.style.display = "block";

            // Charger le jeu
            await loadGame(gameName);
        } catch (error) {
            console.error("Erreur lors du chargement de l'événement :", error);
            alert("Une erreur est survenue lors du chargement de l'événement.");
        }
    });
});

// Fonction pour charger le jeu dynamiquement
async function loadGame(gameName) {
    try {
        // Construire le chemin du fichier HTML du jeu
        const gameHtmlPath = `/${gameName}.html`;

        // Charger le contenu HTML du jeu
        const response = await fetch(gameHtmlPath);
        if (!response.ok) {
            throw new Error(`Erreur lors du chargement du jeu ${gameName}.`);
        }

        const gameHtml = await response.text();
        gameContainer.innerHTML = gameHtml;

        // Charger dynamiquement le script associé au jeu
        const script = document.createElement("script");
        script.src = `/js/${gameName}.js`;
        document.body.appendChild(script);
    } catch (error) {
        console.error("Erreur lors du chargement du jeu :", error);
        gameContainer.innerHTML = `<p>${error.message}</p>`;
    }
}


// Lancer le chargement du jeu
loadGame();

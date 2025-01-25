// Variables globales
const diceElements = document.querySelectorAll('.dice');
const rollButton = document.getElementById('rollButton');
const scoreElement = document.getElementById('score');
const turnsLeftElement = document.getElementById('turnsLeft');

// Limites et initialisation
let turnsLeft = 3;
let selectedDice = [];
let eventId = null;
let userId = null;

// Fonction pour générer un résultat de dé aléatoire (1 à 6)
function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

// Fonction pour afficher l'animation du lancer de dés
function animateDice() {
    diceElements.forEach(dice => {
        dice.classList.add('shake');
    });

    // Retirer l'animation après qu'elle se termine
    setTimeout(() => {
        diceElements.forEach(dice => {
            dice.classList.remove('shake');
        });
    }, 500);
}

// Fonction pour mettre à jour les résultats des dés
function updateDiceResults() {
    diceElements.forEach((dice, index) => {

        if (selectedDice.includes(index)) {
            return;
        }
        const rollResult = rollDie();
        dice.textContent = rollResult;
    });
}

// Fonction pour calculer le score
function calculateScore() {
    let totalScore = 0;
    diceElements.forEach(dice => {
        totalScore += parseInt(dice.textContent);
    });
    scoreElement.textContent = totalScore;
}

// Fonction pour récupérer le token d'authentification (si vous utilisez des cookies ou sessionStorage)
function getToken() {

    const tokenCookieName = "authToken";
    const token = document.cookie.split('; ').find(row => row.startsWith(tokenCookieName)).split('=')[1];
    return token;
}

// Fonction pour récupérer les détails de l'utilisateur actuel (par exemple via un cookie ou sessionStorage)
function getUserId() {
    return localStorage.getItem("userId");
}

// Récupérer l'eventId dynamique 
function getEventId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('eventId');
}

// Fonction pour envoyer le score en base de données
function sendScoreToDatabase(eventId, userId) {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    const data = {
        score: parseInt(scoreElement.textContent),
        eventId: eventId,
        userId: userId
    };

    fetch(apiUrl+"add-scores", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Score envoyé avec succès : ", data);
    })
    .catch(error => {
        console.error("Erreur lors de l'envoi du score : ", error);
    });
}

// Fonction pour garder un dé (et gérer les sélections)
function toggleDice(index) {
    if (selectedDice.includes(index)) {
        selectedDice = selectedDice.filter(i => i !== index);
        diceElements[index].classList.remove('selected');
    } else {
        if (selectedDice.length < 2) { 
            selectedDice.push(index);
            diceElements[index].classList.add('selected');
        }
    }
}

// Fonction principale au clic sur le bouton "Lancer les dés"
rollButton.addEventListener('click', () => {
    if (turnsLeft > 0) {
        animateDice();
        updateDiceResults();
        calculateScore();
        turnsLeft--;
        turnsLeftElement.textContent = turnsLeft;
    }

    if (turnsLeft === 0) {
        rollButton.disabled = true;
    }
});

// Fonction pour réinitialiser le jeu
function resetGame() {
    turnsLeft = 3;
    selectedDice = [];
    scoreElement.textContent = '0';
    turnsLeftElement.textContent = turnsLeft;
    diceElements.forEach(dice => {
        dice.textContent = '0';
        dice.classList.remove('selected');
    });
    rollButton.disabled = false;
}

// Fonction pour démarrer le jeu
function loadGame() {
    eventId = getEventId();
    userId = getUserId();

    if (eventId && userId) {
        console.log("Jeu chargé pour l'événement ID:", eventId, "Utilisateur ID:", userId);
    } else {
        console.error("L'eventId ou userId est manquant.");
    }
}

// Réinitialisation lors de la fermeture ou du changement de page
window.onbeforeunload = function() {
    resetGame();
};

// Charger le jeu au début
window.onload = loadGame;

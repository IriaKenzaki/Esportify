const words = ["foret", "pendu", "programmation", "ordinateur", "plongoir", "capitaine", "etoile", "equitation"];
let wordToGuess = "";
let displayedWord = "";
let attempts = 6;
let guessedLetters = [];
let gameOver = false;

const wordDisplay = document.getElementById("wordDisplay");
const attemptsLeft = document.getElementById("attempts");
const hangmanDrawing = document.getElementById("hangmanDrawing");
const lettersContainer = document.getElementById("letters");

// Récupération de l'ID de l'utilisateur actuel
function getCurrentUserId() {
    const userId = getCookie("userId");
    return userId;
}

// Fonction pour charger un événement et démarrer le jeu
function loadGame(eventId) {
    const userId = getCurrentUserId();

    chooseWord();
    setupLetters();
    
    console.log(`Jeu lancé pour l'événement ${eventId} avec l'utilisateur ${userId}`);
}


// Fonction pour générer un mot aléatoire parmi ceux proposés
function chooseWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    wordToGuess = words[randomIndex];
    displayedWord = "_".repeat(wordToGuess.length);
    updateDisplay();
}

// Fonction pour mettre à jour l'affichage du mot à deviner
function updateDisplay() {
    wordDisplay.textContent = displayedWord.split("").join(" ");
    attemptsLeft.textContent = `Tentatives restantes : ${attempts}`;
    hangmanDrawing.textContent = `Tentatives restantes : ${6 - attempts}`;
}

// Fonction pour vérifier si la lettre est correcte
function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    if (wordToGuess.includes(letter)) {
        let newDisplay = "";
        for (let i = 0; i < wordToGuess.length; i++) {
            if (wordToGuess[i] === letter) {
                newDisplay += letter;
            } else {
                newDisplay += displayedWord[i];
            }
        }
        displayedWord = newDisplay;
        updateDisplay();

        if (!displayedWord.includes("_")) {
            gameOver = true;
            alert("Vous avez gagné !");
            sendScoreToDatabase(eventId, getCurrentUserId());
        }
    } else {
        attempts--;
        updateDisplay();

        if (attempts === 0) {
            gameOver = true;
            alert(`Vous avez perdu ! Le mot était "${wordToGuess}".`);
            sendScoreToDatabase(eventId, getCurrentUserId());
        }
    }
}

// Fonction pour afficher les lettres cliquables
function setupLetters() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    lettersContainer.innerHTML = "";
    for (let letter of alphabet) {
        const letterButton = document.createElement("button");
        letterButton.textContent = letter;
        letterButton.onclick = () => guessLetter(letter);
        lettersContainer.appendChild(letterButton);
    }
}

// Fonction pour envoyer le score à la base de données
function sendScoreToDatabase(eventId, userId) {
    const score = 6 - attempts;
    const data = {
        score: score,
        userId: userId,
        eventId: eventId
    };

    fetch(`${apiUrl}add-scores`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-AUTH-TOKEN": getToken(),
        },
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

// Fonction pour réinitialiser le jeu
function resetGame() {
    gameOver = false;
    attempts = 6;
    guessedLetters = [];
    chooseWord();
    setupLetters();
}

window.addEventListener('beforeunload', () => {
    resetGame();
});

// Initialisation du jeu avec l'événement et l'utilisateur actuels
loadGame(1);

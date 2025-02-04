const words = [
    "foret", "pendu", "programmation", "ordinateur", "plongoir", "capitaine", "etoile", "equitation", 
    "montagne", "souris", "bateau", "chocolat", "python", "voiture", "espace", "merveille", "giraffe", 
    "astronomie", "chiffre", "loup", "serpent"
];
let wordToGuess = "";
let displayedWord = "";
let attempts = 8;
let guessedLetters = [];
let gameOver = false;
let scoreAlreadySent = false;

const wordDisplay = document.getElementById("wordDisplay");
const attemptsLeft = document.getElementById("attempts");
const hangmanDrawing = document.getElementById("hangmanDrawing");
const lettersContainer = document.getElementById("letters");
const quitEventButton = document.getElementById("quitEventButton");

let userId = null;
let username = null;
let eventId = localStorage.getItem("eventId");

function getToken() {
    return getCookie(tokenCookieName);
}

async function getUserInfo() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(apiUrl + "account/me", {
            method: "GET",
            headers: {
                "X-AUTH-TOKEN": token,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data?.id && data?.username) {
            userId = data.id;
            username = data.username;
        }
    } catch (error) {}
}

getUserInfo();

function chooseWord() {
    wordToGuess = words[Math.floor(Math.random() * words.length)];
    displayedWord = "_".repeat(wordToGuess.length);
    updateDisplay();
}

function updateDisplay() {
    wordDisplay.textContent = displayedWord.split("").join(" ");
    attemptsLeft.textContent = `Tentatives restantes : ${attempts}`;
    hangmanDrawing.textContent = `Tentatives restantes : ${8 - attempts}`;
}

function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    if (wordToGuess.includes(letter)) {
        displayedWord = displayedWord.split("").map((char, i) => (wordToGuess[i] === letter ? letter : char)).join("");
        updateDisplay();

        if (!displayedWord.includes("_")) {
            gameOver = true;
            alert("Vous avez gagné !");
            sendScore(true);
        }
    } else {
        attempts--;
        updateDisplay();

        if (attempts === 0) {
            gameOver = true;
            alert(`Vous avez perdu ! Le mot était "${wordToGuess}".`);
            sendScore(true);
        }
    }
}

function setupLetters() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    lettersContainer.innerHTML = "";
    alphabet.split("").forEach(letter => {
        const letterButton = document.createElement("button");
        letterButton.textContent = letter;
        letterButton.onclick = () => guessLetter(letter);
        lettersContainer.appendChild(letterButton);
    });
}

function sendScore(redirect = false) {
    if (scoreAlreadySent || !eventId || !userId || !username) return;
    scoreAlreadySent = true;

    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    const data = {
        scores: [{ username, score: (0 + attempts) * 10 }],
    };

    fetch(apiUrl + `${eventId}/add-scores`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(() => {
        if (redirect) window.location.href = "/scores";
    })
    .catch(() => {});
}

function resetGame() {
    gameOver = false;
    attempts = 8;
    guessedLetters = [];
    chooseWord();
    setupLetters();
}

quitEventButton.addEventListener('click', () => {
    sendScore(true);
});

window.onbeforeunload = function (event) {
    sendScore();
};

chooseWord();
setupLetters();

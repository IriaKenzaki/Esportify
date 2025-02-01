const diceElements = document.querySelectorAll('.dice');
const scoreElement = document.getElementById('score');
const turnsLeftElement = document.getElementById('turnsLeft');
const quitEventButton = document.getElementById('quitEventButton');

let turnsLeft = 3;
let selectedDice = [];
let scoreAlreadySent = false;

function getToken() {
    return getCookie(tokenCookieName);
}

let userId = null;
let username = null;
let eventId = localStorage.getItem("eventId");

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

        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data?.id && data?.username) {
            userId = data.id;
            username = data.username;
        }
    } catch (error) {}
}

getUserInfo();

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

function animateDice() {
    diceElements.forEach(dice => dice.classList.add('shake'));
    setTimeout(() => diceElements.forEach(dice => dice.classList.remove('shake')), 500);
}

function updateDiceResults() {
    diceElements.forEach((dice, index) => {
        if (!selectedDice.includes(index)) dice.textContent = rollDie();
    });
}

function calculateScore() {
    scoreElement.textContent = Array.from(diceElements).reduce((sum, dice) => sum + parseInt(dice.textContent), 0);
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
        scores: [{ username, score: parseInt(scoreElement.textContent) }]
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

function toggleDice(index) {
    if (selectedDice.includes(index)) {
        selectedDice = selectedDice.filter(i => i !== index);
        diceElements[index].classList.remove('selected');
    } else if (selectedDice.length < 2) {
        selectedDice.push(index);
        diceElements[index].classList.add('selected');
    }
}

const rollButton = document.getElementById('rollButton');
rollButton.addEventListener('click', () => {
    if (turnsLeft > 0) {
        animateDice();
        updateDiceResults();
        calculateScore();
        turnsLeft--;
        turnsLeftElement.textContent = turnsLeft;
    }
    if (turnsLeft === 0) rollButton.disabled = true;
});

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

quitEventButton.addEventListener('click', () => sendScore(true));

window.onbeforeunload = function (event) {
    sendScore();
};

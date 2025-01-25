// Sélection des éléments HTML
const diceContainer = document.getElementById('diceContainer');
const rollButton = document.getElementById('rollButton');
const rollsLeftText = document.getElementById('rollsLeft');
const scoreText = document.getElementById('score');

// Variables du jeu
const NUM_DICE = 5;
const MAX_ROLLS = 3;
let rollsLeft = MAX_ROLLS;
let dice = Array(NUM_DICE).fill(0);
let selectedDice = Array(NUM_DICE).fill(false);

// Fonction pour générer les dés dans le conteneur
function createDice() {
    diceContainer.innerHTML = '';
    for (let i = 0; i < NUM_DICE; i++) {
        const die = document.createElement('div');
        die.classList.add('die');
        die.textContent = dice[i] || '-';
        die.addEventListener('click', () => toggleDieSelection(i));
        if (selectedDice[i]) die.classList.add('selected');
        diceContainer.appendChild(die);
    }
}

// Fonction pour basculer la sélection d'un dé
function toggleDieSelection(index) {
    if (rollsLeft < MAX_ROLLS && rollsLeft > 0) { 
        selectedDice[index] = !selectedDice[index];
        createDice();
    }
}

// Fonction pour lancer les dés
function rollDice() {
    if (rollsLeft > 0) {
        for (let i = 0; i < NUM_DICE; i++) {
            if (!selectedDice[i]) {
                dice[i] = Math.floor(Math.random() * 6) + 1;
            }
        }
        rollsLeft--;
        rollsLeftText.textContent = `Lancers restants : ${rollsLeft}`;
        createDice();

        // Désactiver le bouton si plus de lancers
        if (rollsLeft === 0) {
            rollButton.disabled = true;
            calculateScore();
        }
    }
}

// Fonction pour calculer le score
function calculateScore() {
    const score = dice.reduce((total, die) => total + die, 0);
    scoreText.textContent = `Score : ${score}`;
}

// Initialisation du jeu
function resetGame() {
    rollsLeft = MAX_ROLLS;
    dice.fill(0);
    selectedDice.fill(false);
    rollButton.disabled = false;
    rollsLeftText.textContent = `Lancers restants : ${rollsLeft}`;
    scoreText.textContent = `Score : 0`;
    createDice();
}

// Lancer les dés lorsque le bouton est cliqué
rollButton.addEventListener('click', rollDice);

// Démarrer le jeu au chargement
resetGame();

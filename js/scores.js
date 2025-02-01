
const scoresContainer = document.querySelector(".container-scores-bottom");
const globalScoreSpan = document.querySelector(".score-global");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-button");

let scoresData = [];

function fetchScores() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });
    fetch(apiUrl+'scores', {
        method: 'GET',
        headers: headers,        
    })
        .then(response => {
            if (!response.ok) throw new Error("Erreur lors de la récupération des scores");
            return response.json();
        })
        .then(data => {
            scoresData = data;
            displayScores(scoresData);
        })
        .catch(error => console.error(error));
}

function displayScores(data) {
    let totalScore = data.reduce((acc, score) => acc + score.score, 0);
    if (globalScoreSpan) {
        globalScoreSpan.textContent = `${totalScore} points`;
    } else {
        console.error("globalScoreSpan introuvable !");
    }
    scoresContainer.innerHTML = '<hr class="divider-global" />';
    
    data.forEach(score => {
        totalScore += score.score;
        const scoreElement = `
            <div class="response">
                <div class="response-details">
                    <span class="title-event">${score.eventTitle}</span>
                    <span class="score">${score.score} points</span>
                    <span class="date">${new Date(score.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <hr class="divider" />
        `;
        scoresContainer.innerHTML += scoreElement;
    });

}

function filterScores() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    const filteredScores = scoresData.filter(score => {
        const scoreDate = new Date(score.createdAt);
        return (!startDateInput.value || scoreDate >= startDate) &&
               (!endDateInput.value || scoreDate <= endDate);
    });
    displayScores(filteredScores);
}

if (searchButton) {
    searchButton.addEventListener("click", filterScores);
}

fetchScores();
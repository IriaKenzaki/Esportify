const token = getToken();
const eventId = localStorage.getItem("eventId");
const pseudoSearchInput = document.getElementById("pseudo-search");
const searchButton = document.getElementById("searchButton");
const participantsListContainer = document.getElementById("participantsList");
const rejectButton = document.getElementById("rejectButton");

if (!token) {
    alert("Vous devez être connecté pour voir cette page.");
    window.location.href = "/login.html";
}

if (!eventId) {
    alert("Aucun événement sélectionné.");
    window.location.href = "/my-event";
}

let allParticipants = [];

function fetchParticipants() {
    fetch(`${apiUrl}events/${eventId}/participants`, {
        method: "GET",
        headers: {
            "X-AUTH-TOKEN": token,
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des participants.");
        }
        return response.json();
    })
    .then((participants) => {
        allParticipants = participants;
        displayParticipants(participants);
    })
    .catch((error) => {
        console.error("Erreur :", error);
        alert("Impossible de charger la liste des participants.");
    });
}

function displayParticipants(participants) {
    participantsListContainer.textContent = "";

    if (participants.length === 0) {
        participantsListContainer.textContent = "Aucun participant inscrit pour cet événement.";
        return;
    }

    participants.forEach((participant, index) => {
        const pseudo = participant.username || 'Inconnu';
        const participantElement = `
        <div class="response" data-participant-id="${participant.id}">
            <div class="response-details">
                <span class="pseudo">${pseudo}</span>
            </div>
            <div class="checkbox-container">
                <input type="checkbox" id="checkbox${index}" class="checkbox-participant" />
                <label for="checkbox${index}" class="checkbox-custom"></label>
            </div>
        </div>
        <hr class="divider" />
        `;
        participantsListContainer.insertAdjacentHTML("beforeend", participantElement);
    });

    const checkboxes = document.querySelectorAll(".checkbox-participant");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            const participantElement = e.target.closest(".response");
            const participantId = participantElement.getAttribute("data-participant-id");
            participantElement.classList.toggle("selected", e.target.checked);
        });
    });
}

rejectButton.addEventListener("click", () => {
    const selectedParticipants = document.querySelectorAll(".response.selected");
    selectedParticipants.forEach(participantElement => {
        const participantId = participantElement.getAttribute("data-participant-id");

        fetch(`${apiUrl}remove-participant/${eventId}/${participantId}`, {
            method: "DELETE",
            headers: {
                "X-AUTH-TOKEN": token,
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erreur lors du rejet de la participation.");
                }
                return response.json();
            })
            .then(data => {
                participantElement.remove();
            })
            .catch(error => {
                console.error("Erreur lors du rejet de la participation :", error);
                alert("Impossible de rejeter la participation.");
            });
    });
});
function filterParticipants(participants, query) {
    return participants.filter(participant => 
        participant.username.toLowerCase().includes(query.toLowerCase())
    );
}

pseudoSearchInput.addEventListener("input", () => {
    const query = pseudoSearchInput.value.trim();

    const filteredParticipants = filterParticipants(allParticipants, query);
    displayParticipants(filteredParticipants);
});

searchButton.addEventListener("click", () => {
    const query = pseudoSearchInput.value.trim();
    const filteredParticipants = filterParticipants(allParticipants, query);
    displayParticipants(filteredParticipants);
});

fetch(`${apiUrl}${eventId}/details`, {
    method: "GET",
    headers: {
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    },
})
.then((response) => {
    if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails de l'événement.");
    }
    return response.json();
})
.then((eventDetails) => {
    const eventTitleElement = document.querySelector(".nom-event");
    eventTitleElement.textContent = eventDetails.title;
})
.catch((error) => {
    console.error("Erreur :", error);
    alert("Impossible de charger les détails de l'événement.");
});

fetchParticipants();

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}
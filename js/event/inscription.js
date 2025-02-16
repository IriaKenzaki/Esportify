const form = document.querySelector("#searchForm");
const containerEvent = document.querySelector(".container-event");
const eventModal = document.getElementById("eventModal");
const modalImage = eventModal.querySelector("img");
const modalTitle = eventModal.querySelector(".modal-title");
const modalInfo = eventModal.querySelector(".modal-info");
const modalDescription = eventModal.querySelector(".modal-body > p");
const modalButton = document.getElementById("button-modal");

let userId;
let username;

fetchEventsOnPageLoad();

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

getUserInfo();

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
    } catch (error) {
        console.error("Erreur API :", error);
    }
}

async function checkUserScoreForEvent(eventId) {
    if (!userId) {
        return;
    }

    try {
        const response = await fetch(apiUrl + "scores", {
            method: "GET",
            headers: {
                "X-AUTH-TOKEN": getToken(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des scores");

        const scores = await response.json();

        const userScoreForEvent = scores.find(score => score.eventId === eventId);

        const goToLinkButton = document.getElementById("goToLink");

        if (goToLinkButton) {
            if (userScoreForEvent) {
                alert(`Vous avez déjà un score pour cet événement : ${userScoreForEvent.score}`);
                goToLinkButton.disabled = true;
                goToLinkButton.textContent = "Événement non disponible";
                goToLinkButton.style.pointerEvents = 'none';
            } else {
                goToLinkButton.disabled = false;
            }
        } else {
            console.error("Le bouton 'goToLink' n'a pas été trouvé.");
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du score :", error);
    }
}

async function checkAndSetButtonState(eventId) {
    const userScoreForEvent = await checkUserScoreForEvent(eventId);

    if (userScoreForEvent) {
        const goToLinkButton = document.getElementById("goToLink");
        goToLinkButton.disabled = true;
        goToLinkButton.textContent = "Vous avez déjà un score";
        alert(`Vous avez déjà un score pour cet événement : ${userScoreForEvent.score}`);
    } else {
        const goToLinkButton = document.getElementById("goToLink");
        goToLinkButton.disabled = false;
        goToLinkButton.textContent = "Rejoindre l'événement";
    }

    const goToLinkButton = document.getElementById("goToLink");
    goToLinkButton.addEventListener("click", function(e) {
        if (goToLinkButton.disabled) {
            e.preventDefault();
            alert("Vous avez déjà un score pour cet événement.");
        } else {
            e.preventDefault();
            goToEvent(eventId);
        }
    });
}

document.getElementById("searchButton").addEventListener("click", function(event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const number = document.getElementById("number").value;
    const pseudo = document.getElementById("pseudo").value;

    const params = { date, time, number, pseudo };
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    fetch(apiUrl + "my-events", {
        method: "GET",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des événements");
            }
            return response.json();
        })
        .then((data) => {
            if (data && typeof data === "object") {
                const filteredEvents = filterEvents(data, params);
                if (filteredEvents.length > 0) {
                    displayEvent(filteredEvents);
                } else {
                    containerEvent.textContent = "Aucun événement trouvé.";
                }
            } else {
                containerEvent.textContent = "Aucun événement trouvé.";
            }
        })
        .catch((error) => {
            containerEvent.textContent = "Aucun événement trouvé.";
        });
});

function filterEvents(events, params) {
    const filteredEvents = [];
    
    for (const eventId in events) {
        const event = events[eventId];

        const dateMatch = params.date ? event.dateTimeStart.includes(params.date) : true;
        const timeMatch = params.time ? event.dateTimeStart.includes(params.time) : true;
        const numberMatch = params.number ? event.players == params.number : true;
        const pseudoMatch = params.pseudo ? event.createdBy.toLowerCase().includes(params.pseudo.toLowerCase()) : true;

        if (dateMatch && timeMatch && numberMatch && pseudoMatch) {
            filteredEvents.push(event);
        }
    }
    return filteredEvents;
}

function displayEvent(events) {
    containerEvent.textContent = "";

    if (events.length === 0) {
        containerEvent.textContent = "Aucun événement trouvé.";
        return;
    }

    events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("card");
        const eventTitle = escapeHTML(event.title || "Titre non disponible");

        const eventImage = event.image && event.image !== "" 
        ? apiUrlImage + event.image
        : '/Images/def-event.webp';

        card.innerHTML = `
            <img src="${eventImage}" alt="Image de l'événement">
            <div class="card-content">
                <h3>${eventTitle}</h3>
                <hr class="card-divider" />
                <p><strong>Nombre de joueurs :</strong> ${event.players}</p>
                <p><strong>Date et heure de début :</strong> ${formatDate(event.dateTimeStart)}</p>
                <p><strong>Date et heure de fin :</strong> ${formatDate(event.dateTimeEnd)}</p>
                <a href="#" class="view-details" data-event-id="${event.id}" data-bs-toggle="modal" data-bs-target="#eventModal">Plus d'informations <i class="bi bi-arrow-right-circle"></i></a>
            </div>`;
        containerEvent.appendChild(card);
    });

    const detailLinks = document.querySelectorAll(".view-details");
    detailLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const eventId = link.getAttribute("data-event-id");
            fetchEventDetails(eventId);
        });
    });
}

function fetchEventDetails(eventId) {
    const token = getToken();

    if (!token) {
        alert("Veuillez vous connecter pour accéder aux détails de l'événement.");
        window.location.href = "/signin";
        return;
    }

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    const url = `${apiUrl}${eventId}/details`;

    fetch(url, {
        method: 'GET',
        headers: headers,
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert("Votre session a expiré. Veuillez vous reconnecter.");
            window.location.href = "/signin";
            throw new Error("Non autorisé.");
        } else {
            throw new Error(`Erreur ${response.status}: Impossible de récupérer les détails de l'événement.`);
        }
    })
    .then((data) => {
        displayEventModal(data);
    })
    .catch((error) => {
        alert("Une erreur est survenue lors du chargement des détails de l'événement.");
    });
}

function displayEventModal(event) {
    if (!event) {
        alert("Aucune information disponible pour cet événement.");
        return;
    }

    const imageUrl = event.image ? apiUrlImage + event.image : "/Images/def-event.webp";
    const title = escapeHTML(event.title || "Titre non disponible");
    const dateTimeStart = event.dateTimeStart ? formatDate(event.dateTimeStart) : "Non spécifié";
    const dateTimeEnd = event.dateTimeEnd ? formatDate(event.dateTimeEnd) : "Non spécifié";
    const players = event.players || "Non spécifié";
    const createdBy = escapeHTML(event.createdBy || "Inconnu");
    const game = escapeHTML(event.game || "Non spécifié");
    const description = escapeHTML(event.description || "Aucune description disponible.");

    modalImage.src = imageUrl;
    modalImage.alt = `Image de l'événement ${title}`;
    modalTitle.textContent = title;
    modalInfo.innerHTML = `
        <p><strong>Date et heure de début :</strong> ${dateTimeStart}</p>
        <p><strong>Date et heure de fin :</strong> ${dateTimeEnd}</p>
        <p><strong>Nombre de joueurs :</strong> ${players}</p>
        <p><strong>Organisateur :</strong> ${createdBy}</p>
        <p><strong>Jeux :</strong> ${game}</p>
        <p><strong>Statut :</strong> ${event.started ? "En cours" : "Non démarré"}</p>
    `;
    modalDescription.textContent = description;
    checkUserScoreForEvent(event.id);

    const unsubscribeButton = document.getElementById("désinscriptionLink");
    unsubscribeButton.addEventListener("click", function(e) {
        e.preventDefault();
        removeParticipant(event.id);
    });

    const goToLinkButton = document.getElementById("goToLink");
    goToLinkButton.addEventListener("click", function(e) {
        if (goToLinkButton.disabled) {
            e.preventDefault();
        } else {
            e.preventDefault();
            goToEvent(event.id);
        }
    });
}

function removeParticipant(eventId) {
    const token = getToken();

    if (!token) {
        alert("Veuillez vous connecter pour vous désinscrire.");
        window.location.href = "/signin";
        return;
    }

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    const url = `${apiUrl}events/${eventId}/remove-participant`;

    fetch(url, {
        method: 'DELETE',
        headers: headers,
    })
    .then((response) => {
        if (response.ok) {
            alert("Vous avez été désinscrit de l'événement.");
            location.reload();  
        } else {
            throw new Error(`Erreur ${response.status}: Impossible de vous désinscrire.`);
        }
    })
    .catch((error) => {
        alert("Une erreur est survenue lors de la désinscription.");
    });
}

function goToEvent(eventId){

    if (!eventId) {
        console.error("Aucun ID d'événement trouvé.");
        alert("Erreur : Aucun événement sélectionné.");
        return;
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

    const url = `${apiUrl}${eventId}/details`;

    fetch(url, {
        method: "GET",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Impossible de récupérer les détails.`);
            }
            return response.json();
        })
        .then((event) => {
            if (event.started) {
                localStorage.setItem("eventId", eventId);
                if (event.game) {
                    window.location.href = `${event.game}`;
            } else {
                alert("Cet événement n'est pas encore lancé.");
            }
        }})
        .catch((error) => {
            console.error("Erreur lors de la vérification de l'événement :", error);
            alert("Une erreur est survenue lors de la vérification de l'événement.");
        });
}

async function fetchEventsOnPageLoad() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const number = document.getElementById("number").value;
    const pseudo = document.getElementById("pseudo").value;

    const params = { date, time, number, pseudo };
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    try {
        const response = await fetch(apiUrl + "my-events", {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des événements");
        }

        const data = await response.json();
        if (data && typeof data === "object") {
            const filteredEvents = filterEvents(data, params);
            if (filteredEvents.length > 0) {
                displayEvent(filteredEvents);
            } else {
                containerEvent.textContent = "Aucun événement trouvé.";
            }
        } else {
            containerEvent.textContent = "Aucun événement trouvé.";
        }
    } catch (error) {
        containerEvent.textContent = "Aucun événement trouvé.";
    }
}
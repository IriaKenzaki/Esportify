const form = document.querySelector("#searchForm");
const containerEvent = document.querySelector(".container-event");
const eventModal = document.getElementById("eventModal");
const modalImage = eventModal.querySelector("img");
const modalTitle = eventModal.querySelector(".modal-title");
const modalInfo = eventModal.querySelector(".modal-info");
const modalDescription = eventModal.querySelector(".modal-body > p");
const modalButton = document.getElementById("button-modal");

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
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
                    containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
                }
            } else {
                containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
            }
        })
        .catch((error) => {
            console.error("Erreur : ", error);
            containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
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
    containerEvent.innerHTML = "";

    if (events.length === 0) {
        containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
        return;
    }

    events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const eventImage = event.image && event.image !== "" 
        ? 'https://localhost:8000/uploads/images/' + event.image
        : '/Images/def-event.webp';

        card.innerHTML = `
            <img src="${eventImage}" alt="Image de l'événement">
            <div class="card-content">
                <h3>${event.title}</h3>
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
        console.error("Aucun token trouvé. L'utilisateur doit se connecter.");
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
            console.error("Token invalide ou expiré.");
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
        console.error("Erreur lors de la récupération des détails de l'événement :", error);
        alert("Une erreur est survenue lors du chargement des détails de l'événement.");
    });
}

function displayEventModal(event) {
    if (!event) {
        console.error("Les détails de l'événement sont introuvables.");
        alert("Aucune information disponible pour cet événement.");
        return;
    }

    const imageUrl = event.image ? `https://localhost:8000/uploads/images/${event.image}` : "/Images/def-event.webp";
    const title = event.title || "Titre non disponible";
    const dateTimeStart = event.dateTimeStart ? formatDate(event.dateTimeStart) : "Non spécifié";
    const dateTimeEnd = event.dateTimeEnd ? formatDate(event.dateTimeEnd) : "Non spécifié";
    const players = event.players || "Non spécifié";
    const createdBy = event.createdBy || "Inconnu";
    const game = event.game || "Non spécifié";
    const description = event.description || "Aucune description disponible.";

    modalImage.src = imageUrl;
    modalImage.alt = `Image de l'événement ${title}`;
    modalTitle.textContent = title;
    modalInfo.innerHTML = `
        <p><strong>Date et heure de début :</strong> ${dateTimeStart}</p>
        <p><strong>Date et heure de fin :</strong> ${dateTimeEnd}</p>
        <p><strong>Nombre de joueurs :</strong> ${players}</p>
        <p><strong>Organisateur :</strong> ${createdBy}</p>
        <p><strong>Jeux :</strong> ${game}</p>
    `;
    modalDescription.textContent = description;

    const unsubscribeButton = document.getElementById("désinscriptionLink");
    unsubscribeButton.addEventListener("click", function(e) {
        e.preventDefault();
        removeParticipant(event.id);
    });
    const goToLinkButton = document.getElementById("goToLink");
    goToLinkButton.addEventListener("click", function(e) {
        e.preventDefault();
        goToEvent(event.id);
    });
}

function removeParticipant(eventId) {
    const token = getToken();

    if (!token) {
        console.error("Aucun token trouvé. L'utilisateur doit se connecter.");
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
        console.error("Erreur lors de la désinscription :", error);
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
                window.location.href = "/event";
            } else {
                alert("Cet événement n'est pas encore lancé.");
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la vérification de l'événement :", error);
            alert("Une erreur est survenue lors de la vérification de l'événement.");
        });
}
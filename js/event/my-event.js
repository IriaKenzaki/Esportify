
const containerEvent = document.querySelector("#eventContainer");
const eventModal = document.getElementById("eventModal");
const modalImage = eventModal.querySelector("#modalImage");
const modalTitle = eventModal.querySelector(".modal-title");
const modalInfo = eventModal.querySelector(".modal-info");
const modalDescription = eventModal.querySelector("#modalDescription");
const editEventButton = document.getElementById("editEventButton");
const startEventButton = document.getElementById("startEventButton");
const deleteEventButton = document.getElementById("deleteEventButton");
const participantsListButton = document.getElementById("participantsListButton");

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

function loadUserEvents() {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour voir vos événements.");
        window.location.href = "/signin";
        return;
    }

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    fetch(apiUrl + "my-created-events", {
        method: "GET",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des événements.");
            }
            return response.json();
        })
        .then((data) => {
            if (data && typeof data === "object") {
                displayEvents(Object.values(data));
            } else {
                console.error("La réponse de l'API n'est pas valide : ", data);
                containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
            }
        })
        .catch((error) => {
            console.error("Erreur : ", error);
            containerEvent.innerHTML = "<p>Une erreur est survenue lors de la récupération des événements.</p>";
        });
}

document.getElementById("searchButton").addEventListener("click", function (event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const number = document.getElementById("number").value;

    const params = { date, time, number };

    fetch(apiUrl + "my-created-events", {
        method: "GET",
        headers: {
            "X-AUTH-TOKEN": getToken(),
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des événements filtrés.");
            }
            return response.json();
        })
        .then((data) => {
            if (data && typeof data === "object") {
                const filteredEvents = filterEvents(Object.values(data), params);
                displayEvents(filteredEvents);
            } else {
                containerEvent.innerHTML = "<p>Aucun événement trouvé avec ces critères.</p>";
            }
        })
        .catch((error) => {
            console.error("Erreur : ", error);
            containerEvent.innerHTML = "<p>Une erreur est survenue lors du filtrage des événements.</p>";
        });
});

function filterEvents(events, params) {
    return events.filter((event) => {
        const dateMatch = params.date ? event.dateTimeStart.includes(params.date) : true;
        const timeMatch = params.time ? event.dateTimeStart.includes(params.time) : true;
        const numberMatch = params.number ? event.players == params.number : true;
        return dateMatch && timeMatch && numberMatch;
    });
}

function displayEvents(events) {
    containerEvent.innerHTML = "";

    if (!events.length) {
        containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
        return;
    }

    events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const eventImage = event.image
            ? apiUrlImage+ event.image
            : "/Images/def-event.webp";

        let cardContent = `
            <img src="${eventImage}" alt="Image de l'événement">
            <div class="card-content">
                <h3>${event.title}</h3>
                <hr class="card-divider" />
                <p><strong>Nombre de joueurs :</strong> ${event.players}</p>
                <p><strong>Date et heure de début :</strong> ${formatDate(event.dateTimeStart)}</p>
                <p><strong>Date et heure de fin :</strong> ${formatDate(event.dateTimeEnd)}</p>
                <p><strong>Validation :</strong> ${event.visibility ? 'Validé' : 'Non validé'}</p>
        `;

        if (event.visibility) {
            cardContent += `
                <a href="#" class="view-details" data-event-id="${event.id}" data-bs-toggle="modal" data-bs-target="#eventModal">
                    Plus d'informations <i class="bi bi-arrow-right-circle"></i>
                </a>
            `;
        }

        cardContent += `
            <div class="button-card">
                <button type="button" class="btn btn-primary" id = "card-button" onclick="openEditEventModal(${event.id})">Modifier l'évènement</button>
                <button type="button" class="btn btn-success start-event-btn" id = "card-button" data-event-id="${event.id}">Démarrer l'événement</button>
                <button type="button" class="delete-event" id = "card-button" data-event-id="${event.id}">Supprimer l'événement</button>
                <button class="btn btn-primary" id = "card-button" onclick="goToParticipantsList(${event.id})">Liste des participants</button>
            </div>
        </div>`;

        card.innerHTML = cardContent;
        containerEvent.appendChild(card);
        const startButton = card.querySelector(".start-event-btn");
        if (event.started) {
            startButton.disabled = true;
            startButton.textContent = "Événement en cours";
        } else {
            startButton.disabled = false;
            startButton.textContent = "Démarrer l'événement";
        }
    });

    const detailLinks = document.querySelectorAll(".view-details");
    detailLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const eventId = link.getAttribute("data-event-id");
            fetchEventDetails(eventId);
        });
    });

    const startButtons = document.querySelectorAll(".start-event-btn")
    startButtons.forEach(button => {
        button.addEventListener("click", function () {
            const eventId = this.getAttribute("data-event-id");
            startEvent(eventId);
        });
    });

    const deleteButtons = document.querySelectorAll(".delete-event");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const eventId = button.getAttribute("data-event-id");
            deleteEvent(eventId);
        });
    });
}


function fetchEventDetails(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour voir les détails de l'événement.");
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
    const imageUrl = event.image ? apiUrlImage + event.image : "/Images/def-event.webp";

    modalImage.src = imageUrl;
    modalTitle.textContent = event.title || "Titre non disponible";
    modalInfo.innerHTML = `
        <p><strong>Date et heure de début :</strong> ${formatDate(event.dateTimeStart)}</p>
        <p><strong>Date et heure de fin :</strong> ${formatDate(event.dateTimeEnd)}</p>
        <p><strong>Nombre de joueurs :</strong> ${event.players}</p>
        <p><strong>Jeu associé :</strong> ${event.game}</p>
    `;
    modalDescription.textContent = event.description || "Aucune description disponible.";

    const startStatus = event.started ? "En cours" : "Non démarré";
    const startStatusElement = document.createElement("p");
    startStatusElement.innerHTML = `<strong>Statut :</strong> ${startStatus}`;
    modalInfo.appendChild(startStatusElement);

}

function deleteEvent(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour supprimer un événement.");
        window.location.href = "/signin";
        return;
    }

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    fetch(`${apiUrl}${eventId}`, {
        method: "DELETE",
        headers: headers,
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Erreur lors de la suppression de l'événement.");
        }

        alert("L'événement a été supprimé avec succès.");
        const eventCard = document.querySelector(`.card[data-event-id='${eventId}']`);
        if (eventCard) {
            eventCard.remove();
        }
        loadUserEvents();
    })
    .catch((error) => {
        console.error("Erreur lors de la suppression de l'événement :", error);
        alert("Une erreur est survenue lors de la suppression de l'événement.");
    });
}
function openEditEventModal(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour modifier un événement.");
        window.location.href = "/signin";
        return;
    }

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    const url = `${apiUrl}my-created-events`;
    fetch(url, {
        method: 'GET',
        headers: headers,
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Erreur ${response.status}: Impossible de récupérer les événements.`);
        }
    })
    .then((events) => {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            alert("L'événement spécifié n'existe pas.");
            return;
        }
        

        document.getElementById("editTitle").value = event.title || '';
        document.getElementById("editDateStart").value = event.dateTimeStart.split("T")[0];
        document.getElementById("editTimeStart").value = event.dateTimeStart.split("T")[1].slice(0, 5);
        document.getElementById("editDateEnd").value = event.dateTimeEnd.split("T")[0];
        document.getElementById("editTimeEnd").value = event.dateTimeEnd.split("T")[1].slice(0, 5);
        document.getElementById("editPlayers").value = event.players || '';
        document.getElementById("editGame").value = event.game || '';
        document.getElementById("editDescription").value = event.description || '';

        const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
        modal.show();

        document.getElementById('saveChangesButton').onclick = function() {
            saveEventChanges(eventId);
        };
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des événements :", error);
        alert("Erreur lors de la récupération des événements.");
    });
}

const maxImageSize = 2 * 1024 * 1024;
const maxImageSizeErrorMessage = "La taille de l'image ne doit pas dépasser 2 Mo.";

function saveEventChanges(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour modifier un événement.");
        return;
    }

    const formData = new FormData(document.getElementById('editEventForm'));

    let playersValue = formData.get("editPlayer");
    if (!playersValue || playersValue.trim() === "") {
        alert("Le nombre de joueurs est requis.");
        return;
    }
    playersValue = playersValue.trim();

    const players = parseInt(playersValue, 10);
    if (isNaN(players) || players <= 0) {
        alert("Le nombre de joueurs doit être un nombre positif.");
        return;
    }

    const dateTimeStart = `${formData.get("editDateStart")}T${formData.get("editTimeStart")}:00`;
    const dateTimeEnd = `${formData.get("editDateEnd")}T${formData.get("editTimeEnd")}:00`;

    const requestData = {
        title: formData.get("editTitle").trim(),
        description: formData.get("editDescription").trim(),
        players: players,
        dateTimeStart: dateTimeStart,
        dateTimeEnd: dateTimeEnd,
        game: formData.get("editGame"),
        visibility: formData.get("editVisibility") === "true" ? true : false
    };

    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    fetch(`${apiUrl}${eventId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(requestData),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Erreur lors de la modification de l'événement.");
        }
        
        const imageFile = document.getElementById('editImage').files[0]; 
        if (imageFile) {
            const formDataImage = new FormData();
            formDataImage.append('image', imageFile);

            fetch(`${apiUrl}${eventId}/image`, {
                method: 'POST',
                headers: {
                    "X-AUTH-TOKEN": token,
                },
                body: formDataImage,
            })
            .then((imageResponse) => {
                if (!imageResponse.ok) {
                    throw new Error("Erreur lors de la modification de l'image.");
                }
                alert("Événement et image modifiés avec succès !");
                loadUserEvents();
                const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                modal.hide();
            })
            .catch((imageError) => {
                console.error("Erreur image : ", imageError);
                alert("Une erreur est survenue lors de la modification de l'image.");
            });
        } else {
            alert("Événement modifié sans changement d'image !");
            loadUserEvents();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
            modal.hide();
        }
    })
    .catch((error) => {
        console.error("Erreur : ", error);
        alert("Une erreur est survenue lors de la modification de l'événement.");
    });
}

function goToParticipantsList(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour voir la liste des participants.");
        return;
    }

    localStorage.setItem("eventId", eventId);

    window.location.href = "/liste-participant";
}

function startEvent(eventId) {
    const token = getToken();
    if (!token) {
        alert("Vous devez être connecté pour démarrer un événement.");
        window.location.href = "/signin";
        return;
    }

    fetch(`${apiUrl}${eventId}/details`, {
        method: "GET",
        headers: {
            "X-AUTH-TOKEN": token,
            "Content-Type": "application/json",
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des détails de l'événement.");
        }
        return response.json();
    })
    .then(event => {
        const dateTimeStart = new Date(event.dateTimeStart);
        const dateTimeEnd = new Date(event.dateTimeEnd);
        const currentDateTime = new Date();

        const limitStartTime = new Date(dateTimeStart.getTime() - 30 * 60000);

        if (currentDateTime < limitStartTime) {
            alert("L'événement ne peut être démarré que 30 minutes avant sa date de début.");
            return;
        }

        if (currentDateTime > dateTimeEnd) {
            alert("L'événement ne peut plus être démarré après sa date de fin.");
            return;
        }

        fetch(`${apiUrl}my-created-events/${eventId}`, {
            method: "PUT",
            headers: {
                "X-AUTH-TOKEN": token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ started: true })
        })
        .then(response => {
            if (response.status === 204) {
                alert("L'événement a été démarré avec succès !");
                window.location.href = "/inscription";
            } else {
                return response.json().then(data => {
                    if (response.status === 403) {
                        alert("Permission refusée : seul le créateur de l'événement peut le modifier.");
                    } else if (response.status === 404) {
                        alert("Erreur : L'événement n'a pas été trouvé.");
                    } else if (response.status === 400) {
                        alert(`Erreur: ${data.message}`);
                    } else {
                        throw new Error("Une erreur est survenue lors du démarrage.");
                    }
                });
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
            alert("Une erreur est survenue lors du démarrage de l'événement.");
        });
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des détails de l'événement :", error);
        alert("Une erreur est survenue lors de la récupération des détails de l'événement.");
    });
}

loadUserEvents();

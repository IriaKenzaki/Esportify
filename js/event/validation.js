const containerValidationLeft = document.getElementById("container-validation-left");
const containerValidationRight = document.getElementById("container-validation-right");
const eventModal = document.getElementById("eventModal");
const modalImage = eventModal.querySelector("img");
const modalTitle = eventModal.querySelector(".modal-title");
const modalInfo = eventModal.querySelector(".modal-info");
const modalDescription = eventModal.querySelector(".modal-body > p");
const modalValidateButton = eventModal.querySelector("#validateButton");
const modalDeleteButton = eventModal.querySelector("#deleteButton");

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}
function isAdmin() {
    const token = getToken();
    const userRole = getRole(token);
    return userRole === 'ROLE_ADMIN';
}

async function fetchNotValidatedEvents() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });
    try {
        const response = await fetch(apiUrl+"all/not-visible", {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.warn("Aucun événement non validé trouvé.");
                containerValidationLeft.innerHTML = "<p>Aucun événement à valider.</p>";
                return;
            }
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            console.warn("Aucun événement non validé trouvé.");
            containerValidationLeft.innerHTML = "<p>Aucun événement à valider.</p>";
            return;
        }
        containerValidationLeft.innerHTML = ""; 

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const event = data[key];
                const card = document.createElement("div");
                card.classList.add("card-validation");

                const eventImage = event.image && event.image !== "" 
                ? apiUrlImage + event.image
                : '/Images/def-event.webp';

                card.innerHTML = ` 
                    <img src="${eventImage}" alt="Image de l'événement">
                    <div class="card-content">
                        <h3>${event.title}</h3>
                        <hr class="card-divider" />
                        <p><strong>Nombre de joueurs :</strong> ${event.players}</p>
                        <p><strong>Date et heure de début :</strong> ${formatDate(event.dateTimeStart)}</p>
                        <p><strong>Date et heure de fin :</strong> ${formatDate(event.dateTimeEnd)}</p>
                        <div style="text-align: right;">
                            <a href="#" class="view-details" data-id="${event.id}" data-bs-toggle="modal" data-bs-target="#eventModal">
                                Plus d'informations <i class="bi bi-arrow-right-circle"></i>
                            </a>
                        </div>
                    </div>`;

                containerValidationLeft.appendChild(card);
            }
        }

        const detailLinks = document.querySelectorAll(".view-details");
        detailLinks.forEach((link) => {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                const eventId = link.getAttribute("data-id");
                fetchEventDetails(eventId);
            });
        });

    } catch (error) {
        console.error("Erreur lors du chargement des événements non validés :", error);
    }
}

async function fetchValidatedEvents() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });
    try {
        const response = await fetch(apiUrl+"all", {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (typeof data !== 'object') {
            throw new Error("Erreur: La réponse de l'API ne contient pas d'événements validés.");
        }

        containerValidationRight.innerHTML = "";

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const event = data[key];
                const card = document.createElement("div");
                card.classList.add("card-validation");

                const eventImage = event.image && event.image !== "" 
                ? apiUrlImage + event.image
                : '/Images/def-event.webp';

                card.innerHTML = ` 
                    <img src="${eventImage}" alt="Image de l'événement">
                    <div class="card-content">
                        <h3>${event.title}</h3>
                        <hr class="card-divider" />
                        <p><strong>Nombre de joueurs :</strong> ${event.players}</p>
                        <p><strong>Date et heure de début :</strong> ${formatDate(event.dateTimeStart)}</p>
                        <p><strong>Date et heure de fin :</strong> ${formatDate(event.dateTimeEnd)}</p>
                        <div style="text-align: right;">
                            <button class="btn btn-danger delete-event" data-id="${event.id}">
                                Supprimer
                            </button>
                        </div>
                    </div>`;

                containerValidationRight.appendChild(card);
            }
        }

        const deleteButtons = document.querySelectorAll(".delete-event");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", function(event) {
                const eventId = button.getAttribute("data-id");
                deleteValidatedEvent(eventId);
            });
        });

    } catch (error) {
        console.error("Erreur lors du chargement des événements validés :", error);
    }
}

async function deleteValidatedEvent(eventId) {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });
    try {
        const response = await fetch(apiUrl+`${eventId}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression de l'événement: ${response.status} ${response.statusText}`);
        }else {
            alert("L'évènement à bien étais supprimé.")
        }

        let responseData = null;
        if (response.status !== 204) { 
            responseData = await response.json();
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        modal.hide();
        fetchValidatedEvents();
        fetchNotValidatedEvents()
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'événement :", error);
    }
    location.reload();
}

async function fetchEventDetails(eventId) {
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

    const url = apiUrl+`all/not-visible`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: Impossible de récupérer les détails de l'événement.`);
        }

        const events = await response.json();

        if (typeof events !== 'object' || events === null) {
            throw new Error("Erreur: La réponse de l'API ne contient pas un objet d'événements.");
        }

        const eventsArray = Object.values(events);

        const event = eventsArray.find(e => e.id == eventId);

        if (!event) {
            console.error("Événement introuvable :", eventId);
            alert("L'événement que vous recherchez est introuvable.");
            return;
        }

        displayEventModal(event);


    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'événement :", error);
        alert("Une erreur est survenue lors du chargement des détails de l'événement.");
    }
}

function displayEventModal(event) {
    if (!event) {
        console.error("Les détails de l'événement sont introuvables.");
        alert("Aucune information disponible pour cet événement.");
        return;
    }

    const imageUrl = event.image ? apiUrlImage + event.image : "/Images/def-event.webp";
    const title = event.title || "Titre non disponible";
    const dateTimeStart = event.dateTimeStart ? formatDate(event.dateTimeStart) : "Non spécifié";
    const dateTimeEnd = event.dateTimeEnd ? formatDate(event.dateTimeEnd) : "Non spécifié";
    const players = event.players || "Non spécifié";
    const createdBy = event.createdBy || "Inconnu";
    const game = event.game || "Non définie";
    const description = event.description || "Aucune description disponible.";

    modalImage.src = imageUrl;
    modalImage.alt = `Image de l'événement ${title}`;
    modalTitle.textContent = title;
    modalInfo.innerHTML = `
        <p><strong>Date et heure de début :</strong> ${dateTimeStart}</p>
        <p><strong>Date et heure de fin :</strong> ${dateTimeEnd}</p>
        <p><strong>Nombre de joueurs :</strong> ${players}</p>
        <p><strong>Jeux :</strong> ${game}</p>
        <p><strong>Organisateur :</strong> ${createdBy}</p>`;
    modalDescription.textContent = description;

    modalValidateButton.onclick = () => validateEvent(event.id);
    modalDeleteButton.onclick = () => deleteValidatedEvent(event.id);
}

async function validateEvent(eventId) {
    const token = getToken();
    try {
        const response = await fetch(apiUrl+`all/${eventId}`, {
            method: 'PUT',
            headers: {
                "X-AUTH-TOKEN": token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ visibility: true })
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la validation de l'événement: ${response.status} ${response.statusText}`);
        }

        let updatedEvent = null;
        const responseText = await response.text();
        if (responseText) {
            updatedEvent = JSON.parse(responseText);
            alert("Événement validé:", updatedEvent);
        } else {
            alert("Événement validé.");
        }

        const eventModal = document.getElementById("eventModal");
        if (eventModal) {
            eventModal.style.display = "none";
        }
        fetchNotValidatedEvents();
        fetchValidatedEvents();
    } catch (error) {
        console.error("Erreur lors de la validation de l'événement :", error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

fetchNotValidatedEvents();
fetchValidatedEvents();

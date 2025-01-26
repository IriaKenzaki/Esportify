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

    const formData = new FormData(form);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
        if (value) params.append(key, value);
    });

    let url = apiUrl + "all";
    if (params.toString()) {
        url = apiUrl + `event?${params.toString()}`;
    }

    fetch(url)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des événements");
        }
        return response.json();
    })
    .then((data) => {
        const events = Object.values(data);

        if (events.length > 0) {
            displayEvent(events);
        } else {
            containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
        }
    })
    .catch((error) => {
        console.error("Erreur : ", error);
        containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
    });
});

function displayEvent(events) {
    containerEvent.innerHTML = "";

    // Vérification si 'events' est un tableau
    if (!Array.isArray(events)) {
        console.error("La réponse de l'API n'est pas un tableau :", events);
        containerEvent.innerHTML = "<p>Aucun événement trouvé.</p>";
        return;
    }

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
    const description = event.description || "Aucune description disponible.";

    modalImage.src = imageUrl;
    modalImage.alt = `Image de l'événement ${title}`;
    modalTitle.textContent = title;
    modalInfo.innerHTML = `
        <p><strong>Date et heure de début :</strong> ${dateTimeStart}</p>
        <p><strong>Date et heure de fin :</strong> ${dateTimeEnd}</p>
        <p><strong>Nombre de joueurs :</strong> ${players}</p>
        <p><strong>Organisateur :</strong> ${createdBy}</p>
    `;
    modalDescription.textContent = description;

    checkUserLoginStatus(event.id);
}


function checkUserLoginStatus(eventId) {
    const token = getToken();
    const inscriptionLink = modalButton.querySelector("#inscriptionLink");

    if (!token) {
        console.error("Aucun token trouvé. Redirection vers la page de connexion.");
        modalButton.style.display = "none";
        alert("Veuillez vous connecter pour vous inscrire à cet événement.");
        inscriptionLink.href = "/signin";
        return;
    }

    const url = `${apiUrl}events/${eventId}/add-participant`;

    inscriptionLink.addEventListener("click", function(event) {
        event.preventDefault();

        fetch(url, {
            method: "POST",
            headers: {
                "X-AUTH-TOKEN": token, 
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            if (response.ok) {
                return response.json(); 
            } else if (response.status === 403) {
                console.warn("Utilisateur déjà inscrit à l'événement.");
                modalButton.style.display = "none";
                alert("Vous êtes déjà inscrit à cet événement.");
            } else if (response.status === 404) {
                console.error("Événement introuvable.");
                throw new Error("Erreur 404 : Événement introuvable.");
            } else if (response.status === 401) {
                console.error("Utilisateur non connecté.");
                modalButton.style.display = "none";
                alert("Veuillez vous connecter pour vous inscrire à cet événement.");
            } else {
                throw new Error("Erreur inattendue lors de la vérification.");
            }
        })
        .then((data) => {
            if (data && !data.isRegistered) {
                modalButton.style.display = "block";
                inscriptionLink.href = url; 
                alert("Inscription réussie !");
                window.location.href = "/inscription";
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la vérification de l'inscription :", error);
            modalButton.style.display = "none";
        });
    });
}

function inscrireUtilisateur(eventId) {
    const token = getToken();
    if (!token) {
        console.warn("Utilisateur non connecté. Redirection vers la page de connexion.");
        window.location.href = "/signin";
        return;
    }

    const url = `${apiUrl}events/${eventId}/add-participant`;

    fetch(url, { 
        method: "POST",
        headers: {
            "X-AUTH-TOKEN": token, 
            "Content-Type": "application/json",
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Erreur lors de l'inscription à l'événement");
        }
        alert("Vous êtes inscrit à l'événement avec succès !");
        window.location.href = "/inscription";
    })
    .catch((error) => {
        console.error("Erreur : ", error);
        alert("Une erreur est survenue lors de l'inscription à l'événement.");
    });
};

// Fonction pour le caroussel
const slide = ["/Images/pokemon.webp", "/Images/playstation.jpg", "/Images/video-game.jpg", "/Images/gamer.jpg"];
let numero = 0;

function ChangeSlide(sens) {
    numero = numero + sens;
    if (numero < 0) numero = slide.length - 1;
    if (numero > slide.length - 1) numero = 0;
    document.getElementById("slide").src = slide[numero];
}

fetchEventsOnLoad();
const containerValidation = document.querySelector(".event-list");

// Fonction pour récupérer les événements
function fetchEventsOnLoad() {
    const url = `${apiUrl}all`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des événements");
            }
            return response.json();
        })
        .then((data) => {
            const limitedData = data.slice(0, 2);
            displayValidationCards(limitedData);
        })
        .catch((error) => {
            containerValidation.innerHTML = "<p>Aucun événement trouvé.</p>";
        });
}

// Fonction pour afficher les événements au format `card-validation`
function displayValidationCards(events) {
    containerValidation.innerHTML = "";

    if (events.length === 0) {
        containerValidation.innerHTML = "<p>Aucun événement trouvé.</p>";
        return;
    }

    events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("card-validation");

        const eventImage = event.imageUrl && event.imageUrl !== "" ? event.imageUrl : "/Images/def-event.webp";
        card.innerHTML = `
            <img src="${eventImage}" alt="Image de l'événement">
            <div class="card-content-validation">
                <h3>${event.title || "Titre non disponible"}</h3>
                <p><strong>Date de début :</strong> ${formatDate(event.dateTimeStart || "Non spécifié")}</p>
                <p><strong>Date de fin :</strong> ${formatDate(event.dateTimeEnd || "Non spécifié")}</p>
                <a href="/liste-event" class="view-details">Plus d'informations <i class="bi bi-arrow-right-circle"></i></a>
            </div>
        `;
        containerValidation.appendChild(card);
    });
}

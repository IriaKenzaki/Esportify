const slide = ["/Images/pokemon.webp", "/Images/playstation.jpg", "/Images/video-game.jpg", "/Images/gamer.jpg"];
let numero = 0;

function ChangeSlide(sens) {
    numero = numero + sens;
    if (numero < 0) numero = slide.length - 1;
    if (numero > slide.length - 1) numero = 0;
    document.getElementById("slide").src = slide[numero];
}

const containerValidation = document.querySelector(".event-list");

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
            const eventsArray = Object.values(data);
            const limitedData = eventsArray.slice(0, 2);
            displayValidationCards(limitedData);
        })
        .catch((error) => {
            containerValidation.innerHTML = "<p>Aucun événement trouvé.</p>";
        });
}

function displayValidationCards(events) {
    containerValidation.innerHTML = "";

    if (events.length === 0) {
        containerValidation.innerHTML = "<p>Aucun événement trouvé.</p>";
        return;
    }

    events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("card-validation");

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
                <div style="text-align: right;">
                    <a href="#" class="viewDetails" data-id="${event.id}">
                        Plus d'informations <i class="bi bi-arrow-right-circle"></i>
                    </a>
                </div>
            </div>`;
        
        containerValidation.appendChild(card);
    });
}

fetchEventsOnLoad();
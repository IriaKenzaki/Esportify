document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://main-bvxea6i-u3bqvlpugi4lo.fr-4.platformsh.site/api/event/all';
    const container = document.querySelector('.container');
    const modal = document.getElementById('eventModal');
    const closeModalButton = modal.querySelector('.close-button');
    const eventTitle = document.getElementById('eventTitle');
    const eventDescription = document.getElementById('eventDescription');
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    const eventCreator = document.getElementById('eventCreator');
    const registerButton = document.getElementById('registerButton');

    const filters = {
        date: '',
        time: '',
        number: '',
        pseudo: ''
    };

    document.querySelector('button').addEventListener('click', () => {
        filters.date = document.getElementById('date').value;
        filters.time = document.getElementById('time').value;
        filters.number = document.getElementById('number').value;
        filters.pseudo = document.getElementById('pseudo').value;
        fetchEvents();
    });

    function fetchEvents() {
        const queryParams = new URLSearchParams(filters).toString();
        fetch(`${apiUrl}?${queryParams}`)
            .then(response => response.json())
            .then(events => renderEvents(events))
            .catch(error => console.error('Erreur:', error));
    }

    function renderEvents(events) {
        container.innerHTML = '';
        events.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('card');

            const imageUrl = event.image || 'default-image.jpg';
            card.innerHTML = `
                <img src="${imageUrl}" alt="Image de l'événement">
                <div class="card-content">
                    <h3>${event.title}</h3>
                    <p>Joueurs : ${event.numberOfPlayers}</p>
                    <p>Date : ${new Date(event.getDateTimeStart).toLocaleDateString()}</p>
                    <p>Heure : ${new Date(event.getDateTimeStart).toLocaleTimeString()}</p>
                    <button data-id="${event.id}" class="details-button">Plus d'informations</button>
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', event => {
                const eventId = event.target.dataset.id;
                showEventDetails(eventId);
            });
        });
    }

    function showEventDetails(eventId) {
        fetch(`${apiUrl}/${eventId}`)
            .then(response => response.json())
            .then(event => {
                eventTitle.textContent = event.title;
                eventDescription.textContent = event.description;
                eventStart.textContent = new Date(event.getDateTimeStart).toLocaleString();
                eventEnd.textContent = new Date(event.getDateTimeEnd).toLocaleString();
                eventCreator.textContent = event.createdBy;
                registerButton.onclick = () => registerToEvent(eventId);
                modal.style.display = 'flex';
            })
            .catch(error => console.error('Erreur:', error));
    }

    function registerToEvent(eventId) {
        fetch(`${apiUrl}/${eventId}/register`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                alert('Inscription réussie!');
                modal.style.display = 'none';
            })
            .catch(error => console.error('Erreur:', error));
    }

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    fetchEvents();
});
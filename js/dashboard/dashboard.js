let allStats = null;
let allMessages = null;

async function fetchDashboardData() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });

    return Promise.all([
        fetch(apiUrl + 'admin/dashboard', { method: 'GET', headers })
            .then(response => response.ok ? response.json() : Promise.reject("Erreur dans la récupération des statistiques"))
            .then(stats => {
                allStats = stats;
            }),

        fetch(apiUrl + 'contact', { method: 'GET', headers })
            .then(response => response.ok ? response.json() : Promise.reject("Erreur dans la récupération des messages"))
            .then(messages => {
                allMessages = messages;
            })
    ]).catch(error => {
        console.error("Erreur lors de la récupération des données:", error);
    });
}

function deleteMessage(messageId) {
    const token = getToken(); 
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });

    fetch(apiUrl + 'contact/' + messageId, { 
        method: 'DELETE',
        headers: headers
    })
    .then(response => {
        if (response.ok) {
            allMessages = allMessages.filter(message => message.id !== messageId);
            updateMessages(allMessages);
        } else {
            console.error("Erreur lors de la suppression du message");
        }
    })
    .catch(error => {
        console.error("Erreur réseau lors de la suppression du message:", error);
    });
}

function updateMessages(messages = allMessages) {
    const container = document.getElementById('messages-section');
    container.textContent = '';

    if (!messages || messages.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucun message disponible.';
        container.appendChild(p);
        return;
    }

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
    
        const user = escapeHTML(message.user);
        const title = escapeHTML(message.title);
        const text = escapeHTML(message.text);
    
        messageElement.innerHTML = `
            <p><strong>${user} :</strong> ${title}</p>
            <p><strong>Contenu du message :</strong>${text}</p>
            <button onclick="deleteMessage(${message.id})">Supprimer</button>
        `;
    
        container.appendChild(messageElement);
    });
}

function showHideSections() {
    const filterType = document.getElementById('filter-type').value;

    if (filterType === 'message') {
        document.getElementById('stat-filters').style.display = 'none';
        document.getElementById('messages-section').style.display = 'block';
        document.getElementById('histogram').style.display = 'none';

        updateMessages(allMessages);
    } else if (filterType === 'statistique') {
        document.getElementById('stat-filters').style.display = 'block';
        document.getElementById('messages-section').style.display = 'none';
        document.getElementById('histogram').style.display = 'block';
    }
}

function applyFilters() {
    const filterType = document.getElementById('filter-type').value;

    if (filterType === 'statistique') {
        applyStatFilters();
    }
}

async function applyStatFilters() {
    const startDate = document.getElementById('startDateStat').value ? document.getElementById('startDateStat').value : null;
    const endDate = document.getElementById('endDateStat').value ? document.getElementById('endDateStat').value : null;
    const results = document.getElementById('role-select').value;  

    const resultsMapping = {
        'event': 'eventsCreated',
        'user': 'usersCreated',
        'connexion': 'usersConnected',
        'all': 'all'
    };

    const apiResultKey = resultsMapping[results] || 'all';

    let queryString = '?';
    if (startDate) {
        queryString += `startDate=${encodeURIComponent(startDate)}&`;
    }
    if (endDate) {
        queryString += `endDate=${encodeURIComponent(endDate)}&`;
    }
    if (apiResultKey !== 'all') {
        queryString += `results=${encodeURIComponent(apiResultKey)}&`;
    }

    queryString = queryString.slice(0, -1);

    const url = apiUrl + 'admin/dashboard' + queryString;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "X-AUTH-TOKEN": getToken(),
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Erreur lors de la récupération des statistiques filtrées.");
            return;
        }

        const filteredStats = await response.json();

        loadChartJS(() => updateHistogramWithFilters(filteredStats));
    } catch (error) {
        console.error("Erreur lors de l'appel de l'API pour les statistiques :", error);
    }
}

function loadChartJS(callback) {
    if (window.Chart) {
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function () {
        callback();
    };
    script.onerror = function () {
        console.error('Erreur lors du chargement de Chart.js');
    };
    document.head.appendChild(script);
}

function updateHistogramWithFilters(filteredStats) {
    const ctx = document.getElementById('histogram').getContext('2d');
    const chartData = {
        labels: ['Evènements créés', 'Comptes créés', 'Utilisateurs connectés'],
        datasets: [{
            label: 'Statistiques',
            data: [
                filteredStats.eventsCreated || 0,
                filteredStats.usersCreated || 0,
                filteredStats.usersConnected || 0
            ],
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };

    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

document.getElementById('filter-type').addEventListener('change', showHideSections);
document.getElementById('searchStatsButton').addEventListener('click', applyFilters);

fetchDashboardData().then(() => {
    showHideSections(); 
});

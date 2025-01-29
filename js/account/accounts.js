let cachedUsers = []; 

function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

function isAdmin() {
    const token = getToken();
    const userRole = getRole(token);
    return userRole === 'ROLE_ADMIN';
}

async function searchUsers() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });

    const response = await fetch(apiUrl + 'admin/users', {
        method: 'GET',
        headers: headers,
    });

    if (response.ok) {
        const users = await response.json();
        return users;
    } else {
        return [];
    }
}

function getRoleLabel(role) {
    const roleMapping = {
        'ROLE_USER': 'Joueur',
        'ROLE_ADMIN': 'Admin',
        'ROLE_ORGANISATEUR': 'Organisateur'
    };
    return roleMapping[role] || role;
}

function displayUsers(users) {
    const responseList = document.getElementById('response-list');
    responseList.innerHTML = ''; 

    if (Array.isArray(users) && users.length > 0) {
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('response');

            const userDetails = document.createElement('div');
            userDetails.classList.add('response-details');

            const userRole = user.roles && user.roles[0]; 
            const roleLabel = userRole ? getRoleLabel(userRole) : 'Rôle non défini';

            const roleSpan = document.createElement('span');
            roleSpan.classList.add('role');
            roleSpan.textContent = roleLabel;

            const pseudoSpan = document.createElement('span');
            pseudoSpan.classList.add('pseudo');
            pseudoSpan.textContent = user.username;

            const emailSpan = document.createElement('span');
            emailSpan.classList.add('email');
            emailSpan.textContent = user.email;

            const accessButton = document.createElement('button');
            const accessLink = document.createElement('a');
            accessLink.classList.add('acces');
            accessLink.textContent = 'Gérer ce compte';
            accessLink.addEventListener('click', function (event) {
                sessionStorage.setItem('userId', user.id);
                window.location.href = '/useraccount';
            });
            accessButton.appendChild(accessLink);

            userDetails.appendChild(roleSpan);
            userDetails.appendChild(pseudoSpan);
            userDetails.appendChild(emailSpan);
            userDiv.appendChild(userDetails);
            userDiv.appendChild(accessButton);

            responseList.appendChild(userDiv);
        });
    }
}

function filterUsers() {
    const pseudoSearch = document.getElementById('pseudo-search').value.trim().toLowerCase();
    const emailSearch = document.getElementById('email-search').value.trim().toLowerCase();
    const roleSearch = document.getElementById('role-select').value.trim().toLowerCase();

    const filteredUsers = cachedUsers.filter(user => {
        const usernameMatch = user.username.toLowerCase().includes(pseudoSearch);
        const emailMatch = user.email.toLowerCase().includes(emailSearch);
        const roleMatch = !roleSearch || (user.roles && user.roles[0].toLowerCase().includes(roleSearch));
        return usernameMatch && emailMatch && roleMatch;
    });

    displayUsers(filteredUsers);
}

document.getElementById('searchButton').addEventListener('click', async function (event) {
    event.preventDefault();

    try {
        cachedUsers = await searchUsers(); 
        displayUsers(cachedUsers); 
    } catch (error) {
        alert('Une erreur est survenue lors de la recherche.');
    }
});

document.getElementById('pseudo-search').addEventListener('input', filterUsers);
document.getElementById('email-search').addEventListener('input', filterUsers);
document.getElementById('role-select').addEventListener('change', filterUsers);

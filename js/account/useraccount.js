const userId = sessionStorage.getItem("userId");
if (!userId) {
    alert("Utilisateur non spécifié.");
    window.location.href = '/accounts';
}
loadUserDetails(userId);
async function loadUserDetails(userId) {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });
    try {
        const response = await fetch(apiUrl + `admin/users`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            console.error(`Erreur ${response.status}: ${response.statusText}`);
            alert("Erreur lors du chargement des informations de l'utilisateur.");
            return;
        }

        const users = await response.json();
        console.log("Utilisateurs récupérés:", users);

        const user = users.find(u => u.id === parseInt(userId));

        if (!user) {
            alert("Utilisateur non trouvé.");
            return;
        }

        document.getElementById('UsernameInput').value = user.username || '';
        document.getElementById('EmailInput').value = user.email || '';
        document.getElementById('role-select').value = user.roles[0] || '';
    } catch (error) {
        console.error("Erreur réseau lors du chargement des détails utilisateur:", error);
    }
}
async function updateUserDetails() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });
    const updatedUser = {
        username: document.getElementById('UsernameInput').value,
        role: document.getElementById('role-select').value,
        email: document.getElementById('EmailInput').value,
    };
    try {
        const response = await fetch(apiUrl + `admin/users/edit/${userId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updatedUser),
        });
        if (response.ok) {
            const result = await response.json();
            alert(result.message || "Utilisateur mis à jour avec succès.");
            console.log("Utilisateur mis à jour:", result);
        } else {
            const error = await response.json();
            alert(error.message || "Erreur lors de la mise à jour de l'utilisateur.");
            console.error("Erreur mise à jour utilisateur:", error);
        }
    } catch (error) {
        console.error("Erreur réseau lors de la mise à jour de l'utilisateur:", error);
    }
}
async function deleteUser() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        'Content-Type': 'application/json',
    });
    try {
        const response = await fetch(apiUrl + `admin/users/${userId}/delete`, {
            method: 'DELETE',
            headers: headers,
        });
        if (response.ok) {
            alert("Utilisateur supprimé avec succès.");
            window.location.href = '/accounts';
        } else {
            alert("Erreur lors de la suppression de l'utilisateur.");
            console.error("Erreur suppression utilisateur:", await response.json());
        }
    } catch (error) {
        console.error("Erreur réseau lors de la suppression de l'utilisateur:", error);
    }
}
document.getElementById('updateButton').addEventListener('click', function (event) {
    event.preventDefault();
    updateUserDetails();
});
document.getElementById('deleteButton').addEventListener('click', function (event) {
    event.preventDefault();
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
        deleteUser();
    }
});


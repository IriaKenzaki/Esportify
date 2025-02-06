const form = document.querySelector("#searchForm");
const containerAvis = document.querySelector(".container-event");


function getToken() {
    const token = getCookie(tokenCookieName);
    return token;
}

document.getElementById("searchButton").addEventListener("click", function (event) {
    event.preventDefault(); 

    const date = document.getElementById("date").value; 
    const rate = document.querySelector("input[name='rate']:checked")?.value; 

    const params = { date, rate };

    fetch(apiUrl + "reviews")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des avis");
            }
            return response.json();
        })
        .then((data) => {
            if (data && Array.isArray(data)) {
                const filteredAvis = filterAvis(data, params);
                if (filteredAvis.length > 0) {
                    displayAvis(filteredAvis);
                } else {
                    containerAvis.innerHTML = "<p>Aucun avis trouvé.</p>";
                }
            } else {
                containerAvis.innerHTML = "<p>Aucun avis trouvé.</p>";
            }
        })
        .catch((error) => {
            console.error("Erreur : ", error);
            containerAvis.innerHTML = "<p>Une erreur s'est produite lors de la récupération des avis.</p>";
        });
});


function filterAvis(avisList, params) {
    return avisList.filter((avis) => {
        const avisDate = avis.createdAt?.split(" ")[0];
        const dateMatch = params.date ? avisDate === params.date : true;
        const rateMatch = params.rate ? avis.rating === parseInt(params.rate, 10) : true;
        console.log("Avis Date:", avisDate);
        console.log("Avis object:", avis);
        console.log("Utilisateur Date:", params.date);
        console.log("Date Match:", dateMatch);
        return dateMatch && rateMatch;
    });
}

async function checkUserRole() {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });

    try {
        const response = await fetch(apiUrl + "account/me", {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des informations utilisateur.");
        }

        const data = await response.json(); // Contient les informations utilisateur, y compris le rôle
        return data.roles.includes("ROLE_ADMIN"); // Vérifie si l'utilisateur a le rôle ROLE_ADMIN
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle : ", error);
        return false; // En cas d'erreur, on assume que l'utilisateur n'est pas admin
    }
}



function displayAvis(avisList) {
    containerAvis.innerHTML = "";  // Réinitialise le container

    checkUserRole().then((isAdmin) => {
        avisList.forEach((avis) => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <div class="card-content" style="padding: 30px 15px;">
                    <h3>${avis.title}</h3>
                    <hr class="card-divider" />
                    <p><strong>Date :</strong> ${avis.createdAt}</p>
                    <p><strong>Pseudo de l'auteur :</strong> ${avis.user}</p>
                    <div class="field">
                        <label for="rate" class="form-label"></label>
                        <div class="rate" id="rate-review">
                            ${generateStars(avis.rating)}
                        </div>
                    </div>
                    <p>${avis.content || "Pas de description disponible."}</p>
                    ${isAdmin ? `<button type="button" data-show="ROLE_ADMIN" id="button-modal" class="delete-button" data-id="${avis.id}">
                                    Supprimer
                                  </button>` : ""}
                </div>
            `;
            containerAvis.appendChild(card);
        });

        // Ajout des événements pour les boutons de suppression si l'utilisateur est admin
        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", (e) => {
                const avisId = e.target.getAttribute("data-id");
                deleteAvis(avisId);
            });
        });
    });
}

function generateStars(rate) {
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= rate) {
            starsHTML += `<span style="color: gold;">&#9733;</span>`; 
        } else {
            starsHTML += `<span style="color: gray;">&#9734;</span>`; 
        }
    }
    return starsHTML;
}

function deleteAvis(avisId) {
    const token = getToken();
    const headers = new Headers({
        "X-AUTH-TOKEN": token,
        "Content-Type": "application/json",
    });
    fetch(`${apiUrl}avis/${avisId}`, {
        method: "DELETE",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    console.error("Avis non trouvé :", avisId);
                } else if (response.status === 403) {
                    console.error("Permission refusée pour supprimer cet avis.");
                }
                throw new Error(`Erreur lors de la suppression de l'avis : ${response.status}`);
            }
            const avisCard = document.querySelector(`button[data-id="${avisId}"]`).closest(".card");
            if (avisCard) avisCard.remove();
        })
        .catch((error) => {
            console.error("Erreur lors de la suppression de l'avis :", error);
        });
}

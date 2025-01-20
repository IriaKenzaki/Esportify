const modal = document.getElementById('eventModal');
const viewDetailsLink = document.getElementById('viewDetails');
const closeButton = document.querySelector('.close-button');

// Ouvrir la modal lorsque le lien est cliqué
viewDetailsLink.addEventListener('click', function(event) {
    event.preventDefault();  // Empêche le comportement par défaut du lien
    modal.style.display = 'flex';  // Affiche la modal
});

// Fermer la modal lorsque l'utilisateur clique sur la croix
closeButton.addEventListener('click', function() {
    modal.style.display = 'none';  // Cache la modal
});

// Fermer la modal lorsque l'utilisateur clique en dehors de la modal
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';  // Cache la modal si l'utilisateur clique à l'extérieur
    }
});

console.log("Script events.js chargé !");
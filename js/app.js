console.log("JavaScript chargé !");

// Récupérer le formulaire
const formulaire = document.getElementById('mon-formulaire');

// Ecouter la soumission
formulaire.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer la valeur du champ date
    const champDate = document.getElementById('date');
    const valeurDate = champDate.value;

    console.log("Date saisie :", valeurDate);
});
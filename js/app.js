console.log("JavaScript chargé !");

// Récupérer le formulaire
const formulaire = document.getElementById('mon-formulaire');

// Récupérer les éléments des checkboxes
const checkboxAucun = document.getElementById('sport-aucun');
const autresCheckboxes = document.querySelectorAll('input[name="sport"]:not(#sport-aucun)');

// Si on coche "Aucun", décocher les autres cases
checkboxAucun.addEventListener('change', function() {
    if (this.checked) {
        autresCheckboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });
    }
});

// Si on choisi un sport, décocher "Aucun"
autresCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            checkboxAucun.checked = false;
        }
    });
});

// Ecouter la soumission
formulaire.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer la valeur du champ date
    const champDate = document.getElementById('date');
    const valeurDate = champDate.value;

    // Récupérer la valeur du champ repas
    const champRepas = document.getElementById('repas');
    const valeurRepas = champRepas.value;

    // Récupérer les sports cochés
    const checkboxesCochees = document.querySelectorAll('input[name="sport"]:checked');
    const sports = [];
    checkboxesCochees.forEach(function(checkbox) {
        sports.push(checkbox.value);
    })

    // Vérifier qu'au moins un sport est sélectionné
    if (sports.length === 0) {
        alert("Veuillez sélectionner au moins un sport ou 'Aucun'");
        return;
    }

    // Récupérer la valeur du champ symptômes
    const champSymptomes = document.getElementById('symptomes');
    const valeurSymptomes = champSymptomes.value;

    // Créer l'objet journée
    const journee = {
        date: valeurDate,
        repas: valeurRepas,
        sports: sports,
        symptomes: valeurSymptomes
    };

    // Sauvegarder dans LocalStorage
    saveJournee(journee)
    afficherHistorique();

    console.log("Journée sauvegardée :", journee);
    alert("Journée enregistrée avec succès !");

    // Réinitialiser le formulaire
    formulaire.reset();

    // console.log("Date saisie :", valeurDate);
    // console.log("Repas consommés:", valeurRepas);
    // console.log("Sports :", sports);
    // console.log("Symptômes :", valeurSymptomes);
});

// Récupérer toutes les journées du LocalStorage
function getJournees() {
    const journeesJSON = localStorage.getItem('journees');
    if (journeesJSON) {
        return JSON.parse(journeesJSON);
    }
    return []; // Tableau vide si rien n'est sauvegardé
}

// Sauvegarder une nouvelle journée
function saveJournee(journee) {
    const journees = getJournees(); // Récupérer les anciennes
    journees.push(journee); // Ajoute la nouvelle
    localStorage.setItem('journees', JSON.stringify(journees)); // Sauvegarder
}

// Afficher l'historique
function afficherHistorique() {
    const journees = getJournees();
    const listeJournees = document.getElementById('liste-journees');

    if (journees.length === 0) {
        listeJournees.innerHTML = '<p>Aucune journée enregistrée pour le moment.</p>';
        return;
    }

    // Trier par date (plus récente en haut)
    journees.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Créer le tableau HTML
    let html = '<table class="table-historique">';
    html += '<thead><tr>';
    html += '<th>Date</th>';
    html += '<th>Repas</th>';
    html += '<th>Sport(s)</th>';
    html += '<th>Symptômes</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    journees.forEach(function(journee) {
        // Classe CSS selon les symptômes
        let classeSymptome = 'symptome-' + journee.symptomes;

        // Formater les sports
        let sportsTexte = journee.sports.join(', ');

        // Formater la date
        let dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');

        // Texte des symptômes
        let symptomeTexte = journee.symptomes;
        if (journee.symptomes === 'aucun') symptomeTexte = '🟢 Aucun';
        if (journee.symptomes === 'leger') symptomeTexte = '🟠 Léger';
        if (journee.symptomes === 'important') symptomeTexte = '🔴 Important';

        html += '<tr>';
        html += '<td>' + dateFormatee + '</td>';
        html += '<td>' + journee.repas + '</td>';
        html += '<td>' + sportsTexte + '</td>';
        html += '<td class="' + classeSymptome + '">' + symptomeTexte + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';

    listeJournees.innerHTML = html;
}

afficherHistorique();


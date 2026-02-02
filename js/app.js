console.log("JavaScript chargé !");

// Définir la date max à aujourd'hui
const champDate = document.getElementById('date');
const aujourdhui = new Date().toISOString().split('T')[0];
champDate.max = aujourdhui;
champDate.valueAsDate = new Date(); // Date du jour par défaut

// Récupérer le formulaire
const formulaire = document.getElementById('monFormulaire');

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

// Si on choisit un sport, décocher "Aucun"
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
    const valeurDate = champDate.value ;   

    // Récupérer la valeur du champ repas
    const champRepas = document.getElementById('repas');
    const valeurRepas = champRepas.value;

    // Récupérer les sports cochés
    const checkboxesCochees = document.querySelectorAll('input[name="sport"]:checked');
    const sports = [];
    checkboxesCochees.forEach(function(checkbox) {
        sports.push(checkbox.value);
    })

    // Récupérer la valeur du champ symptômes digestifs
    const champSymptomes = document.getElementById('symptomes');
    const valeurSymptomes = champSymptomes.value;

    // Vérifier que la date n'est pas vide
    if (valeurDate.length === 0) {
        alert("Veuillez sélectionner une date");
        return;
    }

    // Vérifier que la date n'est pas dans le futur
    const dateSelectionnee = new Date(valeurDate);
    const dateAujourdhui = new Date();
    dateAujourdhui.setHours(0, 0, 0, 0); // Mettre l'heure à minuit pour comparer seulement la date

    if (dateSelectionnee > dateAujourdhui) {
        alert("Vous ne pouvez pas sélectionner une date dans le futur");
        return;
    }

    // Vérifier que la case repas n'est pas vide
    if (valeurRepas.length === 0) {
        alert("Veuillez entrer un repas dans la case 'Repas consommés'");
        return;
    }
    
    // Vérifier qu'au moins un sport est sélectionné
    if (sports.length === 0) {
        alert("Veuillez sélectionner au moins un sport ou 'Aucun'");
        return;
    }

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
    afficherGraphique();

    console.log("Journée sauvegardée :", journee);
    alert("Journée enregistrée avec succès !");

    // Réinitialiser le formulaire
    formulaire.reset();
    // Remettre la date du jour après reset
    champDate.valueAsDate = new Date();

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
    const listeJournees = document.getElementById('listeJournees');

    if (journees.length === 0) {
        listeJournees.innerHTML = '<p>Aucune journée enregistrée pour le moment.</p>';
        return;
    }

    // Trier par date (plus récente en haut)
    journees.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Créer le tableau HTML
    let html = '<table class="tableHistorique">';
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

let monGraphique = null; // Variable locale pour stocker le graphique

function afficherGraphique() {
    const journees = getJournees();
    const canvas = document.getElementById('graphiqueSymptomes');
    const conteneur = document.getElementById('conteneurGraphique');

    // Si pas de données, affiche un message
    if (journees.length === 0) {
        conteneur.innerHTML = '<p class="messagePasDeDonnees>Aucune donnée à afficher. Enregistrez votre première journée !</p>';
        return;
    }

    // S'assurer que le canvas existe
    if (!canvas) {
        conteneur.innerHTML = '<canvas id="graphiqueSymptomes></canvas>';
    }

    // Compter les symptômes
    let aucun = 0;
    let leger = 0;
    let important = 0;

    journees.forEach(function(journee) {
        if (journee.symptomes === 'aucun') aucun++;
        if (journee.symptomes === 'leger') leger++;
        if (journee.symptomes === 'important') important++;
    });

    // Détruire l'ancien graphique s'il existe
    if (monGraphique) {
        monGraphique.destroy();
    }

    // Créer le nouveau graphique
    const ctx = document.getElementById('graphiqueSymptomes').getContext('2d');
    monGraphique = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['🟢 Aucun', '🟠 Léger', '🔴 Important'],
            datasets: [{
                label: 'Nombre de jours',
                data: [aucun, leger, important],
                backgroundColor: [
                    '#4CAF50',
                    '#FF9800',
                    '#F44336'
                ],
                borderColor: [
                    '#388E3C',
                    '#F57C00',
                    '#D32F2F'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Répartition des symptômes digestifs',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

afficherHistorique();
afficherGraphique();

// Bouton de réinitialisation
const boutonReinitialisation = document.querySelector(".boutonReinitialisation");
boutonReinitialisation.addEventListener('click', function () {
    if (confirm("Voulez-vous vraiment supprimer toutes les données ?")) {
        localStorage.clear();
        afficherHistorique(); // Rafraîchir l'affichage
        afficherGraphique();
        alert("Toutes les données ont été supprimées !");
    }
});

// Bouton d'export CSV
const boutonExportCSV = document.querySelector(".boutonExportCSV");

if(boutonExportCSV) {
    boutonExportCSV.addEventListener('click', function () {
        const journees = getJournees();

        if (journees.length === 0) {
            alert("Aucune donnée à exporter");
            return;
        }

        // Créer le CSV
        let csv = 'Date,Repas,Sports,Symptômes\n';

        journees.forEach(function(journee) {
            // Formater la date
            const dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');

            // Formater les sports
            const sports = journee.sports.join(' + ');

            // Formater les symptômes
            let symptomes = journee.symptomes;
            if (journee.symptomes === 'aucun') symptomes = 'Aucun';
            if (journee.symptomes === 'leger') symptomes = 'Léger';
            if (journee.symptomes === 'important') symptomes = 'Important';

            csv += dateFormatee + ',"' + journee.repas + '",' + sports + ',' + symptomes + '\n';
        });
        
        // Télécharger le fichier
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'digesTrack-export.csv';
        lien.click();

        alert("Export CSV réussi !");
    });
}



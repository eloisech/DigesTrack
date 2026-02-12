console.log("DigesTrack !");

// Variable globale pour savoir si on est en mode modification
let indexEnCoursDeModification = null;

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

// Fonction helper pour nettoyer et parser les aliments
function parseAliments(texte) {
    if (!texte || text.trim() === '') return [];
    // Séparer par une virgule ou un point-virgule, trim chaque élément
    return text.split(/[.;]+/).map(item => item.trim()).filter(item => item.length > 0);
}

// Ecouter la soumission
formulaire.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer la valeur du champ date
    const valeurDate = champDate.value;   

    // Récupérer les 8 catégories d'aliments
    const feculents = parseAliments(document.getElementById('feculents').value);
    const proteines = parseAliments(document.getElementById('proteiness').value);
    const legumes = parseAliments(document.getElementById('legumes').value);
    const fruits = parseAliments(document.getElementById('fruits').value);
    const laitiers = parseAliments(document.getElementById('laitiers').value);
    const lipides = parseAliments(document.getElementById('lipides').value);
    const boissons = parseAliments(document.getElementById('boissons').value);
    const autres = parseAliments(document.getElementById('autress').value);

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
    const dateSelectionnee = new Date(valeurDate + 'T00:00:00');
    const dateAujourdhui = new Date();
    dateAujourdhui.setHours(0, 0, 0, 0); // Mettre l'heure à minuit pour comparer seulement la date

    if (dateSelectionnee > dateAujourdhui) {
        alert("Vous ne pouvez pas sélectionner une date dans le futur");
        return;
    }

    // Vérifier qu'au moins une catégorie d'aliments est renseignée
    const tousLesAliments = [...feculents,...proteines,...legumes,...fruits,...laitiers,...lipides,...boissons,...autres];
    if (tousLesAliments.length === 0) {
        alert("Veuillez renseigner au moins une catégorie d'aliments");
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
        aliments: {
            feculents: feculents,
            proteines: proteines,
            legumes: legumes,
            fruits: fruits,
            laitiers: laitiers,
            lipides: lipides,
            boissons: boissons,
            autres: autres
        },
        sports: sports,
        symptomes: valeurSymptomes
    };

    // Vérifier si on est en mode modification ou ajout
    if (indexEnCoursDeModification !== null) {
        // Mode modification 
        const journees = getJournees();
        journee.id = journees[indexEnCoursDeModification].id;
        journees[indexEnCoursDeModification] = journee; // Remplacer
        localStorage.setItem('journees', JSON.stringify(journees));
        
        console.log("Journée modifiée :", journee);
        alert("Journée modifiée avec succès !");
        indexEnCoursDeModification = null;
    } else {
        // Mode ajout 
        saveJournee(journee)
        console.log("Journée sauvegardée :", journee);
        alert("Journée enregistrée avec succès !");
    }
    
    // Rafraîchir l'affichage
    afficherHistorique();
    afficherGraphique();

    // Réinitialiser le formulaire
    formulaire.reset();
    // Remettre la date du jour après reset
    champDate.valueAsDate = new Date();
    // Fermer l'overlay après soumission
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
    const journees = getJournees(); 
    journee.id = Date.now() + Math.random(); // ID unique
    journees.push(journee); // Ajoute la nouvelle journée
    localStorage.setItem('journees', JSON.stringify(journees)); // Sauvegarder
}

// Fonction pour obtenir tous les aliments d'une journée
function getTousLesAliments(journee) {
    if (journee.repas) {
        return parseAliments(journee.repas)
    }

    if (journee.aliments) {
        const aliments = [];
        Object.values(journee.aliments).forEach(categorie => {
            aliments.push(...categorie);
        });
        return aliments;
    }
    return [];
}

// Afficher l'historique
function afficherHistorique() {
    const journees = getJournees();
    const listeJournees = document.getElementById('listeJournees');

    if (journees.length === 0) {
        listeJournees.innerHTML = '<p>Aucune journée enregistrée pour le moment.</p>';
        return;
    }

    // Créer une copie pour le tri
    const journeesTriees = [...journees];
    
    // Trier la copie par date (plus récente en haut)
    journeesTriees.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Créer le tableau HTML
    let html = '<table class="tableHistorique">';
    html += '<thead><tr>';
    html += '<th>Date</th>';
    html += '<th>Aliments</th>';
    html += '<th>Sport(s)</th>';
    html += '<th>Symptômes</th>';
    html += '<th>Actions</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    journeesTriees.forEach(function(journee) {
        // Utiliser l'ID unique (vérifier s'il existe)
        const journeeId = journee.id || 0;
        
        // Classe CSS selon les symptômes
        let classeSymptome = 'symptome-' + journee.symptomes;

        // Formater les sports
        let sportsTexte = journee.sports.join(', ');

        // Formater la date
        let dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');

        // Formater les aliments
        let alimentstTexte = '';
        if (journee.aliments) {
            const categories = [];
            if (journee.aliments.feculents.length) categories.push('🌾 ' + journee.aliments.feculents.join(', '));
            if (journee.aliments.proteines.length) categories.push('🥩 ' + journee.aliments.proteines.join(', '));
            if (journee.aliments.legumes.length) categories.push('🥬 ' + journee.aliments.legumes.join(', '));
            if (journee.aliments.fruits.length) categories.push('🍎 ' + journee.aliments.fruits.join(', '));
            if (journee.aliments.laitiers.length) categories.push('🥛 ' + journee.aliments.laitiers.join(', '));
            if (journee.aliments.lipides.length) categories.push('🥑 ' + journee.aliments.lipides.join(', '));
            if (journee.aliments.boissons.length) categories.push('☕ ' + journee.aliments.boissons.join(', '));
            if (journee.aliments.autres.length) categories.push('🍯 ' + journee.aliments.autres.join(', '));
            alimentsTexte = categories.join('<br>');
        }
        else if (journee.repas) {
            // Ancien format
            alimentstTexte = journee.repas;
        }

        // Texte des symptômes
        let symptomeTexte = journee.symptomes;
        if (journee.symptomes === 'aucun') symptomeTexte = '🟢 Aucun';
        if (journee.symptomes === 'leger') symptomeTexte = '🟠 Léger';
        if (journee.symptomes === 'important') symptomeTexte = '🔴 Important';

        html += '<tr>';
        html += '<td>' + dateFormatee + '</td>';
        html += '<td>' + alimentstTexte + '</td>';
        html += '<td>' + sportsTexte + '</td>';
        html += '<td class="' + classeSymptome + '">' + symptomeTexte + '</td>';
        html += '<td class="celluleActions">';
        html += '<button class="boutonModifier" data-id="' + journeeId + '">✏️ Modifier</button>';
        html += '<button class="boutonSupprimer" data-id="' + journeeId + '">🗑️ Supprimer</button>';
        html += '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    listeJournees.innerHTML = html;
    
    const boutonsSupprimer = document.querySelectorAll('.boutonSupprimer');
    boutonsSupprimer.forEach(function(bouton) {
        bouton.addEventListener('click', function() {
            const id = parseFloat(this.getAttribute('data-id'));
            supprimerJournee(id);
        });
    });

    const boutonsModifier = document.querySelectorAll('.boutonsModifier');
    boutonsModifier.forEach(function(bouton) {
        bouton.addEventListener('click', function() {
            const id = parseFloat(this.getAttribute('data-id'));
            modifierJourneeerJournee(id);
        });
    });
}

// Fonction pour supprimer une journée
function supprimerJournee(id) {
    // Récupérer toutes les journées
    const journees = getJournees();
    // Trouver l'index par l'ID
    const index = journees.findIndex(function(j) {
        return j.id === id;
    });

    if (index !== -1) {
        // Demander confirmation avant de supprimer
        if (confirm("Voulez-vous vraiment supprimer cette journée ?")) {
            // Supprimer la journée à l'index trouvé
            journees.splice(index, 1);

            // Sauvegarder le nouveau tableau dans LocalStorage
            localStorage.setItem('journees', JSON.stringify(journees));

            // Rafraîchir l'affichage
            afficherHistorique();
            afficherGraphique();

            alert("Journée supprimée avec succès !");
        }
    } else {
        alert("Erreur : journée introuvable");
    }
}

// Fonction pour modifier une journée
function modifierJournee(id) {
    
    // Récupérer toutes les journées
    const journees = getJournees();

    // Trouver la journée par l'ID
    const index = journees.findIndex(function(j) {
        return j.id === id;
    });

    if (index === -1) {
        alert("Erreur : journée introuvable");
        return;
    }

    // Récupérer la journée à modifier
    const journee = journees[index];

    // Stocker l'index pour savoir qu'on modifie
    indexEnCoursDeModification = index;

    // Pré-remplir le formulaire 
    document.getElementById('date').value = journee.date;
    document.getElementById('symptomes').value = journee.symptomes;

    // Pré-remplir les aliments
    if (journee.aliments) {
        document.getElementById('feculents').value = journee.aliments.feculents.join(', ');
        document.getElementById('proteines').value = journee.aliments.proteines.join(', ');
        document.getElementById('legumes').value = journee.aliments.legumes.join(', ');
        document.getElementById('fruits').value = journee.aliments.fruits.join(', ');
        document.getElementById('laitiers').value = journee.aliments.laitiers.join(', ');
        document.getElementById('lipides').value = journee.aliments.lipides.join(', ');
        document.getElementById('boissons').value = journee.aliments.boissons.join(', ');
        document.getElementById('autres').value = journee.aliments.autres.join(', ');
    }
    else if (journee.repas){
        // Ancien format - mettre dans "Autres"
        documents.getElementById('autres').value = journee.repas;
    }

    // Pré-remplir les sports
    const toutesCheckboxes = document.querySelectorAll('input[name="sport"]');
    toutesCheckboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });

    journee.sports.forEach(function(sport) {
        const checkbox = document.querySelector('input[name="sport"][value="' + sport + '"]');
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Ouvrir l'overlay avec le formulaire
    ouvrirOverlay();

    alert("Vous pouvez maintenant modifier les données ci-dessus.\nCliquez sur 'Enregistrer' quand vous avez fini.");
}

let monGraphique = null; // Variable locale pour stocker le graphique

function afficherGraphique() {
    const journees = getJournees();
    const canvas = document.getElementById('graphiqueSymptomes');
    const conteneur = document.getElementById('conteneurGraphique');

    // Si pas de données, affiche un message
    if (journees.length === 0) {
        conteneur.innerHTML = '<h3 class="titreGraphique">Répartition des symptômes</h3><p>Aucune donnée à afficher. Enregistrez votre première journée !</p>';
        return;
    }

    // S'assurer que le canvas existe
    if (!canvas) {
        conteneur.innerHTML = '<canvas id="graphiqueSymptomes"></canvas>';
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

// Gestion de l'overlay du formulaire
// Récupérer les éléments
const boutonOuvrirFormulaire = document.getElementById('boutonOuvrirFormulaire');
const boutonFermerFormulaire = document.getElementById('boutonFermerFormulaire');
const overlayFormulaire = document.getElementById('overlayFormulaire');

// Fonction pour ouvrir l'overlay
function ouvrirOverlay() {
    overlayFormulaire.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
}

// Fonction pour fermer l'overlay
function fermerOverlay() {
    overlayFormulaire.classList.remove('active');
    document.body.style.overflow = ''; // Réactiver le scroll

    // Réinitialiser le formulaire et le mode de modification
    formulaire.reset();
    champDate.valueAsDate = new Date();
    indexEnCoursDeModification = null;
}

// Ouvrir l'overlay au clic sur le bouton
boutonOuvrirFormulaire.addEventListener('click', ouvrirOverlay);

// Fermer l'overlay au clic sur le bouton X
boutonFermerFormulaire.addEventListener('click', fermerOverlay);

// Fermer l'overlay si on clique en dehors
overlayFormulaire.addEventListener('click', function(e) {
    if (e.target === overlayFormulaire) {
        fermerOverlay();
    }
});

// Fermer l'overlay avec la touche Echap
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlayFormulaire.classList.contains('active')) {
        fermerOverlay();
    }
});
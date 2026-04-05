console.log("JavaScript chargé !");

// CONFIGURATION INITIALE

// Définir la date maximale à aujourd'hui
const champDate = document.getElementById('date');
const aujourdhui = new Date().toISOString().split('T')[0];
document.getElementById('filtreDateDebut').max = aujourdhui;
document.getElementById('filtreDateFin').max = aujourdhui;
champDate.max = aujourdhui;
champDate.valueAsDate = new Date(); // Date du jour par défaut

// Récupérer le formulaire
const formulaire = document.getElementById('monFormulaire');

// Récupérer les éléments des checkboxes
const checkboxAucun = document.getElementById('sport-aucun');
const autresCheckboxes = document.querySelectorAll('input[name="sport"]:not(#sport-aucun)');

// Gestion du bouton flottant et de l'overlay
const boutonOuvrirFormulaire = document.getElementById('boutonOuvrirFormulaire');
const overlayFormulaire = document.getElementById('overlayFormulaire');
const boutonFermerFormulaire = document.getElementById('boutonFermerFormulaire');

function reinitialiserFormulaire(){
    formulaire.reset();
    champDate.valueAsDate = new Date();
    repasTypes.forEach(function(type) {
        document.getElementById('bloc-' + type).style.display = 'none';
    });
    formulaire.dataset.indexModification = '';
}

// Gestion de l'affichage des blocs repas
const repasTypes = ['petitDejeuner', 'dejeuner', 'gouter', 'diner'];
document.querySelectorAll('input[name="repas"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        // Cachet tous les blocs
        repasTypes.forEach(function(type) {
            document.getElementById('bloc-' + type).style.display = 'none';
        });
        // Afficher uniquement celui sélectionné
        document.getElementById('bloc-' + this.value).style.display = 'block';
    });
});

// Ouvrir le formulaire
boutonOuvrirFormulaire.addEventListener('click', function() {
    overlayFormulaire.classList.add('active');
});

// Fermer le formulaire (bouton X)
boutonFermerFormulaire.addEventListener('click', function() {
    overlayFormulaire.classList.remove('active');
    reinitialiserFormulaire();
});

// Fermer le formulaire (clic sur l'overlay)
overlayFormulaire.addEventListener('click', function(e) {
    if (e.target === overlayFormulaire) {
        overlayFormulaire.classList.remove('active');
        reinitialiserFormulaire();
    }
});

// COMPORTEMENT DES CHECKBOXES

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

// SOUMISSION DU FORMULAIRE

formulaire.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les valeurs
    const valeurDate = champDate.value;
    const champSymptomes = document.getElementById('symptomes');
    const valeurSymptomes = champSymptomes.value;

    // Récupérer les aliments par repas
    const repas = {};
    repasTypes.forEach(function(type) {
        const checkbox = document.getElementById('repas-' + type)
        if (checkbox && checkbox.checked) {
            repas[type] = {
                feculents: document.getElementById(type + '-feculents').value.trim(),
                proteines: document.getElementById(type + '-proteines').value.trim(),
                legumes:   document.getElementById(type + '-legumes').value.trim(),
                fruits:    document.getElementById(type + '-fruits').value.trim(),
                laitiers:  document.getElementById(type + '-laitiers').value.trim(),
                lipides:   document.getElementById(type + '-lipides').value.trim(),
                boissons:  document.getElementById(type + '-boissons').value.trim(),
                autres:    document.getElementById(type + '-autres').value.trim()
            };
        }
    });

    // Récupérer les sports cochés
    const checkboxesCochees = document.querySelectorAll('input[name="sport"]:checked');
    const sports = [];
    checkboxesCochees.forEach(function(checkbox) {
        sports.push(checkbox.value);
    });

    // VALIDATIONS

    // 1. Vérifier que la date n'est pas vide
    if (valeurDate.length === 0) {
        alert("⚠️ Veuillez sélectionner une date");
        return;
    }

    // 2. Vérifier que la date n'est pas dans le futur
    const aujourdHuiString = new Date().toISOString().split('T')[0];

    if (valeurDate > aujourdHuiString) {
        alert("⚠️ Vous ne pouvez pas sélectionner une date dans le futur");
        return;
    }

    // 3. Vérifier qu'au moins un repas est coché
    if (Object.keys(repas).length === 0) {
        alert("⚠️ Veuillez cocher au moins un repas");
        return;
    }

    // 4. Vérifier qu'au moins une catégorie d'aliment est remplie
    let auMoinUnAliment = false;
    Object.values(repas).forEach(function(r) {
        if (Object.values(r).some(v => v !== '')) auMoinUnAliment = true;
    });
    if (!auMoinUnAliment) {
        alert("⚠️ Veuillez renseigner au moins un aliment dans vos repas");
        return;
    }
    
    // 5. Vérifier qu'au moins un sport est sélectionné
    if (sports.length === 0) {
        alert("⚠️ Veuillez sélectionner au moins un sport ou 'Aucun'");
        return;
    }

    // SAUVEGARDE

    // Créer l'objet journée
    const journee = {
        date: valeurDate,
        repas: repas,
        sports: sports,
        symptomes: valeurSymptomes
    };

    // Sauvegarder dans LocalStorage
    const indexModification = formulaire.dataset.indexModification;
    if (indexModification !== undefined && indexModification !== '') {
        // Mode modification : écraser l'entrée existante
        const journees = getJournees();
        journees.sort((a,b) => new Date(b.date) - new Date(a.date));
        journees[indexModification] = journee;
        localStorage.setItem('journees', JSON.stringify(journees));
        formulaire.dataset.indexModification = '';
    } else {
        // Mode ajout normal
        saveJournee(journee);
    }

    overlayFormulaire.classList.remove('active');
    reinitialiserFormulaire();

    // Réinitialiser le formulaire
    formulaire.reset();
    // Masquer tous les blocs repas après enregistrement d'un repas
    repasTypes.forEach(function(type) {
        document.getElementById('bloc-' + type).style.display = 'none';
    });
    // Remettre la date du jour après reset
    champDate.valueAsDate = new Date();
    
    // Afficher les mises à jour (après fermeture pour éviter les blocages)
    afficherHistorique();

    setTimeout(function() {
        afficherGraphiques();
        afficherAnalyseAutomatique(); // ← déplacer ici
    }, 50);

    console.log("✅ Journée sauvegardée :", journee);
    alert("✅ Journée enregistrée avec succès !");
});

// FONCTIONS LOCALSTORAGE

// Récupérer toutes les journées du LocalStorage
function getJournees() {
    const journeesJSON = localStorage.getItem('journees');
    if (journeesJSON) {
        const journees = JSON.parse(journeesJSON);
        
        // Migration : convertir anciennes données (format "repas" en string) vers nouveau format
        return journees.map(function(journee) {
            // Si l'ancien format existe (repas en string)
            if (journee.repas && typeof journee.repas === 'string' && !journee.aliments) {
                return {
                    date: journee.date,
                    aliments: {
                        feculents: '',
                        proteines: '',
                        legumes: '',
                        fruits: '',
                        laitiers: '',
                        lipides: '',
                        boissons: '',
                        autres: journee.repas // Mettre l'ancien repas dans "autres"
                    },
                    sports: journee.sports,
                    symptomes: journee.symptomes
                };
            }
            // Sinon garder le format actuel
            return journee;
        });
    }
    return [];
}

// Sauvegarder une nouvelle journée
function saveJournee(journee) {
    const journees = getJournees();
    journees.push(journee);
    localStorage.setItem('journees', JSON.stringify(journees));
}

// Aplatir tous les repas d'une journée en un objet aliment unique
function getAlimentsJournee(journee) {
    if (journee.aliments) return journee.aliments;
    const aliments = {feculents: '', proteines: '', legumes: '', fruits: '', laitiers: '', lipides: '', boissons: '', autres: ''};
    if (journee.repas) {
        Object.values(journee.repas).forEach(function(repas) {
            Object.keys(aliments).forEach(function(cat) {
                if (repas[cat]) {
                    aliments[cat] = aliments[cat] ? aliments[cat] + ', ' + repas[cat] : repas[cat];
                }
            });
        });
    }
    return aliments;
}

// AFFICHAGE HISTORIQUE

function afficherHistorique() {
    const toutesJournees = getJournees();
    const listeJournees = document.getElementById('listeJournees');
    const compteur = document.getElementById('compteurResultats');

    if (toutesJournees.length === 0) {
        listeJournees.innerHTML = '<p class="messagePasDeDonnees">Aucune journée enregistrée pour le moment.</p>';
        if (compteur) compteur.textContent = '';
        return;
    }

    const filtres = getFiltres();
    const journees = filterJournees(toutesJournees, filtres);

    // Trier par date (plus récente en haut)
    journees.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    if (journees.length === 0) {
        listeJournees.innerHTML = '<p class="messagePasDeDonnees">Aucune journée ne correspond aux filtres sélectionnés.</p>';
        if (compteur) compteur.textContent = '0 résultat sur ' + toutesJournees.length + ' journée(s)';
        return;
    }

    if (compteur) compteur.textContent = journees.length + 'résultat(s) sur ' + toutesJournees.length + ' journée(s)';

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

    journees.forEach(function(journee, index) {
        let classeSymptome = 'symptome-' + journee.symptomes;
        const nomsSports = { natation: 'Natation', velo: 'Vélo', course: 'Course', aucun: 'Aucun'};
        let sportsTexte = journee.sports.map(s => nomsSports[s] || s).join(', ');
        let dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');

        let symptomeTexte = journee.symptomes;
        if (journee.symptomes === 'aucun') symptomeTexte = '🟢 Aucun';
        if (journee.symptomes === 'leger') symptomeTexte = '🟠 Léger';
        if (journee.symptomes === 'important') symptomeTexte = '🔴 Important';

        const aliments = getAlimentsJournee(journee);
        let alimentsHTML = '<div class="colonneAliments">';
        if (journee.repas) {
            const nomsRepas = {petitDejeuner: 'Petit-déjeuner', dejeuner: 'Déjeuner', gouter: 'Goûter', diner: 'Dîner'};
            Object.keys(journee.repas).forEach(function(type) {
                const r = journee.repas[type];
                const lignes = Object.values(r).filter(v => v !== '').join(', ');
                if (lignes) alimentsHTML += '<strong>' + nomsRepas[type] + '</strong> : ' + lignes + '<br>';
            });
        } else {
            // Formater les aliments par catégorie
            let alimentsHTML = '<div class="colonneAliments">';
            if (journee.aliments.feculents) alimentsHTML += '🌾 ' + journee.aliments.feculents + '<br>';
            if (journee.aliments.proteines) alimentsHTML += '🥩 ' + journee.aliments.proteines + '<br>';
            if (journee.aliments.legumes) alimentsHTML += '🥬 ' + journee.aliments.legumes + '<br>';
            if (journee.aliments.fruits) alimentsHTML += '🍎 ' + journee.aliments.fruits + '<br>';
            if (journee.aliments.laitiers) alimentsHTML += '🥛 ' + journee.aliments.laitiers + '<br>';
            if (journee.aliments.lipides) alimentsHTML += '🥑 ' + journee.aliments.lipides + '<br>';
            if (journee.aliments.boissons) alimentsHTML += '☕ ' + journee.aliments.boissons + '<br>';
            if (journee.aliments.autres) alimentsHTML += '🍯 ' + journee.aliments.autres;
        }
        alimentsHTML += '</div>';

        html += '<tr>';
        html += '<td>' + dateFormatee + '</td>';
        html += '<td>' + alimentsHTML + '</td>';
        html += '<td>' + sportsTexte + '</td>';
        html += '<td class="' + classeSymptome + '">' + symptomeTexte + '</td>';
        html += '<td class="celluleActions">';
        html += '<button class="boutonModifier" onclick="modifierJournee(' + index + ')" style="width:110px">✏️ Modifier</button>';
html += '<button class="boutonSupprimer" onclick="supprimerJournee(' + index + ')" style="width:110px">🗑️ Supprimer</button>';
        html += '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    listeJournees.innerHTML = html;
}

function supprimerJournee(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette journée ?")) {
        const journees = getJournees();
        journees.sort((a,b) => new Date(b.date) - new Date(a.date));
        journees.splice(index, 1);
        localStorage.setItem('journees', JSON.stringify(journees));

        // Détruire les graphiques existants pour forcer un redessin propre
        if (graphiqueSymptomes) { graphiqueSymptomes.destroy(); graphiqueSymptomes = null; }
        if (graphiqueTopAliments) { graphiqueTopAliments.destroy(); graphiqueTopAliments = null; }
        if (graphiqueCategories) { graphiqueCategories.destroy(); graphiqueCategories = null; }
        if (graphiqueSports) { graphiqueSports.destroy(); graphiqueSports = null; }

        afficherHistorique();
        afficherGraphiques();
        afficherAnalyseAutomatique();
    }
}

function modifierJournee(index) {
    const journees = getJournees();
    journees.sort((a,b) => new Date(b.date) - new Date(a.date));
    const journee = journees[index];
    
    document.getElementById('date').value = journee.date;
    document.getElementById('symptomes').value = journee.symptomes || '';

    // Réinitialiser les blocs repas
    repasTypes.forEach(function(type) {
        document.getElementById('bloc-' + type).style.display = 'none';
        document.querySelector('input[name="repas"][value="' + type + '"]').checked = false;
    });

    // Pré-remplir avec le format repas
    if (journee.repas) {
        Object.keys(journee.repas).forEach(function(type) {
            const radio = document.querySelector('input[name="repas"][value="' + type + '"]');
            if (radio) {
                radio.checked = true;
                document.getElementById('bloc-' + type).style.display = 'block';
            }
            const r = journee.repas[type];
            Object.keys(r).forEach(function(cat) {
                const champ = document.getElementById(type + '-' + cat);
                if (champ) champ.value = r[cat] || '';
            });
        });
    }

    // Sports
    document.querySelectorAll('input[name="sport"]').forEach(cb => cb.checked = false);
    journee.sports.forEach(sport => {
        const cb = document.querySelector('input[name="sport"][value="' + sport + '"]');
        if (cb) cb.checked = true;
    });

    formulaire.dataset.indexModification = index; // Mémoriser l'index sans rien supprimer
    overlayFormulaire.classList.add('active');
}

// AFFICHAGE GRAPHIQUES

let graphiqueSymptomes = null;
let graphiqueTopAliments = null;
let graphiqueCategories = null;
let graphiqueSports = null;

function afficherGraphiques() {
    const journees = getJournees();
    
    if (journees.length === 0) {
        document.getElementById('messageGraphique1').textContent = 'Aucune donnée à afficher. Enregistrez votre première journée !';
        document.getElementById('messageGraphique1').style.display = 'block';
        document.getElementById('graphiqueSymptomes').style.display = 'none';
        document.getElementById('messageGraphique2').textContent = 'Aucune donnée à afficher. Enregistrez votre première journée !';
        document.getElementById('messageGraphique2').style.display = 'block';
        document.getElementById('graphiqueTopAliments').style.display = 'none';
        document.getElementById('messageGraphique3').textContent = 'Aucune donnée à afficher. Enregistrez votre première journée !';
        document.getElementById('messageGraphique3').style.display = 'block';
        document.getElementById('graphiqueCategories').style.display = 'none';
        document.getElementById('messageGraphique4').textContent = 'Aucune donnée à afficher. Enregistrez votre première journée !';
        document.getElementById('messageGraphique4').style.display = 'block';
        document.getElementById('graphiqueSports').style.display = 'none';
        return;
    }

    // Masquer les messages et afficher les canvas
    document.getElementById('messageGraphique1').style.display = 'none';
    document.getElementById('graphiqueSymptomes').style.display = 'block';
    document.getElementById('messageGraphique2').style.display = 'none';
    document.getElementById('graphiqueTopAliments').style.display = 'block';
    document.getElementById('messageGraphique3').style.display = 'none';
    document.getElementById('graphiqueCategories').style.display = 'block';

    // GRAPHIQUE 1 : Répartition des symptômes
    afficherGraphiqueSymptomes(journees);
    
    // GRAPHIQUE 2 : Top aliments à risque
    afficherGraphiqueTopAliments(journees);
    
    // GRAPHIQUE 3 : Symptômes par catégorie
    afficherGraphiqueCategories(journees);

    // GRAPHIQUE 4 : Symptômes par sport
    afficherGraphiqueSports(journees);
}

function afficherGraphiqueSymptomes(journees) {
    let aucun = 0;
    let leger = 0;
    let important = 0;

    journees.forEach(function(journee) {
        if (journee.symptomes === 'aucun') aucun++;
        if (journee.symptomes === 'leger') leger++;
        if (journee.symptomes === 'important') important++;
    });

    if (graphiqueSymptomes) {
        graphiqueSymptomes.destroy();
        graphiqueSymptomes = null;
    }

    const ctx = document.getElementById('graphiqueSymptomes').getContext('2d');
    graphiqueSymptomes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['🟢 Aucun', '🟠 Léger', '🔴 Important'],
            datasets: [{
                label: 'Nombre de jours',
                data: [aucun, leger, important],
                backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                borderColor: ['#388E3C', '#F57C00', '#D32F2F'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Répartition des symptômes digestifs',
                    font: { size: 16 }
                }
            }
        }
    });
}

function afficherGraphiqueTopAliments(journees) {
    // Compter les occurrences d'aliments avec et sans symptômes
    const compteurAliments = {};

    journees.forEach(function(journee) {
        const avecSymptomes = journee.symptomes !== 'aucun';
        
        // Parcourir toutes les catégories d'aliments
        const aliments = getAlimentsJournee(journee);
        Object.keys(aliments).forEach(function(categorie) {
            const alimentsTexte = aliments[categorie];
    
            if (alimentsTexte) {
                // Séparer les aliments par virgule ou "+"
                const alimentsSepares = alimentsTexte.split(/[,+]/).map(a => a.trim().toLowerCase());
                
                alimentsSepares.forEach(function(aliment) {
                    if (aliment) {
                        if (!compteurAliments[aliment]) {
                            compteurAliments[aliment] = { total: 0, symptomes: 0 };
                        }
                        compteurAliments[aliment].total++;
                        if (avecSymptomes) {
                            compteurAliments[aliment].symptomes++;
                        }
                    }
                });
            }
        });
    });

    // Calculer le pourcentage de risque et trier
    const alimentsAvecRisque = [];
    Object.keys(compteurAliments).forEach(function(aliment) {
        const data = compteurAliments[aliment];
        if (data.total >= 2) { // Au moins 2 occurrences
            const pourcentage = (data.symptomes / data.total) * 100;
            alimentsAvecRisque.push({
                nom: aliment,
                pourcentage: pourcentage,
                occurrences: data.total
            });
        }
    });

    // Trier par pourcentage décroissant et prendre le top 10
    alimentsAvecRisque.sort((a, b) => b.pourcentage - a.pourcentage);
    const top10 = alimentsAvecRisque.slice(0, 10);

    if (top10.length === 0) {
        document.getElementById('messageGraphique2').textContent = 'Pas assez de données (minimum 2 occurrences par aliment)';
        document.getElementById('messageGraphique2').style.display = 'block';
        document.getElementById('graphiqueTopAliments').style.display = 'none';
        return;
    }

    // Créer le graphique
    if (graphiqueTopAliments) {
        graphiqueTopAliments.destroy();
        graphiqueTopAliments = null;
    }

    // Couleurs selon le niveau de risque
    const couleurs = top10.map(function(item) {
        if (item.pourcentage > 75) return '#F44336'; // Rouge
        if (item.pourcentage > 50) return '#FF9800'; // Orange
        return '#FFC107'; // Jaune
    });

    const ctx = document.getElementById('graphiqueTopAliments').getContext('2d');
    graphiqueTopAliments = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(item => item.nom),
            datasets: [{
                label: 'Risque de symptômes (%)',
                data: top10.map(item => item.pourcentage),
                backgroundColor: couleurs,
                borderColor: couleurs.map(c => c === '#F44336' ? '#D32F2F' : c === '#FF9800' ? '#F57C00' : '#FFA000'),
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) { return value + '%'; }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Aliments les plus fréquemment associés aux symptômes',
                    font: { size: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = top10[context.dataIndex];
                            return item.pourcentage.toFixed(1) + '% de risque (' + item.occurrences + ' fois consommé)';
                        }
                    }
                }
            }
        }
    });
}

function afficherGraphiqueCategories(journees) {
    // Minimum 2 journées pour un camembert significatif
    if (journees.length < 2) {
        document.getElementById('messageGraphique3').textContent = 'Minimum 2 journées requises';
        document.getElementById('messageGraphique3').style.display = 'block';
        document.getElementById('graphiqueCategories').style.display = 'none';
        return;
    }

    // Compter les symptômes par catégorie d'aliments
    const categoriesStats = {
        feculents: { total: 0, symptomes: 0 },
        proteines: { total: 0, symptomes: 0 },
        legumes: { total: 0, symptomes: 0 },
        fruits: { total: 0, symptomes: 0 },
        laitiers: { total: 0, symptomes: 0 },
        lipides: { total: 0, symptomes: 0 },
        boissons: { total: 0, symptomes: 0 },
        autres: { total: 0, symptomes: 0 }
    };

    journees.forEach(function(journee) {
        const avecSymptomes = journee.symptomes !== 'aucun';
        
        const aliments = getAlimentsJournee(journee);
        Object.keys(aliments).forEach(function(categorie) {
            if (aliments[categorie]) {
                categoriesStats[categorie].total++;
                if (avecSymptomes) {
                    categoriesStats[categorie].symptomes++;
                }
            }
        });
    });

    // Calculer les pourcentages et préparer les données
    const labels = [];
    const data = [];
    const couleurs = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E8A838', '#C9CBCF'];
    const couleursFinales = [];

    let index = 0;
    Object.keys(categoriesStats).forEach(function(categorie) {
        const stats = categoriesStats[categorie];
        if (stats.total > 0) {
            const pourcentage = (stats.symptomes / stats.total) * 100;
            const nomCategorie = {
                feculents: '🌾 Féculents',
                proteines: '🥩 Protéines',
                legumes: '🥬 Légumes',
                fruits: '🍎 Fruits',
                laitiers: '🥛 Laitiers',
                lipides: '🥑 Lipides',
                boissons: '☕ Boissons',
                autres: '🍯 Autres'
            }[categorie];
            
            labels.push(nomCategorie);
            data.push(pourcentage);
            couleursFinales.push(couleurs[index % couleurs.length]);
            index++;
        }
    });

    if (labels.length === 0) {
        document.getElementById('messageGraphique3').textContent = 'Aucune donnée disponible';
        document.getElementById('messageGraphique3').style.display = 'block';
        document.getElementById('graphiqueCategories').style.display = 'none';
        return;
    }

    if (graphiqueCategories) {
        graphiqueCategories.destroy();
        graphiqueCategories = null;
    }

    const ctx = document.getElementById('graphiqueCategories').getContext('2d');
    graphiqueCategories = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: couleursFinales,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Pourcentage de symptômes par catégorie d\'aliments',
                    font: { size: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(1) + '% de symptômes';
                        }
                    }
                }
            }
        }
    });
}

function afficherGraphiqueSports(journees) {
    const stats = {
        natation: {total: 0, symptomes: 0},
        velo: {total: 0, symptomes: 0},
        course: {total: 0, symptomes: 0},
        aucun: {total: 0, symptomes: 0}
    };

    journees.forEach(function(journee) {
        const avecSymptomes = journee.symptomes != 'aucun';
        journee.sports.forEach(function(s) {
            if (stats[s]) {
                stats[s].total++;
                if (avecSymptomes) stats[s].symptomes++;
            }
        });
    });

    const nomsSports = { natation: 'Natation', velo: 'Vélo', course: 'Course à pied', aucun: 'Aucun sport'};
    const labels = [];
    const data = [];
    const couleurs = [];

    Object.keys(stats).forEach(function(sport) {
    if (stats[sport].total >= 1) {
        labels.push(nomsSports[sport]);
        const pct = (stats[sport].symptomes / stats[sport].total) * 100;
        data.push(parseFloat(pct.toFixed(1)));
        couleurs.push(pct > 66 ? '#F44336' : pct > 33 ? '#FF9800' : '#4CAF50');
        }
    });

    if (labels.length === 0) {
        document.getElementById('messageGraphique4').textContent = 'Aucune donnée disponible';
        document.getElementById('messageGraphique4').style.display = 'block';
        document.getElementById('graphiqueSports').style.display = 'none';
        return;
    }

    document.getElementById('messageGraphique4').style.display = 'none';
    document.getElementById('graphiqueSports').style.display = 'block';

    if (graphiqueSports) {
    graphiqueSports.destroy();
    graphiqueSports = null;
    }

    const ctx = document.getElementById('graphiqueSports').getContext('2d');
    graphiqueSports = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% de journées avec symptômes',
                data: data,
                backgroundColor: couleurs,
                borderColor: couleurs.map(c => c === '#F44336' ? '#D32F2F' : c === '#FF9800' ? '#F57C00' : '#388E3C'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: function(v) { return v + '%'; } }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Pourcentage de symptômes selon le sport pratiqué',
                    font: { size: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const sportsAffichees = Object.keys(stats).filter(s => stats[s].total >= 1);
                            const s = sportsAffichees[context.dataIndex];
                            return context.parsed.y + '% de symptômes (' + stats[s].total + ' journée(s) au total)';
                        }
                    }
                }
            }
        }
    });
}

// ANALYSE AUTOMATIQUE

function afficherAnalyseAutomatique() {
    const journees = getJournees();
    const conteneur = document.getElementById('contenuAnalyse');

    const divAnalyse = document.getElementById('analyseAutomatique');
    if (journees.length === 0) {
        divAnalyse.style.display = 'none';
        return;
    }
    divAnalyse.style.display = 'block';

    // Analyser les aliments
    const compteurAliments = {};
    journees.forEach(function(journee) {
        const avecSymptomes = journee.symptomes !== 'aucun';
        
        const aliments = getAlimentsJournee(journee);
        Object.keys(aliments).forEach(function(categorie) {
            const alimentsTexte = aliments[categorie];
        
            if (alimentsTexte) {
                const alimentsSepares = alimentsTexte.split(/[,+]/).map(a => a.trim().toLowerCase());
                
                alimentsSepares.forEach(function(aliment) {
                    if (aliment) {
                        if (!compteurAliments[aliment]) {
                            compteurAliments[aliment] = { total: 0, symptomes: 0 };
                        }
                        compteurAliments[aliment].total++;
                        if (avecSymptomes) {
                            compteurAliments[aliment].symptomes++;
                        }
                    }
                });
            }
        });
    });

    // Identifier aliments à risque et aliments sûrs
    const alimentsRisque = [];
    const alimentsSurs = [];

    Object.keys(compteurAliments).forEach(function(aliment) {
        const data = compteurAliments[aliment];
        if (data.total >= 2) {
            const pourcentage = (data.symptomes / data.total) * 100;
            
            if (pourcentage > 60) {
                alimentsRisque.push({
                    nom: aliment,
                    pourcentage: pourcentage,
                    occurrences: data.total
                });
            } else if (pourcentage === 0) {
                alimentsSurs.push({
                    nom: aliment,
                    occurrences: data.total
                });
            }
        }
    });

    // Trier
    alimentsRisque.sort((a, b) => b.pourcentage - a.pourcentage);
    alimentsSurs.sort((a, b) => b.occurrences - a.occurrences);

    // Générer le HTML
    let html = '';

    if (alimentsRisque.length > 0) {
        html += '<div class="analyseSection analyseSectionRisque">';
        html += '<h4>🚨 Aliments suspects (>60% de symptômes)</h4>';
        html += '<ul>';
        alimentsRisque.forEach(function(item) {
            html += '<li><strong>' + item.nom + '</strong> : ' + item.pourcentage.toFixed(0) + '% de symptômes (' + item.occurrences + ' fois)</li>';
        });
        html += '</ul>';
        html += '</div>';
    }

    if (alimentsSurs.length > 0) {
        html += '<div class="analyseSection analyseSectionSur">';
        html += '<h4>✅ Aliments bien tolérés (0% de symptômes)</h4>';
        html += '<ul>';
        alimentsSurs.slice(0, 10).forEach(function(item) {
            html += '<li><strong>' + item.nom + '</strong> (' + item.occurrences + ' fois sans problème)</li>';
        });
        html += '</ul>';
        html += '</div>';
    }

    if (html === '') {
        html = '<p class="messageAnalyseVide">Continuez à enregistrer vos journées pour obtenir une analyse détaillée.</p>';
    }

    conteneur.innerHTML = html;

    // Section : analyse combinaison sport X aliments
    let combinaisons = {};

    journees.forEach(j => {
        // On ne regarde que les jours avec symptômes et avec du sport
        if (j.symptomes !== 'aucun' && j.sports && j.sports.length > 0 && !j.sports.includes('aucun')) {
            const aliments = getAlimentsJournee(j);

            j.sports.forEach(sport => {
                // Boucle sur chaque catégorie d'aliment
                Object.keys(aliments).forEach(categorie => {
                    if (aliments[categorie] && aliments[categorie].trim() !== "") {
                        const nomsSports = { natation: 'Natation', velo: 'Vélo', course: 'Course à pied', aucun: 'Aucun sport' };
                        const nomsCategories = { feculents: 'Féculents', proteines: 'Protéines', legumes: 'Légumes', fruits: 'Fruits', laitiers: 'Laitiers', lipides: 'Lipides', boissons: 'Boissons', autres: 'Autres' };
                        const cle = `${nomsSports[sport]} + ${nomsCategories[categorie] || categorie}`;
                        if (!combinaisons[cle]) combinaisons[cle] = 0;
                        combinaisons[cle]++;
                    }
                });
            });
        }
    });

    // Trier pour trouver la combinaison la plus fréquente
    let comboGagnant = Object.entries(combinaisons).sort((a,b) => b[1] - a[1])[0];
    let messageCombo = "";

    if (comboGagnant && comboGagnant[1] >= 2) {
        messageCombo = `🔍 Combinaison la plus fréquente lors de vos périodes de symptômes : <strong>${comboGagnant[0]}</strong> (${comboGagnant[1]} fois)`;
    } else {
        messageCombo = `<span class="messageAnalyseVide">Pas encore assez de données pour identifier une combinaison sport + aliments à risque.</span>`;
    }

    const divCombo = document.getElementById('analyseCombinaisons');
    if (divCombo) {
        divCombo.innerHTML = messageCombo;
        divCombo.style.display = 'block';
    }
}

// FILTRES

function getFiltres() {
    return {
        dateDebut: document.getElementById('filtreDateDebut').value,
        dateFin: document.getElementById('filtreDateFin').value,
        repas: document.getElementById('filtreRepas').value,
        sport: document.getElementById('filtreSport').value,
        symptomes: document.getElementById('filtreSymptomes').value
    };
}

function filterJournees(journees, filtres) {
    return journees.filter(function(journee) {
        // Date début
        if (filtres.dateDebut && journee.date < filtres.dateDebut) return false;
        // Date fin
        if (filtres.dateFin && journee.date > filtres.dateFin) return false;
        // Repas
        if (filtres.repas && !(journee.repas && journee.repas[filtres.repas])) return false;
        // Sport
        if (filtres.sport && !journee.sports.includes(filtres.sport)) return false;
        // Symptômes
        if (filtres.symptomes && journee.symptomes !== filtres.symptomes) return false;
        return true;
    });
}

// Ecouteurs sur les filtres
['filtreDateDebut', 'filtreDateFin', 'filtreRepas', 'filtreSport', 'filtreSymptomes'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', afficherHistorique);
})

document.getElementById('boutonReinitialiserfiltres').addEventListener('click', function() {
    document.getElementById('filtreDateDebut').value = '';
    document.getElementById('filtreDateFin').value = '';
    document.getElementById('filtreRepas').value = '';
    document.getElementById('filtreSport').value = '';
    document.getElementById('filtreSymptomes').value = '';
    afficherHistorique();
});

// ONGLETS
document.querySelectorAll('.onglet').forEach(function(onglet) {
    onglet.addEventListener('click', function() {
        document.querySelectorAll('.onglet').forEach(o => o.classList.remove('actif'));
        this.classList.add('actif');

        const cible = this.dataset.cible;
        document.querySelectorAll('main section').forEach(function(s) {
            s.style.display = 'none';
        });
        document.getElementById(cible).style.display = 'block';

        // Quand on revient sur Statistiques, détruire et redessiner tous les graphiques
        if (cible === 'statistiques') {
            if (graphiqueSymptomes) { graphiqueSymptomes.destroy(); graphiqueSymptomes = null; }
            if (graphiqueTopAliments) { graphiqueTopAliments.destroy(); graphiqueTopAliments = null; }
            if (graphiqueCategories) { graphiqueCategories.destroy(); graphiqueCategories = null; }
            if (graphiqueSports) { graphiqueSports.destroy(); graphiqueSports = null; }
            setTimeout(function() {
                afficherGraphiques();
                afficherAnalyseAutomatique();
            }, 50);
        }
    });
});

// Masquer la section historique au démarrage
document.getElementById('historique').style.display = 'none';

// Afficher uniquement la première section au démarrage
document.querySelectorAll('main section').forEach((s, i) => {
    s.style.display = i === 0 ? 'block' : 'none';
});

// INITIALISATION

afficherHistorique();
afficherGraphiques();
afficherAnalyseAutomatique();

// BOUTON D'EXPORT CSV

const boutonExportCSV = document.querySelector(".boutonExportCSV");

if (boutonExportCSV) {
    boutonExportCSV.addEventListener('click', function () {
        const journees = getJournees();
        
        if (journees.length === 0) {
            alert("⚠️ Aucune donnée à exporter");
            return;
        }
        
        // Créer le contenu CSV
        let csv = 'Date,Féculents,Protéines,Légumes,Fruits,Laitiers,Lipides,Boissons,Autres,Sports,Symptômes\n';
        
        journees.forEach(function(journee) {
            const dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');
            const nomsSports = { natation: 'Natation', velo: 'Vélo', course: 'Course à pied', aucun: 'Aucun' };
const sports = journee.sports.map(s => nomsSports[s] || s).join(' + ');
            
            let symptomes = journee.symptomes;
            if (journee.symptomes === 'aucun') symptomes = 'Aucun';
            if (journee.symptomes === 'leger') symptomes = 'Léger';
            if (journee.symptomes === 'important') symptomes = 'Important';
            
            const a = getAlimentsJournee(journee);
            csv += dateFormatee + ',';
            csv += '"' + (a.feculents || '') + '",';
            csv += '"' + (a.proteines || '') + '",';
            csv += '"' + (a.legumes || '') + '",';
            csv += '"' + (a.fruits || '') + '",';
            csv += '"' + (a.laitiers || '') + '",';
            csv += '"' + (a.lipides || '') + '",';
            csv += '"' + (a.boissons || '') + '",';
            csv += '"' + (a.autres || '') + '",';
            csv += sports + ',';
            csv += symptomes + '\n';
        });
        
        // Créer le fichier et le télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = 'digesttrack-export.csv';
        lien.click();
        
        window.URL.revokeObjectURL(url);
        
        alert("✅ Export CSV réussi ! Le fichier a été téléchargé.");
    });
}

// BOUTON EXPORT PDF
const boutonExportPDF = document.querySelector('.boutonExportPDF');

if (boutonExportPDF) {
    boutonExportPDF.addEventListener('click', function() {
        const journees = getJournees();

        if (journees.length === 0) {
            alert('⚠️ Aucune donnée à exporter');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // En-tête
        doc.setFontSize(20);
        doc.setTextColor(74, 144, 226);
        doc.text('DigesTrack', 105, 20, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('Journal nutrition & digestion', 105, 28, { align: 'center' });

        doc.setFontSize(9);
        doc.text('Exporté le ' + new Date().toLocaleDateString('fr-FR'), 105, 35, { align: 'center' });

        // Ligne de séparation
        doc.setDrawColor(74, 144, 226);
        doc.line(15, 40, 195, 40);

        // Trier par date
        journees.sort((a, b) => new Date(b.date) - new Date(a.date));

        let y = 50;

        journees.forEach(function(journee, i) {
            // Saut de page si nécessaire
            if (y > 260) {
                doc.addPage();
                y = 20;
            }

            // Date
            doc.setFontSize(11);
            doc.setTextColor(74, 144, 226);
            const date = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');
            doc.text(date, 15, y);

            // Symptômes
            const symptomesTexte = { aucun: 'Aucun', leger: 'Léger', important: 'Important' };
            const couleurSymptome = { aucun: [76, 175, 80], leger: [255, 152, 0], important: [244, 67, 54] };
            const c = couleurSymptome[journee.symptomes] || [0, 0, 0];
            doc.setTextColor(c[0], c[1], c[2]);
            doc.text('Symptômes : ' + (symptomesTexte[journee.symptomes] || journee.symptomes), 120, y);
            y += 7;

            // Sports
            doc.setFontSize(9);
            doc.setTextColor(80);
            const nomsSports = { natation: 'Natation', velo: 'Vélo', course: 'Course à pied', aucun: 'Aucun' };
            const sportsTexte = journee.sports.map(s => nomsSports[s] || s).join(', ');
            doc.text('Sport(s) : ' + sportsTexte, 15, y);
            y += 6;

            // Aliments
            const aliments = getAlimentsJournee(journee);
            const nomsCategories = { feculents: 'Féculents', proteines: 'Protéines', legumes: 'Légumes', fruits: 'Fruits', laitiers: 'Laitiers', lipides: 'Lipides', boissons: 'Boissons', autres: 'Autres' };
            Object.keys(aliments).forEach(function(cat) {
                if (aliments[cat]) {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.text(nomsCategories[cat] + ' : ' + aliments[cat], 15, y);
                    y += 5;
                }
            });

            // Séparateur entre journées
            doc.setDrawColor(220);
            doc.line(15, y + 2, 195, y + 2);
            y += 8;
        });

        doc.save('digesttrack-export.pdf');
        alert('✅ Export PDF réussi !');
    });
} 

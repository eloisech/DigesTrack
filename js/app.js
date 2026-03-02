console.log("JavaScript chargé !");

// CONFIGURATION INITIALE (AU CHARGEMENT)

// Définir la date maximale à aujourd'hui
const champDate = document.getElementById('date');
const aujourdhui = new Date().toISOString().split('T')[0];
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

// Ouvrir le formulaire
boutonOuvrirFormulaire.addEventListener('click', function() {
    overlayFormulaire.classList.add('active');
});

// Fermer le formulaire (bouton X)
boutonFermerFormulaire.addEventListener('click', function() {
    overlayFormulaire.classList.remove('active');
});

// Fermer le formulaire (clic sur l'overlay)
overlayFormulaire.addEventListener('click', function(e) {
    if (e.target === overlayFormulaire) {
        overlayFormulaire.classList.remove('active');
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

    // Récupérer les aliments par catégorie
    const feculents = document.getElementById('feculents').value.trim();
    const proteines = document.getElementById('proteines').value.trim();
    const legumes = document.getElementById('legumes').value.trim();
    const fruits = document.getElementById('fruits').value.trim();
    const laitiers = document.getElementById('laitiers').value.trim();
    const lipides = document.getElementById('lipides').value.trim();
    const boissons = document.getElementById('boissons').value.trim();
    const autres = document.getElementById('autres').value.trim();

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

    // 3. Vérifier qu'au moins une catégorie d'aliments est remplie
    if (!feculents && !proteines && !legumes && !fruits && !laitiers && !lipides && !boissons && !autres) {
        alert("⚠️ Veuillez renseigner au moins une catégorie d'aliments");
        return;
    }
    
    // 4. Vérifier qu'au moins un sport est sélectionné
    if (sports.length === 0) {
        alert("⚠️ Veuillez sélectionner au moins un sport ou 'Aucun'");
        return;
    }

    // SAUVEGARDE

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

    // Sauvegarder dans LocalStorage
    saveJournee(journee);
    
    // Fermer l'overlay 
    overlayFormulaire.classList.remove('active');
    
    // Réinitialiser le formulaire
    formulaire.reset();
    // Remettre la date du jour après reset
    champDate.valueAsDate = new Date();
    
    // Afficher les mises à jour (après fermeture pour éviter les blocages)
    setTimeout(function() {
        afficherHistorique();
        afficherGraphiques();
        afficherAnalyseIntelligente();
    }, 100);

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

// AFFICHAGE HISTORIQUE

function afficherHistorique() {
    const journees = getJournees();
    const listeJournees = document.getElementById('listeJournees');

    if (journees.length === 0) {
        listeJournees.innerHTML = '<p class="messagePasDeDonnees">Aucune journée enregistrée pour le moment.</p>';
        return;
    }

    // Trier par date (plus récente en haut)
    journees.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Créer le tableau HTML
    let html = '<table class="tableHistorique">';
    html += '<thead><tr>';
    html += '<th>Date</th>';
    html += '<th>Aliments</th>';
    html += '<th>Sport(s)</th>';
    html += '<th>Symptômes</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    journees.forEach(function(journee, index) {
        let classeSymptome = 'symptome-' + journee.symptomes;
        let sportsTexte = journee.sports.join(', ');
        let dateFormatee = new Date(journee.date + 'T00:00:00').toLocaleDateString('fr-FR');

        let symptomeTexte = journee.symptomes;
        if (journee.symptomes === 'aucun') symptomeTexte = '🟢 Aucun';
        if (journee.symptomes === 'leger') symptomeTexte = '🟠 Léger';
        if (journee.symptomes === 'important') symptomeTexte = '🔴 Important';

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
        alimentsHTML += '</div>';

        html += '<tr>';
        html += '<td>' + dateFormatee + '</td>';
        html += '<td>' + alimentsHTML + '</td>';
        html += '<td>' + sportsTexte + '</td>';
        html += '<td class="' + classeSymptome + '">' + symptomeTexte + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    listeJournees.innerHTML = html;
}

// AFFICHAGE GRAPHIQUES

let graphiqueSymptomes = null;
let graphiqueTopAliments = null;
let graphiqueCategories = null;

function afficherGraphiques() {
    const journees = getJournees();
    
    if (journees.length === 0) {
        document.getElementById('conteneurGraphique').innerHTML = '<h3 class="titreGraphique">Répartition des symptômes</h3><p class="messagePasDeDonnees">Aucune donnée à afficher. Enregistrez votre première journée !</p>';
        document.getElementById('conteneurTopAliments').innerHTML = '<h3 class="titreGraphique">🚨 Top 10 des aliments à risque</h3><p class="messagePasDeDonnees">Aucune donnée disponible</p>';
        document.getElementById('conteneurCategories').innerHTML = '<h3 class="titreGraphique">📂 Symptômes par catégorie</h3><p class="messagePasDeDonnees">Aucune donnée disponible</p>';
        return;
    }

    // GRAPHIQUE 1 : Répartition des symptômes
    afficherGraphiqueSymptomes(journees);
    
    // GRAPHIQUE 2 : Top aliments à risque
    afficherGraphiqueTopAliments(journees);
    
    // GRAPHIQUE 3 : Symptômes par catégorie
    afficherGraphiqueCategories(journees);
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
        Object.keys(journee.aliments).forEach(function(categorie) {
            const alimentsTexte = journee.aliments[categorie];
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
        document.getElementById('conteneurTopAliments').innerHTML = '<h3 class="titreGraphique">🚨 Top 10 des aliments à risque</h3><p class="messagePasDeDonnees">Pas assez de données (minimum 2 occurrences par aliment)</p>';
        return;
    }

    // Créer le graphique
    if (graphiqueTopAliments) {
        graphiqueTopAliments.destroy();
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
        document.getElementById('conteneurCategories').innerHTML = '<h3 class="titreGraphique">📂 Symptômes par catégorie</h3><p class="messagePasDeDonnees">Minimum 2 journées requises</p>';
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
        
        Object.keys(journee.aliments).forEach(function(categorie) {
            if (journee.aliments[categorie]) {
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
    const couleurs = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];
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
        document.getElementById('conteneurCategories').innerHTML = '<h3 class="titreGraphique">📂 Symptômes par catégorie</h3><p class="messagePasDeDonnees">Aucune donnée disponible</p>';
        return;
    }

    if (graphiqueCategories) {
        graphiqueCategories.destroy();
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

// ANALYSE INTELLIGENTE

function afficherAnalyseIntelligente() {
    const journees = getJournees();
    const conteneur = document.getElementById('contenuAnalyse');

    if (journees.length === 0) {
        conteneur.innerHTML = '<p class="messageAnalyseVide">Pas encore assez de données pour générer une analyse.</p>';
        return;
    }

    // Analyser les aliments
    const compteurAliments = {};
    journees.forEach(function(journee) {
        const avecSymptomes = journee.symptomes !== 'aucun';
        
        Object.keys(journee.aliments).forEach(function(categorie) {
            const alimentsTexte = journee.aliments[categorie];
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
}

// INITIALISATION

afficherHistorique();
afficherGraphiques();
afficherAnalyseIntelligente();

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
            const sports = journee.sports.join(' + ');
            
            let symptomes = journee.symptomes;
            if (journee.symptomes === 'aucun') symptomes = 'Aucun';
            if (journee.symptomes === 'leger') symptomes = 'Léger';
            if (journee.symptomes === 'important') symptomes = 'Important';
            
            csv += dateFormatee + ',';
            csv += '"' + (journee.aliments.feculents || '') + '",';
            csv += '"' + (journee.aliments.proteines || '') + '",';
            csv += '"' + (journee.aliments.legumes || '') + '",';
            csv += '"' + (journee.aliments.fruits || '') + '",';
            csv += '"' + (journee.aliments.laitiers || '') + '",';
            csv += '"' + (journee.aliments.lipides || '') + '",';
            csv += '"' + (journee.aliments.boissons || '') + '",';
            csv += '"' + (journee.aliments.autres || '') + '",';
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
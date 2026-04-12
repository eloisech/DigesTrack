# DigesTrack

**Journal web de suivi nutritionnel et digestif pour sportifs d'endurance**

Dans le cadre du module Projet Informatique Individuel de l'ENSC, j'ai développé DigesTrack, une application web front-end permettant à un sportif souffrant de troubles digestifs de suivre son alimentation, son activité sportive et ses symptômes au quotidien. Elle identifie automatiquement des corrélations entre aliments, sport et inconfort digestif.

---

## Fonctionnalités

- **Saisie quotidienne** : enregistrement d'un repas (petit-déjeuner, déjeuner, goûter, dîner) avec 8 catégories d'aliments, sport(s) pratiqué(s) et niveau de symptômes
- **Historique filtrable** : tableau chronologique avec filtres par période, repas, sport et symptômes (modification et suppression de chaque entrée possibles)
- **Statistiques et graphiques** : 4 graphiques Chart.js mis à jour en temps réel (répartition des symptômes, top 10 aliments à risque, symptômes par catégorie, symptômes par sport)
- **Analyse automatique** : détection des aliments suspects (>60% de symptômes) et des aliments bien tolérés (0%), identification de la combinaison sport + aliment la plus fréquente lors des périodes de symptômes
- **Export des données** : téléchargement de l'historique en CSV ou en PDF (via jsPDF)

---

## Stack technique

| Technologie | Rôle |
|-------------|------|
| HTML / CSS / JavaScript | Structure, style et logique applicative |
| [Chart.js](https://www.chartjs.org/) | Graphiques dynamiques |
| [jsPDF](https://github.com/parallax/jsPDF) | Génération de l'export PDF |
| LocalStorage | Persistance des données dans le navigateur |

Application 100% front-end, sans serveur ni base de données distante.

---

## Installation et lancement

### Option 1 — Accès en ligne (recommandé)

L'application est déployée et accessible directement à l'adresse suivante :
**[https://digestrack.netlify.app](https://digestrack.netlify.app)**

Aucune installation requise.

### Option 2 — En local avec VS Code

1. Cloner le dépôt :
```bash
git clone https://github.com/eloisech/DigesTrack.git
```

2. Ouvrir le dossier `DigesTrack` dans VS Code

3. Installer l'extension **Live Server** (Ritwick Dey) si ce n'est pas déjà fait

4. Faire un clic droit sur `index.html` → **Open with Live Server**

L'application s'ouvre automatiquement dans le navigateur par défaut.


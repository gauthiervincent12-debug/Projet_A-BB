# Projet A-BB

Site web statique (HTML, CSS, JavaScript) contenant le mini-jeu de plateforme 2D **L'Ascension**.

## Lancer le projet

Ouvrir `index.html` dans un navigateur. Aucune installation n'est nécessaire.

## Structure

- `index.html` : structure de la page (HUD, écrans de sélection et de fin, règles)
- `style.css` : mise en forme
- `script.js` : logique du jeu (canvas, physique, niveau, dessin)
- `config.js` : adresse de la feuille Google Sheets qui reçoit les résultats
- `admin.html`, `admin.js` : backoffice des résultats
- `google-apps-script/` : script à installer dans Google Sheets pour recevoir les résultats

## Le jeu

1. Entrer son prénom et son nom.
2. Choisir la difficulté :
   - **Facile** : sol continu (pas de ravins), pontons fixes, 3 ennemis ;
   - **Moyen** : le niveau de base, 6 ennemis, 2 pontons mobiles ;
   - **Difficile** : 12 ennemis plus rapides, 6 pontons mobiles.
3. Choisir un personnage (homme ou femme). On commence avec 4 vies, affichées en cœurs en haut à gauche.
4. Avancer de gauche à droite à travers trois zones :
   - **Les Collines** : prairies vertes, quelques ravins et des hérissons ;
   - **Le Lac** : sauter de ponton en ponton (certains bougent), sans tomber à l'eau ;
   - **Les Montagnes** : gravir les rochers, passer le drapeau du sommet et rejoindre la poussette.
5. À la poussette : répondre à « Alors fille ou garçon ? ». La réponse est enregistrée et la photo `images/photo.jpg` s'affiche.

## Photo de fin

`images/photo.jpg` est une image temporaire : la remplacer par la vraie photo en gardant le même nom (`photo.jpg`).

## Scores

Le prénom, le nom, le score, le temps, la difficulté, le résultat et la réponse sont enregistrés dans le **navigateur** (`localStorage`). Ils ne sont pas affichés aux joueurs.

Si `URL_RESULTATS` est réglée dans `config.js`, chaque partie est aussi envoyée dans une **feuille Google Sheets**, ce qui permet de récupérer les résultats de tous les joueurs. Mise en place : voir [google-apps-script/README.md](google-apps-script/README.md).

## Backoffice

Ouvrir `admin.html` (aucun lien depuis le jeu) : résumé (parties, arrivées, nombre de « Fille » / « Garçon »), liste des parties, export CSV pour Excel et bouton pour tout effacer.

Sans feuille Google Sheets, le backoffice ne voit que les parties jouées **dans le même navigateur**. Avec la feuille, saisir le mot de passe (`CLE_ADMIN` du script Google) pour charger les parties de tous les joueurs.

Tétines : +10 · Animal écrasé : +50 (sauf les hérissons, qui piquent) · Bonus d'arrivée : +100 par vie restante.

Contrôles : ← → ou Q/D pour se déplacer, Espace / ↑ / Z pour sauter, P pour la pause. Sur mobile, des boutons s'affichent à l'écran.

## Modifier le niveau

Le niveau est décrit dans la fonction `creerNiveau()` de `script.js` : plateformes (`colonne`, `planche`), ennemis et pièces.

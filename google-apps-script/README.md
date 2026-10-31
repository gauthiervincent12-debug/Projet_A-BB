# Récupérer les résultats de tous les joueurs (Google Sheets)

Chaque partie jouée sur le site est envoyée dans une feuille Google Sheets : une ligne par partie, complétée par la réponse « fille / garçon » quand le joueur répond.

## Mise en place (une seule fois, environ 5 minutes)

1. **Créer la feuille** : sur [sheets.new](https://sheets.new), créer une feuille vide et la nommer par exemple « Projet A-BB — résultats ».
2. **Ouvrir l'éditeur de script** : menu **Extensions → Apps Script**.
3. **Coller le code** : remplacer tout le contenu de `Code.gs` par celui du fichier [Code.gs](Code.gs) de ce dossier.
4. **Choisir le mot de passe du backoffice** : à la ligne `const CLE_ADMIN = "CHANGER-CE-MOT-DE-PASSE";`, mettre son propre mot de passe. Il ne doit **pas** être recopié dans le dépôt GitHub (qui est public).
5. **Enregistrer** (icône disquette).
6. **Déployer** : bouton **Déployer → Nouveau déploiement**, puis :
   - type (roue dentée) : **Application Web** ;
   - « Exécuter en tant que » : **Moi** ;
   - « Qui a accès » : **Tout le monde** ;
   - cliquer **Déployer**, puis **Autoriser l'accès** avec son compte Google (écran « Google n'a pas validé cette application » : *Paramètres avancés → Accéder au projet*).
7. **Copier l'URL de l'application Web** (elle se termine par `/exec`).
8. **La coller dans [config.js](../config.js)** :
   ```js
   const URL_RESULTATS = "https://script.google.com/macros/s/…/exec";
   ```
   puis faire un commit et un push : le site GitHub Pages se met à jour en une ou deux minutes.

## Consulter les résultats

- **Dans la feuille Google Sheets** directement : toutes les parties arrivent en temps réel.
- **Dans `admin.html`** sur le site : saisir le mot de passe choisi à l'étape 4, puis « Charger tous les joueurs ». Le mot de passe est mémorisé dans ce navigateur. Les statistiques, le tableau et l'export CSV portent alors sur tous les joueurs.

Pour supprimer des parties (tests, doublons), effacer les lignes directement dans la feuille.

## Modifier le script plus tard

Après une modification de `Code.gs` (par exemple un nouveau mot de passe) : **Déployer → Gérer les déploiements → crayon → Version : Nouvelle version → Déployer**. L'URL reste la même.

## Bon à savoir

- L'adresse `/exec` est visible dans le code du site : quelqu'un de malin pourrait envoyer de fausses parties. Il ne peut en revanche pas lire les résultats sans le mot de passe.
- Si le joueur n'a pas de réseau en fin de partie, la partie reste enregistrée dans son navigateur mais n'arrive pas dans la feuille.

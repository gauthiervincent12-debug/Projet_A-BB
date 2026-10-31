// Projet A-BB : reçoit les parties du jeu et les range dans la feuille Google Sheets.
// À coller dans Extensions > Apps Script de la feuille (voir README.md à côté).

// Mot de passe demandé par admin.html pour lire les résultats : à changer ici
// uniquement, ne jamais le mettre dans le dépôt GitHub.
const CLE_ADMIN = "CHANGER-CE-MOT-DE-PASSE";

// Nouvelles colonnes toujours ajoutées à la fin, pour ne pas décaler les anciennes lignes
const COLONNES = [
  "id", "date", "prenom", "nom", "score", "temps", "difficulte", "gagne", "reponse",
  "personnage", "naissance", "poids_kg", "taille_cm",
];

function feuille() {
  const f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  // Crée ou complète la ligne d'en-tête
  const entete = f.getRange(1, 1, 1, COLONNES.length);
  if (entete.getDisplayValues()[0].join() !== COLONNES.join()) {
    entete.setNumberFormat("@").setValues([COLONNES]);
  }
  return f;
}

// Texte saisi par le joueur : longueur limitée, et pas de formule de tableur
function texteSur(valeur) {
  const texte = String(valeur ?? "").slice(0, 40);
  return /^[=+\-@]/.test(texte) ? "'" + texte : texte;
}

// Une partie terminée, puis la même partie complétée (réponse, pronostics) : même id, même ligne
function doPost(e) {
  const p = JSON.parse(e.postData.contents);
  const ligne = [
    String(p.id).slice(0, 20),
    texteSur(p.date),
    texteSur(p.prenom),
    texteSur(p.nom),
    Number(p.score) || 0,
    texteSur(p.temps), // minutes:secondes:millisecondes
    texteSur(p.difficulte),
    p.gagne === true,
    texteSur(p.reponse),
    texteSur(p.personnage),
    texteSur(p.naissance), // jj/mm/aaaa
    p.poids_kg == null ? "" : texteSur(p.poids_kg),
    p.taille_cm == null ? "" : texteSur(p.taille_cm),
  ];

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuille();
    const ids = f.getRange(1, 1, f.getLastRow(), 1).getDisplayValues().map((r) => r[0]);
    const index = ids.indexOf(ligne[0]);
    const numero = index > 0 ? index + 1 : f.getLastRow() + 1;
    // Tout en texte brut : la date, le temps et les identifiants restent tels quels
    f.getRange(numero, 1, 1, ligne.length).setNumberFormat("@").setValues([ligne]);
  } finally {
    verrou.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

// Lecture des parties par le backoffice, protégée par CLE_ADMIN
function doGet(e) {
  if (e.parameter.cle !== CLE_ADMIN) return json({ erreur: "Mot de passe incorrect" });
  const [entetes, ...lignes] = feuille().getDataRange().getDisplayValues();
  return json(lignes.map((l) => Object.fromEntries(entetes.map((c, i) => [c, l[i]]))));
}

function json(donnees) {
  return ContentService.createTextOutput(JSON.stringify(donnees)).setMimeType(ContentService.MimeType.JSON);
}

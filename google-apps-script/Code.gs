// Projet A-BB : reçoit les parties du jeu et les range dans la feuille Google Sheets.
// À coller dans Extensions > Apps Script de la feuille (voir README.md à côté).

// Mot de passe demandé par admin.html pour lire les résultats : à changer ici
// uniquement, ne jamais le mettre dans le dépôt GitHub.
const CLE_ADMIN = "CHANGER-CE-MOT-DE-PASSE";

const COLONNES = ["id", "date", "prenom", "nom", "score", "temps", "difficulte", "gagne", "reponse"];

function feuille() {
  const f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (f.getLastRow() === 0) {
    // Tout en texte brut : la date ISO et les identifiants restent tels quels
    f.getRange(1, 1, f.getMaxRows(), COLONNES.length).setNumberFormat("@");
    f.appendRow(COLONNES);
  }
  return f;
}

// Texte saisi par le joueur : longueur limitée, et pas de formule de tableur
function texteSur(valeur) {
  const texte = String(valeur ?? "").slice(0, 40);
  return /^[=+\-@]/.test(texte) ? "'" + texte : texte;
}

// Une partie terminée, puis la même partie complétée par la réponse : même id, même ligne
function doPost(e) {
  const p = JSON.parse(e.postData.contents);
  const ligne = [
    String(p.id).slice(0, 20),
    texteSur(p.date),
    texteSur(p.prenom),
    texteSur(p.nom),
    Number(p.score) || 0,
    Number(p.temps) || 0,
    texteSur(p.difficulte),
    p.gagne === true,
    texteSur(p.reponse),
  ];

  const verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    const f = feuille();
    const ids = f.getRange(1, 1, f.getLastRow(), 1).getDisplayValues().map((r) => r[0]);
    const index = ids.indexOf(ligne[0]);
    if (index > 0) f.getRange(index + 1, 1, 1, ligne.length).setValues([ligne]);
    else f.appendRow(ligne);
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

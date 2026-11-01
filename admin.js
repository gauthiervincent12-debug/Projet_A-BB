// Backoffice du Projet A-BB : consulte les parties enregistrées par le jeu,
// soit dans ce navigateur, soit dans la feuille Google Sheets (tous les joueurs)

const CLE_SCORES = "abb-scores";
const CLE_MOT_DE_PASSE = "abb-cle-admin";
const NOMS_DIFFICULTE = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };
const NOMS_REPONSE = { fille: "👧 Fille", "garçon": "👦 Garçon" };
const NOMS_PERSONNAGE = { homme: "Homme", femme: "Femme" };

const listeScores = document.getElementById("liste-scores");
const listeGagnants = document.getElementById("liste-gagnants");
const choixBonneReponse = document.getElementById("bonne-reponse");
const CLE_BONNE_REPONSE = "abb-bonne-reponse";
const NIVEAUX = ["facile", "moyen", "difficile"];
const PODIUM = 3;
const aucunScore = document.getElementById("aucun-score");
const champCle = document.getElementById("cle-admin");
const etatEnLigne = document.getElementById("etat-en-ligne");
const noteSource = document.getElementById("note-source");
const boutonEffacer = document.getElementById("bouton-effacer");

const enLigneDisponible = typeof URL_RESULTATS !== "undefined" && URL_RESULTATS !== "";
let scoresEnLigne = null; // null tant que les résultats en ligne ne sont pas chargés

function lireScoresLocaux() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SCORES)) ?? [];
  } catch {
    return [];
  }
}

const lireScores = () => scoresEnLigne ?? lireScoresLocaux();

// La feuille Google Sheets renvoie tout en texte : on remet les bons types
function depuisFeuille(p) {
  return {
    ...p,
    score: Number(p.score) || 0,
    gagne: String(p.gagne).toUpperCase() === "TRUE",
    reponse: p.reponse || null,
  };
}

async function chargerEnLigne() {
  const cle = champCle.value.trim();
  if (!cle) return;
  etatEnLigne.textContent = "Chargement…";
  try {
    const reponse = await fetch(`${URL_RESULTATS}?cle=${encodeURIComponent(cle)}`);
    const donnees = await reponse.json();
    if (donnees.erreur) {
      etatEnLigne.textContent = donnees.erreur;
      return;
    }
    scoresEnLigne = donnees.map(depuisFeuille);
    try {
      localStorage.setItem(CLE_MOT_DE_PASSE, cle);
    } catch {
      // Stockage indisponible : il faudra ressaisir le mot de passe
    }
    etatEnLigne.textContent = `${scoresEnLigne.length} partie(s) chargée(s) — ${new Date().toLocaleTimeString("fr-FR")}`;
    noteSource.textContent =
      "Données de tous les joueurs (feuille Google Sheets). Pour supprimer des parties, effacer les lignes dans la feuille.";
    boutonEffacer.hidden = true;
    afficher();
  } catch {
    etatEnLigne.textContent = "Impossible de joindre la feuille Google Sheets (adresse dans config.js ?).";
  }
}

// Temps au format minutes:secondes:millisecondes. La feuille l'envoie déjà formaté ;
// les parties locales (et les plus anciennes de la feuille) sont en millisecondes.
function formaterTemps(temps) {
  if (String(temps).includes(":")) return String(temps);
  const millis = Math.round(Number(temps) || 0);
  const secondes = Math.floor(millis / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}:${String(millis % 1000).padStart(3, "0")}`;
}


function formaterDate(iso) {
  const date = new Date(iso);
  return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

// Une ligne par partie, la plus récente en premier
function lignes() {
  return lireScores()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((p) => ({
      date: formaterDate(p.date),
      prenom: p.prenom,
      nom: p.nom,
      score: p.score,
      temps: formaterTemps(p.temps),
      difficulte: NOMS_DIFFICULTE[p.difficulte] ?? p.difficulte,
      personnage: NOMS_PERSONNAGE[p.personnage] ?? "—",
      resultat: p.gagne ? "Arrivé" : "Perdu",
      reponse: NOMS_REPONSE[p.reponse] ?? "—",
    }));
}

// ---------- Gagnants ----------

// Temps en millisecondes, que la partie vienne du navigateur (nombre) ou de la feuille (« m:ss:mmm »)
function millisecondes(temps) {
  if (!String(temps).includes(":")) return Number(temps) || 0;
  const [minutes, secondes, millis = 0] = String(temps).split(":").map(Number);
  return (minutes * 60 + secondes) * 1000 + millis;
}

// Un même joueur, même s'il a tapé son nom avec d'autres majuscules, accents ou espaces
const identifiant = (p) =>
  `${p.prenom} ${p.nom}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

function calculerGagnants(scores, bonneReponse) {
  const parties = scores
    .map((p) => ({ ...p, ms: millisecondes(p.temps) }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  // Pronostic : la toute première partie de chaque joueur, tous niveaux confondus.
  // Son orthographe sert aussi à afficher le nom du joueur partout.
  const premieres = new Map();
  for (const p of parties) {
    if (!premieres.has(identifiant(p))) premieres.set(identifiant(p), p);
  }
  for (const p of parties) {
    const premiere = premieres.get(identifiant(p));
    p.joueur = `${premiere.prenom.trim()} ${premiere.nom.trim()}`;
  }
  const pronostic = (niveau) =>
    [...premieres.values()]
      .filter((p) => p.difficulte === niveau && p.gagne && p.reponse === bonneReponse)
      .sort((a, b) => a.ms - b.ms)
      .slice(0, PODIUM);

  // Score : toutes les parties comptent ; le meilleur score de chaque joueur, le chrono départage les égalités
  const score = (niveau) => {
    const meilleures = new Map();
    for (const p of parties.filter((p) => p.difficulte === niveau)) {
      const actuelle = meilleures.get(identifiant(p));
      if (!actuelle || p.score > actuelle.score || (p.score === actuelle.score && p.ms < actuelle.ms)) {
        meilleures.set(identifiant(p), p);
      }
    }
    return [...meilleures.values()].sort((a, b) => b.score - a.score || a.ms - b.ms).slice(0, PODIUM);
  };

  return NIVEAUX.map((niveau) => ({
    niveau,
    pronostic: bonneReponse ? pronostic(niveau) : null,
    score: score(niveau),
  }));
}

function listePodium(parties, detail) {
  if (!parties.length) return document.createTextNode("Personne pour l'instant");
  const liste = document.createElement("ol");
  for (const p of parties) {
    const ligne = document.createElement("li");
    ligne.textContent = `${p.joueur} — ${detail(p)}`;
    liste.append(ligne);
  }
  return liste;
}

function afficherGagnants() {
  const bonneReponse = choixBonneReponse.value;
  listeGagnants.replaceChildren(
    ...calculerGagnants(lireScores(), bonneReponse).map(({ niveau, pronostic, score }) => {
      const tr = document.createElement("tr");
      const tdNiveau = document.createElement("td");
      tdNiveau.textContent = NOMS_DIFFICULTE[niveau];
      const tdPronostic = document.createElement("td");
      tdPronostic.append(
        pronostic ? listePodium(pronostic, (p) => formaterTemps(p.temps)) : document.createTextNode("Choisis d'abord la bonne réponse")
      );
      const tdScore = document.createElement("td");
      tdScore.append(listePodium(score, (p) => `${p.score} points en ${formaterTemps(p.temps)}`));
      tr.append(tdNiveau, tdPronostic, tdScore);
      return tr;
    })
  );
}

function afficher() {
  afficherGagnants();
  const scores = lireScores();
  document.getElementById("stat-parties").textContent = scores.length;
  document.getElementById("stat-arrivees").textContent = scores.filter((p) => p.gagne).length;
  document.getElementById("stat-fille").textContent = scores.filter((p) => p.reponse === "fille").length;
  document.getElementById("stat-garcon").textContent = scores.filter((p) => p.reponse === "garçon").length;

  const donnees = lignes();
  aucunScore.hidden = donnees.length > 0;
  listeScores.replaceChildren(
    ...donnees.map((ligne) => {
      const tr = document.createElement("tr");
      for (const [cle, valeur] of Object.entries(ligne)) {
        const td = document.createElement("td");
        td.textContent = valeur;
        if (["score", "temps"].includes(cle)) td.className = "nombre";
        tr.append(td);
      }
      return tr;
    })
  );
}

// Export CSV lisible directement par Excel (séparateur ; et BOM UTF-8)
function exporter() {
  const entetes = [
    "Date", "Prénom", "Nom", "Score", "Temps", "Difficulté", "Personnage", "Résultat",
    "Fille ou garçon ?",
  ];
  const echapper = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const contenu = [entetes, ...lignes().map((l) => Object.values(l))]
    .map((ligne) => ligne.map(echapper).join(";"))
    .join("\r\n");
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob(["﻿" + contenu], { type: "text/csv;charset=utf-8" }));
  lien.download = `projet-abb-scores-${new Date().toISOString().slice(0, 10)}.csv`;
  lien.click();
  URL.revokeObjectURL(lien.href);
}

document.getElementById("bouton-exporter").addEventListener("click", exporter);

boutonEffacer.addEventListener("click", () => {
  if (confirm("Effacer toutes les parties enregistrées dans ce navigateur ?")) {
    try {
      localStorage.removeItem(CLE_SCORES);
    } catch {
      // Stockage indisponible
    }
    afficher();
  }
});

// Se met à jour si une partie se termine dans un autre onglet
window.addEventListener("storage", (e) => {
  if (e.key === CLE_SCORES && !scoresEnLigne) afficher();
});

document.getElementById("form-cle").addEventListener("submit", (e) => {
  e.preventDefault();
  chargerEnLigne();
});

// La bonne réponse est mémorisée dans ce navigateur
try {
  choixBonneReponse.value = localStorage.getItem(CLE_BONNE_REPONSE) ?? "";
} catch {
  // Stockage indisponible
}
choixBonneReponse.addEventListener("change", () => {
  try {
    localStorage.setItem(CLE_BONNE_REPONSE, choixBonneReponse.value);
  } catch {
    // Stockage indisponible : le choix ne sera pas conservé
  }
  afficherGagnants();
});

afficher();

// Résultats en ligne : chargés automatiquement si le mot de passe est déjà connu
if (enLigneDisponible) {
  document.getElementById("section-en-ligne").hidden = false;
  try {
    champCle.value = localStorage.getItem(CLE_MOT_DE_PASSE) ?? "";
  } catch {
    // Stockage indisponible
  }
  chargerEnLigne();
}

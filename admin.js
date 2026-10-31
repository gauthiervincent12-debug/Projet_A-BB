// Backoffice du Projet A-BB : consulte les parties enregistrées par le jeu,
// soit dans ce navigateur, soit dans la feuille Google Sheets (tous les joueurs)

const CLE_SCORES = "abb-scores";
const CLE_MOT_DE_PASSE = "abb-cle-admin";
const NOMS_DIFFICULTE = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };
const NOMS_REPONSE = { fille: "👧 Fille", "garçon": "👦 Garçon" };
const NOMS_PERSONNAGE = { homme: "Homme", femme: "Femme" };

const listeScores = document.getElementById("liste-scores");
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

const enFrancais = (nombre) => (nombre === null || nombre === undefined || nombre === "" ? "—" : String(nombre).replace(".", ","));

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
      naissance: p.naissance || "—",
      poids: enFrancais(p.poids_kg),
      taille: enFrancais(p.taille_cm),
    }));
}

function afficher() {
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
        if (["score", "temps", "poids", "taille"].includes(cle)) td.className = "nombre";
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
    "Fille ou garçon ?", "Date de naissance", "Poids (kg)", "Taille (cm)",
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

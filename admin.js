// Backoffice du Projet A-BB : consulte les parties enregistrées par le jeu

const CLE_SCORES = "abb-scores";
const NOMS_DIFFICULTE = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };
const NOMS_REPONSE = { fille: "👧 Fille", "garçon": "👦 Garçon" };

const listeScores = document.getElementById("liste-scores");
const aucunScore = document.getElementById("aucun-score");

function lireScores() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SCORES)) ?? [];
  } catch {
    return [];
  }
}

function formaterTemps(ms) {
  const secondes = Math.floor(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}`;
}

function formaterDate(iso) {
  const date = new Date(iso);
  return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

// Une ligne par partie, la plus récente en premier
function lignes() {
  return lireScores()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({
      date: formaterDate(p.date),
      prenom: p.prenom,
      nom: p.nom,
      score: p.score,
      temps: formaterTemps(p.temps),
      difficulte: NOMS_DIFFICULTE[p.difficulte] ?? p.difficulte,
      resultat: p.gagne ? "Arrivé" : "Perdu",
      reponse: NOMS_REPONSE[p.reponse] ?? "—",
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
        if (cle === "score" || cle === "temps") td.className = "nombre";
        tr.append(td);
      }
      return tr;
    })
  );
}

// Export CSV lisible directement par Excel (séparateur ; et BOM UTF-8)
function exporter() {
  const entetes = ["Date", "Prénom", "Nom", "Score", "Temps", "Difficulté", "Résultat", "Fille ou garçon ?"];
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

document.getElementById("bouton-effacer").addEventListener("click", () => {
  if (confirm("Effacer toutes les parties enregistrées ?")) {
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
  if (e.key === CLE_SCORES) afficher();
});

afficher();

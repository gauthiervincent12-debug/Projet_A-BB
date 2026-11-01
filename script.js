// L'Ascension — mini-jeu de plateforme 2D du Projet A-BB

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const elScore = document.getElementById("score");
const elPieces = document.getElementById("pieces");
const elDifficulte = document.getElementById("difficulte");
const elZone = document.getElementById("zone");
const elRecord = document.getElementById("record");
const ecranSelection = document.getElementById("ecran-selection");
const ecranMessage = document.getElementById("ecran-message");
const messageTitre = document.getElementById("message-titre");
const messageTexte = document.getElementById("message-texte");
const boutonMessage = document.getElementById("bouton-message");
const elTemps = document.getElementById("temps");
const champPrenom = document.getElementById("prenom");
const champNom = document.getElementById("nom");
const erreurIdentite = document.getElementById("erreur-identite");
const ecranQuestion = document.getElementById("ecran-question");
const questionTexte = document.getElementById("question-texte");
const modalePhoto = document.getElementById("modale-photo");
const photoTitre = document.getElementById("photo-titre");
const boutonFermerPhoto = document.getElementById("bouton-fermer-photo");
const videoAnnonce = document.getElementById("video-annonce");
const videoAbsente = document.getElementById("video-absente");
const sectionJeu = document.getElementById("jeu");
const boutonPleinEcran = document.getElementById("bouton-plein-ecran");
const boutonMusique = document.getElementById("bouton-musique");
const boutonTir = document.getElementById("bouton-tir");

// Réglages
const GRAVITE = 0.6;
const FORCE_SAUT = -12.5;
const VITESSE = 4.2;
const FIN_MONDE = 6500;
const LIMITE_CHUTE = 700;
const SOL = 400;
const LAC = { debut: 2400, fin: 3850, surface: 425 };
const DRAPEAU = { x: 6100, y: -150 };
const POUSSETTE = { x: 6330, y: -150 };
const POINTS_REPRISE = [80, 2300, 3950];
const VIES_DEPART = 4;
// Biberon bonus, en hauteur à la fin des collines : on l'attrape en sautant depuis la dernière planche
const BIBERON = { x: 2230, y: 166 };
const TIR = { vitesse: 9, portee: 55, recharge: 18 };
const LIMITE_NEIGE = 100; // Les rochers plus hauts que ça sont enneigés

const DIFFICULTES = {
  facile: { nom: "Facile", vitesseEnnemis: 1 },
  moyen: { nom: "Moyen", vitesseEnnemis: 1.2 },
  difficile: { nom: "Difficile", vitesseEnnemis: 1.6 },
};

const ZONES = [
  { nom: "Les Collines", debut: 0 },
  { nom: "Le Lac", debut: LAC.debut },
  { nom: "Les Montagnes", debut: LAC.fin },
];

// Décor de fond (parallaxe)
const NUAGES = Array.from({ length: 12 }, (_, i) => ({
  x: 60 + i * 190,
  y: 50 + ((i * 37) % 90),
  taille: 0.8 + (i % 3) * 0.3,
}));

const COLLINES = Array.from({ length: 9 }, (_, i) => ({
  x: -100 + i * 170,
  rx: 150 + (i % 3) * 45,
  ry: 80 + (i % 2) * 45,
  couleur: i % 2 ? "#5fb760" : "#4aa64d",
}));

// Montagnes du lac d'Annecy : profils [décalage x, hauteur] à partir de ANNECY_X
const ANNECY_X = 850;
const MONT_VEYRIER = [
  [0, 0], [30, 60], [60, 108], [95, 140], [130, 158], [170, 166], [210, 172], [250, 164],
  [290, 170], [320, 152], [350, 124], [390, 96], [430, 62], [470, 30], [500, 0],
];
const TOURNETTE = [
  [150, 0], [230, 50], [300, 95], [360, 130], [410, 160], [450, 180], [480, 195], [500, 215], [520, 228],
  // Le « Fauteuil » : falaise, assise puis dossier rocheux du sommet
  [528, 250], [560, 253], [566, 262], [586, 263], [592, 250],
  [610, 240], [630, 225], [660, 212], [700, 195], [740, 178], [790, 150], [850, 110], [910, 60], [960, 0],
];

// Montagnes alpines génériques, après la Tournette
const MONTAGNES = Array.from({ length: 13 }, (_, i) => ({
  x: 1800 + i * 140,
  hauteur: 170 + ((i * 3) % 5) * 40,
  largeur: 280,
  couleur: i % 2 ? "#7b8794" : "#95a3b0",
}));

// ---------- Niveau ----------

function colonne(x, y, w, type) {
  return { x, y, w, h: LIMITE_CHUTE + 100 - y, type, dx: 0, dy: 0 };
}

function planche(x, y, w, mouvement) {
  const p = { x, y, w, h: 18, type: "bois", dx: 0, dy: 0 };
  if (mouvement) p.mouvement = { ...mouvement, t: 0, baseX: x, baseY: y };
  return p;
}

const TAILLES_ENNEMIS = {
  herisson: [34, 24],
  lievre: [32, 28],
  renard: [42, 26],
  castor: [40, 24],
  chamois: [36, 32],
  marmotte: [28, 24],
  bouquetin: [44, 40],
};

const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)];

// Collines : hérissons, lièvres et renards mélangés au hasard.
// Montagne : chamois et marmottes dans l'herbe, bouquetins dans la neige.
function typeSelonZone(x, sol) {
  if (x < LAC.fin) return auHasard(["herisson", "lievre", "renard"]);
  if (sol < LIMITE_NEIGE) return "bouquetin";
  return auHasard(["chamois", "marmotte"]);
}

function ennemi(x, sol, min, max, vitesse, type = typeSelonZone(x, sol)) {
  const [w, h] = TAILLES_ENNEMIS[type];
  return { type, x, y: sol - h, w, h, vx: -vitesse, min, max, mort: false, anim: 0 };
}

function creerNiveau(difficulte) {
  const facile = difficulte === "facile";
  const difficile = difficulte === "difficile";

  const plateformes = [
    planche(480, 300, 120),
    planche(700, 240, 110),
    planche(1300, 290, 130),
    planche(1980, 300, 110),
  ];

  // Les Collines : sol continu en facile, avec des ravins sinon
  if (facile) {
    plateformes.push(colonne(0, SOL, 2400, "herbe"));
  } else {
    plateformes.push(
      colonne(0, SOL, 1000, "herbe"),
      colonne(1100, SOL, 600, "herbe"),
      colonne(1800, SOL, 600, "herbe")
    );
  }

  // Le Lac
  if (facile) {
    // 4 grands pontons fixes : deux fois moins de trous d'eau qu'avec de petits pontons
    for (let i = 0; i < 4; i++) plateformes.push(planche(2470 + i * 330, i % 2 ? 360 : 380, 275));
  } else if (difficile) {
    plateformes.push(
      planche(2500, 380, 90),
      planche(2660, 350, 80, { axe: "y", amplitude: 40, vitesse: 0.03 }),
      planche(2840, 360, 100, { axe: "x", amplitude: 70, vitesse: 0.03 }),
      planche(3130, 330, 80, { axe: "y", amplitude: 50, vitesse: 0.035 }),
      planche(3290, 360, 90, { axe: "x", amplitude: 40, vitesse: 0.03 }),
      planche(3460, 340, 90, { axe: "y", amplitude: 60, vitesse: 0.03 }),
      planche(3650, 380, 100, { axe: "x", amplitude: 30, vitesse: 0.025 })
    );
  } else {
    plateformes.push(
      planche(2500, 380, 90),
      planche(2660, 350, 80),
      planche(2840, 360, 100, { axe: "x", amplitude: 70, vitesse: 0.02 }),
      planche(3130, 330, 80),
      planche(3290, 360, 90),
      planche(3460, 340, 90, { axe: "y", amplitude: 60, vitesse: 0.025 }),
      planche(3650, 380, 100)
    );
  }

  // Les Montagnes
  plateformes.push(colonne(3850, SOL, 450, "herbe"));
  const rochers = [
    [4300, 350, 160], [4460, 300, 140], [4600, 245, 130], [4800, 190, 150], [4950, 135, 120],
    [5140, 80, 150], [5290, 20, 130], [5420, -40, 140], [5640, -100, 140], [5780, -150, FIN_MONDE - 5780],
  ];
  rochers.forEach(([x, y, w], i) => {
    // En facile, chaque rocher rejoint le suivant : plus de ravins
    const largeur = facile && i < rochers.length - 1 ? rochers[i + 1][0] - x : w;
    plateformes.push(colonne(x, y, largeur, "roche"));
  });

  // Ennemis : [x, sol, limite gauche, limite droite, espèce (au hasard selon la zone si absente)]
  // Facile : toujours les mêmes, dans l'ordre : lièvre, renard, chamois, puis bouquetin tout en haut
  const positions = facile
    ? [
        [650, SOL, 300, 950, "lievre"],
        [1450, SOL, 1150, 1650, "renard"],
        [4050, SOL, 3900, 4290, "chamois"],
        [5900, -150, 5800, 6060, "bouquetin"],
      ]
    : [
        [650, SOL, 300, 950],
        [4050, SOL, 3900, 4290],
        [1450, SOL, 1150, 1650],
        [2150, SOL, 1850, 2350],
        [4830, 190, 4800, 4950],
        [5900, -150, 5800, 6060],
      ];
  if (difficile) {
    positions.push(
      [850, SOL, 300, 950],
      [1320, 290, 1300, 1430],
      [2000, SOL, 1850, 2350],
      [4320, 350, 4300, 4460],
      [5160, 80, 5140, 5290],
      [5800, -150, 5780, 6000]
    );
  }
  const vitesse = DIFFICULTES[difficulte].vitesseEnnemis;
  const ennemis = positions.map(([x, sol, min, max, espece]) => ennemi(x, sol, min, max, vitesse, espece));

  // Castor sur le dernier ponton du lac : il suit le ponton s'il bouge
  const ponton = plateformes
    .filter((p) => p.type === "bois" && p.x > LAC.debut && p.x < LAC.fin)
    .reduce((a, b) => (b.x > a.x ? b : a));
  const castor = ennemi(ponton.x + ponton.w - 45, ponton.y, ponton.x, ponton.x + ponton.w, vitesse * 0.7, "castor");
  castor.support = ponton;
  ennemis.push(castor);

  const lignesPieces = [
    [200, 360, 5], [505, 260, 3], [720, 200, 3], [1020, 330, 3], [1325, 250, 3],
    [1500, 360, 4], [1995, 260, 3], [2515, 340, 2], [2860, 310, 3], [3140, 290, 2],
    [3475, 250, 2], [3665, 340, 2], [4000, 360, 4], [4330, 310, 3], [4820, 150, 3],
    [5160, 40, 3], [5440, -80, 3], [5850, -190, 5],
  ];
  const pieces = [];
  for (const [x, y, n] of lignesPieces) {
    for (let i = 0; i < n; i++) pieces.push({ x: x + i * 34, y, prise: false });
  }

  return { plateformes, ennemis, pieces, biberon: { ...BIBERON, pris: false }, tirs: [] };
}

function creerJoueur() {
  return {
    x: POINTS_REPRISE[0], y: SOL - 44, w: 26, h: 44,
    vx: 0, vy: 0, auSol: false, support: null,
    direction: 1, anim: 0, horsSol: 0, invulnerable: 0,
    biberon: false, recharge: 0,
  };
}

// ---------- État ----------

let difficulte = "moyen";
let niveau = creerNiveau(difficulte);
let joueur = creerJoueur();
let perso = "homme";
let score = 0;
let nbPieces = 0;
let vies = VIES_DEPART;
let record = lireRecord();
let enCours = false;
let enPause = false;
let dernierTemps = 0;
let temps = 0;
let camX = 0;
let camY = 0;
let pointReprise = 0;
let zoneActuelle = -1;
let banniere = null;
let tamponSaut = 0;
let tempsJeu = 0;
let partieActuelle = null;
const touches = {};

// ---------- Enregistrement (dans le navigateur, consultable dans admin.html) ----------

function lireStockage(cle, defaut) {
  try {
    return JSON.parse(localStorage.getItem(cle)) ?? defaut;
  } catch {
    return defaut;
  }
}

function ecrireStockage(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // Stockage indisponible : rien n'est conservé
  }
}

const lireScores = () => lireStockage("abb-scores", []);
const sauverScores = (scores) => ecrireStockage("abb-scores", scores);

// Envoie aussi la partie à la feuille Google Sheets, si URL_RESULTATS est réglée dans config.js.
// "no-cors" + texte brut : pas de requête préalable, la réponse n'est pas lisible mais inutile.
// Le temps part au format minutes:secondes:millisecondes, ex. 1:05:342
function envoyerPartie(partie) {
  if (typeof URL_RESULTATS === "undefined" || !URL_RESULTATS) return;
  const corps = JSON.stringify({ ...partie, temps: formaterTempsPrecis(partie.temps) });
  fetch(URL_RESULTATS, { method: "POST", mode: "no-cors", body: corps }).catch(() => {
    // Pas de réseau : la partie reste au moins enregistrée dans le navigateur
  });
}

function formaterTemps(ms) {
  const secondes = Math.floor(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}`;
}

function formaterTempsPrecis(ms) {
  const millis = Math.round(ms);
  const secondes = Math.floor(millis / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}:${String(millis % 1000).padStart(3, "0")}`;
}

function lireRecord() {
  try {
    return Number(localStorage.getItem("abb-record-ascension")) || 0;
  } catch {
    return 0;
  }
}

function sauverRecord(valeur) {
  try {
    localStorage.setItem("abb-record-ascension", valeur);
  } catch {
    // Stockage indisponible : le record ne sera pas conservé
  }
}

function majHud() {
  elScore.textContent = score;
  elPieces.textContent = nbPieces;
  elDifficulte.textContent = DIFFICULTES[difficulte].nom;
  elRecord.textContent = record;
}

// ---------- Déroulement de la partie ----------

function demarrer(choix) {
  perso = choix;
  niveau = creerNiveau(difficulte);
  joueur = creerJoueur();
  score = 0;
  nbPieces = 0;
  vies = VIES_DEPART;
  pointReprise = 0;
  zoneActuelle = -1;
  camX = 0;
  camY = 0;
  temps = 0;
  tempsJeu = 0;
  tamponSaut = 0;
  majHud();
  ecranSelection.classList.add("cache");
  boutonTir.classList.add("cache");
  ecranMessage.classList.add("cache");
  document.activeElement.blur();
  enCours = true;
  enPause = false;
  dernierTemps = performance.now();
  requestAnimationFrame(boucle);
  Musique.jouer(difficulte);
}

function afficherMessage(titre, texte, bouton) {
  messageTitre.textContent = titre;
  messageTexte.textContent = texte;
  boutonMessage.textContent = bouton;
  ecranMessage.classList.remove("cache");
}

function perdreVie() {
  vies--;
  majHud();
  if (vies <= 0) return finDePartie(false);
  const j = joueur;
  j.x = POINTS_REPRISE[pointReprise];
  j.y = SOL - j.h;
  j.vx = 0;
  j.vy = 0;
  j.support = null;
  j.invulnerable = 90;
}

function finDePartie(gagne) {
  enCours = false;
  Musique.arreter();
  if (gagne) score += vies * 100;
  const nouveauRecord = score > record;
  if (nouveauRecord) {
    record = score;
    sauverRecord(record);
  }
  majHud();
  dessiner();

  partieActuelle = {
    id: Date.now(),
    prenom: champPrenom.value.trim(),
    nom: champNom.value.trim(),
    score,
    temps: Math.round(tempsJeu),
    difficulte,
    personnage: perso,
    gagne,
    reponse: null,
    date: new Date().toISOString(),
  };
  sauverScores([...lireScores(), partieActuelle]);
  envoyerPartie(partieActuelle);

  const resume =
    `Score : ${score} · Temps : ${formaterTemps(tempsJeu)} (${DIFFICULTES[difficulte].nom})` +
    (nouveauRecord ? " — nouveau record !" : "");
  if (gagne) {
    questionTexte.textContent = resume;
    ecranQuestion.classList.remove("cache");
  } else {
    afficherMessage("Partie terminée", resume, "Rejouer");
  }
}

function repondre(reponse) {
  partieActuelle.reponse = reponse;
  sauverScores(lireScores().map((p) => (p.id === partieActuelle.id ? partieActuelle : p)));
  envoyerPartie(partieActuelle);
  ecranQuestion.classList.add("cache");
  photoTitre.textContent = `${partieActuelle.prenom}, tu as répondu : ${reponse === "fille" ? "une fille 👧" : "un garçon 👦"} !`;
  modalePhoto.classList.remove("cache");
  boutonFermerPhoto.focus();
  lancerVideo();
}

// Vidéo de l'annonce, lue depuis le début (le clic sur la réponse autorise le son).
// Tant que videos/annonce.mp4 n'est pas déposée, un message d'attente la remplace.
function lancerVideo() {
  videoAnnonce.hidden = false;
  videoAbsente.classList.add("cache");
  videoAnnonce.currentTime = 0;
  videoAnnonce.play().catch((e) => {
    // Fichier absent ou illisible : message d'attente. Sinon (lecture automatique
    // refusée), les contrôles restent disponibles pour la lancer à la main.
    if (videoAnnonce.error || e.name === "NotSupportedError") afficherVideoAbsente();
  });
  // En parallèle (pour ne pas retarder la lecture), vérifie que le fichier existe
  fetch(videoAnnonce.src, { method: "HEAD", cache: "no-store" })
    .then((r) => {
      if (!r.ok) afficherVideoAbsente();
    })
    .catch(() => {});
}

function afficherVideoAbsente() {
  videoAnnonce.hidden = true;
  videoAbsente.classList.remove("cache");
}

videoAnnonce.addEventListener("error", afficherVideoAbsente);

function fermerPhoto() {
  videoAnnonce.pause();
  modalePhoto.classList.add("cache");
  ecranSelection.classList.remove("cache");
}

function basculerPause() {
  if (!enCours) return;
  enPause = !enPause;
  Musique.suspendre(enPause);
  if (enPause) {
    afficherMessage("Pause", "Appuie sur P pour reprendre", "Reprendre");
  } else {
    ecranMessage.classList.add("cache");
    dernierTemps = performance.now();
    requestAnimationFrame(boucle);
  }
}

function ajouterScore(points) {
  score += points;
  majHud();
}

// ---------- Logique ----------

const chevauche = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const gauche = () => touches.ArrowLeft || touches.KeyA;
const droite = () => touches.ArrowRight || touches.KeyD;
const sautMaintenu = () => touches.Space || touches.ArrowUp || touches.KeyW;
const tirMaintenu = () => touches.KeyX || touches.KeyF;

function mettreAJour(dt) {
  temps += dt;

  // Plateformes mobiles
  for (const p of niveau.plateformes) {
    if (!p.mouvement) continue;
    const m = p.mouvement;
    m.t += m.vitesse * dt;
    const ancienX = p.x;
    const ancienY = p.y;
    if (m.axe === "x") p.x = m.baseX + Math.sin(m.t) * m.amplitude;
    else p.y = m.baseY + Math.sin(m.t) * m.amplitude;
    p.dx = p.x - ancienX;
    p.dy = p.y - ancienY;
  }

  const j = joueur;

  // Le joueur est emporté par la plateforme sur laquelle il se tient
  if (j.support) {
    j.x += j.support.dx;
    j.y += j.support.dy;
  }

  const dir = (droite() ? 1 : 0) - (gauche() ? 1 : 0);
  j.vx = dir * VITESSE;
  if (dir !== 0) j.direction = dir;

  // Saut, avec une petite tolérance juste après avoir quitté le sol
  j.horsSol = j.auSol ? 0 : j.horsSol + dt;
  if (tamponSaut > 0 && j.horsSol < 6) {
    j.vy = FORCE_SAUT;
    j.horsSol = 99;
    tamponSaut = 0;
  }
  tamponSaut = Math.max(0, tamponSaut - dt);

  // Déplacement horizontal puis vertical, avec collisions
  j.x = Math.max(0, Math.min(FIN_MONDE - j.w, j.x + j.vx * dt));
  for (const p of niveau.plateformes) {
    if (chevauche(j, p)) j.x = j.x + j.w / 2 < p.x + p.w / 2 ? p.x - j.w : p.x + p.w;
  }

  // Relâcher le saut plus tôt donne un saut plus court
  const g = !sautMaintenu() && j.vy < 0 ? GRAVITE * 2 : GRAVITE;
  j.vy = Math.min(j.vy + g * dt, 14);
  j.y += j.vy * dt;
  j.auSol = false;
  j.support = null;
  for (const p of niveau.plateformes) {
    if (!chevauche(j, p)) continue;
    if (j.vy >= 0) {
      j.y = p.y - j.h;
      j.auSol = true;
      j.support = p;
    } else {
      j.y = p.y + p.h;
    }
    j.vy = 0;
  }

  j.anim = j.auSol && dir !== 0 ? j.anim + 0.3 * dt : 0;
  if (j.invulnerable > 0) j.invulnerable -= dt;

  // Chutes
  if (j.y > LIMITE_CHUTE) return perdreVie();
  if (j.x + j.w > LAC.debut && j.x < LAC.fin && j.y + j.h > LAC.surface + 6) return perdreVie();

  // Ennemis
  for (const e of niveau.ennemis) {
    if (e.mort) continue;
    if (e.support) {
      const { dx, dy } = e.support;
      e.x += dx;
      e.min += dx;
      e.max += dx;
      e.y += dy;
    }
    e.x += e.vx * dt;
    e.anim += 0.2 * dt;
    if (e.x < e.min) {
      e.x = e.min;
      e.vx = Math.abs(e.vx);
    }
    if (e.x + e.w > e.max) {
      e.x = e.max - e.w;
      e.vx = -Math.abs(e.vx);
    }
    if (j.invulnerable > 0 || !chevauche(j, e)) continue;
    const basAvant = j.y + j.h - j.vy * dt;
    // Les hérissons piquent : impossible de leur sauter dessus
    if (e.type !== "herisson" && j.vy > 0 && basAvant <= e.y + 10) {
      e.mort = true;
      j.vy = -9;
      ajouterScore(50);
    } else {
      return perdreVie();
    }
  }

  // Biberon : une fois attrapé, on tire du lait (en continu tant que la touche est appuyée)
  const b = niveau.biberon;
  if (!b.pris && j.x < b.x + 9 && j.x + j.w > b.x - 9 && j.y < b.y + 14 && j.y + j.h > b.y - 14) {
    b.pris = true;
    j.biberon = true;
    ajouterScore(20);
    banniere = { texte: "🍼 Biberon : tire du lait (X) !", duree: 200 };
    boutonTir.classList.remove("cache");
  }
  if (j.biberon) {
    j.recharge -= dt;
    if (tirMaintenu() && j.recharge <= 0) {
      niveau.tirs.push({
        x: j.x + j.w / 2 + j.direction * BOUT_BIBERON - (j.direction > 0 ? 0 : 10), y: j.y + 18, w: 10, h: 7,
        vx: TIR.vitesse * j.direction, vie: TIR.portee,
      });
      j.recharge = TIR.recharge;
    }
  }

  // Jets de lait : ils éliminent le premier animal touché (même les hérissons) et s'arrêtent sur les obstacles
  for (const t of niveau.tirs) {
    t.x += t.vx * dt;
    t.vie -= dt;
    if (niveau.plateformes.some((p) => chevauche(t, p))) t.vie = 0;
    const cible = niveau.ennemis.find((e) => !e.mort && chevauche(t, e));
    if (cible && t.vie > 0) {
      cible.mort = true;
      t.vie = 0;
      ajouterScore(50);
    }
  }
  niveau.tirs = niveau.tirs.filter((t) => t.vie > 0);

  // Pièces
  for (const p of niveau.pieces) {
    if (!p.prise && j.x < p.x + 9 && j.x + j.w > p.x - 9 && j.y < p.y + 9 && j.y + j.h > p.y - 9) {
      p.prise = true;
      nbPieces++;
      ajouterScore(10);
    }
  }

  // Points de reprise
  POINTS_REPRISE.forEach((x, i) => {
    if (i > pointReprise && j.x > x && j.auSol) pointReprise = i;
  });

  // Changement de zone
  const zone = ZONES.reduce((acc, z, i) => (j.x >= z.debut ? i : acc), 0);
  if (zone !== zoneActuelle) {
    zoneActuelle = zone;
    banniere = { texte: ZONES[zone].nom, duree: 150 };
    elZone.textContent = ZONES[zone].nom;
  }
  if (banniere) {
    banniere.duree -= dt;
    if (banniere.duree <= 0) banniere = null;
  }

  // Caméra
  camX = Math.max(0, Math.min(FIN_MONDE - W, j.x - W * 0.4));
  const cibleY = Math.min(0, j.y - H * 0.55);
  camY += (cibleY - camY) * Math.min(1, 0.1 * dt);

  if (j.x + j.w >= POUSSETTE.x) finDePartie(true);
}

// ---------- Dessin ----------

const visible = (x, w) => x + w > camX - 50 && x < camX + W + 50;

function dessinerNuage(x, y, t) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 20 * t, 0, Math.PI * 2);
  ctx.arc(x + 22 * t, y - 10 * t, 24 * t, 0, Math.PI * 2);
  ctx.arc(x + 46 * t, y, 20 * t, 0, Math.PI * 2);
  ctx.fill();
}

function dessinerFond() {
  const ciel = ctx.createLinearGradient(0, 0, 0, H);
  ciel.addColorStop(0, "#4fa8e8");
  ciel.addColorStop(1, "#cfeeff");
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#fff3b0";
  ctx.beginPath();
  ctx.arc(680, 80, 36, 0, Math.PI * 2);
  ctx.fill();

  for (const n of NUAGES) dessinerNuage(n.x - camX * 0.15, n.y - camY * 0.1, n.taille);

  // Montagnes lointaines : visibles depuis le lac, puis tout autour pendant l'ascension
  const baseM = 440 - camY * 0.3;
  for (const m of MONTAGNES) {
    const sx = m.x - camX * 0.3;
    if (sx + m.largeur / 2 < 0 || sx - m.largeur / 2 > W) continue;
    ctx.fillStyle = m.couleur;
    ctx.beginPath();
    ctx.moveTo(sx - m.largeur / 2, baseM);
    ctx.lineTo(sx, baseM - m.hauteur);
    ctx.lineTo(sx + m.largeur / 2, baseM);
    ctx.fill();
    if (m.hauteur > 220) {
      const f = 0.28;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(sx, baseM - m.hauteur);
      ctx.lineTo(sx - (m.largeur / 2) * f, baseM - m.hauteur * (1 - f));
      ctx.lineTo(sx + (m.largeur / 2) * f, baseM - m.hauteur * (1 - f));
      ctx.fill();
    }
  }

  const annecyX = ANNECY_X - camX * 0.3;
  if (annecyX + 960 > 0 && annecyX < W) dessinerMontagnesAnnecy(annecyX, baseM);

  // Le lac et sa rive au loin
  const baseC = 430 - camY * 0.5;
  const lx = 1150 - camX * 0.5;
  if (lx < W && lx + 1300 > 0) {
    ctx.fillStyle = "#3d8b40";
    ctx.fillRect(lx, baseC - 48, 1300, 8);
    ctx.fillStyle = "#7cc7ef";
    ctx.fillRect(lx, baseC - 40, 1300, Math.max(0, H - baseC + 40));
    // Annecy au bord du lac, visible en arrivant au lac (juste après la dernière colline),
    // un peu agrandie pour paraître plus proche
    const villeX = lx + 360;
    if (villeX < W && villeX + 520 > 0) {
      ctx.save();
      ctx.translate(villeX, baseC - 40);
      ctx.scale(1.3, 1.3);
      dessinerAnnecy(0, 0);
      ctx.restore();
    }
  }

  // Collines vertes
  for (const c of COLLINES) {
    const sx = c.x - camX * 0.5;
    if (sx + c.rx < 0 || sx - c.rx > W) continue;
    ctx.fillStyle = c.couleur;
    ctx.beginPath();
    ctx.ellipse(sx, baseC, c.rx, c.ry, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - c.rx, baseC, c.rx * 2, Math.max(0, H - baseC));
  }

  // Taureau charolais au sommet de la colline de gauche, au départ
  const colline = COLLINES[1];
  const taureauX = colline.x + 45 - camX * 0.5;
  if (taureauX + 40 > 0 && taureauX - 40 < W) {
    const ecart = 45 / colline.rx;
    dessinerTaureau(taureauX, baseC - colline.ry * Math.sqrt(1 - ecart * ecart) + 2);
  }

  // Maison du départ, sur une terrasse à flanc de colline
  const maisonX = 330 - camX * 0.5;
  if (maisonX + 510 > 0 && maisonX - 60 < W) {
    const solMaison = baseC - 90;
    ctx.fillStyle = "#56b158";
    ctx.beginPath();
    ctx.ellipse(maisonX + 230, baseC, 280, 150, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Terrasse et talus côté aval
    ctx.beginPath();
    ctx.moveTo(maisonX - 50, baseC - 45);
    ctx.quadraticCurveTo(maisonX - 20, solMaison, maisonX - 5, solMaison);
    ctx.lineTo(maisonX + 150, solMaison);
    ctx.lineTo(maisonX + 150, baseC);
    ctx.lineTo(maisonX - 50, baseC);
    ctx.fill();
    dessinerMaison(maisonX, solMaison);

    // Chat assis sur la colline, juste à droite de la maison
    const chatX = maisonX + 195;
    const ecart = (chatX - (maisonX + 230)) / 280;
    dessinerChat(chatX, baseC - 150 * Math.sqrt(1 - ecart * ecart) + 1);
  }
}

// Taureau de race charolaise : robe blanc crème, très musclé, petite tête frisée,
// cornes courtes et claires. (x, sol) = milieu de ses sabots, il regarde vers la droite.
function dessinerTaureau(x, sol) {
  const creme = "#f2e8d2";
  const ombre = "#ddd0b4";

  // Queue qui chasse les mouches, avec son toupet
  const fouet = Math.sin(temps * 0.06) * 4;
  ctx.strokeStyle = ombre;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 25, sol - 27);
  ctx.quadraticCurveTo(x - 31, sol - 18, x - 29 + fouet, sol - 9);
  ctx.stroke();
  ctx.fillStyle = "#c9b48c";
  ctx.beginPath();
  ctx.ellipse(x - 29 + fouet, sol - 7, 2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pattes du côté opposé, plus sombres, puis pattes du côté visible
  ctx.fillStyle = ombre;
  ctx.fillRect(x - 17, sol - 13, 6, 12);
  ctx.fillRect(x + 12, sol - 13, 6, 12);
  ctx.fillStyle = creme;
  ctx.fillRect(x - 22, sol - 14, 7, 13);
  ctx.fillRect(x + 6, sol - 14, 7, 13);
  ctx.fillStyle = "#8d7a63";
  for (const px of [x - 17, x + 12, x - 22, x + 6]) ctx.fillRect(px, sol - 2, px === x - 22 || px === x + 6 ? 7 : 6, 2);

  // Corps massif : arrière-train rond, ventre, bosse du garrot et fanon
  ctx.fillStyle = creme;
  ctx.beginPath();
  ctx.ellipse(x - 13, sol - 23, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 1, sol - 22, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 12, sol - 28, 11, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 16, sol - 22);
  ctx.quadraticCurveTo(x + 20, sol - 10, x + 25, sol - 19);
  ctx.fill();

  // Relief des muscles de la cuisse
  ctx.strokeStyle = ombre;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x - 13, sol - 22, 7, -0.3, 1.6);
  ctx.stroke();

  // Tête courte et large, un peu baissée, avec le mufle rosé
  ctx.fillStyle = creme;
  ctx.beginPath();
  ctx.ellipse(x + 26, sol - 24, 6.5, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9b9a6";
  ctx.beginPath();
  ctx.ellipse(x + 30, sol - 18.5, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9c6b5c";
  ctx.fillRect(x + 31, sol - 19.5, 1.5, 1.5);

  // Toupet frisé sur le front, oreille, œil
  ctx.fillStyle = ombre;
  for (const [fx, fy] of [[23, -31], [26, -32], [24.5, -29]]) {
    ctx.beginPath();
    ctx.arc(x + fx, sol + fy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = creme;
  ctx.beginPath();
  ctx.ellipse(x + 19, sol - 28, 4, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b2118";
  ctx.beginPath();
  ctx.arc(x + 27, sol - 26, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Cornes courtes, claires, recourbées vers l'avant
  ctx.strokeStyle = "#efe6cf";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x + 22, sol - 31);
  ctx.quadraticCurveTo(x + 19, sol - 37, x + 23, sol - 39);
  ctx.moveTo(x + 27, sol - 31);
  ctx.quadraticCurveTo(x + 29, sol - 37, x + 33, sol - 37);
  ctx.stroke();
  ctx.fillStyle = "#7d6a55";
  ctx.beginPath();
  ctx.arc(x + 23, sol - 39, 1, 0, Math.PI * 2);
  ctx.arc(x + 33, sol - 37, 1, 0, Math.PI * 2);
  ctx.fill();
}

// Vieille ville d'Annecy : maisons colorées [décalage x, largeur, hauteur, couleur]
const VIEILLE_VILLE = [
  [64, 15, 24, "#e8b65c"], [79, 13, 30, "#e59a7a"], [92, 16, 22, "#f2d27a"],
  [108, 12, 28, "#d9826b"], [134, 14, 26, "#f0c987"], [148, 16, 32, "#e8a07f"],
  [164, 13, 24, "#f4dc8e"], [177, 15, 29, "#cf7a5c"], [192, 14, 21, "#e9bf6e"],
];

// (x, rive) = début de la ville, niveau de l'eau
function dessinerAnnecy(x, rive) {
  const sol = rive - 3;
  const tuiles = "#a5452f";
  const ardoise = "#56616b";
  const fenetres = (fx, fy, largeur, hauteur) => {
    ctx.fillStyle = "rgba(70, 50, 40, 0.55)";
    for (let wy = fy + 4; wy < fy + hauteur - 3; wy += 6) {
      for (let wx = fx + 3; wx < fx + largeur - 2; wx += 4) ctx.fillRect(wx, wy, 1.5, 2);
    }
  };
  const toitPointu = (tx, ty, largeur, hauteur, couleur) => {
    ctx.fillStyle = couleur;
    ctx.beginPath();
    ctx.moveTo(tx - 1, ty);
    ctx.lineTo(tx + largeur / 2, ty - hauteur);
    ctx.lineTo(tx + largeur + 1, ty);
    ctx.fill();
  };

  // Colline du château
  ctx.fillStyle = "#4f9a4f";
  ctx.beginPath();
  ctx.ellipse(x + 30, sol, 40, 22, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Château d'Annecy : courtines, tour carrée et grosse tour de la Reine
  const solChateau = sol - 18;
  ctx.fillStyle = "#d8cfbf";
  ctx.fillRect(x + 12, solChateau - 16, 36, 16);
  ctx.fillRect(x + 4, solChateau - 28, 11, 28);
  ctx.fillRect(x + 44, solChateau - 32, 14, 32);
  ctx.fillStyle = "#c2b8a6";
  ctx.fillRect(x + 12, solChateau - 4, 36, 4);
  toitPointu(x + 12, solChateau - 16, 36, 7, ardoise);
  toitPointu(x + 4, solChateau - 28, 11, 10, ardoise);
  toitPointu(x + 44, solChateau - 32, 14, 9, ardoise);
  fenetres(x + 4, solChateau - 28, 11, 28);
  fenetres(x + 44, solChateau - 32, 14, 32);

  // Maisons de la vieille ville
  for (const [dx, largeur, hauteur, couleur] of VIEILLE_VILLE) {
    ctx.fillStyle = couleur;
    ctx.fillRect(x + dx, sol - hauteur, largeur, hauteur);
    fenetres(x + dx, sol - hauteur, largeur, hauteur);
    toitPointu(x + dx, sol - hauteur, largeur, 6, tuiles);
  }

  // Clocher de l'église Saint-Maurice
  ctx.fillStyle = "#cdbfa8";
  ctx.fillRect(x + 121, sol - 44, 11, 44);
  ctx.fillStyle = "rgba(70, 50, 40, 0.55)";
  ctx.fillRect(x + 125, sol - 38, 3, 5);
  toitPointu(x + 121, sol - 44, 11, 16, ardoise);

  // Quai et canal du Thiou devant les maisons
  ctx.fillStyle = "#b9b2a5";
  ctx.fillRect(x + 60, sol, 150, 3);

  // Palais de l'Île : prison en forme de proue de bateau, au milieu du canal
  const px = x + 140;
  ctx.fillStyle = "#c9c1b2";
  ctx.beginPath();
  ctx.moveTo(px - 14, rive + 4);
  ctx.lineTo(px - 2, rive - 22);
  ctx.lineTo(px + 26, rive - 22);
  ctx.lineTo(px + 30, rive + 4);
  ctx.fill();
  ctx.fillStyle = "#aea596";
  ctx.fillRect(px - 12, rive, 42, 4);
  ctx.fillStyle = ardoise;
  ctx.beginPath();
  ctx.moveTo(px - 4, rive - 21);
  ctx.lineTo(px + 6, rive - 30);
  ctx.lineTo(px + 28, rive - 30);
  ctx.lineTo(px + 28, rive - 21);
  ctx.fill();
  ctx.fillStyle = "#c9c1b2";
  ctx.fillRect(px + 18, rive - 38, 6, 10);
  toitPointu(px + 18, rive - 38, 6, 6, ardoise);
  fenetres(px + 2, rive - 20, 22, 18);

  // Pont des Amours au-dessus du canal du Vassé
  ctx.strokeStyle = "#f0ece4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 214, sol + 2);
  ctx.quadraticCurveTo(x + 226, sol - 8, x + 238, sol + 2);
  ctx.stroke();
  ctx.fillStyle = "#3c6e8f";
  ctx.fillRect(x + 216, sol - 4, 20, 1);

  // Grands arbres des jardins de l'Europe
  for (const [dx, r] of [[250, 9], [264, 11], [280, 8], [294, 10], [310, 9]]) {
    ctx.fillStyle = "#5b4636";
    ctx.fillRect(x + dx - 1, sol - r - 2, 2, r + 2);
    ctx.fillStyle = dx % 28 ? "#3f8f46" : "#4f9f4f";
    ctx.beginPath();
    ctx.arc(x + dx, sol - r - 6, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Reflets de la ville dans l'eau
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let dx = 10; dx < 320; dx += 22) {
    ctx.fillRect(x + dx + Math.sin(temps * 0.03 + dx) * 3, rive + 8 + (dx % 3) * 4, 12, 1.5);
  }

  // Petit voilier qui dérive au large
  const vx = x + 340 + Math.sin(temps * 0.004) * 30;
  const vy = rive + 14;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(vx, vy - 3);
  ctx.lineTo(vx, vy - 20);
  ctx.lineTo(vx + 11, vy - 3);
  ctx.fill();
  ctx.fillStyle = "#e57373";
  ctx.beginPath();
  ctx.moveTo(vx - 1, vy - 18);
  ctx.lineTo(vx - 1, vy - 4);
  ctx.lineTo(vx - 9, vy - 4);
  ctx.fill();
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.moveTo(vx - 10, vy - 3);
  ctx.lineTo(vx + 13, vy - 3);
  ctx.lineTo(vx + 9, vy + 1);
  ctx.lineTo(vx - 7, vy + 1);
  ctx.fill();
}

// Chat gris clair et blanc assis, vu de trois quarts ; (x, sol) = milieu de ses pattes
function dessinerChat(x, sol) {
  // Queue qui ondule doucement, avec le bout tordu en crochet
  const boutX = x + 11 + Math.sin(temps * 0.05) * 2;
  const boutY = sol - 11;
  ctx.strokeStyle = "#b8bcc2";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + 4, sol - 2);
  ctx.quadraticCurveTo(x + 12, sol - 3, boutX, boutY);
  ctx.quadraticCurveTo(boutX + 0.5, boutY - 3.5, boutX - 2.5, boutY - 3.5);
  ctx.stroke();

  // Corps gris clair, taches gris foncé sur le dos, poitrail blanc
  ctx.fillStyle = "#b8bcc2";
  ctx.beginPath();
  ctx.ellipse(x + 1, sol - 6, 6, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6e737a";
  for (const [tx, ty, rx, ry] of [[3.5, -9, 2.2, 1.6], [5, -4.5, 1.6, 1.4], [1.5, -11.5, 1.4, 1]]) {
    ctx.beginPath();
    ctx.ellipse(x + tx, sol + ty, rx, ry, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - 1.5, sol - 5, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pattes blanches
  ctx.fillRect(x - 4.5, sol - 3, 3.5, 3);
  ctx.fillRect(x, sol - 3, 3.5, 3);
  ctx.fillRect(x + 4, sol - 2, 3, 2);

  // Tête, oreilles et tache foncée sur le front
  ctx.fillStyle = "#b8bcc2";
  ctx.beginPath();
  ctx.arc(x - 1, sol - 15, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 5, sol - 17);
  ctx.lineTo(x - 4.5, sol - 22);
  ctx.lineTo(x - 2, sol - 19);
  ctx.moveTo(x, sol - 19);
  ctx.lineTo(x + 2.5, sol - 22);
  ctx.lineTo(x + 3, sol - 17);
  ctx.fill();
  ctx.fillStyle = "#6e737a";
  ctx.beginPath();
  ctx.ellipse(x + 1, sol - 18, 2.2, 1.5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Museau blanc
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - 1, sol - 12.5, 3, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8a0a8";
  ctx.fillRect(x - 1.5, sol - 14, 1.2, 1);

  // Yeux qui clignent de temps en temps
  ctx.fillStyle = "#2e3b2e";
  const yeux = temps % 240 < 8 ? 0.5 : 1.5;
  ctx.fillRect(x - 3.5, sol - 16, 1.2, yeux);
  ctx.fillRect(x + 0.5, sol - 16, 1.2, yeux);
}

function tracerProfil(profil, x, base, decalage = 0) {
  ctx.beginPath();
  ctx.moveTo(x + profil[0][0], base);
  for (const [dx, h] of profil) ctx.lineTo(x + dx, base - h + decalage);
  ctx.lineTo(x + profil[profil.length - 1][0], base);
  ctx.closePath();
}

// Hauteur d'un profil à un décalage donné (interpolation linéaire)
function hauteurProfil(profil, dx) {
  for (let i = 1; i < profil.length; i++) {
    const [x0, h0] = profil[i - 1];
    const [x1, h1] = profil[i];
    if (dx <= x1) return h0 + ((h1 - h0) * (dx - x0)) / (x1 - x0);
  }
  return 0;
}

// Tournette au fond, Mont Veyrier devant, au bord du lac
function dessinerMontagnesAnnecy(x, base) {
  // Tournette : alpages en bas, calcaire gris en haut
  const sommet = base - 263;
  const degrade = ctx.createLinearGradient(0, base, 0, sommet);
  degrade.addColorStop(0, "#5f8a5c");
  degrade.addColorStop(0.6, "#7d9874");
  degrade.addColorStop(0.72, "#a9aca9");
  degrade.addColorStop(1, "#c6c8c6");
  ctx.fillStyle = degrade;
  tracerProfil(TOURNETTE, x, base);
  ctx.fill();

  // Barres rocheuses sous le sommet
  ctx.fillStyle = "#9a9e9e";
  ctx.beginPath();
  for (let dx = 460; dx <= 700; dx += 10) ctx.lineTo(x + dx, base - hauteurProfil(TOURNETTE, dx) + 14);
  for (let dx = 700; dx >= 460; dx -= 10) {
    ctx.lineTo(x + dx, base - hauteurProfil(TOURNETTE, dx) + 24 + Math.sin(dx * 0.2) * 3);
  }
  ctx.fill();

  // Falaises du Fauteuil
  ctx.fillStyle = "#8e9396";
  ctx.beginPath();
  ctx.moveTo(x + 520, base - 228);
  ctx.lineTo(x + 528, base - 250);
  ctx.lineTo(x + 536, base - 250);
  ctx.lineTo(x + 530, base - 226);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 566, base - 262);
  ctx.lineTo(x + 570, base - 262);
  ctx.lineTo(x + 568, base - 253);
  ctx.lineTo(x + 560, base - 253);
  ctx.fill();

  // Névés
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  for (const [dx, h, l] of [[535, 248, 14], [598, 244, 10], [470, 186, 9], [640, 214, 12], [700, 190, 8]]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, base - h);
    ctx.lineTo(x + dx + l, base - h + 2);
    ctx.lineTo(x + dx + l * 0.4, base - h + 8);
    ctx.fill();
  }

  // Mont Veyrier : versant boisé
  ctx.fillStyle = "#3f6b45";
  tracerProfil(MONT_VEYRIER, x, base);
  ctx.fill();

  // Bande de falaises calcaires sous la crête, côté lac
  ctx.fillStyle = "#b9b4a8";
  ctx.beginPath();
  for (let dx = 45; dx <= 330; dx += 15) ctx.lineTo(x + dx, base - hauteurProfil(MONT_VEYRIER, dx) + 7);
  for (let dx = 330; dx >= 45; dx -= 15) {
    ctx.lineTo(x + dx, base - hauteurProfil(MONT_VEYRIER, dx) + 16 + Math.sin(dx * 0.15) * 4);
  }
  ctx.fill();

  // Forêt : petits sapins sombres sur le versant
  ctx.fillStyle = "#2f5636";
  for (let dx = 20; dx < 480; dx += 13) {
    const h = hauteurProfil(MONT_VEYRIER, dx);
    for (let ligne = 24; ligne < h - 5; ligne += 22) {
      const sx = x + dx + ((ligne * 7) % 9);
      const sy = base - h + ligne;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 6);
      ctx.lineTo(sx + 3, sy);
      ctx.lineTo(sx - 3, sy);
      ctx.fill();
    }
  }
}

// Maison à étage : rez-de-chaussée en crépi beige, étage en bardage bois, toit à deux pans,
// garage accolé à gauche avec toit plat. (x, sol) = coin bas-gauche du garage.
function dessinerMaison(x, sol) {
  const bardage = (bx, by, largeur, hauteur) => {
    ctx.fillStyle = "#a86f3c";
    ctx.fillRect(bx, by, largeur, hauteur);
    ctx.fillStyle = "#8a5a2e";
    for (let lx = bx + 4; lx < bx + largeur; lx += 5) ctx.fillRect(lx, by, 1, hauteur);
  };
  const crepi = (bx, by, largeur, hauteur) => {
    ctx.fillStyle = "#e8d9b5";
    ctx.fillRect(bx, by, largeur, hauteur);
    ctx.fillStyle = "#d6c49c";
    // Grain du crépi : points répartis de façon pseudo-aléatoire (toujours au même endroit)
    const hasard = (n) => {
      const s = Math.sin(n * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let i = 0; i < (largeur * hauteur) / 12; i++) {
      ctx.fillRect(bx + hasard(i) * largeur, by + hasard(i + 0.5) * hauteur, 1, 1);
    }
  };
  const fenetre = (fx, fy, largeur, hauteur) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(fx - 1, fy - 1, largeur + 2, hauteur + 2);
    ctx.fillStyle = "#bfe3f5";
    ctx.fillRect(fx, fy, largeur, hauteur);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(fx + largeur / 2 - 0.5, fy, 1, hauteur);
  };

  // Garage accolé à gauche, toit plat
  crepi(x, sol - 26, 50, 26);
  ctx.fillStyle = "#9e9e9e";
  ctx.fillRect(x + 7, sol - 20, 36, 20);
  ctx.fillStyle = "#8a8a8a";
  for (let ly = sol - 16; ly < sol; ly += 4) ctx.fillRect(x + 7, ly, 36, 1);
  ctx.fillStyle = "#424242";
  ctx.fillRect(x - 2, sol - 29, 54, 3);

  // Rez-de-chaussée entièrement en crépi
  const mx = x + 50;
  crepi(mx, sol - 30, 90, 30);
  fenetre(mx + 12, sol - 23, 16, 12);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(mx + 60, sol - 24, 13, 24);
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(mx + 70, sol - 13, 2, 2);

  // Étage en bardage bois
  bardage(mx, sol - 60, 90, 30);
  ctx.fillStyle = "#6d4524";
  ctx.fillRect(mx, sol - 31, 90, 2);
  fenetre(mx + 14, sol - 53, 14, 13);
  fenetre(mx + 60, sol - 53, 14, 13);

  // Toit triangulaire
  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.moveTo(mx - 7, sol - 59);
  ctx.lineTo(mx + 45, sol - 96);
  ctx.lineTo(mx + 97, sol - 59);
  ctx.fill();
  ctx.fillStyle = "#37474f";
  ctx.fillRect(mx - 7, sol - 61, 104, 3);
}

function dessinerPlateforme(p) {
  if (p.type === "herbe") {
    ctx.fillStyle = "#8d5a2b";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#7a4b22";
    for (let x = p.x + 20; x < p.x + p.w; x += 60) ctx.fillRect(x, p.y + 30 + (x % 40), 8, 6);
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(p.x, p.y, p.w, 12);
    ctx.fillStyle = "#3e9142";
    ctx.fillRect(p.x, p.y + 12, p.w, 3);
  } else if (p.type === "bois") {
    ctx.fillStyle = "#a0642d";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#7b4a1e";
    for (let x = p.x + 18; x < p.x + p.w; x += 20) ctx.fillRect(x, p.y, 2, p.h);
    ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
  } else {
    ctx.fillStyle = "#7d7f8a";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#6a6c76";
    for (let y = p.y + 30; y < p.y + p.h; y += 45) ctx.fillRect(p.x + 10 + Math.abs(y % 40), y, 30, 5);
    // De la neige sur les hauteurs, de la mousse plus bas
    ctx.fillStyle = p.y < LIMITE_NEIGE ? "#f5f7fa" : "#8a9a5b";
    ctx.fillRect(p.x, p.y, p.w, 10);
  }
}

function dessinerBalise(x, active) {
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(x, SOL - 50, 4, 50);
  ctx.fillStyle = active ? "#43a047" : "#bdbdbd";
  ctx.beginPath();
  ctx.moveTo(x + 4, SOL - 50);
  ctx.lineTo(x + 26, SOL - 43);
  ctx.lineTo(x + 4, SOL - 36);
  ctx.fill();
}

// Tétine pour bébé : tétine, collerette et anneau, qui flotte doucement
// Biberon : tétine, bague bleue et lait ; (x, y) = son centre. Dans le niveau, il flotte et brille.
function dessinerBiberon(x, y, dansLeNiveau) {
  ctx.save();
  ctx.translate(x, y + (dansLeNiveau ? Math.sin(temps * 0.07) * 4 : 0));
  if (dansLeNiveau) {
    const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    halo.addColorStop(0, "rgba(255, 245, 200, 0.75)");
    halo.addColorStop(1, "rgba(255, 245, 200, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tétine et bague
  ctx.fillStyle = "#f3c892";
  ctx.beginPath();
  ctx.ellipse(0, -11, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(-6, -8, 12, 4);

  // Flacon transparent rempli de lait, avec ses graduations
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillRect(-5.5, -4, 11, 17);
  ctx.fillStyle = "#fffdf5";
  ctx.fillRect(-5.5, 1, 11, 12);
  ctx.fillStyle = "#90a4ae";
  for (const gy of [1, 5, 9]) ctx.fillRect(2, gy, 3, 1);
  ctx.restore();
}

// Jet de lait : goutte blanche étirée dans le sens du tir
function dessinerTir(t) {
  ctx.fillStyle = "#fffdf5";
  ctx.beginPath();
  ctx.ellipse(t.x + t.w / 2, t.y + t.h / 2, t.w / 2 + 2, t.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 253, 245, 0.5)";
  ctx.beginPath();
  ctx.ellipse(t.x + t.w / 2 - Math.sign(t.vx) * 9, t.y + t.h / 2, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function dessinerTetine(p) {
  const x = p.x;
  const y = p.y + Math.sin(temps * 0.08 + p.x) * 2;
  const rose = Math.floor(p.x / 34) % 2 === 0;
  const couleur = rose ? "#f48fb1" : "#81d4fa";
  const fonce = rose ? "#d81b60" : "#0288d1";

  ctx.fillStyle = "#f3e0c0";
  ctx.beginPath();
  ctx.ellipse(x, y - 6, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = fonce;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y + 8, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y + 0.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function dessinerBouquetin(e) {
  const pas = Math.sin(e.anim) * 3;

  // Pattes robustes
  ctx.fillStyle = "#4e3b2a";
  ctx.fillRect(-15 + pas, -15, 4, 15);
  ctx.fillRect(-9 - pas, -15, 4, 15);
  ctx.fillRect(7 + pas, -15, 4, 15);
  ctx.fillRect(13 - pas, -15, 4, 15);

  // Corps trapu, ventre clair et queue
  ctx.fillStyle = "#8d6e4f";
  ctx.beginPath();
  ctx.ellipse(0, -22, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-22, -28, 4, 6);
  ctx.fillStyle = "#c8ad8a";
  ctx.beginPath();
  ctx.ellipse(0, -16, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cou épais et grosse tête au museau allongé
  ctx.fillStyle = "#8d6e4f";
  ctx.beginPath();
  ctx.moveTo(8, -30);
  ctx.lineTo(16, -42);
  ctx.lineTo(24, -36);
  ctx.lineTo(17, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(20, -38, 8.5, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(27, -34, 5, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6f5139";
  ctx.beginPath();
  ctx.ellipse(30, -33, 2, 1.5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Oreille, barbiche et œil
  ctx.fillStyle = "#7a5d42";
  ctx.beginPath();
  ctx.ellipse(13, -41, 4, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4e3b2a";
  ctx.beginPath();
  ctx.moveTo(24, -32);
  ctx.lineTo(23, -22);
  ctx.lineTo(28, -31);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(22, -40, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Grandes cornes recourbées vers l'arrière, épaisses à la base
  ctx.strokeStyle = "#5a4632";
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(18, -44);
  ctx.quadraticCurveTo(13, -60, 1, -52);
  ctx.stroke();
  ctx.strokeStyle = "#7a6248";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.17;
    const cx = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 13 + t * t * 1;
    const cy = (1 - t) * (1 - t) * -44 + 2 * (1 - t) * t * -60 + t * t * -52;
    ctx.beginPath();
    ctx.moveTo(cx - 2.5, cy - 1);
    ctx.lineTo(cx + 2.5, cy + 1);
    ctx.stroke();
  }
}

function dessinerCastor(e) {
  const pas = Math.sin(e.anim) * 2.5;

  // Queue plate écailleuse, qui bat doucement
  ctx.save();
  ctx.translate(-14, -7);
  ctx.rotate(-0.25 + Math.sin(e.anim * 0.5) * 0.12);
  ctx.fillStyle = "#3e2a1c";
  ctx.beginPath();
  ctx.ellipse(-9, 0, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const cx of [-15, -10, -5]) {
    ctx.moveTo(cx, -3);
    ctx.lineTo(cx, 3);
  }
  ctx.stroke();
  ctx.restore();

  // Pattes
  ctx.fillStyle = "#4a3222";
  ctx.fillRect(-10 + pas, -5, 6, 5);
  ctx.fillRect(5 - pas, -5, 6, 5);

  // Corps dodu et ventre clair
  ctx.fillStyle = "#7b5034";
  ctx.beginPath();
  ctx.ellipse(-1, -11, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a47552";
  ctx.beginPath();
  ctx.ellipse(1, -6, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tête, oreille et museau
  ctx.fillStyle = "#7b5034";
  ctx.beginPath();
  ctx.arc(13, -15, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9, -22, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a47552";
  ctx.beginPath();
  ctx.ellipse(19, -13, 4, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grandes dents orange, nez et œil
  ctx.fillStyle = "#ffb74d";
  ctx.fillRect(18, -10, 2, 4);
  ctx.fillRect(20, -10, 2, 4);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(22, -15, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(14, -19, 2, 2);
}

function dessinerLievre(e) {
  const saut = Math.abs(Math.sin(e.anim * 0.8)) * 4;
  ctx.translate(0, -saut);

  // Grandes pattes arrière et pattes avant
  ctx.fillStyle = "#8a6d4e";
  ctx.beginPath();
  ctx.ellipse(-8, -4, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(6, -7, 3, 7);

  // Corps et petite queue blanche
  ctx.fillStyle = "#a88560";
  ctx.beginPath();
  ctx.ellipse(-2, -11, 13, 8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  ctx.arc(-15, -12, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Tête et longues oreilles à bout noir
  ctx.fillStyle = "#a88560";
  ctx.beginPath();
  ctx.ellipse(10, -17, 6, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  for (const [ox, angle] of [[6, -0.35], [9, -0.15]]) {
    ctx.save();
    ctx.translate(ox, -21);
    ctx.rotate(angle);
    ctx.fillStyle = "#a88560";
    ctx.beginPath();
    ctx.ellipse(0, -6, 2.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2118";
    ctx.beginPath();
    ctx.ellipse(0, -11, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Œil et nez
  ctx.fillStyle = "#111";
  ctx.fillRect(11, -19, 2, 2);
  ctx.fillStyle = "#d48a8a";
  ctx.fillRect(15, -16, 2, 2);
}

function dessinerRenard(e) {
  const pas = Math.sin(e.anim) * 3;

  // Grande queue touffue à bout blanc
  ctx.fillStyle = "#e0702a";
  ctx.beginPath();
  ctx.ellipse(-21, -12, 10, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fafafa";
  ctx.beginPath();
  ctx.ellipse(-28, -8, 4, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Pattes noires
  ctx.fillStyle = "#2b1d14";
  ctx.fillRect(-9 + pas, -8, 3, 8);
  ctx.fillRect(7 - pas, -8, 3, 8);

  // Corps et poitrail blanc
  ctx.fillStyle = "#e0702a";
  ctx.beginPath();
  ctx.ellipse(0, -13, 14, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fafafa";
  ctx.beginPath();
  ctx.ellipse(10, -11, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tête triangulaire, oreilles pointues et museau blanc
  ctx.fillStyle = "#e0702a";
  ctx.beginPath();
  ctx.moveTo(10, -24);
  ctx.lineTo(13, -29);
  ctx.lineTo(15, -23);
  ctx.lineTo(18, -29);
  ctx.lineTo(19, -21);
  ctx.lineTo(25, -15);
  ctx.lineTo(10, -14);
  ctx.fill();
  ctx.fillStyle = "#fafafa";
  ctx.beginPath();
  ctx.moveTo(14, -16);
  ctx.lineTo(25, -15);
  ctx.lineTo(16, -13);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(24, -17, 2, 2);
  ctx.fillRect(16, -21, 2, 2);
}

function dessinerChamois(e) {
  const pas = Math.sin(e.anim) * 3;

  // Pattes fines
  ctx.fillStyle = "#3a2a1e";
  ctx.fillRect(-12 + pas, -14, 3, 14);
  ctx.fillRect(-6 - pas, -14, 3, 14);
  ctx.fillRect(6 + pas, -14, 3, 14);
  ctx.fillRect(11 - pas, -14, 3, 14);

  // Corps fauve, raie dorsale sombre
  ctx.fillStyle = "#9b6b3f";
  ctx.beginPath();
  ctx.ellipse(0, -18, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3b22";
  ctx.fillRect(-12, -25, 22, 2);
  ctx.fillRect(-18, -21, 3, 4);

  // Cou et tête claire avec bandeau sombre
  ctx.fillStyle = "#9b6b3f";
  ctx.beginPath();
  ctx.moveTo(9, -22);
  ctx.lineTo(14, -30);
  ctx.lineTo(18, -27);
  ctx.lineTo(14, -17);
  ctx.fill();
  ctx.fillStyle = "#efe3cf";
  ctx.beginPath();
  ctx.ellipse(17, -28, 5.5, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b1d14";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, -31);
  ctx.lineTo(21, -26);
  ctx.stroke();

  // Petites cornes noires en crochet
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (const ox of [14, 17]) {
    ctx.beginPath();
    ctx.moveTo(ox, -31);
    ctx.lineTo(ox, -38);
    ctx.quadraticCurveTo(ox - 1, -41, ox - 4, -38);
    ctx.stroke();
  }
}

function dessinerMarmotte(e) {
  const pas = Math.sin(e.anim) * 2;

  // Queue courte et sombre
  ctx.fillStyle = "#4a3324";
  ctx.beginPath();
  ctx.ellipse(-14, -6, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Pattes
  ctx.fillStyle = "#3a2618";
  ctx.fillRect(-7 + pas, -4, 5, 4);
  ctx.fillRect(4 - pas, -4, 5, 4);

  // Corps rond et ventre plus clair
  ctx.fillStyle = "#8c6a48";
  ctx.beginPath();
  ctx.ellipse(-1, -11, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c2a27a";
  ctx.beginPath();
  ctx.ellipse(3, -8, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tête, petite oreille et museau clair
  ctx.fillStyle = "#6f5238";
  ctx.beginPath();
  ctx.arc(9, -18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -23, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d8c3a3";
  ctx.beginPath();
  ctx.ellipse(13, -16, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(10, -21, 2, 2);
  ctx.fillRect(15, -17, 2, 2);
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(13, -14, 2, 2);
}

const DESSINS_ENNEMIS = {
  herisson: dessinerHerisson,
  lievre: dessinerLievre,
  renard: dessinerRenard,
  castor: dessinerCastor,
  chamois: dessinerChamois,
  marmotte: dessinerMarmotte,
  bouquetin: dessinerBouquetin,
};

function dessinerEnnemi(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h);
  ctx.scale(e.vx > 0 ? 1 : -1, 1);
  DESSINS_ENNEMIS[e.type](e);
  ctx.restore();
}

function dessinerHerisson(e) {
  const pas = Math.sin(e.anim) * 3;
  ctx.fillStyle = "#3b2a1a";
  ctx.fillRect(-10 + pas, -4, 5, 4);
  ctx.fillRect(5 - pas, -4, 5, 4);

  // Piquants
  ctx.fillStyle = "#5b3a1e";
  ctx.beginPath();
  ctx.ellipse(-2, -11, 16, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 6 - 5, -18);
    ctx.lineTo(i * 6 + 1, -18);
    ctx.lineTo(i * 6 - 6, -26);
    ctx.fill();
  }

  // Museau
  ctx.fillStyle = "#e6c79c";
  ctx.beginPath();
  ctx.ellipse(11, -8, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(17, -10, 3, 3);
  ctx.fillRect(10, -12, 2, 2);
}

function dessinerDrapeau() {
  const { x, y } = DRAPEAU;
  if (!visible(x, 50)) return;
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(x, y - 120, 5, 120);
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(x + 2.5, y - 122, 5, 0, Math.PI * 2);
  ctx.fill();
  const vent = Math.sin(temps * 0.1) * 4;
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 116);
  ctx.quadraticCurveTo(x + 25, y - 116 + vent, x + 45, y - 104);
  ctx.lineTo(x + 5, y - 92);
  ctx.fill();
}

// Poussette à capote fermée : on ne voit pas le bébé
function dessinerPoussette() {
  const { x, y } = POUSSETTE;
  if (!visible(x - 10, 100)) return;

  // Châssis et poignée
  ctx.strokeStyle = "#546e7a";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 10);
  ctx.lineTo(x + 30, y - 30);
  ctx.lineTo(x + 50, y - 10);
  ctx.moveTo(x + 56, y - 38);
  ctx.lineTo(x + 70, y - 66);
  ctx.lineTo(x + 80, y - 66);
  ctx.stroke();

  // Roues
  for (const rx of [x + 10, x + 50]) {
    ctx.fillStyle = "#37474f";
    ctx.beginPath();
    ctx.arc(rx, y - 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b0bec5";
    ctx.beginPath();
    ctx.arc(rx, y - 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nacelle
  ctx.fillStyle = "#ffe082";
  ctx.beginPath();
  ctx.moveTo(x, y - 48);
  ctx.lineTo(x + 60, y - 48);
  ctx.quadraticCurveTo(x + 58, y - 26, x + 38, y - 26);
  ctx.lineTo(x + 16, y - 26);
  ctx.quadraticCurveTo(x, y - 28, x, y - 48);
  ctx.fill();

  // Capote entièrement fermée
  ctx.fillStyle = "#80cbc4";
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 46);
  ctx.bezierCurveTo(x - 2, y - 86, x + 62, y - 86, x + 62, y - 46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4db6ac";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const bx of [x + 14, x + 30, x + 46]) {
    ctx.moveTo(x + 30, y - 76);
    ctx.lineTo(bx, y - 47);
  }
  ctx.stroke();

  // Point d'interrogation qui flotte au-dessus
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("?", x + 30, y - 94 + Math.sin(temps * 0.08) * 4);
}

// Roseaux vers la fin du lac : [x, hauteur, massette]
const ROSEAUX = [
  [3560, 46, false], [3572, 62, true], [3584, 40, false],
  [3712, 58, true], [3724, 72, true], [3735, 44, false],
  [3778, 50, false], [3790, 68, true], [3801, 78, true], [3812, 55, false],
  [3828, 64, true], [3838, 48, false],
];

function dessinerRoseaux() {
  if (!visible(3540, 320)) return;
  const base = LAC.surface + 12;
  ctx.lineCap = "round";
  for (const [x, hauteur, massette] of ROSEAUX) {
    const vent = Math.sin(temps * 0.04 + x * 0.3) * 4;
    const hautX = x + vent;
    const hautY = base - hauteur;

    // Tige
    ctx.strokeStyle = "#6b8e23";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x, base - hauteur / 2, hautX, hautY);
    ctx.stroke();

    // Feuille fine qui s'écarte
    ctx.strokeStyle = "#7da832";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, base - 6);
    ctx.quadraticCurveTo(x + 8, base - hauteur * 0.5, x + 12 + vent, base - hauteur * 0.7);
    ctx.stroke();

    // Massette brune au sommet
    if (massette) {
      ctx.fillStyle = "#6d4c2f";
      ctx.beginPath();
      ctx.ellipse(hautX, hautY + 8, 3.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6b8e23";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hautX, hautY);
      ctx.lineTo(hautX, hautY - 6);
      ctx.stroke();
    }
  }
}

// Grenouille sur un nénuphar à l'entrée du lac, qui saute de temps en temps (simple décor)
const GRENOUILLE_X = 2440;

function dessinerGrenouille() {
  const x = GRENOUILLE_X;
  if (!visible(x - 20, 40)) return;
  const surface = LAC.surface + Math.sin(x * 0.05 + temps * 0.08) * 3;

  // Nénuphar avec son encoche
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.ellipse(x, surface + 1, 16, 4.5, 0, 0.35, Math.PI * 2 - 0.35);
  ctx.lineTo(x, surface + 1);
  ctx.fill();
  ctx.fillStyle = "#f8bbd0";
  ctx.beginPath();
  ctx.arc(x + 10, surface - 1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Un petit saut toutes les ~4 secondes
  const cycle = temps % 240;
  const saut = cycle < 30 ? Math.sin((cycle / 30) * Math.PI) * 22 : 0;
  const y = surface - 1 - saut;

  ctx.save();
  ctx.translate(x - 2, y);
  ctx.scale(-1, 1); // regarde vers la gauche, vers le joueur qui arrive

  // Pattes arrière repliées (tendues pendant le saut)
  ctx.fillStyle = "#43a047";
  if (saut > 0) {
    ctx.fillRect(-12, -2, 7, 2.5);
  } else {
    ctx.beginPath();
    ctx.ellipse(-5, -2, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Corps, ventre clair et gorge qui palpite
  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(0, -5, 7, 5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dcedc8";
  const gorge = 2 + Math.max(0, Math.sin(temps * 0.25)) * 1.2;
  ctx.beginPath();
  ctx.ellipse(5, -3, 2.5, gorge, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#43a047";
  ctx.fillRect(3, -2, 2, 2);

  // Gros yeux sur le dessus de la tête
  for (const ox of [1, 5]) {
    ctx.fillStyle = "#66bb6a";
    ctx.beginPath();
    ctx.arc(ox, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.fillRect(ox, -11, 1.5, 1.5);
  }
  ctx.restore();
}

function dessinerEau() {
  if (!visible(LAC.debut, LAC.fin - LAC.debut)) return;
  ctx.fillStyle = "rgba(30, 136, 229, 0.8)";
  ctx.beginPath();
  ctx.moveTo(LAC.debut, LIMITE_CHUTE + 100);
  for (let x = LAC.debut; x <= LAC.fin; x += 20) {
    ctx.lineTo(x, LAC.surface + Math.sin(x * 0.05 + temps * 0.08) * 3);
  }
  ctx.lineTo(LAC.fin, LIMITE_CHUTE + 100);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (let x = LAC.debut + 40; x < LAC.fin; x += 130) {
    ctx.fillRect(x + Math.sin(temps * 0.03 + x) * 10, LAC.surface + 14 + (x % 3) * 10, 30, 3);
  }
}

// Personnage dans une boîte de 26 × 44 dont (x, y) est le coin haut-gauche
function dessinerPersonnage(c, x, y, type, direction, anim, enAir, biberon = false) {
  const pas = enAir ? 4 : Math.sin(anim) * 5;

  c.save();
  c.translate(x + 13, y);
  c.scale(direction, 1);
  if (type === "femme") dessinerFemmeEnceinte(c, pas, anim, enAir, biberon);
  else dessinerTraileur(c, pas, enAir, biberon);
  c.restore();
}

// Bras tendu vers l'avant qui tient le biberon, tétine devant (repère du personnage, regard à droite).
// La tétine arrive à BOUT_BIBERON pixels devant le centre du personnage : c'est de là que part le lait.
const BOUT_BIBERON = 25;

function dessinerBrasBiberon(c, manche, peau) {
  // Manche, avant-bras et main
  c.fillStyle = manche;
  c.fillRect(-2, 18, 7, 5);
  c.fillStyle = peau;
  c.fillRect(5, 19, 6, 4);

  // Flacon tenu à l'horizontale : lait, graduations, bague bleue et tétine
  c.fillStyle = "rgba(255, 255, 255, 0.6)";
  c.fillRect(9, 17.5, 11, 7);
  c.fillStyle = "#fffdf5";
  c.fillRect(9, 19.5, 11, 5);
  c.fillStyle = "#90a4ae";
  for (const gx of [12, 15, 18]) c.fillRect(gx, 18, 1, 2);
  c.fillStyle = "#4fc3f7";
  c.fillRect(20, 17, 3, 8);
  c.fillStyle = "#f3c892";
  c.beginPath();
  c.ellipse(BOUT_BIBERON - 1, 21, 3, 2.2, 0, 0, Math.PI * 2);
  c.fill();

  // Main par-dessus le flacon
  c.fillStyle = peau;
  c.fillRect(9, 19, 4, 4);
}

// Homme en tenue de trail : bandeau, lunettes, gilet d'hydratation, short et chaussures crantées
function dessinerTraileur(c, pas, enAir, biberon) {
  const peau = "#e0a271";

  // Jambes nues sous le short, chaussures de trail
  c.fillStyle = peau;
  c.fillRect(-7 + pas, 34, 5, 8);
  c.fillRect(2 - pas, 34, 5, 8);
  c.fillStyle = "#37474f";
  c.fillRect(-8 + pas, 40, 9, 3);
  c.fillRect(1 - pas, 40, 9, 3);
  c.fillStyle = "#ffeb3b";
  c.fillRect(-8 + pas, 43, 9, 1);
  c.fillRect(1 - pas, 43, 9, 1);

  // Sac d'hydratation dans le dos
  c.fillStyle = "#263238";
  c.fillRect(-13, 17, 5, 13);

  // Tee-shirt technique et short
  c.fillStyle = "#ff7043";
  c.fillRect(-9, 16, 18, 15);
  c.fillStyle = "#212121";
  c.fillRect(-9, 30, 18, 5);

  // Bretelles du gilet et flasque
  c.fillStyle = "#263238";
  c.fillRect(-6, 16, 3, 14);
  c.fillRect(4, 16, 3, 14);
  c.fillStyle = "#81d4fa";
  c.fillRect(4, 19, 4, 6);

  // Tête : peau bronzée, oreille, cheveux bruns en bataille, barbe de quelques jours, grand sourire
  c.fillStyle = peau;
  c.fillRect(-8, 2, 16, 15);
  c.fillStyle = "#c98a5c";
  c.fillRect(-4, 8, 3, 4);
  // Cheveux courts : juste une nuque dégagée sous la casquette
  c.fillStyle = "#2b1d14";
  c.fillRect(-9, 4, 4, 5);
  c.fillRect(-9, 9, 2, 1);
  c.fillStyle = "rgba(43, 29, 20, 0.55)";
  c.beginPath();
  c.moveTo(-4, 12);
  c.lineTo(-1, 11);
  c.lineTo(8, 11);
  c.lineTo(8, 17);
  c.lineTo(-2, 17);
  c.fill();
  c.fillStyle = "#8e3b30";
  c.beginPath();
  c.ellipse(4.8, 12, 3.3, 2.6, 0, 0, Math.PI);
  c.fill();
  c.fillStyle = "#ffffff";
  c.fillRect(2, 12.2, 5.6, 1.3);
  c.fillStyle = "#222";
  c.fillRect(3, 8, 3, 2.5);
  c.fillStyle = "#2b1d14";
  c.fillRect(2, 6.2, 5, 1.3);

  // Casquette avec la visière vers l'avant
  c.fillStyle = "#e53935";
  c.beginPath();
  c.moveTo(-9, 5);
  c.lineTo(-9, 2);
  c.quadraticCurveTo(-8, -3, 0, -3);
  c.quadraticCurveTo(8, -3, 9, 2);
  c.lineTo(9, 5);
  c.fill();
  c.fillStyle = "#b71c1c";
  c.fillRect(6, 3, 8, 2.5);
  c.fillStyle = "#ffffff";
  c.fillRect(-1, 0, 3, 2);

  // Bras (tendu avec le biberon une fois attrapé)
  if (biberon) return dessinerBrasBiberon(c, "#ff7043", peau);
  const bras = enAir ? -4 : -pas * 0.6;
  c.fillStyle = "#ff7043";
  c.fillRect(-2 + bras, 18, 5, 6);
  c.fillStyle = peau;
  c.fillRect(-2 + bras, 24, 5, 8);
}

// Femme enceinte aux cheveux frisés, en robe de grossesse
function dessinerFemmeEnceinte(c, pas, anim, enAir, biberon) {
  const peau = "#e3a57a";
  const robe = "#3f7fd6";
  const cheveux = "#33201a";

  // Jambes en leggings et chaussures
  c.fillStyle = "#4a148c";
  c.fillRect(-7 + pas, 34, 5, 8);
  c.fillRect(2 - pas, 34, 5, 8);
  c.fillStyle = "#222";
  c.fillRect(-8 + pas, 41, 8, 3);
  c.fillRect(1 - pas, 41, 8, 3);

  // Robe de grossesse évasée
  c.fillStyle = robe;
  c.beginPath();
  c.moveTo(-8, 16);
  c.lineTo(8, 16);
  c.lineTo(11, 36);
  c.lineTo(-11, 36);
  c.fill();

  // Ventre rond
  c.beginPath();
  c.ellipse(8, 27, 8, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255, 255, 255, 0.25)";
  c.beginPath();
  c.ellipse(10, 24, 3, 2.5, 0, 0, Math.PI * 2);
  c.fill();

  // Ruban sous la poitrine
  c.fillStyle = "#bbdefb";
  c.fillRect(-8, 20, 17, 2);

  // Tête : lunettes de soleil « œil de chat », sourcil, joue rosée et grand sourire
  c.fillStyle = peau;
  c.fillRect(-8, 2, 16, 15);
  c.fillStyle = "#3b2416";
  c.fillRect(-3, 7.6, 4, 1);
  c.beginPath();
  c.moveTo(1, 7.5);
  c.lineTo(0, 6);
  c.lineTo(8.8, 6.8);
  c.lineTo(8.8, 9.5);
  c.lineTo(6.8, 11.2);
  c.lineTo(3, 11.2);
  c.lineTo(1, 9.5);
  c.fill();
  c.fillStyle = "#4e342e";
  c.beginPath();
  c.moveTo(2, 7.8);
  c.lineTo(7.8, 7.8);
  c.lineTo(7.8, 9.3);
  c.lineTo(6.4, 10.4);
  c.lineTo(3.3, 10.4);
  c.lineTo(2, 9.3);
  c.fill();
  c.fillStyle = "rgba(255, 255, 255, 0.45)";
  c.fillRect(5.6, 8.1, 1.4, 0.9);
  c.fillStyle = cheveux;
  c.fillRect(2, 5, 5, 1);
  c.fillStyle = "rgba(240, 100, 110, 0.55)";
  c.beginPath();
  c.ellipse(0.5, 11.5, 2.2, 1.5, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#c0392b";
  c.beginPath();
  c.ellipse(4.5, 12, 3.2, 2.6, 0, 0, Math.PI);
  c.fill();
  c.fillStyle = "#ffffff";
  c.fillRect(2, 12.2, 5, 1.3);

  // Cheveux mi-longs (aux épaules), entre ondulés et frisés ; les pointes rebondissent en courant
  const r = enAir ? -1 : Math.abs(Math.sin(anim)) * 1.5;
  c.fillStyle = cheveux;
  c.beginPath();
  c.moveTo(8, 4);
  c.quadraticCurveTo(6, -2, 0, -2);
  c.quadraticCurveTo(-8, -3, -11, 2);
  c.quadraticCurveTo(-14, 5, -11, 8);
  c.quadraticCurveTo(-8, 11 + r, -12, 14 + r);
  c.quadraticCurveTo(-14, 17 + r, -10, 19 + r);
  c.quadraticCurveTo(-8, 21 + r, -6, 18 + r);
  c.quadraticCurveTo(-4, 20 + r, -3, 17 + r);
  c.quadraticCurveTo(-5, 13, -3, 9);
  c.quadraticCurveTo(-1, 5, 3, 4);
  c.closePath();
  c.fill();

  // Petites boucles le long du contour pour un aspect légèrement frisé
  const bord = [
    [-7, -1.5, 0], [-3, -2.5, 0], [1, -2.5, 0], [5, -1, 0],
    [-11, 2, 0], [-12.5, 5, 0], [-11.5, 8, 0], [-11, 11, 1], [-12.5, 14, 1],
    [-12, 17, 1], [-10, 19.5, 1], [-7, 19.5, 1], [-4, 18, 1],
  ];
  for (const [bx, by, pointe] of bord) {
    c.beginPath();
    c.arc(bx, by + pointe * r, 2.2, 0, Math.PI * 2);
    c.fill();
  }

  // Mèches ondulées et petites boucles
  c.strokeStyle = "#5a3a28";
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(-9, 2);
  c.quadraticCurveTo(-12, 6, -9, 9);
  c.quadraticCurveTo(-7, 12 + r, -10, 16 + r);
  c.moveTo(-6, 1);
  c.quadraticCurveTo(-8, 5, -6, 8);
  c.quadraticCurveTo(-4, 11, -6, 15 + r);
  c.stroke();
  for (const [bx, by, pointe] of [[-4, 1, 0], [0, -0.5, 0], [-9.5, 5.5, 0], [-8, 12, 1], [-10, 17, 1], [-6.5, 18, 1]]) {
    c.beginPath();
    c.arc(bx, by + pointe * r, 1.4, 0.2 * Math.PI, 1.7 * Math.PI);
    c.stroke();
  }

  // Boucle d'oreille perle
  c.fillStyle = "#fdfaf2";
  c.beginPath();
  c.arc(-2.5, 13.5, 1.1, 0, Math.PI * 2);
  c.fill();

  // Petite fleur dans les cheveux
  c.fillStyle = "#ffffff";
  for (const [fx, fy] of [[-4, -4], [-1, -3], [-4, -1], [-1, 0]]) {
    c.beginPath();
    c.arc(fx, fy, 1.6, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#ffca28";
  c.beginPath();
  c.arc(-2.5, -2, 1.3, 0, Math.PI * 2);
  c.fill();

  // Bras, main posée près du ventre (tendu avec le biberon une fois attrapé)
  if (biberon) return dessinerBrasBiberon(c, robe, peau);
  const bras = enAir ? -4 : -pas * 0.4;
  c.fillStyle = robe;
  c.fillRect(-3 + bras, 18, 5, 7);
  c.fillStyle = peau;
  c.fillRect(-3 + bras, 25, 5, 6);
}

function dessinerCoeur(x, y) {
  ctx.fillStyle = "#e53935";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 12);
  ctx.bezierCurveTo(x - 16, y + 2, x - 10, y - 10, x, y - 3);
  ctx.bezierCurveTo(x + 10, y - 10, x + 16, y + 2, x, y + 12);
  ctx.fill();
  ctx.stroke();
}

function dessinerVies() {
  for (let i = 0; i < vies; i++) dessinerCoeur(26 + i * 30, 24);
  // Biberon attrapé : affiché à côté des cœurs
  if (joueur.biberon) dessinerBiberon(26 + vies * 30 + 6, 26, false);
}

function dessinerBanniere() {
  ctx.save();
  ctx.globalAlpha = Math.min(1, banniere.duree / 30);
  ctx.font = "bold 26px 'Segoe UI', sans-serif";
  const largeur = Math.max(320, ctx.measureText(banniere.texte).width + 40);
  ctx.fillStyle = "rgba(15, 18, 38, 0.6)";
  ctx.fillRect(W / 2 - largeur / 2, 30, largeur, 50);
  ctx.fillStyle = "#ffd54f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(banniere.texte, W / 2, 55);
  ctx.restore();
}

function dessiner() {
  dessinerFond();

  ctx.save();
  ctx.translate(-Math.round(camX), -Math.round(camY));
  dessinerRoseaux();
  for (const p of niveau.plateformes) if (visible(p.x, p.w)) dessinerPlateforme(p);
  POINTS_REPRISE.forEach((x, i) => {
    if (i > 0 && visible(x, 30)) dessinerBalise(x, i <= pointReprise);
  });
  for (const p of niveau.pieces) if (!p.prise && visible(p.x - 10, 20)) dessinerTetine(p);
  for (const e of niveau.ennemis) if (!e.mort && visible(e.x, e.w)) dessinerEnnemi(e);
  const b = niveau.biberon;
  if (!b.pris && visible(b.x - 20, 40)) dessinerBiberon(b.x, b.y, true);
  for (const t of niveau.tirs) dessinerTir(t);
  dessinerDrapeau();
  dessinerPoussette();
  const j = joueur;
  if (j.invulnerable <= 0 || Math.floor(j.invulnerable / 5) % 2 === 0) {
    dessinerPersonnage(ctx, j.x, j.y, perso, j.direction, j.anim, !j.auSol, j.biberon);
  }
  dessinerEau();
  dessinerGrenouille();
  ctx.restore();

  dessinerVies();
  if (banniere) dessinerBanniere();
}

function boucle(maintenant) {
  if (!enCours || enPause) return;
  // dt normalisé : 1 = une image à 60 i/s
  const dt = Math.min((maintenant - dernierTemps) / 16.67, 3);
  tempsJeu += dt * 16.67;
  elTemps.textContent = formaterTemps(tempsJeu);
  dernierTemps = maintenant;

  mettreAJour(dt);
  if (!enCours) return;
  dessiner();
  requestAnimationFrame(boucle);
}

// ---------- Contrôles ----------

const CODES_JEU = ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW", "KeyX", "KeyF"];
const CODES_SAUT = ["Space", "ArrowUp", "KeyW"];

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (!modalePhoto.classList.contains("cache")) {
    if (e.code === "Escape") fermerPhoto();
    return;
  }
  if (enCours && CODES_JEU.includes(e.code)) e.preventDefault();
  touches[e.code] = true;
  if (!e.repeat && CODES_SAUT.includes(e.code)) tamponSaut = 8;
  if (e.code === "KeyP" || e.code === "Escape") basculerPause();
});

document.addEventListener("keyup", (e) => {
  touches[e.code] = false;
});

document.querySelectorAll("[data-tactile]").forEach((bouton) => {
  const code = bouton.dataset.tactile;
  const appui = (etat) => (e) => {
    e.preventDefault();
    touches[code] = etat;
    if (etat && CODES_SAUT.includes(code)) tamponSaut = 8;
  };
  bouton.addEventListener("pointerdown", appui(true));
  bouton.addEventListener("pointerup", appui(false));
  bouton.addEventListener("pointerleave", appui(false));
  bouton.addEventListener("pointercancel", appui(false));
});

const boutonsDifficulte = document.querySelectorAll(".bouton-difficulte");
boutonsDifficulte.forEach((bouton) => {
  bouton.addEventListener("click", () => {
    difficulte = bouton.dataset.difficulte;
    boutonsDifficulte.forEach((b) => b.classList.toggle("actif", b === bouton));
    niveau = creerNiveau(difficulte);
    majHud();
    dessiner();
  });
});

document.querySelectorAll(".carte-perso").forEach((carte) => {
  const apercu = carte.querySelector("canvas").getContext("2d");
  apercu.scale(2, 2);
  dessinerPersonnage(apercu, 7, 6, carte.dataset.perso, 1, 0, false);
  carte.addEventListener("click", () => {
    const prenom = champPrenom.value.trim();
    const nom = champNom.value.trim();
    if (!prenom || !nom) {
      erreurIdentite.classList.remove("cache");
      (prenom ? champNom : champPrenom).focus();
      return;
    }
    erreurIdentite.classList.add("cache");
    ecrireStockage("abb-joueur", { prenom, nom });
    demarrer(carte.dataset.perso);
  });
});

document.querySelectorAll("[data-reponse]").forEach((bouton) => {
  bouton.addEventListener("click", () => repondre(bouton.dataset.reponse));
});

boutonFermerPhoto.addEventListener("click", fermerPhoto);
modalePhoto.addEventListener("click", (e) => {
  if (e.target === modalePhoto) fermerPhoto();
});

// Pré-remplit le dernier joueur
const dernierJoueur = lireStockage("abb-joueur", {});
champPrenom.value = dernierJoueur.prenom ?? "";
champNom.value = dernierJoueur.nom ?? "";

// ---------- Plein écran ----------
// Vrai plein écran quand le navigateur le permet (Android, ordinateur),
// sinon (iPhone) la zone de jeu occupe simplement toute la page.

const pleinEcranNatif = () => document.fullscreenElement ?? document.webkitFullscreenElement;
const estEnPleinEcran = () => Boolean(pleinEcranNatif()) || sectionJeu.classList.contains("plein-ecran");

function majBoutonPleinEcran() {
  const actif = estEnPleinEcran();
  boutonPleinEcran.textContent = actif ? "✕ Quitter" : "⛶ Plein écran";
  boutonPleinEcran.setAttribute("aria-label", actif ? "Quitter le plein écran" : "Passer en plein écran");
  document.body.classList.toggle("jeu-plein-ecran", actif);
}

async function basculerPleinEcran() {
  if (estEnPleinEcran()) {
    sectionJeu.classList.remove("plein-ecran");
    if (pleinEcranNatif()) await (document.exitFullscreen ?? document.webkitExitFullscreen).call(document);
  } else {
    const demander = sectionJeu.requestFullscreen ?? sectionJeu.webkitRequestFullscreen;
    try {
      await demander.call(sectionJeu);
      // Sur mobile, on bascule en paysage si possible
      await screen.orientation?.lock?.("landscape").catch(() => {});
    } catch {
      sectionJeu.classList.add("plein-ecran");
    }
  }
  majBoutonPleinEcran();
}

boutonPleinEcran.addEventListener("click", (e) => {
  basculerPleinEcran();
  e.currentTarget.blur();
});
document.addEventListener("fullscreenchange", majBoutonPleinEcran);

// ---------- Musique ----------

function majBoutonMusique() {
  const active = Musique.estActive();
  boutonMusique.textContent = active ? "🔊 Musique" : "🔇 Musique";
  boutonMusique.setAttribute("aria-label", active ? "Couper la musique" : "Remettre la musique");
}

boutonMusique.addEventListener("click", (e) => {
  if (Musique.basculer() && enCours) {
    Musique.jouer(difficulte);
    Musique.suspendre(enPause);
  }
  majBoutonMusique();
  e.currentTarget.blur();
});

// Onglet masqué : le jeu se fige, la musique aussi
document.addEventListener("visibilitychange", () => {
  if (enCours && !enPause) Musique.suspendre(document.hidden);
});

majBoutonMusique();
window.addEventListener("load", () => setTimeout(Musique.preparer, 500));
document.addEventListener("webkitfullscreenchange", majBoutonPleinEcran);

boutonMessage.addEventListener("click", () => {
  if (enPause) {
    basculerPause();
  } else {
    ecranMessage.classList.add("cache");
    ecranSelection.classList.remove("cache");
  }
});

majHud();
dessiner();

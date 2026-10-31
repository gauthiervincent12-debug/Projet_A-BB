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

const TAILLES_ENNEMIS = { herisson: [34, 24], bouquetin: [38, 34], castor: [40, 24] };

function ennemi(x, sol, min, max, vitesse, type = x >= LAC.fin ? "bouquetin" : "herisson") {
  // Hérissons dans les collines, bouquetins (plus grands) dans la montagne, castor au lac
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
    // Pontons fixes et rapprochés
    for (let i = 0; i < 8; i++) plateformes.push(planche(2470 + i * 165, i % 2 ? 360 : 380, 110));
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

  // Ennemis : [x, sol, limite gauche, limite droite]
  const positions = [
    [650, SOL, 300, 950],
    [1450, SOL, 1150, 1650],
    [4050, SOL, 3900, 4290],
  ];
  if (!facile) {
    positions.push([2150, SOL, 1850, 2350], [4830, 190, 4800, 4950], [5900, -150, 5800, 6060]);
  }
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
  const ennemis = positions.map(([x, sol, min, max]) => ennemi(x, sol, min, max, vitesse));

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

  return { plateformes, ennemis, pieces };
}

function creerJoueur() {
  return {
    x: POINTS_REPRISE[0], y: SOL - 44, w: 26, h: 44,
    vx: 0, vy: 0, auSol: false, support: null,
    direction: 1, anim: 0, horsSol: 0, invulnerable: 0,
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

function formaterTemps(ms) {
  const secondes = Math.floor(ms / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}`;
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
  ecranMessage.classList.add("cache");
  document.activeElement.blur();
  enCours = true;
  enPause = false;
  dernierTemps = performance.now();
  requestAnimationFrame(boucle);
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
    gagne,
    reponse: null,
    date: new Date().toISOString(),
  };
  sauverScores([...lireScores(), partieActuelle]);

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
  ecranQuestion.classList.add("cache");
  photoTitre.textContent = `${partieActuelle.prenom}, tu as répondu : ${reponse === "fille" ? "une fille 👧" : "un garçon 👦"} !`;
  modalePhoto.classList.remove("cache");
  boutonFermerPhoto.focus();
}

function fermerPhoto() {
  modalePhoto.classList.add("cache");
  ecranSelection.classList.remove("cache");
}

function basculerPause() {
  if (!enCours) return;
  enPause = !enPause;
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
    if (j.vy > 0 && basAvant <= e.y + 10) {
      e.mort = true;
      j.vy = -9;
      ajouterScore(50);
    } else {
      return perdreVie();
    }
  }

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
  }
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
    ctx.fillStyle = p.y < 100 ? "#f5f7fa" : "#8a9a5b";
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

  // Pattes
  ctx.fillStyle = "#4e3b2a";
  ctx.fillRect(-13 + pas, -13, 3, 13);
  ctx.fillRect(-8 - pas, -13, 3, 13);
  ctx.fillRect(6 + pas, -13, 3, 13);
  ctx.fillRect(11 - pas, -13, 3, 13);

  // Corps, ventre clair et queue
  ctx.fillStyle = "#8d6e4f";
  ctx.beginPath();
  ctx.ellipse(0, -18, 17, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-19, -23, 4, 5);
  ctx.fillStyle = "#c8ad8a";
  ctx.beginPath();
  ctx.ellipse(0, -14, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cou et tête
  ctx.fillStyle = "#8d6e4f";
  ctx.beginPath();
  ctx.moveTo(9, -24);
  ctx.lineTo(15, -32);
  ctx.lineTo(19, -28);
  ctx.lineTo(14, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -29, 6, 4.5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Barbiche et œil
  ctx.fillStyle = "#4e3b2a";
  ctx.beginPath();
  ctx.moveTo(19, -26);
  ctx.lineTo(18, -19);
  ctx.lineTo(22, -25);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(18, -31, 2, 2);

  // Grandes cornes recourbées vers l'arrière
  ctx.strokeStyle = "#5a4632";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(15, -33);
  ctx.quadraticCurveTo(10, -50, -2, -40);
  ctx.stroke();
  ctx.strokeStyle = "#7a6248";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const t = 0.2 + i * 0.2;
    const cx = (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 10 + t * t * -2;
    const cy = (1 - t) * (1 - t) * -33 + 2 * (1 - t) * t * -50 + t * t * -40;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 1);
    ctx.lineTo(cx + 2, cy + 1);
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

function dessinerEnnemi(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h);
  ctx.scale(e.vx > 0 ? 1 : -1, 1);

  if (e.type === "bouquetin" || e.type === "castor") {
    (e.type === "castor" ? dessinerCastor : dessinerBouquetin)(e);
    ctx.restore();
    return;
  }

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
  ctx.restore();
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
function dessinerPersonnage(c, x, y, type, direction, anim, enAir) {
  const pas = enAir ? 4 : Math.sin(anim) * 5;

  c.save();
  c.translate(x + 13, y);
  c.scale(direction, 1);
  if (type === "femme") dessinerFemmeEnceinte(c, pas, anim, enAir);
  else dessinerTraileur(c, pas, enAir);
  c.restore();
}

// Homme en tenue de trail : bandeau, lunettes, gilet d'hydratation, short et chaussures crantées
function dessinerTraileur(c, pas, enAir) {
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

  // Bras
  const bras = enAir ? -4 : -pas * 0.6;
  c.fillStyle = "#ff7043";
  c.fillRect(-2 + bras, 18, 5, 6);
  c.fillStyle = peau;
  c.fillRect(-2 + bras, 24, 5, 8);
}

// Femme enceinte aux cheveux frisés, en robe de grossesse
function dessinerFemmeEnceinte(c, pas, anim, enAir) {
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

  // Bras, main posée près du ventre
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
}

function dessinerBanniere() {
  ctx.save();
  ctx.globalAlpha = Math.min(1, banniere.duree / 30);
  ctx.fillStyle = "rgba(15, 18, 38, 0.6)";
  ctx.fillRect(W / 2 - 160, 30, 320, 50);
  ctx.fillStyle = "#ffd54f";
  ctx.font = "bold 26px 'Segoe UI', sans-serif";
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
  dessinerDrapeau();
  dessinerPoussette();
  const j = joueur;
  if (j.invulnerable <= 0 || Math.floor(j.invulnerable / 5) % 2 === 0) {
    dessinerPersonnage(ctx, j.x, j.y, perso, j.direction, j.anim, !j.auSol);
  }
  dessinerEau();
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

const CODES_JEU = ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"];
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

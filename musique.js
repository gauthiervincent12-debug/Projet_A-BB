// Musiques 8 bits originales, une par difficulté, synthétisées avec la Web Audio API.
// Sauvegardes des autres versions (non chargées par le site) : musique-8bits-au-fil-de-l-eau.js,
// musique-16bits.js, musique-32bits.js et musique-64bits.js.
//
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "-" = la note précédente continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "h" charleston.
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";

  const MORCEAUX = {
    // Facile : « Route du désert », rock du désert au riff entêtant (sol mineur)
    facile: {
      bpm: 120,
      voix: [
        {
          // Riff de guitare grave
          type: "sawtooth",
          volume: 0.08,
          mesures: [
            "G2 - G2 . Bb2 - . G2 C3 - Bb2 . G2 - . .",
            "G2 - G2 . Bb2 - . G2 D3 - C3 . Bb2 - G2 -",
            "G2 - G2 . Bb2 - . G2 C3 - Bb2 . G2 - . .",
            "G2 - G2 . Bb2 - . G2 D3 - C3 . Bb2 - G2 -",
            "C3 - C3 . Eb3 - . C3 F3 - Eb3 . C3 - . .",
            "C3 - C3 . Eb3 - . C3 F3 - Eb3 . C3 - . .",
            "G2 - G2 . Bb2 - . G2 C3 - Bb2 . G2 - . .",
            "D3 - . D3 . D3 C3 - Bb2 - A2 - G2 - - -",
          ],
        },
        {
          type: "batterie",
          volume: 0.9,
          mesures: [
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k s . s s s s",
          ],
        },
        {
          // La mélodie arrive au deuxième passage du riff
          type: "square",
          volume: 0.06,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE,
            "D4 - - - F4 - G4 - - - F4 - D4 - - -",
            "Bb3 - - - C4 - D4 - - - . . . . . .",
            "D4 - - - F4 - G4 - Bb4 - - - G4 - F4 -",
            "G4 - - - - - - - . . . . . . . .",
            "G4 - - - Bb4 - C5 - - - Bb4 - G4 - - -",
            "G4 - - - Bb4 - C5 - - - D5 - C5 - - -",
            "D4 - - - F4 - G4 - - - F4 - D4 - - -",
            "D4 - . D4 . D4 C4 - Bb3 - A3 - G3 - - -",
          ],
        },
      ],
    },

    // Moyen : « Roule ma poule », groove à la basse syncopée
    moyen: {
      bpm: 96,
      voix: [
        {
          type: "square",
          volume: 0.09,
          mesures: [
            "E2 - . E2 . . E2 - G2 - . A2 . . B2 A2",
            "E2 - . E2 . . E2 - D2 - . D2 . . C2 D2",
            "E2 - . E2 . . E2 - G2 - . A2 . . B2 A2",
            "C2 - . C2 . . C2 - D2 - . D2 . . B1 -",
          ],
        },
        {
          type: "batterie",
          volume: 1,
          mesures: [
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k s . s s s s",
          ],
        },
        {
          type: "square",
          volume: 0.06,
          mesures: [
            ". . . . E4 . G4 . . . A4 - G4 . E4 .",
            ". . . . E4 . G4 . . . B4 - A4 . G4 .",
            ". . . . E4 . G4 . . . A4 - G4 . E4 .",
            ". . . . D4 . E4 . . . G4 - F#4 . E4 -",
            "B4 - - - A4 - G4 - E4 - - - G4 - A4 -",
            "B4 - - - D5 - B4 - A4 - G4 - E4 - - -",
            "B4 - - - A4 - G4 - E4 - - - D4 - E4 -",
            "G4 - - - F#4 - - - E4 - - - . . . .",
          ],
        },
      ],
    },

    // Difficile : « Coup de colère », riff lourd et rapide en ré grave
    difficile: {
      bpm: 126,
      voix: [
        {
          type: "sawtooth",
          volume: 0.07,
          mesures: [
            "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
            "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
            "D2 D2 . D2 D2 . C3 - B2 - A2 - F2 - D2 -",
            "D2 D2 D2 D2 . . D2 D2 . . D2 D2 D#2 - D2 -",
            "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
            "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
            "D2 D2 . D2 D2 . C3 - B2 - A2 - F2 - D2 -",
            "F2 - F2 - G2 - G2 - G#2 - G#2 - A2 - A2 -",
          ],
        },
        {
          type: "batterie",
          volume: 1,
          mesures: [
            "k . h k s . h . k k h . s . h h",
            "k . h k s . h . k k h . s . h h",
            "k . h k s . h . k k h . s . h h",
            "k . s . k . s . k k s s s s s s",
          ],
        },
        {
          type: "square",
          volume: 0.05,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE,
            "D4 - . D4 F4 - . G4 - . F4 - D4 - C4 -",
            "D4 - . D4 F4 - . G#4 - G4 - F4 - D4 - -",
            "D5 - - - C5 - - - A4 - - - G4 - F4 -",
            "F4 - G4 - G#4 - A4 - - - - - . . . .",
          ],
        },
      ],
    },
  };

  const DEMI_TONS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function frequence(nom) {
    const [, lettre, alteration, octave] = /^([A-G])([#b]?)(\d)$/.exec(nom);
    const midi = DEMI_TONS[lettre] + (alteration === "#" ? 1 : alteration === "b" ? -1 : 0) + (Number(octave) + 1) * 12;
    return 440 * 2 ** ((midi - 69) / 12);
  }

  // Transforme les mesures d'une voix en notes : départ (en pas) → { note, duree (en pas) }
  function preparerVoix(voix) {
    const jetons = voix.mesures.join(" ").trim().split(/\s+/);
    const departs = new Map();
    let derniere = null;
    jetons.forEach((jeton, pas) => {
      if (jeton === "-") {
        if (derniere) derniere.duree++;
      } else if (jeton === ".") {
        derniere = null;
      } else {
        derniere = { note: jeton, duree: 1 };
        departs.set(pas, derniere);
      }
    });
    return { ...voix, departs, longueur: jetons.length };
  }

  let audio = null;
  let sortie = null;
  let bruit = null;
  let morceau = null;
  let minuteur = null;
  let pas = 0;
  let prochainTemps = 0;
  let active = lireReglage();

  function lireReglage() {
    try {
      return localStorage.getItem("abb-musique") !== "non";
    } catch {
      return true;
    }
  }

  function initialiser() {
    if (audio) return true;
    const Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) return false;
    audio = new Contexte();
    sortie = audio.createGain();
    sortie.gain.value = 0.35;
    sortie.connect(audio.destination);
    bruit = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const donnees = bruit.getChannelData(0);
    for (let i = 0; i < donnees.length; i++) donnees[i] = Math.random() * 2 - 1;
    return true;
  }

  function jouerNote(type, note, debut, duree, volume) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = frequence(note);
    gain.gain.setValueAtTime(0, debut);
    gain.gain.linearRampToValueAtTime(volume, debut + 0.005);
    gain.gain.linearRampToValueAtTime(volume * 0.6, debut + duree * 0.85);
    gain.gain.linearRampToValueAtTime(0, debut + duree);
    osc.connect(gain).connect(sortie);
    osc.start(debut);
    osc.stop(debut + duree + 0.02);
  }

  function jouerBruit(debut, duree, volume, filtreType, filtreFrequence) {
    const source = audio.createBufferSource();
    const filtre = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = bruit;
    filtre.type = filtreType;
    filtre.frequency.value = filtreFrequence;
    gain.gain.setValueAtTime(volume, debut);
    gain.gain.exponentialRampToValueAtTime(0.001, debut + duree);
    source.connect(filtre).connect(gain).connect(sortie);
    source.start(debut);
    source.stop(debut + duree);
  }

  function jouerBatterie(coup, debut, volume) {
    if (coup === "k") {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.setValueAtTime(150, debut);
      osc.frequency.exponentialRampToValueAtTime(40, debut + 0.12);
      gain.gain.setValueAtTime(0.9 * volume, debut);
      gain.gain.exponentialRampToValueAtTime(0.001, debut + 0.15);
      osc.connect(gain).connect(sortie);
      osc.start(debut);
      osc.stop(debut + 0.16);
    } else if (coup === "s") {
      jouerBruit(debut, 0.12, 0.45 * volume, "highpass", 1200);
    } else if (coup === "h") {
      jouerBruit(debut, 0.04, 0.18 * volume, "highpass", 7000);
    }
  }

  // Programme les notes un peu en avance, pour un tempo régulier
  function programmer() {
    const dureePas = 60 / morceau.bpm / 4;
    while (prochainTemps < audio.currentTime + 0.12) {
      for (const voix of morceau.voix) {
        const depart = voix.departs.get(pas % voix.longueur);
        if (!depart) continue;
        if (voix.type === "batterie") jouerBatterie(depart.note, prochainTemps, voix.volume);
        else jouerNote(voix.type, depart.note, prochainTemps, depart.duree * dureePas, voix.volume);
      }
      pas++;
      prochainTemps += dureePas;
    }
  }

  function arreter() {
    clearInterval(minuteur);
    minuteur = null;
    couperRiff();
  }

  // À appeler depuis un clic (les navigateurs exigent un geste pour lancer le son)
  function jouer(difficulte) {
    arreter();
    if (!active || !initialiser()) return;
    const choix = MORCEAUX[difficulte];
    morceau = { bpm: choix.bpm, voix: choix.voix.map(preparerVoix) };
    audio.resume();
    pas = 0;
    prochainTemps = audio.currentTime + 0.05;
    programmer();
    minuteur = setInterval(programmer, 25);
  }

  // Riff original dans l'esprit nu-metal, au son « 64 bits », joué quand le personnage fait le signe du metal :
  // une mesure de groupe complet (guitares, basse, batterie) puis un accord final sur la cymbale.
  // Même écriture que les morceaux : 16 pas par mesure, « - » = la note continue, « . » = silence.
  const PAS_RIFF = 0.13; // environ 115 BPM
  const GUITARE_RIFF = preparerVoix({
    mesures: ["A1 - . A1 . . Bb1 . A1 - . C2 - B1 - .", "A1 - - - . . . . . . . . . . . ."],
  });
  const BATTERIE_RIFF = preparerVoix({
    mesures: ["c . h k s . h . k k h . s . h s", "c . . . . . . . . . . . . . . ."],
  });
  const HARMONIQUES_RIFF = [1, 1.5];
  let courbeRiff = null;
  let ambianceRiff = null;
  let busRiff = null;
  const cordesRiff = new Map();

  // Corde pincée simulée (Karplus-Strong), calculée une seule fois par note : son « 64 bits »
  function cordeRiff(f) {
    const cle = f.toFixed(2);
    if (cordesRiff.has(cle)) return cordesRiff.get(cle);
    const sr = audio.sampleRate;
    const n = Math.max(2, Math.floor(sr / f - 0.5));
    const ligne = new Float32Array(n);
    let lisse = 0;
    for (let i = 0; i < n; i++) {
      // Attaque assez douce : moins de brillance, donc un son moins métallique
      lisse += 0.6 * (Math.random() * 2 - 1 - lisse);
      ligne[i] = lisse;
    }
    const total = Math.floor(sr * 1.2);
    const tampon = audio.createBuffer(1, total, sr);
    const d = tampon.getChannelData(0);
    let crete = 0;
    for (let i = 0, k = 0; i < total; i++) {
      const suivant = k + 1 === n ? 0 : k + 1;
      d[i] = ligne[k];
      crete = Math.max(crete, Math.abs(d[i]));
      ligne[k] = 0.998 * 0.5 * (ligne[k] + ligne[suivant]);
      k = suivant;
    }
    for (let i = 0; i < total; i++) d[i] /= crete || 1;
    const corde = { tampon, frequenceReelle: sr / (n + 0.5) };
    cordesRiff.set(cle, corde);
    return corde;
  }

  // Calcul à l'avance des cordes et de l'ambiance, pour que le riff parte sans à-coup dans le jeu
  function prechargerRiff() {
    for (const { note } of GUITARE_RIFF.departs.values()) {
      for (const h of HARMONIQUES_RIFF) cordeRiff(frequence(note) * h);
    }
    if (!courbeRiff) {
      courbeRiff = new Float32Array(2048);
      for (let i = 0; i < courbeRiff.length; i++) {
        const x = (i / (courbeRiff.length - 1)) * 2 - 1;
        courbeRiff[i] = (21 * x) / (1 + 20 * Math.abs(x));
      }
    }
    if (!ambianceRiff) {
      // Petite pièce : réverbération stéréo de 0,6 s
      const longueur = Math.floor(audio.sampleRate * 0.6);
      ambianceRiff = audio.createBuffer(2, longueur, audio.sampleRate);
      for (let canal = 0; canal < 2; canal++) {
        const d = ambianceRiff.getChannelData(canal);
        for (let i = 0; i < longueur; i++) d[i] = (Math.random() * 2 - 1) * Math.exp((-i / audio.sampleRate) * 9);
      }
    }
  }

  function filtreRiff(type, frequenceFiltre, q, gain = 0) {
    const f = audio.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequenceFiltre;
    f.Q.value = q;
    f.gain.value = gain;
    return f;
  }

  // Une guitare : saturation modérée, son chaud (aigus adoucis, médiums peu creusés), placée en stéréo
  function creerGuitareRiff(pan, dest) {
    const entree = audio.createGain();
    entree.gain.value = 2;
    const disto = audio.createWaveShaper();
    disto.curve = courbeRiff;
    disto.oversample = "2x";
    let suite = dest;
    if (audio.createStereoPanner) {
      suite = audio.createStereoPanner();
      suite.pan.value = pan;
      suite.connect(dest);
    }
    entree
      .connect(disto)
      .connect(filtreRiff("peaking", 800, 0.8, -3))
      .connect(filtreRiff("lowpass", 2800, 0.7))
      .connect(suite);
    return entree;
  }

  // Coup de bruit filtré, pour la caisse claire et les cymbales
  function bruitRiff(t, duree, niveau, filtres, dest) {
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = bruit;
    source.loop = true;
    gain.gain.setValueAtTime(niveau, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duree);
    let suite = source;
    for (const f of filtres) suite = suite.connect(f);
    suite.connect(gain).connect(dest);
    source.start(t, Math.random() * 0.5);
    source.stop(t + duree + 0.01);
  }

  function ton(type, frequenceDebut, frequenceFin, t, duree, niveau, dest) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequenceDebut, t);
    osc.frequency.exponentialRampToValueAtTime(frequenceFin, t + duree * 0.4);
    gain.gain.setValueAtTime(niveau, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duree);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + duree + 0.01);
  }

  function coupRiff(coup, t, dest) {
    if (coup === "k" || coup === "c") ton("sine", 120, 45, t, 0.28, 0.85, dest);
    if (coup === "s") {
      ton("triangle", 200, 170, t, 0.1, 0.3, dest);
      bruitRiff(t, 0.17, 0.32, [filtreRiff("bandpass", 1800, 0.7)], dest);
    } else if (coup === "h") {
      bruitRiff(t, 0.04, 0.06, [filtreRiff("highpass", 6000, 0.7)], dest);
    } else if (coup === "c") {
      bruitRiff(t, 0.9, 0.1, [filtreRiff("highpass", 3500, 0.7), filtreRiff("lowpass", 8000, 0.7)], dest);
    }
  }

  // Un nouveau riff, ou la fin de la musique, coupe en douceur le riff en cours
  function couperRiff() {
    if (busRiff) busRiff.gain.setTargetAtTime(0, audio.currentTime, 0.02);
    busRiff = null;
  }

  function riff() {
    if (!active || !initialiser()) return;
    audio.resume();
    prechargerRiff();
    couperRiff();
    const t0 = audio.currentTime + 0.02;

    // Sortie du groupe : compresseur, volume, et un peu d'ambiance de pièce
    busRiff = audio.createGain();
    const compresseur = audio.createDynamicsCompressor();
    compresseur.threshold.value = -20;
    compresseur.ratio.value = 3;
    const volume = audio.createGain();
    volume.gain.value = 0.42;
    busRiff.connect(compresseur).connect(volume).connect(sortie);
    const piece = audio.createConvolver();
    piece.buffer = ambianceRiff;
    const dosePiece = audio.createGain();
    dosePiece.gain.value = 0.1;
    compresseur.connect(piece).connect(dosePiece).connect(sortie);

    // Deux guitares séparées, à gauche et à droite, jouées à quelques millisecondes d'écart
    const guitares = [
      { entree: creerGuitareRiff(-0.6, busRiff), desaccord: -5, retard: 0 },
      { entree: creerGuitareRiff(0.6, busRiff), desaccord: 5, retard: 0.006 },
    ];
    const basse = filtreRiff("lowpass", 450, 0.8);
    basse.connect(busRiff);

    for (const [pas, { note, duree }] of GUITARE_RIFF.departs) {
      const f = frequence(note);
      const debut = t0 + pas * PAS_RIFF;
      const longueur = duree * PAS_RIFF;
      for (const { entree, desaccord, retard } of guitares) {
        const t = debut + retard;
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.003);
        gain.gain.setTargetAtTime(0, t + longueur, 0.015);
        gain.connect(entree);
        for (const h of HARMONIQUES_RIFF) {
          const { tampon, frequenceReelle } = cordeRiff(f * h);
          const source = audio.createBufferSource();
          source.buffer = tampon;
          source.playbackRate.value = ((f * h) / frequenceReelle) * 2 ** (desaccord / 1200);
          source.connect(gain);
          source.start(t);
          source.stop(t + longueur + 0.12);
        }
      }
      // La basse double les guitares
      const osc = audio.createOscillator();
      const gainBasse = audio.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      gainBasse.gain.setValueAtTime(0, debut);
      gainBasse.gain.linearRampToValueAtTime(0.4, debut + 0.005);
      gainBasse.gain.setTargetAtTime(0, debut + longueur, 0.02);
      osc.connect(gainBasse).connect(basse);
      osc.start(debut);
      osc.stop(debut + longueur + 0.15);
    }

    for (const [pas, { note }] of BATTERIE_RIFF.departs) coupRiff(note, t0 + pas * PAS_RIFF, busRiff);
  }

  // Contexte audio et cordes du riff créés à l'avance (la musique 8 bits n'a rien à précalculer)
  function preparer() {
    if (active && initialiser()) prechargerRiff();
  }

  // Pause : fige le son sans perdre la position dans le morceau
  function suspendre(enPause) {
    if (!audio || !minuteur) return;
    if (enPause) audio.suspend();
    else audio.resume();
  }

  function basculer() {
    active = !active;
    try {
      localStorage.setItem("abb-musique", active ? "oui" : "non");
    } catch {
      // Stockage indisponible : le réglage ne sera pas conservé
    }
    if (!active) arreter();
    return active;
  }

  return { jouer, arreter, suspendre, basculer, preparer, riff, estActive: () => active, MORCEAUX };
})();

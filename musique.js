// Musiques 8 bits originales, une par difficulté, synthétisées avec la Web Audio API.
// Sauvegardes des autres versions (non chargées par le site) : musique-16bits.js,
// musique-32bits.js et musique-64bits.js.
//
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "-" = la note précédente continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "h" charleston.
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";
  const arpege = (a, b, c, d) => `${a} - ${b} - ${c} - ${d} - ${c} - ${b} - ${a} - ${b} -`;
  const tenue = (note) => `${note} - - - - - - - - - - - - - - -`;

  const MORCEAUX = {
    // Facile : « Au fil de l'eau », calme et mélancolique
    facile: {
      bpm: 76,
      voix: [
        {
          type: "triangle",
          volume: 0.32,
          mesures: [
            arpege("A3", "C4", "E4", "A4"), arpege("F3", "A3", "C4", "F4"),
            arpege("C4", "E4", "G4", "C5"), arpege("G3", "B3", "D4", "G4"),
            arpege("A3", "C4", "E4", "A4"), arpege("F3", "A3", "C4", "F4"),
            arpege("D4", "F4", "A4", "D5"), arpege("E3", "G#3", "B3", "E4"),
          ],
        },
        {
          type: "triangle",
          volume: 0.34,
          mesures: ["A2", "F2", "C3", "G2", "A2", "F2", "D3", "E2"].map(tenue),
        },
        {
          type: "square",
          volume: 0.09,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE,
            "E5 - - - D5 - C5 - B4 - - - C5 - - -",
            "A4 - - - - - - - C5 - - - A4 - - -",
            "G4 - - - C5 - - - E5 - - - D5 - C5 -",
            "D5 - - - - - - - . . . . B4 - - -",
            "E5 - - - A5 - - - G5 - E5 - D5 - - -",
            "C5 - - - - - A4 - C5 - - - F5 - - -",
            "E5 - D5 - C5 - - - D5 - - - A4 - - -",
            "B4 - - - - - - - G#4 - - - - - - -",
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

  // Riff de guitare saturée joué quand le personnage fait le signe du metal : [note, départ, durée] en secondes.
  // Chaque note est un accord de puissance (fondamentale + quinte), passé dans une distorsion.
  const RIFF = [
    ["E2", 0, 0.16], ["E2", 0.2, 0.08], ["G2", 0.3, 0.16], ["E2", 0.5, 0.08],
    ["A2", 0.6, 0.28], ["G2", 0.92, 0.12], ["B2", 1.08, 0.5],
  ];
  let courbeRiff = null;

  function riff() {
    if (!active || !initialiser()) return;
    audio.resume();
    if (!courbeRiff) {
      courbeRiff = new Float32Array(1024);
      for (let i = 0; i < courbeRiff.length; i++) {
        const x = (i / (courbeRiff.length - 1)) * 2 - 1;
        courbeRiff[i] = (41 * x) / (1 + 40 * Math.abs(x));
      }
    }
    const disto = audio.createWaveShaper();
    disto.curve = courbeRiff;
    const passeBas = audio.createBiquadFilter();
    passeBas.type = "lowpass";
    passeBas.frequency.value = 3000;
    const volume = audio.createGain();
    volume.gain.value = 0.45;
    disto.connect(passeBas).connect(volume).connect(sortie);
    const t0 = audio.currentTime + 0.02;
    for (const [note, debut, duree] of RIFF) {
      for (const f of [frequence(note), frequence(note) * 1.5]) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0, t0 + debut);
        gain.gain.linearRampToValueAtTime(0.3, t0 + debut + 0.005);
        gain.gain.setTargetAtTime(0, t0 + debut + duree, 0.03);
        osc.connect(gain).connect(disto);
        osc.start(t0 + debut);
        osc.stop(t0 + debut + duree + 0.2);
      }
    }
  }

  // Rien à précalculer en 8 bits : on crée seulement le contexte audio à l'avance
  function preparer() {
    if (active) initialiser();
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

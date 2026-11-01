// [Sauvegarde 16 bits — non chargée par le site] Musiques 16 bits originales, une par difficulté, synthétisées avec la Web Audio API.
// Facile et Moyen dans l'esprit Super Nintendo (sons doux, réverbération),
// Difficile dans l'esprit Mega Drive (synthèse FM métallique, guitares saturées).
//
// Chaque morceau : tempo (bpm), volume général, dose de réverbération et voix.
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "A3+C4+E4" = accord · "-" = la note continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "h" charleston.
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";
  const tenue = (note) => `${note} - - - - - - - - - - - - - - -`;
  // Jeu aux doigts : basse sur les temps 1 et 3, notes du milieu et de l'aigu entre deux
  const picking = (basse1, basse2, milieu, aigu) =>
    `${basse1} - ${aigu} - ${milieu} - ${aigu} - ${basse2} - ${aigu} - ${milieu} - ${aigu} -`;

  const BASSE_MOYEN = [
    "E2 - . E2 . . E2 - G2 - . A2 . . B2 A2",
    "E2 - . E2 . . E2 - D2 - . D2 . . C2 D2",
    "E2 - . E2 . . E2 - G2 - . A2 . . B2 A2",
    "C2 - . C2 . . C2 - D2 - . D2 . . B1 -",
  ];

  const RIFF_DIFFICILE = [
    "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
    "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
    "D2 D2 . D2 D2 . C3 - B2 - A2 - F2 - D2 -",
    "D2 D2 D2 D2 . . D2 D2 . . D2 D2 D#2 - D2 -",
    "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
    "D2 D2 . D2 D2 . F2 - D2 D2 . D2 G2 - F2 -",
    "D2 D2 . D2 D2 . C3 - B2 - A2 - F2 - D2 -",
    "F2 - F2 - G2 - G2 - G#2 - G#2 - A2 - A2 -",
  ];

  const MORCEAUX = {
    // Facile : « Feu de camp », folk acoustique un peu western (Super Nintendo)
    facile: {
      bpm: 92,
      volume: 0.75,
      reverberation: 0.35,
      voix: [
        {
          // Guitare jouée aux doigts : basse alternée et notes aiguës
          instrument: "guitareFolk",
          volume: 0.2,
          pan: -0.3,
          mesures: [
            picking("E2", "B2", "G3", "E4"), picking("C3", "G2", "G3", "C4"),
            picking("G2", "D3", "G3", "B3"), picking("D3", "A2", "F#3", "D4"),
            picking("E2", "B2", "G3", "E4"), picking("C3", "G2", "G3", "C4"),
            picking("A2", "E3", "A3", "C4"), picking("B2", "F#2", "D#3", "A3"),
          ],
        },
        {
          instrument: "basseDouce",
          volume: 0.3,
          mesures: [
            ["E2", "B1"], ["C2", "G2"], ["G2", "D2"], ["D2", "A1"],
            ["E2", "B1"], ["C2", "G2"], ["A1", "E2"], ["B1", "F#2"],
          ].map(([a, b]) => `${a} - - - - - - - ${b} - - - - - - -`),
        },
        {
          // Batterie aux balais : entre après 4 mesures de guitare seule
          instrument: "batterie",
          volume: 0.45,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE,
            ...Array(11).fill("k . h . s . h . k . h k s . h ."),
            "k . h . s . h . k . s . s s s s",
          ],
        },
        {
          // L'harmonica arrive au deuxième passage
          instrument: "harmonica",
          volume: 0.1,
          pan: 0.25,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE,
            "B4 - - - B4 - A4 - G4 - - - E4 - - -",
            "G4 - - - - - E4 - G4 - A4 - G4 - - -",
            "B4 - - - D5 - B4 - A4 - G4 - - - . .",
            "A4 - - - - - - - F#4 - - - . . . .",
            "B4 - - - B4 - D5 - E5 - - - D5 - B4 -",
            "C5 - - - B4 - A4 - G4 - - - E4 - - -",
            "A4 - - - C5 - - - B4 - A4 - G4 - - -",
            "F#4 - - - - - - - D#4 - - - . . . .",
          ],
        },
      ],
    },

    // Moyen : « Roule ma poule », groove à la basse syncopée (Super Nintendo)
    moyen: {
      bpm: 96,
      reverberation: 0.25,
      voix: [
        { instrument: "basse", volume: 0.26, mesures: BASSE_MOYEN },
        {
          instrument: "batterie",
          volume: 1,
          mesures: [
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k h . s . h .",
            "k . h . s . h k . k s . s s s s",
          ],
        },
        {
          // Accords plaqués du piano électrique, à contretemps
          instrument: "piano",
          volume: 0.1,
          pan: -0.35,
          mesures: [
            ". . E3+G3+B3 . . . . . . . E3+G3+B3 - . . . .",
            ". . E3+G3+B3 . . . . . . . E3+G3+B3 - . . . .",
            ". . E3+G3+B3 . . . . . . . E3+G3+B3 - . . . .",
            ". . C3+E3+G3 . . . . . . . D3+F#3+A3 - . . . .",
          ],
        },
        {
          instrument: "cuivres",
          volume: 0.09,
          pan: 0.25,
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

    // Difficile : « Coup de colère », riff lourd et rapide en ré grave (Mega Drive)
    difficile: {
      bpm: 126,
      volume: 0.8,
      reverberation: 0.12,
      voix: [
        // Deux guitares saturées un peu désaccordées, à gauche et à droite
        { instrument: "guitareFM", volume: 0.09, pan: -0.45, transposition: 12, mesures: RIFF_DIFFICILE },
        { instrument: "guitareFM", volume: 0.08, pan: 0.45, transposition: 12, desaccord: 12, mesures: RIFF_DIFFICILE },
        { instrument: "basseFM", volume: 0.26, mesures: RIFF_DIFFICILE },
        {
          instrument: "batterie",
          volume: 1.2,
          mesures: [
            "k . h k s . h . k k h . s . h h",
            "k . h k s . h . k k h . s . h h",
            "k . h k s . h . k k h . s . h h",
            "k . s . k . s . k k s s s s s s",
          ],
        },
        {
          instrument: "leadFM",
          volume: 0.08,
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

  // ---------- Instruments ----------
  // env : [attaque, déclin, niveau de maintien, relâche] en secondes (maintien entre 0 et 1).
  // creer(f, t, fin, dest, desaccord) branche les sources d'une note de fréquence f sur dest.

  let audio = null;

  function oscillateur(type, f, t, fin, dest, desaccord = 0) {
    const osc = audio.createOscillator();
    osc.type = type;
    osc.frequency.value = f;
    osc.detune.value = desaccord;
    osc.connect(dest);
    osc.start(t);
    osc.stop(fin);
    return osc;
  }

  function filtre(type, frequence, q, dest) {
    const f = audio.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequence;
    f.Q.value = q;
    f.connect(dest);
    return f;
  }

  // Synthèse FM : un modulateur fait vibrer la fréquence de la porteuse (son Mega Drive)
  function fm(f, ratio, indexDebut, indexFin, dureeIndex, t, fin, dest, desaccord = 0) {
    const porteuse = oscillateur("sine", f, t, fin, dest, desaccord);
    const indice = audio.createGain();
    indice.gain.setValueAtTime(indexDebut, t);
    indice.gain.exponentialRampToValueAtTime(Math.max(indexFin, 0.01), t + dureeIndex);
    oscillateur("sine", f * ratio, t, fin, indice, desaccord);
    indice.connect(porteuse.frequency);
    return porteuse;
  }

  // Léger vibrato qui s'installe après le début de la note
  function vibrato(oscs, f, t, fin, profondeur, retard) {
    const lfo = audio.createOscillator();
    const ampleur = audio.createGain();
    lfo.frequency.value = 5.5;
    ampleur.gain.setValueAtTime(0, t);
    ampleur.gain.linearRampToValueAtTime(f * profondeur, t + retard);
    lfo.connect(ampleur);
    for (const o of oscs) ampleur.connect(o.frequency);
    lfo.start(t);
    lfo.stop(fin);
  }

  const courbes = {};
  function saturation(dest, force) {
    if (!courbes[force]) {
      const courbe = new Float32Array(1024);
      for (let i = 0; i < courbe.length; i++) {
        const x = (i / (courbe.length - 1)) * 2 - 1;
        courbe[i] = ((1 + force) * x) / (1 + force * Math.abs(x));
      }
      courbes[force] = courbe;
    }
    const s = audio.createWaveShaper();
    s.curve = courbes[force];
    s.connect(dest);
    return s;
  }

  const INSTRUMENTS = {
    // Guitare acoustique pincée : son brillant à l'attaque qui s'éteint seul
    guitareFolk: {
      env: [0.002, 0.9, 0, 0.3],
      creer: (f, t, fin, dest) => {
        const passeBas = filtre("lowpass", 3500, 1.2, dest);
        passeBas.frequency.setValueAtTime(3500, t);
        passeBas.frequency.exponentialRampToValueAtTime(700, t + 0.4);
        oscillateur("sawtooth", f, t, fin, passeBas);
        oscillateur("triangle", f * 2, t, fin, passeBas, 4);
      },
    },
    // Harmonica : anches nasillardes (carrés filtrés) avec vibrato
    harmonica: {
      env: [0.05, 0.3, 0.85, 0.15],
      creer: (f, t, fin, dest) => {
        const nasal = filtre("bandpass", 1400, 0.9, filtre("lowpass", 3500, 0.5, dest));
        const oscs = [-6, 6].map((d) => oscillateur("square", f, t, fin, nasal, d));
        vibrato(oscs, f, t, fin, 0.01, 0.2);
      },
    },
    // Piano électrique (FM douce), pour les arpèges et les accords
    piano: {
      env: [0.004, 0.8, 0.2, 0.5],
      creer: (f, t, fin, dest) => {
        fm(f, 2, f * 1.6, f * 0.15, 0.4, t, fin, dest);
      },
    },
    basseDouce: {
      env: [0.02, 0.6, 0.6, 0.4],
      creer: (f, t, fin, dest) => {
        const passeBas = filtre("lowpass", 500, 0.7, dest);
        oscillateur("triangle", f, t, fin, passeBas);
        oscillateur("sine", f, t, fin, passeBas);
      },
    },
    // Basse électrique au son « claqué » : filtre qui se referme vite
    basse: {
      env: [0.005, 0.25, 0.55, 0.08],
      creer: (f, t, fin, dest) => {
        const passeBas = filtre("lowpass", 2200, 5, dest);
        passeBas.frequency.setValueAtTime(2200, t);
        passeBas.frequency.exponentialRampToValueAtTime(380, t + 0.15);
        oscillateur("sawtooth", f, t, fin, passeBas);
        oscillateur("square", f / 2, t, fin, passeBas);
      },
    },
    // Cuivres synthétiques : le filtre s'ouvre à l'attaque
    cuivres: {
      env: [0.03, 0.3, 0.8, 0.12],
      creer: (f, t, fin, dest) => {
        const passeBas = filtre("lowpass", 700, 1.5, dest);
        passeBas.frequency.setValueAtTime(700, t);
        passeBas.frequency.linearRampToValueAtTime(2800, t + 0.06);
        passeBas.frequency.linearRampToValueAtTime(1600, t + 0.3);
        const oscs = [-7, 7].map((d) => oscillateur("sawtooth", f, t, fin, passeBas, d));
        vibrato(oscs, f, t, fin, 0.005, 0.3);
      },
    },
    // Guitare saturée façon Mega Drive : quinte FM (accord de puissance) + distorsion
    guitareFM: {
      env: [0.003, 0.12, 0.75, 0.05],
      creer: (f, t, fin, dest, desaccord) => {
        const passeBas = filtre("lowpass", 3200, 1, dest);
        const disto = saturation(passeBas, 40);
        for (const g of [f, f * 1.5]) fm(g, 1, g * 3, g * 1.2, 0.08, t, fin, disto, desaccord);
      },
    },
    // Basse FM métallique, attaque très marquée
    basseFM: {
      env: [0.003, 0.15, 0.6, 0.05],
      creer: (f, t, fin, dest) => {
        fm(f, 1, f * 4, f * 0.5, 0.1, t, fin, dest);
      },
    },
    leadFM: {
      env: [0.01, 0.2, 0.8, 0.1],
      creer: (f, t, fin, dest) => {
        const disto = saturation(filtre("lowpass", 4000, 1, dest), 6);
        vibrato([fm(f, 2, f * 1.3, f * 0.9, 0.2, t, fin, disto)], f, t, fin, 0.008, 0.15);
      },
    },
  };

  // ---------- Batterie ----------

  let bruit = null;

  function coupDeBruit(t, duree, volume, typeFiltre, frequence, dest) {
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = bruit;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duree);
    source.connect(filtre(typeFiltre, frequence, 0.8, gain));
    gain.connect(dest);
    source.start(t);
    source.stop(t + duree);
  }

  function jouerBatterie(coup, t, volume, dest) {
    if (coup === "k") {
      const gain = audio.createGain();
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      gain.connect(dest);
      const osc = oscillateur("sine", 160, t, t + 0.31, gain);
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      coupDeBruit(t, 0.015, 0.4 * volume, "highpass", 2000, dest);
    } else if (coup === "s") {
      coupDeBruit(t, 0.18, 0.5 * volume, "highpass", 900, dest);
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.35 * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      gain.connect(dest);
      oscillateur("triangle", 190, t, t + 0.11, gain);
    } else if (coup === "h") {
      coupDeBruit(t, 0.05, 0.16 * volume, "highpass", 8000, dest);
    }
  }

  // ---------- Lecture ----------

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

  function jouerNote(voix, note, t, duree) {
    const instrument = INSTRUMENTS[voix.instrument];
    const [attaque, declin, maintien, relache] = instrument.env;
    const fin = t + duree + relache * 2;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(voix.volume, t + attaque);
    gain.gain.setTargetAtTime(voix.volume * maintien, t + attaque, declin / 3);
    gain.gain.setTargetAtTime(0, t + Math.max(duree, attaque), relache / 3);
    gain.connect(voix.entree);
    const facteur = 2 ** ((voix.transposition ?? 0) / 12);
    for (const nom of note.split("+")) instrument.creer(frequence(nom) * facteur, t, fin, gain, voix.desaccord ?? 0);
  }

  // Réverbération : réponse impulsionnelle générée (bruit qui s'éteint en 2 s)
  function creerReverberation() {
    const longueur = audio.sampleRate * 2;
    const impulsion = audio.createBuffer(2, longueur, audio.sampleRate);
    for (let canal = 0; canal < 2; canal++) {
      const d = impulsion.getChannelData(canal);
      for (let i = 0; i < longueur; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / longueur) ** 3;
    }
    const convolution = audio.createConvolver();
    convolution.buffer = impulsion;
    return convolution;
  }

  let sortie = null;
  let reverberation = null;
  let dosageReverberation = null;
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
    sortie.gain.value = 0.4;
    sortie.connect(audio.destination);
    reverberation = creerReverberation();
    dosageReverberation = audio.createGain();
    reverberation.connect(dosageReverberation).connect(sortie);
    bruit = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const donnees = bruit.getChannelData(0);
    for (let i = 0; i < donnees.length; i++) donnees[i] = Math.random() * 2 - 1;
    return true;
  }

  // Chaque voix a sa place dans la stéréo et part à la fois en direct et dans la réverbération
  function brancherVoix(voix) {
    const entree = audio.createGain();
    let suite = entree;
    if (voix.pan && audio.createStereoPanner) {
      const panoramique = audio.createStereoPanner();
      panoramique.pan.value = voix.pan;
      entree.connect(panoramique);
      suite = panoramique;
    }
    suite.connect(sortie);
    suite.connect(reverberation);
    return { ...voix, entree };
  }

  // Programme les notes un peu en avance, pour un tempo régulier
  function programmer() {
    const dureePas = 60 / morceau.bpm / 4;
    while (prochainTemps < audio.currentTime + 0.12) {
      for (const voix of morceau.voix) {
        const depart = voix.departs.get(pas % voix.longueur);
        if (!depart) continue;
        if (voix.instrument === "batterie") jouerBatterie(depart.note, prochainTemps, voix.volume, voix.entree);
        else jouerNote(voix, depart.note, prochainTemps, depart.duree * dureePas);
      }
      pas++;
      prochainTemps += dureePas;
    }
  }

  function arreter() {
    clearInterval(minuteur);
    minuteur = null;
    // Coupe ce qui reste (notes déjà programmées, queue de réverbération) en douceur
    if (morceau) {
      for (const voix of morceau.voix) {
        voix.entree.gain.setTargetAtTime(0, audio.currentTime, 0.05);
      }
      morceau = null;
    }
  }

  // À appeler depuis un clic (les navigateurs exigent un geste pour lancer le son)
  function jouer(difficulte) {
    arreter();
    if (!active || !initialiser()) return;
    const choix = MORCEAUX[difficulte];
    dosageReverberation.gain.value = choix.reverberation;
    sortie.gain.value = 0.4 * (choix.volume ?? 1);
    morceau = { bpm: choix.bpm, voix: choix.voix.map((v) => brancherVoix(preparerVoix(v))) };
    audio.resume();
    pas = 0;
    prochainTemps = audio.currentTime + 0.05;
    programmer();
    minuteur = setInterval(programmer, 25);
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

  return { jouer, arreter, suspendre, basculer, estActive: () => active, MORCEAUX };
})();

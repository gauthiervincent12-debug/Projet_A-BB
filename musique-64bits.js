// [Sauvegarde 64 bits — non chargée par le site] Musiques « 64 bits » originales, une par difficulté, synthétisées avec la Web Audio API,
// dans l'esprit Nintendo 64 / PlayStation 2 : cordes pincées simulées (Karplus-Strong) avec deux
// micros, glissés et larsen, voix synthétique expressive avec écho stéréo, batterie variée et jouée
// « à la main », égaliseur et limiteur final. Morceaux en plusieurs parties (couplet, refrain, pont).
// Sauvegardes : musique-32bits.js et musique-16bits.js (non chargées par le site).
//
// Chaque morceau : tempo (bpm), volume général, dose de réverbération et voix.
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "A3+C4+E4" = accord · "-" = la note continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "g" caisse claire effleurée · "h" charleston
// fermé · "o" charleston ouvert · "r" ride · "t" tom · "c" crash (avec grosse caisse).
// Options d'une voix : pan (-1 gauche, 1 droite), chorus, echo, glisse (secondes de glissé entre
// deux notes), humain (petites variations de force et de placement), transposition (demi-tons),
// desaccord (cents).
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";
  const silences = (n) => Array(n).fill(SILENCE);
  const repeter = (n, mesure) => Array(n).fill(mesure);
  // Arpège en croches sur 8 notes
  const arpege = (notes) => notes.map((note) => `${note} -`).join(" ");
  // Accord de puissance martelé, avec rebond
  const martele = (r) => `${r} - - - ${r} - ${r} - ${r} - - - ${r} - ${r} -`;
  const ronde = (r) => `${r} - - - - - - - - - - - - - - -`;
  const blanches = (a, b = a) => `${a} - - - - - - - ${b} - - - - - - -`;
  const croches = (r) => `${r} - `.repeat(8).trim();

  // ----- « Brume » (ré mineur) : couplet, refrain, pont, refrain -----
  const ARPEGES = {
    Dm: ["D3", "A3", "D4", "F4", "A4", "F4", "D4", "A3"],
    Bb: ["Bb2", "F3", "Bb3", "D4", "F4", "D4", "Bb3", "F3"],
    Gm: ["G2", "D3", "G3", "Bb3", "D4", "Bb3", "G3", "D3"],
    A: ["A2", "E3", "A3", "C#4", "E4", "C#4", "A3", "E3"],
    F: ["F2", "C3", "F3", "A3", "C4", "A3", "F3", "C3"],
    C: ["C3", "G3", "C4", "E4", "G4", "E4", "C4", "G3"],
  };
  const RACINES = { Dm: "D2", Bb: "Bb1", Gm: "G1", A: "A1", F: "F1", C: "C2" };
  const GRILLE = ["Dm", "Bb", "Gm", "A", "Dm", "Bb", "F", "A"];
  const PONT = ["Gm", "Bb", "F", "C", "Gm", "Bb", "A", "A"];
  const BRUME = [...GRILLE, ...GRILLE, ...PONT, ...GRILLE];
  const REFRAIN_BRUME = [
    "A4 - - - - - F4 - E4 - D4 - - - - -",
    "F4 - - - - - D4 - F4 - G4 - - - - -",
    "Bb4 - - - A4 - G4 - - - F4 - G4 - - -",
    "A4 - - - - - - - E4 - - - C#4 - - -",
    "A4 - - - - - F4 - E4 - D4 - - - F4 -",
    "D5 - - - - - C5 - Bb4 - - - A4 - - -",
    "A4 - - - G4 - F4 - - - E4 - F4 - - -",
    "E4 - - - - - - - - - - - . . . .",
  ];

  // ----- « Vertige » (mi, gamme orientale) : intro, couplet, refrain, cassure, refrain -----
  const RA = "E2 . E2 E2 F2 . E2 . E2 . E2 E2 G#2 . F2 .";
  const RB = "E2 . E2 E2 F2 . E2 . A2 - G#2 - F2 - E2 -";
  const REFRAIN_VERTIGE = [blanches("C3", "B2"), blanches("A2", "G#2"), blanches("F2", "G#2"), "A2 - - - B2 - - - C3 - - - B2 - - -"];
  const CASSURE = [
    "E2 - - - - - - - . . . . . . . .",
    "F2 - - - - - - - . . . . . . . .",
    "G#2 - - - - - - - . . . . . . . .",
    "A2 - - - B2 - - - C3 - C3 - D3 - D3 -",
  ];
  const VERTIGE = [RA, RA, RA, RB, RA, RA, RA, RB, RA, RA, RA, RB, ...REFRAIN_VERTIGE, ...REFRAIN_VERTIGE, ...CASSURE, ...REFRAIN_VERTIGE, ...REFRAIN_VERTIGE];
  const MELODIE_VERTIGE = [
    "E4 - - - F4 - G#4 - A4 - - - G#4 - F4 -",
    "E4 - - - - - - - D4 - E4 - F4 - - -",
    "G#4 - - - A4 - B4 - C5 - - - B4 - A4 -",
    "G#4 - - - F4 - - - E4 - - - - - - -",
  ];

  // ----- « Abîme » (la, très grave) : intro, riff, couplet, cassure, final -----
  const R1 = "A1 - . A1 . . A1 - . A1 Bb1 - . A1 . .";
  const R2 = "A1 - . A1 . . A1 - . C2 - B1 - Bb1 - .";
  const R3 = "D2 - . D2 . . D2 - . D2 Eb2 - . D2 . .";
  const R4 = "C2 - . C2 . . Bb1 - . Bb1 . . A1 - - -";
  const COUPLET_ABIME = ["A1 - . . . . . . . . A1 - . . . .", "Bb1 - . . . . . . . . A1 - . . . ."];
  const ABIME = [
    ...silences(4),
    R1, R2, R1, R3, R1, R2, R1, R4,
    ...COUPLET_ABIME, ...COUPLET_ABIME, ...COUPLET_ABIME, ...COUPLET_ABIME,
    ...repeter(3, "A1 - - - - - - - A1 - - - Bb1 - - -"), "C2 - - - Bb1 - - - A1 - . A1 . A1 A1 A1",
    R1, R2, R3, R4, R1, R2, R3, R4,
  ];
  const INTRO_ABIME = [
    "A3 - . E4 - . A4 - . Bb4 - . A4 - E4 -",
    "A3 - . E4 - . A4 - . Bb4 - . A4 - E4 -",
    "A3 - . E4 - . A4 - . C5 - . Bb4 - A4 -",
    "A3 - . F4 - . E4 - . . . . . . . .",
  ];
  const VOIX_ABIME = [
    "E4 - - - - - - - F4 - E4 - - - - -",
    "C4 - - - - - - - B3 - C4 - D4 - - -",
    "E4 - - - - - - - F4 - - - E4 - D4 -",
    "C4 - - - Bb3 - - - A3 - - - - - - -",
  ];

  const MORCEAUX = {
    // Facile : « Brume », ballade rock des années 90
    facile: {
      bpm: 84,
      volume: 1,
      reverberation: 0.35,
      voix: [
        {
          instrument: "guitareClaire",
          volume: 0.13,
          pan: -0.3,
          chorus: true,
          humain: true,
          mesures: BRUME.map((accord) => arpege(ARPEGES[accord])),
        },
        {
          // Saturée au refrain, accords tenus avec larsen au pont
          instrument: "guitareSaturee",
          volume: 0.06,
          pan: 0.4,
          transposition: 12,
          humain: true,
          mesures: [
            ...silences(8),
            ...GRILLE.map((a) => martele(RACINES[a])),
            ...PONT.map((a) => ronde(RACINES[a])),
            ...GRILLE.map((a) => martele(RACINES[a])),
          ],
        },
        {
          instrument: "basse",
          volume: 0.22,
          humain: true,
          glisse: 0.05,
          mesures: [
            ...GRILLE.map((a) => blanches(RACINES[a])),
            ...GRILLE.map((a) => croches(RACINES[a])),
            ...PONT.map((a) => blanches(RACINES[a])),
            ...GRILLE.map((a) => croches(RACINES[a])),
          ],
        },
        {
          instrument: "batterie",
          volume: 0.8,
          humain: true,
          mesures: [
            ...repeter(7, "k . . . h . . g s . . . h . . g"),
            "k . . . h . . . s . s . s s s s",
            "c . h . s . h . k k h . s . o .",
            ...repeter(6, "k . h . s . h . k k h . s . o ."),
            "k . h . s . h . k k h . s s s s",
            "c . r . s . r . k . r k s . r .",
            ...repeter(6, "k . r . s . r . k . r k s . r ."),
            "t t t t t t t t s s s s s s s s",
            "c . h . s . h . k k h . s . o .",
            ...repeter(6, "k . h . s . h . k k h . s . o ."),
            "k . h . s . h . k k s s t t t t",
          ],
        },
        {
          instrument: "voixSynth",
          volume: 0.09,
          glisse: 0.07,
          echo: true,
          mesures: [
            ...silences(8),
            ...REFRAIN_BRUME,
            "D5 - - - - - - - C5 - Bb4 - - - - -",
            "D5 - - - F5 - - - - - D5 - - - - -",
            "C5 - - - - - A4 - C5 - - - - - - -",
            "E5 - - - D5 - C5 - - - - - . . . .",
            "D5 - - - - - - - C5 - Bb4 - - - G4 -",
            "F5 - - - - - D5 - - - Bb4 - - - - -",
            "C#5 - - - - - - - E5 - - - - - - -",
            "E5 - - - - - - - - - - - . . . .",
            ...REFRAIN_BRUME,
          ],
        },
      ],
    },

    // Moyen : « Vertige », metal alternatif nerveux aux sonorités orientales
    moyen: {
      bpm: 118,
      volume: 0.8,
      reverberation: 0.18,
      voix: [
        { instrument: "guitareSaturee", volume: 0.08, pan: -0.45, transposition: 12, humain: true, mesures: VERTIGE },
        {
          // La deuxième guitare entre après l'intro
          instrument: "guitareSaturee",
          volume: 0.07,
          pan: 0.45,
          transposition: 12,
          desaccord: 10,
          humain: true,
          mesures: [...silences(4), ...VERTIGE.slice(4)],
        },
        { instrument: "basseMetal", volume: 0.24, humain: true, glisse: 0.04, mesures: VERTIGE },
        {
          instrument: "batterie",
          volume: 1,
          humain: true,
          mesures: [
            ...repeter(3, "k . h . s . h . k . h . s . h ."),
            "k . h . s . h . k t t s s t t s",
            ...repeter(3, "k . t . s . t k . k t . s . t t"),
            "k . t . s . t k t t s s t t s s",
            ...repeter(3, "k . t . s . t k . k t . s g t t"),
            "k . t . s . t k t t s s t t s s",
            "c . h . s . h . k . h k s . o .",
            ...repeter(6, "k . h . s . h . k . h k s . o ."),
            "t t t t s s s s t t s s k . . .",
            "t . . . t . . . t . . . t . . .",
            "t . . . t . . . t . t . t . t .",
            "s . s . s . s . s s s s s s s s",
            "s s s s s s s s t t t t t t t t",
            "c . r . s . r . k . r k s . r .",
            ...repeter(6, "k . r . s . r . k . r k s . r ."),
            "t t t t s s s s t t s s c . . .",
          ],
        },
        {
          instrument: "voixSynth",
          volume: 0.09,
          glisse: 0.06,
          echo: true,
          mesures: [
            ...silences(4),
            "E4 - E4 - F4 - E4 - . . . . . . . .",
            "E4 - E4 - G#4 - F4 - E4 - . . . . . .",
            "E4 - E4 - F4 - E4 - . . . . D4 - E4 -",
            "F4 - - - E4 - - - . . . . . . . .",
            "E4 - E4 - F4 - E4 - . . . . . . . .",
            "E4 - E4 - G#4 - F4 - E4 - . . . . . .",
            "E4 - E4 - F4 - E4 - . . . . D4 - E4 -",
            "F4 - - - E4 - - - . . . . . . . .",
            ...MELODIE_VERTIGE, ...MELODIE_VERTIGE,
            ronde("B4"), ronde("C5"), ronde("D5"), "E5 - - - - - - - D5 - C5 - B4 - - -",
            ...MELODIE_VERTIGE, ...MELODIE_VERTIGE,
          ],
        },
      ],
    },

    // Difficile : « Abîme », nu-metal grave : intro inquiétante, riff lourd qui rebondit
    difficile: {
      bpm: 104,
      volume: 0.9,
      reverberation: 0.2,
      voix: [
        {
          // Guitare claire : intro et couplet
          instrument: "guitareClaire",
          volume: 0.2,
          chorus: true,
          humain: true,
          mesures: [...INTRO_ABIME, ...silences(8), ...INTRO_ABIME, ...INTRO_ABIME, ...silences(12)],
        },
        { instrument: "guitareSaturee", volume: 0.09, pan: -0.45, transposition: 12, humain: true, glisse: 0.03, mesures: ABIME },
        { instrument: "guitareSaturee", volume: 0.08, pan: 0.45, transposition: 12, desaccord: 12, humain: true, mesures: ABIME },
        { instrument: "basseMetal", volume: 0.26, humain: true, glisse: 0.04, mesures: ABIME },
        {
          instrument: "batterie",
          volume: 1.1,
          humain: true,
          mesures: [
            "h . h . h . h . h . h . h . h .",
            "h . h . h . h . h . h . h . h .",
            "h . h . h . h . o . h . o . h h",
            "s . . . s . . . s . s . s s s s",
            "c . . k . . s . . k k . s . . .",
            ...repeter(6, "k . . k . . s . . k k . s . h ."),
            "k . . k . . s . t t t t s s s s",
            ...repeter(7, "k . r . . . s . . . k . s . r ."),
            "k . r . . . s . t t s s t t s s",
            "c . . . . . . . s . . . . . . .",
            "k . . . . . . . s . . . . . . .",
            "c . . . . . . . s . . . . . . .",
            "k . . . k . . . s . s . s s s s",
            "c . . k . . s . . k k . s . h .",
            ...repeter(6, "k . . k . . s . . k k . s . o ."),
            "k . . k . . s . t t t t c . . .",
          ],
        },
        {
          instrument: "voixSynth",
          volume: 0.08,
          glisse: 0.08,
          echo: true,
          mesures: [...silences(12), ...VOIX_ABIME, ...VOIX_ABIME, ...silences(4), ...VOIX_ABIME, ...VOIX_ABIME],
        },
      ],
    },
  };

  // ---------- Briques de synthèse ----------

  let audio = null;
  let bruit = null;

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

  function amplification(valeur, dest) {
    const g = audio.createGain();
    g.gain.value = valeur;
    g.connect(dest);
    return g;
  }

  // Gain qui s'éteint en « duree » secondes (percussions)
  function decroissance(volume, t, duree, dest) {
    const g = audio.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duree);
    g.connect(dest);
    return g;
  }

  function sourceBruit(t, fin, dest) {
    const source = audio.createBufferSource();
    source.buffer = bruit;
    source.loop = true;
    source.connect(dest);
    source.start(t, Math.random() * 0.5);
    source.stop(fin);
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
  function saturation(force, dest) {
    if (!courbes[force]) {
      const courbe = new Float32Array(2048);
      for (let i = 0; i < courbe.length; i++) {
        const x = (i / (courbe.length - 1)) * 2 - 1;
        courbe[i] = ((1 + force) * x) / (1 + force * Math.abs(x));
      }
      courbes[force] = courbe;
    }
    const s = audio.createWaveShaper();
    s.curve = courbes[force];
    s.oversample = "2x";
    s.connect(dest);
    return s;
  }

  // ---------- Cordes pincées (algorithme de Karplus-Strong) ----------
  // Une ligne à retard remplie de bruit, filtrée en boucle : le son d'une vraie corde.
  // Chaque note est calculée une seule fois, puis gardée en mémoire.

  const cordes = new Map();

  function cordePincee(f, { brillance, amortissement, duree }) {
    const cle = `${f.toFixed(2)}|${brillance}|${amortissement}|${duree}`;
    if (cordes.has(cle)) return cordes.get(cle);
    const sr = audio.sampleRate;
    const n = Math.max(2, Math.floor(sr / f - 0.5));
    const ligne = new Float32Array(n);
    let lisse = 0;
    for (let i = 0; i < n; i++) {
      // Bruit plus ou moins adouci : une faible brillance donne une attaque plus sourde
      lisse += brillance * (Math.random() * 2 - 1 - lisse);
      ligne[i] = lisse;
    }
    const total = Math.floor(sr * duree);
    const tampon = audio.createBuffer(1, total, sr);
    const d = tampon.getChannelData(0);
    let crete = 0;
    for (let i = 0, k = 0; i < total; i++) {
      const suivant = k + 1 === n ? 0 : k + 1;
      d[i] = ligne[k];
      crete = Math.max(crete, Math.abs(d[i]));
      ligne[k] = amortissement * 0.5 * (ligne[k] + ligne[suivant]);
      k = suivant;
    }
    for (let i = 0; i < total; i++) d[i] /= crete || 1;
    // La moyenne de deux échantillons ajoute un demi-échantillon de retard
    const resultat = { tampon, frequenceReelle: sr / (n + 0.5) };
    cordes.set(cle, resultat);
    return resultat;
  }

  function jouerCorde(f, reglages, t, fin, dest, o = {}) {
    const { tampon, frequenceReelle } = cordePincee(f, reglages);
    const source = audio.createBufferSource();
    source.buffer = tampon;
    const vitesse = (f / frequenceReelle) * 2 ** ((o.desaccord ?? 0) / 1200);
    source.playbackRate.value = vitesse;
    // Glissé : la corde part de la note précédente et rejoint la nouvelle
    if (o.depart) {
      source.playbackRate.setValueAtTime(vitesse * (o.depart / f), t);
      source.playbackRate.linearRampToValueAtTime(vitesse, t + o.glisse);
    }
    source.connect(dest);
    source.start(t);
    source.stop(Math.min(fin, t + tampon.duration));
  }

  // ---------- Instruments ----------
  // env : [attaque, déclin, niveau de maintien, relâche] en secondes (maintien entre 0 et 1).
  // corde : réglages Karplus-Strong ; harmoniques : notes jouées ensemble (1.5 = quinte).
  // creer(f, t, fin, dest, desaccord) branche les sources d'une note de fréquence f sur dest.

  const INSTRUMENTS = {
    // Guitare électrique claire : mélange micro manche (rond) et micro chevalet (brillant), attaque du médiator
    guitareClaire: {
      env: [0.001, 3, 1, 0.25],
      corde: { brillance: 0.75, amortissement: 0.997, duree: 2 },
      creer(f, t, fin, dest, o) {
        const manche = filtre("lowpass", 2200, 0.7, amplification(0.6, dest));
        const chevalet = filtre("peaking", 3200, 1, filtre("lowpass", 6000, 0.7, amplification(0.45, dest)));
        chevalet.gain.value = 4;
        const micros = amplification(1, manche);
        micros.connect(chevalet);
        jouerCorde(f, this.corde, t, fin, micros, o);
        sourceBruit(t, t + 0.02, filtre("highpass", 2500, 0.7, decroissance(0.08, t, 0.015, dest)));
      },
    },
    // Basse électrique jouée au doigt, avec le bruit du doigt sur la corde
    basse: {
      env: [0.001, 3, 1, 0.08],
      corde: { brillance: 0.45, amortissement: 0.996, duree: 2 },
      creer(f, t, fin, dest, o) {
        const ampli = saturation(2, filtre("lowpass", 1400, 1.5, amplification(1.4, dest)));
        jouerCorde(f, this.corde, t, fin, ampli, o);
        sourceBruit(t, t + 0.03, filtre("bandpass", 900, 1, decroissance(0.05, t, 0.025, dest)));
      },
    },
    // Guitare saturée : accord de puissance, deux micros, et larsen qui monte sur les notes tenues
    guitareSaturee: {
      env: [0.001, 3, 1, 0.04],
      corde: { brillance: 0.9, amortissement: 0.998, duree: 2 },
      harmoniques: [1, 1.5, 2],
      creer(f, t, fin, dest, o) {
        const manche = filtre("lowpass", 2400, 0.8, amplification(0.55, dest));
        const chevalet = filtre("peaking", 2600, 1.2, filtre("lowpass", 5000, 0.8, amplification(0.5, dest)));
        chevalet.gain.value = 4;
        const baffle = filtre("peaking", 1800, 1.2, manche);
        baffle.gain.value = -5;
        baffle.connect(chevalet);
        const ampli = amplification(4, saturation(60, baffle));
        for (const h of this.harmoniques) jouerCorde(f * h, this.corde, t, fin, ampli, o);
        if (o.duree > 0.6) {
          // Larsen : l'octave aiguë qui s'installe doucement
          const larsen = audio.createGain();
          larsen.gain.setValueAtTime(0, t);
          larsen.gain.linearRampToValueAtTime(0, t + 0.35);
          larsen.gain.linearRampToValueAtTime(0.18, t + o.duree);
          larsen.connect(ampli);
          vibrato([oscillateur("sine", f * 2, t, fin, larsen)], f * 2, t, fin, 0.004, 0.5);
        }
      },
    },
    basseMetal: {
      env: [0.001, 3, 1, 0.05],
      corde: { brillance: 0.55, amortissement: 0.997, duree: 2 },
      creer(f, t, fin, dest, o) {
        const ampli = amplification(2, saturation(5, filtre("lowpass", 1500, 1, dest)));
        jouerCorde(f, this.corde, t, fin, ampli, o);
      },
    },
    // Voix synthétique expressive : attaque par en dessous ou glissé depuis la note d'avant,
    // voyelle qui s'ouvre (« ou » → « a »), vibrato qui s'installe et un peu de souffle
    voixSynth: {
      env: [0.08, 0.4, 0.85, 0.25],
      creer(f, t, fin, dest, o) {
        const bouche = audio.createGain();
        const premierFormant = filtre("bandpass", 420, 4, dest);
        premierFormant.frequency.setValueAtTime(420, t);
        premierFormant.frequency.linearRampToValueAtTime(700, t + 0.3);
        bouche.connect(premierFormant);
        for (const [frequence, q, niveau] of [[1100, 6, 0.6], [2600, 8, 0.25]]) {
          bouche.connect(filtre("bandpass", frequence, q, amplification(niveau, dest)));
        }
        const debut = o.depart ?? f * 2 ** (-1 / 12);
        const dureeGlisse = o.depart ? o.glisse : 0.08;
        const oscs = [-6, 6].map((d) => {
          const osc = oscillateur("sawtooth", f, t, fin, bouche, d);
          osc.frequency.setValueAtTime(debut, t);
          osc.frequency.linearRampToValueAtTime(f, t + dureeGlisse);
          return osc;
        });
        vibrato(oscs, f, t, fin, 0.014, 0.3);
        sourceBruit(t, fin, filtre("bandpass", 2500, 1.5, amplification(0.025, dest)));
      },
    },
  };

  // ---------- Batterie ----------

  const varie = () => 0.9 + Math.random() * 0.2;

  // Cymbale : banc d'oscillateurs carrés désaccordés (son métallique), filtré, chaque coup un peu différent
  function cymbale(t, volume, base, rapports, aigu, duree, dest) {
    const v = varie();
    const metal = filtre("bandpass", aigu * v, 0.8, filtre("highpass", aigu * 0.7, 0.7, decroissance(volume * v, t, duree, dest)));
    for (const r of rapports) oscillateur("square", base * r * v, t, t + duree + 0.02, metal);
  }

  function jouerBatterie(coup, t, voix) {
    const { entree: dest } = voix;
    const volume = voix.volume * (voix.humain ? varie() : 1);
    if (coup === "k") {
      const corps = decroissance(volume, t, 0.4, dest);
      const osc = oscillateur("sine", 130 * varie(), t, t + 0.41, corps);
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      oscillateur("triangle", 1100, t, t + 0.02, decroissance(volume * 0.25, t, 0.012, dest));
    } else if (coup === "s" || coup === "g") {
      const force = coup === "g" ? 0.25 : 1;
      sourceBruit(t, t + 0.22, filtre("bandpass", 2500 * varie(), 0.6, decroissance(volume * 0.6 * force, t, 0.2, dest)));
      const ton = decroissance(volume * 0.3 * force, t, 0.08, dest);
      oscillateur("triangle", 185, t, t + 0.09, ton);
      oscillateur("triangle", 330, t, t + 0.09, ton);
    } else if (coup === "h") {
      cymbale(t, volume * 0.5, 40, [2, 3, 4.16, 5.43, 6.79, 8.21], 10000, 0.06, dest);
    } else if (coup === "o") {
      cymbale(t, volume * 0.4, 40, [2, 3, 4.16, 5.43, 6.79, 8.21], 9000, 0.35, dest);
      sourceBruit(t, t + 0.36, filtre("highpass", 7000, 0.7, decroissance(volume * 0.08, t, 0.34, dest)));
    } else if (coup === "r") {
      // Ride : plus grave, avec un « ting » de cloche
      cymbale(t, volume * 0.25, 90, [2, 3.1, 4.4, 5.9], 6000, 0.8, dest);
      oscillateur("sine", 2400 * varie(), t, t + 0.3, decroissance(volume * 0.05, t, 0.25, dest));
    } else if (coup === "t") {
      const peau = oscillateur("sine", 150, t, t + 0.4, decroissance(volume * 0.8, t, 0.38, dest));
      peau.frequency.setValueAtTime(150 * varie(), t);
      peau.frequency.exponentialRampToValueAtTime(85, t + 0.25);
      sourceBruit(t, t + 0.06, filtre("bandpass", 500, 1, decroissance(volume * 0.2, t, 0.05, dest)));
    } else if (coup === "c") {
      jouerBatterie("k", t, voix);
      sourceBruit(t, t + 1.6, filtre("highpass", 4500 * varie(), 0.6, decroissance(volume * 0.3, t, 1.5, dest)));
      cymbale(t, volume * 0.18, 60, [2.3, 3.7, 5.1, 6.6, 8.4], 8000, 1.2, dest);
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

  const frequencesDe = (voix, note) =>
    note.split("+").map((nom) => frequence(nom) * 2 ** ((voix.transposition ?? 0) / 12));

  // Calcule à l'avance toutes les cordes pincées du morceau, pour ne pas ralentir le jeu ensuite
  function prechargerCordes(voix) {
    const instrument = INSTRUMENTS[voix.instrument];
    if (!instrument?.corde) return;
    for (const { note } of voix.departs.values()) {
      for (const f of frequencesDe(voix, note)) {
        for (const h of instrument.harmoniques ?? [1]) cordePincee(f * h, instrument.corde);
      }
    }
  }

  function jouerNote(voix, note, t, duree) {
    const instrument = INSTRUMENTS[voix.instrument];
    const [attaque, declin, maintien, relache] = instrument.env;
    // Jeu « humain » : un peu plus ou moins fort, un poil en retard
    if (voix.humain) t += Math.random() * 0.008;
    const volume = voix.volume * (voix.humain ? 0.9 + Math.random() * 0.2 : 1);
    const fin = t + duree + relache * 2;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + attaque);
    gain.gain.setTargetAtTime(volume * maintien, t + attaque, declin / 3);
    gain.gain.setTargetAtTime(0, t + Math.max(duree, attaque), relache / 3);
    gain.connect(voix.entree);
    const frequences = frequencesDe(voix, note);
    // Glissé depuis la note précédente (notes seules uniquement, et seulement si l'écart est petit)
    const precedente = voix.precedente;
    const depart = voix.glisse && frequences.length === 1 && precedente && Math.abs(Math.log2(precedente / frequences[0])) < 0.6 ? precedente : null;
    voix.precedente = frequences[0];
    frequences.forEach((f, i) => {
      const decalage = i * (voix.grattage ?? 0);
      instrument.creer(f, t + decalage, fin + decalage, gain, { desaccord: voix.desaccord ?? 0, depart, glisse: voix.glisse, duree });
    });
  }

  let sortie = null;
  let entreeReverberation = null;
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

  // Réverbération stéréo : courte pré-réverbération, puis queue de 2,5 s adoucie dans l'aigu
  function creerReverberation() {
    const longueur = Math.floor(audio.sampleRate * 2.5);
    const impulsion = audio.createBuffer(2, longueur, audio.sampleRate);
    for (let canal = 0; canal < 2; canal++) {
      const d = impulsion.getChannelData(canal);
      for (let i = 0; i < longueur; i++) d[i] = (Math.random() * 2 - 1) * Math.exp((-i / audio.sampleRate) * 2.8);
    }
    const convolution = audio.createConvolver();
    convolution.buffer = impulsion;
    convolution.connect(filtre("lowpass", 6000, 0.5, dosageReverberation));
    const preDelai = audio.createDelay(0.1);
    preDelai.delayTime.value = 0.025;
    preDelai.connect(convolution);
    return preDelai;
  }

  function initialiser() {
    if (audio) return true;
    const Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) return false;
    audio = new Contexte();
    // Chaîne finale : égaliseur (graves et aigus un peu relevés), compresseur, puis limiteur
    const limiteur = audio.createDynamicsCompressor();
    limiteur.threshold.value = -3;
    limiteur.ratio.value = 20;
    limiteur.attack.value = 0.002;
    limiteur.connect(audio.destination);
    const compresseur = audio.createDynamicsCompressor();
    compresseur.threshold.value = -18;
    compresseur.ratio.value = 3;
    compresseur.connect(limiteur);
    const aigus = filtre("highshelf", 8000, 0.7, compresseur);
    aigus.gain.value = 2;
    const graves = filtre("lowshelf", 120, 0.7, aigus);
    graves.gain.value = 2;
    sortie = audio.createGain();
    sortie.connect(graves);
    dosageReverberation = audio.createGain();
    dosageReverberation.connect(sortie);
    entreeReverberation = creerReverberation();
    bruit = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const donnees = bruit.getChannelData(0);
    for (let i = 0; i < donnees.length; i++) donnees[i] = Math.random() * 2 - 1;
    return true;
  }

  function panoramique(valeur, dest) {
    if (!audio.createStereoPanner) return dest;
    const p = audio.createStereoPanner();
    p.pan.value = valeur;
    p.connect(dest);
    return p;
  }

  // Chaque voix a sa place dans la stéréo, part en direct et dans la réverbération,
  // et peut recevoir un chorus (deux copies légèrement retardées qui ondulent)
  function brancherVoix(voix, bpm) {
    const entree = audio.createGain();
    const bus = audio.createGain();
    bus.connect(sortie);
    bus.connect(entreeReverberation);
    entree.connect(panoramique(voix.pan ?? 0, bus));
    const lfos = [];
    const noeuds = [bus];
    if (voix.chorus) {
      for (const [retard, cote] of [[0.012, -0.7], [0.019, 0.7]]) {
        const delai = audio.createDelay(0.05);
        delai.delayTime.value = retard;
        const lfo = audio.createOscillator();
        lfo.frequency.value = 0.6 + retard * 25;
        lfo.connect(amplification(0.002, delai.delayTime));
        lfo.start();
        lfos.push(lfo);
        entree.connect(delai).connect(amplification(0.5, panoramique(cote, bus)));
      }
    }
    if (voix.echo) {
      // Écho en croche pointée qui rebondit de gauche à droite
      const temps = (60 / bpm) * 0.75;
      const gauche = audio.createDelay(2);
      const droite = audio.createDelay(2);
      gauche.delayTime.value = temps;
      droite.delayTime.value = temps;
      entree.connect(amplification(0.3, gauche));
      gauche.connect(amplification(0.35, droite));
      droite.connect(amplification(0.35, gauche));
      gauche.connect(panoramique(-0.8, bus));
      droite.connect(panoramique(0.8, bus));
      noeuds.push(gauche, droite);
    }
    return { ...voix, entree, lfos, noeuds };
  }

  // Programme les notes un peu en avance, pour un tempo régulier
  function programmer() {
    const dureePas = 60 / morceau.bpm / 4;
    while (prochainTemps < audio.currentTime + 0.12) {
      for (const voix of morceau.voix) {
        const depart = voix.departs.get(pas % voix.longueur);
        if (!depart) continue;
        if (voix.instrument === "batterie") jouerBatterie(depart.note, prochainTemps, voix);
        else jouerNote(voix, depart.note, prochainTemps, depart.duree * dureePas);
      }
      pas++;
      prochainTemps += dureePas;
    }
  }

  function arreter() {
    clearInterval(minuteur);
    minuteur = null;
    // Coupe ce qui reste (notes déjà programmées, échos, réverbération) en douceur, puis libère les effets
    if (morceau) {
      for (const voix of morceau.voix) {
        voix.entree.gain.setTargetAtTime(0, audio.currentTime, 0.05);
        for (const lfo of voix.lfos) lfo.stop(audio.currentTime + 0.5);
        setTimeout(() => voix.noeuds.forEach((n) => n.disconnect()), 3000);
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
    morceau = { bpm: choix.bpm, voix: choix.voix.map((v) => brancherVoix(preparerVoix(v), choix.bpm)) };
    morceau.voix.forEach(prechargerCordes);
    audio.resume();
    pas = 0;
    prochainTemps = audio.currentTime + 0.05;
    programmer();
    minuteur = setInterval(programmer, 25);
  }

  // En tâche de fond après l'ouverture de la page : contexte audio, réverbération et cordes
  // pincées des trois morceaux, une voix à la fois, pour un démarrage instantané des parties
  function preparer() {
    if (!active || !initialiser()) return;
    const voix = Object.values(MORCEAUX).flatMap((m) => m.voix.map(preparerVoix));
    const suivante = () => {
      const v = voix.shift();
      if (!v) return;
      prechargerCordes(v);
      setTimeout(suivante, 50);
    };
    setTimeout(suivante, 50);
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

  return { jouer, arreter, suspendre, basculer, preparer, estActive: () => active, MORCEAUX };
})();

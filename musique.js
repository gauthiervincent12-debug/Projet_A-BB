// Musiques « 32 bits » originales, une par difficulté, synthétisées avec la Web Audio API,
// dans l'esprit PlayStation / Saturn : cordes pincées simulées physiquement (Karplus-Strong),
// chorus, réverbération stéréo et compresseur final.
// L'ancienne version 16 bits est gardée dans musique-16bits.js (pour y revenir :
// charger ce fichier à la place de musique.js dans index.html).
//
// Chaque morceau : tempo (bpm), volume général, dose de réverbération et voix.
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "A3+C4+E4" = accord · "-" = la note continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "h" charleston (balais : jeu plus doux).
// Options d'une voix : pan (-1 gauche, 1 droite), chorus, transposition (demi-tons), desaccord (cents),
// grattage (secondes entre les cordes d'un accord).
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";
  const tenue = (note) => `${note} - - - - - - - - - - - - - - -`;
  // Jeu aux doigts : basse sur les temps 1 et 3, notes du milieu et de l'aigu entre deux
  const picking = (basse1, basse2, milieu, aigu) =>
    `${basse1} - ${aigu} - ${milieu} - ${aigu} - ${basse2} - ${aigu} - ${milieu} - ${aigu} -`;

  // Guitare grattée : bas sur 1, puis haut-bas en contretemps
  const grattage = (accord) => `${accord} - - - ${accord} - ${accord} - . . ${accord} - ${accord} - - -`;
  // Trémolo de mandoline : la même note répétée en doubles croches
  const tremolo = (a, b) => `${`${a} `.repeat(8)}${`${b} `.repeat(8)}`.trim();
  const ACCORDS = {
    G: "G2+D3+G3+B3", C: "C3+G3+C4+E4", D: "D3+A3+D4+F#4", Em: "E2+B2+E3+G3",
  };

  // Basse punk : fondamentale et quinte en croches, sur la grille G C G D Em C G/D G
  const croches = (r, q) => `${r} - ${r} - ${q} - ${r} - ${r} - ${r} - ${q} - ${r} -`;
  const BASSE_CELTIQUE = [
    croches("G2", "D3"), croches("C2", "G2"), croches("G2", "D3"), croches("D2", "A2"),
    croches("E2", "B2"), croches("C2", "G2"),
    "G2 - G2 - G2 - G2 - D2 - D2 - D2 - D2 -",
    croches("G2", "D3"),
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
    // Facile : « Feu de camp », folk acoustique un peu western
    facile: {
      bpm: 92,
      volume: 1.9,
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
          instrument: "contrebasse",
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
          balais: true,
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

    // Moyen : « Chope levée », punk celtique à reprendre en chœur
    moyen: {
      bpm: 104,
      volume: 1,
      reverberation: 0.25,
      voix: [
        {
          // Guitare acoustique grattée (les cordes de l'accord partent l'une après l'autre)
          instrument: "guitareFolk",
          volume: 0.09,
          pan: -0.35,
          grattage: 0.012,
          mesures: [
            grattage(ACCORDS.G), grattage(ACCORDS.C), grattage(ACCORDS.G), grattage(ACCORDS.D),
            grattage(ACCORDS.Em), grattage(ACCORDS.C),
            `${ACCORDS.G} - - - ${ACCORDS.G} - ${ACCORDS.G} - ${ACCORDS.D} - - - ${ACCORDS.D} - ${ACCORDS.D} -`,
            grattage(ACCORDS.G),
          ],
        },
        {
          // Flûte irlandaise : la mélodie à chanter en chœur
          instrument: "flutiau",
          volume: 0.11,
          pan: 0.2,
          mesures: [
            "D5 - - - B4 - D5 - G5 - - - F#5 - E5 -",
            "E5 - - - C5 - E5 - G5 - - - E5 - - -",
            "D5 - - - B4 - G4 - B4 - D5 - - - B4 -",
            "A4 - - - - - - - F#4 - A4 - D5 - - -",
            "E5 - - - G5 - E5 - D5 - B4 - - - G4 -",
            "C5 - - - E5 - G5 - E5 - - - C5 - - -",
            "D5 - - - B4 - G4 - A4 - - - F#4 - - -",
            "G4 - - - - - - - . . . . . . . .",
          ],
        },
        {
          // Basse et batterie entrent après 4 mesures d'intro
          instrument: "basse",
          volume: 0.22,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, ...BASSE_CELTIQUE.slice(4),
            ...BASSE_CELTIQUE,
          ],
        },
        {
          instrument: "batterie",
          volume: 0.9,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE,
            ...Array(11).fill("k . h . s . h . k . k . s . h ."),
            "k . h . s . h . s s s s s s s s",
          ],
        },
        {
          // Mandoline en trémolo et bourdon de cornemuse au deuxième passage
          instrument: "mandoline",
          volume: 0.05,
          pan: 0.4,
          chorus: true,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE,
            tremolo("B4", "D5"), tremolo("C5", "E5"), tremolo("B4", "G4"), tremolo("A4", "F#4"),
            tremolo("G4", "B4"), tremolo("C5", "G4"), tremolo("B4", "A4"), tremolo("G4", "D5"),
          ],
        },
        {
          instrument: "bourdon",
          volume: 0.05,
          mesures: [
            SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE, SILENCE,
            ...Array(8).fill(tenue("G2+D3")),
          ],
        },
      ],
    },

    // Difficile : « Coup de colère », riff lourd et rapide en ré grave
    difficile: {
      bpm: 126,
      volume: 0.8,
      reverberation: 0.12,
      voix: [
        // Deux guitares saturées un peu désaccordées, à gauche et à droite
        { instrument: "guitareSaturee", volume: 0.09, pan: -0.45, transposition: 12, mesures: RIFF_DIFFICILE },
        { instrument: "guitareSaturee", volume: 0.08, pan: 0.45, transposition: 12, desaccord: 12, mesures: RIFF_DIFFICILE },
        { instrument: "basseMetal", volume: 0.26, mesures: RIFF_DIFFICILE },
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
          instrument: "leadGuitare",
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

  // Synthèse FM : un modulateur fait vibrer la fréquence de la porteuse
  function fm(f, ratio, indexDebut, indexFin, dureeIndex, t, fin, dest) {
    const porteuse = oscillateur("sine", f, t, fin, dest);
    const indice = audio.createGain();
    indice.gain.setValueAtTime(indexDebut, t);
    indice.gain.exponentialRampToValueAtTime(Math.max(indexFin, 0.01), t + dureeIndex);
    oscillateur("sine", f * ratio, t, fin, indice);
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

  function jouerCorde(f, reglages, t, fin, dest, desaccord = 0) {
    const { tampon, frequenceReelle } = cordePincee(f, reglages);
    const source = audio.createBufferSource();
    source.buffer = tampon;
    source.playbackRate.value = (f / frequenceReelle) * 2 ** (desaccord / 1200);
    source.connect(dest);
    source.start(t);
    source.stop(Math.min(fin, t + tampon.duration));
  }

  let ondeHarmonica = null;

  // ---------- Instruments ----------
  // env : [attaque, déclin, niveau de maintien, relâche] en secondes (maintien entre 0 et 1).
  // corde : réglages Karplus-Strong ; harmoniques : notes jouées ensemble (1.5 = quinte).
  // creer(f, t, fin, dest, desaccord) branche les sources d'une note de fréquence f sur dest.

  const INSTRUMENTS = {
    guitareFolk: {
      env: [0.001, 3, 1, 0.3],
      corde: { brillance: 0.65, amortissement: 0.997, duree: 1.8 },
      creer(f, t, fin, dest) {
        const caisse = filtre("peaking", 220, 1, filtre("lowpass", 5500, 0.5, dest));
        caisse.gain.value = 4;
        jouerCorde(f, this.corde, t, fin, caisse);
      },
    },
    contrebasse: {
      env: [0.001, 3, 1, 0.25],
      corde: { brillance: 0.25, amortissement: 0.996, duree: 2 },
      creer(f, t, fin, dest) {
        jouerCorde(f, this.corde, t, fin, filtre("lowpass", 900, 0.8, amplification(1.6, dest)));
      },
    },
    // Harmonica : forme d'onde riche en harmoniques, souffle et vibrato
    harmonica: {
      env: [0.06, 0.4, 0.85, 0.15],
      creer(f, t, fin, dest) {
        if (!ondeHarmonica) {
          const harmoniques = [0, 1, 0.75, 0.55, 0.5, 0.32, 0.25, 0.16, 0.12, 0.08];
          ondeHarmonica = audio.createPeriodicWave(new Float32Array(harmoniques.length), new Float32Array(harmoniques));
        }
        const anche = filtre("bandpass", 1600, 0.7, dest);
        const oscs = [-5, 5].map((d) => {
          const o = oscillateur("sine", f, t, fin, anche, d);
          o.setPeriodicWave(ondeHarmonica);
          return o;
        });
        vibrato(oscs, f, t, fin, 0.012, 0.18);
        sourceBruit(t, fin, filtre("bandpass", f * 2, 2, amplification(0.05, dest)));
      },
    },
    // Basse électrique jouée au doigt
    basse: {
      env: [0.001, 3, 1, 0.08],
      corde: { brillance: 0.45, amortissement: 0.996, duree: 2 },
      creer(f, t, fin, dest) {
        const ampli = saturation(2, filtre("lowpass", 1400, 1.5, amplification(1.4, dest)));
        jouerCorde(f, this.corde, t, fin, ampli);
      },
    },
    // Mandoline : cordes doublées, très brillantes et courtes
    mandoline: {
      env: [0.001, 3, 1, 0.05],
      corde: { brillance: 0.9, amortissement: 0.994, duree: 0.8 },
      creer(f, t, fin, dest) {
        const table = filtre("peaking", 2500, 1, filtre("highpass", 250, 0.7, dest));
        table.gain.value = 5;
        for (const d of [-6, 6]) jouerCorde(f, this.corde, t, fin, table, d);
      },
    },
    // Flûte irlandaise (tin whistle) : son pur et aigu, souffle et petit vibrato
    flutiau: {
      env: [0.03, 0.3, 0.9, 0.08],
      creer(f, t, fin, dest) {
        const oscs = [oscillateur("sine", f, t, fin, dest), oscillateur("triangle", f, t, fin, amplification(0.3, dest), 5)];
        vibrato(oscs, f, t, fin, 0.008, 0.2);
        sourceBruit(t, fin, filtre("bandpass", f * 1.5, 3, amplification(0.04, dest)));
      },
    },
    // Bourdon de cornemuse : deux anches nasillardes tenues
    bourdon: {
      env: [0.4, 1, 1, 0.6],
      creer(f, t, fin, dest) {
        const nasal = filtre("bandpass", 900, 1.5, filtre("lowpass", 2500, 0.5, dest));
        for (const d of [-4, 4]) oscillateur("sawtooth", f, t, fin, nasal, d);
      },
    },
    // Guitare électrique saturée : accord de puissance (fondamentale, quinte, octave)
    guitareSaturee: {
      env: [0.001, 3, 1, 0.04],
      corde: { brillance: 0.9, amortissement: 0.998, duree: 2 },
      harmoniques: [1, 1.5, 2],
      creer(f, t, fin, dest, desaccord) {
        const baffle = filtre("peaking", 1800, 1.2, filtre("lowpass", 4200, 0.8, dest));
        baffle.gain.value = -5;
        const ampli = amplification(4, saturation(60, baffle));
        for (const h of this.harmoniques) jouerCorde(f * h, this.corde, t, fin, ampli, desaccord);
      },
    },
    basseMetal: {
      env: [0.001, 3, 1, 0.05],
      corde: { brillance: 0.55, amortissement: 0.997, duree: 2 },
      creer(f, t, fin, dest) {
        const ampli = amplification(2, saturation(5, filtre("lowpass", 1500, 1, dest)));
        jouerCorde(f, this.corde, t, fin, ampli);
      },
    },
    // Guitare solo saturée et tenue, avec vibrato
    leadGuitare: {
      env: [0.005, 0.5, 0.85, 0.12],
      creer(f, t, fin, dest) {
        const ampli = amplification(3, saturation(30, filtre("lowpass", 3800, 0.9, dest)));
        const oscs = [oscillateur("sawtooth", f, t, fin, ampli), oscillateur("square", f, t, fin, ampli, 8)];
        vibrato(oscs, f, t, fin, 0.012, 0.12);
      },
    },
  };

  // ---------- Batterie ----------

  function jouerBatterie(coup, t, voix) {
    const { volume, entree: dest, balais } = voix;
    if (coup === "k") {
      const corps = decroissance(volume * (balais ? 0.7 : 1), t, balais ? 0.25 : 0.4, dest);
      const osc = oscillateur("sine", 130, t, t + 0.41, corps);
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      oscillateur("triangle", 1100, t, t + 0.02, decroissance(volume * 0.25, t, 0.012, dest));
    } else if (coup === "s" && balais) {
      // Balais : un frottement doux plutôt qu'un claquement
      const g = audio.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume * 0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      g.connect(dest);
      sourceBruit(t, t + 0.31, filtre("bandpass", 3500, 0.5, g));
    } else if (coup === "s") {
      sourceBruit(t, t + 0.22, filtre("bandpass", 2500, 0.6, decroissance(volume * 0.6, t, 0.2, dest)));
      const ton = decroissance(volume * 0.3, t, 0.08, dest);
      oscillateur("triangle", 185, t, t + 0.09, ton);
      oscillateur("triangle", 330, t, t + 0.09, ton);
    } else if (coup === "h" && balais) {
      sourceBruit(t, t + 0.09, filtre("highpass", 6000, 0.7, decroissance(volume * 0.12, t, 0.08, dest)));
    } else if (coup === "h") {
      // Charleston métallique : six oscillateurs carrés désaccordés, filtrés dans l'aigu
      const metal = filtre("bandpass", 10000, 1, filtre("highpass", 7000, 0.7, decroissance(volume * 0.5, t, 0.06, dest)));
      for (const r of [2, 3, 4.16, 5.43, 6.79, 8.21]) oscillateur("square", 40 * r, t, t + 0.07, metal);
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
    const fin = t + duree + relache * 2;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(voix.volume, t + attaque);
    gain.gain.setTargetAtTime(voix.volume * maintien, t + attaque, declin / 3);
    gain.gain.setTargetAtTime(0, t + Math.max(duree, attaque), relache / 3);
    gain.connect(voix.entree);
    frequencesDe(voix, note).forEach((f, i) => {
      const decalage = i * (voix.grattage ?? 0);
      instrument.creer(f, t + decalage, fin + decalage, gain, voix.desaccord ?? 0);
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
    // Compresseur final : un son plus dense et homogène, sans saturer
    const compresseur = audio.createDynamicsCompressor();
    compresseur.threshold.value = -18;
    compresseur.ratio.value = 3;
    compresseur.connect(audio.destination);
    sortie = audio.createGain();
    sortie.connect(compresseur);
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
  function brancherVoix(voix) {
    const entree = audio.createGain();
    const bus = audio.createGain();
    bus.connect(sortie);
    bus.connect(entreeReverberation);
    entree.connect(panoramique(voix.pan ?? 0, bus));
    const lfos = [];
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
    return { ...voix, entree, lfos };
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
    // Coupe ce qui reste (notes déjà programmées, queue de réverbération) en douceur
    if (morceau) {
      for (const voix of morceau.voix) {
        voix.entree.gain.setTargetAtTime(0, audio.currentTime, 0.05);
        for (const lfo of voix.lfos) lfo.stop(audio.currentTime + 0.5);
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

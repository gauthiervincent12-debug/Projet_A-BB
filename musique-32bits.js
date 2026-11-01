// [Sauvegarde 32 bits — non chargée par le site] Musiques « 32 bits » originales, une par difficulté, synthétisées avec la Web Audio API,
// dans l'esprit PlayStation / Saturn : cordes pincées simulées physiquement (Karplus-Strong),
// chorus, réverbération stéréo et compresseur final.
// L'ancienne version 16 bits est gardée dans musique-16bits.js (pour y revenir :
// charger ce fichier à la place de musique.js dans index.html).
//
// Chaque morceau : tempo (bpm), volume général, dose de réverbération et voix.
// Chaque voix est une suite de mesures de 16 pas (doubles croches) :
//   "A4" = note jouée sur ce pas · "A3+C4+E4" = accord · "-" = la note continue · "." = silence
// Batterie : "k" grosse caisse · "s" caisse claire · "h" charleston · "t" tom · "c" crash
// (balais : jeu plus doux).
// Options d'une voix : pan (-1 gauche, 1 droite), chorus, transposition (demi-tons), desaccord (cents),
// grattage (secondes entre les cordes d'un accord).
// Chaque voix boucle sur sa propre longueur.

const Musique = (() => {
  const SILENCE = ". . . . . . . . . . . . . . . .";
  const silences = (n) => Array(n).fill(SILENCE);
  // Arpège en croches sur 8 notes
  const arpege = (...n) => n.map((note) => `${note} -`).join(" ");
  // Accord de puissance martelé : 1, 2 et 3e temps, avec rebond
  const martele = (r) => `${r} - - - ${r} - ${r} - ${r} - - - ${r} - ${r} -`;
  const blanches = (a, b = a) => `${a} - - - - - - - ${b} - - - - - - -`;
  const croches = (r) => `${r} - `.repeat(8).trim();

  // « Brume » : couplet en Dm Bb Gm A / Dm Bb F A
  const RACINES_BRUME = ["D2", "Bb1", "G1", "A1", "D2", "Bb1", "F1", "A1"];

  // « Vertige » : riffs en mi, gamme orientale (mi, fa, sol#, la, si, do, ré)
  const RIFF_VERTIGE = [
    "E2 . E2 E2 F2 . E2 . E2 . E2 E2 G#2 . F2 .",
    "E2 . E2 E2 F2 . E2 . E2 . E2 E2 G#2 . F2 .",
    "E2 . E2 E2 F2 . E2 . E2 . E2 E2 G#2 . F2 .",
    "E2 . E2 E2 F2 . E2 . A2 - G#2 - F2 - E2 -",
    blanches("C3", "B2"),
    blanches("A2", "G#2"),
    blanches("F2", "G#2"),
    "A2 - - - B2 - - - C3 - - - B2 - - -",
  ];

  // « Abîme » : riff très grave et syncopé, avec rebond
  const R1 = "A1 - . A1 . . A1 - . A1 Bb1 - . A1 . .";
  const R2 = "A1 - . A1 . . A1 - . C2 - B1 - Bb1 - .";
  const R3 = "D2 - . D2 . . D2 - . D2 Eb2 - . D2 . .";
  const R4 = "C2 - . C2 . . Bb1 - . Bb1 . . A1 - - -";
  const RIFF_ABIME = [...silences(4), R1, R2, R1, R3, R1, R2, R1, R4, R1, R2, R3, R4];

  const MORCEAUX = {
    // Facile : « Brume », ballade rock des années 90 : couplet clair, refrain saturé
    facile: {
      bpm: 84,
      volume: 1,
      reverberation: 0.35,
      voix: [
        {
          // Guitare claire arpégée, tout le long
          instrument: "guitareClaire",
          volume: 0.13,
          pan: -0.3,
          chorus: true,
          mesures: [
            arpege("D3", "A3", "D4", "F4", "A4", "F4", "D4", "A3"),
            arpege("Bb2", "F3", "Bb3", "D4", "F4", "D4", "Bb3", "F3"),
            arpege("G2", "D3", "G3", "Bb3", "D4", "Bb3", "G3", "D3"),
            arpege("A2", "E3", "A3", "C#4", "E4", "C#4", "A3", "E3"),
            arpege("D3", "A3", "D4", "F4", "A4", "F4", "D4", "A3"),
            arpege("Bb2", "F3", "Bb3", "D4", "F4", "D4", "Bb3", "F3"),
            arpege("F2", "C3", "F3", "A3", "C4", "A3", "F3", "C3"),
            arpege("A2", "E3", "A3", "C#4", "E4", "C#4", "A3", "E3"),
          ],
        },
        {
          // Guitares saturées : seulement au refrain
          instrument: "guitareSaturee",
          volume: 0.06,
          pan: 0.4,
          transposition: 12,
          mesures: [...silences(8), ...RACINES_BRUME.map(martele)],
        },
        {
          instrument: "basse",
          volume: 0.22,
          mesures: [...RACINES_BRUME.map((r) => blanches(r)), ...RACINES_BRUME.map(croches)],
        },
        {
          instrument: "batterie",
          volume: 0.8,
          mesures: [
            ...Array(7).fill("k . . . h . . . s . . . h . . ."),
            "k . . . h . . . s . s . s s s s",
            "c . h . s . h . k k h . s . h .",
            ...Array(6).fill("k . h . s . h . k k h . s . h ."),
            "k . h . s . h . k k h . s s s s",
          ],
        },
        {
          // Voix synthétique plaintive, au refrain
          instrument: "voixSynth",
          volume: 0.09,
          mesures: [
            ...silences(8),
            "A4 - - - - - F4 - E4 - D4 - - - - -",
            "F4 - - - - - D4 - F4 - G4 - - - - -",
            "Bb4 - - - A4 - G4 - - - F4 - G4 - - -",
            "A4 - - - - - - - E4 - - - C#4 - - -",
            "A4 - - - - - F4 - E4 - D4 - - - F4 -",
            "D5 - - - - - C5 - Bb4 - - - A4 - - -",
            "A4 - - - G4 - F4 - - - E4 - F4 - - -",
            "E4 - - - - - - - - - - - . . . .",
          ],
        },
      ],
    },

    // Moyen : « Vertige », metal alternatif nerveux aux sonorités orientales
    moyen: {
      bpm: 118,
      volume: 0.9,
      reverberation: 0.18,
      voix: [
        { instrument: "guitareSaturee", volume: 0.08, pan: -0.45, transposition: 12, mesures: RIFF_VERTIGE },
        { instrument: "guitareSaturee", volume: 0.07, pan: 0.45, transposition: 12, desaccord: 10, mesures: RIFF_VERTIGE },
        { instrument: "basseMetal", volume: 0.24, mesures: RIFF_VERTIGE },
        {
          // Couplet sur les toms, refrain qui frappe sur les cymbales
          instrument: "batterie",
          volume: 1,
          mesures: [
            "k . t . s . t k . k t . s . t t",
            "k . t . s . t k . k t . s . t t",
            "k . t . s . t k . k t . s . t t",
            "k . t . s . t k t t s s t t s s",
            "c . h . s . h . k . h k s . h .",
            "k . h . s . h . k . h k s . h .",
            "k . h . s . h . k . h k s . h .",
            "t t t t s s s s t t s s k . . .",
          ],
        },
        {
          instrument: "voixSynth",
          volume: 0.09,
          mesures: [
            ...silences(4),
            "E4 - - - F4 - G#4 - A4 - - - G#4 - F4 -",
            "E4 - - - - - - - D4 - E4 - F4 - - -",
            "G#4 - - - A4 - B4 - C5 - - - B4 - A4 -",
            "G#4 - - - F4 - - - E4 - - - - - - -",
          ],
        },
      ],
    },

    // Difficile : « Abîme », nu-metal grave : intro inquiétante puis riff lourd qui rebondit
    difficile: {
      bpm: 104,
      volume: 0.9,
      reverberation: 0.2,
      voix: [
        {
          // Intro en guitare claire, qui revient en pause toutes les 16 mesures
          instrument: "guitareClaire",
          volume: 0.2,
          chorus: true,
          mesures: [
            "A3 - . E4 - . A4 - . Bb4 - . A4 - E4 -",
            "A3 - . E4 - . A4 - . Bb4 - . A4 - E4 -",
            "A3 - . E4 - . A4 - . C5 - . Bb4 - A4 -",
            "A3 - . F4 - . E4 - . . . . . . . .",
            ...silences(12),
          ],
        },
        { instrument: "guitareSaturee", volume: 0.09, pan: -0.45, transposition: 12, mesures: RIFF_ABIME },
        { instrument: "guitareSaturee", volume: 0.08, pan: 0.45, transposition: 12, desaccord: 12, mesures: RIFF_ABIME },
        { instrument: "basseMetal", volume: 0.26, mesures: RIFF_ABIME },
        {
          instrument: "batterie",
          volume: 1.1,
          mesures: [
            "h . h . h . h . h . h . h . h .",
            "h . h . h . h . h . h . h . h .",
            "h . h . h . h . h . h . h h h h",
            "s . . . s . . . s . s . s s s s",
            "c . . k . . s . . k k . s . . .",
            ...Array(10).fill("k . . k . . s . . k k . s . h ."),
            "k . . k . . s . t t t t s s s s",
          ],
        },
        {
          instrument: "voixSynth",
          volume: 0.08,
          mesures: [
            ...silences(8),
            "E4 - - - - - - - F4 - E4 - - - - -",
            "C4 - - - - - - - B3 - C4 - D4 - - -",
            "E4 - - - - - - - F4 - - - E4 - D4 -",
            "C4 - - - Bb3 - - - A3 - - - - - - -",
            "E4 - - - - - - - F4 - E4 - - - - -",
            "C4 - - - - - - - B3 - C4 - D4 - - -",
            "E4 - - - - - - - F4 - - - E4 - D4 -",
            "C4 - - - Bb3 - - - A3 - - - - - - -",
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

  // ---------- Instruments ----------
  // env : [attaque, déclin, niveau de maintien, relâche] en secondes (maintien entre 0 et 1).
  // corde : réglages Karplus-Strong ; harmoniques : notes jouées ensemble (1.5 = quinte).
  // creer(f, t, fin, dest, desaccord) branche les sources d'une note de fréquence f sur dest.

  const INSTRUMENTS = {
    // Guitare électrique claire, son cristallin (à utiliser avec le chorus de la voix)
    guitareClaire: {
      env: [0.001, 3, 1, 0.25],
      corde: { brillance: 0.75, amortissement: 0.997, duree: 2 },
      creer(f, t, fin, dest) {
        const eclat = filtre("peaking", 3000, 1, filtre("lowpass", 5000, 0.7, dest));
        eclat.gain.value = 3;
        jouerCorde(f, this.corde, t, fin, eclat);
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
    // Voix synthétique (« ooh ») : dents de scie filtrées par trois formants, avec vibrato
    voixSynth: {
      env: [0.08, 0.4, 0.85, 0.25],
      creer(f, t, fin, dest) {
        const bouche = audio.createGain();
        for (const [frequence, q, niveau] of [[650, 4, 1], [1100, 6, 0.6], [2600, 8, 0.25]]) {
          bouche.connect(filtre("bandpass", frequence, q, amplification(niveau, dest)));
        }
        const oscs = [-6, 6].map((d) => oscillateur("sawtooth", f, t, fin, bouche, d));
        vibrato(oscs, f, t, fin, 0.012, 0.25);
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
    } else if (coup === "t") {
      // Tom : un son grave qui descend, avec un peu de peau
      const peau = oscillateur("sine", 150, t, t + 0.4, decroissance(volume * 0.8, t, 0.38, dest));
      peau.frequency.setValueAtTime(150, t);
      peau.frequency.exponentialRampToValueAtTime(85, t + 0.25);
      sourceBruit(t, t + 0.06, filtre("bandpass", 500, 1, decroissance(volume * 0.2, t, 0.05, dest)));
    } else if (coup === "c") {
      // Cymbale crash (avec la grosse caisse) : longue queue métallique
      jouerBatterie("k", t, voix);
      sourceBruit(t, t + 1.5, filtre("highpass", 4500, 0.6, decroissance(volume * 0.3, t, 1.4, dest)));
      const metal = filtre("bandpass", 8000, 0.8, decroissance(volume * 0.18, t, 1.1, dest));
      for (const r of [2.3, 3.7, 5.1, 6.6, 8.4]) oscillateur("square", 60 * r, t, t + 1.2, metal);
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

// audio.js
// "Convergência Melancólica" — Fusão das duas versões
// Começa rítmica e suave, termina lenta, introspectiva e profunda

window.AudioAPI = (function () {
    let musicStarted = false;

    // --- EFEITOS GLOBAIS ---
    const reverb = new Tone.Reverb({ decay: 6.5, wet: 0.4 }).toDestination();
    const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.25 }).connect(reverb);
    const filter = new Tone.AutoFilter({ frequency: "2m", baseFrequency: 200, octaves: 3 }).connect(reverb).start();

    // --- INSTRUMENTOS ---
    const bass = new Tone.MonoSynth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 1 }
    }).connect(filter);
    bass.volume.value = -10;

    const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.3, release: 1.5 }
    }).connect(delay);
    pad.volume.value = -13;

    const kick = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 9,
        oscillator: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.4, sustain: 0.05, release: 1.2 }
    }).connect(reverb);
    kick.volume.value = -9;

    const hat = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
    }).connect(delay);
    hat.volume.value = -26;

    const ambience = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 2, decay: 2, sustain: 0.6, release: 5 }
    }).connect(reverb);
    ambience.volume.value = -24;

    const sub = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.05, decay: 0.4, sustain: 0.3, release: 0.8 }
    }).connect(filter);
    sub.volume.value = -16;

    // --- SEQUÊNCIAS (INÍCIO RÍTMICO) ---
    const bassIntro = new Tone.Sequence((time, note) => {
        if (note) bass.triggerAttackRelease(note, "2n", time);
    }, ["A2", "G2", "C3", "F2"], "2n");

    const padIntro = new Tone.Sequence((time, note) => {
        if (note) pad.triggerAttackRelease(note, "1n", time);
    }, ["E4", null, "D4", null, "C4", null, "E4", null], "4n");

    const kickIntro = new Tone.Sequence((time, note) => {
        if (note) kick.triggerAttackRelease(note, "8n", time);
    }, ["C1", null, null, ["C1", "C1"], null, null, "C1", null], "8n");

    const hatIntro = new Tone.Sequence((time, note) => {
        if (note) hat.triggerAttackRelease("16n", time);
    }, [null, "C4", null, "C4", null, "C4", null, "C4"], "8n");

    // --- SEQUÊNCIAS (TRANSIÇÃO / PARTE FINAL) ---
    const bassDeep = new Tone.Sequence((time, note) => {
        if (note) bass.triggerAttackRelease(note, "1n", time);
    }, ["A2", null, "F2", null, "C3", null, "G2", null], "2n");

    const padDeep = new Tone.Sequence((time, note) => {
        if (note) pad.triggerAttackRelease(note, "2n", time);
    }, ["E4", null, "D4", null, "C4", "A3", "F4", null], "2n");

    const kickDeep = new Tone.Sequence((time, note) => {
        if (note) kick.triggerAttackRelease(note, "8n", time);
    }, [
        "C1", null, null, null,
        null, "C1", null, null,
        null, null, "C1", null,
        null, ["C1"], null, null
    ], "8n");

    const hatDeep = new Tone.Sequence((time, note) => {
        if (note) {
            hat.volume.value = -26 + (Math.random() * 1 - 0.5);
            hat.triggerAttackRelease("16n", time);
        }
    }, [null, "C4", null, "C4", null, null, "C4", null], "8n");

    const ambienceLoop = new Tone.Loop((time) => {
        ambience.triggerAttackRelease("E5", "2m", time);
    }, "12m");

    const subLoop = new Tone.Loop((time) => {
        sub.triggerAttackRelease("A1", "1m", time);
    }, "16m");

    // --- CONTROLE / TRANSIÇÃO ---
    async function startMusic() {
        if (musicStarted) return;
        await Tone.start();
        Tone.Transport.bpm.value = 86;
        Tone.Transport.start("+0.1");

        // Fase 1 — ritmo leve
        bassIntro.start(0);
        padIntro.start(0);
        kickIntro.start(0);
        hatIntro.start(0);

        // Fase 2 — transição (8 compassos depois)
        Tone.Transport.scheduleOnce(() => {
            bassIntro.stop();
            padIntro.stop();
            kickIntro.stop();
            hatIntro.stop();

            bassDeep.start("+0.1");
            padDeep.start("+0.1");
            kickDeep.start("+0.1");
            hatDeep.start("+0.1");
            ambienceLoop.start("+0.1");
            subLoop.start("+0.1");

            // Reverb aumenta gradualmente, filtro abre, BPM cai
            reverb.wet.rampTo(0.55, 16);
            Tone.Transport.bpm.rampTo(80, 32);
        }, "8m");

        // Fade-in suave global
        Tone.getDestination().volume.rampTo(-3, 8);

        musicStarted = true;
    }

    async function resumeOnGesture() {
        if (Tone.context.state === "suspended") {
            try { await Tone.start(); } catch (e) { }
        }
    }

    // --- SFX ---
    const sfxSynths = {
        click: new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.08, sustain: 0.01, release: 0.05 } }).toDestination(),
        hit: new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.005, decay: 0.08, sustain: 0.01, release: 0.05 } }).toDestination(),
        damage: new Tone.MembraneSynth({ envelope: { attack: 0.01, decay: 0.1, sustain: 0.01, release: 0.1 } }).toDestination(),
        page: new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.08, sustain: 0.01, release: 0.05 } }).toDestination()
    };
    sfxSynths.click.volume.value = -15;
    sfxSynths.hit.volume.value = -10;
    sfxSynths.damage.volume.value = -8;
    sfxSynths.page.volume.value = -15;

    function sfx(type = "click") {
        try {
            if (musicStarted) {
                if (type === "click") sfxSynths.click.triggerAttackRelease("G4", "8n");
                else if (type === "hit") sfxSynths.hit.triggerAttackRelease("C5", "8n");
                else if (type === "damage") sfxSynths.damage.triggerAttackRelease("C2", "16n");
                else if (type === "page") sfxSynths.page.triggerAttackRelease("B4", "12n");
                return;
            }
        } catch (e) { }
    }

    return { startMusic, resumeOnGesture, sfx };
})();

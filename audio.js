// audio.js
// Versão aprimorada: mantém o tema base e adiciona camadas (piano, cordas, reverb, chorus, arpeggio)
// Exports: AudioAPI.startMusic(), AudioAPI.sfx(type), AudioAPI.setMusicVolume(v), AudioAPI.setSFXVolume(v), AudioAPI.toggleMusic()

window.AudioAPI = (function () {
    let musicStarted = false;
    const master = new Tone.Volume(-6).toDestination();
    const musicVol = new Tone.Volume(-6).connect(master);
    const sfxVol = new Tone.Volume(0).connect(master);

    // Reverb and spatial
    const reverb = new Tone.Reverb({ decay: 4.2, preDelay: 0.2 }).toDestination();
    const chorus = new Tone.Chorus(4, 2.5, 0.5).start().connect(musicVol);

    // Bass (keeps original motif)
    const bass = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 1 },
        envelope: { attack: 0.06, decay: 0.25, sustain: 0.4, release: 1 }
    }).connect(musicVol);

    // Pad (sustained ambient)
    const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 1.5, decay: 2.5, sustain: 0.6, release: 5 }
    }).connect(musicVol);

    // Piano-ish tone for melancholy motif (use sampler-like synth)
    const bell = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 1.5, sustain: 0.2, release: 2 }
    }).connect(musicVol);

    // Soft strings (long sustains)
    const strings = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.5, decay: 1.5, sustain: 0.5, release: 4 }
    }).connect(reverb);

    // Arpeggio (light) — using a repeating sequence
    const arpSynth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.02, release: 0.6 } }).connect(musicVol);

    // Volume scalers (master control)
    function setMusicVolume(v) {
        // v expected 0..1
        musicVol.volume.rampTo(Tone.gainToDb(Math.max(v, 0.001)), 0.3);
    }
    function setSFXVolume(v) {
        sfxVol.volume.rampTo(Tone.gainToDb(Math.max(v, 0.001)), 0.2);
    }

    // sequences
    const bassSeq = new Tone.Sequence((time, note) => {
        if (note) bass.triggerAttackRelease(note, '2n', time);
    }, ['A2', 'G2', 'C3', 'F2'], '1m');

    const padSeq = new Tone.Sequence((time, chord) => {
        if (chord) pad.triggerAttackRelease(chord, '2m', time);
    }, [['A3', 'E4', 'C4'], null, ['G3', 'D4', 'B3'], null], '2m');

    const bellSeq = new Tone.Part((time, note) => {
        if (note) bell.triggerAttackRelease(note, '1n', time);
    }, [
        [0, 'E4'], ['0:2', null], ['0:3', 'G4'], ['0:3:2', null],
        ['1:0', 'A4'], ['1:2', null], ['1:3', 'G4']
    ]);
    bellSeq.loop = true;
    bellSeq.loopEnd = '2m';

    // arp pattern variable
    const arpPattern = ['E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4'];
    const arpSeq = new Tone.Sequence((time, note) => {
        if (note) arpSynth.triggerAttackRelease(note, '8n', time);
    }, arpPattern, '8n');
    arpSeq.humanize = 0.02;

    // dynamic subtle swells
    const padLFO = new Tone.LFO(0.05, 0.8, 1.0).start();
    padLFO.connect(pad.volume);

    // start music (must be called after user gesture)
    async function startMusic() {
        if (musicStarted) return;
        await Tone.start();
        // route some nodes to reverb/chorus appropriately
        pad.connect(chorus);
        strings.connect(reverb);
        // start transport & sequences
        bassSeq.loop = true; bassSeq.start(0);
        padSeq.loop = true; padSeq.start(0);
        bellSeq.start(0);
        arpSeq.start(0);
        Tone.Transport.bpm.value = 60; // slow, melancholic
        Tone.Transport.start();
        musicStarted = true;
        setMusicVolume(0.6);
        setSFXVolume(0.9);
    }

    // resume helper
    async function resumeOnGesture() {
        if (Tone.context.state === 'suspended') {
            try { await Tone.start(); } catch (e) { }
        }
    }

    // music toggle
    function toggleMusic() {
        if (!musicStarted) { startMusic().catch(() => { }); return; }
        if (Tone.Transport.state === 'started') { Tone.Transport.pause(); } else { Tone.Transport.start(); }
    }

    // SFX generator (uses sfxVol)
    function sfx(type = 'click') {
        try {
            if (Tone.context.state === 'suspended') { Tone.start().catch(() => { }); }
            // prefer short synths connected to sfxVol
            if (type === 'click') {
                const s = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.002, decay: 0.08, sustain: 0.01, release: 0.05 } }).connect(sfxVol);
                s.triggerAttackRelease('G4', '8n');
                setTimeout(() => s.dispose(), 300);
            } else if (type === 'hit') {
                const s = new Tone.MembraneSynth().connect(sfxVol);
                s.triggerAttackRelease('C3', '16n');
                setTimeout(() => s.dispose(), 300);
            } else if (type === 'damage') {
                const s = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(sfxVol);
                s.triggerAttackRelease('16n');
                setTimeout(() => s.dispose(), 300);
            } else if (type === 'page') {
                const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.12, sustain: 0.01, release: 0.06 } }).connect(sfxVol);
                s.triggerAttackRelease('B4', '12n');
                setTimeout(() => s.dispose(), 300);
            } else {
                const s = new Tone.Synth().connect(sfxVol);
                s.triggerAttackRelease('C4', '8n');
                setTimeout(() => s.dispose(), 300);
            }
        } catch (e) {
            // fallback naive beep
            try {
                const aCtx = new (window.AudioContext || window.webkitAudioContext)();
                const o = aCtx.createOscillator();
                const g = aCtx.createGain();
                o.connect(g); g.connect(aCtx.destination);
                o.type = 'sine'; o.frequency.value = 440; g.gain.value = 0.05; o.start(); o.stop(aCtx.currentTime + 0.08);
            } catch (er) { }
        }
    }

    // public API
    return {
        startMusic,
        resumeOnGesture,
        sfx,
        setMusicVolume,
        setSFXVolume,
        toggleMusic
    };
})();

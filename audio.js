// audio.js
// Centraliza a trilha e SFX (usa Tone.js)

window.AudioAPI = (function () {
    let musicStarted = false;

    // simple synths
    const bass = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.3, release: 0.5 }
    }).toDestination();

    const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 1 }
    }).toDestination();

    bass.volume.value = -12;
    pad.volume.value = -10;

    const bassSeq = new Tone.Sequence((time, note) => {
        if (note) bass.triggerAttackRelease(note, '2n', time);
    }, ['A2', 'G2', 'C3', 'F2'], '1m');

    const padSeq = new Tone.Sequence((time, note) => {
        if (note) pad.triggerAttackRelease(note, '1n', time);
    }, ['E3', null, 'D3', null], '1m');

    bassSeq.loop = padSeq.loop = true;

    async function startMusic() {
        if (musicStarted) return;
        await Tone.start();
        Tone.Transport.start();
        bassSeq.start(0);
        padSeq.start(0);
        musicStarted = true;
    }

    // resume audio on user gesture (call once on first user input)
    async function resumeOnGesture() {
        if (Tone.context.state === 'suspended') {
            try { await Tone.start(); } catch (e) { /* ignore */ }
        }
    }

    // SFX: lightweight functions using WebAudio (fallback) to avoid ScriptProcessor usage
    function sfx(type = 'click') {
        try {
            // Prefer Tone for short SFX to keep everything in same context
            if (!musicStarted) {
                // create a quick synth, dispose after play
                const synth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.08, sustain: 0.01, release: 0.05 } }).toDestination();
                if (type === 'click') { synth.triggerAttackRelease('G4', '8n'); }
                else if (type === 'hit') { synth.triggerAttackRelease('C5', '8n'); }
                else if (type === 'damage') { synth.triggerAttackRelease('E3', '16n'); }
                else if (type === 'page') { synth.triggerAttackRelease('B4', '16n'); }
                setTimeout(() => { synth.dispose(); }, 300);
                return;
            }
            // if music running, use short synths on global context
            if (type === 'click') { const s = new Tone.Synth().toDestination(); s.triggerAttackRelease('G4', '8n'); s.dispose(); }
            else if (type === 'hit') { const s = new Tone.Synth({ oscillator: { type: 'square' } }).toDestination(); s.triggerAttackRelease('C5', '8n'); s.dispose(); }
            else if (type === 'damage') { const s = new Tone.MembraneSynth().toDestination(); s.triggerAttackRelease('C2', '16n'); s.dispose(); }
            else if (type === 'page') { const s = new Tone.Synth().toDestination(); s.triggerAttackRelease('B4', '12n'); s.dispose(); }
        } catch (e) {
            // last-resort WebAudio beep
            try {
                const aCtx = new (window.AudioContext || window.webkitAudioContext)();
                const o = aCtx.createOscillator();
                const g = aCtx.createGain();
                o.connect(g); g.connect(aCtx.destination);
                if (type === 'click') { o.type = 'triangle'; o.frequency.value = 400; g.gain.value = 0.06; o.start(); o.stop(aCtx.currentTime + 0.08); }
                else if (type === 'hit') { o.type = 'square'; o.frequency.value = 600; g.gain.value = 0.09; o.start(); o.stop(aCtx.currentTime + 0.12); }
                else { o.type = 'sine'; o.frequency.value = 300; g.gain.value = 0.05; o.start(); o.stop(aCtx.currentTime + 0.12); }
            } catch (err) { /* ignore */ }
        }
    }

    return {
        startMusic,
        resumeOnGesture,
        sfx
    };
})();

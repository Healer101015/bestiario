// ui.js
// Gerencia todas as interações de UI fora do canvas (VN, Bestiário, Log)

// --- Log Helper (Exposto Globalmente) ---
let logEl;
window.log = function (msg, color = '#cfe8ff') {
    if (!logEl) logEl = document.getElementById('log');
    if (!logEl) return;
    const t = new Date().toLocaleTimeString();
    logEl.innerHTML = `<div style="color:${color};font-family:monospace">[${t}] ${msg}</div>` + logEl.innerHTML;
};

// --- Visual Novel (VN) & Interlude ---
let vnQueue = [];
function playVN(lines, onComplete) {
    const vnContainer = document.getElementById('vnContainer');
    const vnNext = document.getElementById('vnNext');
    const vnSkip = document.getElementById('vnSkip');
    if (!vnContainer || !vnNext || !vnSkip) return;

    vnQueue = lines.slice();
    vnContainer.style.display = 'block';
    vnNext.onclick = () => vnStep(onComplete);
    vnSkip.onclick = () => { vnContainer.style.display = 'none'; vnQueue = []; if (onComplete) onComplete(); };
    vnContainer.style.display = 'block';
    vnStep(onComplete);
}

function vnStep(onComplete) {
    const vnContainer = document.getElementById('vnContainer');
    const vnSpeaker = document.getElementById('vnSpeaker');
    const vnPortrait = document.getElementById('vnPortrait');
    if (!vnContainer || !vnSpeaker || !vnPortrait) return;

    if (vnQueue.length === 0) {
        vnContainer.style.display = 'none';
        if (onComplete) onComplete();
        return;
    }
    const it = vnQueue.shift();
    vnSpeaker.textContent = it.speaker || '';
    typeWriter(it.text, document.getElementById('vnText'));
    vnPortrait.style.backgroundImage = "url('assets/images/lasthero.png')";
    if (window.AudioAPI) window.AudioAPI.sfx('page');
}

let typeWriterTimeout;
function typeWriter(text, el, speed = 18) {
    if (!el) return;
    if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
    el.innerHTML = '';
    let i = 0;
    (function step() {
        if (i <= text.length) {
            el.innerHTML = text.slice(0, i) + (i % 2 ? '▌' : '');
            i++;
            typeWriterTimeout = setTimeout(step, speed);
        } else {
            el.innerHTML = text;
            typeWriterTimeout = null;
        }
    })();
}

function playInterlude(text, onComplete) {
    const interludeBox = document.getElementById('interludeBox');
    const interludeText = document.getElementById('interludeText');
    const interludeContinue = document.getElementById('interludeContinue');
    if (!interludeBox || !interludeText || !interludeContinue) return;

    interludeText.textContent = text;
    interludeBox.classList.remove('hidden');
    interludeBox.style.display = 'block';
    interludeContinue.onclick = () => { interludeBox.style.display = 'none'; if (onComplete) onComplete(); };
}

// --- Bestiary UI ---
function refreshBestiary() {
    const bestiaryList = document.getElementById('bestiaryList');
    const bestiaryPreview = document.getElementById('bestiaryPreview');
    if (!bestiaryList || !bestiaryPreview) return;

    bestiaryList.innerHTML = '';
    const unique = {};
    Object.values(BESTIARY).forEach(b => unique[b.id] = b);
    if (window._GAME && window._GAME.state && window._GAME.state.discovered) {
        window._GAME.state.discovered.forEach(item => {
            if (!item) return;
            if (typeof item === 'string') {
                const key = item;
                if (BESTIARY[key]) unique[key] = BESTIARY[key];
            } else if (typeof item === 'object' && item.id) {
                unique[item.id] = { ...(BESTIARY[item.id] || {}), ...item };
            }
        });
    }

    Object.values(unique).forEach(b => {
        const el = document.createElement('div');
        el.className = 'bestiary-entry';
        el.style.background = '#fff7e8';
        el.style.padding = '8px';
        el.style.borderRadius = '8px';
        el.style.color = '#2b2b28';
        const snippet = (b.notes && b.notes[0]) ? b.notes[0] : (b.phases && b.phases[0] && b.phases[0].description) || '';
        const pattern = (b.phases && b.phases[0] && b.phases[0].pattern) ? b.phases[0].pattern : (b.pattern || []);
        el.innerHTML = `<strong>${b.name}</strong><div style="font-size:13px;color:#555;margin-top:6px">${snippet}</div>
        <div style="margin-top:8px"><small>Padrões:</small><div style="margin-top:6px">${pattern.map(p => `<span class="pattern-pill">${p}</span>`).join('')}</div></div>`;
        el.style.cursor = 'pointer';
        el.onclick = () => showBestiaryPreview(b);
        bestiaryList.appendChild(el);
    });
    bestiaryPreview.innerHTML = '<em>Selecione uma entrada para ver detalhes e notas</em>';
}

function showBestiaryPreview(b) {
    const bestiaryPreview = document.getElementById('bestiaryPreview');
    if (!bestiaryPreview) return;

    const notesHtml = (b.notes || []).map(n => `<div style="margin-bottom:6px;font-style:italic">${n}</div>`).join('');
    const phasesHtml = (b.phases || []).map((p, i) => `<div style="margin-top:8px"><strong>Fase ${i + 1}</strong><div style="font-style:italic">${p.description}</div><div style="margin-top:6px">${p.pattern.map(x => `<span class="pattern-pill">${x}</span>`).join('')}</div></div>`).join('<hr/>');
    let imgHtml = '';

    const bossImages = (window.GameAssets && window.GameAssets.bossImages) ? window.GameAssets.bossImages : {};

    if (b.id && bossImages[b.id] && bossImages[b.id].loaded) {
        imgHtml = `<div style="margin-top:8px"><img src="${bossImages[b.id].img.src}" style="width:100%;border-radius:6px" /></div>`;
    } else if (b.img) {
        imgHtml = `<div style="margin-top:8px"><img src="${b.img}" style="width:100%;border-radius:6px" onerror="this.style.display='none'"/></div>`;
    }

    bestiaryPreview.innerHTML = `<h4>${b.name}</h4>${imgHtml}${notesHtml}<hr/>${phasesHtml}<div style="margin-top:10px"><button id="spawnFromBest">Enfrentar</button></div>`;

    const spawnBtn = document.getElementById('spawnFromBest');
    if (!spawnBtn) return;

    spawnBtn.onclick = () => {
        closeBestiary();
        const bossData = BESTIARY[b.id];
        if (!bossData) {
            log(`Erro: Não foi possível encontrar dados para o chefe ${b.id}`, '#ff6b6b');
            return;
        }
        const clone = JSON.parse(JSON.stringify(bossData));
        clone.isProcedural = (b.id && typeof b.id === 'string' && b.id.startsWith && b.id.startsWith('RANDOM_'));

        if (window._GAME && window._GAME.loadBoss) {
            window._GAME.loadBoss(clone);
            if (window.AudioAPI) window.AudioAPI.sfx('page');
            window._GAME.state.mode = 'playing';
            updateModeLabel();
            setUIEnabled(true);
        } else {
            log('Erro: Núcleo do jogo não disponível.', '#ff6b6b');
        }
    };
}

function closeBestiary() {
    const bestiaryModal = document.getElementById('bestiaryModal');
    if (bestiaryModal) bestiaryModal.classList.add('hidden');
}

// --- UI Helpers ---
function renderPattern() {
    const patternContainer = document.getElementById('patternContainer');
    if (!patternContainer) return;

    patternContainer.innerHTML = '';
    if (window._GAME && window._GAME.state && window._GAME.state.inputs) {
        window._GAME.state.inputs.forEach(a => {
            const s = document.createElement('span'); s.className = 'pattern-pill'; s.textContent = a;
            patternContainer.appendChild(s);
        });
    }
}

function updateModeLabel() {
    const modeLabel = document.getElementById('modeLabel');
    if (!modeLabel) return;
    if (window._GAME && window._GAME.state) {
        const mode = window._GAME.state.mode;
        modeLabel.textContent = mode === 'vn' ? 'Visual Novel' : mode === 'playing' ? 'Combate' : mode === 'arena' ? 'Arena' : mode === 'gameover' ? 'Game Over' : 'Intro';
    }
}

function setUIEnabled(enabled) {
    const executarBtn = document.getElementById('executarAcao');
    const resetBtn = document.getElementById('resetPattern');
    const openBestBtn = document.getElementById('openBest');
    const nextBossBtn = document.getElementById('nextBoss');
    if (openBestBtn) openBestBtn.disabled = !enabled;
    if (executarBtn) executarBtn.disabled = !enabled;
    if (resetBtn) resetBtn.disabled = !enabled;
    if (nextBossBtn) nextBossBtn.style.display = (window._GAME && window._GAME.state && window._GAME.state.mode === 'arena' && enabled) ? 'inline-block' : 'none';
}

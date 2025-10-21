// game.js
// Versão ampliada: VN extensa, bestiário ampliado e gameplay polido
(function () {
    // DOM refs
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const logEl = document.getElementById('log');
    const patternContainer = document.getElementById('patternContainer');
    const vnContainer = document.getElementById('vnContainer');
    const vnText = document.getElementById('vnText');
    const vnSpeaker = document.getElementById('vnSpeaker');
    const vnPortrait = document.getElementById('vnPortrait');
    const vnNext = document.getElementById('vnNext');
    const vnSkip = document.getElementById('vnSkip');
    const vnAuto = document.getElementById('vnAuto');
    const interludeBox = document.getElementById('interludeBox');
    const interludeText = document.getElementById('interludeText');
    const interludeContinue = document.getElementById('interludeContinue');
    const bestiaryModal = document.getElementById('bestiaryModal');
    const bestiaryList = document.getElementById('bestiaryList');
    const bestiaryPreview = document.getElementById('bestiaryPreview');
    const openBestBtn = document.getElementById('openBest');
    const closeBestBtn = document.getElementById('closeBest');
    const bestiarySearch = document.getElementById('bestiarySearch');
    const bestiaryPager = document.getElementById('bestiaryPager');
    const openVNBtn = document.getElementById('openVN');
    const executarBtn = document.getElementById('executarAcao');
    const resetBtn = document.getElementById('resetPattern');
    const nextBossBtn = document.getElementById('nextBoss');
    const modeLabel = document.getElementById('modeLabel');
    const btnToggleMusic = document.getElementById('btnToggleMusic');
    const musicVolEl = document.getElementById('musicVol');
    const sfxVolEl = document.getElementById('sfxVol');
    const accessSub = document.getElementById('accessSub');
    const chapterLabel = document.getElementById('chapterLabel');

    // on-screen controls
    const onScreen = {
        up: document.getElementById('btn-up'),
        down: document.getElementById('btn-down'),
        left: document.getElementById('btn-left'),
        right: document.getElementById('btn-right'),
        attack: document.getElementById('btn-attack'),
        special: document.getElementById('btn-special')
    };

    // audio API reference
    const Audio = window.AudioAPI;

    // tiny logger
    function log(msg, color = '#cfe8ff') {
        const t = new Date().toLocaleTimeString();
        logEl.innerHTML = `<div style="color:${color};font-family:monospace">[${t}] ${msg}</div>` + logEl.innerHTML;
    }

    /* ===========================
       BESTIARY / BOSSES DATA
       =========================== */
    const BESTIARY = {
        HARPY: {
            id: 'HARPY', name: 'Harpia das Ruínas', region: 'Ruínas', attackDamage: 1,
            img: 'assets/images/harpy.png',
            phases: [
                { hpThreshold: 0.66, description: 'Voa entre pilares e mergulha. Observe o bater das asas.', pattern: ['left', 'right', 'up'] },
                { hpThreshold: 0.33, description: 'Enfurecida, rasga o céu.', pattern: ['left', 'down', 'right', 'up'] }
            ],
            notes: [
                "Página 3 — Os olhos eram como janelas quebradas das ruínas.",
                "Tentei recuar e contornar durante o mergulho; falhei na primeira vez."
            ]
        },
        FIRE_SERPENT: {
            id: 'FIRE_SERPENT', name: 'Serpente de Fogo', region: 'Pântano', attackDamage: 1,
            img: 'assets/images/fire_serpent.png',
            phases: [
                { hpThreshold: 0.6, description: 'Rastro de chamas no chão. Agachar para evitar.', pattern: ['down', 'down', 'attack'] },
                { hpThreshold: 0.2, description: 'Cospe bolas de fogo; salte antes de atacar.', pattern: ['up', 'down', 'attack'] }
            ],
            notes: [
                "Página 12 — O calor é sufocante. Meus registros ficam borrados."
            ]
        },
        GOLEM: {
            id: 'GOLEM', name: 'Golem de Magma', region: 'Vulcão', attackDamage: 2,
            img: 'assets/images/golem.png',
            phases: [
                { hpThreshold: 0.5, description: 'Lento, mas devastador. Salte sobre a onda e ataque o núcleo.', pattern: ['right', 'up', 'attack', 'attack'] },
                { hpThreshold: 0, description: 'Núcleo superaquecido; sequência perigosa.', pattern: ['right', 'up', 'special', 'attack', 'attack'] }
            ],
            notes: [
                "Página 7 — Rompi meu escudo tentando partir seu peito. O ferro queimou meus dedos."
            ]
        },
        ICE_SPECTER: {
            id: 'ICE_SPECTER', name: 'Espectro Gélido', region: 'Montanhas', attackDamage: 1,
            img: 'assets/images/ice_specter.png',
            phases: [
                { hpThreshold: 0.6, description: 'Forma etérea, use especial para quebrar.', pattern: ['special', 'left', 'right'] },
                { hpThreshold: 0.2, description: 'Fragmentos ao cair; mova-se rápido.', pattern: ['special', 'left', 'up', 'right'] }
            ],
            notes: [
                "Página 16 — Um silêncio cortante. Apenas o vento retornou minha voz."
            ]
        },
        LICH: {
            id: 'LICH', name: 'Lich Ancião', region: 'Cripta', attackDamage: 2,
            img: 'assets/images/lich.png',
            phases: [
                { hpThreshold: 0.75, description: 'Canaliza magia; use especial para quebrar barreira.', pattern: ['up', 'down', 'special'] },
                { hpThreshold: 0.4, description: 'Invoca espíritos; padrão inverte.', pattern: ['special', 'down', 'up'] },
                { hpThreshold: 0, description: 'Desesperado, combinação complexa.', pattern: ['up', 'special', 'down', 'attack'] }
            ],
            notes: [
                "Página 21 — Ele falou meu nome ao final. Talvez soubesse porque eu o invoquei."
            ]
        },
        COLOSSUS: {
            id: 'COLOSSUS', name: 'Colosso Espectral', region: 'Ruínas', attackDamage: 3,
            img: 'assets/images/colossus.png',
            phases: [
                { hpThreshold: 0.66, description: 'Golpe de área massivo; salte e contraataque.', pattern: ['up', 'attack', 'attack'] },
                { hpThreshold: 0.33, description: 'Anda em fúria; padrão extenso.', pattern: ['left', 'right', 'special', 'attack', 'attack'] }
            ],
            notes: [
                "Página 31 — Me arrastou pela areia. Escrevi com calos."
            ]
        },
        WYRM: {
            id: 'WYRM', name: 'Wyrm Abissal', region: 'Pântano', attackDamage: 2,
            img: 'assets/images/wyrm.png',
            phases: [
                { hpThreshold: 0.5, description: 'Emerge e sumiu; padrão curto e rápido.', pattern: ['right', 'right', 'attack'] },
                { hpThreshold: 0, description: 'Enfurecido, segue com rajadas incomuns.', pattern: ['left', 'special', 'right', 'attack'] }
            ],
            notes: [
                "Página 45 — O cheiro do pântano ficou em minhas roupas por dias."
            ]
        },
        MARAUDER: {
            id: 'MARAUDER', name: 'Saqueador Errante', region: 'Campos', attackDamage: 1,
            img: 'assets/images/marauder.png',
            phases: [
                { hpThreshold: 0.6, description: 'Ataques rápidos e esquivas.', pattern: ['left', 'attack', 'right'] },
                { hpThreshold: 0, description: 'Ele convoca aliados; padrão em cadeia.', pattern: ['attack', 'attack', 'special'] }
            ],
            notes: [
                "Página 50 — Um inimigo humano demais para não sentir pena."
            ]
        }
    };

    // Procedural: generate random boss variations (bigger scale)
    function makeRandomBoss() {
        const names = ['Ogro', 'Espectro', 'Limo', 'Bárbaro', 'Guardião'];
        const id = 'RANDOM_' + Date.now().toString(36);
        const name = names[Math.floor(Math.random() * names.length)] + ' Aleatório';
        const phase1 = { hpThreshold: 0.5, description: 'Fase inicial aleatória.', pattern: Array.from({ length: 3 }, () => ['left', 'right', 'up', 'down', 'attack'][Math.floor(Math.random() * 5)]) };
        const phase2 = { hpThreshold: 0, description: 'Fase de fúria aleatória.', pattern: Array.from({ length: 4 }, () => ['left', 'right', 'up', 'down', 'attack', 'special'][Math.floor(Math.random() * 6)]) };
        return { id, name, img: '', phases: [phase1, phase2], attackDamage: 1, notes: ['Entrada gerada.'] };
    }

    /* ===========================
       STORY / VN (EXTENSO)
       - VN expanded: multiple chapters and long text blocks
       - Aim: at least ~10 minutes reading total (plenty of content)
       =========================== */

    // helper to create many paragraphs to reach time target
    function longParagraphs(base, count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push({ speaker: '', text: `${base} ${i + 1}.` });
        }
        return arr;
    }

    // Prologue (long)
    const VN_PROLOGUE = [
        { speaker: '', text: "O livro jazia sob pó e ossos — couro rachado, páginas unidas por memórias e lágrimas secas." },
        { speaker: 'Espírito do Herói', text: "Se você abriu isto, saiba: falhei. Escrevi para quem vier depois de mim." },
        { speaker: 'Espírito do Herói', text: "Cada entrada é um fragmento de medo, cada linha um passo que eu não pude dar." },
        // add a sequence of introspective paragraphs to lengthen reading time
        ...longParagraphs("As tochas tremiam. Minhas mãos traçaram palavras que eu gostaria de esquecer —", 12),
        { speaker: 'Espírito do Herói', text: "Memória é peso. Eu deixo o livro para que o peso não seja apenas meu." },
        { speaker: 'Narrador', text: "Você percebe que as instruções são práticas — mas as margens guardam confissões." },
        ...longParagraphs("Um trecho desenhado com pressa: 'Se eu falhar novamente, saiba que a culpa é minha.'", 10),
        { speaker: 'Narrador', text: "O livro é um guia e uma carta; o autor parece conversar consigo próprio no papel." },
        ...longParagraphs("A respiração do Espírito acompanha suas leituras: 'Não confie apenas na força. Estude o padrão.'", 10),
        { speaker: 'Espírito do Herói', text: "Prometo que, se este livro salvar você, minha falha terá sido útil." },
        { speaker: 'Narrador', text: "Você fecha o livro um instante, e sente o peso de uma jornada que talvez repita." }
    ];

    // Additional chapters (each with an intermission and VN content)
    const CHAPTER_VN = [
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "As ruínas me ensinaram a humildade. A Harpia não perdoa quem dança no ar sem aprender seu passo." },
                ...longParagraphs("Lembrei da primeira queda: o vento arrancou minha capa e com ela, minha coragem.", 8),
                { speaker: 'Narrador', text: "Você percorre as notas e sente a melancolia tomar forma, mas também aprende o padrão." }
            ],
            boss: BESTIARY.HARPY,
            chapterTitle: "As Ruínas"
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "No pântano, a Serpente queimou meu braço. Anotei o calor em sinais." },
                ...longParagraphs("Minhas palavras ficam trêmulas; relembro o calor e escrevo para o futuro.", 9)
            ],
            boss: BESTIARY.FIRE_SERPENT,
            chapterTitle: "Os Pântanos"
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "O Vulcão rugiu quando o Golem bateu. Aprendi suas batidas, marquei o compasso." },
                ...longParagraphs("O ferro não é sempre a resposta. O núcleo vibra com um ritmo próprio.", 9)
            ],
            boss: BESTIARY.GOLEM,
            chapterTitle: "O Vulcão"
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "Montanhas congeladas; o Espectro não tem corpo, mas tem intenção." },
                ...longParagraphs("Guardei runas e símbolos para lembrar: 'use o especial quando a forma vacilar.'", 8)
            ],
            boss: BESTIARY.ICE_SPECTER,
            chapterTitle: "As Montanhas"
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "A Cripta é onde falhei. Escrevi e chorei em loops; as notas se tornaram um lamento." },
                ...longParagraphs("A escuridão sussurrou nomes; anotei-os por medo de esquecê-los.", 12)
            ],
            boss: BESTIARY.LICH,
            chapterTitle: "A Cripta"
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "Mais além havia colossos e wyrms; eu escrevia ou pegava notas de operários que ali caíram." },
                ...longParagraphs("Cada monstro deixou marcas que eu tentei traduzir em símbolos e padrões.", 10)
            ],
            boss: null, // optional: leads to arena
            chapterTitle: "Além do Livro"
        }
    ];

    // combine all VN for initial long-run
    const STORY_SEGMENTS = CHAPTER_VN;

    /* ===========================
       GAME STATE
       =========================== */
    const SAVE_KEY = 'bestiario_v2_save';
    const state = {
        mode: 'vn',
        hero: { x: 120, y: 380, w: 48, h: 60, hp: 6, maxHp: 6, vy: 0, isGrounded: true, isAttacking: 0, isInvincible: 0, dir: 'right' },
        boss: null,
        inputs: [],
        mistakes: 0,
        storyIndex: 0,
        chapterIndex: 0,
        discovered: [], // store objects or ids
        secretTriggered: false,
        screenShake: 0
    };

    function saveProgress() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                storyIndex: state.storyIndex,
                chapterIndex: state.chapterIndex,
                discovered: state.discovered
            }));
            log('Progresso salvo.', '#9be7a7');
        } catch (e) { console.warn(e); }
    }
    function loadProgress() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) {
                const d = JSON.parse(raw);
                state.storyIndex = d.storyIndex || 0;
                state.chapterIndex = d.chapterIndex || 0;
                state.discovered = d.discovered || [];
                log('Progresso carregado.', '#cfe8ff');
            }
        } catch (e) { console.warn(e); }
    }
    loadProgress();

    // preload images (robust)
    const bossImages = {};
    Object.values(BESTIARY).forEach(b => {
        const img = new Image();
        img.src = b.img;
        bossImages[b.id] = { img, loaded: false };
        img.onload = () => bossImages[b.id].loaded = true;
        img.onerror = () => { /* ignore missing */ };
    });

    // hero images
    const heroImg = new Image();
    heroImg.src = 'assets/images/hero.png';
    const lastHeroImg = new Image();
    lastHeroImg.src = 'assets/images/lasthero.png';

    /* ===========================
       BESTIARY UI (SEARCH / PAGINATION / PREVIEW)
       =========================== */
    let bestiaryPage = 0;
    const PAGE_SIZE = 6;

    function refreshBestiary(filter = '') {
        bestiaryList.innerHTML = '';
        // combine base bestiary and discovered procedural entries
        const unique = {};
        Object.values(BESTIARY).forEach(b => unique[b.id] = b);
        state.discovered.forEach(item => {
            if (!item) return;
            if (typeof item === 'string') {
                if (BESTIARY[item]) unique[item] = BESTIARY[item];
            } else if (typeof item === 'object' && item.id) {
                unique[item.id] = item;
            }
        });

        // filter
        const entries = Object.values(unique).filter(b => {
            if (!filter) return true;
            const f = filter.toLowerCase();
            return (b.name && b.name.toLowerCase().includes(f)) || (b.notes && b.notes.join(' ').toLowerCase().includes(f)) || (b.phases && b.phases.some(p => p.description.toLowerCase().includes(f)));
        }).sort((a, b) => a.name.localeCompare(b.name));

        // pagination
        const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
        if (bestiaryPage >= totalPages) bestiaryPage = totalPages - 1;
        const pageEntries = entries.slice(bestiaryPage * PAGE_SIZE, (bestiaryPage + 1) * PAGE_SIZE);

        pageEntries.forEach(b => {
            const el = document.createElement('div');
            el.className = 'bestiary-entry';
            const snippet = (b.notes && b.notes[0]) ? b.notes[0] : (b.phases && b.phases[0] && b.phases[0].description) || '';
            const pattern = (b.phases && b.phases[0] && b.phases[0].pattern) ? b.phases[0].pattern : (b.pattern || []);
            el.innerHTML = `<strong>${b.name}</strong><div style="font-size:13px;color:#555;margin-top:6px">${snippet}</div>
        <div style="margin-top:8px"><small>Padrões:</small><div style="margin-top:6px">${pattern.map(p => `<span class="pattern-pill">${p}</span>`).join('')}</div></div>`;
            el.onclick = () => showBestiaryPreview(b);
            bestiaryList.appendChild(el);
        });

        // pager
        bestiaryPager.innerHTML = '';
        if (totalPages > 1) {
            const prev = document.createElement('button'); prev.textContent = '«'; prev.onclick = () => { bestiaryPage = Math.max(0, bestiaryPage - 1); refreshBestiary(bestiarySearch.value); };
            const next = document.createElement('button'); next.textContent = '»'; next.onclick = () => { bestiaryPage = Math.min(totalPages - 1, bestiaryPage + 1); refreshBestiary(bestiarySearch.value); };
            bestiaryPager.appendChild(prev);
            const info = document.createElement('span'); info.textContent = ` Página ${bestiaryPage + 1} / ${totalPages} `; bestiaryPager.appendChild(info);
            bestiaryPager.appendChild(next);
        }
        bestiaryPreview.innerHTML = '<em>Selecione uma entrada para ver detalhes e notas</em>';
    }

    function showBestiaryPreview(b) {
        const notesHtml = (b.notes || []).map(n => `<div style="margin-bottom:6px;font-style:italic">${n}</div>`).join('');
        const phasesHtml = (b.phases || []).map((p, i) => `<div style="margin-top:8px"><strong>Fase ${i + 1}</strong><div style="font-style:italic">${p.description}</div><div style="margin-top:6px">${p.pattern.map(x => `<span class="pattern-pill">${x}</span>`).join('')}</div></div>`).join('<hr/>');
        let imgHtml = '';
        if (b.img) imgHtml = `<div style="margin-top:8px"><img src="${b.img}" style="width:100%;border-radius:6px" onerror="this.style.display='none'"/></div>`;
        bestiaryPreview.innerHTML = `<h4>${b.name}</h4>${imgHtml}${notesHtml}<hr/>${phasesHtml}<div style="margin-top:10px"><button id="spawnFromBest">Enfrentar</button></div>`;
        document.getElementById('spawnFromBest').onclick = () => {
            closeBestiary();
            const clone = JSON.parse(JSON.stringify(b));
            clone.isProcedural = (b.id && typeof b.id === 'string' && b.id.startsWith && b.id.startsWith('RANDOM_'));
            loadBoss(clone);
            state.mode = 'playing';
            updateModeLabel();
            setUIEnabled(true);
            Audio.sfx('page');
        };
    }

    openBestBtn.onclick = () => { bestiaryPage = 0; refreshBestiary(bestiarySearch.value || ''); bestiaryModal.classList.remove('hidden'); Audio.sfx('page'); };
    closeBestBtn.onclick = () => { bestiaryModal.classList.add('hidden'); Audio.sfx('click'); };
    bestiarySearch.addEventListener('input', () => { bestiaryPage = 0; refreshBestiary(bestiarySearch.value || ''); });

    function closeBestiary() { bestiaryModal.classList.add('hidden'); }

    /* ===========================
       VN SYSTEM (auto, skip, typewriter)
       =========================== */
    let vnQueue = [];
    let vnAutoMode = false;
    function playVN(lines, onComplete) {
        vnQueue = lines.slice();
        vnContainer.classList.remove('hidden');
        vnContainer.setAttribute('aria-hidden', 'false');
        vnNext.onclick = () => vnStep(onComplete);
        vnSkip.onclick = () => { vnContainer.classList.add('hidden'); vnQueue = []; if (onComplete) onComplete(); };
        vnAuto.onclick = () => { vnAutoMode = !vnAutoMode; vnAuto.textContent = vnAutoMode ? 'Auto ✓' : 'Auto'; };
        vnStep(onComplete);
    }
    function vnStep(onComplete) {
        if (vnQueue.length === 0) {
            vnContainer.classList.add('hidden');
            vnContainer.setAttribute('aria-hidden', 'true');
            if (onComplete) onComplete();
            return;
        }
        const item = vnQueue.shift();
        vnSpeaker.textContent = item.speaker || '';
        showPortraitForSpeaker(item.speaker);
        typeWriter(item.text, vnText, 18, () => {
            Audio.sfx('page');
            if (vnAutoMode) {
                setTimeout(() => vnStep(onComplete), 1600 + Math.random() * 2000);
            }
        });
        // update progress
        const remaining = vnQueue.length;
        const total = remaining + 1;
        const progress = Math.round((total - remaining) / (total + 1) * 100);
        document.getElementById('vnProgress').style.width = progress + '%';
    }

    function showPortraitForSpeaker(speaker) {
        // If speaker is "Espírito do Herói" show lasthero.png else default
        if (speaker && speaker.toLowerCase().includes('espírito')) {
            vnPortrait.src = 'assets/images/lasthero.png';
        } else {
            vnPortrait.src = 'assets/images/lasthero.png';
        }
    }

    function typeWriter(text, el, speed = 18, done) {
        el.innerHTML = '';
        let i = 0;
        const showFull = () => {
            el.innerHTML = text;
            if (accessSub && accessSub.checked) {
                // keep subtitles visible (no additional action needed)
            } else {
                // if subtitles off, still show text but not repeated
            }
            if (done) done();
        };
        (function step() {
            if (i <= text.length) {
                el.innerHTML = text.slice(0, i) + (i % 2 ? '▌' : '');
                i++;
                setTimeout(step, speed);
            } else {
                showFull();
            }
        })();
    }

    /* ===========================
       INTERLUDE
       =========================== */
    function playInterlude(text, onComplete) {
        interludeText.textContent = text;
        interludeBox.classList.remove('hidden');
        interludeBox.setAttribute('aria-hidden', 'false');
        interludeContinue.onclick = () => { interludeBox.classList.add('hidden'); interludeBox.setAttribute('aria-hidden', 'true'); if (onComplete) onComplete(); };
    }

    /* ===========================
       GAMEPLAY: boss loading, patterns, combat
       =========================== */
    function loadBoss(bossData) {
        if (!bossData) return;
        const maxHp = bossData.phases.length * 4 + 2;
        state.boss = Object.assign({}, bossData, { hp: maxHp, maxHp: maxHp, currentPhase: 0 });
        state.inputs = [];
        state.mistakes = 0;
        // discovered entries stored robustly
        const present = state.discovered.find(x => (typeof x === 'string' ? x === bossData.id : x && x.id === bossData.id));
        if (!present) {
            state.discovered.push({ id: bossData.id, name: bossData.name, phases: bossData.phases, notes: bossData.notes || [], img: bossData.img || '' });
            saveProgress();
        }
        renderPattern();
        log(`Um(a) ${state.boss.name} surge do nada.`, '#ffd580');
    }

    // input mapping keyboard
    const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', ' ': 'attack', Shift: 'special' };
    window.addEventListener('keydown', (e) => {
        if (state.mode !== 'playing' && state.mode !== 'arena') return;
        const act = keyMap[e.key];
        if (act) { e.preventDefault(); registerAction(act); }
    });

    function registerAction(action) {
        if (state.inputs.length >= 8) return;
        state.inputs.push(action);
        renderPattern();
        if (Audio) Audio.sfx('click');
        if (action === 'left') { state.hero.x -= 16; state.hero.dir = 'left'; }
        if (action === 'right') { state.hero.x += 16; state.hero.dir = 'right'; }
        if (action === 'up' && state.hero.isGrounded) { state.hero.vy = -14; state.hero.isGrounded = false; }
        state.hero.x = Math.max(state.hero.w / 2, Math.min(canvas.width - state.hero.w / 2, state.hero.x));
    }

    // on-screen bindings for touch
    function bindOnscreen() {
        if (onScreen.up) onScreen.up.addEventListener('touchstart', () => registerAction('up'));
        if (onScreen.down) onScreen.down.addEventListener('touchstart', () => registerAction('down'));
        if (onScreen.left) onScreen.left.addEventListener('touchstart', () => registerAction('left'));
        if (onScreen.right) onScreen.right.addEventListener('touchstart', () => registerAction('right'));
        if (onScreen.attack) onScreen.attack.addEventListener('touchstart', () => registerAction('attack'));
        if (onScreen.special) onScreen.special.addEventListener('touchstart', () => registerAction('special'));
    }
    bindOnscreen();

    function renderPattern() {
        patternContainer.innerHTML = '';
        state.inputs.forEach(a => {
            const sp = document.createElement('span'); sp.className = 'pattern-pill'; sp.textContent = a;
            patternContainer.appendChild(sp);
        });
    }
    function resetPattern() {
        state.inputs = []; renderPattern();
        if (Audio) Audio.sfx('click');
    }

    // confirm action
    function confirmAction() {
        if (!state.boss || (state.mode !== 'playing' && state.mode !== 'arena')) return;
        const phase = state.boss.phases[state.boss.currentPhase];
        const success = JSON.stringify(state.inputs) === JSON.stringify(phase.pattern);

        const secretSeq = ['special', 'special', 'attack', 'up'];
        const isFinalBoss = (state.boss && state.boss.id === 'LICH' && (state.boss.hp <= 3));
        const secretMatch = JSON.stringify(state.inputs) === JSON.stringify(secretSeq);

        if (success) {
            log('Padrão correto! Você encontra a abertura.', '#6bff94');
            if (Audio) Audio.sfx('hit');
            // damage scales with boss size
            const damage = Math.max(1, Math.floor(state.boss.maxHp / 6));
            state.boss.hp -= damage;
            state.mistakes = 0;
            // phase transition detection
            for (let i = state.boss.phases.length - 1; i >= 0; i--) {
                if ((state.boss.hp / state.boss.maxHp) <= state.boss.phases[i].hpThreshold) {
                    if (i > state.boss.currentPhase) {
                        state.boss.currentPhase = i;
                        log(`${state.boss.name} entra em fúria — novo padrão detectado!`, '#ffae42');
                        state.screenShake = 22;
                        Audio.sfx('page');
                    }
                    break;
                }
            }
            if (state.boss.hp <= 0) {
                log(`${state.boss.name} abatido!`, '#ffd580');
                if (Audio) Audio.sfx('page');
                // victory progression
                if (state.mode === 'playing') {
                    state.chapterIndex++; state.storyIndex++;
                    saveProgress();
                    const frag = INTERLUDE_FRAGMENTS[Math.floor(Math.random() * INTERLUDE_FRAGMENTS.length)];
                    playInterlude(frag, () => {
                        // proceed to next segment or arena
                        const seg = STORY_SEGMENTS[state.storyIndex];
                        if (seg && seg.vn) {
                            state.mode = 'vn'; updateModeLabel();
                            playVN(seg.vn, () => {
                                if (seg.boss) {
                                    loadBoss(seg.boss); state.mode = 'playing'; updateModeLabel(); setUIEnabled(true);
                                } else {
                                    // go to arena
                                    state.mode = 'arena'; updateModeLabel();
                                    loadBoss(makeRandomBoss()); nextBossBtn.style.display = 'inline-block'; setUIEnabled(true);
                                }
                            });
                        } else {
                            // final or arena
                            state.mode = 'arena'; updateModeLabel();
                            loadBoss(makeRandomBoss()); nextBossBtn.style.display = 'inline-block'; setUIEnabled(true);
                        }
                    });
                } else {
                    // arena: spawn next after short delay
                    setTimeout(() => loadBoss(makeRandomBoss()), 1200);
                }
            }
        } else if (secretMatch && isFinalBoss) {
            // secret burn
            if (Audio) Audio.sfx('hit');
            log('Um padrão estranho... o livro treme.', '#ff9fbf');
            state.secretTriggered = true;
            state.boss.hp = 0;
            setTimeout(() => triggerBurnEnding(), 900);
        } else {
            state.mistakes++;
            log(`Padrão incorreto! (${MAX_MISTAKES - state.mistakes} tentativas restantes)`, '#ffae42');
            if (Audio) Audio.sfx('damage');
            if (state.mistakes >= MAX_MISTAKES) {
                log(`${state.boss.name} contra-ataca! Você leva dano.`, '#ff6b6b');
                state.hero.hp -= state.boss.attackDamage;
                state.hero.isInvincible = 1000;
                state.screenShake = 15;
                state.mistakes = 0;
                if (state.hero.hp <= 0) { state.hero.hp = 0; gameOver(); }
            }
        }
        resetPattern();
    }

    /* ===========================
       INTERLUDE FRAGMENTS (melancholy)
       =========================== */
    const INTERLUDE_FRAGMENTS = [
        "A nota suja de sangue dizia: 'Não ouvi seu último suspiro. Talvez eu escreva para ouvi-lo agora.'",
        "No canto do papel: 'Se você está lendo isso, saiba que eu pedi clemência em silêncio.'",
        "Entre as páginas: 'Se eu tivesse aprendido a esperar, teria ouvido o passo antes do golpe.'",
        "Uma linha abafada: 'Desculpe por não ter protegido os vivos; escrevi para salvar o próximo.'",
        "Rabisco final: 'O livro é um abraço que também prende. Escolha com sabedoria.'"
    ];
/ ...existing code...

    /* ===========================
       GAME LOOP & RENDERING
       =========================== */
    const GROUND_Y = 380;
    const GRAVITY = 0.5;

    function drawHero() {
        const img = state.secretTriggered ? lastHeroImg : heroImg;
        ctx.save();
        if (state.hero.isInvincible > 0 && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        ctx.translate(state.hero.x + state.hero.w / 2, state.hero.y + state.hero.h / 2);
        if (state.hero.dir === 'left') ctx.scale(-1, 1);
        ctx.drawImage(img, -state.hero.w / 2, -state.hero.h / 2, state.hero.w, state.hero.h);
        ctx.restore();
    }

    function drawBoss() {
        if (!state.boss || !state.boss.id) return;
        const img = bossImages[state.boss.id];
        if (!img) return;

        ctx.save();
        if (state.boss.isAttacking > 0) {
            ctx.translate(canvas.width / 2 + Math.random() * 4, 340);
        } else {
            ctx.translate(canvas.width / 2, 340);
        }
        ctx.drawImage(img, -120, -120, 240, 240);
        ctx.restore();
    }

    function drawHUD() {
        // hero HP
        const heroHPWidth = 220;
        const heroHPRatio = state.hero.hp / state.hero.maxHp;
        ctx.fillStyle = 'var(--hp-bg)';
        ctx.fillRect(20, 20, heroHPWidth, 20);
        ctx.fillStyle = 'var(--hero-hp-color)';
        ctx.fillRect(20, 20, heroHPWidth * heroHPRatio, 20);

        // boss HP if present
        if (state.boss) {
            const bossHPWidth = 220;
            const bossHPRatio = state.boss.hp / state.boss.maxHp;
            ctx.fillStyle = 'var(--hp-bg)';
            ctx.fillRect(canvas.width - bossHPWidth - 20, 20, bossHPWidth, 20);
            ctx.fillStyle = 'var(--boss-hp-color)';
            ctx.fillRect(canvas.width - bossHPWidth - 20, 20, bossHPWidth * bossHPRatio, 20);
        }
    }

    function update(dt) {
        if (state.hero.isInvincible > 0) {
            state.hero.isInvincible -= dt;
        }

        if (state.hero.vy !== undefined) {
            state.hero.vy += GRAVITY;
            state.hero.y += state.hero.vy;

            if (state.hero.y >= GROUND_Y) {
                state.hero.y = GROUND_Y;
                state.hero.vy = 0;
                state.hero.isGrounded = true;
            }
        }

        if (state.screenShake > 0) {
            state.screenShake = Math.max(0, state.screenShake - dt * 0.05);
        }
    }

    function gameLoop(timestamp) {
        const dt = timestamp - (state.lastTimestamp || timestamp);
        state.lastTimestamp = timestamp;

        update(dt);

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // apply screen shake
        ctx.save();
        if (state.screenShake > 0) {
            ctx.translate(
                (Math.random() - 0.5) * state.screenShake,
                (Math.random() - 0.5) * state.screenShake
            );
        }

        // draw background
        ctx.fillStyle = '#04121b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw ground
        ctx.fillStyle = '#0b2431';
        ctx.fillRect(0, GROUND_Y + 30, canvas.width, canvas.height - GROUND_Y);

        drawBoss();
        drawHero();
        drawHUD();

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    /* ===========================
       INITIALIZATION
       =========================== */
    function init() {
        // start with VN if no progress
        if (!loadProgress()) {
            playVN(VN_PROLOGUE, () => {
                state.mode = 'exploration';
                modeLabel.textContent = 'Exploração';
            });
        }

        // start game loop
        requestAnimationFrame(gameLoop);

        // bind UI events
        executarBtn.onclick = confirmAction;
        resetBtn.onclick = resetPattern;
        vnNext.onclick = () => vnStep();
        vnSkip.onclick = () => {
            vnQueue = [];
            vnContainer.classList.add('hidden');
        };
        vnAuto.onclick = () => {
            vnAutoMode = !vnAutoMode;
            vnAuto.classList.toggle('active');
        };

        // audio controls
        btnToggleMusic.onclick = () => Audio.toggleMusic();
        musicVolEl.oninput = e => Audio.setMusicVolume(e.target.value);
        sfxVolEl.oninput = e => Audio.setSFXVolume(e.target.value);

        // refresh bestiary initially
        refreshBestiary();
    }

    // start game
    init();

})(); // end IIFE
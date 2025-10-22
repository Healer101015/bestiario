// game.js
// Principal do jogo: VN -> combate -> bestiário
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

    const interludeBox = document.getElementById('interludeBox');
    const interludeText = document.getElementById('interludeText');
    const interludeContinue = document.getElementById('interludeContinue');

    const bestiaryModal = document.getElementById('bestiaryModal');
    const bestiaryList = document.getElementById('bestiaryList');
    const bestiaryPreview = document.getElementById('bestiaryPreview');
    const openBestBtn = document.getElementById('openBest');
    const closeBestBtn = document.getElementById('closeBest');

    const openVNBtn = document.getElementById('openVN');
    const executarBtn = document.getElementById('executarAcao');
    const resetBtn = document.getElementById('resetPattern');
    const nextBossBtn = document.getElementById('nextBoss');
    const modeLabel = document.getElementById('modeLabel');

    const onScreen = {
        up: document.getElementById('btn-up'),
        down: document.getElementById('btn-down'),
        left: document.getElementById('btn-left'),
        right: document.getElementById('btn-right'),
        attack: document.getElementById('btn-attack'),
        special: document.getElementById('btn-special')
    };

    // log helper
    function log(msg, color = '#cfe8ff') {
        const t = new Date().toLocaleTimeString();
        logEl.innerHTML = `<div style="color:${color};font-family:monospace">[${t}] ${msg}</div>` + logEl.innerHTML;
    }

    // *** ADICIONADO: CARREGADOR DE SPRITES DO HERÓI ***
    const heroSprites = {
        idle: [],
        attack1: []
    };
    let spritesLoaded = 0;
    // 8 frames idle (0-7), 6 frames attack (0-5)
    const totalSprites = 8 + 6;

    function loadHeroSprites() {
        const onSpriteLoad = () => {
            spritesLoaded++;
            if (spritesLoaded === totalSprites) {
                log('Sprites do Herói carregados.', '#90ee90');
            }
        };

        // Carregar Idle (0-7)
        for (let i = 0; i < 8; i++) {
            const img = new Image();
            // Assumindo que a pasta 'hero' está no mesmo nível que index.html
            img.src = `hero/Idle/HeroKnight_Idle_${i}.png`;
            img.onload = onSpriteLoad;
            img.onerror = () => log(`Erro ao carregar hero/Idle/HeroKnight_Idle_${i}.png`, '#ff6b6b');
            heroSprites.idle.push(img);
        }

        // Carregar Attack1 (0-5)
        // (Você enviou 6 frames de ataque, de 0 a 5)
        for (let i = 0; i < 6; i++) {
            const img = new Image();
            img.src = `hero/Attack1/HeroKnight_Attack1_${i}.png`;
            img.onload = onSpriteLoad;
            img.onerror = () => log(`Erro ao carregar hero/Attack1/HeroKnight_Attack1_${i}.png`, '#ff6b6b');
            heroSprites.attack1.push(img);
        }
    }
    // *** FIM DO BLOCO ADICIONADO ***

    // small wrapper for audio
    const Audio = window.AudioAPI;

    // Bestiary base
    const BESTIARY = {
        HARPY: {
            id: 'HARPY', name: 'Harpia das Ruínas', attackDamage: 1,
            img: 'harpy.png',
            phases: [
                { hpThreshold: 0.66, description: "Voa entre pilares e mergulha. Observe o bater das asas.", pattern: ['left', 'right', 'up'] },
                { hpThreshold: 0.33, description: "Enfurecida, rasga o céu.", pattern: ['left', 'down', 'right', 'up'] }
            ],
            notes: [
                "Página 3 — Ela tinha olhos como as janelas quebradas.",
                "Anotei o mergulho no canto com mãos trêmulas."
            ]
        },
        GOLEM: {
            id: 'GOLEM', name: 'Golem de Magma', attackDamage: 2,
            img: 'golem.png',
            phases: [
                { hpThreshold: 0.5, description: 'Lento e devastador. Pule sobre a onda e ataque o núcleo.', pattern: ['right', 'up', 'attack', 'attack'] },
                { hpThreshold: 0, description: 'Núcleo superaquecido; sequência mais longa.', pattern: ['right', 'up', 'special', 'attack', 'attack'] }
            ],
            notes: [
                "Página 7 — O calor queimou meu punho.",
                "Não confie apenas na força; memorize o pulso do monstro."
            ]
        },
        LICH: {
            id: 'LICH', name: 'Lich Ancião', attackDamage: 1,
            img: 'lich.png',
            phases: [
                { hpThreshold: 0.66, description: 'Canaliza magia; use especial.', pattern: ['up', 'down', 'special'] },
                { hpThreshold: 0.33, description: 'Invoca espíritos; padrão invertido.', pattern: ['special', 'down', 'up'] },
                { hpThreshold: 0, description: 'Combinação final.', pattern: ['up', 'special', 'down', 'attack'] }
            ],
            notes: [
                "Página 21 — Ele sussurrou meu nome.",
                "Não morri por orgulho, mas por confiar demais nas notas."
            ]
        }
    };

    function makeRandomBoss() {
        const names = ['Ogro', 'Espectro', 'Limo', 'Bárbaro'];
        const id = 'RANDOM_' + Date.now() + Math.random().toString(36).slice(2, 8);
        const name = names[Math.floor(Math.random() * names.length)];
        const p1 = { hpThreshold: 0.5, description: 'Criatura estranha', pattern: Array.from({ length: 3 }, () => ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)]) };
        const p2 = { hpThreshold: 0.0, description: 'Enfurecida', pattern: Array.from({ length: 4 }, () => ['left', 'right', 'up', 'down', 'attack'][Math.floor(Math.random() * 5)]) };
        return { id, name, attackDamage: 1, img: '', phases: [p1, p2], notes: ['Entrada gerada.'] };
    }

    // VN content (EXPANDIDO CONFORME SOLICITADO)
    const VN_PROLOGUE = [
        { speaker: '', text: "O livro jazia sob pó e ossos. O couro estava rachado, não pelo tempo, mas pelo peso do fracasso." },
        { speaker: 'Espírito do Herói', text: "Então... outro encontrou meu fardo. Eu rezei para que ninguém mais viesse aqui." },
        { speaker: 'Espírito do Herói', text: "Se você abriu isto, saiba: eu falhei. Cada página que você lê é um testamento da minha fraqueza." },
        { speaker: 'Espírito do Herói', text: "Eu tentei... tentei tanto. Mas a repetição... o ciclo... ele quebra a alma." },
        { speaker: 'Narrador', text: "A voz fantasmagórica falha, carregada de uma dor que atravessa o tempo." },
        { speaker: 'Espírito do Herói', text: "Leve o Bestiário. É tudo que me restou. Minha dor, minhas anotações... meus erros. Por favor, não os repita." },
        { speaker: 'Espírito do Herói', text: "Termine o que eu não pude. Liberte-me desta... memória." },
        { speaker: 'Narrador', text: "Você ergue o livro. As páginas parecem pesadas, úmidas de arrependimento. Uma palavra, mais uma maldição que uma promessa, paira no ar: 'Concluir'." }
    ];

    const INTERLUDES = [
        "Página amarelada: 'Fui impaciente com o Golem. O brilho enganou-me. Perdi minha manopla... e parte da minha esperança.'",
        "Rabisco na margem: 'Harpia cantou. Eu não ouvi. O som era o mesmo da minha própria voz, gritando por ajuda.'",
        "Nota trêmula: 'Escrevo para um espelho. O rosto que me encara de volta não é mais o meu. É o rosto de um covarde.'",
        "Mancha de tinta: 'Eu deveria ter queimado este livro. Por que estou condenando outro a seguir meus passos?'",
        "Rasura: 'O Lich... ele sabe meu nome. Ele sussurrou sobre o ciclo. Ele disse que eu voltaria. Eu estou voltando?'"
    ];

    const storySegments = [
        { vn: VN_PROLOGUE, boss: BESTIARY.HARPY },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "Eu escrevia à luz de tochas. Minhas mãos tremiam... não pelo frio, mas pelo que eu lembrava." },
                { speaker: 'Espírito do Herói', text: "A Harpia... eu anotei seu padrão, mas hesitei. O grito dela... parecia tão humano." },
                { speaker: 'Narrador', text: "O livro revela que o autor não apenas catalogava, ele lamentava." },
                { speaker: 'Narrador', text: "Ele sempre deixava o monstro mais difícil para o dia seguinte. Um dia que nunca chegava." }
            ],
            boss: BESTIARY.GOLEM
        },
        {
            vn: [
                { speaker: 'Espírito do Herói', text: "As notas tornaram-se confissões. Eu já não escrevia para um sucessor. Eu escrevia para uma lápide." },
                { speaker: 'Espírito do Herói', text: "Eu confessei meus medos. O medo de morrer, sim. Mas pior... o medo de *não* morrer. De ficar preso aqui, como eu estou agora." },
                { speaker: 'Narrador', text: "O Bestiário parece menos técnico e mais um diário de desespero." },
                { speaker: 'Espírito do Herói', text: "Ele está próximo. O último. O que me quebrou. Eu não consigo... eu não vou..." }
            ],
            boss: BESTIARY.LICH
        },
        {
            vn: [
                { speaker: 'Narrador', text: "As últimas palavras estão borradas. Parecem escritas com pressa, ou por mãos que não obedeciam mais." },
                { speaker: 'Espírito do Herói', text: "Eu o vi. O fim do caminho. E vi a mim mesmo, falhando. De novo." },
                { speaker: 'Narrador', text: "A anotação fala de outro livro. Um ciclo mais antigo. O Bestiário que *ele* encontrou." },
                { speaker: 'Espírito do Herói', text: "Perdoe-me. Eu sou apenas o eco. E agora... você também é." }
            ]
        }
    ];

    // state & save
    const SAVE_KEY = 'bestiario_v1_2_save';
    const state = {
        mode: 'vn',
        // *** ESTADO DO HERÓI ATUALIZADO ***
        hero: {
            x: 120, y: 360, w: 162, h: 162, hp: 5, maxHp: 5, vy: 0, isGrounded: true,
            animState: 'idle', // 'idle', 'attack1', etc.
            animFrame: 0,      // Frame atual da animação
            animTimer: 0,      // Temporizador para trocar de frame
            isInvincible: 0,
            dir: 'right'
        },
        // *** FIM DA ATUALIZAÇÃO ***
        boss: null,
        inputs: [],
        mistakes: 0,
        storyIndex: 0,
        chapterIndex: 0,
        discovered: [], // can store objects or ids
        secretTriggered: false,
        screenShake: 0
    };

    function saveProgress() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ storyIndex: state.storyIndex, chapterIndex: state.chapterIndex, discovered: state.discovered })); log('Progresso salvo.'); } catch (e) { console.warn(e); } }
    function loadProgress() { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const d = JSON.parse(raw); state.storyIndex = d.storyIndex || 0; state.chapterIndex = d.chapterIndex || 0; state.discovered = d.discovered || []; log('Progresso carregado.'); } } catch (e) { console.warn(e); } }
    loadProgress();

    // bestiary preview images (non-blocking)
    const bossImages = {};
    Object.values(BESTIARY).forEach(b => {
        const img = new Image();
        img.src = b.img; // relative path
        bossImages[b.id] = { img, loaded: false };
        img.onload = () => bossImages[b.id].loaded = true;
        img.onerror = () => { /* missing is okay */ };
    });

    // Bestiary UI (robust to types)
    function refreshBestiary() {
        bestiaryList.innerHTML = '';
        const unique = {};
        // add base entries
        Object.values(BESTIARY).forEach(b => unique[b.id] = b);
        // add discovered entries (could be strings/objects)
        state.discovered.forEach(item => {
            if (!item) return;
            if (typeof item === 'string') {
                const key = item;
                if (BESTIARY[key]) unique[key] = BESTIARY[key];
            } else if (typeof item === 'object' && item.id) {
                unique[item.id] = item;
            }
        });
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
    openBestBtn.onclick = () => { refreshBestiary(); bestiaryModal.classList.remove('hidden'); Audio.sfx('page'); };
    closeBestBtn.onclick = () => { bestiaryModal.classList.add('hidden'); Audio.sfx('click'); };
    function closeBestiary() { bestiaryModal.classList.add('hidden'); }

    // VN system (simple)
    let vnQueue = [];
    function playVN(lines, onComplete) {
        vnQueue = lines.slice();
        vnContainer.style.display = 'block';
        vnNext.onclick = () => vnStep(onComplete);
        vnSkip.onclick = () => { vnContainer.style.display = 'none'; vnQueue = []; if (onComplete) onComplete(); };
        vnContainer.style.display = 'block';
        vnStep(onComplete);
    }
    function vnStep(onComplete) {
        if (vnQueue.length === 0) {
            vnContainer.style.display = 'none';
            if (onComplete) onComplete();
            return;
        }
        const it = vnQueue.shift();
        vnSpeaker.textContent = it.speaker || '';
        typeWriter(it.text, vnText);
        // portrait uses lasthero.png for the VN (if present)
        vnPortrait.style.backgroundImage = "url('lasthero.png')";
        Audio.sfx('page');
    }
    function typeWriter(text, el, speed = 18) {
        el.innerHTML = '';
        let i = 0;
        (function step() {
            if (i <= text.length) {
                el.innerHTML = text.slice(0, i) + (i % 2 ? '▌' : '');
                i++;
                setTimeout(step, speed);
            } else {
                el.innerHTML = text;
            }
        })();
    }

    // interlude
    function playInterlude(text, onComplete) {
        interludeText.textContent = text;
        interludeBox.classList.remove('hidden');
        interludeBox.style.display = 'block';
        interludeContinue.onclick = () => { interludeBox.style.display = 'none'; if (onComplete) onComplete(); };
    }

    // boss load & management
    function loadBoss(bossData) {
        if (!bossData) return;
        const maxHp = bossData.phases.length * 3 + 2;
        state.boss = { ...bossData, hp: maxHp, maxHp: maxHp, currentPhase: 0 };
        state.inputs = [];
        state.mistakes = 0;
        // discovered store
        const exists = state.discovered.find(x => (typeof x === 'string' ? x === bossData.id : (x && x.id === bossData.id)));
        if (!exists) {
            // push minimal object representation (so UI can preview)
            state.discovered.push({ id: bossData.id, name: bossData.name, phases: bossData.phases, notes: bossData.notes || [], img: bossData.img || '' });
            saveProgress();
        }
        renderPattern();
    }

    // input mapping
    const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', ' ': 'attack', Shift: 'special' };
    window.addEventListener('keydown', (e) => { if (state.mode !== 'playing' && state.mode !== 'arena') return; const action = keyMap[e.key]; if (action) { e.preventDefault(); registerAction(action); } });

    // *** FUNÇÃO registerAction ATUALIZADA ***
    function registerAction(action) {
        if (state.inputs.length >= 8) return;
        // Impede novas ações enquanto ataca
        if (state.hero.animState === 'attack1') return;

        state.inputs.push(action);
        renderPattern();
        if (Audio) Audio.sfx('click');

        // Atualiza posição e direção
        if (action === 'left') {
            state.hero.x -= 12;
            state.hero.dir = 'left';
        }
        if (action === 'right') {
            state.hero.x += 12;
            state.hero.dir = 'right';
        }
        if (action === 'up' && state.hero.isGrounded) {
            state.hero.vy = -10;
            state.hero.isGrounded = false;
        }

        // LÓGICA DE ANIMAÇÃO DE ATAQUE
        if (action === 'attack') {
            state.hero.animState = 'attack1';
            state.hero.animFrame = 0;
            state.hero.animTimer = 0;
        }

        state.hero.x = Math.max(state.hero.w / 2, Math.min(canvas.width - state.hero.w / 2, state.hero.x));
    }
    // *** FIM DA ATUALIZAÇÃO ***

    // onscreen controls wiring
    function bindOnscreen() {
        if (onScreen.up) onScreen.up.addEventListener('click', () => registerAction('up'));
        if (onScreen.down) onScreen.down.addEventListener('click', () => registerAction('down'));
        if (onScreen.left) onScreen.left.addEventListener('click', () => registerAction('left'));
        if (onScreen.right) onScreen.right.addEventListener('click', () => registerAction('right'));
        if (onScreen.attack) onScreen.attack.addEventListener('click', () => registerAction('attack'));
        if (onScreen.special) onScreen.special.addEventListener('click', () => registerAction('special'));
    }
    bindOnscreen();

    function renderPattern() {
        patternContainer.innerHTML = '';
        state.inputs.forEach(a => {
            const s = document.createElement('span'); s.className = 'pattern-pill'; s.textContent = a;
            patternContainer.appendChild(s);
        });
    }
    function resetPattern() { state.inputs = []; renderPattern(); if (Audio) Audio.sfx('click'); }

    // confirm action handler
    function confirmAction() {
        if (!state.boss || (state.mode !== 'playing' && state.mode !== 'arena')) return;
        const phase = state.boss.phases[state.boss.currentPhase];
        const success = JSON.stringify(state.inputs) === JSON.stringify(phase.pattern);

        // secret: burn book sequence (when fighting LICH and low hp)
        const secretSeq = ['special', 'special', 'attack', 'up'];
        const isFinalBoss = (state.boss && state.boss.id === 'LICH' && (state.boss.hp <= 3));
        const secretMatch = JSON.stringify(state.inputs) === JSON.stringify(secretSeq);

        if (success) {
            log('Padrão executado corretamente!', '#6bff94');
            if (Audio) Audio.sfx('hit');
            state.boss.hp -= 2;
            state.mistakes = 0;
            // check phase transition
            for (let i = state.boss.phases.length - 1; i >= 0; i--) {
                if ((state.boss.hp / state.boss.maxHp) <= state.boss.phases[i].hpThreshold) {
                    if (i > state.boss.currentPhase) {
                        state.boss.currentPhase = i;
                        log(`${state.boss.name} entra em fúria — novo padrão!`, '#ffae42');
                        state.screenShake = 20;
                    }
                    break;
                }
            }
            if (state.boss.hp <= 0) {
                log(`${state.boss.name} foi derrotado!`, '#ffd580');
                if (Audio) Audio.sfx('page');
                if (state.mode === 'playing') {
                    state.chapterIndex++; state.storyIndex++;
                    saveProgress();
                    const frag = INTERLUDES[Math.floor(Math.random() * INTERLUDES.length)];
                    playInterlude(frag, () => {
                        // continue story if available
                        if (storySegments[state.storyIndex] && storySegments[state.storyIndex].vn) {
                            state.mode = 'vn'; updateModeLabel();
                            playVN(storySegments[state.storyIndex].vn, () => {
                                if (storySegments[state.storyIndex] && storySegments[state.storyIndex].boss) {
                                    loadBoss(storySegments[state.storyIndex].boss);
                                    state.mode = 'playing'; updateModeLabel(); setUIEnabled(true);
                                } else {
                                    // end -> arena
                                    state.mode = 'arena'; updateModeLabel();
                                    loadBoss(makeRandomBoss());
                                    nextBossBtn.style.display = 'inline-block';
                                    setUIEnabled(true);
                                }
                            });
                        } else {
                            // direct proceed
                            if (storySegments[state.storyIndex] && storySegments[state.storyIndex].boss) {
                                loadBoss(storySegments[state.storyIndex].boss);
                                state.mode = 'playing'; updateModeLabel(); setUIEnabled(true);
                            } else {
                                state.mode = 'arena'; updateModeLabel();
                                loadBoss(makeRandomBoss());
                                nextBossBtn.style.display = 'inline-block';
                                setUIEnabled(true);
                            }
                        }
                    });
                } else {
                    // arena: spawn new after short delay
                    setTimeout(() => loadBoss(makeRandomBoss()), 1200);
                }
            }
        } else if (secretMatch && isFinalBoss) {
            // secret path
            if (Audio) Audio.sfx('hit');
            log('Você acionou um padrão estranho... o livro treme em suas mãos.', '#ff9fbf');
            state.secretTriggered = true;
            state.boss.hp = 0;
            setTimeout(() => triggerBurnEnding(), 900);
        } else {
            state.mistakes++;
            log(`Padrão incorreto! (${MAX_MISTAKES - state.mistakes} tentativas restantes)`, '#ffae42');
            if (Audio) Audio.sfx('damage');
            if (state.mistakes >= MAX_MISTAKES) {
                // boss attacks
                log(`${state.boss.name} contra-ataca! Você recebe dano.`, '#ff6b6b');
                state.hero.hp -= state.boss.attackDamage;
                state.hero.isInvincible = 1000;
                state.screenShake = 15;
                state.mistakes = 0;
                if (state.hero.hp <= 0) { state.hero.hp = 0; gameOver(); }
            }
        }
        resetPattern();
    }

    // secret burn ending
    function triggerBurnEnding() {
        state.mode = 'vn'; updateModeLabel();
        const burnVN = [
            { speaker: '', text: "O livro arde. As páginas cantam e se calam." },
            { speaker: 'Você', text: "Não mais correntes. Não mais instruções que me prendem." },
            { speaker: 'Espírito do Herói', text: "Se queimá-lo, nossas histórias se apagarão. Mas talvez seja libertador." },
            { speaker: 'Narrador', text: "Você incendiou o Bestiário. A chama levou as palavras... e um fim." }
        ];
        playVN(burnVN, () => {
            playInterlude("Nas margens queimadas surge uma última linha: 'Eu também achei um livro.'", () => {
                playVN([{ speaker: 'Narrador', text: "O ciclo terminara — mas a memória do livro virou lição, não correntes." }],
                    () => {
                        log('Final secreto: o Bestiário foi destruído; o ciclo foi quebrado.', '#ffd580');
                        state.boss = null;
                        setUIEnabled(false);
                    });
            });
        });
    }

    // game over
    function gameOver() {
        state.mode = 'gameover'; updateModeLabel();
        document.getElementById('gameOverModal').classList.remove('hidden');
        if (Audio) Audio.sfx('damage');
    }

    document.getElementById('restartGame').onclick = () => {
        state.hero.hp = state.hero.maxHp = 5;
        state.inputs = []; state.mistakes = 0; state.storyIndex = 0; state.chapterIndex = 0; state.discovered = [];
        state.mode = 'vn'; updateModeLabel();
        document.getElementById('gameOverModal').classList.add('hidden');
        playVN(storySegments[0].vn, () => { loadBoss(storySegments[0].boss); state.mode = 'playing'; setUIEnabled(true); updateModeLabel(); });
    };

    // draw loop
    const GRAVITY = 0.5, GROUND_Y = 360, MAX_MISTAKES = 3;
    let last = performance.now();

    // *** FUNÇÃO drawHero SUBSTITUÍDA ***
    function drawHero() {
        const h = state.hero;
        ctx.save();

        // 1. Desenha a sombra no chão
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        // Ajusta a sombra para o tamanho do sprite
        ctx.ellipse(h.x, GROUND_Y, h.w / 4.5, h.w / 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Seleciona o array de animação correto
        let currentAnimArray = heroSprites.idle;
        if (h.animState === 'attack1' && heroSprites.attack1.length > 0) {
            currentAnimArray = heroSprites.attack1;
        }

        // 3. Pega o frame (imagem) atual
        let frameImg = currentAnimArray[h.animFrame];
        if (!frameImg) {
            // Fallback caso a imagem não esteja carregada
            frameImg = heroSprites.idle[0];
        }

        // 4. Lógica para virar o sprite (esquerda/direita)
        if (h.dir === 'left') {
            ctx.scale(-1, 1);
        }

        // 5. Desenha a imagem na tela
        if (frameImg && frameImg.complete) {
            // A posição (h.x, h.y) é a base central do herói
            const drawX = (h.x - h.w / 2);
            const drawY = (h.y - h.h); // h.y é o chão, desenha h.h pixels para cima

            if (h.dir === 'left') {
                // Ao usar scale(-1, 1), a coordenada X é invertida
                ctx.drawImage(frameImg, -drawX - h.w, drawY, h.w, h.h);
            } else {
                ctx.drawImage(frameImg, drawX, drawY, h.w, h.h);
            }
        }

        ctx.restore();
    }
    // *** FIM DA SUBSTITUIÇÃO ***

    function drawBoss() {
        if (!state.boss) return;
        const bx = 660, by = GROUND_Y;
        state.boss.x = bx; state.boss.y = by - 60;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(bx, GROUND_Y, 80, 18, 0, 0, Math.PI * 2); ctx.fill();
        if (state.boss.img && bossImages[state.boss.id] && bossImages[state.boss.id].loaded) {
            const img = bossImages[state.boss.id].img;
            const fixedH = 160;
            const aspect = img.width / img.height || 1;
            const w = fixedH * aspect;
            const h = fixedH;
            ctx.drawImage(img, bx - w / 2, by - h, w, h);
        } else {
            ctx.fillStyle = '#b0753d'; ctx.fillRect(bx - 50, by - 120, 100, 120);
            ctx.fillStyle = '#7a4b2b'; ctx.fillRect(bx - 18, by - 30, 36, 28);
        }
        ctx.restore();
    }

    function drawHUD() {
        ctx.save();
        ctx.font = '14px system-ui';
        ctx.fillStyle = 'white'; ctx.fillText(`Herói: ${state.hero.hp} / ${state.hero.maxHp}`, 20, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(20, 34, 220, 14);
        ctx.fillStyle = 'var(--hp)'; ctx.fillRect(20, 34, 220 * (state.hero.hp / state.hero.maxHp || 0), 14);
        if (state.boss) {
            const bw = 220, bx = canvas.width - bw - 20, ratio = Math.max(0, Math.min(1, state.boss.hp / state.boss.maxHp));
            ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(bx, 34, bw, 14);
            ctx.fillStyle = 'var(--boss-hp)'; ctx.fillRect(bx + (bw * (1 - ratio)), 34, bw * ratio, 14);
            ctx.fillStyle = 'white'; ctx.textAlign = 'right'; ctx.fillText(`${state.boss.name}: ${Math.max(0, Math.floor(state.boss.hp))} / ${state.boss.maxHp}`, canvas.width - 25, 35); ctx.textAlign = 'left';
        }
        ctx.fillStyle = 'white'; ctx.fillText('Tentativas: ', 20, 62);
        for (let i = 0; i < MAX_MISTAKES; i++) {
            ctx.fillStyle = i < state.mistakes ? 'rgba(0,0,0,0.35)' : '#ef4444';
            ctx.fillRect(110 + i * 18, 48, 14, 14);
        }
        ctx.restore();
    }

    function drawGame(dt) {
        ctx.save();
        if (state.screenShake && state.screenShake > 0) {
            const dx = (Math.random() - 0.5) * state.screenShake * 1.5;
            const dy = (Math.random() - 0.5) * state.screenShake * 1.5;
            ctx.translate(dx, dy);
            state.screenShake *= 0.9;
            if (state.screenShake < 1) state.screenShake = 0;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#04111a'; ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
        drawHero();
        drawBoss();
        drawHUD();
        ctx.restore();
    }

    // *** CONSTANTE DE ANIMAÇÃO ADICIONADA ***
    const ANIM_SPEED = 90; // ms por frame (aprox 11 FPS)

    // *** FUNÇÃO loop ATUALIZADA ***
    function loop(now) {
        const dt = now - last; last = now;

        // Física do Herói
        if (!state.hero.isGrounded) {
            state.hero.vy += GRAVITY; state.hero.y += state.hero.vy;
            if (state.hero.y >= GROUND_Y) { state.hero.y = GROUND_Y; state.hero.vy = 0; state.hero.isGrounded = true; }
        }

        // LÓGICA DE ANIMAÇÃO DO HERÓI (NOVO)
        const h = state.hero;
        h.animTimer += dt;
        if (h.animTimer >= ANIM_SPEED) {
            h.animTimer = 0;
            h.animFrame++;

            if (h.animState === 'idle') {
                if (h.animFrame >= heroSprites.idle.length) {
                    h.animFrame = 0; // Reinicia animação idle
                }
            } else if (h.animState === 'attack1') {
                if (h.animFrame >= heroSprites.attack1.length) {
                    h.animFrame = 0;
                    h.animState = 'idle'; // Retorna para 'idle' após o ataque
                }
            }
        }
        // FIM DA LÓGICA DE ANIMAÇÃO

        //if (state.hero.isAttacking > 0) state.hero.isAttacking -= dt; // Linha antiga removida
        if (state.hero.isInvincible > 0) state.hero.isInvincible -= dt;
        if (state.boss && state.boss.isAttacking > 0) state.boss.isAttacking -= dt;

        if (state.mode === 'playing' || state.mode === 'arena') drawGame(dt);
        else if (state.mode === 'vn') drawIntro();
        else if (state.mode === 'gameover') drawGame(dt);

        requestAnimationFrame(loop);
    }
    // *** FIM DA ATUALIZAÇÃO ***

    function drawIntro() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#061020'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white'; ctx.textAlign = 'center';
        ctx.font = 'bold 36px system-ui'; ctx.fillText('O Bestiário do Herói', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px system-ui'; ctx.fillText('v1.2 — O Eterno Retorno', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }

    // mode label
    function updateModeLabel() { modeLabel.textContent = state.mode === 'vn' ? 'Visual Novel' : state.mode === 'playing' ? 'Combate' : state.mode === 'arena' ? 'Arena' : state.mode === 'interlude' ? 'Interlúdio' : state.mode === 'gameover' ? 'Game Over' : state.mode; }

    function setUIEnabled(enabled) {
        document.getElementById('openBest').disabled = !enabled;
        executarBtn.disabled = !enabled;
        resetBtn.disabled = !enabled;
        nextBossBtn.disabled = !enabled;
    }

    // controls hooking
    vnNext.onclick = () => { }; // assigned dynamically on playVN
    openVNBtn.onclick = () => { playVN(VN_PROLOGUE, () => { loadBoss(BESTIARY.HARPY); state.mode = 'playing'; updateModeLabel(); setUIEnabled(true); }); };

    executarBtn.onclick = () => confirmAction();
    resetBtn.onclick = () => resetPattern();
    nextBossBtn.onclick = () => { loadBoss(makeRandomBoss()); state.mode = 'arena'; updateModeLabel(); setUIEnabled(true); nextBossBtn.style.display = 'inline-block'; };

    document.getElementById('openVN').onclick = () => playVN(VN_PROLOGUE);
    document.getElementById('openBest').onclick = () => { refreshBestiary(); };
    document.getElementById('openBest').addEventListener('click', () => { refreshBestiary(); bestiaryModal.classList.remove('hidden'); Audio.sfx('page'); });

    // attach on-screen actions to same registerAction so input unify
    // (already bound above)

    // ensure audio resumes on first user gesture
    function ensureAudioOnGesture() {
        const resume = async () => {
            try { await Audio.resumeOnGesture(); await Audio.startMusic(); } catch (e) { }
            document.body.removeEventListener('click', resume);
            document.body.removeEventListener('keydown', resume);
        };
        document.body.addEventListener('click', resume);
        document.body.addEventListener('keydown', resume);
    }
    ensureAudioOnGesture();

    // initial boot
    updateModeLabel();
    refreshBestiary();
    renderPattern();
    setUIEnabled(false);
    loadHeroSprites(); // *** CHAMADA PARA CARREGAR SPRITES ***
    drawIntro();
    // start VN automatically
    playVN(VN_PROLOGUE, () => {
        loadBoss(BESTIARY.HARPY);
        state.mode = 'playing';
        updateModeLabel();
        setUIEnabled(true);
    });
    requestAnimationFrame(loop);

    // export small helpers for console debugging
    window._GAME = { state, loadBoss, makeRandomBoss, refreshBestiary, confirmAction, registerAction };

})();
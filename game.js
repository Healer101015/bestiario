// game.js
// Principal do jogo: VN -> combate -> bestiário
(function () {
    // DOM refs
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    // 'logEl' é gerenciado por ui.js
    const patternContainer = document.getElementById('patternContainer');

    const vnContainer = document.getElementById('vnContainer');
    // const vnText = document.getElementById('vnText'); // Gerenciados por ui.js
    // const vnSpeaker = document.getElementById('vnSpeaker'); // Gerenciados por ui.js
    // const vnPortrait = document.getElementById('vnPortrait'); // Gerenciados por ui.js
    const vnNext = document.getElementById('vnNext');
    const vnSkip = document.getElementById('vnSkip');

    const interludeBox = document.getElementById('interludeBox');
    const interludeText = document.getElementById('interludeText');
    const interludeContinue = document.getElementById('interludeContinue');

    const bestiaryModal = document.getElementById('bestiaryModal');
    // const bestiaryList = document.getElementById('bestiaryList'); // Gerenciados por ui.js
    // const bestiaryPreview = document.getElementById('bestiaryPreview'); // Gerenciados por ui.js
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

    // 'log' é global, definido em ui.js

    // small wrapper for audio
    const Audio = window.AudioAPI;

    // As constantes BESTIARY, BOSS_ANIM_FRAMES, storySegments, etc., 
    // agora são globais, vindas de data.js

    function makeRandomBoss() {
        const pixelBosses = ['MUSHROOM', 'GOBLIN', 'SKELETON', 'FLYING_EYE'];
        const randomKey = pixelBosses[Math.floor(Math.random() * pixelBosses.length)];

        if (BESTIARY[randomKey]) {
            const clone = JSON.parse(JSON.stringify(BESTIARY[randomKey]));
            clone.isProcedural = true;
            clone.phases[0].pattern = Array.from({ length: 3 }, () => ['left', 'right', 'up', 'down', 'attack'][Math.floor(Math.random() * 5)]);
            if (clone.phases[1]) {
                clone.phases[1].pattern = Array.from({ length: 4 }, () => ['left', 'right', 'up', 'down', 'attack'][Math.floor(Math.random() * 5)]);
            }
            return clone;
        }

        // Fallback original
        const names = ['Ogro', 'Espectro', 'Limo', 'Bárbaro'];
        const id = 'RANDOM_' + Date.now() + Math.random().toString(36).slice(2, 8);
        const name = names[Math.floor(Math.random() * names.length)];
        const p1 = { hpThreshold: 0.5, description: 'Criatura estranha', pattern: Array.from({ length: 3 }, () => ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)]) };
        const p2 = { hpThreshold: 0.0, description: 'Enfurecida', pattern: Array.from({ length: 4 }, () => ['left', 'right', 'up', 'down', 'attack'][Math.floor(Math.random() * 5)]) };
        return { id, name, attackDamage: 1, img: '', phases: [p1, p2], notes: ['Entrada gerada.'] };
    }

    // state & save
    const SAVE_KEY = 'bestiario_v1_2_save';
    const state = {
        mode: 'loading', // Novo estado inicial
        hero: {
            x: 120, y: 360, w: 162, h: 162, hp: 5, maxHp: 5, vy: 0, isGrounded: true,
            animState: 'idle',
            animFrame: 0,
            animTimer: 0,
            isInvincible: 0,
            dir: 'right'
        },
        boss: null,
        inputs: [],
        mistakes: 0,
        storyIndex: 0,
        chapterIndex: 0,
        discovered: [],
        secretTriggered: false,
        screenShake: 0
    };

    function saveProgress() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ storyIndex: state.storyIndex, chapterIndex: state.chapterIndex, discovered: state.discovered })); log('Progresso salvo.'); } catch (e) { console.warn(e); } }
    function loadProgress() { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const d = JSON.parse(raw); state.storyIndex = d.storyIndex || 0; state.chapterIndex = d.chapterIndex || 0; state.discovered = d.discovered || []; log('Progresso carregado.'); } } catch (e) { console.warn(e); } }
    loadProgress();

    // Bestiary UI bindings
    openBestBtn.onclick = () => { refreshBestiary(); bestiaryModal.classList.remove('hidden'); Audio.sfx('page'); };
    closeBestBtn.onclick = () => { bestiaryModal.classList.add('hidden'); Audio.sfx('click'); };

    // boss load & management
    function loadBoss(bossData) {
        if (!bossData) return;

        // *** MELHORIA: Lógica de HP removida ***
        // const maxHp = bossData.phases.length * 3 + 2; // Removido

        let defaultAnimState = 'Idle';
        if (bossData.spriteKey === 'FLYING_EYE') {
            defaultAnimState = 'Flight';
        } else if (bossData.spriteKey === 'SKELETON') {
            defaultAnimState = 'Walk';
        }

        state.boss = {
            ...bossData,
            // 'hp' e 'maxHp' removidos
            currentPhase: 0, // A "vida" do chefe agora é sua fase atual
            animState: defaultAnimState,
            animFrame: 0,
            animTimer: 0,
            dir: 'left',
            w: bossData.w || 160,
            h: bossData.h || 160
        };

        state.inputs = [];
        state.mistakes = 0;
        const exists = state.discovered.find(x => (typeof x === 'string' ? x === bossData.id : (x && x.id === bossData.id)));
        if (!exists) {
            state.discovered.push({ id: bossData.id, name: bossData.name, phases: bossData.phases, notes: bossData.notes || [], img: bossData.img || '' });
            saveProgress();
        }
        renderPattern(); // renderPattern é global de ui.js
    }

    // input mapping
    const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', ' ': 'attack', Shift: 'special' };
    window.addEventListener('keydown', (e) => { if (state.mode !== 'playing' && state.mode !== 'arena') return; const action = keyMap[e.key]; if (action) { e.preventDefault(); registerAction(action); } });

    function registerAction(action) {
        if (state.inputs.length >= 8) return;
        if (state.hero.animState === 'attack1') return;

        state.inputs.push(action);
        renderPattern(); // global de ui.js
        if (Audio) Audio.sfx('click');

        if (action === 'left') { state.hero.x -= 12; state.hero.dir = 'left'; }
        if (action === 'right') { state.hero.x += 12; state.hero.dir = 'right'; }
        if (action === 'up' && state.hero.isGrounded) { state.hero.vy = -10; state.hero.isGrounded = false; }

        if (action === 'attack') {
            state.hero.animState = 'attack1';
            state.hero.animFrame = 0;
            state.hero.animTimer = 0;
            if (state.boss && state.boss.spriteKey) {
                state.boss.animState = 'Take Hit';
                state.boss.animFrame = 0;
                state.boss.animTimer = 0;
            }
        }

        if (action === 'up' && state.boss && state.boss.spriteKey === 'SKELETON') {
            state.boss.animState = 'Shield';
            state.boss.animFrame = 0;
        }

        state.hero.x = Math.max(state.hero.w / 2, Math.min(canvas.width - state.hero.w / 2, state.hero.x));
    }

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

    function resetPattern() { state.inputs = []; renderPattern(); if (Audio) Audio.sfx('click'); }

    // confirm action handler
    function confirmAction() {
        if (!state.boss || (state.mode !== 'playing' && state.mode !== 'arena')) return;

        if (state.boss && state.boss.spriteKey) {
            state.boss.animState = 'Attack';
            state.boss.animFrame = 0;
            state.boss.animTimer = 0;
        }

        const phase = state.boss.phases[state.boss.currentPhase];
        if (!phase) {
            log('Erro: Chefe sem fase definida.', '#ff6b6b'); // log global
            return;
        }

        const success = JSON.stringify(state.inputs) === JSON.stringify(phase.pattern);
        const secretSeq = ['special', 'special', 'attack', 'up'];

        // *** MELHORIA: Lógica de HP trocada por checagem de fase final ***
        const isFinalBoss = (state.boss && state.boss.id === 'LICH' && (state.boss.currentPhase === state.boss.phases.length - 1));
        const secretMatch = JSON.stringify(state.inputs) === JSON.stringify(secretSeq);

        if (success) {
            log('Padrão executado corretamente!', '#6bff94');
            if (Audio) Audio.sfx('hit');
            state.mistakes = 0;

            // *** MELHORIA: Lógica de Dano/HP removida. ***
            // state.boss.hp -= 2; // Removido

            // Avança para a próxima fase
            state.boss.currentPhase++;

            // Verifica se o chefe foi derrotado (se a fase atual for >= total de fases)
            if (state.boss.currentPhase >= state.boss.phases.length) {
                // --- LÓGICA DE MORTE ---
                if (state.boss.spriteKey) {
                    state.boss.animState = 'Death';
                    state.boss.animFrame = 0;
                }
                log(`${state.boss.name} foi derrotado!`, '#ffd580');
                if (Audio) Audio.sfx('page');

                const delay = state.boss.spriteKey ? 1500 : 100;

                setTimeout(() => {
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
                }, delay);
                // --- FIM DA LÓGICA DE MORTE ---

            } else {
                // --- LÓGICA DE TRANSIÇÃO DE FASE ---
                log(`${state.boss.name} entra em fúria — novo padrão!`, '#ffae42');
                state.screenShake = 20;
                // O chefe agora está na fase 'state.boss.currentPhase', pronto para o próximo padrão
            }

        } else if (secretMatch && isFinalBoss) {
            if (Audio) Audio.sfx('hit');
            log('Você acionou um padrão estranho... o livro treme em suas mãos.', '#ff9fbf');
            state.secretTriggered = true;
            // state.boss.hp = 0; // Removido
            setTimeout(() => triggerBurnEnding(), 900);
        } else {
            state.mistakes++;
            log(`Padrão incorreto! (${MAX_MISTAKES - state.mistakes} tentativas restantes)`, '#ffae42');
            if (Audio) Audio.sfx('damage');
            if (state.mistakes >= MAX_MISTAKES) {
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

    function drawHero() {
        const h = state.hero;
        const heroSprites = window.GameAssets.heroSprites;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(h.x, GROUND_Y, h.w / 4.5, h.w / 14, 0, 0, Math.PI * 2);
        ctx.fill();

        let currentAnimArray = heroSprites.idle;
        if (h.animState === 'attack1' && heroSprites.attack1.length > 0) {
            currentAnimArray = heroSprites.attack1;
        }

        let frameImg = currentAnimArray[h.animFrame];
        if (!frameImg || !frameImg.complete || frameImg.naturalWidth === 0) {
            frameImg = heroSprites.idle[0];
            if (!frameImg) { ctx.restore(); return; }
        }

        if (h.dir === 'left') ctx.scale(-1, 1);
        const drawX = (h.x - h.w / 2);
        const drawY = (h.y - h.h);

        if (h.dir === 'left') {
            ctx.drawImage(frameImg, -drawX - h.w, drawY, h.w, h.h);
        } else {
            ctx.drawImage(frameImg, drawX, drawY, h.w, h.h);
        }
        ctx.restore();
    }

    function drawBoss() {
        if (!state.boss) return;

        const b = state.boss;
        const bx = 660, by = GROUND_Y;

        const bossSpriteSheets = window.GameAssets.bossSpriteSheets;
        const bossImages = window.GameAssets.bossImages;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(bx, GROUND_Y, b.w / 2.5, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(-1, 1);
        const drawX = -(bx - b.w / 2) - b.w;
        const drawY = by - b.h;

        if (b.spriteKey && BOSS_ANIM_FRAMES[b.spriteKey]) {
            let animName = b.animState;
            if (animName === 'Idle' && b.spriteKey === 'FLYING_EYE') animName = 'Flight';
            if (animName === 'Idle' && b.spriteKey === 'SKELETON') animName = 'Walk';

            const sheet = bossSpriteSheets[b.spriteKey][animName];
            const frameCount = BOSS_ANIM_FRAMES[b.spriteKey][animName];

            if (sheet && sheet.complete && sheet.naturalWidth > 0 && frameCount > 0) {
                const frameW = sheet.naturalWidth / frameCount;
                const frameH = sheet.naturalHeight;
                const sx = b.animFrame * frameW;
                ctx.drawImage(sheet, sx, 0, frameW, frameH, drawX, drawY, b.w, b.h);
            } else {
                ctx.fillStyle = '#b03d3d'; ctx.fillRect(drawX, drawY, b.w, b.h);
            }

        } else if (b.img && bossImages[b.id] && bossImages[b.id].loaded) {
            const img = bossImages[b.id].img;
            const fixedH = b.h;
            const aspect = img.width / img.height || 1;
            const fixedW = fixedH * aspect;
            const staticDrawX = -(bx - fixedW / 2) - fixedW;
            const staticDrawY = by - fixedH;
            ctx.drawImage(img, staticDrawX, staticDrawY, fixedW, fixedH);
        } else {
            ctx.fillStyle = '#7a4b2b'; ctx.fillRect(drawX, drawY, b.w, b.h);
        }
        ctx.restore();
    }


    function drawHUD() {
        ctx.save();
        ctx.font = '14px system-ui';
        ctx.fillStyle = 'white'; ctx.fillText(`Herói: ${state.hero.hp} / ${state.hero.maxHp}`, 20, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(20, 34, 220, 14);
        ctx.fillStyle = 'var(--hp)'; ctx.fillRect(20, 34, 220 * (state.hero.hp / state.hero.maxHp || 0), 14);

        // *** MELHORIA: HUD do Chefe agora mostra Fases, não HP ***
        if (state.boss) {
            const totalPhases = state.boss.phases.length;

            ctx.fillStyle = 'white'; ctx.textAlign = 'right';
            ctx.font = '16px system-ui';
            // Mostra o nome do chefe
            ctx.fillText(`${state.boss.name}`, canvas.width - 25, 35);

            // Desenha os blocos de fase
            const blockW = 20, blockGap = 6; // Tamanho de cada bloco de "vida"
            const totalW = (blockW + blockGap) * totalPhases - blockGap;
            const startX = canvas.width - 25 - totalW; // Posição inicial

            for (let i = 0; i < totalPhases; i++) {
                // Fase já completada (escura)
                if (i < state.boss.currentPhase) {
                    ctx.fillStyle = 'rgba(220, 38, 38, 0.4)'; // Vermelho/Vazio
                }
                // Fase atual (cheia)
                else {
                    ctx.fillStyle = 'var(--boss-hp)'; // Vermelho/Cheio
                }
                ctx.fillRect(startX + i * (blockW + blockGap), 44, blockW, 10);
            }
            ctx.textAlign = 'left';
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

    const ANIM_SPEED = 90;
    const BOSS_ANIM_SPEED = 120;

    function loop(now) {
        const dt = now - last; last = now;

        // Física e Animação do Herói
        const h = state.hero;
        const heroSprites = window.GameAssets.heroSprites;

        if (!h.isGrounded) {
            h.vy += GRAVITY; h.y += h.vy;
            if (h.y >= GROUND_Y) { h.y = GROUND_Y; h.vy = 0; h.isGrounded = true; }
        }

        h.animTimer += dt;
        if (h.animTimer >= ANIM_SPEED) {
            h.animTimer = 0;
            h.animFrame++;

            if (h.animState === 'idle') {
                if (h.animFrame >= heroSprites.idle.length) h.animFrame = 0;
            } else if (h.animState === 'attack1') {
                if (h.animFrame >= heroSprites.attack1.length) {
                    h.animFrame = 0; h.animState = 'idle';
                }
            }
        }

        // Animação do Chefe
        if (state.boss && state.boss.spriteKey) {
            const b = state.boss;
            b.animTimer += dt;
            if (b.animTimer >= BOSS_ANIM_SPEED) {
                b.animTimer = 0;
                let animName = b.animState;
                if (animName === 'Idle' && b.spriteKey === 'FLYING_EYE') animName = 'Flight';
                if (animName === 'Idle' && b.spriteKey === 'SKELETON') animName = 'Walk';

                const frameCount = BOSS_ANIM_FRAMES[b.spriteKey][animName];

                if (frameCount) {
                    b.animFrame++;
                    if (b.animFrame >= frameCount) {
                        if (b.animState === 'Attack' || b.animState === 'Take Hit' || b.animState === 'Shield') {
                            b.animFrame = 0;
                            if (b.spriteKey === 'FLYING_EYE') b.animState = 'Flight';
                            else if (b.spriteKey === 'SKELETON') b.animState = 'Walk';
                            else b.animState = 'Idle';
                        }
                        else if (b.animState === 'Death') {
                            b.animFrame = frameCount - 1;
                        }
                        else {
                            b.animFrame = 0;
                        }
                    }
                } else {
                    b.animFrame = 0;
                }
            }
        }

        if (state.hero.isInvincible > 0) state.hero.isInvincible -= dt;

        // Lógica de Renderização
        if (state.mode === 'playing' || state.mode === 'arena' || state.mode === 'gameover') {
            drawGame(dt);
        } else if (state.mode === 'vn' || state.mode === 'loading') {
            drawIntro(); // Reutiliza a tela de intro para loading
        }

        requestAnimationFrame(loop);
    }

    // Atualiza drawIntro para mostrar o status de carregamento
    function drawIntro() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#061020'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white'; ctx.textAlign = 'center';

        if (state.mode === 'loading') {
            ctx.font = 'bold 24px system-ui';
            ctx.fillText('Carregando Assets...', canvas.width / 2, canvas.height / 2 - 20);
            const progress = window.GameAssets._totalAssets > 0 ? (window.GameAssets._loadedAssets / window.GameAssets._totalAssets) : 0;
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2, 200, 10);
            ctx.fillStyle = '#6bff94';
            ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2, 200 * progress, 10);
        } else {
            ctx.font = 'bold 36px system-ui'; ctx.fillText('O Bestiário do Herói', canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '20px system-ui'; ctx.fillText('v1.2 — O Eterno Retorno', canvas.width / 2, canvas.height / 2);
        }
        ctx.textAlign = 'left';
    }

    function setUIEnabled(enabled) {
        document.getElementById('openBest').disabled = !enabled;
        executarBtn.disabled = !enabled;
        resetBtn.disabled = !enabled;
        nextBossBtn.style.display = (state.mode === 'arena' && enabled) ? 'inline-block' : 'none';
    }

    // controls hooking
    vnNext.onclick = () => { }; // assigned dynamically on playVN
    openVNBtn.onclick = () => { playVN(VN_PROLOGUE, () => { loadBoss(BESTIARY.HARPY); state.mode = 'playing'; updateModeLabel(); setUIEnabled(true); }); };

    executarBtn.onclick = () => confirmAction();
    resetBtn.onclick = () => resetPattern();
    nextBossBtn.onclick = () => { loadBoss(makeRandomBoss()); state.mode = 'arena'; updateModeLabel(); setUIEnabled(true); };

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

    // *** MELHORIA: Inicialização (Boot) ***
    updateModeLabel(); // Define como "Carregando..."
    renderPattern();
    setUIEnabled(false);

    // Inicia o loop de renderização (vai mostrar a tela 'loading')
    requestAnimationFrame(loop);

    // Inicia o carregamento de assets
    window.GameAssets.loadAll(
        (progress) => {
            // Atualiza o progresso (o loop de desenho 'drawIntro' vai ler)
            window.GameAssets._loadedAssets = progress * window.GameAssets._totalAssets;
            // console.log(`Loading: ${Math.floor(progress * 100)}%`);
        },
        () => {
            // 2. Carregamento completo
            log('Todos os assets carregados.', '#90ee90');
            refreshBestiary(); // Prepara o bestiário

            // 3. Inicia a história
            const startSegment = storySegments[state.storyIndex] || storySegments[0];
            state.mode = 'vn';
            updateModeLabel();

            playVN(startSegment.vn, () => {
                if (startSegment.boss) {
                    loadBoss(startSegment.boss);
                    state.mode = 'playing';
                } else {
                    loadBoss(makeRandomBoss());
                    state.mode = 'arena';
                }
                updateModeLabel();
                setUIEnabled(true);
            });
        }
    );

    // export small helpers for console debugging
    window._GAME = {
        state, loadBoss, makeRandomBoss, refreshBestiary, confirmAction, registerAction, BESTIARY,
        assets: window.GameAssets
    };

})();
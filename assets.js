// assets.js
// Gerencia o carregamento de todos os assets (sprites do Herói e Chefes)

// *** DEFINIÇÕES DE SPRITES ***
const heroSprites = {
    idle: [],
    attack1: []
};

const bossSpriteSheets = {
    MUSHROOM: {}, GOBLIN: {}, SKELETON: {}, 'FLYING_EYE': {}
};

// Imagens estáticas do bestiário (Harpy, Golem, etc.)
const bossImages = {};

// 8 frames idle (0-7), 6 frames attack (0-5)
const totalHeroSprites = 8 + 6;
let totalBossSprites = 0; // Calculado dinamicamente
let totalStaticBossImages = 0; // Calculado dinamicamente

// *** FUNÇÕES DE CARREGAMENTO ***

function loadHeroSprites(onSpriteLoadCallback) {
    // Carregar Idle (0-7)
    for (let i = 0; i < 8; i++) {
        const img = new Image();
        img.src = `hero/Idle/HeroKnight_Idle_${i}.png`;
        img.onload = onSpriteLoadCallback;
        img.onerror = () => { console.error(`Erro ao carregar hero/Idle/HeroKnight_Idle_${i}.png`); onSpriteLoadCallback(); };
        heroSprites.idle.push(img);
    }

    // Carregar Attack1 (0-5)
    for (let i = 0; i < 6; i++) {
        const img = new Image();
        img.src = `hero/Attack1/HeroKnight_Attack1_${i}.png`;
        img.onload = onSpriteLoadCallback;
        img.onerror = () => { console.error(`Erro ao carregar hero/Attack1/HeroKnight_Attack1_${i}.png`); onSpriteLoadCallback(); };
        heroSprites.attack1.push(img);
    }

    return totalHeroSprites;
}


function loadBossSprites(onSpriteLoadCallback) {
    let count = 0;
    Object.keys(BOSS_ANIM_FRAMES).forEach(bossKey => {
        const anims = BOSS_ANIM_FRAMES[bossKey];
        Object.keys(anims).forEach(animKey => {
            count++;
            const img = new Image();
            // Constrói o caminho (ex: bosses/Flying eye/Attack.png)
            const path = `bosses/${bossKey === 'FLYING_EYE' ? 'Flying eye' : bossKey}/${animKey}.png`;
            img.src = path;
            img.onload = onSpriteLoadCallback;
            img.onerror = () => { console.error(`Erro ao carregar ${path}`); onSpriteLoadCallback(); };
            bossSpriteSheets[bossKey][animKey] = img;
        });
    });
    totalBossSprites = count;
    return totalBossSprites;
}

function loadBestiaryPreviewImages(onSpriteLoadCallback) {
    let count = 0;
    Object.values(BESTIARY).forEach(b => {
        if (!b.img) return; // Pula se não houver imagem

        count++;
        const img = new Image();
        img.src = b.img; // Caminho relativo (ex: 'assets/images/harpy.png' ou 'bosses/Mushroom/Idle.png')
        bossImages[b.id] = { img, loaded: false };
        img.onload = () => {
            bossImages[b.id].loaded = true;
            onSpriteLoadCallback();
        };
        img.onerror = () => { console.error(`Erro ao carregar imagem do bestiário: ${b.img}`); onSpriteLoadCallback(); };
    });
    totalStaticBossImages = count;
    return totalStaticBossImages;
}
// assets.js
// Gerencia o carregamento de todos os assets (sprites do Herói e Chefes)

(function () {
    const GameAssets = {
        heroSprites: {
            idle: [],
            attack1: []
        },
        bossSpriteSheets: {
            MUSHROOM: {}, GOBLIN: {}, SKELETON: {}, 'FLYING_EYE': {}
        },
        bossImages: {},

        _totalAssets: 0,
        _loadedAssets: 0,

        _loadHeroSprites: function (onAssetLoad) {
            let heroSpriteCount = 0;
            const totalHeroSprites = 8 + 6;

            for (let i = 0; i < 8; i++) {
                heroSpriteCount++;
                const img = new Image();
                img.src = `hero/Idle/HeroKnight_Idle_${i}.png`;
                img.onload = onAssetLoad;
                img.onerror = () => { console.error(`Erro ao carregar hero/Idle/HeroKnight_Idle_${i}.png`); onAssetLoad(); };
                this.heroSprites.idle.push(img);
            }

            for (let i = 0; i < 6; i++) {
                heroSpriteCount++;
                const img = new Image();
                img.src = `hero/Attack1/HeroKnight_Attack1_${i}.png`;
                img.onload = onAssetLoad;
                img.onerror = () => { console.error(`Erro ao carregar hero/Attack1/HeroKnight_Attack1_${i}.png`); onAssetLoad(); };
                this.heroSprites.attack1.push(img);
            }
            return heroSpriteCount;
        },

        _loadBossSprites: function (onAssetLoad) {
            let count = 0;
            Object.keys(BOSS_ANIM_FRAMES).forEach(bossKey => {
                const anims = BOSS_ANIM_FRAMES[bossKey];
                Object.keys(anims).forEach(animKey => {
                    count++;
                    const img = new Image();
                    const path = `bosses/${bossKey === 'FLYING_EYE' ? 'Flying eye' : bossKey}/${animKey}.png`;
                    img.src = path;
                    img.onload = onAssetLoad;
                    img.onerror = () => { console.error(`Erro ao carregar ${path}`); onAssetLoad(); };
                    this.bossSpriteSheets[bossKey][animKey] = img;
                });
            });
            return count;
        },

        _loadBestiaryPreviewImages: function (onAssetLoad) {
            let count = 0;
            Object.values(BESTIARY).forEach(b => {
                if (!b.img) return;
                count++;
                const img = new Image();
                img.src = b.img;
                this.bossImages[b.id] = { img, loaded: false };
                img.onload = () => {
                    this.bossImages[b.id].loaded = true;
                    onAssetLoad();
                };
                img.onerror = () => { console.error(`Erro ao carregar imagem do bestiário: ${b.img}`); onAssetLoad(); };
            });
            return count;
        },

        loadAll: function (onProgress, onComplete) {
            let totalToLoad = 0;
            let loadedCount = 0;

            const onAssetLoadCallback = () => {
                loadedCount++;
                const progress = loadedCount / totalToLoad;
                this._loadedAssets = loadedCount;
                if (onProgress) onProgress(progress);
                if (loadedCount === totalToLoad) {
                    if (onComplete) onComplete();
                }
            };

            const heroCount = 8 + 6;
            let bossSpriteCount = 0;
            Object.keys(BOSS_ANIM_FRAMES).forEach(bossKey => {
                bossSpriteCount += Object.keys(BOSS_ANIM_FRAMES[bossKey]).length;
            });
            let bestiaryImgCount = 0;
            Object.values(BESTIARY).forEach(b => { if (b.img) bestiaryImgCount++; });

            totalToLoad = heroCount + bossSpriteCount + bestiaryImgCount;
            this._totalAssets = totalToLoad;

            // start loaders (they call onAssetLoadCallback once per file)
            this._loadHeroSprites(onAssetLoadCallback);
            this._loadBossSprites(onAssetLoadCallback);
            this._loadBestiaryPreviewImages(onAssetLoadCallback);

            if (totalToLoad === 0) {
                this._loadedAssets = 0;
                if (onProgress) onProgress(1);
                if (onComplete) onComplete();
            }
        }
    };

    window.GameAssets = GameAssets;
})();

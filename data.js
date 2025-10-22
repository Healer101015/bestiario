// data.js — versão corrigida (3 chefes + epílogo + interludes restaurados)

// === ANIMAÇÕES DOS CHEFES ===
const BOSS_ANIM_FRAMES = {
    MUSHROOM: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    GOBLIN: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    SKELETON: { 'Idle': 4, 'Attack': 8, 'Walk': 4, 'Death': 4, 'Take Hit': 4, 'Shield': 4 },
    FLYING_EYE: { 'Flight': 8, 'Attack': 8, 'Death': 4, 'Take Hit': 4 }
};

// === BESTIÁRIO (somente os 3 chefes principais) ===
const BESTIARY = {
    HARPY: {
        id: 'HARPY', name: 'Harpia das Ruínas', attackDamage: 1,
        img: 'assets/images/harpy.png',
        phases: [
            { hpThreshold: 0.66, description: "Voa entre pilares e mergulha.", pattern: ['left', 'right', 'up'] },
            { hpThreshold: 0.33, description: "Enfurecida, rasga o céu.", pattern: ['left', 'down', 'right', 'up'] }
        ],
        notes: [
            "Tática: o mergulho é sua brecha.",
            "História: o grito dela soava humano.",
            "Fardo: o livro lembra, mesmo quando eu quero esquecer."
        ]
    },

    GOLEM: {
        id: 'GOLEM', name: 'Golem de Magma', attackDamage: 2,
        img: 'assets/images/golem.png',
        phases: [
            { hpThreshold: 0.5, description: 'Pule sobre a onda e ataque o núcleo.', pattern: ['right', 'up', 'attack', 'attack'] },
            { hpThreshold: 0, description: 'Núcleo superaquecido; mais longo.', pattern: ['right', 'up', 'special', 'attack', 'attack'] }
        ],
        notes: [
            "Tática: o ritmo é o segredo.",
            "História: perdi minha manopla aqui.",
            "Fardo: rocha e fogo não sentem — eu invejo isso."
        ]
    },

    LICH: {
        id: 'LICH', name: 'Lich Ancião', attackDamage: 1,
        img: 'assets/images/lich.png',
        phases: [
            { hpThreshold: 0.66, description: 'Canaliza magia; use especial.', pattern: ['up', 'down', 'special'] },
            { hpThreshold: 0.33, description: 'Invoca espíritos; padrão invertido.', pattern: ['special', 'down', 'up'] },
            { hpThreshold: 0, description: 'Combinação final.', pattern: ['up', 'special', 'down', 'attack'] }
        ],
        notes: [
            "Tática: use o [especial] para quebrar as barreiras.",
            "História: ele sabia que eu voltaria.",
            "Fardo: eu fui o herói anterior — e falhei."
        ]
    },

    // boss falso para epílogo
    DUMMY_END: {
        id: 'DUMMY_END', name: 'Silêncio Eterno', attackDamage: 0,
        img: '',
        phases: [{ hpThreshold: 1, description: '...', pattern: [] }],
        notes: ["O ciclo terminou."]
    }
};

// === VISUAL NOVEL ===
const VN_PROLOGUE = [
    { speaker: '', text: "O livro jazia sob pó e ossos." },
    { speaker: 'Espírito do Herói', text: "Outro encontrou meu fardo." },
    { speaker: 'Espírito do Herói', text: "Cada página é um testamento da minha fraqueza." },
    { speaker: 'Espírito do Herói', text: "Leve o Bestiário. Termine o que eu não pude." },
    { speaker: 'Narrador', text: "Você ergue o livro. Ele parece pesado. Uma palavra ecoa: 'Concluir'." }
];

// === INTERLÚDIOS (RESTAURADOS) ===
const INTERLUDES = [
    "Página amarelada: 'Fui impaciente com o Golem. O brilho enganou-me.'",
    "Rabisco na margem: 'A Harpia cantou. Eu não ouvi.'",
    "Nota trêmula: 'Escrevo para um espelho. Não me reconheço mais.'",
    "Mancha de tinta: 'Por que condenei outro a seguir meus passos?'",
    "Rasura: 'O Lich sussurrou meu nome. Ele sabia que eu voltaria.'"
];

// === HISTÓRIA (3 CHEFES + epílogo) ===
const storySegments = [
    // 0 — Prólogo + Harpia
    { vn: VN_PROLOGUE, boss: BESTIARY.HARPY },

    // 1 — Golem
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "A Harpia caiu, mas a culpa não." },
            { speaker: 'Espírito do Herói', text: "O Golem me ensinou a suportar o calor e a perda." },
            { speaker: 'Narrador', text: "As chamas ecoam na memória." }
        ],
        boss: BESTIARY.GOLEM
    },

    // 2 — Lich final
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "O Lich sabia meus passos antes que eu os desse." },
            { speaker: 'Espírito do Herói', text: "Ele ria e dizia: 'Até entender, você voltará'." },
            { speaker: 'Narrador', text: "O frio vem da alma. O fim se aproxima." }
        ],
        boss: BESTIARY.LICH
    },

    // 3 — Epílogo
    {
        vn: [
            { speaker: 'Narrador', text: "Com o Lich derrotado, o livro treme." },
            { speaker: 'Espírito do Herói', text: "Você quebrou a maldição... libertou-me." },
            { speaker: 'Espírito do Herói', text: "Eu pensei que era o herói. Eu era apenas o eco dele." },
            { speaker: 'Narrador', text: "O espírito se dissipa. O ciclo termina." }
        ],
        boss: BESTIARY.DUMMY_END
    }
];

// === EXPORT GLOBAL ===
window.BESTIARY = BESTIARY;
window.BOSS_ANIM_FRAMES = BOSS_ANIM_FRAMES;
window.INTERLUDES = INTERLUDES;
window.storySegments = storySegments;

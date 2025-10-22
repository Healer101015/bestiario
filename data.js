// data.js
// Contém todos os dados estáticos do jogo (Bestiário, Diálogos, Animações)

// *** DADOS DE ANIMAÇÃO DOS CHEFES ***
const BOSS_ANIM_FRAMES = {
    MUSHROOM: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    GOBLIN: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    SKELETON: { 'Idle': 4, 'Attack': 8, 'Walk': 4, 'Death': 4, 'Take Hit': 4, 'Shield': 4 },
    'FLYING_EYE': { 'Flight': 8, 'Attack': 8, 'Death': 4, 'Take Hit': 4 }
};

// *** BESTIÁRIO ***
const BESTIARY = {
    HARPY: {
        id: 'HARPY', name: 'Harpia das Ruínas', attackDamage: 1,
        img: 'assets/images/harpy.png', // Caminho corrigido
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
        img: 'assets/images/golem.png', // Caminho corrigido
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
        img: 'assets/images/lich.png', // Caminho corrigido
        phases: [
            { hpThreshold: 0.66, description: 'Canaliza magia; use especial.', pattern: ['up', 'down', 'special'] },
            { hpThreshold: 0.33, description: 'Invoca espíritos; padrão invertido.', pattern: ['special', 'down', 'up'] },
            { hpThreshold: 0, description: 'Combinação final.', pattern: ['up', 'special', 'down', 'attack'] }
        ],
        notes: [
            "Página 21 — Ele sussurrou meu nome.",
            "Não morri por orgulho, mas por confiar demais nas notas."
        ]
    },
    // *** NOVOS CHEFES ANIMADOS ***
    MUSHROOM: {
        id: 'MUSHROOM', name: 'Cogumelo Errante', attackDamage: 1,
        img: 'bosses/Mushroom/Idle.png', // Imagem para o bestiário
        spriteKey: 'MUSHROOM', // Chave para os spritesheets
        w: 120, h: 120, // Tamanho no canvas
        phases: [
            { hpThreshold: 0.5, description: 'Corre e ataca.', pattern: ['left', 'left', 'attack'] },
            { hpThreshold: 0, description: 'Ataque furioso.', pattern: ['left', 'attack', 'left', 'attack'] }
        ],
        notes: ["Encontrado nas cavernas úmidas.", "Parece zangado."]
    },
    GOBLIN: {
        id: 'GOBLIN', name: 'Goblin Batedor', attackDamage: 1,
        img: 'bosses/Goblin/Idle.png',
        spriteKey: 'GOBLIN',
        w: 130, h: 130,
        phases: [
            { hpThreshold: 0.5, description: 'Esfaqueia rapidamente.', pattern: ['attack', 'attack'] },
            { hpThreshold: 0, description: 'Corre e esfaqueia.', pattern: ['right', 'right', 'attack', 'attack'] }
        ],
        notes: ["Rápido e traiçoeiro.", "Protege bugigangas brilhantes."]
    },
    SKELETON: {
        id: 'SKELETON', name: 'Esqueleto Guarda', attackDamage: 1,
        img: 'bosses/Skeleton/Idle.png',
        spriteKey: 'SKELETON',
        w: 140, h: 140,
        phases: [
            { hpThreshold: 0.5, description: 'Levanta o escudo e ataca.', pattern: ['up', 'attack'] }, // 'up' = 'Shield' (metafórico)
            { hpThreshold: 0, description: 'Sequência de guarda.', pattern: ['up', 'attack', 'down', 'attack'] }
        ],
        notes: ["O escudo bloqueia o primeiro golpe.", "Não sente nada."]
    },
    FLYING_EYE: {
        id: 'FLYING_EYE', name: 'Olho Alado', attackDamage: 1,
        img: 'bosses/Flying eye/Flight.png',
        spriteKey: 'FLYING_EYE',
        w: 160, h: 160,
        phases: [
            { hpThreshold: 0.5, description: 'Voa em círculos.', pattern: ['up', 'down', 'up'] },
            { hpThreshold: 0, description: 'Mergulho rápido.', pattern: ['up', 'down', 'attack'] }
        ],
        notes: ["Nunca pisca.", "Difícil de acertar."]
    }
};

// *** DADOS DA HISTÓRIA (VN) ***
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
    // *** HISTÓRIA ATUALIZADA PARA INCLUIR NOVOS CHEFES ***
    {
        vn: [
            { speaker: 'Narrador', text: "As cavernas gotejantes ecoam. Você encontra rabiscos sobre criaturas menores." },
            { speaker: 'Espírito do Herói', text: "Até os Goblins pareciam zombar de mim. Suas risadas eram como agulhas. Eu os odiava. Eu odiava minha fraqueza." }
        ],
        boss: BESTIARY.GOBLIN // Novo chefe
    },
    {
        vn: [
            { speaker: 'Narrador', text: "Mais fundo. O ar fica pesado com esporos." },
            { speaker: 'Espírito do Herói', text: "O fungo... ele não luta com inteligência. Apenas... fúria. Como eu. Eu quebrei minha lâmina contra seu couro." }
        ],
        boss: BESTIARY.MUSHROOM // Novo chefe
    },
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "Os ossos se levantam. Eles não têm vontade própria, apenas a do mestre." },
            { speaker: 'Espírito do Herói', text: "Eles me lembraram do que eu me tornaria. Um fantoche, preso aqui para sempre." }
        ],
        boss: BESTIARY.SKELETON // Novo chefe
    },
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "O olho... ele vê tudo. Ele viu meu medo." },
            { speaker: 'Espírito do Herói', text: "Eu o acertei, mas ele continuou vindo. Ele não pode ser morto. É apenas um observador." }
        ],
        boss: BESTIARY.FLYING_EYE // Novo chefe
    },
    // *** FIM DA ATUALIZAÇÃO DA HISTÓRIA ***
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
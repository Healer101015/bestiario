// data.js
// Contém todos os dados estáticos do jogo (Bestiário, Diálogos, Animações)

// *** DADOS DE ANIMAÇÃO DOS CHEFES ***
const BOSS_ANIM_FRAMES = {
    MUSHROOM: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    GOBLIN: { 'Idle': 4, 'Attack': 8, 'Run': 8, 'Death': 4, 'Take Hit': 4 },
    SKELETON: { 'Idle': 4, 'Attack': 8, 'Walk': 4, 'Death': 4, 'Take Hit': 4, 'Shield': 4 },
    'FLYING_EYE': { 'Flight': 8, 'Attack': 8, 'Death': 4, 'Take Hit': 4 }
};

// *** BESTIÁRIO (ATUALIZADO COM LORE MELANCÓLICO) ***
const BESTIARY = {
    HARPY: {
        id: 'HARPY', name: 'Harpia das Ruínas', attackDamage: 1,
        img: 'assets/images/harpy.png',
        phases: [
            { hpThreshold: 0.66, description: "Voa entre pilares e mergulha.", pattern: ['left', 'right', 'up'] },
            { hpThreshold: 0.33, description: "Enfurecida, rasga o céu.", pattern: ['left', 'down', 'right', 'up'] }
        ],
        notes: [
            "Tática: O mergulho é o único momento. A sequência [esquerda, direita, cima] é a evasiva para a brecha. Não hesite, ou ela estará no céu novamente.",
            "História: O grito dela... parecia humano. Na primeira vez que a enfrentei, eu parei. Foi o suficiente para rasgar meu ombro. Eu a odiei por isso.",
            // CORREÇÃO: O texto abaixo estava mesclado com um padrão, agora está corrigido.
            "Fardo: Escrevi seu padrão com a mão trêmula, sangue escorrendo pelo pergaminho. Agora, este livro sabe o padrão, mas eu ainda sinto a dor fantasma. Para que serve esta memória senão para atormentar?"
        ]
    },
    GOLEM: {
        id: 'GOLEM', name: 'Golem de Magma', attackDamage: 2,
        img: 'assets/images/golem.png',
        phases: [
            { hpThreshold: 0.5, description: 'Lento e devastador. Pule sobre a onda e ataque o núcleo.', pattern: ['right', 'up', 'attack', 'attack'] },
            { hpThreshold: 0, description: 'Núcleo superaquecido; sequência mais longa.', pattern: ['right', 'up', 'special', 'attack', 'attack'] }
        ],
        notes: [
            "Tática: O calor é uma distração. O padrão é um ritmo: [direita] para evitar a onda, [cima] para pular sobre ela, e [ataque, ataque] no núcleo. Não se apresse.",
            "História: Eu perdi minha manopla esquerda aqui. O couro derreteu na rocha. Por dias, o cheiro de minha própria pele queimada foi tudo o que senti. Eu aprendi o ritmo, mas o fedor nunca saiu.",
            "Fardo: Ele é apenas uma casca. Fúria sem mente. E eu? Eu sou uma memória que se recusa a morrer, forçado a lutar contra rocha e fogo, de novo e de novo. Quem é mais vazio?"
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
            "Tática: Ele zomba de movimentos físicos. O [especial] é necessário para quebrar suas barreiras. Seus padrões invertem na segunda fase; não confie na memória muscular, confie no livro.",
            "História: Ele me disse que eu não era o primeiro. Ele me disse que eu encontraria este livro. Ele riu quando eu usei o padrão que *outro* escreveu. Minha vitória não significou nada.",
            "Fardo: Ele foi quem me quebrou. Não meu corpo, mas minha vontade. Ele me mostrou o ciclo. E agora, ao ler isto, você é a próxima volta da roda. Sinto muito."
        ]
    },
    MUSHROOM: {
        id: 'MUSHROOM', name: 'Cogumelo Errante', attackDamage: 1,
        img: 'bosses/Mushroom/Idle.png',
        spriteKey: 'MUSHROOM',
        w: 120, h: 120,
        phases: [
            { hpThreshold: 0.5, description: 'Corre e ataca.', pattern: ['left', 'left', 'attack'] },
            { hpThreshold: 0, description: 'Ataque furioso.', pattern: ['left', 'attack', 'left', 'attack'] }
        ],
        notes: [
            "Tática: Não se engane pela simplicidade. Mova-se para a [esquerda] duas vezes para desviar da investida, então [ataque]. Ele é pura fúria, use isso contra ele.",
            "História: Eu quebrei minha lâmina contra seu couro. Não por sua força, mas pela minha frustração. Eu bati e bati, e ele apenas... continuou vindo. Como eu.",
            "Fardo: Esta criatura não tem alma. Apenas fome e raiva. Eu a invejo. Sentir apenas isso deve ser uma bênção. Escrever seu padrão pareceu... inútil."
        ]
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
        notes: [
            "Tática: Rápido, mas frágil. Um [ataque, ataque] direto o desequilibra. Se ele correr ([direita, direita]), prepare-se para a mesma sequência de ataque duplo.",
            "História: As risadas dele... ecoavam nas cavernas. Minha armadura pesada era inútil contra mil cortes de adaga. Eu o subestimei. As cicatrizes pequenas são as que mais coçam.",
            "Fardo: Eu matei dezenas deles. E para quê? Para outro tomar seu lugar. Assim como eu. Assim como você. Somos todos substituíveis."
        ]
    },
    SKELETON: {
        id: 'SKELETON', name: 'Esqueleto Guarda', attackDamage: 1,
        img: 'bosses/Skeleton/Idle.png',
        spriteKey: 'SKELETON',
        w: 140, h: 140,
        phases: [
            { hpThreshold: 0.5, description: 'Levanta o escudo e ataca.', pattern: ['up', 'attack'] },
            { hpThreshold: 0, description: 'Sequência de guarda.', pattern: ['up', 'attack', 'down', 'attack'] }
        ],
        notes: [
            "Tática: O escudo é o problema. Um movimento para [cima] quebra sua postura, abrindo-o para um [ataque]. Ele repetirá isso. Seja paciente. Paciência é tudo que me resta.",
            "História: Ele não sente dor. Ele não sente medo. Eu lutei contra ele e vi meu próprio reflexo. Um fantoche de ossos, obedecendo a um mestre que eu ainda não podia ver.",
            "Fardo: Ele já está morto, mas continua. Eu estou vivo, mas já morri por dentro. Escrever isso... é a única prova de que um dia eu fui diferente dele."
        ]
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
        notes: [
            "Tática: Ele se move verticalmente. [Cima, baixo, cima] é uma finta. O [Cima, baixo, ataque] é o mergulho real. Observe o tremor antes do ataque.",
            "História: Eu me senti observado por dias antes de vê-lo. Aquele olho... ele não queria me matar. Ele queria... *ver*. Ver meu medo. Ver minha falha.",
            "Fardo: Eu o acertei. Ele caiu. E outro tomou seu lugar. É apenas um observador. E este livro é seu registro. O registro de um fracasso que será assistido para sempre."
        ]
    }
};

// VN & story data
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
            { speaker: 'Narrador', text: "As cavernas gotejantes ecoam. Você encontra rabiscos sobre criaturas menores." },
            { speaker: 'Espírito do Herói', text: "Até os Goblins pareciam zombar de mim. Suas risadas eram como agulhas. Eu os odiava. Eu odiava minha fraqueza." }
        ],
        boss: BESTIARY.GOBLIN
    },
    {
        vn: [
            { speaker: 'Narrador', text: "Mais fundo. O ar fica pesado com esporos." },
            { speaker: 'Espírito do Herói', text: "O fungo... ele não luta com inteligência. Apenas... fúria. Como eu. Eu quebrei minha lâmina contra seu couro." }
        ],
        boss: BESTIARY.MUSHROOM
    },
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "Os ossos se levantam. Eles não têm vontade própria, apenas a do mestre." },
            { speaker: 'Espírito do Herói', text: "Eles me lembraram do que eu me tornaria. Um fantoche, preso aqui para sempre." }
        ],
        boss: BESTIARY.SKELETON
    },
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "O olho... ele vê tudo. Ele viu meu medo." },
            { speaker: 'Espírito do Herói', text: "Eu o acertei, mas ele continuou vindo. Ele não pode ser morto. É apenas um observador." }
        ],
        boss: BESTIARY.FLYING_EYE
    },
    {
        vn: [
            { speaker: 'Espírito do Herói', text: "As notas tornaram-se confissões. Eu já não escrevia para um sucessor. Eu escrevia para uma lápide." },
            { speaker: 'Espírito do Herói', text: "Eu confessei meus medos. O medo de morrer, sim. Mas pior... o medo de *não* morrer. De ficar preso aqui, como eu estou agora." },
            { speaker: 'Narrador', text: "O Bestiário parece menos técnico e mais um diário de desespero." },
            { speaker: 'Espírito do Herói', text: "Ele está próximo. O último. O que me quebrou. Eu não consigo... eu não vou..." }
        ],
        boss: BESTIARY.LICH
    }
];
export const bosses = [
    {
        name: "Harpia",
        hp: 1,
        description: "Harpia: vá para a esquerda, depois para a direita e ataque (espaço).",
        pattern: ["left", "right", "attack"]
    },
    {
        name: "Minotauro",
        hp: 2,
        description: "Minotauro: avance (right), pule (up), ataque duas vezes.",
        pattern: ["right", "up", "attack", "attack"]
    },
    {
        name: "Ent Antigo",
        hp: 3,
        description: "Ent: fuja duas vezes (left) e ataque especial (shift).",
        pattern: ["left", "left", "special"]
    }
];

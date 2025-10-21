import { Game } from "./game.js";
import { log } from "./utils.js";

const keyMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
    " ": "attack",
    Shift: "special"
};

const game = new Game();
game.update();

window.addEventListener("keydown", e => {
    const act = keyMap[e.key];
    if (act) game.registerAction(act);
});

document.getElementById("confirm").onclick = () => game.confirmPattern();
document.getElementById("nextBoss").onclick = () => game.nextBoss();

log("Jogo iniciado — pressione teclas para registrar padrão.");

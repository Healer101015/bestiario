import { bosses } from "./bosses.js";
import { log, renderPattern } from "./utils.js";

export class Game {
    constructor() {
        this.canvas = document.getElementById("c");
        this.ctx = this.canvas.getContext("2d");

        this.hero = { x: 120, y: 300, w: 40, h: 50, hp: 3 };
        this.bossIndex = 0;
        this.inputs = [];
        this.loadBoss();
    }

    loadBoss() {
        this.boss = { ...bosses[this.bossIndex] };
        log(`Boss carregado: ${this.boss.name}`);
        renderPattern(this.inputs);
        document.getElementById("openBest").onclick = () => this.openBestiary();
    }

    openBestiary() {
        const modal = document.getElementById("modal");
        modal.classList.remove("hidden");
        document.getElementById("modalTitle").textContent = this.boss.name;
        document.getElementById("modalDesc").textContent = this.boss.description;

        const container = document.getElementById("modalPattern");
        container.innerHTML = "";
        this.boss.pattern.forEach(p => {
            const el = document.createElement("span");
            el.className = "pattern-pill";
            el.textContent = p;
            container.appendChild(el);
        });

        document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
    }

    registerAction(action) {
        this.inputs.push(action);
        renderPattern(this.inputs);
        log("Ação: " + action);
    }

    confirmPattern() {
        const got = this.inputs;
        const want = this.boss.pattern;
        if (JSON.stringify(got) === JSON.stringify(want)) {
            log("Padrão correto! " + this.boss.name + " derrotado!");
            this.nextBoss();
        } else {
            log("Padrão incorreto. Tente novamente!");
            this.inputs = [];
            renderPattern([]);
        }
    }

    nextBoss() {
        this.bossIndex = (this.bossIndex + 1) % bosses.length;
        this.inputs = [];
        this.loadBoss();
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#6bd3ff";
        this.ctx.fillRect(this.hero.x - 20, this.hero.y - 40, 40, 50);
        this.ctx.fillStyle = "#ff9b6b";
        this.ctx.fillRect(600, 240, 80, 120);
        requestAnimationFrame(() => this.update());
    }
}

export function log(msg) {
    const logEl = document.getElementById("log");
    const time = new Date().toLocaleTimeString();
    logEl.innerHTML = `[${time}] ${msg}\n` + logEl.innerHTML;
}

export function renderPattern(pattern) {
    const container = document.getElementById("patternContainer");
    container.innerHTML = "";
    pattern.forEach(act => {
        const el = document.createElement("span");
        el.className = "pattern-pill";
        el.textContent = act;
        container.appendChild(el);
    });
}

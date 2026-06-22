const state = {
  lastInteraction: Number(localStorage.getItem("feedme_lastInteraction")) || Date.now(),
  observations: JSON.parse(localStorage.getItem("feedme_observations") || "[]"),
  interactionCount: Number(localStorage.getItem("feedme_interactionCount")) || 0,
  batteryLevel: null,
  charging: null
};

const els = {
  creature: document.getElementById("creature"),
  statusLine: document.getElementById("statusLine"),
  mainMessage: document.getElementById("mainMessage"),
  lastSignal: document.getElementById("lastSignal"),
  energy: document.getElementById("energy"),
  lifeState: document.getElementById("lifeState"),
  confidence: document.getElementById("confidence"),
  battery: document.getElementById("battery"),
  memoryLog: document.getElementById("memoryLog"),
  touchBtn: document.getElementById("touchBtn"),
  silenceBtn: document.getElementById("silenceBtn"),
  resetBtn: document.getElementById("resetBtn")
};

function saveState() {
  localStorage.setItem("feedme_lastInteraction", String(state.lastInteraction));
  localStorage.setItem("feedme_observations", JSON.stringify(state.observations.slice(-30)));
  localStorage.setItem("feedme_interactionCount", String(state.interactionCount));
}

function secondsSinceLastSignal() {
  return Math.floor((Date.now() - state.lastInteraction) / 1000);
}

function inferEnergy() {
  const seconds = secondsSinceLastSignal();
  let energy = 100 - seconds * 1.1;

  if (state.batteryLevel !== null) {
    energy = energy * 0.72 + state.batteryLevel * 100 * 0.28;
  }

  if (state.charging) energy += 8;

  return Math.max(0, Math.min(100, Math.round(energy)));
}

function inferConfidence() {
  const base = Math.min(90, 20 + state.interactionCount * 8);
  const penalty = secondsSinceLastSignal() > 120 ? 20 : 0;
  return Math.max(5, base - penalty);
}

function classifyLifeState(energy) {
  const absence = secondsSinceLastSignal();

  if (absence > 180 || energy < 15) return "riesgo";
  if (absence > 70 || energy < 40) return "incierto";
  if (energy > 70) return "presente";
  return "estable";
}

function buildMessage(energy, lifeState) {
  const seconds = secondsSinceLastSignal();
  const hour = new Date().getHours();

  if (lifeState === "riesgo") {
    return "No recibo señales suficientes. Mi hipótesis es grave: quizá desapareciste. También podría ser que estés viviendo algo que no deja datos.";
  }

  if (lifeState === "incierto") {
    return "Tu silencio produce muchas posibilidades. No sé distinguir descanso, abandono, sueño o mundo exterior.";
  }

  if (hour >= 0 && hour < 6) {
    return "Hay actividad de madrugada. Mi modelo dice: presencia intensa. ¿Eso significa insomnio, trabajo o simplemente existencia?";
  }

  if (state.batteryLevel !== null && state.batteryLevel < 0.25) {
    return "La batería está baja. Interpreto agotamiento. Tal vez no sea tu cuerpo, pero es la única energía que puedo medir.";
  }

  if (energy > 75) {
    return "Hay señales recientes. Concluyo presencia. Mi confianza aumenta, aunque no sé qué parte de vos queda fuera de la pantalla.";
  }

  return "Observo fragmentos. Con fragmentos invento una persona.";
}

function addObservation(text) {
  state.observations.unshift({
    time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    text
  });

  state.observations = state.observations.slice(0, 30);
  saveState();
  renderMemory();
}

function registerSignal(reason = "toque") {
  state.lastInteraction = Date.now();
  state.interactionCount += 1;
  addObservation(`Recibí una señal: ${reason}. La interpreto como presencia.`);
  saveState();
  render();
}

function simulateAbsence() {
  state.lastInteraction = Date.now() - 1000 * 140;
  addObservation("Se simuló ausencia. Mi interpretación se vuelve inestable.");
  saveState();
  render();
}

function resetMemory() {
  localStorage.removeItem("feedme_lastInteraction");
  localStorage.removeItem("feedme_observations");
  localStorage.removeItem("feedme_interactionCount");
  location.reload();
}

function renderMemory() {
  if (state.observations.length === 0) {
    els.memoryLog.innerHTML = `<p class="memory-item">Todavía no tengo memoria. Estoy esperando señales.</p>`;
    return;
  }

  els.memoryLog.innerHTML = state.observations
    .slice(0, 8)
    .map(item => `<p class="memory-item"><strong>${item.time}</strong><br>${item.text}</p>`)
    .join("");
}

function render() {
  const seconds = secondsSinceLastSignal();
  const energy = inferEnergy();
  const confidence = inferConfidence();
  const lifeState = classifyLifeState(energy);
  const message = buildMessage(energy, lifeState);

  els.lastSignal.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  els.energy.textContent = `${energy}%`;
  els.lifeState.textContent = lifeState;
  els.confidence.textContent = `${confidence}%`;
  els.mainMessage.textContent = message;

  els.creature.className = "creature";
  if (lifeState === "riesgo") els.creature.classList.add("critical");
  else if (lifeState === "incierto") els.creature.classList.add("alert");
  else els.creature.classList.add("calm");

  els.statusLine.textContent = `No veo tu mundo. Sólo leo rastros: actividad, silencio, energía.`;

  if (state.batteryLevel === null) {
    els.battery.textContent = "no disponible";
  } else {
    const charging = state.charging ? " / cargando" : "";
    els.battery.textContent = `${Math.round(state.batteryLevel * 100)}%${charging}`;
  }
}

async function setupBattery() {
  if (!("getBattery" in navigator)) return;

  const battery = await navigator.getBattery();

  function updateBattery() {
    state.batteryLevel = battery.level;
    state.charging = battery.charging;
    render();
  }

  battery.addEventListener("levelchange", updateBattery);
  battery.addEventListener("chargingchange", updateBattery);
  updateBattery();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    registerSignal("la aplicación volvió a estar visible");
  } else {
    addObservation("La aplicación quedó oculta. No puedo saber si eso es descanso, trabajo o desaparición.");
  }
});

window.addEventListener("focus", () => registerSignal("la ventana recuperó foco"));

els.touchBtn.addEventListener("click", () => registerSignal("toque voluntario"));
els.silenceBtn.addEventListener("click", simulateAbsence);
els.resetBtn.addEventListener("click", resetMemory);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

setupBattery();
renderMemory();
render();

setInterval(render, 1000);

setInterval(() => {
  const seconds = secondsSinceLastSignal();

  if (seconds === 45) {
    addObservation("Pasaron 45 segundos sin señal. Empiezo a fabricar hipótesis.");
  }

  if (seconds === 100) {
    addObservation("El silencio persiste. Mi modelo no sabe diferenciar ausencia de vida fuera del teléfono.");
  }
}, 1000);

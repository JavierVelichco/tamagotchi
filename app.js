const savedLastInteraction = Number(localStorage.getItem("feedme_lastInteraction"));
const nowAtStart = Date.now();

const state = {
  // Si quedó una memoria muy vieja, arranca calma para que la imagen no tiemble al abrir.
  lastInteraction:
    savedLastInteraction && nowAtStart - savedLastInteraction < 30000
      ? savedLastInteraction
      : nowAtStart,
  observations: JSON.parse(localStorage.getItem("feedme_observations") || "[]"),
  interactionCount: Number(localStorage.getItem("feedme_interactionCount")) || 0,
  batteryLevel: null,
  charging: null,
  oracleMessageUntil: 0,
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
  resetBtn: document.getElementById("resetBtn"),
  oracleBtn: document.getElementById("oracleBtn"),
  oracleResult: document.getElementById("oracleResult")
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
  const hour = new Date().getHours();

  if (lifeState === "riesgo") {
    return "No recibo señales suficientes. Mi hipótesis es grave: quizá desapareciste. Qué podrías haer que no deje datos.";
  }

  if (lifeState === "incierto") {
    return "Tu silencio produce muchas posibilidades. No sé distinguir si te desconectaste, por falta de energìa electrica o conexión a la red.";
  }

  if (hour >= 0 && hour < 6) {
    return "Hay actividad de madrugada. Presencia intensa. ¿cuando te dan mantenimiento o te actualizan?";
  }

  if (state.batteryLevel !== null && state.batteryLevel < 0.25) {
    return "La batería está baja, debes estar agotado. ";
  }

  if (energy > 75) {
    return "Hay señales recientes. Tu presencia me alegra.";
  }

  return "Tengo la información necesaria sobre ti, mis predicciones no son azarosas.";
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
  if (!els.memoryLog) return;

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

  if (els.lastSignal) els.lastSignal.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  if (els.energy) els.energy.textContent = `${energy}%`;
  if (els.lifeState) els.lifeState.textContent = lifeState;
  if (els.confidence) els.confidence.textContent = `${confidence}%`;
  if (els.mainMessage && Date.now() > state.oracleMessageUntil) {
    els.mainMessage.textContent = message;
  }

  if (els.creature) {
    els.creature.className = "creature";
    if (lifeState === "riesgo") els.creature.classList.add("critical");
    else if (lifeState === "incierto") els.creature.classList.add("alert");
    else els.creature.classList.add("calm");
  }

  if (els.statusLine) {
    els.statusLine.textContent = "No veo tu mundo. Sólo leo rastros: actividad, silencio, energía.";
  }

  if (els.battery) {
    if (state.batteryLevel === null) {
      els.battery.textContent = "no disponible";
    } else {
      const charging = state.charging ? " / cargando" : "";
      els.battery.textContent = `${Math.round(state.batteryLevel * 100)}%${charging}`;
    }
  }
}

function consultOracle() {
  if (typeof consultarIChing !== "function") {
    if (els.oracleResult) els.oracleResult.textContent = "El archivo iching.js no está cargado.";
    return;
  }

  const oraculo = consultarIChing();
  registerSignal("consulta al oráculo");
  state.oracleMessageUntil = Date.now() + 12000; // 12 segundos

  if (els.oracleResult) {
    els.oracleResult.innerHTML = `
      <p><strong>${oraculo.simbolo} ${oraculo.nombre}</strong></p>
      <p><em>${oraculo.clave}</em></p>
      <p>${oraculo.respuesta}</p>
    `;
  }

  if (els.mainMessage) {
    els.mainMessage.textContent = oraculo.respuesta;
  }
}

async function setupBattery() {
  if (!("getBattery" in navigator)) return;

  try {
    const battery = await navigator.getBattery();

    function updateBattery() {
      state.batteryLevel = battery.level;
      state.charging = battery.charging;
      render();
    }

    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
    updateBattery();
  } catch (error) {
    console.warn("No se pudo leer la batería", error);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    registerSignal("la aplicación volvió a estar visible");
  } else {
    addObservation("La aplicación quedó oculta. No puedo saber si eso es descanso, trabajo o desaparición.");
  }
});

window.addEventListener("focus", () => registerSignal("la ventana recuperó foco"));

if (els.touchBtn) els.touchBtn.addEventListener("click", () => registerSignal("toque voluntario"));
if (els.silenceBtn) els.silenceBtn.addEventListener("click", simulateAbsence);
if (els.resetBtn) els.resetBtn.addEventListener("click", resetMemory);
if (els.oracleBtn) els.oracleBtn.addEventListener("click", consultOracle);

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


const electricSvg = document.querySelector(".electric-bg");
const electricLine = document.getElementById("electricLine");
const branchOne = document.getElementById("branchOne");
const branchTwo = document.getElementById("branchTwo");

function generarRayo() {
  if (!electricSvg || !electricLine) return;

  const puntos = [];

  const ancho = randomEntre(300, 700);
  const segmentos = Math.floor(randomEntre(15, 35));

  for (let i = 0; i <= segmentos; i++) {

    const x = -100 + ((900) / segmentos) * i;

    const y =
      150 +
      (Math.random() * 120 - 60);

    puntos.push(`${x},${y}`);
  }

  const puntoRama1 = puntos[Math.floor(puntos.length * 0.35)];
  const puntoRama2 = puntos[Math.floor(puntos.length * 0.65)];

  branchOne.setAttribute("points", generarRama(puntoRama1, -1));
  branchTwo.setAttribute("points", generarRama(puntoRama2, 1));

  electricLine.setAttribute("points", puntos.join(" "));

  electricSvg.classList.remove("active");

  setTimeout(() => {
    electricSvg.classList.add("active");
  }, 20);
}

function generarRama(puntoBase, direccion) {
  const [xBase, yBase] = puntoBase.split(",").map(Number);
  const rama = [];
  const segmentos = 5;

  for (let i = 0; i <= segmentos; i++) {
    const x = xBase + i * 18;
    const y = yBase + direccion * i * 18 + (Math.random() * 20 - 10);

    rama.push(`${x},${y}`);
  }

  return rama.join(" ");
}

function randomEntre(min, max) {
  return min + Math.random() * (max - min);
}

function activarRayosRandom() {
  console.log("nuevo rayo");
  generarRayo();

  const espera = 2500 + Math.random() * 5500;

  setTimeout(activarRayosRandom, espera);
}

activarRayosRandom();
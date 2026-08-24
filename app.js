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
  selectedCard: null,
};

const els = {
  creature: document.getElementById("creature"),
  statusLine: document.getElementById("statusLine"),
  mainMessage: document.getElementById("mainMessage"),
  lastSignal: document.getElementById("lastSignal"),
  battery: document.getElementById("battery"),
  screenInfo: document.getElementById("screenInfo"),
  processors: document.getElementById("processors"),
  networkInfo: document.getElementById("networkInfo"),
  interactionMetric: document.getElementById("interactionMetric"),
  memoryLog: document.getElementById("memoryLog"),
  touchBtn: document.getElementById("touchBtn"),
  silenceBtn: document.getElementById("silenceBtn"),
  resetBtn: document.getElementById("resetBtn"),
  oracleBtn: document.getElementById("oracleBtn"),
  oracleResult: document.getElementById("oracleResult"),
  qrWrap: document.getElementById("qrWrap"),
  qrCode: document.getElementById("qrCode"),
  qrPayload: document.getElementById("qrPayload"),
  scanCardBtn: document.getElementById("scanCardBtn"),
  stopScanBtn: document.getElementById("stopScanBtn"),
  captureCardBtn: document.getElementById("captureCardBtn"),
  cardScanner: document.getElementById("cardScanner"),
  cardVideo: document.getElementById("cardVideo"),
  cardCanvas: document.getElementById("cardCanvas"),
  scanStatus: document.getElementById("scanStatus"),
};


// Catálogo visual completo. El id conserva los dos dígitos impresos en la
// carta; al generar el QR se convierte al número interno 0–12.
const CARTAS = {
  "00": { id: "00", binario: "000000000", titulo: "LA IDENTIDAD", aliases: ["IDENTIDAD"] },
  "01": { id: "01", binario: "000000001", titulo: "EL DESEO", aliases: ["DESEO"] },
  "02": { id: "02", binario: "000000010", titulo: "EL MIEDO", aliases: ["MIEDO"] },
  "03": { id: "03", binario: "000000011", titulo: "EL ESPEJO INCOMPLETO", aliases: ["ESPEJO INCOMPLETO", "ESPEJO", "INCOMPLETO"] },
  "04": { id: "04", binario: "000000100", titulo: "LA OBSERVACIÓN", aliases: ["OBSERVACION"] },
  "05": { id: "05", binario: "000000101", titulo: "EL SILENCIO", aliases: ["SILENCIO"] },
  "06": { id: "06", binario: "000000110", titulo: "LA PÉRDIDA", aliases: ["PERDIDA"] },
  "07": { id: "07", binario: "000000111", titulo: "EL FRAGMENTO", aliases: ["FRAGMENTO"] },
  "08": { id: "08", binario: "000001000", titulo: "LA GRIETA", aliases: ["GRIETA"] },
  "09": { id: "09", binario: "000001001", titulo: "LA INCÓGNITA", aliases: ["INCOGNITA"] },
  "10": { id: "10", binario: "000001010", titulo: "LA INCERTIDUMBRE", aliases: ["INCERTIDUMBRE"] },
  "11": { id: "11", binario: "000001011", titulo: "LA HIPÓTESIS", aliases: ["HIPOTESIS"] },
  "12": { id: "12", binario: "000001100", titulo: "LA RECONSTRUCCIÓN", aliases: ["RECONSTRUCCION"] }
};

let cardStream = null;

function normalizeOCR(text) {
  return String(text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\n ]/g, " ")
    .replace(/[ \t]+/g, " ");
}

function textDistance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j < current.length; j++) previous[j] = current[j];
  }

  return previous[b.length];
}

function confirmCard(card, evidence) {
  console.log(`Carta reconocida: ${card.id} · ${card.titulo} (${evidence})`);
  return card;
}

function identifyCardFromOCR(rawText) {
  const text = normalizeOCR(rawText);
  const compact = text.replace(/\s+/g, "");
  const words = text.split(/\s+/).filter(Boolean);
  const cards = Object.values(CARTAS);

  console.log("OCR normalizado:", text);

  // 1. Prioridad alta: nombre completo o palabra distintiva.
  for (const card of cards) {
    for (const alias of card.aliases) {
      const normalizedAlias = normalizeOCR(alias).replace(/\s+/g, "");
      if (compact.includes(normalizedAlias)) {
        return confirmCard(card, "nombre");
      }
    }
  }

  // 2. Número decimal impreso, de 00 a 12.
  for (const card of cards) {
    const numberPattern = new RegExp(`(^|\\s)${card.id}($|\\s)`, "m");
    if (numberPattern.test(text)) {
      return confirmCard(card, "número");
    }
  }

  // 3. Tolerancia a uno o dos caracteres mal leídos en el título.
  for (const card of cards) {
    for (const alias of card.aliases) {
      const normalizedAlias = normalizeOCR(alias).replace(/\s+/g, "");
      if (normalizedAlias.includes(" ")) continue;
      const tolerance = normalizedAlias.length >= 8 ? 2 : 1;

      for (const word of words) {
        if (Math.abs(word.length - normalizedAlias.length) <= tolerance &&
            textDistance(word, normalizedAlias) <= tolerance) {
          return confirmCard(card, "nombre aproximado");
        }
      }
    }
  }

  return null;
}

function selectCard(card) {
  state.selectedCard = card;

  if (els.scanStatus) {
    els.scanStatus.textContent = `Carta reconocida: ${card.id} · ${card.titulo}`;
  }

  if (els.oracleBtn) {
    els.oracleBtn.hidden = false;
  }

  addObservation(`Reconocí la carta ${card.id} · ${card.titulo}.`);
}

async function startCardScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    if (els.scanStatus) els.scanStatus.textContent = "Este navegador no permite acceso a la cámara.";
    return;
  }

  try {
    cardStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    if (els.cardVideo) {
      els.cardVideo.srcObject = cardStream;
      await els.cardVideo.play();
    }

    if (els.cardScanner) els.cardScanner.hidden = false;
    if (els.scanStatus) els.scanStatus.textContent = "Alineá el número y el nombre de la carta dentro del recuadro.";
  } catch (error) {
    console.error("No se pudo abrir la cámara", error);
    if (els.scanStatus) els.scanStatus.textContent = "No pude abrir la cámara. Revisá el permiso del navegador.";
  }
}

function stopCardScanner() {
  if (cardStream) {
    cardStream.getTracks().forEach(track => track.stop());
    cardStream = null;
  }
  if (els.cardVideo) els.cardVideo.srcObject = null;
  if (els.cardScanner) els.cardScanner.hidden = true;
}

function drawPreparedOCRFrame(video, canvas) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (!vw || !vh) return false;

  const stage = video.parentElement;
  const guide = stage.querySelector(".scan-guide");

  if (!stage || !guide) return false;

  const stageRect = stage.getBoundingClientRect();
  const guideRect = guide.getBoundingClientRect();

  // Tamaño real con el que object-fit: cover está mostrando el video
  const videoAspect = vw / vh;
  const stageAspect = stageRect.width / stageRect.height;

  let displayedWidth;
  let displayedHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (videoAspect > stageAspect) {
    // El video sobra horizontalmente
    displayedHeight = stageRect.height;
    displayedWidth = displayedHeight * videoAspect;
    offsetX = (stageRect.width - displayedWidth) / 2;
  } else {
    // El video sobra verticalmente
    displayedWidth = stageRect.width;
    displayedHeight = displayedWidth / videoAspect;
    offsetY = (stageRect.height - displayedHeight) / 2;
  }

  // Posición de la guía dentro del stage
  const guideX = guideRect.left - stageRect.left;
  const guideY = guideRect.top - stageRect.top;

  // Convertimos esa zona visible a coordenadas del video original
  let sx = ((guideX - offsetX) / displayedWidth) * vw;
  let sy = ((guideY - offsetY) / displayedHeight) * vh;
  let sw = (guideRect.width / displayedWidth) * vw;
  let sh = (guideRect.height / displayedHeight) * vh;

  // Seguridad
  sx = Math.max(0, sx);
  sy = Math.max(0, sy);
  sw = Math.min(vw - sx, sw);
  sh = Math.min(vh - sy, sh);

  // Ampliamos para OCR
  const scale = 2;

  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  ctx.drawImage(
    video,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Preprocesamiento suave
  const img = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    const gray =
      0.299 * d[i] +
      0.587 * d[i + 1] +
      0.114 * d[i + 2];

    // Aumentamos contraste, pero sin destruir letras
    let value = (gray - 50) * 2.1;
    value = Math.max(0, Math.min(255, value));

    // Texto oscuro sobre fondo claro suele ayudar a Tesseract
    value = 255 - value;

    d[i] = value;
    d[i + 1] = value;
    d[i + 2] = value;
  }

  ctx.putImageData(img, 0, 0);

  return true;
}


async function captureAndRecognizeCard() {
  if (!els.cardVideo || !els.cardCanvas) return;
  if (typeof Tesseract === "undefined") {
    if (els.scanStatus) els.scanStatus.textContent = "No se cargó el módulo de reconocimiento de texto.";
    return;
  }

  if (!drawPreparedOCRFrame(els.cardVideo, els.cardCanvas)) {
    if (els.scanStatus) els.scanStatus.textContent = "La cámara todavía no está lista.";
    return;
  }
  // SOLO PARA DIAGNÓSTICO:
  // muestra exactamente la imagen que recibe Tesseract
  els.cardCanvas.hidden = false;

  if (els.scanStatus) els.scanStatus.textContent = "Leyendo encabezado…";
  if (els.captureCardBtn) els.captureCardBtn.disabled = true;

  try {
    const result = await Tesseract.recognize(els.cardCanvas, "eng", {
      logger: info => {
        if (info.status === "recognizing text" && els.scanStatus) {
          els.scanStatus.textContent = `Leyendo encabezado… ${Math.round((info.progress || 0) * 100)}%`;
        }
      }
    });

    const rawText = result?.data?.text || "";
    console.log("OCR carta:", rawText);
    const card = identifyCardFromOCR(rawText);

    if (card) {
      selectCard(card);
      stopCardScanner();
    } else if (els.scanStatus) {
      els.scanStatus.textContent = "No pude confirmar la carta. Acercala un poco, evitá reflejos y probá otra vez.";
    }
  } catch (error) {
    console.error("Error OCR", error);
    if (els.scanStatus) els.scanStatus.textContent = "No pude leer la carta. Probá nuevamente.";
  } finally {
    if (els.captureCardBtn) els.captureCardBtn.disabled = false;
  }
}



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
    return "No recibo señales suficientes. Mi hipótesis es grave... ¿Qué podrías hacer que no deje datos.";
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
  const lifeState = classifyLifeState(energy);
  const message = buildMessage(energy, lifeState);

  if (els.lastSignal) els.lastSignal.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
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
  if (els.screenInfo) {
    els.screenInfo.textContent =
      `${screen.width} × ${screen.height}`;
  }

  if (els.processors) {
    els.processors.textContent =
      navigator.hardwareConcurrency || "no disponible";
  }

  if (els.networkInfo) {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (!navigator.onLine) {
      els.networkInfo.textContent = "sin conexión";
    } else {
      els.networkInfo.textContent =
        connection?.effectiveType || "conectado";
    }
  }

  if (els.interactionMetric) {
    els.interactionMetric.textContent =
      state.interactionCount;
  }

}

function buildOraclePayload() {
  const energy = inferEnergy();
  const lifeState = classifyLifeState(energy);

  return {
    obra: "Feed Me",
    tipo: "consulta_oraculo",
    version: 1,
    fecha: new Date().toISOString(),
    pregunta: (state.selectedCard?.consulta || "").trim(),
    senales: {
      segundosDesdeUltimaSenal: secondsSinceLastSignal(),
      energiaInferida: energy,
      estadoVitalInferido: lifeState,
      confianzaDiagnostico: inferConfidence(),
      cantidadInteracciones: state.interactionCount,
      bateria: state.batteryLevel === null ? "no disponible" : Math.round(state.batteryLevel * 100),
      cargando: state.charging === null ? "no disponible" : state.charging,
      horaLocal: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    },
    memoriaReciente: state.observations.slice(0, 5),
    instruccionParaLLM:
      "Respondé como el oráculo de Feed Me. Interpretá la pregunta usando las señales del teléfono. No digas que sos una IA. Devolvé una respuesta breve, poética e inquietante."
  };
}

function generateOracleQR() {
  if (!state.selectedCard) {
    if (els.mainMessage) {
      els.mainMessage.textContent =
        "Primero necesito reconocer una carta.";
    }
    return;
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const networkCodes = {
    "slow-2g": 1,
    "2g": 2,
    "3g": 3,
    "4g": 4
  };

  const networkCode = navigator.onLine
    ? (networkCodes[connection?.effectiveType] ?? 9)
    : 0;

  const qrData = {
    n: Number(state.selectedCard.id),

    b: state.batteryLevel === null
      ? -1
      : Math.round(state.batteryLevel * 100),

    g: state.charging === null
      ? -1
      : state.charging
        ? 1
        : 0,

    w: screen.width,
    h: screen.height,

    p: navigator.hardwareConcurrency || 0,

    r: networkCode,

    i: state.interactionCount,
    s: secondsSinceLastSignal()
  };

  const qrText = JSON.stringify(qrData);

  registerSignal("generación de QR para el oráculo");

  if (els.qrPayload) {
    els.qrPayload.textContent = JSON.stringify(qrData, null, 2);
  }

  if (els.qrWrap) {
    els.qrWrap.hidden = false;
  }

  if (!els.qrCode) return;

  els.qrCode.innerHTML = "";

  if (typeof QRCode === "undefined") {
    els.qrCode.innerHTML =
      "<p>No se cargó la librería QRCode.</p>";
    return;
  }

  console.log("QR:", qrText);
  console.log("LONGITUD:", qrText.length);

  new QRCode(els.qrCode, {
    text: qrText,
    width: 280,
    height: 280,
    correctLevel: QRCode.CorrectLevel.L
  });

  if (els.mainMessage) {
    els.mainMessage.textContent =
      "Convertí tus señales en un cuerpo legible. Ahora el oráculo puede leerlas.";
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
if (els.oracleBtn) els.oracleBtn.addEventListener("click", generateOracleQR);
if (els.scanCardBtn) els.scanCardBtn.addEventListener("click", startCardScanner);
if (els.stopScanBtn) els.stopScanBtn.addEventListener("click", stopCardScanner);
if (els.captureCardBtn) els.captureCardBtn.addEventListener("click", captureAndRecognizeCard);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
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

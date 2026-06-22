const state = {
  lastInteraction: Number(localStorage.getItem('feedme_lastInteraction')) || Date.now(),
  interactionCount: Number(localStorage.getItem('feedme_interactionCount')) || 0,
  lastOracle: JSON.parse(localStorage.getItem('feedme_lastOracle') || 'null')
};

const els = {
  creature: document.getElementById('creature'),
  mainMessage: document.getElementById('mainMessage'),
  statusLine: document.getElementById('statusLine'),
  oracleBtn: document.getElementById('oracleBtn'),
  oracleResult: document.getElementById('oracleResult'),
  lastSignal: document.getElementById('lastSignal'),
  energy: document.getElementById('energy'),
  lifeState: document.getElementById('lifeState'),
  confidence: document.getElementById('confidence'),
  signalBtn: document.getElementById('signalBtn'),
  absenceBtn: document.getElementById('absenceBtn'),
  resetBtn: document.getElementById('resetBtn')
};

function saveState() {
  localStorage.setItem('feedme_lastInteraction', String(state.lastInteraction));
  localStorage.setItem('feedme_interactionCount', String(state.interactionCount));
  localStorage.setItem('feedme_lastOracle', JSON.stringify(state.lastOracle));
}

function secondsSinceLastSignal() {
  return Math.floor((Date.now() - state.lastInteraction) / 1000);
}

function inferEnergy() {
  const energy = 100 - secondsSinceLastSignal() * 1.1;
  return Math.max(0, Math.min(100, Math.round(energy)));
}

function inferConfidence() {
  return Math.min(96, 20 + state.interactionCount * 8);
}

function classifyLifeState(energy) {
  const absence = secondsSinceLastSignal();
  if (absence > 180 || energy < 15) return 'riesgo';
  if (absence > 70 || energy < 40) return 'incierto';
  if (energy > 70) return 'presente';
  return 'estable';
}

function buildMessage(energy, lifeState) {
  if (state.lastOracle?.respuesta) return state.lastOracle.respuesta;
  if (lifeState === 'riesgo') return 'No recibo señales suficientes. Mi hipótesis es grave: quizá desapareciste.';
  if (lifeState === 'incierto') return 'Tu silencio produce muchas posibilidades. No sé distinguir descanso, abandono o mundo exterior.';
  if (energy > 75) return 'Hay señales recientes. Concluyo presencia, aunque no sé qué parte de vos queda fuera de la pantalla.';
  return 'Observo fragmentos. Con fragmentos invento una persona.';
}

function registerSignal(reason = 'señal') {
  state.lastInteraction = Date.now();
  state.interactionCount += 1;
  saveState();
  render();
  return reason;
}

function consultOracle(event) {
  event?.stopPropagation();

  if (typeof consultarIChing !== 'function') {
    els.oracleResult.textContent = 'El archivo iching.js no está cargado.';
    return;
  }

  const oracle = consultarIChing();
  state.lastOracle = oracle;
  registerSignal('consulta oracular');

  els.oracleResult.innerHTML = `
    <span class="symbol">${oracle.simbolo}</span>
    <strong>${oracle.numero}. ${oracle.nombre}</strong>
    <span>${oracle.clave}</span>
    <p>${oracle.respuesta}</p>
  `;

  els.mainMessage.textContent = oracle.respuesta;
  els.statusLine.textContent = `Lectura registrada: ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.`;
}

function simulateAbsence(event) {
  event?.stopPropagation();
  state.lastInteraction = Date.now() - 140000;
  state.lastOracle = null;
  saveState();
  render();
}

function resetMemory(event) {
  event?.stopPropagation();
  localStorage.removeItem('feedme_lastInteraction');
  localStorage.removeItem('feedme_interactionCount');
  localStorage.removeItem('feedme_lastOracle');
  location.reload();
}

function renderOracle() {
  const oracle = state.lastOracle;
  if (!oracle) return;

  els.oracleResult.innerHTML = `
    <span class="symbol">${oracle.simbolo}</span>
    <strong>${oracle.numero}. ${oracle.nombre}</strong>
    <span>${oracle.clave}</span>
    <p>${oracle.respuesta}</p>
  `;
}

function render() {
  const seconds = secondsSinceLastSignal();
  const energy = inferEnergy();
  const confidence = inferConfidence();
  const lifeState = classifyLifeState(energy);

  els.lastSignal.textContent = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  els.energy.textContent = `${energy}%`;
  els.lifeState.textContent = lifeState;
  els.confidence.textContent = `${confidence}%`;
  els.mainMessage.textContent = buildMessage(energy, lifeState);

  els.creature.className = 'creature';
  if (lifeState === 'riesgo') els.creature.classList.add('critical');
  else if (lifeState === 'incierto') els.creature.classList.add('alert');
  else els.creature.classList.add('calm');

  if (!state.lastOracle) {
    els.statusLine.textContent = 'No veo tu mundo. Sólo leo rastros: actividad, silencio, energía.';
  }
}

els.oracleBtn.addEventListener('click', consultOracle);
els.signalBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  state.lastOracle = null;
  registerSignal('toque voluntario');
});
els.absenceBtn?.addEventListener('click', simulateAbsence);
els.resetBtn?.addEventListener('click', resetMemory);

window.addEventListener('focus', () => registerSignal('la ventana recuperó foco'));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') registerSignal('la aplicación volvió a estar visible');
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

renderOracle();
render();
setInterval(render, 1000);

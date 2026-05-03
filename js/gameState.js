// ========== ESTADO DEL JUEGO ==========
let gameState = {
    happiness: 70,
    addiction: 0,
    isAlive: true,
    lastInteraction: Date.now(),
    abandonSeconds: 0,
    lastVoiceInteraction: Date.now()
};

// ========== ESTADO DE PAUSA Y EVENTOS ==========
let juegoPausado = false;
let videoRequerido = false;
let videoCompletado = false;
let juegoRequerido = false;
let eventoActivo = null; // 'video' o 'juego' - para saber cuál está activo
let vozRequerida = false; // ✅ Nuevo: para requerir interacción por voz
let vozActiva = false;

// ========== TEMPORIZADORES ==========
let tiempoUltimoVideo = Date.now();
let tiempoUltimoJuego = Date.now();

// ========== MINIJUEGO ==========
let minijuegoActivo = false;
let puntuacionJuego = 0;
let tiempoRestanteJuego = 15;
let intervaloJuego = null;
let intervaloFantasmas = null;

// ========== SISTEMA DE VIDEO ==========
let intervaloRegresoVideo = null;

// ========== SISTEMA DE VOZ ==========

// Exportar para que otros scripts lo usen (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, juegoPausado, videoRequerido, videoCompletado, minijuegoActivo };
}
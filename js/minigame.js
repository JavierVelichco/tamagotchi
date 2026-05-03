// ========== MINIJUEGO ==========

const mensajesJuego = [
    "🎮 ¡Juega conmigo o me pongo triste!",
    "👻 Toca los fantasmas o pierdo felicidad...",
    "🎯 Necesito que juegues para sentirme vivo",
    "⚠️ Juega ahora o mi felicidad bajará"
];

const INTERVALO_JUEGO = 15000; // 15 segundos (aumentado para dar chance al video)

function verificarYMostrarJuego() {
    if (!gameState.isAlive) return;
    if (juegoPausado) return;
    if (videoCompletado) return;
    if (juegoRequerido) return;
    if (eventoActivo === 'video') return; // ✅ No mostrar juego si hay video pendiente
    
    const ahora = Date.now();
    const tiempoDesdeUltimoJuego = ahora - tiempoUltimoJuego;
    
    // Solo mostrar si pasó el intervalo Y no hay video pendiente
    if (tiempoDesdeUltimoJuego >= INTERVALO_JUEGO && !juegoRequerido && !videoRequerido && eventoActivo !== 'video') {
        mostrarBotonJuego();
    }
}

function mostrarBotonJuego() {
    juegoRequerido = true;
    eventoActivo = 'juego';
    
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `
        ${mensajesJuego[Math.floor(Math.random() * mensajesJuego.length)]}
        <button class="juego-btn" onclick="abrirMinijuego()">🎮 JUGAR AHORA</button>
    `;
}

function abrirMinijuego() {
    if (!gameState.isAlive || minijuegoActivo) return;
    if (juegoPausado) return;
    
    // ✅ ACTUALIZAR la última interacción ANTES de pausar
    gameState.lastInteraction = Date.now();
    tiempoUltimoJuego = Date.now();
    
    juegoPausado = true;
    juegoRequerido = false;
    minijuegoActivo = true;
    puntuacionJuego = 0;
    tiempoRestanteJuego = 15;
    
    const overlay = document.createElement('div');
    overlay.id = 'juegoOverlay';
    overlay.className = 'juego-overlay';
    overlay.innerHTML = `
        <div class="juego-container">
            <div class="juego-titulo">🎯 ¡TOCA LOS FANTASMAS! 🎯</div>
            <div class="juego-area" id="juegoArea" style="height: 300px; position: relative; background: rgba(0,0,0,0.5); border-radius: 20px; overflow: hidden;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; opacity: 0.5;">
                    ¡Toca los fantasmas!
                </div>
            </div>
            <div class="juego-puntuacion">⭐ Puntos: <span id="puntosJuego">0</span></div>
            <div class="juego-tiempo">⏱️ Tiempo: <span id="tiempoJuego">15</span> seg</div>
            <button class="btn-cerrar-juego" id="cancelarJuegoBtn">❌ Cancelar (sin recompensa)</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    intervaloFantasmas = setInterval(() => {
        const area = document.getElementById('juegoArea');
        if (!area || !minijuegoActivo) return;
        
        const maxX = Math.max(0, area.clientWidth - 60);
        const maxY = Math.max(0, area.clientHeight - 60);
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        const fantasma = document.createElement('div');
        fantasma.className = 'fantasma';
        fantasma.textContent = ['👻', '💀', '👾', '😈'][Math.floor(Math.random() * 4)];
        fantasma.style.left = x + 'px';
        fantasma.style.top = y + 'px';
        fantasma.style.position = 'absolute';
        fantasma.style.fontSize = '50px';
        fantasma.style.cursor = 'pointer';
        
        fantasma.onclick = (e) => {
            e.stopPropagation();
            puntuacionJuego++;
            const puntosSpan = document.getElementById('puntosJuego');
            if (puntosSpan) puntosSpan.textContent = puntuacionJuego;
            fantasma.remove();
            
            // ✅ Cada vez que tocas un fantasma, cuenta como interacción
            gameState.lastInteraction = Date.now();
            
            if (window.navigator?.vibrate) window.navigator.vibrate(50);
        };
        
        area.appendChild(fantasma);
        
        setTimeout(() => {
            if (fantasma.parentNode) fantasma.remove();
        }, 1000);
    }, 800);
    
    intervaloJuego = setInterval(() => {
        if (!minijuegoActivo) return;
        
        tiempoRestanteJuego--;
        const tiempoSpan = document.getElementById('tiempoJuego');
        if (tiempoSpan) tiempoSpan.textContent = tiempoRestanteJuego;
        
        if (tiempoRestanteJuego <= 0) {
            finalizarMinijuego(true);
        }
    }, 1000);
    
    document.getElementById('cancelarJuegoBtn').onclick = () => finalizarMinijuego(false);
}

function finalizarMinijuego(exitoso) {
    if (!minijuegoActivo) return;
    
    if (intervaloFantasmas) clearInterval(intervaloFantasmas);
    if (intervaloJuego) clearInterval(intervaloJuego);
    intervaloFantasmas = null;
    intervaloJuego = null;
    
    const overlay = document.getElementById('juegoOverlay');
    if (overlay) overlay.remove();
    
    // ACTUALIZAR lastInteraction ANTES de aplicar cambios
    gameState.lastInteraction = Date.now();
    
    if (exitoso && tiempoRestanteJuego <= 0) {
        // ÉXITO - Completó el juego
        let recompensa = Math.min(40, puntuacionJuego * 2);
        
        if (typeof completarEvento === 'function') {
            completarEvento('juego', true, { felicidad: recompensa, adiccion: 10 });
        } else {
            // Fallback por si no existe eventSystem
            gameState.happiness = Math.min(100, gameState.happiness + recompensa);
            gameState.addiction = Math.min(100, gameState.addiction + 10);
        }
        
        document.getElementById('message').innerHTML = `✨ ¡Juego completado! +${recompensa} felicidad ✨`;
        videoCompletado = true;
        setTimeout(() => { videoCompletado = false; }, 10000);
        
    } else {
        // CASTIGO - Abandonó o canceló
        if (typeof completarEvento === 'function') {
            completarEvento('juego', false);
        } else {
            // Fallback por si no existe eventSystem
            gameState.happiness = Math.max(0, gameState.happiness - 15);
        }
        
        document.getElementById('message').innerHTML = "😠 ¡Abandonaste el juego! 😠";
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
    }
    
    // Verificar si murió después del juego
    if (gameState.happiness <= 0) {
        gameState.isAlive = false;
        document.getElementById('message').innerHTML = "💀 Murió por abandonar el juego... 💀";
    }
    
    minijuegoActivo = false;
    juegoPausado = false;
    eventoActivo = null;
    updateUI();
}
    
    // ✅ Verificar si murió después del juego
    if (gameState.happiness <= 0) {
        gameState.isAlive = false;
        document.getElementById('message').innerHTML = "💀 Murió por abandonar el juego... 💀";
    }
    
    minijuegoActivo = false;
    juegoPausado = false;
    eventoActivo = null; // ✅ Limpiar evento activo
    updateUI();


function verificarTemporizadorJuego() {
    verificarYMostrarJuego();
}
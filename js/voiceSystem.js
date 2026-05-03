// ========== SISTEMA DE VOZ (WEB SPEECH API) ==========

const mensajesVoz = [
    "🗣️ ¡Háblame! Necesito oír tu voz...",
    "🎤 Dime algo bonito o me pondré triste",
    "📢 ¡Habla conmigo! Me siento solo...",
    "💬 Una palabra tuya me haría feliz"
];

const mensajesReaccion = [
    "😊 ¡Me encantó oírte!",
    "🥰 Tu voz me hace feliz",
    "😌 Gracias por hablarme...",
    "🎵 Qué bonito es escucharte"
];

const mensajesNoEntendido = [
    "🤔 No te entendí... ¿puedes repetir?",
    "🎤 No te escuché bien, intenta de nuevo",
    "📢 ¡Háblame más cerca del micrófono!",
    "💭 No capté lo que dijiste..."
];

const INTERVALO_VOZ = 25000;
let reconocimientoVoz = null;  // ✅ Solo declarado aquí
let vozActiva = false;

function soportaReconocimientoVoz() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

function verificarYMostrarVoz() {
    if (!gameState?.isAlive) return;
    if (juegoPausado) return;
    if (videoCompletado) return;
    if (vozRequerida) return;
    if (eventoActivo !== null) return;
    
    const ahora = Date.now();
    const tiempoDesdeUltimaVoz = ahora - gameState.lastVoiceInteraction;
    
    if (tiempoDesdeUltimaVoz >= INTERVALO_VOZ && !vozRequerida && soportaReconocimientoVoz()) {
        mostrarBotonVoz();
    }
}

function mostrarBotonVoz() {
    vozRequerida = true;
    eventoActivo = 'voz';
    
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `
            ${mensajesVoz[Math.floor(Math.random() * mensajesVoz.length)]}
            <button class="voz-btn" onclick="iniciarReconocimientoVoz()">🎤 HABLAR AHORA</button>
            <button class="voz-cancel-btn" onclick="cancelarVoz()">❌ Ignorar</button>
        `;
    }
}

function iniciarReconocimientoVoz() {
    console.log('iniciarReconocimientoVoz llamada');
    
    if (!gameState?.isAlive || vozActiva) return;
    if (juegoPausado) return;
    
    juegoPausado = true;
    vozActiva = true;
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
        manejarErrorVoz('not-supported');
        return;
    }
    
    reconocimientoVoz = new SpeechRecognition();
    reconocimientoVoz.lang = 'es-ES';
    reconocimientoVoz.continuous = false;
    reconocimientoVoz.interimResults = false;
    reconocimientoVoz.maxAlternatives = 1;
    
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `
            <div class="voice-listening">
                🎤 <strong>¡Escuchando!</strong> Habla algo ahora...
                <div class="voice-animation">
                    <span class="voice-wave">🎙️</span>
                    <span class="voice-wave">🎤</span>
                    <span class="voice-wave">🎙️</span>
                </div>
                <button class="cancel-voice-btn" onclick="cancelarEscuchaVoz()">❌ Cancelar</button>
            </div>
        `;
    }
    
    reconocimientoVoz.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        console.log('Usuario dijo:', texto);
        procesarComandoVoz(texto);
    };
    
    reconocimientoVoz.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        manejarErrorVoz(event.error);
    };
    
    reconocimientoVoz.onend = () => {
        if (vozActiva) {
            manejarErrorVoz('no-speech');
        }
    };
    
    try {
        reconocimientoVoz.start();
        
        setTimeout(() => {
            if (vozActiva && reconocimientoVoz) {
                reconocimientoVoz.stop();
            }
        }, 10000);
    } catch (error) {
        console.error('Error al iniciar:', error);
        manejarErrorVoz('not-allowed');
    }
}

function procesarComandoVoz(texto) {
    if (!gameState?.isAlive) return;
    
    vozActiva = false;
    const textoLower = texto.toLowerCase();
    
    let gananciaFelicidad = 12;
    let gananciaAdiccion = 3;
    let reaccion = mensajesReaccion[Math.floor(Math.random() * mensajesReaccion.length)];
    
    if (textoLower.includes("te quiero") || textoLower.includes("te amo") || 
        textoLower.includes("hola") || textoLower.includes("buenos días")) {
        reaccion = "🥰 ¡Awww! ¡Yo también te quiero mucho!";
        gananciaFelicidad = 25;
        gananciaAdiccion = 5;
    }
    else if (textoLower.includes("gracias")) {
        reaccion = "😊 ¡De nada! Me alegra que me hables";
        gananciaFelicidad = 20;
        gananciaAdiccion = 3;
    }
    else if (textoLower.includes("triste") || textoLower.includes("mal") || textoLower.includes("depre")) {
        reaccion = "😢 No estés triste... ¡yo estoy aquí para ti!";
        gananciaFelicidad = 15;
        gananciaAdiccion = 4;
    }
    else if (textoLower.includes("feliz") || textoLower.includes("alegre")) {
        reaccion = "😁 ¡Qué bonito! Tu felicidad me contagia";
        gananciaFelicidad = 30;
        gananciaAdiccion = 2;
    }
    else if (textoLower.includes("jugar")) {
        reaccion = "🎮 ¡Sí! Quiero jugar contigo";
        gananciaFelicidad = 10;
        gananciaAdiccion = 8;
    }
    else if (textoLower.length > 10) {
        reaccion = "😮 ¡Qué bien hablas! Me encantó escucharte";
        gananciaFelicidad = 18;
        gananciaAdiccion = 4;
    }
    
    if (typeof completarEvento === 'function') {
        completarEvento('voz', true, { felicidad: gananciaFelicidad, adiccion: gananciaAdiccion });
    } else {
        if (isNaN(gameState.happiness)) gameState.happiness = 70;
        if (isNaN(gameState.addiction)) gameState.addiction = 0;
        gameState.happiness = Math.min(100, gameState.happiness + gananciaFelicidad);
        gameState.addiction = Math.min(100, gameState.addiction + gananciaAdiccion);
    }
    
    gameState.lastInteraction = Date.now();
    gameState.lastVoiceInteraction = Date.now();
    
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `🎤 "${texto}"<br>${reaccion} +${gananciaFelicidad} felicidad ✨`;
    }
    
    if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);
    
    vozRequerida = false;
    eventoActivo = null;
    juegoPausado = false;
    
    updateUI();
    
    setTimeout(() => {
        const msgDiv = document.getElementById('message');
        if (msgDiv && msgDiv.innerHTML.includes(reaccion)) {
            msgDiv.innerHTML = "✨ ¡Gracias por hablarme! ✨";
        }
    }, 4000);
}

function manejarErrorVoz(error) {
    console.log('Error de voz:', error);
    vozActiva = false;
    
    let mensajeError = "❌ No pude escucharte... intenta de nuevo -3 felicidad";
    
    if (error === 'not-allowed') {
        mensajeError = "🔇 Necesito permiso para usar el micrófono... -10 felicidad";
    } else if (error === 'no-speech') {
        mensajeError = "🤷‍♂️ No te escuché... ¿puedes hablar? -5 felicidad";
    }
    
    if (typeof completarEvento === 'function') {
        completarEvento('voz', false);
    } else {
        if (isNaN(gameState.happiness)) gameState.happiness = 70;
        gameState.happiness = Math.max(0, gameState.happiness - 5);
    }
    
    if (gameState.happiness <= 0) {
        gameState.isAlive = false;
        mensajeError = "💀 Murió porque no quisiste hablarle... 💀";
    }
    
    const msgDiv = document.getElementById('message');
    if (msgDiv) msgDiv.innerHTML = mensajeError;
    
    vozRequerida = false;
    eventoActivo = null;
    juegoPausado = false;
    
    updateUI();
}

function cancelarVoz() {
    if (!gameState?.isAlive) return;
    
    if (typeof completarEvento === 'function') {
        completarEvento('voz', false);
    } else {
        if (isNaN(gameState.happiness)) gameState.happiness = 70;
        gameState.happiness = Math.max(0, gameState.happiness - 10);
    }
    
    const msgDiv = document.getElementById('message');
    if (msgDiv) msgDiv.innerHTML = "😔 Me ignoraste... eso duele -10 felicidad";
    
    if (gameState.happiness <= 0) {
        gameState.isAlive = false;
        if (msgDiv) msgDiv.innerHTML = "💀 Murió de tristeza por ser ignorado... 💀";
    }
    
    vozRequerida = false;
    eventoActivo = null;
    juegoPausado = false;
    vozActiva = false;
    
    if (reconocimientoVoz) {
        try {
            reconocimientoVoz.stop();
        } catch(e) {}
        reconocimientoVoz = null;
    }
    
    updateUI();
}

function cancelarEscuchaVoz() {
    if (reconocimientoVoz) {
        try {
            reconocimientoVoz.stop();
        } catch(e) {}
        reconocimientoVoz = null;
    }
    cancelarVoz();
}

// ✅ EXPORTAR FUNCIONES GLOBALMENTE - CRUCIAL PARA QUE EL HTML LAS ENCUENTRE
if (typeof window !== 'undefined') {
    window.iniciarReconocimientoVoz = iniciarReconocimientoVoz;
    window.cancelarVoz = cancelarVoz;
    window.cancelarEscuchaVoz = cancelarEscuchaVoz;
    window.verificarYMostrarVoz = verificarYMostrarVoz;
}
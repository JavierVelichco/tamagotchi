// ========== SISTEMA DE VIDEO ==========

const mensajesVideo = [
    "😈 Si me quieres feliz, mira este video...",
    "📺 Necesito que veas esto para sobrevivir...",
    "🎬 Sin video no hay felicidad... tócalo",
    "🔴 MIRA ESTE VIDEO O MUERO"
];

let videoPlayer = null;
let videoCompletadoModal = false;

const INTERVALO_VIDEO = 30000; // 30 segundos

function verificarYMostrarVideo() {
    if (!gameState.isAlive) return;
    if (juegoPausado) return;
    if (videoCompletado) return;
    if (videoRequerido) return;
    if (eventoActivo === 'juego') return;
    
    const ahora = Date.now();
    const tiempoDesdeUltimoVideo = ahora - tiempoUltimoVideo;
    
    if (tiempoDesdeUltimoVideo >= INTERVALO_VIDEO && !videoRequerido && !juegoRequerido && eventoActivo !== 'juego') {
        mostrarBotonVideo();
    }
}

function mostrarBotonVideo() {
    videoRequerido = true;
    eventoActivo = 'video';
    
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `
        ${mensajesVideo[Math.floor(Math.random() * mensajesVideo.length)]}
        <button class="video-btn" onclick="abrirVideoModal()">▶ VER VIDEO</button>
    `;
}

function abrirVideoModal() {
    if (!gameState.isAlive) return;
    
    gameState.lastInteraction = Date.now();
    
    juegoPausado = true;
    videoCompletadoModal = false;
    videoRequerido = false;
    
    // Actualizar el tiempo del último video AHORA
    tiempoUltimoVideo = Date.now();
    
    const modal = document.getElementById('videoModal');
    modal.style.display = 'flex';
    document.getElementById('videoStatus').textContent = '🎬 Mira el video COMPLETO...';
    
    // Configurar botón de cerrar
    const closeBtn = document.getElementById('closeVideoBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            cerrarVideoModal();
        };
    }
    
    if (typeof YT === 'undefined' || !YT.Player) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = function() {
            crearReproductorModal();
        };
    } else {
        crearReproductorModal();
    }
}

function crearReproductorModal() {
    videoPlayer = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: '5_KykHAYdfo',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onStateChange': onPlayerStateChangeModal
        }
    });
}

function onPlayerStateChangeModal(event) {
    if (event.data === 0) { // Video terminado
        videoCompletadoModal = true;
        document.getElementById('videoStatus').innerHTML = '✅ ¡Video completado! +30 felicidad ✨';
        
        if (gameState.isAlive) {
            // Aplicar recompensa
            if (typeof completarEvento === 'function') {
                completarEvento('video', true, { felicidad: 30, adiccion: 15 });
            } else {
                gameState.happiness = Math.min(100, gameState.happiness + 30);
                gameState.addiction = Math.min(100, gameState.addiction + 15);
            }
            updateUI();
        } else {
            console.warn('Mascota muerta, no se aplica recompensa');
        }
        
        // Actualizar el tiempo al completar el video
        tiempoUltimoVideo = Date.now();
        
        setTimeout(() => cerrarVideoModal(), 2000);
    }
}

function cerrarVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) modal.style.display = 'none';
    
    if (videoPlayer) {
        try {
            videoPlayer.destroy();
        } catch(e) {}
        videoPlayer = null;
    }
    
    gameState.lastInteraction = Date.now();
    
    if (!gameState.isAlive) {
        juegoPausado = false;
        videoCompletadoModal = false;
        eventoActivo = null;
        document.getElementById('message').innerHTML = "💀 La mascota ya estaba muerta... 💀";
        updateUI();
        return;
    }
    
    if (!videoCompletadoModal && juegoPausado) {
        gameState.happiness = Math.max(0, gameState.happiness - 20);
        document.getElementById('message').innerHTML = "😠 ¡Cerraste el video sin terminar! 😠";
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
        
        // ✅ También actualizar tiempo si cerró sin terminar
        tiempoUltimoVideo = Date.now();
        
        if (gameState.happiness <= 0) {
            gameState.isAlive = false;
            document.getElementById('message').innerHTML = "💀 Murió por abandonar el video... 💀";
        }
    } 
    else if (videoCompletadoModal) {
        document.getElementById('message').innerHTML = "✨ ¡Gracias por ver el video! ✨";
        videoCompletado = true;
        setTimeout(() => { 
            videoCompletado = false; 
        }, 10000);
    }
    
    juegoPausado = false;
    videoCompletadoModal = false;
    eventoActivo = null;
    updateUI();
}

function verificarTemporizadores() {
    verificarYMostrarVideo();
}
// ========== EVENTOS E INICIALIZACIÓN ==========

// Esperar a que el DOM esté listo
window.onload = function() {
    
    // Botón de reset
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.onclick = function() {
            resetGame();
        };
    }
    
    // Botón de voz manual
    var manualVoiceBtn = document.getElementById('manualVoiceBtn');
    if (manualVoiceBtn) {
        manualVoiceBtn.onclick = function() {
            if (gameState && gameState.isAlive && !juegoPausado && !vozRequerida) {
                if (typeof iniciarReconocimientoVoz === 'function') {
                    iniciarReconocimientoVoz();
                }
            }
        };
    }
    
    // Interacciones globales
    window.onclick = function() {
        if (gameState && gameState.isAlive && !juegoPausado && typeof interactuar === 'function') {
            interactuar();
        }
    };
    
    window.ontouchstart = function() {
        if (gameState && gameState.isAlive && !juegoPausado && typeof interactuar === 'function') {
            interactuar();
        }
    };
    
    // Visibility change
    document.onvisibilitychange = function() {
        if (!document.hidden && juegoPausado && !minijuegoActivo && intervaloRegresoVideo) {
            clearInterval(intervaloRegresoVideo);
            intervaloRegresoVideo = null;
            if (typeof verificarRegresoVideo === 'function') {
                verificarRegresoVideo();
            }
        }
    };
    
    // Inicializar
    setInterval(gameLoop, 1000);
    updateUI();
    
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(function(err) {
            console.log('Service Worker error:', err);
        });
    }
    
    console.log('🎮 Tamagotchi Dependiente - Iniciado');
};

// Asegurar que las funciones existan antes de ejecutar
if (typeof gameLoop === 'undefined') {
    console.error('Error: gameLoop no está definida. Revisa el orden de los scripts.');
}
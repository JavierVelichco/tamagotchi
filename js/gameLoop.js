// ========== INTERACCIÓN DEL USUARIO ==========
function interactuar() {
    if (!gameState.isAlive) return;
    
    if (juegoPausado) {
        document.getElementById('message').innerHTML = "⏳ ¡Primero termina el video o juego! ⏳";
        return;
    }
    
    gameState.lastInteraction = Date.now();
    gameState.abandonSeconds = 0;
    
    let happinessGain = 8 + (gameState.addiction * 0.15);
    gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
    gameState.addiction = Math.min(100, gameState.addiction + 2.5);
    
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
    }
    
    // Limpiar mensajes de video/juego pendientes
    if (videoRequerido) {
        videoRequerido = false;
        eventoActivo = null;  // ✅ Limpiar evento activo
        document.getElementById('message').innerHTML = "🙄 Me diste atención... por ahora no necesito video 🙄";
    }
    if (juegoRequerido) {
        juegoRequerido = false;
        eventoActivo = null;  // ✅ Limpiar evento activo
        document.getElementById('message').innerHTML = "🙄 Me diste atención... por ahora no necesito jugar 🙄";
    }
    if (vozRequerida) {
        vozRequerida = false;
        eventoActivo = null;  // ✅ Limpiar evento activo
        document.getElementById('message').innerHTML = "🙄 Gracias por hablarme... por ahora estoy bien 🙄";
    }
    
    updateUI();
}

// ========== GAME LOOP PRINCIPAL ==========
function gameLoop() {
    // Si está pausado, NO HACER NADA
    if (juegoPausado) return;
    if (!gameState.isAlive) return;
    
    // Calcular decaimiento de felicidad
    const now = Date.now();
    const secondsInactive = Math.floor((now - gameState.lastInteraction) / 1000);
    gameState.abandonSeconds = secondsInactive;
    
    let decayRate = 0.3;
    decayRate += (gameState.addiction / 100) * 2.5;
    
    if (secondsInactive > 5) decayRate += 0.5;
    if (secondsInactive > 15) decayRate += 1;
    if (secondsInactive > 30) decayRate += 2;
    
    gameState.happiness = Math.max(0, gameState.happiness - decayRate);
    
    if (gameState.happiness <= 0 || secondsInactive >= 45) {
        gameState.isAlive = false;
        gameState.happiness = 0;
        updateUI();
        if (window.navigator?.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
        }
        document.getElementById('message').innerHTML = "💀 ¡Tu mascota ha muerto! Reinicia para revivirla 💀";
        return;
    }
    
    // Verificar si ya hay un botón antes de sobrescribir
    const messageDiv = document.getElementById('message');
    const tieneBoton = messageDiv.innerHTML.includes('button') || 
                       messageDiv.innerHTML.includes('video-btn') || 
                       messageDiv.innerHTML.includes('juego-btn') ||
                       messageDiv.innerHTML.includes('voz-btn');
    
    // Solo mostrar mensajes de inactividad si NO hay un botón pendiente
    if (!videoRequerido && !juegoRequerido && !vozRequerida && !juegoPausado && !tieneBoton && eventoActivo === null) {
        if (secondsInactive >= 30) {
            messageDiv.innerHTML = "😭 ¡NO SOPORTO MÁS! ¡TÓCAME YA! 😭";
        } else if (secondsInactive >= 20) {
            messageDiv.innerHTML = "⚠️ ME ESTOY MURIENDO... por favor ⚠️";
        } else if (secondsInactive >= 10) {
            messageDiv.innerHTML = "😢 ¿En serio me vas a ignorar tanto tiempo? 😢";
        }
    }
    
    updateUI();
    
    // ✅ NUEVO SISTEMA DE EVENTOS ALEATORIOS (reemplaza los temporizadores individuales)
    if (typeof verificarEventoAleatorio === 'function') {
        verificarEventoAleatorio();
    } else {
        // Fallback: si no existe el sistema aleatorio, usar los temporizadores individuales
        if (typeof verificarYMostrarVideo === 'function') {
            verificarYMostrarVideo();
        }
        if (typeof verificarYMostrarJuego === 'function') {
            verificarYMostrarJuego();
        }
        if (typeof verificarYMostrarVoz === 'function') {
            verificarYMostrarVoz();
        }
    }
}

function resetGame() {
    // Cerrar minijuego
    if (minijuegoActivo) {
        if (intervaloFantasmas) clearInterval(intervaloFantasmas);
        if (intervaloJuego) clearInterval(intervaloJuego);
        const overlay = document.getElementById('juegoOverlay');
        if (overlay) overlay.remove();
        minijuegoActivo = false;
    }
    
    // Cerrar modal de video
    const modal = document.getElementById('videoModal');
    if (modal && modal.style.display === 'flex') {
        if (videoPlayer) {
            videoPlayer.destroy();
            videoPlayer = null;
        }
        modal.style.display = 'none';
    }
    
    // Limpiar sistema de voz
    if (reconocimientoVoz) {
        try {
            reconocimientoVoz.stop();
        } catch(e) {}
        reconocimientoVoz = null;
    }
    
    gameState = {
        happiness: 70,
        addiction: 0,
        isAlive: true,
        lastInteraction: Date.now(),
        abandonSeconds: 0,
        lastVoiceInteraction: Date.now()  // ✅ Añadir esta línea
    };
    
    videoRequerido = false;
    videoCompletado = false;
    juegoRequerido = false;
    vozRequerida = false;
    juegoPausado = false;
    eventoActivo = null;
    vozActiva = false;
    
    // Resetear temporizadores
    if (typeof tiempoUltimoVideo !== 'undefined') tiempoUltimoVideo = Date.now();
    if (typeof tiempoUltimoJuego !== 'undefined') tiempoUltimoJuego = Date.now();
    
    // ✅ Reiniciar sistema de eventos aleatorios si existe
    if (typeof reiniciarEventos === 'function') {
        reiniciarEventos();
    }
    
    document.getElementById('message').innerHTML = "🎉 ¡He renacido! No me abandones otra vez... 🎉";
    updateUI();
    
    if (window.navigator?.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
    }
}
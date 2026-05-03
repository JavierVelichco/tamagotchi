// ========== SISTEMA DE EVENTOS ALEATORIOS ==========

// Definición de todos los eventos disponibles
const EVENTOS = {
    VIDEO: 'video',
    JUEGO: 'juego',
    VOZ: 'voz'
};

// Configuración de cada evento
const configEventos = {
    [EVENTOS.VIDEO]: {
        nombre: 'Video',
        emoji: '📺',
        mensajes: [
            "😈 Si me quieres feliz, mira este video...",
            "📺 Necesito que veas esto para sobrevivir...",
            "🎬 Sin video no hay felicidad... tócalo",
            "🔴 MIRA ESTE VIDEO O MUERO"
        ],
        recompensa: { felicidad: 30, adiccion: 15 },
        penalizacion: 20,
        duracion: 15000, // 15 segundos para completar
        cooldown: 20000, // 20 segundos después de completado
        peso: 30 // Probabilidad (30%)
    },
    [EVENTOS.JUEGO]: {
        nombre: 'Juego',
        emoji: '🎮',
        mensajes: [
            "🎮 ¡Juega conmigo o me pongo triste!",
            "👻 Toca los fantasmas o pierdo felicidad...",
            "🎯 Necesito que juegues para sentirme vivo",
            "⚠️ Juega ahora o mi felicidad bajará"
        ],
        recompensa: null, // Se calcula en el juego
        penalizacion: 15,
        duracion: 15000, // 15 segundos
        cooldown: 15000,
        peso: 35 // Probabilidad (35%)
    },
    [EVENTOS.VOZ]: {
        nombre: 'Voz',
        emoji: '🎤',
        mensajes: [
            "🗣️ ¡Háblame! Necesito oír tu voz...",
            "🎤 Dime algo bonito o me pondré triste",
            "📢 ¡Habla conmigo! Me siento solo...",
            "💬 Una palabra tuya me haría feliz"
        ],
        recompensa: { felicidad: 20, adiccion: 8 },
        penalizacion: 10,
        duracion: 10000, // 10 segundos
        cooldown: 25000,
        peso: 25 // Probabilidad (25%)
    }
    // 👻 Fácil de añadir más eventos:
    // [EVENTOS.COMIDA]: {
    //     nombre: 'Comida',
    //     emoji: '🍕',
    //     mensajes: ["🍕 ¡Dame de comer!", "🍔 Tengo hambre..."],
    //     recompensa: { felicidad: 15, adiccion: 5 },
    //     penalizacion: 12,
    //     duracion: 8000,
    //     cooldown: 30000,
    //     peso: 10
    // }
};

// Estado de los eventos
let ultimoEvento = null;
let tiempoUltimoEvento = Date.now();
let eventoEnEspera = null;
let intervaloMinimoEvento = 8000; // 8 segundos mínimo entre eventos
let intervaloMaximoEvento = 25000; // 25 segundos máximo entre eventos
let tiempoProximoEvento = 0;

// Cooldowns individuales por evento
let cooldowns = {
    [EVENTOS.VIDEO]: 0,
    [EVENTOS.JUEGO]: 0,
    [EVENTOS.VOZ]: 0
};

// Calcular próxima espera aleatoria
function calcularProximaEspera() {
    const espera = Math.random() * (intervaloMaximoEvento - intervaloMinimoEvento) + intervaloMinimoEvento;
    tiempoProximoEvento = Date.now() + espera;
    console.log(`📅 Próximo evento en ${Math.round(espera/1000)} segundos`);
    return espera;
}

// Seleccionar evento aleatorio basado en pesos
function seleccionarEventoAleatorio() {
    // Filtrar eventos que no están en cooldown
    const ahora = Date.now();
    const eventosDisponibles = Object.keys(configEventos).filter(evento => {
        return cooldowns[evento] <= ahora;
    });
    
    if (eventosDisponibles.length === 0) {
        console.log('Todos los eventos en cooldown');
        return null;
    }
    
    // Calcular peso total
    let pesoTotal = 0;
    eventosDisponibles.forEach(evento => {
        pesoTotal += configEventos[evento].peso;
    });
    
    // Selección aleatoria ponderada
    let random = Math.random() * pesoTotal;
    let acumulado = 0;
    
    for (const evento of eventosDisponibles) {
        acumulado += configEventos[evento].peso;
        if (random <= acumulado) {
            console.log(`🎲 Evento seleccionado: ${configEventos[evento].nombre} (Peso: ${configEventos[evento].peso})`);
            return evento;
        }
    }
    
    return eventosDisponibles[0];
}

// Verificar si debemos mostrar un evento
function verificarEventoAleatorio() {
    if (!gameState.isAlive) return;
    if (juegoPausado) return;
    if (videoCompletado) return;
    if (eventoEnEspera) return;
    if (eventoActivo !== null) return;
    
    const ahora = Date.now();
    
    // Si no hay próximo evento programado, calcular uno
    if (tiempoProximoEvento === 0) {
        calcularProximaEspera();
        return;
    }
    
    // Si aún no es tiempo, salir
    if (ahora < tiempoProximoEvento) return;
    
    // Seleccionar evento aleatorio
    const evento = seleccionarEventoAleatorio();
    
    if (evento) {
        mostrarEvento(evento);
        // Programar próximo evento (pero no inmediatamente)
        calcularProximaEspera();
    } else {
        // Si no hay eventos disponibles, esperar más tiempo
        tiempoProximoEvento = ahora + 5000;
    }
}

// Mostrar un evento específico
function mostrarEvento(evento) {
    eventoEnEspera = evento;
    eventoActivo = evento;
    const config = configEventos[evento];
    
    const messageDiv = document.getElementById('message');
    
    // Actualizar según el tipo de evento
    switch(evento) {
        case EVENTOS.VIDEO:
            videoRequerido = true;
            messageDiv.innerHTML = `
                ${config.mensajes[Math.floor(Math.random() * config.mensajes.length)]}
                <button class="video-btn" onclick="abrirVideoModal()">${config.emoji} VER VIDEO</button>
            `;
            break;
        case EVENTOS.JUEGO:
            juegoRequerido = true;
            messageDiv.innerHTML = `
                ${config.mensajes[Math.floor(Math.random() * config.mensajes.length)]}
                <button class="juego-btn" onclick="abrirMinijuego()">${config.emoji} JUGAR AHORA</button>
            `;
            break;
        case EVENTOS.VOZ:
            vozRequerida = true;
            messageDiv.innerHTML = `
                ${config.mensajes[Math.floor(Math.random() * config.mensajes.length)]}
                <button class="voz-btn" onclick="iniciarReconocimientoVoz()">${config.emoji} HABLAR AHORA</button>
                <button class="voz-cancel-btn" onclick="cancelarVoz()">❌ Ignorar</button>
            `;
            break;
    }
}

// Marcar evento como completado
function completarEvento(evento, exito, recompensaPersonalizada = null) {
    const config = configEventos[evento];
    
    if (exito) {
        let recompensaFelicidad = recompensaPersonalizada || config.recompensa?.felicidad || 15;
        let recompensaAdiccion = recompensaPersonalizada || config.recompensa?.adiccion || 5;
        
        if (typeof recompensaFelicidad === 'object') {
            recompensaFelicidad = recompensaFelicidad.felicidad;
            recompensaAdiccion = recompensaFelicidad.adiccion;
        }
        
        gameState.happiness = Math.min(100, gameState.happiness + recompensaFelicidad);
        gameState.addiction = Math.min(100, gameState.addiction + recompensaAdiccion);
    } else {
        gameState.happiness = Math.max(0, gameState.happiness - config.penalizacion);
    }
    
    // Aplicar cooldown al evento completado
    cooldowns[evento] = Date.now() + config.cooldown;
    
    // Limpiar estados
    eventoEnEspera = null;
    
    if (evento === EVENTOS.VIDEO) {
        videoRequerido = false;
        videoCompletado = true;
        setTimeout(() => { videoCompletado = false; }, 10000);
    } else if (evento === EVENTOS.JUEGO) {
        juegoRequerido = false;
    } else if (evento === EVENTOS.VOZ) {
        vozRequerida = false;
        gameState.lastVoiceInteraction = Date.now();
    }
    
    updateUI();
}

// Cancelar evento (por ignorar)
function cancelarEvento() {
    if (!eventoEnEspera) return;
    
    const config = configEventos[eventoEnEspera];
    gameState.happiness = Math.max(0, gameState.happiness - config.penalizacion);
    
    document.getElementById('message').innerHTML = `😠 Ignoraste a tu mascota... -${config.penalizacion} felicidad 😠`;
    
    eventoEnEspera = null;
    eventoActivo = null;
    
    if (typeof juegoPausado !== 'undefined') juegoPausado = false;
    
    // Programar siguiente evento más pronto
    tiempoProximoEvento = Date.now() + 5000;
    
    updateUI();
}

// Reiniciar sistema de eventos
function reiniciarEventos() {
    eventoEnEspera = null;
    tiempoProximoEvento = 0;
    cooldowns = {
        [EVENTOS.VIDEO]: 0,
        [EVENTOS.JUEGO]: 0,
        [EVENTOS.VOZ]: 0
    };
    calcularProximaEspera();
}

// Función para modificar pesos dinámicamente (ej: si la mascota está triste)
function ajustarPesosSegunEstado() {
    if (!gameState) return;
    
    if (gameState.happiness < 30) {
        // Mascota triste: más probabilidad de eventos que den felicidad
        configEventos[EVENTOS.VIDEO].peso = 40;
        configEventos[EVENTOS.JUEGO].peso = 40;
        configEventos[EVENTOS.VOZ].peso = 20;
    } else if (gameState.addiction > 70) {
        // Mascota adicta: más probabilidad de juegos
        configEventos[EVENTOS.VIDEO].peso = 20;
        configEventos[EVENTOS.JUEGO].peso = 60;
        configEventos[EVENTOS.VOZ].peso = 20;
    } else {
        // Pesos normales
        configEventos[EVENTOS.VIDEO].peso = 30;
        configEventos[EVENTOS.JUEGO].peso = 35;
        configEventos[EVENTOS.VOZ].peso = 35;
    }
}
// ========== FUNCIONES DE UI ==========

function getEmoji() {
    if (!gameState?.isAlive) return "💀";
    let h = isNaN(gameState.happiness) ? 70 : gameState.happiness;
    if (h >= 80) return ["😍", "🥰", "😁"][Math.floor(Math.random() * 3)];
    if (h >= 60) return ["😊", "🙂", "😌"][Math.floor(Math.random() * 3)];
    if (h >= 40) return ["😐", "🤨", "😕"][Math.floor(Math.random() * 3)];
    if (h >= 20) return ["😢", "😔", "😞"][Math.floor(Math.random() * 3)];
    return ["😭", "😫", "💀"][Math.floor(Math.random() * 2)];
}

function updateUI() {
    if (!gameState) return;
    
    // Corregir valores NaN
    if (isNaN(gameState.happiness)) gameState.happiness = 70;
    if (isNaN(gameState.addiction)) gameState.addiction = 0;
    if (isNaN(gameState.abandonSeconds)) gameState.abandonSeconds = 0;
    
    // Actualizar elementos (con verificación de existencia)
    const setElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    
    const setStyle = (id, width) => {
        const el = document.getElementById(id);
        if (el) el.style.width = width;
    };
    
    document.getElementById('emoji') && (document.getElementById('emoji').textContent = getEmoji());
    setStyle('happinessBar', `${Math.min(100, gameState.happiness)}%`);
    setElement('happinessValue', `${Math.floor(gameState.happiness)}%`);
    setStyle('addictionBar', `${Math.min(100, gameState.addiction)}%`);
    setElement('addictionValue', `${Math.floor(gameState.addiction)}%`);
    setElement('abandonTimer', gameState.abandonSeconds);
    
    // Mensaje warning
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        if (!gameState.isAlive || (gameState.happiness < 30 && !videoRequerido && !juegoPausado)) {
            msgDiv.classList.add('warning');
        } else {
            msgDiv.classList.remove('warning');
        }
    }
    
    // Animación shake
    const emojiDiv = document.getElementById('emoji');
    if (emojiDiv && gameState.happiness < 20 && gameState.isAlive) {
        emojiDiv.classList.add('shake');
        setTimeout(() => emojiDiv?.classList.remove('shake'), 300);
    }
}
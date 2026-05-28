// Configuración de premios y valores de la máquina
const fruitValues = [
    { name: 'cereza', multiplier: 2 },
    { name: 'limon', multiplier: 3 },
    { name: 'sandia', multiplier: 5 },
    { name: 'uva', multiplier: 8 },
    { name: 'siete', multiplier: 20 }
];

// Ajustes de economía
let balance = 100;
const bet = 10;

// Variables de estado interno
let currentResults = [];
let nextReelToStop = 0; // Controla cuál rodillo se debe parar (0, 1 o 2)
let autoStopTimeout = null; // Guardará el temporizador automático

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

const btnSpin = document.getElementById('btn-spin');
const btnStop = document.getElementById('btn-stop');
const message = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');

// Listeners
btnSpin.addEventListener('click', startSpinning);
btnStop.addEventListener('click', stopNextReelManual);

function startSpinning() {
    // Validar si el jugador tiene dinero suficiente
    if (balance < bet) {
        message.textContent = "❌ ¡No tienes saldo suficiente!";
        message.className = "message lose";
        return;
    }

    // Descontar coste de la jugada
    balance -= bet;
    balanceDisplay.textContent = balance;

    // Cambiar estado de la interfaz
    btnSpin.disabled = true;
    btnStop.disabled = false;
    message.textContent = "🎰 ¡Rodillos girando! Pausa el primero...";
    message.className = "message";

    // Resetear el índice de frenado secuencial
    nextReelToStop = 0;

    // Iniciar animación de giro en bucle vertical en todos los rodillos
    reelElements.forEach(reel => {
        reel.style.transform = 'none';
        reel.classList.add('spinning');
    });

    // Iniciar el temporizador automático de seguridad
    planAutoStop();
}

// Planifica el frenado automático (Modificado a 4000ms = 4 segundos)
function planAutoStop() {
    clearTimeout(autoStopTimeout);
    autoStopTimeout = setTimeout(() => {
        stopNextReel();
    }, 4000); // <-- Fijado en 4 segundos por rodillo
}

// Función que se ejecuta cuando el usuario pulsa el botón manualmente
function stopNextReelManual() {
    // Cancelamos el temporizador automático actual para que no se pisen
    clearTimeout(autoStopTimeout);
    stopNextReel();
}

// Núcleo de la parada secuencial
function stopNextReel() {
    if (nextReelToStop < 3) {
        const reelIndex = nextReelToStop;
        const reel = reelElements[reelIndex];

        // Detener la animación de este rodillo en específico
        reel.classList.remove('spinning');

        // Seleccionar fruta ganadora al azar para este rodillo
        const finalIndex = Math.floor(Math.random() * fruitValues.length);
        currentResults[reelIndex] = finalIndex;

        // Desplazar la tira vertical (cada fruta mide 150px de alto)
        const offset = finalIndex * 150;
        reel.style.transform = `translateY(-${offset}px)`;

        // Avanzar al siguiente rodillo
        nextReelToStop++;

        // Actualizar el mensaje para guiar al usuario
        if (nextReelToStop === 1) {
            message.textContent = "⏱️ ¡Bien! Pausa el segundo...";
            planAutoStop(); // Vuelve a planificar 4 segundos para el rodillo 2
        } else if (nextReelToStop === 2) {
            message.textContent = "🔥 ¡Último rodillo! Pausa el tercero...";
            planAutoStop(); // Vuelve a planificar 4 segundos para el rodillo 3
        } else if (nextReelToStop === 3) {
            // Se han detenido los 3 rodillos
            btnStop.disabled = true;
            btnSpin.disabled = false;
            checkResult();
        }
    }
}

function checkResult() {
    const [res1, res2, res3] = currentResults;

    // Verificar si los tres rodillos coinciden
    if (res1 === res2 && res2 === res3) {
        const winningFruit = fruitValues[res1];
        const prize = bet * winningFruit.multiplier;
        
        balance += prize;
        balanceDisplay.textContent = balance;

        message.innerHTML = `¡GANASTE! 🎉<br>3 x ${winningFruit.name.toUpperCase()} (x${winningFruit.multiplier}) +${prize}€`;
        message.className = "message win";
    } else {
        message.textContent = `Inténtalo de nuevo 😢 Perdiste ${bet}€`;
        message.className = "message lose";
    }
}

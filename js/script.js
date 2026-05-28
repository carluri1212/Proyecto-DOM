// Aquí defino cada fruta con su nombre y cuánto paga si salen tres iguales o en pareja
const fruitValues = [
    { name: 'cereza', multiplier: 2,  pairMultiplier: 1 },
    { name: 'limon',  multiplier: 3,  pairMultiplier: 1 },
    { name: 'sandia', multiplier: 5,  pairMultiplier: 1 },
    { name: 'uva',    multiplier: 8,  pairMultiplier: 2 },
    { name: 'siete',  multiplier: 20, pairMultiplier: 5 }
];

// Variables del juego: saldo inicial, apuesta actual y sus límites
let balance = 100;
let bet = 10;
const BET_MIN = 10;
const BET_MAX = 50;
const BET_STEP = 10;

// Cada imagen mide 150px de alto, así que la tira entera son 5 × 150 = 750px
const IMG_HEIGHT = 150;
const REEL_HEIGHT = fruitValues.length * IMG_HEIGHT;
const SPIN_SPEED = 15; // píxeles que avanza el rodillo en cada frame

// Arrays para controlar el estado de los tres rodillos
let reelPositions = [0, 0, 0];   // posición actual de cada rodillo en píxeles
let reelIntervals = [null, null, null]; // guardamos el setInterval de cada rodillo para poder pararlo
let reelSpeeds = [SPIN_SPEED, SPIN_SPEED, SPIN_SPEED]; // velocidad actual (baja al frenar)
let reelStopped = [false, false, false]; // true cuando el rodillo ha terminado de parar
let currentResults = [0, 0, 0];  // índice de la fruta que quedó en cada rodillo
let reelsStoppedCount = 0;       // contador para saber cuándo han parado los tres

// Cojo los elementos del HTML que voy a necesitar modificar con JS
const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

const btnSpin   = document.getElementById('btn-spin');
const btnStops  = [
    document.getElementById('btn-stop1'),
    document.getElementById('btn-stop2'),
    document.getElementById('btn-stop3')
];
const message      = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');
const betDisplay   = document.getElementById('bet-display');
const btnBetDown   = document.getElementById('btn-bet-down');
const btnBetUp     = document.getElementById('btn-bet-up');
const btnAllIn     = document.getElementById('btn-allin');

// Asigno los eventos a los botones con addEventListener
btnSpin.addEventListener('click', startSpinning);
btnStops[0].addEventListener('click', function() { stopReel(0); });
btnStops[1].addEventListener('click', function() { stopReel(1); });
btnStops[2].addEventListener('click', function() { stopReel(2); });

// Botones para subir y bajar la apuesta de 10 en 10
btnBetDown.addEventListener('click', function() {
    if (bet > BET_MIN) {
        bet -= BET_STEP;
        betDisplay.textContent = bet;
    }
});

btnBetUp.addEventListener('click', function() {
    if (bet < BET_MAX && bet + BET_STEP <= balance) {
        bet += BET_STEP;
        betDisplay.textContent = bet;
    }
});

// All In: pone toda la pasta de una vez
btnAllIn.addEventListener('click', function() {
    bet = balance;
    betDisplay.textContent = bet;
});

// Función principal: descuenta la apuesta y pone los rodillos a girar
function startSpinning() {
    if (balance < bet) {
        message.textContent = "❌ ¡No tienes saldo suficiente!";
        message.className = "message lose";
        return;
    }

    balance -= bet;
    balanceDisplay.textContent = balance;
    btnSpin.disabled = true;
    message.textContent = "🎰 ¡Para cada rodillo cuando quieras!";
    message.className = "message";

    // Reinicio el estado de todos los rodillos
    reelStopped = [false, false, false];
    reelsStoppedCount = 0;

    // Con un bucle arranco los tres rodillos a la vez
    for (let i = 0; i < 3; i++) {
        btnStops[i].disabled = false;
        reelPositions[i] = 0;
        reelSpeeds[i] = SPIN_SPEED;
        reelElements[i].style.transition = 'none';
        reelElements[i].style.transform = 'translateY(0)';

        // setInterval ejecuta este código cada 16ms (~60 veces por segundo)
        // muevo el rodillo hacia abajo sumando píxeles y con % vuelve al principio
        reelIntervals[i] = setInterval(function() {
            reelPositions[i] = (reelPositions[i] + SPIN_SPEED) % REEL_HEIGHT;
            reelElements[i].style.transform = `translateY(-${reelPositions[i]}px)`;
        }, 16);
    }
}

// Cuando pulso "Parar", el rodillo no para de golpe sino que frena poco a poco
function stopReel(index) {
    clearInterval(reelIntervals[index]); // cancelo el giro normal
    btnStops[index].disabled = true;
    reelSpeeds[index] = SPIN_SPEED;

    // Arranco un nuevo intervalo que va reduciendo la velocidad en cada frame
    reelIntervals[index] = setInterval(function() {
        reelSpeeds[index] = reelSpeeds[index] * 0.85; // cada frame va un 15% más lento

        if (reelSpeeds[index] < 0.5) {
            // Ya está casi parado: lo encajo en la fruta más cercana
            clearInterval(reelIntervals[index]);

            let fruitIndex = Math.round(reelPositions[index] / IMG_HEIGHT) % fruitValues.length;
            let snappedPos = fruitIndex * IMG_HEIGHT;

            reelElements[index].style.transition = 'transform 0.1s ease-out';
            reelElements[index].style.transform = `translateY(-${snappedPos}px)`;
            currentResults[index] = fruitIndex;
            reelStopped[index] = true;
            reelsStoppedCount++;

            // Cuando los tres han parado, compruebo el resultado
            if (reelsStoppedCount === 3) {
                btnSpin.disabled = false;
                checkResult();
            }
        } else {
            // Todavía en movimiento: sigo desplazando el rodillo
            reelPositions[index] = (reelPositions[index] + reelSpeeds[index]) % REEL_HEIGHT;
            reelElements[index].style.transform = `translateY(-${reelPositions[index]}px)`;
        }
    }, 16);
}

// Compruebo qué combinación ha salido y calculo el premio
function checkResult() {
    let r0 = currentResults[0];
    let r1 = currentResults[1];
    let r2 = currentResults[2];

    // Primero miro si los tres rodillos muestran la misma fruta
    if (r0 === r1 && r1 === r2) {
        let fruit = fruitValues[r0];
        let prize = bet * fruit.multiplier;
        balance += prize;
        balanceDisplay.textContent = balance;
        message.innerHTML = `¡JACKPOT! 🎉 3× ${fruit.name.toUpperCase()} (×${fruit.multiplier}) → +${prize}€`;
        message.className = "message win";
        return;
    }

    // Si no hay tres iguales, busco si hay pareja en alguno de los tres pares posibles
    let pairedFruitIndex = -1;
    if (r0 === r1) pairedFruitIndex = r0;
    else if (r1 === r2) pairedFruitIndex = r1;
    else if (r0 === r2) pairedFruitIndex = r0;

    if (pairedFruitIndex !== -1) {
        let fruit = fruitValues[pairedFruitIndex];
        let prize = bet * fruit.pairMultiplier;
        balance += prize;
        balanceDisplay.textContent = balance;
        if (fruit.pairMultiplier > 1) {
            message.innerHTML = `¡Pareja! 2× ${fruit.name.toUpperCase()} (×${fruit.pairMultiplier}) → +${prize}€`;
        } else {
            message.innerHTML = `Pareja de ${fruit.name.toUpperCase()} — recuperas la apuesta 😅`;
        }
        message.className = "message win";
        return;
    }

    // Si no hay ninguna combinación, se pierde la apuesta
    message.textContent = `Sin premio 😢 Perdiste ${bet}€`;
    message.className = "message lose";
}

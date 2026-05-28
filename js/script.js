const fruitValues = [
    { name: 'cereza', multiplier: 2,  pairMultiplier: 1 },
    { name: 'limon',  multiplier: 3,  pairMultiplier: 1 },
    { name: 'sandia', multiplier: 5,  pairMultiplier: 1 },
    { name: 'uva',    multiplier: 8,  pairMultiplier: 2 },
    { name: 'siete',  multiplier: 20, pairMultiplier: 5 }
];

let balance = 100;
let bet = 10;
const BET_MIN = 10;
const BET_MAX = 50;
const BET_STEP = 10;

const IMG_HEIGHT = 150;
const REEL_HEIGHT = fruitValues.length * IMG_HEIGHT; // 750px
const SPIN_SPEED = 15;

let reelPositions = [0, 0, 0];
let reelIntervals = [null, null, null];
let reelSpeeds = [SPIN_SPEED, SPIN_SPEED, SPIN_SPEED];
let reelStopped = [false, false, false];
let currentResults = [0, 0, 0];
let reelsStoppedCount = 0;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

const btnSpin = document.getElementById('btn-spin');
const btnStops = [
    document.getElementById('btn-stop1'),
    document.getElementById('btn-stop2'),
    document.getElementById('btn-stop3')
];
const message = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');
const betDisplay = document.getElementById('bet-display');
const btnBetDown = document.getElementById('btn-bet-down');
const btnBetUp = document.getElementById('btn-bet-up');
const btnAllIn = document.getElementById('btn-allin');

btnSpin.addEventListener('click', startSpinning);

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

btnAllIn.addEventListener('click', function() {
    bet = balance;
    betDisplay.textContent = bet;
});
btnStops[0].addEventListener('click', function() { stopReel(0); });
btnStops[1].addEventListener('click', function() { stopReel(1); });
btnStops[2].addEventListener('click', function() { stopReel(2); });

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

    reelStopped = [false, false, false];
    reelsStoppedCount = 0;

    for (let i = 0; i < 3; i++) {
        btnStops[i].disabled = false;
        reelPositions[i] = 0;
        reelSpeeds[i] = SPIN_SPEED;
        reelElements[i].style.transition = 'none';
        reelElements[i].style.transform = 'translateY(0)';

        reelIntervals[i] = setInterval(function() {
            reelPositions[i] = (reelPositions[i] + SPIN_SPEED) % REEL_HEIGHT;
            reelElements[i].style.transform = `translateY(-${reelPositions[i]}px)`;
        }, 16);
    }
}

function stopReel(index) {
    clearInterval(reelIntervals[index]);
    btnStops[index].disabled = true;
    reelSpeeds[index] = SPIN_SPEED;

    reelIntervals[index] = setInterval(function() {
        reelSpeeds[index] = reelSpeeds[index] * 0.85;

        if (reelSpeeds[index] < 0.5) {
            clearInterval(reelIntervals[index]);

            let fruitIndex = Math.round(reelPositions[index] / IMG_HEIGHT) % fruitValues.length;
            let snappedPos = fruitIndex * IMG_HEIGHT;

            reelElements[index].style.transition = 'transform 0.1s ease-out';
            reelElements[index].style.transform = `translateY(-${snappedPos}px)`;
            currentResults[index] = fruitIndex;
            reelStopped[index] = true;
            reelsStoppedCount++;

            if (reelsStoppedCount === 3) {
                btnSpin.disabled = false;
                checkResult();
            }
        } else {
            reelPositions[index] = (reelPositions[index] + reelSpeeds[index]) % REEL_HEIGHT;
            reelElements[index].style.transform = `translateY(-${reelPositions[index]}px)`;
        }
    }, 16);
}

function checkResult() {
    let r0 = currentResults[0];
    let r1 = currentResults[1];
    let r2 = currentResults[2];

    // Tres iguales
    if (r0 === r1 && r1 === r2) {
        let fruit = fruitValues[r0];
        let prize = bet * fruit.multiplier;
        balance += prize;
        balanceDisplay.textContent = balance;
        message.innerHTML = `¡JACKPOT! 🎉 3× ${fruit.name.toUpperCase()} (×${fruit.multiplier}) → +${prize}€`;
        message.className = "message win";
        return;
    }

    // Pareja — buscar qué símbolo se repite
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

    // Sin premio
    message.textContent = `Sin premio 😢 Perdiste ${bet}€`;
    message.className = "message lose";
}

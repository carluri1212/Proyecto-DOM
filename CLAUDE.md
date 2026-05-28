# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

Open `index.html` directly in a browser — no build step or server required. For live reload during development, use a local server such as VS Code's Live Server extension or:

```
npx serve .
```

## Architecture

This is a vanilla HTML/CSS/JS slot machine game with no dependencies or bundler.

- `index.html` — static markup; three reels (`#reel1`–`#reel3`), scoreboard, and control buttons
- `css/styles.css` — all styles; the `.spinning` class drives the CSS `spinWheel` keyframe animation
- `js/script.js` — all game logic
- `images/` — five fruit PNGs: cereza, limon, sandia, uva, siete (each 150 px tall in its slot)

### Game loop (js/script.js)

`startSpinning()` deducts the bet, adds the `.spinning` CSS class to all three reels, and schedules `planAutoStop()` (4-second timer). The player clicks **Pausar** to call `stopNextReelManual()`, which cancels the timer and delegates to `stopNextReel()`. Each call to `stopNextReel()` stops one reel in sequence (tracked by `nextReelToStop`), picks a random fruit index, and shifts the reel strip with `translateY(-${index * 150}px)`. After all three reels stop, `checkResult()` awards the prize if all three indices match.

### Prize table

| Symbol  | Multiplier |
|---------|-----------|
| cereza  | ×2        |
| limon   | ×3        |
| sandia  | ×5        |
| uva     | ×8        |
| siete   | ×20       |

Starting balance is 100 €; bet is fixed at 10 € per spin.

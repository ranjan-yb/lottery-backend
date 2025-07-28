// controllers/countdown.js

let currentRound = {
  startTime: Date.now(),
  duration: 30000, // 30s countdown
  pauseDuration: 5000, // 5s pause
  isPaused: false,
};

function startNextRound() {
  currentRound.isPaused = false;
  currentRound.startTime = Date.now();
}

setInterval(() => {
  const now = Date.now();
  const elapsed = now - currentRound.startTime;

  if (!currentRound.isPaused && elapsed >= currentRound.duration) {
    // Round just ended, enter pause mode
    currentRound.isPaused = true;
    currentRound.startTime = now;
  } else if (currentRound.isPaused && elapsed >= currentRound.pauseDuration) {
    // Pause ended, start next round
    startNextRound();
  }
}, 1000); // check every second

function getTimeLeft() {
  const now = Date.now();
  const elapsed = now - currentRound.startTime;

  if (currentRound.isPaused) {
    const pauseLeft = currentRound.pauseDuration - elapsed;
    return {
      timeLeft: Math.max(0, Math.floor(pauseLeft / 1000)),
      isPaused: true,
    };
  } else {
    const timeLeft = currentRound.duration - elapsed;
    return {
      timeLeft: Math.max(0, Math.floor(timeLeft / 1000)),
      isPaused: false,
    };
  }
}

module.exports = { getTimeLeft, getCurrentRound: () => currentRound };

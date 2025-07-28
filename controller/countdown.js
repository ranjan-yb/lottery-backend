// gameTimer.js
let currentRound = {
  startTime: Date.now(),
  duration: 30000, // 30 seconds
};

setInterval(() => {
  // Every 30 sec, reset round
  currentRound.startTime = Date.now();
}, currentRound.duration);

function getTimeLeft() {
  const elapsed = Date.now() - currentRound.startTime;
  const timeLeft = currentRound.duration - elapsed;
  return Math.max(0, Math.floor(timeLeft / 1000)); // in seconds
}

module.exports = {
  getTimeLeft,
  getCurrentRound: () => currentRound,
};

const express = require("express");
const router = express.Router();
const GameData = require("../models/gameData");
const verifyToken = require('../middleware/verifyToken')
const User = require('../models/gameData')

router.post("/play", verifyToken, async (req, res) => {
  const { userChoice, userNumber, userColor, amount = 0 } = req.body;

  if (amount <= 0) return res.status(400).json({ error: "Invalid bet amount" });

  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.betAmount < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // ✅ Apply game logic
    const actualRandomChoice = Math.random() < 0.5 ? "Big" : "Small";
    const randomNumber = Math.floor(Math.random() * 10);
    const colors = ["Green", "Purple", "Red"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Evaluate results
    const bigSmallWin = userChoice === actualRandomChoice;
    const numberWin = userNumber === randomNumber;
    const colorWin = userColor === randomColor;

    // Track results
    const resultBigSmall = userChoice ? (bigSmallWin ? "🎉 You Win!" : "💔 You Lose!") : "";
    const resultNumber = userNumber !== undefined ? (numberWin ? "🎉 You Win!" : "💔 You Lose!") : "";
    const resultColor = userColor ? (colorWin ? "🎉 You Win!" : "💔 You Lose!") : "";

    // 💰 Calculate total win/loss
    let totalWin = 0;
    let totalLose = 0;

    if (userChoice) bigSmallWin ? totalWin += amount : totalLose += amount;
    if (userNumber !== undefined) numberWin ? totalWin += amount : totalLose += amount;
    if (userColor) colorWin ? totalWin += amount : totalLose += amount;

    user.betAmount = user.betAmount + totalWin - totalLose;
    await user.save();

    // Save game round
    const gameData = new GameData({
      period: Date.now().toString(),
      userChoiceBigSmall: userChoice,
      randomChoiceBigSmall: actualRandomChoice,
      resultBigSmall,
      userChoiceNumber: userNumber,
      randomChoiceNumber: randomNumber,
      resultNumber,
      userChoiceColor: userColor,
      randomChoiceColor: randomColor,
      resultColor,
    });

    await gameData.save();

    res.json({
      period: gameData.period,
      newBalance: user.betAmount,
      bigSmallResult: {
        userChoice,
        randomChoice: actualRandomChoice,
        result: resultBigSmall,
      },
      numberResult: {
        userChoice: userNumber,
        randomChoice: randomNumber,
        result: resultNumber,
      },
      colorResult: {
        userChoice: userColor,
        randomChoice: randomColor,
        result: resultColor,
      },
    });
  } catch (error) {
    console.error("Error in /play:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/history", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const totalResults = await GameData.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    const history = await GameData.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("period randomChoiceNumber randomChoiceBigSmall randomChoiceColor");

    res.json({
      history,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

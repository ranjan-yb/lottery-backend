const express = require("express");
const router = express.Router();
const GameData = require("../models/user");
const verifyToken = require('../middleware/verifyToken')
const User = require('../models/user')
const verifyApiKey = require('../models/apikey')

router.post("/play",verifyApiKey, verifyToken,  async (req, res) => {
  const userId = req.user.id; // from verifyToken middleware

  const {
    userChoice,         // "Big" or "Small"
    amount,             // bet for big/small
    userColor,          // "Red", "Green", "Purple"
    colorAmount,        // bet for color
    userNumber,         // number (0-9)
    numberAmount        // bet for number
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const totalBet =
      (amount || 0) + (colorAmount || 0) + (numberAmount || 0);

    if (totalBet === 0) return res.status(400).json({ msg: "No bets placed" });

    if (user.wallet < totalBet) {
      return res.status(400).json({ msg: "Insufficient wallet balance" });
    }

    // Deduct bet amount first
    user.wallet -= totalBet;

    // 🎲 Generate Results
    const randomChoiceNumber = Math.floor(Math.random() * 10); // 0-9
    const randomChoiceBigSmall = randomChoiceNumber >= 5 ? "Big" : "Small";
    const colors = ["Red", "Green", "Purple"];
    const randomChoiceColor = colors[Math.floor(Math.random() * 3)];

    let winAmount = 0;

    // ✅ Big/Small result
    let bigSmallResult = { result: "Lose", win: 0 };
    if (userChoice && amount) {
      if (userChoice === randomChoiceBigSmall) {
        bigSmallResult.result = "Win";
        bigSmallResult.win = amount * 2; // 2x payout
        winAmount += bigSmallResult.win;
      }
    }

    // ✅ Color result
    let colorResult = { result: "Lose", win: 0 };
    if (userColor && colorAmount) {
      if (userColor === randomChoiceColor) {
        colorResult.result = "Win";
        colorResult.win = colorAmount * 3; // 3x payout
        winAmount += colorResult.win;
      }
    }

    // ✅ Number result
    let numberResult = { result: "Lose", win: 0 };
    if (
      typeof userNumber === "number" &&
      !isNaN(userNumber) &&
      numberAmount
    ) {
      if (userNumber === randomChoiceNumber) {
        numberResult.result = "Win";
        numberResult.win = numberAmount * 10; // 10x payout
        winAmount += numberResult.win;
      }
    }

    // Update wallet with winnings
    user.wallet += winAmount;
    await user.save();

    // Save game record
    const newGame = await GameData.create({
      userId,
      userChoice,
      userChoiceAmount: amount,
      userColor,
      colorAmount,
      userNumber,
      numberAmount,
      randomChoiceNumber,
      randomChoiceColor,
      randomChoiceBigSmall,
      winAmount,
      result: winAmount > 0 ? "Win" : "Lose",
      period: new Date().getTime().toString(),
    });

    return res.status(200).json({
      message: "Game played successfully",
      result: winAmount > 0 ? "Win" : "Lose",
      winAmount,
      period: newGame.period,
      randomChoiceNumber,
      randomChoiceColor,
      randomChoiceBigSmall,
      bigSmallResult,
      colorResult,
      numberResult,
    });
  } catch (error) {
    console.error("Game play error:", error);
    res.status(500).json({ msg: "Internal server error" });
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

    res.status(200).json({
      history,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// TO TESTING API 
router.get("/ping", (req, res) => {
  res.send("pong");
});


module.exports = router;

const express = require("express");
const router = express.Router();
// const GameData = require("../models/user");
// const verifyToken = require("../middleware/verifyToken");
const User = require("../models/loginUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const NewUser = require("../models/newUser"); // ✅ or correct path to your user model

const GameData = require("../models/gameData");
const GameStats = require("../models/gameStats")
// const bigsmallAmountModel = require("../models/bigsmallAmount");

const verifyToken = require("../middleware/verifyToken");

const { getTimeLeft, getCurrentRound } = require("../controller/countdown");

// const verifyApiKey = require("../middleware/verifyApiKey");

// router.post("/play", verifyToken, async (req, res) => {
//   const userId = req.user.adminId; // 👈 Use this if token was signed with adminId
//   console.log("userId = ", userId);

//   // console.log("Full body received:", req.body);


//   const {
//     userBigSmall = null,
//     bigSmallAmount = 0,
//     userColor = null,
//     colorAmount = 0,
//     userNumber = null,
//     numberAmount = 0,
//   } = req.body;

//   console.log(
//     "user selections",
//     userBigSmall,
//     bigSmallAmount,
//     userColor,
//     colorAmount,
//     userNumber,
//     numberAmount
//   );

//   try {
//     if (!userId) {
//       console.log("❌ userId is missing");
//       return res.status(400).json({ msg: "Invalid token payload" });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // 🎲 Generate Results
//     const randomChoiceNumber = Math.floor(Math.random() * 10); // 0-9
//     const randomChoiceBigSmall = randomChoiceNumber >= 5 ? "Big" : "Small";
//     const colors = ["Red", "Green", "Purple"];
//     const randomChoiceColor = colors[Math.floor(Math.random() * 3)];

//     console.log("random generated color ", randomChoiceColor);

//     // Save game record
//     const newGame = await GameData.create({
//       userId,
//       userBigSmall,
//       bigSmallAmount,
//       userColor,
//       colorAmount,
//       userNumber,
//       numberAmount,
//       randomChoiceNumber,
//       randomChoiceColor,
//       randomChoiceBigSmall, // <-- COMMA was missing here
//       period: new Date().getTime().toString(),
//     });

//     return res.status(200).json({
//       message: "Game played successfully",
//       randomChoiceNumber,
//       randomChoiceColor,
//       randomChoiceBigSmall,
//       userBigSmall,
//       userColor,
//       userNumber
//     });
//   } catch (error) {
//     console.error("Game play error:", error);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

router.get("/history", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const totalResults = await GameData.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    const history = await GameData.find()
      .sort({ createdAt: -1 }) // ✅ sorts latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "period randomChoiceBigSmall randomChoiceColor randomChoiceNumber resultBigSmall resultColor resultNumber"
      );

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

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password required." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || "player", // default to "player"
    });

    // Optionally return a token immediately
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      msg: "User registered successfully.",
      token,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ msg: "Server error during registration." });
  }
});

router.post("/generate-dev-token", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const token = jwt.sign(
      { adminId: user._id }, // 👈 match your token payload structure
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Token generation error:", err.message);
    res.status(500).json({ msg: "Server error while generating token" });
  }
});



// LOGIN
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await NewUser.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({ token });
});


  // SEPERATE ROUTES FOR USERS

  router.post("/bet", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    userBigSmall,
    bigSmallAmount,
    userColor,
    colorAmount,
    userNumber,
    numberAmount,
  } = req.body;

  console.log("Bet received:", req.body);

  // Ensure at least one type of bet exists
  if (!userBigSmall && !userColor && !userNumber) {
    return res.status(400).json({ msg: "At least one bet is required." });
  }

  try {
    const user = await NewUser.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    let totalBet = 0;

    if (userBigSmall && bigSmallAmount) {
      totalBet += parseFloat(bigSmallAmount);
    }

    if (userColor && colorAmount) {
      totalBet += parseFloat(colorAmount);
    }

    if ((userNumber !== undefined && userNumber !== null) && numberAmount) {
      totalBet += parseFloat(numberAmount);
    }

    if (user.deposit < totalBet) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Deduct from wallet
    user.deposit -= totalBet;
    await user.save();

    // Save Big/Small bet (only if applicable)
    if (userBigSmall && bigSmallAmount) {
      await GameStats.updateOne(
        {},
        {
          $inc: {
            bigAmount: userBigSmall === "Big" ? parseFloat(bigSmallAmount) : 0,
            smallAmount: userBigSmall === "Small" ? parseFloat(bigSmallAmount) : 0,
          },
          $push: { userbigsmallCount: userBigSmall },
        },
        { upsert: true }
      );
    }

    // TODO: Add similar updates for Color and Number bets (use separate pools/collections)

    return res.status(200).json({
      msg: "Bet placed successfully",
      totalDeducted: totalBet,
      remainingWallet: user.deposit,
    });
  } catch (err) {
    console.error("Bet route error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});



// router.post("/play", verifyToken, async (req, res) => {
//   const userId = req.user.id;
//   const {
//     last5Sec,
//     userBigSmall,
//     bigSmallAmount,
//     userColor,
//     colorAmount,
//     userNumber,
//     numberAmount,
//   } = req.body;

//   if (!last5Sec) {
//     return res.status(400).json({ msg: "Only allowed during result phase" });
//   }

//   try {
//     const user = await NewUser.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const gameData = await bigsmallAmountModel.findOne();
//     if (!gameData) return res.status(400).json({ msg: "Game data not found" });

//     const { bigAmount = 0, smallAmount = 0, userbigsmallCount = [] } = gameData;

//     // console.log(" userbigSmallCount length = ", userbigsmallCount.length)

//     let winner;
//     if (userbigsmallCount.length > 1) {
//       winner =
//         bigAmount > smallAmount
//           ? "Small"
//           : bigAmount < smallAmount
//           ? "Big"
//           : Math.random() < 0.5
//           ? "Big"
//           : "Small";
//     } else {
//       winner = Math.random() < 0.5 ? "Big" : "Small";

//       // console.log(" random choice from backend = ", winner)
//     }

//     // Random color & number
//     const colors = ["Red", "Green", "Purple"];
//     const randomChoiceColor = colors[Math.floor(Math.random() * colors.length)];
//     const randomChoiceNumber = Math.floor(Math.random() * 10);

//     // Reward logic
//     let winAmount = 0;
//     if (userBigSmall === winner && parseFloat(bigSmallAmount) > 0) {
//       winAmount = parseFloat(bigSmallAmount) * 2;
//       user.deposit += winAmount;
//     }

//     await user.save();

//     // Save to GameData
//     await new gameData({
//       period: new Date().getTime().toString(),
//       randomChoiceBigSmall: winner,
//       randomChoiceColor,
//       randomChoiceNumber,
//     }).save();

//     return res.status(200).json({
//       result: userBigSmall === winner ? "Win" : "Lose",
//       winnerBigSmall: winner,
//       randomChoiceColor,
//       randomChoiceNumber,
//     });
//   } catch (err) {
//     console.error("Play route error:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });




// UPDATED /play route by Prince
router.post("/play", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    last5Sec,
    userBigSmall,
    bigSmallAmount,
    userColor,
    colorAmount,
    userNumber,
    numberAmount,
  } = req.body;

  if (!last5Sec) {
    return res.status(400).json({ msg: "Only allowed during result phase" });
  }

  try {
    const user = await NewUser.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const gameData = await GameStats.findOne();
    if (!gameData) return res.status(400).json({ msg: "Game data not found" });

    // ===== BIG-SMALL WINNER =====
    const { bigAmount = 0, smallAmount = 0, userbigsmallCount = [] } = gameData;
    let winnerBigSmall;

    if (userbigsmallCount.length > 1) {
      winnerBigSmall =
        bigAmount > smallAmount
          ? "Small"
          : bigAmount < smallAmount
          ? "Big"
          : Math.random() < 0.5
          ? "Big"
          : "Small";
    } else {
      winnerBigSmall = Math.random() < 0.5 ? "Big" : "Small";
    }

    // ===== COLOR WINNER =====
    const { colorRedAmount = 0, colorGreenAmount = 0, colorPurpleAmount = 0, colorCount = [] } = gameData;

    let winnerColor;
    if (colorCount.length > 1) {
      const colorBets = {
        Red: colorRedAmount,
        Green: colorGreenAmount,
        Purple: colorPurpleAmount,
      };

      const sortedColors = Object.entries(colorBets).sort((a, b) => a[1] - b[1]);
      const [lowestColor, lowestAmt] = sortedColors[0];
      const secondAmt = sortedColors[1][1];

      winnerColor =
        lowestAmt < secondAmt
          ? lowestColor
          : colors[Math.floor(Math.random() * colors.length)];
    } else {
      const colors = ["Red", "Green", "Purple"];
      winnerColor = colors[Math.floor(Math.random() * colors.length)];
    }

    // ===== NUMBER WINNER =====
    const { numberCount = [] } = gameData;

    let winnerNumber;
    if (numberCount.length > 1) {
      let numberBets = [];

      for (let i = 0; i <= 9; i++) {
        numberBets.push({ number: i, amount: gameData[`number${i}Amount`] || 0 });
      }

      numberBets.sort((a, b) => a.amount - b.amount);

      if (numberBets[0].amount < numberBets[1].amount) {
        winnerNumber = numberBets[0].number;
      } else {
        winnerNumber = Math.floor(Math.random() * 10);
      }
    } else {
      winnerNumber = Math.floor(Math.random() * 10);
    }

    // ===== REWARD LOGIC =====
    let winAmount = 0;

    // Big/Small reward
    if (userBigSmall === winnerBigSmall && parseFloat(bigSmallAmount) > 0) {
      winAmount += parseFloat(bigSmallAmount) * 2;
    }

    // Color reward
    if (userColor === winnerColor && parseFloat(colorAmount) > 0) {
      winAmount += parseFloat(colorAmount) * 3;
    }

    // Number reward
    if (parseInt(userNumber) === winnerNumber && parseFloat(numberAmount) > 0) {
      winAmount += parseFloat(numberAmount) * 10;
    }

    if (winAmount > 0) {
      user.deposit += winAmount;
      await user.save();
    }

    // Save final result to GameData collection
    await new GameData({
      period: new Date().getTime().toString(),
      randomChoiceBigSmall: winnerBigSmall,
      randomChoiceColor: winnerColor,
      randomChoiceNumber: winnerNumber,
    }).save();

    return res.status(200).json({
      result: winAmount > 0 ? "Win" : "Lose",
      winnerBigSmall,
      winnerColor,
      winnerNumber,
    });
  } catch (err) {
    console.error("Play route error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});







/// RESET GAME FROM BACKEND
// 👇 New RESET rout

router.post("/reset", verifyToken, async (req, res) => {
  try {
    const gameData = await GameStats.findOne();
    if (!gameData) {
      return res.status(400).json({ msg: "Game state not found" });
    }

    gameData.bigAmount = 0;
    gameData.smallAmount = 0;
    gameData.userbigsmallCount = [];
    gameData.colorRedAmount = 0;
    gameData.colorGreenAmount = 0;
    gameData.colorPurpleAmount = 0;
    gameData.colorCount = [];
    gameData.number0Amount = 0;
    gameData.number1Amount = 0;
    gameData.number2Amount = 0;
    gameData.number3Amount = 0;
    gameData.number4Amount = 0;
    gameData.number5Amount = 0;
    gameData.number6Amount = 0;
    gameData.number7Amount = 0;
    gameData.number8Amount = 0;
    gameData.number9Amount = 0;
    gameData.numberCount = []



    await gameData.save();

    res.status(200).json({ msg: "Game reset successful" });
  } catch (err) {
    console.error("Reset route error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});


// COUNTDOWN
router.get("/time", (req, res) => {
  const result = getTimeLeft();
  res.json(result); // returns { timeLeft, isPaused }
});




module.exports = router;

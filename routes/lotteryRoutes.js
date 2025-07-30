const express = require("express");
const router = express.Router();
// const GameData = require("../models/user");
// const verifyToken = require("../middleware/verifyToken");
const User = require("../models/loginUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const NewUser = require("../models/newUser"); // ✅ or correct path to your user model

const GameData = require("../models/gameData");
const bigsmallAmount = require("../models/bigsmallAmount");
const HistorySave = require("../models/manuplatebigsmallResult");
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
  console.log("📥 History route hit!");
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const totalResults = await GameData.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    const history = await GameData.find()
      .sort({ createdAt: -1 }) // better to sort by time than _id
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


// router.post("/play", verifyToken, async (req, res) => {
//   const userId = req.user.id;
//   const {
//     userBigSmall,
//     bigSmallAmount,
//     userColor,
//     colorAmount,
//     userNumber,
//     numberAmount,
//     last5Sec,
//     last25Sec,
//   } = req.body;

//   // console.log("full body", req.body);
//   // console.log("last5Sec detected", last5Sec);

//   let winAmount = 0;

//   try {
//     const user = await NewUser.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const totalBet =
//       (bigSmallAmount || 0) + (colorAmount || 0) + (numberAmount || 0);
//     // if (totalBet === 0) return res.status(400).json({ msg: "No bets placed" });
//     if (user.deposit < totalBet)
//       return res.status(400).json({ msg: "Insufficient wallet balance" });

//     user.deposit -= totalBet; // ✅ Deduct bet immediately
//     // console.log("balance in wallet", user.deposit);

//     let bigSmallData = await bigsmallAmount.findOne();
//     if (!bigSmallData) {
//       bigSmallData = new bigsmallAmount({
//         bigAmount: 0,
//         smallAmount: 0,
//         userbigsmallCount: [],
//       });
//       await bigSmallData.save();
//       // console.log("⚠️ Created new bigSmallData document");
//     }

//     // ➕ Add to pool
//     if (userBigSmall === "Big")
//       bigSmallData.bigAmount += parseFloat(bigSmallAmount);
//     else if (userBigSmall === "Small")
//       bigSmallData.smallAmount += parseFloat(bigSmallAmount);

//     bigSmallData.userbigsmallCount.push(userBigSmall);
//     await bigSmallData.save();

//     // ✅ If it's the last 5 seconds, process result
//     if (last5Sec) {
//       let winner = null;

//       // Decide winner based on pool
//       if (bigSmallData.bigAmount > bigSmallData.smallAmount) {
//         winner = "Small";
//       } else if (bigSmallData.smallAmount > bigSmallData.bigAmount) {
//         winner = "Big";
//       }
//       // else if (bigSmallData.smallAmount === bigSmallData.bigAmount) {
//       //   winner = Math.random() < 0.5 ? "Big" : "Small";
//       //   console.log("⚖️ Equal  - randomly chosen winner:", winner);
//       // }

//       // // MANIPULATE FOR MORE THAN TWO USERS
//       if (bigSmallData.userbigsmallCount.length >= 2) {
//         if (bigSmallData.bigAmount > bigSmallData.smallAmount) {
//           winner = "Small";
//         } else if (bigSmallData.smallAmount > bigSmallData.bigAmount) {
//           winner = "Big";
//         }
//       }

//       // else if (bigSmallAmount.smallAmount === bigSmallAmount.bigAmount) {
//       //     winner = Math.random() < 0.5 ? "Big" : "Small";
//       //     console.log("⚖️ Equal  - randomly chosen winner:", winner);
//       //   }
//       // }

//       // ✅ Always generate random color and number
//       winner = Math.random() < 0.5 ? "Big" : "Small";

//       // Assign winner to correct variable
//       const randomChoiceBigSmall = winner;

//       const colors = ["Red", "Green", "Purple"];
//       const randomChoiceColor =
//         colors[Math.floor(Math.random() * colors.length)];
//       const randomChoiceNumber = Math.floor(Math.random() * 10);

//       // ✅ Always save to GameData
//       const gameData = new GameData({
//         period: new Date().getTime().toString(), // or use custom generator
//         randomChoiceBigSmall: winner,
//         randomChoiceColor,
//         randomChoiceNumber,
//       });
//       await gameData.save();

//       // 🧠 Save result history (Only winning side, not individual user data)
//       const history = new HistorySave({
//         manuplateResultHistoryBigorSmall: winner,
//       });
//       await history.save();

//       // Reward if user matched Big/Small
//       if (userBigSmall === randomChoiceBigSmall && bigSmallAmount > 0) {
//         winAmount = parseFloat(bigSmallAmount) * 2;
//         user.deposit += winAmount;
//       }

//       // You can optionally handle rewards for color or number too, if needed

//       await user.save();

//       return res.status(200).json({
//         bigSmallResult: userBigSmall === randomChoiceBigSmall ? "Win" : "Lose",
//         colorResult: userColor === randomChoiceColor ? "Win" : "Lose",
//         numberResult: userNumber === randomChoiceNumber ? "Win" : "Lose",
//         randomChoiceBigSmall,
//         randomChoiceColor,
//         randomChoiceNumber,
//       });
//     }

//     // ⏱️ Reset data if 25 second window is closed
//     if (req.body.last25Sec === true) {
//       // console.log(" reste data", last25Sec);
//       bigSmallData.bigAmount = 0;
//       bigSmallData.smallAmount = 0;
//       bigSmallData.userbigsmallCount = [];
//       await bigSmallData.save();
//       return res.status(200).json({ msg: "Game reset for new round" });
//     }

//     return res.status(200).json({ msg: "Bet placed successfully" });
//   } catch (err) {
//     console.error("Play route error:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });


/// UPDATED BACKEND
router.post("/play", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    userBigSmall,
    bigSmallAmount,
    userColor,
    colorAmount,
    userNumber,
    numberAmount,
    last5Sec,
    last25Sec,
  } = req.body;

  let winAmount = 0;

  try {
    // 🛑 Skip if no user input at all (e.g. accidental empty request)
    const isEmpty =
      !userBigSmall && !userColor && !userNumber && !last5Sec && !last25Sec;
    if (isEmpty) return res.status(200).json({ msg: "No valid bet input." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const totalBet =
      (parseFloat(bigSmallAmount) || 0) +
      (parseFloat(colorAmount) || 0) +
      (parseFloat(numberAmount) || 0);

    if (user.deposit < totalBet) {
      return res.status(400).json({ msg: "Insufficient wallet balance" });
    }

    user.deposit -= totalBet;

    // ✅ Handle Big/Small update only if user selected it
    let bigSmallData;
    if (userBigSmall === "Big" || userBigSmall === "Small") {
      bigSmallData = await bigsmallAmount.findOneAndUpdate(
        {},
        {
          $inc: {
            bigAmount: userBigSmall === "Big" ? parseFloat(bigSmallAmount) : 0,
            smallAmount:
              userBigSmall === "Small" ? parseFloat(bigSmallAmount) : 0,
          },
          $push: { userbigsmallCount: userBigSmall },
        },
        { upsert: true, new: true }
      );
    } else {
      bigSmallData = await bigsmallAmount.findOne(); // needed for winner logic later
    }

    // ✅ Winner logic
    if (last5Sec && bigSmallData) {
      let winner = null;
      const {
        bigAmount = 0,
        smallAmount = 0,
        userbigsmallCount = [],
      } = bigSmallData;

      // Decide winner based on amount logic
      if (userbigsmallCount.length > 1) {
        if (bigAmount > smallAmount) winner = "Small";
        else if (smallAmount > bigAmount) winner = "Big";
        else winner = Math.random() < 0.5 ? "Big" : "Small";
        console.log("⚖️ Equal or mixed bets - Winner:", winner);
      } else if (userbigsmallCount.length === 1) {
        // Only 1 user played → random winner
        winner = Math.random() < 0.5 ? "Big" : "Small";
        console.log("🎲 Only 1 user bet - Random winner:", winner);
      } else {
        // No one bet, pick random
        winner = Math.random() < 0.5 ? "Big" : "Small";
      }

      // Generate random values
      const colors = ["Red", "Green", "Purple"];
      const randomChoiceColor =
        colors[Math.floor(Math.random() * colors.length)];
      const randomChoiceNumber = Math.floor(Math.random() * 10);

      // Save game result
      const gameData = new GameData({
        period: new Date().getTime().toString(),
        randomChoiceBigSmall: winner,
        randomChoiceColor,
        randomChoiceNumber,
      });
      await gameData.save();

      // Save to history
      const history = new HistorySave({
        manuplateResultHistoryBigorSmall: winner,
      });
      await history.save();

      // Reward for Big/Small
      if (userBigSmall === winner && parseFloat(bigSmallAmount) > 0) {
        winAmount = parseFloat(bigSmallAmount) * 2;
        user.deposit += winAmount;
      }

      // Future: Handle color / number rewards here...

      await user.save();

      return res.status(200).json({
        bigSmallResult: userBigSmall === winner ? "Win" : "Lose",
        colorResult: userColor === randomChoiceColor ? "Win" : "Lose",
        numberResult: userNumber === randomChoiceNumber ? "Win" : "Lose",
        randomChoiceBigSmall: winner,
        randomChoiceColor,
        randomChoiceNumber,
      });
    }

    // ⏱️ Reset for new round (at 25s)
    if (last25Sec) {
      await bigsmallAmount.updateOne(
        {},
        {
          $set: {
            bigAmount: 0,
            smallAmount: 0,
            userbigsmallCount: [],
          },
        }
      );
      return res.status(200).json({ msg: "Game reset for new round" });
    }

    await user.save();
    return res.status(200).json({ msg: "Bet placed successfully" });
  } catch (err) {
    console.error("Play route error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});



/// RESET GAME FROM BACKEND
// 👇 New RESET route
router.post("/reset", verifyToken, async (req, res) => {
  try {
    const bigSmallData = await bigsmallAmount.findOne();
    if (!bigSmallData) {
      return res.status(400).json({ msg: "Game state not found" });
    }

    bigSmallData.bigAmount = 0;
    bigSmallData.smallAmount = 0;
    bigSmallData.userbigsmallCount = [];

    await bigSmallData.save();

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

const express = require("express");
const router = express.Router();
const GameData = require("../models/user");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/loginUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const verifyApiKey = require("../middleware/verifyApiKey");

router.post("/play", verifyToken, async (req, res) => {
  const userId = req.user.adminId; // 👈 Use this if token was signed with adminId
  console.log("userId = ", userId);
  console.log("Decoded token:", req.user);

  const {
    userBigSmall, // "Big" or "Small"
    bigSmallAmount, // bet for big/small
    userColor, // "Red", "Green", "Purple"
    colorAmount, // bet for color
    userNumber, // number (0-9)
    numberAmount, // bet for number
  } = req.body;

  console.log(
    "user selections",
    userBigSmall,
    bigSmallAmount,
    userColor,
    colorAmount,
    userNumber,
    numberAmount
  );

  try {
    if (!userId) {
      console.log("❌ userId is missing");
      return res.status(400).json({ msg: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🎲 Generate Results
    const randomChoiceNumber = Math.floor(Math.random() * 10); // 0-9
    const randomChoiceBigSmall = randomChoiceNumber >= 5 ? "Big" : "Small";
    const colors = ["Red", "Green", "Purple"];
    const randomChoiceColor = colors[Math.floor(Math.random() * 3)];

    console.log("random generated color ", randomChoiceColor);

    // Save game record
    const newGame = await GameData.create({
      userId,
      userBigSmall,
      bigSmallAmount,
      userColor,
      colorAmount,
      userNumber,
      numberAmount,
      randomChoiceNumber,
      randomChoiceColor,
      randomChoiceBigSmall, // <-- COMMA was missing here
      period: new Date().getTime().toString(),
    });

    return res.status(200).json({
      message: "Game played successfully",
      randomChoiceNumber,
      randomChoiceColor,
      randomChoiceBigSmall,
    });
  } catch (error) {
    console.error("Game play error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.get("/history", async (req, res) => {
  console.log("📥 History route hit!");
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  try {
    const totalResults = await GameData.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    const history = await GameData.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "period randomChoiceNumber randomChoiceBigSmall randomChoiceColor"
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
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

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


module.exports = router;

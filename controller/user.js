const NewUser = require("../models/newUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// WALLET SECTION
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Correct token field

    const currentUser = await NewUser.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ deposit: currentUser.deposit || 0 }); // ✅ only return deposit

  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Access denied" });
  }
};


// deposit amount
exports.depositAmount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deposit } = req.body;

    if (!deposit || deposit <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.deposit = (user.deposit || 0) + Number(deposit);
    await user.save();

    res.status(200).json({
      message: "Deposit successful",
      deposit: user.deposit
    });
  } catch (err) {
    console.error("Deposit Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
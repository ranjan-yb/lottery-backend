const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AdminUser = require("../models/adminUser");

const router = express.Router();

// Create a default admin manually (once)
router.post("/create-admin", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const admin = new AdminUser({ username, password: hashed });
  await admin.save();
  res.send("Admin created");
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await AdminUser.findOne({ username });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ adminId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
});

module.exports = router;

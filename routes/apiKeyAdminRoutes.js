const express = require("express");
const router = express.Router();
const ApiKey = require("../models/apikey");
const verifyAdminToken = require("../middleware/verifyAdminToken");



// // Get all API keys (admin only)
router.get("/keys", verifyAdminToken, async (req, res) => {
  const keys = await ApiKey.find().select("-__v");
  res.json(keys);
});

// Create new API key (admin only)
router.post("/keys", verifyAdminToken, async (req, res) => {
  const crypto = require("crypto");
  const { ownerName, usageLimit = 5000 } = req.body;

  const newKey = new ApiKey({
    key: crypto.randomBytes(24).toString("hex"),
    ownerName,
    usageLimit,
  });

  await newKey.save();
  res.json({ message: "API Key created", key: newKey.key });
});

// Activate/deactivate API key
router.patch("/keys/:id/toggle", verifyAdminToken, async (req, res) => {
  const key = await ApiKey.findById(req.params.id);
  if (!key) return res.status(404).json({ error: "API key not found" });

  key.isActive = !key.isActive;
  await key.save();

  res.json({ message: `API key ${key.isActive ? "activated" : "deactivated"}` });
});

// Delete API key
router.delete("/keys/:id", verifyAdminToken, async (req, res) => {
  await ApiKey.findByIdAndDelete(req.params.id);
  res.json({ message: "API key deleted" });
});


module.exports = router;

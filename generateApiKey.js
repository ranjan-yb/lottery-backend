// generateApiKey.js
require("dotenv").config(); // <-- Load environment variables

const mongoose = require("mongoose");
const crypto = require("crypto");
const ApiKey = require("./models/apikey");

// Use same MongoDB URI as in server.js
const encodedUsername = encodeURIComponent(process.env.GAME_USER_NAME);
const encodedPassword = encodeURIComponent(process.env.GAME_PASS_WORD);
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@cluster0.kbtkfh8.mongodb.net/adminApi`;

mongoose.connect(uri);

const createKey = async () => {
  try {
    const key = crypto.randomBytes(24).toString("hex");

    const newKey = new ApiKey({
      key,
      ownerName: "Ranjan Oraon",
      usageLimit: 5000,
    });

    await newKey.save();
    console.log("✅ API Key Created:", key);
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error creating API key:", error);
    mongoose.disconnect();
  }
};

createKey();

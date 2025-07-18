const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 1000, // daily or monthly limit
  },
  requestsMade: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ApiKey", apiKeySchema);

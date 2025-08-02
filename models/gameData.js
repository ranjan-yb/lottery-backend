const mongoose = require('mongoose');

const gameDataSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true,
  },

  // ✅ Big/Small game
  userChoiceBigSmall: {
    type: String, // "Big" | "Small"
    enum: ["Big", "Small"],
  },
  randomChoiceBigSmall: {
    type: String,
    enum: ["Big", "Small"],
  },
  resultBigSmall: {
    type: String, // "Win", "Lose", or null
    enum: ["Win", "Lose"],
  },

  // ✅ Number game
  userChoiceNumber: {
    type: Number, // 0-9
    min: 0,
    max: 9,
  },
  randomChoiceNumber: {
    type: Number,
    min: 0,
    max: 9,
  },
  resultNumber: {
    type: String, // "Win", "Lose"
    enum: ["Win", "Lose"],
  },

  // ✅ Color game
  userChoiceColor: {
    type: String,
    enum: ["Red", "Green", "Purple"], // or whatever your colors are
  },
  randomChoiceColor: {
    type: String,
    enum: ["Red", "Green", "Purple"],
  },
  resultColor: {
    type: String,
    enum: ["Win", "Lose"],
  },
}, { timestamps: true });

module.exports = mongoose.model('GameData', gameDataSchema);

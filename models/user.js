const mongoose = require('mongoose');

const gameDataSchema = new mongoose.Schema({
  period: String,
  userChoiceBigSmall: String,
  randomChoiceBigSmall: String,
  resultBigSmall: String,
  userChoiceNumber: Number,  // New Field
  randomChoiceNumber: Number, // New Field
  resultNumber: String,  // New Field
  userChoiceColor: String,  // New Field
  randomChoiceColor: String, // New Field
  resultColor: String,  // New Field
}, { timestamps: true });

module.exports = mongoose.model('GameData', gameDataSchema);

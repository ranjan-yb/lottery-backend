const mongoose = require('mongoose');

const gameDataSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true,
  },

  // ✅ Big/Small game totals
  bigAmount: {
    type: Number,
    default: 0,
  },
  smallAmount: {
    type: Number,
    default: 0,
  },
  userBigSmallCount: {
    type: Array,
    default: [],
  },

  // ✅ Color game totals
  colorRedAmount: {
    type: Number,
    default: 0,
  },
  colorGreenAmount: {
    type: Number,
    default: 0,
  },
  colorPurpleAmount: {
    type: Number,
    default: 0,
  },
  colorCount: {
    type: Array,
    default: [],
  },

  // ✅ Number game totals
  number0Amount: { type: Number, default: 0 },
  number1Amount: { type: Number, default: 0 },
  number2Amount: { type: Number, default: 0 },
  number3Amount: { type: Number, default: 0 },
  number4Amount: { type: Number, default: 0 },
  number5Amount: { type: Number, default: 0 },
  number6Amount: { type: Number, default: 0 },
  number7Amount: { type: Number, default: 0 },
  number8Amount: { type: Number, default: 0 },
  number9Amount: { type: Number, default: 0 },
  numberCount: {
    type: Array,
    default: [],
  },

  // ✅ Final results (for all 3 games)
  randomChoiceBigSmall: {
    type: String,
    enum: ["Big", "Small"],
  },
  randomChoiceColor: {
    type: String,
    enum: ["Red", "Green", "Purple"],
  },
  randomChoiceNumber: {
    type: Number,
    min: 0,
    max: 9,
  },
}, { timestamps: true });

module.exports = mongoose.model('GameData', gameDataSchema);

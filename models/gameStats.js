const mongoose = require("mongoose");

const gameStatsSchema = new mongoose.Schema({
  // Big-Small amounts
  bigAmount: {
    type: Number,
    default: 0,
  },
  smallAmount: {
    type: Number,
    default: 0,
  },
  userbigsmallCount: {
    type: Array,
    default: [],
  },

  // Color amounts
  colorGreenAmount: {
    type: Number,
    default: 0,
  },
  colorPurpleAmount: {
    type: Number,
    default: 0,
  },
  colorRedAmount: {
    type: Number,
    default: 0,
  },
  colorCount: {
    type: Array,
    default: [],
  },

  // Number amounts (0 to 9)
  number0Amount: {
    type: Number,
    default: 0,
  },
  number1Amount: {
    type: Number,
    default: 0,
  },
  number2Amount: {
    type: Number,
    default: 0,
  },
  number3Amount: {
    type: Number,
    default: 0,
  },
  number4Amount: {
    type: Number,
    default: 0,
  },
  number5Amount: {
    type: Number,
    default: 0,
  },
  number6Amount: {
    type: Number,
    default: 0,
  },
  number7Amount: {
    type: Number,
    default: 0,
  },
  number8Amount: {
    type: Number,
    default: 0,
  },
  number9Amount: {
    type: Number,
    default: 0,
  },
  numberCount: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("GameStats", gameStatsSchema);

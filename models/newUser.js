const mongoose = require("mongoose");

const NewUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "super", "master", "agent", "user"],
    default: "user",
  },
  referralCode: { type: String, unique: true },
  referredBy: {
    type: String,
    required: function () {
      return this.role !== "admin";
    },
  },
  deposit: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NewUser", NewUserSchema);

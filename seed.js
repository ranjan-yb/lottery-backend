require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const NewUser = require("./models/newUser"); // adjust path if needed
const express = require("express");

const app = express();
const PORT = process.env.PORT || 1000;

const encodedUsername = encodeURIComponent(process.env.GAME_USER_NAME);
const encodedPassword = encodeURIComponent(process.env.GAME_PASS_WORD);

// ✅ Add DB name to the end of URI
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@cluster0.kbtkfh8.mongodb.net/`;

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ Connection failed:", err));

const seedUsers = async () => {
  // try {
  //   // await User.deleteMany(); // optional: clear existing users

  //   const users = [
  //     { username: "admin001", password: "adminpass", role: "admin" },
  //     { username: "player001", password: "playerpass", role: "player" },
  //     { username: "player002", password: "playerpass", role: "player" },
  //   ];

  //   for (let user of users) {
  //     const hashed = await bcrypt.hash(user.password, 10);
  //     user.password = hashed;
  //     await User.create(user);
  //   }

  //   console.log("✅ User seeding complete");
  //   mongoose.disconnect();
  // } catch (err) {
  //   console.error("❌ Seeding failed:", err.message);
  // }

  // Optional: clear existing entries
    // await NewUser.deleteMany({});

    const hashedPassword = await bcrypt.hash("test123", 10);

    const users = [
      {
        username: "ranjan",
        password: hashedPassword,
        role: "user",
        referralCode: "RANJAN123",
        referredBy: "admin",
        deposit: 1000,
      },
      {
        username: "prince",
        password: hashedPassword,
        role: "user",
        referralCode: "PRINCE123",
        referredBy: "ranjan",
        deposit: 500,
      },
      {
        username: "amandeep",
        password: hashedPassword,
        role: "user",
        referralCode: "AMAN123",
        referredBy: "prince",
        deposit: 250,
      },
    ];

    await NewUser.insertMany(users);
    console.log("✅ All users with role 'user' seeded successfully");
};

seedUsers();
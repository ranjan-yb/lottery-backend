require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const lotteryRoutes = require('./routes/lotteryRoutes')

const adminAuthRoutes = require("./routes/adminAuth");
const apiKeyAdminRoutes = require("./routes/apiKeyAdminRoutes");



const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.json());

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


  //Lottery Game Routes
app.use('/api/game', lotteryRoutes);

//ADMIN ROUTE
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", apiKeyAdminRoutes);
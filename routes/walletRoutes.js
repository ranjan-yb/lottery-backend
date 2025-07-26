const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

const verifyToken = require("../middleware/verifyToken")


// router.get("/wallet/deposit", verifyToken, userController.getUserDetails);   /// LATTER I'LL ADD
router.post("/wallet/deposit/amount", verifyToken, userController.depositAmount);



module.exports = router
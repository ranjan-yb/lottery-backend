const ApiKey = require("../models/apikey");

const verifyApiKey = async (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const keyData = await ApiKey.findOne({ key: apiKey });

    if (!keyData || !keyData.isActive) {
      return res.status(403).json({ error: "Invalid or inactive API key" });
    }

    // Optional: Add usage tracking / limit
    keyData.requestsMade += 1;

    if (keyData.requestsMade > keyData.usageLimit) {
      return res.status(429).json({ error: "API key usage limit exceeded" });
    }

    await keyData.save();

    req.apiClient = {
      key: keyData.key,
      owner: keyData.ownerName,
    };

    next();
    console.log("Middleware passed")
  } catch (err) {
    console.error("API key validation error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = verifyApiKey;

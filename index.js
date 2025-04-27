// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Just receive and respond without validation
app.post("/submit-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "No password received" });
  }

  console.log("Password received:", password);

  res.status(200).json({ message: "Password received successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

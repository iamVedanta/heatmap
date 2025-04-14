const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with try-catch block
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the application if the connection fails
  }
})();

// Schema definition for storing location data
const LocationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  intensity: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", LocationSchema);

// POST endpoint to receive location data
app.post("/api/location", async (req, res) => {
  const { latitude, longitude, intensity } = req.body;

  // Validation: Check if latitude and longitude are present
  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and Longitude are required" });
  }

  try {
    const newLocation = new Location({ latitude, longitude, intensity });
    await newLocation.save();
    res.status(201).json({ message: "Location saved successfully" });
  } catch (err) {
    console.error("Error saving location:", err.message);
    res
      .status(500)
      .json({ error: "Failed to save location, please try again later" });
  }
});

// GET endpoint to fetch all locations
app.get("/api/locations", async (req, res) => {
  try {
    const locations = await Location.find({}).sort({ timestamp: -1 }); // Sort by timestamp descending
    res.status(200).json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err.message);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

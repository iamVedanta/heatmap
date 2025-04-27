const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios"); // Import axios for making HTTP requests
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
})();

// ----------- Report Schema -----------

// Report Schema (without URL)
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [String],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  location_name: { type: String }, // New field for storing location name
  description: { type: String, required: true },
  intensity: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// ----------- Routes -----------

// POST - Submit a Report (without URL)
app.post("/api/reports", async (req, res) => {
  const { title, tags, description, location, intensity } = req.body;

  if (!title || !description || !location?.latitude || !location?.longitude) {
    return res.status(400).json({
      error:
        "Title, Description, and Location (latitude, longitude) are required",
    });
  }

  try {
    // Step 1: Get location name using the latitude and longitude
    const locationResponse = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
    );

    // Step 2: Extract the location name from the API response
    const locationName =
      locationResponse.data.display_name || "Unknown Location";

    // Step 3: Create a new report with the location name
    const newReport = new Report({
      title,
      tags,
      description,
      location,
      location_name: locationName, // Store the location name
      intensity,
    });

    // Save the report to the database
    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("Error submitting report:", err.message);
    res.status(500).json({ error: "Server error while submitting report" });
  }
});

// GET - Fetch all Reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ timestamp: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err.message);
    res.status(500).json({ error: "Server error while fetching reports" });
  }
});

// ----------- Start Server -----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

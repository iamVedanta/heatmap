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

// ----------- Source Review Schema -----------

// Source Review Schema (with URL)
const sourceReviewSchema = new mongoose.Schema({
  url: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  tags: [String],
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SourceReview = mongoose.model("SourceReview", sourceReviewSchema);

// ----------- Report Schema (Without URL) -----------

// Report Schema (without URL)
// Report Schema (without URL)
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [String],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  description: { type: String, required: true },
  intensity: { type: Number, default: 0 }, // ✅ Added optional intensity field
  timestamp: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// ----------- Routes -----------

// POST - Submit a Source Review (with URL)
app.post("/api/source-reviews", async (req, res) => {
  const { url, location, tags, description } = req.body;

  // Validate URL and Description
  if (!url || !description) {
    return res.status(400).json({ error: "URL and Description are required" });
  }

  try {
    const newSourceReview = new SourceReview({
      url,
      location,
      tags,
      description,
    });

    await newSourceReview.save();
    res.status(201).json({ message: "Source review submitted successfully" });
  } catch (err) {
    console.error("Error submitting source review:", err.message);
    res
      .status(500)
      .json({ error: "Server error while submitting source review" });
  }
});

// GET - Fetch all Source Reviews
app.get("/api/source-reviews", async (req, res) => {
  try {
    const sourceReviews = await SourceReview.find({}).sort({ timestamp: -1 });
    res.status(200).json(sourceReviews);
  } catch (err) {
    console.error("Error fetching source reviews:", err.message);
    res
      .status(500)
      .json({ error: "Server error while fetching source reviews" });
  }
});

// POST - Submit a Report (without URL)
app.post("/api/reports", async (req, res) => {
  const { title, tags, description, location } = req.body;

  // Validate Title, Description, and Location
  if (!title || !description || !location?.latitude || !location?.longitude) {
    return res.status(400).json({
      error:
        "Title, Description, and Location (latitude, longitude) are required",
    });
  }

  try {
    const newReport = new Report({
      title,
      tags,
      description,
      location,
    });

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

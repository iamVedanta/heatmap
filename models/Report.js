const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [String],
  description: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);

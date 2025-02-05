import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  url: { type: mongoose.Schema.Types.ObjectId, ref: "Url", required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  location: { type: String },
  os: { type: String },
  device: { type: String },
});

export default mongoose.model("Analytics", analyticsSchema);

import mongoose from "mongoose";
import validator from "validator";

const urlSchema = new mongoose.Schema(
  {
    longUrl: {
      type: String,
      required: true,
      validate: {
        validator: (v) => validator.isURL(v),
        message: "Invalid URL format",
      },
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    alias: {
      type: String,
      unique: true,
      index: true,
      validate: {
        validator: (v) => /^[\w\-]+$/.test(v),
        message: "Invalid alias format",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

const Url = mongoose.model("Url", urlSchema);

export default Url;

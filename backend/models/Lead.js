const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Lead email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Replied", "Not Interested", "Converted"],
      default: "New",
    },
    source: {
      type: String,
      enum: ["LinkedIn", "Cold Email", "Referral", "Website", "Event", "Other"],
      default: "Other",
    },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    nextFollowUp: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);

const mongoose = require("mongoose");

const sequenceSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stepNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["Email", "Call", "Follow-up", "LinkedIn", "Meeting"],
      required: [true, "Step type is required"],
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Skipped"],
      default: "Pending",
    },
    message: {
      type: String,
      default: "",
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    outcome: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

sequenceSchema.index({ leadId: 1, stepNumber: 1 });
sequenceSchema.index({ userId: 1, scheduledDate: 1, status: 1 });

module.exports = mongoose.model("Sequence", sequenceSchema);

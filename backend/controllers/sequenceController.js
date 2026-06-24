const Sequence = require("../models/Sequence");
const Lead = require("../models/Lead");

// @desc    Add follow-up step to a lead
// @route   POST /api/sequences
const createSequence = async (req, res) => {
  try {
    const { leadId, type, scheduledDate, message } = req.body;

    if (!leadId || !type || !scheduledDate) {
      return res.status(400).json({ message: "Lead, type and scheduled date are required" });
    }

    // Verify lead belongs to user
    const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Auto-assign step number
    const lastStep = await Sequence.findOne({ leadId }).sort({ stepNumber: -1 });
    const stepNumber = lastStep ? lastStep.stepNumber + 1 : 1;

    const sequence = await Sequence.create({
      leadId,
      userId: req.user._id,
      stepNumber,
      type,
      scheduledDate,
      message,
    });

    // Update lead's next follow-up date
    await Lead.findByIdAndUpdate(leadId, { nextFollowUp: scheduledDate });

    res.status(201).json({ success: true, sequence });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error creating follow-up" });
  }
};

// @desc    Get all sequences for a lead
// @route   GET /api/sequences/lead/:leadId
const getSequencesByLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.leadId, userId: req.user._id });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const sequences = await Sequence.find({ leadId: req.params.leadId }).sort({ stepNumber: 1 });

    res.json({ success: true, sequences });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sequences" });
  }
};

// @desc    Update sequence (mark complete/skip + outcome)
// @route   PUT /api/sequences/:id
const updateSequence = async (req, res) => {
  try {
    const sequence = await Sequence.findOne({ _id: req.params.id, userId: req.user._id });

    if (!sequence) {
      return res.status(404).json({ message: "Follow-up step not found" });
    }

    const { status, message, scheduledDate, outcome } = req.body;

    if (status) sequence.status = status;
    if (message !== undefined) sequence.message = message;
    if (scheduledDate) sequence.scheduledDate = scheduledDate;
    if (outcome !== undefined) sequence.outcome = outcome;

    if (status === "Completed") sequence.completedAt = new Date();

    await sequence.save();
    res.json({ success: true, sequence });
  } catch (error) {
    res.status(500).json({ message: "Server error updating follow-up" });
  }
};

// @desc    Delete a sequence step
// @route   DELETE /api/sequences/:id
const deleteSequence = async (req, res) => {
  try {
    const sequence = await Sequence.findOne({ _id: req.params.id, userId: req.user._id });

    if (!sequence) {
      return res.status(404).json({ message: "Follow-up step not found" });
    }

    await sequence.deleteOne();
    res.json({ success: true, message: "Follow-up step deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting follow-up" });
  }
};

// @desc    Get all upcoming follow-ups for user
// @route   GET /api/sequences/upcoming
const getUpcoming = async (req, res) => {
  try {
    const sequences = await Sequence.find({
      userId: req.user._id,
      status: "Pending",
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1 })
      .limit(10)
      .populate("leadId", "name company email");

    res.json({ success: true, sequences });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching upcoming follow-ups" });
  }
};

module.exports = { createSequence, getSequencesByLead, updateSequence, deleteSequence, getUpcoming };

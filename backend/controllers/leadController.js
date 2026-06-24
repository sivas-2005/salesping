const Lead = require("../models/Lead");
const Sequence = require("../models/Sequence");

// @desc    Create a new lead
// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const { name, email, company, phone, status, source, notes, priority, nextFollowUp } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const lead = await Lead.create({
      userId: req.user._id,
      name,
      email,
      company,
      phone,
      status,
      source,
      notes,
      priority,
      nextFollowUp,
    });

    res.status(201).json({ success: true, lead });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error creating lead" });
  }
};

// @desc    Get all leads for user (with filters)
// @route   GET /api/leads
const getLeads = async (req, res) => {
  try {
    const { status, source, priority, search, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== "All") query.status = status;
    if (source && source !== "All") query.source = source;
    if (priority && priority !== "All") query.priority = priority;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching leads" });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching lead" });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const allowedFields = ["name", "email", "company", "phone", "status", "source", "notes", "priority", "nextFollowUp"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save();
    res.json({ success: true, lead });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error updating lead" });
  }
};

// @desc    Delete lead (also deletes its sequences)
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user._id });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await Sequence.deleteMany({ leadId: lead._id });
    await lead.deleteOne();

    res.json({ success: true, message: "Lead and its follow-ups deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting lead" });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/leads/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const statusCounts = await Lead.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const sourceCounts = await Lead.aggregate([
      { $match: { userId } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    const totalLeads = await Lead.countDocuments({ userId });

    const pendingFollowUps = await Sequence.countDocuments({
      userId,
      status: "Pending",
      scheduledDate: { $lte: new Date() },
    });

    const recentLeads = await Lead.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name company status createdAt");

    res.json({
      success: true,
      stats: {
        totalLeads,
        pendingFollowUps,
        statusCounts,
        sourceCounts,
        recentLeads,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead, getStats };

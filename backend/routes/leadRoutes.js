const express = require("express");
const router = express.Router();
const { createLead, getLeads, getLead, updateLead, deleteLead, getStats } = require("../controllers/leadController");
const { protect } = require("../middleware/auth");

router.use(protect); // All lead routes are protected

router.get("/stats", getStats);
router.route("/").get(getLeads).post(createLead);
router.route("/:id").get(getLead).put(updateLead).delete(deleteLead);

module.exports = router;

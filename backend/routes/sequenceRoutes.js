const express = require("express");
const router = express.Router();
const { createSequence, getSequencesByLead, updateSequence, deleteSequence, getUpcoming } = require("../controllers/sequenceController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/upcoming", getUpcoming);
router.route("/").post(createSequence);
router.get("/lead/:leadId", getSequencesByLead);
router.route("/:id").put(updateSequence).delete(deleteSequence);

module.exports = router;

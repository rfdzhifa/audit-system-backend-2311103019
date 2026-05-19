const express = require("express")
const router = express.Router()
const authorize = require("../middleware/authorize")
const authMiddleware = require("../middleware/authMiddleware");

const {
  getAuditLogs,
  exportAuditLogs,
  getSuspiciousActivities
} = require("../controllers/suspiciousActivityControllers")

router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getSuspiciousActivities
)

module.exports = router
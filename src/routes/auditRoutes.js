const express = require("express")
const router = express.Router()
const authorize = require("../middleware/authorize")
const authMiddleware = require("../middleware/authMiddleware");

const {
  getAuditLogs,
  exportAuditLogs
} = require("../controllers/auditControllers")

router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getAuditLogs
)

router.get(
  "/export",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  exportAuditLogs
)

module.exports = router
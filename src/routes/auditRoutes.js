const express = require("express")
const router = express.Router()
const authorize = require("../middleware/authorize")
const authMiddleware = require("../middleware/authMiddleware");

const {
  getAuditLogs
} = require("../controllers/auditControllers")

router.get(
  "/",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getAuditLogs
)

module.exports = router
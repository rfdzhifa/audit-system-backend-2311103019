const express = require("express")
const router = express.Router()
const authorize = require("../middleware/authorize")
const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getRecentActivities,
  getSecuritySummary
} = require("../controllers/dashboardControllers")

router.get(
  "/stats",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getDashboardStats
)

router.get(
  "/recentActivities",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getRecentActivities
)

router.get(
  "/securitySum",
  authMiddleware,
  authorize("ADMIN", "AUDITOR"),
  getSecuritySummary
)

module.exports = router
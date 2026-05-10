const express = require("express")

const router = express.Router()

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  deleteComplaint
} = require("../controllers/complaintControllers")

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize")

const {
  validateComplaint
} = require("../validations/complaintValidation")

// USER
router.post(
  "/",
  authMiddleware,
  authorize("USER"),
  validateComplaint,
  createComplaint
)

router.get(
  "/my",
  authMiddleware,
  authorize("USER"),
  getMyComplaints
)

// ADMIN
router.get(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  getAllComplaints
)

router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  updateComplaint
)

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteComplaint
)

module.exports = router
const express = require("express")
const router = express.Router()
const authorize = require("../middleware/authorize")

const { 
    createUser,
    loginUser,
    getProfile,
    getAllUsers,
    updateMyProfile,
    updateUserByAdmin,
    deleteMyAccount,
    deleteUserByAdmin,
    logoutUser,
} = require("../controllers/userControllers")
const {
  registerValidation,
  loginValidation
} = require("../validations/authValidation")
const authMiddleware = require("../middleware/authMiddleware");

//PUBLIC
router.post("/login", loginValidation, loginUser)
router.post("/register", registerValidation, createUser);
router.post("/logout", authMiddleware, logoutUser);

//NEED AUTH
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.delete("/me", authMiddleware, deleteMyAccount);

//ADMIN
router.get("/admin/users", authMiddleware, authorize("ADMIN"), getAllUsers);
router.put("/admin/users/:id", authMiddleware, authorize("ADMIN"), updateUserByAdmin);
router.delete("/admin/users/:id", authMiddleware, authorize("ADMIN"), deleteUserByAdmin);

module.exports = router
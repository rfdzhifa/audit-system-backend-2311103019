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
} = require("../controllers/userControllers")
const authMiddleware = require("../middleware/authMiddleware");

//PUBLIC
router.post("/login", loginUser)

//NEED AUTH
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.delete("/me", authMiddleware, updateMyProfile);

//ADMIN
router.post("/admin/register", authMiddleware, authorize("ADMIN"), createUser);
router.get("/admin/users", authMiddleware, authorize("ADMIN"), getAllUsers);
router.put("/admin/users/:id", authMiddleware, authorize("ADMIN"), updateUserByAdmin);
router.delete("/admin/users/:id", authMiddleware, authorize("ADMIN"), deleteUserByAdmin);

module.exports = router
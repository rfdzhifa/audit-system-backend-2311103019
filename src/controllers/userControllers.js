//IMPORT
const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


//CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body; 
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }
    
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server.',
      error: error.message 
    });
  }
};

//GET ALL
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data users",
      error: error.message,
    });
  }
};


//UPDATE BY ADMIN
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const data = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });

    const { password: _, ...safeUser } = updatedUser;

    res.json({
      message: "User berhasil diupdate oleh admin",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error update user",
      error: error.message,
    });
  }
};

//UPDATE
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, password, role } = req.body;

    if (role) {
      return res.status(400).json({
        message: "Role tidak bisa diubah oleh user"
      });
    }

    const data = {};

    if (name) data.name = name;
    if (email) data.email = email;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...safeUser } = updatedUser;

    res.json({
      message: "Profile berhasil diupdate",
      user: safeUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal update profile",
      error: error.message,
    });
  }
};

//DELETE BY ADMIN
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUserId = parseInt(id);

    if (req.user.userId === targetUserId) {
      return res.status(400).json({
        message: "Admin tidak bisa menghapus akun sendiri"
      });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    res.json({
      message: "User berhasil dihapus oleh admin",
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(500).json({
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
};


//DELETE MY ACCOUNT
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "Akun berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus akun",
      error: error.message,
    });
  }
};

//LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server saat login",
      error: error.message,
    });
  }
};


//PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userId) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data profil" });
  }
};

module.exports = { 
    createUser,
    updateMyProfile,
    updateUserByAdmin,
    deleteMyAccount,
    deleteUserByAdmin,
    loginUser,
    getProfile,
    getAllUsers
}
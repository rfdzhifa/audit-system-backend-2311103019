//IMPORT
const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const createAuditLog = require("../utils/createAuditLog")
const createLoginAttempt = require("../utils/createLoginAttempt")
const detectSuspiciousActivity = require("../utils/detectSuspiciousActivity")

//CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // audit log
    await createAuditLog({
      userId: req.user?.id || null,

      action: "CREATE",

      entity: "USER",
      entityId: user.id,

      endpoint: req.originalUrl,
      method: req.method,

      newData: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },

      status: "SUCCESS",

      riskLevel: "MEDIUM",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.status(201).json(user)

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email sudah terdaftar.'
      })
    }

    res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
      error: error.message
    })
  }
}

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
    const { id } = req.params
    const { name, email, password, role } = req.body

    // ambil data lama
    const oldUser = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    const data = {}

    if (name) data.name = name
    if (email) data.email = email
    if (role) data.role = role

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id)
      },
      data,
    })

    // audit log
    await createAuditLog({
      userId: req.user.id,

      action: "UPDATE",

      entity: "USER",
      entityId: updatedUser.id,

      endpoint: req.originalUrl,
      method: req.method,

      oldData: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
        role: oldUser.role
      },

      newData: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },

      status: "SUCCESS",

      riskLevel: "HIGH",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    const { password: _, ...safeUser } = updatedUser

    res.json({
      message: "User berhasil diupdate oleh admin",
      user: safeUser,
    })

  } catch (error) {
    res.status(500).json({
      message: "Error update user",
      error: error.message,
    })
  }
}

//UPDATE
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, email, password, role } = req.body

    if (role) {
      return res.status(400).json({
        message: "Role tidak bisa diubah oleh user"
      })
    }

    // ambil data lama
    const oldUser = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const data = {}

    if (name) data.name = name
    if (email) data.email = email

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data,
    })

    // audit log
    await createAuditLog({
      userId: req.user.id,

      action: "UPDATE",

      entity: "USER",
      entityId: updatedUser.id,

      endpoint: req.originalUrl,
      method: req.method,

      oldData: {
        id: oldUser.id,
        name: oldUser.name,
        email: oldUser.email,
        role: oldUser.role
      },

      newData: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },

      status: "SUCCESS",

      riskLevel: "MEDIUM",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    const { password: _, ...safeUser } = updatedUser

    res.json({
      message: "Profile berhasil diupdate",
      user: safeUser,
    })

  } catch (error) {
    res.status(500).json({
      message: "Gagal update profile",
      error: error.message,
    })
  }
}

//DELETE BY ADMIN
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params

    const targetUserId = parseInt(id)

    // admin tidak boleh hapus dirinya sendiri
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        message: "Admin tidak bisa menghapus akun sendiri"
      })
    }

    // ambil data user sebelum dihapus
    const user = await prisma.user.findUnique({
      where: {
        id: targetUserId
      }
    })

    // delete user
    await prisma.user.delete({
      where: {
        id: targetUserId
      },
    })

    // audit log
    await createAuditLog({
      userId: req.user.id,

      action: "DELETE",

      entity: "USER",
      entityId: targetUserId,

      endpoint: req.originalUrl,
      method: req.method,

      oldData: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },

      status: "SUCCESS",

      riskLevel: "HIGH",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.json({
      message: "User berhasil dihapus oleh admin",
    })

  } catch (error) {

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "User tidak ditemukan"
      })
    }

    res.status(500).json({
      message: "Gagal menghapus user",
      error: error.message,
    })
  }
}


//DELETE MY ACCOUNT
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    })

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan atau sudah dihapus"
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date()
      }
    })

    await createAuditLog({
      userId,

      action: "SOFT_DELETE",
      entity: "USER",
      entityId: userId,

      endpoint: req.originalUrl,
      method: req.method,

      oldData: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },

      status: "SUCCESS",
      riskLevel: "MEDIUM",

      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"]
    })

    return res.json({
      message: "Akun berhasil dinonaktifkan"
    })

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error)

    return res.status(500).json({
      message: "Gagal menonaktifkan akun",
      error: error.message
    })
  }
}

//LOGIN
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    // =========================
    // USER TIDAK DITEMUKAN
    // =========================
    if (!user) {

      await createLoginAttempt({
        email,

        status: "FAILED",
        failureReason: "User tidak ditemukan",

        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      })

      // cek suspicious
      const suspiciousCheck = await detectSuspiciousActivity({
        email,
        ipAddress: req.ip
      })

      // kalau suspicious
      if (suspiciousCheck.suspicious) {

        const auditLog = await prisma.auditLog.create({
          data: {
            action: "LOGIN",

            endpoint: req.originalUrl,
            method: req.method,

            status: "FAILED",

            riskLevel: suspiciousCheck.severity,

            isSuspicious: true,

            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          }
        })

        await prisma.suspiciousActivity.create({
          data: {
            userId: null,

            auditLogId: auditLog.id,

            reason: suspiciousCheck.reason,

            severity: suspiciousCheck.severity
          }
        })
      }

      return res.status(404).json({
        message: "User tidak ditemukan"
      })
    }

    // =========================
    // PASSWORD CHECK
    // =========================
    const isMatch = await bcrypt.compare(password, user.password)

    // password salah
    if (!isMatch) {

      await createLoginAttempt({
        email,

        status: "FAILED",
        failureReason: "Password salah",

        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      })

      // cek suspicious
      const suspiciousCheck = await detectSuspiciousActivity({
        email
      })

      // kalau suspicious
      if (suspiciousCheck.suspicious) {

        const auditLog = await prisma.auditLog.create({
          data: {
            userId: user.id,

            action: "LOGIN",

            endpoint: req.originalUrl,
            method: req.method,

            status: "FAILED",

            riskLevel: suspiciousCheck.severity,

            isSuspicious: true,

            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          }
        })

        await prisma.suspiciousActivity.create({
          data: {
            userId: user.id,

            auditLogId: auditLog.id,

            reason: suspiciousCheck.reason,

            severity: suspiciousCheck.severity
          }
        })
      }

      return res.status(401).json({
        message: "Password salah"
      })
    }

    // =========================
    // LOGIN SUCCESS
    // =========================
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    // login attempt success
    await createLoginAttempt({
      email,

      status: "SUCCESS",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    // audit log login
    await createAuditLog({
      userId: user.id,

      action: "LOGIN",

      entity: "USER",
      entityId: user.id,

      endpoint: req.originalUrl,
      method: req.method,

      status: "SUCCESS",

      riskLevel: "LOW",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    return res.json({
      message: "Login berhasil",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {

    console.error("Login Error:", error)

    return res.status(500).json({
      message: "Terjadi kesalahan pada server saat login",
      error: error.message
    })
  }
}

//PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

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

//LOGUT
const logoutUser = async (req, res) => {
  try {

    // audit log logout
    await createAuditLog({
      userId: req.user.id,

      action: "LOGOUT",

      endpoint: req.originalUrl,
      method: req.method,

      entity: "USER",
      entityId: req.user.id,

      status: "SUCCESS",

      riskLevel: "LOW",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.status(200).json({
      success: true,
      message: "Logout berhasil"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { 
    createUser,
    updateMyProfile,
    updateUserByAdmin,
    deleteMyAccount,
    deleteUserByAdmin,
    loginUser,
    getProfile,
    getAllUsers,
    logoutUser
}
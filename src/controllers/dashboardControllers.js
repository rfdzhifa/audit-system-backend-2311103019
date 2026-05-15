const prisma = require("../config/prisma")
const createAuditLog = require("../utils/createAuditLog")

const getDashboardStats = async (req, res) => {
  try {

    const totalUsers = await prisma.user.count()

    const totalComplaints = await prisma.complaint.count()

    const totalAuditLogs = await prisma.auditLog.count()

    const totalSuspiciousActivities =
      await prisma.suspiciousActivity.count()

    const totalLoginAttempts =
      await prisma.loginAttempt.count()

    const loginSuccess =
      await prisma.loginAttempt.count({
        where: {
          status: "SUCCESS"
        }
      })

    const loginFailed =
      await prisma.loginAttempt.count({
        where: {
          status: "FAILED"
        }
      })

    const totalCreateActions =
      await prisma.auditLog.count({
        where: {
          action: "CREATE"
        }
      })

    const totalUpdateActions =
      await prisma.auditLog.count({
        where: {
          action: "UPDATE"
        }
      })

    const totalDeleteActions =
      await prisma.auditLog.count({
        where: {
          action: "DELETE"
        }
      })

    res.json({
      success: true,

      data: {
        totalUsers,
        totalComplaints,
        totalAuditLogs,
        totalSuspiciousActivities,
        totalLoginAttempts,

        loginSuccess,
        loginFailed,

        totalCreateActions,
        totalUpdateActions,
        totalDeleteActions
      }
    })

    await createAuditLog({
        userId: req.user.id,

        action: "READ",

        entity: "DASHBOARD",

        endpoint: req.originalUrl,
        method: req.method,

        status: "SUCCESS",

        riskLevel: "LOW",

        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getRecentActivities = async (req, res) => {
  try {

    const activities = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      },

      take: 10
    })

    res.json({
      success: true,
      data: activities
    })

    await createAuditLog({
        userId: req.user.id,

        action: "READ",

        entity: "DASHBOARD",

        endpoint: req.originalUrl,
        method: req.method,

        status: "SUCCESS",

        riskLevel: "LOW",

        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getSecuritySummary = async (req, res) => {
  try {

    const totalSuspicious =
      await prisma.suspiciousActivity.count()

    const failedLoginToday =
      await prisma.loginAttempt.count({
        where: {
          status: "FAILED",

          createdAt: {
            gte: new Date(
              new Date().setHours(0, 0, 0, 0)
            )
          }
        }
      })

    const highRiskLogs =
      await prisma.auditLog.count({
        where: {
          riskLevel: "HIGH"
        }
      })

    res.json({
      success: true,

      data: {
        totalSuspicious,
        failedLoginToday,
        highRiskLogs
      }
    })

    await createAuditLog({
        userId: req.user.id,

        action: "READ",

        entity: "DASHBOARD",

        endpoint: req.originalUrl,
        method: req.method,

        status: "SUCCESS",

        riskLevel: "LOW",

        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getSecuritySummary
}
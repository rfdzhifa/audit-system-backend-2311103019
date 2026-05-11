const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")

const getAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      riskLevel,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query

    const skip = (page - 1) * limit

    // FILTER DYNAMIC
    const where = {}

    if (userId) {
      where.userId = parseInt(userId)
    }

    if (action) {
      where.action = action
    }

    if (riskLevel) {
      where.riskLevel = riskLevel
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
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
      skip: Number(skip),
      take: Number(limit)
    })

    const total = await prisma.auditLog.count({ where })

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getAuditLogs
}
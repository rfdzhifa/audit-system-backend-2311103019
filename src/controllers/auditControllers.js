const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")
const { Parser } = require("json2csv")

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
      where.action = action.toUpperCase()
    }

    if (riskLevel) {
      where.riskLevel = riskLevel.toUpperCase()
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z")
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

const exportAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action, 
      riskLevel,
      startDate,
      endDate
    } = req.query

    //dynamic filter
    const where = {}

    if (userId) {
      where.userId = parseInt(userId)
    }

    if (action) {
      where.action = action.toUpperCase()
    }

    if (riskLevel) {
      where.riskLevel = riskLevel.toUpperCase()
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z")
      }
    }

    //get data audit logs
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
      }
    })

    //format data csv
    const formattedLogs = logs.map(log => ({
      id: log.id,

      userId: log.userId,
      userName: log.user?.name || "Unknown",
      userEmail: log.user?.email || "Unknown",
      userRole: log.user?.role || "Unknown",

      action: log.action,
      entity: log.entity,
      entityId:log.entitiyId,

      endpoint: log.endpoint,
      method: log.method,

      status: log.status,
      riskLevel: log.riskLevel,
      isSuspicious: log.isSuspicious,

      ipAddress: log.ipAddress,

      createdAt: log.createdAt
    }))

    //convert csv
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(formattedLogs)

    //response download file
    res.header("Content-Type", "text/csv")

    res.attachment("audit_logs.csv")

    return res.send(csv)
  } catch (error) {
    console.error("EXPORT AUDIT LOG ERROR: ". error)

    return res.status(500).json({
      success: false,
      message: "Gagal export audit logs",
      error: error.message
    })
  }
}

module.exports = {
  getAuditLogs,
  exportAuditLogs
}
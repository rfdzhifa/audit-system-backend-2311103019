const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")

const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  endpoint,
  method,
  oldData = null,
  newData = null,
  status,
  riskLevel = "LOW",
  isSuspicious = false,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        endpoint,
        method,
        oldData,
        newData,
        status,
        riskLevel,
        isSuspicious,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error("Audit Log Error:", error)
  }
}

module.exports = createAuditLog
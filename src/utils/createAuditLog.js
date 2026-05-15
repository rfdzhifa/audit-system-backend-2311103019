const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")
const UAParser = require("ua-parser-js")

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

    // parse user agent
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    // device info
    const deviceInfo = {
      os: `${result.os.name || "Unknown"} ${result.os.version || ""}`,
      browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`,
      deviceType: result.device.type || "desktop"
    }

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
        userAgent,

        deviceInfo
      }
    })

  } catch (error) {
    console.error("Audit Log Error:", error)
  }
}

module.exports = createAuditLog
const prisma = require("../config/prisma")
const UAParser = require("ua-parser-js")

const createLoginAttempt = async ({
  email,
  status,
  failureReason = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {

    // parse user-agent
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    const deviceInfo = {
      os: `${result.os.name || "Unknown"} ${result.os.version || ""}`,
      browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`,
      deviceType: result.device.type || "desktop"
    }

    await prisma.loginAttempt.create({
      data: {
        email,

        status,
        failureReason,

        ipAddress,
        userAgent,

        deviceInfo
      }
    })

  } catch (error) {
    console.error("Login Attempt Error:", error)
  }
}

module.exports = createLoginAttempt
const prisma = require("../config/prisma")

const detectSuspiciousActivity = async ({
  email
}) => {

  try {

    // hitung login gagal berdasarkan email
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        status: "FAILED",

        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000)
        }
      }
    })

    console.log("FAILED ATTEMPTS:", failedAttempts)

    // suspicious hanya sekali saat mencapai 5
    if (failedAttempts === 5) {

      return {
        suspicious: true,
        reason: "5 kali login gagal dalam 10 menit",
        severity: "HIGH"
      }
    }

    return {
      suspicious: false
    }

  } catch (error) {

    console.error("Suspicious Detection Error:", error)

    return {
      suspicious: false
    }
  }
}

module.exports = detectSuspiciousActivity
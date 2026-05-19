const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")

const getSuspiciousActivities = async (req, res) => {
  try {

    const suspiciousActivities =
      await prisma.suspiciousActivity.findMany({

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },

          auditLog: true
        },

        orderBy: {
          createdAt: "desc"
        }
      })

    res.status(200).json({
      success: true,
      data: suspiciousActivities
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getSuspiciousActivities
}
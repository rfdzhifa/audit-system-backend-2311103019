//IMPORT
const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")
const createAuditLog = require("../utils/createAuditLog")


const createComplaint = async (req, res) => {
  try {
    const { title, category, description } = req.body

    const ticketCode = `TCK-${Date.now()}`

    const complaint = await prisma.complaint.create({
      data: {
        ticketCode,
        title,
        category,
        description,
        userId: req.user.id
      }
    })

    //AUDIT LOG
    await createAuditLog({
      userId: req.user.id,
      action: "CREATE",
      entity: "COMPLAINT",
      entityId: complaint.id,

      endpoint: req.originalUrl,
      method: req.method,

      newData: complaint,

      status: "SUCCESS",

      riskLevel: "LOW",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.status(201).json({
      success: true,
      data: complaint
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.status(200).json({
      success: true,
      data: complaints
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.status(200).json({
      success: true,
      data: complaints
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params
    const { response, status } = req.body

    // get old data
    const oldComplaint = await prisma.complaint.findUnique({
      where: {
        id: Number(id)
      }
    })

    // update complaint
    const complaint = await prisma.complaint.update({
      where: {
        id: Number(id)
      },
      data: {
        response,
        status
      }
    })

    // audit log
    await createAuditLog({
      userId: req.user.id,

      action: "UPDATE",

      entity: "COMPLAINT",
      entityId: complaint.id,

      endpoint: req.originalUrl,
      method: req.method,

      oldData: oldComplaint,
      newData: complaint,

      status: "SUCCESS",

      riskLevel: "MEDIUM",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.status(200).json({
      success: true,
      data: complaint
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params

    // ambil data sebelum dihapus
    const complaint = await prisma.complaint.findUnique({
      where: {
        id: Number(id)
      }
    })

    // delete complaint
    await prisma.complaint.delete({
      where: {
        id: Number(id)
      }
    })

    // create audit log
    await createAuditLog({
      userId: req.user.id,

      action: "DELETE",

      entity: "COMPLAINT",
      entityId: Number(id),

      endpoint: req.originalUrl,
      method: req.method,

      oldData: complaint,

      status: "SUCCESS",

      riskLevel: "HIGH",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })

    res.status(200).json({
      success: true,
      message: "Complaint deleted"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  deleteComplaint
}
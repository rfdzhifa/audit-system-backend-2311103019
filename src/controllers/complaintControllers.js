//IMPORT
const prisma = require("../config/prisma")
const { Prisma } = require("@prisma/client")

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

    const complaint = await prisma.complaint.update({
      where: {
        id: Number(id)
      },
      data: {
        response,
        status
      }
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

    await prisma.complaint.delete({
      where: {
        id: Number(id)
      }
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
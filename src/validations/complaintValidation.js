const validateComplaint = (req, res, next) => {
  const { title, category, description } = req.body

  if (!title || !category || !description) {
    return res.status(400).json({
      success: false,
      message: "Title, category, dan description diperlukan"
    })
  }

  next()
}

module.exports = {
  validateComplaint
}
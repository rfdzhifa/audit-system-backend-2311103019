const registerValidation = (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, dan password wajib diisi"
    })
  }

  const emailRegex = /\S+@\S+\.\S+/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format email tidak valid"
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password minimal 8 karakter"
    })
  }

  next()
}

const loginValidation = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: "Email dan password wajib diisi"
    })
  }

  const emailRegex = /\S+@\S+\.\S+/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format email tidak valid"
    })
  }

  next()
}

module.exports = {
  registerValidation,
  loginValidation
}
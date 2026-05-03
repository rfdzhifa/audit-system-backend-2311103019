// src/app.js
require("dotenv").config()

const express = require("express")
const app = express()

// middleware global
app.use(express.json())

// IMPORT ROUTES
const userRoutes = require("./routes/userRoutes")

// REGISTER ROUTES
app.use("/api", userRoutes)

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
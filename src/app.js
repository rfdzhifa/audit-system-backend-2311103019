// src/app.js
require("dotenv").config()

const express = require("express")
const app = express()

// middleware global
app.use(express.json())

// IMPORT ROUTES
const userRoutes = require("./routes/userRoutes")
const complaintRoutes = require("./routes/complaintRoutes")
const auditLogs = require("./routes/auditRoutes")
const dashboard = require("./routes/dashboardRoutes")
const suspiciousActivities = require("./routes/suspiciousActivityRoutes")

// REGISTER ROUTES
app.use("/api", userRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/auditLogs", auditLogs)
app.use("/api/dashboard", dashboard)
app.use("/api/suspicious-activities", suspiciousActivities)

// test route
app.get("/", (req, res) => {
  res.send("API is running 🚀")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
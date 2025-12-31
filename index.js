require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5001

// --------------------
// MIDDLEWARE (CORS FIX)
// --------------------
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://bunai-from-hills.vercel.app",
    "https://bunai-from-hills-admin.vercel.app"
  ]

  const origin = req.headers.origin

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin") // ✅ prevents cache-related CORS bugs
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  )
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  next()
})

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// --------------------
// STATIC FILES
// --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// --------------------
// DATABASE
// --------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err)
    process.exit(1)
  })

// -------------------
// ROUTES
// -------------------
app.use("/api/contact", require("./routes/contact"))
app.use("/api/gallery", require("./routes/gallery"))
app.use("/api/blog", require("./routes/blog"))
app.use("/api/products", require("./routes/products"))
app.use("/api/orders", require("./routes/orders"))

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "Bunai From The Hills API is running!" })
})

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

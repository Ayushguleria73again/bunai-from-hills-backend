require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5001

// --------------------
// CORS CONFIG (VERCEL SAFE)
// --------------------
const allowedOrigins = [
  process.env.CLIENT_URL, // https://bunai-from-hills.vercel.app
  process.env.ADMIN_URL   // https://bunai-from-hills-admin.vercel.app
]

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, Postman, Vercel health checks
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}

// 🔥 IMPORTANT: CORS must be first
app.use(cors(corsOptions))

// 🔥 REQUIRED for Vercel preflight requests
app.options("*", cors(corsOptions))

// --------------------
// BODY PARSERS
// --------------------
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// --------------------
// STATIC FILES
// --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// --------------------
// DATABASE CONNECTION
// --------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// --------------------
// ROUTES
// --------------------
app.use("/api/contact", require("./routes/contact"))
app.use("/api/gallery", require("./routes/gallery"))
app.use("/api/blog", require("./routes/blog"))
app.use("/api/products", require("./routes/products"))
app.use("/api/orders", require("./routes/orders"))

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bunai From Hills API is running 🚀"
  })
})

// --------------------
// GLOBAL ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message)

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS Error: Origin not allowed"
    })
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  })
})

// --------------------
// START SERVER (LOCAL ONLY)
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()

// --------------------
// CORS CONFIG (VERCEL SAFE)
// --------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}

// ✅ MUST be first
app.use(cors(corsOptions))

// ✅ REQUIRED for preflight
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
// DATABASE (connect once)
// --------------------
let isConnected = false

async function connectDB() {
  if (isConnected) return
  await mongoose.connect(process.env.MONGODB_URI)
  isConnected = true
  console.log("✅ MongoDB connected")
}

app.use(async (req, res, next) => {
  await connectDB()
  next()
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
  res.json({ success: true, message: "Bunai From Hills API running 🚀" })
})

// --------------------
// EXPORT (🔥 THIS FIXES CORS)
// --------------------
module.exports = app

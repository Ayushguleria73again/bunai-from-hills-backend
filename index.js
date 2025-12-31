require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT

const allowedOrigin = [process.env.ADMIN_URL , process.env.CLIENT_URL]

// --------------------
// MIDDLEWARE
// --------------------
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
]

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server & Postman requests
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}))

// 🔥 REQUIRED for preflight on Vercel
app.options("*", cors())

// --------------------
// STATIC FILES
// --------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// --------------------
// DATABASE
// --------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err)
    process.exit(1)
  })

// -------------------
// ROUTES
// -------------------
app.use('/api/contact', require('./routes/contact'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bunai From The Hills API is running!" })
})

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

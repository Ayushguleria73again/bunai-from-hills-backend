require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*")

  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }

  next()
})

const PORT = process.env.PORT

// --------------------
// MIDDLEWARE
// --------------------
app.use(cors({
  origin: process.env.ADMIN_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: "10mb" })) // 🔥 REQUIRED
app.use(express.urlencoded({ extended: true }))

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
app.use('/api/contact', require('../routes/contact'))
app.use('/api/gallery', require('../routes/gallery'))
app.use('/api/blog', require('../routes/blog'))
app.use('/api/products', require('../routes/products'))
app.use('/api/orders', require('../routes/orders'))

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

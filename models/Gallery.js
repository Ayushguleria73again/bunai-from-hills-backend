const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image: { type: String }, // Path to uploaded image file
  imageUrl: { type: String }, // Public URL for the image
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Gallery', gallerySchema);
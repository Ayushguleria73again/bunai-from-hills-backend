const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

/* ================= MULTER (VERCEL SAFE) ================= */

const upload = multer({
  storage: multer.memoryStorage()
});

/* ================= GET ================= */

router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ error: "Error fetching gallery items" });
  }
});

/* ================= CREATE ================= */

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // 🔥 CLOUDINARY UPLOAD
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      { folder: 'gallery' }
    );

    const galleryItem = new Gallery({
      title,
      description,
      category,
      imageUrl: result.secure_url
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);

  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(400).json({ error: "Error creating gallery item" });
  }
});

/* ================= DELETE ================= */

router.delete('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ error: "Gallery item not found" });
    }
    res.json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ error: "Error deleting gallery item" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const multer = require('multer');
const path = require('path');

// Multer configuration for gallery image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ error: "Error fetching gallery items" });
  }
});

// Add a new gallery item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (req.file) {
      const galleryItem = new Gallery({
        title,
        description,
        image: req.file.path,
        imageUrl: `/uploads/${req.file.filename}`,
        category
      });

      await galleryItem.save();
      res.status(201).json(galleryItem);
    } else {
      return res.status(400).json({ error: "Image is required" });
    }
  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(400).json({ error: "Error creating gallery item" });
  }
});

// Delete a gallery item
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

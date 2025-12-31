const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

/* ================= MULTER (VERCEL SAFE) ================= */

const upload = multer({
  storage: multer.memoryStorage()
});

/* ================= GET ================= */

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Error fetching blog posts" });
  }
});

// Get all blog posts (admin)
router.get('/all', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Error fetching blog posts" });
  }
});

// Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Error fetching blog post" });
  }
});

/* ================= CREATE ================= */

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      tags,
      published
    } = req.body;

    // Parse tags safely
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    const blogData = {
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      tags: parsedTags,
      published: published === 'true'
    };

    // 🔥 CLOUDINARY UPLOAD
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'blogs' }
      );

      blogData.imageUrl = result.secure_url;
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(400).json({ error: "Error creating blog post" });
  }
});

/* ================= UPDATE ================= */

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      tags,
      published
    } = req.body;

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    const blogData = {
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      tags: parsedTags,
      published: published === 'true'
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'blogs' }
      );

      blogData.imageUrl = result.secure_url;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      blogData,
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(400).json({ error: "Error updating blog post" });
  }
});

/* ================= DELETE ================= */

router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Error deleting blog post" });
  }
});

module.exports = router;

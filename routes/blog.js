const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');

// Multer configuration for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

// Get all blog posts (for admin)
router.get('/all', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Error fetching blog posts" });
  }
});

// Get a single blog post by ID
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

// Create a new blog post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, author, category, readTime, tags, published } = req.body;
    
    // Parse tags if it's a string
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

    // If an image was uploaded, add the image path and URL to the blog data
    if (req.file) {
      blogData.image = req.file.path;
      blogData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(400).json({ error: "Error creating blog post" });
  }
});

// Update a blog post
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, author, category, readTime, tags, published } = req.body;
    
    // Parse tags if it's a string
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

    // If an image was uploaded, add the image path and URL to the blog data
    if (req.file) {
      blogData.image = req.file.path;
      blogData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, blogData, { new: true });
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(400).json({ error: "Error updating blog post" });
  }
});

// Delete a blog post
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
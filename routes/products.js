const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Multer configuration for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Error fetching product" });
  }
});

// Create a new product (admin only) with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // If an image was uploaded, add the image path and URL to the product data
    if (req.file) {
      productData.image = req.file.path;
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: "Error creating product" });
  }
});

// Update a product (admin only) with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // If an image was uploaded, update the image path and URL
    if (req.file) {
      productData.image = req.file.path;
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ error: "Error updating product" });
  }
});

// Delete a product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
});

module.exports = router;
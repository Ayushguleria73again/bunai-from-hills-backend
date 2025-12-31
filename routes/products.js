const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error fetching product" });
  }
});

// Create product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      inStock: req.body.inStock === 'true'
    };

    if (Number.isNaN(productData.price)) {
      return res.status(400).json({ error: "Invalid price" });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'products' }
      );
      productData.imageUrl = result.secure_url;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ error: "Error creating product" });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      inStock: req.body.inStock === 'true'
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'products' }
      );
      productData.imageUrl = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ error: "Error updating product" });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting product" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* ================= GET ================= */

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error fetching products" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error fetching product" });
  }
});

/* ================= CREATE ================= */

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      inStock: req.body.inStock === 'true'
    };

    if (!productData.title || !productData.description || Number.isNaN(productData.price)) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    if (req.file) {
      productData.image = req.file.path;
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ error: "Error creating product" });
  }
});

/* ================= UPDATE ================= */

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      inStock: req.body.inStock === 'true'
    };

    if (req.file) {
      productData.image = req.file.path;
      productData.imageUrl = `/uploads/${req.file.filename}`;
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

/* ================= DELETE ================= */

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting product" });
  }
});

module.exports = router;

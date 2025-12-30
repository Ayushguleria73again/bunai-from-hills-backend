const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  category: { 
    type: String, 
    required: true 
  },
  readTime: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String 
  },
  imageUrl: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  published: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
# Backend Structure

## Directory Structure
```
backend/
├── models/
│   ├── Contact.js      # Contact form model
│   ├── Product.js      # Product model
│   └── Order.js        # Order model
├── routes/
│   ├── contact.js      # Contact form routes
│   ├── products.js     # Product routes
│   ├── orders.js       # Order routes
│   └── gallery.js      # Gallery routes
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── index.js           # Main server file
├── package.json       # Dependencies and scripts
├── package-lock.json  # Dependency lock file
└── README.md          # Backend documentation
```

## Models
- **Contact**: Stores contact form submissions
- **Product**: Stores product information (with image upload capability)
- **Order**: Stores order information

## Routes
- **/api/contact**: Handles contact form submissions with email notifications
- **/api/products**: Handles product CRUD operations with image uploads
- **/api/orders**: Handles order processing with confirmation emails
- **/api/gallery**: Serves gallery items (same as products)

## Static Files
- **/uploads**: Serves uploaded product images

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASS`: App password for email account
- `CONTACT_EMAIL`: Email to receive contact form submissions
- `PORT`: Server port (default: 5000)
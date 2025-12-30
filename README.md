# Bunai From The Hills - Backend

This is the backend server for the Bunai From The Hills e-commerce application. It handles API requests for products, orders, and contact forms, with MongoDB for data storage and nodemailer for email notifications.

## Features

- RESTful API endpoints for products, orders, and contact forms
- MongoDB database integration
- Multer for image uploads
- Nodemailer for email notifications
- Contact form submissions with email alerts
- Order processing with confirmation emails
- Product management

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Database
MONGODB_URI=your_database_connection_string_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
CONTACT_EMAIL=contact@bunaifromhills.com

# Server
PORT=5000
```

3. Start the development server:
```bash
npm start
```

## API Endpoints

- `GET /` - Health check
- `GET /api/products` - Fetch all products
- `GET /api/gallery` - Fetch gallery items (same as products)
- `POST /api/contact` - Submit contact form
- `POST /api/orders` - Submit order

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (leave blank initially, you'll add manually)
- `EMAIL_USER` - Email address for sending notifications
- `EMAIL_PASS` - App password for the email account
- `CONTACT_EMAIL` - Email to receive contact form submissions
- `PORT` - Server port (default: 5000)

## Database Models

### Product
- title (String, required)
- description (String, required)
- price (Number, required)
- image (String)
- category (String)
- inStock (Boolean, default: true)

### Contact
- name (String, required)
- email (String, required)
- message (String, required)

### Order
- customerInfo (Object with fullName, email, phone, address, city, state, pincode)
- items (Array of products with id, title, price, quantity)
- totalAmount (Number, required)
- paymentMethod (String, required)
- orderStatus (String, default: "pending")

## Email Configuration

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app password (not your regular password)
3. Use the app password in the EMAIL_PASS field

## Frontend Integration

The frontend expects the backend to be running on port 5000. Update your frontend's `.env` file with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Production Deployment

When deploying to production:
1. Update the `MONGODB_URI` with your production database connection string
2. Configure your production email settings
3. Set the appropriate environment variables

## Development

The backend is organized with a modular structure:

- **Models** (`/models`): Contains Mongoose schemas for Contact, Product, and Order
- **Routes** (`/routes`): Contains route handlers for different API endpoints
- **Main Server** (`index.js`): Entry point that connects to database and sets up routes

To run the development server:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Documentation

### Contact Form
- `POST /api/contact`: Submit a contact form with name, email, and message

### Products
- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product (admin) - accepts image upload
- `PUT /api/products/:id`: Update a product (admin) - accepts optional image upload
- `DELETE /api/products/:id`: Delete a product (admin)

### Images
- Images are stored in the `uploads/` directory
- Access uploaded images at `/uploads/:filename`

### Orders
- `POST /api/orders`: Create a new order
- `GET /api/orders`: Get all orders (admin)
- `GET /api/orders/:id`: Get a specific order
- `PUT /api/orders/:id`: Update an order (admin)

### Gallery
- `GET /api/gallery`: Get all gallery items (same as products)
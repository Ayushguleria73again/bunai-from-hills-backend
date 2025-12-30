const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const nodemailer = require('nodemailer')

// --------------------
// EMAIL TRANSPORTER
// --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// --------------------
// CREATE ORDER
// --------------------
router.post('/', async (req, res) => {
  try {
    // 🔥 SAFETY GUARD
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No request body received",
      })
    }

    const orderData = req.body

    // --------------------
    // VALIDATION
    // --------------------
    if (!orderData.customerInfo || typeof orderData.customerInfo !== 'object') {
      return res.status(400).json({
        success: false,
        message: "customerInfo is required and must be an object",
      })
    }

    const requiredCustomerFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ]

    for (const field of requiredCustomerFields) {
      if (!orderData.customerInfo[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing customer field: ${field}`,
        })
      }
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      })
    }

    if (!orderData.totalAmount || !orderData.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "totalAmount and paymentMethod are required",
      })
    }

    // --------------------
    // SAVE ORDER
    // --------------------
    const order = new Order(orderData)
    await order.save()

    // --------------------
    // SEND EMAIL (OPTIONAL)
    // --------------------
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  await transporter.sendMail({
    from: `"Bunai From The Hills" <${process.env.EMAIL_USER}>`,
    to: orderData.customerInfo.email,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 0;
            background-color: #f5f1e5;
            color: #4a4a4a;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #75785b 0%, #5d5f48 100%);
            color: #e6ddc5;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: normal;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px;
          }
          .content h2 {
            color: #75785b;
            font-size: 22px;
            margin-top: 0;
          }
          .details {
            background-color: #f9f7ed;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-item {
            margin-bottom: 10px;
          }
          .detail-item strong {
            color: #75785b;
            display: inline-block;
            width: 130px;
          }
          .footer {
            background-color: #e6ddc5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #75785b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bunai From The Hills</h1>
          </div>

          <div class="content">
            <h2>Thank You for Your Order!</h2>

            <p>
              Hi <strong>${orderData.customerInfo.fullName}</strong>,
            </p>

            <p>
              We’re happy to let you know that your order has been successfully placed.
              Here are the details:
            </p>

            <div class="details">
              <div class="detail-item">
                <strong>Order ID:</strong> ${order._id}
              </div>
              <div class="detail-item">
                <strong>Total Amount:</strong> ₹${orderData.totalAmount}
              </div>
              <div class="detail-item">
                <strong>Payment Method:</strong> ${orderData.paymentMethod}
              </div>
              <div class="detail-item">
                <strong>Order Date:</strong> ${new Date().toLocaleString()}
              </div>
            </div>

            <p>
              Your handcrafted items are now being prepared with care 🧶  
              We’ll notify you as soon as your order is shipped.
            </p>

            <p style="margin-top: 30px;">
              Warm regards,<br/>
              <strong>Bunai From The Hills</strong>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Bunai From The Hills. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}


    // --------------------
    // RESPONSE
    // --------------------
    res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Order placed successfully",
    })

  } catch (error) {
    console.error("Order submission error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// --------------------
// GET ALL ORDERS (ADMIN)
// --------------------
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// --------------------
// GET SINGLE ORDER
// --------------------
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" })
  }
})

// --------------------
// UPDATE ORDER STATUS
// --------------------
router.put('/:id', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Validate that orderStatus is provided
    if (!orderStatus) {
      return res.status(400).json({ error: "orderStatus is required" });
    }
    
    // Only update the orderStatus field to avoid validation issues with required fields
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    res.status(400).json({ error: "Failed to update order" })
  }
})

module.exports = router

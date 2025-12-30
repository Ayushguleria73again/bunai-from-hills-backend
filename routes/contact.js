const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Nodemailer transporter for contact form
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact form endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Save to database
    const contact = new Contact({ name, email, message });
    await contact.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
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
              width: 80px;
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
              <h2>New Contact Form Submission</h2>
              <div class="details">
                <div class="detail-item"><strong>Name:</strong> ${name}</div>
                <div class="detail-item"><strong>Email:</strong> ${email}</div>
                <div class="detail-item"><strong>Message:</strong> ${message}</div>
              </div>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bunai From The Hills. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your request",
    });
  }
});

// Get all contact submissions (for admin panel)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Error fetching contacts" });
  }
});

// Admin reply to customer (for admin panel)
router.post('/reply', async (req, res) => {
  try {
    const { toEmail, subject, message } = req.body;
    
    // Validate input
    if (!toEmail || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }
    
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subject || `Reply from Bunai From The Hills`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reply from Bunai From The Hills</title>
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
            .message {
              background-color: #f9f7ed;
              border-left: 4px solid #75785b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
            }
            .footer {
              background-color: #e6ddc5;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #75785b;
            }
            .signature {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #d4cbb7;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bunai From The Hills</h1>
            </div>
            <div class="content">
              <h2>You have received a reply from Bunai From The Hills</h2>
              <div class="message">
                <p><strong>Message:</strong> ${message}</p>
              </div>
              <p>We appreciate your interest in our handcrafted products.</p>
              <p>If you have any more questions, feel free to reach out to us.</p>
              <div class="signature">
                <p>Warm regards,<br><strong>The Bunai From The Hills Team</strong></p>
              </div>
            </div>
            <div class="footer">
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p>© ${new Date().getFullYear()} Bunai From The Hills. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Admin reply error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reply",
    });
  }
});

module.exports = router;
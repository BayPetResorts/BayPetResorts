// Alternative server implementation using EMAIL instead of Google Sheets
// Use this if service account key creation is blocked by organization policy
// 
// To use this:
// 1. Rename this file to server.js (backup the original first)
// 2. Install nodemailer: npm install nodemailer
// 3. Configure email settings below or via environment variables

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email configuration
// Option 1: Use environment variables (recommended for production)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS  // Your app password (not regular password)
  }
};

// Option 2: For Gmail, you'll need an "App Password"
// - Go to Google Account > Security > 2-Step Verification > App passwords
// - Generate a password for "Mail"
// - Use that password in SMTP_PASS

let transporter;
if (emailConfig.auth.user && emailConfig.auth.pass) {
  transporter = nodemailer.createTransport(emailConfig);
  console.log('✅ Email integration enabled');
} else {
  console.log('⚠️  Email not configured. Form submissions will be logged to console only.');
  console.log('   Set SMTP_USER and SMTP_PASS environment variables to enable email.');
}

// API route for zip code search (example)
app.get('/api/locations', (req, res) => {
  const zipCode = req.query.zip;
  
  if (!zipCode || zipCode.length !== 5) {
    return res.status(400).json({ error: 'Invalid zip code' });
  }

  // Mock location data - replace with actual database/API call
  const mockLocations = [
    {
      id: 1,
      name: 'Bay Pet Resorts - Main Location',
      address: '123 Pet Care Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: zipCode,
      phone: '(908) 889-7387',
      distance: '2.5 miles'
    }
  ];

  res.json({ locations: mockLocations });
});

// API route for contact form submission (EMAIL VERSION)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, dogName, service, message, timestamp } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Format email content
    const emailSubject = `New Contact Form Submission - ${name}`;
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Timestamp:</strong> ${timestamp || new Date().toLocaleString()}</p>
      <hr>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Dog's Name:</strong> ${dogName || 'Not provided'}</p>
      <p><strong>Service Interested In:</strong> ${service || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No message provided'}</p>
    `;

    const emailText = `
New Contact Form Submission
Timestamp: ${timestamp || new Date().toLocaleString()}

Name: ${name}
Email: ${email}
Phone: ${phone}
Dog's Name: ${dogName || 'Not provided'}
Service Interested In: ${service || 'Not specified'}

Message:
${message || 'No message provided'}
    `;

    // Send email if configured
    if (transporter) {
      const recipientEmail = process.env.CONTACT_EMAIL || emailConfig.auth.user;
      
      await transporter.sendMail({
        from: `"Bay Pet Resorts Website" <${emailConfig.auth.user}>`,
        to: recipientEmail,
        replyTo: email, // So you can reply directly to the submitter
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });

      console.log(`✅ Contact form submission sent via email: ${email}`);
    } else {
      // Log to console if email not configured
      console.log('📧 Contact Form Submission (email not configured):', {
        name,
        email,
        phone,
        dogName,
        service,
        message,
        timestamp
      });
    }

    res.json({ 
      success: true, 
      message: 'Thank you for your submission! We\'ll be in touch soon.' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    res.status(500).json({ 
      error: 'An error occurred while processing your submission. Please try again later.' 
    });
  }
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bay Pet Resorts server running on http://localhost:${PORT}`);
  if (!transporter) {
    console.log('ℹ️  Email not configured. Form submissions will be logged to console only.');
    console.log('   See SETUP.md for instructions on setting up email integration.');
  }
});


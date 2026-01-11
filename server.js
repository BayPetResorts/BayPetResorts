require('dotenv').config();
const express = require('express');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup with OAuth 2.0
let sheets;
let oauth2Client;

// Check if using OAuth 2.0 (preferred) or Service Account
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  try {
    // OAuth 2.0 setup
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' 
        ? 'https://baypetresorts.com/oauth2callback' 
        : 'http://localhost:3000/oauth2callback')
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create sheets client
    sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    console.log('✅ Google Sheets integration enabled (OAuth 2.0)');
  } catch (error) {
    console.warn('⚠️  OAuth 2.0 credentials not properly configured:', error.message);
  }
} else if (process.env.GOOGLE_SHEETS_CREDENTIALS && process.env.GOOGLE_SHEET_ID) {
  try {
    // Fallback to Service Account (if available)
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets integration enabled (Service Account)');
  } catch (error) {
    console.warn('⚠️  Google Sheets credentials not properly configured:', error.message);
  }
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

// API route for contact form submission
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

    // If Google Sheets is configured, save to sheet
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (sheets && sheetId) {
      console.log(`📊 Attempting to save to Google Sheets (Sheet ID: ${sheetId.substring(0, 10)}...)`);
      const range = 'Sheet1!A:G'; // Adjust range based on your sheet structure

      // Refresh OAuth token if using OAuth 2.0
      if (oauth2Client) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);
        } catch (refreshError) {
          console.error('⚠️  Failed to refresh OAuth token:', refreshError.message);
          // Continue anyway - might still work with existing token
        }
      }

      // Check if headers exist, if not, add them
      try {
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Sheet1!A1:G1'
        });

        if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
          // Add headers
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1:G1',
            valueInputOption: 'RAW',
            resource: {
              values: [['Timestamp', 'Name', 'Email', 'Phone', 'Dog Name', 'Service', 'Message']]
            }
          });
        }
      } catch (headerError) {
        console.warn('Could not check/add headers:', headerError.message);
      }

      // Append the new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            timestamp || new Date().toISOString(),
            name,
            email,
            phone,
            dogName || '',
            service || '',
            message || ''
          ]]
        }
      });

      console.log(`✅ Contact form submission saved to Google Sheets: ${email}`);
    } else {
      // Log to console if Google Sheets is not configured
      console.log('📝 Contact Form Submission (not saved to Sheets):', {
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
    console.error('❌ Error processing contact form:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      statusText: error.statusText,
      errors: error.errors
    });
    
    // If it's a Google Sheets error, still return success to user
    // but log the error for debugging
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('⚠️  Could not connect to Google Sheets API. Check your credentials.');
    } else if (error.status === 403) {
      console.error('⚠️  Permission denied. Check that:');
      console.error('   1. Google Sheets API is enabled in your project');
      console.error('   2. The OAuth redirect URI matches: ' + (process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://baypetresorts.com/oauth2callback' : 'http://localhost:3000/oauth2callback')));
      console.error('   3. Your refresh token is valid');
    }

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
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? 'https://baypetresorts.com' 
    : `http://localhost:${PORT}`;
  console.log(`🚀 Bay Pet Resorts server running on ${serverUrl}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!sheets) {
    console.log('ℹ️  Google Sheets not configured. Form submissions will be logged to console only.');
    console.log('   See SETUP.md for instructions on setting up Google Sheets integration.');
  }
});


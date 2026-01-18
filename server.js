require('dotenv').config();
const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const { formatInTimeZone } = require('date-fns-tz');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve register page (before static middleware to ensure it's matched)
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve luxury boarding page
app.get('/luxury-boarding', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'luxury-boarding.html'));
});

// Serve doggie daycare page
app.get('/doggie-daycare', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'doggie-daycare.html'));
});

// Serve meet the owners page
app.get('/meet-the-owners', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meet-the-owners.html'));
});

// Serve contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Serve why we're better page
app.get('/why-we-are-better', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'why-we-are-better.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup with OAuth 2.0
let sheets;
let oauth2Client;

// Debug: Log which env vars are present (without revealing values)
console.log('🔍 Environment check:', {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ set' : '✗ missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ set' : '✗ missing',
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? '✓ set' : '✗ missing',
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? '✓ set' : '✗ missing',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'not set (will use default)'
});

// Check if using OAuth 2.0 (preferred) or Service Account
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' 
      ? 'https://baypetresorts.com/oauth2callback' 
      : 'http://localhost:3000/oauth2callback');
    
    console.log('🔗 Using redirect URI:', redirectUri);
    
    // OAuth 2.0 setup
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
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
}

// API route for contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { phone, firstName, lastName, email, dogName, breed, notes, services } = req.body;

    // Validate required fields
    if (!phone || !firstName || !lastName || !email || !dogName || !breed) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Vaccination files are optional - not storing files for now

    // If Google Sheets is configured, save to sheet
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (sheets && sheetId) {
      console.log(`📊 Attempting to save to Google Sheets (Sheet ID: ${sheetId.substring(0, 10)}...)`);
      // Use simple range without sheet name - defaults to first sheet
      const range = 'A:I'; // Timestamp, First Name, Last Name, Email, Phone, Dog Name, Breed, Notes, Services

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

      // Check if headers exist and are correct, update if needed
      try {
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A1:I1'
        });

        const expectedHeaders = ['Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 'Dog Name', 'Breed', 'Notes', 'Services'];
        const needsUpdate = !headerResponse.data.values || 
                           headerResponse.data.values.length === 0 || 
                           !headerResponse.data.values[0] ||
                           JSON.stringify(headerResponse.data.values[0]) !== JSON.stringify(expectedHeaders);

        if (needsUpdate) {
          // Update headers
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'A1:I1',
            valueInputOption: 'RAW',
            resource: {
              values: [expectedHeaders]
            }
          });
          
          // Format headers as bold
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
              requests: [{
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 9
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: {
                        bold: true
                      }
                    }
                  },
                  fields: 'userEnteredFormat.textFormat.bold'
                }
              }]
            }
          });
          
          console.log('✅ Updated Google Sheets headers to include Services column');
        }
      } catch (headerError) {
        console.warn('Could not check/add headers:', headerError.message);
      }

      // Generate PST timestamp
      const pstTimestamp = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd HH:mm:ss zzz');

      // Format services array as comma-separated string
      const servicesString = Array.isArray(services) && services.length > 0 
        ? services.join(', ') 
        : '';

      // Append the new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            pstTimestamp,
            firstName,
            lastName,
            email,
            phone,
            dogName,
            breed,
            notes || '',
            servicesString
          ]]
        }
      });

      console.log(`✅ Contact form submission saved to Google Sheets: ${email}`);
    } else {
      // Log to console if Google Sheets is not configured
      const pstTimestamp = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd HH:mm:ss zzz');
      const servicesString = Array.isArray(services) && services.length > 0 
        ? services.join(', ') 
        : '(none)';
      console.log('📝 Contact Form Submission (not saved to Sheets):', {
        firstName,
        lastName,
        email,
        phone,
        dogName,
        breed,
        notes: notes || '(none)',
        services: servicesString,
        timestamp: pstTimestamp
      });
    }

    res.json({ 
      success: true, 
      message: 'Thank you for your submission! We\'ll be in touch soon.' 
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error.message);
    
    // Log specific error types for debugging
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('⚠️  Could not connect to Google Sheets API.');
    } else if (error.status === 403 || error.status === 401) {
      console.error('⚠️  Google Sheets auth failed. Check OAuth credentials.');
    }

    // Log form data to console so it's not lost
    const { phone, firstName, lastName, email, dogName, breed, notes, services } = req.body;
    console.log('📝 Form submission (failed to save to Sheets):', {
      firstName, lastName, email, phone, dogName, breed,
      notes: notes || '(none)',
      services: Array.isArray(services) ? services.join(', ') : '(none)',
      timestamp: new Date().toISOString()
    });

    // Still return success to user - don't block registration due to logging issues
    res.json({ 
      success: true, 
      message: 'Thank you for your submission! We\'ll be in touch soon.' 
    });
  }
});

// Serve index.html for all other routes (SPA support)
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


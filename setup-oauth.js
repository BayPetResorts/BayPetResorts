/**
 * OAuth 2.0 Setup Script
 * 
 * This script helps you get the initial OAuth refresh token needed for Google Sheets access.
 * Run this once to set up OAuth, then use the refresh token in your .env file.
 * 
 * Usage:
 * 1. Complete OAuth consent screen in Google Cloud Console
 * 2. Create OAuth client ID credentials
 * 3. Set environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * 4. Run: node setup-oauth.js
 * 5. Follow the prompts to authorize and get refresh token
 */

const { google } = require('googleapis');
const readline = require('readline');
const http = require('http');
const url = require('url');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const PORT = 3001; // Different port to avoid conflicts

// Get credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables');
  console.log('\nExample:');
  console.log('  export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"');
  console.log('  export GOOGLE_CLIENT_SECRET="your-client-secret"');
  console.log('  node setup-oauth.js');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Required to get refresh token
  scope: SCOPES,
  prompt: 'consent' // Force consent screen to get refresh token
});

console.log('\n🔐 OAuth 2.0 Setup for Google Sheets\n');
console.log('Step 1: Authorize this application');
console.log('=====================================');
console.log('Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

// Create a simple HTTP server to receive the callback
const server = http.createServer(async (req, res) => {
  try {
    if (req.url.indexOf('/oauth2callback') > -1) {
      const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
      const code = qs.get('code');
      
      if (code) {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log('\n✅ Authorization successful!\n');
        console.log('Step 2: Add these to your .env file');
        console.log('=====================================\n');
        console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID);
        console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET);
        console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('GOOGLE_SHEET_ID=your-sheet-id-here\n');
        
        if (tokens.refresh_token) {
          console.log('✅ Refresh token obtained! Add it to your .env file.');
        } else {
          console.log('⚠️  Warning: No refresh token received. You may need to:');
          console.log('   1. Revoke access: https://myaccount.google.com/permissions');
          console.log('   2. Run this script again');
          console.log('   3. Make sure to select your account and grant all permissions');
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
              <p>Check the terminal for your refresh token.</p>
            </body>
          </html>
        `);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization failed. No code received.</h1>');
      }
      
      server.close();
    }
  } catch (e) {
    console.error('Error:', e);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Error occurred. Check the terminal.</h1>');
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`\nWaiting for authorization callback on http://localhost:${PORT}/oauth2callback`);
  console.log('After authorizing, return here to see your refresh token.\n');
});




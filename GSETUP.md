# Contact Form Setup Guide

This guide will help you set up Google Sheets integration to store contact form submissions using OAuth 2.0.

## Overview

The contact form is already integrated into the website. When users click "Register Your Dog", they'll see a modal form. Submissions will be stored in Google Sheets for easy management.

## Prerequisites

- A Google account
- A Google Cloud project (we'll create this in Step 1)

## Setup Steps

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Complete OAuth Consent Screen
1. In Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Fill in the required information:
   - **App name**: `Bay Pet Resorts Contact Form` (or similar)
   - **User support email**: Your email address
3. **Select User Type:**
   - Choose **"Internal"** (only available to users within your organization)
   - Click "Next"
4. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - If the Google Sheets API scope doesn't appear in the list, use the **"Manually add scopes"** section at the bottom
   - In the text area, paste: `https://www.googleapis.com/auth/spreadsheets`
   - Click "Add to table"
   - Click "Update" then "Save and Continue"
5. Complete the remaining steps (Test users, Summary)
6. Click "Back to Dashboard"

### Step 3: Create OAuth Client ID
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the consent screen (you may have already done this in Step 2)
4. Choose "Web application"
5. Fill in:
   - **Name**: `Bay Pet Resorts Sheets Client`
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/oauth2callback` (for local development)
     - `https://baypetresorts.com/oauth2callback` (for production)
     - Click "Add URI" to add multiple redirect URIs
6. Click "Create"
7. **Copy the Client ID and Client Secret** - you'll need these for your `.env` file!

### Step 4: Get Your Refresh Token
1. **Set environment variables temporarily:**
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

2. **Run the OAuth setup script:**
   ```bash
   node setup-oauth.js
   ```

3. **Follow the prompts:**
   - The script will display a URL
   - Open that URL in your browser
   - Sign in with your Google account
   - Grant all permissions when prompted
   - You'll be redirected back and see your refresh token in the terminal

4. **Copy the refresh token** - you'll need it for your `.env` file

**Note:** The refresh token is long-lived and won't expire unless you revoke access. Once set up, your app will work automatically without re-authentication.

### Step 5: Create Google Sheet
1. Create a new Google Sheet in your Google Drive
2. Name it something like "Bay Pet Resorts - Contact Submissions"
3. **Share the sheet** with your Google account (the one you used for OAuth)
   - Click "Share" button
   - Add your email address
   - Give it "Editor" permissions
   - Click "Send"

The sheet will be accessed using your OAuth credentials, so make sure you share it with the same Google account you used for OAuth.

### Step 6: Get Sheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Copy the `SHEET_ID_HERE` part (the long string between `/d/` and `/edit`)

Example: If your URL is `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`, then your Sheet ID is `1a2b3c4d5e6f7g8h9i0j`

### Step 7: Configure Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token-from-setup-script
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**For Production (baypetresorts.com):**
```env
GOOGLE_REDIRECT_URI=https://baypetresorts.com/oauth2callback
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- The refresh token is long-lived and won't expire unless you revoke access
- **Never commit the `.env` file to git!** It's already in `.gitignore`
- Keep your Client Secret and Refresh Token secure

## Testing

1. **Verify your `.env` file is configured** with all required OAuth credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_SHEET_ID`

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:** `http://localhost:3000`

4. **Test the form:**
   - Click "Register Your Dog"
   - Fill out and submit the form
   - Check your Google Sheet - you should see the submission appear!

**Note:** The first request might take a moment as it refreshes the access token. Subsequent requests will be faster.

## Without Google Sheets (Fallback)

If Google Sheets is not configured, form submissions will still work but will only be logged to the console. This is useful for:
- Development/testing
- Temporary setups
- If you prefer to handle submissions another way

## Troubleshooting

### "Google Sheets credentials not properly configured"

- Check that `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` are all set in your `.env` file
- Verify there are no extra spaces or quotes around the values
- Make sure your `.env` file is in the project root directory

### "Could not connect to Google Sheets API"

- Verify the Google Sheets API is enabled in your Google Cloud project
- Check that your refresh token is valid (run `setup-oauth.js` again if needed)
- Ensure the sheet ID is correct
- Check that your Google account has "Editor" access to the sheet

### "Failed to refresh OAuth token"

- Your refresh token may have been revoked
- Go to [Google Account Permissions](https://myaccount.google.com/permissions) and check if the app is still authorized
- If revoked, run `setup-oauth.js` again to get a new refresh token
- Make sure you granted all permissions during the OAuth flow

### Submissions not appearing in sheet

- Verify your Google account (the one you used for OAuth) has "Editor" access to the sheet
- Check the sheet ID in your environment variables matches the actual sheet
- Look at server logs for error messages
- Try refreshing the Google Sheet page
- Verify the Google Sheets API is enabled in your project

### "Application name must not be empty" error

- Make sure you completed the OAuth consent screen (Step 2)
- Fill in the "App name" field with any name (e.g., "Bay Pet Resorts Contact Form")
- Complete all required fields in the consent screen

## Security Best Practices

1. **Never commit credentials to git** - The `.env` file is already in `.gitignore`
2. **Use environment variables** in production (not files)
3. **Keep your Client Secret and Refresh Token secure** - Don't share them or expose them in client-side code
4. **Rotate credentials** periodically if compromised
5. **Monitor sheet access** - Check who has access to your Google Sheet regularly
6. **Limit OAuth scopes** - Only request the permissions you need

## Expected Volume

This setup is optimized for **~100 submissions per week** (~400/month). Google Sheets can handle this volume easily. If you expect significantly more traffic, consider:
- Database solution (PostgreSQL, MongoDB)
- Dedicated form service (Typeform, Google Forms)
- CRM integration (HubSpot, Salesforce)

## Alternative: Email Instead of Google Sheets

If you prefer to receive submissions via email instead of Google Sheets, you can use the email alternative:

1. **Install nodemailer:**
   ```bash
   npm install nodemailer
   ```

2. **Use the email alternative server:**
   - A file `server-email-alternative.js` is included in the project
   - Rename your current `server.js` to `server-sheets.js` (backup)
   - Rename `server-email-alternative.js` to `server.js`

3. **Configure email settings in `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   CONTACT_EMAIL=where-to-receive-submissions@example.com
   ```

**Pros:** Simple, no Google Cloud setup needed, works immediately  
**Cons:** Submissions go to email instead of a spreadsheet

## Production Deployment (baypetresorts.com)

### Step 1: Update Google Cloud Console
1. Go to "APIs & Services" > "Credentials"
2. Find your OAuth 2.0 Client ID
3. Click "Edit" (pencil icon)
4. Under "Authorized redirect URIs", add:
   - `https://baypetresorts.com/oauth2callback`
5. Click "Save"

### Step 2: Configure Environment Variables in Vercel

If you're deploying to Vercel, you need to add environment variables in the Vercel dashboard:

1. **Go to your Vercel Dashboard:**
   - Navigate to [vercel.com](https://vercel.com) and log in
   - Select your project (BayPetResorts)

2. **Open Environment Variables:**
   - Go to **Settings** → **Environment Variables**

3. **Add the following environment variables:**
   - Click **"Add New"** for each variable below
   - Use the same values from your local `.env` file
   
   **Required Variables:**
   - `GOOGLE_SHEET_ID` = `your_sheet_id_here`
   - `GOOGLE_CLIENT_ID` = `your-client-id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET` = `your-client-secret`
   - `GOOGLE_REFRESH_TOKEN` = `your-refresh-token`
   - `GOOGLE_REDIRECT_URI` = `https://baypetresorts.com/oauth2callback`
   - `NODE_ENV` = `production` (optional, but recommended)

4. **Set Environment Scope:**
   - For each variable, select **"Production"** (and optionally "Preview" if you want it in preview deployments)
   - Click **"Save"**

5. **Redeploy:**
   - After adding all variables, go to **Deployments** tab
   - Click the three dots (⋯) on your latest deployment
   - Select **"Redeploy"** to apply the new environment variables
   - Or wait for the next automatic deployment after pushing code

**Important:** 
- The environment variables in Vercel are separate from your local `.env` file
- You must add them manually in the Vercel dashboard
- After adding variables, you must redeploy for them to take effect

### Step 3: Verify Deployment

1. **Check deployment logs:**
   - Go to your Vercel project → **Deployments**
   - Click on the latest deployment
   - Check the build logs or function logs
   - You should see: `✅ Google Sheets integration enabled (OAuth 2.0)`
   - You should see: `📋 Environment: production`

2. **Test the form:**
   - Visit https://baypetresorts.com
   - Click "Register Your Dog"
   - Fill out and submit the form
   - Check your Google Sheet - the submission should appear!

**If you see "Google Sheets not configured" in the logs:**
- Verify all environment variables are set in Vercel
- Make sure you selected "Production" environment for each variable
- Try redeploying the project

### Troubleshooting Production Issues

**Check server startup logs:**
- You should see: `✅ Google Sheets integration enabled (OAuth 2.0)`
- You should see: `📋 Environment: production`
- If you see "Google Sheets not configured", your environment variables aren't loading

**Common Issues:**

1. **Environment variables not loading:**
   - Make sure `NODE_ENV=production` is set
   - Verify all variables are set (not just in `.env` file)
   - **If using Vercel:** Go to Settings → Environment Variables and verify all variables are added with "Production" environment selected
   - After adding/updating variables in Vercel, you must redeploy for changes to take effect
   - Check Vercel deployment logs to see if variables are being loaded

2. **403 Forbidden error:**
   - Verify Google Sheets API is enabled in your project
   - Check that redirect URI `https://baypetresorts.com/oauth2callback` is added in Google Cloud Console
   - The redirect URI must match exactly (including https://)

3. **Refresh token issues:**
   - The refresh token should work for both local and production
   - If you get token errors, you may need to regenerate it using the production redirect URI

4. **Check production logs:**
   - Look for error messages that show what's failing
   - The server now logs detailed error information including status codes

## Next Steps

- Set up email notifications when new submissions arrive
- Add form validation rules
- Integrate with a CRM system
- Set up automated responses
- Customize the form fields to match your needs

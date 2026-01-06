const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
      name: 'Bay Pet Ventures - Main Location',
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

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bay Pet Ventures server running on http://localhost:${PORT}`);
});


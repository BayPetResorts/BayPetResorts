# Bay Pet Ventures Website

A modern, responsive website for Bay Pet Ventures, featuring luxury pet care services. Built with Node.js and Express.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with a luxury aesthetic
- **Zip Code Search**: Find local resort locations by zip code with API integration
- **Smooth Navigation**: Easy-to-use navigation with smooth scrolling
- **Node.js Backend**: Express server with API endpoints

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Development

The project uses `nodemon` for automatic server restarts during development. When you run `npm run dev`, the server will automatically restart when you make changes to `server.js`.

## File Structure

```
BayPetVentures_Website_v2/
├── public/
│   ├── assets/
│   │   ├── images/     # Image files (jpg, png, svg, webp, etc.)
│   │   └── videos/     # Video files (mp4, webm, mov, etc.)
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Stylesheet
│   └── script.js       # JavaScript functionality
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## API Endpoints

### GET /api/locations?zip={zipCode}

Search for locations by zip code.

**Query Parameters:**
- `zip` (required): 5-digit zip code

**Response:**
```json
{
  "locations": [
    {
      "id": 1,
      "name": "Bay Pet Ventures - Main Location",
      "address": "123 Pet Care Blvd",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94102",
      "phone": "(908) 889-7387",
      "distance": "2.5 miles"
    }
  ]
}
```

## Assets

Place your images and videos in the `public/assets/` directory:
- **Images**: `public/assets/images/` - Use paths like `/assets/images/your-image.jpg` in your HTML/CSS
- **Videos**: `public/assets/videos/` - Use paths like `/assets/videos/your-video.mp4` in your HTML

Example usage in HTML:
```html
<img src="/assets/images/hero-image.jpg" alt="Hero Image">
<video src="/assets/videos/promo-video.mp4" controls></video>
```

## Customization

- **Colors**: Edit CSS variables in `public/styles.css` under `:root`
- **Content**: Modify text and structure in `public/index.html`
- **Functionality**: Add features in `public/script.js`
- **Assets**: Add images and videos to `public/assets/`
- **API**: Update the `/api/locations` endpoint in `server.js` to connect to your database

## Environment Variables

You can set the following environment variable:
- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


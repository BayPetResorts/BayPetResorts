# Dog Registration Form Component

A standalone, reusable registration form component that can be embedded into any website.

## Features

- ✅ 4-step multi-step form with progress indicator (Phone, Contact, Dog Info, Services)
- ✅ Animated dog walking progress indicator
- ✅ Phone number auto-formatting
- ✅ Searchable breed dropdown (200+ breeds)
- ✅ Optional vaccination file uploads (accordion)
- ✅ SMS opt-in checkbox
- ✅ Success screen with customizable image
- ✅ Fully responsive design
- ✅ No external dependencies (except Google Fonts)
- ✅ Scoped CSS to avoid conflicts
- ✅ Configurable via data attributes

## Usage

### Basic Usage

1. **Include the component HTML** in your page:

```html
<!-- Option 1: Include via iframe -->
<iframe 
    src="/dog-registration-form-component.html" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border: none;">
</iframe>

<!-- Option 2: Copy the HTML/CSS/JS directly into your page -->
<!-- See "Direct Embedding" section below -->
```

### Configuration via Data Attributes

Add data attributes to the component container to customize it:

```html
<div 
    id="dogRegFormComponent"
    data-api-endpoint="/api/contact"
    data-dog-icon-url="/assets/images/dog-icon.png"
    data-success-image-url="/assets/images/success-image.jpg"
    data-company-name="Bay Pet Resorts"
    data-sms-policy-url="https://www.quo.com/policies/OR8BM50QQV">
    <!-- Component HTML here -->
</div>
```

### Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-api-endpoint` | API endpoint for form submission | `/api/contact` |
| `data-dog-icon-url` | URL for the walking dog icon in progress bar | (none) |
| `data-success-image-url` | URL for success screen image | (none) |
| `data-company-name` | Company name (used in SMS disclaimer) | (none) |
| `data-sms-policy-url` | URL for SMS privacy policy | `https://www.quo.com/policies/OR8BM50QQV` |

### JavaScript Callbacks

You can also configure callbacks via global functions:

```html
<script>
    // Called when form is successfully submitted
    window.dogRegFormOnSuccess = function(formData) {
        console.log('Form submitted:', formData);
        // formData contains: phone, firstName, lastName, email, dogName, breed, notes, services
    };

    // Called when form submission fails
    window.dogRegFormOnError = function(error) {
        console.error('Form error:', error);
    };
</script>
```

### Direct Embedding

If you want to embed the component directly (not via iframe), you can:

1. Copy the `<style>` section into your page's CSS
2. Copy the HTML structure (the `<div class="dog-reg-form-component">` section)
3. Copy the `<script>` section into your page

**Important**: Make sure to:
- Keep the `dog-reg-form-component` class prefix on all CSS selectors
- Keep the `id="dogRegFormComponent"` on the main container
- Include the Google Fonts link: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`

### API Endpoint Format

Your API endpoint should accept POST requests with the following JSON body:

```json
{
    "phone": "(555) 123-4567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "dogName": "Buddy",
    "breed": "Golden Retriever",
    "notes": "Optional notes here",
    "services": ["boarding", "daycare", "grooming", "training"]
}
```

Note: `services` is an array of selected service values (can be empty if none selected).

**Response format** (success):
```json
{
    "success": true,
    "message": "Thank you for your submission!"
}
```

**Response format** (error):
```json
{
    "error": "Error message here"
}
```

### Styling Customization

The component uses CSS variables that you can override:

```css
.dog-reg-form-component {
    --primary-blue: #1E3A5F;      /* Primary brand color */
    --beige-bg: #F5F0E8;          /* Background color */
    --beige-light: #E8E0D6;       /* Light border color */
    --white: #FFFFFF;              /* White background */
    --text-dark: #2C2C2C;          /* Text color */
}
```

All styles are scoped to `.dog-reg-form-component` to avoid conflicts with your existing styles.

### Example: Full Page Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Your existing styles */
    </style>
</head>
<body>
    <!-- Your header/navigation -->
    
    <!-- Embed the component -->
    <div id="dogRegFormComponent"
         data-api-endpoint="https://api.example.com/contact"
         data-company-name="My Pet Business"
         data-dog-icon-url="/images/dog-walking.png"
         data-success-image-url="/images/success.jpg">
        <!-- Component HTML here (copy from dog-registration-form-component.html) -->
    </div>
    
    <!-- Your footer -->
    
    <!-- Component script here (copy from dog-registration-form-component.html) -->
</body>
</html>
```

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Notes

- Vaccination file uploads are currently for display only (files are not sent to the API)
- The component is fully self-contained and doesn't require any external JavaScript libraries
- All form validation happens client-side before submission
- The component automatically scrolls to the form on page load
- The component automatically scrolls to the success screen after submission

### Troubleshooting

**Form not submitting?**
- Check that your API endpoint is correct
- Verify CORS settings if using a different domain
- Check browser console for errors

**Styles not applying?**
- Ensure the `dog-reg-form-component` class is on the container
- Check that CSS is properly scoped
- Verify no conflicting styles in your page

**Breed dropdown not working?**
- Ensure the breed dropdown JavaScript is included
- Check that all required IDs are present (`breedSearch`, `breed`, `breedDropdownList`)

## License

This component is provided as-is for use in your projects.

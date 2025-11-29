# QR Code Sticker Setup Guide

## Overview

Gear Base now supports QR code deep linking! You can create QR code stickers for each piece of equipment that will take users directly to that item's detail page when scanned.

## How It Works

1. **Deep Link URLs**: Each inventory item has a unique URL that navigates directly to its detail page
2. **QR Code Generation**: You create QR codes using the provided URLs
3. **Scanning**: When someone scans the QR code, they're taken directly to that item in the app

## Getting Your QR Code Links

### In the App

1. Navigate to any item's detail page
2. Look for the **"QR Code Link"** section (highlighted in emerald green)
3. Click **"Copy Link for QR Code"** to copy the URL to your clipboard
4. The link will look like: `https://yourdomain.com/?item=123`

### Example URL Format

- Local development: `http://localhost:5173/?item=42`
- Production: `https://app.mygearbase.com/?item=42`

## Creating QR Codes

You can use any QR code generator. Here are some recommended free options:

### Online Generators

1. **QR Code Monkey** (https://www.qrcode-monkey.com/)
   - Free, high quality
   - Supports custom colors and logos
   - Download as PNG, SVG, or PDF

2. **QR Code Generator** (https://www.qr-code-generator.com/)
   - Simple and fast
   - Multiple download formats

3. **Canva** (https://www.canva.com/)
   - Create custom QR code stickers with designs
   - Professional templates available

### Bulk QR Code Generation

If you have many items, you can:

1. Export your inventory list
2. Use a bulk QR code generator like:
   - **QRBatch** (https://qrbatch.com/)
   - **Bulk QR Code Generator** (https://www.bulkqrcodegenerator.com/)

## Creating Physical Stickers

### Option 1: Print-at-Home

1. Generate QR codes for your items
2. Use label printing software (Avery Design & Print, Dymo, etc.)
3. Print on adhesive label sheets
4. Common label sizes:
   - **1" x 1"** - Small equipment
   - **2" x 2"** - Medium equipment
   - **3" x 3"** - Large cases

### Option 2: Professional Printing

Services like:
- **Sticker Mule** - High-quality vinyl stickers
- **Avery WePrint** - Custom labels
- **ULine** - Industrial equipment labels

### Recommended Sticker Specifications

- **Material**: Vinyl or polyester (weather-resistant)
- **Finish**: Matte or glossy laminate (protects from scratches)
- **Adhesive**: Permanent for equipment, removable for cases
- **Size**: Minimum 1" x 1" for reliable scanning

## Best Practices

### QR Code Placement

- Place on a **flat surface** (avoid curves)
- Ensure **good lighting** in typical use areas
- Avoid placing over **textures or seams**
- Keep a **0.25" margin** around the code

### Testing

Before printing hundreds of stickers:

1. Print a test batch (5-10 stickers)
2. Test scanning with different phones
3. Verify the links navigate correctly
4. Check sticker durability (water, scratching, etc.)

### Organization Tips

- **Color coding**: Use different colored stickers for categories
  - Red: Camera equipment
  - Blue: Lighting
  - Green: Audio
  - Yellow: Grip

- **Number matching**: Print the item ID number below the QR code for manual reference

## Updating Your Production URL

When you deploy your app to production, update the base URL in the code:

1. Open `utils/deepLinks.ts`
2. Update the `getBaseUrl()` function:

```typescript
export const getBaseUrl = (): string => {
  // Replace with your production domain
  return 'https://app.mygearbase.com';
};
```

## Troubleshooting

### QR Code Doesn't Scan

- Increase QR code size (try 2" x 2" minimum)
- Ensure high contrast (black on white background)
- Check for damage or dirt on the sticker
- Verify the URL is correct

### Link Opens But Doesn't Navigate

- User must be **logged in** to the app
- Check that the item ID exists in the database
- Clear browser cache and try again

### Link Shows Wrong Item

- Verify you copied the correct link for that item
- Check for duplicate item IDs in database

## Tips for Film Sets

- **Camera Department**: Put QR codes on camera cases, lens cases, and accessories
- **Lighting**: Label each fixture and case
- **Audio**: Tag wireless transmitters, mics, and recording equipment
- **Transport**: Scan items during load-in/load-out for quick inventory

## Need Help?

If you have questions or run into issues, please contact support or check the main documentation.

---

**Pro Tip**: Create a "QR Code Test Kit" with 5-10 test stickers to validate your workflow before ordering bulk stickers!

# CSV Import Guide

## How to Bulk Import Your Inventory

GearBase supports **3 ways** to import inventory in bulk:

### Method 1: Upload CSV File 📁 (Recommended)

1. Prepare your CSV file with columns:
   ```
   Name, Category, Value, QR Code, Notes
   ```
2. Go to **Inventory** → **Import Inventory**
3. Click **"Choose CSV File"**
4. Select your `.csv` file
5. Click **"Preview Data"** to verify
6. Click **"Import Items"**

### Method 2: Import from Google Sheets 🔗

1. Create a Google Sheet with your inventory
2. Set sharing to **"Anyone with the link"** (important!)
3. Copy the sheet URL
4. Paste it in the Google Sheet section
5. Click **"Fetch Data"**
6. Preview and import

### Method 3: Paste Data Manually 📋

1. Copy data from Excel/Sheets (Ctrl+C)
2. Paste directly into the text box
3. Click **"Preview Data"**
4. Import

---

## CSV Format

### Required Columns
- **Name** - Item name (required)

### Optional Columns
- **Category** - Item category (e.g., "Camera", "Lighting")
- **Value** - Item value/cost (e.g., "1500" or "$1,500.00")
- **QR Code** - Custom QR/barcode (auto-generated if empty)
- **Notes** - Additional information

### Example CSV

```csv
Name,Category,Value,QR Code,Notes
Sony A7III,Camera,2000,CAM-001,Main camera body
Canon 50mm f/1.8,Lens,125,LENS-002,Great for portraits
ARRI 650W,Lighting,450,LIGHT-003,Fresnel light
Manfrotto Tripod,Support,200,,Carbon fiber legs
```

### Example (No Headers)

If your CSV doesn't have headers, the import will assume this order:
```csv
Sony A7III,Camera,2000,CAM-001,Main camera body
```

Columns: Name | Category | Value | QR | Notes

---

## Tips

### Using Default Category

If your CSV doesn't have a "Category" column:
1. Set the **Default Category** field before importing
2. All items will use that category
3. Saves time if importing similar items

### Value Formats Supported

All these work:
- `1500`
- `$1,500`
- `$1,500.00`
- `1500.50`

The importer automatically strips currency symbols and commas.

### QR Codes

- If empty, auto-generates: `GT-{timestamp}-{index}`
- If provided, must be unique
- Can use any format (barcodes, serials, SKUs)

### Large Imports

- Preview shows all items before importing
- Can edit raw data and re-preview
- Import happens in one batch (fast!)

---

## Excel to CSV

### Option 1: Save As CSV
1. Open your Excel file
2. **File** → **Save As**
3. Choose format: **CSV (Comma delimited)**
4. Save and upload to GearBase

### Option 2: Copy & Paste
1. Select cells in Excel
2. Copy (Ctrl+C or Cmd+C)
3. Paste into GearBase text box
4. Works with tab-separated data!

---

## Google Sheets to CSV

### Option 1: Share Link (Easiest)
1. Click **Share** in Google Sheets
2. Set to **"Anyone with the link"**
3. Copy link
4. Paste in GearBase import

### Option 2: Download CSV
1. **File** → **Download** → **Comma Separated Values (.csv)**
2. Upload to GearBase

### Option 3: Copy & Paste
1. Select cells
2. Copy
3. Paste into GearBase

---

## Common Issues

### "Could not parse any valid items"
**Solution**: Make sure first column has item names

### "Privacy Error: The sheet is likely private"
**Solution**: Set Google Sheet sharing to "Anyone with the link"

### "Please upload a CSV file"
**Solution**: File must end in `.csv` or `.txt`

### Categories not matching
**Solution**: Use the Default Category dropdown to pick existing categories

### Values showing as text
**Solution**: Remove currency symbols in Excel before exporting

---

## Template CSV

Download this template to get started:

```csv
Name,Category,Value,QR Code,Notes
Camera Body,Camera,2000,,
Lens 50mm,Lens,500,,
LED Panel,Lighting,300,,
Tripod,Support,150,,
Shotgun Mic,Audio,200,,
```

Save as `inventory_template.csv` and fill in your items!

---

## After Import

After importing:
- ✅ All items set to "Available" status
- ✅ All items set to "Good" condition
- ✅ Items are immediately searchable
- ✅ Can generate QR codes for all items
- ✅ Ready to assign to jobs

---

## Exporting & Downloading Inventory

GearBase offers multiple export options from the Inventory screen:

### Download Options

Click the **"Download"** button in the Inventory screen to access:

| Format | Description | Best For |
|--------|-------------|----------|
| **CSV Report** | Full spreadsheet with all details & summary stats | Excel/Sheets analysis, insurance |
| **PDF Report** | Formatted document grouped by category | Printing, sharing, insurance |
| **Transfer CSV** | Import-ready format (Name, Category, Value, QR, Notes) | Backup, moving to another account |
| **QR Code Labels** | Printable stickers with QR codes & names | Labeling equipment |
| **Export by Category** | Download individual categories | Department-specific reports |

### CSV Report Includes
- Summary: Total items, available, checked out, total value
- Columns: Name, Category, QR Code, Status, Condition, Value, Weight, Storage Case, Purchase Date, Notes

### QR Code Labels
- 12 labels per page (3 columns x 4 rows)
- 0.5" x 0.5" QR codes
- Item name and category on each label
- Dashed cutting guides
- Print on adhesive label paper

### Filtered Exports
If you have a search filter active, exports will only include the filtered items. Clear the filter to export your complete inventory.

### Package PDF Downloads
You can also download PDFs for individual Packages:
1. Go to **Packages** screen
2. Click the document icon (📄) on any package card
3. PDF includes: Package name, all items by category, values, weights, conditions

---

## Best Practices

1. **Test with small batch first** - Import 5-10 items to verify format
2. **Use consistent categories** - Pick from dropdown to avoid duplicates
3. **Include values** - Helps with insurance and tracking
4. **Add notes** - Serial numbers, purchase dates, etc.
5. **Keep a backup** - Save your CSV file after import

---

## Need Help?

- Check the preview before importing
- Use the "Edit Raw Data" button to make changes
- Start with the CSV template above
- Test with a small file first

Happy importing! 🚀

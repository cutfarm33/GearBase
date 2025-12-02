# Gear Base - Inventory Import Guide

## Quick Start
Use the `inventory_import_template.csv` file to bulk import your equipment into Gear Base. This guide explains each field and provides best practices for populating your inventory data.

---

## CSV Template Fields

### Required Fields

#### 1. **name** (Required)
- **Description**: The name or model of the item
- **Format**: Text
- **Examples**:
  - `"Sony FX6 Camera Body"`
  - `"Canon EF 24-70mm f/2.8L II"`
  - `"ARRI SkyPanel S60-C"`
- **Best Practice**: Include manufacturer and model number for easy identification

#### 2. **category** (Required)
- **Description**: Equipment category for organization
- **Format**: Text - Must match one of the predefined categories
- **Valid Options**:
  - `Cameras`
  - `Lenses`
  - `Lighting`
  - `G&E` (Grip & Electric)
  - `Grip`
  - `Electric`
  - `Audio`
  - `Monitors`
  - `Support` (Tripods, Gimbals, etc.)
  - `Batteries & Power`
  - `Media` (Cards, Drives)
  - `Cables`
  - `Drones`
  - `Cases`
  - `Computers`
  - `Production Supplies`
  - `Vehicles`
  - `Expendables`
- **Best Practice**: Use the exact spelling from the list above

---

### Optional Fields (Highly Recommended)

#### 3. **status**
- **Description**: Current availability status of the item
- **Format**: Text
- **Valid Options**:
  - `Available` (Default - item is ready to use)
  - `Checked Out` (Currently in use on a job)
  - `In Maintenance` (Being serviced or repaired)
  - `Unavailable` (Not available for checkout)
- **Default**: If left blank, defaults to `Available`
- **Best Practice**: Use `Available` for new imports unless you know the item is out

#### 4. **condition**
- **Description**: Physical condition of the item
- **Format**: Text
- **Valid Options**:
  - `Good` (Default - excellent working condition)
  - `Used but OK` (Shows wear but fully functional)
  - `Damage Noted` (Has issues but still usable)
  - `In Repair` (Currently being fixed)
  - `Lost` (Item is missing)
  - `Retired` (No longer in active use)
- **Default**: If left blank, defaults to `Good`
- **Best Practice**: Be honest about condition to prevent issues on set

#### 5. **qrCode**
- **Description**: Unique identifier for QR code generation
- **Format**: Text - alphanumeric, no special characters except dash and underscore
- **Examples**:
  - `"FX6-001"`
  - `"LENS-024-EF"`
  - `"ARRI-S60-001"`
- **Best Practice**: Use a consistent naming scheme (e.g., `CATEGORY-MODEL-NUMBER`)
- **Note**: If left blank, the system will auto-generate one

#### 6. **notes**
- **Description**: Additional information, special instructions, or item history
- **Format**: Text - wrap in quotes if containing commas
- **Examples**:
  - `"Full-frame cinema camera with 10.2MP sensor"`
  - `"Requires specific mounting plate - see manual in case"`
  - `"Battery life approximately 4 hours on full charge"`
- **Best Practice**: Include any quirks, accessories, or important details

#### 7. **purchaseDate**
- **Description**: Date the item was acquired
- **Format**: YYYY-MM-DD (ISO format)
- **Examples**:
  - `"2023-01-15"`
  - `"2022-06-10"`
- **Best Practice**: Use ISO date format for consistency
- **Note**: Can also accept formats like `01/15/2023` or `Jan 15, 2023`

#### 8. **value**
- **Description**: Purchase price or replacement value in USD
- **Format**: Number (no dollar sign or commas)
- **Examples**:
  - `6000`
  - `4500.50`
  - `1000`
- **Best Practice**: Use current replacement value if you don't have purchase price
- **Use Case**: Important for insurance and asset tracking

#### 9. **weight**
- **Description**: Item weight in pounds (lbs)
- **Format**: Number (decimal allowed)
- **Examples**:
  - `2.6` (2.6 lbs)
  - `14.3` (14.3 lbs)
  - `0.8` (0.8 lbs)
- **Best Practice**: Include shipping weight with packaging for accurate load calculations
- **Use Case**: Helpful for travel planning and case packing

#### 10. **storageCase**
- **Description**: Physical location or case where item is stored
- **Format**: Text
- **Examples**:
  - `"Case A1"`
  - `"Pelican 1650 - Camera Truck"`
  - `"Warehouse Shelf 4"`
  - `"Grip Cart - Right Side"`
- **Best Practice**: Use your existing location/case naming system
- **Use Case**: Quickly locate items when prepping for shoots

#### 11. **imageUrl**
- **Description**: URL link to product image or photo
- **Format**: Full URL starting with http:// or https://
- **Examples**:
  - `"https://example.com/images/fx6.jpg"`
  - `"https://manufacturer.com/products/lens-24mm.png"`
- **Best Practice**: Use manufacturer product images or take photos of your actual gear
- **Note**: Can be left blank and added later via the app
- **Tip**: You can use image hosting services like Imgur, CloudFlare Images, or your own website

---

## CSV Formatting Tips

### General Rules
1. **Use Quotes**: Wrap text fields in double quotes, especially if they contain commas
   - ✅ Good: `"Sony FX6 Camera Body, includes battery"`
   - ❌ Bad: `Sony FX6 Camera Body, includes battery` (comma will break import)

2. **No Header Changes**: Keep the first row exactly as shown in the template

3. **Empty Fields**: Leave field empty if you don't have the data (don't use "N/A" or "-")
   - ✅ Good: `"Sony FX6","Cameras",,"Good"` (status is blank)
   - ❌ Bad: `"Sony FX6","Cameras","N/A","Good"`

4. **Excel Users**: Save as "CSV UTF-8 (Comma delimited)" when exporting

5. **Line Breaks**: Avoid line breaks within fields. If needed, use `\n`

---

## Example Scenarios

### Basic Camera Kit
```csv
name,category,status,condition,qrCode,notes,purchaseDate,value,weight,storageCase,imageUrl
"Sony FX6 Body","Cameras","Available","Good","CAM-FX6-001","Includes 2 batteries and charger","2023-01-15","6000","2.6","Camera Case A",""
"Canon 24-70mm f/2.8","Lenses","Available","Good","LENS-2470-001","Standard zoom lens","2023-01-15","1800","1.8","Camera Case A",""
"Sony BP-U100 Battery","Batteries & Power","Available","Good","BAT-U100-001","","2023-01-15","180","0.8","Camera Case A",""
```

### Audio Department
```csv
name,category,status,condition,qrCode,notes,purchaseDate,value,weight,storageCase,imageUrl
"Sennheiser MKH 416","Audio","Available","Good","AUD-MKH416-001","Shotgun mic with deadcat windscreen","2021-05-10","1000","0.3","Sound Bag 1",""
"Sound Devices 633 Mixer","Audio","Available","Good","AUD-SD633-001","6-input field mixer/recorder","2021-05-10","3500","3.2","Sound Cart",""
"Boom Pole 12ft","Audio","Available","Good","AUD-BOOM-001","Carbon fiber boom pole","2021-05-10","450","1.5","Sound Cart",""
```

### Lighting Package
```csv
name,category,status,condition,qrCode,notes,purchaseDate,value,weight,storageCase,imageUrl
"ARRI SkyPanel S60-C","Lighting","Available","Good","LGT-S60-001","RGB LED panel with wireless DMX","2023-03-20","3200","14.3","Road Case B2",""
"Aputure 1200d Pro","Lighting","Available","Good","LGT-AP1200-001","1200W COB LED daylight","2023-03-20","1900","15.8","Road Case B3",""
"C-Stand 40in (Set of 4)","Grip","Available","Good","GRP-CS40-SET1","Matthews Century Stands","2020-12-01","1000","44.0","Grip Truck",""
```

---

## Import Process

1. **Download Template**: Get `inventory_import_template.csv` from the templates folder
2. **Fill in Your Data**: Add your equipment following the field guidelines above
3. **Save as CSV**: Ensure file is saved as CSV format (not Excel .xlsx)
4. **Import to Gear Base**:
   - Go to Inventory → Import
   - Click "Upload CSV File"
   - Select your completed CSV file
   - Review the preview
   - Click "Import Items"
5. **Verify**: Check that all items imported correctly

---

## Troubleshooting

### Common Issues

**Problem**: Import fails with "Invalid category"
- **Solution**: Make sure category exactly matches one from the valid list (case-sensitive)

**Problem**: Date fields don't import correctly
- **Solution**: Use YYYY-MM-DD format (e.g., `2023-01-15`)

**Problem**: Special characters cause issues
- **Solution**: Wrap fields containing commas, quotes, or special characters in double quotes

**Problem**: Items importing with wrong data
- **Solution**: Check that columns are in the correct order as shown in the template header

**Problem**: Excel adds extra formatting
- **Solution**: Save as "CSV UTF-8 (Comma delimited)" not "CSV (Comma delimited)"

---

## Best Practices

### Naming Conventions
- **Be Consistent**: Use the same format for all similar items
- **Include Model Numbers**: Helps differentiate between similar items
- **Add Serial Numbers**: Include in notes field for high-value items

### QR Code IDs
- Use a logical prefix system:
  - `CAM-` for cameras
  - `LENS-` for lenses
  - `LGT-` for lighting
  - `AUD-` for audio
  - `GRP-` for grip equipment

### Organization Tips
1. **Start with High-Value Items**: Import cameras and lenses first
2. **Group by Department**: Keep audio, lighting, camera gear in separate sections
3. **Include Case/Location Info**: Makes prep much faster
4. **Document Condition**: Better to over-document than under-document
5. **Add Values**: Critical for insurance claims and budgeting

---

## Need Help?

- **Documentation**: Visit the Help section in Gear Base
- **Support Email**: info@mygearbase.com
- **Sample Data**: Use the provided template examples as a starting point

---

## Quick Reference Card

| Field | Required? | Format | Example |
|-------|-----------|--------|---------|
| name | ✅ Yes | Text | "Sony FX6 Camera Body" |
| category | ✅ Yes | Text (predefined) | "Cameras" |
| status | ⬜ No | Text (predefined) | "Available" |
| condition | ⬜ No | Text (predefined) | "Good" |
| qrCode | ⬜ No | Alphanumeric | "FX6-001" |
| notes | ⬜ No | Text | "Includes 2 batteries" |
| purchaseDate | ⬜ No | YYYY-MM-DD | "2023-01-15" |
| value | ⬜ No | Number | 6000 |
| weight | ⬜ No | Number (lbs) | 2.6 |
| storageCase | ⬜ No | Text | "Case A1" |
| imageUrl | ⬜ No | URL | "https://example.com/image.jpg" |

---

**Version**: 1.0
**Last Updated**: December 2024
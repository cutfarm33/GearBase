# Receipt Scanning Edge Function

This Supabase Edge Function uses Claude AI to extract data from receipt images.

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Link to your Supabase project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set the Anthropic API Key
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Get your API key from: https://console.anthropic.com/

### 4. Deploy the function
```bash
supabase functions deploy scan-receipt
```

## How It Works

1. User uploads a receipt image in the app
2. Image is converted to base64 and sent to this edge function
3. Edge function calls Claude API with the image
4. Claude extracts: amount, vendor, date, description, category
5. Extracted data is returned and auto-fills the form

## Supported Receipt Types

- Restaurant receipts
- Gas station receipts
- Retail store receipts
- Hotel bills
- Parking receipts
- Most printed receipts with clear text

## Troubleshooting

- **"AI service not configured"**: Make sure you've set the ANTHROPIC_API_KEY secret
- **Blurry images**: Ensure good lighting and focus when taking photos
- **Wrong amounts**: The AI looks for the TOTAL, not subtotals

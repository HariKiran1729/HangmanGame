# Centralized Result Collection Setup

To collect results from all devices/players, you have several options:

## Option 1: Google Sheets (Recommended)
1. Create a Google Sheet
2. Go to Extensions > Apps Script
3. Create a web app that accepts POST requests
4. Replace the webhook URL in the JavaScript code

## Option 2: FormSubmit.co (Easy Setup)
1. Go to https://formsubmit.co/
2. Create a form with your email
3. Use the provided endpoint URL

## Option 3: Webhook.site (For Testing)
1. Go to https://webhook.site/
2. Copy your unique URL
3. Replace in the JavaScript code

## Current Implementation:
The game currently stores results in:
- localStorage with key: 'hangman-global-results'
- This works for testing but won't collect from multiple devices

## To Enable Cross-Device Collection:
Replace the webhook URL in script.js at line with sendResultToServer method:

```javascript
await fetch('YOUR_WEBHOOK_URL_HERE', {
    method: 'POST',
    body: formData
});
```

## For Production:
You'll need a proper backend service or use services like:
- Google Sheets API
- Airtable API
- Firebase Firestore
- Simple webhook services 
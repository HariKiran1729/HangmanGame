# 📊 Google Sheets Real-Time Integration Setup

Follow these steps to set up real-time Google Sheets updates for your Hangman game results.

## 🎯 What You'll Get:
- **Real-time updates** as players complete games
- **Automatic spreadsheet** with formatted results
- **Summary dashboard** with statistics
- **Instant notifications** when new results arrive

## 📋 Step-by-Step Setup:

### Step 1: Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Replace the default code with the content from `google-sheets-script.js`
4. Save the project (Ctrl+S) and name it **"Hangman Results Collector"**

### Step 2: Deploy as Web App
1. In Google Apps Script, click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Type" and select **"Web app"**
3. Configure deployment:
   - **Description**: "Hangman Game Results API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **"Deploy"**
5. **IMPORTANT**: Copy the Web app URL - you'll need this!

### Step 3: Authorize Permissions
1. When prompted, click **"Authorize access"**
2. Choose your Google account
3. Click **"Advanced"** → **"Go to Hangman Results Collector (unsafe)"**
4. Click **"Allow"**

### Step 4: Update Game Configuration
1. Open `script.js` in your hangman game
2. Find this line:
   ```javascript
   this.googleSheetsUrl = 'YOUR_GOOGLE_SHEETS_WEBAPP_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_SHEETS_WEBAPP_URL_HERE` with your Web app URL from Step 2

### Step 5: Test the Integration
1. Open your hangman game
2. Play a quick test game with Employee ID "TEST123"
3. Complete or exit the game
4. Check your Google Drive - you should see a new spreadsheet called **"Hangman Game Results"**

## 📊 What the Spreadsheet Contains:

### Sheet 1: "Game Results"
| Column | Data |
|--------|------|
| A | Timestamp |
| B | Employee ID |
| C | Level Reached |
| D | Word |
| E | Game Status |
| F | Attempts Used |
| G | Start Time |
| H | End Time |
| I | Duration (seconds) |
| J | Level Completed |

### Sheet 2: "Summary"
- Total Games Played
- Games Completed (All Levels)
- Games Failed
- Games Exited Early
- Unique Players
- Average Level Reached
- Success Rate (%)
- Last Updated

## ⚡ Real-Time Features:

### Instant Updates
- New row appears **immediately** when a player finishes
- No refresh needed - live updates
- Summary statistics update automatically

### Live Monitoring
- Keep the spreadsheet open in a browser tab
- See results as they happen
- Perfect for monitoring during game sessions

## 🔧 Advanced Configuration:

### Custom Notifications
Add this to your Google Apps Script for email notifications:
```javascript
// Add to the doPost function after sheet.appendRow(rowData);
MailApp.sendEmail({
  to: 'your-email@cognizant.com',
  subject: 'New Hangman Game Result',
  body: `Player ${data.employeeId} completed level ${data.level}`
});
```

### Data Validation
The script automatically:
- Validates required fields
- Handles missing data gracefully
- Calculates game duration
- Formats data consistently

## 🛠️ Troubleshooting:

### Common Issues:

**Issue**: "Script not found" error
**Solution**: Make sure the Web app is deployed with "Anyone" access

**Issue**: No data appearing in sheets
**Solution**: Check that the Web app URL is correctly pasted in script.js

**Issue**: Permission denied
**Solution**: Re-run the authorization process in Google Apps Script

### Testing the Connection:
1. In Google Apps Script, run the `testWebApp()` function
2. Check the execution log for any errors
3. Verify the spreadsheet is created in your Google Drive

## 📱 Mobile-Friendly:
- The spreadsheet works on mobile devices
- Real-time updates on phones/tablets
- Perfect for monitoring on-the-go

## 🔒 Security:
- Only your Google account can access the spreadsheet
- Data is stored securely in Google Drive
- Web app processes data without storing credentials

## 📈 Usage Tips:
- Keep the Summary sheet open for quick overview
- Use filters on Game Results sheet for specific analysis
- Export data to Excel if needed
- Set up conditional formatting for visual indicators

---

## ✅ Final Checklist:
- [ ] Google Apps Script created and deployed
- [ ] Web app URL copied and pasted in script.js
- [ ] Permissions authorized
- [ ] Test game played and results appeared
- [ ] Spreadsheet accessible in Google Drive

**Time to first result**: **Instant** (within 1-2 seconds)

Your real-time Google Sheets integration is now ready! 🎉 
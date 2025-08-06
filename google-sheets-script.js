// Google Apps Script for Hangman Game Results
// This script should be deployed as a web app in Google Apps Script

function doPost(e) {
  try {
    // Get the active spreadsheet (create one if it doesn't exist)
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet);
    
    // Parse the incoming data
    const data = e.parameter;
    
    // Validate required fields
    if (!data.employeeId || !data.level) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Missing required fields'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare row data
    const timestamp = new Date();
    const rowData = [
      timestamp,                                    // A: Timestamp
      data.employeeId || '',                       // B: Employee ID
      parseInt(data.level) || 0,                   // C: Level Reached
      data.word || '',                             // D: Word
      data.gameCompleted === 'true' ? 'COMPLETED' : 
        data.exitedEarly === 'true' ? 'EXITED EARLY' : 'FAILED', // E: Status
      parseInt(data.attemptsUsed) || 0,            // F: Attempts Used
      data.startTime || '',                        // G: Start Time
      data.endTime || '',                          // H: End Time
      calculateDuration(data.startTime, data.endTime), // I: Duration (seconds)
      data.completed === 'true' ? 'YES' : 'NO'    // J: Level Completed
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Update summary statistics
    updateSummarySheet(spreadsheet, data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true, timestamp: timestamp}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing hangman data:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSpreadsheet() {
  const spreadsheetName = 'Hangman Game Results';
  
  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(spreadsheetName);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  }
  
  // Create new spreadsheet if it doesn't exist
  const spreadsheet = SpreadsheetApp.create(spreadsheetName);
  
  // Set up the main results sheet
  setupResultsSheet(spreadsheet);
  
  return spreadsheet;
}

function getOrCreateSheet(spreadsheet) {
  const sheetName = 'Game Results';
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    setupResultsSheet(spreadsheet);
  }
  
  return sheet;
}

function setupResultsSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Game Results') || spreadsheet.getActiveSheet();
  sheet.setName('Game Results');
  
  // Set up headers
  const headers = [
    'Timestamp',
    'Employee ID', 
    'Level Reached',
    'Word',
    'Game Status',
    'Attempts Used',
    'Start Time',
    'End Time',
    'Duration (sec)',
    'Level Completed'
  ];
  
  // Clear existing content and add headers
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Employee ID
  sheet.setColumnWidth(3, 100); // Level
  sheet.setColumnWidth(4, 150); // Word
  sheet.setColumnWidth(5, 120); // Status
  sheet.setColumnWidth(6, 100); // Attempts
  sheet.setColumnWidth(7, 150); // Start Time
  sheet.setColumnWidth(8, 150); // End Time
  sheet.setColumnWidth(9, 100); // Duration
  sheet.setColumnWidth(10, 120); // Completed
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Create summary sheet
  createSummarySheet(spreadsheet);
}

function createSummarySheet(spreadsheet) {
  const summarySheet = spreadsheet.insertSheet('Summary');
  
  // Summary headers
  const summaryHeaders = [
    ['Metric', 'Value'],
    ['Total Games Played', '=COUNTA(\'Game Results\'!B:B)-1'],
    ['Games Completed (All Levels)', '=COUNTIF(\'Game Results\'!E:E,"COMPLETED")'],
    ['Games Failed', '=COUNTIF(\'Game Results\'!E:E,"FAILED")'],
    ['Games Exited Early', '=COUNTIF(\'Game Results\'!E:E,"EXITED EARLY")'],
    ['Unique Players', '=ARRAYFORMULA(COUNTA(UNIQUE(\'Game Results\'!B2:B)))'],
    ['Average Level Reached', '=AVERAGE(\'Game Results\'!C2:C)'],
    ['Success Rate (%)', '=ROUND((COUNTIF(\'Game Results\'!E:E,"COMPLETED")/(COUNTA(\'Game Results\'!B:B)-1))*100,2)'],
    ['Last Updated', '=NOW()']
  ];
  
  summarySheet.getRange(1, 1, summaryHeaders.length, 2).setValues(summaryHeaders);
  
  // Format summary sheet
  const headerRange = summarySheet.getRange(1, 1, 1, 2);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  summarySheet.setColumnWidth(1, 200);
  summarySheet.setColumnWidth(2, 150);
}

function updateSummarySheet(spreadsheet, data) {
  // The summary sheet uses formulas, so it updates automatically
  // We just need to refresh the "Last Updated" timestamp
  const summarySheet = spreadsheet.getSheetByName('Summary');
  if (summarySheet) {
    summarySheet.getRange('B9').setFormula('=NOW()');
  }
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / 1000); // Duration in seconds
  } catch (error) {
    return 0;
  }
}

// Test function (for development)
function testWebApp() {
  const testData = {
    parameter: {
      employeeId: 'TEST123',
      level: '5',
      word: 'JAVASCRIPT',
      gameCompleted: 'false',
      exitedEarly: 'false',
      attemptsUsed: '3',
      completed: 'true',
      startTime: new Date(Date.now() - 60000).toISOString(),
      endTime: new Date().toISOString()
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}

// Function to get the web app URL (run this once after deployment)
function getWebAppUrl() {
  // This will be provided after you deploy the script as a web app
  console.log('Deploy this script as a web app and use the provided URL');
  console.log('Make sure to set execution as "Anyone" and access as "Anyone, even anonymous"');
} 
var XLSX = require('xlsx');
const { google } = require('googleapis');
const fs = require('fs');
var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});
let oAuth2Client1 = new google.auth.GoogleAuth({
  projectId: process.env.WSA_TEST_PROJECT_ID,
  credentials: {
    client_email: process.env.WSA_TEST_EMAIL,
    private_key: process.env.WSA_TEST_KEY?.replace(/\\n/g, "\n") // ensures the key is ready properly,
  },
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

export async function getJsonfromSheet(sheet_No) {
  const drive = google.drive('v2');
  let sheets = google.sheets({ version: 'v4', auth: oAuth2Client1 }).spreadsheets.values.batchGet({
    spreadsheetId: process.env.WSA_TEST_SHEET,
    ranges: [
      'Login',
      'Individual Registration',
      'Stripe Test Cards',
      'Team Registration',
      'Invited Team Member',
      'Record Attendance',
      'Affiliate Competition Creation',
      'Direct Competition Creation',
      'API',
      'Player Grading',
    ],
  });

  let allsheetData = await sheets;
  let sheetData = allsheetData.data.valueRanges;
  var workSheet = XLSX.utils.aoa_to_sheet(sheetData[sheet_No].values);
  let readJsondata = XLSX.utils.sheet_to_json(workSheet);
  return readJsondata;
}

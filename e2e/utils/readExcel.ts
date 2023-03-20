const { GoogleSpreadsheet } = require('google-spreadsheet');
var path = require('path');

require('dotenv').config({
  // path: path.join(__dirname, '../../.env'),
});

export async function getDataFromSheet(
  rowNumber: any,
  columnName: any,
  sheetName: any,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const doc: any = new GoogleSpreadsheet(process.env.WSA_TEST_SHEET);
    doc.useServiceAccountAuth({
      client_email: process.env.WSA_TEST_EMAIL,
      private_key: process.env.WSA_TEST_KEY?.replace(/\\n/g, "\n"),
    });
    doc.loadInfo().then(() => {
      let sheet: any = doc.sheetsByTitle[sheetName];
      sheet.getRows().then((rows: any) => {
        resolve(rows[rowNumber][columnName]);
        return rows[rowNumber][columnName];
      });
    });
  });
}

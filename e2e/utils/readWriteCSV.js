const XLSX = require('xlsx');
var date = new Date();
    var current_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var time = new Date();
    var current_time = time.getHours() + '-' + time.getMinutes() + '-' + time.getSeconds();
    let dateTime = current_date + 'T' + current_time;

    let workbook = XLSX.readFile('WSA_CompetitionImportPlayer.csv');
    let first_sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[first_sheet_name];
    let firstName = worksheet['A2'].v;
    let lastName = worksheet['B2'].v;
    let email = worksheet['F2'].v;

export async function readData()
{
        worksheet['A2'].v = firstName + dateTime;
        worksheet['F2'].v = dateTime + email;
        XLSX.utils.sheet_add_aoa(worksheet, [[firstName + dateTime]], { origin: 'A2' });
        XLSX.utils.sheet_add_aoa(worksheet, [[dateTime + email]], { origin: 'F2' });
        XLSX.writeFile(workbook, 'WSA_CompetitionImportPlayer.csv');  
    
}


export async function originalData()
{
    worksheet['A2'].v = firstName;
    worksheet['F2'].v = email;
    XLSX.utils.sheet_add_aoa(worksheet, [[firstName]], { origin: 'A2' });
        XLSX.utils.sheet_add_aoa(worksheet, [[email]], { origin: 'F2' });
        XLSX.writeFile(workbook, 'WSA_CompetitionImportPlayer.csv');

}
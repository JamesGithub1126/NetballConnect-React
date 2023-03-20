var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

export async function getDataFromDb(sql: string): Promise<any> {
  return new Promise((resolve, reject) => {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
      port: process.env.MYSQL_PORT,
      host: process.env.MYSQL_HOST,
      timeout: 70000,
      connectTimeout: 600000,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    connection.connect(async function (err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    });
    connection.query({ sql: sql }, async function (err, response) {
      let queryResponse = await response;
      resolve(queryResponse);
      connection.end();

      return queryResponse;
    });
  });
}

///////function for returning currency format text number
function currencyFormat(data) {
  var currencyFormatter = require('currency-formatter');
  let value = currencyFormatter.format(data, { code: 'USD' });
  return value;
}

module.exports = { currencyFormat };

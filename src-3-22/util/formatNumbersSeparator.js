// These helpers used to separate big numbers/currencies by ','
export const currencyFormat = num => {
  let currentLocale = Intl.NumberFormat().resolvedOptions().locale;
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(num);
};
export const formatNumbersSeparator = num => {
  if (Number.isInteger(parseFloat(num))) {
    //for integer value
    return new Intl.NumberFormat().format(num);
  } else {
    //for decimal value
    let currentLocale = Intl.NumberFormat().resolvedOptions().locale;
    return new Intl.NumberFormat(currentLocale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  }
};

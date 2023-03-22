import ColorsArray from './colorsArray';

const getColor = color => {
  let checkboxClassName = 'checkbox-ff8237';
  if (color && ColorsArray.indexOf(color) > -1) {
    checkboxClassName = 'checkbox-' + color.replace('#', '');
  } else if (color == '#999999') {
    checkboxClassName = 'checkbox-999999';
  }
  return checkboxClassName;
};
export default getColor;

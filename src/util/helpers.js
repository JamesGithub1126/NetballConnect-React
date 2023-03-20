// import _ from "lodash";

import md5 from 'md5';

const isArrayNotEmpty = array => array !== null && Array.isArray(array) && array.length > 0;

const isNotNullOrEmptyString = word => word !== null && word !== undefined && word.length > 0;

const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e10);

const isNotNullAndUndefined = value => {
  return value !== undefined && value !== null;
};

const deepCopyFunction = inObject => {
  let outObject, value, key;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = typeof value === 'object' && value !== null ? deepCopyFunction(value) : value;
  }

  return outObject;
};

const stringTONumber = value => {
  if (value) {
    return typeof value === 'string' ? Number(value) : value;
  } else {
    return 0;
  }
};

const captializedString = value => {
  if (!value) {
    return '';
  }
  if (value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};

const removeFirstSpace = value => {
  const result = value.trim();
  if (result.length) {
    return value;
  }

  return '';
};

const teamListData = value => {
  if (value == 1) {
    return false;
  } else {
    return true;
  }
};

const teamListDataCheck = (value, isParent, data, compOrgId, team) => {
  if (!!team.deleted_at) {
    return false;
  }
  if (data.entityTypeId) {
    if (data.entityTypeId !== 3) return false;
  }
  if (isParent) {
    if (value == 1 || team?.isPlaceholder) {
      return false;
    } else {
      return true;
    }
  } else {
    if (value == 1 || team?.isPlaceholder) {
      return false;
    } else if (data.competitionOrganisationId == compOrgId) {
      return true;
    } else {
      return false;
    }
  }
};

const regexNumberExpression = number => {
  if (number) {
    return number.replace(/[^\d]/g, '');
  }
  return '';
};

const isImageFormatValid = value => {
  let fileTypes = ['jpg', 'jpeg', 'png', 'webp'];
  return fileTypes.indexOf(value) > -1;
};

export const isImageResolutionValid = (file, resolution) => {
  return new Promise(resolve => {
    const reader = new FileReader();
    //Read the contents of Image File.
    reader.readAsDataURL(file);
    reader.onload = e => {
      //Initiate the JavaScript Image object.
      const image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result;

      //Validate the File Height and Width.
      image.onload = function () {
        const height = this.height;
        const width = this.width;

        const isValid = height <= resolution || width <= resolution;
        resolve(isValid);
      };
    };
  });
};

export const isEmailValid = email => {
  const emailRegexp = new RegExp(
    /^[a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1}([a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1})*[a-zA-Z0-9]@[a-zA-Z0-9][-\.]{0,1}([a-zA-Z][-\.]{0,1})*[a-zA-Z0-9]\.[a-zA-Z0-9]{1,}([\.\-]{0,1}[a-zA-Z]){0,}[a-zA-Z0-9]{0,}$/i,
  );
  return emailRegexp.test(email);
};

function randomKeyGen(keyLength) {
  var i,
    key = '',
    characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  var charactersLength = characters.length;

  for (i = 0; i < keyLength; i++) {
    key += characters.substr(Math.floor(Math.random() * charactersLength + 1), 1);
  }

  return key;
}

const isImageSizeValid = value => {
  let maxImageSize = 2000000;
  return value > maxImageSize ? false : true;
};

const stringTOFloatNumberReg = checkString => {
  return typeof checkString === 'string'
    ? Number(Number(checkString).toFixed(2))
    : Number(Number(checkString).toFixed(2));
};

const formatValue = val => {
  return val === null ? '0.00' : stringTOFloatNumberReg(val).toFixed(2);
};

const feeIsNull = fee => {
  return fee === null || fee === undefined ? 0 : stringTOFloatNumberReg(fee);
};

const isNullOrUndefined = e => {
  return e === null || e === undefined;
};

const isNullOrUndefinedOrEmptyString = e => {
  return e === null || e === undefined || e === '';
};

const arrayMove = (arr, fromIndex, toIndex) => {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
};
const uniq = arr => {
  return [...new Set(arr)];
};
const clone = inObject => {
  if (inObject) {
    return JSON.parse(JSON.stringify(inObject));
  }
  return inObject;
};

const getStartOfDay = date => {
  //helper based on moment
  if (!date) {
    return null;
  }
  return date.startOf('day').utc().format();
};

const getEndOfDay = date => {
  //helper based on moment
  if (!date) {
    return null;
  }
  return date.endOf('day').utc().format();
};

/**
 * type: number || string,
 * multiple: number
 */
const antdColSort = (key, type, multiple = 1) => {
  if (key) {
    if (type === 'string') {
      return {
        compare: (a, b) => a[key].localeCompare(b[key]),
        multiple: multiple,
      };
    } else if (type === 'number') {
      return {
        compare: (a, b) => a[key] - b[key],
        multiple: multiple,
      };
    } else {
      return 0;
    }
  } else return 0;
};

// Note hardcoded tax calculation (supporting AU GST only)
const getTaxPortion = (amount, isTaxable) => {
  return amount * (isTaxable ? 0.1 : 0);
};

// Note hardcoded tax calculation (supporting AU GST only)
const getAmountWithTax = (amount, isTaxable) => {
  return amount * (1 + (isTaxable ? 0.1 : 0));
};

const getTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const isTabletDevice = () => {
  return window.matchMedia('(max-width: 768px)').matches;
};

const GamePositions = [
  { id: 1, name: 'Goal Shooter', shortName: 'GS' },
  { id: 2, name: 'Goal Attack', shortName: 'GA' },
  { id: 3, name: 'Wing Attack', shortName: 'WA' },
  { id: 4, name: 'Centre', shortName: 'C' },
  { id: 5, name: 'Wing Defence', shortName: 'WD' },
  { id: 6, name: 'Goal Defence', shortName: 'GD' },
  { id: 7, name: 'Goal Keeper', shortName: 'GK' },
  { id: 8, name: 'Injured', shortName: 'Injured' },
  { id: 9, name: 'Bench', shortName: 'Bench' },
  { id: 10, name: 'Absent', shortName: 'Absent' },
  { id: 12, name: 'Forward', shortName: 'F' },
  { id: 13, name: 'Midfielder', shortName: 'M' },
  { id: 14, name: 'Defender', shortName: 'D' },
  { id: 15, name: 'Goalkeeper', shortName: 'GK' },
  { id: 16, name: 'Shooting Guard', shortName: 'SG' },
  { id: 17, name: 'Point Guard', shortName: 'PG' },
  { id: 18, name: 'Forward', shortName: 'F' },
  { id: 19, name: 'Center', shortName: 'C' },
  { id: 256, name: 'Unknown', shortName: 'Unknown' },
];

const getGamePositionShortName = name => {
  const pos = GamePositions.find(it => it.name === name);
  return pos ? pos.shortName : name;
};

const convertPlayerPositions = value => {
  if (!isTabletDevice()) {
    return value;
  }
  if (value === 'N/A') {
    return value;
  }
  if (value) {
    const positions = value.split(',');
    return positions.map(i => getGamePositionShortName(i)).join(', ');
  }
  return value;
};

const checkEnvironment = (property, value) => {
  const environment = process.env[property];
  return environment && environment.toString() === value.toString();
};

const isNotNullSetDefault = (arr, defaultValue) => {
  return arr.map(val => (val ? val : defaultValue));
};

const addDecimal = (a, b) => {
  return (a * 100 + b * 100) / 100;
};
const trimSpacesFromUsername = userName => {
  return userName.split(' ').join('');
};
const getOrdinalString = position => {
  if (position % 10 == 1 && position != 11) {
    return position + 'st';
  } else if (position % 10 == 2 && position != 12) {
    return position + 'nd';
  } else if (position % 10 == 3 && position != 13) {
    return position + 'rd';
  } else {
    return position + 'th';
  }
};
const createClearanceApprovalKey = (userId, registrationId, approvingOrgId, competitionId) => {
  const key = md5(`${userId}:${registrationId}:${approvingOrgId}:${competitionId}`);
  return key;
};

export {
  isArrayNotEmpty,
  isNotNullOrEmptyString,
  getAge,
  deepCopyFunction,
  stringTONumber,
  captializedString,
  teamListData,
  regexNumberExpression,
  isImageFormatValid,
  isNotNullAndUndefined,
  randomKeyGen,
  teamListDataCheck,
  isImageSizeValid,
  formatValue,
  feeIsNull,
  isNullOrUndefined,
  removeFirstSpace,
  arrayMove,
  uniq,
  clone,
  getStartOfDay,
  getEndOfDay,
  antdColSort,
  getTaxPortion,
  getAmountWithTax,
  getTimeZone,
  isTabletDevice,
  convertPlayerPositions,
  checkEnvironment,
  isNullOrUndefinedOrEmptyString,
  isNotNullSetDefault,
  addDecimal,
  trimSpacesFromUsername,
  getOrdinalString,
  createClearanceApprovalKey,
};

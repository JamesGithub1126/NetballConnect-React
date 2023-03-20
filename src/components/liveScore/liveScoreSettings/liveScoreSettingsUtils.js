import AppConstants from 'themes/appConstants';
import { isObject } from 'lodash';
import { FLAVOUR } from '../../../util/enums';

export const isTimeoutsEnabled = !!+process.env.REACT_APP_TIMEOUTS_FIELDS_ENABLED;
export const isNetball = AppConstants.flavour === FLAVOUR.Netball;
export const isFootball = AppConstants.flavour === FLAVOUR.Football;
export const isBasketball = AppConstants.flavour === FLAVOUR.Basketball;

export const getArrayFromLength = length => Array.from(Array(length).keys());

export const getOnlyNumbers = value => value.replace(/\D/g, '');

export const timeoutsModes = {
  NONE: 'NONE',
  FOUR_QUARTERS: 'FOUR_QUARTERS',
  TWO_HALVES: 'TWO_HALVES',
};

export const getTimeoutsData = ({ timeouts, timeoutsToHalves, timeoutsToQuarters }) => {
  let data = null;
  switch (timeouts) {
    case timeoutsModes.FOUR_QUARTERS:
      data = {
        type: timeouts,
        numberOfTimeouts: timeoutsToQuarters,
      };
      break;
    case timeoutsModes.TWO_HALVES:
      data = {
        type: timeouts,
        numberOfTimeouts: timeoutsToHalves,
      };
      break;
    case false:
      data = {
        type: timeoutsModes.NONE,
      };
      break;
    default:
      break;
  }

  return data;
};

export const getTimeoutsDetailsData = timeoutDetails => {
  let returnData = {
    timeouts: null,
    timeoutsToQuarters: [],
    timeoutsToHalves: [],
  };

  if (isObject(timeoutDetails)) {
    switch (timeoutDetails.type) {
      case timeoutsModes.FOUR_QUARTERS:
        returnData = {
          timeouts: timeoutDetails.type,
          timeoutsToQuarters: timeoutDetails.numberOfTimeouts,
        };
        break;
      case timeoutsModes.TWO_HALVES:
        returnData = {
          timeouts: timeoutDetails.type,
          timeoutsToHalves: timeoutDetails.numberOfTimeouts,
        };
        break;
      case timeoutsModes.NONE:
        returnData = {
          timeouts: false,
        };
        break;
      default:
        break;
    }
  }

  return returnData;
};

export const timeoutsOptions = [
  {
    radioTitle: AppConstants.applyToQuarters,
    stateKey: 'timeoutsToQuarters',
    key: timeoutsModes.FOUR_QUARTERS,
    fieldsLength: 4,
    optionTitle: 'Quarter',
  },
  {
    radioTitle: AppConstants.applyToHalves,
    stateKey: 'timeoutsToHalves',
    key: timeoutsModes.TWO_HALVES,
    fieldsLength: 2,
    optionTitle: 'Half',
  },
];

export const getUmpireSequence = () => {
  let sequences = [
    { value: 1, name: '1' },
    { value: 2, name: '2' },
  ];
  if (isBasketball || isFootball) {
    sequences = [
      { value: 1, name: '1' },
      { value: 2, name: '2' },
      { value: 3, name: '3' },
      { value: 4, name: '4' },
    ];
  }
  return sequences;
};
export const getMatchOfficialSequence = () => {
  let sequences = [
    { value: 0, name: '0' },
    { value: 1, name: '1' },
    { value: 2, name: '2' },
    { value: 3, name: '3' },
  ];
  return sequences;
};

export const showLiveScoringOption =
  process.env.REACT_APP_LIVE_SCORING_ENABLED === 'true' ? true : false;

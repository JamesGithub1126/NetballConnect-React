import AppConstants from 'themes/appConstants';
import { isBasketball, isFootball, isNetball } from '../liveScoreSettingsUtils';

const applyTo1 = isBasketball
  ? [{ label: AppConstants.recordGoalAttempts, value: 'recordGoalAttempts' }]
  : isNetball
  ? [
      { label: AppConstants.positionTracking, value: 'positionTracking' },
      { label: AppConstants.recordGoalAttempts, value: 'recordGoalAttempts' },
    ]
  : [
      { label: AppConstants.recordGoalAttempts, value: 'recordGoalAttempts' },
      { label: AppConstants.enhancedStatistics, value: 'enhancedStatistics' },
      { label: AppConstants.positionTracking, value: 'positionTracking' },
    ];

const applyTo2 = [{ label: AppConstants.incidentsEnabled, value: 'incidentsEnabled' }];
if (+process.env.REACT_APP_BALL_POSSESSION === 1) {
  applyTo2.unshift({
    label: AppConstants.centrePassEnabled,
    value: 'centrePassEnabled',
  });
}
isNetball &&
  applyTo2.push({
    label: AppConstants.gameTimeTracking,
    value: 'gameTimeTrackingType',
    helpMsg: isNetball ? AppConstants.gameTimeTrackingContextual : null,
  });

const trackFullPeriod = [];
if (isFootball) {
  trackFullPeriod.unshift(
    { value: 0, name: AppConstants.interchange },
    { value: 1, name: AppConstants.substitution },
  );
} else {
  trackFullPeriod.unshift(
    { value: 0, name: AppConstants.trackFullPeriod },
    { value: 1, name: AppConstants.trackEndofPeriod },
  );
}

const mediumSelectStyles = {
  width: '100%',
  paddingRight: 1,
  minWidth: 260,
  maxWidth: 300,
};

const extraTimeTypeValues = {
  single: 'SINGLE_PERIOD',
  halves: 'TWO_HALVES',
  quarters: 'FOUR_QUARTERS',
};
const extraTimeTypes = [
  { label: AppConstants.singlePeriod, value: extraTimeTypeValues.single },
  { label: AppConstants.halves, value: extraTimeTypeValues.halves },
  { label: AppConstants.quarters, value: extraTimeTypeValues.quarters },
];

const buzzerCheckboxes = [
  {
    key: 'buzzerEnabled',
    label: AppConstants.buzzer,
  },
  {
    key: 'warningBuzzerEnabled',
    label: AppConstants.turnOff_30Second,
  },
];

let positionTrackReportFilter = [
  { value: 'PERIOD', text: 'Period' },
  { value: 'PERCENT', text: '%' },
  { value: 'MINUTE', text: 'Minutes' },
];

let gameTimeListFilter = [
  { value: AppConstants.period, text: AppConstants.periods },
  { value: AppConstants.minute, text: AppConstants.minutes },
  { value: AppConstants.matches, text: AppConstants.totalGames },
];

if (isBasketball) {
  positionTrackReportFilter.shift();
  gameTimeListFilter.shift();
}

export {
  applyTo1,
  applyTo2,
  trackFullPeriod,
  mediumSelectStyles,
  extraTimeTypeValues,
  extraTimeTypes,
  buzzerCheckboxes,
  positionTrackReportFilter,
  gameTimeListFilter,
};

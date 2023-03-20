import ApiConstants from '../../../themes/apiConstants';

function getUmpirePaymentSettings(data) {
  const action = {
    type: ApiConstants.API_GET_UMPIRE_PAYMENT_SETTINGS_LOAD,
    data,
  };

  return action;
}

function saveUmpirePaymentSettings(data) {
  const action = {
    type: ApiConstants.API_SAVE_UMPIRE_PAYMENT_SETTINGS_LOAD,
    data,
  };

  return action;
}

export { getUmpirePaymentSettings, saveUmpirePaymentSettings };

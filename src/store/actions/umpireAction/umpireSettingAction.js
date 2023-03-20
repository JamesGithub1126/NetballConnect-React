import ApiConstants from '../../../themes/apiConstants';

function getUmpireAllocationSettings(data) {
  const action = {
    type: ApiConstants.API_GET_UMPIRE_ALLOCATION_SETTINGS_LOAD,
    data,
  };

  return action;
}

function saveUmpireAllocationSettings(data) {
  const action = {
    type: ApiConstants.API_SAVE_UMPIRE_ALLOCATION_SETTINGS_LOAD,
    data,
  };

  return action;
}

export { getUmpireAllocationSettings, saveUmpireAllocationSettings };

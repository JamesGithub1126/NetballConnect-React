import ApiConstants from '../../../themes/apiConstants';

export const getLiveScoreSettingInitiate = (data, loadRef = true) => {
  return {
    type: ApiConstants.LiveScore_SETTING_VIEW_INITITAE,
    payload: data,
    loadRef,
  };
};
export const getLiveScoreSettingSuccess = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_VIEW_SUCCESS,
    payload: data,
  };
};
export const getLiveScoreSettingError = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_VIEW_ERROR,
    payload: data,
  };
};
export const onChangeSettingForm = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_CHANGE_FORM,
    payload: data,
  };
};

export const updateMatchOfficialSetting = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_MATCH_OFFICIAL,
    payload: data,
  }
};

export const onChangeBestAndFairestPointSetting = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_BEST_FAIREST_POINTS,
    payload: data,
  };
};

export const settingDataPostInitiate = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_DATA_POST_INITATE,
    payload: data,
  };
};
export const settingDataPostSuccess = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_DATA_POST_SUCCESS,
    payload: data,
  };
};
export const settingDataPostError = data => {
  return {
    type: ApiConstants.LiveScore_SETTING_DATA_POST_ERROR,
    payload: data,
  };
};
export const clearLiveScoreSetting = () => {
  return {
    type: ApiConstants.LiveScore_CLEAR_SETTING,
  };
};
export const searchVenueList = data => {
  return {
    type: ApiConstants.LIVESCORE_SEARCH__SETTING,
    payload: data,
  };
};
export const clearFilter = () => {
  return {
    type: ApiConstants.CLEAR_FILTER_SEARCH,
  };
};

export const settingRegInvitees = () => {
  return {
    type: ApiConstants.SETTING_REGISTRATION_INVITEES_LOAD,
  };
};

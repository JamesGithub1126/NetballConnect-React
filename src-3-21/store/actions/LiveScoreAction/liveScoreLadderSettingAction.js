import ApiConstants from '../../../themes/apiConstants';

function ladderSettingGetMatchResultAction() {
  const action = {
    type: ApiConstants.API_LADDER_SETTING_MATCH_RESULT_LOAD,
  };
  return action;
}

function ladderSettingGetDATA(competitionId) {
  const action = {
    type: ApiConstants.API_LADDER_SETTING_GET_DATA_LOAD,
    competitionId,
  };
  return action;
}

function updateLadderSetting(data, index, key, subIndex, subKey) {
  const action = {
    type: ApiConstants.UPDATE_LADDER_SETTING,
    data,
    key,
    index,
    subIndex,
    subKey,
  };
  return action;
}

function ladderSettingPostDATA(postData, canUpdatePastPoints) {
  const action = {
    type: ApiConstants.API_LADDER_SETTING_POST_DATA_LOAD,
    postData,
    canUpdatePastPoints,
  };
  return action;
}

export {
  ladderSettingGetMatchResultAction,
  ladderSettingGetDATA,
  updateLadderSetting,
  ladderSettingPostDATA,
};

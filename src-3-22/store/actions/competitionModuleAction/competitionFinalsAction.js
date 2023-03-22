import ApiConstants from '../../../themes/apiConstants';

/* Get Competion Finals */
function getCompetitionFinalsAction(payload) {
  const action = {
    type: ApiConstants.API_GET_COMPETITION_FINALS_LOAD,
    payload,
  };
  return action;
}

/* Save Competion Finals */
function saveCompetitionFinalsAction(payload) {
  const action = {
    type: ApiConstants.API_SAVE_COMPETITION_FINALS_LOAD,
    payload,
  };
  return action;
}

function updateCompetitionFinalsAction(data, key, index, subIndex) {
  const action = {
    type: ApiConstants.UPDATE_COMPETITION_FINALS,
    updatedData: data,
    key,
    index,
    subIndex: subIndex,
  };
  return action;
}

/* getTemplateDownloadAction */
function getTemplateDownloadAction(payload) {
  const action = {
    type: ApiConstants.API_GET_TEMPLATE_DOWNLOAD_LOAD,
    payload,
  };
  return action;
}

export {
  getCompetitionFinalsAction,
  saveCompetitionFinalsAction,
  updateCompetitionFinalsAction,
  getTemplateDownloadAction,
};

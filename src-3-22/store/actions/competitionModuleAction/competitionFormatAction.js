import ApiConstants from '../../../themes/apiConstants';

/* Get Competion Format */
function getCompetitionFormatAction(payload) {
  const action = {
    type: ApiConstants.API_GET_COMPETITION_FORMAT_LOAD,
    payload,
  };
  return action;
}

/* Save Competion Format */
function saveCompetitionFormatAction(payload) {
  const action = {
    type: ApiConstants.API_SAVE_COMPETITION_FORMAT_LOAD,
    payload,
  };
  return action;
}

function updateCompetitionFormatAction(data, key) {
  const action = {
    type: ApiConstants.UPDATE_COMPETITION_FORMAT,
    updatedData: data,
    key,
  };
  return action;
}

export { getCompetitionFormatAction, saveCompetitionFormatAction, updateCompetitionFormatAction };

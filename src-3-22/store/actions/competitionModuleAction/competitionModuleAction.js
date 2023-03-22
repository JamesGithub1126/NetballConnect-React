import ApiConstants from '../../../themes/apiConstants';

function getYearAction() {
  const action = {
    type: ApiConstants.API_GET_YEAR_LOAD,
  };

  return action;
}

function generateDrawAction(payload) {
  const action = {
    type: ApiConstants.API_GENERATE_DRAW_LOAD,
    payload,
  };

  return action;
}

export { getYearAction, generateDrawAction };

import ApiConstants from 'themes/apiConstants';

export const getPlayerList = () => {};

export const setPlayerList = payload => {
  return {
    type: ApiConstants.API_MOVE_PLAYER_SET_PLAYER_LIST,
    payload,
  };
};

export const getCompetitions = payload => {
  return {
    type: ApiConstants.API_GET_COMPETITION_LIST_LOAD,
    payload,
  };
};
export const getAffiliates = payload => {
  return {
    type: ApiConstants.API_GET_AFFILIATE_LIST_LOAD,
    payload,
  };
};
export const getDivisions = payload => {
  return {
    type: ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD,
    payload,
  };
};

export const setFinalPlayersList = payload => {
  return {
    type: ApiConstants.API_SET_FINAL_PLAYER_LIST,
    payload,
  };
};

export const moveModalButtonClicked = payload => {
  return {
    type: ApiConstants.API_MOVE_PLAYER_LOAD,
    payload,
  };
};

export const toggleModalVisibility = payload => {
  return {
    type: ApiConstants.MOVE_PLAYER_TOGGLE_MODAL_VISIBILITY,
    payload,
  };
};

export const toggleAgeGroupVisibility = payload => {
  return {
    type: ApiConstants.API_MOVE_PLAYER_UPDATE_PLACEHOLDERROLE,
    payload,
  };
};

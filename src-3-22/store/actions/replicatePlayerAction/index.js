import ApiConstants from 'themes/apiConstants';

export const updateModalVisibility = (payload) => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_MODAL_VISIBILITY,
    payload,
  }
};

export const getCompetitions = payload => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_LOAD,
    payload,
  };
};

export const getAffiliates = payload => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_LOAD,
    payload,
  };
};

export const getDivisions = payload => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_LOAD,
    payload,
  };
};

export const updateSelection = (key, value) => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_UPDATE_SELECTION,
    key,
    value,
  };
}

export const replicatePlayersAction = payload => {
  return {
    type: ApiConstants.API_REPLICATE_PLAYER_SUBMIT_LOAD,
    payload,
  };
};

export const toggleModalVisibility = payload => {
  return {
    type: ApiConstants.REPLICATEPLAYER_MOVE_PLAYER_TOGGLE_MODAL_VISIBILITY,
    payload,
  };
};

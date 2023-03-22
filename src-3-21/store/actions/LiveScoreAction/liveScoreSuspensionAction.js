import ApiConstants from '../../../themes/apiConstants';

export const liveScoreSuspensionListAction = payload => {
  return {
    type: ApiConstants.API_SUSPENSION_LIST_LOAD,
    payload,
  };
};

export const liveScoreSuspensionTypeListAction = () => {
  return {
    type: ApiConstants.API_SUSPENSION_TYPE_LIST_LOAD,
  };
};

export const liveScoreSuspensionSetFilterAction = filter => {
  return {
    type: ApiConstants.API_SUSPENSION_SET_FILTER,
    payload: filter,
  };
};

export const liveScoreSuspensionUpdateFilter = (key, value) => {
  return {
    type: ApiConstants.API_SUSPENSION_UPDATE_FILTER,
    payload: { key, value },
  };
};

export const liveScoreSuspensionMatchesAction = (payload) => {
  return {
    type: ApiConstants.API_SUSPENSION_MATCHES_LIST_LOAD,
    payload,
  };
};


export const liveScoreSuspensionSetSelectedAction = (suspension) => {
  return {
    type: ApiConstants.API_SUSPENSION_SET_SELECTED,
    payload: suspension,
  };
};

export const liveScoreSetSuspendedMatchServedStateAction = (matchId, checked) => {
  return {
    type: ApiConstants.API_SUSPENSION_SET_MATCH_SERVED_STATE,
    payload: { matchId, checked },
  };
};

export const liveScoreSetSuspensionSelectedMatchesAction = (selectedMatcheIds) => {
  return {
    type: ApiConstants.API_SUSPENSION_SETMATCH_SELECTED_STATE,
    payload: selectedMatcheIds,
  };
};

export const liveScoreUpdateSuspendedMatchesAction = (payload) => {
  return {
    type: ApiConstants.API_SUSPENSION_UPDATE_SUSPENDED_MATCHES_LOAD,
    payload,
  };
};

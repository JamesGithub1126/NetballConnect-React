import ApiConstants from '../../../themes/apiConstants';

function liveScoreUpdateVenueChange(data, key) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_UPDATE_VENUE_CHANGE,
    data,
    key,
  };

  return action;
}

function searchCourtList(data, key) {
  const action = {
    type: ApiConstants.API_SEARCH_COURT_LIST,
    data,
    key,
  };
  return action;
}

function clearFilter(key) {
  const action = {
    type: ApiConstants.CLEAR_FILTER_SEARCH,
    key,
  };
  return action;
}

function onChangeVenueSaveAction(data, start, end, compId) {
  const action = {
    type: ApiConstants.API_SAVE_VENUE_CHANGE_LOAD,
    data,
    start,
    end,
    compId,
  };
  return action;
}

export { liveScoreUpdateVenueChange, searchCourtList, clearFilter, onChangeVenueSaveAction };

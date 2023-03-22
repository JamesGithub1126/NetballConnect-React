import ApiConstants from '../../../themes/apiConstants';

function umpireRosterListAction(payload) {
  return {
    type: ApiConstants.API_UMPIRE_ROSTER_LIST_LOAD,
    payload,
  };
}

function umpireSimpleRoundListAction(competitionId, divisionId) {
  const action = {
    type: ApiConstants.API_UMPIRE_SIMPLE_ROUND_LIST_LOAD,
    payload: {
      competitionId,
      divisionId,
    },
  };
  return action;
}

function umpireRosterOnActionClick(data) {
  const action = {
    type: ApiConstants.API_UMPIRE_ROSTER_ACTION_CLICK_LOAD,
    data,
  };
  return action;
}

function setPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_UMPIRE_ROSTER_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_UMPIRE_ROSTER_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  umpireRosterListAction,
  umpireSimpleRoundListAction,
  umpireRosterOnActionClick,
  setPageSizeAction,
  setPageNumberAction,
};

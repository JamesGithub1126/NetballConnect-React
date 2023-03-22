import ApiConstants from '../../../themes/apiConstants';

//////get the umpire assign list
function getAssignUmpireListAction(competitionId, venueId, body, userId, showRosterAvailability = false) {
  const action = {
    type: ApiConstants.API_GET_ASSIGN_UMPIRE_LIST_LOAD,
    competitionId,
    venueId,
    body,
    userId,
    showRosterAvailability,
  };
  return action;
}

//////////assign umpire to a match
function assignUmpireAction(payload, index, umpireKey, rosterLocked, sameUmpire) {
  const action = {
    type: ApiConstants.API_ASSIGN_UMPIRE_FROM_LIST_LOAD,
    payload,
    index,
    umpireKey,
    rosterLocked,
    sameUmpire,
  };
  return action;
}

////unassign umpire from the match(delete)
function unassignUmpireAction(rosterId, index, umpireKey, rosterLocked) {
  const action = {
    type: ApiConstants.API_UNASSIGN_UMPIRE_FROM_LIST_LOAD,
    rosterId,
    index,
    umpireKey,
    rosterLocked,
  };
  return action;
}

function setAssignUmpireListPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_ASSIGN_UMPIRE_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setAssignUmpireListPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_ASSIGN_UMPIRE_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  getAssignUmpireListAction,
  assignUmpireAction,
  unassignUmpireAction,
  setAssignUmpireListPageSizeAction,
  setAssignUmpireListPageNumberAction,
};

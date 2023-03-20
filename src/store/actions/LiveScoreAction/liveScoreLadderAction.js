import ApiConstants from '../../../themes/apiConstants';

// function liveScoreLaddersDivisionAction(competitionID) {
//     const action = {
//         type: ApiConstants.API_LIVE_SCORE_LADDERS_DIVISION_LOAD,
//         competitionID:competitionID
//     };
//     return action;

// }

function liveScoreLaddersListAction(competitionID, divisionID, compKey, isFullLadder) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_LADDERS_LIST_LOAD,

    competitionID: competitionID,
    divisionID: divisionID,
    compKey: compKey,
    isFullLadder: isFullLadder,
  };
  return action;
}

function updateLadderSetting(data) {
  const action = {
    type: ApiConstants.UPDATE_LADDER_ADJUSTMENT,
    data,
  };
  return action;
}

function ladderAdjustmentPostData(data) {
  const action = {
    type: ApiConstants.API_LADDER_ADJUSTMENT_POST_LOAD,
    data,
  };
  return action;
}

function ladderAdjustmentGetData(data) {
  const action = {
    type: ApiConstants.API_LADDER_ADJUSTMENT_GET_LOAD,
    data,
  };
  return action;
}

function resetLadderAction(payload) {
  return {
    type: ApiConstants.API_LIVE_SCORE_RESET_LADDER_LOAD,
    payload: payload,
  };
}

export {
  liveScoreLaddersListAction,
  updateLadderSetting,
  ladderAdjustmentPostData,
  ladderAdjustmentGetData,
  resetLadderAction,
};

import ApiConstants from '../../../themes/apiConstants';

//Devision action
function getliveScoreDivisions(competitionID) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_DIVISION_LOAD,
    competitionID: competitionID,
  };

  return action;
}

export { getliveScoreDivisions };

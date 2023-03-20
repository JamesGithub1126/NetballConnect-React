import ApiConstants from '../../../themes/apiConstants';

function getUmpireTeams(data) {
  const action = {
    type: ApiConstants.GET_UMPIRE_TEAMS_LOAD,
    data,
  };
  return action;
}

export { getUmpireTeams };

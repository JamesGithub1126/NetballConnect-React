import ApiConstants from '../../../themes/apiConstants';

function fixtureCompetitionListAction(orgId) {
  const action = {
    type: ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_LOAD,
    orgId,
  };

  return action;
}

export { fixtureCompetitionListAction };

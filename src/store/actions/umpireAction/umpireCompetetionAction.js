import ApiConstants from '../../../themes/apiConstants';

function umpireCompetitionListAction(
  data,
  yearId,
  orgId,
  recordUmpireTypes,
  sortOrder,
  sortBy,
  isumpiredCompsOnly,
  isParticipateInCompetition,
) {
  const action = {
    type: ApiConstants.API_UMPIRE_COMPETITION_LIST_LOAD,
    orgId,
    data,
    yearId,
    recordUmpireTypes,
    isumpiredCompsOnly,
    isParticipateInCompetition,
  };
  return action;
}

function umpireCompetitionDetailAction(id) {
  const action = {
    type: ApiConstants.API_UMPIRE_COMPETITION_Data_LOAD,
    id,
  };
  return action;
}

export { umpireCompetitionListAction, umpireCompetitionDetailAction };

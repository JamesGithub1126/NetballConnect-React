import ApiConstants from 'themes/apiConstants';

function innerHorizontalCompetitionListAction(organisationId, yearRefId, compData) {
  return {
    type: ApiConstants.API_INNER_HORIZONTAL_COMPETITION_LIST_LOAD,
    organisationId,
    yearRefId,
    compData,
  };
}

function updateInnerHorizontalData() {
  return {
    type: ApiConstants.API_UPDATE_INNER_HORIZONTAL,
  };
}

function initializeCompData() {
  return {
    type: ApiConstants.API_INITIALIZE_COMP_DATA,
  };
}

export { innerHorizontalCompetitionListAction, updateInnerHorizontalData, initializeCompData };

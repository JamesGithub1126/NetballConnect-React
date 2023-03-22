import ApiConstants from '../../../themes/apiConstants';

const liveScoreMatchSheetPrintAction = (
  competitionId,
  divisionId,
  teamId,
  templateType,
  roundName,
  venueId,
  homeCompetitionOrganisationId,
  homeCompetitionOrganisationName,
) => {
  const action = {
    type: ApiConstants.API_MATCH_SHEET_PRINT_LOAD,
    competitionId,
    divisionId,
    teamId,
    templateType,
    roundName,
    venueId,
    homeCompetitionOrganisationId,
    homeCompetitionOrganisationName,
  };

  return action;
};

const liveScoreMatchSheetDownloadsAction = competitionId => {
  const action = {
    type: ApiConstants.API_MATCH_SHEET_DOWNLOADS_LOAD,
    competitionId,
  };

  return action;
};

const liveScoreBlankMatchSheetTemplatePrintAction = (competitionId, templateType) => {
  const action = {
    type: ApiConstants.API_BLANK_MATCH_SHEET_PRINT_LOAD,
    competitionId,
    templateType,
  };

  return action;
};

export {
  liveScoreMatchSheetPrintAction,
  liveScoreMatchSheetDownloadsAction,
  liveScoreBlankMatchSheetTemplatePrintAction,
};

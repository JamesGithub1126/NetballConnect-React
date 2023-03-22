import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  printLoad: false,
  onTeamLoad: false,
  onDivisionLoad: false,
  error: null,
  result: null,
  status: 0,
  liveScoreDivisionList: [],
  allTeamData: [],
  isLoaderActive: false,
  allDivisionData: [],
  matchSheetDownloads: [],
  allVenuesData: [],
  allAffiliatesData: [],
};

function liveScoreMatchSheetState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_LOAD:
      return {
        ...state,
        isLoaderActive: false,
      };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_LOAD:
      return { ...state, onDivisionLoad: true };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS:
      let divisionArray = JSON.parse(JSON.stringify(action.result));
      state.allDivisionData = JSON.parse(JSON.stringify(action.result));
      let divisionObject = {
        name: 'All',
        id: null,
      };

      state.allDivisionData.unshift(divisionObject);
      state.isLoaderActive = false;
      return {
        ...state,
        onDivisionLoad: false,
        liveScoreDivisionList: divisionArray,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_TEAM_LOAD:
      state.allTeamData = [
        {
          name: 'All Teams',
          id: null,
        },
      ];
      return { ...state, onTeamLoad: true };

    case ApiConstants.API_LIVE_SCORE_TEAM_SUCCESS:
      let teamsArray = JSON.parse(JSON.stringify(action.result));
      state.allTeamData = JSON.parse(JSON.stringify(action.result));
      let teamObject = {
        name: 'All Teams',
        id: null,
      };

      state.allTeamData.unshift(teamObject);
      state.isLoaderActive = false;
      return {
        ...state,
        onTeamLoad: false,
        teamResult: teamsArray,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_SHEET_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        printLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_MATCH_SHEET_ERROR:
      return {
        ...state,
        onLoad: false,
        printLoad: false,
      };

    case ApiConstants.API_MATCH_SHEET_PRINT_LOAD:
      return { ...state, printLoad: true };

    case ApiConstants.API_MATCH_SHEET_PRINT_SUCCESS:
      return {
        ...state,
        printLoad: false,
        status: action.status,
      };

    case ApiConstants.API_MATCH_SHEET_DOWNLOADS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_MATCH_SHEET_DOWNLOADS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        matchSheetDownloads: action.matchSheetDownloads,
        status: action.status,
      };

    // getCompetitionVenuesList for the Match Sheets
    case ApiConstants.API_UMPIRE_COMPETITION_Data_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_UMPIRE_COMPETITION_Data_SUCCESS:
      return {
        ...state,
        onLoad: false,
        allVenuesData: JSON.parse(JSON.stringify(action.result.competitionVenues)),
      };

    // getCompetitionAffiliatesList for the Match Sheets
    case ApiConstants.API_LIVE_SCORE_CLUB_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVE_SCORE_CLUB_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
          allAffiliatesData: JSON.parse(JSON.stringify(action.result)),
      };

    default:
      return state;
  }
}

export default liveScoreMatchSheetState;

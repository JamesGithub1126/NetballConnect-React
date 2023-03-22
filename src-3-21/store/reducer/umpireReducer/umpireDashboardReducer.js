import ApiConstants from 'themes/apiConstants';
import { MODAL_CLOSE_ACTION } from 'util/enums';
import * as _ from 'lodash';
const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  umpireVenueList: [],
  onVenueLoad: false,
  umpireDivisionList: [],
  onDivisionLoad: false,
  competitionOrganisationsList: [],
  umpireDashboardList: [],
  totalPages: 1,
  umpireRoundList: [],
  allRoundList: [],
  allRoundIds: null,
  currentPage: 1,
  pageSize: 10,
  umpireDashboardListActionObject: null,
  onPublish: false,
  publishModalClose: MODAL_CLOSE_ACTION.None,
  allCompRoundList: [],
  competitionData: {},
};

function getHighestSequence(roundArr) {
  let sequence = [];
  for (let i in roundArr) {
    sequence.push(roundArr[i].sequence);
  }
  return Math.max.apply(null, sequence);
}

// Remove duplicate rounds names
function removeDuplicateValues(array) {
  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

// get all same round name
function getAllRoundName(data, roundId) {
  let getRoundName = data.find(({ id }) => id === roundId).name;
  return data.filter(x => x.name === getRoundName).map(x => x.id);
}

function umpireDashboardState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_UMPIRE_YEAR_CHANGED:
      return {
        ...state,
        umpireDashboardList: [],
        umpireVenueList: [],
        umpireDivisionList: [],
        allRoundList: [],
      };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        umpireDashboardListActionObject: action.data,
        publishModalClose: MODAL_CLOSE_ACTION.None,
      };

    case ApiConstants.API_LIVE_SCORE_RESET_MATCH_LIST:
      return { ...state, onLoad: true, umpireDashboardList: [], totalPages: 1, currentPage: 1 };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        umpireDashboardList: action.result.results,
        totalPages: action.result.page.totalCount,
        currentPage: action.result.page.currentPage,
        status: action.status,
      };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_VENUE_LIST_LOAD:
      return { ...state, onVenueLoad: true };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_VENUE_LIST_SUCCESS:
      return {
        ...state,
        onVenueLoad: false,
        umpireVenueList: action.result,
        status: action.status,
      };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_DIVISION_LIST_LOAD:
      return { ...state, onDivisionLoad: true };

    case ApiConstants.API_GET_UMPIRE_DASHBOARD_DIVISION_LIST_SUCCESS:
      return {
        ...state,
        onDivisionLoad: false,
        umpireDivisionList: action.result,
        status: action.status,
      };
    case ApiConstants.API_GET_UMPIRE_COMPETITION_ORGANISATIONS_LIST_SUCCESS:
      return {
        ...state,
        competitionOrganisationsList: action.result,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_UMPIRE_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        importResult: action.result,
      };

    case ApiConstants.API_UMPIRE_IMPORT_RESET:
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.API_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        onPublish: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_ERROR:
      return {
        ...state,
        onLoad: false,
        onPublish: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_UMPIRE_ROUND_LIST_LOAD:
      return { ...state, roundLoad: true };

    case ApiConstants.API_UMPIRE_ROUND_LIST_SUCCESS:
      let sequenceValue = getHighestSequence(action.result);
      state.highestSequence = sequenceValue;
      let roundListArray = action.result;
      roundListArray.sort((a, b) => Number(a.sequence) - Number(b.sequence));
      state.umpireRoundList = removeDuplicateValues(roundListArray);
      let allCompRoundList = state.allCompRoundList;
      if (action.isAllRound) {
        allCompRoundList = [...roundListArray];
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        allRoundList: action.result,
        roundLoad: false,
        allCompRoundList,
      };

    case ApiConstants.UPDATE_UMPIRE_DASHBOARD:
      let allRoundName = getAllRoundName(state.allRoundList, action.data);
      state.allRoundIds = allRoundName;
      return { ...state };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.umpireDashboardListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_UMPIRE_DASHBOARD_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_UMPIRE_DASHBOARD_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage: action.pageNum,
      };

    case ApiConstants.API_PUBLISH_UMPIRE_ALLOCATION_LOAD:
      return { ...state, onPublish: true, publishModalClose: MODAL_CLOSE_ACTION.None };

    case ApiConstants.API_PUBLISH_UMPIRE_ALLOCATION_SUCCESS:
      return {
        ...state,
        onPublish: false,
        publishModalClose: action.result.reload
          ? MODAL_CLOSE_ACTION.CloseAndReload
          : MODAL_CLOSE_ACTION.Close,
      };

    case ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_SUCCESS:
      let updatedCompetitionData = state.competitionData;
      updatedCompetitionData.contact = JSON.parse(JSON.stringify(action.result.contact));
      return {
        ...state,
        onLoad: false,
        competitionData: updatedCompetitionData,
      };

    case ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_DATA_GET_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LIVE_SCORE_SAVE_BLOCK_DECLINE_DATA_GET_LOAD_SUCCESS:
      state.competitionData.contact = JSON.parse(JSON.stringify(action.result.contact));
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_CLEAR_BLOCK_DECLINE:
      state.competitionData.contact = [];
      return {
        ...state,
        onload: false,
      };
    case ApiConstants.API_UMPIRE_COMPETITION_Data_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_UMPIRE_COMPETITION_Data_SUCCESS:
      return {
        ...state,
        onLoad: false,
        competitionData: JSON.parse(JSON.stringify(action.result)),
      };

    default:
      return state;
  }
}

export default umpireDashboardState;

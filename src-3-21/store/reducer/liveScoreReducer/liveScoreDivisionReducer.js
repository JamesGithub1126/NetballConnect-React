import ApiConstants from 'themes/apiConstants';
import { getTimeoutsDetailsData } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';

const divisionObj = {
  divisionName: '',
  gradeName: '',
};

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  liveScoreDivisionList: [],
  divisionName: '',
  gradeName: '',
  name: '',
  divisionData: divisionObj,
  mainDivisionList: [],
  totalCount: 1,
  currentPage: 1,
  pageSize: 10,
  positionTracking: 'null',
  recordGoalAttempts: 'null',
  divisionListActionObject: null,
  timeouts: null,
  timeoutsToQuarters: [],
  timeoutsToHalves: [],
  gameTimeTracking: 'null',
};

function liveScoreDivisionState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        liveScoreDivisionList: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_DIVISION:
      if (action.key === 'divisionName') {
        state.divisionName = action.data;
      } else if (action.key === 'gradeName') {
        state.gradeName = action.data;
      } else if (action.key === 'name') {
        state.name = action.data;
      } else if (action.key === 'isEditDivision') {
        const { timeoutDetails } = action.data;
        const timeoutsData = getTimeoutsDetailsData(timeoutDetails);
        const { competition } = action.data;
        state.timeouts = timeoutsData.timeouts;
        state.timeoutsToQuarters = timeoutsData.timeoutsToQuarters;
        state.timeoutsToHalves = timeoutsData.timeoutsToHalves;
        state.divisionName = action.data.divisionName;
        state.gradeName = action.data.grade;
        state.name = action.data.name;
        state.positionTracking = action.data.positionTracking;
        state.recordGoalAttempts = action.data.recordGoalAttempts;
        if (action.data.gameTimeTracking === true) {
          state.gameTimeTracking = 1;
        } else if (action.data.gameTimeTracking === false) {
          state.gameTimeTracking = 0;
        } else {
          state.gameTimeTracking = null;
        }
      } else if (action.key === 'isAddDivision') {
        state.divisionData = divisionObj;
        state.positionTracking = null;
      } else if (action.key === 'positionTracking') {
        state.positionTracking = action.data;
      } else if (action.key === 'recordGoalAttempts') {
        state.recordGoalAttempts = action.data;
      } else if (action.key === 'gameTimeTracking') {
        if (action.data === 1) {
          state.gameTimeTracking = true;
        } else if (action.data === 0) {
          state.gameTimeTracking = false;
        } else {
          state.gameTimeTracking = null;
        }
        // state.gameTimeTracking = action.data;
      } else if (action.key === 'timeouts') {
        state.timeouts = action.data;
      } else if (action.key === 'timeoutsToQuarters') {
        state.timeoutsToQuarters = action.data;
      } else if (action.key === 'timeoutsToHalves') {
        state.timeoutsToHalves = action.data;
      }
      return {
        ...state,
        onLoad: false,
        state: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_CREATE_DIVISION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_CREATE_DIVISION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_DELETE_DIVISION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_DELETE_DIVISION_SUCCESS:
      return { ...state, onLoad: false };

    case ApiConstants.API_LIVE_SCORE_DIVISION_IMPORT_LOAD:
      return {
        ...state,
        onLoad: true,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_DIVISION_IMPORT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        importResult: action.result,
      };

    case ApiConstants.API_LIVE_SCORE_DIVISION_IMPORT_RESET:
      return {
        ...state,
        importResult: null,
      };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_FAIL:
      return { ...state, onLoad: false, printLoad: false };

    case ApiConstants.API_LIVE_SCORE_ONLY_DIVISION_ERROR:
      return {
        ...state,
        onLoad: false,
        printLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_MAIN_DIVISION_LIST_LOAD:
      return { ...state, onLoad: true, divisionListActionObject: action };

    case ApiConstants.API_LIVE_SCORE_MAIN_DIVISION_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        mainDivisionList: action.result.divisions,
        totalCount: action.result.page.totalCount,
        currentPage: action.result.page.currentPage,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.divisionListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_LIVE_SCORE_DIVISION_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_LIVE_SCORE_DIVISION_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default liveScoreDivisionState;

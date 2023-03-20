import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  onLoadRound: false,
  error: null,
  result: [],
  status: 0,
  umpireRosterList: [],
  umpireRoundList: [],
  umpireCurrentPage: null,
  umpireTotalCount: 1,
  currentPage: 1,
  pageSize: 10,
  rosterLoading: false,
  umpireRosterListActionObject: null,
};

// Remove duplicate rounds names

function removeDuplicateValues(array) {
  return array.filter(
    (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
  );
}

function umpireRosterdState(state = initialState, action) {
  switch (action.type) {
    //// Umpire List
    case ApiConstants.API_UMPIRE_ROSTER_LIST_LOAD:
      return { ...state, onLoad: true, umpireRosterListActionObject: action.payload };
    case ApiConstants.API_UMPIRE_ROSTER_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        umpireRosterList: action.result.results,
        umpireCurrentPage: action.result.page.currentPage,
        umpireTotalCount: action.result.page.totalCount,
        status: action.status,
      };
    //// Round List
    case ApiConstants.API_UMPIRE_SIMPLE_ROUND_LIST_LOAD:
      return { ...state, onLoadRound: true };
    case ApiConstants.API_UMPIRE_SIMPLE_ROUND_LIST_SUCCESS:
      return {
        ...state,
        onLoadRound: false,
        umpireRoundList: removeDuplicateValues(action.result),
      };

    //// Umpire List
    case ApiConstants.API_UMPIRE_ROSTER_ACTION_CLICK_LOAD:
      return { ...state, rosterLoading: true };
    case ApiConstants.API_UMPIRE_ROSTER_ACTION_CLICK_SUCCESS:
      return {
        ...state,
        rosterLoading: false,
        status: action.status,
      };
    //// Add Umpire
    case ApiConstants.API_ADD_UMPIRE_LOAD:
      return { ...state, onLoad: true };
    case ApiConstants.API_ADD_UMPIRE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };
    //// Fail and Error case
    case ApiConstants.API_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_UMPIRE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.umpireRosterListActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_UMPIRE_ROSTER_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_UMPIRE_ROSTER_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        currentPage: action.pageNum,
      };

    case ApiConstants.API_UMPIRE_YEAR_CHANGED:
      return {
        ...state,
        umpireRosterList: [],
        umpireRoundList: [],
      }

    default:
      return state;
  }
}
export default umpireRosterdState;

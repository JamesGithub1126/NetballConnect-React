import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  assignUmpireList: [],
  assignUmpireListPageSize: 10,
  assginUmpireListCurrentPage: 1,
  totalAssignUmpireCount: 1,
};
function assignUmpireState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_ASSIGN_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_ASSIGN_UMPIRE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //////get the umpire assign list
    case ApiConstants.API_GET_ASSIGN_UMPIRE_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_GET_ASSIGN_UMPIRE_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        assignUmpireList: isArrayNotEmpty(action.result.matches) ? action.result.matches : [],
        totalAssignUmpireCount: action.result.page.totalCount,
        status: action.status,
        error: null,
      };

    //////////assign umpire to a match
    case ApiConstants.API_ASSIGN_UMPIRE_FROM_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_ASSIGN_UMPIRE_FROM_LIST_SUCCESS:
      let responseData = action.result.umpires[0];
      let name = responseData.umpireName.split(' ', 2);
      let obj = {
        firstName: name[0],
        id: responseData.userId,
        lastName: name[1],
        rosterStatus: null,
        rosterId: responseData.roster.id,
      };
      state.assignUmpireList[action.index][action.umpireKey] = obj;
      if (action.sameUmpire) {
        if (action.umpireKey === 'user1') {
          state.assignUmpireList[action.index]['user2'] = null;
        } else {
          state.assignUmpireList[action.index]['user1'] = null;
        }
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ////unassign umpire from the match(delete)
    case ApiConstants.API_UNASSIGN_UMPIRE_FROM_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_UNASSIGN_UMPIRE_FROM_LIST_SUCCESS:
      state.assignUmpireList[action.index][action.umpireKey] = null;
      // state.assignUmpireList[action.index][action.umpireKey] = action.result.data
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.SET_ASSIGN_UMPIRE_LIST_PAGE_SIZE:
      return {
        ...state,
        assignUmpireListPageSize: action.pageSize,
      };

    case ApiConstants.SET_ASSIGN_UMPIRE_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        assignUmpireListCurrentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default assignUmpireState;

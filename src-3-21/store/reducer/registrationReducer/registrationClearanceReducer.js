import { cloneDeep } from 'lodash';
import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  deepCopyFunction,
  createClearanceApprovalKey,
} from '../../../util/helpers';

const initialState = {
  onLoad: false,
  onLoadCompetition: false,
  error: null,
  result: null,
  status: 0,
  clearanceUpdated: false,
  clearanceListData: [],
  pagination: {
    page: 1,
    size: 10,
    totalCount: 1,
  },
  competitions: [],
  pastRegistrations: [], //for a single user
  pastRegLoad: false,
  changeApproverLoad: false,
};

function registrationClearanceReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_REG_COMPETITIONS_LOAD:
      return { ...state, onLoadCompetition: true };

    case ApiConstants.API_GET_REG_COMPETITIONS_SUCCESS:
      return {
        ...state,
        onLoadCompetition: false,
        competitions: action.result,
      };

    case ApiConstants.API_GET_REG_CLEARANCE_LOAD:
    case ApiConstants.API_REG_CLEARANCE_EXPORT_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_REG_CLEARANCE_SUCCESS:
      let result = action.result;
      return {
        ...state,
        onLoad: false,
        clearanceUpdated: false,
        clearanceListData: result.clearances,
        pagination: {
          ...state.pagination,
          totalCount: result.page.totalCount,
          page: result.page ? result.page.currentPage : 1,
        },
        status: action.status,
        error: null,
      };

    case ApiConstants.API_CLEARANCE_GET_PAST_REG_LOAD: {
      return {
        ...state,
        pastRegLoad: true,
        pastRegistrations: [],
      };
    }

    case ApiConstants.API_CLEARANCE_GET_PAST_REG_SUCCESS: {
      let pastRegistrations = action.result;
      pastRegistrations.forEach(
        pr =>
          (pr.key = createClearanceApprovalKey(
            pr.userId,
            pr.registrationId,
            pr.approvingOrgId,
            pr.competitionId,
          )),
      );
      return {
        ...state,
        pastRegLoad: false,
        pastRegistrations,
      };
    }

    case ApiConstants.API_CLEARANCE_CHANGE_APPROVER_LOAD: {
      return {
        ...state,
        changeApproverLoad: true,
      };
    }

    case ApiConstants.API_CLEARANCE_CHANGE_APPROVER_SUCCESS: {
      return {
        ...state,
        changeApproverLoad: false,
      };
    }

    case ApiConstants.API_REG_CLEARANCE_EXPORT_SUCCESS:
      return { ...state, onLoad: false };

    case ApiConstants.API_REG_CLEARANCE_APPROVE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_REG_CLEARANCE_APPROVE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        clearanceUpdated: true,
      };

    case ApiConstants.API_REG_CLEARANCE_SAVE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_REG_CLEARANCE_SAVE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        clearanceUpdated: true,
      };

    case ApiConstants.API_REGISTRATION_CHANGE_FAIL:
    case ApiConstants.API_REGISTRATION_CHANGE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_UPDATE_CLEARANCE_LOAD:
      let updatedClearanceDatas = state.clearanceListData;
      const { key, data, row } = action.payload;
      const foundClearance = updatedClearanceDatas.find(
        item => item.clearanceId === row.clearanceId,
      );
      if (foundClearance) {
        foundClearance[key] = data;
      }
      return {
        ...state,
        clearanceListData: updatedClearanceDatas,
      };

    default:
      return state;
  }
}

export default registrationClearanceReducer;

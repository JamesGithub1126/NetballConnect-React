import AppConstants from '../../../themes/appConstants';
import ApiConstants from '../../../themes/apiConstants';
import {
  isArrayNotEmpty,
  deepCopyFunction,
  // isNotNullOrEmptyString
} from '../../../util/helpers';
import { isFootball } from 'util/registrationHelper';

const saveDataTemp = {
  isAdmin: 1,
  regChangeTypeRefId: 0, // DeRegister/ Transfer
  deRegistrationOptionId: 0, /// Yes/No
  reasonTypeRefId: 0,
  deRegisterOther: null,
  transfer: {
    transferOther: null,
    reasonTypeRefId: 0,
    organisationId: null,
    competitionId: null,
  },
  move: {
    competitionUniqueKey: null,
    divisionId: 0,
  },
};

const initialState = {
  onLoad: false,
  onChangeReviewLoad: false,
  error: null,
  result: null,
  status: 0,
  onDeRegisterLoad: false,
  onSaveLoad: false,
  moveCompetitionSuccessMsg: null,
  onMoveCompetitionLoad: false,

  registrationSelection: [
    {
      id: 1,
      value: 'De-register',
      helpMsg: AppConstants.deRegistrationHelpMsg,
    },
    {
      id: 3,
      value: 'Move Competition',
      helpMsg: AppConstants.moveCompHelpMsg,
    },
  ],
  DeRegistionMainOption: [
    { id: 1, value: 'Yes' },
    { id: 2, value: 'No' },
  ],
  deRegistionOption: [
    { id: 1, value: AppConstants.deRegistrationOption1 },
    { id: 2, value: AppConstants.deRegistrationOption2 },
    { id: 3, value: AppConstants.deRegistrationOption3 },
    { id: 4, value: AppConstants.deRegistrationOption4 },
    { id: 5, value: AppConstants.other },
  ],
  transferOption: [
    { id: 1, value: AppConstants.transferOption1 },
    { id: 2, value: AppConstants.transferOption2 },
    { id: 3, value: AppConstants.other },
  ],
  reloadFormData: 0,
  saveData: deepCopyFunction(saveDataTemp),
  regChangeDashboardListData: [], ////////registration change Dashboard list
  regChangeDashboardListPage: 1,
  regChangeDashboardListPageSize: 10,
  regChangeDashboardListTotalCount: 1,
  regChangeCompetitions: [],
  regChangeReviewData: {
    approvals: null,
    competitionName: null,
    competitionOrgName: null,
    createdOn: null,
    fullAmount: null,
    membershipTypeName: null,
    reasonTypeRefId: null,
    regChangeType: null,
    regChangeTypeRefId: null,
    startDate: null,
    userName: null,
    userRegisteredTo: null,
    isShowButton: null,
    deRegistrationOptionId: null,
  },
  reviewSaveData: {
    refundTypeRefId: null,
    declineReasonRefId: null,
    otherInfo: null,
    invoices: null,
  },
  transferOrganisations: [],
  transferCompetitions: [],
  deRegisterData: {},
  moveCompetitions: [],
};
if (!isFootball) {
  initialState.registrationSelection.splice(1, 0, {
    id: 2,
    value: 'Transfer',
    helpMsg: AppConstants.transferHelpMsg,
  });
}
function regChangeReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_UPDATE_REG_REVIEW:
      let key = action.key;
      let data = action.value;
      if (key === 'declineReasonRefId') {
        state.reviewSaveData['refundAmount'] = null;
        state.reviewSaveData['refundTypeRefId'] = null;
        if (data !== 3) {
          state.reviewSaveData['otherInfo'] = null;
        }
      } else if (key === 'refundTypeRefId') {
        state.reviewSaveData['declineReasonRefId'] = null;
        state.reviewSaveData['otherInfo'] = null;
        if (data === 1) {
          state.reviewSaveData['refundAmount'] = null;
        }
      }
      state.reviewSaveData[key] = data;
      return {
        ...state,
      };

    case ApiConstants.API_SAVE_DE_REGISTRATION_LOAD:
      return { ...state, onSaveLoad: true };

    case ApiConstants.API_SAVE_DE_REGISTRATION_SUCCESS:
      return {
        ...state,
        onSaveLoad: false,
        status: action.status,
      };

    case ApiConstants.API_UPDATE_DE_REGISTRATION:
      if (action.subKey === 'deRegister') {
        if (action.key === 'regChangeTypeRefId') {
          state.saveData[action.key] = action.value;
          //state.saveData['deRegistrationOptionId'] = 1;
        } else if (action.key === 'clear') {
          state.saveData = deepCopyFunction(saveDataTemp);
          state.moveCompetitionSuccessMsg = null;
        } else {
          state.saveData[action.key] = action.value;
        }
      } else if (action.subKey === 'transfer') {
        if (action.key === 'organisationId') {
          state.saveData.transfer.competitionId = null;
          let competitions = setCompetitions(action.value, state.transferOrganisations);
          state.transferCompetitions = competitions;
          state.reloadFormData = 1;
        }
        state.saveData.transfer[action.key] = action.value;
      } else if (action.subKey === 'move') {
        if (action.key) {
          if (action.key === 'competitionUniqueKey') {
            state.saveData.move['divisionId'] = 0;
          }
          state.saveData.move[action.key] = action.value;
        }
      } else {
        state.reloadFormData = 0;
      }

      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_GET_REGISTRATION_CHANGE_DASHBOARD_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_REGISTRATION_CHANGE_DASHBOARD_SUCCESS:
      let dashboardListData = action.result;
      return {
        ...state,
        onLoad: false,
        regChangeDashboardListData: dashboardListData.registrationChanges,
        regChangeDashboardListTotalCount: dashboardListData.page.totalCount,
        regChangeDashboardListPage: dashboardListData.page ? dashboardListData.page.currentPage : 1,
        regChangeCompetitions: dashboardListData.competitions ? dashboardListData.competitions : [],
        status: action.status,
        error: null,
      };
    case ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_LOAD:
      return { ...state, onChangeReviewLoad: true };

    case ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_SUCCESS:
      let regChangeReviewData = action.result;
      state.reviewSaveData = {
        refundTypeRefId: null,
        declineReasonRefId: null,
        otherInfo: null,
        invoices: null,
      };
      return {
        ...state,
        onChangeReviewLoad: false,
        regChangeReviewData: regChangeReviewData,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_LOAD:
      return { ...state, onSaveLoad: true };

    case ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_SUCCESS:
      return {
        ...state,
        onSaveLoad: false,
        status: action.status,
      };

    case ApiConstants.API_GET_TRANSFER_COMPETITIONS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_MOVE_COMP_DATA_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_MOVE_COMP_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        moveCompetitions: action.result,
      };

    case ApiConstants.API_MOVE_COMPETITION_LOAD:
      return {
        ...state,
        onMoveCompetitionLoad: true,
      };
    case ApiConstants.API_MOVE_COMPETITION_SUCCESS:
      return {
        ...state,
        onMoveCompetitionLoad: false,
        moveCompetitionSuccessMsg: action.result.message,
        status: action.status,
      };
    case ApiConstants.API_GET_TRANSFER_COMPETITIONS_SUCCESS:
      let transferOrgData = action.result;
      return {
        ...state,
        onLoad: false,
        transferOrganisations: transferOrgData,
        status: action.status,
      };

    case ApiConstants.SET_REGISTRATION_CHANGE_LIST_PAGE_SIZE:
      console.log('pagesize ', action.pageSize);
      return {
        ...state,
        regChangeDashboardListPageSize: action.pageSize,
      };

    case ApiConstants.SET_REGISTRATION_CHANGE_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        regChangeDashboardListPage: action.pageNum,
      };
    case ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };
    case ApiConstants.API_GET_DE_REGISTRATION_LOAD:
      return { ...state, onDeRegisterLoad: true };

    case ApiConstants.API_GET_DE_REGISTRATION_SUCCESS:
      let deRegisterData = action.result;
      return {
        ...state,
        onDeRegisterLoad: false,
        status: action.status,
        deRegisterData: deRegisterData,
      };

    case ApiConstants.API_REGISTRATION_CHANGE_FAIL:
      return {
        ...state,
        onSaveLoad: false,
        onMoveCompetitionLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_REGISTRATION_CHANGE_ERROR:
      return {
        ...state,
        onSaveLoad: false,
        onMoveCompetitionLoad: false,
        error: action.error,
        status: action.status,
      };

    default:
      return state;
  }
}

function setCompetitions(organisationId, organisations) {
  try {
    let arr = [];
    if (isArrayNotEmpty(organisations)) {
      let compData = organisations.find(x => x.organisationId === organisationId);
      if (compData !== undefined) {
        if (isArrayNotEmpty(compData.competitions)) {
          arr.push(...compData.competitions);
        }
      }
    }
    return arr;
  } catch (error) {
    console.log('Error', error);
  }
}

export default regChangeReducer;

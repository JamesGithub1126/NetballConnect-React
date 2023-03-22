import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';
import ColorsArray from '../../../util/colorsArray';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  regDashboardListData: [], ////////registration Dashboard list
  regDashboardListPage: 1,
  regDashboardListTotalCount: 1,
  competitionTypeList: [],
  ownedRegistrations: [], ////////ownedRegistrations main dashboard listing
  participatingInRegistrations: [], ////////participatingInRegistrations main dashboard listing
  regFormListAction: null,
  regDashboardListAction: null,
  ownedLoad: false,
  partLoad: false,
};

///// Generate owned Registrations Array

function generateOwnedRegistrations(dashboardList) {
  let ownedCompetitions = JSON.parse(JSON.stringify(dashboardList.ownedCompetitions));
  if (isArrayNotEmpty(ownedCompetitions)) {
    for (let i in ownedCompetitions) {
      let ownDivisionList = ownedCompetitions[i].divisions;
      if (isArrayNotEmpty(ownDivisionList)) {
        ownDivisionList.forEach((item, index) => {
          item.color = index <= ColorsArray.length ? ColorsArray[index] : '#a3a3b1';
        });
      }
    }
  }
  return ownedCompetitions;
}

///// Create participating In Registrations Array

function generateParticipatingInRegistrations(dashboardList) {
  let participatingComptitions = JSON.parse(
    JSON.stringify(dashboardList.participatingInComptitions),
  );
  if (isArrayNotEmpty(participatingComptitions)) {
    for (let i in participatingComptitions) {
      let divisionList = participatingComptitions[i].divisions;
      if (isArrayNotEmpty(divisionList)) {
        divisionList.forEach((item, index) => {
          item.color = index <= ColorsArray.length ? ColorsArray[index] : '#a3a3b1';
        });
      }
    }
  }
  return participatingComptitions;
}

function registrationDashboard(state = initialState, action) {
  switch (action.type) {
    //////get the Dashboard list in registration
    case ApiConstants.API_REG_DASHBOARD_LIST_LOAD:
      return { ...state, onLoad: true, error: null, regFormListAction: action };

    case ApiConstants.API_REG_DASHBOARD_LIST_SUCCESS:
      let dashboardListData = action.result;
      return {
        ...state,
        onLoad: false,
        regDashboardListData: dashboardListData.orgReg,
        regDashboardListTotalCount: dashboardListData.page.totalCount,
        regDashboardListPage: dashboardListData.page ? dashboardListData.page.currentPage : 1,
        status: action.status,
        error: null,
      };

    ///******fail and error handling */
    case ApiConstants.API_REG_DASHBOARD_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onRegStatusUpdateLoad: false,
        onRegRetryPaymentLoad: false,
        retryPaymenDetails: null,
        retryPaymentMessage: null,
        retryPaymentSuccess: false,
      };
    case ApiConstants.API_REG_DASHBOARD_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onRegStatusUpdateLoad: false,
        onRegRetryPaymentLoad: false,
        retryPaymenDetails: null,
        retryPaymentMessage: null,
        retryPaymentSuccess: false,
      };

    /////get the Competition type list
    case ApiConstants.API_GET_ALL_COMPETITION_LOAD:
      state.competitionTypeList = [];
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_ALL_COMPETITION_SUCCESS:
      let competitionData = JSON.parse(JSON.stringify(action.result));
      let competitionObject = {
        competitionId: 0,
        competitionName: 'New Competition ',
        competitionStatus: 'draft',
        competitionStatusId: 0,
        id: 0,
        isDirect: false,
        registrationCloseDate: '',
        yearId: '',
        orgRegistratinId: 0,
        competitionCreatorOrganisation: 0,
        inviteeStatus: 0,
      };
      competitionData.unshift(competitionObject);
      return {
        ...state,
        onLoad: false,
        competitionTypeList: competitionData,
        status: action.status,
      };

    /////////////////registration main dashboard listing owned and participate registration
    case ApiConstants.API_GET_REGISTRATION_MAIN_DASHBOARD_LISTING_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
        regDashboardListAction: action,
        ownedLoad: action.key === 'own' || action.key === 'all',
        partLoad: action.key === 'part' || action.key === 'all',
      };

    case ApiConstants.API_GET_REGISTRATION_MAIN_DASHBOARD_LISTING_SUCCESS:
      let allData = action.result;
      if (action.key === 'own' || action.key === 'all') {
        let ownRegArray = generateOwnedRegistrations(allData);
        state.ownedRegistrations = ownRegArray;
      }
      if (action.key === 'part' || action.key === 'all') {
        let participatingReg = generateParticipatingInRegistrations(allData);
        state.participatingInRegistrations = participatingReg;
      }
      state.onLoad = false;
      return {
        ...state,
        status: action.status,
        ownedLoad: false,
        partLoad: false,
        error: null,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.regFormListAction = null;
      state.regDashboardListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_REGISTRATION_DASHBOARD_LIST_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.pageSize,
      };

    case ApiConstants.SET_REGISTARTION_DASHBOARD_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        regDashboardListPage: action.pageNum,
      };

    case ApiConstants.API_REGISTRATION_FAILED_STATUS_UPDATE_LOAD:
      return { ...state, onRegStatusUpdateLoad: true, error: null };

    case ApiConstants.API_REGISTRATION_FAILED_STATUS_UPDATE_SUCCESS:
      return {
        ...state,
        onRegStatusUpdateLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_REGISTRATION_REQUEST_FUNDS_OFFLINE_LOAD:
      return { ...state, onRegStatusUpdateLoad: true, error: null };

    case ApiConstants.API_REGISTRATION_REQUEST_FUNDS_OFFLINE_SUCCESS:
      return {
        ...state,
        onRegStatusUpdateLoad: false,
        status: action.status,
        error: null,
      };
    case ApiConstants.API_REGISTRATION_MARK_OFFLINE_AS_PAID_LOAD:
      return { ...state, onRegStatusUpdateLoad: true, error: null };

    case ApiConstants.API_REGISTRATION_MARK_OFFLINE_AS_PAID_SUCCESS:
      return {
        ...state,
        onRegStatusUpdateLoad: false,
        status: action.status,
        error: null,
      };
    case ApiConstants.API_REGISTRATION_RETRY_PAYMENT_LOAD:
      return { ...state, onRegRetryPaymentLoad: true };

    case ApiConstants.API_REGISTRATION_RETRY_PAYMENT_SUCCESS:
      return {
        ...state,
        onRegRetryPaymentLoad: false,
        status: action.status,
        retryPaymenDetails: action.result,
        retryPaymentMessage: action.result.message,
        retryPaymentSuccess: action.result.success,
      };

    default:
      return state;
  }
}

export default registrationDashboard;

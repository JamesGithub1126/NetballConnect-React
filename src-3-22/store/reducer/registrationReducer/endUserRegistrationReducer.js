import ApiConstants from '../../../themes/apiConstants';
// import { isArrayNotEmpty, isNotNullOrEmptyString } from "../../../util/helpers";

const registrationObj = {
  organisationUniqueKey: '',
  registrationId: 0,
  orgRegistrationId: 0,
  postalCode: '',
  alternativeLocation: '',
  countryRefId: null,
  nationalityRefId: null,
  languages: '',
  volunteers: [],
  competitionUniqueKey: '',
  childrenCheckNumber: '',
  userRegistrations: [],
  vouchers: [],
};

const membershipProdInfoObj = {
  specialNote: '',
  training: '',
  competitionName: '',
  membershipProducts: [],
};

const initialState = {
  onLoad: false,
  onUserRegDashboardLoad: false,
  error: null,
  result: null,
  status: 0,
  registrationDetail: registrationObj,
  registrationSettings: [],
  membershipProductInfo: membershipProdInfoObj,
  userRegDashboardListData: [],
  userRegDashboardListPage: 1,
  userRegDashboardListTotalCount: 1,
  userRegDashboardListPageSize: 10,
  competitions: [],
  membershipProductTypes: [],
  membershipProducts: [],
  postalCodes: [],
  feesPaid: 0,
  registrationListAction: null,
  onTranSaveLoad: false,
};

function endUserRegistrationReducer(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_END_USER_REGISTRATION_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_END_USER_REGISTRATION_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_SAVE_END_USER_REGISTRATION_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_SAVE_END_USER_REGISTRATION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.UPDATE_END_USER_REGISTRATION:
      const oldData = state.registrationDetail;
      const updatedValue = action.updatedData;
      const getKey = action.key;
      oldData[getKey] = updatedValue;
      return { ...state, error: null };

    case ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_SUCCESS:
      const data = action.result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        membershipProductInfo: data,
      };

    case ApiConstants.API_ORG_REGISTRATION_REG_SETTINGS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_ORG_REGISTRATION_REG_SETTINGS_SUCCESS:
      const orgData = action.result;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        registrationSettings: orgData,
      };

    case ApiConstants.API_USER_REG_DASHBOARD_LIST_LOAD:
      return {
        ...state,
        onUserRegDashboardLoad: true,
        error: null,
        registrationListAction: action,
        userRegDashboardListData: [],
      };

    case ApiConstants.API_USER_REG_DASHBOARD_LIST_SUCCESS:
      const dashboardListData = action.result;
      return {
        ...state,
        onUserRegDashboardLoad: false,
        userRegDashboardListData: dashboardListData.registrations,
        userRegDashboardListTotalCount: dashboardListData.page.totalCount,
        userRegDashboardListPage: dashboardListData.page ? dashboardListData.page.currentPage : 1,
        competitions: dashboardListData.competitions,
        membershipProductTypes: dashboardListData.membershipProductTypes,
        membershipProducts: dashboardListData.membershipProducts,
        postalCodes: dashboardListData.postalCodes,
        feesPaid: dashboardListData.grossRegistrationValue,
        uniqueRegistrants: dashboardListData.uniqueRegistrants,
        // uniqueRegistrants: dashboardListData.uniqueRegistrants,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_REG_TRANSACTION_UPDATE_LOAD:
      return { ...state, onTranSaveLoad: true };

    case ApiConstants.API_REG_TRANSACTION_UPDATE_SUCCESS:
      return {
        ...state,
        onTranSaveLoad: false,
        status: action.status,
      };

    case ApiConstants.API_USER_REG_DASHBOARD_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_USER_REG_DASHBOARD_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.registrationListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_GET_EXPORT_REGISTRATION_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_EXPORT_REGISTRATION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.SET_REGISTRATION_LIST_PAGE_SIZE:
      return {
        ...state,
        userRegDashboardListPageSize: action.pageSize,
      };

    case ApiConstants.SET_REGISTRATION_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        userRegDashboardListPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default endUserRegistrationReducer;

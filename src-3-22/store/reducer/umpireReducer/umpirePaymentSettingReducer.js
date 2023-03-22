import ApiConstants from '../../../themes/apiConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  umpireComptitionList: [],
  paidByCompOrgDivisionAffiliate: [],
  poolViewArray: [],
  allowUmpiresPayments: true,
  paymentSettingsData: null,
};

function umpirePaymentSetting(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_UMPIRE_COMPETITION_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_UMPIRE_COMPETITION_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        umpireComptitionList: action.result,
        status: action.status,
      };
    case ApiConstants.API_UMPIRE_LINKED_ORGANISATION_LIST_LOAD:
      return { ...state, umpireLinkedOrganisationList: [], onLoad: true };

    case ApiConstants.API_UMPIRE_LINKED_ORGANISATION_LIST_SUCCESS: {
      return {
        ...state,
        onLoad: false,
        umpireLinkedOrganisationList: action.result,
        status: action.status,
      };
    }
    // get umpire payment settings
    case ApiConstants.API_GET_UMPIRE_PAYMENT_SETTINGS_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_SAVE_UMPIRE_PAYMENT_SETTINGS_LOAD: {
      return {
        ...state,
        onLoad: true,
      };
    }
    case ApiConstants.API_GET_UMPIRE_PAYMENT_SETTINGS_SUCCESS:
    case ApiConstants.API_SAVE_UMPIRE_PAYMENT_SETTINGS_SUCCESS:
      const { noPaymentThroughPlatform, ...settings } = action.result;
      return {
        ...state,
        paymentSettingsData: settings,
        allowUmpiresPayments: !noPaymentThroughPlatform,
        onLoad: false,
      };

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

    default:
      return state;
  }
}

export default umpirePaymentSetting;

import ApiConstants from '../../../themes/apiConstants';
const initialState = {
  onLoad: true,
};

export const exportVoucherReducer = (state = initialState, action) => {
  switch (action.type) {
    case ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_SUCCESS:
    case ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_ERROR:
      return { ...state, onLoad: true };

    default:
      return { ...state };
  }
};

import ApiConstants from '../../../themes/apiConstants';

export function exportGovernmentVoucherAction(payload) {
  const action = {
    type: ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_LOAD,
    payload,
  };
  return action;
}

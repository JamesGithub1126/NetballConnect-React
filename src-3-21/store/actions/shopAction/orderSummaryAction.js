import ApiConstants from '../../../themes/apiConstants';

// order summary listing get API
function getOrderSummaryListingAction(params) {
  const action = {
    type: ApiConstants.API_GET_SHOP_ORDER_SUMMARY_LISTING_LOAD,
    params,
  };
  return action;
}

// export order summary  API
function exportOrderSummaryAction(params) {
  const action = {
    type: ApiConstants.API_GET_EXPORT_ORDER_SUMMARY_LOAD,
    params,
  };
  return action;
}

function setOrderSummaryListPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_ORDER_SUMMARY_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setOrderSummaryListPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_ORDER_SUMMARY_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  getOrderSummaryListingAction,
  exportOrderSummaryAction,
  setOrderSummaryListPageSizeAction,
  setOrderSummaryListPageNumberAction,
};

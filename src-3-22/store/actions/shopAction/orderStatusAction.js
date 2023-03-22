import ApiConstants from '../../../themes/apiConstants';

///order status listing get API
function getOrderStatusListingAction(params) {
  const action = {
    type: ApiConstants.API_GET_ORDER_STATUS_LISTING_LOAD,
    params,
  };
  return action;
}

///update order status API
function updateOrderStatusAction(payload) {
  const action = {
    type: ApiConstants.API_UPDATE_ORDER_STATUS_LOAD,
    payload,
  };
  return action;
}

///order details get API
function getOrderDetailsAction(id) {
  const action = {
    type: ApiConstants.API_GET_ORDER_DETAILS_LOAD,
    id,
  };
  return action;
}

//////clearing particular reducer data
function clearOrderStatusReducer(dataName) {
  const action = {
    type: ApiConstants.SHOP_ORDER_STATUS_CLEARING_REDUCER_DATA,
    dataName,
  };
  return action;
}

///purchases listing get API
function getPurchasesListingAction(params) {
  const action = {
    type: ApiConstants.API_GET_PURCHASES_LISTING_LOAD,
    params,
  };
  return action;
}

function getReferenceOrderStatus() {
  return {
    type: ApiConstants.API_GET_REFERENCE_ORDER_STATUS_LOAD,
  };
}

function updateOrderFullfilmentStatus(key, value) {
  return {
    type: ApiConstants.API_UPDATE_FULFILLMENT_STATUS,
    key,
    value,
  };
}

// export order summary  API
function exportOrderStatusAction(params) {
  const action = {
    type: ApiConstants.API_GET_EXPORT_ORDER_STATUS_LOAD,
    params,
  };
  return action;
}

function setOrderStatusListPageSizeAction(pageSize) {
  const action = {
    type: ApiConstants.SET_ORDER_STATUS_LIST_PAGE_SIZE,
    pageSize,
  };

  return action;
}

function setOrderStatusListPageNumberAction(pageNum) {
  const action = {
    type: ApiConstants.SET_ORDER_STATUS_LIST_PAGE_CURRENT_NUMBER,
    pageNum,
  };

  return action;
}

export {
  getOrderStatusListingAction,
  updateOrderStatusAction,
  getOrderDetailsAction,
  clearOrderStatusReducer,
  getPurchasesListingAction,
  getReferenceOrderStatus,
  updateOrderFullfilmentStatus,
  exportOrderStatusAction,
  setOrderStatusListPageSizeAction,
  setOrderStatusListPageNumberAction,
};

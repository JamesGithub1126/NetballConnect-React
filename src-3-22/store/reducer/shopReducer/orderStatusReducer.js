import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';

// dummy order details object
const defaultOrderObject = {
  id: '',
  sellProducts: [],
  user: null,
  address: '',
  suburb: '',
  state: '',
  postcode: '',
  fulfilmentStatus: null,
};

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  orderStatusListingData: [],
  orderStatusTotalCount: 1,
  orderStatusCurrentPage: 1,
  orderStatusPageSize: 10,
  orderDetails: defaultOrderObject,
  orderStatusListActionObject: null,
  purchasesListingData: [],
  purchasesTotalCount: 1,
  purchasesCurrentPage: 1,
  ShopPaymentStatus: [],
  ShopFulfilmentStatusArr: [],
};

////making the object data for order detail
function makeOrderDetailObject(data, orderDetailObject) {
  let objectDetailData = orderDetailObject;
  objectDetailData['id'] = data.id;
  objectDetailData['sellProducts'] = data.sellProducts;
  objectDetailData['user'] = data.user;
  objectDetailData['address'] = data.address;
  objectDetailData['suburb'] = data.suburb;
  objectDetailData['state'] = data.state;
  objectDetailData['postcode'] = data.postcode;
  objectDetailData['orderGroup'] = data.orderGroup;
  objectDetailData['fulfilmentStatus'] = data.fulfilmentStatus;
  objectDetailData['guestFirstName'] = data.guestFirstName;
  objectDetailData['guestLastName'] = data.guestLastName;
  objectDetailData['guestMobileNumber'] = data.guestMobileNumber;
  objectDetailData['guestEmail'] = data.guestEmail;
  return objectDetailData;
}

function shopOrderStatusState(state = initialState, action) { 
  switch (action.type) {
    case ApiConstants.API_SHOP_ORDER_STATUS_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_SHOP_ORDER_STATUS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    // export order status  API
    case ApiConstants.API_GET_EXPORT_ORDER_STATUS_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_EXPORT_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //// /////order status listing  get API
    case ApiConstants.API_GET_ORDER_STATUS_LISTING_LOAD:
      return { ...state, onLoad: true, error: null, orderStatusListActionObject: action };

    case ApiConstants.API_GET_ORDER_STATUS_LISTING_SUCCESS:
      let orderStatusData = action.result;
      return {
        ...state,
        orderStatusListingData: isArrayNotEmpty(orderStatusData.orders)
          ? orderStatusData.orders
          : [],
        orderStatusTotalCount: orderStatusData.page ? orderStatusData.page.totalCount : 1,
        orderStatusCurrentPage: orderStatusData.page ? orderStatusData.page.currentPage : 1,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //// //////update order status API
    case ApiConstants.API_UPDATE_ORDER_STATUS_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_UPDATE_ORDER_STATUS_SUCCESS:
      let allData = state.orderStatusListingData;
      let updatedOrderStatus = action.result;
      let orderId = updatedOrderStatus ? updatedOrderStatus.id : 0;
      let orderStatusIndex = allData.findIndex(x => x.orderId === orderId);
      if (orderStatusIndex > -1) {
        state.orderStatusListingData[orderStatusIndex].paymentStatus =
          updatedOrderStatus.paymentStatus;
        state.orderStatusListingData[orderStatusIndex].fulfilmentStatus =
          updatedOrderStatus.fulfilmentStatus;
        state.orderStatusListingData[orderStatusIndex].refundedAmount =
          updatedOrderStatus.refundedAmount;
      }
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //// //////order details get API
    case ApiConstants.API_GET_ORDER_DETAILS_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_ORDER_DETAILS_SUCCESS:
      let orderDetails = makeOrderDetailObject(action.result, state.orderDetails);
      state.orderDetails = orderDetails;
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ///clearing particular reducer data
    case ApiConstants.SHOP_ORDER_STATUS_CLEARING_REDUCER_DATA:
      if (action.dataName === 'orderDetails') {
        // dummy object of product detail
        const defaultOrderObject = {
          id: '',
          sellProducts: [],
          user: null,
          address: '',
          suburb: '',
          state: '',
          postcode: '',
        };
        state.orderDetails = defaultOrderObject;
      }
      return {
        ...state,
        error: null,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.orderStatusListActionObject = null;
      return { ...state, onLoad: false };

    //// ///purchases listing get API
    case ApiConstants.API_GET_PURCHASES_LISTING_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_PURCHASES_LISTING_SUCCESS:
      let purchasesData = action.result;
      return {
        ...state,
        purchasesListingData: isArrayNotEmpty(purchasesData.orders) ? purchasesData.orders : [],
        purchasesTotalCount: purchasesData.page ? purchasesData.page.totalCount : 1,
        purchasesCurrentPage: purchasesData.page ? purchasesData.page.currentPage : 1,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_REFERENCE_ORDER_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_GET_REFERENCE_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        ShopFulfilmentStatusArr: action.result.ShopFulfilmentStatus,
        ShopPaymentStatus: action.result.ShopPaymentStatus,
        status: action.status,
        error: null,
      };
    case ApiConstants.API_UPDATE_FULFILLMENT_STATUS:
      state.orderDetails[action.key] = action.value;
      return { ...state, onLoad: false, error: null };

    case ApiConstants.SET_ORDER_STATUS_LIST_PAGE_SIZE:
      return {
        ...state,
        orderStatusPageSize: action.pageSize,
      };

    case ApiConstants.SET_ORDER_STATUS_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        orderStatusCurrentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default shopOrderStatusState;

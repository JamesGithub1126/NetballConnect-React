import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  orderSummaryListingData: [],
  orderSummaryTotalCount: 1,
  orderSummaryCurrentPage: 1,
  orderSummaryPageSize: 10,
  numberOfOrders: 0,
  valueOfOrders: 0,
  orderSummaryListingActionObject: null,
};

function shopOrderSummaryState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_SHOP_ORDER_SUMMARY_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_SHOP_ORDER_SUMMARY_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    //// ///////shop order summary listing get API
    case ApiConstants.API_GET_SHOP_ORDER_SUMMARY_LISTING_LOAD:
      return { ...state, onLoad: true, error: null, orderSummaryListingActionObject: action };

    case ApiConstants.API_GET_SHOP_ORDER_SUMMARY_LISTING_SUCCESS:
      let orderSummaryData = action.result;
      return {
        ...state,
        orderSummaryListingData: isArrayNotEmpty(orderSummaryData.orders)
          ? orderSummaryData.orders
          : [],
        orderSummaryTotalCount: orderSummaryData.page ? orderSummaryData.page.totalCount : 1,
        orderSummaryCurrentPage: orderSummaryData.page ? orderSummaryData.page.currentPage : 1,
        numberOfOrders: orderSummaryData.numberOfOrders ? orderSummaryData.numberOfOrders : 0,
        valueOfOrders: orderSummaryData.valueOfOrders ? orderSummaryData.valueOfOrders : 0,
        onLoad: false,
        status: action.status,
        error: null,
      };

    // export order summary  API
    case ApiConstants.API_GET_EXPORT_ORDER_SUMMARY_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_EXPORT_ORDER_SUMMARY_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.orderSummaryListingActionObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.SET_ORDER_SUMMARY_LIST_PAGE_SIZE:
      return {
        ...state,
        orderSummaryPageSize: action.pageSize,
      };

    case ApiConstants.SET_ORDER_SUMMARY_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        orderSummaryCurrentPage: action.pageNum,
      };

    default:
      return state;
  }
}

export default shopOrderSummaryState;

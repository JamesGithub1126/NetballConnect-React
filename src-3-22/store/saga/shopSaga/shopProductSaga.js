import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from '../../../themes/appConstants';
import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/shopHttp/shopAxios';
import * as registrationSaga from '../../saga/registrationSaga/registrationSaga';
function* failSaga(result) {
  yield put({
    type: ApiConstants.API_SHOP_PRODUCT_FAIL,
    error: result,
    status: result.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_SHOP_PRODUCT_ERROR,
    error: error,
    status: error.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }, 800);
}

// Product listing get API
function* getProductListingSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getProductListing,
      action.sorterBy,
      action.order,
      action.offset,
      action.filter,
      action.limit,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SHOP_PRODUCT_LISTING_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Add product
function* addProductSaga(action) {
  try {
    const result = yield call(AxiosApi.addProduct, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ADD_SHOP_PRODUCT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success(AppConstants.productAddedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get reference type in the add product screen
function* getTypesOfProductSaga(/* action */) {
  try {
    const result = yield call(AxiosApi.getTypesOfProduct);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TYPES_LIST_IN_ADD_PRODUCT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete product from the product listing API
function* deleteProductSaga(action) {
  try {
    const result = yield call(AxiosApi.deleteProduct, action.productId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_SHOP_PRODUCT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success(AppConstants.productDeletedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete product variant API
function* deleteProductVariantSaga(action) {
  try {
    const result = yield call(AxiosApi.deleteProductVariant, action.optionId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_SHOP_PRODUCT_VARIANT_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.index,
        subIndex: action.subIndex,
      });

      message.success(AppConstants.variantDeletedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Add type in the type list array in from the API
function* addNewTypeSaga(action) {
  try {
    const result = yield call(AxiosApi.addNewType, action.typeName);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SHOP_ADD_TYPE_IN_TYPELIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success(AppConstants.typeAddedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Product details on id API
function* getProductDetailsByIdSaga(action) {
  try {
    const result = yield call(AxiosApi.getProductDetailsById, action.productId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SHOP_GET_PRODUCT_DETAILS_BY_ID_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getWebsiteProductSaga(action) {
  try {
    const result = yield call(AxiosApi.getProductDetailsById, action.payload.productId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.GET_WEBSITE_PRODUCT_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getShopCartSaga(action) {
  try {
    const result = yield call(AxiosApi.getShopCart, action.payload);
    if (result.status === 1) {
      const { shopUniqueKey, ...data } = result.result.data;
      localStorage.setItem('shopUniqueKey', shopUniqueKey);
      yield put({
        type: ApiConstants.API_GET_SHOP_CART_SUCCESS,
        result: data,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_GET_SHOP_CART_ERROR);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_GET_SHOP_CART_ERROR,
      error,
    });
  }
}

export function* saveShopCartSaga(action) {
  try {
    const result = yield call(AxiosApi.saveShopCart, action.payload);
    if (result.status === 1) {
      const { shopUniqueKey, ...data } = result.result.data;
      yield put({
        type: ApiConstants.API_SAVE_SHOP_CART_SUCCESS,
        result: data,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_SAVE_SHOP_CART_ERROR);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_SAVE_SHOP_CART_ERROR,
      error,
    });
  }
}

export default function* rootShopProductSaga() {
  yield takeEvery(ApiConstants.API_GET_SHOP_PRODUCT_LISTING_LOAD, getProductListingSaga);
  yield takeEvery(ApiConstants.API_ADD_SHOP_PRODUCT_LOAD, addProductSaga);
  yield takeEvery(ApiConstants.API_GET_TYPES_LIST_IN_ADD_PRODUCT_LOAD, getTypesOfProductSaga);
  yield takeEvery(ApiConstants.API_DELETE_SHOP_PRODUCT_LOAD, deleteProductSaga);
  yield takeEvery(ApiConstants.API_DELETE_SHOP_PRODUCT_VARIANT_LOAD, deleteProductVariantSaga);
  yield takeEvery(ApiConstants.API_SHOP_ADD_TYPE_IN_TYPELIST_LOAD, addNewTypeSaga);
  yield takeEvery(ApiConstants.API_SHOP_GET_PRODUCT_DETAILS_BY_ID_LOAD, getProductDetailsByIdSaga);
  yield takeEvery(ApiConstants.GET_WEBSITE_PRODUCT_LOAD, getWebsiteProductSaga);
  // shop cart get
  yield takeEvery(ApiConstants.API_GET_SHOP_CART_LOAD, getShopCartSaga);
  // shop cart save
  yield takeEvery(ApiConstants.API_SAVE_SHOP_CART_LOAD, saveShopCartSaga);
  yield takeEvery(
    ApiConstants.API_GET_TRANSACTION_FEE_LOAD,
    registrationSaga.getTransactionFeeSaga,
  );
}

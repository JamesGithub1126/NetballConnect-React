import { put, call, takeEvery, select } from 'redux-saga/effects';
import { message } from 'antd';
import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';

import UmpireAxiosApi from 'store/http/umpireHttp/umpireAxios';
import { umpireSearchSaga } from './umpireSaga';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_UMPIRE_POOL_ALLOCATION_FAIL,
  });

  let msg = result.result.data
    ? result.result.data.message || AppConstants.somethingWentWrong
    : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_UMPIRE_POOL_ALLOCATION_ERROR,
    error: error,
    status: error.status,
  });

  if (error.status === 400) {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(error && error.error ? error.error : AppConstants.somethingWentWrong);
  } else {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }
}

function* getUmpirePoolAllocationSaga(action) {
  try {
    yield put({
      type: ApiConstants.API_GET_UMPIRE_ALLOCATION_SETTINGS_LOAD,
      data: action.payload.compId,
    });

    const result = yield call(UmpireAxiosApi.getUmpirePoolAllocation, action.payload);

    if (result.status === 1) {
      const pools = result.result.data;
      pools.forEach(pool => {
        if (!!pool.umpires.length) {
          pool.umpires.sort((a, b) => a.poolRank - b.poolRank);
        }
      });
      yield put({
        type: ApiConstants.API_GET_UMPIRE_POOL_DATA_SUCCESS,
        result: pools,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* saveUmpirePoolAllocationSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.saveUmpirePoolAllocation, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_UMPIRE_POOL_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.poolAddedSuccessMsg);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateUmpirePoolAllocationSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.updateUmpirePoolAllocation, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_UMPIRE_POOL_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.settingsUpdatedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateUmpirePoolAllocationManySaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.updateUmpirePoolAllocationMany, action.payload);

    if (result.status === 1) {
      const pools = result.result.data;
      pools.forEach(pool => {
        if (!!pool.umpires.length) {
          pool.umpires.sort((a, b) => a.poolRank - b.poolRank);
        }
      });
      yield put({
        type: ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_SUCCESS,
        result: pools,
        status: result.status,
      });
      message.success(AppConstants.settingsUpdatedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* deleteUmpirePoolAllocationSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.deleteUmpirePoolAllocation, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_UMPIRE_POOL_DATA_SUCCESS,
        result: action.payload.umpirePoolId,
        status: result.status,
      });
      message.success(AppConstants.poolRemovedSuccessMsg);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateUmpirePoolAllocationToDivisionSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.updateUmpirePoolAllocationToDivision, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_UMPIRE_POOL_TO_DIVISION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.settingsUpdatedMessage);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* applyUmpireAllocationAlgorithmSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.applyUmpireAllocationAlgorithm, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_APPLY_UMPIRE_ALLOCATION_ALGORITHM_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.settingsUpdatedMessage);
    } else {
      if (result.result.status == 212) {
        const ret = result.result.data;
        if (ret) {
          const { messages = [] } = ret;
          let noEnoughUmpire = messages.find(m => m.noEnoughUmpire);
          if (noEnoughUmpire) {
            message.warning(AppConstants.noEnoughUmpireMessage, 5);
          }
          if (!noEnoughUmpire || messages.length > 1) {
            yield call(failSaga, result);
          } else {
            yield put({
              type: ApiConstants.API_UMPIRE_POOL_ALLOCATION_FAIL,
            });
          }
        } else {
          yield call(failSaga, result);
        }
      } else {
        yield call(failSaga, result);
      }
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootUmpirePoolAllocationSaga() {
  yield takeEvery(ApiConstants.API_GET_UMPIRE_POOL_DATA_LOAD, getUmpirePoolAllocationSaga);
  yield takeEvery(ApiConstants.API_SAVE_UMPIRE_POOL_DATA_LOAD, saveUmpirePoolAllocationSaga);
  yield takeEvery(ApiConstants.API_DELETE_UMPIRE_POOL_DATA_LOAD, deleteUmpirePoolAllocationSaga);
  yield takeEvery(ApiConstants.API_UPDATE_UMPIRE_POOL_DATA_LOAD, updateUmpirePoolAllocationSaga);
  yield takeEvery(
    ApiConstants.API_UPDATE_UMPIRE_POOL_MANY_DATA_LOAD,
    updateUmpirePoolAllocationManySaga,
  );
  yield takeEvery(
    ApiConstants.API_UPDATE_UMPIRE_POOL_TO_DIVISION_LOAD,
    updateUmpirePoolAllocationToDivisionSaga,
  );
  yield takeEvery(
    ApiConstants.API_APPLY_UMPIRE_ALLOCATION_ALGORITHM_LOAD,
    applyUmpireAllocationAlgorithmSaga,
  );
}

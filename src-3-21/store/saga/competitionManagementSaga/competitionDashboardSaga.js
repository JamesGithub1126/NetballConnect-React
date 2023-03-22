import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import RegistrationAxiosApi from '../../http/registrationHttp/registrationAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';
function* failSaga(result) {
  console.log('failSaga', result.message);
  yield put({ type: ApiConstants.API_COMPETITION_DASHBOARD_FAIL });
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.message);
  }, 800);
}

function* errorSaga(error) {
  console.log('errorSaga', error);
  yield put({
    type: ApiConstants.API_COMPETITION_DASHBOARD_ERROR,
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
export function* competitionDashboardSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.competitionDashboard, action.yearId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_DASHBOARD_SUCCESS,
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
export function* updateCompetitionStatusSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.updateCompetitionStatus, action.payload);
    if (result.status === 1) {
      const updateDashboardResult = yield call(
        CompetitionAxiosApi.competitionDashboard,
        action.yearId,
      );
      if (updateDashboardResult.status === 1) {
        yield put({
          type: ApiConstants.API_COMPETITION_STATUS_UPDATE_SUCCESS,
          result: result.result.data,
          updateDashboardResult: updateDashboardResult.result.data,
          status: result.status,
        });
      } else {
        yield put({
          type: ApiConstants.API_COMPETITION_STATUS_UPDATE_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* competitionDashboardDeleteSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.competitionDashboardDelete,
      action.competitionId,
      action.targetValue,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_DASHBOARD_DELETE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* competitionDashboardArchiveSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.competitionDashboardArchive,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_DASHBOARD_ARCHIVE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* saveReplicateSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.replicateSave, action.replicateData);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_SAVE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else if (result.status === 4) {
      yield put({
        type: ApiConstants.API_REPLICATE_SAVE_SUCCESS,
        result: result.result.data.message,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getOldMembershipProductsByCompId(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.getOldMembershipProductsByCompId,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_OLD_MEMBERSHIP_PRODUCTS_BY_COMP_ID_SUCCESS,
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

// Save Competition Division from Comp Details
export function* saveCompetitionDivisionSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.saveCompetitionDivisions,
      action.competitionId,
      action.organisationId,
      action.payload,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_DIVISIONS_SUCCESS,
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

export function* getNewMembershipProductsByYear(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getNewMembershipProductsByYear, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_NEW_MEMBERSHIP_PRODUCTS_BY_YEAR_SUCCESS,
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

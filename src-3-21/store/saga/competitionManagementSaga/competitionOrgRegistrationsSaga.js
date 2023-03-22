import { call, put, takeEvery } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';
import RegistrationAxiosApi from '../../http/registrationHttp/registrationAxiosApi';

function* failSaga(result) {
  console.log('failSaga', result.message);
  yield put({ type: ApiConstants.API_COMPETITION_OWN_TEAM_GRADING_FAIL });

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
    type: ApiConstants.API_COMPETITION_ORG_REGISTRATIONS_ERROR,
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

//competition own proposed team grading get api
export function* getCompOrgRegistrationsSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.getCompetitionOrgRegistrations,
      action.payload.competitionUniqueKey,
      action.payload.organisationUniqueKey,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_SUCCESS,
        result: result.result.data.orgRegistrations,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}


export default function* rootCompOrgRegistrationsSaga() {
  yield takeEvery(ApiConstants.API_GET_COMPETITION_ORG_REGISTRATIONS_LOAD, getCompOrgRegistrationsSaga);

}

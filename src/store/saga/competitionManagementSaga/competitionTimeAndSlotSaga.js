import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';
import CommonAxiosApi from '../../http/commonHttp/commonAxiosApi';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  console.log('failSaga', result);
  yield put({
    type: ApiConstants.API_COMPETITION_TIMESLOT_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.error('Something went wrong');
  }, 800);
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }, 800);
}

function* errorSaga(error) {
  console.log('errorSaga', error);
  yield put({
    type: ApiConstants.API_COMPETITION_TIMESLOT_ERROR,
  });
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(AppConstants.somethingWentWrong);
  }, 800);
}

// competition time slot get api
export function* competitonWithTimeSlots(action) {
  try {
    const refResult = yield call(CommonAxiosApi.getCommonTimeSlotInit);
    if (refResult.status === 1) {
      const result = yield call(
        CompetitionAxiosApi.getTimeSlotData,
        action.year,
        action.competitionId,
      );
      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_GET_COMPETITION_WITH_TIME_SLOTS_SUCCESS,
          result: result.result.data,
          refResult: refResult.result.data,
          status: result.status,
        });
      } else {
        yield call(failSaga, result);
      }
    } else {
      yield call(failSaga, refResult);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// competition time slot post api
export function* competitonWithTimeSlotsPostApi(action) {
  try {
    const result = yield call(CompetitionAxiosApi.postTimeSlotData, action.payload);
    if (result.status === 1) {
      // if (action.isTeamPreferenceActive) {
      //   const resultPreferences = yield call(
      //     CompetitionAxiosApi.teamsTimeslotsPreferencesGet,
      //     action.id,
      //   );
      //   const resultTimeslotsList = yield call(
      //     CompetitionAxiosApi.competitionTeamsTimeslotsGet,
      //     action.id,
      //   );

      //   if (resultPreferences.status === 1 && resultTimeslotsList.status === 1) {
      //     yield put({
      //       type: ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_SUCCESS,
      //       result: resultPreferences.result.data,
      //       status: resultPreferences.status,
      //     });
      //     yield put({
      //       type: ApiConstants.API_COMPETITION_TIMESLOTS_GET_SUCCESS,
      //       result: resultTimeslotsList.result.data,
      //       status: resultTimeslotsList.status,
      //     });
      //   } else if (resultPreferences.status !== 1) {
      //     yield call(failSaga, resultPreferences);
      //   } else {
      //     yield call(failSaga, resultTimeslotsList);
      //   }
      // }

      yield put({
        type: ApiConstants.API_COMPETITION_TIMESLOT_POST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      setTimeout(() => {
        message.success(result.result.data.message);
      }, 500);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// competition team list get
export function* competitionTeamsGetSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.competitionTeamsGet, action.id);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TEAMS_GET_SUCCESS,
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

// competition team list get
// export function* competitionTimeslotsGetSaga(action) {
//   try {
//     const result = yield call(CompetitionAxiosApi.competitionTeamsTimeslotsGet, action.id);
//     if (result.status === 1) {
//       yield put({
//         type: ApiConstants.API_COMPETITION_TIMESLOTS_GET_SUCCESS,
//         result: result.result.data,
//         status: result.status,
//       });
//     } else {
//       yield call(failSaga, result);
//     }
//   } catch (error) {
//     yield call(errorSaga, error);
//   }
// }

// competition team list get
// export function* teamsTimeslotsPreferencesGetSaga(action) {
//   try {
//     const result = yield call(CompetitionAxiosApi.teamsTimeslotsPreferencesGet, action.id);
//     if (result.status === 1) {
//       yield put({
//         type: ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_SUCCESS,
//         result: result.result.data,
//         status: result.status,
//       });
//     } else {
//       yield call(failSaga, result);
//     }
//   } catch (error) {
//     yield call(errorSaga, error);
//   }
// }

// competition team list get
// export function* teamsTimeslotsPreferencesSaveSaga(action) {
//   const { id, organisationId, payload } = action;

//   try {
//     const result = yield call(
//       CompetitionAxiosApi.teamsTimeslotsPreferencesSave,
//       id,
//       organisationId,
//       payload,
//     );
//     if (result.status === 1) {
//       yield put({
//         type: ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_SAVE_SUCCESS,
//         result: result.result.data,
//         status: result.status,
//       });
//       message.success(AppConstants.settingsUpdatedMessage);
//     } else {
//       yield call(failSaga, result);
//     }
//   } catch (error) {
//     yield call(errorSaga, error);
//   }
// }

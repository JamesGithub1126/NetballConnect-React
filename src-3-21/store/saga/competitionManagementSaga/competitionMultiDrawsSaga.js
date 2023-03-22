import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';
import moment from 'moment';

import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';
import RegstrartionAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';

function getRangeCheck(action) {
  return !(action.competitionId == '-1' || action.dateRangeCheck);
}

function* failSaga(result) {
  console.log('failSaga', result.message);
  yield put({
    type: ApiConstants.API_COMPETITION_MULTI_DRAWS_FAIL,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.result?.data?.message);
  }, 800);
}

function* errorSaga(error) {
  console.log('errorSaga', error);
  yield put({
    type: ApiConstants.API_COMPETITION_MULTI_DRAWS_ERROR,
    error,
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

// get competition draws
function* getCompetitionDrawsSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCompetitionDraws,
      action.yearRefId,
      action.competitionId,
      0,
      action.roundId,
      action.orgId,
      action.startDate,
      action.endDate,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_SUCCESS,
        result: result.result.data,
        status: result.status,
        competitionId: action.competitionId,
        dateRangeCheck: action.dateRangeCheck,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* bulkLockMatchesSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.bulkLockMatches, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_LIVE_SCORE_BULK_LOCK_MATCHES_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Bulk Lock Matches succesfully.');
      history.push('/competitionDrawsOld');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// get rounds in the competition draws
function* getDrawsRoundsSaga(action) {
  const dateRangeCheck = getRangeCheck(action);
  try {
    let startDate;
    let endDate;
    const result = dateRangeCheck
      ? yield call(CompetitionAxiosApi.getDrawsRounds, action.yearRefId, action.competitionId)
      : { status: 1, result: [] };
    if (result.status === 1) {
      if (action.startDate) {
        startDate = dateRangeCheck ? null : action.startDate;
        endDate = dateRangeCheck ? null : action.endDate;
      } else {
        const date = new Date();
        startDate = dateRangeCheck ? null : moment(date).format('YYYY-MM-DD');
        endDate = dateRangeCheck ? null : moment(date).format('YYYY-MM-DD');
      }
      const VenueResult = yield call(
        RegstrartionAxiosApi.getCompetitionVenue,
        action.competitionId,
        startDate,
        endDate,
      );
      if (VenueResult.status === 1) {
        const divisionResult = yield call(
          CompetitionAxiosApi.getDivisionGradeNameList,
          action.competitionId,
          startDate,
          endDate,
        );
        if (divisionResult.status === 1) {
          yield put({
            type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_SUCCESS,
            result: dateRangeCheck ? result.result.data : [],
            dateRangeResult: dateRangeCheck ? [] : result.result.data,
            Venue_Result: VenueResult.result.data,
            division_Result: divisionResult.result.data,
            status: result.status,
          });
        } else {
          yield put({
            type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_SUCCESS,
            result: action.competitionId != '-1' || action.dateRangeCheck ? result.result.data : [],
            dateRangeResult:
              action.competitionId != '-1' || action.dateRangeCheck ? [] : result.result.data,
            Venue_Result: VenueResult.result.data,
            division_Result: [],
            status: result.status,
          });
        }
      } else {
        yield put({
          type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_SUCCESS,
          result: action.competitionId != '-1' || action.dateRangeCheck ? result.result.data : [],
          dateRangeResult:
            action.competitionId != '-1' || action.dateRangeCheck ? [] : result.result.data,
          Venue_Result: [],
          division_Result: [],
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

// Update Competition Draws
function* updateCompetitionDraws(action) {
  try {
    const result = yield call(CompetitionAxiosApi.updateDraws, action.data);
    if (result.status === 1) {
      if (action.sourceDuplicate || action.targetDuplicate) {
        const getResult = yield call(
          CompetitionAxiosApi.getCompetitionDraws,
          action.apiData.yearRefId,
          action.apiData.competitionId,
          0,
          action.apiData.roundId,
          action.apiData.orgId,
          action.apiData.startDate,
          action.apiData.endDate,
        );
        if (getResult.status === 1) {
          yield put({
            type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_SUCCESS,
            result: getResult.result.data,
            status: getResult.status,
            competitionId: action.apiData.competitionId,
            dateRangeCheck: action.dateRangeCheck,
          });
        } else {
          yield call(failSaga, getResult);
        }
      } else {
        yield put({
          type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_SUCCESS,
          result: result.result.data,
          status: result.status,
          sourceArray: action.sourceArray,
          targetArray: action.targetArray,
          actionType: action.actionType,
          drawData: action.drawData,
        });
      }
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Update Competition Draws Timeline
function* updateCompetitionDrawsTimeline(action) {
  try {
    //contains both swap and normal drag update data
    const result = yield call(
      CompetitionAxiosApi.updateDraws,
      action.data,
      action.source,
      action.target,
      action.actionType,
      action.drawData,
    );

    //updateCourtTimingsDraws is merged into updateDraws api

    const getDataResult = yield call(
      CompetitionAxiosApi.getCompetitionDraws,
      action.yearRefId,
      action.competitionId,
      0,
      action.roundId,
      action.orgId,
      action.startDate,
      action.endDate,
    );

    if (typeof action.onFinish === 'function') {
      action.onFinish(getDataResult);
    }

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_TIMELINE_BULK_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      yield put({
        type: ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_SUCCESS,
        result: getDataResult.result.data,
        status: getDataResult.status,
        competitionId: action.competitionId,
        dateRangeCheck: action.dateRangeCheck,
      });

      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
// Update Competition Draws Timeline on drag
function* updateCompetitionDrawsOnDrag(action) {
  try {
    const result = yield call(CompetitionAxiosApi.emptySideEffect, action.data);
    yield put({
      type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_SUCCESS,
      result: action.data,
      status: result.status,
    });
  } catch (error) {
    yield call(errorSaga, error);
  }
}
// Save Draws saga
function* saveDrawsSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.saveDrawsApi,
      action.yearId,
      action.competitionId,
      action.drawsMasterId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_COMPETITION_SAVE_MULTI_DRAWS_SUCCESS,
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

// Get Competition venues saga
function* getCompetitionVenues(action) {
  try {
    const result = yield call(RegstrartionAxiosApi.getCompetitionVenue, action.competitionId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_VENUES_MULTI_SUCCESS,
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

// update draws court timing where N/A(null) is there
function* updateCourtTimingsDrawsAction(action) {
  try {
    const result = yield call(CompetitionAxiosApi.updateCourtTimingsDrawsAction, action.data);
    if (result.status === 1) {
      const getResult = yield call(
        CompetitionAxiosApi.getCompetitionDraws,
        action.apiData.yearRefId,
        action.apiData.competitionId,
        0,
        action.apiData.roundId,
        action.apiData.orgId,
        action.apiData.startDate,
        action.apiData.endDate,
      );
      if (getResult.status === 1) {
        yield put({
          type: ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_SUCCESS,
          result: result.result.data,
          status: result.status,
          getResult: getResult.result.data,
          competitionId: action.apiData.competitionId,
          sourceArray: action.sourceArray,
          targetArray: action.targetArray,
          actionType: action.actionType,
          drawData: action.drawData,
          dateRangeCheck: action.dateRangeCheck,
        });
      }
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// draws division grade names list
function* getDivisionGradeNameListSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.getDivisionGradeNameList, action.competitionId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MULTI_DRAWS_DIVISION_GRADE_NAME_LIST_SUCCESS,
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

function* publishDraws(action) {
  try {
    const result = yield call(CompetitionAxiosApi.publishDrawsApi, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MULTI_DRAW_PUBLISH_SUCCESS,
        result: result.result.data,
        competitionId: action.competitionId,
        status: result.status,
      });
      if (action.key === 'edit') {
        history.push('/competitionDraws');
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* drawsMatchesListExportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.drawsMatchesListApi, action.competitionId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MULTI_DRAW_MATCHES_LIST_SUCCESS,
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

function* drawsImportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.importDraws, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_IMPORT_DRAWS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      if (!result.result.data.error || Object.keys(result.result.data.error).length === 0) {
        history.push('/competitionDraws');
        message.success('Draws Imported Successfully.');
      } else {
        if (result.result.data.message) {
          setTimeout(() => {
            message.config({
              duration: 4,
              maxCount: 1,
            });
            message.error(result.result.data.message);
          }, 800);
        }
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getDivisionSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.getDivisionGradeNameList, action.competitionId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DIVISION_MULTI_SUCCESS,
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

// update draws court timing where N/A(null) is there
function* updateDrawsLock(action) {
  try {
    const result = yield call(CompetitionAxiosApi.updateDrawsLock, action.drawsId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_MULTI_DRAWS_LOCK_SUCCESS,
        result: result.result.data,
        status: result.status,
        roundId: action.roundId,
        drawsId: action.drawsId,
        venueCourtId: action.venueCourtId,
        key: action.key,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// get active rounds in the competition draws
function* getActiveDrawsRoundsSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getActiveDrawsRounds,
      action.yearRefId,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MULTI_DRAWS_ACTIVE_ROUNDS_SUCCESS,
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

function* getVenueAndDivisionSaga(action) {
  try {
    const VenueResult = yield call(
      RegstrartionAxiosApi.getCompetitionVenue,
      action.competitionId,
      action.startDate,
      action.endDate,
    );
    if (VenueResult.status === 1) {
      const divisionResult = yield call(
        CompetitionAxiosApi.getDivisionGradeNameList,
        action.competitionId,
        action.startDate,
        action.endDate,
      );
      if (divisionResult.status === 1) {
        yield put({
          type: ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_SUCCESS,
          Venue_Result: VenueResult.result.data,
          division_Result: divisionResult.result.data,
          status: divisionResult.status,
        });
      } else {
        yield put({
          type: ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_SUCCESS,
          Venue_Result: VenueResult.result.data,
          division_Result: [],
          status: VenueResult.status,
        });
      }
    } else {
      yield call(failSaga, VenueResult);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootCompetitionMultiDrawSaga() {
  yield takeEvery(ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_LOAD, getCompetitionDrawsSaga);
  yield takeEvery(ApiConstants.API_GET_COMPETITION_MULTI_DRAWS_ROUNDS_LOAD, getDrawsRoundsSaga);
  yield takeEvery(ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_LOAD, updateCompetitionDraws);
  yield takeEvery(
    ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_TIMELINE_LOAD,
    updateCompetitionDrawsTimeline,
  );
  yield takeEvery(
    ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_DRAG_LOAD,
    updateCompetitionDrawsOnDrag,
  );
  yield takeEvery(ApiConstants.API_UPDATE_COMPETITION_SAVE_MULTI_DRAWS_LOAD, saveDrawsSaga);
  yield takeEvery(ApiConstants.API_GET_COMPETITION_VENUES_MULTI_LOAD, getCompetitionVenues);
  yield takeEvery(
    ApiConstants.API_UPDATE_COMPETITION_MULTI_DRAWS_COURT_TIMINGS_LOAD,
    updateCourtTimingsDrawsAction,
  );
  yield takeEvery(
    ApiConstants.API_MULTI_DRAWS_DIVISION_GRADE_NAME_LIST_LOAD,
    getDivisionGradeNameListSaga,
  );
  yield takeEvery(ApiConstants.API_MULTI_DRAW_PUBLISH_LOAD, publishDraws);
  yield takeEvery(ApiConstants.API_GET_LIVE_SCORE_BULK_LOCK_MATCHES_LOAD, bulkLockMatchesSaga);
  yield takeEvery(ApiConstants.API_MULTI_DRAW_MATCHES_LIST_LOAD, drawsMatchesListExportSaga);
  yield takeEvery(ApiConstants.API_GET_DIVISION_MULTI_LOAD, getDivisionSaga);
  yield takeEvery(ApiConstants.API_UPDATE_MULTI_DRAWS_LOCK_LOAD, updateDrawsLock);
  yield takeEvery(ApiConstants.API_GET_MULTI_DRAWS_ACTIVE_ROUNDS_LOAD, getActiveDrawsRoundsSaga);
  yield takeEvery(
    ApiConstants.API_MULTI_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_LOAD,
    getVenueAndDivisionSaga,
  );
  yield takeEvery(ApiConstants.API_IMPORT_DRAWS_LOAD, drawsImportSaga);
}

import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import SystemConstants from '../../../themes/systemConstants';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import CommonHttpAxiosApi from '../../http/commonHttp/commonAxiosApi';
import { message } from 'antd';
import history from '../../../util/history';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_FAIL,
    error: result,
    status: result.status,
  });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_ERROR,
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

export function* liveScoreIncidentListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreIncidentList,
      action.competitionId,
      action.search,
      action.limit,
      action.offset,
      action.sortBy,
      action.sortOrder,
      action.liveScoreCompIsParent,
      action.competitionOrganisationId,
      action.round,
      action.incidentType,
      action.incidentStatusRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_SUCCESS,
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

export function* liveScoreIncidentItemSaga(action) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_INCIDENT_ITEM_LOAD,
  });
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreIncidentItem, action.data.incidentId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_INCIDENT_ITEM_SUCCESS,
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

export function* createPlayerSuspensionSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.createPlayerSuspension, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CREATE_PLAYER_SUSPENSION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Add Suspension - Added Successfully');
      yield liveScoreIncidentItemSaga(action);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* updatePlayerSuspensionSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.updatePlayerSuspension,
      action.suspensionId,
      action.data,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_PLAYER_SUSPENSION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Update Suspension - Updated Successfully');
      yield liveScoreIncidentItemSaga(action);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* createTribunalSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.createTribunal, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CREATE_TRIBUNAL_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Add Tribunal - Added Successfully');
      yield liveScoreIncidentItemSaga(action);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* updateTribunalSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.updateTribunal, action.tribunalId, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_TRIBUNAL_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success('Update Tribunal - Updated Successfully');
      yield liveScoreIncidentItemSaga(action);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreAddEditIncidentMediaSaga(action, incidentId) {
  try {
    const mediaResult = yield call(
      LiveScoreAxiosApi.liveScoreAddEditIncidentMedia,
      action.data,
      incidentId,
    );

    if (mediaResult.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_INCIDENT_SUCCESS,
        result: mediaResult.result.data,
        status: mediaResult.status,
        umpireKey: action.data.umpireKey,
      });
      history.push('/matchDayIncidentList');
      message.success('Add Incident - Added Successfully');
    } else {
      yield call(failSaga, mediaResult);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
export function* liveScoreAddEditIncidentSaga(action) {
  try {
    // if (action.data.key === 'media') {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddEditIncident, action.data);

    if (result.status === 1) {
      if (action.data.incidentMediaIds && action.data.umpireKey) {
        yield liveScoreAddEditIncidentMediaSaga(action, result.result.data.incidentId);
      } else {
        yield put({
          type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_INCIDENT_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
        history.push('/matchDayIncidentList');
        message.success('Add Incident - Added Successfully');
      }
    } else {
      yield call(failSaga, result);
    }
    // }

    // else {
    //     const result = yield call(LiveScoreAxiosApi.liveScoreAddEditIncident, action.data);
    //     if (result.status === 1) {
    //         yield put({
    //             type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_INCIDENT_SUCCESS,
    //             result: result.result.data,
    //             status: result.status,
    //         });
    //         history.push('/matchDayIncidentList')
    //         message.success('Add Incident - Added Successfully')
    //     } else {
    //         yield call(failSaga, result)
    //     }
    // }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* liveScoreIncidentTypeSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreIncidentType, action.sportRefId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_INCIDENT_TYPE_SUCCESS,
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

export function* liveScoreGetSuspensionsDataSaga(action) {
  try {
    if (!action.suspensionApplyToList || action.suspensionApplyToList.length <= 0) {
      const refs = yield call(
        CommonHttpAxiosApi.getCommonReference,
        SystemConstants.applySuspensionTo,
      );
      if (refs.status === 1) {
        yield put({
          type: ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_SUCCESS,
          result: refs.result.data,
          status: refs.status,
        });
      } else {
        yield call(failSaga, result);
        return;
      }
    }

    const result = yield call(LiveScoreAxiosApi.liveScoreGetSuspensionsData, action.filter);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.LIVE_SCORE_GET_SUSPENSIONS_LIST_SUCCESS,
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

export function* liveScoreGetTribunalsDataSaga(action) {
  try {
    if (!action.penaltyTypeList || action.penaltyTypeList.length <= 0) {
      const payload = {
        penaltyType: 'penaltyType',
        refereeOffence: 'refereeOffence',
        appealOutcome: 'appealOutcome',
      };
      const refs = yield call(CommonHttpAxiosApi.getCommonReferenceCall, payload);
      if (refs.status === 1) {
        yield put({
          type: ApiConstants.API_PENALTY_TYPE_LIST_SUCCESS,
          result: refs.result.data.penaltyType,
          status: refs.status,
        });
        yield put({
          type: ApiConstants.API_INCIDENT_OFFENCES_LIST_SUCCESS,
          result: refs.result.data.refereeOffence,
          status: refs.status,
        });
        yield put({
          type: ApiConstants.API_APPEAL_OUTCOME_LIST_SUCCESS,
          result: refs.result.data.appealOutcome,
          status: refs.status,
        });
      } else {
        yield call(failSaga, refs);
        return;
      }
    }
    const result = yield call(LiveScoreAxiosApi.liveScoreGetTribunalsData, action.filter);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.LIVE_SCORE_GET_TRIBUNALS_LIST_SUCCESS,
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

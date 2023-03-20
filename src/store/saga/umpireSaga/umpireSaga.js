import { put, call } from 'redux-saga/effects';

import UserAxiosApi from '../../http/userHttp/userAxiosApi';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';
import UmpireAxiosApi from 'store/http/umpireHttp/umpireAxios';

import { message } from 'antd';
import history from '../../../util/history';

import ApiConstants from '../../../themes/apiConstants';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_UMPIRE_FAIL });
  let msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_UMPIRE_ERROR,
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

export function* umpireListSaga(action) {
  try {
    const result = yield call(UserAxiosApi.umpireList, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.data.userName ? 'userData' : 'data',
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// old "new" request for umpire list
export function* newUmpireListSaga(action) {
  try {
    const result = yield call(UserAxiosApi.newUmpireList, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_NEW_UMPIRE_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.data.userName ? 'userData' : 'data',
        sequence: action.data.sequence,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* availableUmpireCoachListSaga(action) {
  try {
    const result = yield call(UserAxiosApi.availableUmpireCoachList, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_AVAILABLE_UMPIRECOACH_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.data.userName ? 'userData' : 'data',
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* addEditUmpireSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.addEditUmpire,
      action.data,
      action.isUmpire,
      action.isUmpireCoach,
      action.isOtherOfficial,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ADD_UMPIRE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(
        action.extraData.isEdit
          ? AppConstants.umpireEditedMessage
          : AppConstants.umpireAddedMessage,
      );
      history.push(
        action.extraData.screenName === 'umpireDashboard' ? '/umpireDashboard' : '/umpire',
      );
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getAffiliateSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreGetAffiliate, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_AFFILIATE_LIST_SUCCESS,
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

export function* umpireSearchSaga(action) {
  try {
    // const result = yield call(UserAxiosApi.umpireList, action.data);
    const result = yield call(UserAxiosApi.umpireSearch, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_SEARCH_SUCCESS,
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

// old request for umpire list

export function* umpireListDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.umpireList_Data, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UMPIRE_MAIN_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
        key: action.data.userName ? 'userData' : 'data',
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// new requst for umpire list

export function* umpireListGetSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpireListGet, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_LIST_SUCCESS,
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

//Umpire Export
export function* exportUmpireListSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.exportUmpireList, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_UMPIRE_LIST_SUCCESS,
        result: result.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getRankedUmpiresCount(action) {
  try {
    const result = yield call(UmpireAxiosApi.getRankedUmpiresCount, action.data);
    yield put({
      type: ApiConstants.API_GET_RANKED_UMPIRES_COUNT_SUCCESS,
      result: result.result.data,
      status: result.status,
    });
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* updateUmpireRank(action) {
  try {
    const result = yield call(UmpireAxiosApi.updateUmpireRank, action.data);
    const newRankedUmpiresCount = yield call(UmpireAxiosApi.getRankedUmpiresCount, action.data);

    yield put({
      type: ApiConstants.API_GET_RANKED_UMPIRES_COUNT_SUCCESS,
      result: newRankedUmpiresCount.result.data,
      status: newRankedUmpiresCount.status,
    });

    const newUmpiresList = yield call(UmpireAxiosApi.umpireListGet, action.data);

    if (newUmpiresList.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_LIST_SUCCESS,
        result: newUmpiresList.result.data,
        status: newUmpiresList.status,
      });
    } else {
      yield call(failSaga, newUmpiresList);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getUmpireTeamsSaga(action) {
  try {
    const result = yield call(UmpireAxiosApi.umpireTeamsGet, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.GET_UMPIRE_TEAMS_SUCCESS,
        data: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getUmpiresActivityList(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.umpireActivityList, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRES_ACTIVITY_LIST_SUCCESS,
        data: result.result.data.data,
        totalCount: result.result.data.totalCount,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* umpireListCompetitionOrganisationSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.getCompetitionLinkedOrganisationsList,
      action.competitionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_COMPETITION_ORGANISATIONS_LIST_SUCCESS,
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

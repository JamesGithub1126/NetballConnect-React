import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import history from 'util/history';
import { receiptImportResult } from 'util/showImportResult';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import UserAxiosApi from "../../http/userHttp/userAxiosApi";

function* failSaga(result, actionType = undefined) {
  actionType = actionType || ApiConstants.API_LIVE_SCORE_CREATE_MATCH_FAIL;
  yield put({
    type: actionType,
    error: result,
    status: result.status,
  });

  const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
  message.config({
    duration: 1.5,
    maxCount: 1,
  });
  message.error(msg);
}

function* errorSaga(error, actionType = undefined) {
  actionType = actionType || ApiConstants.API_LIVE_SCORE_CREATE_MATCH_ERROR;
  yield put({
    type: actionType,
    error,
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

// Match List
function* liveScoreMatchListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreMatchList,
      action.competitionID,
      action.start,
      action.offset,
      action.limit,
      action.search,
      action.divisionId,
      action.roundName,
      action.teamIds,
      action.sortBy,
      action.sortOrder,
      action.competitionOrganisationId,
      action.from,
      action.to,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MATCH_LIST_SUCCESS,
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

// Add Match
function* liveScoreAddMatchSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddEditMatch, action.matchId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SUCCESS,
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

function* liveScoreAddMatchScoresSaga(action) {
  try {

    const result = yield call(LiveScoreAxiosApi.liveScoreAddEditMatchScores, action.matchId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_SUCCESS,
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

function* liveScoreUnEndMatchSaga(action) {
  try {

    const result = yield call(LiveScoreAxiosApi.liveScoreUnEndMatch, action.id);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_UN_END_MATCH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      history.push('/matchDayMatches');
      message.success('Match has been updated successfully.');

    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Add Match
function* liveScoreCreateMatchSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreCreateMatch,
      action.data,
      action.competitionId,
      action.key,
      action.isEdit,
      action.team1resultId,
      action.team2resultId,
      action.matchStatus,
      action.endTime,
      action.umpireArr,
      action.scorerData,
      action.recordUmpireType,
      action.competitionOrganisationId,
      action.matchScoresData,
      action.canRegenLadderPoints,
      action.matchTeamOfficials,
      action.officialData,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_CREATE_MATCH_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      if (action.umpireKey) {
        // history.push({ pathname: action.screenName == 'umpireList' ? "umpire" : "/umpireDashboard" });
        yield put({
          type: ApiConstants.API_LIVE_SCORE_RESET_MATCH_LIST,
          result: result.result.data,
          status: result.status,
        });
        history.push({ pathname: '/' + action.screenName });
      } else {
        history.push(
          action.key === 'dashboard'
            ? 'matchDayDashboard'
            : action.key === 'umpireRoster'
            ? 'umpireRoster'
            : '/matchDayMatches',
        );
      }

      message.success(
        action.data.id === 0
          ? 'Match has been created successfully.'
          : 'Match has been updated successfully.',
      );
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreOtherOfficialListSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.listOtherOfficial,
      action.competitionId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_OTHER_OFFICIAL_LIST_SUCCESS,
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

// Delete Match
function* liveScoreDeleteMatchSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreDeleteMatch, action.matchId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_DELETE_MATCH_SUCCESS,
        status: result.status,
      });

      history.push('/matchDayMatches');

      message.success('Match Deleted Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete Match
function* liveScoreCompetitionVenuesListSaga(action) {
  try {
    const result = yield call(
      CommonAxiosApi.getVenueList,
      action.competitionID,
      action.searchValue,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_SUCCESS,
        status: result.status,
        venues: result.result.data,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Match Import
function* liveScoreMatchImportSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreMatchImport,
      action.competitionId,
      action.csvFile,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayMatches');
        message.success('Match Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreMatchImportWithDeletingSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreMatchImportWithDeleting,
      action.competitionId,
      action.csvFile,
      action.isWithDeleting,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_WITH_DELETING_SUCCESS,
        result: result.result.data,
      });

      if (Object.keys(result.result.data.error).length === 0) {
        history.push('/matchDayMatches');
        message.success('Match Imported Successfully.');
      } else {
        receiptImportResult(result.result);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreMatchSaga({ payload, isLineup }) {
  try {
    const result = yield call(LiveScoreAxiosApi.livescoreMatchDetails, payload, isLineup);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreClubListSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreClubList, action.competitionId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_CLUB_LIST_SUCCESS,
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

function* listOtherOfficialSaga(action) {
  try {
    console.log(action);
    const result = yield call(UserAxiosApi.otherOfficialList, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_OTHER_OFFICIAL_LIST_SUCCESS,
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

function* playerLineUpStatusChangeSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.playerLineUpApi, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CHANGE_LINEUP_STATUS_SUCCESS,
        result: result.result.data,
        status: result.status,
        index: action.data.index,
        key: action.data.key,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* bulkScoreChangeSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.bulkScoreChangeApi, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.BULK_SCORE_UPDATE_SUCCESS,
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

function* liveScoreAddLiveStreamSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreAddLiveStream, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ADD_LIVE_STREAM_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Live stream link added successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreActivateFinals(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreActivateFinals, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_SUCCESS,
        status: result.status,
      });

      message.success('Activate Finals successfully.');
    } else {
      yield call(failSaga, result, ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS_ERROR);
  }
}

function* getIsLockedMatchSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.getIsLockedMatch, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_LIVE_SCORE_IS_LOCKED_MATCH_SUCCESS,
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

function* mediaReportExportSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.exportMediaReport, action.params);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_SUCCESS,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_FAILED,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_FAILED,
    });
    yield call(errorSaga, error);
  }
}

function* finaliseMatchResultSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.finaliseMatchResult, action.payload);

    if (result.status === 1) {
      let msg = result?.result?.data?.message ?? 'success';
      message.success(msg);
      yield put({
        type: ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_SUCCESS,
      });
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_FAIL,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_FAIL,
    });
    yield call(errorSaga, error);
  }
}

export function* getMatchEventsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.getMatchEvents, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_ERROR,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_ERROR,
    });
    yield call(errorSaga, error);
  }
}

export function* saveMatchEventsSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.saveMatchEvents, action.payload);
    if (result.status === 1) {
      message.success(result.result.data.message);
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_ERROR,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_ERROR,
    });
    yield call(errorSaga, error);
  }
}

export function* liveScoreMatchTeamOfficialListSaga({ matchId }) {
  try {
    const result = yield call(LiveScoreAxiosApi.getMatchTeamOfficialList, matchId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_MATCH_TEAM_OFFICIAL_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_ERROR,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_ERROR,
    });
    yield call(errorSaga, error);
  }
}

export default function* rootLiveScoreMatchSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_MATCH_LIST_LOAD, liveScoreMatchListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_LOAD, liveScoreAddMatchSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_MATCH_SCORES_LOAD, liveScoreAddMatchScoresSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_CREATE_MATCH_LOAD, liveScoreCreateMatchSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_UN_END_MATCH_LOAD, liveScoreUnEndMatchSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_MATCH_LOAD, liveScoreDeleteMatchSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_COMPETITION_VENUES_LIST_LOAD,
    liveScoreCompetitionVenuesListSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_LOAD, liveScoreMatchImportSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_MATCH_IMPORT_WITH_DELETING_LOAD,
    liveScoreMatchImportWithDeletingSaga,
  );
  yield takeEvery(ApiConstants.API_GET_LIVESCOREMATCH_DETAIL_INITIATE, liveScoreMatchSaga);
  yield takeEvery(ApiConstants.API_OTHER_OFFICIAL_LIST_LOAD, listOtherOfficialSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_CLUB_LIST_LOAD, liveScoreClubListSaga);
  yield takeEvery(ApiConstants.CHANGE_PLAYER_LINEUP_LOAD, playerLineUpStatusChangeSaga);
  yield takeEvery(ApiConstants.BULK_SCORE_UPDATE_LOAD, bulkScoreChangeSaga);
  yield takeEvery(ApiConstants.API_ADD_LIVE_STREAM_LOAD, liveScoreAddLiveStreamSaga);
  yield takeEvery(ApiConstants.API_GET_LIVE_SCORE_IS_LOCKED_MATCH_LOAD, getIsLockedMatchSaga);
  yield takeEvery(ApiConstants.API_MEDIA_REPORT_EXPORT_FILE_LOAD, mediaReportExportSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ACTIVATE_FINALS, liveScoreActivateFinals);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_FINALISE_MATCH_RESULT_LOAD, finaliseMatchResultSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_LOAD, getMatchEventsSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_LOAD, saveMatchEventsSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_MATCH_TEAM_OFFICIAL_LOAD, liveScoreMatchTeamOfficialListSaga);
}

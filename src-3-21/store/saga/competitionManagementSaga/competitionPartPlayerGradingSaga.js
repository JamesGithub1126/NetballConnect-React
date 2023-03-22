import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result) {
  console.log('failSaga', result.message);
  yield put({ type: ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_FAIL });
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
    type: ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_ERROR,
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

//competition part player grade calculate player grading summary get API
export function* getCompPartPlayerGradingSummarySaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCompPartPlayerGradingSummary,
      action.yearRefId,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_SUCCESS,
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

///////save the competition part player grade calculate player grading summary or say proposed player grading toggle
export function* saveCompPartPlayerGradingSummarySaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.saveCompPartPlayerGradingSummary, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_SUCCESS,
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

///competition part player grading get API
export function* getCompPartPlayerGradingSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.getCompPartPlayerGrading, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADING_LIST_SUCCESS,
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

// competition  part player grading add  team

export function* addNewTeamPartPlayerGradingSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.addCompetitionTeam,
      action.competitionId,
      action.divisionId,
      action.teamName,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ADD_NEW_TEAM_SUCCESS,
        result: result.result.data,
        teamName: action.teamName,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// competition  part player grading add  team

export function* dragTeamPartPlayerSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.dragAndDropAxios,
      action.competitionId,
      action.teamId,
      action.player,
      action.hasLinkedPlayers,
      action.unassignAll,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DRAG_NEW_TEAM_SUCCESS,
        result: result.result.data,
        teamName: action.teamName,
        status: result.status,
        teamId: action.teamId,
        playerId: action.player,
        source: action.source,
        destination: action.destination,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// competition  part player grading add  team

export function* partPLayerCommentSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.playerGradingComment,
      action.competitionId,
      action.divisionId,
      action.comment,
      action.playerId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PLAYER_GRADING_COMMENT_SUCCESS,
        result: result.result.data,
        status: result.status,
        comment: action.comment,
        playerId: action.playerId,
        teamIndex: action.teamId,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// / competition  part player grading add  team
export function* partPlayerSummaryCommentSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.playerGradingSummaryComment,
      action.year,
      action.competitionId,
      action.divisionId,
      action.gradingOrgId,
      action.comment,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PLAYER_GRADING_SUMMARY_COMMENT_SUCCESS,
        result: result.result.data,
        status: result.status,
        comment: action.comment,
        divisionId: action.divisionId,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//
export function* importCompetitionPlayer(action) {
  try {
    const result = yield call(CompetitionAxiosApi.importCompetitionPlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_PLAYER_IMPORT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      if (result.result.data.message) {
        setTimeout(() => {
          message.config({
            duration: 4,
            maxCount: 1,
          });
          message.info(JSON.stringify(result.result.data.message));
        }, 800);
      }
    } else {
      // let res = JSON.parse(JSON.stringify(result));
      yield put({
        type: ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_FAIL,
        status: result.status,
      });
      setTimeout(() => {
        message.config({
          duration: 4,
          maxCount: 1,
        });
        message.error(JSON.stringify(result.result.data.message));
      }, 800);

      // setTimeout(() => {
      //     alert(JSON.stringify(result.result.data.message));
      // }, 800);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* importCompetitionTeams(action) {
  try {
    const result = yield call(CompetitionAxiosApi.importCompetitionTeams, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TEAMS_IMPORT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      // let res = JSON.parse(JSON.stringify(result));
      yield put({
        type: ApiConstants.API_COMPETITION_PART_PLAYER_GRADING_FAIL,
        status: result.status,
      });
      setTimeout(() => {
        message.config({
          duration: 4,
          maxCount: 1,
        });
        message.error(JSON.stringify(result.result.data.message));
      }, 800);

      // setTimeout(() => {
      //     alert(JSON.stringify(result.result.data.message));
      // }, 800);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* deleteTeamSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.deleteTeam, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TEAM_DELETE_SUCCESS,
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

export function* playerChangeDivisionSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.playerChangeDivisionApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CHANGE_COMPETITION_DIVISION_PLAYER_SUCCESS,
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

export function* playerCommentList(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCommentList,
      action.competitionId,
      action.entityId,
      action.commentType,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMMENT_LIST_SUCCESS,
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

export function* playerGradingExport(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.exportPlayerGrading,
      action.competitionId,
      action.divisionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_PLAYER_GRADES_SUCCESS,
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

export function* getTeamForPlayerReplicationSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getTeams,
      action.organisationUniqueKey,
      action.competitionUniqueKey,
      action.divisionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEAMS_FOR_PLAYER_REPLICATION_SUCCESS,
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

export function* replicatePlayerSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.replicatePlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_PLAYER_SUCCESS,
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

export function* deletePlayerSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.deletePlayer, action.playerId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_PLAYER_SUCCESS,
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

  export function* getCompetitionForPlayerGradingSaga(action) {
    try {
      const result = yield call(CompetitionAxiosApi.getCompetition, action.competitionId);
      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_GET_COMP_FOR_PLAYER_GRADING_SUCCESS,
          result: result.result.data,
        });
      } else {
        yield call(failSaga, result);
      }
    } catch (error) {
      yield call(errorSaga, error);
    }
}

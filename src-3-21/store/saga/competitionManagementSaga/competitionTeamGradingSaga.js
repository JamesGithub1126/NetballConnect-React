import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import CompetitionAxiosApi from '../../http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';
import AppConstants from '../../../themes/appConstants';

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
    type: ApiConstants.API_COMPETITION_OWN_TEAM_GRADING_ERROR,
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
export function* getCompOwnProposedTeamGradingSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCompOwnProposedTeamGrading,
      action.yearRefId,
      action.competitionId,
      action.divisionId,
      action.gradeRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_OWN_PROPOSED_TEAM_GRADING_LIST_SUCCESS,
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

//////competition save own final team grading table data
export function* saveOwnFinalTeamGradingDataSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.saveOwnFinalTeamGradingData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_OWN_FINAL_TEAM_GRADING_SUCCESS,
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

//competition part proposed team grading get api
export function* getCompPartProposedTeamGradingSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCompPartProposedTeamGrading,
      action.yearRefId,
      action.competitionId,
      action.divisionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_PART_PROPOSED_TEAM_GRADING_LIST_SUCCESS,
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

///////competition save own final team grading table data
export function* savePartProposedTeamGradingDataSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.savePartProposedTeamGradingData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_PART_PROPOSED_TEAM_GRADING_SUCCESS,
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

/////get the own team grading summary listing data
export function* getTeamGradingSummarySaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getTeamGradingSummary,
      action.yearRefId,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_SUMMARY_LIST_SUCCESS,
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

export function* getTeamGradingOrganisationsSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getTeamGradingOrganisations,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_ORGANISATIONS_LIST_SUCCESS,
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

////////save the changed grade name in own competition team grading summary data
export function* saveUpdatedGradeTeamSummarySaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.saveUpdatedGradeTeamSummary, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_UPDATED_GRADE_NAME_TEAM_GRADING_SUMMARY_SUCCESS,
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

///////////team grading summary publish
export function* publishGradeTeamSummarySaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.publishGradeTeamSummary,
      action.yearRefId,
      action.competitionId,
      action.publishToLivescore,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PUBLISH_TEAM_GRADING_SUMMARY_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(result.result.data.message);
    } else if (result.status === 4) {
      // let res = JSON.parse(JSON.stringify(result));
      yield put({
        type: ApiConstants.API_COMPETITION_OWN_TEAM_GRADING_FAIL,
        error: result,
        status: result.status,
      });
      setTimeout(() => {
        message.config({
          duration: 4,
          maxCount: 1,
        });
        message.error(JSON.stringify(result.result.data.message));
      }, 800);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

/////////////get the competition final grades on the basis of competition and division
export function* getCompFinalGradesListSaga(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.getCompFinalGradesList,
      action.yearRefId,
      action.competitionId,
      action.divisionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_FINAL_GRADES_LIST_SUCCESS,
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

/////////////get the competition final grades on the basis of competition and division
export function* proposedTeamGradingComment(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.teamGradingComment,
      action.year,
      action.competitionId,
      action.divisionId,
      action.gradeRefId,
      action.teamId,
      action.comment,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_TEAM_GRADING_COMMENT_SUCCESS,
        result: result.result.data,
        status: result.status,
        teamId: action.teamId,
        comment: action.comment,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

/////////////part proposed team grading comment
export function* partProposedTeamGradingComment(action) {
  try {
    const result = yield call(
      CompetitionAxiosApi.partTeamGradingComment,
      action.competitionId,
      action.divisionId,
      action.teamId,
      action.comment,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PART_TEAM_GRADING_COMMENT_SUCCESS,
        result: result.result.data,
        status: result.status,
        teamId: action.teamId,
        comment: action.comment,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* deleteTeamActionSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.deleteTeamAction, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TEAM_DELETE_ACTION_SUCCESS,
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

export function* finalTeamsExportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.finalTeamsExportApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_FINAL_TEAMS_SUCCESS,
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

export function* finalPlayersExportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.finalPlayersExportApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_FINAL_PLAYERS_SUCCESS,
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

export function* proposedTeamsExportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.proposedTeamsExportApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_PROPOSED_TEAMS_SUCCESS,
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

export function* proposedPlayersExportSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.proposedPlayersExportApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_PROPOSED_PLAYERS_SUCCESS,
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

export function* teamChangeDivisionSaga(action) {
  try {
    const result = yield call(CompetitionAxiosApi.teamChangeDivisionApi, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_CHANGE_COMPETITION_DIVISION_TEAM_SUCCESS,
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

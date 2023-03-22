import { ErrorType } from './enums';
import { handleError } from './messageHandler';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';
import { message } from 'antd';

export const callDeleteDraws = async payload => {
  try {
    const result = await CompetitionAxiosApi.deleteDraws(payload);
    if (result.status == 1) {
      message.success('delete draws successfully');
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
};
export const callDeleteGrade = async payload => {
  try {
    const result = await CompetitionAxiosApi.deleteGrade(payload);
    if (result.status == 1) {
      message.success('delete grade successfully');
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
};

export const callDeleteDraw = async payload => {
  try {
    const result = await CompetitionAxiosApi.deleteDraw(payload);
    if (result.status == 1) {
      message.success('delete match successfully');
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
};
export const callUnlockDraw = async payload => {
  try {
    const result = await CompetitionAxiosApi.updateDrawsLock(payload);
    if (result.status == 1) {
      message.success(result.result.data.message);
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
};
export const callCheckDivisionName = async (competitionUniqueKey, divisionName) => {
  try {
    const result = await CompetitionAxiosApi.checkDivisionName(competitionUniqueKey, divisionName);
    if (result.status == 1) {
      return result.result.data;
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
  return null;
}

export const callRestoreDeletedDivision = async (competitionUniqueKey, divisionName) => {
  try {
    const result = await CompetitionAxiosApi.restoreDeletedDivisionName(competitionUniqueKey, divisionName);
    if (result.status == 1) {
      message.success(result.result.data.message);
      return result.result.data;
    } else {
      handleError({ result, type: ErrorType.Failed });
    }
  } catch (error) {
    handleError({ type: ErrorType.Error, error });
  }
  return null;
}
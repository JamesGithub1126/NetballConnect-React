import { put, call } from 'redux-saga/effects';
import ApiConstants from '../../../themes/apiConstants';
import AxiosApi from '../../http/registrationHttp/registrationAxiosApi';
import { message } from 'antd';
import history from '../../../util/history';
import AppConstants from '../../../themes/appConstants';

function* failSaga(result, type = ApiConstants.API_REGISTRATION_FAIL) {
  console.log('failSaga', result.result.data.message);
  yield put({
    type,
    error: result,
    status: result.status,
  });
  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error, type = ApiConstants.API_REGISTRATION_ERROR) {
  console.log('errorSaga', error);
  yield put({
    type,
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

//////get the membership fee list in registration
export function* regMembershipFeeListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.registrationMembershipFeeList,
      action.offset,
      action.limit,
      action.yearRefId,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_MEMBERSHIP_LIST_SUCCESS,
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

//////delete the membership list product
export function* regMembershipFeeListDeleteSaga(action) {
  try {
    const result = yield call(AxiosApi.registrationMembershipFeeListDelete, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_MEMBERSHIP_LIST_DELETE_SUCCESS,
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

//////get the membership  product details
export function* regGetMembershipProductDetailSaga(action) {
  try {
    const result = yield call(AxiosApi.regGetMembershipProductDetails, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_GET_MEMBERSHIP_PRODUCT_SUCCESS,
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

//////save the membership  product details
export function* regSaveMembershipProductDetailSaga(action) {
  try {
    const result = yield call(AxiosApi.regSaveMembershipProductDetails, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_SUCCESS,
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

/////get registration from
export function* getRegistrationFormSaga(action) {
  try {
    const result = yield call(AxiosApi.getRegistrationForm, action.yearId, action.competitionId);
    if (result.status === 1) {
      const resultMembershipProduct = yield call(
        AxiosApi.getMembershipProductList,
        action.competitionId,
      );
      yield put({
        type: ApiConstants.API_GET_REG_FORM_SUCCESS,
        result: result.result.data,
        MembershipProductList:
          resultMembershipProduct.result.status === 200 ? resultMembershipProduct.result.data : [],
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
///////////get the default membership  product types in registartion membership fees
export function* regDefaultMembershipProductTypesSaga(action) {
  try {
    const result = yield call(AxiosApi.regDefaultMembershipProductTypes, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_GET_DEFAULT_MEMBERSHIP_PRODUCT_TYPES_SUCCESS,
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

export function* getAffiliateMembershipSaga(action) {
  try {
    const result = yield call(AxiosApi.getParentMembershipProductDetails, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_PARENT_MEMBERSHIP_PRODUCT_SUCCESS,
        status: result.status,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//////save the membership  product fees
export function* regSaveMembershipProductFeeSaga(action) {
  try {
    const result = yield call(AxiosApi.regSaveMembershipProductFee, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_FEES_SUCCESS,
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

//////save the membership  product discount
export function* regSaveMembershipProductDiscountSaga(action) {
  try {
    const result = yield call(AxiosApi.regSaveMembershipProductDiscount, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_DISCOUNT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      // message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

/////get the membership product discount Types
export function* membershipProductDiscountTypeSaga(action) {
  try {
    const result = yield call(AxiosApi.membershipProductDiscountTypes, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MEMBERSHIP_PRODUCT_DISCOUNT_TYPE_SUCCESS,
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
//////save the save reg from
export function* regSaveRegistrationForm(action) {
  try {
    const result = yield call(AxiosApi.regSaveRegistrationForm, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_FORM_SUCCESS,
        result: result.result.data,
        status: result.status,
        payload: action.payload,
      });
      history.push('/registrationFormList');
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getMembershipproduct(action) {
  try {
    const result = yield call(AxiosApi.getMembershipProductList, action.competition);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_FORM_MEMBERSHIP_PRODUCT_SUCCESS,
        MembershipProductList: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

//////get the divisions list on the basis of year and competition
export function* getDivisionsListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getDivisionsList,
      action.yearRefId,
      action.competitionId,
      action.sourceModule,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DIVISIONS_LIST_ON_YEAR_AND_COMPETITION_SUCCESS,
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

export function* getTeamRegistrationsSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getTeamRegistrations,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEAM_REGISTRATIONS_DATA_SUCCESS,
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

export function* exportTeamRegistrationsSaga(action) {
  try {
    const result = yield call(AxiosApi.exportTeamRegistrations, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_TEAM_REGISTRATIONS_DATA_SUCCESS,
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

export function* getMembershipFeeCapListSaga(action) {
  try {
    const result = yield call(
      AxiosApi.getMembershipFeeCapList,
      action.organisationUniqueKey,
      action.yearRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MEMBERSHIP_FEE_CAP_LIST_SUCCESS,
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

export function* updateMembershipFeeCapSaga(action) {
  try {
    const result = yield call(
      AxiosApi.updateMembershipFeeCap,
      action.organisationUniqueKey,
      action.yearRefId,
      action.payload,
    );
    if (result.status === 1) {
      message.success(AppConstants.successfullyUpdated);
      yield put({
        type: ApiConstants.API_UPDATE_MEMBERSHIP_FEE_CAP_SUCCESS,
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

export function* addHardshipCodeSaga(action) {
  try {
    const result = yield call(AxiosApi.addHardshipCode, action.payload);
    if (result.status === 1) {
      message.success(AppConstants.successfullyUpdated);
      yield put({
        type: ApiConstants.ADD_HARDSHIP_CODE_SUCCESS,
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

export function* saveStateRegistrationSettingSaga(action) {
  try {
    const result = yield call(AxiosApi.saveStateRegistrationSetting, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_STATE_REGISTRATION_SETTING_LOAD_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      history.push('/userAffiliatesList');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getStateRegSettingsByOrganisationIdSaga(action) {
  try {
    const result = yield call(AxiosApi.stateRegSettingsByOrganisationId, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STATE_REGISTRATION_SETTING_BY_ORGANISATION_SUCCESS,
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

export function* getRegistrationSettingLinkSaga({ organisationUniqueKey }) {
  try {
    const result = yield call(AxiosApi.getRegSettingLinks, organisationUniqueKey);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_SETTING_LINK_SUCCESS,
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

export function* getMembershipTypeMappingsByOrganisationIdSaga(action) {
  try {
    const result = yield call(AxiosApi.getMembershipTypeMappingsByOrganisationId, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MEMBERSHIPTYPEMAPPING_BY_ORGANISATION_SUCCESS,
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

export function* getOrganisationSettingsSaga(action) {
  try {
    const result = yield call(AxiosApi.getOrganisationSettings, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORGANISATION_SETTINGS_SUCCESS,
        payload: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getTransactionFeeSaga(action) {
  try {
    const result = yield call(AxiosApi.getTransactionFee, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TRANSACTION_FEE_SUCCESS,
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

export function* getExternalMembershipTypesSaga(action) {
  try {
    const result = yield call(AxiosApi.getExternalMembershipTypes, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXTERNAL_MEMBERSHIP_TYPES_SUCCESS,
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

export function* getExternalRegistraionsSaga(action) {
  try {
    const result = yield call(AxiosApi.getExternalRegistrations, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXTERNAL_REGISTRATIONS_SUCCESS,
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

export function* exportExternalRegistraionsSaga(action) {
  try {
    const result = yield call(AxiosApi.exportExternalRegistraions, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_EXTERNAL_REGISTRATIONS_SUCCESS,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getCompetitionDataForMovingPlayerSaga(action) {
  try {
    const result = yield call(AxiosApi.getCompetitionForMovingPlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMPETITION_LIST_LOAD_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getAffiliateDataForMovingPlayerSaga(action) {
  try {
    const result = yield call(AxiosApi.getAffiliatesForMovingPlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_AFFILIATE_LIST_LOAD_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
export function* getDivisionDataForMovingPlayerSaga(action) {
  try {
    const result = yield call(AxiosApi.getDivisionForMovingPlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
export function* playerMoveButtonClickedSaga(action) {
  try {
    const result = yield call(AxiosApi.movePlayerFromFA, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MOVE_PLAYER_LOAD_SUCCESS,
        result: result.result.data.result,
        status: result.result.data.status,
      });
      message.success(AppConstants.moveMessageSuccess);
    } else {
      yield call(failSaga, result, ApiConstants.API_MOVE_PLAYER_LOAD_ERROR);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_MOVE_PLAYER_LOAD_ERROR);
  }
}

export function* replicatePlayerGetCompetitionsSaga(action) {
  try {
    const result = yield call(AxiosApi.getReplicatePlayerCompetitions, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_SUCCESS,
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

export function* replicatePlayerGetAffiliateListSaga(action) {
  try {
    const result = yield call(AxiosApi.getReplicatePlayerAffiliates, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* replicatePlayerGetDivisionListSaga(action) {
  try {
    const result = yield call(AxiosApi.getDivisionForMovingPlayer, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_SUCCESS,
        result: result.result.data.result,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* replicatePlayersSubmitSaga(action) {
  try {
    const result = yield call(AxiosApi.replicatePlayers, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REPLICATE_PLAYER_SUBMIT_SUCCESS,
        result: result.result.data.result,
        status: result.result.data.status,
      });
      message.success(AppConstants.replicateMessageSuccess);
    } else {
      yield call(failSaga, result, ApiConstants.API_REPLICATE_PLAYER_SUBMIT_ERROR);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_REPLICATE_PLAYER_SUBMIT_ERROR);
  }
}

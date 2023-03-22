import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import { isArrayNotEmpty } from 'util/helpers';
import RegistrationAxiosApi from '../../http/registrationHttp/registrationAxiosApi';
import AxiosApi from '../../http/axiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_COMPETITION_FEES_FAIL,
    error: result,
    status: result.status,
  });

  setTimeout(() => {
    message.config({
      duration: 2,
      maxCount: 1,
    });
    message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_COMPETITION_FEES_ERROR,
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

// get the competition fee list in registration
function* regCompetitionFeeListSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.registrationCompetitionFeeList,
      action.offset,
      action.limit,
      action.yearRefId,
      action.searchText,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_COMPETITION_LIST_SUCCESS,
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

// delete the competition list product
function* regCompetitionFeeListDeleteSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.registrationCompetitionFeeListDelete,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_COMPETITION_LIST_DELETE_SUCCESS,
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

// delete the competition list product
function* regCompetitionFeeListArchiveSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.registrationCompetitionFeeListArchive,
      action.competitionId,
      action.statusRefId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_COMPETITION_LIST_ARCHIVE_SUCCESS,
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

// get the competition fees all the data in one API
function* getAllCompetitionFeesDetailsSaga(action) {
  try {
    const resultCharity = isArrayNotEmpty(action.charityRoundup)
      ? { status: 1, resultcharity: { data: action.charityRoundup } }
      : yield call(AxiosApi.getCharityRoundUp, action);
    const govtVoucherResult = isArrayNotEmpty(action.govtVoucher)
      ? { status: 1, govtVoucherResult: { data: action.govtVoucher } }
      : yield call(AxiosApi.getGovtVouchers, action);

    if (resultCharity.status === 1) {
      yield put({
        type: ApiConstants.API_REG_COMPETITION_FEE_DEFAULT_CHARITY_SUCCESS,
        charityResult: resultCharity.result.data,
        govtVoucherResult: govtVoucherResult.result.data,
        status: resultCharity.status,
      });

      const resultData = yield call(
        RegistrationAxiosApi.getDefaultCompFeesMembershipProduct,
        action.hasRegistration,
        action.yearRefId,
      );
      if (resultData.status === 1) {
        yield put({
          type: ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_SUCCESS,
          result: resultData.result.data,
          status: resultData.status,
        });

        const result = yield call(
          RegistrationAxiosApi.getAllCompetitionFeesDeatils,
          action.competitionId,
          action.sourceModule,
          action.affiliateOrgId,
        );
        if (result.status === 1) {
          yield put({
            type: ApiConstants.API_GET_COMPETITION_FEES_DETAILS_SUCCESS,
            result: result.result.data,
            status: result.status,
            isEdit: action.isEdit,
          });
        } else {
          yield call(failSaga, result);
        }
      } else {
        yield call(failSaga, resultData);
      }
    } else {
      yield call(failSaga, resultCharity);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// get default competition membership product tab details
function* getDefaultCompFeesMembershipProductSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.getDefaultCompFeesMembershipProduct,
      action.hasRegistration,
      action.yearRefId,
      action.ownProduct,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_SUCCESS,
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

// get default competition membership product tab details
function* getDefaultCompFeesMembershipProductForMultipleYears(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.getDefaultCompFeesMembershipProductForMultipleYears,
      action.hasRegistration,
      action.yearRefIds,
    );
    let ln = action.yearRefIds.length;
    const membershipProducts = [];
    for (let index = 0; index < ln; index++) {
      if (result[index].status === 1) {
        membershipProducts.push({
          year: action.yearRefIds[index],
          membershipProducts: result[index].result.data.data.membershipProducts,
        });
      } else {
        message.error(result[index].result.data.message);
      }
    }
    yield put({
      type: ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_FOR_MULTI_YEAR_SUCCESS,
      result: membershipProducts,
      status: result.status,
    });
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// save the competition fees details
function* saveCompetitionFeesDetailsSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.saveCompetitionFeesDetails,
      action.payload,
      action.sourceModule,
      action.affiliateOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FEES_DETAILS_SUCCESS,
        result: result.result.data,
        status: result.status,
        isEdit: action.isEdit,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* saveAddedInviteesToCompetitionFeesDetailsSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.saveAddedInviteesToCompetitionFeesDetails,
      action.competitionId,
      action.invitees,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_ADDED_INVITEES_TO_COMPETITION_FEES_DETAILS_SUCCESS,
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

// save the competition membership tab details
function* saveCompetitionFeesMembershipTabSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.saveCompetitionFeesMembershipTab,
      action.payload,
      action.competitionId,
      action.affiliateOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FEES_MEMBERSHIP_TAB_SUCCESS,
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

// save the division table data  in the competition fees section
function* saveCompetitionFeesDivisionSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.saveCompetitionFeesDivisionAction,
      action.payload,
      action.competitionId,
      action.affiliateOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FEES_DIVISION_TAB_SUCCESS,
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

// competition format types in the competition fees section from the reference table
function* getCasualFeeDefaultSaga(action) {
  try {
    const casualPaymentOption = yield call(AxiosApi.getCasualPayment, action);
    if (casualPaymentOption.status === 1) {
      yield put({
        type: ApiConstants.GET_CASUAL_FEE_DETAIL_API_SUCCESS,
        casualPaymentOptionResult: casualPaymentOption.result.data,
        status: casualPaymentOption.status,
      });
    } else {
      yield call(failSaga, casualPaymentOption);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// competition format types in the competition fees section from the reference table
function* getSeasonalFeeDefaultSaga(action) {
  try {
    const seasonalPaymentOption = yield call(AxiosApi.getSeasonalPayment, action);
    if (seasonalPaymentOption.status === 1) {
      yield put({
        type: ApiConstants.GET_SEASONAL_FEE_DETAIL_API_SUCCESS,
        seasonalPaymentOptionResult: seasonalPaymentOption.result.data,
        status: seasonalPaymentOption.status,
      });
    } else {
      yield call(failSaga, seasonalPaymentOption);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// per match payment options from the reference table
function* getPerMatchFeeOptionsDefaultSaga(action) {
  try {
    const perMatchOptions = yield call(AxiosApi.getPerMatchOption, action);
    if (perMatchOptions.status === 1) {
      yield put({
        type: ApiConstants.GET_PER_MATCH_FEE_OPTIONS_API_SUCCESS,
        perMatchOptionResult: perMatchOptions.result.data,
        status: perMatchOptions.status,
      });
    } else {
      yield call(failSaga, perMatchOptions);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* postPaymentOptionSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.postCompetitionPayment,
      action.value,
      action.competitionId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_POST_COMPETITION_FEE_PAYMENT_SUCCESS,
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

// Save Competition fee - section
function* saveCompetitionFeesSectionSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.postCompetitionFeeSection,
      action.data,
      action.competitionId,
      action.affiliateOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_COMPETITION_FEES_SECTION_SUCCESS,
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

function* postCompetitionDiscountSaga(action) {
  try {
    const result = yield call(
      RegistrationAxiosApi.postCompetitonFeeDiscount,
      action.payload,
      action.competitionId,
      action.affiliateOrgId,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_POST_COMPETITION_FEE_DISCOUNT_SUCCESS,
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

function* defaultCompetitionDiscountSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.competitionFeeDiscountTypes, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_DISCOUNT_TYPE_SUCCESS,
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

function* defaultCharityVoucherSaga(action) {
  try {
    const result = yield call(AxiosApi.getCharityRoundUp, action);
    const govtVoucherResult = yield call(AxiosApi.getGovtVouchers, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_FEE_DEFAULT_CHARITY_SUCCESS,
        charityResult: result.result.data,
        govtVoucherResult: govtVoucherResult.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// get the default competition logo api
function* getDefaultCompFeesLogoSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getDefaultCompFeesLogo, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_FEE_DEFAULT_LOGO_SUCCESS,
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

// Invitee Search Saga
function* inviteeSearchSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.onInviteeSearch, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_FEE_INVITEES_SEARCH_SUCCESS,
        result: result.result.data,
        status: result.status,
        inviteesType: action.inviteesType,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Delete Competition Division from Comp Details
function* deleteCompetitionDivisionSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.deleteCompetitionDivision, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_DIVISION_DELETE_SUCCESS,
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

// Payment Methods
function* getPaymentMethodsDefaultSaga(action) {
  try {
    const paymentMethods = yield call(AxiosApi.getPaymentMethods, action);
    if (paymentMethods.status === 1) {
      yield put({
        type: ApiConstants.API_GET_PAYMENT_METHOD_REF_SUCCESS,
        result: paymentMethods.result.data,
        status: paymentMethods.status,
      });
    } else {
      yield call(failSaga, paymentMethods);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootCompetitionFeeSaga() {
  yield takeEvery(ApiConstants.API_REG_COMPETITION_LIST_LOAD, regCompetitionFeeListSaga);
  yield takeEvery(
    ApiConstants.API_REG_COMPETITION_LIST_DELETE_LOAD,
    regCompetitionFeeListDeleteSaga,
  );
  yield takeEvery(
    ApiConstants.API_REG_COMPETITION_LIST_ARCHIVE_LOAD,
    regCompetitionFeeListArchiveSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_FEES_DETAILS_LOAD,
    getAllCompetitionFeesDetailsSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FEES_DETAILS_LOAD,
    saveCompetitionFeesDetailsSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FEES_MEMBERSHIP_TAB_LOAD,
    saveCompetitionFeesMembershipTabSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_LOAD,
    getDefaultCompFeesMembershipProductSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_DEFAULT_COMPETITION_FEES_MEMBERSHIP_PRODUCT_FOR_MULTI_YEAR_LOAD,
    getDefaultCompFeesMembershipProductForMultipleYears,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FEES_DIVISION_TAB_LOAD,
    saveCompetitionFeesDivisionSaga,
  );
  yield takeEvery(ApiConstants.GET_CASUAL_FEE_DETAIL_API_LOAD, getCasualFeeDefaultSaga);
  yield takeEvery(ApiConstants.GET_SEASONAL_FEE_DETAIL_API_LOAD, getSeasonalFeeDefaultSaga);
  yield takeEvery(
    ApiConstants.GET_PER_MATCH_FEE_OPTIONS_API_LOAD,
    getPerMatchFeeOptionsDefaultSaga,
  );
  yield takeEvery(ApiConstants.API_POST_COMPETITION_FEE_PAYMENT_LOAD, postPaymentOptionSaga);
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FEES_SECTION_LOAD,
    saveCompetitionFeesSectionSaga,
  );
  yield takeEvery(ApiConstants.API_POST_COMPETITION_FEE_DISCOUNT_LOAD, postCompetitionDiscountSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_DISCOUNT_TYPE_LOAD, defaultCompetitionDiscountSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_FEE_DEFAULT_CHARITY_LOAD, defaultCharityVoucherSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_FEE_DEFAULT_LOGO_LOAD, getDefaultCompFeesLogoSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_FEE_INVITEES_SEARCH_LOAD, inviteeSearchSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_DIVISION_DELETE_LOAD, deleteCompetitionDivisionSaga);
  yield takeEvery(ApiConstants.API_GET_PAYMENT_METHOD_REF_LOAD, getPaymentMethodsDefaultSaga);
  yield takeEvery(
    ApiConstants.API_SAVE_ADDED_INVITEES_TO_COMPETITION_FEES_DETAILS_LOAD,
    saveAddedInviteesToCompetitionFeesDetailsSaga,
  );
}

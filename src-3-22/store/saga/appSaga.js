import { put, call, takeEvery } from 'redux-saga/effects';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import { isArrayNotEmpty } from 'util/helpers';
import AxiosApi from 'store/http/axiosApi';
import LiveScoreApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import RegistrationAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi.js';
import { getCurrentYear } from 'util/permissions';
import { setGlobalYear } from 'util/sessionStorage';

// Get the common year list reference
function* getOnlyYearListSaga(action) {
  try {
    const result = isArrayNotEmpty(action.yearsArray)
      ? {
          status: 1,
          result: { data: action.yearsArray },
        }
      : yield call(AxiosApi.getYearList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ONLY_YEAR_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common Membership Product Category Types reference
function* getMembershipProductCategoryTypesSaga() {
  try {
    const result = yield call(AxiosApi.getMembershipProductCategory);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_CATEGORY_TYPES_SUCCESS,
        result: result.result.data,
      });
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error,
      statue: error.status,
    });
  }
}

// Get the common year list reference
function* getYearListSaga(action) {
  try {
    const result = yield call(AxiosApi.getYearList, action);
    if (result.status === 1) {
      let getCurrentYearId = getCurrentYear(result.result.data);
      const resultCompetition = yield call(
        RegistrationAxiosApi.getCompetitionTypeList,
        getCurrentYearId,
      );

      if (resultCompetition.status === 1) {
        yield put({
          type: ApiConstants.API_YEAR_LIST_SUCCESS,
          result: result.result.data,
          competetionListResult: resultCompetition.result.data,
          status: result.status,
        });

        if (isArrayNotEmpty(resultCompetition.result.data)) {
          const resultMembershipProduct = yield call(
            RegistrationAxiosApi.getMembershipProductList,
            resultCompetition.result.data[0].competitionId,
          );

          if (resultMembershipProduct.status === 1) {
            let yearId = getCurrentYear(result.result.data);
            const getRegistrationFormData = yield call(
              RegistrationAxiosApi.getRegistrationForm,
              yearId,
              resultCompetition.result.data[0].competitionId,
            );

            if (getRegistrationFormData.status === 1) {
              yield put({
                type: ApiConstants.API_GET_REG_FORM_SUCCESS,
                MembershipProductList: resultMembershipProduct.result.data,
                result:
                  getRegistrationFormData.status === 1 ? getRegistrationFormData.result.data : [],
                status: result.status,
              });
            }
          }
        }
      }
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common membership product validity type list reference
function* getProductValidityListSaga(action) {
  try {
    const result = yield call(AxiosApi.getProductValidityList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PRODUCT_VALIDITY_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common Competition type list reference
function* getCompetitionTypeListSaga(action) {
  try {
    const result = yield call(RegistrationAxiosApi.getCompetitionTypeList, action.year);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TYPE_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      if (isArrayNotEmpty(result.result.data)) {
        const resultMembershipProduct = yield call(
          RegistrationAxiosApi.getMembershipProductList,
          result.result.data[0].competitionId,
        );

        if (resultMembershipProduct.status === 1) {
          const getRegistrationFormData = yield call(
            RegistrationAxiosApi.getRegistrationForm,
            action.year,
            result.result.data[0].competitionId,
          );

          // if (getRegistrationFormData.status === 1) {
          yield put({
            type: ApiConstants.API_GET_REG_FORM_SUCCESS,
            MembershipProductList: resultMembershipProduct.result.data,
            result: getRegistrationFormData.status === 1 ? getRegistrationFormData.result.data : [],
            status: result.status,
          });
          // }
        }
      }
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        // alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getVenuesTypeSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getVenue, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_FORM_VENUE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getRegFormAdvSettingsSaga(action) {
  try {
    const result = yield call(AxiosApi.getRegFormSetting, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_FORM_SETTINGS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getRegFormMethodSaga(action) {
  try {
    const result = yield call(AxiosApi.getRegFormMethod, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REG_FORM_METHOD_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common Membership Product Fees Type
function* getMembershipProductFeesTypeSaga(action) {
  try {
    const result = yield call(AxiosApi.getMembershipProductFeesType, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_FEES_TYPE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get common reference discount type
function* getCommonDiscountTypeTypeSaga(action) {
  try {
    const result = yield call(AxiosApi.getCommonDiscountTypeType, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COMMON_DISCOUNT_TYPE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Competition format types in the competition fees section from the reference table
function* getCompetitionFeeInitSaga(action) {
  try {
    const competitionType = yield call(CommonAxiosApi.getTypesOfCompetition, action);
    const competitionFormat = yield call(CommonAxiosApi.getCompetitionFormatTypes, action);
    const inviteesResult = yield call(CommonAxiosApi.getRegistrationInvitees, action);
    const paymentOptionResult = yield call(CommonAxiosApi.getPaymentOption, action);

    if (competitionType.status === 1) {
      yield put({
        type: ApiConstants.API_REG_COMPETITION_FEE_INIT_SUCCESS,
        compeitionTypeResult: competitionType.result.data,
        competitionFormat: competitionFormat.result.data,
        inviteesResult: inviteesResult.result.data,
        paymentOptionResult: paymentOptionResult.result.data,
        status: competitionType.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(competitionType.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getMatchTypesSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getMatchTypes, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MATCH_TYPES_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getCompetitionTypesSaga(action) {
  try {
    const competitionType = yield call(CommonAxiosApi.getTypesOfCompetition, action);

    if (competitionType.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_TYPES_SUCCESS,
        result: competitionType.result.data,
        status: competitionType.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(competitionType.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getCompetitionFormatTypesSaga(action) {
  try {
    const competitionFormat = yield call(CommonAxiosApi.getCompetitionFormatTypes, action);

    if (competitionFormat.status === 1) {
      yield put({
        type: ApiConstants.API_COMPETITION_FORMAT_TYPES_SUCCESS,
        result: competitionFormat.result.data,
        status: competitionFormat.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(competitionFormat.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getOnlyYearAndCompetitionListSaga(action) {
  try {
    const result = isArrayNotEmpty(action.yearData)
      ? {
          status: 1,
          result: { data: action.yearData, key: 'old' },
        }
      : yield call(CommonAxiosApi.getYearList, action);

    if (result.status === 1) {
      let yearId = action.yearId == null ? -1 : action.yearId;
      const resultCompetition = yield call(RegistrationAxiosApi.getAllCompetitionList, yearId);

      if (resultCompetition.status === 1) {
        yield put({
          type: ApiConstants.API_GET_YEAR_COMPETITION_SUCCESS,
          yearList: result.result.data,
          competetionListResult: resultCompetition.result.data,
          status: result.status,
          selectedYearId: yearId,
          data: result.result.key ? result.result.key : 'new',
        });
      }
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the OWN competition and year list reference
function* getOwnYearAndCompetitionListSaga(action) {
  try {
    const result = isArrayNotEmpty(action.yearData)
      ? {
          status: 1,
          result: { data: action.yearData },
        }
      : yield call(CommonAxiosApi.getYearList, action);

    if (result.status === 1) {
      let yearId = action.yearId == null ? getCurrentYear(result.result.data) : action.yearId;
      setGlobalYear(yearId);
      const resultCompetition = yield call(RegistrationAxiosApi.getOwnCompetitionList, yearId);

      if (resultCompetition.status === 1) {
        yield put({
          type: ApiConstants.API_GET_YEAR_OWN_COMPETITION_SUCCESS,
          yearList: result.result.data,
          competetionListResult: resultCompetition.result.data,
          status: result.status,
        });
      }
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the participate competition and year list reference
function* getParticipateYearAndCompetitionListSaga(action) {
  try {
    const result = isArrayNotEmpty(action.yearData)
      ? {
          status: 1,
          result: { data: action.yearData },
        }
      : yield call(CommonAxiosApi.getYearList, action);

    if (result.status === 1) {
      let yearId = action.yearId == null ? getCurrentYear(result.result.data) : action.yearId;
      setGlobalYear(yearId);
      const resultCompetition = yield call(
        RegistrationAxiosApi.getParticipateCompetitionList,
        yearId,
      );

      if (resultCompetition.status === 1) {
        yield put({
          type: ApiConstants.API_GET_YEAR_Participate_COMPETITION_SUCCESS,
          yearList: result.result.data,
          competetionListResult: resultCompetition.result.data,
          status: result.status,
        });
      }
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getEnhancedRoundRobinTypesSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.enhancedRoundRobin);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ENHANCED_ROUND_ROBIN_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* exportFilesSaga(action) {
  try {
    const result = yield call(LiveScoreApi.exportFiles, action.URL);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_FILES_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_EXPORT_FILES_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_EXPORT_FILES_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* userExportFilesSaga(action) {
  try {
    const result = yield call(UserAxiosApi.userExportFiles, action.URL, action.userType);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_EXPORT_FILES_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_EXPORT_FILES_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_EXPORT_FILES_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getRefBadgeSaga(action) {
  try {
    const result = isArrayNotEmpty(action.data)
      ? {
          status: 1,
          result: { data: action.data },
        }
      : yield call(AxiosApi.getRegBadgeData);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REF_BADGE_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common fee type
function* getFeeTypeSaga(action) {
  try {
    const result = yield call(AxiosApi.getFeeList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_FEE_TYPE_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common payment options
function* getPaymentOptionsSaga(action) {
  try {
    const result = yield call(AxiosApi.getPaymentOptionsList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_OPTIONS_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common payment methods
function* getPaymentMethodsSaga(action) {
  try {
    const result = yield call(AxiosApi.getPaymentMethodsList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PAYMENT_METHODS_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getDiscountMethodListSaga(action) {
  try {
    const result = yield call(AxiosApi.getDiscountMethodList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DISCOUNT_METHOD_LIST_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_APP_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_APP_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export default function* rootAppSaga() {
  yield takeEvery(ApiConstants.API_YEAR_LIST_LOAD, getYearListSaga);
  yield takeEvery(ApiConstants.API_ONLY_YEAR_LIST_LOAD, getOnlyYearListSaga);
  yield takeEvery(ApiConstants.API_PRODUCT_VALIDITY_LIST_LOAD, getProductValidityListSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_TYPE_LIST_LOAD, getCompetitionTypeListSaga);
  yield takeEvery(
    ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_CATEGORY_TYPES_LOAD,
    getMembershipProductCategoryTypesSaga,
  );
  yield takeEvery(ApiConstants.API_REG_FORM_VENUE_LOAD, getVenuesTypeSaga);
  yield takeEvery(ApiConstants.API_REG_FORM_SETTINGS_LOAD, getRegFormAdvSettingsSaga);
  yield takeEvery(ApiConstants.API_REG_FORM_METHOD_LOAD, getRegFormMethodSaga);
  yield takeEvery(
    ApiConstants.API_COMMON_MEMBERSHIP_PRODUCT_FEES_TYPE_LOAD,
    getMembershipProductFeesTypeSaga,
  );
  yield takeEvery(ApiConstants.API_COMMON_DISCOUNT_TYPE_LOAD, getCommonDiscountTypeTypeSaga);
  yield takeEvery(ApiConstants.API_REG_COMPETITION_FEE_INIT_LOAD, getCompetitionFeeInitSaga);
  yield takeEvery(ApiConstants.API_MATCH_TYPES_LOAD, getMatchTypesSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_TYPES_LOAD, getCompetitionTypesSaga);
  yield takeEvery(ApiConstants.API_COMPETITION_FORMAT_TYPES_LOAD, getCompetitionFormatTypesSaga);
  yield takeEvery(ApiConstants.API_GET_YEAR_COMPETITION_LOAD, getOnlyYearAndCompetitionListSaga);
  yield takeEvery(
    ApiConstants.API_GET_YEAR_Participate_COMPETITION_LOAD,
    getParticipateYearAndCompetitionListSaga,
  );
  yield takeEvery(ApiConstants.API_GET_YEAR_OWN_COMPETITION_LOAD, getOwnYearAndCompetitionListSaga);
  yield takeEvery(ApiConstants.API_ENHANCED_ROUND_ROBIN_LOAD, getEnhancedRoundRobinTypesSaga);
  yield takeEvery(ApiConstants.API_EXPORT_FILES_LOAD, exportFilesSaga);
  yield takeEvery(ApiConstants.API_USER_EXPORT_FILES_LOAD, userExportFilesSaga);
  yield takeEvery(ApiConstants.API_GET_REF_BADGE_LOAD, getRefBadgeSaga);
  yield takeEvery(ApiConstants.API_FEE_TYPE_LIST_LOAD, getFeeTypeSaga);
  yield takeEvery(ApiConstants.API_PAYMENT_OPTIONS_LIST_LOAD, getPaymentOptionsSaga);
  yield takeEvery(ApiConstants.API_PAYMENT_METHODS_LIST_LOAD, getPaymentMethodsSaga);
  yield takeEvery(ApiConstants.API_GET_DISCOUNT_METHOD_LIST_LOAD, getDiscountMethodListSaga);
}

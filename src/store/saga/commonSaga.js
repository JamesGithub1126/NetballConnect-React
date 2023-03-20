import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import AppConstants from 'themes/appConstants';
import ApiConstants from 'themes/apiConstants';
import ValidationConstants from 'themes/validationConstant';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import SystemConstants from '../../themes/systemConstants';

function* failSaga(result) {
  yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(result.message);
  }, 800);
}

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_COMMON_SAGA_ERROR,
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

// Get the common year list reference
function* getTimeSlotInitSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonTimeSlotInit);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_TIME_SLOT_INIT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the common year list reference
function* getCommonDataSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonData);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMMON_REF_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* userWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.userWidgets, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_WIDGETS_SUCCESS,
        result: result.result.data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* revenueWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.revenueWidgets, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.API_REVENUE_WIDGETS_SUCCESS,
        result: data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* shopPurchasesWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.shopPurchasesWidgets, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.API_SHOP_PURCHASES_WIDGETS_SUCCESS,
        result: data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* registrationWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.registrationWidgets, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.API_REGISTRATION_WIDGETS_SUCCESS,
        result: data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* registrationsGrowthWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.registrationsGrowthWidgets, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.API_REGISTRATIONS_GROWTH_WIDGETS_SUCCESS,
        result: data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* revenueGrowthWidgetsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.revenueGrowthWidgets, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.API_REVENUE_GROWTH_WIDGETS_SUCCESS,
        result: data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Add venue
function* addVenueSaga(action) {
  try {
    let venueId = action.data.venueId;
    let screenNavigationKey = action.data.screenNavigationKey;

    const result = yield call(CommonAxiosApi.addVenue, action.data);
    if (result.status === 1) {
      let venueData = result.result.data;
      venueData['screenNavigationKey'] = screenNavigationKey;

      yield put({
        type: ApiConstants.API_ADD_VENUE_SUCCESS,
        result: venueId === 0 ? venueData : null,
        status: result.result.status,
      });

      // setTimeout(() => {
      message.success(AppConstants.venueSavedSuccessfully);
      // }, 500);
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    setTimeout(() => {
      message.error('Something went wrong!');
    }, 800);

    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the Venue list for own competition venue and times
function* venueListSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getVenueList, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUE_LIST_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the grades reference data
export function* gradesReferenceListSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.gradesReferenceList);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GRADES_REFERENCE_LIST_SUCCESS,
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

// Get the favourite Team
function* favouriteTeamReferenceSaga(/* action */) {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.favouriteTeamReference,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_FAVOURITE_TEAM_REFERENCE_SUCCESS,
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

// Get the Firebird Player List
function* firebirdPlayerReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.firebirdPlayer);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_FIREBIRD_PLAYER_REFERENCE_SUCCESS,
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

// Get the Registration Other Info List
function* registrationOtherInfoReferenceSaga(/* action */) {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.registrationOtherInfo,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_OTHER_INFO_REFERENCE_SUCCESS,
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

// Get the Country List
function* countryReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.countryReference);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COUNTRY_REFERENCE_SUCCESS,
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

// Get the Nationality Reference List
function* nationalityReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.nationalityReference);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_NATIONALITY_REFERENCE_SUCCESS,
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

// Get the HeardBy Reference List
function* heardByReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.heardByReference);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_HEARDBY_REFERENCE_SUCCESS,
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

function* getDivisionFieldConfigurationSaga() {
  try {
    const result = yield call(CommonAxiosApi.getDivisionFieldConfiguration);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DIVISION_FIELD_CONFIG_SUCCESS,
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

// Get the Player Position Saga
function* playerPositionReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.playerPosition);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PLAYER_POSITION_REFERENCE_SUCCESS,
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

// Get the Venues list for User Module
function* venuesListSaga(action) {
  try {
    const result = yield call(
      CommonAxiosApi.getVenuesList,
      action.data,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUES_LIST_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* venueByIdSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getVenueById, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUE_BY_ID_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* venueDeleteSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.venueDelete, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUE_DELETE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getGenderSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getGender);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_GENDER_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getPhotoTypeSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.photoType);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_PHOTO_TYPE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getDaysSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.daysGroupName);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DAYS_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* getGenericCommonReferenceSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getGenericCommanData, action.body);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GENERIC_COMMON_REFERENCE_LOAD_SUCCESS,
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

function* getApplyToSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.applyToRef);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_APPY_TO_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getExtraTimeDrawSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.extraTimeDrawRef);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXTRA_TIME_DRAW_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getFinalsFixtureTemplateSaga(/* action */) {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.finalsFixtureTemplateRef,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_FINAL_FIXTURE_TEMPLATE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the radio meta service for send invites to
function* getSendInvitesSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.inviteTypeRef);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_INVITE_TYPE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the Venue list for own competition venue and times
function* courtListSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getCourtList, action.venueId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_COURT_LIST_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* getAllowTeamRegistrationTypeSaga(/* action */) {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.allowTeamRegistrationTypeRefId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ALLOW_TEAM_REGISTRATION_TYPE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

function* RegistrationRestrictionTypeSaga() {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.RegistrationRestrictionType,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_RESTRICTION_TYPE_SUCCESS,
        result: result.result.data,
        status: result.result.status,
      });
    } else {
      yield put({ type: ApiConstants.API_COMMON_SAGA_FAIL });

      setTimeout(() => {
        alert(result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_COMMON_SAGA_ERROR,
      error: error,
      status: error.status,
    });
  }
}

// Get the Disability Reference Saga
function* disabilityReferenceSaga(/* action */) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.disability);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DISABILITY_REFERENCE_SUCCESS,
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

function* getCommonInitSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getCommonInit, action.body);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COMMON_INIT_SUCCESS,
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

// Get state reference data
function* getStateReferenceSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getStateReference, action.body);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_STATE_REFERENCE_DATA_SUCCESS,
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

// Get the Registration payment status
function* getRegistrationPaymentStatusSaga(/* action */) {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.paymentStatusReference,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_PAYMENT_STATUS_SUCCESS,
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

// Get the match print template type
function* getMatchPrintTemplateTypeSaga() {
  try {
    const result = yield call(
      CommonAxiosApi.getMatchPrintTemplateType,
      AppConstants.matchPrintTemplateType,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MATCH_PRINT_TEMPLATE_SUCCESS,
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

// Get the match print template type
function* checkVenueAddressDuplicationSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.checkVenueDuplication, action.body);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      if (result.result.data.duplicated) {
        message.error(ValidationConstants.duplicatedVenueAddressError);
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get the Reg Change Type Reference Saga
function* registrationChangeSaga() {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.registrationChangeRef,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_CHANGE_TYPE_SUCCESS,
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

function* getMembershipPaymentOptionsSaga() {
  try {
    const result = yield call(
      CommonAxiosApi.getCommonReference,
      AppConstants.membershipPaymentOptions,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_MEMBERSHIP_PAYMENT_OPTIONS_SUCCESS,
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

export function* accreditationUmpireReferenceSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.accreditationUmpire);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ACCREDITATION_UMPIRE_REFERENCE_SUCCESS,
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

export function* accreditationUmpireCoachReferenceSaga() {
  try {
    const result = yield call(CommonAxiosApi.getCombinedUmpireCoachAccreditationReference);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ACCREDITATION_UMPIRE_COACH_COMBINED_REFERENCE_SUCCESS,
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

export function* netSetGoTshirtSizeSaga() {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, AppConstants.tShirtSizeList);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_NETSETGO_TSHIRT_SIZE_SUCCESS,
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

export function* getIncidentStatusSaga() {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, SystemConstants.incidentStatus);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_REFERENCE_INCIDENT_STATUS_SUCCESS,
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

export function* getDocumentType() {
  try {
    const result = yield call(CommonAxiosApi.getDocumentType);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_DOCUMENT_TYPE_SUCCESS,
        result: result.result.data.DocumentType,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getRelationshipListSaga() {
  try {
    const result = yield call(CommonAxiosApi.getRelationshipList, AppConstants.accreditationCoach);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_RELATIONSHIP_LIST_SUCCESS,
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

// Get ladder calculation type methods
function* getLadderReferenceListSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getLadderReferenceList, action);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LADDER_REFERENCE_LIST_SUCCESS,
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

// Get incident offences type methods
function* getIncidentOffencesTypeSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getIncidentOffencesTypeList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_INCIDENT_OFFENCES_LIST_SUCCESS,
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

// Get penalty type method
function* getPenaltyTypeSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getPenaltyTypeList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_PENALTY_TYPE_LIST_SUCCESS,
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

// Get appeal outcome method
function* getAppealOutcomeSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getAppealOutcomeList, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_APPEAL_OUTCOME_LIST_SUCCESS,
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

export function* getSuspensionApplyToSaga() {
  try {
    const result = yield call(CommonAxiosApi.getCommonReference, SystemConstants.applySuspensionTo);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_SUCCESS,
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

export function* getEmailRecipientsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.getCommunicationEmailRecipients, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_SUCCESS,
        result: result.result.data,
        payload: action.payload,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* exportEmailRecipientsSaga(action) {
  try {
    const result = yield call(CommonAxiosApi.exportCommunicationEmailRecipients, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_EMAIL_RECIPIENTS_LIST_SUCCESS,
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

export function* exportOrganisationChangesSaga(action) {
  try {
    const result = yield call(
      CommonAxiosApi.exportOrganisationChanges,
      action.payload,
      action.widget,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORG_GROWTH_EXPORT_FILE_SUCCESS,
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

export default function* rootCommonSaga() {
  yield takeEvery(ApiConstants.API_TIME_SLOT_INIT_LOAD, getTimeSlotInitSaga);
  yield takeEvery(ApiConstants.API_GET_COMMON_REF_DATA_LOAD, getCommonDataSaga);
  yield takeEvery(ApiConstants.API_ADD_VENUE_LOAD, addVenueSaga);
  yield takeEvery(ApiConstants.API_VENUE_LIST_LOAD, venueListSaga);
  yield takeEvery(ApiConstants.API_GRADES_REFERENCE_LIST_LOAD, gradesReferenceListSaga);
  yield takeEvery(ApiConstants.API_FAVOURITE_TEAM_REFERENCE_LOAD, favouriteTeamReferenceSaga);
  yield takeEvery(ApiConstants.API_FIREBIRD_PLAYER_REFERENCE_LOAD, firebirdPlayerReferenceSaga);
  yield takeEvery(
    ApiConstants.API_REGISTRATION_OTHER_INFO_REFERENCE_LOAD,
    registrationOtherInfoReferenceSaga,
  );
  yield takeEvery(ApiConstants.API_COUNTRY_REFERENCE_LOAD, countryReferenceSaga);
  yield takeEvery(ApiConstants.API_NATIONALITY_REFERENCE_LOAD, nationalityReferenceSaga);
  yield takeEvery(ApiConstants.API_DIVISION_FIELD_CONFIG_LOAD, getDivisionFieldConfigurationSaga);
  yield takeEvery(ApiConstants.API_HEARDBY_REFERENCE_LOAD, heardByReferenceSaga);
  yield takeEvery(ApiConstants.API_PLAYER_POSITION_REFERENCE_LOAD, playerPositionReferenceSaga);
  yield takeEvery(ApiConstants.API_VENUES_LIST_LOAD, venuesListSaga);
  yield takeEvery(ApiConstants.API_VENUE_BY_ID_LOAD, venueByIdSaga);
  yield takeEvery(ApiConstants.API_VENUE_DELETE_LOAD, venueDeleteSaga);
  yield takeEvery(ApiConstants.API_GET_GENDER_LOAD, getGenderSaga);
  yield takeEvery(ApiConstants.API_GET_PHOTO_TYPE_LOAD, getPhotoTypeSaga);
  yield takeEvery(ApiConstants.API_GET_DAYS_LOAD, getDaysSaga);
  yield takeEvery(ApiConstants.API_GET_APPY_TO_LOAD, getApplyToSaga);
  yield takeEvery(ApiConstants.API_GENERIC_COMMON_REFERENCE_LOAD, getGenericCommonReferenceSaga);
  yield takeEvery(ApiConstants.API_GET_DOCUMENT_TYPE_LOAD, getDocumentType);
  yield takeEvery(ApiConstants.API_GET_EXTRA_TIME_DRAW_LOAD, getExtraTimeDrawSaga);
  yield takeEvery(ApiConstants.API_GET_FINAL_FIXTURE_TEMPLATE_LOAD, getFinalsFixtureTemplateSaga);
  yield takeEvery(ApiConstants.API_GET_INVITE_TYPE_LOAD, getSendInvitesSaga);
  yield takeEvery(ApiConstants.API_USER_WIDGETS_LOAD, userWidgetsSaga);
  yield takeEvery(ApiConstants.API_REVENUE_WIDGETS_LOAD, revenueWidgetsSaga);
  yield takeEvery(ApiConstants.API_SHOP_PURCHASES_WIDGETS_LOAD, shopPurchasesWidgetsSaga);
  yield takeEvery(ApiConstants.API_REGISTRATION_WIDGETS_LOAD, registrationWidgetsSaga);
  yield takeEvery(ApiConstants.API_COURT_LIST_LOAD, courtListSaga);
  yield takeEvery(
    ApiConstants.API_ALLOW_TEAM_REGISTRATION_TYPE_LOAD,
    getAllowTeamRegistrationTypeSaga,
  );
  yield takeEvery(
    ApiConstants.API_REGISTRATION_RESTRICTION_TYPE_LOAD,
    RegistrationRestrictionTypeSaga,
  );
  yield takeEvery(ApiConstants.API_DISABILITY_REFERENCE_LOAD, disabilityReferenceSaga);
  yield takeEvery(ApiConstants.API_GET_COMMON_INIT_LOAD, getCommonInitSaga);
  yield takeEvery(ApiConstants.API_GET_STATE_REFERENCE_DATA_LOAD, getStateReferenceSaga);
  yield takeEvery(
    ApiConstants.API_REGISTRATION_PAYMENT_STATUS_LOAD,
    getRegistrationPaymentStatusSaga,
  );
  yield takeEvery(ApiConstants.API_MATCH_PRINT_TEMPLATE_LOAD, getMatchPrintTemplateTypeSaga);
  yield takeEvery(
    ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_LOAD,
    checkVenueAddressDuplicationSaga,
  );
  yield takeEvery(ApiConstants.API_REGISTRATION_CHANGE_TYPE_LOAD, registrationChangeSaga);
  yield takeEvery(
    ApiConstants.API_MEMBERSHIP_PAYMENT_OPTIONS_LOAD,
    getMembershipPaymentOptionsSaga,
  );
  yield takeEvery(
    ApiConstants.API_ACCREDITATION_UMPIRE_REFERENCE_LOAD,
    accreditationUmpireReferenceSaga,
  );
  yield takeEvery(
    ApiConstants.API_ACCREDITATION_UMPIRE_COACH_COMBINED_REFERENCE_LOAD,
    accreditationUmpireCoachReferenceSaga,
  );
  yield takeEvery(ApiConstants.API_NETSETGO_TSHIRT_SIZE_LOAD, netSetGoTshirtSizeSaga);
  yield takeEvery(ApiConstants.API_RELATIONSHIP_LIST_LOAD, getRelationshipListSaga);
  yield takeEvery(ApiConstants.API_LADDER_REFERENCE_LIST_LOAD, getLadderReferenceListSaga);
  yield takeEvery(ApiConstants.API_INCIDENT_OFFENCES_LIST_LOAD, getIncidentOffencesTypeSaga);
  yield takeEvery(ApiConstants.API_PENALTY_TYPE_LIST_LOAD, getPenaltyTypeSaga);
  yield takeEvery(ApiConstants.API_APPEAL_OUTCOME_LIST_LOAD, getAppealOutcomeSaga);
  yield takeEvery(ApiConstants.API_GET_REFERENCE_INCIDENT_STATUS_LOAD, getIncidentStatusSaga);
  yield takeEvery(
    ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_LOAD,
    getSuspensionApplyToSaga,
  );
  yield takeEvery(ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_LOAD, getEmailRecipientsSaga);
  yield takeEvery(ApiConstants.API_EXPORT_EMAIL_RECIPIENTS_LIST_LOAD, exportEmailRecipientsSaga);
  yield takeEvery(ApiConstants.API_REGISTRATIONS_GROWTH_WIDGETS_LOAD, registrationsGrowthWidgetsSaga);
  yield takeEvery(ApiConstants.API_REVENUE_GROWTH_WIDGETS_LOAD, revenueGrowthWidgetsSaga);
  yield takeEvery(ApiConstants.API_ORG_GROWTH_EXPORT_FILE_LOAD, exportOrganisationChangesSaga);
}

import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';
import history from 'util/history';
import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import { setAuthToken } from 'util/sessionStorage';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import CommonAxiosApi from 'store/http/axiosApi';
import livescoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import registrationAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';
import AxiosApi from 'store/http/registrationHttp/registrationAxiosApi';

function* failSaga(result, key) {
  yield put({
    type: ApiConstants.API_USER_FAIL,
    error: result,
    status: result.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    key ? message.error(AppConstants.errorInTFAReset) : message.error(result.result.data.message);
  }, 800);
}

function* errorSaga(error, key) {
  yield put({
    type: ApiConstants.API_USER_ERROR,
    error: error,
    status: error.status,
  });

  setTimeout(() => {
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    key ? message.error(AppConstants.errorInTFAReset) : message.error('Something went wrong.');
  }, 800);
}

function* getRoleSaga(action) {
  try {
    const result = yield call(UserAxiosApi.role, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ROLE_SUCCESS,
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

function* getUreSaga(action) {
  try {
    const result = yield call(UserAxiosApi.ure, action);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_URE_SUCCESS,
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

// Get the Affiliates Listing
function* getAffiliatesListingSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.affiliatesListing,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      if (action.payload.paging.limit == -1) {
        yield put({
          type: ApiConstants.API_AFFILIATES_IMPERSONATION_LISTING_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
      } else {
        yield put({
          type: ApiConstants.API_AFFILIATES_LISTING_SUCCESS,
          result: result.result.data,
          status: result.status,
        });
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Save the Affiliate Saga
function* saveAffiliateSaga(action) {
  try {
    const result = yield call(UserAxiosApi.saveAffiliate, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_AFFILIATE_SUCCESS,
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

// Save the Affiliate Saga
function* saveAffiliateFinderSaga(action) {
  try {
    const result = yield call(UserAxiosApi.saveAffiliateFinder, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_AFFILIATE_FINDER_SUCCESS,
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

// Save the User Organisation Saga
function* saveUserOrganisationSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.saveUserOrganisation,
      action.organisationId,
      action.payload,
    );

    if (result.status === 1) {
      const { data } = result.result;
      if (action.onSuccess) action.onSuccess(data);

      yield put({
        type: ApiConstants.API_SAVE_USER_ORGANISATION_SUCCESS,
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

// Get the Affiliate by Organisation Id
function* getAffiliateByOrganisationIdSaga(action) {
  try {
    const result = yield call(UserAxiosApi.affiliateByOrganisationId, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_AFFILIATE_BY_ORGANISATION_SUCCESS,
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

// Get the Affiliate Our Organisation Id
function* getAffiliateOurOrganisationIdSaga(action) {
  try {
    const resultcharity = yield call(CommonAxiosApi.getCharityRoundUp, action);

    if (resultcharity.status === 1) {
      const result = yield call(UserAxiosApi.affiliateByOrganisationId, action.payload);

      if (result.status === 1) {
        yield put({
          type: ApiConstants.API_AFFILIATE_OUR_ORGANISATION_SUCCESS,
          result: result.result.data,
          charityResult: resultcharity.result.data,
          status: result.status,
        });
      } else {
        yield call(failSaga, result);
      }
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getOrganisationDetailByOrganisationIdSaga(action) {
  try {
    const result = yield call(UserAxiosApi.organisationDetailByOrganisationId, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORGANISATION_DETAIL_BY_ORGANISATION_SUCCESS,
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

function* getOrganisationMembershipsByOrgIdSaga(action) {
  try {
    const result = yield call(UserAxiosApi.organisationMembershipsByOrganisationId, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORGANISATION_MEMBERSHIPS_BY_ORGID_SUCCESS,
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

// Get affiliated to organisation
function* getAffiliatedToOrganisationSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.affiliateToOrganisation,
      action.payload,
      action.searchText,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_AFFILIATE_TO_ORGANISATION_SUCCESS,
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

// Get Organisation for Venue
function* getOrganisationForVenueSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getVenueOrganisation, action.key);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_ORGANISATION_SUCCESS,
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

function* getBannerCount(action) {
  try {
    const result = yield call(UserAxiosApi.getBannerCount, action.organisationId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_BANNER_COUNT_SUCCESS,
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

// Delete Affiliate
function* deleteAffiliateSaga(action) {
  try {
    const result = yield call(UserAxiosApi.affiliateDelete, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_AFFILIATE_DELETE_SUCCESS,
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

// Get particular user organisation
function* getUserOrganisationSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserOrganisation);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_ORGANISATION_SUCCESS,
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

// Get the User Communication Privacy
function* getUserCommunicationPrivacySaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserCommunicationPrivacy, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_COMMUNICATION_PRIVACY_SUCCESS,
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

// Update the User Communication Privacy
function* updateUserCommunicationPrivacySaga(action) {
  try {
    const result = yield call(UserAxiosApi.updateCommunicationPrivacy, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_UPDATE_COMMUNICATION_PRIVACY_SUCCESS,
        result: action.payload,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get the User Dashboard Textual Listing
function* getUserDashboardTextualListingSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getUserDashboardTextualListing,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_DASHBOARD_TEXTUAL_SUCCESS,
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

// Get the User Dashboard Textual Spectator Count
function* getUserDashboardTextualSpectatorCountSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserDashboardTextualSpectatorCount, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_DASHBOARD_TEXTUAL_SPECTATOR_COUNT_SUCCESS,
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

// Get the User Module Personal Data
function* getUserModulePersonalDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModulePersonalData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_ERROR,
    });
  }
}

function* getMergeSelectedUserDataSaga({ payload }) {
  try {
    const result = yield call(UserAxiosApi.getUserModulePersonalData, payload);
    const mergeMatches = yield call(UserAxiosApi.getUserMergeMatches, payload.userId);

    if (result.status === 1 && mergeMatches.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MERGE_SELECTED_USER_SUCCESS,
        result: result.result.data,
        status: result.status,
        mergeMatches: mergeMatches.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_GET_MERGE_SELECTED_USER_ERROR,
    });
  }
}

// Get the User Module Documents
function* getUserModuleDocumentsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleDocuments, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_DOCUMENTS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_USER_MODULE_DOCUMENTS_ERROR,
    });
  }
}

// Remove Document from USER
function* removeUserModuleDocumentSaga(action) {
  try {
    const result = yield call(UserAxiosApi.removeUserModuleDocument, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_SUCCESS,
      });
      const payload = {
        userId: action.payload.userId,
      };
      yield put({
        type: ApiConstants.API_USER_MODULE_DOCUMENTS_LOAD,
        payload,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_ERROR,
    });
  }
}

// Get the User Module Personal by Competition Data
function* getUserModulePersonalByCompDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModulePersonalByCompData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_SUCCESS,
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

// Get the User Module Medical Info
function* getUserModuleMedicalInfoSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleMedicalInfo, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_MEDICAL_INFO_SUCCESS,
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

// Get the User Module Registration by Competition Data
function* getUserModuleRegistrationDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleRegistrationData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_REGISTRATION_SUCCESS,
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

function* getUserOwnRegistrationDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserOwnRegistrationData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_OWN_REGISTRATION_SUCCESS,
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

function* getUserModuleTeamMembersDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleTeamMembersData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_MODULE_TEAM_MEMBERS_SUCCESS,
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

function* getUserModuleTeamRegistrationDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleTeamRegistrationData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_TEAM_REGISTRATION_SUCCESS,
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

function* getUserModuleOtherRegistrationDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleOtherRegistrationData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_OTHER_REGISTRATION_SUCCESS,
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

// Get the User Module Activity Player
function* getUserModuleActivityPlayerSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleActivityPlayer, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_ACTIVITY_PLAYER_SUCCESS,
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

// Get the User Module Activity Parent
function* getUserModuleActivityParentSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleActivityParent, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_ACTIVITY_PARENT_SUCCESS,
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

// Get the User Module Activity Scorer
function* getUserModuleActivityScorerSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleActivityScorer, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_ACTIVITY_SCORER_SUCCESS,
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

// Get the User Module Activity Manager
function* getUserModuleActivityManagerSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleActivityManager, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_ACTIVITY_MANAGER_SUCCESS,
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

// Get the User  Friend List
function* getUserFriendListSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getUserFriendList,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_FRIEND_SUCCESS,
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

// Export User Friend Data
function* exportUserFriendSaga(action) {
  try {
    const result = yield call(UserAxiosApi.exportUserFriendList, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_USER_FRIEND_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      //  message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get the User Refer Friend List
function* getUserReferFriendListSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getUserReferFriendList,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_REFER_FRIEND_SUCCESS,
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

function* getRegistrationFormSubmissionsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getRegistrationFormSubmissions, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_SUCCESS,
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

// Export Refer a Friend Data
function* exportReferFriendSaga(action) {
  try {
    const result = yield call(UserAxiosApi.exportUserReferFriendList, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_USER_REFER_FRIEND_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      //  message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get the Org Photos List
function* getOrgPhotosListSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getOrgPhotosList, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_ORG_PHOTO_SUCCESS,
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

// Save the Org Photos
function* saveOrgPhotosSaga(action) {
  try {
    const result = yield call(UserAxiosApi.saveOrgPhoto, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_ORG_PHOTO_SUCCESS,
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

// Delete the Org Photos
function* deleteOrgPhotosSaga(action) {
  try {
    const result = yield call(UserAxiosApi.deleteOrgPhoto, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_ORG_PHOTO_SUCCESS,
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

// Delete Org Contact
function* deleteOrgContactSaga(action) {
  try {
    const result = yield call(UserAxiosApi.deleteOrgContact, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_DELETE_ORG_CONTACT_SUCCESS,
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

// Export Organisation Registration Questions
function* exportOrgRegQuestionsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.exportOrgRegQuestions, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_ORG_REG_QUESTIONS_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      //  message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}
/* Export Affiliates from the user List */
function* exportAffiliateUserSaga(action) {
  try {
    const { payload } = action;

    let result = yield call(UserAxiosApi.exportAffiliateUserData, action.payload);
    result.status === 1
      ? yield put({
          type: ApiConstants.API_EXPORT_AFFILIATE_SUCCESS,
          result: result.result.data,
          status: result.status,
        })
      : yield call(failSaga, result);
  } catch (error) {
    yield (errorSaga, error);
  }
}

// Export User Registration Data
function* exportUserRegDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.exportUserRegData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_USER_REG_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      //  message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Transfer User Registration
function* transferUserRegistrationSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.transferUserRegistration, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_TRANSFER_USER_REGISTRATION_SUCCESS,
        // result: result.result.data,
        status: result.status,
      });
    } else {
      yield put({
        type: ApiConstants.API_TRANSFER_USER_REGISTRATION_FAIL,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_TRANSFER_USER_REGISTRATION_FAIL,
    });
    yield call(errorSaga, error);
  }
}

// Get Submitted Registration Data
export function* getSubmittedRegDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getSubmittedRegData, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SUBMITTED_REG_DATA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      //  message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Get the Affiliate Directory
function* getAffiliateDirectorySaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.affiliateDirectory,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_AFFILIATE_DIRECTORY_SUCCESS,
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

function* exportAffiliateDirectorySaga(action) {
  try {
    const result = yield call(UserAxiosApi.exportAffiliateDirectory, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_AFFILIATE_DIRECTORY_SUCCESS,
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

function* updateUserProfileSaga(action) {
  try {
    const result = yield call(UserAxiosApi.updateUserProfile, action.data);

    if (result.status === 1 || result.status === 4) {
      if (action.data.section === AppConstants.statistics.toLowerCase()) {
        yield put({
          type: ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_SUCCESS,
          result: action.data,
        });
      } else {
        yield put({
          type: ApiConstants.API_USER_PROFILE_UPDATE_SUCCESS,
          result: result.status == 1 ? result.result.data : result.result.data.message,
          status: result.status,
        });
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    if (action.data.section === AppConstants.statistics.toLowerCase()) {
      yield put({
        type: ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_ERROR,
      });
    }
    yield call(errorSaga, error);
  }
}

// Get the User History
function* getUserHistorySaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserHistory, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_MODULE_HISTORY_SUCCESS,
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

// Save the User Photo
function* saveUserPhotosSaga(action) {
  try {
    const result = yield call(UserAxiosApi.saveUserPhoto, action.payload, action.userId);

    if (result.status === 1) {
      if (action.userDetail) {
        yield call(saveUserDetailSaga, { payload: action.userDetail });
      } else {
        message.success('Photo is updated successfully.');
      }

      yield put({
        type: ApiConstants.API_USER_PHOTO_UPDATE_SUCCESS,
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

// Get the User Detail
function* getUserDetailSaga() {
  try {
    const result = yield call(UserAxiosApi.getUserDetail);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_DETAIL_SUCCESS,
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

// Save User Detail
function* saveUserDetailSaga(action) {
  try {
    const result = yield call(UserAxiosApi.saveUserDetail, action.payload);

    if (result.status === 1) {
      setAuthToken(result.result.data.authToken);

      yield put({
        type: ApiConstants.API_USER_DETAIL_UPDATE_SUCCESS,
        result: result.result.data.user,
        status: result.status,
      });

      message.success('Profile is updated successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

// Update User Password
function* updateUserPasswordSaga(action) {
  try {
    const result = yield call(UserAxiosApi.updateUserPassword, action.payload);

    if (result.status === 1) {
      setAuthToken(result.result.data.authToken);

      yield put({
        type: ApiConstants.API_USER_PASSWORD_UPDATE_SUCCESS,
        result: result.result.data.user,
        status: result.status,
      });

      message.success('Password is updated successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateCharitySaga(action) {
  try {
    const result = yield call(UserAxiosApi.updateCharity, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_CHARITY_ROUND_UP_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Charity updated successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateTermsAndConditionsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.updateTermsAndConditions, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_TERMS_AND_CONDITION_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Terms and Conditions updated successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* impersonationSaga(action) {
  try {
    const result = yield call(UserAxiosApi.impersonation, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_IMPERSONATION_SUCCESS,
        result: result.result.data,
        status: result.status,
        impersonationAccess: action.payload.access,
      });
      if (action.payload.access == false) {
        history.push('/homeDashboard');
      }
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* userDeleteSaga(action) {
  try {
    const result = yield call(UserAxiosApi.deleteUserById, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_USER_DELETE_SUCCESS,
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

// Get the User Module Registration by Competition Data
function* getUserModuleIncidentDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleIncidentData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_MODULE_INCIDENT_LIST_SUCCESS,
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

function* getUserModuleSuspendedMatchesDataSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserModuleSuspendedMatchesData, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_MODULE_SUSPENDED_MATCHES_LIST_SUCCESS,
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

// Get the User Role
function* getUserRole(action) {
  try {
    const result = yield call(UserAxiosApi.getUserRoleData, action.userId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_ROLE_SUCCESS,
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

// Get the Scorer Activity Data
function* getScorerActivitySaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getScorerActivityData,
      action.payload,
      action.roleId,
      action.matchStatus,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SCORER_ACTIVITY_SUCCESS,
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

// Get the Umpire Data
function* getUmpireSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getUmpireData,
      action.payload,
      action.roleId,
      action.matchStatus,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_DATA_SUCCESS,
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

// Get the Coach Data
function* getCoachSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getCoachData,
      action.payload,
      action.roleId,
      action.matchStatus,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_COACH_DATA_SUCCESS,
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

// Get the umpire Activity Data
function* getUmpireActivityListSaga(action) {
  try {
    const result = yield call(
      livescoreAxiosApi.getUmpireActivityList,
      action.payload,
      action.roleId,
      action.userId,
      action.sortBy,
      action.sortOrder,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_UMPIRE_ACTIVITY_LIST_SUCCESS,
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

function* updateBannerCount(action) {
  try {
    const result = yield call(UserAxiosApi.updateBannerCount, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UPDATE_BANNER_COUNT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });

      message.success('Banner count updated successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getSpectatorListSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getSpectatorList, action.payload);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_SPECTATOR_LIST_SUCCESS,
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

function* registrationResendEmailSaga(action) {
  try {
    const result = yield call(UserAxiosApi.registrationResendEmail, action.teamId, action.userId);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_REGISTRATION_RESEND_EMAIL_SUCCESS,
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

function* userResetTFASaga(action) {
  try {
    const result = yield call(UserAxiosApi.resetTfaApi, action.Id);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.Api_RESET_TFA_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
      message.success(AppConstants.tfaSuccessfullyReset);
    } else {
      yield call(failSaga, result, 'TfaError');
    }
  } catch (error) {
    yield call(errorSaga, error, 'TfaError');
  }
}

function* getNetSetGoListSaga(action) {
  try {
    const result = yield call(
      UserAxiosApi.getNetSetGoList,
      action.payload,
      action.sortBy,
      action.sortOrder,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_NETSETGO_LIST_SUCCESS,
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

export function* teamMembersSaveSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.teamMembersSave, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_TEAM_MEMBERS_SAVE_SUCCESS,
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

export function* getTeamMembersSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.getTeamMembers, action.teamMemberRegId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEAM_MEMBERS_SUCCESS,
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

export function* getTeamMembersReviewSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.getTeamMembersReview, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_TEAM_MEMBERS_REVIEW_SUCCESS,
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

// function* addChildSaga(action) {
//   try {
//     const result = yield call(UserAxiosApi.addChild, action.payload);

//     if (result.status === 1 || result.status === 4) {
//       yield put({
//         type: ApiConstants.API_ADD_CHILD_SUCCESS,
//       });
//       history.goBack();
//     } else {
//       yield call(failSaga, result);
//     }
//   } catch (error) {
//     yield call(errorSaga, error);
//   }
// }

// function* addParentSaga(action) {
//   try {
//     const result = yield call(UserAxiosApi.addParent, action.payload);

//     if (result.status === 1 || result.status === 4) {
//       yield put({
//         type: ApiConstants.API_ADD_PARENT_SUCCESS,
//       });
//       history.goBack();
//     } else {
//       yield call(failSaga, result);
//     }
//   } catch (error) {
//     yield call(errorSaga, error);
//   }
// }

function* findPossibleMergeSaga(action) {
  try {
    const result = yield call(UserAxiosApi.findPossibleMerge, action.payload);

    if (result.status === 1 || result.status === 4) {
      yield put({
        type: ApiConstants.API_POSSIBLE_MATCH_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* updateTeamMembersSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.updateTeamMembers, action.data);

    if (result.status === 1 || result.status === 4) {
      yield put({
        type: ApiConstants.API_TEAM_MEMBER_UPDATE_SUCCESS,
        result: result.status == 1 ? result.result.data : result.result.data.message,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* teamMemberSendInviteSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.teamMemberSendInvite, action.data);
    if (result.status === 1) {
      message.success(result.result.data.message);
      yield put({
        type: ApiConstants.API_TEAM_MEMBER_SEND_INVITE_SUCCESS,
        //result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getOrganisationUsers(action) {
  try {
    const result = yield call(UserAxiosApi.getFilterByRelations, action.data);

    if (result.status === 1 || result.status === 4) {
      yield put({
        type: ApiConstants.API_FILTER_USERS_SUCCESS,
        result: result.status == 1 ? result.result.data : result.result.data.message,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getUsersByIdsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUsersByIds, action.data);

    if (result.status === 1 || result.status === 4) {
      yield put({
        type: ApiConstants.API_GET_USERS_BY_IDS_SUCCESS,
        result: result.status === 1 ? result.result.data : result.result.data.message,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getUserVenueGroupsSaga(action) {
  try {
    const result = yield call(UserAxiosApi.getUserVenueGroups, action.data);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_VENUE_GROUPS_SUCCESS,
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

function* getUserParentData(action) {
  try {
    const result = yield call(UserAxiosApi.getUserParentData, action.data);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_PARENT_DATA_SUCCESS,
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

function* cancelDeRegistrationSaga(action) {
  try {
    const result = yield call(registrationAxiosApi.cancelDeRegistration, action.payload);
    if (result.status === 1) {
      message.success(result.result.data.message);
      yield put({
        type: ApiConstants.API_CANCEL_DEREGISTRATION_SUCCESS,
        // result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getUserTermsAndConditions() {
  try {
    const result = yield call(UserAxiosApi.getUserTermsAndConditions);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_TERMS_AND_CONDITIONS_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getMergedUserList({ userId }) {
  try {
    const result = yield call(UserAxiosApi.getMergedUserList, userId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_MERGED_USER_LIST_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getUserDuplicatesList({ payload }) {
  try {
    const result = yield call(UserAxiosApi.getUserDuplicatesList, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_DUPLICATES_LIST_SUCCESS,
        result: result.result.data,
        payload,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* exportUserDuplicatesList({ payload }) {
  try {
    const result = yield call(UserAxiosApi.exportUserDuplicatesList, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_EXPORT_USER_DUPLICATES_LIST_SUCCESS,
        result: result.result.data,
        payload,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* userIgnoreMatchSaga({ payload }) {
  try {
    const result = yield call(UserAxiosApi.userIgnoreMatch, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_USER_IGNORE_MATCH_SUCCESS,
        payload: result.result.data,
      });
      message.success('Ignore Match Successfully');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* undeleteUser(payload) {
  try {
    const result = yield call(UserAxiosApi.undeleteUser, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_UNDELETE_MERGED_USER_SUCCESS,
        payload,
      });
      message.success(result.result.data.message);
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* saveUserTermsAndConditions({ payload }) {
  try {
    const result = yield call(UserAxiosApi.saveUserTermsAndConditions, payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_SAVE_USER_TERMS_AND_CONDITIONS_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export function* getSummaryScoringByUserSaga(action) {
  try {
    const result = yield call(livescoreAxiosApi.getSummaryScoringByUser, action.payload);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_SUCCESS,
        result: result.result.data,
        status: result.status,
        aggregate: action.payload.aggregate,
      });
    } else {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_ERROR,
        aggregate: action.aggregate,
      });
      yield call(failSaga, result);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_ERROR,
      aggregate: action.aggregate,
    });
    yield call(errorSaga, error);
  }
}

function* getSateSettingsSaga(payload) {
  try {
    const result = yield call(UserAxiosApi.getSateSettings, payload.organisationId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STATE_SETTINGS_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* getStateOrganisationsSaga(payload) {
  try {
    const result = yield call(UserAxiosApi.getStateOrganisations, payload.organisationId);
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_STATE_ORGANISATIONS_SUCCESS,
        payload: result.result.data,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

export default function* rootUserSaga() {
  yield takeEvery(ApiConstants.API_ROLE_LOAD, getRoleSaga);
  yield takeEvery(ApiConstants.API_URE_LOAD, getUreSaga);
  yield takeEvery(ApiConstants.API_AFFILIATES_LISTING_LOAD, getAffiliatesListingSaga);
  yield takeEvery(ApiConstants.API_SAVE_AFFILIATE_LOAD, saveAffiliateSaga);
  yield takeEvery(ApiConstants.API_SAVE_AFFILIATE_FINDER_LOAD, saveAffiliateFinderSaga);
  yield takeEvery(ApiConstants.API_SAVE_USER_ORGANISATION_LOAD, saveUserOrganisationSaga);
  yield takeEvery(
    ApiConstants.API_AFFILIATE_BY_ORGANISATION_LOAD,
    getAffiliateByOrganisationIdSaga,
  );
  yield takeEvery(
    ApiConstants.API_ORGANISATION_DETAIL_BY_ORGANISATION_LOAD,
    getOrganisationDetailByOrganisationIdSaga,
  );
  yield takeEvery(
    ApiConstants.API_ORGANISATION_MEMBERSHIPS_BY_ORGID_LOAD,
    getOrganisationMembershipsByOrgIdSaga,
  );
  yield takeEvery(
    ApiConstants.API_AFFILIATE_OUR_ORGANISATION_LOAD,
    getAffiliateOurOrganisationIdSaga,
  );
  yield takeEvery(ApiConstants.API_AFFILIATE_TO_ORGANISATION_LOAD, getAffiliatedToOrganisationSaga);
  yield takeEvery(ApiConstants.API_ORGANISATION_LOAD, getOrganisationForVenueSaga);
  yield takeEvery(ApiConstants.API_AFFILIATE_DELETE_LOAD, deleteAffiliateSaga);
  yield takeEvery(ApiConstants.API_GET_USER_ORGANISATION_LOAD, getUserOrganisationSaga);
  yield takeEvery(
    ApiConstants.API_USER_COMMUNICATION_PRIVACY_LOAD,
    getUserCommunicationPrivacySaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_UPDATE_COMMUNICATION_PRIVACY_LOAD,
    updateUserCommunicationPrivacySaga,
  );
  yield takeEvery(ApiConstants.API_USER_DASHBOARD_TEXTUAL_LOAD, getUserDashboardTextualListingSaga);
  yield takeEvery(
    ApiConstants.API_USER_DASHBOARD_TEXTUAL_SPECTATOR_COUNT_LOAD,
    getUserDashboardTextualSpectatorCountSaga,
  );
  yield takeEvery(ApiConstants.API_USER_MODULE_PERSONAL_DETAIL_LOAD, getUserModulePersonalDataSaga);
  yield takeEvery(ApiConstants.API_GET_MERGE_SELECTED_USER_LOAD, getMergeSelectedUserDataSaga);
  yield takeEvery(ApiConstants.API_USER_MODULE_DOCUMENTS_LOAD, getUserModuleDocumentsSaga);
  yield takeEvery(ApiConstants.API_USER_MODULE_REMOVE_DOCUMENT_LOAD, removeUserModuleDocumentSaga);
  yield takeEvery(
    ApiConstants.API_USER_MODULE_PERSONAL_BY_COMPETITION_LOAD,
    getUserModulePersonalByCompDataSaga,
  );
  yield takeEvery(ApiConstants.API_USER_MODULE_MEDICAL_INFO_LOAD, getUserModuleMedicalInfoSaga);
  yield takeEvery(
    ApiConstants.API_USER_MODULE_REGISTRATION_LOAD,
    getUserModuleRegistrationDataSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_OWN_REGISTRATION_LOAD,
    getUserOwnRegistrationDataSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_TEAM_REGISTRATION_LOAD,
    getUserModuleTeamRegistrationDataSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_OTHER_REGISTRATION_LOAD,
    getUserModuleOtherRegistrationDataSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_ACTIVITY_PLAYER_LOAD,
    getUserModuleActivityPlayerSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_ACTIVITY_PARENT_LOAD,
    getUserModuleActivityParentSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_ACTIVITY_SCORER_LOAD,
    getUserModuleActivityScorerSaga,
  );
  yield takeEvery(
    ApiConstants.API_USER_MODULE_ACTIVITY_MANAGER_LOAD,
    getUserModuleActivityManagerSaga,
  );
  yield takeEvery(ApiConstants.API_USER_FRIEND_LOAD, getUserFriendListSaga);
  yield takeEvery(ApiConstants.API_EXPORT_USER_FRIEND_LOAD, exportUserFriendSaga);
  yield takeEvery(ApiConstants.API_USER_REFER_FRIEND_LOAD, getUserReferFriendListSaga);
  yield takeEvery(
    ApiConstants.API_REGISTRATION_FORM_SUBMISSIONS_LOAD,
    getRegistrationFormSubmissionsSaga,
  );
  yield takeEvery(ApiConstants.API_EXPORT_USER_REFER_FRIEND_LOAD, exportReferFriendSaga);
  yield takeEvery(ApiConstants.API_GET_ORG_PHOTO_LOAD, getOrgPhotosListSaga);
  yield takeEvery(ApiConstants.API_SAVE_ORG_PHOTO_LOAD, saveOrgPhotosSaga);
  yield takeEvery(ApiConstants.API_DELETE_ORG_PHOTO_LOAD, deleteOrgPhotosSaga);
  yield takeEvery(ApiConstants.API_DELETE_ORG_CONTACT_LOAD, deleteOrgContactSaga);
  yield takeEvery(ApiConstants.API_EXPORT_ORG_REG_QUESTIONS_LOAD, exportOrgRegQuestionsSaga);
  yield takeEvery(ApiConstants.API_EXPORT_USER_REG_DATA_LOAD, exportUserRegDataSaga);
  yield takeEvery(ApiConstants.API_TRANSFER_USER_REGISTRATION_LOAD, transferUserRegistrationSaga);
  yield takeEvery(ApiConstants.API_EXPORT_AFFILIATE_LOAD_DATA, exportAffiliateUserSaga);
  yield takeEvery(ApiConstants.API_GET_SUBMITTED_REG_DATA_LOAD, getSubmittedRegDataSaga);
  yield takeEvery(ApiConstants.API_AFFILIATE_DIRECTORY_LOAD, getAffiliateDirectorySaga);
  yield takeEvery(ApiConstants.API_EXPORT_AFFILIATE_DIRECTORY_LOAD, exportAffiliateDirectorySaga);
  yield takeEvery(ApiConstants.API_USER_PROFILE_UPDATE_LOAD, updateUserProfileSaga);
  yield takeEvery(ApiConstants.API_USER_PROFILE_UPDATE_HIDE_STATISTICS_LOAD, updateUserProfileSaga);
  yield takeEvery(ApiConstants.API_USER_MODULE_HISTORY_LOAD, getUserHistorySaga);
  yield takeEvery(ApiConstants.API_USER_PHOTO_UPDATE_LOAD, saveUserPhotosSaga);
  yield takeEvery(ApiConstants.API_USER_DETAIL_LOAD, getUserDetailSaga);
  yield takeEvery(ApiConstants.API_USER_DETAIL_UPDATE_LOAD, saveUserDetailSaga);
  yield takeEvery(ApiConstants.API_USER_PASSWORD_UPDATE_LOAD, updateUserPasswordSaga);
  yield takeEvery(ApiConstants.API_UPDATE_CHARITY_ROUND_UP_LOAD, updateCharitySaga);
  yield takeEvery(ApiConstants.API_UPDATE_TERMS_AND_CONDITION_LOAD, updateTermsAndConditionsSaga);
  yield takeEvery(ApiConstants.API_IMPERSONATION_LOAD, impersonationSaga);
  yield takeEvery(ApiConstants.API_USER_DELETE_LOAD, userDeleteSaga);
  yield takeEvery(
    ApiConstants.API_GET_USER_MODULE_INCIDENT_LIST_LOAD,
    getUserModuleIncidentDataSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_USER_MODULE_SUSPENDED_MATCHES_LIST_LOAD,
    getUserModuleSuspendedMatchesDataSaga,
  );
  yield takeEvery(ApiConstants.API_GET_USER_ROLE_LOAD, getUserRole);
  yield takeEvery(ApiConstants.API_GET_SCORER_ACTIVITY_LOAD, getScorerActivitySaga);
  yield takeEvery(ApiConstants.API_GET_UMPIRE_DATA_LOAD, getUmpireSaga);
  yield takeEvery(ApiConstants.API_GET_COACH_DATA_LOAD, getCoachSaga);
  yield takeEvery(ApiConstants.API_GET_UMPIRE_ACTIVITY_LIST_LOAD, getUmpireActivityListSaga);
  yield takeEvery(ApiConstants.API_BANNER_COUNT_LOAD, getBannerCount);
  yield takeEvery(ApiConstants.API_UPDATE_BANNER_COUNT_LOAD, updateBannerCount);
  yield takeEvery(ApiConstants.API_GET_SPECTATOR_LIST_LOAD, getSpectatorListSaga);
  yield takeEvery(ApiConstants.API_REGISTRATION_RESEND_EMAIL_LOAD, registrationResendEmailSaga);
  yield takeEvery(ApiConstants.Api_RESET_TFA_LOAD, userResetTFASaga);
  yield takeEvery(
    ApiConstants.API_GET_USER_MODULE_TEAM_MEMBERS_LOAD,
    getUserModuleTeamMembersDataSaga,
  );
  yield takeEvery(ApiConstants.API_GET_NETSETGO_LIST_LOAD, getNetSetGoListSaga);
  yield takeEvery(ApiConstants.API_TEAM_MEMBERS_SAVE_LOAD, teamMembersSaveSaga);
  yield takeEvery(ApiConstants.API_GET_TEAM_MEMBERS_LOAD, getTeamMembersSaga);
  yield takeEvery(ApiConstants.API_GET_TEAM_MEMBERS_REVIEW_LOAD, getTeamMembersReviewSaga);
  yield takeEvery(ApiConstants.API_POSSIBLE_MATCH_LOAD, findPossibleMergeSaga);
  yield takeEvery(ApiConstants.API_TEAM_MEMBER_UPDATE_LOAD, updateTeamMembersSaga);
  yield takeEvery(ApiConstants.API_TEAM_MEMBER_SEND_INVITE_LOAD, teamMemberSendInviteSaga);
  yield takeEvery(ApiConstants.API_FILTER_USERS_LOAD, getOrganisationUsers);
  yield takeEvery(ApiConstants.API_GET_USERS_BY_IDS_LOAD, getUsersByIdsSaga);
  yield takeEvery(ApiConstants.API_GET_USER_VENUE_GROUPS_LOAD, getUserVenueGroupsSaga);
  yield takeEvery(ApiConstants.API_GET_USER_PARENT_DATA_LOAD, getUserParentData);
  yield takeEvery(ApiConstants.API_CANCEL_DEREGISTRATION_LOAD, cancelDeRegistrationSaga);
  yield takeEvery(ApiConstants.API_GET_USER_TERMS_AND_CONDITIONS_LOAD, getUserTermsAndConditions);
  yield takeEvery(ApiConstants.API_SAVE_USER_TERMS_AND_CONDITIONS_LOAD, saveUserTermsAndConditions);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GET_SUMMARY_SCORING_BY_USER_LOAD,
    getSummaryScoringByUserSaga,
  );
  yield takeEvery(ApiConstants.API_STATE_SETTINGS_LOAD, getSateSettingsSaga);
  yield takeEvery(ApiConstants.API_STATE_ORGANISATIONS_LOAD, getStateOrganisationsSaga);
  yield takeEvery(ApiConstants.API_GET_MERGED_USER_LIST_LOAD, getMergedUserList);
  yield takeEvery(ApiConstants.API_UNDELETE_MERGED_USER_LOAD, undeleteUser);
  yield takeEvery(ApiConstants.API_GET_USER_DUPLICATES_LIST_LOAD, getUserDuplicatesList);
  yield takeEvery(ApiConstants.API_EXPORT_USER_DUPLICATES_LIST_LOAD, exportUserDuplicatesList);
  yield takeEvery(ApiConstants.API_GET_USER_IGNORE_MATCH_LOAD, userIgnoreMatchSaga);
}

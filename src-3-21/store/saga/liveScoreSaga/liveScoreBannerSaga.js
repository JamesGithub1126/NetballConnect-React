import { put, call, takeEvery } from 'redux-saga/effects';
import { message } from 'antd';

import ApiConstants from 'themes/apiConstants';
import AppConstants from 'themes/appConstants';
import { getOrganisationData } from 'util/sessionStorage';
import LiveScoreAxiosApi from '../../http/liveScoreHttp/liveScoreAxiosApi';

function* failSaga(result) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_BANNERS_FAIL,
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

function* errorSaga(error) {
  yield put({
    type: ApiConstants.API_LIVE_SCORE_BANNERS_ERROR,
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

function* liveScoreBannerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreBannerList,
      action.competitionID,
      action.organisationID,
    );
    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BANNERS_SUCCESS,
        result: result.result.data,
        status: result.status,
        navigation: action.navigation,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreAddBannerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAddBanner,
      action.organisationID,
      action.competitionID,
      action.bannerImage,
      // action.showOnHome,
      // action.showOnDraws,
      // action.showOnLadder,
      // action.showOnNews,
      // action.showOnChat,
      action.format,
      action.bannerLink,
      action.bannerId,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_BANNER_SUCCESS,
        result: result.result.data,
        status: result.status,
        navigation: action.navigation,
      });
      message.success('Banner added successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreAddCommunicationBannerSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreAddCommunicationBanner,
      action.organisationID,
      action.sponsorName,
      action.horizontalBannerImage,
      action.horizontalBannerLink,
      action.squareBannerImage,
      action.squareBannerLink,
      action.bannerId,
      action.horizontalBannerImg,
      action.squareBannerImg,
    );

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_LIVE_SCORE_ADD_COMMUNICATION_BANNER_SUCCESS,
        result: result.result.data,
        status: result.status,
        navigation: action.navigation,
      });
      message.success('Communication Banner Added Successfully.');
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreRemoveBannerSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.liveScoreRemoveBanner, action.bannerId);
    if (result.status === 1) {
      const res = yield call(
        LiveScoreAxiosApi.liveScoreBannerList,
        action.competitionId,
        action.organisationId,
      );

      yield put({
        type: ApiConstants.API_LIVE_SCORE_BANNERS_SUCCESS,
        result: res.result.data,
        status: res.status,
        navigation: action.navigation,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* liveScoreRemoveBannerImageSaga(action) {
  try {
    const result = yield call(
      LiveScoreAxiosApi.liveScoreRemoveBannerImage,
      action.bannerId,
      action.ratioType,
    );
    if (result.status === 1) {
      const { organisationId } = getOrganisationData() || {};
      const res = yield call(LiveScoreAxiosApi.liveScoreBannerList, null, organisationId);
      yield put({
        type: ApiConstants.API_LIVE_SCORE_BANNERS_SUCCESS,
        result: res.result.data,
        status: res.status,
        navigation: action.navigation,
      });
    } else {
      yield call(failSaga, result);
    }
  } catch (error) {
    yield call(errorSaga, error);
  }
}

function* exportEngagementSaga(action) {
  try {
    const result = yield call(LiveScoreAxiosApi.exportEngagements, action.params);

    if (result.status === 1) {
      yield put({
        type: ApiConstants.API_GET_EXPORT_ENGAGEMENT_SUCCESS,
        result: result.result.data,
        status: result.status,
      });
    } else {
      yield call(failSaga, result, ApiConstants.API_LIVE_SCORE_BANNERS_FAIL);
    }
  } catch (error) {
    yield call(errorSaga, error, ApiConstants.API_LIVE_SCORE_BANNERS_ERROR);
  }
}

export default function* rootLiveScoreBannerSaga() {
  yield takeEvery(ApiConstants.API_LIVE_SCORE_BANNERS_LOAD, liveScoreBannerSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_BANNER_LOAD, liveScoreAddBannerSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_ADD_COMMUNICATION_BANNER_LOAD,
    liveScoreAddCommunicationBannerSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_LOAD, liveScoreRemoveBannerSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_IMAGE_LOAD,
    liveScoreRemoveBannerImageSaga,
  );
  yield takeEvery(ApiConstants.API_GET_EXPORT_ENGAGEMENT_LOAD, exportEngagementSaga);
}

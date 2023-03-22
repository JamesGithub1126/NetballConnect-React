/* eslint-disable no-param-reassign */
import ApiConstants from 'themes/apiConstants';
import AppConstants from '../../../themes/appConstants';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  bannerResult: [],
  showOnHome: false,
  showOnDraws: false,
  showOnLadder: false,
  showOnNews: false,
  showOnChat: false,
  bannerLink: 'https://',
  squareBannerLink: 'https://',
  horizontalBannerLink: 'https://',
  bannerUrl: null,
  format: '',
  sponsorName: '',
};

function LiveScoreBannerState(state = initialState, action) {
  switch (action.type) {
    // Banner List Case
    case ApiConstants.API_LIVE_SCORE_BANNERS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_BANNERS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        bannerResult: action.result,
        status: action.status,
      };

    // Add Banner Case
    case ApiConstants.API_LIVE_SCORE_ADD_BANNER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_ADD_BANNER_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    // Add Communication Case
    case ApiConstants.API_LIVE_SCORE_ADD_COMMUNICATION_BANNER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_EXPORT_ENGAGEMENT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_EXPORT_ENGAGEMENT_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_COMMUNICATION_BANNER_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    // Remove Banner Case
    case ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_IMAGE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_REMOVE_BANNER_IMAGE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BANNERS_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_BANNERS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_BANNER_UPDATE:
      if (action.key === 'isEditBanner') {
        // state.showOnHome = action.data.showOnHome === 1;
        // state.showOnDraws = action.data.showOnDraws === 1;
        // state.showOnLadder = action.data.showOnLadder === 1;
        // state.showOnNews = action.data.showOnNews === 1;
        // state.showOnChat = action.data.showOnChat === 1;
        state.format = action.data.format;
        state.bannerLink =
          state.format === AppConstants.horizontal
            ? action.data.horizontalBannerLink
            : action.data.squareBannerLink;
        state.bannerUrl =
          state.format === AppConstants.horizontal
            ? action.data.horizontalBannerUrl
            : action.data.squareBannerUrl;
      } else if (action.key === 'isAddBanner') {
        // state.showOnHome = false;
        // state.showOnDraws = false;
        // state.showOnLadder = false;
        // state.showOnNews = false;
        // state.showOnChat = false;
        state.format = '';
        state.bannerLink = 'https://';
        state.bannerUrl = null;
      } else {
        state[action.key] = action.data;
      }
      return {
        ...state,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_COMMUNICATION_BANNER_UPDATE:
      if (action.key === 'isEditBanner') {
        state.horizontalBannerLink = action.data.horizontalBannerLink || 'https://';
        state.squareBannerLink = action.data.squareBannerLink || 'https://';
        state.sponsorName = action.data.sponsorName;
      } else if (action.key === 'isAddBanner') {
        state.sponsorName = '';
        state.horizontalBannerLink = 'https://';
        state.squareBannerLink = 'https://';
      } else {
        state[action.key] = action.data;
      }
      return {
        ...state,
      };

    case ApiConstants.API_LIVE_SCORE_CLEAR_BANNER_REDUCER:
      state.showOnDraws = false;
      state.showOnHome = false;
      state.showOnLadder = false;
      state.showOnNews = false;
      state.showOnChat = false;
      state.format = '';
      return { ...state };

    default:
      return state;
  }
}

export default LiveScoreBannerState;

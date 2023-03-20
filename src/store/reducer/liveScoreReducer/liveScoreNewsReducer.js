import ApiConstants from '../../../themes/apiConstants';
import moment from 'moment';
// import { isArrayNotEmpty, isNotNullOrEmptyString } from '../../../util/helpers';
import { getLiveScoreCompetition } from '../../../util/sessionStorage';
import AppConstants from 'themes/appConstants';

var object = {
  id: '',
  title: '',
  newsImage: null,
  newsVideo: null,
  deleteNewsImage: null,
  deleteNewsVideo: null,
  isActive: 1,
  isNotification: 0,
  body: '',
  updated_at: '',
  published_at: null,
  deleted_at: null,
  entityId: 1,
  entityTypeId: 1,
  author: null,
  created_at: '',
  toUserRoleIds: null,
  toRosterRoleIds: null,
  toUserIds: null,
  recipients: [],
  news_expire_date: null,
  expire_date: '',
  expire_time: '',
  recipientRefId: null,
};
const initialState = {
  onLoad: false,
  onLoad_2: false,
  error: null,
  result: null,
  status: 0,
  liveScoreNewsListData: [],
  addEditNews: object,
  editData: [],
  addNewsResult: [],
  news_expire_date: '',
  news_expire_time: '',
  expire_date: null,
  expire_time: null,
  notificationResult: [],
  deleteNews: [],
  newExpiryDate: null,
  newExpiryTime: null,
  newsBody: null,
  allOrg: false,
  indivisualOrg: false,
  success: false,
  newsImage: null,
  newsVideo: null,
};

function liveScoreNewsState(state = initialState, action) {
  switch (action.type) {
    //LIVESCORE News LIST
    case ApiConstants.API_LIVE_SCORE_NEWS_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_NEWS_LIST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        liveScoreNewsListData: action.result,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_NEWS_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };
    case ApiConstants.API_LIVE_SCORE_NEWS_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_NEWS_DETAILS:
      let news_data = action.addNewItemDetail;
      let authorData;

      state.newsImage = news_data.newsImage;
      state.newsVideo = news_data.newsVideo;

      if (getLiveScoreCompetition()) {
        authorData = JSON.parse(getLiveScoreCompetition());
      } else {
        authorData = 'World sport actioa';
      }

      state.addEditNews = news_data;
      state.addEditNews['author'] = news_data.author
        ? news_data.author
        : authorData
        ? authorData.longName
        : '';

      state.news_expire_date = news_data.news_expire_date
        ? moment(news_data.news_expire_date).format('YYYY-MM-DD')
        : '';
      // state.news_expire_date = moment(news_data.news_expire_date).format("YYYY-MM-DD")
      state.expire_date = moment(news_data.news_expire_date, 'YYYY-MM-DD');
      state.newExpiryDate = moment(news_data.news_expire_date, 'YYYY-MM-DD');
      state.expire_time = news_data.news_expire_date;
      state.newExpiryTime = news_data.news_expire_date;

      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_REFRESH_NEWS:
      let emptyData = object;
      state.addEditNews = emptyData;
      state.addEditNews['recipients'] = [];
      state.expire_date = null;
      state.expire_time = null;
      state.news_expire_date = null;
      state.addEditNews['title'] = null;
      state.addEditNews['body'] = null;
      state.addEditNews['news_expire_date'] = null;
      state.newsImage = null;
      state.newsVideo = null;

      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_NEWS:
      // let news_object = state.addEditNews
      // let dateFormat = null
      // let utcTimestamp = null
      if (action.key === 'expire_date') { 
        state[action.key] = action.data;
        state.newExpiryDate = action.data ? moment(action.data, 'YYYY-MM-DD') : '';
        state.news_expire_date = action.data ? moment(action.data).format('YYYY-MM-DD') : '';
      } else if (action.key === 'expire_time') {
        state[action.key] = action.data;
      } else if (action.key === 'body') {
        state.newsBody = action.data;
      } else if (
        action.key === 'allOrg' ||
        action.key === 'indivisualOrg' ||
        action.key === 'newsImage' ||
        action.key === 'newsVideo'
      ) {
        state[action.key] = action.data;
      } else {
        state.addEditNews[action.key] = action.data;
      }

      if (action.key === 'recipients') {
        state.addEditNews['toUserRoleIds'] = null;
        state.addEditNews['toRosterRoleIds'] = null;
        state.addEditNews['toUserIds'] = null;
        switch (action.data) {
          case AppConstants.allManagers:
            state.addEditNews['toUserRoleIds'] = [3];
            break;
          case AppConstants.allScorers:
            state.addEditNews['toRosterRoleIds'] = [4];
            break;
          case AppConstants.allManagersAndScorers:
            state.addEditNews['toUserRoleIds'] = [3];
            state.addEditNews['toRosterRoleIds'] = [4];
            break;
        }
      }

      return {
        ...state,
      };

    case ApiConstants.API_LIVE_SCORE_ADD_NEWS_LOAD:
      return {
        ...state,
        onLoad_2: true,
        success: false,
      };
    case ApiConstants.API_LIVE_SCORE_ADD_NEWS_SUCCESS:
      // history.push('/matchDayNewsList')
      // let data = action.result
      return {
        ...state,
        onLoad_2: false,
        addNewsResult: action.result,
        status: action.status,
        success: true,
      };
    case ApiConstants.API_NEWS_SAGA_FAIL:
      return {
        ...state,
        onLoad_2: false,
        notifyLoad: false,
        error: action.error,
        status: action.status,
        onLoad: false,
        success: false,
      };
    case ApiConstants.API_NEWS_SAGA_ERROR:
      return {
        ...state,
        onLoad_2: false,
        notifyLoad: false,
        error: action.error,
        status: action.status,
        onLoad: false,
        success: false,
      };

    case ApiConstants.API_LIVESCORE_NEWS_NOTIFICATION_LOAD:
      return { ...state, onLoad_2: true, notifyLoad: true };

    case ApiConstants.API_LIVESCORE_NEWS_NOTIFICATION_SUCCESS:
      return {
        ...state,
        onLoad_2: false,
        notifyLoad: false,
        notificationResult: action.result,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_DELETE_NEWS_LOAD:
      return { ...state, onLoad_2: true, notifyLoad: true };

    case ApiConstants.API_LIVE_SCORE_DELETE_NEWS_SUCCESS:
      return {
        ...state,
        onLoad_2: false,
        notifyLoad: false,
        deleteNews: action.result,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_DEFAULT_NEWS_IMAGE_VIDEO:
      return {
        ...state,
        addEditNews: {
          // ...state.addEditNews,
          newsImage: action.payload.newsImage,
          newsVideo: action.payload.newsVideo,
          author: action.payload.author,
        },
      };

    default:
      return state;
  }
}

export default liveScoreNewsState;

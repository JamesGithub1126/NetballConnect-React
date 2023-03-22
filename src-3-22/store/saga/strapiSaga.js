import { call, put, takeEvery } from 'redux-saga/effects';
import ApiConstants from '../../themes/apiConstants';
import StrapiAxiosApi from 'store/http/strapiHttp/axiosApi';
import { message } from 'antd';

export function* strapiLoadTokenSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchStrapiToken, action.payload);
    if (result.status === 1) {
      const { data } = result.result.data;
      yield put({
        type: ApiConstants.STRAPI_TOKEN_SUCCESS,
        result: data,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_TOKEN_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_TOKEN_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchWebsiteSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchWebsite, action.websiteId);
    if (result.status === 1) {
      const { site } = result.result.data;
      const { site_setting } = site.attributes;

      yield put({
        type: ApiConstants.STRAPI_GET_WEBSITE_SUCCESS,
        result: site,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(site, site_setting.data.id);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_WEBSITE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_WEBSITE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createWebsiteSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createWebsite, action.payload);
    if (result.status === 1) {
      const { data } = result.result;

      yield put({
        type: ApiConstants.STRAPI_CREATE_WEBSITE_SUCCESS,
        result: data.site_info,
        status: result.status,
      });

      if (action.payload.onSuccess) {
        const id = data.site_info.id;
        action.payload.onSuccess(id);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_WEBSITE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_WEBSITE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createWebsiteDefaultsSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createWebsiteDefaults, action.websiteId, action.payload);
    if (result.status === 1) {
      const { data } = result.result;

      yield put({
        type: ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_SUCCESS,
        result: data,
        status: result.status,
      });

      if (action.onSuccess) action.onSuccess();
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* validateWebsiteDomainSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.validateWebsiteDomain, action.payload);
    if (result.status === 1) {
      const { data } = result.result;

      yield put({
        type: ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_SUCCESS,
        result: data.site_info,
        status: result.status,
      });

      if (action.payload.onSuccess) action.payload.onSuccess();
    } else {
      yield put({ type: ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (result) {
    if (action.payload.onFailure) action.payload.onFailure(result.error.response);

    yield put({
      type: ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_ERROR,
      error: result,
      status: result.status,
    });
  }
}

export function* createWebPageSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createWebPage, action.payload);
    if (result.status === 1) {
      const { webPage } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_CREATE_WEB_PAGE_SUCCESS,
        result: webPage.data,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(webPage.data);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_WEB_PAGE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_WEB_PAGE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchWebPageSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchWebPage, action.webPageId);
    if (result.status === 1) {
      const { webPage } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_WEB_PAGE_SUCCESS,
        result: webPage,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(webPage);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_WEB_PAGE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_WEB_PAGE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* updateWebPageSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.updateWebPage, action.webPageId, action.payload);
    if (result.status === 1) {
      const { webPage } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_UPDATE_WEB_PAGE_SUCCESS,
        result: webPage,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(webPage);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_UPDATE_WEB_PAGE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_UPDATE_WEB_PAGE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* deleteWebPageSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.deleteWebPage, action.webPageId, action.payload);
    if (result.status === 1) {
      const { webPage } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_DELETE_WEB_PAGE_SUCCESS,
        result: webPage,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(webPage);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_DELETE_WEB_PAGE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_DELETE_WEB_PAGE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchWebPagesSaga(action) {
  try {
    const result = yield call(
      StrapiAxiosApi.fetchWebPages,
      action.websiteId,
      action.page,
      action.pageSize,
      action.loadAll,
      action.dateFrom,
      action.dateTo,
    );
    if (result.status === 1) {
      const { webPagesData, pagination } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_WEB_PAGES_SUCCESS,
        result: webPagesData,
        pagination,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_WEB_PAGES_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_WEB_PAGES_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchWebPagesCountSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchWebPagesCount, { ...action });
    if (result.status === 1) {
      const { count } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_SUCCESS,
        result: count,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchPostsSaga(action) {
  try {
    const result = yield call(
      StrapiAxiosApi.fetchPosts,
      action.websiteId,
      action.page,
      action.pageSize,
      action.loadAll,
    );
    if (result.status === 1) {
      const { websitePosts, pagination } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_POSTS_SUCCESS,
        result: websitePosts,
        pagination,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_POSTS_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_POSTS_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchPostSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchPost, action.postId);
    if (result.status === 1) {
      const { post } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_POST_SUCCESS,
        result: post,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_POST_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_POST_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* updatePostSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.updatePost, action.postId, action.payload);
    if (result.status === 1) {
      const { post } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_UPDATE_POST_SUCCESS,
        result: post,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(post);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_UPDATE_POST_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_UPDATE_POST_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* deletePostSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.deletePost, action.postId, action.payload);
    if (result.status === 1) {
      const { post } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_DELETE_POST_SUCCESS,
        result: post,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(post);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_DELETE_POST_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_DELETE_POST_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createPostSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createPost, action.payload);
    if (result.status === 1) {
      const { post } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_CREATE_POST_SUCCESS,
        result: post.data,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(post.data);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_POST_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_POST_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createSiteSettingSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createSiteSetting, action.payload);
    if (result.status === 1) {
      const { siteSetting } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_CREATE_SITE_SETTING_SUCCESS,
        result: siteSetting.data,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteSetting.data);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_SITE_SETTING_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_SITE_SETTING_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createPageTemplateSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createPageTemplate, action.payload);
    if (result.status === 1) {
      const { data } = result.result;

      yield put({
        type: ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_SUCCESS,
        result: data.pt_info,
        status: result.status,
      });

      if (action.payload.onSuccess) {
        action.payload.onSuccess(data.pt_info);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* updateSiteSettingSaga(action) {
  try {
    const result = yield call(
      StrapiAxiosApi.updateSiteSetting,
      action.siteSettingId,
      action.payload,
    );
    if (result.status === 1) {
      const { siteSetting } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_UPDATE_SITE_SETTING_SUCCESS,
        result: siteSetting,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteSetting);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_UPDATE_SITE_SETTING_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_UPDATE_SITE_SETTING_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchSiteMenusSaga(action) {
  try {
    const result = yield call(
      StrapiAxiosApi.fetchSiteMenus,
      action.websiteId,
      action.page,
      action.pageSize,
      action.loadAll,
    );
    if (result.status === 1) {
      const { siteMenusData, pagination } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_SITE_MENUS_SUCCESS,
        result: siteMenusData,
        pagination,
        status: result.status,
      });
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_SITE_MENUS_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_SITE_MENUS_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* createSiteMenuSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.createSiteMenu, action.payload);
    if (result.status === 1) {
      const { siteMenu } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_CREATE_SITE_MENU_SUCCESS,
        result: siteMenu.data,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteMenu.data);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_CREATE_SITE_MENU_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_CREATE_SITE_MENU_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchSiteMenuSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchSiteMenu, action.siteMenuId);
    if (result.status === 1) {
      const { siteMenu } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_SITE_MENU_SUCCESS,
        result: siteMenu,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteMenu);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_SITE_MENU_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_SITE_MENU_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* updateSiteMenuSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.updateSiteMenu, action.siteMenuId, action.payload);
    if (result.status === 1) {
      const { siteMenu } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_UPDATE_SITE_MENU_SUCCESS,
        result: siteMenu,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteMenu);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_UPDATE_SITE_MENU_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_UPDATE_SITE_MENU_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* deleteSiteMenuSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.deleteSiteMenu, action.siteMenuId, action.payload);
    if (result.status === 1) {
      const { siteMenu } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_DELETE_SITE_MENU_SUCCESS,
        result: siteMenu,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteMenu);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_DELETE_SITE_MENU_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_DELETE_SITE_MENU_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* fetchSiteSettingSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.fetchSiteSetting, action.siteSettingId);
    if (result.status === 1) {
      const { siteSetting } = result.result.data;

      yield put({
        type: ApiConstants.STRAPI_GET_SITE_SETTING_SUCCESS,
        result: siteSetting,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(siteSetting);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_GET_SITE_SETTING_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_GET_SITE_SETTING_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export function* uploadImageSaga(action) {
  try {
    const result = yield call(StrapiAxiosApi.uploadFile, action.payload);
    if (result.status === 1) {
      const { url } = result.result.data.data;

      yield put({
        type: ApiConstants.STRAPI_UPLOAD_IMAGE_SUCCESS,
        result: url,
        status: result.status,
      });

      if (action.onSuccess) {
        action.onSuccess(url);
      }
    } else {
      yield put({ type: ApiConstants.STRAPI_UPLOAD_IMAGE_FAIL });

      setTimeout(() => {
        message.error(result.result.data.message);
      }, 800);
    }
  } catch (error) {
    yield put({
      type: ApiConstants.STRAPI_UPLOAD_IMAGE_ERROR,
      error: error,
      status: error.status,
    });
  }
}

export default function* rootStrapiSaga() {
  yield takeEvery(ApiConstants.STRAPI_TOKEN_LOAD, strapiLoadTokenSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_WEBSITE_LOAD, fetchWebsiteSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_WEBSITE_LOAD, createWebsiteSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_LOAD, createWebsiteDefaultsSaga);
  yield takeEvery(ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_LOAD, validateWebsiteDomainSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_LOAD, createPageTemplateSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_WEB_PAGES_LOAD, fetchWebPagesSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_WEB_PAGE_LOAD, createWebPageSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_WEB_PAGE_LOAD, fetchWebPageSaga);
  yield takeEvery(ApiConstants.STRAPI_UPDATE_WEB_PAGE_LOAD, updateWebPageSaga);
  yield takeEvery(ApiConstants.STRAPI_DELETE_WEB_PAGE_LOAD, deleteWebPageSaga);

  yield takeEvery(ApiConstants.STRAPI_GET_POSTS_LOAD, fetchPostsSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_POST_LOAD, fetchPostSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_POST_LOAD, createPostSaga);
  yield takeEvery(ApiConstants.STRAPI_UPDATE_POST_LOAD, updatePostSaga);
  yield takeEvery(ApiConstants.STRAPI_DELETE_POST_LOAD, deletePostSaga);

  yield takeEvery(ApiConstants.STRAPI_CREATE_SITE_SETTING_LOAD, createSiteSettingSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_SITE_SETTING_LOAD, fetchSiteSettingSaga);
  yield takeEvery(ApiConstants.STRAPI_UPDATE_SITE_SETTING_LOAD, updateSiteSettingSaga);

  yield takeEvery(ApiConstants.STRAPI_GET_SITE_MENUS_LOAD, fetchSiteMenusSaga);
  yield takeEvery(ApiConstants.STRAPI_GET_SITE_MENU_LOAD, fetchSiteMenuSaga);
  yield takeEvery(ApiConstants.STRAPI_CREATE_SITE_MENU_LOAD, createSiteMenuSaga);
  yield takeEvery(ApiConstants.STRAPI_UPDATE_SITE_MENU_LOAD, updateSiteMenuSaga);
  yield takeEvery(ApiConstants.STRAPI_DELETE_SITE_MENU_LOAD, deleteSiteMenuSaga);

  yield takeEvery(ApiConstants.STRAPI_UPLOAD_IMAGE_LOAD, uploadImageSaga);
}

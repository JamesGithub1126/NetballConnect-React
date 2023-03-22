import ApiConstants from 'themes/apiConstants';

function getStrapiTokenAction() {
  return {
    type: ApiConstants.STRAPI_TOKEN_LOAD,
  };
}

function getWebPagesAction(
  websiteId,
  page = 1,
  pageSize = 10,
  loadAll = false,
  dateFrom = null,
  dateTo = null,
) {
  return {
    type: ApiConstants.STRAPI_GET_WEB_PAGES_LOAD,
    websiteId,
    page,
    pageSize,
    loadAll,
    dateFrom,
    dateTo,
  };
}

function getWebPagesCountAction(
  websiteId,
  dateFrom = new Date().toISOString(),
  dateTo = new Date().toISOString(),
) {
  return {
    type: ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_LOAD,
    websiteId,
    dateFrom,
    dateTo,
  };
}

function resetWebPageFieldsAction() {
  return {
    type: ApiConstants.STRAPI_RESET_WEB_PAGE_FIELDS,
  };
}

function getWebPageAction(webPageId) {
  return {
    type: ApiConstants.STRAPI_GET_WEB_PAGE_LOAD,
    webPageId,
  };
}

function getWebsiteAction(websiteId, onSuccess) {
  return {
    type: ApiConstants.STRAPI_GET_WEBSITE_LOAD,
    websiteId,
    onSuccess,
  };
}

function updateWebPageAction(webPageId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_UPDATE_WEB_PAGE_LOAD,
    payload: data,
    webPageId,
    onSuccess,
  };
}

function deleteWebPageAction(webPageId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_DELETE_WEB_PAGE_LOAD,
    payload: data,
    webPageId,
    onSuccess,
  };
}

function createWebPageAction(data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_CREATE_WEB_PAGE_LOAD,
    payload: data,
    onSuccess,
  };
}

function getPostsAction(websiteId, page = 1, pageSize = 10, loadAll = false) {
  return {
    type: ApiConstants.STRAPI_GET_POSTS_LOAD,
    websiteId,
    page,
    pageSize,
    loadAll,
  };
}

function getPostAction(postId) {
  return {
    type: ApiConstants.STRAPI_GET_POST_LOAD,
    postId,
  };
}

function updatePostAction(postId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_UPDATE_POST_LOAD,
    payload: data,
    postId,
    onSuccess,
  };
}

function deletePostAction(postId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_DELETE_POST_LOAD,
    payload: data,
    postId,
    onSuccess,
  };
}

function createPostAction(data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_CREATE_POST_LOAD,
    payload: data,
    onSuccess,
  };
}

function resetPostFieldsAction() {
  return {
    type: ApiConstants.STRAPI_RESET_POST_FIELDS,
  };
}

function createSiteSettingAction(data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_CREATE_SITE_SETTING_LOAD,
    payload: data,
    onSuccess,
  };
}

function updateSiteSettingAction(siteSettingId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_UPDATE_SITE_SETTING_LOAD,
    payload: data,
    siteSettingId,
    onSuccess,
  };
}

function createWebsiteAction(data) {
  return {
    type: ApiConstants.STRAPI_CREATE_WEBSITE_LOAD,
    payload: data,
  };
}

function validateWebsiteDomainAction(data) {
  return {
    type: ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_LOAD,
    payload: data,
  };
}

function createWebsiteDefaultsAction({ websiteId, payload, onSuccess }) {
  return {
    type: ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_LOAD,
    websiteId,
    payload,
    onSuccess,
  };
}

function createPageTemplateAction(data) {
  return {
    type: ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_LOAD,
    payload: data,
  };
}

function getSiteMenusAction(websiteId, page = 1, pageSize = 10, loadAll = false) {
  return {
    type: ApiConstants.STRAPI_GET_SITE_MENUS_LOAD,
    websiteId,
    page,
    pageSize,
    loadAll,
  };
}

function getSiteMenuAction(siteMenuId) {
  return {
    type: ApiConstants.STRAPI_GET_SITE_MENU_LOAD,
    siteMenuId,
  };
}

function updateSiteMenuAction(siteMenuId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_UPDATE_SITE_MENU_LOAD,
    payload: data,
    siteMenuId,
    onSuccess,
  };
}

function deleteSiteMenuAction(siteMenuId, data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_DELETE_SITE_MENU_LOAD,
    payload: data,
    siteMenuId,
    onSuccess,
  };
}

function createSiteMenuAction(data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_CREATE_SITE_MENU_LOAD,
    payload: data,
    onSuccess,
  };
}

function resetSiteMenuFieldsAction() {
  return {
    type: ApiConstants.STRAPI_RESET_SITE_MENU_FIELDS,
  };
}

function getSiteSettingAction(siteSettingId) {
  return {
    type: ApiConstants.STRAPI_GET_SITE_SETTING_LOAD,
    siteSettingId,
  };
}

function uploadImageAction(data, onSuccess) {
  return {
    type: ApiConstants.STRAPI_UPLOAD_IMAGE_LOAD,
    payload: data,
    onSuccess,
  };
}

export {
  getStrapiTokenAction,
  getWebsiteAction,
  createWebsiteAction,
  createPageTemplateAction,
  getWebPagesAction,
  getWebPagesCountAction,
  createWebPageAction,
  getWebPageAction,
  updateWebPageAction,
  deleteWebPageAction,
  getPostsAction,
  createPostAction,
  getPostAction,
  updatePostAction,
  deletePostAction,
  createSiteSettingAction,
  updateSiteSettingAction,
  getSiteMenusAction,
  getSiteSettingAction,
  createSiteMenuAction,
  getSiteMenuAction,
  updateSiteMenuAction,
  deleteSiteMenuAction,
  resetWebPageFieldsAction,
  resetPostFieldsAction,
  uploadImageAction,
  resetSiteMenuFieldsAction,
  validateWebsiteDomainAction,
  createWebsiteDefaultsAction,
};

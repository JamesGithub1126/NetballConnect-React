import Method from './method';
import { getAuthToken } from '../../../util/sessionStorage';

let token = getAuthToken();

const StrapiAxiosApi = {
  fetchStrapiToken() {
    const url = `/strapi/strapiAuth`;
    return Method.dataPost(url, token);
  },

  fetchWebPages(websiteId, page, pageSize, loadAll, dateFrom = null, dateTo = null) {
    let url = `/strapi/${websiteId}/web-pages`;

    if (!loadAll) {
      if (page) url += `?page=${page}`;

      if (pageSize) url += `${page ? '&' : '?'}pageSize=${pageSize}`;
    } else {
      url += `?loadAll=${loadAll}`;
    }

    if (dateFrom) url += `&dateFrom=${dateFrom}`;
    if (dateTo) url += `&dateTo=${dateTo}`;

    return Method.dataGet(url);
  },

  fetchWebPage(webPageId) {
    const url = `/strapi/${webPageId}/web-page`;
    return Method.dataGet(url);
  },

  fetchWebPagesCount(payload) {
    const { websiteId, dateFrom, dateTo } = payload;
    const url = `/strapi/${websiteId}/web-pages/count?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    return Method.dataGet(url);
  },

  updateWebPage(webPageId, payload) {
    const url = `/strapi/${webPageId}/web-page`;
    return Method.dataPut(url, token, payload);
  },

  createWebPage(payload) {
    const url = `/strapi/web-pages`;
    return Method.dataPost(url, token, payload);
  },

  deleteWebPage(webPageId, payload) {
    const url = `/strapi/${webPageId}/web-page`;
    return Method.dataDelete(url, payload, token);
  },

  fetchWebsite(websiteId) {
    const url = `/strapi/site/${websiteId}`;
    return Method.dataGet(url);
  },

  createWebsite(payload) {
    const url = `/strapi/site`;
    return Method.dataPost(url, token, payload);
  },

  validateWebsiteDomain(payload) {
    const url = '/strapi/validate-domain';
    return Method.dataPost(url, token, payload);
  },

  createWebsiteDefaults(websiteId, payload) {
    const url = `/strapi/create-site-defaults/${websiteId}`;
    return Method.dataPost(url, token, payload);
  },

  createPageTemplate(payload) {
    const url = `/strapi/page-template`;
    return Method.dataPost(url, token, payload);
  },

  fetchPosts(websiteId, page, pageSize, loadAll) {
    let url = `/strapi/${websiteId}/posts`;

    if (!loadAll) {
      if (page) url += `?page=${page}`;

      if (pageSize) url += `${page ? '&' : '?'}pageSize=${pageSize}`;
    } else {
      url += `?loadAll=${loadAll}`;
    }

    return Method.dataGet(url);
  },

  fetchPost(postId) {
    const url = `/strapi/${postId}/post`;
    return Method.dataGet(url);
  },

  updatePost(postId, payload) {
    const url = `/strapi/${postId}/post`;
    return Method.dataPut(url, token, payload);
  },

  createPost(payload) {
    const url = `/strapi/posts`;
    return Method.dataPost(url, token, payload);
  },

  createSiteSetting(payload) {
    const url = `/strapi/site-settings`;
    return Method.dataPost(url, token, payload);
  },

  updateSiteSetting(siteSettingId, payload) {
    const url = `/strapi/${siteSettingId}/site-setting`;
    return Method.dataPut(url, token, payload);
  },

  deletePost(postId, payload) {
    const url = `/strapi/${postId}/post`;
    return Method.dataDelete(url, payload, token);
  },

  fetchSiteMenus(websiteId, page, pageSize, loadAll) {
    let url = `/strapi/${websiteId}/site-menus`;

    if (!loadAll) {
      if (page) url += `?page=${page}`;

      if (pageSize) url += `${page ? '&' : '?'}pageSize=${pageSize}`;
    } else {
      url += `?loadAll=${loadAll}`;
    }

    return Method.dataGet(url);
  },

  createSiteMenu(payload) {
    const url = `/strapi/site-menus`;
    return Method.dataPost(url, token, payload);
  },

  fetchSiteMenu(siteMenuId) {
    const url = `/strapi/${siteMenuId}/site-menu`;
    return Method.dataGet(url);
  },

  deleteSiteMenu(siteMenuId, payload) {
    const url = `/strapi/${siteMenuId}/site-menu`;
    return Method.dataDelete(url, payload, token);
  },

  updateSiteMenu(siteMenuId, payload) {
    const url = `/strapi/${siteMenuId}/site-menu`;
    return Method.dataPut(url, token, payload);
  },

  fetchSiteSetting(siteSettingId) {
    const url = `/strapi/${siteSettingId}/site-setting`;
    return Method.dataGet(url);
  },

  uploadFile(payload) {
    const url = `/strapi/upload`;
    let formData = new FormData();
    formData.append('file', payload.file);
    formData.append('domain', payload.domain);
    return Method.dataPost(url, token, formData, true);
  },
};

export default StrapiAxiosApi;

import ApiConstants from 'themes/apiConstants';

const INITIAL_SELECTED_WEB_PAGE = {
  id: 0,
  title: '',
  page_details: '',
  iframe: '',
  iframe_title: '',
  page_template: {
    data: null,
  },
  Sliders: [],
  is_sliders: false,
};

const INITIAL_SELECTED_POST = {
  id: 0,
  title: '',
  post_detail: '',
};

const INITIAL_SELECTED_SITE_MENU = {
  id: 0,
  name: '',
};

const INITIAL_PAGINATION_STATE = {
  page: 1,
  pageSize: 10,
  pageCount: 1,
  total: 10,
};

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  token: '',
  tokenLoad: false,
  status: 0,
  websiteData: {},
  systemUpdatesTotalPages: 0,
  webPages: {
    loaded: false,
    data: [],
    pagination: INITIAL_PAGINATION_STATE,
  },
  posts: {
    loaded: false,
    data: [],
    pagination: INITIAL_PAGINATION_STATE,
  },
  menuItems: {
    loaded: false,
    onLoad: false,
    data: [],
    pagination: INITIAL_PAGINATION_STATE,
  },
  siteSetting: {
    id: 0,
    title: '',
    footer_menus: [],
    footer_content: {
      title: '',
      content: '',
    },
    social_media_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    footer_copyright: '',
    color_settings: {
      primary: '',
      primary_text: '',
      secondary: '',
      secondary_text: '',
      tertiary: '',
      highlight_text: '',
      heading_colour: '',
      footer_bg: '',
      body_bg: '',
    },
  },
  selectedWebPage: INITIAL_SELECTED_WEB_PAGE,
  selectedPost: INITIAL_SELECTED_POST,
  selectedMenuItem: INITIAL_SELECTED_SITE_MENU,
  sites: [],
  pageTemplate: null,
};

function strapiReducerState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.STRAPI_CREATE_WEBSITE_LOAD:
    case ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_LOAD:
    case ApiConstants.STRAPI_GET_WEBSITE_LOAD:
    case ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_LOAD:
    case ApiConstants.STRAPI_GET_WEB_PAGES_LOAD:
    case ApiConstants.STRAPI_CREATE_WEB_PAGE_LOAD:
    case ApiConstants.STRAPI_GET_WEB_PAGE_LOAD:
    case ApiConstants.STRAPI_UPDATE_WEB_PAGE_LOAD:
    case ApiConstants.STRAPI_DELETE_WEB_PAGE_LOAD:
    case ApiConstants.STRAPI_GET_POSTS_LOAD:
    case ApiConstants.STRAPI_CREATE_POST_LOAD:
    case ApiConstants.STRAPI_CREATE_SITE_SETTING_LOAD:
    case ApiConstants.STRAPI_UPDATE_POST_LOAD:
    case ApiConstants.STRAPI_DELETE_POST_LOAD:
    case ApiConstants.STRAPI_UPDATE_SITE_SETTING_LOAD:
    case ApiConstants.STRAPI_CREATE_SITE_MENU_LOAD:
    case ApiConstants.STRAPI_GET_SITE_MENU_LOAD:
    case ApiConstants.STRAPI_UPDATE_SITE_MENU_LOAD:
    case ApiConstants.STRAPI_DELETE_SITE_MENU_LOAD:
    case ApiConstants.STRAPI_UPLOAD_IMAGE_LOAD:
    case ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_LOAD:
    case ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.STRAPI_TOKEN_LOAD:
      return { ...state, tokenLoad: true };

    case ApiConstants.STRAPI_TOKEN_SUCCESS:
      return {
        ...state,
        tokenLoad: false,
        token: action.result.strapi_jwt,
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_WEBSITE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        websiteData: action.result,
      };

    case ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_SUCCESS:
      return {
        ...state,
        pageTemplate: action.result,
        status: action.status,
      };

    case ApiConstants.STRAPI_TOKEN_FAIL:
    case ApiConstants.STRAPI_TOKEN_ERROR:
    case ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_FAIL:
    case ApiConstants.STRAPI_CREATE_PAGE_TEMPLATE_ERROR:
    case ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_FAIL:
    case ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_ERROR:
    case ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_FAIL:
    case ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.STRAPI_CREATE_WEBSITE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        websiteData: action.result,
        status: action.status,
      };

    case ApiConstants.STRAPI_VALIDATE_WEBSITE_DOMAIN_SUCCESS:
    case ApiConstants.STRAPI_CREATE_WEBSITE_DEFAULTS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
      };

    case ApiConstants.STRAPI_CREATE_WEB_PAGE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        webPages: {
          data: [...state.webPages.data, action.result],
          pagination: state.webPages.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_WEB_PAGES_SUCCESS:
      return {
        ...state,
        loaded: true,
        onLoad: false,
        webPages: {
          data: action.result,
          pagination: action.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_WEB_PAGES_COUNT_SUCCESS:
      return {
        ...state,
        loaded: true,
        onLoad: false,
        systemUpdatesTotalPages: action.result,
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_WEB_PAGE_SUCCESS:
      return {
        ...state,
        onLoad: false,
        selectedWebPage: {
          id: action.result.id,
          ...action.result.attributes,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_UPDATE_WEB_PAGE_SUCCESS:
      const updatedWebPage = action.result;
      return {
        ...state,
        onLoad: false,
        webPages: {
          data: state.webPages.data.map(webPage =>
            webPage.id === updatedWebPage.id ? updatedWebPage : webPage,
          ),
          pagination: state.webPages.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_DELETE_WEB_PAGE_SUCCESS:
      const deletedWebPage = action.result;
      return {
        ...state,
        onLoad: false,
        webPages: {
          data: state.webPages.data.filter(webPage => webPage.id !== deletedWebPage.id),
          pagination: state.webPages.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_RESET_WEB_PAGE_FIELDS:
      return {
        ...state,
        selectedWebPage: INITIAL_SELECTED_WEB_PAGE,
      };

    case ApiConstants.STRAPI_GET_POSTS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        posts: {
          loaded: true,
          data: action.result,
          pagination: action.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_CREATE_POST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        posts: {
          data: [...state.posts.data, action.result],
          pagination: state.posts.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_POST_SUCCESS:
      return {
        ...state,
        onLoad: false,
        selectedPost: {
          id: action.result.id,
          ...action.result.attributes,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_UPDATE_POST_SUCCESS:
      const updatedPost = action.result;
      return {
        ...state,
        onLoad: false,
        posts: {
          data: state.posts.data.map(post => (post.id === updatedPost.id ? updatedPost : post)),
          pagination: state.posts.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_DELETE_POST_SUCCESS:
      const deletedPost = action.result;
      return {
        ...state,
        onLoad: false,
        posts: {
          data: state.posts.data.filter(post => post.id !== deletedPost.id),
          pagination: state.posts.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_RESET_POST_FIELDS:
      return {
        ...state,
        selectedPost: INITIAL_SELECTED_POST,
      };

    case ApiConstants.STRAPI_GET_SITE_MENUS_LOAD:
      return {
        ...state,
        menuItems: {
          ...state.menuItems,
          onLoad: true,
        },
      };

    case ApiConstants.STRAPI_GET_SITE_MENUS_SUCCESS:
      return {
        ...state,
        menuItems: {
          onLoad: false,
          data: action.result,
          pagination: action.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_SITE_MENU_SUCCESS:
      return {
        ...state,
        onLoad: false,
        selectedMenuItem: {
          id: action.result.id,
          ...action.result.attributes,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_CREATE_SITE_MENU_SUCCESS:
      return {
        ...state,
        onLoad: false,
        menuItems: {
          data: [...state.menuItems.data, action.result],
          pagination: state.menuItems.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_UPDATE_SITE_MENU_SUCCESS:
      const updatedSiteMenu = action.result;

      const updatedMenuItemsData = state.menuItems.data.map(siteMenu => {
        if (siteMenu.id === updatedSiteMenu.id) {
          return { ...siteMenu, attributes: {
              ...siteMenu.attributes,
              ...updatedSiteMenu.attributes
            } };
        }

        return siteMenu;
      });

      return {
        ...state,
        onLoad: false,
        menuItems: {
          data: updatedMenuItemsData,
          pagination: state.menuItems.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_DELETE_SITE_MENU_SUCCESS:
      const deletedSiteMenu = action.result;
      return {
        ...state,
        onLoad: false,
        menuItems: {
          data: state.menuItems.data.filter(menuItem => menuItem.id !== deletedSiteMenu.id),
          pagination: state.menuItems.pagination,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_RESET_SITE_MENU_FIELDS:
      return {
        ...state,
        selectedMenuItem: INITIAL_SELECTED_SITE_MENU,
      };

    case ApiConstants.STRAPI_GET_SITE_SETTING_SUCCESS:
      return {
        ...state,
        onLoad: false,
        siteSetting: {
          id: action.result.id,
          ...action.result.attributes,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_UPDATE_SITE_SETTING_SUCCESS:
      const updatedSiteSetting = action.result;
      return {
        ...state,
        onLoad: false,
        siteSetting: {
          id: updatedSiteSetting.id,
          ...updatedSiteSetting.attributes,
        },
        status: action.status,
      };

    case ApiConstants.STRAPI_GET_WEB_PAGES_FAIL:
    case ApiConstants.STRAPI_GET_WEB_PAGES_ERROR:
      return {
        ...state,
        onLoad: false,
        webPages: [],
        error: action.error,
        status: action.status,
      };

    case ApiConstants.STRAPI_CREATE_WEBSITE_FAIL:
    case ApiConstants.STRAPI_CREATE_WEBSITE_ERROR:
      return {
        ...state,
        onLoad: false,
        websiteData: {},
        error: action.error,
        status: action.status,
      };

    case ApiConstants.STRAPI_UPLOAD_IMAGE_SUCCESS:
      return {
        ...state,
        onLoad: false,
      };

    default:
      return state;
  }
}

export default strapiReducerState;

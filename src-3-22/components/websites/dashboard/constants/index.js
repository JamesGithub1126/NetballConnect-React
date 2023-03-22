import { PAGES } from './pages';

export const DEFAULT_HOME_TEMPLATE = 1;
export const DEFAULT_CONTACT_TEMPLATE = 2;
export const DEFAULT_GENERIC_TEMPLATE = 3;
export const DEFAULT_NEWS_TEMPLATE = 4;
const DEFAULT_NEWS_DETAILS_TEMPLATE = 5;

export const COMPETITION_CHILD_MENUS = [
  {
    name: 'Registrations',
    url: '/registrations',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    name: 'Fixtures',
    url: '/fixtures',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    name: 'Ladders',
    url: '/ladders',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    name: 'Competition Rules',
    url: '/competition-rules',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
];

export const DEFAULT_SITE_MENUS = [
  {
    name: PAGES.HOME,
    url: '/',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_HOME_TEMPLATE,
  },
  {
    name: PAGES.NEWS,
    url: '/news',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_NEWS_TEMPLATE,
  },
  {
    name: PAGES.NEWS_DETAILS,
    url: '/news/:name/:id',
    is_active: false,
    published: true,
    page_template: DEFAULT_NEWS_DETAILS_TEMPLATE,
  },
  {
    name: PAGES.ABOUT,
    url: '/about',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    name: PAGES.COMPETITION,
    url: '/competition',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },

  {
    name: PAGES.CONTACT_US,
    url: '/contact-us',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_CONTACT_TEMPLATE,
  },
  {
    name: PAGES.SHOP,
    url: '/shop',
    is_active: true,
    menu_type: 'header',
    published: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
];

export const generateIframeForm = (url, title = null) =>
  `<iframe src='${url}' ${
    title ? `title='${title}'` : ''
  } height='500' style='width:100%'></iframe>`;

export const buildIframeUrl = (title, URI, organisationKey = null, yearId = null) => {
  const URL = process.env.REACT_APP_URL_WEB_USER_REGISTRATION;
  let url = `${URL}/${URI}`;

  if (organisationKey) url += `?organisationKey=${organisationKey}`;

  if (yearId) url += `${organisationKey ? '&' : '?'}yearId=${yearId}`;

  return generateIframeForm(url, title);
};

export const DEFAULT_PAGES = [
  {
    title: PAGES.HOME,
    is_active: true,
    iframeURL: (organisationKey, yearId) => {
      return buildIframeUrl(PAGES.HOME, 'liveScoreSeasonFixture', organisationKey, yearId);
    },
    page_template: DEFAULT_HOME_TEMPLATE,
    is_banners: true,
  },
  {
    title: PAGES.REGISTRATIONS,
    is_active: true,
    iframeURL: organisationKey => {
      return buildIframeUrl(PAGES.REGISTRATIONS, 'userRegistration', organisationKey, null);
    },
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.FIXTURES,
    is_active: true,
    iframeURL: (organisationKey, yearId) => {
      return buildIframeUrl(PAGES.FIXTURES, 'liveScoreSeasonFixture', organisationKey, yearId);
    },
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.LADDERS,
    is_active: true,
    iframeURL: (organisationKey, yearId) => {
      return buildIframeUrl(PAGES.LADDERS, 'liveScorePublicLadder', organisationKey, yearId);
    },
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.SHOP,
    is_active: true,
    iframeURL: organisationKey => {
      return buildIframeUrl(PAGES.SHOP, 'shop', organisationKey, null);
    },
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.ABOUT,
    is_active: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.COMPETITION,
    is_active: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.COMPETITION_RULES,
    is_active: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.CONTACT_US,
    is_active: true,
    page_template: DEFAULT_CONTACT_TEMPLATE,
  },
  {
    title: PAGES.TERMS_AND_CONDITIONS,
    is_active: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.PRIVACY_POLICY,
    is_active: true,
    page_template: DEFAULT_GENERIC_TEMPLATE,
  },
  {
    title: PAGES.NEWS,
    is_active: true,
    page_template: DEFAULT_NEWS_TEMPLATE,
  },
];

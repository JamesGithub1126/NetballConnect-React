import {
  DEFAULT_CONTACT_TEMPLATE,
  DEFAULT_GENERIC_TEMPLATE,
  DEFAULT_HOME_TEMPLATE,
  DEFAULT_NEWS_TEMPLATE,
} from '../../dashboard/constants';

export const IFRAME_URL_LIST = [
  { value: 'None', label: '-- None' },
  { value: 'liveScoreSeasonFixture', label: 'Fixtures' },
  { value: 'userRegistration', label: 'Registrations' },
  { value: 'liveScorePublicLadder', label: 'Ladders' },
  { value: 'shop', label: 'Shop' },
  { value: 'Custom', label: 'Custom' },
];

export const EDITOR_PAGE_FIELDS = {
  pageTitle: 'webPageTitle',
  editorBody: 'editorBody',
  featuredImage: 'featuredImage',
  featuredPosts: 'featuredPosts',
  sliders: 'sliders',
  bannerImage: 'bannerImage',
  bannerText: 'bannerText',
  location: 'location',
  email: 'email',
  abn: 'abn',
  phone: 'phone',
  mapImage: 'mapImage',
  pageTemplate: 'pageTemplate',
  iframeUrl: 'iframeUrl',
  iframeTitle: 'iframeTitle',
  iframeCustomUrl: 'iframeCustomUrl',
};

const {
  pageTitle,
  editorBody,
  sliders,
  bannerImage,
  bannerText,
  email,
  abn,
  phone,
  location,
  mapImage,
  pageTemplate,
  iframeUrl,
  iframeTitle,
  iframeCustomUrl,
} = EDITOR_PAGE_FIELDS;

export const ALLOWED_FIELDS = {
  // Home page allowed fields
  [DEFAULT_HOME_TEMPLATE]: [
    pageTitle,
    editorBody,
    sliders,
    bannerImage,
    bannerText,
    pageTemplate,
    iframeUrl,
    iframeTitle,
    iframeCustomUrl,
  ],
  // News page allowed fields
  [DEFAULT_NEWS_TEMPLATE]: [pageTitle, sliders],
  // Contact page allowed fields
  [DEFAULT_CONTACT_TEMPLATE]: [
    pageTitle,
    editorBody,
    pageTemplate,
    email,
    abn,
    location,
    phone,
    mapImage,
  ],
  // GenericContents allowed fields
  [DEFAULT_GENERIC_TEMPLATE]: [
    pageTitle,
    editorBody,
    pageTemplate,
    iframeUrl,
    iframeTitle,
    iframeCustomUrl,
  ],
};

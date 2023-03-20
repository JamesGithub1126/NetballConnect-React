export interface Headers {
  UserAgent: any;
  Authority: any;
  AcceptLanguage: any;
  AccessControlAllowOrigin: any;
  CacheControl: any;
  Origin: any;
  Pragma: any;
  Referer: any;
  secchua: any;
  secchuamobile: any;
  secchuaplatform: any;
  secfetchdest: any;
  secfetchsite: any;
  useragent: any;
}

export const apiRequestheaders: Headers = {
  UserAgent: 'Thunder Client (https://www.thunderclient.com)',
  Authority: process.env.REACT_APP_URL_API_USERS,
  AcceptLanguage: 'en-GB,en-US;q=0.9,en;q=0.8',
  AccessControlAllowOrigin: '*',
  CacheControl: ' no-cache',
  Origin: process.env.REACT_APP_URL_WEB_COMP_ADMIN,
  Pragma: 'no-cache',
  Referer: process.env.REACT_APP_URL_WEB_COMP_ADMIN + '/',
  secchua: 'Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
  secchuamobile: '?0',
  secchuaplatform: 'macOS',
  secfetchdest: 'empty',
  secfetchsite: 'same-site',
  useragent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
};

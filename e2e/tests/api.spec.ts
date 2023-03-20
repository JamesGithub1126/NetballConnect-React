import { LoginPage } from '@pages/login.page';
import { expect, test } from '@playwright/test';
import { apiRequestheaders } from '@fixtures/api_request';
import { normalUser as user } from '@fixtures/user';
import { Endpoints } from '@helpers/apiEndpoints';
import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';
let token = '';
test.slow();
test('Verify the ability to login via API', async ({ page }) => {
  const login = new LoginPage(page);
  let response = await login.loginApiUser(
    user,
    process.env.REACT_APP_URL_API_USERS + Endpoints.LOGIN,
    apiRequestheaders,
    '',
    'fetch',
  );
  let responseBody: Buffer = await response.body();
  let getToken = responseBody.toString('ascii');
  let authToken = JSON.parse(getToken);
  token = authToken.authToken;

  expect(response.status()).toEqual(200);
});

test('API - Create Membership Product -Create Product', async ({ page }) => {
  const login = new LoginPage(page);
  let getApiData = await getJsonfromSheet(8).then(googleSheetData => {
    return googleSheetData;
  });
  let response = await login.createProduct(
    token,
    process.env.REACT_APP_URL_API_REGISTRATIONS + Endpoints.MEMBERSHIPPRODUCTS,
    JSON.stringify(apiRequestheaders),

    JSON.parse(getApiData[0]['data']),
    'post',
  );
  expect(response.status()).toEqual(200);
});

test('API - Create Membership Product -Save Fees', async ({ page }) => {
  const login = new LoginPage(page);
  let getApiData = await getJsonfromSheet(8).then(googleSheetData => {
    return googleSheetData;
  });

  let response = await login.createProduct(
    token,
    process.env.REACT_APP_URL_API_REGISTRATIONS + Endpoints.MEMBERSHIPPRODUCTS_FEES,
    JSON.stringify(apiRequestheaders),

    JSON.parse(getApiData[1]['data']),
    'post',
  );
  expect(response.status()).toEqual(200);
});

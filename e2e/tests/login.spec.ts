import { normalUser as user } from '@fixtures/user';
import { Paths } from '@helpers/paths';
import { LoginPage } from '@pages/login.page';
import { expect, test } from '@playwright/test';
var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});
test('Login with an existing normal user', async ({ page }) => {
  test.slow();
  await page.goto(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.LOGIN);
  await expect(page).toHaveURL(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.LOGIN);

  const login = new LoginPage(page);
  await login.loginUserUI(user);
  await page.waitForNavigation();
  await expect(page).toHaveURL(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.DASHBOARD);
  await login.verifyLoginUserEmail(user);
});

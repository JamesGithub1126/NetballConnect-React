import { normalUser as user } from '@fixtures/user';
import { DirectCompetitionCreation } from '@pages/directCompetitionCreation.page';
import { test } from '@playwright/test';
import { LoginPage } from '@pages/login.page';

import path from 'path';

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

test('#WN-435 Registration Competition Creation', async ({ page }) => {
  test.slow();
  let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
  await page.goto(URL_WEB_COMP_ADMIN);
  const login = new LoginPage(page);
  await login.loginUserUI(user);
  const competitionCreation = new DirectCompetitionCreation(page);
  await competitionCreation.competitionCreation(0);
  await competitionCreation.completeRegistrationForm(0);
  await competitionCreation.verifyCompetitionIsPublished('Published', 0);
});

import { normalUser as user } from '@fixtures/user';
import { RecordAttendance } from '@pages/recordAttendancePerGame.page';
import { LoginPage } from '@pages/login.page';
import { expect, test } from '@playwright/test';

let scenario: any;
test('Admin UI - Record Attendance Per Game (without position tracking)', async ({ page }) => {
  scenario = 0;
  test.slow();
  page.on('request', request => request.method() + request.url());
  page.on('response', response => response.status() + response.url());
  let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
  await page.goto(URL_WEB_COMP_ADMIN);
  const login = new LoginPage(page);
  await login.loginUserUI(user);
  const recordAttendancePage = new RecordAttendance(page);
  await recordAttendancePage.navigateToCompetition(scenario);
  await recordAttendancePage.createMatch(scenario);
  await recordAttendancePage.markPlayerAttendance(scenario);
  await recordAttendancePage.verifyAttendance();
});

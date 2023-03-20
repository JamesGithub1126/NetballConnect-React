import { expect, Locator, Page, selectors, Browser } from '@playwright/test';
import { record_attendance } from '../fixtures/recordAttendancePerGame';
import { recordAttendancePerGameUniqueId } from '../uniqueIds/recordAttendancePerGameUniqueId';
import { recordAttendancePaths } from '../helpers/recordAttendancePath';
import AppUniqueId from '../../src/themes/appUniqueId';

export class RecordAttendance {
  readonly page: Page;
  readonly browser: Browser;
  public readonly homeIcon: Locator;
  public readonly matchDay: Locator;
  public readonly competition: Locator;
  public readonly settingsMenu: Locator;
  public readonly settingsSubMenu: Locator;
  public readonly positionTracking: Locator;
  public readonly recordGoalAttempts: Locator;
  public readonly gameTimeTracking: Locator;
  public readonly attendanceReport: Locator;
  public readonly selectAttendanceReport: Locator;
  public readonly saveSettings: Locator;
  public readonly competitionDetails: Locator;
  public readonly matches: Locator;
  public readonly actions: Locator;
  public readonly addMatch: Locator;
  public readonly todayDate: Locator;
  public readonly date: Locator;
  public readonly division: Locator;
  public selectDivision: Locator;
  public readonly time: Locator;
  public readonly okButton: Locator;
  public readonly type: Locator;
  public readonly selectType: Locator;
  public readonly homeTeam: Locator;
  public readonly selectHomeTeam: Locator;
  public readonly awayTeam: Locator;
  public readonly selectAwayTeam: Locator;
  public readonly selectTeam: Locator;
  public readonly venue: Locator;
  public readonly selectVenue: Locator;
  public readonly round: Locator;
  public readonly selectRound: Locator;
  public readonly matchDuration: Locator;
  public readonly mainBreak: Locator;
  public readonly saveMatch: Locator;
  public readonly saveAttendance: Locator;
  public readonly search: Locator;
  public selectMatch: Locator;
  public readonly statisticsToggle: Locator;
  public readonly searchButton: Locator;
  public readonly borrowPlayerButton1: Locator;
  public readonly borrowPlayerButton2: Locator;
  public readonly searchPlayerInput: Locator;
  public readonly addPlayerInput: Locator;
  public selectBorrowPlayer1: Locator;
  public selectBorrowPlayer2: Locator;
  public readonly savePlayer: Locator;
  public readonly attendanceCheckBox: Locator;
  public readonly matchDayMenu: Locator;
  public readonly teamAttendanceSubMenu: Locator;
  public readonly delete: Locator;
  public readonly yes: Locator;
  public readonly getStatus: Locator;
  public readonly player1: Locator;
  public readonly player2: Locator;
  public readonly statisticsTab: Locator;
  public readonly userProfileIcon: Locator;
  public readonly userAccount: Locator;
  public readonly year: Locator;
  public readonly selectYear: Locator;
  public matchId: any;

  constructor(page: Page) {
    this.page = page;
    this.homeIcon = page.getByTestId(AppUniqueId.HOME_ICON);
    this.userProfileIcon = page.getByTestId(AppUniqueId.USER_PROFILE_ICON);
    this.userAccount = page.getByTestId(AppUniqueId.USER_ACCOUNT + 'BOUND-State');
    this.matchDay = page.getByTestId(AppUniqueId.MATCH_DAY);
    this.competition = this.page.getByTestId(AppUniqueId.COMPETITION + '95');
    this.settingsMenu = this.page.getByTestId(AppUniqueId.MENU_SETTINGS);
    this.settingsSubMenu = this.page.getByTestId(AppUniqueId.SUBMENU_SETTINGS);
    this.positionTracking = page.getByTestId(AppUniqueId.CHECKBOX + 'positionTracking');
    this.recordGoalAttempts = page.getByTestId(AppUniqueId.CHECKBOX + 'recordGoalAttempts');
    this.gameTimeTracking = page.getByTestId(AppUniqueId.CHECKBOX + 'gameTimeTracking');
    this.attendanceReport = page.getByTestId(AppUniqueId.ATTENDANCE_REPORT);
    this.selectAttendanceReport = page.getByTestId(AppUniqueId.SELECT_ATTENDANCE_REPORT + 'Games')
    this.saveSettings = page.getByTestId(AppUniqueId.SETTINGS_SAVE_BUTTON);
    this.competitionDetails = page.getByTestId(AppUniqueId.MENU_COMPETITION_DETAILS);
    this.matches = page.getByTestId(AppUniqueId.SUBMENU_MATCHES);
    this.actions = page.getByTestId(AppUniqueId.ACTIONS_BUTTON);
    this.addMatch = page.getByTestId(AppUniqueId.ADD_MATCH);
    this.date = page.getByTestId(AppUniqueId.DATE_PICKER);
    this.time = page.getByTestId(AppUniqueId.SELECT_TIME);
    this.division = page.getByTestId(AppUniqueId.MATCH_DIVISION);
    this.type = page.getByTestId(AppUniqueId.MATCH_TYPE);
    this.selectType = page.getByTestId(AppUniqueId.SELECT_HALVES);
    this.homeTeam = page.getByTestId(AppUniqueId.HOME_TEAM);
    this.awayTeam = page.getByTestId(AppUniqueId.AWAY_TEAM);
    this.selectHomeTeam = page.getByTestId(AppUniqueId.SELECT_HOME_TEAM + '1098');
    this.selectAwayTeam = page.getByTestId(AppUniqueId.SELECT_AWAY_TEAM + '1099');
    this.venue = page.getByTestId(AppUniqueId.MATCH_VENUE);
    this.selectVenue = page.getByTestId(AppUniqueId.SELECT_MATCH_VENUE + '12');
    this.round = page.getByTestId(AppUniqueId.MATCH_ROUND);
    this.selectRound = page.getByTestId(AppUniqueId.SELECT_MATCH_ROUND + '520');
    this.matchDuration = page.getByTestId(AppUniqueId.MATCH_DURATION);
    this.mainBreak = page.getByTestId(AppUniqueId.MAIN_BREAK);
    this.saveMatch = page.getByTestId(AppUniqueId.SAVE_MATCH);
    this.search = page.getByTestId(AppUniqueId.SEARCH_INPUT);
    this.statisticsToggle = page.getByTestId(AppUniqueId.STATISTICS_SWITCH);
    this.borrowPlayerButton1 = page.getByTestId(AppUniqueId.BORROW_PLAYER_TEAM1);
    this.borrowPlayerButton2 = page.getByTestId(AppUniqueId.BORROW_PLAYER_TEAM2);
    this.searchPlayerInput = page.getByTestId(AppUniqueId.ADD_PLAYER_INPUT);
    this.savePlayer = page.getByTestId(AppUniqueId.ADD_PLAYER_BUTTON);
    this.saveAttendance = page.getByTestId(AppUniqueId.ATTENDANCE_SAVE_BUTTON);
    this.matchDayMenu = page.getByTestId(AppUniqueId.MATCH_DAY_MENU);
    this.teamAttendanceSubMenu = page.getByTestId(AppUniqueId.SUBMENU_TEAM_ATTENDANCE);
    this.player1 = page.getByTestId(AppUniqueId.PLAYER_NAME + 'Player1');
    this.player2 = page.getByTestId(AppUniqueId.PLAYER_NAME + 'Player2');
    this.delete = page.getByTestId(AppUniqueId.DELETE_MATCH_BUTTON);
    this.year = page.getByTestId(AppUniqueId.SELECT_YEAR);
    this.selectYear = page.getByTestId(AppUniqueId.SELECT_YEAR_OPTION +'2022');

    selectors.setTestIdAttribute('id');
    this.yes = page.getByText(recordAttendancePerGameUniqueId.yes);
  
    selectors.setTestIdAttribute('class');
    this.addPlayerInput = page.getByTestId(recordAttendancePerGameUniqueId.searchPlayerInput);
    this.okButton = page.getByTestId(recordAttendancePerGameUniqueId.okButton);
    this.attendanceCheckBox = page.getByTestId(recordAttendancePerGameUniqueId.attendanceCheckBox);
    this.getStatus = page.getByTestId(recordAttendancePerGameUniqueId.getStatus);
    this.statisticsTab = page.getByText(recordAttendancePerGameUniqueId.statisticsTab);
    selectors.setTestIdAttribute('data-testid');
        
  }

  async navigateToCompetition(scenario: any) {
    let recordAttendance = await record_attendance.recordAttendance;
    await this.userProfileIcon.click();
    await this.userAccount.click();
    await this.homeIcon.click();
    await this.matchDay.waitFor({ state: 'visible' });
    await this.matchDay.click();
    await this.page.reload();
    await this.year.click();
    await this.selectYear.click();
    await this.competition.waitFor({ state: 'visible' });
    await this.competition.click();
    await this.settingsMenu.hover();
    await this.settingsSubMenu.click();
    if ((await this.positionTracking.isChecked()) == true) {
      await this.positionTracking.click();
    }
    if ((await this.recordGoalAttempts.isChecked()) == true) {
      await this.recordGoalAttempts.click();
    }
    if ((await this.gameTimeTracking.isChecked()) == true) {
      await this.gameTimeTracking.click();
    }
    await this.attendanceReport.click();
    await this.selectAttendanceReport.click();
    await this.saveSettings.click();
  }

  async createMatch(scenario: any) {
    var date = new Date().toISOString().slice(0,10);
    var today = (date.split('-').reverse().join('-'));
    let recordAttendance = await record_attendance.recordAttendance;
    await this.competitionDetails.waitFor({ state: 'visible' });
    await this.competitionDetails.hover();
    await this.matches.click();
    await this.actions.waitFor({ state: 'visible' });
    await this.actions.click();
    await this.addMatch.click();
    await this.date.waitFor({ state: 'visible' });
    await this.date.click();
    console.log(today);
    await this.date.fill(today);
    await this.date.press('Enter');
    await this.time.click();
    await this.time.fill('');
    await this.time.fill(await recordAttendance[scenario]['Start Time']);
    await this.time.press('Enter');
    this.selectDivision = this.page.getByTestId(AppUniqueId.SELECT_DIVISION +  await recordAttendance[scenario]['Division']);
    await this.division.click();
    await this.selectDivision.click();
    await this.type.click();
    await this.selectType.click();
    await this.homeTeam.click();
    await this.selectHomeTeam.nth(0).click();
    await this.awayTeam.click();
    await this.selectAwayTeam.nth(0).click();
    await this.venue.click();
    await this.selectVenue.click();
    await this.round.click();
    await this.selectRound.click();
    await this.matchDuration.fill(await recordAttendance[scenario]['Match Duration']);
    await this.mainBreak.fill(await recordAttendance[scenario]['Main Break']);
    await this.saveMatch.click();
    await this.page.waitForLoadState('domcontentloaded');
    const [response] = await Promise.all([
      await this.page.waitForResponse(
        response =>
          response.url() === process.env.URL_API_LIVESCORES + recordAttendancePaths.API_MATCHES &&
          response.status() === 200,
      ),
    ]);
    let matchIds = await JSON.parse((await response.body()).toString('utf-8'));
    this.matchId = await JSON.stringify(matchIds.id);
    console.log(await this.matchId);
  }

  async markPlayerAttendance(scenario: any) {
    let recordAttendance = await record_attendance.recordAttendance;
    await this.page.reload();
    await this.search.fill(await this.matchId);
    await this.search.press('Enter');
    this.selectMatch = this.page.getByTestId(AppUniqueId.MATCH_ID + await this.matchId);
    await this.selectMatch.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.statisticsToggle.click();
    await this.borrowPlayerButton1.click();
    await this.searchPlayerInput.click();
    await this.addPlayerInput.nth(2).fill(await recordAttendance[scenario]['Borrow Player1']);
    this.selectBorrowPlayer1 = this.page.getByTestId(
      await recordAttendance[scenario]['Borrow Player1'],
    );
    this.selectBorrowPlayer2 = this.page.getByTestId(
      await recordAttendance[scenario]['Borrow Player2'],
    );
    await this.selectBorrowPlayer1.click();
    await this.savePlayer.click();
    await this.borrowPlayerButton2.click();
    await this.searchPlayerInput.click();
    await this.addPlayerInput.nth(2).fill(await recordAttendance[scenario]['Borrow Player2']);
    await this.selectBorrowPlayer2.click();
    await this.savePlayer.click();
    await this.attendanceCheckBox.nth(0).click();
    await this.attendanceCheckBox.nth(1).click();
    await this.attendanceCheckBox.nth(2).click();
    await this.attendanceCheckBox.nth(3).click();
    await this.saveAttendance.click();
  }

  async verifyAttendance() {
    let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
    await this.matchDayMenu.hover();
    await this.teamAttendanceSubMenu.click({ timeout: 50000 });
    await this.search.fill(await this.matchId, { timeout: 50000 });
    await this.search.press('Enter');
    this.selectMatch = this.page.getByTestId(AppUniqueId.MATCH_ID + await this.matchId);
    await this.selectMatch.nth(0).click();
    await this.page.waitForURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.MATCH_DETAILS);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.getStatus.nth(3)).toHaveText(recordAttendancePaths.PLAYED);
    await expect(await this.getStatus.nth(8)).toHaveText(recordAttendancePaths.BORROWED);
    await expect(await this.getStatus.nth(13)).toHaveText(recordAttendancePaths.PLAYED);
    await expect(await this.getStatus.nth(18)).toHaveText(recordAttendancePaths.BORROWED);
    await this.page.goBack();
    await this.page.waitForURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.TEAM_ATTENDANCE);
    await this.search.fill(await this.matchId, { timeout: 50000 });
    await this.search.press('Enter');
    await this.player1.click({ timeout: 50000 });
    await this.page.waitForURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.USER_PERSONAL, {
      waitUntil: 'load',
    });
    await this.page.waitForLoadState('domcontentloaded');
    await this.statisticsTab.click({ timeout: 50000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect
      .soft(this.getStatus.nth(38))
      .toHaveText(recordAttendancePaths.GAMES, { timeout: 50000 });
    await this.page.goBack({ timeout: 50000 });
    await this.search.fill(await this.matchId);
    await this.search.press('Enter');
    await this.player2.click({ timeout: 100000 });
    await this.page.waitForURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.USER_PERSONAL, {
      waitUntil: 'load',
    });
    await this.page.waitForLoadState('domcontentloaded');
    await this.statisticsTab.click({ timeout: 50000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect
      .soft(this.getStatus.nth(38))
      .toHaveText(recordAttendancePaths.GAMES, { timeout: 5000 });
    await this.page.goBack({ timeout: 50000 });
    await this.competitionDetails.waitFor({ state: 'visible' });
    await this.competitionDetails.hover();
    await this.matches.click();
    await this.search.fill(await this.matchId);
    await this.search.press('Enter');
    await this.selectMatch.click();
    await this.delete.waitFor({ state: 'visible' });
    await this.delete.click();
    await this.yes.click();
    await this.page.waitForURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.MATCHES);
    await expect(this.page).toHaveURL(URL_WEB_COMP_ADMIN + recordAttendancePaths.MATCHES, {
      timeout: 50000,
    });
  }
}

import { expect, Locator, Page, selectors } from '@playwright/test';
import AppUniqueId from '../../src/themes/appUniqueId';
import { User } from '@fixtures/user';
import { api_Request } from '../utils/apiutils';
var md5 = require('md5');
const { base64encode, base64decode } = require('nodejs-base64');
export class LoginPage {
  readonly page: Page;

  private readonly loginButton: Locator;
  private readonly userNameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly menuActions: Locator;
  private readonly emailDisplay: Locator;
  private readonly userProfileIcon: Locator;
  private readonly accountSettings: Locator;
  private readonly homeIcon: Locator;
  private readonly homeMenu: Locator;

  
  private userEmail: any;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId(AppUniqueId.login_submitButton);
    this.userNameInput = page.getByTestId(AppUniqueId.login_username);
    this.passwordInput = page.getByTestId(AppUniqueId.login_password);
    this.menuActions = page.getByTestId(AppUniqueId.MENU_ACTIONS);
    this.userProfileIcon = page.getByTestId(AppUniqueId.USER_PROFILE_ICON);
    this.homeIcon = page.getByTestId(AppUniqueId.HOME_ICON);
    this.homeMenu = page.getByTestId(AppUniqueId.HOME_MENU);
    this.emailDisplay = page.getByTestId(AppUniqueId.PERSONAL_DETAILS_EMAIL);

    selectors.setTestIdAttribute('id');
    this.accountSettings = page.getByTestId(AppUniqueId.ACCOUNT_SETTINGS);

  }

  async loginUserUI(user: User) {
    let loginDetails = await user.usercredential;
    await this.userNameInput.fill(await loginDetails[0]['Username']);
    await expect(this.userNameInput).toHaveValue(await loginDetails[0]['Username']);
    await this.passwordInput.fill(await loginDetails[0]['Password']);
    await expect(this.passwordInput).toHaveValue(await loginDetails[0]['Password']);
    await this.loginButton.click();
  }
  async loginApiUser(user: User, apiUrl: any, apiHeaders: any, apiBody: any, apiMethod: any) {
    let loginDetails = await user.usercredential;
    let user1 = await loginDetails[0]['Username'];
    let pass = await loginDetails[0]['Password'];
    const BWSA: string = 'BWSA';
    let encoded: any = base64encode((await user1) + ':' + md5(await pass));
    let key = BWSA + ' ' + encoded;
    let response = await api_Request(key, apiUrl, JSON.stringify(apiHeaders), apiBody, apiMethod);
    return response;
  }

  async createProduct(auth: any, apiUrl: any, apiHeaders: any, apiBody: any, apiMethod: any) {
    let response = await api_Request(auth, apiUrl, JSON.stringify(apiHeaders), apiBody, apiMethod);
    return response;
  }

  async verifyLoginUserEmail(user: User) {
    await this.userProfileIcon.click();
    await this.accountSettings.click();
    let loginDetails = await user.usercredential;
    this.userEmail= await loginDetails[0]['Username'];
    await this.emailDisplay.waitFor({ state: 'visible' });
    await expect(this.emailDisplay).toHaveAttribute('value',this.userEmail);
     await this.homeIcon.scrollIntoViewIfNeeded();
     await this.homeIcon.click();
     await this.homeMenu.click();
  }
}

import { normalUser as user } from '@fixtures/user';
import { Paths } from '@helpers/paths';
import { OrganisationSettings } from '@helpers/organizationSettings';
import { OrganizationSettings } from '@pages/orgSettings';
import { LoginPage } from '@pages/login.page';
import { expect, test } from '@playwright/test';
var path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '../.env'),
});
test('Org Settings', async ({ page }) => {
    test.slow();
    await page.goto(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.LOGIN);
    await expect(page).toHaveURL(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.LOGIN);

    const login = new LoginPage(page);
    await login.loginUserUI(user);
    await page.waitForNavigation();
    await expect(page).toHaveURL(process.env.REACT_APP_URL_WEB_COMP_ADMIN + Paths.DASHBOARD);

    const orgsetting = new OrganizationSettings(page);

    await orgsetting.addOrganization(OrganisationSettings.Who_Can_Add_Organisation);
    await orgsetting.addVenu(OrganisationSettings.Who_Can_Add_Venue);
    await orgsetting.seeVenu(OrganisationSettings.Who_Can_See_Venue);
    await orgsetting.playerReplicate(OrganisationSettings.Player_Replication_Rules);
    await orgsetting.playerBorrowing(OrganisationSettings.Player_Borrowing_Rules);
    await orgsetting.endUserSettings(OrganisationSettings.End_User_Settings);
    await orgsetting.transactionFees(OrganisationSettings.Who_will_pay_the_Transaction_Fees);

});

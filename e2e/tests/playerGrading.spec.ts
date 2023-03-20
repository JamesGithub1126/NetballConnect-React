import { normalUser as user } from '@fixtures/user';
import { PlayerGrading } from '@pages/playerGrading';
import { LoginPage } from '@pages/login.page';
import { expect, test } from '@playwright/test';

let scenario: any;
test('Player Grading', async ({ page }) => {
    //test.slow();
    let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
    await page.goto(URL_WEB_COMP_ADMIN);
    const login = new LoginPage(page);
    await login.loginUserUI(user);
    scenario = 0;
    const playerGrading = new PlayerGrading(page);
    await playerGrading.goToHomeIcon();
    await playerGrading.competionIcon();
    await playerGrading.ownCompPlayerGrad();
    await playerGrading.selectCompetition(scenario);
    await playerGrading.createCompetition(scenario);
    await playerGrading.verifycreateCompetition(scenario);


    await playerGrading.importPlayersUnassigned();
    await playerGrading.verifyImportPlayersUnassigned('1 lines processed. 1 lines successfully imported, 0 lines skipped, 0 lines updated and 0 lines failed.');
    await playerGrading.deleteImportPlayersUnassigned(scenario);
    await playerGrading.deleteTeam(scenario);
    await playerGrading.verifydeleteTeam();

    ///
    await playerGrading.importPlayersAassigned();
    await playerGrading.verifyImportPlayersAssigned('1 lines processed. 1 lines successfully imported, 0 lines skipped, 0 lines updated and 0 lines failed.');
    await playerGrading.deleteImportPlayersUnassigned(scenario);
    await playerGrading.replilcatePlayer();

});

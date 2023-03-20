import { expect, Locator, Page, selectors, Browser } from '@playwright/test';
import { player_Grading } from '../fixtures/playerGrading';
import { playerGrading_appUniqueIds } from '../uniqueIds/playerGrading_appUniqueIds';
import { dbQueries } from '@fixtures/db-queries';
import { originalData, readData } from '../utils/readWriteCSV';

export class PlayerGrading {
    readonly page: Page;
    readonly browser: Browser;
    private dateTime: any;
    public readonly homeIcon: Locator;
    public readonly competitionIcon: Locator;
    public readonly ownCompetitionsMenu: Locator;
    public readonly ownCompetitionsPlayerGrading: Locator;
    public readonly playerGradingCompetitionNameDropdown: Locator;
    public readonly playerGradCreateTeamBn: Locator;
    private readonly modalFocus: Locator;
    private readonly clickAlert: Locator;
    private readonly playerGradingAddTeamName: Locator;
    private readonly addedTeamName: Locator;
    private readonly deleteTeamName: Locator;
    private readonly playGradImportBn: Locator;
    private readonly playGradImportChooseFileBn: Locator;
    private readonly playerImportUploadBtn: Locator;
    private readonly playerGradingUnassignedPlayers: Locator;
    private readonly unassignedPlayerId: Locator;
    private readonly verifyPlayerImport: Locator;
    private readonly userIcon: Locator;
    private readonly administratorsOption: Locator;
    private readonly ourOrganization: Locator;
    private readonly selectCompetitionName: Locator;
    private readonly allowReplicate: Locator;
    private readonly submitBtn: Locator;
    private readonly allowReplicateYesOption: Locator;
    private readonly playerGradingAassignedPlayers: Locator;
    private readonly assignedPlayerId: Locator;


    constructor(page: Page) {
        this.page = page;
        //selectors.setTestIdAttribute('id');
        this.homeIcon = page.getByTestId(playerGrading_appUniqueIds.HOME_ICON);
        this.competitionIcon = page.getByTestId(playerGrading_appUniqueIds.COMPETITION_ICON);
        this.ownCompetitionsMenu = page.getByTestId(playerGrading_appUniqueIds.OWN_COMPETITIONS_MENU);
        this.ownCompetitionsPlayerGrading = page.getByTestId(playerGrading_appUniqueIds.OWN_COMPETITIONS_PLAYER_GRADING);
        this.playerGradingCompetitionNameDropdown = page.getByTestId(playerGrading_appUniqueIds.PLAYGRAD_COMPNAME_DPDN);
        this.playerGradCreateTeamBn = page.getByTestId(playerGrading_appUniqueIds.PLAYGRAD_CREATE_TEAM_BN);
        this.playerGradingAddTeamName = page.getByTestId(playerGrading_appUniqueIds.PLAYGRAD_ADD_TEAM_NAME);
        this.addedTeamName = page.getByTestId(playerGrading_appUniqueIds.ADDED_TEAM_NAME);
        this.playGradImportBn = page.getByTestId(playerGrading_appUniqueIds.PLAYER_GRADING_IMPORT_BN);
        this.playGradImportChooseFileBn = page.getByTestId(playerGrading_appUniqueIds.IMPORT_CHOOSE_FILE_BTN);
        this.playerImportUploadBtn = page.getByTestId(playerGrading_appUniqueIds.PLAYER_IMPORT_UPLOAD_BTN);

        selectors.setTestIdAttribute('class');
        this.modalFocus = page.getByTestId(playerGrading_appUniqueIds.MODAL_FOCUS);
        this.clickAlert = page.getByTestId(playerGrading_appUniqueIds.CLICK_ALERT);
        this.deleteTeamName = page.getByTestId(playerGrading_appUniqueIds.DELETE_TEAM_NAME);
        this.unassignedPlayerId = page.getByTestId(playerGrading_appUniqueIds.UNASSIGNED_PLAYER_ID);
        this.verifyPlayerImport = page.getByTestId(playerGrading_appUniqueIds.VERIFY_PLAYER_IMPORT);
        this.playerGradingUnassignedPlayers = page.getByTestId(playerGrading_appUniqueIds.PLAYER_GRADING_UNASSIGNED_PLAYERS);


        var date = new Date();
        var current_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        var time = new Date();
        var current_time = time.getHours() + '-' + time.getMinutes() + '-' + time.getSeconds();
        this.dateTime = current_date + 'T' + current_time;


    }


    async goToHomeIcon() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.homeIcon.click();
    }

    async competionIcon() {
        await this.competitionIcon.click();
    }

    async ownCompPlayerGrad() {
        await this.ownCompetitionsMenu.click();
        await this.ownCompetitionsPlayerGrading.click();
    }

    async selectCompetition(scenario: any) {
        let playerGrading = await player_Grading.playergrading
        await this.playerGradingCompetitionNameDropdown.click();
        await this.page.getByText(await playerGrading[scenario]['Competition Name']).click();
    }

    async createCompetition(scenario: any) {
        let playerGrading = await player_Grading.playergrading
        await this.playerGradCreateTeamBn.click();
        await this.modalFocus.nth(1).focus();
        await this.playerGradingAddTeamName.click();
        await this.playerGradingAddTeamName.fill(await playerGrading[scenario]['Team Name']);
        await this.clickAlert.click();
    }

    async verifycreateCompetition(scenario: any) {
        let playerGrading = await player_Grading.playergrading
        await expect.soft(this.addedTeamName).toContainText(await playerGrading[scenario]['Team Name']);
    }


    async deleteTeam(scenario: any) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.deleteTeamName.click({ timeout: 100000 });
        await this.page.getByRole('button', { name: 'OK' }).click();
    }

    async verifydeleteTeam() {
        await expect(this.addedTeamName).toHaveCount(0);
    }


    async importPlayersUnassigned() {
        readData();
        await this.playGradImportBn.click();
        await this.playGradImportChooseFileBn.setInputFiles('WSA_CompetitionImportPlayer.csv');
        await this.playerImportUploadBtn.click();
        originalData();
    }

    async verifyImportPlayersUnassigned(verifyMessage: any) {
        this.verifyPlayerImport.focus();
        await expect(this.verifyPlayerImport).toContainText(verifyMessage);
    }

    /// 
    async importPlayersAassigned() {
        readData();
        await this.playGradImportBn.click();
        await this.playGradImportChooseFileBn.setInputFiles('WSA_CompetitionImportPlayerAssigned.csv');
        await this.playerImportUploadBtn.click();
        originalData();
    }

    async verifyImportPlayersAssigned(verifyMessage: any) {
        this.verifyPlayerImport.focus();
        await expect(this.verifyPlayerImport).toContainText(verifyMessage);
    }


    async replilcatePlayer() {
        await this.userIcon.click();
        await this.administratorsOption.click();
        await this.ourOrganization.click();
        await this.selectCompetitionName.click();
        await this.allowReplicate.click();
        await this.submitBtn.click();

        await this.homeIcon.click();
        await this.competitionIcon.click();
        await this.ownCompetitionsMenu.click();
        await this.selectCompetitionName.click();
        await this.allowReplicateYesOption.click();
        await this.submitBtn.click();

    }

    async deleteImportPlayersUnassigned(scenario) {

        let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
        await this.page.goto(URL_WEB_COMP_ADMIN + '/competitionPlayerGrades');
        let playerGrading = await player_Grading.playergrading
        await this.playerGradingCompetitionNameDropdown.click();
        await this.page.getByText(await playerGrading[scenario]['Competition Name']).click();
        expect(this.playerGradingUnassignedPlayers).toBeVisible({ timeout: 10000 })
        this.playerGradingUnassignedPlayers.nth(1).click({ delay: 50 });
        let playerID = (this.unassignedPlayerId.textContent).toString().slice(1);

        let sql_Query =
            'update wsa_competitions.player set isDeleted=1 where userId=' + playerID + ';';
        await dbQueries(sql_Query);

    }

    async deleteImportPlayersAassigned(scenario) {

        let URL_WEB_COMP_ADMIN: any = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
        await this.page.goto(URL_WEB_COMP_ADMIN + '/competitionPlayerGrades');
        let playerGrading = await player_Grading.playergrading
        await this.playerGradingCompetitionNameDropdown.click();
        await this.page.getByText(await playerGrading[scenario]['Competition Name']).click();
        expect(this.playerGradingAassignedPlayers).toBeVisible({ timeout: 10000 })
        this.playerGradingAassignedPlayers.nth(1).click({ delay: 50 });
        let playerID = (this.assignedPlayerId.textContent).toString().slice(1);

        let sql_Query =
            'update wsa_competitions.player set isDeleted=1 where userId=' + playerID + ';';
        await dbQueries(sql_Query);

    }

}

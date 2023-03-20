import { expect, Locator, Page } from '@playwright/test';
import AppUniqueId from '../../src/themes/appUniqueId';
import { User } from '@fixtures/user';


export class OrganizationSettings {

    readonly page: Page;

    private readonly homeIcon: Locator;
    private readonly userIcon: Locator;
    private readonly administratorMenu: Locator;
    private readonly ourOrganizationMenu: Locator;
    private readonly addOrganisation_eachLevelHierarchy: Locator;
    private readonly addOrganisation_ourOrganization: Locator;
    private readonly addVenu_eachLevelHierarchy: Locator;
    private readonly addVenu_ourOrganization: Locator;
    private readonly seeVenu_allOrganization: Locator;
    private readonly seeVenu_onlyLinkedOrganizations: Locator;
    private readonly playerReplication: Locator;
    private readonly playerBorrow_competitionOrganiser: Locator;
    private readonly playerBorrow_stateWide: Locator;
    private readonly endUserRegistrationChangeRequest: Locator;
    private readonly transactionFees_registeringParticipant: Locator;
    private readonly transactionFees_ourOrganisation: Locator;
    private readonly updateSettings: Locator;




    constructor(page: Page) {
        this.page = page;
        this.homeIcon = page.getByTestId(AppUniqueId.HOME_ICON);
        this.userIcon = page.getByTestId(AppUniqueId.USER_ICON);
        this.administratorMenu = page.getByTestId(AppUniqueId.ADMINISTRATORS_MENU);
        this.ourOrganizationMenu = page.getByTestId(AppUniqueId.OUR_ORGANIZATION_SUBMENU);
        this.addOrganisation_eachLevelHierarchy = page.getByTestId(AppUniqueId.ADD_ORGANIZATION_EACH_LEVEL_HIERARCHY);
        this.addOrganisation_ourOrganization = page.getByTestId(AppUniqueId.ADD_ORGANIZATION_OUR_ORGANIZATION);
        this.addVenu_eachLevelHierarchy = page.getByTestId(AppUniqueId.ADD_VENU_EACH_LEVEL_HIERARCHY);
        this.addVenu_ourOrganization = page.getByTestId(AppUniqueId.ADD_VENU_OUR_ORGANIZATION);
        this.seeVenu_allOrganization = page.getByTestId(AppUniqueId.SEE_VENU_ALL_ORGANIZATION);
        this.seeVenu_onlyLinkedOrganizations = page.getByTestId(AppUniqueId.SEE_VENU_ONLY_LINKED_ORGANIZATION);
        this.playerReplication = page.getByTestId(AppUniqueId.PLAYER_REPLICATE);
        this.playerBorrow_competitionOrganiser = page.getByTestId(AppUniqueId.PLAYER_BORROW_BY_COMPETITION_ORGANIZER);
        this.playerBorrow_stateWide = page.getByTestId(AppUniqueId.PLAYER_BORROW_STATE_WIDE);
        this.endUserRegistrationChangeRequest = page.getByTestId(AppUniqueId.SUBMIT_REGISTRATION_CHANGE_REQUEST);
        this.transactionFees_registeringParticipant = page.getByTestId(AppUniqueId.TRANSACTION_FEES_REGISTERING_PARTICIPANT);
        this.transactionFees_ourOrganisation = page.getByTestId(AppUniqueId.TRANSACTION_FEES_OUR_ORGANIZATION);
        this.updateSettings = page.getByTestId(AppUniqueId.UPDATE_ORGANIZATION_SETTINGS);
    }

    async organizationSettings(addOrganization: any, addVenu: any, seeVenu: any, playerReplicat: any, playerBorrow: any, RegistrationChangeRequest: any, transactionFees: any) {

    }

    async gotoOrgSettings() {
        await this.homeIcon.click();
        await this.userIcon.click();
        await this.administratorMenu.click();
        await this.ourOrganizationMenu.click();
    }


    async addOrganization(addOrganization: string) {
        this.gotoOrgSettings();

        if (addOrganization.includes('Each Level of the Hierarchy')) {
            await this.addOrganisation_eachLevelHierarchy.click();
            await this.page.getByRole('button', { name: 'Update' }).click();
            await this.updateSettings.click();
            await this.verifySettings(this.addOrganisation_eachLevelHierarchy);
        }
        if (addOrganization.includes('Our Organisation Only')) {
            await this.addOrganisation_ourOrganization.click();
            await this.page.getByRole('button', { name: 'Update' }).click();
            await this.updateSettings.click();
            await this.verifySettings(this.addOrganisation_ourOrganization);

        }


    }

    async addVenu(addvenu: any) {
        this.gotoOrgSettings();
        if (addvenu.includes('Each Level of the Hierarchy')) {
            await this.addVenu_eachLevelHierarchy.click();
            await this.updateSettings.click();
            this.verifySettings(this.addVenu_eachLevelHierarchy);
        }
        if (addvenu == 'Our Organisation Only') {
            await this.addVenu_ourOrganization.click();
            await this.updateSettings.click();
            this.verifySettings(this.addVenu_ourOrganization);
        }

    }

    async seeVenu(seevenu: any) {
        this.gotoOrgSettings();
        if (seevenu.includes('All Organisations')) {

            await this.seeVenu_allOrganization.click();
            await this.updateSettings.click();
            this.verifySettings(this.seeVenu_allOrganization);
        }
        if (seevenu.includes('Only Linked Organisations')) {

            await this.seeVenu_onlyLinkedOrganizations.click();
            await this.updateSettings.click();
            this.verifySettings(this.seeVenu_onlyLinkedOrganizations);

        }

    }

    async playerReplicate(playerReplicate: any) {
        this.gotoOrgSettings();
        if (playerReplicate.includes('Yes')) {
            await this.playerReplication.check();
            await this.updateSettings.click();
            this.verifySettings(this.playerReplication);
        }
        if (playerReplicate.includes('No')) {
            await this.playerReplication.uncheck();
            await this.updateSettings.click();
            this.verifySettingsforUncheck(this.playerReplication);
        }

    }

    async playerBorrowing(playerBorrowing: string) {
        this.gotoOrgSettings();
        if (playerBorrowing.includes('Competition Organiser')) {

            await this.playerBorrow_competitionOrganiser.click();
            await this.updateSettings.click();
            this.verifySettings(this.playerBorrow_competitionOrganiser);
        }
        if (playerBorrowing.includes('state-wide')) {

            await this.playerBorrow_stateWide.click();
            await this.updateSettings.click();
            this.verifySettings(this.playerBorrow_stateWide);

        }
    }

    async endUserSettings(allowChangeRequest: any) {
        this.gotoOrgSettings();
        if (allowChangeRequest.includes('Yes')) {
            await this.endUserRegistrationChangeRequest.check();
            await this.updateSettings.click();
            this.verifySettings(this.endUserRegistrationChangeRequest);
        }
        if (allowChangeRequest.includes('No')) {
            await this.endUserRegistrationChangeRequest.uncheck();
            await this.updateSettings.click();
            this.verifySettingsforUncheck(this.endUserRegistrationChangeRequest);

        }

    }

    async transactionFees(transactionFees: string) {
        this.gotoOrgSettings();
        if (transactionFees.includes('Registering Participant')) {

            await this.transactionFees_registeringParticipant.click();
            await this.updateSettings.click();
            this.verifySettings(this.transactionFees_registeringParticipant);
        }
        if (transactionFees.includes('Our Organisation')) {

            await this.transactionFees_ourOrganisation.click();
            await this.updateSettings.click();
            this.verifySettings(this.transactionFees_ourOrganisation);

        }
    }


    async verifySettings(setting: Locator) {

        await this.gotoOrgSettings();
        expect(await setting.isChecked()).toBeTruthy;
    }
    async verifySettingsforUncheck(setting: Locator) {
        await this.gotoOrgSettings();
        expect(await setting.isChecked()).toBeFalsy;
    }


}



import { Locator, Page } from '@playwright/test';

/**
 * @todo this is a wip
 */
export class MenuPage {
    readonly page: Page;
    private readonly profileButton: Locator
    private readonly actionsButton: Locator
    private readonly matchDayButton: Locator

    constructor(page: Page) {
        this.page = page;

        this.profileButton = page.getByTestId('menuProfileButton')
        this.actionsButton = page.getByTestId('menuActionsButton')
        this.matchDayButton = page.getByTestId('menuMatchDayCompetitions')
    }

    async goToMenuAction(option: 'match day') {
        let actionLocator: Locator

        switch(option) {
            case 'match day':
                actionLocator = this.matchDayButton
                break
        default:
            throw 'Not valid menu action option'
        }

        this.actionsButton.click()
        actionLocator.click()
    }
}

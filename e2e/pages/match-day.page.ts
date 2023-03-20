import { Locator, Page } from '@playwright/test';

/**
 * @todo this is a wip
 */
export class MatchDayPage {
    readonly page: Page;

    private readonly subMenuSettingsTitle: Locator
    private readonly subMenuCompetitionDetailsTitle: Locator
    private readonly subMenuSettingsOption: Locator
    private readonly subMenuMatchesOption: Locator

    constructor(page: Page) {
        this.page = page;

        this.subMenuSettingsTitle = page.getByTestId('subMenuSettingsTitle')
        this.subMenuCompetitionDetailsTitle = page.getByTestId('subMenuCompetitionDetailsTitle')
        this.subMenuSettingsOption = page.getByTestId('subMenuSettingsOption')
        this.subMenuMatchesOption = page.getByTestId('subMenuMatchesOption')
    }

}

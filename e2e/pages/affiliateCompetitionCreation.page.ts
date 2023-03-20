import { expect, Locator, Page, selectors } from '@playwright/test';
import { affiliatetCompetitionCreation } from '../fixtures/affiliateCompetitionCreation';
import { affiliateCompetitionCreationUniqueID as uniqueIds } from '../uniqueIds/affiliateCompetitionCreationUniqueIds';
import AppUniqueId from '../../src/themes/appUniqueId';

export class Affiliate_CompetitionCreation {
  readonly page: Page;
  private readonly homeIcon: Locator;
  private readonly registrationIcon: Locator;
  private readonly newCompetitionRegistration: Locator;
  private readonly competitionName: Locator;
  private readonly useLogo: Locator;
  private readonly venue: Locator;
  private readonly venueOption: Locator;
  private readonly competitionFormatRoundRobin: Locator;
  private readonly startDate: Locator;
  private readonly endDate: Locator;
  private readonly timeBetweenRoundsDays: Locator;
  private readonly registrationEndDate: Locator;
  private readonly registrationInviteesAffiliate: Locator;
  private readonly nextButton: Locator;
  private readonly memberShipProductAnnual2022: Locator;
  private readonly membershipType: Locator;
  private readonly addRegistrationDivision: Locator;
  private readonly competitionRegistration: Locator;
  private readonly addDivision: Locator;
  private readonly individualUserRegistration: Locator;
  private readonly individualSeasonalNominationFeesGST: Locator;
  private readonly individualSeasonalCompetitionFeesGST: Locator;
  private readonly individualUserSingleGameFee: Locator;
  private readonly individualUserSingleGameCompetitionFeesGST: Locator;
  private readonly teamRegistration: Locator;
  private readonly individualFeeChrgedPerPlayer: Locator;
  private readonly chargedPerGamePlayed: Locator;
  private readonly individualFeeChargedPerGamePlayedNominationGST: Locator;
  private readonly individualFeeChargedPerGamePlayedCompetitionGST: Locator;
  private readonly paymentMethodDirectDebit: Locator;
  private readonly paymentMethodCreditOrDebit: Locator;
  private readonly paymentMethodCash: Locator;
  private readonly individualUserSeasonalFeeOffline: Locator;
  private readonly registrationCode: Locator;
  private readonly teamFeePerMatch: Locator;
  private readonly governmentVouchersNSWActiveKids: Locator;
  private readonly governmentVouchersNTSports: Locator;
  private readonly userProfileIcon: Locator;
  private readonly userAccount: Locator;
  private readonly selectCompetition: Locator;
  private readonly individualSeasonalAffiliateNominationFeesGST: Locator;
  private readonly individualSeasonalAffiliateCompetitionFeesGST: Locator;
  private readonly individualUserSingleGameAffiliateCompetitionFeesGST: Locator;
  private readonly IdividualFeeChargedPerGamePlayedAffiliateNominationGST: Locator;
  private readonly individualFeeChargedPerGamePlayedAffiliateCompetitionGST: Locator;
  private readonly registrationOpenDate: Locator;
  private readonly registrationCloseDate: Locator;
  private readonly membershipProduct: Locator;
  private readonly membershipProductOption: Locator;
  private readonly selectDivisionIndividual: Locator;
  private readonly selectDivisionTeam: Locator;
  private readonly openRegistrationsButton: Locator;
  private readonly verifyCompetitionName: Locator;
  private readonly verifyCompetitionStatus: Locator;
  private dateTime: any;
  private competitionDetails: any;
  private compName: any;

  constructor(page: Page) {
    this.page = page;
    this.verifyCompetitionName = page.locator(uniqueIds.verifyCompetitionName);
    this.verifyCompetitionStatus = page.locator(uniqueIds.verifyCompetitionStatus);

    //by text
    selectors.setTestIdAttribute('text');
    this.competitionFormatRoundRobin = page.getByText(uniqueIds.competitionFormat);
    this.selectCompetition = page.getByText(uniqueIds.selectCompetition);

    //by data-testid
    selectors.setTestIdAttribute('data-testid');
    this.homeIcon = page.getByTestId(AppUniqueId.HOME_ICON);
    this.registrationIcon = page.getByTestId(AppUniqueId.REGISTRATION_ICON);
    this.newCompetitionRegistration = page.getByTestId(AppUniqueId.NEWCOMPETITION_REGISTRATION);
    this.competitionName = page.getByTestId(AppUniqueId.COMPETITION_NAME);
    this.useLogo = page.getByTestId(AppUniqueId.USE_DEFAULT_COMP_LOGO);
    this.venue = page.getByTestId(AppUniqueId.SELECT_COMPETITION_VENUE);
    this.venueOption = page.getByTestId(
      AppUniqueId.SELECT_COMPETITION_VENUE_OPTION + 'All days venue - 4 Courts',
    );
    this.startDate = page.getByTestId(AppUniqueId.COMPETITION_START_DATE);
    this.endDate = page.getByTestId(AppUniqueId.COMPETITION_END_DATE);
    this.timeBetweenRoundsDays = page.getByTestId(AppUniqueId.TIME_BETWEEN_ROUNDS_DAYS);
    this.registrationEndDate = page.getByTestId(AppUniqueId.REGISTRATION_CLOSE_DATE);
    this.registrationInviteesAffiliate = page.getByTestId(
      AppUniqueId.REGISTRATION_INVITEES_2ND_LEVEL_AFFILIATES,
    );
    this.nextButton = page.getByTestId(AppUniqueId.NEXT_BUTTON);
    this.memberShipProductAnnual2022 = page.getByTestId(AppUniqueId.MEMBERSHIP_PRODUCT);
    this.membershipType = page.getByTestId(AppUniqueId.MEMBERSHIP_TYPE + 0);
    this.nextButton = page.getByTestId(AppUniqueId.NEXT_BUTTON);

    this.addRegistrationDivision = page.getByTestId(AppUniqueId.ADD_REGISTRATION_DIVISIONS);
    this.addDivision = page.getByTestId(AppUniqueId.DIVISION_NAME);
    this.competitionRegistration = page.getByTestId(AppUniqueId.REGISTRATION_RESTRICTION_TYPE);

    this.individualUserRegistration = page.getByTestId(
      AppUniqueId.INDIVIDUAL_USER_REGISTRATION_FEE,
    );
    this.individualSeasonalNominationFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_SEASONAL_NOMINATION_FEES_GST,
    );
    this.individualSeasonalCompetitionFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_SEASONAL_COMPETITION_FEES_GST,
    );
    this.individualUserSingleGameFee = page.getByTestId(
      AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_FEE,
    );
    this.individualUserSingleGameCompetitionFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_COMPETITION_FEES_GST,
    );
    this.teamRegistration = page.getByTestId(AppUniqueId.TEAM_REGISTRATION_FEE);
    this.individualFeeChrgedPerPlayer = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_PLAYER,
    );
    this.chargedPerGamePlayed = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED,
    );
    this.individualFeeChargedPerGamePlayedNominationGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_NOMINATION_GST,
    );
    this.individualFeeChargedPerGamePlayedCompetitionGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_COMPETITION_GST,
    );

    this.paymentMethodDirectDebit = page.getByTestId(AppUniqueId.PAYMENT_METHOD + 0);
    this.paymentMethodCreditOrDebit = page.getByTestId(AppUniqueId.PAYMENT_METHOD + 1);
    this.paymentMethodCash = page.getByTestId(AppUniqueId.PAYMENT_METHOD + 2);

    this.individualUserSeasonalFeeOffline = page.getByTestId(AppUniqueId.PAYMENT_TYPE + 2);
    this.registrationCode = page.getByTestId(AppUniqueId.REGISTRATION_CODE);
    this.teamFeePerMatch = page.getByTestId(AppUniqueId.TEAM_FEE_PAY_PER_MATCH);

    this.governmentVouchersNSWActiveKids = page.getByTestId(AppUniqueId.GOVERNMENT_VOUCHERS + 0);
    this.governmentVouchersNTSports = page.getByTestId(AppUniqueId.GOVERNMENT_VOUCHERS + 1);

    this.userProfileIcon = page.getByTestId(AppUniqueId.USER_PROFILE_ICON);
    this.userAccount = page.getByTestId(AppUniqueId.USER_ACCOUNT + 'BOUND-ASN1Club1');
    this.individualSeasonalAffiliateNominationFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_SEASONAL_AFFILIATE_NOMINATION_FEES_GST,
    );
    this.individualSeasonalAffiliateCompetitionFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_SEASONAL_AFFILIATE_COMPETITION_FEES_GST,
    );
    this.individualUserSingleGameAffiliateCompetitionFeesGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_AFFILIATE_COMPETITION_FEES_GST,
    );
    this.IdividualFeeChargedPerGamePlayedAffiliateNominationGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_NOMINATION_GST,
    );
    this.individualFeeChargedPerGamePlayedAffiliateCompetitionGST = page.getByTestId(
      AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_COMPETITION_GST,
    );

    this.registrationOpenDate = page.getByTestId(AppUniqueId.REGISTRATION_OPEN_DATE);
    this.registrationCloseDate = page.getByTestId(AppUniqueId.REGISTRATION_CLOSE_DATE);
    this.membershipProduct = page.getByTestId(AppUniqueId.MEMBERSHIP_PRODUCT);
    this.membershipProductOption = page.getByTestId(AppUniqueId.MEMBERSHIP_TYPE);
    this.selectDivisionIndividual = page.getByTestId(AppUniqueId.SELECT_DIVISION + 0);
    this.selectDivisionTeam = page.getByTestId(AppUniqueId.SELECT_DIVISION + 1);
    this.openRegistrationsButton = page.getByTestId(AppUniqueId.OPEN_REGISTRATION_BUTTON);
  }

  async competitionCreation(scenario: any) {
    var date = new Date();
    var current_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    var time = new Date();
    var current_time = time.getHours() + '-' + time.getMinutes() + '-' + time.getSeconds();
    this.dateTime = current_date + 'T' + current_time;

    this.competitionDetails = await affiliatetCompetitionCreation.affiliate_Competition;
    this.compName =
      (await this.competitionDetails[scenario]['Competition Name']).toString() +
      (await this.dateTime);
    await this.homeIcon.waitFor({ state: 'visible' });
    await this.homeIcon.click();
    await this.registrationIcon.click();
    await this.newCompetitionRegistration.click();
    await this.competitionName.fill(this.compName);
    await this.page.setInputFiles("input[type='file']", './fixtures/ProfileImage.jpg');
    await this.useLogo.nth(0).click();
    await this.venue.click();
    await this.venueOption.click();
    await this.competitionFormatRoundRobin.first().click();
    await this.startDate.click();
    await this.startDate.fill(
      (await this.competitionDetails[scenario]['Competition Start Date']).toString(),
    );
    await this.startDate.press('Enter');
    await this.endDate.click();
    await this.endDate.fill(
      (await this.competitionDetails[scenario]['Competition End Date']).toString(),
    );
    await this.endDate.press('Enter');
    await this.timeBetweenRoundsDays.click();
    await this.timeBetweenRoundsDays.fill(
      (await this.competitionDetails[scenario]['Time Between Rounds Days']).toString(),
    );
    await this.registrationEndDate.click();
    await this.registrationEndDate.fill(
      await this.competitionDetails[scenario]['Competition End Date'],
    );
    await this.registrationEndDate.press('Enter');
    await this.registrationInviteesAffiliate.click();
    await this.nextButton.click();

    await this.memberShipProductAnnual2022.click();
    await this.membershipType.nth(0).waitFor({ state: 'visible' });
    await this.membershipType.nth(0).click();
    await this.nextButton.click();

    await this.addRegistrationDivision.click();
    await this.addDivision.fill(await this.competitionDetails[scenario]['Registration Division1']);
    await this.addRegistrationDivision.click();
    await this.addDivision
      .nth(1)
      .fill(await this.competitionDetails[scenario]['Registration Division2']);

    await this.competitionRegistration.nth(1).click();
    await this.nextButton.click();

    await this.individualUserRegistration.click();

    await this.individualSeasonalNominationFeesGST.fill(
      (
        await this.competitionDetails[scenario]['Individual User Seasonal Fee Nomination GST']
      ).toString(),
    );
    await this.individualSeasonalCompetitionFeesGST.fill(
      (
        await this.competitionDetails[scenario]['Individual User Seasonal Fee Competition GST']
      ).toString(),
    );
    await this.individualUserSingleGameFee.click();

    await this.individualUserSingleGameCompetitionFeesGST.fill(
      (
        await this.competitionDetails[scenario]['Individual User Single Game Fee Competition GST']
      ).toString(),
    );

    await this.teamRegistration.click();
    await this.individualFeeChrgedPerPlayer.waitFor({ state: 'visible' });
    await this.individualFeeChrgedPerPlayer.click();
    await this.chargedPerGamePlayed.waitFor({ state: 'visible' });
    await this.chargedPerGamePlayed.click();

    await this.individualFeeChargedPerGamePlayedNominationGST.fill(
      (
        await this.competitionDetails[scenario]['Charged Per Game Played Nomination GST']
      ).toString(),
    );
    await this.individualFeeChargedPerGamePlayedCompetitionGST.fill(
      (
        await this.competitionDetails[scenario]['Charged Per Game Played Competition GST']
      ).toString(),
    );

    await this.nextButton.click();

    await this.paymentMethodDirectDebit.click();
    await this.paymentMethodCreditOrDebit.click();
    await this.paymentMethodCash.click();

    await this.individualUserSeasonalFeeOffline.click();
    await this.registrationCode.fill(
      (await this.competitionDetails[scenario]['Registration Code']).toString(),
    );
    await this.teamFeePerMatch.click();
    await this.nextButton.click();

    await this.governmentVouchersNSWActiveKids.click();
    await this.governmentVouchersNTSports.click();
    await this.nextButton.click();
  }

  async verifyCompetitionIsCreated() {
    await expect(this.page).toHaveURL(
      process.env.REACT_APP_URL_WEB_COMP_ADMIN + 'registrationCompetitionList',
      {
        timeout: 50000,
      },
    );
  }

  async completeRegistrationForm(scenario: any) {
    await this.userProfileIcon.click();
    await this.userAccount.waitFor({ state: 'visible' });
    await this.userAccount.click();
    await this.homeIcon.waitFor({ state: 'visible' });
    await this.homeIcon.click();
    await this.registrationIcon.waitFor({ state: 'visible' });
    await this.registrationIcon.click();
    await this.selectCompetition.nth(0).scrollIntoViewIfNeeded();
    await this.selectCompetition.nth(0).waitFor({ state: 'visible' });
    await this.selectCompetition.nth(0).click();

    await this.individualSeasonalAffiliateNominationFeesGST.waitFor({ state: 'visible' });
    await this.individualSeasonalAffiliateNominationFeesGST.fill(
      (
        await this.competitionDetails[scenario][
          'Individual User Seasonal Fee Affiliate Nomination GST'
        ]
      ).toString(),
    );
    await this.individualSeasonalAffiliateCompetitionFeesGST.fill(
      (
        await this.competitionDetails[scenario][
          'Individual User Single Game Fee Affiliate Competition GST'
        ]
      ).toString(),
    );
    await this.individualUserSingleGameAffiliateCompetitionFeesGST.fill(
      (
        await this.competitionDetails[scenario][
          'Individual User Single Game Fee Club Competition GST'
        ]
      ).toString(),
    );
    await this.IdividualFeeChargedPerGamePlayedAffiliateNominationGST.fill(
      (
        await this.competitionDetails[scenario]['Charged Per Game Played Affiliate Nomination GST']
      ).toString(),
    );
    await this.individualFeeChargedPerGamePlayedAffiliateCompetitionGST.fill(
      (
        await this.competitionDetails[scenario]['Charged Per Game Played Affiliate Competition GST']
      ).toString(),
    );
    await this.nextButton.click();
    await this.nextButton.click();
    await this.registrationOpenDate.waitFor({ state: 'visible' });
    await this.registrationOpenDate.click();
    await this.registrationOpenDate.fill(
      this.competitionDetails[scenario]['Registration Open Date'].toString(),
    );
    await this.registrationOpenDate.press('Enter');
    await this.registrationCloseDate.click();
    await this.registrationCloseDate.fill(
      this.competitionDetails[scenario]['Registration Close Date'].toString(),
    );
    await this.registrationCloseDate.press('Enter');
    await this.membershipProduct.click();
    await this.membershipProductOption.click();
    await this.selectDivisionIndividual.click();
    await this.selectDivisionTeam.click();
    await this.openRegistrationsButton.click();
  }

  async verifyCompetitionIsPublished(assertionString: any, scenario: any) {
    await expect(this.page).toHaveURL(process.env.REACT_APP_URL_WEB_COMP_ADMIN + 'registrationFormList', {
      timeout: 50000,
    });
    await expect.soft(this.verifyCompetitionName).toHaveText(this.compName);

    await expect.soft(this.verifyCompetitionStatus).toHaveText(assertionString);
  }
}

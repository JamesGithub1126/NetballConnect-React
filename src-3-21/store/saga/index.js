import { all, fork, takeEvery, takeLatest } from 'redux-saga/effects';

import ApiConstants from 'themes/apiConstants';
import appSaga from './appSaga';
import authenticationSaga from './authenticationSaga';
import commonSaga from './commonSaga';
import strapiSaga from './strapiSaga';
import homeDashboardSaga from './homeDashboardSaga';
import stripeSaga from './stripeSaga';
import supportSaga from './supportSaga';
import userSaga from './userSaga';

import liveScoreSaga from './liveScoreSaga/liveScoreSaga';
import liveScoreBannerSaga from './liveScoreSaga/liveScoreBannerSaga';
import liveScoreCoachSaga from './liveScoreSaga/liveScoreCoachSaga';
import liveScoreCompetitionSaga from './liveScoreSaga/liveScoreCompetitionSaga';
import liveScoreDivisionSaga from './liveScoreSaga/liveScoreDivisionSaga';
import liveScoreGameAttendanceSaga from './liveScoreSaga/liveScoreGameAttendanceSaga';
import liveScoreManagerSaga from './liveScoreSaga/liveScoreManagerSaga';
import liveScoreMatchSaga from './liveScoreSaga/liveScoreMatchSaga';
import liveScorePlayerMinuteTrackingSaga from './liveScoreSaga/liveScorePlayerMinuteTrackingSaga';
import liveScorePlayerActionsSaga from './liveScoreSaga/liveScorePlayerActionsSaga';
import liveScorePlayerSaga from './liveScoreSaga/liveScorePlayerSaga';
import liveScoreTeamSaga from './liveScoreSaga/liveScoreTeamSaga';
import liveScoreUmpiresSaga from './liveScoreSaga/liveScoreUmpiresSaga';

import competitionFeeSaga from './registrationSaga/competitionFeeSaga';

import shopOrderStatusSaga from './shopSaga/shopOrderStatusSaga';
import shopOrderSummarySaga from './shopSaga/shopOrderSummarySaga';
import shopProductSaga from './shopSaga/shopProductSaga';
import shopSettingSaga from './shopSaga/shopSettingSaga';

import umpireDashboardSaga from './umpireSaga/umpireDashboardSaga';

import umpireSettingsSaga from './umpireSaga/umpireSettingsSaga';

import communicationListSaga from './communicationSaga/communicationSaga';

import {
  getRegistrationFormSaga,
  regMembershipFeeListSaga,
  regMembershipFeeListDeleteSaga,
  regGetMembershipProductDetailSaga,
  regSaveMembershipProductDetailSaga,
  regDefaultMembershipProductTypesSaga,
  regSaveMembershipProductFeeSaga,
  regSaveMembershipProductDiscountSaga,
  membershipProductDiscountTypeSaga,
  regSaveRegistrationForm,
  getMembershipproduct,
  getDivisionsListSaga,
  getTeamRegistrationsSaga,
  exportTeamRegistrationsSaga,
  getMembershipFeeCapListSaga,
  updateMembershipFeeCapSaga,
  addHardshipCodeSaga,
  getAffiliateMembershipSaga,
  saveStateRegistrationSettingSaga,
  getStateRegSettingsByOrganisationIdSaga,
  getMembershipTypeMappingsByOrganisationIdSaga,
  getOrganisationSettingsSaga,
  getRegistrationSettingLinkSaga,
  getExternalMembershipTypesSaga,
  getExternalRegistraionsSaga,
  exportExternalRegistraionsSaga,
  getCompetitionDataForMovingPlayerSaga,
  getAffiliateDataForMovingPlayerSaga,
  getDivisionDataForMovingPlayerSaga,
  playerMoveButtonClickedSaga,
  replicatePlayerGetCompetitionsSaga,
  replicatePlayerGetAffiliateListSaga,
  replicatePlayerGetDivisionListSaga,
  replicatePlayersSubmitSaga,
} from './registrationSaga/registrationSaga';

/// /**************************Live Score***************************Start
import {
  liveScoreLaddersDivisionsaga,
  liveScoreLaddersListSaga,
  ladderAdjustmentPostSaga,
  ladderAdjustmentGetSaga,
  liveScoreResetLadderSaga,
} from './liveScoreSaga/liveScoreLadderSaga';
import {
  liveScoreIncidentListSaga,
  liveScoreAddEditIncidentSaga,
  liveScoreIncidentTypeSaga,
  createPlayerSuspensionSaga,
  updatePlayerSuspensionSaga,
  createTribunalSaga,
  updateTribunalSaga,
  liveScoreGetSuspensionsDataSaga,
  liveScoreGetTribunalsDataSaga,
} from './liveScoreSaga/liveScoreIncidentSaga';
import {
  liveScoreRoundSaga,
  liveScoreRoundListSaga,
  liveScoreExcludedRoundListSaga,
} from './liveScoreSaga/liveScoreRoundSaga';
import {
  liveScoreNewsListSaga,
  liveScoreAddNewsSaga,
  liveScoreNewsNotificationSaga,
  liveScoreNewsDeleteSaga,
} from './liveScoreSaga/liveScoreNewsSaga';
import { liveScoreGoalSaga, liveScoreGoalByPlayerSaga } from './liveScoreSaga/liveScoreGoalSaga';
import {
  liveScoreScorerListSaga,
  liveScoreAssigneMatches,
  liveScoreChangeAssignStatus,
  liveScoreAddEditScorerSaga,
  liveScoreUnAssignMatcheSaga,
  liveScoreScorerSearchSaga,
} from './liveScoreSaga/liveScoreScorerSaga';
import {
  liveScoreBulkPushBack,
  liveScoreBulkBringForwardSaga,
  liveScoreMatchResult,
  liveScoreEndMatchesSaga,
  liveScoreDoubleHeaderSaga,
  liveScoreAbandonMatchSaga,
  liveScorePostponeMatchSaga,
} from './liveScoreSaga/liveScoreBulkMatchSaga';
import {
  liveScoreDashboardSaga,
  liveScoreSingleGameListSaga,
  liveScoreSingleGameRedeemPaySaga,
  liveScorePlayersToPayListSaga,
  liveScorePlayersToPayRetryPaymentSaga,
  liveScorePlayersToCashReceivedSaga,
} from './liveScoreSaga/liveScoreDashboardSaga';
import {
  liveScoreGamePositionSaga,
  liveScoreGameStatsSaga,
} from './liveScoreSaga/liveScoreGamePositionSaga';
import {
  liveScorePerMatchListSaga,
  liveScorePerMatchPaySaga,
} from './liveScoreSaga/liveScoreTeamPerMatchSaga';
import {
  liveScoreSuspensionListSaga,
  liveScoreSuspensionTypeListSaga,
  liveScoreSuspensionMatchesListSaga,
  liveScoreSuspensionUpdateMatchesSaga,
} from './liveScoreSaga/liveScoreSuspensionSaga';
/// /*******************Live Score********************************************End

/// /Competition Management

import {
  competitionModuleSaga,
  competitonGenerateDrawSaga,
} from './competitionManagementSaga/competitionModuleSaga';
import * as competitionFormatSaga from './competitionManagementSaga/competitionFormatSaga';
import * as competitionFinalSaga from './competitionManagementSaga/competitionFinalsSaga';
import * as ladderFormatSaga from './competitionManagementSaga/ladderFormatSaga';
import {
  competitonWithTimeSlots,
  competitonWithTimeSlotsPostApi,
  competitionTeamsGetSaga,
  //competitionTimeslotsGetSaga,
  //teamsTimeslotsPreferencesGetSaga,
  //teamsTimeslotsPreferencesSaveSaga,
} from './competitionManagementSaga/competitionTimeAndSlotSaga';
import competitionOrgRegistrationsSaga from './competitionManagementSaga/competitionOrgRegistrationsSaga';

import { fixtureTemplateSaga } from './competitionManagementSaga/competitionManagementSaga';
/// /Venue constraints
import { venueTimeSaga, venueConstraintPostSaga } from './competitionManagementSaga/venueTimeSaga';
import {
  getCompPartPlayerGradingSummarySaga,
  saveCompPartPlayerGradingSummarySaga,
  getCompPartPlayerGradingSaga,
  addNewTeamPartPlayerGradingSaga,
  dragTeamPartPlayerSaga,
  partPLayerCommentSaga,
  partPlayerSummaryCommentSaga,
  importCompetitionPlayer,
  importCompetitionTeams,
  deleteTeamSaga,
  playerChangeDivisionSaga,
  playerCommentList,
  playerGradingExport,
  getTeamForPlayerReplicationSaga,
  replicatePlayerSaga,
  deletePlayerSaga,
  getCompetitionForPlayerGradingSaga,
} from './competitionManagementSaga/competitionPartPlayerGradingSaga';

import * as regChangeSaga from './registrationSaga/registrationChangeSaga';
import * as regClearanceSaga from './registrationSaga/registrationClearanceSaga';

import {
  getCompOwnProposedTeamGradingSaga,
  saveOwnFinalTeamGradingDataSaga,
  getCompPartProposedTeamGradingSaga,
  savePartProposedTeamGradingDataSaga,
  getTeamGradingSummarySaga,
  getTeamGradingOrganisationsSaga,
  saveUpdatedGradeTeamSummarySaga,
  publishGradeTeamSummarySaga,
  getCompFinalGradesListSaga,
  proposedTeamGradingComment,
  partProposedTeamGradingComment,
  deleteTeamActionSaga,
  finalTeamsExportSaga,
  finalPlayersExportSaga,
  proposedTeamsExportSaga,
  proposedPlayersExportSaga,
  teamChangeDivisionSaga,
} from './competitionManagementSaga/competitionTeamGradingSaga';

/// /////competition draws
import {
  getCompetitionDrawsSaga,
  getDrawsRoundsSaga,
  updateCompetitionDraws,
  saveDrawsSaga,
  getCompetitionVenues,
  updateCourtTimingsDrawsAction,
  getDivisionGradeNameListSaga,
  publishDraws,
  drawsMatchesListExportSaga,
  getDivisionSaga,
  competitionFixtureSaga,
  updateCompetitionFixtures,
  updateDrawsLock,
  getActiveDrawsRoundsSaga,
  getVenueAndDivisionSaga,
} from './competitionManagementSaga/competitionDrawsSaga';

import {
  regDashboardListSaga,
  getCompetitionSaga,
  registrationMainDashboardListSaga,
  registrationFailedStatusUpdateSaga,
  registrationRetryPaymentSaga,
  registrationRequestFundsOfflineSaga,
  registrationMarkOfflineAsPaidSaga,
  exportGovernmentVouchersSaga,
} from './registrationSaga/registrationDashboardSaga';
/// /Competition Dashboard Saga
import {
  competitionDashboardSaga,
  updateCompetitionStatusSaga,
  competitionDashboardDeleteSaga,
  competitionDashboardArchiveSaga,
  saveReplicateSaga,
  getOldMembershipProductsByCompId,
  getNewMembershipProductsByYear,
  saveCompetitionDivisionSaga,
} from './competitionManagementSaga/competitionDashboardSaga';

// EndUserRegistrationSaga
import * as endUserRegSaga from './registrationSaga/endUserRegistrationSaga';

import { liveScoreGameTimeStatisticsSaga } from './liveScoreSaga/liveScoreGameTimeStatisticsSaga';
import {
  liveScoreSettingSaga,
  liveScorePostSaga,
  settingRegInviteesSaga,
} from './liveScoreSaga/liveScoreSettingSaga';

import { liveScoreTeamAttendanceListSaga } from './liveScoreSaga/liveScoreTeamAttendanceSaga';
import { liveScoreBestPlayerPointListSaga } from './liveScoreSaga/liveScoreBestPlayerPointSaga';

import {
  laddersSettingGetMatchResult,
  laddersSettingGetData,
  laddersSettingPostData,
} from './liveScoreSaga/liveScoreLadderSettingSaga';

import { liveScoreChangeVenueSaga } from './liveScoreSaga/liveScoreVenueChangeSaga';
import { getLiveScoreFixtureCompSaga } from './liveScoreSaga/liveScoreFixtureCompSaga';

import * as umpireCompSaga from './umpireSaga/umpireCompetitionSaga';
import * as umpireRosterSaga from './umpireSaga/umpireRosterSaga';
import * as umpireSaga from './umpireSaga/umpireSaga';
import * as assignUmpireSaga from './umpireSaga/assignUmpireSaga';
import * as competitionQuickSaga from './competitionManagementSaga/competitionQuickCompetitionSaga';
import * as liveScoreMatchSheetSaga from './liveScoreSaga/liveScoreMatchSheetSaga';

import { getInnerHorizontalCompSaga } from './liveScoreSaga/liveScoreInnerHorizontalSaga';

import { liveScorePositionTrackSaga } from './liveScoreSaga/liveScorePositionTrackSaga';
import rootCompetitionMultiDrawSaga from './competitionManagementSaga/competitionMultiDrawsSaga';
import umpirePaymentSaga from './umpireSaga/umpirePaymentSaga';
import umpirePoolAllocationSaga from './umpireSaga/umpirePoolAllocationSaga';

export default function* rootSaga() {
  yield all([
    fork(appSaga),
    fork(commonSaga),
    fork(authenticationSaga),
    fork(homeDashboardSaga),

    // LiveScore
    fork(liveScoreSaga),
    fork(liveScoreBannerSaga),
    fork(liveScoreCoachSaga),
    fork(liveScoreCompetitionSaga),
    fork(liveScoreDivisionSaga),
    fork(liveScoreManagerSaga),
    fork(liveScoreMatchSaga),
    fork(liveScorePlayerSaga),
    fork(liveScoreTeamSaga),
    fork(liveScoreUmpiresSaga),
    fork(liveScoreGameAttendanceSaga),
    fork(liveScorePlayerMinuteTrackingSaga),
    fork(liveScorePlayerActionsSaga),

    // Registration
    fork(competitionFeeSaga),

    // CompetitionOrg Registrations
    fork(competitionOrgRegistrationsSaga),

    // Shop
    fork(shopOrderSummarySaga),
    fork(shopProductSaga),
    fork(shopSettingSaga),
    fork(shopOrderStatusSaga),

    // Stripe
    fork(stripeSaga),

    // Support
    fork(supportSaga),

    // Umpire
    fork(umpireDashboardSaga),
    fork(umpireSettingsSaga),

    // User
    fork(userSaga),

    /// Multi draw in Competition
    fork(rootCompetitionMultiDrawSaga),

    // Umpire Payment Saga
    fork(umpirePaymentSaga),

    //Umpire Pool Allocation Saga
    fork(umpirePoolAllocationSaga),

    // Communication
    fork(communicationListSaga),

    // Strapi
    fork(strapiSaga),
  ]);

  yield takeEvery(ApiConstants.API_GET_PARENT_MEMBERSHIP_PRODUCT_LOAD, getAffiliateMembershipSaga);
  yield takeEvery(ApiConstants.API_REG_MEMBERSHIP_LIST_LOAD, regMembershipFeeListSaga);
  yield takeEvery(ApiConstants.API_REG_MEMBERSHIP_LIST_DELETE_LOAD, regMembershipFeeListDeleteSaga);
  yield takeEvery(
    ApiConstants.API_REG_GET_MEMBERSHIP_PRODUCT_LOAD,
    regGetMembershipProductDetailSaga,
  );
  yield takeEvery(
    ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT__LOAD,
    regSaveMembershipProductDetailSaga,
  );
  yield takeEvery(
    ApiConstants.API_REG_GET_DEFAULT_MEMBERSHIP_PRODUCT_TYPES__LOAD,
    regDefaultMembershipProductTypesSaga,
  );
  yield takeEvery(
    ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_FEES__LOAD,
    regSaveMembershipProductFeeSaga,
  );
  yield takeEvery(
    ApiConstants.API_REG_SAVE_MEMBERSHIP_PRODUCT_DISCOUNT__LOAD,
    regSaveMembershipProductDiscountSaga,
  );
  // yield takeEvery(
  //   ApiConstants.API_MEMBERSHIP_PRODUCT_DISCOUNT_TYPE__LOAD,
  //   membershipProductDiscountTypeSaga,
  // );
  yield takeEvery(
    ApiConstants.API_MEMBERSHIP_PRODUCT_DISCOUNT_TYPE__LOAD,
    membershipProductDiscountTypeSaga,
  );
  yield takeEvery(ApiConstants.API_REG_FORM_LOAD, regSaveRegistrationForm);
  yield takeEvery(ApiConstants.API_REG_FORM_MEMBERSHIP_PRODUCT_LOAD, getMembershipproduct);
  yield takeEvery(ApiConstants.API_GET_REG_FORM_LOAD, getRegistrationFormSaga);

  /// / ****************************Live Score Saga**************************************Start

  yield takeEvery(ApiConstants.API_LIVE_SCORE_LADDERS_DIVISION_LOAD, liveScoreLaddersDivisionsaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_LADDERS_LIST_LOAD, liveScoreLaddersListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_INCIDENT_LIST_LOAD, liveScoreIncidentListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_NEWS_LIST_LOAD, liveScoreNewsListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_CREATE_ROUND_LOAD, liveScoreRoundSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_BULK_PUSH_BACK_LOAD, liveScoreBulkPushBack);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_BULK_BRING_FORWARD_LOAD,
    liveScoreBulkBringForwardSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_BULK_END_MATCHES_LOAD, liveScoreEndMatchesSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GOAL_LIST_LOAD, liveScoreGoalSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GOAL_LIST_BY_PLAYER_LOAD, liveScoreGoalByPlayerSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_SCORER_LIST_LOAD, liveScoreScorerListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_NEWS_LOAD, liveScoreAddNewsSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_BULK_DOUBLE_HEADER_LOAD, liveScoreDoubleHeaderSaga);
  // yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_PLAYER_LOAD, liveScorePlayerSaga.liveScoreDeletePlayerSaga)
  yield takeEvery(ApiConstants.LiveScore_SETTING_VIEW_INITITAE, liveScoreSettingSaga);
  yield takeEvery(ApiConstants.LiveScore_SETTING_DATA_POST_INITATE, liveScorePostSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_LOAD,
    liveScoreGamePositionSaga,
  );

  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_LOAD, liveScoreGameStatsSaga);
  yield takeEvery(ApiConstants.API_SUSPENSION_LIST_LOAD, liveScoreSuspensionListSaga);
  yield takeEvery(ApiConstants.API_SUSPENSION_TYPE_LIST_LOAD, liveScoreSuspensionTypeListSaga);
  yield takeEvery(
    ApiConstants.API_SUSPENSION_MATCHES_LIST_LOAD,
    liveScoreSuspensionMatchesListSaga,
  );
  yield takeEvery(
    ApiConstants.API_SUSPENSION_UPDATE_SUSPENDED_MATCHES_LOAD,
    liveScoreSuspensionUpdateMatchesSaga,
  );

  // ****************************Live Score Saga**************************************End

  /* ************Competition Management Starts************ */
  yield takeEvery(ApiConstants.API_GET_YEAR_LOAD, competitionModuleSaga);

  /* Competition Format */
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_FORMAT_LOAD,
    competitionFormatSaga.getCompetitionFormatSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FORMAT_LOAD,
    competitionFormatSaga.saveCompetitionFormatSaga,
  );

  /* Competition Finals  */
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_FINALS_LOAD,
    competitionFinalSaga.getCompetitionFinalsSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_FINALS_LOAD,
    competitionFinalSaga.saveCompetitionFinalsSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_TEMPLATE_DOWNLOAD_LOAD,
    competitionFinalSaga.getDownloadTemplateSaga,
  );

  /* Ladder Format */
  yield takeEvery(ApiConstants.API_GET_LADDER_FORMAT_LOAD, ladderFormatSaga.getLadderFormatSaga);
  yield takeEvery(ApiConstants.API_SAVE_LADDER_FORMAT_LOAD, ladderFormatSaga.saveLadderFormatSaga);

  /* ************Competition Management Ends************ */

  /* ************Competition Management Ends************ */

  yield takeEvery(ApiConstants.API_GET_COMPETITION_WITH_TIME_SLOTS_LOAD, competitonWithTimeSlots);
  yield takeEvery(ApiConstants.API_COMPETITION_TEAMS_GET_LOAD, competitionTeamsGetSaga);
  //yield takeEvery(ApiConstants.API_COMPETITION_TIMESLOTS_GET_LOAD, competitionTimeslotsGetSaga);
  // yield takeEvery(
  //   ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_GET_LOAD,
  //   teamsTimeslotsPreferencesGetSaga,
  // );
  // yield takeEvery(
  //   ApiConstants.API_TEAM_TIMESLOTS_PREFERENCES_SAVE_LOAD,
  //   teamsTimeslotsPreferencesSaveSaga,
  // );

  /// /Venue Constraints
  yield takeEvery(ApiConstants.API_VENUE_CONSTRAINTS_LIST_LOAD, venueTimeSaga);

  /// /ownCompetition venue list

  /// part player grading
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_LOAD,
    getCompPartPlayerGradingSummarySaga,
  );

  /// /own team grading
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_OWN_PROPOSED_TEAM_GRADING_LIST_LOAD,
    getCompOwnProposedTeamGradingSaga,
  );
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_OWN_FINAL_TEAM_GRADING_LOAD,
    saveOwnFinalTeamGradingDataSaga,
  );

  /// /////get the divisions list on the basis of year and competition
  yield takeEvery(
    ApiConstants.API_GET_DIVISIONS_LIST_ON_YEAR_AND_COMPETITION_LOAD,
    getDivisionsListSaga,
  );

  /// /////get the grades reference data

  /// /competition part proposed team grading get api
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_PART_PROPOSED_TEAM_GRADING_LIST_LOAD,
    getCompPartProposedTeamGradingSaga,
  );

  /// /competition part proposed team grading get api
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_PART_PROPOSED_TEAM_GRADING_LOAD,
    savePartProposedTeamGradingDataSaga,
  );

  /** ******competition time slot post Api */
  yield takeEvery(ApiConstants.API_COMPETITION_TIMESLOT_POST_LOAD, competitonWithTimeSlotsPostApi);

  /// ////save the competition part player grade calculate player grading summary or say proposed player grading toggle
  yield takeEvery(
    ApiConstants.API_SAVE_COMPETITION_PART_PLAYER_GRADE_CALCULATE_SUMMARY_LIST_LOAD,
    saveCompPartPlayerGradingSummarySaga,
  );

  /// //////get the own team grading summary listing data
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_SUMMARY_LIST_LOAD,
    getTeamGradingSummarySaga,
  );

  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_OWN_TEAM_GRADING_ORGANISATIONS_LIST_LOAD,
    getTeamGradingOrganisationsSaga,
  );

  /// //////competition part player grading get API
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_PART_PLAYER_GRADING_LIST_LOAD,
    getCompPartPlayerGradingSaga,
  );

  /// /////competition Draws
  yield takeEvery(ApiConstants.API_GET_COMPETITION_DRAWS_LOAD, getCompetitionDrawsSaga);

  /// /////competition Draws rounds
  yield takeEvery(ApiConstants.API_GET_COMPETITION_DRAWS_ROUNDS_LOAD, getDrawsRoundsSaga);

  /// /venueConstraintPostSaga
  yield takeEvery(ApiConstants.API_VENUE_CONSTRAINT_POST_LOAD, venueConstraintPostSaga);

  /// /////save the changed grade name in own competition team grading summary data
  yield takeEvery(
    ApiConstants.API_SAVE_UPDATED_GRADE_NAME_TEAM_GRADING_SUMMARY_LOAD,
    saveUpdatedGradeTeamSummarySaga,
  );

  /// /////save the changed grade name in own competition team grading summary data
  yield takeEvery(ApiConstants.API_PUBLISH_TEAM_GRADING_SUMMARY_LOAD, publishGradeTeamSummarySaga);

  /// /Competition Dashboard Saga
  yield takeEvery(ApiConstants.API_COMPETITION_DASHBOARD_LOAD, competitionDashboardSaga);

  /// /////competition Draws update
  yield takeEvery(ApiConstants.API_UPDATE_COMPETITION_DRAWS_LOAD, updateCompetitionDraws);

  /// /// Save Draws
  yield takeEvery(ApiConstants.API_UPDATE_COMPETITION_SAVE_DRAWS_LOAD, saveDrawsSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_DASHBOARD_LOAD, liveScoreDashboardSaga);

  /// // Get Competition Venue
  yield takeEvery(ApiConstants.API_GET_COMPETITION_VENUES_LOAD, getCompetitionVenues);
  /// ///////////get the competition final grades on the basis of competition and division
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_FINAL_GRADES_LIST_LOAD,
    getCompFinalGradesListSaga,
  );

  /// //////////////update draws court timing where N/A(null) is there
  yield takeEvery(
    ApiConstants.API_UPDATE_COMPETITION_DRAWS_COURT_TIMINGS_LOAD,
    updateCourtTimingsDrawsAction,
  );

  // EndUserRegistrationSave
  yield takeEvery(
    ApiConstants.API_SAVE_END_USER_REGISTRATION_LOAD,
    endUserRegSaga.endUserRegistrationSaveSaga,
  );
  // get notification liveScoreNewsNotificationSaga
  yield takeEvery(ApiConstants.API_LIVESCORE_NEWS_NOTIFICATION_LOAD, liveScoreNewsNotificationSaga);

  // delete news

  yield takeEvery(ApiConstants.API_LIVE_SCORE_DELETE_NEWS_LOAD, liveScoreNewsDeleteSaga);

  // liveScoreGameTimeStatisticsSaga
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_GAME_TIME_STATISTICS_LIST_LOAD,
    liveScoreGameTimeStatisticsSaga,
  );
  // EndUserRegistration Registration Settings
  yield takeEvery(
    ApiConstants.API_ORG_REGISTRATION_REG_SETTINGS_LOAD,
    endUserRegSaga.orgRegistrationRegistrationSettings,
  );

  // EndUserRegistration Membership Products
  yield takeEvery(
    ApiConstants.API_MEMBERSHIP_PRODUCT_END_USER_REG_LOAD,
    endUserRegSaga.endUserRegistrationMembershipProducts,
  );

  yield takeEvery(ApiConstants.API_ADD_NEW_TEAM_LOAD, addNewTeamPartPlayerGradingSaga);

  yield takeEvery(ApiConstants.API_DRAG_NEW_TEAM_LOAD, dragTeamPartPlayerSaga);

  yield takeEvery(ApiConstants.API_MATCH_RESULT_LOAD, liveScoreMatchResult);

  /// / Bulk Abandon Match Saga
  yield takeEvery(ApiConstants.API_LIVE_SCORE_BULK_ABANDON_MATCH_LOAD, liveScoreAbandonMatchSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_BULK_POSTPONE_MATCH_LOAD, liveScorePostponeMatchSaga);

  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_TEAM_ATTENDANCE_LIST_LOAD,
    liveScoreTeamAttendanceListSaga,
  );

  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_BEST_PLAYER_POINT_LIST_LOAD,
    liveScoreBestPlayerPointListSaga,
  );

  yield takeEvery(ApiConstants.API_GENERATE_DRAW_LOAD, competitonGenerateDrawSaga);

  /// Assigne Matches

  yield takeEvery(ApiConstants.API_LIVESCORE_ASSIGN_MATCHES_LOAD, liveScoreAssigneMatches);

  yield takeEvery(
    ApiConstants.API_LIVESCORE_ASSIGN_CHANGE_STATUS_LOAD,
    liveScoreChangeAssignStatus,
  );

  yield takeEvery(ApiConstants.API_LIVESCORE_UNASSIGN_STATUS_LOAD, liveScoreUnAssignMatcheSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_SCORER_LOAD, liveScoreAddEditScorerSaga);

  /// / Round List Saga
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ROUND_LIST_LOAD, liveScoreRoundListSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_EXCLUDED_ROUND_LIST_LOAD,
    liveScoreExcludedRoundListSaga,
  );

  // player grading comment
  yield takeEvery(ApiConstants.API_PLAYER_GRADING_COMMENT_LOAD, partPLayerCommentSaga);
  // player grading summary comment
  yield takeEvery(
    ApiConstants.API_PLAYER_GRADING_SUMMARY_COMMENT_LOAD,
    partPlayerSummaryCommentSaga,
  );

  yield takeEvery(ApiConstants.API_TEAM_GRADING_COMMENT_LOAD, proposedTeamGradingComment);

  // part proposed team grading comment
  yield takeEvery(ApiConstants.API_PART_TEAM_GRADING_COMMENT_LOAD, partProposedTeamGradingComment);

  yield takeEvery(ApiConstants.API_REG_DASHBOARD_LIST_LOAD, regDashboardListSaga);

  // Search Scorer saga
  yield takeEvery(ApiConstants.API_LIVESCORE_SCORER_SEARCH_LOAD, liveScoreScorerSearchSaga);
  /// / Ladder Setting Saga
  yield takeEvery(ApiConstants.API_LADDER_SETTING_MATCH_RESULT_LOAD, laddersSettingGetMatchResult);
  yield takeEvery(ApiConstants.API_LADDER_SETTING_GET_DATA_LOAD, laddersSettingGetData);
  yield takeEvery(ApiConstants.API_LADDER_SETTING_POST_DATA_LOAD, laddersSettingPostData);
  yield takeEvery(ApiConstants.API_COMPETITION_PLAYER_IMPORT_LOAD, importCompetitionPlayer);
  yield takeEvery(ApiConstants.API_COMPETITION_TEAMS_IMPORT_LOAD, importCompetitionTeams);
  yield takeEvery(ApiConstants.API_SAVE_VENUE_CHANGE_LOAD, liveScoreChangeVenueSaga);
  // EndUserRegistrationDashboard List
  yield takeEvery(
    ApiConstants.API_USER_REG_DASHBOARD_LIST_LOAD,
    endUserRegSaga.endUserRegDashboardListSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_GET_FIXTURE_COMP_LOAD, getLiveScoreFixtureCompSaga);
  /// ///////////////draws division grade names list
  yield takeEvery(
    ApiConstants.API_DRAWS_DIVISION_GRADE_NAME_LIST_LOAD,
    getDivisionGradeNameListSaga,
  );
  yield takeEvery(ApiConstants.API_DRAW_PUBLISH_LOAD, publishDraws);
  // part proposed team grading comment
  yield takeEvery(ApiConstants.API_COMPETITION_TEAM_DELETE_LOAD, deleteTeamSaga);
  // part proposed team grading comment
  yield takeEvery(ApiConstants.API_COMPETITION_TEAM_DELETE_ACTION_LOAD, deleteTeamActionSaga);
  // Draws Matches List Export
  yield takeEvery(ApiConstants.API_DRAW_MATCHES_LIST_LOAD, drawsMatchesListExportSaga);
  // Final Teams Export
  yield takeEvery(ApiConstants.API_EXPORT_FINAL_TEAMS_LOAD, finalTeamsExportSaga);
  yield takeEvery(ApiConstants.API_EXPORT_FINAL_PLAYERS_LOAD, finalPlayersExportSaga);
  yield takeEvery(ApiConstants.API_EXPORT_PROPOSED_TEAMS_LOAD, proposedTeamsExportSaga);
  yield takeEvery(ApiConstants.API_EXPORT_PROPOSED_PLAYERS_LOAD, proposedPlayersExportSaga);
  // fixtureSaga get division grade api
  yield takeEvery(ApiConstants.API_GET_DIVISION_LOAD, getDivisionSaga);
  yield takeEvery(ApiConstants.API_GET_FIXTURE_LOAD, competitionFixtureSaga);
  yield takeEvery(ApiConstants.API_UPDATE_COMPETITION_FIXTURE_LOAD, updateCompetitionFixtures);
  // Team Change division
  yield takeEvery(ApiConstants.API_CHANGE_COMPETITION_DIVISION_TEAM_LOAD, teamChangeDivisionSaga);
  // Player Change division
  yield takeEvery(
    ApiConstants.API_CHANGE_COMPETITION_DIVISION_PLAYER_LOAD,
    playerChangeDivisionSaga,
  );
  yield takeEvery(ApiConstants.API_UPDATE_DRAWS_LOCK_LOAD, updateDrawsLock);
  // invite send in registration Form
  yield takeEvery(ApiConstants.API_GET_COMMENT_LIST_LOAD, playerCommentList);

  /// / Umpire Module
  yield takeEvery(ApiConstants.API_UMPIRE_LIST_LOAD, umpireSaga.umpireListSaga);
  yield takeEvery(ApiConstants.API_NEW_UMPIRE_LIST_LOAD, umpireSaga.newUmpireListSaga);
  yield takeEvery(
    ApiConstants.API_AVAILABLE_UMPIRECOACH_LIST_LOAD,
    umpireSaga.availableUmpireCoachListSaga,
  );
  yield takeLatest(ApiConstants.API_UMPIRE_COMPETITION_LIST_LOAD, umpireCompSaga.getUmpireCompSaga);
  yield takeLatest(
    ApiConstants.API_UMPIRE_COMPETITION_Data_LOAD,
    umpireCompSaga.getUmpireCompDetailSaga,
  );
  yield takeEvery(ApiConstants.API_GET_UMPIRE_AFFILIATE_LIST_LOAD, umpireSaga.getAffiliateSaga);
  yield takeEvery(ApiConstants.GET_UMPIRE_TEAMS_LOAD, umpireSaga.getUmpireTeamsSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_SEARCH_LOAD, umpireSaga.umpireSearchSaga);
  yield takeEvery(ApiConstants.API_ADD_UMPIRE_LOAD, umpireSaga.addEditUmpireSaga);
  yield takeEvery(ApiConstants.SETTING_REGISTRATION_INVITEES_LOAD, settingRegInviteesSaga);
  yield takeEvery(ApiConstants.API_GET_ALL_COMPETITION_LOAD, getCompetitionSaga);
  yield takeEvery(ApiConstants.API_FIXTURE_TEMPLATE_ROUNDS_LOAD, fixtureTemplateSaga);
  yield takeEvery(ApiConstants.API_UMPIRE_ROSTER_LIST_LOAD, umpireRosterSaga.umpireRosterListSaga);
  yield takeEvery(
    ApiConstants.API_UMPIRE_SIMPLE_ROUND_LIST_LOAD,
    umpireRosterSaga.umpireSimpleRoundListSaga,
  );
  yield takeEvery(
    ApiConstants.API_UMPIRE_ROSTER_ACTION_CLICK_LOAD,
    umpireRosterSaga.umpireActionPerofomSaga,
  );
  yield takeEvery(ApiConstants.API_GET_RANKED_UMPIRES_COUNT, umpireSaga.getRankedUmpiresCount);
  yield takeEvery(
    ApiConstants.API_GET_UMPIRES_ACTIVITY_LIST_LOAD,
    umpireSaga.getUmpiresActivityList,
  );
  yield takeEvery(
    ApiConstants.API_GET_UMPIRE_COMPETITION_ORGANISATIONS_LIST_LOAD,
    umpireSaga.umpireListCompetitionOrganisationSaga,
  );
  /// /// update umpire rank
  yield takeEvery(ApiConstants.API_UPDATE_UMPIRE_RANK, umpireSaga.updateUmpireRank);
  // new umpire list
  yield takeEvery(ApiConstants.API_GET_UMPIRE_LIST_LOAD, umpireSaga.umpireListGetSaga);

  /// ///assign umpire get list
  yield takeEvery(
    ApiConstants.API_GET_ASSIGN_UMPIRE_LIST_LOAD,
    assignUmpireSaga.getAssignUmpireListSaga,
  );

  //export Umpire List Saga
  yield takeEvery(ApiConstants.API_EXPORT_UMPIRE_LIST_LOAD, umpireSaga.exportUmpireListSaga);
  /// ///assign umpire get list
  yield takeEvery(ApiConstants.API_ASSIGN_UMPIRE_FROM_LIST_LOAD, assignUmpireSaga.assignUmpireSaga);
  /// //unassign umpire from the match(delete)
  yield takeEvery(
    ApiConstants.API_UNASSIGN_UMPIRE_FROM_LIST_LOAD,
    assignUmpireSaga.unassignUmpireSaga,
  );
  /// ///////////////////registration main dashboard listing owned and participate registration
  yield takeEvery(
    ApiConstants.API_GET_REGISTRATION_MAIN_DASHBOARD_LISTING_LOAD,
    registrationMainDashboardListSaga,
  );
  yield takeEvery(
    ApiConstants.API_YEAR_AND_QUICK_COMPETITION_LOAD,
    competitionQuickSaga.getquickYearAndCompetitionListSaga,
  );
  /// /////////////post/save quick competition division
  yield takeEvery(
    ApiConstants.API_SAVE_QUICK_COMPETITION_DIVISION_LOAD,
    competitionQuickSaga.saveQuickCompDivisionSaga,
  );
  /// create quick competition
  yield takeEvery(
    ApiConstants.API_CREATE_QUICK_COMPETITION_LOAD,
    competitionQuickSaga.createQuickCompetitionSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_QUICK_COMPETITION_LOAD,
    competitionQuickSaga.getQuickComptitionSaga,
  );
  // quick competition time slot
  yield takeEvery(
    ApiConstants.API_QUICK_COMPETITION_TIMESLOT_POST_LOAD,
    competitionQuickSaga.quickcompetitoTimeSlotsPostApi,
  );
  /// ///update quick competition
  yield takeEvery(
    ApiConstants.API_UPDATE_QUICK_COMPETITION_LOAD,
    competitionQuickSaga.updateQuickCompetitionSaga,
  );
  yield takeEvery(
    ApiConstants.API_EXPORT_QUICK_COMPETITION_LOAD,
    competitionQuickSaga.exportQuickCompetitionSaga,
  );
  yield takeEvery(
    ApiConstants.API_QUICK_COMPETITION_GENERATE_FIXTURE_LOAD,
    competitionQuickSaga.quickCompetitionGenerateFixtureSaga,
  );
  yield takeEvery(
    ApiConstants.API_QUICK_COMPETITION_ADD_TEAM_LOAD,
    competitionQuickSaga.quickCompetitionAddTeamSaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_ADD_EDIT_INCIDENT_LOAD, liveScoreAddEditIncidentSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_INCIDENT_TYPE_LOAD, liveScoreIncidentTypeSaga);
  yield takeEvery(
    ApiConstants.QUICKCOMP_IMPORT_DATA_LOAD,
    competitionQuickSaga.quickCompetitionPlayer,
  );

  yield takeEvery(ApiConstants.API_CREATE_PLAYER_SUSPENSION, createPlayerSuspensionSaga);
  yield takeEvery(ApiConstants.API_UPDATE_PLAYER_SUSPENSION, updatePlayerSuspensionSaga);

  yield takeEvery(ApiConstants.API_CREATE_TRIBUNAL, createTribunalSaga);
  yield takeEvery(ApiConstants.API_UPDATE_TRIBUNAL, updateTribunalSaga);

  // Get match sheet upload
  yield takeEvery(
    ApiConstants.API_MATCH_SHEET_PRINT_LOAD,
    liveScoreMatchSheetSaga.liveScoreMatchSheetPrintSaga,
  );

  yield takeEvery(
    ApiConstants.API_BLANK_MATCH_SHEET_PRINT_LOAD,
    liveScoreMatchSheetSaga.liveScoreBlankMatchSheetPrintSaga,
  );

  // Get match sheet download
  yield takeEvery(
    ApiConstants.API_MATCH_SHEET_DOWNLOADS_LOAD,
    liveScoreMatchSheetSaga.liveScoreMatchSheetDownloadSaga,
  );

  yield takeEvery(ApiConstants.API_LADDER_ADJUSTMENT_POST_LOAD, ladderAdjustmentPostSaga);
  yield takeEvery(ApiConstants.API_LADDER_ADJUSTMENT_GET_LOAD, ladderAdjustmentGetSaga);

  // Organisation charity update API

  // Organisation terms and conditions update API
  yield takeEvery(ApiConstants.API_COMPETITION_STATUS_UPDATE_LOAD, updateCompetitionStatusSaga);

  // Competition Active Draws rounds
  yield takeEvery(ApiConstants.API_GET_DRAWS_ACTIVE_ROUNDS_LOAD, getActiveDrawsRoundsSaga);

  // Check venue address duplication
  // yield takeEvery(ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_LOAD, checkVenueAddressDuplicationSaga);

  yield takeEvery(
    ApiConstants.API_INNER_HORIZONTAL_COMPETITION_LIST_LOAD,
    getInnerHorizontalCompSaga,
  );

  // Add quick competition venue
  yield takeEvery(
    ApiConstants.API_QUICK_COMPETITION_ADD_VENUE_LOAD,
    competitionQuickSaga.quickCompetitionAddVenueSaga,
  );

  yield takeEvery(ApiConstants.API_LIVE_SCORE_POSITION_TRACKING_LOAD, liveScorePositionTrackSaga);

  yield takeEvery(
    ApiConstants.API_GET_MERGE_COMPETITION_LOAD,
    competitionQuickSaga.getMergeCompetitionSaga,
  );

  yield takeEvery(
    ApiConstants.API_VALIDATE_MERGE_COMPETITION_LOAD,
    competitionQuickSaga.validateMergeCompetitionSaga,
  );

  yield takeEvery(
    ApiConstants.API_MERGE_COMPETITION_PROCESS_LOAD,
    competitionQuickSaga.mergeCompetitionProceedSaga,
  );
  /// /Competition Delete
  yield takeEvery(ApiConstants.API_SAVE_COMPETITION_DIVISIONS_LOAD, saveCompetitionDivisionSaga);
  yield takeEvery(
    ApiConstants.API_COMPETITION_DASHBOARD_DELETE_LOAD,
    competitionDashboardDeleteSaga,
  );
  yield takeEvery(
    ApiConstants.API_COMPETITION_DASHBOARD_ARCHIVE_LOAD,
    competitionDashboardArchiveSaga,
  );

  yield takeEvery(ApiConstants.API_GET_TEAM_REGISTRATIONS_DATA_LOAD, getTeamRegistrationsSaga);

  yield takeEvery(
    ApiConstants.API_CHANGE_DATE_RANGE_GET_VENUE_DIVISIONS_LOAD,
    getVenueAndDivisionSaga,
  );

  yield takeEvery(ApiConstants.API_LIVE_SCORE_RESET_LADDER_LOAD, liveScoreResetLadderSaga);

  yield takeEvery(
    ApiConstants.API_EXPORT_TEAM_REGISTRATIONS_DATA_LOAD,
    exportTeamRegistrationsSaga,
  );

  // Get All Competitions
  yield takeEvery(
    ApiConstants.API_GET_REG_COMPETITIONS_LOAD,
    regClearanceSaga.registrationCompetitionsSaga,
  );

  // Get Registration Clearance
  yield takeEvery(
    ApiConstants.API_GET_REG_CLEARANCE_LOAD,
    regClearanceSaga.getRegistrationClearanceSaga,
  );

  // Get Registration Clearance
  yield takeEvery(
    ApiConstants.API_REG_CLEARANCE_EXPORT_LOAD,
    regClearanceSaga.exportRegistrationClearanceSaga,
  );

  // Get Registration Clearance
  yield takeEvery(
    ApiConstants.API_CLEARANCE_GET_PAST_REG_LOAD,
    regClearanceSaga.getPastRegForClearanceSaga,
  );

  // Get Registration Clearance
  yield takeEvery(
    ApiConstants.API_CLEARANCE_CHANGE_APPROVER_LOAD,
    regClearanceSaga.changeClearanceApproverSaga,
  );

  // Approve Registration Clearance
  yield takeEvery(
    ApiConstants.API_REG_CLEARANCE_APPROVE_LOAD,
    regClearanceSaga.approveRegistrationClearanceSaga,
  );

  // Update Registration Clearance
  yield takeEvery(
    ApiConstants.API_REG_CLEARANCE_SAVE_LOAD,
    regClearanceSaga.saveRegistrationClearanceSaga,
  );

  // Save DeRegister
  yield takeEvery(ApiConstants.API_SAVE_DE_REGISTRATION_LOAD, regChangeSaga.saveDeRegisterSaga);

  // Get Registration Change Dashboard
  yield takeEvery(
    ApiConstants.API_GET_REGISTRATION_CHANGE_DASHBOARD_LOAD,
    regChangeSaga.getRegistrationChangeDashboardSaga,
  );

  // Export Registration Change
  yield takeEvery(
    ApiConstants.API_EXPORT_REGISTRATION_CHANGE_LOAD,
    regChangeSaga.exportRegistrationChangeSaga,
  );

  // Get Registration Change Dashboard
  yield takeEvery(
    ApiConstants.API_GET_REGISTRATION_CHANGE_REVIEW_LOAD,
    regChangeSaga.getRegistrationChangeReviewSaga,
  );

  // Save Registration Change Dashboard
  yield takeEvery(
    ApiConstants.API_SAVE_REGISTRATION_CHANGE_REVIEW_LOAD,
    regChangeSaga.saveRegistrationChangeReviewSaga,
  );
  yield takeEvery(
    ApiConstants.API_REGISTRATION_CHANGE_REFUNDED_OFFLINE_LOAD,
    regChangeSaga.saveRefundedOfflineSaga,
  );

  yield takeEvery(ApiConstants.API_UMPIRE_MAIN_LIST_LOAD, umpireSaga.umpireListDataSaga);

  yield takeEvery(
    ApiConstants.API_GET_TRANSFER_COMPETITIONS_LOAD,
    regChangeSaga.getTransferOrganisationsSaga,
  );

  yield takeEvery(ApiConstants.API_GET_MOVE_COMP_DATA_LOAD, regChangeSaga.getMoveCompDataSaga);

  yield takeEvery(ApiConstants.API_MOVE_COMPETITION_LOAD, regChangeSaga.moveCompetitionSaga);

  // replicate save service
  yield takeEvery(ApiConstants.API_REPLICATE_SAVE_LOAD, saveReplicateSaga);

  yield takeEvery(
    ApiConstants.API_OLD_MEMBERSHIP_PRODUCTS_BY_COMP_ID_LOAD,
    getOldMembershipProductsByCompId,
  );
  yield takeEvery(
    ApiConstants.API_NEW_MEMBERSHIP_PRODUCTS_BY_YEAR_LOAD,
    getNewMembershipProductsByYear,
  );

  yield takeEvery(
    ApiConstants.API_REG_TRANSACTION_UPDATE_LOAD,
    endUserRegSaga.updateRegTransactionSaga,
  );
  yield takeEvery(
    ApiConstants.API_UPDATE_STATUS_TIMESLOT_LOAD,
    competitionQuickSaga.UpdateGrid_TimeSlotSaga,
  );
  yield takeEvery(
    ApiConstants.API_UPDATE_STATUS_DIVISION_LOAD,
    competitionQuickSaga.updateGrid_DivisionSaga,
  );
  yield takeEvery(
    ApiConstants.API_UPDATE_STATUS_VENUE_LOAD,
    competitionQuickSaga.updateGrid_VenueSaga,
  );
  yield takeEvery(ApiConstants.API_EXPORT_PLAYER_GRADES_LOAD, playerGradingExport);
  yield takeEvery(
    ApiConstants.API_GET_EXPORT_REGISTRATION_LOAD,
    endUserRegSaga.exportRegistrationSaga,
  );

  yield takeEvery(ApiConstants.API_GET_MEMBERSHIP_FEE_CAP_LIST_LOAD, getMembershipFeeCapListSaga);
  yield takeEvery(ApiConstants.API_UPDATE_MEMBERSHIP_FEE_CAP_LOAD, updateMembershipFeeCapSaga);

  yield takeEvery(ApiConstants.API_LIVE_SCORE_SINGLE_GAME_LIST_LOAD, liveScoreSingleGameListSaga);
  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_SINGLE_GAME_REDEEM_PAY_LOAD,
    liveScoreSingleGameRedeemPaySaga,
  );
  yield takeEvery(ApiConstants.API_LIVE_SCORE_PER_MATCH_LIST_LOAD, liveScorePerMatchListSaga);
  yield takeEvery(ApiConstants.API_LIVE_SCORE_PER_MATCH_PAY_LOAD, liveScorePerMatchPaySaga);

  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_LIST_LOAD,
    liveScorePlayersToPayListSaga,
  );

  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_RETRY_PAYMENT_LOAD,
    liveScorePlayersToPayRetryPaymentSaga,
  );

  yield takeEvery(
    ApiConstants.API_LIVE_SCORE_PLAYERS_TO_PAY_CASH_RECEIVED_LOAD,
    liveScorePlayersToCashReceivedSaga,
  );

  yield takeEvery(
    ApiConstants.API_REGISTRATION_FAILED_STATUS_UPDATE_LOAD,
    registrationFailedStatusUpdateSaga,
  );
  yield takeEvery(
    ApiConstants.API_REGISTRATION_REQUEST_FUNDS_OFFLINE_LOAD,
    registrationRequestFundsOfflineSaga,
  );
  yield takeEvery(
    ApiConstants.API_REGISTRATION_MARK_OFFLINE_AS_PAID_LOAD,
    registrationMarkOfflineAsPaidSaga,
  );

  yield takeEvery(ApiConstants.API_REGISTRATION_RETRY_PAYMENT_LOAD, registrationRetryPaymentSaga);

  //Get DeRegister
  yield takeEvery(ApiConstants.API_GET_DE_REGISTRATION_LOAD, regChangeSaga.getDeRegisterSaga);

  yield takeEvery(ApiConstants.ADD_HARDSHIP_CODE_LOAD, addHardshipCodeSaga);
  yield takeEvery(
    ApiConstants.API_SAVE_STATE_REGISTRATION_SETTING_LOAD_LOAD,
    saveStateRegistrationSettingSaga,
  );
  yield takeEvery(
    ApiConstants.API_STATE_REGISTRATION_SETTING_BY_ORGANISATION_LOAD,
    getStateRegSettingsByOrganisationIdSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_MEMBERSHIPTYPEMAPPING_BY_ORGANISATION_LOAD,
    getMembershipTypeMappingsByOrganisationIdSaga,
  );
  yield takeEvery(ApiConstants.API_ORGANISATION_SETTINGS_LOAD, getOrganisationSettingsSaga);
  yield takeEvery(
    ApiConstants.LIVE_SCORE_GET_SUSPENSIONS_LIST_LOAD,
    liveScoreGetSuspensionsDataSaga,
  );
  yield takeEvery(ApiConstants.LIVE_SCORE_GET_TRIBUNALS_LIST_LOAD, liveScoreGetTribunalsDataSaga);

  yield takeEvery(
    ApiConstants.API_GET_TEAMS_FOR_PLAYER_REPLICATION_LOAD,
    getTeamForPlayerReplicationSaga,
  );

  yield takeEvery(ApiConstants.API_REPLICATE_PLAYER_LOAD, replicatePlayerSaga);

  yield takeEvery(ApiConstants.API_DELETE_PLAYER_LOAD, deletePlayerSaga);

  yield takeEvery(
    ApiConstants.API_GET_COMP_FOR_PLAYER_GRADING_LOAD,
    getCompetitionForPlayerGradingSaga,
  );
  yield takeEvery(ApiConstants.API_REG_SETTING_LINK_LOAD, getRegistrationSettingLinkSaga);
  yield takeEvery(
    ApiConstants.API_REGISTRATION_DASHBOARD_EXPORT_VOUCHER_LOAD,
    exportGovernmentVouchersSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_EXTERNAL_MEMBERSHIP_TYPES_LOAD,
    getExternalMembershipTypesSaga,
  );
  yield takeEvery(ApiConstants.API_GET_EXTERNAL_REGISTRATIONS_LOAD, getExternalRegistraionsSaga);
  yield takeEvery(
    ApiConstants.API_EXPORT_EXTERNAL_REGISTRATIONS_LOAD,
    exportExternalRegistraionsSaga,
  );
  yield takeEvery(
    ApiConstants.API_GET_COMPETITION_LIST_LOAD,
    getCompetitionDataForMovingPlayerSaga,
  );
  yield takeEvery(ApiConstants.API_GET_AFFILIATE_LIST_LOAD, getAffiliateDataForMovingPlayerSaga);
  yield takeEvery(ApiConstants.API_MOVE_PLAYER_LOAD, playerMoveButtonClickedSaga);
  yield takeEvery(
    ApiConstants.API_GET_AFFILIATE_DIVISION_LIST_LOAD,
    getDivisionDataForMovingPlayerSaga,
  );

  yield takeEvery(
    ApiConstants.API_REPLICATE_PLAYER_GET_COMPETITION_LIST_LOAD,
    replicatePlayerGetCompetitionsSaga,
  );
  yield takeEvery(
    ApiConstants.API_REPLICATE_PLAYER_GET_AFFILIATE_LIST_LOAD,
    replicatePlayerGetAffiliateListSaga,
  );
  yield takeEvery(
    ApiConstants.API_REPLICATE_PLAYER_SUBMIT_LOAD,
    replicatePlayersSubmitSaga,
  );
  yield takeEvery(
    ApiConstants.API_REPLICATE_PLAYER_GET_DIVISION_LIST_LOAD,
    replicatePlayerGetDivisionListSaga,
  );
}

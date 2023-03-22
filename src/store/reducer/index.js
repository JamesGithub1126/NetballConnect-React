import { combineReducers } from 'redux';

import LoginState from './authenticationReducer';
import MenuNavigationState from './menuNavigationReducer';
import RegistrationState from './registrationReducer/registrationReducer';
import AppState from './appReducer';

/// /*****************Live Score**************************Start////
import LiveScorePlayerState from './liveScoreReducer/liveScorePlayerReducer';
import LiveScoreMatchState from './liveScoreReducer/liveScoreMatchReducer';
import LiveScoreMatchLogState from './liveScoreReducer/liveScoreMatchLogReducer';
import LiveScoreLadderState from './liveScoreReducer/liveScoreLadderReducer';
import LiveScoreState from './liveScoreReducer/liveScoreReducer';
import LiveScoreTeamState from './liveScoreReducer/liveScoreTeamReducer';
import LiveScoreIncidentState from './liveScoreReducer/liveScoreIncidentReducer';
import LiveScoreSuspensionState from './liveScoreReducer/liveScoreSuspensionReducer';
import LiveScoreNewsState from './liveScoreReducer/liveScoreNewsReducer';
import LiveScoreBannerState from './liveScoreReducer/liveScoreBannerReducer';
import LiveScoreRoundState from './liveScoreReducer/liveScoreRoundReducer';
import CompetitionFeesState from './registrationReducer/competitionFeeReducer';
import LiveScoreGoalState from './liveScoreReducer/liveScoreGoalReducer';
import LiveScoreBulkMatchState from './liveScoreReducer/liveScoreBulkMatchReducer';
import LiveScoreManagerState from './liveScoreReducer/liveScoreManagerReducer';
import LiveScoreScorerState from './liveScoreReducer/liveScoreScorerReducer';
import LiveScoreDashboardState from './liveScoreReducer/liveScoreDashboardReducer';
import liveScoreGamePositionState from './liveScoreReducer/liveScoreGamePositionReducer';
import liveScoreGameAttendanceState from './liveScoreReducer/liveScoreGameAttendanceReducer';
/// /*****************Live Score**************************End////

import CompetitionDashboardState from './competitionManagementReducer/competitionDashboard';
import CompetitionModuleState from './competitionManagementReducer/competitionModuleReducer';
import liveScoreCompetition from './liveScoreReducer/liveScoreCompetitionReducer';
import CompetitionManagementState from './competitionManagementReducer/competitionManagement';
import CompetitionOrgRegistrationsState from './competitionManagementReducer/competitionOrgRegistrationsReducer';
/// /Year and Competition
import CompetitionFormatState from './competitionManagementReducer/competitionFormatReducer';
import CompetitionFinalsState from './competitionManagementReducer/competitionFinalsReducer';
import LadderFormatState from './competitionManagementReducer/ladderFormatReducer';
import CompetitionTimeSlots from './competitionManagementReducer/competitionTimeAndSlotsReducer';
import CommonReducerState from './commonReducer/commonReducer';
import StrapiReducerState from './strapiReducer/strapiReducer';
import VenueTimeState from './competitionManagementReducer/venueTimeReducer';
import CompetitionPartPlayerGradingState from './competitionManagementReducer/competitionPartPlayerGradingReducer';
import CompetitionGradesPoolReducer from './competitionManagementReducer/competitionGradesPoolNamesReducer';
import CompetitionOwnTeamGradingState from './competitionManagementReducer/competitionTeamGradingReducer';
import CompetitionDrawsState from './competitionManagementReducer/competitionDrawsReducer';
import EndUserRegistrationState from './registrationReducer/endUserRegistrationReducer';
import UserState from './userReducer/userReducer';
import LiveScoreDivisionState from './liveScoreReducer/liveScoreDivisionReducer';
// liveScoreGameTimeStatisticsState
import LiveScoreGameTimeStatisticsState from './liveScoreReducer/liveScoreGameTimeStatisticsReducer';
import LiveScoreSetting from './liveScoreReducer/liveScoreSettingReducer';
import LiveScoreUmpiresState from './liveScoreReducer/liveScoreUmpiresReducer';
import LiveScoreTeamAttendanceState from './liveScoreReducer/liveScoreTeamAttendanceReducer';
import liveScoreTeamPerMatchState from './liveScoreReducer/liveScoreTeamPerMatchReducer';
import LiveScoreVenueChangeState from './liveScoreReducer/liveScoreVenueChangeReducer';
import RegistrationDashboardState from './registrationReducer/registrationDashboardReducer';
import LadderSettingState from './liveScoreReducer/liveScoreLadderSettingReducer';
import HomeDashboardState from './homeReducer/homeReducer';
import LiveScoreFixtureCompState from './liveScoreReducer/liveScoreFixtureCompetitionReducer';
import StripeState from './stripeReducer/stripeReducer';
import QuickCompetitionState from './competitionManagementReducer/competitionQuickCompetitionReducer';

import LiveScoreCoachState from './liveScoreReducer/liveScoreCoachReducer';

import LiveScoreMatchSheetState from './liveScoreReducer/liveScoreMatchSheetReducer';
import ShopProductState from './shopReducer/productReducer';

/// / Umpire Module
import UmpireDashboardState from './umpireReducer/umpireDashboardReducer';
import UmpireCompetitionState from './umpireReducer/umpireCompetitionReducer';
import UmpireRosterState from './umpireReducer/umpireRosterReducer';
import UmpireState from './umpireReducer/umpireReducer';
import AssignUmpireState from './umpireReducer/assignUmpireReducer';
import UmpireSettingState from './umpireReducer/umpireSettingReducer';
import RegistrationChangeState from './registrationReducer/registrationChangeReducer';
import RegistrationClearanceState from './registrationReducer/registrationClearanceReducer';
import ShopSettingState from './shopReducer/shopSettingReducer';
import InnerHorizontalState from './liveScoreReducer/liveScoreInnerHorizontalReducer';
import LiveScorePositionTrackState from './liveScoreReducer/liveScorePositionTrackReducer';
import ShopOrderSummaryState from './shopReducer/orderSummaryReducer';
import SupportState from './supportReducer';
import ShopOrderStatusState from './shopReducer/orderStatusReducer';

import UmpirePaymentSettingState from './umpireReducer/umpirePaymentSettingReducer';
import CompetitionMultiDrawsState from './competitionManagementReducer/competitionMultiDrawsReducer';
import liveScorePlayerMinuteTrackingState from './liveScoreReducer/liveScorePlayerMinuteTrackingReducer';
import liveScorePlayerActionState from './liveScoreReducer/liveScorePlayerActionReducer';

import UmpirePaymentState from './umpireReducer/umpirePaymentReducer';
import UmpirePoolAllocationState from './umpireReducer/umpirePoolAllocationReducer';
import MovePlayerState from '../reducer/moveFAPlayerReducer';
import ReplicatePlayerState from './replicatePlayerReducer';

// Communication
import CommunicationState from './communicationReducer/communicationReducer';

const rootReducer = combineReducers({
  LoginState,
  MenuNavigationState,
  RegistrationState,
  AppState,
  LiveScorePlayerState,
  LiveScoreMatchState,
  LiveScoreMatchLogState,
  LiveScoreLadderState,
  LiveScoreState,
  LiveScoreTeamState,
  LiveScoreIncidentState,
  LiveScoreSuspensionState,
  LiveScoreNewsState,
  LiveScoreBannerState,
  LiveScoreRoundState,
  CompetitionFeesState,
  LiveScoreGoalState,
  LiveScoreManagerState,
  LiveScoreScorerState,
  LiveScoreBulkMatchState,
  liveScoreGamePositionState,
  CompetitionDashboardState,
  CompetitionModuleState,
  CompetitionFormatState,
  CompetitionFinalsState,
  LadderFormatState,
  CompetitionTimeSlots,
  CommonReducerState,
  VenueTimeState,
  CompetitionPartPlayerGradingState,
  CompetitionOwnTeamGradingState,
  CompetitionDrawsState,
  LiveScoreDashboardState,
  UserState,
  EndUserRegistrationState,
  liveScoreCompetition,
  LiveScoreDivisionState,
  LiveScoreGameTimeStatisticsState,
  LiveScoreSetting,
  LiveScoreUmpiresState,
  LiveScoreTeamAttendanceState,
  liveScoreTeamPerMatchState,
  LiveScoreVenueChangeState,
  RegistrationDashboardState,
  LadderSettingState,
  HomeDashboardState,
  LiveScoreFixtureCompState,
  StripeState,
  QuickCompetitionState,
  LiveScoreCoachState,
  LiveScoreMatchSheetState,
  CompetitionManagementState,
  ShopProductState,
  UmpireDashboardState,
  UmpireCompetitionState,
  UmpireRosterState,
  UmpireState,
  AssignUmpireState,
  UmpireSettingState,
  RegistrationChangeState,
  RegistrationClearanceState,
  ShopSettingState,
  InnerHorizontalState,
  LiveScorePositionTrackState,
  ShopOrderSummaryState,
  SupportState,
  UmpirePaymentSettingState,
  ShopOrderStatusState,
  liveScoreGameAttendanceState,
  CompetitionMultiDrawsState,
  liveScorePlayerMinuteTrackingState,
  liveScorePlayerActionState,
  UmpirePaymentState,
  UmpirePoolAllocationState,
  CommunicationState,
  StrapiReducerState,
  CompetitionGradesPoolReducer,
  MovePlayerState,
  ReplicatePlayerState,
  CompetitionOrgRegistrationsState
});

export default rootReducer;

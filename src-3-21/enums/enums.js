const LsCompStatus = {
  Hidden: 1,
  Active: 2,
  Ended: 3,
};

const MatchUmpirePaymentStatus = {
  NotApproved: 4,
  Approved: 5,
  Paid: 6,
  Failed: 7,
  Refunded: 8,
};

const UmpirePaymentAction = {
  Pay: 1,
  Retry: 2,
  Refund: 3,
  MarkAsPaid: 4,
};
const StateBorrowRuleRef = {
  CompOrganiserDecides: 1,
  StateDecides: 2,
};
const CompBorrowRuleRef = {
  BorrowableByOwnOrg: 1,
  BorrowableByAnyOrg: 2,
  BorrowableByAnyStateAffiliates: 3,
};
const UmpirePaymentDescription = {
  4: 'Not approved',
  5: 'Approved - pending payment',
  6: 'Paid',
  7: 'Failed',
  8: 'Refunded',
};
const UmpireAllocationTypeEnum = {
  MANUALLY_ALLOCATED: 242,
  VIA_POOLS: 243,
  OWN_TEAM: 244,
  OWN_ORGANISATION: 245,
};
const UmpireAllocatorTypeEnum = {
  COMPETITION_ORGANISER: 246,
  AFFILIATE_ORGANISATIONS: 247,
};

const MatchStatus = {
  Started: 'STARTED',
  Paused: 'PAUSED',
  Ended: 'ENDED',
  Postponed: 'POSTPONED',
};

const GradesOrPools = {
  Grades: 1,
  Pools: 2,
};

const GameStats = {
  //Netball
  Goals: 1,
  Misses: 2,
  PMisses: 3,

  //Football
  shirtNumber: 111,
  goal: 24,
  goalAssist: 12,
  penalty: 10,
  ownGoal: 11,
  corner: 13,
  foul: 7,
  offside: 14,
  onTarget: 16,
  offTarget: 15,
  yellowCardTD: 21,
  yellowCard: 22,
  redCard: 23,

  //Basketball
  Jersey: 111,
  TotalPoints: 222,
  Ftm: 5,
  Ftmiss: 6,
  Pm2: 5,
  P2miss: 6,
  Pm3: 5,
  P3miss: 6,
  Pf: 17,
  Tf: 18,
};

const ValueKind = {
  FTM: 1,
  PM2: 2,
  PM3: 3,
};
const ClearanceTypeRefId = {
  AlwaysRequire: 1,
  Automatically: 2,
};
const ClearanceStatusRefId = {
  Pending: 1,
  Required: 2,
  NotRequired: 3,
  Approved: 4,
  Declined: 5,
  ITC_Required: 6,
};

const ApproverTypeRefId = {
  RegisteringTo: 1,
  RegisteringFrom: 2,
};

const AutoApprovalRefId = {
  NoApprovalRequired: 1,
  Approved7Days: 2,
};

const ScoringType = {
  Single: 'SINGLE',
  NoScoringCard: 'NO_SCORING_CARD',
  PremierNetball: 'PREMIER_NETBALL',
};

const WhoScoring = {
  Managers: 'MANAGERS',
  Court: 'COURT',
  Umpires: 'UMPIRES',
};

const AcceptScoring = {
  Referee: 'REFEREE',
  Scorer: 'SCORER',
};

const PlayerLSStatus = {
  LivescoreManual: 1,
  Registered: 2,
  DeRegistered: 3,
  CompetitionManual: 4,
  Cancelled: 5,
  ExpiredSingleGame: 6,
  NoActiveMembership: 7,
  Moved: 8,
  Failed: 9,
};

const AttendanceType = {
  NotPlayed: 1,
  Played: 2,
  Borrowed: 3,
  Suspended: 4,
};

const MatchStatusRefId = {
  Started: 1,
  Ended: 2,
  Paused: 3,
  Postponed: 4,
};

const CompetitionStatus = {
  Draft: 1,
  Published: 2,
  Archived: 3,
};

const GamePosition = {
  GoalShooter: 1,
  GoalAttack: 2,
  WingAttack: 3,
  Centre: 4,
  WingDefence: 5,
  GoalDefence: 6,
  GoalKeeper: 7,
  Injured: 8,
  Bench: 9,
  Absent: 10,
  Forward: 12,
  Midfielder: 13,
  Defender: 14,
  Goalkeeper: 15,
  ShootingGuard: 16,
  PointGuard: 17,
  Forward: 18,
  Center: 19,
  PenaltyShooter: 20,
  Unknown: 256,
};

const SuspenedMatchStatusRefId = {
  Pending: 1,
  ServedYes: 2,
  ServedNo: 3,
};

const ParticipationRestrictionRefId = {
  Participate: 1,
  DoNotParticipate: 2,
};

const SpecialPeriod = {
  Penalty: 100,
};

const UmpireSequence = {
  Umpire1: 1,
  Umpire2: 2,
  Umpire3: 3,
  Umpire4: 4,
  UmpireCoach: 5,
  UmpireReserve: 0,
};

const EntityType = {
  Competition: 1,
  Organisation: 2,
  Team: 3,
  User: 4,
  CompetitionOrganisation: 6,
};

export {
  LsCompStatus,
  MatchUmpirePaymentStatus,
  UmpirePaymentAction,
  UmpirePaymentDescription,
  StateBorrowRuleRef,
  CompBorrowRuleRef,
  UmpireAllocationTypeEnum,
  UmpireAllocatorTypeEnum,
  MatchStatus,
  GradesOrPools,
  GameStats,
  ValueKind,
  ClearanceStatusRefId,
  AutoApprovalRefId,
  ScoringType,
  WhoScoring,
  AcceptScoring,
  PlayerLSStatus,
  AttendanceType,
  MatchStatusRefId,
  CompetitionStatus,
  GamePosition,
  SuspenedMatchStatusRefId,
  ParticipationRestrictionRefId,
  SpecialPeriod,
  EntityType,
  UmpireSequence,
  ClearanceTypeRefId,
};

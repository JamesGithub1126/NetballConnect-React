const DeRegisterRefundType = {
  Approved: 1,
  PartiallyApproved: 2,
  Declined: 3,
};
const DeRegisterOrgRefType = {
  Membership: 3,
  Competition: 2,
  AffiliateCompetition: 1,
  ParentStateMembership: 7,
  NationalMembership: 8,
  OrganiserTransfer: 11,
  AffiliateTransfer: 12,
};
const RegistrationStatus = {
  //CancelledOfflineRegistration: 'Cancelled Offline Registration',
  CancelledRegistration: 'Cancelled Registration',
  FailedRegistration: 'Failed Registration',
  IncompleteRegistration: 'Incomplete Registration',
  PendingCompetitionFee: 'Pending Competition Fee',
  PendingMembershipFee: 'Pending Membership Fee',
  PendingRegistrationFee: 'Pending Registration Fee',
  Registered: 'Registered',
  PendingTeamPayment: 'Pending Team Payment',
  PendingDeRegistration: 'Pending De-Registration',
  DeRegistered: 'De-Registered',
  PendingTransfer: 'Pending Transfer',
  TransferredTo: 'Transferred to',
};
export const ExternalRegistrationStatus = {
  Registered: 'Registered',
  Cancelled: 'Cancelled',
  Declined: 'Declined',
  Deregistered: 'Deregistered',
  Pending: 'Pending',
  RequireClearance: 'Require Clearance',
  Suspended: 'Suspended',
  Unknown: 'Unknown',
};
const ProcessTypeName = {
  Registration: 'REGISTRATION',
  OnBehalfOf: 'ONBEHALFOF',
  Instalment: 'instalment',
  ForcedOffline: 'forced_offline',
};

const RegistrationInviteesName = {
  Association: 'Association',
  Club: 'Club',
  AnyAssociation: 'anyAssociation',
  AnyClub: 'anyClub',
};
const RegistrationInvitees = {
  Association: 2,
  Club: 3,
  AnyAssociation: 7,
  AnyClub: 8,
  Direct: 5,
};
const AllowTeamRegistrationType = {
  NamedPlayers: 1,
  UnnamedPlayers: 2,
};
const TeamRegistrationChargeType = {
  TeamFullSeason: 1,
  TeamPerMatch: 2,
  PerMatchPerPlayer: 3,
  IndividualFullSeason: 4,
  IndividualPerMatchPlayed: 5,
  None: 0,
};
const IndividualChargeType = {
  FullSeason: 1,
  PerMatch: 2,
};

const TeamFeeType = {
  WholeTeam: 1,
  PerPlayer: 2,
};
const SeasonalPaymentOption = {
  //reference group 24
  PayFullAmount: 1,
  Instalments: 5,
  School: 8,
  SingleUseDiscount: 9,
  PaymentPlan: 10,
};
const RegPaymentOptionRef = {
  //reference group 59
  SingleGame: 1,
  TeamRegistrationPerMatch: 2,
  SeasonalFull: 3,
  Instalment: 4,
  SchoolInvoice: 5,
  OfflinePayment: 7, //for cash received
  ForcedOffline: 8, //no transfer in stripe
  PaymentPlan: 9,
};

const SecurePaymentOptionRef = {
  DirectDebit: 1,
  Card: 2,
  Cash: 3,
};

const MembershipProductStatusEnum = {
  Draft: 1,
  Published: 2,
  Closed: 3,
};
const MembershipProductStatusName = {
  Draft: 'Draft',
  Published: 'Published',
  Closed: 'Closed',
};
const RetryPaymentType = {
  Card: 1,
  DirectDebit: 2,
};
const ValidityPeriodType = {
  EndDate: 1,
  NumberOfDays: 2,
};
const CompetitionTypeDiscountType = {
  DiscountCode: 2,
  Family: 3,
};
const FeesType = {
  //reference group 7
  Casual: 1,
  Seasonal: 2,
  TeamSeasonal: 3,
  TeamPerMatch: 4,
  IndividualPerMatch: 5,
};
const FrequencyType = {
  Weekly: 1,
  Every2Weeks: 2,
  Every4Weeks: 3,
  DayOfMonth: 4,
};
const PaymentPlanStatus = {
  NotUsed: 1,
  Setup: 2,
};
const GovernmentVoucherType = {
  NSWActiveKids: 1,
  QueenslandFairPlay: 2,
  NTSportsVoucherScheme: 3,
  VictoriaGetActive: 4,
  SASportsVoucher: 5,
};
const RegistrationUserRoles = {
  Player: 18,
  Coach: 17,
  Umpire: 15,
  Volunteer: 28,
  Committee: 29,
  OtherOfficial: 31,
  Other: 27,
  OtherNonPlayer: 16,
};
export {
  DeRegisterRefundType,
  DeRegisterOrgRefType,
  RegistrationStatus,
  ProcessTypeName,
  RegistrationInviteesName,
  RegistrationInvitees,
  AllowTeamRegistrationType,
  TeamRegistrationChargeType,
  IndividualChargeType,
  TeamFeeType,
  SeasonalPaymentOption,
  RegPaymentOptionRef,
  SecurePaymentOptionRef,
  MembershipProductStatusEnum,
  MembershipProductStatusName,
  RetryPaymentType,
  ValidityPeriodType,
  CompetitionTypeDiscountType,
  FeesType,
  FrequencyType,
  PaymentPlanStatus,
  GovernmentVoucherType,
  RegistrationUserRoles,
};

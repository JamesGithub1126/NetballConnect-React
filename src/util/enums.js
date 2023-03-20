const FLAVOUR = {
  Football: 'football',
  Netball: 'netball',
  Basketball: 'basketball',
};

const RECORDUMPIRETYPE = {
  None: 'NONE',
  Users: 'USERS',
  Names: 'NAMES',
};

const SPORT = {
  netball: 1,
  basketball: 2,
  football: 3,
};

const SHOPDELIVERYTYPE = {
  Pickup: 'pickup',
  Shipping: 'shipping',
};

const ROLE = {
  MANAGER: 3,
  SCORER: 4,
  MEMBER: 5,
  SPECTATOR: 6,
  PLAYER: 8,
  PARENT: 9,
  EVENT_INVITEE: 14,
  UMPIRE: 15,
  COACH: 17,
  UMPIRE_RESERVE: 19,
  UMPIRE_COACH: 20,
};

const INCIDENT_TYPE = {
  Spectator: 4,
  Discipline: 5,
  Ambulance: 6,
  FirstAid: 7,
  SendOffReport: 8,
};

const ALLOCATION_STATUS = {
  Draft: 1,
  Published: 2,
};

const MODAL_CLOSE_ACTION = {
  None: 0,
  Close: 1,
  CloseAndReload: 2,
};

const GENDER = {
  MALE: 2,
  FEMALE: 1,
  NON_BINARY: 3,
  DIFFERENT_IDENTITY: 4,
};

const TIMESLOT_GENERATION = {
  MATCH_DURATION: 1,
  MANUAL: 2,
};

const TIMESLOT_ROTATION_MAIN = {
  NONE: 7,
  EVEN: 9,
  ALLOCATE: 8,
};

const TIMESLOTS_ROTATION_SUB = {
  EVEN_DIVISIONS: 1,
  EVEN_GRADES: 2,
  EVEN_TEAMS: 3,
  ALLOCATE_DIVISIONS: 4,
  ALLOCATE_GRADES: 5,
};

const COURTROTATION_MAIN = {
  EVEN: 1,
  ALLOCATE: 5,
  NONE: 8,
  ALLOCATE_VENUE: 9,
};

const COURTROTATION_SUB = {
  EVEN_DIVISIONS: 2,
  EVEN_GRADES: 3,
  ALLOCATE_DIVISIONS: 6,
  ALLOCATE_GRADES: 7,
  ALLOCATE_VENUE_DIVISIONS: 10,
  ALLOCATE_VENUE_GRADES: 11,
};

const REGISTRATION_QUESTION_CHOICE = {
  ASK: 1,
  DONT_ASK: 0,
  IS_AFFILIATE_CHOOSING: 2,
};

const REGISTRATION_QUESTIONS = {
  MEMBERSHIP_TYPE_CHILDREN_CHECK_NUMBER: 35,
  UMPIRE_MEMBERSHIP_QUESTIONS: 51,
  COACH_MEMBERSHIP_QUESTIONS: 52,
  SHOP: 5,
  WALKING_MEMBERSHIP_QUESTIONS: 53,
  ITC_CLEARANCE_QUESTIONS: 62,
};

const MEMBERSHIP_PRODUCT_TYPE = {
  PLAYER: 1,
  TEAM: 2,
  COACH: 3,
  UMPIRE: 4,
  PLAYER_WALKING_NETBALL: 5,
};

const CompetitionType = {
  Weekly: 1,
  Tournament: 2,
};

const CompetitionFormatType = {
  Knockout: 1,
  RoundRobin: 2,
  DoubleRoundRobin: 3,
  EnhancedRoundRobin: 4,
};

const VenuePreferenceType = {
  Division: 1,
  Grade: 2,
};
const HomeTeamRotation = {
  HomeVenue: 1,
  Team: 2,
  None: 3,
};

const StatusEnum = {
  Draft: 1,
  Published: 2,
  DrawPublished: 3,
};
const DrawPublishStatus = {
  Published: 1,
  Regrade: 2,
};

const DrawExceptionType = {
  Retain: 1,
  UseTeamRanking: 2,
  UseRound1: 3,
};

const transactionFeeCap = {
  DIRECT_DEBIT: 10,
};

const UserRole = {
  SuperAdmin: 1,
  Admin: 2,
  AdminReadonly: 24,
  WebImpersonatedAdmin: 10,
  WebUmpiresAdmin: 11,
  WebFinanceAdmin: 13,
  ParentUnlinked: 23,
  ParentLinked: 9,
  ParentRestricted: 22,
};
const ApiSource = {
  Common: 1,
  LiveScore: 2,
  Registration: 3,
  User: 4,
  Strapi: 5,
};

const OrganisationType = {
  National: 1,
  State: 2,
  Association_League: 3,
  Club_School: 4,
};
const OrganisationTypeName = {
  National: 'National',
  State: 'State',
  Association_League: 'Association',
  Club_School: 'Club',
};

const SortType = {
  Asc: 'ASC',
  Desc: 'DESC',
};

const ErrorType = {
  Error: 1,
  Failed: 2,
};

const RegistrationInvitees = {
  Affiliates: 1,
  Affiliates_Level_1: 2,
  Affiliates_Level_2: 3,
  AnyOrganisation: 4,
  Direct: 5,
  NotApplicable: 6,
  Associations_Leagues: 7,
  Clubs_Schools: 8,
};

const PreferenceSetBy = {
  CompetitionOrganiserToSet: 1,
  AffiliateToSet: 2,
};
const HomeAwayVenuePreference = {
  Home: 1,
  Away: 2,
};
const DrawShowOnlyType = {
  SelectedVenues: 1,
  SelectedOrganisations: 2,
  SelectedDivisions: 3,
  ScheduledMatches: 4,
};

const MenuKey = {
  Websites: 'websites',
};

const BFSettingType = {
  MEDIA_REPORT: 1,
  VOTED_AWARD: 2,
  ORGANISATION_AWARD: 3,
};

const PaymentTypeName = {
  Card: 'card',
  DirectDebit: 'direct_debit',
  Cash: 'cash',
  Offline: 'offline',
};

const UMPIRE_SCHEDULE_STATUS = {
  UnavailableDateRange: '#eee',
  Available: 'rgb(0, 215, 141)',
  Unavailable: 'rgb(255, 9, 61)',
};

const GameStatCategory = {
  Goal: 'Goal',
  Miss: 'Miss',
  Foul: 'Foul',
  Points: 'Points',
  MissedPoints: 'Missed Points',
  EnhanchedStatistics: 'Enhanced Statistics',
};

const DiscountType = {
  Amount: 1,
  Percentage: 2,
};

const CompetitionDiscountType = {
  DiscountCode: 2,
  Family: 3,
};

const userEditProfileTab = {
  AddressTab: '1',
  parentOrGuardianDetailTab: '2',
  emergencyContactsTab: '3',
  otherInformationTab: '4',
  medicalTab: '5',
  childTab: '6',
  addChildTab: '7',
  addParentGuardianTab: '8',
  communicationsAndPrivacyTab: '10',
};

const MatchType = {
  FOUR_QUARTERS: 'FOUR_QUARTERS',
  TWO_HALVES: 'TWO_HALVES',
  SINGLE_PERIOD: 'SINGLE_PERIOD',
}

export {
  FLAVOUR,
  RECORDUMPIRETYPE,
  SPORT,
  SHOPDELIVERYTYPE,
  ROLE,
  INCIDENT_TYPE,
  ALLOCATION_STATUS,
  MODAL_CLOSE_ACTION,
  GENDER,
  TIMESLOT_GENERATION,
  TIMESLOT_ROTATION_MAIN,
  TIMESLOTS_ROTATION_SUB,
  COURTROTATION_MAIN,
  COURTROTATION_SUB,
  REGISTRATION_QUESTION_CHOICE,
  REGISTRATION_QUESTIONS,
  MEMBERSHIP_PRODUCT_TYPE,
  CompetitionType,
  CompetitionFormatType,
  VenuePreferenceType,
  StatusEnum,
  HomeTeamRotation,
  DrawExceptionType,
  transactionFeeCap,
  DrawPublishStatus,
  UserRole,
  ApiSource,
  OrganisationType,
  OrganisationTypeName,
  SortType,
  ErrorType,
  RegistrationInvitees,
  PreferenceSetBy,
  HomeAwayVenuePreference,
  DrawShowOnlyType,
  MenuKey,
  BFSettingType,
  PaymentTypeName,
  UMPIRE_SCHEDULE_STATUS,
  GameStatCategory,
  DiscountType,
  CompetitionDiscountType,
  userEditProfileTab,
  MatchType,
};

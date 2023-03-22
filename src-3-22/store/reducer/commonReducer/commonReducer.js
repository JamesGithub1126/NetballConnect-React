import ApiConstants from 'themes/apiConstants';
import { isArrayNotEmpty, isNotNullSetDefault } from 'util/helpers';

const initialRegistrationWidgetsState = {
  loading: false,
  organisationId: 0,
  changeTotalCount: 0,
  changeTotalValue: 0,
  thisPeriod: {
    // either hour can exist in the list or date
    hour: ['00'], // optional
    date: [], // optional
    totalValue: [],
    totalCount: [],
  },
  lastPeriod: {
    // either hour can exist in the list or date
    hour: ['00'],
    date: [],
    totalValue: [],
    totalCount: [],
  },
};

const initialShopPurchasesWidgetsState = {
  loading: false,
  organisationId: 0,
  changeTotalCount: 0,
  changeTotalValue: 0,
  thisPeriod: {
    // either hour can exist in the list or date
    hour: ['00'], // optional
    date: [], // optional
    totalSPValue: [],
    totalCount: [],
  },
  lastPeriod: {
    // either hour can exist in the list or date
    hour: ['00'],
    date: [],
    totalSPValue: [],
    totalCount: [],
  },
};

const initialOrgGrowthWidgetsState = {
  loading: false,
  data: [],
};

const initialState = {
  onLoad: false,
  onGenericLoad: false,
  error: null,
  result: null,
  status: 0,
  applyVenue: [],
  timeSlotRotation: [],
  timeSlotGeneration: [],
  weekDays: [],
  stateList: [],
  daysList: [],
  favouriteTeamList: [],
  addVenueData: '',
  onVenueDataLoad: false,
  mainVenueList: [],
  registrationOtherInfoOnLoad: false,
  venueList: [],
  addVenueSuccessMsg: '',
  gradesReferenceData: [],
  favouriteTeamsList: [],
  firebirdPlayerList: [],
  registrationOtherInfoList: [],
  countryList: [],
  nationalityList: [],
  heardByList: [],
  playerPositionList: [],
  searchVenueList: [],
  venuesList: [],
  venuesListPage: 1,
  venuesListPageSize: 10,
  venuesListTotalCount: 1,
  genderDataEnum: [
    {
      description: 'Male',
      id: 2,
      name: 'male',
    },
    {
      description: 'Female',
      id: 1,
      name: 'female',
    },
  ],
  genderData: [],
  photoTypeData: [],
  applyToData: [],
  extraTimeDrawData: [],
  finalFixtureTemplateData: [],
  courtLoad: false,
  courtList: [],
  inviteTypeData: [],
  allowTeamRegistration: [],
  registrationTypeData: [],
  disabilityList: [],
  days: [],
  stateData: [],
  paymentStatus: [],
  matchPrintTemplateType: [],
  venueAddressDuplication: false,
  regChangeTypes: [],
  venueListActionObject: null,
  membershipPaymentOptions: [],
  accreditationUmpireList: [],
  umpireAccreditation: [],
  coachAccreditation: [],
  tShirtSizeList: [],
  stateListData: [],
  divisionFieldConfigList: [],
  docTypes: [],
  relationshipList: [],
  ladderCalculationTypeList: [],
  ladderEndList: [],
  incidentOffencesTypeList: [],
  penaltyTypeList: [],
  appealOutcomeList: [],
  incidentStatus: [],
  suspensionApplyToList: [],
  userWidgets: {
    loading: false,
    nonRegisteredUsers: 0,
    registeredUsers: 0,
    totalCount: 0,
  },
  revenueWidgets: {
    loading: false,
    totalPaid: 0,
    lastPeriod: 0,
    thisPeriod: 0,
  },
  shopPurchasesWidgets: initialShopPurchasesWidgetsState,
  registrationWidgets: initialRegistrationWidgetsState,
  organisationGrowthWidgets: initialOrgGrowthWidgetsState,
  revenueGrowthWidgets: initialOrgGrowthWidgetsState,
  onLoadEmailRecipients: false,
  emailRecipientsList: null,
  emailRecipientsPage: { currentPage: 1, pageSize: 10, totalCount: 0 },
};

function commonReducerState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_TIME_SLOT_INIT_LOAD:
      return {
        ...state,
      };

    case ApiConstants.API_TIME_SLOT_INIT_SUCCESS:
      return {
        ...state,
        applyVenue: action.result.ApplyToVenue,
        timeSlotRotation: action.result.TimeslotRotation,
        timeSlotGeneration: action.result.TimeslotGeneration,
        weekDays: action.result.Day,
      };

    // Common Ref Case
    case ApiConstants.API_GET_COMMON_REF_DATA_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_COMMON_REF_DATA_SUCCESS:
      return {
        ...state,
        onLoad: false,
        stateList: action.result.State,
        daysList: action.result.Day,
        favouriteTeamList: action.result.FavouriteTeam,
        status: action.status,
      };

    // Add Venue Case
    case ApiConstants.API_ADD_VENUE_LOAD:
      return { ...state, onLoad: true, onVenueDataLoad: true };

    case ApiConstants.API_ADD_VENUE_SUCCESS:
      if (action.result != null) {
        state.venueList.push(action.result);
        state.searchVenueList.push(action.result);
      }

      return {
        ...state,
        onLoad: false,
        mainVenueList: action.result,
        onVenueDataLoad: false,
        addVenueData: action.result,
        status: action.status,
        addVenueSuccessMsg: 'Successfully Inserted',
      };

    // Venue List for own competition venue and times
    case ApiConstants.API_VENUE_LIST_LOAD:
      return { ...state, onVenueDataLoad: true };

    case ApiConstants.API_USER_WIDGETS_LOAD:
      const { userWidgets } = state;
      return { ...state, userWidgets: { ...userWidgets, loading: true } };

    case ApiConstants.API_USER_WIDGETS_SUCCESS:
      const { totalCount, registeredUsers, nonRegisteredUsers } = action.result;
      return {
        ...state,
        userWidgets: {
          loading: false,
          totalCount: totalCount || 0,
          registeredUsers: registeredUsers || 0,
          nonRegisteredUsers: nonRegisteredUsers || 0,
        },
      };

    case ApiConstants.API_REVENUE_WIDGETS_LOAD:
      const { revenueWidgets } = state;
      return { ...state, revenueWidgets: { ...revenueWidgets, loading: true } };

    case ApiConstants.API_SHOP_PURCHASES_WIDGETS_LOAD:
      return {
        ...state,
        shopPurchasesWidgets: { ...initialShopPurchasesWidgetsState, loading: true },
      };
    case ApiConstants.API_REGISTRATION_WIDGETS_LOAD:
      return {
        ...state,
        registrationWidgets: { ...initialRegistrationWidgetsState, loading: true },
      };

    case ApiConstants.API_REGISTRATIONS_GROWTH_WIDGETS_LOAD:
      return {
        ...state,
        organisationGrowthWidgets: { ...initialOrgGrowthWidgetsState, loading: true },
      };

    case ApiConstants.API_REVENUE_GROWTH_WIDGETS_LOAD:
      return {
        ...state,
        revenueGrowthWidgets: { ...initialOrgGrowthWidgetsState, loading: true },
      };

    case ApiConstants.API_REVENUE_WIDGETS_SUCCESS:
      return {
        ...state,
        revenueWidgets: {
          loading: false,
          totalPaid: action.result.totalPaid,
          lastPeriod: action.result.lastPeriod,
          thisPeriod: action.result.thisPeriod,
        },
      };

    case ApiConstants.API_SHOP_PURCHASES_WIDGETS_SUCCESS:
      const shopPurchasesLP = action.result.lastPeriod;
      const shopPurchasesTP = action.result.thisPeriod;

      return {
        ...state,
        shopPurchasesWidgets: {
          ...action.result,
          lastPeriod: {
            ...shopPurchasesLP,
            totalCount: isNotNullSetDefault(shopPurchasesLP.totalCount, 0),
            totalValue: isNotNullSetDefault(shopPurchasesLP.totalSPValue, 0),
          },
          thisPeriod: {
            ...shopPurchasesTP,
            totalCount: isNotNullSetDefault(shopPurchasesTP.totalCount, 0),
            totalValue: isNotNullSetDefault(shopPurchasesTP.totalSPValue, 0),
          },
          loading: false,
        },
      };

    case ApiConstants.API_REGISTRATION_WIDGETS_SUCCESS:
      const lp = action.result.lastPeriod;
      const tp = action.result.thisPeriod;

      return {
        ...state,
        registrationWidgets: {
          ...action.result,
          lastPeriod: {
            ...lp,
            totalCount: isNotNullSetDefault(lp.totalCount, 0),
            totalValue: isNotNullSetDefault(lp.totalValue, 0),
          },
          thisPeriod: {
            ...tp,
            totalCount: isNotNullSetDefault(tp.totalCount, 0),
            totalValue: isNotNullSetDefault(tp.totalValue, 0),
          },
          loading: false,
        },
      };

    case ApiConstants.API_REGISTRATIONS_GROWTH_WIDGETS_SUCCESS:
      return {
        ...state,
        organisationGrowthWidgets: {
          data: action.result,
          loading: false,
        },
      };

    case ApiConstants.API_REVENUE_GROWTH_WIDGETS_SUCCESS:
      return {
        ...state,
        revenueGrowthWidgets: {
          data: action.result,
          loading: false,
        },
      };

    case ApiConstants.API_VENUE_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        mainVenueList: action.result,
        venueList: action.result,
        searchVenueList: action.result,
      };

    // Get the grades reference data
    case ApiConstants.API_GRADES_REFERENCE_LIST_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GRADES_REFERENCE_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        gradesReferenceData: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the Favourite Team List
    case ApiConstants.API_FAVOURITE_TEAM_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_FAVOURITE_TEAM_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        favouriteTeamsList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the Firebird Player List
    case ApiConstants.API_FIREBIRD_PLAYER_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_FIREBIRD_PLAYER_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        firebirdPlayerList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the  registration other info
    case ApiConstants.API_REGISTRATION_OTHER_INFO_REFERENCE_LOAD:
      return { ...state, registrationOtherInfoOnLoad: true, error: null };

    case ApiConstants.API_REGISTRATION_OTHER_INFO_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        registrationOtherInfoList: isArrayNotEmpty(action.result) ? action.result : [],
        registrationOtherInfoOnLoad: false,
        error: null,
      };

    // Get the  country list
    case ApiConstants.API_COUNTRY_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_COUNTRY_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        countryList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the  nationality list
    case ApiConstants.API_NATIONALITY_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_NATIONALITY_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        nationalityList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_DIVISION_FIELD_CONFIG_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_DIVISION_FIELD_CONFIG_SUCCESS:
      return {
        ...state,
        status: action.status,
        divisionFieldConfigList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the  HeardBy list
    case ApiConstants.API_HEARDBY_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_HEARDBY_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        heardByList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    // Get the  Player Position Reference
    case ApiConstants.API_PLAYER_POSITION_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_PLAYER_POSITION_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        playerPositionList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.Search_Venue_updated:
      return { ...state, venueList: action.filterData };

    case ApiConstants.CLEAR_FILTER_SEARCH:
      return {
        ...state,
        venueList: state.mainVenueList,
      };

    // Venue List for User Module
    case ApiConstants.API_VENUES_LIST_LOAD:
      return { ...state, onLoad: true, venueListActionObject: action };

    case ApiConstants.API_VENUES_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        venuesList: action.result.venues,
        venuesListPage: action.result.page ? action.result.page.currentPage : 1,
        venuesListTotalCount: action.result.page.totalCount,
      };

    case ApiConstants.API_VENUE_DELETE_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_VENUE_DELETE_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
      };

    case ApiConstants.API_GET_GENDER_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_GENDER_SUCCESS:
      return {
        ...state,
        onLoad: true,
        genderData: action.result,
        status: action.status,
      };

    case ApiConstants.API_DISABILITY_REFERENCE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_DISABILITY_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        disabilityList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_GET_PHOTO_TYPE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_PHOTO_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        photoTypeData: action.result,
        status: action.status,
      };

    case ApiConstants.API_GET_APPY_TO_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_APPY_TO_SUCCESS:
      return {
        ...state,
        onLoad: true,
        applyToData: action.result,
        status: action.status,
      };

    case ApiConstants.API_GET_EXTRA_TIME_DRAW_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_EXTRA_TIME_DRAW_SUCCESS:
      return {
        ...state,
        onLoad: true,
        extraTimeDrawData: action.result,
        status: action.status,
      };

    case ApiConstants.API_GET_FINAL_FIXTURE_TEMPLATE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_FINAL_FIXTURE_TEMPLATE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        finalFixtureTemplateData: action.result,
        status: action.status,
      };

    // Court List for own competition venue and times
    case ApiConstants.API_COURT_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        courtLoad: true,
        courtList: [],
      };

    case ApiConstants.API_COURT_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        courtList: action.result,
        courtLoad: false,
      };

    // Send invite to
    case ApiConstants.API_GET_INVITE_TYPE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_INVITE_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        inviteTypeData: action.result,
        status: action.status,
      };

    case ApiConstants.API_ALLOW_TEAM_REGISTRATION_TYPE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_ALLOW_TEAM_REGISTRATION_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        allowTeamRegistration: action.result,
        status: action.status,
      };

    case ApiConstants.API_REGISTRATION_RESTRICTION_TYPE_LOAD:
      return { ...state };

    case ApiConstants.API_REGISTRATION_RESTRICTION_TYPE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        registrationTypeData: action.result,
        status: action.status,
      };

    case ApiConstants.API_GET_COMMON_INIT_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_COMMON_INIT_SUCCESS:
      return { ...state, onLoad: false, days: action.result.Day };

    // Get state reference data
    case ApiConstants.API_GET_STATE_REFERENCE_DATA_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STATE_REFERENCE_DATA_SUCCESS:
      return {
        ...state,
        stateData: isArrayNotEmpty(action.result.State) ? action.result.State : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_REGISTRATION_PAYMENT_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_REGISTRATION_PAYMENT_STATUS_SUCCESS:
      return {
        ...state,
        onLoad: true,
        paymentStatus: action.result,
        status: action.status,
      };

    case ApiConstants.API_MATCH_PRINT_TEMPLATE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_MATCH_PRINT_TEMPLATE_SUCCESS:
      return {
        ...state,
        onLoad: true,
        matchPrintTemplateType: action.result.MatchPrintTemplate,
        status: action.status,
      };

    case ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_VENUE_ADDRESS_CHECK_DUPLICATION_SUCCESS:
      return {
        ...state,
        onLoad: false,
        venueAddressDuplication: action.result.duplicated,
        status: action.status,
      };

    // Get the  Reg Change Types
    case ApiConstants.API_REGISTRATION_CHANGE_TYPE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_REGISTRATION_CHANGE_TYPE_SUCCESS:
      return {
        ...state,
        status: action.status,
        regChangeTypes: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      return { ...state, onLoad: false, venueListActionObject: null };

    case ApiConstants.API_MEMBERSHIP_PAYMENT_OPTIONS_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_MEMBERSHIP_PAYMENT_OPTIONS_SUCCESS:
      return {
        ...state,
        onLoad: false,
        membershipPaymentOptions: isArrayNotEmpty(action.result) ? action.result : [],
        status: action.status,
      };

    ///////get the other accreditation umpire list
    case ApiConstants.API_ACCREDITATION_UMPIRE_REFERENCE_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_ACCREDITATION_UMPIRE_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        accreditationUmpireList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    ///////get the other accreditation umpire and coach list
    case ApiConstants.API_ACCREDITATION_UMPIRE_COACH_COMBINED_REFERENCE_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_ACCREDITATION_UMPIRE_COACH_COMBINED_REFERENCE_SUCCESS:
      return {
        ...state,
        status: action.status,
        umpireAccreditation: action.result.accreditationUmpire,
        coachAccreditation: action.result.accreditationCoach,
        stateListData: action.result.State,
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_NETSETGO_TSHIRT_SIZE_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_NETSETGO_TSHIRT_SIZE_SUCCESS:
      return {
        ...state,
        status: action.status,
        tShirtSizeList: isArrayNotEmpty(action.result) ? action.result : [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.SET_VENUES_LIST_PAGE_SIZE:
      return {
        ...state,
        venuesListPageSize: action.pageSize,
      };

    case ApiConstants.SET_VENUES_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        venuesListPage: action.pageNum,
      };

    case ApiConstants.API_GET_DOCUMENT_TYPE_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_DOCUMENT_TYPE_SUCCESS:
      return {
        ...state,
        docTypes: action.result,
        onLoad: false,
      };

    case ApiConstants.API_RELATIONSHIP_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };
    case ApiConstants.API_GENERIC_COMMON_REFERENCE_LOAD:
      return {
        ...state,
        onGenericLoad: true,
      };

    case ApiConstants.API_GENERIC_COMMON_REFERENCE_LOAD_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        onGenericLoad: false,
        error: null,
        ...action.result,
      };

    case ApiConstants.API_RELATIONSHIP_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        relationshipList: action.result || [],
        onLoad: false,
        error: null,
      };

    case ApiConstants.API_LADDER_REFERENCE_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_LADDER_REFERENCE_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        error: null,
        ladderCalculationTypeList: action.result.ladderCalculationType,
        ladderEndList: action.result.LadderEnd,
      };

    case ApiConstants.API_INCIDENT_OFFENCES_LIST_LOAD:
    case ApiConstants.API_PENALTY_TYPE_LIST_LOAD:
    case ApiConstants.API_APPEAL_OUTCOME_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_INCIDENT_OFFENCES_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        error: null,
        incidentOffencesTypeList: action.result,
      };

    case ApiConstants.API_PENALTY_TYPE_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        error: null,
        penaltyTypeList: action.result,
      };

    case ApiConstants.API_APPEAL_OUTCOME_LIST_SUCCESS:
      return {
        ...state,
        status: action.status,
        onLoad: false,
        error: null,
        appealOutcomeList: action.result,
      };

    case ApiConstants.API_GET_DAYS_SUCCESS:
      return {
        ...state,
        weekDays: action.result,
      };

    case ApiConstants.API_GET_REFERENCE_INCIDENT_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_REFERENCE_INCIDENT_STATUS_SUCCESS:
      return {
        ...state,
        incidentStatus: action.result,
        onLoad: false,
      };

    case ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_LOAD:
      return {
        ...state,
        onLoad: true,
      };

    case ApiConstants.API_GET_SUSPENSION_REFERENCE_APPLY_TO_SUCCESS:
      return {
        ...state,
        suspensionApplyToList: action.result,
        onLoad: false,
      };

    case ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_LOAD:
    case ApiConstants.API_EXPORT_EMAIL_RECIPIENTS_LIST_LOAD:
      return {
        ...state,
        onLoadEmailRecipients: true,
      };

    case ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_SUCCESS:
      return {
        ...state,
        onLoadEmailRecipients: false,
        emailRecipientsList: action.result.results,
        emailRecipientsPage: {
          ...action.result.page,
          pageSize: action.payload.limit,
        },
      };

    case ApiConstants.API_EXPORT_EMAIL_RECIPIENTS_LIST_SUCCESS:
      return {
        ...state,
        onLoadEmailRecipients: false,
      };

    case ApiConstants.API_GET_EMAIL_RECIPIENTS_LIST_RESET:
      return {
        ...state,
        onLoadEmailRecipients: false,
        emailRecipientsList: null,
      };

    default:
      return state;
  }
}

export default commonReducerState;

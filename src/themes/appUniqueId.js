const AppUniqueId = {
  /// / Unique Ids for Login Page ////////
  login_username: 'username',
  login_password: 'password',
  login_forgotPasswordLink: 'forgotPasswordLink',
  login_submitButton: 'loginButton',

    /// / Unique Ids for Daashboard ////////
    home_Icon: 'homeIcon',
    competition_Icon: 'competitionIcon',
    HOME_MENU: 'home',

    /// / Unique Ids for Competition Daashboard ////////
    own_Competitions: 'ownCompetitions',
    own_CompetitionsPlayerGrading: 'own_CompetitionsPlayerGrading',

  /// / Unique Ids for Menus ////////
  MENU_ACTIONS: 'menuActions',

  /// / Unique Ids for Venues ////////
  compYear_dpdnVenues: 'venues_year_dpdn',
  CompetitionName_dpdnVenues: 'venues_compname_dpdn',
  CourtPreferences_EvenRotation: 'venuesEvenRotation',
  CourtPreferences_Divisions_EvenRotation: 'venuesEvenRotationDivisions',
  CourtPreferences_Grades_EvenRotation: 'venuesEvenRotationGrades',
  CourtPreferences_Teams_EvenRotation: 'venuesEvenRotationTeams',
  CourtPreferences_AllocSameCourt: 'venuesAllocSameCourt',
  CourtPreferences_AllocSameVenue: 'venuesAllocSameVenue',
  CourtPreferences_AllocSameCourt_Divisions: 'venuesAllocSameCourtDivisions',
  CourtPreferences_AllocSameVenue_Divisions: 'venuesAllocSameVenueDivisions',
  CourtPreferences_AllocSameCourt_Grades: 'venuesAllocSameCourtGrades',
  CourtPreferences_AllocSameVenue_Grades: 'venuesAllocSameVenueGrades',
  CourtPreferences_NoPreference: 'venuesNoPreference',
  CourtPreferences_AddAnotherCourtPreference_btn: 'addAnotherVenue_btn',
  CourtPreferences_AllocSameCourt_CourtID: 'addVenueCourtID',
  CourtPreferences_AllocSameCourt_AddAnotherCourt_DivisionID: 'addVenueDivisionId',
  homeAndAwayComp: 'homeAndAwayComp',
  centreVenueComp: 'centreVenueComp',

  /// / Unique Ids for TimeSlots ////////

  compYear_dpdnTimeslot: 'timeslot_year_dpdn',
  competitionName_dpdnTimeslot: 'timeslot_compname_dpdn',
  timeRotationPreferenceRadiobutton: 'timerotation_id',
  allocateSameTimeslotRadiobutton: 'mainTimeRotationID',
  allocateSameTimeslotDivision: 'mainTimeRotationDivisionID',
  allocateSameTimeslotGrade: 'mainTimeRotationGradeID',
    gradeSortOrder: 'gradeSortOrder',
  timeRotation_matchDuration_RadioBtn: 'timeslotGenerationRefId',
  timeRotation_matchDuration_Day_of_the_week_drpdn: 'timeslotGenerationDayOfWeekRefId',
  timeRotation_matchDuration_StartTime_drpdn: 'timeslotGenerationStartTimeRefId',
  timeRotation_matchDuration_EndTime_drpdn: 'timeslotGenerationEndTimeRefId',
  timeRotation_matchDuration_Add_anotherday_Btn: 'timeslotGenerationAddDay_btn',
  timeRotation_matchDuration_AdddivisionTimeslotOrderTextField:
    'timeslotGenerationAddDivisionRefId',
  timeRotation_matchDuration_AddAnotherTimeslot_Btn: 'timeslotGenerationAddTimeslot_btn',
  manuallyAddTimeslot: 'timeSlotEntityManual',
  manuallyAddTimeslot_ApplyAllVenues: 'ManualTimeSlotAllVenues',
  manuallyAddTimeslot_ApplyAllVenues_Day_of_the_week_drpdn: 'ManualTimeSlotAllVenues',
  manuallyAddTimeslot_ApplySettingsIndividualVenues: 'ManualTimeSlotIndividualVenues',
  manuallyAddTimeslot_ApplySettingsIndividualVenues_Day_of_the_week_drpdn: 'dayRefIdManual0',
  manuallyAddTimeslot_ApplySettingsIndividualVenues_startTime: 'timeSlotManualStartTime',
  manuallyAddTimeslot_ApplySettingsIndividualVenues_Divisions: 'timeSlotManualDivision',
  manuallyAddTimeslot_ApplySettingsIndividualVenues_AddTimeSlotBtn: 'timeSlotManualAddTimeslot_btn',
  manuallyAddTimeslot_ApplySettingsIndividualVenues_AddAnotherDayBtn: 'timeSlotManualAddDay_btn',
  timeSlotSaveBtn: 'timeslot_save_btn',
  dayRefIdAllVenue: 'dayRefIdAllVenue',
  eventimeRotation_div: 'eventimeRotation_div',
  eventimeRotation_grade: 'eventimeRotation_grade',
  eventimeRotation_team: 'eventimeRotation_team',
  timeslotGenerationRemove_btn: 'timeslotGenerationRemove_btn',

  /// / Unique Ids for TeamGrading ////////

  teamGradingYear_dpdn: 'teamgrad_year_dpdn',
  teamGradingCompetition_dpdn: 'teamgrad_compname_dpdn',
  teamGrading_ExportBtn: 'teamgrad_export_bn',
  teamGrading_ExportPlayer: 'teamgrad_exportplayer_bn',
  teamGrading_PublishBtn: 'teamgrad_publish_bn',
  teamGrading_NextBtn: 'teamgrad_Next_bn',
  finalteamgrad_save_bn: 'finalteamgrad_save_bn',
  finalteamgrad_submit_bn: 'finalteamgrad_submit_bn',

  /// / Unique Ids for PlayerGrading ////////

  PlayerGradingYear_dpdn: 'playgrad_year_dpdn',
  PlayerGradingCompetition_dpdn: 'playgrad_compname_dpdn',
  PlayerGradingDivisionName_dpdn: 'playgrad_divname_dpdn',
    PlayerGrading_ActionBtn: 'playgrad_action_bn',
  PlayerGrading_ImportBtn: 'playgrad_import_bn',
  PlayerGrading_ImportTeamBtn: 'playgrad_importteam_bn',
    PlayerGrading_ExportBtn: 'playgrad_export_bn',
  PlayerGrading_CreateTeam: 'playgrad_create_team_bn',
  PlayerGrading_addTeamName: 'playgrad_addTeamname',
    PlayerGrading_unassigned_Players_CheckBox: 'playgrad_unassigned_players_chkbox',
  PlayerGrading_unassigned_Player_CheckBox: 'playgrad_unassigned_chkbox',
  playgrad_Next_bn: 'playgrad_Next_bn',
  playgrad_newTeam_chkbx: 'playgrad_newTeam_chkbx',
    playerGrading_UnassignedPlayersList: 'playerGradingUnassignedPlayersList',
    playerGrading_UnassignedPlayers: 'playerGradingUnassignedPlayers',
    playerGrading_TeamName: 'playerGradingTeamName',
    playerGrading_DeleteTeam: 'playerGradingDeleteTeam',
    playerGrading_TeamExpandCollapse: 'playerGradingTeamExpandCollapse',

    COMPETITION_ICON: 'competitionIcon',
    OWN_COMPETITIONS_MENU: 'ownCompetitions',
    OWN_COMPETITIONS_PLAYER_GRADING: 'own_CompetitionsPlayerGrading',
    PLAYGRAD_COMPNAME_DPDN: 'playgrad_compname_dpdn',
    PLAYGRAD_CREATE_TEAM_BN: 'playgrad_create_team_bn',
    MODAL_FOCUS: 'ant-modal-content',
    CLICK_ALERT: 'ant-btn ant-btn-primary',
    PLAYGRAD_ADD_TEAM_NAME: 'playgrad_addTeamname',
    ADDED_TEAM_NAME: 'playerGradingTeamName',
    DELETE_TEAM_NAME: 'comp-player-table-img team-delete-link pointer',
    PLAYER_GRADING_IMPORT_BN: 'playgrad_import_bn',
    IMPORT_CHOOSE_FILE_BTN: 'import_ChooseFileBtn',
    PLAYER_IMPORT_UPLOAD_BTN: 'playerImport_upload_btn',
    PLAYER_GRADING_UNASSIGNED_PLAYERS: 'col-sm d-flex align-items-center', // 'playerGradingUnassignedPlayers',
    UNASSIGNED_PLAYER_ID: 'year-select-heading pt-0',
    VERIFY_PLAYER_IMPORT: 'ant-message-notice-content',
    PLAYER_COMMENTS: 'player_comments',

    /// / Unique Ids for ImportPlayer /////

  downLoadTempletebtn: 'playerImport_template_btn',
    importChooseFileBtn: 'import_ChooseFileBtn',
  importPlayerBtn: 'playerImport_upload_btn',

  /// / Unique Ids for competitionDashboard ////////

  newCompetitionButton: 'new_competition_button',
  replicateCompetitionButton: 'replic_competition_button',
  ownedCompetition_column_headers_table: 'owned_competition_headers',
  owned_compet_content_table: 'owned_compet_content_table',
  defaultComp_logo_checkbox: 'default_logo_chkbox',
  quickCom_Button: 'quick_competition_button',

  /// / Unique Ids for quickCompetition Page ////////

  add_TimeSlot_Btn: 'qckcomp_addtimeslot_btn',
  add_Div_Grade_Btn: 'qckcomp_addDiv_Grade_btn',

  /// / Unique Ids for registrationCompetitionForm ////////

  select_Venues: 'select_venues',
  add_Venue: 'add_venues',
  comp_type1: 'comp_type1',
  comp_type2: 'comp_type2',
  comp_format1: 'comp_format1',
  comp_format2: 'comp_format2',
  comp_format3: 'comp_format3',
  comp_format4: 'comp_format4',
  comp_start_date: 'compstartDate',
  comp_end_date: 'compendDate',
  time_rounds_days: 'time_rounds_days',
  time_rounds_hrs: 'time_rounds_hrs',
  time_rounds_mins: 'time_rounds_mins',
  add_non_playingdate_button: 'add_non-playingdate_button',
  team_min_players: 'team_min_players',
  team_max_players: 'team_max_players',
  compdiv_savedraft_button: 'compdiv_savedraft_button',
  comp_page1_Next_button: 'comp_page1_Next_button', /// ///
  comp_Division_Publish_button: 'compdiv_publish_button',
  comp_Division_Cancel_button: 'compdiv_cancel_button',
  comp_year_refid: 'comp_year_refid',

  /// / Unique Ids for innerHorizontalMenu for Own Competition Tab ////////

  comp_details_tab: 'comp_details_tab',
  comp_division_tab: 'comp_division_tab',
  own_comp_tab: 'own_comp_tab', /// ///
  quick_comp_subtab: 'quick_comp_subtab',
  comp_details_subtab: 'comp_details_subtab',
  player_grad_subtab: 'player_grad_subtab',
  team_grad_subtab: 'team_grad_subtab',
  timeslots_subtab: 'timeslots_subtab',
  venues_subtab: 'venues_subtab',
  comp_formats_subtab: 'comp_formats_subtab',
  finals_subtab: 'finals_subtab',
  draws_subtab: 'draws_subtab',
  participating_in_comp_tab: 'participating_in_comp_tab',
  playergrad_particip_tab: 'playergrad_particip_tab',
  teamgrad_particip_tab: 'teamgrad_particip_tab',

  /// / Unique Ids for CompetitionDivision ////////

  existing_comp_dropdown: 'existing_comp_dropdown',
  div_gender_chkbox: 'div_gender_chkbox',
  div_gender_refid: 'div_gender_refid',
  div_ageres_chkbox: 'div_ageres_chkbox',
  div_ageres_fromdate: 'div_ageres_fromdate',
  div_ageres_todate: 'div_ageres_todate',
  add_div_button: 'add_div_button',
  compdiv_save_button: 'compdiv_save_button',
  compdiv_cancel_button: 'compdiv_cancel_button',

  /// / Unique Ids for Competition Format ////////

  compYear_DrpDwn: 'compyear_dpdn',
  compName_DrpDwn: 'compname_dpdn',
  comp_Format_Type: 'compformat_radioBn',
  matchType_Selection_dpdn: 'compmatch_type_dpdn',
  competition_Frequency: 'compfreq_inFormat',
  apply_match_format_All_divisions_Checkbox: 'apply_alldiv_ckbx',
  match_Duration: 'matchDuration0',
  timeBetween_Matches: 'timeBetweenGames0',
  divisionStartDate: 'divisionStartDate',
  create_Draft_Draw_Btn: 'compformat_createdraft_draw_btn',

  /// / Unique Ids for Competition Draws ////////

  division_dpdn: 'draw_div_dpdn',
  organisation_dpdn: 'draw_org_dpdn',
  matchList_Btn: 'draw_matchlist_btn',
  editDraw_Btn: 'draw_edit_btn',
  regenrate_Btn: 'draw_regenerate_btn',
  drawsVenueList_dpdn: 'draw_venue_dpdn',
  draw_Publish_btn: 'draw_publish_btn',
  publish_All_Or_PArt_radioBtn: 'drawpublish_all_part_radiobtn',
  main_draws_round_tableview: 'main_draws_round_tableview',
  draw_rounds_dpdn: 'draw_rounds_dpdn',
  apply_date_btn: 'apply_date-btn',
  publish_Past_Matches: 'drawpublish_past_matches_radiobtn',

  /// / Unique Ids for Competition Finals ////////

  final_StartDate: 'finals_start_date',
  final_FixtureTemplate_radioBtn: 'finals_fix_template_radiobtn',
  final_Match_Type_dpdn: 'finals_matchtype_dpdn',
  finals_matchduration: 'finals_matchduration',
  finals_mainbreak: 'finals_mainbreak',
  finals_qtrbreak: 'finals_qtrbreak',
  applyToRefId_radiobtn: 'applyToRefId_radiobtn',
  finals_extratimetype_dpdn: 'finals_extratimetype_dpdn',
  finals_extratime_duration: 'finals_extratime_duration',
  finals_extratime_mainbreak: 'finals_extratime_mainbreak',
  finals_extratime_break: 'finals_extratime_break',
  extratime_ifDraw_radiobtn: 'extratime_ifDraw_radiobtn',

  qckcomp_genFixtures_btn: 'qckcomp_genFixtures_btn',
  qckcomp_addTeams_btn: 'qckcomp_addTeams_btn',

  // import team button
  impPlayerTeam_template_btn: 'impPlayerTeam_template_btn',
  importPlayerTeam_upload_btn: 'importPlayerTeam_upload_btn',

  competitionVenueNextBn: 'competitionVenueNextBn',
  competitionVenueSaveBn: 'competitionVenueSaveBn',
  compnameTextbox: 'compnameTextbox',
  timeBetweenRoundsDays: 'timeBetweenRoundsDays',
  timeBetweenRoundsHrs: 'timeBetweenRoundsHrs',
  timeBetweenRoundsMins: 'timeBetweenRoundsMins',
  compformat_save_btn: 'compformat_save_btn',
  draw_comp_dpdn: 'draw_comp_dpdn',
  finalCreateDrawsBtn: 'final_CreateDraws_Btn',
  compformat_next_btn: 'compformat_next_btn',

  // User affiliate export button
  exportAffiliatesButtonId: 'exp_aff_btn_id',

  // competition flow
  REGISTRATION_ICON: 'registrationIcon',
  USER_PROFILE_ICON: 'userProfileIcon',
  USER_ACCOUNT: 'userAccount',
  NEWCOMPETITION_REGISTRATION: 'newCompetitionRegistration',
  COMPETITION_NAME: 'competitionName',
  COMPETITION_LOGO: 'competitionLogo',
  USE_DEFAULT_COMP_LOGO: 'useDefaultCompetitionLogo',
  SELECT_COMPETITION_VENUE: 'selectCompetitionVenue',
  SELECT_COMPETITION_VENUE_OPTION: 'selectCompetitionVenueOption',
  COMPETITION_START_DATE: 'competitionStartDate',
  COMPETITION_END_DATE: 'competitionEndtDate',
  TIME_BETWEEN_ROUNDS_DAYS: 'timeBetweenRoundsDays',
  REGISTRATION_CLOSE_DATE: 'registrationCloseDate',
  REGISTRATION_INVITEES_2ND_LEVEL_AFFILIATES: 'registrationInvitees2ndLevelAffiliates',
  REGISTRATION_INVITEES_DIRECT: 'registrationInviteesDirect',
  NEXT_BUTTON: 'nextButton',
  MEMBERSHIP_PRODUCT: 'membershipProduct',
  MEMBERSHIP_TYPE: 'membershipType',
  ADD_REGISTRATION_DIVISIONS: 'addRegistrationDivisions',
  DIVISION_NAME: 'divisionName',
  REGISTRATION_RESTRICTION_TYPE: 'registrationRestrictionType',
  INDIVIDUAL_USER_REGISTRATION_FEE: 'IndividualUserRegistrationsFee',
  INDIVIDUAL_SEASONAL_NOMINATION_FEES_GST: 'individualSeasonalNominationFeesGST',
  INDIVIDUAL_SEASONAL_COMPETITION_FEES_GST: 'individualSeasonalCompetitionFeesGST',
  INDIVIDUAL_USER_SINGLE_GAME_FEE: 'individualUserSingleGameFee',
  INDIVIDUAL_USER_SINGLE_GAME_COMPETITION_FEES_GST: 'individualUserSingleGameCompetitionFeeGST',
  TEAM_REGISTRATION_FEE: 'teamRegistrationFee',
  INDIVIDUAL_FEE_CHARGED_PER_PLAYER: 'individualFeeChargedPerPlayer',
  INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED: 'individualFeeChargedPerGamePlayed',
  INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_NOMINATION_GST:
    'individualFeeChargedPerGamePlayedNominationGST',
  INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_COMPETITION_GST:
    'individualFeeChargedPerGamePlayedCompetitionGST',
  PAYMENT_METHOD: 'paymentMethod',
  PAYMENT_TYPE: 'paymentType',
  REGISTRATION_CODE: 'registrationCode',
  TEAM_FEE_PAY_PER_MATCH: 'teamFeePayPerMatch',
  GOVERNMENT_VOUCHERS: 'governmentVouchers',
  INDIVIDUAL_SEASONAL_AFFILIATE_NOMINATION_FEES_GST: 'individualSeasonalAffiliateNominationFeesGST',
  INDIVIDUAL_SEASONAL_AFFILIATE_COMPETITION_FEES_GST:
    'individualSeasonalAffiliateCompetitionFeesGST',
  INDIVIDUAL_USER_SINGLE_GAME_AFFILIATE_COMPETITION_FEES_GST:
    'individualUserSingleGameAffiliateCompetitionFeeGST',
  INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_NOMINATION_GST:
    'individualFeeChargedPerGamePlayedAffiliateNominationGST',
  INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_COMPETITION_GST:
    'individualFeeChargedPerGamePlayedAffiliateCompetitionGST',
  REGISTRATION_OPEN_DATE: 'registrationOpenDate',
    SELECT_DIVISION_NAME: 'selectDivision',
  OPEN_REGISTRATION_BUTTON: 'openRegistrationButton',

    /// competition without registration

  FULL_COMPETITION: 'fullCompetition',
  SELECT_COMPETITION_YEAR: 'selectYear',
  SELECT_COMPETITION_YEAR_OPTION: 'selectYearOption',
  COMPETITION_TYPE: 'competitionType',
  COMPETITION_FORMAT: 'competitionFormat',
  GRADES: 'grades',
  POOLS: 'pools',
  PLAYERS_TO_APPEAR_IN_MATCH_DAY1: 'playersToAppearInMatchDay1',
  PLAYERS_TO_APPEAR_IN_MATCH_DAY2: 'playersToAppearInMatchDay2',
  COMPETITION_ANY_ORGANIZATION_ASSOCIATION: 'orgAssociation',
  COMPETITION_ANY_ORGANIZATION_CLUB: 'orgClub',
  COMPETITION_DETAILS_SUBMENU: 'ownCompetitions_competitionDetails',
  COMPETITION_YEAR_SELECT_BOX: 'year',
  COMPETITION_YEAR_OPTION:'year_',
  REGISTRATION_AREA: 'registrationArea',
  ADD_NON_PLAYING_DATE: 'addNonPlayingDate',
  SELECT_BUTTON: 'select_',
  TEAM_PREFERENCE: 'teamPreference_',
  COMPETITION_DROPDOWN: 'competitionDropDown',
  SELECT_COMPETITION: 'competition_',
  TEAM_PREFERENCE_YES: 'teamPreferenceYes',
  TEAM_PREFERENCE_NO: 'teamPreferenceNo',

    /// / Unique Ids for Record Attendance Per Game ////////

   MATCH_DAY: 'matchDay',
   MENU_SETTINGS: 'settings',
   SUBMENU_SETTINGS: 'settingsView',
   COMPETITION: 'ownedCompetitions',
   CHECKBOX: 'check_',
   ATTENDANCE_REPORT: 'attendanceReport',
   SELECT_ATTENDANCE_REPORT: 'attendanceReport_',
   SETTINGS_SAVE_BUTTON: 'saveSettings',
   MENU_COMPETITION_DETAILS: 'competitionDetails',
   SUBMENU_MATCHES: 'matches',
   ACTIONS_BUTTON: 'actions',
   ADD_MATCH: 'addMatch',
   DATE_PICKER: 'date',
   SELECT_TIME: 'time',
   MATCH_DIVISION: 'division',
   SELECT_DIVISION: 'division_',
   MATCH_TYPE: 'matchType',
   SELECT_HALVES: 'halves',
   MATCH_VENUE: 'matchVenue',
   SELECT_MATCH_VENUE: 'matchVenue_',
   MAIN_BREAK: 'mainBreak',
   MATCH_ID: 'match_',
   STATISTICS_SWITCH: 'statistics',
   BORROW_PLAYER_TEAM1: 'borrowPlayerTeam1',
   BORROW_PLAYER_TEAM2: 'borrowPlayerTeam2',
   ADD_PLAYER_INPUT: 'addPlayer',
   ADD_PLAYER_BUTTON: 'savePlayer',
   ATTENDANCE_SAVE_BUTTON: 'attendanceSave',
   MATCH_DAY_MENU: 'matchDayMenu',
   SUBMENU_TEAM_ATTENDANCE: 'teamAttendance',
   PLAYER_NAME: 'player_',
   SEARCH_INPUT: 'searchInput',
   DELETE_MATCH_BUTTON: 'deleteButton',
   HOME_TEAM: 'homeTeam',
   AWAY_TEAM: 'awayTeam',
   SELECT_HOME_TEAM: 'homeTeam_',
   SELECT_AWAY_TEAM: 'awayTeam_',
   MATCH_ROUND: 'round',
   MATCH_DURATION: 'matchDuration',
   SAVE_MATCH: 'saveMatch',
    SELECT_MATCH_ROUND: 'round_',


    ////Organization settings/////
  USER_ICON: 'user_icon',
  ADMINISTRATORS_MENU: 'administrators_menu',
  OUR_ORGANIZATION_SUBMENU: 'our_organization_submenu',
  ADD_ORGANIZATION_EACH_LEVEL_HIERARCHY: 'addOrganization_eachLevelHierarchy',
  ADD_ORGANIZATION_OUR_ORGANIZATION: 'addOrganisations_ourOrganisations',
  ADD_VENU_EACH_LEVEL_HIERARCHY: 'addVenu_eachLevelHierarchy',
  ADD_VENU_OUR_ORGANIZATION: 'addVenu_ourOrganisations',
  SEE_VENU_ALL_ORGANIZATION: 'seeVenu_allOrganisations',
  SEE_VENU_ONLY_LINKED_ORGANIZATION: 'seeVenu_onlyLinkedOrganisations',
  PLAYER_REPLICATE: 'playerReplicationRules',
  PLAYER_BORROW_BY_COMPETITION_ORGANIZER: 'playerBorrow_CompetitionOrganizer',
  PLAYER_BORROW_STATE_WIDE: 'playerBorrow_StateWide',
  SUBMIT_REGISTRATION_CHANGE_REQUEST: 'submitRegistrationChangeRequest',
  TRANSACTION_FEES_REGISTERING_PARTICIPANT: 'teansactionFees_RegisteringParticipant',
  TRANSACTION_FEES_OUR_ORGANIZATION: 'teansactionFees_OurOrganization',
  UPDATE_ORGANIZATION_SETTINGS: 'update_Settings',


  // account settings
  ACCOUNT_SETTINGS: 'acct_settings_label',
  // personal details email
  PERSONAL_DETAILS_EMAIL: 'email',
  // home module
  HOME_MENU: 'home',

};

export default AppUniqueId;

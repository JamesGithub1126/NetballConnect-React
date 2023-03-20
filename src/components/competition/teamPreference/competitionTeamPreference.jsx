import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Checkbox,
  Button,
  Menu,
  Select,
  Tag,
  Modal,
  Dropdown,
  message,
  TimePicker,
} from 'antd';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Tooltip from 'react-png-tooltip';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import DashboardLayout from '../../../pages/dashboardLayout';
import AppConstants from '../../../themes/appConstants';
import {
  getYearAndCompetitionParticipateAction,
  getYearAndCompetitionOwnAction,
} from '../../../store/actions/appAction';
import {
  getDivisionsListAction,
  clearReducerDataAction,
} from '../../../store/actions/registrationAction/registration';

import {
  setGlobalYear,
  getGlobalYear,
  setParticipating_competition,
  getParticipating_competition,
  getParticipating_competitionStatus,
  setParticipating_competitionStatus,
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  setOwn_CompetitionFinalRefId,
  getOrganisationData,
} from '../../../util/sessionStorage';
import { isArrayNotEmpty, randomKeyGen, isNotNullAndUndefined, uniq } from 'util/helpers';
import { ErrorType, HomeAwayVenuePreference, PreferenceSetBy } from 'util/enums';
import { handleError } from 'util/messageHandler';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';
import ValidationConstants from 'themes/validationConstant';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';

import AppImages from '../../../themes/appImages';
import Loader from '../../../customComponents/loader';
import InputWithHead from '../../../customComponents/InputWithHead';
import history from 'util/history';
import moment from 'moment';
const { Header, Footer, Content } = Layout;
const { Option } = Select;

let this_obj = null;

class CompetitionTeamPreference extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      gradeId: -1,
      firstTimeCompId: '',
      affiliateUniqueKey: -1,
      getDataLoading: false,
      visible: false,
      loading: false,
      competitionDivisionId: null,
      //divisionLoad: false,
      competitionStatus: 0,
      isOrganiserView: true,
      yearList: [],
      competitionList: [],
      gradeList: [],
      affiliateList: [],
      preferenceSetting: {},
      allTeams: [],
      allTeamPreferences: [],
      teamPreferences: [],
      HomeAwayVenuePreferenceList: [
        { id: 0, label: 'No Preference' },
        { id: HomeAwayVenuePreference.Home, label: 'Home' },
        { id: HomeAwayVenuePreference.Away, label: 'Away' },
      ],
      weekDays: [],
    };
    this_obj = this;
  }

  componentDidUpdate(prevProps) {
    let isOrganiserView = this.state.isOrganiserView;
    let competitionList = isOrganiserView
      ? this.props.appState.own_CompetitionArr
      : this.props.appState.participate_CompetitionArr;
    let yearList = isOrganiserView
      ? this.props.appState.own_YearArr
      : this.props.appState.participate_YearArr;
    // const { allDivisionsData } = this.props.registrationState;
    if (prevProps.appState !== this.props.appState) {
      let competitionLoaded = false;
      if (isOrganiserView && prevProps.appState.own_CompetitionArr !== competitionList) {
        competitionLoaded = true;
        competitionList = competitionList.filter(
          x =>
            x.allowTeamPreferences == 1 &&
            x.preferencesSetByRefId == PreferenceSetBy.CompetitionOrganiserToSet,
        );
      } else if (
        !isOrganiserView &&
        prevProps.appState.participate_CompetitionArr !== competitionList
      ) {
        competitionLoaded = true;
        competitionList = competitionList.filter(
          x =>
            x.allowTeamPreferences == 1 &&
            x.preferencesSetByRefId == PreferenceSetBy.AffiliateToSet,
        );
      }
      if (competitionLoaded) {
        const yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
        if (competitionList.length > 0) {
          const { competitionId } = competitionList[0];
          const { statusRefId } = competitionList[0];
          this.setSelectedCompetition(competitionId, statusRefId);
          this.setState({
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            yearRefId: parseInt(yearId),
            isOrganiserView: isOrganiserView,
            yearList: yearList,
            competitionList: competitionList,
          });
          this.getPreferenceSettings(competitionId);
        } else {
          this.setState({
            yearRefId: parseInt(yearId),
            isOrganiserView: isOrganiserView,
            yearList: yearList,
            competitionList: competitionList,
          });
        }
      }
    }
  }

  componentDidMount() {
    const pathname = this.props.location.pathname.toLowerCase();
    let isOrganiserView = pathname == '/competitionpartteampreference' ? false : true;

    const yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    let yearList =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : [];
    let compDataLoaded = false;
    let compData = [];
    if (this.props.appState.own_CompetitionArr.length > 0) {
      compDataLoaded = true;
      compData = this.props.appState.own_CompetitionArr.filter(
        x =>
          x.allowTeamPreferences == 1 &&
          x.preferencesSetByRefId == PreferenceSetBy.CompetitionOrganiserToSet,
      );
    }

    if (!isOrganiserView) {
      storedCompetitionId = getParticipating_competition();
      storedCompetitionStatus = getParticipating_competitionStatus();
      yearList =
        this.props.appState.participate_YearArr.length > 0
          ? this.props.appState.participate_YearArr
          : [];
      if (this.props.appState.participate_CompetitionArr.length > 0) {
        compDataLoaded = true;
        compData = this.props.appState.participate_CompetitionArr.filter(
          x =>
            x.allowTeamPreferences == 1 &&
            x.preferencesSetByRefId == PreferenceSetBy.AffiliateToSet,
        );
      }
    }

    if (storedCompetitionId && yearId && yearList.length > 0 && compDataLoaded) {
      let compExist = compData.find(x => x.competitionId == storedCompetitionId);
      if (!compExist) {
        storedCompetitionId = null;
        storedCompetitionStatus = null;
        if (compData.length > 0) {
          storedCompetitionId = compData[0].competitionId;
          storedCompetitionStatus = compData[0].statusRefId;
        }
      }
      this.setState({
        yearRefId: JSON.parse(yearId),
        firstTimeCompId: storedCompetitionId,
        competitionStatus: storedCompetitionStatus,
        isOrganiserView: isOrganiserView,
        yearList: yearList,
        competitionList: compData,
      });
      if (storedCompetitionId) {
        setTimeout(() => {
          this.getPreferenceSettings(storedCompetitionId);
        }, 10);
      }
    } else {
      this.getCompetitionByYear(isOrganiserView, yearId, yearList);
      if (yearId) {
        this.setState({
          yearRefId: JSON.parse(yearId),
          yearList: yearList,
        });
      }
    }
    this.getCommonReference();
    this.setState({
      isOrganiserView: isOrganiserView,
    });
  }
  getCommonReference = async () => {
    try {
      const result = await CommonAxiosApi.getCommonReference('Day');
      if (result.status === 1) {
        let weekDays = result.result.data;
        if (!isArrayNotEmpty(weekDays)) {
          weekDays = [];
        }
        this.setState({ weekDays });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  getCompetitionByYear = (isOrganiserView, yearId, yearList) => {
    if (isOrganiserView) {
      this.props.getYearAndCompetitionOwnAction(yearList, yearId, 'own_competition');
    } else {
      this.props.getYearAndCompetitionParticipateAction(
        yearList,
        yearId,
        'participate_competition',
      );
    }
  };
  getPreferenceSettings = competitionUniqueKey => {
    this.getCompetitionDivisionGradeList(competitionUniqueKey);
    this.getAffiliateList(competitionUniqueKey);
    //else {

    //   this.getCompetitionTeamList(competitionUniqueKey, organisationUniqueKey);
    // }
  };
  getCompetitionDivisionGradeList = async competitionUniqueKey => {
    try {
      const result = await CompetitionAxiosApi.competitionDivisionGradeList(competitionUniqueKey);
      if (result.status === 1) {
        let gradeList = result.result.data;
        if (!isArrayNotEmpty(gradeList)) {
          gradeList = [];
        }
        gradeList.unshift({ competitionDivisionGradeId: -1, gradeName: 'All' });
        this.setState({ gradeList });
        this.getCompetitionDrawPreference(competitionUniqueKey);
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  getAffiliateList = async competitionUniqueKey => {
    const orgItem = getOrganisationData();
    if (!orgItem) return;
    try {
      const result = await CompetitionAxiosApi.competitionAffiliateList(competitionUniqueKey);
      if (result.status === 1) {
        let affiliateList = result.result.data || [];
        let isOrganiserView = this.state.isOrganiserView;
        let affiliateUniqueKey = -1;
        if (isOrganiserView) {
          if (affiliateList.length > 0) {
            affiliateUniqueKey = affiliateList[0].organisationUniqueKey;
          }
        } else {
          const orgItem = getOrganisationData();
          affiliateUniqueKey = orgItem ? orgItem.organisationUniqueKey : -1;
        }
        if (affiliateList.length > 0) {
          this.populateHomeVenue(affiliateList);
          affiliateList.unshift({
            id: -1,
            name: 'All',
            organisationUniqueKey: -1,
            homeVenues: [this.getNoPreferenceHomeField()],
          });
        }
        this.setState({ affiliateList, affiliateUniqueKey });
        if (isOrganiserView) {
          const orgItem = getOrganisationData();
          if (!orgItem) return;
          this.getOrganiserHomeVenue(orgItem.organisationUniqueKey);
        }
        this.getCompetitionTeamList(competitionUniqueKey, affiliateUniqueKey);
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  getOrganiserHomeVenue = async organisationUniqueKey => {
    try {
      const result = await CompetitionAxiosApi.getOrganisationHomeVenue(organisationUniqueKey);
      if (result.status === 1) {
        let affiliateList = this.state.affiliateList;
        let organisations = result.result.data || [];
        if (organisations.length > 0) {
          this.populateHomeVenue(organisations);
          affiliateList.push(organisations[0]);
          let affiliateUniqueKey = this.state.affiliateUniqueKey;
          if (affiliateUniqueKey == -1) {
            affiliateUniqueKey = organisations[0].organisationUniqueKey;
          }
          this.setState({ affiliateList, affiliateUniqueKey });
        }
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  populateHomeVenue = affiliateList => {
    for (let affiliate of affiliateList) {
      if (!affiliate.homeVenues) {
        affiliate.homeVenues = [];
      }
      let venueIds = uniq(affiliate.homeVenues.map(x => x.venueId));
      for (let venueId of venueIds) {
        let venue = affiliate.homeVenues.find(x => x.venueId == venueId);
        affiliate.homeVenues.unshift({
          venueId: venue.venueId,
          venueShortName: venue.venueShortName,
          venueCourtId: 0,
          venueCourtName: 'All',
        });
      }
      for (let venue of affiliate.homeVenues) {
        venue.id = venue.venueId + '_' + venue.venueCourtId;
        venue.label = venue.venueShortName + '-' + venue.venueCourtName;
      }
      affiliate.homeVenues.unshift(this.getNoPreferenceHomeField());
    }
  };
  getNoPreferenceHomeField = () => {
    return {
      venueId: 0,
      venueShortName: '',
      venueCourtId: 0,
      venueCourtName: '',
      id: '0_0',
      label: 'No Preference',
    };
  };
  getCompetitionDrawPreference = async competitionUniqueKey => {
    try {
      this.setState({ loading: true });
      const result = await CompetitionAxiosApi.competitionDrawPreference(competitionUniqueKey);
      if (result.status === 1) {
        let preferenceSetting = result.result.data || {};
        let enabledGradeIds = [];
        let allGradeIds = this.state.gradeList.map(x => x.competitionDivisionGradeId);
        if (preferenceSetting.round1HomeAndAwayPreference == 1) {
          let selectedGradeIds = allGradeIds;
          if (preferenceSetting.round1HomeAndAwayPreferenceGrades.length > 0) {
            selectedGradeIds = preferenceSetting.round1HomeAndAwayPreferenceGrades;
          }
          enabledGradeIds = enabledGradeIds.concat(selectedGradeIds);
        }
        if (preferenceSetting.competitionDayAndTimePreference == 1) {
          let selectedGradeIds = allGradeIds;
          if (preferenceSetting.competitionDayAndTimePreferenceGrades.length > 0) {
            selectedGradeIds = preferenceSetting.competitionDayAndTimePreferenceGrades;
          }
          enabledGradeIds = enabledGradeIds.concat(selectedGradeIds);
        }
        if (preferenceSetting.homeFieldPreference == 1) {
          let selectedGradeIds = allGradeIds;
          if (preferenceSetting.homeFieldPreferenceGrades.length > 0) {
            selectedGradeIds = preferenceSetting.homeFieldPreferenceGrades;
          }
          enabledGradeIds = enabledGradeIds.concat(selectedGradeIds);
        }
        let gradeList = this.state.gradeList.filter(x =>
          enabledGradeIds.includes(x.competitionDivisionGradeId),
        );
        this.setState({ preferenceSetting, gradeList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };
  getCompetitionTeamList = async (competitionUniqueKey, organisationUniqueKey) => {
    try {
      this.setState({ loading: true });
      const result = await CompetitionAxiosApi.competitionOrganisationTeamList(
        this.state.yearRefId,
        competitionUniqueKey,
        organisationUniqueKey,
      );
      if (result.status === 1) {
        let allTeams = result.result.data || [];
        for (let team of allTeams) {
          if (!team.homeFieldPreference) {
            team.homeFieldPreference = [
              {
                homeVenueId: 0,
                homeCourtId: 0,
              },
            ];
          }
          if (!team.competitionDayAndTimePreference) {
            team.competitionDayAndTimePreference = [];
          }
          team.homeVenueCourtId =
            team.homeFieldPreference[0].homeVenueId + '_' + team.homeFieldPreference[0].homeCourtId;
        }
        let allTeamPreferences = allTeams.filter(x => x.teamPreferenceId > 0);
        let teamPreferences = allTeamPreferences.filter(
          x => x.competitionDivisionGradeId == this.state.gradeId || this.state.gradeId == -1,
        );
        this.setState({ allTeams, allTeamPreferences, teamPreferences });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };
  onYearChange = yearId => {
    setGlobalYear(yearId);
    this.getCompetitionByYear(this.state.isOrganiserView, yearId, this.state.yearList);

    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      affiliateUniqueKey: null,
      gradeId: -1,
      competitionStatus: 0,
      gradeList: [],
      affiliateList: [],
      preferenceSetting: {},
      allTeams: [],
      allTeamPreferences: [],
      teamPreferences: [],
    });
  };
  setSelectedCompetition = (competitionId, statusRefId) => {
    if (this.state.isOrganiserView) {
      setOwn_competition(competitionId);
      setOwn_competitionStatus(statusRefId);
    } else {
      setParticipating_competition(competitionId);
      setParticipating_competitionStatus(statusRefId);
    }
  };

  // on Competition change
  onCompetitionChange(competitionId, statusRefId) {
    this.setSelectedCompetition(competitionId, statusRefId);
    this.setState({
      firstTimeCompId: competitionId,
      gradeId: -1,
      competitionStatus: statusRefId,
      gradeList: [],
      affiliateList: [],
      preferenceSetting: {},
      allTeams: [],
      allTeamPreferences: [],
      teamPreferences: [],
    });
    this.getPreferenceSettings(competitionId);
  }

  //on division change
  onDivisionChange = gradeId => {
    let teamPreferences = this.state.allTeamPreferences.filter(
      x => x.competitionDivisionGradeId == gradeId || gradeId == -1,
    );
    this.setState({ gradeId: gradeId, teamPreferences: teamPreferences });
  };
  onAffiliateChange = affiliateUniqueKey => {
    this.getCompetitionTeamList(this.state.firstTimeCompId, affiliateUniqueKey);
    this.setState({ affiliateUniqueKey: affiliateUniqueKey });
  };
  onTeamChange = (teamId, team) => {
    let teamHasPreference = this.state.allTeamPreferences.find(x => x.teamId == teamId);
    if (teamHasPreference) {
      message.error(AppConstants.noDuplicateTeamPerference);
      return;
    }
    team.teamId = teamId;
    let existTeam = this.state.allTeams.find(x => x.teamId == teamId);
    if (existTeam) {
      team.competitionDivisionGradeId = existTeam.competitionDivisionGradeId;
      team.competitionDivisionId = existTeam.competitionDivisionId;
    }

    this.setState({ updateUI: true });
  };
  onHomeAwayPreferenceChange = (round1HomeAwayPreferenceRefId, team) => {
    team.round1HomeAwayPreferenceRefId = round1HomeAwayPreferenceRefId;
    this.setState({ updateUI: true });
  };
  onHomeFieldChange = (homeVenueCourtId, team) => {
    team.homeVenueCourtId = homeVenueCourtId;
    let courtArray = homeVenueCourtId.split('_');
    team.homeFieldPreference = [
      {
        homeVenueId: courtArray[0],
        homeCourtId: courtArray[1],
      },
    ];
    this.setState({ updateUI: true });
  };
  addTeamPreference = () => {
    let teamPreferences = this.state.teamPreferences;
    let allTeamPreferences = this.state.allTeamPreferences;
    let organisation = this.state.affiliateList.find(
      x => x.organisationUniqueKey == this.state.affiliateUniqueKey,
    );
    let newTeamPreference = {
      teamId: null,
      teamPreferenceId: 0,
      competitionDivisionGradeId: this.state.gradeId,
      round1HomeAwayPreferenceRefId: 0,
      competitionDayAndTimePreference: [],
      homeFieldPreference: [
        {
          homeVenueId: 0,
          homeCourtId: 0,
        },
      ],
      homeVenueCourtId: '0_0',
      organisationId: organisation ? organisation.id : -1,
    };
    teamPreferences.push(newTeamPreference);
    allTeamPreferences.push(newTeamPreference);
    this.setState({ teamPreferences, allTeamPreferences });
  };
  removeTeamPreference = team => {
    let allTeamPreferences = this.state.allTeamPreferences;
    let index = allTeamPreferences.indexOf(team);
    allTeamPreferences.splice(index, 1);
    let teamPreferences = allTeamPreferences.filter(
      x => x.competitionDivisionGradeId == this.state.gradeId || this.state.gradeId == -1,
    );
    this.setState({ teamPreferences, allTeamPreferences });
  };

  handleSavePreferences = async buttonClicked => {
    try {
      for (let preference of this.state.allTeamPreferences) {
        if (!preference.teamId) {
          message.error(AppConstants.selectATeam);
          return;
        }
        if (
          preference.round1HomeAwayPreferenceRefId == 0 &&
          preference.competitionDayAndTimePreference.length == 0 &&
          preference.homeVenueCourtId == '0_0'
        ) {
          message.error(AppConstants.selectATeamPreference);
          return;
        }
        for (let dayPreference of preference.competitionDayAndTimePreference) {
          if (!dayPreference.dayRefId && !dayPreference.startTime && !dayPreference.endTime) {
            message.error(AppConstants.selectDayOrTime);
            return;
          }
          if (dayPreference.startTime && !dayPreference.endTime) {
            message.error(AppConstants.selectEndTime);
            return;
          }
          if (!dayPreference.startTime && dayPreference.endTime) {
            message.error(AppConstants.selectStartTime);
            return;
          }
        }
      }
      this.setState({ loading: true });
      let organisationId = -1;
      let organisation = this.state.affiliateList.find(
        x => x.organisationUniqueKey == this.state.affiliateUniqueKey,
      );
      if (organisation) {
        organisationId = organisation.id;
      }

      let payload = {
        competitionUniqueKey: this.state.firstTimeCompId,
        teamPreferences: this.state.allTeamPreferences,
        organisationId: organisationId,
      };
      const result = await CompetitionAxiosApi.saveTeamPreference(payload);
      if (result.status === 1) {
        message.success(result.result.data.message);
        if (buttonClicked == 'next') {
          history.push('/competitionFormat');
        } else {
          this.getCompetitionTeamList(this.state.firstTimeCompId, this.state.affiliateUniqueKey);
        }
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };
  onWeekDayChange = (dayRefId, dayPreference) => {
    if (!dayRefId) {
      dayRefId = null;
    }
    dayPreference.dayRefId = dayRefId;
    this.setState({ updateUI: true });
  };
  onTimeChange = (time, dayPreference, field) => {
    if (time) {
      let setTime = time.format('HH:mm');
      dayPreference[field] = setTime;
    } else {
      dayPreference[field] = null;
    }
    this.setState({ updateUI: true });
  };
  addAnotherTimeSlot = team => {
    team.competitionDayAndTimePreference.push({
      dayRefId: null,
      startTime: null,
      endTime: null,
    });
    this.setState({ updateUI: true });
  };
  removeTimeSlot = (index, team) => {
    team.competitionDayAndTimePreference.splice(index, 1);
    this.setState({ updateUI: true });
  };
  ///////view for breadcrumb
  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.teamPreferences}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  dropdownView = () => {
    let showAffiliateList = this.state.isOrganiserView && this.state.affiliateList.length > 0;
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row ml-0">
            <div style={{ width: 200 }}>
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  style={{ width: 90 }}
                  className="year-select reg-filter-select-year ml-2"
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={this.state.yearRefId}
                >
                  {this.state.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div style={{ width: 350 }}>
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                  value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                >
                  {this.state.competitionList.map(item => (
                    <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            {showAffiliateList && (
              <div style={{ width: 320 }}>
                <div className="w-ft d-flex flex-row align-items-center">
                  <span className="year-select-heading">{AppConstants.affiliate}:</span>
                  <Select
                    style={{ minWidth: 250 }}
                    className="year-select reg-filter-select1 ml-2"
                    onChange={affiliateUniqueKey => this.onAffiliateChange(affiliateUniqueKey)}
                    value={JSON.parse(JSON.stringify(this.state.affiliateUniqueKey))}
                  >
                    {this.state.affiliateList.map(item => (
                      <Option
                        key={'compAffiliate_' + item.organisationUniqueKey}
                        value={item.organisationUniqueKey}
                      >
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
            <div style={{ width: 300 }}>
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.grade}:</span>
                <Select
                  style={{ minWidth: 250 }}
                  className="year-select reg-filter-select1 ml-2"
                  onChange={gradeId => this.onDivisionChange(gradeId)}
                  value={this.state.gradeId}
                >
                  {this.state.gradeList.map(item => (
                    <Option
                      key={'compGrade_' + item.competitionDivisionGradeId}
                      value={item.competitionDivisionGradeId}
                    >
                      {item.gradeName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => (
    <div className="">
      <div className="pt-3">{this.teamPreferenceView()}</div>
    </div>
  );

  teamPreferenceView = () => {
    const { teamPreferences } = this.state;
    return (
      <div className=" mt-0 ">
        {teamPreferences.map((item, index) => (
          <div className="formView mb-3">
            <div className="team-row">
              <div className="row ">
                <div className="col-sm-3">{AppConstants.team}</div>
                <div className="col-sm-2">{AppConstants.grade}</div>
                <div className="col-sm-3">{AppConstants.homeAwayPreference}</div>
                <div className="col-sm-3">{AppConstants.homeFieldPreference}</div>
                <div className="col-sm-1"></div>
              </div>
              <div key={index}>{this.teamPreferenceListView(item, index)}</div>
            </div>
          </div>
        ))}

        <span
          onClick={this.addTeamPreference}
          style={{ cursor: 'pointer' }}
          className="input-heading-add-another comp-venue-courts-header-view mt-0 pt-0"
        >
          + {AppConstants.addTeam}
        </span>
      </div>
    );
  };

  teamPreferenceListView(team, index) {
    let gradeTeams = this.state.allTeams.filter(
      x =>
        x.teamId > 1 &&
        (x.competitionDivisionGradeId == this.state.gradeId || this.state.gradeId == -1),
    );
    let gradeName = '';
    if (team.competitionDivisionGradeId > 0) {
      let grade = this.state.gradeList.find(
        x => x.competitionDivisionGradeId == team.competitionDivisionGradeId,
      );
      if (grade) {
        gradeName = grade.gradeName;
      }
    }
    let courtList = [];
    let affiliate = this.state.affiliateList.find(x => x.id == team.organisationId);
    if (affiliate) {
      courtList = affiliate.homeVenues;
    }
    let preferenceSetting = this.state.preferenceSetting;
    let round1HomeAndAwayPreferenceEnabled = false;
    if (preferenceSetting.round1HomeAndAwayPreference == 1) {
      if (preferenceSetting.round1HomeAndAwayPreferenceGrades.length > 0) {
        if (team.competitionDivisionGradeId > 0) {
          round1HomeAndAwayPreferenceEnabled =
            preferenceSetting.round1HomeAndAwayPreferenceGrades.includes(
              team.competitionDivisionGradeId,
            );
        }
      } else {
        round1HomeAndAwayPreferenceEnabled = true;
      }
    }
    let competitionDayAndTimePreferenceEnabled = false;
    if (preferenceSetting.competitionDayAndTimePreference == 1) {
      if (preferenceSetting.competitionDayAndTimePreferenceGrades.length > 0) {
        if (team.competitionDivisionGradeId > 0) {
          competitionDayAndTimePreferenceEnabled =
            preferenceSetting.competitionDayAndTimePreferenceGrades.includes(
              team.competitionDivisionGradeId,
            );
        }
      } else {
        competitionDayAndTimePreferenceEnabled = true;
      }
    }
    let homeFieldPreferenceEnabled = false;
    if (preferenceSetting.competitionDayAndTimePreference == 1) {
      if (preferenceSetting.homeFieldPreferenceGrades.length > 0) {
        if (team.competitionDivisionGradeId > 0) {
          homeFieldPreferenceEnabled = preferenceSetting.homeFieldPreferenceGrades.includes(
            team.competitionDivisionGradeId,
          );
        }
      } else {
        homeFieldPreferenceEnabled = true;
      }
    }
    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm-3">
            <Select
              allowClear
              showSearch
              filterOption={(input, option) => {
                if (!option.children) return -1;
                return option.children.toLowerCase().indexOf(input) >= 0;
              }}
              onChange={e => this.onTeamChange(e, team)}
              value={team.teamId}
              className="w-100"
            >
              {gradeTeams.map(item => (
                <Option value={item.teamId} key={'teamId_' + item.teamId}>
                  {item.teamName}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-2 text-v-center" title={gradeName}>
            {gradeName}
          </div>
          <div className="col-sm-3">
            <Select
              allowClear
              onChange={e => this.onHomeAwayPreferenceChange(e, team)}
              value={team.round1HomeAwayPreferenceRefId}
              className="w-100"
              disabled={!round1HomeAndAwayPreferenceEnabled}
            >
              {this.state.HomeAwayVenuePreferenceList.map(item => (
                <Option value={item.id} key={'homeawaypreference_' + item.id}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <Select
              allowClear
              onChange={e => this.onHomeFieldChange(e, team)}
              value={team.homeVenueCourtId}
              className="w-100"
              disabled={!homeFieldPreferenceEnabled}
            >
              {courtList.map(item => (
                <Option value={item.id} key={'homefieldreference_' + item.id}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </div>
          <div
            className="col-sm-1 pointer delete-image-view"
            onClick={() => {
              this.removeTeamPreference(team);
            }}
          >
            <span className="user-remove-btn">
              <i className="fa fa-trash-o" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="inside-container-view mt-3">
          {team.competitionDayAndTimePreference.map((dayPreference, index) =>
            this.addDataTimeSlot(dayPreference, index, team),
          )}

          <span
            className={`input-heading-add-another pt-0 font-15 ${
              competitionDayAndTimePreferenceEnabled ? '' : 'disabled'
            }`}
            onClick={() => competitionDayAndTimePreferenceEnabled && this.addAnotherTimeSlot(team)}
          >
            + {AppConstants.addAnotherDay}
          </span>
        </div>
        {/* <div className='row mt-4'>
        <div className="col-sm-3">{AppConstants.competitionDayTimePreference}</div>
        </div>
        </div> */}
      </div>
    );
  }
  addDataTimeSlot(dayPreference, index, team) {
    let weekDays = this.state.weekDays;

    return (
      <div className="row mb-3" key={index}>
        <div className="ml-3" style={{ width: 200 }}>
          <div className="mb-2">{index == 0 ? AppConstants.dayOfTheWeek : ' '}</div>

          <Select
            allowClear
            style={{ width: '90%' }}
            onChange={dayOfTheWeek => this.onWeekDayChange(dayOfTheWeek, dayPreference)}
            placeholder="Select Week Day"
            value={dayPreference.dayRefId}
          >
            {weekDays.map(item => (
              <Option key={'weekDay_' + item.id} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </div>
        <div className="ml-90" style={{ width: 250 }}>
          <div className="mb-2">{index == 0 ? AppConstants.startTime : ' '}</div>
          <TimePicker
            key="startTime"
            // disabled={disabledStatus}
            className="comp-venue-time-timepicker"
            style={{ width: '90%' }}
            format="HH:mm"
            value={dayPreference.startTime && moment(dayPreference.startTime, 'HH:mm')}
            onChange={time => this.onTimeChange(time, dayPreference, 'startTime')}
            onBlur={e =>
              this.onTimeChange(
                e.target.value && moment(e.target.value, 'HH:mm'),
                dayPreference,
                'startTime',
              )
            }
          />
        </div>
        <div className="ml-90" style={{ width: 250 }}>
          <div className="mb-2">{index == 0 ? AppConstants.endTime : ' '}</div>

          <TimePicker
            // disabled={disabledStatus}

            key="endTime"
            className="comp-venue-time-timepicker"
            style={{ width: '90%' }}
            format="HH:mm"
            value={dayPreference.endTime && moment(dayPreference.endTime, 'HH:mm')}
            onChange={time => this.onTimeChange(time, dayPreference, 'endTime')}
            onBlur={e =>
              this.onTimeChange(
                e.target.value && moment(e.target.value, 'HH:mm'),
                dayPreference,
                'endTime',
              )
            }
          />
        </div>

        <div className="">
          {index == 0 && <div className="mb-2 w-100" style={{ height: 23 }}></div>}
          <div className="pointer d-flex align-items-center" style={{ lineHeight: '41px' }}>
            <span
              className="user-remove-btn"
              onClick={() =>
                // disabledStatus == false &&
                this.removeTimeSlot(index, team)
              }
            >
              <i className="fa fa-trash-o" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    );
  }
  /// ///footer view containing all the buttons like submit and cancel
  footerView = () => {
    //let isPublished = this.state.competitionStatus == 1;
    return (
      <div className="fluid-width footer-view">
        <div className="row">
          <div className="col-sm-3 mt-3">
            <div className="reg-add-save-button">
              <NavLink to="/competitionVenueTimesPrioritisation">
                <Button
                  //disabled={this.state.competitionStatus == 1}
                  className="cancelBtnWidth"
                  type="cancel-button"
                >
                  {AppConstants.back}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="col-sm mt-3">
            <div className="comp-finals-button-view">
              <Button
                style={{
                  height: '100%',
                  borderRadius: 6,
                  width: 'inherit',
                }}
                className="publish-button save-draft-text"
                htmlType="submit"
                type="primary"
                onClick={() => this.handleSavePreferences('save')}
              >
                {AppConstants.save}
              </Button>
              <Button
                //disabled={this.state.competitionStatus == 1}
                className="publish-button margin-top-disabled-button"
                type="primary"
                onClick={() => this.handleSavePreferences('next')}
              >
                {AppConstants.next}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let compSelectedKey = this.state.isOrganiserView ? 'comp_19' : 'comp_20';
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey={compSelectedKey} />
        <Layout>
          {this.headerView()}

          <Content>
            {this.dropdownView()}
            {this.contentView()}
            <Loader visible={this.state.loading || this.props.appState.onLoad} />
          </Content>

          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getYearAndCompetitionOwnAction,
      getYearAndCompetitionParticipateAction,
      getDivisionsListAction,
      clearReducerDataAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    registrationState: state.RegistrationState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionTeamPreference);

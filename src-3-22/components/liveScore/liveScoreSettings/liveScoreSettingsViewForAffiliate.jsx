import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import Tooltip from 'react-png-tooltip';
import { get } from 'lodash';
import {
  Layout,
  Breadcrumb,
  Select,
  Checkbox,
  Button,
  Radio,
  InputNumber,
  Form,
  message,
  Modal,
  Space,
} from 'antd';
import { NavLink } from 'react-router-dom';

import InputWithHead from 'customComponents/InputWithHead';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import AppImages from 'themes/appImages';
import {
  getLiveScoreSettingInitiate,
  onChangeSettingForm,
  onChangeBestAndFairestPointSetting,
  settingDataPostInitiate,
  clearLiveScoreSetting,
  searchVenueList,
  clearFilter,
  settingRegInvitees,
} from 'store/actions/LiveScoreAction/LiveScoreSettingAction';
import Loader from 'customComponents/loader';
import { getLiveScoreCompetition, getOrganisationData } from 'util/sessionStorage';
import { getCompetitionVenuesList } from 'store/actions/LiveScoreAction/liveScoreMatchAction';
import ImageLoader from 'customComponents/ImageLoader';
import history from 'util/history';
import {
  captializedString,
  isImageFormatValid,
  isImageSizeValid,
  checkEnvironment,
} from 'util/helpers';
import { onInviteesSearchAction } from 'store/actions/registrationAction/competitionFeeAction';
import { umpireCompetitionListAction } from 'store/actions/umpireAction/umpireCompetetionAction';
import { getOnlyYearListAction } from 'store/actions/appAction';

import { initializeCompData } from 'store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import { getStateSettingsAction } from 'store/actions/userAction/userAction';
import { getCurrentYear, checkLivScoreCompIsParent } from 'util/permissions';

import {
  isTimeoutsEnabled,
  isFootball,
  isBasketball,
  isNetball,
  getUmpireSequence,
} from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import LiveScoreSettingsTimeoutsFields from 'components/liveScore/liveScoreSettings/liveScoreSettingsTimeoutsFileds';
import LiveScoreSettingsInvitees from 'components/liveScore/liveScoreSettings/components/liveScoreSettingsInvitees';
import BestAndFairestPointSetting from 'components/liveScore/liveScoreSettings/components/bestAndFairestPointSetting';
import ExtraTimeFields from 'components/liveScore/liveScoreSettings/components/extraTimeFields';
import ScoringAssignmentsFields from 'components/liveScore/liveScoreSettings/components/scoringAssignmentsFields';
import {
  applyTo1,
  applyTo2,
  buzzerCheckboxes,
  mediumSelectStyles,
  trackFullPeriod,
} from 'components/liveScore/liveScoreSettings/constants/liveScoreSettingsConstants';
import FoulsFields from 'components/liveScore/liveScoreSettings/components/foulsFields';
import SinBinLengthOfTime from './components/sinBinLengthTime';
import BonusFouls from './components/bonusFouls';
import { BFSettingType, FLAVOUR } from '../../../util/enums';
import { CompBorrowRuleRef, StateBorrowRuleRef } from 'enums/enums';
import { getSuspensionApplyToAction } from '../../../store/actions/commonAction/commonAction';

const { Header, Footer } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const commonFoul = ['removedFromGame', 'sinBin', 'includeInPersonalFouls'];

class LiveScoreSettingsViewForAffiliate extends Component {
  constructor(props) {
    super(props);
    const { location } = props;

    console.log('location', location);
    this.state = {
      profileImage: AppImages.circleImage,
      image: null,
      venueData: [],
      reportSelection: 'Period',
      recordSelection: 'Own',
      competitionFormat: null,
      timeOut: null,
      isEdit: get(location, 'state', null),
      selectedComp: get(location, 'state.selectedComp', null),
      screenName: get(location, 'state.screenName', null),
      edit: get(location, 'state.edit', null),
      competitionId: null,
      yearId: 1,
      yearLoading: false,
      organisationTypeRefId: 0,
      regInvitees: false,
      trackFullPeriod: 0,
      onOkClick: true,
      settingIsIntegrated: false,
    };
    this.formRef = createRef();
    this.showFoulsSettings = AppConstants.flavour !== FLAVOUR.Football && isTimeoutsEnabled;
    this.umpireSequences = getUmpireSequence();
  }

  componentDidMount() {
    const {
      location,
      appState,
      getOnlyYearListAction,
      umpireCompetitionListAction,
      settingRegInvitees,
      clearLiveScoreSetting,
      getLiveScoreSettingInitiate,
      getCompetitionVenuesList,
      getStateSettingsAction,
      getSuspensionApplyToAction,
    } = this.props;
    const { screenName, selectedComp, edit } = this.state;
    const orgData = getOrganisationData();
    const { organisationId } = orgData;

    localStorage.setItem('regInvitees', 'true');
    this.setState({
      organisationTypeRefId: orgData.organisationTypeRefId,
      yearLoading: true,
    });
    getStateSettingsAction(organisationId);
    getOnlyYearListAction(appState.yearList);
    umpireCompetitionListAction(null, null, organisationId);
    getSuspensionApplyToAction();
    this.onInviteeSearch('', 3);
    this.onInviteeSearch('', 4);

    let settingLoaded = false;
    if (screenName === 'umpireDashboard') {
      if (selectedComp !== null) {
        if (edit === 'edit' || selectedComp) {
          settingLoaded = true;
          getLiveScoreSettingInitiate(selectedComp);
        } else {
          clearLiveScoreSetting();
        }
        getCompetitionVenuesList();
      }
    } else {
      const compId = getLiveScoreCompetition();

      if (compId) {
        const { id, recordUmpireType } = JSON.parse(compId);
        const isIntegrated = recordUmpireType === 'USERS';
        this.setState({ settingIsIntegrated: isIntegrated });

        if (location.state === 'edit' || id) {
          settingLoaded = true;
          getLiveScoreSettingInitiate(id);
          getCompetitionVenuesList();
          this.setState({ competitionId: id });
        } else {
          clearLiveScoreSetting();
          getCompetitionVenuesList();
        }
      }
    }
    if (settingLoaded === false) {
      settingRegInvitees();
    }

    if (location.state === 'add') {
      clearLiveScoreSetting();
      getCompetitionVenuesList();

      this.formRef.current.setFieldsValue({
        recordUmpire: undefined,
      });
    }
  }

  componentDidUpdate(nextProps) {
    const { liveScoreSetting, appState, onChangeSettingForm, userState } = this.props;
    const { yearLoading } = this.state;

    if (nextProps.liveScoreSetting !== liveScoreSetting) {
      const { gameTimeTrackingType } = liveScoreSetting.form;

      this.updateFormStateByProps();
      this.setState({
        trackFullPeriod: gameTimeTrackingType,
      });
    }

    if (nextProps.appState !== appState) {
      if (appState.onLoad === false && yearLoading === true) {
        const yearId = appState.yearList.length > 0 ? getCurrentYear(appState.yearList) : null;
        if (appState.yearList.length > 0) {
          onChangeSettingForm({
            key: 'yearRefId',
            data: yearId,
          });
          this.setState({ yearLoading: false });
        }
      }
    }
  }

  updateFormStateByProps = () => {
    const { liveScoreSetting } = this.props;
    const { recordUmpire, form } = liveScoreSetting;

    const {
      competitionName,
      shortName,
      scoring,
      timerType,
      venue,
      attendanceRecordingPeriod,
      attendanceRecordingType,
      whoScoring,
      acceptScoring,
      extraTime,
      extraTimeFor,
      extraTimeType,
      extraTimeDuration,
      extraTimeMainBreak,
      extraTimeQuarterBreak,
      foulsSettings,
      courtScorerUserId,
      umpireSequenceSettings,
    } = form;

    let CoachEnabled = false;
    let ReserveEnabled = false;
    let NumberOfUmpires = null;
    if (umpireSequenceSettings) {
      CoachEnabled = umpireSequenceSettings.CoachEnabled;
      ReserveEnabled = umpireSequenceSettings.ReserveEnabled;
      NumberOfUmpires = umpireSequenceSettings.NumberOfUmpires || null;
    } else {
      //if umpiresequencesetting is null,then indicate that user dont configure it before,so need to apply default value
      CoachEnabled = isNetball || isFootball;
      ReserveEnabled = isNetball;
      NumberOfUmpires = isBasketball || isNetball ? 2 : 3;
    }

    this.formRef.current.setFieldsValue({
      competition_name: competitionName,
      short_name: shortName,
      time: timerType,
      venue,
      scoring,
      recordUmpire,
      attendanceReport: attendanceRecordingPeriod,
      attendanceRecord: attendanceRecordingType,
      whoScoring,
      acceptScoring,
      extraTime,
      extraTimeFor,
      extraTimeType,
      extraTimeDuration,
      extraTimeMainBreak,
      extraTimeQuarterBreak,
      foulsSettings,
      adminUserScoring: courtScorerUserId,
      CoachEnabled,
      ReserveEnabled,
      NumberOfUmpires,
    });
  };

  setImage = data => {
    if (data.files[0] !== undefined) {
      const file = data.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      const imageSizeValid = isImageSizeValid(file.size);
      const isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }
      this.setState({
        image: data.files[0],
        profileImage: URL.createObjectURL(data.files[0]),
        timeout: 2000,
      });
      setTimeout(() => {
        this.setState({ timeout: null });
      }, 2000);
      const imgData = URL.createObjectURL(data.files[0]);
      this.props.onChangeSettingForm({
        key: 'competitionLogo',
        data: data.files[0],
      });
      this.props.onChangeSettingForm({ key: 'Logo', data: imgData });
    }
  };

  selectImage = () => {
    const fileInput = document.getElementById('user-pic');
    if (!fileInput) return;

    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    fileInput.click();
  };

  getRecordingTime(days = 0, hours = 0, minutes = 0) {
    const dayToMinutes = days * 24 * 60;
    const hoursToMinutes = hours * 60;
    const totalMinutes = dayToMinutes + hoursToMinutes + +minutes;

    return totalMinutes;
  }

  handleInputChange = e => {
    this.props.onChangeSettingForm({
      key: e.target.name,
      data: e.target.value,
    });
  };

  handleCheckBoxChange = (fieldKey, value) => {
    const isIntegrated = fieldKey === 'recordUmpire' && value === 'USERS';
    this.setState({ settingIsIntegrated: isIntegrated });

    this.handleInputChange({
      target: {
        name: fieldKey,
        value,
      },
    });

    if (!isIntegrated) {
      this.props.onChangeSettingForm({
        key: 'acceptScoring',
        data: 'SCORER',
      });
    }
  };

  handleFoulSettingChange = value => {
    const { foulsSettings } = this.props.liveScoreSetting.form;
    const newFoulsSettings = this.removeUndefinedFromObject({ ...foulsSettings, ...value });
    this.handleInputChange({
      target: {
        name: 'foulsSettings',
        value: newFoulsSettings,
      },
    });
  };

  handleSubmit = () => {
    const {
      id,
      competitionName,
      shortName,
      competitionLogo,
      scoring,
      record1,
      record2,
      attendanceRecordingType,
      attendanceRecordingPeriod,
      timerType,
      venue,
      days,
      hours,
      minutes,
      lineupSelectionDays,
      lineupSelectionHours,
      lineupSelectionMins,
      timeouts,
      whoScoring,
      acceptScoring,
      additionalTime,
      extraTime,
      extraTimeFor,
      extraTimeType,
      extraTimeDuration,
      extraTimeMainBreak,
      extraTimeQuarterBreak,
      foulsSettings,
      isPublicStats,
      courtScorerUserId,
    } = this.props.liveScoreSetting.form;

    const {
      data,
      buzzerEnabled,
      warningBuzzerEnabled,
      recordUmpire,
      invitedTo,
      lineupSelection,
      allowAffiliatesEnterScore,
      borrowedPlayer,
      gamesBorrowedThreshold,
      linkedCompetitionId,
      yearRefId,
      invitedAnyAssoc,
      invitedAnyClub,
      associationChecked,
      clubChecked,
      associationLeague,
      clubSchool,
      radioSelectionArr,
      invitedAnyAssocArr,
      invitedAnyClubArr,
      compBorrowRuleRefId,
      bestAndFairestSettings,
    } = this.props.liveScoreSetting;

    let formvalues = this.formRef.current.getFieldsValue();
    const { CoachEnabled = false, ReserveEnabled = false, NumberOfUmpires = 0, AllowHomeTeamManagerToVerifyOfficials = false } = formvalues;

    let invitedToValue = null;
    let assocValue = null;
    let clubValue = null;
    let selectionValue = null;

    let umpireSequenceSettings = {
      CoachEnabled: CoachEnabled,
      ReserveEnabled: ReserveEnabled,
      NumberOfUmpires: NumberOfUmpires,
      AllowHomeTeamManagerToVerifyOfficials,
    };
    if (JSON.stringify(radioSelectionArr) === JSON.stringify(invitedTo)) {
      invitedToValue = false;
    } else {
      invitedToValue = true;
    }

    if (invitedAnyAssoc.length > 0) {
      if (JSON.stringify(invitedAnyAssocArr) === JSON.stringify(invitedAnyAssoc)) {
        assocValue = false;
      } else {
        assocValue = true;
      }
    }

    if (invitedAnyClub.length > 0) {
      if (JSON.stringify(invitedAnyClubArr) === JSON.stringify(invitedAnyClub)) {
        clubValue = false;
      } else {
        clubValue = true;
      }
    }

    selectionValue = invitedToValue || assocValue || clubValue || '';
    localStorage.setItem('yearId', yearRefId);

    const gameTimeTracking = isFootball || record2.includes('gameTimeTracking');
    const enhancedStatistics = record1.includes('enhancedStatistics');
    const positionTracking = record1.includes('positionTracking');
    const recordGoalAttempts = record1.includes('recordGoalAttempts');
    const centrePassEnabled = record2.includes('centrePassEnabled');
    const incidentsEnabled = record2.includes('incidentsEnabled');
    const gameTimeTrackingType = gameTimeTracking && this.state.trackFullPeriod;
    const attendenceRecordingTime = this.getRecordingTime(days, hours, minutes);
    let lineUpSelectionTime = null;
    if (lineupSelection) {
      lineUpSelectionTime = this.getRecordingTime(
        lineupSelectionDays,
        lineupSelectionHours,
        lineupSelectionMins,
      );
    }

    let orgId = null;
    if (this.props.location.state === 'add') {
      const { organisationId } = getOrganisationData() || {};
      orgId = organisationId;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('longName', captializedString(competitionName));
    formData.append('name', captializedString(shortName));
    formData.append('logo', competitionLogo);
    formData.append('recordUmpireType', recordUmpire);
    formData.append('enhancedStatistics', enhancedStatistics);
    formData.append('gameTimeTracking', gameTimeTracking);
    formData.append('positionTracking', positionTracking);
    formData.append('recordGoalAttempts', recordGoalAttempts);
    formData.append('centrePassEnabled', centrePassEnabled);
    formData.append('incidentsEnabled', incidentsEnabled);
    formData.append('attendanceRecordingType', attendanceRecordingType);
    formData.append('attendanceRecordingPeriod', attendanceRecordingPeriod);
    formData.append('scoringType', scoring);
    formData.append('timerType', timerType);
    formData.append('organisationId', orgId || data.organisationId);
    formData.append('buzzerEnabled', buzzerEnabled);
    formData.append('warningBuzzerEnabled', warningBuzzerEnabled);
    formData.append('playerBorrowingType', borrowedPlayer);
    formData.append('gamesBorrowedThreshold', gamesBorrowedThreshold);
    formData.append('linkedCompetitionId', linkedCompetitionId);
    formData.append('yearRefId', yearRefId);
    formData.append('isInvitorsChanged', selectionValue.toString());
    formData.append('timeoutDetails', JSON.stringify(timeouts));
    formData.append('whoScoring', whoScoring);
    formData.append('acceptScoring', acceptScoring);
    formData.append('extraTime', extraTime);
    formData.append('additionalTime', additionalTime);
    formData.append('extraTimeFor', extraTimeFor);
    formData.append('extraTimeType', extraTimeType);
    formData.append('extraTimeDuration', extraTimeDuration);
    formData.append('extraTimeMainBreak', extraTimeMainBreak);
    formData.append('extraTimeQuarterBreak', extraTimeQuarterBreak);
    formData.append('compBorrowRuleRefId', compBorrowRuleRefId);
    formData.append('isPublicStats', isPublicStats);
    formData.append('courtScorerUserId', whoScoring === 'COURT' ? courtScorerUserId : null);
    formData.append('umpireSequenceSettings', JSON.stringify(umpireSequenceSettings));

    const bfsettings = [...bestAndFairestSettings];
    bfsettings.forEach(setting => {
      if (setting.receivePoints) {
        if (setting.receivePoints.length > setting.receivePointPlayers) {
          setting.receivePoints = setting.receivePoints.slice(0, setting.receivePointPlayers);
        }
        setting.receivePoints = setting.receivePoints.join(',');
      }
    });
    formData.append('bestAndFairests', JSON.stringify(bfsettings));

    if (foulsSettings && isTimeoutsEnabled && AppConstants.flavour === FLAVOUR.Football) {
      let foulKeys = Object.keys(foulsSettings);
      commonFoul.forEach(key => {
        foulKeys.includes(key) && delete foulsSettings[key];
      });
      foulsSettings.sendoffReport = [{ type: 'RC', value: '1' }];
    }

    formData.append('foulsSettings', JSON.stringify(foulsSettings));

    if (attendenceRecordingTime) {
      formData.append('attendanceSelectionTime', attendenceRecordingTime);
    }
    if (gameTimeTracking !== false) {
      formData.append('gameTimeTrackingType', gameTimeTrackingType);
    }
    if (lineupSelection) {
      formData.append('lineupSelectionEnabled', lineupSelection);
      formData.append('lineupSelectionTime', lineUpSelectionTime);
    }
    formData.append('allowAffiliatesEnterScore', allowAffiliatesEnterScore);

    const invitedToArr = invitedTo.slice(0);
    formData.append('invitedTo', JSON.stringify(invitedToArr));
    if (invitedAnyAssoc.length > 0) {
      formData.append('invitedAnyAssoc', JSON.stringify(invitedAnyAssoc));
    }
    if (invitedAnyClub.length > 0) {
      formData.append('invitedAnyClub', JSON.stringify(invitedAnyClub));
    }

    if (invitedTo.length === 0) {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });

      message.error(ValidationConstants.pleaseSelectRegInvitees, 1.5);
      localStorage.setItem('regInvitees', 'false');
    } else if (associationChecked === true || clubChecked === true) {
      if (associationChecked === true && clubChecked === true) {
        if (associationLeague.length === 0 || clubSchool.length === 0) {
          message.config({
            duration: 1.5,
            maxCount: 1,
          });
          message.error(ValidationConstants.pleaseSelectOrg, 1.5);
          localStorage.setItem('regInvitees', 'false');
        } else {
          localStorage.setItem('regInvitees', 'true');
        }
      } else if (associationChecked === true) {
        if (associationLeague.length === 0) {
          message.config({
            duration: 1.5,
            maxCount: 1,
          });
          message.error(ValidationConstants.pleaseSelectOrg, 1.5);
          localStorage.setItem('regInvitees', 'false');
        } else {
          localStorage.setItem('regInvitees', 'true');
        }
      } else if (clubChecked === true) {
        if (clubSchool.length === 0) {
          message.config({
            duration: 1.5,
            maxCount: 1,
          });
          message.error(ValidationConstants.pleaseSelectOrg, 1.5);
          localStorage.setItem('regInvitees', 'false');
        } else {
          localStorage.setItem('regInvitees', 'true');
        }
      }
    } else {
      localStorage.setItem('regInvitees', 'true');
    }

    const regInvitees = localStorage.getItem('regInvitees');
    if (regInvitees === 'true') {
      localStorage.setItem('regInvitees', 'false');
      this.props.initializeCompData();
      this.props.settingDataPostInitiate({
        body: formData,
        venue,
        settingView: this.props.location.state,
        screenName: this.state.screenName ? this.state.screenName : 'liveScore',
        competitionId: this.state.competitionId,
        isEdit: this.state.isEdit,
      });
    }
  };

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex bg-transparent align-items-center">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">{AppConstants.settings}</Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

  handleSearch = (value, data) => {
    const filteredData = data.filter(
      memo => memo.venueName.toLowerCase().indexOf(value.toLowerCase()) > -1,
    );
    this.props.searchVenueList(filteredData);
  };

  // On selection of venue
  onSelectValues(value) {
    this.props.onChangeSettingForm({ key: 'venue', data: value });
    this.props.clearFilter();
  }

  onChangeLineUpSelection(data, checkPositionTrackingEnabled) {
    let posTracking = false;

    for (const i in checkPositionTrackingEnabled) {
      if (checkPositionTrackingEnabled[i] === 'positionTracking') {
        posTracking = true;
        break;
      }
    }

    if (posTracking || isBasketball) {
      this.props.onChangeSettingForm({ key: 'lineupSelection', data });
    } else {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.warn(AppConstants.lineUpSelectionMsg);
    }
  }

  onChangeAllowHomeAffiliatesToEnterScores(data) {
    this.props.onChangeSettingForm({ key: 'allowAffiliatesEnterScore', data });
  }

  differentPositionTracking = (options, selectedOption) => {
    if (options.value === 'gameTimeTracking' && selectedOption.includes('gameTimeTracking')) {
      return (
        <div className="pt-4">
          <Select
            style={mediumSelectStyles}
            onChange={val => this.handleCheckBoxChange('gameTimeTrackingType', val)}
            value={this.state.trackFullPeriod}
            placeholder={AppConstants.selectCompetition}
          >
            {trackFullPeriod.map(item => (
              <Option key={`trackFullPeriod_${item.value}`} value={item.value}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      );
    }
  };

  timeoutsView = () => {
    if (!isTimeoutsEnabled) return null;
    const { timeouts } = this.props.liveScoreSetting.form;
    const isTimeoutsChecked = !!timeouts;

    const handleTimeoutsChange = () => {
      this.props.onChangeSettingForm({
        key: 'timeouts',
        data: isTimeoutsChecked ? null : {},
      });
    };

    return (
      <>
        <InputWithHead
          conceptulHelp
          conceptulHelpMsg={AppConstants.timeouts}
          marginTop={0}
          heading={AppConstants.timeouts}
        />
        <div className="row mt-0 ml-1">
          <Checkbox
            className="single-checkbox d-flex justify-content-center"
            onChange={() => handleTimeoutsChange()}
            checked={isTimeoutsChecked}
          >
            {AppConstants.timeouts}
          </Checkbox>
        </div>

        <LiveScoreSettingsTimeoutsFields
          isVisible={isTimeoutsChecked}
          values={this.props.liveScoreSetting.form}
          onFormChange={this.props.onChangeSettingForm}
          onInviteesChange={this.props.onChangeSettingForm}
          openModel={this.openModel}
          formRef={this.formRef.current}
        />
      </>
    );
  };

  removeUndefinedFromObject = obj => {
    for (let key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }
    return obj;
  };

  contentView = () => {
    const { liveScoreSetting, umpireCompetitionState, appState } = this.props;
    const {
      lineupSelection,
      allowAffiliatesEnterScore,
      premierCompLink,
      borrowedPlayer,
      compBorrowRuleRefId,
      gamesBorrowedThreshold,
      linkedCompetitionId,
      disabled,
      yearRefId,
    } = liveScoreSetting;
    const {
      days,
      hours,
      minutes,
      lineupSelectionDays,
      lineupSelectionHours,
      lineupSelectionMins,
      record1,
      record2,
      venue,
      Logo,
      timerType,
      additionalTime,
      extraTime,
      extraTimeType,
      extraTimeDuration,
      extraTimeMainBreak,
      extraTimeQuarterBreak,
      scoring,
      whoScoring,
      acceptScoring,
      foulsSettings,
      isPublicStats,
    } = liveScoreSetting.form;

    const {
      removedFromGame,
      sendoffReport,
      sinBin,
      includeInPersonalFouls,
      sinBinLengthOfTime,
      teamFouls,
    } = foulsSettings || {};

    const foulsFeildsSetting = this.removeUndefinedFromObject({
      removedFromGame,
      sendoffReport,
      sinBin,
      includeInPersonalFouls,
    });
    const { stateSettings } = this.props.userState;
    const sinBinLengthOfTimeSetting = this.removeUndefinedFromObject({ sinBinLengthOfTime });
    const teamFoulsSetting = this.removeUndefinedFromObject({ teamFouls });

    const competition = get(umpireCompetitionState, 'umpireComptitionList', []);

    const showWholeScoringSection =
      checkEnvironment('REACT_APP_SCORING_ASSIGNMENTS_FIELDS_ENABLED', 1) ||
      checkEnvironment('REACT_APP_SCORING_VERIFICATION_FIELDS_ENABLED', 1);

    const { suspensionApplyToList } = this.props;

    return (
      <div>
        <div className="formView content-view pt-4 mb-5">
          <span className="text-heading-large pt-5">{AppConstants.ourOrganisationAwards}</span>
          <BestAndFairestPointSetting
            typeRefId={BFSettingType.ORGANISATION_AWARD}
            settingIsIntegrated={this.state.settingIsIntegrated}
            onFormChange={this.props.onChangeBestAndFairestPointSetting}
          />
        </div>
      </div>
    );
  };

  /// / On change Invitees
  onInviteesChange(value) {
    this.props.onChangeSettingForm({ key: 'anyOrgSelected', data: value });
    if (value === 7) {
      this.onInviteeSearch('', 3);
    } else if (value === 8) {
      this.onInviteeSearch('', 4);
    }
  }

  onInviteeSearch = (value, inviteesType) => {
    this.props.onInviteesSearchAction(value, inviteesType);
  };

  /// /////reg invitees search view for any organisation
  associationSearchInvitee = () => {
    const detailsData = this.props.competitionFeesState;
    const associationAffiliates = detailsData.associationAffilites;
    const { associationLeague } = this.props.liveScoreSetting;
    const disabledComponent =
      (this.state.isEdit === 'edit' || this.state.edit === 'edit') && this.state.onOkClick;
    return (
      <div className="col-sm ml-3">
        <Select
          mode="multiple"
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          onChange={associationAffiliate => {
            this.props.onChangeSettingForm({
              key: 'associationAffilite',
              data: associationAffiliate,
            });
          }}
          value={associationLeague}
          placeholder={AppConstants.selectOrganisation}
          filterOption={false}
          onSearch={value => {
            this.onInviteeSearch(value, 3);
          }}
          showSearch
          onBlur={() => this.onInviteeSearch('', 3)}
          disabled={disabledComponent}
        >
          {associationAffiliates.map(item => (
            <Option key={`organisation_${item.id}`} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  /// /////reg invitees search view for any organisation
  clubSearchInvitee = () => {
    const detailsData = this.props.competitionFeesState;
    const clubAffiliates = detailsData.clubAffilites;
    const { clubSchool } = this.props.liveScoreSetting;
    const disabledComponent =
      (this.state.isEdit === 'edit' || this.state.edit === 'edit') && this.state.onOkClick;
    return (
      <div className="col-sm ml-3">
        <Select
          mode="multiple"
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          onChange={clubAffiliate => {
            this.props.onChangeSettingForm({
              key: 'clubAffilite',
              data: clubAffiliate,
            });
          }}
          value={clubSchool}
          placeholder={AppConstants.selectOrganisation}
          filterOption={false}
          onSearch={value => {
            this.onInviteeSearch(value, 4);
          }}
          onBlur={() => this.onInviteeSearch('', 4)}
          disabled={disabledComponent}
        >
          {clubAffiliates.map(item => (
            <Option key={`organisation_${item.id}`} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  openModel = () => {
    const this_ = this;
    confirm({
      title: AppConstants.editOrganisationMessage,
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      maskClosable: true,
      onOk() {
        this_.setState({ onOkClick: false });
      },
      onCancel() {
        this_.setState({ onOkClick: true });
      },
    });
  };

  /// ///footer view containing all the buttons like submit and cancel
  footerView = () => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm" />
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button
                disabled={this.props.liveScoreSetting.loader}
                htmlType="submit"
                className="publish-button"
                type="primary"
              >
                {AppConstants.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  onYearClick(yearRefId) {
    this.setState({ yearRefId });
    this.props.onChangeSettingForm({ key: 'yearRefId', data: yearRefId });
  }

  onFinishFailed = () => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  render() {
    const { screenName, isEdit } = this.state;
    const { editLoader, loader } = this.props.liveScoreSetting;
    const isUmpireDashboardScreen = screenName === 'umpireDashboard';
    const localId = isUmpireDashboardScreen ? null : getLiveScoreCompetition();
    const isEditMode = isEdit === 'edit';
    const isVisibleLoader = isEditMode ? editLoader : loader;

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={isUmpireDashboardScreen ? AppConstants.umpires : AppConstants.matchDay}
          menuName={isUmpireDashboardScreen ? AppConstants.umpires : AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        {localId && <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="18" />}
        <Loader visible={isVisibleLoader} />

        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.handleSubmit}
            onFinishFailed={this.onFinishFailed}
            noValidate="noValidate"
          >
            {this.contentView()}
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    liveScoreSetting: state.LiveScoreSetting,
    venueList: state.LiveScoreMatchState,
    competitionFeesState: state.CompetitionFeesState,
    umpireCompetitionState: state.UmpireCompetitionState,
    appState: state.AppState,
    suspensionApplyToList: state.CommonReducerState.suspensionApplyToList,
  };
}

export default connect(mapStateToProps, {
  clearLiveScoreSetting,
  getLiveScoreSettingInitiate,
  onChangeSettingForm,
  onChangeBestAndFairestPointSetting,
  getCompetitionVenuesList,
  settingDataPostInitiate,
  searchVenueList,
  clearFilter,
  onInviteesSearchAction,
  settingRegInvitees,
  umpireCompetitionListAction,
  getOnlyYearListAction,
  initializeCompData,
  getStateSettingsAction,
  getSuspensionApplyToAction,
})(LiveScoreSettingsViewForAffiliate);

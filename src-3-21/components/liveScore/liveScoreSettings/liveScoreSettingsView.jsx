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
  isArrayNotEmpty,
  isImageFormatValid,
  isImageSizeValid,
  checkEnvironment,
} from 'util/helpers';
import { onInviteesSearchAction } from 'store/actions/registrationAction/competitionFeeAction';
import { umpireCompetitionListAction } from 'store/actions/umpireAction/umpireCompetetionAction';
import { getOnlyYearListAction } from 'store/actions/appAction';

import { initializeCompData } from 'store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import {
  getStateOrganisationsAction,
  getStateSettingsAction,
} from 'store/actions/userAction/userAction';
import { getCurrentYear, checkLivScoreCompIsParent } from 'util/permissions';

import {
  isTimeoutsEnabled,
  isFootball,
  isBasketball,
  isNetball,
  getUmpireSequence,
  getMatchOfficialSequence,
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
  gameTimeListFilter,
} from 'components/liveScore/liveScoreSettings/constants/liveScoreSettingsConstants';
import FoulsFields from 'components/liveScore/liveScoreSettings/components/foulsFields';
import AppUniqueId from 'themes/appUniqueId';
import SinBinLengthOfTime from './components/sinBinLengthTime';
import BonusFouls from './components/bonusFouls';
import PlayerNumbersSetting from './components/playerNumbersSetting';
import { BFSettingType, FLAVOUR, RECORDUMPIRETYPE } from '../../../util/enums';
import { CompBorrowRuleRef, StateBorrowRuleRef, ScoringType, WhoScoring } from 'enums/enums';
import { getSuspensionApplyToAction } from '../../../store/actions/commonAction/commonAction';
import { isNotNullAndUndefined } from 'util/helpers';
import MatchOfficialSettings from './liveScoreMatchOfficials';
import InputNumberWithHead from 'customComponents/InputNumberWithHead';
import AllowForfeitSetting from './components/AllowForfeitSetting';

const { Header, Footer } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const commonFoul = ['removedFromGame', 'includeInPersonalFouls'];

class LiveScoreSettingsView extends Component {
  constructor(props) {
    super(props);
    const { location } = props;

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
      clearUmpireSettings: false,
    };
    this.formRef = createRef();
    this.showFoulsSettings = AppConstants.flavour !== FLAVOUR.Football && isTimeoutsEnabled;
    this.umpireSequences = getUmpireSequence();
    this.matchOfficialSequences = getMatchOfficialSequence();
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
      getStateOrganisationsAction,
      getSuspensionApplyToAction,
    } = this.props;
    const { screenName, selectedComp, edit } = this.state;
    const orgData = getOrganisationData();
    const { organisationId, organisationUniqueKey } = orgData;

    localStorage.setItem('regInvitees', 'true');
    this.setState({
      organisationTypeRefId: orgData.organisationTypeRefId,
      yearLoading: true,
    });
    getStateSettingsAction(organisationId);
    getStateOrganisationsAction(organisationUniqueKey);
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
      const { gameTimeTrackingType, gameTimeTracking } = liveScoreSetting.form;

      this.updateFormStateByProps();
      this.setState({
        trackFullPeriod: isFootball ? gameTimeTracking : gameTimeTrackingType,
        gameTimeTracking: isFootball ? gameTimeTracking : gameTimeTracking,
      });

      this.setState({
        lockAttendanceMinutesChecked: liveScoreSetting.lockAttendanceMinutesChecked,
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
    const { userDashboardTextualList } = this.props.userState;

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
      compBorrowRuleRefId,
      separateAttendance,
      willSupershotBeRecorded,
      premierCompetitionSuspension,
      officialOrganisationId,
    } = form;

    let CoachEnabled = false;
    let ReserveEnabled = false;
    let AnyoneCanBeUmpire = false;
    let NumberOfUmpires = null;
    let AllowHomeTeamManagerToVerifyOfficials = false;
    let NumberOfOfficials = null;
    if (umpireSequenceSettings) {
      CoachEnabled = umpireSequenceSettings.CoachEnabled;
      ReserveEnabled = umpireSequenceSettings.ReserveEnabled;
      AnyoneCanBeUmpire =
        recordUmpire === RECORDUMPIRETYPE.Users && umpireSequenceSettings.AnyoneCanBeUmpire;
      NumberOfUmpires = umpireSequenceSettings.NumberOfUmpires || null;
      AllowHomeTeamManagerToVerifyOfficials =
        umpireSequenceSettings.AllowHomeTeamManagerToVerifyOfficials;
      NumberOfOfficials = umpireSequenceSettings.NumberOfOfficials;
    } else {
      //if umpiresequencesetting is null,then indicate that user dont configure it before,so need to apply default value
      CoachEnabled = isNetball || isFootball;
      ReserveEnabled = isNetball;
      AnyoneCanBeUmpire = false;
      NumberOfUmpires = isBasketball || isNetball ? 2 : 3;
      AllowHomeTeamManagerToVerifyOfficials = false;
    }

    const adminUserScoring =
      courtScorerUserId !== null
        ? courtScorerUserId
        : userDashboardTextualList !== null && userDashboardTextualList.length > 0
        ? userDashboardTextualList[0].userId
        : null;

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
      adminUserScoring,
      courtScorerUserId,
      CoachEnabled,
      ReserveEnabled,
      AnyoneCanBeUmpire,
      NumberOfUmpires,
      NumberOfOfficials,
      AllowHomeTeamManagerToVerifyOfficials,
      officialOrganisationId: officialOrganisationId ?? null,
      compBorrowRuleRefId,
      separateAttendance,
      willSupershotBeRecorded,
      premierCompetitionSuspension,
    });

    if (
      whoScoring === WhoScoring.Court &&
      !courtScorerUserId &&
      courtScorerUserId !== adminUserScoring
    ) {
      this.props.onChangeSettingForm({
        key: 'adminUserScoring',
        data: adminUserScoring,
      });
    }
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

  handleIntegratedSetting = (fieldKey, value) => {
    if (fieldKey === 'recordUmpire') {
      if (value === RECORDUMPIRETYPE.None) {
        this.setState({ clearUmpireSettings: true });
      }
      const isIntegrated = value === 'USERS';
      this.setState({ settingIsIntegrated: isIntegrated });

      if (!isIntegrated) {
        this.props.onChangeSettingForm({
          key: 'acceptScoring',
          data: 'SCORER',
        });
      }
    }
  };

  handleCheckBoxChange = (fieldKey, value) => {
    const { recordUmpire, form } = this.props.liveScoreSetting;

    this.handleInputChange({
      target: {
        name: fieldKey,
        value,
      },
    });

    if (fieldKey === 'separateAttendance' && value === false) {
      this.handleInputChange({
        target: {
          name: 'willSupershotBeRecorded',
          value,
        },
      });
      this.handleInputChange({
        target: {
          name: 'timeouts',
          value: {},
        },
      });
      this.handleInputChange({
        target: {
          name: 'premierCompetitionSuspension',
          value,
        },
      });
    }
    if (
      fieldKey === 'recordUmpire' &&
      recordUmpire === 'USERS' &&
      value !== 'USERS' &&
      form.scoring === 'NO_SCORING_CARD'
    ) {
      this.openUmpireSettingModel(fieldKey, value);
      return;
    }

    this.handleIntegratedSetting(fieldKey, value);
  };

  handleFoulSettingChange = value => {
    value.recordOffenceCodes = true;
    const { foulsSettings } = this.props.liveScoreSetting.form;
    const newFoulsSettings = this.removeUndefinedFromObject({ ...foulsSettings, ...value });
    this.handleInputChange({
      target: {
        name: 'foulsSettings',
        value: newFoulsSettings,
      },
    });
  };

  isSeparateAttendanceChecked = () => {
    if (isNetball) {
      return this.props.liveScoreSetting.form.separateAttendance;
    }
    return false;
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
      compBorrowRuleRefId,
      pointScheme,
      attendanceMinutesDays,
      attendanceMinuteHours,
      lockAttendanceMinutes,
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
      bestAndFairestSettings,
      enableMatchOfficialRecording,
      matchOfficialRecordRoles,
      allowMaximumAttendance,
      allowMaximumLineup,
      maximumAttendance,
      maximumLineup,
      lockAttendanceMinutesChecked,
      allowForfeit,
    } = this.props.liveScoreSetting;

    let formvalues = this.formRef.current.getFieldsValue();
    const {
      CoachEnabled = false,
      ReserveEnabled = false,
      AnyoneCanBeUmpire = false,
      NumberOfUmpires = 0,
      AllowHomeTeamManagerToVerifyOfficials = false,
      NumberOfOfficials = 0,
      officialOrganisationId,
    } = formvalues;

    let invitedToValue = null;
    let assocValue = null;
    let clubValue = null;
    let selectionValue = null;

    let umpireSequenceSettings = {
      CoachEnabled: CoachEnabled,
      ReserveEnabled: ReserveEnabled,
      AnyoneCanBeUmpire: AnyoneCanBeUmpire,
      NumberOfUmpires: NumberOfUmpires,
      AllowHomeTeamManagerToVerifyOfficials,
      NumberOfOfficials: NumberOfOfficials,
    };

    this.state.clearUmpireSettings === true || recordUmpire === RECORDUMPIRETYPE.None //nullify umpireSelection object.
      ? (umpireSequenceSettings = null)
      : (umpireSequenceSettings = umpireSequenceSettings);

    recordUmpire === RECORDUMPIRETYPE.Names //when umpireSelection dropDown has "At Courts" selected just assign umpire.
      ? (umpireSequenceSettings = {
          NumberOfUmpires: NumberOfUmpires,
        })
      : (umpireSequenceSettings = umpireSequenceSettings);

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

    // const gameTimeTracking = isFootball || record2.includes('gameTimeTrackingType');
    const enhancedStatistics = record1.includes('enhancedStatistics');
    const positionTracking = record1.includes('positionTracking');
    const recordGoalAttempts = record1.includes('recordGoalAttempts');
    const centrePassEnabled = record2.includes('centrePassEnabled');
    const incidentsEnabled = record2.includes('incidentsEnabled');
    const gameTimeTrackingType = this.state.trackFullPeriod;
    const attendenceRecordingTime = this.getRecordingTime(days, hours, minutes);
    const lockattendanceRecordingTime = this.getRecordingTime(
      attendanceMinutesDays,
      attendanceMinuteHours,
      lockAttendanceMinutes,
    );
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

    // Update values of timeouts
    const timeoutSettings = { ...timeouts };
    if (isNotNullAndUndefined(timeoutSettings)) {
      if (timeoutSettings.perInterval) {
        timeoutSettings.perInterval = timeoutSettings.perInterval.map(value => {
          return value === '' ? 0 : value;
        });
      }
      if (timeoutSettings.extraTime === '') {
        timeoutSettings.extraTime = 0;
      }
      if (!isBasketball) {
        delete timeoutSettings['extraTime'];
      }
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('longName', captializedString(competitionName));
    formData.append('name', captializedString(shortName));
    formData.append('logo', competitionLogo);
    formData.append('recordUmpireType', recordUmpire);
    formData.append('officialOrganisationId', officialOrganisationId);
    formData.append('enhancedStatistics', enhancedStatistics);

    // formData.append('gameTimeTracking', gameTimeTracking);
    formData.append('positionTracking', positionTracking);
    formData.append('recordGoalAttempts', recordGoalAttempts);
    formData.append('centrePassEnabled', centrePassEnabled);
    formData.append('incidentsEnabled', incidentsEnabled);
    formData.append('attendanceRecordingType', attendanceRecordingType);
    formData.append('attendanceRecordingPeriod', attendanceRecordingPeriod);
    formData.append(
      'scoringType',
      (isFootball || isNetball) && scoring !== '' ? scoring : ScoringType.Single,
    );
    formData.append('timerType', timerType);
    formData.append('organisationId', orgId || data.organisationId);
    formData.append('buzzerEnabled', buzzerEnabled);
    formData.append('warningBuzzerEnabled', warningBuzzerEnabled);
    formData.append('playerBorrowingType', borrowedPlayer);
    formData.append('gamesBorrowedThreshold', gamesBorrowedThreshold);
    formData.append('linkedCompetitionId', linkedCompetitionId);
    formData.append('yearRefId', yearRefId);
    formData.append('isInvitorsChanged', selectionValue.toString());
    formData.append('timeoutDetails', timeoutSettings ? JSON.stringify(timeoutSettings) : '{}');
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
    formData.append('pointScheme', JSON.stringify(pointScheme));
    formData.append('allowForfeit', allowForfeit);

    // Update match official recording
    const teamOfficialRoleList = [...matchOfficialRecordRoles].map((i, index) => ({
      ...i,
      id: i.databaseId,
      sequence: index + 1,
    }));
    formData.append('enableMatchOfficialRecording', enableMatchOfficialRecording);
    formData.append('teamOfficialRoleList', JSON.stringify(teamOfficialRoleList));

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

    if (foulsSettings && AppConstants.flavour === FLAVOUR.Football) {
      foulsSettings.recordOffenceCodes = true;
      let foulKeys = Object.keys(foulsSettings);
      commonFoul.forEach(key => {
        foulKeys.includes(key) && delete foulsSettings[key];
      });
      if (!isArrayNotEmpty(foulsSettings.sendoffReport)) {
        foulsSettings.sendoffReport = [{ type: 'RC', value: '1' }];
      }

      if (!isArrayNotEmpty(foulsSettings.sinBin)) {
        foulsSettings.sinBin = [{ type: 'TD', value: '1' }];
      }

      if (!foulsSettings.sinBinLengthOfTime) {
        delete foulsSettings.sinBinLengthOfTime;
        delete foulsSettings.sinBin;
      }
    }

    formData.append('foulsSettings', JSON.stringify(foulsSettings));

    if (attendenceRecordingTime) {
      formData.append('attendanceSelectionTime', attendenceRecordingTime);
    }
    if (lockAttendanceMinutesChecked !== false) {
      if (
        attendanceMinutesDays === 0 &&
        attendanceMinuteHours === 0 &&
        lockAttendanceMinutes === 0 &&
        lockAttendanceMinutesChecked === true
      ) {
        formData.append('attendanceSelectionTimeEnd', 0);
      } else {
        formData.append('attendanceSelectionTimeEnd', lockattendanceRecordingTime);
      }
    }
    if (isNetball) {
      formData.append('gameTimeTrackingType', gameTimeTrackingType);
    } else if (isFootball) {
      formData.append('gameTimeTracking', gameTimeTrackingType);
    }
    if (lineupSelection) {
      formData.append('lineupSelectionEnabled', lineupSelection);
      formData.append('lineupSelectionTime', lineUpSelectionTime);
    }
    formData.append('allowAffiliatesEnterScore', allowAffiliatesEnterScore);

    if (allowMaximumAttendance) {
      formData.append('maximumAttendance', maximumAttendance);
    } else {
      formData.append('maximumAttendance', null);
    }
    if (allowMaximumLineup) {
      formData.append('maximumLineup', maximumLineup);
    } else {
      formData.append('maximumLineup', null);
    }

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
    if (options.value === 'gameTimeTrackingType' || options.value === 'gameTimeTracking') {
      if (isNetball) {
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
    }
  };

  isLineupFieldRequired = (form, currentFieldName) => {
    const lineupFields = ['lineupSelectionDays', 'lineupSelectionHours', 'lineupSelectionMins'];

    const fieldValues = lineupFields
      .filter(lineupField => lineupField !== currentFieldName)
      .map(lineupField => this.props.liveScoreSetting.form[lineupField]);

    return fieldValues.every(fieldValue => !fieldValue || fieldValue === '0');
  };

  timeoutsView = isOnPremierSection => {
    const { timeouts } = this.props.liveScoreSetting.form;
    const isTimeoutsChecked = timeouts && (timeouts.checked || timeouts.type) ? true : false;
    const handleTimeoutsChange = () => {
      this.props.onChangeSettingForm({
        key: 'timeouts',
        data: isTimeoutsChecked ? {} : { checked: true },
      });
    };

    return (
      <>
        <InputWithHead
          conceptulHelp
          conceptulHelpMsg={AppConstants.timeoutsHelpMsg}
          marginTop={0}
          heading={AppConstants.timeouts}
        />
        <div className="row mt-0 ml-1">
          <Checkbox
            className="single-checkbox-radio-style"
            onChange={() => handleTimeoutsChange()}
            disabled={isOnPremierSection && !this.isSeparateAttendanceChecked()}
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
      recordUmpire,
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
      lockAttendanceMinutes,
      attendanceMinuteHours,
      attendanceMinutesDays,
      gameTimeTrackingType,
    } = liveScoreSetting.form;

    const {
      removedFromGame,
      sendoffReport,
      sinBin,
      includeInPersonalFouls,
      sinBinLengthOfTime,
      recordOffenceCodes,
      teamFouls,
    } = foulsSettings || {};

    if (foulsSettings?.recordOffenceCodes && isFootball) {
      foulsSettings.recordOffenceCodes = true;
    }
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
    let settings = this.props.liveScoreSetting.form;
    let gameTimeList = gameTimeListFilter;
    if (!isFootball && settings.id && settings.record2.find(r => r === 'gameTrackingType')) {
      gameTimeList = gameTimeList.filter(gtl => gtl.value === AppConstants.period);
    }

    return (
      <div>
        <div className="formView content-view pt-4 mb-5">
          <div className="row">
            <div className="col-sm">
              <InputWithHead
                auto_complete="off"
                required="required-field"
                heading={AppConstants.year}
              />
              <Select
                style={{ width: 100 }}
                className="year-select reg-filter-select-year"
                onChange={yearId => this.onYearClick(yearId)}
                value={yearRefId}
              >
                {appState.yearList.map(item => (
                  <Option key={`year_${item.id}`} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <Form.Item
            name="competition_name"
            rules={[
              {
                required: true,
                message: ValidationConstants.competitionField,
              },
            ]}
          >
            <InputWithHead
              name="competitionName"
              auto_complete="off"
              required="required-field "
              heading={AppConstants.competitionName}
              placeholder={AppConstants.competitionName}
              onChange={this.handleInputChange}
              onBlur={e => {
                this.formRef.current.setFieldsValue({
                  competition_name: captializedString(e.target.value),
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="short_name"
            rules={[
              {
                required: true,
                message: ValidationConstants.shortField,
              },
            ]}
          >
            <InputWithHead
              name="shortName"
              auto_complete="off"
              required="required-field "
              heading={AppConstants.short_Name}
              placeholder={AppConstants.short_Name}
              conceptulHelp
              conceptulHelpMsg={AppConstants.shortNameMsg}
              marginTop={5}
              onChange={this.handleInputChange}
              onBlur={i =>
                this.formRef.current.setFieldsValue({
                  short_name: captializedString(i.target.value),
                })
              }
            />
          </Form.Item>

          {/* image and check box view */}
          <InputWithHead heading={AppConstants.competitionLogo} isOptional />
          <div className="fluid-width">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="reg-competition-logo-view" onClick={this.selectImage}>
                  <ImageLoader timeout={this.state.timeout} src={Logo || AppImages.circleImage} />
                </div>
                <input
                  type="file"
                  id="user-pic"
                  className="d-none"
                  name="imageFile"
                  onChange={evt => {
                    this.setImage(evt.target);
                  }}
                  onClick={event => {
                    event.target.value = null;
                  }}
                />
              </div>
              <div className="col-sm">
                <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
              </div>
              <div className="col-sm-12 d-flex align-items-center">
                <Checkbox className="single-checkbox" defaultChecked>
                  {AppConstants.useDefault}
                </Checkbox>
              </div>
            </div>
          </div>

          {/* venue multi selection */}
          <InputWithHead required="required-field " heading={AppConstants.venues} />
          <div>
            <Form.Item
              name="venue"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.venueField,
                },
              ]}
            >
              <>
                <Select
                  mode="multiple"
                  placeholder={AppConstants.selectVenue}
                  className="w-100"
                  onChange={value => {
                    this.onSelectValues(value);
                  }}
                  filterOption={false}
                  onSearch={value => {
                    this.handleSearch(value, this.props.liveScoreSetting.mainVenueList);
                  }}
                  value={venue}
                >
                  {this.props.liveScoreSetting.venueData &&
                    this.props.liveScoreSetting.venueData.map(item => (
                      <Option key={`venue_${item.venueId}`} value={item.venueId}>
                        {item.venueName}
                      </Option>
                    ))}
                </Select>
              </>
            </Form.Item>
          </div>
        </div>

        <div className="formView content-view pt-4 mb-5">
          {/* match settings check boxes */}
          <span
            className="text-heading-large pt-5"
            style={{
              marginBottom: this.state.isEdit === 'add' ? 10 : 0,
            }}
          >
            {AppConstants.wouldLikeRecord}
          </span>
          {this.state.isEdit !== 'add' && (
            <NavLink
              to={{
                pathname: '/matchDayDivisionList',
              }}
            >
              <span className="input-heading-add-another pt-3 pb-3">
                +{AppConstants.divisionSettings}
              </span>
            </NavLink>
          )}
          <div className="fluid-width" style={{ marginTop: -10 }}>
            <div className="row">
              {isFootball ? (
                <div className="col-sm-12">
                  <div className="record-label">{AppConstants.gameTimeTracking}</div>
                  <Select
                    style={mediumSelectStyles}
                    onChange={val => this.handleCheckBoxChange('gameTimeTracking', val)}
                    value={this.props.liveScoreSetting.form.gameTimeTracking}
                    placeholder={AppConstants.selectCompetition}
                  >
                    {trackFullPeriod.map(item => (
                      <Option key={`trackFullPeriod_${item.value}`} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              ) : null}

              <div className="col-sm-12">
                {isFootball ? (
                  <div className="record-label">{AppConstants.otherSettings}</div>
                ) : null}

                <Checkbox.Group
                  className="d-flex flex-column justify-content-center"
                  value={record1}
                  onChange={val => this.handleCheckBoxChange('record1', val)}
                >
                  {applyTo1.map(item => (
                    <div key={item.value}>
                      <Checkbox
                        className="single-checkbox-radio-style pt-4 ml-0"
                        data-testid={AppUniqueId.CHECKBOX + item.value}
                        value={item.value}
                        disabled={this.isSeparateAttendanceChecked()}
                      >
                        {item.label}
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </div>
              <div className="col-sm-12">
                <Checkbox.Group
                  className="checkBoxGroup-checkbox-radio-style d-flex flex-column justify-content-center"
                  /*  options={applyTo2} */
                  value={record2}
                  onChange={val => this.handleCheckBoxChange('record2', val)}
                >
                  {applyTo2.map(item => {
                    return (
                      <div key={item.value}>
                        <Checkbox
                          className="single-checkbox-radio-style pt-4 ml-0"
                          data-testid={AppUniqueId.CHECKBOX + item.value}
                          value={item.value}
                        >
                          {item.label}
                          {item.helpMsg && <Tooltip>{item.helpMsg}</Tooltip>}
                        </Checkbox>

                        {this.differentPositionTracking(item, record2)}
                      </div>
                    );
                  })}
                </Checkbox.Group>
              </div>
            </div>
          </div>

          {/* Record Umpire dropdown view */}
          {/*  <InputWithHead
            required="required-field"
            conceptulHelp
            conceptulHelpMsg={AppConstants.recordUmpireMsg}
            marginTop={5}
            heading={AppConstants.recordUmpire}
          />
          <div className="row">
            <div className="col-sm">
              <Form.Item
                name="recordUmpire"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.recordUmpireField,
                  },
                ]}
              >
                <Select
                  placeholder={AppConstants.recordUmpirePlaceholder}
                  style={mediumSelectStyles}
                  onChange={val => this.handleCheckBoxChange('recordUmpire', val)}
                >
                  <Option value="NONE">None</Option>
                  <Option value="USERS">Integrated</Option>
                  <Option value="NAMES">{AppConstants.atCourts}</Option>
                </Select>
              </Form.Item>
            </div>
          </div> */}
        </div>

        <div className="formView content-view pt-4 mb-5">
          {/* timer view */}
          <span className="text-heading-large pt-5">{AppConstants.matchOfficialSettingsText}</span>
          <InputWithHead marginTop={0} heading={AppConstants.umpireAllocation} />
          <div className="row mt-0 ml-1">
            <Form.Item
              name="recordUmpire"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.recordUmpireField,
                },
              ]}
            >
              <Select
                placeholder={AppConstants.recordUmpirePlaceholder}
                style={mediumSelectStyles}
                onChange={val => this.handleCheckBoxChange('recordUmpire', val)}
              >
                <Option value="NONE">None</Option>
                <Option value="USERS">{AppConstants.integratedAllocation}</Option>
                <Option value="NAMES">{AppConstants.atCourts}</Option>
              </Select>
            </Form.Item>
          </div>
          {recordUmpire === RECORDUMPIRETYPE.Users && (
            <div>
              <InputWithHead marginTop={0} heading={AppConstants.officialOrganisation} />
              <div className="row mt-0 ml-1">
                <Form.Item name="officialOrganisationId">
                  <Select
                    placeholder={AppConstants.officialOrganisation}
                    style={mediumSelectStyles}
                    showSearch
                  >
                    {this.props.userState.stateOrganisations.map(item => (
                      <Option key={item.linkedOrganisationId} value={item.linkedOrganisationId}>
                        {item.linkedOrganisationName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          )}
          <div hidden={recordUmpire === RECORDUMPIRETYPE.None}>
            <InputWithHead marginTop={0} heading={AppConstants.noOfUmpireAllocated} />
            <div className="row mt-0 ml-1">
              <Form.Item name="NumberOfUmpires">
                <Select style={mediumSelectStyles} allowClear>
                  {this.umpireSequences.map(item => (
                    <Option key={`sequence_${item.value}_${item.name}`} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row mt-0 ml-1" hidden={recordUmpire !== RECORDUMPIRETYPE.Users}>
            <Form.Item name="CoachEnabled" valuePropName="checked">
              <Checkbox className="single-checkbox-radio-style pt-4 ml-0">
                {AppConstants.umpireCoach}
              </Checkbox>
            </Form.Item>
          </div>

          <div className="row mt-0 ml-1" hidden={recordUmpire !== RECORDUMPIRETYPE.Users}>
            <Form.Item name="ReserveEnabled" valuePropName="checked">
              <Checkbox
                className="single-checkbox-radio-style pt-4 ml-0"
                onChange={e => console.log('ReserveEnabled = ', e.target.checked)}
              >
                {AppConstants.umpireReservePref}
              </Checkbox>
            </Form.Item>
          </div>
          <div className="row mt-0 ml-1" hidden={recordUmpire !== RECORDUMPIRETYPE.Users}>
            <Form.Item name="AnyoneCanBeUmpire" valuePropName="checked">
              <Checkbox className="single-checkbox-radio-style pt-4 ml-0">
                {AppConstants.allowAnyoneToBeUmpire}
              </Checkbox>
            </Form.Item>
          </div>
          <div hidden={recordUmpire !== RECORDUMPIRETYPE.Users}>
            <InputWithHead
              marginTop={0}
              heading={AppConstants.numberOfMatchOfficialSettingsText}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.matchOfficialRequiredMsg,
                },
              ]}
            />
            <div className="row mt-0 ml-1">
              <Form.Item name="NumberOfOfficials" visible={recordUmpire !== RECORDUMPIRETYPE.Users}>
                <Select style={mediumSelectStyles} allowClear>
                  {this.matchOfficialSequences.map(item => (
                    <Option key={`NumberOfOfficials${item.value}_${item.name}`} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="formView content-view pt-4 mb-5">
          <MatchOfficialSettings></MatchOfficialSettings>
        </div>

        {isNetball ? (
          <div className="formView content-view pt-4 mb-5">
            <span className="text-heading-large pt-5">
              {AppConstants.premierCompetitionSetting}
            </span>

            <div className="row mt-0 ml-1">
              <Form.Item name="separateAttendance" valuePropName="checked">
                <Checkbox
                  className="single-checkbox-radio-style pt-4 ml-0"
                  onChange={e => this.handleCheckBoxChange('separateAttendance', e.target.checked)}
                >
                  {AppConstants.separateAttendance}
                </Checkbox>
              </Form.Item>
            </div>
            <div className="row mt-0 ml-1">
              <Form.Item name="willSupershotBeRecorded" valuePropName="checked">
                <Checkbox
                  className="single-checkbox-radio-style pt-4 ml-0"
                  onChange={e =>
                    this.handleCheckBoxChange('willSupershotBeRecorded', e.target.checked)
                  }
                  disabled={!this.isSeparateAttendanceChecked()}
                >
                  {AppConstants.willSupershotBeRecorded}
                </Checkbox>
              </Form.Item>
            </div>
            {this.timeoutsView(true)}
            <div className="row mt-0 ml-1">
              <Form.Item name="premierCompetitionSuspension" valuePropName="checked">
                <Checkbox
                  className="single-checkbox-radio-style pt-4 ml-0"
                  onChange={e =>
                    this.handleCheckBoxChange('premierCompetitionSuspension', e.target.checked)
                  }
                  disabled={!this.isSeparateAttendanceChecked()}
                >
                  {AppConstants.premierCompetitionSuspension}
                </Checkbox>
              </Form.Item>
            </div>
          </div>
        ) : (
          <></>
        )}

        <div className="formView content-view pt-4 mb-5">
          {/* dropdown view */}
          <span className="text-heading-large pt-5">{AppConstants.attendance_record_report}</span>

          <div className="row">
            <div className="col-sm">
              <InputWithHead
                conceptulHelp
                conceptulHelpMsg={AppConstants.recordMsg}
                heading={AppConstants.record}
              />
              <Form.Item
                name="attendanceRecord"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.attendanceRecordField,
                  },
                ]}
              >
                <Select
                  placeholder="Select Record"
                  className="w-100"
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={recordSelection =>
                    this.props.onChangeSettingForm({
                      key: 'attendanceRecordingType',
                      data: recordSelection,
                    })
                  }
                >
                  <Option value="OWN">Own</Option>
                  <Option value="BOTH">Both</Option>
                  <Option value="OPPOSITION">Opposition</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-sm">
              <InputWithHead
                conceptulHelp
                conceptulHelpMsg={AppConstants.reportMsg}
                heading={AppConstants.report}
              />
              <Form.Item
                name="attendanceReport"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.attendanceReportField,
                  },
                ]}
              >
                <Select
                  placeholder="Select Report"
                  className="w-100"
                  data-testid={AppUniqueId.ATTENDANCE_REPORT}
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={reportSelection =>
                    this.props.onChangeSettingForm({
                      key: 'attendanceRecordingPeriod',
                      data: reportSelection,
                    })
                  }
                  value={settings.attendanceRecordingPeriod}
                  disabled={false}
                >
                  {gameTimeList.map(({ value, text }) => (
                    <Option
                      key={value}
                      value={value}
                      data-testid={AppUniqueId.SELECT_ATTENDANCE_REPORT + text}
                    >
                      {text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Attendance Recording Time */}
          <InputWithHead isOptional heading={AppConstants.attendanceRecordingTime} />
          <div className="inside-container-view mt-0">
            <InputWithHead
              required="pt-0"
              heading={AppConstants.attendanceRecordingTimeStartsFrom}
              conceptulHelp
              conceptulHelpMsg={AppConstants.attendanceRecordingTimeStartsFromContextualHelp}
            />
            <div className="row">
              <div className="col-sm">
                <InputWithHead
                  required="pt-0"
                  heading={AppConstants._days}
                  placeholder={AppConstants._days}
                  name="days"
                  value={days || ''}
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  required="pt-0"
                  heading={AppConstants._hours}
                  placeholder={AppConstants._hours}
                  name="hours"
                  value={hours || ''}
                  onChange={this.handleInputChange}
                />
              </div>

              <div className="col-sm">
                <InputWithHead
                  required="pt-0"
                  heading={AppConstants._minutes}
                  placeholder={AppConstants._minutes}
                  name="minutes"
                  value={minutes || ''}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
            <div className="pt-4">
              <Checkbox
                onChange={e =>
                  this.handleCheckBoxChange('attendanceSelectionTimeChanged', e.target.checked)
                }
                checked={this.state.lockAttendanceMinutesChecked}
              >
                <InputWithHead
                  required="pt-0"
                  heading={AppConstants.attendanceRecordingTimeLocked}
                  conceptulHelp
                  conceptulHelpMsg={AppConstants.attendanceRecordingTimeLockedContextualHelp}
                />
              </Checkbox>
              {this.state.lockAttendanceMinutesChecked ? (
                <div className="row">
                  <div className="col-sm">
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants._days}
                      placeholder={AppConstants._days}
                      name="attendanceMinutesDays"
                      value={attendanceMinutesDays || 0}
                      onChange={this.handleInputChange}
                    />
                  </div>
                  <div className="col-sm">
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants._hours}
                      placeholder={AppConstants._hours}
                      name="attendanceMinuteHours"
                      value={attendanceMinuteHours || 0}
                      onChange={this.handleInputChange}
                    />
                  </div>

                  <div className="col-sm">
                    <InputWithHead
                      required="pt-0"
                      heading={AppConstants._minutes}
                      placeholder={AppConstants._minutes}
                      name="lockAttendanceMinutes"
                      value={lockAttendanceMinutes || 0}
                      onChange={this.handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>

          {/* Player borrowing view */}
          <InputWithHead isOptional heading={AppConstants.playerBorrowing} />
          <div className="row mt-0 ml-1">
            <Radio.Group
              className="reg-competition-radio w-100"
              name="borrowedPlayer"
              onChange={this.handleInputChange}
              value={borrowedPlayer}
            >
              <div className="row mt-0">
                <div className="col-sm-12">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value="GAMES"
                  >
                    {AppConstants.gamesBorrowed}
                  </Radio>

                  {borrowedPlayer === 'GAMES' && (
                    <div className="inside-container-view w-100" style={{ marginTop: 15 }}>
                      <div className="small-steper-style">
                        <InputNumber
                          max={6}
                          min={3}
                          value={gamesBorrowedThreshold}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={number =>
                            this.props.onChangeSettingForm({
                              key: 'number',
                              data: number,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-sm-12">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value="MINUTES"
                  >
                    {AppConstants.minutesBorrowed}
                  </Radio>
                </div>
              </div>
            </Radio.Group>
          </div>
          <InputWithHead required="required-field" heading={AppConstants.whatBorrowingRules} />
          <div className="row mt-0 ml-1">
            <Form.Item
              name="compBorrowRuleRefId"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.scoringField,
                },
              ]}
            >
              <Radio.Group
                className="reg-competition-radio w-100"
                name="compBorrowRuleRefId"
                onChange={this.handleInputChange}
                value={compBorrowRuleRefId}
              >
                {!!stateSettings &&
                  stateSettings.stateBorrowRuleRefId === StateBorrowRuleRef.StateDecides && (
                    <Radio
                      className="text-wrap"
                      style={{
                        marginRight: 0,
                        paddingRight: 0,
                      }}
                      value={CompBorrowRuleRef.BorrowableByAnyStateAffiliates}
                    >
                      {AppConstants.BorrowableByAnyStateAffMsg}
                    </Radio>
                  )}
                <Radio
                  className="text-wrap"
                  style={{
                    marginRight: 0,
                    paddingRight: 0,
                  }}
                  value={CompBorrowRuleRef.BorrowableByOwnOrg}
                >
                  {AppConstants.borrowableByOwnOrgMsg}
                </Radio>

                <Radio
                  className="text-wrap"
                  style={{
                    marginRight: 0,
                    paddingRight: 0,
                  }}
                  value={CompBorrowRuleRef.BorrowableByAnyOrg}
                >
                  {AppConstants.borrowableByAnyOrgMsg}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className="row">
            <div className="col-sm-12">
              {/* Line up selection */}

              <Checkbox
                className="single-checkbox pt-2 justify-content-center"
                onChange={e => this.onChangeLineUpSelection(e.target.checked, record1)}
                checked={lineupSelection}
                disabled={this.isSeparateAttendanceChecked()}
              >
                <span className="checkbox-text">
                  {AppConstants.squadSelection}
                  <i className="input-heading__optional">- optional</i>
                </span>
              </Checkbox>

              {lineupSelection && (
                <div className="inside-container-view pt-0" style={{ marginTop: 15 }}>
                  <div className="row">
                    <div className="col-sm">
                      <Form.Item name="lineupSelectionDays" initialValue={lineupSelectionDays ?? 0}>
                        <InputWithHead
                          type="number"
                          name="lineupSelectionDays"
                          heading={AppConstants._days}
                          placeholder={AppConstants._days}
                          onChange={this.handleInputChange}
                          marginTop={0}
                          // required="required-field "
                        />
                      </Form.Item>
                    </div>
                    <div className="col-sm">
                      <Form.Item
                        name="lineupSelectionHours"
                        initialValue={lineupSelectionHours ?? 0}
                      >
                        <InputWithHead
                          type="number"
                          name="lineupSelectionHours"
                          heading={AppConstants._hours}
                          placeholder={AppConstants._hours}
                          onChange={this.handleInputChange}
                          // required="required-field "
                        />
                      </Form.Item>
                    </div>

                    <div className="col-sm">
                      <Form.Item
                        name="lineupSelectionMins"
                        rules={[
                          form => ({
                            required: this.isLineupFieldRequired(form, 'lineupSelectionMins'),
                            message: AppConstants.squadSelectionErrorMsg,
                          }),
                        ]}
                        dependencies={['lineupSelectionHours', 'lineupSelectionDays']}
                        initialValue={lineupSelectionMins ?? 0}
                      >
                        <InputWithHead
                          type="number"
                          name="lineupSelectionMins"
                          heading={AppConstants._minutes}
                          placeholder={AppConstants._minutes}
                          onChange={this.handleInputChange}
                          // required="required-field "
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Checkbox
                className="single-checkbox justify-content-center"
                onChange={e =>
                  this.props.onChangeSettingForm({
                    key: 'premierCompLink',
                    data: e.target.checked,
                  })
                }
                checked={premierCompLink}
              >
                <span className="checkbox-text">
                  {AppConstants.premierCompLink}
                  <i className="input-heading__optional">- optional</i>
                </span>
              </Checkbox>

              {premierCompLink && (
                <div className="inside-container-view" style={{ marginTop: 15 }}>
                  <Select
                    showSearch
                    className="w-100"
                    onChange={compId =>
                      this.props.onChangeSettingForm({
                        key: 'linkedCompetitionId',
                        data: compId,
                      })
                    }
                    placeholder="Search Competition"
                    value={linkedCompetitionId || undefined}
                    optionFilterProp="children"
                  >
                    {competition.map(item => (
                      <Option key={`competition_${item.id}`} value={item.id}>
                        {item.longName}
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              {/* Line up selection */}
              <Checkbox
                className="single-checkbox pt-2 justify-content-center"
                onChange={e => this.onChangeAllowHomeAffiliatesToEnterScores(e.target.checked)}
                checked={allowAffiliatesEnterScore}
              >
                <span className="checkbox-text">
                  {AppConstants.allowHomeAffiliatesToEnterScores}
                </span>
              </Checkbox>
            </div>
          </div>
        </div>

        <PlayerNumbersSetting></PlayerNumbersSetting>

        <div className="formView content-view pt-4 mb-5">
          <span className="text-heading-large pt-5">{AppConstants.displayStatistics}</span>

          <Radio.Group
            className={'reg-competition-radio'}
            value={isPublicStats}
            name="isPublicStats"
            onChange={this.handleInputChange}
          >
            <Radio value={false}>{AppConstants.showCoachAndManagementStatisticsOnly}</Radio>
            <Radio value={true}>{AppConstants.showAllStatistics}</Radio>
          </Radio.Group>
        </div>

        {showWholeScoringSection && (
          <div className="formView content-view pt-4 mb-5">
            <span className="text-heading-large pt-5">{AppConstants.scoring}</span>

            <ScoringAssignmentsFields
              onInputChange={this.handleInputChange}
              settingIsIntegrated={this.state.settingIsIntegrated}
              values={{
                scoring: (isFootball || isNetball) && scoring !== '' ? scoring : ScoringType.Single,
                whoScoring,
                acceptScoring,
              }}
              mediumSelectStyle={mediumSelectStyles}
            />
          </div>
        )}

        <div className="formView content-view pt-4 mb-5">
          <AllowForfeitSetting />
        </div>

        <div className="formView content-view pt-4 mb-5">
          {/* timer view */}
          <span className="text-heading-large pt-5">{AppConstants.timer}</span>
          <Form.Item
            name="time"
            rules={[
              {
                required: true,
                message: ValidationConstants.timerField,
              },
            ]}
          >
            <>
              <Select
                placeholder="Select Timer"
                style={mediumSelectStyles}
                onChange={timer =>
                  this.props.onChangeSettingForm({
                    key: 'timerType',
                    data: timer,
                  })
                }
                value={timerType}
                disabled={scoring === 'NO_SCORING_CARD' ? true : false}
              >
                {!isBasketball && <Option value="CENTRAL">{AppConstants.central}</Option>}
                <Option value="PER_MATCH">{AppConstants.perMatch}</Option>
                <Option value="CENTRAL_WITH_MATCH_OVERRIDE">
                  {AppConstants.centralWithPerMatchOverride}
                </Option>
                <Option value="PER_MATCH_PER_PERIOD">{AppConstants.perMatchPerPeriod}</Option>
              </Select>
              <Tooltip>
                <span>{AppConstants.timerMsg}</span>
              </Tooltip>
            </>
          </Form.Item>

          {/* Buzzer button view */}
          <InputWithHead
            isOptional
            conceptulHelp
            conceptulHelpMsg={AppConstants.buzzerMsg}
            marginTop={0}
            heading={AppConstants.buzzer}
          />
          <div className="row mt-0 ml-1">
            {buzzerCheckboxes.map((checkbox, indx) => {
              const className = indx === 0 ? 'mt-0' : 'ml-0';

              return (
                <Checkbox
                  key={checkbox.key}
                  className={`single-checkbox w-100 ${className}`}
                  onChange={e =>
                    this.props.onChangeSettingForm({
                      key: checkbox.key,
                      data: e.target.checked,
                    })
                  }
                  checked={liveScoreSetting[checkbox.key]}
                >
                  {checkbox.label}
                </Checkbox>
              );
            })}
          </div>

          {isTimeoutsEnabled && this.timeoutsView(false)}

          {isFootball && (
            <Checkbox
              className={`single-checkbox w-100`}
              onChange={e =>
                this.props.onChangeSettingForm({
                  key: 'additionalTime',
                  data: e.target.checked,
                })
              }
              checked={additionalTime}
            >
              {AppConstants.allowAddedTime}
            </Checkbox>
          )}

          <ExtraTimeFields
            values={{
              extraTime,
              extraTimeType,
              extraTimeDuration,
              extraTimeMainBreak,
              extraTimeQuarterBreak,
            }}
            onInputChange={this.handleInputChange}
          />
        </div>

        {this.showFoulsSettings && (
          <div className="formView content-view pt-4 mb-5">
            <span className="text-heading-large pt-5">{AppConstants.foul}</span>
            <FoulsFields values={foulsFeildsSetting} onChange={this.handleFoulSettingChange} />
          </div>
        )}

        {isBasketball && (
          <div className="formView content-view pt-5 mb-5">
            <BonusFouls values={teamFoulsSetting} onChange={this.handleFoulSettingChange} />
          </div>
        )}

        {(isFootball || isBasketball) && (
          <div className="formView content-view pt-4 mb-5">
            <span className="text-heading-large pt-5">{AppConstants.sentOffs}</span>
            <SinBinLengthOfTime
              values={sinBinLengthOfTimeSetting}
              onChange={this.handleFoulSettingChange}
            />
            {/* {isFootball && (
              <>
                <Checkbox
                  className="single-checkbox justify-content-center"
                  onChange={e =>
                    this.handleFoulSettingChange({ recordOffenceCodes: e.target.checked })
                  }
                  checked={recordOffenceCodes}
                >
                  <span className="checkbox-text">{AppConstants.recordOffenceCodes}</span>
                </Checkbox>
              </>
            )} */}
          </div>
        )}

        <div className="formView content-view pt-4 mb-5">
          <span className="text-heading-large pt-5">{AppConstants.bestAndFairestPoints}</span>
          <BestAndFairestPointSetting
            typeRefId={BFSettingType.MEDIA_REPORT}
            settingIsIntegrated={this.state.settingIsIntegrated}
            onFormChange={this.props.onChangeBestAndFairestPointSetting}
          />
        </div>

        {checkLivScoreCompIsParent() && (
          <div className="formView content-view pt-4 mb-5">
            <span className="text-heading-large pt-5">{AppConstants.votedAwardBestAndFairest}</span>
            <BestAndFairestPointSetting
              typeRefId={BFSettingType.VOTED_AWARD}
              settingIsIntegrated={this.state.settingIsIntegrated}
              onFormChange={this.props.onChangeBestAndFairestPointSetting}
            />
          </div>
        )}

        <div className="formView content-view pt-4 mb-5">
          <span className="text-heading-large pt-5">{AppConstants.competitionInvitees}</span>
          <LiveScoreSettingsInvitees
            stateEditMode={this.state.isEdit}
            localEditMode={this.state.edit}
            okClick={this.state.onOkClick}
            organisationTypeRefId={this.state.organisationTypeRefId}
            onInviteesChange={this.onInviteesChange}
            onOpenModel={this.openModel}
            onFormChange={this.props.onChangeSettingForm}
            onInviteesSearchAction={this.props.onInviteesSearchAction}
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
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      maskClosable: true,
      onOk() {
        this_.setState({ onOkClick: false });
      },
      onCancel() {
        this_.setState({ onOkClick: true });
      },
    });
  };

  openUmpireSettingModel = (fieldKey, value) => {
    const this_ = this;
    confirm({
      title: AppConstants.umpireSettingChangeMessage,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      maskClosable: true,
      onOk() {
        this_.props.onChangeSettingForm({
          key: 'scoring',
          data: '',
        });
        this_.props.onChangeSettingForm({
          key: 'whoScoring',
          data: '',
        });
        this_.handleIntegratedSetting(fieldKey, value);
      },
      onCancel() {
        this_.props.onChangeSettingForm({
          key: 'recordUmpire',
          data: 'USERS',
        });
        this_.handleIntegratedSetting('recordUmpire', 'USERS');
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
                data-testid={AppUniqueId.SETTINGS_SAVE_BUTTON}
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
          {!isVisibleLoader && this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.handleSubmit}
            onFinishFailed={this.onFinishFailed}
            noValidate="noValidate"
          >
            {!isVisibleLoader && this.contentView()}
            <Footer>{!isVisibleLoader && this.footerView()}</Footer>
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
  getStateOrganisationsAction,
  getSuspensionApplyToAction,
})(LiveScoreSettingsView);

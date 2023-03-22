import React, { Component, Fragment, useState } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Form,
  DatePicker,
  TimePicker,
  Select,
  InputNumber,
  Modal,
  Checkbox,
  Radio,
  message,
  AutoComplete,
  Spin,
  Alert,
} from 'antd';
import './liveScore.css';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tooltip from 'react-png-tooltip';
import AppUniqueId from 'themes/appUniqueId';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import ValidationConstants from '../../themes/validationConstant';
import { getRefBadgeData } from '../../store/actions/appAction';
import { getliveScoreDivisions } from '../../store/actions/LiveScoreAction/liveScoreActions';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { getLiveScoreSettingInitiate } from '../../store/actions/LiveScoreAction/LiveScoreSettingAction';
import {
  liveScoreAddEditMatchAction,
  liveScoreAddEditMatchScoresAction,
  liveScoreAddMatchAction,
  liveScoreUpdateMatchAction,
  liveScoreCreateMatchAction,
  liveScoreUnEndMatchAction,
  clearMatchAction,
  getCompetitionVenuesList,
  liveScoreClubListAction,
  searchFilterAction,
  liveScoreGetMatchDetailInitiate,
  resetUmpireListBoolAction, otherOfficialListAction,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import { liveScoreScorerListAction } from '../../store/actions/LiveScoreAction/liveScoreScorerAction';
import InputWithHead from '../../customComponents/InputWithHead';
import {
  liveScoreCreateRoundAction,
  liveScoreRoundListAction,
} from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import history from '../../util/history';
import {
  getLiveScoreCompetition,
  getOrganisationData,
  getUmpireCompetitionData,
  getUmpireSequences,
  getUmpireSequenceSettings,
  getRecordUmpireType, getCompetitionData,
} from '../../util/sessionStorage';
import { getVenuesTypeAction } from '../../store/actions/appAction';
import Loader from '../../customComponents/loader';
import {
  getliveScoreAvailableScorerList,
  liveScoreClearScorerList,
} from '../../store/actions/LiveScoreAction/liveScoreAction';
import {
  isArrayNotEmpty,
  captializedString,
  isNotNullOrEmptyString,
  isNullOrUndefinedOrEmptyString,
} from '../../util/helpers';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { ladderSettingGetMatchResultAction } from '../../store/actions/LiveScoreAction/liveScoreLadderSettingAction';
// import { entityTypes } from '../../util/entityTypes';
// import { refRoleTypes } from '../../util/refRoles';
import {
  umpireListAction,
  newUmpireListAction,
} from '../../store/actions/umpireAction/umpireAction';
import { getUmpireAllocationSettings } from '../../store/actions/umpireAction/umpireSettingAction';
import {
  isBasketball,
  isFootball,
  isNetball,
} from '../liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { RECORDUMPIRETYPE, ROLE } from '../../util/enums';
import { EntityType, GradesOrPools, UmpireSequence, WhoScoring } from '../../enums/enums';
import RegenerateLadderPointsModal from '../../customComponents/RegenerateLadderPointsModal';
import { MatchStatus, MatchStatusRefId } from 'enums/enums';
import {
  getRoleFromSequence,
} from 'store/reducer/liveScoreReducer/helpers/matchUmpires/umpireHelpers';
import * as _ from 'lodash';
import LiveScoreMatchTeamOfficials from './liveScoreMatchTeamOfficials';
import { MatchOfficialEdit } from "./matchOfficialEdit";
import { getUmpireSequencesFromSettings } from "../../util/umpireHelper";
import { RegistrationUserRoles } from "../../enums/registrationEnums";

const { Footer, Content, Header } = Layout;
const { Option } = Select;
const { confirm } = Modal;

class LiveScoreAddMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: this.props.location.state ? this.props.location.state.isEdit : false,
      matchId: this.props.location.state ? this.props.location.state.matchId || 0 : 0,
      visible: false,
      createRound: '',
      loadvalue: false,
      loading: false,
      createMatch: false,
      key: props.location.state
        ? props.location.state.key
          ? props.location.state.key
          : null
        : null,
      roundLoad: false,
      selectedDivision: null,
      forfeitVisible: false,
      abandonVisible: false,
      umpireKey: this.props.location
        ? this.props.location.state
          ? this.props.location.state.umpireKey
          : null
        : null,
      compId: null,
      allDisabled: false, ///////allDisabled===false==>>>it is editable,,,,,,,,allDisabled===true===>>>cannot edit the field.
      screenName: props.location.state
        ? props.location.state.screenName
          ? props.location.state.screenName
          : null
        : null,
      sourceIdAvailable: false,
      modalVisible: false,
      compOrgId: 0,
      isCompParent: false,
      competitionOrganisationId: null,
      gradesOrPoolsRefId: 0,
      showRegenLadderPointsModal: false,
      regenLadderPointsModalFn: null,
      showUnEndMatchModal: false,
      canRegenLadderPoints: true,
      umpireChanged: false,
    };
    this.props.clearMatchAction();
    this.formRef = React.createRef();
    this.umpireSequenceSettings = getUmpireSequenceSettings() || {};
    this.umpireSequences = getUmpireSequencesFromSettings(this.umpireSequenceSettings, true);

    this.recordUmpireType = getRecordUmpireType();
    this.competition = getCompetitionData();

    this.debouncedScorerSearch = _.debounce(this.handleScorerSearch, 300);
  }

  openModel = (
    matchData,
    compId,
    key,
    isEdit,
    team1resultId,
    team2resultId,
    matchStatus,
    endTime,
    umpireKey,
    umpireData,
    scorerData,
    recordUmpireType,
    screenName,
    competitionOrganisationId,
    matchTeamOfficials,
    officialData,
  ) => {
    const this_ = this;
    confirm({
      title: AppConstants.liveScoreAddConfirm,
      okText: AppConstants.ok,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      onOk() {
        this_.props.liveScoreCreateMatchAction(
          matchData,
          compId,
          key,
          isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          endTime,
          umpireKey,
          umpireData,
          scorerData,
          recordUmpireType,
          screenName,
          competitionOrganisationId,
          this_.props.liveScoreMatchState.matchScoresData,
          false,
          matchTeamOfficials,
          officialData,
        );
      },
      onCancel() {
        console.log('cancel');
      },
    });
  };

  async componentDidMount() {
    const { AnyoneCanBeUmpire: mustGetUmpireBySearch } = this.umpireSequenceSettings;
    this.props.liveScoreClearScorerList();
    this.props.getRefBadgeData(this.props.appstate.accreditation);
    if (getUmpireCompetitionData() || getLiveScoreCompetition()) {
      if (this.state.umpireKey === 'umpire') {
        let compData = JSON.parse(getUmpireCompetitionData());
        let orgItem = await getOrganisationData();
        let userOrganisationId = orgItem ? orgItem.organisationId : 0;
        let compOrg_Id = compData ? compData.organisationId : 0;
        const competitionOrganisationId = compData.competitionOrganisationId;
        let isCompParent = userOrganisationId === compOrg_Id;
        let gradesOrPoolsRefId = compData.gradesOrPoolsRefId;
        this.setState({ isCompParent, competitionOrganisationId, gradesOrPoolsRefId });
        const { id, sourceId, competitionOrganisation } = JSON.parse(getUmpireCompetitionData());
        let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
        this.setState({
          compId: id,
          sourceIdAvailable: !!sourceId,
          compOrgId: compOrgId,
        });

        if (id !== null) {
          this.props.getCompetitionVenuesList(id, '');
          this.props.getLiveScoreDivisionList(id);
          /*  this.props.getliveScoreAvailableScorerList({
            competitionId: this.state.compId,
            matchStartTime: matchData.startTime,
            matchEndTime: moment(endTime).utc().format(),
            matchId: this.state.matchId,
          }); */
          this.props.liveScoreClubListAction(id);
          //don't get umpire list by default if umpire search is enabled
          if (!mustGetUmpireBySearch) {
            this.props.umpireListAction({
              refRoleId: JSON.stringify([15, 20]),
              entityTypes: isCompParent ? 1 : 6,
              compId: id,
              offset: null,
              compOrgId: compOrgId,
              matchId: this.state.matchId,
              onlyUniqueUsers: true,
            });
          }
          // this.props.newUmpireListAction({
          //     refRoleId: JSON.stringify([15, 20]),
          //     entityTypes: isCompParent ? 1 : 6,
          //     compId: id,
          //     offset: null,
          //     compOrgId: compOrgId,
          //     isCompParent: isCompParent
          // });
          this.setState({ loadvalue: true, allDisabled: true });
        } else {
          history.push('/matchDayCompetitions');
        }
      } else if (getLiveScoreCompetition()) {
        const { id, sourceId, competitionOrganisation, competitionOrganisationId } = JSON.parse(
          getLiveScoreCompetition(),
        );
        let compData = JSON.parse(getLiveScoreCompetition());
        let orgItem = await getOrganisationData();
        let userOrganisationId = orgItem ? orgItem.organisationId : 0;
        let compOrg_Id = compData ? compData.organisationId : 0;
        let isCompParent = userOrganisationId === compOrg_Id;
        let gradesOrPoolsRefId = compData.gradesOrPoolsRefId;
        this.setState({ isCompParent, competitionOrganisationId, gradesOrPoolsRefId });

        let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
        this.setState({
          compId: id,
          sourceIdAvailable: !!sourceId,
          compOrgId: compOrgId,
        });

        this.props.getLiveScoreSettingInitiate(id);
        this.props.getCompetitionVenuesList(id, '');
        this.props.getLiveScoreDivisionList(id);
        //this.props.getliveScoreAvailableScorerList(id, ROLE.SCORER, this.state.matchId);
        this.props.liveScoreClubListAction(id);
        //don't get umpire list by default if umpire search is enabled
        if (!mustGetUmpireBySearch) {
          this.props.umpireListAction({
            refRoleId: JSON.stringify([15, 20]),
            entityTypes: isCompParent ? 1 : 6,
            compId: id,
            offset: null,
            compOrgId: compOrgId,
            matchId: this.state.matchId,
            onlyUniqueUsers: true,
          });
        }
        // this.props.newUmpireListAction({
        //     refRoleId: JSON.stringify([15, 20]),
        //     entityTypes: isCompParent ? 1 : 6,
        //     compId: id,
        //     offset: null,
        //     compOrgId: compOrgId,
        //     isCompParent: isCompParent
        // });
        this.setState({ loadvalue: true, allDisabled: false });
      } else {
        history.push('/matchDayCompetitions');
      }

      const comp = getCompetitionData();
      if (comp.sourceId) {
        this.props.otherOfficialListAction(comp.sourceId);
      }

      if (this.state.isEdit) {
        let isLineUpEnable = null;
        // let match_status = null;
        this.props.liveScoreAddEditMatchAction(this.state.matchId);
        this.props.liveScoreAddEditMatchScoresAction(this.state.matchId);
        this.props.ladderSettingGetMatchResultAction();
        this.props.liveScoreUpdateMatchAction('', 'clearData');
        if (this.state.umpireKey === 'umpire') {
          const { lineupSelectionEnabled, status } = JSON.parse(getUmpireCompetitionData());
          isLineUpEnable = lineupSelectionEnabled;
          // match_status = status;
        } else {
          const { lineupSelectionEnabled, status } = JSON.parse(getLiveScoreCompetition());
          isLineUpEnable = lineupSelectionEnabled;
          // match_status = status;
        }
        const lineupOnByDefault = isBasketball || isFootball;
        if (isLineUpEnable == 1 || lineupOnByDefault) {
          this.setState({ isLineUp: 1 });
          this.props.liveScoreGetMatchDetailInitiate(this.props.location.state.matchId, 1);
        } else {
          this.setState({ isLineUp: 0 });
          this.props.liveScoreGetMatchDetailInitiate(this.props.location.state.matchId, 0);
        }
      } else {
        this.props.liveScoreUpdateMatchAction('', 'addMatch');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    const { addEditMatch, start_date, start_time, displayTime } = this.props.liveScoreMatchState;
    const { AnyoneCanBeUmpire: mustGetUmpireBySearch } = this.umpireSequenceSettings;
    if (this.state.isEdit) {
      if (prevProps.liveScoreMatchState !== this.props.liveScoreMatchState) {
        if (this.props.liveScoreMatchState.matchLoad == false && this.state.loadvalue) {
          // const { id } = JSON.parse(getLiveScoreCompetition())
          const division = this.props.liveScoreMatchState.matchData.divisionId;
          this.setInitialFieldValue(addEditMatch, start_date, start_time, displayTime);
          this.getLiveScoreTeams(division);
          this.props.liveScoreRoundListAction(this.state.compId, division);
          this.setState({ loadvalue: false });
        }
      }
    }

    if (prevProps.liveScoreMatchState !== this.props.liveScoreMatchState) {
      if (this.props.liveScoreMatchState.roundLoad == false && this.state.roundLoad) {
        this.setState({ roundLoad: false });
        const addedRound = this.props.liveScoreMatchState.addEditMatch.roundId;
        this.formRef.current.setFieldsValue({
          round: addedRound,
        });
      }
      if (this.props.liveScoreMatchState.updateUmpireFetchCall) {
        let matchData = this.props.liveScoreMatchState.matchData;
        let startTime = moment(matchData.startTime);
        let endTime = moment(startTime).add(matchData.matchDuration, 'minutes');
        matchData.type === AppConstants.twoHalves || matchData.type === AppConstants.single
          ? endTime.add(matchData.breakDuration, 'minutes')
          : endTime
              .add(matchData.qtrBreak || matchData.breakDuration, 'minutes')
              .add(matchData.qtrBreak || matchData.breakDuration, 'minutes')
              .add(matchData.mainBreakDuration, 'minutes');
        if (!mustGetUmpireBySearch && startTime.isValid() && endTime.isValid()) {
          this.props.newUmpireListAction({
            entityTypes: this.state.isCompParent ? 1 : 6,
            compId: this.state.compId,
            compOrgId: this.state.compOrgId,
            isCompParent: this.state.isCompParent,
            matchStartTime: matchData.startTime,
            matchEndTime: moment(endTime).utc().format(),
            matchId: this.state.matchId,
            onlyUniqueUsers: true,
          });
        }
        this.props.resetUmpireListBoolAction();
        if (this.state.compId) {
          this.props.getUmpireAllocationSettings(this.state.compId);
        }
      }
    }

    if (prevProps.liveScoreState !== this.props.liveScoreState) {
      if (this.props.liveScoreState.loadScorers) {
        this.setState({});
      }
    }
  }

  getLiveScoreTeams(divisionId) {
    const isPools = this.state.gradesOrPoolsRefId === GradesOrPools.Pools;
    this.props.getliveScoreTeams(
      this.state.compId,
      isPools ? null : divisionId,
      this.state.compOrgId,
    );
  }

  ////set initial value for all validated fields
  setInitialFieldValue(data, start_date, start_time, displayTime) {
    // const formated_date = moment(start_date).format("DD-MM-YYYY");
    const time_formate = moment(displayTime).format('HH:mm');

    this.formRef.current.setFieldsValue({
      date: moment(start_date, 'DD-MM-YYYY'),
      time: moment(time_formate, 'HH:mm'),
      division: data.division ? data.division.name : '',
      type: data.type,
      home: data.team1.id,
      away: data.team2.id,
      round: data.roundId,
      venue: data.venueCourtId,
      matchDuration: data.matchDuration,
      mainBreak: data.type === 'FOUR_QUARTERS' ? data.mainBreakDuration : data.breakDuration,
      qtrBreak: data.breakDuration,
      addRound: '',
      extraTimeType: data.extraTimeType,
      extraTimeFor: data.extraTimeFor,
      extraTimeDuration: data.extraTimeDuration,
      // extraTimeHalfBreak: data.extraTimeType === 'FOUR_QUARTERS' ? data.extraTimeMainBreak : data.extraTimeBreak,
      extraTimeHalfBreak: data.extraTimeMainBreak,
      extraTimeQtrBreak: data.extraTimeBreak,
    });
  }
  /// /method to show modal view after click
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  /// /method to hide modal view after ok click
  handleOk = e => {
    this.setState({
      visible: false,
    });
  };

  /// /method to hide modal view after click on cancle button
  handleCancel = e => {
    this.setState({
      visible: false,
      createRound: '',
    });
  };

  onCreateRound = () => {
    const { addEditMatch, highestSequence } = this.props.liveScoreMatchState;
    const sequence = (highestSequence == -Infinity ? 0 : highestSequence) + 1;
    // const { id } = JSON.parse(getLiveScoreCompetition())
    const divisionID = addEditMatch.divisionId;

    this.props.liveScoreCreateRoundAction(
      this.state.createRound,
      sequence,
      this.state.compId,
      divisionID,
    );
    this.setState({ visible: false, createRound: '', roundLoad: true });
  };

  ////modal view
  ModalView() {
    return (
      <Modal
        title={AppConstants.round}
        visible={this.state.visible}
        onOk={this.state.createRound.length === 0 ? this.handleSubmit : this.onCreateRound}
        onCancel={this.handleCancel}
        onChange={createRound => this.props.liveScoreUpdateMatchAction(createRound, '')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        centered
      >
        <Form.Item
          name="addRound"
          rules={[{ required: false, message: ValidationConstants.roundField }]}
        >
          <InputWithHead
            required="required-field pb-0 pt-0"
            heading={AppConstants.round}
            placeholder={AppConstants.round}
            // value={this.state.createRound}
            onChange={e => this.setState({ createRound: e.target.value })}
          />
        </Form.Item>
      </Modal>
    );
  }

  onModalCancel() {
    this.setState({ forfeitVisible: false, abandonVisible: false });
    this.props.liveScoreUpdateMatchAction('', 'clearData');
  }

  forefeitedTeamResult = () => {
    const {
      addEditMatch,
      matchData,
      start_date,
      start_time,
      matchResult,
      forfietedTeam,
      matchTeamOfficials,
    } = this.props.liveScoreMatchState;

    const date = new Date();
    const endMatchDate = moment(date).format('YYYY-MM-DD');
    const endMatchTime = moment(date).format('HH:mm');
    const endMatchDateTime = moment(`${endMatchDate} ${endMatchTime}`);
    const formatEndMatchDate = new Date(endMatchDateTime).toISOString();
    const matchStatus = MatchStatus.Ended;
    const match_date_ = start_date ? moment(start_date, 'DD-MM-YYYY') : null;
    const startDate = match_date_ ? moment(match_date_).format('YYYY-MM-DD') : null;
    const start = start_time ? moment(start_time).format('HH:mm') : null;
    const datetimeA = moment(`${startDate} ${start}`);
    const formated__Date = new Date(datetimeA).toISOString();
    const { canRegenLadderPoints } = this.state;

    matchData.startTime = formated__Date;

    // const { id } = JSON.parse(getLiveScoreCompetition())
    matchData.resultStatus = addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus;

    if (forfietedTeam) {
      if (forfietedTeam === 'team1') {
        this.setState({ forfeitVisible: false });
        const team1resultId = matchResult[4].id;
        const team2resultId = matchResult[3].id;
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          formatEndMatchDate,
          this.state.umpireKey,
          null,
          null,
          null,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          canRegenLadderPoints,
          matchTeamOfficials,
          null,
        );
      } else if (forfietedTeam === 'team2') {
        this.setState({ forfeitVisible: false });
        const team1resultId = matchResult[3].id;
        const team2resultId = matchResult[4].id;
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          formatEndMatchDate,
          this.state.umpireKey,
          null,
          null,
          null,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          canRegenLadderPoints,
          matchTeamOfficials,
          null,
        );
      } else if (forfietedTeam === 'both') {
        this.setState({ forfeitVisible: false });
        const team1resultId = matchResult[5].id;
        const team2resultId = matchResult[5].id;
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          formatEndMatchDate,
          this.state.umpireKey,
          null,
          null,
          null,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          canRegenLadderPoints,
          matchTeamOfficials,
          null,
        );
      }
    } else {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(ValidationConstants.pleaseSelectTeam);
    }
  };

  ////modal view
  forfietModalView() {
    const { addEditMatch, forfietedTeam } = this.props.liveScoreMatchState;

    return (
      <Modal
        visible={this.state.forfeitVisible}
        onOk={this.handleMatchForfeit}
        // onCancel={() => this.setState({ forfeitVisible: false })}
        onCancel={() => this.onModalCancel()}
        // onChange={(createRound) => this.props.liveScoreUpdateMatchAction(createRound, "")}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        centered
      >
        <div className="col-sm">
          <InputWithHead required="required-field" heading={AppConstants.whichTeamForfeited} />

          <Select
            showSearch
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            onChange={value => this.props.liveScoreUpdateMatchAction(value, 'forfietedTeam')}
            value={forfietedTeam || undefined}
            placeholder="Select Team"
            optionFilterProp="children"
          >
            <Option key="team1" value="team1">
              {addEditMatch.team1.name}
            </Option>
            <Option key="team2" value="team2">
              {addEditMatch.team2.name}
            </Option>
            <Option key="both" value="both">
              Both
            </Option>
          </Select>
        </div>
      </Modal>
    );
  }

  abandonReasonResult = () => {
    const {
      addEditMatch,
      matchData,
      start_date,
      start_time,
      matchResult,
      abandoneReason,
      matchTeamOfficials,
    } = this.props.liveScoreMatchState;
    const date = new Date();
    const endMatchDate = moment(date).format('YYYY-MM-DD');
    const endMatchTime = moment(date).format('HH:mm');
    const endMatchDateTime = moment(`${endMatchDate} ${endMatchTime}`);
    const formatEndMatchDate = new Date(endMatchDateTime).toISOString();
    const matchStatus = MatchStatus.Ended;
    const match_date_ = start_date ? moment(start_date, 'DD-MM-YYYY') : null;
    const startDate = match_date_ ? moment(match_date_).format('YYYY-MM-DD') : null;
    const start = start_time ? moment(start_time).format('HH:mm') : null;
    const datetimeA = moment(`${startDate} ${start}`);
    const formated__Date = new Date(datetimeA).toISOString();
    const { canRegenLadderPoints } = this.state;

    matchData.startTime = formated__Date;

    // const { id } = JSON.parse(getLiveScoreCompetition())
    matchData.resultStatus = addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus;

    if (abandoneReason) {
      if (abandoneReason === 'Incomplete') {
        this.setState({ abandonVisible: false });
        const team1resultId = matchResult[7].id;
        const team2resultId = matchResult[7].id;
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          formatEndMatchDate,
          this.state.umpireKey,
          null,
          null,
          null,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          canRegenLadderPoints,
          matchTeamOfficials,
          null,
        );
      } else if (abandoneReason === 'notPlayed') {
        this.setState({ abandonVisible: false });
        const team1resultId = matchResult[8].id;
        const team2resultId = matchResult[8].id;
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          formatEndMatchDate,
          this.state.umpireKey,
          null,
          null,
          null,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          canRegenLadderPoints,
          matchTeamOfficials,
          null,
        );
      }
    } else {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(ValidationConstants.selectAbandonMatchReason);
    }
  };

  abandonMatchView() {
    const { addEditMatch, abandoneReason } = this.props.liveScoreMatchState;
    return (
      <Modal
        visible={this.state.abandonVisible}
        onOk={this.handleMatchAbandon}
        // onCancel={() => this.setState({ abandonVisible: false })}
        onCancel={() => this.onModalCancel()}
        // onChange={(createRound) => this.props.liveScoreUpdateMatchAction(createRound, "")}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        centered
      >
        <div className="col-sm">
          <InputWithHead required="required-field" heading={AppConstants.matchAbandoned} />

          <Select
            showSearch
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            onChange={value => this.props.liveScoreUpdateMatchAction(value, 'abandoneReason')}
            value={abandoneReason || undefined}
            placeholder="Select Reason"
            optionFilterProp="children"
          >
            <Option key="Incomplete" value="Incomplete">
              Incomplete
            </Option>
            <Option key="notPlayed" value="notPlayed">
              Not Played
            </Option>
          </Select>
          {addEditMatch?.competition?.teamRegChargeTypeRefId === 5 ? (
            <p className="warning-msg" style={{ fontSize: 13 }}>
              {AppConstants.abandonPerMatchWarning}
            </p>
          ) : null}
        </div>
      </Modal>
    );
  }

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {this.state.isEdit ? AppConstants.editMatch : AppConstants.addMatch}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    </div>
  );

  ////call api after change scorer
  onScorerChange(scorer, key) {
    const { addEditMatch } = this.props.liveScoreMatchState;
    addEditMatch.scorerStatus = scorer;
    this.props.liveScoreUpdateMatchAction(scorer, key);
  }

  onlyEvenNumbersValidator = (rule, value, callback) => {
    if (value && +value % 2 !== 0) {
      callback(AppConstants.onlyEvenNumbersError);
    } else {
      callback();
    }
  };

  /// Duration & Break View
  duration_break = () => {
    const { addEditMatch } = this.props.liveScoreMatchState;
    const { allDisabled } = this.state;
    return (
      <div className="row">
        <div className="col-sm">
          <div className="d-flex flex-row align-items-center">
            <InputWithHead required="required-field" heading={AppConstants.matchDuration} />
            <Tooltip>
              <span>{AppConstants.matchDurationMsg}</span>
            </Tooltip>
          </div>

          <Form.Item
            name="matchDuration"
            rules={[
              { required: true, message: ValidationConstants.durationField },
              { validator: this.onlyEvenNumbersValidator },
            ]}
          >
            <InputNumber
              // value={addEditMatch.matchDuration}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={matchDuration =>
                this.props.liveScoreUpdateMatchAction(matchDuration, 'matchDuration')
              }
              placeholder="0"
              disabled={allDisabled}
              data-testid={AppUniqueId.MATCH_DURATION}
            />
          </Form.Item>
        </div>
        <div className="col-sm">
          <div className="d-flex flex-row align-items-center">
            <InputWithHead required="required-field" heading={AppConstants.mainBreak} />
            <Tooltip>
              <span>{AppConstants.mainBreakMsg}</span>
            </Tooltip>
          </div>
          <Form.Item
            name="mainBreak"
            rules={[{ required: true, message: ValidationConstants.durationField }]}
          >
            <InputNumber
              // value={addEditMatch.mainBreakDuration}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={mainBreakDuration => {
                addEditMatch.type === AppConstants.twoHalves
                  ? this.props.liveScoreUpdateMatchAction(mainBreakDuration, 'breakDuration')
                  : this.props.liveScoreUpdateMatchAction(mainBreakDuration, 'mainBreakDuration');
              }}
              placeholder="0"
              disabled={allDisabled}
              data-testid={AppUniqueId.MAIN_BREAK}
            />
          </Form.Item>
        </div>
        {addEditMatch.type === 'FOUR_QUARTERS' && (
          <div className="col-sm">
            <div className="d-flex flex-row align-items-center">
              <InputWithHead required="required-field" heading={AppConstants.qtrBreak} />
              <Tooltip>
                <span>{AppConstants.qtrBreatMsg}</span>
              </Tooltip>
            </div>
            <Form.Item
              name="qtrBreak"
              rules={[{ required: true, message: ValidationConstants.durationField }]}
            >
              <InputNumber
                // value={addEditMatch.qtrBreak}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={qtrBreak => this.props.liveScoreUpdateMatchAction(qtrBreak, 'qtrBreak')}
                placeholder="0"
                disabled={allDisabled}
              />
            </Form.Item>
          </div>
        )}
      </div>
    );
  };

  handleSubmit = values => {};

  selectDivision(divisionId) {
    this.props.liveScoreUpdateMatchAction(divisionId, 'divisionId');
    this.setState({ selectedDivision: divisionId });
    // const { id } = JSON.parse(getLiveScoreCompetition())
    this.getLiveScoreTeams(divisionId);
    this.props.liveScoreRoundListAction(this.state.compId, divisionId);
  }

  setUmpireClub(clubId) {
    this.props.liveScoreUpdateMatchAction(clubId, 'umpireClubId');
  }

  ///// On Court Search
  onSearchCourts(value, key) {
    this.props.searchFilterAction(value, key);
  }

  onSearchTeams(value, key) {
    // const { id } = JSON.parse(getLiveScoreCompetition())
    // this.props.onTeamSearch(id, this.state.selectedDivision ,value, key)
  }

  getTeamName(team) {
    if (this.state.gradesOrPoolsRefId === GradesOrPools.Pools) {
      if (team.division && team.division.name) {
        return `${team.name} (${team.division.name})`;
      }
    }
    return team.name;
  }

  handleScorerSearch = (search, key) => {
    this.onScorerChange(null, key);
    this.props.liveScoreClearScorerList();
    const { matchData } = this.props.liveScoreMatchState;
    const { compId, matchId } = this.state;
    let startTime = moment(matchData.startTime);
    let endTime = moment(startTime).add(matchData.matchDuration, 'minutes');
    if (isNotNullOrEmptyString(search) && search.trim() !== '') {
      this.props.getliveScoreAvailableScorerList({
        competitionId: compId,
        matchStartTime: startTime,
        matchEndTime: moment(endTime).utc().format(),
        matchId: matchId,
        search,
      });
    }
  };

  getScorerOptions = (scorer, selectedScorerId) => {
    const { availableScoreListResult } = this.props.liveScoreState;
    if (availableScoreListResult?.length) {
      return availableScoreListResult;
    }

    return selectedScorerId && scorer && selectedScorerId === scorer.id
      ? [
          {
            id: scorer.id,
            firstName: scorer.firstName,
            lastName: scorer.lastName,
            nameWithNumber: scorer.nameWithNumber,
          },
        ]
      : [];
  };

  getSelectedScorer = (options, selectedScorerId) => {
    return options.find(o => o.id === selectedScorerId);
  };

  //// Form View
  contentView = () => {
    const {
      matchData,
      addEditMatch,
      divisionList,
      roundList,
      teamResult,
      scorer1,
      scorerId_1,
      atCourtUmpires,
    } = this.props.liveScoreMatchState;
    const recordUmpireType = this.recordUmpireType;
    const { venueData } = this.props.liveScoreMatchState;
    const { loadScorers } = this.props.liveScoreState;
    const { allDisabled } = this.state;
    const { whoScoring } = this.props.liveScoreSetting.form;
    const scorerDisabled = whoScoring === WhoScoring.Court;
    const scorer1Options = this.getScorerOptions(scorer1, scorerId_1);
    const selectedScorer1 = this.getSelectedScorer(scorer1Options, scorerId_1);
    const { AnyoneCanBeUmpire } = this.umpireSequenceSettings;

    // Update to team names if it is not exists in the team list.
    if (this.formRef.current) {
      const team1Id = this.formRef.current.getFieldValue('home');
      if (team1Id && team1Id !== addEditMatch.team1.name) {
        if (!teamResult.find(t => t.id === team1Id)) {
          this.formRef.current.setFieldsValue({
            home: addEditMatch.team1.name,
          });
        }
      }
      const team2Id = this.formRef.current.getFieldValue('away');
      if (team2Id && team2Id !== addEditMatch.team2.name) {
        if (!teamResult.find(t => t.id === team2Id)) {
          this.formRef.current.setFieldsValue({
            away: addEditMatch.team2.name,
          });
        }
      }
    }
    let showUmpireSelectionView =
      recordUmpireType === RECORDUMPIRETYPE.Users && addEditMatch.divisionId > 0;
    let umpireAllocationSetting = this.props.umpireSettingState.allocationSettingsData;
    if (
      umpireAllocationSetting &&
      umpireAllocationSetting.noUmpiresUmpireAllocationSetting &&
      showUmpireSelectionView
    ) {
      if (umpireAllocationSetting.noUmpiresUmpireAllocationSetting.allDivisions) {
        showUmpireSelectionView = false;
      } else if (umpireAllocationSetting.noUmpiresUmpireAllocationSetting.divisions) {
        let noUmpire = umpireAllocationSetting.noUmpiresUmpireAllocationSetting.divisions.some(
          x => x.id == addEditMatch.divisionId,
        );
        if (noUmpire) {
          showUmpireSelectionView = false;
        }
      }
    }

    const team1 = teamResult.find(t => t.id === matchData.team1Id);
    const team2 = teamResult.find(t => t.id === matchData.team2Id);

    return (
      <div className="content-view pt-4">
        <div className="row">
          <div className="col-sm">
            <InputWithHead required="required-field" heading={AppConstants.date} />

            <Form.Item
              name="date"
              rules={[{ required: true, message: ValidationConstants.dateField }]}
            >
              <DatePicker
                // size="large"
                className="w-100"
                data-testid={AppUniqueId.DATE_PICKER}
                onChange={date => this.props.liveScoreUpdateMatchAction(date, 'start_date')}
                format="DD-MM-YYYY"
                showTime={false}
                name="registrationOepn"
                placeholder="dd-mm-yyyy"
                disabled={allDisabled}
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.startTime} />
            <Form.Item
              name="time"
              rules={[{ required: true, message: ValidationConstants.timeField }]}
            >
              <TimePicker
                className="comp-venue-time-timepicker w-100"
                onChange={time => this.props.liveScoreUpdateMatchAction(time, 'start_time')}
                onBlur={e =>
                  this.props.liveScoreUpdateMatchAction(
                    e.target.value && moment(e.target.value, 'HH:mm'),
                    'start_time',
                  )
                }
                format="HH:mm"
                placeholder="Select Time"
                data-testid={AppUniqueId.SELECT_TIME}
                defaultValue={moment('00:00', 'HH:mm')}
                use12Hours={false}
                disabled={allDisabled}
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <InputWithHead required="required-field" heading={AppConstants.division} />
            <Form.Item
              name="division"
              rules={[{ required: true, message: ValidationConstants.divisionField }]}
            >
              <Select
                showSearch
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={divisionName => this.selectDivision(divisionName)}
                // value={addEditMatch.divisionId}
                placeholder="Select Division"
                data-testid={AppUniqueId.MATCH_DIVISION}
                optionFilterProp="children"
                disabled={allDisabled}
              >
                {isArrayNotEmpty(divisionList) &&
                  divisionList.map(item => (
                    <Option
                      key={`division_${item.id}`}
                      value={item.id}
                      data-testid={AppUniqueId.SELECT_DIVISION + `${item.name}`}
                    >
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-sm">
            <InputWithHead required="required-field" heading={AppConstants.type} />
            <Form.Item
              name="type"
              rules={[{ required: true, message: ValidationConstants.typeField }]}
            >
              <Select
                loading={addEditMatch.team1 && false}
                className="w-100"
                data-testid={AppUniqueId.MATCH_TYPE}
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={type => {
                  if (
                    type === AppConstants.twoHalves &&
                    addEditMatch.type === AppConstants.fourQuarters &&
                    addEditMatch.mainBreakDuration
                  ) {
                    this.props.liveScoreUpdateMatchAction(
                      addEditMatch.mainBreakDuration,
                      'breakDuration',
                    );
                  } else if (
                    type === AppConstants.fourQuarters &&
                    addEditMatch.type === AppConstants.twoHalves &&
                    addEditMatch.breakDuration
                  ) {
                    this.props.liveScoreUpdateMatchAction(
                      addEditMatch.breakDuration,
                      'mainBreakDuration',
                    );
                    this.formRef.current.setFieldsValue({
                      qtrBreak: addEditMatch.qtrBreak || addEditMatch.breakDuration,
                    });
                  }
                  this.props.liveScoreUpdateMatchAction(type, 'type');
                }}
                // value={addEditMatch.type}
                placeholder="Select Type"
                disabled={allDisabled}
              >
                {/* <Option value="SINGLE">Single</Option> */}
                <Option value="TWO_HALVES" data-testid={AppUniqueId.SELECT_HALVES}>
                  Halves
                </Option>
                <Option value="FOUR_QUARTERS">Quarters</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <InputWithHead
              value={
                isNotNullOrEmptyString(addEditMatch.competition.name)
                  ? addEditMatch.competition.name
                  : isArrayNotEmpty(divisionList)
                  ? divisionList[0].competition.name
                  : ''
              }
              disabled
              heading={AppConstants.competition}
              placeholder={AppConstants.competition}
            />
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.matchID} />
            <InputNumber
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={mnbMatchId =>
                this.props.liveScoreUpdateMatchAction(mnbMatchId, 'mnbMatchId')
              }
              value={addEditMatch.mnbMatchId ? addEditMatch.mnbMatchId : ''}
              placeholder="0"
              disabled={allDisabled}
            />
          </div>
        </div>
        {addEditMatch.divisionId && (
          <div className="row">
            <div className="col-sm-6">
              <InputWithHead required="required-field" heading={AppConstants.homeTeam} />
              <Form.Item
                name="home"
                rules={[
                  { required: true, message: ValidationConstants.homeField },
                  {
                    validator: (_, value) => {
                      if (value === addEditMatch.team2Id) {
                        return Promise.reject(ValidationConstants.teamsMustBeDifferent);
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  className="reg-form-multiple-select w-100"
                  placeholder="Select Home Team"
                  data-testid={AppUniqueId.HOME_TEAM}
                  onChange={homeTeam => this.props.liveScoreUpdateMatchAction(homeTeam, 'team1Id')}
                  // value={addEditMatch.team1Id ? addEditMatch.team1Id : ''}
                  // onSearch={(e) => this.onSearchTeams(e, "homeTeam")}
                  optionFilterProp="children"
                  disabled={allDisabled}
                >
                  {isArrayNotEmpty(teamResult) &&
                    teamResult.map(item => (
                      <Option
                        key={`homeTeam_${item.id}`}
                        value={item.id}
                        data-testid={AppUniqueId.SELECT_HOME_TEAM + item.id}
                      >
                        {this.getTeamName(item)}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
            <div className="col-sm-6">
              <InputWithHead required="required-field" heading={AppConstants.awayTeam} />
              <Form.Item
                name="away"
                rules={[
                  { required: true, message: ValidationConstants.awayField },
                  {
                    validator: (_, value) => {
                      if (value === addEditMatch.team1Id) {
                        return Promise.reject(ValidationConstants.teamsMustBeDifferent);
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  onSearch={e => this.onSearchTeams(e, 'awayTeam')}
                  disabled={allDisabled}
                  optionFilterProp="children"
                  className="reg-form-multiple-select w-100"
                  placeholder="Select Away Team"
                  data-testid={AppUniqueId.AWAY_TEAM}
                  onChange={awayTeam => this.props.liveScoreUpdateMatchAction(awayTeam, 'team2Id')}
                  // value={addEditMatch.team2Id ? addEditMatch.team2Id : ''}
                >
                  {isArrayNotEmpty(teamResult) &&
                    teamResult.map(item => (
                      <Option
                        key={`awayTeam_${item.id}`}
                        value={item.id}
                        data-testid={AppUniqueId.SELECT_AWAY_TEAM + item.id}
                      >
                        {this.getTeamName(item)}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-sm-6">
            <InputWithHead required="required-field" heading={AppConstants.venue} />
            <Form.Item
              name="venue"
              rules={[{ required: true, message: ValidationConstants.venueField }]}
            >
              <Select
                showSearch
                className="reg-form-multiple-select w-100"
                placeholder={AppConstants.selectVenue}
                data-testid={AppUniqueId.MATCH_VENUE}
                onChange={venueId => this.props.liveScoreUpdateMatchAction(venueId, 'venueId')}
                // value={addEditMatch.venueCourtId}
                onSearch={e => this.onSearchCourts(e, 'courts')}
                optionFilterProp="children"
                disabled={allDisabled}
              >
                {venueData &&
                  venueData.map(item => (
                    <Option
                      key={`venue_${item.venueCourtId}`}
                      value={item.venueCourtId}
                      data-testid={AppUniqueId.SELECT_MATCH_VENUE + item.venueCourtId}
                    >
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          {addEditMatch.divisionId && (
            <div className="col-sm-6">
              <InputWithHead required="required-field" heading={AppConstants.round} />
              <Form.Item
                name="round"
                rules={[{ required: true, message: ValidationConstants.roundField }]}
              >
                <Select
                  // mode="multiple"
                  showSearch
                  onChange={round => this.props.liveScoreUpdateMatchAction(round, 'roundId')}
                  placeholder="Select Round"
                  data-testid={AppUniqueId.MATCH_ROUND}
                  className="w-100"
                  // value={addEditMatch.roundId ? addEditMatch.roundId : ''}
                  optionFilterProp="children"
                  disabled={allDisabled}
                >
                  {isArrayNotEmpty(roundList) &&
                    roundList.map(item => (
                      <Option data-testid={AppUniqueId.SELECT_MATCH_ROUND + item.id} key={`round_${item.id}`} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <span
                style={{ cursor: 'pointer', paddingTop: 11 }}
                onClick={() => (allDisabled === false ? this.showModal() : null)}
                className="input-heading-add-another"
              >
                + {AppConstants.addNewRound}
              </span>
            </div>
          )}
        </div>
        {this.duration_break()}

        {this.finalFieldsView()}

        {/* Umpire */}
        <div className="text-heading-large pt-5">
          <h2>{AppConstants.matchRosters}</h2>
        </div>
        {
          !!(addEditMatch && this.props.umpireSettingState.allocationSettingsData && this.competition) &&
          <MatchOfficialEdit
            matchId={addEditMatch.id}
            competitionId={this.state.compId}
            isCompParent={this.state.isCompParent}
            settings={{
              matchSettings: this.props.liveScoreMatchState,
              umpireAllocationSettings: this.props.umpireSettingState.allocationSettingsData,
              competitionSettings: this.competition,
            }}
          />
        }
        <div className="row">
          <div className="col-sm-6">
            <InputWithHead heading={AppConstants.scorer1} />
            <AutoComplete
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              disabled={allDisabled || scorerDisabled}
              notFoundContent={loadScorers ? <Spin size="small" /> : null}
              placeholder={`Search ${AppConstants.scorerName}`}
              onSelect={(_, scorer1) => this.onScorerChange(scorer1.userId, 'scorerId_1')}
              onSearch={search => this.debouncedScorerSearch(search, 'scorerId_1')}
              value={
                selectedScorer1
                  ? selectedScorer1.firstName + ' ' + selectedScorer1.lastName
                  : undefined
              }
              allowClear={true}
              onClear={search => this.handleScorerSearch(search, 'scorerId_1')}
            >
              {scorer1Options.map(item =>
                selectedScorer1 && selectedScorer1.id === item.id ? (
                  <Option
                    key={`scorer1_${item.id}`}
                    userId={item.id} //non-standard prop
                    value={item.firstName + ' ' + item.lastName + `(${item.id})`}
                    className="selected-borrow-player"
                  >
                    {item.nameWithNumber}
                  </Option>
                ) : (
                  <Option
                    key={`scorer1_${item.id}`}
                    userId={item.id} //non-standard prop
                    value={item.firstName + ' ' + item.lastName + `(${item.id})`}
                  >
                    {item.nameWithNumber}
                  </Option>
                ),
              )}
            </AutoComplete>
          </div>
        </div>

        {this.state.isEdit && (
          <>
            <div className="text-heading-large pt-5">
              <h2>{AppConstants.matchScores}</h2>
            </div>
            <div className="row">
              <div className="col-sm">
                <InputWithHead
                  heading={AppConstants.homeTeamFinalScore}
                  placeholder={AppConstants.enterHomeTeamFinalScore}
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team1Score')
                  }
                  name="team1Score"
                  value={addEditMatch.team1Score}
                  disabled={allDisabled}
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  heading={AppConstants.awayTeamFinalScore}
                  placeholder={AppConstants.enterAwayTeamFinalScore}
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team2Score')
                  }
                  name="team2Score"
                  value={addEditMatch.team2Score}
                  disabled={allDisabled}
                />
              </div>
            </div>
          </>
        )}
        {this.state.isEdit && this.scoreBreakdownView()}
        {!isFootball ? null : (
          <div className="row">
            <div className="col-sm">
              <InputWithHead
                heading={AppConstants.homeTeamPenaltyScore}
                placeholder={AppConstants.enterHomeTeamPenaltyScore}
                type="number"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PenaltyScore')
                }
                name="team1PenaltyScore"
                value={addEditMatch.team1PenaltyScore}
                disabled={allDisabled}
              />
            </div>
            <div className="col-sm">
              <InputWithHead
                heading={AppConstants.awayTeamPenaltyScore}
                placeholder={AppConstants.enterAwayTeamPenlatyScore}
                type="number"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PenaltyScore')
                }
                name="team2PenaltyScore"
                value={addEditMatch.team2PenaltyScore}
                disabled={allDisabled}
              />
            </div>
          </div>
        )}
        {this.state.isEdit && (
          <div className="row">
            <div className="col-sm-6">
              <InputWithHead heading={AppConstants.resultStatus} />
              <Select
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={value => this.props.liveScoreUpdateMatchAction(value, 'resultStatus')}
                placeholder="Select Result Status"
                value={addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus}
                disabled={allDisabled}
              >
                <Option key="UNCONFIRMED" value="UNCONFIRMED">
                  Unconfirmed
                </Option>
                <Option key="DISPUTE" value="DISPUTE">
                  Dispute
                </Option>
                <Option key="FINAL" value="FINAL">
                  Final
                </Option>
              </Select>
            </div>
          </div>
        )}

        {this.state.isEdit && (
          <LiveScoreMatchTeamOfficials
            competitionId={this.state.compId}
            matchId={this.state.matchId}
            team1={team1}
            team2={team2}
          />
        )}
      </div>
    );
  };

  finalFieldsView() {
    const { addEditMatch } = this.props.liveScoreMatchState;

    return (
      <div>
        <Checkbox
          className="single-checkbox mt-5  justify-content-center"
          onChange={e => this.props.liveScoreUpdateMatchAction(e.target.checked, 'isFinals')}
          checked={addEditMatch.isFinals}
          disabled={this.state.umpireKey === 'umpire'}
        >
          {AppConstants.extra_Time}
        </Checkbox>

        {addEditMatch.isFinals && (
          <div>
            <span className="input-heading" style={{ fontSize: 18, paddingBottom: 15 }}>
              {AppConstants.extra_Time}
            </span>

            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.extraTimeType} />
                <Form.Item name="extraTimeType">
                  <Select
                    showSearch
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    placeholder="Select Type"
                    optionFilterProp="children"
                    onChange={extraTimeType => {
                      // if (
                      //   extraTimeType === AppConstants.twoHalves &&
                      //   addEditMatch.extraTimeType === AppConstants.fourQuarters &&
                      //   addEditMatch.extraTimeMainBreak
                      // ) {
                      //   this.props.liveScoreUpdateMatchAction(
                      //     addEditMatch.extraTimeMainBreak,
                      //     'extraTimeBreak',
                      //   );
                      // } else if (
                      //   extraTimeType === AppConstants.fourQuarters &&
                      //   addEditMatch.extraTimeType === AppConstants.twoHalves &&
                      //   addEditMatch.extraTimeBreak
                      // ) {
                      //   this.props.liveScoreUpdateMatchAction(
                      //     addEditMatch.extraTimeBreak,
                      //     'extraTimeMainBreak',
                      //   );
                      //   this.formRef.current.setFieldsValue({
                      //     extraTimeQtrBreak:
                      //       addEditMatch.extraTimeQtrBreak || addEditMatch.extraTimeBreak,
                      //   });
                      // }
                      this.props.liveScoreUpdateMatchAction(extraTimeType, 'extraTimeType');
                    }}
                    //value={addEditMatch.extraTimeType ? addEditMatch.extraTimeType : undefined}
                    disabled={this.state.umpireKey === 'umpire'}
                  >
                    <Option key="SINGLE_PERIOD" value="SINGLE_PERIOD">
                      Single Period
                    </Option>
                    <Option key="TWO_HALVES" value="TWO_HALVES">
                      Halves
                    </Option>
                    <Option key="FOUR_QUARTERS" value="FOUR_QUARTERS">
                      Quarters
                    </Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="col-sm">
                <InputWithHead heading={AppConstants.extraTimeDuration} />
                <InputNumber
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0"
                  onChange={matchDuration =>
                    this.props.liveScoreUpdateMatchAction(matchDuration, 'extraTimeDuration')
                  }
                  value={addEditMatch.extraTimeDuration}
                  disabled={this.state.umpireKey === 'umpire'}
                />
              </div>

              <div className="col-sm">
                <InputWithHead heading={AppConstants.extraTimeMainBreak} />
                <Form.Item name="extraTimeHalfBreak">
                  <InputNumber
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                    onChange={extraTimeMainBreak => {
                      addEditMatch.extraTimeType === AppConstants.twoHalves
                        ? this.props.liveScoreUpdateMatchAction(
                            extraTimeMainBreak,
                            'extraTimeBreak',
                          )
                        : this.props.liveScoreUpdateMatchAction(
                            extraTimeMainBreak,
                            'extraTimeMainBreak',
                          );
                    }}
                    // value={addEditMatch.extraTimeType === AppConstants.fourQuarters ? addEditMatch.extraTimeMainBreak : addEditMatch.extraTimeBreak}
                    disabled={this.state.umpireKey === 'umpire'}
                  />
                </Form.Item>
              </div>

              {addEditMatch.extraTimeType === 'FOUR_QUARTERS' && (
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.extraTimeqtrBreak} />
                  <Form.Item name="extraTimeQtrBreak">
                    <InputNumber
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                      onChange={extraTimeQtrBreak =>
                        this.props.liveScoreUpdateMatchAction(extraTimeQtrBreak, 'extraTimeBreak')
                      }
                      //value={addEditMatch.extraTimeBreak}
                    />
                  </Form.Item>
                </div>
              )}
            </div>

            {this.extraExtraSettings(addEditMatch)}
          </div>
        )}
      </div>
    );
  }

  extraExtraSettings = addEditMatch => {
    if (isBasketball) {
      return (
        <Form.Item name="extraTimeFor" style={{ paddingTop: 15 }}>
          <Radio.Group
            name="extraTimeFor"
            className="reg-competition-radio"
            onChange={e => this.props.liveScoreUpdateMatchAction(e.target.value, 'extraTimeFor')}
            value={addEditMatch.extraTimeFor}
            style={{
              overflowX: 'unset',
            }}
          >
            <div className="row mt-0">
              <div className="col-sm-12 d-flex align-items-center">
                <Radio value="ONE">{AppConstants.oneExtraTimeForDraw}</Radio>
              </div>

              <div className="col-sm-12 d-flex align-items-center">
                <Radio value="ALL">{AppConstants.extraTimeForAllDraws}</Radio>
              </div>
            </div>
          </Radio.Group>
        </Form.Item>
      );
    }
    if (isNetball) {
      return (
        <>
          <span className="input-heading" style={{ fontSize: 18, paddingBottom: 15 }}>
            {AppConstants.extraTime}
          </span>

          <InputWithHead heading={AppConstants.extraTimeIfDraw2} />
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.props.liveScoreUpdateMatchAction(e.target.value, 'extraTimeWinByGoals')
            }
            value={addEditMatch.extraTimeWinByGoals}
            disabled={this.state.umpireKey === 'umpire'}
          >
            <Radio key={1} value={1}>
              {AppConstants.winByOneGoal}
            </Radio>
            <Radio key={2} value={2}>
              {AppConstants.winByTwoGoals}
            </Radio>
            <Radio key={0} value={0}>
              {AppConstants.none}
            </Radio>
          </Radio.Group>
        </>
      );
    }

    return <></>;
  };

  getTeamPeriodScore(period, key) {
    const { matchScoresData } = this.props.liveScoreMatchState;
    const found = matchScoresData.find(x => x.period === period);
    if (found) {
      return found[key];
    }

    return 0;
  }

  scoreBreakdownView() {
    const { allDisabled } = this.state;
    const { addEditMatch } = this.props.liveScoreMatchState;
    return (
      <div className="row">
        <div className="col-sm pl-5">
          <InputWithHead heading={AppConstants.homeTeamScoreBreakdown} />
          <div className="row">
            <div className="col-xl-5 col-lg-6">
              <InputWithHead
                heading={AppConstants.period1}
                placeholder="0"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 1)
                }
                name="team1PeriodScore"
                value={this.getTeamPeriodScore(1, 'team1Score')}
                disabled={allDisabled}
              />
            </div>
            <div className="col-xl-5 col-lg-6">
              <InputWithHead
                heading={AppConstants.period2}
                placeholder="0"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 2)
                }
                name="team1PeriodScore"
                value={this.getTeamPeriodScore(2, 'team1Score')}
                disabled={allDisabled}
              />
            </div>
          </div>
          {addEditMatch.type === 'FOUR_QUARTERS' && (
            <div className="row">
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.period3}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 3)
                  }
                  name="team1PeriodScore"
                  value={this.getTeamPeriodScore(3, 'team1Score')}
                  disabled={allDisabled}
                />
              </div>
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.period4}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 4)
                  }
                  name="team1PeriodScore"
                  value={this.getTeamPeriodScore(4, 'team1Score')}
                  disabled={allDisabled}
                />
              </div>
            </div>
          )}
          {addEditMatch.isFinals && (
            <div className="row">
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.extra_Time}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 5)
                  }
                  name="team1PeriodScore"
                  value={this.getTeamPeriodScore(5, 'team1Score')}
                  disabled={allDisabled}
                />
              </div>
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.extraTime}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team1PeriodScore', 6)
                  }
                  name="team1PeriodScore"
                  value={this.getTeamPeriodScore(6, 'team1Score')}
                  disabled={allDisabled}
                />
              </div>
            </div>
          )}
        </div>
        <div className="col-sm pl-5">
          <InputWithHead heading={AppConstants.awayTeamScoreBreakdown} />
          <div className="row">
            <div className="col-xl-5 col-lg-6">
              <InputWithHead
                heading={AppConstants.period1}
                placeholder="0"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 1)
                }
                name="team2PeriodScore"
                value={this.getTeamPeriodScore(1, 'team2Score')}
                disabled={allDisabled}
              />
            </div>
            <div className="col-xl-5 col-lg-6">
              <InputWithHead
                heading={AppConstants.period2}
                placeholder="0"
                onChange={event =>
                  this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 2)
                }
                name="team2PeriodScore"
                value={this.getTeamPeriodScore(2, 'team2Score')}
                disabled={allDisabled}
              />
            </div>
          </div>
          {addEditMatch.type === 'FOUR_QUARTERS' && (
            <div className="row">
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.period3}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 3)
                  }
                  name="team2PeriodScore"
                  value={this.getTeamPeriodScore(3, 'team2Score')}
                  disabled={allDisabled}
                />
              </div>
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.period4}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 4)
                  }
                  name="team2PeriodScore"
                  value={this.getTeamPeriodScore(4, 'team2Score')}
                  disabled={allDisabled}
                />
              </div>
            </div>
          )}
          {addEditMatch.isFinals && (
            <div className="row">
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.extra_Time}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 5)
                  }
                  name="team2PeriodScore"
                  value={this.getTeamPeriodScore(5, 'team2Score')}
                  disabled={allDisabled}
                />
              </div>
              <div className="col-xl-5 col-lg-6">
                <InputWithHead
                  heading={AppConstants.extraTime}
                  placeholder="0"
                  onChange={event =>
                    this.props.liveScoreUpdateMatchAction(event.target.value, 'team2PeriodScore', 6)
                  }
                  name="team2PeriodScore"
                  value={this.getTeamPeriodScore(6, 'team2Score')}
                  disabled={allDisabled}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  endMatchResult = () => {
    const {
      addEditMatch,
      matchData,
      start_date,
      start_time,
      matchResult,
      matchTeamOfficials,
    } = this.props.liveScoreMatchState;
    const { canRegenLadderPoints } = this.state;
    const recordUmpireType = this.recordUmpireType;
    const date = new Date();
    const endMatchDate = moment(date).format('YYYY-MM-DD');
    const endMatchTime = moment(date).format('HH:mm');
    const endMatchDateTime = moment(`${endMatchDate} ${endMatchTime}`);
    const formatEndMatchDate = new Date(endMatchDateTime).toISOString();
    const matchStatus = MatchStatus.Ended;
    const match_date_ = start_date ? moment(start_date, 'DD-MM-YYYY') : null;
    const startDate = match_date_ ? moment(match_date_).format('YYYY-MM-DD') : null;
    const start = start_time ? moment(start_time).format('HH:mm') : null;
    const datetimeA = moment(`${startDate} ${start}`);
    const formated__Date = new Date(datetimeA).toISOString();

    matchData.startTime = formated__Date;
    matchData.resultStatus = addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus;

    const umpireScorerData = this.buildUmpireScorerData();
    let umpireData = umpireScorerData[0];
    let scorerData = umpireScorerData[1];

    const officialData = this.buildOfficialData();

    //handle missing data
    let compOrgMissing = false;
    let umpireNameMissing = false;
    for (let umpire of umpireData) {
      if (!umpire.competitionOrganisationId) {
        compOrgMissing = true;
      }
      if (!umpire.umpireName || _.trim(umpire.umpireName) === '') {
        umpireNameMissing = true;
      }
    }
    if (compOrgMissing) message.error(AppConstants.umpireOrgMissingWarning);
    if (umpireNameMissing) message.error(AppConstants.umpireNameMissingWarning);
    if (compOrgMissing || umpireNameMissing) {
      return;
    }

    if (Number(addEditMatch.team1Score) > Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[0].id;
      const team2resultId = matchResult[1].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    } else if (Number(addEditMatch.team1Score) < Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[1].id;
      const team2resultId = matchResult[0].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    } else if (Number(addEditMatch.team1Score) == Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[2].id;
      const team2resultId = matchResult[2].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    }
  };

  unEndMatchResult = () => {
    const { staticMatchData } = this.props.liveScoreMatchState;
    this.props.liveScoreUnEndMatchAction(staticMatchData.id);
  };

  postponeMatchResult = () => {
    const {
      addEditMatch,
      matchData,
      start_date,
      start_time,
      matchResult,
      staticMatchData,
      matchTeamOfficials,
    } = this.props.liveScoreMatchState;
    const isPostpone =
      staticMatchData.matchStatus === MatchStatus.Postponed ||
      staticMatchData.matchStatusRefId === MatchStatusRefId.Postponed;
    const { canRegenLadderPoints } = this.state;
    const recordUmpireType = this.recordUmpireType;
    const date = new Date();
    const endMatchDate = moment(date).format('YYYY-MM-DD');
    const endMatchTime = moment(date).format('HH:mm');
    const endMatchDateTime = moment(`${endMatchDate} ${endMatchTime}`);
    const formatEndMatchDate = new Date(endMatchDateTime).toISOString();
    const matchStatus = !isPostpone ? MatchStatus.Postponed : '';
    const match_date_ = start_date ? moment(start_date, 'DD-MM-YYYY') : null;
    const startDate = match_date_ ? moment(match_date_).format('YYYY-MM-DD') : null;
    const start = start_time ? moment(start_time).format('HH:mm') : null;
    const datetimeA = moment(`${startDate} ${start}`);
    const formated__Date = new Date(datetimeA).toISOString();

    matchData.startTime = formated__Date;
    matchData.resultStatus = addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus;

    const umpireScorerData = this.buildUmpireScorerData();
    let umpireData = umpireScorerData[0];
    let scorerData = umpireScorerData[1];
    const officialData = this.buildOfficialData();

    //handle missing data
    let compOrgMissing = false;
    let umpireNameMissing = false;
    for (let umpire of umpireData) {
      if (!umpire.competitionOrganisationId) {
        compOrgMissing = true;
      }
      if (!umpire.umpireName || _.trim(umpire.umpireName) === '') {
        umpireNameMissing = true;
      }
    }
    if (compOrgMissing) message.error(AppConstants.umpireOrgMissingWarning);
    if (umpireNameMissing) message.error(AppConstants.umpireNameMissingWarning);
    if (compOrgMissing || umpireNameMissing) {
      return;
    }

    if (Number(addEditMatch.team1Score) > Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[0].id;
      const team2resultId = matchResult[1].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    } else if (Number(addEditMatch.team1Score) < Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[1].id;
      const team2resultId = matchResult[0].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    } else if (Number(addEditMatch.team1Score) == Number(addEditMatch.team2Score)) {
      const team1resultId = matchResult[2].id;
      const team2resultId = matchResult[2].id;
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        formatEndMatchDate,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        canRegenLadderPoints,
        matchTeamOfficials,
        officialData,
      );
    }
  };

  ////create match post method
  addMatchDetails = () => {
    const {
      addEditMatch, /// /////get api response data
      matchData, /// ///post data after updating
      staticMatchData, // static match data
      start_date,
      start_time,
      matchResult,
      matchTeamOfficials,
    } = this.props.liveScoreMatchState;
    const recordUmpireType = this.recordUmpireType;
    const match_date_ = moment(start_date, 'DD-MM-YYYY');
    const startDate = moment(match_date_).format('YYYY-MM-DD');
    const start = moment(start_time).format('HH:mm');
    const datetimeA = moment(`${startDate} ${start}`);
    const formated__Date = new Date(datetimeA).toISOString();

    matchData.startTime = formated__Date;
    const umpireScorerData = this.buildUmpireScorerData();
    let umpireData = umpireScorerData[0];
    let scorerData = umpireScorerData[1];

    const officialData = this.buildOfficialData();

    //handle missing data
    let compOrgMissing = false;
    let umpireNameMissing = false;
    for (let umpire of umpireData) {
      if (!umpire.competitionOrganisationId) {
        compOrgMissing = true;
      }
      if (!umpire.umpireName || _.trim(umpire.umpireName) === '') {
        umpireNameMissing = true;
      }
    }
    if (compOrgMissing) message.error(AppConstants.umpireOrgMissingWarning);
    if (umpireNameMissing) message.error(AppConstants.umpireNameMissingWarning);
    if (compOrgMissing || umpireNameMissing) {
      return;
    }

    let matchStatus = null;
    let team1resultId = null;
    let team2resultId = null;
    if (matchData.id != 0) {
      if (Number(addEditMatch.team1Score) > Number(addEditMatch.team2Score)) {
        team1resultId = matchResult[0].id;
        team2resultId = matchResult[1].id;
      } else if (Number(addEditMatch.team1Score) < Number(addEditMatch.team2Score)) {
        team1resultId = matchResult[1].id;
        team2resultId = matchResult[0].id;
      } else if (Number(addEditMatch.team1Score) == Number(addEditMatch.team2Score)) {
        team1resultId = matchResult[2].id;
        team2resultId = matchResult[2].id;
      }
      matchStatus = addEditMatch.matchStatus === '0' ? null : addEditMatch.matchStatus;
      matchData.resultStatus = addEditMatch.resultStatus == '0' ? null : addEditMatch.resultStatus;
    }

    const isPlaceholderMatch =
      !staticMatchData?.isLocked &&
      (staticMatchData?.team1?.isPlaceholder || staticMatchData?.team2?.isPlaceholder);

    if (staticMatchData.isLocked) {
      matchData.isLocked = true;
    } else {
      matchData.isLocked =
        isPlaceholderMatch &&
        (!staticMatchData?.team1?.isPlaceholder ||
          (staticMatchData?.team1?.isPlaceholder &&
            staticMatchData?.team1?.id !== matchData.team1Id)) &&
        (!staticMatchData?.team2?.isPlaceholder ||
          (staticMatchData?.team2?.isPlaceholder &&
            staticMatchData?.team2?.id !== matchData.team2Id));
    }

    if (this.state.sourceIdAvailable) {
      let showModal = false;
      if (staticMatchData.startTime !== matchData.startTime) {
        showModal = true;
      } else if (staticMatchData?.team1?.id !== matchData.team1Id) {
        showModal = true;
      } else if (staticMatchData?.team2?.id !== matchData.team2Id) {
        showModal = true;
      } else if (staticMatchData?.team2?.id !== matchData.team2Id) {
        showModal = true;
      } else if (staticMatchData?.division?.id !== matchData.divisionId) {
        showModal = true;
      } else if (staticMatchData.roundId !== matchData.roundId) {
        showModal = true;
      } else if (staticMatchData.type !== matchData.type) {
        showModal = true;
      } else if (staticMatchData.matchDuration !== matchData.matchDuration) {
        showModal = true;
      } else if (staticMatchData.mainBreakDuration !== matchData.mainBreakDuration) {
        showModal = true;
      } else if (staticMatchData.breakDuration !== matchData.breakDuration) {
        showModal = true;
      } else if (staticMatchData.venueCourtId !== matchData.venueId) {
        showModal = true;
      } else {
        showModal = false;
      }

      if (showModal) {
        this.openModel(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          null,
          this.state.umpireKey,
          umpireData,
          scorerData,
          recordUmpireType,
          this.state.screenName,
          this.state.competitionOrganisationId,
          matchTeamOfficials,
          officialData,
        );
      } else {
        this.props.liveScoreCreateMatchAction(
          matchData,
          this.state.compId,
          this.state.key,
          this.state.isEdit,
          team1resultId,
          team2resultId,
          matchStatus,
          null,
          this.state.umpireKey,
          umpireData,
          scorerData,
          recordUmpireType,
          this.state.screenName,
          this.state.competitionOrganisationId,
          this.props.liveScoreMatchState.matchScoresData,
          false,
          matchTeamOfficials,
          officialData,
        );
      }
    } else {
      this.props.liveScoreCreateMatchAction(
        matchData,
        this.state.compId,
        this.state.key,
        this.state.isEdit,
        team1resultId,
        team2resultId,
        matchStatus,
        null,
        this.state.umpireKey,
        umpireData,
        scorerData,
        recordUmpireType,
        this.state.screenName,
        this.state.competitionOrganisationId,
        this.props.liveScoreMatchState.matchScoresData,
        false,
        matchTeamOfficials,
        officialData,
      );
    }
  };

  buildUmpireScorerData = () => {
    const {
      scorerId_1,
      scorerRosterId_1,
      team1Id,
      umpireSelectionDict,
    } = this.props.liveScoreMatchState;
    const recordUmpireType = this.recordUmpireType;

    let umpireData = [];
    let scorerData = [];
    let umpireObj;
    let scorer;

    if (recordUmpireType === RECORDUMPIRETYPE.Names) {
      for (let key in umpireSelectionDict) {
        if (!umpireSelectionDict[key]) {
          continue;
        }
        umpireObj = {
          ...umpireSelectionDict[key],
          matchId: this.state.matchId,
          roleId: getRoleFromSequence(Number(key)),
          umpireType: recordUmpireType,
          sequence: Number(key),
        };
        umpireData.push(umpireObj);
      }

      if (scorerId_1) {
        scorer = {
          matchId: this.state.matchId,
          teamId: team1Id,
          userId: scorerId_1,
          roleId: 4,
          rosterId: scorerRosterId_1 ? scorerRosterId_1 : null,
        };
        scorerData.push(scorer);
      }

      //putting both scorer and umpire in umpireData
    } else if (recordUmpireType === RECORDUMPIRETYPE.Users) {
      for (let key in umpireSelectionDict) {
        if (!umpireSelectionDict[key]) {
          continue;
        }
        umpireObj = {
          ...umpireSelectionDict[key],
          matchId: this.state.matchId,
          roleId: getRoleFromSequence(Number(key)),
          umpireType: recordUmpireType,
          sequence: Number(key),
        };
        umpireData.push(umpireObj);
      }

      if (scorerId_1) {
        scorer = {
          matchId: this.state.matchId,
          teamId: team1Id,
          userId: scorerId_1,
          roleId: 4,
          rosterId: scorerRosterId_1 ? scorerRosterId_1 : null,
        };

        scorerData.push(scorer);
      }
    } else if (recordUmpireType == null || recordUmpireType === RECORDUMPIRETYPE.None) {
      if (scorerId_1) {
        scorer = {
          matchId: this.state.isEdit ? this.state.matchId : 0,
          teamId: team1Id,
          userId: scorerId_1,
          roleId: 4,
          rosterId: scorerRosterId_1 ? scorerRosterId_1 : null,
        };
        scorerData.push(scorer);
      }
    }

    return [umpireData, scorerData];
  };

  footerView = () => {
    const { staticMatchData } = this.props.liveScoreMatchState;
    const isPostpone =
      staticMatchData.matchStatus === MatchStatus.Postponed ||
      staticMatchData.matchStatusRefId === MatchStatusRefId.Postponed;
    return (
      <div className="fluid-width">
        {!this.state.membershipIsUsed && (
          <div className="footer-view">
            <div className="row">
              <div className="col-sm-10 col-md-9">
                <div className="reg-add-save-button p-0">
                  <Button
                    className="cancelBtnWidth mr-2 mb-3"
                    onClick={() =>
                      history.push(
                        this.state.key === 'dashboard'
                          ? 'matchDayDashboard'
                          : this.state.key === 'umpireRoster'
                          ? 'umpireRoster'
                          : this.state.umpireKey === 'umpire'
                          ? 'umpireDashboard'
                          : '/matchDayMatches',
                      )
                    }
                    type="cancel-button"
                  >
                    {AppConstants.cancel}
                  </Button>
                  {this.state.isEdit && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.setState({ forfeitVisible: true })}
                      type="cancel-button"
                    >
                      {AppConstants.forfeit}
                    </Button>
                  )}
                  {this.state.isEdit && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.setState({ abandonVisible: true })}
                      type="cancel-button"
                    >
                      {AppConstants.abandon}
                    </Button>
                  )}
                  {this.state.isEdit && staticMatchData.matchStatus !== MatchStatus.Ended && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.handleMatchEnd()}
                      type="cancel-button"
                    >
                      {AppConstants.endMatch}
                    </Button>
                  )}
                  {this.state.isEdit && staticMatchData.matchStatus === MatchStatus.Ended && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.handleMatchUnEnd()}
                      type="cancel-button"
                    >
                      {AppConstants.unEndMatch}
                    </Button>
                  )}
                  {this.state.isEdit && staticMatchData.matchStatus === MatchStatus.Ended && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.handleMatchEnd()}
                      type="cancel-button"
                    >
                      {AppConstants.recalculateLadder}
                    </Button>
                  )}
                  {this.state.isEdit && (
                    <Button
                      className="button-spacing-style ml-2 mr-2"
                      onClick={() => this.handleMatchPostpone()}
                      type="cancel-button"
                    >
                      {isPostpone ? AppConstants.removePostponeWarning : AppConstants.postpone}
                    </Button>
                  )}
                </div>
              </div>
              <div className="col-sm-2 col-md-3">
                <div className="comp-buttons-view mt-0">
                  <Button
                    className="publish-button save-draft-text mr-0"
                    data-testid={AppUniqueId.SAVE_MATCH}
                    type="primary"
                    htmlType="submit"
                    disabled={this.props.liveScoreMatchState.onLoad}
                  >
                    {AppConstants.save}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  handleMatchSave = () => {
    this.addMatchDetails();
  };

  handleMatchEnd = () => {
    const { staticMatchData } = this.props.liveScoreMatchState;
    if (staticMatchData && staticMatchData.excludeFromLadder) {
      this.setState({
        showRegenLadderPointsModal: true,
        regenLadderPointsModalFn: this.endMatchResult,
      });
    } else {
      this.endMatchResult();
    }
  };

  handleMatchUnEnd = () => {
    this.setState({
      showUnEndMatchModal: true,
    });
  };

  handleMatchPostpone = () => {
    this.postponeMatchResult();
  };

  handleMatchForfeit = () => {
    const { staticMatchData } = this.props.liveScoreMatchState;
    if (staticMatchData && staticMatchData.excludeFromLadder) {
      this.setState({
        forfeitVisible: false,
        showRegenLadderPointsModal: true,
        regenLadderPointsModalFn: this.forefeitedTeamResult,
      });
    } else {
      this.forefeitedTeamResult();
    }
  };

  handleMatchAbandon = () => {
    const { staticMatchData } = this.props.liveScoreMatchState;
    if (staticMatchData && staticMatchData.excludeFromLadder) {
      this.setState({
        abandonVisible: false,
        showRegenLadderPointsModal: true,
        regenLadderPointsModalFn: this.abandonReasonResult,
      });
    } else {
      this.abandonReasonResult();
    }
  };

  handleRegenLadderModalOk = matches => {
    const { regenLadderPointsModalFn } = this.state;
    this.setState({ canRegenLadderPoints: true, showRegenLadderPointsModal: false }, () => {
      if (regenLadderPointsModalFn) regenLadderPointsModalFn();
    });
  };

  handleRegenLadderModalCancel = matches => {
    const { regenLadderPointsModalFn } = this.state;
    this.setState({ canRegenLadderPoints: false, showRegenLadderPointsModal: false }, () => {
      if (regenLadderPointsModalFn) regenLadderPointsModalFn();
    });
  };

  regenLadderPointsModalView = () => {
    const { showRegenLadderPointsModal } = this.state;
    const { staticMatchData } = this.props.liveScoreMatchState;
    return (
      <RegenerateLadderPointsModal
        visible={showRegenLadderPointsModal}
        onCancel={this.handleRegenLadderModalCancel}
        onOk={this.handleRegenLadderModalOk}
        matches={[staticMatchData]}
      ></RegenerateLadderPointsModal>
    );
  };

  handleUnEndMatchModalOk = () => {
    this.setState({ showUnEndMatchModal: false });
    this.unEndMatchResult();
  };

  handleUnEndMatchModalCancel = () => {
    this.setState({ showUnEndMatchModal: false });
  };

  unEndMatchModalView = () => {
    const { showUnEndMatchModal } = this.state;
    return (
      <Modal
        title={AppConstants.unEndMatch}
        visible={showUnEndMatchModal}
        onOk={this.handleUnEndMatchModalOk}
        onCancel={this.handleUnEndMatchModalCancel}
        okText={AppConstants.yes}
        cancelText={AppConstants.no}
        centered
      >
        <span>{AppConstants.unEndMatchPrompt}</span>
      </Modal>
    );
  };

  render() {
    const screen =
      this.props.location.state && this.props.location.state.screenName
        ? this.props.location.state.screenName
        : null;
    return (
      <div className="fluid-width default-bg">
        {this.state.umpireKey ? (
          <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}

        {this.state.umpireKey ? (
          <InnerHorizontalMenu
            menu="umpire"
            umpireSelectedKey={screen === 'umpireList' ? '2' : '1'}
          />
        ) : (
          <InnerHorizontalMenu
            menu="liveScore"
            liveScoreSelectedKey={this.state.key === 'dashboard' ? '1' : '2'}
          />
        )}

        <Loader
          visible={
            this.props.liveScoreMatchState.onLoad ||
            this.props.liveScoreMatchState.matchLoad ||
            this.props.liveScoreMatchState.matchScoresLoad
          }
        />

        <Layout>
          {this.headerView()}

          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.handleMatchSave}
            onFinishFailed={this.onFinishFailed}
          >
            <Content>
              <div className="formView">
                {this.regenLadderPointsModalView()}
                {this.contentView()}
                {this.ModalView()}
                {this.forfietModalView()}
                {this.abandonMatchView()}
                {this.unEndMatchModalView()}
              </div>
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }

  buildOfficialData() {
    const { competitionOrganisationId } = getCompetitionData() ?? {};
    const { officialSelectionDict } = this.props.liveScoreMatchState;
    return Object.entries(officialSelectionDict).map(([key, user]) => {
      if (!user) {
        return null;
      }
      return {
        userId: user.id,
        competitionOrganisationId,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        matchId: this.state.matchId,
        sequence: Number(key),
        roleId: RegistrationUserRoles.OtherOfficial,
      }
    }).filter(Boolean);
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getliveScoreDivisions,
      getliveScoreTeams,
      liveScoreAddEditMatchAction,
      liveScoreAddEditMatchScoresAction,
      liveScoreAddMatchAction,
      liveScoreUpdateMatchAction,
      liveScoreCreateMatchAction,
      liveScoreCreateRoundAction,
      getVenuesTypeAction,
      liveScoreScorerListAction,
      clearMatchAction,
      getCompetitionVenuesList,
      getliveScoreAvailableScorerList,
      getLiveScoreDivisionList,
      otherOfficialListAction,
      liveScoreRoundListAction,
      liveScoreClubListAction,
      searchFilterAction,
      ladderSettingGetMatchResultAction,
      umpireListAction,
      newUmpireListAction,
      liveScoreGetMatchDetailInitiate,
      getRefBadgeData,
      resetUmpireListBoolAction,
      getUmpireAllocationSettings,
      getLiveScoreSettingInitiate,
      liveScoreUnEndMatchAction,
      liveScoreClearScorerList,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreState: state.LiveScoreState,
    liveScoreMatchState: state.LiveScoreMatchState,
    liveScoreScorerState: state.LiveScoreScorerState,
    liveScoreTeamState: state.LiveScoreTeamState,
    appstate: state.AppState,
    umpireSettingState: state.UmpireSettingState,
    liveScoreSetting: state.LiveScoreSetting,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreAddMatch);

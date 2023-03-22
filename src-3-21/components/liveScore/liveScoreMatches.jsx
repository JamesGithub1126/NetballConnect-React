import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import {
  Input,
  Layout,
  message,
  Breadcrumb,
  Button,
  Table,
  Pagination,
  Select,
  DatePicker,
  Menu,
  Dropdown,
  Modal,
  Checkbox,
  Alert,
} from 'antd';
import AppUniqueId from 'themes/appUniqueId';
import Loader from '../../customComponents/loader';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';

import './liveScore.css';
import {
  isArrayNotEmpty,
  teamListDataCheck,
  isNotNullOrEmptyString,
  isNotNullAndUndefined,
} from '../../util/helpers';
import history from '../../util/history';
import {
  getLiveScoreCompetition,
  getUmpireCompetitionData,
  setOwn_competition,
  setGlobalYear,
  getOrganisationData,
} from '../../util/sessionStorage';
import { liveScore_MatchFormate } from '../../themes/dateformate';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { exportFilesAction } from '../../store/actions/appAction';
import {
  liveScoreMatchListAction,
  changeMatchBulkScore,
  bulkScoreUpdate,
  onCancelBulkScoreUpdate,
  setPageNumberAction,
  setPageSizeAction,
  exportMediaReportAction,
  liveScoreActivateFinalsReset,
  finaliseMatchResultAction,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import { getLiveScoreSettingInitiate } from '../../store/actions/LiveScoreAction/LiveScoreSettingAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import { checkLivScoreCompIsParent } from '../../util/permissions';
import moment from 'moment-timezone';
import LiveScoreActivateFinals from './liveScoreActivateFinals';
import ValidationConstants from '../../themes/validationConstant';
import { MatchStatus, MatchStatusRefId } from '../../enums/enums';
import RegenerateLadderPointsModal from '../../customComponents/RegenerateLadderPointsModal';
import { getScoreText } from '../../store/objectModel/getMatchTeamListObject';
import { isFootball } from './liveScoreSettings/liveScoreSettingsUtils';
const { Content } = Layout;
const { Option } = Select;

/////function to sort table column
function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (_this.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (_this.state.sortBy === key && _this.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (_this.state.sortBy === key && _this.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  _this.setState({ sortBy, sortOrder });
  let { liveScoreMatchListPageSize } = _this.props.liveScoreMatchListState;
  liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
  _this.props.liveScoreMatchListAction(
    _this.state.competitionId,
    1,
    _this.state.offset,
    liveScoreMatchListPageSize,
    _this.state.searchText,
    _this.state.selectedDivision === 'All' ? null : _this.state.selectedDivision,
    _this.state.selectedRound === 'All' ? null : _this.state.selectedRound,
    undefined,
    sortBy,
    sortOrder,
    _this.state.competitionOrganisationId,
    _this.state.from,
    _this.state.to,
  );
}

var _this = null;
function setMatchResult(record) {
  if (record.team1ResultId !== null) {
    if (
      record.team1ResultId === 4 ||
      record.team1ResultId === 6 ||
      record.team2ResultId === 6 ||
      record.team2ResultId === 4
    ) {
      return 'Forfeit';
    } else if (record.team1ResultId === 8 || record.team1ResultId === 9) {
      return 'Abandoned';
    } else if (
      record.matchStatus === MatchStatus.Postponed ||
      record.matchStatusRefId === MatchStatusRefId.Postponed
    ) {
      return 'Postponed';
    } else {
      return getScoreText(record) + (record.hasPenalty && isFootball ? `*` : ``);
    }
  } else {
    return getScoreText(record) + (record.hasPenalty && isFootball ? `*` : ``);
  }
}

function setMatchBulkScore(record) {
  if (record.team1ResultId !== null) {
    if (record.team1ResultId === 4 || record.team1ResultId === 6 || record.team1ResultId === 6) {
      return true;
    } else if (record.team1ResultId === 8 || record.team1ResultId === 9) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function getVenueName(data) {
  let venue_name = '';
  if (data.venue.shortName) {
    venue_name = data.venue.shortName + ' - ' + data.name;
  } else {
    venue_name = data.venue.name + ' - ' + data.name;
  }

  return venue_name;
}

function matchResultImage(result) {
  if (result == 'FINAL') {
    return AppImages.greenDot;
  } else if (result == 'UNCONFIRMED') {
    return AppImages.purpleDot;
  } else if (result == 'DISPUTE') {
    return AppImages.redDot;
  } else {
    return AppImages.purpleDot;
  }
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (id, record) => {
      return _this.onMatchClick(record, '/matchDayMatchDetails');
    },
  },
  {
    title: AppConstants.round,
    dataIndex: 'round',
    key: 'round',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (round, record) =>
      isNotNullOrEmptyString(record.finalsAlias) ? (
        <span data-tetstid={record}>
          {round.name} - {record.finalsAlias}
        </span>
      ) : (
        <span>{round.name}</span>
      ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: startTime => <span>{startTime ? liveScore_MatchFormate(startTime) : ''}</span>,
  },
  {
    title: AppConstants.home,
    dataIndex: 'team1',
    key: 'team1',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (team1, record) =>
      teamListDataCheck(
        team1.id,
        _this.state.liveScoreCompIsParent,
        record,
        _this.state.competitionOrganisationId,
        team1,
      ) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: team1, screenName: 'fromMatchList' },
          }}
        >
          <span className="input-heading-add-another pt-0">{team1.name}</span>
        </NavLink>
      ) : (
        <span>{team1.name}</span>
      ),
  },
  {
    title: AppConstants.away,
    dataIndex: 'team2',
    key: 'team2',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (team2, record) =>
      teamListDataCheck(
        team2.id,
        _this.state.liveScoreCompIsParent,
        record,
        _this.state.competitionOrganisationId,
        team2,
      ) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: team2, screenName: 'fromMatchList' },
          }}
        >
          <span className="input-heading-add-another pt-0">{team2.name}</span>
        </NavLink>
      ) : (
        <span>{team2.name}</span>
      ),
  },
  {
    title: AppConstants.venue,
    dataIndex: 'venueCourt',
    key: 'venueCourt',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    // render: (venueCourt, record) => <span>{venueCourt.venue.shortName + " - " + venueCourt.name}</span>
    render: (venueCourt, record) => <span>{getVenueName(venueCourt)}</span>,
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: division => <span>{division.name}</span>,
  },
  {
    title: AppConstants.score,
    dataIndex: 'score',
    key: 'score',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    // render: (score, records) => <span nowrap>{setMatchResult(records)}</span>
    render: (score, records, index) => {
      return (
        <div className="d-flex align-items-center">
          {!!records.matchStatus &&
            records.matchStatus.toLowerCase() === MatchStatus.Ended.toLowerCase() && (
              <img
                className="dot-image mr-3"
                src={matchResultImage(records.resultStatus)}
                alt="dot-image"
                width="12"
                height="12"
              />
            )}
          {_this.scoreView(score, records, index)}
          {!!records.isResultsLocked && !!records.competition?.allowAffiliatesEnterScore && (
            <img src={AppImages.lockIcon} alt="lock image" width="12" height="12" />
          )}
        </div>
      );
    },
  },
  {
    title: AppConstants.type,
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.matchDuration,
    dataIndex: 'matchDuration',
    key: 'matchDuration',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.mainBreak,
    dataIndex: 'mainBreakDuration',
    key: 'mainBreakDuration',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.quarterBreak,
    dataIndex: 'qtrBreak',
    key: 'qtrBreak',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
];

class LiveScoreMatchesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      competitionUniqueKey: null,
      searchText: '',
      umpireKey:
        this.props.location && this.props.location.state
          ? this.props.location.state.umpireKey
          : null,
      selectedDivision: AppConstants.all,
      selectedRound: AppConstants.all,
      isBulkUpload: false,
      isScoreChanged: false,
      onScoreUpdate: false,
      sortBy: null,
      sortOrder: null,
      sourceIdAvailable: false,
      liveScoreCompIsParent: false,
      competitionOrganisationId: 0,
      from: null,
      to: null,
      finaliseResultIsModalVisible: false,
      finaliseResultShowWarning: false,
      finalisedDivisionIds: [],
      finalisedRoundNames: [],
      finaliseAllDivisions: false,
      finaliseAllRounds: false,
      showRegenLadderPointsModal: false,
      resetMatches: [],
      regenLadderPointsModalFn: null,
      regenLadderPointsModalFnArgs: null,
    };
    _this = this;
  }

  async componentDidMount() {
    this.setLivScoreCompIsParent();
    let matchListActionObject = this.props.liveScoreMatchListState.matchListActionObject;
    let selectedDivision = this.state.selectedDivision;
    let page = 1;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (matchListActionObject) {
      let offset = matchListActionObject.offset;
      let searchText = matchListActionObject.search;
      selectedDivision = matchListActionObject.divisionId
        ? matchListActionObject.divisionId
        : 'All';
      let selectedRound = matchListActionObject.roundName ? matchListActionObject.roundName : 'All';
      sortBy = matchListActionObject.sortBy;
      sortOrder = matchListActionObject.sortOrder;
      await this.setState({
        offset,
        searchText,
        selectedDivision,
        selectedRound,
        sortBy,
        sortOrder,
      });
      let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
      liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
      page = Math.floor(offset / liveScoreMatchListPageSize) + 1;
    }

    let competitionId = 0;
    if (this.state.umpireKey === 'umpire') {
      if (getUmpireCompetitionData()) {
        const { id, sourceId, uniqueKey, competitionOrganisation } = JSON.parse(
          getUmpireCompetitionData(),
        );
        let compOrg = competitionOrganisation ? competitionOrganisation.id : 0;
        competitionId = id;
        this.setState({
          competitionId: id,
          competitionUniqueKey: uniqueKey,
          sourceIdAvailable: sourceId ? true : false,
          competitionOrganisationId: compOrg,
        });
        this.handleMatchTableList(page, id, compOrg);
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      if (getLiveScoreCompetition()) {
        const { id, sourceId, uniqueKey, competitionOrganisation } = JSON.parse(
          getLiveScoreCompetition(),
        );
        competitionId = id;
        this.setState({
          competitionId: id,
          competitionUniqueKey: uniqueKey,
          sourceIdAvailable: sourceId ? true : false,
          competitionOrganisationId: competitionOrganisation ? competitionOrganisation.id : 0,
        });
        this.handleMatchTableList(
          page,
          id,
          sortBy,
          sortOrder,
          competitionOrganisation ? competitionOrganisation.id : 0,
        );
        this.props.getLiveScoreDivisionList(id);
        this.props.liveScoreRoundListAction(id, selectedDivision === 'All' ? '' : selectedDivision);
      } else {
        history.push('/matchDayCompetitions');
      }
    }

    // Get live score settings for B&F player points.
    this.props.getLiveScoreSettingInitiate(competitionId);
  }

  componentDidUpdate(prevProps) {
    const {
      competitionId,
      start,
      offset,
      liveScoreMatchListPageSize,
      searchText,
      selectedDivision,
      selectedRound,
      sortBy,
      sortOrder,
      competitionOrganisationId,
      from,
      to,
    } = this.state;
    if (prevProps.liveScoreMatchListState !== this.props.liveScoreMatchListState) {
      if (prevProps.liveScoreMatchListState.onLoad === false && this.state.onScoreUpdate === true) {
        this.setState({ isBulkUpload: false, onScoreUpdate: false });
      }

      if (
        prevProps.liveScoreMatchListState.finaliseResultLoad === true &&
        this.props.liveScoreMatchListState.finaliseResultLoad === false
      ) {
        this.setDefaultValuesForFinialiseResult();
        this.props.liveScoreMatchListAction(
          competitionId,
          start ? start : 1,
          offset ? offset : 0,
          liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10,
          searchText,
          selectedDivision === 'All' ? null : selectedDivision,
          selectedRound === 'All' ? null : selectedRound,
          undefined,
          sortBy,
          sortOrder,
          competitionOrganisationId,
          from,
          to,
        );
      }
    }

    if (
      prevProps.liveScoreMatchListState.onUpdateBulkScore === true &&
      this.props.liveScoreMatchListState.onUpdateBulkScore === false
    ) {
      this.props.liveScoreMatchListAction(
        competitionId,
        start ? start : 1,
        offset ? offset : 0,
        liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10,
        searchText,
        selectedDivision === 'All' ? null : selectedDivision,
        selectedRound === 'All' ? null : selectedRound,
        undefined,
        sortBy,
        sortOrder,
        competitionOrganisationId,
        from,
        to,
      );
    }

    if (
      prevProps.liveScoreMatchListState.activateFinals === false &&
      this.props.liveScoreMatchListState.activateFinals === true
    ) {
      this.props.liveScoreActivateFinalsReset();
      this.handleMatchTableList(
        1,
        this.state.competitionId,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
      );
    }
  }

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  onMatchClick(data, screenName) {
    return (
      <NavLink
        to={{
          pathname: screenName,
          state: {
            matchId: data.id,
            isResultsLocked: data.isResultsLocked,
            umpireKey: this.state.umpireKey,
          },
        }}
      >
        <span
          className="input-heading-add-another pt-0"
          data-testid={AppUniqueId.MATCH_ID + data.id}
        >
          {data.id}
        </span>
      </NavLink>
    );
  }

  handleMatchTableList = (page, competitionID, sortBy, sortOrder, competitionOrganisationId) => {
    let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
    liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
    let offset = page ? liveScoreMatchListPageSize * (page - 1) : 0;
    const { from, to } = this.state;
    this.setState({ offset });
    let start = 1;
    this.props.liveScoreMatchListAction(
      competitionID,
      start,
      offset,
      liveScoreMatchListPageSize,
      this.state.searchText,
      this.state.selectedDivision === 'All' ? null : this.state.selectedDivision,
      this.state.selectedRound === 'All' ? null : this.state.selectedRound,
      undefined,
      sortBy,
      sortOrder,
      competitionOrganisationId,
      from,
      to,
    );
  };

  onExport() {
    let competition = null;
    if (this.state.umpireKey === 'umpire') {
      if (getUmpireCompetitionData()) {
        competition = JSON.parse(getUmpireCompetitionData());
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      if (getLiveScoreCompetition()) {
        competition = JSON.parse(getLiveScoreCompetition());
      } else {
        history.push('/matchDayCompetitions');
      }
    }
    const { sortBy, sortOrder, from, to, searchText } = this.state;
    let divisionId = this.state.selectedDivision === 'All' ? null : this.state.selectedDivision;
    let roundName = this.state.selectedRound === 'All' ? null : this.state.selectedRound;
    let competitionOrganisationId = competition.competitionOrganisation
      ? competition.competitionOrganisation.id
      : null;
    let url = null;
    if (competitionOrganisationId) {
      url =
        AppConstants.matchExport +
        this.state.competitionId +
        `&competitionOrganisationId=${competitionOrganisationId}`;
    } else {
      url = AppConstants.matchExport + this.state.competitionId + `&competitionOrganisationId=${0}`;
    }
    url += `&start=1&offset=0`;

    if (searchText) {
      url += `&search=${searchText}`;
    }
    if (roundName) {
      url += `&roundName=${roundName}`;
    }

    if (divisionId) {
      url += `&divisionIds=${divisionId}`;
    }

    if (from) {
      url += `&from=${from}`;
    }

    if (to) {
      url += `&to=${to}`;
    }

    if (sortBy && sortOrder) {
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    }
    this.props.exportFilesAction(url);
  }

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value, offset: 0 });
    const { from, to } = this.state;
    if (e.target.value == null || e.target.value === '') {
      let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
      liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
      this.props.liveScoreMatchListAction(
        this.state.competitionId,
        1,
        0,
        liveScoreMatchListPageSize,
        e.target.value,
        this.state.selectedDivision === 'All' ? null : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? null : this.state.selectedRound,
        undefined,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
        from,
        to,
      );
    }
  };

  onChangeDate = (e, dateType) => {
    let from = this.state.from;
    let to = this.state.to;
    if (dateType === 'from') {
      let fromDateTime = e?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      fromDateTime = fromDateTime ? fromDateTime.toDate() : null;
      fromDateTime = fromDateTime ? fromDateTime.toJSON() : null;
      this.setState({ from: fromDateTime, offset: 0 });
      from = fromDateTime;
    } else if (dateType === 'to') {
      let toDateTime = e?.set({ hour: 23, minute: 59, second: 59, millisecond: 59 });
      toDateTime = toDateTime ? toDateTime.toDate() : null;
      toDateTime = toDateTime ? toDateTime.toJSON() : null;
      this.setState({ to: toDateTime, offset: 0 });
      to = toDateTime;
    }
    let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
    liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
    this.props.liveScoreMatchListAction(
      this.state.competitionId,
      1,
      0,
      liveScoreMatchListPageSize,
      this.state.searchText,
      this.state.selectedDivision === 'All' ? null : this.state.selectedDivision,
      this.state.selectedRound === 'All' ? null : this.state.selectedRound,
      undefined,
      this.state.sortBy,
      this.state.sortOrder,
      this.state.competitionOrganisationId,
      from,
      to,
    );
  };

  // search key
  onKeyEnterSearchText = e => {
    var code = e.keyCode || e.which;
    this.setState({ offset: 0 });
    if (code === 13) {
      // 13 is the enter keycode
      let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
      liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
      this.props.liveScoreMatchListAction(
        this.state.competitionId,
        1,
        0,
        liveScoreMatchListPageSize,
        e.target.value,
        this.state.selectedDivision === 'All' ? null : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? null : this.state.selectedRound,
        undefined,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
        this.state.from,
        this.state.to,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    if (this.state.searchText == null || this.state.searchText === '') {
    } else {
      let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
      liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
      this.props.liveScoreMatchListAction(
        this.state.competitionId,
        1,
        0,
        liveScoreMatchListPageSize,
        this.state.searchText,
        this.state.selectedDivision === 'All' ? null : this.state.selectedDivision,
        this.state.selectedRound === 'All' ? null : this.state.selectedRound,
        undefined,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
        this.state.from,
        this.state.to,
      );
    }
  };

  ///navigation to draws if sourceId is not null
  drawsNavigation = () => {
    let yearRefId = localStorage.yearId;
    let compKey = null;
    if (getLiveScoreCompetition()) {
      const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
      compKey = uniqueKey;
    }
    // setOwnCompetitionYear(yearRefId);
    setGlobalYear(yearRefId);
    setOwn_competition(compKey);
    history.push({ pathname: '/competitionDraws', state: { screenKey: '/matchDayMatches' } });
  };

  exportMediaReport = () => {
    let { competitionId, searchText, selectedDivision, selectedRound, from, to } = this.state;
    const search = searchText;
    const divisionId = selectedDivision === 'All' ? null : selectedDivision;
    const roundName = selectedRound === 'All' ? null : selectedRound;
    const userOrgId = getOrganisationData().organisationId;
    this.props.exportMediaReportAction(
      `?userOrganisationId=${userOrgId}&timezone=${moment.tz.guess()}&competitionId=${competitionId}` +
        (search ? `&search=${search}` : '') +
        (divisionId ? `&divisionId=${divisionId}` : '') +
        (roundName ? `&roundName=${roundName}` : '') +
        (from ? `&from=${from}` : '') +
        (to ? `&to=${to}` : ''),
    );
  };

  scoreView(score, records, index) {
    return (
      <div
        className={`${
          !!records.isResultsLocked && !!records.competition?.allowAffiliatesEnterScore
            ? 'mr-3'
            : ''
        }`}
      >
        {this.state.isBulkUpload ? (
          <div>
            {setMatchBulkScore(records) === false ? (
              <div className="d-flex flex-row align-items-center justify-content-start">
                <Input
                  className="table-input-box-style"
                  value={records.team1Score}
                  disabled={this.isDisabledScoreEdit(records)}
                  type="number"
                  onChange={e =>
                    this.props.changeMatchBulkScore(e.target.value, 'team1Score', index)
                  }
                />
                <span style={{ paddingLeft: 5, paddingRight: 5 }}>:</span>
                <Input
                  className="table-input-box-style"
                  value={records.team2Score}
                  disabled={this.isDisabledScoreEdit(records)}
                  type="number"
                  onChange={e =>
                    this.props.changeMatchBulkScore(e.target.value, 'team2Score', index)
                  }
                />
              </div>
            ) : (
              setMatchResult(records)
            )}
          </div>
        ) : (
          <span className="white-space-nowrap">{setMatchResult(records)}</span>
        )}
      </div>
    );
  }

  isDisabledScoreEdit = match => {
    if (this.state.liveScoreCompIsParent) {
      return false;
    }

    return (
      this.state.competitionOrganisationId !== match.team1?.competitionOrganisationId ||
      match.isResultsLocked
    );
  };

  isAllowBulkScoreUpload = () => {
    if (this.state.liveScoreCompIsParent) {
      return true;
    } else {
      const { allowAffiliatesEnterScore } = this.props.liveScoreSetting;

      if (!allowAffiliatesEnterScore) {
        return false;
      }

      const { liveScoreMatchList } = this.props.liveScoreMatchListState;
      if (!liveScoreMatchList || liveScoreMatchList.length < 0) {
        return false;
      }

      let isAllow = false;
      liveScoreMatchList.forEach(it => {
        if (this.state.competitionOrganisationId === it.team1?.competitionOrganisationId)
          isAllow = true;
      });

      return isAllow;
    }
  };

  headerView = () => {
    const { liveScoreMatchListData, divisionList, roundList } = this.props.liveScoreMatchListState;
    const { allowAffiliatesEnterScore } = this.props.liveScoreSetting;
    let matchData = isArrayNotEmpty(liveScoreMatchListData) ? liveScoreMatchListData : [];
    let { sourceIdAvailable, liveScoreCompIsParent } = this.state;
    let divisionListArr = isArrayNotEmpty(divisionList) ? divisionList : [];
    let roundListArr = isArrayNotEmpty(roundList) ? roundList : [];
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.matchList}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
            <div className="row">
              {this.isAllowBulkScoreUpload() && (
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      type="primary"
                      className="primary-add-comp-form"
                      disabled={this.state.isBulkUpload || matchData.length === 0}
                      onClick={() => this.setState({ isBulkUpload: true })}
                    >
                      {AppConstants.bulkScoreUpload}
                    </Button>
                  </div>
                </div>
              )}

              <div className="col-sm">
                <div className="comp-buttons-view w-100 d-flex flex-row align-items-center justify-content-end">
                  <Dropdown
                    className="primary-add-comp-form"
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="1"
                          onClick={this.exportMediaReport}
                          disabled={this.props.liveScoreMatchListState.exportingReport}
                        >
                          {AppConstants.mediaReport}
                        </Menu.Item>
                        <Menu.Item key="2" onClick={() => this.onExport()}>
                          {AppConstants.matchList}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button type="primary">
                      {AppConstants.export} <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </div>

              {liveScoreCompIsParent && (
                <div className="col-sm">
                  <div className="comp-buttons-view w-100 d-flex flex-row align-items-center justify-content-end">
                    <Dropdown
                      className="primary-add-comp-form"
                      overlay={
                        <Menu>
                          {!!allowAffiliatesEnterScore && (
                            <Menu.Item
                              disabled={divisionListArr.length === 0 || roundListArr.length === 0}
                              key="1"
                              onClick={() => this.handleFinaliseResult()}
                            >
                              {AppConstants.finaliseResults}
                            </Menu.Item>
                          )}
                          {sourceIdAvailable && (
                            <Menu.Item key="2" onClick={() => this.drawsNavigation()}>
                              {AppConstants.editDraws}
                            </Menu.Item>
                          )}

                          <Menu.Item key="3">
                            <NavLink to="/matchDayMatchImport">
                              {AppConstants.importMatches}
                            </NavLink>
                          </Menu.Item>
                          <Menu.Item key="4" data-testid={AppUniqueId.ADD_MATCH}>
                            {' '}
                            <NavLink to={{ pathname: '/matchDayAddMatch' }}>
                              {AppConstants.addMatch}
                            </NavLink>
                          </Menu.Item>
                          <Menu.Item key="5">
                            <LiveScoreActivateFinals
                              competitionId={this.state.competitionUniqueKey}
                              disabled={this.state.isBulkUpload || matchData.length === 0}
                              divisionList={divisionList}
                              matchData={matchData}
                              useButtonStyle
                            />
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button type="primary" data-testid={AppUniqueId.ACTIONS_BUTTON}>
                        {AppConstants.actions} <DownOutlined />
                      </Button>
                    </Dropdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  onPageChange = async page => {
    let checkScoreChanged = this.state.isBulkUpload && this.checkIsScoreChanged();
    if (checkScoreChanged === true) {
      message.info('Please save or cancel the current changes! ');
    } else {
      await this.props.setPageNumberAction(page);
      this.handleMatchTableList(
        page,
        this.state.competitionId,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
      );
    }
  };

  //////// tableView
  tableView = () => {
    const {
      liveScoreMatchListData,
      liveScoreMatchListPage,
      liveScoreMatchListPageSize,
      liveScoreMatchListTotalCount,
      onLoadMatch,
      onUpdateBulkScore,
    } = this.props.liveScoreMatchListState;
    let DATA = isArrayNotEmpty(liveScoreMatchListData) ? liveScoreMatchListData : [];

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoadMatch || onUpdateBulkScore}
            className="home-dashboard-table"
            columns={columns}
            dataSource={DATA}
            pagination={false}
            rowKey={record => 'matchList' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-0"
            showSizeChanger
            current={liveScoreMatchListPage}
            defaultCurrent={liveScoreMatchListPage}
            defaultPageSize={liveScoreMatchListPageSize}
            total={liveScoreMatchListTotalCount}
            onChange={this.onPageChange}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>

        {this.state.isBulkUpload === true && (
          <div className="d-flex justify-content-end" style={{ paddingBottom: '15vh' }}>
            <div className="row">
              <div className="col-sm">
                <div className="reg-add-save-button">
                  <Button
                    className="cancelBtnWidth"
                    onClick={() => this.onCancel()}
                    type="cancel-button"
                  >
                    {AppConstants.cancel}
                  </Button>
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-buttons-view">
                  <Button
                    onClick={this.handleSubmit}
                    className="publish-button save-draft-text"
                    type="primary"
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

  checkIsScoreChanged() {
    let { liveScoreMatchListData, liveScoreBulkScoreList } = this.props.liveScoreMatchListState;
    let isChanged = false;

    for (let i in liveScoreMatchListData) {
      if (
        liveScoreMatchListData[i].team1Score !== liveScoreBulkScoreList[i].team1Score ||
        liveScoreMatchListData[i].team2Score !== liveScoreBulkScoreList[i].team2Score ||
        liveScoreMatchListData[i].resultStatus === 'UNCONFIRMED'
      ) {
        isChanged = true;
        break;
      }

      if (isChanged === true) {
        break;
      }
    }

    return isChanged;
  }

  createPostMatchArray() {
    let { liveScoreMatchListData, liveScoreBulkScoreList } = this.props.liveScoreMatchListState;
    let array = [];
    let resetMatches = [];
    for (let i in liveScoreMatchListData) {
      if (
        liveScoreMatchListData[i].team1Score !== liveScoreBulkScoreList[i].team1Score ||
        liveScoreMatchListData[i].team2Score !== liveScoreBulkScoreList[i].team2Score ||
        liveScoreMatchListData[i].resultStatus === 'UNCONFIRMED'
      ) {
        let requestObject = {
          id: liveScoreMatchListData[i].id,
          team1Score: JSON.parse(liveScoreMatchListData[i].team1Score),
          team2Score: JSON.parse(liveScoreMatchListData[i].team2Score),
        };
        array.push(requestObject);
        if (!!liveScoreMatchListData[i].excludeFromLadder) {
          resetMatches.push(liveScoreMatchListData[i]);
        }
      }
    }
    return { array, resetMatches };
  }

  handleSubmit = () => {
    let checkScoreChanged = this.checkIsScoreChanged();
    if (checkScoreChanged === true) {
      let { array: postArray, resetMatches } = this.createPostMatchArray();
      let args = {
        bulks: postArray,
        isCompOrganiser: this.state.liveScoreCompIsParent,
      };

      if (resetMatches && resetMatches.length > 0) {
        this.setState({
          showRegenLadderPointsModal: true,
          resetMatches: resetMatches,
          regenLadderPointsModalFnArgs: args,
        });
      } else {
        this.setState({ onScoreUpdate: true });
        this.props.bulkScoreUpdate(args);
      }
    } else {
      this.setState({ isBulkUpload: false });
    }
  };

  onCancel() {
    this.setState({ isBulkUpload: false });
    this.props.onCancelBulkScoreUpdate();
  }

  onChangeDivision(division) {
    this.setState({ selectedDivision: division, selectedRound: AppConstants.all });
    let offset = 0;
    let start = 1;
    const { competitionId, searchText } = this.state;
    let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
    liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
    setTimeout(() => {
      this.props.liveScoreMatchListAction(
        competitionId,
        start,
        offset,
        liveScoreMatchListPageSize,
        searchText,
        division === 'All' ? null : division,
        null,
        undefined,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.competitionOrganisationId,
        this.state.from,
        this.state.to,
      );
    }, 200);
    this.props.liveScoreRoundListAction(competitionId, division === 'All' ? '' : division);
  }

  onChangeRound(roundName) {
    let offset = 0;
    let start = 1;
    const { competitionId, searchText, selectedDivision } = this.state;
    let { liveScoreMatchListPageSize } = this.props.liveScoreMatchListState;
    liveScoreMatchListPageSize = liveScoreMatchListPageSize ? liveScoreMatchListPageSize : 10;
    this.props.liveScoreMatchListAction(
      competitionId,
      start,
      offset,
      liveScoreMatchListPageSize,
      searchText,
      selectedDivision === 'All' ? null : selectedDivision,
      roundName === 'All' ? null : roundName,
      undefined,
      this.state.sortBy,
      this.state.sortOrder,
      this.state.competitionOrganisationId,
      this.state.from,
      this.state.to,
    );
    this.setState({ selectedRound: roundName });
  }

  setDefaultValuesForFinialiseResult = () => {
    this.setState({
      finaliseResultIsModalVisible: false,
      finaliseResultShowWarning: false,
      finaliseAllDivisions: false,
      finaliseAllRounds: false,
      finalisedDivisionIds: [],
      finalisedRoundNames: [],
    });
  };

  handleFinaliseResult = () => {
    this.setState({ finaliseResultIsModalVisible: true });
  };

  handleFinaliseResultConfirm = () => {
    const {
      competitionId,
      finaliseAllDivisions,
      finaliseAllRounds,
      finalisedDivisionIds,
      finalisedRoundNames,
      finaliseResultShowWarning,
    } = this.state;

    if (
      (finaliseAllDivisions || finalisedDivisionIds.length > 0) &&
      (finaliseAllRounds || finalisedRoundNames.length > 0)
    ) {
      if (finaliseResultShowWarning) {
        this.setState({ finaliseResultShowWarning: false });
      }
      const payload = {
        competitionId,
        finaliseAllDivisions,
        finaliseAllRounds,
        finalisedDivisionIds: finaliseAllDivisions ? null : finalisedDivisionIds,
        finalisedRoundNames: finaliseAllRounds ? null : finalisedRoundNames,
      };
      this.props.finaliseMatchResultAction(payload);
    } else {
      this.setState({ finaliseResultShowWarning: true });
    }
  };

  finaliseResultModalView = () => {
    const {
      finaliseResultShowWarning,
      finaliseResultIsModalVisible,
      finaliseAllDivisions,
      finaliseAllRounds,
      finalisedDivisionIds,
      finalisedRoundNames,
    } = this.state;
    let { divisionList, roundList } = this.props.liveScoreMatchListState;
    let divisionListArr = isArrayNotEmpty(divisionList) ? divisionList : [];
    let roundListArr = isArrayNotEmpty(roundList) ? roundList : [];
    return (
      <Modal
        title={
          <>
            <span>{AppConstants.finaliseResults}</span>
            <br />
            <span className="warning-msg">{AppConstants.oneWayActionNote}</span>
          </>
        }
        visible={finaliseResultIsModalVisible}
        onOk={this.handleFinaliseResultConfirm}
        onCancel={this.setDefaultValuesForFinialiseResult}
      >
        <>
          <div>
            <Checkbox
              className="single-checkbox mt-0"
              checked={finaliseAllDivisions}
              onClick={e => this.setState({ finaliseAllDivisions: e.target.checked })}
            >
              {AppConstants.allDivisions}
            </Checkbox>
          </div>
          <div>
            <Select
              className="w-100"
              mode="multiple"
              disabled={finaliseAllDivisions}
              placeholder={AppConstants.selectDivisions}
              value={finalisedDivisionIds}
              onChange={value => this.setState({ finalisedDivisionIds: value })}
            >
              {(divisionListArr || []).map(division => (
                <Option key={'division_' + division.id} value={division.id}>
                  {division.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Checkbox
              className="single-checkbox mt-15"
              checked={finaliseAllRounds}
              onClick={e => this.setState({ finaliseAllRounds: e.target.checked })}
            >
              {AppConstants.allRounds}
            </Checkbox>
          </div>
          <div>
            <Select
              className="w-100"
              mode="multiple"
              disabled={finaliseAllRounds}
              placeholder={AppConstants.selectRounds}
              value={finalisedRoundNames}
              onChange={value => this.setState({ finalisedRoundNames: value })}
            >
              {(roundListArr || []).map(round => (
                <Option key={'round_' + round.name} value={round.name}>
                  {round.name}
                </Option>
              ))}
            </Select>
          </div>
        </>
        {finaliseResultShowWarning && (
          <Alert
            className="mt-4"
            closable
            showIcon
            type="warning"
            message={ValidationConstants.selectBothDivAndRound}
            onClose={() => this.setState({ finaliseResultShowWarning: false })}
          ></Alert>
        )}
      </Modal>
    );
  };

  dropdownView = () => {
    let { divisionList, roundList } = this.props.liveScoreMatchListState;
    let divisionListArr = isArrayNotEmpty(divisionList) ? divisionList : [];
    let roundListArr = isArrayNotEmpty(roundList) ? roundList : [];
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.division}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={divisionId => this.onChangeDivision(divisionId)}
                value={this.state.selectedDivision}
              >
                <Option value="All">All</Option>
                {divisionListArr.map(item => (
                  <Option key={'division_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.round}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={roundName => this.onChangeRound(roundName)}
                value={this.state.selectedRound}
              >
                <Option value="All">All</Option>
                {roundListArr.map(item => (
                  <Option key={'round_' + item.name} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.from}:</span>
              <DatePicker
                allowClear
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={e => this.onChangeDate(e, 'from')}
                format="DD-MM-YYYY"
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.to}:</span>
              <DatePicker
                allowClear
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={e => this.onChangeDate(e, 'to')}
                format="DD-MM-YYYY"
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>
          <div className="col-sm d-flex justify-content-end align-items-center">
            <div className="comp-product-search-inp-width pb-3">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
                data-testid={AppUniqueId.SEARCH_INPUT}
                value={this.state.searchText}
                onKeyPress={this.onKeyEnterSearchText}
                prefix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                    onClick={this.onClickSearchIcon}
                  />
                }
                allowClear
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  detailsContainer = (icon, description) => {
    return (
      <div className="pt-2">
        <img src={icon} alt="" width="15" height="15" />
        <span style={{ marginLeft: 10 }}>{description}</span>
      </div>
    );
  };

  footerView() {
    const { allowAffiliatesEnterScore } = this.props.liveScoreSetting;
    const { liveScoreMatchListData } = this.props.liveScoreMatchListState;
    const hasPenalty = liveScoreMatchListData.find(
      m => isNotNullAndUndefined(m.team1PenaltyScore) || isNotNullAndUndefined(m.team1PenaltyScore),
    );
    return (
      <div className="comp-player-grades-header-drop-down-view pt-0 mb-3 align-logo">
        <div className="reg-competition-radio mb-3">
          {isFootball && hasPenalty ? <span>{AppConstants.penaltyLegend}</span> : null}
        </div>
        <span className="applicable-to-heading pt-0">{AppConstants.matchStatus}</span>
        <div className="reg-competition-radio">
          {this.detailsContainer(AppImages.greenDot, AppConstants.final_description)}
          {this.detailsContainer(AppImages.purpleDot, AppConstants.draft_description)}
          {this.detailsContainer(AppImages.redDot, AppConstants.dispute_description)}
        </div>
        {!!allowAffiliatesEnterScore && (
          <>
            <span className="applicable-to-heading pt-0 mt-2">{AppConstants.resultsEntry}</span>
            <div className="reg-competition-radio">
              {this.detailsContainer(AppImages.lockIcon, AppConstants.final_description)}
            </div>
          </>
        )}
      </div>
    );
  }

  handleRegenLadderModalOk = matches => {
    const { regenLadderPointsModalFnArgs } = this.state;
    this.setState(
      {
        showRegenLadderPointsModal: false,
        regenLadderPointsModalFnArgs: null,
        onScoreUpdate: true,
      },
      () => {
        this.props.bulkScoreUpdate({
          ...regenLadderPointsModalFnArgs,
          approvedMatchesForRegenLadderPoints: matches,
        });
      },
    );
  };

  handleRegenLadderModalCancel = matches => {
    this.setState({
      showRegenLadderPointsModal: false,
      regenLadderPointsModalFnArgs: null,
    });
  };

  regenLadderPointsModalView = () => {
    const { showRegenLadderPointsModal, resetMatches } = this.state;
    return (
      <RegenerateLadderPointsModal
        visible={showRegenLadderPointsModal}
        onCancel={this.handleRegenLadderModalCancel}
        onOk={this.handleRegenLadderModalOk}
        matches={resetMatches}
        type="multiple"
      ></RegenerateLadderPointsModal>
    );
  };

  render() {
    let { exportingReport, finaliseResultLoad } = this.props.liveScoreMatchListState;
    return (
      <div className="fluid-width default-bg">
        <Loader visible={exportingReport || finaliseResultLoad} />
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
          <InnerHorizontalMenu menu="umpire" umpireSelectedKey="1" />
        ) : (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="2" />
        )}

        <Layout>
          {this.finaliseResultModalView()}
          {this.headerView()}
          {this.dropdownView()}
          <Content>
            {this.regenLadderPointsModalView()}
            {this.tableView()}
          </Content>
          {this.footerView()}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreMatchListAction,
      exportFilesAction,
      getLiveScoreDivisionList,
      liveScoreRoundListAction,
      changeMatchBulkScore,
      bulkScoreUpdate,
      onCancelBulkScoreUpdate,
      setPageSizeAction,
      setPageNumberAction,
      exportMediaReportAction,
      getLiveScoreSettingInitiate,
      liveScoreActivateFinalsReset,
      finaliseMatchResultAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreMatchListState: state.LiveScoreMatchState,
    liveScoreSetting: state.LiveScoreSetting,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreMatchesList);

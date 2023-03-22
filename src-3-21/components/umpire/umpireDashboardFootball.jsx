import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Button,
  Table,
  Select,
  Menu,
  Pagination,
  DatePicker,
  Checkbox,
  // message,
} from 'antd';
import moment from 'moment';
import UmpirePublishModal from '../../customComponents/umpirePublishModal';
import AppColor from 'themes/appColor';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
// import ValidationConstants from "themes/validationConstant";
import { isArrayNotEmpty, isNotNullAndUndefined } from 'util/helpers';
import history from 'util/history';
import {
  getUmpireCompetitionId,
  setUmpireCompetitionId,
  getOrganisationData,
  setUmpireCompetitionData,
  getUmpireCompetitionData,
  getLiveScoreUmpireCompition,
  getLiveScoreUmpireCompitionData,
  setLiveScoreUmpireCompition,
  setLiveScoreUmpireCompitionData,
  getPrevUrl,
} from 'util/sessionStorage';
import { exportFilesAction } from 'store/actions/appAction';
import {
  getUmpireDashboardList,
  getUmpireDashboardVenueList,
  getUmpireDashboardDivisionList,
  umpireRoundListAction,
  umpireDashboardUpdate,
  setPageSizeAction,
  setPageNumberAction,
  publishUmpireAllocation,
  saveBlockDeclineAction,
  findSaveUsersData,
  clearBlockDeclineData,
} from 'store/actions/umpireAction/umpireDashboardAction';
import {
  umpireCompetitionListAction,
  umpireCompetitionDetailAction,
} from 'store/actions/umpireAction/umpireCompetetionAction';

import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import { isEqual } from 'lodash';
import { FLAVOUR, MODAL_CLOSE_ACTION, RECORDUMPIRETYPE } from 'util/enums';
import './umpire.css';
import BlockDeclineModal from '../../customComponents/BlockDeclineModal';
import { getCurrentYear, checkLivScoreCompIsParent } from 'util/permissions';
import { MatchOfficialEditModal } from '../liveScore/matchOfficialEditModal';
let this_obj = null;

const { Content } = Layout;
// const { SubMenu } = Menu;
const { Option } = Select;
const { RangePicker } = DatePicker;

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  const { pageSize = 10 } = this_obj.props.umpireDashboardState;
  const body = {
    paging: {
      limit: pageSize,
      offset: this_obj.state.offsetData,
    },
    startDate: this_obj.state.startDate,
    endDate: this_obj.state.endDate,
    filterDate: this_obj.state.filterDates,
  };
  this_obj.setState({ sortBy, sortOrder });
  if (this_obj.state.selectedComp && this_obj.state.orgId) {
    this_obj.props.getUmpireDashboardList({
      compId: this_obj.state.selectedComp,
      divisionId: this_obj.state.division === 'All' ? '' : this_obj.state.division,
      venueId: this_obj.state.venue === 'All' ? '' : this_obj.state.venue,
      orgId: this_obj.state.orgId,
      roundId:
        this_obj.state.round === 'All'
          ? ''
          : Array.isArray(this_obj.state.round)
          ? this_obj.state.round
          : [this_obj.state.round],
      pageData: body,
      sortBy,
      sortOrder,
    });
  }
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

function validateColor(data) {
  if (data.verifiedBy !== null || data.status === 'YES') {
    return AppColor.umpireTextGreen;
  } else if (data.status === 'NO') {
    return AppColor.umpireTextRed;
  } else {
    return AppColor.standardTxtColor;
  }
}

function validateUmpireColor(data) {
  if (data.status === 'YES') {
    return AppColor.umpireTextGreen;
  } else if (data.status === 'NO') {
    return AppColor.umpireTextRed;
  } else {
    return AppColor.standardTxtColor;
  }
}

function checkUmpireType(umpireArray, key) {
  let object = null;
  for (let i in umpireArray) {
    if (umpireArray[i].sequence === key) {
      object = umpireArray[i];
    }
  }
  return object;
}

function checkUmpireReserve(reserveArray, key) {
  let object = null;
  for (let i in reserveArray) {
    if (reserveArray[i].roleId === key) {
      object = reserveArray[i];
      break;
    }
  }
  return object;
}

const columnsInvite = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: id => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: id, umpireKey: 'umpire', screenName: 'umpireDashboard' },
        }}
      >
        <span className="input-heading-add-another pt-0">{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: startTime => <span>{moment(startTime).format('DD/MM/YYYY HH:mm')}</span>,
  },
  {
    title: 'Home',
    dataIndex: 'team1',
    key: 'team1',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: team1 => <span>{team1.name}</span>,
  },
  {
    title: 'Away',
    dataIndex: 'team2',
    key: 'team2',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: team2 => <span>{team2.name}</span>,
  },
  {
    title: AppConstants.court,
    dataIndex: 'venueCourt',
    key: 'venueCourt',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.round,
    dataIndex: 'round',
    key: 'round',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: round => <span>{round.name}</span>,
  },
  {
    title: AppConstants.umpire1,
    dataIndex: 'umpires',
    key: 'umpires_1',
    sorter: true,
    onHeaderCell: () => listeners('umpire1'),
    render: umpires => {
      let umpire1 = checkUmpireType(umpires, 1) ? checkUmpireType(umpires, 1) : [];
      return (
        <span
          className="pointer"
          style={{ color: validateColor(umpire1) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire1)}
        >
          {umpire1.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire2,
    dataIndex: 'umpires',
    key: 'umpires_2',
    sorter: true,
    onHeaderCell: () => listeners('umpire2'),
    render: umpires => {
      let umpire2 = checkUmpireType(umpires, 2) ? checkUmpireType(umpires, 2) : [];
      return (
        <span
          className="pointer"
          style={{ color: validateColor(umpire2) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire2)}
        >
          {umpire2.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire3,
    dataIndex: 'umpires',
    key: 'umpires_3',
    sorter: true,
    onHeaderCell: () => listeners('umpire3'),
    render: umpires => {
      let umpire3 = checkUmpireType(umpires, 3) ? checkUmpireType(umpires, 3) : [];
      return (
        <span
          className="pointer"
          style={{ color: validateColor(umpire3) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire3)}
        >
          {umpire3.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire4,
    dataIndex: 'umpires',
    key: 'umpires_4',
    sorter: true,
    onHeaderCell: () => listeners('umpire4'),
    render: umpires => {
      let umpire4 = checkUmpireType(umpires, 4) ? checkUmpireType(umpires, 4) : [];
      return (
        <span
          className="pointer"
          style={{ color: validateColor(umpire4) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire4)}
        >
          {umpire4.umpireName}
        </span>
      );
    },
  },
  {
    title: 'Verified By',
    dataIndex: 'umpires',
    key: 'umpires',
    sorter: true,
    onHeaderCell: () => listeners('verifiedBy'),
    render: (umpires, record) => (
      <span className="multi-column-text-aligned">
        {isArrayNotEmpty(record.umpires) ? (
          record.umpires[0].verifiedByUserId ? (
            <span
              style={{ color: validateUmpireColor(record.umpires[0]) }}
              className="multi-column-text-aligned pointer"
              onClick={() => this_obj.checkVerifiedUser(record.umpires[0])}
            >
              {record.umpires[0].verifiedBy}
            </span>
          ) : (
            record.umpires[0].verifiedBy
          )
        ) : (
          ''
        )}
      </span>
    ),
  },
  {
    title: AppConstants.umpireReservePref,
    dataIndex: 'umpireReserves',
    key: 'umpireReserves',
    sorter: false,
    render: (umpireReserves, record) => {
      let umpireReserve = checkUmpireReserve(umpireReserves, 19)
        ? checkUmpireReserve(umpireReserves, 19)
        : [];
      return (
        <span
          style={{ color: validateUmpireColor(umpireReserve) }}
          onClick={() => this_obj.checkUserIdUmpire(umpireReserve)}
          className="multi-column-text-aligned pointer"
        >
          {umpireReserve.umpireFirstName
            ? umpireReserve.umpireFirstName + ' ' + umpireReserve.umpireLastName
            : ''}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpireCoach,
    dataIndex: 'umpireCoaches',
    key: 'umpireCoaches',
    sorter: false,
    render: (umpireCoaches, record) => {
      let umpireCoach = checkUmpireReserve(umpireCoaches, 20)
        ? checkUmpireReserve(umpireCoaches, 20)
        : [];
      return (
        <span
          style={{ color: validateUmpireColor(umpireCoach) }}
          onClick={() => this_obj.checkUserIdUmpire(umpireCoach)}
          className="multi-column-text-aligned pointer"
        >
          {umpireCoach.umpireFirstName
            ? umpireCoach.umpireFirstName + ' ' + umpireCoach.umpireLastName
            : ''}
        </span>
      );
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (umpires, record) => (
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <Menu.SubMenu
          key="sub1"
          style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
          title={
            <img
              className="dot-image"
              src={AppImages.moreTripleDot}
              width="16"
              height="16"
              alt=""
            />
          }
        >
          {this_obj.state.selectedComp &&
            this_obj.state.competitionObj?.recordUmpireType !== RECORDUMPIRETYPE.None && (
              <Menu.Item key="editUmpire">
                <div onClick={() => this_obj.editUmpire(record)}>{AppConstants.editOfficials}</div>
              </Menu.Item>
            )
          }
          <Menu.Item key="3">
            <NavLink
              to={{
                pathname: './addUmpire',
                state: { record, screenName: 'umpireDashboard' },
              }}
            >
              <span>Invite</span>
            </NavLink>
          </Menu.Item>

          {umpires ? (
            umpires[0] &&
            umpires[0].verifiedBy === null && (
              <Menu.Item key="1">
                <NavLink
                  to={{
                    pathname: '/matchDayAddMatch',
                    state: {
                      matchId: record.id,
                      umpireKey: 'umpire',
                      isEdit: true,
                      screenName: 'umpireDashboard',
                    },
                  }}
                >
                  <span>Edit</span>
                </NavLink>
              </Menu.Item>
            )
          ) : (
            <Menu.Item key="2">
              <NavLink
                to={{
                  pathname: '/matchDayAddMatch',
                  state: {
                    matchId: record.id,
                    umpireKey: 'umpire',
                    isEdit: true,
                    screenName: 'umpireDashboard',
                  },
                }}
              >
                <span>Edit</span>
              </NavLink>
            </Menu.Item>
          )}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

const columns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'id',
    key: '_id',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: id => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: id, umpireKey: 'umpire', screenName: 'umpireDashboard' },
        }}
      >
        <span className="input-heading-add-another pt-0">{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: '_startTime',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: startTime => <span>{moment(startTime).format('DD/MM/YYYY HH:mm')}</span>,
  },
  {
    title: 'Home',
    dataIndex: 'team1',
    key: '_team1',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: team1 => <span>{team1.name}</span>,
  },
  {
    title: 'Away',
    dataIndex: 'team2',
    key: '_team2',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: team2 => <span>{team2.name}</span>,
  },
  {
    title: AppConstants.court,
    dataIndex: 'venueCourt',
    key: 'venueCourt',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.round,
    dataIndex: 'round',
    key: '_round',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: round => <span>{round.name}</span>,
  },
  {
    title: AppConstants.umpire1,
    dataIndex: 'umpires',
    key: '_umpires_1',
    sorter: true,
    onHeaderCell: () => listeners('umpire1'),
    render: umpires => {
      let umpire1 = checkUmpireType(umpires, 1) ? checkUmpireType(umpires, 1) : [];
      return (
        <span
          style={{ color: validateColor(umpire1) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire1)}
        >
          {umpire1.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire2,
    dataIndex: 'umpires',
    key: '_umpires_2',
    sorter: true,
    onHeaderCell: () => listeners('umpire2'),
    render: umpires => {
      let umpire2 = checkUmpireType(umpires, 2) ? checkUmpireType(umpires, 2) : [];
      return (
        <span
          style={{ color: validateColor(umpire2) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire2)}
        >
          {umpire2.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire3,
    dataIndex: 'umpires',
    key: '_umpires_3',
    sorter: false,
    // onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: umpires => {
      let umpire3 = checkUmpireType(umpires, 3) ? checkUmpireType(umpires, 3) : [];
      return (
        <span
          style={{ color: validateColor(umpire3) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire3)}
        >
          {umpire3.umpireName}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpire4,
    dataIndex: 'umpires',
    key: '_umpires_4',
    sorter: false,
    // onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: umpires => {
      let umpire4 = checkUmpireType(umpires, 4) ? checkUmpireType(umpires, 4) : [];
      return (
        <span
          style={{ color: validateColor(umpire4) }}
          onClick={() => this_obj.checkUserIdUmpire(umpire4)}
        >
          {umpire4.umpireName}
        </span>
      );
    },
  },
  {
    title: 'Verified By',
    dataIndex: 'umpires',
    key: 'umpires',
    sorter: true,
    onHeaderCell: () => listeners('verifiedBy'),
    render: (umpires, record) => (
      <span className="multi-column-text-aligned">
        {isArrayNotEmpty(record.umpires) ? (
          record.umpires[0].verifiedByUserId ? (
            <span
              style={{ color: validateUmpireColor(record.umpires[0]) }}
              className="multi-column-text-aligned pointer"
              onClick={() => this_obj.checkVerifiedUser(record.umpires[0])}
            >
              {record.umpires[0].verifiedBy}
            </span>
          ) : (
            record.umpires[0].verifiedBy
          )
        ) : (
          ''
        )}
      </span>
    ),
  },
  {
    title: AppConstants.umpireReservePref,
    dataIndex: 'umpireReserves',
    key: 'umpireReserves',
    sorter: false,
    render: (umpireReserves, record) => {
      let umpireReserve = checkUmpireReserve(umpireReserves, 19)
        ? checkUmpireReserve(umpireReserves, 19)
        : [];
      return (
        <span
          style={{ color: validateUmpireColor(umpireReserve) }}
          className="multi-column-text-aligned pointer"
          onClick={() => this_obj.checkUserIdUmpire(umpireReserve)}
        >
          {umpireReserve.umpireFirstName
            ? umpireReserve.umpireFirstName + ' ' + umpireReserve.umpireLastName
            : ''}
        </span>
      );
    },
  },
  {
    title: AppConstants.umpireCoach,
    dataIndex: 'umpireCoaches',
    key: 'umpireCoaches',
    sorter: false,
    render: (umpireCoaches, record) => {
      let umpireCoach = checkUmpireReserve(umpireCoaches, 20)
        ? checkUmpireReserve(umpireCoaches, 20)
        : [];
      return (
        <span
          style={{ color: validateUmpireColor(umpireCoach) }}
          onClick={() => this_obj.checkUserIdUmpire(umpireCoach)}
          className="multi-column-text-aligned pointer"
        >
          {umpireCoach.umpireFirstName
            ? umpireCoach.umpireFirstName + ' ' + umpireCoach.umpireLastName
            : ''}
        </span>
      );
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: '_action',
    render: (umpires, record) => (
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <Menu.SubMenu
          key="sub1"
          style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
          title={
            <img
              className="dot-image"
              src={AppImages.moreTripleDot}
              width="16"
              height="16"
              alt=""
            />
          }
        >
          {umpires ? (
            umpires[0] &&
            umpires[0].verifiedBy === null && (
              <Menu.Item key="1">
                <NavLink
                  to={{
                    pathname: '/matchDayAddMatch',
                    state: {
                      matchId: record.id,
                      umpireKey: 'umpire',
                      isEdit: true,
                      screenName: 'umpireDashboard',
                    },
                  }}
                >
                  <span>Edit</span>
                </NavLink>
              </Menu.Item>
            )
          ) : (
            <Menu.Item key="2">
              <NavLink
                to={{
                  pathname: '/matchDayAddMatch',
                  state: {
                    matchId: record.id,
                    umpireKey: 'umpire',
                    isEdit: true,
                    screenName: 'umpireDashboard',
                  },
                }}
              >
                <span>Edit</span>
              </NavLink>
            </Menu.Item>
          )}
          {this_obj.state.selectedComp &&
            this_obj.state.competitionObj?.recordUmpireType !== RECORDUMPIRETYPE.None && (
              <Menu.Item key="editUmpire">
                <div onClick={() => this_obj.editUmpire(record)}>{AppConstants.editOfficials}</div>
              </Menu.Item>
            )}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

class UmpireDashboard extends Component {
  constructor(props) {
    super(props);
    this.allColumns = columns;

    this.state = {
      selectedComp: null,
      selectedUmpire: null,
      umpireSequenceSettings: [],
      loading: false,
      competitionUniqueKey: null,
      venue: 'All',
      venueLoad: false,
      division: 'All',
      divisionLoad: false,
      orgId: null,
      compArray: [],
      competitionObj: null,
      liveScoreUmpire:
        props.location && props.location.state && props.location.state.liveScoreUmpire
          ? props.location.state.liveScoreUmpire
          : null,
      isParticipateInCompetition:
        props.location && props.location.state && props.location.state.isParticipate
          ? props.location.state.isParticipate
          : false,
      round: 'All',
      offsetData: 0,
      sortBy: null,
      sortOrder: null,
      org_Id: null,
      liveScoreCompIsParent: false,
      showBlockDeclineModal: false,
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      filterDates: false,
    };
    this_obj = this;
  }

  async componentDidMount() {
    this.setLivScoreCompIsParent();
    const prevUrl = getPrevUrl();
    const { umpireDashboardListActionObject } = this.props.umpireDashboardState;
    // let offsetData = this.state.offsetData
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    let compId = getLiveScoreUmpireCompition();
    if (compId) {
      this.props.findSaveUsersData(compId);
    }
    if (umpireDashboardListActionObject) {
      let offsetData = umpireDashboardListActionObject.pageData.paging.offset;
      sortBy = umpireDashboardListActionObject.sortBy;
      sortOrder = umpireDashboardListActionObject.sortOrder;
      let division =
        umpireDashboardListActionObject.divisionId === ''
          ? 'All'
          : umpireDashboardListActionObject.divisionId;
      let round =
        umpireDashboardListActionObject.roundId === ''
          ? 'All'
          : umpireDashboardListActionObject.roundId;
      let venue =
        umpireDashboardListActionObject.venueId === ''
          ? 'All'
          : umpireDashboardListActionObject.venueId;
      await this.setState({ division, round, venue, offsetData, sortBy, sortOrder });
      // page = Math.floor(offset / 10) + 1;
    }
    const { organisationId } = getOrganisationData() || {};
    this.setState({ orgId: organisationId ? organisationId : null });
    if (
      !prevUrl ||
      !(history.location.pathname === prevUrl.pathname && history.location.key === prevUrl.key)
    ) {
      this.setState({ loading: true });
      if (organisationId)
        this.props.umpireCompetitionListAction(
          null,
          null,
          organisationId,
          null,
          null,
          null,
          true,
          this.state.isParticipateInCompetition,
        );
    } else {
      history.push('/');
    }
  }

  parseUmpireSequence = umpireSequenceSetting => {
    let sequences =
      AppConstants.flavour === FLAVOUR.Netball
        ? [0, 1, 2, 5]
        : AppConstants.flavour === FLAVOUR.Basketball
        ? [1, 2]
        : [1, 2, 3, 5];
    if (
      isNotNullAndUndefined(umpireSequenceSetting) &&
      umpireSequenceSetting != 'null' &&
      umpireSequenceSetting != 'undefined'
    ) {
      sequences = [];
      let sequenceSetting = {};
      if (Object.prototype.toString.call(umpireSequenceSetting) === '[object String]') {
        sequenceSetting = JSON.parse(umpireSequenceSetting);
      } else {
        Object.assign(sequenceSetting, umpireSequenceSetting);
      }
      let numberOfUmpires = sequenceSetting.NumberOfUmpires || 0;
      for (let index = 1; index <= numberOfUmpires; index++) {
        sequences.push(index);
      }
      sequenceSetting.CoachEnabled && sequences.push(5);
      sequenceSetting.ReserveEnabled && sequences.push(0);
    }
    return sequences;
  };

  componentDidUpdate(prevProps) {
    let { sortBy, sortOrder } = this.state;

    if (!isEqual(prevProps.umpireCompetitionState, this.props.umpireCompetitionState)) {
      if (this.state.loading && !this.props.umpireCompetitionState.onLoad) {
        let compList =
          this.props.umpireCompetitionState.umpireComptitionList &&
          isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
            ? this.props.umpireCompetitionState.umpireComptitionList
            : [];
        let firstComp = compList && compList.length ? compList[0].id : null;
        let compData = compList && compList.length ? compList[0] : null;
        const umpireCompetition = getUmpireCompetitionId()
          ? JSON.parse(getUmpireCompetitionId())
          : null;
        if (umpireCompetition) {
          if (this.state.liveScoreUmpire === 'liveScoreUmpire') {
            if (compData) this.setState({ org_Id: compData?.organisationId });
            firstComp = getLiveScoreUmpireCompition()
              ? JSON.parse(getLiveScoreUmpireCompition())
              : null;
            compData = getLiveScoreUmpireCompitionData()
              ? JSON.parse(getLiveScoreUmpireCompitionData())
              : null;
            if (firstComp) setUmpireCompetitionId(firstComp);
            if (compData) setUmpireCompetitionData(JSON.stringify(compData));
          } else {
            firstComp = umpireCompetition;
            compData = getUmpireCompetitionData() ? JSON.parse(getUmpireCompetitionData()) : null;
            this.setState({ org_Id: compData?.organisationId });
          }
        } else {
          if (firstComp) setUmpireCompetitionId(firstComp);
          if (compData) setUmpireCompetitionData(JSON.stringify(compData));
          if (compData) this.setState({ org_Id: compData?.organisationId });
        }

        if (compData) {
          this.refreshColumns(compData);
        }

        if (!!firstComp) {
          if (this.state.liveScoreUmpire === 'liveScoreUmpire') {
            let compId = getLiveScoreUmpireCompition()
              ? JSON.parse(getLiveScoreUmpireCompition())
              : null;
            if (compId) this.props.getUmpireDashboardVenueList(compId);
            let compObjData = getLiveScoreUmpireCompitionData()
              ? JSON.parse(getLiveScoreUmpireCompitionData())
              : null;
            const { uniqueKey, organisationId, umpireSequenceSettings } = compObjData;
            let sequences = this.parseUmpireSequence(umpireSequenceSettings);
            this.setState({
              selectedComp: compId,
              umpireSequenceSettings: sequences,
              loading: false,
              competitionUniqueKey: uniqueKey,
              compArray: compList,
              venueLoad: true,
              competitionObj: compObjData,
              org_Id: organisationId,
            });
          } else {
            if (firstComp) this.props.getUmpireDashboardVenueList(firstComp);
            let compKey =
              compList && compList.length && compList[0].competitionUniqueKey
                ? compList[0].competitionUniqueKey
                : 0;
            let umpireSequenceSettings = null;
            if (compData) {
              umpireSequenceSettings = compData.umpireSequenceSettings;
            }
            let sequences = this.parseUmpireSequence(umpireSequenceSettings);
            this.setState({
              selectedComp: firstComp,
              umpireSequenceSettings: sequences,
              loading: false,
              competitionUniqueKey: compKey,
              compArray: compList,
              venueLoad: true,
              competitionObj: compData,
            });
          }
        } else {
          this.setState({ loading: false });
        }
      }
    }

    if (!isEqual(prevProps.umpireDashboardState, this.props.umpireDashboardState)) {
      if (this.props.umpireDashboardState.onVenueLoad === false && this.state.venueLoad === true) {
        if (this.state.selectedComp)
          this.props.getUmpireDashboardDivisionList(this.state.selectedComp);
        this.setState({ venueLoad: false, divisionLoad: true });
      }
    }

    if (!isEqual(prevProps.umpireDashboardState, this.props.umpireDashboardState)) {
      if (
        this.props.umpireDashboardState.onDivisionLoad === false &&
        this.state.divisionLoad === true
      ) {
        const { pageSize = 10 } = this_obj.props.umpireDashboardState;
        const body = {
          paging: {
            limit: pageSize,
            offset: this.state.offsetData,
          },
          startDate: this.state.startDate,
          endDate: this.state.endDate,
          filterDate: this.state.filterDates,
        };
        this.setState({ divisionLoad: false });
        if (this.state.selectedComp && this.state.orgId)
          this.props.getUmpireDashboardList({
            compId: this.state.selectedComp,
            divisionId: this.state.division === 'All' ? '' : this.state.division,
            venueId: this.state.venue === 'All' ? '' : this.state.venue,
            orgId: this.state.orgId,
            roundId:
              this.state.round === 'All'
                ? ''
                : Array.isArray(this.state.round)
                ? this.state.round
                : [this.state.round],
            pageData: body,
            sortBy,
            sortOrder,
          });

        if (this.state.selectedComp)
          this.props.umpireRoundListAction(
            this.state.selectedComp,
            this.state.division === 'All' ? '' : this.state.division,
          );
      }
    }

    if (!isEqual(prevProps.umpireDashboardState, this.props.umpireDashboardState)) {
      if (
        this.props.umpireDashboardState.publishModalClose === MODAL_CLOSE_ACTION.Close &&
        this.state.showPublishModal
      ) {
        this.setState({ showPublishModal: false });
      } else if (
        this.props.umpireDashboardState.publishModalClose === MODAL_CLOSE_ACTION.CloseAndReload &&
        this.state.showPublishModal
      ) {
        this.setState({ showPublishModal: false }, () => this.reloadUmpireDashboard());
      }
    }
  }

  checkVerifiedUser = record => {
    this.checkUserIdUmpire({ userId: record.verifiedByUserId });
  };

  checkUserIdUmpire = record => {
    if (record.userId) {
      history.push('/userPersonal', {
        userId: record.userId,
        screenKey: 'umpire',
        screen: '/umpireDashboard',
      });
      // } else if (record.matchUmpiresId) {
      //     history.push("/userPersonal", {
      //         userId: record.matchUmpiresId,
      //         screenKey: "umpire",
      //         screen: "/umpireDashboard",
      //     });
    } else {
      // message.config({ duration: 1.5, maxCount: 1 });
      // message.warn(ValidationConstants.umpireMessage);
    }
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { sortBy, sortOrder } = this.state;
    const { pageSize = 10 } = this.props.umpireDashboardState;
    let offsetData = page ? pageSize * (page - 1) : 0;
    this.setState({ offsetData });

    const body = {
      paging: {
        limit: pageSize,
        offset: offsetData,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };

    if (this.state.selectedComp && this.state.orgId)
      this.props.getUmpireDashboardList({
        compId: this.state.selectedComp,
        divisionId: this.state.division === 'All' ? '' : this.state.division,
        venueId: this.state.venue === 'All' ? '' : this.state.venue,
        orgId: this.state.orgId,
        roundId:
          this.state.round === 'All'
            ? ''
            : Array.isArray(this.state.round)
            ? this.state.round
            : [this.state.round],
        pageData: body,
        sortBy,
        sortOrder,
      });
  };

  filterColumnsFunc = columns => {
    let { umpireSequenceSettings } = this.state;

    if (!umpireSequenceSettings || !umpireSequenceSettings.length) {
      umpireSequenceSettings = [1, 2, 3, 5];
    }
    let newColumns = [];
    const labels_ = [
      AppConstants.umpire1,
      AppConstants.umpire2,
      AppConstants.umpire3,
      AppConstants.umpire4,
      AppConstants.umpireCoach,
    ];
    //umpireSequenceSettings = [];
    if (umpireSequenceSettings) {
      const labels = umpireSequenceSettings.map(i => labels_[i - 1]);
      if (umpireSequenceSettings && umpireSequenceSettings.length > 0) {
        for (const column of columns) {
          if (
            labels_.indexOf(column.title) === -1 ||
            (labels_.indexOf(column.title) > -1 && labels.indexOf(column.title) > -1)
          ) {
            newColumns.push(column);
          }
        }
      }
    }
    return newColumns;
  };

  contentView = () => {
    const { umpireDashboardList, totalPages, currentPage, pageSize } =
      this.props.umpireDashboardState;
    let umpireListResult =
      umpireDashboardList && isArrayNotEmpty(umpireDashboardList) ? umpireDashboardList : [];

    let filterColumns = this.filterColumnsFunc(this.allColumns);

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={
              this.props.umpireDashboardState.onLoad || this.props.umpireCompetitionState.onLoad
            }
            className="home-dashboard-table"
            columns={filterColumns}
            dataSource={
              this.props.umpireDashboardState.onLoad || this.props.umpireCompetitionState.onLoad
                ? []
                : umpireListResult
            }
            pagination={false}
            rowKey={record => 'umpireListResult' + record.id}
          />
        </div>

        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>

          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              total={totalPages}
              current={currentPage}
              defaultCurrent={currentPage}
              defaultPageSize={pageSize}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  onChangeComp = compID => {
    let selectedComp = compID && compID.comp ? compID.comp : null;
    let compKey = compID && compID.competitionUniqueKey ? compID.competitionUniqueKey : null;

    if (selectedComp) {
      this.props.getUmpireDashboardVenueList(selectedComp);
      this.props.getUmpireDashboardDivisionList(selectedComp);
      this.props.findSaveUsersData(selectedComp);
    }

    const compObj = this.state.compArray.find(comp => comp?.id === compID?.comp) || null;

    if (selectedComp) {
      setUmpireCompetitionId(selectedComp);
      setLiveScoreUmpireCompition(selectedComp);
    }
    if (compObj) {
      setUmpireCompetitionData(JSON.stringify(compObj));
      setLiveScoreUmpireCompitionData(JSON.stringify(compObj));
    }
    let { umpireSequenceSettings } = compObj;
    let sequences = this.parseUmpireSequence(umpireSequenceSettings);
    this.setState({
      selectedComp,
      umpireSequenceSettings: sequences,
      competitionUniqueKey: compKey,
      venueLoad: true,
      divisionLoad: true,
      venue: 'All',
      division: 'All',
      competitionObj: compObj,
      round: 'All',
      sortBy: '',
      sortOrder: '',
      offsetData: 0,
    });
  };

  onVenueChange = venueId => {
    let { sortBy, sortOrder } = this.state;
    const { pageSize = 10 } = this.props.umpireDashboardState;
    const body = {
      paging: {
        limit: pageSize,
        offset: 0,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };

    if (this.state.selectedComp && this.state.orgId)
      this.props.getUmpireDashboardList({
        compId: this.state.selectedComp,
        divisionId: this.state.division === 'All' ? '' : this.state.division,
        venueId: venueId === 'All' ? '' : venueId,
        orgId: this.state.orgId,
        roundId:
          this.state.round === 'All'
            ? ''
            : Array.isArray(this.state.round)
            ? this.state.round
            : [this.state.round],
        pageData: body,
        sortBy,
        sortOrder,
      });

    this.setState({ venue: venueId });
  };

  onDivisionChange = divisionId => {
    this.setState({ division: divisionId, round: 'All' });
    let { sortBy, sortOrder } = this.state;
    const { pageSize = 10 } = this.props.umpireDashboardState;
    const body = {
      paging: {
        limit: pageSize,
        offset: 0,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };

    setTimeout(() => {
      if (this.state.selectedComp && this.state.orgId)
        this.props.getUmpireDashboardList({
          compId: this.state.selectedComp,
          divisionId: divisionId === 'All' ? '' : divisionId,
          venueId: this.state.venue === 'All' ? '' : this.state.venue,
          orgId: this.state.orgId,
          roundId:
            this.state.round === 'All'
              ? ''
              : Array.isArray(this.state.round)
              ? this.state.round
              : [this.state.round],
          pageData: body,
          sortBy,
          sortOrder,
        });
    }, 100);

    if (this.state.selectedComp)
      this.props.umpireRoundListAction(
        this.state.selectedComp,
        divisionId === 'All' ? '' : divisionId,
      );

    this.setState({ division: divisionId, round: 'All' });
  };

  onRoundChange = roundId => {
    if (roundId !== 'All') {
      this.props.umpireDashboardUpdate(roundId);
    }
    let { sortBy, sortOrder } = this.state;
    const { pageSize = 10 } = this.props.umpireDashboardState;
    const body = {
      paging: {
        limit: pageSize,
        offset: 0,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };
    const { allRoundIds } = this.props.umpireDashboardState;
    if (this.state.selectedComp && this.state.orgId)
      this.props.getUmpireDashboardList({
        compId: this.state.selectedComp,
        divisionId: this.state.division === 'All' ? '' : this.state.division,
        venueId: this.state.venue === 'All' ? '' : this.state.venue,
        orgId: this.state.orgId,
        roundId: roundId === 'All' ? '' : allRoundIds,
        pageData: body,
        sortBy,
        sortOrder,
      });

    this.setState({ round: roundId === 'All' ? 'All' : allRoundIds });
  };

  onExport = () => {
    if (this.state.orgId && this.state.selectedComp) {
      let url =
        AppConstants.umpireDashboardExport +
        `competitionId=${this.state.selectedComp}&organisationId=${this.state.orgId}&startDate=${
          this.state.filterDates ? this.state.startDate : null
        }&endDate=${this.state.filterDates ? this.state.endDate : null}`;
      this.props.exportFilesAction(url);
    }
  };

  onSaveBlockDecline = saveData => {
    const compData = getLiveScoreUmpireCompitionData()
      ? JSON.parse(getLiveScoreUmpireCompitionData())
      : null;
    const payload = {
      id: compData ? compData.id : null,
      contact: JSON.stringify(saveData),
    };
    this.setState({ showBlockDeclineModal: false });
    this.props.saveBlockDeclineAction(payload);
  };

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  reloadUmpireDashboard = (offset = 0) => {
    const { round, division, venue, sortBy, sortOrder, selectedComp, orgId } = this.state;
    const { pageSize = 10, allRoundIds } = this.props.umpireDashboardState;
    const body = {
      paging: {
        limit: pageSize,
        offset,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    };
    if (selectedComp && orgId) {
      this.props.getUmpireDashboardList({
        compId: selectedComp,
        divisionId: division === 'All' ? '' : division,
        venueId: venue === 'All' ? '' : venue,
        orgId: orgId,
        roundId: round === 'All' ? '' : allRoundIds,
        pageData: body,
        sortBy,
        sortOrder,
      });
    }
  };

  refreshColumns(competition) {
    const numberOfOfficials = competition.umpireSequenceSettings?.NumberOfOfficials ?? 0;
    let umpireType =
      competition && competition.recordUmpireType ? competition.recordUmpireType : '';
    const allColumns = [...(umpireType === 'USERS' ? columnsInvite : columns)];
    const allColumnsExceptAction = allColumns.slice(0, -1);
    if (numberOfOfficials > 0) {
      for (const sequence of Array.from({ length: numberOfOfficials }).map(
        (_, i) => i + 1,
      )) {
        allColumnsExceptAction.push({
          title: `${AppConstants.officialStatisticians} ${sequence}`,
          dataIndex: 'officials',
          key: `officials-${sequence}`,
          render: officials => {
            const official = (officials ?? []).find(official => official.sequence === sequence);
            return official ? <span>{official.name}</span> : null;
          },
        });
      }
    }
    this.allColumns = [...allColumnsExceptAction, allColumns[allColumns.length - 1]];
  }

  onPublish = publishData => {
    console.log(publishData);
    if (this.state.selectedComp && this.state.orgId) {
      let { divisionIds, roundIds, startDate, endDate } = publishData;
      let findRoundIds = [];
      if (roundIds.length) {
        roundIds.forEach(r => {
          findRoundIds = findRoundIds.concat(this.getAllRoundName(r));
        });
      }
      roundIds = [...findRoundIds];
      this.props.publishUmpireAllocation({
        compId: this.state.selectedComp,
        orgId: this.state.orgId,
        divisionIds,
        roundIds,
        startDate,
        endDate,
      });
    }
  };

  getAllRoundName = roundId => {
    const { allRoundList } = this.props.umpireDashboardState;
    let getRoundName = allRoundList.find(({ id }) => id === roundId).name;
    return allRoundList.filter(x => x.name === getRoundName).map(x => x.id);
  };

  getUmpireBlockDeclineData = () => {
    this.setState({ showBlockDeclineModal: true });
  };

  resetBlockDeclineValueForComps = () => {
    this.props.clearBlockDeclineData();
    this.setState({ showBlockDeclineModal: false });
  };

  editUmpire(record) {
    this.setState({
      selectedUmpire: record.id,
    });
  }

  headerView = () => {
    const compData = getLiveScoreUmpireCompitionData()
      ? JSON.parse(getLiveScoreUmpireCompitionData())
      : null;
    let isCompParent = this.state.orgId === this.state.org_Id;
    let isCompetitionAvailable = this.state.selectedComp ? false : true;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        {this.state.selectedUmpire && this.state.selectedComp && (
          <MatchOfficialEditModal
            matchId={this.state.selectedUmpire}
            isCompParent={isCompParent}
            onClose={saved => {
              this.setState({ selectedUmpire: null });
              if (saved) {
                this.reloadUmpireDashboard(this.state.offsetData);
              }
            }}
            competitionId={this.state.selectedComp}
          />
        )}
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.dashboard}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                {/*
                                    <div className="col-sm pt-1">
                                        <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                                            <NavLink to="/addUmpire" className="text-decoration-none">
                                                <Button className="primary-add-comp-form" type="primary">
                                                    + {AppConstants.addUmpire}
                                                </Button>
                                            </NavLink>
                                        </div>
                                    </div>
                                    */}
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    {this.state.selectedComp && compData?.recordUmpireType === 'USERS' && (
                      <div className="col-sm pt-1">
                        <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                          <Button
                            type="primary"
                            className="primary-add-comp-form"
                            onClick={() => this.getUmpireBlockDeclineData()}
                          >
                            <div className="row">
                              <div className="col-sm">{AppConstants.blockDecline}</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="primary"
                      className="primary-add-comp-form"
                      onClick={() => this.setState({ showPublishModal: true })}
                    >
                      <div className="row">
                        <div className="col-sm">{AppConstants.publish}</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      type="primary"
                      disabled={isCompetitionAvailable}
                      className="primary-add-comp-form"
                      onClick={this.onExport}
                    >
                      <div className="row">
                        <div className="col-sm">
                          <img className="export-image" src={AppImages.export} alt="" />
                          {AppConstants.export}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="col-sm pt-1">
                  {isCompParent && (
                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                      <NavLink
                        className="text-decoration-none"
                        to={{
                          pathname: '/umpireImport',
                          state: { screenName: 'umpireDashboard' },
                        }}
                      >
                        <Button
                          disabled={isCompetitionAvailable}
                          className="primary-add-comp-form"
                          type="primary"
                        >
                          <div className="row">
                            <div className="col-sm">
                              <img className="export-image" src={AppImages.import} alt="" />
                              {AppConstants.import}
                            </div>
                          </div>
                        </Button>
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState({
        startDate,
        endDate,
      });

      let { sortBy, sortOrder } = this.state;
      const { pageSize = 10 } = this.props.umpireDashboardState;
      const body = {
        paging: {
          limit: pageSize,
          offset: 0,
        },
        startDate,
        endDate,
        filterDate: this.state.filterDates,
      };

      if (this.state.selectedComp && this.state.orgId)
        this.props.getUmpireDashboardList({
          compId: this.state.selectedComp,
          divisionId: this.state.division === 'All' ? '' : this.state.division,
          venueId: this.state.venue === 'All' ? '' : this.state.venue,
          orgId: this.state.orgId,
          roundId:
            this.state.round === 'All'
              ? ''
              : Array.isArray(this.state.round)
              ? this.state.round
              : [this.state.round],
          pageData: body,
          sortBy,
          sortOrder,
        });
    }
  };

  onDateRangeCheck = val => {
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate });

    let { sortBy, sortOrder } = this.state;
    const { pageSize = 10 } = this.props.umpireDashboardState;
    const body = {
      paging: {
        limit: pageSize,
        offset: 0,
      },
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: val,
    };

    if (this.state.selectedComp && this.state.orgId)
      this.props.getUmpireDashboardList({
        compId: this.state.selectedComp,
        divisionId: this.state.division === 'All' ? '' : this.state.division,
        venueId: this.state.venue === 'All' ? '' : this.state.venue,
        orgId: this.state.orgId,
        roundId:
          this.state.round === 'All'
            ? ''
            : Array.isArray(this.state.round)
            ? this.state.round
            : [this.state.round],
        pageData: body,
        sortBy,
        sortOrder,
      });
  };

  dropdownView = () => {
    let competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
      ? this.props.umpireCompetitionState.umpireComptitionList
      : [];
    const { umpireVenueList, umpireDivisionList, umpireRoundList } =
      this.props.umpireDashboardState;
    let venueList = isArrayNotEmpty(umpireVenueList) ? umpireVenueList : [];
    let divisionList = isArrayNotEmpty(umpireDivisionList) ? umpireDivisionList : [];
    let roundList = isArrayNotEmpty(umpireRoundList) ? umpireRoundList : [];
    let umpireType = this.state.competitionObj ? this.state.competitionObj?.recordUmpireType : null;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-1">
        <div className="fluid-width">
          <div className="row reg-filter-row">
            <div className="reg-col">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: '145px' }}>
                  {AppConstants.competition} :
                </div>

                <Select
                  // showSearch
                  // optionFilterProp="children"
                  className="year-select reg-filter-select1"
                  style={{ minWidth: 200 }}
                  onChange={comp => this.onChangeComp({ comp })}
                  value={this.state.selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {competition.map(item => (
                    <Option key={'competition_' + item.id} value={item.id}>
                      {item.longName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col1 ml-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: '133px' }}>
                  {AppConstants.venue} :
                </div>
                <Select
                  className="year-select reg-filter-select1"
                  onChange={this.onVenueChange}
                  value={this.state.venue}
                >
                  <Option value="All">All</Option>
                  {venueList.map(item => (
                    <Option key={'venue_' + item.venueId} value={item.venueId}>
                      {item.venueName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col1 ml-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: '147px' }}>
                  {AppConstants.division} :
                </div>
                <Select
                  className="year-select reg-filter-select1"
                  onChange={this.onDivisionChange}
                  value={this.state.division}
                >
                  <Option value="All">All</Option>
                  {divisionList.map(item => (
                    <Option key={'division_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col1 ml-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: '128px' }}>
                  {AppConstants.round} :
                </div>
                <Select
                  className="year-select reg-filter-select1"
                  onChange={this.onRoundChange}
                  value={this.state.round}
                >
                  <Option value="All">All</Option>
                  {roundList.map(item => (
                    <Option key={'round_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="reg-col1 ml-5">
              <div className="reg-filter-col-cont">
                <RangePicker
                  disabled={
                    this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true
                  }
                  onChange={date => this.onChangeStartDate(date)}
                  format="DD-MM-YYYY"
                  style={{ width: '100%', minWidth: 180 }}
                  value={[moment(this.state.startDate), moment(this.state.endDate)]}
                />
                <Checkbox
                  className="single-checkbox-radio-style"
                  style={{ minWidth: 150, marginLeft: 8 }}
                  checked={this.state.filterDates}
                  onChange={e => this.onDateRangeCheck(e.target.checked)}
                  disabled={this.state.firstTimeCompId == '-1'}
                  // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
                >
                  {AppConstants.filterDates}
                </Checkbox>
              </div>
            </div>
          </div>

          {umpireType && umpireType !== 'USERS' && (
            <div>
              <NavLink
                to={{
                  pathname: '/matchDaySettingsView',
                  state: {
                    selectedComp: this.state.selectedComp,
                    screenName: 'umpireDashboard',
                    edit: 'edit',
                  },
                }}
              >
                <span className="input-heading-add-another pt-0">
                  {AppConstants.competitionEnabled}
                </span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    );
  };

  countView = () => {
    // let userRegistrationState = this.props.userRegistrationState;
    // let userRegDashboardList = userRegistrationState.userRegDashboardListData;
    // let total = userRegistrationState.userRegDashboardListTotalCount;
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="row">
            <div className="col-sm">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">No. of umpires</div>
                <div className="reg-payment-price-text">{0}</div>
              </div>
            </div>
            <div className="col-sm">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">No. of registered umpires</div>
                <div className="reg-payment-price-text">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  publishModalView = () => {
    const { umpireDivisionList, umpireRoundList, onPublish, allCompRoundList } =
      this.props.umpireDashboardState;
    let divisionList = isArrayNotEmpty(umpireDivisionList) ? umpireDivisionList : [];
    let roundList = isArrayNotEmpty(umpireRoundList) ? umpireRoundList : [];
    if (this.state.showPublishModal) {
      return (
        <UmpirePublishModal
          divisionList={divisionList}
          roundList={allCompRoundList}
          onCancel={() => this.setState({ showPublishModal: false })}
          onSave={this.onPublish}
          onPublish={onPublish}
        ></UmpirePublishModal>
      );
    } else {
      return <></>;
    }
  };

  blockDeclineModalView = () => {
    if (this.state.showBlockDeclineModal) {
      const compData = getLiveScoreUmpireCompitionData()
        ? JSON.parse(getLiveScoreUmpireCompitionData())
        : null;
      const { competitionData } = this.props.umpireDashboardState;
      return (
        <BlockDeclineModal
          onCancel={() => this.resetBlockDeclineValueForComps()}
          onSave={this.onSaveBlockDecline}
          competitionName={compData ? compData.name : ''}
        />
      );
    } else {
      return <></>;
    }
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />

        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="1" />

        <Layout>
          {this.headerView()}

          <Content>
            {this.dropdownView()}
            {/* {this.countView()} */}
            {this.contentView()}
            {this.publishModalView()}
            {this.blockDeclineModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireCompetitionListAction,
      getUmpireDashboardVenueList,
      getUmpireDashboardDivisionList,
      getUmpireDashboardList,
      exportFilesAction,
      umpireRoundListAction,
      umpireDashboardUpdate,
      setPageSizeAction,
      setPageNumberAction,
      publishUmpireAllocation,
      saveBlockDeclineAction,
      findSaveUsersData,
      clearBlockDeclineData,
      umpireCompetitionDetailAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireDashboardState: state.UmpireDashboardState,
    umpireCompetitionState: state.UmpireCompetitionState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireDashboard);

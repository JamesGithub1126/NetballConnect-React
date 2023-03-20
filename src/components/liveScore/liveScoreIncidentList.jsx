import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { get, upperCase, omit } from 'lodash';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Button,
  Table,
  Breadcrumb,
  Pagination,
  Input,
  message,
  Menu,
  Modal,
  DatePicker,
  Select,
  InputNumber,
  Checkbox,
  Radio,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import { checkLivScoreCompIsParent } from 'util/permissions';
import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  liveScoreIncidentList,
  createPlayerSuspensionAction,
  updatePlayerSuspensionAction,
  setPageSizeAction,
  setPageNumberAction,
  liveScoreIncidentTypeAction,
  createTribunalAction,
  updateTribunalAction,
} from '../../store/actions/LiveScoreAction/liveScoreIncidentAction';
import {
  getIncidentOffencesListAction,
  getAppealOutcomeListAction,
  getPenaltyTypeListAction,
  getIncidentStatus,
  getSuspensionApplyToAction,
} from '../../store/actions/commonAction/commonAction';
import { liveScoreRoundListAction } from '../../store/actions/LiveScoreAction/liveScoreRoundAction';
import { liveScore_MatchFormate, liveScore_formateDate } from '../../themes/dateformate';
import history from '../../util/history';
import { getLiveScoreCompetition, getUmpireCompetitionData } from '../../util/sessionStorage';
import { isArrayNotEmpty } from '../../util/helpers';
import ValidationConstants from '../../themes/validationConstant';

import { exportFilesAction } from '../../store/actions/appAction';
import { FLAVOUR, SPORT } from '../../util/enums';
import LiveScoreIncidentSuspensionModel from './liveScoreIncidentSuspensionModel';
import { getRoleAction } from '../../store/actions/userAction/userAction';

const { Content } = Layout;
const { SubMenu } = Menu;
const { Option } = Select;
const { TextArea } = Input;

let this_Obj = null;

const TribunalFormSchema = Yup.object().shape({
  offence1: Yup.number().nullable().required('required'),
  hearingDate: Yup.date().nullable().required('required'),
  chargeDate: Yup.date().nullable().required('required'),
  reporter: Yup.string().nullable().required('required'),
});

const listeners = key => ({
  onClick: () => tableSort(key),
});

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  this_Obj.setState({ sortBy, sortOrder });
  const { id } = JSON.parse(getLiveScoreCompetition());
  const { searchText, offset } = this_Obj.state;
  let { liveScoreIncidentPageSize } = this_Obj.props.liveScoreIncidentState;
  liveScoreIncidentPageSize = liveScoreIncidentPageSize || 10;
  this_Obj.props.liveScoreIncidentList(
    id,
    searchText,
    liveScoreIncidentPageSize,
    offset,
    sortBy,
    sortOrder,
    this_Obj.state.liveScoreCompIsParent,
    this_Obj.state.compOrgId,
  );
}

const columns = [
  {
    title: AppConstants.date,
    dataIndex: 'incidentTime',
    key: 'incidentTime',
    sorter: true,
    onHeaderCell: () => listeners('date'),
    render: (incidentTime, record) => {
      const { foulIndex } = record;
      return (
        <NavLink
          to={
            record.incidentTypeId === 8
              ? {
                  pathname: `${process.env.REACT_APP_URL_WEB_USER_REGISTRATION}/refereeReport`,
                  search: [
                    `matchId=${record.matchId}`,
                    `token=${localStorage.token}`,
                    `userId=${localStorage.userId}`,
                    `competitionId=${record.competitionId}`,
                    `incidentId=${record.id}`,
                    foulIndex > 0 ? `foulIndex=${foulIndex}&teamId=${record.teamId}` : null,
                    `linked=true`,
                  ]
                    .filter(param => !!param)
                    .join('&'),
                }
              : {
                  pathname: '/matchDayIncidentView',
                  state: {
                    item: record,
                    screenName: 'incident',
                    umpireKey: this_Obj.props.liveScoreIncidentState.umpireKey,
                  },
                }
          }
          target={record.incidentTypeId === 8 ? '_blank' : '_self'}
        >
          <span className="input-heading-add-another pt-0">
            {liveScore_MatchFormate(incidentTime)}
          </span>
        </NavLink>
      );
    },
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: () => listeners('matchId'),
    render: matchId => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: {
            matchId,
            screenName: 'incident',
            umpireKey: this_Obj.props.liveScoreIncidentState.umpireKey,
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{matchId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.round,
    key: 'roundName',
    render: row => <span>{row.match?.round?.name}</span>,
    sorter: true,
  },
  {
    title: AppConstants.userId,
    key: 'player id',
    render: row => {
      const { incidentPlayers, foulUserId } = row;
      const isIncident = incidentPlayers.length;
      const isFoul = !isIncident;

      if (isFoul) {
        const foulUserIdNumber = foulUserId !== 0 ? foulUserId : null;
        return (
          <span
            onClick={() => this_Obj.checkUserId(row)}
            key={foulUserId}
            className="desc-text-style side-bar-profile-data theme-color pointer"
          >
            {foulUserIdNumber}
          </span>
        );
      }

      if (isIncident) {
        return (
          isArrayNotEmpty(incidentPlayers) &&
          incidentPlayers.map((item, index) => (
            <span
              onClick={() => this_Obj.checkUserId(item)}
              key={`playerId${index}${item.playerId}`}
              className="desc-text-style side-bar-profile-data theme-color pointer"
            >
              {item.playerId}
            </span>
          ))
        );
      }
    },
  },
  {
    title: AppConstants.firstName,
    key: 'Incident Players First Name',
    sorter: true,
    onHeaderCell: () => listeners('firstName'),
    render: row => {
      const { incidentPlayers, foulUserId, foulUser } = row;
      const isIncident = incidentPlayers.length;
      const isFoul = !isIncident;

      const fullName = row.foulUserFullName;
      let firstNameOfFullName;
      if (fullName) {
        firstNameOfFullName = fullName.split(' ')[0] ?? '';
      }

      if (isFoul) {
        const firstName = foulUser ? foulUser?.firstName : firstNameOfFullName;
        return (
          <span
            onClick={() => this_Obj.checkUserId(row)}
            key={`playerFirstName${foulUserId}`}
            className="desc-text-style side-bar-profile-data theme-color pointer"
          >
            {firstName}
          </span>
        );
      }

      if (isIncident) {
        return (
          isArrayNotEmpty(incidentPlayers) &&
          incidentPlayers.map((item, index) => (
            <span
              onClick={() => this_Obj.checkUserId(item)}
              key={`playerFirstName${index}${item.playerId}`}
              className="desc-text-style side-bar-profile-data theme-color pointer"
            >
              {item.player?.firstName}
            </span>
          ))
        );
      }
    },
  },
  {
    title: AppConstants.lastName,
    key: 'Incident Players Last Name',
    sorter: true,
    onHeaderCell: () => listeners('lastName'),
    render: row => {
      const { incidentPlayers, foulUserId, foulUser } = row;
      const isIncident = incidentPlayers.length;
      const isFoul = !isIncident;

      const fullName = row.foulUserFullName;
      let lastNameOfFullName;
      if (fullName) {
        lastNameOfFullName = fullName.split(' ')[1] ?? '';
      }

      if (isFoul) {
        const lastName = foulUser ? foulUser?.lastName : lastNameOfFullName;
        return (
          <span
            onClick={() => this_Obj.checkUserId(row)}
            key={`playerLastName${foulUserId}`}
            className="desc-text-style side-bar-profile-data theme-color pointer"
          >
            {lastName}
          </span>
        );
      }

      if (isIncident) {
        return (
          isArrayNotEmpty(incidentPlayers) &&
          incidentPlayers.map((item, index) => (
            <span
              onClick={() => this_Obj.checkUserId(item)}
              key={`playerLastName${index}${item.playerId}`}
              className="desc-text-style side-bar-profile-data theme-color pointer"
            >
              {item.player?.lastName}
            </span>
          ))
        );
      }
    },
  },
  {
    title: AppConstants.type,
    dataIndex: 'incidentType',
    key: 'incidentType',
    render: incidentType => <span>{incidentType.name}</span>,
    sorter: true,
    onHeaderCell: () => listeners('type'),
  },
  {
    title: AppConstants.suspension,
    dataIndex: 'suspension',
    key: 'suspension',
    render: suspension => {
      let message;
      if (suspension?.suspendedTo) {
        message = `${AppConstants.suspendedTo} ${liveScore_formateDate(suspension.suspendedTo)}`;
      } else if (suspension?.suspendedMatches) {
        message = `${AppConstants.suspendedFor} ${suspension.suspendedMatches} ${AppConstants.matchesSuspended}`;
      } else {
        message = '';
      }
      if (
        process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball ||
        process.env.REACT_APP_FLAVOUR === FLAVOUR.Football
      ) {
        return <span>{message}</span>;
      }
    },
  },
  {
    title: AppConstants.status,
    key: 'status',
    render: row => {
      const incidentStatusId = row.incidentStatusRefId;
      const { incidentStatusList } = this_Obj.props;
      const statusItem = incidentStatusId
        ? incidentStatusList.filter(item => item?.id === incidentStatusId)[0]
        : {};

      return (
        <span
          key={`status${statusItem?.id}`}
          className="desc-text-style side-bar-profile-data theme-color"
        >
          {statusItem?.description}
        </span>
      );
    },
  },
  {
    title: AppConstants.action,
    render: row => {
      const { incidentPlayers, foulUserId } = row;
      return (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <SubMenu
            key="sub1"
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
            {(process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball ||
              process.env.REACT_APP_FLAVOUR === FLAVOUR.Football) && (
              <>
                <Menu.Item key="1" onClick={() => this_Obj.openSuspensionDialog(row)}>
                  <span>Suspension</span>
                </Menu.Item>
                <Menu.Item key="2" onClick={() => this_Obj.openTribunalDialog(row)}>
                  <span>Tribunal</span>
                </Menu.Item>
              </>
            )}
          </SubMenu>
        </Menu>
      );
    },
  },
];

class LiveScoreIncidentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      offset: 0,
      limit: 10,
      sortBy: null,
      sortOrder: null,
      screenName: get(props, 'location.state.screenName', null),
      competitionId: null,
      compOrgId: null,
      liveScoreCompIsParent: false,
      isSuspensionModelShow: false,
      activeIncident: null,
      selectedRound: '-1',
      incidentType: '-1',
      incidentStatusRefId: '-1',
      suspendedMatches: null,
      isTribunalModalVisible: false,
      tribunalInitialValues: {},
      addIncidentModalVisible: false,
      tribunalPenaltyTypeId: null,
      suspendedRoleId: null,
    };
    this_Obj = this;
    this.columns =
      process.env.REACT_APP_FLAVOUR === FLAVOUR.Netball
        ? columns.filter(col => col.dataIndex !== 'suspension')
        : columns;
  }

  componentDidMount() {
    const { incidentListActionObject, umpireKey } = this.props.liveScoreIncidentState;
    let { sortBy } = this.state;
    let { sortOrder } = this.state;
    const { selectedRound, incidentType } = this.state;
    const {
      getIncidentOffencesListAction,
      getAppealOutcomeListAction,
      getPenaltyTypeListAction,
      getSuspensionApplyToAction,
      getIncidentStatus,
      getRoleAction,
    } = this.props;

    getRoleAction();
    getIncidentOffencesListAction();
    getAppealOutcomeListAction();
    getPenaltyTypeListAction();
    getSuspensionApplyToAction();
    getIncidentStatus();
    if (umpireKey) {
      if (getUmpireCompetitionData()) {
        const liveScoreCompIsParent = checkLivScoreCompIsParent();
        const { id, competitionOrganisation } = JSON.parse(getUmpireCompetitionData());
        const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
        this.setState({ compOrgId, liveScoreCompIsParent });
        let { liveScoreIncidentPageSize } = this.props.liveScoreIncidentState;
        liveScoreIncidentPageSize = liveScoreIncidentPageSize || 10;
        if (incidentListActionObject) {
          const { offset } = incidentListActionObject;
          const searchText = incidentListActionObject.search;
          sortBy = incidentListActionObject.sortBy;
          sortOrder = incidentListActionObject.sortOrder;
          this.setState({
            sortBy,
            sortOrder,
            offset,
            searchText,
          });
          this.props.liveScoreIncidentList(
            id,
            searchText,
            liveScoreIncidentPageSize,
            offset,
            sortBy,
            sortOrder,
            liveScoreCompIsParent,
            compOrgId,
            selectedRound,
            incidentType,
          );
        } else {
          const { searchText, offset, sortBy, sortOrder } = this.state;
          this.props.liveScoreIncidentList(
            id,
            searchText,
            liveScoreIncidentPageSize,
            offset,
            sortBy,
            sortOrder,
            liveScoreCompIsParent,
            compOrgId,
            selectedRound,
            incidentType,
          );
        }
      } else {
        history.push('/umpireDashboard');
      }
    } else if (getLiveScoreCompetition()) {
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      this.props.liveScoreRoundListAction(id);
      const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      const { liveScoreIncidentPageSize = 10 } = this.props.liveScoreIncidentState;

      this.setState({ competitionId: id, liveScoreCompIsParent, compOrgId });

      if (incidentListActionObject) {
        const { offset } = incidentListActionObject;
        const searchText = incidentListActionObject.search;
        sortBy = incidentListActionObject.sortBy;
        sortOrder = incidentListActionObject.sortOrder;
        this.setState({
          sortBy,
          sortOrder,
          offset,
          searchText,
        });
        this.props.liveScoreIncidentList(
          id,
          searchText,
          liveScoreIncidentPageSize,
          offset,
          sortBy,
          sortOrder,
          liveScoreCompIsParent,
          compOrgId,
          selectedRound,
          incidentType,
        );
      } else {
        const { searchText, offset, sortBy, sortOrder } = this.state;
        this.props.liveScoreIncidentList(
          id,
          searchText,
          liveScoreIncidentPageSize,
          offset,
          sortBy,
          sortOrder,
          liveScoreCompIsParent,
          compOrgId,
          selectedRound,
          incidentType,
        );
      }
      this.props.liveScoreIncidentTypeAction(SPORT[process.env.REACT_APP_FLAVOUR]);
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.clearActiveIncident(prevState);
  }

  clearActiveIncident = prevState => {
    const { isSuspensionModelShow, isTribunalModalVisible } = this.state;
    const isPropChanged = prevState.isSuspensionModelShow !== isSuspensionModelShow;
    const isTribunalModalVisibleChanged =
      prevState.isTribunalModalVisible !== isTribunalModalVisible;

    if (isPropChanged && !isSuspensionModelShow) {
      this.setState({
        activeIncident: null,
        suspendedRoleId: null,
      });
    }

    if (isTribunalModalVisibleChanged && !isTribunalModalVisible) {
      this.setState({
        activeIncident: null,
        tribunalInitialValues: {},
      });
    }
  };

  onExport = () => {
    let url = null;
    if (this.state.liveScoreCompIsParent) {
      url = `${AppConstants.incidentExport + this.state.competitionId}&entityTypeId=1&search=`;
    } else {
      url = `${AppConstants.incidentExport + this.state.compOrgId}&entityTypeId=6&search=`;
    }
    this.props.exportFilesAction(url);
  };

  checkUserId = record => {
    if (!record.foulUser && !record.player) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.personMessage);
    } else {
      history.push('/userPersonal', {
        userId: record.player ? record.player.userId : record.foulUser.id,
        screenKey: 'livescore',
        screen: '/matchDayIncidentList',
      });
    }
  };

  // on change search text
  onChangeSearchText = e => {
    const { umpireKey, liveScoreIncidentPageSize = 10 } = this.props.liveScoreIncidentState;
    const { sortBy, sortOrder, selectedRound, incidentType } = this.state;

    let compId = null;
    if (umpireKey) {
      const { id } = JSON.parse(getUmpireCompetitionData());
      compId = id;
    } else {
      const { id } = JSON.parse(getLiveScoreCompetition());
      compId = id;
    }

    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      this.props.liveScoreIncidentList(
        compId,
        e.target.value,
        liveScoreIncidentPageSize,
        0,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        selectedRound,
        incidentType,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    const { umpireKey } = this.props.liveScoreIncidentState;
    let compId = null;
    if (umpireKey) {
      const { id } = JSON.parse(getUmpireCompetitionData());
      compId = id;
    } else {
      const { id } = JSON.parse(getLiveScoreCompetition());
      compId = id;
    }

    this.setState({ offset: 0 });
    const code = e.keyCode || e.which;
    const { sortBy, sortOrder, selectedRound, incidentType } = this.state;
    let { liveScoreIncidentPageSize } = this.props.liveScoreIncidentState;
    liveScoreIncidentPageSize = liveScoreIncidentPageSize || 10;
    if (code === 13) {
      // 13 is the enter keycode
      this.props.liveScoreIncidentList(
        compId,
        e.target.value,
        liveScoreIncidentPageSize,
        0,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        selectedRound,
        incidentType,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    const { umpireKey, liveScoreIncidentPageSize = 10 } = this.props.liveScoreIncidentState;
    let compId = null;
    if (umpireKey) {
      const { id } = JSON.parse(getUmpireCompetitionData());
      compId = id;
    } else {
      const { id } = JSON.parse(getLiveScoreCompetition());
      compId = id;
    }

    const { searchText, sortBy, sortOrder, selectedRound, incidentType } = this.state;

    if (searchText) {
      this.props.liveScoreIncidentList(
        compId,
        searchText,
        liveScoreIncidentPageSize,
        0,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
        selectedRound,
        incidentType,
      );
    }
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handleTableChange = async page => {
    await this.props.setPageNumberAction(page);
    let { liveScoreIncidentPageSize } = this.props.liveScoreIncidentState;
    liveScoreIncidentPageSize = liveScoreIncidentPageSize || 10;
    const offset = page ? liveScoreIncidentPageSize * (page - 1) : 0;
    const { searchText, sortBy, sortOrder, selectedRound, incidentType } = this.state;
    this.setState({ offset });
    const { umpireKey } = this.props.liveScoreIncidentState;
    let compId = null;
    if (umpireKey) {
      const { id } = JSON.parse(getUmpireCompetitionData());
      compId = id;
    } else {
      const { id } = JSON.parse(getLiveScoreCompetition());
      compId = id;
    }
    this.props.liveScoreIncidentList(
      compId,
      searchText,
      liveScoreIncidentPageSize,
      offset,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
      selectedRound,
      incidentType,
    );
  };

  handleShowAddIncidentModal = () => {
    this.setState({ addIncidentModalVisible: true });
  };
  handleOkOnShowAddIncidentModal = () => {
    this.setState({ addIncidentModalVisible: false });
  };

  headerView = () => (
    <div className="comp-player-grades-header-drop-down-view mt-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.incidents}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="col-sm-8 d-flex justify-content-end w-100 flex-row align-items-center">
          <div className="row">
            <div className="col-sm">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button
                  className="primary-add-comp-form"
                  type="primary"
                  onClick={this.handleShowAddIncidentModal}
                >
                  + {AppConstants.addIncident}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button
                  className="primary-add-comp-form"
                  type="primary"
                  onClick={() => this.onExport()}
                >
                  <div className="row">
                    <div className="col-sm">
                      <img src={AppImages.export} alt="" className="export-image" />
                      {AppConstants.export}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <NavLink to="/matchDayIncidentImport">
                  <Button className="primary-add-comp-form" type="primary">
                    <div className="row">
                      <div className="col-sm">
                        <img src={AppImages.import} alt="" className="export-image" />
                        {AppConstants.import}
                      </div>
                    </div>
                  </Button>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* search box */}
      <div className="col-sm pt-4 ml-3 d-flex justify-content-end">
        <div className="comp-product-search-inp-width">
          <Input
            className="product-reg-search-input"
            onChange={this.onChangeSearchText}
            placeholder="Search..."
            onKeyPress={this.onKeyEnterSearchText}
            value={this.state.searchText}
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
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.addIncident}
        visible={this.state.addIncidentModalVisible}
        onCancel={this.handleOkOnShowAddIncidentModal}
        footer={[
          <Button onClick={this.handleOkOnShowAddIncidentModal} type="primary">
            {AppConstants.ok}
          </Button>,
        ]}
      >
        <p>{AppConstants.addIncidentModalText}</p>
      </Modal>
    </div>
  );

  /// /////tableView view for Umpire list
  tableView = () => {
    const {
      onLoadIncidentList,
      liveScoreIncidentResult,
      liveScoreIncidentTotalCount,
      liveScoreIncidentCurrentPage,
      liveScoreIncidentPageSize,
    } = this.props.liveScoreIncidentState;

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoadIncidentList}
            className="home-dashboard-table"
            columns={this.columns}
            dataSource={liveScoreIncidentResult}
            pagination={false}
            rowKey={record => `incident${record.id}`}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end" />
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={liveScoreIncidentCurrentPage}
              defaultCurrent={liveScoreIncidentCurrentPage}
              defaultPageSize={liveScoreIncidentPageSize}
              total={liveScoreIncidentTotalCount}
              onChange={this.handleTableChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  suspensionModalView = () => {
    if (!this.state.activeIncident) {
      return <></>;
    }
    return (
      <LiveScoreIncidentSuspensionModel
        visible={!!this.state.isSuspensionModelShow}
        activeIncident={this.state.activeIncident}
        onCancel={() => this.toggleSuspensionDialog()}
      />
    );
  };

  openSuspensionDialog = activeRow => {
    const roleList = activeRow.incidentPlayers;
    const foulUser = activeRow.foulUser;
    if (!roleList.length && !foulUser) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.suspensionMessage);
      return;
    }
    this.setState({ activeIncident: activeRow });
    this.toggleSuspensionDialog();
  };

  toggleSuspensionDialog = () => {
    this.setState(state => ({
      isSuspensionModelShow: !state.isSuspensionModelShow,
    }));
  };

  tribunalModalView = () => {
    const { incidentOffencesTypeList, penaltyTypeList, appealOutcomeList } = this.props;
    const { tribunalInitialValues, tribunalPenaltyTypeId } = this.state;
    const penalty2TypeList = penaltyTypeList.filter(item => item.id !== tribunalPenaltyTypeId);

    return (
      <Modal
        title={AppConstants.tribunal}
        visible={!!this.state.isTribunalModalVisible}
        onCancel={this.toggleTribunalDialog}
        centered
        footer={null}
      >
        <Formik
          initialValues={tribunalInitialValues}
          onSubmit={this.submitTribunalDialog}
          validationSchema={TribunalFormSchema}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <div className="text-heading-large">{AppConstants.tribunalIncidentDetails}</div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead
                    required="required-field"
                    heading={`${AppConstants.tribunalChargeOffence} 1`}
                  />
                  <Select
                    name="offence1"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectChargeOffence}
                    onChange={val => setFieldValue('offence1', val)}
                    onBlur={handleBlur}
                    value={values.offence1}
                  >
                    {incidentOffencesTypeList.map(item => (
                      <Option key={`offence1Type_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                  {errors.offence1 && touched.offence1 && (
                    <span className="form-err">{errors.offence1}</span>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={`${AppConstants.tribunalChargeOffence} 2`} />
                  <Select
                    name="offence2"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectChargeOffence}
                    onChange={val => setFieldValue('offence2', val)}
                    onBlur={handleBlur}
                    value={values.offence2}
                    allowClear
                  >
                    {incidentOffencesTypeList.map(item => (
                      <Option key={`offenceType2_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={`${AppConstants.tribunalChargeOffence} 3`} />
                  <Select
                    name="offence3"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectChargeOffence}
                    onChange={val => setFieldValue('offence3', val)}
                    onBlur={handleBlur}
                    value={values.offence3}
                    allowClear
                  >
                    {incidentOffencesTypeList.map(item => (
                      <Option key={`offenceType3_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.tribunalChargeDate}
                  />
                  <DatePicker
                    name="chargeDate"
                    className="w-100"
                    size="default"
                    format="DD-MM-YYYY"
                    showTime={false}
                    placeholder="dd-mm-yyyy"
                    onChange={val => setFieldValue('chargeDate', val)}
                    value={values.chargeDate}
                  />
                  {errors.chargeDate && touched.chargeDate && (
                    <span className="form-err">{errors.chargeDate}</span>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalChargeOffenceOther} />
                  <Input
                    name="chargeOffenceOther"
                    className="w-100"
                    onChange={handleChange}
                    value={values.chargeOffenceOther}
                    allowClear
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalChargeGrading} />
                  <Input
                    name="chargeGrading"
                    className="w-100"
                    onChange={handleChange}
                    value={values.chargeGrading}
                    allowClear
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalWitness} />
                  <Input
                    name="witness"
                    className="w-100"
                    onChange={handleChange}
                    value={values.witness}
                    allowClear
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.tribunalReporter}
                  />
                  <Input
                    name="reporter"
                    className="w-100"
                    onChange={handleChange}
                    value={values.reporter}
                  />
                  {errors.reporter && touched.reporter && (
                    <span className="form-err">{errors.reporter}</span>
                  )}
                </div>
              </div>
              <div className="text-heading-large pt-5">{AppConstants.tribunalHearingDetails}</div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.tribunalHearingDateTime}
                  />
                  <DatePicker
                    name="hearingDate"
                    className="w-100"
                    size="default"
                    format="DD-MM-YYYY HH:mm"
                    placeholder="dd-mm-yyyy hh:mm"
                    onChange={val => setFieldValue('hearingDate', val)}
                    value={values.hearingDate}
                    allowClear
                    showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
                  />
                </div>
              </div>
              <div className="text-heading-large pt-5">{AppConstants.tribunalOutcomeDetails}</div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalPenaltyType} />
                  <Select
                    name="penaltyTypeRefId"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectPenaltyType}
                    onChange={val => {
                      this.setState({ tribunalPenaltyTypeId: val });
                      setFieldValue('penaltyTypeRefId', val);
                      values.penalty2TypeRefId &&
                        val === 1 &&
                        setFieldValue('penalty2TypeRefId', 2);
                      values.penalty2TypeRefId &&
                        val === 2 &&
                        setFieldValue('penalty2TypeRefId', 1);
                    }}
                    onBlur={handleBlur}
                    value={values.penaltyTypeRefId}
                    allowClear
                  >
                    {penaltyTypeList.map(item => (
                      <Option key={`penaltyType_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {values.penaltyTypeRefId === 2 && (
                <div className="row">
                  <div className="col-sm">
                    <InputWithHead heading={AppConstants.tribunalPenaltyUnits} />
                    <Input
                      name="penaltyUnits"
                      className="w-100"
                      onChange={handleChange}
                      value={values.penaltyUnits}
                      allowClear
                    />
                  </div>
                </div>
              )}
              {values.penaltyTypeRefId === 1 && (
                <>
                  <div className="row">
                    <div className="col-sm">
                      <InputWithHead heading={AppConstants.tribunalPenaltyStartDate} />
                      <DatePicker
                        name="penaltyStartDate"
                        className="w-100"
                        size="default"
                        format="DD-MM-YYYY"
                        showTime={false}
                        placeholder="dd-mm-yyyy"
                        onChange={val => setFieldValue('penaltyStartDate', val)}
                        value={values.penaltyStartDate}
                        allowClear
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm">
                      <InputWithHead heading={AppConstants.tribunalPenaltyExpiryDate} />
                      <DatePicker
                        name="penaltyExpiryDate"
                        className="w-100"
                        size="default"
                        format="DD-MM-YYYY"
                        showTime={false}
                        placeholder="dd-mm-yyyy"
                        onChange={val => setFieldValue('penaltyExpiryDate', val)}
                        value={values.penaltyExpiryDate}
                        allowClear
                      />
                    </div>
                  </div>
                </>
              )}
              {!values.penalty2TypeRefId && values.penaltyTypeRefId && (
                <>
                  <div className="row">
                    <a className="col-sm pt-2">
                      <a
                        onClick={val => {
                          values.penaltyTypeRefId === 1 && setFieldValue('penalty2TypeRefId', 2);
                          values.penaltyTypeRefId === 2 && setFieldValue('penalty2TypeRefId', 1);
                        }}
                      >
                        + Penalty
                      </a>
                    </a>
                  </div>
                </>
              )}
              {values.penalty2TypeRefId && (
                <>
                  {values.penaltyTypeRefId && (
                    <>
                      <div className="row">
                        <div className="col-sm">
                          <InputWithHead heading={AppConstants.tribunalPenalty2Type} />
                          <Select
                            name="penalty2TypeRefId"
                            className="w-100"
                            placeholder={AppConstants.tribunalSelectPenalty2Type}
                            onChange={val => setFieldValue('penalty2TypeRefId', val)}
                            onBlur={handleBlur}
                            value={values.penalty2TypeRefId}
                            allowClear
                            disabled={true}
                          >
                            {penalty2TypeList.map(item => (
                              <Option key={`suspendedPenaltyType_${item.id}`} value={item.id}>
                                {item.description}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      {values.penalty2TypeRefId === 2 && (
                        <div className="row">
                          <div className="col-sm">
                            <InputWithHead heading={AppConstants.tribunalPenalty2Units} />
                            <Input
                              name="penalty2Units"
                              className="w-100"
                              onChange={handleChange}
                              value={values.penalty2Units}
                              allowClear
                            />
                          </div>
                        </div>
                      )}
                      {values.penalty2TypeRefId === 1 && (
                        <>
                          <div className="row">
                            <div className="col-sm">
                              <InputWithHead heading={AppConstants.tribunalPenalty2StartDate} />
                              <DatePicker
                                name="penalty2StartDate"
                                className="w-100"
                                size="default"
                                format="DD-MM-YYYY"
                                showTime={false}
                                placeholder="dd-mm-yyyy"
                                onChange={val => setFieldValue('penalty2StartDate', val)}
                                value={values.penalty2StartDate}
                                allowClear
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm">
                              <InputWithHead heading={AppConstants.tribunalPenalty2ExpiryDate} />
                              <DatePicker
                                name="penalty2ExpiryDate"
                                className="w-100"
                                size="default"
                                format="DD-MM-YYYY"
                                showTime={false}
                                placeholder="dd-mm-yyyy"
                                onChange={val => setFieldValue('penalty2ExpiryDate', val)}
                                value={values.penalty2ExpiryDate}
                                allowClear
                              />
                            </div>
                          </div>
                        </>
                      )}
                      <div className="row">
                        <a className="col-sm pt-2">
                          <a onClick={() => setFieldValue('penalty2TypeRefId', null)}>- Penalty</a>
                        </a>
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyType} />
                  <Select
                    name="suspendedPenaltyTypeRefId"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectSuspendedPenaltyType}
                    onChange={val => setFieldValue('suspendedPenaltyTypeRefId', val)}
                    onBlur={handleBlur}
                    value={values.suspendedPenaltyTypeRefId}
                    allowClear
                  >
                    {penaltyTypeList.map(item => (
                      <Option key={`suspendedPenaltyType_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {values.suspendedPenaltyTypeRefId === 2 && (
                <div className="row">
                  <div className="col-sm">
                    <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyUnits} />
                    <Input
                      name="suspendedPenaltyUnits"
                      className="w-100"
                      onChange={handleChange}
                      value={values.suspendedPenaltyUnits}
                      allowClear
                    />
                  </div>
                </div>
              )}
              {values.suspendedPenaltyTypeRefId === 1 && (
                <div className="row">
                  <div className="col-sm">
                    <InputWithHead heading={AppConstants.tribunalSuspendedPenaltyExpiryDate} />
                    <DatePicker
                      name="suspendedPenaltyExpiryDate"
                      className="w-100"
                      size="default"
                      format="DD-MM-YYYY"
                      showTime={false}
                      placeholder="dd-mm-yyyy"
                      onChange={val => setFieldValue('suspendedPenaltyExpiryDate', val)}
                      value={values.suspendedPenaltyExpiryDate}
                      allowClear
                    />
                  </div>
                </div>
              )}

              <div className="text-heading-large pt-5">{AppConstants.tribunalAppealDetails}</div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalAppealed} />
                  <Checkbox name="appealed" onChange={handleChange} checked={values.appealed} />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalAppealOutcome} />
                  <Select
                    name="appealOutcomeRefId"
                    className="w-100"
                    placeholder={AppConstants.tribunalSelectAppealOutcome}
                    onChange={val => setFieldValue('appealOutcomeRefId', val)}
                    onBlur={handleBlur}
                    value={values.appealOutcomeRefId}
                    allowClear
                  >
                    {appealOutcomeList.map(item => (
                      <Option key={`appealOutcome_${item.id}`} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalAppealDate} />
                  <DatePicker
                    name="appealDate"
                    className="w-100"
                    size="default"
                    format="DD-MM-YYYY"
                    showTime={false}
                    placeholder="dd-mm-yyyy"
                    onChange={val => setFieldValue('appealDate', val)}
                    value={values.appealDate}
                    allowClear
                  />
                </div>
              </div>
              <div className="text-heading-large pt-5">{AppConstants.tribunalOther}</div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalAllowPublicView} />
                  <Checkbox
                    name="allowPublicView"
                    onChange={handleChange}
                    checked={values.allowPublicView}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.tribunalNotes} />
                  <TextArea
                    name="notes"
                    allowClear
                    onChange={handleChange}
                    value={values.notes}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div
                className="comp-dashboard-botton-view-mobile d-flex justify-content-between"
                style={{ paddingTop: 24 }}
              >
                <Button onClick={this.toggleTribunalDialog} type="cancel-button">
                  {AppConstants.cancel}
                </Button>
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  {AppConstants.confirm}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  };

  openTribunalDialog = activeRow => {
    const { tribunal } = activeRow;
    const roleList = activeRow.incidentPlayers;
    const foulUser = activeRow.foulUser;

    if (!roleList.length && !foulUser) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.tribunalMessage);
      return;
    }

    const tribunalInitialValues = {
      offence1: tribunal ? tribunal.offences?.[0]?.id || null : activeRow.offences?.[0]?.id || null,
      offence2: tribunal ? tribunal.offences?.[1]?.id || null : activeRow.offences?.[1]?.id || null,
      offence3: tribunal ? tribunal.offences?.[2]?.id || null : activeRow.offences?.[2]?.id || null,
      chargeDate: tribunal?.chargeDate ? moment(activeRow.tribunal.chargeDate) : null,
      chargeOffenceOther: tribunal?.chargeOffenceOther ?? null,
      chargeGrading: tribunal?.chargeGrading ?? null,
      witness: tribunal?.witness ?? null,
      reporter: tribunal?.reporter ?? null,
      hearingDate: tribunal?.hearingDate ? moment(activeRow.tribunal.hearingDate) : null,
      penaltyUnits: tribunal?.penaltyUnits ?? null,
      penaltyTypeRefId: tribunal?.penaltyTypeRefId ?? null,
      penaltyStartDate: tribunal?.penaltyStartDate
        ? moment(activeRow.tribunal.penaltyStartDate)
        : null,
      penaltyExpiryDate: tribunal?.penaltyExpiryDate
        ? moment(activeRow.tribunal.penaltyExpiryDate)
        : null,
      penalty2TypeRefId: tribunal?.penalty2TypeRefId ?? null, //
      penalty2Units: tribunal?.penalty2Units ?? null, //
      penalty2StartDate: tribunal?.penalty2StartDate
        ? moment(activeRow.tribunal.penalty2StartDate)
        : null,
      penalty2ExpiryDate: tribunal?.penalty2ExpiryDate
        ? moment(activeRow.tribunal.penalty2ExpiryDate)
        : null,
      suspendedPenaltyTypeRefId: tribunal?.suspendedPenaltyTypeRefId ?? null, //
      suspendedPenaltyUnits: tribunal?.suspendedPenaltyUnits ?? null, //
      suspendedPenaltyExpiryDate: tribunal?.suspendedPenaltyExpiryDate
        ? moment(activeRow.tribunal.suspendedPenaltyExpiryDate)
        : null,
      appealed: tribunal?.appealed ?? false,
      appealOutcomeRefId: tribunal?.appealOutcomeRefId ?? null,
      appealDate: tribunal?.appealDate ? moment(activeRow.tribunal.appealDate) : null,
      allowPublicView: tribunal?.allowPublicView ?? false,
      notes: tribunal?.notes ?? null,
    };

    this.setState({
      activeIncident: activeRow,
      tribunalInitialValues,
    });
    this.toggleTribunalDialog();
  };

  toggleTribunalDialog = () => {
    this.setState(state => ({
      isTribunalModalVisible: !state.isTribunalModalVisible,
    }));
  };

  submitTribunalDialog = values => {
    const { incidentOffencesTypeList } = this.props;
    const { incidentPlayers, id: incidentId, tribunal, foulUserId } = this.state.activeIncident;
    const player = incidentPlayers[0];

    if (!player?.player?.userId && !foulUserId) {
      return;
    }

    const {
      offence1,
      offence2,
      offence3,
      chargeDate,
      hearingDate,
      penaltyStartDate,
      penaltyExpiryDate,
      penalty2StartDate,
      penalty2ExpiryDate,
      appealDate,
      penaltyUnits,
      penalty2Units,
      penaltyTypeRefId,
      penalty2TypeRefId,
      suspendedPenaltyTypeRefId,
      suspendedPenaltyExpiryDate,
      appealOutcomeRefId,
    } = values;

    const offences = [
      incidentOffencesTypeList.find(offence => offence.id === offence1),
      incidentOffencesTypeList.find(offence => offence.id === offence2),
      incidentOffencesTypeList.find(offence => offence.id === offence3),
    ];

    const dataToAction = {
      incidentId,
      body: {
        incidentId,
        userId: player ? player.player.userId : foulUserId,
        offences: offences.filter(offence => Boolean(offence)),
        chargeDate: chargeDate ? moment(chargeDate).format('YYYY-MM-DD') : null,
        hearingDate: hearingDate ? moment(hearingDate).toISOString() : null,
        penaltyStartDate: penaltyStartDate ? moment(penaltyStartDate).format('YYYY-MM-DD') : null,
        penaltyExpiryDate: penaltyExpiryDate
          ? moment(penaltyExpiryDate).format('YYYY-MM-DD')
          : null,
        penalty2StartDate:
          penalty2TypeRefId && penalty2StartDate
            ? moment(penalty2StartDate).format('YYYY-MM-DD')
            : null,
        penalty2ExpiryDate:
          penalty2TypeRefId && penalty2ExpiryDate
            ? moment(penalty2ExpiryDate).format('YYYY-MM-DD')
            : null,
        appealDate: appealDate ? moment(appealDate).format('YYYY-MM-DD') : null,
        penaltyUnits: penaltyUnits || null,
        penalty2Units: penalty2TypeRefId ? penalty2Units : null,
        penaltyTypeRefId: penaltyTypeRefId || null,
        penalty2TypeRefId: penalty2TypeRefId || null,
        suspendedPenaltyTypeRefId: suspendedPenaltyTypeRefId || null,
        suspendedPenaltyExpiryDate: suspendedPenaltyExpiryDate
          ? moment(suspendedPenaltyExpiryDate).format('YYYY-MM-DD')
          : null,
        appealOutcomeRefId: appealOutcomeRefId || null,
        ...omit(values, [
          'offence1',
          'offence2',
          'offence3',
          'chargeDate',
          'penaltyStartDate',
          'penaltyExpiryDate',
          'penalty2StartDate',
          'penalty2ExpiryDate',
          'suspendedPenaltyExpiryDate',
          'appealDate',
          'hearingDate',
        ]),
      },
    };

    if (tribunal) {
      this.props.updateTribunalAction(tribunal.id, dataToAction);
    } else {
      this.props.createTribunalAction(dataToAction);
    }
    this.toggleTribunalDialog();
  };

  onChangeDropDownValue = async (value, key) => {
    const { id, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
    const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
    let { incidentListActionObject, liveScoreIncidentPageSize } = this.props.liveScoreIncidentState;
    liveScoreIncidentPageSize = liveScoreIncidentPageSize ? liveScoreIncidentPageSize : 10;
    const { offset } = incidentListActionObject;
    const searchText = incidentListActionObject.search;
    await this.setState({
      sortBy: incidentListActionObject.sortBy,
      sortOrder: incidentListActionObject.sortOrder,
      offset,
      searchText,
      [key]: value,
    });
    const { sortBy, sortOrder, selectedRound, incidentType, incidentStatusRefId } = this.state;
    this.props.liveScoreIncidentList(
      id,
      searchText,
      liveScoreIncidentPageSize,
      offset,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      compOrgId,
      selectedRound,
      incidentType,
      incidentStatusRefId,
    );
  };

  dropdownView = () => {
    let { roundList } = this.props.liveScoreMatchListState;
    const { incidentTypeResult } = this.props.liveScoreIncidentState;
    let roundListArr = isArrayNotEmpty(roundList) ? roundList : [];
    const { incidentStatusList } = this.props;

    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.round}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={roundId => this.onChangeDropDownValue(roundId, 'selectedRound')}
                value={this.state.selectedRound}
              >
                <Option key="-1" value="-1">
                  {AppConstants.all}
                </Option>
                {roundListArr.map(item => (
                  <Option key={'round_' + item.name} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.type}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={typeId => this.onChangeDropDownValue(typeId, 'incidentType')}
                value={this.state.incidentType}
              >
                <Option key="-1" value="-1">
                  {AppConstants.all}
                </Option>
                {incidentTypeResult.map(item => (
                  <Option key={'incidentType_' + item.name} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-sm">
            <div className="reg-filter-col-cont pb-3">
              <span className="year-select-heading">{AppConstants.status}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 160 }}
                onChange={status => this.onChangeDropDownValue(status, 'incidentStatusRefId')}
                value={this.state.incidentStatusRefId}
              >
                <Option key="-1" value="-1">
                  {AppConstants.all}
                </Option>
                {incidentStatusList.map(item => (
                  <Option key={'status_' + item.id} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { liveScoreIncidentState, location } = this.props;
    const { umpireKey } = liveScoreIncidentState;
    const screen = get(location, 'state.screenName', null);

    return (
      <div className="fluid-width default-bg">
        {umpireKey ? (
          <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}

        {umpireKey ? (
          <InnerHorizontalMenu
            menu="umpire"
            umpireSelectedKey={screen == 'umpireList' ? '2' : '1'}
          />
        ) : (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="17" />
        )}

        <Layout>
          {this.headerView()}
          {this.dropdownView()}
          <Content>
            {this.tableView()}
            {this.suspensionModalView()}
            {this.tribunalModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreIncidentList,
      exportFilesAction,
      createPlayerSuspensionAction,
      updatePlayerSuspensionAction,
      setPageSizeAction,
      setPageNumberAction,
      liveScoreIncidentTypeAction,
      liveScoreRoundListAction,
      getIncidentOffencesListAction,
      createTribunalAction,
      updateTribunalAction,
      getAppealOutcomeListAction,
      getPenaltyTypeListAction,
      getSuspensionApplyToAction,
      getIncidentStatus,
      getRoleAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreIncidentState: state.LiveScoreIncidentState,
    liveScoreMatchListState: state.LiveScoreMatchState,
    incidentOffencesTypeList: state.CommonReducerState.incidentOffencesTypeList,
    penaltyTypeList: state.CommonReducerState.penaltyTypeList,
    appealOutcomeList: state.CommonReducerState.appealOutcomeList,
    incidentStatusList: state.CommonReducerState.incidentStatus,
    suspensionApplyToList: state.CommonReducerState.suspensionApplyToList,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreIncidentList);

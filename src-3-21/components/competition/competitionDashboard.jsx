import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Table, Select, Tag, Modal, Menu, Radio } from 'antd';
import Tooltip from 'react-png-tooltip';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import AppUniqueId from 'themes/appUniqueId';
import { isArrayNotEmpty } from 'util/helpers';
import history from 'util/history';
import { checkRegistrationType, getCurrentYear } from 'util/permissions';
import {
  getPrevUrl,
  setOwn_competition,
  clearCompetitionStorage,
  setGlobalYear,
  getGlobalYear,
} from 'util/sessionStorage';
import { getOnlyYearListAction, CLEAR_OWN_COMPETITION_DATA } from 'store/actions/appAction';
import {
  competitionDashboardAction,
  updateCompetitionStatus,
  deleteCompetitionAction,
  archiveCompetitionAction,
} from 'store/actions/competitionModuleAction/competitionDashboardAction';
import { clearCompReducerDataAction } from 'store/actions/registrationAction/competitionFeeAction';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const { SubMenu } = Menu;
let this_Obj = null;

function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: (a, b) => tableSort(a, b, 'competitionName'),
  },
  {
    title: AppConstants.divisions,
    dataIndex: 'divisions',
    key: 'divisions',
    render: divisions => {
      let divisionList = isArrayNotEmpty(divisions) ? divisions : [];
      return (
        <span>
          {divisionList.map(item => (
            <Tag className="comp-dashboard-table-tag" color={item.color} key={item.id}>
              {item.divisionName}
            </Tag>
          ))}
        </span>
      );
    },
    sorter: (a, b) => tableSort(a, b, 'divisions'),
  },
  {
    title: AppConstants.teams,
    dataIndex: 'teamCount',
    key: 'teamCount',
    sorter: (a, b) => tableSort(a, b, 'teamCount'),
    render: teamCount => <span>{teamCount == null || teamCount === '' ? 'N/A' : teamCount}</span>,
  },
  {
    title: AppConstants.players,
    dataIndex: 'playersCount',
    key: 'playersCount',
    sorter: (a, b) => tableSort(a, b, 'playersCount'),
    render: playersCount => (
      <span>{playersCount == null || playersCount === '' ? 'N/A' : playersCount}</span>
    ),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusName',
    key: 'statusName',
    sorter: (a, b) => tableSort(a, b, 'statusName'),
  },
];

const columnsOwned = [
  {
    title: AppConstants.name,
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: (a, b) => tableSort(a, b, 'competitionName'),
  },
  {
    title: AppConstants.divisions,
    dataIndex: 'divisions',
    key: 'divisions',
    render: divisions => {
      let divisionList = isArrayNotEmpty(divisions) ? divisions : [];
      return (
        <span>
          {divisionList.map(item => (
            <Tag className="comp-dashboard-table-tag" color={item.color} key={item.id}>
              {item.divisionName}
            </Tag>
          ))}
        </span>
      );
    },
    sorter: (a, b) => tableSort(a, b, 'divisions'),
  },
  {
    title: AppConstants.teams,
    dataIndex: 'teamCount',
    key: 'teamCount',
    sorter: (a, b) => tableSort(a, b, 'teamCount'),
    render: teamCount => <span>{teamCount == null || teamCount === '' ? 'N/A' : teamCount}</span>,
  },
  {
    title: AppConstants.players,
    dataIndex: 'playersCount',
    key: 'playersCount',
    sorter: (a, b) => tableSort(a, b, 'playersCount'),
    render: playersCount => (
      <span>{playersCount == null || playersCount === '' ? 'N/A' : playersCount}</span>
    ),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusName',
    key: 'statusName',
    sorter: (a, b) => tableSort(a, b, 'statusName'),
  },
  {
    title: AppConstants.registrationType,
    dataIndex: 'invitees',
    key: 'invitees',
    render: invitees => {
      let inviteesRegType = isArrayNotEmpty(invitees) ? invitees : [];
      let registrationInviteesRefId = isArrayNotEmpty(inviteesRegType)
        ? inviteesRegType[0].registrationInviteesRefId
        : 0;
      return <span>{checkRegistrationType(registrationInviteesRefId)}</span>;
    },
    sorter: (a, b) => tableSort(a, b, 'invitees'),
  },
  {
    title: AppConstants.action,
    dataIndex: 'statusRefId',
    key: 'statusRefId',
    render: (statusRefId, record) => (
      <div onClick={e => e.stopPropagation()}>
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
                alt=""
                width="16"
                height="16"
              />
            }
          >
            <>
              {statusRefId === 1 && (
                <Menu.Item key="1" onClick={() => this_Obj.updateCompetitionStatus(record)}>
                  <span>{AppConstants.editRegrade}</span>
                </Menu.Item>
              )}

              {record.registrationStatusRefId === 2 &&
              record.hasRegistration === 1 &&
              record.statusRefId !== 2 ? (
                <Menu.Item key="3" onClick={this_Obj.archiveCompetition('show', record)}>
                  <span>{AppConstants.archive}</span>
                </Menu.Item>
              ) : (
                <Menu.Item key="4" onClick={this_Obj.deleteCompetition('show', record)}>
                  <span>{AppConstants.delete}</span>
                </Menu.Item>
              )}
            </>
          </SubMenu>
        </Menu>
      </div>
    ),
  },
];

class CompetitionDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      year: null,
      loading: false,
      modalVisible: false,
      archiveModalVisible: false,
      competitionId: '',
      competitionName: '',
      statusRefId: null,
      registrationStatusRefId: null,
      hasRegistration: null,
      onDeleteTargetValue: 2,
      deleteCompLoad: false,
    };

    this.props.CLEAR_OWN_COMPETITION_DATA('all');

    this_Obj = this;
  }

  componentDidMount() {
    const prevUrl = getPrevUrl();
    if (
      !prevUrl ||
      !(history.location.pathname === prevUrl.pathname && history.location.key === prevUrl.key)
    ) {
      this.props.getOnlyYearListAction(this.props.appState.yearList);
      this.setState({ loading: true });
    } else {
      history.push('/');
    }
  }

  componentDidUpdate(nextProps) {
    const { yearList } = this.props.appState;
    if (this.state.loading === true && this.props.appState.onLoad === false) {
      if (yearList.length > 0) {
        let yearRefId = this.getYearRefId(yearList);
        this.props.competitionDashboardAction(yearRefId);
        this.setState({ loading: false, year: yearRefId });
      }
    }

    if (
      this.state.deleteCompLoad === true &&
      this.props.competitionDashboardState.deleteCompLoad === false
    ) {
      if (yearList.length > 0) {
        let yearRefId = this.getYearRefId(yearList);
        this.setState({ loading: false, year: yearRefId, deleteCompLoad: false });
        this.props.competitionDashboardAction(yearRefId);
      }
    }
  }

  getYearRefId = yearList => {
    let storedYearID = getGlobalYear();
    let yearRefId;
    if (storedYearID == null || storedYearID == 'null') {
      yearRefId = getCurrentYear(yearList);
      setGlobalYear(yearRefId);
    } else {
      yearRefId = storedYearID;
    }
    return yearRefId;
  };

  updateCompetitionStatus = record => {
    clearCompetitionStorage();
    let storedYearID = this.state.year;
    let selectedYearId =
      storedYearID == null || storedYearID == 'null' ? 1 : JSON.parse(storedYearID);
    let payload = {
      competitionUniqueKey: record.competitionId,
      statusRefId: 2,
    };
    this.props.updateCompetitionStatus(payload, selectedYearId);
  };

  deleteCompetition = (key, record) => async () => {
    if (key === 'show') {
      await this.setState({
        modalVisible: true,
        competitionId: record.competitionId,
        competitionName: record.competitionName,
        statusRefId: record.statusRefId,
        registrationStatusRefId: record.registrationStatusRefId,
        hasRegistration: record.hasRegistration,
      });
    } else if (key === 'ok') {
      await this.props.deleteCompetitionAction(
        this.state.competitionId,
        this.state.onDeleteTargetValue,
      );
      await this.setState({
        modalVisible: false,
        deleteCompLoad: true,
      });
    } else if (key === 'cancel') {
      await this.setState({
        modalVisible: false,
        onDeleteTargetValue: 2,
      });
    }
  };

  archiveCompetition = (key, record) => async () => {
    if (key === 'show') {
      await this.setState({
        archiveModalVisible: true,
        competitionId: record.competitionId,
        competitionName: record.competitionName,
        statusRefId: record.statusRefId,
        registrationStatusRefId: record.registrationStatusRefId,
        hasRegistration: record.hasRegistration,
      });
    } else if (key === 'ok') {
      await this.props.archiveCompetitionAction(this.state.competitionId);
      await this.setState({
        archiveModalVisible: false,
        deleteCompLoad: true,
      });
    } else if (key === 'cancel') {
      await this.setState({ archiveModalVisible: false });
    }
  };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  onYearClick = yearId => {
    setGlobalYear(yearId);
    this.setState({ year: yearId });
    this.props.competitionDashboardAction(yearId);
  };

  dropdownView = () => {
    const {
      yearList,
      // selectedYear
    } = this.props.appState;
    // let storedYearID = localStorage.getItem('yearId');
    // let selectedYearId = (storedYearID == null || storedYearID == 'null') ? 1 : JSON.parse(storedYearID);
    const showQuickComp = process.env.REACT_APP_SHOW_QUICKCOMPETITION === 'true';
    return (
      <div className="comp-player-grades-header-drop-down-view" style={{ marginTop: 15 }}>
        <div className="row">
          <div className="col-sm-8">
            <div className="year-select-heading-view pb- ">
              <span className="year-select-heading">{AppConstants.year}:</span>
              <Select
                className="year-select reg-filter-select-year ml-2"
                data-testid={AppUniqueId.SELECT_COMPETITION_YEAR}
                style={{ width: 90 }}
                onChange={this.onYearClick}
                value={JSON.parse(this.state.year)}
              >
                {yearList.map(item => (
                  <Option
                    data-testid={AppUniqueId.SELECT_COMPETITION_YEAR_OPTION + item.name}
                    key={`year_${item.id}`}
                    value={item.id}
                  >
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-4 d-flex align-items-center">
              <span className="form-heading">{AppConstants.ownedCompetitions}</span>
              <div className="mt-n20">
                <Tooltip placement="top">
                  <span>{AppConstants.ownedCompetitionMsg}</span>
                </Tooltip>
              </div>
            </div>
            <div className="col-sm d-flex justify-content-end" style={{ maxWidth: '99%' }}>
              <div className="row">
                {showQuickComp ? (
                  <div className="col-sm">
                    <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
                      <NavLink to="/quickCompetition">
                        <Button
                          id={AppUniqueId.quickCom_Button}
                          className="primary-add-comp-form"
                          type="primary"
                        >
                          + {AppConstants.quickCompetition}
                        </Button>
                      </NavLink>
                    </div>
                  </div>
                ) : null}
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
                    <Button
                      id={AppUniqueId.newCompetitionButton}
                      className="primary-add-comp-form"
                      data-testid={AppUniqueId.FULL_COMPETITION}
                      type="primary"
                      onClick={() => this.openModel(this.props)}
                    >
                      + {AppConstants.fullCompetition}
                    </Button>
                  </div>
                </div>
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
                    <NavLink to="/competitionReplicate">
                      <Button
                        id={AppUniqueId.replicateCompetitionButton}
                        className="primary-add-comp-form"
                        type="primary"
                      >
                        + {AppConstants.replicateCompetition}
                      </Button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  openModel = props => {
    // let competitionId = this.props.competitionFeesState.competitionId;
    let this_ = this;
    confirm({
      title: AppConstants.registrationAddConfirm,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        // [
        // <NavLink
        //     // onClick={() => this.props.clearCompReducerDataAction("all")}
        //     to={{ pathname: `/registrationCompetitionForm`, state: { id: null } }}
        // />
        // ]
        this_.onRegistrationCompScreen();
      },
      onCancel() {
        this_.onCompetitionScreen();
      },
    });
  };

  onCompetitionScreen = () => {
    this.props.clearCompReducerDataAction('all');
    history.push('/competitionOpenRegForm', { id: null, isNewComp: true });
  };

  onRegistrationCompScreen = () => {
    this.props.clearCompReducerDataAction('all');
    history.push('/registrationCompetitionFee', { id: null, isEdit: false });
  };

  dropdownButtonView = () => {
    // const { yearList, selectedYear } = this.props.appState;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm d-flex flex-row align-items-center">
              <span id={AppUniqueId.ownedCompetition_column_headers_table} className="form-heading">
                {AppConstants.participateInComp}
              </span>
              <div className="mt-n20">
                <Tooltip placement="top">
                  <span>{AppConstants.participateCompMsg}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  compScreenDeciderCheck = (record, key) => {
    // let storedYearID = localStorage.getItem("yearId");
    // let selectedYearId = (storedYearID == null || storedYearID == 'null') ? 1 : JSON.parse(storedYearID);
    history.push('/competitionOpenRegForm', {
      id: record.competitionId,
      screenKey: 'compDashboard',
      key: key,
    });
    setOwn_competition(record.competitionId);
  };

  participatedView = () => (
    <div className="comp-dash-table-view" style={{ paddingBottom: 100 }}>
      <div className="table-responsive home-dash-table-view">
        <Table
          loading={this.props.competitionDashboardState.onLoad}
          className="home-dashboard-table"
          columns={columns}
          dataSource={this.props.competitionDashboardState.participatingInComptitions}
          pagination={false}
          onRow={record => ({
            onClick: () => this.compScreenDeciderCheck(record, 'part'),
          })}
          rowKey={(record, index) => 'participatingInComptitions' + record.competitionId + index}
        />
      </div>
    </div>
  );

  onChangeSetValue = targetValue => {
    this.setState({
      onDeleteTargetValue: targetValue,
    });
  };

  ownedView = () => (
    <div className="comp-dash-table-view">
      <div className="table-responsive home-dash-table-view">
        <Table
          loading={this.props.competitionDashboardState.onLoad}
          className="home-dashboard-table"
          columns={columnsOwned}
          dataSource={this.props.competitionDashboardState.ownedCompetitions}
          pagination={false}
          onRow={record => ({
            onClick: () => this.compScreenDeciderCheck(record, 'own'),
          })}
          key={AppUniqueId.owned_compet_content_table}
          rowKey={(record, index) => 'ownedCompetitions' + record.competitionId + index}
        />
      </div>
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.deleteCompetition.replace('(COMP_NAME)', this.state.competitionName)}
        visible={this.state.modalVisible}
        onOk={this.deleteCompetition('ok')}
        onCancel={this.deleteCompetition('cancel')}
        cancelText={AppConstants.no}
        okText={AppConstants.yes}
      >
        {this.state.hasRegistration === 1 &&
        this.state.registrationStatusRefId === 1 &&
        this.state.statusRefId === 0 ? (
          <p>
            {AppConstants.competitionDeleteAlertText}
            {/* hasNoRegNoDrawsDeleteText -- reg only 020
          competitionDeleteAlertText -- reg and comp 110 */}
          </p>
        ) : this.state.hasRegistration === 0 && this.state.statusRefId !== 0 ? (
          <div>
            <p>
              {AppConstants.deletePublishToLsMsg
                .replace('(COMP_NAME)', this.state.competitionName)
                .replace('(COMP_NAME)', this.state.competitionName)}
            </p>
            <Radio.Group
              className="reg-competition-radio customize-radio-text"
              onChange={e => this.onChangeSetValue(e.target.value)}
              value={this.state.onDeleteTargetValue}
            >
              <Radio value={1}>{AppConstants.both}</Radio>
              <Radio value={2}>{AppConstants.onlyCompMngmt}</Radio>
            </Radio.Group>
          </div>
        ) : (
          <p>{AppConstants.hasNoRegNoDrawsDeleteText}</p>
        )}
      </Modal>
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.archiveCompetitionAlertTextHeader.replace(
          '(COMP_NAME)',
          this.state.competitionName,
        )}
        visible={this.state.archiveModalVisible}
        onOk={this.archiveCompetition('ok')}
        onCancel={this.archiveCompetition('cancel')}
        okText={AppConstants.yes}
        cancelText={AppConstants.no}
      >
        <p>{AppConstants.archiveCompetitionAlertText}</p>
      </Modal>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="1" />

        <Layout>
          <Content>
            {this.dropdownView()}
            <Loader
              visible={this.props.competitionDashboardState.updateLoad || this.state.deleteCompLoad}
            />
            {this.ownedView()}
            {this.dropdownButtonView()}
            {this.participatedView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      clearCompReducerDataAction,
      competitionDashboardAction,
      getOnlyYearListAction,
      CLEAR_OWN_COMPETITION_DATA,
      updateCompetitionStatus,
      deleteCompetitionAction,
      archiveCompetitionAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFeesState: state.CompetitionFeesState,
    competitionDashboardState: state.CompetitionDashboardState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionDashboard);

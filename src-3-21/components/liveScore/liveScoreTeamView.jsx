import React, { Component } from 'react';
import { Layout, Button, Table, Breadcrumb, Modal, message, Menu } from 'antd';
import './liveScore.css';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getTeamViewPlayerList,
  liveScoreDeleteTeam,
} from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import moment from 'moment';
import { liveScoreDeletePlayerAction } from '../../store/actions/LiveScoreAction/liveScorePlayerAction';

import Loader from '../../customComponents/loader';
import { isArrayNotEmpty } from '../../util/helpers';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import {
  // getOrganisationData,
  getLiveScoreCompetition,
} from '../../util/sessionStorage';
import { getUserRoleId, checkLivScoreCompIsParent } from '../../util/permissions';
import { getGenericCommonReference } from '../../store/actions/commonAction/commonAction';

const { Content } = Layout;
const { confirm } = Modal;
// const { SubMenu } = Menu;

var _this;

const columns = [
  {
    title: AppConstants.profilePic,
    dataIndex: 'photoUrl',
    key: 'photoUrl',
    sorter: true,
    render: photoUrl =>
      photoUrl ? (
        <img className="user-image" src={photoUrl} alt="" height="70" width="70" />
      ) : (
        <span>No Image</span>
      ),
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => {
      const name1 = a.firstName && a.lastName ? a.firstName + ' ' + a.lastName : '';
      const name2 = b.firstName && b.lastName ? b.firstName + ' ' + b.lastName : '';
      return name1.localeCompare(name2);
    },
    render: (name, record) => {
      const { firstName, lastName, suspended } = record;
      return (
        // <NavLink to={{
        //     pathname: '/matchDayPlayerView',
        //     state: { tableRecord: record }
        // }}>
        <span className="theme-color pointer" onClick={() => _this.checkUserId(record)}>
          <span className={suspended ? 'suspended-suffix' : ''}>
            {firstName && lastName && firstName + ' ' + lastName}
          </span>
        </span>
        // </NavLink>)
      );
    },
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dob',
    key: 'dob',
    sorter: (a, b) => a.dateOfBirth?.localeCompare(b.dateOfBirth),
    render: (dob, record) => (
      <span>{record.dateOfBirth ? moment(record.dateOfBirth).format('DD/MM/YYYY') : '    '}</span>
    ),
  },
  {
    title: AppConstants.contact_No,
    dataIndex: 'number',
    key: 'number',
    sorter: (a, b) => a.phoneNumber?.localeCompare(b.phoneNumber),
    render: (dob, record) => <span>{record.phoneNumber ? record.phoneNumber : ''}</span>,
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRefId',
    key: 'statusRefId',
    sorter: true,
    render: (statusRefId, record) => <span>{_this.getPlayerStatus(statusRefId)}</span>,
  },
  {
    title: AppConstants.action,
    render: (data, record, playerId) => (
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <Menu.SubMenu
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
          <Menu.Item key="1">
            <NavLink
              to={{ pathname: '/matchDayAddPlayer', state: { isEdit: true, playerData: record } }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {record.competitionOrganisationId ? null : (
            <Menu.Item
              key="2"
              onClick={() => {
                _this.showDeleteConfirmPlayer(record.id, record.competitionId);
              }}
            >
              <span>Delete</span>
            </Menu.Item>
          )}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

const columns_2 = [
  {
    title: AppConstants.profilePic,
    dataIndex: 'photoUrl',
    key: 'photoUrl',
    sorter: (a, b) => a.photoUrl.length - b.photoUrl.length,
    render: photoUrl =>
      photoUrl ? (
        <img className="user-image" src={photoUrl} alt="" height="70" width="70" />
      ) : (
        <span>{'No Image'}</span>
      ),
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.length - b.name.length,
    render: (name, record) => {
      const { firstName, lastName, suspended } = record;
      return (
        // <NavLink to={{
        //     pathname: '/matchDayPlayerView',
        //     state: { tableRecord: record }
        // }}>
        <span className="theme-color pointer" onClick={() => _this.checkUserId(record)}>
          <span className={suspended ? 'suspended-suffix' : ''}>
            {firstName && lastName && firstName + ' ' + lastName}
          </span>
        </span>
        // </NavLink>)
      );
    },
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dob',
    key: 'dob',
    sorter: (a, b) => a.dob.length - b.dob.length,
    render: (dob, record) => (
      <span>{record.dateOfBirth ? moment(record.dateOfBirth).format('DD/MM/YYYY') : '    '}</span>
    ),
  },
  {
    title: AppConstants.contact_No,
    dataIndex: 'number',
    key: 'number',
    sorter: (a, b) => a.number.length - b.number.length,
    render: (dob, record) => <span>{record.phoneNumber ? record.phoneNumber : ''}</span>,
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRefId',
    key: 'statusRefId',
    sorter: true,
    render: (statusRefId, record) => <span>{_this.getPlayerStatus(statusRefId)}</span>,
  },
];

class LiveScoreTeamView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.location.state
        ? props.location.state.tableRecord
          ? props.location.state.tableRecord
          : null
        : null,
      // teamId: props.location.state ? props.location.state.teamId : null,
      teamId: props.location
        ? props.location.state
          ? props.location.state.tableRecord
            ? props.location.state.tableRecord.teamId
              ? props.location.state.tableRecord.teamId
              : props.location
              ? props.location.state
                ? props.location.state.tableRecord
                  ? props.location.state.tableRecord.id
                    ? props.location.state.tableRecord.id
                    : props.location
                    ? props.location.state
                      ? props.location.state.tableRecord
                        ? props.location.state.tableRecord.team
                          ? props.location.state.tableRecord.team.id
                          : null
                        : null
                      : null
                    : null
                  : null
                : null
              : null
            : null
          : null
        : null,
      screenName: this.props.location.state ? this.props.location.state.screenName : null,
      key: props.location.state
        ? props.location.state.key
          ? props.location.state.key
          : null
        : null,
      // teamId: null,
      userRoleId: getUserRoleId(),
      screenKey: this.props.location.state ? this.props.location.state.screenKey : null,
      sourceIdAvailable: false,
      liveScoreCompIsParent: false,
      hasRegistration: null,
    };
    _this = this;
    this.props.getGenericCommonReference({ LSPlayerStatus: 'LSPlayerStatus' });
  }

  checkUserId(record) {
    if (record.userId == null) {
      message.config({ duration: 1.5, maxCount: 1 });
      message.warn(ValidationConstants.playerMessage);
    } else {
      history.push('/userPersonal', {
        userId: record.userId,
        screenKey: 'livescore',
        screen: '/matchDayPlayerList',
      });
    }
  }

  async componentDidMount() {
    const competition = getLiveScoreCompetition();
    if (competition) {
      const { sourceId, hasRegistration } = JSON.parse(competition);
      this.setState({ sourceIdAvailable: sourceId ? true : false, hasRegistration });
      this.setLivScoreCompIsParent();
    }
    let teamId = this.props.location
      ? this.props.location.state
        ? this.props.location.state.teamId
        : null
      : null;

    let teamIds = this.state.teamId ? this.state.teamId : teamId;
    if (teamIds) {
      this.props.getTeamViewPlayerList(teamIds);
    } else {
      history.push('/matchDayTeam');
    }
  }

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  // Delete Player
  deletePlayer = (playerId, competitionId) => {
    this.props.liveScoreDeletePlayerAction(playerId, {
      competitionId,
      offset: 0,
      key: 'team',
    });
  };

  showDeleteConfirmPlayer = (playerId, competitionId) => {
    let this_ = this;
    confirm({
      title: AppConstants.playerDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deletePlayer(playerId, competitionId);
      },
      onCancel() {},
    });
  };

  getPlayerStatus = refId => {
    const { LSPlayerStatus = [] } = this.props.commonReducerState;
    if (!refId == null || !isArrayNotEmpty(LSPlayerStatus)) return '';
    let status = LSPlayerStatus.find(g => g.id == refId);
    return status?.description;
  };

  ////view for profile image
  profileImageView = () => {
    // let data = this.state.data
    let data = this.props.location
      ? this.props.location.state
        ? this.props.location.state.tableRecord
          ? this.props.location.state.tableRecord
          : null
        : null
      : null;
    const {
      teamData,
      // managerData,
      managerList,
    } = this.props.liveScoreTeamState;
    const { name, logoUrl } = teamData ? teamData : '';
    // const { mobileNumber, email } = managerData ? managerData : ''

    let managerDataList = isArrayNotEmpty(managerList) ? managerList : [];
    let coachData = isArrayNotEmpty(data && data.coaches) ? data.coaches : [];
    return (
      <div className="fluid-width mt-2">
        <div className="profile-image-view mr-5">
          {this.props.liveScoreTeamState &&
          this.props.liveScoreTeamState.teamData &&
          this.props.liveScoreTeamState.teamData.logoUrl ? (
            <img
              className="user-image"
              src={logoUrl ? logoUrl : ''}
              alt=""
              height="80"
              width="80"
            />
          ) : (
            <span className="user-contact-heading"> </span>
          )}

          <span className="user-contact-heading">{name ? name : ''}</span>
        </div>

        <div className="profile-img-view-style">
          <span className="user-contact-heading">{AppConstants.manager}</span>
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.group} height="16" width="16" alt="" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.name}</span>
            </div>

            {managerDataList.map(item => (
              <span className="desc-text-style side-bar-profile-data">
                {(item.firstName || item.lastName) && item.firstName + ' ' + item.lastName}
              </span>
            ))}
          </div>

          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.group} height="16" width="16" alt="" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.email}</span>
            </div>
            {managerDataList.map(item => (
              <span className="desc-text-style side-bar-profile-data">{item.email}</span>
            ))}
          </div>

          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.callAnswer} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.contactNumber}</span>
            </div>
            {managerDataList.map(item => (
              <span className="desc-text-style side-bar-profile-data">{item.mobileNumber}</span>
            ))}
          </div>

          {/* coaches View */}
          <div>
            <span className="user-contact-heading">{AppConstants.coach}</span>

            <div className="live-score-side-desc-view">
              <div className="live-score-title-icon-view">
                <div className="live-score-icon-view">
                  <img src={AppImages.group} height="16" width="16" alt="" />
                </div>
                <span className="year-select-heading ml-3">{AppConstants.name}</span>
              </div>

              {coachData.map(item => (
                <span className="desc-text-style side-bar-profile-data">
                  {item.name && item.name}
                </span>
              ))}
            </div>

            <div className="live-score-side-desc-view">
              <div className="live-score-title-icon-view">
                <div className="live-score-icon-view">
                  <img src={AppImages.group} height="16" width="16" alt="" />
                </div>
                <span className="year-select-heading ml-3">{AppConstants.email}</span>
              </div>
              {coachData.map(item => (
                <span className="desc-text-style side-bar-profile-data">{item.email}</span>
              ))}
            </div>

            <div className="live-score-side-desc-view">
              <div className="live-score-title-icon-view">
                <div className="live-score-icon-view">
                  <img src={AppImages.callAnswer} alt="" height="16" width="16" />
                </div>
                <span className="year-select-heading ml-3">{AppConstants.contactNumber}</span>
              </div>
              {coachData.map(item => (
                <span className="desc-text-style side-bar-profile-data">{item.mobileNumber}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  addPlayerView() {
    // const { teamData, managerData, } = this.props.liveScoreTeamState
    // const { name, logoUrl, id } = teamData ? teamData : ''
    // const { mobileNumber, email } = managerData ? managerData : ''
    const { userRoleId, hasRegistration } = this.state;
    let roleId = userRoleId == 11 || userRoleId == 13;
    return (
      <div className="row">
        <div className="col-sm">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.players}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {hasRegistration != 1 ? (
          <div className="col-sm d-flex justify-content-end">
            <div className="comp-dashboard-botton-view-mobile">
              <NavLink
                to={{
                  pathname: '/matchDayAddPlayer',
                  state: {
                    ...this.props.location.state,
                    screenName: this.state.screenName,
                    screenKey: this.state.screenKey,
                  },
                }}
              >
                <Button disabled={roleId} className="primary-add-comp-form" type="primary">
                  + {AppConstants.addPlayer}
                </Button>
              </NavLink>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  deleteTeam = teamId => {
    this.props.liveScoreDeleteTeam(teamId);
    // this.setState({ deleteLoading: true })
  };

  showDeleteConfirm = teamId => {
    let this_ = this;
    confirm({
      title: AppConstants.teamDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteTeam(teamId);
      },
      onCancel() {},
    });
  };

  headerView = () => {
    const { userRoleId, liveScoreCompIsParent } = this.state;
    let roleId = userRoleId == 11 || userRoleId == 13;
    return (
      <div className="row mt-5">
        <div className="col-sm d-flex align-items-center justify-content-end w-100">
          {liveScoreCompIsParent == true && (
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
                  <NavLink
                    to={{
                      pathname: '/matchDayAddTeam',
                      state: {
                        isEdit: true,
                        teamId: this.state.teamId
                          ? this.state.teamId
                          : this.props.location
                          ? this.props.location.state
                            ? this.props.location.state.teamId
                            : null
                          : null,
                        key: this.state.key,
                        screenName: this.state.screenName,
                        screenKey: this.state.screenKey,
                      },
                    }}
                  >
                    <Button disabled={roleId} className="primary-add-comp-form" type="primary">
                      + {AppConstants.edit}
                    </Button>
                  </NavLink>
                </div>
              </div>
              {!this.state.sourceIdAvailable && (
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
                    <Button
                      disabled={roleId}
                      onClick={() => this.showDeleteConfirm(this.state.teamId)}
                      className="primary-add-comp-form"
                      type="primary"
                    >
                      {AppConstants.delete}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      // </div>
    );
  };

  //////// tableView
  tableView = () => {
    const { playerList } = this.props.liveScoreTeamState;
    return (
      <div>
        <div className="inside-table-view mt-4">
          {this.addPlayerView()}

          <div className="table-responsive home-dash-table-view mt-3">
            <Table
              // loading={this.props.liveScoreTeamState.onLoad}
              className="home-dashboard-table"
              columns={this.state.userRoleId == 2 ? columns : columns_2}
              dataSource={playerList}
              pagination={false}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { screenName } = this.state;
    return (
      <div className="fluid-width default-bg">
        {screenName === 'userPersonal' ? (
          <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}

        {screenName === 'userPersonal' ? (
          <InnerHorizontalMenu menu="user" userSelectedKey="1" />
        ) : (
          <InnerHorizontalMenu
            menu="liveScore"
            liveScoreSelectedKey={
              screenName === 'fromMatchList'
                ? '2'
                : screenName === 'liveScoreDashboard'
                ? '1'
                : screenName === 'fromPlayerList'
                ? '7'
                : '3'
            }
          />
        )}
        <Loader visible={this.props.liveScoreTeamState.onLoad} />
        <Layout className="live-score-player-profile-layout">
          <Content className="live-score-player-profile-content">
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm-3" style={{ marginBottom: '6%' }}>
                  {this.profileImageView()}
                </div>
                <div className="col-sm-9 default-bg">
                  {this.headerView()}
                  {this.tableView()}
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getTeamViewPlayerList,
      liveScoreDeleteTeam,
      liveScoreDeletePlayerAction,
      getGenericCommonReference,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreTeamState: state.LiveScoreTeamState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreTeamView);

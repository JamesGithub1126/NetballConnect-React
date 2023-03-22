import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Layout, Button, Table, Pagination, Spin, message, Menu, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  playerListWithPaginationAction,
  liveScoreDeletePlayerAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScorePlayerAction';
import { liveScore_formateDate } from '../../themes/dateformate';
import history from '../../util/history';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import { exportFilesAction } from '../../store/actions/appAction';
import ValidationConstants from '../../themes/validationConstant';
import {
  isArrayNotEmpty,
  // teamListData,
  teamListDataCheck,
} from '../../util/helpers';
import { checkLivScoreCompIsParent } from 'util/permissions';
import { getGenderDescription } from 'util/enumHelper';
import {
  getGenderAction,
  getGenericCommonReference,
} from '../../store/actions/commonAction/commonAction';

const { Content } = Layout;
// const { SubMenu } = Menu;
const { confirm } = Modal;

let _this = null;

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
  let { pageSize } = _this.props.liveScorePlayerState;
  pageSize = pageSize ? pageSize : 10;
  if (_this.state.competitionId) {
    _this.props.playerListWithPaginationAction(
      _this.state.competitionId,
      _this.state.offset,
      pageSize,
      _this.state.searchText,
      sortBy,
      sortOrder,
      _this.state.liveScoreCompIsParent,
      _this.state.compOrgId,
    );
  }
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.profilePic,
    dataIndex: 'profilePicture',
    key: 'profilePicture',
    render: profilePicture => {
      return profilePicture ? (
        <img className="user-image" src={profilePicture} alt="" height="70" width="70" />
      ) : (
        <span>{AppConstants.noImage}</span>
      );
    },
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
    sorter: true,
    onHeaderCell: () => listeners('userId'),
  },
  {
    title: AppConstants.playerId,
    dataIndex: 'playerId',
    key: 'playerId',
    sorter: true,
    onHeaderCell: () => listeners('id'),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstsName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => {
      const { suspended } = record;
      return (
        <span className='input-heading-add-another pt-0'>
          <span
            className={suspended? 'suspended': ''}
            onClick={() => _this.checkUserId(record)}
          >
            {firstName}
          </span>
        </span>
      );
    },
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => {
      const { suspended } = record;

      return (
        // <NavLink to={{
        //     pathname: '/matchDayPlayerView',
        //     state: { tableRecord: record }
        // }}>
        <span className="input-heading-add-another pt-0" onClick={() => _this.checkUserId(record)}>
          <span className={suspended? 'suspended-suffix': ''}>{lastName}</span>
        </span>
      );
    },
    // </NavLink>
  },
  {
    title: AppConstants.gender,
    dataIndex: 'gender',
    key: 'gender',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (user, record) => <span>{getGenderDescription(record.user)}</span>,
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dob',
    key: 'dob',
    sorter: true,
    onHeaderCell: () => listeners('dateOfBirth'),
    render: dob => <span>{dob ? liveScore_formateDate(dob) : ''}</span>,
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: division => <span>{division?.name}</span>,
  },
  {
    title: AppConstants.teamOrOrganisation,
    dataIndex: 'team',
    key: 'team',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (team, record, index) =>
      team &&
      teamListDataCheck(
        team.id,
        _this.state.liveScoreCompIsParent,
        record.team,
        _this.state.compOrgId,
        team,
      ) ? (
        <>
          <NavLink
            to={{
              pathname: '/matchDayTeamView',
              state: { tableRecord: record, screenName: 'fromPlayerList' },
            }}
          >
            <span className="input-heading-add-another pt-0">{team.name}</span>
          </NavLink>
          <p>{record.competitionOrganisation?.organisation?.name}</p>
        </>
      ) : (
        <>
          <p>{team ? team.name : null}</p>
          <p>{record.competitionOrganisation?.organisation?.name}</p>
        </>
      ),
  },
  {
    title: AppConstants.contact_No,
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRefId',
    key: 'statusRefId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (statusRefId, record) => <span>{_this.getStatus(statusRefId)}</span>,
  },
  {
    title: AppConstants.action,
    key: 'action',
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
              to={{
                pathname: '/matchDayAddPlayer',
                state: {
                  isEdit: true,
                  playerData: record,
                  canClearTeam: !!record.competitionOrganisation,
                },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {record.competitionOrganisationId ? null : (
            <Menu.Item
              key="2"
              onClick={() => {
                _this.showDeleteConfirm(record.playerId);
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

class LiveScorePlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      searchText: '',
      offset: 0,
      sortBy: null,
      sortOrder: null,
      compOrgId: null,
      liveScoreCompIsParent: false,
      hasRegistration: null,
    };
    _this = this;
    this.props.getGenderAction();
    this.props.getGenericCommonReference({ LSPlayerStatus: 'LSPlayerStatus' });
  }

  componentDidMount() {
    let { playerListActionObject } = this.props.liveScorePlayerState;
    const competition = getLiveScoreCompetition();
    if (competition) {
      this.setLivScoreCompIsParent();
      const { id, competitionOrganisation, hasRegistration } = JSON.parse(competition);
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      this.setState({ competitionId: id, compOrgId: compOrgId, hasRegistration });
      if (id !== null) {
        const liveScoreCompIsParent = checkLivScoreCompIsParent();
        let { pageSize } = this.props.liveScorePlayerState;
        pageSize = pageSize ? pageSize : 10;

        if (playerListActionObject) {
          let offset = playerListActionObject.offset;
          let searchText = playerListActionObject.search;
          let sortBy = playerListActionObject.sortBy;
          let sortOrder = playerListActionObject.sortOrder;
          this.setState({ offset, searchText, sortBy, sortOrder });
          this.props.playerListWithPaginationAction(
            id,
            offset,
            pageSize,
            searchText,
            sortBy,
            sortOrder,
            liveScoreCompIsParent,
            compOrgId,
          );
        } else {
          this.props.playerListWithPaginationAction(
            id,
            0,
            pageSize,
            null,
            null,
            null,
            liveScoreCompIsParent,
            compOrgId,
          );
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }
  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  // Delete player
  deletePlayer = playerId => {
    let { playerListActionObject, totalCount } = this.props.liveScorePlayerState;

    this.props.liveScoreDeletePlayerAction(playerId, {
      competitionId: this.state.competitionId,
      totalCount,
      ...playerListActionObject,
    });
  };

  showDeleteConfirm = playerId => {
    let this_ = this;
    confirm({
      title: AppConstants.playerDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deletePlayer(playerId);
      },
      onCancel() {},
    });
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  /// Handle Page change
  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScorePlayerState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    let { sortBy, sortOrder } = this.state;
    this.setState({
      offset,
    });
    this.props.playerListWithPaginationAction(
      this.state.competitionId,
      offset,
      pageSize,
      this.state.searchText,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.compOrgId,
    );
  };

  getGender = genderRefId => {
    const { genderData = [] } = this.props.commonReducerState;
    if (genderRefId == null || genderRefId == undefined) return '';
    let gender = genderData.find(g => g.id == genderRefId);
    return gender?.description;
  };

  getStatus = refId => {
    const { LSPlayerStatus = [] } = this.props.commonReducerState;
    if (!refId == null || !isArrayNotEmpty(LSPlayerStatus)) return '';
    let status = LSPlayerStatus.find(g => g.id == refId);
    return status?.description;
  };

  contentView = () => {
    const { result, totalCount, currentPage, pageSize, onLoad } = this.props.liveScorePlayerState;

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad && true}
            className="home-dashboard-table"
            columns={columns}
            dataSource={result}
            pagination={false}
            rowKey={record => record.playerId}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={currentPage}
              defaultCurrent={currentPage}
              defaultPageSize={pageSize}
              total={totalCount}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  // on change search text
  onChangeSearchText = e => {
    let { sortBy, sortOrder, competitionId } = this.state;
    this.setState({ searchText: e.target.value, offset: 0 });
    let { pageSize } = this.props.liveScorePlayerState;
    pageSize = pageSize ? pageSize : 10;
    if (e.target.value == null || e.target.value === '') {
      this.props.playerListWithPaginationAction(
        competitionId,
        0,
        pageSize,
        e.target.value,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    let { sortBy, sortOrder, searchText, competitionId } = this.state;
    this.setState({ offset: 0 });
    let { pageSize } = this.props.liveScorePlayerState;
    pageSize = pageSize ? pageSize : 10;
    var code = e.keyCode || e.which;
    if (code === 13) {
      //13 is the enter keycode
      this.props.playerListWithPaginationAction(
        competitionId,
        0,
        pageSize,
        searchText,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    let { sortBy, sortOrder, searchText, competitionId } = this.state;
    this.setState({ offset: 0 });
    let { pageSize } = this.props.liveScorePlayerState;
    pageSize = pageSize ? pageSize : 10;
    if (this.state.searchText == null || this.state.searchText === '') {
    } else {
      this.props.playerListWithPaginationAction(
        competitionId,
        0,
        pageSize,
        searchText,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.compOrgId,
      );
    }
  };

  onExport = () => {
    let url = null;
    if (this.state.liveScoreCompIsParent) {
      url = AppConstants.exportUrl + `competitionId=${this.state.competitionId}&source=web`;
    } else {
      url = AppConstants.exportUrl + `competitionOrganisationId=${this.state.compOrgId}&source=web`;
    }
    this.props.exportFilesAction(url);
  };

  checkUserId = record => {
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
  };

  headerView = () => {
    // const { id } = JSON.parse(getLiveScoreCompetition())
    const { hasRegistration } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.playerList}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                {hasRegistration != 1 ? (
                  <div className="col-sm pt-1">
                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                      <NavLink to="/matchDayAddPlayer" className="text-decoration-none">
                        <Button className="primary-add-comp-form" type="primary">
                          + {AppConstants.addPlayer}
                        </Button>
                      </NavLink>
                    </div>
                  </div>
                ) : null}
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      onClick={this.onExport}
                      className="primary-add-comp-form"
                      type="primary"
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
                {hasRegistration != 1 ? (
                  <div className="col-sm pt-1">
                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                      <NavLink to="/matchDayPlayerImport" className="text-decoration-none">
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
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-5 d-flex justify-content-end">
            <div className="comp-product-search-inp-width">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
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

  loaderView = () => {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <Spin size="small" tip="Loading..." />
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="7" />
        <Layout>
          {getLiveScoreCompetition() && this.headerView()}
          <Content>{getLiveScoreCompetition() && this.contentView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      playerListWithPaginationAction,
      exportFilesAction,
      liveScoreDeletePlayerAction,
      setPageSizeAction,
      setPageNumberAction,
      getGenderAction,
      getGenericCommonReference,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScorePlayerState: state.LiveScorePlayerState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScorePlayerList);

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, Table, Pagination, Menu, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import {
  liveScoreCoachListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreCoachAction';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { userExportFilesAction } from '../../store/actions/appAction';
import { isArrayNotEmpty, teamListDataCheck } from '../../util/helpers';
import { checkLivScoreCompIsParent } from 'util/permissions';
import LiveScoreDeleteCoachModal from './components/LiveScoreDeleteCoachModal';

const { Content } = Layout;
const { SubMenu } = Menu;

let _this = null;

const handleOnDeleteCoachClick = record => {
  const shiftState = !_this.state.showDeleteCoachesModalWrapper;
  _this.setState({ showDeleteCoachesModalWrapper: shiftState });
  if (record) {
    _this.setState({
      coachRecord: record,
    });
  }
};

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
  let { pageSize } = _this.props.liveScoreCoachState;
  pageSize = pageSize ? pageSize : 10;
  _this.props.liveScoreCoachListAction(
    17,
    _this.state.compOrgId,
    _this.state.searchText,
    _this.state.offset,
    pageSize,
    sortBy,
    sortOrder,
    _this.state.liveScoreCompIsParent,
    _this.state.competitionId,
  );
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: { userId: record.id, screenKey: 'livescore', screen: '/matchDayCoaches' },
        }}
      >
        <span className="input-heading-add-another pt-0">
          <span className={record.suspended ? 'suspended' : ''}>{firstName}</span>
        </span>
      </NavLink>
    ),
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
        <NavLink
          to={{
            pathname: '/userPersonal',
            state: { userId: record.id, screenKey: 'livescore', screen: '/matchDayCoaches' },
          }}
        >
          <span className="input-heading-add-another pt-0">
            <span className={suspended ? 'suspended-suffix' : ''}>{lastName}</span>
          </span>
        </NavLink>
      );
    },
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.contact_No,
    dataIndex: 'mobileNumber',
    key: 'mobileNumber',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.teamOrOrganisation,
    dataIndex: 'linkedEntity',
    key: 'Linked Entity Name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: linkedEntity => (
      <div>
        {linkedEntity.map((item, i) =>
          teamListDataCheck(
            item.entityId,
            _this.state.liveScoreCompIsParent,
            item,
            _this.state.compOrgId,
            item,
          ) ? (
            <div key={`name${i}` + linkedEntity.entityId}>
              <NavLink
                to={{
                  pathname: '/matchDayTeamView',
                  state: { teamId: item.entityId, screenKey: 'livescore' },
                }}
              >
                <span className="live-score-desc-text side-bar-profile-data theme-color pointer">
                  {item.name}
                </span>
              </NavLink>
            </div>
          ) : (
            <span>{item.name}</span>
          ),
        )}
      </div>
    ),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: '/matchDayAddEditCoach',
                state: { isEdit: true, tableRecord: record },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="2" onClick={() => handleOnDeleteCoachClick(record)}>
            <span>{AppConstants.delete}</span>
          </Menu.Item>
        </SubMenu>
      </Menu>
    ),
  },
];

class LiveScoreCoaches extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      competitionId: null,
      offset: 0,
      sortBy: null,
      sortOrder: null,
      liveScoreCompIsParent: false,
      compOrgId: 0,
      showDeleteCoachesModalWrapper: false,
      coachRecord: null,
    };

    _this = this;
  }

  componentDidMount() {
    let { coachListActionObject } = this.props.liveScoreCoachState;
    if (getLiveScoreCompetition()) {
      this.setLivScoreCompIsParent();
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      const { id, competitionOrganisation, competitionOrganisationId } = JSON.parse(
        getLiveScoreCompetition(),
      );
      let compOrgId = competitionOrganisation
        ? competitionOrganisation.id
        : competitionOrganisationId
        ? competitionOrganisationId
        : 0;
      this.setState({ competitionId: id, compOrgId: compOrgId, liveScoreCompIsParent });
      let offset = 0;
      let { pageSize } = this.props.liveScoreCoachState;
      pageSize = pageSize ? pageSize : 10;
      if (coachListActionObject) {
        offset = coachListActionObject.offset;
        let searchText = coachListActionObject.search;
        let sortBy = coachListActionObject.sortBy;
        let sortOrder = coachListActionObject.sortOrder;
        this.setState({ offset, searchText, sortBy, sortOrder });
        this.props.liveScoreCoachListAction(
          17,
          compOrgId,
          searchText,
          offset,
          pageSize,
          sortBy,
          sortOrder,
          liveScoreCompIsParent,
          id,
        );
      } else {
        this.props.liveScoreCoachListAction(
          17,
          compOrgId,
          this.state.searchText,
          offset,
          pageSize,
          null,
          null,
          liveScoreCompIsParent,
          id,
        );
      }

      if (id !== null) {
        this.props.getliveScoreTeams(id, null, compOrgId);
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

  /// Handle Page change
  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScoreCoachState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    let {
      sortBy,
      sortOrder,
      searchText,
      // competitionId,
      compOrgId,
    } = this.state;
    this.setState({
      offset,
    });
    this.props.liveScoreCoachListAction(
      17,
      compOrgId,
      searchText,
      offset,
      pageSize,
      sortBy,
      sortOrder,
      this.state.liveScoreCompIsParent,
      this.state.competitionId,
    );
  };

  contentView = () => {
    const { coachesResult, currentPage, pageSize, totalCount, onLoad } =
      this.props.liveScoreCoachState;

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={coachesResult}
            pagination={false}
            loading={onLoad}
            rowKey={record => 'couchesList' + record.id}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
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

  headerView = () => {
    const { liveScoreCompIsParent } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.coachList}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm-8 d-flex flex-row align-items-center justify-content-end w-100">
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <NavLink to="/matchDayAddEditCoach">
                    <Button className="primary-add-comp-form" type="primary">
                      + {AppConstants.addCoach}
                    </Button>
                  </NavLink>
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <Button onClick={this.onExport} className="primary-add-comp-form" type="primary">
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
                  {liveScoreCompIsParent == true && (
                    <NavLink to="/matchDayCoachImport">
                      <Button className="primary-add-comp-form" type="primary">
                        <div className="row">
                          <div className="col-sm">
                            <img src={AppImages.import} alt="" className="export-image" />
                            {AppConstants.import}
                          </div>
                        </div>
                      </Button>
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 d-flex justify-content-end">
          <div className="comp-product-search-inp-width">
            <Input
              className="product-reg-search-input"
              onChange={this.onChangeSearchText}
              placeholder="Search..."
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
    );
  };

  // on Export
  onExport = () => {
    const { compOrgId, competitionId } = this.state;
    const liveScoreCompIsParent = checkLivScoreCompIsParent();

    const url =
      AppConstants.coachExport +
      `?roleId=17&entityTypeId=${liveScoreCompIsParent ? 1 : 6}&entityId=${
        liveScoreCompIsParent ? competitionId : compOrgId
      }`;
    this.props.userExportFilesAction(url, 'coach');
  };

  // on change search text
  onChangeSearchText = e => {
    // const { id } = JSON.parse(getLiveScoreCompetition())
    this.setState({ searchText: e.target.value, offset: 0 });
    let { sortBy, sortOrder, offset, compOrgId } = this.state;
    if (e.target.value == null || e.target.value === '') {
      let { pageSize } = this.props.liveScoreCoachState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreCoachListAction(
        17,
        compOrgId,
        e.target.value,
        offset,
        pageSize,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.competitionId,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    const code = e.keyCode || e.which;
    // const { id } = JSON.parse(getLiveScoreCompetition())
    let { sortBy, sortOrder, offset, compOrgId } = this.state;
    if (code === 13) {
      // 13 is the enter keycode
      let { pageSize } = this.props.liveScoreCoachState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreCoachListAction(
        17,
        compOrgId,
        e.target.value,
        offset,
        pageSize,
        sortBy,
        sortOrder,
        this.state.liveScoreCompIsParent,
        this.state.competitionId,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    // const { id } = JSON.parse(getLiveScoreCompetition())
    this.setState({ offset: 0 });
    if (this.state.searchText == null || this.state.searchText === '') {
    } else {
      // this.props.getTeamsWithPagging(this.state.conpetitionId, 0, 10, this.state.searchText)
      let { pageSize } = this.props.liveScoreCoachState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreCoachListAction(
        17,
        this.state.compOrgId,
        this.state.searchText,
        this.state.offset,
        pageSize,
        null,
        null,
        this.state.liveScoreCompIsParent,
        this.state.competitionId,
      );
    }
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'23'} />
        <Layout>
          {this.headerView()}

          <Content>{this.contentView()}</Content>

          {this.state.showDeleteCoachesModalWrapper ? (
            <LiveScoreDeleteCoachModal
              triggerModalVisibility={handleOnDeleteCoachClick}
              coachRecord={this.state.coachRecord}
              competitionId={this.state.competitionId}
              competitionDetails={{ ...this.state }}
              coachState={this.props.liveScoreCoachState}
            />
          ) : null}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreCoachListAction,
      getliveScoreTeams,
      userExportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreCoachState: state.LiveScoreCoachState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreCoaches);

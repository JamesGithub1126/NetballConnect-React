import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Table, Pagination, Input, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import scorerData from '../../mocks/managersList';
import AppImages from '../../themes/appImages';
import {
  liveScoreManagerListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreManagerAction';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import history from '../../util/history';
import { userExportFilesAction } from '../../store/actions/appAction';
import { teamListDataCheck } from '../../util/helpers';
import { checkLivScoreCompIsParent } from 'util/permissions';

const { Content } = Layout;
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
  let { pageSize } = _this.props.liveScoreManagerState;
  pageSize = pageSize ? pageSize : 10;
  _this.props.liveScoreManagerListAction(
    3,
    6,
    _this.state.competitionId,
    _this.state.searchText,
    _this.state.offset,
    sortBy,
    sortOrder,
    'managerList',
    _this.state.compOrgId,
    _this.state.liveScoreCompIsParent,
    pageSize,
  );
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

//// table columns
const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => {
      const { suspended } = record;

      return (
        <NavLink
          to={{
            // pathname: '/matchDayManagerView',
            // state: { tableRecord: record }
            pathname: '/userPersonal',
            state: { userId: record.id, screenKey: 'livescore', screen: '/matchDayManagerList' },
          }}
        >
          <span className="input-heading-add-another pt-0">
            <span className={suspended ? 'suspended' : ''}>
              {firstName}
            </span>
          </span>
        </NavLink>
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
        <NavLink
          to={{
            pathname: '/userPersonal',
            state: { userId: record.id, screenKey: 'livescore', screen: '/matchDayManagerList' },
            // pathname: '/matchDayManagerView',
            // state: { tableRecord: record }
          }}
        >
          <span className="input-heading-add-another pt-0">
            <span className={suspended? 'suspended-suffix' : ''}>{lastName}</span>
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
    key: 'Linked Entity',
    sorter: true,
    onHeaderCell: () => listeners('linkedEntity.name'),
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
            <div key={`managerName${i}` + item.entityId}>
              <NavLink
                to={{
                  pathname: '/matchDayTeamView',
                  state: { teamId: item.entityId, screenKey: 'livescore' },
                }}
              >
                <span
                  className="desc-text-style side-bar-profile-data theme-color pointer"
                >
                  {item.name}
                </span>
              </NavLink>
            </div>
          ) : (
            <span key={`managerName${i}` + item.entityId}>{item.name}</span>
          ),
        )}
      </div>
    ),
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'linkedEntity',
    key: 'Linked Entity Parent Name',
    sorter: true,
    onHeaderCell: () => listeners('linkedEntity.parentName'),
    render: linkedEntity => (
      <div>
        {linkedEntity.map((item, i) => (
          // teamListData(item.entityId) ?
          //     <NavLink to={{
          //         pathname: '/userPersonal',
          //         state: { userId: record.id, screenKey: "livescore" }
          //     }}>
          //         <span style={{ color: '#ff8237', cursor: 'pointer' }} className="desc-text-style side-bar-profile-data">{item.parentName}</span>
          //     </NavLink>
          //     :
          <span key={'linkedEntity' + i} className="desc-text-style side-bar-profile-data">
            {item.parentName}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: AppConstants.action,
    render: (data, record) => (
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
                pathname: '/matchDayAddManagers',
                state: { isEdit: true, tableRecord: record },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {/* <Menu.Item key="2">
                        <NavLink
                            to={{
                                pathname: "./matchDayAssignMatch",
                                state: { record }
                            }}
                        >
                            <span>Assign to match</span>
                        </NavLink>
                    </Menu.Item> */}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

class LiveScoreManagerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2020',
      scorerTableData: scorerData.scorerData,
      searchText: '',
      competitionId: null,
      offset: 0,
      sortBy: null,
      sortOrder: null,
      liveScoreCompIsParent: false,
    };

    _this = this;
  }

  componentDidMount() {
    let { managerListActionObject } = this.props.liveScoreManagerState;
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
      let { pageSize } = this.props.liveScoreManagerState;
      pageSize = pageSize ? pageSize : 10;
      if (managerListActionObject) {
        offset = managerListActionObject.offset;
        let searchText = managerListActionObject.searchText;
        let sortBy = managerListActionObject.sortBy;
        let sortOrder = managerListActionObject.sortOrder;
        this.setState({ offset, searchText, sortBy, sortOrder });
        this.props.liveScoreManagerListAction(
          3,
          6,
          id,
          searchText,
          offset,
          sortBy,
          sortOrder,
          'managerList',
          compOrgId,
          liveScoreCompIsParent,
          pageSize,
        );
      } else {
        this.props.liveScoreManagerListAction(
          3,
          6,
          id,
          this.state.searchText,
          offset,
          null,
          null,
          'managerList',
          compOrgId,
          liveScoreCompIsParent,
          pageSize,
        );
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  /// Handle Page change
  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScoreManagerState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    this.setState({
      offset,
    });
    this.props.liveScoreManagerListAction(
      3,
      6,
      this.state.competitionId,
      this.state.searchText,
      offset,
      this.state.sortBy,
      this.state.sortOrder,
      'managerList',
      this.state.compOrgId,
      this.state.liveScoreCompIsParent,
      pageSize,
    );
  };

  contentView = () => {
    const {
      managerListResult,
      currentPage,
      totalCount,
      pageSize,
      onLoad,
    } = this.props.liveScoreManagerState;
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={managerListResult}
            pagination={false}
            loading={onLoad}
            rowKey={record => 'managerListData' + record.id}
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

  // on Export
  onExport = () => {
    const { compOrgId } = this.state;
    const { id } = JSON.parse(getLiveScoreCompetition());
    const liveScoreCompIsParent = checkLivScoreCompIsParent();

    const url =
      AppConstants.managerExport +
      `?roleId=3&entityTypeId=${liveScoreCompIsParent ? 1 : 6}&entityId=${
        liveScoreCompIsParent ? id : compOrgId
      }`;
    this.props.userExportFilesAction(url, 'manager');
  };

  headerView = () => {
    const { liveScoreCompIsParent } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <span className="form-heading">{AppConstants.managersList}</span>
            </div>
            <div className="col-sm w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <NavLink to="/matchDayAddManagers" className="text-decoration-none">
                      <Button className="primary-add-comp-form" type="primary">
                        + {AppConstants.addManager}
                      </Button>
                    </NavLink>
                  </div>
                </div>
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      onClick={() => this.onExport()}
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
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    {liveScoreCompIsParent == true && (
                      <NavLink to={`/matchDayManagerImport`} className="text-decoration-none">
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
          {/* search box */}
          <div className="col-sm pt-5 ml-3 d-flex justify-content-end">
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
        </div>
      </div>
    );
  };

  // on change search text
  onChangeSearchText = e => {
    const { id } = JSON.parse(getLiveScoreCompetition());
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value == null || e.target.value === '') {
      // this.props.getTeamsWithPagination(this.state.conpetitionId, 0, 10, e.target.value)
      let { pageSize } = this.props.liveScoreManagerState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreManagerListAction(
        3,
        6,
        id,
        e.target.value,
        0,
        this.state.sortBy,
        this.state.sortOrder,
        'managerList',
        this.state.compOrgId,
        this.state.liveScoreCompIsParent,
        pageSize,
      );
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    var code = e.keyCode || e.which;
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (code === 13) {
      // 13 is the enter keycode
      // this.props.getTeamsWithPagination(this.state.conpetitionId, 0, 10, this.state.searchText)
      let { pageSize } = this.props.liveScoreManagerState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreManagerListAction(
        3,
        6,
        id,
        this.state.searchText,
        0,
        this.state.sortBy,
        this.state.sortOrder,
        'managerList',
        this.state.compOrgId,
        this.state.liveScoreCompIsParent,
        pageSize,
      );
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (this.state.searchText == null || this.state.searchText === '') {
    } else {
      // this.props.getTeamsWithPagination(this.state.conpetitionId, 0, 10, this.state.searchText)
      let { pageSize } = this.props.liveScoreManagerState;
      pageSize = pageSize ? pageSize : 10;
      this.props.liveScoreManagerListAction(
        3,
        6,
        id,
        this.state.searchText,
        0,
        this.state.sortBy,
        this.state.sortOrder,
        'managerList',
        this.state.compOrgId,
        this.state.liveScoreCompIsParent,
        pageSize,
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
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="4" />
        <Layout>
          {this.headerView()}
          <Content>{this.contentView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { liveScoreManagerListAction, userExportFilesAction, setPageSizeAction, setPageNumberAction },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreManagerState: state.LiveScoreManagerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreManagerList);

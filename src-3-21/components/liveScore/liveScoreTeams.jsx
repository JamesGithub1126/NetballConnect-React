import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Layout, Button, Table, Breadcrumb, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { getTeamsWithPagination } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import {
  getLiveScoreCompetition,
  // setOwnCompetitionYear,
  setOwn_competition,
  setGlobalYear,
} from '../../util/sessionStorage';
import history from '../../util/history';
import { exportFilesAction } from '../../store/actions/appAction';
import { isArrayNotEmpty, teamListData } from '../../util/helpers';
import { checkLivScoreCompIsParent } from 'util/permissions';

const { Content } = Layout;

let this_Obj = null;

// listeners for sorting
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

  this_Obj.props.getTeamsWithPagination(
    this_Obj.state.competitionId,
    this_Obj.state.offset,
    10,
    this_Obj.state.searchText,
    sortBy,
    sortOrder,
    this_Obj.state.compOrgId,
  );
}

const columns = [
  {
    title: AppConstants.logo,
    dataIndex: 'logoUrl',
    key: 'logoUrl',
    sorter: false,
    render: logoUrl =>
      logoUrl ? (
        <img style={{ height: 60, width: 80 }} src={logoUrl} alt="" />
      ) : (
        <span>{AppConstants.noImage}</span>
      ),
  },
  {
    title: AppConstants.teamName,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: () => listeners('teamName'),
    render: (name, record) =>
      teamListData(record.id) ? (
        <NavLink
          to={{
            pathname: '/matchDayTeamView',
            state: { tableRecord: record, screenName: 'fromTeamList' },
          }}
        >
          <span className="input-heading-add-another pt-0">{record.name}</span>
        </NavLink>
      ) : (
        <span>{name}</span>
      ),
  },
  {
    title: AppConstants.teamAliasName,
    dataIndex: 'alias',
    key: 'alias',
    sorter: true,
    onHeaderCell: () => listeners('teamAliasName'),
    render: alias => <span>{alias}</span>,
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'linkedCompetitionOrganisation',
    key: 'organisation',
    sorter: true,
    onHeaderCell: () => listeners('affiliate'),
    render: linkedCompetitionOrganisation => (
      <span>{linkedCompetitionOrganisation ? linkedCompetitionOrganisation.name : ''}</span>
    ),
  },
  // Affiliate
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    sorter: true,
    onHeaderCell: () => listeners('division'),
    render: division => <span>{division ? division.name : ''}</span>,
  },
  {
    title: AppConstants.players,
    dataIndex: 'playersCount',
    key: 'playersCount',
    sorter: true,
    onHeaderCell: () => listeners('players'),
    render: playersCount => <span>{playersCount}</span>,
  },
  {
    title: AppConstants.manager,
    dataIndex: 'managers',
    key: 'managers_1',
    sorter: true,
    onHeaderCell: () => listeners('manager'),
    render: managers => (
      <div>
        {isArrayNotEmpty(managers) &&
          managers.map((item, i) => (
            <span
              key={`managerName${i}` + item.id}
              className="desc-text-style side-bar-profile-data"
            >
              {item.name}
            </span>
          ))}
      </div>
    ),
  },
  {
    title: AppConstants.contact,
    dataIndex: 'managers',
    key: 'managers_2',
    sorter: true,
    onHeaderCell: () => listeners('contact'),
    render: managers => (
      <div>
        {isArrayNotEmpty(managers) &&
          managers.map((item, i) => (
            <span
              key={`managerMobile${i}` + item.id}
              className="desc-text-style side-bar-profile-data"
            >
              {item.mobileNumber}
            </span>
          ))}
      </div>
    ),
  },
  {
    title: AppConstants.email,
    dataIndex: 'managers',
    key: 'managers_3',
    sorter: true,
    onHeaderCell: () => listeners('email'),
    render: managers => (
      <div>
        {isArrayNotEmpty(managers) &&
          managers.map((item, index) => (
            <span
              key={`managerEmail${index}` + item.id}
              className="desc-text-style side-bar-profile-data"
            >
              {item.email}
            </span>
          ))}
      </div>
    ),
  },
];

class LiveScoreTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      searchText: '',
      offset: 0,
      sortBy: null,
      sortOrder: null,
      sourceIdAvailable: false,
      liveScoreCompIsParent: false,
      compOrgId: 0,
    };
    this_Obj = this;
  }

  componentDidMount() {
    this.setLivScoreCompIsParent();
    let { livescoreTeamActionObject } = this.props.liveScoreTeamState;
    if (getLiveScoreCompetition()) {
      const { id, sourceId, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      this.setState({ competitionId: id, sourceIdAvailable: sourceId ? true : false });
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
      if (id !== null) {
        if (livescoreTeamActionObject) {
          let offset = livescoreTeamActionObject.offset;
          let searchText = livescoreTeamActionObject.search;
          let sortBy = livescoreTeamActionObject.sortBy;
          let sortOrder = livescoreTeamActionObject.sortOrder;
          this.props.getTeamsWithPagination(
            id,
            offset,
            10,
            searchText,
            sortBy,
            sortOrder,
            compOrgId,
          );
          this.setState({ offset, searchText, sortBy, sortOrder });
        } else {
          this.props.getTeamsWithPagination(
            id,
            0,
            10,
            this.state.searchText,
            null,
            null,
            compOrgId,
          );
        }
        this.setState({ compOrgId });
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
  handlePageChange = page => {
    let offset = page ? 10 * (page - 1) : 0;
    this.props.getTeamsWithPagination(
      this.state.competitionId,
      offset,
      10,
      this.state.searchText,
      this.state.sortBy,
      this.state.sortOrder,
      this.state.compOrgId,
    );
    this.setState({ offset });
  };

  // on change search text
  onChangeSearchText = e => {
    if (e.target.value == null || e.target.value == '') {
      this.props.getTeamsWithPagination(
        this.state.competitionId,
        0,
        10,
        e.target.value,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.compOrgId,
      );
    }
    this.setState({ searchText: e.target.value, offset: 0 });
  };

  // search key
  onKeyEnterSearchText = e => {
    var code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      this.props.getTeamsWithPagination(
        this.state.competitionId,
        0,
        10,
        this.state.searchText,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.compOrgId,
      );
    }
    this.setState({ offset: 0 });
  };

  // on click of search icon
  onClickSearchIcon = () => {
    if (this.state.searchText == null || this.state.searchText == '') {
    } else {
      this.props.getTeamsWithPagination(
        this.state.competitionId,
        0,
        10,
        this.state.searchText,
        this.state.sortBy,
        this.state.sortOrder,
        this.state.compOrgId,
      );
    }
    this.setState({ offset: 0 });
  };

  // on Export
  onExport = () => {
    const { competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
    let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
    let url =
      AppConstants.teamExport +
      `${this.state.competitionId}&competitionOrganisationId=${compOrgId}`;
    this.props.exportFilesAction(url);
  };

  ///navigation to team grading summary if sourceId is not null
  teamGradingNavigation = () => {
    let yearRefId = localStorage.yearId;
    let compKey = null;
    if (getLiveScoreCompetition()) {
      const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
      compKey = uniqueKey;
    }
    // setOwnCompetitionYear(yearRefId);
    setGlobalYear(yearRefId);
    setOwn_competition(compKey);
    history.push('/competitionPartTeamGradeCalculate');
  };

  headerView = () => {
    let { sourceIdAvailable, liveScoreCompIsParent } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm pt-1 d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.teamList}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm-8 d-flex flex-row align-items-center justify-content-end w-100">
            <div className="row">
              {liveScoreCompIsParent == true && sourceIdAvailable && (
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      type="primary"
                      className="primary-add-comp-form"
                      onClick={() => this.teamGradingNavigation()}
                    >
                      {AppConstants.teamGrading}
                    </Button>
                  </div>
                </div>
              )}

              {liveScoreCompIsParent == true && !sourceIdAvailable && (
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <NavLink to="/matchDayAddTeam">
                      <Button className="primary-add-comp-form" type="primary">
                        + {AppConstants.addTeam}
                      </Button>
                    </NavLink>
                  </div>
                </div>
              )}

              <div className="col-sm pt-1">
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

              {liveScoreCompIsParent == true && !sourceIdAvailable && (
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <NavLink to="/matchDayTeamImport">
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
              )}
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
    );
  };

  ////////tableView view for Team list
  tableView = () => {
    const teamResult = this.props.liveScoreTeamState;
    const teamData = teamResult.teamResult;
    let total = teamResult.totalTeams;
    let teamCurrentPage = teamResult.teamCurrentPage;
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreTeamState.onLoad && true}
            className="home-dashboard-table"
            columns={columns}
            dataSource={teamData}
            pagination={false}
            rowKey={record => 'teamData' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={teamCurrentPage}
            total={total}
            onChange={this.handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  render() {
    // const { screenKey } = this.props.liveScoreTeamState

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="3" />

        <Layout>
          {this.headerView()}
          <Content>{this.tableView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getTeamsWithPagination, exportFilesAction }, dispatch);
}

function mapStateToProps(state) {
  return {
    liveScoreTeamState: state.LiveScoreTeamState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreTeam);

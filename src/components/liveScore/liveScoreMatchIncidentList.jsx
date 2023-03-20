import React, { Component } from 'react';
import { Layout, Button, Table, Breadcrumb, Pagination } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { NavLink } from 'react-router-dom';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { liveScoreIncidentList } from '../../store/actions/LiveScoreAction/liveScoreIncidentAction';
import { liveScore_formateDate } from '../../themes/dateformate';
import history from '../../util/history';
import { getCompetitionId, getLiveScoreCompetition } from '../../util/sessionStorage';

function getIncidentPlayer(incidentPlayers) {
  return incidentPlayers.length > 0 ? incidentPlayers[0].playerId : '';
}

function getFirstName(incidentPlayers) {
  return incidentPlayers.length > 0 ? incidentPlayers[0].player.firstName : '';
}

function getLastName(incidentPlayers) {
  return incidentPlayers.length > 0 ? incidentPlayers[0].player.lastName : '';
}

function checkSorting(a, b, key) {
  if (a[key] && b[key]) {
    return a[key].length - b[key].length;
  }
}

// function checkSorting2(a, b, key) {
//     if (a[key] && b[key]) {
//         return a[key].length - b[key].length
//     }
// }

const { Content } = Layout;

////columens data
const columns = [
  {
    title: AppConstants.date,
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: (a, b) => checkSorting(a, b, 'matchId'),
    render: (date, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">
          {liveScore_formateDate(date.startTime)}
        </span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: (a, b) => checkSorting(a, b, 'matchId'),
  },
  {
    title: AppConstants.playerId,
    dataIndex: 'incidentPlayers',
    key: 'incidentPlayers',
    //  sorter: (a, b) => sort(a, b, "playerId"),
    render: (incidentPlayers, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">{getIncidentPlayer(incidentPlayers)}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'incidentPlayers',
    key: 'incidentPlayers',
    sorter: (a, b) =>
      a.incidentPlayers.player.firstName.length - b.incidentPlayers.player.firstName.length,
    render: (incidentPlayers, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">{getFirstName(incidentPlayers)}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'incidentPlayers',
    key: 'incidentPlayers',
    // sorter: (a, b) => a.lastName.length - b.lastName.length,
    render: (incidentPlayers, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">{getLastName(incidentPlayers)}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.type,
    dataIndex: 'incidentType',
    key: 'incidentType',
    render: (incidentType, record) => (
      <NavLink
        to={{
          pathname: '/matchDayIncidentView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">{incidentType.name}</span>
      </NavLink>
    ),
    sorter: (a, b) => checkSorting(a, b, 'incidentType'),
  },
];

class LiveScoreIncidentList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { id } = JSON.parse(getLiveScoreCompetition());
    if (id !== null) {
      this.props.liveScoreIncidentList(id);
    } else {
      history.push('/');
    }
  }

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.incidents}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm d-flex justify-content-end w-100 flex-row align-items-center">
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  {/* <NavLink to="/matchDayAddIncident">
                                        <Button className="primary-add-comp-form" type="primary">
                                            + {AppConstants.addIncident}
                                        </Button>
                                    </NavLink> */}
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <Button className="primary-add-comp-form" type="primary">
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
                  <NavLink to="/matchDayMatchImport">
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
      </div>
    );
  };

  ////////tableView view for Umpire list
  tableView = () => {
    const { liveScoreIncidentState } = this.props;
    const DATA = liveScoreIncidentState.liveScoreIncidentResult;

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreIncidentState.onLoad && true}
            className="home-dashboard-table"
            columns={columns}
            dataSource={DATA}
            pagination={false}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              defaultCurrent={1}
              showSizeChanger={false}
              total={8}
              // onChange={this.handleTableChange}
            />
          </div>
        </div>
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
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={'17'} />
        <Layout>
          {this.headerView()}
          <Content>{this.tableView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ liveScoreIncidentList }, dispatch);
}

function mapStateToProps(state) {
  return {
    liveScoreIncidentState: state.LiveScoreIncidentState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreIncidentList);

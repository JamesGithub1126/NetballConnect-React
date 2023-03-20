import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Table, Pagination, Menu, Modal } from 'antd';

import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  getMainDivisionListAction,
  liveScoreDeleteDivision,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import {
  getLiveScoreCompetition,
  // setOwnCompetitionYear,
  setOwn_competition,
  setGlobalYear,
} from '../../util/sessionStorage';
import { isArrayNotEmpty } from '../../util/helpers';
import history from '../../util/history';
import { checkLivScoreCompIsParent } from '../../util/permissions';
import { isBasketball, isFootball } from '../liveScore/liveScoreSettings/liveScoreSettingsUtils';
const { Content } = Layout;
const { SubMenu } = Menu;
const { confirm } = Modal;

let this_Obj = null;
//// table columns
/////function to sort table column
function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  const { id } = JSON.parse(getLiveScoreCompetition());
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  this_Obj.setState({ sortBy, sortOrder });
  let { pageSize } = this_Obj.props.liveScoreDivisionState;
  pageSize = pageSize ? pageSize : 10;
  this_Obj.props.getMainDivisionListAction(id, this_Obj.state.offset, pageSize, sortBy, sortOrder);
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.grade,
    dataIndex: 'grade',
    key: 'grade',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.positionTracking,
    dataIndex: 'positionTracking',
    key: 'positionTracking',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (recordGoalAttempts, record) => {
      return <span>{this_Obj.checkValue(recordGoalAttempts)}</span>;
    },
  },
  {
    title: AppConstants.goalAttempts,
    dataIndex: 'recordGoalAttempts',
    key: 'recordGoalAttempts',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (recordGoalAttempts, record) => {
      return <span>{this_Obj.checkValue(recordGoalAttempts)}</span>;
    },
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
                pathname: '/matchDayAddDivision',
                state: { isEdit: true, tableRecord: record },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
          {!this_Obj.state.sourceIdAvailable && (
            <Menu.Item key="2" onClick={() => this_Obj.showDeleteConfirm(record.id)}>
              <span>Delete</span>
            </Menu.Item>
          )}
        </SubMenu>
      </Menu>
    ),
  },
];

const participateColumns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.grade,
    dataIndex: 'grade',
    key: 'grade',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.positionTracking,
    dataIndex: 'positionTracking',
    key: 'positionTracking',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (recordGoalAttempts, record) => {
      return <span>{this_Obj.checkValue(recordGoalAttempts)}</span>;
    },
  },
  {
    title: AppConstants.goalAttempts,
    dataIndex: 'recordGoalAttempts',
    key: 'recordGoalAttempts',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (recordGoalAttempts, record) => {
      return <span>{this_Obj.checkValue(recordGoalAttempts)}</span>;
    },
  },
];

const footbalColumns = [
  {
    title: AppConstants.positionTracking,
    dataIndex: 'positionTracking',
    key: 'positionTracking',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (positionTracking, record) => {
      return <span>{this_Obj.checkValue(positionTracking)}</span>;
    },
  },
  {
    title: AppConstants.recordGoalAttempts,
    dataIndex: 'recordGoalAttempts',
    key: 'recordGoalAttempts',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (recordGoalAttempts, record) => {
      return <span>{this_Obj.checkValue(recordGoalAttempts)}</span>;
    },
  },
  {
    title: AppConstants.playerRotationLabelText,
    dataIndex: 'gameTimeTracking',
    key: 'gameTimeTracking',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (gameTimeTracking, record) => {
      return <span>{this_Obj.checkPlayerRotationValue(gameTimeTracking)}</span>;
    },
  },

  // {
  //   title: AppConstants.enhancedStatistics,
  //   dataIndex: 'enhancedStatistics',
  //   key: 'enhancedStatistics',
  //   sorter: true,
  //   onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  //   render: (enhancedStatistics, record) => {
  //     return <span>{this_Obj.checkValue(enhancedStatistics)}</span>;
  //   },
  // },
];

class LiveScoreDivisionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2020',
      competitionId: null,
      offset: 0,
      liveScoreCompIsParent: false,
      sortBy: null,
      sortOrder: null,
      sourceIdAvailable: false,
    };
    this_Obj = this;
  }

  getTableColumns() {
    const mainColumns = [...columns];
    const partColumns = [...participateColumns];
    if (isFootball) {
      mainColumns.splice(3, 2, ...footbalColumns);
      partColumns.splice(3, 2, ...footbalColumns);
    } else if (isBasketball) {
      mainColumns.splice(3, 1);
      partColumns.splice(3, 1);
    }
    return this.state.liveScoreCompIsParent ? mainColumns : partColumns;
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { id, sourceId } = JSON.parse(getLiveScoreCompetition());
      this.setState({ competitionId: id, sourceIdAvailable: sourceId ? true : false });
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      this.setState({ liveScoreCompIsParent });
      let offset = 0;
      let { divisionListActionObject } = this.props.liveScoreDivisionState;
      let { pageSize } = this.props.liveScoreDivisionState;
      pageSize = pageSize ? pageSize : 10;
      if (divisionListActionObject) {
        let offset = divisionListActionObject.offset;
        let sortBy = divisionListActionObject.sortBy;
        let sortOrder = divisionListActionObject.sortOrder;
        this.setState({ offset, sortBy, sortOrder });
        this.props.getMainDivisionListAction(id, offset, pageSize, sortBy, sortOrder);
      } else {
        this.props.getMainDivisionListAction(id, offset, pageSize);
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  onPageChange = async page => {
    await this.props.setPageNumberAction(page);
    let { pageSize } = this.props.liveScoreDivisionState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    this.setState({ offset });
    this.props.getMainDivisionListAction(
      this.state.competitionId,
      offset,
      pageSize,
      this.state.sortBy,
      this.state.sortOrder,
    );
  };

  checkValue = data => {
    if (data) {
      return AppConstants.yes;
    } else if (data == false) {
      return AppConstants.no;
    } else {
      return AppConstants.asPerCompetitionText;
    }
  };

  footballDisplayValues = data => {
    if (data) {
      return AppConstants.substitution;
    } else if (data == false) {
      return AppConstants.interchange;
    } else {
      return AppConstants.asPerCompetitionText;
    }
  };

  checkPlayerRotationValue = data => {
    if (data === true) {
      return AppConstants.substitution;
    } else if (data === false) {
      return AppConstants.interchange;
    } else {
      return AppConstants.asPerCompetitionText;
    }
  };

  contentView = () => {
    const { mainDivisionList, totalCount, currentPage, pageSize, onLoad } =
      this.props.liveScoreDivisionState;
    let divisionList = isArrayNotEmpty(mainDivisionList) ? mainDivisionList : [];

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.getTableColumns()}
            dataSource={divisionList}
            pagination={false}
            loading={onLoad === true && true}
            rowKey={record => record.id}
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
              onChange={this.onPageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
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
    let { liveScoreCompIsParent, sourceIdAvailable } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <span className="form-heading">{AppConstants.divisionList}</span>
            </div>
            <div className="col-sm w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                {sourceIdAvailable && this.state.liveScoreCompIsParent && (
                  <div className="col-sm">
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

                {!sourceIdAvailable && (
                  <div className="col-sm">
                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                      {liveScoreCompIsParent && (
                        <NavLink to="/matchDayAddDivision" className="text-decoration-none">
                          <Button className="primary-add-comp-form" type="primary">
                            + {AppConstants.addDivision}
                          </Button>
                        </NavLink>
                      )}
                    </div>
                  </div>
                )}

                {!sourceIdAvailable && (
                  <div className="col-sm">
                    <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                      <NavLink to="/matchDayDivisionImport" className="text-decoration-none">
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
        </div>
      </div>
    );
  };

  deleteTeam = divisionId => {
    this.props.liveScoreDeleteDivision(divisionId);
  };

  showDeleteConfirm = divisionId => {
    let this_ = this;
    confirm({
      title: AppConstants.divisionDeleteConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteTeam(divisionId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="9" />
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
    {
      getMainDivisionListAction,
      liveScoreDeleteDivision,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDivisionState: state.LiveScoreDivisionState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreDivisionList);

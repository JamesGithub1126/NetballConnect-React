import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, Table, Typography, Select, Menu, Dropdown, Empty } from 'antd';
import Tooltip from 'react-png-tooltip';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getliveScoreDivisions } from '../../store/actions/LiveScoreAction/liveScoreActions';
import {
  liveScoreLaddersListAction,
  updateLadderSetting,
} from '../../store/actions/LiveScoreAction/liveScoreLadderAction';
import history from '../../util/history';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import { isArrayNotEmpty } from '../../util/helpers';
import { getLiveScoreDivisionList } from '../../store/actions/LiveScoreAction/liveScoreDivisionAction';
import { NavLink } from 'react-router-dom';
import { checkLivScoreCompIsParent } from '../../util/permissions';
import { exportBulkLadderAction } from 'store/actions/LiveScoreAction/liveScoreCompetitionAction';
import { getLadderReferenceListAction } from '../../store/actions/commonAction/commonAction';
import Loader from 'customComponents/loader';
import { DownOutlined } from '@ant-design/icons';
import AppImages from '../../themes/appImages';
const { Content } = Layout;
const { Option } = Select;
const { Paragraph } = Typography;

const hiddenLadderLocale = {
  emptyText: (
    <div>
      <Empty
        image={AppImages.workInProgress}
        description={<span>{AppConstants.compLadderHiddenMsg}</span>}
      ></Empty>
    </div>
  ),
};

/////function to sort table column
function tableSort(a, b, key) {
  //if (a[key] && b[key]) {
  if (key === 'name') {
    let stringA = JSON.stringify(a[key]);
    let stringB = JSON.stringify(b[key]);
    return stringA.localeCompare(stringB);
  } else {
    return Number(a[key]) - Number(b[key]);
  }
  //}
}

////Table columns
const columns = [
  {
    title: AppConstants.rank,
    dataIndex: 'rank',
    key: 'rank',
    sorter: (a, b) => tableSort(a, b, 'rank'),
  },
  {
    title: AppConstants.team,
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => tableSort(a, b, 'name'),
    render: (data, record) =>
      record.hasAdjustments ? <span className="required-field">{data}</span> : <span>{data}</span>,
  },
  {
    title: 'P',
    dataIndex: 'P',
    key: 'P',
    sorter: (a, b) => tableSort(a, b, 'P'),
  },
  {
    title: 'W',
    dataIndex: 'W',
    key: 'W',
    sorter: (a, b) => tableSort(a, b, 'W'),
  },
  {
    title: 'L',
    dataIndex: 'L',
    key: 'L',
    sorter: (a, b) => tableSort(a, b, 'L'),
  },
  {
    title: 'D',
    dataIndex: 'D',
    key: 'D',
    sorter: (a, b) => tableSort(a, b, 'D'),
  },
  {
    title: 'B',
    dataIndex: 'B',
    key: 'B',
    sorter: (a, b) => tableSort(a, b, 'B'),
  },
  {
    title: 'FW',
    dataIndex: 'FW',
    key: 'FW',
    sorter: (a, b) => tableSort(a, b, 'FW'),
  },
  {
    title: 'FL',
    dataIndex: 'FL',
    key: 'FL',
    sorter: (a, b) => tableSort(a, b, 'FL'),
  },
  {
    title: 'F',
    dataIndex: 'F',
    key: 'F',
    sorter: (a, b) => tableSort(a, b, 'F'),
  },
  {
    title: 'A',
    dataIndex: 'A',
    key: 'A',
    sorter: (a, b) => tableSort(a, b, 'A'),
  },
  {
    title: 'PTS',
    dataIndex: 'PTS',
    key: 'PTS',
    sorter: (a, b) => tableSort(a, b, 'PTS'),
  },
  {
    title: AppConstants.calc,
    dataIndex: 'rankingTieBreaker',
    key: 'rankingTieBreaker',
    sorter: (a, b) => tableSort(a, b, 'rankingTieBreaker'),
    render: value => <span>{Number(value).toFixed(2)}</span>,
  },
];

class LiveScoreLadderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      division: '11A',
      loadding: false,
      divisionId: null,
      liveScoreCompIsParent: false,
      viewFilter: AppConstants.publicLadder,
    };
  }

  headerView = () => {
    let { liveScoreCompIsParent } = this.state;
    const { id: compId } = JSON.parse(getLiveScoreCompetition());
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.competitionLadders}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {liveScoreCompIsParent && (
            <div className="col-sm d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Dropdown
                      className="primary-add-comp-form mr-3"
                      overlay={
                        <Menu>
                          <Menu.Item
                            key="1"
                            onClick={() => this.props.exportBulkLadderAction(compId, 'text')}
                          >
                            {AppConstants.text}
                          </Menu.Item>

                          <Menu.Item
                            key="2"
                            onClick={() => this.props.exportBulkLadderAction(compId, 'csv')}
                          >
                            {AppConstants.csv}
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button type="primary">
                        {AppConstants.export} <DownOutlined />
                      </Button>
                    </Dropdown>

                    <NavLink
                      to={{
                        pathname: '/matchDayLadderAdjustment',
                        state: { divisionId: this.state.divisionId },
                      }}
                    >
                      <Button className="primary-add-comp-form" type="primary">
                        {AppConstants.edit}
                      </Button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { id } = JSON.parse(getLiveScoreCompetition());
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      this.setState({ liveScoreCompIsParent });
      if (id !== null) {
        this.setState({ loadding: true });
        this.props.getLiveScoreDivisionList(id);
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.liveScoreLadderState.liveScoreLadderDivisionData !==
      this.props.liveScoreLadderState.liveScoreLadderDivisionData
    ) {
      if (this.state.loadding && this.props.liveScoreLadderState.onLoad == false) {
        const { id, uniqueKey } = JSON.parse(getLiveScoreCompetition());
        let divisionArray = this.props.liveScoreLadderState.liveScoreLadderDivisionData;
        let divisionId = isArrayNotEmpty(divisionArray) ? divisionArray[0].id : null;
        const isFullLadder = this.state.viewFilter === AppConstants.fullLadder ? true : false;
        this.props.liveScoreLaddersListAction(id, divisionId, uniqueKey, isFullLadder);
        this.props.getLadderReferenceListAction();
        this.props.updateLadderSetting({ data: divisionId, key: 'divisionId' });
        this.setState({ loadding: false, divisionId });
      }
    }
  }

  divisionChange = value => {
    // let competitionID = getCompetitionId()
    const { id, uniqueKey } = JSON.parse(getLiveScoreCompetition());
    this.props.updateLadderSetting({ data: value.division, key: 'divisionId' });
    const isFullLadder = this.state.viewFilter === AppConstants.fullLadder ? true : false;
    this.props.liveScoreLaddersListAction(id, value.division, uniqueKey, isFullLadder);
    this.setState({ divisionId: value.division });
  };

  viewChange = value => {
    this.setState({ viewFilter: value.view });
    const { id, uniqueKey } = JSON.parse(getLiveScoreCompetition());
    const isFullLadder = value.view === AppConstants.fullLadder ? true : false;
    this.props.liveScoreLaddersListAction(id, this.state.divisionId, uniqueKey, isFullLadder);
  };

  ladderTootltip = () => {
    return (
      <Paragraph>
        <ul>
          <li className="mt-2">
            <span>
              <strong>{AppConstants.publicLadder}</strong> - {AppConstants.publicLadderTooltip}
            </span>
          </li>
          <li className="mt-4">
            <span>
              <strong>{AppConstants.fullLadder}</strong> - {AppConstants.fullLadderTooltip}
            </span>
          </li>
        </ul>
      </Paragraph>
    );
  };

  ///dropdown view containing dropdown
  dropdownView = () => {
    const { liveScoreLadderState } = this.props;
    // let grade = liveScoreLadderState.liveScoreLadderDivisionData !== [] ? liveScoreLadderState.liveScoreLadderDivisionData : []
    let grade = isArrayNotEmpty(liveScoreLadderState.liveScoreLadderDivisionData)
      ? liveScoreLadderState.liveScoreLadderDivisionData
      : [];

    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="reg-filter-col-cont">
          {/* <span className="year-select-heading">{AppConstants.filterByDivision}:</span> */}
          {/* {grade.length > 0 && (
                        <Select
                            className="year-select reg-filter-select1 ml-2"
                            style={{ minWidth: 200 }}
                            onChange={(division) => this.divisionChange({ division })}
                            nowrap
                            defaultValue={grade[0].name}
                        >
                            {grade.map((item) => (
                                <Option key={'division_' + item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    )} */}

          <div className="w-ft d-flex flex-row align-items-center">
            <span className="year-select-heading">{AppConstants.division}:</span>
            {grade.length > 0 && (
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ minWidth: 140 }}
                onChange={division => this.divisionChange({ division })}
                nowrap
                defaultValue={grade[0].name}
              >
                {grade.map(item => (
                  <Option key={'division_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </div>
          <div className="w-ft d-flex flex-row align-items-center ml-5">
            <span className="year-select-heading">{AppConstants.view}:</span>
            <Select
              className="year-select reg-filter-select1 ml-2"
              style={{ minWidth: 140 }}
              onChange={view => this.viewChange({ view })}
              nowrap
              value={this.state.viewFilter}
            >
              <Option key="1" value={AppConstants.publicLadder}>
                {AppConstants.publicLadder}
              </Option>
              <Option key="2" value={AppConstants.fullLadder}>
                {AppConstants.fullLadder}
              </Option>
            </Select>
            <div className="mt-n20">
              <Tooltip placement="top">{this.ladderTootltip()}</Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const { liveScoreLadderState } = this.props;

    let DATA = liveScoreLadderState.liveScoreLadderListData;
    let adjData = liveScoreLadderState.liveScoreLadderAdjData;
    let isHidden = liveScoreLadderState.isLadderHidden;
    return (
      <div className="comp-dash-table-view" style={{ paddingBottom: 24 }}>
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreLadderState.onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={DATA}
            pagination={false}
            rowKey={record => 'ladderList' + record.rank}
            locale={isHidden ? hiddenLadderLocale : null}
          />
        </div>
        {/* <div className="d-flex justify-content-end">
                    <Pagination
                        className="antd-pagination"
                        defaultCurrent={1}
                        showSizeChanger={false}
                        total={8}
                        // onChange={this.handleTableChange}
                    />
                </div> */}
        <div className="comp-dash-table-view mt-4 ml-1">
          <div className="ladder-list-adjustment">
            {(adjData || []).map((x, index) => {
              let key = x.points >= '0' ? ' added ' : ' deducted ';
              let value = x.points >= 0 ? x.points : JSON.stringify(x.points);
              let newValue = value >= 0 ? value : value.replace('-', '');
              return (
                <div key={index} style={{ marginBottom: 10 }}>
                  <li className="required-field">
                    {x.teamName + key + newValue + ' points for ' + x.adjustmentReason}
                  </li>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  legendView = () => {
    const ladderListData = this.props.liveScoreLadderState.liveScoreLadderListData;
    if (ladderListData && ladderListData.length > 0) {
      const ladderCalculationTypeId = ladderListData[0]?.ladderCalculationTypeId;
      if (ladderCalculationTypeId) {
        const { ladderCalculationTypeList } = this.props.commonReducerState;
        const ladder = ladderCalculationTypeList.find(
          i => i.id === Number(ladderCalculationTypeId),
        );
        if (ladder) {
          return (
            <div className="comp-dash-table-view ml-1">
              {AppConstants.calc} = {ladder.description}
            </div>
          );
        }
      }
    }
    return <></>;
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <Loader visible={this.props.liveScoreCompetition.exportingBulkLadder} />
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="11" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
            {this.legendView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getliveScoreDivisions,
      liveScoreLaddersListAction,
      getLiveScoreDivisionList,
      updateLadderSetting,
      exportBulkLadderAction,
      getLadderReferenceListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreCompetition: state.liveScoreCompetition,
    liveScoreLadderState: state.LiveScoreLadderState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreLadderList);

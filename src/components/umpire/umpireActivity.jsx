import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Button, Table, Pagination, Select, DatePicker, Checkbox } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import {
  getUmpireActivityListAction,
  setPageNumberAction,
  setPageSizeAction,
} from '../../store/actions/umpireAction/umpireAction';
import { exportFilesAction } from 'store/actions/appAction';
import { umpireCompetitionListAction } from '../../store/actions/umpireAction/umpireCompetetionAction';
import { getAffiliatesListingAction } from 'store/actions/userAction/userAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  getOrganisationData,
  getLiveScoreCompetition,
  getGlobalYear,
  setCompDataForAll,
} from '../../util/sessionStorage';
import { checkLivScoreCompIsParent } from 'util/permissions';
import history from '../../util/history';
import { FLAVOUR } from '../../util/enums';
import { isEqual } from 'lodash';

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const columns = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    render: id => (
      <NavLink
        to={{
          pathname: '/matchDayMatchDetails',
          state: { matchId: id, umpireKey: 'umpire' },
        }}
      >
        <span className="input-heading-add-another pt-0">{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.startTime,
    dataIndex: 'startTime',
    key: 'Start Time',
    render: startTime => <span>{moment(startTime).format('DD/MM/YYYY HH:mm')}</span>,
  },
  {
    title: AppConstants.umpire,
    dataIndex: 'umpire',
    key: 'Umpire',
    render: umpire => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: {
            userId: umpire.id,
            screenKey: 'umpire',
            screen: '/umpireActivity',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">
          {umpire.firstName} {umpire.lastName}
        </span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.assignor,
    dataIndex: 'verifiedBy',
    key: 'verifiedBy',
  },
  {
    title: AppConstants.assignorOrganisation,
    dataIndex: 'verifiedByOrganisation',
    key: 'verifiedByOrganisation',
  },
  {
    title: AppConstants.verifiedScores,
    dataIndex: 'verifiedScores',
    key: 'verifiedScores',
    render: (verifiedScores, record) => (
      <span>{record.verifiedScores ? record.verifiedScores : ''}</span>
    ),
  },
  {
    title: AppConstants.verifiedActionLog,
    dataIndex: 'verifiedActionLogs',
    key: 'verifiedActionLogs',
    render: (verifiedActionLogs, record) => (
      <span>{record.verifiedActionLogs ? record.verifiedActionLogs : ''}</span>
    ),
  },
  {
    title: AppConstants.submittedSendOffReports,
    dataIndex: 'submittedSendOffReports',
    key: 'submittedSendOffReports',
  },
];

class UmpireActivity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offsetData: 0,
      competitionList: null,
      selectedComp: null,
      liveScoreCompIsParent: false,
      matchId: this.props.location.state ? this.props.location.state.matchId : null,
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      filterDates: false,
      affiliateList: [],
    };
  }

  async componentDidMount() {
    if (process.env.REACT_APP_FLAVOUR === FLAVOUR.Netball) {
      history.push('/homeDashboard');
    }
    const { organisationId, organisationUniqueKey } = getOrganisationData() || {};
    this.setState({ loading: true });
    if (organisationId)
      await this.props.umpireCompetitionListAction(null, null, organisationId, 'USERS');

    this.props.getAffiliatesListingAction({
      organisationId: organisationUniqueKey,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      paging: { limit: 10000, offset: 0 },
      stateOrganisations: true,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.umpireCompetitionState, this.props.umpireCompetitionState)) {
      if (this.state.loading && !this.props.umpireCompetitionState.onLoad) {
        const { umpireComptitionList } = this.props.umpireCompetitionState;
        const compListProps = isArrayNotEmpty(umpireComptitionList) ? umpireComptitionList : [];
        const competitionList = JSON.parse(JSON.stringify(compListProps));
        this.setState({ competitionList, loading: false });

        let compList =
          this.props.umpireCompetitionState.umpireComptitionList &&
          isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
            ? this.props.umpireCompetitionState.umpireComptitionList
            : [];
        const livescoresCompetition = getLiveScoreCompetition()
          ? JSON.parse(getLiveScoreCompetition())
          : null;
        const organisation = getOrganisationData();
        const organisationId = organisation?.organisationId ?? null;
        const globalYear = Number(getGlobalYear());
        const canUseExistingComp =
          !!livescoresCompetition?.id &&
          !!organisationId &&
          livescoresCompetition.yearRefId === globalYear &&
          [
            livescoresCompetition?.competitionOrganisation?.orgId,
            livescoresCompetition.organisationId,
          ].includes(organisationId);

        let competition = null;

        if (canUseExistingComp) {
          competition = compList.find(c => c.id === livescoresCompetition.id);
        }
        if (!competition) {
          //get the first comp in the list
          competition = compList && compList.length ? compList[0] : null;
        }
        const competitionId = competition?.id ?? null;

        setCompDataForAll(competition);

        if (competition) {
          const { competitionOrganisationId } = competition || {};
          const liveScoreCompIsParent = checkLivScoreCompIsParent();
          this.setState({ liveScoreCompIsParent });

          if (!this.state.selectedComp) {
            const body = {
              paging: {
                limit: 10,
                offset: this.state.offsetData,
                loading: false,
              },
            };
            this.setState({ selectedComp: competitionId });
            this.props.getUmpireActivityListAction({
              pageData: body,
              isOrganiser: liveScoreCompIsParent,
              competitionOrganisationId,
              competitionId: competitionId,
              startDate: this.state.startDate,
              endDate: this.state.endDate,
              filterDate: this.state.filterDates,
              matchId: this.state.matchId,
            });
          }
        }
      }
    }
    if (prevProps.userState != this.props.userState) {
      if (this.props.userState.onLoad == false) {
        const { affiliateList } = this.props.userState;
        let affiliates = affiliateList || [];
        affiliates.sort(function (a, b) {
          var nameA = a.name; // ignore upper and lowercase
          var nameB = b.name; // ignore upper and lowercase
          if (nameA) {
            nameA = nameA.trimStart();
          }
          if (nameB) {
            nameB = nameB.trimStart();
          }
          if (nameA > nameB) {
            return 1;
          } else if (nameA < nameB) {
            return -1;
          }

          // names must be equal
          return 0;
        });
        this.setState({ affiliateList: affiliates });
      }
    }
  }

  onExport = () => {
    const { selectedComp, liveScoreCompIsParent, filterDates, startDate, endDate } = this.state;
    const { competitionOrganisationId } = JSON.parse(getLiveScoreCompetition()) || {};
    let url = `${AppConstants.umpireActivityExport}?competitionId=${selectedComp}&isOrganiser=${liveScoreCompIsParent}`;
    if (competitionOrganisationId) {
      url += `&competitionOrganisationId=${competitionOrganisationId}`;
    }
    if (filterDates) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    this.props.exportFilesAction(url);
  };

  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);

    const { currentPageSizeUmpireActivity = 10 } = this.props.umpireState;
    let offsetData = page ? currentPageSizeUmpireActivity * (page - 1) : 0;
    this.setState({ offsetData });
    const { competitionOrganisationId } = JSON.parse(getLiveScoreCompetition()) || {};
    const { selectedComp } = this.state;

    const body = {
      paging: {
        limit: currentPageSizeUmpireActivity,
        offset: offsetData,
      },
    };

    this.props.getUmpireActivityListAction({
      pageData: body,
      competitionId: selectedComp,
      isOrganiser: this.state.liveScoreCompIsParent,
      competitionOrganisationId,
      matchId: this.state.matchId,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    });
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  onChangeComp = async competitionId => {
    const { competitionList } = this.state;

    const compObj = competitionList.find(comp => comp?.id === competitionId) || null;

    setCompDataForAll(compObj);

    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent, selectedComp: competitionId });

    const body = {
      paging: {
        limit: this.props.umpireState.currentPageSizeUmpireActivity,
        offset: this.state.offsetData,
      },
    };

    this.props.getUmpireActivityListAction({
      competitionId: competitionId,
      pageData: body,
      isOrganiser: liveScoreCompIsParent,
      competitionOrganisationId: compObj.competitionOrganisationId,
      matchId: this.state.matchId,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: this.state.filterDates,
    });
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.umpireActivity}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      // disabled={isCompetitionAvailable}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState({
        startDate,
        endDate,
      });

      const { competitionOrganisationId } = JSON.parse(getLiveScoreCompetition()) || {};
      const body = {
        paging: {
          limit: this.props.umpireState.currentPageSizeUmpireActivity,
          offset: 0,
        },
      };

      this.props.getUmpireActivityListAction({
        competitionId: this.state.selectedComp,
        pageData: body,
        isOrganiser: this.state.liveScoreCompIsParent,
        competitionOrganisationId,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        filterDate: this.state.filterDates,
      });
    }
  };

  onDateRangeCheck = val => {
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate });

    const { competitionOrganisationId } = JSON.parse(getLiveScoreCompetition()) || {};
    const body = {
      paging: {
        limit: this.props.umpireState.currentPageSizeUmpireActivity,
        offset: 0,
      },
    };

    this.props.getUmpireActivityListAction({
      competitionId: this.state.selectedComp,
      pageData: body,
      isOrganiser: this.state.liveScoreCompIsParent,
      competitionOrganisationId,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      filterDate: val,
    });
  };

  dropdownView = () => {
    const { competitionList, selectedComp } = this.state;

    const { affiliateList } = this.state;
    let affiliates = [];
    let org = getOrganisationData();
    if (org) {
      affiliates.push({ name: org.name, id: org.id });
    }
    const organisations = isArrayNotEmpty(affiliateList) ? affiliateList : affiliates;

    return (
      <div style={{ paddingLeft: '3.0%' }}>
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 200 }}
                  onChange={this.onChangeComp}
                  value={selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {!!competitionList &&
                    competitionList.map(item => (
                      <Option key={'competition_' + item.id} value={item.id}>
                        {item.longName}
                      </Option>
                    ))}
                </Select>
              </div>
            </div>
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <RangePicker
                  disabled={
                    this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true
                  }
                  onChange={date => this.onChangeStartDate(date)}
                  format="DD-MM-YYYY"
                  style={{ width: '100%', minWidth: 180 }}
                  value={[moment(this.state.startDate), moment(this.state.endDate)]}
                />
                <Checkbox
                  className="single-checkbox-radio-style"
                  style={{ minWidth: 150, marginLeft: 8 }}
                  checked={this.state.filterDates}
                  onChange={e => this.onDateRangeCheck(e.target.checked)}
                  disabled={this.state.firstTimeCompId == '-1'}
                  // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
                >
                  {AppConstants.filterDates}
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      umpireActivities,
      currentPageUmpireActivity,
      currentPageSizeUmpireActivity,
      umpireActivityTotalCount,
    } = this.props.umpireState;

    return (
      <div className="comp-dash-table-view mt-0">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.umpireState.onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={umpireActivities}
            pagination={false}
            // rowKey={record => 'umpireActivity' + record.id}
          />
        </div>
        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination"
              showSizeChanger
              current={currentPageUmpireActivity}
              defaultCurrent={currentPageUmpireActivity}
              defaultPageSize={currentPageSizeUmpireActivity}
              total={umpireActivityTotalCount}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="10" />
        <Layout>
          {this.headerView()}
          {this.dropdownView()}
          <Content>
            {/* {this.dropdownView()} */}
            {this.contentView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUmpireActivityListAction,
      exportFilesAction,
      setPageNumberAction,
      setPageSizeAction,
      umpireCompetitionListAction,
      getAffiliatesListingAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireState: state.UmpireState,
    umpireCompetitionState: state.UmpireCompetitionState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireActivity);

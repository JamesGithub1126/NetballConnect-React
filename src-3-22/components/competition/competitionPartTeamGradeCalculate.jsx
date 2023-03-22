import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Select,
  Tag,
  Modal,
  Tooltip,
  message,
  Radio,
  Popover,
} from 'antd';
import CustomTooltip from 'react-png-tooltip';

import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import AppUniqueId from 'themes/appUniqueId';
import history from 'util/history';
import {
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  setOwn_CompetitionFinalRefId,
  setGlobalYear,
  getGlobalYear,
  getLastTeamGradingPublishTime,
  setLastTeamGradingPublishTime,
} from 'util/sessionStorage';
import {
  getYearAndCompetitionOwnAction,
  clearYearCompetitionAction,
} from 'store/actions/appAction';
import {
  getTeamGradingSummaryAction,
  saveUpdatedGradeTeamSummaryAction,
  publishGradeTeamSummaryAction,
  onchangeTeamGradingSummaryData,
  clearTeamGradingReducerDataAction,
  exportFinalTeamsAction,
  exportFinalPlayersAction,
  getTeamGradingOrganisationsAction,
} from 'store/actions/competitionModuleAction/competitionTeamGradingAction';
import InputWithHead from 'customComponents/InputWithHead';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import './competition.css';
import AppColor from 'themes/appColor';
import ValidationConstants from '../../themes/validationConstant';
import { isNotNullOrEmptyString } from '../../util/helpers';

import { callDeleteDraws, callDeleteGrade } from 'util/drawHelper';
import { getDrawsRoundsAction } from 'store/actions/competitionModuleAction/competitionMultiDrawsAction';
import { SmallDashOutlined } from '@ant-design/icons';
const { Footer, Content } = Layout;
const { Option } = Select;

const clubColumns = [
  {
    title: AppConstants.organisation,
    dataIndex: 'organisationName',
    key: 'organisationName',
    width: '50%',
    render: (organisationName, record) => (
      <span
        style={{
          color: record.proposedTeamCount != record.totalTeamCount ? '#FF0000' : '#000000',
        }}
      >
        {organisationName}
      </span>
    ),
  },
  {
    title: AppConstants.proposedGrading,
    dataIndex: 'proposedGrading',
    key: 'proposedGrading',
    render: (value, record) => (
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          color: record.proposedTeamCount != record.totalTeamCount ? '#FF0000' : '#000000',
        }}
      >
        {record.proposedTeamCount}/{record.totalTeamCount}
      </span>
    ),
    width: '30%',
  },
  {
    title: AppConstants.unassignedPlayers,
    dataIndex: 'playerCount',
    key: 'playerCount',
    render: (playerCount, record) => (
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          color: record.proposedTeamCount != record.totalTeamCount ? '#FF0000' : '#000000',
        }}
      >
        {playerCount}
      </span>
    ),
    width: '20%',
  },
];

const columns = [
  {
    title: AppConstants.divisions,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: (a, b) => tableSort(a, b, 'divisionName'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusData',
    key: 'statusData',
    // sorter: (a, b) => tableSort(a, b, 'finalGradeOrganisationCount'),
    render: statusData => (
      <div>
        <span>{statusData}</span>
      </div>
    ),
  },
];

/////function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

class CompetitionPartTeamGradeCalculate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearRefId: null,
      count: 1,
      firstTimeCompId: '',
      getDataLoading: false,
      addGradeVisible: false,
      competitionDivisionGradeId: null,
      competitionMembershipProductDivisionId: null,
      updateGradeOnLoad: false,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      showPublishToLivescore: false,
      showButton: null,
      columns: [
        {
          title: AppConstants.divisions,
          dataIndex: 'divisionName',
          key: 'divisionName',
          sorter: (a, b) => tableSort(a, b, 'divisionName'),
        },
        {
          title: (
            <div>
              <span>{AppConstants.graded}</span>
              <CustomTooltip placement="top">
                <span>{AppConstants.gradedTooltip}</span>
              </CustomTooltip>
            </div>
          ),
          dataIndex: 'statusData',
          key: 'statusData',
          render: statusData => (
            <div>
              <Popover
                visible={this.state.showPopover}
                content={
                  <div>
                    <Table
                      columns={clubColumns}
                      dataSource={this.props.ownTeamGradingState.ownTeamGradingOrganisationsData}
                      pagination={false}
                      size={'small'}
                      style={{ minWidth: 1000 }}
                    />
                  </div>
                }
                placement="bottom"
                trigger="hover"
              >
                <span>{statusData}</span>
              </Popover>
            </div>
          ),
          // sorter: (a, b) => tableSort(a, b, 'finalGradeOrganisationCount')
        },
      ],
      nextButtonClicked: false,
      lastTeamGradingPublishTime: null,
      deleteDivModalVisible: false,
      deleteDrawsState: {
        actionRefId: 0,
        roundId: null,
        divisionGrade: null,
      },
      deleteLoading: false,
    };
    // this.props.clearYearCompetitionAction()
    this.props.clearTeamGradingReducerDataAction('ownTeamGradingSummaryGetData');
  }

  componentDidUpdate(nextProps) {
    if (nextProps.appState !== this.props.appState) {
      const competitionList = this.props.appState.own_CompetitionArr;
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          const storedCompetitionId = getOwn_competition();
          const competitionId =
            storedCompetitionId != undefined && storedCompetitionId !== 'undefined'
              ? storedCompetitionId
              : competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          let finalTypeRefId = competitionList[0].finalTypeRefId;
          if (storedCompetitionId != undefined && storedCompetitionId !== 'undefined') {
            const compIndex = competitionList.findIndex(x => x.competitionId == competitionId);
            if (compIndex > -1) {
              statusRefId = competitionList[compIndex].statusRefId;
              finalTypeRefId = competitionList[compIndex].finalTypeRefId;
            }
          }
          setOwn_competition(competitionId);
          setOwn_competitionStatus(statusRefId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          const yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          this.props.getTeamGradingSummaryAction(yearId, competitionId);
          this.props.getTeamGradingOrganisationsAction(competitionId);
          this.props.getDrawsRoundsAction(JSON.parse(yearId), competitionId);
          this.setState({
            getDataLoading: true,
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            yearRefId: JSON.parse(yearId),
          });
        }
      }
    }
    if (
      this.props.ownTeamGradingState.onLoad == false &&
      this.props.ownTeamGradingState.onSummaryLoad == false &&
      this.state.getDataLoading
    ) {
      let arr = this.props.ownTeamGradingState.finalsortOrderArray;
      this.addNewGrade(arr);
      this.setState({ getDataLoading: false });
    }

    if (this.props.ownTeamGradingState.updateGradeOnLoad == false && this.state.updateGradeOnLoad) {
      this.props.onchangeTeamGradingSummaryData(
        this.state.updateGradeName,
        this.state.competitionDivisionGradeId,
        'ownTeamGradingSummaryGetData',
      );
      this.setState({
        updateGradeOnLoad: false,
        updateGradeName: '',
        competitionMembershipProductDivisionId: null,
        competitionDivisionGradeId: null,
      });
    }
    if (
      this.props.ownTeamGradingState.onLoad === false &&
      this.props.ownTeamGradingState.onSummaryLoad === false &&
      this.state.nextButtonClicked === true
    ) {
      this.setState({
        nextButtonClicked: false,
      });
      history.push('/competitionCourtAndTimesAssign');
    }
  }

  componentDidMount() {
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    // let storedfinalTypeRefId = getOwn_CompetitionFinalRefId()
    let propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    let compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    if (storedCompetitionId && yearId && propsData && compData) {
      this.setState({
        yearRefId: JSON.parse(yearId),
        firstTimeCompId: storedCompetitionId,
        competitionStatus: storedCompetitionStatus,
        getDataLoading: true,
      });
      this.props.getTeamGradingSummaryAction(yearId, storedCompetitionId);
      this.props.getTeamGradingOrganisationsAction(storedCompetitionId);
    } else {
      if (yearId) {
        this.props.getYearAndCompetitionOwnAction(
          this.props.appState.own_YearArr,
          yearId,
          'own_competition',
        );
        this.setState({
          yearRefId: JSON.parse(yearId),
        });
      } else {
        this.props.getYearAndCompetitionOwnAction(
          this.props.appState.own_YearArr,
          null,
          'own_competition',
        );
      }
    }
  }

  ////publish the team grading summary data
  publishToApiCall = key => {
    this.setState({
      showPublishToLivescore: true,
      showButton: key,
    });
  };

  isGradeHasTeamRankingError = (grade = {}) => {
    return !grade.teamRanked && grade.gradeName && grade.gradeRefId !== -1;
  };
  showRemoveGradeModel = item => {
    this.state.deleteDrawsState.divisionGrade = item;
    this.setState({
      deleteDivModalVisible: true,
    });
  };
  handleDeleteGrade = async key => {
    let deleteDrawsState = this.state.deleteDrawsState;
    if (key === 'ok') {
      if (deleteDrawsState.actionRefId == 2 && !deleteDrawsState.roundId) {
        message.error(AppConstants.selectARound);
        return;
      }
      this.setState({ secondDeleteDivModalVisible: false, deleteLoading: true });
      let gradeId = deleteDrawsState.divisionGrade.competitionDivisionGradeId;
      if (deleteDrawsState.actionRefId == 2) {
        let drawPayload = {
          competitionUniqueKey: this.state.firstTimeCompId,
          roundId: deleteDrawsState.roundId,
          divisionId: null,
          divisionGradeIds: [gradeId],
        };
        await callDeleteDraws(drawPayload);
      }
      let payload = {
        competitionDivisionGradeId: gradeId,
      };
      await callDeleteGrade(payload);
      this.props.clearTeamGradingReducerDataAction('ownTeamGradingSummaryGetData');
      this.props.getTeamGradingSummaryAction(this.state.yearRefId, this.state.firstTimeCompId);
      this.props.getTeamGradingOrganisationsAction(this.state.firstTimeCompId);
      this.setState({ getDataLoading: true });
    }

    deleteDrawsState.actionRefId = 0;
    deleteDrawsState.roundId = null;
    deleteDrawsState.divisionGrade = null;
    this.setState({
      deleteDivModalVisible: false,
      secondDeleteDivModalVisible: false,
      deleteLoading: false,
    });
  };
  //////add new column in the table for grades
  addNewGrade = arr => {
    let columns1 = [...this.state.columns];
    columns1 = columns1.filter(col => col.title !== null);
    let disabledStatus = this.state.competitionStatus == 1;

    for (let i in arr) {
      let newColumn = {
        title: null,
        dataIndex: `grades${i}`,
        key: `grades${i}`,
        render: (grades, record) => {
          if (!grades) {
            return null;
          }
          return (
            <div
              className="w-ft h-100 d-flex flex-column justify-content-center"
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
            >
              <a className="pb-3 mb-auto mt-auto">
                <span className="year-select-heading" style={{ color: 'var(--app-color)' }}>
                  {grades.gradeName}
                </span>
                {this.isGradeHasTeamRankingError(grades) && (
                  <span style={{ color: AppColor.error }}> *</span>
                )}
              </a>
              {!disabledStatus ? (
                <div>
                  <NavLink
                    to={{
                      pathname: '/competitionProposedTeamGrading',
                      state: {
                        id: record.competitionMembershipProductDivisionId,
                        gradeRefId: grades.gradeRefId,
                      },
                    }}
                  >
                    {grades.teamCount !== null && (
                      <Tag className="comp-team-grading-tag  text-center tag-col" key={grades}>
                        {grades.teamCount}
                      </Tag>
                    )}
                  </NavLink>
                  {grades.teamCount == 0 && (
                    <span
                      className="app-color"
                      style={{ verticalAlign: 'middle' }}
                      onClick={() => this.showRemoveGradeModel(grades)}
                    >
                      <i className="fa fa-trash-o" aria-hidden="true" />
                    </span>
                  )}
                </div>
              ) : (
                grades.teamCount !== null && (
                  <Tag className="comp-team-grading-tag  text-center tag-col" key={grades}>
                    {grades.teamCount}
                  </Tag>
                )
              )}
            </div>
          );
        },
      };
      columns1.push(newColumn);
    }

    this.setState({
      columns: columns1,
    });
  };

  exportTeams = () => {
    this.props.exportFinalTeamsAction({
      competitionId: this.state.firstTimeCompId,
      yearRefId: this.state.yearRefId,
    });
  };

  exportPlayers = () => {
    this.props.exportFinalPlayersAction({
      competitionId: this.state.firstTimeCompId,
      yearRefId: this.state.yearRefId,
    });
  };

  headerView = () => {
    const disabledStatus = this.state.competitionStatus == 1;
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.teamGradingSummary}
              </Breadcrumb.Item>
            </Breadcrumb>
            <CustomTooltip placement="top">
              <span>{AppConstants.teamGradingSummaryMsg}</span>
            </CustomTooltip>
          </div>
          <div className="col-sm w-100 d-flex flex-row justify-content-end align-items-center mr-22">
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile">
                  <Button
                    id={AppUniqueId.teamGrading_ExportBtn}
                    type="primary"
                    className="primary-add-comp-form"
                    disabled={disabledStatus}
                    onClick={this.exportTeams}
                  >
                    <div className="row">
                      <div className="col-sm">
                        <img className="export-image" src={AppImages.export} alt="" />
                        {AppConstants.exportTeams}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile">
                  <Button
                    id={AppUniqueId.teamGrading_ExportPlayer}
                    type="primary"
                    className="primary-add-comp-form"
                    disabled={disabledStatus}
                    onClick={this.exportPlayers}
                  >
                    <div className="row">
                      <div className="col-sm">
                        <img className="export-image" src={AppImages.export} alt="" />
                        {AppConstants.exportPlayers}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onYearChange = yearId => {
    this.props.clearTeamGradingReducerDataAction('ownTeamGradingSummaryGetData');
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    setOwn_CompetitionFinalRefId(undefined);
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
    this.setState({ firstTimeCompId: null, yearRefId: yearId, competitionStatus: 0 });
    // this.setDetailsFieldValue();
  };

  // on Competition change
  onCompetitionChange(competitionId) {
    this.props.clearTeamGradingReducerDataAction('ownTeamGradingSummaryGetData');
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
    let statusRefId = own_CompetitionArr[statusIndex].statusRefId;
    let finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    setOwn_CompetitionFinalRefId(finalTypeRefId);
    this.props.getTeamGradingSummaryAction(this.state.yearRefId, competitionId);
    this.props.getTeamGradingOrganisationsAction(competitionId);
    this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
    this.setState({
      getDataLoading: true,
      firstTimeCompId: competitionId,
      competitionStatus: statusRefId,
      deleteDrawsState: {
        actionRefId: 0,
        roundId: null,
        divisionGrade: null,
      },
    });
  }

  dropdownView = () => {
    const { yearRefId, firstTimeCompId } = this.state;
    const { own_YearArr, own_CompetitionArr } = this.props.appState;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3">
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  id={AppUniqueId.teamGradingYear_dpdn}
                  name="yearRefId"
                  style={{ width: 90 }}
                  className="year-select reg-filter-select-year ml-2"
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={yearRefId}
                >
                  {own_YearArr.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-3 pb-3">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  id={AppUniqueId.teamGradingCompetition_dpdn}
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  value={JSON.parse(JSON.stringify(firstTimeCompId))}
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                >
                  {own_CompetitionArr.map(item => (
                    <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            {/* <div className="col-sm-5 d-flex justify-content-end">
                            <Button className="primary-add-comp-form" type="primary" onClick={this.addNewGrade}>
                                + {AppConstants.addGrade}
                            </Button>
                        </div> */}
          </div>
        </div>
      </div>
    );
  };

  handleOk = () => {
    if (isNotNullOrEmptyString(this.state.updateGradeName)) {
      let payload = {
        organisationId: 1,
        yearRefId: this.state.yearRefId,
        competitionUniqueKey: this.state.firstTimeCompId,
        grades: [
          {
            competitionMembershipProductDivisionId:
              this.state.competitionMembershipProductDivisionId,
            competitionDivisionGradeId: this.state.competitionDivisionGradeId,
            name: this.state.updateGradeName,
          },
        ],
      };
      this.props.saveUpdatedGradeTeamSummaryAction(payload);
      this.setState({
        addGradeVisible: false,
        updateGradeOnLoad: true,
      });
    } else {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseEnterGradeName);
    }
  };

  handleCancel = () => {
    this.setState({
      addGradeVisible: false,
      updateGradeName: '',
      competitionMembershipProductDivisionId: null,
      competitionDivisionGradeId: null,
    });
  };

  updateGradeName = (competitionDivisionGradeId, competitionMembershipProductDivisionId) => {
    this.setState({
      addGradeVisible: true,
      competitionDivisionGradeId,
      competitionMembershipProductDivisionId,
    });
  };

  contentView = () => {
    const { columns, addGradeVisible, updateGradeName, getDataLoading } = this.state;
    const { ownTeamGradingSummaryGetData } = this.props.ownTeamGradingState;
    const isTeamRankingHasError = ownTeamGradingSummaryGetData.find(team => {
      return !!team.grades.find(g => this.isGradeHasTeamRankingError(g));
    });
    let roundsData = [];
    if (this.props.drawsState.getDrawsRoundsData) {
      roundsData = this.props.drawsState.getDrawsRoundsData.slice(1);
    }
    let hasRounds = roundsData && roundsData.length > 0;
    let deleteDrawsState = this.state.deleteDrawsState;
    let hasDraw = deleteDrawsState.divisionGrade && deleteDrawsState.divisionGrade.drawCount > 0;
    hasRounds = hasRounds && hasDraw;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={ownTeamGradingSummaryGetData}
            pagination={false}
            loading={getDataLoading && true}
            bordered={true}
            size={'large'}
          />
        </div>

        <div className="warning-messages mt-4 mb-0">
          {isTeamRankingHasError && <p>* {AppConstants.teamRankingError}</p>}
        </div>

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.updateGradeName}
          visible={addGradeVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <InputWithHead
            required="required-field pt-0 mt-0"
            heading={AppConstants.gradeName}
            placeholder={AppConstants.pleaseEnterGradeName}
            onChange={e => this.setState({ updateGradeName: e.target.value })}
            value={updateGradeName}
          />
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.deleteGrade}
          visible={this.state.deleteDivModalVisible}
          onOk={() =>
            this.setState({ deleteDivModalVisible: false, secondDeleteDivModalVisible: true })
          }
          onCancel={() => this.handleDeleteGrade('cancel')}
        >
          <p>{AppConstants.deleteGradeMessage}</p>
          {hasRounds && (
            <>
              <p>{AppConstants.deleteDrawsForGrade}</p>
              <Radio.Group
                className="mb-3"
                onChange={e => {
                  deleteDrawsState.actionRefId = e.target.value;
                  this.setState({ updateUI: true });
                }}
                value={deleteDrawsState.actionRefId}
              >
                <Radio key={'actionRefId_1'} value={1}>
                  {AppConstants.no}
                </Radio>
                <Radio key={'actionRefId_2'} value={2}>
                  {AppConstants.yes}
                </Radio>
              </Radio.Group>
              {hasRounds && deleteDrawsState.actionRefId == 2 && (
                <>
                  <p>{AppConstants.fromWhichRound}</p>
                  <Select
                    className="year-select reg-filter-select1"
                    style={{ maxWidth: 150, minWidth: 150 }}
                    onChange={roundId => {
                      deleteDrawsState.roundId = roundId;
                      this.setState({ updateUI: true });
                    }}
                    value={deleteDrawsState.roundId}
                  >
                    {roundsData.map(item => (
                      <Option key={'round_' + item.roundId} value={item.roundId}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </>
              )}
            </>
          )}
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.deleteGrade}
          visible={this.state.secondDeleteDivModalVisible}
          onOk={() => this.handleDeleteGrade('ok')}
          onCancel={() => this.handleDeleteGrade('cancel')}
        >
          <p>{AppConstants.secondDeleteGradeMessage}</p>
        </Modal>
      </div>
    );
  };

  handlePublishToLivescore = key => {
    const { onLoad, onSummaryLoad } = this.props.ownTeamGradingState;
    if (onLoad || onSummaryLoad) {
      return;
    }

    if (key === 'yes') {
      if (this.state.showButton === 'next') {
        this.setState({
          nextButtonClicked: true,
        });
      }
      let now = new Date().getTime();
      let publishToLivescore = 0;
      let lastTeamGradingPublishTime = getLastTeamGradingPublishTime();
      if (lastTeamGradingPublishTime) {
        //can publish 1 minute later
        if (now - parseInt(lastTeamGradingPublishTime) > 60 * 1000) {
          publishToLivescore = 1;
        }
      } else {
        publishToLivescore = 1;
      }
      this.setState({
        showPublishToLivescore: false,
      });
      setLastTeamGradingPublishTime(now);

      this.props.publishGradeTeamSummaryAction(
        this.state.yearRefId,
        this.state.firstTimeCompId,
        publishToLivescore,
      );
    } else {
      let publishToLivescore = 0;
      this.props.publishGradeTeamSummaryAction(
        this.state.yearRefId,
        this.state.firstTimeCompId,
        publishToLivescore,
      );
      this.setState({ showPublishToLivescore: false });
      if (this.state.showButton === 'next') {
        this.setState({
          nextButtonClicked: true,
        });
      }
    }
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    const { tooltipVisibleDelete, showPublishToLivescore } = this.state;
    const isPublished = this.state.competitionStatus == 1;
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button">
              <NavLink to="/competitionPlayerGrades">
                <Button disabled={isPublished} className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.back}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Tooltip
                className="h-100"
                onMouseEnter={() =>
                  this.setState({
                    tooltipVisibleDelete: isPublished,
                  })
                }
                onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                visible={tooltipVisibleDelete}
                title={AppConstants.statusPublishHover}
              >
                <Button
                  id={AppUniqueId.teamGrading_PublishBtn}
                  type="primary"
                  className="publish-button save-draft-text"
                  disabled={isPublished}
                  onClick={() => this.publishToApiCall('submit')}
                  style={{
                    height: isPublished && '100%',
                    borderRadius: isPublished && 6,
                    width: isPublished && 'inherit',
                  }}
                >
                  {AppConstants.save}
                </Button>
              </Tooltip>
              {/* <NavLink id={AppUniqueId.teamGrading_NextBtn} to="/competitionCourtAndTimesAssign"> */}
              <Button
                id={AppUniqueId.teamGrading_NextBtn}
                type="primary"
                className="publish-button margin-top-disabled-button"
                disabled={isPublished}
                onClick={() => this.publishToApiCall('next')}
              >
                {AppConstants.next}
              </Button>
              {/* </NavLink> */}
            </div>
            <Modal
              title={AppConstants.finalGrading}
              className="add-membership-type-modal"
              visible={showPublishToLivescore}
              okText={AppConstants.yes}
              onOk={() => this.handlePublishToLivescore('yes')}
              cancelText={AppConstants.no}
              onCancel={() => this.handlePublishToLivescore('no')}
            >
              <div className="pre-str">{AppConstants.publishToLivescore}</div>
            </Modal>
          </div>
          {/* <div className="col-sm-1">
                        <div className="comp-buttons-view">
                        </div>
                    </div> */}
        </div>
      </div>
    );
  };

  render() {
    const { onLoad, onSummaryLoad } = this.props.ownTeamGradingState;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey="5" />
        <Loader visible={onLoad || onSummaryLoad || this.state.deleteLoading} />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getYearAndCompetitionOwnAction,
      getTeamGradingSummaryAction,
      saveUpdatedGradeTeamSummaryAction,
      publishGradeTeamSummaryAction,
      onchangeTeamGradingSummaryData,
      clearYearCompetitionAction,
      clearTeamGradingReducerDataAction,
      exportFinalTeamsAction,
      exportFinalPlayersAction,
      getDrawsRoundsAction,
      getTeamGradingOrganisationsAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    ownTeamGradingState: state.CompetitionOwnTeamGradingState,
    drawsState: state.CompetitionMultiDrawsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionPartTeamGradeCalculate);

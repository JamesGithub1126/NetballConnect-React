import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Select,
  Tag,
  Input,
  message,
  Tooltip,
  Menu,
  Modal,
} from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import CommentModal from '../../customComponents/commentModal';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { NavLink } from 'react-router-dom';
import history from '../../util/history';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getYearAndCompetitionOwnAction,
  clearYearCompetitionAction,
} from '../../store/actions/appAction';
import {
  getDivisionsListAction,
  clearReducerDataAction,
} from '../../store/actions/registrationAction/registration';
import {
  getCompOwnProposedTeamGradingAction,
  onchangeCompOwnFinalTeamGradingData,
  saveOwnFinalTeamGradingDataAction,
  clearTeamGradingReducerDataAction,
  getCompFinalGradesListAction,
  teamGradingCommentAction,
  changeHistoryHover,
  deleteTeamActionAction,
  changeDivisionTeamAction,
} from '../../store/actions/competitionModuleAction/competitionTeamGradingAction';
import { gradesReferenceListAction } from '../../store/actions/commonAction/commonAction';
import {
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  getGlobalYear,
  setGlobalYear,
} from '../../util/sessionStorage';
import ValidationConstants from '../../themes/validationConstant';
// import moment from "moment"
import {
  clearReducerCompPartPlayerGradingAction,
  commentListingAction,
} from '../../store/actions/competitionModuleAction/competitionPartPlayerGradingAction';
import AppUniqueId from '../../themes/appUniqueId';
import { compareSortOrder } from 'util/drawUtil';
// import { getCurrentYear } from "util/permissions"
const {
  // Header,
  Footer,
  Content,
} = Layout;
const { Option } = Select;
let this_obj = null;
const { SubMenu } = Menu;

/////for displaying  grade name on the basis of gradeRefId
function gradeName(proposedGradeRefId) {
  let gradeName = proposedGradeRefId;
  let GradeReferenceData = this_obj.props.ownTeamGradingState.getFinalGradesListData;
  let gradeNameIndex = GradeReferenceData.findIndex(x => x.gradeRefId == proposedGradeRefId);
  if (gradeNameIndex >= 0 && GradeReferenceData.length > 0) {
    gradeName = GradeReferenceData.length > 0 && GradeReferenceData[gradeNameIndex].name;
  }
  return gradeName == 0 ? '' : gradeName;
}

/////function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

const columns = [
  {
    title: AppConstants.team,
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    sorter: (a, b) => tableSort(a, b, 'sortOrder'),
    render: (sortOrder, record, index) => (
      // record.isDirectRegistration == 0 ? (
      //     <span >{sortOrder}</span>
      // ) : (
      //     <Select
      //         className="select-inside-team-grades-table"
      //         value={sortOrder}
      //         onChange={(e) => this_obj.props.onchangeCompOwnFinalTeamGradingData(e, index, "sortOrder")}
      //     >
      //     {this_obj.props.ownTeamGradingState.teamRanks.map((item) => (
      //         <Option key={'teamRank_' + item.id} value={item.id}>
      //             {item.id}
      //         </Option>
      //     ))}
      //     </Select>
      // )
      <span
        className={!record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null}
      >
        <Select
          className="select-inside-team-grades-table"
          value={sortOrder}
          disabled={this_obj.state.competitionStatus == 1}
          onChange={newSortOrder => {
            const targetedRecord =
              this_obj.props.ownTeamGradingState.getCompOwnProposedTeamGradingData[
                newSortOrder - 1
              ];
            if (targetedRecord && targetedRecord.teamId === -1) {
              // moving to a bye team position
              Modal.confirm({
                title: AppConstants.removeTheBye,
                okText: AppConstants.yes,
                okType: AppConstants.primary,
                cancelText: AppConstants.no,
                mask: true,
                onOk() {
                  this_obj.props.onchangeCompOwnFinalTeamGradingData(
                    newSortOrder,
                    record,
                    'sortOrder',
                  );
                  this_obj.props.onchangeCompOwnFinalTeamGradingData(
                    index,
                    targetedRecord,
                    'removeTeam',
                  );
                },
                onCancel() {
                  this_obj.props.onchangeCompOwnFinalTeamGradingData(
                    newSortOrder,
                    record,
                    'sortOrder',
                  );
                },
              });
            } else {
              this_obj.props.onchangeCompOwnFinalTeamGradingData(newSortOrder, record, 'sortOrder');
            }
          }}
        >
          {this_obj.props.ownTeamGradingState.teamRanks.map(item => (
            <Option key={'teamRank_' + item.id} value={item.id}>
              {item.id}
            </Option>
          ))}
        </Select>
      </span>
    ),
  },
  {
    title: AppConstants.teamName,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: (a, b) => tableSort(a, b, 'teamName'),
    render: (teamName, record, index) => (
      // record.isDirectRegistration == 0 ? (
      //     <span className={(!record.isActive && record.delIndicationMsg == undefined) ? "disabled-row" : null}>
      //         {teamName}
      //     </span>
      // ) : (
      //     <span className={(!record.isActive && record.delIndicationMsg == undefined) ? "disabled-row" : null}>
      //         <Input
      //             className="input-inside-team-grades-table"
      //             style={{ width: 230 }}
      //             onChange={e => this_obj.props.onchangeCompOwnFinalTeamGradingData(e.target.value, index, "teamName")}
      //             placeholder="Team Name"
      //             value={teamName}
      //         />
      //     </span>
      // )

      <span
        className={!record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null}
      >
        <Input
          className="input-inside-team-grades-table"
          style={{ width: 230 }}
          disabled={this_obj.state.competitionStatus == 1}
          onChange={e =>
            this_obj.props.onchangeCompOwnFinalTeamGradingData(e.target.value, record, 'teamName')
          }
          placeholder="Team Name"
          value={teamName}
        />
      </span>
    ),
  },
  {
    title: AppConstants.affiliateName,
    dataIndex: 'affiliateName',
    key: 'affiliateName',
    sorter: (a, b) => tableSort(a, b, 'affiliateName'),
    render: (affiliateName, record, index) =>
      record.isDirectRegistration == 0 && (
        <span
          className={
            !record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null
          }
        >
          {affiliateName}
        </span>
      ),
  },
  {
    title: AppConstants.history,
    dataIndex: 'playerHistory',
    key: 'playerHistory',
    render: (playerHistory, record, key) => (
      <span
        className={!record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null}
      >
        {playerHistory.map(
          (item, index) =>
            item.divisionGrade != null &&
            item.divisionGrade != '' &&
            this_obj.state.competitionStatus != 1 && (
              <Tooltip
                className="comp-player-table-tag2 h-100"
                onMouseEnter={() => this_obj.changeHover(item, key, index, true)}
                onMouseLeave={() => this_obj.changeHover(item, key, index, false)}
                visible={item.hoverVisible}
                title={item.playerName}
              >
                <NavLink
                  to={{
                    pathname: `/userPersonal`,
                    state: {
                      userId: item.userId,
                      screenKey: 'competitionProposedTeamGrading',
                      screen: '/competitionProposedTeamGrading',
                    },
                  }}
                >
                  <Tag className="comp-player-table-tag pointer" key={item.historyPlayerId + index}>
                    {item.divisionGrade != null && item.divisionGrade != ''
                      ? item.divisionGrade + '(' + item.ladderResult + ')'
                      : ''}
                  </Tag>
                </NavLink>
              </Tooltip>
            ),
        )}
      </span>
    ),
    sorter: (a, b) => tableSort(a, b, 'playerHistory'),
  },
  {
    title: () => this_obj.getTitle(AppConstants.proposedPool, AppConstants.proposedGrade),
    dataIndex: 'proposedGradeRefId',
    key: 'proposedGradeRefId',
    render: (proposedGradeRefId, record) =>
      record.isDirectRegistration == 0 && (
        <span
          className={
            !record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null
          }
        >
          {proposedGradeRefId > 0 ? gradeName(proposedGradeRefId) : ''}
        </span>
      ),
    sorter: (a, b) => tableSort(a, b, 'proposedGradeRefId'),
  },
  {
    title: () => this_obj.getTitle(AppConstants.finalisedPool, AppConstants.finalisedGrade),
    dataIndex: 'finalGradeId',
    key: 'finalGradeId',
    render: (finalGradeId, record, index) => (
      <span
        className={!record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : null}
      >
        {record.delIndicationMsg == '' ||
        record.delIndicationMsg == null ||
        record.delIndicationMsg == undefined ? (
          <Select
            className="select-inside-team-grades-table"
            value={finalGradeId}
            disabled={this_obj.state.competitionStatus == 1}
            onChange={finalGradeId =>
              this_obj.props.onchangeCompOwnFinalTeamGradingData(
                finalGradeId,
                record,
                'finalGradeId',
              )
            }
          >
            {this_obj.props.ownTeamGradingState.compFinalTeamGradingFinalGradesData.map(item => (
              <Option
                key={'compFinalTeamGradingFinalGrades_' + item.gradeRefId}
                value={item.gradeRefId}
              >
                {item.name}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{record.delIndicationMsg}</span>
        )}
      </span>
    ),
    sorter: (a, b) => tableSort(a, b, 'finalGradeId'),
  },
  {
    title: AppConstants.comments,
    dataIndex: 'responseComments',
    key: 'responseComments',
    width: 110,
    render: (responseComments, record) => {
      if (record.teamId !== -1) {
        return (
          <div
            className={`${
              !record.isActive && record.delIndicationMsg == undefined ? 'disabled-row' : ''
            } d-flex justify-content-center bg-none pointer`}
            onClick={() => this_obj.state.competitionStatus != 1 && this_obj.onClickComment(record)}
          >
            <img
              src={record.isCommentsAvailable == 1 ? AppImages.commentFilled : AppImages.commentEmpty}
              alt=""
              height="25"
              width="25"
            />
          </div>
        );
      }
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, e, index) => {
      const isByeTeam = e.teamId === -1;
      return (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <SubMenu
            key="sub1"
            disabled={this_obj.state.competitionStatus == 1}
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
            {this_obj.state.divisionId != null && e.isActive == 1 && (
              <Menu.Item
                key="1"
                onClick={() => {
                  if (isByeTeam) {
                    this_obj.props.onchangeCompOwnFinalTeamGradingData(index, e, 'removeTeam');
                  } else {
                    this_obj.showDeleteConfirm(e, 'IsActive', index);
                  }
                }}
              >
                <span>Delete</span>
              </Menu.Item>
            )}
            {!isByeTeam && this_obj.state.divisionId != null && e.isActive == 0 && (
              <Menu.Item key="2" onClick={() => this_obj.showDeleteConfirm(e, 'Undelete', index)}>
                <span>Undelete</span>
              </Menu.Item>
            )}

            {!isByeTeam && (
              <Menu.Item key="3" onClick={() => this_obj.onClickChangeDivision(e)}>
                <span>Change Division</span>
              </Menu.Item>
            )}
          </SubMenu>
        </Menu>
      );
    },
  },
];

class CompetitionProposedTeamGrading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceModule: 'FTG',
      yearRefId: null,
      divisionId: null,
      gradeRefId: null,
      firstTimeCompId: null,
      saveLoad: false,
      visible: false,
      comment: null,
      teamId: null,
      responseCommentsCreatedBy: null,
      responseCommentsCreatedOn: null,
      responseComments: null,
      comments: null,
      commentsCreatedOn: null,
      commentsCreatedBy: null,
      finalGradeId: null,
      proposedGradeID: 0,
      isDeleteModalVisible: false,
      actionType: '',
      loading: false,
      rowIndex: 0,
      changeDivisionModalVisible: false,
      divisionLoad: false,
      competitionDivisionId: null,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      finalTypeRefId: null,
    };
    this_obj = this;
    this.props.clearTeamGradingReducerDataAction('finalTeamGrading');
    this.props.clearYearCompetitionAction();
  }

  onClickComment(record) {
    this.props.commentListingAction(this.state.firstTimeCompId, record.teamId, '2');
    // this.props.commentListing(this.state.firstTimeCompId    )
    this.setState({
      visible: true,
      teamId: record.teamId,
      comments: '',
      finalGradeId: record.finalGradeId,
      comment: '',
    });
  }

  onClickChangeDivision = record => {
    this.setState({
      changeDivisionModalVisible: true,
      teamId: record.teamId,
    });
  };

  handleChangeDivision = key => {
    if (key === 'ok') {
      let payload = {
        competitionDivisionId: this.state.competitionDivisionId,
        teamId: this.state.teamId,
        competitionUniqueKey: this.state.firstTimeCompId,
        organisationUniqueKey: null,
      };
      this.props.changeDivisionTeamAction(payload);
      this.setState({ divisionLoad: true });
    }
    this.setState({
      changeDivisionModalVisible: false,
      teamId: null,
      divisionId: this.state.competitionDivisionId,
    });
  };

  changeHover(record, index, historyIndex, key) {
    this.props.changeHistoryHover(record, index, historyIndex, key);
  }

  getTitle(pool, grade) {
    if (this.state.finalTypeRefId == 2) {
      return pool;
    } else {
      return grade;
    }
  }

  handleOk = e => {
    // this.state.finalGradeId == null &&
    if (this.state.comment.length > 0) {
      this.props.teamGradingCommentAction(
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.state.divisionId,
        this.state.gradeRefId,
        this.state.teamId,
        this.state.comment,
      );
    }
    this.props.clearReducerCompPartPlayerGradingAction('commentList');

    this.setState({
      visible: false,
      finalGradeId: null,
      comment: '',
      teamId: null,
      proposedGradeID: 0,
    });
  };

  // model cancel for disappear a model
  handleCancel = e => {
    this.props.clearReducerCompPartPlayerGradingAction('commentList');
    this.setState({
      visible: false,
      comment: '',
      finalGradeId: null,
      teamId: null,
      proposedGradeID: 0,
    });
  };

  showDeleteConfirm = async (e, actionType, index) => {
    await this.setState({
      teamId: e.teamId,
      actionType: actionType,
      deleteModalVisible: true,
      rowIndex: index,
    });
  };

  handleDeleteTeamOk = () => {
    this.setState({ deleteModalVisible: false });
    let payload = {
      competitionUniqueKey: this.state.firstTimeCompId,
      organisationId: '',
      teamId: this.state.teamId,
      divisionId: this.state.divisionId,
      actionType: this.state.actionType,
    };
    this.props.deleteTeamActionAction(payload);
    this.setState({ loading: true });

    // this_obj.props.onchangeCompOwnFinalTeamGradingData(this.state.actionType, this.state.rowIndex, "actionType");
  };

  handleDeleteTeamCancel = () => {
    this.setState({ deleteModalVisible: false });
  };

  componentDidMount() {
    let divisionId = this.props.location.state ? this.props.location.state.id : null;
    let gradeRefId = this.props.location.state ? this.props.location.state.gradeRefId : null;
    this.setState({ divisionId, gradeRefId: gradeRefId });
    // this.props.gradesReferenceListAction()
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    let storedfinalTypeRefId = getOwn_CompetitionFinalRefId();
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
        finalTypeRefId: storedfinalTypeRefId,
        getDataLoading: true,
        compLoad: false,
      });
      this.props.getDivisionsListAction(yearId, storedCompetitionId, this.state.sourceModule);
      // this.props.getCompetitionWithTimeSlots(yearId, storedCompetitionId, 1, 6)
    } else {
      if (yearId) {
        this.props.getYearAndCompetitionOwnAction(
          this.props.appState.own_YearArr,
          yearId,
          'own_competition',
        );
        this.setState({
          yearRefId: JSON.parse(yearId),
          compLoad: true,
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

  componentDidUpdate(nextProps) {
    let competitionList = this.props.appState.own_CompetitionArr;
    let allDivisionsData = this.props.registrationState.allDivisionsData;
    let finalGradesListData = this.props.ownTeamGradingState.getFinalGradesListData;
    if (nextProps.appState !== this.props.appState) {
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          let finalTypeRefId = competitionList[0].finalTypeRefId;
          // let competitionId = this.state.firstTimeCompId !== null ? this.state.firstTimeCompId : competitionList[0].competitionId
          setOwn_competition(competitionId);
          setOwn_competitionStatus(statusRefId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          this.props.getDivisionsListAction(yearId, competitionId, this.state.sourceModule);
          this.setState({
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            finalTypeRefId: finalTypeRefId,
            compLoad: false,
            yearRefId: JSON.parse(yearId),
          });
        }
      }
    }
    if (nextProps.registrationState.allDivisionsData !== allDivisionsData) {
      if (allDivisionsData.length > 0) {
        //let divisionId = this.state.divisionId == null ? allDivisionsData[0].competitionMembershipProductDivisionId : this.state.divisionId
        let divisionId = this.state.divisionId;
        this.props.getCompFinalGradesListAction(
          this.state.yearRefId,
          this.state.firstTimeCompId,
          divisionId,
        );
        // this.props.getCompOwnProposedTeamGradingAction(this.state.yearRefId, this.state.firstTimeCompId, divisionId, gradeRefId)
        this.setState({ divisionId });
      }
    }

    if (nextProps.ownTeamGradingState.getFinalGradesListData !== finalGradesListData) {
      if (finalGradesListData.length > 0) {
        let gradeRefId =
          this.state.gradeRefId == null ? finalGradesListData[0].gradeRefId : this.state.gradeRefId;
        this.props.getCompOwnProposedTeamGradingAction(
          this.state.yearRefId,
          this.state.firstTimeCompId,
          this.state.divisionId,
          gradeRefId,
        );
        this.setState({ gradeRefId });
      }
    }

    if (this.props.ownTeamGradingState.onLoad === false && this.state.saveLoad === true) {
      this.setState({ saveLoad: false });
      history.push('/competitionPartTeamGradeCalculate');
    }

    if (nextProps.ownTeamGradingState != this.props.ownTeamGradingState) {
      if (this.props.ownTeamGradingState.onTeamDeleteLoad == false && this.state.loading === true) {
        this.setState({ loading: false });
        history.push('/competitionPartTeamGradeCalculate');
      }
    }

    if (nextProps.ownTeamGradingState != this.props.ownTeamGradingState) {
      if (
        this.props.ownTeamGradingState.onDivisionChangeLoad == false &&
        this.state.divisionLoad === true
      ) {
        this.setState({ divisionLoad: false });
        this.props.getCompFinalGradesListAction(
          this.state.yearRefId,
          this.state.firstTimeCompId,
          this.state.divisionId,
        );
      }
    }
  }

  ////save the final team grading data
  submitApiCall = buttonClicked => {
    let finalTeamGradingData = this.props.ownTeamGradingState.getCompOwnProposedTeamGradingData;
    let finalGrades = this.props.ownTeamGradingState.compFinalTeamGradingFinalGradesData;
    let isError = false;

    if (buttonClicked === 'submit') {
      finalTeamGradingData.forEach(item => {
        if (
          (item.finalGradeId == 0 ||
            item.finalGradeId == null ||
            item.finalGradeId == '' ||
            item.finalGradeId == undefined) &&
          item.actionType != 'IsActive'
        ) {
          isError = true;
        }
      });
    }

    if (!isError) {
      let newTeams = finalTeamGradingData.filter(x => x.finalGradeId == this.state.gradeRefId);
      if (newTeams.length > 0 && newTeams.length != finalTeamGradingData.length) {
        //team was regraded to other grade, sort current grade
        newTeams.sort(compareSortOrder);
        newTeams.forEach((x, index) => {
          x.sortOrder = index + 1;
        });
      }

      finalTeamGradingData.forEach(item => {
        let obj = finalGrades.find(x => x.gradeRefId == item.finalGradeId);
        item['finalGradeRefId'] = obj != undefined ? obj.id : null;
        item['gradeRefId'] = obj != undefined ? obj.gradeRefId : null;
        delete item['finalGradeId'];
      });
      let payload = {
        yearRefId: this.state.yearRefId,
        competitionUniqueKey: this.state.firstTimeCompId,
        divisionId: this.state.divisionId,
        gradeRefId: this.state.gradeRefId,
        teams: finalTeamGradingData,
      };
      this.props.saveOwnFinalTeamGradingDataAction(payload);
      this.setState({ saveLoad: true });
    } else {
      message.error(ValidationConstants.finalGrading[0]);
    }
  };

  cancelCall = () => {
    history.push('/competitionPartTeamGradeCalculate');
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {' '}
                {AppConstants.finalTeamGrading}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="flex-end ml-auto">
              <Button
                onClick={() => {
                  this.props.onchangeCompOwnFinalTeamGradingData(null, {
                    gradeRefId: this.state.gradeRefId || null,
                  }, 'addBye');
                }}
                className="ant-btn-primary"
              >
                {AppConstants.addBye}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onYearChange = yearId => {
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    setOwn_CompetitionFinalRefId(undefined);
    this.props.clearTeamGradingReducerDataAction('finalTeamGrading');
    this.props.clearReducerDataAction('allDivisionsData');
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      divisionId: null,
      gradeRefId: null,
      competitionStatus: 0,
      finalTypeRefId: null,
    });
  };

  // on Competition change
  onCompetitionChange = competitionId => {
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
    let statusRefId = own_CompetitionArr[statusIndex].statusRefId;
    let finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    setOwn_CompetitionFinalRefId(finalTypeRefId);
    this.props.clearTeamGradingReducerDataAction('finalTeamGrading');
    this.props.clearReducerDataAction('allDivisionsData');
    this.setState({
      firstTimeCompId: competitionId,
      divisionId: null,
      gradeRefId: null,
      competitionStatus: statusRefId,
      finalTypeRefId: finalTypeRefId,
    });
    this.props.getDivisionsListAction(this.state.yearRefId, competitionId, this.state.sourceModule);
  };
  /////on division change
  onDivisionChange = divisionId => {
    this.props.clearTeamGradingReducerDataAction('finalTeamGrading');
    this.props.getCompFinalGradesListAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      divisionId,
    );
    this.setState({ divisionId, gradeRefId: null });
  };

  ////on grade change
  onGradeChange = gradeRefId => {
    this.props.clearTeamGradingReducerDataAction('finalTeamGrading');
    this.props.getCompOwnProposedTeamGradingAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      this.state.divisionId,
      gradeRefId,
    );
    this.setState({ gradeRefId });
  };

  dropdownView = () => {
    let disableStatus = this.state.competitionStatus == 1;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select-year ml-2"
                  style={{ width: 90 }}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={this.state.yearRefId}
                >
                  {this.props.appState.own_YearArr.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm pb-3">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="year-select reg-filter-select-competition ml-2"
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                  value={this.state.firstTimeCompId}
                >
                  {this.props.appState.own_CompetitionArr.map(item => (
                    <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm pb-3">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.division}:</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ width: 160 }}
                  disabled={disableStatus}
                  onChange={divisionId => this.onDivisionChange(divisionId)}
                  value={JSON.parse(JSON.stringify(this.state.divisionId))}
                >
                  {this.props.registrationState.allDivisionsData.map(item => (
                    <Option
                      key={'compMemProdDiv_' + item.competitionMembershipProductDivisionId}
                      value={item.competitionMembershipProductDivisionId}
                    >
                      {item.divisionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm pb-3">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">
                  {this.getTitle(AppConstants.pool, AppConstants.grade)}:
                </span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ width: 160 }}
                  disabled={disableStatus}
                  onChange={gradeRefId => this.onGradeChange(gradeRefId)}
                  value={JSON.parse(JSON.stringify(this.state.gradeRefId))}
                >
                  {this.props.ownTeamGradingState.getFinalGradesListData.map(item => (
                    <Option key={'getFinalGrade_' + item.gradeRefId} value={item.gradeRefId}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            {/* <div className="col-sm d-flex justify-content-start align-items-center">
                            <span className="comp-grading-final-text ml-1">{AppConstants.final}</span>
                        </div> */}
            {/* <div className="col-sm d-flex justify-content-end align-items-center">
                            <Button className="primary-add-comp-form" type="primary"
                            // onClick={this.addNewGrade}
                            >
                                + {AppConstants.addGrade}
                            </Button>
                        </div> */}
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    let proposedTeamGradingData = this.props.ownTeamGradingState.getCompOwnProposedTeamGradingData;
    let divisionData = this.props.registrationState.allDivisionsData.filter(
      x => x.competitionMembershipProductDivisionId != null,
    );
    let commentList = this.props.partPlayerGradingState.playerCommentList;
    let commentLoad = this.props.partPlayerGradingState.commentLoad;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            // className={record => record.isActive == 0 ? "disabled-row" : "home-dashboard-table"}
            className="home-dashboard-table"
            columns={columns}
            dataSource={proposedTeamGradingData}
            pagination={false}
            loading={this.props.ownTeamGradingState.onLoad && true}
            rowClassName={record =>
              !record.isActive && record.delIndicationMsg != undefined && 'disabled-row'
            }
          />
        </div>
        <CommentModal
          visible={this.state.visible}
          modalTitle={AppConstants.add_edit_comment}
          onOk={() => this.handleOk()}
          onCancel={this.handleCancel}
          placeholder={AppConstants.addYourComment}
          onChange={e => this.setState({ comment: e.target.value })}
          value={this.state.comment}
          commentLoad={commentLoad}
          commentList={commentList}
          // owner={this.state.commentsCreatedBy}
          // OwnCreatedComment={this.state.commentsCreatedOn}
          // ownnerComment={this.state.comments}
          // affilate={this.state.responseCommentsCreatedBy}
          // affilateCreatedComment={this.state.responseCommentsCreatedOn}
          // affilateComment={this.state.responseComments}
          // finalGradeId={this.state.finalGradeId}
          // proposedGradeID={this.state.proposedGradeID}
        />

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.deleteTeam}
          visible={this.state.deleteModalVisible}
          onOk={this.handleDeleteTeamOk}
          onCancel={this.handleDeleteTeamCancel}
        >
          <p>
            Are you sure you want to {this.state.actionType == 'IsActive' ? 'delete' : 'Undelete'}?
          </p>
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.changeDivision}
          visible={this.state.changeDivisionModalVisible}
          onOk={() => this.handleChangeDivision('ok')}
          onCancel={() => this.handleChangeDivision('cancel')}
        >
          <div className="change-division-modal">
            <div className="year-select-heading">{AppConstants.division}</div>
            <Select
              style={{ minWidth: 120 }}
              className="year-select change-division-select"
              onChange={divisionId => this.setState({ competitionDivisionId: divisionId })}
              value={JSON.parse(JSON.stringify(this.state.competitionDivisionId))}
            >
              {divisionData.map(item => (
                <Option
                  key={'compMemProdDiv_' + item.competitionMembershipProductDivisionId}
                  value={item.competitionMembershipProductDivisionId}
                >
                  {item.divisionName}
                </Option>
              ))}
            </Select>
          </div>
        </Modal>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let isPublished = this.state.competitionStatus == 1;
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button">
              <Button
                className="cancelBtnWidth"
                type="cancel-button"
                onClick={() => this.cancelCall()}
              >
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          <div className="col-sm">
            {this.state.divisionId != null && (
              <div className="comp-buttons-view">
                <Button
                  id={AppUniqueId.finalteamgrad_save_bn}
                  className="publish-button save-draft-text"
                  disabled={isPublished}
                  onClick={() => this.submitApiCall('save')}
                  type="primary"
                >
                  {AppConstants.save}
                </Button>
                <Tooltip
                  className="h-100"
                  onMouseEnter={() =>
                    this.setState({
                      tooltipVisibleDelete: isPublished,
                    })
                  }
                  onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                  visible={this.state.tooltipVisibleDelete}
                  title={AppConstants.statusPublishHover}
                >
                  <Button
                    id={AppUniqueId.finalteamgrad_submit_bn}
                    className="publish-button margin-top-disabled-button"
                    disabled={isPublished}
                    style={{
                      height: isPublished && '100%',
                      borderRadius: isPublished && 6,
                      width: 'inherit',
                    }}
                    onClick={() => this.submitApiCall('submit')}
                    type="primary"
                  >
                    {AppConstants.submit}
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey="5" />
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
      getCompOwnProposedTeamGradingAction,
      getDivisionsListAction,
      gradesReferenceListAction,
      onchangeCompOwnFinalTeamGradingData,
      saveOwnFinalTeamGradingDataAction,
      clearTeamGradingReducerDataAction,
      clearReducerDataAction,
      clearYearCompetitionAction,
      getCompFinalGradesListAction,
      teamGradingCommentAction,
      changeHistoryHover,
      deleteTeamActionAction,
      changeDivisionTeamAction,
      clearReducerCompPartPlayerGradingAction,
      commentListingAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    ownTeamGradingState: state.CompetitionOwnTeamGradingState,
    registrationState: state.RegistrationState,
    commonReducerState: state.CommonReducerState,
    partPlayerGradingState: state.CompetitionPartPlayerGradingState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionProposedTeamGrading);

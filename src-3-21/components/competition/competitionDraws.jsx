import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Spin,
  Button,
  message,
  Modal,
  Menu,
  Tooltip,
  DatePicker,
  Checkbox,
} from 'antd';
// import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { NavLink } from 'react-router-dom';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { connect } from 'react-redux';
import AppImages from '../../themes/appImages';
import { bindActionCreators } from 'redux';
import DrawsPublishModel from '../../customComponents/drawsPublishModel';
import {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDraws,
  saveDraws,
  getCompetitionVenue,
  updateCourtTimingsDrawsAction,
  clearDraws,
  publishDraws,
  matchesListDrawsAction,
  unlockDrawsAction,
  getActiveRoundsAction,
  changeDrawsDateRangeAction,
} from '../../store/actions/competitionModuleAction/competitionDrawsAction';
import Swappable from '../../customComponents/SwappableComponent';
import { getDayName, getTime } from '../../themes/dateformate';
import { getYearAndCompetitionOwnAction, getVenuesTypeAction } from '../../store/actions/appAction';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import {
  setLiveScoreUmpireCompition,
  setLiveScoreUmpireCompitionData,
} from '../../util/sessionStorage';
import {
  setOwn_competition,
  getOwn_competition,
  setDraws_venue,
  setDraws_round,
  setDraws_roundTime,
  getDraws_venue,
  getDraws_round,
  getDraws_roundTime,
  setDraws_division_grade,
  getDraws_division_grade,
  getOrganisationData,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getGlobalYear,
  setGlobalYear,
} from '../../util/sessionStorage';
import ValidationConstants from '../../themes/validationConstant';
import moment from 'moment';
import LegendComponent from '../../customComponents/legendComponent';
import AllLegendComponent from '../../customComponents/allCompetitionLegendComponent';
// import { isArrayNotEmpty } from '../../util/helpers';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import AppUniqueId from '../../themes/appUniqueId';
import DrawConstant from 'themes/drawConstant';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const { SubMenu } = Menu;
const { RangePicker } = DatePicker;

class CompetitionDraws extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: 1,
      firstTimeCompId: '',
      venueId: '',
      roundId: '',
      venueLoad: false,
      roundTime: null,
      competitionDivisionGradeId: '',
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      updateLoad: false,
      organisation_Id: '-1',
      visible: false,
      value: 2,
      publishPartModel: {
        isShowPart: true,
        publishPart: {
          isShowDivision: false,
          isShowRound: false,
        },
      },
      selectedDivisions: null,
      selectedRounds: null,
      roundLoad: false,
      drawGenerateModalVisible: false,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      changeStatus: false,
      generateRoundId: null,
      publishModalVisible: false,
      selectedDateRange: null,
      startDate: null,
      endDate: null,
      changeDateLoad: false,
      dateRangeCheck: false,
    };
    this.props.clearDraws();
  }

  componentDidUpdate(nextProps) {
    // let userState = this.props.userState
    let competitionModuleState = this.props.competitionModuleState;
    let drawsRoundData = this.props.drawsState.getDrawsRoundsData;

    // let drawOrganisations = this.props.drawsState.drawOrganisations
    let venueData = this.props.drawsState.competitionVenues;
    let divisionGradeNameList = this.props.drawsState.divisionGradeNameList;
    let changeStatus = this.props.drawsState.changeStatus;

    if (this.state.venueLoad && this.props.drawsState.updateLoad == false) {
      if (nextProps.drawsState.getDrawsRoundsData !== drawsRoundData) {
        if (venueData.length > 0) {
          let venueId =
            this.state.firstTimeCompId == -1 || this.state.dateRangeCheck
              ? this.state.venueId
              : venueData[0].id;
          setDraws_venue(venueId);
          if (this.state.firstTimeCompId != '-1' && !this.state.dateRangeCheck) {
            if (drawsRoundData.length > 0) {
              let roundId = null;
              let roundTime = null;
              // let currentDate = this.state.dateRangeCheck ? moment(new Date()).format("YYYY-MM-DD") : null;
              if (drawsRoundData.length > 1) {
                roundId = drawsRoundData[1].roundId;
                setDraws_round(roundId);
                roundTime = drawsRoundData[1].startDateTime;
                setDraws_roundTime(roundTime);
                this.props.getCompetitionDrawsAction(
                  this.state.yearRefId,
                  this.state.firstTimeCompId,
                  venueId,
                  roundId,
                  null,
                  null,
                  null,
                  this.state.dateRangeCheck,
                );
                this.setState({
                  roundId,
                  roundTime,
                  venueId,
                  venueLoad: false,
                  //startDate: currentDate, endDate: currentDate
                });
              } else {
                roundId = drawsRoundData[0].roundId;
                setDraws_round(roundId);
                roundTime = drawsRoundData[0].startDateTime;
                setDraws_roundTime(roundTime);
                this.props.getCompetitionDrawsAction(
                  this.state.yearRefId,
                  this.state.firstTimeCompId,
                  venueId,
                  roundId,
                  null,
                  null,
                  null,
                  this.state.dateRangeCheck,
                );
                this.setState({
                  roundId,
                  roundTime,
                  venueId,
                  venueLoad: false,
                  //startDate: currentDate, endDate: currentDate
                });
              }
            } else {
              this.setState({
                venueId,
                venueLoad: false,
              });
            }
          } else if (this.state.changeDateLoad == false) {
            let NullDate = new Date();
            // if (this.props.drawsState.allcompetitionDateRange.length > 0) {
            // let dateRangeData = this.props.drawsState.allcompetitionDateRange
            // let selectedDateRange = dateRangeData[0].displayRange
            let startDate =
              this.state.startDate == null
                ? moment(NullDate).format('YYYY-MM-DD')
                : this.state.startDate;
            let endDate =
              this.state.endDate == null
                ? moment(NullDate).format('YYYY-MM-DD')
                : this.state.endDate;
            this.setState({
              startDate,
              endDate,
              venueId,
            });
            this.props.getCompetitionDrawsAction(
              this.state.yearRefId,
              this.state.firstTimeCompId,
              venueId,
              0,
              null,
              startDate,
              endDate,
              this.state.dateRangeCheck,
            );
            // }
          } else {
            this.setState({
              venueId,
              changeDateLoad: false,
            });
            this.props.getCompetitionDrawsAction(
              this.state.yearRefId,
              this.state.firstTimeCompId,
              venueId,
              0,
              null,
              this.state.startDate,
              this.state.endDate,
              this.state.dateRangeCheck,
            );
          }
        }
        if (divisionGradeNameList.length > 0) {
          let competitionDivisionGradeId = divisionGradeNameList[0].competitionDivisionGradeId;
          setDraws_division_grade(competitionDivisionGradeId);
          this.setState({ competitionDivisionGradeId });
        }
      }
    }
    if (nextProps.appState !== this.props.appState) {
      let competitionList = this.props.appState.own_CompetitionArr;
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          setOwn_competitionStatus(statusRefId);
          this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
          setOwn_competition(competitionId);
          this.setState({
            firstTimeCompId: competitionId,
            venueLoad: true,
            competitionStatus: statusRefId,
          });
        }
      }
    }

    if (nextProps.competitionModuleState != competitionModuleState) {
      if (competitionModuleState.drawGenerateLoad == false && this.state.venueLoad === true) {
        this.setState({ venueLoad: false });
        if (competitionModuleState.status == 5) {
          message.error(ValidationConstants.drawsMessage[0]);
        } else if (!competitionModuleState.error && competitionModuleState.status == 1) {
          this.props.clearDraws('rounds');
          this.setState({
            firstTimeCompId: this.state.firstTimeCompId,
            roundId: null,
            venueId: null,
            roundTime: null,
            venueLoad: true,
            competitionDivisionGradeId: null,
          });
          // this.props.getCompetitionVenue(competitionId);
          this.props.getDrawsRoundsAction(this.state.yearRefId, this.state.firstTimeCompId);
        }
      }
    }

    if (nextProps.drawsState.changeStatus != changeStatus) {
      if (this.props.drawsState.changeStatus == false && this.state.changeStatus) {
        let statusRefId = this.props.drawsState.publishStatus;
        setOwn_competitionStatus(statusRefId);
        message.success('Draws published to Match Day successfully');
        this.setState({ changeStatus: false, competitionStatus: statusRefId });

        if (this.props.drawsState.teamNames != null && this.props.drawsState.teamNames != '') {
          this.setState({ publishModalVisible: true });
        }
      }
    }
    if (this.state.roundLoad && this.props.drawsState.onActRndLoad == false) {
      this.setState({ roundLoad: false });
      if (
        this.props.drawsState.activeDrawsRoundsData != null &&
        this.props.drawsState.activeDrawsRoundsData.length > 0
      ) {
        this.setState({ drawGenerateModalVisible: true });
      } else {
        this.state.publishPartModel.isShowPart = false;
        this.callGenerateDraw();
        // message.config({ duration: 0.9, maxCount: 1 });
        // message.info(AppConstants.roundsNotAvailable);
      }
    }

    // if (nextProps.drawsState.drawOrganisations != drawOrganisations) {
    //   if (drawOrganisations.length > 0) {
    //     let organisation_Id = drawOrganisations[0].organisationUniqueKey;
    //     this.setState({ organisation_Id })
    //   }
    // }
  }

  componentDidMount() {
    loadjs('assets/js/custom.js');
    this.apiCalls();
  }

  apiCalls() {
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    let propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    let compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    let venueId = getDraws_venue();
    let roundId = getDraws_round();
    let roundTime = getDraws_roundTime();
    let roundData =
      this.props.drawsState.getDrawsRoundsData.length > 0
        ? this.props.drawsState.getDrawsRoundsData
        : undefined;
    let venueData =
      this.props.drawsState.competitionVenues.length > 0
        ? this.props.drawsState.competitionVenues
        : undefined;
    let competitionDivisionGradeId = getDraws_division_grade();
    if (storedCompetitionId && yearId && propsData && compData) {
      this.setState({
        yearRefId: JSON.parse(yearId),
        firstTimeCompId: storedCompetitionId,
        competitionStatus: storedCompetitionStatus,
        venueLoad: true,
      });
      if (venueId && roundId && roundData && venueData) {
        this.props.getCompetitionDrawsAction(
          yearId,
          storedCompetitionId,
          venueId,
          roundId,
          null,
          null,
          null,
          this.state.dateRangeCheck,
        );

        this.setState({
          venueId: JSON.parse(venueId),
          roundId: JSON.parse(roundId),
          roundTime: roundTime,
          competitionDivisionGradeId: JSON.parse(competitionDivisionGradeId),
          venueLoad: false,
        });
      } else {
        this.props.getDrawsRoundsAction(yearId, storedCompetitionId);
      }
    } else if (yearId) {
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

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  getColumnData = (indexArray, drawData) => {
    let yIndex = indexArray[1];
    // let drawData = this.props.drawsState.getStaticDrawsData;
    let object = null;

    for (let i in drawData) {
      let slot = drawData[i].slotsArray[yIndex];
      if (slot.drawsId !== null) {
        object = slot;
        break;
      }
    }
    return object;
  };

  ///////update the competition draws on  swapping and hitting update Apis if one has N/A(null)
  updateCompetitionNullDraws = (
    sourceObejct,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawData,
    round_Id,
  ) => {
    let updatedKey =
      this.state.firstTimeCompId === '-1' || this.state.dateRangeCheck ? 'all' : 'add';
    let postData = null;
    if (sourceObejct.drawsId == null) {
      let columnObject = this.getColumnData(sourceIndexArray, drawData);
      postData = {
        drawsId: targetObject.drawsId,
        venueCourtId: sourceObejct.venueCourtId,
        matchDate: moment(columnObject.matchDate).format(DrawConstant.dateFormat),
        startTime: columnObject.startTime,
        endTime: columnObject.endTime,
      };
    } else {
      let columnObject = this.getColumnData(targetIndexArray, drawData);
      postData = {
        drawsId: sourceObejct.drawsId,
        venueCourtId: targetObject.venueCourtId,
        matchDate: moment(columnObject.matchDate).format(DrawConstant.dateFormat),
        startTime: columnObject.startTime,
        endTime: columnObject.endTime,
      };
    }
    let apiData = {
      yearRefId: this.state.yearRefId,
      competitionId: this.state.firstTimeCompId,
      venueId: this.state.venueId,
      roundId:
        this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? 0 : this.state.roundId,
      orgId: null,
      startDate:
        this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck
          ? this.state.startDate
          : null,
      endDate:
        this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? this.state.endDate : null,
    };

    this.props.updateCourtTimingsDrawsAction(
      postData,
      sourceIndexArray,
      targetIndexArray,
      updatedKey,
      round_Id,
      apiData,
      this.state.dateRangeCheck,
    );

    this.setState({ updateLoad: true });
  };

  ///////update the competition draws on  swapping and hitting update Apis if both has value
  updateCompetitionDraws = (
    sourceObejct,
    targetObject,
    sourceIndexArray,
    targetIndexArray,
    drawsData,
    round_Id,
  ) => {
    let key = this.state.firstTimeCompId === '-1' || this.state.dateRangeCheck ? 'all' : 'add';
    let customSourceObject = {
      // drawsId: sourceObejct.drawsId,
      drawsId: targetObject.drawsId,
      homeTeamId: sourceObejct.homeTeamId,
      homeTeamName: sourceObejct.homeTeamName,
      awayTeamId: sourceObejct.awayTeamId,
      awayTeamName: sourceObejct.awayTeamName,
      competitionDivisionGradeId: sourceObejct.competitionDivisionGradeId,
      isLocked: 1,
    };
    let customTargetObject = {
      drawsId: sourceObejct.drawsId,
      homeTeamId: targetObject.homeTeamId,
      homeTeamName: targetObject.homeTeamName,
      awayTeamId: targetObject.awayTeamId,
      awayTeamName: targetObject.awayTeamName,
      competitionDivisionGradeId: targetObject.competitionDivisionGradeId,
      isLocked: 1,
    };
    let postObject = {
      draws: [customSourceObject, customTargetObject],
    };

    this.props.updateCompetitionDraws(
      postObject,
      sourceIndexArray,
      targetIndexArray,
      key,
      round_Id,
    );

    this.setState({ updateLoad: true });
  };

  check = () => {
    if (this.state.firstTimeCompId == null || this.state.firstTimeCompId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectCompetition);
    } else if (this.state.venueId == null && this.state.venueId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectVenue);
    } else {
      this.setState({ visible: true });
      //this.props.publishDraws(this.state.firstTimeCompId);
    }
  };

  openModel = (props, e) => {
    let this_ = this;
    confirm({
      title: AppConstants.proceedConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      maskClosable: true,
      mask: true,
      onOk() {
        this_.check();
      },
      onCancel() {
        console.log('cancel');
      },
    });
  };

  onSwap(source, target, drawData, round_Id) {
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
      return;
    }
    // let drawData = this.props.drawsState.getStaticDrawsData;
    let sourceObejct = drawData[sourceXIndex].slotsArray[sourceYIndex];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];
    if (sourceObejct.drawsId !== null && targetObject.drawsId !== null) {
      this.updateCompetitionDraws(
        sourceObejct,
        targetObject,
        sourceIndexArray,
        targetIndexArray,
        drawData,
        round_Id,
      );
    } else if (sourceObejct.drawsId == null && targetObject.drawsId == null) {
    } else {
      this.updateCompetitionNullDraws(
        sourceObejct,
        targetObject,
        sourceIndexArray,
        targetIndexArray,
        drawData,
        round_Id,
      );
    }
  }

  onMatchesList = () => {
    this.props.matchesListDrawsAction(this.state.firstTimeCompId);
  };

  headerView = () => (
    <Header className="comp-draws-header-view mt-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb className="d-flex align-items-center align-self-center">
            <Breadcrumb.Item className="breadcrumb-add"> {AppConstants.draws}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <div className="col-sm align-self-center">
        <div className="comp-dashboard-botton-view-mobile d-flex w-100 justify-content-end">
          <Button
            disabled={this.state.competitionStatus == 1}
            id={AppUniqueId.matchList_Btn}
            onClick={() => this.onMatchesList()}
            className="primary-add-comp-form"
            type="primary"
          >
            <div className="row">
              <div className="col-sm">
                <img src={AppImages.export} alt="" className="export-image" />
                {AppConstants.matchesList}
              </div>
            </div>
          </Button>
        </div>
      </div>
    </Header>
  );

  onchangeOrganisation = organisation_Id => {
    this.setState({
      organisation_Id,
    });
  };

  onYearChange = yearId => {
    this.props.clearDraws('rounds');
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      roundId: null,
      roundTime: null,
      venueId: null,
      competitionDivisionGradeId: null,
      organisation_Id: '-1',
      competitionStatus: 0,
    });
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
  };

  // on Competition change
  onCompetitionChange(competitionId, statusRefId) {
    this.props.clearDraws('rounds');
    if (competitionId == -1) {
      this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId, 'all');
      this.setState({ dateRangeCheck: true });
    } else {
      setOwn_competition(competitionId);
      setOwn_competitionStatus(statusRefId);
      this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
    }

    this.setState({
      firstTimeCompId: competitionId,
      roundId: 0,
      venueId: competitionId == -1 ? this.state.venueId : null,
      roundTime: null,
      venueLoad: true,
      competitionDivisionGradeId: null,
      competitionStatus: statusRefId,
      organisation_Id: '-1',
      selectedDateRange: null,
      // startDate: null,
      // endDate: null
    });
  }

  onDateRangeCheck = val => {
    this.props.clearDraws();
    let startDate = val ? moment(new Date()).format('YYYY-MM-DD') : null;
    let endDate = val ? moment(new Date()).format('YYYY-MM-DD') : null;
    this.props.getCompetitionDrawsAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      this.state.venueId,
      this.state.roundId,
      null,
      startDate,
      endDate,
      val,
    );
    this.setState({ dateRangeCheck: val, startDate: startDate, endDate: endDate });
  };

  // on DivisionGradeNameChange
  onDivisionGradeNameChange(competitionDivisionGradeId) {
    setDraws_division_grade(competitionDivisionGradeId);
    this.setState({ competitionDivisionGradeId });
  }

  dropdownView = () => {
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <div className="align-items-center d-flex justify-content-between flex-wrap">
        <div className="pb-3">
          <div className="w-100 d-flex flex-row align-items-center">
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
        <div className="pb-3">
          <div className="d-flex">
            <div className="w-ft d-flex flex-row align-items-center">
              <span className="year-select-heading">{AppConstants.competition}:</span>
              <Select
                id={AppUniqueId.draw_comp_dpdn}
                // style={{ minWidth: 200 }}
                name="competition"
                className="reg-filter-select-competition ml-2"
                onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
              >
                {this.props.appState.own_CompetitionArr.length > 0 && (
                  <Option key="-1" value="-1">
                    {AppConstants.all}
                  </Option>
                )}
                {this.props.appState.own_CompetitionArr.map(item => (
                  <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                    {item.competitionName}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="w-ft d-flex flex-row align-items-center" style={{ marginLeft: 10 }}>
              <Checkbox
                className="year-select-heading"
                disabled={this.state.firstTimeCompId == -1}
                onChange={e => this.onDateRangeCheck(e.target.checked)}
                checked={this.state.dateRangeCheck}
              >
                Date Range
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="pb-3">
          <div className="w-100 d-flex flex-row align-items-center">
            <span className="year-select-heading">{AppConstants.division}:</span>
            <Select
              id={AppUniqueId.division_dpdn}
              style={{ minWidth: 160 }}
              name="competition"
              disabled={disabledStatus}
              className="year-select reg-filter-select1 ml-2"
              onChange={competitionDivisionGradeId =>
                this.onDivisionGradeNameChange(competitionDivisionGradeId)
              }
              value={JSON.parse(JSON.stringify(this.state.competitionDivisionGradeId))}
            >
              {this.props.drawsState.divisionGradeNameList.map(item => (
                <Option
                  key={'compDivGrade_' + item.competitionDivisionGradeId}
                  value={item.competitionDivisionGradeId}
                >
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        <div className="pb-3">
          <div className="w-100 d-flex flex-row align-items-center">
            <span className="year-select-heading">{AppConstants.organisation}:</span>
            <Select
              disabled={disabledStatus}
              id={AppUniqueId.organisation_dpdn}
              style={{ minWidth: 160 }}
              name="competition"
              className="year-select reg-filter-select1 ml-2"
              onChange={oragnisationId => this.onchangeOrganisation(oragnisationId)}
              value={this.state.organisation_Id}
            >
              <Option key="-1" value="-1">
                {AppConstants.all}
              </Option>
              {this.props.drawsState.drawOrganisations.map(item => (
                <Option
                  key={'organisation_' + item.organisationUniqueKey}
                  value={item.organisationUniqueKey}
                >
                  {item.organisationName}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    );
  };

  ////////on venue change
  onVenueChange = venueId => {
    this.setState({ venueId });
    setDraws_venue(venueId);
    this.props.clearDraws();
    this.props.getCompetitionDrawsAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      venueId,
      this.state.roundId,
      this.state.organisation_Id,
      this.state.startDate,
      this.state.endDate,
      this.state.dateRangeCheck,
    );
  };

  //////onRoundsChange
  onRoundsChange = roundId => {
    let roundData = this.props.drawsState.getDrawsRoundsData;
    this.props.clearDraws();
    let matchRoundData = roundData.findIndex(x => x.roundId == roundId);
    let roundTime = roundData[matchRoundData].startDateTime;
    // this.props.dateSelection(roundId)
    this.setState({ roundId, roundTime });
    setDraws_round(roundId);
    setDraws_roundTime(roundTime);
    this.props.getCompetitionDrawsAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      this.state.venueId,
      roundId,
      this.state.organisation_Id,
      null,
      null,
      this.state.dateRangeCheck,
    );
  };

  reGenerateDraw = () => {
    let competitionStatus = getOwn_competitionStatus();
    if (competitionStatus == 2) {
      this.props.getActiveRoundsAction(this.state.yearRefId, this.state.firstTimeCompId);
      this.setState({ roundLoad: true });
    } else {
      this.callGenerateDraw();
    }
  };

  handleGenerateDrawModal = key => {
    if (key === 'ok') {
      if (this.state.generateRoundId != null) {
        this.callGenerateDraw();
        this.setState({ drawGenerateModalVisible: false });
      } else {
        message.error('Please select round');
      }
    } else {
      this.setState({ drawGenerateModalVisible: false });
    }
  };

  callGenerateDraw = () => {
    let payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: this.state.firstTimeCompId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      roundId: this.state.generateRoundId,
    };
    this.props.generateDrawAction(payload);
    this.setState({ venueLoad: true });
  };

  handlePublishModal = key => {
    if (key === 'ok') {
      let competitiondata = this.props.drawsState.liveScoreCompetiton;
      localStorage.setItem('LiveScoreCompetition', JSON.stringify(competitiondata));
      localStorage.removeItem('stateWideMessage');
      setLiveScoreUmpireCompition(competitiondata.id);
      setLiveScoreUmpireCompitionData(JSON.stringify(competitiondata));
      history.push('/matchDayLadderList');
    }
    this.setState({ publishModalVisible: false });
  };

  //unlockDraws
  unlockDraws(id, round_Id, venueCourtId) {
    let key =
      this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? 'all' : 'singleCompetition';
    this.props.unlockDrawsAction(id, round_Id, venueCourtId, key);
  }

  onChangeRadio = e => {
    this.setState({
      value: e.target.value,
    });
    if (e.target.value == 2) {
      this.state.publishPartModel.isShowPart = true;
      this.setState({
        publishPartModel: this.state.publishPartModel,
      });
    } else {
      this.state.publishPartModel.isShowPart = false;
    }
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
    this.state.publishPartModel.publishPart.isShowRound = false;
    this.state.publishPartModel.publishPart.isShowDivision = false;
    this.state.publishPartModel.isShowPart = true;
    this.state.value = 2;
  };

  checkDivision = e => {
    if (e.target.checked) {
      this.state.publishPartModel.publishPart.isShowDivision = true;
    } else {
      this.state.publishPartModel.publishPart.isShowDivision = false;
      this.onSelectDivisionsValues(null);
    }
    this.setState({
      publishPart: this.state.publishPartModel.publishPart,
    });
  };

  checkRound = e => {
    if (e.target.checked) {
      this.state.publishPartModel.publishPart.isShowRound = true;
    } else {
      this.state.publishPartModel.publishPart.isShowRound = false;
      this.onSelectRoundValues(null);
    }
    this.setState({
      publishPart: this.state.publishPartModel.publishPart,
    });
  };

  onSelectDivisionsValues = e => {
    this.setState({ selectedDivisions: e });
  };

  onSelectRoundValues = e => {
    this.setState({ selectedRounds: e });
  };

  publishDraw = () => {
    let payload = {
      isPartial: this.state.publishPartModel.isShowPart,
      divisions: [],
      rounds: [],
    };
    if (this.state.publishPartModel.isShowPart) {
      payload.divisions = this.state.selectedDivisions;
      payload.rounds = this.state.selectedRounds;
    }
    this.props.publishDraws(this.state.firstTimeCompId, '', payload);
    this.setState({ visible: false, changeStatus: true });
  };

  onChangeStartDate = date => {
    // this.props.clearDraws()
    // this.props.changeDrawsDateRangeAction(this.state.yearRefId, this.state.firstTimeCompId, startDate, this.state.endDate)
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState({
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  applyDateFilter = () => {
    this.props.clearDraws();
    this.props.changeDrawsDateRangeAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      this.state.startDate,
      this.state.endDate,
    );
    this.setState({
      roundId: 0,
      // venueId: null,
      roundTime: null,
      venueLoad: true,
      competitionDivisionGradeId: null,
      changeDateLoad: true,
    });
  };

  //navigateToDrawEdit
  navigateToDrawEdit = () => {
    if (this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck) {
      this.props.clearDraws('rounds');
      history.push('/competitionDrawEdit');
    } else {
      history.push('/competitionDrawEdit');
    }
  };

  ////// Publish draws
  // publishDraws() {
  //     this.props.saveDraws(this.state.yearRefId, this.state.firstTimeCompId, 1);
  // }

  contentView = () => {
    let disabledStatus = this.state.competitionStatus == 1;

    let roundTime = '';
    if (this.state.roundTime) {
      if (this.state.roundTime.length > 0) {
        roundTime = moment(this.state.roundTime).format('ddd DD/MM');
      }
    }

    return (
      <div className="comp-draw-content-view">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-10">
            <span className="form-heading">{AppConstants.draws}</span>
            <div className="row">
              <div className="col-sm-4 mr-0">
                <div className="w-100 d-flex flex-row align-content-center">
                  <span className="year-select-heading">{AppConstants.venue}:</span>
                  <Select
                    disabled={disabledStatus}
                    id={AppUniqueId.drawsVenueList_dpdn}
                    className="year-select"
                    placeholder="Select"
                    style={{
                      minWidth: 120,
                      maxWidth: 270,
                      whiteSpace: 'nowrap',
                    }}
                    onChange={venueId => this.onVenueChange(venueId)}
                    value={JSON.parse(JSON.stringify(this.state.venueId))}
                  >
                    {this.props.drawsState.competitionVenues.map(item => (
                      <Option key={'competitionVenue_' + item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="col-sm pl-0 d-flex align-items-center">
                <div className="w-100 d-flex flex-row align-items-center">
                  {this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? (
                    <div className="w-100 d-flex flex-row align-items-center">
                      <div className="col-sm-7">
                        <div className="w-100 d-flex flex-row align-items-center">
                          <span className="year-select-heading" style={{ width: 100 }}>
                            {AppConstants.dateRange}:
                          </span>
                          <RangePicker
                            // size="large"
                            onChange={date => this.onChangeStartDate(date)}
                            format="DD-MM-YYYY"
                            style={{ width: '100%', minWidth: 180, paddingLeft: 5 }}
                            value={[moment(this.state.startDate), moment(this.state.endDate)]}
                          />
                        </div>
                      </div>

                      {/* <div className="col-sm-6">
                                                <div className="w-100 d-flex flex-row align-items-center">
                                                    <span className="year-select-heading">
                                                        {AppConstants.fromDate}:
                                                    </span>
                                                    <DatePicker
                                                        // size="large"
                                                        style={{ width: "75%", minWidth: 180, paddingLeft: 5 }}
                                                        format="DD-MM-YYYY"
                                                        // defaultValue={new}
                                                        onChange={(startDate) => this.onChangeStartDate(moment(startDate).format("YYYY-MM-DD"))}
                                                        value={moment(this.state.startDate)}
                                                        // disabledDate={d => !d || d.isAfter(this.state.endDate)}
                                                    />
                                                </div>
                                            </div> */}
                      {/* <div className="col-sm-5">
                                                <div className="w-100 d-flex flex-row align-items-center">
                                                    <span className="year-select-heading">
                                                        {AppConstants.toDate}:
                                                    </span>
                                                    <DatePicker
                                                        // size="large"
                                                        style={{ width: "75%", minWidth: 180, paddingLeft: 5 }}
                                                        format="DD-MM-YYYY"
                                                        placeholder="dd-mm-yyyy"
                                                        onChange={(endDate) => this.onChangeEndDate(moment(endDate).format("YYYY-MM-DD"))}
                                                        value={moment(this.state.endDate)}
                                                        // disabledDate={d => !d || d.isBefore(this.state.startDate)}
                                                    />
                                                </div>
                                            </div> */}
                      <div className="col-sm-1.5">
                        <Button
                          id={AppUniqueId.apply_date_btn}
                          className="open-reg-button"
                          type="primary"
                          onClick={() => this.applyDateFilter()}
                        >
                          {AppConstants.apply}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-100 d-flex flex-row align-items-center">
                      <span className="year-select-heading">{AppConstants.round}:</span>
                      <Select
                        id={AppUniqueId.draw_rounds_dpdn}
                        disabled={disabledStatus}
                        className="year-select"
                        style={{ minWidth: 100, maxWidth: 130 }}
                        onChange={roundId => this.onRoundsChange(roundId)}
                        value={this.state.roundId}
                      >
                        {this.props.drawsState.getDrawsRoundsData.map(item => (
                          <Option key={'drawsRound_' + item.roundId} value={item.roundId}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                      {roundTime !== '' && (
                        <span className="year-select-heading pb-1">
                          {'Starting'} {'  '}
                          {roundTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-2 comp-draw-edit-btn-view">
            <Button
              onClick={() => this.navigateToDrawEdit()}
              id={AppUniqueId.editDraw_Btn}
              className="live-score-edit"
              type="primary"
            >
              {AppConstants.edit}
            </Button>
          </div>
        </div>
        <div>
          {this.props.drawsState.spinLoad && (
            <div className="h-100 d-flex justify-content-center align-items-center">
              <Spin size="default" spinning={this.props.drawsState.spinLoad} />
            </div>
          )}
          {this.props.drawsState.updateLoad ? (
            <div className="draggable-wrap draw-data-table">
              <Loader visible={this.props.drawsState.updateLoad} />

              {this.props.drawsState.getRoundsDrawsdata.map((dateItem, dateIndex) => (
                <div key={'drawData' + dateIndex}>
                  <div className="draws-round-view">
                    <span className="draws-round">{dateItem.roundName}</span>
                  </div>

                  {this.draggableView(dateItem)}

                  {this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? (
                    <div>
                      <AllLegendComponent allLegendArray={dateItem.legendsArray} />
                    </div>
                  ) : (
                    <div className="d-table" style={{ marginTop: 35 }}>
                      <LegendComponent
                        disabled={disabledStatus}
                        legendArray={dateItem.legendsArray}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="draggable-wrap draw-data-table">
              {this.props.drawsState.getRoundsDrawsdata.map((dateItem, dateIndex) => (
                <div>
                  {dateItem.legendsArray.length > 0 ? (
                    <div key={'drawData' + dateIndex}>
                      <div className="draws-round-view">
                        <span className="draws-round">
                          {this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck
                            ? ''
                            : dateItem.roundName}
                        </span>
                      </div>

                      {this.draggableView(dateItem)}

                      {this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? (
                        <div>
                          <AllLegendComponent allLegendArray={dateItem.legendsArray} />
                        </div>
                      ) : (
                        <div className="d-table" style={{ marginTop: 35 }}>
                          <LegendComponent
                            disabled={disabledStatus}
                            legendArray={dateItem.legendsArray}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {this.state.firstTimeCompId == -1 && (
                        <div className="comp-warning-info" style={{ paddingBottom: 40 }}>
                          {AppConstants.noFixturesMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  checkColor(slot) {
    if (
      slot.competitionDivisionGradeId == this.state.competitionDivisionGradeId ||
      this.state.competitionDivisionGradeId == 0
    ) {
      if (
        this.state.organisation_Id == slot.awayTeamOrganisationId ||
        this.state.organisation_Id == slot.homeTeamOrganisationId ||
        this.state.organisation_Id == '-1'
      ) {
        return slot.colorCode;
      }
    }
    return '#999999';
  }

  checkSwap(slot) {
    let disabledStatus = this.state.competitionStatus == 1;
    if (
      slot.competitionDivisionGradeId == this.state.competitionDivisionGradeId ||
      this.state.competitionDivisionGradeId == 0
    ) {
      if (
        this.state.organisation_Id == slot.awayTeamOrganisationId ||
        this.state.organisation_Id == slot.homeTeamOrganisationId ||
        this.state.organisation_Id == '-1'
      ) {
        if (!disabledStatus) {
          return true;
        }
      }
    }
    return false;
  }

  //////the gragable content view inside the container
  draggableView = dateItem => {
    let disabledStatus = this.state.competitionStatus == 1;
    var dateMargin = 25;
    var dayMargin = 25;
    let topMargin = 0;
    // let legendsData = isArrayNotEmpty(this.props.drawsState.legendsArray) ? this.props.drawsState.legendsArray : [];
    return (
      <div>
        <div className="scroll-bar pb-4">
          <div className="table-head-wrap">
            {/* Day name list */}
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />

              {dateItem.dateNewArray.map((item, index) => {
                if (index !== 0) {
                  dateMargin += 110;
                }
                if (index == 0) {
                  dateMargin = 70;
                }
                return (
                  <span key={'day' + index} style={{ left: dateMargin }}>
                    {item.notInDraw == false ? getDayName(item.date) : ''}
                  </span>
                );
              })}
            </div>
            {/* Times list */}
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />

              {dateItem.dateNewArray.map((item, index) => {
                if (index !== 0) {
                  dayMargin += 110;
                }
                if (index == 0) {
                  dayMargin = 70;
                }
                return (
                  <span
                    key={'time' + index}
                    style={{
                      left: dayMargin,
                      fontSize: item.notInDraw != false && 11,
                    }}
                  >
                    {item.notInDraw == false ? getTime(item.date) : 'Not in draw'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="main-canvas Draws" id={AppUniqueId.main_draws_round_tableview}>
          {dateItem.draws.map((courtData, index) => {
            let leftMargin = 25;
            if (index !== 0) {
              topMargin += 70;
            }
            return (
              <div key={'court' + index}>
                <div className="sr-no" style={{ height: 62 }}>
                  <div className="venueCourt-tex-div">
                    <span className="venueCourt-text">
                      {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                    </span>
                  </div>
                </div>
                {courtData.slotsArray.map((slotObject, slotIndex) => {
                  if (slotIndex !== 0) {
                    leftMargin += 110;
                  }
                  if (slotIndex == 0) {
                    leftMargin = 70;
                  }
                  return (
                    <div key={'slot' + slotIndex}>
                      <span style={{ left: leftMargin, top: topMargin }} className="border" />
                      <div
                        className="box purple-bg overflow-hidden column-width-style"
                        style={{
                          backgroundColor: this.checkColor(slotObject),
                          left: leftMargin,
                          top: topMargin,
                          cursor: disabledStatus && 'no-drop',
                        }}
                      >
                        {this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck ? (
                          <Swappable
                            id={`${index.toString()}:${slotIndex.toString()}:1`}
                            content={1}
                            swappable={this.checkSwap(slotObject)}
                            onSwap={(source, target) =>
                              this.onSwap(source, target, dateItem.draws, '1')
                            }
                          >
                            {slotObject.drawsId != null ? (
                              <span>
                                {slotObject.homeTeamName} <br />
                                {slotObject.awayTeamName}
                              </span>
                            ) : (
                              <span>Free</span>
                            )}
                          </Swappable>
                        ) : (
                          <Swappable
                            id={`${index.toString()}:${slotIndex.toString()}:${dateItem.roundId.toString()}`}
                            content={1}
                            swappable={this.checkSwap(slotObject)}
                            onSwap={(source, target) =>
                              this.onSwap(source, target, dateItem.draws, dateItem.roundId)
                            }
                          >
                            {slotObject.drawsId != null ? (
                              <span>
                                {slotObject.homeTeamName} <br />
                                {slotObject.awayTeamName}
                              </span>
                            ) : (
                              <span>Free</span>
                            )}
                          </Swappable>
                        )}
                      </div>
                      {slotObject.drawsId !== null && (
                        <div className="box-exception overflow-hidden column-width-style">
                          <Menu
                            className="action-triple-dot-draws border-bottom-0"
                            theme="light"
                            mode="horizontal"
                            style={{ lineHeight: '16px', cursor: disabledStatus && 'no-drop' }}
                          >
                            <SubMenu
                              disabled={disabledStatus}
                              // style={{ borderBottomStyle: "solid", borderBottom: 2 }}
                              key="sub1"
                              title={
                                slotObject.isLocked == 1 ? (
                                  <div
                                    className="d-flex justify-content-between"
                                    style={{
                                      width: 80,
                                      maxWidth: 80,
                                    }}
                                  >
                                    <img
                                      className="dot-image"
                                      src={AppImages.drawsLock}
                                      alt=""
                                      width="16"
                                      height="10"
                                    />
                                    <img
                                      className="dot-image"
                                      src={AppImages.moreTripleDot}
                                      alt=""
                                      width="16"
                                      height="10"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <img
                                      className="dot-image"
                                      src={AppImages.moreTripleDot}
                                      alt=""
                                      width="16"
                                      height="10"
                                    />
                                  </div>
                                )
                              }
                            >
                              {slotObject.isLocked == 1 && (
                                <Menu.Item
                                  key="1"
                                  onClick={() =>
                                    this.state.firstTimeCompId == '-1' || this.state.dateRangeCheck
                                      ? this.unlockDraws(
                                          slotObject.drawsId,
                                          '1',
                                          courtData.venueCourtId,
                                        )
                                      : this.unlockDraws(
                                          slotObject.drawsId,
                                          dateItem.roundId,
                                          courtData.venueCourtId,
                                        )
                                  }
                                >
                                  <div className="d-flex">
                                    <span>Unlock</span>
                                  </div>
                                </Menu.Item>
                              )}
                              <Menu.Item key="2">
                                <NavLink
                                  to={{
                                    pathname: `/competitionException`,
                                    state: {
                                      drawsObj: slotObject,
                                      yearRefId: this.state.yearRefId,
                                      competitionId: this.state.firstTimeCompId,
                                      organisationId: this.state.organisationId,
                                    },
                                  }}
                                >
                                  <span>Exception</span>
                                </NavLink>
                              </Menu.Item>
                            </SubMenu>
                          </Menu>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* <div className="draws-legend-view"> */}
        {/* <LegendComponent legendArray={Array(10).fill(legendsData).flat()} /> */}
        {/* </div> */}
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let publishStatus = this.props.drawsState.publishStatus;
    let isTeamNotInDraws = this.props.drawsState.isTeamInDraw;
    let activeDrawsRoundsData = this.props.drawsState.activeDrawsRoundsData;
    let isPublish = this.state.competitionStatus == 1;
    let teamNames = this.props.drawsState.teamNames;
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button" />
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              {/* <NavLink to="/competitionFormat"> */}
              <Button
                id={AppUniqueId.regenrate_Btn}
                className="open-reg-button"
                type="primary"
                disabled={isPublish}
                onClick={() => this.reGenerateDraw()}
              >
                {AppConstants.regenerateDraw}
              </Button>
              <div>
                <Loader visible={this.props.competitionModuleState.drawGenerateLoad} />
              </div>
              {/* </NavLink> */}
            </div>
          </div>
          <div>
            <div className="comp-buttons-view">
              <Tooltip
                className="h-100"
                onMouseEnter={() =>
                  this.setState({
                    tooltipVisibleDelete: isPublish,
                  })
                }
                onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                visible={this.state.tooltipVisibleDelete}
                title={AppConstants.statusPublishHover}
              >
                <Button
                  id={AppUniqueId.draw_Publish_btn}
                  className="open-reg-button"
                  type="primary"
                  htmlType="submit"
                  style={{
                    height: (isPublish || publishStatus == 1) && '100%',
                    borderRadius: (isPublish || publishStatus == 1) && 6,
                  }}
                  onClick={() =>
                    isTeamNotInDraws == 1 ? this.openModel(this.props) : this.check()
                  }
                  disabled={this.state.competitionStatus == 1 || publishStatus == 1}
                >
                  {AppConstants.publish}
                </Button>
              </Tooltip>
            </div>
          </div>
          {/* </div> */}
        </div>
        <DrawsPublishModel
          publishVisible={this.state.visible}
          divisionGradeNameList={this.props.drawsState.divisionGradeNameList}
          getDrawsRoundsData={this.props.drawsState.getDrawsRoundsData}
          modelCheckDivision={e => this.checkDivision(e)}
          modelCheckRound={e => this.checkRound(e)}
          modelCancel={this.handleCancel}
          modelRadio={this.onChangeRadio}
          modalPublish={e => this.publishDraw()}
          modalDivisions={e => this.onSelectDivisionsValues(e)}
          modalRounds={e => this.onSelectRoundValues(e)}
          modalRadioValue={this.state.value}
          modalIsShowPart={this.state.publishPartModel.isShowPart}
          modalIsShowDivision={this.state.publishPartModel.publishPart.isShowDivision}
          modalIsShowRound={this.state.publishPartModel.publishPart.isShowRound}
        />

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.regenerateDrawTitle}
          visible={this.state.drawGenerateModalVisible}
          onOk={() => this.handleGenerateDrawModal('ok')}
          onCancel={() => this.handleGenerateDrawModal('cancel')}
        >
          <Select
            className="year-select reg-filter-select-competition ml-2"
            onChange={e => this.setState({ generateRoundId: e })}
            placeholder="Round"
          >
            {(activeDrawsRoundsData || []).map(d => (
              <Option key={'activeDrawsRound_' + d.roundId} value={d.roundId}>
                {d.name}
              </Option>
            ))}
          </Select>
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title="Team Names"
          visible={this.state.publishModalVisible}
          onOk={() => this.handlePublishModal('ok')}
          onCancel={() => this.handlePublishModal('cancel')}
        >
          <div>
            <div>{AppConstants.publishModalInfo}</div>
            <div>{teamNames}</div>
            <div>{AppConstants.publishModalConfirmationMsg}</div>
          </div>
        </Modal>
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
        {/* <InnerHorizontalMenu menu="competition" compSelectedKey="18" /> */}
        <Layout className="comp-dash-table-view">
          {this.headerView()}
          {this.dropdownView()}
          {/* <Form onSubmit={this.saveAPIsActionCall}> */}
          {/* <Loader visible={this.props.drawsState.updateLoad} /> */}
          <Content>{this.contentView()}</Content>
          <Footer>{this.footerView()}</Footer>
          {/* </Form> */}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getCompetitionDrawsAction,
      getYearAndCompetitionOwnAction,
      getVenuesTypeAction,
      getDrawsRoundsAction,
      updateCompetitionDraws,
      saveDraws,
      getCompetitionVenue,
      updateCourtTimingsDrawsAction,
      clearDraws,
      publishDraws,
      matchesListDrawsAction,
      generateDrawAction,
      unlockDrawsAction,
      getActiveRoundsAction,
      changeDrawsDateRangeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    drawsState: state.CompetitionDrawsState,
    competitionModuleState: state.CompetitionModuleState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionDraws);

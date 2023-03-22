import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Button,
  Tooltip,
  Menu,
  Select,
  DatePicker,
  Checkbox,
  message,
  Spin,
  Modal,
  Radio,
} from 'antd';
import _, { flatten } from 'lodash';
//import loadjs from 'loadjs';
import moment from 'moment';

import getColor from 'util/coloredCheckbox';
import { isArrayNotEmpty, randomKeyGen } from 'util/helpers';
import history from 'util/history';
import {
  setGlobalYear,
  getGlobalYear,
  setOwn_competition,
  getOwn_competition,
  setDraws_venue,
  setDraws_round,
  setDraws_roundTime,
  getDraws_venue,
  getDraws_round,
  getDraws_roundTime,
  setDraws_division_grade,
  getOrganisationData,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  setLiveScoreUmpireCompition,
  setLiveScoreUmpireCompitionData,
  getLastDrawPublishTime,
  setLastDrawPublishTime,
  getLastDrawRegenerateTime,
  setLastDrawRegenerateTime,
} from 'util/sessionStorage';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import ValidationConstants from 'themes/validationConstant';
import { getYearAndCompetitionOwnAction, getVenuesTypeAction } from 'store/actions/appAction';
import { generateDrawAction } from 'store/actions/competitionModuleAction/competitionModuleAction';
import {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDrawsTimeline,
  saveDraws,
  getCompetitionVenue,
  updateCourtTimingsDrawsAction,
  updateCourtTimingsDrawsDragSuccessAction,
  updateCompetitionDrawsSwapLoadAction,
  clearMultiDraws,
  publishDraws,
  matchesListDrawsAction,
  unlockDrawsAction,
  getActiveRoundsAction,
  changeDrawsDateRangeAction,
  checkBoxOnChange,
  setTimelineModeAction,
} from 'store/actions/competitionModuleAction/competitionMultiDrawsAction';
import DrawsPublishModel from 'customComponents/drawsPublishModel';
import DrawsRegenerateModal from '../../customComponents/drawsRegenerateModal';
import Loader from 'customComponents/loader';

import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import DrawConstant from '../../themes/drawConstant';
import {
  getDate,
  checkDate,
  getDiffBetweenStartAndEnd,
  getNextEventForSwap,
  checkUnavailableTime,
  sortStringArrayAlphabetical,
  isVenueFieldConfigurationEnabled,
} from 'util/drawUtil';
import './draws.scss';
import MultiFieldDrawsSubCourtTimeline from './multiFieldDraw/multiFieldDrawsSubCourtTimeline';
import MultiFieldDrawsFullCourtTimeline from './multiFieldDraw/multiFieldDrawsFullCourtTimeline';
import { DrawShowOnlyType } from 'util/enums';
import { checkTargetedVenueHomeForAwayTeam, swapHomeAndAwayTeam } from "./multiFieldDraw/venueHelper";
import { AffectedDrawsModal } from "./affectedDrawsModal";
import CompetitionAxiosApi from "../../store/http/competitionHttp/competitionAxiosApi";
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Footer, Content } = Layout;

const { confirm } = Modal;

const ONE_MIN_WIDTH = 2;
const ONE_HOUR_IN_MIN = 60;

class MultifieldDrawsNewTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
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
      startDate: new Date(),
      endDate: new Date(),
      changeDateLoad: false,
      dateRangeCheck: false,
      allVenueChecked: true,
      allVenueCheckedByOne: true,
      allCompChecked: true,
      allDivisionChecked: true,
      allTimeslotChecked: true,
      showAllVenue: false,
      showAllComp: false,
      showAllDivision: false,
      showAllTimeslot: false,
      filterEnable: true,
      showAllOrg: false,
      allOrgChecked: true,
      singleCompDivisionCheked: true,
      filterDates: false,
      isDivisionNameShow: false,
      isAxisInverted: false,
      regenerateDrawExceptionModalVisible: false,
      regenerateExceptionRefId: 2,
      draggableEventObject: null,
      draggableElMouse: null,
      dragDayTarget: null,
      dragDayTimeRestrictions: null,
      dragDayStart: null,
      courtDataTarget: null,
      tooltipSwappableTime: null,
      ePageHoverTooltip: null,
      hoverTooltipFunc: null,
      isDragging: false,
      screenKey: this.props.location.state
        ? this.props.location.state.screenKey
          ? this.props.location.state.screenKey
          : null
        : null,
      publishPastMatches: 0,
      compactMatchesMode: 1,
      editedDraw: {
        draws: [],
        apiData: null,
      },
      showOnlyFilters: [AppConstants.scheduledMatches],
      notCheckedOrganisations: [],
    };
    this.props.clearMultiDraws();
    this.dragTimeRef = React.createRef();
    this.dragTimeEndRef = React.createRef();
  }

  componentDidUpdate(nextProps) {
    let competitionModuleState = this.props.competitionModuleState;
    let drawsRoundData = this.props.drawsState.getDrawsRoundsData;
    let venueData = this.props.drawsState.competitionVenues;
    let divisionGradeNameList = this.props.drawsState.divisionGradeNameList;
    let changeStatus = this.props.drawsState.changeStatus;

    if (this.state.venueLoad && this.props.drawsState.updateLoad == false) {
      if (nextProps.drawsState.getDrawsRoundsData !== drawsRoundData) {
        if (venueData.length > 0) {
          let venueId =
            this.state.firstTimeCompId == -1 || this.state.filterDates
              ? this.state.venueId
              : venueData[0].id;
          setDraws_venue(venueId);
          if (this.state.firstTimeCompId != '-1' && !this.state.filterDates) {
            if (drawsRoundData.length > 0) {
              let roundId = null;
              let roundTime = null;
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
                  this.state.filterDates,
                );
                this.setState({
                  roundId,
                  roundTime,
                  venueId,
                  venueLoad: false,
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
                  this.state.filterDates,
                );
                this.setState({
                  roundId,
                  roundTime,
                  venueId,
                  venueLoad: false,
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
              this.state.filterDates,
            );
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
              this.state.filterDates,
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
          let storedCompetitionId = getOwn_competition();
          let storedCompetitionStatus = getOwn_competitionStatus();
          let storedFinalTypeRefId = getOwn_CompetitionFinalRefId();
          let competitionId =
            storedCompetitionId != undefined && storedCompetitionId !== 'undefined'
              ? storedCompetitionId
              : competitionList[0].competitionId;
          let statusRefId =
            storedCompetitionStatus != undefined && storedCompetitionStatus !== 'undefined'
              ? storedCompetitionStatus
              : competitionList[0].statusRefId;
          let finalTypeRefId =
            storedFinalTypeRefId != undefined && storedFinalTypeRefId !== 'undefined'
              ? storedFinalTypeRefId
              : competitionList[0].finalTypeRefId;
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          setOwn_competitionStatus(statusRefId);
          this.props.getDrawsRoundsAction(yearId, competitionId);
          setOwn_competition(competitionId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          this.setState({
            firstTimeCompId: competitionId,
            venueLoad: true,
            competitionStatus: statusRefId,
            yearRefId: yearId,
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
          this.props.clearMultiDraws('rounds');
          this.setState({
            firstTimeCompId: this.state.firstTimeCompId,
            roundId: null,
            venueId: null,
            roundTime: null,
            venueLoad: true,
            competitionDivisionGradeId: null,
          });
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
      }
    }
  }

  componentDidMount() {
    if (this.props.drawsState.isTimelineMode === false) {
      history.push('/competitionDrawsOld');
    }
    //loadjs('assets/js/custom.js');
    this.apiCalls();
  }
  componentWillUnmount() {}

  apiCalls() {
    const yearId = getGlobalYear();
    const storedCompetitionId = getOwn_competition();
    const storedCompetitionStatus = getOwn_competitionStatus();
    const propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    const compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    const venueId = getDraws_venue();
    const roundId = getDraws_round();
    const roundTime = getDraws_roundTime();
    const roundData =
      this.props.drawsState.getDrawsRoundsData.length > 0
        ? this.props.drawsState.getDrawsRoundsData
        : undefined;
    const venueData =
      this.props.drawsState.competitionVenues.length > 0
        ? this.props.drawsState.competitionVenues
        : undefined;
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
          this.state.filterDates,
        );
        this.setState({
          venueId: JSON.parse(venueId),
          roundId: JSON.parse(roundId),
          roundTime: roundTime,
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

  applyDateFilter = () => {
    this.props.clearMultiDraws();
    if (this.state.firstTimeCompId == '-1' || this.state.filterDates) {
      this.props.changeDrawsDateRangeAction(
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.state.startDate,
        this.state.endDate,
      );
      this.setState({
        roundId: 0,
        roundTime: null,
        venueLoad: true,
        competitionDivisionGradeId: null,
        changeDateLoad: true,
      });
    } else {
      this.props.getCompetitionDrawsAction(
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.state.venueId,
        this.state.roundId,
        this.state.organisation_Id,
        null,
        null,
        this.state.applyDateFilter,
      );
    }
  };

  onYearChange = yearId => {
    this.props.clearMultiDraws('rounds');
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    setOwn_CompetitionFinalRefId(undefined);
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

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState({
        startDate: startDate,
        endDate: endDate,
      });
    }
  };

  changeAllVenueStatus = (value, key) => {
    if (key === 'venue') {
      this.props.checkBoxOnChange(value, 'allCompetitionVenues', 0, 0, this.state.showOnlyFilters);
      this.setState({ allVenueChecked: value });
    } else if (key === 'competition') {
      this.props.checkBoxOnChange(value, 'allCompetition', 0, 0, this.state.showOnlyFilters);
      this.setState({ allCompChecked: value });
    } else if (key === 'org') {
      this.props.checkBoxOnChange(value, 'allOrganisation', 0, 0, this.state.showOnlyFilters);
      const checkOrganisationFalse = this.checkAllCompetitionData(
        this.props.drawsState.drawOrganisations,
        'organisationUniqueKey',
      );
      this.setState({ allOrgChecked: value, notCheckedOrganisations: checkOrganisationFalse });
    } else if (key === 'allDivisionChecked') {
      this.props.checkBoxOnChange(value, 'allDivisionChecked', 0, 0, this.state.showOnlyFilters);
      this.setState({ allDivisionChecked: value });
    } else if (key === 'singleCompDivisionCheked') {
      this.props.checkBoxOnChange(
        value,
        'singleCompDivisionCheked',
        0,
        0,
        this.state.showOnlyFilters,
      );
      this.setState({ singleCompDivisionCheked: value });
    } else if (key === 'timeslotHour') {
      this.props.checkBoxOnChange(value, 'allTimeslotHour', 0, 0, this.state.showOnlyFilters);
      this.setState({ allTimeslotChecked: value });
    }
  };

  getColumnData = (indexArray, drawData) => {
    let xIndex = indexArray[0];
    let yIndex = indexArray[1];
    let object = null;

    for (let i in drawData) {
      let slot = drawData[i].slotsArray[yIndex];
      if (slot.drawsId !== null) {
        object = slot;
        break;
      }
    }
    if (!object) {
      //empty slot has incorrect start time
      object = drawData[xIndex].slotsArray[yIndex];
      this.correctWrongDate(object, yIndex);
    }
    return object;
  };
  correctWrongDate = (slot, slotIndex) => {
    const slotDate = moment(slot.matchDate);
    const slotEnd = moment(getDate(slot.matchDate) + slot.endTime);
    const isCorrectStart = slotEnd.isAfter(slotDate);
    if (!isCorrectStart) {
      if (this.props.drawsState.getRoundsDrawsdata.length > 0) {
        const dateAxis = this.props.drawsState.getRoundsDrawsdata[0].dateNewArray[slotIndex];
        slot.matchDate = dateAxis.date;
        slot.startTime = moment(slot.matchDate).format('HH:mm');
        slot.endTime = dateAxis.endTime;
      }
    }
  };

  updateEditDrawArray = draw => {
    const editdraw = this.state.editedDraw;
    const drawExistsIndex = editdraw.draws.findIndex(d => d.drawsId == draw.drawsId);
    if (drawExistsIndex > -1) {
      editdraw.draws[drawExistsIndex] = draw;
    } else {
      editdraw.draws.push(draw);
    }

    this.forceUpdate();
  };

  // on Competition change
  onCompetitionChange(competitionId, e) {
    const own_CompetitionArr = this.props.appState.own_CompetitionArr;
    this.props.clearMultiDraws('rounds');
    let statusRefId = 0;
    const nextAvailableGameDay = moment(
      new Date(this.props.drawsState.nextAvailableGameDay),
    ).format('YYYY-MM-DD');

    if (competitionId == -1 || this.state.filterDates) {
      this.props.getDrawsRoundsAction(
        this.state.yearRefId,
        competitionId,
        'all',
        true,
        nextAvailableGameDay,
        nextAvailableGameDay,
      );
      this.setState({
        startDate: nextAvailableGameDay,
        endDate: nextAvailableGameDay,
      });
      this.setState({ filterDates: true });
    } else {
      const statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
      statusRefId = own_CompetitionArr[statusIndex].statusRefId;
      const finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
      setOwn_competition(competitionId);
      setOwn_competitionStatus(statusRefId);
      setOwn_CompetitionFinalRefId(finalTypeRefId);
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
      showAllDivision: false,
    });
  }

  //////onRoundsChange
  onRoundsChange = roundId => {
    const roundData = this.props.drawsState.getDrawsRoundsData;
    this.props.clearMultiDraws();
    const matchRoundData = roundData.findIndex(x => x.roundId == roundId);
    const roundTime = roundData[matchRoundData].startDateTime;
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
      this.state.filterDates,
    );
  };

  checkDisplayCountList = (array, showAllStatus) => {
    if (array.length >= 5 && showAllStatus) {
      return array.length;
    } else if (array.length > 0 && showAllStatus == false) {
      return 5;
    } else {
      return array.length;
    }
  };

  changeShowAllStatus = key => {
    if (key === 'venue') {
      this.setState({ showAllVenue: !this.state.showAllVenue });
    } else if (key === 'comp') {
      this.setState({ showAllComp: !this.state.showAllComp });
    } else if (key === 'division') {
      this.setState({ showAllDivision: !this.state.showAllDivision });
    } else if (key === 'org') {
      this.setState({ showAllOrg: !this.state.showAllOrg });
    } else if (key === 'timeslotHour') {
      this.setState({ showAllTimeslot: !this.state.showAllTimeslot });
    }
  };

  filterOnClick = () => {
    this.setState({ filterEnable: !this.state.filterEnable });
  };

  onMatchesList = () => {
    this.props.matchesListDrawsAction(this.state.firstTimeCompId);
  };

  checkColor = slot => {
    const checkDivisionFalse =
      this.state.firstTimeCompId == '-1' || this.state.filterDates
        ? this.checkAllDivisionData()
        : this.checkAllCompetitionData(
            this.props.drawsState.divisionGradeNameList,
            'competitionDivisionGradeId',
          );
    const checkCompetitionFalse =
      this.state.firstTimeCompId == '-1' || this.state.filterDates
        ? this.checkAllCompetitionData(
            this.props.drawsState.drawsCompetitionArray,
            'competitionName',
          )
        : [];
    const checkVenueFalse = this.checkAllCompetitionData(
      this.props.drawsState.competitionVenues,
      'id',
    );
    const checkOrganisationFalse = this.checkAllCompetitionData(
      this.props.drawsState.drawOrganisations,
      'organisationUniqueKey',
    );
    if (!checkDivisionFalse.includes(slot.competitionDivisionGradeId)) {
      if (!checkCompetitionFalse.includes(slot.competitionName)) {
        if (!checkVenueFalse.includes(slot.venueId)) {
          if (
            !checkOrganisationFalse.includes(slot.awayTeamOrganisationId) ||
            !checkOrganisationFalse.includes(slot.homeTeamOrganisationId)
          ) {
            return slot.colorCode;
          }
        }
      }
    }
    return '#999999';
  };

  checkAllDivisionData = () => {
    const uncheckedDivisionArr = [];
    const { drawDivisions } = this.props.drawsState;
    if (drawDivisions.length > 0) {
      for (let i in drawDivisions) {
        let divisionsArr = drawDivisions[i].legendArray;
        for (let j in divisionsArr) {
          if (divisionsArr[j].checked == false) {
            uncheckedDivisionArr.push(divisionsArr[j].competitionDivisionGradeId);
          }
        }
      }
    }
    return uncheckedDivisionArr;
  };

  checkAllCompetitionData = (checkedArray, key) => {
    const uncheckedArr = [];
    if (checkedArray.length > 0) {
      for (let i in checkedArray) {
        if (checkedArray[i].checked == false) {
          uncheckedArr.push(checkedArray[i][key]);
        }
      }
    }
    return uncheckedArr;
  };

  checkSwap = slot => {
    const checkDivisionFalse =
      this.state.firstTimeCompId == '-1'
        ? this.checkAllDivisionData()
        : this.checkAllCompetitionData(
            this.props.drawsState.divisionGradeNameList,
            'competitionDivisionGradeId',
          );
    const checkCompetitionFalse =
      this.state.firstTimeCompId == '-1'
        ? this.checkAllCompetitionData(
            this.props.drawsState.drawsCompetitionArray,
            'competitionName',
          )
        : [];
    const checkVenueFalse = this.checkAllCompetitionData(
      this.props.drawsState.competitionVenues,
      'id',
    );
    const checkOrganisationFalse = this.checkAllCompetitionData(
      this.props.drawsState.drawOrganisations,
      'organisationUniqueKey',
    );
    const disabledStatus = this.state.competitionStatus == 1;
    if (slot.isUnavailable && !slot.drawsId) {
      return false;
    }
    if (!checkCompetitionFalse.includes(slot.competitionName)) {
      if (!checkVenueFalse.includes(slot.venueId)) {
        if (
          !checkOrganisationFalse.includes(slot.awayTeamOrganisationId) ||
          !checkOrganisationFalse.includes(slot.homeTeamOrganisationId)
        ) {
          if (!disabledStatus) {
            return true;
          }
        }
      }
    }
    return false;
  };

  onDateRangeCheck = val => {
    this.props.clearMultiDraws('rounds');
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.props.getDrawsRoundsAction(this.state.yearRefId, this.state.firstTimeCompId, null, val);
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate, venueLoad: true });
  };

  onCalendarCheckboxChange = (key, value) => {
    this.setState({ [key]: value });
  };

  allFilterValue = data => {
    const isAllSelected =
      isArrayNotEmpty(data) && data.map(item => item.checked).every(item => item === true);
    return isAllSelected ? true : false;
  };

  getWeeklySchedule = () => {
    const venueData = this.props.drawsState.competitionVenues;
    const clonedvenueData = _.cloneDeep(venueData);

    const weekSlotsTimeSchedule = [];

    if (clonedvenueData.length) {
      clonedvenueData.forEach(venue => {
        venue.availableTimeslots &&
          venue.availableTimeslots.forEach(venueSlot => {
            const equalDaysOfWeekSlot = weekSlotsTimeSchedule.find(
              weekSlot => weekSlot.day === venueSlot.day,
            );

            if (!equalDaysOfWeekSlot || !weekSlotsTimeSchedule.length) {
              weekSlotsTimeSchedule.push({
                day: venueSlot.day,
                timeslot: venueSlot.timeslot,
              });
            }

            if (equalDaysOfWeekSlot) {
              const equalDaysOfWeekSlotStart = moment(
                equalDaysOfWeekSlot.timeslot.startTime,
                'HH:mm',
              );
              const equalDaysOfWeekSlotEnd = moment(equalDaysOfWeekSlot.timeslot.endTime, 'HH:mm');

              const venueSlotStart = moment(venueSlot.timeslot.startTime, 'HH:mm');
              const venueSlotEnd = moment(venueSlot.timeslot.endTime, 'HH:mm');

              const isStartBefore = venueSlotStart.isBefore(equalDaysOfWeekSlotStart);
              const isEndAfter = venueSlotEnd.isAfter(equalDaysOfWeekSlotEnd);

              const equalDayInSchedule = weekSlotsTimeSchedule.find(
                item => item.day === equalDaysOfWeekSlot.day,
              );

              if (isStartBefore) {
                equalDayInSchedule.timeslot.startTime = venueSlot.timeslot.startTime;
              }

              if (isEndAfter) {
                equalDayInSchedule.timeslot.endTime = venueSlot.timeslot.endTime;
              }
            }
          });
      });
    }

    return weekSlotsTimeSchedule;
  };

  setDisplayNoneStyleTooltip = () => {
    const tooltip = document.getElementById('draggableTooltip');

    tooltip.setAttribute('style', 'display: none');
  };

  addDisplayNoneTooltip = () => {
    const { hoverTooltipFunc } = this.state;

    if (hoverTooltipFunc) {
      clearTimeout(hoverTooltipFunc);
    }

    this.setState({ ePageHoverTooltip: null });

    this.setDisplayNoneStyleTooltip();
  };

  drawsFieldMove = e => {
    const {
      dragDayTimeRestrictions,
      tooltipSwappableTime,
      dragDayTarget,
      ePageHoverTooltip,
      hoverTooltipFunc,
      isDragging,
    } = this.state;

    const tooltipX = Math.trunc(e.pageX) + 10;
    const tooltipY = Math.trunc(e.pageY) - 90;

    const tooltip = document.getElementById('draggableTooltip');
    const isTooltipAllowTime =
      isDragging &&
      this.dragTimeRef.current?.isSameOrAfter(dragDayTimeRestrictions?.startTime) &&
      this.dragTimeEndRef.current?.isSameOrBefore(dragDayTimeRestrictions?.endTime) &&
      !!dragDayTarget;

    const fullTooltipStyles =
      DrawConstant.TOOLTIP_STYLES + `left: ${tooltipX}px; top: ${tooltipY}px`;

    if (hoverTooltipFunc) {
      clearTimeout(hoverTooltipFunc);
    }

    if ((isTooltipAllowTime || tooltipSwappableTime) && !ePageHoverTooltip && isDragging) {
      tooltip.setAttribute('style', fullTooltipStyles);
    } else if (ePageHoverTooltip && !isDragging) {
      this.setState({
        hoverTooltipFunc: setTimeout(() => {
          tooltip.setAttribute('style', fullTooltipStyles);
        }, 500),
      });
    } else {
      this.setDisplayNoneStyleTooltip();
    }
  };

  drawsFieldUp = () => {
    this.addDisplayNoneTooltip();
    this.setState({ isDragging: false });
  };

  dayLineDragMove = (e, startDayDate, courtDataSlotsTarget, timeRestrictionsSchedule) => {
    const { draggableEventObject, tooltipSwappableTime, dragDayTarget, isAxisInverted } =
      this.state;

    if (dragDayTarget !== e.currentTarget) {
      this.setState({
        dragDayTarget: e.currentTarget,
        dragDayStart: startDayDate,
        dragDayTimeRestrictions: timeRestrictionsSchedule,
      });
    }

    if (this.state.courtDataSlotsTarget !== courtDataSlotsTarget) {
      this.setState({ courtDataSlotsTarget });
    }

    const targetCourtId = e.currentTarget.id.split(':')[0];

    const { draggableElMouseX, draggableElMouseY } = this.state.draggableElMouse;

    if (targetCourtId) {
      const bounds = e.currentTarget.getBoundingClientRect();

      const draggableElXStart = isAxisInverted
        ? Math.trunc((e.pageY - bounds.top - draggableElMouseY) / ONE_MIN_WIDTH)
        : Math.trunc((e.pageX - bounds.left - draggableElMouseX) / ONE_MIN_WIDTH);

      const newTime = startDayDate.clone().add(draggableElXStart, 'minutes');

      const refTimeFormatted = newTime.format(DrawConstant.dateFormat);
      const startTimeNew = moment(refTimeFormatted);
      const newTimeFormatted = startTimeNew.format('HH:mm');
      const newTimeWithDateFormatted = startTimeNew.format(DrawConstant.dateFormat);

      const startTimeOld = moment(draggableEventObject.matchDate);
      const endTimeOld = moment(
        getDate(draggableEventObject.matchDate) + draggableEventObject.endTime,
      );
      const diffTime =
        draggableEventObject.minuteDuration || endTimeOld.diff(startTimeOld, 'minutes');
      const endTimeNew = moment(newTimeWithDateFormatted).add(diffTime, 'minutes');

      this.dragTimeEndRef.current = endTimeNew;

      this.dragTimeRef.current = startTimeNew;

      const notEmptySlot = courtDataSlotsTarget.find(slot => slot.venueCourtId);

      const tooltip = document.getElementById('draggableTooltip');
      const tooltipSwappableTimeFormatted = moment(tooltipSwappableTime).format('HH:mm');

      tooltip.innerHTML = `
                <div>${draggableEventObject.homeTeamName} vs ${
        draggableEventObject.awayTeamName
      }</div>
                <div>Starting at ${
                  tooltipSwappableTime ? tooltipSwappableTimeFormatted : newTimeFormatted
                }</div>
                <div>Court ${
                  notEmptySlot?.venueShortName + '-' + notEmptySlot?.venueCourtNumber
                }</div>
            `;
    }
  };

  handleDragEnd = e => {
    const targetCourtId = +e.currentTarget.id.split(':')[0];
    const stateVenueId = this.state.dragDayTarget?.id.split(':')[0];
    const { draggableEventObject, dragDayTimeRestrictions } = this.state;

    this.setState({
      isDragging: false,
    });

    if (!stateVenueId) {
      message.error(AppConstants.notAllowed);
      return;
    }

    if (targetCourtId && stateVenueId) {
      const refTimeFormatted = this.dragTimeRef.current.format(DrawConstant.dateFormat);
      const startTimeNew = moment(refTimeFormatted);

      if (startTimeNew.isBefore(dragDayTimeRestrictions.startTime)) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const newTimeFormatted = startTimeNew.format('HH:mm');
      const newTimeWithDateFormatted = startTimeNew.format(DrawConstant.dateFormat);

      const endTimeNew = this.dragTimeEndRef.current;

      if (endTimeNew.isAfter(dragDayTimeRestrictions.endTime)) {
        message.error(AppConstants.notAllowed);
        return;
      }

      if (
        draggableEventObject.matchDate === newTimeWithDateFormatted &&
        targetCourtId.toString() === stateVenueId
      ) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const endTimeFormatted = endTimeNew.format('HH:mm');

      const notEmptyTargetDayCourtSlots = this.state.courtDataSlotsTarget.filter(
        slot => getDate(slot.matchDate) === getDate(newTimeWithDateFormatted) && slot.drawsId,
      );

      const isCourtDataSlotBusy = notEmptyTargetDayCourtSlots.some((slot, slotIndex) => {
        const slotStart = moment(slot.matchDate);
        const slotEnd = moment(getDate(slot.matchDate) + slot.endTime);

        const isStartTimeCondition =
          startTimeNew.isSameOrBefore(slotEnd) && startTimeNew.isSameOrAfter(slotStart);
        const isEndTimeCondition =
          endTimeNew.isSameOrAfter(slotStart) && endTimeNew.isSameOrBefore(slotEnd);
        const isSlotEventInside =
          startTimeNew.isSameOrBefore(slotStart) && endTimeNew.isSameOrAfter(slotEnd);

        const isEventOverItself =
          slot.drawsId === draggableEventObject.drawsId &&
          (isStartTimeCondition || isEndTimeCondition);

        if (isEventOverItself) {
          const nextEvent = notEmptyTargetDayCourtSlots[slotIndex + 1];
          const prevEvent = notEmptyTargetDayCourtSlots[slotIndex - 1];

          const prevEventEnd = prevEvent && moment(getDate(slot.matchDate) + prevEvent?.endTime);
          const nextEventStart = nextEvent && moment(nextEvent?.matchDate);

          const isPrevEventEndBeforeSlotStart =
            prevEventEnd && prevEventEnd.isSameOrAfter(startTimeNew);
          const isPrevEventStartAfterSlotEnd =
            nextEventStart && nextEventStart.isSameOrBefore(endTimeNew);

          if (isPrevEventEndBeforeSlotStart || isPrevEventStartAfterSlotEnd) {
            return true;
          }

          return false;
        }

        if (isStartTimeCondition || isEndTimeCondition || isSlotEventInside) {
          return true;
        }
        return;
      });

      if (isCourtDataSlotBusy) {
        message.error(AppConstants.notAllowed);
        return;
      }

      const roundId = getDraws_round();
      const yearId = getGlobalYear();
      const storedCompetitionId = getOwn_competition();

      const apiData = {
        yearRefId: yearId,
        competitionId: storedCompetitionId,
        venueId: 0,
        roundId: this.state.firstTimeCompId == '-1' || this.state.filterDates ? 0 : roundId,
        orgId: null,
        startDate:
          this.state.firstTimeCompId == '-1' || this.state.filterDates
            ? this.state.startDate
            : null,
        endDate:
          this.state.firstTimeCompId == '-1' || this.state.filterDates ? this.state.endDate : null,
      };

      const postData = {
        drawsId: draggableEventObject.drawsId,
        venueCourtId: parseInt(stateVenueId),
        matchDate: newTimeWithDateFormatted,
        startTime: newTimeFormatted,
        endTime: endTimeFormatted,
        originalHomeTeamId: draggableEventObject.originalHomeTeamId ?? draggableEventObject.homeTeamId,
        originalAwayTeamId: draggableEventObject.originalAwayTeamId ?? draggableEventObject.awayTeamId,
      };
      const { competitionVenues = [] } = this.props.drawsState;
      const targetVenue = competitionVenues.find(venue => (venue.courts ?? []).some(court => court.courtId.toString() === stateVenueId))
      const targetVenueId = targetVenue?.id;
      let movedFixture = draggableEventObject;
      if (targetVenueId && checkTargetedVenueHomeForAwayTeam(this.props.drawsState, targetVenueId, draggableEventObject)) {
        movedFixture = swapHomeAndAwayTeam(draggableEventObject);
        postData.homeTeamId = movedFixture.homeTeamId;
        postData.awayTeamId = movedFixture.awayTeamId;
      }
      const editdraw = this.state.editedDraw;
      editdraw.apiData = apiData;

      //change to action if necessary
      this.dragSuccess(targetCourtId, postData, movedFixture);
      this.updateEditDrawArray(postData);
      this.setState({ updateLoad: false });
    }
  };
  dragSuccess(targetCourtId, postData, fixture) {
    for (let drawsData of this.props.drawsState.getRoundsDrawsdata) {
      if (targetCourtId == postData.venueCourtId) {
        //move in the same court
        let venueCourt = drawsData.draws.find(d => d.venueCourtId == postData.venueCourtId);
        if (venueCourt) {
          let draw = venueCourt.slotsArray.find(d => d.drawsId == postData.drawsId);
          if (draw) {
            draw.matchDate = postData.matchDate;
            draw.startTime = postData.startTime;
            draw.endTime = postData.endTime;
            break;
          }
        }
      } else {
        //move to different court
        let sourceVenueCourt = drawsData.draws.find(d => d.venueCourtId == targetCourtId);
        let moveddraw;
        if (sourceVenueCourt) {
          //remove from source court
          let drawindex = sourceVenueCourt.slotsArray.findIndex(d => d.drawsId == postData.drawsId);
          if (drawindex > -1) {
            let draw = sourceVenueCourt.slotsArray[drawindex];
            moveddraw = JSON.parse(JSON.stringify(draw));
            moveddraw.matchDate = postData.matchDate;
            moveddraw.startTime = postData.startTime;
            moveddraw.endTime = postData.endTime;
            if (!(moveddraw.originalHomeTeamId && moveddraw.originalAwayTeamId)) {
              moveddraw.originalHomeTeamId = postData.originalHomeTeamId;
              moveddraw.originalAwayTeamId = postData.originalAwayTeamId;
            }
            Object.keys(DrawConstant.switchDrawNameFields).forEach(
              key => (moveddraw[key] = fixture[key]),
            );
            //set original to empty
            let emptyDraw = { ...DrawConstant.emptySlot };
            emptyDraw.slotId = randomKeyGen(5);
            Object.keys(DrawConstant.emptySlotFieldUpdate).forEach(
              key => (emptyDraw[key] = draw[key]),
            );
            sourceVenueCourt.slotsArray[drawindex] = emptyDraw;
          }
        }
        let destinationVenueCourt = drawsData.draws.find(
          d => d.venueCourtId == postData.venueCourtId,
        );
        if (moveddraw && destinationVenueCourt) {
          let drawindex = -1;
          for (let i = 0; i < drawsData.dateNewArray.length; i++) {
            if (new Date(moveddraw.matchDate) >= new Date(drawsData.dateNewArray[i].date)) {
              drawindex = i;
            }
          }
          if (drawindex > -1) {
            Object.keys(DrawConstant.emptySlotVenueFieldUpdate).forEach(
              key => (moveddraw[key] = destinationVenueCourt.slotsArray[drawindex][key]),
            );
            let targetDraw = destinationVenueCourt.slotsArray[drawindex];
            if (targetDraw.drawsId && targetDraw.drawsId != moveddraw.drawsId) {
              //something wrong,
              console.log('no enough slot');
              destinationVenueCourt.slotsArray.push(moveddraw);
              message.warning('Please save draws');
            } else {
              destinationVenueCourt.slotsArray[drawindex] = moveddraw;
            }
          }
        }
      }
    }
  }
  setDraggingState = state => {
    this.setState(state);
  };

  setDraggableElMouse = e => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const draggableElMouseX = e.pageX - bounds.left;
    const draggableElMouseY = e.pageY - bounds.top;

    this.setState({
      draggableElMouse: {
        draggableElMouseX,
        draggableElMouseY,
      },
    });
  };

  slotObjectMouseEnter = (e, draggableEventObject, isGroup) => {
    if (!this.state.isDragging) {
      const ePageHoverTooltip = {
        pageX: e.pageX,
        pageY: e.pageY,
      };

      this.setState({
        draggableEventObject,
        ePageHoverTooltip,
      });
    }

    this.setDisplayNoneStyleTooltip();
    this.setDraggableElMouse(e);

    const tooltip = document.getElementById('draggableTooltip');
    let teamHtml = `<div>${draggableEventObject.homeTeamName} vs ${draggableEventObject.awayTeamName}</div>`;
    if (draggableEventObject.childSlots && isGroup) {
      teamHtml = '';
      for (let childSlot of draggableEventObject.childSlots) {
        if (childSlot.drawsId) {
          teamHtml += `<div>${childSlot.homeTeamName} vs ${childSlot.awayTeamName}`;
          if (childSlot.subCourt) {
            teamHtml += ` (${childSlot.subCourt})`;
          }
          teamHtml += `</div>`;
        }
      }
    }
    teamHtml += `<div>Starting at ${draggableEventObject.startTime}</div>`;
    if (!isGroup) {
      teamHtml += `<div>Ending at ${draggableEventObject.endTime}</div>`;
    }
    teamHtml += `<div>Court ${draggableEventObject.venueShortName}-${draggableEventObject.venueCourtName}`;
    if (!isGroup && draggableEventObject.subCourt) {
      teamHtml += `(${draggableEventObject.subCourt})`;
    }
    teamHtml += `</div>`;
    if (draggableEventObject.divisionName && draggableEventObject.gradeName) {
      teamHtml += `<div>${AppConstants.divOrGrade} ${draggableEventObject.divisionName}-${draggableEventObject.gradeName}`;
      teamHtml += `</div>`;
    }
    tooltip.innerHTML = teamHtml;
  };

  slotObjectMouseDown = e => {
    this.setState({ ePageHoverTooltip: null, isDragging: true });

    this.setDraggableElMouse(e);
    this.addDisplayNoneTooltip();
  };

  slotObjectMouseLeave = e => {
    if (e && !e.target.id && e.target.tagName === 'SPAN') {
      e.stopPropagation();
    } else {
      this.setState({ ePageHoverTooltip: null });
    }
  };

  slotObjectDragOver = slotObject => {
    const { tooltipSwappableTime, draggableEventObject } = this.state;

    if (slotObject.matchDate !== tooltipSwappableTime && slotObject !== draggableEventObject)
      this.setState({ tooltipSwappableTime: slotObject.matchDate });
  };

  checkUnavailableTimeWidth = (timeRestrictionsSchedule, startDayDate, endDayDate) => {
    const startTimeRestriction = timeRestrictionsSchedule && timeRestrictionsSchedule.startTime;
    const endTimeRestriction = timeRestrictionsSchedule && timeRestrictionsSchedule.endTime;

    const unavailableStartWidth =
      startTimeRestriction && startTimeRestriction.isAfter(startDayDate)
        ? timeRestrictionsSchedule.startTime.diff(startDayDate, 'minutes') * ONE_MIN_WIDTH
        : null;

    const unavailableEndWidth =
      endTimeRestriction && endTimeRestriction.isBefore(endDayDate)
        ? endDayDate.diff(timeRestrictionsSchedule.endTime, 'minutes') * ONE_MIN_WIDTH
        : null;

    return [unavailableStartWidth, unavailableEndWidth];
  };

  getDayTimeRestrictions = (courtData, fieldItemDate) => {
    const venueData = this.props.drawsState.competitionVenues;

    // for check the schedule of the day
    const schedule = this.getWeeklySchedule();
    const itemDateDayOfWeek = moment(fieldItemDate.trim().replace('T', ''))
      .format('dddd')
      .toLowerCase();

    const findSchedule = schedule.find(
      scheduleDay => scheduleDay.day.toLowerCase() === itemDateDayOfWeek,
    );

    const startDayTime = findSchedule ? findSchedule.timeslot.startTime : '00:00';
    const endDayTime = findSchedule ? findSchedule.timeslot.endTime : '24:00';

    const startDayTimeStartHour = this.getEndTime(fieldItemDate + startDayTime);
    const endDayTimeStartHour = this.getEndTime(fieldItemDate + endDayTime);

    const timeAllDayScheduleHours = [startDayTimeStartHour];

    while (timeAllDayScheduleHours[timeAllDayScheduleHours.length - 1] !== endDayTimeStartHour) {
      const newTime = moment(
        fieldItemDate + timeAllDayScheduleHours[timeAllDayScheduleHours.length - 1],
      )
        .add(ONE_HOUR_IN_MIN, 'minutes')
        .format('HH:mm');
      timeAllDayScheduleHours.push(newTime);
    }

    // check unavailable time during the day
    //
    const courtVenueId = courtData.venueId;
    if (!courtVenueId) {
      let slot = courtData.slotsArray.find(slot => slot.venueId);
      if (slot) {
        courtVenueId = slot.venueId;
      } else {
        console.log('can not find venueid for slot');
      }
    }
    const courtId = courtData.venueCourtId;

    let venueDaySchedule;
    let workingDayInTimeline;
    let courtDaySchedule;

    // TODO this.props.drawsState.competitionVenues could be an object with different properties, necessary to fix !!

    if (venueData[0]?.availableTimeslots) {
      venueData.forEach(venue => {
        const daySchedule = venue.availableTimeslots.find(
          venueDaySchedule =>
            venueDaySchedule?.venueId &&
            venueDaySchedule.venueId === courtVenueId &&
            venueDaySchedule.day === findSchedule?.day,
        );

        if (daySchedule) {
          venueDaySchedule = daySchedule.timeslot;
        }
      });

      const venueDataSlotForCheck = venueData.find(venue => venue.id === courtVenueId);

      // check unavailable days of week for court based on venue schedule

      const workingDaysOfVenue = venueDataSlotForCheck.availableTimeslots.filter(
        venueDay => courtVenueId === venueDay.venueId,
      );
      workingDayInTimeline = workingDaysOfVenue.find(
        workingDayVenue => workingDayVenue.day.toLowerCase() === itemDateDayOfWeek,
      );

      // check unavailable time during the working day for court based on court schedule

      const courtWeekSchedule = venueDataSlotForCheck.courts.find(
        court => court.courtId === courtId,
      )?.availableTimeslots;
      if (courtWeekSchedule) {
        let timeSlotsInDay = courtWeekSchedule.filter(
          court => court.day === itemDateDayOfWeek && court.timeslot,
        );
        let startTimesInTimeSlots = sortStringArrayAlphabetical(
          timeSlotsInDay.filter(c => c.timeslot.startTime).map(c => c.timeslot.startTime),
          'asc',
        );
        let endTimesInTimeSlots = sortStringArrayAlphabetical(
          timeSlotsInDay.filter(c => c.timeslot.endTime).map(c => c.timeslot.endTime),
          'desc',
        );
        courtDaySchedule = { startTime: null, endTime: null };
        if (startTimesInTimeSlots.length > 0) {
          courtDaySchedule.startTime = startTimesInTimeSlots[0];
        }
        if (endTimesInTimeSlots.length > 0) {
          courtDaySchedule.endTime = endTimesInTimeSlots[0];
        }
      }
    }

    const venueSchedule = checkUnavailableTime(
      venueDaySchedule,
      startDayTime,
      endDayTime,
      fieldItemDate,
    );
    const courtSchedule = checkUnavailableTime(
      courtDaySchedule,
      startDayTime,
      endDayTime,
      fieldItemDate,
    );

    // unavailable time during the whole day

    const dayTimeRestrictions = workingDayInTimeline
      ? {
          startTime: venueSchedule.startTime.isAfter(courtSchedule.startTime)
            ? venueSchedule.startTime
            : courtSchedule.startTime,
          endTime: venueSchedule.endTime.isBefore(courtSchedule.endTime)
            ? venueSchedule.endTime
            : courtSchedule.endTime,
          isUnavailable: false,
        }
      : !findSchedule
      ? {
          startTime: moment(fieldItemDate + '00:00'),
          endTime: moment(fieldItemDate + '23:59'),
          isUnavailable: true,
        }
      : null;

    return dayTimeRestrictions;
  };

  handleToggleTimeline = checked => {
    //const { isTimelineMode } = this.props.drawsState;
    if (checked) {
      history.push('/competitionDraws');
    } else {
      history.push('/competitionDrawsOld');
    }
  };
  openConfirmToggleTimeline = async checked => {
    if (this.state.editedDraw.draws.length > 0) {
      confirm({
        title: AppConstants.timelineToggleConfirm,
        okText: AppConstants.yes,
        okType: AppConstants.primary,
        cancelText: AppConstants.no,
        maskClosable: true,
        mask: true,
        onOk: async () => {
          await this.confirmToggleTimeline(checked);
        },
        onCancel() {
          console.log('toggle timeline cancel');
        },
      });
    } else {
      await this.confirmToggleTimeline(checked);
    }
  };
  confirmToggleTimeline = async checked => {
    await this.props.setTimelineModeAction(checked);
    this.handleToggleTimeline(checked);
  };

  headerView = () => {
    return (
      <>
        {this.state.screenKey && (
          <div className="row" style={{ marginTop: '15px' }}>
            <div className="col-sm d-flex justify-content-end">
              <div className="reg-add-save-button">
                <Button
                  onClick={() => history.push(this.state.screenKey)}
                  className="primary-add-comp-form"
                  type="primary"
                >
                  {AppConstants.backToMatchDay}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="comp-draw-content-view" style={{ marginTop: 15 }}>
          <div className="multi-draw-list-top-head row">
            <div className="col-sm-2 mt-3">
              <span className="form-heading">{AppConstants.draws}</span>
            </div>
            <div className="col-sm-10 row pr-0">
              <div className="col-sm mt-2">
                <Select
                  className="year-select reg-filter-select1"
                  style={{ maxWidth: 100, minWidth: 100 }}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={JSON.parse(this.state.yearRefId)}
                >
                  {this.props.appState.own_YearArr.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="col-sm-2.5 mt-2">
                <Select
                  className="year-select reg-filter-select1 innerSelect-value-draws"
                  style={{ minWidth: 210, maxWidth: 210 }}
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e)}
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

              <div className="col-sm mt-2">
                <Select
                  className="year-select reg-filter-select1"
                  style={{ maxWidth: 150, minWidth: 150 }}
                  disabled={this.state.firstTimeCompId == '-1' || this.state.filterDates}
                  onChange={roundId => this.onRoundsChange(roundId)}
                  value={this.state.roundId}
                >
                  {this.props.drawsState.getDrawsRoundsData.map(item => (
                    <Option key={'round_' + item.roundId} value={item.roundId}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="col-sm-1 mt-2 mr-n27" style={{ minWidth: 160 }}>
                <Checkbox
                  className="single-checkbox-radio-style"
                  style={{ paddingTop: 8 }}
                  checked={this.state.filterDates}
                  onChange={e => this.onDateRangeCheck(e.target.checked)}
                  disabled={this.state.firstTimeCompId == '-1'}
                >
                  {AppConstants.filterDates}
                </Checkbox>
              </div>
              <div className="col-sm mt-2">
                <div className="w-100 d-flex flex-row align-items-center" style={{ minWidth: 255 }}>
                  <RangePicker
                    disabled={
                      this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true
                    }
                    onChange={date => this.onChangeStartDate(date)}
                    format="DD-MM-YYYY"
                    style={{ width: '100%', minWidth: 200 }}
                    value={[moment(this.state.startDate), moment(this.state.endDate)]}
                  />
                </div>
              </div>

              <div className="col-sm-0 d-flex justify-content-end align-items-center pr-1 goBtn">
                <Button
                  className="primary-add-comp-form"
                  type="primary"
                  onClick={() => this.applyDateFilter()}
                >
                  {AppConstants.go}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  ///////left side view for venue listing with checkbox
  venueLeftView = () => {
    const { competitionVenues } = this.props.drawsState;
    const { showAllVenue } = this.state;

    const mainCheckboxValue = this.allFilterValue(competitionVenues);

    return (
      <>
        <div className="row d-flex align-items-center">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.venue}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href="#venue-collapsable-div"
              role="button"
              aria-expanded="false"
              // aria-controls={teamIndex}
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="venue-collapsable-div" className="pt-3 collapse in division-collapsable-div">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={mainCheckboxValue}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'venue')}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(competitionVenues) &&
            competitionVenues.map((item, index) => {
              return (
                index < this.checkDisplayCountList(competitionVenues, showAllVenue) && (
                  <div key={'competitionVenue_' + item.id} className="column pl-5">
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e =>
                        this.props.checkBoxOnChange(
                          e.target.checked,
                          'competitionVenues',
                          index,
                          0,
                          this.state.showOnlyFilters,
                        )
                      }
                    >
                      {item.name}
                    </Checkbox>
                  </div>
                )
              );
            })}
          {(isArrayNotEmpty(competitionVenues) || competitionVenues.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('venue')}
            >
              {showAllVenue ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };
  timeslotLeftView = () => {
    let { timelsotHourlyList } = this.props.drawsState;
    let { showAllTimeslot } = this.state;
    return (
      <>
        <div className="row d-flex align-items-center">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.timeSlot}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href={`#timeslot-collapsable-div`}
              role="button"
              aria-expanded="false"
              // aria-controls={teamIndex}
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="timeslot-collapsable-div" className="pt-3 collapse in division-collapsable-div">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.allTimeslotChecked}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'timeslotHour')}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(timelsotHourlyList) &&
            timelsotHourlyList.map((item, index) => {
              return (
                index < this.checkDisplayCountList(timelsotHourlyList, showAllTimeslot) && (
                  <div key={'competitionTimeslot_' + item.key} className="column pl-5">
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e =>
                        this.props.checkBoxOnChange(
                          e.target.checked,
                          'timeslotHour',
                          index,
                          0,
                          this.state.showOnlyFilters,
                        )
                      }
                    >
                      {item.label}
                    </Checkbox>
                  </div>
                )
              );
            })}
          {(isArrayNotEmpty(timelsotHourlyList) || timelsotHourlyList.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('timeslotHour')}
            >
              {showAllTimeslot ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };
  ///////left side view for competition liting with checkbox
  competitionLeftView = () => {
    const { own_CompetitionArr } = this.props.appState;
    const { drawsCompetitionArray } = this.props.drawsState;
    const { showAllComp } = this.state;

    const mainCheckboxValue = this.allFilterValue(drawsCompetitionArray);

    return (
      <>
        <div className="row">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.competitions}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href="#comp-collapsable-div"
              role="button"
              aria-expanded="true"
              // aria-controls={teamIndex}
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="comp-collapsable-div" className="pt-3 collapse in">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={mainCheckboxValue}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'competition')}
          >
            {AppConstants.all}
          </Checkbox>
          <div className={showAllComp ? 'multi-draw-left-list-view' : ''}>
            {isArrayNotEmpty(drawsCompetitionArray) &&
              drawsCompetitionArray.map((item, index) => {
                return (
                  index < this.checkDisplayCountList(own_CompetitionArr, showAllComp) && (
                    <div className="column pl-5">
                      <Checkbox
                        className="single-checkbox-radio-style"
                        style={{ paddingTop: 8 }}
                        checked={item.checked}
                        onChange={e =>
                          this.props.checkBoxOnChange(e.target.checked, 'competition', index)
                        }
                      >
                        {item.competitionName}
                      </Checkbox>
                    </div>
                  )
                );
              })}
          </div>
          {(isArrayNotEmpty(drawsCompetitionArray) || drawsCompetitionArray.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('comp')}
            >
              {showAllComp ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };

  //navigateToDrawEdit
  navigateToDrawEdit = () => {
    if (this.state.firstTimeCompId == '-1' || this.state.filterDates) {
      this.props.clearMultiDraws('rounds');
      history.push('/competitionDrawEdit');
    } else {
      history.push('/competitionDrawEdit');
    }
  };

  ///////left side view for division liting with checkbox
  divisionLeftView = () => {
    const { divisionGradeNameListForRound, drawDivisions } = this.props.drawsState;
    const { showAllDivision } = this.state;

    const mainCheckboxValue = this.allFilterValue(divisionGradeNameListForRound);

    return (
      <>
        <div className="row">
          <div className="col-sm d-flex justify-content-start ">
            <span className="user-contact-heading">{AppConstants.divisions}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href={`#division-collapsable-div`}
              role="button"
              aria-expanded="true"
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        {this.state.firstTimeCompId == '-1' || this.state.filterDates ? (
          <div id="division-collapsable-div" className="pt-0 collapse in division-collapsable-div">
            <Checkbox
              className="single-checkbox-radio-style"
              style={{ paddingTop: 8 }}
              checked={this.state.allDivisionChecked}
              onChange={e => this.changeAllVenueStatus(e.target.checked, 'allDivisionChecked')}
            >
              {AppConstants.all}
            </Checkbox>
            {isArrayNotEmpty(drawDivisions) &&
              drawDivisions.map((item, index) => (
                <div className="column pl-5">
                  <div style={{ paddingTop: 10, paddingBottom: 10 }}>
                    <span className="inbox-time-text">{item.competitionName}</span>
                  </div>
                  {isArrayNotEmpty(item.legendArray) &&
                    item.legendArray.map((subItem, subIndex) => (
                      <div key={'divisionGradef_' + subItem.competitionDivisionGradeId}>
                        <Checkbox
                          className={`single-checkbox-radio-style ${getColor(subItem.colorCode)}`}
                          style={{ paddingTop: 8 }}
                          checked={subItem.checked}
                          onChange={e =>
                            this.props.checkBoxOnChange(
                              e.target.checked,
                              'division',
                              index,
                              subIndex,
                              this.state.showOnlyFilters,
                            )
                          }
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                              className="checkbox-division-draw-circle"
                              style={{ backgroundColor: item.colorCode }}
                            ></div>
                            <div>{subItem.divisionName + '-' + subItem.gradeName}</div>
                          </div>
                        </Checkbox>
                      </div>
                    ))}
                </div>
              ))}
            {(isArrayNotEmpty(drawDivisions) || drawDivisions.length > 5) && (
              <span
                className="input-heading-add-another pt-4"
                onClick={() => this.changeShowAllStatus('division')}
              >
                {showAllDivision ? AppConstants.hide : AppConstants.showAll}
              </span>
            )}
          </div>
        ) : (
          <div id="division-collapsable-div" className="pt-0 collapse in division-collapsable-div">
            <Checkbox
              className="single-checkbox-radio-style"
              style={{ paddingTop: 8 }}
              checked={mainCheckboxValue}
              onChange={e =>
                this.changeAllVenueStatus(e.target.checked, 'singleCompDivisionCheked')
              }
            >
              {AppConstants.all}
            </Checkbox>
            {isArrayNotEmpty(divisionGradeNameListForRound) &&
              divisionGradeNameListForRound.map((item, index) => {
                return (
                  index <
                    this.checkDisplayCountList(divisionGradeNameListForRound, showAllDivision) && (
                    <div
                      key={'divisionGrade_' + item.competitionDivisionGradeId}
                      className="column pl-5"
                    >
                      <Checkbox
                        className={`single-checkbox-radio-style ${getColor(item.colorCode)}`}
                        style={{ paddingTop: 8 }}
                        checked={item.checked}
                        onChange={e =>
                          this.props.checkBoxOnChange(
                            e.target.checked,
                            'singleCompeDivision',
                            index,
                            0,
                            this.state.showOnlyFilters,
                          )
                        }
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            className="checkbox-division-draw-circle"
                            style={{ backgroundColor: item.colorCode }}
                          ></div>
                          <div>{item.name}</div>
                        </div>
                      </Checkbox>
                    </div>
                  )
                );
              })}

            {(isArrayNotEmpty(divisionGradeNameListForRound) ||
              divisionGradeNameListForRound.length > 5) && (
              <span
                className="input-heading-add-another pt-4"
                onClick={() => this.changeShowAllStatus('division')}
              >
                {showAllDivision ? AppConstants.hide : AppConstants.showAll}
              </span>
            )}
          </div>
        )}
      </>
    );
  };

  ///////left side view for organisation listing with checkbox
  organisationLeftView = () => {
    const { drawOrganisations } = this.props.drawsState;
    const { showAllOrg } = this.state;

    const mainCheckboxValue = this.allFilterValue(drawOrganisations);

    return (
      <>
        <div className="row">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.organisation}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href={`#org-collapsable-div`}
              role="button"
              aria-expanded="true"
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="org-collapsable-div" className="pt-3 collapse in">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={mainCheckboxValue}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'org')}
          >
            {AppConstants.all}
          </Checkbox>
          <div className={showAllOrg ? 'multi-draw-left-list-view' : ''}>
            {isArrayNotEmpty(drawOrganisations) &&
              drawOrganisations.map((item, index) => {
                return (
                  index < this.checkDisplayCountList(drawOrganisations, showAllOrg) && (
                    <div key={'org' + index} className="column pl-5">
                      <Checkbox
                        className="single-checkbox-radio-style"
                        style={{ paddingTop: 8 }}
                        checked={item.checked}
                        onChange={e => {
                          this.props.checkBoxOnChange(
                            e.target.checked,
                            'organisation',
                            index,
                            0,
                            this.state.showOnlyFilters,
                          );
                          const checkOrganisationFalse = this.checkAllCompetitionData(
                            drawOrganisations,
                            'organisationUniqueKey',
                          );
                          this.setState({ notCheckedOrganisations: checkOrganisationFalse });
                        }}
                      >
                        {item.organisationName}
                      </Checkbox>
                    </div>
                  )
                );
              })}
          </div>
          {(isArrayNotEmpty(drawOrganisations) || drawOrganisations.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('org')}
            >
              {showAllOrg ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };

  //unlockDraws
  unlockDraws = (id, round_Id, venueCourtId) => {
    const key =
      this.state.firstTimeCompId == '-1' || this.state.filterDates ? 'all' : 'singleCompetition';
    this.props.unlockDrawsAction(id, round_Id, venueCourtId, key);
  };

  sideMenuView = () => {
    const { filterEnable } = this.state;
    return (
      <div
        className="multiDrawContentView multi-draw-list-top-head pr-0"
        style={{
          display: !filterEnable && 'flex',
          justifyContent: !filterEnable && 'center',
          paddingLeft: !filterEnable && 1,
        }}
      >
        {filterEnable ? (
          <div
            className="d-flex align-items-center mt-4 pointer"
            onClick={() => this.filterOnClick()}
          >
            <img
              className="dot-image"
              src={AppImages.filterIcon}
              alt=""
              width="20"
              height="20"
              style={{ marginBottom: 7 }}
            />
            <span className="input-heading-add-another pt-0 pl-3">
              {filterEnable ? AppConstants.hideFilter : AppConstants.showFilter}
            </span>
          </div>
        ) : (
          <div
            className="d-flex align-items-center mt-1 pointer"
            onClick={() => this.filterOnClick()}
          >
            <img className="dot-image" src={AppImages.filterIcon} alt="" width="28" height="28" />
          </div>
        )}
        {filterEnable && this.venueLeftView()}
        {this.state.firstTimeCompId !== '-1' ||
          !this.state.filterDates ||
          (filterEnable && this.competitionLeftView())}
        {filterEnable && this.divisionLeftView()}
        {filterEnable && this.timeslotLeftView()}
        {filterEnable && this.organisationLeftView()}
      </div>
    );
  };

  onShowOnlyFilterChange = filterValue => {
    this.setState({ showOnlyFilters: filterValue });
  };

  containerView() {
    const getRoundsDrawsdata = this.props.drawsState.filteredRoundsDrawsdata;
    let hasSubCourtDivision = this.props.drawsState.hasSubCourtDivision;
    return (
      <div className="multiDrawContentView">
        <div className="multi-draw-list-top-head row align-content-center">
          <div className="col-sm-8 mt-3 pr-0" style={{ minWidth: 310 }}>
            <span className="form-heading">{AppConstants.matchCalender}</span>
            <Checkbox
              className="single-checkbox"
              checked={this.props.drawsState.isTimelineMode}
              onChange={e => {
                this.openConfirmToggleTimeline(e.target.checked);
              }}
            >
              {AppConstants.timeline}
            </Checkbox>
            <Checkbox
              className="single-checkbox-radio-style ml-0 my-2"
              checked={this.state.isDivisionNameShow}
              onChange={e => this.onCalendarCheckboxChange('isDivisionNameShow', e.target.checked)}
            >
              {AppConstants.showByDivision}
            </Checkbox>
            <Checkbox
              className="single-checkbox-radio-style ml-0 my-2"
              checked={this.state.isAxisInverted}
              onChange={e => this.onCalendarCheckboxChange('isAxisInverted', e.target.checked)}
            >
              {AppConstants.invertAxis}
            </Checkbox>
            <span className="mr-3">{AppConstants.showOnly}</span>
            <Select
              className="year-select reg-filter-select1 innerSelect-value-draws pr-3"
              style={{ minWidth: 210, maxWidth: 210 }}
              mode="multiple"
              value={this.state.showOnlyFilters}
              onChange={this.onShowOnlyFilterChange}
            >
              <Option
                key={'showonlyfilter_' + DrawShowOnlyType.SelectedVenues}
                value={DrawShowOnlyType.SelectedVenues}
              >
                {AppConstants.selectedVenues}
              </Option>
              <Option
                key={'showonlyfilter_' + DrawShowOnlyType.SelectedOrganisations}
                value={DrawShowOnlyType.SelectedOrganisations}
              >
                {AppConstants.selectedOrganisations}
              </Option>
              <Option
                key={'showonlyfilter_' + DrawShowOnlyType.SelectedDivisions}
                value={DrawShowOnlyType.SelectedDivisions}
              >
                {AppConstants.selectedDivisions}
              </Option>
              <Option
                key={'showonlyfilter_' + DrawShowOnlyType.ScheduledMatches}
                value={DrawShowOnlyType.ScheduledMatches}
              >
                {AppConstants.scheduledMatches}
              </Option>
            </Select>
          </div>
          <div className="col-sm-4 pr-0 d-flex justify-content-end align-items-center">
            <Menu theme="light" mode="horizontal">
              <Menu.SubMenu
                key="sub1"
                title={
                  <div>
                    <span>{AppConstants.action}</span>
                    <i
                      className="fa fa-angle-down theme-color"
                      aria-hidden="true"
                      style={{ marginLeft: 7 }}
                    />
                  </div>
                }
                className="input-heading-add-another"
              >
                <Menu.Item key="1" onClick={() => this.onMatchesList()}>
                  <span>{AppConstants.exportMatches}</span>
                </Menu.Item>
                <Menu.Item key="2">
                  <NavLink
                    to={{
                      pathname: '/competitionDrawsImport',
                      state: {
                        competitionId: this.state.firstTimeCompId,
                        organisationId: this.state.organisationId,
                      },
                    }}
                    className="text-decoration-none mr-5"
                  >
                    <span>{AppConstants.importDraws}</span>
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="3" onClick={() => this.navigateToDrawEdit()}>
                  <span>{AppConstants.editWhoPlaysWho}</span>
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </div>
        </div>
        <div>
          {this.props.drawsState.spinLoad && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: 100 }}
            >
              <Spin
                size="default"
                spinning={this.props.drawsState.spinLoad}
                style={{ backgroundColor: 'rgba(255,255,255, 0.5)', padding: '0.5em' }}
              />
            </div>
          )}
          {getRoundsDrawsdata.length <= 0 && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: 100 }}
            />
          )}
          {this.props.drawsState.updateLoad || this.props.drawsState.swapLoad ? (
            <div className="draggable-wrap draw-data-table">
              <Loader visible={this.props.drawsState.updateLoad} />

              {getRoundsDrawsdata.map((dateItem, dateIndex) => (
                <div className="pt-4 pb-4" key={'drawData' + dateIndex}>
                  {this.state.firstTimeCompId != '-1' && (
                    <div className="draws-round-view">
                      <span className="draws-round">{dateItem.roundName}</span>
                    </div>
                  )}
                  <div key={'drawData' + dateIndex}>
                    {process.env.REACT_APP_VENUE_CONFIGURATION_ENABLED == 'true' &&
                    hasSubCourtDivision
                      ? this.draggableSubCourtView(dateItem)
                      : this.draggableView(dateItem)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="draggable-wrap draw-data-table">
              <Loader visible={this.props.drawsState.updateLoad} />

              {getRoundsDrawsdata.map((dateItem, dateIndex) => (
                <div className="pt-4 pb-4" key={'drawData' + dateIndex}>
                  {this.state.firstTimeCompId != '-1' && (
                    <div className="draws-round-view">
                      <span className="draws-round">{dateItem.roundName}</span>
                    </div>
                  )}
                  {process.env.REACT_APP_VENUE_CONFIGURATION_ENABLED == 'true' &&
                  hasSubCourtDivision
                    ? this.draggableSubCourtView(dateItem)
                    : this.draggableView(dateItem)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  checkDate(date, index, dateArray) {
    if (index == 0) {
      return moment(date).format('DD MMM, ddd');
    } else {
      if (
        moment(dateArray[index].date).format('DD-MM-YYYY') ==
        moment(dateArray[index - 1].date).format('DD-MM-YYYY')
      ) {
        return moment(date).format('ddd');
      } else {
        return moment(date).format('DD MMM, ddd');
      }
    }
  }

  getStartTime = dateWithStartTime => {
    const isTimeStartsAtHourStart =
      moment(dateWithStartTime).format('HH:mm') ===
      moment(dateWithStartTime).startOf('hour').format('HH:mm');

    const startTime = isTimeStartsAtHourStart
      ? moment(dateWithStartTime).format('HH:mm')
      : moment(dateWithStartTime).startOf('hour').format('HH:mm');

    return startTime;
  };

  getEndTime = dateWithEndTime => {
    const isTimeEndsAtHourEnd =
      moment(dateWithEndTime).format('HH:mm') ===
      moment(dateWithEndTime).startOf('hour').format('HH:mm');

    const endTime = isTimeEndsAtHourEnd
      ? moment(dateWithEndTime).format('HH:mm')
      : moment(dateWithEndTime).endOf('hour').add(1, 'minutes').format('HH:mm');

    return endTime;
  };

  getStartAndEndDayTime = (itemDate, dateNewArray) => {
    const schedule = this.getWeeklySchedule();
    const { showOnlyFilters } = this.state;
    const isFilterSchedule = showOnlyFilters.includes(AppConstants.scheduledMatches);

    const filteredDateArray = dateNewArray.filter(item => getDate(item.date) === itemDate);

    const dayDate = getDate(filteredDateArray[0].date);

    // for Show only scheduled matches filter
    const sortedByStartTimeDateArray = filteredDateArray.sort(
      (a, b) => moment(a.date) - moment(b.date),
    );
    const firstEventInDayStart = sortedByStartTimeDateArray[0]?.date;

    const sortedByEndTimeDateArray = filteredDateArray.sort(
      (a, b) => moment(getDate(a.date) + a.endTime) - moment(getDate(b.date) + b.endTime),
    );
    const lastEventInDayEnd =
      dayDate + sortedByEndTimeDateArray[sortedByEndTimeDateArray.length - 1].endTime;

    const firstEventHourStart = moment(firstEventInDayStart).startOf('hour').format('HH:mm');

    const lastEventHourEnd = this.getEndTime(lastEventInDayEnd);

    const itemDateDayOfWeek = moment(itemDate.trim().replace('T', '')).format('dddd').toLowerCase();

    const findSchedule = schedule.find(
      scheduleDay => scheduleDay.day.toLowerCase() === itemDateDayOfWeek,
    );

    const scheduleHourStart =
      findSchedule && this.getStartTime(dayDate + findSchedule.timeslot.startTime);
    const scheduleHourEnd =
      findSchedule && this.getEndTime(dayDate + findSchedule.timeslot.endTime);

    const startDayTime =
      isFilterSchedule || !findSchedule ? firstEventHourStart : scheduleHourStart;
    const endDayTime = isFilterSchedule || !findSchedule ? lastEventHourEnd : scheduleHourEnd;

    return { startDayTime, endDayTime };
  };

  getDraggableViewHeaderData = (itemDate, dateNewArray) => {
    const { startDayTime, endDayTime } = this.getStartAndEndDayTime(itemDate, dateNewArray);

    const startDayTimeStartHour = this.getStartTime(itemDate + startDayTime);
    const endDayTimeStartHour = this.getEndTime(itemDate + endDayTime);

    const timeAllDayScheduleHours = [startDayTimeStartHour];

    while (timeAllDayScheduleHours[timeAllDayScheduleHours.length - 1] !== endDayTimeStartHour) {
      const newTime = moment(itemDate + timeAllDayScheduleHours[timeAllDayScheduleHours.length - 1])
        .add(ONE_HOUR_IN_MIN, 'minutes')
        .format('HH:mm');
      timeAllDayScheduleHours.push(newTime);
    }

    return timeAllDayScheduleHours;
  };

  defineDayBg = () => {
    const { isAxisInverted } = this.state;

    let backgroundSize = '';
    let backgroundImage = '';
    let backgroundPosition = '';
    let backgroundPositionCounter = -30;

    for (let i = 0; i <= 10; i++) {
      backgroundSize += `${(ONE_MIN_WIDTH * ONE_HOUR_IN_MIN) / 2}px ${ONE_MIN_WIDTH * 30}px`;
      backgroundImage +=
        'radial-gradient(1px 1px at left center, rgb(170, 170, 170) 1px, transparent 1px)';
      backgroundPosition += `0px ${backgroundPositionCounter}px`;
      backgroundPositionCounter += 5;

      if (i < 10) {
        backgroundSize += ', ';
        backgroundImage += ', ';
        backgroundPosition += ', ';
      }
    }

    const verticalDashedBg = {
      backgroundSize,
      backgroundImage,
      backgroundPosition,
    };

    const horizontalDashedBg = {
      backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 51%,rgba(255,255,255,0) 100%),' +
        'linear-gradient(to bottom, rgba(170,170,170,1) 0%, rgba(170,170,170,0) 3%, rgba(170,170,170,0) 100%)',
      backgroundSize: `5px ${ONE_MIN_WIDTH * 30}px`,
    };

    const dayBgAvailable = isAxisInverted ? horizontalDashedBg : verticalDashedBg;

    return dayBgAvailable;
  };
  toggleCourt(courtData) {
    courtData.isExpanded = !courtData.isExpanded;
    this.setState({ redraw: true });
  }
  dayHeadView = (date, dateNewArray, dayMargin) => {
    const { isAxisInverted } = this.state;

    return (
      <div
        className={`draws-x-head d-flex ${isAxisInverted ? 'flex-column align-items-end' : ''}`}
        style={{
          margin: isAxisInverted ? 0 : '0 0 0 34px',
          top: 0,
          flexShrink: 0,
        }}
      >
        {date.map((itemDate, index) => {
          // for drawing days position
          const newTimeAllDayScheduleHours = [
            ...this.getDraggableViewHeaderData(itemDate, dateNewArray),
          ];

          if (index < date.length - 1) {
            newTimeAllDayScheduleHours.pop();
          }

          return newTimeAllDayScheduleHours.map((itemTime, indexTime) => {
            if (index !== 0 || indexTime !== 0) {
              dayMargin += ONE_HOUR_IN_MIN * ONE_MIN_WIDTH;
            }
            if (index === 0 && indexTime === 0) {
              dayMargin = 0;
            }

            return (
              <div
                key={'time' + index + indexTime}
                className={`d-flex ${isAxisInverted ? 'justify-content-end' : 'flex-column'}`}
                style={{
                  left: dayMargin,
                  fontSize: 11,
                  width: isAxisInverted ? 'fit-content' : ONE_HOUR_IN_MIN * ONE_MIN_WIDTH,
                  height: isAxisInverted ? ONE_HOUR_IN_MIN * ONE_MIN_WIDTH : 'fit-content',
                }}
              >
                <span className="draws-x-head-text">
                  {!indexTime
                    ? moment(itemDate + itemTime).format('DD MMM, ddd')
                    : moment(itemDate + itemTime).format('ddd')}
                </span>
                <span className="draws-x-head-text">
                  {isAxisInverted ? `, ${itemTime.slice(-5)}` : itemTime.slice(-5)}
                </span>
              </div>
            );
          });
        })}
      </div>
    );
  };

  courtHorizontalHeadView = dateItem => {
    let hasSubCourtDivision = this.props.drawsState.hasSubCourtDivision;
    return (
      <div
        className="table-head-wrap d-flex position-relative"
        style={{
          left: 150,
        }}
      >
        {dateItem.draws &&
          dateItem.draws.map((courtData, index) => {
            let width = 70;
            if (isVenueFieldConfigurationEnabled) {
              if (courtData.isExpanded) {
                width = 448;
              }
            }

            return (
              <div
                key={'court' + index}
                className="d-flex justify-content-center"
                style={{ width: width }}
              >
                {isVenueFieldConfigurationEnabled && hasSubCourtDivision && (
                  <span
                    className="app-color pointer f-13"
                    onClick={() => this.toggleCourt(courtData)}
                  >
                    {courtData.isExpanded ? '-' : '+'}
                  </span>
                )}
                <span className="draws-x-head-text">
                  {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                </span>
              </div>
            );
          })}
      </div>
    );
  };

  unavailableTextView = () => {
    const { isAxisInverted } = this.state;

    return (
      <span
        className={`text-capitalize ${isAxisInverted ? '' : 'text-overflow'}`}
        style={{
          transform: isAxisInverted ? 'rotate(-90deg)' : 'none',
        }}
      >
        {AppConstants.unavailable}
      </span>
    );
  };

  unavailableDayView = (
    courtData,
    fieldItemDateIndex,
    diffDayScheduleTime,
    prevDaysWidth,
    slotHeight,
  ) => {
    const { isAxisInverted } = this.state;

    return (
      <div
        key={'slot' + fieldItemDateIndex}
        className={isAxisInverted ? 'position-absolute' : 'position-relative'}
        style={{
          width: `calc(100%) - ${prevDaysWidth}`,
          height: '100%',
          left: isAxisInverted ? '50%' : 75,
        }}
      >
        <div
          id={courtData.venueCourtId}
          className="box-draws unavailable-draws align-items-center"
          style={{
            minWidth: slotHeight,
            cursor: 'not-allowed',
            background: `repeating-linear-gradient( -45deg, #ebf0f3, #ebf0f3 ${
              ONE_HOUR_IN_MIN / 5
            }px, #d9d9d9 ${ONE_HOUR_IN_MIN / 5}px, #d9d9d9 ${
              (ONE_HOUR_IN_MIN / 5) * ONE_MIN_WIDTH
            }px )`,
            ...(isAxisInverted
              ? {
                  left: 0,
                  top: prevDaysWidth,
                  width: slotHeight,
                  height: diffDayScheduleTime,
                  transform: 'translateX(-50%)',
                }
              : {
                  left: prevDaysWidth,
                  top: '50%',
                  width: diffDayScheduleTime,
                  height: slotHeight,
                  transform: 'translateY(-50%)',
                }),
          }}
          onDragOver={() => {
            if (this.state.dragDayTarget) {
              this.setState({ dragDayTarget: null });
            }
          }}
          onDragEnd={e => this.handleDragEnd(e)}
        >
          {this.unavailableTextView()}
        </div>
      </div>
    );
  };
  setTooltipSwappableTime = () => {
    this.setState({ tooltipSwappableTime: null });
  };
  draggableView = dateItem => {
    let allprops = {
      ...this.props,
      ...this.state,
      dateItem: dateItem,
      courtHorizontalHeadView: this.courtHorizontalHeadView,
      dayHeadView: this.dayHeadView,
      drawsFieldMove: this.drawsFieldMove,
      addDisplayNoneTooltip: this.addDisplayNoneTooltip,
      drawsFieldUp: this.drawsFieldUp,
      dayLineDragMove: this.dayLineDragMove,
      defineDayBg: this.defineDayBg,
      getStartAndEndDayTime: this.getStartAndEndDayTime,
      getDayTimeRestrictions: this.getDayTimeRestrictions,
      checkUnavailableTimeWidth: this.checkUnavailableTimeWidth,
      unavailableDayView: this.unavailableDayView,
      unavailableTextView: this.unavailableTextView,
      slotObjectDragOver: this.slotObjectDragOver,
      slotObjectMouseEnter: this.slotObjectMouseEnter,
      slotObjectMouseDown: this.slotObjectMouseDown,
      slotObjectMouseLeave: this.slotObjectMouseLeave,
      setTooltipSwappableTime: this.setTooltipSwappableTime,
      handleDragEnd: this.handleDragEnd,
      setDraggingState: this.setDraggingState,
      checkColor: this.checkColor,
      checkSwap: this.checkSwap,
      unlockDraws: this.unlockDraws,
      dragTimeRef: this.dragTimeRef,
      dragTimeEndRef: this.dragTimeEndRef,
      onDrawUpdated: () => this.forceUpdate(),
    };
    return <MultiFieldDrawsFullCourtTimeline {...allprops}></MultiFieldDrawsFullCourtTimeline>;
  };
  draggableSubCourtView = dateItem => {
    let allprops = {
      ...this.props,
      ...this.state,
      dateItem: dateItem,
      courtHorizontalHeadView: this.courtHorizontalHeadView,
      dayHeadView: this.dayHeadView,
      drawsFieldMove: this.drawsFieldMove,
      addDisplayNoneTooltip: this.addDisplayNoneTooltip,
      drawsFieldUp: this.drawsFieldUp,
      dayLineDragMove: this.dayLineDragMove,
      defineDayBg: this.defineDayBg,
      getStartAndEndDayTime: this.getStartAndEndDayTime,
      getDayTimeRestrictions: this.getDayTimeRestrictions,
      checkUnavailableTimeWidth: this.checkUnavailableTimeWidth,
      unavailableDayView: this.unavailableDayView,
      unavailableTextView: this.unavailableTextView,
      slotObjectDragOver: this.slotObjectDragOver,
      slotObjectMouseEnter: this.slotObjectMouseEnter,
      slotObjectMouseDown: this.slotObjectMouseDown,
      slotObjectMouseLeave: this.slotObjectMouseLeave,
      setTooltipSwappableTime: this.setTooltipSwappableTime,
      setDraggingState: this.setDraggingState,
      checkColor: this.checkColor,
      checkSwap: this.checkSwap,
      unlockDraws: this.unlockDraws,
      dragTimeRef: this.dragTimeRef,
      dragTimeEndRef: this.dragTimeEndRef,
      onDrawUpdated: () => this.forceUpdate(),
    };
    return <MultiFieldDrawsSubCourtTimeline {...allprops}></MultiFieldDrawsSubCourtTimeline>;
  };
  contentView = () => {
    return (
      <div className="row">
        <div className={this.state.filterEnable ? 'col-sm-3' : 'col-sm-1'}>
          {this.sideMenuView()}
        </div>
        <div className={this.state.filterEnable ? 'col-sm-9' : 'col-sm'}>
          {this.containerView()}
          <Footer>{this.footerView()}</Footer>
        </div>
      </div>
    );
  };

  handleRegenerateDrawException = key => {
    try {
      if (key === 'ok') {
        if (
          this.state.publishPartModel.isShowPart &&
          !this.state.generateRoundId &&
          (!this.state.selectedDivisions || this.state.selectedDivisions.length == 0)
        ) {
          message.error(AppConstants.selectOneRoundOrDivisioin);
          return;
        }
        let now = new Date().getTime();
        let canRegenerate = 0;
        let lastDrawRegenerateTime = getLastDrawRegenerateTime();
        if (lastDrawRegenerateTime) {
          //can publish 10 seconds later
          if (now - parseInt(lastDrawRegenerateTime) > 10 * 1000) {
            canRegenerate = 1;
          }
        } else {
          canRegenerate = 1;
        }
        if (canRegenerate) {
          setLastDrawRegenerateTime(now);
          this.callGenerateDraw(this.state.regenerateExceptionRefId);
        }
        this.setState({ regenerateDrawExceptionModalVisible: false, regenerateExceptionRefId: 1 });
      } else {
        this.setState({ regenerateDrawExceptionModalVisible: false, generateRoundId: null });
        this.resetPublishModalForm();
      }
    } catch (ex) {
      console.log('Error in handleRegenerateDrawException::' + ex);
    }
  };

  callGenerateDraw = (regenerateExceptionRefId, lockedDraws) => {
    const payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: this.state.firstTimeCompId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      roundId: this.state.generateRoundId,
      isPartial: this.state.publishPartModel.isShowPart,
      divisions: [],
      regeneratePastMatches: this.state.publishPastMatches,
      compactMatchesMode: this.state.compactMatchesMode,
      lockedDraws,
    };
    if (regenerateExceptionRefId) {
      payload['exceptionTypeRefId'] = regenerateExceptionRefId;
    }
    if (this.state.publishPartModel.isShowPart) {
      payload.divisions = this.state.selectedDivisions;
    }
    this.props.generateDrawAction(payload);
    this.setState({ venueLoad: true });
  };

  reGenerateDraw = () => {
    this.resetPublishModalForm();
    this.setState({ regenerateDrawExceptionModalVisible: true });
  };
  saveEditDraws = () => {
    const key = this.state.firstTimeCompId === '-1' || this.state.filterDates ? 'all' : 'add';
    const yearId = getGlobalYear();
    const storedCompetitionId = getOwn_competition();
    const venueId = getDraws_venue();
    const roundId = getDraws_round();
    var sourceIndexArray = [];
    var targetIndexArray = [];
    //const apiData=this.state.editedDraw.apiData;
    const postObject = {
      competitionId: storedCompetitionId,
      draws: JSON.parse(JSON.stringify(this.state.editedDraw.draws)),
    };
    let startDate = null;
    let endDate = null;
    if (this.state.firstTimeCompId == '-1' || this.state.filterDates) {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }
    //console.log(this.state.editedDraw.draws);
    this.props.updateCompetitionDrawsTimeline(
      postObject,
      sourceIndexArray,
      targetIndexArray,
      key,
      parseInt(roundId),
      yearId,
      storedCompetitionId,
      venueId,
      this.state.firstTimeCompId == '-1' || this.state.filterDates ? 0 : roundId,
      null,
      startDate,
      endDate,
      this.state.filterDates,
      async () => {
        const swappedDraws = this.swappedDraws;
        if (swappedDraws.length) {
          const { result: { data: affectedMatches = {} } = {} } =
            await CompetitionAxiosApi.getAffectedDraws(swappedDraws);
          if (flatten(Object.values(affectedMatches)).length) {
            this.affectedDraws = affectedMatches;
            this.setState({ showAffectedMatchesModal: true });
          } else {
            this.affectedDraws = {};
          }
        }
        this.state.editedDraw.draws.length = 0;
      },
    );
  };

  saveAndPublishDraws = isTeamNotInDraws => {
    isTeamNotInDraws == 1 ? this.openModel(this.props) : this.check();
  };

  check = () => {
    if (this.state.firstTimeCompId == null || this.state.firstTimeCompId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectCompetition);
    } else if (this.state.venueId == null && this.state.venueId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectVenue);
    } else {
      this.resetPublishModalForm();
      this.setState({ visible: true });
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
  setDrawState = updatedState => {
    this.setState(updatedState);
  };
  regenerateDrawExceptionModal = () => {
    let isPastMatchAvailable = this.props.drawsState.isPastMatchAvailable;
    return (
      <DrawsRegenerateModal
        regenerateVisible={this.state.regenerateDrawExceptionModalVisible}
        divisionGradeNameList={this.props.drawsState.divisionGradeNameList}
        getDrawsRoundsData={this.props.drawsState.getDrawsRoundsData}
        modelCheckDivision={e => this.checkDivision(e)}
        modelCheckRound={e => this.checkRound(e)}
        modelCancel={() => this.handleRegenerateDrawException('cancel')}
        modelRadio={this.onChangeRadio}
        modalRegenerate={() => this.handleRegenerateDrawException('ok')}
        modalDivisions={e => this.onSelectDivisionsValues(e)}
        modalRounds={e => this.setState({ generateRoundId: e })}
        modalRadioValue={this.state.value}
        modalIsShowPart={this.state.publishPartModel.isShowPart}
        modalIsShowDivision={this.state.publishPartModel.publishPart.isShowDivision}
        modalIsShowRound={this.state.publishPartModel.publishPart.isShowRound}
        modalRegeneratePastMatch={this.state.publishPastMatches}
        modalRegeneratePastMatchRadio={this.onChangePublishPastMatches}
        isPastMatchAvailable={isPastMatchAvailable}
        regenerateExceptionRefId={this.state.regenerateExceptionRefId}
        setDrawState={this.setDrawState}
        competitionTypeRefId={this.props.drawsState.competitionTypeRefId}
        compactMatchesMode={this.state.compactMatchesMode}
      />
    );
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

  handlePublishModal = key => {
    try {
      if (key === 'ok') {
        let competitiondata = this.props.drawsState.liveScoreCompetiton;
        localStorage.setItem('LiveScoreCompetition', JSON.stringify(competitiondata));
        localStorage.removeItem('stateWideMessage');
        setLiveScoreUmpireCompition(competitiondata.id);
        setLiveScoreUmpireCompitionData(JSON.stringify(competitiondata));
        history.push('/matchDayLadderList');
      } else {
        this.setState({ publishModalVisible: false });
      }
    } catch (ex) {
      console.log('Error in handlePublishModal::' + ex);
    }
  };

  get swappedDraws() {
    return this.state.editedDraw.draws
      .filter(draw => {
        return draw.homeTeamId && draw.originalHomeTeamId !== draw.homeTeamId;
      })
      .map(draw => draw.drawsId);
  }

  //////footer view containing all the buttons like publish and regenerate draws
  footerView = () => {
    const { publishStatus, activeDrawsRoundsData, teamNames, isPastMatchAvailable } =
      this.props.drawsState;
    const isTeamNotInDraws = this.props.drawsState.isTeamInDraw;
    let alreadyPublished = this.state.competitionStatus == 1;
    const hasSwappedDraws = !!this.swappedDraws.length;
    const canPublish = !alreadyPublished && !hasSwappedDraws;
    let divisionGradeNameList = this.props.drawsState.divisionGradeNameList;
    divisionGradeNameList = divisionGradeNameList.filter(x => !x.isGradeDeleted);
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row mt-5">
          <div className="col-sm-3">
            <div className="reg-add-save-button" />
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              {/* <NavLink to="/competitionFormat"> */}
              <Button
                className="open-reg-button mr-15"
                type="primary"
                disabled={alreadyPublished}
                onClick={() => this.saveEditDraws()}
              >
                {AppConstants.saveDraw}
              </Button>
              <Button
                className="open-reg-button"
                type="primary"
                disabled={alreadyPublished}
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
                    tooltipVisibleDelete: !canPublish,
                  })
                }
                onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                visible={this.state.tooltipVisibleDelete}
                title={hasSwappedDraws ? AppConstants.hasSwappedDraws : AppConstants.statusPublishHover}
              >
                <Button
                  className="open-reg-button"
                  type="primary"
                  htmlType="submit"
                  style={{
                    height: (!canPublish || publishStatus == 1) && '100%',
                    borderRadius: (!canPublish || publishStatus == 1) && 6,
                  }}
                  onClick={() => this.saveAndPublishDraws(isTeamNotInDraws)}
                  disabled={!canPublish || publishStatus == 1}
                >
                  {AppConstants.saveAndPublish}
                </Button>
              </Tooltip>
            </div>
          </div>
          {/* </div> */}
        </div>

        <DrawsPublishModel
          publishVisible={this.state.visible}
          divisionGradeNameList={divisionGradeNameList}
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
          modalPublishPastMatch={this.state.publishPastMatches}
          modalPublishPastMatchRadio={this.onChangePublishPastMatches}
          isPastMatchAvailable={isPastMatchAvailable}
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
              <Option key={'round_' + d.roundId} value={d.roundId}>
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

  checkDivision = e => {
    if (e.target.checked) {
      this.state.publishPartModel.publishPart.isShowDivision = true;
    } else {
      this.state.publishPartModel.publishPart.isShowDivision = false;
      this.onSelectDivisionsValues(null);
    }
    this.setState({
      publishPartModel: this.state.publishPartModel,
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
      publishPartModel: this.state.publishPartModel,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      publishPastMatches: 0,
    });
    this.resetPublishModalForm();
  };

  resetPublishModalForm = e => {
    this.state.publishPartModel.publishPart.isShowRound = false;
    this.state.publishPartModel.publishPart.isShowDivision = false;
    this.state.publishPartModel.isShowPart = true;
    this.state.value = 2;
    this.state.selectedRounds = null;
    this.state.selectedDivisions = null;
    this.state.visible = false;
    this.state.publishPastMatches = 0;
  };

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

  onChangePublishPastMatches = e => {
    this.setState({
      publishPastMatches: e.target.value,
    });
  };

  publishDraw = () => {
    if (
      this.state.publishPartModel.isShowPart &&
      (!this.state.selectedRounds || this.state.selectedRounds.length == 0) &&
      (!this.state.selectedDivisions || this.state.selectedDivisions.length == 0)
    ) {
      message.error(AppConstants.selectOneRoundOrDivisioin);
      return;
    }
    let now = new Date().getTime();
    let publishToLivescore = 0;
    let lastDrawPublishTime = getLastDrawPublishTime();
    if (lastDrawPublishTime) {
      //can publish 10 seconds later
      if (now - parseInt(lastDrawPublishTime) > 10 * 1000) {
        publishToLivescore = 1;
      }
    } else {
      publishToLivescore = 1;
    }
    if (publishToLivescore) {
      setLastDrawPublishTime(now);
      const storedCompetitionId = getOwn_competition();
      const payload = {
        isPartial: this.state.publishPartModel.isShowPart,
        divisions: [],
        rounds: [],
        publishPastMatches: this.state.publishPastMatches,
        competitionId: storedCompetitionId,
        draws: JSON.parse(JSON.stringify(this.state.editedDraw.draws)),
      };
      if (this.state.publishPartModel.isShowPart) {
        payload.divisions = this.state.selectedDivisions;
        payload.rounds = this.state.selectedRounds;
      }
      this.props.publishDraws(this.state.firstTimeCompId, '', payload);
      this.setState({ visible: false, changeStatus: true });
    } else {
      this.setState({ visible: false });
      console.log('publish is in progress');
    }
  };

  onSelectDivisionsValues = e => {
    this.setState({ selectedDivisions: e });
  };

  onSelectRoundValues = e => {
    this.setState({ selectedRounds: e });
  };

  affectedMatchesView = () => {
    return (
      <>
        <AffectedDrawsModal
          affectedDraws={this.affectedDraws}
          onSave={(lockedDraws) => {
            this.state.publishPartModel.isShowPart = false;
            // retain manual edits
            this.callGenerateDraw(1, lockedDraws);
          }}
          onClose={() => {
            this.affectedDraws = {};
            this.setState({
              showAffectedMatchesModal: false,
            });
          }}
        />
      </>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="18" />

        <Layout className="comp-dash-table-view">
          {this.headerView()}
          <div
            id="draggableTooltip"
            className="unavailable-draws"
            // don't change this inline style, tooltip won't work !!
            style={{
              display: 'none',
            }}
          />
          <Content>{this.contentView()}</Content>

          <Loader
            visible={
              this.props.drawsState.updateLoad || this.props.competitionModuleState.drawGenerateLoad
            }
          />
          {this.regenerateDrawExceptionModal()}
          {this.state.showAffectedMatchesModal && this.affectedMatchesView()}
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
      updateCompetitionDrawsTimeline,
      saveDraws,
      getCompetitionVenue,
      updateCourtTimingsDrawsAction,
      updateCourtTimingsDrawsDragSuccessAction,
      updateCompetitionDrawsSwapLoadAction,
      clearMultiDraws,
      publishDraws,
      matchesListDrawsAction,
      generateDrawAction,
      unlockDrawsAction,
      getActiveRoundsAction,
      changeDrawsDateRangeAction,
      checkBoxOnChange,
      setTimelineModeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    drawsState: state.CompetitionMultiDrawsState,
    competitionModuleState: state.CompetitionModuleState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MultifieldDrawsNewTimeline);

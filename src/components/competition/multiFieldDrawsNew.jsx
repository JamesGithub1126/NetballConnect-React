import React, { Component } from 'react';
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
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';

import DrawsPublishModel from '../../customComponents/drawsPublishModel';
import DrawsRegenerateModal from '../../customComponents/drawsRegenerateModal';
import { AffectedDrawsModal } from './affectedDrawsModal';
// import _ from "lodash";
//import loadjs from 'loadjs';
import moment from 'moment';
import AppImages from '../../themes/appImages';
import { flatten } from 'lodash';
import { isArrayNotEmpty } from '../../util/helpers';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  // getDayName,
  getTime,
} from '../../themes/dateformate';
import Loader from '../../customComponents/loader';
import BulkLockMatchesModal from '../../customComponents/bulkLockMatchesModal';
import {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDraws,
  updateCompetitionDrawsSwapLoadAction,
  updateCompetitionDrawsTimeline,
  saveDraws,
  getCompetitionVenue,
  updateCourtTimingsDrawsAction,
  clearMultiDraws,
  publishDraws,
  matchesListDrawsAction,
  unlockDrawsAction,
  getActiveRoundsAction,
  changeDrawsDateRangeAction,
  checkBoxOnChange,
  setTimelineModeAction,
  updateMultiDrawsCourtTimings,
  bulkLockMatches,
} from '../../store/actions/competitionModuleAction/competitionMultiDrawsAction';
import { getYearAndCompetitionOwnAction, getVenuesTypeAction } from '../../store/actions/appAction';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import {
  getIsLockedMatch,
  clearIsLockedMatch,
} from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
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
  // getDraws_division_grade,
  getOrganisationData,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  // getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  setLiveScoreUmpireCompition,
  setLiveScoreUmpireCompitionData,
  getOpenRegenerateModal,
  setOpenRegenerateModal,
  getLastDrawPublishTime,
  setLastDrawPublishTime,
  getLastDrawRegenerateTime,
  setLastDrawRegenerateTime,
} from '../../util/sessionStorage';
import ValidationConstants from '../../themes/validationConstant';
import DrawConstant from '../../themes/drawConstant';
import './draws.scss';
import getColor from '../../util/coloredCheckbox';
import { getDate, checkDate } from '../../util/drawUtil';
import MultiFieldDrawsSubCourt from './multiFieldDraw/multiFieldDrawsSubCourt';
import MultiFieldDrawsFullCourt from './multiFieldDraw/multiFieldDrawsFullCourt';
import { NavLink } from 'react-router-dom';
import { DrawShowOnlyType } from 'util/enums';
import CompetitionAxiosApi from '../../store/http/competitionHttp/competitionAxiosApi';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Footer, Content } = Layout;

const { confirm } = Modal;

class MultifieldDrawsNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      firstTimeCompId: '',
      showAffectedMatchesModal: false,
      venueId: '',
      roundId: '',
      venueLoad: false,
      roundTime: null,
      competitionDivisionGradeId: '',
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      updateLoad: false,
      organisation_Id: '-1',
      visible: false,
      visibleWarningMatchModal: false,
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
      screenKey: this.props.location.state
        ? this.props.location.state.screenKey
          ? this.props.location.state.screenKey
          : null
        : null,
      editedDraw: {
        draws: [],
        apiData: null,
      },
      publishPastMatches: 0,
      compactMatchesMode: 1,
      isDragging: false,
      dateTimeEditable: false,
      drawListExpanded: false,
      showOnlyFilters: [],
      notCheckedOrganisations: [],
      childGridRefs: [],
    };
    this.props.clearMultiDraws();
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
            this.state.firstTimeCompId == -1 || this.state.filterDates
              ? this.state.venueId
              : venueData[0].id;
          setDraws_venue(venueId);
          if (this.state.firstTimeCompId != '-1' && !this.state.filterDates) {
            if (drawsRoundData.length > 0) {
              let roundId = null;
              let roundTime = null;
              if (getOpenRegenerateModal() == 1) {
                setOpenRegenerateModal(0);
                let hasRound = drawsRoundData.some(x => x.roundId > 0);
                if (hasRound) {
                  //show modal
                  this.reGenerateDraw();
                } else {
                  this.state.publishPastMatches = 1;
                  this.setState({
                    regenerateOnLoad: true,
                  });
                  this.state.publishPartModel.isShowPart = false;
                  this.callGenerateDraw();
                }
              }
              // let currentDate = this.state.filterDates ? moment(new Date()).format("YYYY-MM-DD") : null;
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
                  this.state.filterDates,
                );
                this.setState({
                  roundId,
                  roundTime,
                  venueId,
                  venueLoad: false,
                  // startDate: currentDate,
                  // endDate: currentDate,
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
              this.state.filterDates,
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
          let competitionId =
            storedCompetitionId != undefined && storedCompetitionId !== 'undefined'
              ? storedCompetitionId
              : competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          let finalTypeRefId = competitionList[0].finalTypeRefId;
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          if (storedCompetitionId != undefined && storedCompetitionId !== 'undefined') {
            let compIndex = competitionList.findIndex(x => x.competitionId == competitionId);
            if (compIndex > -1) {
              statusRefId = competitionList[compIndex].statusRefId;
              finalTypeRefId = competitionList[compIndex].finalTypeRefId;
            }
          }
          setOwn_competitionStatus(statusRefId);
          this.props.getDrawsRoundsAction(yearId, competitionId);
          this.props.getIsLockedMatch(competitionId);
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
      if (
        competitionModuleState.drawGenerateLoad == false &&
        (this.state.venueLoad === true || this.state.regenerateOnLoad === true)
      ) {
        this.setState({ venueLoad: false, regenerateOnLoad: false });
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
          // this.props.getCompetitionVenue(competitionId);
          this.props.getDrawsRoundsAction(this.state.yearRefId, this.state.firstTimeCompId);
          this.props.getIsLockedMatch(this.state.firstTimeCompId);
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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.props.clearIsLockedMatch();
  }

  componentDidMount() {
    //loadjs('assets/js/custom.js');
    this.apiCalls();
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({ updateUI: true });
  };

  apiCalls() {
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
    // let competitionDivisionGradeId = getDraws_division_grade();
    // get isLockedMatch
    this.props.getIsLockedMatch(storedCompetitionId);
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
        //venueId: null,
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
      // this.setState({
      //     venueLoad: true,
      //     changeDateLoad: true
      //     roundId: 0,
      //     // venueId: null,
      //     roundTime: null,
      //     competitionDivisionGradeId: null,
      // });
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
        startDate,
        endDate,
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

  updateEditDrawArray(draw) {
    const editdraw = this.state.editedDraw;
    const drawExistsIndex = editdraw.draws.findIndex(d => d.drawsId == draw.drawsId);
    if (drawExistsIndex > -1) {
      editdraw.draws[drawExistsIndex] = { ...editdraw.draws[drawExistsIndex], ...draw };
    } else {
      editdraw.draws.push(draw);
    }
  }

  validateDraws = () => {
    let invalidate = false;
    const getRoundsDrawsdata = this.props.drawsState.getRoundsDrawsdata;
    for (let i in getRoundsDrawsdata) {
      if (invalidate === true) {
        break;
      }

      const roundData = getRoundsDrawsdata[i];
      const draws = roundData.draws;
      if (draws) {
        for (let j in draws) {
          const diffSlotsArray = [];
          for (let k in draws[j].slotsArray) {
            const slotObj = draws[j].slotsArray[k];
            if (
              !slotObj.drawsId ||
              slotObj.outOfRoundDate == 1 ||
              !diffSlotsArray.find(
                x =>
                  x.matchDate === slotObj.matchDate &&
                  slotObj.drawsId &&
                  x.drawsId &&
                  x.outOfRoundDate == 0 &&
                  (slotObj.subCourt ? x.subCourt == slotObj.subCourt : 1),
              )
            ) {
              diffSlotsArray.push(slotObj);
            }
          }

          if (diffSlotsArray.length !== draws[j].slotsArray.length) {
            invalidate = true;
            break;
          }
        }
      }
    }

    if (invalidate) {
      let this_ = this;
      confirm({
        title: AppConstants.saveDrawsConfirm,
        okText: AppConstants.yes,
        okType: AppConstants.primary,
        cancelText: AppConstants.no,
        maskClosable: true,
        onOk() {
          this_.saveEditDraws();
        },
        onCancel() {},
      });
    } else {
      this.saveEditDraws();
    }
  };

  saveEditDraws = () => {
    let key = this.state.firstTimeCompId === '-1' || this.state.filterDates ? 'all' : 'add';
    let apiData = {
      yearRefId: this.state.yearRefId,
      competitionId: this.state.firstTimeCompId,
      venueId: 0, //this.state.venueId,
      roundId:
        this.state.firstTimeCompId == '-1' || this.state.filterDates ? 0 : this.state.roundId,
      orgId: null,
      startDate:
        this.state.firstTimeCompId == '-1' || this.state.filterDates ? this.state.startDate : null,
      endDate:
        this.state.firstTimeCompId == '-1' || this.state.filterDates ? this.state.endDate : null,
    };
    const sourceIndexArray = [];
    const targetIndexArray = [];
    const postObject = {
      competitionId: this.state.firstTimeCompId,
      draws: JSON.parse(JSON.stringify(this.state.editedDraw.draws)),
    };

    this.props.updateCompetitionDrawsTimeline(
      postObject,
      sourceIndexArray,
      targetIndexArray,
      key,
      parseInt(apiData.roundId),
      apiData.yearRefId,
      apiData.competitionId,
      apiData.venueId,
      this.state.firstTimeCompId == '-1' || this.state.filterDates ? 0 : apiData.roundId,
      null,
      apiData.startDate,
      apiData.endDate,
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

  get swappedDraws() {
    return this.state.editedDraw.draws
      .filter(draw => {
        return draw.homeTeamId && draw.originalHomeTeamId !== draw.homeTeamId;
      })
      .map(draw => draw.drawsId);
  }

  saveAndPublishDraws = isTeamNotInDraws => {
    isTeamNotInDraws == 1 ? this.openModel(this.props) : this.check();
  };

  // on Competition change
  onCompetitionChange(competitionId, e) {
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusRefId = 0;
    let nextAvailableGameDay = moment(new Date());
    if (this.props.drawsState.nextAvailableGameDay) {
      nextAvailableGameDay = moment(new Date(this.props.drawsState.nextAvailableGameDay)).format(
        'YYYY-MM-DD',
      );
    }

    this.props.clearMultiDraws('rounds');
    if (competitionId == -1 || this.state.filterDates) {
      this.props.getDrawsRoundsAction(
        this.state.yearRefId,
        competitionId,
        'all',
        true,
        nextAvailableGameDay,
        nextAvailableGameDay,
      );
      this.props.getIsLockedMatch(competitionId);
      this.setState({ filterDates: true });
      this.setState({
        startDate: nextAvailableGameDay,
        endDate: nextAvailableGameDay,
      });
    } else {
      let statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
      statusRefId = own_CompetitionArr[statusIndex].statusRefId;
      let finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
      setOwn_competition(competitionId);
      setOwn_competitionStatus(statusRefId);
      setOwn_CompetitionFinalRefId(finalTypeRefId);
      this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
      this.props.getIsLockedMatch(competitionId);
    }

    if (e.value !== '-1') {
      //if the value being sent from the option is not the competitionID value, then set newDates
      this.setState({
        startDate: new Date(),
        endDate: new Date(),
      });
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
      // startDate: moment(newDate).format('YYYY-MM-DD'),
      // endDate: moment(newDate).format('YYYY-MM-DD'),
      showAllDivision: false,
    });
  }

  //////onRoundsChange
  onRoundsChange = roundId => {
    let roundData = this.props.drawsState.getDrawsRoundsData;
    this.props.clearMultiDraws();
    this.state.childGridRefs = this.state.childGridRefs.filter(x => x.current);
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
  onDrawListExpand = checked => {
    this.setState({ drawListExpanded: checked });
  };

  checkColor = slot => {
    let checkDivisionFalse =
      this.state.firstTimeCompId == '-1' || this.state.filterDates
        ? this.checkAllDivisionData()
        : this.checkAllCompetitionData(
            this.props.drawsState.divisionGradeNameList,
            'competitionDivisionGradeId',
          );
    let checkCompetitionFalse =
      this.state.firstTimeCompId == '-1' || this.state.filterDates
        ? this.checkAllCompetitionData(
            this.props.drawsState.drawsCompetitionArray,
            'competitionName',
          )
        : [];
    let checkVenueFalse = this.checkAllCompetitionData(
      this.props.drawsState.competitionVenues,
      'id',
    );
    let checkOrganisationFalse = this.checkAllCompetitionData(
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
    let uncheckedDivisionArr = [];
    let { drawDivisions } = this.props.drawsState;
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
    let uncheckedArr = [];
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
    let checkDivisionFalse =
      this.state.firstTimeCompId == '-1'
        ? this.checkAllDivisionData()
        : this.checkAllCompetitionData(
            this.props.drawsState.divisionGradeNameList,
            'competitionDivisionGradeId',
          );
    let checkCompetitionFalse =
      this.state.firstTimeCompId == '-1'
        ? this.checkAllCompetitionData(
            this.props.drawsState.drawsCompetitionArray,
            'competitionName',
          )
        : [];
    let checkVenueFalse = this.checkAllCompetitionData(
      this.props.drawsState.competitionVenues,
      'id',
    );
    let checkOrganisationFalse = this.checkAllCompetitionData(
      this.props.drawsState.drawOrganisations,
      'organisationUniqueKey',
    );
    let disabledStatus = this.state.competitionStatus == 1;
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
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  onCalendarCheckboxChange = (key, value) => {
    this.setState({ [key]: value });
    if (key === 'isAxisInverted') {
      this.state.childGridRefs = this.state.childGridRefs.filter(x => x.current);
      for (let gridRef of this.state.childGridRefs) {
        if (gridRef.current) {
          gridRef.current.resetAfterColumnIndex(0);
          gridRef.current.resetAfterRowIndex(0);
        }
      }
    }
  };

  onDateRangeCheck = val => {
    this.props.clearMultiDraws('rounds');
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.props.getDrawsRoundsAction(this.state.yearRefId, this.state.firstTimeCompId, null, val);
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate, venueLoad: true });
  };
  showSlotTooltip = fullTooltipStyles => {
    if (this.state.tooltipShowingTimeout) {
      clearTimeout(this.state.tooltipShowingTimeout);
    }
    let tooltipShowingTimeout = setTimeout(() => {
      const tooltip = document.getElementById('draggableTooltip');
      tooltip.setAttribute('style', fullTooltipStyles);
    }, 500);
    //no need re-render
    this.state.tooltipShowingTimeout = tooltipShowingTimeout;
  };
  hideSlotTooltip = () => {
    if (this.state.tooltipShowingTimeout) {
      clearTimeout(this.state.tooltipShowingTimeout);
    }
    const tooltip = document.getElementById('draggableTooltip');
    tooltip.setAttribute('style', 'display: none');
  };
  slotObjectMouseEnter = (e, draggableEventObject, isGroup) => {
    const tooltip = document.getElementById('draggableTooltip');
    let tooltipRows = 1;
    let teamHtml = '';
    if (draggableEventObject.childSlots && isGroup) {
      teamHtml = '';
      for (let childSlot of draggableEventObject.childSlots) {
        if (childSlot.drawsId) {
          teamHtml += `<div>${childSlot.homeTeamName} vs ${childSlot.awayTeamName}`;
          if (childSlot.subCourt) {
            teamHtml += ` (${childSlot.subCourt})`;
          }
          teamHtml += `</div>`;
          tooltipRows++;
        }
      }
    } else {
      if (draggableEventObject.drawsId) {
        teamHtml += `<div>${draggableEventObject.homeTeamName} vs ${draggableEventObject.awayTeamName}</div>`;
        tooltipRows++;
      }
    }
    teamHtml += `<div>Starting at ${draggableEventObject.startTime}</div>`;
    if (!isGroup) {
      teamHtml += `<div>Ending at ${draggableEventObject.endTime}</div>`;
      tooltipRows++;
    }
    teamHtml += `<div>Court ${draggableEventObject.venueShortName}-${draggableEventObject.venueCourtName}`;
    if (!isGroup && draggableEventObject.subCourt) {
      teamHtml += `(${draggableEventObject.subCourt})`;
    }
    teamHtml += `</div>`;
    tooltipRows++;
    if (draggableEventObject.divisionName && draggableEventObject.gradeName) {
      teamHtml += `<div>${AppConstants.divOrGrade} ${draggableEventObject.divisionName}-${draggableEventObject.gradeName}`;
      teamHtml += `</div>`;
      tooltipRows++;
    }
    tooltip.innerHTML = teamHtml;
    if (!this.state.isDragging) {
      const tooltipX = Math.trunc(e.pageX); // Math.trunc(e.clientX);
      let offsetHeight = tooltipRows * 23;
      const tooltipY = Math.trunc(e.pageY) - offsetHeight; //Math.trunc(e.clientY) - 90;
      const fullTooltipStyles =
        DrawConstant.TOOLTIP_STYLES + `left: ${tooltipX}px; top: ${tooltipY}px`;
      this.showSlotTooltip(fullTooltipStyles);
    } else {
      this.hideSlotTooltip();
    }
  };
  slotObjectMouseLeave = e => {
    if (AppConstants.flavour === 'football' && e && !e.target.id && e.target.tagName === 'SPAN') {
      e.stopPropagation();
    } else {
      this.hideSlotTooltip();
    }
  };
  slotObjectMouseDown = e => {
    this.state.isDragging = true;
    this.hideSlotTooltip();
  };
  drawsFieldUp = () => {
    setTimeout(() => {
      //delay show tooltip when swap group
      this.state.isDragging = false;
    }, 500);
    this.hideSlotTooltip();
  };
  setDraggingState = state => {
    this.setState(state);
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
              <div className="col-sm mt-2">
                <div className="w-100 d-flex flex-row align-items-center" style={{ minWidth: 250 }}>
                  <RangePicker
                    disabled={
                      this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true
                    }
                    defaultValue={this.props.drawsState.nextAvailableGameDay}
                    onChange={date => this.onChangeStartDate(date)}
                    format="DD-MM-YYYY"
                    style={{ width: '100%', minWidth: 180 }}
                    value={[moment(this.state.startDate), moment(this.state.endDate)]}
                  />
                </div>
              </div>

              <div className="col-sm-2 mt-2" style={{ minWidth: 160 }}>
                <Checkbox
                  className="single-checkbox-radio-style"
                  style={{ paddingTop: 8 }}
                  checked={this.state.filterDates}
                  // onChange={(e) => this.setState({ filterDates: e.target.checked })}
                  onChange={e => this.onDateRangeCheck(e.target.checked)}
                  disabled={this.state.firstTimeCompId == '-1'}
                  // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
                >
                  {AppConstants.filterDates}
                </Checkbox>
              </div>
              <div className="col-sm d-flex justify-content-end align-items-center pr-1">
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
    let { competitionVenues } = this.props.drawsState;
    let { showAllVenue } = this.state;
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
              href={`#venue-collapsable-div`}
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
            checked={this.state.allVenueChecked}
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
    let { own_CompetitionArr } = this.props.appState;
    let { drawsCompetitionArray } = this.props.drawsState;
    let { showAllComp } = this.state;
    return (
      <>
        <div className="row">
          <div className="col-sm d-flex justify-content-start ">
            <span className="user-contact-heading">{AppConstants.competitions}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href={`#comp-collapsable-div`}
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
            checked={this.state.allCompChecked}
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

  matchDateAndStartTimeEditble = () => {
    this.setState({
      dateTimeEditable: true,
    });
  };

  ///////left side view for division liting with checkbox
  divisionLeftView = () => {
    let { divisionGradeNameListForRound, drawDivisions } = this.props.drawsState;
    let { showAllDivision } = this.state;
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
              checked={this.state.singleCompDivisionCheked}
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
    let { drawOrganisations } = this.props.drawsState;
    let {
      showAllOrg,
      // allOrgChecked
    } = this.state;
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
            checked={this.state.allOrgChecked}
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
                          this.setState({
                            notCheckedOrganisations: checkOrganisationFalse,
                          });
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
    let key =
      this.state.firstTimeCompId == '-1' || this.state.filterDates ? 'all' : 'singleCompetition';
    this.props.unlockDrawsAction(id, round_Id, venueCourtId, key);
  };

  sideMenuView = () => {
    let { filterEnable } = this.state;
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

  onBulkLockMatches = lockData => {
    let { venueIds, divisionIds, timeslots } = lockData;
    if (this.state.firstTimeCompId) {
      this.props.bulkLockMatches({
        competitionUniqueKey: this.state.firstTimeCompId,
        venueIds,
        divisionIds,
        timeslots,
      });
      this.setState({ showLockModal: false });
    }
  };

  lockModalView = () => {
    let { competitionVenues, divisionGradeNameListForRound, timelsotHourlyList } =
      this.props.drawsState;
    if (this.state.showLockModal) {
      return (
        <BulkLockMatchesModal
          venues={[...competitionVenues]}
          divisions={[...divisionGradeNameListForRound]}
          timeslotHourlyList={[...timelsotHourlyList]}
          onCancel={() => this.setState({ showLockModal: false })}
          onSave={this.onBulkLockMatches}
        ></BulkLockMatchesModal>
      );
    } else {
      return <></>;
    }
  };

  containerView() {
    const getRoundsDrawsdata = this.props.drawsState.filteredRoundsDrawsdata;
    let hasSubCourtDivision = this.props.drawsState.hasSubCourtDivision;
    return (
      <div className="multiDrawContentView">
        <div className="multi-draw-list-top-head align-content-center">
          <span className="form-heading">{AppConstants.matchCalender}</span>
          <div className="row align-content-center">
            <div
              className="col-sm-10 mt-3 pr-0"
              style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
            >
              <Checkbox
                className="single-checkbox-radio-style"
                checked={this.props.drawsState.isTimelineMode}
                onChange={e => {
                  this.openConfirmToggleTimeline(e.target.checked);
                }}
              >
                {AppConstants.timeline}
              </Checkbox>
              <Checkbox
                className="single-checkbox-radio-style"
                checked={this.state.isDivisionNameShow}
                onChange={e =>
                  this.onCalendarCheckboxChange('isDivisionNameShow', e.target.checked)
                }
              >
                {AppConstants.showByDivision}
              </Checkbox>
              <Checkbox
                className="single-checkbox-radio-style"
                checked={this.state.isAxisInverted}
                onChange={e => this.onCalendarCheckboxChange('isAxisInverted', e.target.checked)}
              >
                {AppConstants.invertAxis}
              </Checkbox>
              <span>{AppConstants.showOnly}</span>
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
              </Select>
              <Checkbox
                className="single-checkbox-radio-style"
                checked={this.state.drawListExpanded}
                // onChange={(e) => this.setState({ filterDates: e.target.checked })}
                onChange={e => this.onDrawListExpand(e.target.checked)}
              >
                <span> {AppConstants.expand}</span>
              </Checkbox>
              <div style={{ minWidth: 210, maxWidth: 210 }}>
                <Button
                  type="primary"
                  className="primary-add-comp-form"
                  onClick={() => this.setState({ showLockModal: true })}
                >
                  {AppConstants.bulkLockMatches}
                </Button>
              </div>
            </div>
            <div className="col-sm-2 pr-0 d-flex justify-content-end align-items-center">
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
                  <Menu.Item key="4" onClick={() => this.matchDateAndStartTimeEditble()}>
                    <span>{AppConstants.editMatchDateAndStartTimes}</span>
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu>
            </div>
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

                /* {dateItem.legendsArray.length > 0 ?
                                         <div className="pt-4" key={"drawData" + dateIndex}>
                                             {this.draggableView(dateItem)}
                                         </div>
                                         :
                                         <div>
                                             <div className="comp-warning-info" style={{ paddingBottom: "40px" }}>
                                                {AppConstants.noFixturesMessage}
                                             </div>
                                         </div>
                                     } */
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  draggableView = dateItem => {
    let allprops = {
      ...this.props,
      ...this.state,
      dateItem: dateItem,
      dateTimeEditable: this.state.dateTimeEditable,
      drawListExpanded: this.state.drawListExpanded,
      filterEnable: this.state.filterEnable,
      childGridRefs: this.state.childGridRefs,
      checkColor: this.checkColor,
      checkSwap: this.checkSwap,
      unlockDraws: this.unlockDraws,
      slotObjectMouseEnter: this.slotObjectMouseEnter,
      slotObjectMouseLeave: this.slotObjectMouseLeave,
      slotObjectMouseDown: this.slotObjectMouseDown,
      hideSlotTooltip: this.hideSlotTooltip,
      drawsFieldUp: this.drawsFieldUp,
      setDraggingState: this.setDraggingState,
      onDrawUpdated: () => this.forceUpdate(),
    };
    return <MultiFieldDrawsFullCourt {...allprops}></MultiFieldDrawsFullCourt>;
  };

  draggableSubCourtView = dateItem => {
    let allprops = {
      ...this.props,
      ...this.state,
      dateItem: dateItem,
      dateTimeEditable: this.state.dateTimeEditable,
      drawListExpanded: this.state.drawListExpanded,
      filterEnable: this.state.filterEnable,
      childGridRefs: this.state.childGridRefs,
      checkColor: this.checkColor,
      checkSwap: this.checkSwap,
      unlockDraws: this.unlockDraws,
      slotObjectMouseEnter: this.slotObjectMouseEnter,
      slotObjectMouseLeave: this.slotObjectMouseLeave,
      slotObjectMouseDown: this.slotObjectMouseDown,
      hideSlotTooltip: this.hideSlotTooltip,
      drawsFieldUp: this.drawsFieldUp,
      setDraggingState: this.setDraggingState,
      onDrawUpdated: () => this.forceUpdate(),
    };
    return <MultiFieldDrawsSubCourt {...allprops}></MultiFieldDrawsSubCourt>;
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
    let payload = {
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

  check = () => {
    if (this.state.firstTimeCompId == null || this.state.firstTimeCompId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectCompetition);
    } else if (this.state.venueId == null && this.state.venueId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectVenue);
    } else {
      if (isArrayNotEmpty(this.props.liveScoreMatchState.lockedMatch)) {
        this.setState({ visibleWarningMatchModal: true });
      } else {
        this.resetPublishModalForm();
        this.setState({ visible: true });
      }
    }
  };

  openPublishModal = () => {
    this.setState({ visibleWarningMatchModal: false });
    this.resetPublishModalForm();
    this.setState({ visible: true });
  };

  closeWarningModal = () => {
    this.setState({ visibleWarningMatchModal: false });
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

  //////footer view containing all the buttons like publish and regenerate draws
  footerView = () => {
    let publishStatus = this.props.drawsState.publishStatus;
    let isTeamNotInDraws = this.props.drawsState.isTeamInDraw;
    let activeDrawsRoundsData = this.props.drawsState.activeDrawsRoundsData;
    let alreadyPublished = this.state.competitionStatus == 1;
    const hasSwappedDraws = !!this.swappedDraws.length;
    const canPublish = !alreadyPublished && !hasSwappedDraws;
    let teamNames = this.props.drawsState.teamNames;
    let isPastMatchAvailable = this.props.drawsState.isPastMatchAvailable;
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
                onClick={() => this.validateDraws()}
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
          publishStatus={publishStatus}
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
          visible={this.state.visibleWarningMatchModal}
          title={AppConstants.warning}
          onOk={this.openPublishModal}
          onCancel={this.closeWarningModal}
        >
          {AppConstants.republishDrawsWarning}
        </Modal>

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
      let payload = {
        isPartial: this.state.publishPartModel.isShowPart,
        divisions: [],
        rounds: [],
        publishPastMatches: this.state.publishPastMatches,
        competitionId: this.state.firstTimeCompId,
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
            onMouseLeave={this.slotObjectMouseLeave}
            className="unavailable-draws"
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
          {this.lockModalView()}
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
      updateCompetitionDrawsSwapLoadAction,
      updateCompetitionDrawsTimeline,
      saveDraws,
      getCompetitionVenue,
      updateCourtTimingsDrawsAction,
      clearMultiDraws,
      publishDraws,
      matchesListDrawsAction,
      generateDrawAction,
      unlockDrawsAction,
      getActiveRoundsAction,
      changeDrawsDateRangeAction,
      checkBoxOnChange,
      setTimelineModeAction,
      updateMultiDrawsCourtTimings,
      getIsLockedMatch,
      clearIsLockedMatch,
      bulkLockMatches,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    drawsState: state.CompetitionMultiDrawsState,
    competitionModuleState: state.CompetitionModuleState,
    liveScoreMatchState: state.LiveScoreMatchState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MultifieldDrawsNew);

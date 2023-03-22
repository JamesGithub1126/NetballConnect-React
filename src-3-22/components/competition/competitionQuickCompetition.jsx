import React, { Component, createRef } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Button,
  Form,
  message,
  DatePicker,
  Checkbox,
  Menu,
  Modal,
  Radio,
} from 'antd';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import CompetitionSwappable from '../../customComponents/quickCompetitionComponent';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import Loader from '../../customComponents/loader';
import {
  getVenuesTypeAction,
  searchVenueList,
  clearFilter,
  competitionFeeInit,
} from '../../store/actions/appAction';
import ValidationConstants from '../../themes/validationConstant';
import TimeSlotModal from '../../customComponents/timeslotModal';
import TimeSlotTournamentModal from '../../customComponents/timeslotTournamentModal';
import CompetitionModal from '../../customComponents/competitionModal';
import DivisionGradeModal from '../../customComponents/divisionGradeModal';
import CompetitionVenueModal from '../../customComponents/quickAddVenueModal';
import {
  updateQuickCompetitionData,
  updateTimeSlot,
  updateDivision,
  updateCompetition,
  createQuickCompetitionAction,
  saveQuickCompDivisionAction,
  getYearAndQuickCompetitionAction,
  getQuickCompetitionAction,
  exportQuickCompetitionAction,
  quickCompetitionTimeSlotData,
  updateQuickCompetitionAction,
  quickCompetitionGenerateFixtureAction,
  quickCompetitionAddTeamAction,
  updateQuickCompetitionDraws,
  quickCompetitionAddVenue,
  updateQuickCompetitionTimeSlotData,
  updateGridAndDivisionAction,
  updateGridAndVenue,
} from '../../store/actions/competitionModuleAction/competitionQuickCompetitionAction';
import { quickCompetitionInit } from '../../store/actions/commonAction/commonAction';
import { getAffiliateOurOrganisationIdAction } from '../../store/actions/userAction/userAction';
import { getDayName, getTime } from '../../themes/dateformate';
import { captializedString, isArrayNotEmpty } from '../../util/helpers';
import AppUniqueId from '../../themes/appUniqueId';
import {
  setGlobalYear,
  getOrganisationData,
  setOwn_competition,
  getOwn_competition,
} from 'util/sessionStorage';
import {
  VenuePreferenceType,
  CompetitionType,
  TIMESLOT_ROTATION_MAIN,
  TIMESLOTS_ROTATION_SUB,
  TIMESLOT_GENERATION,
  DrawExceptionType,
} from '../../util/enums';
import AppImages from '../../themes/appImages';
import getColor from '../../util/coloredCheckbox';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { SubMenu } = Menu;
const showQuickComp = process.env.REACT_APP_SHOW_QUICKCOMPETITION === 'true';
class CompetitionQuickCompetition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: '2019',
      competition: '2019winter',
      venue: 'abbott',
      firstTimeCompId: '',
      timeSlotVisible: false,
      visibleCompModal: false,
      visibleDivisionModal: false,
      yearRefId: null,
      quickCompetitionLoad: false,
      onloadData: false,
      buttonPressed: '',
      venueModalVisible: false,
      compModalLoad: false,
      modalButtonPressed: '',
      timeslotModalLoad: false,
      timeSlotButtonClicked: '',
      venueComptitionLoad: false,
      venueButtonClicked: '',
      divisionButtonClicked: '',
      divisionGradeModalLoad: false,
      payload: null,
      filterDates: true,
      startDate: new Date(),
      endDate: new Date(),
      competitionTypeRefId: CompetitionType.Weekly,
      filterEnable: true,
      showAllDivision: false,
      singleCompDivisionCheked: true,
      showAllRound: false,
      allRoundChecked: true,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      drawGenerateModalVisible: false,
      exceptionTypeRefId: DrawExceptionType.Retain,
      editCompetitionUniqueKey: '',
    };
    this.props.updateCompetition('', 'allData');
    this.props.getVenuesTypeAction('all');
    this.props.competitionFeeInit();
    this.props.getYearAndQuickCompetitionAction(
      this.props.quickCompetitionState.quick_CompetitionYearArr,
      null,
    );
    this.formRef = createRef();
  }

  //component did Mount
  componentDidMount() {
    let body = {
      Day: 'Day',
    };
    this.props.quickCompetitionInit(body);
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    this.apiCalls(organisationId);
  }

  apiCalls = async organisationId => {
    this.props.getAffiliateOurOrganisationIdAction(organisationId);
  };

  //component did Update
  componentDidUpdate(nextProps) {
    let quickCompetitionState = this.props.quickCompetitionState;
    if (nextProps.quickCompetitionState !== this.props.quickCompetitionState) {
      let competitionList = this.props.quickCompetitionState.quick_CompetitionArr;
      if (nextProps.quickCompetitionState.quick_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competition = null;
          let storedCompetitionId = getOwn_competition();
          if (storedCompetitionId) {
            competition = competitionList.find(x => x.competitionId == storedCompetitionId);
          }
          if (!competition) {
            competition = competitionList[0];
          }

          let competitionId = competition.competitionId;
          let yearId = this.state.yearRefId
            ? this.state.yearRefId
            : this.props.quickCompetitionState.yearId;
          let exceptionTypeRefId = DrawExceptionType.Retain;
          if (competition.competitionTypeRefId == CompetitionType.Weekly) {
            exceptionTypeRefId = DrawExceptionType.UseRound1;
          }
          this.setState({
            firstTimeCompId: competitionId,
            quickCompetitionLoad: true,
            yearRefId: JSON.parse(yearId),
            competitionTypeRefId: competition.competitionTypeRefId,
            startDate: competition.startDate,
            endDate: competition.startDate,
            exceptionTypeRefId: exceptionTypeRefId,
          });
          this.getQuickCompetition(
            competitionId,
            competition.competitionTypeRefId,
            this.state.filterDates,
            competition.startDate,
            competition.startDate,
          );
        }
        if (this.props.quickCompetitionState.quick_CompetitionYearArr.length > 0) {
          let yearId = this.state.yearRefId
            ? this.state.yearRefId
            : this.props.quickCompetitionState.yearId;
          this.setState({ yearRefId: JSON.parse(yearId) });
        }
      }
      let selectedCompetition = this.props.quickCompetitionState.selectedCompetition;
      if (nextProps.selectedCompetition != selectedCompetition) {
        if (selectedCompetition) {
          let yearId = this.state.yearRefId
            ? this.state.yearRefId
            : this.props.quickCompetitionState.yearId;
          this.props.updateCompetition('', 'allData');
          let competitionId = selectedCompetition;
          let competition = competitionList.find(c => c.competitionId == competitionId);
          this.setState({
            firstTimeCompId: competitionId,
            quickCompetitionLoad: true,
            yearRefId: this.state.yearRefId ? this.state.yearRefId : JSON.parse(yearId),
            competitionTypeRefId: competition.competitionTypeRefId,
            startDate: competition.startDate,
            endDate: competition.startDate,
          });
          this.getQuickCompetition(
            competitionId,
            competition.competitionTypeRefId,
            this.state.filterDates,
            competition.startDate,
            competition.startDate,
          );
        }
      }
    }
    if (
      nextProps.quickCompetitionState.quickComptitionDetails !==
      this.props.quickCompetitionState.quickComptitionDetails
    ) {
      if (
        this.state.quickCompetitionLoad === true &&
        this.props.quickCompetitionState.onQuickCompLoad === false
      ) {
        this.setFieldValues();
        this.setState({
          quickCompetitionLoad: false,
        });
      }
      if (this.state.compModalLoad === true && quickCompetitionState.onQuickCompLoad === false) {
        let competitionTypeRefId = quickCompetitionState.competitionTypeRefId;
        let exceptionTypeRefId = DrawExceptionType.Retain;
        if (competitionTypeRefId == CompetitionType.Weekly) {
          exceptionTypeRefId = DrawExceptionType.UseRound1;
        }
        if (this.state.modalButtonPressed === 'next') {
          this.setState({
            compModalLoad: false,
            visibleCompModal: false,
            venueModalVisible: true,
            competitionTypeRefId: competitionTypeRefId,
            exceptionTypeRefId: exceptionTypeRefId,
          });
        } else if (this.state.modalButtonPressed === 'save') {
          this.setState({
            compModalLoad: false,
            visibleCompModal: false,
            competitionTypeRefId: competitionTypeRefId,
            exceptionTypeRefId: exceptionTypeRefId,
          });
        }
      }
    }
    if (this.state.timeslotModalLoad === true && quickCompetitionState.onQuickCompLoad === false) {
      // if (this.state.timeSlotButtonClicked === 'next') {
      //   this.setState({
      //     timeslotModalLoad: false,
      //     timeSlotVisible: false,
      //   });
      // } else
      if (this.state.timeSlotButtonClicked === 'save') {
        this.setState({
          timeslotModalLoad: false,
          timeSlotVisible: false,
        });
        let postDraws = quickCompetitionState.postDraws;
        if (!postDraws || postDraws.length == 0) {
          this.callGenerateFixtures();
        }
      }
    }
    if (
      this.state.divisionGradeModalLoad === true &&
      this.props.quickCompetitionState.onQuickCompLoad === false
    ) {
      if (quickCompetitionState.status == 1 && !quickCompetitionState.error) {
        if (this.state.divisionButtonClicked === 'next') {
          this.setState({
            divisionGradeModalLoad: false,
            visibleDivisionModal: false,
            timeSlotVisible: true,
          });
        } else if (this.state.divisionButtonClicked === 'save') {
          this.setState({
            divisionGradeModalLoad: false,
            visibleDivisionModal: false,
          });
        }
      }
    }
    if (
      this.state.venueComptitionLoad === true &&
      this.props.quickCompetitionState.onQuickCompLoad === false
    ) {
      if (this.state.venueButtonClicked === 'next') {
        this.setState({
          venueComptitionLoad: false,
          visibleDivisionModal: true,
          venueModalVisible: false,
        });
      } else if (this.state.venueButtonClicked === 'save') {
        this.setState({
          venueComptitionLoad: false,
          venueModalVisible: false,
        });
      }
    }
  }
  handleGenerateDrawModal = key => {
    if (key === 'ok') {
      this.callGenerateFixtures();
    }
    this.setState({ drawGenerateModalVisible: false });
  };

  //api call
  saveAPIsActionCall = () => {
    let quickCompetitionData = this.props.quickCompetitionState.quickComptitionDetails;
    let { postDivisionData, postTimeslotData, postDraws } = this.props.quickCompetitionState;

    if (this.state.firstTimeCompId.length > 0) {
      if (postDivisionData.length > 0 && postTimeslotData.length > 0) {
        if (quickCompetitionData.competitionVenues.length > 0) {
          let startDate = null;
          let endDate = null;
          if (this.state.filterDates && this.state.competitionTypeRefId == 2) {
            startDate = this.state.startDate;
            endDate = this.state.endDate;
          }
          postDraws = postDraws.filter(x => x.isLocked == 1);
          let payload = {
            competitionId: this.state.firstTimeCompId,
            competitionName: quickCompetitionData.competitionName,
            competitionVenues: quickCompetitionData.competitionVenues,
            draws: postDraws,
            startDate: startDate,
            endDate: endDate,
          };
          this.props.updateQuickCompetitionAction(
            payload,
            this.state.yearRefId,
            this.state.buttonPressed,
          );
          this.setState({
            payload: payload,
          });
        } else {
          message.config({
            maxCount: 1,
            duration: 1,
          });
          message.warning(ValidationConstants.pleaseSelectVenue);
        }
      } else {
        message.config({
          maxCount: 1,
          duration: 1,
        });
        message.warning(ValidationConstants.divisionAndTimeslot);
      }
    } else {
      message.config({
        maxCount: 1,
        duration: 1,
      });
      message.warning(ValidationConstants.pleaseSelectCompetition);
    }
  };
  callGenerateFixtures = () => {
    let quickCompetitionData = this.props.quickCompetitionState.quickComptitionDetails;
    const { postDivisionData, postTimeslotData } = this.props.quickCompetitionState;

    if (this.state.firstTimeCompId.length > 0) {
      if (postDivisionData.length > 0 && postTimeslotData.length > 0) {
        if (quickCompetitionData.competitionVenues.length > 0) {
          let startDate = null;
          let endDate = null;
          if (
            this.state.filterDates &&
            this.state.competitionTypeRefId == CompetitionType.Tournament
          ) {
            startDate = this.state.startDate;
            endDate = this.state.endDate;
          }
          let exceptionTypeRefId = this.state.exceptionTypeRefId;
          if (this.state.competitionTypeRefId == CompetitionType.Weekly) {
            exceptionTypeRefId = DrawExceptionType.UseRound1;
          }
          let payload = {
            competitionId: this.state.firstTimeCompId,
            competitionName: quickCompetitionData.competitionName,
            competitionVenues: quickCompetitionData.competitionVenues,
            // draws: postDraws,
            startDate: startDate,
            endDate: endDate,
            exceptionTypeRefId: exceptionTypeRefId,
          };
          this.props.quickCompetitionGenerateFixtureAction(
            payload,
            this.state.yearRefId,
            this.state.buttonPressed,
          );
          this.setState({
            payload: payload,
          });
        } else {
          message.config({
            maxCount: 1,
            duration: 1,
          });
          message.warning(ValidationConstants.pleaseSelectVenue);
        }
      } else {
        message.config({
          maxCount: 1,
          duration: 1,
        });
        message.warning(ValidationConstants.divisionAndTimeslot);
      }
    } else {
      message.config({
        maxCount: 1,
        duration: 1,
      });
      message.warning(ValidationConstants.pleaseSelectCompetition);
    }
  };
  addTeam = () => {
    let quickCompetitionData = this.props.quickCompetitionState.quickComptitionDetails;
    let { postDivisionData, postTimeslotData, postDraws } = this.props.quickCompetitionState;

    if (this.state.firstTimeCompId.length > 0) {
      if (postDivisionData.length > 0 && postTimeslotData.length > 0) {
        if (quickCompetitionData.competitionVenues.length > 0) {
          let startDate = null;
          let endDate = null;
          if (this.state.filterDates && this.state.competitionTypeRefId == 2) {
            startDate = this.state.startDate;
            endDate = this.state.endDate;
          }
          postDraws = postDraws.filter(x => x.isLocked == 1);
          let payload = {
            competitionId: this.state.firstTimeCompId,
            competitionName: quickCompetitionData.competitionName,
            competitionVenues: quickCompetitionData.competitionVenues,
            draws: postDraws,
            startDate: startDate,
            endDate: endDate,
          };
          this.props.quickCompetitionAddTeamAction(payload, this.state.yearRefId);
          this.setState({
            payload: payload,
          });
        } else {
          message.config({
            maxCount: 1,
            duration: 1,
          });
          message.warning(ValidationConstants.pleaseSelectVenue);
        }
      } else {
        message.config({
          maxCount: 1,
          duration: 1,
        });
        message.warning(ValidationConstants.divisionAndTimeslot);
      }
    } else {
      message.config({
        maxCount: 1,
        duration: 1,
      });
      message.warning(ValidationConstants.pleaseSelectCompetition);
    }
  };
  /// set field values
  setFieldValues() {
    let quickCompetitionData = this.props.quickCompetitionState.quickComptitionDetails;
    let selectedVenues = this.props.quickCompetitionState.selectedVenues;
    this.formRef.current.setFieldsValue({
      competition_name: quickCompetitionData.competitionName,
      selectedVenues: selectedVenues,
    });
  }

  //change selected year
  onYearChange(yearRefId) {
    setGlobalYear(yearRefId);
    setOwn_competition(undefined);
    this.props.updateCompetition('', 'allData');
    this.setState({
      yearRefId,
      firstTimeCompId: '',
      editCompetitionUniqueKey: '',
    });
    this.props.getYearAndQuickCompetitionAction(
      this.props.quickCompetitionState.quick_CompetitionYearArr,
      yearRefId,
    );
    this.setFieldValues();
  }

  // change selected competition
  onCompetitionChange(competitionId) {
    this.props.updateCompetition('', 'allData');
    let quickCompetitionState = this.props.quickCompetitionState;
    let comp = quickCompetitionState.quick_CompetitionArr.find(
      c => c.competitionId == competitionId,
    );
    let competitionTypeRefId = CompetitionType.Weekly;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (comp) {
      competitionTypeRefId = comp.competitionTypeRefId;
      startDate = comp.startDate;
      endDate = comp.startDate;
    }
    setOwn_competition(competitionId);
    let exceptionTypeRefId = DrawExceptionType.Retain;
    if (competitionTypeRefId == CompetitionType.Weekly) {
      exceptionTypeRefId = DrawExceptionType.UseRound1;
    }
    this.setState({
      firstTimeCompId: competitionId,
      quickCompetitionLoad: true,
      competitionTypeRefId: competitionTypeRefId,
      startDate: startDate,
      endDate: endDate,
      exceptionTypeRefId: exceptionTypeRefId,
      editCompetitionUniqueKey: '',
    });
    this.getQuickCompetition(
      competitionId,
      competitionTypeRefId,
      this.state.filterDates,
      startDate,
      endDate,
    );
    this.setFieldValues();
  }
  getQuickCompetition = (competitionId, competitionTypeRefId, filterDates, startDate, endDate) => {
    if (filterDates && competitionTypeRefId == 2 && !startDate) {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }
    const body = {
      competitionId: competitionId,
      startDate: startDate,
      endDate: endDate,
    };
    this.props.getQuickCompetitionAction(body);
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
  onDateRangeCheck = val => {
    this.props.updateCompetition('', 'allData');
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate });
    this.getQuickCompetition(this.state.firstTimeCompId, this.state.competitionTypeRefId, val);
  };
  applyDateFilter = () => {
    this.props.updateCompetition('', 'allData');
    if (this.state.firstTimeCompId != '-1') {
      this.getQuickCompetition(
        this.state.firstTimeCompId,
        this.state.competitionTypeRefId,
        this.state.filterDates,
      );
    }
  };
  //visible competition modal
  visibleCompetitionModal() {
    this.props.updateCompetition('', 'clear');
    this.setState({
      visibleCompModal: true,
      editCompetitionUniqueKey: '',
    });
  }

  // handle divison api
  handleDivisionOK = key => {
    let competitionId = this.state.firstTimeCompId;
    let division = this.props.quickCompetitionState.division;
    let updateStatus = this.props.quickCompetitionState.updateStatus;
    if (updateStatus == true && this.state.payload) {
      this.props.updateGridAndDivisionAction(
        competitionId,
        division,
        this.state.yearRefId,
        this.props.quickCompetitionState.quickComptitionDetails.competitionName,
        this.state.payload,
      );
    } else {
      this.props.saveQuickCompDivisionAction(
        competitionId,
        division,
        this.state.yearRefId,
        this.props.quickCompetitionState.quickComptitionDetails.competitionName,
      );
    }

    this.setState({
      divisionGradeModalLoad: true,
      divisionButtonClicked: key,
    });
  };

  //close timeslot modal and call timeslot api
  closeTimeSlotModal = key => {
    let timeslot = this.props.quickCompetitionState.timeSlot;
    let updateStatus = this.props.quickCompetitionState.updateStatus;
    let timeSlotManualperVenueArray = [];
    let timeslots = [];
    let competitionTimeslotManual = [];
    let competitionVenueTimeslotsDayTime = [];

    for (let j in timeslot) {
      let manualStartTime = timeslot[j].startTime;
      for (let k in manualStartTime) {
        let competitionTimeslotsEntity = [];
        if (
          this.state.competitionTypeRefId == CompetitionType.Tournament &&
          manualStartTime[k].grades
        ) {
          competitionTimeslotsEntity = manualStartTime[k].grades.map(x => {
            let entityId = 0;
            let entity = manualStartTime[k].competitionTimeslotsEntity.find(
              e => e.venuePreferenceTypeRefId == 2 && e.venuePreferenceEntityId == x,
            );
            if (entity) {
              entityId = entity.competitionVenueTimeslotEntityId;
            }
            return {
              competitionVenueTimeslotEntityId: entityId,
              venuePreferenceTypeRefId: VenuePreferenceType.Grade,
              venuePreferenceEntityId: x,
              competitionVenueTimeslotDayTimeId:
                manualStartTime[k].competitionVenueTimeslotsDayTimeId,
            };
          });
        }
        let manualAllVenueObj = {
          competitionVenueTimeslotsDayTimeId: manualStartTime[k].competitionVenueTimeslotsDayTimeId,
          dayRefId: timeslot[j].dayRefId,
          matchDate: timeslot[j].matchDate,
          startTime: manualStartTime[k].startTime,
          endTime: manualStartTime[k].endTime,
          sortOrder: JSON.parse(k),
          competitionTimeslotsEntity: competitionTimeslotsEntity,
          noOfRounds: manualStartTime[k].noOfRounds,
        };

        timeSlotManualperVenueArray.push(manualAllVenueObj);
      }
      timeslots = timeSlotManualperVenueArray;
    }
    let timeslotGenerationRefId = TIMESLOT_GENERATION.MANUAL;
    let timeslotRotationRefId = TIMESLOT_ROTATION_MAIN.NONE;
    if (this.state.competitionTypeRefId == CompetitionType.Weekly) {
      competitionTimeslotManual = [
        {
          timeslots: timeslots,
          venueId: 0,
        },
      ];
    } else {
      competitionVenueTimeslotsDayTime = timeslots;
      timeslotGenerationRefId = TIMESLOT_GENERATION.MATCH_DURATION;
      timeslotRotationRefId = TIMESLOTS_ROTATION_SUB.ALLOCATE_GRADES;
    }
    let body = {
      applyToVenueRefId: 1,
      competitionTimeslotId: this.props.quickCompetitionState.timeSlotId,
      competitionTimeslotManual: competitionTimeslotManual,
      competitionTimeslotsEntity: [],
      competitionUniqueKey: this.state.firstTimeCompId,
      competitionVenueTimeslotsDayTime: competitionVenueTimeslotsDayTime,
      competitionVenues: [],
      organisationId: 1,
      timeslotGenerationRefId: timeslotGenerationRefId,
      timeslotRotationRefId: timeslotRotationRefId,
    };
    if (updateStatus == true && this.state.payload) {
      this.props.updateQuickCompetitionTimeSlotData(
        body,
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.props.quickCompetitionState.quickComptitionDetails.competitionName,
        this.state.payload,
      );
    } else {
      this.props.quickCompetitionTimeSlotData(
        body,
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.props.quickCompetitionState.quickComptitionDetails.competitionName,
      );
    }
    this.setState({
      timeslotModalLoad: true,
      timeSlotButtonClicked: key,
    });
  };

  //close division modal on press cancel button in division modal
  divisionModalClose = key => {
    this.props.updateDivision('swap');
    if (key == 'back') {
      this.setState({
        visibleDivisionModal: false,
        venueModalVisible: true,
      });
    } else {
      this.setState({
        visibleDivisionModal: false,
      });
    }
  };

  //close compModalClose on press cancel button
  compModalClose = () => {
    this.setState({
      visibleCompModal: false,
    });
  };

  //close competition modal and call create competition
  closeCompModal = () => {
    this.createQuickCompetition();
    this.setState({
      compModalLoad: true,
      modalButtonPressed: 'save',
    });
  };

  //nextCompModal
  nextCompModal = () => {
    this.createQuickCompetition();
    this.setState({
      compModalLoad: true,
      modalButtonPressed: 'next',
      // visibleCompModal: false, venueModalVisible: true
    });
  };
  createQuickCompetition() {
    let quickCompetitionState = this.props.quickCompetitionState;
    const { competitionName, yearId } = this.props.quickCompetitionState;
    const body = {
      competitionUniqueKey: this.state.editCompetitionUniqueKey,
      competitionName,
      yearRefId: this.state.yearRefId ? this.state.yearRefId : JSON.parse(yearId),
      startDate: quickCompetitionState.competitionDate,
      competitionTypeRefId: quickCompetitionState.competitionTypeRefId,
      competitionFormatRefId: quickCompetitionState.competitionFormatRefId,
      noOfRounds: quickCompetitionState.noOfRounds,
      roundInDays: quickCompetitionState.roundInDays,
      roundInHours: quickCompetitionState.roundInHours,
      roundInMins: quickCompetitionState.roundInMins,
    };
    this.props.createQuickCompetitionAction(body);
  }
  exportQuickComp = () => {
    this.props.exportQuickCompetitionAction(this.state.firstTimeCompId);
  };
  ///close timeslot modal
  handleCancel = key => {
    if (key == 'back') {
      this.props.updateTimeSlot('swapTimeslot');
      this.setState({
        timeSlotVisible: false,
        visibleDivisionModal: true,
      });
    } else {
      this.props.updateTimeSlot('swapTimeslot');
      this.setState({
        timeSlotVisible: false,
      });
    }
  };

  //On selection of venue
  onSelectValues(item, detailsData) {
    this.props.updateQuickCompetitionData(item, 'venues');
    this.props.clearFilter();
  }

  // for search venue
  handleSearch = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchVenueList(filteredData);
  };

  //open time slot modal
  visibleTimeModal = () => {
    if (this.state.firstTimeCompId.length > 0) {
      this.setState({
        timeSlotVisible: true,
      });
    } else {
      message.config({
        maxCount: 1,
        duration: 1,
      });
      message.warning(ValidationConstants.pleaseSelectCompetition);
    }
  };

  // venue save button handle
  handleVenueSave = (e, key) => {
    let competitionId = this.state.firstTimeCompId;
    let updateStatus = this.props.quickCompetitionState.updateStatus;
    let body = {
      competitionUniqueKey: this.state.firstTimeCompId,
      competitionVenues: this.props.quickCompetitionState.quickComptitionDetails.competitionVenues,
    };
    if (updateStatus == true && this.state.payload) {
      this.props.updateGridAndVenue(
        body,
        this.state.payload,
        competitionId,
        this.state.yearRefId,
        this.props.quickCompetitionState.quickComptitionDetails.competitionName,
      );
    } else {
      this.props.quickCompetitionAddVenue(body);
    }
    this.setState({
      venueButtonClicked: key,
      venueComptitionLoad: true,
    });
  };

  //open division modal
  visibleDivisonModal = () => {
    if (this.state.firstTimeCompId.length > 0) {
      this.setState({
        visibleDivisionModal: true,
      });
    } else {
      message.config({
        maxCount: 1,
        duration: 1,
      });
      message.warning(ValidationConstants.pleaseSelectCompetition);
    }
  };

  //handle venue back button
  handleVenueBack = () => {
    this.props.updateCompetition('', 'editComp');
    this.setState({
      venueModalVisible: false,
      visibleCompModal: true,
      editCompetitionUniqueKey: this.state.firstTimeCompId,
    });
  };

  /// on swap grip view component
  async onSwap(source, target) {
    this.setState({ quickCompetitionLoad: true });
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    if (sourceXIndex === targetXIndex && sourceYIndex === targetYIndex) {
      return;
    }
    let drawData = this.props.quickCompetitionState.quickComptitionDetails.draws;
    let sourceObejct = drawData[sourceXIndex].slotsArray[sourceYIndex];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];

    if (sourceObejct.drawsId !== null && targetObject.drawsId !== null) {
      await this.props.updateQuickCompetitionDraws(
        sourceIndexArray,
        targetIndexArray,
        sourceObejct.drawsId,
        targetObject.drawsId,
      );
    } else if (sourceObejct.drawsId == null && targetObject.drawsId == null) {
      return;
    } else {
      if (sourceObejct.drawsId == null) {
        await this.props.updateQuickCompetitionDraws(
          sourceIndexArray,
          targetIndexArray,
          sourceObejct.drawsId,
          targetObject.drawsId,
          sourceObejct,
          'free',
        );
      }
      if (targetObject.drawsId == null) {
        await this.props.updateQuickCompetitionDraws(
          sourceIndexArray,
          targetIndexArray,
          sourceObejct.drawsId,
          targetObject.drawsId,
          targetObject,
          'free',
        );
      }
    }
    setTimeout(() => {
      this.setState({ quickCompetitionLoad: false });
    }, 100);
  }
  filterOnClick = () => {
    this.setState({ filterEnable: !this.state.filterEnable });
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
  changeAllVenueStatus = (value, key) => {
    let { divisionGradeNameList, roundList } = this.props.quickCompetitionState;
    if (key === 'round') {
      this.checkAll(roundList, value);
      this.setState({ allRoundChecked: value });
    } else if (key === 'singleCompDivisionCheked') {
      this.checkAll(divisionGradeNameList, value);
      this.setState({ singleCompDivisionCheked: value });
    }
  };
  checkBoxOnChange = (value, key, index) => {
    let state = this.props.quickCompetitionState;
    state[key][index].checked = value;
    this.setState({ updateUI: true });
  };
  checkAll = (divArray, value) => {
    for (const div of divArray) {
      div.checked = value;
    }
    return divArray;
  };
  changeShowAllStatus = key => {
    if (key === 'round') {
      this.setState({ showAllRound: !this.state.showAllRound });
    } else if (key === 'division') {
      this.setState({ showAllDivision: !this.state.showAllDivision });
    }
  };
  checkColor = slot => {
    let uncheckedDivisions = this.checkAllCompetitionData(
      this.props.quickCompetitionState.divisionGradeNameList,
      'competitionDivisionGradeId',
    );

    let uncheckedRounds = this.checkAllCompetitionData(
      this.props.quickCompetitionState.roundList,
      'roundId',
    );

    if (!uncheckedDivisions.includes(slot.competitionDivisionGradeId)) {
      if (!uncheckedRounds.includes(slot.roundId)) {
        return slot.colorCode;
      }
    }
    return '#999999';
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
  // slotObjectMouseEnter = slot => {
  //   if (slot.drawsId) {
  //     slot.showTooltip = true;
  //     this.setState({ updateUI: true });
  //   }
  //   //this.hideSlotTooltip();
  // };
  // slotObjectMouseLeave = slot => {
  //   if (slot.drawsId) {
  //     slot.showTooltip = false;
  //     this.setState({ updateUI: true });
  //   }
  //   //this.setState({updateUI:true});
  //   //this.hideSlotTooltip();
  // };
  // slotObjectMouseDown = slot => {
  //   if (slot.drawsId) {
  //     slot.showTooltip = false;
  //     this.setState({ updateUI: true });
  //   }
  //   //this.hideSlotTooltip();
  // };
  // slotObjectMouseUp = slot => {
  //   if (slot.drawsId) {
  //     setTimeout(() => {
  //       //delay show tooltip when swap group
  //       slot.showTooltip = true;
  //       //this.setState({updateUI:true});
  //     }, 500);
  //     //this.hideSlotTooltip();
  //   }
  // };
  headerView = () => {
    let appState = this.props.appState;
    let timeSlotData = this.props.quickCompetitionState.timeSlot;
    let division = this.props.quickCompetitionState.division;
    let quickCompetitionState = this.props.quickCompetitionState;

    return (
      <div className="fluid-width">
        <Header className="comp-draws-header-view mt-5">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.quickCompetition1}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Header>
        <div className="row pb-3">
          <div className="col-sm-12">
            <div className="row pb-3">
              <div className="col-sm-2 pb-3">
                <div
                  className="w-ft d-flex flex-row align-items-center"
                  style={{ marginRight: 50 }}
                >
                  <span className="year-select-heading">{AppConstants.year}:</span>
                  <Select
                    name="yearRefId"
                    className="year-select reg-filter-select-year ml-2"
                    // style={{ width: 90 }}
                    onChange={yearRefId => this.onYearChange(yearRefId)}
                    value={this.state.yearRefId}
                  >
                    {quickCompetitionState.quick_CompetitionYearArr.map(item => (
                      <Option key={'year_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="col-sm pb-3">
                <div
                  className="w-ft d-flex flex-row align-items-center"
                  style={{ marginRight: 50 }}
                >
                  <span className="year-select-heading">{AppConstants.competition}:</span>
                  <Select
                    name="competition"
                    className="year-select reg-filter-select-competition ml-2"
                    onChange={competitionId => this.onCompetitionChange(competitionId)}
                    value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                  >
                    {quickCompetitionState.quick_CompetitionArr.map(item => (
                      <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                        {item.competitionName}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {this.state.competitionTypeRefId == CompetitionType.Tournament ? (
                <>
                  <div className="col-sm">
                    <div
                      className="w-100 d-flex flex-row align-items-center"
                      style={{ minWidth: 250 }}
                    >
                      <RangePicker
                        disabled={
                          this.state.firstTimeCompId == '-1' || this.state.filterDates
                            ? false
                            : true
                        }
                        onChange={date => this.onChangeStartDate(date)}
                        format="DD-MM-YYYY"
                        style={{ width: '100%', minWidth: 180 }}
                        value={[moment(this.state.startDate), moment(this.state.endDate)]}
                      />
                    </div>
                  </div>

                  <div className="col-sm" style={{ minWidth: 160 }}>
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={this.state.filterDates}
                      onChange={e => this.onDateRangeCheck(e.target.checked)}
                      disabled={this.state.firstTimeCompId == '-1'}
                      // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
                    >
                      {AppConstants.filterDates}
                    </Checkbox>
                  </div>
                  <div className="col-sm">
                    <Button
                      className="primary-add-comp-form"
                      type="primary"
                      onClick={() => this.applyDateFilter()}
                    >
                      {AppConstants.go}
                    </Button>
                  </div>
                </>
              ) : null}
              <div className="col-sm ml-3 pb-3 d-flex justify-content-start">
                <Button
                  className={`open-reg-button save-draft-text ${showQuickComp ? '' : 'd-none'}`}
                  onClick={() => this.visibleCompetitionModal()}
                  type="primary"
                >
                  + {AppConstants.newCompetition}
                </Button>
              </div>
              <div className="col-sm pb-3 d-flex justify-content-start">
                <Button
                  className="open-reg-button save-draft-text"
                  onClick={() => this.exportQuickComp()}
                  type="primary"
                >
                  {AppConstants.export}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {this.state.competitionTypeRefId == CompetitionType.Weekly ? (
          <TimeSlotModal
            visible={this.state.timeSlotVisible}
            onCancel={() => this.handleCancel('cancel')}
            onTimeslotLoad={this.state.timeslotModalLoad}
            timeSlotOK={() => this.closeTimeSlotModal('save')}
            handleTimeslotNext={() => this.closeTimeSlotModal('next')}
            onTimslotBack={() => this.handleCancel('back')}
            modalTitle={AppConstants.timeSlot}
            timeslots={timeSlotData}
            division={division}
            weekDays={this.props.commonState.days}
            updateTimeSlot={this.props.updateTimeSlot}
            addTimeSlot={() => this.props.updateTimeSlot('add')}
            addStartTime={index => this.props.updateTimeSlot('addStartTime', index)}
            removetimeSlotDay={index => this.props.updateTimeSlot('remove', index)}
            removeStartTime={(index, timeIndex) =>
              this.props.updateTimeSlot('removeStartTime', index, timeIndex)
            }
            changeDay={(day, index) => this.props.updateTimeSlot('day', index, null, day)}
          />
        ) : (
          <TimeSlotTournamentModal
            visible={this.state.timeSlotVisible}
            onCancel={() => this.handleCancel('cancel')}
            onTimeslotLoad={this.state.timeslotModalLoad}
            timeSlotOK={() => this.closeTimeSlotModal('save')}
            handleTimeslotNext={() => this.closeTimeSlotModal('next')}
            onTimslotBack={() => this.handleCancel('back')}
            modalTitle={AppConstants.timeSlot}
            timeslots={timeSlotData}
            division={division}
            weekDays={this.props.commonState.days}
            updateTimeSlot={this.props.updateTimeSlot}
            addTimeSlot={() => this.props.updateTimeSlot('add')}
            addStartTime={index => this.props.updateTimeSlot('addStartTime', index)}
            removetimeSlotDay={index => this.props.updateTimeSlot('remove', index)}
            removeStartTime={(index, timeIndex) =>
              this.props.updateTimeSlot('removeStartTime', index, timeIndex)
            }
            changeDay={(day, index) => this.props.updateTimeSlot('day', index, null, day)}
          />
        )}
        <CompetitionModal
          handleOK={() => this.closeCompModal()}
          handleCompetitionNext={() => this.nextCompModal()}
          visible={this.state.visibleCompModal}
          onCancel={this.compModalClose}
          modalTitle={AppConstants.competition}
          competitionChange={e =>
            this.props.updateCompetition(captializedString(e.target.value), 'add')
          }
          updateDate={date => this.props.updateCompetition(date, 'date')}
          appState={appState}
          quickCompetitionState={this.props.quickCompetitionState}
          updateCompetition={this.props.updateCompetition}
        />

        <DivisionGradeModal
          visible={this.state.visibleDivisionModal}
          onCancel={() => this.divisionModalClose('cancel')}
          onDivisionBack={() => this.divisionModalClose('back')}
          modalTitle={AppConstants.divisionGradeAndTeams}
          division={division}
          onOK={e => this.handleDivisionOK(e)}
          updateDivision={this.props.updateDivision}
          changeDivision={(index, e) =>
            this.props.updateDivision('divisionName', index, null, e.target.value)
          }
          changeTeam={(index, gradeIndex, value) =>
            this.props.updateDivision('noOfTeams', index, gradeIndex, value)
          }
          addDivision={index => this.props.updateDivision('addDivision', index)}
          addGrade={index => this.props.updateDivision('addGrade', index)}
          removegrade={(index, gradeIndex) =>
            this.props.updateDivision('removeGrade', index, gradeIndex)
          }
          changegrade={(index, gradeIndex, e) =>
            this.props.updateDivision('gradeName', index, gradeIndex, e.target.value)
          }
          removeDivision={(index, gradeIndex) =>
            this.props.updateDivision('removeDivision', index, gradeIndex)
          }
        />

        <CompetitionVenueModal
          venueVisible={this.state.venueModalVisible}
          handleVenueOK={e => this.handleVenueSave(e, 'save')}
          onVenueBack={() => this.handleVenueBack()}
          onVenueCancel={() => this.setState({ venueModalVisible: false })}
          handleVenueNext={e => this.handleVenueSave(e, 'next')}
          appState={this.props.appState}
          quickCompetitionState={this.props.quickCompetitionState}
          modalTitle={AppConstants.addVenue}
          onSelectValues={venueSelection =>
            this.onSelectValues(venueSelection, quickCompetitionState.selectedVenues)
          }
          handleSearch={value => this.handleSearch(value, appState.mainVenueList)}
        />
      </div>
    );
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
        {filterEnable && this.roundLeftView()}
        {filterEnable && this.divisionLeftView()}
      </div>
    );
  };
  roundLeftView = () => {
    let { roundList } = this.props.quickCompetitionState;
    let { showAllRound } = this.state;
    return (
      <>
        <div className="row d-flex align-items-center">
          <div className="col-sm d-flex justify-content-start">
            <span className="user-contact-heading">{AppConstants.round}</span>
          </div>
          <div className="col-sm d-flex justify-content-end" style={{ marginTop: 5 }}>
            <a
              className="view-more-btn"
              data-toggle="collapse"
              href={`#round-collapsable-div`}
              role="button"
              aria-expanded="false"
              // aria-controls={teamIndex}
            >
              <i className="fa fa-angle-up theme-color" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="round-collapsable-div" className="pt-3 collapse in">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.allRoundChecked}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'round')}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(roundList) &&
            roundList.map((item, index) => {
              return (
                index < this.checkDisplayCountList(roundList, showAllRound) && (
                  <div key={'round_' + item.roundId} className="column pl-5">
                    <Checkbox
                      className="single-checkbox-radio-style"
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e => this.checkBoxOnChange(e.target.checked, 'roundList', index)}
                    >
                      {item.roundName}
                    </Checkbox>
                  </div>
                )
              );
            })}
          {(isArrayNotEmpty(roundList) || roundList.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('round')}
            >
              {showAllRound ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };
  ///////left side view for division liting with checkbox
  divisionLeftView = () => {
    let { divisionGradeNameList } = this.props.quickCompetitionState;
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
        <div id="division-collapsable-div" className="pt-0 collapse in">
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={this.state.singleCompDivisionCheked}
            onChange={e => this.changeAllVenueStatus(e.target.checked, 'singleCompDivisionCheked')}
          >
            {AppConstants.all}
          </Checkbox>
          {isArrayNotEmpty(divisionGradeNameList) &&
            divisionGradeNameList.map((item, index) => {
              return (
                index < this.checkDisplayCountList(divisionGradeNameList, showAllDivision) && (
                  <div
                    key={'divisionGrade_' + item.competitionDivisionGradeId}
                    className="column pl-5"
                  >
                    <Checkbox
                      className={`single-checkbox-radio-style ${getColor(item.colorCode)}`}
                      style={{ paddingTop: 8 }}
                      checked={item.checked}
                      onChange={e =>
                        this.checkBoxOnChange(e.target.checked, 'divisionGradeNameList', index)
                      }
                    >
                      {item.divisionName + '-' + item.gradeName}
                    </Checkbox>
                  </div>
                )
              );
            })}

          {(isArrayNotEmpty(divisionGradeNameList) || divisionGradeNameList.length > 5) && (
            <span
              className="input-heading-add-another pt-4"
              onClick={() => this.changeShowAllStatus('division')}
            >
              {showAllDivision ? AppConstants.hide : AppConstants.showAll}
            </span>
          )}
        </div>
      </>
    );
  };
  /////form content view
  contentView = () => {
    // let appState = this.props.appState
    // let quickCompetitionState = this.props.quickCompetitionState
    // let quickCompetitionData = this.props.quickCompetitionState.quickComptitionDetails
    const { affiliateOurOrg } = this.props.userState;
    return (
      <div className="comp-draw-content-view mt-0">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-3">
            {/* {quickCompetitionData.competitionName &&
                            <Form.Item
                                name="competition_name"
                                rules={[{ required: true, message: ValidationConstants.competitionNameIsRequired }]}
                            >
                                <InputWithHead
                                    auto_complete="off"
                                    required="required-field pb-0 pt-0"
                                    placeholder={AppConstants.competitionName}
                                    onChange={(e) => this.props.updateQuickCompetitionData(captializedString(e.target.value), "competitionName")}
                                    onBlur={(i) => this.formRef.current.setFieldsValue({
                                        'competition_name': captializedString(i.target.value)
                                    })}
                                />
                            </Form.Item>
                        } */}
          </div>
          <div className="col-sm mt-2 quick-comp-btn-view button-space">
            {affiliateOurOrg.organisationTypeRefId <=
            affiliateOurOrg.whatIsTheLowestOrgThatCanAddVenue ? (
              <Button
                className="open-reg-button save-draft-text"
                onClick={() => this.setState({ venueModalVisible: true })}
                type="primary"
              >
                + {AppConstants.addVenue}
              </Button>
            ) : null}
            <Button
              id={AppUniqueId.add_Div_Grade_Btn}
              className="open-reg-button"
              type="primary"
              onClick={() => this.visibleDivisonModal()}
            >
              + {AppConstants.addDivisionsAndGrades}
            </Button>
          </div>
          <div className="col-sm-2.5 mt-2  quick-comp-btn-view paddingview button-space">
            <Button
              className="open-reg-button"
              onClick={() => this.visibleTimeModal()}
              type="primary"
            >
              + {AppConstants.add_TimeSlot}
            </Button>
          </div>
        </div>
        {/* <div className="row ml-4 pb-5">
                    <div className="col-sm-3 division">
                        <InputWithHead required="required-field pb-0 pt-0" heading={AppConstants.venue} />
                        <Form.Item
                            name="selectedVenues"
                            rules={[{ required: true, message: ValidationConstants.pleaseSelectVenue }]}
                        >
                            <Select
                                mode="multiple"
                                className="w-100"
                                style={{ paddingRight: 1, minWidth: 182 }}
                                onChange={venueSelection => {
                                    this.onSelectValues(venueSelection, quickCompetitionState.selectedVenues)
                                }}
                                placeholder={AppConstants.selectVenue}
                                filterOption={false}
                                // onBlur={() => console.log("called")}
                                onSearch={(value) => { this.handleSearch(value, appState.mainVenueList) }}
                            >
                                {appState.venueList.map((item) => (
                                    <Option key={'venue_' + item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </div> */}
        <div className="row">
          <div className={this.state.filterEnable ? 'col-sm-3' : 'col-sm-1'}>
            {this.sideMenuView()}
          </div>
          <div className={this.state.filterEnable ? 'col-sm-9' : 'col-sm'}>
            {this.state.quickCompetitionLoad ? (
              <div>{this.draggableView()}</div>
            ) : (
              this.draggableView()
            )}
          </div>
        </div>
      </div>
    );
  };

  // grid view
  draggableView = () => {
    var dateMargin = 80;
    var dayMargin = 80;
    let topMargin = 0;
    let quickComptitionDetails = this.props.quickCompetitionState.quickComptitionDetails;
    let getStaticDrawsData = this.props.quickCompetitionState.quickComptitionDetails.draws;
    let dateArray = this.props.quickCompetitionState.quickComptitionDetails.dateNewArray;
    let disabledStatus = quickComptitionDetails.drawsPublish == 1;
    let leftMarginUnit = 111;
    let topMarginUnit = 68;
    let slotHeightUnit = 48;
    return (
      <div className="draggable-wrap draw-data-table">
        <div className="scroll-bar pb-4">
          <div className="table-head-wrap">
            <div className="tablehead-row-fixture">
              <div className="sr-no empty-bx" />
              {dateArray.map((dateItem, index) => {
                if (index !== 0) {
                  dateMargin += leftMarginUnit;
                }
                return (
                  <span key={'key' + index} style={{ left: dateMargin }}>
                    {dateItem.notInDraw == false ? getDayName(dateItem.date) : ''}
                  </span>
                );
              })}
            </div>
            <div className="tablehead-row-fixture">
              <div className="sr-no empty-bx" />
              {dateArray.map((item, index) => {
                if (index !== 0) {
                  dayMargin += leftMarginUnit;
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
                    {/* {getTime(item.date)} */}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="main-canvas Draws">
          {getStaticDrawsData.map((courtData, index) => {
            let leftMargin = 80;
            if (index !== 0) {
              topMargin += topMarginUnit;
            }
            return (
              <div key={index + 'courtkey'}>
                <div className="quick-comp-canvas">
                  <div className="venueCourt-tex-div" style={{ width: 80 }}>
                    <span className="venueCourt-text">
                      {courtData.venueShortName + '-' + courtData.venueCourtNumber}
                    </span>
                  </div>
                </div>
                {courtData.slotsArray.map((slotObject, slotIndex) => {
                  if (slotIndex !== 0) {
                    leftMargin += leftMarginUnit;
                  }
                  return (
                    <div key={slotIndex + 'slotkey'}>
                      <span
                        key={slotIndex + 'key'}
                        style={{ left: leftMargin, top: topMargin }}
                        className="fixtureBorder"
                      />
                      {/* <Tooltip
                        arrowPointAtCenter
                        placement="top"
                        className="comp-player-table-tag2"
                        //visible={slotObject.drawsId && slotObject.showTooltip}
                        title={
                          slotObject.drawsId && (
                            <>
                              <div>{slotObject.divisionName + '-' + slotObject.gradeName}</div>
                              <div>{slotObject.roundName}</div>
                            </>
                          )
                        }
                      > */}
                      <div
                        className="fixtureBox"
                        style={{
                          backgroundColor: this.checkColor(slotObject),
                          left: leftMargin,
                          top: topMargin,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                        // onMouseDown={() => {
                        //   this.slotObjectMouseDown(slotObject);
                        // }}
                        // onTouchStart={() => {
                        //   this.slotObjectMouseDown(slotObject);
                        // }}
                        // onMouseUp={() => {
                        //   this.slotObjectMouseUp(slotObject);
                        // }}
                        // onMouseEnter={e => this.slotObjectMouseEnter(slotObject)}
                        // onMouseLeave={() => {
                        //   this.slotObjectMouseLeave(slotObject);
                        // }}
                      >
                        <CompetitionSwappable
                          id={index.toString() + ':' + slotIndex.toString()}
                          content={1}
                          swappable
                          onSwap={(source, target) => {
                            return this.onSwap(source, target);
                          }}
                        >
                          {slotObject.drawsId != null ? (
                            <span>
                              {slotObject.divisionName + '-' + slotObject.gradeName}
                              <br /> {slotObject.roundName.replace('Round ', 'R')}
                            </span>
                          ) : (
                            <span>Free</span>
                          )}
                        </CompetitionSwappable>
                      </div>
                      {/* </Tooltip> */}
                      {slotObject.drawsId !== null && (
                        <div
                          className="box-exception"
                          style={{
                            left: leftMargin,
                            top: topMargin + slotHeightUnit,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            marginLeft: slotObject.isLocked == 1 && -10,
                          }}
                        >
                          <Menu
                            className="action-triple-dot-draws"
                            theme="light"
                            mode="horizontal"
                            style={{
                              lineHeight: '16px',
                              borderBottom: 0,
                              cursor: disabledStatus && 'no-drop',
                              display: slotObject.isLocked !== 1 && 'flex',
                              justifyContent: slotObject.isLocked !== 1 && 'center',
                            }}
                          >
                            <SubMenu
                              disabled={disabledStatus}
                              // style={{ borderBottomStyle: "solid", borderBottom: 2 }}
                              key="sub1"
                              title={
                                slotObject.isLocked == 1 ? (
                                  <div
                                    className="d-flex justify-content-between"
                                    style={{ width: 80, maxWidth: 80 }}
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
      </div>
    );
  };

  // footer view
  footerView = () => {
    let quickComptitionDetails = this.props.quickCompetitionState.quickComptitionDetails;
    let isPublish = quickComptitionDetails.drawsPublish == 1;
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button"></div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button
                id={'savefixture'}
                className="open-reg-button mr-15"
                htmlType="submit"
                type="primary"
                disabled={isPublish}
                onClick={() => this.setState({ buttonPressed: 'saveDraft' })}
              >
                {AppConstants.save}
              </Button>
              <Button
                id={AppUniqueId.qckcomp_genFixtures_btn}
                className="open-reg-button mr-15"
                type="primary"
                disabled={isPublish}
                onClick={() => this.setState({ drawGenerateModalVisible: true })}
              >
                {AppConstants.generateFixtures}
              </Button>
              <Button
                id={AppUniqueId.qckcomp_addTeams_btn}
                className="open-reg-button"
                type="primary"
                disabled={isPublish}
                onClick={() => this.addTeam()}
              >
                {AppConstants.addTeams}
              </Button>
            </div>
          </div>
        </div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.drawsRegeneration}
          visible={this.state.drawGenerateModalVisible}
          onOk={() => this.handleGenerateDrawModal('ok')}
          onCancel={() => this.handleGenerateDrawModal('cancel')}
        >
          <div className="modal-publish-popup">
            <div className="regenerateTitle mt-10">{AppConstants.wantYouRegenerateDraw}</div>
            <div>
              {' '}
              <Radio.Group
                className="radio-model-popup"
                value={this.state.exceptionTypeRefId}
                onChange={e => this.setState({ exceptionTypeRefId: e.target.value })}
              >
                {this.state.competitionTypeRefId == CompetitionType.Tournament ? (
                  <>
                    <Radio style={{ fontSize: '14px' }} value={1}>
                      {AppConstants.retainException}
                    </Radio>
                    <Radio style={{ fontSize: '14px' }} value={2}>
                      {AppConstants.removeException}
                    </Radio>
                  </>
                ) : (
                  <Radio style={{ fontSize: '14px' }} value={3}>
                    {AppConstants.useRound1Template}
                  </Radio>
                )}
              </Radio.Group>
            </div>
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

        <InnerHorizontalMenu menu="competition" compSelectedKey="2" />

        {/* <Loader visible={this.props.quickCompetitionState.onQuickCompLoad} /> */}
        <Loader
          visible={this.state.compModalLoad || this.props.quickCompetitionState.onQuickCompLoad}
        />

        <Layout className="comp-dash-table-view">
          {/* <div className="comp-draw-head-content-view"> */}
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAPIsActionCall}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
            }}
            noValidate="noValidate"
          >
            <Content>{this.contentView()}</Content>
            {/* </div> */}
            <Footer className="pr-4">{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getVenuesTypeAction,
      searchVenueList,
      clearFilter,
      updateQuickCompetitionData,
      getYearAndQuickCompetitionAction,
      updateTimeSlot,
      quickCompetitionInit,
      updateDivision,
      updateCompetition,
      createQuickCompetitionAction,
      saveQuickCompDivisionAction,
      getQuickCompetitionAction,
      exportQuickCompetitionAction,
      updateQuickCompetitionAction,
      quickCompetitionGenerateFixtureAction,
      quickCompetitionAddTeamAction,
      quickCompetitionTimeSlotData,
      updateQuickCompetitionDraws,
      quickCompetitionAddVenue,
      updateQuickCompetitionTimeSlotData,
      updateGridAndDivisionAction,
      updateGridAndVenue,
      getAffiliateOurOrganisationIdAction,
      competitionFeeInit,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    quickCompetitionState: state.QuickCompetitionState,
    commonState: state.CommonReducerState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionQuickCompetition);

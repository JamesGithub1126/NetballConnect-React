import React, { Component, createRef } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CustomTooltip from 'react-png-tooltip';
import {
  Layout,
  Breadcrumb,
  Select,
  Button,
  TimePicker,
  Radio,
  Form,
  message,
  Tooltip,
  Space,
  Checkbox,
} from 'antd';
import moment from 'moment';

import './competition.css';

import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import AppImages from 'themes/appImages';
import AppUniqueId from 'themes/appUniqueId';
import history from 'util/history';
import { isArrayNotEmpty } from 'util/helpers';
import { sortArrayAlphabetical } from 'util/drawUtil';
// import { getCurrentYear } from 'util/permissions';
import {
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  setGlobalYear,
  getGlobalYear,
  setCompetitionID,
  getCompetitionId,
  getOrganisationData,
} from 'util/sessionStorage';
import {
  getYearAndCompetitionOwnAction,
  getVenuesTypeAction,
  clearYearCompetitionAction,
} from 'store/actions/appAction';
import {
  getCompetitionWithTimeSlots,
  addRemoveTimeSlot,
  UpdateTimeSlotsData,
  UpdateTimeSlotsDataManual,
  addTimeSlotDataPost,
  searchDivisionList,
  ClearDivisionArr,
  getCompetitionTeams,
  //getCompetitionTimeslots,
  //getTeamTimeslotsPreferences,
  //saveTeamTimeslotsPreferences,
  UpdateTimeSlotsMatchDurationReference,
} from 'store/actions/competitionModuleAction/competitionTimeAndSlotsAction';
import { timeSlotInit } from 'store/actions/commonAction/commonAction';
import InputWithHead from 'customComponents/InputWithHead';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import { TIMESLOT_GENERATION, TIMESLOT_ROTATION_MAIN, TIMESLOTS_ROTATION_SUB } from 'util/enums';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

//const isTeamPreferencesEnable = process.env.REACT_APP_TEAM_PREFERENCES_FOR_DRAW === 'true';

class CompetitionCourtAndTimesAssign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      firstTimeCompId: '',
      getDataLoading: false,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      isQuickCompetition: false,
      onNextLoad: false,
      nextButtonClicked: false,
      finalTypeRefId: null,
      teams: null,
      isManuallySelected: false,
      preferenceFormValues: null,
      gradeSortOrderEnabled: false,
      gradeSortOrders: [],
    };
    // this.props.timeSlotInit()
    this.props.clearYearCompetitionAction();
    this.props.getVenuesTypeAction();
    this.formRef = createRef();
    this.formPreferenceRef = createRef();
  }

  // component did mount
  componentDidMount() {
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    let storedfinalTypeRefId = getOwn_CompetitionFinalRefId();
    const compIdNumber = getCompetitionId();
    let propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    let compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    if (storedCompetitionId && yearId && propsData && compData) {
      let quickComp = this.props.appState.own_CompetitionArr.find(
        x => x.competitionId == storedCompetitionId && x.isQuickCompetition == 1,
      );

      this.setState({
        yearRefId: JSON.parse(yearId),
        firstTimeCompId: storedCompetitionId,
        competitionStatus: storedCompetitionStatus,
        getDataLoading: true,
        isQuickCompetition: quickComp != undefined,
        finalTypeRefId: storedfinalTypeRefId,
      });
      this.props.getCompetitionWithTimeSlots(yearId, storedCompetitionId);
      if (!!compIdNumber) {
        this.props.getCompetitionTeams(compIdNumber);
        //this.props.getCompetitionTimeslots(compIdNumber);
        //this.props.getTeamTimeslotsPreferences(compIdNumber);
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

  // component did update
  componentDidUpdate(prevProps) {
    let competitionTimeSlots = this.props.competitionTimeSlots;
    let timeSlotData = competitionTimeSlots.getcompetitionTimeSlotData;
    if (prevProps.competitionTimeSlots !== competitionTimeSlots) {
      if (competitionTimeSlots.onGetTimeSlotLoad == false && this.state.getDataLoading) {
        this.setState({
          getDataLoading: false,
        });
        this.setDetailsFieldValue();
      }
    }

    if (prevProps.appState !== this.props.appState) {
      let competitionList = this.props.appState.own_CompetitionArr;
      if (prevProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          let finalTypeRefId = competitionList[0].finalTypeRefId;
          const { id } = competitionList[0];
          setCompetitionID(id);
          setOwn_competition(competitionId);
          setOwn_competitionStatus(statusRefId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          let quickComp = this.props.appState.own_CompetitionArr.find(
            x => x.competitionId == competitionId && x.isQuickCompetition == 1,
          );
          this.props.getCompetitionWithTimeSlots(yearId, competitionId);
          this.props.getCompetitionTeams(id);
          //this.props.getCompetitionTimeslots(id);
          //this.props.getTeamTimeslotsPreferences(id);
          this.setState({
            getDataLoading: true,
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            finalTypeRefId: finalTypeRefId,
            isQuickCompetition: quickComp != undefined,
            yearRefId: JSON.parse(yearId),
          });
        }
      }
    }
    if (competitionTimeSlots.onLoad === false && this.state.onNextLoad === true) {
      if (!competitionTimeSlots.error) {
        if (this.state.nextButtonClicked) {
          this.setState({
            onNextLoad: false,
            nextButtonClicked: false,
          });
          history.push('competitionVenueTimesPrioritisation');
        } else {
          this.setState({
            onNextLoad: false,
          });
        }
      } else {
        this.setState({
          onNextLoad: false,
          nextButtonClicked: false,
        });
      }
    }

    if (prevProps.competitionTimeSlots.teamList !== this.props.competitionTimeSlots.teamList) {
      this.setState({ teams: this.props.competitionTimeSlots.teamList });
    }

    if (
      prevProps.competitionTimeSlots.timeslotsManualRawData !==
      this.props.competitionTimeSlots.timeslotsManualRawData
    ) {
      this.setState({
        isManuallySelected: !!this.props.competitionTimeSlots.timeslotsManualRawData.length,
      });
    }

    if (
      prevProps.competitionTimeSlots.timePreferences !==
      this.props.competitionTimeSlots.timePreferences
    ) {
      const timePreferencesProps = {
        preferences: this.getTimePreferencesProps(),
      };
      this.setState({ preferenceFormValues: timePreferencesProps });
    }
    if (
      this.isMatchDurationTimeSlotByDivisionGrade() &&
      timeSlotData.competitionVenueTimeslotsDayTime.length &&
      this.formRef.current
    ) {
      const { getcompetitionTimeSlotData } = competitionTimeSlots;
      let { divisions = [], grades = [] } = getcompetitionTimeSlotData;
      let formValues = {};
      let dropdownsource = [];
      let sourceIds = [];
      //when swith division/grade ,will change select datasource ,so we need to reset form value
      if (timeSlotData.timeslotRotationRefId == TIMESLOTS_ROTATION_SUB.ALLOCATE_DIVISIONS) {
        dropdownsource = divisions.map(d => d.competitionMembershipProductDivision);
      } else if (timeSlotData.timeslotRotationRefId == TIMESLOTS_ROTATION_SUB.ALLOCATE_GRADES) {
        dropdownsource = grades.map(d => d.competitionDivisionGradeId);
      }
      timeSlotData.competitionVenueTimeslotsDayTime.forEach((slot, index) => {
        let entitys = slot.competitionTimeslotsEntity || [];
        formValues[`division_grade_${index}`] = entitys
          .map(en => en.venuePreferenceEntityId)
          .filter(entityid => dropdownsource.includes(entityid));
      });
      this.formRef.current.setFieldsValue(formValues);
    }
  }

  isMatchDurationTimeSlotByDivisionGrade = () => {
    let competitionTimeSlots = this.props.competitionTimeSlots;
    let timeSlotData = competitionTimeSlots.getcompetitionTimeSlotData;
    return (
      timeSlotData.mainTimeRotationID === TIMESLOT_ROTATION_MAIN.ALLOCATE &&
      timeSlotData.timeslotGenerationRefId == TIMESLOT_GENERATION.MATCH_DURATION
    );
  };

  setIsManuallySelected = () => {
    const { competitionTimeslotManual } = this.handleTimeslotsFormData();
    this.setState({ isManuallySelected: !!competitionTimeslotManual.length });
  };

  // for set default values
  setDetailsFieldValue = () => {
    let competitionTimeSlots = this.props.competitionTimeSlots;
    if (!this.formRef.current) return;
    this.formRef.current.setFieldsValue({
      timeslotRotationRefId: competitionTimeSlots.getcompetitionTimeSlotData.timeslotRotationRefId,
      timeslotGenerationRefId:
        competitionTimeSlots.getcompetitionTimeSlotData.timeslotGenerationRefId,
      applyToVenueRefId: competitionTimeSlots.getcompetitionTimeSlotData.applyToVenueRefId,
      mainTimeRotationID: competitionTimeSlots.getcompetitionTimeSlotData.mainTimeRotationID,
    });

    const competitionVenueTimeslotsDayTime =
      competitionTimeSlots.getcompetitionTimeSlotData.competitionVenueTimeslotsDayTime;
    let timeSlotMatchDuration = competitionVenueTimeslotsDayTime
      ? competitionVenueTimeslotsDayTime
      : [];

    if (timeSlotMatchDuration.length > 0) {
      timeSlotMatchDuration.forEach((item, index) => {
        let dayRefId = `dayRefId${index}`;
        this.formRef.current.setFieldsValue({
          [dayRefId]: item.dayRefId,
        });
      });
    }

    const competitionTimeslotsEntity =
      competitionTimeSlots.getcompetitionTimeSlotData.competitionTimeslotsEntity;
    const timeslotmatchEntityCheck = competitionTimeslotsEntity ? competitionTimeslotsEntity : [];

    if (timeslotmatchEntityCheck.length > 0) {
      timeslotmatchEntityCheck.forEach((item, index) => {
        let timeSlotEntityManualkeyArr = `timeSlotEntityManualkeyArr${index}`;
        let timeSlotEntityGradeKeyArr = `timeSlotEntityGradeKeyArr${index}`;

        this.formRef.current.setFieldsValue({
          [timeSlotEntityManualkeyArr]: item.timeSlotEntityManualkeyArr,
          [timeSlotEntityGradeKeyArr]: item.timeSlotEntityGradeKeyArr,
        });
      });
    }

    const competitionTimeslotManual =
      competitionTimeSlots.getcompetitionTimeSlotData.competitionTimeslotManual;
    const timeSlotManualPerVenue = competitionTimeslotManual ? competitionTimeslotManual : [];

    if (timeSlotManualPerVenue.length > 0) {
      timeSlotManualPerVenue.forEach(PerVenueItem => {
        if (PerVenueItem.timeslots.length > 0) {
          PerVenueItem.timeslots.forEach((timeSlotItem, timeSlotIndex) => {
            let dayRefIdManual = `dayRefIdManual${timeSlotIndex}`;
            this.formRef.current.setFieldsValue({
              [dayRefIdManual]: timeSlotItem.dayRefId,
            });

            if (timeSlotItem.startTime.length > 0) {
              timeSlotItem.startTime.forEach((startTimeItem, startTimeIndex) => {
                let timeSlotEntityManualkey = `timeSlotEntityManualkey${timeSlotIndex}${startTimeIndex}`;
                let timeSlotEntityGradeKey = `timeSlotEntityGradeKey${timeSlotIndex}${startTimeIndex}`;
                this.formRef.current.setFieldsValue({
                  [timeSlotEntityManualkey]: startTimeItem.timeSlotEntityManualkey,
                  [timeSlotEntityGradeKey]: startTimeItem.timeSlotEntityGradeKey,
                });
              });
            }
          });
        }
      });
    }

    let timeSlotManualAllVenue = competitionTimeSlots.timeSlotManualAllVenue
      ? competitionTimeSlots.timeSlotManualAllVenue
      : [];
    if (timeSlotManualAllVenue.length > 0) {
      timeSlotManualAllVenue.forEach((venueItemData, venue_Index) => {
        if (venueItemData.timeslots.length > 0) {
          venueItemData.timeslots.forEach((timeSlotsItem, timeSlotsIndex) => {
            let dayRefIdAllVenue = `dayRefIdAllVenue${venue_Index}${timeSlotsIndex}`;
            this.formRef.current.setFieldsValue({
              [dayRefIdAllVenue]: timeSlotsItem.dayRefId,
            });
            if (timeSlotsItem.startTime.length > 0) {
              timeSlotsItem.startTime.forEach((startItem, startIndex) => {
                let perDivisionkey = `perDivisionkey${venue_Index}${timeSlotsIndex}${startIndex}`;
                let perGradeKey = `perGradeKey${venue_Index}${timeSlotsIndex}${startIndex}`;
                this.formRef.current.setFieldsValue({
                  [perDivisionkey]: startItem.timeSlotEntityManualkey,
                  [perGradeKey]: startItem.timeSlotEntityGradeKey,
                });
              });
            }
          });
        }
      });
    }

    let gradeSortOrders = competitionTimeSlots.getcompetitionTimeSlotData.gradeSortOrders;
    if (gradeSortOrders && gradeSortOrders.length > 0) {
      let gradeIds = gradeSortOrders.sort((a, b) => a.sortOrder - b.sortOrder).map(x => x.gradeId);
      this.setState({ gradeSortOrders: gradeIds, gradeSortOrderEnabled: true });
    }
  };

  // get the title
  getTitle(pool, grade) {
    if (this.state.finalTypeRefId == 2) {
      return pool;
    } else {
      return grade;
    }
  }

  handleTimeslotsFormData = () => {
    let AllVenueData = JSON.parse(
      JSON.stringify(this.props.competitionTimeSlots.timeSlotManualAllVenue),
    );
    let timeSlotData = JSON.parse(
      JSON.stringify(this.props.competitionTimeSlots.getcompetitionTimeSlotData),
    );
    timeSlotData['competitionUniqueKey'] = this.state.firstTimeCompId;
    timeSlotData['organisationId'] = 1;
    ///for filter timeslot data on the basis of generation key
    if (timeSlotData.timeslotGenerationRefId == 1) {
      timeSlotData.competitionTimeslotManual = [];
      timeSlotData['applyToVenueRefId'] = 0;
      let timeSlotEntity = timeSlotData.competitionTimeslotsEntity;
      if (timeSlotData.mainTimeRotationID !== 8) {
        timeSlotEntity = [];
      } else {
        for (let i in timeSlotEntity) {
          delete timeSlotEntity[i]['timeSlotEntityManualkeyArr'];
          delete timeSlotEntity[i]['timeSlotEntityGradeKeyArr'];
          timeSlotEntity[i].sortOrder = JSON.parse(i);
        }
      }
    } else {
      timeSlotData.competitionTimeslotsEntity = [];
      timeSlotData.competitionVenueTimeslotsDayTime = [];
    }

    //filter data for if apply time slot for per venue
    if (timeSlotData.applyToVenueRefId == 2) {
      // let newObj = null
      let updatedTimeSlotManualArr = [];
      for (let i in AllVenueData) {
        if (AllVenueData[i].timeslots.length > 0) {
          delete AllVenueData[i].venueName;
          updatedTimeSlotManualArr.push(AllVenueData[i]);
        }
      }
      let getTimeSlot = null;
      let getStartTime = null;
      let manualperVenueObj = null;

      for (let i in updatedTimeSlotManualArr) {
        let timeSlotManualAllVenueArray = [];
        getTimeSlot = updatedTimeSlotManualArr[i].timeslots;
        for (let j in getTimeSlot) {
          getStartTime = getTimeSlot[j].startTime;
          for (let k in getStartTime) {
            let manualcompetitionTimeslotsEntityOBj = getStartTime[k].competitionTimeslotsEntity;
            if (timeSlotData.mainTimeRotationID == 8) {
              for (let l in manualcompetitionTimeslotsEntityOBj) {
                manualcompetitionTimeslotsEntityOBj[l].competitionVenueTimeslotEntityId = 0;
                manualperVenueObj = {
                  competitionVenueTimeslotsDayTimeId: !!getStartTime[k]
                    ?.competitionVenueTimeslotsDayTimeId
                    ? getStartTime[k].competitionVenueTimeslotsDayTimeId
                    : 0,
                  dayRefId: getTimeSlot[j].dayRefId,
                  startTime: getStartTime[k].startTime,
                  sortOrder: JSON.parse(k),
                  competitionTimeslotsEntity:
                    timeSlotData.mainTimeRotationID == 8 ? manualcompetitionTimeslotsEntityOBj : [],
                };
              }
            } else {
              manualperVenueObj = {
                competitionVenueTimeslotsDayTimeId: !!getStartTime[k]
                  ?.competitionVenueTimeslotsDayTimeId
                  ? getStartTime[k].competitionVenueTimeslotsDayTimeId
                  : 0,
                dayRefId: getTimeSlot[j].dayRefId,
                startTime: getStartTime[k].startTime,
                sortOrder: JSON.parse(k),
                competitionTimeslotsEntity:
                  timeSlotData.mainTimeRotationID == 8 ? manualcompetitionTimeslotsEntityOBj : [],
              };
            }

            timeSlotManualAllVenueArray.push(manualperVenueObj);
          }
        }
        updatedTimeSlotManualArr[i].timeslots = timeSlotManualAllVenueArray;
      }
      timeSlotData.competitionTimeslotManual = JSON.parse(JSON.stringify(updatedTimeSlotManualArr));
    }

    if (!timeSlotData.competitionTimeslotId) {
      timeSlotData.competitionTimeslotId = 0;
    }
    /// filter data on the basis of timeslot rotation id
    if (timeSlotData.applyToVenueRefId == 1) {
      let manualStartTime = null;
      let manualAllVenueObj = null;
      let checkTimeRotationDataArr = timeSlotData.competitionTimeslotManual;
      for (let i in checkTimeRotationDataArr) {
        let timeSloltdataArr = checkTimeRotationDataArr[i].timeslots;
        if (timeSloltdataArr.length > 0) {
          let timeSlotManualperVenueArray = [];
          for (let j in timeSloltdataArr) {
            delete timeSloltdataArr[j].timeSlotEntityManualkey;
            delete timeSloltdataArr[j]['timeSlotEntityGradeKey'];
            manualStartTime = timeSloltdataArr[j].startTime;
            sortArrayAlphabetical(manualStartTime, item => item.startTime);
            for (let k in manualStartTime) {
              let competitionTimeslotsEntityObj = manualStartTime[k].competitionTimeslotsEntity;
              if (timeSlotData.mainTimeRotationID == 8) {
                for (let l in competitionTimeslotsEntityObj) {
                  competitionTimeslotsEntityObj[l].competitionVenueTimeslotEntityId = 0;

                  manualAllVenueObj = {
                    competitionVenueTimeslotsDayTimeId: !!manualStartTime[k]
                      ?.competitionVenueTimeslotsDayTimeId
                      ? manualStartTime[k].competitionVenueTimeslotsDayTimeId
                      : 0,
                    dayRefId: timeSloltdataArr[j].dayRefId,
                    startTime: manualStartTime[k].startTime,
                    sortOrder: JSON.parse(k),
                    competitionTimeslotsEntity:
                      timeSlotData.mainTimeRotationID !== 8 ? [] : competitionTimeslotsEntityObj,
                  };
                }
              } else {
                manualAllVenueObj = {
                  competitionVenueTimeslotsDayTimeId: !!manualStartTime[k]
                    ?.competitionVenueTimeslotsDayTimeId
                    ? manualStartTime[k].competitionVenueTimeslotsDayTimeId
                    : 0,
                  dayRefId: timeSloltdataArr[j].dayRefId,
                  startTime: manualStartTime[k].startTime,
                  sortOrder: JSON.parse(k),
                  competitionTimeslotsEntity:
                    timeSlotData.mainTimeRotationID !== 8 ? [] : competitionTimeslotsEntityObj,
                };
              }
              timeSlotManualperVenueArray.push(manualAllVenueObj);
            }
          }
          checkTimeRotationDataArr[i].timeslots = timeSlotManualperVenueArray;
        }
      }
      timeSlotData.competitionTimeslotManual = JSON.parse(JSON.stringify(checkTimeRotationDataArr));
    }

    // if (timeSlotData.timeslotRotationRefId == 7) {
    //     timeSlotData.competitionVenueTimeslotsDayTime = []
    //     timeSlotData.competitionTimeslotsEntity = []
    //     timeSlotData.competitionTimeslotManual = []
    // }
    timeSlotData.gradeSortOrders = this.state.gradeSortOrders.map((x, i) => {
      return { gradeId: x, sortOrder: i + 1 };
    });
    delete timeSlotData['divisions'];
    delete timeSlotData['grades'];
    delete timeSlotData['mainTimeRotationID'];

    return timeSlotData;
  };

  // for post api
  saveAPIsActionCall = () => {
    const timeSlotData = this.handleTimeslotsFormData();
    const compIdNumber = getCompetitionId();
    //const isTeamPreferenceActive = isTeamPreferencesEnable && this.state.isManuallySelected;

    if (timeSlotData.competitionUniqueKey == null || timeSlotData.competitionUniqueKey == '') {
      message.error(ValidationConstants.pleaseSelectCompetition);
    } else {
      if (this.isMatchDurationTimeSlotByDivisionGrade()) {
        timeSlotData.competitionTimeslotsEntity = [];
      } else {
        let timeslotDayTimes = timeSlotData.competitionVenueTimeslotsDayTime || [];
        timeslotDayTimes.forEach(time => {
          time.competitionTimeslotsEntity = [];
        });
      }
      this.props.addTimeSlotDataPost(timeSlotData, compIdNumber);
      this.setState({
        onNextLoad: true,
        preferenceFormValues: null,
      });
    }
  };

  // update time rotation
  updatetimeRotation(e) {
    this.props.UpdateTimeSlotsData(e.target.value, 'timeslotRotationRefId', null, null, null, null);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 1000);
  }

  /// update main time rotation
  updateMainTimeRotation(e) {
    this.props.UpdateTimeSlotsData(e.target.value, 'mainTimeRotationID', null, null, null, null);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 800);
  }

  /// update time slot generation
  changeTimeSlotGeneration(e) {
    this.props.UpdateTimeSlotsData(
      e.target.value,
      'timeslotGenerationRefId',
      null,
      null,
      null,
      null,
    );
    setTimeout(() => {
      this.setDetailsFieldValue();
      this.setIsManuallySelected();
    }, 0);
  }

  getTimePreferencesProps = () => {
    const timePreferencesProps = !!this.props.competitionTimeSlots?.timePreferences
      ? this.props.competitionTimeSlots.timePreferences.map(preferenceItem => ({
          teamId: preferenceItem.id,
          competitionTimeslotsIds: preferenceItem.competitionVenueTimeslotDayTimes.map(
            time => time.id,
          ),
        }))
      : [];

    return timePreferencesProps;
  };

  // handleSavePreferences = values => {
  //   const compIdNumber = getCompetitionId();
  //   const { organisationId } = getOrganisationData() || {};

  //   if (compIdNumber && organisationId)
  //     this.props.saveTeamTimeslotsPreferences(compIdNumber, organisationId, values);
  // };

  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.timeSlot}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  onYearChange = yearId => {
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    setOwn_CompetitionFinalRefId(undefined);
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      competitionStatus: 0,
      isQuickCompetition: false,
      finalTypeRefId: null,
    });
    this.setDetailsFieldValue();
  };

  // on Competition change
  onCompetitionChange(competitionId) {
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
    let statusRefId = own_CompetitionArr[statusIndex].statusRefId;
    let finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
    const { id } = own_CompetitionArr.find(comp => comp.competitionId === competitionId);
    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    setOwn_CompetitionFinalRefId(finalTypeRefId);
    setCompetitionID(id);
    let quickComp = this.props.appState.own_CompetitionArr.find(
      x => x.competitionId == competitionId && x.isQuickCompetition == 1,
    );
    this.props.getCompetitionWithTimeSlots(this.state.yearRefId, competitionId);
    this.props.getCompetitionTeams(id);
    //this.props.getCompetitionTimeslots(id);
    //this.props.getTeamTimeslotsPreferences(id);
    this.setState({
      getDataLoading: true,
      firstTimeCompId: competitionId,
      competitionStatus: statusRefId,
      finalTypeRefId: finalTypeRefId,
      isQuickCompetition: quickComp != undefined,
      preferenceFormValues: null,
    });
  }

  //add obj on click of time slot allocation based on match duration
  addAnotherTimeSlot = (index, item, keyword) => {
    this.props.addRemoveTimeSlot(index, item, keyword);
  };

  onTimeChange = (time, index, field) => {
    if (time) {
      this.changeTime(time, field, index);
    }
  };

  //////add or remove another division in the division tab
  addDataTimeSlot(item, index, data) {
    let timeSlotData = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let daysList = this.props.competitionTimeSlots;
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <div className="row" key={index}>
        <div className="col-sm">
          <InputWithHead heading={index == 0 ? AppConstants.dayOfTheWeek : ' '} />
          <Form.Item
            name={`dayRefId${index}`}
            rules={[
              {
                required: true,
                message: ValidationConstants.dayField,
              },
            ]}
          >
            <Select
              id={AppUniqueId.timeRotation_matchDuration_Day_of_the_week_drpdn}
              style={{ width: '80%' }}
              disabled={disabledStatus}
              onChange={dayOfTheWeek =>
                this.props.UpdateTimeSlotsData(
                  dayOfTheWeek,
                  'dayRefId',
                  'competitionVenueTimeslotsDayTime',
                  index,
                  null,
                  null,
                )
              }
              placeholder="Select Week Day"
            >
              {daysList.weekDays.map(item => (
                <Option key={'weekDay_' + item.id} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className="col-sm">
          <InputWithHead heading={index == 0 ? AppConstants.startTime : ' '} />
          <TimePicker
            id={AppUniqueId.timeRotation_matchDuration_StartTime_drpdn}
            key="startTime"
            disabled={disabledStatus}
            className="comp-venue-time-timepicker"
            style={{ width: '80%' }}
            format="HH:mm"
            defaultValue={moment()}
            value={item.startTime != null && moment(item.startTime, 'HH:mm')}
            onChange={time => this.onTimeChange(time, index, 'startTime')}
            onBlur={e =>
              this.onTimeChange(
                e.target.value && moment(e.target.value, 'HH:mm'),
                index,
                'startTime',
              )
            }
            // disabledDate={d => !d || d.isAfter(closeDate)
            // minuteStep={15}
          />
        </div>
        <div className="col-sm">
          <InputWithHead heading={index == 0 ? AppConstants.endTime : ' '} />
          <TimePicker
            disabled={disabledStatus}
            id={AppUniqueId.timeRotation_matchDuration_EndTime_drpdn}
            key="endTime"
            className="comp-venue-time-timepicker"
            style={{ width: '80%' }}
            format="HH:mm"
            value={item.endTime != null && moment(item.endTime, 'HH:mm')}
            onChange={time => this.onTimeChange(time, index, 'endTime')}
            onBlur={e =>
              this.onTimeChange(e.target.value && moment(e.target.value, 'HH:mm'), index, 'endTime')
            }
            // minuteStep={15}
            // disabledHours={() => this.getDisabledHours(item.startTime)}
          />
        </div>
        {this.isMatchDurationTimeSlotByDivisionGrade() ? (
          <div className="col-sm">{this.renderDivisionGradeDropdown(item, index)}</div>
        ) : null}
        {data.length > 1 && (
          <div className="col-sm-2 delete-image-view pb-4">
            <div className="transfer-image-view pt-0 pointer ml-auto">
              <span
                className="user-remove-btn"
                onClick={() =>
                  disabledStatus == false &&
                  this.addTimeManualPerVenue(index, item, 'competitionVenueTimeslotsDayTimedelete')
                }
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span
                id={AppUniqueId.timeslotGenerationRemove_btn}
                className="user-remove-text mr-0 mb-1"
              >
                {AppConstants.remove}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderDivisionGradeDropdown = (item, index) => {
    const {
      getcompetitionTimeSlotData,

      mainDivisionList,
      mainGradeList,
    } = this.props.competitionTimeSlots;
    let { divisions = [], grades = [] } = getcompetitionTimeSlotData;
    let timeSlotData = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let disabledStatus = this.state.competitionStatus == 1;
    let mainTimeRotationID = timeSlotData.mainTimeRotationID;
    let timeslotRotationRefId = timeSlotData.timeslotRotationRefId;
    let values = item.competitionTimeslotsEntity?.map(entity => entity.venuePreferenceEntityId);

    switch (timeSlotData.timeslotRotationRefId) {
      case TIMESLOTS_ROTATION_SUB.ALLOCATE_DIVISIONS:
        return (
          <>
            <InputWithHead heading={index == 0 ? AppConstants.divisions : ' '} />
            <Form.Item
              name={`division_grade_${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.divisionField,
                },
              ]}
            >
              <Select
                disabled={disabledStatus}
                mode="multiple"
                placeholder="Select"
                filterOption={false}
                className="d-grid align-content-center"
                onBlur={() => this.props.ClearDivisionArr('divisions')}
                value={values}
                onChange={vals =>
                  this.onMatchDurationReferenceChanged(
                    'divisions',
                    vals,
                    index,
                    mainTimeRotationID,
                    timeslotRotationRefId,
                  )
                }
                onSearch={value => this.handleSearch(value, mainDivisionList)}
              >
                {divisions.map(item => (
                  <Option
                    key={`compMemProdDiv_${item.competitionMembershipProductDivision}`}
                    value={item.competitionMembershipProductDivision}
                  >
                    {item.divisionName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case TIMESLOTS_ROTATION_SUB.ALLOCATE_GRADES:
        return (
          <>
            <InputWithHead
              heading={index == 0 ? this.getTitle(AppConstants.pool, AppConstants.grades) : ' '}
            />
            <Form.Item
              name={`division_grade_${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.gradeField,
                },
              ]}
            >
              <Select
                disabled={disabledStatus}
                mode="multiple"
                placeholder="Select"
                className="d-grid align-content-center"
                filterOption={false}
                onBlur={() => this.props.ClearDivisionArr('grades')}
                value={values}
                onChange={vals =>
                  this.onMatchDurationReferenceChanged(
                    'grades',
                    vals,
                    index,
                    mainTimeRotationID,
                    timeslotRotationRefId,
                  )
                }
                onSearch={value => this.handleSearchGrades(value, mainGradeList)}
              >
                {grades.map(item => (
                  <Option
                    key={'compDivGrade_' + item.competitionDivisionGradeId}
                    value={item.competitionDivisionGradeId}
                  >
                    {item.gradeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      default:
        return <></>;
    }
  };

  onMatchDurationReferenceChanged(
    selectionDatasource,
    values,
    index,
    mainTimeRotationID,
    timeslotRotationRefId,
  ) {
    this.props.ClearDivisionArr(selectionDatasource);
    this.props.UpdateTimeSlotsMatchDurationReference(
      values,
      index,
      mainTimeRotationID,
      timeslotRotationRefId,
    );
  }

  // getDisabledHours = (time) => {
  //     let startTime = moment.duration(time)
  //     let hours = []
  //     if (startTime.hours()) {
  //         for (var i = 0; i < startTime.hours(); i++) {
  //             hours.push(i);
  //         }
  //     }
  //     return hours;
  // }

  dropdownView = () => {
    const { own_YearArr, own_CompetitionArr } = this.props.appState;
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3 pb-3">
              <div className="d-flex align-items-center w-ft">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  id={AppUniqueId.compYear_dpdnTimeslot}
                  name="yearRefId"
                  className="year-select reg-filter-select-year ml-2"
                  // style={{ width: 90 }}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={this.state.yearRefId}
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
              <div className="w-ft d-flex align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  id={AppUniqueId.competitionName_dpdnTimeslot}
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                  value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                >
                  {own_CompetitionArr.map(item => (
                    <Option key={`competition_${item.competitionId}`} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onChangeVenueRefId = value => {
    this.props.UpdateTimeSlotsData(value, 'applyToVenueRefId', null, null, null, null);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 300);
  };

  getCourtRotationId = (data, key) => {
    switch (key) {
      case 'timeSlotPref':
        switch (data) {
          case 7:
            return AppUniqueId.timeRotationPreferenceRadiobutton;
          case 8:
            return AppUniqueId.allocateSameTimeslotRadiobutton;
          default:
            break;
        }
        break;

      case 'subPref':
        switch (data) {
          case 1:
            return AppUniqueId.eventimeRotation_div;
          case 2:
            return AppUniqueId.eventimeRotation_grade;
          case 3:
            return AppUniqueId.eventimeRotation_team;
          case 4:
            return AppUniqueId.allocateSameTimeslotDivision;
          case 5:
            return AppUniqueId.allocateSameTimeslotGrade;
          default:
            break;
        }
        break;

      case 'timeSlotGenration':
        switch (data) {
          case 1:
            return AppUniqueId.timeRotation_matchDuration_RadioBtn;
          case 2:
            return AppUniqueId.manuallyAddTimeslot;
          default:
            break;
        }
        break;

      case 'manuallySubPref':
        switch (data) {
          case 1:
            return AppUniqueId.manuallyAddTimeslot_ApplyAllVenues;
          case 2:
            return AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  contentView = () => {
    let timeSlotData = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let commonState = this.props.competitionTimeSlots;
    let timeSlotManual =
      this.props.competitionTimeSlots.getcompetitionTimeSlotData.competitionTimeslotManual;
    let disabledStatus = this.state.competitionStatus == 1;
    let mainGradeList = commonState.mainGradeList;
    let { grades = [] } = timeSlotData;

    return (
      <div className="content-view pt-3">
        <span className="applicable-to-heading">{AppConstants.anyTimePreference}</span>
        <Form.Item
          name="mainTimeRotationID"
          rules={[{ required: true, message: 'Please select time slot preference' }]}
        >
          <Radio.Group
            className="reg-competition-radio"
            disabled={disabledStatus}
            onChange={e => {
              this.updateMainTimeRotation(e);
            }}
            value={timeSlotData.mainTimeRotationID}
          >
            {commonState.timeSlotRotation.map(item => (
              <div key={'mainTimeRotation_' + item.id}>
                <div className="contextualHelp-RowDirection">
                  <Radio id={this.getCourtRotationId(item.id, 'timeSlotPref')} value={item.id}>
                    {item.description}
                  </Radio>
                  <div className="mt-2 ml-n20">
                    <CustomTooltip>
                      <span>{item.helpMsg}</span>
                    </CustomTooltip>
                  </div>
                </div>
                {isArrayNotEmpty(item.subReferences) && (
                  <div>
                    {/* <Form.Item name='timeslotRotationRefId' rules={[{ required: false, message: "Please select time slot preference" }]}  > */}
                    <Radio.Group
                      disabled={disabledStatus}
                      className="reg-competition-radio pl-5"
                      onChange={e => {
                        this.updatetimeRotation(e);
                      }}
                      value={timeSlotData.timeslotRotationRefId}
                    >
                      {timeSlotData.mainTimeRotationID == item.id &&
                        item.subReferences.map(subArr => (
                          <Radio
                            id={this.getCourtRotationId(item.id, 'subPref')}
                            key={'timeslotRotation_' + subArr.id}
                            value={subArr.id}
                          >
                            {this.getReferenceTitle(subArr)}
                          </Radio>
                        ))}
                    </Radio.Group>
                    {/* </Form.Item> */}
                  </div>
                )}
              </div>
            ))}
          </Radio.Group>
        </Form.Item>
        <div>
          <Checkbox
            className="single-checkbox"
            checked={this.state.gradeSortOrderEnabled}
            disabled={disabledStatus}
            onClick={e => {
              this.setState({
                gradeSortOrderEnabled: e.target.checked,
              });
            }}
          >
            {AppConstants.gradeOrderForDraws}
          </Checkbox>
          {this.state.gradeSortOrderEnabled && (
            <div className="ant-row">
              <Select
                disabled={disabledStatus}
                mode="multiple"
                placeholder="Select Grades"
                className="col-md-6 mt-3"
                filterOption={false}
                onBlur={() => this.props.ClearDivisionArr('grades')}
                value={this.state.gradeSortOrders}
                onChange={vals => this.setState({ gradeSortOrders: vals })}
                onSearch={value => this.handleSearchGrades(value, mainGradeList)}
              >
                {grades.map(item => (
                  <Option
                    key={'compDivGrade_' + item.competitionDivisionGradeId}
                    value={item.competitionDivisionGradeId}
                  >
                    {item.gradeName}
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <div className="inside-container-view">
          <Form.Item
            name="timeslotGenerationRefId"
            rules={[{ required: true, message: ValidationConstants.timeSlotPreference }]}
          >
            <Radio.Group
              className="reg-competition-radio"
              disabled={disabledStatus}
              onChange={e => this.changeTimeSlotGeneration(e)}
              // value={timeSlotData.timeslotGenerationRefId}
            >
              {commonState.timeSlotGeneration.map((item, index) => (
                <div key={'timeslotGeneration_' + item.id}>
                  <div className="contextualHelp-RowDirection">
                    <Radio
                      id={this.getCourtRotationId(item.id, 'timeSlotGenration')}
                      value={item.id}
                    >
                      {item.description}
                    </Radio>
                    {/* <div className="ml-5" style={{ marginTop: -22 }}> */}
                    <div className="ml-n20 mt-2">
                      <CustomTooltip>
                        <span>{item.helpMsg}</span>
                      </CustomTooltip>
                    </div>
                  </div>
                  {timeSlotData.timeslotGenerationRefId === index + 1 &&
                    item.id == 1 &&
                    (timeSlotData.mainTimeRotationID === 8 ||
                      timeSlotData.mainTimeRotationID === 9 ||
                      timeSlotData.mainTimeRotationID === 6 ||
                      timeSlotData.mainTimeRotationID === 7) && (
                      <div>
                        <div className="fluid-width">
                          {timeSlotData.competitionVenueTimeslotsDayTime.map((item, index) =>
                            this.addDataTimeSlot(
                              item,
                              index,
                              timeSlotData.competitionVenueTimeslotsDayTime,
                            ),
                          )}
                        </div>
                        <span
                          id={AppUniqueId.timeRotation_matchDuration_Add_anotherday_Btn}
                          className="input-heading-add-another font-15 mb-3"
                          onClick={() =>
                            disabledStatus == false &&
                            this.addAnotherTimeSlot(null, null, 'competitionVenueTimeslotsDayTime')
                          }
                        >
                          {' '}
                          + {AppConstants.addAnotherDay}
                        </span>
                      </div>
                    )}
                  {timeSlotData.mainTimeRotationID === 8 &&
                    item.id == 1 &&
                    timeSlotData.timeslotGenerationRefId === index + 1 && (
                      <div>
                        {/* <div className="fluid-width">
                            {timeSlotData.timeslotRotationRefId == 4 && (
                            <span
                              id={
                                AppUniqueId.timeRotation_matchDuration_AdddivisionTimeslotOrderTextField
                              }
                              className="applicable-to-heading"
                            >
                              {AppConstants.divisionsTimeSlot}
                            </span>
                          )}
                          {timeSlotData.timeslotRotationRefId == 4 &&
                            timeSlotData.competitionTimeslotsEntity.map((item, index) =>
                              this.addTimeSlotDivision(
                                item,
                                index,
                                timeSlotData.mainTimeRotationID,
                                timeSlotData.timeslotRotationRefId,
                                timeSlotData.competitionTimeslotsEntity,
                              ),
                            )}
                          {timeSlotData.timeslotRotationRefId == 5 && (
                            <span className="applicable-to-heading">
                              {this.getTitle(
                                AppConstants.poolsTimeSlot,
                                AppConstants.gradesTimeSlot,
                              )}
                            </span>
                          )}
                          {timeSlotData.timeslotRotationRefId == 5 &&
                            timeSlotData.competitionTimeslotsEntity.map((item, index) =>
                              this.addTimeSlotGrades(
                                item,
                                index,
                                timeSlotData.mainTimeRotationID,
                                timeSlotData.timeslotRotationRefId,
                                timeSlotData.competitionTimeslotsEntity,
                              ),
                            )}
                        </div> */}

                        <span
                          id={AppUniqueId.timeRotation_matchDuration_AddAnotherTimeslot_Btn}
                          className="input-heading-add-another font-15"
                          onClick={() =>
                            disabledStatus == false &&
                            this.addDivisionOrGrade(null, null, 'competitionTimeslotsEntity')
                          }
                        >
                          + {AppConstants.addDivOrGrade}
                        </span>
                      </div>
                    )}
                </div>
              ))}
              {timeSlotData.timeslotGenerationRefId === 2 && (
                <div className="ml-5">
                  <Form.Item
                    name="applyToVenueRefId"
                    rules={[{ required: true, message: ValidationConstants.venueField }]}
                  >
                    <Radio.Group
                      className="reg-competition-radio"
                      disabled={disabledStatus}
                      onChange={e => this.onChangeVenueRefId(e.target.value)}
                      value={timeSlotData.applyToVenueRefId}
                    >
                      {commonState.applyVenue.map(item => (
                        <Radio
                          id={this.getCourtRotationId(item.id, 'manuallySubPref')}
                          key={'applyVenue_' + item.id}
                          value={item.id}
                        >
                          {item.description}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </div>
              )}
            </Radio.Group>
          </Form.Item>

          {timeSlotData.timeslotGenerationRefId === 2 &&
            timeSlotData.applyToVenueRefId == 1 &&
            (timeSlotData.mainTimeRotationID === 8 ||
              timeSlotData.mainTimeRotationID === 9 ||
              timeSlotData.mainTimeRotationID === 6 ||
              timeSlotData.mainTimeRotationID === 7) && (
              <div>
                <div className="fluid-width">
                  {timeSlotManual.length > 0 &&
                    timeSlotManual[0].timeslots.map((item, index) =>
                      this.addDataTimeSlotManual(
                        item,
                        index,
                        timeSlotData.timeslotRotationRefId,
                        timeSlotData.mainTimeRotationID,
                        timeSlotManual[0].timeslots,
                      ),
                    )}
                </div>
                <span
                  className="input-heading-add-another"
                  onClick={() =>
                    disabledStatus == false &&
                    this.addTimeManualPerVenue(null, null, 'competitionTimeslotManual')
                  }
                >
                  {' '}
                  +{AppConstants.addAnotherDay}
                </span>
              </div>
            )}
          {timeSlotData.timeslotGenerationRefId === 2 &&
            timeSlotData.applyToVenueRefId == 2 &&
            (timeSlotData.mainTimeRotationID === 8 ||
              timeSlotData.mainTimeRotationID === 9 ||
              timeSlotData.mainTimeRotationID === 6 ||
              timeSlotData.mainTimeRotationID === 7) && (
              <div>
                <div>
                  <div className="fluid-width">
                    {(commonState.timeSlotManualAllVenue || []).map((item, venueIndex) => (
                      <div key={item.venueName}>
                        <span className="applicable-to-heading mt-3">{item.venueName}</span>
                        {item.timeslots.map((slotsItem, slotIndex) =>
                          this.addDataTimeSlotManualPerVenues(
                            slotsItem,
                            venueIndex,
                            slotIndex,
                            timeSlotData.timeslotRotationRefId,
                            timeSlotData.mainTimeRotationID,
                            item.timeslots,
                          ),
                        )}
                        <span
                          id={
                            AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues_AddAnotherDayBtn
                          }
                          className="input-heading-add-another pointer"
                          onClick={() =>
                            disabledStatus == false &&
                            this.addTimeManualAllVenue(
                              venueIndex,
                              item,
                              'competitionTimeslotManualAllVenue',
                            )
                          }
                        >
                          {' '}
                          + {AppConstants.addAnotherDay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          {/* {!this.state.isQuickCompetition &&
            isTeamPreferencesEnable &&
            this.state.isManuallySelected &&
            this.footerViewSettings()} */}
        </div>
      </div>
    );
  };

  onVenueTimeChange = (time, index, timeIndex, venueIndex, field) => {
    if (time !== null && time !== undefined) {
      this.props.UpdateTimeSlotsDataManual(
        time.format('HH:mm'),
        field,
        'competitionTimeslotManualperVenueTime',
        timeIndex,
        null,
        index,
        venueIndex,
      );
    }
  };

  getReferenceTitle = ItemArr => {
    if (ItemArr.name == 'EVEN_GRADES' && this.state.finalTypeRefId == 2) {
      return AppConstants.pools;
    } else if (ItemArr.name == 'ALLOCATE_GRADES' && this.state.finalTypeRefId == 2) {
      return AppConstants.pools;
    } else {
      return ItemArr.description;
    }
  };

  addDataTimeSlotManualPerVenues(item, venueIndex, index, id, mainId, data) {
    let daysList = this.props.competitionTimeSlots;
    let division = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let disabledStatus = this.state.competitionStatus == 1;
    let mainGradeList = this.props.competitionTimeSlots.mainGradeList;
    let mainDivisionList = this.props.competitionTimeSlots.mainDivisionList;

    return (
      <div key={venueIndex + '' + index}>
        <div className="row">
          <div className="col-sm-3">
            <InputWithHead heading={index == 0 ? AppConstants.dayOfTheWeek : ' '} />
            <Form.Item
              name={`dayRefIdAllVenue${venueIndex}${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.dayField,
                },
              ]}
            >
              <Select
                disabled={disabledStatus}
                id={
                  AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues_Day_of_the_week_drpdn
                }
                style={{ width: '70%', minWidth: 100 }}
                onChange={dayOfTheWeek =>
                  this.props.UpdateTimeSlotsDataManual(
                    dayOfTheWeek,
                    'dayRefId',
                    'competitionTimeslotManualAllvenue',
                    index,
                    null,
                    null,
                    venueIndex,
                  )
                }
                // value={item.dayRefId}
                placeholder="Select Week Day"
              >
                {daysList.weekDays.map(item => (
                  <Option key={`weekDay_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-sm">
            {item.startTime.map((timeItem, timeIndex) => (
              <div key={timeIndex} className="row">
                <div className="col-sm">
                  <InputWithHead
                    heading={index == 0 && timeIndex == 0 ? AppConstants.startTime : ' '}
                  />
                  <TimePicker
                    disabled={disabledStatus}
                    id={AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues_startTime}
                    key="startTime"
                    style={{ minWidth: 100 }}
                    className="comp-venue-time-timepicker"
                    onChange={time =>
                      this.onVenueTimeChange(time, index, timeIndex, venueIndex, 'startTime')
                    }
                    onBlur={e =>
                      this.onVenueTimeChange(
                        e.target.value && moment(e.target.value, 'HH:mm'),
                        index,
                        timeIndex,
                        venueIndex,
                        'startTime',
                      )
                    }
                    value={timeItem.startTime != null && moment(timeItem.startTime, 'HH:mm')}
                    format="HH:mm"
                    // minuteStep={15}
                  />
                  {item.startTime.length > 1 && (
                    <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
                      <img
                        className="dot-image"
                        src={AppImages.redCross}
                        alt=""
                        width="16"
                        height="16"
                        onClick={() =>
                          disabledStatus == false &&
                          this.addTimeManualPerVenue(
                            timeIndex,
                            venueIndex,
                            'removeTimeSlotManualPerVenue',
                            index,
                          )
                        }
                      />
                    </span>
                  )}
                </div>

                {mainId == 8 && (
                  <div className="col-sm">
                    <InputWithHead
                      heading={
                        index == 0 && timeIndex == 0
                          ? id == 4
                            ? AppConstants.divisions
                            : this.getTitle(AppConstants.pools, AppConstants.grades)
                          : ' '
                      }
                    />

                    {id == 4 && (
                      <Form.Item
                        name={`perDivisionkey${venueIndex}${index}${timeIndex}`}
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.divisionField,
                          },
                        ]}
                      >
                        <Select
                          disabled={disabledStatus}
                          id={
                            AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues_Divisions
                          }
                          mode="multiple"
                          placeholder="Select"
                          filterOption={false}
                          className="d-grid align-content-center"
                          onBlur={() => this.props.ClearDivisionArr('divisions')}
                          onChange={divisions =>
                            this.onSelectDivisionsMatchDurationManual(
                              divisions,
                              'venuePreferenceTypeRefId',
                              'competitionTimeslotManualAllvenue',
                              timeIndex,
                              id,
                              index,
                              venueIndex,
                            )
                          }
                          onSearch={value => this.handleSearch(value, mainDivisionList)}
                        >
                          {division.divisions &&
                            division.divisions.map(item => (
                              <Option
                                key={`compMemProdDiv_${item.competitionMembershipProductDivision}`}
                                value={item.competitionMembershipProductDivision}
                              >
                                {item.divisionName}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    )}
                    {id == 5 && (
                      <Form.Item
                        name={`perGradeKey${venueIndex}${index}${timeIndex}`}
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.gradeField,
                          },
                        ]}
                      >
                        <Select
                          disabled={disabledStatus}
                          mode="multiple"
                          placeholder="Select"
                          filterOption={false}
                          className="d-grid align-content-center"
                          onBlur={() => this.props.ClearDivisionArr('grades')}
                          onChange={divisions =>
                            this.onSelectGradesMatchDurationManual(
                              divisions,
                              'venuePreferenceTypeRefId',
                              'competitionTimeslotManualAllvenue',
                              timeIndex,
                              id,
                              index,
                              venueIndex,
                            )
                          }
                          onSearch={value => this.handleSearchGrades(value, mainGradeList)}
                        >
                          {division.grades &&
                            division.grades.map(item => (
                              <Option
                                key={`compDivGrade_${item.competitionDivisionGradeId}`}
                                value={item.competitionDivisionGradeId}
                              >
                                {item.gradeName}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    )}
                  </div>
                )}
              </div>
            ))}
            <span
              id={AppUniqueId.manuallyAddTimeslot_ApplySettingsIndividualVenues_AddTimeSlotBtn}
              className="input-heading-add-another"
              onClick={() =>
                disabledStatus == false &&
                this.addTimeManualPerVenue(index, null, 'addTimeSlotManualperVenue', venueIndex)
              }
            >
              {' '}
              + {AppConstants.add_TimeSlot}
            </span>
          </div>
          {data.length > 1 && (
            <div className="col-sm-2 delete-image-timeSlot-view">
              <div className="transfer-image-view pt-0 pointer ml-auto">
                <span
                  className="user-remove-btn"
                  onClick={() =>
                    disabledStatus == false &&
                    this.addTimeManualPerVenue(
                      index,
                      venueIndex,
                      'competitionTimeslotManualAllVenuedelete',
                    )
                  }
                >
                  <i className="fa fa-trash-o" aria-hidden="true" />
                </span>
                <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  onSelectDivision(divisions, key, mainKey, index, mainId, id) {
    this.props.ClearDivisionArr('divisions');

    this.props.UpdateTimeSlotsData(divisions, key, mainKey, index, mainId, id);
  }

  onSelectGrades(grades, key, mainKey, index, mainId, id) {
    this.props.ClearDivisionArr('grades');
    this.props.UpdateTimeSlotsData(grades, key, mainKey, index, mainId, id);
  }

  handleSearch = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.divisionName.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchDivisionList(filteredData, 'divisions');
  };

  handleSearchGrades = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.gradeName.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchDivisionList(filteredData, 'grades');
  };

  onSelectDivisionMatchDuration(divisions, key, mainKey, timeIndex, mainId, id, index) {
    this.props.ClearDivisionArr('divisions');
    this.props.UpdateTimeSlotsDataManual(divisions, key, mainKey, timeIndex, mainId, id, index);
  }

  onSelectGradesMatchDuration(divisions, key, mainKey, timeIndex, mainId, id, index) {
    this.props.ClearDivisionArr('grades');
    this.props.UpdateTimeSlotsDataManual(divisions, key, mainKey, timeIndex, mainId, id, index);
  }

  onSelectGradesMatchDurationManual(divisions, key, mainKey, timeIndex, id, index, venueIndex) {
    this.props.ClearDivisionArr('grades');
    this.props.UpdateTimeSlotsDataManual(divisions, key, mainKey, timeIndex, id, index, venueIndex);
  }

  onSelectDivisionsMatchDurationManual(divisions, key, mainKey, timeIndex, id, index, venueIndex) {
    this.props.ClearDivisionArr('divisions');
    this.props.UpdateTimeSlotsDataManual(divisions, key, mainKey, timeIndex, id, index, venueIndex);
  }

  // add data on click of division
  addTimeSlotDivision(item, index, mainId, id, data) {
    let division = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let mainDivisionList = this.props.competitionTimeSlots.mainDivisionList;
    // let timeSlotEntityKey = this.props.competitionTimeSlots
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <div className="d-flex">
        <Form.Item
          name={`timeSlotEntityManualkeyArr${index}`}
          rules={[
            {
              required: true,
              message: ValidationConstants.divisionField,
            },
          ]}
        >
          <Select
            mode="multiple"
            disabled={disabledStatus}
            id={AppUniqueId.timeRotation_matchDuration_AdddivisionTimeslotOrderTextField}
            placeholder="Select"
            className="w-100"
            style={{ minWidth: 120, maxWidth: 180 }}
            filterOption={false}
            onBlur={() => this.props.ClearDivisionArr('divisions')}
            onSearch={value => {
              this.handleSearch(value, mainDivisionList);
            }}
            onChange={divisions =>
              this.onSelectDivision(
                divisions,
                'venuePreferenceEntityId',
                'competitionTimeslotsEntity',
                index,
                mainId,
                id,
              )
            }
          >
            {division.divisions &&
              division.divisions.map(item => (
                <Option
                  key={`compMemProdDiv_${item.competitionMembershipProductDivision}`}
                  value={item.competitionMembershipProductDivision}
                >
                  {item.divisionName}
                </Option>
              ))}
          </Select>
        </Form.Item>
        {data.length > 1 && (
          <div className="col-sm-2 delete-image-timeSlot-view pt-3">
            <div className="transfer-image-view pt-0 pointer ml-auto">
              <span
                className="user-remove-btn"
                onClick={() =>
                  disabledStatus == false &&
                  this.addTimeManualPerVenue(index, item, 'competitionTimeslotsEntitydelete')
                }
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  addTimeManualPerVenue = (index, item, keyword, parentIndex) => {
    this.props.addRemoveTimeSlot(index, item, keyword, parentIndex);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 300);
  };

  addTimeManualAllVenue = (index, item, keyword) => {
    this.props.addRemoveTimeSlot(index, item, keyword);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 300);
  };

  addDivisionOrGrade = (index, item, keyword) => {
    this.props.addRemoveTimeSlot(index, item, keyword);
  };

  addTimeSlotGrades(item, index, mainId, id, data) {
    let grades = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    // let timeSlotEntityKey = this.props.competitionTimeSlots
    let disabledStatus = this.state.competitionStatus == 1;
    let mainGradeList = this.props.competitionTimeSlots.mainGradeList;

    return (
      <div className="d-flex">
        <Form.Item
          name={`timeSlotEntityGradeKeyArr${index}`}
          rules={[
            {
              required: true,
              message: ValidationConstants.gradeField,
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select"
            disabled={disabledStatus}
            className="w-100"
            style={{ minWidth: 120, maxWidth: 180 }}
            filterOption={false}
            onBlur={() => this.props.ClearDivisionArr('grades')}
            onChange={grades =>
              this.onSelectGrades(
                grades,
                'venuePreferenceEntityId',
                'competitionTimeslotsEntity',
                index,
                mainId,
                id,
              )
            }
            onSearch={value => this.handleSearchGrades(value, mainGradeList)}
          >
            {grades.grades &&
              grades.grades.map(item => (
                <Option
                  key={`compDivGrade_${item.competitionDivisionGradeId}`}
                  value={item.competitionDivisionGradeId}
                >
                  {item.gradeName}
                </Option>
              ))}
          </Select>
        </Form.Item>
        {data.length > 1 && (
          <div className="col-sm-2 delete-image-timeSlot-view pt-2">
            <div className="transfer-image-view pt-0 pointer ml-auto">
              <span
                className="user-remove-btn"
                onClick={() =>
                  disabledStatus == false &&
                  this.addTimeManualPerVenue(index, item, 'competitionTimeslotsEntitydelete')
                }
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  changeTime(time, key, index) {
    let setTime = time.format('HH:mm');
    this.props.UpdateTimeSlotsData(
      setTime,
      key,
      'competitionVenueTimeslotsDayTime',
      index,
      null,
      null,
    );
  }

  onCompVenueTimeChange = (time, index, timeIndex, field) => {
    if (time !== null && time !== undefined) {
      this.props.UpdateTimeSlotsDataManual(
        time.format('HH:mm'),
        field,
        'competitionTimeslotManualTime',
        timeIndex,
        null,
        index,
      );
    }
  };

  // add time slot data on individual Venues
  addDataTimeSlotManual(item, index, id, mainId, data) {
    let daysList = this.props.competitionTimeSlots;
    let division = this.props.competitionTimeSlots.getcompetitionTimeSlotData;
    let disabledStatus = this.state.competitionStatus == 1;
    let mainGradeList = this.props.competitionTimeSlots.mainGradeList;
    let mainDivisionList = this.props.competitionTimeSlots.mainDivisionList;

    return (
      <div className="row" key={`addSlot${index}`}>
        <div className="col-sm-3" style={{ marginTop: index == 0 ? null : 18 }}>
          <InputWithHead heading={index == 0 ? AppConstants.dayOfTheWeek : ' '} />
          <Form.Item
            name={`dayRefIdManual${index}`}
            rules={[
              {
                required: true,
                message: ValidationConstants.dayField,
              },
            ]}
          >
            <Select
              id={AppUniqueId.dayRefIdAllVenue}
              style={{ width: '70%', minWidth: 100 }}
              onChange={dayOfTheWeek =>
                this.props.UpdateTimeSlotsDataManual(
                  dayOfTheWeek,
                  'dayRefId',
                  'competitionTimeslotManual',
                  index,
                  null,
                  null,
                )
              }
              placeholder="Select Week Day"
              disabled={disabledStatus}
            >
              {daysList.weekDays.map(item => (
                <Option key={`weekDay_${item.id}`} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className="col-sm">
          {item.startTime.map((timeItem, timeIndex) => (
            <div className="row" key={'timeSlotindex' + timeIndex}>
              {/* <div className="col-sm"> */}
              {/* <div className={"col-sm"}> */}
              <div className="col-sm">
                <InputWithHead heading={timeIndex == 0 ? AppConstants.startTime : ' '} />
                <TimePicker
                  key="startTime"
                  disabled={disabledStatus}
                  style={{ minWidth: 100 }}
                  className="comp-venue-time-timepicker"
                  onChange={time => this.onCompVenueTimeChange(time, index, timeIndex, 'startTime')}
                  onBlur={e =>
                    this.onCompVenueTimeChange(
                      e.target.value && moment(e.target.value, 'HH:mm'),
                      index,
                      timeIndex,
                      'startTime',
                    )
                  }
                  value={timeItem.startTime != null && moment(timeItem.startTime, 'HH:mm')}
                  format="HH:mm"
                  // minuteStep={15}
                />
                {item.startTime.length > 1 && (
                  <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
                    <img
                      className="dot-image"
                      src={AppImages.redCross}
                      alt=""
                      width="16"
                      height="16"
                      onClick={() =>
                        disabledStatus == false &&
                        this.addTimeManualPerVenue(timeIndex, null, 'removeTimeSlotManual', index)
                      }
                    />
                  </span>
                )}
              </div>
              {mainId == 8 && (
                <div className="col-sm">
                  <InputWithHead
                    heading={
                      timeIndex == 0
                        ? id == 4
                          ? AppConstants.divisions
                          : this.getTitle(AppConstants.pools, AppConstants.grades)
                        : ' '
                    }
                  />
                  {id == 4 && (
                    <Form.Item
                      name={`timeSlotEntityManualkey${index}${timeIndex}`}
                      rules={[
                        {
                          required: true,
                          message: ValidationConstants.divisionField,
                        },
                      ]}
                    >
                      <Select
                        disabled={disabledStatus}
                        mode="multiple"
                        placeholder="Select"
                        filterOption={false}
                        className="d-grid align-content-center"
                        onBlur={() => this.props.ClearDivisionArr('divisions')}
                        onChange={divisions =>
                          this.onSelectDivisionMatchDuration(
                            divisions,
                            'venuePreferenceTypeRefId',
                            'competitionTimeslotManual',
                            timeIndex,
                            mainId,
                            id,
                            index,
                          )
                        }
                        onSearch={value => this.handleSearch(value, mainDivisionList)}
                      >
                        {id == 4 &&
                          division.divisions &&
                          division.divisions.map(item => (
                            <Option
                              key={`compMemProdDiv_${item.competitionMembershipProductDivision}`}
                              value={item.competitionMembershipProductDivision}
                            >
                              {item.divisionName}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  )}
                  {id == 5 && (
                    <Form.Item
                      name={`timeSlotEntityGradeKey${index}${timeIndex}`}
                      rules={[
                        {
                          required: true,
                          message: ValidationConstants.gradeField,
                        },
                      ]}
                    >
                      <Select
                        disabled={disabledStatus}
                        mode="multiple"
                        placeholder="Select"
                        className="d-grid align-content-center"
                        filterOption={false}
                        onBlur={() => this.props.ClearDivisionArr('grades')}
                        onChange={divisions =>
                          this.onSelectGradesMatchDuration(
                            divisions,
                            'venuePreferenceTypeRefId',
                            'competitionTimeslotManual',
                            timeIndex,
                            mainId,
                            id,
                            index,
                          )
                        }
                        onSearch={value => this.handleSearchGrades(value, mainGradeList)}
                      >
                        {division.grades &&
                          division.grades.map(item => (
                            <Option
                              key={'compDivGrade_' + item.competitionDivisionGradeId}
                              value={item.competitionDivisionGradeId}
                            >
                              {item.gradeName}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  )}
                </div>
              )}
            </div>
          ))}
          <span
            className="input-heading-add-another"
            onClick={() =>
              disabledStatus == false &&
              this.addTimeManualPerVenue(index, null, 'addTimeSlotManual')
            }
          >
            {' '}
            + {AppConstants.add_TimeSlot}
          </span>
        </div>
        {data.length > 1 && (
          <div className="col-sm-2 delete-image-timeSlot-view">
            <div className="transfer-image-view pt-0 pointer ml-auto">
              <span
                className="user-remove-btn"
                onClick={() =>
                  disabledStatus == false &&
                  this.addTimeManualPerVenue(index, item, 'competitionTimeslotManualdelete')
                }
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  qcWarningView = () => (
    <div className="content-view pt-3">
      <div className="comp-warning-info">{AppConstants.qcTimeslotNotApplicable}</div>
    </div>
  );

  // footer view containing all the buttons like submit and cancel
  footerView = () => {
    const isPublished = this.state.competitionStatus == 1;
    return (
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <NavLink to="/competitionPartTeamGradeCalculate">
                <Button disabled={isPublished} className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.back}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              {/* <NavLink to="/competitionVenueTimesPrioritisation"> */}
              <Button
                // id={AppUniqueId.timeSlotSaveBtn}
                style={{
                  height: isPublished && '100%',
                  borderRadius: isPublished && 6,
                  width: isPublished && 'inherit',
                }}
                className="publish-button save-draft-text"
                htmlType="submit"
                type="primary"
                // onClick={this.handleSavePreferences}
              >
                {AppConstants.save}
              </Button>
              <Button
                onClick={() => this.setState({ nextButtonClicked: true })}
                htmlType="submit"
                disabled={isPublished}
                className="publish-button margin-top-disabled-button"
                type="primary"
              >
                {AppConstants.next}
              </Button>
              {/* </NavLink> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // footer view containing all the buttons like submit and cancel
  // footerViewSettings = () => {
  //   const isPublished = this.state.competitionStatus == 1;
  //   return (
  //     <div className="d-flex justify-content-end">
  //       <Tooltip
  //         className="h-100"
  //         onMouseEnter={() => {
  //           this.setState({
  //             tooltipVisibleDelete: isPublished,
  //           });
  //         }}
  //         onMouseLeave={() => {
  //           this.setState({ tooltipVisibleDelete: false });
  //         }}
  //         visible={this.state.tooltipVisibleDelete}
  //         title={AppConstants.statusPublishHover}
  //       >
  //         <Button
  //           id={AppUniqueId.timeSlotSaveBtn}
  //           disabled={isPublished}
  //           style={{
  //             height: isPublished && '100%',
  //             borderRadius: isPublished && 6,
  //             width: isPublished && 'inherit',
  //           }}
  //           className="publish-button save-draft-text"
  //           htmlType="submit"
  //           type="primary"
  //         >
  //           {AppConstants.save}
  //         </Button>
  //       </Tooltip>
  //     </div>
  //   );
  // };

  // teamPreferencesView() {
  //   const { timeslotsList, weekDays } = this.props.competitionTimeSlots;
  //   const { teams, preferenceFormValues } = this.state;

  //   // const { getFieldDecorator } = this.formPreferenceRef.current;

  //   return (
  //     <div className="formView mt-4">
  //       <div className="content-view pt-3">
  //         <div className="team-preferences-header my-4">{AppConstants.teamPreferences}</div>

  //         <Form.List name="preferences">
  //           {(timePreferences, { add, remove }) => (
  //             <>
  //               {timePreferences.map((field, fieldIdx) => (
  //                 <Space
  //                   key={field.key}
  //                   style={{ marginBottom: 25 }}
  //                   className="d-flex align-items-center w-100 preference-form-line"
  //                 >
  //                   <Form.Item
  //                     {...field}
  //                     name={[field.name, 'teamId']}
  //                     fieldKey={[field.fieldKey, 'teamId']}
  //                     rules={[{ required: true, message: ValidationConstants.teamName }]}
  //                   >
  //                     <Select placeholder="Select">
  //                       {(teams || []).map(team => (
  //                         <Option
  //                           key={team.id}
  //                           value={team.id}
  //                           disabled={preferenceFormValues?.preferences.some(
  //                             (preference, idx) =>
  //                               preference?.teamId === team.id && idx !== fieldIdx,
  //                           )}
  //                         >
  //                           {`${team.name} (${team.divisionName} - ${team.gradeName})`}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                   <Form.Item
  //                     {...field}
  //                     name={[field.name, 'competitionTimeslotsIds']}
  //                     fieldKey={[field.fieldKey, 'competitionTimeslotsIds']}
  //                     rules={[{ required: true, message: ValidationConstants.timeSlotPreference }]}
  //                   >
  //                     <Select
  //                       mode="multiple"
  //                       placeholder="Select"
  //                       filterOption={false}
  //                       className="d-grid align-content-center"
  //                     >
  //                       {!!weekDays.length &&
  //                         (timeslotsList || []).map(timeslot => (
  //                           <Option key={timeslot.id} value={timeslot.id}>
  //                             {`${
  //                               weekDays.find(day => day.id === timeslot.dayRefId).description
  //                             } - ${timeslot.startTime}`}
  //                           </Option>
  //                         ))}
  //                     </Select>
  //                   </Form.Item>

  //                   <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
  //                     <img
  //                       className="dot-image"
  //                       src={AppImages.redCross}
  //                       alt=""
  //                       width="16"
  //                       height="16"
  //                       onClick={() => remove(field.name)}
  //                     />
  //                   </span>
  //                 </Space>
  //               ))}
  //               <Form.Item>
  //                 <span className="input-heading-add-another" onClick={() => add()}>
  //                   +{AppConstants.addTeam}
  //                 </span>
  //               </Form.Item>
  //             </>
  //           )}
  //         </Form.List>
  //       </div>
  //     </div>
  //   );
  // }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu menu="competition" compSelectedKey="6" />
        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAPIsActionCall}
            onFinishFailed={({ errorFields }) =>
              this.formRef.current.scrollToField(errorFields[0].name)
            }
            noValidate="noValidate"
          >
            {this.headerView()}
            <Content>
              {this.dropdownView()}
              <Loader
                visible={
                  this.props.competitionTimeSlots.onGetTimeSlotLoad ||
                  this.props.competitionTimeSlots.onLoad
                }
              />
              <div className="formView">
                {!this.state.isQuickCompetition ? this.contentView() : this.qcWarningView()}
              </div>
            </Content>
            <Footer>{!this.state.isQuickCompetition && this.footerView()}</Footer>
          </Form>
          {/* {!this.state.isQuickCompetition &&
            isTeamPreferencesEnable &&
            this.state.isManuallySelected &&
            !this.state.getDataLoading &&
            this.state.preferenceFormValues && (
              <Form
                ref={this.formPreferenceRef}
                autoComplete="off"
                noValidate="noValidate"
                onFinish={this.handleSavePreferences}
                onFinishFailed={({ errorFields }) =>
                  this.formPreferenceRef.current.scrollToField(errorFields[0].name)
                }
                initialValues={{ ...this.state.preferenceFormValues }}
                onValuesChange={(_, allValues) =>
                  this.setState({ preferenceFormValues: allValues })
                }
              >
                <Content>{this.teamPreferencesView()}</Content>
                <Footer>{!this.state.isQuickCompetition && this.footerView()}</Footer>
              </Form>
            )} */}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getYearAndCompetitionOwnAction,
      getCompetitionWithTimeSlots,
      addRemoveTimeSlot,
      UpdateTimeSlotsData,
      timeSlotInit,
      UpdateTimeSlotsDataManual,
      getVenuesTypeAction,
      addTimeSlotDataPost,
      clearYearCompetitionAction,
      searchDivisionList,
      ClearDivisionArr,
      getCompetitionTeams,
      //getCompetitionTimeslots,
      //getTeamTimeslotsPreferences,
      //saveTeamTimeslotsPreferences,
      UpdateTimeSlotsMatchDurationReference,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    competitionTimeSlots: state.CompetitionTimeSlots,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionCourtAndTimesAssign);

import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button, Form, message } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { NavLink } from 'react-router-dom';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import { getDayName, getTime } from '../../themes/dateformate';
import SwappableComponentEdit from '../../customComponents/SwappableComponentEdit.jsx';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import { getYearAndCompetitionOwnAction, getVenuesTypeAction } from '../../store/actions/appAction';
import {
  getCompetitionDrawsAction,
  getDrawsRoundsAction,
  updateCompetitionDraws,
  saveDraws,
  getCompetitionVenue,
  clearDraws,
  publishDraws,
} from '../../store/actions/competitionModuleAction/competitionDrawsAction';
import Loader from '../../customComponents/loader';
import {
  setGlobalYear,
  setOwn_competition,
  getOwn_competition,
  setDraws_venue,
  getDraws_venue,
  setDraws_round,
  getDraws_round,
  setDraws_roundTime,
  getDraws_roundTime,
  setDraws_division_grade,
  getDraws_division_grade,
  getOrganisationData,
  getGlobalYear,
} from '../../util/sessionStorage';
import moment from 'moment';
import ValidationConstants from '../../themes/validationConstant';
import LegendComponent from '../../customComponents/legendComponent';
import { isArrayNotEmpty } from '../../util/helpers';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class CompetitionDrawEditOld extends Component {
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
      updateLoad: false,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
    };
  }

  componentDidUpdate(nextProps) {
    let drawsRoundData = this.props.drawsState.getDrawsRoundsData;
    let venueData = this.props.drawsState.competitionVenues;
    let divisionGradeNameList = this.props.drawsState.divisionGradeNameList;

    if (nextProps.appState !== this.props.appState) {
      let competitionList = this.props.appState.own_CompetitionArr;
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          this.props.getDrawsRoundsAction(yearId, competitionId);
          setOwn_competition(competitionId);
          this.setState({ firstTimeCompId: competitionId, venueLoad: true });
        }
      }
      if (nextProps.appState.own_YearArr !== this.props.appState.own_YearArr) {
        if (this.props.appState.own_YearArr.length > 0) {
          let yearRefId = getGlobalYear()
            ? getGlobalYear()
            : getCurrentYear(this.props.appState.own_YearArr);
          setGlobalYear(yearRefId);
          this.setState({ yearRefId: yearRefId });
        }
      }
    }
    if (this.state.venueLoad && this.props.drawsState.updateLoad == false) {
      if (nextProps.drawsState !== this.props.drawsState) {
        if (nextProps.drawsState.getDrawsRoundsData !== drawsRoundData) {
          if (venueData.length > 0) {
            let venueId = venueData[0].id;
            setDraws_venue(venueId);
            if (drawsRoundData.length > 0) {
              let roundId = drawsRoundData[0].roundId;
              setDraws_round(roundId);
              let roundTime = drawsRoundData[0].startDateTime;
              setDraws_roundTime(roundTime);
              this.props.getCompetitionDrawsAction(
                this.state.yearRefId,
                this.state.firstTimeCompId,
                venueId,
                roundId,
              );
              this.setState({ roundId, venueId, roundTime, venueLoad: false });
            } else {
              this.setState({
                venueId,
                venueLoad: false,
              });
            }
          }
          if (divisionGradeNameList.length > 0) {
            let competitionDivisionGradeId = divisionGradeNameList[0].competitionDivisionGradeId;
            setDraws_division_grade(competitionDivisionGradeId);
            this.setState({ competitionDivisionGradeId });
          }
        }
      }
    }

    if (this.state.updateLoad && this.props.drawsState.updateLoad == false) {
      this.setState({ updateLoad: false });
      this.reGenerateDraw();
    }
  }

  componentDidMount() {
    loadjs('assets/js/custom.js');
    this.apiCalls();
  }

  apiCalls() {
    this.props.clearDraws();
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
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
        venueLoad: true,
      });
      if (venueId && roundId && roundData && venueData) {
        this.props.getCompetitionDrawsAction(yearId, storedCompetitionId, venueId, roundId);
        this.setState({
          venueId: JSON.parse(venueId),
          roundId: JSON.parse(roundId),
          roundTime,
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

  reGenerateDraw = () => {
    let payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: this.state.firstTimeCompId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
    };
    this.props.generateDrawAction(payload);
    this.setState({ venueLoad: true });
  };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  onSwap(source, target) {
    if (source == target) {
      //can not swap with itself
      return;
    }
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');

    let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let sourceZIndex = sourceIndexArray[2];
    let sourceID = sourceIndexArray[3];

    let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetZIndex = targetIndexArray[2];
    let targetID = targetIndexArray[3];

    let drawData = this.props.drawsState.getStaticDrawsData;

    let sourceObejct = drawData[sourceXIndex].slotsArray[sourceYIndex];
    let targetObject = drawData[targetXIndex].slotsArray[targetYIndex];

    var customSourceObject = null;
    var customTargetObject = null;

    // if (targetObject.drawsId !== sourceObejct.drawsId) {
    //     if (sourceZIndex == 0) {
    //         if (targetZIndex == 0) {
    //             customSourceObject = {
    //                 drawsId: sourceObejct.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: targetObject.homeTeamId,
    //                 awayTeamId: sourceObejct.awayTeamId,
    //                 isLocked: 1
    //             };
    //         } else {
    //             customSourceObject = {
    //                 drawsId: sourceObejct.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: targetObject.awayTeamId,
    //                 awayTeamId: sourceObejct.awayTeamId,
    //                 isLocked: 1
    //             };
    //         }
    //     } else {
    //         if (targetZIndex == 0) {
    //             customSourceObject = {
    //                 drawsId: sourceObejct.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: sourceObejct.homeTeamId,
    //                 awayTeamId: targetObject.homeTeamId,
    //                 isLocked: 1
    //             };
    //         } else {
    //             customSourceObject = {
    //                 drawsId: sourceObejct.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: sourceObejct.homeTeamId,
    //                 awayTeamId: targetObject.awayTeamId,
    //                 isLocked: 1
    //             };
    //         }
    //     }
    //     if (targetZIndex == 0) {
    //         if (sourceZIndex == 0) {
    //             customTargetObject = {
    //                 drawsId: targetObject.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: sourceObejct.homeTeamId,
    //                 awayTeamId: targetObject.awayTeamId,
    //                 isLocked: 1
    //             }
    //         } else {
    //             customTargetObject = {
    //                 drawsId: targetObject.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: sourceObejct.awayTeamId,
    //                 awayTeamId: targetObject.awayTeamId,
    //                 isLocked: 1
    //             }
    //         }
    //     } else {
    //         if (sourceZIndex == 0) {
    //             customTargetObject = {
    //                 drawsId: targetObject.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: targetObject.homeTeamId,
    //                 awayTeamId: sourceObejct.homeTeamId,
    //                 isLocked: 1
    //             }
    //         } else {
    //             customTargetObject = {
    //                 drawsId: targetObject.drawsId,
    //                 // roundId: this.state.roundId,
    //                 homeTeamId: targetObject.homeTeamId,
    //                 awayTeamId: sourceObejct.awayTeamId,
    //                 isLocked: 1
    //             }
    //         }
    //     }
    // } else {
    if (targetObject.drawsId == sourceObejct.drawsId) {
      customSourceObject = {
        drawsId: sourceObejct.drawsId,
        // roundId: this.state.roundId,
        homeTeamId: sourceObejct.awayTeamId,
        awayTeamId: targetObject.homeTeamId,
        isLocked: 1,
      };
      customTargetObject = {
        drawsId: targetObject.drawsId,
        // roundId: this.state.roundId,
        homeTeamId: sourceObejct.awayTeamId,
        awayTeamId: targetObject.homeTeamId,
        // homeTeamId: 290,
        // awayTeamId: 294,
        isLocked: 1,
      };
      let postObject = {
        // drawsMasterId: 1,
        draws: [customSourceObject, customTargetObject],
      };

      this.props.updateCompetitionDraws(postObject, sourceIndexArray, targetIndexArray, 'edit');

      this.setState({ updateLoad: true });
    }
  }

  saveAPIsActionCall() {
    if (this.state.firstTimeCompId == null || this.state.firstTimeCompId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectCompetition);
    } else if (this.state.venueId == null && this.state.venueId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectVenue);
    } else if (this.state.roundId == null || this.state.roundId == '') {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.pleaseSelectRound);
    } else {
      this.props.publishDraws(this.state.firstTimeCompId, 'edit');
    }
  }

  headerView = () => (
    <Header className="comp-draws-header-view mt-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb className="d-flex align-items-center align-self-center" separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add"> {AppConstants.draws}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  onYearChange = yearId => {
    this.props.clearDraws('rounds');
    getGlobalYear(yearId);
    setOwn_competition(undefined);
    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      roundId: null,
      roundTime: null,
      venueId: null,
      competitionDivisionGradeId: null,
    });
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
    // this.setDetailsFieldValue()
  };

  // on Competition change
  onCompetitionChange(competitionId) {
    this.props.clearDraws('rounds');
    setOwn_competition(competitionId);
    this.setState({
      firstTimeCompId: competitionId,
      roundId: null,
      venueId: null,
      roundTime: null,
      venueLoad: true,
      competitionDivisionGradeId: null,
    });
    this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
  }

  // on DivisionGradeNameChange
  onDivisionGradeNameChange(competitionDivisionGradeId) {
    setDraws_division_grade(competitionDivisionGradeId);
    this.setState({ competitionDivisionGradeId });
  }

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm-3">
          <div className="year-select-heading-view">
            <div className="reg-filter-col-cont">
              <span className="year-select-heading">{AppConstants.draws}:</span>
              <Select
                name="yearRefId"
                className="year-select reg-filter-select1 ml-2"
                style={{ maxWidth: 160 }}
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
        </div>
        <div className="col-sm-4">
          <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
            <div className="reg-filter-col-cont">
              <span className="year-select-heading">{AppConstants.competition}:</span>
              <Select
                name="competition"
                className="year-select reg-filter-select1 ml-2"
                style={{ maxWidth: 250 }}
                onChange={competitionId => this.onCompetitionChange(competitionId)}
                value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
              >
                {this.props.appState.own_CompetitionArr.map(item => (
                  <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                    {item.competitionName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="col-sm-5">
          <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
            <span className="year-select-heading">{AppConstants.division}:</span>
            <Select
              style={{ minWidth: 160 }}
              name="competition"
              className="year-select"
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
      </div>
    );
  };

  ////////on venue change
  onVenueChange = venueId => {
    this.props.clearDraws();
    this.setState({ venueId });
    setDraws_venue(venueId);
    this.props.getCompetitionDrawsAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      venueId,
      this.state.roundId,
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
    );
  };

  contentView = () => {
    return (
      <div className="comp-draw-content-view">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-10">
            <span className="form-heading">{AppConstants.draws}</span>
            <div className="row">
              <div className="col-sm mr-0">
                <div className="w-100 d-flex flex-row align-items-center">
                  <span className="year-select-heading">{AppConstants.venue}:</span>
                  <Select
                    className="year-select"
                    placeholder="Select"
                    style={{ minWidth: 120, whiteSpace: 'nowrap' }}
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
              <div className="col-sm pl-0">
                <div className="w-100 d-flex flex-row align-items-center">
                  <span className="year-select-heading">{AppConstants.round}:</span>
                  <Select
                    className="year-select"
                    style={{ minWidth: 100 }}
                    onChange={roundId => this.onRoundsChange(roundId)}
                    value={this.state.roundId}
                  >
                    {this.props.drawsState.getDrawsRoundsData.map(item => (
                      <Option key={'drawsRound_' + item.roundId} value={item.roundId}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                  {this.state.roundTime !== null && (
                    <span className="year-select-heading pb-1">
                      {`Starting ${moment(this.state.roundTime).format('ddd DD/MM')}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-sm-2 comp-draw-edit-btn-view">
                        <NavLink to="/competitionDrawEdit">
                            <Button className="live-score-edit" type="primary">
                                {AppConstants.edit}
                            </Button>
                        </NavLink>
                    </div> */}
        </div>
        {/* {this.draggableView()} */}
        {this.props.drawsState.updateLoad ? (
          <div>
            <Loader visible={this.props.drawsState.updateLoad} />
            {this.draggableView()}
          </div>
        ) : (
          this.draggableView()
        )}
      </div>
    );
  };

  draggableView = () => {
    var dateMargin = 25;
    var dayMargin = 25;
    let topMargin = 0;
    let topMarginHomeTeam = 36;
    let topMarginAwayTeam = 84;
    let legendsData = isArrayNotEmpty(this.props.drawsState.legendsArray)
      ? this.props.drawsState.legendsArray
      : [];
    return (
      <div className="draggable-wrap draw-data-table">
        <div className="scroll-bar">
          <div className="table-head-wrap">
            {/* Day name list */}
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />
              {this.props.drawsState.dateArray.map((item, index) => {
                if (index !== 0) {
                  dateMargin += 110;
                }
                if (index == 0) {
                  dateMargin = 70;
                }
                return (
                  <span style={{ left: dateMargin }}>
                    {item.notInDraw == false ? getDayName(item.date) : ''}
                  </span>
                );
              })}
            </div>
            {/* Times list */}
            <div className="tablehead-row">
              <div className="sr-no empty-bx" />
              {this.props.drawsState.dateArray.map((item, index) => {
                if (index !== 0) {
                  dayMargin += 110;
                }
                if (index == 0) {
                  dayMargin = 70;
                }
                return (
                  <span style={{ left: dayMargin, fontSize: item.notInDraw != false && 11 }}>
                    {item.notInDraw == false ? getTime(item.date) : 'Not in draw'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Slots View */}
          <div className="main-canvas Draws">
            {this.props.drawsState.getStaticDrawsData.map((courtData, index) => {
              let leftMargin = 25;
              if (index !== 0) {
                topMargin += 156;
                topMarginHomeTeam += 156;
                topMarginAwayTeam += 156;
              }
              return (
                <div>
                  <div className="sr-no huge-sr">
                    <div className="venueCourt-tex-div">
                      <span className="venueCourt-text">
                        {courtData.venueShortName + '-' + courtData.venueCourtName}
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
                    return slotObject.drawsId === null ? (
                      <div
                        className={'huge-undraggble-box grey--bg'}
                        style={{ top: topMargin, left: leftMargin }}
                      >
                        <span>Free</span>
                      </div>
                    ) : (
                      <div>
                        <span
                          className={'border huge-border'}
                          style={{ top: topMargin, left: leftMargin }}
                        />
                        <div
                          className={'small-undraggable-box' + ' purple-dark'}
                          style={{
                            top: topMargin,
                            backgroundColor: slotObject.colorCode,
                            left: leftMargin,
                          }}
                        >
                          <span>{slotObject.divisionName + ' - ' + slotObject.gradeName}</span>
                        </div>
                        <span
                          className={'border'}
                          style={{
                            top: topMarginHomeTeam,
                            left: leftMargin,
                          }}
                        />
                        <div
                          className={'box purple-box' + ' purple-bg'}
                          style={{
                            top: topMarginHomeTeam,
                            backgroundColor: slotObject.colorCode,
                            left: leftMargin,
                          }}
                        >
                          <SwappableComponentEdit
                            id={
                              index.toString() +
                              ':' +
                              slotIndex.toString() +
                              ':0:' +
                              slotObject.competitionDivisionGradeId
                            }
                            content={1}
                            swappable
                            onSwap={(source, target) => this.onSwap(source, target)}
                          >
                            <span>{slotObject.homeTeamName}</span>
                          </SwappableComponentEdit>
                        </div>
                        <span
                          className={'border'}
                          style={{ top: topMarginAwayTeam, left: leftMargin }}
                        />
                        <div
                          className={'box purple-box ' + ' purple-bg'}
                          style={{
                            top: topMarginAwayTeam,
                            backgroundColor: slotObject.colorCode,
                            left: leftMargin,
                          }}
                        >
                          <SwappableComponentEdit
                            id={
                              index.toString() +
                              ':' +
                              slotIndex.toString() +
                              ':1:' +
                              slotObject.competitionDivisionGradeId
                            }
                            content={1}
                            swappable
                            onSwap={(source, target) => this.onSwap(source, target)}
                          >
                            <span>{slotObject.awayTeamName}</span>
                          </SwappableComponentEdit>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="draws-legend-view">
          {/* <LegendComponent legendArray={Array(10).fill(legendsData).flat()} /> */}
          <LegendComponent legendArray={legendsData} />
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let publishStatus = this.props.drawsState.publishStatus;
    return (
      <div className="fluid-width">
        {/* <div className="footer-view"> */}
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button">
              <Button type="cancel-button" onClick={() => history.push('/competitionDraws')}>
                {AppConstants.back}
              </Button>
            </div>
          </div>
          {/* <div className="col-sm-9">
                        <div className="comp-buttons-view">
                            <Button className="open-reg-button" type="primary" onClick={() => this.saveAPIsActionCall()} disabled={publishStatus == 0 ? false : true}>
                                {AppConstants.save_publish}
                            </Button>
                        </div>
                    </div> */}
          {/* <div className="col-sm-9">
                        <div className="comp-buttons-view">
                            <NavLink to="/competitionFormat">
                                <Button className="open-reg-button" type="primary">
                                    {AppConstants.regenerateDraw}
                                </Button>
                            </NavLink>
                        </div>
                    </div> */}
        </div>
        {/* </div> */}
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
        <InnerHorizontalMenu menu="competition" compSelectedKey={'18'} />
        {/* <Layout className="container"> */}
        <Layout className="comp-dash-table-view">
          {/* <Form
                        onSubmit={this.saveAPIsActionCall}
                        noValidate="noValidate"
                    > */}
          {/* <Loader visible={this.props.drawsState.updateLoad} /> */}
          {/* <div className="comp-draw-head-content-view"> */}
          {this.headerView()}
          {this.dropdownView()}
          <Content>{this.contentView()}</Content>
          {/* </div> */}
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
      clearDraws,
      publishDraws,
      generateDrawAction,
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

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionDrawEditOld);

import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button, message, Modal, Tooltip, Checkbox } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import FixtureSwappable from '../../customComponents/fixtureSwappableComponent';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  setOwn_competition,
  getOwn_competition,
  getOrganisationData,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getGlobalYear,
  setGlobalYear,
} from '../../util/sessionStorage';
import { getYearAndCompetitionOwnAction } from '../../store/actions/appAction';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import {
  getDivisionAction,
  getCompetitionFixtureAction,
  clearFixtureData,
  updateCompetitionFixtures,
  getActiveRoundsAction,
} from '../../store/actions/competitionModuleAction/competitionDrawsAction';
import moment from 'moment';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import { getCurrentYear } from 'util/permissions';
import { CompetitionFormatType, DrawPublishStatus, ErrorType } from 'util/enums';
import { handleError } from 'util/messageHandler';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';
import { clone, randomKeyGen } from 'util/helpers';
//import { get } from 'lodash';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;
// const isUserWSASuperAdmin = () => {
//   let isUserSuperAdmin = false;
//   const userId = get(localStorage, 'userId', 0);
//   let setWSASuperAdmin = ['18', '1452', '61734'];
//   if (userId && userId != 0) {
//     isUserSuperAdmin = setWSASuperAdmin.includes(userId);
//   }

//   return isUserSuperAdmin;
// };

class CompetitionDrawEdit extends Component {
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
      reGenerateLoad: false,
      roundLoad: false,
      drawGenerateModalVisible: false,
      generateRoundId: null,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      editedDraw: {
        draws: [],
        apiData: null,
      },
      manuallyEditFixtureEnabled: false,
    };
  }

  componentDidUpdate(nextProps) {
    let fixtureDivisionGradeNameList = this.props.drawsState.fixtureDivisionGradeNameList;
    if (nextProps.appState !== this.props.appState) {
      let competitionList = this.props.appState.own_CompetitionArr;
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          let statusRefId = competitionList[0].statusRefId;
          setOwn_competitionStatus(statusRefId);
          this.props.getDivisionAction(competitionId);
          setOwn_competition(competitionId);
          this.setState({
            firstTimeCompId: competitionId,
            venueLoad: true,
            competitionStatus: statusRefId,
          });
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
    if (this.state.venueLoad && this.props.drawsState.divisionLoad == false) {
      if (nextProps.drawsState !== this.props.drawsState) {
        // if (nextProps.drawsState.fixtureDivisionGradeNameList !== fixtureDivisionGradeNameList) {
        if (fixtureDivisionGradeNameList.length > 0) {
          let grade = fixtureDivisionGradeNameList[0];
          let competitionDivisionGradeId = grade.competitionDivisionGradeId;
          this.props.getCompetitionFixtureAction(
            this.state.yearRefId,
            this.state.firstTimeCompId,
            competitionDivisionGradeId,
          );
          this.setState({
            competitionDivisionGradeId,
            venueLoad: false,
            manuallyEditFixtureEnabled: grade.manuallyEditFixtureEnabled == 1,
          });
        }
        // }
      }
    }

    // if (this.state.updateLoad && this.props.drawsState.updateFixtureLoad == false) {
    //     this.setState({updateLoad: false, reGenerateLoad: true})
    //     this.reGenerateDraw();
    // }

    if (this.state.reGenerateLoad && this.props.competitionModuleState.drawGenerateLoad == false) {
      this.setState({ reGenerateLoad: false });
      if (
        !this.props.competitionModuleState.error &&
        this.props.competitionModuleState.status == 1
      ) {
        localStorage.removeItem('draws_round');
        history.push('/competitionDraws');
      }
    }

    if (this.state.roundLoad && this.props.drawsState.onActRndLoad == false) {
      this.setState({ roundLoad: false });
      if (
        this.props.drawsState.activeDrawsRoundsData != null &&
        this.props.drawsState.activeDrawsRoundsData.length > 0
      ) {
        // this.setState({ drawGenerateModalVisible: true });
      } else {
        // this.callGenerateDraw();
        // message.config({ duration: 0.9, maxCount: 1 });
        // message.info(AppConstants.roundsNotAvailable);
      }
    }
  }

  componentDidMount() {
    loadjs('assets/js/custom.js');
    this.apiCalls();
  }

  apiCalls() {
    this.props.clearFixtureData();
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
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
        venueLoad: true,
      });

      this.props.getDivisionAction(storedCompetitionId);
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

  // reGenerateDraw = () => {
  //   let competitionStatus = getOwn_competitionStatus();
  //   if (competitionStatus == 2) {
  //     this.props.getActiveRoundsAction(this.state.yearRefId, this.state.firstTimeCompId);
  //     this.setState({ roundLoad: true });
  //   } else {
  //     this.callGenerateDraw();
  //   }
  // };

  // handleGenerateDrawModal = key => {
  //   if (key === 'ok') {
  //     if (this.state.generateRoundId != null) {
  //       this.callGenerateDraw();
  //       this.setState({ drawGenerateModalVisible: false });
  //     } else {
  //       message.error('Please select round');
  //     }
  //   } else {
  //     this.setState({ drawGenerateModalVisible: false });
  //   }
  // };

  // callGenerateDraw = () => {
  //   let payload = {
  //     yearRefId: this.state.yearRefId,
  //     competitionUniqueKey: this.state.firstTimeCompId,
  //     organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
  //     roundId: this.state.generateRoundId,
  //   };
  //   this.props.generateDrawAction(payload);
  //   this.setState({ reGenerateLoad: true });
  // };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  headerView = () => (
    <Header className="comp-draws-header-view mt-4">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb className="d-flex align-items-center align-self-center" separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add"> {AppConstants.fixtures}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  onYearChange = yearId => {
    this.props.clearFixtureData('grades');
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    this.setState({
      firstTimeCompId: null,
      yearRefId: yearId,
      competitionDivisionGradeId: null,
      competitionStatus: 0,
    });
    this.resetEditFixture();
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
  };

  // on Competition change
  onCompetitionChange(competitionId) {
    this.props.clearFixtureData('grades');
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let comp = own_CompetitionArr.find(x => x.competitionId == competitionId);
    let statusRefId = comp.statusRefId;
    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    this.setState({
      firstTimeCompId: competitionId,
      venueLoad: true,
      competitionDivisionGradeId: null,
      competitionStatus: statusRefId,
    });
    this.resetEditFixture();
    this.props.getDivisionAction(competitionId);
  }

  // on DivisionGradeNameChange
  onDivisionGradeNameChange(competitionDivisionGradeId) {
    this.props.clearFixtureData();
    let fixtureDivisionGradeNameList = this.props.drawsState.fixtureDivisionGradeNameList;
    let grade = fixtureDivisionGradeNameList.find(
      x => x.competitionDivisionGradeId == competitionDivisionGradeId,
    );
    let manuallyEditFixtureEnabled = false;
    if (grade) {
      manuallyEditFixtureEnabled = grade.manuallyEditFixtureEnabled;
    }
    this.setState({ competitionDivisionGradeId, manuallyEditFixtureEnabled });
    this.props.getCompetitionFixtureAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      competitionDivisionGradeId,
    );
  }
  onUpdateCurrentRoundChange(value) {
    if (value) {
      this.showManualEditConfirm();
    } else {
      if (this.state.manuallyEditFixtureEnabled) {
        message.info({ content: AppConstants.removeEditFixture, className: 'mt-270' });
        this.resetEditFixture();
        this.getFixtures();
        this.saveGradeEditFixtureEnabled(0);
      }
    }
  }
  resetEditFixture = () => {
    this.state.editedDraw.draws = [];
    this.setState({ manuallyEditFixtureEnabled: false });
  };
  getFixtures = () => {
    this.props.getCompetitionFixtureAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      this.state.competitionDivisionGradeId,
    );
  };
  showManualEditConfirm = () => {
    let this_ = this;
    confirm({
      content: (
        <div className="app-color">
          <p>{AppConstants.manuallyEditFixtureMsg1}</p>
          <p>{AppConstants.manuallyEditFixtureMsg2}</p>
        </div>
      ),
      okText: AppConstants.continue,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      width: 450,
      onOk() {
        this_.setState({ manuallyEditFixtureEnabled: true });
        this_.state.editedDraw.draws = [];
        this_.getFixtures();
        this_.saveGradeEditFixtureEnabled(1);
      },
      onCancel() {
        this_.setState({ manuallyEditFixtureEnabled: false });
      },
    });
  };
  onSwap(source, target, round_Id, draws) {
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
    let sourceFormatRefId = sourceIndexArray[4];

    // let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetZIndex = targetIndexArray[2];
    let targetID = targetIndexArray[3];
    // let targetFormatRefId = sourceIndexArray[4]
    let sourceObejct = draws[sourceYIndex];
    let targetObject = draws[targetYIndex];

    if (sourceFormatRefId != CompetitionFormatType.Knockout || sourceXIndex == 0) {
      this.updateFixture(
        sourceIndexArray,
        targetIndexArray,
        sourceID,
        targetID,
        targetObject,
        sourceObejct,
        targetZIndex,
        sourceZIndex,
        round_Id,
      );
    }
  }

  updateFixture(
    sourceIndexArray,
    targetIndexArray,
    sourceID,
    targetID,
    targetObject,
    sourceObejct,
    targetZIndex,
    sourceZIndex,
    round_Id,
  ) {
    var customSourceObject = null;

    if (sourceID == targetID) {
      let sourceTeamName = null;
      let sourceTeamColor = null;
      let targetTeamName = null;
      let targetTeamColor = null;
      if (targetObject.drawsId !== sourceObejct.drawsId) {
        if (sourceZIndex == 0) {
          if (targetZIndex == 0) {
            customSourceObject = {
              team1: targetObject.team1,
              team2: sourceObejct.team1,
              roundId: round_Id,
            };
            sourceTeamName = targetObject.team1Name;
            sourceTeamColor = targetObject.team1Color;
            targetTeamName = sourceObejct.team1Name;
            targetTeamColor = sourceObejct.team1Color;
            this.swapTeamColor(sourceObejct, targetObject, 'team1', 'team1');
          } else {
            customSourceObject = {
              team1: targetObject.team2,
              team2: sourceObejct.team1,
              roundId: round_Id,
            };
            sourceTeamName = targetObject.team2Name;
            sourceTeamColor = targetObject.team2Color;
            targetTeamName = sourceObejct.team1Name;
            targetTeamColor = sourceObejct.team1Color;
            this.swapTeamColor(sourceObejct, targetObject, 'team1', 'team2');
          }
        } else {
          if (targetZIndex == 0) {
            customSourceObject = {
              team1: sourceObejct.team2,
              team2: targetObject.team1,
              roundId: round_Id,
            };
            sourceTeamName = sourceObejct.team2Name;
            sourceTeamColor = sourceObejct.team2Color;
            targetTeamName = targetObject.team1Name;
            targetTeamColor = targetObject.team1Color;
            this.swapTeamColor(sourceObejct, targetObject, 'team2', 'team1');
          } else {
            customSourceObject = {
              team1: sourceObejct.team2,
              team2: targetObject.team2,
              roundId: round_Id,
            };
            sourceTeamName = sourceObejct.team2Name;
            sourceTeamColor = sourceObejct.team2Color;
            targetTeamName = targetObject.team2Name;
            targetTeamColor = targetObject.team2Color;
            this.swapTeamColor(sourceObejct, targetObject, 'team2', 'team2');
          }
        }
      } else {
        customSourceObject = {
          team1: sourceObejct.team1,
          team2: targetObject.team2,
          roundId: round_Id,
        };
        sourceTeamName = sourceObejct.team1Name;
        sourceTeamColor = sourceObejct.team1Color;
        targetTeamName = targetObject.team2Name;
        targetTeamColor = targetObject.team2Color;
        this.swapTeamColor(sourceObejct, targetObject, 'team1', 'team2');
      }
      if (customSourceObject) {
        this.state.editedDraw.draws.push(customSourceObject);
        if (!this.state.manuallyEditFixtureEnabled) {
          let swapObject = {
            team1: customSourceObject.team1,
            team1Name: sourceTeamName,
            team1Color: sourceTeamColor,
            team2: customSourceObject.team2,
            team2Name: targetTeamName,
            team2Color: targetTeamColor,
          };
          console.log(swapObject);
          this.swapTeamForAllRounds(swapObject);
        }
        this.setState({ updateUI: true });
      }
    }
  }
  swapTeamColor = (sourceObejct, targetObject, sourceTeamKey, targetTeamKey) => {
    if (this.state.manuallyEditFixtureEnabled) {
      let sourceCopy = clone(sourceObejct);
      let targetCopy = clone(targetObject);
      sourceObejct[sourceTeamKey] = targetCopy[targetTeamKey];
      sourceObejct[sourceTeamKey + 'Color'] = targetCopy[targetTeamKey + 'Color'];
      sourceObejct[sourceTeamKey + 'Name'] = targetCopy[targetTeamKey + 'Name'];
      targetObject[targetTeamKey] = sourceCopy[sourceTeamKey];
      targetObject[targetTeamKey + 'Color'] = sourceCopy[sourceTeamKey + 'Color'];
      targetObject[targetTeamKey + 'Name'] = sourceCopy[sourceTeamKey + 'Name'];
      sourceObejct.slotId = randomKeyGen(5);
      targetObject.slotId = randomKeyGen(5);
    }
  };
  swapTeamForAllRounds = swapObject => {
    let getStaticDrawsData = this.props.drawsState.fixtureArray;
    for (let roundData of getStaticDrawsData) {
      let roundStartDate = roundData.roundStartDate.replace('Z', '');
      let isPastMatches = moment(roundStartDate).isBefore(moment());
      if (isPastMatches) {
        continue;
      }
      let draws = roundData.draws.filter(x => x.drawsId > 0);
      let team1Draws = draws.filter(x => x.team1 == swapObject.team1);
      for (let draw of team1Draws) {
        draw.team1 = -999;
      }
      team1Draws = draws.filter(x => x.team2 == swapObject.team1);
      for (let draw of team1Draws) {
        draw.team2 = -999;
      }

      let team2Draws = draws.filter(x => x.team1 == swapObject.team2);
      for (let draw of team2Draws) {
        draw.team1 = swapObject.team1;
        draw.team1Name = swapObject.team1Name;
        draw.team1Color = swapObject.team1Color;
        draw.slotId = randomKeyGen(5);
      }
      team2Draws = draws.filter(x => x.team2 == swapObject.team2);
      for (let draw of team2Draws) {
        draw.team2 = swapObject.team1;
        draw.team2Name = swapObject.team1Name;
        draw.team2Color = swapObject.team1Color;
        draw.slotId = randomKeyGen(5);
      }

      team1Draws = draws.filter(x => x.team1 == -999);
      for (let draw of team1Draws) {
        draw.team1 = swapObject.team2;
        draw.team1Name = swapObject.team2Name;
        draw.team1Color = swapObject.team2Color;
        draw.slotId = randomKeyGen(5);
      }
      team1Draws = draws.filter(x => x.team2 == -999);
      for (let draw of team1Draws) {
        draw.team2 = swapObject.team2;
        draw.team2Name = swapObject.team2Name;
        draw.team2Color = swapObject.team2Color;
        draw.slotId = randomKeyGen(5);
      }
    }
  };
  saveFixture = () => {
    if (this.state.editedDraw.draws.length > 0) {
      let postData = {
        competitionUniqueKey: this.state.firstTimeCompId,
        fixtures: this.state.editedDraw.draws,
        updateAllRounds: this.state.manuallyEditFixtureEnabled ? 0 : 1,
      };
      this.props.updateCompetitionFixtures(
        postData,
        null, //sourceIndexArray,
        null, //targetIndexArray,
        null, //round_Id,
        this.state.yearRefId,
        this.state.firstTimeCompId,
        this.state.competitionDivisionGradeId,
      );
      this.state.editedDraw.draws = [];
      this.setState({ updateLoad: true });
    }
  };
  saveFixtureAndExit = () => {
    this.saveFixture();
    setTimeout(() => {
      history.push('/competitionDraws');
    }, 500);
  };
  saveGradeEditFixtureEnabled = async manuallyEditFixtureEnabled => {
    try {
      let payload = {
        competitionDivisionGradeId: this.state.competitionDivisionGradeId,
        manuallyEditFixtureEnabled: manuallyEditFixtureEnabled,
      };
      const result = await CompetitionAxiosApi.updateDivisionGrade(payload);
      if (result.status == 1) {
        let fixtureDivisionGradeNameList = this.props.drawsState.fixtureDivisionGradeNameList;
        let grade = fixtureDivisionGradeNameList.find(
          x => x.competitionDivisionGradeId == this.state.competitionDivisionGradeId,
        );
        if (grade) {
          grade.manuallyEditFixtureEnabled = manuallyEditFixtureEnabled;
        }
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm-3">
          <div className="year-select-heading-view">
            <span className="year-select-heading">{AppConstants.year}:</span>
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
        <div className="col-sm-4">
          <div className="w-100 d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
            <span className="year-select-heading">{AppConstants.competition}:</span>
            <Select
              name="competition"
              className="year-select reg-filter-select1 ml-2"
              style={{ maxWidth: 250 }}
              onChange={(competitionId, e) => this.onCompetitionChange(competitionId)}
              value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
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
    );
  };

  contentView = () => {
    let disabledStatus = this.state.competitionStatus == DrawPublishStatus.Published;

    return (
      <div className="comp-draw-content-view mt-5">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-8">
            <span className="form-heading">{AppConstants.fixtures}</span>

            <div className="row align-items-center">
              <div className="col-sm-3">
                <div className="w-100 d-flex flex-row align-items-center">
                  <span className="year-select-heading">{AppConstants.grade}:</span>
                  <Select
                    disabled={disabledStatus}
                    className="year-select"
                    style={{ minWidth: 130, maxWidth: 180 }}
                    onChange={competitionDivisionGradeId =>
                      this.onDivisionGradeNameChange(competitionDivisionGradeId)
                    }
                    value={JSON.parse(JSON.stringify(this.state.competitionDivisionGradeId))}
                  >
                    {this.props.drawsState.fixtureDivisionGradeNameList.map(item => (
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
              <div className="col-sm-3">
                <Checkbox
                  className="year-select-heading"
                  disabled={disabledStatus}
                  onChange={e => this.onUpdateCurrentRoundChange(e.target.checked)}
                  checked={this.state.manuallyEditFixtureEnabled}
                >
                  {AppConstants.manuallyEditFixture}
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
        {this.props.drawsState.updateFixtureLoad ? (
          <div>
            <Loader visible={this.props.drawsState.updateFixtureLoad} />
            {this.dragableView()}
          </div>
        ) : (
          this.dragableView()
        )}
      </div>
    );
  };

  //////the dragable content view inside the container
  dragableView = () => {
    let isPublish = this.state.competitionStatus == DrawPublishStatus.Published;
    let topMargin = 50;
    let topMarginHomeTeam = 50;
    let topMarginAwayTeam = 103;
    let getStaticDrawsData = this.props.drawsState.fixtureArray;
    return (
      <div className="draggable-wrap draw-data-table">
        <div className="scroll-bar">
          {/* Slots View */}
          <div className="fixture-main-canvas Draws">
            {getStaticDrawsData.map((courtData, index) => {
              let leftMargin = 25;
              if (index !== 0) {
                topMargin += 180;
                topMarginHomeTeam += 180;
                topMarginAwayTeam += 180;
              }
              let roundStartDate = courtData.roundStartDate.replace('Z', '');
              let isPastMatches = moment(roundStartDate).isBefore(moment());
              let disabledStatus = isPublish || isPastMatches;
              return (
                <div key={index}>
                  <div className="fixture-round-view">
                    <div>
                      <span className="fixture-round">{courtData.roundName}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 11 }}>
                        {moment(roundStartDate).format('ddd DD/MM')}
                      </span>
                    </div>
                  </div>
                  <div className="sr-no fixture-huge-sr"></div>

                  {courtData.draws.map((slotObject, slotIndex) => {
                    if (slotIndex !== 0) {
                      leftMargin += 110;
                    }
                    if (slotIndex == 0) {
                      leftMargin = 70;
                    }
                    return slotObject.drawsId === null ? (
                      <div
                        className="fixture-huge-undraggble-box grey--bg"
                        style={{ top: topMargin, left: leftMargin }}
                      >
                        <span>Free</span>
                      </div>
                    ) : (
                      <div key={slotObject.slotId}>
                        <div
                          className="box purple-box purple-bg"
                          title={isPastMatches ? AppConstants.canNotEditPastMatches : ''}
                          style={{
                            top: topMarginHomeTeam,
                            backgroundColor: slotObject.team1Color,
                            left: leftMargin,
                            cursor:
                              (disabledStatus || slotObject.team1 == 1 || !slotObject.team1) &&
                              'no-drop',
                          }}
                        >
                          <FixtureSwappable
                            id={
                              index.toString() +
                              ':' +
                              slotIndex.toString() +
                              ':0:' +
                              courtData.roundId +
                              ':' +
                              slotObject.competitionFormatRefId
                            }
                            content={1}
                            swappable={disabledStatus == false && slotObject.team1 > 1}
                            onSwap={(source, target) =>
                              this.onSwap(source, target, courtData.roundId, courtData.draws)
                            }
                          >
                            <span>{slotObject.team1Name}</span>
                          </FixtureSwappable>
                        </div>
                        <span
                          className="border"
                          style={{ top: topMarginAwayTeam, left: leftMargin }}
                        />
                        <div
                          className="box purple-box purple-bg"
                          title={isPastMatches ? AppConstants.canNotEditPastMatches : ''}
                          style={{
                            top: topMarginAwayTeam,
                            backgroundColor: slotObject.team2Color,
                            left: leftMargin,
                            cursor:
                              (disabledStatus || slotObject.team2 == 1 || !slotObject.team2) &&
                              'no-drop',
                          }}
                        >
                          <FixtureSwappable
                            id={
                              index.toString() +
                              ':' +
                              slotIndex.toString() +
                              ':1:' +
                              courtData.roundId +
                              ':' +
                              slotObject.competitionFormatRefId
                            }
                            content={1}
                            swappable={disabledStatus == false && slotObject.team2 > 1}
                            onSwap={(source, target) =>
                              this.onSwap(source, target, courtData.roundId, courtData.draws)
                            }
                          >
                            <span>{slotObject.team2Name}</span>
                          </FixtureSwappable>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    //let activeDrawsRoundsData = this.props.drawsState.activeDrawsRoundsData;
    let isPublish = this.state.competitionStatus == DrawPublishStatus.Published;
    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <Button type="cancel-button" onClick={() => history.push('/competitionDraws')}>
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Tooltip
                title={AppConstants.statusPublishHover}
                visible={this.state.tooltipVisibleDelete}
                className="h-100 save-draft-text"
                onMouseEnter={() => this.setState({ tooltipVisibleDelete: isPublish })}
                onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
              >
                <Button
                  disabled={isPublish}
                  className="publish-button"
                  type="primary"
                  onClick={this.saveFixture}
                >
                  {AppConstants.save}
                </Button>
              </Tooltip>
              <Tooltip
                title={AppConstants.statusPublishHover}
                visible={this.state.tooltipVisibleSaveAndExit}
                className="h-100"
                onMouseEnter={() => this.setState({ tooltipVisibleSaveAndExit: isPublish })}
                onMouseLeave={() => this.setState({ tooltipVisibleSaveAndExit: false })}
              >
                <Button
                  disabled={isPublish}
                  className="publish-button"
                  type="primary"
                  onClick={this.saveFixtureAndExit}
                >
                  {AppConstants.saveAndExit}
                </Button>
              </Tooltip>
            </div>
          </div>
          {/* <Loader visible={this.props.competitionModuleState.drawGenerateLoad} /> */}
        </div>

        {/* <Modal
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
        </Modal> */}
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
        <InnerHorizontalMenu menu="competition" compSelectedKey="18" />
        <Layout className="comp-dash-table-view">
          {/* <div className="comp-draw-head-content-view"> */}
          {this.headerView()}
          {this.dropdownView()}
          <Content>{this.contentView()}</Content>
          {/* </div> */}
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
      getDivisionAction,
      getCompetitionFixtureAction,
      clearFixtureData,
      updateCompetitionFixtures,
      generateDrawAction,
      getActiveRoundsAction,
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

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionDrawEdit);

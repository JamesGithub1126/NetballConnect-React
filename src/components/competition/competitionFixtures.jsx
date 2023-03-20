import React, { Component } from 'react';
import { Layout, Breadcrumb, Select, Button } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import loadjs from 'loadjs';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import CompetitionSwappable from '../../customComponents/quickCompetitionComponent';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  setOwn_competition,
  getOwn_competition,
  setDraws_division_grade,
  getDraws_division_grade,
  setGlobalYear,
  getGlobalYear,
} from '../../util/sessionStorage';
import { getYearAndCompetitionOwnAction } from '../../store/actions/appAction';
import {
  getDivisionAction,
  getCompetitionFixtureAction,
  clearFixtureData,
  updateCompetitionFixtures,
} from '../../store/actions/competitionModuleAction/competitionDrawsAction';
import Loader from '../../customComponents/loader';
import { getCurrentYear } from 'util/permissions';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class CompetitionFixtures extends Component {
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
    };
  }

  componentDidMount() {
    loadjs('assets/js/custom.js');
    this.apiCalls();
  }

  componentDidUpdate(nextProps) {
    let fixtureDivisionGradeNameList = this.props.drawsState.fixtureDivisionGradeNameList;
    if (nextProps.appState !== this.props.appState) {
      let competitionList = this.props.appState.own_CompetitionArr;
      if (nextProps.appState.own_CompetitionArr !== competitionList) {
        if (competitionList.length > 0) {
          let competitionId = competitionList[0].competitionId;
          this.props.getDivisionAction(competitionId);
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
    if (this.state.venueLoad && this.props.drawsState.divisionLoad == false) {
      if (nextProps.drawsState !== this.props.drawsState) {
        // if (nextProps.drawsState.fixtureDivisionGradeNameList !== fixtureDivisionGradeNameList) {
        if (fixtureDivisionGradeNameList.length > 0) {
          let competitionDivisionGradeId =
            fixtureDivisionGradeNameList[0].competitionDivisionGradeId;
          setDraws_division_grade(competitionDivisionGradeId);
          this.props.getCompetitionFixtureAction(
            this.state.yearRefId,
            this.state.firstTimeCompId,
            competitionDivisionGradeId,
          );
          this.setState({ competitionDivisionGradeId, venueLoad: false });
          // }
        }
      }
    }
  }

  apiCalls() {
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    let compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    let competitionDivisionGradeId =
      this.props.drawsState.fixtureDivisionGradeNameList.length > 0
        ? this.props.drawsState.fixtureDivisionGradeNameList
        : undefined;
    competitionDivisionGradeId = getDraws_division_grade();
    if (storedCompetitionId && yearId && propsData && compData) {
      this.setState({
        yearRefId: JSON.parse(yearId),
        firstTimeCompId: storedCompetitionId,
        venueLoad: true,
      });
      if (competitionDivisionGradeId) {
        this.props.getDivisionAction(storedCompetitionId);
        this.setState({
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
    this.setState({ firstTimeCompId: null, yearRefId: yearId, competitionDivisionGradeId: null });
    this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );
  };

  // on Competition change
  onCompetitionChange(competitionId) {
    this.props.clearFixtureData('grades');
    setOwn_competition(competitionId);
    this.setState({
      firstTimeCompId: competitionId,
      venueLoad: true,
      competitionDivisionGradeId: null,
    });
    this.props.getDivisionAction(competitionId);
  }

  // on DivisionGradeNameChange
  onDivisionGradeNameChange(competitionDivisionGradeId) {
    this.props.clearFixtureData();
    setDraws_division_grade(competitionDivisionGradeId);
    this.setState({ competitionDivisionGradeId });
    this.props.getCompetitionFixtureAction(
      this.state.yearRefId,
      this.state.firstTimeCompId,
      competitionDivisionGradeId,
    );
  }

  onSwap(source, target, round_Id, draws) {
    let sourceIndexArray = source.split(':');
    let targetIndexArray = target.split(':');
    // let sourceXIndex = sourceIndexArray[0];
    let sourceYIndex = sourceIndexArray[1];
    let sourceZIndex = sourceIndexArray[2];
    let sourceID = sourceIndexArray[3];
    // let targetXIndex = targetIndexArray[0];
    let targetYIndex = targetIndexArray[1];
    let targetZIndex = targetIndexArray[2];
    let targetID = targetIndexArray[3];
    let sourceObejct = draws[sourceYIndex];
    let targetObject = draws[targetYIndex];
    var customSourceObject = null;
    if (sourceID == targetID) {
      if (targetObject.drawsId !== sourceObejct.drawsId) {
        if (sourceZIndex == 0) {
          if (targetZIndex == 0) {
            customSourceObject = {
              competitionUniqueKey: this.state.firstTimeCompId,
              team1: targetObject.team1,
              team2: sourceObejct.team1,
            };
          } else {
            customSourceObject = {
              competitionUniqueKey: this.state.firstTimeCompId,
              team1: targetObject.team2,
              team2: sourceObejct.team1,
            };
          }
        } else {
          if (targetZIndex == 0) {
            customSourceObject = {
              competitionUniqueKey: this.state.firstTimeCompId,
              team1: sourceObejct.team2,
              team2: targetObject.team1,
            };
          } else {
            customSourceObject = {
              competitionUniqueKey: this.state.firstTimeCompId,
              team1: sourceObejct.team2,
              team2: targetObject.team2,
            };
          }
        }
      } else {
        customSourceObject = {
          competitionUniqueKey: this.state.firstTimeCompId,
          team1: sourceObejct.team1,
          team2: targetObject.team2,
        };
      }
      this.props.updateCompetitionFixtures(
        customSourceObject,
        sourceIndexArray,
        targetIndexArray,
        round_Id,
      );
    }
  }

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm-3">
          <div className="year-select-heading-view">
            <span className="year-select-heading">{AppConstants.year}:</span>
            <Select
              name="yearRefId"
              className="year-select"
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
              style={{ minWidth: 160 }}
              name="competition"
              className="year-select reg-filter-select1 innerSelect-value-draws"
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
    );
  };

  contentView = () => {
    return (
      <div className="comp-draw-content-view mt-0">
        <div className="row comp-draw-list-top-head">
          <div className="col-sm-4">
            <span className="form-heading">{AppConstants.fixtures}</span>
            <div className="row">
              <div className="col-sm">
                <div className="d-flex align-items-center w-100">
                  <span className="year-select-heading">{AppConstants.grade}:</span>
                  <Select
                    className="year-select"
                    style={{ minWidth: 100, maxWidth: 130 }}
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

  dragableView = () => {
    // var dateMargin = 25;
    var dayMargin = 25;
    let topMargin = 0;
    let getStaticDrawsData = [];
    let dateArray = [{ time: '09:00' }, { time: '10:00' }, { time: '11:00' }, { time: '12:00' }];
    return (
      <div className="draggable-wrap draw-data-table">
        <div className="scroll-bar pb-4">
          <div className="table-head-wrap">
            {/* Times list */}
            <div className="tablehead-row-fixture">
              <div className="sr-no empty-bx" />
              {dateArray.map((date, index) => {
                if (index !== 0) {
                  dayMargin += 75;
                }
                // if (index == 0) {
                //     dayMargin = 30;
                // }
                return <span style={{ left: dayMargin }}>{date.time}</span>;
              })}
            </div>
          </div>
        </div>

        <div className="main-canvas Draws">
          {getStaticDrawsData.map((courtData, index) => {
            let leftMargin = 25;
            if (index !== 0) {
              topMargin += 50;
            }
            return (
              <div>
                <div className="fixture-sr-no">{index + 1}</div>
                {courtData.slotsArray.map((slotObject, slotIndex) => {
                  if (slotIndex !== 0) {
                    leftMargin += 75;
                  }
                  // if (slotIndex == 0) {
                  //     leftMargin = 40;
                  // }
                  return (
                    <div>
                      <span
                        style={{ left: leftMargin, top: topMargin }}
                        className="fixtureBorder"
                      />
                      <div
                        className="fixtureBox overflow-hidden"
                        style={{
                          backgroundColor: slotObject.colorCode,
                          left: leftMargin,
                          top: topMargin,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <CompetitionSwappable
                          id={index.toString() + ':' + slotIndex.toString()}
                          content={1}
                          swappable
                          onSwap={(source, target) => console.log(source, target)}
                        >
                          {slotObject.drawsId != null ? (
                            <span>{slotObject.homeTeamName}</span>
                          ) : (
                            <span>N/A</span>
                          )}
                        </CompetitionSwappable>
                      </div>
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

  //////the gragable content view inside the container
  // dragableView = () => {
  //     let topMargin = 50;
  //     let topMarginHomeTeam = 50;
  //     let topMarginAwayTeam = 103;
  //     let getStaticDrawsData = this.props.drawsState.fixtureArray
  //     return (
  //         <div className="draggable-wrap draw-data-table">
  //             <div className="scroll-bar">
  //                 {/* Slots View */}
  //                 <div className="fixture-main-canvas Draws">
  //                     {getStaticDrawsData.map((courtData, index) => {
  //                         let leftMargin = 25;
  //                         if (index !== 0) {
  //                             topMargin += 180;
  //                             topMarginHomeTeam += 180;
  //                             topMarginAwayTeam += 180;
  //                         }
  //                         return (
  //                             <div>
  //                                 <div className="fixture-round-view">
  //                                     <div>
  //                                         <span className="fixture-round">{courtData.roundName}</span>
  //                                     </div>
  //                                     <div>
  //                                         <span style={{ fontSize: 11 }}>
  //                                             {moment(courtData.roundStartDate).format("ddd DD/MM")}
  //                                         </span>
  //                                     </div>
  //                                 </div>
  //                                 <div className="sr-no fixture-huge-sr">
  //                                 </div>
  //
  //                                 {courtData.draws.map((slotObject, slotIndex) => {
  //                                     if (slotIndex !== 0) {
  //                                         leftMargin += 110;
  //                                     }
  //                                     if (slotIndex == 0) {
  //                                         leftMargin = 70;
  //                                     }
  //                                     return slotObject.drawsId === null ? (
  //                                         <div
  //                                             className="fixture-huge-undraggble-box grey--bg"
  //                                             style={{ top: topMargin, left: leftMargin }}
  //                                         >
  //                                             <span>Free</span>
  //                                         </div>
  //                                     ) : (
  //                                         <div>
  //                                             <div
  //                                                 className="box purple-box purple-bg"
  //                                                 style={{
  //                                                     top: topMarginHomeTeam,
  //                                                     backgroundColor: slotObject.team1Color,
  //                                                     left: leftMargin
  //                                                 }}
  //                                             >
  //                                                 <FixtureSwappable
  //                                                     id={
  //                                                         index.toString() +
  //                                                         ':' +
  //                                                         slotIndex.toString() +
  //                                                         ':0:' + courtData.roundId
  //                                                     }
  //                                                     content={1}
  //                                                     swappable
  //                                                     onSwap={(source, target) =>
  //                                                         this.onSwap(source, target, courtData.roundId, courtData.draws)
  //                                                     }
  //                                                 >
  //                                                     <span>{slotObject.team1Name}</span>
  //                                                 </FixtureSwappable>
  //                                             </div>
  //                                             <span
  //                                                 className="border"
  //                                                 style={{ top: topMarginAwayTeam, left: leftMargin }}
  //                                             />
  //                                             <div
  //                                                 className="box purple-box purple-bg"
  //                                                 style={{
  //                                                     top: topMarginAwayTeam,
  //                                                     backgroundColor: slotObject.team2Color,
  //                                                     left: leftMargin
  //                                                 }}
  //                                             >
  //                                                 <FixtureSwappable
  //                                                     id={
  //                                                         index.toString() +
  //                                                         ':' +
  //                                                         slotIndex.toString() +
  //                                                         ':1:' + courtData.roundId
  //                                                     }
  //                                                     content={1}
  //                                                     swappable
  //                                                     onSwap={(source, target) =>
  //                                                         this.onSwap(source, target, courtData.roundId, courtData.draws)
  //                                                     }
  //                                                 >
  //                                                     <span>{slotObject.team2Name}</span>
  //                                                 </FixtureSwappable>
  //                                             </div>
  //                                         </div>
  //                                     );
  //                                 })}
  //                             </div>
  //                         );
  //                     })}
  //                 </div>
  //             </div>
  //         </div>
  //     );
  // };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width">
        {/* <div className="footer-view"> */}
        <div className="row">
          <div className="col-sm-3">
            <div className="reg-add-save-button">
              <Button type="cancel-button">{AppConstants.back}</Button>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button className="open-reg-button" type="primary">
                {AppConstants.next}
              </Button>
            </div>
          </div>
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
        <InnerHorizontalMenu menu="competition" compSelectedKey="11" />
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
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    drawsState: state.CompetitionDrawsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionFixtures);

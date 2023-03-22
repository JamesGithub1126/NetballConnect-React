import React, { Component, createRef } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Checkbox,
  Button,
  Radio,
  Form,
  message,
  DatePicker,
  Modal,
  Tooltip,
} from 'antd';
import './competition.css';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import moment from 'moment';
import {
  getCompetitionFinalsAction,
  saveCompetitionFinalsAction,
  updateCompetitionFinalsAction,
  getTemplateDownloadAction,
} from '../../store/actions/competitionModuleAction/competitionFinalsAction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import history from '../../util/history';
import {
  getMatchTypesAction,
  getYearAndCompetitionOwnAction,
  clearYearCompetitionAction,
  getVenuesTypeAction,
  searchVenueList,
} from '../../store/actions/appAction';
import Loader from '../../customComponents/loader';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import ValidationConstants from '../../themes/validationConstant';
import { isBasketball } from '../liveScore/liveScoreSettings/liveScoreSettingsUtils';
import {
  getApplyToAction,
  getExtraTimeDrawAction,
  getFinalFixtureTemplateAction,
} from '../../store/actions/commonAction/commonAction';
import { getActiveRoundsAction } from '../../store/actions/competitionModuleAction/competitionDrawsAction';
import {
  getOrganisationData,
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  // getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  getGlobalYear,
  setGlobalYear,
  setOpenRegenerateModal,
} from '../../util/sessionStorage';
import AppUniqueId from '../../themes/appUniqueId';
import { NavLink } from 'react-router-dom';
import { FLAVOUR } from '../../util/enums';
import CustomFinalFixtureTemplate from './finals/CustomFinalFixtureTemplate';
import { flatten } from "lodash";

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class CompetitionFinals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeCompId: '',
      yearRefId: null,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      getDataLoading: false,
      buttonPressed: '',
      loading: false,
      roundLoad: false,
      drawGenerateModalVisible: false,
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      generateRoundId: null,
    };

    this.formRef = createRef();
    this.referenceApiCalls();
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
      this.apiCalls(storedCompetitionId, yearId);
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

  componentDidUpdate(nextProps) {
    let competitionFinalsState = this.props.competitionFinalsState;
    let competitionModuleState = this.props.competitionModuleState;
    if (nextProps.competitionFinalsState != competitionFinalsState) {
      if (competitionFinalsState.onLoad == false && this.state.getDataLoading) {
        this.setState({
          getDataLoading: false,
        });
        this.setFormFieldValue();
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
          if (storedCompetitionId && storedCompetitionId !== 'undefined') {
            let compIndex = competitionList.findIndex(x => x.competitionId == competitionId);
            statusRefId = competitionList[compIndex].statusRefId;
            finalTypeRefId = competitionList[compIndex].finalTypeRefId;
          }
          setOwn_competition(competitionId);
          setOwn_competitionStatus(statusRefId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          this.apiCalls(competitionId, yearId);
          this.setState({
            getDataLoading: true,
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            yearRefId: JSON.parse(yearId),
          });
        }
      }
    }

    if (nextProps.competitionFinalsState != competitionFinalsState) {
      if (competitionFinalsState.onLoad == false && this.state.loading === true) {
        this.setState({ loading: false });
        if (!competitionFinalsState.error) {
          if (this.state.buttonPressed === 'save') {
            if (competitionFinalsState.status == 4) {
              message.error(competitionFinalsState.errorMessage);
            } else {
              // let payload = {
              //   yearRefId: this.state.yearRefId,
              //   competitionUniqueKey: this.state.firstTimeCompId,
              //   organisationId: this.state.organisationId,
              // };
              if (competitionModuleState.drawGenerateLoad == false) {
                setOpenRegenerateModal(1);
                history.push('/competitionDraws');
                // let competitionStatus = getOwn_competitionStatus();
                // if (competitionStatus != 2) {

                //   this.props.generateDrawAction(payload);
                //   this.setState({ loading: true });
                // } else {
                //   this.props.getActiveRoundsAction(
                //     this.state.yearRefId,
                //     this.state.firstTimeCompId,
                //   );
                //   this.setState({ roundLoad: true });
                // }
              }
            }
          }
        }
      }
    }

    if (nextProps.competitionModuleState != competitionModuleState) {
      if (
        competitionFinalsState.onLoad == false &&
        competitionModuleState.drawGenerateLoad == false &&
        this.state.loading === true
      ) {
        if (!competitionModuleState.error && competitionModuleState.status == 1) {
          history.push('/competitionDraws');
        }
        this.setState({ loading: false });
      }

      if (competitionModuleState.status == 5 && competitionModuleState.drawGenerateLoad == false) {
        this.setState({ loading: false });
        message.error(ValidationConstants.drawsMessage[0]);
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
        // let payload = {
        //   yearRefId: this.state.yearRefId,
        //   competitionUniqueKey: this.state.firstTimeCompId,
        //   organisationId: this.state.organisationId,
        // };
        // this.props.generateDrawAction(payload);
        // this.setState({ loading: true });
      }
    }
  }

  apiCalls = (competitionId, yearRefId) => {
    let payload = {
      yearRefId,
      competitionUniqueKey: competitionId,
      organisationId: this.state.organisationId,
    };
    this.props.getCompetitionFinalsAction(payload);
    this.props.getVenuesTypeAction('all');
  };

  referenceApiCalls = () => {
    this.props.clearYearCompetitionAction();
    this.props.getMatchTypesAction();
    this.props.getApplyToAction();
    this.props.getExtraTimeDrawAction();
    this.props.getFinalFixtureTemplateAction();
    this.setState({ getDataLoading: true });
  };

  setFormFieldValue = () => {
    let finalsList = Object.assign(this.props.competitionFinalsState.competitionFinalsList);
    let venueList = this.props.competitionFinalsState.competitionVenuesList;
    let venueListId = [];
    venueList.forEach(item => {
      venueListId.push(item.venueId);
    });

    (finalsList || []).forEach((item, index) => {
      if (item.whoPlaysWho) {
        for (let i = 0; i < item.whoPlaysWho.length; i++) {
          if (item.whoPlaysWho[i].noOfPools == 2) {
            this.onChangeSetValue(item.whoPlaysWho[i].pools[0].poolId, 'wpwPool1', index, i);
            this.onChangeSetValue(item.whoPlaysWho[i].pools[1].poolId, 'wpwPool2', index, i);
          }
          if (item.whoPlaysWho[i].noOfPools == 4) {
            this.formRef.current.setFieldsValue({
              [`wpwPool1${i}`]: item.whoPlaysWho[i].wpwPool1,
              [`wpwPool2${i}`]: item.whoPlaysWho[i].wpwPool2,
              [`wpwPool3${i}`]: item.whoPlaysWho[i].wpwPool3,
              [`wpwPool4${i}`]: item.whoPlaysWho[i].wpwPool4,
            });
          }
        }
      }
      this.formRef.current.setFieldsValue({
        [`finalsStartDate${index}`]:
          item.finalsStartDate != null && item.finalsStartDate != ''
            ? moment(item.finalsStartDate, 'YYYY-MM-DD HH:mm')
            : null,
        [`finalsFixtureTemplateRefId${index}`]: item.finalsFixtureTemplateRefId,
        [`finalsMatchTypeRefId${index}`]: item.finalsMatchTypeRefId,
        [`matchDuration${index}`]: item.matchDuration,
        [`mainBreak${index}`]: item.mainBreak,
        [`qtrBreak${index}`]: item.qtrBreak,
        [`timeBetweenGames${index}`]: item.timeBetweenGames,
        [`applyToRefId${index}`]: item.applyToRefId,
        [`extraTimeMatchTypeRefId${index}`]: item.extraTimeMatchTypeRefId,
        [`extraTimeDuration${index}`]: item.extraTimeDuration,
        [`extraTimeMainBreak${index}`]: item.extraTimeMainBreak,
        [`extraTimeBreak${index}`]: item.extraTimeBreak,
        [`beforeExtraTime${index}`]: item.beforeExtraTime,
        [`extraTimeDrawRefId${index}`]: item.extraTimeDrawRefId,
        [`extraTimeFor${index}`]: item.extraTimeFor,
        [`poolTopRefId${index}`]: item.poolTopRefId,
      });
    });

    this.formRef.current.setFieldsValue({
      [`selectedVenues`]: venueListId,
    });
  };

  onYearChange(yearId) {
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
  }

  // on Competition change
  onCompetitionChange(competitionId) {
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusIndex = own_CompetitionArr.findIndex(x => x.competitionId == competitionId);
    let statusRefId = own_CompetitionArr[statusIndex].statusRefId;
    let finalTypeRefId = own_CompetitionArr[statusIndex].finalTypeRefId;
    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    setOwn_CompetitionFinalRefId(finalTypeRefId);
    let payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: competitionId,
      organisationId: this.state.organisationId,
    };
    this.props.getCompetitionFinalsAction(payload);
    this.setState({
      getDataLoading: true,
      firstTimeCompId: competitionId,
      competitionStatus: statusRefId,
    });
  }

  onChangeSetValue = (id, fieldName, index, subIndex) => {
    if (index === 'venueList') {
      let obj = {
        venueListArray: fieldName,
        venueList: 'venueList',
      };
      this.props.updateCompetitionFinalsAction(id, obj, index);
    } else {
      this.props.updateCompetitionFinalsAction(id, fieldName, index, subIndex);
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
    this.setState({ loading: true });
  };

  getFinalFixtureTemplateData = hasTop4 => {
    try {
      let finalFixtureTemplateList = [];
      let poolsArray = [
        {
          id: 1,
          description: 'Top1',
        },
        {
          id: 2,
          description: 'Top2',
        },
        {
          id: 3,
          description: 'Top4',
        },
      ];
      finalFixtureTemplateList =
        hasTop4 == 1 ? poolsArray : poolsArray.slice(0, poolsArray.length - 1);
      return finalFixtureTemplateList;
    } catch (ex) {
      console.log('Error in getFinalFixtureTemplateData' + ex);
    }
  };

  isShowPlayOff3rdPosition = final => {
    try {
      let show = false;
      if (final.poolTopRefId == 2) {
        show = true;
      } else if (final.poolTopRefId == 3) {
        show = true;
      } else if (final.poolTopRefId == 1) {
        let hasTop4 = final.whoPlaysWho.find(x => x.noOfPools == 4);
        if (hasTop4 != undefined) {
          show = true;
        }
      }
      return show;
    } catch (ex) {
      console.log('Error in isShowPlayOff3rdPosition::' + ex);
    }
  };

  checkDuplicates = competitionFinalsList => {
    try {
      let error = false;
      let errorMessage = '';
      for (let final of competitionFinalsList) {
        for (let wpw of final.whoPlaysWho) {
          if (wpw.noOfPools == 4) {
            let poolIds = [wpw.wpwPool1, wpw.wpwPool2, wpw.wpwPool3, wpw.wpwPool4];
            if (poolIds.some(x => poolIds.indexOf(x) !== poolIds.lastIndexOf(x))) {
              errorMessage =
                AppConstants.whoPlaysWhoValidation + ' in Division ' + wpw.divisionName;
              error = true;
              break;
            }
          }
        }
      }
      return { error, errorMessage };
    } catch (ex) {
      console.log('Error in checkDuplicates' + ex);
    }
  };

  getSaveFinalList = finalList => {
    for (let final of finalList) {
      final['finalTypeRefId'] = this.props.competitionFinalsState.finalTypeRefId;
    }
    return finalList;
  };

  has4Pools = whoPlaysWhoList => {
    if (whoPlaysWhoList) {
      let has4Pools = whoPlaysWhoList.find(x => x.noOfPools == 4);
      if (has4Pools == undefined) {
        return false;
      } else {
        return true;
      }
    }
  };

  saveCompetitionFinals = value => {
    const { competitionFinalsList, competitionVenuesList, finalTypeRefId } =
      this.props.competitionFinalsState;
    if (finalTypeRefId != 1) {
      let checkDuplicate = this.checkDuplicates(competitionFinalsList);
      if (checkDuplicate.error) {
        message.error(checkDuplicate.errorMessage);
        return;
      }
    }

    this.setState({ buttonPressed: 'save' });

    let finalsList = this.getSaveFinalList(competitionFinalsList);
    let venueList = competitionVenuesList;
    let payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: this.state.firstTimeCompId,
      organisationId: this.state.organisationId,
      finals: finalsList,
      customFinalTemplates: (value.customFinalTemplates ?? []).map(competitionTemplate => {
        // W1-1 or L1-1
        const findMatchAlias = (teamName) => {
          const prefix = teamName.slice(0, 1);
          const [roundIndex, matchIndex] = teamName.slice(1).split('-');
          const previousMatch = competitionTemplate.rounds[roundIndex - 1]?.matches?.[matchIndex - 1];
          return `${prefix}${previousMatch.matchName ?? ''}`;
        };

        return {
          numberOfRounds: competitionTemplate.numberOfRounds,
          numberOfTeams: competitionTemplate.numberOfTeams,
          allowDifferentGrades: competitionTemplate.allowDifferentGrades,
          finalDivisionName: competitionTemplate.finalDivisionName,
          rounds: competitionTemplate.rounds.map(({ matches }, roundIndex) => ({
            roundName: competitionTemplate.roundNames[roundIndex],
            roundId: roundIndex + 1,
            matches: matches.map((match, matchIndex) => ({
              ...match,
              id: `${roundIndex + 1}-${matchIndex + 1}`,
              team1Name:
                typeof match.team1 === 'number'
                  ? match.team1
                  : findMatchAlias(match.team1),
              team2Name:
                typeof match.team2 === 'number'
                  ? match.team2
                  : findMatchAlias(match.team2),
              team1Grade:
                  typeof match.team1 === 'number' && competitionTemplate.allowDifferentGrades
                    ? match.team1Grade
                    : undefined,
              team2Grade:
                  typeof match.team2 === 'number' && competitionTemplate.allowDifferentGrades
                    ? match.team2Grade
                    : undefined,
              round: matchIndex,
            })),
          })),
        };
      }),
      venues: venueList,
    };

    this.props.saveCompetitionFinalsAction(payload);
    this.setState({ loading: true });
  };

  downloadTemplate = () => {
    this.props.getTemplateDownloadAction(null);
  };

  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.finals}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  dropdownView = () => {
    const { own_YearArr, own_CompetitionArr } = this.props.appState;
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3 pb-3">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
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
            <div className="col-sm-4 pb-3">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  // style={{ minWidth: 200 }}
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  onChange={(competitionId, e) => this.onCompetitionChange(competitionId, e.key)}
                  value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                >
                  {own_CompetitionArr.map(item => (
                    <Option key={'competition_' + item.competitionId} value={item.competitionId}>
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

  // onSelectValues(item, detailsData) {
  //     this.props.add_editcompetitionFeeDeatils(item, "venues")
  //     this.props.clearFilter()
  // }

  handleSearch = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchVenueList(filteredData);
  };

  contentView = () => {
    let finalsList = this.props.competitionFinalsState.competitionFinalsList;
    let venueList = this.props.competitionFinalsState.competitionVenuesList;
    const { finalTypeRefId } = this.props.competitionFinalsState;
    let appState = this.props.appState;
    let {
      // applyToData,
      // extraTimeDrawData,
      finalFixtureTemplateData,
    } = this.props.commonReducerState;
    let disabledStatus = this.state.competitionStatus == 1;

    return (
      <div>
        {finalsList != null && finalsList.length > 0 && (
          <div className="compitition-finals-venue">
            <InputWithHead required="required-field pb-0" heading={AppConstants.venue} />
            <Form.Item
              name="selectedVenues"
              rules={[{ required: true, message: ValidationConstants.pleaseSelectVenue }]}
            >
              <Select
                mode="multiple"
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={venueSelection => {
                  this.onChangeSetValue(venueSelection, venueList, 'venueList');
                }}
                placeholder={AppConstants.selectVenue}
                filterOption={false}
                onSearch={value => {
                  this.handleSearch(value, appState.mainVenueList);
                }}
                // disabled={compDetailDisable}
              >
                {appState.venueList.map(item => (
                  <Option key={'venue_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}
        <div className="compitition-finals-division">
          {(finalsList || []).map((data, index) => {
            const fixtureTemplate = finalFixtureTemplateData.find((template) => template.id === data.finalsFixtureTemplateRefId);
            return (
              <div key={data.competitionFormatTemplateId}>
                <div className="inside-container-view" style={{ paddingTop: 5 }}>
                  <div>
                    <InputWithHead heading={AppConstants.divisions} />
                    {data.divisions != null ? (
                      <div>
                        {(data.divisions || []).map((div, divIndex) => (
                          <span>
                            <span>{div.divisionName}</span>
                            <span>{data.divisions.length != divIndex + 1 ? ', ' : ''}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{AppConstants.allDivisions}</span>
                    )}
                    <div className="row">
                      <div className="col-sm-6">
                        <InputWithHead
                          heading={AppConstants.finalsStartDateTime}
                          required="required-field"
                        />
                        <Form.Item
                          name={`finalsStartDate${index}`}
                          rules={[
                            {
                              required: true,
                              message: ValidationConstants.finalsStartDateRequired,
                            },
                          ]}
                        >
                          <DatePicker
                            id={AppUniqueId.final_StartDate}
                            disabled={disabledStatus}
                            // size="large"
                            placeholder="dd-mm-yyyy HH:mm"
                            className="w-100"
                            onChange={e =>
                              e &&
                              this.onChangeSetValue(
                                moment(e).format('YYYY-MM-DD HH:mm'),
                                'finalsStartDate',
                                index,
                              )
                            }
                            name="finalsStartDate"
                            format="DD-MM-YYYY HH:mm"
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <InputWithHead
                      headingId={AppUniqueId.final_FixtureTemplate_radioBtn}
                      heading={AppConstants.fixtureTemplate}
                      required="required-field"
                    />
                    {finalTypeRefId == 1 ? (
                      <Form.Item
                        name={`finalsFixtureTemplateRefId${index}`}
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.finalFixtureTemplateRequired,
                          },
                        ]}
                      >
                        <Select
                          disabled={disabledStatus}
                          value={data.finalsFixtureTemplateRefId}
                          onChange={e =>
                            this.onChangeSetValue(e, 'finalsFixtureTemplateRefId', index)
                          }
                        >
                          {(finalFixtureTemplateData || []).map(fix => (
                            <Option key={'finalsFixtureTemplate_' + fix.id} value={fix.id}>
                              {fix.description}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name={`poolTopRefId${index}`}
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.finalFixtureTemplateRequired,
                          },
                        ]}
                      >
                        <Select
                          disabled={disabledStatus}
                          value={data.poolTopRefId}
                          onChange={e => this.onChangeSetValue(e, 'poolTopRefId', index)}
                        >
                          {(this.getFinalFixtureTemplateData(data.hasTop4) || []).map(fix => (
                            <Option key={'poolTop_' + fix.id} value={fix.id}>
                              {fix.description}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}

                    {fixtureTemplate?.name === 'CUSTOM' && (
                      <CustomFinalFixtureTemplate
                        index={index}
                        form={this.formRef.current}
                        customTemplate={data.customFinalTemplates}
                        disabled={disabledStatus}
                        yearRefId={this.state.yearRefId}
                        competitionId={this.state.firstTimeCompId}
                        divisions={data.divisions}
                      />
                    )}

                    {this.isShowPlayOff3rdPosition(data) && (
                      <Checkbox
                        disabled={disabledStatus}
                        className="single-checkbox"
                        checked={data.playOff3rdposition == 1}
                        onChange={e =>
                          this.onChangeSetValue(
                            e.target.checked ? 1 : 0,
                            'playOff3rdposition',
                            index,
                          )
                        }
                      >
                        {AppConstants.playOff3rdPosition}
                      </Checkbox>
                    )}

                    <InputWithHead heading={AppConstants.matchType} required="required-field" />
                    <Form.Item
                      name={`finalsMatchTypeRefId${index}`}
                      rules={[{ required: true, message: ValidationConstants.matchTypeRequired }]}
                    >
                      <Select
                        disabled={disabledStatus}
                        id={AppUniqueId.final_Match_Type_dpdn}
                        className="w-100"
                        style={{ paddingRight: 1, minWidth: 182 }}
                        onChange={matchType =>
                          this.onChangeSetValue(matchType, 'finalsMatchTypeRefId', index)
                        }
                        value={data.finalsMatchTypeRefId}
                      >
                        {(appState.matchTypes || []).map(item => {
                          if (item.name !== 'SINGLE') {
                            return (
                              <Option key={'finalsMatchType_' + item.id} value={item.id}>
                                {item.description}
                              </Option>
                            );
                          }
                          return <></>;
                        })}
                      </Select>
                    </Form.Item>

                    <div className="fluid-width">
                      <div className="row">
                        <div id={AppUniqueId.finals_matchduration} className="col-sm-3">
                          <Form.Item
                            name={`matchDuration${index}`}
                            rules={[
                              {
                                required: true,
                                pattern: new RegExp('^[1-9][0-9]*$'),
                                message: ValidationConstants.matchDuration,
                              },
                            ]}
                          >
                            <InputWithHead
                              auto_complete="new-matchDuration"
                              disabled={disabledStatus}
                              heading={AppConstants.matchDuration}
                              required="required-field"
                              placeholder={AppConstants.mins}
                              value={data.matchDuration}
                              onChange={e =>
                                this.onChangeSetValue(e.target.value, 'matchDuration', index)
                              }
                            />
                          </Form.Item>
                        </div>

                        {(data.finalsMatchTypeRefId == 2 || data.finalsMatchTypeRefId == 3) && (
                          <div id={AppUniqueId.finals_mainbreak} className="col-sm-3">
                            <Form.Item
                              name={`mainBreak${index}`}
                              rules={[{ required: true, message: ValidationConstants.mainBreak }]}
                            >
                              <InputWithHead
                                auto_complete="new-mainBreak"
                                disabled={disabledStatus}
                                heading={AppConstants.mainBreak}
                                required="required-field"
                                placeholder={AppConstants.mins}
                                value={data.mainBreak}
                                onChange={e =>
                                  this.onChangeSetValue(e.target.value, 'mainBreak', index)
                                }
                              />
                            </Form.Item>
                          </div>
                        )}

                        {data.finalsMatchTypeRefId == 3 && (
                          <div id={AppUniqueId.finals_qtrbreak} className="col-sm-3">
                            <Form.Item
                              name={`qtrBreak${index}`}
                              rules={[{ required: true, message: ValidationConstants.qtrBreak }]}
                            >
                              <InputWithHead
                                auto_complete="new-qtrBreak"
                                disabled={disabledStatus}
                                heading={AppConstants.qtrBreak}
                                required="required-field"
                                placeholder={AppConstants.mins}
                                value={data.qtrBreak}
                                onChange={e =>
                                  this.onChangeSetValue(e.target.value, 'qtrBreak', index)
                                }
                              />
                            </Form.Item>
                          </div>
                        )}

                        {data.timeslotGenerationRefId != 2 && (
                          <div className="col-sm-3">
                            <Form.Item
                              name={`timeBetweenGames${index}`}
                              rules={[
                                { required: true, message: ValidationConstants.timeBetweenGames },
                              ]}
                            >
                              <InputWithHead
                                auto_complete="new-timeBetweenGames"
                                disabled={disabledStatus}
                                heading={AppConstants.betweenGames}
                                required="required-field"
                                placeholder={AppConstants.mins}
                                value={data.timeBetweenGames}
                                onChange={e =>
                                  this.onChangeSetValue(e.target.value, 'timeBetweenGames', index)
                                }
                              />
                            </Form.Item>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* <span className="input-heading-add-another">+ {AppConstants.addAnotherFinalFormat}</span> */}
                    {/* <Checkbox
                                          className="single-checkbox pt-2"
                                          defaultChecked={data.isDefault}
                                          onChange={(e) => this.onChangeSetValue(e.target.checked, 'isDefault', index)}
                                      >
                                          {AppConstants.setAsDefault}
                                      </Checkbox> */}
                  </div>

                  {this.extraTimeView(data, index)}
                </div>

                {this.has4Pools(data.whoPlaysWho) && (
                  <div className="inside-container-view" style={{ paddingTop: 5 }}>
                    <span className="input-heading" style={{ fontSize: 18 }}>
                      {AppConstants.poolSettingsWhoPlaysWho}
                    </span>

                    {(data.whoPlaysWho || []).map((whoPlaysWhoItem, whoPlaysWhoIndex) => (
                      <div key={whoPlaysWhoItem.competitiondivisionId}>
                        {whoPlaysWhoItem.noOfPools == 4 && (
                          <div>
                            <InputWithHead
                              heading={AppConstants.division + ' : ' + whoPlaysWhoItem.divisionName}
                              required="pt-0"
                            />
                            <div
                              className="col-md inside-container-view"
                              style={{ padding: 20, marginTop: 7 }}
                            >
                              <div className="row">
                                <div className="col-md-6">
                                  <Form.Item
                                    name={`wpwPool1${whoPlaysWhoIndex}`}
                                    rules={[
                                      {
                                        required: true,
                                        message: ValidationConstants.wpwPool1Required,
                                      },
                                    ]}
                                  >
                                    <Select
                                      disabled={disabledStatus}
                                      value={whoPlaysWhoItem.wpwPool1}
                                      onChange={e =>
                                        this.onChangeSetValue(
                                          e,
                                          'wpwPool1',
                                          index,
                                          whoPlaysWhoIndex,
                                        )
                                      }
                                    >
                                      {(whoPlaysWhoItem.pools || []).map(pool => (
                                        <Option key={'wpwPool1_' + pool.poolId} value={pool.poolId}>
                                          {pool.poolName}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </div>

                                <div className="col-md-6">
                                  <Form.Item
                                    name={`wpwPool2${whoPlaysWhoIndex}`}
                                    rules={[
                                      {
                                        required: true,
                                        message: ValidationConstants.wpwPool2Required,
                                      },
                                    ]}
                                  >
                                    <Select
                                      disabled={disabledStatus}
                                      value={whoPlaysWhoItem.wpwPool2}
                                      onChange={e =>
                                        this.onChangeSetValue(
                                          e,
                                          'wpwPool2',
                                          index,
                                          whoPlaysWhoIndex,
                                        )
                                      }
                                    >
                                      {(whoPlaysWhoItem.pools || []).map(pool => (
                                        <Option key={'wpwPool2_' + pool.poolId} value={pool.poolId}>
                                          {pool.poolName}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </div>
                              </div>
                            </div>
                            <div className="col-md inside-container-view" style={{ padding: 20 }}>
                              <div className="row">
                                <div className="col-md-6">
                                  <Form.Item
                                    name={`wpwPool3${whoPlaysWhoIndex}`}
                                    rules={[
                                      {
                                        required: true,
                                        message: ValidationConstants.wpwPool3Required,
                                      },
                                    ]}
                                  >
                                    <Select
                                      disabled={disabledStatus}
                                      value={whoPlaysWhoItem.wpwPool3}
                                      onChange={e =>
                                        this.onChangeSetValue(
                                          e,
                                          'wpwPool3',
                                          index,
                                          whoPlaysWhoIndex,
                                        )
                                      }
                                    >
                                      {(whoPlaysWhoItem.pools || []).map(pool => (
                                        <Option key={'wpwPool3_' + pool.poolId} value={pool.poolId}>
                                          {pool.poolName}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </div>

                                <div className="col-md-6">
                                  <Form.Item
                                    name={`wpwPool4${whoPlaysWhoIndex}`}
                                    rules={[
                                      {
                                        required: true,
                                        message: ValidationConstants.wpwPool4Required,
                                      },
                                    ]}
                                  >
                                    <Select
                                      disabled={disabledStatus}
                                      value={whoPlaysWhoItem.wpwPool4}
                                      onChange={e =>
                                        this.onChangeSetValue(
                                          e,
                                          'wpwPool4',
                                          index,
                                          whoPlaysWhoIndex,
                                        )
                                      }
                                    >
                                      {(whoPlaysWhoItem.pools || []).map(pool => (
                                        <Option key={'wpwPool4_' + pool.poolId} value={pool.poolId}>
                                          {pool.poolName}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {(finalsList == null || finalsList.length === 0) && (
            <div className="comp-warning-info">{AppConstants.finalsMessage}</div>
          )}
        </div>
      </div>
    );
  };

  extraTimeView = (data, index) => {
    // let finalsList = this.props.competitionFinalsState.competitionFinalsList;
    // let venueList = this.props.competitionFinalsState.competitionVenuesList;
    let appState = this.props.appState;
    let {
      applyToData,
      extraTimeDrawData,
      // finalFixtureTemplateData
    } = this.props.commonReducerState;
    let disabledStatus = this.state.competitionStatus == 1;
    // let detailsData = this.props.competitionFeesState
    return (
      <div>
        {/* {(finalsList || []).map((data, index) => ( */}
        <div>
          <span className="input-heading" style={{ fontSize: 18, paddingBottom: 15 }}>
            {AppConstants.finalExtraTime}
          </span>
          <Form.Item
            name={`applyToRefId${index}`}
            rules={[{ required: true, message: ValidationConstants.applyToRequired }]}
          >
            <Radio.Group
              disabled={disabledStatus}
              id={AppUniqueId.applyToRefId_radiobtn}
              className="reg-competition-radio"
              onChange={e => this.onChangeSetValue(e.target.value, 'applyToRefId', index)}
              value={data.applyToRefId}
            >
              {(applyToData || []).map(app => (
                <Radio key={'applyTo_' + app.id} value={app.id}>
                  {app.description}
                </Radio>
              ))}
              <Radio key={'applyTo_0'} value={0}>
                {AppConstants.none}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {data.applyToRefId !== null && data.applyToRefId !== 0 && (
            <>
              <InputWithHead heading={AppConstants.extraTimeMatchType} required="required-field" />
              <Form.Item
                name={`extraTimeMatchTypeRefId${index}`}
                rules={[
                  { required: true, message: ValidationConstants.extraTimeMatchTypeRequired },
                ]}
              >
                <Select
                  disabled={disabledStatus}
                  id={AppUniqueId.finals_extratimetype_dpdn}
                  className="w-100"
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={matchType =>
                    this.onChangeSetValue(matchType, 'extraTimeMatchTypeRefId', index)
                  }
                  value={data.extraTimeMatchTypeRefId}
                >
                  {(appState.matchTypes || []).map(item => (
                    <Option key={'extraTimeMatchType_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="fluid-width">
                <div className="row">
                  <div id={AppUniqueId.finals_extratime_duration} className="col-sm-3">
                    <Form.Item
                      name={`extraTimeDuration${index}`}
                      rules={[
                        {
                          required: true,
                          pattern: new RegExp('^[1-9][0-9]*$'),
                          message: ValidationConstants.extraTimeDurationRequired,
                        },
                      ]}
                    >
                      <InputWithHead
                        auto_complete="new-extraTimeDuration"
                        disabled={disabledStatus}
                        heading={AppConstants.extraTimeDuration}
                        required="required-field"
                        placeholder={AppConstants.mins}
                        value={data.extraTimeDuration}
                        onChange={e =>
                          this.onChangeSetValue(e.target.value, 'extraTimeDuration', index)
                        }
                      />
                    </Form.Item>
                  </div>
                  {(data.extraTimeMatchTypeRefId == 2 || data.extraTimeMatchTypeRefId == 3) && (
                    <div id={AppUniqueId.finals_extratime_mainbreak} className="col-sm-3">
                      <Form.Item
                        name={`extraTimeMainBreak${index}`}
                        rules={[
                          {
                            required: true,
                            message: ValidationConstants.extraTimeMainBreakRequired,
                          },
                        ]}
                      >
                        <InputWithHead
                          auto_complete="new-extraTimeMainBreak"
                          disabled={disabledStatus}
                          heading={AppConstants.extraTimeMainBreak}
                          required="required-field"
                          placeholder={AppConstants.mins}
                          value={data.extraTimeMainBreak}
                          onChange={e =>
                            this.onChangeSetValue(e.target.value, 'extraTimeMainBreak', index)
                          }
                        />
                      </Form.Item>
                    </div>
                  )}
                  {data.extraTimeMatchTypeRefId == 3 && (
                    <div id={AppUniqueId.finals_extratime_break} className="col-sm-3">
                      <Form.Item
                        name={`extraTimeBreak${index}`}
                        rules={[
                          { required: true, message: ValidationConstants.extraTimeBreakRequired },
                        ]}
                      >
                        <InputWithHead
                          auto_complete="new-extraTimeBreak"
                          disabled={disabledStatus}
                          heading={AppConstants.extraTimeBreak}
                          placeholder={AppConstants.mins}
                          value={data.extraTimeBreak}
                          required="required-field"
                          onChange={e =>
                            this.onChangeSetValue(e.target.value, 'extraTimeBreak', index)
                          }
                        />
                      </Form.Item>
                    </div>
                  )}
                  {data.timeslotGenerationRefId != 2 && (
                    <div className="col-sm-3">
                      <Form.Item
                        name={`beforeExtraTime${index}`}
                        rules={[
                          { required: true, message: ValidationConstants.beforeExtraTimeRequired },
                        ]}
                      >
                        <InputWithHead
                          auto_complete="new-beforeExtraTime"
                          disabled={disabledStatus}
                          heading={AppConstants.beforeExtraTime}
                          placeholder={AppConstants.mins}
                          value={data.beforeExtraTime}
                          required="required-field"
                          onChange={e =>
                            this.onChangeSetValue(e.target.value, 'beforeExtraTime', index)
                          }
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </div>

              {isBasketball ? (
                <div className="mt-4">
                  <span className="input-heading" style={{ fontSize: 18, paddingBottom: 15 }}>
                    {AppConstants.extraTime}
                  </span>
                  <InputWithHead
                    heading={AppConstants.extraTimeIfDraw2}
                    conceptulHelp
                    conceptulHelpMsg={AppConstants.extraTimeIfDraw2Msg}
                    required="required-field pt-0"
                  />
                  <Form.Item
                    name={`extraTimeFor${index}`}
                    rules={[{ required: true, message: ValidationConstants.extraTimeDrawRequired }]}
                  >
                    <Radio.Group
                      disabled={disabledStatus}
                      id={AppUniqueId.extratime_ifDraw_radiobtn}
                      className="reg-competition-radio"
                      onChange={e => this.onChangeSetValue(e.target.value, 'extraTimeFor', index)}
                      value={data.extraTimeFor}
                    >
                      <div className="row mt-0">
                        <div className="col-sm-12 d-flex align-items-center">
                          <Radio value="ONE">{AppConstants.oneExtraTimeForDraw}</Radio>
                        </div>

                        <div className="col-sm-12 d-flex align-items-center">
                          <Radio value="ALL">{AppConstants.extraTimeForAllDraws}</Radio>
                        </div>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="input-heading" style={{ fontSize: 18, paddingBottom: 15 }}>
                    {AppConstants.extraTime}
                  </span>
                  <InputWithHead
                    heading={AppConstants.extraTimeIfDraw2}
                    conceptulHelp
                    conceptulHelpMsg={AppConstants.extraTimeIfDraw2Msg}
                    required="required-field pt-0"
                  />
                  <Form.Item
                    name={`extraTimeDrawRefId${index}`}
                    rules={[{ required: true, message: ValidationConstants.extraTimeDrawRequired }]}
                  >
                    <Radio.Group
                      disabled={disabledStatus}
                      id={AppUniqueId.extratime_ifDraw_radiobtn}
                      className="reg-competition-radio"
                      onChange={e =>
                        this.onChangeSetValue(e.target.value, 'extraTimeDrawRefId', index)
                      }
                      value={data.extraTimeDrawRefId}
                    >
                      {(extraTimeDrawData || []).map(ex => (
                        <Radio key={'extraTimeDraw_' + ex.id} value={ex.id}>
                          {ex.description}
                        </Radio>
                      ))}
                      {process.env.REACT_APP_FLAVOUR !== FLAVOUR.Basketball && (
                        <Radio key="extraTimeDraw_0" value={0}>
                          {AppConstants.none}
                        </Radio>
                      )}
                    </Radio.Group>
                  </Form.Item>
                </div>
              )}
            </>
          )}
        </div>
        {/* ))} */}
      </div>
    );
  };

  // footer view containing all the buttons like submit and cancel
  footerView = () => {
    let finalsList = this.props.competitionFinalsState.competitionFinalsList;
    let activeDrawsRoundsData = this.props.drawsState.activeDrawsRoundsData;
    let isPublished = this.state.competitionStatus == 1;
    return (
      <div className="fluid-width">
        {finalsList != null && finalsList.length > 0 && (
          <div className="footer-view">
            <div className="row">
              <div className="col-sm">
                <div className="reg-add-save-button">
                  <NavLink to="/competitionFormat">
                    <Button disabled={isPublished} className="cancelBtnWidth" type="cancel-button">
                      {AppConstants.back}
                    </Button>
                  </NavLink>
                </div>
                {/* <Button type="cancel-button">Cancel</Button> */}
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
                    visible={this.state.tooltipVisibleDelete}
                    title={AppConstants.statusPublishHover}
                  >
                    <Button
                      id={AppUniqueId.finalCreateDrawsBtn}
                      disabled={isPublished}
                      style={{ height: isPublished && '100%', borderRadius: isPublished && 6 }}
                      className="open-reg-button"
                      type="primary"
                      htmlType="submit"
                    >
                      Create Draft Draw
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    );
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="10" />

        <Layout>
          {this.headerView()}

          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveCompetitionFinals}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
              this.onFinishFailed();
            }}
            noValidate="noValidate"
          >
            <Content>
              {this.dropdownView()}
              <div className="formView-finals">{this.contentView()}</div>

              {/* <div className="formView-finals">
                                {this.extraTimeView(getFieldDecorator)}
                            </div> */}
              <Loader visible={this.state.loading} />
            </Content>

            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getCompetitionFinalsAction,
      saveCompetitionFinalsAction,
      getMatchTypesAction,
      updateCompetitionFinalsAction,
      getYearAndCompetitionOwnAction,
      generateDrawAction,
      clearYearCompetitionAction,
      getTemplateDownloadAction,
      getApplyToAction,
      getExtraTimeDrawAction,
      getFinalFixtureTemplateAction,
      getVenuesTypeAction,
      getActiveRoundsAction,
      searchVenueList,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFinalsState: state.CompetitionFinalsState,
    competitionModuleState: state.CompetitionModuleState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
    drawsState: state.CompetitionDrawsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionFinals);

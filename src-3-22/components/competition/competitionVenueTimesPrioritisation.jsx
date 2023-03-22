import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Select,
  Radio,
  DatePicker,
  Form,
  TimePicker,
  Tooltip,
  Modal,
  Input,
} from 'antd';
import CustomTooltip from 'react-png-tooltip';
import { NavLink } from 'react-router-dom';
import './competition.css';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import InputWithHead from '../../customComponents/InputWithHead';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { getAffiliateOurOrganisationIdAction } from '../../store/actions/userAction/userAction';
import {
  venueConstraintListAction,
  updateVenuListAction,
  updateVenuAndTimeDataAction,
  updateVenueConstraintsData,
  venueConstraintPostAction,
  clearVenueTimesDataAction,
  removePrefencesObjectAction,
  clearVenueDataAction,
} from '../../store/actions/competitionModuleAction/venueTimeAction';
import {
  getYearAndCompetitionOwnAction,
  clearYearCompetitionAction,
} from '../../store/actions/appAction';
import { getVenuesTypeAction, searchVenueList, clearFilter } from '../../store/actions/appAction';
import { venueListAction, getCommonRefData } from '../../store/actions/commonAction/commonAction';
import { isArrayNotEmpty } from '../../util/helpers';
import history from '../../util/history';
import ValidationConstant from '../../themes/validationConstant';
import {
  setOwn_competition,
  getOwn_competition,
  getOwn_competitionStatus,
  setOwn_competitionStatus,
  getOwn_CompetitionFinalRefId,
  setOwn_CompetitionFinalRefId,
  setGlobalYear,
  getGlobalYear,
  getOrganisationData,
} from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import AppUniqueId from '../../themes/appUniqueId';
import { getDivisionFieldConfigAction } from '../../store/actions/commonAction/commonAction';
import { saveCompetitionDivisionsAction } from '../../store/actions/competitionModuleAction/competitionDashboardAction';
import { isEqual } from 'lodash';
import { COURTROTATION_MAIN, COURTROTATION_SUB, PreferenceSetBy } from 'util/enums';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const FIELD_SIZES_COUNT = 4;

class CompetitionVenueTimesPrioritisation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      homeTeamRotation: 'rotateTeam',
      loading: false,
      getDataLoading: false,
      saveContraintLoad: false,
      yearRefId: null,
      firstTimeCompId: null,
      evenRotationFlag: false,
      homeTeamRotationFlag: false,
      deleteModalVisible: false,
      currentIndex: 0,
      currentModal: '',
      competitionStatus: 0,
      tooltipVisibleDelete: false,
      isQuickCompetition: false,
      onNextClicked: false,
      addOrRemoveVenues: false,
      finalTypeRefId: null,
      competitionId: null,
    };

    this.formRef = React.createRef();
  }

  async componentDidMount() {
    this.props.getDivisionFieldConfigAction();
    this.props.updateVenueConstraintsData(null, null, 'clearData', this.props.location.state);
    this.props.getVenuesTypeAction('all');
    let yearId = getGlobalYear();
    let storedCompetitionId = getOwn_competition();
    let storedCompetitionStatus = getOwn_competitionStatus();
    let storedfinalTypeRefId = getOwn_CompetitionFinalRefId();
    let propsData =
      this.props.appState.own_YearArr.length > 0 ? this.props.appState.own_YearArr : undefined;
    // const compId = storedCompetitionId || this.props.appState.own_CompetitionArr[0].id;
    let compData =
      this.props.appState.own_CompetitionArr.length > 0
        ? this.props.appState.own_CompetitionArr
        : undefined;
    if (yearId && storedCompetitionId && propsData && compData) {
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
        competitionId: storedCompetitionId || null,
      });
      this.props.venueConstraintListAction(yearId, storedCompetitionId, 1);
    } else {
      if (yearId !== undefined) {
        await this.props.getYearAndCompetitionOwnAction(
          this.props.appState.own_YearArr,
          yearId,
          'own_competition',
        );
        this.setState({
          // yearRefId: JSON.parse(yearId),
          competitionId:
            !!this.props.appState.own_CompetitionArr &&
            this.props.appState.own_CompetitionArr.length
              ? this.props.appState.own_CompetitionArr[0].competitionId
              : this.state.firstTimeCompId
              ? this.state.firstTimeCompId
              : null,
        });
      } else {
        await this.props.getYearAndCompetitionOwnAction(
          this.props.appState.own_YearArr,
          null,
          'own_competition',
        );
        this.setState({
          competitionId:
            !!this.props.appState.own_CompetitionArr &&
            this.props.appState.own_CompetitionArr.length
              ? this.props.appState.own_CompetitionArr[0].competitionId
              : this.state.firstTimeCompId
              ? this.state.firstTimeCompId
              : null,
        });
      }
    }
    this.syncDivisionsFieldsConfigurationsFormData();
    // this.setState({ loading: false })
    const orgUniqueKey = JSON.parse(
      localStorage.getItem('setOrganisationData'),
    ).organisationUniqueKey;
    this.apiCalls(orgUniqueKey);
  }

  apiCalls = async organisationId => {
    this.props.getAffiliateOurOrganisationIdAction(organisationId);
  };

  componentDidUpdate(prevProps) {
    const { venueConstrainstData } = this.props.venueTimeState;

    if (!isEqual(prevProps.commonReducerState, this.props.commonReducerState)) {
      this.setState({ filterDrop: this.props.commonReducerState.venueList });
    }
    if (!isEqual(prevProps.appState, this.props.appState)) {
      // let year_id = ""
      // if (yearList.length > 0) {
      //     year_id = storedYearID ? storedYearID : yearList[0].id
      // }
      let competitionList = this.props.appState.own_CompetitionArr;
      if (!isEqual(prevProps.appState.own_CompetitionArr, competitionList)) {
        if (competitionList && competitionList.length > 0) {
          // let competitionId = null

          let competitionId = competitionList[0]?.competitionId;

          let statusRefId = competitionList[0]?.statusRefId;
          let finalTypeRefId = competitionList[0]?.finalTypeRefId;
          setOwn_competition(competitionId);
          setOwn_competitionStatus(statusRefId);
          setOwn_CompetitionFinalRefId(finalTypeRefId);
          let yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
          let quickComp =
            this.props.appState.own_CompetitionArr && this.props.appState.own_CompetitionArr.length
              ? this.props.appState.own_CompetitionArr.find(
                  x => x?.competitionId == competitionId && x?.isQuickCompetition == 1,
                )
              : null;
          if (competitionId && yearId)
            this.props.venueConstraintListAction(yearId, competitionId, 1);
          this.setState({
            getDataLoading: true,
            loading: false,
            competitionId,
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            isQuickCompetition: quickComp != undefined,
            finalTypeRefId: finalTypeRefId,
            yearRefId: JSON.parse(yearId),
          });
        }
      }
    }

    if (this.state.loading && this.props.appState.onLoad === false) {
      if (this.state.yearRefId && this.state.firstTimeCompId)
        this.props.venueConstraintListAction(this.state.yearRefId, this.state.firstTimeCompId, 1);
      this.setState({ loading: false, getDataLoading: true });
    }

    if (!isEqual(prevProps.venueConstrainstData, venueConstrainstData)) {
      if (this.state.getDataLoading && this.props.venueTimeState.onVenueSuccess == false) {
        this.setDetailsFieldValue();
        this.setState({ getDataLoading: false });
      }
    }

    if (!isEqual(prevProps.venueTimeState, this.props.venueTimeState)) {
      if (this.props.venueTimeState.onLoad == false && this.state.saveContraintLoad) {
        this.setState({ saveContraintLoad: false });
        if (this.state.firstTimeCompId && this.state.yearRefId)
          this.props.venueConstraintListAction(this.state.yearRefId, this.state.firstTimeCompId, 1);
        this.setState({ loading: false, getDataLoading: true });
      }
    }

    if (this.props.venueTimeState.onLoad === false && this.state.saveContraintLoad === true) {
      if (!this.props.venueTimeState.error) {
        if (this.state.onNextClicked === true) {
          this.setState({
            onNextClicked: false,
            saveContraintLoad: false,
          });
          let competitionList = this.props.appState.own_CompetitionArr;
          let compExist = competitionList.find(
            x =>
              x.competitionId == this.state.firstTimeCompId &&
              x.allowTeamPreferences == 1 &&
              x.preferencesSetByRefId == PreferenceSetBy.CompetitionOrganiserToSet,
          );
          if (compExist) {
            history.push('/competitionTeamPreference');
          } else {
            history.push('/competitionFormat');
          }
        } else {
          this.setState({ saveContraintLoad: false });
        }
      } else {
        this.setState({
          onNextClicked: false,
          saveContraintLoad: false,
        });
      }
    }

    if (this.state.addOrRemoveVenues) {
      let courtPreferences = this.props.venueTimeState.venueConstrainstData.courtPreferences;
      for (let index in courtPreferences) {
        this.formRef.current.setFieldsValue({
          [`courtIDS${index}`]: courtPreferences[index].venueCourtId,
          [`venueIDS${index}`]: courtPreferences[index].venueId,
        });
      }
      this.setState({ addOrRemoveVenues: false });
    }

    if (venueConstrainstData?.competitionDivisionsFieldsConfigurations.length) {
      this.syncDivisionsFieldsConfigurationsFormData();
    }
  }

  syncDivisionsFieldsConfigurationsFormData = () => {
    const {
      venueTimeState: {
        venueConstrainstData: { fieldLinkage },
      },
    } = this.props;

    fieldLinkage.forEach(field => {
      const key = `divisionsFieldsConfigurations_${FIELD_SIZES_COUNT - field.row}`;

      if (this.formRef && this.formRef.current)
        this.formRef.current.setFieldsValue({
          [key]: field.divisions,
        });
    });
  };

  // for set default values
  setDetailsFieldValue() {
    let allData = this.props.venueTimeState.venueConstrainstData;

    ////Non playing dates value
    // if (allData.nonPlayingDates.length > 0) {
    //     allData.nonPlayingDates.forEach((item, index) => {
    //         let name = `name${index}`;
    //         let date = `date${index}`;
    //         this.formRef.current.setFieldsValue({
    //             [name]: item.name,
    //             [date]: moment(item.nonPlayingDate)
    //         });
    //     });
    // }

    ////Court preferences value
    if (allData.courtPreferences.length > 0) {
      allData.courtPreferences.forEach((item, index) => {
        let courtIDS = `courtIDS${index}`;
        let venueIDS = `venueIDS${index}`;
        let entitiesDivisionId = `entitiesDivisionId${index}`;
        let entitiesGradeId = `entitiesGradeId${index}`;
        this.formRef.current.setFieldsValue({
          [courtIDS]: item.venueCourtId,
          [venueIDS]: item.venueId,
          [entitiesDivisionId]: item.entitiesDivisionId,
          [entitiesGradeId]: item.entitiesGradeId,
        });
      });
    }
  }

  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.venues}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  async onYearClick(yearId) {
    setGlobalYear(yearId);
    setOwn_competition(undefined);
    setOwn_competitionStatus(undefined);
    setOwn_CompetitionFinalRefId(undefined);
    this.setState({
      yearRefId: yearId,
      firstTimeCompId: null,
      competitionStatus: 0,
      finalTypeRefId: null,
    });
    await this.props.getYearAndCompetitionOwnAction(
      this.props.appState.own_YearArr,
      yearId,
      'own_competition',
    );

    if (this.props.appState.own_CompetitionArr?.length > 0) {
      this.setState({ competitionId: this.props.appState.own_CompetitionArr[0].competitionId });
    }
  }

  onCompetitionClick(competitionId) {
    let own_CompetitionArr = this.props.appState.own_CompetitionArr;
    let statusIndex =
      own_CompetitionArr && own_CompetitionArr.length
        ? own_CompetitionArr.findIndex(x => x.competitionId == competitionId)
        : -1;
    let statusRefId =
      statusIndex >= 0 && own_CompetitionArr && own_CompetitionArr.length > statusIndex
        ? own_CompetitionArr[statusIndex]?.statusRefId
        : null;
    let finalTypeRefId =
      statusIndex >= 0 && own_CompetitionArr && own_CompetitionArr.length > statusIndex
        ? own_CompetitionArr[statusIndex]?.finalTypeRefId
        : null;
    const competitionNumberId =
      statusIndex >= 0 && own_CompetitionArr && own_CompetitionArr.length > statusIndex
        ? own_CompetitionArr[statusIndex].competitionId
        : null;

    setOwn_competition(competitionId);
    setOwn_competitionStatus(statusRefId);
    setOwn_CompetitionFinalRefId(finalTypeRefId);
    let quickComp = this.props.appState.own_CompetitionArr.find(
      x => x.competitionId == competitionId && x.isQuickCompetition == 1,
    );
    this.setState({
      competitionId: competitionNumberId,
      firstTimeCompId: competitionId,
      competitionStatus: statusRefId,
      isQuickCompetition: quickComp != undefined,
      finalTypeRefId: finalTypeRefId,
    });
    this.props.clearVenueTimesDataAction(competitionId);

    if (this.props.venueTimeState.onVenueDataClear) {
      this.setState({ loading: true });
    }
  }

  dropdownView = () => {
    const { own_YearArr, own_CompetitionArr } = this.props.appState;

    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3">
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  id={AppUniqueId.compYear_dpdnVenues}
                  className="year-select reg-filter-select-year ml-2"
                  style={{ width: 90 }}
                  onChange={year => this.onYearClick(year)}
                  value={this.state.yearRefId}
                >
                  {own_YearArr.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-3 pb-3">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  id={AppUniqueId.CompetitionName_dpdnVenues}
                  className="year-select reg-filter-select-competition ml-2"
                  onChange={(competitionId, e) => this.onCompetitionClick(competitionId, e.key)}
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

  nonPlayingDatesView(item, index) {
    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            <Form.Item
              name={`name${index}`}
              rules={[{ required: true, message: ValidationConstant.nameField[2] }]}
            >
              <InputWithHead
                auto_complete="new-name"
                placeholder={AppConstants.name}
                onChange={name => {
                  this.props.updateVenueConstraintsData(
                    name.target.value,
                    index,
                    'name',
                    'nonPlayingDates',
                  );
                }}
                value={item.name}
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <Form.Item
              name={`date${index}`}
              rules={[{ required: true, message: ValidationConstant.dateField }]}
            >
              <DatePicker
                className="comp-dashboard-botton-view-mobile w-100"
                // size="large"
                format="DD/MM/YYYY"
                placeholder="dd-mm-yyyy"
                showTime={false}
                onChange={date =>
                  this.props.updateVenueConstraintsData(
                    moment(date).format('YYYY-MM-DD'),
                    index,
                    'nonPlayingDate',
                    'nonPlayingDates',
                  )
                }
                value={item.nonPlayingDate && moment(item.nonPlayingDate)}
              />
            </Form.Item>
          </div>
          <div className="col-sm-2 delete-image-view pb-4">
            <span
              className="user-remove-btn"
              onClick={() => this.props.removePrefencesObjectAction(index, item, 'nonPlayingDates')}
            >
              <i className="fa fa-trash-o" aria-hidden="true" />
            </span>
            <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
          </div>
        </div>
      </div>
    );
  }

  nonPlayingDatesContainer() {
    const { venueConstrainstData } = this.props.venueTimeState;
    let nonPlayingDatesList = venueConstrainstData ? venueConstrainstData.nonPlayingDates : [];
    return (
      <div className="inside-container-view pt-3">
        <InputWithHead heading={AppConstants.nonPlayingDates} />

        {isArrayNotEmpty(nonPlayingDatesList) &&
          nonPlayingDatesList.map((item, index) => {
            return <div className="col-sm mt-3">{this.nonPlayingDatesView(item, index)}</div>;
          })}

        <span
          style={{ cursor: 'pointer' }}
          onClick={() =>
            this.props.updateVenueConstraintsData(
              null,
              null,
              'nonPlayingDates',
              'addAnotherNonPlayingDate',
            )
          }
          className="input-heading-add-another"
        >
          + {AppConstants.addAnotherNonPlayingDate}
        </span>
      </div>
    );
  }

  removePreferencesObjectAction = (index, item) => {
    this.props.removePrefencesObjectAction(index, item, 'courtPreferences');
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 500);
  };

  getVenueSelect = (index, item) => {
    const { selectedVenueId } = this.props.venueTimeState;
    const { mainVenueList } = this.props.appState;
    let venueList = [];
    if (mainVenueList.length) {
      venueList = mainVenueList.filter(venue => selectedVenueId.includes(venue.id));
    }
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <>
        <InputWithHead
          heading={AppConstants.venue}
          headingId={AppUniqueId.CourtPreferences_AllocSameCourt_CourtID}
        />
        <Form.Item
          name={`venueIDS${index}`}
          rules={[{ required: true, message: ValidationConstant.venueField }]}
        >
          <Select
            disabled={disabledStatus}
            className="w-100"
            style={{ minWidth: 182 }}
            placeholder={AppConstants.selectVenue}
            onChange={venueId =>
              this.props.updateVenueConstraintsData(venueId, index, 'venueId', 'venuePreferences')
            }
          >
            {venueList.map(item => (
              <Option key={'venue_' + item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item noStyle name={`venueConstraintCourtPreferenceId_${index}`}>
          <Input hidden></Input>
        </Form.Item>
      </>
    );
  };

  getCourtSelect = index => {
    const { courtArray } = this.props.venueTimeState;
    let courtList = isArrayNotEmpty(courtArray) ? courtArray : [];
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <>
        <InputWithHead
          heading={AppConstants.court}
          headingId={AppUniqueId.CourtPreferences_AllocSameCourt_CourtID}
        />
        <Form.Item
          name={`courtIDS${index}`}
          rules={[{ required: true, message: ValidationConstant.courtFieldLatitude }]}
        >
          <Select
            disabled={disabledStatus}
            className="w-100"
            style={{ minWidth: 182 }}
            placeholder={AppConstants.selectCourt}
            onChange={venueCourtId =>
              this.props.updateVenueConstraintsData(
                venueCourtId,
                index,
                'venueCourtId',
                'courtPreferences',
              )
            }
          >
            {courtList.map(item => (
              <Option key={'venue_' + item.venueId} value={item.venueId}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    );
  };

  divisionView(item, index, entityType) {
    const { divisionList, gradeList, selectedRadioBtn } = this.props.venueTimeState;
    let divisionsList = isArrayNotEmpty(divisionList) ? divisionList : [];
    let gradesList = isArrayNotEmpty(gradeList) ? gradeList : [];
    let disabledStatus = this.state.competitionStatus == 1;

    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            {selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE_VENUE
              ? this.getVenueSelect(index)
              : this.getCourtSelect(index)}
          </div>
          {entityType == COURTROTATION_SUB.ALLOCATE_DIVISIONS ||
          entityType == COURTROTATION_SUB.ALLOCATE_VENUE_DIVISIONS ? (
            <div className="col-sm">
              <InputWithHead
                heading={AppConstants.division}
                headingId={AppUniqueId.CourtPreferences_AllocSameCourt_AddAnotherCourt_DivisionID}
              />
              <Form.Item
                name={`entitiesDivisionId${index}`}
                rules={[{ required: true, message: ValidationConstant.divisionFieldRequired }]}
              >
                <Select
                  disabled={disabledStatus}
                  mode="multiple"
                  className="w-100 d-grid align-items-center"
                  style={{ minWidth: 182 }}
                  placeholder={AppConstants.selectDivision}
                  onChange={venueCourtId =>
                    this.props.updateVenueConstraintsData(
                      venueCourtId,
                      index,
                      'entitiesDivision',
                      'courtPreferences',
                    )
                  }
                  // value={item.entitiesDivisionId}
                >
                  {divisionsList.map(item => (
                    <Option
                      key={'compMemProdDiv_' + item.competitionMembershipProductDivision}
                      value={item.competitionMembershipProductDivision}
                    >
                      {item.divisionName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          ) : (
            <div className="col-sm">
              <InputWithHead heading={AppConstants.grade} />
              <Form.Item
                name={`entitiesGradeId${index}`}
                rules={[{ required: true, message: ValidationConstant.gradeFieldRequired }]}
              >
                <Select
                  disabled={disabledStatus}
                  mode="multiple"
                  className="w-100 d-grid align-items-center"
                  style={{ minWidth: 182 }}
                  placeholder={AppConstants.selectGrade}
                  // value={item.entitiesGradeId}
                  onChange={venueCourtId =>
                    this.props.updateVenueConstraintsData(
                      venueCourtId,
                      index,
                      'entitiesGrade',
                      'courtPreferences',
                    )
                  }
                >
                  {gradesList.map(item => (
                    <Option
                      key={'compDivGrade_' + item.competitionDivisionGradeId}
                      value={item.competitionDivisionGradeId}
                    >
                      {item.gradeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          )}

          <div className="col-sm-1 pb-4">
            <InputWithHead heading={<div>&nbsp;</div>} />
            <div
              className=" delete-image-view pb-4"
              onClick={() =>
                disabledStatus == false && this.removePreferencesObjectAction(index, item)
              }
            >
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  gradeView() {
    const { courtArray, gradeList } = this.props.venueTimeState;
    let gradesList = isArrayNotEmpty(gradeList) ? gradeList : [];
    return (
      // <div className="fluid-width">
      <div className="row">
        <div className="col-sm">
          <InputWithHead heading="Court" />
          <Select
            className="w-100"
            style={{ minWidth: 182 }}
            placeholder={AppConstants.selectCourt}
          >
            {courtArray.map(item => (
              <Option key={'court_' + item.venueCourtId} value={item.venueCourtId}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="col-sm">
          <InputWithHead heading="Grade" />
          <Select
            mode="tags"
            className="w-100 d-grid align-items-center"
            style={{ minWidth: 182 }}
            placeholder={AppConstants.selectGrade}
          >
            {gradesList.map(item => (
              <Option
                key={'compDivGrade_' + item.competitionDivisionGradeId.toString()}
                value={item.competitionDivisionGradeId.toString()}
              >
                {item.gradeName}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      // </div>
    );
  }

  courtPreferenceView() {
    const { venueConstrainstData, evenRotation, selectedRadioBtn } = this.props.venueTimeState;
    const courtRotationId = evenRotation;
    const courtPreferencesList = isArrayNotEmpty(venueConstrainstData.courtPreferences)
      ? venueConstrainstData.courtPreferences
      : [];
    const disabledStatus = this.state.competitionStatus === 1;

    return (
      <div>
        <InputWithHead
          heading={
            selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE_VENUE
              ? AppConstants.venuePreferences
              : AppConstants.courtPreferences
          }
        />
        <div className="comp-venue-time-inside-container-view">
          {courtPreferencesList.map((item, index) => (
            <div key={index} className="col-sm">
              {this.divisionView(item, index, courtRotationId)}
            </div>
          ))}

          <span
            id={AppUniqueId.CourtPreferences_AddAnotherCourtPreference_btn}
            style={{ cursor: 'pointer' }}
            onClick={
              disabledStatus == false
                ? () => {
                    this.props.updateVenueConstraintsData(
                      null,
                      courtRotationId,
                      'courtPreferences',
                      'addCourtPreferences',
                    );
                    this.setDetailsFieldValue();
                  }
                : () => {}
            }
            className="input-heading-add-another"
          >
            + {AppConstants.addAnother}
          </span>
        </div>
      </div>
    );
  }

  getReferenceTitle = ItemArr => {
    if (ItemArr.name === 'EVEN_GRADES' && this.state.finalTypeRefId == 2) {
      return AppConstants.pools;
    } else if (ItemArr.name === 'ALLOCATE_GRADES' && this.state.finalTypeRefId == 2) {
      return AppConstants.pools;
    } else {
      return ItemArr.description;
    }
  };

  homeTeamRotationView() {
    const { venueConstrainstData, homeTeamRotation } = this.props.venueTimeState;
    let homeTeamRotationList = isArrayNotEmpty(homeTeamRotation) ? homeTeamRotation : [];
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <div>
        <span className="applicable-to-heading required-field">
          {AppConstants.competitionVenueAllocation + ':'}
        </span>

        <Radio.Group
          disabled={disabledStatus}
          className="reg-competition-radio"
          onChange={e => {
            this.setState({ homeTeamRotationFlag: false });
            this.props.updateVenueConstraintsData(e.target.value, null, '', 'homeRotationValue');
          }}
          value={venueConstrainstData && venueConstrainstData.homeTeamRotationRefId}
          // value={homeRotation}
          // defaultValue={homeRotation}
        >
          {homeTeamRotationList.map(item => (
            <div key={item.id} className="contextualHelp-RowDirection">
              <Radio id={this.getCourtRotationId(item.id, 'homeTeamRotation')} value={item.id}>
                {item.description}
              </Radio>

              {item.helpMsg && (
                <div className="mt-2 ml-n22">
                  <CustomTooltip>
                    <span>{item.helpMsg}</span>
                  </CustomTooltip>
                </div>
              )}
            </div>
          ))}
        </Radio.Group>
        {this.state.homeTeamRotationFlag && (
          <div className="venue-cons-err">{ValidationConstant.homeTeamRotationRequired}</div>
        )}
      </div>
    );
  }

  isDivisionFieldSelected = (divisionId, row) => {
    const {
      venueConstrainstData: { fieldLinkage },
    } = this.props.venueTimeState;

    const notDisabled = [
      ...fieldLinkage[FIELD_SIZES_COUNT - 1].divisions,
      ...fieldLinkage[row].divisions,
    ];
    return !notDisabled.includes(divisionId);
  };

  divisionFieldRow = (field, rowIndex) => {
    const { venueTimeState } = this.props;
    const { divisionGrades = [], fieldLinkage } = venueTimeState.venueConstrainstData;
    const fieldValues = fieldLinkage[rowIndex].divisions || [];

    return (
      <div key={field.description} className="row mt-4 align-items-center">
        <div className="col-sm-3">
          <div className="applicable-to-heading pt-0 pl-sm-4">{field.description}</div>
        </div>
        <div className="col-sm-9">
          <Form.Item name={`divisionsFieldsConfigurations_${field.id}`}>
            <Select
              mode="multiple"
              style={{ width: '100%', paddingRight: 1, minWidth: 182 }}
              value={fieldValues}
              onChange={divisions => this.setDivisionsFieldsConfigurations(rowIndex, divisions)}
            >
              {(divisionGrades || []).map(div => (
                <Option
                  key={'compMemProdDiv_' + div.competitionMembershipProductDivisionId}
                  value={div.competitionMembershipProductDivisionId}
                  disabled={this.isDivisionFieldSelected(
                    div.competitionMembershipProductDivisionId,
                    rowIndex,
                  )}
                >
                  {div.divisionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
    );
  };

  divisionOfFieldLinkageView = () => {
    const { divisionFieldConfigList } = this.props.commonReducerState;
    const sortedDivisionFieldConfigList = [...divisionFieldConfigList].sort((a, b) => {
      return b.sortOrder - a.sortOrder;
    });
    return (
      <div className="formView">
        <div className="content-view">
          <span className="text-heading-large mb-5">
            {AppConstants.divisionToFieldLinkage + ':'}
          </span>

          <div className="form-group">
            <div className="row mt-4">
              <div className="col-sm-3">
                <div className="applicable-to-heading pt-0">{AppConstants.fieldSizes + ':'}</div>
              </div>
              <div className="col-sm-9">
                <div className="applicable-to-heading pt-0">
                  {AppConstants.ages + ' / ' + AppConstants.divisions + ':'}
                </div>
              </div>
            </div>

            {sortedDivisionFieldConfigList.map((field, rowIndex) => {
              const isRowFull = field.description === 'Full';

              return isRowFull ? (
                <div key={field.description} className="row mt-4 align-items-center">
                  <div className="col-sm-3">
                    <div className="applicable-to-heading pt-0 pl-sm-4">{field.description}</div>
                  </div>
                  <div className="col-sm-9">
                    {'All other ' + AppConstants.divisions + ' will default to Full'}
                  </div>
                </div>
              ) : (
                this.divisionFieldRow(field, rowIndex)
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  getCourtRotationId(data, key) {
    switch (key) {
      case 'courtRotation':
        switch (data) {
          case COURTROTATION_MAIN.EVEN:
            return AppUniqueId.CourtPreferences_EvenRotation;
          case COURTROTATION_MAIN.ALLOCATE:
            return AppUniqueId.CourtPreferences_AllocSameCourt;
          case COURTROTATION_MAIN.NONE:
            return AppUniqueId.CourtPreferences_NoPreference;
          case COURTROTATION_MAIN.ALLOCATE_VENUE:
            return AppUniqueId.CourtPreferences_AllocSameVenue;
          default:
            break;
        }
        break;
      case 'subPref1':
        switch (data) {
          case 2:
            return AppUniqueId.CourtPreferences_Divisions_EvenRotation;
          case 3:
            return AppUniqueId.CourtPreferences_Grades_EvenRotation;
          case 4:
            return AppUniqueId.CourtPreferences_Teams_EvenRotation;
          default:
            break;
        }
        break;
      case 'subPref2':
        switch (data) {
          case COURTROTATION_SUB.ALLOCATE_DIVISIONS:
            return AppUniqueId.CourtPreferences_AllocSameCourt_Divisions;
          case COURTROTATION_SUB.ALLOCATE_GRADES:
            return AppUniqueId.CourtPreferences_AllocSameCourt_Grades;
          case COURTROTATION_SUB.ALLOCATE_VENUE_DIVISIONS:
            return AppUniqueId.CourtPreferences_AllocSameVenue_Divisions;
          case COURTROTATION_SUB.ALLOCATE_VENUE_GRADES:
            return AppUniqueId.CourtPreferences_AllocSameVenue_Grades;
          default:
            break;
        }
        break;
      case 'homeTeamRotation':
        switch (data) {
          case 1:
            return AppUniqueId.homeAndAwayComp;
          case 2:
            return AppUniqueId.centreVenueComp;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  getAllocateSameCourtList = () => {
    const { courtRotation, selectedRadioBtn } = this.props.venueTimeState;
    if (!isArrayNotEmpty(courtRotation)) {
      return [];
    }
    let subRotations = [];
    let rotation = null;
    if (selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE) {
      rotation = courtRotation.find(r => r.id == COURTROTATION_MAIN.ALLOCATE);
    } else if (selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE_VENUE) {
      rotation = courtRotation.find(r => r.id == COURTROTATION_MAIN.ALLOCATE_VENUE);
    }
    if (rotation) {
      subRotations = rotation.subReferences || [];
    }
    return subRotations;
  };

  anyGradePrefenceView() {
    const { courtRotation, evenRotation, selectedRadioBtn } = this.props.venueTimeState;
    let courtRotationList = isArrayNotEmpty(courtRotation) ? courtRotation : [];
    let evenRotaionList = isArrayNotEmpty(courtRotation) ? courtRotation[0].subReferences : [];
    let allocateSameCourtList = this.getAllocateSameCourtList();
    let disabledStatus = this.state.competitionStatus == 1;

    return (
      <div>
        <span className="applicable-to-heading required-field">
          {AppConstants.anyGradePreference}
        </span>

        <Radio.Group
          disabled={disabledStatus}
          className="reg-competition-radio"
          onChange={e => {
            this.setState({ evenRotationFlag: false });
            this.props.updateVenueConstraintsData(
              e.target.value,
              null,
              'courtPreferences',
              'courtParentSelection',
            );
          }}
          value={selectedRadioBtn}
        >
          {courtRotationList.map((item, index) => (
            <div key={item.id}>
              <div className="contextualHelp-RowDirection">
                <Radio id={this.getCourtRotationId(item.id, 'courtRotation')} value={item.id}>
                  {item.description}
                </Radio>
                {item.helpMsg && (
                  <div className="mt-2 ml-n22">
                    <CustomTooltip>
                      <span>{item.helpMsg}</span>
                    </CustomTooltip>
                  </div>
                )}
              </div>

              {item.selectedPrefrence == COURTROTATION_MAIN.EVEN && (
                <div className="ml-5">
                  <Radio.Group
                    disabled={disabledStatus}
                    className="reg-competition-radio"
                    onChange={e =>
                      this.props.updateVenueConstraintsData(
                        e.target.value,
                        null,
                        '',
                        'evenRotationValue',
                        index,
                      )
                    }
                    value={evenRotation}
                  >
                    {evenRotaionList.map(item => (
                      <Radio
                        id={this.getCourtRotationId(item.id, 'subPref1')}
                        key={'evenRotation_' + item.id}
                        value={item.id}
                      >
                        {this.getReferenceTitle(item)}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              )}

              {(item.selectedPrefrence == COURTROTATION_MAIN.ALLOCATE ||
                item.selectedPrefrence == COURTROTATION_MAIN.ALLOCATE_VENUE) && (
                <div className="ml-5">
                  <Radio.Group
                    disabled={disabledStatus}
                    className="reg-competition-radio"
                    onChange={e =>
                      this.props.updateVenueConstraintsData(
                        e.target.value,
                        null,
                        'evenRotation',
                        'radioButtonValue',
                      )
                    }
                    value={evenRotation}
                  >
                    {allocateSameCourtList.map(item => (
                      <Radio
                        id={this.getCourtRotationId(item.id, 'subPref2')}
                        key={'evenRotation_' + item.id}
                        value={item.id}
                      >
                        {this.getReferenceTitle(item)}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              )}
            </div>
          ))}
        </Radio.Group>

        {this.state.evenRotationFlag && (
          <div className="venue-cons-err">{ValidationConstant.courtRotationRequired}</div>
        )}
      </div>
    );
  }

  handleSearch = (value, data) => {
    // const filteredData = data.filter(memo => {
    //     return memo.venueName.toLowerCase().indexOf(value.toLowerCase()) > -1
    // })
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchVenueList(filteredData);
  };

  //On selection of venue
  onSelectValues(venueId) {
    this.props.updateVenueConstraintsData(venueId, null, 'venues', 'venueListSection');
    this.props.clearFilter();
    this.setState({ addOrRemoveVenues: true });
  }

  selectAddVenueView() {
    // const { venueList, mainVenueList } = this.props.commonReducerState
    const { venueList, mainVenueList } = this.props.appState;
    const { selectedVenueId } = this.props.venueTimeState;
    const { affiliateOurOrg } = this.props.userState;
    let disabledStatus = this.state.competitionStatus == 1;
    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            <Select
              mode="multiple"
              disabled={disabledStatus}
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={venueId => {
                this.onSelectValues(venueId);
              }}
              value={selectedVenueId}
              placeholder="Select Venue"
              filterOption={false}
              onSearch={value => {
                this.handleSearch(value, mainVenueList);
              }}
            >
              {venueList.map(item => (
                <Option value={item.id} key={'venue_' + item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
            <div
              onClick={() => disabledStatus == false && this.props.clearVenueDataAction('venue')}
            >
              {disabledStatus == false &&
              affiliateOurOrg.organisationTypeRefId <=
                affiliateOurOrg.whatIsTheLowestOrgThatCanAddVenue ? (
                <NavLink
                  to={{
                    pathname: `/competitionVenueAndTimesAdd`,
                    state: { key: AppConstants.venues },
                  }}
                >
                  <span className="input-heading-add-another">+{AppConstants.addVenue}</span>
                </NavLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // addMatchPreference = () => {
  //   this.props.updateVenueConstraintsData(null, null, 'addMatchPreference', 'matchPreference');
  // };

  // removeDetail = (index, currentModal) => {
  //   this.setState({ currentIndex: index, deleteModalVisible: true, currentModal: currentModal });
  // };

  // onChangeSetMPValue = (val, key, index) => {
  //   if (key === 'matchDate') {
  //     val = moment(val).format('YYYY-MM-DD');
  //   }
  //   if (key === 'competitionMembershipProductDivisionId') {
  //     this.formRef.current.setFieldsValue({
  //       [`mpGradeId${index}`]: null,
  //       [`mpTeamAId${index}`]: null,
  //       [`mpTeamBId${index}`]: null,
  //     });
  //   } else if (key === 'competitionDivisionGradeId') {
  //     this.formRef.current.setFieldsValue({
  //       [`mpTeamAId${index}`]: null,
  //       [`mpTeamBId${index}`]: null,
  //     });
  //   } else if (key === 'venueId') {
  //     this.formRef.current.setFieldsValue({
  //       [`mpCourtId${index}`]: null,
  //     });
  //   }
  //   this.props.updateVenueConstraintsData(val, index, key, 'matchPreference');
  // };

  setDivisionsFieldsConfigurations = (rowIndex, competitionDivisionIds = []) => {
    this.props.updateVenueConstraintsData(
      competitionDivisionIds,
      rowIndex,
      null,
      'competitionDivisionsFieldsConfigurations',
    );
  };

  onChangeSetLDValue = (val, key, index) => {
    if (key === 'matchDate') {
      val = moment(val).format('YYYY-MM-DD');
    }
    if (key === 'competitionMembershipProductDivisionId') {
      this.formRef.current.setFieldsValue({
        [`ldGradeId${index}`]: null,
        [`ldTeamAId${index}`]: null,
        [`ldTeamBId${index}`]: null,
      });
    } else if (key === 'competitionDivisionGradeId') {
      this.formRef.current.setFieldsValue({
        [`ldTeamAId${index}`]: null,
        [`ldTeamBId${index}`]: null,
      });
    } else if (key === 'venueId') {
      this.formRef.current.setFieldsValue({
        [`ldCourtId${index}`]: null,
      });
    }
    this.props.updateVenueConstraintsData(val, index, key, 'lockedDraws');
  };

  handleDeleteModal(key) {
    this.setState({
      deleteModalVisible: false,
    });
    if (key === 'ok') {
      this.setState({ deleteModalVisible: false });
      if (this.state.currentModal === 'matchPreference') {
        this.props.updateVenueConstraintsData(
          null,
          this.state.currentIndex,
          'removeMatchPreference',
          'matchPreference',
        );
      } else if (this.state.currentModal === 'lockedDraws') {
        this.onChangeSetLDValue(false, 'isLocked', this.state.currentIndex);
      }
    }
  }

  // onTimeChange = (time, index, field) => {
  //   if (time) {
  //     this.onChangeSetMPValue(time.format('HH:mm'), field, index);
  //   }
  // };

  // matchPreferenceView = () => {
  //   const { venueConstrainstData, venuePost } = this.props.venueTimeState;

  //   return (
  //     <div className="content-view" style={{ paddingTop: 30 }}>
  //       <span className="applicable-to-heading pt-0" style={{ paddingBottom: 20 }}>
  //         {AppConstants.matchPreference}
  //       </span>
  //       {(venueConstrainstData.matchPreference || []).map((item, index) => (
  //         <div className="fluid-width comp-venue-time-inside-container-view mb-20">
  //           <div className="col-sm delete-image-view pb-4">
  //             <span
  //               className="user-remove-btn"
  //               onClick={() => this.removeDetail(index, 'matchPreference')}
  //             >
  //               <i className="fa fa-trash-o" aria-hidden="true" />
  //             </span>
  //             <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
  //           </div>
  //           <div className="row">
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.division} required="required-field" />
  //               <Form.Item
  //                 name={`mpDivisionId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.divisionName }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div =>
  //                     this.onChangeSetMPValue(div, 'competitionMembershipProductDivisionId', index)
  //                   }
  //                   value={item.competitionMembershipProductDivisionId}
  //                 >
  //                   {(venueConstrainstData.divisionGrades || []).map(div => (
  //                     <Option
  //                       key={'compMemProdDiv_' + div.competitionMembershipProductDivisionId}
  //                       value={div.competitionMembershipProductDivisionId}
  //                     >
  //                       {div.divisionName}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.grade} required="required-field" />
  //               <Form.Item
  //                 name={`mpGradeId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.gradeNameRequired }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div =>
  //                     this.onChangeSetMPValue(div, 'competitionDivisionGradeId', index)
  //                   }
  //                   value={item.competitionDivisionGradeId}
  //                 >
  //                   {(item.grades || []).map(g => (
  //                     <Option key={'compDivGrade' + g.gradeId} value={g.gradeId}>
  //                       {g.gradeName}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.teamA} required="required-field" />
  //               <Form.Item
  //                 name={`mpTeamAId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.teamName }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div => this.onChangeSetMPValue(div, 'team1Id', index)}
  //                   value={item.team1Id}
  //                 >
  //                   {(item.teams || []).map(t => (
  //                     <Option key={'team1_' + t.teamId} value={t.teamId}>
  //                       {t.teamName}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.teamB} required="required-field" />
  //               <Form.Item
  //                 name={`mpTeamBId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.teamName }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div => this.onChangeSetMPValue(div, 'team2Id', index)}
  //                   value={item.team2Id}
  //                 >
  //                   {(item.teams || []).map(t1 => (
  //                     <Option key={'team2_' + t1.teamId} value={t1.teamId}>
  //                       {t1.teamName}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //           </div>
  //           <div className="row">
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.venue} required="required-field" />
  //               <Form.Item
  //                 name={`mpVenueId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.pleaseSelectVenue }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div => this.onChangeSetMPValue(div, 'venueId', index)}
  //                   value={item.venueId}
  //                 >
  //                   {(venuePost || []).map(v => (
  //                     <Option key={'venue_' + v.venueId} value={v.venueId}>
  //                       {v.venueName}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.courts} required="required-field" />
  //               <Form.Item
  //                 name={`mpCourtId${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.court }]}
  //               >
  //                 <Select
  //                   className="w-100"
  //                   style={{ paddingRight: 1, minWidth: 182 }}
  //                   onChange={div => this.onChangeSetMPValue(div, 'courtId', index)}
  //                   value={item.courtId}
  //                 >
  //                   {(item.courts || []).map(c => (
  //                     <Option key={'court_' + c.venueCourtId} value={c.venueCourtId}>
  //                       {c.courtNumber}
  //                     </Option>
  //                   ))}
  //                 </Select>
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.date} required="required-field" />
  //               <Form.Item
  //                 name={`mpMatchDate${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.dateField }]}
  //               >
  //                 <DatePicker
  //                   // size="large"
  //                   placeholder="dd-mm-yyyy"
  //                   className="w-100"
  //                   onChange={e => this.onChangeSetMPValue(e, 'matchDate', index)}
  //                   name="matchDate"
  //                   format="DD-MM-YYYY"
  //                   showTime={false}
  //                 />
  //               </Form.Item>
  //             </div>
  //             <div className="col-sm-3">
  //               <InputWithHead heading={AppConstants.startTime} required="required-field" />
  //               <Form.Item
  //                 name={`mpStartTime${index}`}
  //                 rules={[{ required: true, message: ValidationConstant.startTime }]}
  //               >
  //                 <TimePicker
  //                   className="comp-venue-time-timepicker w-100"
  //                   onChange={time => this.onTimeChange(time, index, 'startTime')}
  //                   onBlur={e =>
  //                     this.onTimeChange(
  //                       e.target.value && moment(e.target.value, 'HH:mm'),
  //                       index,
  //                       'startTime',
  //                     )
  //                   }
  //                   // value={moment(item.endTime, "HH:mm")}
  //                   format="HH:mm"
  //                   // minuteStep={15}
  //                   use12Hours={false}
  //                 />
  //               </Form.Item>
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //       <span className="input-heading-add-another" onClick={() => this.addMatchPreference()}>
  //         + {AppConstants.addPreference}
  //       </span>
  //     </div>
  //   );
  // };

  onDLTimeChange = (time, index, field) => {
    if (time !== null && time !== undefined) {
      this.onChangeSetLDValue(time.format('HH:mm'), field, index);
    }
  };

  // lockedGradesView = () => {
  //   const { venueConstrainstData, venuePost } = this.props.venueTimeState;
  //   let lockedDraws =
  //     venueConstrainstData.lockedDraws != null ? venueConstrainstData.lockedDraws : [];
  //   return (
  //     <div className="content-view pt-5">
  //       <span className="applicable-to-heading pt-0 pb-4">{AppConstants.lockedDraws}</span>
  //       {(lockedDraws || []).map((item, index) => (
  //         <div>
  //           {item.isLocked && (
  //             <div className="fluid-width comp-venue-time-inside-container-view mb-20">
  //               <div className="col-sm delete-image-view pb-4">
  //                 <span
  //                   className="user-remove-btn"
  //                   onClick={() => this.removeDetail(index, 'lockedDraws')}
  //                 >
  //                   <i className="fa fa-trash-o" aria-hidden="true" />
  //                 </span>
  //                 <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
  //               </div>

  //               <div className="row">
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.division} required="required-field" />
  //                   <Form.Item
  //                     name={`ldDivisionId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.divisionName }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div =>
  //                         this.onChangeSetLDValue(
  //                           div,
  //                           'competitionMembershipProductDivisionId',
  //                           index,
  //                         )
  //                       }
  //                       value={item.competitionMembershipProductDivisionId}
  //                     >
  //                       {(venueConstrainstData.divisionGrades || []).map(div => (
  //                         <Option
  //                           key={'compMemProdDiv_' + div.competitionMembershipProductDivisionId}
  //                           value={div.competitionMembershipProductDivisionId}
  //                         >
  //                           {div.divisionName}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.grade} required="required-field" />
  //                   <Form.Item
  //                     name={`ldGradeId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.gradeNameRequired }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div =>
  //                         this.onChangeSetLDValue(div, 'competitionDivisionGradeId', index)
  //                       }
  //                       value={item.competitionDivisionGradeId}
  //                     >
  //                       {(item.grades || []).map(g => (
  //                         <Option key={'compDivisionGrade_' + g.gradeId} value={g.gradeId}>
  //                           {g.gradeName}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.teamA} required="required-field" />
  //                   <Form.Item
  //                     name={`ldTeamAId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.teamName }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div => this.onChangeSetLDValue(div, 'team1Id', index)}
  //                       value={item.team1Id}
  //                     >
  //                       {(item.teams || []).map(t => (
  //                         <Option key={'team1_' + t.teamId} value={t.teamId}>
  //                           {t.teamName}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.teamB} required="required-field" />
  //                   <Form.Item
  //                     name={`ldTeamBId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.teamName }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div => this.onChangeSetLDValue(div, 'team2Id', index)}
  //                       value={item.team2Id}
  //                     >
  //                       {(item.teams || []).map(t1 => (
  //                         <Option key={'team2_' + t1.teamId} value={t1.teamId}>
  //                           {t1.teamName}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //               </div>
  //               <div className="row">
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.venue} required="required-field" />
  //                   <Form.Item
  //                     name={`ldVenueId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.pleaseSelectVenue }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div => this.onChangeSetLDValue(div, 'venueId', index)}
  //                       value={item.venueId}
  //                     >
  //                       {(venuePost || []).map(v => (
  //                         <Option key={'venue_' + v.venueId} value={v.venueId}>
  //                           {v.venueName}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.courts} required="required-field" />
  //                   <Form.Item
  //                     name={`ldCourtId${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.court }]}
  //                   >
  //                     <Select
  //                       className="w-100"
  //                       style={{ paddingRight: 1, minWidth: 182 }}
  //                       onChange={div => this.onChangeSetLDValue(div, 'courtId', index)}
  //                       value={item.courtId}
  //                     >
  //                       {(item.courts || []).map(c => (
  //                         <Option key={'court_' + c.venueCourtId} value={c.venueCourtId}>
  //                           {c.courtNumber}
  //                         </Option>
  //                       ))}
  //                     </Select>
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.date} required="required-field" />
  //                   <Form.Item
  //                     name={`ldMatchDate${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.dateField }]}
  //                   >
  //                     <DatePicker
  //                       // size="large"
  //                       placeholder="dd-mm-yyyy"
  //                       className="w-100"
  //                       onChange={e => this.onChangeSetLDValue(e, 'matchDate', index)}
  //                       name="matchDate"
  //                       format="DD-MM-YYYY"
  //                       showTime={false}
  //                     />
  //                   </Form.Item>
  //                 </div>
  //                 <div className="col-sm-3">
  //                   <InputWithHead heading={AppConstants.startTime} required="required-field" />
  //                   <Form.Item
  //                     name={`ldStartTime${index}`}
  //                     rules={[{ required: true, message: ValidationConstant.startTime }]}
  //                   >
  //                     <TimePicker
  //                       className="comp-venue-time-timepicker w-100"
  //                       onChange={time => this.onDLTimeChange(time, index, 'startTime')}
  //                       onBlur={e =>
  //                         this.onDLTimeChange(
  //                           e.target.value && moment(e.target.value, 'HH:mm'),
  //                           index,
  //                           'startTime',
  //                         )
  //                       }
  //                       // value={moment(item.endTime, "HH:mm")}
  //                       format="HH:mm"
  //                       // minuteStep={15}
  //                       use12Hours={false}
  //                     />
  //                   </Form.Item>
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       ))}
  //       {/* <span className="input-heading-add-another" onClick={()=> this.addMatchPreference()}>
  //                   + {AppConstants.addAnother}
  //               </span> */}
  //     </div>
  //   );
  // };

  contentView = () => {
    const { selectedRadioBtn } = this.props.venueTimeState;
    return (
      <>
        <div className="formView mb-5">
          <div className="content-view">
            {this.selectAddVenueView()}

            {/* {this.nonPlayingDatesContainer()} */}

            {this.anyGradePrefenceView()}

            {(selectedRadioBtn === COURTROTATION_MAIN.ALLOCATE ||
              selectedRadioBtn === COURTROTATION_MAIN.ALLOCATE_VENUE) &&
              this.courtPreferenceView()}

            {this.homeTeamRotationView()}
          </div>
        </div>

        {process.env.REACT_APP_VENUE_CONFIGURATION_ENABLED === 'true' &&
          this.divisionOfFieldLinkageView()}

        <Modal
          title={AppConstants.removeFixture}
          visible={this.state.deleteModalVisible}
          onOk={() => this.handleDeleteModal('ok')}
          onCancel={() => this.handleDeleteModal('cancel')}
        >
          <p>{AppConstants.venueConstraintModalMsg}</p>
        </Modal>
      </>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let isPublished = this.state.competitionStatus == 1;
    return (
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <NavLink to="/competitionCourtAndTimesAssign">
                <Button disabled={isPublished} className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.back}
                </Button>
              </NavLink>
            </div>
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
                  style={{
                    height: isPublished && '100%',
                    borderRadius: isPublished && 6,
                    width: isPublished && 'inherit',
                  }}
                  className="publish-button save-draft-text"
                  id={AppUniqueId.competitionVenueSaveBn}
                  disabled={isPublished}
                  htmlType="submit"
                  type="primary"
                >
                  {AppConstants.save}
                </Button>
              </Tooltip>

              {/* <NavLink to="/competitionFormat"> */}
              <Button
                onClick={() => this.setState({ onNextClicked: true })}
                htmlType="submit"
                id={AppUniqueId.competitionVenueNextBn}
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

  getDivisionsFieldsConfigurationsPayload = (config = []) => {
    const { venueConstrainstData } = this.props.venueTimeState;

    return config
      .map(field => {
        if (!field.competitionDivisionId) {
          const currentCompetitionDivision = venueConstrainstData.competitionDivisions.find(div => {
            return div.divisionFieldConfigurationId === field.divisionFieldConfigurationId;
          });
          const prevCompetitionDivisionId = currentCompetitionDivision?.id;

          return {
            competitionDivisionId: prevCompetitionDivisionId,
            divisionFieldConfigurationId: null,
          };
        }

        return field;
      })
      .filter(field => !!field.competitionDivisionId);
  };

  onSaveConstraints = values => {
    let venueConstarintsDetails = this.props.venueTimeState;
    const {
      venueConstrainstData,
      competitionUniqueKey,
      courtPreferencesPost = [],
      selectedRadioBtn,
    } = venueConstarintsDetails;

    if (selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE) {
      courtPreferencesPost.forEach(prefer => {
        prefer.venueId = null;
      });
    } else if (selectedRadioBtn == COURTROTATION_MAIN.ALLOCATE_VENUE) {
      courtPreferencesPost.forEach(prefer => {
        prefer.venueCourtId = null;
      });
    }

    if (venueConstrainstData.courtRotationRefId == 0) {
      this.setState({ evenRotationFlag: true });
    } else {
      this.setState({ evenRotationFlag: false });
    }
    if (venueConstrainstData.homeTeamRotationRefId == 0) {
      this.setState({ homeTeamRotationFlag: true });
    } else {
      this.setState({ homeTeamRotationFlag: false });
    }

    if (
      venueConstrainstData.courtRotationRefId != 0 &&
      venueConstrainstData.homeTeamRotationRefId != 0
    ) {
      const postObject = {
        competitionUniqueKey,
        yearRefId: this.state.yearRefId,
        organisationId: 1,
        venues: venueConstarintsDetails.venuePost,
        nonPlayingDates: venueConstrainstData.nonPlayingDates,
        venueConstraintId: venueConstrainstData.venueConstraintId,
        courtRotationRefId: venueConstrainstData.courtRotationRefId,
        homeTeamRotationRefId: venueConstrainstData.homeTeamRotationRefId,
        courtPreferences: courtPreferencesPost,
        matchPreference: venueConstrainstData.matchPreference,
        lockedDraws: venueConstrainstData.lockedDraws,
      };

      this.setState({ saveContraintLoad: true });
      this.props.venueConstraintPostAction(postObject);

      const { competitionId } = this.state;
      const { organisationId } = getOrganisationData() || {};

      const divisionsFieldsConfigurationsPayload = this.getDivisionsFieldsConfigurationsPayload(
        venueConstrainstData.competitionDivisionsFieldsConfigurations,
      );

      if (competitionId && organisationId)
        this.props.saveCompetitionDivisionsAction(competitionId, organisationId, {
          competitionDivisionsFieldsConfigurations: divisionsFieldsConfigurationsPayload,
        });
    }
  };

  qcWarningView = () => {
    return (
      <div className="formView">
        <div className="content-view pt-3">
          <div className="comp-warning-info">{AppConstants.qcVenueConstraintNotApplicable}</div>
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

        <InnerHorizontalMenu menu="competition" compSelectedKey="7" />

        <Loader visible={this.props.venueTimeState.onLoad} />

        <Layout>
          {this.headerView()}

          {this.dropdownView()}

          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onSaveConstraints}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
            }}
            noValidate="noValidate"
          >
            <Content>
              {/* {!this.state.isQuickCompetition ? this.contentView() : this.qcWarningView()} */}
              {this.contentView()}
            </Content>

            <Footer>{!this.state.isQuickCompetition ? this.footerView() : null}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      venueConstraintListAction,
      updateVenuListAction,
      getYearAndCompetitionOwnAction,
      getVenuesTypeAction,
      updateVenuAndTimeDataAction,
      updateVenueConstraintsData,
      venueConstraintPostAction,
      venueListAction,
      getCommonRefData,
      clearVenueTimesDataAction,
      removePrefencesObjectAction,
      clearYearCompetitionAction,
      searchVenueList,
      clearFilter,
      clearVenueDataAction,
      getDivisionFieldConfigAction,
      saveCompetitionDivisionsAction,
      getAffiliateOurOrganisationIdAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    venueTimeState: state.VenueTimeState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionVenueTimesPrioritisation);

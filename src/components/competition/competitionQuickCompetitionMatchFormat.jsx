import React, { Component, createRef } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Checkbox,
  Button,
  Radio,
  Form,
  Modal,
  message,
  InputNumber,
} from 'antd';
import './competition.css';
// import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import {
  getCompetitionFormatAction,
  saveCompetitionFormatAction,
  updateCompetitionFormatAction,
} from '../../store/actions/competitionModuleAction/competitionFormatAction';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import {
  getMatchTypesAction,
  getCompetitionFormatTypesAction,
  getCompetitionTypesAction,
  getYearAndCompetitionOwnAction,
  clearYearCompetitionAction,
  getEnhancedRoundRobinAction,
} from '../../store/actions/appAction';
import { getYearAndQuickCompetitionAction } from '../../store/actions/competitionModuleAction/competitionQuickCompetitionAction';
import { generateDrawAction } from '../../store/actions/competitionModuleAction/competitionModuleAction';
import Loader from '../../customComponents/loader';
import {
  getOrganisationData,
  setOwn_competition,
  setGlobalYear,
  getGlobalYear,
} from '../../util/sessionStorage';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class QuickCompetitionMatchFormat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDivisionVisible: false,
      deleteModalVisible: false,
      currentIndex: 0,
      competitionId: '',
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId: null,
      firstTimeCompId: '',
      getDataLoading: false,
      buttonPressed: '',
      loading: false,
      isFinalAvailable: false,
      matchTypeRefStateId: 0,
    };

    this.formRef = createRef();
    this.referenceApiCalls();
  }

  componentDidMount() {
    const competitionId = this.props.location.state
      ? this.props.location.state.competitionUniqueKey
      : null;
    const year = this.props.location.state && this.props.location.state.year;
    const propsData =
      this.props.quickCompetitionState.quick_CompetitionYearArr.length > 0 &&
      this.props.quickCompetitionState.quick_CompetitionYearArr;
    const compData =
      this.props.quickCompetitionState.quick_CompetitionArr.length > 0 &&
      this.props.quickCompetitionState.quick_CompetitionArr;
    if (year && competitionId && propsData && compData) {
      this.setState({
        yearRefId: JSON.parse(year),
        firstTimeCompId: competitionId,
        getDataLoading: true,
      });
      this.apiCalls(competitionId, year);
    } else {
      this.props.getYearAndQuickCompetitionAction(
        this.props.quickCompetitionState.quick_CompetitionYearArr,
        null,
      );
    }
  }

  componentDidUpdate(nextProps) {
    try {
      const { competitionFormatState } = this.props;
      const { competitionModuleState } = this.props;
      if (nextProps.competitionFormatState != competitionFormatState) {
        if (competitionFormatState.onLoad == false && this.state.getDataLoading) {
          this.setState({
            getDataLoading: false,
          });
          this.setFormFieldValue();
        }
        this.setFormFieldValue();
      }
      if (nextProps.quickCompetitionState !== this.props.quickCompetitionState) {
        const competitionList = this.props.quickCompetitionState.quick_CompetitionArr;
        if (nextProps.quickCompetitionState.quick_CompetitionArr !== competitionList) {
          if (competitionList.length > 0) {
            const { competitionId } = competitionList[0];
            const yearId = this.state.yearRefId ? this.state.yearRefId : getGlobalYear();
            this.setState({
              firstTimeCompId: competitionId,
              getDataLoading: true,
              yearRefId: JSON.parse(yearId),
            });
            this.apiCalls(competitionId, yearId);
          }
        }
      }
      if (nextProps.competitionFormatState != competitionFormatState) {
        if (competitionFormatState.onLoad == false && this.state.loading === true) {
          this.setState({ loading: false });
          if (!competitionFormatState.error) {
            if (this.state.buttonPressed === 'save') {
              if (this.state.isFinalAvailable) {
                history.push('/competitionFinals');
              } else {
                const payload = {
                  yearRefId: this.state.yearRefId,
                  competitionUniqueKey: this.state.firstTimeCompId,
                  organisationId: this.state.organisationId,
                };
                if (
                  competitionModuleState.drawGenerateLoad == false &&
                  !this.state.isFinalAvailable
                ) {
                  this.props.generateDrawAction(payload);
                  this.setState({ loading: true });
                }
              }
            }
          }
        }
      }

      if (nextProps.competitionModuleState != competitionModuleState) {
        if (
          competitionFormatState.onLoad == false &&
          competitionModuleState.drawGenerateLoad == false &&
          this.state.loading === true &&
          !this.state.isFinalAvailable
        ) {
          if (!competitionModuleState.error && competitionModuleState.status == 1) {
            history.push('/competitionDraws');
          }
          this.setState({ loading: false });
        }
        if (
          competitionModuleState.status == 5 &&
          competitionModuleState.drawGenerateLoad == false
        ) {
          this.setState({ loading: false });
          message.error(ValidationConstants.drawsMessage[0]);
          this.apiCalls(this.state.firstTimeCompId, this.state.yearRefId);
        }
        if (
          competitionModuleState.status == 4 &&
          competitionModuleState.drawGenerateLoad == false
        ) {
          this.setState({ loading: false });
          this.apiCalls(this.state.firstTimeCompId, this.state.yearRefId);
        }
      }
    } catch (error) {
      console.log(`ERROr${error}`);
    }
  }

  apiCalls = (competitionId, yearRefId) => {
    const payload = {
      yearRefId,
      competitionUniqueKey: competitionId,
      organisationId: this.state.organisationId,
    };
    this.props.getCompetitionFormatAction(payload);
  };

  referenceApiCalls = () => {
    this.props.clearYearCompetitionAction();
    this.props.getMatchTypesAction();
    this.props.getCompetitionFormatTypesAction();
    this.props.getCompetitionTypesAction();
    this.props.getEnhancedRoundRobinAction();
    this.setState({ getDataLoading: true });
  };

  onYearChange(yearId) {
    setGlobalYear(yearId);
    this.props.getYearAndQuickCompetitionAction(
      this.props.quickCompetitionState.quick_CompetitionYearArr,
      yearId,
    );
    this.setState({ firstTimeCompId: null, yearRefId: yearId });
  }

  // on Competition change
  onCompetitionChange(competitionId) {
    const payload = {
      yearRefId: this.state.yearRefId,
      competitionUniqueKey: competitionId,
      organisationId: this.state.organisationId,
    };
    this.props.getCompetitionFormatAction(payload);
    this.setState({ getDataLoading: true, firstTimeCompId: competitionId });
  }

  setFormFieldValue = () => {
    const formatList = Object.assign(this.props.competitionFormatState.competitionFormatList);
    const competitionFormatDivision = formatList.competionFormatDivisions;

    this.formRef.current.setFieldsValue({
      [`competitionFormatRefId`]: formatList.competitionFormatRefId,
      [`matchTypeRefId`]: formatList.matchTypeRefId,
    });

    (competitionFormatDivision || []).forEach((item, index) => {
      this.formRef.current.setFieldsValue({
        [`matchDuration${index}`]: item.matchDuration,
        [`mainBreak${index}`]: item.mainBreak,
        [`qtrBreak${index}`]: item.qtrBreak,
        [`timeBetweenGames${index}`]: item.timeBetweenGames,
      });
    });
  };

  onChange(e, competitionFormatDivisions, index) {
    const removedDivisions = [];
    const selectDivs = competitionFormatDivisions[index].selectedDivisions;
    for (const k in selectDivs) {
      if (e.indexOf(selectDivs[k]) == -1) {
        removedDivisions.push(selectDivs[k]);
        break;
      }
    }

    const a = competitionFormatDivisions[index].selectedDivisions.filter(x => false);
    competitionFormatDivisions[index].selectedDivisions = a;
    competitionFormatDivisions[index].selectedDivisions = e;

    const { competitionFormatTemplateId } = competitionFormatDivisions[index];
    const remainingFormatDiv = competitionFormatDivisions.filter(
      x => x.competitionFormatTemplateId != competitionFormatTemplateId,
    );

    for (const remDiv in remainingFormatDiv) {
      const itemDivisions = remainingFormatDiv[remDiv].divisions;
      // disable true
      for (const i in e) {
        for (const j in itemDivisions) {
          if (itemDivisions[j].competitionMembershipProductDivisionId === e[i]) {
            itemDivisions[j].isDisabled = true;
          }
        }
      }

      for (const i in removedDivisions) {
        for (const j in itemDivisions) {
          if (itemDivisions[j].competitionMembershipProductDivisionId === removedDivisions[i]) {
            itemDivisions[j].isDisabled = false;
          }
        }
      }
    }
    this.props.updateCompetitionFormatAction(
      competitionFormatDivisions,
      'competionFormatDivisions',
    );
  }

  onChangeFinal = (e, competitionFormatDivisions, index) => {
    competitionFormatDivisions[index].isFinal = e.target.checked;
    this.props.updateCompetitionFormatAction(
      competitionFormatDivisions,
      'competionFormatDivisions',
    );
  };

  addCompetitionFormatDivision(data) {
    this.props.updateCompetitionFormatAction(data, 'addCompetitionFormatDivisions');
  }

  handleDeleteModal(flag, key, index, competionFormatDivisions) {
    this.setState({
      deleteModalVisible: flag,
    });
    if (key === 'ok') {
      this.deleteCompetitionFormatDivision(competionFormatDivisions, index);
    }
  }

  deleteCompetitionFormatDivision = (competionFormatDivisions, index) => {
    const removedFormat = competionFormatDivisions[index];
    const remainingFormatDiv = competionFormatDivisions.filter(
      x => x.competitionFormatTemplateId != removedFormat.competitionFormatTemplateId,
    );
    for (const remDiv in remainingFormatDiv) {
      const itemDivisions = remainingFormatDiv[remDiv].divisions;
      for (const i in removedFormat.selectedDivisions) {
        for (const j in itemDivisions) {
          if (
            itemDivisions[j].competitionMembershipProductDivisionId ===
            removedFormat.selectedDivisions[i]
          ) {
            itemDivisions[j].isDisabled = false;
          }
        }
      }
    }
    competionFormatDivisions.splice(index, 1);
    this.props.updateCompetitionFormatAction(competionFormatDivisions, 'competionFormatDivisions');
  };

  onChangeSetValue = (id, fieldName) => {
    // const data = this.props.competitionFormatState.competitionFormatList;
    // const fixtureTemplateId = null;
    if (fieldName === 'noOfRounds') {
      // data.fixtureTemplates.map((item, index) => {
      //     if (item.noOfRounds == id) {
      //         fixtureTemplateId = item.id;
      //     }
      // });
      // this.props.updateCompetitionFormatAction(fixtureTemplateId, "fixtureTemplateId");
    } else if (fieldName === 'competitionFormatRefId') {
      if (id != 4) {
        this.props.updateCompetitionFormatAction(null, 'noOfRounds');
        // this.props.updateCompetitionFormatAction(fixtureTemplateId, "fixtureTemplateId");
      }
    } else if (fieldName === 'matchTypeRefId') {
      this.setFormFieldValue();
      // this.setState({matchTypeRefStateId: id})
    }

    this.props.updateCompetitionFormatAction(id, fieldName);
  };

  onChangeSetCompFormatDivisionValue = (id, fieldName, competitionFormatDivisions, index) => {
    if (fieldName === 'matchDuration') {
      competitionFormatDivisions[index].matchDuration = id;
    } else if (fieldName === 'mainBreak') {
      competitionFormatDivisions[index].mainBreak = id;
    } else if (fieldName === 'qtrBreak') {
      competitionFormatDivisions[index].qtrBreak = id;
    } else if (fieldName === 'timeBetweenGames') {
      competitionFormatDivisions[index].timeBetweenGames = id;
    }
    this.props.updateCompetitionFormatAction(
      competitionFormatDivisions,
      'competionFormatDivisions',
    );
  };

  handleAllDivisionModal = (flag, key, index, competionFormatDivisions) => {
    this.setState({
      allDivisionVisible: flag,
    });
    if (key === 'ok') {
      this.performAllDivisionOperation(true, competionFormatDivisions, index);
    }
  };

  deleteModal = index => {
    this.setState({
      currentIndex: index,
      deleteModalVisible: true,
    });
  };

  onChangeAllDivision = (e, competionFormatDivisions, index) => {
    this.setState({
      currentIndex: index,
    });

    if (competionFormatDivisions.length > 1) {
      if (e.target.checked) {
        this.setState({
          allDivisionVisible: true,
        });
      } else {
        this.performAllDivisionOperation(e.target.checked, competionFormatDivisions, index);
      }
    } else {
      this.performAllDivisionOperation(e.target.checked, competionFormatDivisions, index);
    }
  };

  performAllDivisionOperation = (checkedVal, competionFormatDivisions, index) => {
    const allDivObj = Object.assign(competionFormatDivisions[index]);
    allDivObj.selectedDivisions = [];
    for (const i in allDivObj.divisions) {
      allDivObj.divisions[i].isDisabled = false;
    }

    const arr = [];
    arr.push(allDivObj);

    this.props.updateCompetitionFormatAction(checkedVal, 'allDivision');
    this.props.updateCompetitionFormatAction(arr, 'competionFormatDivisions');
  };

  saveCompetitionFormats = values => {
    this.setState({ buttonPressed: 'save' });
    const formatList = Object.assign(this.props.competitionFormatState.competitionFormatList);
    const competitionFormatDivision = formatList.competionFormatDivisions;
    formatList.organisationId = this.state.organisationId;

    if (formatList.isDefault == null) {
      formatList.isDefault = 0;
    }

    for (const item in competitionFormatDivision) {
      const { isFinal } = competitionFormatDivision[item];
      if (isFinal && formatList.competitionFormatRefId != 1) {
        this.setState({ isFinalAvailable: true });
      }

      const { competitionFormatTemplateId } = competitionFormatDivision[item];
      if (competitionFormatTemplateId < 0) {
        competitionFormatDivision[item].competitionFormatTemplateId = 0;
      }

      const { selectedDivisions } = competitionFormatDivision[item];
      const { divisions } = competitionFormatDivision[item];
      const divArr = [];

      for (const j in selectedDivisions) {
        const matchDivisions = divisions.find(
          x => x.competitionMembershipProductDivisionId === selectedDivisions[j],
        );
        if (matchDivisions != '') {
          const obj = {
            competitionFormatDivisionId: 0,
            competitionMembershipProductDivisionId: 0,
          };
          obj.competitionFormatDivisionId = matchDivisions.competitionFormatDivisionId;
          obj.competitionMembershipProductDivisionId =
            matchDivisions.competitionMembershipProductDivisionId;
          divArr.push(obj);
        }
      }

      competitionFormatDivision[item].divisions = divArr;
    }

    // let payload = {
    //     yearRefId: this.state.yearRefId,
    //     competitionUniqueKey: this.state.firstTimeCompId,
    //     organisationId: this.state.organisationId
    // }
    // this.props.generateDrawAction(payload);

    this.props.saveCompetitionFormatAction(formatList);
    this.setState({ loading: true });
    setGlobalYear(this.state.yearRefId);
    setOwn_competition(this.state.firstTimeCompId);
  };

  /// ////view for breadcrumb
  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.quickCompetitionFormat}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  /// dropdown view containing all the dropdown of header
  dropdownView = () => {
    const { quickCompetitionState } = this.props;
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3 pb-3">
              <div className="d-flex flex-row align-items-center w-ft">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select-year ml-2"
                  // style={{ width: 90 }}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={this.state.yearRefId}
                >
                  {quickCompetitionState.quick_CompetitionYearArr.map(item => (
                    <Option key={`year_${item.id}`} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-3 pb-3">
              <div className="d-flex flex-row align-items-center w-ft" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  // style={{ minWidth: 200 }}
                  onChange={competitionId => this.onCompetitionChange(competitionId)}
                  value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                >
                  {quickCompetitionState.quick_CompetitionArr.map(item => (
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

  contentView = () => {
    const data = this.props.competitionFormatState.competitionFormatList;
    const { appState } = this.props;
    const { isAllDivisionChecked } = this.props.competitionFormatState;
    return (
      <div className="content-view pt-4">
        <InputWithHead
          auto_complete="new-compName"
          heading={AppConstants.competitionName}
          placeholder={AppConstants.competitionName}
          value={data.competitionName}
          onChange={e => this.onChangeSetValue(e.target.value, 'competitionName')}
        />

        <div style={{ marginTop: 15 }}>
          <InputWithHead heading={AppConstants.competitionFormat} required="required-field" />
          <Form.Item
            name="competitionFormatRefId"
            rules={[{ required: true, message: ValidationConstants.pleaseSelectCompetitionFormat }]}
          >
            <Radio.Group
              className="reg-competition-radio"
              onChange={e => this.onChangeSetValue(e.target.value, 'competitionFormatRefId')}
              value={data.competitionFormatRefId}
            >
              <div className="fluid-width">
                <div className="row">
                  {(appState.competitionFormatTypes || []).map(item => (
                    <div className="col-sm">
                      <Radio key={`competitionFormatType_${item.id}`} value={item.id}>
                        {item.description}
                      </Radio>
                    </div>
                  ))}
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>
        {/* <Checkbox
                    className="single-checkbox pt-3"
                    defaultChecked={false}
                    onChange={(e) => this.onChange(e)}
                >
                    {AppConstants.use_default_competitionFormat}
                </Checkbox> */}
        {/* <InputWithHead heading={AppConstants.fixture_template} />
                <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={(fixTemplate) => this.onChangeSetValue(fixTemplate, 'fixtureTemplateId')}
                    value={data.fixtureTemplateId}
                >
                    <Option style={{ height: 30 }} value={null} key={null}>{}</Option>
                    {(data.fixtureTemplates || []).map((fixture) => (
                        <Option key={'fixtureTemplate_' + fixture.id} value={fixture.id}>{fixture.name}</Option>
                    ))}
                </Select> */}

        <InputWithHead heading={AppConstants.matchType} required="required-field" />
        <Form.Item
          name="matchTypeRefId"
          rules={[{ required: true, message: ValidationConstants.matchTypeRequired }]}
        >
          <Select
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            onChange={matchType => this.onChangeSetValue(matchType, 'matchTypeRefId')}
            value={data.matchTypeRefId}
          >
            {(appState.matchTypes || []).map(item => {
              if (item.name !== 'SINGLE') {
                return (
                  <Option key={`matchType_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                );
              }
              return <></>;
            })}
          </Select>
        </Form.Item>
        {data.competitionFormatRefId == 4 && (
          <div>
            <InputWithHead heading={AppConstants.numberOfRounds} />
            <InputNumber
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onKeyDown={e => e.key === '.' && e.preventDefault()}
              onChange={e => this.props.onChangeSetValue(e, 'noOfRounds')}
              min={1}
              max={50}
              value={data.noOfRounds}
            />
            <InputWithHead heading={AppConstants.enhancedRoundRobinType} />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={x => this.onChangeSetValue(x, 'enhancedRoundRobinTypeRefId')}
              value={data.enhancedRoundRobinTypeRefId}
            >
              {(appState.enhancedRoundRobinTypes || []).map(round => (
                <Option key={`enhancedRoundRobinType_${round.id}`} value={round.id}>
                  {round.description}
                </Option>
              ))}
            </Select>
          </div>
        )}

        <span className="applicable-to-heading">{AppConstants.frequency}</span>
        <Radio.Group
          className="reg-competition-radio"
          onChange={e => this.onChangeSetValue(e.target.value, 'competitionTypeRefId')}
          value={data.competitionTypeRefId}
        >
          <div className="fluid-width">
            <div className="row">
              {(appState.typesOfCompetition || []).map(item => (
                <div className="col-sm">
                  <Radio key={`competitionType_${item.id}`} value={item.id}>
                    {item.description}
                  </Radio>
                </div>
              ))}
            </div>
          </div>
        </Radio.Group>

        <InputWithHead heading={AppConstants.timeBetweenRounds} />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead
                auto_complete="new-roundInDays"
                placeholder={AppConstants.days}
                value={data.roundInDays}
                onChange={e => this.onChangeSetValue(e.target.value, 'roundInDays')}
                heading={AppConstants._days}
                required={'pt-0'}
              />
            </div>
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead
                auto_complete="new-roundInHours"
                placeholder={AppConstants.hours}
                value={data.roundInHours}
                onChange={e => this.onChangeSetValue(e.target.value, 'roundInHours')}
                heading={AppConstants._hours}
                required={'pt-0'}
              />
            </div>
            <div className="col-sm" style={{ marginTop: 5 }}>
              <InputWithHead
                auto_complete="new-roundInMins"
                placeholder={AppConstants.mins}
                value={data.roundInMins}
                onChange={e => this.onChangeSetValue(e.target.value, 'roundInMins')}
                heading={AppConstants._minutes}
                required={'pt-0'}
              />
            </div>
          </div>
        </div>
        {(data.competionFormatDivisions || []).map((item, index) => (
          <div className="inside-container-view" key={`compFormat${index}`}>
            <div className="fluid-width">
              <div className="d-flex">
                <div className="applicable-to-heading pt-0">{AppConstants.applyMatchFormat}</div>
                <div
                  className="transfer-image-view pt-0 pointer ml-auto"
                  onClick={() => this.deleteModal(index)}
                >
                  <span className="user-remove-btn">
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </span>
                  <span className="user-remove-text">{AppConstants.remove}</span>
                </div>
                {this.deleteConfirmModalView(data.competionFormatDivisions)}
              </div>
              <Checkbox
                className="single-checkbox pt-2"
                checked={isAllDivisionChecked}
                onChange={e => this.onChangeAllDivision(e, data.competionFormatDivisions, index)}
              >
                {AppConstants.allDivisions}
              </Checkbox>
              {!isAllDivisionChecked && (
                <div className="fluid-width">
                  <div className="row">
                    <div className="col-sm">
                      <Select
                        mode="multiple"
                        className="w-100"
                        style={{ paddingRight: 1, minWidth: 182 }}
                        onChange={e => this.onChange(e, data.competionFormatDivisions, index)}
                        value={item.selectedDivisions}
                      >
                        {(item.divisions || []).map(division => (
                          <Option
                            key={`compMemProdDiv_${division.competitionMembershipProductDivisionId}`}
                            disabled={division.isDisabled}
                            value={division.competitionMembershipProductDivisionId}
                          >
                            {division.divisionsName}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {this.allDivisionModalView(data.competionFormatDivisions)}
                </div>
              )}
            </div>

            <div className="fluid-width">
              <div className="row">
                <div className="col-sm-3">
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
                      heading={AppConstants.matchDuration}
                      required="required-field"
                      placeholder={AppConstants.mins}
                      value={item.matchDuration}
                      onChange={e =>
                        this.onChangeSetCompFormatDivisionValue(
                          e.target.value,
                          'matchDuration',
                          data.competionFormatDivisions,
                          index,
                        )
                      }
                    />
                  </Form.Item>
                </div>
                {(data.matchTypeRefId == 2 || data.matchTypeRefId == 3) && (
                  <div className="col-sm-3">
                    <Form.Item
                      name={`mainBreak${index}`}
                      rules={[
                        {
                          required: data.matchTypeRefId == 2 || data.matchTypeRefId == 3,
                          message: ValidationConstants.mainBreak,
                        },
                      ]}
                    >
                      <InputWithHead
                        auto_complete="new-mainBreak"
                        heading={AppConstants.mainBreak}
                        required={
                          data.matchTypeRefId == 2 || data.matchTypeRefId == 3
                            ? 'required-field'
                            : null
                        }
                        placeholder={AppConstants.mins}
                        value={item.mainBreak}
                        onChange={e =>
                          this.onChangeSetCompFormatDivisionValue(
                            e.target.value,
                            'mainBreak',
                            data.competionFormatDivisions,
                            index,
                          )
                        }
                      />
                    </Form.Item>
                  </div>
                )}
                {data.matchTypeRefId == 3 && (
                  <div className="col-sm-3">
                    <Form.Item
                      name={`qtrBreak${index}`}
                      rules={[
                        {
                          required: data.matchTypeRefId == 3,
                          message: ValidationConstants.qtrBreak,
                        },
                      ]}
                    >
                      <InputWithHead
                        auto_complete="new-qtrBreak"
                        heading={AppConstants.qtrBreak}
                        placeholder={AppConstants.mins}
                        required={data.matchTypeRefId == 3 ? 'required-field' : null}
                        value={item.qtrBreak}
                        onChange={e =>
                          this.onChangeSetCompFormatDivisionValue(
                            e.target.value,
                            'qtrBreak',
                            data.competionFormatDivisions,
                            index,
                          )
                        }
                      />
                    </Form.Item>
                  </div>
                )}
                {data.timeslotGenerationRefId != 2 && (
                  <div className="col-sm-3">
                    <Form.Item
                      name={`timeBetweenGames${index}`}
                      rules={[{ required: true, message: ValidationConstants.timeBetweenGames }]}
                    >
                      <InputWithHead
                        auto_complete="new-timeBetweenGames"
                        heading={AppConstants.timeBetweenMatches}
                        placeholder={AppConstants.mins}
                        required="required-field"
                        value={item.timeBetweenGames}
                        onChange={e =>
                          this.onChangeSetCompFormatDivisionValue(
                            e.target.value,
                            'timeBetweenGames',
                            data.competionFormatDivisions,
                            index,
                          )
                        }
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
            </div>
            {data.competitionFormatRefId != 1 && (
              <div>
                <Checkbox
                  className="single-checkbox pt-2"
                  checked={item.isFinal}
                  onChange={e => this.onChangeFinal(e, data.competionFormatDivisions, index)}
                >
                  {AppConstants.applyFinalFormat}
                </Checkbox>
              </div>
            )}
          </div>
        ))}
        {/* <NavLink to="/competitionFinals">
                    <span className="input-heading-add-another">
                        {AppConstants.setUpFinalTemplate_optional}
                    </span>
                </NavLink> */}
        {!isAllDivisionChecked && (
          <span
            className="input-heading-add-another pointer"
            onClick={() => this.addCompetitionFormatDivision(data)}
          >
            + {AppConstants.addNewCompetitionFormat}
          </span>
        )}
        {/* <Checkbox
                    className="single-checkbox pt-2"
                    defaultChecked={data.isDefault}
                    onChange={(e) => this.onChangeSetValue(e.target.checked, 'isDefault')}
                >
                    {AppConstants.setAsDefault}
                </Checkbox> */}
      </div>
    );
  };

  allDivisionModalView = competitionFormatDivisions => (
    <div>
      <Modal
        title="Competition Format"
        visible={this.state.allDivisionVisible}
        onOk={() =>
          this.handleAllDivisionModal(
            false,
            'ok',
            this.state.currentIndex,
            competitionFormatDivisions,
          )
        }
        onCancel={() =>
          this.handleAllDivisionModal(
            false,
            'cancel',
            this.state.currentIndex,
            competitionFormatDivisions,
          )
        }
      >
        <p>This will remove the other competition formats.</p>
      </Modal>
    </div>
  );

  deleteConfirmModalView = competitionFormatDivisions => (
    <div>
      <Modal
        title="Competition Format"
        visible={this.state.deleteModalVisible}
        onOk={() =>
          this.handleDeleteModal(false, 'ok', this.state.currentIndex, competitionFormatDivisions)
        }
        onCancel={() =>
          this.handleDeleteModal(
            false,
            'cancel',
            this.state.currentIndex,
            competitionFormatDivisions,
          )
        }
      >
        <p>Are you sure you want to remove?</p>
      </Modal>
    </div>
  );

  /// ///footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm d-flex align-items-start">
            {/* <Button type="cancel-button">Cancel</Button> */}
          </div>
          <div className="col-sm">
            <div className="comp-finals-button-view">
              {/* <Button
                                className="save-draft-text"
                                type="save-draft-text"
                                onClick={()=> this.saveCompetitionFormats()}
                            >
                                {AppConstants.saveDraft}
                            </Button> */}
              <Button
                className="open-reg-button"
                type="primary"
                htmlType="submit"
                disabled={isSubmitting}
              >
                {AppConstants.createDraftDraw}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="2" />

        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveCompetitionFormats}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              {this.dropdownView()}
              <div className="formView">{this.contentView()}</div>
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
      getCompetitionFormatAction,
      saveCompetitionFormatAction,
      getMatchTypesAction,
      updateCompetitionFormatAction,
      getCompetitionFormatTypesAction,
      getCompetitionTypesAction,
      getYearAndCompetitionOwnAction,
      clearYearCompetitionAction,
      generateDrawAction,
      getEnhancedRoundRobinAction,
      getYearAndQuickCompetitionAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFormatState: state.CompetitionFormatState,
    appState: state.AppState,
    competitionModuleState: state.CompetitionModuleState,
    quickCompetitionState: state.QuickCompetitionState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickCompetitionMatchFormat);

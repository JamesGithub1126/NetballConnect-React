import React from 'react';
import { Select, Checkbox, Radio, Form, Input, Modal, message } from 'antd';
import AppConstants from 'themes/appConstants';
import InputWithHead from '../../../../customComponents/InputWithHead';
import { isArrayNotEmpty, randomKeyGen, isNotNullAndUndefined } from 'util/helpers';
import { ErrorType, PreferenceSetBy } from 'util/enums';
import { handleError } from 'util/messageHandler';
import { getOrganisationData } from 'util/sessionStorage';
import CompetitionAxiosApi from 'store/http/competitionHttp/competitionAxiosApi';
import ValidationConstants from 'themes/validationConstant';
import CommonAxiosApi from 'store/http/commonHttp/commonAxiosApi';
import Loader from '../../../../customComponents/loader';
import './style.css';
import AppUniqueId from 'themes/appUniqueId';

const { Option } = Select;
const { confirm } = Modal;
const GradeType = {
  HomeAndAway: 1,
  DayAndTime: 2,
  HomeField: 3,
};
export default class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gradeList: [],
      allowTeamPreferences: 0,
      round1HomeAndAwayPreference: false,
      competitionDayAndTimePreference: false,
      homeFieldPreference: false,
      preferencesSetByRefId: PreferenceSetBy.CompetitionOrganiserToSet,
      useAffiliateRanking: 0,
      affiliateList: [],
      affiliateRankingList: [],
      homeAndAwayAllChecked: false,
      dayAndTimeAllChecked: false,
      homeFieldAllChecked: false,
      preferenceSetByList: [],
      loading: false,
    };
    this.formRef = this.props.formRef;
  }

  componentDidMount() {
    if (this.props.competitionId) {
      this.getCompetitionDivisionGradeList();
      this.getAffiliateList();
      this.referenceCall();
      this.getCompetitionDrawPreference();
    } else {
      //competitionid will be null when switch yearid  in a short time
      this.resetPreference();
    }
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  //#region  event

  onAllowTeamPreferencesChanged = e => {
    let value = e.target.value;
    this.setState({ allowTeamPreferences: value });
    if (value == 0) {
      this.resetTeamPreferencesSetBy();
      this.resetRound1HomeAndAwayPreferenceGrade();
      this.resetCompetitionDayAndTimePreferenceGrade();
      this.resetHomeFieldPreferenceGrade();
    }
    this.setState({ formChanged: true });
  };

  onRound1HomeAndAwayPreferenceChanged = e => {
    let value = e.target.checked;
    this.setState({ round1HomeAndAwayPreference: value });
    if (!value) {
      this.resetRound1HomeAndAwayPreferenceGrade();
    }
    this.setState({ formChanged: true });
  };

  onCompetitionDayAndTimePreferenceChanged = e => {
    let value = e.target.checked;
    this.setState({ competitionDayAndTimePreference: value });
    if (!value) {
      this.resetCompetitionDayAndTimePreferenceGrade();
    }
    this.setState({ formChanged: true });
  };

  onHomeFieldPreferenceChanged = e => {
    let value = e.target.checked;
    this.setState({ homeFieldPreference: value });
    if (!value) {
      this.resetHomeFieldPreferenceGrade();
    }
    this.setState({ formChanged: true });
  };

  onTeamPreferencesSetByChanged = e => {
    let value = e.target.value;
    this.setState({ preferencesSetByRefId: value });
    if (value == 1) {
      this.resetUseAffiliateRanking();
    }
    this.setState({ formChanged: true });
  };

  addAffiliateRanking = () => {
    const { affiliateRankingList } = this.state;
    let ranks = affiliateRankingList.map(r => r.rank);
    affiliateRankingList.push({
      id: randomKeyGen(48),
      affiliateId: null,
      rank: ranks.length ? Math.max(...ranks) + 1 : 1,
    });
    this.setState({ affiliateRankingList: [...affiliateRankingList] });
    this.setState({ formChanged: true });
  };

  removeAffliateRanking = item => {
    const { affiliateRankingList } = this.state;
    const index = affiliateRankingList.findIndex(a => a.id == item.id);
    if (index > -1) {
      affiliateRankingList.splice(index, 1);
      this.setState({ affiliateRankingList: [...affiliateRankingList] });
    }
    this.setState({ formChanged: true });
  };

  onChangeAllDivision = (type, e) => {
    let { homeAndAwayAllChecked, dayAndTimeAllChecked, homeFieldAllChecked, gradeList } =
      this.state;
    const allGrades = gradeList.map(g => g.competitionDivisionGradeId);
    let checked = e.target.checked;
    let selectField = '';
    switch (type) {
      case GradeType.HomeAndAway:
        homeAndAwayAllChecked = checked;
        selectField = 'round1HomeAndAwayPreferenceGrades';
        break;
      case GradeType.DayAndTime:
        dayAndTimeAllChecked = checked;
        selectField = 'competitionDayAndTimePreferenceGrades';
        break;
      case GradeType.HomeField:
        homeFieldAllChecked = checked;
        selectField = 'homeFieldPreferenceGrades';
        break;
      default:
        break;
    }
    if (checked && selectField) {
      this.formRef.current.setFieldsValue({ [selectField]: allGrades });
    }
    this.setState({
      homeAndAwayAllChecked,
      dayAndTimeAllChecked,
      homeFieldAllChecked,
      formChanged: true,
    });
  };

  onUseAffiliateRankingChanged = e => {
    let value = e.target.value;
    this.setState({ useAffiliateRanking: value });

    if (value == 0) {
      this.resetAffiliateRanking();
    }
    this.setState({ formChanged: true });
  };

  onGradeChanged = type => {
    let { homeAndAwayAllChecked, dayAndTimeAllChecked, homeFieldAllChecked } = this.state;
    switch (type) {
      case GradeType.HomeAndAway:
        homeAndAwayAllChecked = false;
        break;
      case GradeType.DayAndTime:
        dayAndTimeAllChecked = false;
        break;
      case GradeType.HomeField:
        homeFieldAllChecked = false;
        break;
      default:
        break;
    }
    this.setState({
      homeAndAwayAllChecked,
      dayAndTimeAllChecked,
      homeFieldAllChecked,
      formChanged: true,
    });
  };

  onAffiliateChanged = (item, value) => {
    const { affiliateRankingList } = this.state;
    let rank = affiliateRankingList.find(r => r.id == item.id);
    if (rank) {
      rank.affiliateId = value;
      this.setState({ affiliateRankingList: [...affiliateRankingList] });
    }
    this.setState({ formChanged: true });
  };

  //#endregion

  //#region  reset form

  resetPreference = () => {
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({ allowTeamPreferences: 0 });
      this.setState({ allowTeamPreferences: 0 });
      this.resetTeamPreferencesSetBy();
      this.resetRound1HomeAndAwayPreferenceGrade();
      this.resetCompetitionDayAndTimePreferenceGrade();
      this.resetHomeFieldPreferenceGrade();
    }
  };

  resetTeamPreferencesSetBy = () => {
    this.setState({ preferencesSetByRefId: PreferenceSetBy.CompetitionOrganiserToSet });
    this.formRef.current.setFieldsValue({
      preferencesSetByRefId: PreferenceSetBy.CompetitionOrganiserToSet,
    });
    this.resetUseAffiliateRanking();
  };

  resetUseAffiliateRanking = () => {
    this.setState({ useAffiliateRanking: 0 });
    this.formRef.current.setFieldsValue({ useAffiliateRanking: 0 });
    this.resetAffiliateRanking();
  };

  resetAffiliateRanking = () => {
    const { affiliateRankingList } = this.state;
    let form = {};
    for (let rank of affiliateRankingList) {
      form[`rankAffiliateId_${rank.id}`] = null;
    }
    this.formRef.current.setFieldsValue(form);
    this.setState({ affiliateRankingList: [] });
  };

  resetRound1HomeAndAwayPreferenceGrade = () => {
    this.setState({ round1HomeAndAwayPreference: false, homeAndAwayAllChecked: false });
    this.formRef.current.setFieldsValue({
      round1HomeAndAwayPreferenceGrades: [],
      round1HomeAndAwayPreference: false,
    });
  };

  resetCompetitionDayAndTimePreferenceGrade = () => {
    this.setState({ competitionDayAndTimePreference: false, dayAndTimeAllChecked: false });
    this.formRef.current.setFieldsValue({
      competitionDayAndTimePreferenceGrades: [],
      competitionDayAndTimePreference: false,
    });
  };

  resetHomeFieldPreferenceGrade = () => {
    this.setState({ homeFieldPreference: false, homeFieldAllChecked: false });
    this.formRef.current.setFieldsValue({
      homeFieldPreferenceGrades: [],
      homeFieldPreference: false,
    });
  };
  //#endregion

  //#region method

  getCompetitionDivisionGradeList = async () => {
    try {
      const result = await CompetitionAxiosApi.competitionDivisionGradeList(
        this.props.competitionId,
      );
      if (result.status === 1) {
        let gradeList = result.result.data;
        if (!isArrayNotEmpty(gradeList)) {
          gradeList = [];
        }
        setTimeout(() => {
          this.setAllGradesForm(gradeList);
        }, 100);
        this.setState({ gradeList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };

  //sometimes gradelist response is later arrived than competitiondrawpreference response,
  setAllGradesForm = gradeList => {
    let { homeAndAwayAllChecked, dayAndTimeAllChecked, homeFieldAllChecked } = this.state;
    let gradeIds = gradeList.map(g => g.competitionDivisionGradeId);
    let form = {};

    if (homeAndAwayAllChecked) {
      form['round1HomeAndAwayPreferenceGrades'] = [...gradeIds];
    }

    if (dayAndTimeAllChecked) {
      form['competitionDayAndTimePreferenceGrades'] = [...gradeIds];
    }

    if (homeFieldAllChecked) {
      form['homeFieldPreferenceGrades'] = [...gradeIds];
    }

    this.formRef.current.setFieldsValue(form);
  };

  getAffiliateList = async () => {
    const orgItem = getOrganisationData();
    if (!orgItem) return;
    try {
      const result = await CompetitionAxiosApi.competitionAffiliateList(this.props.competitionId);
      if (result.status === 1) {
        let affiliateList = result.result.data;
        if (!isArrayNotEmpty(affiliateList)) {
          affiliateList = [];
        }
        this.setState({ affiliateList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };

  referenceCall = async () => {
    try {
      this.setState({ refLoading: true });
      const result = await CommonAxiosApi.getGenericCommanData({
        PreferenceSetBy: 'PreferenceSetBy',
      });
      if (result.status === 1) {
        let preferenceSetByList = result.result.data.PreferenceSetBy || [];
        this.setState({ preferenceSetByList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };

  setAffiliateStatus = rank => {
    const { affiliateRankingList, affiliateList } = this.state;
    const newAffliateList = affiliateList.map(aff => {
      return { ...aff };
    });
    for (let affiliate of newAffliateList) {
      let affRank = affiliateRankingList.find(aff => aff.affiliateId == affiliate.id);
      if (affRank) {
        affiliate.disabled = rank.affiliateId ? rank.affiliateId !== affiliate.id : true;
      }
    }
    return newAffliateList;
  };

  getCompetitionDrawPreference = async () => {
    try {
      this.setState({ loading: true });
      const result = await CompetitionAxiosApi.competitionDrawPreference(this.props.competitionId);
      if (result.status === 1) {
        let preference = result.result.data;
        if (preference) {
          this.setFormField(preference);
        } else {
          this.resetPreference();
        }
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  setFormField = values => {
    //const { affiliateRankingList } = this.state;
    const {
      affiliateRanking,
      allowTeamPreferences,
      competitionDayAndTimePreference,
      competitionDayAndTimePreferenceGrades,
      homeFieldPreference,
      homeFieldPreferenceGrades,
      id,
      preferencesSetByRefId,
      round1HomeAndAwayPreference,
      round1HomeAndAwayPreferenceGrades,
      useAffiliateRanking,
    } = values;
    let { homeAndAwayAllChecked, dayAndTimeAllChecked, homeFieldAllChecked, gradeList } =
      this.state;
    let gradeIds = gradeList.map(g => g.competitionDivisionGradeId);
    let form = {};
    let affiliateRankingList = isArrayNotEmpty(affiliateRanking) ? affiliateRanking : [];
    affiliateRankingList.forEach(ar => (ar.id = randomKeyGen(48)));
    for (let rank of affiliateRankingList) {
      form[`rankAffiliateId_${rank.id}`] = rank.affiliateId;
    }
    form['allowTeamPreferences'] = allowTeamPreferences;
    form['useAffiliateRanking'] = useAffiliateRanking;
    form['id'] = id;

    form['competitionDayAndTimePreference'] = competitionDayAndTimePreference;
    if (competitionDayAndTimePreference) {
      if (isNotNullAndUndefined(competitionDayAndTimePreferenceGrades)) {
        if (!competitionDayAndTimePreferenceGrades.length) {
          dayAndTimeAllChecked = true;
          form['competitionDayAndTimePreferenceGrades'] = [...gradeIds];
        } else {
          dayAndTimeAllChecked = false;
          form['competitionDayAndTimePreferenceGrades'] = [...gradeIds];
        }
      }
    }
    //form['competitionDayAndTimePreferenceGrades'] = competitionDayAndTimePreferenceGrades;

    form['homeFieldPreference'] = homeFieldPreference;
    if (homeFieldPreference) {
      if (isNotNullAndUndefined(homeFieldPreferenceGrades)) {
        if (!homeFieldPreferenceGrades.length) {
          homeFieldAllChecked = true;
          form['homeFieldPreferenceGrades'] = [...gradeIds];
        } else {
          homeFieldAllChecked = false;
          form['homeFieldPreferenceGrades'] = homeFieldPreferenceGrades;
        }
      }
    }
    //form['homeFieldPreferenceGrades'] = homeFieldPreferenceGrades;

    form['preferencesSetByRefId'] = preferencesSetByRefId;
    form['round1HomeAndAwayPreference'] = round1HomeAndAwayPreference;
    if (round1HomeAndAwayPreference) {
      if (isNotNullAndUndefined(round1HomeAndAwayPreferenceGrades)) {
        if (!round1HomeAndAwayPreferenceGrades.length) {
          homeAndAwayAllChecked = true;
          form['round1HomeAndAwayPreferenceGrades'] = [...gradeIds];
        } else {
          homeAndAwayAllChecked = false;
          form['round1HomeAndAwayPreferenceGrades'] = round1HomeAndAwayPreferenceGrades;
        }
      }
    }
    //form['round1HomeAndAwayPreferenceGrades'] = round1HomeAndAwayPreferenceGrades;

    this.setState({
      affiliateRankingList,
      homeAndAwayAllChecked,
      dayAndTimeAllChecked,
      homeFieldAllChecked,
      allowTeamPreferences,
      competitionDayAndTimePreference,
      homeFieldPreference,
      round1HomeAndAwayPreference,
      useAffiliateRanking,
      preferencesSetByRefId,
    });

    this.formRef.current.setFieldsValue(form);
  };

  getForm = async () => {
    let result = null;
    let form = null;
    try {
      result = await this.formRef.current.validateFields();
      let {
        id,
        allowTeamPreferences,
        competitionDayAndTimePreference,
        competitionDayAndTimePreferenceGrades,
        homeFieldPreference,
        homeFieldPreferenceGrades,
        round1HomeAndAwayPreference,
        round1HomeAndAwayPreferenceGrades,
        preferencesSetByRefId,
        useAffiliateRanking,
      } = result;
      if (!preferencesSetByRefId) {
        preferencesSetByRefId = PreferenceSetBy.CompetitionOrganiserToSet;
      }
      const {
        homeAndAwayAllChecked,
        dayAndTimeAllChecked,
        homeFieldAllChecked,
        affiliateRankingList,
      } = this.state;
      let affiliateRanking = [];
      if (isArrayNotEmpty(affiliateRankingList)) {
        for (let affRank of affiliateRankingList) {
          const { affiliateId, rank } = affRank;
          affiliateRanking.push({ affiliateId, rank });
        }
      }
      form = {
        competitionId: this.props.competitionId,
        id,
        allowTeamPreferences,
        competitionDayAndTimePreference,
        competitionDayAndTimePreferenceGrades,
        homeFieldPreference,
        homeFieldPreferenceGrades,
        round1HomeAndAwayPreference,
        round1HomeAndAwayPreferenceGrades,
        preferencesSetByRefId,
        useAffiliateRanking,
        homeAndAwayAllChecked,
        dayAndTimeAllChecked,
        homeFieldAllChecked,
        affiliateRanking,
      };
    } catch (error) {
      console.log(error);
    }

    return form;
  };

  saveForm = async callback => {
    let form = await this.getForm();
    if (form) {
      this.setState({ loading: true });
      try {
        const result = await CompetitionAxiosApi.saveCompetitionDrawPreference(form);
        if (result.status === 1) {
          if (callback) {
            callback(form);
          }
          return;
        } else {
          handleError({ result, type: ErrorType.Failed });
        }
      } catch (error) {
        handleError({ type: ErrorType.Error, error });
      }
      this.setState({ loading: false });
    }
  };
  showSavePreferenceConfirm = async callback => {
    let form = await this.getForm();
    if (form.allowTeamPreferences) {
      if (
        !form.competitionDayAndTimePreference &&
        !form.homeFieldPreference &&
        !form.round1HomeAndAwayPreference
      ) {
        message.error(AppConstants.enableATeamPreference);
        return;
      }
    }
    if (form.id > 0 && this.state.formChanged) {
      const this_ = this;
      confirm({
        title: AppConstants.saveTeamPreferenceConfirmMsg,
        okText: AppConstants.yes,
        okType: AppConstants.primary,
        cancelText: AppConstants.no,
        onOk() {
          this_.saveForm(callback);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else {
      this.saveForm(callback);
    }
  };
  //#endregion

  //#region  partial view

  gradeListView = type => {
    let checkall = false;
    let selectField = '';
    let preferenceChecked = false;
    const {
      round1HomeAndAwayPreference,
      competitionDayAndTimePreference,
      homeFieldPreference,
      homeAndAwayAllChecked,
      dayAndTimeAllChecked,
      homeFieldAllChecked,
      gradeList,
    } = this.state;
    switch (type) {
      case GradeType.HomeAndAway:
        checkall = homeAndAwayAllChecked;
        selectField = 'round1HomeAndAwayPreferenceGrades';
        preferenceChecked = round1HomeAndAwayPreference;
        break;
      case GradeType.DayAndTime:
        checkall = dayAndTimeAllChecked;
        selectField = 'competitionDayAndTimePreferenceGrades';
        preferenceChecked = competitionDayAndTimePreference;
        break;
      case GradeType.HomeField:
        checkall = homeFieldAllChecked;
        selectField = 'homeFieldPreferenceGrades';
        preferenceChecked = homeFieldPreference;
        break;
      default:
        break;
    }
    return (
      <>
        <Checkbox
          className="single-checkbox pt-2"
          checked={checkall}
          onChange={this.onChangeAllDivision.bind(this, type)}
        >
          {AppConstants.allDivisionGrades}
        </Checkbox>

        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <Form.Item
                name={`${selectField}`}
                rules={[
                  {
                    required: preferenceChecked,
                    message: ValidationConstants.gradeIsRequired,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  className="w-100"
                  onChange={this.onGradeChanged.bind(this, type)}
                >
                  {gradeList.map(item => (
                    <Option
                      value={item.competitionDivisionGradeId}
                      key={'grade_' + item.competitionDivisionGradeId}
                    >
                      {item.gradeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
      </>
    );
  };

  rankView = () => {
    const { affiliateRankingList } = this.state;
    return (
      <div className="pt-5">
        <span className="form-heading required-field">{AppConstants.affiliateRanking}</span>
        <div className="comp-venue-time-inside-container-view">
          <div className="row">
            <div className="col-sm-3">{AppConstants.rank}</div>
            <div className="col-sm-7">{AppConstants.affiliate}</div>
            <div className="col-sm-2"></div>
          </div>
          <br />
          {affiliateRankingList.map((item, index) => (
            <div key={index} className="col-sm">
              {this.rankingListView(item, index)}
            </div>
          ))}

          <span
            onClick={this.addAffiliateRanking}
            style={{ cursor: 'pointer' }}
            className="input-heading-add-another"
          >
            + {AppConstants.addAnother}
          </span>
        </div>
      </div>
    );
  };

  rankingListView(rank, index) {
    const affiliateList = this.setAffiliateStatus(rank);
    return (
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm-3">
            <Form.Item name={`ranking_${rank.id}`}>{rank.rank}</Form.Item>
          </div>

          <div className="col-sm-7">
            <Form.Item
              name={`rankAffiliateId_${rank.id}`}
              rules={[{ required: true, message: ValidationConstants.affiliateField }]}
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) => {
                  if (!option.children) return -1;
                  return option.children.toLowerCase().indexOf(input) >= 0;
                }}
                onChange={this.onAffiliateChanged.bind(this, rank)}
                className="w-100"
              >
                {affiliateList.map(item => (
                  <Option disabled={item.disabled} value={item.id} key={'grade_' + item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="col-sm-2 delete-image-view pb-4">
            <span className="user-remove-btn" onClick={this.removeAffliateRanking.bind(this, rank)}>
              <i className="fa fa-trash-o" aria-hidden="true" />
            </span>
            {/*  <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span> */}
          </div>
        </div>
      </div>
    );
  }
  //#endregion
  render() {
    const {
      allowTeamPreferences,
      round1HomeAndAwayPreference,
      competitionDayAndTimePreference,
      homeFieldPreference,
      preferencesSetByRefId,
      useAffiliateRanking,
      preferenceSetByList,
      loading,
    } = this.state;
    return (
      <>
        <div className="content-view pt-4">
          <InputWithHead required="required-field" heading={AppConstants.allowTeamPreferences} />
          <Form.Item name="allowTeamPreferences">
            <Radio.Group
              className="reg-competition-radio"
              onChange={this.onAllowTeamPreferencesChanged}
              defaultValue={0}
              disabled={this.props.disabled}
            >
              <Radio value={0} data-testid={AppUniqueId.TEAM_PREFERENCE_NO}>
                {AppConstants.no}
              </Radio>
              <Radio value={1} data-testid={AppUniqueId.TEAM_PREFERENCE_YES}>
                {AppConstants.yes}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {this.props.hasInvitedAffiliates && allowTeamPreferences ? (
            <div className="ml-5">
              <Form.Item name="preferencesSetByRefId">
                <Radio.Group
                  className="reg-competition-radio"
                  defaultValue={PreferenceSetBy.CompetitionOrganiserToSet}
                  onChange={this.onTeamPreferencesSetByChanged}
                >
                  {preferenceSetByList.map(item => (
                    <Radio
                      key={`teamPreferencesSetBy_${item.id}`}
                      value={item.id}
                      data-testid={AppUniqueId.SELECT_BUTTON + item.description}
                    >
                      {item.description}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </div>
          ) : null}

          {allowTeamPreferences ? (
            <>
              <InputWithHead
                required="required-field"
                heading={AppConstants.whichPreferencesAllowToBeSet}
              />
              <Form.Item name="round1HomeAndAwayPreference" valuePropName="checked">
                <Checkbox
                  data-testid={AppUniqueId.TEAM_PREFERENCE + 'round1HomeAndAwayPreference'}
                  onChange={this.onRound1HomeAndAwayPreferenceChanged}
                >
                  <span className="sub-label">{AppConstants.round1HomeAndAwayPreference}</span>
                </Checkbox>
              </Form.Item>
              {round1HomeAndAwayPreference ? (
                <div className="ml-5">{this.gradeListView(GradeType.HomeAndAway)}</div>
              ) : null}

              <Form.Item name="competitionDayAndTimePreference" valuePropName="checked">
                <Checkbox
                  data-testid={AppUniqueId.TEAM_PREFERENCE + 'competitionDayAndTimePreference'}
                  onChange={this.onCompetitionDayAndTimePreferenceChanged}
                >
                  <span className="sub-label">{AppConstants.competitionDayAndTimePreference}</span>
                </Checkbox>
              </Form.Item>

              {competitionDayAndTimePreference ? (
                <div className="ml-5">{this.gradeListView(GradeType.DayAndTime)}</div>
              ) : null}

              <Form.Item name="homeFieldPreference" valuePropName="checked">
                <Checkbox
                  data-testid={AppUniqueId.TEAM_PREFERENCE + 'homeFieldPreference'}
                  onChange={this.onHomeFieldPreferenceChanged}
                >
                  <span className="sub-label">{AppConstants.homeFieldPreference}</span>
                </Checkbox>
              </Form.Item>
              {homeFieldPreference ? (
                <div className="ml-5">{this.gradeListView(GradeType.HomeField)}</div>
              ) : null}
            </>
          ) : null}
          {preferencesSetByRefId == PreferenceSetBy.AffiliateToSet ? (
            <>
              <InputWithHead required="required-field" heading={AppConstants.useAffiliateRanking} />
              <Form.Item name="useAffiliateRanking">
                <Radio.Group
                  className="reg-competition-radio"
                  defaultValue={0}
                  onChange={this.onUseAffiliateRankingChanged}
                  value={this.state.useAffiliateRanking}
                >
                  <Radio value={0}>{AppConstants.no}</Radio>
                  <Radio value={1}>{AppConstants.yes}</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          ) : null}
          {useAffiliateRanking ? this.rankView() : null}
        </div>
        <Form.Item name="id">
          <Input hidden />
        </Form.Item>

        <Loader visible={loading} />
      </>
    );
  }
}

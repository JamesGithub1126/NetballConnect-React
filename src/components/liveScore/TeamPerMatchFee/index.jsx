import React, { Component } from 'react';
import { Layout, Breadcrumb, Form, Select, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Loader from '../../../customComponents/loader';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import DashboardLayout from '../../../pages/dashboardLayout';
import AppConstants from 'themes/appConstants';
import { getLiveScoreCompetition, getOrganisationData } from 'util/sessionStorage';
import history from 'util/history';
import { getTimeZone, isArrayNotEmpty } from 'util/helpers';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import RegistrationAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';
import { handleError } from 'util/messageHandler';
import { ErrorType } from 'util/enums';
import TeamFeePerMatchDashboard from './teamPerMatchFee';
import TeamSpecificMatchFee from './teamSpecificMatch';
import AppImages from '../../../themes/appImages';
import './index.css';

const { Content } = Layout;
const { Option } = Select;

const PageModel = {
  TeamPerMatchFee: 1,
  TeamSpecificMatch: 2,
};

export default class TeamFeePerMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      competitionId: null,
      searchText: '',
      selectedDivision: 'All',
      selectedRound: 'All',
      compOrgId: 0,
      liveScoreCompIsParent: false,
      divisionList: [],
      roundList: [],
      divisionLoading: false,
      roundLoading: false,
      pagemodel: PageModel.TeamPerMatchFee,
      selectedTeam: null,
      search: null,
      loading: false,
    };
  }

  // componentDidMount
  async componentDidMount() {
    const competition = getLiveScoreCompetition();
    if (!competition) {
      history.push('/matchDayCompetitions');
      return;
    }
    const { id: competitionId, competitionOrganisation, organisationId } = JSON.parse(competition);
    const orgItem = await getOrganisationData();
    const userOrganisationId = orgItem ? orgItem.organisationId : 0;
    const liveScoreCompIsParent = userOrganisationId === organisationId;
    const compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;

    if (competitionId !== null) {
      this.competitionId = competitionId;
      this.liveScoreCompIsParent = liveScoreCompIsParent;
      this.compOrgId = compOrgId;
      this.getDivisions();
      this.getRounds('');
      this.setState({ competitionId });
    } else {
      history.pushState('/matchDayCompetitions');
    }
  }

  //#region  api call

  getDivisions = async () => {
    try {
      this.setState({ divisionLoading: true });
      const result = await LiveScoreAxiosApi.liveScoreGetDivision(
        this.competitionId,
        undefined,
        undefined,
        undefined,
        this.liveScoreCompIsParent,
        this.compOrgId,
      );
      if (result.status === 1) {
        let divisionList = result.result.data;
        if (!isArrayNotEmpty(divisionList)) {
          divisionList = [];
        }
        this.getRounds('');
        this.setState({ divisionList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ divisionLoading: false });
  };

  removeDuplicateValues = array => {
    return array.filter(
      (obj, index, self) => index === self.findIndex(el => el['name'] === obj['name']),
    );
  };

  getRounds = async divisionId => {
    try {
      this.setState({ roundLoading: true });
      const result = await LiveScoreAxiosApi.liveScoreRound(
        this.competitionId,
        divisionId,
        this.liveScoreCompIsParent,
        this.compOrgId,
      );
      if (result.status === 1) {
        let roundList = result.result.data;
        roundList.sort((a, b) => Number(a.sequence) - Number(b.sequence));
        roundList = this.removeDuplicateValues(roundList);
        if (!isArrayNotEmpty(roundList)) {
          roundList = [];
        }
        this.setState({ roundList });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ roundLoading: false });
  };

  //#endregion

  //#region  event

  // on change search text
  onChangeSearchText = e => {
    const value = e.target.value;
    this.setState({ searchText: value });
    if (value === null || value === '') {
      this.setState({ search: null });
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    var code = e.keyCode || e.which;
    if (code === 13) {
      this.setState({ search: this.state.searchText });
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ search: this.state.searchText });
  };

  onChangeDivision = selectedDivision => {
    this.getRounds(selectedDivision == 'All' ? '' : selectedDivision);
    this.setState({ selectedDivision, selectedRound: AppConstants.all });
  };

  onChangeRound = selectedRound => {
    this.setState({ selectedRound });
  };

  onHandleTeamClick = record => {
    this.filterFormRef.current.setFieldsValue({ searchText: null });
    this.setState({ pagemodel: PageModel.TeamSpecificMatch, selectedTeam: record, search: null });
  };

  onBackToTeamClick = record => {
    this.setState({ pagemodel: PageModel.TeamPerMatchFee, selectedTeam: null });
  };

  onExport = async () => {
    const {
      selectedTeam,
      selectedRound: roundName,
      selectedDivision: divisionId,
      competitionId,
      search: searchText,
    } = this.state;

    if (!competitionId) {
      return null;
    }

    const body = {
      competitionId,
      divisionId,
      roundName,
      teamId: selectedTeam.teamId,
      searchText,
      isTeamQuery: false,
      paging: {
        limit: 10000,
        offset: 0,
      },
      timeZone: getTimeZone(),
    };
    try {
      this.setState({ loading: true });
      await RegistrationAxiosApi.exportTeamPerMatchFeeList(body);
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  //#endregion

  //#region view

  headerView = () => {
    const { pagemodel } = this.state;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="row">
          <div className="col-sm" style={{ alignSelf: 'center' }}>
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.teamPerMatchFees}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          {pagemodel == PageModel.TeamSpecificMatch && (
            <div className="col-sm d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                <div className="col-sm d-flex">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-end align-self-center justify-content-end">
                    <Button
                      onClick={this.onExport}
                      className="primary-add-comp-form"
                      type="primary"
                    >
                      <div className="row">
                        <div className="col-sm">
                          <img
                            src={AppImages.export}
                            alt=""
                            height="12"
                            width="12"
                            style={{ marginRight: 5 }}
                          />
                          {AppConstants.export}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  filterFormRef = React.createRef();

  dropdownView = () => {
    let { divisionList, roundList, roundLoading, divisionLoading } = this.state;
    return (
      <Form ref={this.filterFormRef}>
        <div className="comp-player-grades-header-drop-down-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-filter-col-cont pb-3">
                <span className="year-select-heading" style={{ minWidth: 70 }}>
                  {AppConstants.division}:
                </span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  onChange={divisionId => this.onChangeDivision(divisionId)}
                  value={this.state.selectedDivision}
                  loading={divisionLoading}
                >
                  <Option value="All">All</Option>
                  {divisionList.map(item => (
                    <Option key={'division_' + item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm">
              <div className="reg-filter-col-cont pb-3">
                <span className="year-select-heading">{AppConstants.round}:</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  onChange={roundName => this.onChangeRound(roundName)}
                  value={this.state.selectedRound}
                  loading={roundLoading}
                >
                  {<Option value="All">All</Option>}
                  {roundList.map(item => (
                    <Option key={'round_' + item.id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm d-flex justify-content-end align-items-center">
              <div className="comp-product-search-inp-width pb-3">
                <Form.Item name="searchText">
                  <Input
                    className="product-reg-search-input"
                    onChange={this.onChangeSearchText}
                    placeholder="Search..."
                    onKeyPress={this.onKeyEnterSearchText}
                    /*  value={this.state.searchText} */
                    prefix={
                      <SearchOutlined
                        style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                        onClick={this.onClickSearchIcon}
                      />
                    }
                    allowClear
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </Form>
    );
  };

  //#endregion

  render() {
    const {
      pagemodel,
      selectedTeam,
      selectedRound: roundName,
      selectedDivision: divisionId,
      competitionId,
      search: searchText,
    } = this.state;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="teamPerMatchFee" />
        <Loader visible={this.state.loading} />
        <Layout>
          {this.headerView()}
          {this.dropdownView()}
          <Content>
            {pagemodel == PageModel.TeamPerMatchFee ? (
              <TeamFeePerMatchDashboard
                onHandleTeamClick={this.onHandleTeamClick}
                query={{ roundName, divisionId, competitionId, searchText }}
              />
            ) : null}
            {pagemodel == PageModel.TeamSpecificMatch ? (
              <div>
                <div className=" back-menu input-heading-add-another pt-0">
                  <a onClick={this.onBackToTeamClick}>{AppConstants.backToAllTeams}</a>{' '}
                </div>
                <TeamSpecificMatchFee
                  selectedTeam={selectedTeam}
                  query={{
                    roundName,
                    divisionId,
                    competitionId,
                    searchText,
                    teamId: selectedTeam.teamId,
                  }}
                />
              </div>
            ) : null}
          </Content>
        </Layout>
      </div>
    );
  }
}

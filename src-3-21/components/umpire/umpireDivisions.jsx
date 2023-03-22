import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import {
  Layout, Button, Select, Breadcrumb, Form, Modal, Spin, message,
} from 'antd';

import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import history from 'util/history';
import { getCurrentYear } from 'util/permissions';
import { isEqual } from 'lodash';
import { UmpireAllocationTypeEnum } from 'enums/enums';
import { getRefBadgeData, getOnlyYearListAction } from '../../store/actions/appAction';
import { umpireCompetitionListAction } from '../../store/actions/umpireAction/umpireCompetetionAction';
import {
  getUmpirePoolData,
  updateUmpirePoolToDivision,
  applyUmpireAllocatioAlgorithm,
} from '../../store/actions/umpireAction/umpirePoolAllocationAction';
import {
  liveScoreGetDivision,
  liveScoreGetRounds,
} from '../../store/actions/LiveScoreAction/liveScoreTeamAction';

import {
  getUmpireCompetitionId,
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  getLiveScoreCompetition,
  setCompDataForAll,
} from '../../util/sessionStorage';
import { isArrayNotEmpty } from '../../util/helpers';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import Loader from '../../customComponents/loader';

import AppConstants from '../../themes/appConstants';
import './umpire.css';

const { Header } = Layout;
const { Option } = Select;

class UmpireDivisions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      selectedComp: getUmpireCompetitionId(),
      loading: false,
      competitionUniqueKey: null,
      umpirePoolData: props.umpirePoolAllocationState?.umpirePoolData,
      selectedDivisions: [],
      allowUmpireAllocation: false,
      algorithmModalVisible: false,
      selectedRounds: [],
    };
  }

  componentDidMount() {
    const { organisationId } = getOrganisationData() || {};
    this.setState({ loading: true });
    this.props.getOnlyYearListAction();
    this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');
    this.props.getRefBadgeData();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.umpireCompetitionState, this.props.umpireCompetitionState)) {
      if (this.state.loading && this.props.umpireCompetitionState.onLoad == false) {
        const compList = this.props.umpireCompetitionState.umpireComptitionList
          && isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
          ? this.props.umpireCompetitionState.umpireComptitionList
          : [];
        const livescoresCompetition = getLiveScoreCompetition()
          ? JSON.parse(getLiveScoreCompetition())
          : null;
        const organisation = getOrganisationData();
        const organisationId = organisation?.organisationId ?? null;
        const globalYear = Number(getGlobalYear());
        const canUseExistingComp = !!livescoresCompetition?.id
          && !!organisationId
          && livescoresCompetition.yearRefId === globalYear
          && [
            livescoresCompetition?.competitionOrganisation?.orgId,
            livescoresCompetition.organisationId,
          ].includes(organisationId);

        let competition = null;
        if (canUseExistingComp) {
          competition = compList.find((c) => c.id === livescoresCompetition.id);
        }
        if (!competition) {
          // get the first comp in the list
          competition = compList && compList.length ? compList[0] : null;
        }
        const competitionId = competition?.id ?? null;
        const competitionUniqueKey = competition?.uniqueKey ?? null;

        setCompDataForAll(competition);
        if (competitionId) {
          this.props.liveScoreGetDivision(competitionId);
          this.props.getUmpirePoolData({ orgId: organisationId || 0, compId: competitionId });
          this.props.liveScoreGetRounds(competitionId);
        }

        const selectedComp = compList ? compList.find((item) => item.id === competitionId) : null;
        const isOrganiser = selectedComp && selectedComp?.organisationId && organisationId
          ? selectedComp?.organisationId === organisationId
          : false;
        const isOfficialOrganisation = selectedComp && selectedComp?.officialOrganisationId && organisationId
          ? selectedComp?.officialOrganisationId === organisationId
          : false;

        this.setState({
          selectedComp: competitionId,
          loading: false,
          competitionUniqueKey,
          allowUmpireAllocation: isOrganiser || isOfficialOrganisation,
        });
      }
    }

    const { umpirePoolData } = this.props.umpirePoolAllocationState;

    if (!isEqual(umpirePoolData, prevProps.umpirePoolAllocationState.umpirePoolData)) {
      const selectedDivisions = [];
      umpirePoolData.forEach((poolItem) => {
        if (poolItem && poolItem.divisions && Array.isArray(poolItem.divisions)) {
          selectedDivisions.push(...poolItem.divisions.map((division) => division.id));
        }
      });

      this.setState({ umpirePoolData, selectedDivisions });
    }

    if (prevProps.appState.yearList !== this.props.appState.yearList) {
      if (this.props.appState.yearList.length > 0) {
        const yearRefId = getGlobalYear()
          ? JSON.parse(getGlobalYear())
          : getCurrentYear(this.props.appState.yearList);
        setGlobalYear(yearRefId);
      }
    }
  }

  onChangeComp = (compId) => {
    const { organisationId } = getOrganisationData() || {};
    const competitionList = this.props.umpireCompetitionState.umpireComptitionList;

    const selectedComp = competitionList.find((competition) => competition.id === compId);
    const isOrganiser = selectedComp.organisationId === organisationId;
    const isOfficialOrganisation = selectedComp.officialOrganisationId === organisationId;

    setCompDataForAll(selectedComp);

    this.props.liveScoreGetDivision(compId);
    this.props.getUmpirePoolData({ orgId: organisationId || 0, compId });
    this.props.liveScoreGetRounds(compId);

    this.setState({
      selectedComp: compId,
      allowUmpireAllocation: isOrganiser || isOfficialOrganisation,
      umpirePoolData: null,
    });
  };

  handleChangeDivisions = (divisions, poolIndex) => {
    const { divisionList } = this.props.liveScoreTeamState;
    const { umpirePoolData, selectedDivisions } = this.state;

    const umpirePoolDataCopy = JSON.parse(JSON.stringify(umpirePoolData));

    const divisionsToChange = umpirePoolDataCopy[poolIndex].divisions.map((division) => division.id);

    const selectedDivisionsRest = selectedDivisions.filter(
      (selectedDivision) => !divisionsToChange.some((divisionToChange) => divisionToChange === selectedDivision),
    );

    selectedDivisionsRest.push(...divisions);

    umpirePoolDataCopy[poolIndex].divisions = divisions.map((divisionId) => divisionList.find((divisionObj) => divisionObj.id === divisionId));

    this.setState({
      umpirePoolData: umpirePoolDataCopy,
      selectedDivisions: selectedDivisionsRest,
    });
  };

  handleOpenAlgorithm = () => {
    this.handleSave();
    this.setState({ algorithmModalVisible: true });
  };

  handleOkAlgorithm = (e) => {
    const { selectedRounds, selectedComp } = this.state;
    const { organisationId } = getOrganisationData() || {};
    const body = {
      rounds: selectedRounds,
      organisationId,
    };
    if (!isArrayNotEmpty(selectedRounds)) {
      message.error({
        content: AppConstants.allocateUmpireRoundRequired,
        key: 'allocate-round-error',
        duration: 2,
      });
      return;
    }

    if (organisationId && selectedComp && selectedRounds && selectedRounds.length) {
      this.props.applyUmpireAllocatioAlgorithm({
        compId: selectedComp,
        body,
      });
    }

    this.setState({
      algorithmModalVisible: false,
      selectedRounds: [],
    });
  };

  handleCancelAlgorithm = (e) => {
    this.setState({
      algorithmModalVisible: false,
      selectedRounds: [],
    });
  };

  handleChangeRounds = (rounds) => {
    this.setState({
      selectedRounds: rounds,
    });
  };

  handleSave = () => {
    const { umpirePoolData, selectedComp } = this.state;

    const data = umpirePoolData.reduce((acc, item) => {
      acc[item.id] = item.divisions.map((division) => division.id);
      return acc;
    }, {});

    const body = {
      umpirePools: data,
    };

    this.props.updateUmpirePoolToDivision({
      compId: selectedComp,
      body,
    });
  };

  setYear = (yearRefId) => {
    setGlobalYear(yearRefId);
    this.setState({ yearRefId });
    this.setState({ loading: true });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
  };

  headerView = () => (
    <div className="header-view divisions">
      <Header className="form-header-view d-flex bg-transparent align-items-center">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">
            {AppConstants.umpirePoolsDivision}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

  dropdownView = () => {
    const competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
      ? this.props.umpireCompetitionState.umpireComptitionList
      : [];

    return (
      <div className="comp-venue-courts-dropdown-view mt-0 ">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-2">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">
                  {AppConstants.year}
:
                </span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  onChange={(e) => this.setYear(e)}
                  value={this.state.yearRefId}
                >
                  {this.props.appState.yearList.map((item) => (
                    <Option key={`year_${item.id}`} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-2">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginBottom: 12 }}>
                <span className="year-select-heading">
                  {AppConstants.competition}
:
                </span>

                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 200 }}
                  onChange={this.onChangeComp}
                  value={this.state.selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {!this.state.selectedComp && <Option value="">All</Option>}
                  {competition.map((item) => (
                    <Option key={`competition_${item.id}`} value={item.id}>
                      {item.longName}
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

  poolView(poolItem, index) {
    const { divisionList } = this.props.liveScoreTeamState;
    const { selectedDivisions, allowUmpireAllocation } = this.state;

    return (
      <div className="row py-3" key={`poolItem${index}`} style={{ paddingLeft: 15 }}>
        <div className="d-flex align-items-center w-25">
          <span className="text-overflow">{poolItem.name}</span>
        </div>

        <div className="col-sm">
          <Select
            mode="multiple"
            placeholder="Select"
            style={{ width: '100%', paddingRight: 1, minWidth: 182 }}
            onChange={(divisions) => this.handleChangeDivisions(divisions, index)}
            value={
              !!poolItem?.divisions?.length && !!divisionList?.length
                ? poolItem?.divisions?.map((division) => division?.id)
                : []
            }
            disabled={!allowUmpireAllocation}
          >
            {(divisionList || []).map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  }

  noPoolView = () => (
    <div className="mt-4 error-message-inside">
      {!this.props.umpireSettingState.allocateViaPool
        ? AppConstants.poolsDisabled
        : AppConstants.noPoolAdded}
    </div>
  );

  contentView = () => {
    const { umpirePoolData } = this.state;
    return (
      <div className="content-view pt-5">
        <span className="text-heading-large pt-3 mb-0">{AppConstants.umpirePools}</span>
        {this.props.umpireCompetitionState.onLoad || this.props.umpirePoolAllocationState.onLoad ? (
          <div
            style={{
              height: 100,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            {this.props.umpireSettingState.allocateViaPool
            && !!umpirePoolData
            && !!umpirePoolData.length
              ? umpirePoolData.map((item, index) => this.poolView(item, index))
              : this.noPoolView()}
          </>
        )}
      </div>
    );
  };

  getRoundsNames = () => {
    let { divisionList, roundsData } = this.props.liveScoreTeamState;

    const umpireAllocationSettingData = this.props.umpireSettingState.allocationSettingsData;

    let roundsWithDivision = [];
    if (roundsData && roundsData.length) {
      roundsData = roundsData.filter((round) => !!round);
      if (
        umpireAllocationSettingData
        && umpireAllocationSettingData.noUmpiresUmpireAllocationSetting
      ) {
        if (umpireAllocationSettingData.noUmpiresUmpireAllocationSetting.allDivisions) {
          roundsData = [];
        } else if (umpireAllocationSettingData.noUmpiresUmpireAllocationSetting.divisions) {
          const noUmpireDivisionIds = umpireAllocationSettingData.noUmpiresUmpireAllocationSetting.divisions.map((x) => x.id);
          if (noUmpireDivisionIds.length > 0) {
            roundsData = roundsData.filter((x) => !noUmpireDivisionIds.includes(x.divisionId));
          }
        }
      }
      if (umpireAllocationSettingData && umpireAllocationSettingData.umpireAllocationSettings) {
        for (const allocationSetting of umpireAllocationSettingData.umpireAllocationSettings) {
          if (
            allocationSetting.umpireAllocationTypeRefId
            == UmpireAllocationTypeEnum.MANUALLY_ALLOCATED
          ) {
            if (allocationSetting.allDivisions) {
              roundsData = [];
              break;
            } else {
              const noUmpireDivisionIds = allocationSetting.divisions.map((x) => x.id);
              if (noUmpireDivisionIds.length > 0) {
                roundsData = roundsData.filter((x) => !noUmpireDivisionIds.includes(x.divisionId));
              }
            }
          }
        }
      }
      roundsWithDivision = roundsData.map((round) => {
        const curDivision = divisionList && divisionList.length
          ? divisionList.find((division) => division.id === round.divisionId)
          : { name: '' };
        const divName = curDivision && curDivision.name ? curDivision.name : null;
        return {
          id: round?.id,
          name: divName !== null ? `${divName} - ${round?.name}` : round?.name,
        };
      });
    }

    return roundsWithDivision;
  };

  algorithmModalView = () => {
    const { roundsData } = this.props.liveScoreTeamState;
    const { selectedRounds } = this.state;
    const roundNames = this.getRoundsNames();

    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.allocateUmpires}
        visible={this.state.algorithmModalVisible}
        onOk={this.handleOkAlgorithm}
        onCancel={this.handleCancelAlgorithm}
        maskClosable={false}
      >
        <div>
          <span>{AppConstants.allocateUmpireRoundLabel}</span>
          <Select
            mode="multiple"
            placeholder="Select"
            className="w-100"
            onChange={this.handleChangeRounds}
            value={selectedRounds || []}
          >
            {roundNames.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    );
  };

  footerView = () => {
    const { allowUmpireAllocation, umpirePoolData } = this.state;
    const isAllocateDisabled = this.props.appState.onLoad
      || this.props.umpirePoolAllocationState.onLoad
      || this.props.liveScoreTeamState.onLoad;
    const isDisabled = isAllocateDisabled
      || !umpirePoolData?.length
      || !this.props.umpireSettingState.allocateViaPool;
    return (
      <div className="form-footer-button-wrapper justify-content-between">
        <div className="reg-add-save-button">
          <Button
            className="cancelBtnWidth"
            type="cancel-button"
            onClick={() => {
              if (this.props.umpireSettingState.allocateViaPool) {
                history.push('/umpirePoolAllocation');
              } else {
                history.push('/umpireSetting');
              }
            }}
          >
            {AppConstants.back}
          </Button>
        </div>
        <div>
          {allowUmpireAllocation && (
            <>
              <Button
                className="publish-button save-draft-text mr-4"
                style={{ minWidth: 'fit-content' }}
                type="primary"
                onClick={this.handleOpenAlgorithm}
                disabled={isAllocateDisabled}
              >
                {AppConstants.allocateUmpires}
              </Button>

              <Button
                className="publish-button save-draft-text m-0 mr-4"
                type="primary"
                htmlType="submit"
                onClick={this.handleSave}
                disabled={isDisabled}
              >
                {AppConstants.save}
              </Button>
            </>
          )}
          <Button
            className="publish-button save-draft-text mr-0"
            type="primary"
            htmlType="submit"
            onClick={() => {
              if (allowUmpireAllocation && !isDisabled) this.handleSave();
              history.push('/umpirePaymentSetting');
            }}
          >
            {AppConstants.next}
          </Button>
        </div>
      </div>
    );
  };

  render = () => (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
      <InnerHorizontalMenu menu="umpire" umpireSelectedKey="4" />
      <Layout>
        {this.headerView()}
        {this.dropdownView()}
        <Form autoComplete="off" onFinish={this.handleSubmit}>
          <div className="formView">{this.contentView()}</div>

          {this.footerView()}
          {this.algorithmModalView()}
        </Form>
      </Layout>
      <Loader
        visible={
          this.props.appState.onLoad
            || this.props.umpirePoolAllocationState.onLoad
            || this.props.liveScoreTeamState.onLoad
        }
      />
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireCompetitionListAction,
      getRefBadgeData,
      getUmpirePoolData,
      liveScoreGetDivision,
      liveScoreGetRounds,
      updateUmpirePoolToDivision,
      applyUmpireAllocatioAlgorithm,
      getOnlyYearListAction,
      umpireYearChangedAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireCompetitionState: state.UmpireCompetitionState,
    appState: state.AppState,
    umpirePoolAllocationState: state.UmpirePoolAllocationState,
    liveScoreTeamState: state.LiveScoreTeamState,
    umpireSettingState: state.UmpireSettingState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireDivisions);

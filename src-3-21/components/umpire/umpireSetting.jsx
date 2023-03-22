import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Select,
  Button,
  Radio,
  Form,
  Checkbox,
  Modal,
  InputNumber,
  message,
} from 'antd';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import Loader from '../../customComponents/loader';
import DashboardLayout from '../../pages/dashboardLayout';
import ValidationConstants from '../../themes/validationConstant';
import AppConstants from '../../themes/appConstants';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  umpireCompetitionListAction,
  umpireCompetitionDetailAction,
} from '../../store/actions/umpireAction/umpireCompetetionAction';
import {
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  getLiveScoreCompetition,
  setCompDataForAll,
} from '../../util/sessionStorage';
import { getCurrentYear } from 'util/permissions';
import {
  getUmpireAllocationSettings,
  saveUmpireAllocationSettings,
} from '../../store/actions/umpireAction/umpireSettingAction';
import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import { getOnlyYearListAction } from 'store/actions/appAction';
import { liveScoreGetDivision } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import history from 'util/history';
import { getAllocateionTypes } from 'util/umpireHelper';

const { Header, Content } = Layout;
const { Option } = Select;

const initialUmpireAllocationGetData = {
  allDivisions: false,
  umpireAllocationTypeRefId: 242,
  /*  activateReserves: false,
  activateCoaches: false, */
  timeBetweenMatches: null,
  maxNumberOfMatches: null,
  divisions: [],
  hasUmpires: true,
};

const initialNoUmpireAllocationGetData = {
  allDivisions: false,
  divisions: [],
  hasUmpires: false,
};

class UmpireSetting extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      selectedComp: null,
      loading: false,
      competitionUniqueKey: null,
      deleteModalVisible: false,
      allocationSettingsData: null,
      tempAllocationSettingsData: null,
      allDivisionVisible: false,
      sectionDataSelected: null,
      sectionDataToDeleteIndex: null,
      selectedDivisions: null,
      tempSelectedDivisions: null,
      competitionList: null,
      isOrganiserView: false,
    };
  }

  componentDidMount() {
    const { organisationId } = getOrganisationData() || {};
    this.setState({ loading: true });
    this.props.getOnlyYearListAction();
    if (organisationId)
      this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.appState.yearList !== this.props.appState.yearList) {
      if (this.props.appState.yearList.length > 0) {
        const yearRefId = getGlobalYear()
          ? JSON.parse(getGlobalYear())
          : getCurrentYear(this.props.appState.yearList);
        setGlobalYear(yearRefId);
      }
    }

    if (prevProps.umpireCompetitionState !== this.props.umpireCompetitionState) {
      if (this.state.loading && !this.props.umpireCompetitionState.onLoad) {
        const compListProps = isArrayNotEmpty(
          this.props.umpireCompetitionState.umpireComptitionList,
        )
          ? this.props.umpireCompetitionState.umpireComptitionList
          : [];
        const compList = JSON.parse(JSON.stringify(compListProps));

        const livescoresCompetition = getLiveScoreCompetition()
          ? JSON.parse(getLiveScoreCompetition())
          : null;
        const organisation = getOrganisationData();
        const organisationId = organisation?.organisationId ?? null;
        const globalYear = Number(getGlobalYear());
        const canUseExistingComp =
          !!livescoresCompetition?.id &&
          !!organisationId &&
          livescoresCompetition.yearRefId === globalYear &&
          [
            livescoresCompetition?.competitionOrganisation?.orgId,
            livescoresCompetition.organisationId,
          ].includes(organisationId);

        let competition = null;
        if (canUseExistingComp) {
          competition = compList.find(c => c.id === livescoresCompetition.id);
        }
        if (!competition) {
          //get the first comp in the list
          competition = compList && compList.length ? compList[0] : null;
        }
        const competitionId = competition?.id ?? null;
        const competitionUniqueKey = competition?.uniqueKey ?? null;

        setCompDataForAll(competition);

        if (!!compList.length && competition) {
          this.props.liveScoreGetDivision(competition.id);
        }

        compList.forEach(item => {
          if (item.organisationId === organisationId) {
            item.isOrganiser = true;
          } else {
            item.isOrganiser = false;
          }
        });

        const selectedComp = compList.find(comp => comp.id === competitionId);
        const isOrganiser = selectedComp ? selectedComp?.isOrganiser : false;

        this.setState({
          competitionList: compList,
          isOrganiserView: isOrganiser,
          selectedComp: competitionId,
          loading: false,
          competitionUniqueKey: competitionUniqueKey,
        });
      }
    }

    if (!!this.state.selectedComp && prevState.selectedComp !== this.state.selectedComp) {
      this.props.getUmpireAllocationSettings(this.state.selectedComp);
      this.props.umpireCompetitionDetailAction(this.state.selectedComp);
    }

    if (
      this.props.umpireSettingState !== prevProps.umpireSettingState &&
      !!this.props.umpireSettingState.allocationSettingsData &&
      !this.props.umpireSettingState.onLoad
    ) {
      const { umpireAllocationSettings, noUmpiresUmpireAllocationSetting } =
        this.props.umpireSettingState.allocationSettingsData;
      const { divisionList } = this.props.liveScoreTeamState;

      umpireAllocationSettings.forEach(item => {
        item.hasUmpires = true;
      });

      if (!!noUmpiresUmpireAllocationSetting) {
        noUmpiresUmpireAllocationSetting.hasUmpires = false;
      }

      const allocationSettingsData = !!noUmpiresUmpireAllocationSetting
        ? [...umpireAllocationSettings, noUmpiresUmpireAllocationSetting]
        : [...umpireAllocationSettings];

      const selectedDivisions = [];

      allocationSettingsData.forEach(item => {
        item.allDivisions
          ? selectedDivisions.push(...divisionList)
          : selectedDivisions.push(...item.divisions);
      });

      this.setState({ allocationSettingsData, selectedDivisions });
    }
  }

  handleChangeWhoAssignsUmpires = (e, umpireAllocatorTypeRefId) => {
    const { allocationSettingsData } = this.state;
    const { divisionList } = this.props.liveScoreTeamState;

    const newSelectedDivisions = [];
    let newAllocationSettingsData;

    if (umpireAllocatorTypeRefId) {
      const filteredAllocationSettingsData = allocationSettingsData.filter(
        item => item.umpireAllocatorTypeRefId !== umpireAllocatorTypeRefId,
      );
      const initialUmpireBoxData = JSON.parse(JSON.stringify(initialUmpireAllocationGetData));
      initialUmpireBoxData.umpireAllocatorTypeRefId = umpireAllocatorTypeRefId;

      if (e.target.checked) {
        newAllocationSettingsData = [...filteredAllocationSettingsData, initialUmpireBoxData];
      } else {
        newAllocationSettingsData = [...filteredAllocationSettingsData];
      }
    } else {
      if (e.target.checked) {
        newAllocationSettingsData = [
          ...this.state.allocationSettingsData,
          initialNoUmpireAllocationGetData,
        ];
      } else {
        newAllocationSettingsData = [
          ...this.state.allocationSettingsData.filter(item => !!item.umpireAllocatorTypeRefId),
        ];
      }
    }

    newAllocationSettingsData.forEach(item => {
      item.allDivisions
        ? newSelectedDivisions.push(...divisionList)
        : newSelectedDivisions.push(...item.divisions);
    });

    this.setState({
      allocationSettingsData: newAllocationSettingsData,
      selectedDivisions: newSelectedDivisions,
    });
  };

  handleAddBox = umpireAllocatorTypeRefId => {
    const { allocationSettingsData } = this.state;

    const initialUmpireBoxData = JSON.parse(JSON.stringify(initialUmpireAllocationGetData));
    initialUmpireBoxData.umpireAllocatorTypeRefId = umpireAllocatorTypeRefId;

    this.setState({ allocationSettingsData: [...allocationSettingsData, initialUmpireBoxData] });
  };

  handleChangeSettings = (sectionDataIndex, key, value, sectionData) => {
    const { allocationSettingsData } = this.state;
    const allocationSettingsDataCopy = JSON.parse(JSON.stringify(allocationSettingsData));

    const targetBoxData = allocationSettingsDataCopy.filter(
      item => item.umpireAllocatorTypeRefId === sectionData[0].umpireAllocatorTypeRefId,
    );

    const otherBoxData = allocationSettingsDataCopy.filter(
      item => item.umpireAllocatorTypeRefId !== sectionData[0].umpireAllocatorTypeRefId,
    );

    if (key === 'umpireAllocationTypeRefId' && (value !== 243 || value !== 245)) {
      targetBoxData[sectionDataIndex].timeBetweenMatches = null;
      targetBoxData[sectionDataIndex].maxNumberOfMatches = null;
    }

    if (key === 'allDivisions') {
      this.handleAllDivisionsChange(
        targetBoxData,
        sectionDataIndex,
        allocationSettingsDataCopy,
        value,
      );
    } else {
      this.handleNonAllDivisionsChange(
        sectionData,
        targetBoxData,
        otherBoxData,
        sectionDataIndex,
        key,
        value,
      );
    }
  };

  handleNonAllDivisionsChange = (
    sectionData,
    targetBoxData,
    otherBoxData,
    sectionDataIndex,
    key,
    value,
  ) => {
    const { divisionList } = this.props.liveScoreTeamState;
    const { selectedDivisions } = this.state;

    const newSelectedDivisions = [];

    const newAllocationSettingsData = [...otherBoxData, ...targetBoxData];

    if (key === 'divisions') {
      targetBoxData[sectionDataIndex].divisions = value.map(item =>
        divisionList.find(divisionListItem => divisionListItem.id === item),
      );

      newAllocationSettingsData.forEach(item => {
        newSelectedDivisions.push(...item.divisions);
      });
    } else {
      targetBoxData[sectionDataIndex][key] = value;

      newSelectedDivisions.push(...selectedDivisions);
    }

    const updatedSelectedDivisions = !!newSelectedDivisions.length ? newSelectedDivisions : [];

    if (key === 'divisions' && updatedSelectedDivisions.length < divisionList.length) {
      newAllocationSettingsData.forEach(item => {
        item.allDivisions = false;
      });
    }

    if (
      key === 'divisions' &&
      updatedSelectedDivisions.length === divisionList.length &&
      value.length === divisionList.length
    ) {
      newAllocationSettingsData.filter(
        item => item.umpireAllocatorTypeRefId === sectionData[0].umpireAllocatorTypeRefId,
      )[sectionDataIndex].allDivisions = true;
    }

    this.setState({
      allocationSettingsData: newAllocationSettingsData,
      selectedDivisions: updatedSelectedDivisions,
    });
  };

  handleAllDivisionsChange = (
    targetBoxData,
    sectionDataIndex,
    allocationSettingsDataCopy,
    value,
  ) => {
    const { divisionList } = this.props.liveScoreTeamState;
    const { allocationSettingsData, selectedDivisions } = this.state;

    const newSelectedDivisions = [];

    allocationSettingsDataCopy.forEach(item => {
      item.divisions = [];
      item.allDivisions = false;
    });

    if (!!value) {
      newSelectedDivisions.push(...divisionList);
    }

    targetBoxData[sectionDataIndex].divisions = !!value ? divisionList : [];
    targetBoxData[sectionDataIndex].allDivisions = value;

    const newAllocationSettingsData = [targetBoxData[sectionDataIndex]];

    this.setState({
      allDivisionVisible: !!value,
      tempAllocationSettingsData: !!value ? newAllocationSettingsData : null,
      allocationSettingsData: !value ? newAllocationSettingsData : allocationSettingsData,
      tempSelectedDivisions: !!value ? newSelectedDivisions : [],
      selectedDivisions: !value ? [] : selectedDivisions,
    });
  };

  handleClickDeleteModal = (sectionDataIndex, sectionDataSelected) => {
    this.setState({
      deleteModalVisible: true,
      sectionDataSelected,
      sectionDataToDeleteIndex: sectionDataIndex,
    });
  };

  handleDeleteModal = key => {
    if (key === 'ok') {
      const { allocationSettingsData, sectionDataSelected, sectionDataToDeleteIndex } = this.state;
      const allocationSettingsDataCopy = [...allocationSettingsData];
      const sectionDataSelectedCopy = [...sectionDataSelected];

      const { umpireAllocatorTypeRefId = null } = sectionDataSelected[0];

      const otherUmpireData = allocationSettingsDataCopy.filter(
        item => item.umpireAllocatorTypeRefId !== umpireAllocatorTypeRefId,
      );
      sectionDataSelectedCopy.splice(sectionDataToDeleteIndex, 1);

      const newAllocationSettingsData = [...otherUmpireData, ...sectionDataSelectedCopy];

      const newSelectedDivisions = [];

      newAllocationSettingsData.forEach(item => {
        newSelectedDivisions.push(...item.divisions);
      });

      this.setState({
        allocationSettingsData: newAllocationSettingsData,
        selectedDivisions: newSelectedDivisions,
      });
    }

    this.setState({
      deleteModalVisible: false,
      sectionDataSelected: null,
      sectionDataToDeleteIndex: null,
    });
  };

  handleAllDivisionModal = key => {
    if (key === 'ok') {
      this.setState({
        allocationSettingsData: this.state.tempAllocationSettingsData,
        selectedDivisions: this.state.tempSelectedDivisions,
      });
    }

    this.setState({
      allDivisionVisible: false,
      tempAllocationSettingsData: null,
      tempSelectedDivisions: null,
    });
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.umpireAllocationSettings}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  onChangeComp = competitionId => {
    const { competitionList } = this.state;

    const { isOrganiser } = competitionList.find(competition => competition.id === competitionId);
    const newComp = competitionList.find(c => c.id === competitionId);
    this.props.liveScoreGetDivision(competitionId);
    setCompDataForAll(newComp);

    this.setState({ selectedComp: competitionId, isOrganiserView: isOrganiser });
  };

  setYear = yearRefId => {
    setGlobalYear(yearRefId);
    this.setState({ yearRefId });
    this.setState({ loading: true });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    if (organisationId) {
      this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
    }
  };

  dropdownView = () => {
    const { competitionList } = this.state;

    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-2">
              <div className="w-ft d-flex flex-row align-items-center" style={{ marginRight: 50 }}>
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  onChange={e => this.setYear(e)}
                  value={this.state.yearRefId}
                >
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-2">
              <div className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 200 }}
                  onChange={this.onChangeComp}
                  value={this.state.selectedComp || ''}
                  loading={this.props.umpireCompetitionState.onLoad}
                >
                  {!this.state.selectedComp && <Option value="">All</Option>}
                  {!!competitionList &&
                    competitionList.map(item => (
                      <Option key={'competition_' + item.id} value={item.id}>
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

  boxSettingsView = (boxData, sectionDataIndex, sectionData) => {
    const { isOrganiserView } = this.state;

    return (
      <div className="pt-0 mt-4">
        {this.boxSettingsRadioView(boxData, sectionDataIndex, sectionData)}

        {(boxData.umpireAllocationTypeRefId === 243 ||
          boxData.umpireAllocationTypeRefId === 245) && (
          <>
            {/*    <span className="text-heading-large pt-5">{AppConstants.timeBetweenMatches}</span>
            <div className="d-flex align-items-center">
              <InputNumber
                value={+boxData.timeBetweenMatches}
                onChange={e =>
                  this.handleChangeSettings(sectionDataIndex, 'timeBetweenMatches', e, sectionData)
                }
                min={0}
                precision={0}
                style={{ width: 100 }}
                disabled={isOrganiserView ? false : true}
              />
              <span className="ml-4">{AppConstants.minutes}</span>
            </div> */}

            <span className="text-heading-large pt-5">{AppConstants.maxNumberOfMatches}</span>
            <InputNumber
              value={+boxData.maxNumberOfMatches}
              onChange={e =>
                this.handleChangeSettings(sectionDataIndex, 'maxNumberOfMatches', e, sectionData)
              }
              min={0}
              precision={0}
              style={{ width: 100 }}
              disabled={isOrganiserView ? false : true}
            />
          </>
        )}

        {/*  <span className="text-heading-large pt-5">{AppConstants.umpireReservePref}</span>
        <Checkbox
          checked={boxData.activateReserves}
          onChange={e =>
            this.handleChangeSettings(
              sectionDataIndex,
              'activateReserves',
              e.target.checked,
              sectionData,
            )
          }
          style={{ fontWeight: 400 }}
          disabled={isOrganiserView ? false : true}
        >
          {AppConstants.activeUmpireReserves}
        </Checkbox>

        <span className="text-heading-large pt-5">{AppConstants.umpireCoach}</span>
        <Checkbox
          checked={boxData.activateCoaches}
          onChange={e =>
            this.handleChangeSettings(
              sectionDataIndex,
              'activateCoaches',
              e.target.checked,
              sectionData,
            )
          }
          style={{ fontWeight: 400 }}
          disabled={isOrganiserView ? false : true}
        >
          {AppConstants.activeUmpireCoach}
        </Checkbox> */}
      </div>
    );
  };

  boxSettingsRadioView = (boxData, sectionDataIndex, sectionData) => {
    const { isOrganiserView } = this.state;

    return (
      <div>
        <span className="text-heading-large pt-4">{AppConstants.howUmpiresAllocated}</span>
        <div className="d-flex flex-column">
          <Radio
            onChange={() =>
              this.handleChangeSettings(
                sectionDataIndex,
                'umpireAllocationTypeRefId',
                242,
                sectionData,
              )
            }
            checked={boxData.umpireAllocationTypeRefId === 242}
            disabled={isOrganiserView ? false : true}
          >
            {AppConstants.manuallyAllocate}
          </Radio>

          <Radio
            onChange={() =>
              this.handleChangeSettings(
                sectionDataIndex,
                'umpireAllocationTypeRefId',
                243,
                sectionData,
              )
            }
            checked={boxData.umpireAllocationTypeRefId === 243}
            disabled={isOrganiserView ? false : true}
          >
            {AppConstants.allocateViaPools}
          </Radio>
          <Radio
            onChange={() =>
              this.handleChangeSettings(
                sectionDataIndex,
                'umpireAllocationTypeRefId',
                244,
                sectionData,
              )
            }
            checked={boxData.umpireAllocationTypeRefId === 244}
            disabled={isOrganiserView ? false : true}
          >
            {AppConstants.umpireYourOwnTeam}
          </Radio>
          {boxData.umpireAllocatorTypeRefId === 247 && (
            <Radio
              onChange={() =>
                this.handleChangeSettings(
                  sectionDataIndex,
                  'umpireAllocationTypeRefId',
                  245,
                  sectionData,
                )
              }
              checked={boxData.umpireAllocationTypeRefId === 245}
              disabled={isOrganiserView ? false : true}
            >
              {AppConstants.umpireYourOwnOrganisation}
            </Radio>
          )}
        </div>
      </div>
    );
  };

  deleteConfirmModalView = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.divisionSettings}
          visible={this.state.deleteModalVisible}
          onOk={() => this.handleDeleteModal('ok')}
          onCancel={() => this.handleDeleteModal('cancel')}
        >
          <p>{AppConstants.divisionRemoveMsg}</p>
        </Modal>
      </div>
    );
  };

  allDivisionModalView = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal add-membership-type-modalLadder"
          title={AppConstants.divisionSettings}
          visible={this.state.allDivisionVisible}
          onOk={() => this.handleAllDivisionModal('ok')}
          onCancel={() => this.handleAllDivisionModal('cancel')}
        >
          <p>{AppConstants.divisionAllDivisionMsg}</p>
        </Modal>
      </div>
    );
  };

  ////////top or say first view
  topView = () => {
    const { isDirectCompetition, umpireComptitionData } = this.props.umpireCompetitionState;
    return (
      <div className="content-view pt-4 mt-5">
        <span className="text-heading-large pt-2 pb-2">{AppConstants.whoAssignsUmpires}</span>
        <div className="d-flex flex-column">
          {this.umpireSettingsSectionView(AppConstants.competitionOrganiser, 246)}
          {!isDirectCompetition
            ? this.umpireSettingsSectionView(AppConstants.affiliateOrganisations, 247)
            : null}
          {!!umpireComptitionData?.officialOrganisationId && !isDirectCompetition && this.umpireSettingsSectionView(AppConstants.officialOrganisation, 248)}
          {this.umpireSettingsSectionView(AppConstants.noUmpires)}
        </div>

        {this.deleteConfirmModalView()}
        {this.allDivisionModalView()}
      </div>
    );
  };

  umpireSettingsSectionView = (sectionTitle, umpireAllocatorTypeRefId) => {
    const { divisionList } = this.props.liveScoreTeamState;
    const { allocationSettingsData, selectedDivisions, isOrganiserView } = this.state;

    const sectionData =
      allocationSettingsData && umpireAllocatorTypeRefId
        ? allocationSettingsData.filter(
            item => item.umpireAllocatorTypeRefId === umpireAllocatorTypeRefId,
          )
        : allocationSettingsData
        ? allocationSettingsData.filter(item => !item.hasUmpires)
        : null;

    return (
      <>
        <Checkbox
          onChange={e => this.handleChangeWhoAssignsUmpires(e, umpireAllocatorTypeRefId)}
          checked={!!sectionData?.length}
          className="mx-0 mb-2"
          disabled={isOrganiserView ? false : true}
        >
          {sectionTitle}
        </Checkbox>
        {sectionData && !!sectionData.length && (
          <div className="position-relative" style={{ paddingBottom: 35 }}>
            {sectionData.map((boxData, sectionDataIndex) => (
              <div
                key={'settingsBox_' + sectionDataIndex}
                className="inside-container-view mb-2 mt-4"
              >
                {sectionData.length > 1 && (
                  <div className="d-flex float-right">
                    <div
                      className="transfer-image-view pt-0 pointer ml-auto"
                      onClick={() => this.handleClickDeleteModal(sectionDataIndex, sectionData)}
                    >
                      <span className="user-remove-btn">
                        <i className="fa fa-trash-o" aria-hidden="true" />
                      </span>
                      <span className="user-remove-text">{AppConstants.remove}</span>
                    </div>
                  </div>
                )}
                <Checkbox
                  onChange={e =>
                    this.handleChangeSettings(
                      sectionDataIndex,
                      'allDivisions',
                      e.target.checked,
                      sectionData,
                    )
                  }
                  checked={boxData.allDivisions}
                  disabled={isOrganiserView ? false : true}
                >
                  {AppConstants.allDivisions}
                </Checkbox>

                <Select
                  mode="multiple"
                  placeholder="Select"
                  style={{ width: '100%', paddingRight: 1, minWidth: 182, marginTop: 20 }}
                  onChange={divisions =>
                    this.handleChangeSettings(sectionDataIndex, 'divisions', divisions, sectionData)
                  }
                  value={(boxData.allDivisions ? divisionList : boxData.divisions).map(
                    division => division.id,
                  )}
                  disabled={isOrganiserView ? false : true}
                >
                  {(divisionList || []).map(item => (
                    <Option
                      key={'compOrgDivision_' + item.id}
                      disabled={selectedDivisions.some(
                        selectedDivision =>
                          selectedDivision.id === item.id &&
                          !boxData.allDivisions &&
                          !boxData.divisions.find(division => division.id === item.id),
                      )}
                      value={item.id}
                    >
                      {item.name}
                    </Option>
                  ))}
                </Select>
                {umpireAllocatorTypeRefId &&
                  this.boxSettingsView(boxData, sectionDataIndex, sectionData)}
              </div>
            ))}
            {selectedDivisions.length < this.props.liveScoreTeamState.divisionList.length &&
              umpireAllocatorTypeRefId &&
              isOrganiserView && (
                <div className="row mb-5 position-absolute">
                  <div
                    className="col-sm"
                    onClick={() => this.handleAddBox(umpireAllocatorTypeRefId)}
                  >
                    <span className="input-heading-add-another pointer pt-0">
                      + {AppConstants.addDivision}
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}
      </>
    );
  };

  handleSave = () => {
    const { organisationId } = getOrganisationData() || {};
    const { selectedComp, allocationSettingsData } = this.state;

    const noUmpiresSettingArray = allocationSettingsData
      .filter(item => !item.hasUmpires)
      .map(item => ({
        allDivisions: item.allDivisions,
        divisions: item.allDivisions ? [] : item.divisions.map(division => division.id),
      }));

    const umpireAllocationSettingsArray = allocationSettingsData
      .filter(item => !!item.hasUmpires)
      .map(item => ({
        /*  activateCoaches: item.activateCoaches,
        activateReserves: item.activateReserves, */
        allDivisions: item.allDivisions,
        divisions: item.allDivisions ? [] : item.divisions.map(division => division.id),
        maxNumberOfMatches: item.maxNumberOfMatches,
        timeBetweenMatches: item.timeBetweenMatches,
        umpireAllocationTypeRefId: item.umpireAllocationTypeRefId,
        umpireAllocatorTypeRefId: item.umpireAllocatorTypeRefId,
      }));

    const noUmpiresSetting =
      !!noUmpiresSettingArray[0]?.divisions.length || !!noUmpiresSettingArray[0]?.allDivisions
        ? noUmpiresSettingArray[0]
        : null;
    const umpireAllocationSettings = !!umpireAllocationSettingsArray.length
      ? umpireAllocationSettingsArray
      : [];

    const bodyData = { noUmpiresSetting, umpireAllocationSettings };

    const isNoDivsSelected =
      (noUmpiresSetting && !noUmpiresSetting.divisions.length && !noUmpiresSetting.allDivisions) ||
      umpireAllocationSettingsArray.some(
        setting => !setting?.divisions?.length && !setting?.allDivisions,
      );

    if (isNoDivsSelected) {
      message.config({ maxCount: 1, duration: 0.9 });
      message.error(ValidationConstants.pleaseAddDivisionForMembershipProduct);
    } else {
      const saveData = {
        organisationId,
        competitionId: selectedComp,
        body: bodyData,
      };

      if (organisationId && selectedComp) this.props.saveUmpireAllocationSettings(saveData);
    }
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    const { isOrganiserView, allocationSettingsData } = this.state;

    return (
      <div className="form-footer-button-wrapper">
        {isOrganiserView && !!allocationSettingsData && (
          <Button
            className="publish-button save-draft-text mr-15"
            type="primary"
            htmlType="submit"
            onClick={this.handleSave}
          >
            {AppConstants.save}
          </Button>
        )}
        <Button
          className="publish-button save-draft-text mr-0"
          type="primary"
          htmlType="submit"
          onClick={() => {
            if (isOrganiserView && !!allocationSettingsData) this.handleSave();
            const isNoDivsSelected =
              allocationSettingsData &&
              allocationSettingsData.some(
                setting => !setting?.divisions?.length && !setting?.allDivisions,
              );
            let allocateViaPool = false;
            if (allocationSettingsData) {
              let allocationTypes = getAllocateionTypes(allocationSettingsData);
              allocateViaPool = allocationTypes.hasPoolAllocation;
            }
            if (allocateViaPool) {
              if (!isNoDivsSelected) {
                history.push('/umpirePoolAllocation');
              }
            } else {
              history.push('/umpireDivisions');
            }
          }}
        >
          {AppConstants.next}
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="6" />
        <Layout>
          <Form onFinish={this.saveAPIsActionCall} noValidate="noValidate">
            {this.headerView()}
            {this.dropdownView()}
            <Content>
              <div className="formView">{this.topView()}</div>
            </Content>
            {this.footerView()}
          </Form>
          <Loader
            visible={
              this.props.umpireCompetitionState.onLoad ||
              this.props.liveScoreTeamState.onLoad ||
              this.props.umpireSettingState.onLoad
            }
          />
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireCompetitionListAction,
      getUmpireAllocationSettings,
      saveUmpireAllocationSettings,
      liveScoreGetDivision,
      umpireCompetitionDetailAction,
      getOnlyYearListAction,
      umpireYearChangedAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    umpireCompetitionState: state.UmpireCompetitionState,
    umpireSettingState: state.UmpireSettingState,
    liveScoreTeamState: state.LiveScoreTeamState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpireSetting);

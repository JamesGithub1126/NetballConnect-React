import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import { Layout, Breadcrumb, Select, Button, Form, Checkbox, Radio, Modal, message } from 'antd';

import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import { getCurrentYear } from 'util/permissions';
import { isEqual } from 'lodash';
import InputWithHead from '../../customComponents/InputWithHead';
import InputNumberWithHead from '../../customComponents/InputNumberWithHead';
import Loader from '../../customComponents/loader';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';

import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';

import { isArrayNotEmpty } from '../../util/helpers';
import {
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  setCompDataForAll,
  getLiveScoreCompetition,
} from '../../util/sessionStorage';

import { umpireCompetitionListAction } from '../../store/actions/umpireAction/umpireCompetetionAction';
import {
  getUmpirePaymentSettings,
  saveUmpirePaymentSettings,
} from '../../store/actions/umpireAction/umpirePaymentSettingAction';
import { liveScoreGetDivision } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import { getUmpirePoolData } from '../../store/actions/umpireAction/umpirePoolAllocationAction';
import { getRefBadgeData, getOnlyYearListAction } from '../../store/actions/appAction';
import { getUmpireSequencesFromSettings } from '../../util/umpireHelper';
import { getUmpireField } from '../../store/reducer/liveScoreReducer/helpers/matchUmpires/umpireHelpers';
import { UmpireSequence } from '../../enums/enums';
import { RegistrationUserRoles } from '../../enums/registrationEnums';

const { Header, Content } = Layout;
const { Option } = Select;

const initialPaymentSettingsData = {
  allDivisions: false,
  divisions: [],
  UmpirePaymentFeeType: 'BY_BADGE',
  byBadge: [],
  byPool: [],
  hasSettings: true,
};

const initialNoSettingsData = {
  allDivisions: false,
  divisions: [],
  hasSettings: false,
};

class UmpirePaymentSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      competitionList: null,
      selectedComp: null,
      loading: false,
      competitionUniqueKey: null,
      paymentSettingsData: null,
      selectedDivisions: null,
      allDivisionVisible: false,
      deleteModalVisible: false,
      sectionDataToDeleteIndex: null,
      tempPaymentSettingsData: null,
      tempSelectedDivisions: null,
      isOrganiserView: false,
      allowedDivisionList: null,
      allowPayment: true,
      isDirectCompetition: false,
    };
  }

  componentDidMount() {
    const { organisationId } = getOrganisationData() || {};
    this.setState({ loading: true });
    this.props.getOnlyYearListAction();
    if (organisationId) {
      this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');
    }
    this.props.getRefBadgeData();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { organisationId } = getOrganisationData() || {};
    if (!this.props.umpireCompetitionState.onLoad && prevProps.umpireCompetitionState.onLoad) {
      const compList = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
        ? this.props.umpireCompetitionState.umpireComptitionList
        : [];
      const livescoresCompetition = getLiveScoreCompetition()
        ? JSON.parse(getLiveScoreCompetition())
        : null;
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
        // get the first comp in the list
        competition = compList && compList.length ? compList[0] : null;
      }
      const competitionId = competition?.id ?? null;
      const competitionUniqueKey = competition?.uniqueKey ?? null;

      setCompDataForAll(competition);
      if (!!compList.length && competition) {
        this.props.liveScoreGetDivision(competitionId);
        // this.props.getUmpirePoolData({ orgId: organisationId, compId: firstComp });
      }

      const competitionListCopy = JSON.parse(JSON.stringify(compList));

      competitionListCopy.forEach(item => {
        if (item.organisationId === organisationId) {
          item.isOrganiser = true;
        } else {
          item.isOrganiser = false;
        }
      });

      const isOrganiser = competitionListCopy.find(comp => comp.id === competitionId)?.isOrganiser;

      this.setState({
        competitionList: competitionListCopy,
        isOrganiserView: isOrganiser,
        selectedComp: competitionId,
        competition,
        loading: false,
        competitionUniqueKey,
      });
    }

    if (!!this.state.selectedComp && prevState.selectedComp !== this.state.selectedComp) {
      const { selectedComp } = this.state;

      this.props.getUmpirePoolData({
        orgId: organisationId,
        compId: selectedComp,
      });
    }

    if (
      (!this.props.umpirePoolAllocationState.onLoad &&
        prevProps.umpirePoolAllocationState.onLoad) ||
      (prevState.selectedComp !== this.state.selectedComp && !prevState.selectedComp)
    ) {
      const reqData = {
        organisationId,
        competitionId: this.state.selectedComp,
      };
      if (reqData.competitionId && reqData.organisationId) {
        await this.props.getUmpirePaymentSettings(reqData);
      }
      this.setState({
        allowPayment: this.props.umpirePaymentSettingState?.allowUmpiresPayments,
      });
    }

    if (
      !this.props.umpirePaymentSettingState.onLoad &&
      prevProps.umpirePaymentSettingState.onLoad &&
      this.props.umpirePaymentSettingState.paymentSettingsData
    ) {
      this.modifyGetSettingsData();
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

  modifyGetSettingsData = () => {
    const { organisationId } = getOrganisationData() || {};
    const { divisionList } = this.props.liveScoreTeamState;
    const { officialPaymentSettings, allowedDivisionsSettings, isDirectCompetition } =
      this.props.umpirePaymentSettingState?.paymentSettingsData;
    const { allowUmpiresPayments } = this.props.umpirePaymentSettingState;
    const { isOrganiserView, competition } = this.state;
    const selectedDivisions = [];

    const umpirePaymentSettingsArray =
      !!officialPaymentSettings && !!officialPaymentSettings.length
        ? officialPaymentSettings.map(settingsItem => ({
            id: settingsItem.id,
            allDivisions: settingsItem.allDivisions,
            divisions: settingsItem.divisions,
            UmpirePaymentFeeType: settingsItem.UmpirePaymentFeeType,
            officials: settingsItem.officials?.map(official => ({
              id: official.id,
              roleId: official.roleId,
              rate: official.rate,
              sequence: official.sequence,
            })),
            byBadge: settingsItem.byBadge.length
              ? settingsItem.byBadge.map(byBadgeSetting => ({
                  id: byBadgeSetting.id,
                  umpirePaymentSettingId: byBadgeSetting.umpirePaymentSettingId,
                  accreditationUmpireRefId: byBadgeSetting.accreditationUmpireRefId,
                  rates: byBadgeSetting.rates.map(rate => ({
                    id: rate.id,
                    umpirePaymentFeeByBadgeId: rate.umpirePaymentFeeByBadgeId,
                    umpirePaymentFeeByPoolId: rate.umpirePaymentFeeByPoolId,
                    roleId: rate.roleId,
                    rate: rate.rate,
                    sequence: rate.sequence,
                  })),
                }))
              : [],
            byPool: settingsItem.byPool.length
              ? settingsItem.byPool.map(byPoolSetting => ({
                  id: byPoolSetting.id,
                  umpirePaymentSettingId: byPoolSetting.umpirePaymentSettingId,
                  umpirePoolId: byPoolSetting.umpirePoolId,
                  rates: byPoolSetting.rates.map(rate => ({
                    id: rate.id,
                    umpirePaymentFeeByBadgeId: rate.umpirePaymentFeeByBadgeId,
                    umpirePaymentFeeByPoolId: rate.umpirePaymentFeeByPoolId,
                    roleId: rate.roleId,
                    rate: rate.rate,
                    sequence: rate.sequence,
                  })),
                }))
              : [],
            hasSettings: true,
            savedBy: settingsItem.savedBy,
          }))
        : [];

    const allowedDivisionsSettingArray = allowedDivisionsSettings.length
      ? allowedDivisionsSettings.map(allowedDivisionsSetting => ({
          allDivisions: allowedDivisionsSetting?.allDivisions || false,
          divisions: allowedDivisionsSetting?.divisions || [],
          hasSettings: false,
          savedBy: allowedDivisionsSetting?.savedBy,
        }))
      : [];

    let paymentSettingType;
    if (isOrganiserView) {
      paymentSettingType = 'ORGANISER';
    } else {
      paymentSettingType =
        competition.officialOrganisationId === organisationId
          ? 'OFFICIAL_ORGANISATION'
          : 'AFFILIATE';
    }
    const affiliateViewSettingsArray =
      !isOrganiserView && !officialPaymentSettings.length
        ? [
            {
              ...initialPaymentSettingsData,
              savedBy:
                competition.officialOrganisationId === organisationId
                  ? 'OFFICIAL_ORGANISATION'
                  : 'AFFILIATE',
            },
          ]
        : umpirePaymentSettingsArray;

    const newPaymentSettingsData = isOrganiserView
      ? [...umpirePaymentSettingsArray, ...allowedDivisionsSettingArray]
      : [...affiliateViewSettingsArray];

    let allowedDivisionList = null;
    if (isOrganiserView) {
      allowedDivisionList = divisionList;
    } else if (allowedDivisionsSettings.length) {
      const allowedDivisionsSetting = allowedDivisionsSettings.find(
        setting => setting.savedBy === paymentSettingType,
      );
      if (allowedDivisionsSetting.allDivisions) {
        allowedDivisionList = divisionList;
      } else {
        allowedDivisionList = allowedDivisionsSetting.divisions;
      }
    }
    newPaymentSettingsData.forEach(item => {
      item?.allDivisions && allowedDivisionList
        ? selectedDivisions.push(...allowedDivisionList)
        : selectedDivisions.push(...item?.divisions);
    });

    this.setState({
      paymentSettingsData: newPaymentSettingsData,
      selectedDivisions,
      allowedDivisionList,
      allowPayment: allowUmpiresPayments,
      isDirectCompetition,
      paymentSettingType,
    });
  };

  handleChangeWhoPaysUmpires = (e, type, isBoxHasSettings) => {
    const { paymentSettingsData, allowedDivisionList } = this.state;

    const newSelectedDivisions = [];
    let newSettingsData;

    if (isBoxHasSettings) {
      const initialSettingsBoxData = JSON.parse(JSON.stringify(initialPaymentSettingsData));
      const noSettingsDataState = paymentSettingsData
        ? paymentSettingsData.filter(item => !item.hasSettings)
        : [];

      if (e.target.checked) {
        newSettingsData = initialSettingsBoxData
          ? [
              ...noSettingsDataState,
              {
                ...initialSettingsBoxData,
                savedBy: type,
              },
            ]
          : [...noSettingsDataState];
      } else {
        newSettingsData = [...noSettingsDataState];
      }
    } else if (e.target.checked) {
      if (paymentSettingsData) {
        if (!paymentSettingsData.some(item => item.savedBy === type)) {
          newSettingsData = [
            ...paymentSettingsData,
            {
              ...initialNoSettingsData,
              savedBy: type,
            },
          ];
        }
      } else {
        newSettingsData = [
          {
            ...initialNoSettingsData,
            savedBy: type,
          },
        ];
      }
    } else {
      newSettingsData = paymentSettingsData
        ? [...paymentSettingsData.filter(item => !!item?.hasSettings || item.savedBy !== type)]
        : [];
    }

    newSettingsData.forEach(item => {
      item?.allDivisions && allowedDivisionList && newSelectedDivisions
        ? newSelectedDivisions.push(...allowedDivisionList)
        : newSelectedDivisions.push(...item?.divisions);
    });

    this.setState({
      paymentSettingsData: newSettingsData,
      selectedDivisions: newSelectedDivisions,
    });
  };

  handleChangeFeesRadio = (sectionData, sectionDataIndex, key) => {
    const { paymentSettingsData } = this.state;

    const sectionDataCopy = JSON.parse(JSON.stringify(sectionData));
    const boxData = sectionDataCopy[sectionDataIndex];
    const { byBadge, byPool } = boxData;

    if (key === 'byBadge') {
      byPool.length = 0;
      boxData.UmpirePaymentFeeType = 'BY_BADGE';
    } else {
      byBadge.length = 0;
      boxData.UmpirePaymentFeeType = 'BY_POOL';
    }

    const newPaymentSettingsData = sectionDataCopy
      ? paymentSettingsData
        ? [...sectionDataCopy, ...paymentSettingsData.filter(item => !item.hasSettings)]
        : [...sectionDataCopy]
      : paymentSettingsData
      ? [...paymentSettingsData.filter(item => !item.hasSettings)]
      : [];

    this.setState({
      paymentSettingsData: newPaymentSettingsData,
    });
  };

  handleChangeSettings = (sectionDataIndex, key, value, sectionData) => {
    const { paymentSettingsData } = this.state;
    const paymentSettingsDataCopy = JSON.parse(JSON.stringify(paymentSettingsData));

    const targetSectionData = paymentSettingsDataCopy
      ? paymentSettingsDataCopy.filter(item => item.savedBy === sectionData[0].savedBy)
      : [];

    const otherSectionData = paymentSettingsDataCopy
      ? paymentSettingsDataCopy.filter(item => item.savedBy !== sectionData[0].savedBy)
      : [];

    if (key === 'allDivisions') {
      this.handleAllDivisionsChange(
        targetSectionData,
        sectionDataIndex,
        paymentSettingsDataCopy,
        value,
      );
    } else if (key === 'divisions') {
      this.handleNonAllDivisionsChange(
        sectionData,
        targetSectionData,
        otherSectionData,
        sectionDataIndex,
        value,
      );
    }
  };

  handleAllDivisionsChange = (
    targetSectionData,
    sectionDataIndex,
    paymentSettingsDataCopy,
    value,
  ) => {
    const { paymentSettingsData, selectedDivisions, allowedDivisionList } = this.state;

    const newSelectedDivisions = [];

    paymentSettingsDataCopy.forEach(item => {
      item.divisions = [];
      item.allDivisions = false;
    });

    if (!!value && !!allowedDivisionList && !!allowedDivisionList.length) {
      newSelectedDivisions.concat([...allowedDivisionList]);
    }

    targetSectionData[sectionDataIndex].divisions =
      !!value && allowedDivisionList ? allowedDivisionList : [];
    targetSectionData[sectionDataIndex].allDivisions = value;

    const newPaymentSettingsData = [targetSectionData[sectionDataIndex]];

    this.setState({
      allDivisionVisible: !!value,
      tempPaymentSettingsData: value ? newPaymentSettingsData : null,
      paymentSettingsData: !value ? newPaymentSettingsData : paymentSettingsData,
      tempSelectedDivisions: value ? newSelectedDivisions : [],
      selectedDivisions: !value ? [] : selectedDivisions,
    });
  };

  handleNonAllDivisionsChange = (
    sectionData,
    targetSectionData,
    otherSectionData,
    sectionDataIndex,
    value,
  ) => {
    const { allowedDivisionList } = this.state;

    const newSelectedDivisions = [];

    const newSettingsData = [...otherSectionData, ...targetSectionData];

    targetSectionData[sectionDataIndex].divisions =
      allowedDivisionList && allowedDivisionList.length
        ? value.map(item =>
            allowedDivisionList.find(divisionListItem => divisionListItem.id === item),
          )
        : [];

    newSettingsData.forEach(item => {
      newSelectedDivisions.push(...item.divisions);
    });

    const updatedSelectedDivisions = newSelectedDivisions.length ? newSelectedDivisions : [];

    if (
      allowedDivisionList &&
      updatedSelectedDivisions &&
      updatedSelectedDivisions.length < allowedDivisionList.length
    ) {
      newSettingsData.forEach(item => {
        item.allDivisions = false;
      });
    }

    if (
      allowedDivisionList &&
      updatedSelectedDivisions &&
      updatedSelectedDivisions.length === allowedDivisionList.length &&
      value.length === allowedDivisionList.length &&
      Number.isInteger(sectionDataIndex) &&
      sectionDataIndex >= 0
    ) {
      const filteredNewSettings = newSettingsData
        ? newSettingsData.filter(item => item?.hasSettings === sectionData[0]?.hasSettings)
        : [];
      if (filteredNewSettings && filteredNewSettings.length > sectionDataIndex) {
        filteredNewSettings[sectionDataIndex].allDivisions = true;
      }
    }

    this.setState({
      paymentSettingsData: newSettingsData,
      selectedDivisions: updatedSelectedDivisions,
    });
  };

  handleChangeRateCell = (
    e,
    sectionData,
    sectionDataIndex,
    rateListKey,
    rateRoleId,
    rateLineDataId,
    sequence,
  ) => {
    const rate = e || 0;
    const { paymentSettingsData } = this.state;
    const sectionDataCopy = JSON.parse(JSON.stringify(sectionData));

    const rateList = sectionDataCopy[sectionDataIndex][rateListKey] ?? [];
    let rateLineData;
    let cellLineIdKey = '';

    if (!rateLineDataId) {
      rateLineData = rateList;
    } else {
      cellLineIdKey = rateListKey === 'byPool' ? 'umpirePoolId' : 'accreditationUmpireRefId';

      rateLineData = rateList.find(data => data[cellLineIdKey] === rateLineDataId)?.rates ?? [];
    }
    const shouldCreateNew = !rateLineData.length;

    const rateDataForChangeIndex = rateLineData.findIndex(
      rate => rate.roleId === rateRoleId && rate.sequence === sequence,
    );

    if (rateDataForChangeIndex >= 0) {
      rateLineData[rateDataForChangeIndex].rate = rate;
    } else {
      rateLineData.push({
        rate,
        roleId: rateRoleId,
        sequence,
      });
    }

    if (shouldCreateNew && rateLineDataId && cellLineIdKey) {
      rateList.push({
        [cellLineIdKey]: rateLineDataId,
        rates: rateLineData,
      });
    }
    sectionDataCopy[sectionDataIndex][rateListKey] = rateList;

    const newPaymentSettingsData = sectionDataCopy
      ? paymentSettingsData
        ? [...sectionDataCopy, ...paymentSettingsData.filter(item => !item.hasSettings)]
        : [...sectionDataCopy]
      : paymentSettingsData
      ? [...paymentSettingsData.filter(item => !item.hasSettings)]
      : [];

    this.setState({
      paymentSettingsData: newPaymentSettingsData,
    });
  };

  handleClickDeleteModal = sectionDataIndex => {
    this.setState({
      deleteModalVisible: true,
      sectionDataToDeleteIndex: sectionDataIndex,
    });
  };

  handleDeleteModal = key => {
    if (key === 'ok') {
      const { paymentSettingsData, sectionDataToDeleteIndex } = this.state;
      const umpirePaymentSettingsCopy = paymentSettingsData
        ? JSON.parse(JSON.stringify(paymentSettingsData.filter(item => item.hasSettings)))
        : [];

      umpirePaymentSettingsCopy.splice(sectionDataToDeleteIndex, 1);

      const newPaymentSettingsData = umpirePaymentSettingsCopy
        ? paymentSettingsData
          ? [...umpirePaymentSettingsCopy, ...paymentSettingsData.filter(item => !item.hasSettings)]
          : [...umpirePaymentSettingsCopy]
        : paymentSettingsData
        ? [...paymentSettingsData.filter(item => !item.hasSettings)]
        : [];

      const newSelectedDivisions = [];

      newPaymentSettingsData.forEach(item => {
        newSelectedDivisions.push(...item.divisions);
      });

      this.setState({
        paymentSettingsData: newPaymentSettingsData,
        selectedDivisions: newSelectedDivisions,
      });
    }

    this.setState({
      deleteModalVisible: false,
      sectionDataToDeleteIndex: null,
    });
  };

  handleAllDivisionModal = key => {
    const { tempPaymentSettingsData, tempSelectedDivisions } = this.state;

    if (key === 'ok') {
      this.setState({
        paymentSettingsData: tempPaymentSettingsData,
        selectedDivisions: tempSelectedDivisions,
      });
    }

    this.setState({
      allDivisionVisible: false,
      tempPaymentSettingsData: null,
      tempSelectedDivisions: null,
    });
  };

  handleAddBox = type => {
    const { paymentSettingsData } = this.state;

    const initialSettingsBoxData = JSON.parse(JSON.stringify(initialPaymentSettingsData));

    const newPaymentSettingsData = [
      ...paymentSettingsData,
      {
        ...initialSettingsBoxData,
        savedBy: type,
      },
    ];

    this.setState({ paymentSettingsData: newPaymentSettingsData });
  };

  onChangeComp = compID => {
    const { competitionList } = this.state;

    const compObj = competitionList.find(competition => competition.id === compID);
    const { isOrganiser } = compObj || {};
    this.props.liveScoreGetDivision(compID);
    setCompDataForAll(compObj);
    this.setState({ selectedComp: compID, competition: compObj, isOrganiserView: isOrganiser });
  };

  modifyPostArray = arr => {
    arr.forEach(item => {
      item.divisions = item.allDivisions ? [] : item.divisions.map(division => division.id);
      delete item.hasSettings;
    });

    return arr;
  };

  handleSave = () => {
    const { organisationId } = getOrganisationData() || {};
    const {
      selectedComp,
      paymentSettingsData,
      isOrganiserView,
      allowPayment,
      allowedDivisionList,
    } = this.state;

    // Validation for Competition Organiser
    const compOrganiser = paymentSettingsData.find(i => !!i.hasSettings);
    if (compOrganiser) {
      if (!compOrganiser.allDivisions && !compOrganiser.divisions.length) {
        message.error(AppConstants.selectDivisionToAddFees);
        return;
      }
    }

    // Validation for Affiliate Organisations
    const affiliates = paymentSettingsData.filter(i => !i.hasSettings);
    if (affiliates.length) {
      for (const affiliate of affiliates) {
        if (!affiliate.allDivisions && !affiliate.divisions.length) {
          message.error(AppConstants.noAllowedDivisionsToAddFees);
          return;
        }
      }
    }

    const paymentSettingsDataCopy = JSON.parse(JSON.stringify(paymentSettingsData));

    const affiliateSettingArray = paymentSettingsDataCopy
      ? paymentSettingsDataCopy.filter(
          item => !item.hasSettings && (!!item.divisions.length || !!item.allDivisions),
        )
      : [];

    const umpirePaymentSettingsArray = paymentSettingsDataCopy
      ? paymentSettingsDataCopy.filter(
          item => !!item.hasSettings && (!!item.divisions.length || !!item.allDivisions),
        )
      : [];

    this.modifyPostArray(affiliateSettingArray);
    this.modifyPostArray(umpirePaymentSettingsArray);

    const allowedDivisionsSettings = allowPayment
      ? affiliateSettingArray.filter(item => !!item.divisions.length || !!item.allDivisions)
      : null;

    const umpirePaymentSettings =
      !!umpirePaymentSettingsArray.length && allowPayment ? umpirePaymentSettingsArray : [];

    const bodyData = {
      noPaymentThroughPlatform: !allowPayment,
      officialPaymentSettings: umpirePaymentSettings,
    };
    if (isOrganiserView) {
      bodyData.allowedDivisionsSettings = allowedDivisionsSettings;
    } else {
      if (!allowedDivisionList) {
        message.error(AppConstants.noAllowedDivisionsToAddFees);
        return;
      }
      if (umpirePaymentSettings.length == 0) {
        message.error(AppConstants.selectDivisionToAddFees);
        return;
      }
    }

    const saveData = {
      organisationId,
      competitionId: selectedComp,
      type: isOrganiserView ? 'organiser' : 'affiliate',
      body: bodyData,
    };

    this.props.saveUmpirePaymentSettings(saveData);
  };

  setYear = yearRefId => {
    setGlobalYear(yearRefId);
    this.setState({ yearRefId });
    this.setState({ loading: true });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
  };

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">
            {AppConstants.officialPaymentSetting}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

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
                    <Option key={`year_${item.id}`} value={item.id}>
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
                >
                  {!this.state.selectedComp && <Option value="">All</Option>}
                  {!!competitionList &&
                    competitionList.map(item => (
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

  allowPaymentsSwitcher = () => {
    const { allowPayment, isOrganiserView } = this.state;
    return (
      <div className="d-flex flex-column pb-3">
        <Radio
          onChange={() => {
            if (allowPayment) this.setState({ allowPayment: false });
          }}
          checked={!allowPayment}
          disabled={!isOrganiserView}
          className="p-0"
        >
          {AppConstants.noUmpirePayments}
        </Radio>
        <Radio
          onChange={() => {
            if (!allowPayment) this.setState({ allowPayment: true });
          }}
          checked={allowPayment}
          disabled={!isOrganiserView}
          className="p-0"
        >
          {AppConstants.yesUmpirePayments}
        </Radio>
      </div>
    );
  };

  contentView = () => {
    const { isOrganiserView, paymentSettingType, allowPayment, isDirectCompetition } = this.state;

    return (
      <div className="content-view mt-5">
        {!this.props.umpireCompetitionState.onLoad && (
          <>
            {!this.props.umpirePaymentSettingState.onLoad && this.allowPaymentsSwitcher()}
            {allowPayment && !this.props.umpirePaymentSettingState.onLoad && (
              <>
                {isOrganiserView ? (
                  <>
                    <span className="text-heading-large pt-2 pb-2">
                      {AppConstants.whoPayOfficial}
                    </span>
                    <div className="d-flex flex-column">
                      {this.umpireSettingsSectionView(
                        'ORGANISER',
                        AppConstants.competitionOrganiser,
                        true,
                      )}
                      {this.umpireSettingsSectionView(
                        'AFFILIATE',
                        AppConstants.affiliateOrganisations,
                        false,
                        isDirectCompetition,
                      )}
                      {this.umpireSettingsSectionView(
                        'OFFICIAL_ORGANISATION',
                        AppConstants.officialOrganisation,
                        false,
                        isDirectCompetition,
                      )}
                    </div>
                  </>
                ) : (
                  <div className="d-flex flex-column">
                    {this.umpireSettingsSectionView(paymentSettingType, null, true)}
                  </div>
                )}

                {this.deleteConfirmModalView()}
                {this.allDivisionModalView()}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  umpireSettingsSectionView = (type, sectionTitle, hasSettings, disabled = false) => {
    const { paymentSettingsData, selectedDivisions, allowedDivisionList } = this.state;

    console.log(sectionTitle, hasSettings, paymentSettingsData);

    const sectionData =
      hasSettings && !!paymentSettingsData
        ? paymentSettingsData.filter(item => item.hasSettings)
        : paymentSettingsData
        ? paymentSettingsData.filter(item => !item.hasSettings && item.savedBy === type)
        : [];

    const getAvailableDivisions = boxData => {
      let availableDivisions = [];
      if (
        boxData &&
        boxData.allDivisions &&
        allowedDivisionList &&
        Array.isArray(allowedDivisionList)
      ) {
        availableDivisions = allowedDivisionList.map(division => division.id);
      } else if (boxData && !boxData.allDivisions && boxData.divisions) {
        availableDivisions = boxData.divisions.map(division => division.id);
      }
      return availableDivisions;
    };

    const isDivisionsDisabled = (boxData, itemId) =>
      selectedDivisions.some(
        selectedDivision =>
          selectedDivision?.id === itemId &&
          boxData &&
          !boxData.allDivisions &&
          boxData.divisions &&
          !boxData.divisions.find(division => division?.id === itemId),
      );

    return (
      <>
        {sectionTitle && (
          <Checkbox
            onChange={e => this.handleChangeWhoPaysUmpires(e, type, hasSettings)}
            checked={!!sectionData?.length}
            className="mx-0 mb-2"
            disabled={disabled}
          >
            {sectionTitle}
          </Checkbox>
        )}
        {sectionData && !!sectionData.length && (
          <div className="position-relative" style={{ paddingBottom: 35 }}>
            {sectionData.map((boxData, sectionDataIndex) => (
              <div
                key={`settingsBox_${sectionDataIndex}`}
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
                  checked={boxData?.allDivisions}
                  disabled={!allowedDivisionList}
                >
                  {AppConstants.allDivisions}
                </Checkbox>

                <Select
                  mode="multiple"
                  placeholder={
                    !allowedDivisionList ? AppConstants.noAllowedDivision : AppConstants.select
                  }
                  style={{
                    width: '100%',
                    paddingRight: 1,
                    minWidth: 182,
                    marginTop: 20,
                  }}
                  onChange={divisions =>
                    this.handleChangeSettings(sectionDataIndex, 'divisions', divisions, sectionData)
                  }
                  value={getAvailableDivisions(boxData)}
                  disabled={!allowedDivisionList}
                >
                  {(allowedDivisionList || []).map(item => (
                    <Option
                      key={`compOrgDivision_${item.id}`}
                      disabled={isDivisionsDisabled(boxData, item.id)}
                      value={item.id}
                    >
                      {item.name}
                    </Option>
                  ))}
                </Select>
                {hasSettings && this.umpireFeesView(sectionData, sectionDataIndex)}
                {hasSettings && this.officialsFeesView(sectionData, sectionDataIndex)}
              </div>
            ))}
            {!!allowedDivisionList &&
              !!selectedDivisions &&
              selectedDivisions.length < allowedDivisionList.length &&
              hasSettings && (
                <div className="row mb-5 position-absolute">
                  <div className="col-sm" onClick={() => this.handleAddBox(type)}>
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

  umpireFeesView = (sectionData, sectionDataIndex) => {
    const { umpirePoolData } = this.props.umpirePoolAllocationState;

    const { badgeData } = this.props.appState;
    const umpireBadgesData = isArrayNotEmpty(badgeData) ? badgeData : [];

    const { UmpirePaymentFeeType } = sectionData[sectionDataIndex];

    return (
      <div>
        <span className="text-heading-large pt-3 mt-5">{AppConstants.umpireFees}</span>
        <div className="d-flex flex-column">
          <Radio
            onChange={() => this.handleChangeFeesRadio(sectionData, sectionDataIndex, 'byBadge')}
            checked={UmpirePaymentFeeType === 'BY_BADGE'}
            className="p-0"
          >
            {AppConstants.byBadge}
          </Radio>
          {UmpirePaymentFeeType === 'BY_BADGE' && !!umpireBadgesData.length && (
            <div>
              {umpireBadgesData.map((badgeDataItem, i) => (
                <div key={`badgeDataItem${i}`}>
                  {this.umpireFeesRowView('byBadge', badgeDataItem, sectionData, sectionDataIndex)}
                </div>
              ))}
            </div>
          )}

          <Radio
            onChange={() => this.handleChangeFeesRadio(sectionData, sectionDataIndex, 'byPool')}
            checked={UmpirePaymentFeeType === 'BY_POOL'}
            className="p-0 mt-4"
          >
            {AppConstants.byPool}
          </Radio>
          {UmpirePaymentFeeType === 'BY_POOL' && (
            <>
              {umpirePoolData.length ? (
                <div>
                  {umpirePoolData.map((poolDataItem, i) => (
                    <div key={`poolDataItem${i}`}>
                      {this.umpireFeesRowView(
                        'byPool',
                        poolDataItem,
                        sectionData,
                        sectionDataIndex,
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 error-message-inside">{AppConstants.noPoolMsg}</div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  officialsFeesView = (sectionData, sectionDataIndex) => {
    const { competition } = this.state;
    const numberOfOfficials = competition?.umpireSequenceSettings?.NumberOfOfficials ?? 0;

    if (!numberOfOfficials) {
      return null;
    }
    return (
      <div>
        <span className="text-heading-large pt-3 mt-5">{AppConstants.officialFees}</span>
        <div className="d-flex flex-column">
          {this.officialFeesRowView(sectionData, sectionDataIndex)}
        </div>
      </div>
    );
  };

  officialFeesRowView = (sectionData, sectionDataIndex) => {
    const { competition } = this.state;
    const numberOfOfficials = competition?.umpireSequenceSettings?.NumberOfOfficials ?? 0;

    const sequences = Array.from({ length: numberOfOfficials }).map((_, index) => index + 1);
    const radioListKey = 'officials';

    const itemRates = sectionData[sectionDataIndex][radioListKey];

    return (
      <div>
        <div className="row">
          {sequences.map(sequence =>
            this.rateCellView(
              itemRates,
              RegistrationUserRoles.OtherOfficial,
              `${AppConstants.officialStatisticians} ${sequence} rate (inc GST)`,
              sectionData,
              sectionDataIndex,
              radioListKey,
              null,
              sequence,
            ),
          )}
        </div>
      </div>
    );
  };

  umpireFeesRowView = (radioListKey, dataItem, sectionData, sectionDataIndex) => {
    const { competition } = this.state;
    const sequences = getUmpireSequencesFromSettings(competition?.umpireSequenceSettings, true);

    const cellLineIdKey = radioListKey === 'byPool' ? 'umpirePoolId' : 'accreditationUmpireRefId';
    const itemRates = sectionData[sectionDataIndex][radioListKey].find(
      data => data[cellLineIdKey] === dataItem.id,
    )?.rates;

    return (
      <div>
        <div className="row">
          {!!dataItem && (
            <div className="col-sm input-width d-flex align-items-end">
              <InputWithHead
                heading={AppConstants.name}
                placeholder="Name"
                value={dataItem.description || dataItem.name}
                disabled
              />
            </div>
          )}

          {sequences.map(sequence => {
            const umpireField = getUmpireField(sequence);

            return this.rateCellView(
              itemRates,
              umpireField.roleId,
              umpireField.rateHeading,
              sectionData,
              sectionDataIndex,
              radioListKey,
              dataItem?.id,
              sequence,
            );
          })}
        </div>
      </div>
    );
  };

  rateCellView = (
    poolItemRates,
    rateRoleId,
    heading,
    sectionData,
    sectionDataIndex,
    radioListKey,
    rateLineIndex,
    sequence,
  ) => {
    const value = (poolItemRates || []).find(
      rate => rate.roleId === rateRoleId && rate.sequence === sequence,
    )?.rate;

    return (
      <div className="col-sm input-width d-flex align-items-end">
        <InputNumberWithHead
          prefixValue="$"
          defaultValue={0}
          min={0}
          precision={2}
          step={0.01}
          heading={heading}
          onChange={e =>
            this.handleChangeRateCell(
              e,
              sectionData,
              sectionDataIndex,
              radioListKey,
              rateRoleId,
              rateLineIndex,
              sequence,
            )
          }
          value={value || 0}
        />
      </div>
    );
  };

  deleteConfirmModalView = () => (
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

  allDivisionModalView = () => (
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

  footerView = () => {
    const { umpirePoolData } = this.props.umpirePoolAllocationState;
    const { paymentSettingsData } = this.state;

    const someNoPoolSettings =
      !!paymentSettingsData &&
      paymentSettingsData.some(
        settingsItem => settingsItem.UmpirePaymentFeeType === 'BY_POOL' && !umpirePoolData.length,
      );

    return (
      <div className="form-footer-button-wrapper justify-content-between">
        <div className="reg-add-save-button">
          <NavLink to="/umpireDivisions">
            <Button className="cancelBtnWidth" type="cancel-button">
              {AppConstants.back}
            </Button>
          </NavLink>
        </div>
        <Button
          onClick={this.handleSave}
          className="publish-button save-draft-text mr-0"
          type="primary"
          htmlType="submit"
          disabled={
            someNoPoolSettings ||
            !this.state.selectedComp ||
            this.props.umpireCompetitionState.onLoad ||
            this.props.umpirePaymentSettingState.onLoad ||
            this.props.liveScoreTeamState.onLoad ||
            this.props.umpirePoolAllocationState.onLoad
          }
        >
          {AppConstants.save}
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.officials} menuName={AppConstants.officials} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="9" />
        <Layout>
          <Form onFinish={this.saveAPIsActionCall} noValidate="noValidate">
            {this.headerView()}
            {this.dropdownView()}
            <Content>
              <div className="formView umpire-form-view">{this.contentView()}</div>
            </Content>
            {this.footerView()}
          </Form>
          <Loader
            visible={
              this.props.umpireCompetitionState.onLoad ||
              this.props.umpirePaymentSettingState.onLoad ||
              this.props.liveScoreTeamState.onLoad ||
              this.props.umpirePoolAllocationState.onLoad
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
      getRefBadgeData,
      getUmpirePaymentSettings,
      saveUmpirePaymentSettings,
      liveScoreGetDivision,
      getUmpirePoolData,
      getOnlyYearListAction,
      umpireYearChangedAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireCompetitionState: state.UmpireCompetitionState,
    umpirePaymentSettingState: state.UmpirePaymentSettingState,
    umpirePoolAllocationState: state.UmpirePoolAllocationState,
    liveScoreTeamState: state.LiveScoreTeamState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpirePaymentSetting);

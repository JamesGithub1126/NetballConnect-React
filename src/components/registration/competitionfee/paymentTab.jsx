import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  Table,
  Tree,
  Radio,
  Tabs,
  Form,
  Modal,
  message,
  Tooltip,
  Switch,
  InputNumber,
  Popover,
} from 'antd';
import { NavLink } from 'react-router-dom';
import InputWithHead from '../../../customComponents/InputWithHead';
import CustomToolTip from 'react-png-tooltip';
import AppUniqueId from 'themes/appUniqueId';
import AppConstants from '../../../themes/appConstants';
import AppImages from '../../../themes/appImages';
import moment from 'moment';

import {
  RegistrationInviteesName,
  RegistrationInvitees,
  TeamFeeType,
  TeamRegistrationChargeType,
  AllowTeamRegistrationType,
  SeasonalPaymentOption,
  FeesType,
  IndividualChargeType,
} from '../../../enums/registrationEnums';
import { isArrayNotEmpty } from '../../../util/helpers';

import ValidationConstants from 'themes/validationConstant';
import {
  checkIsCasual,
  checkIsSeasonal,
  checkIsTeamCasual,
  checkIsTeamSeasonal,
} from 'util/competitionFeeHelper';
import { getOrganisationData } from 'util/sessionStorage';

class CompetitionPaymentTab extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {}

  componentDidMount() {}
  instalmentDate() {
    return (
      <div className="breadcrumb-add pb-2" style={{ fontSize: 16, cursor: 'default' }}>
        {AppConstants.instalmentDate}
      </div>
    );
  }

  instalmentUponReg(key, value) {
    let installmentDisabled = !this.props.permissionState?.payments?.installments?.enabled;
    return (
      <div className="pt-4 pb-4">
        <Switch
          onChange={e => this.props.instalmentDateAction(e, key)}
          checked={value}
          style={{ marginRight: 10 }}
          disabled={installmentDisabled}
          data-testid={AppUniqueId.INSTALLMENT_UPON_REGISTRATION}
        />
        {AppConstants.uponRegistration}
      </div>
    );
  }

  showInstalmentDate(selectedSeasonalInstalmentDatesArray, key) {
    return selectedSeasonalInstalmentDatesArray.map(
      (selectedSeasonalInstalmentDatesArrayItem, index) => {
        return this.getInstalmentDate(
          selectedSeasonalInstalmentDatesArray,
          selectedSeasonalInstalmentDatesArrayItem,
          index,
          key,
        );
      },
    );
  }

  getInstalmentDate(
    selectedSeasonalInstalmentDatesArray,
    selectedSeasonalInstalmentDatesArrayItem,
    index,
    key,
  ) {
    let removeObj = {
      selectedSeasonalInstalmentDatesArray: selectedSeasonalInstalmentDatesArray,
      selectedSeasonalInstalmentDatesArrayItem: selectedSeasonalInstalmentDatesArrayItem,
      index,
    };
    let instalmentDate = selectedSeasonalInstalmentDatesArrayItem.instalmentDate;
    let installmentDisabled = !this.props.permissionState?.payments?.installments?.enabled;
    return (
      <div className="pt-3">
        <DatePicker
          placeholder="dd-mm-yyyy"
          format="DD-MM-YYYY"
          showTime={false}
          onChange={e =>
            this.instalmentPaymentDateChange(e, selectedSeasonalInstalmentDatesArrayItem, key)
          }
          data-testid={AppUniqueId.INSTALLMENT_DATE}
          value={instalmentDate == '' ? null : moment(instalmentDate, 'YYYY-MM-DD')}
          disabled={installmentDisabled}
        />

        <span style={{ marginLeft: 8, cursor: 'pointer' }}>
          {!installmentDisabled && (
            <img
              className="dot-image"
              src={AppImages.redCross}
              alt=""
              width="16"
              height="16"
              onClick={e => this.props.instalmentDateAction(removeObj, 'instalmentRemoveDate', key)}
            />
          )}
        </span>
      </div>
    );
  }

  instalmentPaymentDateChange(instalmentDate, selectedSeasonalInstalmentDatesArrayItem, key) {
    let obj = {
      instalmentDate: moment(instalmentDate).format('YYYY-MM-DD'),
      selectedSeasonalInstalmentDatesArrayItem: selectedSeasonalInstalmentDatesArrayItem,
    };
    if (instalmentDate !== null && instalmentDate !== '') {
      this.props.instalmentDateAction(obj, 'instalmentDateupdate', key);
    }
  }

  addInstalmentDateBtn(selectedSeasonalInstalmentDatesArray, key) {
    let installmentDisabled = !this.props.permissionState?.payments?.installments?.enabled;
    return (
      <div>
        {!installmentDisabled && (
          <span
            style={{ cursor: 'pointer', paddingTop: 0 }}
            onClick={e =>
              this.props.instalmentDateAction(
                selectedSeasonalInstalmentDatesArray,
                'instalmentAddDate',
                key,
              )
            }
            className="input-heading-add-another pt-4"
            data-testid={AppUniqueId.ADD_ANOTHER_DATE}
          >
            {AppConstants.addInstalmentDate}
          </span>
        )}
      </div>
    );
  }

  seasonalRegistrationcode(seasonalSchoolRegCode) {
    return (
      <div className="input-reg-text">
        <InputWithHead
          auto_complete="new-membershipTypeName"
          // required="pt-0 mt-0"
          heading={AppConstants.enterCode}
          placeholder={AppConstants.enterCode}
          data-testid={AppUniqueId.REGISTRATION_CODE}
          style={{ width: '100%', background: 'white', height: 48 }}
          onChange={e => this.regCodeChange(e.target.value, 'seasonalSchoolRegCode')}
          value={seasonalSchoolRegCode}
        />
      </div>
    );
  }

  teamSeasonalRegistrationcode(teamSeasonalSchoolRegCode) {
    return (
      <div className="input-reg-text">
        <InputWithHead
          auto_complete="new-membershipTypeName"
          // required="pt-0 mt-0"
          heading={AppConstants.enterCode}
          placeholder={AppConstants.enterCode}
          style={{ width: '100%', background: 'white', height: 48 }}
          onChange={e => this.regCodeChange(e.target.value, 'teamSeasonalSchoolRegCode')}
          value={teamSeasonalSchoolRegCode}
        />
      </div>
    );
  }
  managePaymentPlan(competitionUniqueKey) {
    return (
      <NavLink
        to={{
          pathname: '/paymentPlanDashboard',
          state: {
            competitionUniqueKey: competitionUniqueKey,
            yearRefId: this.props.yearRefId,
          },
        }}
      >
        <span className="text-underline">{AppConstants.managePaymentPlan}</span>
      </NavLink>
    );
  }
  regCodeChange = (value, key) => {
    this.props.instalmentDateAction(value, key);
  };
  onChangePaymentOptionFee(itemValue, index, key, subKey, item) {
    let setFormState = this.props.setFormState;
    this.props.updatePaymentFeeOption(itemValue, key, index, subKey, item);
    let selectedCasualPaymentArr = this.props.competitionFeesState.selectedCasualFee;
    let SelectedSeasonalPaymentArr = this.props.competitionFeesState.SelectedSeasonalFee;
    let selectedSeasonalTeamPaymentArr = this.props.competitionFeesState.selectedSeasonalTeamFee;
    let selectedCasualTeamPaymentArr = this.props.competitionFeesState.selectedCasualTeamFee;
    let selectedIndividualPerMatchFee =
      this.props.competitionFeesState.selectedIndividualPerMatchFee;
    let feeDetails = this.props.competitionFeesState.competitionFeesData;

    //let isSeasonal = checkIsSeasonal(feeDetails);
    let isCasual = checkIsCasual(feeDetails);
    let isTeamSeasonal = checkIsTeamSeasonal(feeDetails);
    let isTeamCasual = checkIsTeamCasual(feeDetails);
    let isIndividualFullSeason = feeDetails.some(
      x => x.isSeasonal && x.individualChargeTypeRefId == IndividualChargeType.FullSeason,
    );
    let isIndividualPerMatch = feeDetails.some(
      x => x.isSeasonal && x.individualChargeTypeRefId == IndividualChargeType.PerMatch,
    );

    selectedCasualPaymentArr = selectedCasualPaymentArr.filter(x => x.isChecked && isCasual);
    SelectedSeasonalPaymentArr = SelectedSeasonalPaymentArr.filter(
      x => x.isChecked && isIndividualFullSeason,
    );
    selectedSeasonalTeamPaymentArr = selectedSeasonalTeamPaymentArr.filter(
      x => x.isChecked && isTeamSeasonal,
    );
    selectedCasualTeamPaymentArr = selectedCasualTeamPaymentArr.filter(
      x => x.isChecked && isTeamCasual,
    );
    if (key === 'seasonalfee') {
      if (isIndividualFullSeason && SelectedSeasonalPaymentArr.length === 0) {
        setFormState({ isSeasonalPaymentOptionAvailable: false });
      } else {
        setFormState({ isSeasonalPaymentOptionAvailable: true });
      }
    } else if (key === 'individualPerMatchFee') {
      if (isIndividualPerMatch && !selectedIndividualPerMatchFee.some(x => x.isChecked)) {
        setFormState({ isSeasonalPaymentOptionAvailable: false });
      } else {
        setFormState({ isSeasonalPaymentOptionAvailable: true });
      }
    } else if (key === 'casualfee') {
      if (isCasual && selectedCasualPaymentArr.length === 0) {
        setFormState({ isCasualPaymentOptionAvailable: false });
      } else {
        setFormState({ isCasualPaymentOptionAvailable: true });
      }
    } else if (key === 'seasonalteamfee') {
      if (isTeamSeasonal && selectedSeasonalTeamPaymentArr.length === 0) {
        setFormState({ isSeasonalTeamPaymentOptionAvailable: false });
      } else {
        setFormState({ isSeasonalTeamPaymentOptionAvailable: true });
      }
    } else if (key === 'casualteamfee') {
      if (isTeamCasual && selectedCasualTeamPaymentArr.length === 0) {
        setFormState({ isCasualTeamPaymentOptionAvailable: false });
      } else {
        setFormState({ isCasualTeamPaymentOptionAvailable: true });
      }
    }
  }
  onChangeInstalmentOption(itemValue, index, key, subKey, item) {
    let selectedSeasonalFee = [];
    let feesTypeRefId = 0;
    if (key == 'seasonalfee') {
      selectedSeasonalFee = this.props.competitionFeesState.SelectedSeasonalFee;
      feesTypeRefId = FeesType.Seasonal;
    } else if ((key = 'seasonalteamfee')) {
      selectedSeasonalFee = this.props.competitionFeesState.selectedSeasonalTeamFee;
      feesTypeRefId = FeesType.TeamSeasonal;
    }
    let isAffiliate = this.props.isCreatorEdit;
    let currentOrganisationId = this.props.currentOrganisationId;
    if (isAffiliate) {
      let paymentOptionRefId = item.paymentOptionRefId;
      let affiliatePaymentOption = selectedSeasonalFee.find(
        x =>
          x.paymentOptionRefId == paymentOptionRefId && x.organisationId == currentOrganisationId,
      );
      if (affiliatePaymentOption) {
        affiliatePaymentOption.isChecked = itemValue;
      } else {
        let organiserInstalmentOptionIndex = selectedSeasonalFee.findIndex(
          x => x.paymentOptionRefId == paymentOptionRefId,
        );
        if (organiserInstalmentOptionIndex > -1) {
          if (paymentOptionRefId == SeasonalPaymentOption.Instalments) {
            let description = 'Instalments';
            let paymentOptObj = {
              feesTypeRefId: feesTypeRefId,
              isChecked: itemValue,
              paymentOptionId: 0,
              paymentOptionRefId: paymentOptionRefId,
              description: description,
              organisationId: currentOrganisationId,
            };
            selectedSeasonalFee.splice(organiserInstalmentOptionIndex + 1, 0, paymentOptObj);
          } else if (paymentOptionRefId == SeasonalPaymentOption.PaymentPlan) {
            selectedSeasonalFee[organiserInstalmentOptionIndex].isChecked = itemValue;
            selectedSeasonalFee[organiserInstalmentOptionIndex].organisationId =
              currentOrganisationId;
          }
        }
      }
      this.setState({ updateUI: true });
    } else {
      this.onChangePaymentOptionFee(itemValue, index, key, subKey, item);
    }
  }

  //payment Option View in tab 5
  paymentOptionsView = () => {
    let allStates = this.props.competitionFeesState;
    let competitionDetailData = allStates.competitionDetailData;
    let feeDetails = allStates.competitionFeesData;
    let isSeasonal = checkIsSeasonal(feeDetails);
    let isCasual = checkIsCasual(feeDetails);
    let isTeamSeasonal = checkIsTeamSeasonal(feeDetails);
    let isTeamCasual = checkIsTeamCasual(feeDetails);
    let isIndividualFullSeason = feeDetails.some(
      x => x.isSeasonal && x.individualChargeTypeRefId == IndividualChargeType.FullSeason,
    );
    let isIndividualPerMatch = feeDetails.some(
      x => x.isSeasonal && x.individualChargeTypeRefId == IndividualChargeType.PerMatch,
    );

    let selectedSeasonalFee = this.props.competitionFeesState.SelectedSeasonalFee;
    let selectedIndividualPerMatchFee = allStates.selectedIndividualPerMatchFee;
    let isAffiliate = this.props.isCreatorEdit;
    let currentOrganisationId = this.props.currentOrganisationId;
    let isAffiliateSeasonOptionExist = selectedSeasonalFee.some(
      x =>
        x.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
        x.organisationId == currentOrganisationId,
    );
    let selectedCasualFee = this.props.competitionFeesState.selectedCasualFee;
    let selectedSeasonalTeamFee = this.props.competitionFeesState.selectedSeasonalTeamFee;
    let isAffiliateSeasonTeamOptionExist = selectedSeasonalTeamFee.some(
      x =>
        x.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
        x.organisationId == currentOrganisationId,
    );
    let selectedCasualTeamFee = this.props.competitionFeesState.selectedCasualTeamFee;
    let selectedPaymentMethods = this.props.competitionFeesState.selectedPaymentMethods;

    let isSeasonalUponReg =
      competitionDetailData.isSeasonalUponReg != undefined
        ? competitionDetailData.isSeasonalUponReg
        : false;
    let seasonalSchoolRegCode =
      competitionDetailData.seasonalSchoolRegCode != undefined
        ? competitionDetailData.seasonalSchoolRegCode
        : null;

    let isTeamSeasonalUponReg =
      competitionDetailData.isTeamSeasonalUponReg != undefined
        ? competitionDetailData.isTeamSeasonalUponReg
        : false;
    let teamSeasonalSchoolRegCode =
      competitionDetailData.teamSeasonalSchoolRegCode != undefined
        ? competitionDetailData.teamSeasonalSchoolRegCode
        : null;

    let paymentsDisable = !this.props.permissionState?.payments?.enabled;
    let selectedSeasonalInstalmentDates =
      this.props.competitionFeesState.selectedSeasonalInstalmentDates;
    let selectedTeamSeasonalInstalmentDates =
      this.props.competitionFeesState.selectedTeamSeasonalInstalmentDates;
    let paymentData = allStates.competitionPaymentsData;
    let enableOfflinePayments = paymentData.offlinePayments == 1;
    let offlineDisable = paymentsDisable || !enableOfflinePayments;
    let paymentOptions = paymentData.paymentOptions;
    let invitees = competitionDetailData.invitees;
    let isDirectComp = false;
    let isInvited = false;
    if (isArrayNotEmpty(invitees)) {
      isDirectComp = invitees[0].registrationInviteesRefId == 5;
    }
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    if (competitionDetailData.inviteesOrg && orgData) {
      isInvited = competitionDetailData.inviteesOrg.some(
        x => x.organisationUniqueKey == orgData.organisationUniqueKey,
      );
    }
    let canManagePaymentPlan = isAffiliate || isDirectComp || isInvited;
    if (!canManagePaymentPlan) {
      selectedSeasonalFee = selectedSeasonalFee.filter(
        x => x.paymentOptionRefId != SeasonalPaymentOption.PaymentPlan,
      );
    }

    return (
      <>
        <div className="tab-formView">
          <div className="advanced-setting-view">
            <div className="contextualHelp-RowDirection">
              <span className="form-heading">{AppConstants.paymentMethods}</span>
            </div>

            {(
              selectedPaymentMethods.map(pm => {
                if (pm.paymentMethodRefId == 3)
                  pm.description = pm.description.replace('and single game ', '');
                return pm;
              }) || []
            ).map((item, index) => (
              <div key={index} className="pt-4">
                <Checkbox
                  checked={item.isChecked}
                  data-testid={AppUniqueId.PAYMENT_METHOD + index}
                  onChange={e =>
                    this.onChangePaymentOptionFee(
                      e.target.checked,
                      index,
                      'paymentmethods',
                      'isChecked',
                      item,
                    )
                  }
                  className="single-checkbox mt-1"
                  disabled={paymentsDisable}
                >
                  {item.description}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
        <div className="tab-formView">
          <div className="advanced-setting-view pt-5">
            <span className="form-heading">{AppConstants.paymentOptions}</span>
            {isSeasonal == false &&
              isCasual == false &&
              isTeamSeasonal == false &&
              isTeamCasual == false && (
                <span className="applicable-to-heading pt-0 text-with-red-color">
                  {AppConstants.please_Sel_Fee}
                </span>
              )}

            <div className="inside-container-view">
              <div className="contextualHelp-RowDirection">
                <span className="form-heading">{AppConstants.nominationFee}</span>
                {/* <div className="mt-5">
                                 <CustomToolTip placement="top">
                                     <span>{AppConstants.paymentSeasonalFeeMsg}</span>
                                 </CustomToolTip>
                             </div> */}
              </div>
              <Radio.Group className="reg-competition-radio" value={1} disabled={paymentsDisable}>
                <Radio value={1} data-testid={AppUniqueId.PAYMENT_NOMINATION_FEE}>
                  {AppConstants.atPointOfRegistration}
                </Radio>
                <div className="pl-2">{AppConstants.nominationFeeTeam}</div>
              </Radio.Group>
            </div>
            {isIndividualFullSeason && (
              <div
                className={`inside-container-view
                  ${!this.props.isSeasonalPaymentOptionAvailable ? 'validation-border' : ''}`}
              >
                <div className="contextualHelp-RowDirection">
                  <span className="form-heading">{AppConstants.seasonalFee}</span>
                  <div>
                    <CustomToolTip placement="top">
                      <span>{AppConstants.paymentSeasonalFeeMsg}</span>
                    </CustomToolTip>
                  </div>
                </div>
                {(selectedSeasonalFee || []).map((item, index) => {
                  if (
                    isAffiliate &&
                    isAffiliateSeasonOptionExist &&
                    item.paymentOptionRefId == SeasonalPaymentOption.Instalments
                  ) {
                    if (!item.organisationId || item.organisationId != currentOrganisationId) {
                      //skip organiser option
                      return null;
                    }
                  }
                  let paymentOptionDisable = paymentsDisable;
                  let installmentDisabled =
                    !this.props.permissionState?.payments?.installments?.enabled;
                  let hasInstalment = false;
                  if (paymentOptions) {
                    hasInstalment = paymentOptions.some(
                      x =>
                        x.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
                        x.isChecked &&
                        x.feesTypeRefId == FeesType.Seasonal,
                    );
                  }
                  if (item.paymentOptionRefId == SeasonalPaymentOption.School) {
                    paymentOptionDisable = offlineDisable;
                  } else if (
                    item.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
                    hasInstalment
                  ) {
                    paymentOptionDisable = false;
                  } else if (item.paymentOptionRefId == SeasonalPaymentOption.PaymentPlan) {
                    paymentOptionDisable = false;
                  }
                  return (
                    <div key={index} className="pt-4">
                      <Checkbox
                        checked={item.isChecked}
                        data-testid={AppUniqueId.PAYMENT_TYPE + index}
                        onChange={e =>
                          this.onChangeInstalmentOption(
                            e.target.checked,
                            index,
                            'seasonalfee',
                            'isChecked',
                            item,
                          )
                        }
                        className="single-checkbox mt-1"
                        disabled={
                          item.paymentOptionRefId != 5 ? paymentOptionDisable : installmentDisabled
                        }
                      >
                        {item.description}
                      </Checkbox>
                      {item.paymentOptionRefId == 5 && item.isChecked == 1 && (
                        <div className="inside-container-view ml-5">
                          {this.instalmentDate()}
                          {this.instalmentUponReg('isSeasonalUponReg', isSeasonalUponReg)}
                          {this.showInstalmentDate(selectedSeasonalInstalmentDates, 'seasonalfee')}
                          {this.addInstalmentDateBtn(
                            selectedSeasonalInstalmentDates,
                            'seasonalfee',
                          )}
                        </div>
                      )}
                      {item.paymentOptionRefId == 8 && !enableOfflinePayments && (
                        <CustomToolTip placement="top">
                          <span>{AppConstants.disableOfflineMessage}</span>
                        </CustomToolTip>
                      )}
                      {item.paymentOptionRefId == 8 &&
                        item.isChecked &&
                        this.seasonalRegistrationcode(seasonalSchoolRegCode)}
                      {item.paymentOptionRefId == SeasonalPaymentOption.PaymentPlan &&
                        this.managePaymentPlan(competitionDetailData.competitionUniqueKey)}
                    </div>
                  );
                })}
              </div>
            )}
            {isIndividualPerMatch && (
              <div
                className={`inside-container-view
                  ${!this.props.isSeasonalPaymentOptionAvailable ? 'validation-border' : ''}`}
              >
                <div className="contextualHelp-RowDirection">
                  <span className="form-heading">{AppConstants.individualUserPerMatch}</span>
                  <div>
                    <CustomToolTip placement="top">
                      <span>{AppConstants.paymentSeasonalFeeMsg}</span>
                    </CustomToolTip>
                  </div>
                </div>
                {(selectedIndividualPerMatchFee || []).map((item, index) => (
                  <div key={index} className="pt-4">
                    <Checkbox
                      checked={item.isChecked}
                      onChange={e =>
                        this.onChangePaymentOptionFee(
                          e.target.checked,
                          index,
                          'individualPerMatchFee',
                          'isChecked',
                          item,
                        )
                      }
                      className="single-checkbox mt-1"
                      disabled={paymentsDisable}
                    >
                      {/* {item.description} */}
                      {AppConstants.payPerMatch}
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
            {!this.props.isSeasonalPaymentOptionAvailable && (
              <div className="validation-error">
                {ValidationConstants.pleaseSelectPaymentOption}
              </div>
            )}

            {isCasual && (
              <div
                className={`inside-container-view
                  ${!this.props.isCasualPaymentOptionAvailable ? 'validation-border' : ''}`}
              >
                <div className="contextualHelp-RowDirection">
                  <span className="form-heading">{AppConstants.singleGameFee}</span>
                  <div className="mt-n3">
                    <CustomToolTip placement="top">
                      <span>{AppConstants.paymentCausalFeeMsg}</span>
                    </CustomToolTip>
                  </div>
                </div>
                {(selectedCasualFee || []).map((item, index) => (
                  <div key={index} className="pt-4">
                    <Checkbox
                      checked={item.isChecked}
                      onChange={e =>
                        this.onChangePaymentOptionFee(
                          e.target.checked,
                          index,
                          'casualfee',
                          'isChecked',
                          item,
                        )
                      }
                      className="single-checkbox mt-1"
                      disabled={paymentsDisable}
                    >
                      {item.description}
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
            {!this.props.isCasualPaymentOptionAvailable && (
              <div className="validation-error">
                {ValidationConstants.pleaseSelectPaymentOption}
              </div>
            )}
            {isTeamSeasonal && (
              <div
                className={`inside-container-view
                  ${!this.props.isSeasonalTeamPaymentOptionAvailable ? 'validation-border' : ''}`}
              >
                <div className="contextualHelp-RowDirection">
                  <span className="form-heading">{AppConstants.teamSeasonalFee}</span>
                  <div>
                    <CustomToolTip placement="top">
                      <span>{AppConstants.paymentSeasonalFeeMsg}</span>
                    </CustomToolTip>
                  </div>
                </div>
                {(selectedSeasonalTeamFee || []).map((item, index) => {
                  if (
                    isAffiliate &&
                    isAffiliateSeasonTeamOptionExist &&
                    item.paymentOptionRefId == SeasonalPaymentOption.Instalments
                  ) {
                    if (!item.organisationId || item.organisationId != currentOrganisationId) {
                      //skip organiser option
                      return null;
                    }
                  }
                  let paymentOptionDisable = paymentsDisable;
                  let hasInstalment = false;
                  if (paymentOptions) {
                    hasInstalment = paymentOptions.some(
                      x =>
                        x.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
                        x.isChecked &&
                        x.feesTypeRefId == FeesType.TeamSeasonal,
                    );
                  }
                  if (item.paymentOptionRefId == SeasonalPaymentOption.School) {
                    paymentOptionDisable = offlineDisable;
                  } else if (
                    item.paymentOptionRefId == SeasonalPaymentOption.Instalments &&
                    hasInstalment
                  ) {
                    paymentOptionDisable = false;
                  }
                  return (
                    <div className="pt-4" key={index}>
                      <Checkbox
                        checked={item.isChecked}
                        onChange={e =>
                          this.onChangeInstalmentOption(
                            e.target.checked,
                            index,
                            'seasonalteamfee',
                            'isChecked',
                            item,
                          )
                        }
                        className="single-checkbox mt-1"
                        disabled={paymentOptionDisable}
                      >
                        {item.description}
                      </Checkbox>
                      {item.paymentOptionRefId == 5 && item.isChecked == 1 && (
                        <div className="inside-container-view ml-5">
                          {this.instalmentDate()}
                          {this.instalmentUponReg('isTeamSeasonalUponReg', isTeamSeasonalUponReg)}
                          {this.showInstalmentDate(
                            selectedTeamSeasonalInstalmentDates,
                            'seasonalteamfee',
                          )}
                          {this.addInstalmentDateBtn(
                            selectedTeamSeasonalInstalmentDates,
                            'seasonalteamfee',
                          )}
                        </div>
                      )}
                      {item.paymentOptionRefId == 8 && !enableOfflinePayments && (
                        <CustomToolTip placement="top">
                          <span>{AppConstants.disableOfflineMessage}</span>
                        </CustomToolTip>
                      )}
                      {item.paymentOptionRefId == 8 &&
                        item.isChecked &&
                        this.teamSeasonalRegistrationcode(teamSeasonalSchoolRegCode)}
                    </div>
                  );
                })}
              </div>
            )}
            {!this.props.isSeasonalTeamPaymentOptionAvailable && (
              <div className="validation-error">
                {ValidationConstants.pleaseSelectPaymentOption}
              </div>
            )}
            {isTeamCasual && (
              <div
                className={`inside-container-view ${
                  !this.props.isCasualTeamPaymentOptionAvailable ? 'validation-border' : ''
                }`}
              >
                <div className="contextualHelp-RowDirection">
                  <span className="form-heading">{AppConstants.teamFeePerMatch}</span>
                  <div className="mt-n3">
                    <CustomToolTip placement="top">
                      <span>{AppConstants.paymentCausalFeeMsg}</span>
                    </CustomToolTip>
                  </div>
                </div>
                {(selectedCasualTeamFee || []).map((item, index) => (
                  <div key={index} className="pt-4">
                    <Checkbox
                      checked={item.isChecked}
                      data-testid={AppUniqueId.TEAM_FEE_PAY_PER_MATCH}
                      onChange={e =>
                        this.onChangePaymentOptionFee(
                          e.target.checked,
                          index,
                          'casualteamfee',
                          'isChecked',
                          item,
                        )
                      }
                      className="single-checkbox mt-1"
                      disabled={paymentsDisable}
                    >
                      {/* {item.description} */}
                      {AppConstants.payPerMatch}
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
            {!this.props.isCasualTeamPaymentOptionAvailable && (
              <div className="validation-error">
                {ValidationConstants.pleaseSelectPaymentOption}
              </div>
            )}
            <div />
          </div>
        </div>
      </>
    );
  };
  render() {
    return this.paymentOptionsView();
  }
}

export default CompetitionPaymentTab;

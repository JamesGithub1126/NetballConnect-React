import React, { Component, createRef } from 'react';
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
import AppUniqueId from 'themes/appUniqueId';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import {
  captializedString,
  isImageFormatValid,
  isImageSizeValid,
  isArrayNotEmpty,
} from '../../util/helpers';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';

import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';

import {
  getAllCompetitionFeesDeatilsAction,
  saveCompetitionFeesDetailsAction,
  saveCompetitionFeesMembershipTabAction,
  getDefaultCompFeesMembershipProductTabAction,
  membershipProductSelectedAction,
  membershipTypeSelectedAction,
  saveCompetitionFeesDivisionAction,
  divisionTableDataOnchangeAction,
  addRemoveDivisionAction,
  updatePaymentOption,
  updatePaymentFeeOption,
  paymentFeeDeafault,
  paymentSeasonalFee,
  paymentPerMatch,
  instalmentDateAction,
  competitionPaymentApi,
  addRemoveCompFeeDiscountAction,
  add_editcompetitionFeeDeatils,
  checkUncheckcompetitionFeeSction,
  add_editFee_deatialsScetion,
  saveCompetitionFeeSection,
  updatedDiscountDataAction,
  updatedDiscountMemberPrd,
  regSaveCompetitionFeeDiscountAction,
  competitionDiscountTypesAction,
  regCompetitionListDeleteAction,
  getDefaultCharity,
  getDefaultCompFeesLogoAction,
  clearCompReducerDataAction,
  onInviteesSearchAction,
  paymentMethodsDefaultAction,
  add_inviteesToCompetitionFeeDetails,
  cancel_add_inviteesToCompetitionFeeDetails,
  saveAddedInviteesToCompetitionFeesDetails,
} from '../../store/actions/registrationAction/competitionFeeAction';
import {
  competitionFeeInit,
  getVenuesTypeAction,
  clearFilter,
  searchVenueList,
  getCommonDiscountTypeTypeAction,
  getOnlyYearListAction,
} from '../../store/actions/appAction';
import {
  getAffiliateOurOrganisationIdAction,
  getAffiliateToOrganisationAction,
} from '../../store/actions/userAction/userAction';

import history from '../../util/history';

import {
  checkStripeCustomerAccount,
  getCompetitionSeasonFee,
  isMembershipConcurrencyRuleEnabled,
} from '../../util/registrationHelper';
import {
  RegistrationInviteesName,
  RegistrationInvitees,
  MembershipProductStatusEnum,
  TeamRegistrationChargeType,
  CompetitionTypeDiscountType,
  SeasonalPaymentOption,
  IndividualChargeType,
} from '../../enums/registrationEnums';
import TutorialConstants from 'themes/tutorialConstants';
import { isCompetitionOrganiser } from '../../util/competitionHelper';
import ValidationConstants from '../../themes/validationConstant';
import { NavLink } from 'react-router-dom';
import Loader from '../../customComponents/loader';
import {
  /* getUserId, */ getOrganisationData,
  getGlobalYear,
  setGlobalYear,
} from '../../util/sessionStorage';

import CustomToolTip from 'react-png-tooltip';
import { registrationRestrictionTypeAction } from '../../store/actions/commonAction/commonAction';
import { fixtureTemplateRoundsAction } from '../../store/actions/competitionModuleAction/competitionDashboardAction';
import { getOrganisationSettingsAction } from 'store/actions/homeAction/homeAction';
import { getCurrentYear } from 'util/permissions';
import {
  checkHasNegativeFee,
  updateTeamFeeForPerDvision,
  updateAllTeamFeeForPerDvision,
  updateSeasonFeeFields,
  updateCasualFeeFields,
  updateTeamSeasonFeeFields,
  updateCasualFeeForAllDvision,
  updateTeamFeeForAllDvision,
  updateCasualFeeForPerDvision,
  updateTeamCasualFeeForPerDvision,
  updateTeamCasualFeeFields,
  updateTeamCasualFeeForAllDvision,
} from 'util/competitionFeeHelper';
import CompetitionFeeTab from './competitionfee/competitionFeeTab';
import AddInvitesModalView from './competitionfee/AddInvitesModalView';
import {
  checkIsCasual,
  checkIsSeasonal,
  checkIsTeamCasual,
  checkIsTeamSeasonal,
} from 'util/competitionFeeHelper';
import CompetitionPaymentTab from './competitionfee/paymentTab';
import ReactPlayer from 'react-player';
import { CompetitionDiscountType, DiscountType } from 'util/enums';
import InputWithHead from '../../customComponents/InputWithHead';
const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

const restrictionProductTypesTable = [
  {
    title: AppConstants.membershipTypeName,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
  },
  {
    title: AppConstants.dobFrom,
    dataIndex: 'fromDate',
    key: 'fromDate',
    width: '25%',
  },
  {
    title: AppConstants.dobTo,
    dataIndex: 'toDate',
    key: 'toDate',
    width: '25%',
  },
];

const permissionObject = {
  compDetailDisable: false,
  regInviteesDisable: false,
  membershipDisable: false,
  divisionsDisable: false,
  feesTableDisable: false,
  paymentsDisable: false,
  discountsDisable: false,
  allDisable: false,
  isPublished: false,
};

const TabKey = {
  Detail: '1',
  Membership: '2',
  Division: '3',
  Fee: '4',
  Payment: '5',
  Discount: '6',
};

class RegistrationCompetitionFee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onYearLoad: false,
      value: 'NETSETGO',
      division: 'Division',
      discountCode: false,
      membershipProduct: ['Player', 'NetSetGo', 'Walking Netball', 'Fast Five'],
      membershipProductSelected: [],
      SeasonalFeeSelected: false,
      casualfeeSelected: false,
      walkingDivision: 'allDivisions',
      fastDivison: 'allDivisions',
      netSetGoDivision: 'allDivisions',
      playerDivision: 'allDivisions',
      netSetGO_SeasonalFee: false,
      walking_SeasonalFee: false,
      fast_SeasonalFee: false,
      netSetGO_casualfee: false,
      walking_casualfee: false,
      fast_casualfee: false,
      competitionTabKey: TabKey.Detail,
      profileImage: null,
      image: null,
      loading: false,
      getDataLoading: false,
      discountMembershipTypeData: [],
      statusRefId: 1,
      buttonPressed: 'next',
      logoIsDefault: false,
      logoSetDefault: false,
      logoUrl: '',
      isSetDefaul: false,
      competitionIsUsed: false,
      isCreatorEdit: false, /// ///// user is owner of the competition than isCreatorEdit will be false
      organisationTypeRefId: 0,
      isPublished: false,
      isRegClosed: false,
      tooltipVisibleDelete: false,
      tooltipVisibleDraft: false,
      tooltipVisiblePublish: false,
      roundsArray: [
        { id: 3, value: 3 },
        { id: 4, value: 4 },
        { id: 5, value: 5 },
        { id: 6, value: 6 },
        { id: 7, value: 7 },
        { id: 8, value: 8 },
        { id: 9, value: 9 },
        { id: 10, value: 10 },
        { id: 11, value: 11 },
        { id: 12, value: 12 },
        { id: 13, value: 13 },
        { id: 14, value: 14 },
        { id: 15, value: 15 },
        { id: 16, value: 16 },
        { id: 17, value: 17 },
        { id: 18, value: 18 },
      ],
      permissionState: permissionObject,
      divisionTable: [
        {
          title: AppConstants.divisionName,
          dataIndex: 'divisionName',
          key: 'divisionName',
          render: (divisionName, record, index) => {
            return (
              <Form.Item
                name={`divisionName${record.parentIndex}${index}`}
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.divisionName,
                  },
                ]}
              >
                <Popover content={divisionName}>
                  <div>
                    <Input
                      className="input-inside-table-fees"
                      required="required-field pt-0 pb-0"
                      value={divisionName}
                      data-testid={AppUniqueId.DIVISION_NAME.concat(index)}
                      onChange={e =>
                        this.divisionTableDataOnchange(
                          e.target.value,
                          record,
                          index,
                          'divisionName',
                        )
                      }
                      disabled={
                        !this.state.isCreatorEdit
                          ? false
                          : this.state.permissionState.divisionsDisable
                      }
                    />
                  </div>
                </Popover>
              </Form.Item>
            );
          },
        },
        {
          title: AppConstants.genderRestriction,
          dataIndex: 'genderRestriction',
          key: 'genderRestriction',
          filterDropdown: true,
          filterIcon: () => {
            return (
              <div className="mt-2">
                <CustomToolTip placement="bottom">
                  <span>{AppConstants.genderRestrictionMsg}</span>
                </CustomToolTip>
              </div>
            );
          },
          render: (genderRestriction, record, index) => (
            <Checkbox
              className="single-checkbox mt-1"
              disabled={
                !this.state.isCreatorEdit ? false : this.state.permissionState.divisionsDisable
              }
              checked={genderRestriction}
              onChange={e =>
                this.divisionTableDataOnchange(e.target.checked, record, index, 'genderRestriction')
              }
            />
          ),
        },
        {
          dataIndex: 'genderRefId',
          key: 'genderRefId',
          // width:  ? "20%" : null,
          render: (genderRefId, record, index) => {
            // const { getFieldDecorator } = this.formRef.current;
            return (
              record.genderRestriction && (
                <Form.Item
                  name={`genderRefId${record.parentIndex}${index}`}
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.genderRestriction,
                    },
                  ]}
                >
                  <Select
                    className="division-age-select w-100"
                    style={{ minWidth: 120 }}
                    onChange={genderRefId =>
                      this.divisionTableDataOnchange(genderRefId, record, index, 'genderRefId')
                    }
                    value={genderRefId}
                    placeholder="Select"
                    disabled={
                      !this.state.isCreatorEdit
                        ? false
                        : this.state.permissionState.divisionsDisable
                    }
                  >
                    {this.props.commonReducerState.genderDataEnum.map(item => (
                      <Option key={'gender_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            );
          },
        },
        {
          title: AppConstants.ageRestrictions,
          dataIndex: 'ageRestriction',
          key: 'ageRestriction',
          filterDropdown: true,
          filterIcon: () => {
            return (
              <div className="mt-2 ">
                <CustomToolTip placement="bottom">
                  <span>{AppConstants.ageRestrictionMsg}</span>
                </CustomToolTip>
              </div>
            );
          },
          render: (ageRestriction, record, index) => (
            <Checkbox
              className="single-checkbox mt-1"
              checked={ageRestriction}
              onChange={e =>
                this.divisionTableDataOnchange(e.target.checked, record, index, 'ageRestriction')
              }
              disabled={
                !this.state.isCreatorEdit ? false : this.state.permissionState.divisionsDisable
              }
            />
          ),
        },
        {
          title: AppConstants.dobFrom,
          dataIndex: 'fromDate',
          key: 'fromDate',
          width: '25%',
          render: (fromDate, record, index) => {
            // const { getFieldDecorator } = this.formRef.current;
            return (
              <Form.Item
                name={`fromDate${record.parentIndex}${index}`}
                rules={[
                  {
                    required: record.ageRestriction,
                    message: ValidationConstants.pleaseSelectDOBFrom,
                  },
                ]}
              >
                <DatePicker
                  size="default"
                  placeholder="dd-mm-yyyy"
                  className="comp-venue-time-datepicker w-100"
                  style={{ minWidth: 135 }}
                  onChange={date => {
                    date !== null &&
                      this.divisionTableDataOnchange(
                        moment(date).format('YYYY-MM-DD'),
                        record,
                        index,
                        'fromDate',
                      );
                  }}
                  format="DD-MM-YYYY"
                  showTime={false}
                  disabled={
                    !record.ageRestriction ||
                    (!this.state.isCreatorEdit
                      ? false
                      : this.state.permissionState.divisionsDisable)
                  }
                  value={fromDate !== null && moment(fromDate)}
                  disabledDate={d => !d || d.isSameOrAfter(record.toDate)}
                />
              </Form.Item>
            );
          },
        },
        {
          title: AppConstants.dobTo,
          dataIndex: 'toDate',
          width: '25%',
          key: 'toDate',
          render: (toDate, record, index) => {
            // const { getFieldDecorator } = this.formRef.current;
            return (
              <Form.Item
                name={`toDate${record.parentIndex}${index}`}
                rules={[
                  {
                    required: record.ageRestriction,
                    message: ValidationConstants.PleaseSelectDOBTo,
                  },
                ]}
              >
                <DatePicker
                  size="default"
                  placeholder="dd-mm-yyyy"
                  className="comp-venue-time-datepicker w-100"
                  style={{ minWidth: 135 }}
                  onChange={date => {
                    date != null &&
                      this.divisionTableDataOnchange(
                        moment(date).format('YYYY-MM-DD'),
                        record,
                        index,
                        'toDate',
                      );
                  }}
                  format="DD-MM-YYYY"
                  showTime={false}
                  disabled={
                    !record.ageRestriction ||
                    (!this.state.isCreatorEdit
                      ? false
                      : this.state.permissionState.divisionsDisable)
                  }
                  value={toDate !== null && moment(toDate)}
                  // disabledDate={d => !d || d.isSameOrBefore(record.fromDate)}
                  disabledDate={d => moment(record.fromDate).isSameOrAfter(d, 'day')}
                />
              </Form.Item>
            );
          },
        },
        {
          title: '',
          dataIndex: 'clear',
          key: 'clear',
          render: (clear, record, index) => (
            <span
              className="d-flex justify-content-center w-100"
              role="button"
              style={{ cursor: 'pointer' }}
            >
              <img
                className="dot-image"
                src={AppImages.redCross}
                alt=""
                width="16"
                height="16"
                onClick={() =>
                  !this.state.permissionState.divisionsDisable
                    ? this.addRemoveDivision(index, record, 'remove')
                    : null
                }
              />
            </span>
          ),
        },
      ],
      divisionState: false,
      affiliateOrgId: null,
      currentOrganisationId: 0,
      heroImage: null,
      yearRefId: this.props.location.state ? this.props.location.state.yearRefId : null,
      isEdit: props.location.state ? props.location.state.isEdit : false,
      clickedOnTab: false,
      isFamilyDiscountType: false,
      isSeasonalPaymentOptionAvailable: true,
      isCasualPaymentOptionAvailable: true,
      isSeasonalTeamPaymentOptionAvailable: true,
      isCasualTeamPaymentOptionAvailable: true,
      isAddInvitesModalVisible: false,
      addedInviteesArray: [],
      openShowTutorial: false,
      showMultiDivisionRegistration: true,
      maximumPlayers: null,
      zeroErrorMsg: {
        view: false,
        message: '',
      },
    };

    let competitionId = null;
    competitionId = this.props.location.state ? this.props.location.state.id : null;
    competitionId !== null && this.props.clearCompReducerDataAction('all');

    this.formRef = createRef();
    // this.tableReference = React.createRef();
  }

  componentDidUpdate(prevProps) {
    let competitionFeesState = this.props.competitionFeesState;
    if (competitionFeesState.onLoad === false && this.state.loading === true) {
      this.setState({ loading: false });
      if (!competitionFeesState.error) {
        window.scrollTo(0, 0);
        let nextTabKey = JSON.stringify(JSON.parse(this.state.competitionTabKey) + 1);
        if (this.state.clickedOnTab) {
          nextTabKey = this.state.competitionTabKey;
        }
        let competitionTabKey = nextTabKey;
        this.setState({
          // loading: false,
          competitionTabKey,
          logoSetDefault: false,
          image: null,
        });
      }
      let shouldRedirect = !(competitionFeesState.error?.result?.data?.errorCode == 7);
      if (
        (this.state.buttonPressed === 'save' ||
          this.state.buttonPressed === 'publish' ||
          this.state.buttonPressed === 'delete') &&
        shouldRedirect
      ) {
        history.push('/registrationCompetitionList');
      }
      if (this.state.buttonPressed === 'register') {
        this.navigateToRegistrationForm();
      }
    }

    if (prevProps.competitionFeesState !== competitionFeesState) {
      if (competitionFeesState.getCompAllDataOnLoad === false && this.state.getDataLoading) {
        let registrationInviteesRefId = 7;
        let inviteeArray = competitionFeesState.competitionDetailData.invitees;
        if (isArrayNotEmpty(inviteeArray)) {
          let index = inviteeArray.findIndex(
            x => x.registrationInviteesRefId == 7 || x.registrationInviteesRefId == 8,
          );
          if (index > -1) {
            registrationInviteesRefId = inviteeArray[index].registrationInviteesRefId;
          }
        }
        this.callAnyorgSearchApi(registrationInviteesRefId);
        let isPublished = competitionFeesState.competitionDetailData.statusRefId == 2;

        let registrationCloseDate =
          competitionFeesState.competitionDetailData.registrationCloseDate &&
          moment(competitionFeesState.competitionDetailData.registrationCloseDate);
        let isRegClosed = registrationCloseDate
          ? !registrationCloseDate.isSameOrAfter(moment())
          : false;

        let creatorId = competitionFeesState.competitionCreator;
        let orgData = getOrganisationData() ? getOrganisationData() : null;
        let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
        // let userId = getUserId();
        let isCreatorEdit = !(creatorId == organisationUniqueKey);

        this.setPermissionFields(isPublished, isRegClosed, isCreatorEdit);
        let competitionTabKey = isCreatorEdit ? TabKey.Fee : this.state.competitionTabKey;
        this.setState({
          getDataLoading: false,
          profileImage: competitionFeesState.competitionDetailData.competitionLogoUrl,
          competitionIsUsed: competitionFeesState.competitionDetailData.isUsed,
          isPublished,
          isRegClosed,
          isCreatorEdit,
          competitionTabKey,
        });
        this.setDetailsFieldValue();
        this.checkShowMultiDivisionRegistration();
      }

      // If edit mode and the competition detail data is loaded then we must update yearRefId.
      if (
        prevProps.competitionFeesState.competitionDetailData.loaded !==
          competitionFeesState.competitionDetailData.loaded &&
        !!competitionFeesState.competitionDetailData.loaded
      ) {
        const { yearRefId } = competitionFeesState.competitionDetailData;
        if (this.state.yearRefId !== yearRefId) {
          // We must get competition fees membership product again.
          this.getCompFeesMembershipProduct(yearRefId);

          this.setState({ yearRefId });
          this.setDetailsFieldValue(yearRefId);
          setGlobalYear(yearRefId);
        }
      }
    }

    if (competitionFeesState.onLoad === false && this.state.divisionState === true) {
      setTimeout(() => {
        this.formRef.current && this.setDetailsFieldValue();
      }, 100);
      this.setState({ divisionState: false });
    }
    if (this.state.onYearLoad == true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        let mainYearRefId = this.state.yearRefId;
        if (!mainYearRefId) {
          mainYearRefId = getGlobalYear()
            ? getGlobalYear()
            : getCurrentYear(this.props.appState.yearList);
          mainYearRefId = JSON.parse(mainYearRefId);
        }

        this.props.add_editcompetitionFeeDeatils(mainYearRefId, 'yearRefId');

        this.getMembershipDetails(mainYearRefId);

        this.setState({
          onYearLoad: false,
          yearRefId: mainYearRefId,
        });

        this.setDetailsFieldValue(mainYearRefId);
      }
    }
    if (this.props.homeDashboardState.onLoad == false && prevProps.homeDashboardState.onLoad) {
      this.checkShowMultiDivisionRegistration();
    }
  }
  checkShowMultiDivisionRegistration = () => {
    let organisationSettings = this.props.homeDashboardState.organisationSettings;
    let membershipPrdArr = [];
    let selectedProducts = this.props.competitionFeesState.competitionMembershipProductData;
    if (selectedProducts && selectedProducts.membershipProducts) {
      membershipPrdArr = selectedProducts.membershipProducts;
    }

    if (
      isMembershipConcurrencyRuleEnabled &&
      organisationSettings &&
      organisationSettings.concurrentMembershipProductCategoryRefIds &&
      organisationSettings.concurrentMembershipProductCategoryRefIds.length > 0 &&
      membershipPrdArr.length > 0 &&
      membershipPrdArr.some(x =>
        organisationSettings.concurrentMembershipProductCategoryRefIds.includes(
          x.membershipProductCategoryRefId,
        ),
      )
    ) {
      this.setState({ showMultiDivisionRegistration: false });
    }
  };

  callAnyorgSearchApi = registrationInviteesRefId => {
    // if (registrationInviteesRefId == 7) {
    this.props.onInviteesSearchAction('', 3);
    // }
    // if (registrationInviteesRefId == 8) {
    this.props.onInviteesSearchAction('', 4);
    // }
  };

  /////navigate to RegistrationForm  after publishing the competition
  navigateToRegistrationForm = () => {
    let competitionFeesState = this.props.competitionFeesState;
    let competitionDetailData = competitionFeesState.competitionDetailData;
    history.push('/registrationForm', {
      id: competitionDetailData.competitionUniqueKey,
      year: competitionDetailData.yearRefId,
      orgRegId: competitionFeesState.orgRegistrationId,
      compCloseDate: competitionDetailData.registrationCloseDate,
      compName: competitionDetailData.competitionName,
    });
  };

  ////disable or enable particular fields
  setPermissionFields = (isPublished, isRegClosed, isCreatorEdit) => {
    if (isPublished) {
      if (isRegClosed) {
        let permissionObject = {
          compDetailDisable: true,
          regInviteesDisable: true,
          membershipDisable: true,
          divisionsDisable: true,
          feesTableDisable: !isCreatorEdit ? false : true,
          paymentsDisable: true,
          discountsDisable: true,

          voucherDisable: true,

          allDisable: false,
          isPublished: true,
          compDatesDisable: !isCreatorEdit ? false : true,
        };
        this.setState({ permissionState: permissionObject });
        return;
      }
      if (isCreatorEdit) {
        let permissionObject = this.getAffiliatePermission();
        this.setState({ permissionState: permissionObject });
      } else {
        let permissionObject = {
          compDetailDisable: false,
          regInviteesDisable: true,
          membershipDisable: true,
          divisionsDisable: true,
          feesTableDisable: true,
          paymentsDisable: false,
          discountsDisable: false,

          voucherDisable: false,

          allDisable: false,
          isPublished: true,
          compDatesDisable: false,
        };
        this.setState({ permissionState: permissionObject });
      }
    } else {
      let permissionObject = {
        compDetailDisable: false,
        regInviteesDisable: false,
        membershipDisable: false,
        divisionsDisable: false,
        feesTableDisable: false,
        paymentsDisable: false,
        discountsDisable: false,

        voucherDisable: false,

        allDisable: false,
        isPublished: false,
        compDatesDisable: false,
      };
      if (isCreatorEdit) {
        permissionObject = this.getAffiliatePermission();
      }
      this.setState({ permissionState: permissionObject });
    }
  };
  getAffiliatePermission() {
    let permissionObject = {
      compDetailDisable: true,
      regInviteesDisable: true,
      membershipDisable: true,
      divisionsDisable: true,
      feesTableDisable: true,
      paymentsDisable: true,
      discountsDisable: false,

      voucherDisable: true,

      allDisable: false,
      isPublished: true,
      compDatesDisable: true,
    };
    return permissionObject;
  }

  componentDidMount() {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let competitionId = this.props.location.state ? this.props.location.state.id : null;
    let affiliateOrgId = this.props.location.state
      ? this.props.location.state.affiliateOrgId
      : null;
    let currentOrganisationId = orgData ? orgData.organisationId : 0;
    this.setState({
      organisationTypeRefId: orgData.organisationTypeRefId,
      affiliateOrgId,
      currentOrganisationId: currentOrganisationId,
    });
    this.apiCalls(competitionId, orgData.organisationUniqueKey, affiliateOrgId);
    this.setDetailsFieldValue();
    // let checkVenueScreen = this.props.location.state && this.props.location.state.venueScreen
    //     ? this.props.location.state.venueScreen
    //     : null;
    // setTimeout(() => {
    //     window.scrollTo(this.tableReference.offsetBottom,0);
    // },300)
  }

  ////all the api calls
  apiCalls = (competitionId, organisationId, affiliateOrgId) => {
    // this.props.getAffiliateToOrganisationAction(organisationId);
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    this.setState({ onYearLoad: true });
    this.props.getDefaultCompFeesLogoAction();
    this.props.competitionDiscountTypesAction();
    this.props.competitionFeeInit();
    this.props.paymentFeeDeafault();
    this.props.paymentSeasonalFee();
    this.props.paymentPerMatch();
    this.props.getCommonDiscountTypeTypeAction();
    this.props.getVenuesTypeAction('all');
    this.props.registrationRestrictionTypeAction();
    this.props.fixtureTemplateRoundsAction();
    this.props.paymentMethodsDefaultAction();
    this.props.getAffiliateOurOrganisationIdAction(organisationId);
    this.props.getOrganisationSettingsAction({ organisationUniqueKey: organisationId });

    // if (competitionId !== null) {
    //     let hasRegistration = 1;
    //     this.props.getAllCompetitionFeesDeatilsAction(
    //         competitionId,
    //         hasRegistration,
    //         "REG",
    //         affiliateOrgId,
    //         this.state.yearRefId
    //     );
    //     this.setState({ getDataLoading: true });
    // } else {
    //     let hasRegistration = 1;
    //     this.props.getDefaultCompFeesMembershipProductTabAction(hasRegistration);
    //     this.props.getDefaultCharity();
    // }
  };

  setYear = e => {
    setGlobalYear(e);
    this.setState({ yearRefId: e });
    this.getMembershipDetails(e);
  };

  getMembershipDetails = yearRefId => {
    let affiliateOrgId = this.props.location.state
      ? this.props.location.state.affiliateOrgId
      : null;
    let competitionId = this.props.location.state ? this.props.location.state.id : null;
    if (competitionId !== null) {
      let hasRegistration = 1;
      this.props.getAllCompetitionFeesDeatilsAction(
        competitionId,
        hasRegistration,
        'REG',
        affiliateOrgId,
        yearRefId,
        this.state.isEdit,
      );
      this.setState({ getDataLoading: true });
    } else {
      this.getCompFeesMembershipProduct(yearRefId);
      this.props.getDefaultCharity();
    }
  };

  getCompFeesMembershipProduct(yearRefId) {
    const hasRegistration = 1;
    this.props.getDefaultCompFeesMembershipProductTabAction(hasRegistration, yearRefId);
  }

  // for  save  payment
  paymentApiCall = (competitionId, fromValidation) => {
    let paymentDataArr = this.props.competitionFeesState.competitionPaymentsData;
    let selectedCasualPaymentArr = this.props.competitionFeesState.selectedCasualFee;
    let SelectedSeasonalPaymentArr = this.props.competitionFeesState.SelectedSeasonalFee;
    let selectedSeasonalTeamPaymentArr = this.props.competitionFeesState.selectedSeasonalTeamFee;
    let selectedCasualTeamPaymentArr = this.props.competitionFeesState.selectedCasualTeamFee;
    let selectedPaymentMethods = this.props.competitionFeesState.selectedPaymentMethods;
    let selectedIndividualPerMatchFee =
      this.props.competitionFeesState.selectedIndividualPerMatchFee;
    let feeDetails = this.props.competitionFeesState.competitionFeesData;

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
    selectedCasualPaymentArr = selectedCasualPaymentArr.filter(x => x.isChecked && isCasual);
    let isAffiliate = this.state.isCreatorEdit;
    SelectedSeasonalPaymentArr = SelectedSeasonalPaymentArr.filter(
      x =>
        (x.isChecked ||
          (isAffiliate && x.paymentOptionRefId == SeasonalPaymentOption.Instalments)) &&
        isIndividualFullSeason,
    );
    selectedIndividualPerMatchFee = selectedIndividualPerMatchFee.filter(
      x => x.isChecked && isIndividualPerMatch,
    );
    selectedSeasonalTeamPaymentArr = selectedSeasonalTeamPaymentArr.filter(
      x =>
        (x.isChecked ||
          (isAffiliate && x.paymentOptionRefId == SeasonalPaymentOption.Instalments)) &&
        isTeamSeasonal,
    );
    selectedCasualTeamPaymentArr = selectedCasualTeamPaymentArr.filter(
      x => x.isChecked && isTeamCasual,
    );
    selectedPaymentMethods = selectedPaymentMethods.filter(x => x.isChecked);

    let selectedSeasonalInstalmentDates =
      this.props.competitionFeesState.selectedSeasonalInstalmentDates;
    let selectedTeamSeasonalInstalmentDates =
      this.props.competitionFeesState.selectedTeamSeasonalInstalmentDates;

    let paymentOptionData = selectedCasualPaymentArr.concat(
      SelectedSeasonalPaymentArr,
      selectedSeasonalTeamPaymentArr,
      selectedCasualTeamPaymentArr,
      selectedIndividualPerMatchFee,
    );
    paymentDataArr.paymentOptions = paymentOptionData;
    paymentDataArr.paymentMethods = selectedPaymentMethods;
    let charityTitle = this.props.competitionFeesState.charityTitle;
    let charityDescription = this.props.competitionFeesState.charityDescription;
    let postCharityRoundUpData = JSON.parse(JSON.stringify(paymentDataArr.charityRoundUp));
    postCharityRoundUpData.forEach(item => {
      item.charityRoundUpName = charityTitle;
      item.charityRoundUpDescription = charityDescription;
    });
    paymentDataArr.charityRoundUp = postCharityRoundUpData;
    paymentDataArr.instalmentDates = selectedSeasonalInstalmentDates.concat(
      selectedTeamSeasonalInstalmentDates,
    );
    let isSeasonalUponReg =
      this.props.competitionFeesState.competitionDetailData['isSeasonalUponReg'];
    let isTeamSeasonalUponReg =
      this.props.competitionFeesState.competitionDetailData['isTeamSeasonalUponReg'];
    let teamSeasonalSchoolRegCode =
      this.props.competitionFeesState.competitionDetailData['teamSeasonalSchoolRegCode'];
    let seasonalSchoolRegCode =
      this.props.competitionFeesState.competitionDetailData['seasonalSchoolRegCode'];
    paymentDataArr['isSeasonalUponReg'] =
      isSeasonalUponReg != undefined ? isSeasonalUponReg : false;
    paymentDataArr['isTeamSeasonalUponReg'] =
      isTeamSeasonalUponReg != undefined ? isTeamSeasonalUponReg : false;
    paymentDataArr['teamSeasonalSchoolRegCode'] =
      teamSeasonalSchoolRegCode != undefined ? teamSeasonalSchoolRegCode : null;
    paymentDataArr['seasonalSchoolRegCode'] =
      seasonalSchoolRegCode != undefined ? seasonalSchoolRegCode : null;

    // selectedSeasonalFeeKey

    if (
      !selectedPaymentMethods.find(
        x => x.paymentMethodRefId == 1 || x.paymentMethodRefId == 2 || x.paymentMethodRefId == 3,
      )
    ) {
      message.error(ValidationConstants.pleaseSelectPaymentMethods);
      if (fromValidation == 'FromValidation') {
        return true;
      }
      return;
    }

    if (isIndividualFullSeason && SelectedSeasonalPaymentArr.length === 0) {
      this.setState({ isSeasonalPaymentOptionAvailable: false });
    } else {
      this.setState({ isSeasonalPaymentOptionAvailable: true });
    }
    if (isIndividualPerMatch && selectedIndividualPerMatchFee.length == 0) {
      this.setState({ isSeasonalPaymentOptionAvailable: false });
    } else {
      this.setState({ isSeasonalPaymentOptionAvailable: true });
    }
    if (isCasual && selectedCasualPaymentArr.length === 0) {
      this.setState({ isCasualPaymentOptionAvailable: false });
    } else {
      this.setState({ isCasualPaymentOptionAvailable: true });
    }

    if (isTeamSeasonal && selectedSeasonalTeamPaymentArr.length === 0) {
      this.setState({ isSeasonalTeamPaymentOptionAvailable: false });
    } else {
      this.setState({ isSeasonalTeamPaymentOptionAvailable: true });
    }

    if (isTeamCasual && selectedCasualTeamPaymentArr.length === 0) {
      this.setState({ isCasualTeamPaymentOptionAvailable: false });
    } else {
      this.setState({ isCasualTeamPaymentOptionAvailable: true });
    }

    if (SelectedSeasonalPaymentArr.find(x => x.paymentOptionRefId == 5 && x.isChecked == 1)) {
      if (selectedSeasonalInstalmentDates.length === 0) {
        message.error(ValidationConstants.pleaseProvideInstalmentDate);
        if (fromValidation == 'FromValidation') {
          return true;
        }
        return;
      } else if (selectedSeasonalInstalmentDates.length > 0) {
        let instalmentDate = selectedSeasonalInstalmentDates.find(x => x.instalmentDate == '');
        if (instalmentDate) {
          message.error(ValidationConstants.pleaseProvideInstalmentDate);
          if (fromValidation == 'FromValidation') {
            return true;
          }
          return;
        }
      }
      if (!isSeasonalUponReg && isSeasonal) {
        for (let feeDetail of feeDetails) {
          let feeData =
            feeDetail.isAllType === 'allDivisions'
              ? feeDetail.seasonal.allType
              : feeDetail.seasonal.perType;
          if (feeData) {
            let noNominationFee = feeData.some(x => x.isPlayer == 1 && !x.nominationFees);
            if (noNominationFee) {
              this.state.requireNominationForUponRegError = true;
              message.error(ValidationConstants.pleaseEnterNominationFeeForInstalment);
              if (fromValidation == 'FromValidation') {
                return true;
              }
              return;
            }
          }
        }
      }
    }
    if (SelectedSeasonalPaymentArr.find(x => x.paymentOptionRefId == 8)) {
      if (paymentDataArr.seasonalSchoolRegCode.length === 0) {
        message.error(ValidationConstants.pleaseFillRegistration);
        if (fromValidation == 'FromValidation') {
          return true;
        }
        this.setState({ loading: false });
        return;
      }
    }

    // selectedSeasonalTeamFeeKey

    if (selectedSeasonalTeamPaymentArr.find(x => x.paymentOptionRefId == 5 && x.isChecked == 1)) {
      if (selectedTeamSeasonalInstalmentDates.length === 0) {
        message.error(ValidationConstants.pleaseProvideInstalmentDate);
        if (fromValidation == 'FromValidation') {
          return true;
        }
        return;
      } else if (selectedTeamSeasonalInstalmentDates.length > 0) {
        let instalmentDate = selectedTeamSeasonalInstalmentDates.find(x => x.instalmentDate == '');
        if (instalmentDate) {
          message.error(ValidationConstants.pleaseProvideInstalmentDate);
          if (fromValidation == 'FromValidation') {
            return true;
          }
          return;
        }
      }
      if (!isTeamSeasonalUponReg && isTeamSeasonal) {
        for (let feeDetail of feeDetails) {
          let feeData =
            feeDetail.isAllType === 'allDivisions'
              ? feeDetail.seasonalTeam.allType
              : feeDetail.seasonalTeam.perType;
          if (feeData) {
            let noNominationFee = feeData.some(x => x.isPlayer == 1 && !x.nominationFees);
            if (noNominationFee) {
              this.state.requireNominationForUponRegError = true;
              message.error(ValidationConstants.pleaseEnterNominationFeeForInstalment);
              if (fromValidation == 'FromValidation') {
                return true;
              }
              return;
            }
          }
        }
      }
    }
    this.state.requireNominationForUponRegError = false;
    if (selectedSeasonalTeamPaymentArr.find(x => x.paymentOptionRefId == 8)) {
      if (paymentDataArr.teamSeasonalSchoolRegCode.length === 0) {
        message.error(ValidationConstants.pleaseFillRegistration);
        if (fromValidation == 'FromValidation') {
          return true;
        }
        this.setState({ loading: false });
        return;
      }
    }

    const isPaymentOptionAvailable =
      this.state.isSeasonalPaymentOptionAvailable &&
      this.state.isSeasonalTeamPaymentOptionAvailable &&
      this.state.isCasualPaymentOptionAvailable &&
      this.state.isCasualTeamPaymentOptionAvailable;

    if (fromValidation != 'FromValidation' && isPaymentOptionAvailable) {
      this.setState({ loading: true });
      this.props.competitionPaymentApi(paymentDataArr, competitionId, this.state.affiliateOrgId);
    } else {
      return false;
    }
  };

  ////check the division objects does not contain empty division array
  checkDivisionEmpty(data) {
    if (isArrayNotEmpty(data)) {
      for (let product of data) {
        if (product.isPlayingStatus && product.divisions.length === 0) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return true;
    }
  }

  discountApiCall = competitionId => {
    // let govtVoucherData= this.props.competitionFeesState.competitionDiscountsData.govermentVouchers
    let govtVoucher = this.props.competitionFeesState.competitionDiscountsData.govermentVouchers;
    let discountDataArr =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    let selectedPaymentMethods = this.props.competitionFeesState.selectedPaymentMethods;
    selectedPaymentMethods = selectedPaymentMethods.filter(x => x.isChecked);

    if (
      !selectedPaymentMethods.find(
        x => x.paymentMethodRefId == 1 || x.paymentMethodRefId == 2 || x.paymentMethodRefId == 3,
      )
    ) {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(ValidationConstants.paymentMandatory);
      return;
    }

    discountDataArr.map(item => {
      if (item.childDiscounts) {
        if (item.childDiscounts.length === 0) {
          item.childDiscounts = null;
        }
        if (item.competitionTypeDiscountTypeRefId !== 3) {
          item.childDiscounts = null;
        }
      }
      item.applyDiscount = parseInt(item.applyDiscount);
      if (item.amount !== null) {
        if (item.amount.length > 0) {
          item.amount = parseInt(item.amount);
          // } else {
          //   item['amount'] = null;
        }
      } else {
        item['amount'] = null;
      }
      return item;
    });
    let finalOrgPostDiscountData = JSON.parse(JSON.stringify(discountDataArr));
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let currentOrganisationId = orgData ? orgData.organisationId : 0;
    let filterOrgPostDiscountData = finalOrgPostDiscountData.filter(
      x => x.organisationId == currentOrganisationId,
    );
    for (let discount of filterOrgPostDiscountData) {
      if (
        discount.competitionTypeDiscountTypeRefId !== CompetitionDiscountType.Family &&
        (!discount.competitionMembershipProductTypeId ||
          discount.competitionMembershipProductTypeId < 1)
      ) {
        message.error(ValidationConstants.pleaseSelectMembershipTypes);
        return;
      }
      if (
        discount.competitionTypeDiscountTypeRefId == CompetitionTypeDiscountType.DiscountCode &&
        !discount.discountCode
      ) {
        message.error(ValidationConstants.emptyDiscountError);
        return;
      }
    }
    let discountBody = {
      competitionId,
      statusRefId: this.state.permissionState.isPublished ? 3 : this.state.statusRefId,
      competitionDiscounts: [
        {
          discounts: filterOrgPostDiscountData,
        },
      ],
      govermentVouchers: govtVoucher,
    };
    let compFeesState = this.props.competitionFeesState;
    let fee_data = compFeesState.competitionFeesData;
    let divisionArrayData = compFeesState.competitionDivisionsData;

    let discountDuplicateError = false;
    let errMsg = null;
    let discountMap = new Map();
    let otherOrgDiscountData = finalOrgPostDiscountData.filter(
      x => x.organisationId != currentOrganisationId,
    );
    for (let otherdis of otherOrgDiscountData) {
      if (otherdis.competitionTypeDiscountTypeRefId == 2) {
        let key = otherdis.discountCode;
        if (discountMap.get(key) == undefined) {
          discountMap.set(key, 1);
        }
      }
    }
    for (let x of filterOrgPostDiscountData) {
      let key = null;
      if (x.competitionTypeDiscountTypeRefId == 2) {
        key =
          x.competitionMembershipProductTypeId +
          '#' +
          x.competitionTypeDiscountTypeRefId +
          '#' +
          x.discountCode;
      } else if (x.competitionTypeDiscountTypeRefId == CompetitionDiscountType.Family) {
        key =
          x.competitionMembershipProductTypeId +
          '#' +
          x.competitionTypeDiscountTypeRefId +
          '#' +
          x.competitionMembershipProductId;
      }

      if (discountMap.get(key) == undefined) {
        discountMap.set(key, 1);
      } else {
        if (x.competitionTypeDiscountTypeRefId == CompetitionDiscountType.Family) {
          errMsg = ValidationConstants.duplicateFamilyDiscountError;
        } else {
          errMsg = ValidationConstants.duplicateDiscountError;
        }
        discountDuplicateError = true;
        break;
      }
      if (
        x.competitionTypeDiscountId == 0 &&
        x.competitionTypeDiscountTypeRefId == 2 &&
        discountMap.get(x.discountCode) == 1
      ) {
        //duplicate discount code from other org
        errMsg = ValidationConstants.duplicateDiscountError;
        discountDuplicateError = true;
        break;
      }
    }

    if (discountDuplicateError) {
      message.config({ duration: 0.9, maxCount: 1 });
      message.error(errMsg);
    } else {
      if (this.state.statusRefId == 1) {
        this.props.regSaveCompetitionFeeDiscountAction(
          discountBody,
          competitionId,
          this.state.affiliateOrgId,
        );
        this.setState({ loading: true });
      }
      if (this.state.statusRefId == 2 || this.state.statusRefId == 3) {
        if (
          divisionArrayData.length > 0 &&
          this.checkDivisionEmpty(divisionArrayData) == false &&
          fee_data.length > 0
        ) {
          this.props.regSaveCompetitionFeeDiscountAction(
            discountBody,
            competitionId,
            this.state.affiliateOrgId,
          );
          this.setState({ loading: true });
        } else {
          if (this.checkDivisionEmpty(divisionArrayData)) {
            message.config({ duration: 0.9, maxCount: 1 });
            message.error(ValidationConstants.pleaseFillDivisionBeforePublishing);
          } else if (fee_data.length === 0) {
            message.error(ValidationConstants.pleaseFillFeesBeforePublishing);
          }
        }
      }
    }
  };

  setDetailsFieldValue(yearRefId) {
    let compFeesState = this.props.competitionFeesState;
    this.formRef.current.setFieldsValue({
      competition_name: compFeesState.competitionDetailData.competitionName,
      numberOfRounds: compFeesState.competitionDetailData.noOfRounds,
      yearRefId: yearRefId ? yearRefId : this.state.yearRefId,
      competitionTypeRefId: compFeesState.competitionDetailData.competitionTypeRefId,
      competitionFormatRefId: compFeesState.competitionDetailData.competitionFormatRefId,
      registrationCloseDate:
        compFeesState.competitionDetailData.registrationCloseDate &&
        moment(compFeesState.competitionDetailData.registrationCloseDate),
      selectedVenues: compFeesState.selectedVenues,
      startDate:
        compFeesState.competitionDetailData.startDate &&
        moment(compFeesState.competitionDetailData.startDate),
      endDate:
        compFeesState.competitionDetailData.endDate &&
        moment(compFeesState.competitionDetailData.endDate),
      charityTitle: compFeesState.charityTitle,
      charityDescription: compFeesState.charityDescription,
      playerPublishTypeRefId: compFeesState.competitionDetailData.playerPublishTypeRefId,
    });
    let data = this.props.competitionFeesState.competionDiscountValue;
    let discountData =
      data && data.competitionDiscounts !== null ? data.competitionDiscounts[0].discounts : [];

    if (discountData.length > 0) {
      discountData.forEach((item, index) => {
        let competitionMembershipProductTypeId = `competitionMembershipProductTypeId${index}`;
        let membershipProductUniqueKey = `membershipProductUniqueKey${index}`;
        let competitionTypeDiscountTypeRefId = `competitionTypeDiscountTypeRefId${index}`;
        this.formRef.current.setFieldsValue({
          [competitionMembershipProductTypeId]:
            item.competitionMembershipProductTypeId ?? undefined,
          [membershipProductUniqueKey]: item.membershipProductUniqueKey,
          [competitionTypeDiscountTypeRefId]: item.competitionTypeDiscountTypeRefId,
        });
        let childDiscounts =
          item.childDiscounts !== null && item.childDiscounts.length > 0 ? item.childDiscounts : [];
        childDiscounts.forEach((childItem, childindex) => {
          let childDiscountPercentageValue = `percentageValue${index}${childindex}`;
          this.formRef.current.setFieldsValue({
            [childDiscountPercentageValue]: childItem.percentageValue,
          });
        });
      });
    }
    let divisionData = this.props.competitionFeesState.competitionDivisionsData;
    let divisionArray = divisionData !== null ? divisionData : [];
    if (divisionArray.length > 0) {
      divisionArray.forEach((item, index) => {
        item.divisions.forEach((divItem, divIndex) => {
          let divisionName = `divisionName${index}${divIndex}`;
          let genderRefId = `genderRefId${index}${divIndex}`;
          let fromDate = `fromDate${index}${divIndex}`;
          let toDate = `toDate${index}${divIndex}`;
          this.formRef.current.setFieldsValue({
            [divisionName]: divItem.divisionName,
            [genderRefId]: divItem.genderRefId ? divItem.genderRefId : [],
            [fromDate]: divItem.fromDate && moment(divItem.fromDate),
            [toDate]: divItem.toDate && moment(divItem.toDate),
          });
        });
      });
    }
  }

  saveCompFeesApiCall = fromValidation => {
    let compFeesState = this.props.competitionFeesState;
    let competitionId = compFeesState.competitionId;
    let finalPostData = [];
    let fee_data = compFeesState.competitionFeesData;
    let feeSeasonalData = [];
    let feeCasualData = [];
    let feeSeasonalTeamData = [];
    let feeCasualTeamData = [];
    let finalpostarray = [];

    for (let i in fee_data) {
      if (fee_data[i].isSeasonal && fee_data[i].isCasual) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeSeasonalData = fee_data[i].seasonal.allType;
          feeCasualData = fee_data[i].casual.allType;

          for (let seasonFee of feeSeasonalData) {
            updateCasualFeeForAllDvision(seasonFee, feeCasualData);
            updateSeasonFeeFields(seasonFee);
          }
          if (fee_data[i].isTeamSeasonal) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.allType;
            for (let seasonFee of feeSeasonalData) {
              updateTeamFeeForAllDvision(seasonFee, feeSeasonalTeamData);
            }
          }

          finalPostData = [...feeSeasonalData];
        } else {
          feeSeasonalData = fee_data[i].seasonal.perType;
          feeCasualData = fee_data[i].casual.perType;

          for (let seasonFee of feeSeasonalData) {
            updateCasualFeeForPerDvision(seasonFee, feeCasualData);
            updateSeasonFeeFields(seasonFee);
          }
          if (fee_data[i].isTeamSeasonal) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.perType;
            updateAllTeamFeeForPerDvision(feeSeasonalData, feeSeasonalTeamData);
          }

          finalPostData = [...feeSeasonalData];
        }
      } else if (fee_data[i].isSeasonal == true && fee_data[i].isCasual == false) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeSeasonalData = fee_data[i].seasonal.allType;

          if (fee_data[i].isTeamSeasonal == true) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.allType;
            for (let seasonFee of feeSeasonalData) {
              updateTeamFeeForAllDvision(seasonFee, feeSeasonalTeamData);
              updateSeasonFeeFields(seasonFee);
            }
          }

          if (fee_data[i].isTeamSeasonal == false) {
            finalPostData = [...feeSeasonalData];
            finalPostData.forEach(item => {
              updateSeasonFeeFields(item);
            });
          } else {
            finalPostData = [...feeSeasonalData];
          }
        } else {
          feeSeasonalData = fee_data[i].seasonal.perType;

          if (fee_data[i].isTeamSeasonal) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.perType;
            for (let seasonFee of feeSeasonalData) {
              updateTeamFeeForPerDvision(seasonFee, feeSeasonalTeamData);
              updateSeasonFeeFields(seasonFee);
            }
          }

          if (fee_data[i].isTeamSeasonal == false) {
            finalPostData = [...feeSeasonalData];
            finalPostData.forEach(item => {
              updateSeasonFeeFields(item);
            });
          } else {
            finalPostData = [...feeSeasonalData];
          }
        }
      } else if (fee_data[i].isSeasonal == false && fee_data[i].isCasual) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeCasualData = fee_data[i].casual.allType;

          if (fee_data[i].isTeamSeasonal) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.allType;
            for (let casualFee of feeCasualData) {
              updateTeamFeeForAllDvision(casualFee, feeSeasonalTeamData);
              updateCasualFeeFields(casualFee, casualFee);
            }
          }

          if (fee_data[i].isTeamSeasonal == false) {
            finalPostData = [...feeCasualData];
            finalPostData.forEach(item => {
              updateCasualFeeFields(item, item);
            });
          } else {
            finalPostData = [...feeCasualData];
          }
        } else {
          feeCasualData = fee_data[i].casual.perType;

          if (fee_data[i].isTeamSeasonal) {
            feeSeasonalTeamData = fee_data[i].seasonalTeam.perType;
            for (let casualFee of feeCasualData) {
              updateTeamFeeForPerDvision(casualFee, feeSeasonalTeamData);
              updateCasualFeeFields(casualFee, casualFee);
            }
          }

          if (fee_data[i].isTeamCasual) {
            feeCasualTeamData = fee_data[i].casualTeam.perType;
            for (let casualFee of feeCasualData) {
              updateTeamCasualFeeForPerDvision(casualFee, feeCasualTeamData);
            }
          }

          if (fee_data[i].isTeamSeasonal == false) {
            finalPostData = [...feeCasualData];
            finalPostData.forEach(item => {
              updateCasualFeeFields(item, item);
            });
          } else {
            finalPostData = [...feeCasualData];
          }
        }
      } else if (
        fee_data[i].isSeasonal == false &&
        fee_data[i].isCasual == false &&
        fee_data[i].isTeamSeasonal &&
        fee_data[i].isTeamCasual == false
      ) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeSeasonalTeamData = fee_data[i].seasonalTeam.allType;
        } else {
          feeSeasonalTeamData = fee_data[i].seasonalTeam.perType;
        }
        finalPostData = [...feeSeasonalTeamData];
        finalPostData.forEach(item => {
          updateTeamSeasonFeeFields(item, item);
        });
      } else if (
        fee_data[i].isSeasonal == false &&
        fee_data[i].isCasual == false &&
        fee_data[i].isTeamSeasonal == false &&
        fee_data[i].isTeamCasual
      ) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeCasualTeamData = fee_data[i].casualTeam.allType;
        } else {
          feeCasualTeamData = fee_data[i].casualTeam.perType;
        }
        finalPostData = [...feeCasualTeamData];
        finalPostData.forEach(item => {
          updateTeamCasualFeeFields(item, item);
        });
      } else if (
        fee_data[i].isSeasonal == false &&
        fee_data[i].isCasual == false &&
        fee_data[i].isTeamSeasonal &&
        fee_data[i].isTeamCasual
      ) {
        if (fee_data[i].isAllType === 'allDivisions') {
          feeCasualTeamData = fee_data[i].casualTeam.allType;
          feeSeasonalTeamData = fee_data[i].seasonalTeam.allType;

          for (let seasonTeamFee of feeSeasonalTeamData) {
            updateTeamCasualFeeForAllDvision(seasonTeamFee, feeCasualTeamData);
            updateTeamSeasonFeeFields(seasonTeamFee, seasonTeamFee);
          }
        } else {
          feeCasualTeamData = fee_data[i].casualTeam.perType;
          feeSeasonalTeamData = fee_data[i].seasonalTeam.perType;
          for (let seasonTeamFee of feeSeasonalTeamData) {
            updateTeamCasualFeeForPerDvision(seasonTeamFee, feeCasualTeamData);
            updateTeamSeasonFeeFields(seasonTeamFee, seasonTeamFee);
          }
        }

        finalPostData = [...feeSeasonalTeamData];
      }

      if (
        finalPostData != null &&
        finalPostData.length > 0 &&
        (fee_data[i].isSeasonal ||
          fee_data[i].isCasual ||
          fee_data[i].isTeamSeasonal ||
          fee_data[i].isTeamCasual)
      ) {
        finalPostData.forEach((item, index) => {
          item['isSeasonal'] = fee_data[i].isSeasonal;
          item['isCasual'] = fee_data[i].isCasual;
          item['isTeamSeasonal'] = fee_data[i].isTeamSeasonal;
          item['isTeamCasual'] = fee_data[i].isTeamCasual;
          item['teamRegChargeTypeRefId'] = fee_data[i].teamRegChargeTypeRefId;
          item.individualChargeTypeRefId = fee_data[i].individualChargeTypeRefId;
        });
        let teamRegChargeTypeRefId = fee_data[i].teamRegChargeTypeRefId;
        if (
          fee_data[i].isTeamSeasonal &&
          (teamRegChargeTypeRefId == TeamRegistrationChargeType.TeamPerMatch ||
            teamRegChargeTypeRefId == TeamRegistrationChargeType.IndividualPerMatchPlayed)
        ) {
          let teamFeeData =
            fee_data[i].isAllType === 'allDivisions'
              ? fee_data[i].seasonalTeam.allType
              : fee_data[i].seasonalTeam.perType;
          if (teamFeeData) {
            let noNominationFee = teamFeeData.some(x => x.isPlayer == 1 && !x.nominationFees);
            if (noNominationFee) {
              message.error(ValidationConstants.pleaseEnterNominationFeeForPerMatch);
              if (fromValidation == 'FromValidation') {
                return true;
              }
              return;
            }
          }
        }
        let individualChargeTypeRefId = fee_data[i].individualChargeTypeRefId;
        if (fee_data[i].isSeasonal && individualChargeTypeRefId == IndividualChargeType.PerMatch) {
          let feeData =
            fee_data[i].isAllType === 'allDivisions'
              ? fee_data[i].seasonal.allType
              : fee_data[i].seasonal.perType;
          if (feeData) {
            let noNominationFee = feeData.some(x => x.isPlayer == 1 && !x.nominationFees);
            if (noNominationFee) {
              message.error(ValidationConstants.pleaseEnterNominationFeeForPerMatch);
              if (fromValidation == 'FromValidation') {
                return true;
              }
              return;
            }
          }
        }

        let modifyArr = [...finalpostarray, ...finalPostData];
        finalpostarray = modifyArr;
      }
    }
    if (finalpostarray.length > 0) {
      if (fromValidation != 'FromValidation') {
        this.props.saveCompetitionFeeSection(
          finalpostarray,
          competitionId,
          this.state.affiliateOrgId,
        );
        this.setState({ loading: true });
      }
      return false;
    } else {
      message.error(ValidationConstants.feesCannotBeEmpty);
      return true;
    }
  };

  updateMaximumPlayers(value) {
    if (value !== '0') {
      if (value === '') {
        //form input will send an empty string, setting it to null
        value = null;
      }
      this.setState({
        maximumPlayers: value,
      });
      this.props.add_editcompetitionFeeDeatils(value, 'maximumPlayers');
      this.setState({
        zeroErrorMsg: {
          view: false,
          message: '',
        },
      });
    } else {
      this.setState({
        zeroErrorMsg: {
          view: true,
          message: AppConstants.maximumPlayersValidationMessage,
        },
      });
    }
  }

  saveCompDetailsApicall = (
    competitionId,
    postData,
    invitees,
    compFeesState,
    nonPlayingDate,
    venue,
  ) => {
    try {
      if (
        compFeesState.competitionDetailData.competitionLogoUrl !== null &&
        // compFeesState.competitionDetailData.heroImageUrl !== null &&
        invitees.length > 0
      ) {
        let formData = new FormData();
        formData.append('competitionUniqueKey', competitionId);
        formData.append('name', postData.competitionName);
        // formData.append('yearRefId', values.yearRefId);
        formData.append('yearRefId', this.state.yearRefId);
        formData.append('description', postData.description);
        formData.append('competitionTypeRefId', postData.competitionTypeRefId);
        formData.append('competitionFormatRefId', postData.competitionFormatRefId);
        formData.append('startDate', postData.startDate);
        formData.append('endDate', postData.endDate);
        formData.append('playerPublishTypeRefId', postData.playerPublishTypeRefId);
        if (postData.competitionFormatRefId == 4) {
          if (postData.noOfRounds !== null && postData.noOfRounds !== '')
            formData.append('noOfRounds', postData.noOfRounds);
        }
        if (postData.roundInDays !== null && postData.roundInDays !== '')
          formData.append('roundInDays', postData.roundInDays);
        if (postData.roundInHours !== null && postData.roundInHours !== '')
          formData.append('roundInHours', postData.roundInHours);
        if (postData.roundInMins !== null && postData.roundInMins !== '')
          formData.append('roundInMins', postData.roundInMins);
        if (postData.minimunPlayers !== null && postData.minimunPlayers !== '')
          formData.append('minimunPlayers', postData.minimunPlayers);
        if (postData.maximumPlayers !== '0')
          formData.append('maximumPlayers', postData.maximumPlayers);
        formData.append('venues', venue);
        formData.append('registrationCloseDate', postData.registrationCloseDate);
        formData.append('statusRefId', this.state.isPublished ? 2 : this.state.statusRefId);
        formData.append('nonPlayingDates', nonPlayingDate);
        formData.append('invitees', JSON.stringify(invitees));
        formData.append('logoSetAsDefault', this.state.logoSetDefault);
        formData.append('hasRegistration', 1);
        if (this.state.logoSetDefault) {
          formData.append('organisationLogoId', compFeesState.defaultCompFeesOrgLogoData.id);
        }
        if (postData.logoIsDefault) {
          formData.append(
            'competitionLogoId',
            postData.competitionLogoId ? postData.competitionLogoId : 0,
          );
          formData.append('logoFileUrl', compFeesState.defaultCompFeesOrgLogo);
          formData.append('competition_logo', compFeesState.defaultCompFeesOrgLogo);
        } else if (!this.state.image) {
          formData.append(
            'competitionLogoId',
            postData.competitionLogoId ? postData.competitionLogoId : 0,
          );
          formData.append('logoFileUrl', postData.competitionLogoUrl);
        }

        if (this.state.image && !this.state.heroImage) {
          formData.append('uploadFileType', 1);
          formData.append('competition_logo', this.state.image);
          formData.append(
            'competitionLogoId',
            postData.competitionLogoId ? postData.competitionLogoId : 0,
          );
        } else if (this.state.heroImage && !this.state.image) {
          formData.append('uploadFileType', 2);
          formData.append('competition_logo', this.state.heroImage);
        } else if (this.state.image && this.state.heroImage) {
          formData.append('uploadFileType', 3);
          formData.append('competition_logo', this.state.image);
          formData.append('competition_logo', this.state.heroImage);
          formData.append(
            'competitionLogoId',
            postData.competitionLogoId ? postData.competitionLogoId : 0,
          );
        }

        formData.append('logoIsDefault', postData.logoIsDefault);
        this.props.saveCompetitionFeesDetailsAction(
          formData,
          compFeesState.defaultCompFeesOrgLogoData.id,
          AppConstants.Reg,
          this.state.affiliateOrgId,
          this.state.isEdit,
        );
        this.setState({ loading: true });
      } else {
        if (invitees.length === 0) {
          message.error(ValidationConstants.pleaseSelectRegInvitees);
        }
        if (compFeesState.competitionDetailData.competitionLogoUrl == null) {
          message.error(ValidationConstants.competitionLogoIsRequired);
        }
        // if (compFeesState.competitionDetailData.heroImageUrl == null) {
        //     message.error(ValidationConstants.heroImageIsRequired);
        // }
      }
    } catch (ex) {
      console.log('Error in saveCompDetailsApiCall::' + ex);
    }
  };

  saveCompMembershipApiCall = competitionId => {
    try {
      let finalmembershipProductTypes = JSON.parse(
        JSON.stringify(this.props.competitionFeesState.defaultCompFeesMembershipProduct),
      );
      let tempProductsArray = finalmembershipProductTypes.filter(
        data => data.isProductSelected === true,
      );
      finalmembershipProductTypes = tempProductsArray;
      for (let i in finalmembershipProductTypes) {
        var filterArray = finalmembershipProductTypes[i].membershipProductTypes.filter(
          data => data.isTypeSelected === true,
        );
        finalmembershipProductTypes[i].membershipProductTypes = filterArray;
        // if (finalmembershipProductTypes[i].membershipProductTypes.length === 0) {
        //     finalmembershipProductTypes.splice(i, 1);
        // }
      }

      if (!isArrayNotEmpty(finalmembershipProductTypes)) {
        message.error(ValidationConstants.please_SelectMembership_Product);
      } else if (isArrayNotEmpty(finalmembershipProductTypes)) {
        if (!isArrayNotEmpty(finalmembershipProductTypes[0].membershipProductTypes)) {
          message.error(ValidationConstants.please_SelectMembership_Types);
        } else {
          let arrayList = finalmembershipProductTypes.filter(
            x => x.membershipProductTypes.length > 0,
          );
          let payload = {
            membershipProducts: arrayList,
          };
          this.props.saveCompetitionFeesMembershipTabAction(
            payload,
            competitionId,
            this.state.affiliateOrgId,
          );
          this.setState({ loading: true, divisionState: true });
        }
      }
    } catch (ex) {
      console.log('Error in savecompMembershipApiCall::' + ex);
    }
  };

  saveCompDivApiCall = (competitionId, postData, compFeesState) => {
    try {
      let divisionArrayData = compFeesState.competitionDivisionsData;
      let membershipProductData = compFeesState.defaultCompFeesMembershipProduct;
      let membershipProductArray = membershipProductData !== null ? membershipProductData : [];
      const restrictionProducts = this.getRestrictionsOfTypes(membershipProductArray);

      let finalDivisionArray = [];
      for (let i in divisionArrayData) {
        if (!divisionArrayData[i].isPlayingStatus) {
          //ignore for non player membership product
          continue;
        }
        let hasAgeRestriction = false;
        let minDateEpoch = null;
        let maxDateEpoch = null;
        let product = restrictionProducts.find(
          p => p.membershipProductUniqueKey == divisionArrayData[i].membershipProductUniqueKey,
        );
        if (product) {
          let productTypes = product.types;
          hasAgeRestriction = !productTypes.some(p => !p.fromDate || !p.toDate);
          if (hasAgeRestriction) {
            minDateEpoch = Math.min(...productTypes.map(p => new Date(p.fromDate).getTime()));
            maxDateEpoch = Math.max(...productTypes.map(p => new Date(p.toDate).getTime()));
          }
        }
        for (let div of divisionArrayData[i].divisions) {
          if (hasAgeRestriction && div.fromDate && div.toDate && minDateEpoch) {
            const divisionFromDate = new Date(div.fromDate).getTime();
            const divisionToDate = new Date(div.toDate).getTime();
            if (divisionFromDate < minDateEpoch || divisionToDate > maxDateEpoch) {
              let msg = `Please specify a start date and end date for ${
                div.divisionName
              } between ${new Date(minDateEpoch).toLocaleDateString()} and ${new Date(
                maxDateEpoch,
              ).toLocaleDateString()}`;
              message.error(msg);
              return;
            }
          }
        }
        finalDivisionArray = [...finalDivisionArray, ...divisionArrayData[i].divisions];
      }
      let payload = finalDivisionArray;
      let registrationRestrictionTypeRefId =
        postData.registrationRestrictionTypeRefId == null
          ? 1
          : postData.registrationRestrictionTypeRefId;
      if (!this.state.showMultiDivisionRegistration) {
        registrationRestrictionTypeRefId = 1;
      }
      let finalDivisionPayload = {
        statusRefId: this.state.isPublished ? 2 : this.state.statusRefId,
        divisions: payload,
        registrationRestrictionTypeRefId: registrationRestrictionTypeRefId,
      };

      if (this.checkDivisionEmpty(divisionArrayData)) {
        message.error(ValidationConstants.pleaseAddDivisionForMembershipProduct);
      } else {
        this.props.saveCompetitionFeesDivisionAction(
          finalDivisionPayload,
          competitionId,
          this.state.affiliateOrgId,
        );
        this.setState({ loading: true });
      }
    } catch (ex) {
      console.log('Error in saveCompDivApiCall::' + ex);
    }
  };

  saveAPIsActionCall = values => {
    this.setState({ clickedOnTab: false });
    let tabKey = this.state.competitionTabKey;
    let compFeesState = this.props.competitionFeesState;
    let competitionId = compFeesState.competitionId;
    let postData = compFeesState.competitionDetailData;

    let nonPlayingDate = JSON.stringify(postData.nonPlayingDates);
    let venue = JSON.stringify(compFeesState.postVenues);
    // let invitees = compFeesState.postInvitees
    let invitees = [];
    let anyOrgAffiliateArr = [];
    if (
      compFeesState.associationChecked &&
      compFeesState.anyOrgAssociationArr[0].inviteesOrg.length > 0
    ) {
      anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgAssociationArr);
    }
    if (compFeesState.clubChecked && compFeesState.anyOrgClubArr[0].inviteesOrg.length > 0) {
      anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgClubArr);
    }
    if (compFeesState.affiliateArray != null && compFeesState.affiliateArray.length > 0) {
      invitees = compFeesState.affiliateArray.concat(anyOrgAffiliateArr);
    } else if (anyOrgAffiliateArr != null && anyOrgAffiliateArr.length > 0) {
      invitees = anyOrgAffiliateArr;
    }

    if (tabKey == TabKey.Detail) {
      this.saveCompDetailsApicall(
        competitionId,
        postData,
        invitees,
        compFeesState,
        nonPlayingDate,
        venue,
      );
    } else if (tabKey == TabKey.Membership) {
      this.saveCompMembershipApiCall(competitionId);
    } else if (tabKey == TabKey.Division) {
      this.saveCompDivApiCall(competitionId, postData, compFeesState);
    } else if (tabKey == TabKey.Fee) {
      if (this.feeRef) {
        let feeValidated = this.feeRef.validateForm();
        if (!feeValidated) return;
      }
      this.saveCompFeesApiCall();
    } else if (tabKey == TabKey.Payment) {
      this.paymentApiCall(competitionId);
      //this.setState({ loading: true });
    } else if (tabKey == TabKey.Discount) {
      this.discountApiCall(competitionId);
    }
  };

  tabCangeSaveApiActionCall = tabKey => {
    try {
      this.setState({ clickedOnTab: true });
      let compFeesState = this.props.competitionFeesState;
      let competitionId = compFeesState.competitionId;
      let postData = compFeesState.competitionDetailData;

      let membershipDisable = this.state.permissionState.membershipDisable;
      let divisionsDisable = this.state.permissionState.divisionsDisable;

      let nonPlayingDate = JSON.stringify(postData.nonPlayingDates);
      let venue = JSON.stringify(compFeesState.postVenues);
      // let invitees = compFeesState.postInvitees
      let invitees = [];
      let anyOrgAffiliateArr = [];
      if (
        compFeesState.associationChecked &&
        compFeesState.anyOrgAssociationArr[0].inviteesOrg.length > 0
      ) {
        anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgAssociationArr);
      }
      if (compFeesState.clubChecked && compFeesState.anyOrgClubArr[0].inviteesOrg.length > 0) {
        anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgClubArr);
      }
      if (compFeesState.affiliateArray != null && compFeesState.affiliateArray.length > 0) {
        invitees = compFeesState.affiliateArray.concat(anyOrgAffiliateArr);
      } else if (anyOrgAffiliateArr != null && anyOrgAffiliateArr.length > 0) {
        invitees = anyOrgAffiliateArr;
      }
      if (tabKey == TabKey.Detail && this.state.isCreatorEdit == false) {
        this.saveCompDetailsApicall(
          competitionId,
          postData,
          invitees,
          compFeesState,
          nonPlayingDate,
          venue,
        );
      } else if (
        tabKey == TabKey.Membership &&
        this.state.isCreatorEdit == false &&
        membershipDisable == false
      ) {
        this.saveCompMembershipApiCall(competitionId);
      } else if (tabKey == TabKey.Division && this.state.isCreatorEdit == false) {
        this.saveCompDivApiCall(competitionId, postData, compFeesState);
      } else if (tabKey == TabKey.Fee) {
        this.saveCompFeesApiCall();
      } else if (tabKey == TabKey.Payment && this.state.isCreatorEdit == false) {
        this.paymentApiCall(competitionId);
      } else if (tabKey == TabKey.Discount) {
        this.discountApiCall(competitionId);
      }
    } catch (ex) {
      console.log('Error in tabChangeSaveApiActionCall::' + ex);
    }
  };

  divisionTableDataOnchange(checked, record, index, keyword) {
    this.props.divisionTableDataOnchangeAction(checked, record, index, keyword);
    this.setState({ divisionState: true });
  }

  dateOnChangeFrom = (date, key) => {
    if (date !== null) {
      this.props.add_editcompetitionFeeDeatils(moment(date).format('YYYY-MM-DD'), key);
    }
  };

  AffiliatesLevel = tree => {
    const { TreeNode } = Tree;
    return tree.map((item, catIndex) => (
      <TreeNode title={this.advancedNode(item)} key={item.id}>
        {this.showSubAdvancedNode(item, catIndex)}
      </TreeNode>
    ));
  };

  advancedNode = item => {
    return <span>{item.description}</span>;
  };

  disableInviteeNode = inItem => {
    let orgLevelId = JSON.stringify(this.state.organisationTypeRefId);
    if (inItem.id == '2' && orgLevelId == '3') {
      return true;
    } else if (orgLevelId == '4') {
      return true;
    } else {
      return false;
    }
  };

  showSubAdvancedNode(item, catIndex) {
    const { TreeNode } = Tree;
    return item.subReferences.map(inItem => (
      <TreeNode
        title={this.makeSubAdvancedNode(inItem)}
        key={inItem.id}
        disabled={this.disableInviteeNode(inItem)}
      />
    ));
  }

  makeSubAdvancedNode(item) {
    return <span>{item.description}</span>;
  }

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view bg-transparent d-flex align-items-center pl-4">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">
            {AppConstants.competitionFees}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

  /*dropdownView = () => {
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading required-field">{AppConstants.year}:</span>
                <Form.Item
                  name="yearRefId"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.pleaseSelectYear,
                    },
                  ]}
                >
                  <Select
                    className="year-select reg-filter-select1 ml-2"
                    style={{ maxWidth: 80 }}
                    onChange={e => this.setYear(e)}
                    // value= {this.state.yearRefId}
                  >
                    {this.props.appState.yearList.map(item => (
                      <Option key={'year_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };*/

  // setImage = (data, key) => {
  //     if (data.files[0] !== undefined) {
  //         let files_ = data.files[0].type.split('image/');
  //         let fileType = files_[1];

  //         if (key === "competitionLogoUrl") {
  //             if (data.files[0].size > AppConstants.logo_size) {
  //                 message.error(AppConstants.logoImageSize);
  //                 return;
  //             }
  //             if (fileType === `jpeg` || fileType === `png` || fileType === `gif`) {
  //                 this.setState({
  //                     image: data.files[0],
  //                     profileImage: URL.createObjectURL(data.files[0]),
  //                     isSetDefaul: true,
  //                 });
  //                 this.props.add_editcompetitionFeeDeatils(
  //                     URL.createObjectURL(data.files[0]),
  //                     'competitionLogoUrl'
  //                 );
  //                 this.props.add_editcompetitionFeeDeatils(false, 'logoIsDefault');
  //             } else {
  //                 message.error(AppConstants.logoType);
  //                 return;
  //             }
  //         } else if (key === "heroImageUrl") {
  //             if (fileType === `jpeg` || fileType === `png` || fileType === `gif`) {
  //                 this.setState({
  //                     heroImage: data.files[0]
  //                 });
  //                 this.props.add_editcompetitionFeeDeatils(
  //                     URL.createObjectURL(data.files[0]),
  //                     'heroImageUrl'
  //                 );
  //             } else {
  //                 message.error(AppConstants.logoType);
  //                 return;
  //             }
  //         }
  //     }
  // };

  setImage = (data, key) => {
    if (data.files[0] !== undefined) {
      let file = data.files[0];
      let extension = file.name.split('.').pop().toLowerCase();
      let imageSizeValid = isImageSizeValid(file.size);
      let isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }
      if (key === 'competitionLogoUrl') {
        this.setState({
          image: data.files[0],
          profileImage: URL.createObjectURL(data.files[0]),
          isSetDefaul: true,
        });
        this.props.add_editcompetitionFeeDeatils(
          URL.createObjectURL(data.files[0]),
          'competitionLogoUrl',
        );
        this.props.add_editcompetitionFeeDeatils(false, 'logoIsDefault');
      } else if (key === 'heroImageUrl') {
        this.setState({
          heroImage: data.files[0],
        });
        this.props.add_editcompetitionFeeDeatils(
          URL.createObjectURL(data.files[0]),
          'heroImageUrl',
        );
      }
    }
  };

  selectImage() {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      fileInput.click();
    }
  }

  selectHeroImage() {
    const fileInput = document.getElementById('hero-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      fileInput.click();
    }
  }

  /// add-edit non playing dates and name
  updateNonPlayingNames(data, index, key) {
    let detailsData = this.props.competitionFeesState;
    let array = detailsData.competitionDetailData.nonPlayingDates;
    if (key === 'name') {
      array[index].name = data;
    } else {
      array[index].nonPlayingDate = moment(data).format('YYYY-MM-DD');
    }

    this.props.add_editcompetitionFeeDeatils(array, 'nonPlayingDates');
  }

  // Non playing dates view
  nonPlayingDateView(item, index) {
    let compDetailDisable = this.state.permissionState.compDetailDisable;
    return (
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead
              auto_complete={`new-name${index}`}
              placeholder={AppConstants.name}
              value={item.name}
              onChange={e => this.updateNonPlayingNames(e.target.value, index, 'name')}
              disabled={compDetailDisable}
              data-testid={AppUniqueId.ADD_NON_PLAYING_DATE.concat(`${index}`)}
            />
          </div>
          <div className="col-sm">
            <DatePicker
              className="comp-dashboard-botton-view-mobile w-100"
              size="default"
              placeholder="dd-mm-yyyy"
              onChange={date => this.updateNonPlayingNames(date, index, 'date')}
              format="DD-MM-YYYY"
              showTime={false}
              value={item.nonPlayingDate && moment(item.nonPlayingDate, 'YYYY-MM-DD')}
              disabled={compDetailDisable}
            />
          </div>
          <div
            className="col-sm-2 transfer-image-view"
            onClick={() =>
              !compDetailDisable
                ? this.props.add_editcompetitionFeeDeatils(index, 'nonPlayingDataRemove')
                : null
            }
          >
            <a className="transfer-image-view">
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  //On selection of venue
  onSelectValues(item, detailsData) {
    this.props.add_editcompetitionFeeDeatils(item, 'venues');
    this.props.clearFilter();
  }

  ///// Add Non Playing dates
  addNonPlayingDate() {
    let nonPlayingObject = {
      competitionNonPlayingDatesId: 0,
      name: '',
      nonPlayingDate: '',
    };
    this.props.add_editcompetitionFeeDeatils(nonPlayingObject, 'nonPlayingObjectAdd');
  }

  ///handle Invitees selection
  handleInvitees() {
    let detailsData = this.props.competitionFeesState.competitionDetailData;
    if (detailsData) {
      let selectedInvitees = detailsData.invitees;
      let selected = [];
      if (selectedInvitees.length > 0) {
        for (let i in selectedInvitees) {
          selected.push(selectedInvitees[i].registrationInviteesRefId);
        }
      }
      return selected;
    } else {
      return [];
    }
  }

  //// On change Invitees
  onInviteesChange(value) {
    // let regInviteesselectedData = this.props.competitionFeesState.selectedInvitees;
    let arr = [value];
    this.props.add_editcompetitionFeeDeatils(arr, 'invitees');
    if (value == 7) {
      this.onInviteeSearch('', 3);
    } else if (value == 8) {
      this.onInviteeSearch('', 4);
    }
  }

  /////on change logo isdefault
  logoIsDefaultOnchange = (value, key) => {
    this.props.add_editcompetitionFeeDeatils(value, key);
    this.setState({ logoSetDefault: false, isSetDefaul: false, image: null });
  };

  // search venue
  handleSearch = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchVenueList(filteredData);
  };

  ////onChange save as default logo
  logoSaveAsDefaultOnchange = (value, key) => {
    this.props.add_editcompetitionFeeDeatils(false, key);
    this.setState({ logoSetDefault: value });
  };

  contentView = getFieldDecorator => {
    let roundsArray = this.props.competitionManagementState.fixtureTemplate;
    let appState = this.props.appState;
    let detailsData = this.props.competitionFeesState;
    let defaultCompFeesOrgLogo = detailsData.defaultCompFeesOrgLogo;
    let compDetailDisable = this.state.permissionState.compDetailDisable;
    let compDatesDisable = this.state.permissionState.compDatesDisable;
    let isPublished = this.state.permissionState.isPublished;
    let venueList = appState.venueList;
    const { affiliateOurOrg } = this.props.userState;
    if (compDetailDisable) {
      venueList = detailsData.venueList;
    }
    return (
      <div className="content-view pt-4">
        <InputWithHead required="required-field" heading={AppConstants.year} />

        <Form.Item
          name="yearRefId"
          rules={[
            {
              required: true,
              message: ValidationConstants.pleaseSelectYear,
            },
          ]}
        >
          <Select
            className="year-select reg-filter-select1"
            data-testid={AppUniqueId.SELECT_COMPETITION_YEAR}
            style={{ maxWidth: 80 }}
            onChange={e => this.setYear(e)}
            disabled={isPublished}
          >
            {this.props.appState.yearList.map(item => (
              <Option
                data-testid={AppUniqueId.SELECT_COMPETITION_YEAR_OPTION + item.description}
                key={'year_' + item.id}
                value={item.id}
              >
                {item.description}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="competition_name"
          rules={[
            {
              required: true,
              message: ValidationConstants.competitionNameIsRequired,
            },
          ]}
        >
          <InputWithHead
            auto_complete="off"
            required="required-field"
            heading={AppConstants.competitionName}
            placeholder={AppConstants.competitionName}
            data-testid={AppUniqueId.COMPETITION_NAME}
            // value={detailsData.competitionDetailData.competitionName}
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(
                captializedString(e.target.value),
                'competitionName',
              )
            }
            disabled={compDetailDisable}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                competition_name: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>

        <InputWithHead required="required-field " heading={AppConstants.competitionLogo} />

        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="reg-competition-logo-view" onClick={this.selectImage}>
                <label>
                  <img
                    src={
                      detailsData.competitionDetailData.competitionLogoUrl == null
                        ? AppImages.circleImage
                        : detailsData.competitionDetailData.competitionLogoUrl
                    }
                    // alt="animated"
                    height="120"
                    width="120"
                    style={{ borderRadius: 60 }}
                    name="image"
                    onError={ev => {
                      ev.target.src = AppImages.circleImage;
                    }}
                    alt=""
                  />
                </label>
              </div>
              <input
                disabled={compDetailDisable}
                type="file"
                id="user-pic"
                className="d-none"
                data-testid={AppUniqueId.COMPETITION_LOGO}
                onChange={evt => this.setImage(evt.target, 'competitionLogoUrl')}
                onClick={event => {
                  event.target.value = null;
                }}
              />
            </div>
            <div className="col-sm d-flex justify-content-center align-items-start flex-column">
              {defaultCompFeesOrgLogo !== null && (
                <Checkbox
                  className="single-checkbox"
                  data-testid={AppUniqueId.USE_DEFAULT_COMP_LOGO}
                  // defaultChecked={false}
                  checked={detailsData.competitionDetailData.logoIsDefault}
                  onChange={e => this.logoIsDefaultOnchange(e.target.checked, 'logoIsDefault')}
                  disabled={compDetailDisable}
                >
                  {AppConstants.useDefault}
                </Checkbox>
              )}

              {this.state.isSetDefaul && (
                <Checkbox
                  className="single-checkbox ml-0"
                  data-testid={AppUniqueId.USE_DEFAULT_COMP_LOGO}
                  checked={this.state.logoSetDefault}
                  onChange={e => this.logoSaveAsDefaultOnchange(e.target.checked, 'logoIsDefault')}
                  disabled={compDetailDisable}
                >
                  {AppConstants.useAffiliateLogo}
                </Checkbox>
              )}
            </div>
          </div>
          <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
        </div>

        <InputWithHead heading={AppConstants.heroImageForCompetition} />
        <div className="reg-competition-hero-image-view" onClick={this.selectHeroImage}>
          <div
            style={{
              overflow: 'hidden',
              minHeight: '150px',
              maxHeight: '287px',
            }}
          >
            <img
              src={
                detailsData.competitionDetailData.heroImageUrl == null
                  ? AppImages.circleImage
                  : detailsData.competitionDetailData.heroImageUrl
              }
              name="image"
              style={
                detailsData.competitionDetailData.heroImageUrl == null
                  ? {
                      height: '120px',
                      width: '120px',
                    }
                  : { width: '100%' }
              }
              onError={ev => {
                ev.target.src = AppImages.circleImage;
              }}
              alt=""
            />
            <input
              disabled={compDetailDisable}
              type="file"
              id="hero-pic"
              className="d-none"
              onChange={evt => this.setImage(evt.target, 'heroImageUrl')}
              onClick={event => {
                event.target.value = null;
              }}
            />
            <div className="d-flex align-items-center justify-content-center">
              <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
            </div>
          </div>

          <span
            style={
              detailsData.competitionDetailData.heroImageUrl == null
                ? {
                    alignSelf: 'center',
                    marginLeft: 20,
                    color: 'var(--app-bbbbc6)',
                    fontSize: 13,
                  }
                : { display: 'none' }
            }
          >
            {AppConstants.heroImageSizeText}
          </span>
        </div>

        <InputWithHead heading={AppConstants.description} />
        <TextArea
          placeholder={AppConstants.addShortNotes_registering}
          allowClear
          value={detailsData.competitionDetailData.description}
          onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.value, 'description')}
          disabled={compDetailDisable}
        />

        <div style={{ marginTop: 15 }}>
          <InputWithHead required="required-field" heading={AppConstants.venue} />
          <Form.Item
            name="selectedVenues"
            rules={[
              {
                required: true,
                message: ValidationConstants.pleaseSelectVenue,
              },
            ]}
          >
            <Select
              mode="multiple"
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={venueSelection => {
                this.onSelectValues(venueSelection, detailsData);
              }}
              // value={detailsData.selectedVenues}
              placeholder={AppConstants.selectVenue}
              data-testid={AppUniqueId.SELECT_COMPETITION_VENUE}
              filterOption={false}
              onSearch={value => {
                this.handleSearch(value, appState.mainVenueList);
              }}
              disabled={compDetailDisable}
            >
              {venueList.map(item => (
                <Option
                  data-testid={AppUniqueId.SELECT_COMPETITION_VENUE_OPTION + item.name}
                  key={'venue_' + item.id}
                  value={item.id}
                >
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        {compDetailDisable == false &&
          affiliateOurOrg.organisationTypeRefId <=
            affiliateOurOrg.whatIsTheLowestOrgThatCanAddVenue && (
            <NavLink
              to={{
                pathname: `/competitionVenueAndTimesAdd`,
                state: {
                  key: AppConstants.competitionFees,
                  id: this.props.location.state ? this.props.location.state.id : null,
                },
              }}
              data-testid={AppUniqueId.SELECT_COMPETITION_VENU_LINK}
            >
              <span className="input-heading-add-another">+{AppConstants.addVenue}</span>
            </NavLink>
          )}
        <span className="applicable-to-heading required-field">
          {AppConstants.typeOfCompetition}
        </span>
        <Form.Item
          name="competitionTypeRefId"
          initialValue={1}
          rules={[
            {
              required: true,
              message: ValidationConstants.pleaseSelectCompetitionType,
            },
          ]}
        >
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'competitionTypeRefId')
            }
            value={detailsData.competitionTypeRefId}
            disabled={compDetailDisable}
          >
            {appState.typesOfCompetition.map(item => (
              <Radio
                key={'competitionType_' + item.id}
                value={item.id}
                data-testid={AppUniqueId.COMPETITION_TYPE + item.id}
              >
                {' '}
                {item.description}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <span className="applicable-to-heading required-field">
          {AppConstants.competitionFormat}
        </span>
        <Form.Item
          name="competitionFormatRefId"
          initialValue={1}
          rules={[
            {
              required: true,
              message: ValidationConstants.pleaseSelectCompetitionFormat,
            },
          ]}
        >
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'competitionFormatRefId')
            }
            value={detailsData.competitionFormatRefId}
            disabled={compDetailDisable}
          >
            {appState.competitionFormatTypes.map(item => (
              <div key={'competitionFormatT' + item.id} className="contextualHelp-RowDirection">
                <Radio
                  data-testid={AppUniqueId.COMPETITION_FORMAT + item.id}
                  key={'competitionFormat' + item.id}
                  value={item.id}
                >
                  {' '}
                  {item.description}
                </Radio>

                <div className="mt-2 ml-n15">
                  <CustomToolTip>
                    <span>{item.helpMsg}</span>
                  </CustomToolTip>
                </div>
              </div>
            ))}
          </Radio.Group>
        </Form.Item>

        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.compStartDate} required="required-field" />
              <Form.Item
                name="startDate"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.startDateIsRequired,
                  },
                ]}
              >
                <DatePicker
                  size="default"
                  placeholder="dd-mm-yyyy"
                  data-testid={AppUniqueId.COMPETITION_START_DATE}
                  className="w-100"
                  onChange={date => this.dateOnChangeFrom(date, 'startDate')}
                  format="DD-MM-YYYY"
                  showTime={false}
                  // value={detailsData.competitionDetailData.startDate && moment(detailsData.competitionDetailData.startDate, "YYYY-MM-DD")}
                  disabled={compDatesDisable}
                />
              </Form.Item>
            </div>
            <div className="col-sm">
              <InputWithHead heading={AppConstants.compCloseDate} required="required-field" />
              <Form.Item
                name="endDate"
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.endDateIsRequired,
                  },
                ]}
              >
                <DatePicker
                  size="default"
                  placeholder="dd-mm-yyyy"
                  data-testid={AppUniqueId.COMPETITION_END_DATE}
                  className="w-100"
                  onChange={date => this.dateOnChangeFrom(date, 'endDate')}
                  format="DD-MM-YYYY"
                  showTime={false}
                  disabledDate={d => !d || d.isBefore(detailsData.competitionDetailData.startDate)}
                  disabled={compDatesDisable}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        {/* <div className="col-sm"> */}
        {detailsData.competitionDetailData.competitionFormatRefId == 4 && (
          <div>
            <InputWithHead heading={AppConstants.numberOfRounds} required="required-field" />
            <Form.Item
              name="numberOfRounds"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.numberOfRoundsNameIsRequired,
                },
              ]}
            >
              <InputNumber
                style={{ paddingRight: 1, minWidth: 182 }}
                onKeyDown={e => e.key === '.' && e.preventDefault()}
                onChange={e => this.props.add_editcompetitionFeeDeatils(e, 'noOfRounds')}
                min={1}
                max={50}
                value={detailsData.competitionDetailData.noOfRounds}
                disabled={compDetailDisable}
              />
            </Form.Item>
          </div>
        )}
        {/* </div> */}
        <InputWithHead heading={AppConstants.timeBetweenRounds} />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.days}
                data-testid={AppUniqueId.TIME_BETWEEN_ROUNDS_DAYS}
                value={detailsData.competitionDetailData.roundInDays}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInDays')
                }
                disabled={compDetailDisable}
                heading={AppConstants._days}
                required={'pt-0'}
              />
            </div>
            <div className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.hours}
                value={detailsData.competitionDetailData.roundInHours}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInHours')
                }
                disabled={compDetailDisable}
                heading={AppConstants._hours}
                required={'pt-0'}
              />
            </div>
            <div className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.mins}
                value={detailsData.competitionDetailData.roundInMins}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInMins')
                }
                disabled={compDetailDisable}
                heading={AppConstants._minutes}
                required={'pt-0'}
              />
            </div>
          </div>
        </div>
        <InputWithHead heading={AppConstants.registrationClose} required="required-field" />
        <Form.Item
          name="registrationCloseDate"
          rules={[
            {
              required: true,
              message: ValidationConstants.registrationCloseDateIsRequired,
            },
          ]}
        >
          <DatePicker
            size="default"
            placeholder="dd-mm-yyyy"
            data-testid={AppUniqueId.REGISTRATION_CLOSE_DATE}
            className="w-100"
            onChange={date => this.dateOnChangeFrom(date, 'registrationCloseDate')}
            name={'registrationCloseDate'}
            format="DD-MM-YYYY"
            showTime={false}
            disabled={compDatesDisable}
          />
        </Form.Item>

        <div className="inside-container-view pt-4">
          <InputWithHead required="pb-1" heading={AppConstants.nonPlayingDates} />
          {detailsData.competitionDetailData.nonPlayingDates &&
            detailsData.competitionDetailData.nonPlayingDates.map((item, index) =>
              this.nonPlayingDateView(item, index),
            )}
          <a>
            <span
              onClick={() => (!compDetailDisable ? this.addNonPlayingDate() : null)}
              className="input-heading-add-another"
              data-testid={AppUniqueId.ADD_NON_PLAYING_DATE}
            >
              + {AppConstants.addAnotherNonPlayingDate}
            </span>
          </a>
        </div>

        <InputWithHead heading={AppConstants.playerInEachTeam} />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-6">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.maxNumber}
                value={
                  detailsData.competitionDetailData.maximumPlayers == '0'
                    ? ''
                    : detailsData.competitionDetailData.maximumPlayers
                }
                onChange={e => this.updateMaximumPlayers(e.target.value)}
                data-testid={AppUniqueId.MAXIMUM_PLAYERS}
                disabled={compDetailDisable}
              />
            </div>
          </div>
        </div>
        <span className="error-warning-span" visible={this.state.zeroErrorMsg.view}>
          {this.state.zeroErrorMsg.message}
        </span>
        <div>
          <InputWithHead heading={AppConstants.playerPublishLabel} />
          <Radio.Group
            disabled={compDetailDisable}
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'playerPublishTypeRefId')
            }
            value={detailsData.competitionDetailData.playerPublishTypeRefId}
          >
            <Radio value={1} data-testid={AppUniqueId.PLAYER_PUBLISH_OPT1}>
              {AppConstants.playerPublishOption1}
            </Radio>
            <Radio value={2} data-testid={AppUniqueId.PLAYER_PUBLISH_OPT2}>
              {AppConstants.playerPublishOption2}
            </Radio>
          </Radio.Group>
        </div>
      </div>
    );
  };

  ////////on change function of membership product selection
  membershipProductSelected = (checked, index, membershipProductUniqueKey) => {
    this.props.membershipProductSelectedAction(checked, index, membershipProductUniqueKey);
  };

  ////membership types in competition fees onchange function
  membershipTypeSelected = (checked, membershipIndex, typeIndex) => {
    this.props.membershipTypeSelectedAction(checked, membershipIndex, typeIndex);
  };

  membershipProductView = () => {
    let membershipProductData = this.props.competitionFeesState.defaultCompFeesMembershipProduct;
    let membershipProductArray = [];
    if (membershipProductData) {
      if (!this.state.isPublished) {
        membershipProductData = membershipProductData.filter(
          x => x.statusRefId == MembershipProductStatusEnum.Published,
        );
      }
      membershipProductArray = membershipProductData;
    }
    let membershipDisable = this.state.permissionState.membershipDisable;
    return (
      <div className="fees-view pt-5">
        <span className="form-heading required-field">{AppConstants.membershipProduct}</span>
        {membershipProductArray.map((item, index) => (
          <div key={index} className="d-flex flex-column justify-content-center">
            <Checkbox
              className="single-checkbox pt-3"
              data-testid={AppUniqueId.MEMBERSHIP_PRODUCT}
              checked={item.isProductSelected}
              onChange={e =>
                this.membershipProductSelected(
                  e.target.checked,
                  index,
                  item.membershipProductUniqueKey,
                )
              }
              key={index}
              disabled={membershipDisable}
            >
              {item.membershipProductName}
            </Checkbox>
          </div>
        ))}
      </div>
    );
  };

  membershipTypeInnerView = (item, index) => {
    let typeData = isArrayNotEmpty(item.membershipProductTypes) ? item.membershipProductTypes : [];
    let membershipDisable = this.state.permissionState.membershipDisable;
    return (
      <div>
        {typeData.map((typeItem, typeIndex) => (
          <div key={typeIndex} className="d-flex flex-column justify-content-center">
            <Checkbox
              className="single-checkbox pt-3"
              data-testid={AppUniqueId.MEMBERSHIP_TYPE.concat(typeIndex)}
              checked={typeItem.isTypeSelected}
              onChange={e => this.membershipTypeSelected(e.target.checked, index, typeIndex)}
              key={typeIndex}
              disabled={membershipDisable}
            >
              {typeItem.membershipProductTypeName}
            </Checkbox>
          </div>
        ))}
      </div>
    );
  };

  membershipTypeView = () => {
    let membershipTypesData = this.props.competitionFeesState.defaultCompFeesMembershipProduct;
    let membershipProductArray = membershipTypesData !== null ? membershipTypesData : [];
    return (
      <div className="fees-view pt-5">
        <span className="form-heading">{AppConstants.membershipType}</span>
        {membershipProductArray.length === 0 && (
          <span className="applicable-to-heading pt-0">{AppConstants.please_Sel_mem_pro}</span>
        )}

        {membershipProductArray.map(
          (item, index) =>
            item.isProductSelected && (
              <div key={index} className="prod-reg-inside-container-view">
                <span className="applicable-to-heading">{item.membershipProductName}</span>
                {this.membershipTypeInnerView(item, index)}
              </div>
            ),
        )}
      </div>
    );
  };

  //////add or remove another division in the division tab
  addRemoveDivision = (index, item, keyword) => {
    this.props.addRemoveDivisionAction(index, item, keyword);
    this.setDetailsFieldValue();
  };

  getRestrictionsOfTypes = products => {
    let restrictions = [];
    products.forEach(product => {
      if (product.isProductSelected) {
        const saveMembershipType = {
          name: product.membershipProductName,
          membershipProductUniqueKey: product.membershipProductUniqueKey,
          types: [],
        };

        saveMembershipType.types = product.membershipProductTypes.filter(
          type => type.isTypeSelected && type.isPlaying && type.fromDate && type.toDate,
        );

        if (saveMembershipType.types.length) {
          restrictions.push(saveMembershipType);
        }
      }
    });
    return restrictions;
  };

  divisionsView = () => {
    let divisionData = this.props.competitionFeesState.competitionDivisionsData;
    let divisionArray = divisionData !== null ? divisionData : [];
    let divisionsDisable = this.state.permissionState.divisionsDisable;
    let restrictionTypeMeta = this.props.commonReducerState.registrationTypeData;
    let detailsData = this.props.competitionFeesState.competitionDetailData;
    let membershipProductData = this.props.competitionFeesState.defaultCompFeesMembershipProduct;
    let membershipProductArray = membershipProductData !== null ? membershipProductData : [];
    const restrictionProducts = this.getRestrictionsOfTypes(membershipProductArray);
    return (
      <div className="fees-view pt-5">
        <span className="form-heading">{AppConstants.registrationDivisions}</span>
        {restrictionProducts.length > 0 && (
          <>
            <div className="form-heading">{AppConstants.membershipProductRestrictions}</div>
            {restrictionProducts.map((product, index) => (
              <div className={index !== 0 ? 'pt-5' : ''} key={index}>
                <div>
                  {AppConstants.membershipProductName}: {product.name}
                </div>
                <Table
                  className="fees-table"
                  columns={restrictionProductTypesTable}
                  dataSource={product.types}
                  pagination={false}
                />
              </div>
            ))}
          </>
        )}
        {divisionArray.length === 0 && (
          <span className="applicable-to-heading pt-0">{AppConstants.please_Sel_mem_pro}</span>
        )}
        {divisionArray.map((item, index) => (
          <div key={index}>
            <div className="inside-container-view">
              <span className="form-heading pt-2 pl-2">
                {item.membershipProductName}
                <span className="requiredSpan">*</span>
              </span>
              {item.isPlayingStatus ? (
                <div>
                  <div className="table-responsive home-dash-table-view table-competition">
                    <Table
                      className="fees-table"
                      columns={this.state.divisionTable}
                      dataSource={[...item.divisions]}
                      pagination={false}
                      Divider="false"
                      key={index}
                      scroll={{ x: 'calc(100%)' }}
                    />
                  </div>
                  <a>
                    <span
                      className="input-heading-add-another"
                      data-testid={AppUniqueId.ADD_REGISTRATION_DIVISIONS}
                      onClick={() =>
                        !divisionsDisable ? this.addRemoveDivision(index, item, 'add') : null
                      }
                    >
                      + {AppConstants.addRegDivision}
                    </span>
                  </a>
                </div>
              ) : (
                <span className="applicable-to-heading pt-0 pl-2">
                  {AppConstants.nonPlayerDivisionMessage}
                </span>
              )}
            </div>
          </div>
        ))}

        {this.state.showMultiDivisionRegistration && (
          <div className="inside-container-view">
            <span className="form-heading pl-2">{AppConstants.CompetitionRegistration}</span>
            <Radio.Group
              className="reg-competition-radio"
              disabled={!this.state.isCreatorEdit ? false : divisionsDisable}
              onChange={e =>
                this.props.add_editcompetitionFeeDeatils(
                  e.target.value,
                  'registrationRestrictionTypeRefId',
                )
              }
              value={
                detailsData.registrationRestrictionTypeRefId == null
                  ? 1
                  : detailsData.registrationRestrictionTypeRefId
              }
            >
              {restrictionTypeMeta.map(item => (
                <div
                  key={'registrationRestrictionTyped_' + item.id}
                  className="contextualHelp-RowDirection"
                >
                  <Radio
                    data-testid={AppUniqueId.REGISTRATION_RESTRICTION_TYPE.concat(item.id)}
                    key={'registrationRestrictionType_' + item.id}
                    value={item.id}
                  >
                    {' '}
                    {item.description}
                  </Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
        )}
      </div>
    );
  };

  ////// Edit fee details
  onChangeDetails(value, tableIndex, item, key, arrayKey) {
    this.props.add_editFee_deatialsScetion(value, tableIndex, item, key, arrayKey);
  }

  allowChangeDetails(value, tableIndex, item, key, arrayKey) {
    if (value.startsWith('-')) {
      if (!checkStripeCustomerAccount()) {
        message.error(AppConstants.setupWithdrawAccount);
        return;
      }
      let data = this.props.competitionFeesState.competionDiscountValue;
      let discountData =
        data && data.competitionDiscounts !== null ? data.competitionDiscounts[0].discounts : [];
      if (discountData.length > 0) {
        message.error(AppConstants.negativeFeeWithDiscount);
        return;
      }
    }
    this.props.add_editFee_deatialsScetion(value, tableIndex, item, key, arrayKey);
  }

  disableInvitee = inItem => {
    let orgLevelId = JSON.stringify(this.state.organisationTypeRefId);
    if (inItem.id == '2' && orgLevelId == '3') {
      return false;
    }
    if (inItem.id == '3' && orgLevelId == '4') {
      return false;
    }
    if (inItem.id == '2' && orgLevelId == '4') {
      return false;
    }
    // if (inItem.id == "7" && orgLevelId == "3") {
    //     return false
    // }
    // if (inItem.id == "8" && orgLevelId == "4") {
    //     return false
    // }
    // if (inItem.id == "7" && orgLevelId == "4") {
    //     return false
    // }
    return true;
  };

  affiliateSearchOnchange = affiliateOrgKey => {
    this.props.add_editcompetitionFeeDeatils(affiliateOrgKey, 'affiliateOrgKey');
  };

  onInviteeSearch = (value, inviteesType) => {
    this.props.onInviteesSearchAction(value, inviteesType);
  };

  // ////////reg invitees search view for any organisation
  // affiliatesSearchInvitee = (subItem) => {
  //     let detailsData = this.props.competitionFeesState
  //     let seletedInvitee = detailsData.selectedInvitees.find(x => x);
  //     let associationAffilites = detailsData.associationAffilites
  //     let clubAffilites = detailsData.clubAffilites
  //     let regInviteesDisable = this.state.permissionState.regInviteesDisable
  //     if (subItem.id == 7 && seletedInvitee == 7) {
  //         return (
  //             <div>
  //                 <Select
  //                     mode="multiple"
  //                     className="w-100"
  //                     style={{ paddingRight: 1, minWidth: 182 }}
  //                     onChange={associationAffilite => {
  //                         this.affiliateSearchOnchange(associationAffilite)
  //                     }}
  //                     value={detailsData.affiliateOrgSelected}
  //                     placeholder={AppConstants.selectOrganisation}
  //                     filterOption={false}
  //                     onSearch={(value) => {
  //                         this.onInviteeSearch(value, 3)
  //                     }}
  //                     disabled={regInviteesDisable}
  //                     showSearch
  //                     onBlur={() => this.onInviteeSearch("", 3)}
  //                     // loading={detailsData.searchLoad}
  //                 >
  //                     {associationAffilites.map((item) => (
  //                         <Option key={'organization_' + item.organisationId} value={item.organisationId}>
  //                             {item.name}
  //                         </Option>
  //                     ))}
  //                 </Select>
  //             </div>
  //         )
  //     } else if (subItem.id == 8 && seletedInvitee == 8) {
  //         return (
  //             <div>
  //                 <Select
  //                     mode="multiple"
  //                     className="w-100"
  //                     style={{ paddingRight: 1, minWidth: 182 }}
  //                     onChange={clubAffilite => {
  //                         // this.onSelectValues(venueSelection, detailsData)
  //                         this.affiliateSearchOnchange(clubAffilite)
  //                     }}
  //                     value={detailsData.affiliateOrgSelected}
  //                     placeholder={AppConstants.selectOrganisation}
  //                     filterOption={false}
  //                     // onSearch={(value) => { this.handleSearch(value, appState.mainVenueList) }}
  //                     onSearch={(value) => {
  //                         this.onInviteeSearch(value, 4)
  //                     }}
  //                     disabled={regInviteesDisable}
  //                     onBlur={() => this.onInviteeSearch("", 4)}
  //                     // loading={detailsData.searchLoad}
  //                 >
  //                     {clubAffilites.map((item) => (
  //                         <Option key={'organisation_' + item.organisationId} value={item.organisationId}>
  //                             {item.name}
  //                         </Option>
  //                     ))}
  //                 </Select>
  //             </div>
  //         )
  //     }
  // }

  // regInviteesView = () => {
  //     let invitees = this.props.appState.registrationInvitees.length > 0 ? this.props.appState.registrationInvitees : [];
  //     let detailsData = this.props.competitionFeesState
  //     let seletedInvitee = detailsData.selectedInvitees.find(x => x);
  //     let orgLevelId = JSON.stringify(this.state.organisationTypeRefId)
  //     let regInviteesDisable = this.state.permissionState.regInviteesDisable
  //     return (
  //         <div className="fees-view pt-5">
  //             <span className="form-heading required-field">{AppConstants.registrationInvitees}</span>
  //             <div>
  //                 <Radio.Group
  //                     className="reg-competition-radio"
  //                     disabled={regInviteesDisable}
  //                     onChange={(e) => this.onInviteesChange(e.target.value)}
  //                     value={seletedInvitee}
  //                 >
  //                     {(invitees || []).map((item, index) => (
  //                         <div key={item.id}>
  //                             {item.subReferences.length === 0 ? (
  //                                 <Radio value={item.id}>{item.description}</Radio>
  //                             ) : (
  //                                 <div>
  //                                     <div className="applicable-to-heading invitees-main">
  //                                         {orgLevelId == "4" && item.id == 1 ? "" : item.description}
  //                                     </div>
  //                                     {(item.subReferences).map((subItem) => (
  //                                         <div key={subItem.id}  style={{ marginLeft: 20 }}>
  //                                             {this.disableInvitee(subItem) && (
  //                                                 <Radio key={subItem.id} value={subItem.id}>{subItem.description}</Radio>
  //                                             )}
  //                                             {this.affiliatesSearchInvitee(subItem)}
  //                                         </div>
  //                                     ))}
  //                                 </div>
  //                             )}
  //                         </div>
  //                     ))}
  //                 </Radio.Group>
  //             </div>
  //         </div>
  //     );
  // };

  ////////reg invitees search view for any organisation
  affiliatesSearchInvitee = (subItem, seletedInvitee) => {
    let detailsData = this.props.competitionFeesState;
    let associationAffilites = detailsData.associationAffilites;
    let clubAffilites = detailsData.clubAffilites;
    const { associationLeague, clubSchool, associationChecked, clubChecked } =
      this.props.competitionFeesState;
    let regInviteesDisable = this.state.permissionState.regInviteesDisable;

    if (subItem?.id == 7 && associationChecked) {
      return (
        <div>
          <Select
            mode="multiple"
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            onChange={associationAffilite => {
              this.props.add_editcompetitionFeeDeatils(associationAffilite, 'associationAffilite');
            }}
            value={associationLeague}
            placeholder={AppConstants.selectOrganisation}
            filterOption={false}
            onSearch={value => {
              this.onInviteeSearch(value, 3);
            }}
            disabled={regInviteesDisable}
            showSearch
            onBlur={() =>
              isArrayNotEmpty(associationAffilites) == false ? this.onInviteeSearch('', 3) : null
            }
            onFocus={() =>
              isArrayNotEmpty(associationAffilites) == false ? this.onInviteeSearch('', 3) : null
            }
            loading={detailsData.searchLoad}
          >
            {associationAffilites.map(item => (
              <Option key={'organisation_' + item.organisationId} value={item.organisationId}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      );
    } else if (subItem?.id == 8 && clubChecked) {
      return (
        <div>
          <Select
            mode="multiple"
            className="w-100"
            style={{ paddingRight: 1, minWidth: 182 }}
            onChange={clubAffilite => {
              // this.onSelectValues(venueSelection, detailsData)
              this.props.add_editcompetitionFeeDeatils(clubAffilite, 'clubAffilite');
            }}
            value={clubSchool}
            placeholder={AppConstants.selectOrganisation}
            filterOption={false}
            onSearch={value => {
              this.onInviteeSearch(value, 4);
            }}
            disabled={regInviteesDisable}
            // onBlur={() => this.onInviteeSearch('', 4)}
            onBlur={() =>
              isArrayNotEmpty(clubAffilites) == false ? this.onInviteeSearch('', 4) : null
            }
            onFocus={() =>
              isArrayNotEmpty(clubAffilites) == false ? this.onInviteeSearch('', 4) : null
            }
            loading={detailsData.searchLoad}
          >
            {clubAffilites.map(item => (
              <Option key={'organisation_' + item.organisationId} value={item.organisationId}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      );
    }
  };
  handleAddInvites = () => {
    this.setState({ isAddInvitesModalVisible: true });
  };
  setFormState = state => {
    this.setState(state);
  };

  clickShowTutorialVideo = () => {
    this.setState({ openShowTutorial: true });
  };

  handleTutorialVideoModal = () => {
    this.setState({ openShowTutorial: false });
  };

  showTutorialVideo = button => {
    const tutorial = TutorialConstants.find(t => t.name === 'registrationCompetitionFee');

    if (this.state.openShowTutorial === false) {
      return <></>;
    }

    return (
      <Modal
        className="add-membership-type-modal"
        visible={this.state.openShowTutorial}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        onOk={() => this.handleTutorialVideoModal('ok')}
        onCancel={() => this.handleTutorialVideoModal('cancel')}
        width={800}
        closable={false}
        centered
        footer={null}
        bodyStyle={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '10px',
        }}
      >
        <ReactPlayer
          url={tutorial.videoUrl}
          width="100%"
          height="calc(100vh - 300px)"
          playing={this.state.openShowTutorial}
          controls
        />
      </Modal>
    );
  };

  regInviteesView = () => {
    let invitees =
      this.props.appState.registrationInvitees.length > 0
        ? this.props.appState.registrationInvitees
        : [];
    const {
      affiliateSelected,
      anyOrgSelected,
      otherSelected,
      affiliateNonSelected,
      anyOrgNonSelected,
      associationChecked,
      clubChecked,
      competitionDetailData,
    } = this.props.competitionFeesState;
    let orgLevelId = JSON.stringify(this.state.organisationTypeRefId);
    let regInviteesDisable = this.state.permissionState.regInviteesDisable;
    let isAffiliateEdit = this.state.isCreatorEdit;
    return (
      <div className="fees-view pt-5">
        <div className="contextualHelp-RowDirection">
          <span className="form-heading required-field">{AppConstants.registrationInvitees}</span>
          <div className="mt-2 ml-2">
            <img
              id="question_icon"
              src={AppImages.questionIcon}
              alt=""
              onClick={() => this.clickShowTutorialVideo()}
              width={'25px'}
              height={'25px'}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
        <div>
          <Radio.Group
            className="d-flex flex-wrap"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'affiliateSelected')
            }
            disabled={regInviteesDisable}
            value={affiliateSelected}
          >
            {(invitees || []).map(
              (item, index) =>
                index === 0 && (
                  <div key={item.id}>
                    {item.subReferences.length === 0 ? (
                      <Radio value={item.id}>{item.description}</Radio>
                    ) : (
                      <div>
                        {(orgLevelId == '4' && item.id == 1) == false && (
                          <div className="contextualHelp-RowDirection">
                            <div className="applicable-to-heading invitees-main">
                              {item.description}
                            </div>
                            <div className="mt-2">
                              <CustomToolTip>
                                <span>{item.helpMsg}</span>
                              </CustomToolTip>
                            </div>
                          </div>
                        )}
                        {item.subReferences.map(subItem =>
                          subItem.id == 2 ? (
                            <div key={'i' + subItem.id} style={{ marginLeft: 20 }}>
                              {this.disableInvitee(subItem) && (
                                <Radio
                                  key={subItem.id}
                                  value={subItem.id}
                                  data-testid={AppUniqueId.LEVEL_1_AFFILIATE}
                                >
                                  {subItem.description}
                                </Radio>
                              )}
                            </div>
                          ) : (
                            <React.Fragment key={'i' + subItem.id}>
                              <div style={{ marginLeft: 20 }}>
                                {this.disableInvitee(subItem) && (
                                  <Radio
                                    data-testid={
                                      AppUniqueId.REGISTRATION_INVITEES_2ND_LEVEL_AFFILIATES
                                    }
                                    key={subItem.id}
                                    value={subItem.id}
                                  >
                                    {subItem.description}
                                  </Radio>
                                )}
                              </div>
                              <div style={{ marginLeft: 20 }}>
                                {this.disableInvitee(subItem) && (
                                  <Radio.Group
                                    onChange={e =>
                                      this.props.add_editcompetitionFeeDeatils(
                                        e.target.value,
                                        'affiliateNonSelected',
                                      )
                                    }
                                    disabled={regInviteesDisable}
                                    value={affiliateNonSelected}
                                  >
                                    <Radio
                                      key="none1"
                                      value="none1"
                                      data-testid={AppUniqueId.AFFILIATE_NONE}
                                    >
                                      None
                                    </Radio>
                                  </Radio.Group>
                                )}
                              </div>
                            </React.Fragment>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ),
            )}
          </Radio.Group>

          <Radio.Group
            className="reg-competition-radio mt-0"
            // onChange={(e) => this.onInviteesChange(e.target.value)}
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'anyOrgSelected')
            }
            value={anyOrgSelected}
            disabled={regInviteesDisable}
          >
            {(invitees || []).map(
              (item, index) =>
                index === 1 && (
                  <div key={item.id}>
                    {item.subReferences.length === 0 ? (
                      <Radio value={item.id}>{item.description}</Radio>
                    ) : (
                      <div>
                        <div className="contextualHelp-RowDirection">
                          <div className="applicable-to-heading invitees-main">
                            {item.description}
                          </div>
                          <div className="mt-2">
                            <CustomToolTip>
                              <span>{item.helpMsg}</span>
                            </CustomToolTip>
                          </div>
                        </div>
                        {/* {item.subReferences.map((subItem) => (
                                                <div style={{ marginLeft: 20 }}>
                                                    <Radio key={subItem.id} value={subItem.id}>
                                                        {subItem.description}
                                                    </Radio>
                                                    {this.affiliatesSearchInvitee(subItem, anyOrgSelected)}
                                                </div>
                                            ))} */}
                        <div className="d-flex flex-column" style={{ paddingLeft: 20 }}>
                          <Checkbox
                            disabled={regInviteesDisable}
                            className="single-checkbox-radio-style"
                            style={{ paddingTop: 8 }}
                            checked={associationChecked}
                            data-testid={AppUniqueId.ORG_ASSOCIATION}
                            onChange={e =>
                              this.props.add_editcompetitionFeeDeatils(
                                e.target.checked,
                                'associationChecked',
                              )
                            }
                          >
                            {item.subReferences[0].description}
                          </Checkbox>

                          {this.affiliatesSearchInvitee(item.subReferences[0], anyOrgSelected)}

                          <Checkbox
                            disabled={regInviteesDisable}
                            className="single-checkbox-radio-style ml-0"
                            style={{ paddingTop: 13 }}
                            checked={clubChecked}
                            data-testid={AppUniqueId.ORG_CLUB_SCHOOL}
                            onChange={e =>
                              this.props.add_editcompetitionFeeDeatils(
                                e.target.checked,
                                'clubChecked',
                              )
                            }
                          >
                            {item.subReferences[1].description}
                          </Checkbox>

                          {this.affiliatesSearchInvitee(item.subReferences[1], anyOrgSelected)}
                        </div>

                        <div style={{ marginLeft: 20 }}>
                          <Radio.Group
                            onChange={e =>
                              this.props.add_editcompetitionFeeDeatils(
                                e.target.value,
                                'anyOrgNonSelected',
                              )
                            }
                            value={anyOrgNonSelected}
                            disabled={regInviteesDisable}
                          >
                            <Radio key="none2" value="none2" data-testid={AppUniqueId.ORG_NONE}>
                              None
                            </Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    )}
                  </div>
                ),
            )}
          </Radio.Group>

          <Radio.Group
            className="reg-competition-radio mt-0"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'otherSelected')
            }
            disabled={regInviteesDisable}
            value={otherSelected}
          >
            {(invitees || []).map(
              (item, index) =>
                index > 1 && (
                  <div key={item.id}>
                    {item.subReferences.length === 0 ? (
                      <div className="contextualHelp-RowDirection">
                        <Radio
                          value={item.id}
                          data-testid={AppUniqueId.REGISTRATION_INVITEES_DIRECT}
                        >
                          {item.description}
                        </Radio>
                        <div className="ml-n20 mt-2">
                          <CustomToolTip>
                            <span>{item.helpMsg}</span>
                          </CustomToolTip>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="applicable-to-heading invitees-main">
                          {item.description}
                        </div>
                        {item.subReferences.map(subItem => (
                          <div key={subItem.id} style={{ marginLeft: 20 }}>
                            <Radio
                              disabled={regInviteesDisable}
                              onChange={e =>
                                this.props.add_editcompetitionFeeDeatils(e.target.value, 'none')
                              }
                              key={subItem.id}
                              value={subItem.id}
                            >
                              {subItem.description}
                            </Radio>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
            )}
          </Radio.Group>
        </div>
        {competitionDetailData.statusRefId === 2 && !otherSelected && !isAffiliateEdit && (
          <Button
            key="add invites"
            className="mt-5 ant-btn ant-btn-primary"
            onClick={this.handleAddInvites}
          >
            {AppConstants.addInvitees}
          </Button>
        )}
      </div>
    );
  };

  //////charity voucher view
  charityVoucherView = () => {
    let charityRoundUp = this.props.competitionFeesState.charityRoundUp;
    // let paymentData = this.props.competitionFeesState.competitionPaymentsData;
    let paymentsDisable = this.state.permissionState.paymentsDisable;
    let checkCharityArray = this.props.competitionFeesState.competitionPaymentsData.charityRoundUp;
    return (
      <div className="advanced-setting-view pt-5">
        <div className="contextualHelp-RowDirection">
          <span className="form-heading">{AppConstants.charityRoundUp}</span>
          <div className="mt-4">
            <CustomToolTip placement="top">
              <span>{AppConstants.charityRoundUpMsg}</span>
            </CustomToolTip>
          </div>
        </div>
        <div className="inside-container-view">
          {charityRoundUp.map((item, index) => {
            return (
              <div className="row">
                <Checkbox
                  className="single-checkbox mt-3"
                  checked={item.isSelected}
                  onChange={e => this.onChangeCharity(e.target.checked, index, 'charityRoundUp')}
                  disabled={paymentsDisable}
                >
                  {item.description}
                </Checkbox>
              </div>
            );
          })}
        </div>

        {checkCharityArray.length > 0 && (
          <div>
            <Form.Item
              name="charityTitle"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.charityTitleNameIsRequired,
                },
              ]}
            >
              <InputWithHead
                auto_complete="new-title"
                heading={AppConstants.title}
                placeholder={AppConstants.title}
                // value={charityTitle}
                disabled={paymentsDisable}
                onChange={e =>
                  this.props.updatePaymentOption(captializedString(e.target.value), null, 'title')
                }
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    charityTitle: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
            <InputWithHead heading={AppConstants.description} />
            <Form.Item
              name="charityDescription"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.charityDescriptionIsRequired,
                },
              ]}
            >
              <TextArea
                placeholder={AppConstants.addCharityDescription}
                allowClear
                // value={charityDescription}
                onChange={e => this.props.updatePaymentOption(e.target.value, null, 'description')}
                disabled={paymentsDisable}
              />
            </Form.Item>
          </div>
        )}
      </div>
    );
  };

  //  for change the charity round up
  onChangeCharity(value, index, keyword) {
    this.props.updatePaymentOption(value, index, keyword);
  }

  onChangeGovtVoucher(value, index, keyword) {
    if (value) {
      if (!checkStripeCustomerAccount()) {
        message.error(AppConstants.setupWithdrawAccount);
        return;
      }
    }
    this.props.updatePaymentOption(value, index, keyword);
  }
  ////government voucher view
  voucherView = () => {
    let govtVoucher = this.props.competitionFeesState.govtVoucher;
    // let discountDisable = this.state.permissionState.discountsDisable;
    let voucherDisable = this.state.permissionState.voucherDisable;
    return (
      <div className="advanced-setting-view pt-5">
        <span className="form-heading">{AppConstants.governmentVouchers}</span>
        <span>{AppConstants.governmentVoucherNote}</span>
        <div className="inside-container-view">
          {govtVoucher.map((item, index) => (
            <div className="row" key={index}>
              <Checkbox
                className="single-checkbox mt-3"
                data-testid={AppUniqueId.GOVERNMENT_VOUCHERS + index}
                checked={item.isSelected}
                onChange={e =>
                  this.onChangeGovtVoucher(e.target.checked, index, 'govermentVouchers')
                }
                disabled={voucherDisable}
              >
                {item.description}
              </Checkbox>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //onChange membership type discount
  onChangeMembershipTypeDiscount = (discountMembershipType, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].competitionMembershipProductTypeId = discountMembershipType;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////add or remove  discount in discount section
  addRemoveDiscount = (keyAction, index) => {
    this.props.addRemoveCompFeeDiscountAction(keyAction, index);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 300);
  };

  //On change membership product discount type
  onChangeMembershipProductDisType = (discountType, index) => {
    this.setState({ isFamilyDiscountType: discountType == 3 ? true : false });
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].competitionTypeDiscountTypeRefId = discountType;
    this.props.updatedDiscountDataAction(discountData);
    if (discountType == 3) {
      if (isArrayNotEmpty(discountData[index].childDiscounts) == false) {
        this.addRemoveChildDiscount(index, 'add', -1);
      }
    }
  };

  discountTypeDesc = desc => {
    const { isFamilyDiscountType } = this.state;
    if (isFamilyDiscountType) {
      return desc.split('(')[0];
    } else {
      return desc;
    }
  };

  discountViewChange = (item, index) => {
    let childDiscounts =
      item.childDiscounts !== null && item.childDiscounts.length > 0 ? item.childDiscounts : [];
    // let discountsDisable = this.state.permissionState.discountsDisable
    switch (item.competitionTypeDiscountTypeRefId) {
      case 1:
        return (
          <div>
            <InputWithHead heading="Discount Type" />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={discountType => this.onChangeDiscountRefId(discountType, index)}
              placeholder="Select"
              value={item.discountTypeRefId}
              disabled={this.checkDiscountDisable(item.organisationId)}
            >
              {this.props.appState.commonDiscountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {this.discountTypeDesc(item.description)}
                </Option>
              ))}
            </Select>
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.percentageOff_FixedAmount} />
                <Input
                  type="number"
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.percentageOff_FixedAmount}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                  suffix={item.discountTypeRefId === 1 ? '' : '%'}
                  prefix={item.discountTypeRefId === 1 ? '$' : ''}
                  onChange={e =>
                    this.onChangePercentageOffOrFixedAmount(e, item.discountTypeRefId, index)
                  }
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-description"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                />
              </div>
            </div>
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    size="default"
                    placeholder="dd-mm-yyyy"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableFrom !== null && moment(item.availableFrom)}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    size="default"
                    placeholder="dd-mm-yyyy"
                    className="w-100"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableTo !== null && moment(item.availableTo)}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <InputWithHead heading="Discount Type" />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={discountType => this.onChangeDiscountRefId(discountType, index)}
              placeholder="Select"
              value={item.discountTypeRefId}
              disabled={this.checkDiscountDisable(item.organisationId)}
            >
              {this.props.appState.commonDiscountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {this.discountTypeDesc(item.description)}
                </Option>
              ))}
            </Select>
            <InputWithHead
              auto_complete="new-code"
              heading={AppConstants.code}
              placeholder={AppConstants.code}
              onChange={e => this.onChangeDiscountCode(e.target.value, index)}
              value={item.discountCode}
              disabled={this.checkDiscountDisable(item.organisationId)}
            />
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.percentageOff_FixedAmount} />
                <Input
                  type="number"
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.percentageOff_FixedAmount}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                  suffix={item.discountTypeRefId === 1 ? '' : '%'}
                  prefix={item.discountTypeRefId === 1 ? '$' : ''}
                  onChange={e =>
                    this.onChangePercentageOffOrFixedAmount(e, item.discountTypeRefId, index)
                  }
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-description"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                />
              </div>
            </div>

            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    placeholder="dd-mm-yyyy"
                    size="default"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableFrom !== null ? moment(item.availableFrom) : null}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    placeholder="dd-mm-yyyy"
                    size="default"
                    className="w-100"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableTo !== null ? moment(item.availableTo) : null}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <InputWithHead heading="Discount Type" required="required-field" />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={discountType => this.onChangeDiscountRefId(discountType, index)}
              placeholder="Select"
              value={item.discountTypeRefId}
              disabled={this.checkDiscountDisable(item.organisationId)}
            >
              {this.props.appState.commonDiscountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {this.discountTypeDesc(item.description)}
                </Option>
              ))}
            </Select>
            {childDiscounts.map((childItem, childIndex) => (
              <div className="row">
                <div className="col-sm-10">
                  <Form.Item
                    name={`percentageValue${index}${childIndex}`}
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.pleaseEnterChildDiscountPercentage,
                      },
                      {
                        validator: (_, value) => {
                          const invalidValue =
                            Number(value) < 0 ||
                            (item.discountTypeRefId === DiscountType.Percentage
                              ? Number(value) > 100
                              : false);
                          if (invalidValue) {
                            return Promise.reject(
                              new Error(ValidationConstants.invalidDiscountAmount),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputWithHead
                      required="required-field"
                      auto_complete="new-child"
                      heading={`Family Participant ${childIndex + 1} discount`}
                      placeholder={`Family Participant ${childIndex + 1} discount`}
                      onChange={e => {
                        this.onChangeChildPercent(e.target.value, index, childIndex, childItem);
                      }}
                      // value={childItem.percentageValue}
                      disabled={this.checkDiscountDisable(item.organisationId)}
                      type="number"
                    />
                  </Form.Item>
                </div>
                {childIndex > 0 && (
                  <div
                    className="col-sm-2 delete-image-view pb-4"
                    onClick={() =>
                      !this.checkDiscountDisable(item.organisationId)
                        ? this.addRemoveChildDiscount(index, 'delete', childIndex)
                        : null
                    }
                  >
                    <span className="user-remove-btn">
                      <i className="fa fa-trash-o" aria-hidden="true" />
                    </span>
                    <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
                  </div>
                )}
              </div>
            ))}

            {!this.checkDiscountDisable(item.organisationId) && (
              <span
                className="input-heading-add-another"
                onClick={() => this.addRemoveChildDiscount(index, 'add', -1)}
                // onClick={() =>
                //     !this.checkDiscountDisable(item.organisationId)
                //         ? this.addRemoveChildDiscount(index, 'add', -1)
                //         : null
                // }
              >
                + {AppConstants.addChild}
              </span>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <InputWithHead heading="Discount Type" />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={discountType => this.onChangeDiscountRefId(discountType, index)}
              placeholder="Select"
              value={item.discountTypeRefId}
              disabled={this.checkDiscountDisable(item.organisationId)}
            >
              {this.props.appState.commonDiscountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {this.discountTypeDesc(item.description)}
                </Option>
              ))}
            </Select>
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.percentageOff_FixedAmount} />
                <Input
                  type="number"
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.percentageOff_FixedAmount}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                  suffix={item.discountTypeRefId === 1 ? '' : '%'}
                  prefix={item.discountTypeRefId === 1 ? '$' : ''}
                  onChange={e =>
                    this.onChangePercentageOffOrFixedAmount(e, item.discountTypeRefId, index)
                  }
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-gernalDiscount"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                />
              </div>
            </div>

            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    placeholder="dd-mm-yyyy"
                    size="default"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableFrom !== null && moment(item.availableFrom)}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    placeholder="dd-mm-yyyy"
                    size="default"
                    className="w-100"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableTo !== null && moment(item.availableTo)}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <InputWithHead
              auto_complete="new-description"
              heading={AppConstants.description}
              placeholder={AppConstants.description}
              onChange={e => this.onChangeDescription(e.target.value, index)}
              value={item.description}
              disabled={this.checkDiscountDisable(item.organisationId)}
            />
            <InputWithHead
              auto_complete="new-question"
              heading={AppConstants.question}
              placeholder={AppConstants.question}
              onChange={e => this.onChangeQuestion(e.target.value, index)}
              value={item.question}
              disabled={this.checkDiscountDisable(item.organisationId)}
            />
            <InputWithHead heading={'Apply Discount if Answer is Yes'} />
            <Radio.Group
              className="reg-competition-radio"
              onChange={e => this.applyDiscountQuestionCheck(e.target.value, index)}
              value={JSON.stringify(JSON.parse(item.applyDiscount))}
              disabled={this.checkDiscountDisable(item.organisationId)}
            >
              <Radio value="1">{AppConstants.yes}</Radio>
              <Radio value="0">{AppConstants.no}</Radio>
            </Radio.Group>
          </div>
        );

      default:
        return <div />;
    }
  };

  addRemoveChildDiscount = (index, keyWord, childIndex) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;

    let childDisObject = {
      membershipFeesChildDiscountId: 0,
      percentageValue: '',
    };

    if (keyWord === 'add') {
      if (discountData[index].childDiscounts == null) {
        discountData[index].childDiscounts = [];
      }
      discountData[index].childDiscounts.push(childDisObject);
    } else if (keyWord === 'delete') {
      discountData[index].childDiscounts.splice(childIndex, 1);
    }
    this.props.updatedDiscountDataAction(discountData);
    if (keyWord === 'delete') {
      setTimeout(() => {
        this.setDetailsFieldValue();
      }, 300);
    }
  };

  ////////onchange apply discount question radio button
  applyDiscountQuestionCheck = (applyDiscount, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].applyDiscount = applyDiscount;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///////child  onchange in discount section
  onChangeChildPercent = (childPercent, index, childindex, childItem) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].childDiscounts[childindex].percentageValue = childPercent;
    discountData[index].childDiscounts[childindex].membershipFeesChildDiscountId =
      childItem.membershipFeesChildDiscountId;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///onchange question in case of custom discount
  onChangeQuestion = (question, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].question = question;
    this.props.updatedDiscountDataAction(discountData);
  };

  /////onChange discount refId
  onChangeDiscountRefId = (discountType, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].discountTypeRefId = discountType;
    discountData[index].amount = 0;
    this.props.updatedDiscountDataAction(discountData);
  };

  //////onchange discount code
  onChangeDiscountCode = (discountCode, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].discountCode = discountCode;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///onchange on text field percentage off
  onChangePercentageOffOrFixedAmount = (e, discountTypeRefId, index) => {
    let amount = isNaN(parseFloat(e.target.value)) ? 0.0 : parseFloat(e.target.value);
    if (discountTypeRefId === 2) {
      if (amount > 100 || amount < 0) {
        e.preventDefault();
        return;
      }
    }
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    if (discountData[index].competitionTypeDiscountTypeRefId === 2 && discountTypeRefId === 1) {
      let feeDetails = this.props.competitionFeesState.competitionFeesData;
      let isOrganiser = isCompetitionOrganiser(
        this.props.competitionFeesState.competitionDetailData.competitionCreatorOrgUniqueKey,
      );
      let affFee = getCompetitionSeasonFee(
        feeDetails,
        discountData[index].membershipProductUniqueKey,
        discountData[index].competitionMembershipProductTypeId,
        isOrganiser,
      );
      if (amount > affFee && !checkStripeCustomerAccount()) {
        e.preventDefault();
        message.error(AppConstants.setupWithdrawAccount);
        return;
      }
    }
    discountData[index].amount = amount;
    this.props.updatedDiscountDataAction(discountData);
  };

  /////onChange discount description
  onChangeDescription = (description, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].description = description;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////discount available from on change
  onChangeDiscountAvailableFrom = (date, index) => {
    let fromDate = moment(date).format('YYYY-MM-DD');
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].availableFrom = fromDate;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////discount available to on change
  onChangeDiscountAvailableTo = (date, index) => {
    let toDate = moment(date).format('YYYY-MM-DD');
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].availableTo = toDate;
    this.props.updatedDiscountDataAction(discountData);
  };

  //discount membership product change
  onChangeMembershipProduct = (data, options, index) => {
    let discountData =
      this.props.competitionFeesState.competionDiscountValue.competitionDiscounts[0].discounts;
    discountData[index].membershipProductUniqueKey = data;
    discountData[index].competitionMembershipProductId = options.competitionMembershipProductId
      ? options.competitionMembershipProductId
      : null;
    this.props.updatedDiscountMemberPrd(data, discountData, index);
    setTimeout(() => {
      this.setDetailsFieldValue();
    }, 600);
  };

  ////to check discount fields would be enable or disable
  checkDiscountDisable = organisationId => {
    let discountsDisable = this.state.permissionState.discountsDisable;
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let currentOrganisationId = orgData ? orgData.organisationId : 0;
    if (discountsDisable == false) {
      if (currentOrganisationId == organisationId) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  ////discount view inside the content
  discountView = getFieldDecorator => {
    let data = this.props.competitionFeesState.competionDiscountValue;
    let discountData =
      data && data.competitionDiscounts !== null ? data.competitionDiscounts[0].discounts : [];
    let membershipPrdArr =
      this.props.competitionFeesState.competitionMembershipProductData !== null
        ? this.props.competitionFeesState.competitionMembershipProductData
        : [];
    let discountsDisable = this.state.permissionState.discountsDisable;
    let feesData = this.props.competitionFeesState.competitionFeesData;
    let hasNegativeFee = checkHasNegativeFee(feesData);
    discountsDisable = discountsDisable || hasNegativeFee;
    const getIsFamily = index => {
      const isFamilyDiscount =
        discountData[index]?.competitionTypeDiscountTypeRefId === CompetitionDiscountType.Family;
      return isFamilyDiscount;
    };

    return (
      <div className="discount-view pt-5">
        <div className="contextualHelp-RowDirection">
          <span className="form-heading">{AppConstants.discounts}</span>
          <div className="mt-2">
            <CustomToolTip placement="bottom">
              <span>{AppConstants.discountMsg}</span>
            </CustomToolTip>
          </div>
        </div>
        <div>
          <span>{AppConstants.discountNote}</span>
        </div>
        {(discountData || []).map((item, index) => (
          <div key={index} className="prod-reg-inside-container-view">
            {!this.checkDiscountDisable(item.organisationId) && (
              <div
                className="transfer-image-view pt-2"
                onClick={() => this.addRemoveDiscount('remove', index)}
                // onClick={() =>
                //     !this.checkDiscountDisable(item.organisationId)
                //         ? this.addRemoveDiscount('remove', index)
                //         : null
                // }
              >
                <div className="pointer">
                  <span className="user-remove-btn">
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </span>
                  <span className="user-remove-text mr-0">{AppConstants.remove}</span>
                </div>
              </div>
            )}
            <div className={!this.checkDiscountDisable(item.organisationId) ? 'row' : 'row mt-5'}>
              <div className="col-sm">
                <InputWithHead required="required-field pt-0" heading="Discount Type" />
                <Form.Item
                  name={`competitionTypeDiscountTypeRefId${index}`}
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.pleaseSelectDiscountType,
                    },
                  ]}
                >
                  <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={discountTypeItem =>
                      this.onChangeMembershipProductDisType(discountTypeItem, index)
                    }
                    placeholder="Select"
                    // value={item.competitionTypeDiscountTypeRefId !== 0 && item.competitionTypeDiscountTypeRefId}
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  >
                    {this.props.competitionFeesState.defaultDiscountType.map(discountTypeItem => (
                      <Option
                        key={'discountType_' + discountTypeItem.id}
                        value={discountTypeItem.id}
                      >
                        {discountTypeItem.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="col-sm">
                <InputWithHead
                  required="required-field pt-0"
                  heading={AppConstants.membershipProduct}
                />
                <Form.Item
                  name={`membershipProductUniqueKey${index}`}
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.pleaseSelectMembershipProduct,
                    },
                  ]}
                >
                  <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    placeholder="Select"
                    // value={item.membershipProductUniqueKey}
                    onChange={(membershipProductTypeItem, options) =>
                      this.onChangeMembershipProduct(membershipProductTypeItem, options, index)
                    }
                    disabled={this.checkDiscountDisable(item.organisationId)}
                  >
                    {membershipPrdArr &&
                      membershipPrdArr.membershipProducts &&
                      membershipPrdArr.membershipProducts.map(item => (
                        <Option
                          key={'product_' + item.membershipProductUniqueKey}
                          value={item.membershipProductUniqueKey}
                          competitionMembershipProductId={item.competitionMembershipProductId}
                        >
                          {item.membershipProductName}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div>
              <InputWithHead
                heading={AppConstants.membershipTypes}
                required={`${getIsFamily(index) ? '' : 'required-field'}`}
              />
              <Form.Item
                name={`competitionMembershipProductTypeId${index}`}
                rules={
                  getIsFamily(index)
                    ? []
                    : [
                        {
                          required: true,
                          message: ValidationConstants.pleaseSelectMembershipTypes,
                        },
                      ]
                }
              >
                <Select
                  className="w-100"
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={discountMembershipType =>
                    this.onChangeMembershipTypeDiscount(discountMembershipType, index)
                  }
                  allowClear={true}
                  onClear={() => this.onChangeMembershipTypeDiscount(null, index)}
                  placeholder="Select"
                  // value={item.competitionMembershipProductTypeId}
                  disabled={this.checkDiscountDisable(item.organisationId)}
                >
                  {(item.membershipProductTypes || []).map(item => (
                    <Option
                      key={'productType_' + item.competitionMembershipProductTypeId}
                      value={item.competitionMembershipProductTypeId}
                    >
                      {item.membershipProductTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            {this.discountViewChange(item, index, getFieldDecorator)}
          </div>
        ))}

        <span
          className={'input-heading-add-another ' + (discountsDisable ? 'disabled' : '')}
          onClick={() => (!discountsDisable ? this.addRemoveDiscount('add', -1) : null)}
        >
          + {AppConstants.addDiscount}
        </span>
      </div>
    );
  };

  //////delete the membership product
  showDeleteConfirm = () => {
    let competitionId = this.props.competitionFeesState.competitionId;
    let this_ = this;
    confirm({
      title: AppConstants.productDeleteConfirmMsg,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        if (competitionId.length > 0) {
          this_.deleteProduct(competitionId);
        }
      },
      onCancel() {},
    });
  };

  deleteProduct = competitionId => {
    this.setState({ loading: true, buttonPressed: 'delete' });
    this.props.regCompetitionListDeleteAction(competitionId);
  };

  buttonShowView() {
    if (this.state.isCreatorEdit) {
      return false;
    } else {
      return true;
    }
  }

  ////////next button view for navigation
  nextButtonView = () => {
    let tabKey = this.state.competitionTabKey;
    // let competitionId = this.props.competitionFeesState.competitionId;
    let isPublished = this.state.permissionState.isPublished;
    // let allDisable = this.state.permissionState.allDisable;
    return (
      <Button
        className="publish-button marginLeft24 margin-top-disabled-button"
        data-testid={AppUniqueId.NEXT_BUTTON}
        type="primary"
        // disabled={allDisable}
        htmlType="submit"
        onClick={() =>
          this.setState({
            statusRefId: tabKey == TabKey.Discount && isPublished ? 3 : 2,
            buttonPressed: tabKey == TabKey.Discount ? 'register' : 'fees',
          })
        }
      >
        {AppConstants.next}
      </Button>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let competitionFeesState = this.props.competitionFeesState;
    let tabKey = this.state.competitionTabKey;
    let competitionId = competitionFeesState.competitionId;
    let isPublished = this.state.permissionState.isPublished;
    let allDisable = this.state.permissionState.allDisable;
    let isCreatorEdit = this.state.isCreatorEdit;
    let invitees = competitionFeesState.competitionDetailData.invitees;
    let directComp = isArrayNotEmpty(invitees) ? invitees[0].registrationInviteesRefId == 5 : false;

    return (
      <div className="fluid-width">
        <div className="footer-view">
          {this.buttonShowView() ? (
            <div className="row">
              <div className="col-sm">
                <div className="reg-add-save-button">
                  {competitionId && (
                    <Tooltip
                      className="h-100"
                      onMouseEnter={() =>
                        this.setState({
                          tooltipVisibleDelete: isPublished,
                        })
                      }
                      onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                      visible={this.state.tooltipVisibleDelete}
                      title={ValidationConstants.compIsPublished}
                    >
                      <Button
                        disabled={isPublished}
                        type="cancel-button"
                        onClick={() => this.showDeleteConfirm()}
                      >
                        {AppConstants.delete}
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="col-sm">
                <div className="comp-buttons-view">
                  <Tooltip
                    className="h-100"
                    onMouseEnter={() =>
                      this.setState({
                        tooltipVisibleDraft: isPublished,
                      })
                    }
                    onMouseLeave={() => this.setState({ tooltipVisibleDraft: false })}
                    visible={this.state.tooltipVisibleDraft}
                    title={ValidationConstants.compIsPublished}
                  >
                    <Button
                      className="save-draft-text"
                      type="save-draft-text"
                      disabled={isPublished}
                      htmlType="submit"
                      onClick={() => this.setState({ statusRefId: 1, buttonPressed: 'save' })}
                    >
                      {AppConstants.saveAsDraft}
                    </Button>
                  </Tooltip>
                  <Tooltip
                    className="h-100"
                    onMouseEnter={() =>
                      this.setState({
                        tooltipVisiblePublish:
                          isPublished && tabKey === TabKey.Membership ? true : allDisable,
                      })
                    }
                    onMouseLeave={() => this.setState({ tooltipVisiblePublish: false })}
                    visible={this.state.tooltipVisiblePublish}
                    title={ValidationConstants.compIsPublished}
                  >
                    <Button
                      className="publish-button margin-top-disabled-button"
                      style={{ display: 'unset', width: '92.5px' }}
                      type="primary"
                      htmlType="submit"
                      data-testid={AppUniqueId.NEXT_BUTTON}
                      disabled={
                        tabKey === TabKey.Detail ||
                        tabKey === TabKey.Fee ||
                        tabKey === TabKey.Payment ||
                        tabKey === TabKey.Discount
                          ? allDisable
                          : tabKey === TabKey.Division
                          ? isCreatorEdit
                          : isPublished
                      }
                      onClick={() => {
                        if (tabKey == TabKey.Division && isPublished) {
                          this.setState({
                            buttonPressed: 'next',
                            statusRefId: 2,
                          });
                        } else {
                          this.setState({
                            statusRefId:
                              tabKey == TabKey.Discount && isPublished
                                ? 3
                                : tabKey == TabKey.Discount
                                ? 2
                                : 1,
                            buttonPressed: tabKey == TabKey.Discount ? 'publish' : 'next',
                          });
                        }
                      }}
                    >
                      {tabKey === TabKey.Discount && !isPublished
                        ? AppConstants.publish
                        : tabKey === TabKey.Discount && isPublished
                        ? AppConstants.save
                        : AppConstants.next}
                    </Button>
                  </Tooltip>
                  {tabKey == TabKey.Discount && directComp ? this.nextButtonView() : null}
                </div>
              </div>
            </div>
          ) : (
            (tabKey == TabKey.Fee || tabKey == TabKey.Discount || tabKey == TabKey.Payment) && (
              <div className="row">
                <div className="col-sm">
                  <div className="comp-buttons-view">
                    <Button
                      className="publish-button margin-top-disabled-button"
                      type="primary"
                      // disabled={allDisable}
                      htmlType="submit"
                      onClick={() =>
                        this.setState({
                          statusRefId: tabKey == TabKey.Discount && isPublished ? 3 : 2,
                          // buttonPressed: "publish"
                          buttonPressed: tabKey == TabKey.Discount ? 'publish' : 'next',
                        })
                      }
                    >
                      {AppConstants.save}
                    </Button>
                    {this.nextButtonView()}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  checkMembershipEmpty = key => {
    try {
      let finalmembershipProductTypes = JSON.parse(
        JSON.stringify(this.props.competitionFeesState.defaultCompFeesMembershipProduct),
      );
      let tempProductsArray = finalmembershipProductTypes.filter(
        data => data.isProductSelected === true,
      );
      finalmembershipProductTypes = tempProductsArray;
      for (let i in finalmembershipProductTypes) {
        var filterArray = finalmembershipProductTypes[i].membershipProductTypes.filter(
          data => data.isTypeSelected === true,
        );
        finalmembershipProductTypes[i].membershipProductTypes = filterArray;
      }
      let empty = false;
      let membershipDisable = this.state.permissionState.membershipDisable;
      if (this.state.competitionTabKey == TabKey.Membership && membershipDisable == false) {
        if (!isArrayNotEmpty(finalmembershipProductTypes)) {
          message.error(ValidationConstants.please_SelectMembership_Product);
          empty = true;
        } else if (isArrayNotEmpty(finalmembershipProductTypes)) {
          if (!isArrayNotEmpty(finalmembershipProductTypes[0].membershipProductTypes)) {
            message.error(ValidationConstants.please_SelectMembership_Product);
            empty = true;
          }
        }
      }
      let divisionsDisable = this.state.permissionState.divisionsDisable;
      if (this.state.competitionTabKey == TabKey.Division && divisionsDisable == false) {
        let compFeesState = this.props.competitionFeesState;
        let divisionArrayData = compFeesState.competitionDivisionsData;
        if (this.checkDivisionEmpty(divisionArrayData)) {
          message.error(ValidationConstants.pleaseAddDivisionForMembershipProduct);
          empty = true;
        }
      }
      if (this.state.competitionTabKey == TabKey.Fee) {
        empty = this.saveCompFeesApiCall('FromValidation');
      }
      if (this.state.competitionTabKey == TabKey.Payment) {
        let compFeesState = this.props.competitionFeesState;
        let competitionId = compFeesState.competitionId;
        empty = this.paymentApiCall(competitionId, 'FromValidation');
      }
      return empty;
    } catch (ex) {
      console.log('Error in checkMembershipCheckedOrNot::' + ex);
    }
  };

  tabCallBack = key => {
    const { competitionTabKey } = this.state;
    let competitionId = this.props.competitionFeesState.competitionId;
    if (competitionTabKey == TabKey.Fee) {
      if (this.feeRef) {
        let feeValidated = this.feeRef.validateForm();
        if (!feeValidated) return;
      }
    }
    if (competitionId !== null && competitionId.length > 0) {
      let empty = this.checkMembershipEmpty();
      if (empty == false) {
        this.tabCangeSaveApiActionCall(this.state.competitionTabKey);
      }
      let allowSwitchTab =
        empty == false ||
        (this.state.requireNominationForUponRegError &&
          this.state.competitionTabKey == TabKey.Payment);
      this.setState({
        competitionTabKey: allowSwitchTab ? key : this.state.competitionTabKey,
        divisionState: key == TabKey.Division,
      });
    }
    this.setDetailsFieldValue();
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  onFeeRef = ref => {
    this.feeRef = ref;
  };

  render() {
    let addInviteeModalProps = {
      ...this.props,
      isAddInvitesModalVisible: this.state.isAddInvitesModalVisible,
      yearRefId: this.state.yearRefId,
      setFormState: this.setFormState,
      affiliatesSearchInvitee: this.affiliatesSearchInvitee,
      onInviteeSearch: this.onInviteeSearch,
      getMembershipDetails: this.getMembershipDetails,
    };
    let paymentTabProps = {
      ...this.props,
      ...this.state,
      setFormState: this.setFormState,
    };
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />

        <InnerHorizontalMenu menu="registration" regSelectedKey="7" />

        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAPIsActionCall}
            noValidate="noValidate"
            onFinishFailed={this.onFinishFailed}
          >
            {this.headerView()}
            {/* {this.dropdownView()} */}

            <Content>
              <div className="tab-view" style={{ width: '75%' }}>
                <Tabs activeKey={this.state.competitionTabKey} onChange={this.tabCallBack}>
                  <TabPane tab={AppConstants.details} key={TabKey.Detail}>
                    <div className="tab-formView mt-5">{this.contentView()}</div>
                    <div className="tab-formView mt-5">{this.regInviteesView()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.membership} key={TabKey.Membership}>
                    <div className="tab-formView mt-5">{this.membershipProductView()}</div>
                    <div className="tab-formView mt-5">{this.membershipTypeView()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.registrationDivisions} key={TabKey.Division}>
                    <div className="tab-formView">{this.divisionsView()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.fees} key={TabKey.Fee}>
                    <div className="tab-formView">
                      <CompetitionFeeTab
                        competitionFeesState={this.props.competitionFeesState}
                        permissionState={this.state.permissionState}
                        checkUncheckcompetitionFeeSction={
                          this.props.checkUncheckcompetitionFeeSction
                        }
                        isCreatorEdit={this.state.isCreatorEdit}
                        this_Obj={this}
                        onRef={this.onFeeRef}
                      ></CompetitionFeeTab>
                    </div>
                  </TabPane>
                  <TabPane tab={AppConstants.payments} key={TabKey.Payment}>
                    <CompetitionPaymentTab {...paymentTabProps}></CompetitionPaymentTab>
                    {/* <div className="tab-formView">
                                            {this.charityVoucherView()}
                                        </div> */}
                  </TabPane>
                  <TabPane tab={AppConstants.discounts} key={TabKey.Discount}>
                    <div className="tab-formView">{this.discountView()}</div>
                    <div className="tab-formView">{this.voucherView()}</div>
                  </TabPane>
                </Tabs>
              </div>

              <Loader
                visible={this.props.competitionFeesState.onLoad || this.state.getDataLoading}
              />

              <AddInvitesModalView {...addInviteeModalProps}></AddInvitesModalView>
            </Content>

            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
        {this.showTutorialVideo()}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      competitionFeeInit,
      getVenuesTypeAction,
      getAllCompetitionFeesDeatilsAction,
      saveCompetitionFeesDetailsAction,
      saveCompetitionFeesMembershipTabAction,
      getDefaultCompFeesMembershipProductTabAction,
      membershipProductSelectedAction,
      membershipTypeSelectedAction,
      saveCompetitionFeesDivisionAction,
      divisionTableDataOnchangeAction,
      addRemoveDivisionAction,
      updatePaymentOption,
      updatePaymentFeeOption,
      paymentFeeDeafault,
      paymentSeasonalFee,
      paymentPerMatch,
      competitionPaymentApi,
      addRemoveCompFeeDiscountAction,
      add_editcompetitionFeeDeatils,
      checkUncheckcompetitionFeeSction,
      add_editFee_deatialsScetion,
      saveCompetitionFeeSection,
      competitionDiscountTypesAction,
      updatedDiscountDataAction,
      getCommonDiscountTypeTypeAction,
      updatedDiscountMemberPrd,
      regSaveCompetitionFeeDiscountAction,
      regCompetitionListDeleteAction,
      getDefaultCharity,
      getDefaultCompFeesLogoAction,
      getOnlyYearListAction,
      searchVenueList,
      clearFilter,
      clearCompReducerDataAction,
      getAffiliateToOrganisationAction,
      onInviteesSearchAction,
      registrationRestrictionTypeAction,
      fixtureTemplateRoundsAction,
      instalmentDateAction,
      paymentMethodsDefaultAction,
      getAffiliateOurOrganisationIdAction,
      add_inviteesToCompetitionFeeDetails,
      cancel_add_inviteesToCompetitionFeeDetails,
      saveAddedInviteesToCompetitionFeesDetails,
      getOrganisationSettingsAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFeesState: state.CompetitionFeesState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
    competitionManagementState: state.CompetitionManagementState,
    userState: state.UserState,
    homeDashboardState: state.HomeDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationCompetitionFee);

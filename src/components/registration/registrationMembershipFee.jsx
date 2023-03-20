import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { cloneDeep } from 'lodash';
import {
  getCurrentYear,
  getOrganisationLevel,
  routePermissionForMembership,
} from 'util/permissions';
import { FLAVOUR, OrganisationType, OrganisationTypeName, StatusEnum } from 'util/enums';
import { ValidityPeriodType } from 'enums/registrationEnums';
import {
  Layout,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Button,
  Table,
  Radio,
  Tabs,
  Form,
  Modal,
  message,
  Tooltip,
  InputNumber,
  Popover,
} from 'antd';
import CustomTooltip from 'react-png-tooltip';
import moment from 'moment';

import './product.scss';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import {
  getAllowTeamRegistrationTypeAction,
  membershipPaymentOptionAction,
} from '../../store/actions/commonAction/commonAction';
import {
  regGetMembershipProductDetailsAction,
  regSaveMembershipProductDetailsAction,
  regGetDefaultMembershipProductTypesAction,
  regSaveMembershipProductFeesAction,
  regSaveMembershipProductDiscountAction,
  membershipFeesTableInputChangeAction,
  membershipProductDiscountTypesAction,
  addNewMembershipTypeAction,
  addRemoveDiscountAction,
  updatedDiscountDataAction,
  membershipFeesApplyRadioAction,
  onChangeAgeCheckBoxAction,
  updatedMembershipTypeDataAction,
  removeCustomMembershipTypeAction,
  regMembershipListDeleteAction,
  onChangeMembershipProductCategoryType,
  onChangeApplyRegistrationDatesCheckbox,
  onChangeRegistrationDates,
  onChangeAllowAtMatchFeesCheckbox,
  clearRegistrationMembershipFeeForm,
  getParentMembershipProductsAction,
  onChangeParentMembershipProduct,
} from '../../store/actions/registrationAction/registration';
import {
  getOnlyYearListAction,
  getProductValidityListAction,
  getMembershipProductFeesTypeAction,
  getCommonDiscountTypeTypeAction,
  getMembershipProductCategoryTypesAction,
} from '../../store/actions/appAction';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import {
  isArrayNotEmpty,
  isNotNullOrEmptyString,
  captializedString,
  feeIsNull,
} from '../../util/helpers';
import Loader from '../../customComponents/loader';
import { getGlobalYear, getOrganisationData, setGlobalYear } from 'util/sessionStorage';
import registrationAxiosApi from '../../store/http/registrationHttp/registrationAxiosApi';
import {
  isFootball,
  isNationalProductEnabled,
  isProfessionalMembershipEnabled,
} from 'util/registrationHelper';
import MembershipTypeOptionsWrapper from './membershipTypeOptions/MembershipTypeOptionsWrapper';

const { Footer, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;
const UIDateFormat = 'DD-MM-YYYY';
const DBDateFormat = 'YYYY-MM-DD';

let this_Obj = null;

let orgLevelPrefix = '';
const orgItem = getOrganisationData();
if (orgItem) {
  if (isFootball) {
    orgLevelPrefix = ' ';
  } else if (orgItem.organisationTypeRefId == OrganisationType.State) {
    orgLevelPrefix = OrganisationTypeName.State + ' ';
  } else if (orgItem.organisationTypeRefId == OrganisationType.Association_League) {
    orgLevelPrefix = OrganisationTypeName.Association_League + ' ';
  }
}
const columns = [
  {
    title: AppConstants.type,
    dataIndex: 'membershipProductTypeRefName',
    key: 'membershipProductTypeRefName',
  },
  {
    title: AppConstants.membershipProduct,
    dataIndex: 'membershipProductName',
    key: 'membershipProductName',
  },
  {
    title: orgLevelPrefix + AppConstants.membershipFeesExclGst,
    dataIndex: 'seasonalFee',
    key: 'seasonalFee',
    filterDropdown: true,
    filterIcon: () => {
      return (
        <CustomTooltip placement="top">
          <span>{AppConstants.membershipSeasonalFeeMsg}</span>
        </CustomTooltip>
      );
    },
    render: (seasonalFee, record) => (
      <Input
        type="number"
        prefix="$"
        className="input-inside-table-fees"
        value={seasonalFee}
        onChange={e =>
          this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'seasonalFee')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'seasonalGst',
    key: 'seasonalGst',
    render: (seasonalFeeGst, record) => (
      <Input
        type="number"
        prefix="$"
        className="input-inside-table-fees"
        value={seasonalFeeGst}
        onChange={e =>
          this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'seasonalGst')
        }
      />
    ),
  },
  {
    title: orgLevelPrefix + AppConstants.casualFeeExclGst,
    dataIndex: 'casualFee',
    key: 'casualFee',
    filterDropdown: true,
    filterIcon: () => {
      return (
        <CustomTooltip placement="top">
          <span>{AppConstants.membershipCasualFeeMsg}</span>
        </CustomTooltip>
      );
    },
    render: (casualFee, record) => (
      <Input
        type="number"
        prefix="$"
        className="input-inside-table-fees"
        disabled={!!!record.isPlaying}
        value={casualFee}
        onChange={e =>
          this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'casualFee')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'casualGst',
    key: 'casualGst',
    render: (casualFeeGst, record) => (
      <Input
        type="number"
        prefix="$"
        className="input-inside-table-fees"
        disabled={!!!record.isPlaying}
        value={casualFeeGst}
        onChange={e =>
          this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'casualGst')
        }
      />
    ),
  },
];

// const stateFeeColumns = [
//   {
//     title: AppConstants.type,
//     dataIndex: 'membershipProductTypeRefName',
//     key: 'membershipProductTypeRefName',
//   },
//   {
//     title: AppConstants.membershipProduct,
//     dataIndex: 'membershipProductName',
//     key: 'membershipProductName',
//   },
//   {
//     title: AppConstants.nationalMembershipFeeExclGst,
//     dataIndex: 'nationalSeasonalFee',
//     key: 'nationalSeasonalFee',
//     filterDropdown: true,
//     filterIcon: () => {
//       return (
//         <CustomTooltip placement="top">
//           <span>{AppConstants.membershipSeasonalFeeMsg}</span>
//         </CustomTooltip>
//       );
//     },
//     render: (nationalSeasonalFee, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={nationalSeasonalFee}
//         disabled={true}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(
//             e.target.value,
//             record,
//             'nationalSeasonalFee',
//           )
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.gst,
//     dataIndex: 'nationalSeasonalGst',
//     key: 'nationalSeasonalGst',
//     render: (nationalSeasonalGst, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={nationalSeasonalGst}
//         disabled={true}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(
//             e.target.value,
//             record,
//             'nationalSeasonalGst',
//           )
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.nationalCasualFeeExclGst,
//     dataIndex: 'nationalCasualFee',
//     key: 'nationalCasualFee',
//     filterDropdown: true,
//     filterIcon: () => {
//       return (
//         <CustomTooltip placement="top">
//           <span>{AppConstants.membershipCasualFeeMsg}</span>
//         </CustomTooltip>
//       );
//     },
//     render: (nationalCasualFee, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={nationalCasualFee}
//         disabled={true}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(
//             e.target.value,
//             record,
//             'nationalCasualFee',
//           )
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.gst,
//     dataIndex: 'nationalCasualGst',
//     key: 'nationalCasualGst',
//     render: (nationalCasualGst, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={nationalCasualGst}
//         disabled={true}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(
//             e.target.value,
//             record,
//             'nationalCasualGst',
//           )
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.stateMembershipFeeExclGst,
//     dataIndex: 'seasonalFee',
//     key: 'seasonalFee',
//     filterDropdown: true,
//     filterIcon: () => {
//       return (
//         <CustomTooltip placement="top">
//           <span>{AppConstants.membershipSeasonalFeeMsg}</span>
//         </CustomTooltip>
//       );
//     },
//     render: (seasonalFee, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={seasonalFee}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'seasonalFee')
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.gst,
//     dataIndex: 'seasonalGst',
//     key: 'seasonalGst',
//     render: (seasonalGst, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         value={seasonalGst}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'seasonalGst')
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.stateCasualFeeExclGst,
//     dataIndex: 'casualFee',
//     key: 'casualFee',
//     filterDropdown: true,
//     filterIcon: () => {
//       return (
//         <CustomTooltip placement="top">
//           <span>{AppConstants.membershipCasualFeeMsg}</span>
//         </CustomTooltip>
//       );
//     },
//     render: (casualFee, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         disabled={!record.isPlaying}
//         value={casualFee}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'casualFee')
//         }
//       />
//     ),
//   },
//   {
//     title: AppConstants.gst,
//     dataIndex: 'casualGst',
//     key: 'casualGst',
//     render: (casualGst, record) => (
//       <Input
//         type="number"
//         prefix="$"
//         className="input-inside-table-fees"
//         disabled={!record.isPlaying}
//         value={casualGst}
//         onChange={e =>
//           this_Obj.props.membershipFeesTableInputChangeAction(e.target.value, record, 'casualGst')
//         }
//       />
//     ),
//   },
// ];
let linkedMembershipColumns = [
  {
    title: '',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '',
    dataIndex: 'fee',
    key: 'fee',
  },
];

let parentStateColumns = [
  {
    title: AppConstants.membershipFeesExclGst,
    dataIndex: 'parentOrgFees',
    key: 'parentOrgFees',
    render: (parentOrgFees, record) => {
      let totalFee = 0;
      let rows = [];
      if (record.national && record.national.organisationId > 0) {
        totalFee += feeIsNull(record.national.seasonalFee);
        rows.push({
          name: AppConstants.nationalSeasonFee,
          fee: '$' + feeIsNull(record.national.seasonalFee).toFixed(2),
        });
      }
      if (record.parentState && record.parentState.organisationId > 0) {
        totalFee += feeIsNull(record.parentState.seasonalFee);
        rows.push({
          name: AppConstants.parentStateSeasonFee,
          fee: '$' + feeIsNull(record.parentState.seasonalFee).toFixed(2),
        });
      }
      if (record.stateFee && record.stateFee.organisationId > 0) {
        totalFee += feeIsNull(record.stateFee.seasonalFee);
        rows.push({
          name: AppConstants.stateMembershipFeeExclGst,
          fee: '$' + feeIsNull(record.stateFee.seasonalFee).toFixed(2),
        });
      }
      totalFee = totalFee.toFixed(2);
      return (
        <Popover
          content={
            <div style={{ width: 150 }}>
              <Table
                className="fees-table no-header"
                columns={linkedMembershipColumns}
                dataSource={rows}
                pagination={false}
                Divider="false"
                showHeader="false"
              />
            </div>
          }
          title=""
          style={{ width: 150 }}
        >
          <div>
            <Input
              type="number"
              prefix="$"
              className="input-inside-table-fees"
              value={totalFee}
              disabled={true}
            />
          </div>
        </Popover>
      );
    },
  },
  {
    title: AppConstants.gst,
    dataIndex: 'parentOrgGst',
    key: 'parentOrgGst',
    render: (parentOrgGst, record) => {
      let totalFee = 0;
      let rows = [];
      if (record.national && record.national.organisationId > 0) {
        totalFee += feeIsNull(record.national.seasonalGst);
        rows.push({
          name: AppConstants.nationalSeasonFee,
          fee: '$' + feeIsNull(record.national.seasonalGst).toFixed(2),
        });
      }
      if (record.parentState && record.parentState.organisationId > 0) {
        totalFee += feeIsNull(record.parentState.seasonalGst);
        rows.push({
          name: AppConstants.parentStateSeasonFee,
          fee: '$' + feeIsNull(record.parentState.seasonalGst).toFixed(2),
        });
      }
      if (record.stateFee && record.stateFee.organisationId > 0) {
        totalFee += feeIsNull(record.stateFee.seasonalGst);
        rows.push({
          name: AppConstants.stateMembershipFeeExclGst,
          fee: '$' + feeIsNull(record.stateFee.seasonalGst).toFixed(2),
        });
      }
      totalFee = totalFee.toFixed(2);
      return (
        <Popover
          content={
            <div style={{ width: 150 }}>
              <Table
                className="fees-table no-header"
                columns={linkedMembershipColumns}
                dataSource={rows}
                pagination={false}
                Divider="false"
              />
            </div>
          }
          title=""
          style={{ width: 150 }}
        >
          <div>
            <Input
              type="number"
              prefix="$"
              className="input-inside-table-fees"
              value={totalFee}
              disabled={true}
            />
          </div>
        </Popover>
      );
    },
  },
  {
    title: AppConstants.casualFeeExclGst,
    dataIndex: 'parentCasualFee',
    key: 'parentCasualFee',
    filterDropdown: true,
    filterIcon: () => {
      return (
        <CustomTooltip placement="top">
          <span>{AppConstants.membershipCasualFeeMsg}</span>
        </CustomTooltip>
      );
    },
    render: (parentCasualFee, record) => {
      let totalFee = 0;
      let rows = [];
      if (record.national && record.national.organisationId > 0) {
        totalFee += feeIsNull(record.national.casualFee);
        rows.push({
          name: AppConstants.nationalSeasonFee,
          fee: '$' + feeIsNull(record.national.casualFee).toFixed(2),
        });
      }
      if (record.parentState && record.parentState.organisationId > 0) {
        totalFee += feeIsNull(record.parentState.casualFee);
        rows.push({
          name: AppConstants.parentStateSeasonFee,
          fee: '$' + feeIsNull(record.parentState.casualFee).toFixed(2),
        });
      }
      if (record.stateFee && record.stateFee.organisationId > 0) {
        totalFee += feeIsNull(record.stateFee.casualFee);
        rows.push({
          name: AppConstants.stateMembershipFeeExclGst,
          fee: '$' + feeIsNull(record.stateFee.casualFee).toFixed(2),
        });
      }
      totalFee = totalFee.toFixed(2);
      return (
        <Popover
          content={
            <div style={{ width: 150 }}>
              <Table
                className="fees-table no-header"
                columns={linkedMembershipColumns}
                dataSource={rows}
                pagination={false}
                Divider="false"
              />
            </div>
          }
          title=""
          style={{ width: 150 }}
        >
          <div>
            <Input
              type="number"
              prefix="$"
              className="input-inside-table-fees"
              value={totalFee}
              disabled={true}
            />
          </div>
        </Popover>
      );
    },
  },
  {
    title: AppConstants.gst,
    dataIndex: 'parentCasualGst',
    key: 'parentCasualGst',
    render: (parentCasualGst, record) => {
      let totalFee = 0;
      let rows = [];
      if (record.national && record.national.organisationId > 0) {
        totalFee += feeIsNull(record.national.casualGst);
        rows.push({
          name: AppConstants.nationalSeasonFee,
          fee: '$' + feeIsNull(record.national.casualGst).toFixed(2),
        });
      }
      if (record.parentState && record.parentState.organisationId > 0) {
        totalFee += feeIsNull(record.parentState.casualGst);
        rows.push({
          name: AppConstants.parentStateSeasonFee,
          fee: '$' + feeIsNull(record.parentState.casualGst).toFixed(2),
        });
      }
      if (record.stateFee && record.stateFee.organisationId > 0) {
        totalFee += feeIsNull(record.stateFee.casualGst);
        rows.push({
          name: AppConstants.stateMembershipFeeExclGst,
          fee: '$' + feeIsNull(record.stateFee.casualGst).toFixed(2),
        });
      }
      totalFee = totalFee.toFixed(2);
      return (
        <Popover
          content={
            <div style={{ width: 150 }}>
              <Table
                className="fees-table no-header"
                columns={linkedMembershipColumns}
                dataSource={rows}
                pagination={false}
                Divider="false"
              />
            </div>
          }
          title=""
          style={{ width: 150 }}
        >
          <div>
            <Input
              type="number"
              prefix="$"
              className="input-inside-table-fees"
              value={totalFee}
              disabled={true}
            />
          </div>
        </Popover>
      );
    },
  },
];

class RegistrationMembershipFee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      onYearLoad: false,
      value: 1,
      discountType: 0,
      membershipTabKey: '1',
      membershipProductSelected: [],
      discountMembershipType: 'Select',
      selectedMemberShipType: [],
      discountMembershipTypeData: [],
      visible: false,
      newNameMembershipType: '',
      statusRefId: 1,
      loading: false,
      buttonPressed: 'next',
      membershipIsUsed: false,
      isMembershipDisabled: false,
      confirmRePayFeesModalVisible: false,
      isPublished: false,
      tooltipVisibleDraft: false,
      isActivatedDiscountService: true,
      organisationLevel: '',
      addNew: this.props.location.state
        ? this.props.location.state.addNew
          ? this.props.location.state.addNew
          : null
        : null,
      seasonalMembershipTypes: [],
      columns: [],
      playerMembershipTierChecked: false,
    };
    this_Obj = this;
    this.formRef = React.createRef();
  }

  componentDidMount() {
    routePermissionForMembership();
    const organisationLevel = getOrganisationLevel();
    const productId = this.props.location.state ? this.props.location.state.id : null;
    let isAssoication = false;
    let isNational = organisationLevel === 'national' ? true : false;
    const orgItem = getOrganisationData();
    if (orgItem && orgItem.organisationTypeRefId > 2) {
      isAssoication = true;
    }
    this.setState({
      organisationLevel,
      isMembershipDisabled: isAssoication,
      isAssoication: isAssoication,
      membershipTabKey: isAssoication ? '2' : '1',
      isNational,
    });
    this.apiCalls(productId, organisationLevel);
    this.setFieldDecoratorValues();
  }

  componentWillUnmount() {
    this.props.clearRegistrationMembershipFeeForm();
  }

  componentDidUpdate(prevState) {
    let registrationState = this.props.registrationState;
    let allData = registrationState.getMembershipProductDetails;
    if (
      registrationState.getMembershipProductDetails !==
      prevState.registrationState.getMembershipProductDetails
    ) {
      let discountMembershipTypeData =
        allData.membershipproduct.membershipProductTypes !== undefined
          ? allData.membershipproduct.membershipProductTypes
          : [];
      let membershipIsUsed = allData.membershipproduct.isUsed;
      let isMembershipDisabled = membershipIsUsed || this.state.isMembershipDisabled;
      let isPublished = allData.membershipproduct.statusRefId == 2 ? true : false;
      let sourceColumns = columns.slice(0);
      if (allData.membershipproduct.parentMembershipProductId || this.state.isAssoication) {
        let columnExist = sourceColumns.some(x => x.key == 'parentOrgFees');
        if (!columnExist) {
          sourceColumns.splice(2, 0, ...parentStateColumns);
        }
      }
      this.setFieldDecoratorValues();
      this.setState({
        discountMembershipTypeData,
        membershipIsUsed,
        isPublished,
        isMembershipDisabled,
        columns: sourceColumns,
      });
    }
    if (
      registrationState.onLoadMembership == false &&
      prevState.registrationState.onLoadMembership == true
    ) {
      let membershipproduct = allData.membershipproduct;
      let playerMembershipTierChecked =
        membershipproduct.playerMembershipTierRefId == 2 ? true : false;
      this.setState({
        playerMembershipTierChecked: playerMembershipTierChecked,
      });
    }
    if (registrationState.onLoad === false && this.state.loading === true) {
      this.setState({ loading: false });
      if (!registrationState.error) {
        let fromTab = this.state.membershipTabKey;
        this.setState({
          // loading: false,
          //membershipTabKey: this.state.buttonPressed === "next" && JSON.stringify(JSON.parse(this.state.membershipTabKey) + 1)
          membershipTabKey: JSON.stringify(JSON.parse(this.state.membershipTabKey) + 1),
        });
        setTimeout(() => {
          if (this.state.isActivatedDiscountService == true) {
            if (
              this.state.buttonPressed === 'save' ||
              this.state.buttonPressed === 'publish' ||
              this.state.buttonPressed === 'delete' ||
              (fromTab == 2 && this.state.isAssoication)
            ) {
              history.push('/registrationMembershipList');
            }
          } else {
            if (this.state.membershipTabKey == '3') {
              this.saveMembershipProductDetails();
            } else if (this.state.membershipTabKey == '2' && this.state.addNew) {
              let data = registrationState.membershipProductFeesTableData;
              let feesData = data
                ? data.membershipFees.length > 0
                  ? data.membershipFees
                  : []
                : [];
              for (let index in feesData) {
                this.membershipFeeApplyRadio(365, index, 'validityDays');
              }
            }
          }
        }, 300);
      }
    }
    if (this.state.onYearLoad == true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        // let mainYearRefId = getCurrentYear(this.props.appState.yearList)
        this.setState({
          onYearLoad: false,
        });
        this.setFieldDecoratorValues();
      }
    }
    if (
      this.state.organisationLevel === AppConstants.state &&
      !registrationState.onLoadMembershipProduct &&
      registrationState.selectedYearForParentMembershipProducts !== this.state.yearRefId
    ) {
      this.props.getParentMembershipProductsAction({
        yearRefId: JSON.parse(getGlobalYear()),
      });
    }
  }

  apiCalls = (productId, organisationLevel) => {
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    if (this.props.appState.membershipProductCategory.length === 0 && isNationalProductEnabled) {
      this.props.getMembershipProductCategoryTypesAction();
    }
    this.setState({ onYearLoad: true });
    this.props.getProductValidityListAction();
    if (
      productId == null &&
      (!isNationalProductEnabled ||
        (isNationalProductEnabled && organisationLevel !== AppConstants.state))
    ) {
      this.props.regGetDefaultMembershipProductTypesAction();
    }
    if (productId !== null) {
      this.props.regGetMembershipProductDetailsAction(productId); /////get the membership product details
    }
    this.props.getMembershipProductFeesTypeAction();
    this.props.getCommonDiscountTypeTypeAction();
    this.props.membershipProductDiscountTypesAction();
    this.props.getAllowTeamRegistrationTypeAction();
    this.props.membershipPaymentOptionAction();
    this.getMembershipProductSeasonalTypes();
  };
  getMembershipProductSeasonalTypes = async () => {
    let payload = {
      yearRefId: JSON.parse(getGlobalYear()),
    };
    try {
      let result = await registrationAxiosApi.getMembershipProductSeasonalTypes(payload);
      if (result && result.status === 1) {
        let allEqualTypes = result.result.data;
        allEqualTypes.unshift({
          membershipProductTypeMappingId: 0,
          membershipProductName: 'None',
          membershipProductTypeName: '',
        });
        this.setState({ seasonalMembershipTypes: allEqualTypes });
      }
    } catch (ex) {
      console.log(`Error in getMembershipProductSeasonalTypes ${ex}`);
    }
  };

  saveMembershipProductDetails = values => {
    const {
      membershipProductId,
      membershipProductCategoryRefId,
      registrationDates,
      applyRegistrationDates,
      atMatchFeesEnabled,
      getDefaultMembershipProductTypes,
      getMembershipProductDetails,
    } = this.props.registrationState;

    if (this.state.membershipTabKey == '1') {
      const { yearRefId, membershipProductName, validityRefId } = values;
      let membershipTypesData = cloneDeep(getDefaultMembershipProductTypes);
      const finalMembershipTypes = membershipTypesData
        .filter(item => item.isMemebershipType)
        .map(item => {
          if (item.membershipProductTypeRefId > 0) {
            delete item['membershipProductTypeRefName'];
          }
          if (item.isDefault === 0) {
            if (item.isPlaying === 0) {
              item.isClearanceEnabled = false;
            } else {
              item.isChildrenCheckNumber = false;
            }
          }
          return item;
        });
      let parentMembershipProductId = null;
      let playerMembershipTierRefId = this.state.playerMembershipTierChecked ? 2 : 1;
      if (getMembershipProductDetails) {
        parentMembershipProductId =
          getMembershipProductDetails.membershipproduct.parentMembershipProductId;
      }

      let productBody = {
        membershipProductId,
        yearRefId: yearRefId,
        statusRefId: this.state.statusRefId,
        validityRefId: validityRefId,
        membershipProductName: membershipProductName,
        membershipProductTypes: finalMembershipTypes,
        membershipProductCategoryRefId,
        atMatchFeesEnabled,
        fromDate: applyRegistrationDates ? registrationDates.fromDate : null,
        toDate: applyRegistrationDates ? registrationDates.toDate : null,
        parentMembershipProductId,
        playerMembershipTierRefId: playerMembershipTierRefId,
      };
      if (productBody.membershipProductTypes.length > 0) {
        this.props.regSaveMembershipProductDetailsAction(productBody);
        this.setState({ loading: true });
      } else {
        message.error(ValidationConstants.pleaseSelectMembershipTypes);
      }
    } else if (this.state.membershipTabKey == '2') {
      let finalMembershipFeesData = cloneDeep(
        this.props.registrationState.membershipProductFeesTableData,
      );
      if (finalMembershipFeesData.isAlreadyRegistered == 1 && this.state.membershipIsUsed == true) {
        this.setState({ confirmRePayFeesModalVisible: true });
      } else {
        for (let mfee of finalMembershipFeesData.membershipFees) {
          if (!mfee.validityPeriodTypeRefId) {
            message.error(ValidationConstants.pleaseSelectValidity);
            return;
          }
          if (
            mfee.validityPeriodTypeRefId == ValidityPeriodType.NumberOfDays &&
            !mfee.validityDays
          ) {
            message.error(ValidationConstants.daysRequired);
            return;
          }
          delete mfee['membershipProductName'];
          delete mfee['membershipProductTypeRefName'];
        }

        this.props.regSaveMembershipProductFeesAction(finalMembershipFeesData);
        this.setState({ loading: true });
      }
    } else if (this.state.membershipTabKey == '3') {
      let errMsg = null;
      let discountData = cloneDeep(
        this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
          .discounts,
      );

      let disMap = new Map();
      let discountDuplicateError = false;
      for (let item of discountData) {
        let key = null;
        if (item.membershipPrdTypeDiscountTypeRefId == 2) {
          key =
            item.membershipProductTypeMappingId +
            '#' +
            item.membershipPrdTypeDiscountTypeRefId +
            '#' +
            item.discountCode;
          if (item.membershipPrdTypeDiscountTypeRefId == 2 && !item.discountCode) {
            message.error(ValidationConstants.emptyDiscountError);
            return;
          }
        } else if (item.membershipPrdTypeDiscountTypeRefId == 3) {
          key =
            item.membershipProductTypeMappingId +
            '#' +
            item.membershipPrdTypeDiscountTypeRefId +
            '#' +
            item.discountCode;
        }
        if (disMap.get(key) == undefined) {
          disMap.set(key, 1);
        } else {
          if (item.membershipPrdTypeDiscountTypeRefId == 3) {
            errMsg = ValidationConstants.membershipDuplicateFamilyDiscountError;
          } else {
            errMsg = ValidationConstants.duplicateDiscountError;
          }
          discountDuplicateError = true;
          break;
        }
        if (item.childDiscounts) {
          if (item.childDiscounts.length === 0) {
            item.childDiscounts = null;
          }
          if (item.membershipPrdTypeDiscountTypeRefId !== 3) {
            item.childDiscounts = null;
          }
        }
        item.applyDiscount = parseInt(item.applyDiscount);
        if (item.amount !== null) {
          if (item.amount > 0) {
            item.amount = parseInt(item.amount);
          } else {
            item.amount = null;
          }
        } else {
          item.amount = null;
        }
        // return item
      }
      let discountBody = {
        membershipProductId,
        statusRefId: this.state.statusRefId,
        membershipProductDiscounts: [
          {
            discounts: discountData,
          },
        ],
      };
      if (discountDuplicateError) {
        message.config({ duration: 0.9, maxCount: 1 });
        message.error(errMsg);
      } else {
        this.props.regSaveMembershipProductDiscountAction(discountBody);
        this.setState({ loading: true, isActivatedDiscountService: true });
      }
    }
  };

  setFieldDecoratorValues = () => {
    let allData = this.props.registrationState.getMembershipProductDetails;
    const { membershipProductCategoryRefId, registrationDates, getDefaultMembershipProductTypes } =
      this.props.registrationState;
    let membershipProductData = allData !== null ? allData.membershipproduct : [];
    let yearRefId = membershipProductData.yearRefId || JSON.parse(getGlobalYear());
    if (!yearRefId) {
      if (this.props.appState.yearList.length > 0) {
        yearRefId = getCurrentYear(this.props.appState.yearList);
      } else {
        yearRefId = 4;
      }
    }
    const name = this.formRef.current.getFieldValue('membershipProductName') || '';
    this.formRef.current.setFieldsValue({
      yearRefId: yearRefId,
      membershipProductName: membershipProductData.membershipProductName || name,
      validityRefId: membershipProductData.validityRefId ? membershipProductData.validityRefId : 2,
      membershipProductCategoryRefId,
      registrationToDate: registrationDates.toDate ? moment(registrationDates.toDate) : null,
      registrationFromDate: registrationDates.fromDate ? moment(registrationDates.fromDate) : null,
      parentMembershipProduct: membershipProductData.parentMembershipProductId,
    });
    setGlobalYear(yearRefId);
    this.setState({ yearRefId });
    const typesData = getDefaultMembershipProductTypes ? getDefaultMembershipProductTypes : [];
    if (typesData.length > 0) {
      typesData.forEach((item, index) => {
        let dobFrom = `dobFrom${index}`;
        let dobTo = `dobTo${index}`;
        let allowTeamRegistrationTypeRefId = `allowTeamRegistrationTypeRefId${index}`;
        if (isNotNullOrEmptyString(item.dobFrom)) {
          this.formRef.current.setFieldsValue({
            [dobFrom]: moment(item.dobFrom),
            [dobTo]: moment(item.dobTo),
          });
        }
        this.formRef.current.setFieldsValue({
          [allowTeamRegistrationTypeRefId]: item.allowTeamRegistrationTypeRefId,
        });
      });
    }
    let data = this.props.registrationState.membershipProductDiscountData;
    let discountData =
      data && data.membershipProductDiscounts !== null
        ? data.membershipProductDiscounts[0].discounts
        : [];

    if (discountData.length == 0) {
      let formValues = this.formRef.current.getFieldsValue(true);
      let keys = Object.keys(formValues);
      for (let key of keys) {
        if (
          key.startsWith('membershipProductTypeMappingId') ||
          key.startsWith('membershipPrdTypeDiscountTypeRefId')
        )
          this.formRef.current.setFieldsValue({ [key]: null });
      }
    }
    discountData.forEach((item, index) => {
      let membershipProductTypeMappingId = `membershipProductTypeMappingId${index}`;
      let membershipPrdTypeDiscountTypeRefId = `membershipPrdTypeDiscountTypeRefId${index}`;
      this.formRef.current.setFieldsValue({
        [membershipProductTypeMappingId]: item.membershipProductTypeMappingId,
        [membershipPrdTypeDiscountTypeRefId]: item.membershipPrdTypeDiscountTypeRefId,
      });
      let childDiscounts =
        item.childDiscounts !== null && item.childDiscounts.length > 0 ? item.childDiscounts : [];
      childDiscounts.forEach((childItem, childindex) => {
        let childDiscountPercentageValue = `percentageValue${index} + ${childindex}`;
        this.formRef.current.setFieldsValue({
          [childDiscountPercentageValue]: childItem.percentageValue,
        });
      });
    });

    let membershipProductFeesTableData =
      this.props.registrationState.membershipProductFeesTableData;
    let feesData = membershipProductFeesTableData
      ? membershipProductFeesTableData.membershipFees.length > 0
        ? membershipProductFeesTableData.membershipFees
        : []
      : [];
    for (let i in feesData) {
      if (feesData[i].membershipProductFeesTypeRefId == 1) {
        if (feesData[i].extendEndDate) {
          feesData[i].validityPeriodTypeRefId = ValidityPeriodType.EndDate;
        } else {
          feesData[i].validityPeriodTypeRefId = ValidityPeriodType.NumberOfDays;
        }
        this.formRef.current.setFieldsValue({
          // [`validityDays${i}`]: feesData[i].validityDays ? feesData[i].validityDays : null,
          [`extendEndDate${i}`]: feesData[i].extendEndDate
            ? moment(feesData[i].extendEndDate, DBDateFormat)
            : null,
        });
      }
    }
  };

  //////delete the membership product
  showDeleteConfirm = () => {
    let membershipProductId = this.props.registrationState.membershipProductId;
    let this_ = this;
    confirm({
      titie: AppConstants.productDeleteConfirmMsg,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        if (membershipProductId.length > 0) {
          this_.deleteProduct(membershipProductId);
        }
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  deleteProduct = membershipProductId => {
    this.setState({ loading: true, buttonPressed: 'delete' });
    this.props.regMembershipListDeleteAction(membershipProductId);
  };

  /////selection of membership fees type
  membershipTypesAndAgeSelected(checkedValue, index, keyword) {
    this.props.onChangeAgeCheckBoxAction(index, checkedValue, keyword);
  }

  dropdownView = () => {
    return (
      <div className="comp-venue-courts-dropdown-view mt-5">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading required-field">{AppConstants.year}:</span>
                <Form.Item
                  name="yearRefId"
                  rules={[{ required: true, message: ValidationConstants.pleaseSelectYear }]}
                >
                  <Select className="year-select reg-filter-select1 ml-2" style={{ maxWidth: 80 }}>
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
  };

  handleOk = e => {
    let newObj = {
      dobTo: null,
      dobFrom: null,
      membershipProductTypeRefId: 0,
      membershipProductTypeRefName: this.state.newNameMembershipType,
      membershipProductTypeMappingId: 0,
      isDefault: 0,
      isPlaying: 0,
      allowTeamRegistrationTypeRefId: null,
    };
    this.props.addNewMembershipTypeAction(newObj);
    this.setState({
      visible: false,
      newNameMembershipType: '',
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  ///add another membershipType
  addAnothermembershipType = () => {
    this.setState({ visible: true });
  };

  ///setting the mandate age restriction from date
  dateOnChangeFrom = (date, index) => {
    let dateFrom = moment(date).format('YYYY-MM-DD');
    let membershipTypeData = this.props.registrationState.getDefaultMembershipProductTypes;
    membershipTypeData[index].dobFrom = dateFrom;
    this.props.updatedMembershipTypeDataAction(membershipTypeData);
  };

  ////setting the mandate age restriction to date
  dateOnChangeTo = (date, index) => {
    let dobTo = moment(date).format('YYYY-MM-DD');
    let membershipTypeData = this.props.registrationState.getDefaultMembershipProductTypes;
    membershipTypeData[index].dobTo = dobTo;
    this.props.updatedMembershipTypeDataAction(membershipTypeData);
  };

  allowTeamRegistrationPlayer = (checkedValue, index, keyword) => {
    let allowTeamRegistration = checkedValue;
    let membershipTypeData = this.props.registrationState.getDefaultMembershipProductTypes;
    membershipTypeData[index][keyword] = allowTeamRegistration;
    this.props.updatedMembershipTypeDataAction(membershipTypeData);
  };

  applyRegistrationDates = e => {
    this.props.onChangeApplyRegistrationDatesCheckbox(e.target.checked);
  };

  allowArMatchFees = e => {
    this.props.onChangeAllowAtMatchFeesCheckbox(e.target.checked);
  };

  onChangeRegistrationDates = (date, key) => {
    this.props.onChangeRegistrationDates({ date, key });
  };

  onChangeMembershipProductCategoryTypes = data => {
    this.props.onChangeMembershipProductCategoryType(data);
  };

  onChangeParentProductMembership = data => {
    const membershipProduct = this.props.registrationState.parentMembershipProductsDetail.find(
      ({ membershipproduct }) => membershipproduct.id === data,
    );
    let playerMembershipTierChecked =
      membershipProduct.membershipproduct.playerMembershipTierRefId == 2 ? true : false;
    this.setState({ playerMembershipTierChecked: playerMembershipTierChecked });
    this.props.onChangeParentMembershipProduct(membershipProduct);
  };

  //////dynamic membership type view
  membershipTypesView = showParentMembership => {
    try {
      let registrationState = this.props.registrationState;
      const defaultTypes =
        registrationState.getDefaultMembershipProductTypes !== null
          ? registrationState.getDefaultMembershipProductTypes
          : [];
      let selectedParentMembershipProduct = registrationState.selectedParentMembershipProduct;
      let isPlayingSelected = false;
      let disabledMembershipProductFosStateOrganisation = false;
      if (isNationalProductEnabled) {
        disabledMembershipProductFosStateOrganisation =
          this.state.organisationLevel === AppConstants.state;
        isPlayingSelected = !!defaultTypes.find(item => item.isPlaying && item.isMemebershipType);
      }

      return (
        <div>
          <span className="applicable-to-heading">{AppConstants.membershipTypes}</span>

          {defaultTypes.map((item, index) => {
            let disabledMembershipType = false;
            let isTeamRegDisabled = false;
            if (isNationalProductEnabled) {
              if (item.isPlaying && !item.isMemebershipType && isPlayingSelected) {
                disabledMembershipType = true;
              }
              if (
                selectedParentMembershipProduct &&
                selectedParentMembershipProduct.membershipproduct
              ) {
                let parentType =
                  selectedParentMembershipProduct.membershipproduct.membershipProductTypes.find(
                    x => x.membershipProductTypeRefId == item.membershipProductTypeRefId,
                  );
                if (parentType && !parentType.allowTeamRegistrationTypeRefId) {
                  isTeamRegDisabled = true;
                }
              }
            }
            if (disabledMembershipProductFosStateOrganisation && !item.isMemebershipType) {
              return null;
            }
            return (
              <div key={index} className="prod-reg-inside-container-view">
                <div className="row">
                  <div className="col-sm">
                    <Checkbox
                      className="single-checkbox pt-3"
                      checked={item.isMemebershipType}
                      onChange={e =>
                        this.membershipTypesAndAgeSelected(
                          e.target.checked,
                          index,
                          'isMemebershipType',
                        )
                      }
                      key={index}
                      disabled={
                        this.state.isMembershipDisabled ||
                        disabledMembershipType ||
                        disabledMembershipProductFosStateOrganisation
                      }
                    >
                      {item.membershipProductTypeRefName}
                    </Checkbox>
                  </div>
                  {(item.membershipProductTypeRefId > 4 ||
                    item.membershipProductTypeRefId == 0) && (
                    <div
                      className="col-sm transfer-image-view pt-4"
                      onClick={() =>
                        !this.state.isMembershipDisabled &&
                        !disabledMembershipProductFosStateOrganisation
                          ? this.props.removeCustomMembershipTypeAction(index)
                          : null
                      }
                    >
                      <div className="removeAction">
                        <span className="user-remove-btn">
                          <i className="fa fa-trash-o" aria-hidden="true" />
                        </span>
                        <span className="user-remove-text mr-0">{AppConstants.remove}</span>
                      </div>
                    </div>
                  )}
                </div>
                {item.isMemebershipType && (
                  <div className="reg-membership-fee-mandate-check-view">
                    {item.isDefault == 0 && (
                      <>
                        <MembershipTypeOptionsWrapper
                          disabledSelect={
                            this.state.isMembershipDisabled ||
                            disabledMembershipProductFosStateOrganisation
                          }
                          index={index}
                          key={index}
                        />
                      </>
                    )}
                    <Checkbox
                      className="single-checkbox w-100"
                      checked={item.isMandate}
                      onChange={e =>
                        this.membershipTypesAndAgeSelected(e.target.checked, index, 'isMandate')
                      }
                      disabled={
                        this.state.isMembershipDisabled ||
                        disabledMembershipProductFosStateOrganisation
                      }
                    >
                      {`Mandate ${item.membershipProductTypeRefName} Age Restrictions`}
                    </Checkbox>
                    {item.isMandate && (
                      <div className="fluid-width">
                        <div className="row">
                          <div className="col-sm">
                            <InputWithHead heading={AppConstants.dobFrom} />
                            <Form.Item
                              name={`dobFrom${index}`}
                              rules={[
                                {
                                  required: true,
                                  message: ValidationConstants.pleaseSelectDOBFrom,
                                },
                              ]}
                            >
                              <DatePicker
                                // size="large"
                                className="w-100"
                                onChange={date => this.dateOnChangeFrom(date, index)}
                                format="DD-MM-YYYY"
                                placeholder="dd-mm-yyyy"
                                showTime={false}
                                // defaultValue={item.dobFrom !== null ? moment(item.dobFrom) : null}
                                disabled={
                                  this.state.isMembershipDisabled ||
                                  disabledMembershipProductFosStateOrganisation
                                }
                                disabledDate={d => d.isSameOrAfter(item.dobTo)}
                              />
                            </Form.Item>
                          </div>
                          <div className="col-sm">
                            <InputWithHead heading={AppConstants.dobTo} />
                            <Form.Item
                              name={`dobTo${index}`}
                              rules={[
                                {
                                  required: true,
                                  message: ValidationConstants.PleaseSelectDOBTo,
                                },
                              ]}
                            >
                              <DatePicker
                                // size="large"
                                className="w-100"
                                onChange={date => this.dateOnChangeTo(date, index)}
                                format="DD-MM-YYYY"
                                placeholder="dd-mm-yyyy"
                                showTime={false}
                                // defaultValue={item.dobTo !== null ? moment(item.dobTo) : null}
                                disabled={
                                  this.state.isMembershipDisabled ||
                                  disabledMembershipProductFosStateOrganisation
                                }
                                // disabledDate={d => d.isSameOrBefore(item.dobFrom)}
                                disabledDate={d => moment(item.dobFrom).isSameOrAfter(d, 'day')}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    )}
                    {item.membershipProductTypeRefName != 'Player - NetSetGo' && (
                      <div className="fluid-width">
                        <Checkbox
                          className="single-checkbox ml-0"
                          checked={item.isAllow}
                          onChange={e =>
                            this.membershipTypesAndAgeSelected(e.target.checked, index, 'isAllow')
                          }
                          disabled={this.state.isMembershipDisabled || isTeamRegDisabled}
                        >
                          {AppConstants.allowTeamRegistration}
                        </Checkbox>
                      </div>
                    )}
                    {!!item.isPlaying && (
                      <>
                        <div className="fluid-width">
                          <Checkbox
                            className="single-checkbox ml-0"
                            checked={item.isClearanceEnabled}
                            onChange={e =>
                              this.membershipTypesAndAgeSelected(
                                e.target.checked,
                                index,
                                'isClearanceEnabled',
                              )
                            }
                            disabled={
                              this.state.isAssoication ||
                              disabledMembershipProductFosStateOrganisation
                            }
                          >
                            {AppConstants.enableRegistrationClearances}
                          </Checkbox>
                        </div>
                        {!!item.isClearanceEnabled && (
                          <div className="fluid-width ml-4 mt-2">
                            <Radio.Group
                              className="reg-competition-radio"
                              value={item.clearanceTypeRefId || 1}
                              onChange={e =>
                                this.membershipTypesAndAgeSelected(
                                  e.target.value,
                                  index,
                                  'clearanceTypeRefId',
                                )
                              }
                              disabled={this.state.isAssoication}
                            >
                              <Radio value={1}>
                                {AppConstants.alwaysRequireRegisteringOrganisationApproval}
                              </Radio>
                              <Radio value={2}>
                                {AppConstants.automaticallyPlaceAllRegisteredPlayersIntoTeams}
                              </Radio>
                            </Radio.Group>
                          </div>
                        )}
                      </>
                    )}
                    {!!item.isPlaying &&
                      isFootball &&
                      !!item.isClearanceEnabled &&
                      item.clearanceTypeRefId === 1 && (
                        <div className="fluid-width">
                          <Checkbox
                            className="single-checkbox ml-0"
                            checked={item.isITCClearanceEnabled}
                            onChange={e =>
                              this.membershipTypesAndAgeSelected(
                                e.target.checked,
                                index,
                                'isITCClearanceEnabled',
                              )
                            }
                            disabled={
                              this.state.isAssoication ||
                              disabledMembershipProductFosStateOrganisation ||
                              !item.isClearanceEnabled ||
                              item.clearanceTypeRefId !== 1
                            }
                          >
                            {AppConstants.enableITCClearances}
                          </Checkbox>
                        </div>
                      )}
                    {item.isPlaying != 1 && (
                      <Checkbox
                        className="single-checkbox ml-0"
                        checked={item.isChildrenCheckNumber}
                        onChange={e =>
                          this.membershipTypesAndAgeSelected(
                            e.target.checked,
                            index,
                            'isChildrenCheckNumber',
                          )
                        }
                        disabled={
                          this.state.isMembershipDisabled ||
                          disabledMembershipProductFosStateOrganisation
                        }
                      >
                        {AppConstants.childrenCheckNumber}
                      </Checkbox>
                    )}
                    {/* {item.isAllow && item.isPlaying == 1 && (
                      <div className="fluid-width mt-10">
                        <div className="row">
                          <div className="col-sm" style={{ marginLeft: 25 }}>
                            <Form.Item
                              name={`allowTeamRegistrationTypeRefId${index}`}
                              rules={[
                                { required: true, message: ValidationConstants.playerTypeRequired },
                              ]}
                            >
                              <Radio.Group
                                className="reg-competition-radio"
                                onChange={e =>
                                  this.allowTeamRegistrationPlayer(
                                    e.target.value,
                                    index,
                                    'allowTeamRegistrationTypeRefId',
                                  )
                                }
                                value={item.allowTeamRegistrationTypeRefId}
                                disabled={this.state.membershipIsUsed}
                              >
                                {(allowTeamRegistration || []).map(fix => (
                                  <Radio key={'allowTeamRegistrationType_' + fix.id} value={fix.id}>
                                    {fix.description}
                                  </Radio>
                                ))}
                              </Radio.Group>
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
              </div>
            );
          })}
          <span
            className={
              'input-heading-add-another' +
              (showParentMembership || this.state.isAssociation ? 'd-none' : '')
            }
            onClick={
              !this.state.isMembershipDisabled && !disabledMembershipProductFosStateOrganisation
                ? this.addAnothermembershipType
                : null
            }
          >
            + {AppConstants.addMembershipType}
          </span>
          <Modal
            className="add-membership-type-modal"
            title={AppConstants.addMembershipType}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <InputWithHead
              auto_complete="new-membershipTypeName"
              required="pt-0 mt-0"
              heading={AppConstants.membershipTypeName}
              placeholder={AppConstants.pleaseEnterMembershipTypeName}
              onChange={e => this.setState({ newNameMembershipType: e.target.value })}
              value={this.state.newNameMembershipType}
            />
          </Modal>
        </div>
      );
    } catch (ex) {
      console.log('Error in membershipTypesView::' + ex);
    }
  };

  additionSettings = () => {
    if (!isNationalProductEnabled) {
      return null;
    }

    const { applyRegistrationDates, atMatchFeesEnabled, registrationDates } =
      this.props.registrationState;

    const orgLevel = this.state.organisationLevel;

    return (
      <>
        <span className="applicable-to-heading">{AppConstants.additionalSettings}</span>

        <div className="row ml-1 d-flex align-items-center">
          <Checkbox
            className="single-checkbox pt-2"
            checked={applyRegistrationDates}
            onChange={this.applyRegistrationDates}
            disabled={this.state.isMembershipDisabled || orgLevel !== AppConstants.national}
          >
            {AppConstants.applyRegistrationDates}
          </Checkbox>
        </div>

        {applyRegistrationDates && (
          <div className="reg-membership-fee-mandate-check-view">
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.openDate} />
                  <Form.Item
                    name="registrationFromDate"
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.registrationStartIsRequired,
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-100"
                      onChange={date => this.onChangeRegistrationDates(date, 'fromDate')}
                      format="DD-MM-YYYY"
                      placeholder="dd-mm-yyyy"
                      showTime={false}
                      disabled={
                        this.state.isMembershipDisabled || orgLevel !== AppConstants.national
                      }
                      disabledDate={d => d.isSameOrAfter(registrationDates.toDate)}
                    />
                  </Form.Item>
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.closeDate} />
                  <Form.Item
                    name="registrationToDate"
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.registrationEndIsRequired,
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-100"
                      onChange={date => this.onChangeRegistrationDates(date, 'toDate')}
                      format="DD-MM-YYYY"
                      placeholder="dd-mm-yyyy"
                      showTime={false}
                      disabled={
                        this.state.isMembershipDisabled || orgLevel !== AppConstants.national
                      }
                      disabledDate={d => moment(registrationDates.fromDate).isSameOrAfter(d, 'day')}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row ml-1 d-flex align-items-center">
          <Checkbox
            className="single-checkbox pt-2"
            checked={atMatchFeesEnabled}
            onChange={this.allowArMatchFees}
            disabled={this.state.isMembershipDisabled || orgLevel !== AppConstants.national}
          >
            {AppConstants.allowAtMatchFees}
          </Checkbox>
        </div>
      </>
    );
  };

  contentView = () => {
    const orgLevel = this.state.organisationLevel;
    const membershipProductDetails = this.props.registrationState.getMembershipProductDetails;
    const { membershipProductCategoryRefId, parentOrganisationTypeRefId } =
      this.props.registrationState;

    let parentMembershipProducts = [];
    let hasParentStateMembership = parentOrganisationTypeRefId == OrganisationType.State;
    let hasNationalMembership =
      isNationalProductEnabled && parentOrganisationTypeRefId == OrganisationType.National;
    if (hasParentStateMembership) {
      parentMembershipProducts = this.props.registrationState.parentMembershipProductsDetail;
    } else if (hasNationalMembership) {
      parentMembershipProducts = this.props.registrationState.parentMembershipProductsDetail.filter(
        item =>
          membershipProductCategoryRefId &&
          membershipProductCategoryRefId === item.membershipproduct.membershipProductCategoryRefId,
      );
    }
    let showParentMembership =
      (hasParentStateMembership || hasNationalMembership) && orgLevel === AppConstants.state;

    let disabledMembershipProductFosStateOrganisation = false;
    if (isNationalProductEnabled || hasParentStateMembership) {
      disabledMembershipProductFosStateOrganisation =
        this.state.organisationLevel === AppConstants.state;
    }
    const disabledEdit =
      (isNationalProductEnabled || hasParentStateMembership) &&
      orgLevel === AppConstants.state &&
      membershipProductDetails?.membershipproduct?.membershipProductId;

    return (
      <div className="content-view pt-5">
        <span className="form-heading">{AppConstants.membershipProduct}</span>

        <InputWithHead required="required-field pb-2" heading={AppConstants.year} />

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
            style={{ maxWidth: 80 }}
            onChange={this.onChangeYear}
            disabled={this.state.isMembershipDisabled || disabledEdit}
          >
            {this.props.appState.yearList.map(item => (
              <Option key={'year_' + item.id} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {isNationalProductEnabled && !hasParentStateMembership && (
          <>
            <InputWithHead
              required="required-field pb-2"
              heading={AppConstants.membershipProductCategoryType}
            />

            <Form.Item
              name="membershipProductCategoryRefId"
              rules={[
                {
                  required: true,
                  message: AppConstants.membershipProductCategoryRefIdIsRequired,
                },
              ]}
            >
              <Select
                className="year-select reg-filter-select1"
                style={{ maxWidth: 220 }}
                onChange={this.onChangeMembershipProductCategoryTypes}
                disabled={this.state.isMembershipDisabled || disabledEdit}
                placeholder="Select type"
              >
                {this.props.appState.membershipProductCategory.map(item => (
                  <Option key={item.id} value={parseInt(item.id)}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        {showParentMembership && (
          <>
            <InputWithHead
              required="required-field pb-2"
              heading={
                hasParentStateMembership
                  ? AppConstants.parentStateMembershipProduct
                  : AppConstants.nationalMembershipProduct
              }
            />

            <Form.Item
              name="parentMembershipProduct"
              rules={[
                {
                  required: true,
                  message: hasParentStateMembership
                    ? ValidationConstants.parentStateMembershipProductIsRequired
                    : ValidationConstants.nationalMembershipProductIsRequired,
                },
              ]}
            >
              <Select
                className="year-select reg-filter-select1"
                style={{ maxWidth: 220 }}
                onChange={this.onChangeParentProductMembership}
                disabled={this.state.isMembershipDisabled || disabledEdit}
                placeholder="Select type"
              >
                {parentMembershipProducts.map(({ membershipproduct }) => (
                  <Option key={membershipproduct.id} value={membershipproduct.id}>
                    {membershipproduct.membershipProductName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item
          name="membershipProductName"
          rules={[{ required: true, message: ValidationConstants.membershipProductIsRequired }]}
        >
          <InputWithHead
            auto_complete="new-membershipProductName"
            required="required-field pb-2"
            heading={AppConstants.membershipProductName}
            placeholder={AppConstants.membershipProductName}
            disabled={this.state.isMembershipDisabled}
            conceptulHelp
            conceptulHelpMsg={AppConstants.membershipProductNameMsg}
            marginTop={5}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                membershipProductName: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>
        {isProfessionalMembershipEnabled && (
          <Checkbox
            className="single-checkbox pt-3"
            checked={this.state.playerMembershipTierChecked}
            onChange={e => {
              this.setState({ playerMembershipTierChecked: e.target.checked });
            }}
            disabled={
              this.state.isMembershipDisabled || disabledMembershipProductFosStateOrganisation
            }
          >
            {AppConstants.professionalMembership}
          </Checkbox>
        )}
        {this.membershipTypesView(showParentMembership)}
        {/* {this.additionSettings()} */}
      </div>
    );
  };

  ///membershipFees apply radio onchange
  membershipFeeApplyRadio = (radioApplyId, feesIndex, key) => {
    this.props.membershipFeesApplyRadioAction(radioApplyId, feesIndex, key);
  };
  onValidityPeriodChange = (value, item, index) => {
    item.validityPeriodTypeRefId = value;
    if (value == ValidityPeriodType.EndDate) {
      item.validityDays = null;
      item.extendToEndOfCompetition = 0;
      item.allowOneTimeRegistrationOnly = 0;
    } else if (value == ValidityPeriodType.NumberOfDays) {
      item.extendEndDate = null;
      this.formRef.current.setFieldsValue({
        [`extendEndDate${index}`]: null,
      });
    }
    this.setState({ updateUI: true });
  };
  onAllowOneTimeRegistrationChange = (value, item) => {
    let membershipTypeData = this.props.registrationState.getDefaultMembershipProductTypes;
    let mp = membershipTypeData.find(
      x => x.membershipProductTypeMappingId == item.membershipProductTypeMappingId,
    );
    if (mp && mp.isAllow) {
      message.error(AppConstants.oneTimeRegistrationNotAvailable);
      return;
    }
    item.allowOneTimeRegistrationOnly = value ? 1 : 0;
    this.setState({ updateUI: true });
  };
  dateConversion = (f, key, index) => {
    try {
      let date = moment(f, UIDateFormat).format(DBDateFormat);
      this.membershipFeeApplyRadio(date, index, key);
    } catch (ex) {
      console.log('Error in dateConversion::' + ex);
    }
  };

  ////fees view inside the content
  feesView = () => {
    let data = this.props.registrationState.membershipProductFeesTableData;
    let feesData = data ? (data.membershipFees.length > 0 ? data.membershipFees : []) : [];
    const orgLevel = this.state.organisationLevel;
    let tableColumn = this.state.columns;
    const disabledInput =
      (isNationalProductEnabled && orgLevel === AppConstants.state) || this.state.isAssoication;
    let allEqualTypes = this.state.seasonalMembershipTypes;

    return (
      <div>
        <div className="tab-formView fees-view pt-5">
          <span className="form-heading">{AppConstants.membershipFees}</span>
          {feesData.map((item, index) => {
            let equalTypes = allEqualTypes.filter(
              x => x.membershipProductTypeMappingId != item.membershipProductTypeMappingId,
            );
            return (
              <div className="inside-container-view" key={'feesData' + index}>
                <div className="table-responsive">
                  <Table
                    className="fees-table"
                    columns={tableColumn}
                    dataSource={[item]}
                    pagination={false}
                    Divider="false"
                  />
                </div>
                <div className="applicable-to-heading">
                  {AppConstants.applyMembershipFee}
                  <CustomTooltip>
                    <span>{AppConstants.firstComRegOnlyMsg}</span>
                  </CustomTooltip>
                </div>

                <Radio.Group
                  className="reg-competition-radio"
                  onChange={e => this.onValidityPeriodChange(e.target.value, item, index)}
                  value={item.validityPeriodTypeRefId}
                  disabled={disabledInput}
                >
                  <div className="validity-period-bg">
                    <div className="">
                      <Radio key={'validityperiod_1'} value={1}>
                        {AppConstants.endDate}
                      </Radio>
                      {item.validityPeriodTypeRefId == ValidityPeriodType.EndDate && (
                        <div style={{ marginLeft: 3 }}>
                          <span className="applicable-to-heading pt-2 pb-2">
                            {AppConstants.extendMembershipTo}
                          </span>

                          <Form.Item
                            name={`extendEndDate${index}`}
                            rules={[
                              {
                                required: true,
                                message: ValidationConstants.extendEndDateRequired,
                              },
                            ]}
                          >
                            <DatePicker
                              size="large"
                              placeholder={UIDateFormat}
                              style={{ width: '100%' }}
                              onChange={(e, f) => this.dateConversion(f, 'extendEndDate', index)}
                              format={UIDateFormat}
                              showTime={false}
                              disabled={disabledInput}
                            />
                          </Form.Item>
                        </div>
                      )}
                    </div>
                    <div className="pt-2">
                      <Radio key={'validityperiod_2'} value={2}>
                        {AppConstants.noOfDays}
                      </Radio>
                    </div>
                    {item.validityPeriodTypeRefId == ValidityPeriodType.NumberOfDays && (
                      <div>
                        <span className="applicable-to-heading pt-2">{AppConstants.noOfDays}</span>
                        <div className="row" style={{ marginTop: 10, alignItems: 'center' }}>
                          <div className="col-md-6">
                            {/* <Form.Item
                                                            name={`validityDays${index}`}
                                                            rules={[{ required: true, message: ValidationConstants.daysRequired }]}
                                                        > */}
                            <InputWithHead
                              value={item.validityDays}
                              placeholder={AppConstants._days}
                              onChange={e =>
                                this.membershipFeeApplyRadio(
                                  e.target.value > -1 ? e.target.value : null,
                                  index,
                                  'validityDays',
                                )
                              }
                              // onBlur={(e) => {
                              //     this.formRef.current.setFieldsValue({
                              //         [`validityDays${index}`]: e.target.value >= 0 ? e.target.value : ""
                              //     })
                              // }}
                              type={'number'}
                              min={0}
                              disabled={disabledInput}
                            />
                            {/* </Form.Item> */}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <Checkbox
                              onChange={e => {
                                item.extendToEndOfCompetition = e.target.checked ? 1 : 0;
                                this.setState({ updateUI: true });
                              }}
                              checked={item.extendToEndOfCompetition ? true : false}
                              style={{ marginTop: 10 }}
                              className="single-checkbox pt-3"
                              disabled={disabledInput}
                            >
                              {AppConstants.extendToEndOfCompetition}
                            </Checkbox>
                          </div>
                        </div>
                        {item.isPlaying && (
                          <>
                            <div className="row">
                              <div className="col">
                                <Checkbox
                                  onChange={e => {
                                    this.onAllowOneTimeRegistrationChange(e.target.checked, item);
                                  }}
                                  checked={item.allowOneTimeRegistrationOnly ? true : false}
                                  style={{ marginTop: 10 }}
                                  className="single-checkbox pt-3"
                                  disabled={disabledInput}
                                >
                                  {AppConstants.allowOneTimeRegistrationOnly}
                                </Checkbox>
                              </div>
                            </div>
                            {item.allowOneTimeRegistrationOnly && (
                              <div className="row">
                                <div className="col-md-6">
                                  <InputWithHead
                                    heading="Linked To"
                                    conceptulHelp
                                    conceptulHelpMsg={AppConstants.equalToMembershipProduct}
                                  />
                                  <Select
                                    className="w-100"
                                    style={{ paddingRight: 1, minWidth: 182 }}
                                    onChange={value => {
                                      item.equalMembershipProductTypeMappingId = value;
                                      this.setState({ updateUI: true });
                                    }}
                                    placeholder="Select"
                                    value={item.equalMembershipProductTypeMappingId}
                                  >
                                    {equalTypes.map(type => (
                                      <Option
                                        key={
                                          'equalMembershipType_' +
                                          type.membershipProductTypeMappingId
                                        }
                                        value={type.membershipProductTypeMappingId}
                                      >
                                        {type.membershipProductName +
                                          ' ' +
                                          type.membershipProductTypeName}
                                      </Option>
                                    ))}
                                  </Select>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Radio.Group>
              </div>
            );
          })}
        </div>

        <div className="tab-formView fees-view pt-5">
          <span className="form-heading">{AppConstants.membershipFeesPaymentOptions}</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'inter-medium, sans-serif',
            }}
          >
            {AppConstants.whenPaymentsRequired}
          </span>
          <Radio.Group
            className="reg-competition-radio"
            //onChange={e => this.membershipFeeApplyRadio(e.target.value)}
            defaultValue={data?.paymentOptionRefId}
            disabled={this.state.isAssoication}
          >
            {this.props.commonReducerState.membershipPaymentOptions.map(item => (
              <div className="row pl-2" key={'membershipPaymentOption_' + item.id}>
                <Radio key={'paymentOption_' + item.id} value={item.id}>
                  {item.description}
                </Radio>
              </div>
            ))}
          </Radio.Group>
        </div>
      </div>
    );
  };

  discountViewChange = (item, index) => {
    let discountTypes = this.props.appState.commonDiscountTypes.filter(x => x.name != 'percentage');
    let childDiscounts =
      item.childDiscounts !== null && item.childDiscounts.length > 0 ? item.childDiscounts : [];
    switch (item.membershipPrdTypeDiscountTypeRefId) {
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
            >
              {discountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.fixedAmount} />
                <InputNumber
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.fixedAmount}
                  min={0}
                  max={100}
                  formatter={value => `${value}`}
                  parser={value => value.replace('', '')}
                  onChange={value => this.onChangePercentageOff(value, index)}
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-gernalDiscount"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                />
              </div>
            </div>
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                    value={item.availableFrom !== null && moment(item.availableFrom)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                    value={item.availableTo !== null && moment(item.availableTo)}
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
            >
              {discountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
            <InputWithHead
              auto_complete="new-code"
              heading={AppConstants.code}
              placeholder={AppConstants.code}
              onChange={e => this.onChangeDiscountCode(e.target.value, index)}
              value={item.discountCode}
            />
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.fixedAmount} />
                <InputNumber
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.fixedAmount}
                  min={0}
                  max={100}
                  formatter={value => `${value}`}
                  parser={value => value.replace('', '')}
                  onChange={value => this.onChangePercentageOff(value, index)}
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-gernalDiscount"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                />
              </div>
            </div>
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                    value={item.availableFrom !== null && moment(item.availableFrom)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                    value={item.availableTo !== null && moment(item.availableTo)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <InputWithHead heading="Discount Type" />
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={discountType => this.onChangeDiscountRefId(discountType, index)}
              placeholder="Select"
              value={item.discountTypeRefId}
            >
              {discountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
            {childDiscounts.map((childItem, childindex) => (
              <div className="row">
                <div className="col-sm-10">
                  <Form.Item
                    name={`percentageValue${index} + ${childindex}`}
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.pleaseEnterChildDiscountPercentage,
                      },
                    ]}
                  >
                    <InputWithHead
                      heading={`Family Participant ${childindex + 1} discount`}
                      placeholder={`Family Participant ${childindex + 1} discount`}
                      onChange={e =>
                        this.onChangeChildPercent(e.target.value, index, childindex, childItem)
                      }
                      // value={childItem.percentageValue}
                    />
                  </Form.Item>
                </div>
                {childindex > 0 && (
                  <div
                    className="col-sm-2 delete-image-view pb-4"
                    onClick={() => this.addRemoveChildDiscount(index, 'delete', childindex)}
                  >
                    <span className="user-remove-btn">
                      <i className="fa fa-trash-o" aria-hidden="true" />
                    </span>
                    <span className="user-remove-text mr-0 mb-1">{AppConstants.remove}</span>
                  </div>
                )}
              </div>
            ))}
            <span
              className="input-heading-add-another"
              onClick={() => this.addRemoveChildDiscount(index, 'add', -1)}
            >
              + {AppConstants.addChild}
            </span>
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
            >
              {discountTypes.map(item => (
                <Option key={'discountType_' + item.id} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
            <div className="row">
              <div className="col-sm">
                <InputWithHead heading={AppConstants.fixedAmount} />
                <InputNumber
                  auto_complete="new-number"
                  value={item.amount}
                  placeholder={AppConstants.fixedAmount}
                  min={0}
                  max={100}
                  formatter={value => `${value}`}
                  parser={value => value.replace('', '')}
                  onChange={value => this.onChangePercentageOff(value, index)}
                />
              </div>
              <div className="col-sm">
                <InputWithHead
                  auto_complete="new-gernalDiscount"
                  heading={AppConstants.description}
                  placeholder={AppConstants.generalDiscount}
                  onChange={e => this.onChangeDescription(e.target.value, index)}
                  value={item.description}
                />
              </div>
            </div>

            <div className="fluid-width">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableFrom} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    onChange={date => this.onChangeDiscountAvailableFrom(date, index)}
                    format="DD-MM-YYYY"
                    placeholder="dd-mm-yyyy"
                    showTime={false}
                    value={item.availableFrom !== null && moment(item.availableFrom)}
                  />
                </div>
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.availableTo} />
                  <DatePicker
                    // size="large"
                    className="w-100"
                    placeholder="dd-mm-yyyy"
                    disabledDate={this.disabledDate}
                    disabledTime={this.disabledTime}
                    onChange={date => this.onChangeDiscountAvailableTo(date, index)}
                    format="DD-MM-YYYY"
                    showTime={false}
                    value={item.availableTo !== null && moment(item.availableTo)}
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
            />
            <InputWithHead
              auto_complete="new-question"
              heading={AppConstants.question}
              placeholder={AppConstants.question}
              onChange={e => this.onChangeQuestion(e.target.value, index)}
              value={item.question}
            />
            <InputWithHead heading={'Apply Discount if Answer is Yes'} />
            <Radio.Group
              className="reg-competition-radio"
              onChange={e => this.applyDiscountQuestionCheck(e.target.value, index)}
              value={JSON.stringify(JSON.parse(item.applyDiscount))}
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

  addRemoveChildDiscount = (index, keyWord, childindex) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    let childDisObject = {
      membershipFeesChildDiscountId: 0,
      percentageValue: '',
    };
    if (keyWord === 'add') {
      if (isArrayNotEmpty(discountData[index].childDiscounts)) {
        discountData[index].childDiscounts.push(childDisObject);
      } else {
        discountData[index].childDiscounts = [];
        discountData[index].childDiscounts.push(childDisObject);
      }
    } else if (keyWord === 'delete') {
      if (isArrayNotEmpty(discountData[index].childDiscounts)) {
        discountData[index].childDiscounts.splice(childindex, 1);
      }
    }
    this.props.updatedDiscountDataAction(discountData);
    if (keyWord === 'delete') {
      this.setFieldDecoratorValues();
    }
  };

  ////////onchange apply discount question radio button
  applyDiscountQuestionCheck = (applyDiscount, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].applyDiscount = applyDiscount;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///////child  onchange in discount section
  onChangeChildPercent = (childPercent, index, childindex, childItem) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].childDiscounts[childindex].percentageValue = childPercent;
    discountData[index].childDiscounts[childindex].membershipFeesChildDiscountId =
      childItem.membershipFeesChildDiscountId;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///onchange question in case of custom discount
  onChangeQuestion = (question, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].question = question;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////add  or remove  discount in discount section
  addRemoveDiscount = (keyAction, index) => {
    this.props.addRemoveDiscountAction(keyAction, index);
    if (keyAction == 'remove') {
      setTimeout(() => {
        this.setFieldDecoratorValues();
      }, 300);
    }
  };

  onChangeYear = yearRefId => {
    this.setState({ yearRefId });
    setGlobalYear(yearRefId);
    if (this.state.organisationLevel === AppConstants.state) {
      this.props.getParentMembershipProductsAction({
        yearRefId,
      });
    }
  };

  //On change membership product discount type
  onChangeMembershipProductDisType = (discountType, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].membershipPrdTypeDiscountTypeRefId = discountType;
    this.props.updatedDiscountDataAction(discountData);
    if (discountType == 3) {
      if (isArrayNotEmpty(discountData[index].childDiscounts) == false) {
        this.addRemoveChildDiscount(index, 'add', -1);
      }
    }
  };

  //onChange membership type  discount
  onChangeMembershipTypeDiscount = (discountMembershipType, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].membershipProductTypeMappingId = discountMembershipType;
    this.props.updatedDiscountDataAction(discountData);
  };

  /////onChange discount refId
  onChangeDiscountRefId = (discountType, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].discountTypeRefId = discountType;
    this.props.updatedDiscountDataAction(discountData);
  };

  //////onchange discount code
  onChangeDiscountCode = (discountCode, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].discountCode = discountCode;
    this.props.updatedDiscountDataAction(discountData);
  };

  ///onchange on text field percentage off
  onChangePercentageOff = (amount, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].amount = amount;
    this.props.updatedDiscountDataAction(discountData);
  };

  /////onChange discount description
  onChangeDescription = (description, index) => {
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].description = description;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////discount available from on change
  onChangeDiscountAvailableFrom = (date, index) => {
    let fromDate = moment(date).format('YYYY-MM-DD');
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].availableFrom = fromDate;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////discount available to on change
  onChangeDiscountAvailableTo = (date, index) => {
    let toDate = moment(date).format('YYYY-MM-DD');
    let discountData =
      this.props.registrationState.membershipProductDiscountData.membershipProductDiscounts[0]
        .discounts;
    discountData[index].availableTo = toDate;
    this.props.updatedDiscountDataAction(discountData);
  };

  ////discount view inside the content
  discountView = () => {
    let data = this.props.registrationState.membershipProductDiscountData;
    let discountData =
      data && data.membershipProductDiscounts !== null
        ? data.membershipProductDiscounts[0].discounts
        : [];
    let isDiscountDisabled =
      this.state.isAssoication || this.state.organisationLevel == AppConstants.national;
    return (
      <div className="discount-view pt-5">
        <div className="row">
          <span className="form-heading">{AppConstants.discounts}</span>
          <CustomTooltip>
            <span>{AppConstants.membershipDiscountMsg}</span>
          </CustomTooltip>
        </div>

        {discountData.map((item, index) => (
          <div className="prod-reg-inside-container-view">
            <div
              className="transfer-image-view pt-2"
              onClick={() => this.addRemoveDiscount('remove', index)}
            >
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </div>
            <div className="row">
              <div className="col-sm">
                <InputWithHead required="pt-0" heading="Discount Type" />
                <Form.Item
                  name={`membershipPrdTypeDiscountTypeRefId${index}`}
                  rules={[
                    { required: true, message: ValidationConstants.pleaseSelectDiscountType },
                  ]}
                >
                  <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={discountType =>
                      this.onChangeMembershipProductDisType(discountType, index)
                    }
                    placeholder="Select"
                    // value={item.membershipPrdTypeDiscountTypeRefId !== 0 && item.membershipPrdTypeDiscountTypeRefId}
                  >
                    {this.props.registrationState.membershipProductDiscountType.map(item => (
                      <Option key={'discountType_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-sm">
                <InputWithHead required="pt-0" heading={AppConstants.membershipTypes} />
                <Form.Item
                  name={`membershipProductTypeMappingId${index}`}
                  rules={[
                    { required: true, message: ValidationConstants.pleaseSelectMembershipTypes },
                  ]}
                >
                  <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={discountMembershipType =>
                      this.onChangeMembershipTypeDiscount(discountMembershipType, index)
                    }
                    // defaultValue={item.membershipProductTypeMappingId}
                    placeholder="Select"
                    // value={item.membershipProductTypeMappingId}
                  >
                    {this.state.discountMembershipTypeData.map(item => (
                      <Option
                        key={'discountMembershipType_' + item.membershipProductTypeMappingId}
                        value={item.membershipProductTypeMappingId}
                      >
                        {item.membershipProductTypeRefName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            {this.discountViewChange(item, index)}
          </div>
        ))}
        <span
          className={`input-heading-add-another ${isDiscountDisabled ? 'disabled' : ''}`}
          onClick={() => !isDiscountDisabled && this.addRemoveDiscount('add', -1)}
        >
          + {AppConstants.addDiscount}
        </span>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let tabKey = this.state.membershipTabKey;
    let membershipProductId = this.props.registrationState.membershipProductId;
    let isNextDisabled = this.state.isPublished && this.state.membershipIsUsed && tabKey == '1';
    isNextDisabled =
      isNextDisabled || (this.state.isAssoication && (tabKey == '1' || tabKey == '3'));
    return (
      <div className="fluid-width">
        {/* {!this.state.membershipIsUsed && ( */}
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Tooltip
                  className="h-100"
                  onMouseEnter={() =>
                    this.setState({
                      tooltipVisibleDraft: this.state.isPublished,
                    })
                  }
                  onMouseLeave={() => this.setState({ tooltipVisibleDraft: false })}
                  visible={this.state.tooltipVisibleDraft}
                  title={ValidationConstants.membershipIsPublished}
                >
                  <Button
                    className="save-draft-text"
                    type="save-draft-text"
                    htmlType="submit"
                    disabled={this.state.isPublished}
                    onClick={() =>
                      this.setState({ statusRefId: StatusEnum.Draft, buttonPressed: 'save' })
                    }
                  >
                    {AppConstants.saveAsDraft}
                  </Button>
                </Tooltip>
                <Button
                  className="publish-button"
                  type="primary"
                  htmlType="submit"
                  disabled={isNextDisabled}
                  onClick={() => {
                    let statusRefId = this.state.isPublished
                      ? StatusEnum.Published
                      : tabKey === '3'
                      ? StatusEnum.Published
                      : StatusEnum.Draft;
                    this.setState({
                      statusRefId: statusRefId,
                      buttonPressed: tabKey === '3' ? 'publish' : 'next',
                    });
                  }}
                >
                  {tabKey === '3'
                    ? this.state.isPublished
                      ? AppConstants.save
                      : AppConstants.publish
                    : AppConstants.next}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* )} */}
      </div>
    );
  };

  tabCallBack = key => {
    // let productId = this.props.registrationState.membershipProductId
    // if (productId !== null && productId.length > 0) {
    this.setState({ membershipTabKey: key });
    let data = this.props.registrationState.membershipProductFeesTableData;
    let feesData = data ? (data.membershipFees.length > 0 ? data.membershipFees : []) : [];
    if (key == '2') {
      for (let i in feesData) {
        this.membershipFeeApplyRadio(
          feesData[i].validityDays == 0 ? null : feesData[i].validityDays,
          i,
          'validityDays',
        );
      }
    }
    // }
    this.setFieldDecoratorValues();
  };

  handleConfirmRepayFeesModal = key => {
    if (key == 'ok') {
      let finalMembershipFeesData = cloneDeep(
        this.props.registrationState.membershipProductFeesTableData,
      );
      finalMembershipFeesData.membershipFees.map(item => {
        delete item['membershipProductName'];
        delete item['membershipProductTypeRefName'];
        return item;
      });
      this.props.regSaveMembershipProductFeesAction(finalMembershipFeesData);
      this.setState({ loading: true });
      this.setState({ confirmRePayFeesModalVisible: false });
    } else {
      this.setState({ confirmRePayFeesModalVisible: false });
    }
  };

  repayFeesModal = () => {
    try {
      return (
        <Modal
          className="add-membership-type-modal"
          title="Confirm"
          visible={this.state.confirmRePayFeesModalVisible}
          okText={AppConstants.proceedText}
          onOk={() => this.handleConfirmRepayFeesModal('ok')}
          onCancel={() => this.handleConfirmRepayFeesModal('cancel')}
        >
          <InputWithHead heading={AppConstants.membershipFeesRepayConfirmMsg} required="pt-0" />
        </Modal>
      );
    } catch (ex) {
      console.log('Error in repayFeesModal::' + ex);
    }
  };

  render() {
    let initialValue = {
      yearRefId: 1,
      validityRefId: 1,
    };
    if (isNationalProductEnabled) {
      initialValue.membershipProductCategoryRefId = null;
    }
    if (isNationalProductEnabled && this.state.organisationLevel === AppConstants.national) {
      initialValue.parentMembershipProduct = null;
    }

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="4" />
        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveMembershipProductDetails}
            noValidate="noValidate"
            initialValues={initialValue}
          >
            {/* {this.dropdownView()} */}
            <Content>
              <div className="tab-view">
                <Tabs
                  activeKey={this.state.membershipTabKey != '4' ? this.state.membershipTabKey : '2'}
                  onChange={this.tabCallBack}
                >
                  <TabPane tab={AppConstants.membershipProduct} key="1">
                    <div className="tab-formView mt-5">{this.contentView()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.fees} key="2">
                    <div>{this.feesView()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.discount} key="3">
                    <div className="tab-formView" style={{ minHeight: 200 }}>
                      {this.discountView()}
                    </div>
                  </TabPane>
                </Tabs>
              </div>
              <Loader
                visible={
                  this.props.registrationState.onLoad ||
                  this.props.registrationState.onLoadMembership ||
                  this.props.registrationState.onLoadMembershipProduct
                }
              />
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
          {this.repayFeesModal()}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      regGetMembershipProductDetailsAction,
      regSaveMembershipProductDetailsAction,
      getOnlyYearListAction,
      getProductValidityListAction,
      regGetDefaultMembershipProductTypesAction,
      regSaveMembershipProductFeesAction,
      regSaveMembershipProductDiscountAction,
      getMembershipProductFeesTypeAction,
      membershipFeesTableInputChangeAction,
      getCommonDiscountTypeTypeAction,
      membershipProductDiscountTypesAction,
      addNewMembershipTypeAction,
      addRemoveDiscountAction,
      updatedDiscountDataAction,
      membershipFeesApplyRadioAction,
      onChangeAgeCheckBoxAction,
      updatedMembershipTypeDataAction,
      removeCustomMembershipTypeAction,
      regMembershipListDeleteAction,
      getAllowTeamRegistrationTypeAction,
      membershipPaymentOptionAction,
      getMembershipProductCategoryTypesAction,
      onChangeMembershipProductCategoryType,
      onChangeApplyRegistrationDatesCheckbox,
      onChangeRegistrationDates,
      onChangeAllowAtMatchFeesCheckbox,
      clearRegistrationMembershipFeeForm,
      getParentMembershipProductsAction,
      onChangeParentMembershipProduct,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    registrationState: state.RegistrationState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationMembershipFee);

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Table, Select, Pagination, Button, DatePicker, Tag, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { isEmptyArray } from 'formik';
import moment from 'moment';

import './product.scss';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { currencyFormat } from 'util/currencyFormat';
import { getOrganisationData, getGlobalYear, setGlobalYear } from 'util/sessionStorage';
import {
  getOnlyYearListAction,
  getFeeTypeAction,
  getPaymentOptionsListAction,
  getPaymentMethodsListAction,
} from 'store/actions/appAction';
import { getAffiliateToOrganisationAction } from 'store/actions/userAction/userAction';
import {
  getPaymentSummary,
  exportPaymentSummaryApi,
  setSummaryPageSizeAction,
  setSummaryPageNumberAction,
} from 'store/actions/stripeAction/stripeAction';
import { endUserRegDashboardListAction } from 'store/actions/registrationAction/endUserRegistrationAction';
import Loader from 'customComponents/loader';
import InputWithHead from 'customComponents/InputWithHead';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

const { Content } = Layout;
const { Option } = Select;
let thisObj = null;

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (thisObj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (thisObj.state.sortBy === key && thisObj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (thisObj.state.sortBy === key && thisObj.state.sortOrder === 'DESC') {
    sortBy = null;
    sortOrder = null;
  }

  let { paymentSummaryListPageSize } = thisObj.props.paymentState;
  paymentSummaryListPageSize = paymentSummaryListPageSize ? paymentSummaryListPageSize : 10;

  const {
    offset,
    userId,
    yearRefId,
    competitionUniqueKey,
    filterOrganisation,
    dateFrom,
    dateTo,
    searchText,
    feeType,
    paymentOption,
    paymentMethod,
    membershipType,
    paymentStatus,
  } = thisObj.state;

  thisObj.props.getPaymentSummary(
    offset,
    paymentSummaryListPageSize,
    sortBy,
    sortOrder,
    userId,
    '-1',
    yearRefId,
    competitionUniqueKey,
    filterOrganisation,
    dateFrom,
    dateTo,
    searchText,
    feeType,
    paymentOption,
    paymentMethod,
    membershipType,
    paymentStatus,
  );

  thisObj.setState({ sortBy, sortOrder });
}

// listeners for sorting
const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (userFirstName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: {
            userId: record.userId,
            screenKey: 'paymentSummary',
            screen: '/paymentSummary',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{userFirstName}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (userLastName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: {
            userId: record.userId,
            screenKey: 'paymentSummary',
            screen: '/paymentSummary',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{userLastName}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.teamName,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.membershipFees,
    children: [
      {
        title: AppConstants.paid,
        dataIndex: 'paid',
        key: 'paid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (paid, record) => currencyFormat(record.membership.paid),
      },
      {
        title: AppConstants.refunded,
        dataIndex: 'refunded',
        key: 'refunded',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (refunded, record) => currencyFormat(record.membership.refunded),
      },
      {
        title: AppConstants.declined,
        dataIndex: 'declined',
        key: 'declined',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (declined, record) => currencyFormat(record.membership.declined),
      },
      {
        title: AppConstants.owing,
        dataIndex: 'owing',
        key: 'owing',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (owing, record) => currencyFormat(record.membership.owing),
      },
    ],
  },
  {
    title: AppConstants.competitionOrganiser,
    children: [
      {
        title: AppConstants.nominationFeesPaid,
        dataIndex: 'nominationFeesPaid',
        key: 'nominationFeesPaid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.competitionNomination.paid),
      },
      {
        title: AppConstants.nominationFeesRefunded,
        dataIndex: 'nominationFeesRefunded',
        key: 'nominationFeesRefunded',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.competitionNomination.refunded),
      },
      {
        title: AppConstants.nominationFeesDeclined,
        dataIndex: 'nominationFeesDeclined',
        key: 'nominationFeesDeclined',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (fees, record) => currencyFormat(record.competitionNomination.declined),
      },
      {
        title: AppConstants.nominationFeesOwing,
        dataIndex: 'nominationFeesOwing',
        key: 'nominationFeesOwing',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesOwing, record) => currencyFormat(record.competitionNomination.owing),
      },
      {
        title: AppConstants.competitionFeesPaid,
        dataIndex: 'competitionFeesPaid',
        key: 'competitionFeesPaid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.competition.paid),
      },
      {
        title: AppConstants.competitionFeesRefunded,
        dataIndex: 'competitionFeesRefunded',
        key: 'competitionFeesRefunded',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.competition.refunded),
      },
      {
        title: AppConstants.competitionFeesDeclined,
        dataIndex: 'competitionFeesDeclined',
        key: 'competitionFeesDeclined',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (fees, record) => currencyFormat(record.competition.declined),
      },
      {
        title: AppConstants.competitionFeesOwing,
        dataIndex: 'competitionFeesOwing',
        key: 'competitionFeesOwing',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesOwing, record) => currencyFormat(record.competition.owing),
      },
    ],
  },
  {
    title: AppConstants.affiliateIfApplicable,
    children: [
      {
        title: AppConstants.nominationFeesPaid,
        dataIndex: 'affiliateNominationFeesPaid',
        key: 'affiliateNominationFeesPaid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.affiliateNomination.paid),
      },
      {
        title: AppConstants.nominationFeesRefunded,
        dataIndex: 'affiliateNominationFeesRefunded',
        key: 'affiliateNominationFeesRefunded',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.affiliateNomination.refunded),
      },
      {
        title: AppConstants.nominationFeesDeclined,
        dataIndex: 'affiliateNominationFeesDeclined',
        key: 'affiliateNominationFeesDeclined',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (fees, record) => currencyFormat(record.affiliateNomination.declined),
      },
      {
        title: AppConstants.nominationFeesOwing,
        dataIndex: 'affiliateNominationFeesOwing',
        key: 'affiliateNominationFeesOwing',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesOwing, record) => currencyFormat(record.affiliateNomination.owing),
      },
      {
        title: AppConstants.competitionFeesPaid,
        dataIndex: 'affiliateFeesPaid',
        key: 'affiliateFeesPaid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.affiliate.paid),
      },
      {
        title: AppConstants.competitionFeesRefunded,
        dataIndex: 'affiliateFeesRefunded',
        key: 'affiliateFeesRefunded',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesPaid, record) => currencyFormat(record.affiliate.refunded),
      },
      {
        title: AppConstants.competitionFeesDeclined,
        dataIndex: 'affiliateFeesDeclined',
        key: 'affiliateFeesDeclined',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (fees, record) => currencyFormat(record.affiliate.declined),
      },
      {
        title: AppConstants.competitionFeesOwing,
        dataIndex: 'affiliateFeesOwing',
        key: 'affiliateFeesOwing',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (feesOwing, record) => currencyFormat(record.affiliate.owing),
      },
    ],
  },
];

class PaymentSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organisationUniqueKey: getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null,
      yearRefId: null,
      competitionUniqueKey: '-1',
      filterOrganisation: -1,
      offset: 0,
      userInfo: null,
      userId: -1,
      registrationId: '-1',
      sortBy: null,
      sortOrder: null,
      dateFrom: null,
      dateTo: null,
      feeType: -1,
      paymentOption: -1,
      paymentMethod: -1,
      searchText: '',
      membershipType: -1,
      paymentStatus: -1,
    };

    thisObj = this;
  }

  async componentDidMount() {
    const { paymentDashboardListAction } = this.props.paymentState;
    this.referenceCalls(this.state.organisationUniqueKey);
    let page = 1;
    let { sortBy } = this.state;
    let { sortOrder } = this.state;
    if (paymentDashboardListAction) {
      const { offset } = paymentDashboardListAction;
      sortBy = paymentDashboardListAction.sortBy;
      sortOrder = paymentDashboardListAction.sortOrder;
      const registrationId =
        paymentDashboardListAction.registrationId == null
          ? '-1'
          : paymentDashboardListAction.registrationId;
      const userId =
        paymentDashboardListAction.userId == null ? -1 : paymentDashboardListAction.userId;
      const yearRefId = getGlobalYear() ? getGlobalYear() : paymentDashboardListAction.yearId;
      const competitionUniqueKey = paymentDashboardListAction.competitionKey;
      const { dateFrom } = paymentDashboardListAction;
      const { dateTo } = paymentDashboardListAction;
      const filterOrganisation = paymentDashboardListAction.paymentFor;

      await this.setState({
        offset,
        sortBy,
        sortOrder,
        registrationId,
        userId,
        yearRefId: JSON.parse(yearRefId),
        competitionUniqueKey,
        dateFrom,
        dateTo,
        filterOrganisation,
      });
      let { paymentSummaryListPageSize } = this.props.paymentState;
      paymentSummaryListPageSize = paymentSummaryListPageSize ? paymentSummaryListPageSize : 10;
      page = Math.floor(offset / paymentSummaryListPageSize) + 1;

      this.handlePaymentTableList(page, userId, registrationId, this.state.searchText);
    } else {
      const yearRefId = getGlobalYear() ? getGlobalYear() : '-1';
      const userInfo = this.props.location.state ? this.props.location.state.personal : null;
      const registrationId = this.props.location.state
        ? this.props.location.state.registrationId
        : null;
      this.setState({
        userInfo,
        registrationId,
        yearRefId: JSON.parse(yearRefId),
      });
      const userId = userInfo != null ? userInfo.userId : -1;
      const regId = registrationId != null ? registrationId : '-1';

      this.handlePaymentTableList(1, userId, regId, this.state.searchText);
    }
  }

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
    this.props.getOnlyYearListAction();
    this.props.getFeeTypeAction();
    this.props.getPaymentOptionsListAction();
    this.props.getPaymentMethodsListAction();
    this.props.endUserRegDashboardListAction(
      {
        organisationUniqueKey: this.state.organisationUniqueKey,
        yearRefId: 1,
        competitionUniqueKey: '-1',
        dobFrom: '-1',
        dobTo: '-1',
        membershipProductTypeId: -1,
        genderRefId: -1,
        postalCode: '-1',
        affiliate: -1,
        membershipProductId: -1,
        paymentId: -1,
        paymentStatusRefId: -1,
        searchText: '',
        teamId: -1,
        regFrom: '-1',
        regTo: '-1',
        paging: {
          limit: 10,
          offset: 0,
        },
      },
      null,
      null,
    );
  };

  onExport = () => {
    const {
      sortBy,
      sortOrder,
      yearRefId,
      competitionUniqueKey,
      filterOrganisation,
      dateFrom,
      dateTo,
      searchText,
      feeType,
      paymentOption,
      paymentMethod,
      paymentStatus,
      membershipType,
      offset,
      userId,
    } = this.state;

    const year = getGlobalYear() ? getGlobalYear() : '-1';

    this.props.exportPaymentSummaryApi(
      offset,
      sortBy,
      sortOrder,
      userId !== null ? userId : -1,
      '-1',
      yearRefId == -1 ? yearRefId : JSON.parse(year),
      competitionUniqueKey,
      filterOrganisation,
      dateFrom,
      dateTo,
      searchText,
      feeType,
      paymentOption,
      paymentMethod,
      membershipType,
      paymentStatus,
    );
  };

  clearFilterByUserId = () => {
    this.setState({ userInfo: null });
    this.handlePaymentTableList(this.state.offset, -1, '-1', this.state.searchText);
  };

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      this.handlePaymentTableList(
        1,
        this.state.userId !== null ? this.state.userId : -1,
        this.state.registrationId !== null ? this.state.registrationId : '-1',
        e.target.value,
        this.state.feeType,
        this.state.paymentOption,
        this.state.paymentMethod,
        this.state.membershipType,
      );
    }
  };

  onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      this.handlePaymentTableList(
        1,
        this.state.userId !== null ? this.state.userId : -1,
        this.state.registrationId !== null ? this.state.registrationId : '-1',
        this.state.searchText,
        this.state.feeType,
        this.state.paymentType,
        this.state.paymentMethod,
      );
    }
  };

  onClickSearchIcon = () => {
    if (this.state.searchText) {
      this.handlePaymentTableList(
        1,
        this.state.userId !== null ? this.state.userId : -1,
        this.state.registrationId !== null ? this.state.registrationId : '-1',
        this.state.searchText,
        this.state.feeType,
        this.state.paymentType,
        this.state.paymentMethod,
      );
    }
  };

  headerView = () => {
    const tagName =
      this.state.userInfo != null
        ? `${this.state.userInfo.firstName} ${this.state.userInfo.lastName}`
        : null;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <span className="form-heading">{AppConstants.paymentSummary}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                {this.state.userInfo && (
                  <div className="col-sm pt-1 align-self-center">
                    <Tag
                      closable
                      color="volcano"
                      style={{ paddingTop: 3, height: 30 }}
                      onClose={() => {
                        this.clearFilterByUserId();
                      }}
                    >
                      {tagName}
                    </Tag>
                  </div>
                )}

                <div className="pt-1 d-flex justify-content-end">
                  <div className="comp-product-search-inp-width">
                    <Input
                      className="product-reg-search-input"
                      onChange={this.onChangeSearchText}
                      placeholder="Search..."
                      onKeyPress={this.onKeyEnterSearchText}
                      value={this.state.searchText}
                      prefix={
                        <SearchOutlined
                          style={{
                            color: 'rgba(0,0,0,.25)',
                            height: 16,
                            width: 16,
                          }}
                          onClick={this.onClickSearchIcon}
                        />
                      }
                      allowClear
                    />
                  </div>
                </div>

                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      onClick={() => this.onExport()}
                      className="primary-add-comp-form"
                      type="primary"
                    >
                      <div className="row">
                        <div className="col-sm">
                          <img src={AppImages.export} alt="" className="export-image" />
                          {AppConstants.export}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setSummaryPageSizeAction(pageSize);
    const { userId, registrationId, searchText } = this.state;
    this.handlePaymentTableList(page, userId, registrationId, searchText);
  };

  handlePaymentTableList = async (page, userId, regId, searchValue) => {
    await this.props.setSummaryPageNumberAction(page);
    const {
      sortBy,
      sortOrder,
      yearRefId,
      competitionUniqueKey,
      filterOrganisation,
      dateFrom,
      dateTo,
      feeType,
      paymentOption,
      paymentMethod,
      membershipType,
      paymentStatus,
    } = this.state;

    let { paymentSummaryListPageSize } = this.props.paymentState;
    paymentSummaryListPageSize = paymentSummaryListPageSize ? paymentSummaryListPageSize : 10;

    const offset = page ? paymentSummaryListPageSize * (page - 1) : 0;
    const year = getGlobalYear() ? getGlobalYear() : '-1';

    this.setState({
      offset,
      userId,
      registrationId: regId,
    });

    this.props.getPaymentSummary(
      offset,
      paymentSummaryListPageSize,
      sortBy,
      sortOrder,
      userId,
      '-1',
      yearRefId == -1 ? yearRefId : JSON.parse(year),
      competitionUniqueKey,
      filterOrganisation,
      dateFrom,
      dateTo,
      searchValue,
      feeType,
      paymentOption,
      paymentMethod,
      membershipType,
      paymentStatus,
    );
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({ yearRefId: value });
      if (value != -1) {
        setGlobalYear(value);
      }
      this.handlePaymentTableList(1, -1, null, this.state.searchText);
    } else if (key === 'competitionId') {
      await this.setState({ competitionUniqueKey: value });
      this.handlePaymentTableList(1, -1, null, this.state.searchText);
    } else if (key === 'filterOrganisation') {
      await this.setState({ filterOrganisation: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dateFrom') {
      await this.setState({
        dateFrom: value ? moment(value).startOf('day').format('YYYY-MM-DD HH:mm:ss') : value,
      });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dateTo') {
      await this.setState({
        dateTo: value ? moment(value).endOf('day').format('YYYY-MM-DD HH:mm:ss') : value,
      });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'feeType') {
      await this.setState({ feeType: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentOption') {
      await this.setState({ paymentOption: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentMethod') {
      await this.setState({ paymentMethod: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'membershipType') {
      await this.setState({ membershipType: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentStatus') {
      await this.setState({ paymentStatus: value });
      this.handlePaymentTableList(1, -1, '-1', this.state.searchText);
    }
  };

  dropdownView = () => {
    const affiliateToData = this.props.userState.affiliateTo;
    let uniqueValues = [];
    // const paymentStatus = [
    //     { id: 1, description: AppConstants.pendingMembership },
    //     { id: 2, description: AppConstants.pendingRegistrationFee },
    //     { id: 3, description: AppConstants.registered },
    // ];

    if (affiliateToData.affiliatedTo !== undefined) {
      const obj = {
        organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
        name: getOrganisationData() ? getOrganisationData().name : null,
      };
      uniqueValues.push(obj);
      const arr = [
        ...new Map(affiliateToData.affiliatedTo.map(obj => [obj.organisationId, obj])).values(),
      ];
      if (isEmptyArray) {
        uniqueValues = [...uniqueValues, ...arr];
      }
    }

    const { paymentCompetitionList } = this.props.paymentState;
    return (
      <div>
        <div className="row pb-2">
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.year} />
            <Select
              className="reg-payment-select w-100"
              style={{
                paddingRight: 1,
                minWidth: 160,
                maxHeight: 60,
                minHeight: 44,
              }}
              onChange={yearRefId => this.onChangeDropDownValue(yearRefId, 'yearRefId')}
              value={this.state.yearRefId}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {this.props.appState.yearList.map(item => (
                <Option key={`year_${item.id}`} value={item.id}>
                  {item.description}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.competition} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={competitionId => this.onChangeDropDownValue(competitionId, 'competitionId')}
              value={this.state.competitionUniqueKey}
            >
              <Option key={-1} value="-1">
                {AppConstants.all}
              </Option>
              {(paymentCompetitionList || []).map(item => (
                <Option
                  // key={'competition_' + item.competitionUniquekey}
                  key={item.competitionUniquekey}
                  value={item.competitionUniqueKey}
                >
                  {item.competitionName}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.paymentFor} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={e => this.onChangeDropDownValue(e, 'filterOrganisation')}
              value={this.state.filterOrganisation}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {(uniqueValues || []).map(org => (
                <Option key={`organisation_${org.organisationId}`} value={org.organisationId}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3 pt-2">
            <InputWithHead required="pt-0" heading={AppConstants.status} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={status => this.onChangeDropDownValue(status, 'paymentStatus')}
              value={this.state.paymentStatus}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              <Option key="paid" value={2}>
                {AppConstants.paid}
              </Option>
              <Option key="pending" value={1}>
                {AppConstants.pending}
              </Option>
              <Option key="declined" value={6}>
                {AppConstants.declined}
              </Option>
            </Select>
          </div>
        </div>

        <div className="row pb-2">
          {/* <div className="col-sm-3">
                        <InputWithHead required="pt-0" heading={AppConstants.feeType} />
                        <Select
                            showSearch
                            optionFilterProp="children"
                            className="reg-payment-select w-100"
                            style={{ paddingRight: 1, minWidth: 160 }}
                            onChange={(feeType) => this.onChangeDropDownValue(feeType, "feeType")}
                            value={this.state.feeType}
                        >
                            <Option key={-1} value={-1}>{AppConstants.all}</Option>
                            {this.props.appState.feeTypes.map((feeType) => (
                                <Option key={`feeType_${feeType.id}`} value={feeType.name}>
                                    {feeType.description}
                                </Option>
                            ))}
                        </Select>
                    </div> */}
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.paymentType} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={paymentOption => this.onChangeDropDownValue(paymentOption, 'paymentOption')}
              value={this.state.paymentOption}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {this.props.appState.paymentOptions.map(paymentOption => (
                <Option key={`paymentOption_${paymentOption.id}`} value={paymentOption.id}>
                  {paymentOption.description}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.paymentMethod} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={paymentMethod => this.onChangeDropDownValue(paymentMethod, 'paymentMethod')}
              value={this.state.paymentMethod}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {this.props.appState.paymentMethods.map(paymentMethod => (
                <Option key={`paymentMethod_${paymentMethod.id}`} value={paymentMethod.name}>
                  {paymentMethod.description}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.membershipType} />
            <Select
              showSearch
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={membershipType =>
                this.onChangeDropDownValue(membershipType, 'membershipType')
              }
              value={this.state.membershipType}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {this.props.userRegistrationState.membershipProductTypes.map(mt => (
                <Option key={`mt_${mt.id}`} value={mt.membershipProductTypeId}>
                  {mt.membershipProductTypeName}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="row pb-5">
          <div className="col-sm-3 pt-2">
            <InputWithHead required="pt-0" heading={AppConstants.dateFrom} />
            <DatePicker
              className="reg-payment-datepicker w-100"
              size="default"
              style={{ minWidth: 160 }}
              format="DD-MM-YYYY"
              showTime={false}
              placeholder="dd-mm-yyyy"
              onChange={e => this.onChangeDropDownValue(e, 'dateFrom')}
              value={this.state.dateFrom !== null && moment(this.state.dateFrom, 'YYYY-MM-DD')}
            />
          </div>
          <div className="col-sm-3 pt-2">
            <InputWithHead required="pt-0" heading={AppConstants.dateTo} />
            <DatePicker
              className="reg-payment-datepicker w-100"
              size="default"
              style={{ minWidth: 160 }}
              format="DD-MM-YYYY"
              showTime={false}
              placeholder="dd-mm-yyyy"
              onChange={e => this.onChangeDropDownValue(e, 'dateTo')}
              value={this.state.dateTo !== null && moment(this.state.dateTo, 'YYYY-MM-DD')}
            />
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const userId = this.state.userInfo != null ? this.state.userInfo.userId : -1;
    const regId = this.state.registrationId != null ? this.state.registrationId : '-1';
    const {
      paymentSummaryListTotalCount,
      paymentSummaryList,
      paymentSummaryListPage,
      onLoad,
      paymentSummaryListPageSize,
    } = this.props.paymentState;

    return (
      <div className="comp-dash-table-view mt-2">
        {this.dropdownView()}

        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            bordered
            columns={columns}
            dataSource={paymentSummaryList}
            pagination={false}
            loading={onLoad && true}
          />
        </div>

        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={paymentSummaryListPage}
            defaultCurrent={paymentSummaryListPage}
            defaultPageSize={paymentSummaryListPageSize}
            total={paymentSummaryListTotalCount}
            onChange={page =>
              this.handlePaymentTableList(page, userId, regId, this.state.searchText)
            }
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.finance} menuName={AppConstants.finance} />

        <InnerHorizontalMenu menu="finance" finSelectedKey="5" />

        <Loader visible={this.props.paymentState.onExportLoad} />

        <Layout>
          {this.headerView()}
          <Content>{this.contentView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getOnlyYearListAction,
      getFeeTypeAction,
      getPaymentOptionsListAction,
      getPaymentMethodsListAction,
      getPaymentSummary,
      exportPaymentSummaryApi,
      getAffiliateToOrganisationAction,
      endUserRegDashboardListAction,
      setSummaryPageSizeAction,
      setSummaryPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    paymentState: state.StripeState,
    appState: state.AppState,
    userState: state.UserState,
    userRegistrationState: state.EndUserRegistrationState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentSummary);

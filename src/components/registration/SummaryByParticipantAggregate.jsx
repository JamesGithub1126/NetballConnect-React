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
  getParticipantSummaryAction,
  exportParticipantSummaryApiAction,
  setParticipantSummaryPageSizeAction,
  setParticipantSummaryPageNumberAction,
} from 'store/actions/stripeAction/stripeAction';
import { endUserRegDashboardListAction } from 'store/actions/registrationAction/endUserRegistrationAction';
import Loader from 'customComponents/loader';
import InputWithHead from 'customComponents/InputWithHead';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import registration from './registration';
import CustomTooltip from 'react-png-tooltip';

const { Content } = Layout;
const { Option } = Select;
let thisObj = null;
const version = 2;

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

  let { participantSummaryListPageSize } = thisObj.props.paymentState;
  participantSummaryListPageSize = participantSummaryListPageSize
    ? participantSummaryListPageSize
    : 10;

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
    dobFrom,
    dobTo,
    membershipProduct,
  } = thisObj.state;

  thisObj.props.getParticipantSummaryAction(
    offset,
    participantSummaryListPageSize,
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
    dobFrom,
    dobTo,
    version,
    membershipProduct,
  );

  thisObj.setState({ sortBy, sortOrder });
}

// listeners for sorting
const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.participant_firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    fixed: 'left',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (userFirstName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: {
            userId: record.userId,
            screenKey: 'summaryByParticipant',
            screen: '/summaryByParticipant',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{userFirstName}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.participant_lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    fixed: 'left',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (userLastName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: {
            userId: record.userId,
            screenKey: 'summaryByParticipant',
            screen: '/summaryByParticipant',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{userLastName}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.registrationDate,
    dataIndex: 'registrationDate',
    key: 'registrationDate',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.participant_id,
    dataIndex: 'userId',
    key: 'userId',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (userId, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: {
            userId: record.userId,
            screenKey: 'summaryByParticipant',
            screen: '/summaryByParticipant',
          },
        }}
      >
        <span className="input-heading-add-another pt-0">{userId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.receiptId,
    dataIndex: 'receiptId',
    key: 'receiptId',
    sorter: false,
    width: 200,
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipTypeName',
    key: 'membershipTypeName',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.registration + ' ' + AppConstants.status,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.total,
    children: [
      {
        title: AppConstants.fees,
        dataIndex: 'fee',
        key: 'fee',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: fee => currencyFormat(fee),
      },
      {
        title: AppConstants.registration,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'registrationPaid',
            key: 'registrationPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: registrationPaid => currencyFormat(registrationPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'registrationPending',
            key: 'registrationPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: registrationPending => currencyFormat(registrationPending),
          },
        ],
      },
      {
        title: AppConstants.charity,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'charityPaid',
            key: 'charityPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: charityPaid => currencyFormat(charityPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'charityPending',
            key: 'charityPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: charityPending => currencyFormat(charityPending),
          },
        ],
      },
      {
        title: AppConstants.shop,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'shopPaid',
            key: 'shopPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: shopPaid => currencyFormat(shopPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'shopPending',
            key: 'shopPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: shopPending => currencyFormat(shopPending),
          },
        ],
      },
    ],
  },
  {
    title: AppConstants.competitionName,
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.competitionOrganiser,
    dataIndex: 'competitionOrganiser',
    key: 'competitionOrganiser',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.affiliate,
    children: [
      {
        title: AppConstants.portion,
        children: [
          {
            title: AppConstants.total,
            dataIndex: 'affiliateAmount',
            key: 'affiliateAmount',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateAmount => currencyFormat(affiliateAmount),
          },
          {
            title: AppConstants.paid,
            dataIndex: 'affiliateAmountPaid',
            key: 'affiliateAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateAmountPaid => currencyFormat(affiliateAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'affiliateAmountPending',
            key: 'affiliateAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateAmountPending => currencyFormat(affiliateAmountPending),
          },
          {
            title: AppConstants.failed,
            dataIndex: 'affiliateAmountFailed',
            key: 'affiliateAmountFailed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateAmountFailed => currencyFormat(affiliateAmountFailed),
          },
        ],
      },
      {
        title: AppConstants.instalmentPortion,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'affiliateInstalmentAmountPaid',
            key: 'affiliateInstalmentAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateInstalmentAmountPaid => currencyFormat(affiliateInstalmentAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'affiliateInstalmentAmountPending',
            key: 'affiliateInstalmentAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateInstalmentAmountPending =>
              currencyFormat(affiliateInstalmentAmountPending),
          },
        ],
      },
      {
        title: AppConstants.governmentVoucher,
        children: [
          {
            title: AppConstants.redeemed,
            dataIndex: 'affiliateGovernmentVoucherAmountRedeemed',
            key: 'affiliateGovernmentVoucherAmountRedeemed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateGovernmentVoucherAmountRedeemed =>
              currencyFormat(affiliateGovernmentVoucherAmountRedeemed),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'affiliateGovernmentVoucherAmountPending',
            key: 'affiliateGovernmentVoucherAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: affiliateGovernmentVoucherAmountPending =>
              currencyFormat(affiliateGovernmentVoucherAmountPending),
          },
        ],
      },
      {
        title: AppConstants.discount,
        dataIndex: 'affiliateDiscountAmount',
        key: 'affiliateDiscountAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: affiliateDiscountAmount => currencyFormat(affiliateDiscountAmount),
      },
      {
        title: AppConstants.partialRefund,
        dataIndex: 'affiliateRefundAmount',
        key: 'affiliateRefundAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: affiliateRefundAmount => currencyFormat(affiliateRefundAmount),
      },
    ],
  },
  {
    title: AppConstants.competitionOrganiser,
    children: [
      {
        title: AppConstants.portion,
        children: [
          {
            title: AppConstants.total,
            dataIndex: 'competitionOrganiserAmount',
            key: 'competitionOrganiserAmount',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserAmount => currencyFormat(competitionOrganiserAmount),
          },
          {
            title: AppConstants.paid,
            dataIndex: 'competitionOrganiserAmountPaid',
            key: 'competitionOrganiserAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserAmountPaid =>
              currencyFormat(competitionOrganiserAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'competitionOrganiserAmountPending',
            key: 'competitionOrganiserAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserAmountPending =>
              currencyFormat(competitionOrganiserAmountPending),
          },
          {
            title: AppConstants.failed,
            dataIndex: 'competitionOrganiserAmountFailed',
            key: 'competitionOrganiserAmountFailed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserAmountFailed =>
              currencyFormat(competitionOrganiserAmountFailed),
          },
        ],
      },
      {
        title: AppConstants.instalmentPortion,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'competitionOrganiserInstalmentAmountPaid',
            key: 'competitionOrganiserInstalmentAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserInstalmentAmountPaid =>
              currencyFormat(competitionOrganiserInstalmentAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'competitionOrganiserInstalmentAmountPending',
            key: 'competitionOrganiserInstalmentAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserInstalmentAmountPending =>
              currencyFormat(competitionOrganiserInstalmentAmountPending),
          },
        ],
      },
      {
        title: AppConstants.governmentVoucher,
        children: [
          {
            title: AppConstants.redeemed,
            dataIndex: 'competitionOrganiserGovernmentVoucherAmountRedeemed',
            key: 'competitionOrganiserGovernmentVoucherAmountRedeemed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserGovernmentVoucherAmountRedeemed =>
              currencyFormat(competitionOrganiserGovernmentVoucherAmountRedeemed),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'competitionOrganiserGovernmentVoucherAmountPending',
            key: 'competitionOrganiserGovernmentVoucherAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: competitionOrganiserGovernmentVoucherAmountPending =>
              currencyFormat(competitionOrganiserGovernmentVoucherAmountPending),
          },
        ],
      },
      {
        title: AppConstants.discount,
        dataIndex: 'competitionOrganiserDiscountAmount',
        key: 'competitionOrganiserDiscountAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: competitionOrganiserDiscountAmount =>
          currencyFormat(competitionOrganiserDiscountAmount),
      },
      {
        title: AppConstants.partialRefund,
        dataIndex: 'competitionOrganiserRefundAmount',
        key: 'competitionOrganiserRefundAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: competitionOrganiserRefundAmount =>
          currencyFormat(competitionOrganiserRefundAmount),
      },
    ],
  },
  {
    title: AppConstants.membership,
    children: [
      {
        title: AppConstants.portion,
        children: [
          {
            title: AppConstants.total,
            dataIndex: 'membershipAmount',
            key: 'membershipAmount',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipAmount => currencyFormat(membershipAmount),
          },
          {
            title: AppConstants.paid,
            dataIndex: 'membershipAmountPaid',
            key: 'membershipAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipAmountPaid => currencyFormat(membershipAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'membershipAmountPending',
            key: 'membershipAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipAmountPending => currencyFormat(membershipAmountPending),
          },
          {
            title: AppConstants.failed,
            dataIndex: 'membershipAmountFailed',
            key: 'membershipAmountFailed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipAmountFailed => currencyFormat(membershipAmountFailed),
          },
        ],
      },
      {
        title: AppConstants.instalmentPortion,
        children: [
          {
            title: AppConstants.paid,
            dataIndex: 'membershipInstalmentAmountPaid',
            key: 'membershipInstalmentAmountPaid',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipInstalmentAmountPaid =>
              currencyFormat(membershipInstalmentAmountPaid),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'membershipInstalmentAmountPending',
            key: 'membershipInstalmentAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipInstalmentAmountPending =>
              currencyFormat(membershipInstalmentAmountPending),
          },
        ],
      },
      {
        title: AppConstants.governmentVoucher,
        children: [
          {
            title: AppConstants.redeemed,
            dataIndex: 'membershipGovernmentVoucherAmountRedeemed',
            key: 'membershipGovernmentVoucherAmountRedeemed',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipGovernmentVoucherAmountRedeemed =>
              currencyFormat(membershipGovernmentVoucherAmountRedeemed),
          },
          {
            title: AppConstants.pending,
            dataIndex: 'membershipGovernmentVoucherAmountPending',
            key: 'membershipGovernmentVoucherAmountPending',
            sorter: true,
            width: 200,
            onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
            render: membershipGovernmentVoucherAmountPending =>
              currencyFormat(membershipGovernmentVoucherAmountPending),
          },
        ],
      },
      {
        title: AppConstants.discount,
        dataIndex: 'membershipDiscountAmount',
        key: 'membershipDiscountAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: membershipDiscountAmount => currencyFormat(membershipDiscountAmount),
      },
      {
        title: AppConstants.partialRefund,
        dataIndex: 'membershipRefundAmount',
        key: 'membershipRefundAmount',
        sorter: true,
        width: 200,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: membershipRefundAmount => currencyFormat(membershipRefundAmount),
      },
    ],
  },
  {
    title: AppConstants.paymentMethod,
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: paymentMethod => {
      switch (paymentMethod) {
        case 'direct_debit':
          return AppConstants.directDebit;
        case 'card':
          return AppConstants.creditCard;
        case 'cash':
          return AppConstants.cash;
      }
    },
  },
  {
    title: AppConstants.paidBy,
    dataIndex: 'paidBy',
    key: 'paidBy',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.voucherOrDiscountCode,
    dataIndex: 'governmentVoucherNumber',
    key: 'governmentVoucherNumber',
    sorter: true,
    width: 200,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
];

class SummaryByParticipantAggregate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organisationUniqueKey: getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null,
      yearRefId: null,
      competitionUniqueKey: ['-1'],
      filterOrganisation: [-1],
      offset: 0,
      userInfo: null,
      userId: -1,
      registrationId: '-1',
      sortBy: null,
      sortOrder: null,
      dateFrom: null,
      dateTo: null,
      feeType: -1,
      paymentOption: [-1],
      paymentMethod: [-1],
      searchText: '',
      membershipType: [-1],
      paymentStatus: -1,
      dobFrom: null,
      dobTo: null,
      membershipProduct: [-1],
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
      const { dateFrom, dateTo } = paymentDashboardListAction;
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
      let { participantSummaryListPageSize } = this.props.paymentState;
      participantSummaryListPageSize = participantSummaryListPageSize
        ? participantSummaryListPageSize
        : 10;
      page = Math.floor(offset / participantSummaryListPageSize) + 1;

      this.handleSummaryList(page, userId, registrationId, this.state.searchText);
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

      this.handleSummaryList(1, userId, regId, this.state.searchText);
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
      dobFrom,
      dobTo,
      membershipProduct,
    } = this.state;

    const year = getGlobalYear() ? getGlobalYear() : '-1';

    this.props.exportParticipantSummaryApiAction(
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
      dobFrom,
      dobTo,
      version,
      membershipProduct,
    );
  };

  clearFilterByUserId = () => {
    this.setState({ userInfo: null });
    this.handleSummaryList(this.state.offset, -1, '-1', this.state.searchText);
  };

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value, offset: 0 });
    if (e.target.value === null || e.target.value === '') {
      this.handleSummaryList(
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
      this.handleSummaryList(
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
      this.handleSummaryList(
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
              <span className="form-heading">{AppConstants.summaryByParticipant}</span>
            </div>

            <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
              <div className="row">
                {this.state.userInfo && (
                  <div className="col-sm pt-1 align-self-center">
                    <Tag
                      closable
                      color="volcano"
                      style={{
                        paddingTop: 3,
                        height: 30,
                      }}
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
    await this.props.setParticipantSummaryPageSizeAction(pageSize);
  };

  handleSummaryList = async (page, userId, regId, searchValue) => {
    await this.props.setParticipantSummaryPageNumberAction(page);
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
      dobFrom,
      dobTo,
      membershipProduct,
    } = this.state;

    let { participantSummaryListPageSize } = this.props.paymentState;
    participantSummaryListPageSize = participantSummaryListPageSize
      ? participantSummaryListPageSize
      : 10;

    const offset = page ? participantSummaryListPageSize * (page - 1) : 0;
    const year = getGlobalYear() ? getGlobalYear() : '-1';

    this.setState({
      offset,
      userId,
      registrationId: regId,
    });

    this.props.getParticipantSummaryAction(
      offset,
      participantSummaryListPageSize,
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
      dobFrom,
      dobTo,
      version,
      membershipProduct,
    );
  };

  getMultipleOptions = options => {
    if (options.length === 0 || options[options.length - 1].toString() === '-1') {
      return [-1];
    } else {
      return options.filter(i => i.toString() !== '-1');
    }
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({ yearRefId: value });
      if (value != -1) {
        setGlobalYear(value);
      }
      this.handleSummaryList(1, -1, null, this.state.searchText);
    } else if (key === 'competitionId') {
      const options = this.getMultipleOptions(value);
      await this.setState({ competitionUniqueKey: options.map(i => i.toString()) });
      this.handleSummaryList(1, -1, null, this.state.searchText);
    } else if (key === 'filterOrganisation') {
      const options = this.getMultipleOptions(value);
      await this.setState({ filterOrganisation: options });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dateFrom') {
      await this.setState({
        dateFrom: value ? moment(value).startOf('day').format('YYYY-MM-DD HH:mm:ss') : value,
      });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dateTo') {
      await this.setState({
        dateTo: value ? moment(value).endOf('day').format('YYYY-MM-DD HH:mm:ss') : value,
      });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'feeType') {
      await this.setState({ feeType: value });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentOption') {
      const options = this.getMultipleOptions(value);
      await this.setState({ paymentOption: options });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentMethod') {
      const options = this.getMultipleOptions(value);
      await this.setState({ paymentMethod: options });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'membershipType') {
      const options = this.getMultipleOptions(value);
      await this.setState({ membershipType: options });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'paymentStatus') {
      await this.setState({ paymentStatus: value });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dobFrom') {
      await this.setState({
        dobFrom: value ? moment(value).startOf('day').format('YYYY-MM-DD') : value,
      });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'dobTo') {
      await this.setState({
        dobTo: value ? moment(value).endOf('day').format('YYYY-MM-DD') : value,
      });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
    } else if (key === 'membershipProduct') {
      const options = this.getMultipleOptions(value);
      await this.setState({ membershipProduct: options });
      this.handleSummaryList(1, -1, '-1', this.state.searchText);
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

    const { participantCompetitionList, membershipProducts } = this.props.paymentState;

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
              mode="multiple"
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={competitionId => this.onChangeDropDownValue(competitionId, 'competitionId')}
              value={this.state.competitionUniqueKey}
            >
              <Option key={-1} value="-1">
                {AppConstants.all}
              </Option>
              {(participantCompetitionList || []).map(item => (
                <Option
                  key={`competition_${item.competitionUniquekey}`}
                  value={item.competitionUniquekey}
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
              mode="multiple"
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
                {AppConstants.failed}
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
              mode="multiple"
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
              mode="multiple"
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
              mode="multiple"
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
                <Option key={`mt_${mt.membershipProductTypeId}`} value={mt.membershipProductTypeId}>
                  {mt.membershipProductTypeName}
                </Option>
              ))}
            </Select>
          </div>
          <div className="col-sm-3">
            <InputWithHead required="pt-0" heading={AppConstants.membershipProduct} />
            <Select
              showSearch
              mode="multiple"
              optionFilterProp="children"
              className="reg-payment-select w-100"
              style={{ paddingRight: 1, minWidth: 160 }}
              onChange={membershipProduct =>
                this.onChangeDropDownValue(membershipProduct, 'membershipProduct')
              }
              value={this.state.membershipProduct}
            >
              <Option key={-1} value={-1}>
                {AppConstants.all}
              </Option>
              {membershipProducts.map(mp => (
                <Option key={`mp_${mp.membershipProductId}`} value={mp.membershipProductId}>
                  {mp.membershipProductName}
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
          <div className="col-sm-3 pt-2">
            <InputWithHead required="pt-0" heading={AppConstants.dobFrom} />
            <DatePicker
              className="reg-payment-datepicker w-100"
              size="default"
              style={{ minWidth: 160 }}
              format="DD-MM-YYYY"
              showTime={false}
              placeholder="dd-mm-yyyy"
              onChange={e => this.onChangeDropDownValue(e, 'dobFrom')}
              value={this.state.dobFrom !== null && moment(this.state.dobFrom, 'YYYY-MM-DD')}
            />
          </div>
          <div className="col-sm-3 pt-2">
            <InputWithHead required="pt-0" heading={AppConstants.dobTo} />
            <DatePicker
              className="reg-payment-datepicker w-100"
              size="default"
              style={{ minWidth: 160 }}
              format="DD-MM-YYYY"
              showTime={false}
              placeholder="dd-mm-yyyy"
              onChange={e => this.onChangeDropDownValue(e, 'dobTo')}
              value={this.state.dobTo !== null && moment(this.state.dobTo, 'YYYY-MM-DD')}
            />
          </div>
        </div>
      </div>
    );
  };

  countView = () => {
    const {
      numberOfRegistrations,
      totalRevenue,
      totalPaid,
      totalPending,
      grossRegistrationValue,
      uniqueRegistrants,
    } = this.props.paymentState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="row">
          <div className="col-sm-4">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.numberOfRegistrations}</div>
              <div className="reg-payment-price-text">{numberOfRegistrations}</div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.uniqueRegisteredUsers}</div>
              <div className="reg-payment-price-text">{uniqueRegistrants || 0}</div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.totalRevenue}</div>
              <div className="reg-payment-price-text">{currencyFormat(totalRevenue || 0)}</div>
            </div>
          </div>
          <div className="col-sm-4  mt-2">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.valueOfRegistrations}</div>
              <div className="reg-payment-price-text">
                {currencyFormat(grossRegistrationValue || 0)}
              </div>
            </div>
          </div>
          <div className="col-sm-4 mt-2">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.totalPaid}</div>
              <div className="reg-payment-price-text">{currencyFormat(totalPaid || 0)}</div>
            </div>
          </div>
          <div className="col-sm-4 mt-2">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">{AppConstants.totalPendingAndFailed}</div>
              <div className="reg-payment-price-text">{currencyFormat(totalPending || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const userId = this.state.userInfo != null ? this.state.userInfo.userId : -1;
    const regId = this.state.registrationId != null ? this.state.registrationId : '-1';
    const {
      participantSummaryListTotalCount,
      participantSummaryList,
      participantSummaryListPage,
      onLoad,
      participantSummaryListPageSize,
    } = this.props.paymentState;

    return (
      <div className="comp-dash-table-view mt-2">
        {this.dropdownView()}
        {this.countView()}

        <div className="table-responsive home-dash-table-view participant-summary-table-overflow">
          <Table
            className="home-dashboard-table"
            bordered
            columns={columns}
            dataSource={participantSummaryList}
            pagination={false}
            loading={onLoad && true}
            size="middle"
            scroll={{ x: 'calc(300%)', y: 500 }}
          />
        </div>

        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={participantSummaryListPage}
            defaultCurrent={participantSummaryListPage}
            defaultPageSize={participantSummaryListPageSize}
            total={participantSummaryListTotalCount}
            onChange={page => this.handleSummaryList(page, userId, regId, this.state.searchText)}
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

        <InnerHorizontalMenu menu="finance" finSelectedKey="6" />

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
      getParticipantSummaryAction,
      exportParticipantSummaryApiAction,
      getAffiliateToOrganisationAction,
      endUserRegDashboardListAction,
      setParticipantSummaryPageSizeAction,
      setParticipantSummaryPageNumberAction,
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

export default connect(mapStateToProps, mapDispatchToProps)(SummaryByParticipantAggregate);

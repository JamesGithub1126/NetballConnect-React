import React, { Component, createRef } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Button,
  Table,
  Select,
  Input,
  Modal,
  Checkbox,
  Pagination,
  Tooltip as AntdTooltip,
  message,
  Menu,
  Popover,
  Dropdown,
  Form,
  DatePicker,
} from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { getOnlyYearListAction } from '../../store/actions/appAction';

import AppConstants from 'themes/appConstants';
import { isArrayNotEmpty, isNullOrUndefined } from 'util/helpers';
import { umpireYearChangedAction } from 'store/actions/umpireAction/umpireDashboardAction';
import { umpireCompetitionListAction } from 'store/actions/umpireAction/umpireCompetetionAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import {
  getUmpireDashboardVenueList,
  getUmpireDashboardDivisionList,
  umpireRoundListAction,
  umpireDashboardUpdate,
} from 'store/actions/umpireAction/umpireDashboardAction';
import {
  getUmpirePaymentData,
  resetUmpirePaymentData,
  updateUmpirePaymentData,
  umpirePaymentTransferData,
  setPageSizeAction,
  setPageNumberAction,
  getAdminListAction,
  umpirePaymentAction,
  updateExtraAmountAction,
  bulkUpdateAuth2Action,
  restoreInitUmpireData,
  getUmpirePaymentLinkedOrganisationData,
} from '../../store/actions/umpireAction/umpirePaymentAction';
import {
  getUmpireCompetitionId,
  getOrganisationData,
  getUmpireCompetitionData,
  getGlobalYear,
  setGlobalYear,
  getLiveScoreCompetition,
  setCompDataForAll,
} from 'util/sessionStorage';
import { checkLivScoreCompIsParent } from 'util/permissions';
import './umpire.css';
import Loader from '../../customComponents/loader';
import AppImages from 'themes/appImages';
import moment from 'moment';
import { exportFilesAction } from 'store/actions/umpireAction/umpirePaymentAction';
import { isEqual } from 'lodash';
import { currencyFormat } from '../../util/currencyFormat';
import {
  MatchUmpirePaymentStatus,
  UmpirePaymentAction,
  UmpirePaymentDescription,
} from '../../enums/enums';
import Tooltip from 'react-png-tooltip';
import { getPaymentTypeDescription } from 'util/umpireHelper';
import { getCurrentYear } from 'util/permissions';
import { ConfirmModal } from 'customComponents/confirmModal';
import ValidationConstants from 'themes/validationConstant';
import { PaymentTypeName } from 'util/enums';

const { Content, Footer } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;
const { confirm } = Modal;
const { RangePicker } = DatePicker;
let this_obj = null;

const MAX_EXTRA_AMOUNT = 1000.0;

const INIT_EXTRA_PAYMENT_FORM_DATA = {
  extraAmountReason: null,
  bulkExtraAmount: null,
};

const INIT_AUTHORIZER2_FORM_DATA = {
  bulkAuthorizer2Id: null,
};

const payMenuItem = record => (
  <Menu.Item
    key="1"
    onClick={() =>
      this_obj.setState({
        showPaymentActionConfirmModal: true,
        actionUmpire: record,
        actionType: UmpirePaymentAction.Pay,
      })
    }
  >
    <span>{AppConstants.pay}</span>
  </Menu.Item>
);

const refundMenuItem = record => {
  const isOfflineRefund = record.paymentType === PaymentTypeName.Offline;
  return (
    <Menu.Item
      key="1"
      onClick={() =>
        isOfflineRefund
          ? this_obj.paymentAction(record, UmpirePaymentAction.Refund)
          : this_obj.setState({
              showPaymentActionConfirmModal: true,
              actionUmpire: record,
              actionType: UmpirePaymentAction.Refund,
            })
      }
    >
      <span>{isOfflineRefund ? AppConstants.markAsRefunded : AppConstants.refund}</span>
    </Menu.Item>
  );
};

const markedAsPaidMenuItem = record => (
  <Menu.Item key="4" onClick={() => this_obj.paymentAction(record, UmpirePaymentAction.MarkAsPaid)}>
    <span>{AppConstants.markAsPaidPay}</span>
  </Menu.Item>
);

const retryPaymentMenueItem = record => (
  <Menu.Item
    key="2"
    onClick={() =>
      this_obj.setState({
        showPaymentActionConfirmModal: true,
        actionUmpire: record,
        actionType: UmpirePaymentAction.Retry,
      })
    }
  >
    <span>{AppConstants.retryPayment}</span>
  </Menu.Item>
);

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  this_obj.setState({ sortBy, sortOrder }, () => this_obj.fetchUmpireData());
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const isShowTickOnActivity = match => {
  if (!match || !match.competition || !match.matchAction) {
    return false;
  }
  const verifiedScores =
    match.competition.acceptScoring === 'SCORER'
      ? 'N/A'
      : match.matchAction.nextAction === 'VERIFY_SCORES'
      ? 'No'
      : 'Yes';
  if (verifiedScores === 'Yes' && match.matchAction.verifiedActionLogs) {
    return true;
  }
  return false;
};

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'First Name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: {
            userId: record.userId,
            screenKey: 'umpire',
            screen: '/umpirePayment',
          },
        }}
      >
        {record.user && (
          <span className="input-heading-add-another pt-0">{record.user.firstName}</span>
        )}
      </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'Last Name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: {
            userId: record.userId,
            screenKey: 'umpire',
            screen: '/umpirePayment',
          },
        }}
      >
        {record.user && (
          <span className="input-heading-add-another pt-0">{record.user.lastName}</span>
        )}
      </NavLink>
    ),
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (matchId, record) => {
      let matchNotAvailable =
        record.match.deleted_at || record.match.team1?.deleted_at || record.match.team2?.deleted_at;
      return !matchNotAvailable ? (
        <NavLink
          to={{
            pathname: '/matchDayMatchDetails',
            state: {
              matchId,
              umpireKey: 'umpire',
              screenName: 'umpirePayment',
            },
          }}
        >
          <span className="input-heading-add-another pt-0">{matchId}</span>
        </NavLink>
      ) : (
        <span className="pt-0">{matchId}</span>
      );
    },
  },
  {
    title: AppConstants.verifiedBy,
    dataIndex: 'verifiedBy',
    key: 'verifiedBy',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.activity,
    dataIndex: 'activity',
    key: 'activity',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (matchAction, record) => (
      <NavLink
        to={{
          pathname: '/umpireActivity',
          state: {
            matchId: record.matchId,
          },
        }}
      >
        {isShowTickOnActivity(record.match) ? (
          <img src={AppImages.tick} alt="" className="export-image" />
        ) : (
          <img src={AppImages.crossImage} alt="" className="export-image" />
        )}
      </NavLink>
    ),
  },
  {
    title: AppConstants.type,
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    render: type => {
      return (
        <span>
          {type === 'OFFICIALS' ? AppConstants.officialStatisticians : AppConstants.umpire}
        </span>
      );
    },
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.officialOrganisation,
    dataIndex: ['linkedCompetitionOrganisation', 'organisation', 'name'],
    key: 'linkedOrganisation',
    sorter: true,
    onHeaderCell: () => listeners('linkedOrganisation'),
    render: (linkedOrganisationName, record) => {
      const umpiredLinkedOrganisations = record.linkedUserOrganisations ?? [];
      if (umpiredLinkedOrganisations.length > 1) {
        return (
          <Select
            name={'competition_organisation_' + record.id}
            className="w-100"
            style={{ minWidth: 182 }}
            onSelect={competitionOrganisationId =>
              this_obj.props.updateUmpirePaymentData({
                key: 'competitionOrganisationId',
                data: competitionOrganisationId,
                umpireId: record.id,
              })
            }
            value={record.competitionOrganisationId ? record.competitionOrganisationId : undefined}
            allowClear
            onClear={() =>
              this_obj.props.updateUmpirePaymentData({
                key: 'competitionOrganisationId',
                data: null,
                umpireId: record.id,
              })
            }
          >
            {umpiredLinkedOrganisations.map(item => (
              <Option key={'competition_organisation_' + item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        );
      }
      return <span>{linkedOrganisationName}</span>;
    },
  },
  {
    title: AppConstants.umpireAmount,
    dataIndex: 'amount',
    key: 'amount',
    sorter: false,
    render: amount => currencyFormat(amount),
  },
  {
    title: AppConstants.umpireExtra,
    dataIndex: 'extraAmount',
    key: 'extraAmount',
    sorter: false,
    render: (extraAmount, record) => {
      if (this_obj.state.canUpdateExtraAmount) {
        if (
          record.paymentStatusRefId === MatchUmpirePaymentStatus.NotApproved &&
          this_obj.props.umpirePaymentState.paymentTransferPostData.find(pt => pt.id === record.id)
        ) {
          return (
            <div className="d-flex align-items-center">
              <span className="pr-1">{'$'}</span>
              <Input
                className="table-input-box-style"
                style={{ minWidth: '82px' }}
                value={extraAmount}
                type="number"
                min={0}
                onBlur={e =>
                  this_obj.updateExtraAmount(record.id, this_obj.getAmount(e.target.value))
                }
                onChange={e => this_obj.updateExtraAmount(record.id, e.target.value)}
              />
            </div>
          );
        }
      }
      if (!isNullOrUndefined(extraAmount)) {
        return (
          <AntdTooltip
            title={record.extraAmountReason}
            placement="left"
            trigger="hover"
            autoAdjustOverflow
            arrowPointAtCenter
          >
            <span>{currencyFormat(extraAmount)}</span>
          </AntdTooltip>
        );
      }
      return <></>;
    },
  },
  {
    title: AppConstants.authoriser1,
    dataIndex: 'approvedByUser',
    key: 'approvedByUser',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (approvedByUser, record) => {
      return (
        approvedByUser && <span>{approvedByUser.firstName + ' ' + approvedByUser.lastName}</span>
      );
    },
  },
  {
    title: AppConstants.authoriser2,
    dataIndex: 'authorizer2Id',
    key: 'authorizer2Id',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (authorizer2Id, record, index) => {
      let adminList = this_obj.props.umpirePaymentState.adminList;
      const hasTransfers = !!this_obj?.state?.canUpdateExtraAmount;
      if (
        adminList.length > 1 &&
        record.approvedByUserId &&
        authorizer2Id != record.approvedByUserId
      ) {
        adminList = this_obj.props.umpirePaymentState.adminList.filter(
          item => item.id !== record.approvedByUserId,
        );
      }

      if (
        record.paymentStatusRefId === MatchUmpirePaymentStatus.NotApproved ||
        record.paymentStatusRefId === MatchUmpirePaymentStatus.Failed ||
        record.paymentStatusRefId === MatchUmpirePaymentStatus.Refunded
      ) {
        return (
          <Popover content={AppConstants.pleaseSaveOrCancel} trigger={hasTransfers ? 'hover' : ''}>
            <Select
              name={'authorizer2Id_' + record.id}
              className="w-100"
              style={{ minWidth: 182 }}
              disabled={hasTransfers}
              onSelect={adminId =>
                this_obj.props.updateUmpirePaymentData({
                  key: 'authorizer2Id',
                  data: adminId,
                  umpireId: record.id,
                })
              }
              value={!authorizer2Id ? undefined : authorizer2Id}
              allowClear
              onClear={() =>
                this_obj.props.updateUmpirePaymentData({
                  key: 'authorizer2Id',
                  data: null,
                  umpireId: record.id,
                })
              }
            >
              {adminList.map(item => (
                <Option key={'admin_' + item.id} value={item.id}>
                  {`${item.firstName} ${item.lastName}`}
                </Option>
              ))}
            </Select>
          </Popover>
        );
      }
      return (
        <span>
          {record.authorizer2
            ? record.authorizer2.firstName + ' ' + record.authorizer2.lastName
            : ''}
        </span>
      );
    },
  },
  {
    title: AppConstants.status,
    dataIndex: 'makePayment',
    key: 'paymentStatusRefId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (paymentStatusRefId, record) => {
      let status = UmpirePaymentDescription[record.paymentStatusRefId];
      const capitalized = status.replace(/^./, status[0].toUpperCase());
      return <span>{capitalized}</span>;
    },
  },
  {
    title: (
      <div className="row" style={{ marginRight: '2px' }}>
        <div>{AppConstants.timeDatePaid}</div>
        <div>
          <Tooltip placement="top">
            <span>{AppConstants.tooltipForPaymentToClear}</span>
          </Tooltip>
        </div>
      </div>
    ),
    dataIndex: 'approved_at',
    key: 'approved_at',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (approved_at, record) => {
      return approved_at && <span>{moment(approved_at).format('DD/MM/YYYY HH:mm')}</span>;
    },
  },
  {
    title: AppConstants.paymentType,
    dataIndex: 'paymentType',
    key: 'paymentType',
    sorter: false,
    render: (paymentType, record) => {
      return paymentType && <span>{getPaymentTypeDescription(paymentType)}</span>;
    },
  },
  {
    title: (
      <div className="d-flex mr-2">
        <div>{AppConstants.pay}</div>
        <div>
          <Tooltip placement="top">
            <span>{AppConstants.tooltipUmpirePay}</span>
          </Tooltip>
        </div>
      </div>
    ),
    dataIndex: 'markedForPayment',
    key: 'markedForPayment',
    render: (markedForPayment, record, index) => {
      let hasBankAccount = record.user && record.user.stripeAccountId;
      let canPay = false;
      let tooltipMessage = AppConstants.setupBankAccount;
      if (this_obj.state.canUpdateExtraAmount) {
        tooltipMessage = AppConstants.pleaseSaveOrCancel;
      } else if (record.message) {
        // if there is any record.message, the checkbox should be disabled
        // with record.message shown.
        tooltipMessage = record.message;
      } else if (
        record.paymentStatusRefId === MatchUmpirePaymentStatus.NotApproved &&
        !record.authorizer2Id
      ) {
        // if paymentStatus not approved, and authoriser 2 is not selected,
        // the checkbox and action button should be disabled with message
        tooltipMessage = AppConstants.selectAuthoriser2;
      } else {
        canPay =
          (hasBankAccount && record.calculateFeeSuccess) ||
          record.paymentStatusRefId === MatchUmpirePaymentStatus.Paid;
      }

      return canPay ? (
        <Checkbox
          className="single-checkbox"
          checked={markedForPayment}
          disabled={
            record.paymentStatusRefId === MatchUmpirePaymentStatus.Paid ||
            record.paymentStatusRefId === MatchUmpirePaymentStatus.Approved ||
            record.paymentStatusRefId === 'approved' ||
            this_obj.state.canUpdateExtraAmount
          }
          onChange={e =>
            this_obj.props.updateUmpirePaymentData({
              key: 'markedForPayment',
              data: e.target.checked,
              umpireId: record.id,
            })
          }
        />
      ) : (
        <AntdTooltip
          title={tooltipMessage}
          placement="left"
          trigger="hover"
          autoAdjustOverflow
          arrowPointAtCenter
        >
          <Checkbox className="single-checkbox" disabled />
        </AntdTooltip>
      );
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => {
      let options = [];
      let hasBankAccount = record.user && record.user.stripeAccountId;
      let canPay = hasBankAccount && record.calculateFeeSuccess;
      switch (record.paymentStatusRefId) {
        case MatchUmpirePaymentStatus.NotApproved:
          if (!!record.authorizer2Id && canPay) {
            options.push(payMenuItem(record));
          }
          if (!!record.authorizer2Id && record.calculateFeeSuccess) {
            options.push(markedAsPaidMenuItem(record));
          }
          break;
        case MatchUmpirePaymentStatus.Approved:
        case 'approved':
          if (canPay && !record.paymentIntentId) {
            options.push(retryPaymentMenueItem(record));
          }
          if (record.calculateFeeSuccess && !record.paymentIntentId) {
            options.push(markedAsPaidMenuItem(record));
          }
          break;
        case MatchUmpirePaymentStatus.Paid:
          options.push(refundMenuItem(record));
          break;
        case MatchUmpirePaymentStatus.Failed:
          if (canPay) {
            options.push(retryPaymentMenueItem(record));
          }
          if (record.calculateFeeSuccess) {
            options.push(markedAsPaidMenuItem(record));
          }
          break;
        case MatchUmpirePaymentStatus.Refunded:
          if (canPay) {
            options.push(payMenuItem(record));
          }
          if (record.calculateFeeSuccess) {
            options.push(markedAsPaidMenuItem(record));
          }
          break;
      }
      return (
        <div>
          <Popover
            content={AppConstants.pleaseSaveOrCancel}
            placement="left"
            trigger={this_obj.state.canUpdateExtraAmount ? 'hover' : ''}
          >
            <Menu
              className="action-triple-dot-submenu "
              theme="light"
              mode="horizontal"
              style={{ lineHeight: '25px' }}
            >
              {options.length ? (
                <SubMenu
                  key="sub1"
                  style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
                  title={
                    <img
                      className="dot-image"
                      src={AppImages.moreTripleDot}
                      alt=""
                      width="16"
                      height="16"
                    />
                  }
                >
                  {!this_obj.state.canUpdateExtraAmount ? options : null}
                </SubMenu>
              ) : null}
            </Menu>
          </Popover>
        </div>
      );
    },
  },
];

class UmpirePayments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: null,
      yearRefId: getGlobalYear() ? JSON.parse(getGlobalYear()) : null,
      competitionid: null,
      searchText: '',
      selectedComp: null,
      loading: false,
      competitionUniqueKey: null,
      year: '2019',
      rosterLoad: false,
      compArray: [],
      sortBy: null,
      sortOrder: null,
      offsetData: 0,
      paymentLoad: false,
      competitionOrganisationId: null,
      liveScoreCompIsParent: false,
      venue: 'All',
      venueLoad: false,
      division: 'All',
      divisionLoad: false,
      round: 'All',
      selectedRowKeys: [],
      selectedRows: [],
      showExtraReasonModal: false,
      canUpdateExtraAmount: false,
      canBulkUpdateExtraAmount: true,
      showAuthorizer2Modal: false,
      showBulkPaymentConfirmModal: false,
      showPaymentActionConfirmModal: false,
      actionUmpire: null,
      actionType: null,
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      filterDates: false,
      status: AppConstants.all,
    };
    this_obj = this;
    this.extraAmountFormRef = createRef();
    this.auth2FormRef = createRef();
  }

  isBecsSetupDone = () => {
    const orgData = getOrganisationData();
    const becsMandateId = orgData ? orgData.stripeBecsMandateId : null;
    return becsMandateId;
  };

  async componentDidMount() {
    if (!this.isBecsSetupDone()) {
      this.props.history.push('/orgBecsSetup');
    }
    this.props.getOnlyYearListAction();

    let { organisationId } = getOrganisationData() || {};
    const competitionId = getUmpireCompetitionId();
    if (organisationId) {
      this.props.umpireCompetitionListAction(null, this.state.yearRefId, organisationId, 'USERS');
    }
    const { umpirePaymentObject } = this.props.umpirePaymentState;

    let page = 1;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    this.props.getAdminListAction({
      organisationId,
    });
    if (umpirePaymentObject) {
      let selectedComp = competitionId || umpirePaymentObject.data.compId;
      let offset = umpirePaymentObject.data.pagingBody.paging.offset;
      let searchText = umpirePaymentObject.data.search;
      sortBy = umpirePaymentObject.data.sortBy;
      sortOrder = umpirePaymentObject.data.sortOrder;
      await this.setState({
        offset,
        searchText,
        sortBy,
        sortOrder,
        selectedComp,
      });
      const { pageSize = 10 } = this.props.umpirePaymentState;
      page = Math.floor(offset / pageSize) + 1;

      this.handlePageChange(page);
    } else {
      this.setState({ loading: true });
    }
  }

  componentDidUpdate(prevProps) {
    const organisation = getOrganisationData();
    const organisationId = organisation?.organisationId ?? null;
    if (prevProps.umpireCompetitionState.onLoad && !this.props.umpireCompetitionState.onLoad) {
      let compList =
        this.props.umpireCompetitionState.umpireComptitionList &&
        isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
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
        //get the first comp in the list
        competition = compList && compList.length ? compList[0] : null;
      }
      const competitionId = competition?.id ?? null;
      const competitionUniqueKey = competition?.uniqueKey ?? null;

      setCompDataForAll(competition);

      let liveScoreCompIsParent = false;
      if (competitionId) {
        this.props.umpireRoundListAction(competitionId, '');
        this.props.getUmpirePaymentLinkedOrganisationData(competitionId);
      }
      if (competition) {
        this.props.getUmpireDashboardVenueList(competitionId);
      }

      this.setState(
        {
          selectedComp: competitionId,
          loading: false,
          competitionUniqueKey: competitionUniqueKey,
          compArray: compList,
          venueLoad: true,
          liveScoreCompIsParent,
        },
        () => this.fetchUmpireData(),
      );
    }

    if (!isEqual(prevProps.umpireDashboardState, this.props.umpireDashboardState)) {
      if (this.props.umpireDashboardState.onVenueLoad === false && this.state.venueLoad === true) {
        if (this.state.selectedComp)
          this.props.getUmpireDashboardDivisionList(this.state.selectedComp);
        this.setState({ venueLoad: false, divisionLoad: true });
      }
    }

    if (this.state.paymentLoad == true && this.props.umpirePaymentState.onPaymentLoad === false) {
      if (this.state.selectedComp) {
        this.setState({ paymentLoad: false }, () => {
          this.fetchUmpireData();
        });
      }
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

  getAmount = value => {
    let amount = '0.00';
    if (value !== '' && !isNaN(Number(value))) {
      amount =
        Number(value) > MAX_EXTRA_AMOUNT ? MAX_EXTRA_AMOUNT.toFixed(2) : Number(value).toFixed(2);
    }
    return amount;
  };

  getTransfers() {
    const { paymentTransferPostData } = this.props.umpirePaymentState;
    const filterPaymentTransferPostData = paymentTransferPostData.filter(
      record =>
        record.paymentStatusRefId === MatchUmpirePaymentStatus.Failed ||
        record.paymentStatusRefId === MatchUmpirePaymentStatus.NotApproved ||
        record.paymentStatusRefId === MatchUmpirePaymentStatus.Refunded,
    );

    return filterPaymentTransferPostData;
  }

  // Post Request: /umpireTransfer
  saveUmpireTransferData(canPay) {
    const transfers = this.getTransfers();

    if (transfers.length > 0) {
      for (let matchUmpire of transfers) {
        const totalAmount = Number(matchUmpire.extraAmount) + Number(matchUmpire.amount);
        if (totalAmount > MAX_EXTRA_AMOUNT) {
          message.config({
            duration: 1.5,
            maxCount: 1,
          });
          message.error(`${ValidationConstants.amountCannotExceed}: $${MAX_EXTRA_AMOUNT}`);
          return;
        }
      }

      const data = {
        canPay: canPay,
        organisationUniqueKey: getOrganisationData()
          ? getOrganisationData().organisationUniqueKey
          : null,
        transfers: transfers,
        extraAmountReason: this.extraAmountFormRef.current?.getFieldValue('extraAmountReason'),
      };
      this.props.umpirePaymentTransferData({ postData: data });

      this.setState(
        {
          paymentLoad: true,
        },
        () => this.discardLocalChanges(false),
      );
    } else {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(AppConstants.selectUmpireForPayment);
      this.setState({ showExtraReasonModal: false });
    }
  }

  handleColumnAction = (matchUmpire, action) => {};

  // Post Request: /umpireTransfer/options
  paymentAction = (matchUmpire, action) => {
    const { canUpdateExtraAmount } = this.state;
    if (canUpdateExtraAmount) {
      message.error(AppConstants.waitForExtraAmountUpdate);
      return;
    }
    if (!matchUmpire.authorizer2Id) {
      message.error(AppConstants.selectAuthoriser2);
      this.setState({ showExtraReasonModal: false, showAuthorizer2Modal: false });
      return;
    }

    const organisationUniqueKey = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;

    this.props.umpirePaymentAction({
      matchUmpire,
      action,
      organisationUniqueKey,
    });
  };

  // -------------------------- Content --------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  };

  handlePageChange = async page => {
    await this.props.setPageNumberAction(page);
    const { pageSize = 10 } = this.props.umpirePaymentState;
    let offsetData = page ? pageSize * (page - 1) : 0;
    this.setState({ offsetData }, () => this.fetchUmpireData());
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  contentView = () => {
    const { umpirePaymentList, onLoad, totalCount, currentPage, pageSize } =
      this.props.umpirePaymentState;
    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.paymentStatusRefId === MatchUmpirePaymentStatus.Paid,
      }),
    };

    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad || this.props.umpireCompetitionState.onLoad}
            className="home-dashboard-table"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={onLoad || this.props.umpireCompetitionState.onLoad ? [] : umpirePaymentList}
            pagination={false}
            rowKey={record => `umpirePayments${record.id}`}
          />
        </div>

        <div className="comp-dashboard-botton-view-mobile">
          <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100" />

          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination pb-2"
              showSizeChanger
              current={currentPage}
              total={totalCount}
              defaultCurrent={totalCount}
              defaultPageSize={pageSize}
              onChange={this.handlePageChange}
              onShowSizeChange={this.handleShowSizeChange}
            />
          </div>
        </div>
      </div>
    );
  };

  // -------------------------- Header View --------------------------

  discardLocalChanges = (restoreUmpireData = true) => {
    if (this.extraAmountFormRef.current) {
      this.extraAmountFormRef.current.setFieldsValue(INIT_EXTRA_PAYMENT_FORM_DATA);
    }
    if (this.auth2FormRef.current) {
      this.auth2FormRef.current.setFieldsValue(INIT_AUTHORIZER2_FORM_DATA);
    }
    if (restoreUmpireData) {
      this.props.restoreInitUmpireData();
    }
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
      showExtraReasonModal: false,
      canUpdateExtraAmount: false,
      canBulkUpdateExtraAmount: true,
      showAuthorizer2Modal: false,
      showBulkPaymentConfirmModal: false,
      showPaymentActionConfirmModal: false,
      actionUmpire: null,
      actionType: null,
    });
  };
  onChangeSearchText = e => {
    const value = e.target.value;
    this.setState({ searchText: e.target.value, offsetData: 0 }, () => {
      const { selectedComp } = this.state;
      if (value === null || value === '') {
        if (selectedComp) {
          this.fetchUmpireData();
          this.discardLocalChanges();
        }
      }
    });
  };

  onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    this.setState({ offsetData: 0 }, () => {
      const { selectedComp } = this.state;
      if (code === 13) {
        // 13 is the enter keycode
        if (selectedComp) {
          this.fetchUmpireData();
          this.discardLocalChanges();
        }
      }
    });
  };

  onClickSearchIcon = () => {
    this.setState({ offsetData: 0 }, () => {
      const { searchText, selectedComp } = this.state;
      if (!(searchText === null || searchText === '')) {
        if (selectedComp) {
          this.fetchUmpireData();
          this.discardLocalChanges();
        }
      }
    });
  };

  searchBox = () => {
    return (
      <div>
        <Input
          className="w-100"
          onChange={e => this.onChangeSearchText(e)}
          placeholder="Search..."
          onKeyPress={e => this.onKeyEnterSearchText(e)}
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
    );
  };

  openExtraReasonModal = () => {
    this_obj.props.restoreInitUmpireData();
    this.setState({
      showExtraReasonModal: true,
      canUpdateExtraAmount: false,
      canBulkUpdateExtraAmount: true,
    });
  };

  openBulkAuthorizer2Modal = () => {
    this.props.restoreInitUmpireData();
    this.setState({
      showAuthorizer2Modal: true,
    });
  };

  actionDropDown = () => {
    const { selectedRows } = this.state;
    const { paymentTransferPostData } = this.props.umpirePaymentState;
    const hasTransfers = !!paymentTransferPostData?.length;
    const popoverMsg = hasTransfers
      ? AppConstants.pleaseSaveOrCancel
      : AppConstants.pleaseSelectUmpireForUpdate;

    const disabled = !selectedRows.length || hasTransfers;
    return (
      <div>
        <Dropdown
          disabled={disabled}
          className={disabled ? '' : 'primary-add-comp-form'}
          overlay={
            <Menu>
              <Menu.Item key="1" onClick={this.openExtraReasonModal}>
                {AppConstants.updateExtraPayment}
              </Menu.Item>

              <Menu.Item key="2" onClick={this.openBulkAuthorizer2Modal}>
                {AppConstants.bulkUpdateAuth2}
              </Menu.Item>
            </Menu>
          }
        >
          <Popover content={popoverMsg} trigger={disabled ? 'hover' : ''}>
            <Button type="primary" disabled={disabled}>
              {AppConstants.action} <DownOutlined />
            </Button>
          </Popover>
        </Dropdown>
      </div>
    );
  };

  onExport = () => {
    let { organisationId } = getOrganisationData() || {};
    let url =
      AppConstants.umpirePaymentExport +
      `competitionId=${this.state.selectedComp}&organisationId=${organisationId}`;

    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    if (!liveScoreCompIsParent && this.state.competitionOrganisationId) {
      url += `&competitionOrganisationId=${this.state.competitionOrganisationId}`;
    }
    if (this.state.venue !== 'All') {
      url += `&venueId=${this.state.venue}`;
    }
    if (this.state.division !== 'All') {
      url += `&divisionId=${this.state.division}`;
    }
    if (this.state.round !== 'All') {
      const round = JSON.stringify(this.state.round);
      url += `&roundId=${round}`;
    }
    if (this.state.status !== 'All') {
      url += `&statusRefId=${this.state.status}`;
    }
    if (this.state.filterDates) {
      url += `&startDate=${this.state.startDate}&endDate=${this.state.endDate}`;
    }
    this.props.exportFilesAction(url);
  };

  exportButton = () => {
    const isCompetitionAvailable = this.state.selectedComp ? false : true;
    return (
      <div>
        <Button
          type="primary"
          className=""
          onClick={this.onExport}
          disabled={isCompetitionAvailable}
        >
          <div className="row">
            <div className="col-sm">
              <img className="export-image" src={AppImages.export} alt="" />
              {AppConstants.export}
            </div>
          </div>
        </Button>
      </div>
    );
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="fluid-width">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-content-center">
              <span className="form-heading">{AppConstants.officialPayments}</span>
            </div>
            <div className="d-flex flex-wrap gap-6">
              {this.searchBox()}
              <div className="d-flex flex-wrap gap-2">
                {this.actionDropDown()}
                {this.exportButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------- Drop Down View --------------------------
  setYear = yearRefId => {
    setGlobalYear(yearRefId);
    this.setState({
      loading: true,
      yearRefId,
      division: 'All',
      round: 'All',
    });

    setCompDataForAll(null);
    this.props.umpireYearChangedAction();

    const { organisationId } = getOrganisationData() || {};
    this.props.umpireCompetitionListAction(null, yearRefId, organisationId, 'USERS');
    this.discardLocalChanges();
  };

  onChangeComp = competitionId => {
    let selectedComp = competitionId ? competitionId : 0;
    const { pageSize = 10 } = this.props.umpirePaymentState;

    let compObj = null;
    let umpireComptitionList = this.props.umpireCompetitionState.umpireComptitionList;
    let compArray = isArrayNotEmpty(umpireComptitionList) ? umpireComptitionList : [];
    for (let comp of compArray) {
      if (competitionId === comp.id) {
        compObj = comp;
        break;
      }
    }
    setCompDataForAll(compObj);

    if (!compObj) {
      message.error(AppConstants.competitionNotFound);
      return;
    }

    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState(
      {
        selectedComp,
        competitionOrganisationId: '',
        liveScoreCompIsParent,
        division: 'All',
        round: 'All',
      },
      () => {
        if (selectedComp) {
          this.props.getUmpireDashboardVenueList(selectedComp);
          this.props.getUmpireDashboardDivisionList(selectedComp);
          this.props.getUmpirePaymentLinkedOrganisationData(selectedComp);
          this.props.umpireRoundListAction(selectedComp, '');
          this.fetchUmpireData();
        }
      },
    );
  };

  onLinkedOrganisationChange = competitionOrganisationId => {
    this.setState(
      {
        competitionOrganisationId,
      },
      () => this.fetchUmpireData(),
    );
  };

  fetchUmpireData() {
    if (this.state.selectedComp) {
      const { pageSize = 10 } = this.props.umpirePaymentState;
      const { sortBy, sortOrder, offsetData, liveScoreCompIsParent, competitionOrganisationId } =
        this.state;
      const body = {
        paging: {
          limit: pageSize,
          offset: offsetData,
        },
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        filterDate: this.state.filterDates,
      };
      const { organisationId } = getOrganisationData() || {};
      this.props.getUmpirePaymentData({
        compId: this.state.selectedComp,
        organisationId,
        competitionOrganisationId: competitionOrganisationId,
        divisionId: this.state.division === 'All' ? '' : this.state.division,
        venueId: this.state.venue === 'All' ? '' : this.state.venue,
        roundId: this.state.round === 'All' ? '' : this.state.round,
        statusRefId: this.state.status === 'All' ? '' : this.state.status,
        pagingBody: body,
        search: this.state.searchText,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
    } else {
      this.props.resetUmpirePaymentData();
    }
  }

  onVenueChange = venueId => {
    this.setState({ venue: venueId }, () => {
      this.fetchUmpireData();
      this.discardLocalChanges();
    });
  };

  onDivisionChange = divisionId => {
    this.setState({ division: divisionId, round: 'All' }, () => {
      this.fetchUmpireData();
      this.discardLocalChanges();
    });

    if (this.state.selectedComp) {
      this.props.umpireRoundListAction(
        this.state.selectedComp,
        divisionId === 'All' ? '' : divisionId,
      );
    }
  };

  onRoundChange = async roundId => {
    if (roundId !== 'All') {
      await this.props.umpireDashboardUpdate(roundId);
    }
    const { allRoundIds } = this.props.umpireDashboardState;

    const round = roundId === 'All' ? 'All' : allRoundIds;
    this.setState({ round }, () => {
      this.discardLocalChanges();
      this.fetchUmpireData();
    });
  };

  onChangeStatus = async status => {
    this.setState({ status }, () => {
      this.discardLocalChanges();
      this.fetchUmpireData();
    });
  };

  onChangeStartDate = date => {
    if (date) {
      let startDate = moment(date[0]).format('YYYY-MM-DD');
      let endDate = moment(date[1]).format('YYYY-MM-DD');
      this.setState(
        {
          startDate,
          endDate,
        },
        () => {
          this.discardLocalChanges();
          this.fetchUmpireData();
        },
      );
    }
  };

  onDateRangeCheck = val => {
    let startDate = moment(new Date()).format('YYYY-MM-DD');
    let endDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({ filterDates: val, startDate: startDate, endDate: endDate }, () => {
      this.discardLocalChanges();
      this.fetchUmpireData();
    });
  };

  dropdownView = () => {
    let competition = isArrayNotEmpty(this.props.umpireCompetitionState.umpireComptitionList)
      ? this.props.umpireCompetitionState.umpireComptitionList
      : [];

    let linkedOrganisations = isArrayNotEmpty(
      this.props.umpirePaymentSettingState.umpireLinkedOrganisationList,
    )
      ? this.props.umpirePaymentSettingState.umpireLinkedOrganisationList
      : [];
    const { umpireVenueList, umpireDivisionList, umpireRoundList } =
      this.props.umpireDashboardState;
    let venueList = isArrayNotEmpty(umpireVenueList) ? umpireVenueList : [];
    let divisionList = isArrayNotEmpty(umpireDivisionList) ? umpireDivisionList : [];
    let roundList = isArrayNotEmpty(umpireRoundList) ? umpireRoundList : [];
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="d-grid grid-cols-auto gap-x-8 gap-y-4">
          <div className="grid-selection">
            <span className="year-select-heading">{AppConstants.year}:</span>
            <Select
              className="year-select"
              style={{}}
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
          <div className="grid-selection">
            <span className="year-select-heading">{AppConstants.competition}:</span>
            <Select
              className="year-select"
              onChange={competitionId => this.onChangeComp(competitionId)}
              value={this.state.selectedComp || ''}
              loading={this.props.umpireCompetitionState.onLoad}
            >
              {!this.state.selectedComp && <Option value="">All</Option>}
              {competition.map(item => (
                <Option key={`competition_${item.id}`} value={item.id}>
                  {item.longName}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <span className="linked-organisation-select-heading">
              {AppConstants.officialOrganisation}:
            </span>
            <Select
              className="linked-organisation-select"
              onChange={competitionOrganisationId =>
                this.onLinkedOrganisationChange(competitionOrganisationId)
              }
              value={this.state.competitionOrganisationId || ''}
              loading={this.props.umpireCompetitionState.onLoad}
            >
              <Option value="">All</Option>
              {linkedOrganisations.map(item => (
                <Option key={`linked_organisation_${item.id}`} value={item.id}>
                  {item.organisation.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <span className="year-select-heading">{AppConstants.venue}:</span>
            <Select className="year-select" onChange={this.onVenueChange} value={this.state.venue}>
              <Option value="All">All</Option>
              {venueList.map(item => (
                <Option key={'venue_' + item.venueId} value={item.venueId}>
                  {item.venueName}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <span className="year-select-heading">{AppConstants.division}:</span>
            <Select
              className="year-select"
              onChange={this.onDivisionChange}
              value={this.state.division}
            >
              <Option value="All">All</Option>
              {divisionList.map(item => (
                <Option key={'division_' + item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <span className="year-select-heading">{AppConstants.round}:</span>
            <Select className="year-select" onChange={this.onRoundChange} value={this.state.round}>
              <Option value="All">All</Option>
              {roundList.map(item => (
                <Option key={'round_' + item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <span className="year-select-heading" style={{ width: '127px' }}>
              {AppConstants.status}:
            </span>
            <Select
              className="year-select reg-filter-select1"
              style={{ minWidth: 160 }}
              onChange={status => this.onChangeStatus(status)}
              value={this.state.status}
            >
              <Option value="All">All</Option>
              {Object.keys(UmpirePaymentDescription).map(key => (
                <Option key={'status_' + key} value={key}>
                  {UmpirePaymentDescription[key]}
                </Option>
              ))}
            </Select>
          </div>
          <div className="grid-selection">
            <RangePicker
              disabled={this.state.firstTimeCompId == '-1' || this.state.filterDates ? false : true}
              onChange={date => this.onChangeStartDate(date)}
              format="DD-MM-YYYY"
              style={{ width: '100%', minWidth: 230 }}
              value={[moment(this.state.startDate), moment(this.state.endDate)]}
            />
            <Checkbox
              className="single-checkbox-radio-style"
              style={{ minWidth: 150, marginLeft: 8 }}
              checked={this.state.filterDates}
              onChange={e => this.onDateRangeCheck(e.target.checked)}
              disabled={this.state.firstTimeCompId == '-1'}
              // onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.checked, "associationChecked")}
            >
              {AppConstants.filterDates}
            </Checkbox>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------- Extra Amount --------------------------

  toggleCanBulkUpdateExtraAmount = e => {
    this.setState({ canBulkUpdateExtraAmount: e.target.checked });
  };

  handleBulkExtraAmountBlur = e => {
    const amount = this.getAmount(e.target.value);
    if (amount && this.extraAmountFormRef.current) {
      this.extraAmountFormRef.current.setFieldsValue({
        bulkExtraAmount: amount,
      });
    }
  };

  updateExtraAmount = (umpireId, amount, isBulk) => {
    const { selectedRows } = this_obj.state;
    let payload = {
      matchUmpires: selectedRows,
      umpireId: umpireId,
      extraAmount: amount,
      isBulk: isBulk,
    };

    this.props.updateExtraAmountAction(payload);
  };

  handleConfirmExtraPayment = () => {
    const { canBulkUpdateExtraAmount } = this.state;
    const { bulkExtraAmount } = this.extraAmountFormRef.current.getFieldsValue();
    const amount = this.getAmount(bulkExtraAmount);
    this.extraAmountFormRef.current
      .validateFields()
      .then(values => {
        this.props.restoreInitUmpireData();
        this.updateExtraAmount(null, amount, canBulkUpdateExtraAmount);
        this.setState(
          {
            showExtraReasonModal: false,
            canUpdateExtraAmount: !canBulkUpdateExtraAmount,
          },
          canBulkUpdateExtraAmount ? () => this.saveUmpireTransferData(false) : null,
        );
      })
      .catch(info => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(info);
        }
      });
  };

  handleCancelExtraPayment = () => {
    this.props.restoreInitUmpireData();
    if (this.extraAmountFormRef.current) {
      this.extraAmountFormRef.current.setFieldsValue(INIT_EXTRA_PAYMENT_FORM_DATA);
    }

    this.setState({
      showExtraReasonModal: false,
      canUpdateExtraAmount: false,
      canBulkUpdateExtraAmount: true,
    });
  };

  extraAmountReasonModal = () => {
    const { showExtraReasonModal, canBulkUpdateExtraAmount } = this.state;
    const props = {
      visible: showExtraReasonModal,
      formRef: this.extraAmountFormRef,
      isBulk: canBulkUpdateExtraAmount,
      toggleCheckbox: this.toggleCanBulkUpdateExtraAmount,
      onBlurAmount: this.handleBulkExtraAmountBlur,
      onOK: this.handleConfirmExtraPayment,
      onCancel: this.handleCancelExtraPayment,
      okText: canBulkUpdateExtraAmount ? AppConstants.save : AppConstants.next,
      cancelText: AppConstants.cancel,
    };
    return <ExtraAmountReasonModal {...props} />;
  };

  // -------------------------- Authoriser 2 --------------------------

  bulkUpdateAuthorizer2Id = bulkAuthorizer2Id => {
    const { selectedRows } = this_obj.state;
    let payload = {
      matchUmpires: selectedRows,
      bulkAuthorizer2Id: bulkAuthorizer2Id,
    };

    this.props.bulkUpdateAuth2Action(payload);
  };

  handleConfirmBulkUpdateAuth2 = () => {
    this.auth2FormRef.current
      .validateFields()
      .then(values => {
        this.props.restoreInitUmpireData();
        this.bulkUpdateAuthorizer2Id(values.bulkAuthorizer2Id);
        this.setState(
          {
            showAuthorizer2Modal: false,
          },
          () => this.saveUmpireTransferData(false),
        );
      })
      .catch(info => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(info);
        }
      });
  };

  handleCancelBulkUpdateAuth2 = () => {
    this.props.restoreInitUmpireData();
    if (this.auth2FormRef.current) {
      this.auth2FormRef.current.setFieldsValue(INIT_AUTHORIZER2_FORM_DATA);
    }
    this.setState({
      showAuthorizer2Modal: false,
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  BulkAuthorizer2Modal = () => {
    const { showAuthorizer2Modal } = this.state;
    const { adminList } = this.props.umpirePaymentState;

    const props = {
      formRef: this.auth2FormRef,
      visible: showAuthorizer2Modal,
      onOK: this.handleConfirmBulkUpdateAuth2,
      okText: AppConstants.save,
      onCancel: this.handleCancelBulkUpdateAuth2,
      cancelText: AppConstants.cancel,
      adminList: adminList,
    };
    return <BulkAuthorizer2Modal {...props} />;
  };

  // -------------------------- Bulk Payment --------------------------
  handleConfirmBulkPayment = type => {
    this.saveUmpireTransferData(true);
  };

  handleCancelBulkPayment = () => {
    this_obj.setState({ showBulkPaymentConfirmModal: false });
  };

  bulkPaymentConfirmModal = () => {
    const { showBulkPaymentConfirmModal } = this.state;
    if (!showBulkPaymentConfirmModal) {
      return null;
    }
    const transfers = this.getTransfers();
    if (!showBulkPaymentConfirmModal) {
      return null;
    }
    const totalAmount = transfers
      .filter(t => t.markedForPayment)
      .reduce((prev, curr) => {
        const total = Number(prev) + (Number(curr.amount) + Number(curr.extraAmount));
        return total.toFixed(2);
      }, '0');

    let content = AppConstants.umpirePaymentConfirmMsg;
    content = content.replace('{{amount}}', totalAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ','));

    return (
      <ConfirmModal
        visible={showBulkPaymentConfirmModal}
        title={AppConstants.confirmPayment}
        confirmText={AppConstants.confirm}
        content={content}
        onOk={() => this.handleConfirmBulkPayment()}
        onCancel={() => this.handleCancelBulkPayment()}
        okText={AppConstants.pay}
      ></ConfirmModal>
    );
  };

  // -------------------------- Action Payment/Refund --------------------------
  handleConfirmPaymentAction = type => {
    const { actionUmpire, actionType } = this.state;
    this.paymentAction(actionUmpire, actionType);
    this_obj.setState({
      showPaymentActionConfirmModal: false,
      actionUmpire: null,
      actionType: null,
    });
  };

  handleCancelPaymentAction = () => {
    this_obj.setState({
      showPaymentActionConfirmModal: false,
      actionUmpire: null,
      actionType: null,
    });
  };

  PaymentActionConfirmModal = () => {
    const { actionUmpire, actionType, showPaymentActionConfirmModal } = this.state;
    if (!showPaymentActionConfirmModal) {
      return;
    }
    const isRefund = actionType === UmpirePaymentAction.Refund;

    const okText = isRefund ? AppConstants.ok : AppConstants.pay;
    const title = isRefund ? AppConstants.confirmRefund : AppConstants.confirmPayment;

    let content = isRefund
      ? AppConstants.umpirePaymentRefundMsg
      : AppConstants.umpirePaymentConfirmMsg;

    const totalAmount = (
      Number(actionUmpire?.amount ?? 0) + Number(actionUmpire?.extraAmount ?? 0)
    ).toFixed(2);

    content = content.replace('{{amount}}', totalAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ','));

    return (
      <ConfirmModal
        visible={showPaymentActionConfirmModal}
        title={title}
        confirmText={AppConstants.confirm}
        content={content}
        onOk={() => this.handleConfirmPaymentAction()}
        onCancel={() => this.handleCancelPaymentAction()}
        okText={okText}
      ></ConfirmModal>
    );
  };

  // -------------------------- Footer View --------------------------

  showConfirmPaymentModal = () => {
    this.setState({ showBulkPaymentConfirmModal: true });
  };

  handlePaymentDataSave = () => {
    this.saveUmpireTransferData(false);
  };

  handleCancel = () => {
    this.props.restoreInitUmpireData();
    if (this.extraAmountFormRef.current) {
      this.extraAmountFormRef.current.setFieldsValue(INIT_EXTRA_PAYMENT_FORM_DATA);
    }
    if (this.auth2FormRef.current) {
      this.auth2FormRef.current.setFieldsValue(INIT_AUTHORIZER2_FORM_DATA);
    }
    this.setState({
      showExtraReasonModal: false,
      canUpdateExtraAmount: false,
      canBulkUpdateExtraAmount: true,
      showAuthorizer2Modal: false,
    });
  };

  footerView = () => {
    const { paymentTransferPostData } = this.props.umpirePaymentState;
    const { canUpdateExtraAmount } = this.state;
    const hasTransfers = !!paymentTransferPostData?.length;
    const canPay = paymentTransferPostData.find(mu => mu.markedForPayment);
    return (
      <div
        className="comp-dash-table-view d-flex gap-3 justify-content-end"
        style={{ marginBottom: '86px' }}
      >
        <>
          {hasTransfers ? (
            <Button
              onClick={() => this.handleCancel()}
              disabled={!hasTransfers}
              type="cancel-button"
            >
              {AppConstants.cancel}
            </Button>
          ) : null}
          {canPay && !canUpdateExtraAmount ? (
            <Button
              disabled={!canPay}
              onClick={this.showConfirmPaymentModal}
              className="publish-button margin-top-disabled-button"
              type="primary"
            >
              {AppConstants.submitForPayment}
            </Button>
          ) : (
            <Popover
              content={AppConstants.updateExtraAmountForSave}
              trigger={!hasTransfers ? 'hover' : ''}
            >
              <Button
                onClick={() => this.handlePaymentDataSave()}
                disabled={!hasTransfers}
                className="publish-button"
                type="primary"
              >
                {AppConstants.save}
              </Button>
            </Popover>
          )}
        </>
        {this.extraAmountReasonModal()}
        {this.BulkAuthorizer2Modal()}
        {this.bulkPaymentConfirmModal()}
        {this.PaymentActionConfirmModal()}
      </div>
    );
  };

  // -------------------------- Render --------------------------
  render() {
    const {
      umpirePaymentList,
      // umpirePaymentObject
    } = this.props.umpirePaymentState;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.officials} menuName={AppConstants.officials} />
        <InnerHorizontalMenu menu="umpire" umpireSelectedKey="7" />
        <Loader visible={this.props.umpirePaymentState.onPaymentLoad} />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
          {this.footerView()}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      umpireCompetitionListAction,
      getUmpireDashboardVenueList,
      getUmpireDashboardDivisionList,
      getUmpirePaymentLinkedOrganisationData,
      umpireDashboardUpdate,
      umpireRoundListAction,
      getUmpirePaymentData,
      resetUmpirePaymentData,
      updateUmpirePaymentData,
      umpirePaymentTransferData,
      exportFilesAction,
      setPageSizeAction,
      setPageNumberAction,
      getAdminListAction,
      umpirePaymentAction,
      updateExtraAmountAction,
      bulkUpdateAuth2Action,
      restoreInitUmpireData,
      getOnlyYearListAction,
      umpireYearChangedAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    umpireDashboardState: state.UmpireDashboardState,
    umpireCompetitionState: state.UmpireCompetitionState,
    umpirePaymentState: state.UmpirePaymentState,
    umpirePaymentSettingState: state.UmpirePaymentSettingState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UmpirePayments);

// -------------------------- Helper Components --------------------------
const ExtraAmountReasonModal = ({
  visible,
  formRef,
  isBulk,
  toggleCheckbox,
  onBlurAmount,
  onOK,
  onCancel,
  okText,
  cancelText,
}) => {
  return (
    <Modal
      title={AppConstants.updateExtraPayment}
      visible={visible}
      closable={false}
      maskClosable={false}
      style={{ paddingTop: '2px' }}
      onOk={onOK}
      okText={okText}
      onCancel={onCancel}
      cancelText={cancelText}
    >
      <Form ref={formRef} autoComplete="off" initialValues={INIT_EXTRA_PAYMENT_FORM_DATA}>
        <div className="required-field pb-1">{AppConstants.extraAmountReason}</div>
        <Form.Item
          name="extraAmountReason"
          rules={[
            {
              validator: (_, value) => {
                const noSpaceValue = value?.replace(/\s+/g, '');
                if (value && value.length && noSpaceValue === '') {
                  return Promise.reject(new Error(ValidationConstants.pleaseProvideReason));
                }
                return Promise.resolve();
              },
            },
            { required: true, message: ValidationConstants.pleaseProvideReason },
          ]}
        >
          <Input
            allowClear
            type="text"
            placeholder={AppConstants.description}
            required="required-field"
          />
        </Form.Item>
        <Checkbox className="mt-1 single-checkbox" onChange={toggleCheckbox} checked={isBulk}>
          {AppConstants.applySameAmountToAll}
        </Checkbox>
        <div className="mt-5">
          {isBulk ? (
            <>
              <div className="required-field pb-1">{AppConstants.extraPaymentAmount}</div>
              <Form.Item
                name="bulkExtraAmount"
                rules={[
                  { required: true, message: ValidationConstants.pleaseUseValidAmount },
                  {
                    validator: (_, value) => {
                      const isNegative = !isNaN(Number(value)) && Number(value) < 0;
                      if (isNegative) {
                        return Promise.reject(new Error(ValidationConstants.pleaseUseValidAmount));
                      } else if (Number(value) > MAX_EXTRA_AMOUNT) {
                        return Promise.reject(
                          new Error(
                            `${ValidationConstants.amountCannotExceed}: $${MAX_EXTRA_AMOUNT}`,
                          ),
                        );
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Input
                  className="table-input-box-style"
                  placeholder={'0.00'}
                  style={{ minWidth: '82px' }}
                  type="number"
                  min={0}
                  onBlur={onBlurAmount}
                />
              </Form.Item>
            </>
          ) : (
            <span className="warning-msg">{AppConstants.manualApplyExtraPaymentNote}</span>
          )}
        </div>
      </Form>
    </Modal>
  );
};

const BulkAuthorizer2Modal = ({
  formRef,
  visible,
  onOK,
  okText,
  onCancel,
  cancelText,
  adminList,
}) => {
  return (
    <Modal
      title={AppConstants.updateAuth2}
      visible={visible}
      closable={false}
      maskClosable={false}
      style={{ paddingTop: '2px' }}
      onOk={onOK}
      okText={okText}
      onCancel={onCancel}
      cancelText={cancelText}
    >
      <Form ref={formRef} initialValues={INIT_AUTHORIZER2_FORM_DATA} autoComplete="off">
        <div className="required-field pb-1">{AppConstants.authoriser2}</div>
        <Form.Item
          name="bulkAuthorizer2Id"
          rules={[{ required: true, message: ValidationConstants.pleaseSelectAuthoriser }]}
        >
          <Select
            className="w-100"
            style={{ minWidth: 182 }}
            onSelect={adminId => console.log('asd')}
            allowClear
          >
            {(adminList ?? []).map(item => (
              <Option key={'admin_' + item.id} value={item.id}>
                {`${item.firstName} ${item.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

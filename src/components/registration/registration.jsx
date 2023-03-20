import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Table,
  Select,
  Menu,
  Pagination,
  DatePicker,
  Input,
  Button,
  Radio,
  message,
  Modal,
  Tag,
  Tooltip,
  Popover,
  Form,
  Steps,
} from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { isEmptyArray } from 'formik';
import moment from 'moment';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { currencyFormat } from 'util/currencyFormat';
import history from 'util/history';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  RegistrationStatus,
  ProcessTypeName,
  RetryPaymentType,
  GovernmentVoucherType,
} from '../../enums/registrationEnums';
import { getOrganisationData, getPrevUrl } from 'util/sessionStorage';
import {
  getGenericCommonReference,
  getGenderAction,
  registrationPaymentStatusAction,
} from 'store/actions/commonAction/commonAction';
import {
  endUserRegDashboardListAction,
  regTransactionUpdateAction,
  exportRegistrationAction,
  setRegistrationListPageSize,
  setRegistrationListPageNumber,
} from 'store/actions/registrationAction/endUserRegistrationAction';
import {
  getAllCompetitionAction,
  registrationFailedStatusUpdate,
  registrationRetryPaymentAction,
  registrationRequestFundsOfflineAction,
  registrationMarkOfflineAsPaidAction,
} from 'store/actions/registrationAction/registrationDashboardAction';
import {
  getAffiliateToOrganisationAction,
  cancelDeRegistrationAction,
} from 'store/actions/userAction/userAction';
import { setYearRefId, getOnlyYearListAction } from 'store/actions/appAction';
import {
  liveScorePlayersToCashReceivedAction,
  liveScorePlayersToPayRetryPaymentAction,
} from '../../store/actions/LiveScoreAction/liveScoreDashboardAction';
import { updateModalVisibility } from '../../store/actions/replicatePlayerAction';
import {
  updateDeregistrationData,
  getMoveCompDataAction,
  moveCompetitionAction,
} from '../../store/actions/registrationAction/registrationChangeAction';
import ValidationConstants from '../../themes/validationConstant';
import InputWithHead from 'customComponents/InputWithHead';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import CustomTooltip from 'react-png-tooltip';

import './product.scss';
import ExportGovernmentVoucherButton from './ExportGovernmentVoucherButton';
import ReplicatePlayerModal from './replicatePlayer';

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;
const { Step } = Steps;
let this_Obj = null;

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.endUserRegDashboardListAction(this_Obj.state.filter, sortBy, sortOrder);
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const regoStatusListExactMatchForDisable = [
  RegistrationStatus.FailedRegistration,
  RegistrationStatus.CancelledRegistration,
  RegistrationStatus.PendingDeRegistration,
  RegistrationStatus.DeRegistered,
  RegistrationStatus.PendingTransfer,
];
const payments = [
  {
    paymentType: 'Credit Card',
    paymentTypeId: 1,
  },
  {
    paymentType: 'Direct Debit',
    paymentTypeId: 2,
  },
  {
    paymentType: 'Voucher',
    paymentTypeId: 3,
  },
];

const columns = [
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (firstName, record) => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: {
            userId: record.userId,
            screenKey: 'registration',
            screen: '/registration',
          },
        }}
      >
        <span
          className={
            record.deRegistered || record.paymentStatus === RegistrationStatus.CancelledRegistration
              ? 'input-heading-add-another-strike pt-0'
              : 'input-heading-add-another pt-0'
          }
        >
          {firstName}
        </span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (lastName, record) => (
      <NavLink
        to={{
          pathname: '/userPersonal',
          state: {
            userId: record.userId,
            screenKey: 'registration',
            screen: '/registration',
          },
        }}
      >
        <span
          className={
            record.deRegistered || record.paymentStatus === RegistrationStatus.CancelledRegistration
              ? 'input-heading-add-another-strike pt-0'
              : 'input-heading-add-another pt-0'
          }
        >
          {lastName}
        </span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.registrationDate,
    dataIndex: 'registrationDate',
    key: 'registrationDate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: registrationDate => (
      <div>{registrationDate != null ? moment(registrationDate).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: 'Competition',
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: true,
    onHeaderCell: () => listeners('competitionName'),
    render: (competitionName, record) => {
      let moveCompData = record.moveCompData;
      let content = null;
      if (moveCompData) {
        moveCompData = moveCompData.sort((a, b) => b.id - a.id);
        content = (
          <Steps progressDot current={0} direction="vertical">
            <Step
              title={
                <span className="step-title">
                  {`${record.competitionName}${
                    record.divisionName ? ' - ' + record.divisionName : ''
                  }
                  `}
                </span>
              }
              description={<span className="step-desc">{AppConstants.currentComp}</span>}
            />
            {moveCompData.map(d => {
              let divisionName = d.divisionName ? ' - ' + d.divisionName : '';
              let title = <span className="step-title">{d.competitionName + divisionName}</span>;
              let desc = (
                <span className="step-desc">{`Moved by ${d.creatorName} on ${moment(
                  new Date(d.createdOn),
                ).format('DD/MM/YYYY HH:mm:ss')}`}</span>
              );
              return <Step title={title} description={desc} key={d.id} />;
            })}
          </Steps>
        );
      }
      return (
        <div className="column-info">
          <>{competitionName}</>
          {content ? (
            <Popover
              placement="top"
              title={<h3>{AppConstants.compChangeHistory}</h3>}
              content={content}
            >
              <InfoCircleOutlined className="info-icon" />
            </Popover>
          ) : null}
          {content ? <div className="info-column-gap"></div> : null}
        </div>
      );
    },
  },
  {
    title: AppConstants.registrationDivisions,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: () => listeners('registrationDivisions'),
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dateOfBirth',
    key: 'dateOfBirth',
    sorter: true,
    onHeaderCell: () => listeners('dob'),
    render: dateOfBirth => (
      <div>{dateOfBirth != null ? moment(dateOfBirth).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.paidBy,
    dataIndex: 'paidByUsers',
    key: 'paidByUsers',
    render: (paidBy, record, index) => (
      <div>
        {(record.paidByUsers || []).map((item, pbu_index) =>
          record.userId == item.paidByUserId ? (
            <div key={'user_' + pbu_index}>Self</div>
          ) : (
            <div key={'user_' + pbu_index}>
              <NavLink
                to={{
                  pathname: `/userPersonal`,
                  state: {
                    userId: item.paidByUserId,
                    tabKey: 'registration',
                  },
                }}
              >
                <span className="input-heading-add-another pt-0">{item.paidBy}</span>
              </NavLink>
            </div>
          ),
        )}
      </div>
    ),
  },
  {
    title: AppConstants.paidFeeInclGst,
    dataIndex: 'paidFee',
    key: 'paidFee',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: fee => <div>{fee != null ? currencyFormat(fee) : '$0.00'}</div>,
  },
  {
    title: AppConstants.pendingFeeInclGst,
    dataIndex: 'pendingFee',
    key: 'pendingFee',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: pendingFee => <div>{pendingFee != null ? currencyFormat(pendingFee) : '$0.00'}</div>,
  },
  {
    title: AppConstants.duePerMatch,
    dataIndex: 'duePerMatch',
    key: 'duePerMatch',
    render: duePerMatch => <div>{duePerMatch != null ? currencyFormat(duePerMatch) : '$0.00'}</div>,
  },
  {
    title: AppConstants.duePerInstalment,
    dataIndex: 'duePerInstalment',
    key: 'duePerInstalment',
    render: new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
    }).format,
  },
  {
    title: AppConstants.status,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: (paymentStatus, record) => {
      return (
        <div className="contextualHelp-RowDirection" style={{ alignItems: 'center' }}>
          <div>{paymentStatus}</div>
          {paymentStatus == RegistrationStatus.FailedRegistration &&
            isArrayNotEmpty(record.stripeFailedReason) && (
              <Tooltip
                overlayClassName="failed-reason-error-tool-tip"
                title={() => {
                  return (
                    <ol className="failed-reason-ordered-list">
                      {(record.stripeFailedReason || []).map(reason => (
                        <li>{reason}</li>
                      ))}
                    </ol>
                  );
                }}
              >
                <i className="fa fa-warning ml-2" aria-hidden="true" style={{ color: 'red' }} />
              </Tooltip>
            )}
        </div>
      );
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record, index) => {
      const organistaionId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      return (isArrayNotEmpty(record.actionViews) &&
        (record.actionViews.find(x => x == 'governmentVoucher' || x == 'schoolInvoice')
          ? record.paymentStatus != 'De-Registered' &&
            record.paymentStatus != 'Pending De-Registration'
          : true)) ||
        (record.deRegistered != 1 &&
          (record.paymentStatus == 'Registered' ||
            record.paymentStatus == 'Pending Registration Fee' ||
            record.paymentStatus == 'Pending Competition Fee' ||
            record.paymentStatus == 'Pending Membership Fee' ||
            record.paymentStatus == 'Pending De-Registration' ||
            record.paymentStatus == 'Pending Transfer' ||
            record.paymentStatus == RegistrationStatus.FailedRegistration)) ? (
        <Menu
          className="action-triple-dot-submenu"
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '25px' }}
        >
          <SubMenu
            key="sub1"
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
            {/* <Menu.Item key="1">
                                <NavLink to={{ pathname: "/" }}>
                                    <span>View</span>
                                </NavLink>
                            </Menu.Item> */}
            {record.actionViews.find(x => x == 'cash') && (
              <Menu.Item key="2" onClick={() => this_Obj.setCashPayment(record)}>
                <span>Receive Cash Payment</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'refund') && (
              <Menu.Item key="3">
                <span>Refund</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'governmentVoucher') &&
              record.paymentStatus != 'De-Registered' &&
              record.paymentStatus != 'Pending De-Registration' && (
                <Menu.Item key="4" onClick={() => this_Obj.setVoucherPayment(record)}>
                  <span>Voucher Payment Received</span>
                </Menu.Item>
              )}
            {record.canCancelRegistration && (
              <Menu.Item key="5" onClick={() => this_Obj.setSchoolInvoiceFailed(record)}>
                <span>{AppConstants.markAsCancelledReg}</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'schoolInvoice') &&
              record.paymentStatus != 'De-Registered' &&
              record.paymentStatus != 'Pending De-Registration' && (
                <Menu>
                  {record.canMarkAsPaidForSchoolInvoice && (
                    <Menu.Item key="6" onClick={() => this_Obj.setSchoolInvoicePaid(record)}>
                      <span>{AppConstants.markAsPaidReg}</span>
                    </Menu.Item>
                  )}
                </Menu>
              )}
            {record.canMarkAsPaid &&
              record.paymentStatus != 'De-Registered' &&
              record.paymentStatus != 'Pending De-Registration' && (
                <Menu.Item key="17" onClick={() => this_Obj.markAsPaidForForcedOffline(record)}>
                  <span>{AppConstants.markAsPaidReg}</span>
                </Menu.Item>
              )}
            {record.actionViews.find(x => x == 'installmentAndFailedTransactions') && (
              <Menu>
                <Menu.Item key="7" onClick={() => this_Obj.setFailedInstalmentRetry(record)}>
                  <span>{AppConstants.retryCustomerPayment}</span>
                </Menu.Item>
                <Menu.Item key="15" onClick={() => this_Obj.cashReceivedForRetry(record, 2)}>
                  <span>{AppConstants.offlinePaymentReceived}</span>
                </Menu.Item>
              </Menu>
            )}
            {record.actionViews.find(x => x == 'paymentFailed') && (
              <Menu>
                <Menu.Item key="8" onClick={() => this_Obj.setFailedRegistrationRetry(record)}>
                  <span>{AppConstants.retryCustomerPayment}</span>
                </Menu.Item>
                {record.organisationUniqueKey == organistaionId && (
                  <Menu.Item key="9" onClick={() => this_Obj.cashReceivedForRetry(record, 1)}>
                    <span>{AppConstants.offlinePaymentReceived}</span>
                  </Menu.Item>
                )}
              </Menu>
            )}
            {record.canRequestFundsOffline && (
              <Menu.Item key="16" onClick={() => this_Obj.setRequestFundsOffline(record)}>
                <span>{AppConstants.requestFundsOffline}</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'cashReceived') && (
              <Menu.Item key="10" onClick={() => this_Obj.setCashReceived(record)}>
                <span>{AppConstants.cashReceived}</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'failedGovernmentVoucher') && (
              <Menu.Item key="11" onClick={() => this_Obj.setVoucherPayment(record)}>
                <span>{AppConstants.retryVoucherPayment}</span>
              </Menu.Item>
            )}
            {record.actionViews.find(x => x == 'failedOnBehalfOf') && (
              <Menu.Item key="12" onClick={() => this_Obj.cashReceivedForRetry(record, 0)}>
                <span>{AppConstants.retryAffiliatePayment}</span>
              </Menu.Item>
            )}
            {record.canDeRegister &&
              record.deRegistered != 1 &&
              (record.paymentStatus == 'Registered' ||
                record.paymentStatus == 'Pending Registration Fee' ||
                record.paymentStatus == 'Pending Competition Fee' ||
                record.paymentStatus == 'Pending Membership Fee' ||
                record.paymentStatus == RegistrationStatus.FailedRegistration) && (
                <Menu.Item
                  key="13"
                  onClick={() =>
                    history.push('/deregistration', {
                      regData: record,
                      personal: record,
                      sourceFrom: AppConstants.ownRegistration,
                      subSourceFrom: 'RegistrationListPage',
                    })
                  }
                >
                  <span>{AppConstants.registrationChange}</span>
                </Menu.Item>
              )}
            {record.deRegistered != 1 &&
              (record.paymentStatus == 'Pending De-Registration' ||
                record.paymentStatus == 'Pending Transfer') && (
                <Menu.Item
                  key="14"
                  onClick={() => this_Obj.cancelDeRegistrtaion(record.deRegisterId)}
                >
                  <span>
                    {record.paymentStatus == 'Pending De-Registration'
                      ? AppConstants.cancelDeRegistrtaion
                      : AppConstants.cancelTransferReg}
                  </span>
                </Menu.Item>
              )}
          </SubMenu>
        </Menu>
      ) : (
        ''
      );
    },
  },
];

const FileterType = {
  Team: 1,
  GovernmentVoucher: 2,
};

class Registration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      year: '2020',
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId: props.location.state?.yearRefId || '-1',
      competitionUniqueKey: ['-1'],
      dobFrom: '-1',
      dobTo: '-1',
      membershipProductTypeId: [-1],
      genderRefId: -1,
      postalCode: '',
      affiliate: [-1],
      membershipProductId: [-1],
      paymentId: [-1],
      visible: false,
      competitionId: '',
      paymentStatusRefId: -1,
      searchText: '',
      regFrom: '-1',
      regTo: '-1',
      cashTranferType: 1,
      amount: null,
      selectedRow: null,
      loading: false,
      teamName: null,
      teamId: -1,
      isVoucherPaymentVisible: false,
      otherModalVisible: false,
      modalTitle: null,
      modalMessage: null,
      actionView: 0,
      cancelDeRegistrationLoad: false,
      isInvoiceFailed: 0,
      instalmentRetryModalVisible: false,
      retryPaymentCardId: '',
      fromCashReceived: false,
      registrationRetryModalVisible: false,
      instalmentRetryloading: false,
      regRetryloading: false,
      instalmentRetryPaymentMethod: 1,
      selectedRowKeys: [],
      showReplicatePlayerPopover: false,
      showPopover: false,
      moveCompModalVisible: false,
      governmentVoucherPending: props.location.state?.governmentVoucherPending || null,
    };
    this.moveCompFormRef = React.createRef();
    this_Obj = this;

    // this.props.getOnlyYearListAction(this.props.appState.yearList);
  }

  async componentDidMount() {
    const yearId = this.props.location.state?.yearRefId || this.props.appState.yearRefId;
    const { registrationListAction } = this.props.userRegistrationState;
    let page = 1;
    let { sortBy } = this.state;
    let { sortOrder } = this.state;
    const prevUrl = getPrevUrl();
    if (
      !prevUrl ||
      !(history.location.pathname === prevUrl.pathname && history.location.key === prevUrl.key)
    ) {
      this.referenceCalls(this.state.organisationId);

      if (registrationListAction) {
        const {
          genderRefId,
          membershipProductId,
          membershipProductTypeId,
          paymentId,
          paymentStatusRefId,
          affiliate,
          competitionUniqueKey,
          searchText,
        } = registrationListAction.payload;
        const { offset } = registrationListAction.payload.paging;
        const { sortBy, sortOrder } = registrationListAction;
        const dobFrom =
          registrationListAction.payload.dobFrom !== '-1'
            ? moment(registrationListAction.payload.dobFrom).format('YYYY-MM-DD')
            : this.state.dobFrom;
        const dobTo =
          registrationListAction.payload.dobTo !== '-1'
            ? moment(registrationListAction.payload.dobTo).format('YYYY-MM-DD')
            : this.state.dobTo;
        const postalCode =
          registrationListAction.payload.postalCode == '-1'
            ? ''
            : registrationListAction.payload.postalCode;
        const regFrom =
          registrationListAction.payload.regFrom !== '-1'
            ? moment(registrationListAction.payload.regFrom).format('YYYY-MM-DD')
            : this.state.regFrom;
        const regTo =
          registrationListAction.payload.regTo !== '-1'
            ? moment(registrationListAction.payload.regTo).format('YYYY-MM-DD')
            : this.state.regTo;
        const yearRefId = JSON.parse(yearId);
        const teamName = this.props.location.state ? this.props.location.state.teamName : null;
        const teamId = this.props.location.state ? this.props.location.state.teamId : -1;

        await this.setState({
          offset,
          sortBy,
          sortOrder,
          affiliate,
          competitionUniqueKey,
          dobFrom,
          dobTo,
          genderRefId,
          membershipProductId,
          membershipProductTypeId,
          paymentId,
          paymentStatusRefId,
          postalCode,
          regFrom,
          regTo,
          searchText,
          yearRefId,
          teamName,
          teamId,
        });
        let { userRegDashboardListPageSize } = this.props.userRegistrationState;
        userRegDashboardListPageSize = userRegDashboardListPageSize
          ? userRegDashboardListPageSize
          : 10;
        page = Math.floor(offset / userRegDashboardListPageSize) + 1;

        this.handleRegTableList(page);
      } else {
        const teamName = this.props.location.state ? this.props.location.state.teamName : null;
        const teamId = this.props.location.state ? this.props.location.state.teamId : -1;
        this.setState({ teamName, teamId, yearRefId: JSON.parse(yearId) });
        setTimeout(() => {
          this.handleRegTableList(1);
        }, 300);
      }
    } else {
      history.push('/');
    }
    this.props.getGenericCommonReference({ GovernmentVoucher: 'GovernmentVoucher' });
  }

  componentDidUpdate(nextProps) {
    const { userRegistrationState, RegistrationChangeState } = this.props;

    if (nextProps.RegistrationChangeState != RegistrationChangeState) {
      if (this.state.loading && RegistrationChangeState.onMoveCompetitionLoad === false) {
        if (
          RegistrationChangeState.moveCompetitionSuccessMsg &&
          RegistrationChangeState.moveCompetitionSuccessMsg.length > 0
        ) {
          message.success(RegistrationChangeState.moveCompetitionSuccessMsg);
        }
        this.setState({ loading: false });
        this.handleRegTableList(1);
      }
    }
    if (nextProps.userRegistrationState != userRegistrationState) {
      if (this.state.loading == true && userRegistrationState.onTranSaveLoad == false) {
        this.setState({ loading: false });
        this.handleRegTableList(1);
      }
    }
    if (nextProps.liveScoreDashboardState != this.props.liveScoreDashboardState) {
      if (
        this.state.instalmentRetryloading == true &&
        this.props.liveScoreDashboardState.onRetryPaymentLoad == false
      ) {
        if (this.props.liveScoreDashboardState.retryPaymentSuccess) {
          message.success(this.props.liveScoreDashboardState.retryPaymentMessage);
        }
        let retryPaymenDetails = this.props.liveScoreDashboardState.retryPaymenDetails;
        if (retryPaymenDetails) {
          if (retryPaymenDetails.card || retryPaymenDetails.directDebit) {
            let retryPaymentMethod = RetryPaymentType.Card;
            if (!retryPaymenDetails.card && retryPaymenDetails.directDebit) {
              retryPaymentMethod = RetryPaymentType.DirectDebit;
            }
            this.setState({
              instalmentRetryModalVisible: true,
              instalmentRetryloading: false,
              instalmentRetryPaymentMethod: retryPaymentMethod,
            });
            return;
          }
        }
        this.setState({ loading: false, regRetryloading: false });
        this.handleRegTableList(1);
      }
      if (
        this.state.loading == true &&
        this.props.liveScoreDashboardState.onRetryPaymentLoad == false
      ) {
        if (this.props.liveScoreDashboardState.retryPaymentSuccess) {
          message.success(this.props.liveScoreDashboardState.retryPaymentMessage);
        }
        this.setState({ loading: false });
        this.handleRegTableList(1);
      }
    }
    if (nextProps.registrationDashboardState != this.props.registrationDashboardState) {
      if (
        this.state.regRetryloading == true &&
        this.props.registrationDashboardState.onRegRetryPaymentLoad == false
      ) {
        if (this.props.registrationDashboardState.retryPaymentSuccess) {
          message.success(this.props.registrationDashboardState.retryPaymentMessage);
        }
        let retryPaymenDetails = this.props.registrationDashboardState.retryPaymenDetails;
        if (retryPaymenDetails) {
          if (
            isArrayNotEmpty(retryPaymenDetails.card) ||
            isArrayNotEmpty(retryPaymenDetails.directDebit)
          ) {
            let retryPaymentCardId = '';
            if (retryPaymenDetails.card.length + retryPaymenDetails.directDebit.length == 1) {
              if (retryPaymenDetails.card.length == 1) {
                retryPaymentCardId = retryPaymenDetails.card[0].id;
              } else if (retryPaymenDetails.directDebit.length == 1) {
                retryPaymentCardId = retryPaymenDetails.directDebit[0].id;
              }
            }
            this.setState({
              registrationRetryModalVisible: true,
              regRetryloading: false,
              retryPaymentCardId: retryPaymentCardId,
            });
            return;
          }
        }
        this.setState({ loading: false, regRetryloading: false });
        this.handleRegTableList(1);
      }
    }

    if (nextProps.registrationDashboardState != this.props.registrationDashboardState) {
      if (
        this.state.loading == true &&
        this.props.registrationDashboardState.onRegStatusUpdateLoad == false
      ) {
        this.setState({ loading: false });
        this.handleRegTableList(1);
      }
    }

    if (
      this.state.cancelDeRegistrationLoad == true &&
      this.props.userState.cancelDeRegistrationLoad == false
    ) {
      this.setState({ cancelDeRegistrationLoad: false });
      this.handleRegTableList(1);
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setRegistrationListPageSize(pageSize);
  };

  handleRegTableList = async page => {
    //reset selected rows when table data is reloaded
    this.setState({ selectedRowKeys: [] });
    await this.props.setRegistrationListPageNumber(page);
    const {
      organisationId,
      // yearRefId,
      competitionUniqueKey,
      dobFrom,
      dobTo,
      membershipProductTypeId,
      genderRefId,
      postalCode,
      affiliate,
      membershipProductId,
      paymentId,
      paymentStatusRefId,
      searchText,
      regFrom,
      regTo,
      sortBy,
      sortOrder,
      teamId,
      governmentVoucherPending,
    } = this.state;
    const yearRefId =
      this.props.appState.yearRefId !== -1 && this.state.yearRefId != -1
        ? this.props.appState.yearRefId
        : this.state.yearRefId;
    let { userRegDashboardListPageSize } = this.props.userRegistrationState;
    userRegDashboardListPageSize = userRegDashboardListPageSize ? userRegDashboardListPageSize : 10;
    const filter = {
      organisationUniqueKey: organisationId,
      yearRefId,
      competitionUniqueKey,
      // dobFrom: (dobFrom !== "-1" && !isNaN(dobFrom)) ? moment(dobFrom).format("YYYY-MM-DD") : "-1",
      dobFrom: dobFrom !== '-1' ? moment(dobFrom).format('YYYY-MM-DD') : '-1',
      // dobTo: (dobTo !== "-1" && !isNaN(dobTo)) ? moment(dobTo).format("YYYY-MM-DD") : "-1",
      dobTo: dobTo !== '-1' ? moment(dobTo).format('YYYY-MM-DD') : '-1',
      membershipProductTypeId,
      genderRefId,
      postalCode: postalCode !== '' && postalCode !== null ? postalCode.toString() : '-1',
      affiliate,
      membershipProductId,
      paymentId,
      paymentStatusRefId,
      searchText,
      teamId,
      // regFrom: (regFrom !== "-1" && !isNaN(regFrom)) ? moment(regFrom).format("YYYY-MM-DD") : "-1",
      regFrom: regFrom !== '-1' ? moment(regFrom).format('YYYY-MM-DD') : '-1',
      // regTo: (regTo !== "-1" && !isNaN(regTo)) ? moment(regTo).format("YYYY-MM-DD") : "-1",
      regTo: regTo !== '-1' ? moment(regTo).format('YYYY-MM-DD') : '-1',
      governmentVoucherPending,
      paging: {
        limit: userRegDashboardListPageSize,
        offset: page ? userRegDashboardListPageSize * (page - 1) : 0,
      },
    };

    this.props.endUserRegDashboardListAction(filter, sortBy, sortOrder);

    this.setState({ filter });
  };

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
    this.props.getGenderAction();
    this.props.getOnlyYearListAction();
    this.props.registrationPaymentStatusAction();
  };

  onChangeDropDownValue = async (value, key) => {
    //reset selected rows when table data is reloaded
    this.setState({ selectedRowKeys: [] });
    if (key === 'postalCode') {
      // const regex = /,/gi;
      let canCall = false;
      const newVal = value.toString().split(',');
      newVal.forEach(x => {
        canCall = Number(x.length) % 4 === 0 && x.length > 0;
      });

      await this.setState({ postalCode: value });

      if (canCall) {
        this.handleRegTableList(1);
      } else if (value.length === 0) {
        this.handleRegTableList(1);
      }
    } else if (key === 'yearRefId') {
      await this.setState({
        yearRefId: value,
        membershipProductId: [-1],
        competitionUniqueKey: ['-1'],
        membershipProductTypeId: [-1]
      });
      if (value != -1) {
        this.props.setYearRefId(value);
      }
      this.handleRegTableList(1);

    } else if (key === 'competitionUniqueKey') {
      let valueArray = [];
      if (value[value.length - 1] === '-1' || value.length === 0) {
        valueArray = ['-1'];
      } else {
        valueArray = value.filter(competition => competition !== '-1');
      }
      await this.setState({ [key]: valueArray });
      this.handleRegTableList(1);
    } else if (
      key === 'membershipProductTypeId' ||
      key === 'paymentId' ||
      key === 'affiliate' ||
      key === 'membershipProductId'
    ) {
      let valueArray = [];
      if (value[value.length - 1] === -1 || value.length === 0) {
        valueArray = [-1];
      } else {
        valueArray = value.filter(competition => competition !== -1);
      }
      await this.setState({ [key]: valueArray });
      this.handleRegTableList(1);
    } else {
      let newValue;
      if (key === 'dobFrom' || key === 'dobTo' || key === 'regFrom' || key === 'regTo') {
        newValue = value == null ? '-1' : moment(value, 'YYYY-mm-dd');
      } else {
        newValue = value;
      }

      await this.setState({
        [key]: newValue,
      });

      this.handleRegTableList(1);
    }
  };

  onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      this.handleRegTableList(1);
    }
  };

  onChangeSearchText = async e => {
    const { value } = e.target;

    await this.setState({ searchText: value });

    if (!value) {
      this.handleRegTableList(1);
    }
  };

  onClickSearchIcon = async () => {
    this.handleRegTableList(1);
  };

  updateTransaction = () => {
    const { selectedRow } = this.state;
    let amount = 0;
    if (this.state.cashTranferType == 1) {
      amount = selectedRow.amountToTransfer;
    } else {
      amount = this.state.amount;
    }
    const payload = {
      amount,
      feeType: selectedRow.feeType,
      transactionId: selectedRow.transactionId,
      pendingFee: selectedRow.pendingFee,
    };
    this.props.regTransactionUpdateAction(payload);
    this.setState({ loading: true });
  };

  setCashPayment = record => {
    this.setState({
      selectedRow: record,
      visible: true,
      amount: 0,
      cashTranferType: 1,
    });
  };

  setVoucherPayment = record => {
    this.setState({
      selectedRow: record,
      isVoucherPaymentVisible: true,
    });
  };

  setSchoolInvoiceFailed = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 4,
      modalMessage: AppConstants.regCancelledModalMsg,
      modalTitle: AppConstants.invoiceCancel,
      isInvoiceFailed: 1,
    });
  };

  setSchoolInvoicePaid = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 4,
      modalMessage: AppConstants.regPaidModalMsg,
      modalTitle: AppConstants.invoicePaid,
      isInvoiceFailed: 0,
    });
  };
  markAsPaidForForcedOffline = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 9,
      modalMessage: AppConstants.regPaidModalMsg,
      modalTitle: AppConstants.invoicePaid,
    });
  };
  setFailedInstalmentRetry = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 5,
      modalMessage: AppConstants.regRetryInstalmentModalMsg,
      modalTitle: AppConstants.failedInstalmentRetry,
    });
  };
  setFailedRegistrationRetry = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 6,
      modalMessage: AppConstants.regRetryModalMsg,
      modalTitle: AppConstants.failedRegistrationRetry,
    });
  };

  setCashReceived = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 7,
      modalMessage: AppConstants.cashReceivedModalMsg,
      modalTitle: AppConstants.cashReceived,
      fromCashReceived: true,
    });
  };
  setRequestFundsOffline = record => {
    this.setState({
      selectedRow: record,
      otherModalVisible: true,
      actionView: 8,
      modalMessage: AppConstants.requestFundsOfflineModalMsg,
      modalTitle: AppConstants.requestFundsOffline,
    });
  };
  handleOtherModal = key => {
    const { selectedRow, actionView, isInvoiceFailed } = this.state;
    let paidByUserId = isArrayNotEmpty(selectedRow.paidByUsers)
      ? selectedRow.paidByUsers[0].paidByUserId
      : null;
    if (actionView == 4) {
      if (key == 'ok') {
        if (isInvoiceFailed == 1) {
          let payload = {
            membershipProductMappingId: selectedRow.membershipProductMappingId,
            userId: selectedRow.userId,
            registrationId: selectedRow.registrationUniqueKey,
            competitionId: selectedRow.competitionUniqueKey,
          };
          //cancel registration
          this.props.registrationFailedStatusUpdate(payload);
          this.setState({ loading: true });
        } else {
          let payload = {
            processTypeName: 'school_invoice',
            registrationUniqueKey: selectedRow.registrationUniqueKey,
            userId: selectedRow.userId,
            divisionId: selectedRow.divisionId,
            competitionId: selectedRow.competitionUniqueKey,
            organisationId: this.state.organisationId,
            membershipProductMappingId: selectedRow.membershipProductMappingId,
          };
          this.props.liveScorePlayersToCashReceivedAction(payload);
          this.setState({ loading: true });
        }
      }
    } else if (actionView == 5) {
      if (key == 'ok') {
        let payload = {
          processTypeName: 'instalment',
          registrationUniqueKey: selectedRow.registrationUniqueKey,
          userId: selectedRow.userId,
          divisionId: selectedRow.divisionId,
          competitionId: selectedRow.competitionUniqueKey,
          paidByUserId: paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.liveScorePlayersToPayRetryPaymentAction(payload);
        this.setState({ instalmentRetryloading: true });
      }
    } else if (actionView == 6) {
      if (key == 'ok') {
        let payload = {
          registrationId: selectedRow.registrationUniqueKey,
          paidByUserId: paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.registrationRetryPaymentAction(payload);
        this.setState({ regRetryloading: true });
      }
    } else if (actionView == 7) {
      if (key == 'ok') {
        let payload = {
          processTypeName: 'cash',
          registrationUniqueKey: selectedRow.registrationUniqueKey,
          userId: selectedRow.userId,
          divisionId: selectedRow.divisionId,
          competitionId: selectedRow.competitionUniqueKey,
          organisationId: this.state.organisationId,
          membershipProductMappingId: selectedRow.membershipProductMappingId,
        };
        this.props.liveScorePlayersToCashReceivedAction(payload);
        this.setState({ loading: true });
      }
    } else if (actionView == 8) {
      if (key == 'ok') {
        let payload = {
          membershipProductMappingId: selectedRow.membershipProductMappingId,
          userId: selectedRow.userId,
          registrationId: selectedRow.registrationUniqueKey,
          competitionId: selectedRow.competitionUniqueKey,
        };
        this.props.registrationRequestFundsOfflineAction(payload);
        this.setState({ loading: true });
      }
    } else if (actionView == 9) {
      if (key == 'ok') {
        let payload = {
          registrationUniqueKey: selectedRow.registrationUniqueKey,
          userId: selectedRow.userId,
          divisionId: selectedRow.divisionId,
          competitionId: selectedRow.competitionUniqueKey,
          organisationId: this.state.organisationId,
          membershipProductMappingId: selectedRow.membershipProductMappingId,
        };
        this.props.registrationMarkOfflineAsPaidAction(payload);
        this.setState({ loading: true });
      }
    }
    this.setState({ otherModalVisible: false });
  };

  handleinstalmentRetryModal = key => {
    const { selectedRow } = this.state;
    let paidByUserId = isArrayNotEmpty(selectedRow.paidByUsers)
      ? selectedRow.paidByUsers[0].paidByUserId
      : null;
    if (key == 'cancel') {
      this.setState({ instalmentRetryModalVisible: false });
    } else if (key == 'yes') {
      let payload = {
        processTypeName: 'instalment',
        registrationUniqueKey: selectedRow.registrationUniqueKey,
        userId: selectedRow.userId,
        divisionId: selectedRow.divisionId,
        competitionId: selectedRow.competitionUniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: this.state.instalmentRetryPaymentMethod,
      };
      this.props.liveScorePlayersToPayRetryPaymentAction(payload);
      this.setState({ instalmentRetryloading: true, instalmentRetryModalVisible: false });
    }
  };

  handleRegistrationRetryModal = key => {
    const { selectedRow, retryPaymentCardId } = this.state;
    let paidByUserId = isArrayNotEmpty(selectedRow.paidByUsers)
      ? selectedRow.paidByUsers[0].paidByUserId
      : null;
    if (key == 'cancel') {
      this.setState({ registrationRetryModalVisible: false });
    } else if (key == 'yes') {
      let registrationRetryDetails = this.props.registrationDashboardState.retryPaymenDetails;
      let checkCardAvailability = 0;
      if (!retryPaymentCardId) {
        message.error(AppConstants.selectPaymentMethod);
        return;
      }
      let isCardSelected = (registrationRetryDetails?.card || []).find(
        x => x.id == retryPaymentCardId,
      );
      let isDDSelected = (registrationRetryDetails?.directDebit || []).find(
        x => x.id == retryPaymentCardId,
      );
      if (isCardSelected) {
        checkCardAvailability = 1;
      } else if (isDDSelected) {
        checkCardAvailability = 2;
      }
      let payload = {
        registrationId: selectedRow.registrationUniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: checkCardAvailability,
        cardId: retryPaymentCardId,
        registeredCard: registrationRetryDetails.registeredCard,
      };
      this.props.registrationRetryPaymentAction(payload);
      this.setState({ regRetryloading: true, registrationRetryModalVisible: false });
    }
  };

  receiveCashPayment = key => {
    if (key == 'cancel') {
      this.setState({ visible: false });
    } else if (key == 'ok') {
      const { selectedRow } = this.state;
      // const { pendingFee } = selectedRow;
      const { amountToTransfer } = selectedRow;
      const { amount } = this.state;
      const totalAmt = Number(amountToTransfer) - Number(amount);
      if (totalAmt >= 0) {
        this.setState({ visible: false });
        this.updateTransaction();
      } else {
        message.config({ duration: 0.9, maxCount: 1 });
        message.error('Amount exceeded');
      }
    }
  };

  receiveVoucherPayment = key => {
    const { selectedRow } = this.state;
    if (key == 'cancel') {
      this.setState({ isVoucherPaymentVisible: false });
    } else if (key == 'ok') {
      let payload = {
        processTypeName: 'government_voucher',
        registrationUniqueKey: selectedRow.registrationUniqueKey,
        userId: selectedRow.userId,
        divisionId: selectedRow.divisionId,
        competitionId: selectedRow.competitionUniqueKey,
        organisationId: this.state.organisationId,
        membershipProductMappingId: selectedRow.membershipProductMappingId,
      };
      this.props.liveScorePlayersToCashReceivedAction(payload);
      this.setState({ isVoucherPaymentVisible: false, loading: true });
    }
  };

  cashReceivedForRetry = (record, offlineRetry) => {
    let processTypeName = '';
    if (offlineRetry == 0) {
      processTypeName = ProcessTypeName.OnBehalfOf;
    } else if (offlineRetry == 1) {
      processTypeName = ProcessTypeName.Registration;
    } else if (offlineRetry == 2) {
      processTypeName = ProcessTypeName.Instalment;
    }
    let payload = {
      registrationUniqueKey: record.registrationUniqueKey,
      competitionId: record.competitionUniqueKey,
      userId: record.userId,
      divisionId: record.divisionId,
      processTypeName: processTypeName,
      organisationId: this.state.organisationId,
      membershipProductMappingId: record.membershipProductMappingId,
    };
    this.props.liveScorePlayersToCashReceivedAction(payload);
    this.setState({ loading: true });
  };

  onBehalfRetry = record => {
    let payload = {
      registrationUniqueKey: record.registrationUniqueKey,
      competitionId: record.competitionUniqueKey,
      processTypeName: 'ONBEHALFOF',
      organisationId: this.state.organisationId,
    };
    this.props.liveScorePlayersToCashReceivedAction(payload);
    this.setState({ loading: true });
  };

  clearTagFilter = filterType => {
    switch (filterType) {
      case FileterType.Team:
        this.setState({ teamName: null, teamId: -1 });
        break;
      case FileterType.GovernmentVoucher:
        this.setState({ governmentVoucherPending: null });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.handleRegTableList(1);
    }, 300);
  };

  cancelDeRegistrtaion = deRegisterId => {
    try {
      const payload = {
        deRegisterId: Number(deRegisterId),
      };
      this.props.cancelDeRegistrationAction(payload);
      this.setState({ cancelDeRegistrationLoad: true });
    } catch (ex) {
      console.log(`Error in cancelDeRegistrtaion::${ex}`);
    }
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys });
  };

  onReplicatePlayerPopoverHandler = showPopover => {
    this.setState({ showReplicatePlayerPopover: showPopover });
  };

  popoverOnVisibleChangeHandler = showPopover => {
    this.setState({ showPopover });
  };

  updateDeregistrationData = (value, key, subKey) => {
    if (key === 'competitionUniqueKey' && subKey === 'move') {
      this.moveCompFormRef.current.setFieldsValue({
        divisionId: null,
      });
    }
    this.props.updateDeregistrationData(value, key, subKey);
  };

  handleOnClickReplicatePlayer = e => {
    this.props.updateModalVisibility(true);
  };

  handleOnClickMove = e => {
    this.getMoveCompetitionData();
    this.setState({ moveCompModalVisible: true });
  };

  getMoveCompetitionData = () => {
    let { userRegDashboardListData } = this.props.userRegistrationState;
    let selectedParticipants = [];
    for (let key of this.state.selectedRowKeys) {
      selectedParticipants.push(userRegDashboardListData.find(d => d.key === key));
    }
    let membershipProductMappingId = null;
    if (selectedParticipants.length > 0) {
      membershipProductMappingId = selectedParticipants[0].membershipProductMappingId;
    }
    let payload = {
      competitionId: this.state.competitionUniqueKey[0],
      membershipMappingId: membershipProductMappingId,
      organisationId: this.state.organisationId,
    };
    this.props.getMoveCompDataAction(payload);
  };

  moveCompetition = (selectedParticipants, saveData) => {
    let userDataMap = new Map();
    if (selectedParticipants.length > 0) {
      let cmpdIds = [...new Set(selectedParticipants.map(p => p.divisionId))];
      for (let id of cmpdIds) {
        let participants = selectedParticipants.filter(p => p.divisionId === id);
        let [userIds, movingCompParticipantIds, orptIds] = participants.reduce(
          (prev, curr) => {
            prev[0] = [...prev[0], curr.userId];
            prev[1] = [...prev[1], curr.compParticipantId];
            prev[2] = [...prev[2], curr.orgRegistrationParticipantId];
            return prev;
          },
          [[], [], []],
        );
        userDataMap.set(id ? id : 0, [userIds, movingCompParticipantIds, orptIds]);
      }

      let payload = {
        userDataList: [...userDataMap.entries()],
        membershipMappingId: selectedParticipants[0].membershipProductMappingId,
        isPlaying: selectedParticipants[0].isPlaying,
        organisationUniqueKey: this.state.organisationId,
        competitionUniqueKey: this.state.competitionUniqueKey[0],
        newCompetitionUniqueKey: saveData.move.competitionUniqueKey,
        newCompetitionMembershipProductDivisionId: saveData.move.divisionId,
      };
      this.props.moveCompetitionAction(payload);
    }
  };

  showReplicatePlayerModal = () => {
    const { userRegDashboardListData } = this.props.userRegistrationState;
    const selectedPlayers = this.state.selectedRowKeys.map(key =>
      userRegDashboardListData.find(item => item.key === key),
    );
    return (
      <ReplicatePlayerModal
        selectedPlayers={selectedPlayers}
        onChancel={() => this.props.updateModalVisibility(false)}
      ></ReplicatePlayerModal>
    );
  };

  moveCompModal = () => {
    const { saveData, moveCompetitions } = this.props.RegistrationChangeState;
    let { userRegDashboardListData } = this.props.userRegistrationState;
    let selectedParticipants = [];
    let hasCmpd = false;
    for (let key of this.state.selectedRowKeys) {
      selectedParticipants.push(userRegDashboardListData.find(d => d.key === key));
    }

    if (selectedParticipants.length > 0) {
      hasCmpd =
        selectedParticipants[0].competitionDivisionId &&
        selectedParticipants[0].competitionDivisionId !== 0;
    }

    let handleMoveCompModal = key => {
      if (key === 'ok') {
        this.moveCompFormRef.current
          .validateFields()
          .then(value => {
            this.setState({ moveCompModalVisible: false, loading: true });
            this.moveCompetition(selectedParticipants, saveData);
            this.updateDeregistrationData(null, 'clear', 'deRegister');
            this.moveCompFormRef.current.resetFields();
          })
          .catch(err => {
            console.log(err);
          });
      }
      if (key === 'cancel') {
        this.updateDeregistrationData(null, 'clear', 'deRegister');
        this.moveCompFormRef.current.resetFields();
        this.setState({ moveCompModalVisible: false });
      }
    };
    return (
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.moveComp}
        visible={this.state.moveCompModalVisible}
        onCancel={() => handleMoveCompModal('cancel')}
        onOk={() => handleMoveCompModal('ok')}
      >
        <span className="warning-msg">{AppConstants.moveCompWarningMsg}</span>
        <Form noValidate="noValidate" ref={this.moveCompFormRef}>
          <InputWithHead heading={AppConstants.newCompMovingTo} required="required-field" />
          <Form.Item
            name="moveCompetitionId"
            rules={[{ required: true, message: ValidationConstants.competitionField }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              style={{ paddingRight: 1 }}
              required="required-field pt-0 pb-0"
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              onChange={e => this.updateDeregistrationData(e, 'competitionUniqueKey', 'move')}
              value={saveData.move.competitionUniqueKey}
              placeholder="Competition Name"
            >
              {(moveCompetitions || []).map(comp => (
                <Option
                  key={'competition_' + comp.competitionUniqueKey}
                  value={comp.competitionUniqueKey}
                >
                  {comp.competitionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {saveData.move.competitionUniqueKey &&
          hasCmpd &&
          moveCompetitions.find(c => c.competitionUniqueKey === saveData.move.competitionUniqueKey)
            .competitionMembershipProductDivisions.length > 0 ? (
            <>
              <InputWithHead heading={AppConstants.divisionName} required="required-field" />
              <Form.Item
                name="divisionId"
                rules={[{ required: true, message: ValidationConstants.divisionNameIsRequired }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  style={{ paddingRight: 1 }}
                  required="required-field pt-0 pb-0"
                  className="input-inside-table-venue-court team-mem_prod_type w-100"
                  onChange={e => this.updateDeregistrationData(e, 'divisionId', 'move')}
                  placeholder="Division Name"
                >
                  {(
                    moveCompetitions.find(
                      x => x.competitionUniqueKey === saveData.move.competitionUniqueKey,
                    ).competitionMembershipProductDivisions || []
                  ).map(div => {
                    return (
                      <Option key={'division_' + div.id} value={div.id}>
                        {div.divisionName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    );
  };

  headerView = () => {
    let onlyOneCompAndMemSelected =
      this.state.competitionUniqueKey.length === 1 &&
      this.state.membershipProductTypeId.length === 1 &&
      this.state.membershipProductId.length === 1;

    let actionDisabled =
      !onlyOneCompAndMemSelected ||
      this.state.competitionUniqueKey.includes('-1') ||
      this.state.membershipProductTypeId.includes(-1) ||
      this.state.membershipProductId.includes(-1);

    let noRowSelected = this.state.selectedRowKeys.length <= 0;

    return (
      <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
        <div className="row" style={{ marginRight: 42 }}>
          <div className="col-lg-4 col-md-12 d-flex align-items-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.Registrations}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm d-flex align-items-center justify-content-end">
            <div style={{ marginRight: 15 }}>
              <Popover
                visible={this.state.showReplicatePlayerPopover}
                content={<div style={{ maxWidth: 360 }}>Replicate Player</div>}
                placement="top"
                trigger="hover"
                onVisibleChange={this.onReplicatePlayerPopoverHandler}
              >
                <Button
                  className="primary"
                  type="primary"
                  disabled={!this.state.selectedRowKeys.length}
                  onClick={this.handleOnClickReplicatePlayer}
                >
                  {AppConstants.replicatePlayer}
                </Button>
              </Popover>
            </div>

            <div style={{ marginRight: 15 }}>
              <Popover
                visible={this.state.showPopover}
                content={
                  <div style={{ maxWidth: 360 }}>
                    {actionDisabled || noRowSelected ? AppConstants.enableMoveCompBtnMsg : null}
                    {AppConstants.moveCompButtonPopoverMessage}
                  </div>
                }
                placement="top"
                trigger="hover"
                onVisibleChange={this.popoverOnVisibleChangeHandler}
              >
                <Button
                  className="primary"
                  type="primary"
                  disabled={actionDisabled || noRowSelected}
                  onClick={this.handleOnClickMove}
                >
                  {AppConstants.move}
                </Button>
              </Popover>
            </div>

            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() => this.onExport()}
            >
              <div className="row">
                <div className="col-sm">
                  <img src={AppImages.export} className="export-image" alt="" />
                  {AppConstants.export}
                </div>
              </div>
            </Button>

            <ExportGovernmentVoucherButton yearRefId={this.state.yearRefId} />
          </div>
        </div>
      </div>
    );
  };

  onExport = () => {
    const { filter, sortBy, sortOrder, searchText } = this.state;
    const params = {
      ...filter,
      paging: { limit: null, offset: null },
      sortBy,
      sortOrder,
      searchText,
    };

    console.log('params for export', params);
    this.props.exportRegistrationAction(params);
  };

  statusView = () => {
    let paymentStatus = [
      { id: 1, description: RegistrationStatus.PendingCompetitionFee },
      { id: 2, description: RegistrationStatus.PendingMembershipFee },
      { id: 3, description: RegistrationStatus.PendingRegistrationFee },
      { id: 4, description: RegistrationStatus.Registered },
      { id: 5, description: RegistrationStatus.FailedRegistration },
    ];
    const { teamName, governmentVoucherPending } = this.state;
    const filters = [];
    if (teamName) {
      filters.push({ name: teamName, type: FileterType.Team });
    }
    if (governmentVoucherPending) {
      filters.push({
        name: AppConstants.pendingGovernmentVoucher,
        type: FileterType.GovernmentVoucher,
      });
    }
    return (
      <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
        <div className="row" style={{ marginRight: 42 }}>
          <div className="col-sm-9 padding-right-reg-dropdown-zero">
            <div className="reg-filter-col-cont status-dropdown d-flex align-items-center justify-content-end pr-2">
              {filters.length ? (
                <div className="col-sm pt-1 align-self-center">
                  {filters.map(filter => (
                    <Tag
                      closable
                      color="volcano"
                      style={{ paddingTop: 3, height: 30 }}
                      onClose={() => {
                        this.clearTagFilter(filter.type);
                      }}
                      key={`${filters.name}`}
                    >
                      {filter.name}
                    </Tag>
                  ))}
                </div>
              ) : null}

              <div className="year-select-heading" style={{ width: 90 }}>
                {AppConstants.status}
              </div>
              <Select
                className="year-select reg-filter-select"
                style={{ maxWidth: 200 }}
                onChange={e => this.onChangeDropDownValue(e, 'paymentStatusRefId')}
                value={this.state.paymentStatusRefId}
              >
                <Option key={-1} value={-1}>
                  {AppConstants.all}
                </Option>
                {(paymentStatus || []).map(g => (
                  <Option key={`paymentStatus_${g.id}`} value={g.id}>
                    {g.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="col-sm-3 d-flex align-items-center justify-content-end margin-top-24-mobile">
            <div className="comp-product-search-inp-width">
              <Input
                className="product-reg-search-input"
                onChange={this.onChangeSearchText}
                placeholder="Search..."
                onKeyPress={this.onKeyEnterSearchText}
                value={this.state.searchText}
                prefix={
                  <SearchOutlined
                    style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                    onClick={this.onClickSearchIcon}
                  />
                }
                allowClear
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    const affiliateToData = this.props.userState.affiliateTo;
    let uniqueValues = [];
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

    const { genderData } = this.props.commonReducerState;
    const { competitions, membershipProductTypes, membershipProducts } =
      this.props.userRegistrationState;
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="fluid-width" style={{ marginRight: 55 }}>
          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.year}</div>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select"
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
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.competition}</div>
                <Select
                  showSearch
                  mode="multiple"
                  optionFilterProp="children"
                  className="year-select reg-filter-select1"
                  onChange={competitionId =>
                    this.onChangeDropDownValue(competitionId, 'competitionUniqueKey')
                  }
                  value={this.state.competitionUniqueKey}
                >
                  <Option key={-1} value="-1">
                    {AppConstants.all}
                  </Option>
                  {(competitions || []).map(item => (
                    <Option
                      key={`competition_${item.competitionUniqueKey}`}
                      value={item.competitionUniqueKey}
                    >
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.dobFrom}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'dobFrom')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="dobFrom"
                  value={this.state.dobFrom !== '-1' && moment(this.state.dobFrom, 'YYYY-MM-DD')}
                />
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.dobTo}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'dobTo')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="dobTo"
                  value={this.state.dobTo !== '-1' && moment(this.state.dobTo, 'YYYY-MM-DD')}
                />
              </div>
            </div>
          </div>

          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.product}</div>
                <Select
                  showSearch
                  mode="multiple"
                  optionFilterProp="children"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'membershipProductId')}
                  value={this.state.membershipProductId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(membershipProducts || []).map(g => (
                    <Option
                      key={`membershipProduct_${g.membershipProductUniqueKey}`}
                      value={g.membershipProductUniqueKey}
                    >
                      {g.productName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col1 col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.gender}</div>
                <Select
                  className="year-select reg-filter-select1"
                  onChange={e => this.onChangeDropDownValue(e, 'genderRefId')}
                  value={this.state.genderRefId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(genderData || []).map(g => (
                    <Option key={`gender_${g.id}`} value={g.id}>
                      {g.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.affiliate}</div>
                <Select
                  showSearch
                  mode="multiple"
                  optionFilterProp="children"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'affiliate')}
                  value={this.state.affiliate}
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
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.payment}</div>
                <Select
                  mode="multiple"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'paymentId')}
                  value={this.state.paymentId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(payments || []).map(payment => (
                    <Option
                      key={`paymentType_${payment.paymentTypeId}`}
                      value={payment.paymentTypeId}
                    >
                      {payment.paymentType}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.type}</div>
                <Select
                  showSearch
                  mode="multiple"
                  optionFilterProp="children"
                  className="year-select reg-filter-select"
                  style={{ minWidth: 100 }}
                  onChange={e => this.onChangeDropDownValue(e, 'membershipProductTypeId')}
                  value={this.state.membershipProductTypeId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(membershipProductTypes || []).map(g => (
                    <Option
                      key={`membershipProductType_${g.membershipProductTypeId}`}
                      value={g.membershipProductTypeId}
                    >
                      {g.membershipProductTypeName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: 95 }}>
                  {AppConstants.postCode}
                </div>
                <div style={{ width: '76%' }}>
                  <InputWithHead
                    auto_complete="off"
                    placeholder={AppConstants.postCode}
                    onChange={e => this.onChangeDropDownValue(e.target.value, 'postalCode')}
                    value={this.state.postalCode}
                  />
                </div>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.RegFrom}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'regFrom')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="regFrom"
                  value={this.state.regFrom !== '-1' && moment(this.state.regFrom, 'YYYY-MM-DD')}
                />
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.RegTo}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'regTo')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="regTo"
                  value={this.state.regTo !== '-1' && moment(this.state.regTo, 'YYYY-MM-DD')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  countView = () => {
    const { userRegistrationState } = this.props;
    const total = userRegistrationState.userRegDashboardListTotalCount;
    const { feesPaid, uniqueRegistrants } = userRegistrationState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="row">
            <div className="col-sm-4">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">
                  {AppConstants.numberOfRegistrations}
                  <CustomTooltip>
                    <span>{AppConstants.noOfRegistrationsInfo}</span>
                  </CustomTooltip>
                </div>
                <div className="reg-payment-price-text">{total}</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">
                  {AppConstants.uniqueRegisteredUsers}
                </div>
                <div className="reg-payment-price-text">{uniqueRegistrants || 0}</div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.valueOfRegistrations}</div>
                {feesPaid != null ? (
                  <div className="reg-payment-price-text">{currencyFormat(feesPaid)}</div>
                ) : (
                  <div className="reg-payment-price-text">0</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      userRegDashboardListTotalCount,
      userRegDashboardListData,
      userRegDashboardListPage,
      onUserRegDashboardLoad,
      userRegDashboardListPageSize,
    } = this.props.userRegistrationState;
    const { selectedRowKeys } = this.state;
    const actionDisabled =
      this.state.competitionUniqueKey === '-1' ||
      this.state.membershipProductTypeId === -1 ||
      this.state.membershipProductId === -1
        ? true
        : false;
    const rowSelection = actionDisabled
      ? null
      : {
          selectedRowKeys,
          onChange: this.onSelectChange,
          getCheckboxProps: record => ({
            disabled: false,
            /*record.organisationUniqueKey !== this.state.organisationId ||
              record.user_registration_team_id ||
              regoStatusListExactMatchForDisable.indexOf(record.paymentStatus) !== -1 ||
              record.paymentStatus.includes(RegistrationStatus.TransferredTo) ||
              record.hasReplications,*/
            name: record.name,
          }),
        };
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            rowSelection={rowSelection}
            columns={columns}
            rowKey={record => record.key}
            dataSource={userRegDashboardListData}
            pagination={false}
            loading={onUserRegDashboardLoad === true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={userRegDashboardListPage}
            defaultCurrent={userRegDashboardListPage}
            defaultPageSize={userRegDashboardListPageSize}
            total={userRegDashboardListTotalCount}
            onChange={this.handleRegTableList}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  transferModalView() {
    const { selectedRow } = this.state;

    return (
      <Modal
        title="Cash"
        visible={this.state.visible}
        onCancel={() => this.receiveCashPayment('cancel')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        onOk={() => this.receiveCashPayment('ok')}
        centered
      >
        <div>
          {' '}
          {AppConstants.amount} : {selectedRow ? selectedRow.amountToTransfer : 0}
        </div>
        <Radio.Group
          className="reg-competition-radio"
          value={this.state.cashTranferType}
          onChange={e => {
            this.setState({ cashTranferType: e.target.value });
          }}
        >
          <Radio value={1}>{AppConstants.fullCashAmount}</Radio>
          {/* <Radio value={2}>{AppConstants.partialCashAmount}</Radio> */}

          {/* {this.state.cashTranferType == 2 && (
                        <InputWithHead
                            placeholder={AppConstants.amount}
                            value={this.state.amount}
                            onChange={(e) => this.setState({ amount: e.target.value })}
                        />
                    )} */}
        </Radio.Group>
      </Modal>
    );
  }

  voucherReceivedModalView = () => {
    const { selectedRow } = this.state;
    const { GovernmentVoucher = [] } = this.props.commonReducerState;
    let voucherType = '';
    let appliedAmount = '$0.00',
      disburseAmount = selectedRow ? currencyFormat(selectedRow.governmentVoucherAmount) : '$0.00',
      receivedAmount = '$0.00';

    if (selectedRow && isArrayNotEmpty(selectedRow.governmentVoucher)) {
      let voucher = selectedRow.governmentVoucher[0];
      appliedAmount = currencyFormat(voucher.redeemAmount);
      receivedAmount = currencyFormat(voucher.redeemAmount);

      if (isArrayNotEmpty(GovernmentVoucher)) {
        let voucherRef = GovernmentVoucher.find(v => v.id == voucher.governmentVoucherRefId);
        if (voucherRef) {
          voucherType = voucherRef.description;
        }
      }
    }

    return (
      <Modal
        title="Confirm Payment Received"
        visible={this.state.isVoucherPaymentVisible}
        onCancel={() => this.receiveVoucherPayment('cancel')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        onOk={() => this.receiveVoucherPayment('ok')}
        centered
      >
        <div>
          <div>
            {' '}
            <span className="popup-head">{AppConstants.name}</span>:{' '}
            {selectedRow ? selectedRow.name : 0}
          </div>
          <div className="mt-2">
            {' '}
            <span className="popup-head">{AppConstants.dob}</span>:{' '}
            {selectedRow ? moment(selectedRow.dateOfBirth).format('DD/MM/YYYY') : 0}
          </div>
          <div className="mt-2">
            {' '}
            <span className="popup-head">{AppConstants.voucherType}</span>: {voucherType}
          </div>
          <div className="mt-2">
            {' '}
            <span className="popup-head">{AppConstants.code}</span>:{' '}
            {selectedRow ? selectedRow.voucherCode : 0}
          </div>
          {selectedRow?.governmentVoucherRefId == GovernmentVoucherType.SASportsVoucher && (
            <div className="mt-2">{AppConstants.voucherCodeNoExport}</div>
          )}
          <div className="mt-2">
            {' '}
            <span className="popup-head">{AppConstants.amountAppliedToRegistration}</span>:{' '}
            {appliedAmount}
          </div>
          <div className="mt-2">
            {' '}
            <span className="popup-head">{AppConstants.amountToDisburse}</span>: {disburseAmount}
          </div>
          <div className="mt-2">
            {' '}
            <div className="label-input">
              <div>
                <span className="popup-head">{AppConstants.amountReceived}</span>:&nbsp;&nbsp;
              </div>
              <div>
                <Input value={receivedAmount} size="small" disabled />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  otherModalView = () => {
    const { modalTitle, modalMessage, fromCashReceived } = this.state;
    return (
      <Modal
        title={modalTitle}
        visible={this.state.otherModalVisible}
        onCancel={() => this.handleOtherModal('cancel')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText={fromCashReceived ? 'Yes' : 'Update'}
        cancelText={fromCashReceived ? 'No' : 'Cancel'}
        onOk={() => this.handleOtherModal('ok')}
        centered
      >
        <p style={{ marginLeft: '20px' }}>{modalMessage}</p>
      </Modal>
    );
  };

  instalmentRetryModalView = () => {
    let instalmentRetryDetails = this.props.liveScoreDashboardState.retryPaymenDetails;
    return (
      <Modal
        title={AppConstants.failedInstalmentRetry}
        visible={this.state.instalmentRetryModalVisible}
        onCancel={() => this.handleinstalmentRetryModal('cancel')}
        footer={[
          <Button onClick={() => this.handleinstalmentRetryModal('cancel')}>
            {AppConstants.cancel}
          </Button>,
          <Button
            style={{ backgroundColor: '#ff8237', borderColor: '#ff8237', color: 'white' }}
            onClick={() => this.handleinstalmentRetryModal('yes')}
          >
            {AppConstants.ok}
          </Button>,
        ]}
        centered
      >
        <p style={{ marginLeft: '20px' }}>{AppConstants.instalmentRetryModalTxt}</p>
        <Radio.Group
          className={'reg-competition-radio'}
          value={this.state.instalmentRetryPaymentMethod}
          onChange={e => this.setState({ instalmentRetryPaymentMethod: e.target.value })}
        >
          {instalmentRetryDetails?.card && (
            <Radio value={1}>
              {AppConstants.creditCardOnly} {instalmentRetryDetails?.number}
            </Radio>
          )}
          {instalmentRetryDetails?.directDebit && (
            <Radio value={2}>
              {AppConstants.directDebit} {instalmentRetryDetails?.number}
            </Radio>
          )}
        </Radio.Group>
      </Modal>
    );
  };

  registrationRetryModalView = () => {
    let registrationRetryDetails = this.props.registrationDashboardState.retryPaymenDetails;
    return (
      <Modal
        title={AppConstants.failedRegistrationRetry}
        visible={this.state.registrationRetryModalVisible}
        onCancel={() => this.handleRegistrationRetryModal('cancel')}
        footer={[
          <Button onClick={() => this.handleRegistrationRetryModal('cancel')}>
            {AppConstants.cancel}
          </Button>,
          <Button
            style={{ backgroundColor: '#ff8237', borderColor: '#ff8237', color: 'white' }}
            onClick={() => this.handleRegistrationRetryModal('yes')}
          >
            {AppConstants.ok}
          </Button>,
        ]}
        centered
      >
        <p style={{ marginLeft: '20px' }}>{AppConstants.instalmentRetryModalTxt}</p>
        <Radio.Group
          value={this.state.retryPaymentCardId}
          onChange={e => this.setState({ retryPaymentCardId: e.target.value })}
        >
          {isArrayNotEmpty(registrationRetryDetails?.card) &&
            (registrationRetryDetails.card || []).map(item => (
              <Radio value={item.id}>
                {AppConstants.creditCardOnly} {item.number}
              </Radio>
            ))}
          {isArrayNotEmpty(registrationRetryDetails?.directDebit) &&
            (registrationRetryDetails.directDebit || []).map(item => (
              <Radio value={item.id}>
                {AppConstants.directDebit} {item.number}
              </Radio>
            ))}
        </Radio.Group>
      </Modal>
    );
  };

  render() {
    let moveCompModalVisible = this.state.moveCompModalVisible;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />

        <InnerHorizontalMenu menu="registration" regSelectedKey="2" />

        <Layout>
          {this.headerView()}
          {this.statusView()}

          <Content>
            <Loader
              visible={
                this.props.userRegistrationState.onTranSaveLoad ||
                this.props.registrationDashboardState.onRegRetryPaymentLoad ||
                this.props.liveScoreDashboardState.onRetryPaymentLoad ||
                this.props.registrationDashboardState.onRegStatusUpdateLoad ||
                this.props.RegistrationChangeState.onMoveCompetitionLoad
              }
            />
            {moveCompModalVisible ? this.moveCompModal() : null}
            {this.showReplicatePlayerModal()}
            {this.dropdownView()}
            {this.countView()}
            {this.contentView()}
            {this.transferModalView()}
            {this.voucherReceivedModalView()}
            {this.otherModalView()}
            {this.instalmentRetryModalView()}
            {this.registrationRetryModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      endUserRegDashboardListAction,
      getAffiliateToOrganisationAction,
      getGenericCommonReference,
      getGenderAction,
      setYearRefId,
      getOnlyYearListAction,
      getAllCompetitionAction,
      registrationPaymentStatusAction,
      regTransactionUpdateAction,
      exportRegistrationAction,
      liveScorePlayersToCashReceivedAction,
      setRegistrationListPageSize,
      setRegistrationListPageNumber,
      registrationFailedStatusUpdate,
      liveScorePlayersToPayRetryPaymentAction,
      registrationRetryPaymentAction,
      cancelDeRegistrationAction,
      registrationRequestFundsOfflineAction,
      registrationMarkOfflineAsPaidAction,
      getMoveCompDataAction,
      moveCompetitionAction,
      updateDeregistrationData,
      updateModalVisibility,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userRegistrationState: state.EndUserRegistrationState,
    userState: state.UserState,
    commonReducerState: state.CommonReducerState,
    appState: state.AppState,
    registrationDashboardState: state.RegistrationDashboardState,
    liveScoreDashboardState: state.LiveScoreDashboardState,
    RegistrationChangeState: state.RegistrationChangeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Registration);

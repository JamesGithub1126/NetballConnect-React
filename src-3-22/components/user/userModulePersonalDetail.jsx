import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  Layout,
  Breadcrumb,
  Table,
  Select,
  Pagination,
  Button,
  Tabs,
  Menu,
  Dropdown,
  Modal,
  Radio,
  message,
  Popover,
  Steps,
  Checkbox,
  Alert,
  DatePicker,
  InputNumber,
  Input,
} from 'antd';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import './user.css';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import {
  getUserModulePersonalDetailsAction,
  getUserModuleDocumentsAction,
  removeUserModuleDocumentAction,
  getUserModulePersonalByCompetitionAction,
  getUserModuleRegistrationAction,
  getUserModuleTeamMembersAction,
  getUserModuleTeamRegistrationAction,
  getUserModuleOtherRegistrationAction,
  getUserModuleMedicalInfoAction,
  getUserModuleActivityPlayerAction,
  getUserModuleActivityParentAction,
  getUserModuleActivityScorerAction,
  getUserModuleActivityManagerAction,
  getUserHistoryAction,
  getUserModuleIncidentListAction,
  getUserRole,
  getScorerData,
  getUmpireData,
  getCoachData,
  getUmpireActivityListAction,
  registrationResendEmailAction,
  userProfileUpdateAction,
  resetTfaAction,
  teamMemberUpdateAction,
  teamMemberSendInviteAction,
  exportUserRegData,
  getSubmittedRegData,
  transferUserRegistration,
  cancelDeRegistrationAction,
  getUserModuleSuspendedMatchesAction,
  liveScoreGetSummaryScoringByUserAction,
  userProfileUpdateHideStatisticsAction,
  getUserOwnModuleRegistrationAction,
  liveScoreGetSuspensionsAction,
  liveScoreGetTribunalsAction,
  userPhotoUpdateAction,
} from '../../store/actions/userAction/userAction';
import {
  getUmpireAvailabilityAction,
  saveUmpireAvailabilityAction,
} from '../../store/actions/LiveScoreAction/livescoreUmpiresAction';
import { getOnlyYearListAction, getVenuesTypeAction } from '../../store/actions/appAction';
import {
  getOrganisationData,
  getGlobalYear,
  setGlobalYear,
  getUserId,
} from '../../util/sessionStorage';
import history from '../../util/history';
import { liveScore_formateDate, getTime } from '../../themes/dateformate';
import InputWithHead from '../../customComponents/InputWithHead';
import Loader from '../../customComponents/loader';
import {
  getPurchasesListingAction,
  getReferenceOrderStatus,
} from '../../store/actions/shopAction/orderStatusAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  getDocumentFileName,
  isMembershipConcurrencyRuleEnabled,
} from '../../util/registrationHelper';
import { registrationRetryPaymentAction } from '../../store/actions/registrationAction/registrationDashboardAction';
import {
  liveScorePlayersToPayRetryPaymentAction,
  liveScorePlayersToCashReceivedAction,
} from '../../store/actions/LiveScoreAction/liveScoreDashboardAction';
import { clearDataOnCompChangeAction } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';
import { getOrganisationSettingsAction } from 'store/actions/homeAction/homeAction';
import { getGenericCommonReference } from '../../store/actions/commonAction/commonAction';
import { FLAVOUR, UserRole, OrganisationType, UMPIRE_SCHEDULE_STATUS } from '../../util/enums';
import { RegistrationStatus, RetryPaymentType } from '../../enums/registrationEnums';
import { isReadOnlyRole, isAdminRole } from 'util/permissions';
import SendTeamMemberInviteModal from './modal/sendInviteModal';
import MembershipExpiryModal from './modal/membershipExpiryModal';
import CommunicationsAndPrivacyView from './communicationsAndPrivacyView';
import UserMembership from './UserMemberships';
import MergedUserListModal from './mergedUserListModal';
import ValidationConstants from 'themes/validationConstant';
import { SPORT } from '../../util/enums';
import { UmpirePaymentDescription } from 'enums/enums';
import { currencyFormat } from 'util/currencyFormat';
import LiveScorePersonalStatistics from '../liveScore/liveScorePersonalStatistics';
import UserIncidents from './incidents';
import ScheduleSelector from 'react-schedule-selector';
import { isFootball } from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import Tooltip from 'react-png-tooltip';
import WorkingHours from './UmpireAvailability/workingHours';
import ManageVenues from './UmpireAvailability/manageVenues';
import { getLiveScoreSettingInitiate } from '../../store/actions/LiveScoreAction/LiveScoreSettingAction';
import { UserAvailability } from './UmpireAvailability/userAvailability';
import SwitchUserProfileModal from './modal/SwitchUserProfileModal';

function tableSort(a, b, key) {
  const stringA = JSON.stringify(a[key]);
  const stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

function umpireActivityTableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  const { UmpireActivityListSortBy, UmpireActivityListSortOrder, umpireActivityOffset, userId } =
    this_Obj.state;
  const { getUmpireActivityListAction } = this_Obj.props;
  if (UmpireActivityListSortBy !== key) {
    sortOrder = 'ASC';
  } else if (UmpireActivityListSortBy === key && UmpireActivityListSortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (UmpireActivityListSortBy === key && UmpireActivityListSortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }
  const payload = {
    paging: {
      limit: 10,
      offset: umpireActivityOffset,
    },
  };
  this_Obj.setState({ UmpireActivityListSortBy: sortBy, UmpireActivityListSortOrder: sortOrder });

  getUmpireActivityListAction(payload, JSON.stringify([15]), userId, sortBy, sortOrder);
}

const { Header, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
let this_Obj = null;

const isUserSuperAdmin = (userRolesFromState = []) => {
  const superAdminRoleId = 1;
  const organisationData = get(localStorage, 'setOrganisationData', '{}');
  const isLoggedUserHasSuperAdminRole =
    userRolesFromState.findIndex(role => role.roleId === superAdminRoleId) > -1;
  let isUserSuperAdmin = isLoggedUserHasSuperAdminRole;

  if (organisationData && organisationData != 'null') {
    const parsedOrganisationData = JSON.parse(organisationData);
    const isOrganisationUserSuperAdmin = parsedOrganisationData.userRoleId === superAdminRoleId;

    isUserSuperAdmin = isOrganisationUserSuperAdmin || isUserSuperAdmin;
  }

  return isUserSuperAdmin;
};

const openInvoicePage = data => {
  localStorage.setItem('invoicePage', JSON.stringify(data));
  window.open('/invoice', '_blank');
};
const openUserInvoice = record => {
  let obj = {
    registrationId: record.registrationId || record.registrationUniqueKey,
    fromUserProfile: true,
  };
  if (record.invoices.length > 0) {
    let invoice = record.invoices
      .sort((a, b) => a.invoiceTypeRefId - b.invoiceTypeRefId)
      .find(x => [1, 2, 4, 6].includes(x.invoiceTypeRefId));
    if (!invoice) {
      invoice = record.invoices[0];
    }
    obj = {
      invoiceId: invoice.invoiceId,
      invoiceTypeRefId: invoice.invoiceTypeRefId,
      userRegId: invoice.userRegUniqueKey,
      teamMemberRegId: invoice.teamMemberRegId,
      fromUserProfile: true,
    };
  }
  openInvoicePage(obj);
};
const { Step } = Steps;

const columns = [
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
  },
  {
    title: 'Competition',
    dataIndex: 'competitionName',
    key: 'competitionName',
    render: (competitionName, record, index) => {
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
            {moveCompData.map((d, index) => {
              let divisionName = d.divisionName ? ' - ' + d.divisionName : '';
              let title = <span className="step-title">{d.competitionName + divisionName}</span>;
              let desc = (
                <span key={index} className="step-desc">{`Moved by ${d.creatorName} on ${moment(
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
    title: 'Membership Valid Until',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    render: (expiryDate, record) => (
      <span>
        {expiryDate != null
          ? expiryDate !== 'Single Game'
            ? moment(expiryDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
            : expiryDate
          : null}
        {expiryDate === 'Single Game'
          ? ' - ' +
            record.numberOfMatches +
            ' ' +
            (Number(record.numberOfMatches) <= 1
              ? AppConstants.titleMatch
              : AppConstants.titleMatches)
          : ''}
      </span>
    ),
  },
  {
    title: 'Comp Fees Paid',
    dataIndex: 'compFeesPaid',
    key: 'compFeesPaid',
  },
  {
    title: 'Membership Product',
    dataIndex: 'membershipProduct',
    key: 'membershipProduct',
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipType',
    key: 'membershipType',
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    render: divisionName => <div>{divisionName != null ? divisionName : ''}</div>,
  },
  {
    title: AppConstants.paidBy,
    dataIndex: 'paidByUsers',
    key: 'paidByUsers',
    render: (paidByUsers, record) => (
      <div>
        {(record.paidByUsers || []).map((item, index) =>
          this_Obj.state.userId === item.paidByUserId ? (
            <div key={index}>Self</div>
          ) : (
            <div key={index}>
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
    title: AppConstants.status,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: paymentStatus => <span style={{ textTransform: 'capitalize' }}>{paymentStatus}</span>,
  },
  {
    title: AppConstants.action,
    dataIndex: 'regForm',
    key: 'regForm',
    render: (regForm, e) => {
      const organisation = getOrganisationData();
      const organistaionId = organisation ? organisation.organisationUniqueKey : null;
      const organisationTypeRefId = organisation?.organisationTypeRefId;
      let showInvoices = e.invoices.length > 0;
      showInvoices = showInvoices && !(!e.isRegisterer && e.teamId && !e.paidByThisUser);
      const showRegistrationChange =
        e.alreadyDeRegistered == 0 &&
        //e.paymentStatus != 'Failed Registration' &&
        e.paymentStatus != RegistrationStatus.CancelledRegistration &&
        e.canDeRegister;
      const showCancelRegistrationChange =
        (e.paymentStatus == 'Pending De-registration' || e.paymentStatus == 'Pending Transfer') &&
        e.canDeRegister;
      return (
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
            {e.paymentStatus == 'Failed Registration' && e.organisationId == organistaionId && (
              <Menu>
                {e.isFailedRegistration == 1 && (
                  <Menu.Item key="1" onClick={() => this_Obj.myRegistrationRetryPayment(e)}>
                    <span>{AppConstants.retryCustomerPayment}</span>
                  </Menu.Item>
                )}
                {e.isOnBehalfFailed == 1 && (
                  <Menu.Item key="2" onClick={() => this_Obj.cashReceivedForRetry(e, 1)}>
                    <span>{AppConstants.retryAffiliatePayment}</span>
                  </Menu.Item>
                )}
                {e.paymentStatusFlag == 2 && e.isFailedRegistration == 1 && (
                  <Menu.Item key="3" onClick={() => this_Obj.cashReceivedForRetry(e, 0)}>
                    <span>{AppConstants.offlinePaymentReceived}</span>
                  </Menu.Item>
                )}
              </Menu>
            )}
            {showRegistrationChange && (
              <Menu.Item
                key="4"
                onClick={() =>
                  history.push('/deregistration', {
                    regData: e,
                    personal: this_Obj.props.userState.personalData,
                    sourceFrom: AppConstants.ownRegistration,
                  })
                }
              >
                <span>{AppConstants.registrationChange}</span>
              </Menu.Item>
            )}
            {showCancelRegistrationChange && (
              <Menu.Item key="5" onClick={() => this_Obj.cancelDeRegistrtaion(e.deRegisterId)}>
                <span>
                  {e.paymentStatus == 'Pending De-registration'
                    ? AppConstants.cancelDeRegistrtaion
                    : AppConstants.cancelTransferReg}
                </span>
              </Menu.Item>
            )}
            <Menu.Item
              key="6"
              onClick={async () => {
                await this_Obj.props.clearDataOnCompChangeAction();
                history.push('/paymentDashboard', {
                  personal: this_Obj.props.userState.personalData,
                  registrationId: e.registrationId,
                });
              }}
            >
              <span>Payment</span>
            </Menu.Item>
            {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
              <>
                <Menu.Item
                  key="7"
                  onClick={() => this_Obj.registrationFormClicked(e.registrationId)}
                >
                  <span>Registration Form</span>
                </Menu.Item>
                {!!Number(e.competitionMembershipProductDivisionId) ? (
                  <Menu.Item
                    key="8"
                    onClick={() => {
                      this_Obj.setState({ showTransferRegistrationPopup: true });
                      this_Obj.setState({ registrationData: e });
                    }}
                  >
                    <span>Transfer registration</span>
                  </Menu.Item>
                ) : null}
              </>
            )}
            {showInvoices && (
              <Menu.Item key="9" onClick={() => openUserInvoice(e)}>
                <span>{AppConstants.invoice}</span>
              </Menu.Item>
            )}
            {organisationTypeRefId == OrganisationType.State && e.membershipExpiryDate ? (
              <Menu.Item key="10" onClick={() => this_Obj.openMembershipExpiredModal(e)}>
                <span>{AppConstants.updateMembershipExpiry}</span>
              </Menu.Item>
            ) : null}
          </SubMenu>
        </Menu>
      );
    },
  },
];

if (isFootball) {
  columns.splice(4, 0, {
    title: AppConstants.membershipProductCategoryTypeShort,
    dataIndex: 'membershipProductCategoryName',
    key: 'membershipProductCategoryName',
  });
}

const teamRegistrationColumns = [
  {
    title: AppConstants.teamName,
    dataIndex: 'teamName',
    key: 'teamName',
    render: (teamName, record) => (
      <span
        className="input-heading-add-another pt-0"
        onClick={() => this_Obj.showTeamMembers(record, 1)}
      >
        {teamName}
      </span>
    ),
  },

  {
    title: AppConstants.organisation,
    dataIndex: 'organisationName',
    key: 'organisationName',
  },

  {
    title: AppConstants.division,
    key: 'divisionName',
    dataIndex: 'divisionName',
  },

  {
    title: AppConstants.product,
    key: 'productName',
    dataIndex: 'productName',
  },

  {
    title: AppConstants.registeredBy,
    dataIndex: 'registeredBy',
    key: 'registeredBy',
    render: (registeredBy, record) => (
      <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
        <span className="input-heading-add-another pt-0">{registeredBy}</span>
      </NavLink>
    ),
  },

  {
    title: AppConstants.registrationDate,
    key: 'registrationDate',
    dataIndex: 'registrationDate',
    render: registrationDate => (
      <div>{registrationDate != null ? moment(registrationDate).format('DD/MM/YYYY') : ''}</div>
    ),
  },

  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: AppConstants.action,
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (data, record) => {
      const organistaionId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      let showInvoices = record.invoices.length > 0;
      const showRegistrationChange =
        (record.status == 'Registered' || record.status == 'Failed Registration') &&
        record.canDeRegister;
      return (
        <div>
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
              {showRegistrationChange ? (
                <Menu.Item
                  key="1"
                  onClick={() =>
                    history.push('/deregistration', {
                      regData: record,
                      personal: this_Obj.props.userState.personalData,
                      sourceFrom: AppConstants.teamRegistration,
                    })
                  }
                >
                  <span>{AppConstants.registrationChange}</span>
                </Menu.Item>
              ) : null}
              {showInvoices && (
                <Menu.Item key="2" onClick={() => openUserInvoice(record)}>
                  <span>{AppConstants.invoice}</span>
                </Menu.Item>
              )}
              {record.organisationUniqueKey == organistaionId &&
                record.status != 'Failed Registration' &&
                record.isRemove && (
                  <Menu.Item key="3" onClick={() => this_Obj.gotoAddTeamMember(record)}>
                    <span>{AppConstants.addTeamMembers}</span>
                  </Menu.Item>
                )}
            </SubMenu>
          </Menu>
        </div>
      );
    },
  },
];

const childOtherRegistrationColumns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
  },

  {
    title: AppConstants.dOB,
    dataIndex: 'dateOfBirth',
    key: 'dateOfBirth',
    render: dateOfBirth => (
      <div>{dateOfBirth != null ? moment(dateOfBirth).format('DD/MM/YYYY') : ''}</div>
    ),
  },

  {
    title: AppConstants.email,
    key: 'email',
    dataIndex: 'email',
  },

  {
    title: 'Phone',
    key: 'mobileNumber',
    dataIndex: 'mobileNumber',
  },
  {
    title: 'Fee Paid',
    key: 'feePaid',
    dataIndex: 'feePaid',
  },
  {
    title: AppConstants.action,
    key: 'action',
    render: (data, record) => {
      const organistaionId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      let showInvoices = record.invoices.length > 0;
      return (
        <div>
          {record.registrationId ? (
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
                {(record.invoiceFailedStatus || record.transactionFailedStatus) &&
                  record.organisationId == organistaionId && (
                    <Menu>
                      {(record.isFailedRegistration == 1 || record.transactionFailedStatus) && (
                        <Menu.Item key="1">
                          <span onClick={() => this_Obj.retryPayment(record)}>
                            {AppConstants.retryCustomerPayment}
                          </span>
                        </Menu.Item>
                      )}
                      {record.isOnBehalfFailed == 1 && (
                        <Menu.Item key="2">
                          <span onClick={() => this_Obj.cashReceivedForRetry(record, 1)}>
                            {AppConstants.retryAffiliatePayment}
                          </span>
                        </Menu.Item>
                      )}
                      {record.invoiceFailedStatus && record.isFailedRegistration == 1 && (
                        <Menu.Item key="3" onClick={() => this_Obj.cashReceivedForRetry(record, 0)}>
                          <span>{AppConstants.offlinePaymentReceived}</span>
                        </Menu.Item>
                      )}
                    </Menu>
                  )}
                {showInvoices && (
                  <Menu.Item key="4" onClick={() => openUserInvoice(record)}>
                    <span>{AppConstants.invoice}</span>
                  </Menu.Item>
                )}
              </SubMenu>
            </Menu>
          ) : null}
        </div>
      );
    },
  },
];

const teamMembersColumns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: AppConstants.status,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipTypeName',
    key: 'membershipTypeName',
  },
  {
    title: 'Paid Fee',
    dataIndex: 'paidFee',
    key: 'paidFee',
    render: r =>
      new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
      }).format(r),
  },
  {
    title: 'Pending Fee',
    dataIndex: 'pendingFee',
    key: 'pendingFee',
    render: (r, record) => {
      if (record.paymentStatus == 'Invited') {
        return '-';
      } else {
        return new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          minimumFractionDigits: 2,
        }).format(r);
      }
    },
  },
  {
    title: AppConstants.action,
    key: 'action',
    dataIndex: 'isActive',
    render: (data, record) => {
      const organistaionId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      const compOrgId = this_Obj.state.registrationTeam.organisationUniqueKey;
      const showRegistrationChange =
        record.paymentStatus != 'Pending De-registration' &&
        record.paymentStatus != 'Invited' &&
        record.canDeRegister;
      const showCancelRegistrationChange =
        record.paymentStatus == 'Pending De-registration' && record.canDeRegister;
      return (
        <div>
          {record.actionFlag == 1 && (
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
                {compOrgId == organistaionId && record.isRemove == 1 && (
                  <Menu.Item key="1">
                    <span onClick={() => this_Obj.removeTeamMember(record)}>
                      {record.isActive ? AppConstants.removeFromTeam : AppConstants.addToTeam}
                    </span>
                  </Menu.Item>
                )}
                {record.isRemove == 1 && record.paymentStatus == 'Invited' && (
                  <Menu.Item key="4">
                    <span onClick={() => this_Obj.showSendInviteModal(record)}>
                      {AppConstants.sendInviteAgain}
                    </span>
                  </Menu.Item>
                )}
                {showRegistrationChange && (
                  <Menu.Item
                    key="2"
                    onClick={() =>
                      history.push('/deregistration', {
                        regData: record,
                        personal: this_Obj.props.userState.personalData,
                        sourceFrom: AppConstants.teamMembers,
                      })
                    }
                  >
                    <span>{AppConstants.registrationChange}</span>
                  </Menu.Item>
                )}
                {showCancelRegistrationChange && (
                  <Menu.Item
                    key="3"
                    onClick={() => this_Obj.cancelTeamMemberDeRegistrtaion(record.deRegisterId)}
                  >
                    <span>{AppConstants.cancelDeRegistrtaion}</span>
                  </Menu.Item>
                )}
              </SubMenu>
            </Menu>
          )}
        </div>
      );
    },
  },
];

const columnsPlayer = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: (a, b) => tableSort(a, b, 'matchId'),
  },
  {
    title: AppConstants.date,
    dataIndex: 'stateDate',
    key: 'stateDate',
    sorter: (a, b) => tableSort(a, b, 'stateDate'),
    render: (stateDate, record, index) => (
      <div>{stateDate != null ? moment(stateDate).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: 'Home',
    dataIndex: 'home',
    key: 'home',
    sorter: (a, b) => tableSort(a, b, 'home'),
  },
  {
    title: 'Away',
    dataIndex: 'away',
    key: 'away',
    sorter: (a, b) => tableSort(a, b, 'away'),
  },
  {
    title: 'Borrowed Player',
    dataIndex: 'borrowedPlayerStatus',
    key: 'borrowedPlayerStatus',
    sorter: (a, b) => tableSort(a, b, 'borrowedPlayerStatus'),
    render: (borrowedPlayerStatus, record, index) => (
      <div>{borrowedPlayerStatus === 'Borrowed' ? 'Yes' : 'No'}</div>
    ),
  },
  {
    title: 'Result',
    dataIndex: 'teamScore',
    key: 'teamScore',
    sorter: (a, b) => tableSort(a, b, 'teamScore'),
  },
  {
    title: 'Game time',
    dataIndex: 'gameTime',
    key: 'gameTime',
    sorter: (a, b) => tableSort(a, b, 'gameTime'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => tableSort(a, b, 'status'),
  },
  {
    title: 'Competition',
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: (a, b) => tableSort(a, b, 'competitionName'),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: (a, b) => tableSort(a, b, 'affiliate'),
  },
];

const columnsParent = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: (a, b) => a.firstName.localeCompare(b.firstName),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: (a, b) => a.lastName.localeCompare(b.lastName),
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dateOfBirth',
    key: 'dateOfBirth',
    sorter: (a, b) => a.dateOfBirth.localeCompare(b.dateOfBirth),
    render: (dateOfBirth, record, index) => (
      <div>{dateOfBirth != null ? moment(dateOfBirth).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.team,
    dataIndex: 'team',
    key: 'team',
    sorter: (a, b) => a.team.localeCompare(b.team),
  },
  {
    title: AppConstants.div,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: (a, b) => a.divisionName.localeCompare(b.divisionName),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: (a, b) => a.affiliate.localeCompare(b.affiliate),
  },
];

const columnsScorer = [
  {
    title: 'Start',
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    render: (startTime, record, index) => (
      <div>{startTime != null ? moment(startTime).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: (a, b) => a.matchId.localeCompare(b.matchId),
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: (a, b) => a.teamName.localeCompare(b.teamName),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Competition',
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: (a, b) => a.competitionName.localeCompare(b.competitionName),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: (a, b) => a.affiliate.localeCompare(b.affiliate),
  },
];

const columnsManager = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: (a, b) => a.matchId.localeCompare(b.matchId),
  },
  {
    title: AppConstants.date,
    dataIndex: 'startTime',
    key: 'startTime',
    sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    render: (startTime, record, index) => (
      <div>{startTime != null ? moment(startTime).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: 'Home',
    dataIndex: 'home',
    key: 'home',
    sorter: (a, b) => a.home.localeCompare(b.home),
  },
  {
    title: 'Away',
    dataIndex: 'away',
    key: 'away',
    sorter: (a, b) => a.away.localeCompare(b.away),
  },
  {
    title: 'Results',
    dataIndex: 'teamScore',
    key: 'teamScore',
    sorter: (a, b) => a.teamScore.localeCompare(b.teamScore),
  },
  {
    title: 'Competition',
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: (a, b) => a.competitionName.localeCompare(b.competitionName),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: (a, b) => a.affiliate.localeCompare(b.affiliate),
  },
];

const columnsPersonalAddress = [
  {
    title: 'Street',
    dataIndex: 'street',
    key: 'street',
  },
  {
    title: 'Suburb',
    dataIndex: 'suburb',
    key: 'suburb',
  },
  {
    title: AppConstants.stateTitle,
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: 'Postcode',
    dataIndex: 'postalCode',
    key: 'postalCode',
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    width: 80,
    render: (data, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { userData: record, moduleFrom: '1' },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsPersonalPrimaryContacts = [
  {
    title: AppConstants.name,
    dataIndex: 'parentName',
    key: 'parentName',
    render: (parentName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: { userId: record.parentUserId },
        }}
      >
        <span className="input-heading-add-another pt-0">{parentName}</span>
      </NavLink>
    ),
  },
  {
    title: 'Street',
    dataIndex: 'street',
    key: 'street',
  },
  {
    title: 'Suburb',
    dataIndex: 'suburb',
    key: 'suburb',
  },
  {
    title: AppConstants.stateTitle,
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: 'Postcode',
    dataIndex: 'postalCode',
    key: 'postalCode',
  },
  {
    title: 'Phone Number',
    dataIndex: 'mobileNumber',
    key: 'mobileNumber',
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    render: status => <div className={status === 'Restricted' ? 'restricted' : ''}>{status}</div>,
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUser',
    key: 'isUser',
    width: 80,
    render: (data, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { userData: record, moduleFrom: '2' },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>

          {record.roleId == UserRole.ParentRestricted ? (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentLinked)}>
                  {AppConstants.link}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentUnlinked)}>
                  {AppConstants.deLinked}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckParent(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          ) : record.roleId == UserRole.ParentLinked ? (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentRestricted)}>
                  {AppConstants.restricted}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentUnlinked)}>
                  {AppConstants.deLinked}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckParent(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          ) : (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentRestricted)}>
                  {AppConstants.restricted}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckParent(record, UserRole.ParentLinked)}>
                  {AppConstants.link}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckParent(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          )}
         
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsPersonalChildContacts = [
  {
    title: AppConstants.name,
    dataIndex: 'childName',
    key: 'childName',
    render: (childName, record) => (
      <NavLink
        to={{
          pathname: `/userPersonal`,
          state: { userId: record.childUserId },
        }}
      >
        <span className="input-heading-add-another pt-0">{childName}</span>
      </NavLink>
    ),
  },
  {
    title: 'Street',
    dataIndex: 'street',
    key: 'street',
  },
  {
    title: 'Suburb',
    dataIndex: 'suburb',
    key: 'suburb',
  },
  {
    title: AppConstants.stateTitle,
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: 'Postcode',
    dataIndex: 'postalCode',
    key: 'postalCode',
  },
  {
    title: 'Phone Number',
    dataIndex: 'mobileNumber',
    key: 'mobileNumber',
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    render: status => <div className={status === 'Restricted' ? 'restricted' : ''}>{status}</div>,
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUser',
    key: 'isUser',
    width: 80,
    render: (data, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { userData: record, moduleFrom: '6' },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>

          {/* <Menu.Item key="2">
            <span onClick={() => this_Obj.unlinkCheckChild(record)}>
              {record.status == 'Linked' ? 'Unlink' : 'Link'}
            </span>
          </Menu.Item> */}
          {record.roleId == UserRole.ParentRestricted ? (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentLinked)}>
                  {AppConstants.link}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentUnlinked)}>
                  {AppConstants.deLinked}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckChild(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          ) : record.roleId == UserRole.ParentLinked ? (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentRestricted)}>
                  {AppConstants.restricted}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentUnlinked)}>
                  {AppConstants.deLinked}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckChild(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          ) : (
            <>
              <Menu.Item key="2">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentRestricted)}>
                  {AppConstants.restricted}
                </span>
              </Menu.Item>
              <Menu.Item key="3">
                <span onClick={() => this_Obj.unlinkCheckChild(record, UserRole.ParentLinked)}>
                  {AppConstants.link}
                </span>
              </Menu.Item>
              {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
                <Menu.Item key="4">
                  <span onClick={() => this_Obj.unlinkCheckChild(record, 'delete_link')}>
                    {AppConstants.permanentlyUnlink}
                  </span>
                </Menu.Item>
              )}
            </>
          )}
          
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsDocuments = [
  {
    title: 'Date Uploaded',
    dataIndex: 'dateUploaded',
    key: 'dateUploaded',
    render: (data, record) => moment(data).format('DD/MM/YYYY'),
  },
  {
    title: 'Document Type',
    dataIndex: 'docTypeDescription',
    key: 'docTypeDescription',
  },
  {
    title: 'Document',
    dataIndex: 'docUrl',
    key: 'docUrl',
    render: (data, record) => {
      let filename = getDocumentFileName(data);
      return (
        <a href={`${data}`}>
          <span>{filename}</span>
        </a>
      );
    },
  },
  {
    title: 'Action',
    dataIndex: 'isUser',
    key: 'isUser',
    width: 80,
    render: (data, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: {
                  userData: {
                    userId: record.userId,
                    organisationId: record.organisationUniqueKey,
                    documentId: record.id,
                    docType: record.docType,
                    docUrl: record.docUrl,
                  },
                  moduleFrom: '9',
                },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>

          <Menu.Item key="2">
            <span onClick={() => this_Obj.removeDocument(record)}>Remove</span>
          </Menu.Item>
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsPersonalEmergency = [
  {
    title: AppConstants.firstName,
    dataIndex: 'emergencyFirstName',
    key: 'emergencyFirstName',
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'emergencyLastName',
    key: 'emergencyLastName',
  },
  {
    title: 'Phone Number',
    dataIndex: 'emergencyContactNumber',
    key: 'emergencyContactNumber',
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUser',
    key: 'isUser',
    width: 80,
    render: (data, record) => (
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
          <Menu.Item key="1">
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { userData: record, moduleFrom: '3' },
              }}
            >
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
        </SubMenu>
      </Menu>
    ),
  },
];

const columnsFriends = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone Number',
    dataIndex: 'mobileNumber',
    key: 'mobileNumber',
  },
];

const columnsPlayedBefore = [
  {
    title: 'Played Before',
    dataIndex: 'playedBefore',
    key: 'playedBefore',
  },
  {
    title: 'Played Club',
    dataIndex: 'playedClub',
    key: 'playedClub',
  },
  {
    title: 'Played Grade',
    dataIndex: 'playedGrade',
    key: 'playedGrade',
  },
  {
    title: 'Played Year',
    dataIndex: 'playedYear',
    key: 'playedYear',
  },
  {
    title: 'Last Captain',
    dataIndex: 'lastCaptainName',
    key: 'lastCaptainName',
  },
];

const columnsFav = [
  {
    title: 'Favourite Netball Team',
    dataIndex: 'favouriteTeam',
    key: 'favouriteTeam',
  },
  {
    title: 'Who is your favourite Firebird?',
    dataIndex: 'favouriteFireBird',
    key: 'favouriteFireBird',
  },
];

const columnsVol = [
  {
    title: 'Volunteers',
    dataIndex: 'description',
    key: 'description',
  },
];

const columnsMedical = [
  {
    title: 'Disability Type',
    dataIndex: 'disabilityType',
    key: 'disabilityType',
  },
  {
    title: 'Disability Care Number',
    dataIndex: 'disabilityCareNumber',
    key: 'disabilityCareNumber',
  },
];

const columnsHistory = [
  // {
  //     title: AppConstants.competitionName,
  //     dataIndex: 'competitionName',
  //     key: 'competitionName'
  // },
  // {
  //     title: AppConstants.teamName,
  //     dataIndex: 'teamName',
  //     key: 'teamName'
  // },
  {
    title: AppConstants.divisionGrade,
    dataIndex: 'divisionGrade',
    key: 'divisionGrade',
  },
  {
    title: 'Ladder Position',
    dataIndex: 'ladderResult',
    key: 'ladderResult',
  },
];

// listeners for sorting
const listeners = key => ({
  onClick: () => umpireActivityTableSort(key),
});

const umpireActivityColumn = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'matchId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.date,
    dataIndex: 'date',
    key: 'date',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (date, record) => (
      <span>{record?.match?.startTime ? liveScore_formateDate(record.match.startTime) : ''}</span>
    ),
  },
  {
    title: AppConstants.time,
    dataIndex: 'time',
    key: 'time',
    // sorter: true,
    render: (time, record) => (
      <span>{record?.match?.startTime ? getTime(record.match.startTime) : ''}</span>
    ),
  },
  {
    title: AppConstants.competition,
    dataIndex: 'competition',
    key: 'competition',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (date, record) => (
      <span>{record?.match?.competition ? record.match.competition.longName : ''}</span>
    ),
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (affiliate, record) => {
      const organisationArray =
        record.user.userRoleEntities.length > 0 &&
        this_Obj.getOrganisationArray(record.user.userRoleEntities, record.roleId);
      return (
        <div>
          {organisationArray.map((item, index) => (
            <span key={`organisationName${index}`} className="multi-column-text-aligned">
              {item.competitionOrganisation && item.competitionOrganisation.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    title: AppConstants.home,
    dataIndex: 'home',
    key: 'home',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (home, record) => <span>{record?.match?.team1 ? record.match.team1.name : ''}</span>,
  },
  {
    title: AppConstants.away,
    dataIndex: 'away',
    key: 'away',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (away, record) => <span>{record?.match?.team2 ? record.match.team2.name : ''}</span>,
  },
  {
    title: AppConstants.amount,
    dataIndex: 'amount',
    key: 'amount',
    // sorter: true,
    // onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (amount1, record) => {
      let amount = '';
      if (record.matchUmpire && record.matchUmpire.amount) {
        amount = record.matchUmpire.amount;
        if (amount) {
          amount = currencyFormat(amount);
        }
      }
      return <span>{amount}</span>;
    },
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    // sorter: true,
    // onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (status1, record) => {
      let status = '';
      if (
        record.matchUmpire &&
        record.matchUmpire.paymentStatusRefId &&
        record.matchUmpire.paymentStatusRefId != 4
      ) {
        status = UmpirePaymentDescription[record.matchUmpire.paymentStatusRefId];
        if (!status) {
          status = '';
        }
      }
      return <span>{status}</span>;
    },
  },
];

const coachColumn = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'coach matchId',
    sorter: true,
  },
  {
    title: AppConstants.date,
    dataIndex: 'startTime',
    key: 'coach date',
    sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    render: (startTime, record, index) => (
      <div>{startTime != null ? moment(startTime).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.homeTeam,
    dataIndex: 'homeTeam',
    key: 'coach homeTeam',
    sorter: (a, b) => a.homeTeam.localeCompare(b.homeTeam),
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'awayTeam',
    key: 'coach awayTeam',
    sorter: (a, b) => a.awayTeam.localeCompare(b.awayTeam),
  },
  {
    title: AppConstants.results,
    dataIndex: 'resultStatus',
    key: 'coach result',
    sorter: (a, b) => a.resultStatus.localeCompare(b.resultStatus),
  },
];

const umpireColumn = [
  {
    title: AppConstants.tableMatchID,
    dataIndex: 'matchId',
    key: 'Umpire matchId',
    sorter: true,
  },
  {
    title: AppConstants.date,
    dataIndex: 'startTime',
    key: 'Umpire date',
    sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    render: (startTime, record, index) => (
      <div>{startTime != null ? moment(startTime).format('DD/MM/YYYY') : ''}</div>
    ),
  },
  {
    title: AppConstants.homeTeam,
    dataIndex: 'homeTeam',
    key: 'Umpire homeTeam',
    sorter: (a, b) => a.homeTeam.localeCompare(b.homeTeam),
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'awayTeam',
    key: 'Umpire awayTeam',
    sorter: (a, b) => a.awayTeam.localeCompare(b.awayTeam),
  },
  {
    title: AppConstants.results,
    dataIndex: 'resultStatus',
    key: 'Umpire result',
    sorter: (a, b) => a.resultStatus.localeCompare(b.resultStatus),
  },
];

function purchasesTableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.purchasesListSortBy !== key) {
    sortOrder = 'asc';
  } else if (
    this_Obj.state.purchasesListSortBy === key &&
    this_Obj.state.purchasesListSortOrder === 'asc'
  ) {
    sortOrder = 'desc';
  } else if (
    this_Obj.state.purchasesListSortBy === key &&
    this_Obj.state.purchasesListSortOrder === 'desc'
  ) {
    sortBy = sortOrder = null;
  }
  const params = {
    limit: 10,
    offset: this_Obj.state.purchasesOffset,
    order: sortOrder || '',
    sorterBy: sortBy || '',
    userId: this_Obj.state.userId,
  };
  this_Obj.props.getPurchasesListingAction(params);
  this_Obj.setState({ purchasesListSortBy: sortBy, purchasesListSortOrder: sortOrder });
}

// listeners for sorting
const purchaseListeners = key => ({
  onClick: () => purchasesTableSort(key),
});

const purchaseActivityColumn = [
  {
    title: AppConstants.orderId,
    dataIndex: 'orderId',
    key: 'orderId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners('id'),
    render: orderId => (
      <NavLink
        to={{
          pathname: `/orderDetails`,
          state: { orderId },
        }}
      >
        <span className="input-heading-add-another pt-0">{orderId}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.date,
    dataIndex: 'date',
    key: 'date',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners('createdOn'),
    render: date => <span>{date ? liveScore_formateDate(date) : ''}</span>,
  },
  // {
  //   title: AppConstants.transactionId,
  //   dataIndex: 'transactionId',
  //   key: 'transactionId',
  //   sorter: true,
  //   onHeaderCell: ({ dataIndex }) => purchaseListeners("id"),
  //   render: (transactionId) =>
  //       <span className="input-heading-add-another pt-0">{transactionId}</span>
  // },
  {
    titie: AppConstants.products,
    dataIndex: 'orderDetails',
    key: 'orderDetails',
    // sorter: true,
    // onHeaderCell: ({ dataIndex }) => purchaseListeners(dataIndex),
    render: orderDetails => (
      <div>
        {orderDetails.length > 0 &&
          orderDetails.map((item, i) => (
            <span key={`orderDetails${i}`} className="desc-text-style side-bar-profile-data">
              {item}
            </span>
          ))}
      </div>
    ),
  },
  {
    title: AppConstants.organisation,
    dataIndex: 'affiliateName',
    key: 'affiliateName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners('organisationId'),
  },
  {
    title: AppConstants.paymentStatus,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners(dataIndex),
    render: paymentStatus => (
      <span>{this_Obj.getOrderStatus(paymentStatus, 'ShopPaymentStatus')}</span>
    ),
  },
  {
    title: AppConstants.paymentMethod,
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners(dataIndex),
  },
  {
    title: AppConstants.fulfilmentStatus,
    dataIndex: 'fulfilmentStatus',
    key: 'fulfilmentStatus',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => purchaseListeners(dataIndex),
    render: fulfilmentStatus => (
      <span>{this_Obj.getOrderStatus(fulfilmentStatus, 'ShopFulfilmentStatusArr')}</span>
    ),
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'purchaseAction',
    render: (data, record) => (
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
          <Menu.Item
            key="1"
            onClick={() =>
              openInvoicePage({
                invoiceId: record.invoiceId,
                shopUniqueKey: record.shopUniqueKey,
                fromUserProfile: true,
              })
            }
          >
            <span>{AppConstants.invoice}</span>
          </Menu.Item>
        </SubMenu>
      </Menu>
    ),
  },
];

const { WeekPicker } = DatePicker;

class UserModulePersonalDetail extends Component {
  constructor(props) {
    super(props);
    this_Obj = this;
    this.state = {
      userId: 0,
      tabKey: '1',
      competition: null,
      statCompetition: null,
      screenKey: null,
      loading: false,
      registrationForm: null,
      isRegistrationForm: false,
      screen: null,
      yearRefId: null,
      competitions: [],
      teams: [],
      divisions: [],
      stripeDashBoardLoad: false,
      umpireActivityOffset: 0,
      UmpireActivityListSortBy: null,
      UmpireActivityListSortOrder: null,
      purchasesOffset: 0,
      purchasesListSortBy: null,
      purchasesListSortOrder: null,
      unlinkOnLoad: false,
      unlinkRecord: null,
      showChildUnlinkConfirmPopup: false,
      showParentUnlinkConfirmPopup: false,
      showCannotUnlinkPopup: false,
      isAdmin: false,
      myRegCurrentPage: 1,
      otherRegCurrentPage: 1,
      childRegCurrentPage: 1,
      teamRegCurrentPage: 1,
      isShowRegistrationTeamMembers: false,
      registrationTeam: null,
      removeTeamMemberLoad: false,
      showRemoveTeamMemberConfirmPopup: false,
      showTransferRegistrationPopup: false,
      transferRegistrationUserId: '',
      transferRegistrationPaidBy: '',
      registrationData: [],
      removeTeamMemberRecord: null,
      selectedRow: null,
      showSendInviteModal: false,
      retryPaymentOnLoad: false,
      instalmentRetryRecord: null,
      retryPaymentMethod: 1,
      regRetryRecord: null,
      registrationRetryModalVisible: false,
      instalmentRetryloading: false,
      regRetryloading: false,
      instalmentRetryModalVisible: false,
      retryPaymentCardId: '',
      pendingParentRole: null,
      pendingChildRole: null,
      showMembershipExpiredModal: false,
      membershipExpiryId: null,
      buttonLoading: false,
      showMergedUserListModal: false,
      scheduleStartDate: new Date(moment().startOf('week').format()),
      scheduleUnavailableStart: null,
      scheduleUnavailableEnd: null,
      schedule: null,
      allVenues: true,
      showManageVenuesView: false,
      showUserTypeChangeModal: false,
      swapUserRecord: {},
    };
    this.isNetball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Netball;
    this.isBasketball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Basketball;

    this.handleColumns();
  }

  componentWillMount() {
    const competition = this.getEmptyCompObj();
    this.setState({ competition });
    this.props.getOnlyYearListAction();
    this.props.getVenuesTypeAction('all');
  }

  async componentDidMount() {
    const yearRefId = getGlobalYear() ? JSON.parse(getGlobalYear()) : -1;
    this.setState({ yearRefId });
    const isAdmin = getOrganisationData() ? getOrganisationData().userRole == 'admin' : false;
    this.props.getReferenceOrderStatus();
    this.props.getGenericCommonReference({
      PlayerMembershipTier: 'PlayerMembershipTier',
    });
    const profileRouterStateKey = 'profileRouterState';
    const routerState = get(this.props, 'location.state', null);
    const storageRouterState = JSON.parse(localStorage.getItem(profileRouterStateKey));
    const profileState = routerState || storageRouterState || {};
    const storageUserId = localStorage.getItem('userId');

    if (routerState) {
      localStorage.setItem(profileRouterStateKey, JSON.stringify(routerState));
    }

    const { userId: stateUserId, screenKey, screen, tabKey } = profileState;
    const currentTabKey = tabKey || this.state.tabKey;
    const userId = stateUserId || storageUserId;

    if (profileState) {
      this.setState({
        userId,
        screenKey,
        screen,
        tabKey,
      });
    }

    this.tabApiCalls(tabKey, this.state.competition, userId, yearRefId);
    this.apiCalls(userId);

    if (currentTabKey === '1') {
      this.handleActivityTableList(1, userId, this.state.competition, 'parent');
    }

    this.setState({
      isAdmin,
    });

    const scheduleUnavailableStart = moment().subtract(1, 'd').endOf('day');
    const scheduleUnavailableEnd = moment().add(3, 'M').subtract(1, 'd').endOf('day');

    this.setState({ scheduleUnavailableStart, scheduleUnavailableEnd });
  }

  componentDidUpdate(prevProps) {
    const { userState, liveScoreUmpireState } = this.props;
    const personal = userState.personalData;
    if (userState.onLoad === false && this.state.loading === true) {
      if (!userState.error) {
        this.setState({
          loading: false,
        });
      }
    }

    if (
      (this.state.competition.competitionUniqueKey == null ||
        this.state.competition.competitionUniqueKey == '-1') &&
      personal.competitions != undefined &&
      personal.competitions.length > 0 &&
      this.props.userState.personalData != prevProps.userState.personalData
    ) {
      // let years = [];
      // let competitions = [];
      // (personal.competitions || []).map((item, index) => {
      //     let obj = {
      //         id: item.yearRefId
      //     }
      //     years.push(obj);
      // });
      const yearRefId = -1;
      this.setState({ yearRefId: -1 });
      if (personal.competitions != null && personal.competitions.length > 0 && yearRefId != null) {
        const { competitions } = personal;
        this.generateCompInfo(competitions, yearRefId);
        // this.setState({competitions: competitions, competition: this.getEmptyCompObj()});
        // this.tabApiCalls(this.state.tabKey, this.getEmptyCompObj(), this.state.userId);
      }
    }

    if (this.props.stripeState.onLoad === false && this.state.stripeDashBoardLoad === true) {
      this.setState({ stripeDashBoardLoad: false });
      const stripeDashboardUrl = this.props.stripeState.stripeLoginLink;
      if (stripeDashboardUrl) {
        window.open(stripeDashboardUrl, '_newtab');
      }
    }

    if (this.props.userState.onUpUpdateLoad == false && this.state.unlinkOnLoad == true) {
      const personal = this.props.userState.personalData;
      const organisationId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      const payload = {
        userId: this.state.userId, //personal.userId
        organisationId,
      };
      this.props.getUserModulePersonalByCompetitionAction(payload);
      this.setState({ unlinkOnLoad: false });
    }

    if (this.props.userState.onTeamUpdateLoad == false && this.state.removeTeamMemberLoad == true) {
      const record = this.state.registrationTeam;
      const page = 1;
      const payload = {
        userId: record.userId,
        teamId: record.teamId,
        competitionMembershipProductDivisionId: record.competitionMembershipProductDivisionId,
        teamMemberPaging: {
          limit: 10,
          offset: page ? 10 * (page - 1) : 0,
        },
      };
      this.props.getUserModuleTeamMembersAction(payload);
      this.setState({ removeTeamMemberLoad: false });
    }
    if (
      this.props.userState.cancelDeRegistrationLoad == false &&
      this.state.cancelDeRegistrationLoad == true
    ) {
      this.handleRegistrationTableList(
        1,
        this.state.userId,
        this.state.competition,
        this.state.yearRefId,
        'myRegistrations',
      );
      this.setState({ cancelDeRegistrationLoad: false });
    }
    if (prevProps.liveScoreDashboardState != this.props.liveScoreDashboardState) {
      if (
        this.props.liveScoreDashboardState.onRetryPaymentLoad == false &&
        this.state.instalmentRetryloading == true
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
              retryPaymentMethod,
            });
            return;
          }
        }
        this.setState({ instalmentRetryloading: false });
        this.handleRegistrationTableList(
          1,
          this.state.userId,
          this.state.competition,
          this.state.yearRefId,
          'myRegistrations',
        );
      }
      if (
        this.state.retryCashReceivedloading == true &&
        this.props.liveScoreDashboardState.onRetryPaymentLoad == false
      ) {
        if (this.props.liveScoreDashboardState.retryPaymentSuccess) {
          message.success(this.props.liveScoreDashboardState.retryPaymentMessage);
        }
        this.setState({ retryCashReceivedloading: false });
        this.handleRegistrationTableList(
          1,
          this.state.userId,
          this.state.competition,
          this.state.yearRefId,
          'myRegistrations',
        );
      }
    }
    if (prevProps.registrationDashboardState != this.props.registrationDashboardState) {
      if (
        this.props.registrationDashboardState.onRegRetryPaymentLoad == false &&
        this.state.regRetryloading == true
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
        this.setState({ regRetryloading: false });
        this.handleRegistrationTableList(
          1,
          this.state.userId,
          this.state.competition,
          this.state.yearRefId,
          'myRegistrations',
        );
      }
    }

    if (
      this.props.userState.cancelDeRegistrationLoad == false &&
      this.state.cancelTeamMemberDeRegistrationLoad == true
    ) {
      this.showTeamMembers(this.state.registrationTeam, 1);
      this.setState({ cancelTeamMemberDeRegistrationLoad: false });
    }

    if (
      userState.onTransferUserRegistrationLoad === false &&
      prevProps.userState.onTransferUserRegistrationLoad === true
    ) {
      this.handleRegistrationTableList(
        1,
        this.state.userId,
        this.state.competition,
        this.state.yearRefId,
        'myRegistrations',
      );
    }

    const scheduleArray = liveScoreUmpireState.umpireAvailabilitySchedule.map(item => {
      const utcDate = moment(item.startTime, moment.defaultFormat).toDate();
      return new Date(utcDate);
    });

    if (
      this.props.liveScoreUmpireState.umpireAvailabilitySchedule !=
      prevProps.liveScoreUmpireState.umpireAvailabilitySchedule
    ) {
      this.setState({ schedule: scheduleArray });
    }
  }

  handleColumns = () => {
    this.columnsPersonalAddress = [...columnsPersonalAddress];
    this.columnsPersonalPrimaryContacts = [...columnsPersonalPrimaryContacts];
    this.columnsPersonalChildContacts = [...columnsPersonalChildContacts];
    this.columnsPersonalEmergency = [...columnsPersonalEmergency];
    this.columnsDocuments = [...columnsDocuments];
    this.columns = [...columns];
    this.childOtherRegistrationColumns = [...childOtherRegistrationColumns];
    this.teamRegistrationColumns = [...teamRegistrationColumns];
    this.teamMembersColumns = [...teamMembersColumns];
    this.purchaseActivityColumn = [...purchaseActivityColumn];
    if (isReadOnlyRole()) {
      this.columnsPersonalAddress = this.columnsPersonalAddress.filter(col => col.key !== 'isUsed');
      this.columnsPersonalPrimaryContacts = this.columnsPersonalPrimaryContacts.filter(
        col => col.key !== 'isUser',
      );
      this.columnsPersonalChildContacts = this.columnsPersonalChildContacts.filter(
        col => col.key !== 'isUser',
      );
      this.columnsPersonalEmergency = this.columnsPersonalEmergency.filter(
        col => col.key !== 'isUser',
      );
      this.columnsDocuments = this.columnsDocuments.filter(col => col.key !== 'isUser');
      this.columns = this.columns.filter(col => col.key !== 'regForm');
      this.childOtherRegistrationColumns = this.childOtherRegistrationColumns.filter(
        col => col.key !== 'action',
      );
      this.teamRegistrationColumns = this.teamRegistrationColumns.filter(
        col => col.key !== 'status',
      );
      this.teamMembersColumns = this.teamMembersColumns.filter(col => col.key !== 'action');
      this.purchaseActivityColumn = this.purchaseActivityColumn.filter(
        col => col.key !== 'purchaseAction',
      );
    }
  };

  apiCalls = userId => {
    let organisationUniqueKey = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    const payload = {
      userId,
      organisationId: organisationUniqueKey,
    };
    if (organisationUniqueKey) {
      this.props.getOrganisationSettingsAction({ organisationUniqueKey });
    }

    this.props.getUserRole(userId);
    this.props.getUserModulePersonalDetailsAction(payload);
    this.props.getUserModulePersonalByCompetitionAction(payload);
    this.props.getUserModuleDocumentsAction(payload);

    const { startDate, endDate } = this.getStartEndWeekDates(this.state.scheduleStartDate);
    this.props.getUmpireAvailabilityAction(userId, startDate, endDate);
  };

  getOrganisationArray(data, roleId) {
    const orgArray = [];
    if (data.length > 0) {
      for (const i in data) {
        if ((data[i].roleId == roleId) == 19 ? 15 : roleId) {
          orgArray.push(data[i]);
          return orgArray;
        }
      }
    }
    return orgArray;
  }

  // getOrderStatus
  getOrderStatus = (value, state) => {
    let statusValue = '';
    const statusArr = this.props.shopOrderStatusState[state];
    const getIndexValue = statusArr.findIndex(x => x.id == value);
    if (getIndexValue > -1) {
      statusValue = statusArr[getIndexValue].description;
      return statusValue;
    }
    return statusValue;
  };

  cancelDeRegistrtaion = deRegisterId => {
    try {
      const payload = {
        deRegisterId,
      };
      this.props.cancelDeRegistrationAction(payload);
      this.setState({ cancelDeRegistrationLoad: true });
    } catch (ex) {
      console.log(`Error in cancelDeRegistrtaion::${ex}`);
    }
  };

  cancelTeamMemberDeRegistrtaion = deRegisterId => {
    try {
      const payload = {
        deRegisterId,
      };
      this.props.cancelDeRegistrationAction(payload);
      this.setState({ cancelTeamMemberDeRegistrationLoad: true });
    } catch (ex) {
      console.log(`Error in cancelTeamMemberDeRegistrtaion::${ex}`);
    }
  };

  parentUnLinkView = data => {
    //const { userState } = this.props;
    //const personal = userState.personalData;
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    const section =
      this.state.pendingParentRole === 'delete_link'
        ? 'delete_link'
        : this.state.pendingParentRole === UserRole.ParentRestricted
        ? 'restricted'
        : this.state.pendingParentRole === UserRole.ParentUnlinked
        ? 'unlink'
        : 'link';
    data.section = section;
    data.childUserId = this.state.userId; // personal.userId
    data.organisationId = organisationId;
    this.props.userProfileUpdateAction(data);
    this.setState({ unlinkOnLoad: true, pendingParentRole: null });
  };

  childUnLinkView = data => {
    //const { userState } = this.props;
    //const personal = userState.personalData;
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    const section =
      this.state.pendingChildRole === 'delete_link'
        ? 'delete_link'
        : this.state.pendingChildRole === UserRole.ParentRestricted
        ? 'restricted'
        : this.state.pendingChildRole === UserRole.ParentUnlinked
        ? 'unlink'
        : 'link';
    data.section = section;
    data.parentUserId = this.state.userId; // personal.userId
    data.organisationId = organisationId;
    this.props.userProfileUpdateAction(data);
    this.setState({ unlinkOnLoad: true, pendingChildRole: null });
  };

  removeTeamMemberView = data => {
    data.processType = data.isActive ? 'deactivate' : 'activate';
    this.props.teamMemberUpdateAction(data);
    this.setState({ removeTeamMemberLoad: true });
  };

  onChangeStatCompetitionChanged = value => {
    const { userState } = this.props;
    const personal = userState.personalData;

    if (value) {
      const statCompetition = personal.competitions.find(x => x.competitionUniqueKey === value);
      this.setState({ statCompetition });
      const competitionUniqueKey =
        statCompetition.competitionUniqueKey !== '-1' ? statCompetition.competitionUniqueKey : '';
      if (competitionUniqueKey) {
        this.props.getLiveScoreSettingInitiate(statCompetition.competitionId);
      }

      this.props.liveScoreGetSummaryScoringByUserAction({
        userId: this.state.userId,
        competitionUniqueKey,
        aggregate: AppConstants.match,
        sportRefId: SPORT[process.env.REACT_APP_FLAVOUR],
      });
      this.props.liveScoreGetSummaryScoringByUserAction({
        userId: this.state.userId,
        competitionUniqueKey,
        aggregate: AppConstants.career,
        sportRefId: SPORT[process.env.REACT_APP_FLAVOUR],
      });
    }
  };

  onChangeYear = value => {
    const { userState } = this.props;
    const personal = userState.personalData;
    let competitions = [];

    if (value != -1) {
      competitions = personal.competitions.filter(x => x.yearRefId === value);
      setGlobalYear(value);
    } else {
      competitions = personal.competitions;
    }

    this.generateCompInfo(competitions, value);
  };

  generateCompInfo = (competitions, yearRefId) => {
    const teams = [];
    const divisions = [];
    (competitions || []).forEach(item => {
      if (item.teams != null && item.teams.length > 0) {
        (item.teams || []).forEach(i => {
          const obj = {
            teamId: i.teamId,
            teamName: i.teamName,
          };
          if (i.teamId != null) {
            const alreadyExist = (teams || []).find(x => x.teamId == i.teamId);
            if (!alreadyExist) {
              teams.push(obj);
            }
          }
        });
      }

      if (item.divisions != null && item.divisions.length > 0) {
        (item.divisions || []).forEach(j => {
          const div = {
            divisionId: j.divisionId,
            divisionName: j.divisionName,
          };
          if (j.divisionId != null) {
            const divAlreadyExist = (divisions || []).find(x => x.divisionId == j.divisionId);
            if (!divAlreadyExist) {
              divisions.push(div);
            }
          }
        });
      }
    });

    let competition = this.getEmptyCompObj();
    if (competitions != null && competitions.length > 0) {
      competition = this.getEmptyCompObj();
    }

    this.setState({
      competitions,
      competition,
      yearRefId,
      teams,
      divisions,
    });

    this.tabApiCalls(this.state.tabKey, competition, this.state.userId, yearRefId);
  };

  getEmptyCompObj = () => {
    const competition = {
      team: { teamId: 0, teamName: '' },
      divisionName: '',
      competitionUniqueKey: '-1',
      competitionName: 'All',
      year: 0,
    };

    return competition;
  };

  onChangeSetValue = value => {
    const { userState } = this.props;
    const personal = userState.personalData;
    if (value != -1) {
      const teams = [];
      const divisions = [];

      const competition = personal.competitions.find(x => x.competitionUniqueKey === value);

      if (competition.teams != null && competition.teams.length > 0) {
        (competition.teams || []).forEach(i => {
          const obj = {
            teamId: i.teamId,
            teamName: i.teamName,
          };
          if (i.teamId != null) {
            const alreadyExist = (teams || []).find(x => x.teamId == i.teamId);
            if (!alreadyExist) {
              teams.push(obj);
            }
          }
        });
      }

      if (competition.divisions != null && competition.divisions.length > 0) {
        (competition.divisions || []).forEach(j => {
          const div = {
            divisionId: j.divisionId,
            divisionName: j.divisionName,
          };
          if (j.divisionId != null) {
            const divAlreadyExist = (divisions || []).find(x => x.divisionId == j.divisionId);
            if (!divAlreadyExist) {
              divisions.push(div);
            }
          }
        });
      }

      this.setState({
        competition,
        divisions,
        teams,
      });
      this.tabApiCalls(this.state.tabKey, competition, this.state.userId, this.state.yearRefId);
    } else {
      this.generateCompInfo(personal.competitions, this.state.yearRefId);
    }
  };

  onChangeTab = key => {
    this.setState({ tabKey: key, isRegistrationForm: false, isShowRegistrationTeamMembers: false });
    this.tabApiCalls(key, this.state.competition, this.state.userId, this.state.yearRefId);
  };

  tabApiCalls = (tabKey, competition, userId, yearRefId) => {
    let payload = {
      userId,
      competitionId: competition.competitionUniqueKey,
      yearRefId,
    };
    switch (tabKey) {
      case '1':
        this.handleActivityTableList(1, userId, competition, 'player', yearRefId);
        // this.handleActivityTableList(1, userId, competition, "parent", yearRefId);
        this.handleActivityTableList(1, userId, competition, 'scorer', yearRefId);
        this.handleActivityTableList(1, userId, competition, 'manager', yearRefId);
        this.handleActivityTableList(1, userId, competition, 'umpire', yearRefId);
        this.handleActivityTableList(1, userId, competition, 'umpireCoach', yearRefId);
        break;
      case '2': {
        const competitionUniqueKey =
          competition.competitionUniqueKey !== '-1' ? competition.competitionUniqueKey : '';
        this.props.liveScoreGetSummaryScoringByUserAction({
          userId,
          competitionUniqueKey,
          aggregate: AppConstants.match,
          sportRefId: SPORT[process.env.REACT_APP_FLAVOUR],
        });
        this.props.liveScoreGetSummaryScoringByUserAction({
          userId,
          competitionUniqueKey,
          aggregate: AppConstants.career,
          sportRefId: SPORT[process.env.REACT_APP_FLAVOUR],
        });
        break;
      }
      case '3':
        this.props.getUserModulePersonalByCompetitionAction(payload);
        break;
      case '4':
        this.props.getUserModuleMedicalInfoAction(payload);
        break;
      case '5':
        this.handleRegistrationTableList(1, userId, competition, yearRefId);
        // this.handleTeamRegistrationTableList(1, userId, competition, yearRefId);
        // this.handleOtherRegistrationTableList(1, userId, competition, yearRefId);
        break;
      case '6':
        this.handleHistoryTableList(1, userId);
        break;
      case '7':
        /*this.handleIncidentableList(1, userId, competition, yearRefId);
        this.handleSuspendedMatchesTableList(1, userId, competition);
        if (!this.isNetball) {
          this.handleSuspensionTableList(1);
          this.handleTribunalsTableList(1);
        }*/
        break;
      case '8':
        payload = {
          paging: {
            limit: 10,
            offset: 0,
          },
        };
        this.props.getUmpireActivityListAction(
          payload,
          JSON.stringify([15]),
          userId,
          this.state.UmpireActivityListSortBy,
          this.state.UmpireActivityListSortOrder,
        );
        break;
      case '10':
        this.handlePurchasetableList(1, userId, competition, yearRefId);
        break;
    }
  };

  handlePurchasetableList = (page, userId) => {
    const params = {
      limit: 10,
      offset: page ? 10 * (page - 1) : 0,
      order: '',
      sorterBy: '',
      userId,
    };
    this.props.getPurchasesListingAction(params);
  };

  handleActivityTableList = (page, userId, competition, key, yearRefId) => {
    const filter = {
      competitionId: competition.competitionUniqueKey,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      userId: userId || this.state.userId,
      yearRefId,
      paging: {
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      },
    };
    if (key === 'player') this.props.getUserModuleActivityPlayerAction(filter);
    if (key === 'parent') this.props.getUserModuleActivityParentAction(filter);
    if (key === 'manager') this.props.getUserModuleActivityManagerAction(filter);
    if (key === 'scorer') this.props.getScorerData(filter, 4, 'ENDED');
    if (key === 'umpire') this.props.getUmpireData(filter, 15, 'ENDED');
    if (key === 'umpireCoach') this.props.getCoachData(filter, 20, 'ENDED');
  };

  handleRegistrationTableList = (page, userId, competition, yearRefId, key) => {
    if (key === 'myRegistrations') {
      this.setState({ myRegCurrentPage: page });
    } else if (key === 'otherRegistrations') {
      this.setState({ otherRegCurrentPage: page });
    } else if (key === 'teamRegistrations') {
      this.setState({ teamRegCurrentPage: page });
    } else if (key === 'childRegistrations') {
      this.setState({ childRegCurrentPage: page });
    }
    setTimeout(() => {
      const filter = {
        competitionId: competition.competitionUniqueKey,
        userId,
        organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
        yearRefId,
        myRegPaging: {
          limit: 10,
          offset: this.state.myRegCurrentPage ? 10 * (this.state.myRegCurrentPage - 1) : 0,
        },
        otherRegPaging: {
          limit: 10,
          offset: this.state.otherRegCurrentPage ? 10 * (this.state.otherRegCurrentPage - 1) : 0,
        },
        teamRegPaging: {
          limit: 10,
          offset: this.state.teamRegCurrentPage ? 10 * (this.state.teamRegCurrentPage - 1) : 0,
        },
        childRegPaging: {
          limit: 10,
          offset: this.state.childRegCurrentPage ? 10 * (this.state.childRegCurrentPage - 1) : 0,
        },
      };
      this.props.getUserModuleRegistrationAction(filter);
    }, 300);
  };

  showTeamMembers = (record, page) => {
    try {
      this.setState({ isShowRegistrationTeamMembers: true, registrationTeam: record });
      const payload = {
        userId: record.userId,
        teamId: record.teamId,
        competitionMembershipProductDivisionId: record.competitionMembershipProductDivisionId,
        teamMemberPaging: {
          limit: 10,
          offset: page ? 10 * (page - 1) : 0,
        },
      };
      this.props.getUserModuleTeamMembersAction(payload);
    } catch (ex) {
      console.log(`Error in showTeamMember::${ex}`);
    }
  };

  handleTeamRegistrationTableList = (page, userId, competition, yearRefId) => {
    const filter = {
      competitionId: competition.competitionUniqueKey,
      userId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId,
      paging: {
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      },
    };
    this.props.getUserModuleTeamRegistrationAction(filter);
  };

  handleOtherRegistrationTableList = (page, userId, competition, yearRefId) => {
    const filter = {
      competitionId: competition.competitionUniqueKey,
      userId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId,
      paging: {
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      },
    };
    this.props.getUserModuleOtherRegistrationAction(filter);
  };

  handleHistoryTableList = (page, userId) => {
    const filter = {
      userId,
      paging: {
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      },
    };
    this.props.getUserHistoryAction(filter);
  };

  /// /pagination handling for umpire activity table list
  handleUmpireActivityTableList = (page, userId) => {
    const offset = page ? 10 * (page - 1) : 0;
    this.setState({ umpireActivityOffset: offset });
    const payload = {
      paging: {
        limit: 10,
        offset,
      },
    };
    this.props.getUmpireActivityListAction(
      payload,
      JSON.stringify([15]),
      userId,
      this.state.UmpireActivityListSortBy,
      this.state.UmpireActivityListSortOrder,
    );
  };

  viewRegForm = async item => {
    await this.setState({
      isRegistrationForm: true,
      registrationForm: item.registrationForm,
    });
  };

  retryPayment = record => {
    try {
      const paidByUserId = isArrayNotEmpty(record.paidByUsers)
        ? record.paidByUsers[0].paidByUserId
        : null;
      if (record.invoiceFailedStatus) {
        const payload = {
          registrationId: record.registrationId,
          paidByUserId: paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.registrationRetryPaymentAction(payload);
        this.setState({ regRetryloading: true, regRetryRecord: record });
      } else if (record.transactionFailedStatus) {
        const payload = {
          processTypeName: 'instalment',
          registrationUniqueKey: record.registrationId,
          userId: record.userId,
          divisionId: record.competitionMembershipProductDivisionId,
          competitionId: record.competitionId,
          paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.liveScorePlayersToPayRetryPaymentAction(payload);
        this.setState({ instalmentRetryloading: true, instalmentRetryRecord: record });
      }
    } catch (ex) {
      console.log(`Error in retryPayment::${ex}`);
    }
  };

  myRegistrationRetryPayment = record => {
    try {
      const paidByUserId = isArrayNotEmpty(record.paidByUsers)
        ? record.paidByUsers[0].paidByUserId
        : null;
      if (record.paymentStatusFlag == 2) {
        const payload = {
          registrationId: record.registrationId,
          paidByUserId: paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.registrationRetryPaymentAction(payload);
        this.setState({ regRetryloading: true, regRetryRecord: record });
      } else if (record.paymentStatus == 'Failed Registration') {
        const payload = {
          processTypeName: 'instalment',
          registrationUniqueKey: record.registrationId,
          userId: record.userId,
          divisionId: record.competitionMembershipProductDivisionId,
          competitionId: record.competitionId,
          paidByUserId,
          checkCardAvailability: 0,
        };
        this.props.liveScorePlayersToPayRetryPaymentAction(payload);
        this.setState({ instalmentRetryloading: true, instalmentRetryRecord: record });
      }
    } catch (ex) {
      console.log(`Error in myRegistrationRetryPayment::${ex}`);
    }
  };

  cashReceivedForRetry = (record, isOnBehalfFailed) => {
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    let payload = {
      registrationUniqueKey: record.registrationId,
      competitionId: record.competitionId,
      userId: record.userId,
      divisionId: record.competitionMembershipProductDivisionId,
      processTypeName: isOnBehalfFailed == 1 ? 'ONBEHALFOF' : 'REGISTRATION',
      organisationId: organisationId,
      membershipProductMappingId: record.membershipMappingId,
    };
    this.props.liveScorePlayersToCashReceivedAction(payload);
    this.setState({ retryCashReceivedloading: true });
  };

  headerView = () => (
    <Header className="comp-player-grades-header-view container mb-n3">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.personalDetails}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  suspensionSView = () => {
    const {
      userState: {
        personalData: { suspensions },
      },
    } = this.props;

    if (Array.isArray(suspensions)) {
      return (
        <>
          {suspensions.map(suspension => {
            let message = '';
            if (suspension.suspendedTo && suspension.suspendedFrom) {
              message += `${AppConstants.suspendedFrom} ${liveScore_formateDate(
                suspension.suspendedFrom,
              )} ${AppConstants.to_lowercase} ${liveScore_formateDate(suspension.suspendedTo)}`;
            } else if (suspension.suspendedMatches && suspension.suspendedFrom) {
              message += `${AppConstants.suspendedFor} #${suspension.matchesLeft} ${AppConstants.matchesSuspended} ${AppConstants.in} ${suspension.incident?.competition?.name}`;
            }

            return (
              <div key={suspension.id} className="desc-text-style side-bar-profile-data">
                {message}
              </div>
            );
          })}
        </>
      );
    }
    return null;
  };

  selectImage() {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      fileInput.click();
    }
  }

  setImage = (data, key) => {
    const userState = this.props.userState;
    const { userId } = userState.personalData;
    const { personalByCompData } = userState;

    const file = data.files[0];

    const isUserChild =
      !!personalByCompData.length && !!personalByCompData[0].childContacts.length ? false : true;

    if (file) {
      const formData = new FormData();
      formData.append('profile_photo', file);
      isUserChild
        ? this.props.userPhotoUpdateAction(formData, userId)
        : this.props.userPhotoUpdateAction(formData);
    }
  };

  leftHandSideView = () => {
    const { userState } = this.props;
    const personal = userState.personalData;
    const compititionId =
      this.state.competition != null ? this.state.competition.competitionUniqueKey : null;

    return (
      <div className="fluid-width mt-2">
        <div className="profile-image-view mr-5" style={{ marginTop: 20 }}>
          {isAdminRole() ? (
            <div
              className={`${!this.state.isTablet ? 'align-self-center' : ''} circular--landscape`}
              role="button"
            >
              {personal.photoUrl && !this.props.userState.userPhotoUpdate ? (
                <img src={personal.photoUrl} alt="" onClick={() => this.selectImage()} />
              ) : personal.photoUrl && !!this.props.userState.userPhotoUpdate ? (
                <div style={{ fontSize: '1rem' }}>{AppConstants.loading}</div>
              ) : (
                <div className="img-upload-target" onClick={() => this.selectImage()}>
                  <div className="img-upload-target-plus">+</div>
                  <div style={{ marginTop: '-7px', fontSize: '1rem' }}>{AppConstants.addPhoto}</div>
                </div>
              )}
              <input
                type="file"
                id={'user-pic'}
                style={{ display: 'none' }}
                onChange={evt => this.setImage(evt.target)}
              />
            </div>
          ) : (
            <div className="circular--landscape">
              {personal.photoUrl ? (
                <img src={personal.photoUrl} alt="" />
              ) : (
                <span className="user-contact-heading">{AppConstants.noImage}</span>
              )}
            </div>
          )}
          <span className="user-contact-heading">
            {`${personal.firstName} ${personal.lastName}`}
          </span>
          <span className="year-select-heading pt-0">
            {`#${this.state.userId}`}
            {/* {`#${personal.userId}`}  */}
          </span>
        </div>

        <div className="profile-img-view-style">
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.calendar} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.dateOfBirth}</span>
            </div>
            <span className="desc-text-style side-bar-profile-data">
              {liveScore_formateDate(personal.dateOfBirth) === 'Invalid date'
                ? ''
                : liveScore_formateDate(personal.dateOfBirth)}
            </span>
          </div>
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.callAnswer} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.contactNumber}</span>
            </div>
            <span className="desc-text-style side-bar-profile-data">{personal.mobileNumber}</span>
          </div>
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.circleOutline} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.competition}</span>
            </div>
            <Select
              name="yearRefId"
              className="user-prof-filter-select w-100"
              style={{ paddingRight: 1, paddingTop: 15 }}
              onChange={yearRefId => this.onChangeYear(yearRefId)}
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
            <Select
              className="user-prof-filter-select w-100"
              style={{ paddingRight: 1, paddingTop: 15 }}
              onChange={e => this.onChangeSetValue(e)}
              value={compititionId}
            >
              <Option key="-1" value="-1">
                {AppConstants.all}
              </Option>
              {(this.state.competitions || []).map(comp => (
                <Option
                  key={`competition_${comp.competitionUniqueKey}`}
                  value={comp.competitionUniqueKey}
                >
                  {comp.competitionName}
                </Option>
              ))}
            </Select>
          </div>

          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.circleOutline} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.suspension}</span>
            </div>
            {this.suspensionSView()}
          </div>

          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.group} height="16" width="16" alt="" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.team}</span>
            </div>
            {((this.state.teams != null && this.state.teams) || []).map(item => (
              <div key={item.teamId} className="desc-text-style side-bar-profile-data">
                {item.teamName}
              </div>
            ))}
          </div>
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.circleOutline} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.division}</span>
            </div>
            {((this.state.divisions != null && this.state.divisions) || []).map(item => (
              <div key={item.divisionId} className="desc-text-style side-bar-profile-data">
                {item.divisionName}
              </div>
            ))}
            {/* <span className="desc-text-style side-bar-profile-data">{this.state.competition!= null ? this.state.competition.divisionName : null}</span> */}
          </div>
          {/* Umpire Accrediation */}
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.whistleIcon} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.umpireAccreditation}</span>
              <div className="col-sm d-flex justify-content-end">
                <span className="year-select-heading  ml-3">{AppConstants.expiry}</span>
              </div>
            </div>
            <div className="live-score-title-icon-view ml-5">
              <span className="desc-text-style  side-bar-profile-data">
                {personal.umpireAccreditationLevel}
              </span>

              <div className="col-sm d-flex justify-content-end">
                <span className="desc-text-style  side-bar-profile-data">
                  {personal.accreditationUmpireExpiryDate &&
                    moment(personal.accreditationUmpireExpiryDate).format('DD-MM-YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Coach Accrediation */}
          <div className="live-score-side-desc-view">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.whistleIcon} alt="" height="16" width="16" />
              </div>
              <span className="year-select-heading ml-3">{AppConstants.coachAccreditation}</span>
              <div className="col-sm d-flex justify-content-end">
                <span className="year-select-heading  ml-3">{AppConstants.expiry}</span>
              </div>
            </div>
            <div className="live-score-title-icon-view ml-5">
              <span className="desc-text-style  side-bar-profile-data">
                {personal.coachAccreditationLevel}
              </span>

              <div className="col-sm d-flex justify-content-end">
                <span className="desc-text-style  side-bar-profile-data">
                  {personal.accreditationCoachExpiryDate &&
                    moment(personal.accreditationCoachExpiryDate).format('DD-MM-YYYY')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  playerActivityView = () => {
    const { userState } = this.props;
    const { activityPlayerList } = userState;
    const total = userState.activityPlayerTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.playerHeading}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsPlayer}
            dataSource={activityPlayerList}
            pagination={false}
            loading={userState.activityPlayerOnLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end ">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.activityPlayerPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'player',
                this.state.yearRefId,
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  parentActivityView = () => {
    const { userState } = this.props;
    const { activityParentList } = userState;
    const total = userState.activityParentTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.parentHeading}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsParent}
            dataSource={activityParentList}
            pagination={false}
            loading={userState.activityParentOnLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.activityParentPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'parent',
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  scorerActivityView = () => {
    const { userState } = this.props;
    const activityScorerList = userState.scorerActivityRoster;
    const total = userState.scorerTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.scorerHeading}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsScorer}
            dataSource={activityScorerList}
            pagination={false}
            loading={userState.activityScorerOnLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.scorerCurrentPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'scorer',
                this.state.yearRefId,
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  managerActivityView = () => {
    const { userState } = this.props;
    const { activityManagerList } = userState;
    const total = userState.activityScorerTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.managerHeading}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsManager}
            dataSource={activityManagerList}
            pagination={false}
            loading={userState.activityManagerOnLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.activityManagerPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'manager',
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  onChangeHideStatistics = event => {
    const value = event.target.checked;
    const {
      personalData: { userId },
    } = this.props.userState;
    this.props.userProfileUpdateHideStatisticsAction({
      section: AppConstants.statistics.toLowerCase(),
      isHidden: value,
      userId,
    });
  };

  statisticsView = () => {
    const { personalData: { isHidden = false } = {} } = this.props.userState;
    const { matchStats, careerStats, onLoadMatch, onLoadCareer } = this.props.userState;
    const recordOffenceCodes = this.state.statCompetition
      ? this.props.liveScoreSetting?.form?.foulsSettings?.recordOffenceCodes
      : false;
    return (
      <>
        <div className="row mb-4">
          <div className="col-sm">
            <Checkbox checked={isHidden} onChange={this.onChangeHideStatistics}>
              {AppConstants.hideStatisticsFromPublic}
            </Checkbox>
          </div>
        </div>
        {isFootball && (
          <div>
            <div className="live-score-title-icon-view" style={{ marginTop: 30 }}>
              <span className="year-select-heading">{AppConstants.competition}</span>
            </div>
            <Select
              name="yearRefId"
              className="user-prof-filter-select"
              style={{ paddingRight: 1, minWidth: '200px' }}
              onChange={comUniqKey => this.onChangeStatCompetitionChanged(comUniqKey)}
              value={
                this.state.statCompetition ? this.state.statCompetition.competitionUniqueKey : ''
              }
            >
              {this.props.userState.personalData?.competitions?.map(item => (
                <Option key={`stat_${item.competitionUniqueKey}`} value={item.competitionUniqueKey}>
                  {item.competitionName}
                </Option>
              ))}
            </Select>
          </div>
        )}
        <LiveScorePersonalStatistics
          showMatchLog={true}
          showDetailedSendOffs={recordOffenceCodes}
          competitionId={null}
          showDescription={false}
          multiComp={true}
        />
      </>
    );
  };

  personalView = () => {
    const { userState } = this.props;
    const personal = userState.personalData;
    const personalByCompData = userState.personalByCompData || [];

    const primaryContacts =
      personalByCompData.length > 0 ? personalByCompData[0].primaryContacts : [];
    const childContacts = personalByCompData.length > 0 ? personalByCompData[0].childContacts : [];
    const documents = userState.documents.length > 0 ? userState.documents : [];
    let countryName = '';
    // let nationalityName = "";
    // let languages = "";
    let childrenCheckNumber = '';
    let childrenCheckExpiryDate = '';
    let userRegId = null;
    if (personalByCompData != null && personalByCompData.length > 0) {
      countryName = personalByCompData[0].countryName;
      // nationalityName = personalByCompData[0].nationalityName;
      // languages = personalByCompData[0].languages;
      userRegId = personalByCompData[0].userRegistrationId;
      childrenCheckNumber = personalByCompData[0].childrenCheckNumber;
      childrenCheckExpiryDate = personalByCompData[0].childrenCheckExpiryDate;
    }
    return (
      <div className="comp-dash-table-view pt-0">
        <div className=" user-module-row-heading d-flex align-items-center mb-0">
          {AppConstants.address}
        </div>
        {/* <div className="col-sm justify-content-end d-flex align-items-center">
                        <NavLink to={{ pathname: `https://netball-registration-dev.worldsportaction.com/` }} target="_blank">
                            <Button type="primary">
                                {AppConstants.yourProfile}
                            </Button>
                        </NavLink>
                    </div> */}

        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.columnsPersonalAddress}
            dataSource={personalByCompData}
            pagination={false}
            loading={userState.onPersonLoad && true}
          />
        </div>
        {/* {primaryContacts != null && primaryContacts.length > 0 && ( */}
        <div>
          <div className="user-module-row-heading" style={{ marginTop: 30 }}>
            {AppConstants.parentOrGuardianDetail}
          </div>
          {!isReadOnlyRole() ? (
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { moduleFrom: '8', userData: personal },
              }}
            >
              <span
                className="input-heading-add-another"
                style={{ paddingTop: 'unset', marginBottom: '15px' }}
              >
                {`+ ${AppConstants.addParent_guardian}`}
              </span>
            </NavLink>
          ) : null}

          <div className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={this.columnsPersonalPrimaryContacts}
              dataSource={primaryContacts}
              pagination={false}
              loading={userState.onPersonLoad && true}
            />
          </div>
        </div>
        {/* )} */}
        {/* {(!personal.dateOfBirth || getAge(personal.dateOfBirth) > 18) && ( */}
        <div>
          <div className="user-module-row-heading" style={{ marginTop: 30 }}>
            {AppConstants.childDetails}
          </div>
          {!isReadOnlyRole() ? (
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { moduleFrom: '7', userData: personal },
              }}
            >
              <span
                className="input-heading-add-another"
                style={{ paddingTop: 'unset', marginBottom: '15px' }}
              >
                {`+ ${AppConstants.addChild}`}
              </span>
            </NavLink>
          ) : null}

          <div className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={this.columnsPersonalChildContacts}
              dataSource={childContacts}
              pagination={false}
              loading={userState.onPersonLoad && true}
            />
          </div>
        </div>
        {/* )} */}
        <div className="user-module-row-heading" style={{ marginTop: 30 }}>
          {AppConstants.emergencyContacts}
        </div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.columnsPersonalEmergency}
            dataSource={userState.personalEmergency}
            pagination={false}
            loading={userState.onPersonLoad && true}
          />
        </div>
        <div className="row">
          <div className="col-sm user-module-row-heading" style={{ marginTop: 30 }}>
            {AppConstants.otherInformation}
          </div>
          {!isReadOnlyRole() ? (
            <div className="col-sm" style={{ marginTop: 7, marginRight: 15 }}>
              <div className="comp-buttons-view">
                <NavLink
                  to={{
                    pathname: `/userProfileEdit`,
                    state: {
                      userData: personalByCompData[0],
                      moduleFrom: '4',
                      personalData: personal,
                    },
                  }}
                >
                  <Button className="other-info-edit-btn" type="primary">
                    {AppConstants.edit}
                  </Button>
                </NavLink>
              </div>
            </div>
          ) : null}
        </div>
        <div className="table-responsive home-dash-table-view">
          <div
            style={{
              marginTop: 7,
              marginRight: 15,
              marginBottom: 15,
            }}
          >
            <div className="other-info-row" style={{ paddingTop: 10 }}>
              <div className="year-select-heading other-info-label">{AppConstants.gender}</div>
              <div className="desc-text-style side-bar-profile-data other-info-font">
                {personalByCompData != null && personalByCompData.length > 0
                  ? personalByCompData[0].gender
                  : null}
              </div>
            </div>
            {this.isBasketball && (
              <div className="other-info-row">
                <div className="year-select-heading other-info-label">
                  {AppConstants.nationalityReference}
                </div>
                <div className="other-info-text other-info-font">
                  {personalByCompData != null && personalByCompData.length > 0
                    ? personalByCompData[0].nationality
                    : null}
                </div>
              </div>
            )}
            {this.isNetball && (
              <>
                <div className="other-info-row">
                  <div className="year-select-heading other-info-label">
                    {AppConstants.languages}
                  </div>
                  <div className="desc-text-style side-bar-profile-data other-info-font">
                    {personalByCompData != null && personalByCompData.length > 0
                      ? personalByCompData[0].languageRef
                      : null}
                  </div>
                </div>

                <div className="other-info-row">
                  <div className="year-select-heading other-info-label">{AppConstants.culture}</div>
                  <div className="desc-text-style side-bar-profile-data other-info-font">
                    {personalByCompData != null && personalByCompData.length > 0
                      ? personalByCompData[0].culture
                      : null}
                  </div>
                </div>

                <div className="other-info-row">
                  <div className="year-select-heading other-info-label">
                    {AppConstants.occupation}
                  </div>
                  <div className="desc-text-style side-bar-profile-data other-info-font">
                    {personalByCompData != null && personalByCompData.length > 0
                      ? personalByCompData[0].occupation
                      : null}
                  </div>
                </div>
              </>
            )}
            {userRegId != null && (
              <div>
                <div className="other-info-row">
                  <div className="year-select-heading other-info-label">
                    {AppConstants.countryOfBirth}
                  </div>
                  <div className="desc-text-style side-bar-profile-data other-info-font">
                    {countryName}
                  </div>
                </div>
                {/* <div className="other-info-row">
                                    <div className="year-select-heading other-info-label">
                                        {AppConstants.nationalityReference}
                                    </div>
                                    <div className="desc-text-style side-bar-profile-data other-info-font">
                                        {nationalityName}
                                    </div>
                                </div>
                                <div className="other-info-row">
                                    <div className="year-select-heading other-info-label">
                                        {AppConstants.childLangSpoken}
                                    </div>
                                    <div className="desc-text-style side-bar-profile-data other-info-font">
                                        {languages}
                                    </div>
                                </div> */}
              </div>
            )}
            <div className="other-info-row">
              <div className="year-select-heading other-info-label">
                {AppConstants.childrenNumber}
              </div>
              <div className="desc-text-style side-bar-profile-data other-info-font">
                {childrenCheckNumber}
              </div>
            </div>
            <div className="other-info-row">
              <div className="year-select-heading other-info-label" style={{ paddingBottom: 20 }}>
                {AppConstants.checkExpiryDate}
              </div>
              <div className="desc-text-style side-bar-profile-data other-info-font">
                {childrenCheckExpiryDate != null
                  ? moment(childrenCheckExpiryDate).format('DD/MM/YYYY')
                  : ''}
              </div>
            </div>
            {/* <div className="other-info-row">
                            <div className="year-select-heading other-info-label" style={{ paddingBottom: 20 }}>{AppConstants.disability}</div>
                            <div className="desc-text-style side-bar-profile-data other-info-font">{personal.isDisability == 0 ? "No" : "Yes"}</div>
                        </div> */}
          </div>
        </div>

        <CommunicationsAndPrivacyView userId={this.state.userId} isReadOnlyRole={isReadOnlyRole} />

        {/* Upload Documents */}
        <div>
          <div className="user-module-row-heading" style={{ marginTop: 30 }}>
            {AppConstants.documents}
          </div>
          {!isReadOnlyRole() ? (
            <NavLink
              to={{
                pathname: `/userProfileEdit`,
                state: { moduleFrom: '9', userData: personal },
              }}
            >
              <span
                className="input-heading-add-another"
                style={{ paddingTop: 'unset', marginBottom: '15px' }}
              >
                {`+ ${AppConstants.addDocument}`}
              </span>
            </NavLink>
          ) : null}

          <div className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={this.columnsDocuments}
              dataSource={documents}
              pagination={false}
              loading={userState.isDocumentLoading && true}
            />
          </div>
        </div>
      </div>
    );
  };

  medicalView = () => {
    const { userState } = this.props;
    const medical = userState.medicalData;
    // let medical = [];
    // if(medData != null && medData.length > 0){
    //     medData[0]["userId"] = this.state.userId;
    //     medical = medData;
    // }

    return (
      <div>
        {(medical || []).map((item, index) => (
          <div key={item.userRegistrationId} className="table-responsive home-dash-table-view">
            <div className="col-sm" style={{ marginTop: 7, marginRight: 15 }}>
              {!isReadOnlyRole() ? (
                <div className="comp-buttons-view">
                  <NavLink
                    to={{
                      pathname: `/userProfileEdit`,
                      state: { userData: item, moduleFrom: '5' },
                    }}
                  >
                    <Button className="other-info-edit-btn" type="primary">
                      {AppConstants.edit}
                    </Button>
                  </NavLink>
                </div>
              ) : null}
            </div>
            <div className="d-flex" style={{ marginBottom: '1%' }}>
              <div className="year-select-heading other-info-label col-sm-2">
                {AppConstants.existingMedConditions}
              </div>
              <div
                className="desc-text-style side-bar-profile-data other-info-font"
                style={{ textAlign: 'left' }}
              >
                {item.existingMedicalCondition}
              </div>
            </div>
            <div className="d-flex">
              <div className="year-select-heading other-info-label col-sm-2">
                {AppConstants.regularMedicalConditions}
              </div>
              <div
                className="desc-text-style side-bar-profile-data other-info-font"
                style={{ textAlign: 'left' }}
              >
                {item.regularMedication}
              </div>
            </div>
            <div className="d-flex" style={{ marginBottom: '3%' }}>
              <div className="year-select-heading other-info-label col-sm-2">
                {AppConstants.disability}
              </div>
              <div
                className="desc-text-style side-bar-profile-data other-info-font"
                style={{ textAlign: 'left' }}
              >
                {item.isDisability}
              </div>
            </div>
            {item.isDisability === 'Yes' && (
              <div className="comp-dash-table-view mt-2 pl-0">
                <div className="table-responsive home-dash-table-view">
                  <Table
                    className="home-dashboard-table"
                    columns={columnsMedical}
                    dataSource={item.disability}
                    pagination={false}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  gotoAddTeamMember = registrationTeam => {
    history.push('/addTeamMember', { registrationTeam });
  };

  handlePlayerMembershipTierChange = (e, user) => {
    if (user) {
      user.playerMembershipTierRefId = e;
      this.updateRegistrationSetting(user);
    }
  };
  handleNumberOfOrganisationsChange = (e, user) => {
    if (user) {
      user.concurrentNumberOfOrganisations = e;
      this.updateRegistrationSetting(user);
    }
  };
  handleNumberOfRegistrationsChange = (e, user) => {
    if (user) {
      user.concurrentNumberOfRegistrations = e;
      this.updateRegistrationSetting(user);
    }
  };
  updateRegistrationSetting = user => {
    let payload = {
      section: 'registrationSetting',
      userId: user.userId,
      playerMembershipTierRefId: user.playerMembershipTierRefId,
      concurrentNumberOfOrganisations: user.concurrentNumberOfOrganisations,
      concurrentNumberOfRegistrations: user.concurrentNumberOfRegistrations,
    };
    this.props.userProfileUpdateAction(payload);
    this.setState({ updateUI: true });
  };

  triggerSwitchUserProfileModal = (record, type) => {
    const showModalValue = !this.state.showUserTypeChangeModal;
    if (record && type !== null && type !== undefined) {
      if (type === 'primary') {
        this.setState({
          swapUserRecord: {
            childUserId: record.childUserId,
            masterUserId: record.userId,
            userRoleEntityId: record.userRoleEntityId,
          },
          showUserTypeChangeModal: showModalValue,
        });
      } else if (type === 'secondary') {
        this.setState({
          swapUserRecord: {
            childUserId: record.userId,
            masterUserId: record.parentUserId,
            userRoleEntityId: record.userRoleEntityId,
          },
          showUserTypeChangeModal: showModalValue,
        });
      }
    } else {
      this.setState({ showUserTypeChangeModal: showModalValue });
    }
  };

  registrationView = () => {
    const { userState } = this.props;
    const { userRegistrationList, onTransferUserRegistrationLoad } = userState;

    const myRegistrations = userRegistrationList?.myRegistrations.registrationDetails
      ? userRegistrationList?.myRegistrations.registrationDetails
      : [];
    const myRegistrationsCurrentPage = userRegistrationList?.myRegistrations.page
      ? userRegistrationList?.myRegistrations.page.currentPage
      : 1;
    const myRegistrationsTotalCount = userRegistrationList?.myRegistrations.page.totalCount;
    const otherRegistrations = userRegistrationList?.otherRegistrations.registrationYourDetails
      ? userRegistrationList?.otherRegistrations.registrationYourDetails
      : [];
    const otherRegistrationsCurrentPage = userRegistrationList?.otherRegistrations.page
      ? userRegistrationList?.otherRegistrations.page.currentPage
      : 1;
    const otherRegistrationsTotalCount = userRegistrationList?.otherRegistrations.page.totalCount;
    const teamRegistrations = userRegistrationList?.teamRegistrations.registrationTeamDetails
      ? userRegistrationList?.teamRegistrations.registrationTeamDetails
      : [];
    const teamRegistrationsCurrentPage = userRegistrationList?.teamRegistrations.page
      ? userRegistrationList?.teamRegistrations.page.currentPage
      : 1;
    const teamRegistrationsTotalCount = userRegistrationList?.teamRegistrations.page.totalCount;
    const childRegistrations = userRegistrationList?.childRegistrations.childRegistrationDetails
      ? userRegistrationList?.childRegistrations.childRegistrationDetails
      : [];
    const childRegistrationsCurrentPage = userRegistrationList?.childRegistrations.page
      ? userRegistrationList?.childRegistrations.page.currentPage
      : 1;
    const childRegistrationsTotalCount = userRegistrationList?.childRegistrations.page.totalCount;
    const teamMembers = userState.teamMembersDetails
      ? userState.teamMembersDetails.teamMembers
      : [];
    const teamMembersCurrentPage = userState.teamMembersDetails?.page
      ? userState.teamMembersDetails?.page.currentPage
      : 1;
    const teamMembersTotalCount = userState.teamMembersDetails?.page.totalCount;
    let organisation = getOrganisationData();
    const organistaionId = organisation ? organisation.organisationUniqueKey : null;
    const { userRegistrationOnLoad, cancelDeRegistrationLoad, userOwnRegistrationOnLoad } =
      this.props.userState;
    const personalByCompData = userState.personalByCompData || [];
    let userDetail = null;
    let concurrentNumberOfOrganisations = 2;
    let concurrentNumberOfRegistrations = 3;
    let organisationSettings = this.props.homeDashboardState.organisationSettings;
    if (organisationSettings) {
      concurrentNumberOfOrganisations = organisationSettings.concurrentNumberOfOrganisations;
      concurrentNumberOfRegistrations = organisationSettings.concurrentNumberOfRegistrations;
    }
    if (personalByCompData.length > 0) {
      userDetail = personalByCompData[0];
      if (userDetail.concurrentNumberOfOrganisations) {
        concurrentNumberOfOrganisations = userDetail.concurrentNumberOfOrganisations;
      }
      if (userDetail.concurrentNumberOfRegistrations) {
        concurrentNumberOfRegistrations = userDetail.concurrentNumberOfRegistrations;
      }
    }
    let isPlaying = myRegistrations.some(x => x.isPlaying == 1);
    let showRegistrationSetting = isMembershipConcurrencyRuleEnabled && isPlaying;
    let isRegistrationSettingEnabled =
      organisation &&
      (organisation.organisationTypeRefId === 1 || organisation.organisationTypeRefId === 2);
    let playerTypes = this.props.commonReducerState.PlayerMembershipTier || [];
    return (
      <div>
        {showRegistrationSetting ? (
          <div className="comp-dash-table-view mt-2 mb-4">
            <div className="user-module-row-heading">{AppConstants.registrationSetting}</div>
            <div className="table-responsive home-dash-table-view">
              <div
                style={{
                  marginTop: 7,
                  marginRight: 15,
                  marginBottom: 15,
                }}
              >
                <div className="other-info-row" style={{ paddingTop: 10 }}>
                  <div className="year-select-heading other-info-label" style={{ width: '500px' }}>
                    {AppConstants.playerRegistrationType}
                  </div>
                  <div className="side-bar-profile-data other-info-font">
                    <Select
                      name="playerRegistrationType"
                      style={{ width: 212 }}
                      onChange={e => this.handlePlayerMembershipTierChange(e, userDetail)}
                      value={
                        userDetail.playerMembershipTierRefId
                          ? userDetail.playerMembershipTierRefId
                          : 1
                      }
                      disabled={!isRegistrationSettingEnabled}
                    >
                      {playerTypes.map(item => (
                        <Option key={`playerType_${item.id}`} value={item.id}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="other-info-row" style={{ paddingTop: 10 }}>
                  <div className="year-select-heading other-info-label" style={{ width: '500px' }}>
                    {AppConstants.numberOfOrganisationsWithinSeason}
                  </div>
                  <div className="side-bar-profile-data other-info-font">
                    <InputNumber
                      className="text-center"
                      min={1}
                      disabled={!isRegistrationSettingEnabled}
                      onChange={e => this.handleNumberOfOrganisationsChange(e, userDetail)}
                      value={concurrentNumberOfOrganisations}
                    />
                  </div>
                </div>
                <div className="other-info-row" style={{ paddingTop: 10 }}>
                  <div className="year-select-heading other-info-label" style={{ width: '500px' }}>
                    {AppConstants.numberOfRegistrationsWithinSeason}
                  </div>
                  <div className="side-bar-profile-data other-info-font">
                    <InputNumber
                      className="text-center"
                      min={1}
                      disabled={!isRegistrationSettingEnabled}
                      onChange={e => this.handleNumberOfRegistrationsChange(e, userDetail)}
                      value={concurrentNumberOfRegistrations}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {this.state.isShowRegistrationTeamMembers == false ? (
          <div className="comp-dash-table-view mt-2">
            {isArrayNotEmpty(myRegistrations) && (
              <div>
                <div className="user-module-row-heading">{AppConstants.ownRegistration}</div>
                <div className="table-responsive home-dash-table-view">
                  <Table
                    className="home-dashboard-table"
                    columns={this.columns}
                    dataSource={myRegistrations}
                    pagination={false}
                    loading={
                      userRegistrationOnLoad ||
                      cancelDeRegistrationLoad ||
                      userOwnRegistrationOnLoad ||
                      onTransferUserRegistrationLoad
                    }
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <Pagination
                    className="antd-pagination pb-3"
                    current={myRegistrationsCurrentPage}
                    total={myRegistrationsTotalCount}
                    onChange={page =>
                      this.handleRegistrationTableList(
                        page,
                        this.state.userId,
                        this.state.competition,
                        this.state.yearRefId,
                        'myRegistrations',
                      )
                    }
                    showSizeChanger={false}
                  />
                </div>
              </div>
            )}
            {isArrayNotEmpty(otherRegistrations) && (
              <div>
                <div className="user-module-row-heading">{AppConstants.otherRegistration}</div>
                <div className="table-responsive home-dash-table-view">
                  <Table
                    className="home-dashboard-table"
                    columns={this.childOtherRegistrationColumns}
                    dataSource={otherRegistrations}
                    pagination={false}
                    loading={userRegistrationOnLoad}
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <Pagination
                    className="antd-pagination pb-3"
                    current={otherRegistrationsCurrentPage}
                    total={otherRegistrationsTotalCount}
                    onChange={page =>
                      this.handleRegistrationTableList(
                        page,
                        this.state.userId,
                        this.state.competition,
                        this.state.yearRefId,
                        'otherRegistrations',
                      )
                    }
                    showSizeChanger={false}
                  />
                </div>
              </div>
            )}
            {isArrayNotEmpty(childRegistrations) && (
              <div>
                <div className="user-module-row-heading">{AppConstants.childRegistration}</div>
                <div className="table-responsive home-dash-table-view">
                  <Table
                    className="home-dashboard-table"
                    columns={this.childOtherRegistrationColumns}
                    dataSource={childRegistrations}
                    pagination={false}
                    loading={userRegistrationOnLoad}
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <Pagination
                    className="antd-pagination pb-3"
                    current={childRegistrationsCurrentPage}
                    total={childRegistrationsTotalCount}
                    onChange={page =>
                      this.handleRegistrationTableList(
                        page,
                        this.state.userId,
                        this.state.competition,
                        this.state.yearRefId,
                        'childRegistrations',
                      )
                    }
                    showSizeChanger={false}
                  />
                </div>
              </div>
            )}
            {isArrayNotEmpty(teamRegistrations) && (
              <div>
                <div className="user-module-row-heading">{AppConstants.teamRegistration}</div>
                <div className="table-responsive home-dash-table-view">
                  <Table
                    className="home-dashboard-table"
                    columns={this.teamRegistrationColumns}
                    dataSource={teamRegistrations}
                    pagination={false}
                    loading={userRegistrationOnLoad}
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <Pagination
                    className="antd-pagination pb-3"
                    current={teamRegistrationsCurrentPage}
                    total={teamRegistrationsTotalCount}
                    onChange={page =>
                      this.handleRegistrationTableList(
                        page,
                        this.state.userId,
                        this.state.competition,
                        this.state.yearRefId,
                        'teamRegistrations',
                      )
                    }
                    showSizeChanger={false}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="comp-dash-table-view mt-2">
            <div className="row">
              <div className="col-sm d-flex align-content-center">
                <Breadcrumb separator=" > ">
                  <Breadcrumb.Item
                    className="breadcrumb-add font-18 pointer"
                    onClick={() => this.setState({ isShowRegistrationTeamMembers: false })}
                    style={{ color: 'var(--app-color)' }}
                  >
                    {AppConstants.Registrations}
                  </Breadcrumb.Item>
                  <Breadcrumb.Item className="breadcrumb-add font-18">
                    {AppConstants.teamMembers}
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              {this.state.registrationTeam.organisationUniqueKey == organistaionId &&
              this.state.registrationTeam.status != 'Failed Registration' &&
              this.state.registrationTeam.isRemove ? (
                <div
                  className="add-team-member-action-txt"
                  onClick={() => this.gotoAddTeamMember(this.state.registrationTeam)}
                >
                  + {AppConstants.addTeamMembers}
                </div>
              ) : null}
            </div>
            <div className="user-module-row-heading font-18 mt-2">
              {`${AppConstants.team}: ${this.state.registrationTeam.teamName}`}
            </div>
            <div className="table-responsive home-dash-table-view">
              <Table
                className="home-dashboard-table"
                columns={this.teamMembersColumns}
                dataSource={teamMembers}
                pagination={false}
                loading={
                  this.props.userState.getTeamMembersOnLoad ||
                  this.state.cancelTeamMemberDeRegistrationLoad
                }
              />
            </div>
            <div className="d-flex justify-content-end">
              <Pagination
                className="antd-pagination pb-3"
                current={teamMembersCurrentPage}
                total={teamMembersTotalCount}
                onChange={page => this.showTeamMembers(this.state.registrationTeam, page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        )}
        {this.state.userId ? (
          <UserMembership
            userId={this.state.userId}
            onTransferUserRegistrationLoad={onTransferUserRegistrationLoad}
          />
        ) : null}
      </div>
    );
  };

  registrationFormView = () => {
    const registrationForm = this.state.registrationForm == null ? [] : this.state.registrationForm;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="user-module-row-heading">{AppConstants.registrationFormQuestions}</div>
        {(registrationForm || []).map((item, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <InputWithHead heading={item.description} />
            {(item.registrationSettingsRefId == 6 || item.registrationSettingsRefId == 11) && (
              <div className="applicable-to-text">
                {item.contentValue == null ? AppConstants.noInformationProvided : item.contentValue}
              </div>
            )}
            {item.registrationSettingsRefId == 7 && (
              <div>
                {item.contentValue === 'No' ? (
                  <div className="applicable-to-text">{item.contentValue}</div>
                ) : (
                  <div className="table-responsive home-dash-table-view">
                    <Table
                      className="home-dashboard-table"
                      columns={columnsPlayedBefore}
                      dataSource={item.playedBefore}
                      pagination={false}
                    />
                  </div>
                )}
              </div>
            )}
            {item.registrationSettingsRefId == 8 && (
              <div className="table-responsive home-dash-table-view">
                <Table
                  className="home-dashboard-table"
                  columns={columnsFriends}
                  dataSource={item.friends}
                  pagination={false}
                />
              </div>
            )}
            {item.registrationSettingsRefId == 9 && (
              <div className="table-responsive home-dash-table-view">
                <Table
                  className="home-dashboard-table"
                  columns={columnsFriends}
                  dataSource={item.referFriends}
                  pagination={false}
                />
              </div>
            )}
            {item.registrationSettingsRefId == 10 && (
              <div className="table-responsive home-dash-table-view">
                <Table
                  className="home-dashboard-table"
                  columns={columnsFav}
                  dataSource={item.favourites}
                  pagination={false}
                />
              </div>
            )}
            {item.registrationSettingsRefId == 12 && (
              <div className="table-responsive home-dash-table-view">
                <Table
                  className="home-dashboard-table"
                  columns={columnsVol}
                  dataSource={item.volunteers}
                  pagination={false}
                />
              </div>
            )}
          </div>
        ))}
        {registrationForm.length === 0 && <div>{AppConstants.noInformationProvided}</div>}
        <div className="row" style={{ marginTop: 50 }}>
          <div className="col-sm-3">
            <div className="reg-add-save-button">
              <Button
                type="cancel-button"
                onClick={() => this.setState({ isRegistrationForm: false })}
              >
                {AppConstants.back}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  noDataAvailable = () => (
    <div className="d-flex">
      <span className="inside-table-view mt-4">{AppConstants.noDataAvailable}</span>
    </div>
  );

  resetTfaAction = () => {
    this.props.resetTfaAction(this.state.userId);
  };

  exportUserRegistrationData = () => {
    const { userId, competition } = this.state;
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    const competitionId = competition.competitionUniqueKey;
    const yearRefId = this.state.yearRefId;
    this.props.exportUserRegData({ userId, organisationId, competitionId, yearRefId });
  };

  registrationFormClicked = registrationId => {
    this.props.getSubmittedRegData({ registrationId });

    history.push('/submittedRegData');
  };

  headerView = () => {
    function handleMenuClick(e) {
      const { userId } = this_Obj.state;
      history.push('/mergeUserMatches', { userId });
    }

    const menu = (
      <Menu>
        {isUserSuperAdmin(this_Obj.props.userState.userRoleEntity) && (
          <>
            <Menu.Item onClick={handleMenuClick} key="merge">
              {AppConstants.merge}
            </Menu.Item>
            <Menu.Item onClick={() => this.setState({ showMergedUserListModal: true })} key="merge">
              {AppConstants.undeleteMergedUser}
            </Menu.Item>
          </>
        )}
        {this.state.isAdmin && (
          <>
            <Menu.Item onClick={this.resetTfaAction} key={AppConstants.resetTFA}>
              {AppConstants.resetTFA}
            </Menu.Item>
            <Menu.Item onClick={this.exportUserRegistrationData} key={AppConstants.export}>
              {AppConstants.export}
            </Menu.Item>
          </>
        )}
      </Menu>
    );

    return (
      <div className="row">
        <div className="col-sm">
          <Header className="form-header-view bg-transparent d-flex pl-0 justify-content-between mt-5">
            <Breadcrumb separator=" > ">
              <NavLink to="/userTextualDashboard">
                <div className="breadcrumb-add">{AppConstants.userProfile}</div>
              </NavLink>
            </Breadcrumb>
          </Header>
        </div>
        <div className="col-sm">
          <div className="comp-buttons-view mt-5 d-flex align-items-center justify-content-end">
            {this.state.screenKey && (
              <Button
                onClick={() => history.push(this.state.screen)}
                className="primary-add-comp-form mr-4"
                type="primary"
              >
                {/* {this.state.screenKey === "umpire" ? AppConstants.backToUmpire : AppConstants.backToLiveScore} */}
                {AppConstants.back}
              </Button>
            )}
            {!isReadOnlyRole() ? (
              <Dropdown overlay={menu} trigger={['click', 'hover']}>
                <Button type="primary">
                  {AppConstants.actions} <DownOutlined />
                </Button>
              </Dropdown>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  historyView = () => {
    const { userHistoryList, userHistoryPage, userHistoryTotalCount, userHistoryLoad } =
      this.props.userState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columnsHistory}
            dataSource={userHistoryList}
            pagination={false}
            loading={userHistoryLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userHistoryPage}
            total={userHistoryTotalCount}
            onChange={page => this.handleHistoryTableList(page, this.state.userId)}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  incidentView = () => {
    return (
      <UserIncidents
        userId={this.state.userId}
        yearRefId={this.state.yearRefId}
        competition={this.state.competition}
        screenKey={this.state.screenKey}
      ></UserIncidents>
    );
  };

  coachActivityView() {
    const { userState } = this.props;
    const activityCoachList = userState.coachActivityRoster;
    const total = userState.coachTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.coach}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={coachColumn}
            dataSource={activityCoachList}
            pagination={false}
            loading={userState.coachDataLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.coachCurrentPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'umpireCoach',
                this.state.yearRefId,
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  }

  umpireActivityTable() {
    const { userState } = this.props;
    const activityUmpireList = userState.umpireActivityRoster;
    const total = userState.umpireTotalCount;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="user-module-row-heading">{AppConstants.umpire}</div>
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={umpireColumn}
            dataSource={activityUmpireList}
            pagination={false}
            loading={userState.umpireDataLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={userState.umpireCurrentPage}
            total={total}
            onChange={page =>
              this.handleActivityTableList(
                page,
                this.state.userId,
                this.state.competition,
                'umpire',
                this.state.yearRefId,
              )
            }
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  }

  umpireActivityView = () => {
    const {
      umpireActivityOnLoad,
      umpireActivityList,
      umpireActivityCurrentPage,
      umpireActivityTotalCount,
    } = this.props.userState;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="transfer-image-view mb-3">
          <Button className="primary-add-comp-form" type="primary">
            <div className="row">
              <div className="col-sm">
                <img src={AppImages.export} alt="" className="export-image" />
                {AppConstants.export}
              </div>
            </div>
          </Button>
        </div>

        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={umpireActivityColumn}
            dataSource={umpireActivityList}
            pagination={false}
            loading={umpireActivityOnLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end ">
          <Pagination
            className="antd-pagination pb-3"
            current={umpireActivityCurrentPage}
            total={umpireActivityTotalCount}
            onChange={page => this.handleUmpireActivityTableList(page, this.state.userId)}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  getStartEndWeekDates = dateFrom => {
    const startDate = dateFrom.toISOString();
    const endDate = new Date(moment(dateFrom).add(7, 'days').format()).toISOString();

    return { startDate, endDate };
  };

  disabledDate = current => {
    const { scheduleUnavailableStart, scheduleUnavailableEnd } = this.state;

    return (
      (current && current < scheduleUnavailableStart) ||
      (current && current > scheduleUnavailableEnd)
    );
  };

  handleChangeDate = date => {
    const { userId } = this.state;

    if (date) {
      const { startDate, endDate } = this.getStartEndWeekDates(date.startOf('week'));

      this.props.getUmpireAvailabilityAction(userId, startDate, endDate);
      this.setState({ scheduleStartDate: date.startOf('week') });
    }
  };

  handleChangeSchedule = newSchedule => {
    this.setState({ schedule: newSchedule });
  };

  handleSaveAvailability = () => {
    const { schedule, userId } = this.state;
    const currentUserId = getUserId();

    const postData = schedule.map(item => ({
      id: null,
      userId,
      startTime: moment(item).format(),
      endTime: moment(item).clone().add(30, 'minutes').format(),
      type: 'UNAVAILABLE',
      created_by: currentUserId,
    }));

    const { startDate, endDate } = this.getStartEndWeekDates(this.state.scheduleStartDate);
    this.props.saveUmpireAvailabilityAction(postData, userId, startDate, endDate);
  };

  renderCell = (datetime, selected, refSetter) => {
    const { scheduleUnavailableStart, scheduleUnavailableEnd } = this.state;

    const isDateBeforeStart = moment(datetime).isBefore(scheduleUnavailableStart);
    const isDateAfterEnd = moment(datetime).isAfter(scheduleUnavailableEnd);

    return (
      <div className="availability-cell-wrapper">
        <div
          ref={refSetter}
          className="availability-cell"
          style={{
            background: `${
              isDateBeforeStart || isDateAfterEnd
                ? UMPIRE_SCHEDULE_STATUS.UnavailableDateRange
                : selected
                ? UMPIRE_SCHEDULE_STATUS.Unavailable
                : UMPIRE_SCHEDULE_STATUS.Available
            }`,
            cursor: `${isDateBeforeStart || isDateAfterEnd ? 'not-allowed' : 'default'}`,
          }}
        />
      </div>
    );
  };

  handleManageVenues = () => {
    this.setState({ showManageVenuesView: true });
  };

  umpireAvailabilityNewView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="user-module-row-heading live-score-side-desc-view">
          {AppConstants.availability}
        </div>
        <div className="year-select-heading other-info-label">{AppConstants.timezone}</div>
        <Select
          className="user-prof-filter-select"
          placeholder={AppConstants.timezone}
          // onChange={e => this.onChangeSetValue(e, 'countryRefId')}
          // value={userData.countryRefId}
          style={{ width: 180 }}
          name="timezoneRefId"
        ></Select>
        <div className="row" style={{ marginTop: 20 }}>
          <div className="col-sm d-flex flex-row align-items-center">
            <div className="user-module-row-heading">{AppConstants.applyToVenue}</div>
            <div className="mt-n10">
              <Tooltip placement="top">
                <span>{AppConstants.participateCompMsg}</span>
              </Tooltip>
            </div>
          </div>
        </div>
        <Checkbox
          className="single-checkbox-radio-style"
          checked={this.state.allVenues}
          onChange={e => this.setState({ allVenues: e.target.checked })}
        >
          {AppConstants.allVenues}
        </Checkbox>
        {!this.state.allVenues && (
          <div>
            <div className="year-select-heading other-info-label" style={{ marginBottom: 10 }}>
              {AppConstants.venueGroup}
            </div>
            <div className="row">
              <div className="col-sm-2 d-flex flex-row align-items-center">
                <Select
                  className="user-prof-filter-select"
                  style={{ width: 180 }}
                  // onChange={e => this.onChangeSetValue(e, 'countryRefId')}
                  // value={userData.countryRefId}
                  name="venueGroupRefId"
                ></Select>
              </div>
              <div className="col-sm d-flex flex-row align-items-center">
                <Button
                  className="schedule-approval-button"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleManageVenues}
                >
                  {AppConstants.manageVenuesGroups}
                </Button>
              </div>
            </div>
          </div>
        )}
        <WorkingHours userId={this.state.userId}></WorkingHours>
      </div>
    );
  };

  umpireAvailabilityView = () => {
    const { schedule, scheduleStartDate } = this.state;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="row">
          <div className="col-3">
            <div className="mt-5 mb-5">
              <div className="user-module-row-heading d-flex align-items-center">
                {AppConstants.venues}
              </div>
              <Select name="yearRefId" className="user-prof-filter-select w-100" value={-1}>
                <Option key={-1} value={-1}>
                  {AppConstants.allVenues}
                </Option>
              </Select>
            </div>
            <div className="mb-5">
              <div className=" user-module-row-heading d-flex align-items-center mb-1">
                {AppConstants.dateRange}
              </div>
              <WeekPicker
                className="w-100"
                onChange={this.handleChangeDate}
                disabledDate={this.disabledDate}
                format={`D/MM - ${moment(scheduleStartDate).endOf('week').format('D/MM')}`}
              />
            </div>
          </div>
          <div className="col-9">
            <Tabs activeKey={'1'}>
              <TabPane tab={AppConstants.allVenues} key="1">
                <ScheduleSelector
                  selection={schedule}
                  numDays={7}
                  minTime={8}
                  maxTime={22}
                  hourlyChunks={2}
                  startDate={scheduleStartDate}
                  dateFormat="D/M"
                  timeFormat="HH:mm"
                  onChange={this.handleChangeSchedule}
                  renderDateCell={this.renderCell}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div>
          <div className="mt-5">
            <Button
              className="schedule-approval-button"
              type="primary"
              htmlType="submit"
              onClick={this.handleSaveAvailability}
              disabled={this.props.liveScoreUmpireState.onLoad}
              style={{ float: 'right' }}
            >
              {AppConstants.save}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  purchaseActivityView = () => {
    const { onLoad, purchasesListingData, purchasesTotalCount, purchasesCurrentPage } =
      this.props.shopOrderStatusState;
    return (
      <div className="comp-dash-table-view mt-2 default-bg">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.purchaseActivityColumn}
            dataSource={purchasesListingData}
            pagination={false}
            loading={onLoad}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-3"
            current={purchasesCurrentPage}
            total={purchasesTotalCount}
            onChange={page => this.handlePurchasetableList(page, this.state.userId)}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  unlinkCheckParent = (record, roleId) => {
    if (roleId === 'delete_link') {
      this.setState({
        unlinkRecord: record,
        showParentUnlinkConfirmPopup: true,
        pendingParentRole: roleId,
      });
      return;
    }
    if (record.unlinkedBy && record.status === 'Unlinked') {
      if (record.unlinkedBy == record.userId) {
        this.setState({
          unlinkRecord: record,
          showParentUnlinkConfirmPopup: true,
          pendingParentRole: roleId,
        });
      } else {
        this.setState({
          unlinkRecord: record,
          showCannotUnlinkPopup: true,
          pendingParentRole: roleId,
        });
      }
    } else {
      this.setState({
        unlinkRecord: record,
        showParentUnlinkConfirmPopup: true,
        pendingParentRole: roleId,
      });
    }
  };

  unlinkCheckChild = (record, roleId) => {
    if (roleId === 'delete_link') {
      this.setState({
        unlinkRecord: record,
        showChildUnlinkConfirmPopup: true,
        pendingChildRole: roleId,
      });
      return;
    }

    if (record.unlinkedBy && record.status === 'Unlinked') {
      if (record.unlinkedBy == record.userId) {
        this.setState({
          unlinkRecord: record,
          showChildUnlinkConfirmPopup: true,
          pendingChildRole: roleId,
        });
      } else {
        this.setState({
          unlinkRecord: record,
          showCannotUnlinkPopup: true,
          pendingChildRole: roleId,
        });
      }
    } else {
      this.setState({
        unlinkRecord: record,
        showChildUnlinkConfirmPopup: true,
        pendingChildRole: roleId,
      });
    }
  };

  removeDocument = async record => {
    if (record.id) {
      const payload = {
        id: record.id,
        userId: record.userId,
        organisationId: record.organisationUniqueKey,
      };
      this.props.removeUserModuleDocumentAction(payload);
    }
  };

  removeTeamMember = record => {
    if (record.isActive) {
      this.setState({ removeTeamMemberRecord: record, showRemoveTeamMemberConfirmPopup: true });
    } else {
      this.removeTeamMemberView(record);
    }
  };
  showSendInviteModal = record => {
    this.setState({ selectedRow: record, showSendInviteModal: true });
  };
  sendInviteAgain = record => {
    this.props.teamMemberSendInviteAction(record);
    this.setState({ sendInviteLoad: true });
  };
  setFormState = state => {
    this.setState(state);
  };
  handleinstalmentRetryModal = key => {
    const { instalmentRetryRecord } = this.state;
    let record = instalmentRetryRecord;
    const paidByUserId = isArrayNotEmpty(record.paidByUsers)
      ? record.paidByUsers[0].paidByUserId
      : null;
    if (key == 'cancel') {
      this.setState({ instalmentRetryModalVisible: false });
    } else if (key == 'yes') {
      let payload = {
        processTypeName: 'instalment',
        registrationUniqueKey: record.registrationId,
        userId: record.userId,
        divisionId: record.competitionMembershipProductDivisionId,
        competitionId: record.competitionId,
        paidByUserId,
        checkCardAvailability: this.state.retryPaymentMethod,
      };
      this.props.liveScorePlayersToPayRetryPaymentAction(payload);
      this.setState({ instalmentRetryloading: true, instalmentRetryModalVisible: false });
    }
  };

  handleRegistrationRetryModal = key => {
    const { regRetryRecord, retryPaymentCardId } = this.state;
    let paidByUserId = isArrayNotEmpty(regRetryRecord.paidByUsers)
      ? regRetryRecord.paidByUsers[0].paidByUserId
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
        registrationId: regRetryRecord.registrationId,
        paidByUserId: paidByUserId,
        checkCardAvailability: checkCardAvailability,
        cardId: retryPaymentCardId,
        registeredCard: registrationRetryDetails.registeredCard,
      };
      this.props.registrationRetryPaymentAction(payload);
      this.setState({ regRetryloading: true, registrationRetryModalVisible: false });
    }
  };

  cannotUninkPopup = () => {
    const data = this.state.unlinkRecord;
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title="Warning"
          visible={this.state.showCannotUnlinkPopup}
          onCancel={() => this.setState({ showCannotUnlinkPopup: false })}
          footer={[
            <Button onClick={() => this.setState({ showCannotUnlinkPopup: false })}>
              {AppConstants.ok}
            </Button>,
          ]}
        >
          {data?.childName ? (
            <p> {AppConstants.parentUnlinkMessage}</p>
          ) : (
            <p>{AppConstants.childUnlinkMessage}</p>
          )}
        </Modal>
      </div>
    );
  };

  unlinkChildConfirmPopup = () => {
    const status =
      this.state.pendingChildRole === 'delete_link'
        ? AppConstants.permanentlyUnlink
        : this.state.pendingChildRole === UserRole.ParentRestricted
        ? AppConstants.restricted
        : this.state.pendingChildRole === UserRole.ParentUnlinked
        ? AppConstants.deLinked
        : AppConstants.link;
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.confirm}
          visible={this.state.showChildUnlinkConfirmPopup}
          onCancel={() => this.setState({ showChildUnlinkConfirmPopup: false })}
          footer={[
            <Button onClick={() => this.setState({ showChildUnlinkConfirmPopup: false })}>
              {AppConstants.cancel}
            </Button>,
            <Button
              type="primary"
              onClick={() => {
                this.childUnLinkView(this.state.unlinkRecord);
                this.setState({ showChildUnlinkConfirmPopup: false });
              }}
            >
              {AppConstants.confirm}
            </Button>,
          ]}
        >
          <p>
            {' '}
            Are you sure you want to <span className="confirm-key"> {status}</span> this account?
          </p>
        </Modal>
      </div>
    );
  };

  unlinkParentConfirmPopup = () => {
    const status =
      this.state.pendingParentRole === 'delete_link'
        ? AppConstants.permanentlyUnlink
        : this.state.pendingParentRole === UserRole.ParentRestricted
        ? AppConstants.restricted
        : this.state.pendingParentRole === UserRole.ParentUnlinked
        ? AppConstants.deLinked
        : AppConstants.link;
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.confirm}
          visible={this.state.showParentUnlinkConfirmPopup}
          onCancel={() => this.setState({ showParentUnlinkConfirmPopup: false })}
          footer={[
            <Button onClick={() => this.setState({ showParentUnlinkConfirmPopup: false })}>
              {AppConstants.cancel}
            </Button>,
            <Button
              type="primary"
              onClick={() => {
                this.parentUnLinkView(this.state.unlinkRecord);
                this.setState({ showParentUnlinkConfirmPopup: false });
              }}
            >
              {AppConstants.confirm}
            </Button>,
          ]}
        >
          <p>
            {' '}
            Are you sure you want to <span className="confirm-key"> {status}</span> this account?
          </p>
        </Modal>
      </div>
    );
  };

  removeTeamMemberConfirmPopup = () => (
    <div>
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.confirm}
        visible={this.state.showRemoveTeamMemberConfirmPopup}
        onCancel={() => this.setState({ showRemoveTeamMemberConfirmPopup: false })}
        footer={[
          <Button onClick={() => this.setState({ showRemoveTeamMemberConfirmPopup: false })}>
            {AppConstants.no}
          </Button>,
          <Button
            onClick={() => {
              this.removeTeamMemberView(this.state.removeTeamMemberRecord);
              this.setState({ showRemoveTeamMemberConfirmPopup: false });
            }}
          >
            {AppConstants.yes}
          </Button>,
        ]}
      >
        <p>{AppConstants.removeFromTeamPopUpMsg}</p>
      </Modal>
    </div>
  );
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
          value={this.state.retryPaymentMethod}
          onChange={e => this.setState({ retryPaymentMethod: e.target.value })}
        >
          {instalmentRetryDetails?.card && (
            <Radio value={1}>
              {AppConstants.creditCardOnly} {instalmentRetryDetails?.cardNumber}
            </Radio>
          )}
          {instalmentRetryDetails?.directDebit && (
            <Radio value={2}>{AppConstants.directDebit}</Radio>
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
            (registrationRetryDetails.card || []).map((item, index) => (
              <Radio key={index} value={item.id}>
                {AppConstants.creditCardOnly} {item.number}
              </Radio>
            ))}
          {isArrayNotEmpty(registrationRetryDetails?.directDebit) &&
            (registrationRetryDetails.directDebit || []).map((item, index) => (
              <Radio key={index} value={item.id}>
                {AppConstants.directDebit} {item.number}
              </Radio>
            ))}
        </Radio.Group>
      </Modal>
    );
  };

  undeleteMergedUserModalView = () => {
    return (
      <>
        {this.state.showMergedUserListModal && (
          <MergedUserListModal
            userId={this.state.userId}
            onCancel={refresh => {
              if (refresh && this.state.tabKey === '3') {
                this.tabApiCalls(
                  this.state.tabKey,
                  this.state.competition,
                  this.state.userId,
                  this.state.yearRefId,
                );
              }
              this.setState({ showMergedUserListModal: false });
            }}
          />
        )}
      </>
    );
  };

  handleUserPaidIdsChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  transferRegistrationSubmit = async () => {
    const { transferRegistrationUserId, transferRegistrationPaidBy, registrationData } = this.state;

    if (Number(transferRegistrationUserId) === this.state.userId) {
      message.error(ValidationConstants.cannotTransferRegoToYourself);
      return;
    }
    const requestBodyObj = {
      userIdTrasferingTo: Number(transferRegistrationUserId),
      userIdTrasferingFrom: this.state.userId,
      competitionUniqueKey: registrationData.competitionId,
      userRegUniqueKey: registrationData.userRegUniquekey,
      registrationUniqueKey: registrationData.registrationId,
      orgRegistrationParticipantId: registrationData.orgRegistrationParticipantId,
    };

    await this.props.transferUserRegistration(requestBodyObj);

    this.setState({
      transferRegistrationUserId: '',
      transferRegistrationPaidBy: '',
    });
  };

  transferRegistrationPopup = () => {
    const { userRegistrationList, personalData } = this.props.userState;
    const myRegistrations = userRegistrationList?.myRegistrations.registrationDetails
      ? userRegistrationList?.myRegistrations?.registrationDetails
      : [];
    let { showTransferRegistrationPopup, registrationData } = this.state;

    let playerRegoList = [];
    if (
      showTransferRegistrationPopup &&
      personalData &&
      myRegistrations &&
      myRegistrations.length > 0 &&
      registrationData
    ) {
      for (let rego of myRegistrations) {
        if (
          rego.registrationId === registrationData.registrationId &&
          rego.competitionMembershipProductDivisionId
        ) {
          playerRegoList.push(
            `${personalData.firstName} - ${rego.competitionName} - ${rego.divisionName}`,
          );
        }
      }
    }
    let playerRegoListHtml =
      playerRegoList.length > 0 ? (
        <>
          <div>{AppConstants.transferWarningMsg}</div>
          <ul className="mt-2">
            {playerRegoList.map((txt, idx) => (
              <li key={txt + idx}>{txt}</li>
            ))}
          </ul>
        </>
      ) : null;

    return (
      <Modal
        title={AppConstants.confirmTransferTo}
        // visible={true}
        visible={this.state.showTransferRegistrationPopup}
        onCancel={() => this.setState({ showTransferRegistrationPopup: false })}
        onOk={() => {
          this.transferRegistrationSubmit();
          this.setState({ showTransferRegistrationPopup: false });
        }}
      >
        <Alert message={playerRegoListHtml} className="ml-5 mr-5" type="warning" />
        <div className="transfer-modal-body">
          <div className="transfer-modal-form">
            <div>User ID</div>
            {/* <div>Paid By</div> */}
          </div>
          <div className="transfer-modal-form">
            <input
              className="transfer-modal-form-input"
              type="text"
              name="transferRegistrationUserId"
              value={this.state.transferRegistrationUserId}
              onChange={e => this.handleUserPaidIdsChange(e)}
            />
            {/* { Uncomment when transactions trasfering is ready } */}

            {/* <input */}
            {/*    className="transfer-modal-form-input" */}
            {/*    type="text" */}
            {/*    name="transferRegistrationPaidBy" */}
            {/*    value={this.state.transferRegistrationPaidBy} */}
            {/*    onChange={(e) => this.handleUserPaidIdsChange(e)} */}
            {/* /> */}
          </div>
        </div>
      </Modal>
    );
  };

  //#region  update membership expired date
  openMembershipExpiredModal = record => {
    this.setState({ showMembershipExpiredModal: true, registerRecord: record });
  };

  closeMembershipExpireModal = ({ success }) => {
    this.setState({ showMembershipExpiredModal: false });
    if (success) {
      this.handleOwnRegistrationTableList(
        this.state.myRegCurrentPage,
        this.state.userId,
        this.state.competition,
        this.state.yearRefId,
      );
    }
  };

  handleOwnRegistrationTableList = (page, userId, competition, yearRefId) => {
    const filter = {
      competitionId: competition.competitionUniqueKey,
      userId,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId,
      myRegPaging: {
        limit: 10,
        offset: page ? 10 * (page - 1) : 0,
      },
    };
    this.props.getUserOwnModuleRegistrationAction(filter);
  };
  //#endregion

  render() {
    const {
      activityPlayerList,
      activityManagerList,
      personalByCompData,
      userRole,
      onMedicalLoad,
      coachActivityRoster,
      umpireActivityRoster,
      scorerActivityRoster,
      isPersonalUserLoading,
      isCompUserLoading,
      onUpUpdateLoad,
      userRegistrationOnLoad,
      onTransferUserRegistrationLoad,
      onLoadUndeleteUsers,
      userPhotoUpdate,
    } = this.props.userState;
    const { instalmentRetryloading, regRetryloading, retryCashReceivedloading } = this.state;
    const isUserLoading = isPersonalUserLoading || isCompUserLoading;
    const personalDetails = personalByCompData != null ? personalByCompData : [];
    let userRegistrationId = null;
    if (personalDetails != null && personalDetails.length > 0) {
      userRegistrationId = personalByCompData[0].userRegistrationId;
    }

    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="1" />
        <Layout className="live-score-player-profile-layout">
          <Content className="live-score-player-profile-content">
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm-3 " style={{ marginBottom: '7%' }}>
                  {this.leftHandSideView()}
                </div>

                <div className="col-sm-9 default-bg">
                  <div>{this.headerView()}</div>
                  <div className="inside-table-view mt-4">
                    <Tabs activeKey={this.state.tabKey} onChange={e => this.onChangeTab(e)}>
                      <TabPane tab={AppConstants.activity} key="1">
                        {activityPlayerList != null &&
                          activityPlayerList.length > 0 &&
                          this.playerActivityView()}
                        {activityManagerList != null &&
                          activityManagerList.length > 0 &&
                          this.managerActivityView()}

                        {coachActivityRoster != null &&
                          coachActivityRoster.length > 0 &&
                          this.coachActivityView()}

                        {umpireActivityRoster != null &&
                          umpireActivityRoster.length > 0 &&
                          this.umpireActivityTable()}

                        {scorerActivityRoster != null &&
                          scorerActivityRoster.length > 0 &&
                          this.scorerActivityView()}
                        {/* {activityParentList != null && activityParentList.length > 0 && this.parentActivityView()} */}
                        {activityPlayerList.length === 0 &&
                          activityManagerList.length === 0 &&
                          scorerActivityRoster.length === 0 &&
                          coachActivityRoster.length === 0 &&
                          umpireActivityRoster.length === 0 &&
                          this.noDataAvailable()}
                      </TabPane>
                      <TabPane tab={AppConstants.statistics} key="2">
                        {this.statisticsView()}
                      </TabPane>
                      <TabPane tab={AppConstants.personalDetails} key="3">
                        {this.personalView()}
                      </TabPane>
                      {userRegistrationId != null && (
                        <TabPane tab={AppConstants.medical} key="4">
                          {this.medicalView()}
                        </TabPane>
                      )}
                      <TabPane tab={AppConstants.registration} key="5">
                        {!this.state.isRegistrationForm
                          ? this.registrationView()
                          : this.registrationFormView()}
                      </TabPane>
                      <TabPane tab={AppConstants.history} key="6">
                        {this.historyView()}
                      </TabPane>
                      <TabPane tab={AppConstants.incident} key="7">
                        {this.incidentView()}
                      </TabPane>
                      {userRole && (
                        <TabPane tab={AppConstants.umpireActivity} key="8">
                          {this.umpireActivityView()}
                        </TabPane>
                      )}
                      {userRole && process.env.REACT_APP_UMPIRE_AVAILABILITY_BY_VENUE == 'true' && (
                        <TabPane tab={AppConstants.umpireAvailability} key="9">
                          <UserAvailability userId={this.state.userId} />
                        </TabPane>
                      )}
                      <TabPane tab={AppConstants.purchase} key="10">
                        {this.purchaseActivityView()}
                      </TabPane>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
            <Loader
              visible={
                isUserLoading ||
                onMedicalLoad ||
                instalmentRetryloading ||
                regRetryloading ||
                retryCashReceivedloading ||
                onUpUpdateLoad ||
                userRegistrationOnLoad ||
                onTransferUserRegistrationLoad ||
                onLoadUndeleteUsers ||
                userPhotoUpdate
              }
            />
            {this.unlinkChildConfirmPopup()}
            {this.unlinkParentConfirmPopup()}
            {this.cannotUninkPopup()}
            {this.removeTeamMemberConfirmPopup()}
            {this.transferRegistrationPopup()}
            {this.instalmentRetryModalView()}
            {this.registrationRetryModalView()}
            {this.undeleteMergedUserModalView()}
            <SendTeamMemberInviteModal
              showSendInviteModal={this.state.showSendInviteModal}
              teamMember={this.state.selectedRow}
              setFormState={this.setFormState}
              sendInviteAgain={this.sendInviteAgain}
            ></SendTeamMemberInviteModal>
          </Content>
        </Layout>
        {this.state.showMembershipExpiredModal ? (
          <MembershipExpiryModal
            registerRecord={this.state.registerRecord}
            closeModal={this.closeMembershipExpireModal}
          />
        ) : null}

        {this.state.showUserTypeChangeModal && (
          <SwitchUserProfileModal
            visible={this.state.showUserTypeChangeModal}
            onCancel={this.triggerSwitchUserProfileModal}
            usersToSwap={this.state.swapUserRecord}
          />
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUserModulePersonalDetailsAction,
      getUserModuleDocumentsAction,
      removeUserModuleDocumentAction,
      getUserModuleMedicalInfoAction,
      getUserModuleRegistrationAction,
      getUserModuleTeamMembersAction,
      getUserModuleTeamRegistrationAction,
      getUserModuleOtherRegistrationAction,
      getUserModulePersonalByCompetitionAction,
      getUserModuleActivityPlayerAction,
      getUserModuleActivityParentAction,
      getUserModuleActivityScorerAction,
      getUserModuleActivityManagerAction,
      getOnlyYearListAction,
      getUserHistoryAction,
      getUserModuleIncidentListAction,
      getUserRole,
      getScorerData,
      getUmpireData,
      getCoachData,
      getUmpireActivityListAction,
      getPurchasesListingAction,
      getReferenceOrderStatus,
      registrationResendEmailAction,
      userProfileUpdateAction,
      resetTfaAction,
      teamMemberUpdateAction,
      teamMemberSendInviteAction,
      exportUserRegData,
      getSubmittedRegData,
      transferUserRegistration,
      cancelDeRegistrationAction,
      registrationRetryPaymentAction,
      liveScorePlayersToPayRetryPaymentAction,
      clearDataOnCompChangeAction,
      liveScorePlayersToCashReceivedAction,
      getUserModuleSuspendedMatchesAction,
      liveScoreGetSuspensionsAction,
      liveScoreGetTribunalsAction,
      getLiveScoreSettingInitiate,
      liveScoreGetSummaryScoringByUserAction,
      userProfileUpdateHideStatisticsAction,
      getUserOwnModuleRegistrationAction,
      getUmpireAvailabilityAction,
      saveUmpireAvailabilityAction,
      getOrganisationSettingsAction,
      getGenericCommonReference,
      userPhotoUpdateAction,
      getVenuesTypeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    stripeState: state.StripeState,
    shopOrderStatusState: state.ShopOrderStatusState,
    registrationDashboardState: state.RegistrationDashboardState,
    liveScoreDashboardState: state.LiveScoreDashboardState,
    liveScoreSetting: state.LiveScoreSetting,
    penaltyTypeList: state.CommonReducerState.penaltyTypeList,
    suspensionApplyToList: state.CommonReducerState.suspensionApplyToList,
    liveScoreUmpireState: state.LiveScoreUmpiresState,
    homeDashboardState: state.HomeDashboardState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserModulePersonalDetail);

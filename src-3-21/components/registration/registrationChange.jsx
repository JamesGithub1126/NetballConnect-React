import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SearchOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import { Layout, Breadcrumb, Button, Table, Select, Menu, Pagination, Input, Tooltip } from 'antd';

import './product.scss';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import { currencyFormat } from '../../util/currencyFormat';
import { getOrganisationData } from '../../util/sessionStorage';
import { DeRegisterOrgRefType, DeRegisterRefundType } from '../../enums/registrationEnums';
import {
  regCompetitionListAction,
  clearCompReducerDataAction,
  regCompetitionListDeleteAction,
} from '../../store/actions/registrationAction/competitionFeeAction';
import {
  getRegistrationChangeDashboard,
  exportRegistrationChange,
  setRegistrationChangeListPageSize,
  setRegistrationChangeListPageNumber,
  setRegistrationChangeRefundedOffline,
} from '../../store/actions/registrationAction/registrationChangeAction';
import { registrationChangeType } from '../../store/actions/commonAction/commonAction';
import {
  setYearRefId,
  getOnlyYearListAction,
  CLEAR_OWN_COMPETITION_DATA,
} from '../../store/actions/appAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import { isNationalProductEnabled } from 'util/registrationHelper';
const { Content } = Layout;
const { Option } = Select;

let this_Obj = null;

// function to sort table column
const tableSort = async key => {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  await this_Obj.props.getRegistrationChangeDashboard(this_Obj.state.filter, sortBy, sortOrder);
  this_Obj.setState({ sortBy, sortOrder });
};

function getColor(record, key) {
  let color = '';
  if (key === 'compOrganiserApproved') {
    color = record.compOrgApprovedStatus === 1 ? 'green' : 'orange';
  } else if (key === 'affiliateApproved') {
    color = record.affiliateApprovedStatus === 1 ? 'green' : 'orange';
  } else if (key === 'stateApproved') {
    color = record.stateApprovedStatus === 1 ? 'green' : 'orange';
  } else if (key === 'nationalApproved') {
    color = record.nationalApprovedStatus === 1 ? 'green' : 'orange';
  } else if (key === 'parentStateApproved') {
    color = record.parentStateApprovedStatus === 1 ? 'green' : 'orange';
  } else {
    color = 'green';
  }
  return color;
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.current,
    children: [
      {
        title: AppConstants.userId,
        dataIndex: 'userId',
        key: 'userId',
      },
      {
        title: AppConstants.participant,
        dataIndex: 'userName',
        key: 'userName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (userName, record) => (
          <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
            <span className="input-heading-add-another pt-0">{userName}</span>
          </NavLink>
        ),
      },
      {
        title: AppConstants.affiliate,
        dataIndex: 'affiliateName',
        key: 'affiliateName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.competitionOrganiser,
        dataIndex: 'compOrganiserName',
        key: 'compOrganiserName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.competition,
        dataIndex: 'competitionName',
        key: 'competitionName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
    ],
  },
  {
    title: AppConstants.transfer,
    children: [
      {
        title: AppConstants.affiliate,
        dataIndex: 'transferAffOrgName',
        key: 'transferAffOrgName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (transferAffOrgName, record) => (
          <div>
            <div className="d-flex justify-content-between">
              {transferAffOrgName != '-1' && <div>{transferAffOrgName}</div>}
              {transferAffOrgName && (
                <div className="transfer-status">
                  {record.tAffStatus == 0 ? (
                    `(${record.tAffApproved})`
                  ) : (
                    <div>
                      {record.tAffStatus != 3 ? (
                        <div style={{ color: getColor(record, 'tAffApproved') }}>&#x2714;</div>
                      ) : (
                        <div style={{ color: 'red' }}>&#x2718;</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: AppConstants.competitionOrganiser,
        dataIndex: 'transferCompOrgName',
        key: 'transferCompOrgName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (transferCompOrgName, record) => (
          <div>
            <div className="d-flex justify-content-between">
              {record.tCompOrgApproved != '-1' && <div>{transferCompOrgName}</div>}
              {transferCompOrgName && (
                <div className="transfer-status">
                  {record.tCompOrgStatus == 0 ? (
                    `(${record.tCompOrgApproved})`
                  ) : (
                    <div>
                      {record.tCompOrgStatus != 3 ? (
                        <div style={{ color: getColor(record, 'tCompOrgApproved') }}>&#x2714;</div>
                      ) : (
                        <div style={{ color: 'red' }}>&#x2718;</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: AppConstants.competition,
        dataIndex: 'transferCompName',
        key: 'transferCompName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
    ],
  },
  {
    title: AppConstants.approvals,
    children: [
      {
        title: AppConstants.membershipType,
        dataIndex: 'membershipTypeName',
        key: 'membershipTypeName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.paid,
        dataIndex: 'paid',
        key: 'paid',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (paid, record) => (
          <div>{paid !== 'N/A' && paid !== 'P' ? currencyFormat(paid) : paid}</div>
        ),
      },
      {
        title: AppConstants.type,
        dataIndex: 'regChangeType',
        key: 'regChangeType',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.affiliate,
        dataIndex: 'affiliateApproved',
        key: 'affiliateApproved',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (affiliateApproved, record) => (
          <div>
            <div className="d-flex justify-content-between">
              <div>
                {affiliateApproved !== 'N/A' && affiliateApproved !== 'P'
                  ? currencyFormat(affiliateApproved)
                  : affiliateApproved}
              </div>
              {affiliateApproved !== 'N/A' && affiliateApproved !== 'P' && (
                <div>
                  {record.affiliateApprovedStatus != DeRegisterRefundType.Declined ? (
                    record.allOrgApproved &&
                    record.approvalRefundStatus &&
                    record.approvalRefundStatus.some(
                      r => r.statusRefId == 1 && r.orgRefTypeId == 1,
                    ) ? (
                      <Tooltip
                        overlayClassName="failed-reason-error-tool-tip"
                        title={() => {
                          return AppConstants.refundOfflineRequiredMessage;
                        }}
                      >
                        <i
                          className="fa fa-warning ml-2"
                          aria-hidden="true"
                          style={{ color: 'red' }}
                        />
                      </Tooltip>
                    ) : (
                      <div style={{ color: getColor(record, 'affiliateApproved') }}>&#x2714;</div>
                    )
                  ) : (
                    <div style={{ color: 'red' }}>&#x2718;</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: AppConstants.competitionOrganiser,
        dataIndex: 'compOrganiserApproved',
        key: 'compOrganiserApproved',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (compOrganiserApproved, record) => (
          <div>
            <div className="d-flex justify-content-between">
              <div>
                {compOrganiserApproved !== 'N/A' && compOrganiserApproved !== 'P'
                  ? currencyFormat(compOrganiserApproved)
                  : compOrganiserApproved}
              </div>
              {compOrganiserApproved !== 'N/A' && compOrganiserApproved !== 'P' && (
                <div>
                  {record.compOrgApprovedStatus != DeRegisterRefundType.Declined ? (
                    record.allOrgApproved &&
                    record.approvalRefundStatus &&
                    record.approvalRefundStatus.some(
                      r => r.statusRefId == 1 && r.orgRefTypeId == 2,
                    ) ? (
                      <Tooltip
                        overlayClassName="failed-reason-error-tool-tip"
                        title={() => {
                          return AppConstants.refundOfflineRequiredMessage;
                        }}
                      >
                        <i
                          className="fa fa-warning ml-2"
                          aria-hidden="true"
                          style={{ color: 'red' }}
                        />
                      </Tooltip>
                    ) : (
                      <div style={{ color: getColor(record, 'compOrganiserApproved') }}>
                        &#x2714;
                      </div>
                    )
                  ) : (
                    <div style={{ color: 'red' }}>&#x2718;</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: AppConstants.stateTitle,
        dataIndex: 'stateApproved',
        key: 'stateApproved',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (stateApproved, record) => (
          <div>
            <div className="d-flex justify-content-between">
              <div>
                {stateApproved !== 'N/A' && stateApproved !== 'P'
                  ? currencyFormat(stateApproved)
                  : stateApproved}
              </div>
              {stateApproved !== 'N/A' && stateApproved !== 'P' && (
                <div>
                  {record.stateApprovedStatus != DeRegisterRefundType.Declined ? (
                    record.allOrgApproved &&
                    record.approvalRefundStatus &&
                    record.approvalRefundStatus.some(
                      r => r.statusRefId == 1 && r.orgRefTypeId == 3,
                    ) ? (
                      <Tooltip
                        overlayClassName="failed-reason-error-tool-tip"
                        title={() => {
                          return AppConstants.refundOfflineRequiredMessage;
                        }}
                      >
                        <i
                          className="fa fa-warning ml-2"
                          aria-hidden="true"
                          style={{ color: 'red' }}
                        />
                      </Tooltip>
                    ) : (
                      <div style={{ color: getColor(record, 'stateApproved') }}>&#x2714;</div>
                    )
                  ) : (
                    <div style={{ color: 'red' }}>&#x2718;</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: AppConstants.parentStateTitle,
        dataIndex: 'parentStateApproved',
        key: 'parentStateApproved',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (parentStateApproved, record) => (
          <div>
            <div className="d-flex justify-content-between">
              <div>
                {parentStateApproved !== 'N/A' && parentStateApproved !== 'P'
                  ? currencyFormat(parentStateApproved)
                  : parentStateApproved}
              </div>
              {parentStateApproved !== 'N/A' && parentStateApproved !== 'P' && (
                <div>
                  {record.parentStateApprovedStatus != DeRegisterRefundType.Declined ? (
                    record.allOrgApproved &&
                    record.approvalRefundStatus &&
                    record.approvalRefundStatus.some(
                      r =>
                        r.statusRefId == 1 &&
                        r.orgRefTypeId == DeRegisterOrgRefType.ParentStateMembership,
                    ) ? (
                      <Tooltip
                        overlayClassName="failed-reason-error-tool-tip"
                        title={() => {
                          return AppConstants.refundOfflineRequiredMessage;
                        }}
                      >
                        <i
                          className="fa fa-warning ml-2"
                          aria-hidden="true"
                          style={{ color: 'red' }}
                        />
                      </Tooltip>
                    ) : (
                      <div style={{ color: getColor(record, 'parentStateApproved') }}>&#x2714;</div>
                    )
                  ) : (
                    <div style={{ color: 'red' }}>&#x2718;</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ),
      },
      // {
      //     title: AppConstants.status,
      //     dataIndex: 'approvedStatus',
      //     key: 'approvedStatus',
      //     sorter: (a, b) => tableSort(a, b, "approvedStatus")
      // },
      {
        title: AppConstants.action,
        dataIndex: 'action',
        key: 'action',
        render: (data, record) => (
          <Menu
            className="action-triple-dot-submenu"
            theme="light"
            mode="horizontal"
            style={{ lineHeight: '25px' }}
          >
            {
              <Menu.SubMenu
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
                {
                  <Menu.Item
                    key="1"
                    onClick={() =>
                      history.push('/registrationChangeReview', {
                        deRegisterId: record.id,
                        deRegData: record,
                      })
                    }
                  >
                    <span>Review</span>
                  </Menu.Item>
                }
                {record.hasFailedRefund && (
                  <Menu.Item key="2" onClick={() => this_Obj.onRefunedOffline(record)}>
                    <span>{AppConstants.refundedOffline}</span>
                  </Menu.Item>
                )}
              </Menu.SubMenu>
            }
          </Menu>
        ),
      },
    ],
  },
];
if (isNationalProductEnabled) {
  let nationApproveColumn = {
    title: AppConstants.nationalTitle,
    dataIndex: 'nationalApproved',
    key: 'nationalApproved',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (nationalApproved, record) => (
      <div>
        <div className="d-flex justify-content-between">
          <div>
            {nationalApproved !== 'N/A' && nationalApproved !== 'P'
              ? currencyFormat(nationalApproved)
              : nationalApproved}
          </div>
          {nationalApproved !== 'N/A' && nationalApproved !== 'P' && (
            <div>
              {record.stateApprovedStatus != DeRegisterRefundType.Declined ? (
                record.allOrgApproved &&
                record.approvalRefundStatus &&
                record.approvalRefundStatus.some(
                  r =>
                    r.statusRefId == 1 && r.orgRefTypeId == DeRegisterOrgRefType.NationalMembership,
                ) ? (
                  <Tooltip
                    overlayClassName="failed-reason-error-tool-tip"
                    title={() => {
                      return AppConstants.refundOfflineRequiredMessage;
                    }}
                  >
                    <i className="fa fa-warning ml-2" aria-hidden="true" style={{ color: 'red' }} />
                  </Tooltip>
                ) : (
                  <div style={{ color: getColor(record, 'nationalApproved') }}>&#x2714;</div>
                )
              ) : (
                <div style={{ color: 'red' }}>&#x2718;</div>
              )}
            </div>
          )}
        </div>
      </div>
    ),
  };
  columns[2].children.splice(7, 0, nationApproveColumn);
}

const StatusRefs = [
  { id: null, name: AppConstants.all },
  { id: '2', name: AppConstants.approved },
  { id: '3', name: AppConstants.declined },
  { id: '0', name: AppConstants.pendingReview },
  { id: '1', name: AppConstants.pendingRedund },
];

class RegistrationChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteLoading: false,
      userRole: '',
      searchText: '',
      competition: AppConstants.all,
      type: AppConstants.all,
      yearRefId: props.location.state?.yearRefId || null,
      competitionId: '-1',
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      regChangeTypeRefId: props.location.state?.regChangeTypeRefId || -1,
      sortBy: null,
      sortOrder: null,
      statusRefId: props.location.state?.statusRefId || null,
    };
    this_Obj = this;
    this.props.getOnlyYearListAction(this.props.appState.yearList);
  }

  componentDidMount() {
    if (!this.state.yearRefId) {
      const yearRefId = this.props.appState.yearRefId;
      this.setState({ yearRefId });
    }

    this.props.registrationChangeType();
    this.handleRegChangeList(1);
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setRegistrationChangeListPageSize(pageSize);
  };

  handleRegChangeList = async page => {
    await this.props.setRegistrationChangeListPageNumber(page);

    const {
      // yearRefId,
      competitionId,
      organisationId,
      regChangeTypeRefId,
      searchText,
      sortBy,
      sortOrder,
      statusRefId,
    } = this.state;
    const yearRefId =
      this.props.appState.yearRefId !== -1 && this.state.yearRefId != -1
        ? this.props.appState.yearRefId
        : -1;
    let { regChangeDashboardListPageSize } = this.props.regChangeState;
    regChangeDashboardListPageSize = regChangeDashboardListPageSize || 10;

    const filter = {
      organisationId,
      yearRefId,
      competitionId,
      regChangeTypeRefId,
      paging: {
        limit: regChangeDashboardListPageSize,
        offset: page ? regChangeDashboardListPageSize * (page - 1) : 0,
      },
      searchText,
      statusRefId,
    };

    this.props.getRegistrationChangeDashboard(filter, sortBy, sortOrder);

    this.setState({ filter });
  };

  onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      this.handleRegChangeList(1);
    }
  };

  onChangeSearchText = async e => {
    const { value } = e.target;
    await this.setState({ searchText: value });

    if (!value) {
      this.handleRegChangeList(1);
    }
  };

  onClickSearchIcon = async () => {
    this.handleRegChangeList(1);
  };

  onRefunedOffline = async e => {
    let payload = {
      deRegisterId: e.id,
      organisationId: this.state.organisationId,
    };
    await this.props.setRegistrationChangeRefundedOffline(payload);
    this.handleRegChangeList(1);
  };

  headerView = () => (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.registrationChange}
            </Breadcrumb.Item>
          </Breadcrumb>
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

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({
        yearRefId: value,
      });
      if (value != -1) {
        this.props.setYearRefId(value);
      }
      this.handleRegChangeList(1);
    } else {
      await this.setState({
        [key]: value,
      });

      this.handleRegChangeList(1);
    }
  };

  onExport = () => {
    const {
      // yearRefId,
      competitionId,
      organisationId,
      regChangeTypeRefId,
      searchText,
      statusRefId,
      sortBy,
      sortOrder,
    } = this.state;

    const yearRefId =
      this.props.appState.yearRefId !== -1 && this.state.yearRefId != -1
        ? this.props.appState.yearRefId
        : -1;

    const filter = {
      organisationId,
      yearRefId,
      competitionId,
      regChangeTypeRefId,
      paging: {
        limit: -1,
        offset: 0,
      },
      searchText,
      statusRefId,
    };

    this.props.exportRegistrationChange(filter, sortBy, sortOrder);
  };

  dropdownView = () => {
    const { regChangeCompetitions } = this.props.regChangeState;
    const { regChangeTypes } = this.props.commonReducerState;
    let competitionList;
    if (this.state.yearRefId !== -1) {
      competitionList = regChangeCompetitions.filter(x => x.yearRefId === this.state.yearRefId);
    } else {
      competitionList = regChangeCompetitions;
    }

    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.year}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  // style={{ width: 90 }}
                  value={this.state.yearRefId}
                  onChange={e => this.onChangeDropDownValue(e, 'yearRefId')}
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

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.competition}:`}</span>
                <Select
                  className="year-select reg-filter-select-competition ml-2"
                  // style={{ minWidth: 200 }}
                  value={this.state.competitionId}
                  onChange={e => this.onChangeDropDownValue(e, 'competitionId')}
                >
                  <Option key={-1} value="-1">
                    {AppConstants.all}
                  </Option>
                  {(competitionList || []).map(item => (
                    <Option key={`competition_${item.competitionId}`} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.type}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  value={this.state.regChangeTypeRefId}
                  onChange={e => this.onChangeDropDownValue(e, 'regChangeTypeRefId')}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(regChangeTypes || []).map(g => (
                    <Option key={`regChangeType_${g.id}`} value={g.id}>
                      {g.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.status}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  value={this.state.statusRefId}
                  onChange={e => this.onChangeDropDownValue(e, 'statusRefId')}
                >
                  {StatusRefs.map(g => (
                    <Option key={`statusRef_${g.id}`} value={g.id}>
                      {g.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="d-flex align-items-center" style={{ marginRight: '1%' }}>
              <div className="d-flex flex-row-reverse button-with-search pb-3">
                <Button className="primary-add-comp-form" type="primary" onClick={this.onExport}>
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
    );
  };

  contentView = () => {
    const {
      regChangeDashboardListData,
      regChangeDashboardListPage,
      regChangeDashboardListTotalCount,
      onLoad,
      regChangeDashboardListPageSize,
    } = this.props.regChangeState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={regChangeDashboardListData}
            pagination={false}
            loading={onLoad && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination action-box-pagination"
            showSizeChanger
            current={regChangeDashboardListPage}
            defaultCurrent={regChangeDashboardListPage}
            defaultPageSize={regChangeDashboardListPageSize}
            total={regChangeDashboardListTotalCount}
            onChange={page => this.handleRegChangeList(page)}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="9" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
            <SignSemanticView key={1} />
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      regCompetitionListAction,
      setYearRefId,
      getOnlyYearListAction,
      clearCompReducerDataAction,
      regCompetitionListDeleteAction,
      CLEAR_OWN_COMPETITION_DATA,
      getRegistrationChangeDashboard,
      exportRegistrationChange,
      registrationChangeType,
      setRegistrationChangeListPageSize,
      setRegistrationChangeListPageNumber,
      setRegistrationChangeRefundedOffline,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFeesState: state.CompetitionFeesState,
    regChangeState: state.RegistrationChangeState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationChange);

function SignSemanticView() {
  const renderSign = (sign, label, color) => {
    return (
      <div className="sign-body">
        <div className="sign-label" style={{ color }}>
          {sign}
        </div>
        <div>=</div>
        <div className="sign-msg">{label}</div>
      </div>
    );
  };
  return (
    <div className="comp-dash-table-view mt-2 sign-semantic">
      <div>{renderSign(AppConstants.p, AppConstants.pendingReview, 'var(--app-4c4c6d)')}</div>
      <div>{renderSign(<>&#x2714;</>, AppConstants.approved, 'green')}</div>
      <div>{renderSign(<>&#x2714;</>, AppConstants.partialRefund, 'orange')}</div>
      <div>{renderSign(<>&#x2718;</>, AppConstants.declined, 'red')}</div>
      <div>
        {renderSign(
          <i className="fa fa-warning ml-2" aria-hidden="true" style={{ color: 'red' }} />,
          AppConstants.offlineRefundRequired,
          'red',
        )}
      </div>
    </div>
  );
}

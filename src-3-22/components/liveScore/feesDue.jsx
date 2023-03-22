import React, { Component } from 'react';
import { Layout, Button, Table, message, Pagination, Menu, Modal, Radio } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  liveScorePlayersToPayListAction,
  liveScorePlayersToPayRetryPaymentAction,
  liveScorePlayersToCashReceivedAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/LiveScoreAction/liveScoreDashboardAction';
import history from '../../util/history';
import { getLiveScoreCompetition, getOrganisationData } from '../../util/sessionStorage';
import { isArrayNotEmpty } from '../../util/helpers';
import Tooltip from 'react-png-tooltip';
import { initializeCompData } from '../../store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import Loader from '../../customComponents/loader';
import { registrationFailedStatusUpdate } from 'store/actions/registrationAction/registrationDashboardAction';
import { RetryPaymentType } from 'enums/registrationEnums';

const { Content } = Layout;
let this_obj = null;

/////function to sort table column
function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

function checkSorting(a, b, key) {
  if (a[key] && b[key]) {
    return a[key].length - b[key].length;
  }
}

const columnsPlayersToPay = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: (a, b) => tableSort(a, b, 'firstName'),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: (a, b) => checkSorting(a, b, 'lastName'),
  },
  {
    title: AppConstants.linked,
    dataIndex: 'linked',
    key: 'linked',
    sorter: (a, b) => checkSorting(a, b, 'linked'),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: (a, b) => checkSorting(a, b, 'division'),
  },
  {
    title: AppConstants.grade,
    dataIndex: 'gradeName',
    key: 'gradeName',
    sorter: (a, b) => checkSorting(a, b, 'grade'),
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'teamName',
    sorter: (a, b) => checkSorting(a, b, 'team'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b, payReq) => checkSorting(a, b, payReq),
  },
  {
    title: AppConstants.paymentMethod,
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    sorter: (a, b, payMethod) => checkSorting(a, b, payMethod),
  },
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
          <Menu.Item key="1" onClick={() => this_obj.cashReceived(record)}>
            <span>{AppConstants.cashReceived}</span>
          </Menu.Item>
          {(record.processType == 'Instalment' || record.processType == 'Per Match') && (
            <Menu.Item key="2" onClick={() => this_obj.retryPayment(record)}>
              <span>{AppConstants.retryPayment}</span>
            </Menu.Item>
          )}
          {record.processTypeName == 'school_invoice' && (
            <Menu.Item key="3" onClick={() => this_obj.invoiceFailed(record)}>
              <span>{AppConstants.failed}</span>
            </Menu.Item>
          )}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

class FeesDue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      incidents: 'incidents',
      compOrgId: 0,
      onload: false,
      page: 1,
      retryPaymentLoad: false,
      invoiceFailedLoad: false,
      instalmentRetryModalVisible: false,
      retryPaymentMethod: 1,
      selectedRow: null,
    };
    this_obj = this;
    this.props.initializeCompData();
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const { competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
      let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;

      this.getPlayersToPayList(1);
      this.setState({
        compOrgId: compOrgId,
      });
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate() {
    if (
      this.state.onload == true &&
      this.props.liveScoreDashboardState.onPlayersToPayLoad == false
    ) {
      this.getPlayersToPayList(this.state.page);
      this.setState({ onload: false });
    }
    if (
      this.state.retryPaymentLoad == true &&
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
            retryPaymentLoad: false,
            retryPaymentMethod,
          });
          return;
        }
      }
      this.getPlayersToPayList(this.state.page);
      this.setState({ retryPaymentLoad: false });
    }
    if (
      this.state.invoiceFailedLoad == true &&
      this.props.registrationDashboardState.onRegStatusUpdateLoad == false
    ) {
      this.getPlayersToPayList(this.state.page);
      this.setState({ invoiceFailedLoad: false });
    }
  }

  getPlayersToPayList = page => {
    const { organisationUniqueKey } = getOrganisationData() || {};
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let { liveScorePlayerstoPayListPageSize } = this.props.liveScoreDashboardState;
    liveScorePlayerstoPayListPageSize = liveScorePlayerstoPayListPageSize
      ? liveScorePlayerstoPayListPageSize
      : 10;
    let payload = {
      competitionId: uniqueKey,
      organisationId: organisationUniqueKey,
      paging: {
        limit: liveScorePlayerstoPayListPageSize,
        offset: page ? liveScorePlayerstoPayListPageSize * (page - 1) : 0,
      },
    };
    this.props.liveScorePlayersToPayListAction(payload);
  };

  handleShowSizeChange = key => async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handleTablePage = async (page, key) => {
    await this.props.setPageNumberAction(page);
    this.setState({ onload: true, page: page });
  };

  retryPayment = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let paidByUserId = isArrayNotEmpty(record.paidByUsers)
      ? record.paidByUsers[0].paidByUserId
      : null;
    let payload = {};
    if (record.processTypeName == 'instalment') {
      payload = {
        processTypeName: record.processTypeName,
        registrationUniqueKey: record.registrationUniqueKey,
        userId: record.userId,
        divisionId: record.divisionId,
        competitionId: uniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: 0,
      };
    } else {
      payload = {
        processTypeName: record.processTypeName,
        registrationUniqueKey: record.registrationUniqueKey,
        userId: record.userId,
        divisionId: record.divisionId,
        competitionId: uniqueKey,
      };
    }
    this.setState({ retryPaymentLoad: true, selectedRow: record });
    this.props.liveScorePlayersToPayRetryPaymentAction(payload);
  };

  cashReceived = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    const organisationId = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    let paidByUserId = isArrayNotEmpty(record.paidByUsers)
      ? record.paidByUsers[0].paidByUserId
      : null;
    let payload = {
      processTypeName: record.processTypeName,
      registrationUniqueKey: record.registrationUniqueKey,
      userId: record.userId,
      divisionId: record.divisionId,
      competitionId: uniqueKey,
      paidByUserId: paidByUserId,
      organisationId: organisationId,
      membershipProductMappingId: record.membershipProductMappingId,
    };

    this.setState({ retryPaymentLoad: true });
    this.props.liveScorePlayersToCashReceivedAction(payload);
  };

  invoiceFailed = record => {
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    let payload = {
      registrationUniqueKey: record.registrationUniqueKey,
      userId: record.userId,
      membershipProductMappingId: record.membershipProductMappingId,
      competitionId: uniqueKey,
    };
    this.setState({ invoiceFailedLoad: true });
    this.props.registrationFailedStatusUpdate(payload);
  };
  handleinstalmentRetryModal = key => {
    const { selectedRow } = this.state;
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
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
        competitionId: uniqueKey,
        paidByUserId: paidByUserId,
        checkCardAvailability: this.state.retryPaymentMethod,
      };
      this.props.liveScorePlayersToPayRetryPaymentAction(payload);
      this.setState({ retryPaymentLoad: true, instalmentRetryModalVisible: false });
    }
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
  playersToPayHeading = () => {
    return (
      <div className="row text-view">
        <div className="col-sm d-flex align-items-center">
          <span className="home-dash-left-text">{AppConstants.playersToPay}</span>
          <div className="mt-n10">
            <Tooltip>
              <span>{AppConstants.playersToPayMsg}</span>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  ////////ownedView view for competition
  playersToPayView = () => {
    const {
      playersToPayList,
      onLoad,
      liveScorePlayerstoPayListTotalCount,
      liveScorePlayerstoPayListPage,
      liveScorePlayerstoPayListPageSize,
    } = this.props.liveScoreDashboardState;
    return (
      <div className="comp-dash-table-view mt-4">
        {this.playersToPayHeading()}
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad}
            className="home-dashboard-table"
            columns={columnsPlayersToPay}
            dataSource={playersToPayList}
            pagination={false}
            rowKey={record => 'playerTopay' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination pb-5"
            showSizeChanger
            current={liveScorePlayerstoPayListPage}
            defaultCurrent={liveScorePlayerstoPayListPage}
            defaultPageSize={liveScorePlayerstoPayListPageSize}
            total={liveScorePlayerstoPayListTotalCount}
            onChange={page => this.handleTablePage(page, 'playerToPay')}
            onShowSizeChange={this.handleShowSizeChange('playerToPay')}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg" style={{ paddingBottom: 10 }}>
        <Loader
          visible={
            this.props.liveScoreDashboardState.onPlayersToPayLoad ||
            this.props.liveScoreDashboardState.onRetryPaymentLoad
          }
        />
        <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.liveScores} />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="payments_1" />
        <Layout>
          <Content>
            {this.playersToPayView()}
            {this.instalmentRetryModalView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      initializeCompData,
      liveScorePlayersToPayListAction,
      liveScorePlayersToPayRetryPaymentAction,
      liveScorePlayersToCashReceivedAction,
      setPageSizeAction,
      setPageNumberAction,
      registrationFailedStatusUpdate,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDashboardState: state.LiveScoreDashboardState,
    registrationDashboardState: state.RegistrationDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeesDue);

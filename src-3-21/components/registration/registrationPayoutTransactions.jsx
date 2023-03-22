import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import './product.scss';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { liveScore_formateDate } from '../../themes/dateformate';
import { getOrganisationData } from '../../util/sessionStorage';
import { currencyFormat } from '../../util/currencyFormat';
import {
  getTransactionPayoutListAction,
  exportPayoutTransaction,
} from '../../store/actions/stripeAction/stripeAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
// import Loader from "../../customComponents/loader";

const { Content } = Layout;

const columns = [
  {
    title: AppConstants.transactionId,
    dataIndex: 'id',
    key: 'id',
    sorter: false,
  },
  {
    title: AppConstants.description,
    dataIndex: 'description',
    key: 'description',
    sorter: false,
  },
  {
    title: AppConstants.date,
    dataIndex: 'created',
    key: 'created',
    sorter: false,
    render: created => {
      const date = new Date(created * 1000);
      const finalDate = liveScore_formateDate(date);
      return <span>{finalDate}</span>;
    },
  },
  {
    title: AppConstants.amount,
    dataIndex: 'amount',
    key: 'amount',
    render: amount => <span>{currencyFormat(amount)}</span>,
    sorter: false,
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: false,
  },
];

class RegistrationPayoutTransaction extends Component {
  componentDidMount() {
    if (this.stripeConnected()) {
      this.props.getTransactionPayoutListAction(
        1,
        null,
        null,
        this.props.location.state ? this.props.location.state.id : null,
      );
    }
  }

  stripeConnected = () => {
    const orgData = getOrganisationData() ? getOrganisationData() : null;
    return orgData ? orgData.stripeAccountID : null;
  };

  onExport = () => {
    if (!this.props.stripeState.onExportLoad) {
      this.props.exportPayoutTransaction(
        this.props.location.state ? this.props.location.state.id : null,
      );
    }
  };

  headerView = () => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.transactions}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm-8 w-100 d-flex flex-row align-items-center justify-content-end">
          <div className="row">
            <div className="col-sm pt-1">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button onClick={this.onExport} className="primary-add-comp-form" type="primary">
                  <div className="row">
                    <div className="col-sm d-flex align-items-center">
                      <img src={AppImages.export} alt="" className="export-image" />
                      {AppConstants.export}
                      {this.props.stripeState.onExportLoad && (
                        <LoadingOutlined className="exporting-icon" />
                      )}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  handleStripeTransactionPayoutList = key => {
    let page = this.props.stripeState.stripeTransactionPayoutListPage;
    const { stripeTransactionPayoutList } = this.props.stripeState;
    let startingAfter = null;
    let endingBefore = null;
    if (key === 'next') {
      // move forward
      page = parseInt(page, 10) + 1;
      if (stripeTransactionPayoutList.length) {
        startingAfter = stripeTransactionPayoutList[stripeTransactionPayoutList.length - 1].id;
      }
      endingBefore = null;
    }
    if (key === 'Previous') {
      // move backward
      page = parseInt(page, 10) - 1;
      startingAfter = null;
      endingBefore = stripeTransactionPayoutList[0].id;
    }
    this.props.getTransactionPayoutListAction(
      page,
      startingAfter,
      endingBefore,
      this.props.location.state ? this.props.location.state.id : null,
    );
  };

  // checking for enabling click on next button or not
  checkNextEnabled = () => {
    const { stripeState } = this.props;
    const currentPage = stripeState.stripeTransactionPayoutListPage;
    const totalCount = stripeState.stripeTransactionPayoutListTotalCount
      ? stripeState.stripeTransactionPayoutListTotalCount
      : 1;
    const lastPage = Math.ceil(parseInt(totalCount, 10) / 10);
    return lastPage != currentPage;
  };

  transactionPayoutListView = () => {
    const {
      stripeTransactionPayoutList,
      stripeTransactionPayoutListPage,
      stripeTransactionPayoutListTotalCount,
    } = this.props.stripeState;
    const previousEnabled = stripeTransactionPayoutListPage != 1;
    const nextEnabled = this.checkNextEnabled();
    const currentPage = stripeTransactionPayoutListPage;
    const totalCount = stripeTransactionPayoutListTotalCount || 1;
    const totalPageCount = Math.ceil(parseInt(totalCount, 10) / 10);
    return (
      <div>
        <div className="table-responsive home-dash-table-view mt-5 mb-5">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={stripeTransactionPayoutList}
            pagination={false}
            loading={this.props.stripeState.onLoad && true}
          />
        </div>
        <div className="reg-payment-pages-div mb-5">
          <span className="reg-payment-paid-reg-text">{`${AppConstants.currentPage} - ${currentPage}`}</span>
          <span className="reg-payment-paid-reg-text pt-2">{`${AppConstants.totalPages} - ${totalPageCount}`}</span>
        </div>
        <div className="d-flex justify-content-end paddingBottom56px">
          <div
            className="pagination-button-div"
            onClick={() => previousEnabled && this.handleStripeTransactionPayoutList('Previous')}
          >
            <span
              style={!previousEnabled ? { color: '#9b9bad' } : null}
              className="pagination-button-text"
            >
              {AppConstants.previous}
            </span>
          </div>
          <div
            className="pagination-button-div"
            onClick={() => nextEnabled && this.handleStripeTransactionPayoutList('next')}
          >
            <span
              style={!nextEnabled ? { color: '#9b9bad' } : null}
              className="pagination-button-text"
            >
              {AppConstants.next}
            </span>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => (
    <div className="comp-dash-table-view mt-2">{this.transactionPayoutListView()}</div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.finance} menuName={AppConstants.finance} />
        <InnerHorizontalMenu menu="finance" finSelectedKey="3" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.contentView()}
            {/* <Loader visible={this.props.stripeState.onLoad} /> */}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getTransactionPayoutListAction,
      exportPayoutTransaction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    stripeState: state.StripeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationPayoutTransaction);

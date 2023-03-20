import React, { Component } from 'react';
import { Layout, Select, DatePicker, Button, Table } from 'antd';
import './product.scss';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import InputWithHead from '../../customComponents/InputWithHead';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getStripePayoutListAction,
  exportPaymentApi,
  exportTransactionsApi,
} from '../../store/actions/stripeAction/stripeAction';
import {
  getOrganisationData,
  // getImpersonation
} from '../../util/sessionStorage';
import { currencyFormat } from '../../util/currencyFormat';
import { liveScore_formateDate } from '../../themes/dateformate';
import moment from 'moment';
import history from 'util/history';
import { NavLink } from 'react-router-dom';

const { Content } = Layout;
/////function to sort table column
// function tableSort(a, b, key) {
//     let stringA = JSON.stringify(a[key])
//     let stringB = JSON.stringify(b[key])
//     return stringA.localeCompare(stringB)
// }

const columns = [
  {
    title: AppConstants.payoutId,
    dataIndex: 'id',
    key: 'id',
    sorter: false,
    render: (id, record) => (
      <NavLink to={{ pathname: `/registrationPayoutTransaction`, state: { id: record.id } }}>
        <span class='theme-color'>{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.transactionId,
    dataIndex: 'balance_transaction',
    key: 'balance_transaction',
    sorter: false,
  },
  {
    title: AppConstants.description,
    dataIndex: 'description',
    key: 'description',
    sorter: false,
    render: description => <span>{description ? description : 'N/A'}</span>,
  },
  {
    title: AppConstants.date,
    dataIndex: 'created',
    key: 'created',
    sorter: false,
    render: created => {
      var date = new Date(created * 1000);
      let finalDate = liveScore_formateDate(date);
      return <span>{finalDate}</span>;
    },
  },
  {
    title: AppConstants.amount,
    dataIndex: 'amount',
    key: 'amount',
    sorter: false,
    render: amount => <span>{currencyFormat(amount)}</span>,
  },
  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: false,
  },
  // {
  //     title: AppConstants.action,
  //     dataIndex: 'refund',
  //     key: 'refund',
  //     render: (refund, record) =>
  //         <Menu
  //             className="action-triple-dot-submenu"
  //             theme="light"
  //             mode="horizontal"
  //             style={{ lineHeight: '25px' }}
  //         >
  //             <SubMenu
  //                 key="sub1"
  //                 title={
  //                     <img className="dot-image" src={AppImages.moreTripleDot} alt="" width="16" height="16" />
  //                 }
  //             >
  //                 <Menu.Item key="1">
  //                     <span>Full Refund</span>
  //                 </Menu.Item>
  //                 <Menu.Item key="2">
  //                     <span>Partial Refund</span>
  //                 </Menu.Item>
  //             </SubMenu>
  //         </Menu>
  // },
];

class RegistrationSettlements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: null,
      dateFrom: null,
      dateTo: null,
      competition: 'all',
      paymentFor: 'all',
      isImpersonation: localStorage.getItem('Impersonation') == 'true' ? true : false,
    };
  }

  componentDidMount() {
    if (this.state.isImpersonation) {
      history.push('/paymentDashboard');
    }
    if (this.stripeConnected()) {
      this.props.getStripePayoutListAction(1, null, null);
    }
  }

  stripeConnected = () => {
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    let stripeAccountID = orgData ? orgData.stripeAccountID : null;
    return stripeAccountID;
  };

  //on export button click
  onExport() {
    const { dateFrom, dateTo, year } = this.state;
    const start = dateFrom ? moment(dateFrom).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
    const end = dateTo ? moment(dateTo).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;

    this.props.exportPaymentApi('payout', year, start, end);
  }

  onExportTransactions() {
    const { dateFrom, dateTo, year } = this.state;
    const start = dateFrom ? moment(dateFrom).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
    const end = dateTo ? moment(dateTo).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;

    this.props.exportTransactionsApi('payout', year, start, end);
  }

  headerView = () => {
    return (
      // <div className="comp-player-grades-header-view-design">
      //     <div className="row">
      //         <div className="col-sm d-flex align-content-center">
      //             <Breadcrumb separator=" > ">
      //                 <Breadcrumb.Item className="breadcrumb-add">{AppConstants.payouts}</Breadcrumb.Item>
      //             </Breadcrumb>
      //         </div>
      //     </div>
      // </div>
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <span className="form-heading">{AppConstants.payouts}</span>
            </div>
            <div className="col-sm-8 d-flex justify-content-end w-100 flex-row align-items-center">
              <div className="row">
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      onClick={() => this.onExportTransactions()}
                      className="primary-add-comp-form"
                      type="primary"
                    >
                      <img src={AppImages.export} alt="" className="export-image" />
                      {AppConstants.exportTransactions}
                    </Button>
                  </div>
                </div>
                <div className="col-sm pt-1">
                  <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                    <Button
                      onClick={() => this.onExport()}
                      className="primary-add-comp-form"
                      type="primary"
                    >
                      <img src={AppImages.export} alt="" className="export-image" />
                      {AppConstants.export}
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

  handleStripePayoutList = (key, params) => {
    let page = this.props.stripeState.stripePayoutListPage;
    let stripePayoutList = this.props.stripeState.stripePayoutList;
    let starting_after = null;
    let ending_before = null;
    if (key === 'next') {
      ///move forward
      page = parseInt(page) + 1;
      let id = stripePayoutList[stripePayoutList.length - 1]['id'];
      starting_after = id;
      ending_before = null;
    } else if (key == 'Previous') {
      //////move backward
      page = parseInt(page) - 1;
      let id = stripePayoutList[0]['id'];
      starting_after = null;
      ending_before = id;
    } else {
      page = 1;
    }
    if (!params) {
      params = {};
      if (this.state.year) params.year = this.state.year;
      else if (this.state.dateFrom || this.state.dateTo) {
        if (this.state.dateFrom) params.startDate = this.state.dateFrom;
        if (this.state.dateTo) params.endDate = this.state.dateTo;
      }
    }
    this.props.getStripePayoutListAction(page, starting_after, ending_before, params);
  };

  ////checking for enabling click on next button or not
  checkNextEnabled = () => {
    let currentPage = this.props.stripeState.stripePayoutListPage;
    let totalCount = this.props.stripeState.stripePayoutListTotalCount
      ? this.props.stripeState.stripePayoutListTotalCount
      : 1;
    let lastPage = Math.ceil(parseInt(totalCount) / 10);
    if (lastPage == currentPage) {
      return false;
    } else {
      return true;
    }
  };

  getYearsForDropdown = () => {
    const currentYear = moment().format('YYYY');
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  payoutListView = () => {
    let stripePayoutList = this.props.stripeState.stripePayoutList;
    let previousEnabled = this.props.stripeState.stripePayoutListPage == 1 ? false : true;
    let nextEnabled = this.checkNextEnabled();
    let currentPage = this.props.stripeState.stripePayoutListPage;
    let totalCount = this.props.stripeState.stripePayoutListTotalCount
      ? this.props.stripeState.stripePayoutListTotalCount
      : 1;
    let totalPageCount = Math.ceil(parseInt(totalCount) / 10);
    return (
      <div>
        <div className="table-responsive home-dash-table-view mt-5 mb-5">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={stripePayoutList}
            pagination={false}
            loading={this.props.stripeState.onLoad && true}
          />
        </div>
        <div className="reg-payment-pages-div mb-5">
          <span className="reg-payment-paid-reg-text">
            {AppConstants.currentPage + ' - ' + currentPage}
          </span>
          <span className="reg-payment-paid-reg-text pt-2">
            {AppConstants.totalPages + ' - ' + totalPageCount}
          </span>
        </div>
        <div className="d-flex justify-content-end paddingBottom80px ">
          <div
            className="pagination-button-div"
            onClick={() => previousEnabled && this.handleStripePayoutList('Previous')}
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
            onClick={() => nextEnabled && this.handleStripePayoutList('next')}
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

  dropdownView = () => {
    return (
      <div className="row">
        <div className="col-sm">
          <InputWithHead required="pt-0" heading={AppConstants.year} />
          <Select
            className="reg-payment-select w-100"
            style={{ paddingRight: 1, minWidth: 160, maxHeight: 60, minHeight: 44 }}
            onChange={year => this.onYearChange(year)}
            value={this.state.year}
            placeholder={AppConstants.selectAYear}
            allowClear={true}
          >
            {this.getYearsForDropdown().map(year => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-sm">
          <InputWithHead required="pt-0" heading={AppConstants.dateFrom} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            // size="large"
            style={{ minWidth: 160 }}
            onChange={date => this.dateOnChangeFrom(date)}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={this.state.dateFrom ? moment(this.state.dateFrom) : null}
          />
        </div>
        <div className="col-sm">
          <InputWithHead required="pt-0" heading={AppConstants.dateTo} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            // size="large"
            style={{ minWidth: 160 }}
            onChange={date => this.dateOnChangeTo(date)}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            value={this.state.dateTo ? moment(this.state.dateTo) : null}
          />
        </div>
      </div>
    );
  };

  ///setting the available from date
  dateOnChangeFrom = date => {
    const dateFrom = date ? moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss') : date;
    this.setState({
      dateFrom: dateFrom,
      year: null,
    });
    this.handleStripePayoutList(null, {
      year: null,
      startDate: dateFrom,
      endDate: this.state.dateTo,
    });
  };

  ////setting the available to date
  dateOnChangeTo = date => {
    const dateTo = date ? moment(date).endOf('day').format('YYYY-MM-DD HH:mm:ss') : date;
    this.setState({
      dateTo: dateTo,
      year: null,
    });

    this.handleStripePayoutList(null, {
      year: null,
      startDate: this.state.dateFrom,
      endDate: dateTo,
    });
  };

  onYearChange = year => {
    this.setState({
      year,
      dateFrom: null,
      dateTo: null,
    });
    this.handleStripePayoutList(null, {
      year,
      startDate: null,
      endDate: null,
    });
  };

  contentView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        {this.dropdownView()}
        {this.payoutListView()}
      </div>
    );
  };

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
      getStripePayoutListAction,
      exportPaymentApi,
      exportTransactionsApi,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    stripeState: state.StripeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationSettlements);

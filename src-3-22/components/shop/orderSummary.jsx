import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Layout, Button, Table, Select, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { isEmptyArray } from 'formik';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  getOrderSummaryListingAction,
  exportOrderSummaryAction,
  setOrderSummaryListPageSizeAction,
  setOrderSummaryListPageNumberAction,
} from '../../store/actions/shopAction/orderSummaryAction';
import { currencyFormat } from '../../util/currencyFormat';
import { getOnlyYearListAction } from '../../store/actions/appAction';
import { getAffiliateToOrganisationAction } from '../../store/actions/userAction/userAction';
import { getOrganisationData, getGlobalYear, setGlobalYear } from '../../util/sessionStorage';
import InputWithHead from '../../customComponents/InputWithHead';

const { Content } = Layout;
// const { SubMenu } = Menu
const { Option } = Select;
let this_obj = null;

// listeners for sorting
const listeners = key => ({
  onClick: () => tableSort(key),
});

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'asc';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'asc') {
    sortOrder = 'desc';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'desc') {
    sortBy = sortOrder = null;
  }
  this_obj.setState({ sortBy, sortOrder });
  let { yearRefId, affiliateOrgId, postcode, searchText, paymentMethod } = this_obj.state;
  let page = this_obj.props.shopOrderSummaryState.orderSummaryCurrentPage;
  let { orderSummaryPageSize } = this_obj.props.shopOrderSummaryState;
  orderSummaryPageSize = orderSummaryPageSize ? orderSummaryPageSize : 10;
  let params = {
    limit: orderSummaryPageSize,
    offset: page ? orderSummaryPageSize * (page - 1) : 0,
    search: searchText,
    year: yearRefId,
    postcode: postcode,
    affiliate: affiliateOrgId,
    paymentMethod: paymentMethod,
    order: sortOrder ? sortOrder : '',
    sorterBy: sortBy ? sortBy : '',
  };
  this_obj.props.getOrderSummaryListingAction(params);
}

const columns = [
  {
    title: AppConstants.date,
    dataIndex: 'date',
    key: 'date',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('createdOn'),
    render: date => {
      return <span>{date ? moment(date).local().format('DD/MM/YYYY') : 'N/A'}</span>;
    },
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (name, record) => {
      let organisation = '';
      if (record.buyerOrganisation) {
        organisation = `(${record.buyerOrganisation})`;
      }
      return record.userId ? (
        <NavLink
          to={{
            pathname: `/userPersonal`,
            state: { userId: record.userId, screenKey: 'orderSummary', screen: '/orderSummary' },
          }}
        >
          {' '}
          <span className="input-heading-add-another pt-0">
            {name} {organisation}
          </span>
        </NavLink>
      ) : (
        <span>{name}</span>
      );
    },
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliate',
    key: 'affiliate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('organisationId'),
  },
  {
    title: AppConstants.postcode,
    dataIndex: 'postcode',
    key: 'postcode',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.orderId,
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (id) => (
      <NavLink
        to={{
          pathname: `/orderStatus`,
          state: { orderId: id },
        }}
      >
        <span className="input-heading-add-another pt-0">{id}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.paid,
    dataIndex: 'paid',
    key: 'paid',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: paid => <span>{currencyFormat(paid)}</span>,
  },
  {
    title: AppConstants.itemFee,
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: total => <span>{currencyFormat(total)}</span>,
  },
  {
    title: AppConstants.numberOfItems,
    dataIndex: 'quantity',
    key: 'quantity',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.netProfit,
    dataIndex: 'netProfit',
    key: 'netProfit',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: netProfit => <span>{currencyFormat(netProfit)}</span>,
  },
  {
    title: AppConstants.paymentMethod,
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.product,
    dataIndex: 'products',
    key: 'products',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.variant,
    dataIndex: 'variants',
    key: 'variants',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: variants => (variants || []).map(variant => <div>{variant}</div>),
  },
];

class OrderSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      affiliateOrgId: -1,
      postcode: '',
      searchText: '',
      paymentMethod: -1,
      offset: 0,
      sortBy: null,
      sortOrder: null,
    };
    this_obj = this;
  }

  async componentDidMount() {
    let yearId = getGlobalYear() ? getGlobalYear() : '-1';
    let { orderSummaryListingActionObject } = this.props.shopOrderSummaryState;
    this.referenceCalls();
    if (orderSummaryListingActionObject) {
      orderSummaryListingActionObject.params.year = JSON.parse(yearId);
      let params = orderSummaryListingActionObject.params;
      this.props.getOrderSummaryListingAction(params);
      await this.setState({
        offset: params.offset,
        searchText: params.search,
        // yearRefId: params.year,
        yearRefId: JSON.parse(yearId),
        postcode: params.postcode,
        affiliateOrgId: params.affiliate,
        paymentMethod: params.paymentMethod,
        sortOrder: params.order,
        sortBy: params.sorterBy,
      });
    } else {
      this.setState({ yearRefId: JSON.parse(yearId) });
      this.handleTableList(1);
    }
  }

  referenceCalls = () => {
    let organisationUniqueKey = getOrganisationData()
      ? getOrganisationData().organisationUniqueKey
      : null;
    this.props.getAffiliateToOrganisationAction(organisationUniqueKey);
    this.props.getOnlyYearListAction();
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setOrderSummaryListPageSizeAction(pageSize);
  };

  handleTableList = async page => {
    await this.props.setOrderSummaryListPageNumberAction(page);
    let {
      // yearRefId,
      affiliateOrgId,
      postcode,
      searchText,
      paymentMethod,
      sortOrder,
      sortBy,
    } = this.state;
    let yearId = getGlobalYear() ? getGlobalYear() : '-1';
    let { orderSummaryPageSize } = this.props.shopOrderSummaryState;
    orderSummaryPageSize = orderSummaryPageSize ? orderSummaryPageSize : 10;
    let params = {
      limit: orderSummaryPageSize,
      offset: page ? orderSummaryPageSize * (page - 1) : 0,
      search: searchText,
      year: this.state.yearRefId == -1 ? this.state.yearRefId : JSON.parse(yearId),
      postcode: postcode,
      affiliate: affiliateOrgId,
      paymentMethod: paymentMethod,
      order: sortOrder ? sortOrder : '',
      sorterBy: sortBy ? sortBy : '',
    };
    this.props.getOrderSummaryListingAction(params);
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({ yearRefId: value });
      if (value != -1) {
        setGlobalYear(value);
      }
      this.handleTableList(1);
    } else if (key === 'affiliateOrgId') {
      await this.setState({ affiliateOrgId: value });
      this.handleTableList(1);
    } else if (key === 'postcode') {
      // const regex = /,/gi;
      let canCall = false;
      let newVal = value.toString().split(',');
      newVal.forEach(x => {
        if (Number(x.length) % 4 === 0 && x.length > 0) {
          canCall = true;
        } else {
          canCall = false;
        }
      });
      await this.setState({ postcode: value });
      if (canCall) {
        this.handleTableList(1);
      } else if (value.length === 0) {
        this.handleTableList(1);
      }
    } else if (key === 'paymentMethod') {
      await this.setState({ paymentMethod: value });
      this.handleTableList(1);
    }
  };

  // on change search text
  onChangeSearchText = async e => {
    let value = e.target.value;
    await this.setState({ searchText: e.target.value, offset: 0 });
    if (value == null || value == '') {
      this.handleTableList(1);
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    this.setState({ offset: 0 });
    const code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      this.handleTableList(1);
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    this.setState({ offset: 0 });
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      this.handleTableList(1);
    }
  };

  ///////export button on click
  onExport = () => {
    let { yearRefId, affiliateOrgId, postcode, searchText, paymentMethod } = this.state;
    let { orderSummaryCurrentPage } = this.props.shopOrderSummaryState;
    let { orderSummaryPageSize } = this.props.shopOrderSummaryState;
    orderSummaryPageSize = orderSummaryPageSize ? orderSummaryPageSize : 10;
    let params = {
      limit: orderSummaryPageSize,
      offset: orderSummaryCurrentPage ? orderSummaryPageSize * (orderSummaryCurrentPage - 1) : 0,
      search: searchText,
      year: yearRefId,
      postcode: postcode,
      affiliate: affiliateOrgId,
      paymentMethod: paymentMethod,
      order: '',
      sorterBy: '',
    };
    this.props.exportOrderSummaryAction(params);
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4 pt-2 orderSpace">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pt-1 d-flex align-content-center">
              <span className="form-heading">{AppConstants.orderSummary}</span>
            </div>
            <div className="row">
              <div className="col-sm pt-1">
                <div className="d-flex justify-content-end">
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

              <div className="col-sm pt-1">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <Button
                    className="primary-add-comp-form"
                    type="primary"
                    onClick={() => this.onExport()}
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
    );
  };

  dropdownView = () => {
    let affiliateToData = this.props.userState.affiliateTo;
    let uniqueValues = [];
    if (affiliateToData.affiliatedTo != undefined) {
      let obj = {
        organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
        name: getOrganisationData() ? getOrganisationData().name : null,
      };
      uniqueValues.push(obj);
      let arr = [
        ...new Map(affiliateToData.affiliatedTo.map(obj => [obj['organisationId'], obj])).values(),
      ];
      if (isEmptyArray) {
        uniqueValues = [...uniqueValues, ...arr];
      }
    }
    let paymentData = [
      { name: 'Cash', value: 'cash' },
      { name: 'Direct Debit', value: 'direct debit' },
      { name: 'Credit Card', value: 'credit card' },
    ];
    return (
      <div className="comp-player-grades-header-drop-down-view mt-1 order-summ-drop-down-padding order-summary-dropdown-view orderSpace">
        <div className="fluid-width">
          <div className="row reg-filter-row">
            <div className="reg-col col-md-3 col-sm-6">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.year} :</div>
                <Select
                  style={{ minWidth: 160 }}
                  onChange={yearRefId => this.onChangeDropDownValue(yearRefId, 'yearRefId')}
                  value={this.state.yearRefId}
                  className="year-select reg-filter-select"
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-md-3 col-sm-6">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.affiliate} :</div>
                <Select
                  style={{ minWidth: 160 }}
                  className="year-select reg-filter-select"
                  onChange={affiliateOrgId =>
                    this.onChangeDropDownValue(affiliateOrgId, 'affiliateOrgId')
                  }
                  value={this.state.affiliateOrgId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(uniqueValues || []).map(org => (
                    <Option key={'organisation_' + org.organisationId} value={org.organisationId}>
                      {org.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-md-3 col-sm-6">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: 95 }}>
                  {AppConstants.postCode} :
                </div>
                <div style={{ width: '76%' }}>
                  <InputWithHead
                    placeholder={AppConstants.postCode}
                    onChange={e => this.onChangeDropDownValue(e.target.value, 'postcode')}
                    value={this.state.postcode}
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="reg-col col-md-3 col-sm-6 no-padding-right">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.payment} :</div>
                <Select
                  style={{ minWidth: 160 }}
                  onChange={paymentMethod =>
                    this.onChangeDropDownValue(paymentMethod, 'paymentMethod')
                  }
                  value={this.state.paymentMethod}
                  className="year-select reg-filter-select"
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {paymentData.map(item => (
                    <Option key={'payment_' + item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  noOfRegisteredUmpires = () => {
    let { numberOfOrders, valueOfOrders } = this.props.shopOrderSummaryState;
    return (
      <div className="comp-dash-table-view">
        <div>
          <div className="row">
            <div className="col-sm-6">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.numberOfOrders}</div>
                <div className="reg-payment-price-text">{numberOfOrders}</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.valueOfOrders}</div>
                <div className="reg-payment-price-text">{currencyFormat(valueOfOrders)} </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    let {
      onLoad,
      orderSummaryListingData,
      orderSummaryTotalCount,
      orderSummaryCurrentPage,
      orderSummaryPageSize,
    } = this.props.shopOrderSummaryState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={orderSummaryListingData}
            pagination={false}
            rowKey={record => 'orderSummaryListingData' + record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={orderSummaryCurrentPage}
            defaultCurrent={orderSummaryCurrentPage}
            defaultPageSize={orderSummaryPageSize}
            total={orderSummaryTotalCount}
            onChange={page => this.handleTableList(page)}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.shop} menuName={AppConstants.shop} />
        <InnerHorizontalMenu menu="shop" shopSelectedKey="3" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.noOfRegisteredUmpires()}
            {this.contentView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getOrderSummaryListingAction,
      getOnlyYearListAction,
      getAffiliateToOrganisationAction,
      exportOrderSummaryAction,
      setOrderSummaryListPageSizeAction,
      setOrderSummaryListPageNumberAction,
    },
    dispatch,
  );
}

function mapStatToProps(state) {
  return {
    shopOrderSummaryState: state.ShopOrderSummaryState,
    userState: state.UserState,
    appState: state.AppState,
  };
}

export default connect(mapStatToProps, mapDispatchToProps)(OrderSummary);

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Input, Layout, Button, Table, Select, Menu, Pagination, Modal, Form } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { getOnlyYearListAction } from '../../store/actions/appAction';
import {
  getOrderStatusListingAction,
  updateOrderStatusAction,
  getReferenceOrderStatus,
  exportOrderStatusAction,
  setOrderStatusListPageSizeAction,
  setOrderStatusListPageNumberAction,
} from '../../store/actions/shopAction/orderStatusAction';
import { currencyFormat } from '../../util/currencyFormat';
import { getGlobalYear, setGlobalYear } from '../../util/sessionStorage';

const { confirm } = Modal;
const { Content } = Layout;
const { SubMenu } = Menu;
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
  const { yearRefId, searchText, paymentStatus, fulfilmentStatus, product } = this_obj.state;
  const page = this_obj.props.shopOrderStatusState.orderStatusCurrentPage;
  let { orderStatusPageSize } = this_obj.props.shopOrderStatusState;
  orderStatusPageSize = orderStatusPageSize ? orderStatusPageSize : 10;
  const params = {
    limit: orderStatusPageSize,
    offset: page ? orderStatusPageSize * (page - 1) : 0,
    search: searchText,
    year: yearRefId,
    paymentStatus,
    fulfilmentStatus,
    product,
    order: sortOrder || '',
    sorterBy: sortBy || '',
  };
  this_obj.props.getOrderStatusListingAction(params);
}

const columns = [
  {
    title: AppConstants.orderId,
    dataIndex: 'orderId',
    key: 'orderId',
    sorter: true,
    onHeaderCell: () => listeners('id'),

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
    title: AppConstants.bookingId,
    dataIndex: 'courierBookingId',
    key: 'courierBookingId',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.date,
    dataIndex: 'date',
    key: 'date',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('createdOn'),
    render: date => <span>{date ? moment(date).local().format('DD/MM/YYYY') : 'N/A'}</span>,
  },
  {
    title: AppConstants.userId,
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: AppConstants.customer,
    dataIndex: 'customer',
    key: 'customer',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),

    render: (customer, record) => {
      return record.userId ? (
        <NavLink
          to={{
            pathname: `/userPersonal`,
            state: { userId: record.userId, screenKey: 'orderStatus', screen: '/orderStatus' },
          }}
        >
          <span className="input-heading-add-another pt-0">{customer}</span>
        </NavLink>
      ) : (
        <span>{customer}</span>
      );
    },
  },
  {
    title: AppConstants.product,
    dataIndex: 'product',
    key: 'product',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    // CM-1757
    render: (text, record) => <span className="pt-0">{record.products.join(', ')}</span>,
  },
  {
    title: AppConstants.variant,
    dataIndex: 'variants',
    key: 'variants',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: variants => variants.map(variant => <div>{variant}</div>),
  },
  {
    title: AppConstants.itemFee,
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: totalAmount => <span>{currencyFormat(totalAmount)}</span>,
  },
  {
    title: AppConstants.numberOfItems,
    dataIndex: 'quantity',
    key: 'quantity',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.paymentStatus,
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: paymentStatus => (
      <span>{this_obj.getOrderStatus(paymentStatus, 'ShopPaymentStatus')}</span>
    ),
  },
  {
    title: AppConstants.fulfilmentStatus,
    dataIndex: 'fulfilmentStatus',
    key: 'fulfilmentStatus',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: fulfilmentStatus => (
      <span>{this_obj.getOrderStatus(fulfilmentStatus, 'ShopFulfilmentStatusArr')}</span>
    ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: total => <span>{currencyFormat(total)}</span>,
  },
  {
    title: AppConstants.refundedAmount,
    dataIndex: 'refundedAmount',
    key: 'refundedAmount',
    sorter: false,
    render: refundedAmount => <span>{currencyFormat(refundedAmount)}</span>,
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (action, record) => (
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
          <Menu.Item key="1" onClick={() => this_obj.updateOrderStatusApi(record, 2)}>
            <span>{AppConstants.paid}</span>
          </Menu.Item>

          <Menu.Item
            key="2"
            onClick={
              () =>
                this_obj.refundFullAmountConfirm(
                  record,
                ) /* this_obj.updateOrderStatusApi(record, 3) */
            }
          >
            <span>{AppConstants.refundFullAmount}</span>
          </Menu.Item>

          <Menu.Item key="3" onClick={() => this_obj.openPartialRefundModal(record.orderId)}>
            <span>{AppConstants.refundPartialAmount}</span>
          </Menu.Item>

          <Menu.Item key="4" onClick={() => this_obj.updateOrderStatusApi(record, 8)}>
            <span>{AppConstants.pickedUp}</span>
          </Menu.Item>

          {/* <Menu.Item key="5" onClick={() => this_obj.updateOrderStatusApi(record, 5)}>
            <span>{AppConstants.shipped}</span>
          </Menu.Item> */}
        </SubMenu>
      </Menu>
    ),
  },
];

class ShopOrderStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearRefId: null,
      paymentStatus: -1,
      fulfilmentStatus: -1,
      product: -1,
      searchText: props.location.state ? props.location.state.orderId : '',
      offset: 0,
      sortBy: null,
      sortOrder: null,
      partialRefundModalVisible: false,
      partialRefundAmount: 0,
      partialRefundId: null,
    };
    this_obj = this;
  }

  async componentDidMount() {
    const yearId = getGlobalYear() ? getGlobalYear() : '-1';
    const { orderStatusListActionObject } = this.props.shopOrderStatusState;
    this.referenceCalls();
    const {
      // yearRefId,
      searchText,
      paymentStatus,
      fulfilmentStatus,
      product,
    } = this.state;
    let { orderStatusPageSize } = this.props.shopOrderStatusState;
    orderStatusPageSize = orderStatusPageSize ? orderStatusPageSize : 10;
    const params = {
      limit: orderStatusPageSize,
      offset: 0,
      search: searchText,
      year: JSON.parse(yearId),
      paymentStatus,
      fulfilmentStatus,
      product,
      order: '',
      sorterBy: '',
    };
    if (orderStatusListActionObject) {
      params.limit = orderStatusListActionObject.params.limit;
      params.offset = orderStatusListActionObject.params.offset;
      params.search = orderStatusListActionObject.params.search;
      params.year = JSON.parse(yearId);
      params.paymentStatus = orderStatusListActionObject.params.paymentStatus;
      params.fulfilmentStatus = orderStatusListActionObject.params.fulfilmentStatus;
      params.product = orderStatusListActionObject.params.product;
      params.order = orderStatusListActionObject.params.order;
      params.sorterBy = orderStatusListActionObject.params.sorterBy;
      this.props.getOrderStatusListingAction(params);
      await this.setState({
        offset: params.offset,
        searchText: params.search,
        yearRefId: params.year,
        paymentStatus: params.paymentStatus,
        fulfilmentStatus: params.fulfilmentStatus,
        product: params.product,
        order: params.order,
        sorterBy: params.sorterBy,
      });
    } else {
      this.setState({ yearRefId: JSON.parse(yearId) });
      this.props.getOrderStatusListingAction(params);
    }
  }

  referenceCalls = () => {
    this.props.getOnlyYearListAction();
    this.props.getReferenceOrderStatus();
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setOrderStatusListPageSizeAction(pageSize);
  };

  handleTableList = async page => {
    await this.props.setOrderStatusListPageNumberAction(page);
    const { yearRefId, searchText, paymentStatus, fulfilmentStatus, product, sortOrder, sortBy } =
      this.state;
    let { orderStatusPageSize } = this.props.shopOrderStatusState;
    orderStatusPageSize = orderStatusPageSize ? orderStatusPageSize : 10;
    const params = {
      limit: orderStatusPageSize,
      offset: page ? orderStatusPageSize * (page - 1) : 0,
      search: searchText,
      year: yearRefId,
      paymentStatus,
      fulfilmentStatus,
      product,
      order: sortOrder || '',
      sorterBy: sortBy || '',
    };
    this.props.getOrderStatusListingAction(params);
  };

  /// /update order status api call
  updateOrderStatusApi = (record, actionValue) => {
    const payload = {
      orderId: record.orderId || this.state.partialRefundId,
      action: actionValue,
      // amount: record.total,
    };
    if (this.state.partialRefundAmount) {
      payload.amount = this.state.partialRefundAmount;
    }
    this.props.updateOrderStatusAction(payload);
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') {
      await this.setState({ yearRefId: value });
      if (value != -1) {
        setGlobalYear(value);
      }
      this.handleTableList(1);
    } else if (key === 'product') {
      await this.setState({ product: value });
      this.handleTableList(1);
    } else if (key === 'paymentStatus') {
      await this.setState({ paymentStatus: value });
      this.handleTableList(1);
    } else if (key === 'fulfilmentStatus') {
      await this.setState({ fulfilmentStatus: value });
      this.handleTableList(1);
    }
  };

  // on change search text
  onChangeSearchText = async e => {
    const { value } = e.target;
    await this.setState({ searchText: e.target.value, offset: 0 });
    if (value == null || value == '') {
      this.handleTableList(1);
    }
  };

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

  handleTableExport = () => {
    const { yearRefId, searchText, paymentStatus, fulfilmentStatus, product } = this_obj.state;
    const { orderStatusCurrentPage } = this.props.shopOrderStatusState;
    let { orderStatusPageSize } = this_obj.props.shopOrderStatusState;
    orderStatusPageSize = orderStatusPageSize ? orderStatusPageSize : 10;
    const params = {
      limit: orderStatusPageSize,
      offset: orderStatusCurrentPage ? orderStatusPageSize * (orderStatusCurrentPage - 1) : 0,
      search: searchText,
      year: yearRefId,
      paymentStatus,
      fulfilmentStatus,
      product,
      order: '',
      sorterBy: '',
    };

    this.props.exportOrderStatusAction(params);
  };

  headerView = () => (
    <div className="comp-player-grades-header-drop-down-view mt-4 pt-2 orderSpace">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm pt-1 d-flex align-content-center">
            <span className="form-heading">{AppConstants.orderStatus}</span>
          </div>
          <div className="row">
            <div className="col-sm pt-1">
              <div className="d-flex justify-content-end">
                <div className="comp-product-search-inp-width">
                  <Input
                    className="product-reg-search-input"
                    value={this.state.searchText}
                    onChange={this.onChangeSearchText}
                    placeholder="Search..."
                    onKeyPress={this.onKeyEnterSearchText}
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
                  onClick={this.handleTableExport}
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

  onChangeYear(data) {
    this.setState({ year: data.year });
  }

  onChangePaymentStatus(data) {
    this.setState({ paymentStatus: data.paymentStatus });
  }

  onChangefulfilmentStatus(data) {
    this.setState({ fulfilmentStatus: data.fulfilmentStatus });
  }

  // Partial refund modal start
  openPartialRefundModal = id => {
    this.setState({
      partialRefundId: id,
      partialRefundModalVisible: true,
    });
  };

  handleOk = () => {
    this.setState({
      partialRefundModalVisible: false,
    });
    this_obj.updateOrderStatusApi(this.state.partialRefundId, 4);
  };

  onPartialRefundAmountChange = value => {
    this.setState({
      partialRefundAmount: value,
    });
  };

  handleCancel = () => {
    this.setState({
      partialRefundModalVisible: false,
    });
  };

  refundFullAmountConfirm = record => {
    let that = this;
    confirm({
      title: AppConstants.refundFullAmountConfirmation,
      icon: <QuestionCircleOutlined />,
      okText: AppConstants.yes,
      onOk() {
        that.updateOrderStatusApi(record, 3);
      },
    });
  };
  // Partial refund modal end

  dropdownView = () => {
    // const paymentStatusData = [
    //     { name: "Not Paid", value: "not paid" },
    //     { name: "Paid", value: "paid" },
    //     { name: "Refunded", value: "refunded" },
    //     { name: "Partially refunded", value: "partially refunded" },
    // ];
    // const fulfilmentStatusData = [
    //     { name: "To Be Sent", value: "to be sent" },
    //     { name: "Awaiting Pickup", value: "awaiting pickup" },
    //     { name: "In Transit", value: "in transit" },
    //     { name: "Completed", value: "completed" },
    // ];
    const { ShopFulfilmentStatusArr, ShopPaymentStatus } = this.props.shopOrderStatusState;
    return (
      <div className="comp-player-grades-header-drop-down-view mt-1 order-summ-drop-down-padding order-summary-dropdown-view">
        <div className="fluid-width">
          <div className="row reg-filter-row">
            <div className="reg-col col-md-6 col-sm-6">
              <div className="reg-filter-col-cont">
                <div style={{ width: 180 }} className="year-select-heading">
                  {AppConstants.year} :
                </div>
                <Select
                  style={{ minWidth: 160 }}
                  onChange={yearRefId => this.onChangeDropDownValue(yearRefId, 'yearRefId')}
                  value={this.state.yearRefId}
                  className="year-select reg-filter-select mr-3"
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

            <div className="reg-col col-md-6 col-sm-6">
              <div className="reg-filter-col-cont">
                <div style={{ width: 180 }} className="year-select-heading">
                  {AppConstants.product} :
                </div>
                <Select
                  style={{ minWidth: 160 }}
                  onChange={product => this.onChangeDropDownValue(product, 'product')}
                  value={this.state.product}
                  className="year-select reg-filter-select mr-3"
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  <Option key={AppConstants.direct} value={AppConstants.direct}>
                    {AppConstants.direct}
                  </Option>
                </Select>
              </div>
            </div>

            <div className="reg-col col-md-6 col-sm-6">
              <div className="reg-filter-col-cont">
                <div style={{ width: 180 }} className="year-select-heading">
                  {AppConstants.paymentStatus} :
                </div>
                <Select
                  style={{ minWidth: 160 }}
                  onChange={paymentStatus =>
                    this.onChangeDropDownValue(paymentStatus, 'paymentStatus')
                  }
                  value={this.state.paymentStatus}
                  className="year-select reg-filter-select mr-3"
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {ShopPaymentStatus.map(item => (
                    <Option key={`paymentStatus_${item.id}`} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-md-6 col-sm-6">
              <div className="reg-filter-col-cont">
                <div style={{ width: 180 }} className="year-select-heading">
                  {AppConstants.fulfilmentStatus} :
                </div>
                <Select
                  // mode="multiple"
                  className="year-select reg-filter-select mr-3"
                  style={{ minWidth: 160 }}
                  onChange={fulfilmentStatus =>
                    this.onChangeDropDownValue(fulfilmentStatus, 'fulfilmentStatus')
                  }
                  value={this.state.fulfilmentStatus}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {ShopFulfilmentStatusArr.map(item => (
                    <Option key={`fulfilmentStatus_${item.id}`} value={item.id}>
                      {item.description}
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

  contentView = () => {
    const {
      onLoad,
      orderStatusListingData,
      orderStatusTotalCount,
      orderStatusCurrentPage,
      orderStatusPageSize,
    } = this.props.shopOrderStatusState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={orderStatusListingData}
            pagination={false}
            rowKey={record => `orderStatusListingData${record.orderId}`}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            total={orderStatusTotalCount}
            current={orderStatusCurrentPage}
            defaultCurrent={orderStatusCurrentPage}
            defaultPageSize={orderStatusPageSize}
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
        <InnerHorizontalMenu menu="shop" shopSelectedKey="5" />
        <Layout>
          {this.headerView()}
          <Content>
            <Modal
              title={AppConstants.refundPartialAmount}
              visible={this.state.partialRefundModalVisible}
              onFinishFailed={this.onFinishFailed}
              onCancel={this.handleCancel}
              onOk={this.handleOk}
            >
              <Form name="basic" onFinish={this.onFinish}>
                <Form.Item
                  label={AppConstants.amount}
                  name="amount"
                  type="number"
                  onChange={event => this.onPartialRefundAmountChange(event.target.value)}
                  rules={[
                    {
                      required: true,
                      message: AppConstants.pleaseInputAmount,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </Modal>
            {this.dropdownView()}
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
      getOnlyYearListAction,
      getOrderStatusListingAction,
      updateOrderStatusAction,
      getReferenceOrderStatus,
      exportOrderStatusAction,
      setOrderStatusListPageSizeAction,
      setOrderStatusListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    shopOrderStatusState: state.ShopOrderStatusState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopOrderStatus);

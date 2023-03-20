import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Select, Breadcrumb, Form } from 'antd';

import './shop.css';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
// import history from "../../util/history";
import { isArrayNotEmpty } from '../../util/helpers';
import { currencyFormat } from '../../util/currencyFormat';
import {
  getOrderDetailsAction,
  clearOrderStatusReducer,
  updateOrderStatusAction,
} from '../../store/actions/shopAction/orderStatusAction';
import Loader from '../../customComponents/loader';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
// const { confirm } = Modal;

const orderFulfilmentData = [
  { name: 'To Be Sent', value: 'To Be Sent' },
  { name: 'In Transit', value: 'In Transit' },
  { name: 'Complete', value: 'Complete' },
  { name: 'Awaiting Pick Up', value: 'Awaiting Pick Up' },
  { name: 'Picked Up', value: 'Picked Up' },
];

class OrderDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    props.clearOrderStatusReducer('orderDetails');
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.apiCalls();
  }

  apiCalls = () => {
    let orderId = null;
    orderId = this.props.location.state ? this.props.location.state.orderId : null;
    if (orderId) {
      this.props.getOrderDetailsAction(orderId);
    }
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view ant-header-transaparent">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.orderDetails}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  contentView = () => {
    let { orderDetails } = this.props.shopOrderStatusState;
    return (
      <div className="content-view pt-4">
        <div className="d-flex row align-items-center">
          <span className="form-heading pb-0">{AppConstants.order}</span>
          <span className="product-price-text-style ml-2" style={{ fontSize: 22 }}>
            {' # ' + orderDetails.id}
          </span>
        </div>
        {isArrayNotEmpty(orderDetails.sellProducts) &&
          orderDetails.sellProducts.map((item, index) => {
            return (
              <div className="row mt-4" key={'sellProducts' + index}>
                <div className="w-25 d-flex justify-content-center align-items-center ">
                  <img
                    src={
                      isArrayNotEmpty(item.product.images)
                        ? item.product.images[0].url
                        : AppImages.squareImage
                    }
                    className="order-details-product-image"
                    name="image"
                    onError={ev => {
                      ev.target.src = AppImages.squareImage;
                    }}
                    alt=""
                  />
                </div>
                <div className="w-50 d-flex align-items-center order-detail-prd-name-view">
                  <div style={{ flexDirection: 'column' }}>
                    <span className="order-details-desc-text" style={{ lineHeight: 1.54 }}>
                      {item.product.productName}
                    </span>
                    {!!item.sku.skuCode && (
                      <span className="order-details-desc-text" style={{ lineHeight: 1.54 }}>
                        {'SKU: ' + item.sku.skuCode}
                      </span>
                    )}
                    {!!item.sku.barcode && (
                      <span className="order-details-desc-text" style={{ lineHeight: 1.54 }}>
                        {'Barcode: ' + item.sku.barcode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-25 d-flex justify-content-center align-items-center">
                  <span className="order-details-desc-text">{item.sku ? item.quantity : 0}</span>
                  <span className="order-details-desc-text ml-2">{'x'}</span>
                  <span className="order-details-desc-text ml-2">
                    {currencyFormat(item.sku ? item.sku.price : 0)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  ////////billing and address view
  addressView = () => {
    let { orderDetails } = this.props.shopOrderStatusState;
    return (
      <div className="fees-view pt-4">
        <div className="row">
          <div className="col-sm">
            <span className="form-heading">{AppConstants.shippingAndBillingAddress}</span>
          </div>
          {/* <div className="col-sm d-flex justify-content-end">
                        <Button className="primary-add-comp-form" type="primary">
                            {AppConstants.edit}
                        </Button>
                    </div> */}
        </div>
        <div className="row">
          <div className="col-sm">
            
            {!orderDetails.guestFirstName && orderDetails.user && (
              <div className="live-score-title-icon-view">
                {orderDetails.user.firstName && (
                  <span className="order-details-desc-text">{orderDetails.user.firstName}</span>
                )}
                {orderDetails.user.middleName && (
                  <span className="order-details-desc-text ml-2">
                    {orderDetails.user.middleName}
                  </span>
                )}
                {orderDetails.user.lastName && (
                  <span className="order-details-desc-text ml-2">{orderDetails.user.lastName}</span>
                )}
              </div>
            )}
            {orderDetails.guestFirstName && (
              <div className="live-score-title-icon-view">
                {orderDetails.guestFirstName && (
                  <span className="order-details-desc-text">{orderDetails.guestFirstName}</span>
                )}
                {orderDetails.guestLastName && (
                  <span className="order-details-desc-text ml-2">{orderDetails.guestLastName}</span>
                )}
              </div>
            )}
            {orderDetails.address && <span className="order-details-desc-text">{orderDetails.address}</span>}
            {(orderDetails.suburb || orderDetails.postcode) && (
              <span className="order-details-desc-text">
                {(orderDetails.suburb || '') + ' ' + (orderDetails.postcode || '')}
              </span>
            )}
            <span className="order-details-desc-text">{orderDetails.state}</span>
            {/* <div className="live-score-title-icon-view">
                            <div className="order-details-desc-text">
                                <span>{AppConstants.receiptUrl + ":"}</span>
                            </div>
                            <span className="order-details-desc-text ml-3">{"www.receipt.com"}</span>
                        </div> */}
          </div>
          <div className="col-sm">
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.callAnswer} alt="" height="16" width="16" />
              </div>
              <span className="order-details-desc-text ml-3">
                {orderDetails.guestMobileNumber
                  ? orderDetails.guestMobileNumber
                  : orderDetails.user
                  ? orderDetails.user.mobileNumber
                  : 'N/A'}
              </span>
            </div>
            <div className="live-score-title-icon-view">
              <div className="live-score-icon-view">
                <img src={AppImages.email} alt="" height="16" width="16" />
              </div>
              <span className="order-details-desc-text ml-3">
                {orderDetails.guestEmail
                  ? orderDetails.guestEmail
                  : orderDetails.user
                  ? orderDetails.user.email
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  fulfilmentOnChange = value => {
    // let { orderDetails } = this.props.shopOrderStatusState
    // let payload = {
    //     orderId: orderDetails.id,
    //     action: value,
    //     amount: orderDetails.orderGroup ? orderDetails.orderGroup.total : 0
    // }
    // this.props.updateOrderStatusAction(payload)
  };

  ////////order fulfilment view view
  fulfilmentView = () => {
    return (
      <div className="fees-view pt-4">
        <span className="form-heading">{AppConstants.orderFulfilment}</span>
        <Select
          className="shop-type-select mt-2"
          onChange={value => this.fulfilmentOnChange(value)}
          placeholder="Select"
        >
          {orderFulfilmentData.map(item => (
            <Option key={'orderFulfilment_' + item.value} value={item.value}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  //////footer view containing all the buttons
  footerView = () => {
    return (
      <div className="footer-view order-detail-button-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              {/* <Button
                                className="cancelBtnWidth"
                                type="cancel-button"
                                onClick={() => history.push('/listProducts')}>{AppConstants.cancel}</Button> */}
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              {/* <Button className="open-reg-button" type="primary" htmlType="submit">
                                {AppConstants.capturePayment}
                            </Button> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width">
        <DashboardLayout menuHeading={AppConstants.shop} menuName={AppConstants.shop} />
        <InnerHorizontalMenu menu="shop" shopSelectedKey="5" />
        <Layout>
          <Form
            autoComplete="off"
            // onFinish={this.addProductPostAPI}
            noValidate="noValidate"
          >
            <Content>
              {this.headerView()}
              <div className="formView">{this.contentView()}</div>
              <div className="formView">{this.addressView()}</div>
              {/* <div className="formView">{this.fulfilmentView()}</div> */}
            </Content>

            <Loader visible={this.props.shopOrderStatusState.onLoad} />

            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getOrderDetailsAction,
      clearOrderStatusReducer,
      updateOrderStatusAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    shopOrderStatusState: state.ShopOrderStatusState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails);

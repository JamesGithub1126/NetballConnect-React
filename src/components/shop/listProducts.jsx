import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Button, Breadcrumb, Input, Modal, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import './shop.css';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import AppConstants from '../../themes/appConstants';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import ShopSingleProductComponent from '../../customComponents/shopSingleProductComponent';
import {
  getProductListingAction,
  deleteProductAction,
  clearProductReducer,
} from '../../store/actions/shopAction/productAction';
import { isArrayNotEmpty } from '../../util/helpers';

const {
  // Footer,
  Content,
} = Layout;
const { confirm } = Modal;

class ListProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sorterBy: 'productName',
      order: '',
      offset: 0,
      searchText: '',
      limit: 8,
      deleteLoading: false,
    };
  }

  componentDidMount() {
    this.props.clearProductReducer('productListingData');
    window.scrollTo(0, 0);
    const widthWindow = window.innerWidth;
    let windowLimit = Math.round(widthWindow / 270) * 2;
    let limit = windowLimit < 6 ? 6 : windowLimit;
    this.setState({ limit });
    let { sorterBy, order, offset, searchText } = this.state;
    this.props.getProductListingAction(sorterBy, order, offset, searchText, limit);
  }

  componentDidUpdate(nextProps) {
    if (this.props.shopProductState.onLoad === false && this.state.deleteLoading === true) {
      this.setState({
        deleteLoading: false,
      });
      let { sorterBy, order, searchText, limit } = this.state;
      this.setState({ offset: 0 });
      this.props.getProductListingAction(sorterBy, order, 0, searchText, limit);
    }
  }

  //////delete the product
  showDeleteConfirm = id => {
    let this_ = this;
    confirm({
      title: AppConstants.deleteProduct,
      content: AppConstants.deleteProductDescription,
      okText: AppConstants.confirm,
      okType: AppConstants.primary,
      cancelText: AppConstants.cancel,
      onOk() {
        if (id) {
          this_.props.deleteProductAction(id);
          this_.setState({
            deleteLoading: true,
          });
        }
      },
      onCancel() {},
    });
  };

  // on change search text
  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value });
    if (e.target.value === null || e.target.value === '') {
      let { sorterBy, order, limit } = this.state;
      this.setState({ offset: 0 });
      this.props.getProductListingAction(sorterBy, order, 0, e.target.value, limit);
    }
  };

  // search key
  onKeyEnterSearchText = e => {
    var code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      let { sorterBy, order, searchText, limit } = this.state;
      this.setState({ offset: 0 });
      this.props.getProductListingAction(sorterBy, order, 0, searchText, limit);
    }
  };

  // on click of search icon
  onClickSearchIcon = () => {
    if (this.state.searchText === null || this.state.searchText === '') {
    } else {
      let { sorterBy, order, searchText, limit } = this.state;
      this.setState({ offset: 0 });
      this.props.getProductListingAction(sorterBy, order, 0, searchText, limit);
    }
  };

  ///////view for screen heading
  headerView = () => (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.products}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm d-flex align-items-center justify-content-end mr-5">
          <div className="comp-product-search-inp-width">
            <Input
              className="product-reg-search-input"
              onChange={this.onChangeSearchText}
              placeholder="Search..."
              onKeyPress={this.onKeyEnterSearchText}
              prefix={
                <SearchOutlined
                  className="search-prefix-icon-style"
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

  ///dropdown view containing the search view and button
  dropdownView = () => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm">
            <div className="com-year-select-heading-view"></div>
          </div>
          <div
            className="col-sm d-flex align-items-center justify-content-end shop-add-product-btn-div"
            onClick={() => this.props.clearProductReducer('productDetailData')}
          >
            <NavLink to={{ pathname: '/addProduct' }} className="text-decoration-none">
              <Button className="primary-add-product" type="primary">
                + {AppConstants.addAProduct}
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );

  handleShowSizeChange = async (page, pageSize) => {
    await this.setState({ limit: pageSize });
  };

  handlePagination = async (page, pageSize) => {
    await this.setState({ limit: pageSize });
    let offset = page ? pageSize * (page - 1) : 0;
    this.setState({ offset });
    let { sorterBy, order, searchText } = this.state;
    this.props.getProductListingAction(sorterBy, order, offset, searchText, pageSize);
  };

  ////////content view of the screen
  contentView = () => {
    let {
      productListingData,
      productListingTotalCount,
      productListingCurrentPage,
    } = this.props.shopProductState;
    return (
      <div className="comp-dash-table-view mt-4">
        <div
          className="shop-product-content-div"
          style={{ display: productListingData.length < 3 ? 'flex' : 'grid' }}
        >
          {isArrayNotEmpty(productListingData) &&
            productListingData.map((item, index) => (
              <div key={`productListingData${index}`}>
                <ShopSingleProductComponent
                  productItem={item}
                  deleteOnclick={() => this.showDeleteConfirm(item.id)}
                  editOnclick={() => history.push('/addProduct', { id: item.id })}
                  viewOnclick={() => history.push('/addProduct', { id: item.id })}
                />
              </div>
            ))}
        </div>
        <div className="d-flex justify-content-end">
          {isArrayNotEmpty(productListingData) && (
            <Pagination
              className="antd-pagination"
              showSizeChanger
              total={productListingTotalCount}
              pageSize={this.state.limit}
              onChange={(page, pageSize) => this.handlePagination(page, pageSize)}
              current={productListingCurrentPage}
              onShowSizeChange={this.handleShowSizeChange}
            />
          )}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width">
        <DashboardLayout menuHeading={AppConstants.shop} menuName={AppConstants.shop} />
        <InnerHorizontalMenu menu="shop" shopSelectedKey="2" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
          <Loader visible={this.props.shopProductState.onLoad} />
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getProductListingAction,
      deleteProductAction,
      clearProductReducer,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    shopProductState: state.ShopProductState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListProducts);

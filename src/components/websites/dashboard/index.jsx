import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Layout, Breadcrumb, Divider, notification, message } from 'antd';
import { useHistory } from 'react-router-dom';
import AppConstants from '../../../themes/appConstants';
import DashboardLayout from '../../../pages/dashboardLayout';
import Loader from '../../../customComponents/loader';
import {
  getShopCartAction,
  saveShopCartAction,
  getTransactionFeeAction,
  clearTransactionFeeAction,
  getWebsiteProductAction,
} from '../../../store/actions/shopAction/productAction';
import {
  getGlobalYear,
  getOrganisationData,
  setOrganisationData,
} from '../../../util/sessionStorage';
import CreateWebsiteModal from './createWebsiteModal';
import { getAmountWithTax, getTaxPortion } from 'util/helpers';

const { Header, Footer } = Layout;

const websiteProductId = process.env.REACT_APP_WEBSITE_PRODUCT_ID;

const WebsiteDashboard = () => {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);
  //  const [addCartLoad, setAddCartLoad] = useState(false);
  const organisationData = getOrganisationData() || {};
  const { organisationId, organisationUniqueKey, websiteId, name } = organisationData;
  const shopProductState = useSelector(state => state.ShopProductState);
  const userState = useSelector(state => state.UserState);
  const userProfile = userState.userProfile;
  const onOrgLoad = userState.onOrgLoad;
  const { websiteProduct, cartLoad } = shopProductState;
  const history = useHistory();
  useEffect(() => {
    if (websiteId) {
      localStorage.removeItem('shopUniqueKey');
      history.push('/websitesettings');
    } else {
      const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
      getApiInfo(shopUniqueKey);
    }
  }, [websiteId]);

  useEffect(() => {
    if (!websiteProduct) {
      dispatch(getWebsiteProductAction(websiteProductId));
    }
  }, [websiteProduct]);

  const getApiInfo = shopUniqueKey => {
    dispatch(getShopCartAction({ shopUniqueKey }));
  };

  // useEffect(() => {
  //   if (!cartLoad && addCartLoad) {

  //   }
  // }, [cartLoad]);
  const addToCart = (websiteName, domain) => {
    if (websiteProduct) {
      const { price, tax } = websiteProduct;
      const quantity = 1;
      const unitPrice = parseInt(price);
      const product = {
        productId: websiteProduct.id,
        productName: websiteProduct.productName,
        quantity: quantity,
        unitPrice: unitPrice,
        amount: quantity * unitPrice,
        tax: Number((quantity * getTaxPortion(unitPrice, tax)).toFixed(2)),
        totalAmt: Number((quantity * getAmountWithTax(unitPrice, tax)).toFixed(2)),
        organisationId: websiteProduct.organisationUniqueKey,
        skuId: websiteProduct.skuId ? websiteProduct.skuId : 0,
        inventoryTracking: websiteProduct.inventoryTracking,
      };
      if (websiteProduct.images.length > 0) {
        product.productImgUrl = websiteProduct.images[0].url;
      }
      const cartProducts = [product];

      const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
      //setAddCartLoad(true);
      dispatch(saveShopCartAction({ cartProducts, shopUniqueKey }));
      setShowPopup(false);
      const domainName = `${domain.toLowerCase()}.squadi.com`;
      history.push('/websitePayment', { websiteName: websiteName, domainName: domainName });
    } else {
      message.error('website product not found');
      return;
    }
  };

  const headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex bg-transparent align-items-center">
        <Breadcrumb separator=" > ">
          <Breadcrumb.Item className="breadcrumb-add">{AppConstants.websites}</Breadcrumb.Item>
        </Breadcrumb>
      </Header>
    </div>
  );

  const contentView = () => (
    <div className="formView content-view">
      <h1>Get Started!</h1>
      <Divider className="mt-4 mb-4" />
      <p>
        <strong>Package Details</strong>
      </p>
      <p>
        Our Annual Website Package provides you the opportunity to create your own website on your
        own domain using our platform.
      </p>
      <ul>
        <li>News and Content</li>
        <li>Integrated Fixtures, Results and Ladders</li>
        <li>50 GB Storage</li>
      </ul>
      $500.00 + GST / year
      <Divider className="mt-4 mb-4" />
    </div>
  );

  const footerView = () => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm" />
          <div className="col-sm">
            <div className="comp-buttons-view mr-2">
              <Button
                htmlType="submit"
                className="publish-button"
                type="primary"
                onClick={() => {
                  setShowPopup(true);
                }}
              >
                {AppConstants.next}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fluid-width default-bg  page-list">
      <DashboardLayout menuHeading={AppConstants.websites} menuName={AppConstants.websites} />
      <Loader visible={onOrgLoad} />

      <Layout>
        {headerView()}
        <Layout.Content>
          <div className="pt-4 mb-5">
            {contentView()}
            <Footer>{footerView()}</Footer>
          </div>
          <CreateWebsiteModal
            loading={onOrgLoad}
            organisationName={name}
            visible={showPopup}
            onCancel={() => setShowPopup(false)}
            onSubmit={addToCart}
          />
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default WebsiteDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Radio, message, Alert, notification } from 'antd';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import '../../registration/product.scss';
import '../../user/user.css';
// import '../competition/competition.css';
import InnerHorizontalMenu from '../../../pages/innerHorizontalMenu';
import DashboardLayout from '../../../pages/dashboardLayout';
import AppConstants from '../../../themes/appConstants';
import AppImages from '../../../themes/appImages';
import history from '../../../util/history';
import { feeIsNull } from '../../../util/helpers';
import Loader from '../../../customComponents/loader';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getShopCartAction,
  saveShopCartAction,
  getTransactionFeeAction,
  clearTransactionFeeAction,
  getWebsiteProductAction,
} from '../../../store/actions/shopAction/productAction';
import {
  createWebsiteAction,
  createWebsiteDefaultsAction,
  getStrapiTokenAction,
} from '../../../store/actions/strapiAction/strapiAction';
import StripeKeys from '../../stripe/stripeKeys';
import { SecurePaymentOptionRef } from 'enums/registrationEnums';
import {
  getAuthToken,
  getUserId,
  isMissingAuthData,
  getGlobalYear,
  getOrganisationData,
  setOrganisationData,
} from '../../../util/sessionStorage';
import {
  getUserProfileAction,
  saveUserOrganisationAction,
} from '../../../store/actions/userAction/userAction';

const { Content } = Layout;

const stripePromise = loadStripe(StripeKeys.publicKey);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const CheckoutForm = props => {
  const [error, setError] = useState(null);
  const [selectedPaymentOption, setUser] = useState({
    cash: false,
    direct: false,
    credit: false,
    selectedOption: 0,
  });
  const [disabled, setDisabled] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  let paymentOptions = props.paymentOptions;
  let payload = props.payload;
  let shopUniqueKey = props.shopUniqueKey;
  let totalVal = feeIsNull(props.total?.targetValue);
  const hideLoading = () => {
    setDisabled(false);
    const card = elements.getElement(CardElement);
    if (card) card.update({ disabled: false });
    props.onLoad(false);
  };
  const handleChangeCard = async event => {
    if (event.error) {
      setError(event.error.message);
    } else {
      if (event.complete) {
        if (elements) {
          const card = elements.getElement(CardElement);
          if (card != undefined) {
            const cardToken = await stripe.createToken(card);
            if (cardToken.token == undefined) {
              message.error(cardToken?.error?.message);
              setError(cardToken?.error?.message);
            } else if (cardToken.token != undefined) {
              const country = cardToken.token.card.country;
              const brand = cardToken.token.card.brand;
              const data = {
                paymentType: selectedPaymentOption.selectedOption,
                country: country,
                brand: brand,
                targetAmount: props.total.total,
                organisationUniqueKey: payload.cartProducts[0].organisationId, //first product's org id
              };
              props.setCurrentStripeDetails(data);
              props.getTransactionFeeAction(data);
              setDisabled(false);
            }
          }
        }
      } else {
        //clearTransactionFeeAction();
        setDisabled(true);
      }

      setError(null);
    }
  };

  const changePaymentOption = (e, key) => {
    if (key === 'direct') {
      setUser({
        ...selectedPaymentOption,
        direct: true,
        cash: false,
        credit: false,
        cashDirect: false,
        cashCredit: false,
        selectedOption: 'direct_debit',
      });
    } else if (key === 'cash') {
      setUser({
        ...selectedPaymentOption,
        direct: false,
        cash: true,
        credit: false,
        cashDirect: false,
        cashCredit: false,
        selectedOption: '',
      });
    } else if (key == 'cash_direct_debit') {
      setUser({
        ...selectedPaymentOption,
        direct: false,
        cash: true,
        credit: false,
        cashDirect: true,
        cashCredit: false,
        selectedOption: 'cash_direct_debit',
      });
    } else if (key == 'cash_card') {
      setUser({
        ...selectedPaymentOption,
        direct: false,
        cash: true,
        credit: false,
        cashDirect: false,
        cashCredit: true,
        selectedOption: 'cash_card',
      });
    } else {
      setUser({
        ...selectedPaymentOption,
        direct: false,
        cash: false,
        credit: true,
        cashDirect: false,
        cashCredit: false,
        selectedOption: 'card',
      });
    }
  };

  // Handle form submission.
  const handleSubmit = async event => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    const { organisationUniqueKey } = getOrganisationData() || {};
    setDisabled(true);
    const card = elements.getElement(CardElement);
    if (card || props.total.targetValue == 0) {
      if (card) {
        card.update({ disabled: true });
        props.onLoad(true);
        const result = await stripe.createToken(card);
        if (result.error) {
          let message = result.error.message;
          // Inform the user if there was an error.
          setError(message);
          hideLoading();
        } else {
          setError(null);
          // Send the token to your server.
          props.onLoad(true);
          stripeTokenHandler(
            result.token,
            props,
            selectedPaymentOption.selectedOption,
            payload,
            shopUniqueKey,
            organisationUniqueKey,
            hideLoading,
            card,
            setDisabled,
          );
        }
      } else if (props.total.targetValue === 0) {
        props.onLoad(true);
        stripeTokenHandler(
          null,
          props,
          selectedPaymentOption.selectedOption,
          payload,
          shopUniqueKey,
          organisationUniqueKey,
          hideLoading,
          null,
          setDisabled,
        );
      }
    } else {
      if (paymentOptions.length > 0) {
        message.config({
          maxCount: 1,
          duration: 0.9,
        });
        message.error(AppConstants.selectedPaymentOption);
      }
      setDisabled(false);
      hideLoading();
    }
  };

  return (
    <div>
      <form id="my-form" className="form" onSubmit={handleSubmit}>
        {!!paymentOptions && paymentOptions.length > 0 && totalVal > 0 ? (
          <div className="pt-5">
            {(paymentOptions || []).map((pay, pIndex) => (
              <div key={pay.securePaymentOptionRefId}>
                {pay.securePaymentOptionRefId === SecurePaymentOptionRef.Card && (
                  <div className="row">
                    <div className="col-sm">
                      <Radio
                        key={'1'}
                        onChange={e => changePaymentOption(e, 'credit')}
                        className="payment-type-radio-style"
                        checked={selectedPaymentOption.credit}
                      >
                        {AppConstants.creditCard}
                      </Radio>
                      {selectedPaymentOption.credit == true && (
                        <>
                          <div className="pt-5">
                            <CardElement
                              id="card-element"
                              options={CARD_ELEMENT_OPTIONS}
                              onChange={handleChangeCard}
                              className="StripeElement"
                            />
                            {error && (
                              <div className="card-errors" role="alert">
                                {error}
                              </div>
                            )}
                            <div style={{ marginTop: '5px', fontSize: '14px' }}>
                              {AppConstants.creditCardMsg}
                            </div>
                          </div>
                          <div className="mt-5">
                            <Alert
                              description={AppConstants.defaultPaymentMethodWarningMsg}
                              type="warning"
                              showIcon
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="content-view pt-5 secure-payment-msg">
            {AppConstants.securePaymentMsg}
            <div style={{ fontWeight: 'bold' }}>
              {AppConstants.submitCompletePurchaseDescription}
            </div>
          </div>
        )}
        <div className="mt-5">
          <div style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                disabled={disabled}
                style={{ textTransform: 'uppercase' }}
                className="open-reg-button"
                htmlType="submit"
                type="primary"
              >
                {AppConstants.submit}
              </Button>
            </div>
          </div>
        </div>
         <div className="mt-5 bold-warning">{AppConstants.websitePaymentInfo}</div>
      </form>
    </div>
  );
};

const WebsitePayment = props => {
  const dispatch = useDispatch();
  const shopProductState = useSelector(state => state.ShopProductState);
  const strapiJWTToken = useSelector(state => state.StrapiReducerState.token);
  const strapiOnLoad = useSelector(state => state.StrapiReducerState.onLoad);
  const [userId, setUserId] = useState(null);
  const [onLoad, setOnLoad] = useState(false);
  const [total, setTotal] = useState({
    gst: 0,
    total: 0,
    shipping: 0,
    subTotal: 0,
    targetValue: 0,
    transactionFee: 0,
  });

  const organisationData = getOrganisationData() || {};
  const { organisationId, organisationUniqueKey, websiteId, name } = organisationData;
  const yearRefId = getGlobalYear() ? getGlobalYear() : localStorage.getItem('yearId');
  const [websiteDetail, setWebsiteDetail] = useState({
    websiteName: props.location.state ? props.location.state.websiteName : null,
    domainName: props.location.state ? props.location.state.domainName : null,
  });

  const [currentStripeDetails, setCurrentStripeDetails] = useState({});

  useEffect(() => {
    const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
    getApiInfo(shopUniqueKey);
  }, []);

  useEffect(() => {
    const userid = getUserId();
    setUserId(userid);
  }, []);

  useEffect(() => {
    const {
      cart: { cartProducts },
    } = props.shopProductState;
    const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
    let loginstate = props.loginstate;
    if (loginstate.onLoad == false) {
      if (loginstate.status == 1 && getAuthToken()) {
        props.saveShopCartAction({ cartProducts, shopUniqueKey });
      }
    }
  }, [props.loginstate]);

  useEffect(() => {
    const {
      cart: { cartProducts },
    } = props.shopProductState;
    const newTotal = {};
    newTotal.total = cartProducts.reduce((sum, item) => sum + item.totalAmt, 0);
    newTotal.targetValue = newTotal.total + feeIsNull(props.shopProductState.transactionFee);
    setTotal({
      ...total,
      transactionFee: feeIsNull(props.shopProductState.transactionFee),
      targetValue: newTotal.targetValue,
    });
  }, [props.shopProductState.transactionFee]);

  useEffect(() => {
    const {
      cart: { cartProducts },
    } = props.shopProductState;
    const newTotal = {};
    newTotal.total = feeIsNull(cartProducts.reduce((sum, item) => sum + item.totalAmt, 0));
    newTotal.subTotal = feeIsNull(cartProducts.reduce((sum, item) => sum + item.amount, 0));
    newTotal.shipping = 0;
    newTotal.gst = feeIsNull(cartProducts.reduce((sum, item) => sum + item.tax, 0));
    newTotal.transactionFee = 0;
    newTotal.targetValue = feeIsNull(newTotal.total + newTotal.transactionFee);
    setTotal(newTotal);
    if (currentStripeDetails.paymentType) {
      props.getTransactionFeeAction({ ...currentStripeDetails, targetAmount: newTotal.total });
    }
  }, [props.shopProductState.cart.cartProducts]);

  const getApiInfo = shopUniqueKey => {
    props.getShopCartAction({ shopUniqueKey });
    props.clearTransactionFeeAction();
  };

  const userState = useSelector(state => state.UserState);
  const userProfile = userState.userProfile;
  const onOrgLoad = userState.onOrgLoad;
  //create website section
  useEffect(() => {
    if (!userState.isProfileLoaded) {
      dispatch(getUserProfileAction());
    }

    if (!strapiJWTToken) {
      dispatch(getStrapiTokenAction());
    }

    if (websiteId) {
      history.push('/websitesettings');
    }
  }, [strapiJWTToken, websiteId]);

  const popupNotificationWithIcon = type => {
    notification[type]({
      message: AppConstants.websiteCreateNotificationTitle,
      description: AppConstants.websiteCreateNotificationBody,
    });
  };

  const handleUpdateUserOrganisation = useCallback(
    websiteId => {
      dispatch(
        saveUserOrganisationAction(organisationId, { websiteId }, async userOrganisationData => {
          let userOrgData = userOrganisationData.find(x => x.organisationId == organisationId);
          if (userOrgData) {
            await setOrganisationData(userOrgData);
          }
          popupNotificationWithIcon('success');
          history.push('/websitesettings');
        }),
      );
    },
    [dispatch],
  );

  const handleCreateSiteDefaults = useCallback(
    websiteId => {
        let adminUrl = process.env.REACT_APP_URL_WEB_COMP_ADMIN;
        let registrationUrl = process.env.REACT_APP_URL_WEB_USER_REGISTRATION;

        const payload = {
        strapi_auth_token: strapiJWTToken,
        organisationUniqueKey,
        yearRefId,
        admin_login_url: adminUrl,
        user_login_url: registrationUrl,
      };

      dispatch(
        createWebsiteDefaultsAction({
          websiteId,
          payload,
          onSuccess: () => handleUpdateUserOrganisation(websiteId),
        }),
      );
    },
    [strapiJWTToken, organisationUniqueKey, yearRefId],
  );

  const onPaymentSuccess = () => {
    let websiteName = websiteDetail.websiteName;
    let domainName = websiteDetail.domainName;
    dispatch(
      createWebsiteAction({
        strapi_auth_token: strapiJWTToken,
        name: websiteName,
        domain: domainName,
        owner_is: userProfile.email,
        posts: [],
        page_templates: [],
        template: 1,
        site_setting: [],
        web_pages: [],
        site_menus: [],
        onSuccess: handleCreateSiteDefaults,
      }),
    );
  };

  // end create website section
  // const removeProductFromCart = async index => {
  //   const {
  //     cart: { cartProducts: products },
  //   } = props.shopProductState;
  //   const cartProducts = products.filter((elem, elemIndex) => elemIndex !== index);
  //   const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
  //   await props.saveShopCartAction({ cartProducts, shopUniqueKey });
  //   if (cartProducts.length === 0) {
  //     Modal.warning({
  //       title: AppConstants.addSomeProductsFromTheShop,
  //       okText: AppConstants.goToShop,
  //       onOk: () => {
  //         history.push('/shop');
  //       },
  //     });
  //   }
  // };

  const back = () => {
    history.push('/websiteDashboard');
  };

  const contentView = () => {
    return (
      <div className="row" style={{ margin: 0 }}>
        {paymentLeftView()}
        {paymentRightView()}
      </div>
    );
  };

  const paymentLeftView = () => {
    const {
      cart,
      cart: { securePaymentOptions },
    } = props.shopProductState;
    const shopUniqueKey = localStorage.getItem('shopUniqueKey') || null;
    const isLoggedIn = !isMissingAuthData();

    return (
      <div className="col-sm-12 col-md-7 col-lg-8 p-0" style={{ marginBottom: 23 }}>
        <div className="product-left-view outline-style mt-0 pb-5">
          <div className="product-text-common" style={{ fontSize: 22 }}>
            {AppConstants.securePaymentOptions}
          </div>
          <div>
            {isLoggedIn && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  onLoad={status => setOnLoad(status)}
                  paymentOptions={securePaymentOptions}
                  payload={cart}
                  total={total}
                  shopUniqueKey={shopUniqueKey}
                  getTransactionFeeAction={props.getTransactionFeeAction}
                  setCurrentStripeDetails={value => setCurrentStripeDetails(value)}
                  onPaymentSuccess={onPaymentSuccess}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    );
  };

  const paymentRightView = () => {
    return (
      <div className="col-lg-4 col-md-4 col-sm-12 product-right-view px-0 m-0">
        {yourOrderView()}
        {buttonView()}
      </div>
    );
  };

  const yourOrderView = () => {
    const {
      cart: { cartProducts },
    } = props.shopProductState;

    return (
      <div className="outline-style shop-order-style" style={{ padding: '36px 36px 22px 20px' }}>
        <div className="product-text-common" style={{ fontSize: 21 }}>
          {AppConstants.yourOrder}
        </div>
        {cartProducts.map((shop, index) => (
          <div
            key={index}
            className="product-text-common"
            style={{
              display: 'flex',
              fontWeight: 500,
              borderBottom: '1px solid var(--app-e1e1f5)',
              borderTop: '1px solid var(--app-e1e1f5)',
            }}
          >
            <div
              className="alignself-center pt-2"
              style={{ marginRight: 'auto', display: 'flex', marginTop: '12px', padding: '8px' }}
            >
              <div>
                <img
                  style={{ width: '50px' }}
                  src={shop.productImgUrl ? shop.productImgUrl : AppImages.userIcon}
                />
              </div>
              <div style={{ marginLeft: '6px', fontFamily: 'inter-medium' }}>
                <div>{shop.productName}</div>
                <div>
                  {shop.optionName && `(${shop.optionName}) `}
                  {AppConstants.qty} : {shop.quantity}
                </div>
              </div>
            </div>
            <div className="alignself-center pt-5" style={{ fontWeight: 600, marginRight: 10 }}>
              ${shop.totalAmt ? shop.totalAmt.toFixed(2) : '0.00'}
            </div>
            {/* <div style={{ paddingTop: 26 }} onClick={() => removeProductFromCart(index)}>
              <span className="user-remove-btn pointer">
                <img src={AppImages.removeIcon} />
              </span>
            </div> */}
          </div>
        ))}
        <div style={{ borderBottom: '1px solid var(--app-e1e1f5)', marginTop: '-5px' }}>
          <div className="product-text-common mt-10 mr-4 font-w600" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.subTotal}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total.subTotal.toFixed(2)}
            </div>
          </div>
          <div className="product-text-common-light mt-10 mr-4" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.shipping}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total.shipping.toFixed(2)}
            </div>
          </div>
          <div className="product-text-common-light mt-10 mr-4" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.gst}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total.gst.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--app-e1e1f5)' }}>
          <div className="product-text-common mt-10 mr-4 font-w600" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.total}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total.total.toFixed(2)}
            </div>
          </div>
          <div className="product-text-common-light mt-10 mr-4" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.transactionFee}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total.transactionFee.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="product-text-common mt-10 mr-4 font-w600" style={{ display: 'flex' }}>
          <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
            {AppConstants.totalPaymentDue}
          </div>
          <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
            ${total.targetValue.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  const buttonView = () => {
    return (
      <div style={{ marginTop: 23 }}>
        <div style={{ marginTop: 23 }}>
          <Button
            className="back-btn-text"
            style={{ boxShadow: '0px 1px 3px 0px', width: '100%', textTransform: 'uppercase' }}
            onClick={back}
          >
            {AppConstants.back}
          </Button>
        </div>
      </div>
    );
  };

  const { cartLoad } = props.shopProductState;
  let showLoader = onLoad || cartLoad || strapiOnLoad || onOrgLoad;

  return (
    <div className="fluid-width" style={{ backgroundColor: '#f7fafc' }}>
      <DashboardLayout menuHeading={''} menuName={AppConstants.home} />
      <InnerHorizontalMenu />
      <Layout className="layout-margin">
        <Content>
          <div>{contentView()}</div>
          <Loader visible={showLoader} />
        </Content>
      </Layout>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getShopCartAction,
      saveShopCartAction,
      getTransactionFeeAction,
      clearTransactionFeeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    shopProductState: state.ShopProductState,
    loginstate: state.LoginState,
  };
}

// POST the token ID to your backend.
async function stripeTokenHandler(
  token,
  props,
  selectedOption,
  payload,
  shopUniqueKey,
  organisationUniqueKey,
  hideLoading,
  card,
  setDisabled,
) {
  //console.log('props = ', props);
  //console.log('payload = ', payload);
  const { cartProducts } = payload;
  const { total } = props;
  let paymentType = selectedOption;
  console.log('send shop payment request');
  const url = '/api/shop/payment';

  let body;
  if (paymentType === 'card') {
    let stripeToken = token.id;
    body = {
      payload: {
        cartProducts,
        total,
      },
      shopUniqueKey,
      paymentType,
      token: {
        id: stripeToken,
      },
      buyerOrganisationId: organisationUniqueKey,
    };
  } else if (total.targetValue == 0) {
    body = {
      payload: {
        cartProducts,
        total,
      },
      shopUniqueKey,
      paymentType: null,
      buyerOrganisationId: organisationUniqueKey,
    };
  }
  //console.log('body' + JSON.stringify(body));
  props.onLoad(true);
  return await new Promise((resolve, reject) => {
    fetch(`${StripeKeys.apiShopUrl + url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.token,
      },
      body: JSON.stringify(body),
    })
      .then(response => {
        let resp = response.json();
        // console.log(response.status, 'status', paymentType);
        resp
          .then(async Response => {
            //console.log('Response', Response);
            if (response.status === 200) {
              if (paymentType == 'card') {
                message.success(Response.message);
                props.onPaymentSuccess();
              } else {
                props.onPaymentSuccess();
              }
            } else if (response.status === 212) {
              hideLoading();
              message.error(Response.message);
            } else if (response.status === 400) {
              hideLoading();
              message.error(Response.message);
            } else {
              hideLoading();
              message.error(AppConstants.somethingWentWrongErrorMsg);
            }
          })
          .catch(error => {
            console.log('500', error);
            hideLoading();
            message.error(AppConstants.somethingWentWrongErrorMsg);
          });
      })
      .catch(error => {
        hideLoading();
        message.error(AppConstants.somethingWentWrongErrorMsg);
      });
  })
    .then(data => {
      hideLoading();
      console.log('then data in stripeTokenHandler ');
    })
    .catch(data => {
      hideLoading();
      console.log('Error in stripeTokenHandler');
      message.error(AppConstants.somethingWentWrongErrorMsg);
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(WebsitePayment);

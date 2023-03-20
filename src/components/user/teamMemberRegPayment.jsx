import React, { useState, Component } from 'react';
import {
  Layout,
  // Select,
  Button,
  // Input,
  Radio,
  Form,
  message,
  Modal,
} from 'antd';
// import moment from 'moment';
// import InputWithHead from "../../customComponents/InputWithHead";
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import {
  updateReviewInfoAction,
  getTeamMembersReviewAction,
} from '../../store/actions/userAction/userAction';
// import ValidationConstants from "../../themes/validationConstant";
// import AppImages from "../../themes/appImages";
import { connect } from 'react-redux';
// import { NavLink } from "react-router-dom";
import { bindActionCreators } from 'redux';
import history from '../../util/history';
import { isArrayNotEmpty } from '../../util/helpers';
import Loader from '../../customComponents/loader';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
  AuBankAccountElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeKeys from '../stripe/stripeKeys';

const stripePromise = loadStripe(StripeKeys.publicKey);
const {
  // Header,
  // Footer,
  Content,
} = Layout;
// const { Option } = Select;
// const { TextArea } = Input;

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
const AU_BANK_ACCOUNT_STYLE = {
  base: {
    color: '#32325d',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4',
    },
    ':-webkit-autofill': {
      color: '#32325d',
    },
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a',
    ':-webkit-autofill': {
      color: '#fa755a',
    },
  },
};
const AU_BANK_ACCOUNT_ELEMENT_OPTIONS = {
  style: AU_BANK_ACCOUNT_STYLE,
  disabled: false,
  hideIcon: false,
  iconStyle: 'default', // or "solid"
};

var screenProps = null;

const CheckoutForm = props => {
  const [error, setError] = useState(null);
  const [bankError, setBankError] = useState(null);
  // const [name, setName] = useState(null);
  // const [email, setEmail] = useState(null);
  // const [bankResult, setBankResult] = useState(false);
  const [clientSecretKey, setClientKey] = useState('');
  const [regId, setRegId] = useState('');
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
  let isSchoolRegistration = props.isSchoolRegistration;
  let isHardshipEnabled = props.isHardshipEnabled;
  let payload = props.payload;
  let teamMemberRegId = props.teamMemberRegId;
  let registrationId = props.registrationId;
  let mainProps = props.mainProps;
  let totalPrice = 0;
  if (payload) {
    if (payload.total && payload.total.targetValue) {
      totalPrice = parseFloat(payload.total.targetValue);
    }
  }
  // Handle real-time validation errors from the card Element.

  const handleChange = async event => {
    if (event.error) {
      setError(event.error.message);
    } else {
      if (event.complete) {
        if (elements) {
          const card = elements.getElement(CardElement);
          if (card != undefined) {
            console.log('card', card);
            const cardToken = await stripe.createToken(card);
            if (cardToken.token == undefined) {
              message.error(cardToken?.error?.message);
              setError(cardToken?.error?.message);
            } else if (cardToken.token != undefined) {
              const country = cardToken.token.card.country;
              const brand = cardToken.token.card.brand;
              if (country != 'AU') {
                if (brand == 'American Express') {
                  mainProps.updateReviewInfoAction(1, 'International_AE', 0, 'total', null);
                } else {
                  mainProps.updateReviewInfoAction(1, 'International_CC', 0, 'total', null);
                }
              } else {
                mainProps.updateReviewInfoAction(1, 'DOMESTIC_CC', 0, 'total', null);
              }
            }
          }
        }
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
      // mainProps.updateReviewInfoAction(1, "direct_debit", 0, "total",null);
      // setTimeout(() =>{
      //     stripeTokenHandler("", props, 'direct_debit', setClientKey, setRegId, payload, registrationUniqueKey,1);
      // },100);
    } else {
      setClientKey('');
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
    setDisabled(true);
    event.preventDefault();
    console.log('clientSecretKey', clientSecretKey);
    console.log(event);
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    console.log(event.target);
    const auBankAccount = elements.getElement(AuBankAccountElement);
    const card = elements.getElement(CardElement);
    console.log(auBankAccount, card);
    if (auBankAccount || card || props.payload.total.targetValue == 0) {
      if (card && !auBankAccount) {
        const result = await stripe.createToken(card);
        props.onLoad(true);
        if (result.error) {
          let message = result.error.message;
          // Inform the user if there was an error.
          setError(message);
          props.onLoad(false);
        } else {
          setError(null);
          // Send the token to your server.
          console.log('Result1', result);
          registrationCapValidate(
            result.token,
            props,
            selectedPaymentOption.selectedOption,
            null,
            null,
            payload,
            teamMemberRegId,
            registrationId,
            1,
          );
        }
      } else if (auBankAccount) {
        props.onLoad(true);
        console.log('clientSecretKey', clientSecretKey);

        mainProps.updateReviewInfoAction(1, 'direct_debit', 0, 'total', null);
        setTimeout(() => {
          registrationCapValidate(
            '',
            props,
            'direct_debit',
            setClientKey,
            setRegId,
            payload,
            teamMemberRegId,
            registrationId,
            1,
            auBankAccount,
            setBankError,
            stripe,
            card,
            setError,
          );
        }, 100);
      } else if (props.payload.total.targetValue == 0) {
        props.onLoad(true);
        registrationCapValidate(
          null,
          props,
          selectedPaymentOption.selectedOption,
          null,
          null,
          payload,
          teamMemberRegId,
          registrationId,
          1,
        );
      }
    } else {
      if (paymentOptions.length > 0 && !isSchoolRegistration && !isHardshipEnabled) {
        message.config({
          maxCount: 1,
          duration: 0.9,
        });
        message.error(AppConstants.selectedPaymentOption);
      }
    }
    setDisabled(false);
  };

  return (
    <div>
      <form id="my-form" className="form" onSubmit={handleSubmit}>
        {paymentOptions.length > 0 &&
        !isSchoolRegistration &&
        !isHardshipEnabled &&
        totalPrice > 0 ? (
          <div className="pt-5">
            {(paymentOptions || []).map((pay, pIndex) => (
              <div>
                {pay.securePaymentOptionRefId == 2 && (
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
                        <div className="pt-5">
                          <CardElement
                            id="card-element"
                            options={CARD_ELEMENT_OPTIONS}
                            onChange={handleChange}
                            className="StripeElement"
                          />
                          {error && (
                            <div className="card-errors" role="alert">
                              {error}
                            </div>
                          )}
                          <div style={{ marginTop: '5px' }}>{AppConstants.creditCardMsg}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {pay.securePaymentOptionRefId == 1 && (
                  <div className="row">
                    <div className="col-sm">
                      <Radio
                        key={'2'}
                        className="payment-type-radio-style"
                        onChange={e => changePaymentOption(e, 'direct')}
                        checked={selectedPaymentOption.direct}
                      >
                        {AppConstants.directDebit}
                      </Radio>
                      {selectedPaymentOption.direct == true && (
                        <div className="pt-5">
                          <div class="sr-root">
                            <div class="sr-main">
                              <div class="sr-combo-inputs-row">
                                <div class="col">
                                  <label htmlFor="au-bank-account-element">Bank Account</label>
                                  <div id="au-bank-account-element">
                                    <AuBankAccountElement
                                      id="au-bank-account-element"
                                      options={AU_BANK_ACCOUNT_ELEMENT_OPTIONS}
                                      className="StripeElement"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div id="bank-name"></div>
                              <div id="error-message" className=" pl-4 card-errors" role="alert">
                                {bankError}
                              </div>
                              <div class="col pt-3" id="mandate-acceptance">
                                {AppConstants.stripeMandate1}
                                <a
                                  href="https://stripe.com/au-becs-dd-service-agreement/legal"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Direct Debit Request service agreement
                                </a>
                                {AppConstants.stripeMandate2}
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop: '10px', padding: '0 15px 20px 0' }}>
                            {AppConstants.directDebitMsg}
                          </div>
                        </div>
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
          </div>
        )}
        <div className="mt-5">
          <div style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {/* {(paymentOptions.length > 0 || isSchoolRegistration == 1 || isHardshipEnabled == 1) ? */}
              <Button
                disabled={disabled}
                style={{ textTransform: 'uppercase' }}
                className="open-reg-button"
                htmlType="submit"
                type="primary"
              >
                {AppConstants.submit}
              </Button>
              {/* : null} */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

class TeamMemberRegPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamMemberRegId: this.props.location.state ? this.props.location.state.teamMemberRegId : null,
      team: this.props.location.state ? this.props.location.state.team : null,
      registrationCapModalVisible: false,
      registrationCapValidationMessage: null,
      onLoad: false,
      // registrationId: "d011b947-9d84-4566-b693-d40b239c19f7",
      // teamMemberRegId: "326fd356-6c3e-4a24-80f6-a4ef0a307968",
    };
  }

  componentDidMount() {
    this.getApiInfo();
  }

  componentDidUpdate() {}

  getApiInfo = () => {
    let payload = {
      registrationId: this.state.team.registrationUniqueKey,
      teamMemberRegId: this.state.teamMemberRegId,
    };
    this.props.getTeamMembersReviewAction(payload);
  };

  back = () => {
    try {
      history.push('/addTeamMember', {
        teamMemberRegId: this.state.teamMemberRegId,
        registrationTeam: this.state.team,
      });
    } catch (ex) {
      console.log('Error in back::' + ex);
    }
  };

  getPaymentOptionText = (paymentOptionRefId, isTeamRegistration) => {
    let paymentOptionTxt =
      paymentOptionRefId == 1
        ? isTeamRegistration == 1
          ? AppConstants.payEachMatch
          : AppConstants.oneMatchOnly
        : paymentOptionRefId == 2
        ? AppConstants.gameVoucher
        : paymentOptionRefId == 3
        ? AppConstants.allMatches
        : paymentOptionRefId == 4
        ? AppConstants.firstInstalment
        : paymentOptionRefId == 5
        ? AppConstants.schoolRegistration
        : '';

    return paymentOptionTxt;
  };

  paymentLeftView = () => {
    const { teamMemberRegReviewList } = this.props.userState;
    let securePaymentOptions = teamMemberRegReviewList
      ? teamMemberRegReviewList.securePaymentOptions
      : [];
    let isSchoolRegistration = teamMemberRegReviewList
      ? teamMemberRegReviewList.isSchoolRegistration
      : 0;
    let isHardshipEnabled = teamMemberRegReviewList ? teamMemberRegReviewList.isHardshipEnabled : 0;
    return (
      <div className="col-sm-12 col-md-7 col-lg-8 p-0" style={{ marginBottom: 23 }}>
        <div className="product-left-view outline-style mt-0">
          <div className="d-flex">
            <div className="product-text-common" style={{ fontSize: 22 }}>
              {AppConstants.securePaymentOptions}
            </div>
            <div
              className="orange-action-txt margin-left-auto"
              style={{ fontSize: 16 }}
              onClick={() => this.back()}
            >
              {AppConstants.edit}
            </div>
          </div>
          <div>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                onLoad={status => this.setState({ onLoad: status })}
                paymentOptions={securePaymentOptions}
                payload={teamMemberRegReviewList}
                registrationId={this.state.team.registrationUniqueKey}
                teamMemberRegId={this.state.teamMemberRegId}
                isSchoolRegistration={isSchoolRegistration}
                isHardshipEnabled={isHardshipEnabled}
                mainProps={this.props}
                registrationCapModalVisible={status =>
                  this.setState({ registrationCapModalVisible: status })
                }
                registrationCapValidationMessage={error =>
                  this.setState({ registrationCapValidationMessage: error })
                }
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  };

  yourOrderView = () => {
    const { teamMemberRegReviewList } = this.props.userState;
    let compParticipants =
      teamMemberRegReviewList != null
        ? isArrayNotEmpty(teamMemberRegReviewList.compParticipants)
          ? teamMemberRegReviewList.compParticipants
          : []
        : [];
    let total = teamMemberRegReviewList != null ? teamMemberRegReviewList.total : null;
    // let shopProducts = teamMemberRegReviewList != null ? isArrayNotEmpty(teamMemberRegReviewList.shopProducts) ? teamMemberRegReviewList.shopProducts : [] : [];
    return (
      <div className="outline-style " style={{ padding: '36px 36px 22px 20px' }}>
        <div className="product-text-common" style={{ fontSize: 21 }}>
          {AppConstants.yourOrder}
        </div>
        {(compParticipants || []).map((item, index) => {
          // let paymentOptionTxt = this.getPaymentOptionText(item.selectedOptions.paymentOptionRefId, item.isTeamRegistration)
          return (
            <div style={{ paddingBottom: 12 }} key={item.participantId}>
              {item.isTeamRegistration == 1 ? (
                <div className="inter-medium-w500" style={{ marginTop: '17px' }}>
                  {item.teamName + ' - ' + item.competitionName}
                </div>
              ) : (
                <div className="inter-medium-w500" style={{ marginTop: '17px' }}>
                  {item.firstName + ' ' + item.lastName + ' - ' + item.competitionName}
                </div>
              )}
              {(item.membershipProducts || []).map((mem, memIndex) => (
                <div key={mem.competitionMembershipProductTypeId + '#' + memIndex}>
                  {item.isTeamRegistration == 1 ? (
                    <div>
                      <div className="subtitle-text-common mt-10">
                        {' '}
                        {mem.firstName + ' ' + mem.lastName}
                      </div>
                      <div className="subtitle-text-common" style={{ display: 'flex' }}>
                        <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
                          {mem.membershipTypeName +
                            (mem.divisionId != null ? ' - ' + mem.divisionName : '')}
                        </div>
                        <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
                          ${mem.feesToPay}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="subtitle-text-common mt-10" style={{ display: 'flex' }}>
                      <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
                        {mem.membershipTypeName +
                          (mem.divisionId != null ? ' - ' + mem.divisionName : '')}
                      </div>
                      <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
                        ${mem.feesToPay}
                      </div>
                    </div>
                  )}
                  {/* <div  className="product-text-common mr-4 pb-4" style={{display:"flex" , fontWeight:500 ,}}>
                                    <div className="alignself-center pt-2" style={{marginRight:"auto"}}> {AppConstants.governmentSportsVoucher}</div>
                                    <div className="alignself-center pt-2" style={{marginRight:10}}>-$20</div>
                                </div>  */}
                </div>
              ))}
              {item.governmentVoucherAmount != '0.00' && (
                <div
                  className="product-text-common mr-4 pb-4"
                  style={{ display: 'flex', fontWeight: 500 }}
                >
                  <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
                    {' '}
                    {AppConstants.governmentSportsVoucher}
                  </div>
                  <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
                    - ${item.governmentVoucherAmount}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ borderBottom: '1px solid var(--app-e1e1f5)', marginTop: '-5px' }}>
          <div className="subtitle-text-common mt-10" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.subTotal}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total && total.subTotal}
            </div>
          </div>
          <div className="product-text-common-light mt-10" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.gst}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total && total.gst}
            </div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--app-e1e1f5)' }}>
          <div className="subtitle-text-common mt-10" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.total}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total && total.total}
            </div>
          </div>
          <div className="product-text-common-light mt-10" style={{ display: 'flex' }}>
            <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
              {AppConstants.transactionFee}
            </div>
            <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
              ${total && total.transactionFee}
            </div>
          </div>
        </div>

        <div className="subtitle-text-common mt-10" style={{ display: 'flex' }}>
          <div className="alignself-center pt-2" style={{ marginRight: 'auto' }}>
            {AppConstants.totalPaymentDue}
          </div>
          <div className="alignself-center pt-2" style={{ marginRight: 10 }}>
            ${total && total.targetValue}
          </div>
        </div>
      </div>
    );
  };

  buttonView = () => {
    return (
      <div style={{ marginTop: 23 }}>
        <div style={{ marginTop: 23 }}>
          <Button
            className="back-btn-text"
            style={{ boxShadow: '0px 1px 3px 0px', width: '100%', textTransform: 'uppercase' }}
            onClick={() => this.back()}
          >
            {AppConstants.back}
          </Button>
        </div>
      </div>
    );
  };

  paymentRightView = () => {
    return (
      <div className="col-lg-4 col-md-4 col-sm-12 product-right-view px-0 m-0">
        {this.yourOrderView()}
        {this.buttonView()}
      </div>
    );
  };

  registrationCapValidationModal = () => {
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.warning}
          visible={this.state.registrationCapModalVisible}
          onCancel={() => this.setState({ registrationCapModalVisible: false })}
          footer={[
            <Button onClick={() => this.setState({ registrationCapModalVisible: false })}>
              {AppConstants.ok}
            </Button>,
          ]}
        >
          <p> {this.state.registrationCapValidationMessage}</p>
        </Modal>
      </div>
    );
  };

  contentView = () => {
    return (
      <div className="row" style={{ padding: 40 }}>
        {this.paymentLeftView()}
        {this.paymentRightView()}
        {this.registrationCapValidationModal()}
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width" style={{ backgroundColor: '#f7fafc' }}>
        <DashboardLayout menuHeading={''} menuName={AppConstants.home} />
        <InnerHorizontalMenu />
        <Layout className="layout-margin">
          <Form>
            <Content>
              <div>
                {this.contentView()}
                {/* {this.deleteProductModalView()} */}
              </div>
              <Loader
                visible={this.props.userState.getTeamMembersReviewOnLoad || this.state.onLoad}
              />
            </Content>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateReviewInfoAction,
      getTeamMembersReviewAction,
    },
    dispatch,
  );
}

function mapStatetoProps(state) {
  return {
    commonReducerState: state.CommonReducerState,
    userState: state.UserState,
  };
}

async function registrationCapValidate(
  token,
  props,
  selectedOption,
  setClientKey,
  setRegId,
  payload,
  teamMemberRegId,
  registrationId,
  urlFlag,
  auBankAccount,
  setBankError,
  stripe,
  card,
  setError,
) {
  try {
    stripeTokenHandler(
      token,
      props,
      selectedOption,
      setClientKey,
      setRegId,
      payload,
      teamMemberRegId,
      registrationId,
      urlFlag,
      auBankAccount,
      setBankError,
      stripe,
      card,
      setError,
    );
    // let url = '/api/registrationcap/validate';
    // let body = {
    //   registrationId: registrationId,
    //   teamMemberRegId: teamMemberRegId,
    // };

    // return await new Promise((resolve, reject) => {
    //   fetch(`${StripeKeys.apiURL + url}`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: localStorage.token,
    //     },
    //     body: JSON.stringify(body),
    //   })
    //     .then(response => {
    //       let resp = response.json();
    //       console.log('response1', response);
    //       resp
    //         .then(Response => {
    //           if (response.status === 200) {
    //             stripeTokenHandler(
    //               token,
    //               props,
    //               selectedOption,
    //               setClientKey,
    //               setRegId,
    //               payload,
    //               teamMemberRegId,
    //               registrationId,
    //               urlFlag,
    //               auBankAccount,
    //               setBankError,
    //               stripe,
    //               card,
    //               setError,
    //             );
    //           } else if (response.status === 212) {
    //             props.onLoad(false);
    //             props.registrationCapModalVisible(true);
    //             props.registrationCapValidationMessage(Response.message);
    //             // message.error(Response.message);
    //           } else if (response.status === 400) {
    //             props.onLoad(false);
    //             message.error(Response.message);
    //           } else {
    //             props.onLoad(false);
    //             message.error(AppConstants.somethingWentWrongErrorMsg);
    //           }
    //         })
    //         .catch(error => {
    //           props.onLoad(false);
    //           message.error(AppConstants.somethingWentWrongErrorMsg);
    //         });
    //     })
    //     .catch(error => {
    //       props.onLoad(false);
    //       message.error(AppConstants.somethingWentWrongErrorMsg);
    //     });
    // })
    //   .then(data => {
    //     console.log('data');
    //   })
    //   .catch(data => {
    //     console.log('Error');
    //   });
  } catch (ex) {
    console.log('Error occured in createPerMatchPayments::' + ex);
  }
}

// POST the token ID to your backend.
async function stripeTokenHandler(
  token,
  props,
  selectedOption,
  setClientKey,
  setRegId,
  payload,
  teamMemberRegId,
  registrationId,
  urlFlag,
  auBankAccount,
  setBankError,
  stripe,
  card,
  setError,
) {
  console.log(token, props, screenProps);
  let paymentType = selectedOption;
  //let registrationId = screenProps.location.state ? screenProps.location.state.registrationId : null;
  // let invoiceId = screenProps.location.state ? screenProps.location.state.invoiceId : null
  console.log('Payload::' + JSON.stringify(payload.total));
  console.log('Payload222::', setClientKey, setRegId);

  let url;
  if (urlFlag == 1) {
    url = '/api/payments/createteammemberpayments';
  } else {
    url = '/api/payments/createteammemberpayments/directdebit';
  }

  let body;
  if (paymentType === 'card') {
    let stripeToken = token.id;
    body = {
      registrationId: registrationId,
      teamMemberRegId: teamMemberRegId,
      // invoiceId: invoiceId,
      paymentType: paymentType,
      payload: payload,
      token: {
        id: stripeToken,
      },
    };
  } else if (paymentType === 'direct_debit') {
    body = {
      registrationId: registrationId,
      teamMemberRegId: teamMemberRegId,
      //invoiceId: invoiceId,
      payload: payload,
      paymentType: paymentType,
    };
  } else if (props.payload.total.targetValue == 0) {
    if (props.isSchoolRegistration || props.isHardshipEnabled) {
      body = {
        registrationId: registrationId,
        teamMemberRegId: teamMemberRegId,
        //invoiceId: invoiceId,
        payload: payload,
        paymentType: null,
        isSchoolRegistration: 1,
        isHardshipEnabled: 1,
      };
    } else {
      body = {
        registrationId: registrationId,
        teamMemberRegId: teamMemberRegId,
        //invoiceId: invoiceId,
        payload: payload,
        paymentType: null,
      };
    }
  }
  console.log('body' + JSON.stringify(body));
  return await new Promise((resolve, reject) => {
    fetch(`${StripeKeys.apiURL + url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.token,
      },
      body: JSON.stringify(body),
    })
      .then(response => {
        let resp = response.json();
        console.log(response.status, 'status', paymentType);
        resp
          .then(async Response => {
            console.log('Response', Response);
            if (response.status === 200) {
              if (paymentType == 'card') {
                props.onLoad(false);
                message.success(Response.message);
                history.push('/invoice', {
                  registrationId: registrationId,
                  teamMemberRegId: teamMemberRegId,
                  userRegId: null,
                  paymentSuccess: true,
                  paymentType: paymentType,
                });
              } else if (paymentType == 'direct_debit') {
                if (Response.clientSecret == null) {
                  props.onLoad(false);
                  history.push('/invoice', {
                    registrationId: registrationId,
                    teamMemberRegId: teamMemberRegId,
                    userRegId: null,
                    paymentSuccess: true,
                    paymentType: paymentType,
                  });
                } else {
                  let confirmDebitPaymentInput = {
                    props: props,
                    selectedOption: selectedOption,
                    payload: payload,
                    registrationId: registrationId,
                    teamMemberRegId: teamMemberRegId,
                    clientSecret: Response.clientSecret,
                    auBankAccount: auBankAccount,
                    setBankError: setBankError,
                    stripe: stripe,
                    card: card,
                    setError: setError,
                  };
                  // confirmDebitPayment(confirmDebitPaymentInput);
                  // props.onLoad(false)
                }
              } else {
                props.onLoad(false);
                history.push('/invoice', {
                  registrationId: registrationId,
                  teamMemberRegId: teamMemberRegId,
                  userRegId: null,
                  paymentSuccess: true,
                  paymentType: 'dafault',
                });
              }
            } else if (response.status === 212) {
              props.onLoad(false);
              message.error(Response.message);
            } else if (response.status === 400) {
              props.onLoad(false);
              message.error(Response.message);
            } else {
              props.onLoad(false);
              message.error(AppConstants.somethingWentWrongErrorMsg);
            }
          })
          .catch(error => {
            console.log('500', error);
            props.onLoad(false);
            message.error(AppConstants.somethingWentWrongErrorMsg);
          });
      })
      .catch(error => {
        props.onLoad(false);
        message.error(AppConstants.somethingWentWrongErrorMsg);
      });
  })
    .then(data => {
      console.log('then data in stripeTokenHandler ');
    })
    .catch(data => {
      console.log('Error in stripeTokenHandler');
    });
}

export default connect(mapStatetoProps, mapDispatchToProps)(TeamMemberRegPayment);

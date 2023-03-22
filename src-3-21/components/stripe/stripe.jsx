import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import './stripe.css';
import { Button, Layout, Breadcrumb } from 'antd';
import AppConstants from '../../themes/appConstants';
import DashboardLayout from '../../pages/dashboardLayout';
import StripeKeys from './stripeKeys';
// import { getOrganisationData } from "../../util/sessionStorage";
import Loader from '../../customComponents/loader';
import { message } from 'antd';
import history from '../../util/history';

const { Header, Content } = Layout;
var screenProps = null;

// Custom styling can be passed to options when creating an Element.
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

const headerView = () => {
  return (
    <Header className="login-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb className="d-flex align-items-center align-self-center" separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.payment}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );
};

//////footer view containing all the buttons
const footerView = () => {
  return (
    <div className="container">
      <div className="login-footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="comp-finals-button-view">
              <Button className="open-reg-button" htmlType="submit" type="primary" form="my-form">
                {AppConstants.submitPayment}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutForm = props => {
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  // Handle real-time validation errors from the card Element.
  const handleChange = event => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // Handle form submission.
  const handleSubmit = async event => {
    event.preventDefault();
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card);
    props.onLoad(true);
    if (result.error) {
      // Inform the user if there was an error.
      setError(result.error.message);
      props.onLoad(false);
    } else {
      setError(null);
      // Send the token to your server.
      stripeTokenHandler(result.token, props);
    }
  };

  return (
    <div className="content-view">
      <form id="my-form" className="form" onSubmit={handleSubmit}>
        <label className="home-dash-left-text" htmlFor="card-element">
          Credit or debit card
        </label>
        <div className="pt-5">
          <CardElement
            id="card-element"
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleChange}
            className="StripeElement"
          />
          <div className="card-errors" role="alert">
            {error}
          </div>
        </div>
      </form>
    </div>
  );
};

// Setup Stripe.js and the Elements provider
const stripePromise = loadStripe(StripeKeys.publicKey);

const Stripe = props => {
  screenProps = props;
  const [loading, setLoading] = useState(false);
  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading="" menuName="" />
      <Layout>
        <Content className="container">
          {headerView()}
          <div className="auth-form">
            <Elements stripe={stripePromise}>
              <CheckoutForm onLoad={status => setLoading(status)} />
            </Elements>
            <Loader visible={loading} />
          </div>
          {footerView()}
        </Content>
      </Layout>
    </div>
  );
};

// POST the token ID to your backend.
async function stripeTokenHandler(token, props) {
  let competitionId = screenProps.location.state ? screenProps.location.state.competitionId : null;
  let organisationUniqueKey = screenProps.location.state
    ? screenProps.location.state.organisationUniqueKey
    : null;
  const response = await fetch(
    `https://registration-api-dev.worldsportaction.com/api/payments/calculateFee?competitionUniqueKey=${competitionId}&organisationUniqueKey=${organisationUniqueKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.token,
      },
      body: JSON.stringify({ token: { id: token.id } }),
    },
  );
  return response
    .json()
    .then(res => {
      props.onLoad(false);
      if (response.status === 200) {
        message.success(res.message);
        history.push('/appRegistrationSuccess');
      } else if (response.status === 400) {
        message.error(res.message);
      } else {
        message.error('Something went wrong.');
      }
    })
    .catch(err => {
      message.error('Something went wrong.');
    });
}

export default Stripe;

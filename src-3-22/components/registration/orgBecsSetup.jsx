import React, { Component } from 'react';
import { Layout } from 'antd';
import AppConstants from '../../themes/appConstants';
import { loadStripe } from '@stripe/stripe-js';
import StripeKeys from '../stripe/stripeKeys';
import { Elements } from '@stripe/react-stripe-js';
import PaymentSetupForm from './PaymentSetupForm';
import { connect } from 'react-redux';
import DashboardLayout from '../../pages/dashboardLayout';
import { bindActionCreators } from 'redux';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import {
  accountBalanceAction,
  saveStripeAccountAction,
  getStripeLoginLinkAction,
  getStripeTransferListAction,
  exportPaymentApi,
} from '../../store/actions/stripeAction/stripeAction';
import { getOrganisationData } from '../../util/sessionStorage';

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      accountBalanceAction,
      saveStripeAccountAction,
      getStripeLoginLinkAction,
      getStripeTransferListAction,
      exportPaymentApi,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    stripeState: state.StripeState,
    userState: state.UserState,
  };
}

class OrgBecsSetup extends Component {
  isBecsSetupDone = () => {
    const orgData = getOrganisationData();
    const becsMandateId = orgData ? orgData.stripeBecsMandateId : null;
    return becsMandateId;
  };

    // componentDidMount() {
    //     if (this.isBecsSetupDone()) {
    //         this.props.history.push("/registrationPayments");
    //     }
    // }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.finance} menuName={AppConstants.finance} />
        <InnerHorizontalMenu menu="finance" finSelectedKey="2" />
        <Layout className="reg-payment-layout-view">
          <div className="reg-payment-header-view mt-5">
            <div className="row">
              <div className="col-sm d-flex align-content-center">
                <span className="form-heading">{AppConstants.bankAccountForWithdrawals}</span>
              </div>
            </div>
          </div>
          {this.PaymentSetupFormEl()}
        </Layout>
      </div>
    );
  }

  PaymentSetupFormEl = () => {
    const stripePromise = loadStripe(StripeKeys.publicKey);
    return (
      <Elements stripe={stripePromise}>
        <PaymentSetupForm />
      </Elements>
    );
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(OrgBecsSetup);

import React from 'react';
import { useStripe, useElements, AuBankAccountElement } from '@stripe/react-stripe-js';
import BecsForm from './BecsForm';
import userHttp from '../../store/http/userHttp/userHttp';
import { getOrganisationData, setOrganisationData } from 'util/sessionStorage';
import { useHistory } from 'react-router-dom';
import { notification } from 'antd';
import AppConstants from 'themes/appConstants';

export default function PaymentSetupForm() {
  const stripe = useStripe();
  const elements = useElements();
  const history = useHistory();

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    let secret;
    const auBankAccount = elements.getElement(AuBankAccountElement);
    try {
      const orgDetail = await getOrganisationData();
      const result = await userHttp.get(
        `${process.env.REACT_APP_URL_API_USERS}/becs/secret/${orgDetail.organisationId}`,
      );
      secret = result.data;
    } catch (e) {
      console.log({ e });
      let errorMessage = AppConstants.becsAlreadyCompletedMessage;
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      const openNotificationWithIcon = type => {
        notification[type]({
          message: 'Failed',
          description: errorMessage,
        });
      };
      return openNotificationWithIcon('error');
    }
    const orgData = await getOrganisationData();
    const result = await stripe.confirmAuBecsDebitSetup(secret, {
      payment_method: {
        au_becs_debit: auBankAccount,
        billing_details: {
          name: `${orgData.firstName} ${orgData.lastName}`,
          email: orgData.email || orgData.userEmail,
        },
      },
    });

    if (result.error) {
      console.log(result.error.message);
    } else {
      const openNotificationWithIcon = type => {
        notification[type]({
          message: AppConstants.becsSetupNotificationTitle,
          description: AppConstants.becsSetupNotificationBody,
        });
      };
      await userHttp.get(
        `${process.env.REACT_APP_URL_API_USERS}/becs/confirm/${orgData.organisationId}`,
      );
      // const orgData = await getOrganisationData()
      // TODO: Temporary solution
      orgData.stripeBecsMandateId = true;
      await setOrganisationData(orgData);
      openNotificationWithIcon('success');
      history.push('/registrationPayments');
    }
  };

  return <BecsForm onSubmit={handleSubmit} disabled={!stripe} />;
}

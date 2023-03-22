import React from 'react';
import { AuBankAccountElement } from '@stripe/react-stripe-js';
import './BecsFormStyles.css';
import { Button, Card } from 'antd';
import { useHistory } from 'react-router-dom';
import AppConstants from '../../themes/appConstants';

// Custom styling can be passed as options when creating an Element.
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

export default function BecsForm({ onSubmit, disabled }) {
  const history = useHistory();
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <div>
          <label className="w-100">
            {AppConstants.bankAccount}
            <AuBankAccountElement options={AU_BANK_ACCOUNT_ELEMENT_OPTIONS} />
          </label>
          <p>{AppConstants.becsTnC}</p>
        </div>
      </Card>
      <div className="d-flex justify-content-between mt-5">
        <Button onClick={() => history.push('/registrationPayments')}>{AppConstants.cancel}</Button>
        <Button type="primary" htmlType="submit" disabled={disabled}>
          {AppConstants.save}
        </Button>
      </div>
    </form>
  );
}

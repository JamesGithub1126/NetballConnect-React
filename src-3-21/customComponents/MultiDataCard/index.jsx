import React, { Component } from 'react';
import { Spin } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import './index.css';
import { formatNumbersSeparator, currencyFormat } from '../../util/formatNumbersSeparator';

export default class ActionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isApiNotProvided: false,
      hasError: false,
      data: this.props.value || '',
    };
  }

  formattedNumberValue(prefix, value) {
      return prefix && prefix === '$' ? currencyFormat(value) : formatNumbersSeparator(value);
  }

  render() {
    const { title, leftMeasure, rightMeasure, mainValue, showValues = true } = this.props;
    const { value: leftValue, title: leftTitle, prefix: leftPrefix } = leftMeasure || {};
    const { value: rightValue, title: rightTitle, prefix: rightPrefix } = rightMeasure || {};
    const { value, prefix } = mainValue;
    return (
      <div className="data-card">
        <div className="data-card-header data-card-flex">
          <div className="data-card-flex-main">{title}</div>
          <div className="data-card-flex-secondary" />
        </div>
        <div className="data-card-body data-card-flex">
          <div className="data-card-value data-card-flex-main">
            {this.props.loading ? (
              <Spin size="default" />
            ) : this.props.hasError ? (
              <CloseCircleOutlined style={{ color: 'red' }} />
            ) : (
              <div className="reg-payment-price-text data-main-value">
                {' '}
                {this.formattedNumberValue(prefix, value)}
              </div>
            )}
          </div>
        </div>

        <div className="data-card-footer">
          {!this.props.loading ? (
            <>
              <div className="data-sub-value">
                <div>{leftTitle}</div>
                {showValues ? (
                  <div>
                    {this.formattedNumberValue(leftPrefix, leftValue)}
                  </div>
                ) : null}
              </div>
              <div className="data-divider" />
              <div className="data-sub-value">
                <div>{rightTitle}</div>
                {showValues ? (
                  <div>
                    {this.formattedNumberValue(rightPrefix, rightValue)}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }
}

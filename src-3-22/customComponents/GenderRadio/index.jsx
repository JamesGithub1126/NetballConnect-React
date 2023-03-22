import React, { Component } from 'react';
import { Form, Input, Radio } from 'antd';
import AppConstants from '../../themes/appConstants';
import { GENDER } from 'util/enums';
import InputWithHead from '../../customComponents/InputWithHead';
import './index.css';

export default class GenderFormItem extends Component {
  constructor(props) {
    super(props);
    this.state = { genderOther: this.props.genderOther };
    this.form = this.props.form;
  }

  onGenderRefChanged = e => {
    if (this.props.onChange) {
      this.props.onChange(e.target.value, this.props.genderRefIdField);
    }
  };

  onDiffIdentityChanged = e => {
    if (this.props.onChange) {
      this.props.onChange(e.target.value, this.props.genderOtherField);
    }
  };

  render() {
    const { form, genderList, genderRefId } = this.props;
    return (
      <div className="row">
        <div className="col-sm-6">
          <InputWithHead heading={AppConstants.gender} />
          <Form.Item name="genderRefId">
            <Radio.Group onChange={this.onGenderRefChanged} value={genderRefId}>
              {(genderList || []).map(gender => (
                <Radio key={`gender_${gender.id}`} value={gender.id}>
                  {gender.description}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </div>
        <div className="col-sm-4">
          {genderRefId == GENDER.DIFFERENT_IDENTITY && (
            <>
              <InputWithHead heading={' '} />
              <div className="hidden-xs diff-identity-label-hidden-xs"></div>
              <div className="visible-xs-block diff-identity-label-visible-xs"></div>
              <Form.Item name="genderOther">
                <Input onBlur={this.onDiffIdentityChanged}></Input>
              </Form.Item>
            </>
          )}
        </div>
      </div>
    );
  }
}

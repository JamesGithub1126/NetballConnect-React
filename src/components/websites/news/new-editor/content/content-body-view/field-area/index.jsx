import React from 'react';
import InputWithHead from '../../../../../../../customComponents/InputWithHead';
import AppConstants from '../../../../../../../themes/appConstants';
import { randomKeyGen } from '../../../../../../../util/helpers';
import { Form } from 'antd';
import ValidationConstants from '../../../../../../../themes/validationConstant';

const FieldArea = ({ fieldList, updateFieldList }) => {
  const removeAdditionalData = item => {
    let index = fieldList.findIndex(f => f.id === item.id);
    if (index > -1) {
      fieldList.splice(index, 1);
      updateFieldList([...fieldList]);
    }
  };

  const addAdditionalData = item => {
    fieldList.push({
      id: randomKeyGen(48),
      value: randomKeyGen(48),
      field: randomKeyGen(48),
    });
    updateFieldList([...fieldList]);
  };

  const additionalDataView = item => {
    return (
      <div key={item.id} className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <Form.Item
              name={`field_${item.id}`}
              rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[1] }]}
            >
              <InputWithHead placeholder={AppConstants.field} />
            </Form.Item>
          </div>
          <div className="col-sm">
            <Form.Item
              name={`value_${item.id}`}
              rules={[{ required: true, message: ValidationConstants.pageEditValidateMessages[2] }]}
            >
              <InputWithHead placeholder={AppConstants.value} />
            </Form.Item>
          </div>
          <div className="col-sm-2 transfer-image-view" onClick={() => removeAdditionalData(item)}>
            <a className="transfer-image-view">
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inside-container-view pt-4">
      <InputWithHead heading={AppConstants.additionalData} />
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.field} required="required-field" />
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.value} required="required-field" />
          </div>
          <div className="col-sm-2 transfer-image-view">
            <a className="transfer-image-view">
              <span className="user-remove-btn" />
              <span className="user-remove-text mr-0" />
            </a>
          </div>
        </div>
      </div>
      {fieldList.map((item) => additionalDataView(item))}
      <a>
        <span onClick={addAdditionalData} className="input-heading-add-another">
          + {AppConstants.addField}
        </span>
      </a>
    </div>
  );
};

export default FieldArea;

import { Form, Select } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InputWithHead from '../../customComponents/InputWithHead';
import AppConstants from '../../themes/appConstants';
import { getRelationshipListAction } from '../../store/actions/commonAction/commonAction';

const { Option } = Select;
const RelationshipSelect = ({ getFieldDecorator, onFormChange, value, form, key }) => {
  const dispatch = useDispatch();
  const commonStore = useSelector(state => state.CommonReducerState);
  const { relationshipList } = commonStore;

  useEffect(() => {
    if (!relationshipList.length) {
      dispatch(getRelationshipListAction());
    }
  }, []);

  useEffect(() => {
    form.current.setFieldsValue({
      [key]: value,
    });
  }, [value]);

  return (
    <Form.Item name={key}>
      <InputWithHead heading={AppConstants.yourRelationship} />
      <Select
        style={{ width: '100%' }}
        placeholder={AppConstants.select}
        onChange={val => onFormChange(val, key)}
        value={value}
      >
        {relationshipList.map(item => (
          <Option key={item.name + item.id} value={item.id}>
            {item.description}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

RelationshipSelect.defaultProps = {
  value: null,
  key: 'emergencyContactRelationshipId',
  getFieldDecorator: () => () => null,
  onFormChange: () => {},
};

export default RelationshipSelect;

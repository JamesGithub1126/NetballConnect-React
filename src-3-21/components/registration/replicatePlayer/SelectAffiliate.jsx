import React from 'react';
import { Select } from 'antd';
import Span from './Span';
import AppConstants from 'themes/appConstants';

const SelectAffiliate = React.memo(({ affiliates, renderItem, ...props }) => {
  return (
    <div className="d-flex flex-row mb-3">
      <Span>{AppConstants.affiliate}</Span>
      <Select
        showSearch
        placeholder="Please Select an Affiliate"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        {...props}
      >
        {(affiliates || []).map((item, index) => (
          <Select.Option key={index} value={item.organisationUniqueKey} label={item.name}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
});

export default SelectAffiliate;

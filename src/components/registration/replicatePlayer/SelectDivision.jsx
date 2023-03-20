import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import Span from './Span';

const SelectDivision = React.memo(({divisions, hidden, ...props}) => {
  return (
    <div className="d-flex flex-row mb-3" hidden={hidden}>
      <Span>{AppConstants.division}</Span>
      <Select
        showSearch
        placeholder="Please Select an Age Group"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        {...props}
      >
        {(divisions || []).map(item => (
          <Select.Option key={item.id} label={item.divisionName} value={item.id}>
            {item.divisionName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
});

export default SelectDivision;
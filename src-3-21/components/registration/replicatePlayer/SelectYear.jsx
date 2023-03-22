import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import Span from './Span';
import './styles.css';

const SelectYear = React.memo(({ yearList, ...props }) => {
  return (
    <div className="d-flex flex-row mb-3">
      <Span>{AppConstants.year}</Span>
      <Select
        title={AppConstants.year}
        {...props}
      >
        <Select.Option key={-1} value={-1}>
          {AppConstants.all}
        </Select.Option>
        {(yearList || []).map((item, index) => (
          <Select.Option key={index} value={item.id}>
            {item.description}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
})

export default SelectYear;
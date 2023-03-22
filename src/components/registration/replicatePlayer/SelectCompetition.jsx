import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import Span from './Span';
import './styles.css';

const SelectCompetition = React.memo(({ competitions, renderItem, ...props }) => {
  return (
    <div className="d-flex flex-row mb-3">
      <Span>{AppConstants.competition}</Span>
      <Select
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        {...props}
      >
        {(competitions || []).map((item, index) => (
          <Select.Option key={index} value={item.compUniqueKey} label={item.competitionName}>
            {item.competitionName} ({item.organiserName})
          </Select.Option>
        ))}
      </Select>
    </div>
  );
});

export default SelectCompetition;

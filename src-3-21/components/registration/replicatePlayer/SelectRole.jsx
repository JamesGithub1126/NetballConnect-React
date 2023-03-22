import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import Span from './Span';

const SelectRole = React.memo(({ userRoles, ...props }) => {
  return (
    <div className="d-flex flex-row mb-3">
      <Span>{AppConstants.role}</Span>
      <Select {...props}>
        {(userRoles || []).map(item => (
          <Select.Option key={item.roleId} value={item.roleId}>
            {item.role}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
});

export default SelectRole;

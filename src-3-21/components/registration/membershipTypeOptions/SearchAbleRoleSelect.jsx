import React from 'react';
import { Form, Select } from 'antd';
import AppConstants from 'themes/appConstants';
const { Option } = Select;
/** A searchable select box that takes an array of objects for user roles in the system and returns a select with searchable options
 *
 * @param {Array} data - userRoles data which should be an array of objects with role and roleId
 * @param {string} styles - any custom CSS styles that you want to be applied to this component
 * @param {boolean} disabled - whether or not to disable the select (Useful for child organisations)
 * @param {number} defaultValue - Uses this value to render the default value for the select
 * @param {handleOnChange} handleOnChange - a callback function that is required for the onChange event
 * @param {number} index - Used to render errors and values in the UI.
 * @returns A searchable select box with roles
 */

const SearchAbleRoleSelect = ({ data, styles, handleOnChange, disabled, defaultValue, index }) => {
  const getDefaultValueForSelect = () => {
    const filterRole = data?.filter(i => i.roleId === defaultValue);
    return filterRole[0]?.role ? filterRole[0]?.role : null;
  };

  return (
    <Form.Item
      name={['role', index]}
      rules={[
        {
          required: true,
          message: AppConstants.roleisRequired,
        },
      ]}
      initialValue={getDefaultValueForSelect()}
    >
      <Select
        showSearch
        className={styles}
        placeholder="Please Select a Role"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        onChange={event => handleOnChange(event)}
        disabled={disabled}
      >
        {data.map(i => (
          <Option key={i.roleId} value={i.roleId} label={i.role}>
            {i.role}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SearchAbleRoleSelect;

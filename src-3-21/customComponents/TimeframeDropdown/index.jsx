import React from 'react';
import { Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';


const TimeframeDropdown = ({ options, onChange, value, optValueAlias = 'key' }) => {
    return (
        <span>
          <Dropdown
              trigger={['hover']}
              overlay={
                  <Menu onClick={onChange}>
                      {options.map(option => (
                          <Menu.Item key={option.id}>{option[optValueAlias]}</Menu.Item>
                      ))}
                  </Menu>
              }
          >
            <a className="ant-dropdown-link">
              {' '}
                {value}
                <DownOutlined />
            </a>
          </Dropdown>
        </span>
    )
}

export default TimeframeDropdown;

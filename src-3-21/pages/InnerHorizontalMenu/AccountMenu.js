import React from 'react';
import { Menu } from 'antd';
import { NavLink } from 'react-router-dom';

import AppConstants from '../../themes/appConstants';

function AccountMenu(props) {
  return (
    <Menu
      theme="light"
      mode="horizontal"
      defaultSelectedKeys={['1']}
      style={{ lineHeight: '64px' }}
      selectedKeys={[props.selectedKey]}
    >
      <Menu.Item key="1">
        <NavLink to="/account/profile">
          <span>{AppConstants.profileMenu}</span>
        </NavLink>
      </Menu.Item>

      <Menu.Item key="2">
        <NavLink to="/account/password">
          <span>{AppConstants.passwordMenu}</span>
        </NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default AccountMenu;

import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFinalPlayersList,
  toggleAgeGroupVisibility,
} from 'store/actions/moveFAPlayerAction/movePlayerAction';
import AppConstants from 'themes/appConstants';
import ModalSpan from './ModalSpan';
const UserRolesForModalComponent = ({ className }) => {
  const { finalMovePlayersList } = useSelector(state => state.MovePlayerState);
  const userRoles = AppConstants.userRoles;
  const dispatch = useDispatch();
  const handleOnChange = value => {
    dispatch(
      setFinalPlayersList({
        ...finalMovePlayersList,
        roleId: value,
      }),
    );

    if (value !== userRoles[0].roleId) {
      //if value is not a playerRole
      dispatch(toggleAgeGroupVisibility(false));
    } else {
      dispatch(toggleAgeGroupVisibility(true));
    }
  };
  return (
    <div className="d-flex flex-row mb-3">
      <ModalSpan>{AppConstants.role}</ModalSpan>
      <Select className={className} placeholder="Please Select A Role" onChange={handleOnChange}>
        {userRoles?.map(item => (
          <Select.Option key={item.roleId} value={item.roleId}>
            {item.role}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default UserRolesForModalComponent;

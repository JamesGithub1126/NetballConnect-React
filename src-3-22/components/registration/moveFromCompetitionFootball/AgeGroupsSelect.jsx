import { Select } from 'antd';
import React from 'react';
import ModalSpan from './ModalSpan';
import AppConstants from 'themes/appConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setFinalPlayersList } from 'store/actions/moveFAPlayerAction/movePlayerAction';

const AgeGroupsSelect = ({ className }) => {
  const { divisions, finalMovePlayersList, userRoleComponentVisible, onLoadDiv } = useSelector(
    state => state.MovePlayerState,
  );
  const dispatch = useDispatch();
  const handleOnChange = value => {
    dispatch(
      setFinalPlayersList({
        ...finalMovePlayersList,
        divisionId: value,
      }),
    );
  };

  return (
    <div className="d-flex flex-row mb-3" hidden={!userRoleComponentVisible}>
      <ModalSpan>{AppConstants.division}</ModalSpan>
      <Select
        className={className}
        showSearch
        placeholder="Please Select an Age Group"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={finalMovePlayersList.divisionId}
        loading={onLoadDiv}
        onChange={handleOnChange}
      >
        {divisions?.map(item => (
          <Select.Option key={item.id} label={item.divisionName} value={item.id}>
            {item.divisionName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default AgeGroupsSelect;

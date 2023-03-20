import React from 'react';
import { Select } from 'antd';
import ModalSpan from './ModalSpan';
import AppConstants from 'themes/appConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setFinalPlayersList } from 'store/actions/moveFAPlayerAction/movePlayerAction';

const ModalAffiliate = ({ className }) => {
  const { affiliates, finalMovePlayersList, onLoadOrg } = useSelector(state => state.MovePlayerState);
  const dispatch = useDispatch();

  const handleOnChange = value => {
    dispatch(
      setFinalPlayersList({
        ...finalMovePlayersList,
        organisationUniqueKey: value,
      }),
    );
  };
  return (
    <div className="d-flex flex-row mb-3">
      <ModalSpan>{AppConstants.affiliate}</ModalSpan>
      <Select
        className={className}
        showSearch
        placeholder="Please Select an Affiliate"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={finalMovePlayersList.organisationUniqueKey}
        loading={onLoadOrg}
        onChange={handleOnChange}
      >
        {affiliates?.map((item, index) => (
          <Select.Option key={index} value={item.organisationUniqueKey} label={item.name}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ModalAffiliate;

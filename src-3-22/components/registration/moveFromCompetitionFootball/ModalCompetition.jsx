import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import ModalSpan from './ModalSpan';
import './moveCompetitionModalStyles.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAffiliates,
  getDivisions,
  setFinalPlayersList,
} from 'store/actions/moveFAPlayerAction/movePlayerAction';
const ModalCompetition = ({ className, organisationUniqueKey }) => {
  const dispatch = useDispatch();
  const { competitions, finalMovePlayersList, onLoadComp } = useSelector(
    state => state.MovePlayerState,
  );
  const handleOnChange = value => {
    dispatch(
      setFinalPlayersList({
        ...finalMovePlayersList,
        competitionUniqueKey: value,
      }),
    );
    dispatch(
      getAffiliates({
        competitionUniqueKey: value,
        organisationUniqueKey,
      }),
    );
    dispatch(getDivisions(value));
  };
  return (
    <div className="d-flex flex-row mb-3">
      <ModalSpan>{AppConstants.competition}</ModalSpan>
      <Select
        className={className}
        showSearch
        placeholder="Please Select a Competition"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={finalMovePlayersList.competitionUniqueKey}
        loading={onLoadComp}
        onChange={handleOnChange}
      >
        {competitions.map(item => (
          <Select.Option
            key={item.compUniqueKey}
            value={item.compUniqueKey}
            label={item.competitionName}
          >
            {item.competitionName} ({item.organiserName})
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
export default ModalCompetition;

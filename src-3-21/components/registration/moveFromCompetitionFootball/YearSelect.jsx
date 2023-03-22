import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setYearRefIdCommon } from 'store/actions/appAction';
import AppConstants from 'themes/appConstants';
import { Select } from 'antd';
import './moveCompetitionModalStyles.css';
import ModalSpan from './ModalSpan';
import { getCompetitions, resetFields } from 'store/actions/moveFAPlayerAction/movePlayerAction';
import { useOrganisation } from 'customHooks/hooks';

/**
 * Common Select Component for yearRefId , modify if you want to modify where ever it is used, else supply a classname with your own styles.
 */

const YearSelect = ({ className }) => {
  const { organisationUniqueKey } = useOrganisation();
  const { modalYearRefId, yearList } = useSelector(state => state.AppState);
  const dispatch = useDispatch();
  const onChangeYearRefId = yearRefId => {
    dispatch(setYearRefIdCommon(yearRefId));
    dispatch(
      getCompetitions({
        organisationUniqueKey,
        yearRefId,
      }),
    );
  };

  return (
    <div className="d-flex flex-row mb-3">
      <ModalSpan>{AppConstants.year}</ModalSpan>
      <Select
        className={className}
        title={AppConstants.year}
        field="modalRefId"
        value={modalYearRefId}
        onChange={e => onChangeYearRefId(e)}
      >
        <Select.Option key={-1} value={-1}>
          {AppConstants.all}
        </Select.Option>
        {yearList.map((item, index) => (
          <Select.Option key={index} value={item.id}>
            {item.description}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default YearSelect;

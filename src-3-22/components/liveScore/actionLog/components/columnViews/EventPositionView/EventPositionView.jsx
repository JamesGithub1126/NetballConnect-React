import { Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import AppConstants from 'themes/appConstants';
import { useSetEventPosition } from '../../../hooks';
import styles from '../../actionLog.module.scss';
const { Option } = Select;

export default function EventPositionView({ matchEvent }) {
  //hooks
  const setEventPosition = useSetEventPosition();
  const positionList = useSelector(state => state.liveScoreGamePositionState?.positionList);

  //jsx
  if (['pause', 'resume'].includes(matchEvent.type)) {
    return (
      <div className="w-100 d-flex justify-content-center">
        <span>_</span>
      </div>
    );
  }

  return (
    <Select
      className={`year-select ${styles.select}`}
      onChange={positionId => setEventPosition(matchEvent, positionId)}
      value={matchEvent.positionId}
    >
      {positionList?.map((item, index) => (
        <Option
          key={'posititionList' + index}
          className="ant-select-selection-item"
          value={item.id}
        >
          {item.name}
        </Option>
      ))}
    </Select>
  );
}

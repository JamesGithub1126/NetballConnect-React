import { Select } from 'antd';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AppConstants from 'themes/appConstants';
import { getEventTypeValue } from '../../../api';
import { useSetEventType } from '../../../hooks';
import styles from '../../actionLog.module.scss';
const { Option } = Select;

export default function EventTypeView({ matchEvent }) {
  //hooks
  const setEventType = useSetEventType();
  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList);
  const eventTypeOptions = useSelector(state => state.LiveScoreMatchLogState?.eventTypeOptions);

  //values
  const eventType = useMemo(() => {
    return getEventTypeValue(eventTypeOptions, matchEvent, gameStatList);
  }, [eventTypeOptions, matchEvent.type, gameStatList]);

  //jsx
  const isPauseType = matchEvent.type === 'pause';
  const isResumeType = matchEvent.type === 'resume';
  if (isPauseType || isResumeType) {
    return (
      <div className="w-100 d-flex justify-content-center">
        <span>{isPauseType ? AppConstants.pause : AppConstants.resume}</span>
      </div>
    );
  }

  return (
    <Select
      className={styles.select}
      onChange={type => setEventType(matchEvent, type)}
      value={eventType}
    >
      {eventTypeOptions.map((option, index) => (
        <Option key={'typelist' + index + '_' + option.type} value={option.type}>
          {option.name}
        </Option>
      ))}
    </Select>
  );
}

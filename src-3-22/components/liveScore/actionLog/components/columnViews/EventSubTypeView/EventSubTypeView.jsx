import { Select } from 'antd';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getEventSubTypeOptions, getEventTypeValue, isPointType } from '../../../api';
import { useSetEventSubType } from '../../../hooks';
import styles from '../../actionLog.module.scss';
const { Option } = Select;

export default function EventSubTypeView({ matchEvent }) {
  // hooks
  const setEventSubType = useSetEventSubType();
  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList) || [];
  const pointScheme = useSelector(state => state.LiveScoreMatchLogState?.pointScheme) || [];
  const eventTypeOptions =
    useSelector(state => state.LiveScoreMatchLogState?.eventTypeOptions) || [];

  // values
  const hasEventType = useMemo(() => {
    return !!getEventTypeValue(eventTypeOptions, matchEvent, gameStatList);
  }, [eventTypeOptions, matchEvent.type, gameStatList]);

  const eventSubTypeOptions = useMemo(() => {
    return getEventSubTypeOptions(matchEvent.type, gameStatList, pointScheme);
  }, [matchEvent.type, gameStatList, pointScheme]);

  const eventSubTypeValue = useMemo(() => {
    return isPointType(matchEvent.type) ? matchEvent.attribute1Value : matchEvent.type;
  }, [matchEvent.type, matchEvent.attribute1Value, gameStatList]);

  // jsx
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
      disabled={!hasEventType}
      onChange={subType => setEventSubType(matchEvent, matchEvent.type, subType)}
      value={eventSubTypeValue}
    >
      {eventSubTypeOptions.map((opt, index) => (
        <Option key={`pointList${index}_${opt.name}`} value={opt.type}>
          {opt.name}
        </Option>
      ))}
    </Select>
  );
}

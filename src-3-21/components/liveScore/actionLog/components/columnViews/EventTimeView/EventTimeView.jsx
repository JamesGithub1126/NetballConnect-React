import React from 'react';
import { TimePicker } from 'antd';
import { useSetEventTime } from 'components/liveScore/actionLog/hooks';
import moment from 'moment';
import styles from '../../actionLog.module.scss';

export default function EventTimeView({ matchEvent }) {
  //hooks
  const setEventTime = useSetEventTime();
  const value = matchEvent.diff ? moment.utc(matchEvent.diff) : moment.utc().startOf('day');

  //jsx
  if (['pause', 'resume'].includes(matchEvent.type)) {
    return (
      <div className="pl-3">
        <span>{value.format('mm:ss')}</span>
      </div>
    );
  }

  return (
    <TimePicker
      format="mm:ss"
      className={styles.timeSelect}
      popupClassName={'timepicker'}
      value={value}
      onOk={time => setEventTime(matchEvent, time)}
      showNow={false}
    />
  );
}

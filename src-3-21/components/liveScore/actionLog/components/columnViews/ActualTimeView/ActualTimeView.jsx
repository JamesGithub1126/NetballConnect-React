import moment from 'moment';
import React from 'react';
import styles from '../../actionLog.module.scss';

export default function ActualTimeView({ matchEvent = {}, startTime = null }) {
  //values
  let time = '00:00';
  if (matchEvent.eventTimestamp) {
    time = moment(matchEvent.eventTimestamp).format('HH:mm:ss');
  } else if (startTime) {
    time = startTime.format('HH:mm:ss');
  }

  //jsx
  return (
    <div className={styles.actualTime}>
      <span>{time}</span>
    </div>
  );
}

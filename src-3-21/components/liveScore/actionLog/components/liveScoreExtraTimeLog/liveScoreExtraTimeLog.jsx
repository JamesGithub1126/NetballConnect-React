import React, { useState, useEffect } from 'react';
import { useSetAddPeriod } from '../../hooks';
import LiveScorePeriodLog from '../LivescorePeriodLog/liveScorePeriodLog';
import styles from '../actionLog.module.scss';
import AppConstants from 'themes/appConstants';
import { numberOfPeriods } from 'components/liveScore/livescoreUtils';

const LiveScoreExtraTimeLog = ({ match, form, periodStartTimes = [] }) => {
  const setAddPeriod = useSetAddPeriod();
  const [periods, setPeriods] = useState([]);
  const [periodNum, setPeriodNum] = useState();

  useEffect(() => {
    if (!periodStartTimes.length) {
      return;
    }
    let extraTimeStartTimes = periodStartTimes
      .filter(
        e =>
          Number(e.period) > numberOfPeriods(match?.type) &&
          Number(e.period) !== 100 &&
          e.type === 'periodStart',
      )
      .sort((a, b) => Number(a.period) - Number(b.period));

    if (extraTimeStartTimes.length) {
      setPeriods([...extraTimeStartTimes.map(x => x.period)]);
      setPeriodNum(Number(extraTimeStartTimes[extraTimeStartTimes.length - 1].period) + 1);
    } else {
      setPeriods([]);
      setPeriodNum(numberOfPeriods(match?.type) + 1);
    }
  }, [periodStartTimes, match?.type]);

  const handleAddNewPeriod = () => {
    setAddPeriod(periodNum, match.startTime, match.extraTimePeriodDuration);
  };

  return (
    <>
      {periods &&
        match?.type &&
        periods.map((period, index) => {
          const periodStartTime = periodStartTimes.find(
            i => i.period === Number(period) && i.type === 'periodStart',
          );
          return (
            <LiveScorePeriodLog
              className={styles.extraTimePeriod}
              form={form}
              title={AppConstants.ET + ' ' + (index + 1)}
              period={Number(period)}
              index={new Date().getTime() + period} //trying to randomize the key to avoid console error
              key={period}
              startTime={periodStartTime?.eventTimestamp}
            />
          );
        })}
      <div className="row mt-5 ml-5" style={{ fontSize: '15px' }}>
        <span
          className="input-heading-add-another"
          style={{ paddingTop: 'unset' }}
          onClick={() => handleAddNewPeriod()}
        >
          {`+ ${AppConstants.addExtraTime}`}
        </span>
      </div>
    </>
  );
};

export default LiveScoreExtraTimeLog;

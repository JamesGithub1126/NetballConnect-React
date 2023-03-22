import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TimePicker } from 'antd';
import {
  liveScoreAddNewMatchEventAction,
  liveScorePeriodTimeStampUpdated,
} from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import AppConstants from 'themes/appConstants';
import moment from 'moment';
import {
  getLiveScoreGamePositionsList,
  getLiveScoreGameStatsList,
} from 'store/actions/LiveScoreAction/liveScoreGamePositionAction';
import { SPORT } from 'util/enums';
import { isNetball } from '../../../liveScoreSettings/liveScoreSettingsUtils';
import ActionLogTable from '../ActionLogTable/ActionLogTable';
import styles from '../actionLog.module.scss';

const LiveScorePeriodLog = ({ period, startTime, form, className, title = null }) => {
  const dispatch = useDispatch();
  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList) || [];
  const liveScoreCompetition = JSON.parse(localStorage.getItem('LiveScoreCompetition'));
  const isPremierNetball =
    liveScoreCompetition.scoringType === 'PREMIER_NETBALL' && isNetball ? true : false;

  let gameStatListFiltered = [];
  if (isPremierNetball) {
    gameStatListFiltered = gameStatList;
  } else {
    gameStatListFiltered = gameStatList.filter(
      i => i.sportRefId === SPORT[process.env.REACT_APP_FLAVOUR],
    );
  }
  useEffect(() => {
    dispatch(getLiveScoreGamePositionsList(SPORT[process.env.REACT_APP_FLAVOUR]));
    dispatch(getLiveScoreGameStatsList(SPORT[process.env.REACT_APP_FLAVOUR], false));
  }, []);

  const handleAddNewEvent = period => {
    dispatch(liveScoreAddNewMatchEventAction(period));
  };

  const onChangeTime = timeMoment => {
    if (timeMoment) {
      dispatch(
        liveScorePeriodTimeStampUpdated({
          time: timeMoment,
          period,
        }),
      );
    }
  };

  return (
    <div className={`${className ?? ''} ${styles.periodLog}`} key={period}>
      <div className="mt-5">
        <strong className={styles.periodHeading}>{title}</strong>
      </div>
      <div className={`d-flex flex-column mt-4 ${styles.startTime}`}>
        <label className={'year-select-heading'}>{AppConstants.startTimeHHMM}</label>
        <div>
          <TimePicker
            format="HH:mm"
            showNow={false}
            value={startTime ? moment(startTime) : null}
            onChange={time => onChangeTime(time)}
          />
        </div>
      </div>
      <div className="mt-5">
        <ActionLogTable form={form} period={period} />
      </div>
      <div className={styles.add}>
        <span onClick={() => handleAddNewEvent(period)}>{`+ ${AppConstants.add}`}</span>
      </div>
    </div>
  );
};

export default LiveScorePeriodLog;

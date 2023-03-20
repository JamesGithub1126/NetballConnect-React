import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputNumber } from 'antd';
import { getPlayedPositions, pmtStateIsEqual, isAttentionDisabled } from './statisticsUtils';
import { liveScoreStatisticsUpdatePlayDuration } from 'store/actions/LiveScoreAction/liveScorePlayerMinuteTrackingAction';
import { FLAVOUR } from 'util/enums';

const isBasketball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball;

const StatisticsDurations = ({ player, period, teamId, statsSettings }) => {
  const dispatch = useDispatch();
  const disabled = isAttentionDisabled(player);

  // ------------------- state data -------------------------------
  /**
   * For certain states, we are comparing current state to the previous state to decide
   * if we want to update to the latest state or keep using the existing one.
   * By exclusively using the old states in a component, we can stop the component from re-rendering.
   * This is usefull if the part of the state updated does not effect this specific component iteration.
   */

  //---- liveScorePlayerMinuteTrackingState ----
  const { trackResultData } = useSelector(
    state => state.liveScorePlayerMinuteTrackingState,
    (curr, prev) => pmtStateIsEqual(curr, prev, player.playerId),
  );

  // ------------------- variables -------------------------------
  const playedPositions = useMemo(() => {
    let playerPositions = getPlayedPositions(trackResultData, player.playerId, teamId, period);
    return playerPositions;
  }, [trackResultData, player, period]);

  // ------------------- functions -------------------------------
  const updateDuration = (position, value) => {
    dispatch(
      liveScoreStatisticsUpdatePlayDuration({
        indexes: [position.index],
        value,
      }),
    );
  };

  // ------------------- render -------------------------------
  if (player.playerId === 0) {
    return null;
  }
  return (
    <>
      {playedPositions.map((position, index) => (
        <InputNumber
          key={`play_duration_${index}`}
          style={{ marginTop: isBasketball ? 18 : playedPositions.length > 1 ? 10 : 0 }}
          size="small"
          type="number"
          min="0"
          value={position.duration}
          onChange={value => updateDuration(position, value)}
          disabled={disabled}
        />
      ))}
      {!!statsSettings?.positionTrack ? <div style={{ height: '20px' }}></div> : null}
    </>
  );
};

export default StatisticsDurations;

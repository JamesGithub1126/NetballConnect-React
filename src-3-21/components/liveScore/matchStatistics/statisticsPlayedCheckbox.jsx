import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox } from 'antd';
import { getPlayedPositions, isAttentionDisabled, pmtStateIsEqual } from './statisticsUtils';
import {
  liveScoreStatisticsUpdatePlayedState,
  liveScoreStatisticsUpdatePlayDuration,
} from 'store/actions/LiveScoreAction/liveScorePlayerMinuteTrackingAction';
import { FLAVOUR } from 'util/enums';

const isBasketball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball;

const StatisticsPlayedCheckbox = ({
  player,
  period,
  periodDuration,
  competition,
  teamId,
  statsSettings,
}) => {
  const { secondsTrack } = statsSettings;
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
    return getPlayedPositions(trackResultData, player.playerId, teamId, period);
  }, [trackResultData, player, period]);

  // ------------------- functions -------------------------------
  const isPlayed = () => {
    if (!playedPositions || playedPositions.length <= 0) {
      return false;
    }
    const position = playedPositions[0];
    if (competition.gameTimeTracking) {
      if (competition.gameTimeTrackingType !== 0) {
        return position.playedEndPeriod;
      } else {
        return position.playedFullPeriod;
      }
    } else if (competition.attendanceRecordingPeriod === 'MINUTE') {
      return position.duration > 0;
    } else {
      return position.playedInPeriod;
    }
  };

  const updatePlayedState = checked => {
    const indexes = playedPositions.map(i => i.index);
    const duration = checked ? Math.ceil(periodDuration / Math.max(playedPositions.length, 1)) : 0;
    if (!secondsTrack) {
      dispatch(
        liveScoreStatisticsUpdatePlayedState({
          indexes,
          playedFullPeriod: checked,
          playedEndPeriod: checked,
          playedInPeriod: checked,
          duration: duration,
          statsSettings,
          playerId: player.playerId,
        }),
      );
    } else {
      dispatch(
        liveScoreStatisticsUpdatePlayDuration({
          indexes: indexes,
          value: duration,
        }),
      );
    }
  };

  // ------------------- render -------------------------------
  return player.playerId === 0 ? (
    <></>
  ) : (
    <>
      <div
        className="d-flex justify-content-center"
        style={{
          height: '32px',
          marginTop: playedPositions.length > 1 ? 10 : 0,
        }}
      >
        <Checkbox
          checked={isPlayed()}
          onChange={e => updatePlayedState(e.target.checked)}
          disabled={disabled}
        />
      </div>
      {!!statsSettings?.positionTrack ? <div style={{ height: '20px' }}></div> : null}
    </>
  );
};

export default StatisticsPlayedCheckbox;

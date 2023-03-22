import React, { useMemo } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { Select } from 'antd';
import AppImages from 'themes/appImages';
import { getPlayedPositions, isAttentionDisabled, pmtStateIsEqual } from './statisticsUtils';
import {
  liveScoreStatisticsUpdatePositionAction,
  liveScoreStatisticsRemovePositionAction,
} from 'store/actions/LiveScoreAction/liveScorePlayerMinuteTrackingAction';
import * as _ from 'lodash';
import { isEqual } from 'lodash';
import { isNotNullAndUndefined } from 'util/helpers';
import AppConstants from 'themes/appConstants';
const { Option } = Select;

const StatisticsPlayerPosition = ({
  player,
  period,
  addPosition,
  periodDuration,
  statsSettings,
  teamId,
}) => {
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

  //---- liveScoreGamePositionState ----
  const { positionData } = useSelector(
    state => state.liveScoreGamePositionState,
    (curr, prev) => isEqual(curr.positionData, prev.positionData),
  );

  // ------------------- variables -------------------------------
  const playedPositions = useMemo(() => {
    let playerPositions = getPlayedPositions(trackResultData, player.playerId, teamId, period);
    return playerPositions;
  }, [trackResultData, player, period]);

  // ------------------- functions -------------------------------

  const updatePosition = (position, value) => {
    dispatch(
      liveScoreStatisticsUpdatePositionAction({
        position,
        periodDuration,
        statsSettings,
        value,
        period,
      }),
    );
  };

  const removePosition = position => {
    const isLastPosition = playedPositions.length === 1;
    let indexes = [position.index];
    let pmtIds = [position.id];
    let newRecNums = [position.newRecNum];

    dispatch(
      liveScoreStatisticsRemovePositionAction({
        indexes,
        pmtIds,
        newRecNums,
        periodDuration,
        statsSettings,
        playerId: player.playerId,
        period,
        player: player,
        isLastPosition,
      }),
    );
  };

  // ------------------- render -------------------------------
  return player.playerId === 0 ? (
    <></>
  ) : (
    <>
      {playedPositions.map((position, index) => (
        <div key={`positions_${index}`} className="statistic-position">
          <Select
            className="year-select reg-filter-select1 table-cell-select w-100"
            size="small"
            style={{ marginTop: playedPositions.length > 1 ? 10 : 0 }}
            value={position.positionId}
            onChange={value => updatePosition(position, value)}
            disabled={disabled}
          >
            {positionData.map(pos => (
              <Option key={`position1_${pos.id}_${index}`} value={pos.id}>
                <span>{!position.positionId === undefined ? 'bad pos' : pos.name}</span>
              </Option>
            ))}
          </Select>
          <img
            src={AppImages.closeIcon}
            alt="Remove Position"
            style={{
              cursor: 'pointer',
              marginLeft: '4px',
              marginTop: playedPositions.length > 1 ? 10 : 0,
            }}
            onClick={() => removePosition(position)}
            width="16"
            height="16"
          />
        </div>
      ))}
      <div style={{ height: '20px' }}>
        <a className="add-pos-link" onClick={() => addPosition(player, period)} disabled={disabled}>
          + Add Position
        </a>
      </div>
    </>
  );
};

export default StatisticsPlayerPosition;

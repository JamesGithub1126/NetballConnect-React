import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputNumber } from 'antd';
import {
  liveScorePlayerScoreAddAction,
  liveScorePlayerScoreUpdateAction,
} from 'store/actions/LiveScoreAction/liveScorePlayerMatchScoreAction';
import { GameStats } from 'enums/enums';
import { actionStateIsEqual, getPlayerActions, isAttentionDisabled } from './statisticsUtils';
import { isBasketball } from '../liveScoreSettings/liveScoreSettingsUtils';
import { isNotNullAndUndefined } from 'util/helpers';

const StatisticsShirtNumber = ({
  matchId,
  teamId,
  player,
  period,
  gameStatId,
  competitionId,
  statsSettings,
}) => {
  const [lineupData, setlineupData] = useState({
    shirt: player.lineup && player.lineup.length > 0 ? player?.lineup[0]?.shirt : null,
    lineupId: player.lineup && player.lineup.length > 0 ? player?.lineup[0]?.id : null,
  });
  const dispatch = useDispatch();
  const disabled = isAttentionDisabled(player);

  // ------------------- state data -------------------------------
  /**
   * For certain states, we are comparing current state to the previous state to decide
   * if we want to update to the latest state or keep using the existing one.
   * By exclusively using the old states in a component, we can stop the component from re-rendering.
   * This is usefull if the part of the state updated does not effect this specific component iteration.
   */

  //---- liveScorePlayerActionState ----
  const { playerActions } = useSelector(
    state => state.liveScorePlayerActionState,
    (curr, prev) => actionStateIsEqual(curr, prev, player.playerId, gameStatId, period),
  );

  // ------------------- variables -------------------------------
  const playerActionsMemo = useMemo(() => {
    let actions = getPlayerActions(playerActions, gameStatId, player, teamId, 1, 1);
    return actions;
  }, [playerActions]);

  // ------------------- functions -------------------------------
  const getShirtNumber = () => {
    const storedData = playerActionsMemo.find(
      a =>
        a.gameStatId === GameStats.shirtNumber &&
        a?.contributors?.find(c => c.playerId === player.playerId),
    );
    if (!storedData) {
      if (isNotNullAndUndefined(lineupData?.shirt)) {
        return lineupData.shirt;
      }
      return null;
    }
    return storedData.actionCount;
  };

  const updateShirtNumber = value => {
    const playerId = player.playerId;
    const lineupId = lineupData?.lineupId;
    const action =
      playerActionsMemo &&
      playerActionsMemo.find(
        a =>
          a.gameStatId === GameStats.shirtNumber &&
          a?.contributors?.find(c => c.playerId === player.playerId),
      );
    if (isNotNullAndUndefined(action?.index)) {
      dispatch(
        liveScorePlayerScoreUpdateAction({
          index: action.index,
          actionCount: value,
          valueKind: 1,
          teamId,
          playerId,
          gameStatId,
        }),
      );
    } else {
      dispatch(
        liveScorePlayerScoreAddAction({
          matchId,
          teamId,
          period,
          gameStatId,
          actionCount: value,
          playerId: player.playerId,
          lineupId: lineupId,
          competitionId: competitionId,
          position: null,
          valueKind: 1,
          actionCategoryRefId: 1,
          outcomeRefId: 1,
          contributionRefId: 1,
        }),
      );
    }
  };

  //------------------- useEffect -------------------------------

  useEffect(() => {
    setlineupData({
      shirt: player.lineup && player.lineup.length > 0 ? player?.lineup[0]?.shirt : null,
      lineupId: player.lineup && player.lineup.length > 0 ? player?.lineup[0]?.id : null,
    });
  }, [player.lineup]);

  // ------------------- render -------------------------------
  return player.playerId === 0 ? (
    <></>
  ) : (
    <>
      <InputNumber
        size="small"
        type="number"
        min="0"
        style={{ maxWidth: '60px' }}
        value={getShirtNumber()}
        onChange={value => updateShirtNumber(value)}
        disabled={disabled}
      />
      {!!statsSettings?.positionTrack ? <div style={{ height: '20px' }}></div> : null}
    </>
  );
};

export default StatisticsShirtNumber;

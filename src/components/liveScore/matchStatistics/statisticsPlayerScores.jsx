import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InputNumber } from 'antd';
import {
  liveScorePlayerScoreAddAction,
  liveScorePlayerScoreUpdateAction,
  liveScoreClearTeamActions,
} from 'store/actions/LiveScoreAction/liveScorePlayerMatchScoreAction';
import {
  getPlayedPositions,
  getPlayerActions,
  actionStateIsEqual,
  pmtStateIsEqual,
  isAttentionDisabled,
} from './statisticsUtils';
import { GamePosition, GameStats, ValueKind } from 'enums/enums';
import { isEqual, groupBy } from 'lodash';
import { isBasketball, isFootball, isNetball } from '../liveScoreSettings/liveScoreSettingsUtils';
import AppConstants from 'themes/appConstants';
import { checkIsMultiPeriod } from 'util/sessionStorage';
import AppImages from 'themes/appImages';

const isMultiPeriod = checkIsMultiPeriod();
const canClearUnknownScores = isNetball;

const StatisticsPlayerScores = ({
  matchId,
  teamType,
  teamId,
  player,
  period,
  gameStatId,
  readonly,
  valueKind,
  statsSettings,
}) => {
  const dispatch = useDispatch();

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
    (curr, prev) => actionStateIsEqual(curr, prev, player.playerId, gameStatId, teamType, period),
  );
  //---- liveScorePlayerMinuteTrackingState ----
  const { trackResultData } = useSelector(
    state => state.liveScorePlayerMinuteTrackingState,
    (curr, prev) => pmtStateIsEqual(curr, prev, player.playerId),
  );
  //---- liveScoreGamePositionState ----
  const { gameStatList } = useSelector(
    state => state.liveScoreGamePositionState,
    (curr, prev) => (isEqual(curr.gameStatList, prev.gameStatList) ? prev : curr),
  );

  // ------------------- variables -------------------------------

  const gameStatData = useMemo(() => {
    return groupBy(gameStatList, 'id');
  }, [gameStatList]);

  const playedPositions = useMemo(() => {
    let positions = getPlayedPositions(trackResultData, player.playerId, teamId, period);
    return positions;
  }, [trackResultData, player, period]);

  const playerActionsMemo = useMemo(() => {
    let actions = getPlayerActions(playerActions, gameStatId, player, teamId, valueKind, period);
    return actions;
  }, [playerActions]);

  const basketballTotalPoints = useMemo(() => {
    let filtered = playerActionsMemo.filter(
      i =>
        i.gameStatId === GameStats.Ftm &&
        (i.value === ValueKind.FTM || i.value === ValueKind.PM2 || i.value === ValueKind.PM3),
    );

    let totalPoints = 0;
    for (let action of filtered) {
      if (action.value && action.actionCount) {
        totalPoints += action.value * action.actionCount;
      }
    }
    return totalPoints;
  }, [player, teamId, playerActionsMemo]);

  // ------------------- functions -------------------------------
  const findPlayerActionIndex = position => {
    const action =
      player.playerId === 0
        ? playerActionsMemo.find(a => a.isUnlinked)
        : playerActionsMemo.find(
            i =>
              !!i.contributors?.find(
                c =>
                  (position.id && position.id === c.pmtId) ||
                  (!position.id && position.newRecNum === c.newRecNum),
              ),
          );

    if (action) {
      return action.index;
    }
    return -1;
  };

  const getPlayerActionValue = position => {
    if (gameStatId === GameStats.TotalPoints) {
      return basketballTotalPoints;
    }

    const index = findPlayerActionIndex(position);
    if (index >= 0) {
      return playerActions[index].actionCount;
    }
    return null;
  };

  const updatePlayerAction = (position, actionCount) => {
    const index = findPlayerActionIndex(position);
    const playerId = position.playerId;
    const actionCategoryRefId = gameStatData[gameStatId][0].actionCategoryRefId;
    const outcomeRefId = gameStatData[gameStatId][0].outcomeRefId;
    const contributionRefId = gameStatData[gameStatId][0].contributionRefId;
    if (index >= 0) {
      dispatch(
        liveScorePlayerScoreUpdateAction({
          index,
          playerId,
          valueKind,
          actionCount,
        }),
      );
    } else {
      dispatch(
        liveScorePlayerScoreAddAction({
          matchId,
          teamId,
          period,
          gameStatId,
          actionCount,
          playerId: player.playerId,
          position,
          valueKind,
          actionCategoryRefId,
          outcomeRefId,
          contributionRefId,
        }),
      );
    }
  };

  const handleClearScores = () => {
    dispatch(
      liveScoreClearTeamActions({
        teamId: player.teamId,
        period: period,
      }),
    );
  };

  // ------------------- render -------------------------------
  return (
    <>
      {playedPositions.map((position, index) => {
        const key = `${position.id ? position.id : 0}_${
          position.newRecNum ? position.newRecNum : 0
        }_${index}`;
        const positionId = position.positionId;
        const disabled =
          //only GS and GA can add scores in Neball
          (isNetball &&
            positionId !== GamePosition.GoalShooter &&
            positionId !== GamePosition.GoalAttack) ||
          // Only Penalty shooter can add penalty score
          (isFootball &&
            gameStatId === GameStats.penalty &&
            positionId !== GamePosition.PenaltyShooter);
        return (
          <div style={{ position: 'relative' }} key={`div_${key}`}>
            {canClearUnknownScores &&
            position.playerId === 0 &&
            [GameStats.Goals, GameStats.TotalPoints].includes(gameStatId) ? (
              <img
                src={AppImages.closeIcon}
                alt="Remove Position"
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  left: '-32px',
                  top: '8px',
                  zIndex: 2,
                }}
                onClick={handleClearScores}
                width="16"
                height="16"
              />
            ) : null}
            <InputNumber
              key={`player_score${key}`}
              size="small"
              type="number"
              min="0"
              style={{
                marginTop: playedPositions.length > 1 ? 10 : 0,
                zIndex: 1,
              }}
              value={getPlayerActionValue(position)}
              onChange={value => updatePlayerAction(position, value)}
              disabled={isAttentionDisabled(player) || readonly || disabled}
            />
          </div>
        );
      })}
      {!!statsSettings?.positionTrack && player.playerId !== 0 ? (
        <div style={{ height: '20px' }}></div>
      ) : null}
    </>
  );
};

export default StatisticsPlayerScores;

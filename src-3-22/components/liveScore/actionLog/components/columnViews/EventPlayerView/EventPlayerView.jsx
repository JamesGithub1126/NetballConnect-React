import { Select } from 'antd';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AppConstants from 'themes/appConstants';
import { canShowBenchFoulOption } from '../../../api';
import { useSetEventPlayer } from '../../../hooks';
import styles from '../../actionLog.module.scss';
const { Option } = Select;

export default function EventPlayerView({ matchEvent }) {
  //hooks
  const setEventPlayer = useSetEventPlayer();
  const matchDetails = useSelector(state => state.LiveScoreMatchState?.matchDetails) || {};
  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList) || {};
  const { team1players = [], team2players = [] } = matchDetails;

  //values
  const playerList = useMemo(() => {
    if (matchEvent.attribute1Key === 'team1') {
      return team1players;
    } else if (matchEvent.attribute1Key === 'team2') {
      return team2players;
    } else {
      return [...team1players, ...team2players];
    }
  }, [matchEvent.teamId, matchEvent.attribute1Key, matchDetails]);

  const showBenchFoulOption = useMemo(() => {
    return canShowBenchFoulOption(matchEvent, gameStatList);
  }, [matchEvent.type, gameStatList]);

  //jsx
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
      onChange={player => setEventPlayer(matchEvent, player)}
      value={
        matchEvent.playerId
          ? matchEvent.playerId
          : matchEvent.attribute3Key === 'isBenchFoul'
          ? AppConstants.bench
          : ''
      }
    >
      {showBenchFoulOption ? (
        <Option value="bench" key={'benchOption'}>
          {AppConstants.bench}
        </Option>
      ) : null}

      {playerList &&
        playerList?.map((item, index) => (
          <Option key={`playerlist_${index}_${item.id}`} value={item.playerId}>
            {item.firstName + ' ' + item.lastName}
          </Option>
        ))}
    </Select>
  );
}

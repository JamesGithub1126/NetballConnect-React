import { Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { useSetEventTeam } from '../../../hooks';
import styles from '../../actionLog.module.scss';
const { Option } = Select;

export default function EventTeamView({ matchEvent }) {
  //hooks
  const setEventTeam = useSetEventTeam();
  const teamListing = useSelector(state => state.LiveScoreMatchLogState?.teamListing) || [];

  //jsx
  if (['pause', 'resume'].includes(matchEvent.type)) {
    return (
      <div className="w-100 d-flex justify-content-center">
        <div className="w-100 d-flex justify-content-center">
          <span>_</span>
        </div>
      </div>
    );
  }

  return (
    <Select
      className={`year-select ${styles.select}`}
      onChange={team => setEventTeam(matchEvent, team)}
      value={matchEvent.teamId}
    >
      {teamListing?.map((item, index) => (
        <Option key={'teamlist' + index} value={item.teamId}>
          {item.teamName}
        </Option>
      ))}
    </Select>
  );
}

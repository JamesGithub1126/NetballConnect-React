import React from 'react';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';

const { Option } = Select;

const mediumSelectStyles = {
  width: '100%',
  paddingRight: 1,
  minWidth: 182,
  maxWidth: 300,
};

const containerViewStyles = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '10px',
}

const MatchPlayerPointCard = (props) => {
  
  const handleSelectOptionChange = (playerId, point, pointIndex) => {
    if (playerId) {
      const player = props.players.find(p => p.playerId === playerId)
      props.handlerPlayerPoint(player, Number(point), Number(pointIndex));
    }
  };

  const findPlayer = (points, pointIndex) => {
    const { players, playerPoints } = props;
    const item = playerPoints
      ?.filter(t => t.points === Number(points) && t.pointIndex === Number(pointIndex))
      ?.filter(t => {
        return undefined !== players.find(
          p => t.playerId == p.playerId && t.teamId == p.teamId
        )
      })
      ?.shift();
    return item ? Number(item.playerId) : undefined;
  }

  return (
    <div>
      <div className="mt-4" style={containerViewStyles}>
        <div>{props.title}</div>
        {props.bestAndFairest && props.bestAndFairest.receivePoints.map((points, index) => (
          <div key={index} className="row mt-4">
            <div className="col-sm">
              <div className="d-flex align-items-center">
                <Select
                  value={findPlayer(points, index)}
                  placeholder="Select Player"
                  style={mediumSelectStyles}
                  onChange={playerId => handleSelectOptionChange(playerId, points, index)}
                >
                  {props.players.map(player => (
                    <Option key={`${points}-${player.playerId}`} value={player.playerId}>
                      {player.name}
                    </Option>
                  ))}
                </Select>
                <div className="ml-4 pl-4">{points} {AppConstants.points}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

MatchPlayerPointCard.defaultProps = {
  title: String,
  players: [],
  bestAndFairest: Object
};

export default MatchPlayerPointCard;
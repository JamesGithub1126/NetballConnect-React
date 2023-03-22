import { Tooltip } from 'antd';
import React from 'react';
import AppConstants from 'themes/appConstants';

export default function EventGameTimeView({ matchEvent = {} }) {
  //jsx
  if (matchEvent.eventCategory !== 'stat') {
    return null;
  }
  return (
    <div>
      <span>{matchEvent.gameTime}</span>
      {matchEvent.timeUpdated ? (
        <Tooltip
          arrowPointAtCenter={true}
          overlayInnerStyle={{
            fontSize: '14px',
          }}
          title={AppConstants.saveToSeeEventMinuteUpdate}
        >
          <i className="fa fa-warning ml-2" aria-hidden="true" style={{ color: 'red' }} />
        </Tooltip>
      ) : null}
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Button, Checkbox, Modal } from 'antd';
import { flatten } from 'lodash';

import AppConstants from '../../themes/appConstants';

export function AffectedDrawsModal({ affectedDraws = {}, onClose, onSave }) {
  const allAffectedDraws = useMemo(() => flatten(Object.values(affectedDraws)), []);
  const [updatedDraws, setUpdatedDraws] = useState([]);

  const regenerateDraw = () => {
    // swap the teams
    const lockDraws = allAffectedDraws
      .filter(draw => updatedDraws.includes(draw.id))
      .map(draw => ({
        roundId: draw.round?.systemRoundId ? draw.round.systemRoundId : null,
        homeTeamId: draw.team2,
        awayTeamId: draw.team1,
        gradeId: draw.competitionDivisionGradeId,
        divisionId: draw.competitionDivisionGrade?.competitionDivisionId,
      }));
    onSave(lockDraws);
    onClose();
  };

  return (
    <Modal
      title={AppConstants.affectedDraws}
      className="affected-matches"
      visible={true}
      onCancel={() => onClose()}
      footer={[
        <Button onClick={() => onClose()}>{AppConstants.cancel}</Button>,
        <Button
          disabled={!Object.keys(updatedDraws).length}
          type="primary"
          onClick={() => regenerateDraw()}
        >
          {AppConstants.save}
        </Button>,
      ]}
    >
      <div>
        <div>{AppConstants.affectedDrawsHeading}</div>
        {allAffectedDraws.map(affectedDraw => (
          <div className="mb-3">
            <Checkbox
              className="single-checkbox"
              checked={updatedDraws.includes(affectedDraw.id)}
              onChange={e => {
                if (e.target.checked) {
                  setUpdatedDraws(updatedDraws.concat(affectedDraw.id));
                } else {
                  setUpdatedDraws(updatedDraws.filter(draw => draw !== affectedDraw.id));
                }
              }}
            >
              <span>
                {affectedDraw.round.name}: {affectedDraw.team1Name} vs {affectedDraw.team2Name}
              </span>
            </Checkbox>
          </div>
        ))}
      </div>
    </Modal>
  );
}

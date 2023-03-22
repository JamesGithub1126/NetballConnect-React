import React, { useMemo } from 'react';
import AppConstants from '../../themes/appConstants';
import { FLAVOUR } from '../../util/enums';

const isNetball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Netball;
const isFootball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Football;
const isBasketball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Basketball;

export const getUnitName = attendance => {
  return attendance === 'MATCH' || attendance === 'GAME'
    ? AppConstants.unitGames
    : attendance === 'PERIOD'
    ? AppConstants.unitPeriods
    : AppConstants.unitMinutes;
};

export const getTimeOnCourt = attendance => {
  if (isNetball || isFootball) {
    const title =
      attendance === 'MATCH' || attendance === 'GAME'
        ? AppConstants.titleGames
        : attendance === 'PERIOD'
        ? AppConstants.titlePeriods
        : AppConstants.titleMinutes;
    const desc =
      attendance === 'MATCH' || attendance === 'GAME'
        ? AppConstants.playedGames
        : attendance === 'PERIOD'
        ? AppConstants.playedPeriods
        : AppConstants.playedMinutes;
    return { title, desc };
  }
  return null;
};

export const LiveScorePersonalStatsDesc = ({ attendance }) => {
  const toc = useMemo(() => getTimeOnCourt(attendance), [attendance]);

  return (
    <>
      {isFootball && (
        <div className="mt-5 mb-5 comp-legends">
          <div>
            <span>{AppConstants.goalAbbr} = </span>
            <span>{AppConstants.goal}</span>
          </div>
          <div>
            <span>{AppConstants.penaltyAbbr} = </span>
            <span>{AppConstants.goalsPenalties}</span>
          </div>
          <div>
            <span>{AppConstants.assistAbbr} = </span>
            <span>{AppConstants.assists}</span>
          </div>
          <div>
            <span>{AppConstants.ownGoalAbbr} = </span>
            <span>{AppConstants.ownGoals}</span>
          </div>
          <div>
            <span>{AppConstants.yellowCardTDAbbr} = </span>
            <span>{AppConstants.yellowCardTD}</span>
          </div>
          <div>
            <span>{AppConstants.yellowCardAbbr} = </span>
            <span>{AppConstants.yellowCard}</span>
          </div>
          <div>
            <span>{AppConstants.redCardAbbr} = </span>
            <span>{AppConstants.redCard}</span>
          </div>
          <div>
            <span>{AppConstants.cornerAbbr} = </span>
            <span>{AppConstants.corner}</span>
          </div>
          <div>
            <span>{AppConstants.foulAbbr} = </span>
            <span>{AppConstants.foul}</span>
          </div>
          <div>
            <span>{AppConstants.offsideAbbr} = </span>
            <span>{AppConstants.offside}</span>
          </div>
          <div>
            <span>{AppConstants.onTargetAbbr} = </span>
            <span>{AppConstants.shotOnTarget}</span>
          </div>
          <div>
            <span>{AppConstants.offTargetAbbr} = </span>
            <span>{AppConstants.shotOffTarget}</span>
          </div>
          <div>
            <span>{toc.title} = </span>
            <span>{toc.desc}</span>
          </div>
        </div>
      )}
      {isBasketball && (
        <div className="mt-5 mb-5 comp-legends">
          <div>
            <span>{AppConstants.PTS} = </span>
            <span>{AppConstants.points}</span>
          </div>
          <div>
            <span>{AppConstants.FTM} = </span>
            <span>{AppConstants.freeThrowsMade}</span>
          </div>
          <div>
            <span>{AppConstants['2PM']} = </span>
            <span>{AppConstants['2pointsShotsMade']}</span>
          </div>
          <div>
            <span>{AppConstants['3PM']} = </span>
            <span>{AppConstants['3pointsShotsMade']}</span>
          </div>
          <div>
            <span>{AppConstants.PF} = </span>
            <span>{AppConstants.personalFouls}</span>
          </div>
          <div>
            <span>{AppConstants.TF} = </span>
            <span>{AppConstants.technicalFouls}</span>
          </div>
        </div>
      )}
      {isNetball && (
        <div className="mt-5 mb-5 comp-legends">
          <div>
            <span>{AppConstants.positionAbbr} = </span>
            <span>{AppConstants.position}</span>
          </div>
          <div>
            <span>{AppConstants.goalAbbr} = </span>
            <span>{AppConstants.goal}</span>
          </div>
          <div>
            <span>{AppConstants.missAbbr} = </span>
            <span>{AppConstants.miss}</span>
          </div>
          <div>
            <span>{toc.title} = </span>
            <span>{toc.desc}</span>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import StatisticsPlayerPosition from './statisticsPlayerPosition';
import StatisticsPlayerScores from './statisticsPlayerScores';
import StatisticsDurations from './statisticsDurations';
import StatisticsPlayedCheckbox from './statisticsPlayedCheckbox';
import StatisticsShirtNumber from './statisticsShirtNumber';
import AppConstants from 'themes/appConstants';
import { GameStats, ValueKind } from 'enums/enums';
import { FLAVOUR } from 'util/enums';
import { checkIsAttRcrdMatch } from 'util/sessionStorage';

const isNetball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Netball;
const isFootball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Football;
const isBasketball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball;

const netBallRecordColumns = [
  { title: AppConstants.goals, key: GameStats.Goals },
  { title: AppConstants.misses, key: GameStats.Misses },
  { title: 'P Miss', key: GameStats.PMisses },
];

export default function createColumns(
  competition,
  periodDuration,
  addPosition,
  showPlayerStatus,
  gameStatList,
  statsSettings,
  teamType,
) {
  const competitionId = competition.id;

  const {
    matchId,
    teamId,
    attndceRecrd,
    positionTrack,
    gameTimeTrack,
    secondsTrack,
    gameTimeTrackingType,
    matchPeriods,
    recordGoalAttempts,
    enhancedStatistics,
  } = statsSettings;

  const getGameStateName = stateId => {
    return gameStatList?.find(x => x.id === stateId)?.name || '';
  };

  const counter = size => {
    return new Array(size).fill(0).map((value, index) => index + 1);
  };
  const isPlayedTitle = gameTimeTrack
    ? gameTimeTrackingType == 0
      ? AppConstants.playedFullPeriod
      : AppConstants.playedAtEndPeriod
    : AppConstants.played;

  const createBasketballStatsList = () => {
    let columns = [];
    if (recordGoalAttempts) {
      columns = [
        { title: AppConstants.totalPoints, key: GameStats.TotalPoints, disabled: true },
        { title: AppConstants.ftm, key: GameStats.Ftm, value: ValueKind.FTM },
        { title: AppConstants.ftmiss, key: GameStats.Ftmiss, value: ValueKind.FTM },
        { title: AppConstants.pm2, key: GameStats.Pm2, value: ValueKind.PM2 },
        { title: AppConstants.p2miss, key: GameStats.P2miss, value: ValueKind.PM2 },
        { title: AppConstants.pm3, key: GameStats.Pm3, value: ValueKind.PM3 },
        { title: AppConstants.p3miss, key: GameStats.P3miss, value: ValueKind.PM3 },
        { title: AppConstants.pf, key: GameStats.Pf },
        { title: AppConstants.tf, key: GameStats.Tf, extraKey: 'recordGoal' },
      ];
    } else {
      columns = [
        { title: AppConstants.totalPoints, key: GameStats.TotalPoints, disabled: true },
        { title: AppConstants.ftm, key: GameStats.Ftm, value: ValueKind.FTM },
        { title: AppConstants.pm2, key: GameStats.Pm2, value: ValueKind.PM2 },
        { title: AppConstants.pm3, key: GameStats.Pm3, value: ValueKind.PM3 },
        { title: AppConstants.pf, key: GameStats.Pf },
        { title: AppConstants.tf, key: GameStats.Tf, extraKey: 'recordGoal' },
      ];
    }
    return columns;
  };

  const createBasketballExtraStatsList = () => {
    if (recordGoalAttempts) {
      return [];
    }
    let columns = [];
    if (attndceRecrd === 'MINUTE') {
      columns = [
        { title: AppConstants.ftm, key: GameStats.Ftm, value: ValueKind.FTM },
        { title: AppConstants.pm2, key: GameStats.Pm2, value: ValueKind.PM2 },
        { title: AppConstants.pm3, key: GameStats.Pm3, value: ValueKind.PM3 },
        { title: AppConstants.pf, key: GameStats.Pf },
        { title: AppConstants.tf, key: GameStats.Tf, extraKey: 'recordGoal' },
      ];
    } else if (attndceRecrd === 'PERIOD') {
      columns = [
        { title: AppConstants.ftm, key: GameStats.Ftm, value: ValueKind.FTM },
        { title: AppConstants.pm2, key: GameStats.Pm2, value: ValueKind.PM2 },
        { title: AppConstants.pm3, key: GameStats.Pm3, value: ValueKind.PM3 },
        { title: AppConstants.pf, key: GameStats.Pf },
        { title: AppConstants.tf, key: GameStats.Tf, extraKey: 'recordGoal' },
      ];
    }
    return columns;
  };

  const createFootballStatsList = () => {
    let columns = [];
    if (recordGoalAttempts) {
      columns = columns.concat([
        GameStats.goal,
        GameStats.goalAssist,
        GameStats.penalty,
        GameStats.ownGoal,
      ]);
    }
    if (enhancedStatistics) {
      columns = columns.concat([
        GameStats.corner,
        GameStats.foul,
        GameStats.offside,
        GameStats.onTarget,
        GameStats.offTarget,
      ]);
    }
    columns = columns.concat([GameStats.yellowCardTD, GameStats.yellowCard, GameStats.redCard]);
    return columns.map(statId => ({
      key: statId,
      title: getGameStateName(statId),
    }));
  };

  const createPlayerStatsList = () => {
    if (isNetball) {
      if (recordGoalAttempts) {
        return [...netBallRecordColumns];
      }
    } else if (isBasketball) {
      return createBasketballStatsList();
    } else if (isFootball) {
      return createFootballStatsList();
    }
    return [];
  };

  const getExtraStatsList = () => {
    if (isBasketball) {
      return createBasketballExtraStatsList();
    }
    return [];
  };
  const playerNameColumn = {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    width: 80,
    fixed: window.innerWidth >= 768 ? 'left' : null,
    render: (name, record) => {
      const { suspended } = record;

      return (
        <>
          <span>
            <span style={{ textDecoration: suspended ? 'line-through' : 'none' }}>{name}</span>
            {suspended && <span className="ml-1">S</span>}
          </span>
          {!!positionTrack && record.playerId !== 0 ? <div style={{ height: '20px' }}></div> : null}
        </>
      );
    },
  };

  const playerStatusColumn = {
    title: AppConstants.status,
    dataIndex: 'statusRef',
    key: 'statusRef',
    width: 80,
    render: statusRef => {
      return (
        <>
          <span>{statusRef}</span>
          {!!positionTrack ? <div style={{ height: '20px' }}></div> : null}
        </>
      );
    },
  };

  const createGameStatsColumns = (period, factory) => {
    if (!isBasketball && !positionTrack) {
      return [];
    }
    return factory().map(column => ({
      title: column.title,
      key: `${column.key}${period}`,
      width: 40,
      render: (p, player) => {
        return (
          <StatisticsPlayerScores
            matchId={matchId}
            teamType={teamType}
            teamId={teamId}
            player={player}
            period={period}
            gameStatId={column.key}
            valueKind={column.value ? column.value : 1}
            statsSettings={statsSettings}
            readonly={Boolean(column.disabled)}
          />
        );
      },
    }));
  };

  const createPlayerScoreColumns = period => {
    return createGameStatsColumns(period, createPlayerStatsList);
  };

  const createExtraScoreColumns = period => {
    return createGameStatsColumns(period, getExtraStatsList);
  };

  const createShirtNumberColumn = period => {
    return [
      {
        title: isFootball ? AppConstants.shirtNumber : AppConstants.jersey,
        key: `shirtNumber_${period}`,
        width: 50,
        fixed: window.innerWidth >= 768 ? 'left' : null,
        render: (p, player) => {
          return (
            <StatisticsShirtNumber
              matchId={matchId}
              teamId={teamId}
              player={player}
              period={period}
              gameStatId={GameStats.shirtNumber}
              competitionId={competitionId}
              statsSettings={statsSettings}
            />
          );
        },
      },
    ];
  };

  const createPositionColumn = period => {
    if (positionTrack) {
      return [
        {
          title: AppConstants.position,
          key: `position${period}`,
          width: 150,
          render: (p, player) => {
            return (
              <StatisticsPlayerPosition
                player={player}
                period={period}
                addPosition={addPosition}
                periodDuration={periodDuration}
                statsSettings={statsSettings}
                teamId={teamId}
              />
            );
          },
        },
      ];
    } else {
      return [];
    }
  };

  const createIsPlayedColumn = period => {
    const { positionTrack, gameTimeTrack, secondsTrack } = statsSettings;
    const hideCol =
      (positionTrack && !gameTimeTrack && secondsTrack) ||
      (positionTrack && !gameTimeTrack && !secondsTrack);

    return hideCol
      ? []
      : [
          {
            title: isPlayedTitle,
            key: `played${period}`,
            width: 40,
            align: 'center',
            render: (p, player) => {
              return (
                <StatisticsPlayedCheckbox
                  player={player}
                  period={period}
                  periodDuration={periodDuration}
                  matchId={matchId}
                  competition={competition}
                  teamId={teamId}
                  statsSettings={statsSettings}
                />
              );
            },
          },
        ];
  };

  const createDurationColumn = period => {
    if (attndceRecrd === 'MINUTE') {
      return [
        {
          title: AppConstants.seconds,
          key: `sec${period}`,
          width: 60,
          render: (p, player) => {
            return (
              <StatisticsDurations
                player={player}
                period={period}
                teamId={teamId}
                statsSettings={statsSettings}
              />
            );
          },
        },
      ];
    } else {
      return [];
    }
  };

  if (isNetball) {
    const columns = checkIsAttRcrdMatch()
      ? [
          playerNameColumn,
          ...createPositionColumn(1),
          ...createPlayerScoreColumns(1),
          ...createIsPlayedColumn(1),
          ...createDurationColumn(1),
        ]
      : [
          playerNameColumn,
          ...counter(matchPeriods).map(period => ({
            title: AppConstants[`period${period}`],
            children: [
              ...createPositionColumn(period),
              ...createPlayerScoreColumns(period),
              ...createIsPlayedColumn(period),
              ...createDurationColumn(period),
            ],
          })),
        ];
    if (showPlayerStatus) {
      columns.splice(1, 0, { ...playerStatusColumn });
    }
    return columns;
  } else if (isBasketball) {
    const columns = checkIsAttRcrdMatch()
      ? [
          playerNameColumn,
          ...createShirtNumberColumn(1),
          ...createPlayerScoreColumns(1),
          ...createIsPlayedColumn(1),
          ...createDurationColumn(1),
        ]
      : [
          playerNameColumn,
          ...createShirtNumberColumn(1),
          ...createPlayerScoreColumns(1),
          ...counter(matchPeriods).map(period => ({
            title: AppConstants[`period${period}`],
            children: [...createIsPlayedColumn(period), ...createDurationColumn(period)],
          })),
        ];
    if (showPlayerStatus) {
      columns.splice(2, 0, { ...playerStatusColumn });
    }
    return columns;
  } else if (isFootball) {
    const columns = checkIsAttRcrdMatch()
      ? [
          playerNameColumn,
          ...createShirtNumberColumn(1),
          ...createPositionColumn(1),
          ...createPlayerScoreColumns(1),
          ...createIsPlayedColumn(1),
          ...createDurationColumn(1),
        ]
      : [
          playerNameColumn,
          ...createShirtNumberColumn(1),
          ...createPositionColumn(1),
          ...createPlayerScoreColumns(1),
          ...counter(matchPeriods).map(period => ({
            title: AppConstants[`period${period}`],
            children: [...createIsPlayedColumn(period), ...createDurationColumn(period)],
          })),
        ];
    if (showPlayerStatus) {
      columns.splice(2, 0, { ...playerStatusColumn });
    }
    return columns;
  }

  return [];
}

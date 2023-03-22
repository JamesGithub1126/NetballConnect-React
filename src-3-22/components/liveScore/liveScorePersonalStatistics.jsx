import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Table } from 'antd';
import AppConstants from '../../themes/appConstants';
import { FLAVOUR } from '../../util/enums';
import { isTabletDevice, convertPlayerPositions } from '../../util/helpers';
import { LiveScorePersonalStatsDesc, getUnitName, getTimeOnCourt } from './liveScorePersonalStatsDesc';

const isNetball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Netball;
const isFootball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Football;
const isBasketball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Basketball;

const isMobile = isTabletDevice();

const columnWidth = value => {
  return isMobile ? value : undefined;
}

function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

const netballSeasonStatisticsColumns = [
  { dataIndex: 'name', key: 'name' },
  {
    title: AppConstants.positionAbbr,
    dataIndex: 'position',
    key: 'position',
    render: value => <span>{convertPlayerPositions(value)}</span>,
  },
  {
    title: AppConstants.goalAbbr,
    dataIndex: 'goal',
    key: 'goal',
    width: columnWidth(50),
  },
  {
    title: AppConstants.missAbbr,
    dataIndex: 'miss',
    key: 'miss',
    width: columnWidth(50),
  },
  {
    title: AppConstants.percentAbbr,
    dataIndex: 'goal_percent',
    key: 'goal_percent',
    render: (value) => (
      <span>{ (100 * Number(value)).toFixed(2) }%</span>
    )
  },
];

const netballMatchStatisticsColumns = [
  {
    title: AppConstants.homeTeam,
    dataIndex: 'team1Name',
    key: 'team1Name',
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'team2Name',
    key: 'team2Name',
  },
  {
    title: AppConstants.positionAbbr,
    dataIndex: 'position',
    key: 'position',
    render: value => <span>{convertPlayerPositions(value)}</span>,
  },
  {
    title: AppConstants.goalAbbr,
    dataIndex: 'goal',
    key: 'goal',
    width: columnWidth(50),
  },
  {
    title: AppConstants.missAbbr,
    dataIndex: 'miss',
    key: 'miss',
    width: columnWidth(50),
  },
  {
    title: AppConstants.percentAbbr,
    dataIndex: 'goal_percent',
    key: 'goal_percent',
    render: (value) => (
      <span>{ (100 * Number(value)).toFixed(2) }%</span>
    )
  },
];

const basketballSeasonStatisticsColumns = [
  { dataIndex: 'name', key: 'name' },
  {
    title: AppConstants.M,
    dataIndex: 'totalMatches',
    key: 'totalMatches',
    sorter: (a, b) => tableSort(a, b, 'totalMatches'),
  },
  {
    title: AppConstants.avgPTS,
    dataIndex: 'avg_pts',
    key: 'avg_pts',
    sorter: (a, b) => tableSort(a, b, 'avg_pts'),
    render: value => <span>{(+value).toFixed(1)}</span>,
  },
  {
    title: AppConstants.PTS,
    dataIndex: 'PTS',
    key: 'PTS',
    sorter: (a, b) => tableSort(a, b, 'PTS'),
  },
  {
    title: AppConstants['2P'],
    dataIndex: '2P',
    key: '2P',
    sorter: (a, b) => tableSort(a, b, '2P'),
  },
  {
    title: AppConstants['3P'],
    dataIndex: '3P',
    key: '3P',
    sorter: (a, b) => tableSort(a, b, '3P'),
  },
  {
    title: AppConstants.FT,
    dataIndex: 'FT',
    key: 'FT',
    sorter: (a, b) => tableSort(a, b, 'FT'),
  },
];

const basketballMatchStatisticsColumns = [
  {
    title: AppConstants.homeTeam,
    dataIndex: 'team1Name',
    key: 'team1Name',
    sorter: (a, b) => tableSort(a, b, 'team1Name'),
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'team2Name',
    key: 'team2Name',
    sorter: (a, b) => tableSort(a, b, 'team2Name'),
  },
  {
    title: AppConstants.PTS,
    dataIndex: 'PTS',
    key: 'PTS',
    sorter: (a, b) => tableSort(a, b, 'PTS'),
  },
  {
    title: AppConstants['2P'],
    dataIndex: '2P',
    key: '2P',
    sorter: (a, b) => tableSort(a, b, '2P'),
  },
  {
    title: AppConstants['3P'],
    dataIndex: '3P',
    key: '3P',
    sorter: (a, b) => tableSort(a, b, '3P'),
  },
  {
    title: AppConstants.FT,
    dataIndex: 'FT',
    key: 'FT',
    sorter: (a, b) => tableSort(a, b, 'FT'),
  },
];

const footballStatisticsColumns = [
  {
    title: AppConstants.goalAbbr,
    dataIndex: 'goal',
    key: 'goal',
  },
  {
    title: AppConstants.penaltyAbbr,
    dataIndex: 'penalty',
    key: 'penalty',
  },
  {
    title: AppConstants.assistAbbr,
    dataIndex: 'assist',
    key: 'assist',
  },
  {
    title: AppConstants.ownGoalAbbr,
    dataIndex: 'own_goal',
    key: 'own_goal',
  },
  {
    title: AppConstants.cornerAbbr,
    dataIndex: 'corner',
    key: 'corner',
  },
  {
    title: AppConstants.foulAbbr,
    dataIndex: 'foul',
    key: 'foul',
  },
  {
    title: AppConstants.offsideAbbr,
    dataIndex: 'offside',
    key: 'offside',
  },
  {
    title: AppConstants.onTargetAbbr,
    dataIndex: 'on_target',
    key: 'on_target',
  },
  {
    title: AppConstants.offTargetAbbr,
    dataIndex: 'off_target',
    key: 'off_target',
  },
];

const footballSentOffsColumns = [
  {
    title: AppConstants.yellowCardTDAbbr,
    dataIndex: 'yellow_card_TD',
    key: 'yellow_card_TD',
  },
  {
    title: AppConstants.yellowCardAbbr,
    dataIndex: 'yellow_card',
    key: 'yellow_card',
  },
  {
    title: AppConstants.redCardAbbr,
    dataIndex: 'red_card',
    key: 'red_card',
  },
];

const footballDetailedSentOffsColumns = [
  {
    title: AppConstants.yellowCardTDAbbr,
    dataIndex: 'yellow_card_TD',
    key: 'yellow_card_TD',
  },
  {
    title: AppConstants.YD,
    dataIndex: 'yd',
    key: 'yd',
  },
  {
    title: AppConstants.yellowCardAbbr,
    dataIndex: 'yellow_card',
    key: 'yellow_card',
  },
  {
    title: AppConstants.Y1,
    dataIndex: 'y1',
    key: 'y1',
  },
  {
    title: AppConstants.Y2,
    dataIndex: 'y2',
    key: 'y2',
  },
  {
    title: AppConstants.Y3,
    dataIndex: 'y3',
    key: 'y3',
  },
  {
    title: AppConstants.Y4,
    dataIndex: 'y4',
    key: 'y4',
  },
  {
    title: AppConstants.Y5,
    dataIndex: 'y5',
    key: 'y5',
  },
  {
    title: AppConstants.Y6,
    dataIndex: 'y6',
    key: 'y6',
  },
  {
    title: AppConstants.Y7,
    dataIndex: 'y7',
    key: 'y7',
  },
  {
    title: AppConstants.Y8,
    dataIndex: 'y8',
    key: 'y8',
  },
  {
    title: AppConstants.redCardAbbr,
    dataIndex: 'red_card',
    key: 'red_card',
  },
  {
    title: AppConstants.R1,
    dataIndex: 'r1',
    key: 'r1',
  },
  {
    title: AppConstants.R2,
    dataIndex: 'r2',
    key: 'r2',
  },
  {
    title: AppConstants.R3,
    dataIndex: 'r3',
    key: 'r3',
  },
  {
    title: AppConstants.R4,
    dataIndex: 'r4',
    key: 'r4',
  },
  {
    title: AppConstants.R5,
    dataIndex: 'r5',
    key: 'r5',
  },
  {
    title: AppConstants.R6,
    dataIndex: 'r6',
    key: 'r6',
  },
  {
    title: AppConstants.R7,
    dataIndex: 'r7',
    key: 'r7',
  },
  {
    title: AppConstants.R8,
    dataIndex: 'r8',
    key: 'r8',
  },
];

const footballSeasonColumns = [
  { dataIndex: 'name', key: 'name' },
  {
    title: AppConstants.M,
    dataIndex: 'totalMatches',
    key: 'totalMatches',
  },
  ...footballStatisticsColumns,
  ...footballSentOffsColumns,
];


const footballSeasonDetailedColumns = [
  { dataIndex: 'name', key: 'name' },
  {
    title: AppConstants.M,
    dataIndex: 'totalMatches',
    key: 'totalMatches',
  },
  ...footballStatisticsColumns,
  ...footballDetailedSentOffsColumns,
];

const footballMatchStatisticsColumns = [
  {
    title: AppConstants.homeTeam,
    dataIndex: 'team1Name',
    key: 'team1Name',
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'team2Name',
    key: 'team2Name',
  },
  ...footballStatisticsColumns,
  ...footballSentOffsColumns,
];

const footballMatchDetailedStatisticsColumns = [
  {
    title: AppConstants.homeTeam,
    dataIndex: 'team1Name',
    key: 'team1Name',
  },
  {
    title: AppConstants.awayTeam,
    dataIndex: 'team2Name',
    key: 'team2Name',
  },
  ...footballStatisticsColumns,
  ...footballDetailedSentOffsColumns,
];

const LiveScorePersonalStatistics = ({ showDetailedSendOffs, showDescription, showMatchLog, competitionId, multiComp }) => {
  const userState = useSelector(state => state.UserState);
  const { matchStats, careerStats, onLoadMatch, onLoadCareer } = userState;

  const attendance = useMemo(() => {
    if (competitionId) {
      const matchLog = matchStats?.find(i => i.competitionId === competitionId);
      if (matchLog) {
        return matchLog.attendance.toUpperCase();
      }
    }
    return 'MINUTE';
  }, [competitionId, matchStats])

  const careerStatistics = useMemo(() => {
    if (!careerStats) {
      return [];
    }
    if (!showMatchLog) {
      return careerStats.filter(item => item.name?.toUpperCase() === AppConstants.career);
    }
    return careerStats;
  }, [careerStats, showMatchLog]);

  const seasonStatisticsColumns = useMemo(() => {
    const selected = isFootball
      ? showDetailedSendOffs ? footballSeasonDetailedColumns : footballSeasonColumns
      : isBasketball
      ? basketballSeasonStatisticsColumns
      : netballSeasonStatisticsColumns;

    const seasonColumns = [...selected];
    if (isNetball || isFootball) {
      seasonColumns.push({
        title: AppConstants.played,
        dataIndex: 'duration',
        key: 'duration',
        render: (value, record) => {
          const duration =
            record.name.toUpperCase() === AppConstants.career
              ? `${record.games} ${AppConstants.unitGames}`
              : `${value} ${getUnitName(record.attendance)}`;
          return <span>{duration}</span>;
        },
      });
    }
    return seasonColumns;
  }, [showDetailedSendOffs]);

  const matchStatisticsColumns = useMemo(() => {
    const selected = isFootball
      ? showDetailedSendOffs ? footballMatchDetailedStatisticsColumns : footballMatchStatisticsColumns
      : isBasketball
      ? basketballMatchStatisticsColumns
      : netballMatchStatisticsColumns;

    const statisticsColumns = [...selected];
    if (isNetball || isFootball) {
      // There are multiple competitions.
      if (multiComp) {
        statisticsColumns.push({
          title: AppConstants.played,
          dataIndex: 'duration',
          key: 'duration',
          render: (value, record) => {
            const unit = getUnitName(record.attendance);
            return <span>{value} {unit}</span>
          }
        });
      } else {
        const toc = getTimeOnCourt(attendance)
        statisticsColumns.push({
          title: toc.title,
          dataIndex: 'duration',
          key: 'duration',
          render: value => <span>{value}</span>,
        });
      }
    }
    return statisticsColumns;
  }, [attendance, multiComp, showDetailedSendOffs]);

  return (
    <>
      <div className="user-module-row-heading m-top-60">{AppConstants.seasonalStatistics}</div>
      <Table
        style={{width: 'auto'}}
        scroll={{ x: isMobile? 520 : 0 }}
        columns={seasonStatisticsColumns}
        loading={onLoadCareer}
        dataSource={careerStatistics}
        pagination={false}
      />
      {showMatchLog && (
        <>
          <div className="user-module-row-heading m-top-60">{AppConstants.matchLog}</div>
          <Table
            scroll={{ x: isMobile? 640 : 0 }}
            columns={matchStatisticsColumns}
            loading={onLoadMatch}
            dataSource={matchStats}
            pagination={false}
          />
        </>
      )}
      {showDescription && <LiveScorePersonalStatsDesc attendance={attendance} />}
    </>
  );
};

export default LiveScorePersonalStatistics;

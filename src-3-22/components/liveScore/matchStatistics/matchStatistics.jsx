import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Table } from 'antd';
import { FLAVOUR } from 'util/enums';
import { GameStats, ValueKind } from 'enums/enums';
import AppConstants from 'themes/appConstants';
import {
  liveScoreStatisticsInitPositionListAction,
  liveScoreStatisticsAddPositionAction,
} from '../../../store/actions/LiveScoreAction/liveScorePlayerMinuteTrackingAction';
import { liveScoreSetLinkedActions } from '../../../store/actions/LiveScoreAction/liveScorePlayerMatchScoreAction';
import _, { groupBy } from 'lodash';
import createColumns from './columns';
import {
  linkActionsToTrackData,
  mergedUnknownActions as mergeUnlinkedActions,
  mergeLinkedActions,
} from './statisticsUtils';
import { checkIsMultiPeriod } from 'util/sessionStorage';

const isMultiPeriod = checkIsMultiPeriod();

const MatchStatistics = ({ dataSource, showPlayerStatus, params }) => {
  const { competition, match, matchId, team, teamId } = params;
  const dispatch = useDispatch();

  // ------------------- state data -------------------------------

  const { trackResultData, tracksLoaded, posDeleted, tracksInit, tracksInitTeamIds } = useSelector(
    state => state.liveScorePlayerMinuteTrackingState,
  );
  const { playerActions, actionsLoaded } = useSelector(state => state.liveScorePlayerActionState);

  const { positionsLoaded, gameStatList, onLoad } = useSelector(
    state => state.liveScoreGamePositionState,
  );

  // ------------------- variables -------------------------------
  const periodDuration = getMatchPeriod(match);
  const recordGoalAttempts = !!competition.recordGoalAttempts;
  const positionTrack = !!competition.positionTracking; // Position Tracking
  const gameTimeTrack = !!competition.gameTimeTracking; // Game Time Tracking
  const enhancedStatistics = !!competition.enhancedStatistics;
  const attndceRecrd = competition.attendanceRecordingPeriod; // Attendance Recording Period
  const gameTimeTrackingType = competition.gameTimeTrackingType;
  const secondsTrack = attndceRecrd === 'MINUTE';

  const allDataLoaded = useMemo(() => {
    return !!competition && !!match && !!tracksLoaded && !!positionsLoaded && !!actionsLoaded;
  }, [!!match, !!competition, tracksLoaded, positionsLoaded, actionsLoaded]);

  const matchPeriods = useMemo(() => {
    if (!match || (match && match.length === 0)) {
      return 0;
    }
    if (attndceRecrd === 'MATCH') {
      return 1;
    }
    return match.type === 'TWO_HALVES' ? 2 : 4;
  }, [gameTimeTrack, attndceRecrd, match]);

  const statsSettings = {
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
    competitionId: competition.id,
  };

  const columns = useMemo(() => {
    if (!allDataLoaded) {
      return null;
    }
    const columnsRes = createColumns(
      competition,
      periodDuration,
      addPosition,
      showPlayerStatus,
      gameStatList,
      statsSettings,
      team,
    );
    return columnsRes;
  }, [allDataLoaded, window.innerWidth >= 768]);

  const table = useMemo(() => {
    if (!columns || !allDataLoaded) {
      return null;
    }
    return (
      <Table
        className="home-dashboard-table attendance-table"
        columns={columns}
        dataSource={[...dataSource]}
        size="small"
        pagination={false}
        loading={onLoad}
        rowKey={record => record.playerId}
        sticky={true}
        scroll={{
          x: 1500,
        }}
      />
    );
  }, [allDataLoaded, !!columns, dataSource.length]);

  // ------------------- functions -------------------------------

  function getMatchPeriod(match) {
    if (!match) {
      return 0;
    }
    if (match.type === 'FOUR_QUARTERS') {
      return (match.matchDuration * 60) / 4;
    } else {
      return (match.matchDuration * 60) / 2;
    }
  }

  const getPositionIndex = useCallback(
    (playerId, period) => {
      if (!trackResultData) {
        return [];
      }
      return trackResultData
        .filter(
          x =>
            !x.isDeleted && x.playerId === playerId && x.period === period && x.teamId === teamId,
        )
        .map(x => ({ positionId: x.positionId, id: x.id, newRecNum: x.newRecNum }));
    },
    [JSON.stringify(trackResultData), allDataLoaded],
  );

  function addPosition(player, period) {
    dispatch(
      liveScoreStatisticsAddPositionAction({
        matchId,
        teamId,
        periodDuration,
        player,
        period,
        statsSettings,
      }),
    );
  }

  // ------------------- useEffects -------------------------------

  // Initialize player positions
  useEffect(() => {
    if (!allDataLoaded) {
      return;
    }
    const newPositions = [];
    const startIndex = 1;
    for (let player of dataSource) {
      if (player.playerId === 0) {
        continue;
      }
      for (let period = startIndex; period <= matchPeriods; period++) {
        const positions = getPositionIndex(player.playerId, period);
        if (positions && positions.length > 0) {
          continue;
        }
        newPositions.push({ period, player });
      }
    }
    dispatch(
      liveScoreStatisticsInitPositionListAction({
        matchId,
        team,
        teamId,
        periodDuration,
        positionTrack,
        gameTimeTrack,
        attndceRecrd,
        gameTimeTrackingType,
        positions: newPositions,
      }),
    );
  }, [allDataLoaded, posDeleted, dataSource.length]);

  //link actions to track records
  useEffect(() => {
    //need player positions to be initialised first so that actions do not get incorrectly added to unknown player row
    if (!allDataLoaded || !tracksInitTeamIds.find(id => id === teamId)) {
      return;
    }
    linkActionsToTrackData(trackResultData, playerActions, teamId);
    let updatedActions = mergeLinkedActions(playerActions, teamId);
    updatedActions = mergeUnlinkedActions(playerActions, teamId);

    dispatch(liveScoreSetLinkedActions({ playerActions: updatedActions, team }));
  }, [allDataLoaded, tracksInitTeamIds.length]);
  return table;
};

export default MatchStatistics;

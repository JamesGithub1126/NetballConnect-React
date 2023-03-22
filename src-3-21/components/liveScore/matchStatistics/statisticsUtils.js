import { GameStats } from 'enums/enums';
import { groupBy } from 'lodash';
import { checkIsMultiPeriod } from 'util/sessionStorage';
import { isBasketball } from '../liveScoreSettings/liveScoreSettingsUtils';
import { ParticipationRestrictionRefId } from 'enums/enums';

const isMultiPeriod = checkIsMultiPeriod();

export const getPlayedPositions = (trackResultData, playerId, teamId, period = null) => {
  if (playerId === 0) {
    return [
      {
        playerId: 0,
        period,
        positionId: 0,
        teamId: teamId,
      },
    ];
  }

  if (!trackResultData) {
    return [];
  }
  return trackResultData
    .map((item, index) => ({
      index,
      id: item.id,
      playerId: item.playerId,
      period: item.period,
      positionId: item.positionId,
      playedInPeriod: item.playedInPeriod,
      playedFullPeriod: item.playedFullPeriod,
      playedEndPeriod: item.playedEndPeriod,
      duration: item.duration,
      newRecNum: item.newRecNum,
      teamId: item.teamId,
      isDeleted: item.isDeleted, //only used for web
    }))
    .filter(
      item =>
        !item.isDeleted &&
        item.playerId === playerId &&
        item.teamId === teamId &&
        (period ? item.period === period : true),
    );
};

export const isLinkedToPlayer = (action, player) => {
  if (player.playerId === 0) {
    return action.isUnlinked;
  }
  return action.contributors.find(c => c.playerId === player.playerId);
};
export const getPlayerActions = (
  actions,
  gameStatId,
  player,
  teamId,
  valueKind = null,
  period = null,
) => {
  if (!actions) {
    return [];
  }

  return actions
    .map((action, index) => ({
      ...action,
      index,
    }))
    .filter(
      action =>
        !action.isDeleted &&
        isLinkedToPlayer(action, player) &&
        action.teamId === teamId &&
        (gameStatId === GameStats.TotalPoints
          ? action.gameStatId === GameStats.Ftm
          : action.gameStatId === gameStatId) &&
        (valueKind && isBasketball && !(gameStatId === GameStats.TotalPoints)
          ? action.value === valueKind
          : true) &&
        (period && isMultiPeriod ? action.period === period : true),
    );
};

export const findPlayerPositionIndex = (trackResultData, position) => {
  if (position.id) {
    return trackResultData.find(it => it.id === position.id);
  } else {
    return trackResultData.find(it => it.newRecNum === position.newRecNum);
  }
};

export const findPlayerPosition = (trackResultData, position) => {
  const index = findPlayerPositionIndex(trackResultData, position);
  return index >= 0 ? trackResultData[index] : null;
};

export const linkActionsToTrackData = (trackResultData, playerActions, teamId) => {
  const unlinkedActions = playerActions?.filter(a => {
    if (
      [GameStats.shirtNumber, GameStats.Jersey, GameStats.TotalPoints].includes(a.gameStatId) ||
      a.teamId !== teamId ||
      a.isDeleted === 1
    ) {
      return false;
    }
    let canLinkAction = !!a?.contributors?.find(c => !c.pmtId && !c.newRecNum);
    return canLinkAction;
  });
  if (!unlinkedActions.length) {
    return;
  }
  const playerGroup = groupBy(trackResultData, 'playerId');
  for (let action of unlinkedActions) {
    const contributors = action.contributors;
    for (let contributor of contributors) {
      let playerTracks = playerGroup[contributor.playerId];
      if (!playerTracks) {
        continue;
      }
      //filter tracks by action period
      playerTracks = playerTracks.filter(t => action.period === t.period);

      if (!playerTracks.length) {
        continue;
      }

      let filteredTracks = [];
      /**
       * try to find the best tracks to link this action to
       * priorty:
       * 1. has the same position
       * 2. is a new record
       * 3. does not have a valid position
       * 4. all player tracks
       */
      filteredTracks = playerTracks.filter(pt => pt.positionId === contributor.positionId);
      if (!filteredTracks.length) {
        filteredTracks = playerTracks.filter(pt => !!pt.newRecNum);
      }
      if (!filteredTracks.length) {
        filteredTracks = playerTracks.filter(pt => !pt.positionId);
      }
      if (!filteredTracks.length) {
        filteredTracks = playerTracks;
      }

      /**
       * From the above set, find the best matching track
       * priorty:
       * 1. is a new record
       * 3. the first record on the list
       */
      if (filteredTracks.length > 0) {
        let record = filteredTracks.find(t => t.newRecNum);
        if (!record) {
          //link score to the last record
          record = filteredTracks[filteredTracks.length - 1];
        }
        if (record) {
          /**
           * If this a new record, add the newRecNum of the track to the action contributor
           * otherwise add the pmtd to the action contributor
           */
          if (record.newRecNum) {
            contributor.newRecNum = record.newRecNum;
          } else if (record.id) {
            contributor.pmtId = record.id;
          }
          //change the positionId of the contributor to the positionId of selected track
          contributor.positionId = record.positionId;
          contributor.period = isMultiPeriod ? record.period : 1;
        }
      }
    }
  }
};
export const mergeLinkedActions = (playerActions, teamId) => {
  let linkedActionsGroup = groupBy(playerActions, action => {
    return (
      '' +
      action.gameStatId +
      `_${isMultiPeriod ? action.period : '0'}` +
      `${isBasketball ? action.value : '0'}`
    );
  });
  for (let key in linkedActionsGroup) {
    const teamActions = linkedActionsGroup[key].filter(a => a.teamId === teamId && !a.isDeleted);
    const linkedActions = teamActions.filter(a => a.contributors && a.contributors.length);

    let pmtActions = linkedActions.filter(a => a.contributors[0].pmtId);
    pmtActions.sort((a, b) => {
      return a.contributors[0].pmtId - b.contributors[0].pmtId;
    });
    let newRecNumActions = linkedActions.filter(a => a.contributors[0].newRecNum);
    newRecNumActions.sort((a, b) => {
      return a.contributors[0].newRecNum - b.contributors[0].newRecNum;
    });

    let merge = actions => {
      let prevAction = null;
      for (let action of actions) {
        if (prevAction === null) {
          prevAction = action;
          continue;
        }
        let actionContributor = action.contributors[0];
        let prevActionContributor = prevAction.contributors[0];
        if (
          actionContributor.pmtId
            ? actionContributor.pmtId === prevActionContributor.pmtId
            : actionContributor.newRecNum === prevActionContributor.newRecNum
        ) {
          prevAction.actionCount += action.actionCount;
          action.isDeleted = 1;
        } else {
          prevAction = action;
        }
      }
    };

    merge(pmtActions);
    merge(newRecNumActions);
  }
  return playerActions;
};
export const mergedUnknownActions = (playerActions, teamId) => {
  //find any remaining actions that are unlinked
  const [unlinkedActions, otherActions] = playerActions?.reduce(
    (prev, curr) => {
      let isUnLinkedActForCurrTeam =
        curr.teamId === teamId &&
        ![GameStats.shirtNumber, GameStats.Jersey, GameStats.TotalPoints].includes(
          curr.gameStatId,
        ) &&
        (curr.isDeleted ||
          !curr.contributors ||
          curr.contributors.length === 0 ||
          !!curr.contributors?.find(c => !c.pmtId && !c.newRecNum));

      if (isUnLinkedActForCurrTeam) {
        prev[0] = [...prev[0], curr];
      } else {
        prev[1] = [...prev[1], curr];
      }
      return prev;
    },
    [[], []],
  );

  if (!unlinkedActions.length) {
    return playerActions;
  }

  let unlinkedActionGroups = groupBy(unlinkedActions, action => {
    return (
      '' +
      action.gameStatId +
      `_${isMultiPeriod ? action.period : '0'}` +
      `${isBasketball ? action.value : '0'}`
    );
  });

  //merge actions with the same gameStat and period into one new record
  let mergedUnknownActions = [];
  for (let key in unlinkedActionGroups) {
    let firstAction = unlinkedActionGroups[key][0];
    //discard the original records if they have exisiting contributors and create new records in their place
    firstAction.id =
      !firstAction.contributors || !firstAction.contributors.length ? firstAction.id : null;
    firstAction.contributors = [];
    firstAction.isUnlinked = true;
    if (!isMultiPeriod) {
      firstAction.period = 1;
    }
    for (let i = 1; i < unlinkedActionGroups[key].length; i++) {
      firstAction.actionCount =
        (firstAction.actionCount ?? 1) + unlinkedActionGroups[key][i].actionCount ?? 1;
    }
    mergedUnknownActions.push(firstAction);
  }
  return [...otherActions, ...mergedUnknownActions];
};

export const actionStateIsEqual = (curr, prev, playerId, gameStatId, teamType, period) => {
  if (curr.actionsLoaded !== prev.actionsLoaded) {
    return false;
  }
  let updateData = curr.actionUpdateData;

  //re-render component for single player
  const gameScoreUpdated = !!(
    (updateData.gameStatId && gameStatId !== GameStats.TotalPoints
      ? updateData.gameStatId === gameStatId
      : true) &&
    updateData.playerId === playerId &&
    updateData.timestamp !== prev.actionUpdateData.timestamp &&
    (isMultiPeriod ? updateData.period === period : true)
  );

  //re-render component for all players
  const actionsUpdated =
    curr.actionsLoaded !== prev.actionsLoaded ||
    !!(curr.actionsUpdated && curr.actionsUpdated !== prev.actionsUpdated) ||
    (teamType === 'team1'
      ? curr.team1ActionsLinked !== prev.team1ActionsLinked
      : curr.team2ActionsLinked !== prev.team2ActionsLinked);

  const changed = gameScoreUpdated || actionsUpdated;

  return !changed;
};

export const pmtStateIsEqual = (curr, prev, playerId) => {
  if (curr.tracksLoaded !== prev.tracksLoaded) {
    return false;
  }
  const changed =
    !!(curr.savedTracks !== prev.savedTracks) ||
    !!(
      curr.posUpdateData.playerId === playerId &&
      curr.posUpdateData.timestamp !== prev.posUpdateData.timestamp
    ) ||
    !!(curr.tracksInit !== prev.tracksInit);

  return !changed;
};

export const isAttentionDisabled = player => {
  const { suspended } = player;
  return (
    suspended &&
    suspended.suspension &&
    suspended.suspension.participationRestrictionRefId != ParticipationRestrictionRefId.Participate
  );
};

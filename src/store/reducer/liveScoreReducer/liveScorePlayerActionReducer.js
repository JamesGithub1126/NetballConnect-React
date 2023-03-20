import ApiConstants from '../../../themes/apiConstants';
import { GamePosition, GameStats } from 'enums/enums.js';
import * as _ from 'lodash';
import {
  isNetball,
  isBasketball,
  isFootball,
} from '../../../components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { isNotNullAndUndefined } from '../../../util/helpers';
import {
  checkIsAttRcrdMatch,
  checkIsMultiPeriod,
  checkIsLineupsEnabled,
} from 'util/sessionStorage';
const isMultiPeriod = checkIsMultiPeriod();

const initialState = {
  onLoad: false,
  error: null,
  status: 0,
  playerActions: [],
  references: {},
  actionUpdateData: {
    playerId: -1,
    gameStatId: -1,
    timestamp: null,
    period: null,
  },
  actionsLoaded: null,
  gameStatData: [],
  actionsUpdated: null,
  team1ActionsLinked: null,
  team2ActionsLinked: null,
};

function findMatchingContributors(action, position) {
  let contribs = action.contributors?.filter(c => {
    if (c.playerId !== position.playerId) {
      return false;
    }
    let newRecNumMatch = false;
    let pmtIdMatch = false;
    if (c.newRecNum) {
      newRecNumMatch = c.newRecNum === position.newRecNum;
    }
    if (c.pmtId) {
      pmtIdMatch = c.pmtId === position.id;
    }
    return newRecNumMatch || pmtIdMatch;
  });
  return contribs;
}

//combine similar actions into one record
function mergeActions(playerActions) {
  let mergedActionList = [];
  let actionGroup = _.groupBy(playerActions, obj => {
    let playerId =
      obj.contributors && obj.contributors.length > 0 ? obj.contributors[0].playerId : 0;
    let pmtId =
      obj.contributors && obj.contributors.length > 0 ? obj.contributors[0].pmtId ?? 0 : 0;
    let positionId =
      obj.contributors && obj.contributors.length > 0 ? obj.contributors[0].positionId ?? 0 : 0;
    let key =
      '' +
      obj.teamId +
      '-' +
      playerId +
      '-' +
      pmtId +
      '-' +
      positionId +
      '-' +
      (obj.outcomeRefId ? obj.outcomeRefId : '0') +
      '-' +
      (obj.gameStatId ? obj.gameStatId : '0') +
      '-' +
      (isBasketball && obj.value ? obj.value : '0') +
      '-' +
      (isMultiPeriod && isNotNullAndUndefined(obj.period) ? obj.period : '0');

    return key;
  });
  for (let key in actionGroup) {
    let playerActionList = actionGroup[key];
    let action = _.cloneDeep(playerActionList[0]);
    action.actionCount = isNotNullAndUndefined(action.actionCount) ? action.actionCount : 1;
    if (playerActionList.length > 1) {
      for (let i = 1; i < playerActionList.length; i++) {
        const currAction = playerActionList[i];
        action.actionCount += currAction.actionCount ? currAction.actionCount : 0;
        if (currAction.contributors?.length > 0) {
          for (let contributor of currAction.contributors) {
            let canAddContributor = !action.contributors?.find(c => {
              return (
                c.playerId === contributor.playerId &&
                c.positionId === contributor.positionId &&
                c.pmtId === contributor.pmtId &&
                c.contributionRefId === contributor.contributionRefId
              );
            });

            if (canAddContributor) {
              contributor.actionId = action.id;
              let recordContributors = action.contributors ? action.contributors : [];
              recordContributors = [...recordContributors, contributor];
            }
          }
        }
      }
    }
    if (!isMultiPeriod) {
      //period = 1 for basketball
      //period = 0 for football (need to test this)
      action.period = 1;
    }
    mergedActionList.push(action);
  }
  return mergedActionList;
}

function liveScorePlayerActionState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        status: action.status,
        actionsLoaded: null,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_SUCCESS:
      let actionsForLineup = action.playerActions;
      if (checkIsAttRcrdMatch()) {
        actionsForLineup.forEach(a => (a.period = 1));
      }
      actionsForLineup = mergeActions(actionsForLineup);

      return {
        ...state,
        onLoad: false,
        status: action.status,
        playerActions: actionsForLineup,
        references: action.references,
        actionsLoaded: Date.now(),
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_SET_LINKED_ACTIONS:
      if (action.payload.team === 'team1') {
        return {
          ...state,
          playerActions: [...action.payload.playerActions],
          team1ActionsLinked: Date.now(),
        };
      } else {
        return {
          ...state,
          playerActions: [...action.payload.playerActions],
          team2ActionsLinked: Date.now(),
        };
      }

    //DEPRICATED
    case ApiConstants.API_LIVE_SCORE_PLAYER_ACTION_UPDATE:
      const pActions = [...state.playerActions];
      const filteredActions = pActions.filter(action => action.period !== 1 && !!action.value);
      if (filteredActions.length > 0) {
        const contribs = filteredActions.reduce(
          (prev, action) => prev.concat(action.contributors),
          [],
        );
        if (contribs.length > 0) {
          contribs.forEach(contrib => {
            const action = filteredActions.find(it => it.id === contrib.actionId);

            const periodAction = pActions
              .filter(
                it =>
                  it.period === 1 &&
                  it.teamId === action.teamId &&
                  it.gameStatId === action.gameStatId,
              )
              .find(
                it =>
                  !!it.contributors?.find(
                    c => c.playerId === contrib.playerId && c.positionId === contrib.positionId,
                  ),
              );

            if (periodAction) {
              periodAction.value += action.value;
              //It will be removed on the backend when you save it.
              action.value = null;
            } else {
              //It's the main action if there is no period 1.
              action.period = 1;
            }
          });

          return {
            ...state,
            playerActions: pActions,
          };
        }
      }
      return state;

    case ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_ADD: {
      const {
        playerId,
        matchId,
        teamId,
        period,
        gameStatId,
        valueKind,
        actionCount,
        lineupId,
        actionCategoryRefId,
        contributionRefId,
        outcomeRefId,
        competitionId,
        position,
      } = action.payload;

      const updatedActions = [...state.playerActions];
      const isUnlinked = playerId === 0;
      updatedActions.push({
        id: null,
        matchId: matchId,
        teamId: teamId,
        period: period,
        gameStatId: gameStatId,
        value: valueKind,
        actionCount: actionCount,
        lineupId: lineupId,
        actionCategoryRefId: actionCategoryRefId ?? 0,
        outcomeRefId: outcomeRefId ?? 0,
        competitionId: competitionId,
        isUnlinked,
        contributors: isUnlinked
          ? []
          : [
              {
                id: null,
                actionId: null,
                playerId: playerId,
                positionId: position?.positionId,
                pmtId: position?.id,
                newRecNum: position?.newRecNum,
                contributionRefId: contributionRefId ?? 0,
              },
            ],
      });
      return {
        ...state,
        playerActions: updatedActions,
        actionUpdateData: {
          playerId: playerId,
          gameStatId: gameStatId,
          timestamp: Date.now(),
          period: period,
        },
      };
    }

    case ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_UPDATE: {
      const { index, playerId, valueKind, actionCount } = action.payload;
      let updatedActions = [...state.playerActions];
      const score = updatedActions[index];
      score.value = valueKind;
      score.actionCount = actionCount;

      return {
        ...state,
        playerActions: updatedActions,
        actionUpdateData: {
          playerId: playerId ?? 0,
          gameStatId: score.gameStatId,
          timestamp: Date.now(),
          period: score.period,
        },
      };
    }

    case ApiConstants.API_LIVE_SCORE_REMOVE_PLAYER_POSITION: {
      const { pmtIds, newRecNums, isLastPosition, statsSettings, period, player } = action.data;

      const { matchId, teamId, competitionId } = statsSettings;
      const canClearShirt = isLastPosition && !isNetball;
      let shirtFound = false;
      const playerActions = [...state.playerActions];
      for (let act of playerActions) {
        if (canClearShirt) {
          const isShirt = [GameStats.Jersey, GameStats.shirtNumber].includes(act.gameStatId);
          const isPlayer = !!act?.contributors?.length
            ? act.contributors[0].playerId === player.playerId
            : false;
          if (isShirt && isPlayer) {
            act.actionCount = null; //will be removed on save
            shirtFound = true;
            continue;
          }
        }
        if (!!act?.contributors?.length) {
          const contributor = act.contributors[0];
          const canDelAction = contributor.pmtId
            ? pmtIds.includes(contributor.pmtId)
            : newRecNums.includes(contributor.newRecNum);
          if (canDelAction) {
            act.isDeleted = 1;
          }
        }
      }
      if (canClearShirt && !shirtFound) {
        //create a new action record with null shirt number
        playerActions.push({
          id: null,
          matchId: matchId,
          teamId: teamId,
          period: period,
          gameStatId: GameStats.shirtNumber,
          value: 1,
          actionCount: null,
          lineupId: player.lineup && player.lineup.length > 0 ? player?.lineup[0]?.id : null,
          actionCategoryRefId: 1,
          outcomeRefId: 1,
          competitionId: competitionId,
          contributors: [
            {
              id: null,
              actionId: null,
              playerId: player.playerId,
              positionId: null,
              pmtId: null,
              newRecNum: null,
              contributionRefId: 1,
            },
          ],
        });
      }
      return {
        ...state,
        playerActions,
        actionUpdateData: {
          playerId: player.playerId,
          gameStatId: null,
          timestamp: Date.now(),
          period: period,
        },
      };
    }

    case ApiConstants.API_LIVE_SCORE_CLEAR_TEAM_ACTIONS: {
      const { teamId, period } = action.data;
      if (teamId) {
        let updatedActions = [...state.playerActions];
        updatedActions.forEach(a => {
          if (
            a.teamId === teamId &&
            (isMultiPeriod ? a.period === period : true) &&
            (!a.contributors || !a.contributors?.length)
          ) {
            a.actionCount = 0;
            a.isDeleted = 1; //need to soft delete in order to keep the unknown row. Will be deleted in the back end on save.
          }
        });
        return {
          ...state,
          playerActions: updatedActions,
          actionUpdateData: {
            playerId: 0,
            gameStatId: null,
            period: period,
            timestamp: Date.now(),
          },
        };
      }
      return state;
    }

    case ApiConstants.API_LIVE_SCORE_PLAYER_SCORE_INITIALIZE: {
      return {
        ...state,
        playerActions: [],
      };
    }

    //depricated
    case ApiConstants.API_LIVE_SCORE_PLAYER_BASKETBALL_SCORE_ADD: {
      const payload = action.payload;
      const updatedActions = [...state.playerActions];
      updatedActions.push({
        id: null,
        matchId: payload.matchId,
        teamId: payload.teamId,
        period: payload.period,
        gameStatId: payload.gameStatId,
        value: payload.valueKind,
        actionCount: payload.actionCount,
        lineupId: payload.lineupId,
        actionCategoryRefId: payload.actionCategoryRefId ?? 0,
        outcomeRefId: payload.outcomeRefId ?? 0,
        contributors: [
          {
            id: null,
            actionId: null,
            playerId: payload.playerId,
            positionId: payload.position?.positionId,
            pmtId: payload.position?.id,
            newRecNum: payload.position?.newRecNum,
            contributionRefId: payload.contributionRefId ?? 0,
          },
        ],
      });
      return {
        ...state,
        playerActions: updatedActions,
        actionUpdateData: {
          playerId: payload.playerId,
          gameStatId: payload.gameStatId,
          timestamp: Date.now(),
        },
      };
    }

    //depricated
    case ApiConstants.API_LIVE_SCORE_PLAYER_BASKETBALL_SCORE_UPDATE: {
      const { index, value: actionCount, valueKind, teamId, playerId } = action.payload;
      const updatedActions = [...state.playerActions];
      const playerActions = updatedActions.filter(
        a => a.teamId === teamId && !!a.contributors?.find(c => c.playerId === playerId),
      );
      const score = playerActions[index];
      if (isNotNullAndUndefined(actionCount)) {
        score.value = valueKind;
        score.actionCount = actionCount;
      } else if (score.id) {
        score.actionCount = 0;
        score.value = valueKind;
      } else {
        updatedActions.splice(index, 1);
      }
      return {
        ...state,
        playerActions: updatedActions,
        actionUpdateData: {
          playerId: playerId ?? 0,
          gameStatId: score.gameStatId,
          timestamp: Date.now(),
        },
      };
    }

    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_SUCCESS:
      return {
        ...state,
        actionsUpdated: Date.now(),
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER_POSITION: {
      const { position, value, period } = action.data;
      let actions = [...state.playerActions];
      actions.forEach(a => {
        let contribs = findMatchingContributors(a, position);
        if (contribs.length) {
          contribs.forEach(c => (c.positionId = value));
          if (isNetball && ![GamePosition.GoalShooter, GamePosition.GoalAttack].includes(value)) {
            a.actionCount = null; //will be removed on save
          }
          if (
            isFootball &&
            a.gameStatId === GameStats.penalty &&
            value !== GamePosition.PenaltyShooter
          ) {
            a.actionCount = null; //will be removed on save
          }
        }
      });
      return {
        ...state,
        playerActions: _.cloneDeep(actions),
        actionUpdateData: {
          playerId: position.playerId,
          gameStatId: null,
          timestamp: Date.now(),
          period: period,
        },
      };
    }

    default:
      return state;
  }
}

export default liveScorePlayerActionState;

import {
  isBasketball,
  isNetball,
} from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import { isNotNullAndUndefined } from 'util/helpers';
import ApiConstants from '../../../themes/apiConstants';
import {
  checkIsAttRcrdMatch,
  getLiveScoreCompetition,
  getUmpireCompetitionData,
} from '../../../util/sessionStorage';
import * as _ from 'lodash';

const hasUniqPosForEachPeriod = !!isNetball;

const initialState = {
  onLoad: false,
  recordLoad: false,
  onSave: false,
  trackingList: [],
  error: null,
  result: null,
  status: 0,
  trackResultData: [],
  playedCheckBox: false,
  noOfPosition: null,
  finalPostData: null,
  positionList: [],
  positionData: [],
  updateDurationData: [],
  tickBox: false,
  newRecNum: 1,
  tracksLoaded: null,
  positionsLoaded: null,
  posUpdateData: { playerId: -1, timestamp: null },
  tracksInit: null,
  posDeleted: null,
  tracksInitTeamIds: [],
};

const getUserId = () => {
  return parseInt(localStorage.getItem('userId'));
};

const findTrackingDataIndex = (trackDataRes, action) => {
  const { pmtId, player, period, newRecNum } = action.data;
  if (pmtId) {
    return trackDataRes.findIndex(
      att => att.playerId === player.playerId && att.period === period && att.id === pmtId,
    );
  } else {
    return trackDataRes.findIndex(
      att =>
        att.playerId === player.playerId &&
        att.period === period &&
        (isNotNullAndUndefined(newRecNum) ? att.newRecNum == newRecNum : true),
    );
  }
};

const findTrackingData = (trackDataRes, action) => {
  const index = findTrackingDataIndex(trackDataRes, action);
  if (index >= 0) {
    return trackDataRes[index];
  }
  return null;
};

function getFilterTrackData(trackData) {
  let trackArr = [];
  trackData = trackData.filter(i => !i.deleted_at);
  if (checkIsAttRcrdMatch()) {
    trackData.filter(a => a.period === 1);
  }
  for (let i in trackData) {
    let trackObj = {
      id: trackData[i].id,
      matchId: trackData[i].matchId,
      teamId: trackData[i].teamId,
      playerId: trackData[i].playerId,
      period: trackData[i].period,
      positionId: trackData[i].positionId,
      duration: trackData[i].duration,
      playedInPeriod: !!trackData[i].playedInPeriod,
      playedEndPeriod: !!trackData[i].playedEndPeriod,
      playedFullPeriod: !!trackData[i].playedFullPeriod,
      periodDuration: trackData[i].periodDuration,
      source: 'Web',
      isPlaying: trackData[i].position ? !!trackData[i].position.isPlaying : false,
      isBorrowed: !!trackData[i].isBorrowed,
      createdBy: trackData[i].createdBy,
      updatedBy: trackData[i].updatedBy,
    };
    trackArr.push(trackObj);
  }

  return trackArr;
}

function getFilterPositionData(positionData) {
  let positionArray = [];
  for (let i in positionData) {
    if (positionData[i].isVisible === true) {
      positionArray.push(positionData[i]);
    }
  }

  let obj = {
    id: 0,
    isPlaying: false,
    isVisible: false,
    name: '',
  };
  positionArray.push(obj);
  return positionArray;
}

// function getPositionArry(mainArr, positionArray) {
//   let position = positionArray
//   for (let i in mainArr) {
//     for (let j in positionArray) {
//       if (mainArr[i].positionId != positionArray[j].id) {
//         let obj = {
//           "id": null,
//           "isPlaying": false,
//           "isVisible": false,
//           "name": null,
//         }
//         position.push(obj)
//         break;
//       }
//     }
//     break;
//   }
//   return position
// }

function getSelectedPosition(playerId, postArray, positionArray) {
  let selectedPosArr = [];

  for (let i in postArray) {
    if (postArray[i].playerId == playerId && postArray[i].positionId > 0) {
      selectedPosArr.push(postArray[i]);
    }
  }

  let countPosition = [];

  for (let i in positionArray) {
    for (let j in selectedPosArr) {
      if (
        positionArray[i].id == selectedPosArr[j].positionId &&
        positionArray[i].isPlaying == true
      ) {
        countPosition.push(positionArray[i]);
      }
    }
  }

  return countPosition;
}

/**
 * CURRENTLY NOT IN USE
 *
 * For sports where unique positions are not added for each period, tracks across different periods need to be linked together
 * so that updates to track in period one effects tracks in the same row in all other periods. This is achieved by adding the
 * same linkNum to each track.
 *
 * This function finds and links similar track record across multiple periods, and also creates new track records if there are
 * uneven tracks across each period, which would otherwise create uneven number of input boxes for each period.
 *
 * @param {*} trackDataRes
 * @param {*} matchPeriods
 * @param {*} newRecNum
 * @param {*} linkNum
 */

/*
function linkTracks(trackDataRes, matchPeriods, newRecNum, linkNum) {
  let tracks = trackDataRes.filter(t => !t.linkNum && !!t.playerId);
  let playerIds = [];
  let playerGroup = _.groupBy(tracks, 'playerId');
  for (let playerId in playerGroup) {
    const playerData = playerGroup[playerId][0];
    let positionGroup = _.groupBy(playerGroup[playerId], 'positionId');
    for (let positionId in positionGroup) {
      let arr = [];
      let max = 0;
      let periodGroup = _.groupBy(positionGroup[positionId], 'period');
      for (let i = 1; i <= matchPeriods; i++) {
        if (!periodGroup[i]) {
          periodGroup[i] = [];
        }
      }
      for (let period in periodGroup) {
        let currPeriodGrp = periodGroup[period];
        let length = currPeriodGrp.length;
        max = length > max ? length : max;
      }
      for (let period in periodGroup) {
        let currPeriodGrp = periodGroup[period];
        let length = currPeriodGrp.length;
        let diff = max - length;
        for (let i = 1; i <= diff; i++) {
          const trackObj = {
            id: null,
            matchId: playerData.matchId,
            teamId: playerData.teamId,
            playerId: Number(playerId),
            isBorrowed: !!playerData.isBorrowed,
            statusRef: playerData.statusRef,
            period: Number(period),
            positionId: Number(positionId),
            periodDuration: playerData.periodDuration,
            duration: 0,
            playedInPeriod: false,
            playedFullPeriod: false,
            playedEndPeriod: false,
            source: 'Web',
            createdBy: getUserId(),
            updatedBy: null,
            newRecNum: ++newRecNum,
          };
          trackDataRes.push(trackObj);
          currPeriodGrp.push(trackObj);
        }
        arr.push(currPeriodGrp);
      }
      if (arr.length === 0) {
        continue;
      }
      for (let i = 0; i < arr[0].length; i++) {
        linkNum += 1;
        for (let track of arr) {
          track[i].linkNum = linkNum;
          playerIds.push(track[i].playerId);
        }
      }
    }
  }
  return { playerIds, newRecNum, linkNum };
} */

function setTrackToDefault(track) {
  track.playedInPeriod = false;
  track.playedEndPeriod = false;
  track.playedFullPeriod = false;
  track.duration = 0;
  track.positionId = 0;
}

function mergeTracks(tracks) {
  if (!tracks || tracks.length === 0) {
    return [];
  }
  let mergeTracks = [];
  let playerGroup = _.groupBy(tracks, 'playerId');
  for (let playerId in playerGroup) {
    let playerTracks = playerGroup[playerId];
    let firstTrack = playerTracks[0];
    for (let i = 1; i < playerTracks.length; i++) {
      firstTrack.isBorrowed = playerTracks[i].isBorrowed || firstTrack.isBorrowed;
      firstTrack.isPlaying = playerTracks[i].isPlaying || firstTrack.isPlaying;
      firstTrack.playedInPeriod = playerTracks[i].playedInPeriod || firstTrack.playedInPeriod;
      firstTrack.playedEndPeriod = playerTracks[i].playedEndPeriod || firstTrack.playedEndPeriod;
      firstTrack.playedFullPeriod = playerTracks[i].playedFullPeriod || firstTrack.playedFullPeriod;
      let newDuration = playerTracks[i].duration + firstTrack.duration;
      firstTrack.duration =
        newDuration > firstTrack.periodDuration ? firstTrack.periodDuration : newDuration;
    }
    mergeTracks.push(firstTrack);
  }
  return mergeTracks;
}

function liveScorePlayerMinuteTrackingState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_LOAD:
      return {
        ...state,
        recordLoad: true,
        onSave: true,
        status: action.status,
        tracksInit: null,
        tracksInitTeamIds: [],
      };

    //trackResultData: action.payload.trackingData,
    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_RECORD_SUCCESS:
      return {
        ...state,
        recordLoad: false,
        onSave: false,
        status: action.status,
        onLoad: false,
        savedTracks: Date.now(),
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_LIST_LOAD:
      return {
        ...state,
        onLoad: true,
        status: action.status,
        recordLoad: false,
        tracksLoaded: null,
      };

    case ApiConstants.API_LIVE_SCORE_PLAYER_MINUTE_TRACKING_LIST_SUCCESS:
      let trackResult = getFilterTrackData(action.result.data);
      if (checkIsAttRcrdMatch()) {
        trackResult.forEach(t => (t.period = 1));
      }
      if (isBasketball) {
        trackResult = mergeTracks(trackResult);
      }
      // let postionArr = getPositionArry(action.result.data, state.positionList)
      // state.positionList = postionArr
      return {
        ...state,
        onLoad: false,
        trackResultData: trackResult,
        trackingList: action.result.data,
        status: action.status,
        recordLoad: false,
        tracksLoaded: Date.now(),
      };

    case ApiConstants.API_LIVE_SCORE_UPDATE_TRACKING_DATA:
      return {
        ...state,
        trackResultData: [...action.result.data],
      };

    case ApiConstants.API_LIVE_SCORE_INIT_PLAYER_POSITION_LIST: {
      let newRecNum = state.newRecNum;
      let playerIds = [];
      const trackDataRes = state.trackResultData;
      const { matchId, teamId, periodDuration, positions } = action.data;
      if (positions && positions.length > 0) {
        for (let position of positions) {
          const { player, period } = position;
          playerIds.push(player.playerId);
          const trackObj = {
            id: null,
            matchId,
            teamId,
            playerId: player.playerId,
            isBorrowed: !!player.isBorrowed,
            statusRef: player.statusRef,
            period,
            positionId: 0,
            periodDuration,
            duration: 0,
            playedInPeriod: false,
            playedFullPeriod: false,
            playedEndPeriod: false,
            source: 'Web',
            createdBy: getUserId(),
            updatedBy: null,
            newRecNum: ++newRecNum,
          };
          trackDataRes.push(trackObj);
        }
      }

      return {
        ...state,
        newRecNum,
        trackResultData: [...trackDataRes],
        tracksInit: playerIds.length > 0 ? Date.now() : state.tracksInit,
        tracksInitTeamIds: !state.tracksInitTeamIds.find(id => id === teamId)
          ? [teamId, ...state.tracksInitTeamIds]
          : state.tracksInitTeamIds,
      };
    }

    case ApiConstants.API_LIVE_SCORE_ADD_PLAYER_POSITION: {
      const trackDataRes = state.trackResultData;
      let newRecNum = state.newRecNum + 1;
      const { matchId, teamId, periodDuration, player, period, statsSettings } = action.data;
      const { gameTimeTrack, secondsTrack, matchPeriods } = statsSettings;
      const playerRecords = trackDataRes.filter(
        t => t.playerId === player.playerId && t.period === period && t.teamId === teamId,
      );
      let firstRec = playerRecords[0];

      const duration =
        gameTimeTrack && firstRec && firstRec.playedInPeriod && !secondsTrack
          ? Math.ceil(periodDuration / Math.max(playerRecords.length, 1))
          : 0;

      const played = duration > 0;

      if (!hasUniqPosForEachPeriod && !!player.playerId) {
        for (let i = 1; i <= matchPeriods; i++) {
          const trackObj = {
            id: null,
            matchId,
            teamId,
            playerId: player.playerId,
            isBorrowed: !!player.isBorrowed,
            statusRef: player.statusRef,
            period: i,
            duration,
            playedInPeriod: played,
            playedFullPeriod: played,
            playedEndPeriod: played,
            positionId: 0,
            periodDuration,
            source: 'Web',
            createdBy: getUserId(),
            updatedBy: null,
            newRecNum: ++newRecNum,
          };
          trackDataRes.push(trackObj);
        }
        return {
          ...state,
          newRecNum,
          trackResultData: _.cloneDeep(trackDataRes),
          posUpdateData: { playerId: player.playerId, timestamp: Date.now() },
          posAdded: Date.now(),
        };
      } else {
        const trackObj = {
          id: null,
          matchId,
          teamId,
          playerId: player.playerId,
          isBorrowed: !!player.isBorrowed,
          statusRef: player.statusRef,
          period,
          duration,
          playedInPeriod: played,
          playedFullPeriod: played,
          playedEndPeriod: played,
          positionId: 0,
          periodDuration,
          source: 'Web',
          createdBy: getUserId(),
          updatedBy: null,
          newRecNum,
        };
        trackDataRes.push(trackObj);

        return {
          ...state,
          newRecNum,
          trackResultData: _.cloneDeep(trackDataRes),
          posUpdateData: { playerId: player.playerId, timestamp: Date.now() },
        };
      }
    }

    case ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER_POSITION: {
      const { position, value, periodDuration, statsSettings } = action.data;
      const index = position.index;
      const { secondsTrack, gameTimeTrack } = statsSettings;
      const trackResultData = [...state.trackResultData];
      const item = trackResultData[index];
      const canUpdateDuration = !secondsTrack && (!item.positionId || !value);

      item.positionId = value;
      if (canUpdateDuration) {
        if (!value) {
          item.duration = 0;
          if (!gameTimeTrack) {
            item.playedInPeriod = false;
            item.playedFullPeriod = false;
            item.playedEndPeriod = false;
          }
        }
        let positionsToUpdate = trackResultData.filter(
          t => t.playerId === item.playerId && t.period === item.period,
        );
        const duration = Math.ceil(periodDuration / Math.max(positionsToUpdate.length, 1));

        positionsToUpdate.forEach(p => {
          if (!gameTimeTrack) {
            p.playedInPeriod = true;
            p.playedFullPeriod = true;
            p.playedEndPeriod = true;
            p.duration = duration;
          } else if (gameTimeTrack && p.playedInPeriod) {
            p.duration = duration;
          }
        });
      }

      return {
        ...state,
        trackResultData: trackResultData,
        posUpdateData: { playerId: item.playerId, timestamp: Date.now() },
      };
    }

    case ApiConstants.API_LIVE_SCORE_REMOVE_PLAYER_POSITION: {
      let { newRecNum } = state;
      const { indexes, statsSettings, periodDuration, playerId, period, isLastPosition } =
        action.data;
      const { secondsTrack, gameTimeTrack, matchPeriods } = statsSettings;
      let posAdded = null;
      let trackResultData = [...state.trackResultData];
      const trackData = trackResultData[indexes[0]];

      for (let index of indexes) {
        if (isLastPosition) {
          setTrackToDefault(trackResultData[index]);
        } else {
          //only used on web side to filter out removed positions
          trackResultData[index].isDeleted = 1;
        }
      }

      //If we are not recording seconds, then we need to calculate the default value of duration for all remaining positions
      if (!secondsTrack) {
        //find all the remaining player tracks
        const playerTracks = trackResultData.filter(t => t.playerId === playerId && !t.isDeleted);
        //from the player tracks, find all tracks in the period the position was removed from
        const periodTracks = playerTracks.filter(t => t.period === period);

        /*
          If there are positions remaining in this period, find the top most position and check if that position
          is playing. If that position is playing, then recalculate the duration for each exisiting position in
          that period (or all periods if the sport does not support multi-period positions). If the top most position
          is not playing, then there no need to recaculate the duration here as the played checkbox will appear unticked
          and all relevant positions will have their duration set to 0 on save.
          */
        let isPlaying =
          periodTracks.length > 0 && gameTimeTrack ? periodTracks[0]?.playedInPeriod : true;
        if (!isPlaying) {
          return {
            ...state,
            trackResultData: [...trackResultData],
            posUpdateData: {
              playerId: trackData.playerId,
              timestamp: Date.now(),
            },
            posDeleted: Date.now(),
            posAdded: posAdded ? posAdded : state.posAdded,
            newRecNum,
          };
        }
        if (!hasUniqPosForEachPeriod) {
          //need to update each period
          for (let i = 1; i <= matchPeriods; i++) {
            const periodPlayerTracks = playerTracks.filter(t => t.period === i);
            let duration = Math.ceil(periodDuration / Math.max(periodPlayerTracks.length, 1));
            for (let pos of periodPlayerTracks) {
              pos.duration = duration;
            }
          }
        } else {
          let duration = Math.ceil(periodDuration / Math.max(periodTracks.length, 1));
          for (let pos of periodTracks) {
            pos.duration = duration;
          }
        }
      }
      return {
        ...state,
        trackResultData: [...trackResultData],
        posUpdateData: { playerId: trackData.playerId, timestamp: Date.now() },
        posDeleted: Date.now(),
        posAdded: posAdded ? posAdded : state.posAdded,
        newRecNum,
      };
    }

    case ApiConstants.API_LIVE_SCORE_UPDATE_PLAY_DURATION: {
      const { indexes, value } = action.data;
      const trackResultData = [...state.trackResultData];
      let playerId = 0;
      for (let index of indexes) {
        const item = trackResultData[index];
        playerId = item.playerId;
        item.duration = value;
        item.playedInPeriod = value > 0;
        item.updatedBy = getUserId();
      }

      return {
        ...state,
        trackResultData,
        posUpdateData: { playerId: playerId, timestamp: Date.now() },
      };
    }

    case ApiConstants.API_LIVE_SCORE_UPDATE_PLAYED_STATE: {
      const { duration, playedFullPeriod, playedEndPeriod, playedInPeriod, indexes, playerId } =
        action.data;
      let trackResultData = [...state.trackResultData];
      let newRecNum = state.newRecNum;

      for (let index of indexes) {
        const item = trackResultData[index];
        item.playedFullPeriod = !!playedFullPeriod;
        item.playedEndPeriod = !!playedEndPeriod;
        item.playedInPeriod = !!playedInPeriod;
        item.duration = duration;
        item.updatedBy = getUserId();
      }

      return {
        ...state,
        newRecNum,
        trackResultData,
        posUpdateData: { playerId: playerId, timestamp: Date.now() },
      };
    }

    case ApiConstants.API_LIVE_SCORE_UPDATE_PLAYER_MINUTE_RECORD:
      return {
        ...state,
      };

    /**
     * CURRENTLY NOT IN USE
     * This was required to create missing period pmts in a multi-period match which had one set of
     * game stats for all periods. We currently do not allow this anymore, but we've decided to comment this out
     * instead of deleting this as there might be future use cases for it
     */
    /*
    case ApiConstants.API_LIVE_SCORE_LINK_TRACKS: {
      const { matchPeriods } = action.data;
      let tracskCopy = [...state.trackResultData];
      const { playerIds, newRecNum, linkNum } = linkTracks(
        tracskCopy,
        matchPeriods,
        state.newRecNum,
        state.linkNum,
      );

      const tracksLink = playerIds?.length
        ? { playerIds: playerIds, timestamp: Date.now() }
        : state.tracksLink;
      return {
        ...state,
        trackResultData: tracskCopy,
        tracksLinkInit: state.tracksLinkInit ?? Date.now(), //updates once on initial load
        tracksLink,
        newRecNum,
        linkNum,
      };
    } */

    default:
      return state;
  }
}

export default liveScorePlayerMinuteTrackingState;

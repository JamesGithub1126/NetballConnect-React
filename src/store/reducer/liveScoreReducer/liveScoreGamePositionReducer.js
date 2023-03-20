import { SPORT } from 'util/enums';
import ApiConstants from '../../../themes/apiConstants';
import { getLiveScoreCompetition, getUmpireCompetitionData } from '../../../util/sessionStorage';

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  positionList: [],
  gameStatList: [],
  gameStatListFilteredBySportRef: [],
};

function addNoNPosition(positionData) {
  const obj = {
    id: 0,
    isPlaying: false,
    isVisible: false,
    name: '',
  };
  return [obj, ...positionData];
}

function getFilterPositionData(positionData) {
  let positionArray = [];
  for (let i in positionData) {
    if (positionData[i].isVisible === true) {
      positionArray.push(positionData[i]);
    }
  }
  positionArray = addNoNPosition(positionArray);
  return positionArray;
}

function getcountIsPlayingValue(data) {
  let arr = [];
  for (let i in data) {
    if (data[i].isPlaying === true) {
      arr.push(data[i]);
    }
  }
  return arr;
}

function liveScoreGamePositionState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_SUCCESS:
      const positionData = addNoNPosition(action.result);

      return {
        ...state,
        onLoad: false,
        positionData: positionData,
        positionList: action.result,
        positionsLoaded: Date.now(),
      };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_POSITION_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_SUCCESS:
      let gameStatListFilteredBySportRef = [...state.gameStatListFilteredBySportRef];
      gameStatListFilteredBySportRef = gameStatListFilteredBySportRef.filter(
        i => i.sportRefId === SPORT[process.env.REACT_APP_FLAVOUR],
      );
      return {
        ...state,
        onLoad: false,
        gameStatList: action.result,
        gameStatListFilteredBySportRef,
      };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    case ApiConstants.API_LIVE_SCORE_GET_GAME_STATS_LIST_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
      };

    default:
      return state;
  }
}

export default liveScoreGamePositionState;

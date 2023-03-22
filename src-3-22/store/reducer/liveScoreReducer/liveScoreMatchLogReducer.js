/* eslint-disable no-param-reassign */
import { cloneDeep } from 'lodash';
import moment from 'moment';
import ApiConstants from 'themes/apiConstants';
import { isFootball, isNetball } from 'util/registrationHelper';
import AppConstants from '../../../themes/appConstants';

const initialState = {
  onLoadMatchEvents: false,
  onSaveMatchEvents: false,
  matchEvents: [],
  filteredMatchEvents: [],
  newMatchEventsCount: 0,
  playerResult: [],
  periodStartTimes: [],
  deletedMatchEvents: [],
  eventsLoaded: null,
  lastUpdated: null,
  eventsHaveBeenUpdated: false,
  teamListing: [],
  eventTypeOptions: [],
  isPremierCompetition: false,
  postitionTracking: false,
  pointScheme: [],
  setAndValidateFormField: () => null,
  formNames: [],
  updatedNamePaths: [],
};

function getDefaultEventObject(period, newMatchEventsCount, eventCategory) {
  return {
    id: newMatchEventsCount,
    eventCategory: eventCategory,
    eventTimestamp: null,
    time: null,
    miniType: null,
    type: null,
    subType: null,
    point: null,
    pointName: null,
    teamId: null,
    teamName: null,
    playerName: null,
    playerId: null,
    positionId: null,
    foulName: null,
    foul: null,
    period: period,
  };
}

function LiveScoreMatchLogState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.CLEAR_MATCH_EVENT_LOGS: {
      return {
        ...initialState,
      };
    }
    case ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_LOAD:
      return { ...state, onLoadMatchEvents: true };

    case ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_SUCCESS: {
      let { result } = action;
      let matchEvents = [...action.result].filter(i => i.type !== 'update');
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      let periodStartTimes = [...state.periodStartTimes];
      // let matchEvents = [...action.result];
      // matchEvents = [...action.result];
      periodStartTimes = result.filter(i => i.type === 'periodStart');
      for (let me of matchEvents) {
        //remove after app migration
        if (
          ((isNetball && !state.isPremierCompetition) || isFootball) &&
          me.eventCategory === 'stat'
        ) {
          me.positionId = me.attribute1Value;
        } else if (state.isPremierCompetition && me.eventCategory === 'stat') {
          me.positionId = me.attribute3Value;
        }

        for (let pst of periodStartTimes) {
          if (
            me.period === pst.period &&
            (me.eventCategory === 'stat' || ['pause', 'resume'].includes(me.type))
          ) {
            const diff = moment(me.eventTimestamp).diff(pst.eventTimestamp);
            me.diff = diff;
          }
        }
      }

      return {
        ...state,
        onLoadMatchEvents: false,
        eventsLoad: Date.now(),
        matchEvents: action.result ? matchEvents : [],
        filteredMatchEvents: action.result ? action.result : [],
        periodStartTimes: action.result ? periodStartTimes : [],
        eventsHaveBeenUpdated,
      };
    }
    case ApiConstants.API_LIVE_SCORE_GET_MATCH_EVENTS_ERROR:
      return {
        ...state,
        onLoadMatchEvents: false,
        matchEvents: action.result ? action.result : [],
        filteredMatchEvents: action.result ? action.result : [],
      };

    case ApiConstants.API_LIVE_SCORE_ADD_NEW_MATCH_EVENT: {
      let matchEvents = [...state.matchEvents];
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      state.newMatchEventsCount -= 1;

      const eventObject = getDefaultEventObject(action.payload, state.newMatchEventsCount, 'stat');
      matchEvents = [...matchEvents, eventObject];
      eventsHaveBeenUpdated = true;
      const namePaths = (state.formNames || []).map(n => [eventObject.id, n]);
      const updatedNamePaths = [...state.updatedNamePaths, ...namePaths];
      return { ...state, matchEvents, eventsHaveBeenUpdated, updatedNamePaths };
    }

    case ApiConstants.API_LIVE_SCORE_REMOVE_NEW_MATCH_EVENT: {
      const id = action.payload;
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      let matchEvents = [...state.matchEvents]; //the original array
      const deletedMatchEvents = [...state.deletedMatchEvents];
      const index = matchEvents.findIndex(x => x.id === id);
      if (index >= 0) {
        if (id < 0) {
          //for any new events ID will be -1 or lower
          matchEvents.splice(index, 1);
        } else {
          const date = new Date();
          matchEvents[index].deleted_at = date;
          const deletedMatch = matchEvents[index];
          deletedMatchEvents.push(deletedMatch); //deletedMatch starts off empty any subsequently deleted event will be pushed and is dispatched from liveScoreEditActionLogView
          matchEvents.splice(index, 1);
        }
      }
      eventsHaveBeenUpdated = true;
      const updatedNamePaths = [...state.updatedNamePaths.filter(np => np[0] !== id)];
      return {
        ...state,
        deletedMatchEvents,
        matchEvents,
        eventsHaveBeenUpdated,
        updatedNamePaths,
      };
    }

    case ApiConstants.API_LIVE_SCORE_UPDATE_NEW_MATCH_EVENT: {
      const { eventData, formItemName } = action.payload;
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      let matchEvents = [...state.matchEvents];

      const index = matchEvents.findIndex(x => x.id === eventData.id);
      let updatedMatchEvent = null;
      if (index >= 0) {
        updatedMatchEvent = { ...matchEvents[index], ...eventData };
        matchEvents.splice(index, 1, updatedMatchEvent);
      } else {
        state.newMatchEventsCount += 1;
        updatedMatchEvent = {
          ...getDefaultEventObject(eventData.period, state.newMatchEventsCount, 'stat'),
          ...eventData,
        };
        matchEvents.push(updatedMatchEvent);
      }
      eventsHaveBeenUpdated = true;
      const updatedNamePaths = [...state.updatedNamePaths, [eventData.id, formItemName]];
      return {
        ...state,
        matchEvents,
        eventsHaveBeenUpdated,
        updatedNamePaths,
      };
    }

    case ApiConstants.API_LIVE_SCORE_PERIOD_TIMESTAMP_UPDATED: {
      const { payload } = action;
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      let matchEvents = cloneDeep(state.matchEvents);
      //firstly change the timer for the period then push it to matchEvents after calculating the difference
      let initialPeriodStartTime = null;
      let newPeriodStartTime = null;
      for (let ev of matchEvents) {
        if (ev.period === payload.period && ev.type === 'periodStart') {
          initialPeriodStartTime = ev.eventTimestamp;
          newPeriodStartTime = payload.time.toISOString();
          ev.eventTimestamp = newPeriodStartTime;
        } //updating the periodTime Stamp.

        if (
          ev.period === payload.period &&
          ev.type === 'periodEnd' &&
          initialPeriodStartTime &&
          newPeriodStartTime
        ) {
          const perioDurationMS = moment(ev.eventTimestamp).diff(initialPeriodStartTime);
          ev.eventTimestamp = moment(newPeriodStartTime).add(perioDurationMS, 'ms').toISOString();
        } //updating the periodTime Stamp.

        //only updating the stats here onwards on timeChange
        if (ev.period === payload.period && ev.eventCategory === 'stat') {
          const periodStart = matchEvents.find(
            matchEvent => matchEvent.type === 'periodStart' && matchEvent.period === ev.period,
          );
          const diff = ev.diff;
          const diffMoment = moment.utc(diff);
          let diffMinutes = diffMoment.minutes();
          let diffSeconds = diffMoment.seconds();
          ev.eventTimestamp = moment(periodStart.eventTimestamp)
            .add(diffMinutes, 'minutes')
            .add(diffSeconds, 'seconds');
          ev.eventTimestamp = moment(ev.eventTimestamp).toISOString();
          ev.timeUpdated = true; //web value
        }
      }
      const periodStartTimes = matchEvents.filter(me => me.eventCategory === 'timer');
      eventsHaveBeenUpdated = true;
      return {
        ...state,
        matchEvents,
        periodStartTimes,
        onLoadMatchEvents: false,
        eventsHaveBeenUpdated,
      };
    }

    case ApiConstants.API_LIVE_SCORE_EVENT_MINUTES_UPDATED: {
      const { matchEvent, time, formItemName } = action.payload || {};
      const matchEventId = matchEvent.id;
      const matchEvents = [...state.matchEvents];
      const periodStartTimes = state.periodStartTimes;
      let eventsHaveBeenUpdated = state.eventsHaveBeenUpdated;
      for (let [idx, me] of matchEvents.entries()) {
        if (me.id === matchEventId) {
          let newMatchEvent = { ...me };
          const { eventTimestamp = null } =
            periodStartTimes.find(pst => pst.period === newMatchEvent.period) || {};
          if (!eventTimestamp) {
            return state;
          }
          const minute = moment(time).minute();
          const second = moment(time).second();
          newMatchEvent.eventTimestamp = moment(eventTimestamp)
            .add(minute, 'minute')
            .add(second, 'seconds');
          newMatchEvent.diff = time.valueOf();
          newMatchEvent.timeUpdated = true;
          matchEvents[idx] = newMatchEvent;
        }
      }
      eventsHaveBeenUpdated = true;
      const updatedNamePaths = [...state.updatedNamePaths, [matchEvent.id, formItemName]];
      return {
        ...state,
        matchEvents,
        onLoadMatchEvents: false,
        eventsHaveBeenUpdated,
        updatedNamePaths,
      };
    }

    case ApiConstants.API_LIVE_SCORE_ACTIONLOG_ADD_PERIOD: {
      const { period, matchStartTime, periodDuration = 0 } = action.payload;

      //start
      let matchEventStart = getDefaultEventObject(
        action.payload,
        state.newMatchEventsCount,
        'timer',
      );
      matchEventStart.type = 'periodStart';
      matchEventStart.eventTimestamp = moment(matchStartTime)
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toISOString();
      matchEventStart.period = period;

      //end
      let matchEventEnd = getDefaultEventObject(action.payload, state.newMatchEventsCount, 'timer');
      matchEventEnd.type = 'periodEnd';
      matchEventEnd.eventTimestamp = moment(matchEventStart.eventTimestamp)
        .set({ minute: periodDuration })
        .toISOString();
      matchEventEnd.period = period;

      const matchEvents = [...state.matchEvents, matchEventStart, matchEventEnd];
      const periodStartTimes = [...state.periodStartTimes, matchEventStart, matchEventEnd];
      return {
        ...state,
        matchEvents,
        periodStartTimes,
      };
    }

    case ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_LOAD:
      return { ...state, onSaveMatchEvents: true, deletedMatchEvents: [] };

    case ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_SUCCESS:
    case ApiConstants.API_LIVE_SCORE_SAVE_NEW_MATCH_EVENT_ERROR:
      return {
        ...state,
        onSaveMatchEvents: false,
        lastUpdated: Date.now(),
        eventsHaveBeenUpdated: false,
        deletedMatchEvents: [],
      };

    case ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_TEAM_LISTING: {
      const { payload } = action;
      return {
        ...state,
        teamListing: payload,
      };
    }

    case ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_FIELDS: {
      const { payload } = action;
      return {
        ...state,
        ...payload,
      };
    }

    case ApiConstants.API_LIVE_SCORE_ACTIONLOG_SET_DEFAULTS: {
      return cloneDeep(initialState);
    }

    default:
      return state;
  }
}

export default LiveScoreMatchLogState;

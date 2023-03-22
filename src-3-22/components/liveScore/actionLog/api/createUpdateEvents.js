import { isNotNullAndUndefined } from 'util/helpers';
import calculateScores from './calculateScores';

export default function createUpdateEvents(
  match,
  matchEvents,
  gameStatList,
  eventsHaveBeenUpdated,
) {
  const teamOne = match.team1.id;
  const teamTwo = match.team2.id;
  let teamOneScore = 0;
  let teamTwoScore = 0;

  let updateEvents = [];
  for (const me of matchEvents) {
    if (isNotNullAndUndefined(me?.deleted_at)) {
      updateEvents.push(me);
    } else {
      teamOneScore +=
        me?.teamId === teamOne ? calculateScores(me.type, me.attribute1Value, gameStatList) : 0;
      teamTwoScore +=
        me?.teamId === teamTwo ? calculateScores(me.type, me.attribute1Value, gameStatList) : 0;

      if (eventsHaveBeenUpdated) {
        if (me?.teamId === teamOne) {
          const updateEvent = {
            type: 'update',
            matchId: me.matchId,
            period: me.period,
            eventCategory: 'score',
            eventTimestamp: me.eventTimestamp,
            attribute1Key: 'team1Score',
            attribute1Value: teamOneScore,
            attribute2Key: 'team2Score',
            attribute2Value: teamTwoScore,
            playerId: me.playerId,
          };
          updateEvents.push(updateEvent, me);
        } else if (me?.teamId === teamTwo) {
          const updateEvent = {
            type: 'update',
            matchId: me.matchId,
            period: me.period,
            eventCategory: 'score',
            eventTimestamp: me.eventTimestamp,
            attribute1Key: 'team1Score',
            attribute1Value: teamOneScore,
            attribute2Key: 'team2Score',
            attribute2Value: teamTwoScore,
            playerId: me.playerId,
          };
          updateEvents.push(updateEvent, me);
        } else if (me?.eventCategory === 'timer') {
          updateEvents.push(me);
        }
      }
    }
  }
  return { teamOneScore, teamTwoScore, updateEvents };
}

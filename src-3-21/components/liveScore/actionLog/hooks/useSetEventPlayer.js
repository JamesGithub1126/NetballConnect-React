import { useDispatch, useSelector } from 'react-redux';
import { liveScoreUpdateNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { FORM_ITEM_NAME } from '../api';

export default function useSetEventPlayer() {
  let dispatch = useDispatch();
  const matchDetails = useSelector(state => state.LiveScoreMatchState?.matchDetails) || {};
  const teamListing = useSelector(state => state.LiveScoreMatchLogState?.teamListing) ?? [];
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );
  const { team1players = [], team2players = [] } = matchDetails ?? {};
  const allPlayers = [...team1players, ...team2players];

  const updateEvent = eventData => {
    dispatch(
      liveScoreUpdateNewMatchEventAction({ eventData, formItemName: FORM_ITEM_NAME.player }),
    );
  };

  const setEventPlayer = (matchEvent, playerId) => {
    const player = allPlayers.find(player => player.playerId === playerId);

    //if team field is empty we want to set team as player team
    //can't use setTeam hook has it causes a circular dependency error
    const teamData = getTeamData(player, teamListing);

    if (playerId === 'bench') {
      //bench foul sequence gets set in the reducer function
      updateEvent({
        id: matchEvent.id,
        attribute2Key: `coachId`,
        attribute2Value: 0,
        attribute3Key: 'isBenchFoul',
        attribute3Value: 1,
        playerId: 0,
        ...teamData,
      });
    } else {
      updateEvent({
        id: matchEvent.id,
        attribute2Key: `playerId`,
        attribute2Value: playerId,
        attribute3Key: null,
        attribute3Value: null,
        playerId,
        ...teamData,
      });
    }
    if (playerId !== matchEvent.playerId) {
      setAndValidateFormField([matchEvent.id, 'player'], playerId);
    }
    if (teamData.teamId) {
      setAndValidateFormField([matchEvent.id, 'team'], teamData.teamId);
    }
  };

  return setEventPlayer;
}

function getTeamData(player, teamListing) {
  let teamId = player?.team?.id ?? null;
  teamId = !!teamListing.find(tl => tl.teamId === teamId) ? teamId : null;
  if (!teamId) {
    let attendance = player?.attendance ? player.attendance.sort((a, b) => b.id - a.id) : [];
    if (attendance.length) {
      teamId = attendance[0].teamId;
    } else {
      let lineup = player?.lineup ? player.lineup.sort((a, b) => b.id - a.id) : [];
      if (lineup.length) {
        teamId = lineup[0].teamId;
      }
    }
  }
  const team = teamListing.find(team => team.teamId === teamId);
  let teamData = {};
  if (team) {
    teamData = {
      teamId,
      attribute1Key: `team${teamListing.indexOf(team) + 1}`,
    };
  }
  return teamData;
}

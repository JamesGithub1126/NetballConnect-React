import { useDispatch, useSelector } from 'react-redux';
import { liveScoreUpdateNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { FORM_ITEM_NAME, isBenchFoul } from '../api';
import useSetEventPlayer from './useSetEventPlayer';

export default function useSetEventTeam() {
  let dispatch = useDispatch();
  let setEventPlayer = useSetEventPlayer();
  const teamListing = useSelector(state => state.LiveScoreMatchLogState?.teamListing) ?? [];
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );

  const setEventTeam = (matchEvent, teamId) => {
    const team = teamListing.find(team => team.teamId === teamId);
    dispatch(
      liveScoreUpdateNewMatchEventAction({
        eventData: {
          id: matchEvent.id,
          teamId: team.teamId,
          teamName: team.teamName,
          attribute1Key: `team${teamListing.indexOf(team) + 1}`,
        },
        formItemName: FORM_ITEM_NAME.team,
      }),
    );
    if (teamId !== matchEvent.teamId) {
      setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.team], teamId);
    }
    //if not a benched user, then clear player when team changes
    if (!isBenchFoul(matchEvent)) {
      setEventPlayer(matchEvent, null);
    }
  };

  return setEventTeam;
}

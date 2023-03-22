import { useDispatch, useSelector } from 'react-redux';
import { liveScoreUpdateNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { isFootball, isNetball } from 'util/registrationHelper';
import { FORM_ITEM_NAME } from '../api';

export default function useSetEventPosition() {
  let dispatch = useDispatch();
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );

  const isPremierCompetition = useSelector(
    state => state.LiveScoreMatchLogState.isPremierCompetition,
  );

  const setEventPosition = (matchEvent, positionId) => {
    let payload = { id: matchEvent.id, positionId: positionId };

    //remove after app migration
    //Note: positionId field is populated initially in reducer for now
    //Note: also check the stored procs
    if ((isNetball && !isPremierCompetition) || isFootball) {
      payload = { ...payload, attribute1Value: positionId };
    } else if (isNetball && isPremierCompetition) {
      payload = { ...payload, attribute3Key: 'positionId', attribute3Value: positionId };
    }

    dispatch(
      liveScoreUpdateNewMatchEventAction({
        eventData: payload,
        formItemName: FORM_ITEM_NAME.position,
      }),
    );

    if (positionId !== matchEvent.positionId) {
      setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.position], positionId);
    }
  };

  return setEventPosition;
}

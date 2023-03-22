import { useDispatch, useSelector } from 'react-redux';
import { liveScoreEventTimeStampUpdated } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { FORM_ITEM_NAME } from '../api';

export default function useSetEventTime() {
  let dispatch = useDispatch();
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );

  const setEventTime = (matchEvent, time) => {
    if (time) {
      dispatch(
        liveScoreEventTimeStampUpdated({ matchEvent, time, formItemName: FORM_ITEM_NAME.time }),
      );
      setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.time], time);
    }
  };

  return setEventTime;
}

import { useDispatch, useSelector } from 'react-redux';
import { liveScoreUpdateNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { FORM_ITEM_NAME, isPointType } from '../api';

export default function useSetEventSubType() {
  let dispatch = useDispatch();
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );

  const setEventSubType = (matchEvent, type, subType) => {
    let payload = null;
    if (isPointType(type)) {
      payload = { id: matchEvent.id, attribute1Value: subType };
    } else {
      payload = { id: matchEvent.id, type: subType };
    }
    setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.eventSubType], subType);
    
    dispatch(
      liveScoreUpdateNewMatchEventAction({
        eventData: payload,
        formItemName: FORM_ITEM_NAME.eventSubType,
      }),
    );

    if (subType !== subType)
      setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.eventSubType], subType);
  };

  return setEventSubType;
}

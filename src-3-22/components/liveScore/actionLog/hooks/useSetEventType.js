import { message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { liveScoreUpdateNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
import { FORM_ITEM_NAME, getEventSubTypeOptions, isBenchFoul } from '../api';
import { getStatType } from '../api/getStatType';
import useSetEventPlayer from './useSetEventPlayer';
import useSetEventSubType from './useSetEventSubType';

export default function useSetEventType() {
  let dispatch = useDispatch();
  const setEventSubType = useSetEventSubType();
  const setEventPlayer = useSetEventPlayer();
  const gameStatList = useSelector(state => state.liveScoreGamePositionState?.gameStatList) || [];
  const pointScheme = useSelector(state => state.LiveScoreMatchLogState.pointScheme) || [];
  const setAndValidateFormField = useSelector(
    state => state.LiveScoreMatchLogState.setAndValidateFormField,
  );

  const setEventType = (matchEvent, type) => {
    const gameStat = gameStatList.find(i => i.code === type);
    const { isFoul: prevIsFoul } = getStatType(matchEvent, gameStatList);

    if (!gameStat) {
      message.error('something went wrong');
      return;
    }
    const currIsFoul = !!gameStat.isFoul;
    const newType = gameStat.code;

    //update event type
    dispatch(
      liveScoreUpdateNewMatchEventAction({
        eventData: {
          id: matchEvent.id,
          type: newType,
          gameStatId: gameStat?.id,
        },
        formItemName: FORM_ITEM_NAME.eventType,
      }),
    );
    if (newType !== matchEvent.type) {
      setAndValidateFormField([matchEvent.id, FORM_ITEM_NAME.eventType], newType);
    }
    //set default sub-type
    const defaultSubType = getDefaultEventSubTypeValue(newType, gameStatList, pointScheme);
    if (defaultSubType) {
      setEventSubType(matchEvent, newType, defaultSubType);
    }

    //clear bench user if new type is not a foul
    if (prevIsFoul && !currIsFoul && isBenchFoul(matchEvent)) {
      setEventPlayer(matchEvent, null);
    }
  };

  return setEventType;
}

function getDefaultEventSubTypeValue(eventType, gameStatList, pointScheme) {
  let options = getEventSubTypeOptions(eventType, gameStatList, pointScheme);
  if (options.length) {
    return options[0]?.type;
  }
  return null;
}

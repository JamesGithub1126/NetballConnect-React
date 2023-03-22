import { useDispatch } from 'react-redux';
import { liveScoreRemoveNewMatchEventAction } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';

export default function useSetEventRemove() {
  let dispatch = useDispatch();

  const removeEvent = id => {
    dispatch(liveScoreRemoveNewMatchEventAction(id));
  };

  return removeEvent;
}

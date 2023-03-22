import { useDispatch } from 'react-redux';
import { liveScoreActionLogAddPeriod } from 'store/actions/LiveScoreAction/liveScoreMatchLogAction';
export default function useSetAddPeriod() {
  let dispatch = useDispatch();

  const setAddPeriod = (period, matchStartTime ,periodDuration) => {
    dispatch(liveScoreActionLogAddPeriod({ period, matchStartTime, periodDuration }));
  };

  return setAddPeriod;
}

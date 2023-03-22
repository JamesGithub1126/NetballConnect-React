import React, { useEffect } from 'react';
import './moveCompetitionModalStyles.css';
import ModalCompetition from './ModalCompetition';
import ModalAffiliate from './ModalAffiliate';
import YearSelect from './YearSelect';
import AgeGroupsSelect from './AgeGroupsSelect';
import { useDispatch, useSelector } from 'react-redux';
import ModalMovePlayerTable from './ModalMovePlayerTable';
import { getCompetitions } from 'store/actions/moveFAPlayerAction/movePlayerAction';
import UserRolesForModalComponent from './UserRolesForModalComponent';
const MoveModal = ({ organisationUniqueKey }) => {
  const dispatch = useDispatch();
  const { playersToMove } = useSelector(state => state.MovePlayerState);
  const { modalYearRefId } = useSelector(state => state.AppState);

  useEffect(() => {
    dispatch(
      getCompetitions({
        organisationUniqueKey,
        yearRefId: modalYearRefId,
      }),
    );
  }, []);
  return (
    <div className="d-flex flex-column">
      <YearSelect className={'w-100'} />
      <ModalCompetition className={'w-100'} organisationUniqueKey={organisationUniqueKey} />
      <ModalAffiliate className={'w-100'} />
      <UserRolesForModalComponent className={'w-100'} />
      <AgeGroupsSelect className={'w-100'} />
    </div>
  );
};

export default MoveModal;

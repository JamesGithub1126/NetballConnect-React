import React from 'react';
import '../user.css';
import { FLAVOUR } from '../../../util/enums';
import UserIncidentList from './userIncidentList';
import UserSuspensionList from './userSuspensionList';
import UserTribunalList from './userTribunalList';

const isNetball = process.env.REACT_APP_FLAVOUR == FLAVOUR.Netball;

const UserIncidents = ({ userId, yearRefId, competition, screenKey }) => {
  return (
    <>
      <UserIncidentList
        userId={userId}
        yearId={yearRefId}
        competitionId={competition?.competitionUniqueKey}
        screenKey={screenKey}
      ></UserIncidentList>
      {!isNetball && (
        <>
          <UserSuspensionList userId={userId}></UserSuspensionList>
          <UserTribunalList userId={userId}></UserTribunalList>
        </>
      )}
    </>
  );
};

export default UserIncidents;

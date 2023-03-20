import * as React from 'react';
import ReactJson from 'react-json-view';
import { useSelector } from 'react-redux';
import './user.css';

const UserSubmittedRegistrationData = () => {
  const userSubmittedRegData = useSelector(state => state.UserState.userSubmittedRegData);

  return (
    <>
      {userSubmittedRegData.length === 0 ? (
        <div className="submit-reg-data-loading-text">Loading...</div>
      ) : (
        <ReactJson src={userSubmittedRegData} />
      )}
    </>
  );
};

export default UserSubmittedRegistrationData;

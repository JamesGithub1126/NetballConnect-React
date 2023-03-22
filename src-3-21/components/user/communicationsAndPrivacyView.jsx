import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'antd';
import { getCommunicationPrivacy } from '../../store/actions/userAction/userAction';
import AppConstants from '../../themes/appConstants';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import { getUserId } from '../../util/sessionStorage';

const CommunicationsAndPrivacyView = ({ userCommunicationPrivacy, userId, isReadOnlyRole }) => {
  const dispatch = useDispatch();
  const [userCommPrivacy, setUserCommPrivacy] = useState(null);

  useEffect(() => {
    dispatch(getCommunicationPrivacy(userId));
  }, []);

  useEffect(() => {
    if (userCommunicationPrivacy) {
      setUserCommPrivacy(userCommunicationPrivacy);
    }
  }, [userCommunicationPrivacy]);

  const contentView = () => {
    const userData = { ...userCommPrivacy, userId };
    return (
      userCommPrivacy && (
        <Fragment>
          <div className="row">
            <div className="col-sm user-module-row-heading" style={{ marginTop: 30 }}>
              {AppConstants.communicationsAndPrivacy}
            </div>
            {!isReadOnlyRole() ? (
              <div className="col-sm" style={{ marginTop: 7, marginRight: 15 }}>
                <div className="comp-buttons-view">
                  <NavLink
                    to={{
                      pathname: `/userProfileEdit`,
                      state: {
                        userData: userData,
                        moduleFrom: '10',
                      },
                    }}
                  >
                    <Button className="other-info-edit-btn" type="primary">
                      {AppConstants.edit}
                    </Button>
                  </NavLink>
                </div>
              </div>
            ) : null}
          </div>
          <div className="table-responsive home-dash-table-view">
            <div
              style={{
                marginTop: 7,
                marginRight: 15,
                marginBottom: 15,
              }}
            >
              <div className="other-info-row" style={{ paddingTop: 10 }}>
                <div className="year-select-heading other-info-label">
                  {AppConstants.doNotSendEmail}
                </div>
                <div className="desc-text-style side-bar-profile-data other-info-font">
                  {userCommPrivacy.doNotSendEmail === 0 ? AppConstants.yes : AppConstants.no}
                </div>
              </div>
              <div className="other-info-row" style={{ paddingTop: 10 }}>
                <div className="year-select-heading other-info-label">
                  {AppConstants.marketingOptIn}
                </div>
                <div className="desc-text-style side-bar-profile-data other-info-font">
                  {userCommPrivacy.marketingOptIn === 1 ? AppConstants.yes : AppConstants.no}
                </div>
              </div>
              <div className="other-info-row" style={{ paddingTop: 10 }}>
                <div className="year-select-heading other-info-label">
                  {AppConstants.photographyConsent}
                </div>
                <div className="desc-text-style side-bar-profile-data other-info-font">
                  {userCommPrivacy.photographyConsent === 1 ? AppConstants.yes : AppConstants.no}
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )
    );
  };

  return <div>{contentView()}</div>;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getCommunicationPrivacy }, dispatch);
}

function mapStateToProps(state) {
  return {
    userCommunicationPrivacy: state.UserState.userCommunicationPrivacy,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommunicationsAndPrivacyView);

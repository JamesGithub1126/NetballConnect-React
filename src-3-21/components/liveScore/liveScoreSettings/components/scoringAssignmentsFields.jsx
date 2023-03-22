import React, { useEffect } from 'react';
import { Checkbox, Form, Radio, Select } from 'antd';
import Tooltip from 'react-png-tooltip';
import ValidationConstants from 'themes/validationConstant';
import AppConstants from 'themes/appConstants';
import InputWithHead from 'customComponents/InputWithHead';
import { connect } from 'react-redux';
import { getUserDashboardTextualAction } from 'store/actions/userAction/userAction';
import { onChangeSettingForm } from 'store/actions/LiveScoreAction/LiveScoreSettingAction';
import { getOrganisationData } from 'util/sessionStorage';
import { bindActionCreators } from 'redux';
import { useState } from 'react';
import { mediumSelectStyles } from '../constants/liveScoreSettingsConstants';
import { FLAVOUR } from 'util/enums';
import { ScoringType, WhoScoring, AcceptScoring } from 'enums/enums';
import { checkEnvironment } from 'util/helpers';
import { showLiveScoringOption } from '../liveScoreSettingsUtils';

const { Option } = Select;

const isScoringEnabled = checkEnvironment('REACT_APP_SCORING_ASSIGNMENTS_FIELDS_ENABLED', 1);
const isVerifyEnabled = checkEnvironment('REACT_APP_SCORING_VERIFICATION_FIELDS_ENABLED', 1);

const ScoringAssignmentsFields = ({
  onInputChange,
  values,
  settingIsIntegrated,
  getUserDashboardTextualAction,
  onChangeSettingForm,
  userState,
}) => {
  const isFootball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Football;
  const [users, setUsers] = useState(null);

  useEffect(() => {
    async function getUserDashboardTextual() {
      const sortBy = null;
      const sortOrder = null;
      const organisationId = getOrganisationData().organisationUniqueKey;
      const payload = {
        competitionUniqueKey: '-1',
        dobFrom: '-1',
        dobTo: '-1',
        genderRefId: -1,
        isSearchByTeam: 1,
        linkedEntityId: organisationId,
        organisationId: organisationId,
        paging: { limit: 100, offset: 0 },
        postCode: '-1',
        roleId: [2],
        searchText: '',
        yearId: '-1',
      };
      await getUserDashboardTextualAction(payload, sortBy, sortOrder);
    }

    getUserDashboardTextual();
  }, []);

  useEffect(() => {
    if (userState.userDashboardTextualList) {
      setUsers(userState.userDashboardTextualList);
    }
  }, [userState]);

  const whoScoringView = () => {
    if (!isScoringEnabled) {
      return <></>;
    }

    if (values.scoring === ScoringType.NoScoringCard) {
      return <></>;
    }

    return (
      <>
        <InputWithHead heading={AppConstants.whoScoring} />
        <div className="row mt-0 ml-1">
          <Form.Item
            name="whoScoring"
            rules={[
              {
                required: true,
                message: ValidationConstants.scoringField,
              },
            ]}
          >
            <Radio.Group
              name="whoScoring"
              className="reg-competition-radio"
              onChange={onInputChange}
              style={{
                overflowX: 'unset',
              }}
              value={values.whoScoring}
            >
              <div className="row mt-0">
                <div className="col-sm-12 d-flex align-items-center">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value={WhoScoring.Managers}
                  >
                    {AppConstants.managersToScore}
                  </Radio>
                </div>

                <div className="col-sm-12 d-flex align-items-center">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value={WhoScoring.Court}
                  >
                    {AppConstants.courtToScope}
                  </Radio>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>
        {values.whoScoring === WhoScoring.Court && (
          <div>
            <InputWithHead heading={AppConstants.adminUserScoring} />
            <Form.Item name="adminUserScoring">
              {users && (
                <Select
                  placeholder={AppConstants.selectAdminUser}
                  style={mediumSelectStyles}
                  onChange={user => {
                    onChangeSettingForm({
                      key: 'adminUserScoring',
                      data: user,
                    });
                  }}
                >
                  {users &&
                    users.length &&
                    users.map(item => (
                      <Option key={item.userId} value={item.userId}>
                        {item.firstName + ' ' + item.lastName}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </div>
        )}
      </>
    );
  };

  const acceptScoresView = () => {
    if (!isVerifyEnabled) {
      return <></>;
    }

    if (values.scoring !== ScoringType.Single) {
      return <></>;
    }

    return (
      <>
        <InputWithHead heading={AppConstants.acceptScores} />
        <div className="row mt-0 ml-1">
          <Form.Item
            name="acceptScoring"
            rules={[
              {
                required: true,
                message: ValidationConstants.scoringField,
              },
            ]}
          >
            <Radio.Group
              name="acceptScoring"
              className="reg-competition-radio"
              onChange={onInputChange}
              style={{
                overflowX: 'unset',
              }}
              value={values.acceptScoring}
            >
              <div className="row mt-0">
                {settingIsIntegrated && (
                  <div className="col-sm-12 d-flex align-items-center">
                    <Radio value={AcceptScoring.Referee}>{AppConstants.umpireAcceptScores}</Radio>
                  </div>
                )}
                <div className="col-sm-12 d-flex align-items-center">
                  <Radio value={AcceptScoring.Scorer}>{AppConstants.scorerAcceptScores}</Radio>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>
      </>
    );
  };

  const onWhenScoringInputChange = event => {
    onInputChange(event);

    if (event.target.value === ScoringType.NoScoringCard) {
      onInputChange({
        target: {
          name: 'acceptScoring',
          value: AcceptScoring.Referee,
        },
      });
      onInputChange({
        target: {
          name: 'timerType',
          value: 'CENTRAL',
        },
      });
    }
  };

  const whenScoringView = () => {
    if (!isFootball) {
      return <></>;
    }

    return (
      <>
        <InputWithHead heading={AppConstants.whenWillScoring} />
        <div className="row mt-0 ml-1">
          <Form.Item
            name="scoring"
            rules={[
              {
                required: true,
                message: ValidationConstants.scoringField,
              },
            ]}
          >
            <Radio.Group
              name="scoring"
              className="reg-competition-radio"
              onChange={onWhenScoringInputChange}
              style={{
                overflowX: 'unset',
              }}
              value={values.scoring}
            >
              <div className="row mt-0">
                {showLiveScoringOption && (
                  <div className="col-sm-12 d-flex align-items-center">
                    <Radio value={ScoringType.Single}>{AppConstants.liveScoreDuring}</Radio>
                  </div>
                )}

                <div className="col-sm-12 d-flex align-items-center">
                  <Radio disabled={!settingIsIntegrated} value={ScoringType.NoScoringCard}>
                    {AppConstants.enterScoresAfter}
                  </Radio>
                  {!settingIsIntegrated && (
                    <Tooltip>
                      <span>{AppConstants.enterScoresAfterMsg}</span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>
      </>
    );
  };

  const whoScoringViewForNoScoringCard = () => {
    if (!isScoringEnabled) {
      return <></>;
    }

    if (values.scoring !== ScoringType.NoScoringCard) {
      return <></>;
    }

    return (
      <>
        <InputWithHead heading={AppConstants.whoScoring} />
        <div className="row mt-0 ml-1">
          <Form.Item
            name="whoScoring"
            rules={[
              {
                required: true,
                message: ValidationConstants.scoringField,
              },
            ]}
          >
            <Radio.Group
              name="whoScoring"
              className="reg-competition-radio"
              onChange={onInputChange}
              style={{
                overflowX: 'unset',
              }}
              value={values.whoScoring}
            >
              <div className="row mt-0">
                <div className="col-sm-12 d-flex align-items-center">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value={WhoScoring.Court}
                  >
                    {AppConstants.courtToScope}
                  </Radio>
                </div>
                <div className="col-sm-12 d-flex align-items-center">
                  <Radio
                    style={{
                      marginRight: 0,
                      paddingRight: 0,
                    }}
                    value={WhoScoring.Umpires}
                  >
                    {AppConstants.umpireToScore}
                  </Radio>
                </div>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>
        {values.whoScoring === WhoScoring.Court && (
          <div>
            <InputWithHead heading={AppConstants.adminUserScoring} />
            <Form.Item name="adminUserScoring">
              {users && (
                <Select
                  placeholder={AppConstants.selectAdminUser}
                  style={mediumSelectStyles}
                  onChange={user => {
                    onChangeSettingForm({
                      key: 'adminUserScoring',
                      data: user,
                    });
                  }}
                >
                  {users &&
                    users.length &&
                    users.map(item => (
                      <Option key={item.userId} value={item.userId}>
                        {item.firstName + ' ' + item.lastName}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </div>
        )}
        <div className="row mt-0 ml-1">
          <Form.Item name="AllowHomeTeamManagerToVerifyOfficials" valuePropName="checked">
            <Checkbox className="single-checkbox-radio-style pt-4 ml-0">
              {AppConstants.allowHomeTeamManagerToVerifyOfficials}
            </Checkbox>
          </Form.Item>
        </div>
      </>
    );
  };

  return (
    <>
      {whenScoringView()}
      {whoScoringView()}
      {acceptScoresView()}
      {whoScoringViewForNoScoringCard()}
    </>
  );
};

ScoringAssignmentsFields.defaultProps = {
  onInputChange: () => {},
  values: {
    scoring: ScoringType.Single,
  },
};

function mapStateToProps(state) {
  return {
    userState: state.UserState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUserDashboardTextualAction,
      onChangeSettingForm,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ScoringAssignmentsFields);

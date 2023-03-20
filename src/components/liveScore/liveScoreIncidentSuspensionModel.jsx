import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { upperCase } from 'lodash';
import { Button, Modal, DatePicker, Select, InputNumber, Radio } from 'antd';

import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import AppConstants from '../../themes/appConstants';
import {
  createPlayerSuspensionAction,
  initIncidentSuspensions,
  updateSelectedSuspension,
} from '../../store/actions/LiveScoreAction/liveScoreIncidentAction';
import { isNotNullAndUndefined } from '../../util/helpers';

const { Option } = Select;

const PLAYER_ROLE_ID = 8;
const permissibleRoles = ['player', 'manager', 'coach', 'umpire', 'admin', 'parent', 'spectator'];
const otherRole = { id: 0, name: 'other', description: 'Other', applicableToWeb: 0 };

const SelectUser = React.memo(({ incident, userId, selectUser }) => {
  const { foulUser, incidentPlayers } = incident;
  return (
    <div className="row">
      <div className="col-sm-3 d-flex align-items-center">
        <span className="">{AppConstants.for}</span>
      </div>
      <div className="col-sm-9">
        <Select
          name="selectPlayer"
          className="w-100"
          placeholder={AppConstants.selectUser}
          onChange={val => selectUser(val)}
          value={userId}
        >
          {foulUser ? (
            <Option key={`offence1Type_${foulUser.id}`} value={foulUser.id}>
              {`${foulUser.firstName} ${foulUser.lastName}`}
            </Option>
          ) : incidentPlayers && incidentPlayers.length ? (
            incidentPlayers.map((item, index) => (
              <Option key={index} value={item.player.userId}>
                {`${item.player.firstName} ${item.player.lastName}`}
              </Option>
            ))
          ) : (
            <></>
          )}
        </Select>
      </div>
    </div>
  );
});

const SelectDateRange = React.memo(({ suspendedFrom, suspendedTo, suspendedMatches, onUpdate }) => {
  const toMoment = date => (date ? moment(date) : null);

  return (
    <>
      <div className="row pt-5">
        <div className="col-sm">
          <span className="text-heading-large">{AppConstants.suspendedQuestion}</span>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <InputWithHead required="pt-0" heading={AppConstants.dateFrom} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            size="default"
            style={{ minWidth: 160 }}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            onChange={val => onUpdate({ suspendedFrom: val })}
            value={toMoment(suspendedFrom)}
            disabledDate={date => date && date < moment().endOf('day')}
          />
        </div>
        <div className="col-sm-6">
          <InputWithHead required="pt-0" heading={AppConstants.dateTo} />
          <DatePicker
            className="reg-payment-datepicker w-100"
            size="default"
            style={{ minWidth: 160 }}
            format="DD-MM-YYYY"
            showTime={false}
            placeholder="dd-mm-yyyy"
            onChange={val => onUpdate({ suspendedTo: val })}
            value={toMoment(suspendedTo)}
            disabledDate={date =>
              date && suspendedFrom && date < moment(suspendedFrom, 'DD/MM/YYYY').endOf('day')
            }
            disabled={Boolean(suspendedMatches)}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <span className="text-heading-large pt-5">{upperCase(AppConstants.or)}</span>
          <InputWithHead required="pt-0" heading={AppConstants.numberOfMatches} />
          <InputNumber
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            onChange={val => onUpdate({ suspendedMatches: val })}
            value={suspendedMatches}
            placeholder="0"
            disabled={!!suspendedTo}
          />
        </div>
      </div>
    </>
  );
});

const SelectRole = React.memo(({ roleId, userRoles, onUpdate }) => {
  return (
    <div className="row">
      <div className="col-sm">
        <span className="text-heading-large pt-5">{AppConstants.applyToWhichRole}</span>
        <div className="row">
          <div className="col-sm-3 d-flex align-items-center">
            <span className="">{AppConstants.role}</span>
          </div>
          <div className="col-sm-9">
            <Select
              name="selectRole"
              className="w-100"
              value={roleId}
              onChange={e => onUpdate({ roleId: e })}
            >
              {userRoles.map((role, index) => (
                <Option key={index} value={role.id}>
                  {role.description}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
});

const ParticipationRestriction = React.memo(({ participationRestrictionRefId, onUpdate }) => {
  return (
    <div className="row">
      <div className="col-sm-6">
        <span className="text-heading-large pt-5">{AppConstants.participationRestriction}</span>
        <Radio.Group
          className="reg-competition-radio w-100 mt-4"
          name="applySuspensionTo"
          onChange={e => onUpdate({ participationRestrictionRefId: e.target.value })}
          value={
            isNotNullAndUndefined(participationRestrictionRefId) ? participationRestrictionRefId : 1
          }
        >
          <Radio className="p-0" value={1}>
            {AppConstants.allowParticipantToBeSelected}
          </Radio>
          <Radio className="p-0" value={2}>
            {AppConstants.doNotAllowParticipantToBeSelected}
          </Radio>
        </Radio.Group>
      </div>
    </div>
  );
});

const SelectCompetitions = React.memo(
  ({ isAllCompetitions, selectedCompetitions, competitionList, onUpdate }) => {
    const handleCompetitionMode = useCallback(
      e => {
        const isAllCompetitions = e.target.value === 1;
        onUpdate({
          isAllCompetitions,
          selectedCompetitions: isAllCompetitions ? competitionList.map(comp => comp.id) : [],
        });
      },
      [onUpdate],
    );

    return (
      <div className="row">
        <div className="col-sm">
          <span className="text-heading-large pt-5">{AppConstants.applyToWhichCompetition}</span>
          <div className="row">
            <div className="col-sm-3 d-flex align-items-center">
              <Radio.Group
                className="reg-competition-radio w-100 mt-4"
                name="selectRole"
                onChange={handleCompetitionMode}
                value={isAllCompetitions ? 1 : 2}
              >
                <Radio className="p-0" value={1}>
                  {AppConstants.allCompetitions}
                </Radio>
                <Radio className="p-0" value={2}>
                  {AppConstants.selectedCompetitions}
                </Radio>
              </Radio.Group>
            </div>
          </div>
          {isAllCompetitions === false && (
            <div className="row pt-3">
              <div className="col-sm-3 d-flex align-items-center">
                <span className="">{AppConstants.competitions}</span>
              </div>
              <div className="col-sm-9">
                <Select
                  name="selectRole"
                  mode="multiple"
                  className="w-100"
                  onChange={value => onUpdate({ selectedCompetitions: value })}
                  value={selectedCompetitions}
                >
                  {competitionList.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

const LiveScoreIncidentSuspensionModel = ({ visible, onCancel, activeIncident }) => {
  const dispatch = useDispatch();
  const { incidentSuspensions } = useSelector(state => state.LiveScoreIncidentState);
  const { roles } = useSelector(state => state.UserState);
  const { competitionList } = useSelector(state => state.InnerHorizontalState);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Get selected suspension based on selected user ID.
  const {
    roleId = PLAYER_ROLE_ID,
    suspendedFrom,
    suspendedTo,
    suspendedMatches,
    participationRestrictionRefId,
    isAllCompetitions = true,
    selectedCompetitions = [],
  } = useMemo(() => {
    if (selectedUserId) {
      const suspension = incidentSuspensions.find(i => i.userId === selectedUserId);
      if (suspension) return suspension;
    }
    return {};
  }, [selectedUserId, incidentSuspensions]);

  // Create suspension object
  const createSuspension = useCallback(
    userId => {
      const { id: incidentId, teamId } = activeIncident;
      return {
        incidentId,
        userId,
        suspensionTypeRefId: 1,
        teamId,
        roleId: PLAYER_ROLE_ID,
        participationRestrictionRefId: 1,
        isAllCompetitions: true,
        selectedCompetitions: [],
      };
    },
    [activeIncident],
  );

  // Initialize selected user ID and suspension list.
  useEffect(() => {
    const { foulUser, incidentPlayers } = activeIncident;
    if (foulUser) {
      setSelectedUserId(foulUser.id);
    } else if (incidentPlayers && incidentPlayers.length > 0) {
      const userId = incidentPlayers[0].player.userId;
      setSelectedUserId(userId);
    }

    const suspensions = (activeIncident.suspensions ? activeIncident.suspensions : []).map(
      suspension => ({
        ...suspension,
        selectedCompetitions: suspension.selectedCompetitions.map(i => i.competitionId),
      }),
    );

    if (foulUser) {
      if (!suspensions.find(i => i.userId === foulUser.id)) {
        suspensions.push(createSuspension(foulUser.id));
      }
    } else if (incidentPlayers && incidentPlayers.length > 0) {
      incidentPlayers.forEach(i => {
        if (!suspensions.find(s => s.userId === i.player.userId)) {
          suspensions.push(createSuspension(i.player.userId));
        }
      });
    }
    dispatch(initIncidentSuspensions(suspensions));
  }, []);

  // Get avaliable user roles
  const userRoles = useMemo(() => {
    const filtered = (roles || []).filter(role => permissibleRoles.includes(role.name));
    return [...filtered, otherRole];
  }, [roles]);

  const playerRoleId = useMemo(() => {
    const role = userRoles.find(role => role.name.includes('player'));
    return role ? role.id : PLAYER_ROLE_ID;
  }, [userRoles]);

  const validRoleId = useCallback(
    roleId => {
      if (roleId) {
        return userRoles.find(i => i.id === roleId) ? roleId : playerRoleId;
      }
      return playerRoleId;
    },
    [userRoles, playerRoleId],
  );

  const suspensionRoleId = useMemo(() => {
    return validRoleId(roleId);
  }, [roleId, validRoleId]);

  const isSubmitActive = useMemo(() => {
    return (suspendedFrom && suspendedTo) || (suspendedFrom && suspendedMatches);
  }, [suspendedFrom, suspendedTo, suspendedMatches]);

  // Update current selected suspension.
  const onUpdateSuspension = useCallback(
    payload => {
      dispatch(updateSelectedSuspension(selectedUserId, payload));
    },
    [dispatch, selectedUserId],
  );

  // Submit form
  const onSubmit = () => {
    const { id: incidentId } = activeIncident;
    const suspensions = incidentSuspensions.filter(
      i => (i.suspendedFrom && i.suspendedTo) || (i.suspendedFrom && i.suspendedMatches),
    );
    for (let suspension of suspensions) {
      suspension.roleId = validRoleId(suspension.roleId);
    }
    const payload = {
      incidentId,
      body: suspensions,
    };
    dispatch(createPlayerSuspensionAction(payload));
    onCancel();
  };

  return (
    <Modal
      title={AppConstants.suspensionDetails}
      visible={!!visible}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      centered
      footer={null}
    >
      <SelectUser
        incident={activeIncident}
        userId={selectedUserId}
        selectUser={setSelectedUserId}
      />
      <SelectDateRange
        suspendedFrom={suspendedFrom}
        suspendedTo={suspendedTo}
        suspendedMatches={suspendedMatches}
        onUpdate={onUpdateSuspension}
      />
      <SelectRole roleId={suspensionRoleId} userRoles={userRoles} onUpdate={onUpdateSuspension} />
      {suspensionRoleId === playerRoleId && (
        <ParticipationRestriction
          participationRestrictionRefId={participationRestrictionRefId}
          onUpdate={onUpdateSuspension}
        />
      )}
      <SelectCompetitions
        isAllCompetitions={isAllCompetitions}
        selectedCompetitions={selectedCompetitions}
        competitionList={competitionList}
        onUpdate={onUpdateSuspension}
      />
      <div
        className="comp-dashboard-botton-view-mobile d-flex justify-content-between"
        style={{ paddingTop: 24 }}
      >
        <Button onClick={onCancel} type="cancel-button">
          {AppConstants.cancel}
        </Button>
        <Button onClick={onSubmit} type="primary" disabled={!isSubmitActive}>
          {AppConstants.confirm}
        </Button>
      </div>
    </Modal>
  );
};

export default LiveScoreIncidentSuspensionModel;

import React, { Component } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, message, Button, Modal, Select, Menu, Checkbox } from 'antd';

import CustomToolTip from 'react-png-tooltip';
import AppConstants from '../../../themes/appConstants';
import { isArrayNotEmpty, uniq } from '../../../util/helpers';
import { RegistrationInvitees } from '../../../enums/registrationEnums';
import {
  add_inviteesToCompetitionFeeDetails,
  cancel_add_inviteesToCompetitionFeeDetails,
  saveAddedInviteesToCompetitionFeesDetails,
  onInviteesSearchAction,
} from '../../../store/actions/registrationAction/competitionFeeAction';

const { Option } = Select;

const AddInvitesModalView = ({
  isAddInvitesModalVisible,
  setFormState,
  getMembershipDetails,
  yearRefId,
}) => {
  const dispatch = useDispatch();
  const competitionFeesState = useSelector(state => state.CompetitionFeesState);
  const appState = useSelector(state => state.AppState);

  if (!isAddInvitesModalVisible) {
    return null;
  }
  if (!competitionFeesState || !appState) {
    return null;
  }

  const {
    competitionDetailData,
    addedAssociationLeague,
    addedClubSchool,
    associationAffilites,
    clubAffilites,
    addingClubChecked,
    addingAssociationChecked,
    postInvitees,
    searchLoad,
  } = competitionFeesState;
  const { registrationInvitees } = appState;
  if (!competitionDetailData) {
    return null;
  }

  const { competitionUniqueKey } = competitionDetailData;

  const handleCancel = () => {
    dispatch(cancel_add_inviteesToCompetitionFeeDetails());
    setFormState({ isAddInvitesModalVisible: false });
  };

  const handleOk = () => {
    if (!isArrayNotEmpty(addedAssociationLeague) && !isArrayNotEmpty(addedClubSchool)) {
      message.error(AppConstants.regInviteesAnyOrgToAdd);
      return;
    }
    const payload = {
      invitees: [],
    };

    let localAddedAssociationLeague = addedAssociationLeague;
    let localAddedClubSchool = addedClubSchool;
    if (isArrayNotEmpty(addedAssociationLeague)) {
      localAddedAssociationLeague = uniq(addedAssociationLeague);
    }
    if (isArrayNotEmpty(addedClubSchool)) {
      localAddedClubSchool = uniq(addedClubSchool);
    }
    if (isArrayNotEmpty(localAddedAssociationLeague)) {
      let associationLeague = {
        registrationInviteesRefId: RegistrationInvitees.AnyAssociation,
        inviteesOrg: [],
      };
      for (let orgKey of localAddedAssociationLeague) {
        let inviteOrg = associationAffilites.find(x => x.organisationId == orgKey);
        associationLeague.inviteesOrg.push({ id: inviteOrg.id, organisationUniqueKey: orgKey });
      }
      payload.invitees.push(associationLeague);
    }
    if (isArrayNotEmpty(localAddedClubSchool)) {
      let clubInvite = {
        registrationInviteesRefId: RegistrationInvitees.AnyClub,
        inviteesOrg: [],
      };
      for (let orgKey of localAddedClubSchool) {
        let inviteOrg = clubAffilites.find(x => x.organisationId == orgKey);
        clubInvite.inviteesOrg.push({ id: inviteOrg.id, organisationUniqueKey: orgKey });
      }
      payload.invitees.push(clubInvite);
    }

    dispatch(saveAddedInviteesToCompetitionFeesDetails(competitionUniqueKey, payload));
    setFormState({ isAddInvitesModalVisible: false });
    if (getMembershipDetails) {
      getMembershipDetails(yearRefId);
    }
  };

  const invitees = registrationInvitees.length > 0 ? registrationInvitees : [];

  const item = invitees.find(inv => inv.name === 'any');

  let existInvitees = postInvitees || [];
  const associationsPostInvitees = existInvitees.find(
    x => x.registrationInviteesRefId == RegistrationInvitees.AnyAssociation,
  )?.inviteesOrg;
  const clubsPostInvitees = existInvitees.find(
    x => x.registrationInviteesRefId == RegistrationInvitees.AnyClub,
  )?.inviteesOrg;

  const arrFromAssociationUniqueKeys = associationsPostInvitees?.map(
    item => item.organisationUniqueKey,
  );
  const arrFromClubUniqueKeys = clubsPostInvitees?.map(item => item.organisationUniqueKey);

  const filteredAssociationsAffilites = associationAffilites?.filter(
    item => !arrFromAssociationUniqueKeys?.includes(item.organisationId),
  );
  const filteredClubsAffilites = clubAffilites?.filter(
    item => !arrFromClubUniqueKeys?.includes(item.organisationId),
  );

  let isDisabledOkBtn = true;
  if (addedClubSchool || addedAssociationLeague) {
    if (addedClubSchool?.length !== 0 || addedAssociationLeague?.length !== 0) {
      isDisabledOkBtn = false;
    }
  }

  return (
    <Modal
      visible={isAddInvitesModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      footer={[
        <Button key="cancelBtn" onClick={handleCancel} type="primary">
          {AppConstants.cancel}
        </Button>,
        <Button
          key="okBtn"
          className="ml-4"
          onClick={handleOk}
          type="primary"
          disabled={isDisabledOkBtn}
        >
          {AppConstants.ok}
        </Button>,
      ]}
    >
      <div>
        <div className="contextualHelp-RowDirection">
          <div className="applicable-to-heading invitees-main">{item?.description}</div>
          <div className="mt-2">
            <CustomToolTip>
              <span>{AppConstants.regInviteesAnyOrgAfterPublishMsg}</span>
            </CustomToolTip>
          </div>
        </div>

        <div className="d-flex flex-column align-items-start" style={{ paddingLeft: 20 }}>
          <Checkbox
            className="single-checkbox-radio-style"
            style={{ paddingTop: 8 }}
            checked={addingAssociationChecked}
            onChange={e =>
              dispatch(
                add_inviteesToCompetitionFeeDetails(e.target.checked, 'addingAssociationChecked'),
              )
            }
          >
            {item?.subReferences[0].description}
          </Checkbox>

          {addingAssociationChecked && (
            <Select
              mode="multiple"
              className="w-100 mt-2"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={(associationAffilite, options) => {
                dispatch(
                  add_inviteesToCompetitionFeeDetails(associationAffilite, 'associationAffilite'),
                );
              }}
              value={addedAssociationLeague}
              placeholder={AppConstants.selectOrganisation}
              filterOption={false}
              onSearch={value => {
                dispatch(onInviteesSearchAction(value, 3));
              }}
              showSearch
              onBlur={() =>
                isArrayNotEmpty(associationAffilites) == false
                  ? dispatch(onInviteesSearchAction('', 3))
                  : null
              }
              onFocus={() =>
                isArrayNotEmpty(associationAffilites) == false
                  ? dispatch(onInviteesSearchAction('', 3))
                  : null
              }
              loading={searchLoad}
            >
              {filteredAssociationsAffilites?.map(item => (
                <Option key={'organisation__' + item.organisationId} value={item.organisationId}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}

          <Checkbox
            className="single-checkbox-radio-style ml-0"
            style={{ paddingTop: 13 }}
            checked={addingClubChecked}
            onChange={e =>
              dispatch(add_inviteesToCompetitionFeeDetails(e.target.checked, 'addingClubChecked'))
            }
          >
            {item?.subReferences[1].description}
          </Checkbox>
          {addingClubChecked && (
            <Select
              mode="multiple"
              className="w-100 mt-2"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={clubAffilite => {
                dispatch(add_inviteesToCompetitionFeeDetails(clubAffilite, 'clubAffilite'));
              }}
              value={addedClubSchool}
              placeholder={AppConstants.selectOrganisation}
              filterOption={false}
              onSearch={value => {
                dispatch(onInviteesSearchAction(value, 4));
              }}
              onBlur={() =>
                isArrayNotEmpty(clubAffilites) === false
                  ? dispatch(onInviteesSearchAction('', 4))
                  : null
              }
              onFocus={() =>
                isArrayNotEmpty(clubAffilites) === false
                  ? dispatch(onInviteesSearchAction('', 4))
                  : null
              }
              loading={searchLoad}
            >
              {filteredClubsAffilites?.map(item => (
                <Option key={'organisation__' + item.organisationId} value={item.organisationId}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddInvitesModalView;

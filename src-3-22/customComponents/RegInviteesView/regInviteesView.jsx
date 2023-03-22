import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Button, Radio } from 'antd';

import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import {
  add_editcompetitionFeeDeatils,
  onInviteesSearchAction,
} from '../../store/actions/registrationAction/competitionFeeAction';

import CustomToolTip from 'react-png-tooltip';
import TutorialConstants from 'themes/tutorialConstants';
import AffiliateSearchInvitee from '../AffiliatesSearchInvitee/affiliatesSearchInvitee';
import TutorialVideoModal from 'customComponents/TutorialVideoModal/TutorialVideoModal';
import AddInvitesModalView from 'components/registration/competitionfee/AddInvitesModalView';
import AppUniqueId from 'themes/appUniqueId';

const tutorial = TutorialConstants.find(t => t.name === 'registrationCompetitionFee');

const RegInviteesView = ({
  organisationTypeRefId,
  yearRefId,
  regInviteesDisable,
  isAffiliateEdit,
}) => {
  const dispatch = useDispatch();
  const competitionFeesState = useSelector(state => state.CompetitionFeesState);
  const appState = useSelector(state => state.AppState);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);
  const [showAddInvitesModal, setShowAddInvitesModal] = useState(false);
  if (!competitionFeesState || !appState) {
    return null;
  }
  
  const {
    affiliateSelected,
    anyOrgSelected,
    otherSelected,
    affiliateNonSelected,
    anyOrgNonSelected,
    associationChecked,
    clubChecked,
    competitionDetailData,
  } = competitionFeesState;

  const { registrationInvitees: invitees } = appState;

  // let organisationTypeRefId = JSON.stringify(this.state.organisationTypeRefId);
  // let regInviteesDisable = this.state.permissionState.regInviteesDisable;
  // let isAffiliateEdit = this.state.isCreatorEdit;

  const addInviteeModalProps = {
    isAddInvitesModalVisible: showAddInvitesModal,
    yearRefId: yearRefId,
    setFormState: ({ isAddInvitesModalVisible }) =>
      setShowAddInvitesModal(isAddInvitesModalVisible),
    onInviteeSearch: (value, inviteesType) => dispatch(onInviteesSearchAction(value, inviteesType)),
    getMembershipDetails: null,
  };

  return (
    <div className="fees-view">
      {/************************************** Tutorial Video **************************************/}
      {/* 

      commented out due to it relating to registrations competition. We can eventually use it conditionally
      if this component is used for registration competitions.
      
      <TutorialVideoModal
        visible={showTutorialVideo}
        url={tutorial?.videoUrl}
        onOk={() => setShowTutorialVideo(false)}
        onCancel={() => setShowTutorialVideo(false)}
      /> */}

      {/************************************** Add Invites Modal View **************************************/}
      {showAddInvitesModal ? <AddInvitesModalView {...addInviteeModalProps} /> : null}

      {/************************************** Title **************************************/}
      <div className="contextualHelp-RowDirection">
        <span className="form-heading required-field">{AppConstants.registrationInvitees}</span>
        {/* <div className="mt-2 ml-2">
          <img
            id="question_icon"
            src={AppImages.questionIcon}
            alt=""
            onClick={() => setShowTutorialVideo(true)}
            width={'25px'}
            height={'25px'}
            style={{ cursor: 'pointer' }}
          />
        </div> */}
      </div>
      <div>
        {/************************************** Affiliates **************************************/}
        <Radio.Group
          className="reg-competition-radio"
          onChange={e =>
            dispatch(add_editcompetitionFeeDeatils(e.target.value, 'affiliateSelected'))
          }
          disabled={regInviteesDisable}
          value={affiliateSelected}
        >
          {(invitees || []).map((item, index) => {
            return (
              index === 0 && (
                <div key={item.id}>
                  {item.subReferences.length === 0 ? (
                    <Radio value={item.id}>{item.description}</Radio>
                  ) : (
                    <div>
                      {(organisationTypeRefId == '4' && item.id == 1) == false && (
                        <div className="contextualHelp-RowDirection">
                          <div className="applicable-to-heading invitees-main">
                            {item.description}
                          </div>
                          <div className="mt-2">
                            <CustomToolTip>
                              <span>{item.helpMsg}</span>
                            </CustomToolTip>
                          </div>
                        </div>
                      )}
                      {item.subReferences.map(subItem =>
                        subItem.id == 2 ? (
                          <div key={'i' + subItem.id} style={{ marginLeft: 20 }}>
                            {disableInvitee(subItem, organisationTypeRefId) && (
                              <Radio data-testid={AppUniqueId.REGISTRATION_INVITEES_2ND_LEVEL_AFFILIATES + subItem.id} key={subItem.id} value={subItem.id}>
                                {subItem.description}
                              </Radio>
                            )}
                          </div>
                        ) : (
                          <React.Fragment key={'i' + subItem.id}>
                            <div style={{ marginLeft: 20 }}>
                              {disableInvitee(subItem, organisationTypeRefId) && (
                                <Radio data-testid={AppUniqueId.REGISTRATION_INVITEES_2ND_LEVEL_AFFILIATES+ subItem.id} key={subItem.id} value={subItem.id}>
                                  {subItem.description}
                                </Radio>
                              )}
                            </div>
                            <div style={{ marginLeft: 20 }}>
                              {disableInvitee(subItem, organisationTypeRefId) && (
                                <Radio.Group
                                  onChange={e =>
                                    dispatch(
                                      add_editcompetitionFeeDeatils(
                                        e.target.value,
                                        'affiliateNonSelected',
                                      ),
                                    )
                                  }
                                  disabled={regInviteesDisable}
                                  value={affiliateNonSelected}
                                >
                                  <Radio key="none1" value="none1">
                                    None
                                  </Radio>
                                </Radio.Group>
                              )}
                            </div>
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )
            );
          })}
        </Radio.Group>

        {/************************************** Any Organisation **************************************/}
        <Radio.Group
          className="reg-competition-radio mt-0"
          onChange={e => dispatch(add_editcompetitionFeeDeatils(e.target.value, 'anyOrgSelected'))}
          value={anyOrgSelected}
          disabled={regInviteesDisable}
        >
          {(invitees || []).map(
            (item, index) =>
              index === 1 && (
                <div key={item.id}>
                  {item.subReferences.length === 0 ? (
                    <Radio value={item.id}>{item.description}</Radio>
                  ) : (
                    <div>
                      <div className="contextualHelp-RowDirection">
                        <div className="applicable-to-heading invitees-main">
                          {item.description}
                        </div>
                        <div className="mt-2">
                          <CustomToolTip>
                            <span>{item.helpMsg}</span>
                          </CustomToolTip>
                        </div>
                      </div>
                      <div className="d-flex flex-column" style={{ paddingLeft: 20 }}>
                        <Checkbox
                          disabled={regInviteesDisable}
                          className="single-checkbox-radio-style"
                          data-testid={AppUniqueId.COMPETITION_ANY_ORGANIZATION_ASSOCIATION}
                          style={{ paddingTop: 8 }}
                          checked={associationChecked}
                          onChange={e =>
                            dispatch(
                              add_editcompetitionFeeDeatils(e.target.checked, 'associationChecked'),
                            )
                          }
                        >
                          {item.subReferences[0].description}
                        </Checkbox>
                        <AffiliateSearchInvitee
                          data={item.subReferences[0]}
                          regInviteesDisable={regInviteesDisable}
                        />
                        <Checkbox
                          disabled={regInviteesDisable}
                          className="single-checkbox-radio-style ml-0"
                          data-testid={AppUniqueId.COMPETITION_ANY_ORGANIZATION_CLUB}
                          style={{ paddingTop: 13 }}
                          checked={clubChecked}
                          onChange={e =>
                            dispatch(add_editcompetitionFeeDeatils(e.target.checked, 'clubChecked'))
                          }
                        >
                          {item.subReferences[1].description}
                        </Checkbox>

                        <AffiliateSearchInvitee
                          data={item.subReferences[1]}
                          regInviteesDisable={regInviteesDisable}
                        />
                      </div>

                      <div style={{ marginLeft: 20 }}>
                        <Radio.Group
                          onChange={e =>
                            dispatch(
                              add_editcompetitionFeeDeatils(e.target.value, 'anyOrgNonSelected'),
                            )
                          }
                          value={anyOrgNonSelected}
                          disabled={regInviteesDisable}
                        >
                          <Radio key="none2" value="none2">
                            None
                          </Radio>
                        </Radio.Group>
                      </div>
                    </div>
                  )}
                </div>
              ),
          )}
        </Radio.Group>

        {/************************************** Other Options **************************************/}
        <Radio.Group
          className="reg-competition-radio mt-0"
          onChange={e => dispatch(add_editcompetitionFeeDeatils(e.target.value, 'otherSelected'))}
          disabled={regInviteesDisable}
          value={otherSelected}
        >
          {(invitees || []).map(
            (item, index) =>
              index > 1 && (
                <div key={item.id}>
                  {item.subReferences.length === 0 ? (
                    <div className="contextualHelp-RowDirection">
                      <Radio data-testid= {AppUniqueId.REGISTRATION_INVITEES_DIRECT + item.description} value={item.id}>{item.description}</Radio>
                      <div className="ml-n20 mt-2">
                        <CustomToolTip>
                          <span>{item.helpMsg}</span>
                        </CustomToolTip>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="applicable-to-heading invitees-main">{item.description}</div>
                      {item.subReferences.map(subItem => (
                        <div key={subItem.id} style={{ marginLeft: 20 }}>
                          <Radio
                            disabled={regInviteesDisable}
                            onChange={e =>
                              dispatch(add_editcompetitionFeeDeatils(e.target.value, 'none'))
                            }
                            key={subItem.id}
                            value={subItem.id}
                          >
                            {subItem.description}
                          </Radio>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
          )}
        </Radio.Group>
      </div>

      {/************************************** add invitees **************************************/}
      {competitionDetailData.statusRefId === 2 && !otherSelected && !isAffiliateEdit && (
        <Button
          key="add invites"
          className="mt-5 ant-btn ant-btn-primary"
          onClick={() => setShowAddInvitesModal(true)}
        >
          {AppConstants.addInvitees}
        </Button>
      )}
    </div>
  );
};

const disableInvitee = (item, organisationTypeRefId) => {
  if (item.id == '2' && organisationTypeRefId == '3') {
    return false;
  }
  if (item.id == '3' && organisationTypeRefId == '4') {
    return false;
  }
  if (item.id == '2' && organisationTypeRefId == '4') {
    return false;
  }

  return true;
};

export default RegInviteesView;

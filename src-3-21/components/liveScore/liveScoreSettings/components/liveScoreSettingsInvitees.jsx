import { Button, Checkbox, Radio, Select } from 'antd';
import AppConstants from 'themes/appConstants';
import React from 'react';
import { get } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

const { Option } = Select;
const LiveScoreSettingsInvitees = ({
  stateEditMode,
  localEditMode,
  okClick,
  onFormChange,
  onInviteesChange,
  onInviteesSearchAction,
  organisationTypeRefId,
  onOpenModel,
}) => {
  const dispatch = useDispatch();
  const liveScoreSettingState = useSelector(state => state.LiveScoreSetting);
  const competitionFeesState = useSelector(state => state.CompetitionFeesState);

  const {
    affiliateSelected,
    anyOrgSelected,
    otherSelected,
    affiliateNonSelected,
    anyOrgNonSelected,
    associationChecked,
    clubChecked,
    clubSchool,
    associationLeague,
    hasCompetitions,
  } = liveScoreSettingState;
  const { clubAffilites, associationAffilites } = competitionFeesState;

  const invitees = get(liveScoreSettingState, 'registrationInvitees', []);
  const orgLevelId = JSON.stringify(organisationTypeRefId);
  const isEditMode = stateEditMode === 'edit' || localEditMode === 'edit';
  const disabledComponent = isEditMode && okClick;
  const isEdit = stateEditMode || localEditMode || 'add';
  const isEditButtonShow = (isEdit.edit === 'edit' || isEdit === 'edit') && okClick;

  const onInviteeSearch = (value, inviteesType) => {
    dispatch(onInviteesSearchAction(value, inviteesType));
  };

  return (
    <div
      className={
        (isEdit.edit === 'edit' || isEdit === 'edit') && okClick && 'inside-container-view'
      }
    >
      {isEditButtonShow && !hasCompetitions && (
        <div className="transfer-image-view">
          <Button onClick={onOpenModel} className="primary-add-comp-form" type="primary">
            {AppConstants.edit}
          </Button>
        </div>
      )}

      <div>
        <Radio.Group
          className={
            `reg-competition-radio${(isEdit.edit === 'edit' || isEdit === 'edit') && okClick}`
              ? ''
              : ' mt-5'
          }
          onChange={e =>
            onFormChange({
              key: 'affiliateSelected',
              data: e.target.value,
            })
          }
          value={affiliateSelected}
          disabled={disabledComponent}
        >
          {(invitees || []).map(
            (item, index) =>
              index === 0 && (
                <div key={item.id}>
                  {item.subReferences.length === 0 ? (
                    <Radio value={item.id}>{item.description}</Radio>
                  ) : (
                    <div>
                      <div className="applicable-to-heading invitees-main">
                        {(orgLevelId === '2' || orgLevelId === '3') && item.description}
                      </div>
                      {item.subReferences.map(subItem =>
                        orgLevelId === '2' && subItem.id === 2 ? (
                          <div
                            key={subItem.id}
                            style={{
                              marginLeft: 20,
                            }}
                          >
                            <Radio key={subItem.id} value={subItem.id}>
                              {subItem.description}
                            </Radio>
                          </div>
                        ) : (
                          <div key={subItem.id}>
                            {(orgLevelId === '2' || orgLevelId === '3') && subItem.id === 3 && (
                              <>
                                <div
                                  key={subItem.id}
                                  style={{
                                    marginLeft: 20,
                                  }}
                                >
                                  <Radio key={subItem.id} value={subItem.id}>
                                    {subItem.description}
                                  </Radio>
                                </div>

                                <div
                                  style={{
                                    marginLeft: 20,
                                  }}
                                >
                                  <Radio.Group
                                    onChange={e =>
                                      onFormChange({
                                        key: 'affiliateNonSelected',
                                        data: e.target.value,
                                        subItem,
                                      })
                                    }
                                    value={affiliateNonSelected}
                                    disabled={disabledComponent}
                                  >
                                    <Radio disabled={disabledComponent} key="none1" value="none1">
                                      None
                                    </Radio>
                                  </Radio.Group>
                                </div>
                              </>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
          )}
        </Radio.Group>

        <Radio.Group
          className="reg-competition-radio mt-0"
          onChange={e => onInviteesChange(e.target.value)}
          value={anyOrgSelected}
          disabled={disabledComponent}
        >
          {(invitees || []).map(
            (item, index) =>
              index === 1 && (
                <div key={item.id}>
                  {item.subReferences.length === 0 ? (
                    <Radio value={item.id}>{item.description}</Radio>
                  ) : (
                    <div>
                      <div className="applicable-to-heading invitees-main">{item.description}</div>

                      <div className="d-flex flex-column" style={{ paddingLeft: 13 }}>
                        <Checkbox
                          disabled={disabledComponent}
                          className="single-checkbox-radio-style"
                          style={{
                            paddingLeft: 7,
                            paddingTop: 8,
                          }}
                          checked={associationChecked}
                          onChange={e =>
                            onFormChange({
                              key: 'associationChecked',
                              data: e.target.checked,
                              checkBoxId: item.subReferences[0].id,
                            })
                          }
                        >
                          {item.subReferences[0].description}
                        </Checkbox>

                        {associationChecked ? (
                          <div className="col-sm ml-3">
                            <Select
                              mode="multiple"
                              className="w-100"
                              style={{
                                paddingRight: 1,
                                minWidth: 182,
                              }}
                              onChange={associationAffiliate => {
                                onFormChange({
                                  key: 'associationAffilite',
                                  data: associationAffiliate,
                                });
                              }}
                              value={associationLeague}
                              placeholder={AppConstants.selectOrganisation}
                              filterOption={false}
                              onSearch={value => {
                                onInviteeSearch(value, 3);
                              }}
                              showSearch
                              onBlur={() => onInviteeSearch('', 3)}
                              disabled={disabledComponent}
                            >
                              {associationAffilites.map(item => (
                                <Option key={`organisation_${item.id}`} value={item.id}>
                                  {item.name}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        ) : null}

                        <Checkbox
                          disabled={disabledComponent}
                          className="single-checkbox-radio-style"
                          style={{
                            paddingTop: 15,
                            paddingLeft: associationChecked ? 5 : 0,
                          }}
                          checked={clubChecked}
                          onChange={e =>
                            onFormChange({
                              key: 'clubChecked',
                              data: e.target.checked,
                              checkBoxId: item.subReferences[1].id,
                            })
                          }
                        >
                          {item.subReferences[1].description}
                        </Checkbox>

                        {clubChecked ? (
                          <div className="col-sm ml-3">
                            <Select
                              mode="multiple"
                              className="w-100"
                              style={{
                                paddingRight: 1,
                                minWidth: 182,
                              }}
                              onChange={clubAffiliate => {
                                onFormChange({
                                  key: 'clubAffilite',
                                  data: clubAffiliate,
                                });
                              }}
                              value={clubSchool}
                              placeholder={AppConstants.selectOrganisation}
                              filterOption={false}
                              onSearch={value => {
                                onInviteeSearch(value, 4);
                              }}
                              onBlur={() => onInviteeSearch('', 4)}
                              disabled={disabledComponent}
                            >
                              {clubAffilites.map(clubAffiliatesItem => (
                                <Option
                                  key={`organisation_${clubAffiliatesItem.id}`}
                                  value={clubAffiliatesItem.id}
                                >
                                  {clubAffiliatesItem.name}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ marginLeft: 20 }}>
                        <Radio.Group
                          onChange={e =>
                            onFormChange({
                              key: 'anyOrgNonSelected',
                              data: e.target.value,
                            })
                          }
                          value={anyOrgNonSelected}
                          disabled={disabledComponent}
                        >
                          <Radio disabled={disabledComponent} key="none2" value="none2">
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

        <Radio.Group
          className="reg-competition-radio mt-0"
          onChange={e =>
            onFormChange({
              key: 'otherSelected',
              data: e.target.value,
            })
          }
          value={otherSelected}
          disabled={disabledComponent}
        >
          {(invitees || []).map(
            (item, index) =>
              index > 1 && (
                <div key={item.description}>
                  {item.subReferences ? (
                    <div>
                      <div className="applicable-to-heading invitees-main">{item.description}</div>
                      {item.subReferences.map(subItem => (
                        <div
                          key={`subReference_${subItem.id}`}
                          style={{
                            marginLeft: 20,
                          }}
                        >
                          <Radio
                            onChange={e =>
                              onFormChange({
                                key: 'none',
                                data: e.target.value,
                              })
                            }
                            key={subItem.id}
                            value={subItem.id}
                          >
                            {subItem.description}
                          </Radio>
                        </div>
                      ))}
                    </div>
                  ) : (
                    item.id === 5 && <Radio value={item.id}>{item.description}</Radio>
                  )}
                </div>
              ),
          )}
        </Radio.Group>
      </div>
    </div>
  );
};

LiveScoreSettingsInvitees.defaultProps = {
  stateEditMode: '',
  localEditMode: '',
  okClick: false,
  onFormChange: () => {},
  onInviteesChange: () => {},
  onInviteesSearchAction: () => {},
  organisationTypeRefId: {},
  onOpenModel: () => {},
};

export default LiveScoreSettingsInvitees;

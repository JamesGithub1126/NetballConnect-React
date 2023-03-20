import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Checkbox, Input } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AppConstants from 'themes/appConstants';
import { updateMatchOfficialSetting } from 'store/actions/LiveScoreAction/LiveScoreSettingAction';

const { Option } = Select;

const defaultMatchOfficialRecordRoles = [
  { roleId: 25, name: 'Captain', lookupRoleId: 8 },
  { roleId: 17, name: 'Coach', lookupRoleId: 17 },
  { roleId: 3, name: 'Manager', lookupRoleId: 3 },
  { roleId: 26, name: 'Other', lookupRoleId: null, roleName: '' },
];

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const MatchOfficialSettings = () => {
  const dispatch = useDispatch();
  const liveScoreSetting = useSelector(state => state.LiveScoreSetting);
  const { enableMatchOfficialRecording, matchOfficialRecordRoles } = liveScoreSetting;

  const dispatchUpdateSettings = (key, data) => {
    dispatch(updateMatchOfficialSetting({ key, data }));
  };

  const onChangeCheckBox = checked => {
    dispatchUpdateSettings('enableRecording', checked);
  };

  const isSelectedRole = roleId => {
    return !!matchOfficialRecordRoles.find(i => i.roleId === Number(roleId));
  };

  const addNewRole = () => {
    const otherRole = defaultMatchOfficialRecordRoles.find(
      i => !i.lookupRoleId || !isSelectedRole(i.roleId),
    );
    dispatchUpdateSettings('addNewRole', otherRole);
  };

  const onChangeRole = (index, roleId) => {
    const role = defaultMatchOfficialRecordRoles.find(i => i.roleId === roleId);
    dispatchUpdateSettings('changeRole', { index, role });
  };

  const onChangeRoleName = (index, value) => {
    dispatchUpdateSettings('setRoleName', { index, roleName: value });
  };

  const onSelectFromExistingUsers = (index, checked) => {
    dispatchUpdateSettings('selectFromExistingUsers', { index, checked });
  };

  const handleDeleteRole = index => {
    dispatchUpdateSettings('deleteRole', index);
  };

  const isOtherRole = record => {
    // It will be 5 if the checkbox 'select from existing users` is checked.
    return !record.lookupRoleId || record.lookupRoleId === 5;
  }

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(matchOfficialRecordRoles, result.source.index, result.destination.index);
    dispatchUpdateSettings('setRoles', items);
  };

  const dragableRoleView = () => {
    return (
      <div className="position-relative" style={{ paddingBottom: 35 }}>
        <div className="inside-container-view mb-2 mt-4">
          <span>{AppConstants.whichRolesWantToRecord}</span>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {matchOfficialRecordRoles.map((role, index) => (
                    <Draggable key={role.id} draggableId={role.id} index={index}>
                      {(provided) => (
                        <div
                          key={index}
                          className="row mt-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="col-xl-4">
                            <div className="d-flex align-items-center">
                              <MenuOutlined />
                              <Select
                                className="year-select reg-filter-select1 ml-4"
                                style={{ minWidth: 200 }}
                                onChange={value => onChangeRole(index, value)}
                                value={role.roleId}
                              >
                                {defaultMatchOfficialRecordRoles.map((item, index) => (
                                  <Option
                                    key={index}
                                    value={item.roleId}
                                    disabled={
                                      !isOtherRole(item) &&
                                      item.roleId !== role.roleId &&
                                      isSelectedRole(item.roleId)
                                    }
                                  >
                                    {item.name}
                                  </Option>
                                ))}
                              </Select>
                            </div>
                          </div>
                          <div className="col-xl-4">
                            {isOtherRole(role) && (
                              <Input
                                className="product-reg-search-input"
                                placeholder="Role Name"
                                value={role.roleName}
                                onChange={e => onChangeRoleName(index, e.target.value)}
                              />
                            )}
                          </div>
                          <div className="col-xl-3">
                            {isOtherRole(role) && (
                              <Checkbox
                                className="simple-checkbox mt-1"
                                onChange={e => onSelectFromExistingUsers(index, e.target.checked)}
                                checked={role.lookupRoleId === 5}
                              >
                                {AppConstants.selectFromExistingUsers}
                              </Checkbox>
                            )}
                          </div>
                          <div className="col-xl-1">
                            <div
                              className="pt-0 pointer ml-auto"
                              onClick={() => handleDeleteRole(index)}
                            >
                              <span className="user-remove-btn">
                                <i className="fa fa-trash-o" aria-hidden="true" />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div>
            <span onClick={addNewRole} className="input-heading-add-another pointer">
              + {AppConstants.addNewRole}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span className="text-heading-large pt-5">{AppConstants.teamOfficials}</span>
      <Checkbox
        onChange={e => onChangeCheckBox(e.target.checked)}
        checked={enableMatchOfficialRecording}
        className="mx-0 mb-2"
        disabled={false}
      >
        {AppConstants.enableTeamOfficialRecording}
      </Checkbox>
      {enableMatchOfficialRecording && dragableRoleView()}
    </>
  );
};

export default MatchOfficialSettings;

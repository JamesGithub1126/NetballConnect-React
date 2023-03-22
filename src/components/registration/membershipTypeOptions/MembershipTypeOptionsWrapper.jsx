import { RegistrationUserRoles } from 'enums/registrationEnums';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onChangeAgeCheckBoxAction } from 'store/actions/registrationAction/registration';
import AppConstants from 'themes/appConstants';
import ModalSpan from '../replicatePlayer/Span';
import SearchAbleRoleSelect from './SearchAbleRoleSelect';
import './MembershipTypeOptionsStyle.css';
import { useEffect } from 'react';
/**
 *
 * @param {disabledSelect} disabledSelect - Pass in true when disabling the child <Select> component.
 * @returns This component returns a span with the text "Role Type" and a select consisting of the user roles.
 */
const MembershipTypeOptionsWrapper = ({ disabledSelect, index }) => {
  const { getDefaultMembershipProductTypes } = useSelector(state => state.RegistrationState);
  const dispatch = useDispatch();
  const [localIndex, setLocalIndex] = useState(index);
  const handleOnSelectionChange = e => {
    if (e === RegistrationUserRoles.Player) {
      dispatch(onChangeAgeCheckBoxAction(localIndex, true, 'isPlaying', e));
    } else if (e === RegistrationUserRoles.Umpire || e === RegistrationUserRoles.OtherOfficial) {
      dispatch(onChangeAgeCheckBoxAction(localIndex, true, 'isOfficial', e));
    } else {
      dispatch(onChangeAgeCheckBoxAction(localIndex, true, 'isNonPlayingOptions', e));
    }
  };
  useEffect(() => {
    setLocalIndex(index);
  }, [index]);
  return (
    <div className="row">
      <ModalSpan className={'justify-content-center align-items-center mt-3'}>Role Type</ModalSpan>
      <SearchAbleRoleSelect
        styles="mt-4 fix-width-option"
        data={AppConstants.userRoles}
        handleOnChange={handleOnSelectionChange}
        disabled={disabledSelect}
        defaultValue={getDefaultMembershipProductTypes[index].roleId}
        index={index}
      />
    </div>
  );
};

export default MembershipTypeOptionsWrapper;

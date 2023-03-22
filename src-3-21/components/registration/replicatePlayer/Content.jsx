import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AppConstants from 'themes/appConstants';
import { useOrganisation } from 'customHooks/hooks';
import { RegistrationUserRoles } from 'enums/registrationEnums';
import { setYearRefIdCommon } from 'store/actions/appAction';
import {
  getAffiliates,
  getCompetitions,
  getDivisions,
  updateSelection,
} from 'store/actions/replicatePlayerAction';

import SelectAffiliate from './SelectAffiliate';
import SelectCompetition from './SelectCompetition';
import SelectYear from './SelectYear';
import SelectRole from './SelectRole';
import SelectDivision from './SelectDivision';

const Content = () => {
  const dispatch = useDispatch();
  const { organisationUniqueKey } = useOrganisation();
  const { modalYearRefId, yearList } = useSelector(state => state.AppState);
  const { affiliates, competitions, divisions, onLoadComp, onLoadDiv, onLoadOrg } = useSelector(
    state => state.ReplicatePlayerState,
  );
  const {
    competitionUniqueKey,
    organisationUniqueKey: affiliateId,
    roleId,
    divisionId,
  } = useSelector(state => state.ReplicatePlayerState.selections);

  const userRoles = AppConstants.userRoles;

  const isPlayerRole = useMemo(() => roleId === RegistrationUserRoles.Player, [roleId]);

  useEffect(() => {
    dispatch(
      getCompetitions({
        organisationUniqueKey,
        yearRefId: modalYearRefId,
      }),
    );
  }, []);

  const onChangeYearRefId = useCallback(
    yearRefId => {
      dispatch(setYearRefIdCommon(yearRefId));
      dispatch(getCompetitions({ organisationUniqueKey, yearRefId }));
    },
    [dispatch, organisationUniqueKey],
  );

  const onChangeCompetition = useCallback(
    value => {
      if (isPlayerRole && value.length > 1) {
        // You can not select multiple competitions for the player role.
        value = value.slice(1);
      }
      dispatch(updateSelection('competitionUniqueKey', value));

      if (value && value.length > 0) {
        dispatch(getAffiliates({ competitionUniqueKey: value, organisationUniqueKey }));
        isPlayerRole && dispatch(getDivisions(value[0]));
      }
    },
    [dispatch, isPlayerRole],
  );

  const onChangeRole = useCallback(
    value => {
      dispatch(updateSelection('roleId', value));

      const isPlayer = value === RegistrationUserRoles.Player;
      if (isPlayer) {
        // Reset selected competitions.
        onChangeCompetition([]);
      }
    },
    [dispatch, competitionUniqueKey, onChangeCompetition],
  );

  const onChangeAffiliate = useCallback(
    value => {
      dispatch(updateSelection('organisationUniqueKey', value));
    },
    [dispatch],
  );

  const onChangeDivision = useCallback(
    value => {
      dispatch(updateSelection('divisionId', value));
    },
    [dispatch],
  );

  return (
    <div className="d-flex flex-column">
      <SelectYear
        yearList={yearList}
        value={modalYearRefId}
        onChange={onChangeYearRefId}
        className={'w-100'}
      />
      <SelectRole
        userRoles={userRoles}
        value={roleId}
        onChange={onChangeRole}
        placeholder={AppConstants.pleaseSelectRole}
        className={'w-100'}
      />
      <SelectCompetition
        competitions={competitions}
        loading={onLoadComp}
        value={competitionUniqueKey}
        onChange={onChangeCompetition}
        placeholder={AppConstants.pleaseSelectCompetition}
        mode="multiple"
        className={'w-100'}
      />
      <SelectAffiliate
        affiliates={affiliates}
        loading={onLoadOrg}
        value={affiliateId}
        onChange={onChangeAffiliate}
        className={'w-100'}
      />
      <SelectDivision
        divisions={divisions}
        loading={onLoadDiv}
        value={divisionId}
        onChange={onChangeDivision}
        hidden={!isPlayerRole}
        className={'w-100'}
      />
    </div>
  );
};

export default Content;

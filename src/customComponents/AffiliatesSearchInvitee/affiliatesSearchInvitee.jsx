import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import {
  add_editcompetitionFeeDeatils,
  onInviteesSearchAction,
} from '../../store/actions/registrationAction/competitionFeeAction';
import { isArrayNotEmpty } from '../../util/helpers';
import AppConstants from '../../themes/appConstants';

const { Option } = Select;

////////reg invitees search view for any organisation
const AffiliatesSearchInvitee = ({ data, regInviteesDisable }) => {
  const dispatch = useDispatch();
  const competitionFeesState = useSelector(state => state.CompetitionFeesState);
  if (!competitionFeesState) {
    return null;
  }
  const {
    associationLeague,
    clubSchool,
    associationChecked,
    clubChecked,
    associationAffilites,
    clubAffilites,
    searchLoad,
  } = competitionFeesState;

  if (data?.id == 7 && associationChecked) {
    return (
      <div>
        <Select
          mode="multiple"
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          onChange={associationAffilite => {
            dispatch(add_editcompetitionFeeDeatils(associationAffilite, 'associationAffilite'));
          }}
          value={associationLeague}
          placeholder={AppConstants.selectOrganisation}
          filterOption={false}
          onSearch={value => {
            dispatch(onInviteesSearchAction(value, 3));
          }}
          disabled={regInviteesDisable}
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
          {associationAffilites.map(item => (
            <Option key={'organisation_' + item.organisationId} value={item.organisationId}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    );
  } else if (data?.id == 8 && clubChecked) {
    return (
      <div>
        <Select
          mode="multiple"
          className="w-100"
          style={{ paddingRight: 1, minWidth: 182 }}
          onChange={clubAffilite => {
            // this.onSelectValues(venueSelection, detailsData)
            dispatch(add_editcompetitionFeeDeatils(clubAffilite, 'clubAffilite'));
          }}
          value={clubSchool}
          placeholder={AppConstants.selectOrganisation}
          filterOption={false}
          onSearch={value => {
            dispatch(onInviteesSearchAction(value, 4));
          }}
          disabled={regInviteesDisable}
          onBlur={() =>
            isArrayNotEmpty(clubAffilites) == false ? dispatch(onInviteesSearchAction('', 4)) : null
          }
          onFocus={() =>
            isArrayNotEmpty(clubAffilites) == false ? dispatch(onInviteesSearchAction('', 4)) : null
          }
          loading={searchLoad}
        >
          {clubAffilites.map(item => (
            <Option key={'organisation_' + item.organisationId} value={item.organisationId}>
              {item.name}
            </Option>
          ))}
        </Select>
      </div>
    );
  } else {
    return null;
  }
};

export default AffiliatesSearchInvitee;

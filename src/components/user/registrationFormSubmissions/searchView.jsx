import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker, Button } from 'antd';
import AppConstants from '../../../themes/appConstants';
import InputWithHead from '../../../customComponents/InputWithHead';
import moment from 'moment';
import {
  updateSubmissionsSearchAction,
  getRegistrationFormSubmissionsAction,
} from '../../../store/actions/userAction/userAction';

const SearchView = () => {
  const dispatch = useDispatch();
  const userState = useSelector(state => state.UserState);
  const searchValues = userState.formSubmissionSearch;

  useEffect(() => {
    if (!searchValues.startDate) {
      updateSearch('startDate', moment().add(-3, 'month'));
    }
    if (!searchValues.endDate) {
      updateSearch('endDate', moment())
    }
  }, [searchValues])

  const handleSubmit = () => {
    dispatch(getRegistrationFormSubmissionsAction({
      ...searchValues,
      offset: 0,
      limit: userState.formSubmissionsPageSize,
    }));
  }

  const updateSearch = (key, value) => {
    dispatch(updateSubmissionsSearchAction(key, value));
  }

  return (
    <div className="row ml-5 mb-3 mt-3 d-flex align-items-center justify-content-end">
      <div className="col-sm">
        <InputWithHead heading={AppConstants.fromDate} />
        <DatePicker
          style={{ width: '100%', minWidth: 180, paddingLeft: 5 }}
          format="DD-MM-YYYY"
          onChange={value => updateSearch('startDate', value)}
          value={searchValues.startDate}
        />
      </div>
      <div className="col-sm">
        <InputWithHead heading={AppConstants.toDate} />
        <DatePicker
          style={{ width: '100%', minWidth: 180, paddingLeft: 5 }}
          format="DD-MM-YYYY"
          onChange={value => updateSearch('endDate', value)}
          value={searchValues.endDate}
        />
      </div>
      <div className="col-sm">
        <InputWithHead
          heading={AppConstants.regKey}
          onChange={event => updateSearch('registrationUniqueKey', event.target.value)}
          name="registrationUniqueKey"
          placeholder=""
          value={searchValues.registrationUniqueKey}
        />
      </div>
      <div className="col-sm">
        <InputWithHead
          heading={AppConstants.searchText}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          onChange={event => updateSearch('searchText', event.target.value)}
          name="searchText"
          placeholder=""
          value={searchValues.searchText}
        />
      </div>
      <div className="col-sm" style={{alignSelf: 'self-end'}}>
        <Button className="primary-add-comp-form" type="primary" onClick={handleSubmit}>
          {AppConstants.go}
        </Button>
      </div>
    </div>
  );
};

export default SearchView;

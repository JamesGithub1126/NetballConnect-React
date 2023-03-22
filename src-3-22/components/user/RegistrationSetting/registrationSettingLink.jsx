import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import AppConstants from 'themes/appConstants';
import InputWithHead from '../../../customComponents/InputWithHead';
import { updateRegSettingLinks } from 'store/actions/userAction/userAction';

const { Option } = Select;

const RegistrationSettingLink = ({ registrationSettingRefId }) => {
  const dispatch = useDispatch();
  const { favouriteTeamList } = useSelector(state => state.CommonReducerState);
  const { impersonationList, onLoadAffiliates, regSettingLinks } = useSelector(
    state => state.UserState,
  );
  const [searchText, setSearchText] = useState('');

  const filteredRegSettingLinks = useMemo(() => {
    return regSettingLinks.filter(x => x.registrationSettingRefId === registrationSettingRefId);
  }, [regSettingLinks, registrationSettingRefId]);

  const filteredOrganisations = useMemo(() => {
    if (searchText && searchText.length > 0) {
      return impersonationList.filter(i => i.name.toLowerCase().indexOf(searchText) >= 0);
    }
    return impersonationList;
  }, [impersonationList, searchText]);

  const isUsedAnswer = useCallback(
    answerId => {
      return !!filteredRegSettingLinks.find(x => x.answerId === answerId);
    },
    [filteredRegSettingLinks],
  );

  const findRegSettingLinkIndex = useCallback(
    link => {
      return regSettingLinks.findIndex(
        x => (!!x.id && x.id === link.id) || (!!x.no && x.no === link.no),
      );
    },
    [regSettingLinks],
  );

  const handleAnswerChange = (record, value) => {
    const index = findRegSettingLinkIndex(record);
    dispatch(updateRegSettingLinks('answerId', index, value));
  };

  const handleOrganisationChange = (record, value) => {
    const index = findRegSettingLinkIndex(record);
    dispatch(updateRegSettingLinks('organisationId', index, value));
    setSearchText('');
  };

  const addNewLink = () => {
    const value = {
      registrationSettingRefId,
    };
    dispatch(updateRegSettingLinks('add', -1, value));
  };

  const removeLink = org => {
    const index = findRegSettingLinkIndex(org);
    dispatch(updateRegSettingLinks('remove', index));
  };

  const getOrganisationList = regSettingLink => {
    return regSettingLink.linkedOrganisations.map(x => x.organisationId);
  };

  return (
    <>
      <span className="form-heading">{AppConstants.linkRegistrationQuestionsToShop}</span>
      <div className="linkshop-subtitle mt-4">{AppConstants.teamYouFollow}</div>
      {filteredRegSettingLinks.map((record, index) => (
        <div key={index}>
          <div className="row">
            <div className="col-sm-12 col-md-5">
              <InputWithHead heading={AppConstants.selectedAnswer} />
              <Select
                className="w-100"
                value={record.answerId}
                onChange={value => handleAnswerChange(record, value)}
                placeholder={AppConstants.selectAnswer}
              >
                {favouriteTeamList.map(item => (
                  <Option
                    key={item.id}
                    value={item.id}
                    disabled={record.answerId !== item.id && isUsedAnswer(item.id)}
                  >
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="col-sm-12 col-md-5">
              <InputWithHead heading={AppConstants.linkedToShopItemsFromThisOrg} />
              <Select
                mode="multiple"
                className="w-100"
                showSearch
                loading={onLoadAffiliates}
                value={impersonationList.length ? getOrganisationList(record) : ''}
                onChange={value => handleOrganisationChange(record, value)}
                onSearch={value => setSearchText(value.toLowerCase())}
                filterOption={false}
                placeholder={AppConstants.selectOrganisation}
              >
                {filteredOrganisations.map(item => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="col-sm-12 col-md-2">
              <a className="transfer-image-view linkshop-remove" onClick={() => removeLink(record)}>
                <span className="user-remove-btn">
                  <i className="fa fa-trash-o" aria-hidden="true" />
                </span>
                <span className="user-remove-text mr-0">{AppConstants.remove}</span>
              </a>
            </div>
          </div>
        </div>
      ))}
      <div className="checkbox-row-wise mt-4 pointer" onClick={addNewLink}>
        <span className="user-remove-text">+ {AppConstants.addAnother}</span>
      </div>
    </>
  );
};

export default RegistrationSettingLink;

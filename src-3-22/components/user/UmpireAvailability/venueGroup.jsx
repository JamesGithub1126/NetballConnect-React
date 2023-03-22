import AppConstants from "../../../themes/appConstants";
import { Button, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";
import { nearByVenues } from "../../../util/geocode";
import { uniq } from "lodash";
import ValidationConstants from "../../../themes/validationConstant";

const { Option } = Select;

export const VenueGroup = ({ venueGroup, onChange = {} }) => {
  const [venuePostCode, setVenuePostCode] = useState('');
  const [searchVenue, setSearchVenue] = useState(null);
  const { venueList } = useSelector(state => state.AppState);
  const [availableVenues, setAvailableVenues] = useState(venueList);

  useEffect(() => {
    setAvailableVenues(venueList);
  }, [venueList]);

  function setVenueGroupName(name) {
    onChange({
      ...venueGroup,
      name,
    });
  }

  function setSelectedVenues(selectedVenues) {
    onChange({
      ...venueGroup,
      userVenues: selectedVenues,
    });
  }

  const onSelectVenues = value => {
    setSearchVenue(null);
    setSelectedVenues(uniq(venueGroup.userVenues.concat(value)));
  };

  const searchVenueByPostalCode = () => {
    try {
      let postcode = venuePostCode;
      if (postcode) {
        const foundValue = nearByVenues(venueList, postcode, 20);
        setAvailableVenues(foundValue);
      } else {
        setAvailableVenues(venueList);
      }
    } catch (ex) {
      console.log('Error in searchVenueByPostalCode' + ex);
    }
  };

  const onRemoveVenueGroup = () => {
    onChange(null);
  }

  const onPostCodeChange = e => setVenuePostCode(e.target.value);

  return (
    <div className="umpire-availability-working-hours-view mt-2">
      <div
        style={{
          marginRight: 15,
          marginBottom: 15,
        }}
      >
        <div className="other-info-row">
          <div className="year-select-heading other-info-label">{AppConstants.venueGroup}</div>
        </div>
        <div className="other-info-row justify-content-between" style={{ paddingTop: 10 }}>
          <Input
            className="product-reg-search-input"
            style={{width: '300px'}}
            value={venueGroup.name}
            onChange={(e) => setVenueGroupName(e.target.value)}
            allowClear
          />
          <DeleteOutlined style={{ color: 'red', fontSize: '24px', cursor: 'pointer' }} onClick={onRemoveVenueGroup}/>
        </div>
        {!venueGroup.name && <div className="other-info-row"><span className="form-err">{ValidationConstants.field}</span></div>}
        <div>
          <div className="other-info-row" style={{paddingTop: 10}}>
            <Select mode="multiple" className="w-100" value={venueGroup.userVenues} onChange={values => setSelectedVenues(values)}>
              {venueList.map(item => (
                <Option key={'venue_' + item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="other-info-row" style={{paddingTop: 10, marginTop: 20}}>
            <div className="home-dash-table-view" style={{width: '70%'}}>
              <div
                style={{
                  marginTop: 7,
                  marginRight: 15,
                  marginBottom: 15,
                }}
              >
                <div className="other-info-row mt-4" style={{paddingTop: 10}}>
                  <div className="other-info-label">{AppConstants.searchForVenues}</div>
                </div>
                <div className="other-info-row mt-4" style={{paddingTop: 10}}>
                  <div className="year-select-heading other-info-label">
                    {AppConstants.postCode}
                  </div>
                </div>
                <div className="other-info-row" style={{paddingTop: 10}}>
                  <Input
                    className="product-reg-search-input"
                    style={{width: '200px', marginRight: '10px'}}
                    placeholder={AppConstants.postCode}
                    onPressEnter={searchVenueByPostalCode}
                    onChange={onPostCodeChange}
                    allowClear
                  />
                  <Button type="primary" onClick={() => searchVenueByPostalCode()}>
                    {AppConstants.search}
                  </Button>
                </div>
                <div className="other-info-row" style={{paddingTop: 10}}>
                  <div className="year-select-heading other-info-label">
                    {AppConstants.selectVenuesToAdd}
                  </div>
                </div>
                <div
                  className="other-info-row"
                  style={{paddingTop: 10, width: '80%', marginBottom: '70px'}}
                >
                  <Select
                    className="w-100"
                    placeholder={AppConstants.selectVenue}
                    onChange={value => {
                      onSelectVenues(value);
                    }}
                    value={searchVenue}
                  >
                    {availableVenues.map(item => (
                      <Option key={'venue_' + item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import useOnclickOutside from 'react-cool-onclickoutside';
import { Input } from 'antd';

import './style.css';
import AppConstants from '../../../../themes/appConstants';

const mapAddressInfo = addressComponents => {
  if (addressComponents.length > 4) {
    let streetNumber;
    let address;
    let suburb;
    for (let i = 0; i < addressComponents.length; i++) {
      if (addressComponents[i].types.includes('street_number')) {
        streetNumber = addressComponents[i].short_name;
      }
      if (addressComponents[i].types.includes('route')) {
        address = addressComponents[i].short_name;
      }
      if (addressComponents[i].types.includes('locality')) {
        suburb = addressComponents[i].short_name;
      }
    }
    return {
      addressOne: streetNumber ? streetNumber + ' ' + address : address,
      suburb: suburb,
      state: addressComponents[addressComponents.length - 3].short_name,
      postcode: addressComponents[addressComponents.length - 1].short_name,
    };
  }
  return null;
};

const PlacesAutocomplete = ({ defaultValue, heading, error, required, onSetData, otherProps, disabled }) => {
  const [defaultAddress, setDefaultAddress] = useState(defaultValue);
  useEffect(() => {
    setDefaultAddress(defaultValue);
  }, [defaultValue]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: ['au'] },
    },
    debounce: 300,
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  const handleInput = e => {
    setValue(e.target.value);
    setDefaultAddress(null);
  };

  const handleSelect = ({ description }) => () => {
    setValue(description, false);
    clearSuggestions();
    let mapData = null;

    // Get latitude and longitude via utility functions
    getGeocode({ address: description })
      .then(results => {
        mapData = mapAddressInfo(results[0].address_components);
        return getLatLng(results[0]);
      })
      .then(({ lat, lng }) => {
        const result = mapData
          ? {
              ...mapData,
              lat,
              lng,
            }
          : null;

        onSetData(result);
      })
      .catch(error => {
        console.log('Error: ', error);
      });
  };

  const renderSuggestions = () =>
    data.map(suggestion => {
      const {
        place_id,
        structured_formatting: { main_text: mainText, secondary_text: secondaryText },
      } = suggestion;

      return (
        <li key={place_id} onClick={handleSelect(suggestion)}>
          <strong>{mainText}</strong> <small>{secondaryText}</small>
        </li>
      );
    });

  return (
    <div className="place-auto-complete-container" ref={ref}>
      {heading && (
        <div className="d-flex align-items-center">
          <span className={`input-heading ${required ? 'required-field' : ''}`}>{heading}</span>
        </div>
      )}
      <Input
        className={error ? 'input-error' : 'input'}
        value={value || defaultAddress}
        onChange={handleInput}
        disabled={disabled || !ready}
        placeholder={AppConstants.pleaseInputAddress}
        autoComplete="new-password"
        {...otherProps}
      />
      {status !== 'OK' && error && (
        <div className="d-flex align-items-center">
          <span className="place-auto-complete-input-error-message">{error}</span>
        </div>
      )}
      {/* We can use the "status" to decide whether we should display the dropdown or not */}
      {status === 'OK' && (
        <ul className="place-location">
          {renderSuggestions()}
          <li className="logo" key="google">
            <img
              src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png"
              alt="Powered by Google"
            />
          </li>
        </ul>
      )}
    </div>
  );
};

PlacesAutocomplete.propTypes = {
  heading: PropTypes.string,
  defaultValue: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  onSetData: PropTypes.func,
};

PlacesAutocomplete.defaultProps = {
  heading: '',
  defaultValue: null,
  required: false,
  error: '',
  onSetData: () => {},
};

export default PlacesAutocomplete;

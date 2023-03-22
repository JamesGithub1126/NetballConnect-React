import React from 'react';
import { isArrayNotEmpty } from 'util/helpers';

export const IncidentPlayerFirstName = ({ incident, onClick }) => {
  const { incidentPlayers, foulUser, foulUserFullName } = incident;

  const contentView = () => {
    if (isArrayNotEmpty(incidentPlayers)) {
      return incidentPlayers.map((item, index) => (
        <span
          onClick={() => onClick && onClick(item.player?.userId)}
          key={`playerFirstName${index}${item.playerId}`}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {item.player?.firstName}
        </span>
      ));
    }
    if (foulUser) {
      return (
        <span
          onClick={() => onClick && onClick(foulUser.id)}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {foulUser.firstName}
        </span>
      );
    }
    if (foulUserFullName) {
      const firstName = foulUserFullName.split(' ')[0] ?? '';
      return <span className="desc-text-style side-bar-profile-data">{firstName}</span>;
    }
    return <></>;
  };

  return contentView();
};

export const IncidentPlayerLastName = ({ incident, onClick }) => {
  const { incidentPlayers, foulUser, foulUserFullName } = incident;

  const contentView = () => {
    if (isArrayNotEmpty(incidentPlayers)) {
      return incidentPlayers.map((item, index) => (
        <span
          onClick={() => onClick && onClick(item.player?.userId)}
          key={`playerLastName${index}${item.playerId}`}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {item.player?.lastName}
        </span>
      ));
    }
    if (foulUser) {
      return (
        <span
          onClick={() => onClick && onClick(foulUser.id)}
          className="desc-text-style side-bar-profile-data theme-color pointer"
        >
          {foulUser.lastName}
        </span>
      );
    }
    if (foulUserFullName) {
      const lastName = foulUserFullName.split(' ')[1] ?? '';
      return <span className="desc-text-style side-bar-profile-data">{lastName}</span>;
    }
    return <></>;
  };

  return contentView();
};

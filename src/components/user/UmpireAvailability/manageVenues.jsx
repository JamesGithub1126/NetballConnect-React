import React, { useEffect, useMemo, useState } from 'react';
import AppConstants from 'themes/appConstants';
import { useDispatch, useSelector } from "react-redux";
import { getUserVenueGroups } from "../../../store/actions/userAction/userAction";
import { Button, Form, message, Spin } from "antd";
import { VenueGroup } from "./venueGroup";
import UserAxiosApi from "../../../store/http/userHttp/userAxiosApi";

const ManageVenues = ({ userId, onBack }) => {
  const dispatch = useDispatch();

  const { loading, items } = useSelector(store => store.UserState.userVenueGroups);
  const [saving, setSaving] = useState(false);
  const [userVenueGroups, setUserVenueGroups] = useState(items);
  const [deletedVenueGroups, setDeletedVenueGroups] = useState([]);

  useEffect(() => {
    setUserVenueGroups(items);
  }, [items]);

  const isValid = useMemo(() => {
    return userVenueGroups.length && userVenueGroups.every(item => !!item.name);
  }, [userVenueGroups]);

  function onVenueChange(index, updatedVenueGroup) {
    if (updatedVenueGroup === null) {
      const deletedVenueGroup = userVenueGroups[index];
      if (deletedVenueGroup.id) {
        setDeletedVenueGroups(deletedVenueGroups.concat(deletedVenueGroup));
      }
      setUserVenueGroups(userVenueGroups.filter(((userVenueGroup, currentIndex) => currentIndex !== index)));
    } else {
      setUserVenueGroups(userVenueGroups.map(((userVenueGroup, currentIndex) => {
        if (currentIndex === index) {
          return {
            ...updatedVenueGroup,
            changed: true,
          };
        }
        return userVenueGroup;
      })));
    }
  }

  function onAddNewVenueGroup() {
    setUserVenueGroups(userVenueGroups.concat({
      name: '',
      userVenues: [],
    }));
  }

  async function onSave() {
    try {
      const changedVenueGroups = userVenueGroups.filter(userVenueGroup => userVenueGroup.changed);
      await Promise.all(changedVenueGroups.map(changedVenueGroup => UserAxiosApi.saveUserVenueGroup({
        ...changedVenueGroup,
        userId,
        userVenues: changedVenueGroup.userVenues.map((venueId) => ({
          venueId: parseInt(venueId, 10),
        })),
      })));
      await Promise.all(deletedVenueGroups.map(deletedVenueGroup => UserAxiosApi.deleteUserVenueGroup(deletedVenueGroup.id)));
      dispatch(getUserVenueGroups(userId));
      message.success(AppConstants.saveUserVenueGroupSuccess);
    } catch(err) {
      message.error('Something went wrong.')
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Spin size="small" />
  }

  return (
    <>
      {userVenueGroups.map((userVenueGroup, index) => <VenueGroup venueGroup={userVenueGroup} key={index} onChange={updatedVenue => onVenueChange(index, updatedVenue)} />)}
      <span
        className="input-heading-add-another"
        style={{ paddingTop: 'unset', marginBottom: '15px', marginTop: '15px' }}
        onClick={onAddNewVenueGroup}
      >
        {`+ ${AppConstants.addVenueGroup}`}
      </span>
      <div className="comp-buttons-view">
        <Button className="mr-2" type="cancel-button" onClick={() => onBack(false) }>
          {AppConstants.back}
        </Button>
        <Button type="primary" htmlType="submit" disabled={saving || !isValid} onClick={onSave}>
          {AppConstants.save}
        </Button>
      </div>
    </>
  );
};

export default ManageVenues;

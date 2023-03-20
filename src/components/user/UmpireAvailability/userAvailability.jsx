import AppConstants from "../../../themes/appConstants";
import { Button, Checkbox, Select, Spin } from "antd";
import Tooltip from "react-png-tooltip";
import WorkingHours from "./workingHours";
import React, { useEffect, useMemo, useState } from "react";
import ManageVenues from "./manageVenues";
import { getUserVenueGroups, userProfileUpdateAction } from "../../../store/actions/userAction/userAction";
import { useDispatch, useSelector } from "react-redux";
import UserAxiosApi from "../../../store/http/userHttp/userAxiosApi";
import moment from "moment";

const { Option } = Select;

export const UserAvailability = ({ userId }) => {
  const [allVenues, setAllVenues] = useState(true);
  const [showManageVenuesView, setShowManageVenuesView] = useState(false);
  const [selectedVenueGroupId, setSelectedVenueGroupId] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [allAvailability, setAllAvailability] = useState([]);

  const { items: userVenueGroups, loading: venueGroupLoading } = useSelector(store => store.UserState.userVenueGroups);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserVenueGroups(userId));
  }, [userId]);

  useEffect(() => {
    (async () => {
        setAvailabilityLoading(true);
        const result = await UserAxiosApi.getUserAvailability(userId);
        const availability = result.result.data;

        const newUserVenueGroupId = availability?.[0]?.userVenueGroupId ?? null;
        setAllVenues(!newUserVenueGroupId);
        setSelectedVenueGroupId(newUserVenueGroupId);
        setAllAvailability(availability);
        setAvailabilityLoading(false);
    })();
  }, [])

  const onChangeAllVenues = (allSelected) => {
    setAllVenues(allSelected);
    const newUserVenueGroupId = allSelected ? null : (allAvailability?.[0]?.userVenueGroupId ?? null);
    setSelectedVenueGroupId(newUserVenueGroupId);
  };

  const currentAvailability = useMemo(() => allAvailability.filter(availability => availability.userVenueGroupId === selectedVenueGroupId), [allAvailability, selectedVenueGroupId]);

  const workingHourView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="user-module-row-heading live-score-side-desc-view">
          {AppConstants.availability}
        </div>
        <div className="row" style={{marginTop: 20}}>
          <div className="col-sm d-flex flex-row align-items-center">
            <div className="user-module-row-heading">{AppConstants.applyToVenue}</div>
            <div className="mt-n10">
              <Tooltip placement="top">
                <span>{AppConstants.participateCompMsg}</span>
              </Tooltip>
            </div>
          </div>
        </div>
        <Checkbox
          className="single-checkbox-radio-style"
          checked={allVenues}
          onChange={e => onChangeAllVenues(e.target.checked)}
        >
          {AppConstants.allVenues}
        </Checkbox>
        {!allVenues && (
          <div style={{ minWidth: '180px' }}>
            <div className="year-select-heading other-info-label" style={{marginBottom: 10}}>
              {AppConstants.venueGroup}
            </div>
            <div className="row">
              <div className="col-sm-4 d-flex flex-row align-items-center">
                <Select
                  className="user-prof-filter-select"
                  name="venueGroupRefId"
                  value={selectedVenueGroupId}
                  onChange={(value) => setSelectedVenueGroupId(value)}
                >
                  {userVenueGroups.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                </Select>
              </div>
              <div className="col-sm d-flex flex-row align-items-center">
                <Button
                  className="schedule-approval-button"
                  type="primary"
                  htmlType="submit"
                  onClick={() => setShowManageVenuesView(true)}
                >
                  {AppConstants.manageVenuesGroups}
                </Button>
              </div>
            </div>
          </div>
        )}
        <WorkingHours userId={userId} availability={currentAvailability} userVenueGroupId={selectedVenueGroupId} />
      </div>
    );
  }
  const loading = availabilityLoading || venueGroupLoading;
  const manageVenuesView = () => {
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="user-module-row-heading live-score-side-desc-view">
          {AppConstants.availabilityManageVenues}
        </div>
        <div className="user-module-row-heading">{AppConstants.createVenueGroups}</div>
        {loading && <Spin />}
        {!loading && <ManageVenues userId={userId} onBack={() => setShowManageVenuesView(false)} />}
      </div>
    );
  };
  return showManageVenuesView ? manageVenuesView() : workingHourView();
}

import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import AppConstants from '../../../themes/appConstants';

const TOP_5 = 5;

const OrganisationGrowthList = ({ organisationsList, toggleType, handleExportOrganisationList }) => {
  const dispatch = useDispatch();

  const growthData = useCallback(() => {
    const sortedList = organisationsList.sort((a, b) => {
      return b[toggleType] - a[toggleType];
    });

    return sortedList.slice(0, TOP_5);
  }, [organisationsList, toggleType]);

  const organisationsGrowth = useMemo(() => {
    return growthData().map(org => {
      let trend = <CaretUpOutlined style={{ color: '#50c315', fontSize: 18 }} />;

      if (org[toggleType] <= 0) {
        trend = <CaretDownOutlined style={{ color: '#c31515', fontSize: 18 }} />;
      }

      return (
        <div className="row" key={`organisationGrowthItem_${org.organisationId}`}>
          <div className="col-sm-6">
            <div className="org-name">{org.organisationName}</div>
          </div>
          <div className="col-sm-6">
            <div className="org-growth-value">
              {org[toggleType]}%<span className="trend">{trend}</span>
            </div>
          </div>
        </div>
      );
    });
  }, [organisationsList, toggleType, growthData]);

  const handleDownloadOrgChanges = useCallback(() => {
    const organisationsList = growthData();

    return handleExportOrganisationList(organisationsList)
  }, [dispatch, handleExportOrganisationList]);

  return (
    <>
      <div className="row mt-10">
        <div className="col-sm-6">
          <div className="org-name org-name-head">{AppConstants.name}</div>
        </div>
        <div className="col-sm-6">
          <div className="org-growth-value org-growth-head">{AppConstants.growth}</div>
        </div>
      </div>
      {organisationsGrowth}
      <div className="row mt-10">
        <div className="col-sm-12">
          <div className="org-growth-value org-growth-head">
            <a onClick={handleDownloadOrgChanges}>Download All</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganisationGrowthList;

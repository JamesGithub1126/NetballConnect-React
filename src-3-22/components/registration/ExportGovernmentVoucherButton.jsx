import React from 'react';
import './product.scss';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { Button, Popover } from 'antd';
import { useDispatch } from 'react-redux';
import { getOrganisationData } from 'util/sessionStorage';
import { exportGovernmentVoucherAction } from 'store/actions/registrationAction/exportGovernmentVoucherAction';
const ExportGovernmentVoucherButton = ({ yearRefId }) => {
  const dispatch = useDispatch();

  const handleOnExportClicked = e => {
    e.preventDefault();
    dispatch(
      exportGovernmentVoucherAction({
        yearRefId,
        organisationUniqueKey: getOrganisationData().organisationUniqueKey,
      }),
    );
  };
  return (
    <Popover content={AppConstants.exportGovernmentVoucherButtonPopOverText}>
      <Button className="primary-add-comp-form m-3" type="primary" onClick={handleOnExportClicked}>
        <div className="row">
          <div className="col-sm">
            <img src={AppImages.export} className="export-image" alt="" />
            {AppConstants.exportGovernmentVoucherButtonText}
          </div>
        </div>
      </Button>
    </Popover>
  );
};

export default ExportGovernmentVoucherButton;

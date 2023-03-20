import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  Table,
  Tree,
  Radio,
  Tabs,
  Form,
  Modal,
  message,
  Tooltip,
  Switch,
  InputNumber,
  Popover,
} from 'antd';

import CustomToolTip from 'react-png-tooltip';
import AppUniqueId from 'themes/appUniqueId';
import AppConstants from '../../../themes/appConstants';
import {
  RegistrationInviteesName,
  RegistrationInvitees,
  TeamFeeType,
  TeamRegistrationChargeType,
  AllowTeamRegistrationType,
  IndividualChargeType,
} from '../../../enums/registrationEnums';
import { isArrayNotEmpty } from '../../../util/helpers';
import ValidationConstants from 'themes/validationConstant';
import { getMembershipTooltipRows } from 'util/registrationHelper';

let this_Obj = null;

export const getNotNegativeVal = e =>
  e.target.value.startsWith('-') ? -e.target.value : e.target.value;

const memSeasonalFeeColumn = {
  title: AppConstants.membershipFeesGST,
  dataIndex: 'membershipSeasonal',
  key: 'membershipSeasonal',
  width: 84,
  render: (membershipSeasonal, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mSeasonalFee');
    return (
      <Popover
        content={rows.map(x => (
          <div key={x.name} className="row nowrap min150">
            <div className="col-md-7">{x.name}</div>
            <div className="col-md-5">{x.fee}</div>
          </div>
        ))}
      >
        <div>
          <Input
            prefix="$"
            className="input-inside-table-fees"
            disabled
            value={membershipSeasonal}
          />
        </div>
      </Popover>
    );
  },
};
const memSeasonalGstColumn = {
  title: AppConstants.gst,
  dataIndex: 'membershipGst',
  key: 'membershipGst',
  width: 84,
  render: (membershipGst, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mSeasonalGst');
    return (
      <Popover
        content={rows.map(x => (
          <div className="row nowrap min150">
            <div className="col-md-7">{x.name}</div>
            <div className="col-md-5">{x.fee}</div>
          </div>
        ))}
      >
        <div>
          <Input prefix="$" className="input-inside-table-fees" disabled value={membershipGst} />
        </div>
      </Popover>
    );
  },
};
const memCasualFeeColumn = {
  title: AppConstants.membershipFeesGST,
  dataIndex: 'membershipCasual',
  key: 'membershipCasual',
  width: 84,
  render: (membershipCasual, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mCasualFee');
    if (record.isPlayer == 1) {
      return (
        <Popover
          content={rows.map(x => (
            <div className="row nowrap min150">
              <div className="col-md-7">{x.name}</div>
              <div className="col-md-5">{x.fee}</div>
            </div>
          ))}
        >
          <div>
            <Input
              prefix="$"
              className="input-inside-table-fees"
              disabled
              value={membershipCasual}
            />
          </div>
        </Popover>
      );
    } else {
      return <Input disabled className="input-inside-table-fees" value="N/A" />;
    }
  },
};
const memCasualFeeTeamColumn = {
  title: AppConstants.membershipFeesGST,
  dataIndex: 'membershipCasual',
  key: 'membershipCasual',
  width: 84,
  render: (membershipCasual, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mCasualFee');
    return (
      <Popover
        content={rows.map(x => (
          <div className="row nowrap min150">
            <div className="col-md-7">{x.name}</div>
            <div className="col-md-5">{x.fee}</div>
          </div>
        ))}
      >
        <div>
          <Input prefix="$" className="input-inside-table-fees" disabled value={membershipCasual} />
        </div>
      </Popover>
    );
  },
};
const memCasualGstColumn = {
  title: AppConstants.gst,
  dataIndex: 'membershipGst',
  key: 'membershipGst',
  width: 84,
  render: (membershipGst, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mCasualGst');
    if (record.isPlayer == 1) {
      return (
        <Popover
          content={rows.map(x => (
            <div className="row nowrap min150">
              <div className="col-md-7">{x.name}</div>
              <div className="col-md-5">{x.fee}</div>
            </div>
          ))}
        >
          <div>
            <Input prefix="$" className="input-inside-table-fees" disabled value={membershipGst} />
          </div>
        </Popover>
      );
    } else {
      return <Input disabled className="input-inside-table-fees" value="N/A" />;
    }
  },
};
const memCasualGstTeamColumn = {
  title: AppConstants.gst,
  dataIndex: 'membershipCasualGst',
  key: 'membershipCasualGst',
  width: 84,
  render: (membershipCasualGst, record) => {
    let rows = getMembershipTooltipRows(this_Obj, record, 'mCasualGst');

    return (
      <Popover
        content={rows.map(x => (
          <div className="row nowrap min150">
            <div className="col-md-7">{x.name}</div>
            <div className="col-md-5">{x.fee}</div>
          </div>
        ))}
      >
        <div>
          <Input
            prefix="$"
            className="input-inside-table-fees"
            disabled
            value={membershipCasualGst}
          />
        </div>
      </Popover>
    );
  },
};
const playerSeasonalTable = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          data-testid={AppUniqueId.INDIVIDUAL_SEASONAL_NOMINATION_FEES_GST}
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonal',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          min={0}
          className="input-inside-table-fees"
          value={gst}
          data-testid={AppUniqueId.INDIVIDUAL_NOMINATION_GST}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'seasonal')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) => (
      <Input
        prefix="$"
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        // min={0}
        className="input-inside-table-fees"
        data-testid={AppUniqueId.INDIVIDUAL_SEASONAL_COMPETITION_FEES_GST}
        value={fee}
        onChange={e =>
          this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) => (
      <Input
        prefix="$"
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        // min={0}
        className="input-inside-table-fees"
        value={gst}
        onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'seasonal')}
        data-test={"individualCompetitionGST"}
      />
    ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        prefix="$"
        className="input-inside-table-fees"
        value={total}
        data-testid={AppUniqueId.INDIVIDUAL_SEASONAL_TOTAL_FEE}
        disabled
      />
    ),
  },
];

const playerCasualTable = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeColumn,
  memCasualGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'casual',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          data-testid={AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_COMPETITION_FEES_GST}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'casual')}
          data-testid={AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_COMPETITION_FEES_GST_}

        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: (total, record) =>
      record.isPlayer == 1 ? (
        <Input
          style={{ width: 95 }}
          prefix="$"
          className="input-inside-table-fees"
          value={total}
          disabled
          data-testid={AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_COMPETITION_FEES_GST_TOTAL}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" style={{ width: 95 }} value="N/A" />
      ),
  },
];

const playerSeasonalTableAssociation = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e => {
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonal',
            );
          }}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'seasonal')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e => {
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonal',
            );
          }}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e => {
            this_Obj.onChangeDetails(e.target.value, index, record, 'affNominationGST', 'seasonal');
          }}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) => (
      <Input
        prefix="$"
        type="number"
        disabled
        className="input-inside-table-fees"
        value={fee}
        onChange={e =>
          this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) => (
      <Input
        prefix="$"
        type="number"
        disabled
        className="input-inside-table-fees"
        value={gst}
        onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'seasonal')}
      />
    ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) => (
      <Input
        prefix="$"
        autoFocus={index === 0 ? true : false}
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        className="input-inside-table-fees"
        value={affiliateFee}
        onChange={e =>
          this_Obj.allowChangeDetails(e.target.value, index, record, 'affiliateFee', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) => (
      <Input
        prefix="$"
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        className="input-inside-table-fees"
        value={affiliateGst}
        onChange={e =>
          this_Obj.onChangeDetails(e.target.value, index, record, 'affiliateGst', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        prefix="$"
        className="input-inside-table-fees"
        value={total}
        disabled
      />
    ),
  },
];

const playerCasualTableAssociation = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeColumn,
  memCasualGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e => {
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'casual',
            );
          }}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.associationNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'casual',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'affNominationGST', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e => {
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'casual');
          }}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'casual')}
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          onChange={e =>
            this_Obj.allowChangeDetails(e.target.value, index, record, 'affiliateFee', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'affiliateGst', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: (total, record) =>
      record.isPlayer == 1 ? (
        <Input
          style={{ width: 95 }}
          prefix="$"
          className="input-inside-table-fees"
          value={total}
          disabled
        />
      ) : (
        <Input disabled className="input-inside-table-fees" style={{ width: 95 }} value="N/A" />
      ),
  },
];

const playerSeasonalTableClub = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonal',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'seasonal')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          data-testid={AppUniqueId.INDIVIDUAL_SEASONAL_AFFILIATE_NOMINATION_FEES_GST}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonal',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'affNominationGST', 'seasonal')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) => (
      <Input
        prefix="$"
        type="number"
        disabled
        className="input-inside-table-fees"
        value={fee}
        onChange={e =>
          this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) => (
      <Input
        prefix="$"
        type="number"
        disabled
        className="input-inside-table-fees"
        value={gst}
        onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'seasonal')}
      />
    ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) => (
      <Input
        prefix="$"
        autoFocus={index === 0 ? true : false}
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        className="input-inside-table-fees"
        value={affiliateFee}
        data-testid={AppUniqueId.INDIVIDUAL_SEASONAL_AFFILIATE_COMPETITION_FEES_GST}
        onChange={e =>
          this_Obj.allowChangeDetails(e.target.value, index, record, 'affiliateFee', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) => (
      <Input
        prefix="$"
        disabled={this_Obj.state.permissionState.allDisable}
        type="number"
        className="input-inside-table-fees"
        value={affiliateGst}
        onChange={e =>
          this_Obj.onChangeDetails(e.target.value, index, record, 'affiliateGst', 'seasonal')
        }
      />
    ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        prefix="$"
        className="input-inside-table-fees"
        value={total}
        disabled
      />
    ),
  },
];

const playerCasualTableClub = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeColumn,
  memCasualGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'casual',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'nominationGST', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.clubNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'casual',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'affNominationGST', 'casual')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'casual')
          }
        />
      ) : (
        <Input className="input-inside-table-fees" disabled value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e => this_Obj.onChangeDetails(e.target.value, index, record, 'gst', 'casual')}
        />
      ) : (
        <Input className="input-inside-table-fees" disabled value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          data-testid={AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_AFFILIATE_COMPETITION_FEES_GST}
          onChange={e =>
            this_Obj.allowChangeDetails(e.target.value, index, record, 'affiliateFee', 'casual')
          }
        />
      ) : (
        <Input className="input-inside-table-fees" disabled value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(e.target.value, index, record, 'affiliateGst', 'casual')
          }
        />
      ) : (
        <Input className="input-inside-table-fees" disabled value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: (total, record) =>
      record.isPlayer == 1 ? (
        <Input
          style={{ width: 95 }}
          prefix="$"
          className="input-inside-table-fees"
          value={total}
          disabled
        />
      ) : (
        <Input className="input-inside-table-fees" style={{ width: 95 }} disabled value="N/A" />
      ),
  },
];

const playerSeasonalTableTeamAssociation = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      fee != null ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      gst != null ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      affiliateFee != null ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          onChange={e =>
            this_Obj.allowChangeDetails(
              e.target.value,
              index,
              record,
              'affiliateFee',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      affiliateGst != null ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affiliateGst',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        disabled
        prefix="$"
        className="input-inside-table-fees"
        value={total}
      />
    ),
  },
];

const playerSeasonalTableTeamClub = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          data-testid={AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_NOMINATION_GST}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      fee != null ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      gst != null ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      affiliateFee != null ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          data-testid={AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_AFFILIATE_COMPETITION_GST}
          onChange={e =>
            this_Obj.allowChangeDetails(
              e.target.value,
              index,
              record,
              'affiliateFee',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      affiliateGst != null ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affiliateGst',
              'seasonal',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        disabled
        prefix="$"
        className="input-inside-table-fees"
        value={total}
      />
    ),
  },
];

const playerSeasonalTeamTable = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipType',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memSeasonalFeeColumn,
  memSeasonalGstColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) => {
      return fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          data-testid={AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_NOMINATION_GST}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      );
    },
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      fee != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          data-testid={AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED_COMPETITION_GST}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      gst != null && record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: total => (
      <Input
        style={{ width: 95 }}
        disabled
        prefix="$"
        className="input-inside-table-fees"
        value={total}
      />
    ),
  },
];

const playerCasualTableTeamAssociation = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeTeamColumn,
  ,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.associationNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      (affiliateFee != null ||
        record.teamRegChargeTypeRefId == 2 ||
        record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          onChange={e =>
            this_Obj.allowChangeDetails(
              e.target.value,
              index,
              record,
              'affiliateFee',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      (affiliateGst != null ||
        record.teamRegChargeTypeRefId == 2 ||
        record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affiliateGst',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: () => <Input disabled className="input-inside-table-fees" value="N/A" />,
  },
];

const playerCasualTableTeamClub = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeTeamColumn,
  memCasualGstTeamColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.clubNominationFeesExclGst,
    dataIndex: 'affNominationFees',
    key: 'affNominationFees',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affNominationGST',
    key: 'affNominationGST',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affNominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          type="number"
          disabled
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.affiliateCompetitionFeesExclGst,
    dataIndex: 'affiliateFee',
    key: 'affiliateFee',
    width: 84,
    render: (affiliateFee, record, index) =>
      (affiliateFee != null ||
        record.teamRegChargeTypeRefId == 2 ||
        record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateFee}
          onChange={e =>
            this_Obj.allowChangeDetails(
              e.target.value,
              index,
              record,
              'affiliateFee',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'affiliateGst',
    key: 'affiliateGst',
    width: 84,
    render: (affiliateGst, record, index) =>
      (affiliateGst != null ||
        record.teamRegChargeTypeRefId == 2 ||
        record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={affiliateGst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'affiliateGst',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: () => <Input disabled className="input-inside-table-fees" value="N/A" />,
  },
];

const playerCasualTeamTable = [
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    width: 84,
    render: membershipProductTypeName => (
      <Popover content={membershipProductTypeName}>
        <div>
          <Input className="input-inside-table-fees" disabled value={membershipProductTypeName} />
        </div>
      </Popover>
    ),
  },
  {
    title: AppConstants.division,
    dataIndex: 'division',
    key: 'division',
    width: 84,
    render: (division, record) => (
      <Popover
        content={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
      >
        <div>
          <Input
            className="input-inside-table-fees"
            disabled
            value={record.competitionMembershipProductDivisionId ? record.divisionName : 'N/A'}
          />
        </div>
      </Popover>
    ),
  },
  memCasualFeeTeamColumn,
  memCasualGstTeamColumn,
  {
    title: AppConstants.nominationFeesExclGst,
    dataIndex: 'nominationFees',
    key: 'nominationFees',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationFees',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'nominationGST',
    key: 'nominationGST',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(
              getNotNegativeVal(e),
              index,
              record,
              'nominationGST',
              'seasonalTeam',
            )
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.competitionFeesExclGst,
    dataIndex: 'fee',
    key: 'fee',
    width: 84,
    render: (fee, record, index) =>
      (fee != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={fee}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'fee', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.gst,
    dataIndex: 'gst',
    key: 'gst',
    width: 84,
    render: (gst, record, index) =>
      (gst != null || record.teamRegChargeTypeRefId == 2 || record.teamRegChargeTypeRefId == 3) &&
      record.isPlayer == 1 ? (
        <Input
          prefix="$"
          disabled={this_Obj.state.permissionState.allDisable}
          type="number"
          className="input-inside-table-fees"
          value={gst}
          onChange={e =>
            this_Obj.onChangeDetails(getNotNegativeVal(e), index, record, 'gst', 'seasonalTeam')
          }
        />
      ) : (
        <Input disabled className="input-inside-table-fees" value="N/A" />
      ),
  },
  {
    title: AppConstants.total,
    dataIndex: 'total',
    key: 'total',
    width: 96,
    render: () => <Input disabled className="input-inside-table-fees" value="N/A" />,
  },
];

class CompetitionFeeTab extends Component {
  constructor(props) {
    super(props);
    this.state = { feeErrors: [] };
    this_Obj = this.props.this_Obj;
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  validateForm = () => {
    let allStates = this.props.competitionFeesState;
    let feeList = allStates.competitionFeesData || [];
    const feeErrors = [];
    for (let index = 0; index < feeList.length; index++) {
      let fee = feeList[index];
      if (fee.isTeamReg) {
        if (!fee.teamFeeType) {
          feeErrors.push({ teamFeeTypeError: true, index });
          continue;
        }
        if (!fee.teamRegChargeTypeRefId) {
          feeErrors.push({ teamRegChargeTypeError: true, index });
          continue;
        }
      }
      if (!fee.isIndividualReg && !fee.isTeamReg) {
        message.error(AppConstants.pleaseAddCompetitionFee + fee.membershipProductName);
        return false;
      }
    }

    this.setState({ feeErrors });
    if (feeErrors.length) {
      message.error(AppConstants.pleaseReview);
      let anchorElement = document.getElementById(`teamreg_${feeErrors[0].index}`);
      if (anchorElement) {
        anchorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    return !feeErrors.length;
  };

  onChangeError = index => {
    const { feeErrors } = this.state;
    let idx = feeErrors.findIndex(item => item.index == index);
    if (idx >= 0) {
      feeErrors.splice(idx, 1);
      this.setState({ feeErrors: [...feeErrors] });
    }
  };
  getOrgLevelForFeesTable = () => {
    const registrationInviteesRefIdObject = {
      [RegistrationInviteesName.Association]: RegistrationInvitees.Association,
      [RegistrationInviteesName.Club]: RegistrationInvitees.Club,
      [RegistrationInviteesName.AnyAssociation]: RegistrationInvitees.AnyAssociation,
      [RegistrationInviteesName.AnyClub]: RegistrationInvitees.AnyClub,
    };
    let detailData = this.props.competitionFeesState.competitionDetailData;
    let inviteesArray = detailData.invitees;
    let inviteeFilter = inviteesArray.filter(
      x =>
        x.registrationInviteesRefId == RegistrationInvitees.Association ||
        x.registrationInviteesRefId == RegistrationInvitees.Club ||
        x.registrationInviteesRefId == RegistrationInvitees.AnyAssociation ||
        x.registrationInviteesRefId == RegistrationInvitees.AnyClub,
    );

    let orgLevel = '';
    if (isArrayNotEmpty(inviteeFilter)) {
      let registrationInviteesRefId = inviteeFilter[0].registrationInviteesRefId;
      orgLevel = Object.keys(registrationInviteesRefIdObject).find(
        key => registrationInviteesRefIdObject[key] === registrationInviteesRefId,
      );
    }
    return orgLevel;
  };
  seasonalFeesOnOrgLevel = () => {
    let isCreatorEdit = this.props.isCreatorEdit;
    let orgLevel = this.getOrgLevelForFeesTable();
    if (isCreatorEdit && orgLevel == RegistrationInviteesName.Association) {
      return playerSeasonalTableAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.Club) {
      return playerSeasonalTableClub;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyAssociation) {
      return playerSeasonalTableAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyClub) {
      return playerSeasonalTableClub;
    } else {
      return playerSeasonalTable;
    }
  };
  seasonalFeesTeamOnOrgTLevel() {
    let isCreatorEdit = this.props.isCreatorEdit;
    let orgLevel = this.getOrgLevelForFeesTable();
    if (isCreatorEdit && orgLevel == RegistrationInviteesName.Association) {
      return playerSeasonalTableTeamAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.Club) {
      return playerSeasonalTableTeamClub;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyAssociation) {
      return playerSeasonalTableTeamAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyClub) {
      return playerSeasonalTableTeamClub;
    } else {
      return playerSeasonalTeamTable;
    }
  }
  casualFeesTeamOnOrgTLevel() {
    let isCreatorEdit = this.props.isCreatorEdit;
    let orgLevel = this.getOrgLevelForFeesTable();
    if (isCreatorEdit && orgLevel == RegistrationInviteesName.Association) {
      return playerCasualTableTeamAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.Club) {
      return playerCasualTableTeamClub;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyAssociation) {
      return playerCasualTableTeamAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyClub) {
      return playerCasualTableTeamClub;
    } else {
      return playerCasualTeamTable;
    }
  }
  casualFeesOnOrgLevel() {
    let isCreatorEdit = this.props.isCreatorEdit;
    let orgLevel = this.getOrgLevelForFeesTable();
    if (isCreatorEdit && orgLevel == RegistrationInviteesName.Association) {
      return playerCasualTableAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.Club) {
      return playerCasualTableClub;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyAssociation) {
      return playerCasualTableAssociation;
    } else if (isCreatorEdit && orgLevel == RegistrationInviteesName.AnyClub) {
      return playerCasualTableClub;
    } else {
      return playerCasualTable;
    }
  }

  hasFeeTypeError = index => {
    const { feeErrors } = this.state;
    let error = feeErrors.find(i => i.index == index);
    if (error) return error.teamFeeTypeError;
    return false;
  };

  hasTeamRegChargeTypeError = index => {
    const { feeErrors } = this.state;
    let error = feeErrors.find(i => i.index == index);
    if (error) return error.teamRegChargeTypeError;
    return false;
  };

  render() {
    let allStates = this.props.competitionFeesState;
    let feeDetails = allStates.competitionFeesData;
    let feesTableDisable = this.props.permissionState.feesTableDisable;
    let membershipPrdArr = allStates.competitionMembershipProductData
      ? allStates.competitionMembershipProductData.membershipProducts
      : [];
    return (
      <div className="fees-view pt-5">
        <span className="form-heading required-field">
          {AppConstants.fees}
          <CustomToolTip>
            <span>{AppConstants.feesContextual}</span>
          </CustomToolTip>
        </span>
        {feeDetails == null ||
          (feeDetails.length === 0 && (
            <span className="applicable-to-heading pt-0">{AppConstants.please_Sel_mem_pro}</span>
          ))}

        {feeDetails &&
          feeDetails.map((item, index) => {
            // console.log("perfees",item.seasonalTeam.perType);
            let singleGameDisable = feesTableDisable;
            let product = membershipPrdArr.find(
              x => x.competitionMembershipProductId == item.competitionMembershipProductId,
            );
            if (product) {
              let productTypes = product.membershipProductTypes.filter(x => x.isPlaying == 1);
              singleGameDisable =
                singleGameDisable ||
                (productTypes.length > 0 &&
                  productTypes.every(x => x.allowOneTimeRegistrationOnly == 1));
            }

            return (
              <div key={index} className="inside-container-view">
                <span className="form-heading pt-2 pl-2">{item.membershipProductName}</span>
                <Radio.Group
                  className="reg-competition-radio"
                  onChange={e =>
                    this.props.checkUncheckcompetitionFeeSction(e.target.value, index, 'isAllType')
                  }
                  value={item.isAllType}
                  disabled={feesTableDisable}
                >
                  <div className="fluid-width">
                    <div className="row">
                      <div className="col-sm-2 d-flex align-items-center">
                        <div className="contextualHelp-RowDirection">
                          <Radio value="allDivisions" data-testid={AppUniqueId.ALL_DIVISION_FEES}>{AppConstants.allDivisions}</Radio>
                          <div className="ml-n20 mt-2">
                            <CustomToolTip>
                              <span>{AppConstants.allDivisionsMsg}</span>
                            </CustomToolTip>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-2 d-flex align-items-center">
                        <div className="contextualHelp-RowDirection">
                          <Radio value="perDivision" data-testid={AppUniqueId.PER_DIVISION_FEES}>{AppConstants.perDivision}</Radio>
                          <div className="ml-n20 mt-2">
                            <CustomToolTip>
                              <span>{AppConstants.perDivisionMsg}</span>
                            </CustomToolTip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Radio.Group>
                <div style={{ marginTop: 5 }}>
                  <div style={{ marginTop: 15 }}>
                    <Checkbox
                      checked={item.isIndividualReg}
                      className="single-checkbox"
                      data-testid={AppUniqueId.INDIVIDUAL_USER_REGISTRATION_FEE}
                      style={{ fontSize: '16px' }}
                      disabled={feesTableDisable}
                      onChange={e => {
                        this.props.checkUncheckcompetitionFeeSction(
                          e.target.checked,
                          index,
                          'isIndividualReg',
                        );
                      }}
                    >
                      {AppConstants.individualRegistrations}
                    </Checkbox>
                  </div>
                  {item.isIndividualReg && (
                    <div>
                      <div style={{ marginTop: 15 }}>
                        <Checkbox
                          style={{ marginLeft: '45px' }}
                          checked={item.isSeasonal}
                          className="single-checkbox ml-45"
                          disabled={feesTableDisable}
                          onChange={e => {
                            this.props.checkUncheckcompetitionFeeSction(
                              e.target.checked,
                              index,
                              'isSeasonal',
                            );
                          }}
                        >
                          {AppConstants.seasonalFee}
                          <CustomToolTip>{AppConstants.seasonalFeeIndividualMsg}</CustomToolTip>
                        </Checkbox>
                      </div>
                      {item.isSeasonal && (
                        <>
                          <div style={{ marginTop: 5, marginLeft: 60 }}>
                            <Radio.Group
                              className="reg-competition-radio"
                              onChange={e => {
                                this.props.checkUncheckcompetitionFeeSction(
                                  e.target.value,
                                  index,
                                  'individualChargeTypeRefId',
                                );
                              }}
                              value={item.individualChargeTypeRefId}
                              disabled={feesTableDisable}
                            >
                              <div className="d-flex">
                                <Radio value={IndividualChargeType.FullSeason} data-testid={AppUniqueId.INDIVIDUAL_CHARGE_FULL_SEASON}>
                                  {AppConstants.chargedForFullSeason}
                                </Radio>
                                <Radio value={IndividualChargeType.PerMatch} data-testid={AppUniqueId.INDIVIDUAL_CHARGE_PER_GAME} >
                                  {AppConstants.chargedPerMatchPlayed}
                                </Radio>
                              </div>
                            </Radio.Group>
                          </div>
                          <div className="table-responsive mt-2">
                            <Table
                              className="fees-table"
                              columns={this.seasonalFeesOnOrgLevel()}
                              dataSource={
                                item.isAllType != 'allDivisions'
                                  ? item.seasonal.perType
                                  : item.seasonal.allType
                              }
                              pagination={false}
                              Divider="false"
                              scroll={{ x: 'calc(100%)' }}
                            />
                          </div>
                        </>
                      )}

                      <div className="mt-10">
                        <Checkbox
                          checked={item.isCasual}
                          className="single-checkbox ml-45"
                          data-testid={AppUniqueId.INDIVIDUAL_USER_SINGLE_GAME_FEE}
                          disabled={singleGameDisable}
                          onChange={e =>
                            this.props.checkUncheckcompetitionFeeSction(
                              e.target.checked,
                              index,
                              'isCasual',
                            )
                          }
                        >
                          {AppConstants.singleGameFee}
                        </Checkbox>
                      </div>

                      {item.isCasual && (
                        <>
                          <br />
                          <p>{AppConstants.nonPlayerSingleGameFeeNote}</p>
                          <div className="table-responsive mt-2">
                            <Table
                              className="fees-table"
                              columns={this.casualFeesOnOrgLevel()}
                              dataSource={
                                item.isAllType != 'allDivisions'
                                  ? item.casual.perType
                                  : item.casual.allType
                              }
                              pagination={false}
                              Divider="false"
                              scroll={{ x: 'calc(100%)' }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {(item.isAllType != 'allDivisions'
                    ? item.seasonalTeam.perType
                    : item.seasonalTeam.allType
                  ).length > 0 && (
                    <div style={{ marginTop: 25 }}>
                      <div style={{ marginTop: 15 }} id={`teamreg_${index}`}>
                        <Checkbox
                          checked={item.isTeamReg}
                          className="single-checkbox"
                          data-testid={AppUniqueId.TEAM_REGISTRATION_FEE}
                          style={{ fontSize: '16px' }}
                          disabled={feesTableDisable}
                          onChange={e => {
                            this.onChangeError(index);
                            this.props.checkUncheckcompetitionFeeSction(
                              e.target.checked,
                              index,
                              'isTeamReg',
                            );
                          }}
                        >
                          {AppConstants.teamRegistration}
                        </Checkbox>
                      </div>
                      {item.isTeamReg && (
                        <>
                          {item.allowTeamRegistrationTypeRefId !=
                            AllowTeamRegistrationType.UnnamedPlayers && (
                            <>
                              <div className="mt-10">
                                <Radio
                                  value={TeamFeeType.PerPlayer}
                                  data-testid={AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_PLAYER}
                                  checked={item.teamFeeType == TeamFeeType.PerPlayer}
                                  disabled={feesTableDisable}
                                  onChange={e => {
                                    this.onChangeError(index);
                                    this.props.checkUncheckcompetitionFeeSction(
                                      e.target.value,
                                      index,
                                      'teamFeeType',
                                    );
                                  }}
                                >
                                  {AppConstants.teamFeePerPlayer}
                                </Radio>
                              </div>
                              {item.teamFeeType == TeamFeeType.PerPlayer && (
                                <div style={{ marginTop: 5 }}>
                                  <Radio.Group
                                    className="reg-competition-radio ml-45"                                
                                    onChange={e => {
                                      this.onChangeError(index);
                                      this.props.checkUncheckcompetitionFeeSction(
                                        e.target.value,
                                        index,
                                        'teamRegChargeTypeRefId',
                                      );
                                    }}
                                    value={item.teamRegChargeTypeRefId}
                                    disabled={feesTableDisable}
                                  >
                                    <div className="d-flex">
                                      <Radio
                                        value={TeamRegistrationChargeType.IndividualFullSeason}
                                        data-testid={AppUniqueId.TEAM_CHARGE_FULL_SEASON}
                                      >
                                        {AppConstants.chargedForFullSeason}
                                      </Radio>
                                      <Radio
                                        value={TeamRegistrationChargeType.IndividualPerMatchPlayed}
                                        data-testid={
                                          AppUniqueId.INDIVIDUAL_FEE_CHARGED_PER_GAME_PLAYED
                                        }
                                      >
                                        {AppConstants.chargedPerMatchPlayed}
                                      </Radio>
                                    </div>
                                  </Radio.Group>
                                  {this.hasTeamRegChargeTypeError(index) ? (
                                    <div className="validation-error validate-chargetype-error">
                                      {ValidationConstants.teamRegChargeTypeMessage}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                              {item.teamFeeType == TeamFeeType.PerPlayer && (
                                <div className="table-responsive mt-2">
                                  <Table
                                    className="fees-table"
                                    columns={this.seasonalFeesTeamOnOrgTLevel()}
                                    dataSource={
                                      item.isAllType !== 'allDivisions'
                                        ? item.seasonalTeam.perType
                                        : item.seasonalTeam.allType
                                    }
                                    pagination={false}
                                    Divider="false"
                                    scroll={{ x: 'calc(100%)' }}
                                  />
                                </div>
                              )}
                            </>
                          )}
                          <div className="mt-10">
                            <Radio
                              value={TeamFeeType.WholeTeam}
                              checked={item.teamFeeType == TeamFeeType.WholeTeam}
                              data-testid={AppUniqueId.TEAM_FEE_CHARGE_TEAM}
                              disabled={feesTableDisable}
                              onChange={e => {
                                this.onChangeError(index);
                                this.props.checkUncheckcompetitionFeeSction(
                                  e.target.value,
                                  index,
                                  'teamFeeType',
                                );
                              }}
                            >
                              {AppConstants.teamFeeWholeTeam}
                            </Radio>
                          </div>
                          {item.teamFeeType == TeamFeeType.WholeTeam && (
                            <div style={{ marginTop: 5 }}>
                              <Radio.Group
                                className="reg-competition-radio ml-45"
                                onChange={e => {
                                  this.onChangeError(index);
                                  this.props.checkUncheckcompetitionFeeSction(
                                    e.target.value,
                                    index,
                                    'teamRegChargeTypeRefId',
                                  );
                                }}
                                value={item.teamRegChargeTypeRefId}
                                disabled={feesTableDisable}
                              >
                                <div className="d-flex">
                                  <Radio value={TeamRegistrationChargeType.TeamFullSeason} data-testid={AppUniqueId.TEAM_CHARGE_FULL_SEASON}>
                                    {AppConstants.chargedForFullSeason}
                                  </Radio>
                                  <Radio value={TeamRegistrationChargeType.TeamPerMatch}>
                                    {AppConstants.chargedPerMatch}
                                  </Radio>
                                </div>
                              </Radio.Group>
                              {this.hasTeamRegChargeTypeError(index) ? (
                                <div className="validation-error validate-chargetype-error">
                                  {ValidationConstants.teamRegChargeTypeMessage}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {item.teamFeeType == TeamFeeType.WholeTeam && (
                            <div className="table-responsive mt-2">
                              <Table
                                className="fees-table"
                                columns={this.seasonalFeesTeamOnOrgTLevel()}
                                dataSource={
                                  item.isAllType !== 'allDivisions'
                                    ? item.seasonalTeam.perType
                                    : item.seasonalTeam.allType
                                }
                                pagination={false}
                                Divider="false"
                                scroll={{ x: 'calc(100%)' }}
                              />
                            </div>
                          )}
                          {this.hasFeeTypeError(index) ? (
                            <div className="validation-error validate-feetype-error">
                              {ValidationConstants.teamRegistrationFeeTypeMessage}
                            </div>
                          ) : null}
                        </>
                      )}
                      {/* <div className="mt-10">
                                                <Checkbox
                                                    checked={item.isTeamCasual}
                                                    className="single-checkbox"
                                                    disabled={feesTableDisable}
                                                    onChange={(e) =>
                                                        this.props.checkUncheckcompetitionFeeSction(
                                                            e.target.checked,
                                                            index,
                                                            'isTeamCasual'
                                                        )
                                                    }
                                                >
                                                    {AppConstants.singleGamePerTeamMember}
                                                </Checkbox>
                                            </div>
                                            {item.isTeamCasual && (
                                                <div className="table-responsive mt-2">
                                                    <Table
                                                        className="fees-table"
                                                        columns={this.casualFeesTeamOnOrgTLevel()}
                                                        dataSource={
                                                            item.isAllType != 'allDivisions'
                                                                ? item.casualTeam.perType
                                                                : item.casualTeam.allType
                                                        }
                                                        pagination={false}
                                                        Divider="false"
                                                    />
                                                </div>
                                            )} */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  }
}

export default CompetitionFeeTab;

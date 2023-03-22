import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import CustomTooltip from 'react-png-tooltip';
import {
  Layout,
  Breadcrumb,
  Button,
  DatePicker,
  Pagination,
  Popover,
  Table,
  Select,
  Input,
  Modal,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './product.scss';
import AppConstants from '../../themes/appConstants';
import AppImages from 'themes/appImages';
import moment from 'moment';
import { ExternalRegistrationStatus } from '../../enums/registrationEnums';
import { useOrganisation } from 'customHooks/hooks';
import {
  updateExternalRegistrationPage,
  updateExternalRegistrationFilters,
  getExternalRegistrations,
  exportExternalRegistrations,
  getExternalMembershipTypes,
} from 'store/actions/registrationAction/registration';
import { getOrganisationSettingsAction } from 'store/actions/homeAction/homeAction';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import { getGenderAction } from 'store/actions/commonAction/commonAction';
import { getAffiliateToOrganisationAction } from 'store/actions/userAction/userAction';
import {
  setPlayerList,
  toggleModalVisibility,
} from 'store/actions/moveFAPlayerAction/movePlayerAction';
import MoveModalComponentWrapper from './moveFromCompetitionFootball/MoveModalComponentWrapper';

const { Content } = Layout;
const { Option } = Select;

const regStatus = [
  ExternalRegistrationStatus.Registered,
  ExternalRegistrationStatus.Cancelled,
  ExternalRegistrationStatus.Declined,
  ExternalRegistrationStatus.Deregistered,
  ExternalRegistrationStatus.Pending,
  ExternalRegistrationStatus.RequireClearance,
  ExternalRegistrationStatus.Suspended,
  ExternalRegistrationStatus.Unknown,
];

const HeaderView = React.memo(({ loading, allowMove, onExport }) => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { playersToMove, modalVisible } = useSelector(state => state.MovePlayerState);
  const handleOnModalClick = () => {
    dispatch(toggleModalVisibility(!modalVisible));
  };
  const { organisationUniqueKey } = useOrganisation();

  return (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.externalRegistrations}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="col-sm d-flex align-items-center justify-content-end">
          <div style={{ marginRight: 15 }}>
            <Popover
              title={AppConstants.enableMoveFACompBtnMsg}
              content={
                <div style={{ maxWidth: 360 }}>
                  {allowMove
                    ? AppConstants.moveCompButtonPopoverMessageFA
                    : AppConstants.externalRegistrationMoveDisabled}
                </div>
              }
              placement="top"
              trigger="hover"
            >
              <Button
                className="primary"
                type="primary"
                disabled={!allowMove || (playersToMove?.length ? false : true)}
                onClick={handleOnModalClick}
              >
                Move
              </Button>
            </Popover>
            <MoveModalComponentWrapper
              organisationUniqueKey={organisationUniqueKey}
              visible={modalVisible}
              handleOnModalClick={handleOnModalClick}
            />
          </div>

          <Button
            className="primary-add-comp-form"
            type="primary"
            disabled={loading}
            onClick={onExport}
          >
            <div className="row">
              <div className="col-sm">
                <img src={AppImages.export} className="export-image" alt="" />
                {AppConstants.export}
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
});

const SelectDate = React.memo(({ title, field, value, onUpdate, ...props }) => (
  <>
    <div className="year-select-heading">{title}</div>
    <DatePicker
      name={field}
      size="default"
      className="year-select reg-filter-select"
      onChange={e => onUpdate({ [field]: e })}
      format="DD-MM-YYYY"
      placeholder="dd-mm-yyyy"
      showTime={false}
      value={value && moment(value, 'YYYY-MM-DD')}
      {...props}
    />
  </>
));

const SelectControl = React.memo(
  ({ title, field, value, showAll = true, onUpdate, children, ...props }) => (
    <>
      <span className="year-select-heading">{title}</span>
      <Select
        className="year-select reg-filter-select1 ml-2"
        value={value}
        onChange={e => onUpdate({ [field]: e })}
        {...props}
      >
        {!!showAll && (
          <Option key={-1} value={-1}>
            {AppConstants.all}
          </Option>
        )}
        {children}
      </Select>
    </>
  ),
);

const MultipleSelect = React.memo(({ field, onUpdate, children, ...props }) => {
  const onChangeValue = useCallback(
    payload => {
      const values = payload[field];
      if (values.length === 0) {
        payload[field] = [-1];
      } else if (values.length > 1) {
        const index = values.findIndex(i => i === -1);
        if (index == 0) {
          values.splice(index, 1);
        } else if (index > 0) {
          payload[field] = [-1];
        }
      }
      onUpdate(payload);
    },
    [onUpdate],
  );

  return (
    <SelectControl
      showSearch
      mode="multiple"
      optionFilterProp="children"
      field={field}
      onUpdate={onChangeValue}
      {...props}
    >
      {children}
    </SelectControl>
  );
});

const StatusView = React.memo(({ registrationStatus, onUpdate }) => {
  const [searchText, setSearchText] = useState('');

  const onKeyEnterSearchText = useCallback(
    e => {
      const code = e.keyCode || e.which;
      if (code === 13) {
        onUpdate({ search: searchText.trim() });
      }
    },
    [onUpdate, searchText],
  );

  const onChangeSearchText = useCallback(
    e => {
      setSearchText(e.target.value);
      if (!e.target.value) {
        onUpdate({ search: e.target.value.trim() });
      }
    },
    [setSearchText, onUpdate],
  );

  const onClickSearchIcon = useCallback(() => {
    onUpdate({ search: searchText.trim() });
  }, [onUpdate, searchText]);

  return (
    <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
      <div className="row">
        <div className="col-sm-9">
          <div className="reg-filter-col-cont status-dropdown d-flex align-items-center justify-content-end pr-2">
            <SelectControl
              title={AppConstants.status}
              field="registrationStatus"
              value={registrationStatus}
              onUpdate={onUpdate}
              style={{ maxWidth: 200 }}
            >
              {regStatus.map((item, index) => (
                <Option key={index} value={item}>
                  {item}
                </Option>
              ))}
            </SelectControl>
          </div>
        </div>

        <div className="col-sm-3 d-flex align-items-center justify-content-end margin-top-24-mobile">
          <div className="comp-product-search-inp-width">
            <Input
              className="product-reg-search-input"
              onChange={onChangeSearchText}
              placeholder="Search..."
              onKeyPress={onKeyEnterSearchText}
              value={searchText}
              prefix={
                <SearchOutlined
                  style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                  onClick={onClickSearchIcon}
                />
              }
              allowClear
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const DropdownView = ({ onUpdate }) => {
  const dispatch = useDispatch();
  const { yearRefId, yearList } = useSelector(state => state.AppState);
  const { genderData } = useSelector(state => state.CommonReducerState);
  const { affiliateTo: affiliateToData } = useSelector(state => state.UserState);
  const { externalMembership } = useSelector(state => state.RegistrationState);

  const {
    genderRefId = -1,
    dobFrom = null,
    dobTo = null,
    affiliate = [-1],
    membershipType = -1,
    membershipProductCategory = -1,
    division = -1,
  } = useSelector(state => state.RegistrationState.externalRegistrations.filters);
  const { name: organisationName = null, organisationUniqueKey = null } = useOrganisation();

  const membershipTypes = useMemo(() => {
    return externalMembership ? externalMembership.membershipTypes.filter(i => !!i).sort() : [];
  }, [externalMembership]);

  const membershipProductCategories = useMemo(() => {
    return externalMembership
      ? externalMembership.membershipProductCategories.filter(i => !!i).sort()
      : [];
  }, [externalMembership]);

  const divisionList = useMemo(() => {
    return externalMembership ? externalMembership.productNames.filter(i => !!i).sort() : [];
  }, [externalMembership]);

  const uniqueValues = useMemo(() => {
    const uniqueValues = [];
    if (organisationUniqueKey) {
      uniqueValues.push({
        organisationId: organisationUniqueKey,
        name: organisationName,
      });
    }
    if (affiliateToData.affiliatedTo) {
      const arr = [
        ...new Map(affiliateToData.affiliatedTo.map(obj => [obj.organisationId, obj])).values(),
      ];
      if (arr.length > 0) {
        uniqueValues.push(...arr);
      }
    }
    return uniqueValues.sort((a, b) => a.name.localeCompare(b.name));
  }, [organisationUniqueKey, organisationName, affiliateToData]);

  const onChangeYearRefId = useCallback(
    ({ yearRefId }) => {
      dispatch(setYearRefId(yearRefId));
    },
    [dispatch],
  );

  return (
    <div className="comp-player-grades-header-drop-down-view fluid-width">
      <div className="row reg-filter-row mb-3">
        <div className="col-sm com-year-select-heading-view">
          <SelectControl
            title={AppConstants.year}
            field="yearRefId"
            value={yearRefId}
            onUpdate={e => onChangeYearRefId(e)}
          >
            {yearList.map((item, index) => (
              <Option key={index} value={item.id}>
                {item.description}
              </Option>
            ))}
          </SelectControl>
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectControl
            title={AppConstants.gender}
            field="genderRefId"
            value={genderRefId}
            onUpdate={onUpdate}
          >
            {(genderData || []).map((item, index) => (
              <Option key={index} value={item.id}>
                {item.description}
              </Option>
            ))}
          </SelectControl>
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectDate
            title={AppConstants.dobFrom}
            field="dobFrom"
            value={dobFrom}
            onUpdate={onUpdate}
          />
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectDate title={AppConstants.dobTo} field="dobTo" value={dobTo} onUpdate={onUpdate} />
        </div>
      </div>
      <div className="row reg-filter-row mb-3">
        <div className="col-sm com-year-select-heading-view">
          <MultipleSelect
            title={AppConstants.affiliate}
            field="affiliate"
            value={affiliate}
            onUpdate={onUpdate}
          >
            {(uniqueValues || []).map((org, index) => (
              <Option key={index} value={org.organisationId}>
                {org.name}
              </Option>
            ))}
          </MultipleSelect>
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectControl
            title={AppConstants.role}
            field="membershipType"
            value={membershipType}
            onUpdate={onUpdate}
          >
            {(membershipTypes || []).map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </SelectControl>
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectControl
            title={AppConstants.membershipProductCategoryType}
            field="membershipProductCategory"
            value={membershipProductCategory}
            onUpdate={onUpdate}
          >
            {(membershipProductCategories || []).map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </SelectControl>
        </div>
        <div className="col-sm com-year-select-heading-view">
          <SelectControl
            title={AppConstants.productName}
            field="division"
            value={division}
            onUpdate={onUpdate}
            showSearch
            optionFilterProp="children"
          >
            {(divisionList || []).map((item, index) => (
              <Option key={index} value={item}>
                {item}
              </Option>
            ))}
          </SelectControl>
        </div>
      </div>
    </div>
  );
};

const CountView = React.memo(({ registrations }) => {
  return (
    <div className="comp-dash-table-view mt-2">
      <div>
        <div className="row">
          <div className="col-sm">
            <div className="registration-count">
              <div className="reg-payment-paid-reg-text">
                {AppConstants.numberOfRegistrations}
                <CustomTooltip>
                  <span>{AppConstants.noOfRegistrationsInfo}</span>
                </CustomTooltip>
              </div>
              <div className="reg-payment-price-text">{registrations}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const TableView = React.memo(({ sortBy, sortOrder, onUpdate }) => {
  const {
    registrations,
    page: { currentPage, pageSize },
    totalCount,
  } = useSelector(state => state.RegistrationState.externalRegistrations);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const dispatch = useDispatch();
  const tableSort = useCallback(
    key => {
      let _sortBy = key;
      let _sortOrder = null;
      if (sortBy !== key) {
        _sortOrder = 'ASC';
      } else if (sortBy === key && sortOrder === 'ASC') {
        _sortOrder = 'DESC';
      } else if (sortBy === key && sortOrder === 'DESC') {
        _sortBy = _sortOrder = null;
      }
      onUpdate('sort', { sortBy: _sortBy, sortOrder: _sortOrder });
    },
    [sortBy, sortOrder, onUpdate],
  );

  const listeners = useCallback(
    key => ({
      onClick: () => tableSort(key),
    }),
    [tableSort],
  );

  const columns = useMemo(
    () => [
      {
        title: AppConstants.externalID,
        dataIndex: 'externalUserId',
        key: 'externalUserId',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.userId,
        dataIndex: 'userId',
        key: 'userId',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.firstName,
        dataIndex: 'firstName',
        key: 'firstName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (firstName, record) => (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'registration',
                screen: '/externalRegistrations',
              },
            }}
          >
            <span
              className={
                record.deRegistered ||
                record.registrationStatus === ExternalRegistrationStatus.Cancelled
                  ? 'input-heading-add-another-strike pt-0'
                  : 'input-heading-add-another pt-0'
              }
            >
              {firstName}
            </span>
          </NavLink>
        ),
      },
      {
        title: AppConstants.lastName,
        dataIndex: 'lastName',
        key: 'lastName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (lastName, record) => (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'registration',
                screen: '/externalRegistrations',
              },
            }}
          >
            <span
              className={
                record.deRegistered ||
                record.registrationStatus === ExternalRegistrationStatus.Cancelled
                  ? 'input-heading-add-another-strike pt-0'
                  : 'input-heading-add-another pt-0'
              }
            >
              {lastName}
            </span>
          </NavLink>
        ),
      },
      {
        title: AppConstants.dobAgeEndOfYear,
        dataIndex: 'dateOfBirth',
        key: 'dateOfBirth',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: (value, record) => {
          if (value) {
            const dateOfBirth = moment(value).format('DD/MM/YYYY');
            return <>{`${dateOfBirth} (${record.age})`}</>;
          }
          return <></>;
        },
      },
      {
        title: AppConstants.gender,
        dataIndex: 'gender',
        key: 'gender',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.activationDate,
        dataIndex: 'activationDate',
        key: 'activationDate',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: value => <>{value != null ? moment(value).format('DD/MM/YYYY') : ''}</>,
      },
      {
        title: AppConstants.affiliate,
        dataIndex: 'affiliate',
        key: 'affiliate',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.role,
        dataIndex: 'membershipType',
        key: 'membershipType',
        sorter: true,
        onHeaderCell: () => listeners('registrationDivisions'),
      },
      {
        title: AppConstants.membershipProductCategoryType,
        dataIndex: 'membershipProductCategory',
        key: 'membershipProductCategory',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.productName,
        dataIndex: 'division',
        key: 'division',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.status,
        dataIndex: 'registrationStatus',
        key: 'registrationStatus',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      },
      {
        title: AppConstants.deRegistrationDate,
        dataIndex: 'deRegistrationDate',
        key: 'deRegistrationDate',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
        render: value => <>{value != null ? moment(value).format('DD/MM/YYYY') : ''}</>,
      },
    ],
    [listeners],
  );

  const handlePageChange = useCallback(
    (page, size) => {
      const currentPage = pageSize === size ? page : 1;
      onUpdate('page', { currentPage, pageSize: size });
    },
    [pageSize, onUpdate],
  );

  const handleOnPlayerChange = (selectedRowKeys, selectedRow) => {
    setSelectedRowKeys(selectedRowKeys);
    dispatch(setPlayerList(selectedRow));
  };
  return (
    <div className="comp-dash-table-view mt-2">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          rowSelection={{
            selectedRowKeys,
            onChange: handleOnPlayerChange,
          }}
          columns={columns}
          rowKey={record => record.registrationId}
          dataSource={registrations}
          pagination={false}
          loading={false}
        />
      </div>
      <div className="d-flex justify-content-end">
        <Pagination
          className="antd-pagination"
          showSizeChanger
          current={currentPage}
          defaultPageSize={pageSize}
          total={totalCount}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
});

const ExternalRegistrations = () => {
  const dispatch = useDispatch();
  const { yearRefId, yearList } = useSelector(state => state.AppState);
  const { onLoad: loadingUserState } = useSelector(state => state.UserState);
  const { loading, filters, page, totalCount } = useSelector(
    state => state.RegistrationState.externalRegistrations,
  );
  const { loadingExternalMembershipTypes } = useSelector(state => state.RegistrationState);
  const { allowMoveExternalRegistrations } = useSelector(
    state => state.HomeDashboardState.organisationSettings,
  );
  const { registrationStatus = -1, sortBy, sortOrder } = filters;
  const { organisationUniqueKey } = useOrganisation();

  useEffect(() => {
    dispatch(getOnlyYearListAction());
    dispatch(getGenderAction());
  }, []);

  /// Get organisation settings
  useEffect(() => {
    dispatch(getOrganisationSettingsAction({ organisationUniqueKey }));
  }, [organisationUniqueKey]);

  useEffect(() => {
    dispatch(getExternalMembershipTypes({ yearRefId, organisationUniqueKey }));
  }, [yearRefId, organisationUniqueKey]);

  const onUpdate = useCallback(
    data => {
      dispatch(updateExternalRegistrationFilters(data));
    },
    [dispatch],
  );

  const onTableUpdated = useCallback(
    (key, payload) => {
      key === 'page' ? dispatch(updateExternalRegistrationPage(payload)) : onUpdate(payload);
    },
    [dispatch, onUpdate],
  );

  useEffect(() => {
    if (organisationUniqueKey) {
      dispatch(getAffiliateToOrganisationAction(organisationUniqueKey));
      dispatch(updateExternalRegistrationFilters({ organisationUniqueKey }));
    }
  }, [organisationUniqueKey]);

  const createPayload = useCallback(() => {
    const { organisationUniqueKey } = filters;
    if (organisationUniqueKey) {
      const { dobFrom, dobTo, affiliate } = filters;
      const offset = (page.currentPage - 1) * page.pageSize;
      return {
        ...filters,
        yearRefId,
        offset,
        limit: page.pageSize,
        dobFrom: dobFrom ? moment(dobFrom).format('YYYY-MM-DD') : undefined,
        dobTo: dobTo ? moment(dobTo).format('YYYY-MM-DD') : undefined,
        affiliate: affiliate && affiliate.length > 0 && affiliate[0] !== -1 ? affiliate : undefined,
        registrationStatus,
      };
    }
  }, [filters, page, yearRefId]);

  useEffect(() => {
    if (yearList.length > 0) {
      const payload = createPayload();
      payload && dispatch(getExternalRegistrations(payload));
    }
  }, [createPayload, yearList]);

  const onExport = useCallback(() => {
    const payload = createPayload();
    payload && dispatch(exportExternalRegistrations(payload));
  }, [dispatch, createPayload]);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout
        menuHeading={AppConstants.registration}
        menuName={AppConstants.registration}
      />
      <InnerHorizontalMenu menu="registration" regSelectedKey="12" />
      <Layout>
        <HeaderView
          loading={loading}
          allowMove={allowMoveExternalRegistrations}
          onExport={onExport}
        />
        <StatusView registrationStatus={registrationStatus} onUpdate={onUpdate} />
        <Content>
          <Loader visible={loading || loadingUserState || loadingExternalMembershipTypes} />
          <DropdownView onUpdate={onUpdate} />
          <CountView registrations={totalCount} />
          <TableView sortBy={sortBy} sortOrder={sortOrder} onUpdate={onTableUpdated} />
        </Content>
      </Layout>
    </div>
  );
};

export default ExternalRegistrations;

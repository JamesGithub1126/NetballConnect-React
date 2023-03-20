import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Select,
  Menu,
  Pagination,
  Input,
  Modal,
  Dropdown,
  Tag,
  message,
} from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import './product.scss';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import moment from 'moment';
import { getOrganisationData } from '../../util/sessionStorage';
import { ClearanceStatusRefId, AutoApprovalRefId, ClearanceTypeRefId } from '../../enums/enums';
import {
  getAllCompetitions,
  getRegistrationClearanceList,
  exportRegistrationClearance,
  approveRegistrationClearances,
  updateClearanceDataAction,
  saveRegistrationClearances,
  getPastRegForClearanceAction,
  changeClearanceApproverAction,
} from '../../store/actions/registrationAction/registrationClearanceAction';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import history from 'util/history';
import { FLAVOUR } from '../../util/enums';
import { isNullOrUndefined } from '../../util/helpers';
import {
  createClearanceApprovalKey,
  isImageFormatValid,
  isImageSizeValid,
  isNotNullOrEmptyString,
} from '../../util/helpers';
import ImageLoader from '../../customComponents/ImageLoader';
import { isProfessionalMembershipEnabled } from 'util/registrationHelper';
import { getGenericCommonReference } from 'store/actions/commonAction/commonAction';
import { ConfirmModal } from 'customComponents/confirmModal';
import { cloneDeep, startCase } from 'lodash';

const isFootball = process.env.REACT_APP_FLAVOUR === FLAVOUR.Football;

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;

const Approved7Days = 100;
const ApprovedAutomatic = 101;

const InitialApproverSelectionData = { selectedRowKeys: [], selectedRows: [], record: null };

const INITAL_APPROVAL_DATA = {
  showApprovalModal: false,
  clearanceIdList: [],
  status: false,
  isBulk: false,
};

const ClearanceStatusRefs = [
  { id: null, name: AppConstants.all },
  { id: ClearanceStatusRefId.Pending, name: AppConstants.pending },
  { id: ClearanceStatusRefId.Required, name: AppConstants.required },
  { id: ClearanceStatusRefId.NotRequired, name: AppConstants.notRequired },
];

if (isFootball) {
  ClearanceStatusRefs.push({
    id: ClearanceStatusRefId.ITC_Required,
    name: AppConstants.itcRequired,
  });
}

const ApprovalStatusRefs = [
  { id: null, name: AppConstants.all },
  { id: ClearanceStatusRefId.Pending, name: AppConstants.pending },
  { id: ClearanceStatusRefId.Approved, name: AppConstants.approved },
  { id: Approved7Days, name: AppConstants.approved_7days },
  { id: ApprovedAutomatic, name: AppConstants.approved_automatic },
  { id: ClearanceStatusRefId.Declined, name: AppConstants.declined },
];

const getFilters = () => {
  const filter = {
    competitionId: -1,
    clearanceStatusRefId: null,
    approvalStatusRefId: null,
    autoApprovalRefId: null,
    approvalStatus: null,
    playerMembershipTierRefId: -1,
  };
  if (history.location.state) {
    const { pendingCurrentOrganisation } = history.location.state;
    if (pendingCurrentOrganisation) {
      return {
        ...filter,
        pendingCurrentOrganisation,
      };
    }
  }
  return filter;
};

const getClearanceStatusText = statusRefId => {
  const status = ClearanceStatusRefs.find(i => i.id === Number(statusRefId));
  return status ? status.name : '';
};

const RegistrationClearances = () => {
  const dispatch = useDispatch();
  const clearanceState = useSelector(state => state.RegistrationClearanceState);
  const { clearanceUpdated, pastRegLoad, pastRegistrations, changeApproverLoad } = clearanceState;
  const { yearRefId, yearList } = useSelector(state => state.AppState);
  const commonReducerState = useSelector(state => state.CommonReducerState);

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [filter, setFilter] = useState(getFilters());
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showDeclineConfirmPopup, setShowDeclineConfirmPopup] = useState(false);
  const [selectedClearanceIds, setSelectedClearanceIds] = useState([]);
  const [curClearance, setCurClearance] = useState(null);
  const [approvalData, setApprovalData] = useState(cloneDeep(INITAL_APPROVAL_DATA));
  const [showApproverModal, setshowApproverModal] = useState(false);
  const [approverSelectionData, setApproverSelectionData] = useState(InitialApproverSelectionData);

  let playerMembershipTiers = [];
  if (commonReducerState && commonReducerState.PlayerMembershipTier) {
    playerMembershipTiers = commonReducerState.PlayerMembershipTier;
  }

  useEffect(() => {
    dispatch(getOnlyYearListAction(yearList));
  }, [dispatch, yearList]);

  useEffect(() => {
    if (!isNullOrUndefined(yearRefId) && yearList.length > 0) {
      dispatch(getAllCompetitions(yearRefId));
    }
  }, [dispatch, yearRefId]);

  useEffect(() => {
    dispatch(
      getGenericCommonReference({
        PlayerMembershipTier: 'PlayerMembershipTier',
      }),
    );
  }, []);

  useEffect(() => {
    if (filter && yearRefId && !changeApproverLoad) {
      const payload = {
        ...filter,
        yearRefId: yearRefId,
        organisationUniqueKey: getOrganisationData().organisationUniqueKey,
      };
      if (!payload.limit) {
        payload.offset = 0;
        payload.limit = 10;
      }
      delete payload['approvalStatus'];
      dispatch(getRegistrationClearanceList(payload, sortBy, sortOrder));
    }
  }, [filter, yearRefId, sortBy, sortOrder, changeApproverLoad]);

  useEffect(() => {
    if (clearanceUpdated) {
      setFilter({ ...filter });
    }
  }, [clearanceUpdated]);

  const onChangePage = (currentPage, pageSize = undefined) => {
    currentPage = currentPage || 1;
    setFilter({
      ...filter,
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });
  };

  const updateFilter = (key, value) => {
    setFilter({
      ...filter,
      limit: null,
      [key]: value,
    });
  };

  const onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      updateFilter('search', searchText);
    }
  };

  const onChangeSearchText = e => {
    setSearchText(e.target.value);
    if (!e.target.value) {
      updateFilter('search', e.target.value);
    }
  };

  const onKeyEnterExternalUserId = (e, record) => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      dispatch(
        saveRegistrationClearances({
          clearanceId: record.clearanceId,
          externalUserId: record.externalUserId,
          userId: record.userId,
          photoUrl: '',
        }),
      );
    }
  };

  const onChangeExternalUserId = (e, record) => {
    dispatch(
      updateClearanceDataAction({ row: record, key: 'externalUserId', data: e.target.value }),
    );
  };

  const onClickSearchIcon = async () => {
    if (filter.search !== searchText) {
      updateFilter('search', searchText);
    }
  };

  const onChangeYearRefId = e => {
    dispatch(setYearRefId(e));
    yearRefId !== e && updateFilter('competitionId', -1);
  };

  const onApprovalStatusChange = e => {
    const approvalStatusRefId = [Approved7Days, ApprovedAutomatic].includes(e)
      ? ClearanceStatusRefId.Approved
      : e;
    const autoApprovalRefId =
      e === Approved7Days
        ? AutoApprovalRefId.Approved7Days
        : e === ApprovedAutomatic
        ? AutoApprovalRefId.NoApprovalRequired
        : null;

    setFilter({
      ...filter,
      limit: null,
      approvalStatus: e,
      approvalStatusRefId,
      autoApprovalRefId,
    });
  };

  const clearTagFilter = e => {
    setFilter({
      ...filter,
      pendingCurrentOrganisation: false,
    });
  };
  const onChangePlayerMembershipTier = e => {
    updateFilter('playerMembershipTierRefId', e);
  };

  const headerView = () => (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.registrationClearances}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {isProfessionalMembershipEnabled && (
          <div className="col-sm-3 d-flex justify-content-end">
            <div className="">
              <span className="year-select-heading">{`${AppConstants.playerType}:`}</span>
              <Select
                className="ml-2"
                value={filter.playerMembershipTierRefId}
                onChange={e => onChangePlayerMembershipTier(e)}
                style={{ width: 140 }}
              >
                <Option key={-1} value={-1}>
                  {AppConstants.all}
                </Option>
                {playerMembershipTiers.map(item => (
                  <Option key={`playerType_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        )}

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
        <div className="d-flex align-items-center" style={{ marginRight: '1%' }}>
          <Dropdown
            className="primary-add-comp-form"
            overlay={
              <Menu>
                <Menu.Item key="1" onClick={onApproveList}>
                  {AppConstants.approve}
                </Menu.Item>
                <Menu.Item key="2" onClick={onDeclineList}>
                  {AppConstants.decline}
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="primary">
              {AppConstants.action} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>
  );

  const statusView = () => (
    <>
      {!!filter.pendingCurrentOrganisation && (
        <div className="comp-player-grades-header-drop-down-view">
          <div className="row mt-2 mb-4">
            <div className="col-sm-12">
              <Tag
                closable
                color="volcano"
                style={{ paddingTop: 3, height: 30 }}
                onClose={() => clearTagFilter()}
              >
                {AppConstants.pendingCurrentOrganisation}
              </Tag>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const onExport = () => {
    const payload = {
      ...filter,
      yearRefId,
      limit: null,
      offset: null,
      organisationUniqueKey: getOrganisationData().organisationUniqueKey,
    };
    delete payload['approvalStatus'];
    dispatch(exportRegistrationClearance(payload, sortBy, sortOrder));
  };

  const getOrganisationId = () => {
    const organisation = getOrganisationData();
    return organisation ? organisation.organisationId : null;
  };

  const handleClearanceStatus = (clearanceId, status) => {
    const records = [clearanceId];
    const payload = {
      records,
      status,
      approval: false,
    };
    dispatch(approveRegistrationClearances(payload));
  };

  const handleApprovalStatus = (clearanceId, status) => {
    if (status === ClearanceStatusRefId.Declined) {
      setSelectedClearanceIds([clearanceId]);
      setShowDeclineConfirmPopup(true);
    } else {
      setApprovalData({ showApprovalModal: true, clearanceIdList: [clearanceId], status });
    }
  };

  const handleDeclineRequest = ids => {
    updateApprovalStatus(ids, ClearanceStatusRefId.Declined);
  };

  const updateApprovalStatus = (clearanceIdList, status) => {
    const records = clearanceIdList;
    const payload = {
      records,
      status,
      approval: true,
    };
    dispatch(approveRegistrationClearances(payload));
  };

  const getPendingClearances = useCallback(
    selectedKeys => {
      const filteredItems = clearanceState.clearanceListData.filter(c => {
        if (
          c.approvalStatus === ClearanceStatusRefId.Approved ||
          c.clearanceStatus === ClearanceStatusRefId.Pending
        ) {
          return false;
        }
        //CM-5031 Actions should be enabled for already approved/decline clearance as well
        /*if (Number(c.approvalStatus) !== ClearanceStatusRefId.Pending) {
        return false;
      }*/
        return !!selectedKeys.find(id => id === c.clearanceId);
      });
      return filteredItems;
    },
    [clearanceState.clearanceListData],
  );

  const onApproveList = () => {
    if (selectedRowKeys.length <= 0) {
      message.config({ duration: 2.0, maxCount: 1 });
      message.error(AppConstants.selectOneClearance);
      return;
    }
    const pendingItems = getPendingClearances(selectedRowKeys);
    if (pendingItems.length <= 0) {
      message.config({ duration: 2.0, maxCount: 1 });
      message.error(AppConstants.noUpdatableClearaces);
      return;
    }

    const selectedIdList = pendingItems.map(c => c.clearanceId);
    setApprovalData({
      showApprovalModal: true,
      clearanceIdList: selectedIdList,
      status: ClearanceStatusRefId.Approved,
    });
  };

  const onDeclineList = () => {
    if (selectedRowKeys.length <= 0) {
      message.config({ duration: 2.0, maxCount: 1 });
      message.error(AppConstants.selectOneClearance);
      return;
    }
    const pendingItems = getPendingClearances(selectedRowKeys);
    if (pendingItems.length <= 0) {
      message.config({ duration: 2.0, maxCount: 1 });
      message.error(AppConstants.noUpdatableClearaces);
      return;
    }

    const selectedIdList = pendingItems.map(c => c.clearanceId);
    setSelectedClearanceIds(selectedIdList);
    setShowDeclineConfirmPopup(true);
  };

  const dropdownView = () => {
    const { competitions } = clearanceState;
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.year}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  value={yearRefId}
                  onChange={e => onChangeYearRefId(e)}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {yearList.map(item => (
                    <Option key={`year_${item.id}`} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.competition}:`}</span>
                <Select
                  className="year-select reg-filter-select-competition ml-2"
                  value={filter.competitionId}
                  defaultValue={filter.competitionId}
                  onChange={e => updateFilter('competitionId', e)}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(competitions || []).map(item => (
                    <Option key={`competition_${item.id}`} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.clearanceStatus}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  value={filter.clearanceStatusRefId}
                  onChange={e => updateFilter('clearanceStatusRefId', e)}
                  disabled={!!filter.pendingCurrentOrganisation}
                >
                  {ClearanceStatusRefs.map(g => (
                    <Option key={`statusRef_${g.id}`} value={g.id}>
                      {g.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="col-sm pb-3">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{`${AppConstants.approvalStatus}:`}</span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  value={filter.approvalStatus}
                  onChange={e => onApprovalStatusChange(e)}
                  disabled={!!filter.pendingCurrentOrganisation}
                >
                  {ApprovalStatusRefs.map(g => (
                    <Option key={`statusRef_${g.id}`} value={g.id}>
                      {g.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="d-flex align-items-center" style={{ marginRight: '1%' }}>
              <div className="d-flex flex-row-reverse button-with-search pb-3">
                <Button className="primary-add-comp-form" type="primary" onClick={onExport}>
                  <div className="row">
                    <div className="col-sm">
                      <img src={AppImages.export} alt="" className="export-image" />
                      {AppConstants.export}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tableSort = key => {
    let updatedSortBy = key;
    let updatedSortOrder = null;
    if (sortBy !== key) {
      updatedSortOrder = 'ASC';
    } else if (sortBy === key && sortOrder === 'ASC') {
      updatedSortOrder = 'DESC';
    } else if (sortBy === key && sortOrder === 'DESC') {
      updatedSortBy = updatedSortOrder = null;
    }
    setSortBy(updatedSortBy);
    setSortOrder(updatedSortOrder);
  };

  const listeners = key => ({
    onClick: () => tableSort(key),
  });

  const getClearanceStatusView = record => {
    const { clearanceStatus, approvalStatus, autoApprovalRefId } = record;

    //If it is organiser, this user can update status.
    if (record.toRegisteringOrgId === getOrganisationId()) {
      //CM-5099 - Ability to update Clearance
      let changable = false;
      switch (clearanceStatus) {
        case ClearanceStatusRefId.Pending:
          changable = true;
          break;

        case ClearanceStatusRefId.Required:
          changable =
            (approvalStatus === ClearanceStatusRefId.Approved &&
              autoApprovalRefId === AutoApprovalRefId.Approved7Days) ||
            (approvalStatus !== ClearanceStatusRefId.Approved &&
              approvalStatus !== ClearanceStatusRefId.Declined);
          break;

        case ClearanceStatusRefId.NotRequired:
          changable =
            approvalStatus === ClearanceStatusRefId.Pending ||
            (approvalStatus === ClearanceStatusRefId.Approved &&
              autoApprovalRefId === AutoApprovalRefId.NoApprovalRequired);
          break;
        case ClearanceStatusRefId.ITC_Required:
          changable = false;
          break;
      }
      if (changable) {
        return (
          <Select
            className="w-100"
            value={clearanceStatus}
            onChange={e => handleClearanceStatus(record.clearanceId, e)}
          >
            <Option value={ClearanceStatusRefId.Pending} disabled>
              {AppConstants.pending}
            </Option>
            <Option value={ClearanceStatusRefId.Required}>{AppConstants.required}</Option>
            <Option value={ClearanceStatusRefId.NotRequired}>{AppConstants.notRequired}</Option>
          </Select>
        );
      }
    }
    return <>{getClearanceStatusText(clearanceStatus)}</>;
  };

  const getApprovalStatusView = record => {
    //It is not requested yet.
    if (!record.clearanceDate) {
      return <></>;
    }
    //If it is organiser, this user can update status.
    if (true) {
      //approvalStatus === ClearanceStatusRefId.Pending
      if (record.fromRegisteringOrgId === getOrganisationId()) {
        const autoApprovedId = getAutoApprovedId(record);
        const approvalStatus = record.approvalStatus;
        const disabled = autoApprovedId || [ClearanceStatusRefId.Approved].includes(approvalStatus);
        const autoApprovalOptions = [
          { value: Approved7Days, name: AppConstants.approved_7days, disabled: true },
          { value: ApprovedAutomatic, name: AppConstants.approved_automatic, disabled: true },
        ];

        return (
          <Select
            disabled={disabled}
            className="w-100"
            value={autoApprovedId ? autoApprovedId : approvalStatus}
            onChange={e => handleApprovalStatus(record.clearanceId, e)}
          >
            <Option value={ClearanceStatusRefId.Pending} disabled={true}>
              {AppConstants.pending}
            </Option>
            {autoApprovedId ? (
              autoApprovalOptions.map((opt, idx) => (
                <Option key={`automatic_opt_${idx}`} value={opt.value} disabled={opt.disabled}>
                  {opt.name}
                </Option>
              ))
            ) : (
              <Option value={ClearanceStatusRefId.Approved}>{AppConstants.approved}</Option>
            )}
            <Option value={ClearanceStatusRefId.Declined}>{AppConstants.declined}</Option>
          </Select>
        );
      }
    }
    return <>{getApprovalStatusText(record)}</>;
  };

  const getApprovalStatusText = record => {
    if (getAutoApprovedId(record) === Approved7Days) {
      return AppConstants.approved_7days;
    } else if (getAutoApprovedId(record) === ApprovedAutomatic) {
      return AppConstants.approved_automatic;
    }
    /*if (record.autoApprovalRefId === AutoApprovalRefId.NoApprovalRequired) {
      return '';
    }*/
    const status = ApprovalStatusRefs.find(i => i.id === Number(record.approvalStatus));
    return status ? status.name : '';
  };

  const getAutoApprovedId = record => {
    const approved7Days =
      record.approvalStatus === ClearanceStatusRefId.Approved &&
      Number(record.autoApprovalRefId) === AutoApprovalRefId.Approved7Days;
    const approvedAutomatic =
      record.approvalStatus === ClearanceStatusRefId.Approved &&
      Number(record.autoApprovalRefId) === AutoApprovalRefId.NoApprovalRequired;
    return approved7Days ? Approved7Days : approvedAutomatic ? ApprovedAutomatic : null;
  };

  const selectImage = (e, record) => {
    if (isNotNullOrEmptyString(record.photoUrl)) {
      return;
    }

    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      setCurClearance(record);
      fileInput.click();
    }
  };

  const setImage = (data, record) => {
    if (data.files[0] !== undefined) {
      let file = data.files[0];
      let extension = file.name.split('.').pop().toLowerCase();
      let imageSizeValid = isImageSizeValid(file.size);
      let isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }

      dispatch(
        saveRegistrationClearances({
          clearanceId: record.clearanceId,
          externalUserId: '',
          userId: record.userId,
          photoUrl: data.files[0],
        }),
      );
    }
  };

  const formatDate = createdOn => {
    return moment(createdOn).isValid()
      ? moment(createdOn).format('DD/MM/YYYY')
      : createdOn
      ? createdOn
      : 'N/A';
  };

  const handlechangeApprover = record => {
    dispatch(
      getPastRegForClearanceAction({ userId: record.userId, createdOn: record.current.createdOn }),
    );

    const userId = record.userId;
    const registrationId = record.previous?.registrationId;
    const approvingOrgId = record.previous?.approvingOrgId;
    const competitionId = record.previous?.competitionId;
    const createdOn = record.previous?.createdOn;

    const selectedRowKey = createClearanceApprovalKey(
      userId,
      registrationId,
      approvingOrgId,
      competitionId,
    );
    const selectedRow = {
      userId,
      registrationId,
      approvingOrgId,
      competitionId,
      createdOn,
    };
    setApproverSelectionData({
      selectedRowKeys: [selectedRowKey],
      selectedRows: [selectedRow],
      record: record,
    });
    setshowApproverModal(true);
  };

  const footballColumns = [
    {
      children: [
        {
          title: AppConstants.participant,
          dataIndex: 'userName',
          key: 'userName',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (userName, record) => (
            <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
              <span className="input-heading-add-another pt-0">{userName}</span>
            </NavLink>
          ),
        },
      ],
    },
    {
      title: AppConstants.currentRegistration,
      children: [
        {
          title: AppConstants.externalID,
          dataIndex: 'externalUserId',
          key: 'externalUserId',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => (
            <div style={{ minWidth: 80 }}>
              <span>{record.externalUserId}</span>
            </div>
          ),
        },
        {
          title: AppConstants.photo,
          dataIndex: 'photoUrl',
          key: 'photoUrl',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => (
            <div>
              <div onClick={e => selectImage(e, record)}>
                <label>
                  <img
                    src={record.photoUrl ? record.photoUrl : AppImages.circleImage}
                    alt=""
                    height={'50'}
                    width={'50'}
                    name="image"
                  />
                </label>
              </div>
              <input
                type="file"
                id="user-pic"
                className="d-none"
                onChange={evt => setImage(evt.target, curClearance)}
                onClick={event => {
                  event.target.value = null;
                }}
              />
            </div>
          ),
        },
        {
          title: AppConstants.dateRegistered,
          dataIndex: 'createdOn',
          key: 'createdOn',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{formatDate(record.current?.createdOn)}</div>,
        },
        {
          title: AppConstants.affiliate,
          dataIndex: 'affiliate',
          key: 'affiliate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.affiliate}</div>,
        },
        {
          title: AppConstants.competitionOrganiser,
          dataIndex: 'organiser',
          key: 'organiser',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.organiser}</div>,
        },
        {
          title: AppConstants.competition,
          dataIndex: 'competition',
          key: 'competition',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.competition}</div>,
        },
      ],
    },
    {
      title: AppConstants.previousRegistration,
      children: [
        {
          title: AppConstants.dateRegistered,
          dataIndex: 'pCreatedOn',
          key: 'pCreatedOn',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{formatDate(record.previous?.createdOn)}</div>,
        },
        {
          title: AppConstants.affiliate,
          dataIndex: 'pAffiliate',
          key: 'pAffiliate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.affiliate}</div>,
        },
        {
          title: AppConstants.competitionOrganiser,
          dataIndex: 'pOrganiser',
          key: 'pOrganiser',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.organiser}</div>,
        },
        {
          title: AppConstants.competition,
          dataIndex: 'pCompetition',
          key: 'pCompetition',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.competition}</div>,
        },
        {
          title: AppConstants.clearance,
          dataIndex: 'clearanceStatus',
          key: 'clearanceStatus',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (clearanceStatus, record) => getClearanceStatusView(record),
        },
        {
          title: AppConstants.date,
          dataIndex: 'clearanceDate',
          key: 'clearanceDate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: clearanceDate => (
            <div>{clearanceDate ? moment(clearanceDate).format('DD/MM/YYYY') : ''}</div>
          ),
        },
      ],
    },
    {
      children: [
        {
          title: AppConstants.approval,
          dataIndex: 'statusRefId',
          key: 'statusRefId',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (statusRefId, record) => getApprovalStatusView(record),
        },
        {
          title: AppConstants.date,
          dataIndex: 'approvalDate',
          key: 'approvalDate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: approvalDate => (
            <div>{approvalDate ? moment(approvalDate).format('DD/MM/YYYY') : ''}</div>
          ),
        },
      ],
    },
  ];

  const columns = [
    {
      children: [
        {
          title: AppConstants.participant,
          dataIndex: 'userName',
          key: 'userName',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (userName, record) => (
            <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
              <span className="input-heading-add-another pt-0">{userName}</span>
            </NavLink>
          ),
        },
      ],
    },
    {
      title: AppConstants.currentRegistration,
      children: [
        {
          title: AppConstants.dateRegistered,
          dataIndex: 'createdOn',
          key: 'createdOn',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{formatDate(record.current?.createdOn)}</div>,
        },
        {
          title: AppConstants.affiliate,
          dataIndex: 'affiliate',
          key: 'affiliate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.affiliate}</div>,
        },
        {
          title: AppConstants.competitionOrganiser,
          dataIndex: 'organiser',
          key: 'organiser',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.organiser}</div>,
        },
        {
          title: AppConstants.competition,
          dataIndex: 'competition',
          key: 'competition',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.current?.competition}</div>,
        },
      ],
    },
    {
      title: AppConstants.previousRegistration,
      children: [
        {
          title: AppConstants.dateRegistered,
          dataIndex: 'pCreatedOn',
          key: 'pCreatedOn',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{formatDate(record.previous?.createdOn)}</div>,
        },
        {
          title: AppConstants.affiliate,
          dataIndex: 'pAffiliate',
          key: 'pAffiliate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.affiliate}</div>,
        },
        {
          title: AppConstants.competitionOrganiser,
          dataIndex: 'pOrganiser',
          key: 'pOrganiser',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.organiser}</div>,
        },
        {
          title: AppConstants.competition,
          dataIndex: 'pCompetition',
          key: 'pCompetition',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (item, record) => <div>{record.previous?.competition}</div>,
        },
        {
          title: AppConstants.clearance,
          dataIndex: 'clearanceStatus',
          key: 'clearanceStatus',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (clearanceStatus, record) => getClearanceStatusView(record),
        },
        {
          title: AppConstants.date,
          dataIndex: 'clearanceDate',
          key: 'clearanceDate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: clearanceDate => (
            <div>{clearanceDate ? moment(clearanceDate).format('DD/MM/YYYY') : ''}</div>
          ),
        },
      ],
    },
    {
      children: [
        {
          title: AppConstants.approval,
          dataIndex: 'statusRefId',
          key: 'statusRefId',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (statusRefId, record) => getApprovalStatusView(record),
        },
        {
          title: AppConstants.date,
          dataIndex: 'approvalDate',
          key: 'approvalDate',
          sorter: true,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: approvalDate => (
            <div>{approvalDate ? moment(approvalDate).format('DD/MM/YYYY') : ''}</div>
          ),
        },
      ],
    },
    {
      children: [
        {
          title: AppConstants.action,
          dataIndex: 'userId',
          key: 'userId',
          sorter: false,
          onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
          render: (statusRefId, record) => {
            const { organisationId = 0 } = getOrganisationData() || {};
            const isNotToRegOrg = record.current?.approvingOrgId !== organisationId;
            const alwaysRequireClearance =
              record.clearanceTypeRefId === ClearanceTypeRefId.AlwaysRequire;
            const noPrevReg = !record.previous.competitionId;
            const disabled = isNotToRegOrg || alwaysRequireClearance || noPrevReg;
            return disabled ? null : (
              <>
                <Menu
                  className="action-triple-dot-submenu"
                  theme="light"
                  mode="horizontal"
                  style={{ lineHeight: '25px' }}
                >
                  <SubMenu
                    key="sub1"
                    title={
                      <img
                        className="dot-image"
                        src={AppImages.moreTripleDot}
                        alt=""
                        width="16"
                        height="16"
                      />
                    }
                  >
                    <>
                      <Menu.Item
                        key="1"
                        disabled={disabled}
                        onClick={() => handlechangeApprover(record)}
                      >
                        <span>{AppConstants.updateClearanceOrganisation}</span>
                      </Menu.Item>
                    </>
                  </SubMenu>
                </Menu>
              </>
            );
          },
        },
      ],
    },
  ];

  const approverColumns = [
    {
      title: AppConstants.affiliate,
      dataIndex: 'approvingOrgName',
      key: 'approvingOrgName',
      sorter: false,
      render: (approvingOrgName, record) => {
        return <span>{approvingOrgName}</span>;
      },
    },
    {
      title: AppConstants.competition,
      dataIndex: 'competitionName',
      key: 'competitionName',
      sorter: false,
      render: (competitionName, record) => {
        return <span>{competitionName}</span>;
      },
    },
    {
      title: AppConstants.competitionOrganiser,
      dataIndex: 'compCreatorName',
      key: 'compCreatorName',
      sorter: false,
      render: (compCreatorName, record) => {
        return <span>{compCreatorName}</span>;
      },
    },
    {
      title: AppConstants.dateRegistered,
      dataIndex: 'createdOn',
      key: 'createdOn',
      sorter: false,
      render: (createdOn, record) => {
        return <span>{moment(createdOn).format('DD/MM/YYYY')}</span>;
      },
    },
  ];

  const approverRowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setApproverSelectionData({ ...approverSelectionData, selectedRowKeys, selectedRows });
    },
    selectedRowKeys: approverSelectionData.selectedRowKeys,
    type: 'radio',
  };

  const handlechangeApproverOk = () => {
    const newData = approverSelectionData.selectedRows[0];
    const oldData = approverSelectionData.record.previous;
    if (!newData || !oldData) {
      return;
    }
    dispatch(
      changeClearanceApproverAction({
        newApprovalData: approverSelectionData.selectedRows[0],
        prevApprovalId: oldData.id,
      }),
    );
    setApproverSelectionData(InitialApproverSelectionData);
    setshowApproverModal(false);
  };

  const handlechangeApproverCancel = () => {
    setApproverSelectionData(InitialApproverSelectionData);
    setshowApproverModal(false);
  };

  const approverModalCurrRegContent = record => {
    return (
      <>
        <div className="mb-3">
          <span
            style={{ fontWeight: 500, fontSize: '15px' }}
          >{`${AppConstants.currentRegistration}:`}</span>
        </div>
        <div className="grid-cols-2-fit-content gap-x-6 mb-5">
          <label className="year-select-heading">{`${startCase(AppConstants.player)}:`}</label>
          <span className="modal-txt pb-3">{record.userName}</span>

          <label className="year-select-heading">{`${AppConstants.affiliate}:`}</label>
          <span className="modal-txt">{record.current.affiliate}</span>
          <label className="year-select-heading">{`${AppConstants.competition}:`}</label>
          <span className="modal-txt">{record.current.competition}</span>
          <label className="year-select-heading">{`${AppConstants.competitionOrganiser}:`}</label>
          <span className="modal-txt">{record.current.organiser}</span>
          <label className="year-select-heading">{`${AppConstants.dateRegistered}:`}</label>
          <span className="modal-txt">{formatDate(record.current.createdOn)}</span>
        </div>
      </>
    );
  };

  const approverModalTable = (
    <div className="mb-4">
      <div className="mb-2">
        <span
          style={{ fontWeight: 500, fontSize: '15px' }}
        >{`${AppConstants.previousRegistration}:`}</span>
      </div>

      <Table
        size={'small'}
        className={'modal-table-small'}
        columns={approverColumns}
        dataSource={pastRegistrations}
        rowSelection={approverRowSelection}
        loading={pastRegLoad}
        rowKey={(record, idx) => record.key}
        scroll={{ x: true, y: '312px' }}
        pagination={false}
      />
    </div>
  );

  const changeApproverModal = () => {
    const { record } = approverSelectionData;
    if (!record) {
      return null;
    }

    let curr_key = createClearanceApprovalKey(
      record.userId,
      record.previous.registrationId,
      record.previous.approvingOrgId,
      record.previous.competitionId,
      record.previous.createdOn,
    );
    let selectedRowKey = approverSelectionData.selectedRowKeys.length
      ? approverSelectionData.selectedRowKeys[0]
      : '';
    const disableOk = curr_key === selectedRowKey;

    return (
      <Modal
        visible={showApproverModal}
        title={AppConstants.changeApprover}
        onOk={handlechangeApproverOk}
        okButtonProps={{ disabled: disableOk }}
        onCancel={handlechangeApproverCancel}
        closable={false}
        maskClosable={false}
        width={'712px'}
      >
        <>
          {approverModalCurrRegContent(record)}
          {approverModalTable}
        </>
      </Modal>
    );
  };

  const contentView = () => {
    const { clearanceListData, pagination } = clearanceState;
    const organisationId = getOrganisationId();

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: keys => setSelectedRowKeys(keys),
              getCheckboxProps: record => {
                const disabled =
                  record.fromRegisteringOrgId !== organisationId ||
                  record.approvalStatus === ClearanceStatusRefId.Approved;
                return { disabled };
              },
            }}
            className="home-dashboard-table"
            columns={isFootball ? footballColumns : columns}
            dataSource={clearanceListData}
            pagination={false}
            rowKey={record => record.clearanceId}
            onHeaderCell={({ dataIndex }) => {
              return {
                onClick: () => tableSort(dataIndex),
              };
            }}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination action-box-pagination"
            showSizeChanger
            current={pagination.page}
            defaultCurrent={pagination.page}
            defaultPageSize={pagination.size}
            total={pagination.totalCount}
            onChange={onChangePage}
          />
        </div>
      </div>
    );
  };

  const declineRegistrationConfirmPopup = () => (
    <div>
      <Modal
        className="add-membership-type-modal"
        title={AppConstants.confirm}
        visible={showDeclineConfirmPopup}
        onCancel={() => setShowDeclineConfirmPopup(false)}
        footer={[
          <Button onClick={() => setShowDeclineConfirmPopup(false)}>{AppConstants.no}</Button>,
          <Button
            onClick={() => {
              handleDeclineRequest(selectedClearanceIds);
              setShowDeclineConfirmPopup(false);
            }}
          >
            {AppConstants.yes}
          </Button>,
        ]}
      >
        <p>{AppConstants.declineRegistrationConfirm}</p>
      </Modal>
    </div>
  );

  const handleConfirmApproval = () => {
    updateApprovalStatus(approvalData.clearanceIdList, approvalData.status);
    setApprovalData(INITAL_APPROVAL_DATA);
    setSelectedRowKeys([]);
  };
  const handleCancelApproval = () => {
    setApprovalData(INITAL_APPROVAL_DATA);
  };
  const acceptConfirmModal = () => (
    <div>
      <ConfirmModal
        visible={approvalData.showApprovalModal}
        title={AppConstants.confirmApproval}
        confirmText={AppConstants.confirm}
        content={AppConstants.clearanceApprovalMsg}
        onOk={() => handleConfirmApproval()}
        onCancel={() => handleCancelApproval()}
        okText={AppConstants.ok}
      />
    </div>
  );

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout
        menuHeading={AppConstants.registration}
        menuName={AppConstants.registration}
      />
      <InnerHorizontalMenu menu="registration" regSelectedKey="11" />
      <Layout>
        {headerView()}
        {statusView()}
        <Content>
          <Loader
            visible={
              clearanceState.onLoad ||
              clearanceState.onLoadCompetition ||
              clearanceState.changeApproverLoad
            }
          />
          {changeApproverModal()}
          {dropdownView()}
          {contentView()}
          {declineRegistrationConfirmPopup()}
          {acceptConfirmModal()}
        </Content>
      </Layout>
    </div>
  );
};

export default RegistrationClearances;

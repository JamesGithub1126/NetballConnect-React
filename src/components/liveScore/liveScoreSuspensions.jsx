import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Breadcrumb, Menu, Table, Select, Input, Pagination, DatePicker, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { SuspenedMatchStatusRefId } from 'enums/enums';
import AppConstants from 'themes/appConstants';
import AppImages from '../../themes/appImages';
import { getGlobalYear } from 'util/sessionStorage';
import { useOrganisation } from 'customHooks/hooks';
import history from 'util/history';
import {
  liveScoreSuspensionListAction,
  liveScoreSuspensionTypeListAction,
  liveScoreSuspensionSetFilterAction,
  liveScoreSuspensionUpdateFilter,
  liveScoreSuspensionSetSelectedAction,
} from '../../store/actions/LiveScoreAction/liveScoreSuspensionAction';
import { getAffiliateToOrganisationAction } from '../../store/actions/userAction/userAction';
import { innerHorizontalCompetitionListAction } from '../../store/actions/LiveScoreAction/liveScoreInnerHorizontalAction';
import {
  IncidentPlayerFirstName,
  IncidentPlayerLastName,
} from '../shared/incidents/IncidentPlayerName';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import LiveScoreSelectMatches from './liveScoreSelectMatches';

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;

const SuspensionStatusList = [
  { id: 1, name: AppConstants.completed },
  { id: 2, name: AppConstants.inProgress },
  { id: 3, name: AppConstants.yetToAllocate },
];

const HeaderView = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState(null);

  const updateFilter = searchText => {
    dispatch(liveScoreSuspensionUpdateFilter('searchText', searchText));
  };

  const onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      updateFilter(searchText);
    }
  };

  const onChangeSearchText = async e => {
    const { value } = e.target;
    setSearchText(value);
    if (!value) {
      updateFilter(value);
    }
  };

  const onClickSearchIcon = async () => {
    updateFilter(searchText);
  };

  return (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.suspensionActivity}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm search-flex mr-4">
          <div className="row">
            <div className="reg-product-search-inp-width">
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
    </div>
  );
};

const StatusView = ({ onClose }) => {
  return (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="row mt-2 mb-4">
        <div className="col-sm-12">
          <Tag closable color="volcano" style={{ paddingTop: 3, height: 30 }} onClose={onClose}>
            {AppConstants.pendingCurrentSuspension}
          </Tag>
        </div>
      </div>
    </div>
  );
};

const SelectDate = ({ title, ...props }) => {
  return (
    <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
      <div className="year-select-heading">{title}</div>
      <DatePicker
        size="default"
        className="year-select reg-filter-select"
        format="DD-MM-YYYY"
        placeholder="dd-mm-yyyy"
        showTime={false}
        {...props}
      />
    </div>
  );
};

const SelectBox = ({ title, options, ...props }) => {
  return (
    <div className="reg-filter-col-cont">
      <div className="year-select-heading">{title}</div>
      <Select
        showSearch
        optionFilterProp="children"
        className="year-select reg-filter-select"
        style={{ minWidth: 100 }}
        {...props}
      >
        <Option key={-1} value={-1}>
          {AppConstants.all}
        </Option>
        {(options || []).map((item, index) => (
          <Option key={index} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

const DropDownView = ({ organisation, disabled }) => {
  const dispatch = useDispatch();
  const { yearList, filter } = useSelector(state => state.LiveScoreSuspensionState);
  const { competitionList } = useSelector(state => state.InnerHorizontalState);
  const { affiliateTo } = useSelector(state => state.UserState);
  const { organisationId, name: organisationName, organisationUniqueKey } = organisation;

  const affiliateList = useMemo(() => {
    if (affiliateTo && affiliateTo.affiliatedTo !== undefined) {
      const uniqueValues = [];
      const obj = {
        organisationId: organisationUniqueKey,
        name: organisationName,
      };
      uniqueValues.push(obj);
      return [...uniqueValues, ...affiliateTo.affiliatedTo].map(i => ({
        id: i.organisationId,
        name: i.name,
      }));
    }
    return [];
  }, [affiliateTo, organisationName, organisationUniqueKey]);

  useEffect(() => {
    if (filter.yearRefId && organisationId) {
      dispatch(innerHorizontalCompetitionListAction(organisationId, filter.yearRefId, []));
    }
  }, [dispatch, filter.yearRefId, organisationId]);

  const onChangeFilter = useCallback(
    (value, key) => {
      dispatch(liveScoreSuspensionUpdateFilter(key, value));
    },
    [dispatch, filter],
  );

  return (
    <div className="comp-player-grades-header-view-design">
      <div className="fluid-width">
        <div className="row reg-filter-row">
          <div className="reg-col col-lg-3 col-md-5">
            <SelectBox
              title={AppConstants.year}
              value={filter.yearRefId}
              options={(yearList || []).map(i => ({ id: i.id, name: i.description }))}
              onChange={value => onChangeFilter(value, 'yearRefId')}
              disabled={disabled}
            ></SelectBox>
          </div>

          <div className="reg-col col-lg-3 col-md-5"></div>
          <div className="reg-col col-lg-3 col-md-5"></div>
          <div className="reg-col col-lg-3 col-md-5">
            <SelectBox
              title={AppConstants.status}
              options={SuspensionStatusList}
              value={filter.servedStatusRefId}
              onChange={e => onChangeFilter(e, 'servedStatusRefId')}
              disabled={disabled}
            ></SelectBox>
          </div>
        </div>
        <div className="row reg-filter-row">
          <div className="reg-col col-lg-3 col-md-7">
            <SelectBox
              title={AppConstants.competition}
              options={(competitionList || []).map(i => ({
                id: i.uniqueKey,
                name: i.name,
              }))}
              value={filter.competitionUniqueKey}
              onChange={e => onChangeFilter(e, 'competitionUniqueKey')}
              disabled={disabled}
            ></SelectBox>
          </div>
          <div className="reg-col col-lg-3 col-md-5">
            <SelectBox
              title={AppConstants.affiliate}
              options={affiliateList}
              value={filter.affiliate}
              onChange={e => onChangeFilter(e, 'affiliate')}
              disabled={disabled}
            ></SelectBox>
          </div>
          <div className="reg-col col-lg-3 col-md-5">
            <SelectDate
              title={AppConstants.suspFrom}
              name="suspendedFrom"
              value={filter.suspendedFrom ? moment(filter.suspendedFrom, 'YYYY-MM-DD') : ''}
              onChange={e => onChangeFilter(e, 'suspendedFrom')}
              disabled={disabled}
            ></SelectDate>
          </div>
          <div className="reg-col col-lg-3 col-md-7">
            <SelectDate
              title={AppConstants.suspTo}
              name="suspendedTo"
              value={filter.suspendedTo ? moment(filter.suspendedTo, 'YYYY-MM-DD') : ''}
              onChange={e => onChangeFilter(e, 'suspendedTo')}
              disabled={disabled}
            ></SelectDate>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountBox = ({ title, value }) => {
  return (
    <div className="registration-count">
      <div className="reg-payment-paid-reg-text">{title}</div>
      <div className="reg-payment-price-text">{value}</div>
    </div>
  );
};

const CountBoxView = () => {
  const { suspensionSummary: summary } = useSelector(state => state.LiveScoreSuspensionState);

  return (
    <div className="comp-dash-table-view mt-2">
      <div>
        <div className="row">
          <div className="col-sm-3">
            <CountBox title={AppConstants.matchesServed} value={summary.matchesServed}></CountBox>
          </div>
          <div className="col-sm-3">
            <CountBox
              title={AppConstants.matchesAllocatedStillServed}
              value={summary.matchesAllocatedStillServed}
            ></CountBox>
          </div>
          <div className="col-sm-3">
            <CountBox
              title={AppConstants.matchesAllocated}
              value={summary.matchesAllocated}
            ></CountBox>
          </div>
          <div className="col-sm-3">
            <CountBox
              title={AppConstants.suspensionsRequiring}
              value={summary.suspensionsRequiringReview}
            ></CountBox>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableView = () => {
  const dispatch = useDispatch();
  const { onLoad, onLoadMatches, suspensionList, filter, pagination, selectedSuspension } =
    useSelector(state => state.LiveScoreSuspensionState);
  const { competitionList } = useSelector(state => state.InnerHorizontalState);
  const [showSelectMatches, setShowSelectMatches] = useState(false);

  const listeners = key => ({
    onClick: () => {
      let sortBy = key;
      let sortOrder = null;
      if (filter.sortBy !== key) {
        sortOrder = 'ASC';
      } else if (filter.sortBy === key && filter.sortOrder === 'ASC') {
        sortOrder = 'DESC';
      } else if (filter.sortBy === key && filter.sortOrder === 'DESC') {
        sortBy = sortOrder = null;
      }
      dispatch(
        liveScoreSuspensionSetFilterAction({
          ...filter,
          sortBy,
          sortOrder,
        }),
      );
    },
  });

  const handlePageChanged = (currentPage, pageSize) => {
    dispatch(
      liveScoreSuspensionSetFilterAction({
        ...filter,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      }),
    );
  };

  const dateFormat = date => {
    return date ? moment(date).format('DD/MM/YYYY') : '';
  };

  const handleClickPlayerName = userId => {
    history.push('/userPersonal', {
      userId,
      screenKey: 'livescore',
      screen: '/matchDaySuspensions',
    });
  };

  const openSelectMatchesDialog = record => {
    dispatch(liveScoreSuspensionSetSelectedAction(record));
    setShowSelectMatches(true);
  };

  const columns = [
    {
      title: AppConstants.dateSuspended,
      dataIndex: 'created_at',
      key: 'dateSuspended',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: dateSuspended => <div>{dateFormat(dateSuspended)}</div>,
    },
    {
      title: AppConstants.userId,
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: AppConstants.firstName,
      key: 'firstName',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => (
        <IncidentPlayerFirstName
          incident={record.incident}
          onClick={handleClickPlayerName}
        ></IncidentPlayerFirstName>
      ),
    },
    {
      title: AppConstants.lastName,
      key: 'lastName',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => (
        <IncidentPlayerLastName
          incident={record.incident}
          onClick={handleClickPlayerName}
        ></IncidentPlayerLastName>
      ),
    },
    {
      title: AppConstants.suspension,
      key: 'suspension',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => {
        const { suspendedMatches, suspendedFrom, suspendedTo } = record;
        let value = '';
        if (suspendedMatches) {
          value = `${suspendedMatches} matches`;
        } else if (suspendedFrom && suspendedTo) {
          value = `${dateFormat(suspendedFrom)} ~ ${dateFormat(suspendedTo)}`;
        } else if (suspendedTo) {
          value = `Till ${dateFormat(suspendedTo)}`;
        }
        return <span>{value}</span>;
      },
    },
    {
      title: AppConstants.matchesServed,
      key: 'matchesServed',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const matches = suspendedMatchList?.filter(
            i => i.servedStatusRefId === SuspenedMatchStatusRefId.ServedYes,
          );
          return <span>{matches ? matches.length : 0}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
    {
      title: AppConstants.matchesAllocatedStillServed,
      key: 'matchesAllocatedStillServed',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const matches = suspendedMatchList?.filter(
            i => i.servedStatusRefId === SuspenedMatchStatusRefId.Pending,
          );
          return <span>{matches ? matches.length : 0}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
    {
      title: AppConstants.matchesAllocated,
      key: 'matchesAllocated',
      sorter: true,
      onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
      render: record => {
        const { suspendedMatches, suspendedMatchList } = record;
        if (suspendedMatches) {
          const suspended = suspendedMatchList ? suspendedMatchList.length : 0;
          return <span>{suspendedMatches - suspended}</span>;
        } else {
          return <span>{AppConstants.noValue}</span>;
        }
      },
    },
    {
      title: AppConstants.action,
      key: 'isUsed',
      render: record => {
        return (
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
                  width="16"
                  height="16"
                  alt=""
                />
              }
            >
              <Menu.Item
                key="1"
                onClick={() => openSelectMatchesDialog(record)}
                disabled={!record.suspendedMatches}
              >
                <span>{AppConstants.selectMatches}</span>
              </Menu.Item>
            </SubMenu>
          </Menu>
        );
      },
    },
  ];

  return (
    <div className="comp-dash-table-view mt-2">
      <div className="table-responsive home-dash-table-view">
        <Table
          className="home-dashboard-table"
          columns={columns}
          rowKey={record => record.id}
          dataSource={suspensionList}
          pagination={false}
          loading={onLoad || onLoadMatches}
        />
      </div>
      <div className="d-flex justify-content-end">
        <Pagination
          className="antd-pagination"
          showSizeChanger
          current={pagination.currentPage}
          defaultCurrent={pagination.currentPage}
          defaultPageSize={pagination.pageSize}
          total={pagination.totalCount}
          onChange={handlePageChanged}
        />
      </div>
      <LiveScoreSelectMatches
        suspension={selectedSuspension}
        competitionList={competitionList}
        visible={!!showSelectMatches}
        width={1200}
        onCancel={() => setShowSelectMatches(false)}
      ></LiveScoreSelectMatches>
    </div>
  );
};

const LiveScoreSuspensions = () => {
  const dispatch = useDispatch();
  const { filter } = useSelector(state => state.LiveScoreSuspensionState);
  const organisation = useOrganisation();
  const { organisationUniqueKey } = organisation;
  const [pendingSuspension, setPendingSuspension] = useState(
    history.location.state? history.location.state.pendingSuspension : false
  );

  useEffect(() => {
    dispatch(liveScoreSuspensionTypeListAction());
    if (organisationUniqueKey) {
      dispatch(getAffiliateToOrganisationAction(organisationUniqueKey));
      dispatch(liveScoreSuspensionUpdateFilter('organisationUniqueKey', organisationUniqueKey));
    }
  }, [dispatch, organisationUniqueKey]);

  useEffect(() => {
    if (filter.yearRefId === undefined) {
      const yearRefId = getGlobalYear() ? Number(getGlobalYear()) : -1;
      dispatch(liveScoreSuspensionUpdateFilter('yearRefId', yearRefId));
      return;
    }
    // Get suspension list
    const payload = { ...filter, pendingSuspension };
    dispatch(liveScoreSuspensionListAction(payload));
  }, [dispatch, filter, pendingSuspension]);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.matchDay} menuName={AppConstants.matchDay} />
      <InnerHorizontalMenu menu="matchDay" userSelectedKey="2" />
      <Layout>
        <HeaderView></HeaderView>
        <Content>
          <Loader visible={false} />
          <DropDownView
            organisation={organisation}
            disabled={pendingSuspension}
          ></DropDownView>
          {!!pendingSuspension && <StatusView onClose={() => setPendingSuspension(false)} />}
          <CountBoxView></CountBoxView>
          <TableView></TableView>
        </Content>
      </Layout>
    </div>
  );
};

export default LiveScoreSuspensions;

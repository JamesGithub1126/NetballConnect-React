import AppConstants from '../../themes/appConstants';
import {
  Button,
  DatePicker,
  Input,
  Layout,
  message,
  Pagination,
  Select,
  Table,
  Tooltip,
} from 'antd';
import React, { useCallback } from 'react';
import {
  getCompetitionData,
  getGlobalYear,
  getOrganisationData,
  setCompDataForAll,
} from '../../util/sessionStorage';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { umpireCompetitionListAction } from '../../store/actions/umpireAction/umpireCompetetionAction';
import { isArrayNotEmpty } from '../../util/helpers';
import {
  getUmpireDashboardCompetitionOrganisationsList,
  getUmpireDashboardVenueList,
} from '../../store/actions/umpireAction/umpireDashboardAction';
import DashboardLayout from '../../pages/dashboardLayout';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { Content } from 'antd/es/layout/layout';
import { getOnlyYearListAction } from '../../store/actions/appAction';
import { combinedAccreditationUmpieCoachRefrence } from '../../store/actions/commonAction/commonAction';
import UmpireAxiosApi from '../../store/http/umpireHttp/umpireAxios';
import moment from 'moment-timezone';
import { NavLink } from 'react-router-dom';
import { debounce } from 'lodash';
import { SPORT } from '../../util/enums';
import AppImages from '../../themes/appImages';

const { Option } = Select;
const { RangePicker } = DatePicker;

const USER_DATE_FORMAT = 'DD-MM-YYYY';

export function UmpireAvailability(props) {
  const [year, setYear] = useState(getGlobalYear() ? JSON.parse(getGlobalYear()) : null);
  const [competitionId, setCompetitionId] = useState(null);
  const [competition, setCompetition] = useState();
  const [compOrganisationId, setCompOrganisationId] = useState('');
  const [venue, setVenue] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [umpireAvailability, setUmpireAvailability] = useState([]);
  const [page, setPage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [[startDate, endDate], setDates] = useState([moment(), moment().add(2, 'week')]);
  const [search, setSearch] = useState('');
  const setSearchDebounced = useCallback(debounce(setSearch, 500), []);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({
    sortBy: 'date',
    sortOrder: 'ASC',
  });

  const dispatch = useDispatch();
  const umpireFilterLoading = useSelector(
    store => store.UmpireCompetitionState.onLoad || store.UmpireDashboardState.onLoad,
  );
  const yearList = useSelector(store => store.AppState.yearList);
  const { umpireAccreditation = [] } = useSelector(store => store.CommonReducerState);
  const compList = useSelector(store => store.UmpireCompetitionState.umpireComptitionList);
  const { umpireVenueList, competitionOrganisationsList } = useSelector(
    store => store.UmpireDashboardState,
  );
  let venueList = isArrayNotEmpty(umpireVenueList) ? umpireVenueList : [];

  const onSort = key => {
    let newSortBy = key;
    let newSortOrder = 'ASC';
    if (sort.sortBy !== key) {
      newSortOrder = 'ASC';
    } else if (sort.sortBy === key && sort.sortOrder === 'ASC') {
      newSortOrder = 'DESC';
    } else if (sort.sortBy === key && sort.sortOrder === 'DESC') {
      newSortBy = 'date';
    }
    setSort({
      sortOrder: newSortOrder,
      sortBy: newSortBy,
    });
  };

  const columns = [
    {
      title: AppConstants.firstName,
      dataIndex: 'firstName',
      width: 200,
      fixed: 'left',
      sorter: true,
      onHeaderCell: () => ({ onClick: () => onSort('firstName') }),
      key: 'firstsName',
      render: (firstName, record) => {
        const { suspended } = record;

        return (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'umpireAvailability',
                screen: '/umpireAvailability',
              },
            }}
          >
            <span className="input-heading-add-another pt-0">
              <span className={suspended ? 'suspended' : ''}>{firstName}</span>
            </span>
          </NavLink>
        );
      },
    },
    {
      title: AppConstants.lastName,
      dataIndex: 'lastName',
      key: 'lastName',
      width: 150,
      fixed: 'left',
      sorter: true,
      onHeaderCell: () => ({ onClick: () => onSort('lastName') }),
      render: (lastName, record) => {
        const { suspended } = record;

        return (
          <NavLink
            to={{
              pathname: '/userPersonal',
              state: {
                userId: record.userId,
                screenKey: 'umpireAvailability',
                screen: '/umpireAvailability',
              },
            }}
          >
            <span className="input-heading-add-another pt-0">
              <span className={suspended ? 'suspended-suffix' : ''}>{lastName}</span>
            </span>
          </NavLink>
        );
      },
    },
    {
      title: AppConstants.date,
      dataIndex: 'date',
      key: 'date',
      width: 150,
      sorter: true,
      fixed: 'left',
      onHeaderCell: () => ({ onClick: () => onSort('date') }),
      render: date => moment(date).format(USER_DATE_FORMAT),
    },
    {
      title: AppConstants.venue,
      dataIndex: 'venueName',
      key: 'venueId',
      width: 200,
      sorter: true,
      fixed: 'left',
      onHeaderCell: () => ({ onClick: () => onSort('venueName') }),
      render: venueName => {
        return venueName ?? 'All';
      },
    },
    {
      title: AppConstants.availability,
      dataIndex: 'timeslots',
      key: item => `${item.userId}-${item.date}-${item.venueId}`,
      render: data => {
        return (
          <div className={'d-flex flex-row align-items-center overflow-x-auto mt-10'}>
            {data.map((slot, index) => {
              let color;
              if (slot.type === 'A') {
                color = 'var(--app-green-bg)';
              } else if (slot.type === 'U') {
                color = 'var(--app-red-bg)';
              } else {
                color = 'var(--app-color)';
              }
              return (
                <div className={'availability-time-container bg-cell'}>
                  { !(index % 2) && <div className={'availability-time-label'}>{slot.startTime}</div>}
                  <Tooltip title={`${slot.startTime} - ${slot.endTime}`}>
                    <div
                      className={'availability-time-slot'}
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  const onChangeComp = competitionId => {
    setCompetitionId(competitionId);
    const competition = compList.find(comp => comp.id == competitionId);
    if (competition) {
      setCompDataForAll(competition);
      setCompetition(competition);
    }
  };

  useEffect(() => {
    if (competitionId) {
      dispatch(getUmpireDashboardVenueList(competitionId));
      dispatch(getUmpireDashboardCompetitionOrganisationsList(competitionId));
    }
  }, [competitionId]);

  useEffect(() => {
    let { organisationId } = getOrganisationData() || {};
    dispatch(getOnlyYearListAction());
    dispatch(combinedAccreditationUmpieCoachRefrence());

    const competition = getCompetitionData();
    const initialYearRef = parseInt(getGlobalYear(), 10);
    const canUseExistingComp =
      !!competition?.id &&
      !!organisationId &&
      competition.yearRefId === initialYearRef &&
      [competition?.competitionOrganisation?.orgId, competition.organisationId].includes(
        organisationId,
      );

    if (canUseExistingComp) {
      setCompetitionId(competition.id);
      setCompetition(competition);
    }
  }, []);

  useEffect(() => {
    let { organisationId } = getOrganisationData() || {};
    if (competitionId && organisationId) {
      (async () => {
        setLoading(true);
        try {
          const {
            result: {
              data: { rows, page },
            },
          } = await UmpireAxiosApi.getUmpirePoolAvailability({
            competitionId,
            organisationId,
            compOrganisationId,
            timezone: moment.tz.guess(),
            limit,
            searchText: search,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder,
            offset,
            startTime: startDate.format('YYYY-MM-DD'),
            endTime: endDate.format('YYYY-MM-DD'),
            venueId: venue,
            accreditation,
          });
          setUmpireAvailability(rows);
          setPage(page);
        } catch (e) {
          message.error('Something went wrong');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [
    competitionId,
    venue,
    accreditation,
    compOrganisationId,
    search,
    startDate,
    endDate,
    limit,
    offset,
    sort,
  ]);

  const onExport = async () => {
    let { organisationId } = getOrganisationData() || {};
    if (competitionId && organisationId) {
      const params = {
        competitionId,
        organisationId,
        compOrganisationId,
        timezone: moment.tz.guess(),
        limit,
        searchText: search,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        offset,
        startTime: startDate.format('YYYY-MM-DD'),
        endTime: endDate.format('YYYY-MM-DD'),
        venueId: venue,
        accreditation,
      };
      await UmpireAxiosApi.umpireAvailabilityExport(params);
    }
  };

  useEffect(() => {
    let { organisationId } = getOrganisationData() || {};
    if (organisationId && year) {
      dispatch(umpireCompetitionListAction(null, year, organisationId, 'USERS'));
    }
  }, [year]);

  const onChangeYear = year => {
    setYear(year);
    setCompDataForAll(null);
  };

  const onPaginationChanged = (page, size) => {
    setOffset((page - 1) * size);
    setLimit(size);
  };

  const headerView = () => (
    <div className="comp-player-grades-header-drop-down-view mt-1">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm pt-1 mb-5 d-flex align-content-center">
            <span className="form-heading">{AppConstants.umpireAvailability}</span>
          </div>

          <div className="col-sm-8 w-100 mb-5 d-flex flex-row align-items-center justify-content-end">
            <div className="col-sm pt-1">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button disabled={!competitionId} className="primary-add-comp-form" type="primary" onClick={onExport}>
                  <div className="row">
                    <div className="col-sm">{AppConstants.export}</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="row reg-filter-row">
          <div className="reg-col1">
            <div className="year-select reg-filter-col-cont">
              <span className="year-select-heading" style={{ width: '180px' }}>
                {AppConstants.year}:
              </span>
              <Select
                className="year-select reg-filter-select-year ml-2"
                onChange={value => onChangeYear(value)}
                value={year}
              >
                {yearList.map(item => (
                  <Option key={'year_' + item.id} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="reg-col1 ml-5">
            <div className="year-select reg-filter-col-cont">
              <div className="year-select-heading" style={{ width: '145px' }}>
                {AppConstants.competition} :
              </div>
              <Select
                className="reg-filter-select1"
                style={{ minWidth: 200 }}
                onChange={competitionId => onChangeComp(competitionId)}
                value={competitionId || ''}
                loading={umpireFilterLoading}
              >
                {!competitionId && <Option value="">All</Option>}
                {compList.map(item => (
                  <Option key={'competition_' + item.id} value={item.id}>
                    {item.longName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="reg-col1 ml-5">
            <div className="reg-filter-col-cont">
              <div className="year-select-heading" style={{ width: '133px' }}>
                {AppConstants.venue} :
              </div>
              <Select
                className="year-select reg-filter-select1"
                onChange={venue => setVenue(venue)}
                value={venue}
                loading={umpireFilterLoading}
              >
                <Option value="">All</Option>
                {venueList.map(item => (
                  <Option key={'venue_' + item.venueId} value={item.venueId}>
                    {item.venueName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="reg-col1 ml-5">
            <div className="reg-filter-col-cont">
              <div className="year-select-heading" style={{ width: '180px' }}>
                {AppConstants.accreditation} :
              </div>
              <Select
                className="year-select reg-filter-select1"
                onChange={accreditation => setAccreditation(accreditation)}
                value={accreditation}
                style={{ minWidth: 200 }}
                loading={umpireFilterLoading}
              >
                <Option value="">All</Option>
                {umpireAccreditation.map(item => (
                  <Option key={'accreditation_' + item.id} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="row mt-10 reg-filter-row">
          <div className="reg-col1">
            <div className="reg-filter-col-cont">
              <div className="year-select-heading" style={{ width: '180px' }}>
                {AppConstants.organisations}:
              </div>
              <Select
                className="year-select reg-filter-select1"
                onChange={organisation => setCompOrganisationId(organisation)}
                value={compOrganisationId}
                style={{ minWidth: 200 }}
                loading={umpireFilterLoading}
              >
                <Option value="">All</Option>
                {competitionOrganisationsList.map(item => (
                  <Option key={'organisation_' + item.id} value={item.id}>
                    {item.organisation.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="reg-col1 ml-5">
            <div className="reg-filter-col-cont">
              <div className="year-select-heading">{AppConstants.filterDates}:</div>
              <RangePicker
                onChange={dates => setDates(dates)}
                format="DD-MM-YYYY"
                style={{ width: '100%', minWidth: 180 }}
                value={[startDate, endDate]}
              />
            </div>
          </div>
          <div className="reg-col1 ml-5">
            <div className="reg-filter-col-cont">
              <div className="year-select-heading">{AppConstants.search}:</div>
              <Input
                className="product-reg-search-input"
                style={{ width: '200px', marginRight: '10px' }}
                placeholder={AppConstants.search}
                onChange={e => setSearchDebounced(e.target.value)}
                allowClear
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const contentView = () => {
    return (
      <div className="comp-dash-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={loading}
            className="home-dashboard-table"
            columns={columns}
            pagination={false}
            scroll={{ x: 2000 }}
            dataSource={loading ? [] : umpireAvailability}
            rowKey={record => record.date + '_' + record.userId}
          />
        </div>

        {page && (
          <div className="comp-dashboard-botton-view-mobile">
            <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end"></div>

            <div className="d-flex justify-content-end">
              <Pagination
                className="antd-pagination"
                showSizeChanger
                total={page.totalCount}
                current={page.currentPage}
                defaultCurrent={page.currentPage}
                defaultPageSize={page.pageSize}
                onChange={onPaginationChanged}
                onShowSizeChange={onPaginationChanged}
              />
            </div>
            <fieldset style={{ maxWidth: 240, marginTop: -100 }}>
              <legend>Notes</legend>
              <div>
                {[
                  {
                    color: 'var(--app-green-bg)',
                    label: AppConstants.available,
                  },
                  {
                    color: 'var(--app-red-bg)',
                    label: AppConstants.unavailable,
                  },
                  {
                    color: 'var(--app-color)',
                    label: AppConstants.matchingUmpiring,
                  },
                ].map(({ color, label }, index) => {
                  return (
                    <div className="d-flex align-items-center mt-2" key={index}>
                      <div
                        className={'mr-15 availability-time-slot'}
                        style={{
                          backgroundColor: color,
                        }}
                      />
                      <div>{label}</div>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.umpires} menuName={AppConstants.umpires} />

      <InnerHorizontalMenu menu="umpire" umpireSelectedKey="2" />

      <Layout>
        {headerView()}

        <Content>{contentView()}</Content>
      </Layout>
    </div>
  );
}

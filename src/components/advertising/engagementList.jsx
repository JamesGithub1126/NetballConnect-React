import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Table, Select, Pagination, DatePicker, Button, message } from 'antd';
import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { getOrganisationData } from 'util/sessionStorage';
import { SortType } from 'util/enums';
import { exportEngagementAction } from 'store/actions/LiveScoreAction/liveScoreBannerAction';
import { getAffiliatesListingAction } from 'store/actions/userAction/userAction';
import { isArrayNotEmpty, getStartOfDay, getEndOfDay } from '../../util/helpers';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import Loader from '../../customComponents/loader';
import LiveScoreAxiosApi from '../../store/http/liveScoreHttp/liveScoreAxiosApi';
import ActionCard from 'customComponents/ActionCard';

const { Content } = Layout;
const { Option } = Select;

const FailType = {
  Error: 1,
  Failed: 2,
};

const engagementStatus = [
  { id: -1, description: AppConstants.all },
  { id: 'Active', description: AppConstants.active },
  { id: 'Archived', description: AppConstants.archived },
];
class Engagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organisationUniqueKey: getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null,
      dateFrom: null,
      dateTo: null,
      postalCode: '',
      loading: false,
      status: -1,
      sortBy: null,
      sortOrder: null,
      limit: 10,
      dataSource: [],
      total: 0,
      page: 1,
      organisationCount: '',
      activeCount: '',
      archivedCount: '',
      affiliateList: [],
      linkedOrganisationId: null,
    };
    this.columns = this.getColumns();
  }

  //#region  method
  listeners = key => ({
    onClick: () => this.tableSort(key),
  });

  tableSort = key => {
    let sortBy = key;
    let sortOrder = null;

    if (this.state.sortBy !== key) {
      sortOrder = SortType.Asc;
    } else if (this.state.sortBy === key && this.state.sortOrder === SortType.Asc) {
      sortOrder = SortType.Desc;
    } else if (this.state.sortBy === key && this.state.sortOrder === SortType.Desc) {
      sortBy = sortOrder = null;
    }
    this.setState({ sortBy, sortOrder }, () => this.handleEngagementList());
  };

  getColumns = () => {
    return [
      {
        title: AppConstants.dateUploaded,
        dataIndex: 'created_at',
        key: 'created_at',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => this.listeners(dataIndex),
        render: created_at => (
          <div>{created_at != null ? moment(created_at).format('DD/MM/YYYY') : ''}</div>
        ),
      },
      {
        title: AppConstants.dateArchived,
        dataIndex: 'archived_at',
        key: 'archived_at',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => this.listeners(dataIndex),
        render: archived_at => (
          <div>{archived_at != null ? moment(archived_at).format('DD/MM/YYYY') : ''}</div>
        ),
      },
      {
        title: AppConstants.organisation,
        dataIndex: 'organisationName',
        key: 'organisationName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => this.listeners(dataIndex),
      },
      {
        title: AppConstants.competition,
        dataIndex: 'competitionName',
        key: 'competitionName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => this.listeners(dataIndex),
      },
      {
        title: AppConstants.sponsor,
        dataIndex: 'sponsorName',
        key: 'sponsorName',
        sorter: true,
        onHeaderCell: ({ dataIndex }) => this.listeners(dataIndex),
      },
      {
        title: AppConstants.banner,
        dataIndex: 'horizontalBannerUrl',
        key: 'horizontalBannerUrl',
        render: (col, record) => {
          return (
            <div className="row">
              {record.horizontalBannerUrl ? (
                <img style={{ height: 100, marginRight: 16 }} src={record.horizontalBannerUrl} />
              ) : null}
              {record.squareBannerUrl ? (
                <img style={{ height: 100 }} src={record.squareBannerUrl} />
              ) : null}
            </div>
          );
        },
      },
      {
        title: AppConstants.url,
        dataIndex: 'horizontalBannerLink',
        key: 'horizontalBannerLink',
        render: (col, record) => {
          if (record.horizontalBannerLink || record.squareBannerLink) {
            return AppConstants.yes;
            /*  return (
              <a href={record.horizontalBannerLink} target="_blank">
                {record.horizontalBannerLink}
              </a>
            ); */
          }
          return AppConstants.no;
        },
      },
    ];
  };

  getPayload = () => {
    const {
      organisationUniqueKey,
      linkedOrganisationId,
      dateFrom,
      dateTo,
      status,
      postalCode,
      sortBy,
      sortOrder,
      limit,
      page,
    } = this.state;
    let startDate = undefined;
    let endDate = undefined;
    if (dateFrom) {
      startDate = getStartOfDay(dateFrom);
    }

    if (dateTo) {
      endDate = getEndOfDay(dateTo);
    }
    const filter = {
      organisationUniqueKey,
      linkedOrganisationId,
      dateFrom: startDate,
      dateTo: endDate,
      postalCode: postalCode !== '' && postalCode !== null ? postalCode.toString() : null,
      status,
      sortBy,
      sortOrder,
      paging: {
        limit: limit,
        offset: page ? limit * (page - 1) : 0,
      },
    };
    return filter;
  };

  handleEngagementList = async () => {
    //reset selected rows when table data is reloaded
    this.setState({ loading: true });
    const { page } = this.state;

    const filter = this.getPayload();
    let total = 0;
    let dataSource = [];
    let pageIndex = 1;
    let organisationCount = '',
      activeCount = '',
      archivedCount = '';
    try {
      const result = await LiveScoreAxiosApi.engagementDashboardList(filter);

      if (result.status === 1) {
        let resp = result.result.data;
        const {
          engagements = [],
          page: { totalCount },
          activeCount: actives,
          archivedCount: archives,
          organisationCount: organisations,
        } = resp;
        total = totalCount;
        dataSource = engagements;
        pageIndex = page;
        organisationCount = organisations;
        activeCount = actives;
        archivedCount = archives;
      } else {
        this.showFaileMessage({ result, type: FailType.Failed });
      }
    } catch (error) {
      this.showFaileMessage({ error, type: FailType.Error });
    }
    this.setState({
      loading: false,
      dataSource,
      total,
      page: pageIndex,
      organisationCount,
      activeCount,
      archivedCount,
    });
  };

  showFaileMessage = ({ result, error, type }) => {
    if (type == 'fail') {
      const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(msg);
    } else {
      if (error.status === 400) {
        message.config({
          duration: 1.5,
          maxCount: 1,
        });
        message.error(error && error.error ? error.error : AppConstants.somethingWentWrong);
      } else {
        message.config({
          duration: 1.5,
          maxCount: 1,
        });
        message.error(AppConstants.somethingWentWrong);
      }
    }
  };

  //#endregion

  //#region  lifecycle

  async componentDidMount() {
    this.props.getAffiliatesListingAction({
      organisationId: this.state.organisationUniqueKey,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      paging: { limit: 10000, offset: 0 },
      stateOrganisations: true,
    });
    if (this.state.organisationUniqueKey) {
      this.handleEngagementList();
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.userState != this.props.userState) {
      if (this.props.userState.onLoad == false) {
        const { affiliateList } = this.props.userState;
        let affiliates = affiliateList || [];
        affiliates.sort(function (a, b) {
          var nameA = a.name; // ignore upper and lowercase
          var nameB = b.name; // ignore upper and lowercase
          if (nameA) {
            nameA = nameA.trimStart();
          }
          if (nameB) {
            nameB = nameB.trimStart();
          }
          if (nameA > nameB) {
            return 1;
          } else if (nameA < nameB) {
            return -1;
          }

          // names must be equal
          return 0;
        });
        this.setState({ affiliateList: affiliates });
      }
    }
  }

  //#endregion

  //#region  event

  onExport = () => {
    const filter = this.getPayload();
    filter.paging.limit = 500000;
    filter.timezoneOffset = new Date().getTimezoneOffset();

    console.log('params for export', filter);
    this.props.exportEngagementAction(filter);
  };

  handleShowSizeChange = async (page, pageSize) => {
    this.setState({ limit: pageSize, page });
  };

  handlePageChanged = page => {
    this.setState({ page }, () => this.handleEngagementList());
  };

  onChangeDropDownValue = async (value, key) => {
    let obj = null;
    let newValue;
    if (value == undefined) {
      value = null;
    }
    if (key === 'dateFrom' || key === 'dateTo') {
      newValue = value == null ? null : moment(value, 'YYYY-mm-dd');
    } else {
      newValue = value;
    }
    obj = { [key]: newValue };

    if (obj) {
      obj.page = 1;
      this.setState(
        {
          ...obj,
          page: 1,
        },
        () => {
          this.handleEngagementList(1);
        },
      );
    }
  };

  onKeyEnterPostCode = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      this.handleEngagementList();
    }
  };

  onChangePostCode = async e => {
    const { value } = e.target;
    let { page } = this.state;
    let canCall = false;
    const newVal = value.toString().split(',');
    newVal.forEach(x => {
      canCall = Number(x.length) % 4 === 0 && x.length > 0;
    });

    if (canCall || value.length === 0) {
      page = 0;
    }

    await this.setState({ postalCode: value, page }, () => {
      if (canCall || value.length === 0) {
        this.handleEngagementList();
      }
    });
  };

  onClickSearchIcon = async () => {
    this.handleEngagementList();
  };

  //#endregion

  //#region partial view

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
        <div className="row" style={{ marginRight: 42 }}>
          <div className="col-lg-4 col-md-12 d-flex align-items-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.engagements}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm d-flex align-items-center justify-content-end">
            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() => this.onExport()}
              disabled={!this.state.dataSource.length}
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
  };

  dropdownView = () => {
    const { affiliateList } = this.state;
    let affiliates = [];
    let org = getOrganisationData();
    if (org) {
      affiliates.push({ name: org.name, id: org.id });
    }
    const organisations = isArrayNotEmpty(affiliateList) ? affiliateList : affiliates;
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="fluid-width" style={{ marginRight: 55 }}>
          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading"></div>
              </div>
            </div>
            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading"></div>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading"></div>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.status}</div>
                <Select
                  className="year-select reg-filter-select"
                  style={{ maxWidth: '100%' }}
                  onChange={e => this.onChangeDropDownValue(e, 'status')}
                  value={this.state.status}
                >
                  {(engagementStatus || []).map(g => (
                    <Option key={`paymentStatus_${g.id}`} value={g.id}>
                      {g.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="row reg-filter-row">
            <div className="reg-col col-lg-3 col-md-5">
              <div className="reg-filter-col-cont" style={{ marginRight: '30px' }}>
                <div className="year-select-heading">{AppConstants.dateFrom}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'dateFrom')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="dateFrom"
                  value={this.state.dateFrom && moment(this.state.dateFrom, 'YYYY-MM-DD')}
                />
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.dateTo}</div>
                <DatePicker
                  size="default"
                  className="year-select reg-filter-select"
                  onChange={e => this.onChangeDropDownValue(e, 'dateTo')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="dateTo"
                  value={this.state.dateTo && moment(this.state.dateTo, 'YYYY-MM-DD')}
                />
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading">{AppConstants.organisation}</div>
                <Select
                  showSearch
                  optionFilterProp="children"
                  className="year-select reg-filter-select1"
                  onChange={linkedOrganisationId =>
                    this.onChangeDropDownValue(linkedOrganisationId, 'linkedOrganisationId')
                  }
                  value={this.state.linkedOrganisationId}
                  allowClear
                >
                  <Option key={-1} value={null}>
                    {AppConstants.all}
                  </Option>
                  {(organisations || []).map(item => (
                    <Option key={`organisation_${item.id}`} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="reg-col col-lg-3 col-md-7">
              <div className="reg-filter-col-cont">
                <div className="year-select-heading" style={{ width: 95 }}>
                  {AppConstants.postCode}
                </div>
                <div style={{ width: '76%' }}>
                  <InputWithHead
                    allowClear
                    auto_complete="off"
                    placeholder={AppConstants.postCode}
                    onChange={this.onChangePostCode}
                    onKeyPress={this.onKeyEnterPostCode}
                    value={this.state.postalCode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  countView = () => {
    const { organisationCount, activeCount, archivedCount } = this.state;
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="row">
            <div className="col-sm-4">
              <ActionCard
                payload={{}}
                ActionTitle={AppConstants.organisations}
                value={organisationCount + ''}
                useStatic={true}
                key={organisationCount + 'OrganisationBoxCount'}
              ></ActionCard>
            </div>
            <div className="col-sm-4">
              <ActionCard
                payload={{}}
                ActionTitle={AppConstants.active}
                value={activeCount + ''}
                useStatic={true}
                key={activeCount + 'ActiveBoxCount'}
              ></ActionCard>
            </div>
            <div className="col-sm-4">
              <ActionCard
                payload={{}}
                ActionTitle={AppConstants.archived}
                value={archivedCount + ''}
                useStatic={true}
                key={archivedCount + 'ArchivedBoxCount'}
              ></ActionCard>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const { dataSource, loading, total, page, limit } = this.state;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={this.columns}
            rowKey={record => record.id}
            dataSource={dataSource}
            pagination={false}
            loading={loading}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={page}
            defaultCurrent={page}
            defaultPageSize={limit}
            total={total}
            onChange={this.handlePageChanged}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  //#endregion

  render() {
    const { loading } = this.state;
    const { onLoad } = this.props.liveScoreBannerState;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.advertising}
          menuName={AppConstants.advertising}
        />

        <InnerHorizontalMenu menu="advertising" userSelectedKey="1" />

        <Layout>
          {this.headerView()}

          <Content>
            <Loader visible={onLoad} />

            {this.dropdownView()}
            {this.countView()}
            {this.contentView()}
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      exportEngagementAction,
      getAffiliatesListingAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreBannerState: state.LiveScoreBannerState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Engagement);

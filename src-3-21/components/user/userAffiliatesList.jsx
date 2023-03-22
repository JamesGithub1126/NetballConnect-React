import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Tag,
  Select,
  Menu,
  Pagination,
  Modal,
  Input,
} from 'antd';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SearchOutlined } from '@ant-design/icons';

import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import {
  getAffiliatesListingAction,
  getAffiliatesListingResetAction,
  exportAffiliateUsersAction,
  getUreAction,
  getAffiliateToOrganisationAction,
  affiliateDeleteAction,
  setAffiliateTableListPageSizeAction,
  setAffiliateTableListPageNumberAction,
} from '../../store/actions/userAction/userAction';
import { getOrganisationData } from '../../util/sessionStorage';

import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import './user.css';
import AppUniqueId from 'themes/appUniqueId';

const { Content, Header } = Layout;
const { Option } = Select;
const { confirm } = Modal;
const { SubMenu } = Menu;
let this_Obj = null;

/// //function to sort table column
function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = sortOrder = null;
  }

  let { affiliateListPageSize } = this_Obj.props.userState;
  affiliateListPageSize = affiliateListPageSize ? affiliateListPageSize : 10;

  const filterData = {
    organisationId: this_Obj.state.organisationId,
    affiliatedToOrgId: this_Obj.state.affiliatedToOrgId,
    organisationTypeRefId: this_Obj.state.organisationTypeRefId,
    statusRefId: this_Obj.state.statusRefId,
    searchText: this_Obj.state.searchText,
    paging: {
      limit: affiliateListPageSize,
      offset: this_Obj.state.pageNo ? affiliateListPageSize * (this_Obj.state.pageNo - 1) : 0,
    },
    stateOrganisations: false,
    restrictedAccounts: this_Obj.restrictedAccounts,
  };
  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.getAffiliatesListingAction(filterData, sortBy, sortOrder);
}
const listeners = key => ({
  onClick: () => tableSort(key),
});
const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'affiliateName',
    key: 'affiliateName',
    sorter: true,
    onHeaderCell: () => listeners('name'),
  },
  {
    title: AppConstants.affiliatedTo,
    dataIndex: 'affiliatedToName',
    key: 'affiliatedToName',
    sorter: true,
    onHeaderCell: () => listeners('affiliatedTo'),
  },
  {
    title: AppConstants.organisationType,
    dataIndex: 'organisationTypeRefName',
    key: 'organisationTypeRefName',
    sorter: true,
    onHeaderCell: () => listeners('organisationType'),
  },
  {
    title: AppConstants.contact1,
    dataIndex: 'contact1Name',
    key: 'contact1Name',
    sorter: false,
    // onHeaderCell: () => listeners('contact1'),
  },
  {
    title: AppConstants.contact2,
    dataIndex: 'contact2Name',
    key: 'contact2Name',
    sorter: false,
    // onHeaderCell: () => listeners('contact2'),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRefName',
    key: 'statusRefName',
    sorter: true,
    onHeaderCell: () => listeners('status'),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, e) =>
      isUsed === false && (
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
            <Menu.Item key="1">
              <NavLink
                to={{
                  pathname: '/userEditAffiliates',
                  state: {
                    affiliateOrgId: e.affiliateOrgId,
                    orgTypeRefId: e.organisationTypeRefId,
                  },
                }}
              >
                <span>Edit</span>
              </NavLink>
            </Menu.Item>
          </SubMenu>
        </Menu>
      ),
  },
];

const FileterType = {
  RestrictedAccounts: 1,
};
class UserAffiliatesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      deleteLoading: false,
      pageNo: 1,
      sortBy: null,
      sortOrder: null,
      offsetData: 0,
      searchText: '',
      restrictedAccounts: props.location.state?.restrictedAccounts || null,
    };
    this_Obj = this;
    // this.props.getUreAction();
    this.referenceCalls(this.state.organisationId);
  }

  async componentDidMount() {
    const { userAffiliateListAction } = this.props.userState;
    let page = 1;
    let { sortBy } = this.state;
    let { sortOrder } = this.state;
    if (userAffiliateListAction) {
      const offsetData = userAffiliateListAction.payload.paging.offset;
      sortBy = userAffiliateListAction.sortBy;
      sortOrder = userAffiliateListAction.sortOrder;
      const { affiliatedToOrgId } = userAffiliateListAction.payload;
      const { organisationTypeRefId } = userAffiliateListAction.payload;
      const { statusRefId } = userAffiliateListAction.payload;
      let { affiliateListPageSize } = this.props.userState;
      affiliateListPageSize = affiliateListPageSize ? affiliateListPageSize : 10;
      await this.setState({
        offsetData,
        sortBy,
        sortOrder,
        affiliatedToOrgId,
        statusRefId,
        organisationTypeRefId,
      });
      page = Math.floor(offsetData / affiliateListPageSize) + 1;
    }
    this.handleAffiliateTableList(
      page,
      this.state.organisationId,
      this.state.affiliatedToOrgId,
      this.state.organisationTypeRefId,
      this.state.statusRefId,
    );
  }

  componentDidUpdate(nextProps) {
    const { userState } = this.props;
    if (userState.onLoad === false && this.state.loading === true) {
      if (!userState.error) {
        this.setState({
          loading: false,
        });
      }
    }

    if (userState.onLoad === false && this.state.deleteLoading === true) {
      if (!userState.error) {
        this.setState({
          deleteLoading: false,
        });
        this.handleAffiliateTableList(1, this.state.organisationId, -1, -1, -1);
      }
    }
  }

  componentWillUnmount() {
    this.props.getAffiliatesListingResetAction();
  }

  referenceCalls = organisationId => {
    this.props.getAffiliateToOrganisationAction(organisationId);
  };

  handleShowSizeChange = async (page, pageSize) => {
    const { affiliateListPageSize } = this.props.userState;
    if (affiliateListPageSize !== pageSize) {
      await this.props.setAffiliateTableListPageSizeAction(pageSize);
    }
    const { organisationId, affiliatedToOrgId, organisationTypeRefId, statusRefId } = this.state;
    this.handleAffiliateTableList(
      page,
      organisationId,
      affiliatedToOrgId,
      organisationTypeRefId,
      statusRefId,
    );
  };

  handleAffiliateTableList = async (
    page,
    organisationId,
    affiliatedToOrgId,
    organisationTypeRefId,
    statusRefId,
  ) => {
    await this.props.setAffiliateTableListPageNumberAction(page);
    this.setState({
      pageNo: page,
    });
    let { affiliateListPageSize } = this.props.userState;
    affiliateListPageSize = affiliateListPageSize ? affiliateListPageSize : 10;
    const filter = {
      organisationId,
      affiliatedToOrgId,
      organisationTypeRefId,
      statusRefId,
      searchText: this.state.searchText,
      paging: {
        limit: affiliateListPageSize,
        offset: page ? affiliateListPageSize * (page - 1) : this.state.offsetData,
      },
      stateOrganisations: false,
      restrictedAccounts: this.state.restrictedAccounts,
    };
    this.props.getAffiliatesListingAction(filter, this.state.sortBy, this.state.sortOrder);
  };

  getEveryAvailableAffiliateData = async (
    organisationId,
    affiliatedToOrgId,
    organisationTypeRefId,
    statusRefId,
  ) => {
    const filter = {
      organisationId,
      affiliatedToOrgId,
      organisationTypeRefId,
      statusRefId,
      searchText: this.state.searchText,
      paging: {
        limit: -1,
        offset: 0,
      },
      stateOrganisations: false,
      restrictedAccounts: this.state.restrictedAccounts,
    };
    return this.props.exportAffiliateUsersAction(filter);
  };

  navigateToAffiliate = e => {
    this.props.history.push('/userEditAffiliates', {
      affiliateOrgId: e.affiliateOrgId,
      orgTypeRefId: e.organisationTypeRefId,
    });
  };

  onChangeOrganisationTypes = e => {
    this.setState({ organisationTypeRefId: e });
    this.handleAffiliateTableList(
      1,
      this.state.organisationId,
      this.state.affiliatedToOrgId,
      e,
      this.state.statusRefId,
    );
  };

  onChangeAffiliateTo = e => {
    this.setState({ affiliatedToOrgId: e });
    this.handleAffiliateTableList(
      1,
      this.state.organisationId,
      e,
      this.state.organisationTypeRefId,
      this.state.statusRefId,
    );
  };

  onChangeStatusRefId = e => {
    this.setState({ statusRefId: e });
    this.handleAffiliateTableList(
      1,
      this.state.organisationId,
      this.state.affiliatedToOrgId,
      this.state.organisationTypeRefId,
      e,
    );
  };

  showDeleteConfirm = affiliateId => {
    const this_ = this;
    confirm({
      title: AppConstants.affiliateDeleteConfirm,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteAffiliate(affiliateId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  deleteAffiliate = affiliateId => {
    this.props.affiliateDeleteAction(affiliateId);
    this.setState({ deleteLoading: true });
  };

  handleTextualTableList = page => {
    this.handleAffiliateTableList(
      page,
      this.state.organisationId,
      this.state.affiliatedToOrgId,
      this.state.organisationTypeRefId,
      this.state.statusRefId,
    );
  };

  onKeyEnterSearchText = async e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      this.handleTextualTableList(1);
    }
  };

  onChangeSearchText = async e => {
    const { value } = e.target;

    await this.setState({ searchText: value });

    if (!value) {
      this.handleTextualTableList(1);
    }
  };

  onClickSearchIcon = async () => {
    this.handleTextualTableList(1);
  };

  headerView = () => (
    <Header className="comp-player-grades-header-view" style={{ marginTop: 0, padding: '0 22px' }}>
      <div className="row">
        <div className="col-sm d-flex align-items-center">
          <Breadcrumb separator=" > ">
            {/* <Breadcrumb.Item className="breadcrumb-product">User</Breadcrumb.Item> */}
            <Breadcrumb.Item className="breadcrumb-add">Affiliates</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm search-flex">
          <div className="reg-product-search-inp-width">
            <Input
              className="product-reg-search-input"
              onChange={this.onChangeSearchText}
              placeholder="Search..."
              onKeyPress={this.onKeyEnterSearchText}
              value={this.state.searchText}
              prefix={
                <SearchOutlined
                  style={{ color: 'rgba(0,0,0,.25)', height: 16, width: 16 }}
                  onClick={this.onClickSearchIcon}
                />
              }
              allowClear
            />
          </div>
          <div className="d-flex ml-3">
            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() =>
                this.getEveryAvailableAffiliateData(
                  this.state.organisationId,
                  this.state.affiliatedToOrgId,
                  this.state.organisationTypeRefId,
                  this.state.statusRefId,
                )
              }
            >
              <img src={AppImages.export} alt="" className="export-image" />
              {AppConstants.exportAffiliates}
            </Button>
          </div>
        </div>
      </div>
    </Header>
  );

  clearTagFilter = filterType => {
    switch (filterType) {
      case FileterType.RestrictedAccounts:
        this.setState({ restrictedAccounts: null });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.handleAffiliateTableList(
        1,
        this.state.organisationId,
        this.state.affiliatedToOrgId,
        this.state.organisationTypeRefId,
        this.state.statusRefId,
      );
    }, 300);
  };

  statusView = () => {
    const filters = [];
    if (this.state.restrictedAccounts) {
      filters.push({
        name: AppConstants.restrictedAccounts,
        type: FileterType.RestrictedAccounts,
      });
    }
    return (
      <div className="comp-player-grades-header-view-design" style={{ marginBottom: -10 }}>
        <div className="row" style={{ marginRight: 42 }}>
          <div className="col-sm-9 padding-right-reg-dropdown-zero">
            <div className="reg-filter-col-cont status-dropdown d-flex align-items-center justify-content-end pr-2">
              {filters.length ? (
                <div className="col-sm pt-1 align-self-center">
                  {filters.map(filter => (
                    <Tag
                      closable
                      color="volcano"
                      style={{ paddingTop: 3, height: 30 }}
                      onClose={() => {
                        this.clearTagFilter(filter.type);
                      }}
                      key={`${filters.name}`}
                    >
                      {filter.name}
                    </Tag>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    const affiliateToData = this.props.userState.affiliateTo;
    let uniqueValues = [];
    if (affiliateToData.affiliatedTo !== undefined) {
      uniqueValues = [
        ...new Map(affiliateToData.affiliatedTo.map(obj => [obj.affiliatedToOrgId, obj])).values(),
      ];
    }

    return (
      <div className="comp-player-grades-header-drop-down-view mt-1">
        <div className="fluid-width">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center w-100">
                <span className="year-select-heading" style={{ width: 120 }}>
                  {AppConstants.affiliatedTo}
                </span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  onChange={e => this.onChangeAffiliateTo(e)}
                  value={this.state.affiliatedToOrgId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(uniqueValues || []).map(org => (
                    <Option
                      key={`organization_${org.affiliatedToOrgId}`}
                      value={org.affiliatedToOrgId}
                    >
                      {org.affiliatedToOrgName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center">
                <span className="year-select-heading" style={{ width: 240 }}>
                  {AppConstants.organisationType}
                </span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  onChange={e => this.onChangeOrganisationTypes(e)}
                  value={this.state.organisationTypeRefId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(affiliateToData.organisationTypes || []).map(org => (
                    <Option key={`organizationTyp_${org.id}`} value={org.id}>
                      {org.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center">
                <span className="year-select-heading" style={{ width: 120 }}>
                  {AppConstants.status}
                </span>
                <Select
                  className="year-select reg-filter-select1 ml-2"
                  style={{ minWidth: 160 }}
                  onChange={e => this.onChangeStatusRefId(e)}
                  value={this.state.statusRefId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {(affiliateToData.status || []).map(st => (
                    <Option key={`status_${st.id}`} value={st.id}>
                      {st.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-lg-2 col-md-6 add-affiliate-btn">
              {affiliateToData.isEligibleToAddAffiliate === 1 && (
                <div className="d-flex flex-row-reverse">
                  <NavLink
                    to={{
                      pathname: '/userAddAffiliates',
                      state: { isEdit: true },
                    }}
                  >
                    <Button className="primary-add-product" type="primary">
                      +{AppConstants.addAffiliate}
                    </Button>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      affiliateList,
      affiliateListPage,
      affiliateListPageSize,
      affiliateListTotalCount,
      onLoad,
      onLoadAffiliates,
    } = this.props.userState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          {/* <Table className="home-dashboard-table" columns={columns} dataSource={affiliates} pagination={false}
                        onRow={(r) => ({onClick: () => this.navigateToAffiliate(r, this.state.organisationId)})}
                    /> */}
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={affiliateList}
            pagination={false}
            loading={onLoad || onLoadAffiliates}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={affiliateListPage}
            defaultCurrent={affiliateListPage}
            defaultPageSize={affiliateListPageSize}
            total={affiliateListTotalCount}
            onChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  // footer view containing all the buttons like submit and cancel
  footerView = () => {
    const affiliateToData = this.props.userState.affiliateTo;
    return (
      <div>
        {affiliateToData.isEligibleToAddAffiliate && (
          <div className="d-flex flex-row-reverse">
            <NavLink to="/userAddAffiliates">
              <Button className="primary-add-product" type="primary">
                +{AppConstants.addAffiliate}
              </Button>
            </NavLink>
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="2" />
        <Layout>
          {this.headerView()}
          {this.statusView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
          {/* <Footer>
                        {this.footerView()}
                    </Footer> */}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getAffiliatesListingAction,
      exportAffiliateUsersAction,
      getAffiliatesListingResetAction,
      getUreAction,
      getAffiliateToOrganisationAction,
      affiliateDeleteAction,
      setAffiliateTableListPageSizeAction,
      setAffiliateTableListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAffiliatesList);

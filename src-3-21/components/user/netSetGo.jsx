import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, Select, Pagination } from 'antd';
import './user.css';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
// import AppImages from "../../themes/appImages";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOrganisationData } from '../../util/sessionStorage';
import {
  getUserFriendAction,
  getNetSetGoActionList,
  setNetSetGoListPageSizeAction,
  setNetSetGoListPageNumberAction,
} from '../../store/actions/userAction/userAction';
import { getOnlyYearListAction } from '../../store/actions/appAction';

const {
  // Footer,
  Content,
} = Layout;
const { Option } = Select;
// const { confirm } = Modal;
// const { SubMenu } = Menu;
let this_Obj = null;

const listeners = key => ({
  onClick: () => tableSort(key),
});

/////function to sort table column
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

  let { netSetGoPageSize } = this_Obj.props.userState;
  netSetGoPageSize = netSetGoPageSize ? netSetGoPageSize : 10;

  let filterData = {
    organisationId: this_Obj.state.organisationId,
    yearRefId: this_Obj.state.yearRefId,
    paging: {
      limit: netSetGoPageSize,
      offset: this_Obj.state.pageNo ? netSetGoPageSize * (this_Obj.state.pageNo - 1) : 0,
    },
  };

  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.getNetSetGoActionList(filterData, sortBy, sortOrder);
}
const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (name, record) => (
      <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
        <span className="input-heading-add-another pt-0">{name}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.registrationDate,
    dataIndex: 'registrationDate',
    key: 'registrationDate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: regDate => <span>{moment(regDate).format('DD/MM/YYYY')}</span>,
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliateName',
    key: 'affiliate',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.dOB,
    dataIndex: 'dateOfBirth',
    key: 'dateOfBirth',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: dob => {
      return <span>{moment(dob).format('DD/MM/YYYY')}</span>;
    },
  },
  {
    title: AppConstants.address,
    dataIndex: 'street1',
    key: 'address',
    render: (address, record) => (
      <span>
        {record.street1 + ','} {record.street2 && record.street2 + ','} {record.suburb + ','}{' '}
        {record.postalCode + ','} {record.state + ','} {record.country}
      </span>
    ),
  },
];

class NetSetGo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId: -1,
      pageNo: 1,
      sortBy: null,
      sortOrder: null,
    };
    this_Obj = this;
  }

  async componentDidMount() {
    const { netSetGoListAction } = this.props.userState;
    this.referenceCalls();
    let pageNo = 1;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (netSetGoListAction) {
      let offset = netSetGoListAction.payload.paging.offset;
      sortBy = netSetGoListAction.sortBy;
      sortOrder = netSetGoListAction.sortOrder;
      let yearRefId = netSetGoListAction.payload.yearRefId;
      let { netSetGoPageSize } = this.props.userState;
      netSetGoPageSize = netSetGoPageSize ? netSetGoPageSize : 10;
      pageNo = Math.floor(offset / netSetGoPageSize) + 1;
      await this.setState({ offset, sortBy, sortOrder, yearRefId, pageNo });

      this.handleNetSetGoTableList(pageNo);
    } else {
      this.handleNetSetGoTableList(1);
    }
  }
  componentDidUpdate(nextProps) {}

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setNetSetGoListPageSizeAction(pageSize);
  };

  handleNetSetGoTableList = async page => {
    await this.props.setNetSetGoListPageNumberAction(page);
    this.setState({
      pageNo: page,
    });
    let { netSetGoPageSize } = this.props.userState;
    netSetGoPageSize = netSetGoPageSize ? netSetGoPageSize : 10;
    let filter = {
      organisationId: this.state.organisationId,
      yearRefId: this.state.yearRefId,
      paging: {
        limit: netSetGoPageSize,
        offset: page ? netSetGoPageSize * (page - 1) : 0,
      },
    };
    this.props.getNetSetGoActionList(filter, this.state.sortBy, this.state.sortOrder);
  };

  referenceCalls = () => {
    this.props.getOnlyYearListAction();
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') await this.setState({ yearRefId: value });

    this.handleNetSetGoTableList(1);
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.netSetGo}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-1">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-2">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select1 ml-2"
                  style={{ maxWidth: 80 }}
                  onChange={yearRefId => this.onChangeDropDownValue(yearRefId, 'yearRefId')}
                  value={this.state.yearRefId}
                >
                  <Option key={-1} value={-1}>
                    {AppConstants.all}
                  </Option>
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      netSetGoList,
      netSetGoTotalCount,
      netSetGoPage,
      onLoad,
      netSetGoPageSize,
    } = this.props.userState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={netSetGoList}
            pagination={false}
            loading={onLoad}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={netSetGoPage}
            defaultCurrent={netSetGoPage}
            defaultPageSize={netSetGoPageSize}
            total={netSetGoTotalCount}
            onChange={this.handleNetSetGoTableList}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="8" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
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
      getUserFriendAction,
      getOnlyYearListAction,
      getNetSetGoActionList,
      setNetSetGoListPageSizeAction,
      setNetSetGoListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(NetSetGo);

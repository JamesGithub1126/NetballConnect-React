import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, Select, Pagination, Button } from 'antd';

import './user.css';
// import moment from 'moment';
import { NavLink } from 'react-router-dom';
import Loader from 'customComponents/loader';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from 'themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOrganisationData, getGlobalYear, setGlobalYear } from '../../util/sessionStorage';
import {
  getUserFriendAction,
  exportUserFriendAction,
  setPlayWithFriendListPageSizeAction,
  setPlayWithFriendListPageNumberAction,
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

  let { friendPageSize } = this_Obj.props.userState;
  friendPageSize = friendPageSize ? friendPageSize : 10;
  let filterData = {
    organisationUniqueKey: this_Obj.state.organisationId,
    yearRefId: this_Obj.state.yearRefId,
    paging: {
      limit: friendPageSize,
      offset: this_Obj.state.pageNo ? friendPageSize * (this_Obj.state.pageNo - 1) : 0,
    },
  };

  this_Obj.setState({ sortBy, sortOrder });
  this_Obj.props.getUserFriendAction(filterData, sortBy, sortOrder);
}
const columns = [
  {
    title: AppConstants.registeredUser,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('registeredUser'),
    render: (name, record) => (
      <NavLink to={{ pathname: '/userPersonal', state: { userId: record.userId } }}>
        <span className="input-heading-add-another pt-0">{name}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.affiliateName,
    dataIndex: 'affiliateName',
    key: 'affiliateName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.competitionName,
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.division,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('division'),
  },
  {
    title: AppConstants.friendName,
    dataIndex: 'friendName',
    key: 'friendName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.friendStatus,
    dataIndex: 'friendStatus',
    key: 'friendStatus',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.competitionName,
    dataIndex: 'friendCompetitionName',
    key: 'friendCompetitionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.division,
    dataIndex: 'friendCompDivision',
    key: 'friendCompDivision',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
];

class PlayWithFriend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId: null,
      pageNo: 1,
      sortBy: null,
      sortOrder: null,
    };
    this_Obj = this;
  }

  async componentDidMount() {
    let yearId = getGlobalYear() ? getGlobalYear() : '-1';
    const { userFriendListAction } = this.props.userState;
    this.referenceCalls();
    let pageNo = 1;
    let sortBy = this.state.sortBy;
    let sortOrder = this.state.sortOrder;
    if (userFriendListAction) {
      let offset = userFriendListAction.payload.paging.offset;
      sortBy = userFriendListAction.sortBy;
      sortOrder = userFriendListAction.sortOrder;
      let yearRefId = JSON.parse(yearId);
      let { friendPageSize } = this.props.userState;
      friendPageSize = friendPageSize ? friendPageSize : 10;
      pageNo = Math.floor(offset / friendPageSize) + 1;
      await this.setState({ offset, sortBy, sortOrder, yearRefId, pageNo });

      this.handleFriendTableList(pageNo);
    } else {
      this.setState({ yearRefId: JSON.parse(yearId) });
      this.handleFriendTableList(1);
    }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPlayWithFriendListPageSizeAction(pageSize);
  };

  handleFriendTableList = async page => {
    await this.props.setPlayWithFriendListPageNumberAction(page);
    let yearId = getGlobalYear() ? getGlobalYear() : '-1';
    this.setState({ pageNo: page });
    let { friendPageSize } = this.props.userState;
    friendPageSize = friendPageSize ? friendPageSize : 10;
    let filter = {
      organisationUniqueKey: this.state.organisationId,
      yearRefId: this.state.yearRefId === -1 ? this.state.yearRefId : JSON.parse(yearId),
      paging: {
        limit: friendPageSize,
        offset: page ? friendPageSize * (page - 1) : 0,
      },
    };
    this.props.getUserFriendAction(filter, this.state.sortBy, this.state.sortOrder);
  };

  referenceCalls = () => {
    this.props.getOnlyYearListAction();
  };

  onChangeDropDownValue = async (value, key) => {
    if (key === 'yearRefId') await this.setState({ yearRefId: value });
    if (value != -1) {
      setGlobalYear(value);
    }

    this.handleFriendTableList(1);
  };

  exportPlayWithAFriend = () => {
    console.log(this.state);
    let yearId = getGlobalYear() ? getGlobalYear() : '-1';
    this.setState({
      pageNo: 1,
    });
    let { friendTotalCount } = this.props.userState;
    let filter = {
      organisationUniqueKey: this.state.organisationId,
      yearRefId: this.state.yearRefId === -1 ? this.state.yearRefId : JSON.parse(yearId),
      paging: {
        limit: friendTotalCount,
        offset: 0,
      },
    };
    this.props.exportUserFriendAction(filter, this.state.sortBy, this.state.sortOrder);
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.playWithAFriend}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="col-sm d-flex align-content-center justify-content-end">
            <div className="comp-dashboard-botton-view-mobile">
              <Button
                type="primary"
                className="primary-add-comp-form"
                onClick={this.exportPlayWithAFriend}
              >
                <div className="row">
                  <div className="col-sm">
                    <img className="export-image" src={AppImages.export} alt="" />
                    {AppConstants.export}
                  </div>
                </div>
              </Button>
            </div>
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
      friendList,
      friendPage,
      friendPageSize,
      friendTotalCount,
      onLoad,
    } = this.props.userState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={friendList}
            pagination={false}
            loading={onLoad}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={friendPage}
            defaultCurrent={friendPage}
            defaultPageSize={friendPageSize}
            total={friendTotalCount}
            onChange={this.handleFriendTableList}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="5" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
          </Content>
        </Layout>
        <Loader visible={this.props.userState.onExpUserFriendLoad} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUserFriendAction,
      getOnlyYearListAction,
      exportUserFriendAction,
      setPlayWithFriendListPageSizeAction,
      setPlayWithFriendListPageNumberAction,
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
export default connect(mapStateToProps, mapDispatchToProps)(PlayWithFriend);

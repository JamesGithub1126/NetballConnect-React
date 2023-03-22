import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, Select, Menu, Pagination } from 'antd';
import './product.scss';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import {
  regDashboardListAction,
  setPageSizeAction,
  setPageNumberAction,
} from '../../store/actions/registrationAction/registrationDashboardAction';
import moment from 'moment';
import Tooltip from 'react-png-tooltip';
import { getCurrentYear } from 'util/permissions';

const {
  // Footer,
  Content,
} = Layout;
const { Option } = Select;
const { SubMenu } = Menu;

let this_Obj = null;

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
  this_Obj.setState({ sortBy, sortOrder });

  let { pageSize } = this_Obj.props.dashboardState;
  pageSize = pageSize ? pageSize : 10;

  this_Obj.props.regDashboardListAction(
    this_Obj.state.offset,
    pageSize,
    this_Obj.state.yearRefId,
    sortBy,
    sortOrder,
  );
}

const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.competitionName,
    dataIndex: 'competitionName',
    key: 'competitionName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.registrationOpen,
    dataIndex: 'registrationOpenDate',
    key: 'registrationOpenDate',
    render: (registrationOpenDate, record) => {
      return (
        <span>
          {registrationOpenDate ? moment(registrationOpenDate).format('DD-MM-YYYY') : null}
        </span>
      );
    },
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('registrationOpen'),
  },
  {
    title: AppConstants.registrationClose,
    dataIndex: 'registrationCloseDate',
    key: 'registrationCloseDate',
    render: (registrationCloseDate, record) => {
      return (
        <span>
          {registrationCloseDate ? moment(registrationCloseDate).format('DD-MM-YYYY') : null}
        </span>
      );
    },
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('registrationClose'),
  },

  {
    title: AppConstants.status,
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    titie: AppConstants.form,
    dataIndex: 'userRegistrationUrl',
    key: 'userRegistrationUrl',
    render: (userRegistrationUrl, record) => {
      return (
        record.status == 'Published' && (
          <span className="d-flex justify-content-center w-50">
            <a
              className="user-reg-link"
              href={userRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="dot-image pointer"
                src={AppImages.docsIcon}
                alt=""
                width="25"
                height="25"
              />
            </a>
          </span>
        )
      );
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => (
      // isUsed == false ? <Menu
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
                pathname: `/registrationForm`,
                state: {
                  id: record.competitionId,
                  year: record.yearId,
                  orgRegId: record.orgRegId,
                  compCloseDate: record.compRegCloseDate,
                  compName: record.competitionName,
                },
              }}
            >
              {/*  */}
              <span>Edit</span>
            </NavLink>
          </Menu.Item>
        </SubMenu>
      </Menu>
      //  : null
    ),
  },
];

class RegistrationFormList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      offset: 0,
      sortBy: null,
      sortOrder: null,
      allyearload: false,
    };
    this_Obj = this;
  }

  async componentDidUpdate(nextProps) {
    if (this.state.allyearload === true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        let mainYearRefId =
          this.props.appState.yearRefId !== -1
            ? this.props.appState.yearRefId
            : getCurrentYear(this.props.appState.yearList);
        const { regFormListAction } = this.props.dashboardState;
        let page = 1;
        let sortBy = this.state.sortBy;
        let sortOrder = this.state.sortOrder;
        if (regFormListAction) {
          let offset = regFormListAction.offset;
          sortBy = regFormListAction.sortBy;
          sortOrder = regFormListAction.sortOrder;
          let yearRefId = regFormListAction.yearRefId;
          let allyearload = false;
          await this.setState({ offset, sortBy, sortOrder, yearRefId, allyearload });
          let { pageSize } = this.props.dashboardState;
          pageSize = pageSize ? pageSize : 10;
          page = Math.floor(offset / pageSize) + 1;
          this.handleMembershipTableList(page, yearRefId);
        } else {
          this.handleMembershipTableList(1, mainYearRefId);
          this.props.setYearRefId(mainYearRefId);
          await this.setState({
            yearRefId: mainYearRefId,
            allyearload: false,
          });
        }
      }
    }
  }

  async componentDidMount() {
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    await this.setState({
      allyearload: true,
    });
    // const { regFormListAction } = this.props.dashboardState
    // let page = 1
    // let sortBy = this.state.sortBy
    // let sortOrder = this.state.sortOrder
    // if (regFormListAction) {
    //     let offset = regFormListAction.offset
    //     sortBy = regFormListAction.sortBy
    //     sortOrder = regFormListAction.sortOrder
    //     let yearRefId = regFormListAction.yearRefId

    //     await this.setState({ offset, sortBy, sortOrder, yearRefId })
    //     page = Math.floor(offset / 10) + 1;

    //     this.handleMembershipTableList(page, yearRefId)
    // } else {
    //     this.handleMembershipTableList(1, this.state.yearRefId)
    // }
  }

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
    this.handleMembershipTableList(page, this.state.yearRefId);
  };

  handleMembershipTableList = async (page, yearRefId) => {
    await this.props.setPageNumberAction(page);
    let { sortBy, sortOrder } = this.state;
    let { pageSize } = this.props.dashboardState;
    pageSize = pageSize ? pageSize : 10;
    let offset = page ? pageSize * (page - 1) : 0;
    this.setState({ offset });
    this.props.regDashboardListAction(offset, pageSize, yearRefId, sortBy, sortOrder);
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-items-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.registrationForm}
              </Breadcrumb.Item>
            </Breadcrumb>
            <Tooltip>
              <span>{AppConstants.regFormDashBoardMsg}</span>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  onYearChange = yearRefId => {
    this.setState({ yearRefId });
    this.props.setYearRefId(yearRefId);
    this.handleMembershipTableList(1, yearRefId);
  };

  dropdownView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-2">
              <div className="com-year-select-heading-view">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select-year ml-2"
                  style={{ width: 90 }}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={this.state.yearRefId}
                >
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
    const { dashboardState } = this.props;
    const {
      regDashboardListTotalCount,
      regDashboardListData,
      regDashboardListPage,
      onLoad,
      pageSize,
    } = this.props.dashboardState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={regDashboardListData}
            pagination={false}
            loading={onLoad === true && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={regDashboardListPage}
            defaultCurrent={regDashboardListPage}
            defaultPageSize={pageSize}
            total={regDashboardListTotalCount}
            onChange={page => this.handleMembershipTableList(page, this.state.yearRefId)}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };

  // footerView = () => {
  //   return (
  //     <div className="d-flex flex-row-reverse">
  //       <NavLink to="/productAddRegistration" className="text-decoration-none">
  //         <Button className="primary-add-product" type="primary">
  //           + {AppConstants.addAFee}
  //         </Button>
  //       </NavLink>
  //     </div>
  //   );
  // };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <InnerHorizontalMenu menu="registration" regSelectedKey="3" />
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
      setYearRefId,
      getOnlyYearListAction,
      regDashboardListAction,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    dashboardState: state.RegistrationDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationFormList);

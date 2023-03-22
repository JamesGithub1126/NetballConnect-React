import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, Table, Select, Menu, Pagination, Modal, message } from 'antd';
import './product.scss';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { getCurrentYear, routePermissionForMembership } from 'util/permissions';
import { bindActionCreators } from 'redux';
import {
  regMembershipListAction,
  regMembershipListDeleteAction,
  clearReducerDataAction,
  setRegistrationMembershipListPageSizeAction,
  setRegistrationMembershipListPageNumberAction,
} from '../../store/actions/registrationAction/registration';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import { currencyFormat } from '../../util/currencyFormat';
import { getOrganisationData } from 'util/sessionStorage';
import { MembershipProductStatusEnum } from 'enums/registrationEnums';
import { getMembershipProductStatus } from 'util/registrationHelper';
import registrationAxiosApi from '../../store/http/registrationHttp/registrationAxiosApi';
import history from 'util/history';
import Loader from '../../customComponents/loader';
const { confirm } = Modal;
const { Content } = Layout;
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
  let { regMembershipFeeListPageSize } = this_Obj.props.registrationState;
  regMembershipFeeListPageSize = regMembershipFeeListPageSize ? regMembershipFeeListPageSize : 10;
  this_Obj.props.regMembershipListAction(
    this_Obj.state.offset,
    regMembershipFeeListPageSize,
    this_Obj.state.yearRefId,
    sortBy,
    sortOrder,
  );
}
const listeners = key => ({
  onClick: () => tableSort(key),
});

//const isFootballState = isNationalProductEnabled && getOrganisationLevel() === AppConstants.state;
let isAssociation = false;
const orgItem = getOrganisationData();
if (orgItem && orgItem.organisationTypeRefId > 2) {
  isAssociation = true;
}
const columns = [
  {
    title: AppConstants.membershipProduct,
    dataIndex: 'membershipProductName',
    key: 'membershipProductName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('membershipProduct'),
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('membershipType'),
  },
  {
    title: AppConstants.discounts,
    dataIndex: 'isDiscountApplicable',
    key: 'isDiscountApplicable',
    render: isDiscountApplicable => <span>{isDiscountApplicable ? 'Yes' : 'No'}</span>,
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners('discounts'),
  },
  {
    title: AppConstants.seasonalFeeIncGst,
    dataIndex: 'seasonalFee',
    key: 'seasonalFee',
    render: (seasonalFee, record) => {
      let fee = JSON.parse(seasonalFee) + JSON.parse(record.seasonalGst);
      return <span>{currencyFormat(Math.max(0, fee))}</span>;
    },
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.casualFee,
    dataIndex: 'casualFee',
    key: 'casualFee',
    render: (casualFee, record) => {
      if (!!!record.isPlaying) return <span>N/A</span>;
      let fee = JSON.parse(casualFee) + JSON.parse(record.casualGst);
      return <span>{currencyFormat(Math.max(0, fee))}</span>;
    },
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusRefId',
    key: 'statusRefId',
    sorter: true,
    render: (statuRefId, record) => {
      let status = getMembershipProductStatus(statuRefId);
      return <span>{status}</span>;
    },
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.action,
    dataIndex: 'isUsed',
    key: 'isUsed',
    render: (isUsed, record) => {
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
                alt=""
                width="16"
                height="16"
              />
            }
          >
            {isAssociation ? (
              <Menu.Item key="5">
                <div onClick={() => this_Obj.editAssociationProduct(record.membershipProductId)}>
                  <span>Edit</span>
                </div>
              </Menu.Item>
            ) : (
              <>
                {isUsed == false ? (
                  <>
                    <Menu.Item key="1">
                      <NavLink
                        to={{
                          pathname: `/registrationMembershipFee`,
                          state: { id: record.membershipProductId },
                        }}
                      >
                        <span>Edit</span>
                      </NavLink>
                    </Menu.Item>
                    <Menu.Item
                      key="2"
                      onClick={() => this_Obj.showDeleteConfirm(record.membershipProductId)}
                    >
                      <span>Delete</span>
                    </Menu.Item>
                  </>
                ) : (
                  <Menu.Item key="3">
                    <NavLink
                      to={{
                        pathname: `/registrationMembershipFee`,
                        state: { id: record.membershipProductId },
                      }}
                    >
                      <span>View</span>
                    </NavLink>
                  </Menu.Item>
                )}
                {record.statusRefId == MembershipProductStatusEnum.Published && (
                  <Menu.Item
                    key="4"
                    onClick={() => this_Obj.showCloseConfirm(record.membershipProductId)}
                  >
                    <span>Close for new competitions</span>
                  </Menu.Item>
                )}
              </>
            )}
          </SubMenu>
        </Menu>
      );
    },
  },
];

class RegistrationMembershipList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: null,
      deleteLoading: false,
      offset: 0,
      sortBy: null,
      sortOrder: null,
      allyearload: false,
      currentPage: 1,
      loading: false,
    };
    this_Obj = this;
  }

  async componentDidMount() {
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    this.setState({
      allyearload: true,
    });
    // const { regMembershipListAction } = this.props.registrationState
    // routePermissionForOrgLevel(AppConstants.national, AppConstants.state)
    // let page = 1
    // let sortBy = this.state.sortBy
    // let sortOrder = this.state.sortOrder
    // if (regMembershipListAction) {
    //     let offset = regMembershipListAction.offset
    //     sortBy = regMembershipListAction.sortBy
    //     sortOrder = regMembershipListAction.sortOrder
    //     let yearRefId = regMembershipListAction.yearRefId

    //     await this.setState({ offset, sortBy, sortOrder, yearRefId })
    //     page = Math.floor(offset / 10) + 1;

    //     this.handleMembershipTableList(page, yearRefId)
    // } else {
    //     this.handleMembershipTableList(1, this.state.yearRefId)
    // }
  }

  async componentDidUpdate(nextProps) {
    if (this.props.registrationState.onLoad === false && this.state.deleteLoading) {
      this.setState({
        deleteLoading: false,
      });
      this.handleMembershipTableList(1, this.state.yearRefId);
    }
    if (this.state.allyearload === true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        let mainYearRefId = this.props.appState.yearRefId !== -1
          ? this.props.appState.yearRefId
          : getCurrentYear(this.props.appState.yearList);
        const { regMembershipListAction } = this.props.registrationState;
        routePermissionForMembership();
        let page = 1;
        let sortBy = this.state.sortBy;
        let sortOrder = this.state.sortOrder;
        if (regMembershipListAction) {
          let offset = regMembershipListAction.offset;
          sortBy = regMembershipListAction.sortBy;
          sortOrder = regMembershipListAction.sortOrder;
          let yearRefId = regMembershipListAction.yearRefId;

          await this.setState({ offset, sortBy, sortOrder, yearRefId, allyearload: false });
          let { regMembershipFeeListPageSize } = this.props.registrationState;
          regMembershipFeeListPageSize = regMembershipFeeListPageSize
            ? regMembershipFeeListPageSize
            : 10;
          page = Math.floor(offset / regMembershipFeeListPageSize) + 1;
          this.props.setYearRefId(yearRefId);
          this.handleMembershipTableList(page, yearRefId);
        } else {
          this.handleMembershipTableList(1, mainYearRefId);
          this.props.setYearRefId(mainYearRefId);
          this.setState({
            yearRefId: mainYearRefId,
            allyearload: false,
          });
        }
      }
    }
  }

  deleteProduct = membershipProductId => {
    this.props.regMembershipListDeleteAction(membershipProductId);
    this.setState({ deleteLoading: true });
  };
  closeProduct = async membershipProductId => {
    let payload = {
      membershipProductId: membershipProductId,
      statusRefId: MembershipProductStatusEnum.Closed,
    };
    try {
      let result = await registrationAxiosApi.registrationMembershipFeeListClose(payload);
      if (result && result.status === 1) {
        message.success(result.result.data.message);
      } else if (result && result.result.data.message) {
        message.error(result.result.data.message);
      }
    } catch (ex) {
      console.log(`Error in closeProduct ${ex}`);
    }
    this.handleMembershipTableList(this.state.currentPage, this.state.yearRefId);
  };
  editAssociationProduct = async membershipProductId => {
    let payload = {
      membershipProductUniqueKey: membershipProductId,
    };
    try {
      this.setState({ loading: true });
      let result = await registrationAxiosApi.createAssociationMembershipProduct(payload);
      this.setState({ loading: false });
      if (result && result.status === 1) {
        history.push({
          pathname: `/registrationMembershipFee`,
          state: { id: membershipProductId },
        });
      } else if (result && result.result.data.message) {
        message.error(result.result.data.message);
      }
    } catch (ex) {
      this.setState({ loading: false });
      console.log(`Error in editAssociationProduct ${ex}`);
    }
  };
  showDeleteConfirm = membershipProductId => {
    let this_ = this;
    confirm({
      title: AppConstants.productDeleteConfirmMsg,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deleteProduct(membershipProductId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  showCloseConfirm = membershipProductId => {
    let this_ = this;
    confirm({
      title: AppConstants.productCloseConfirmMsg,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.closeProduct(membershipProductId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setRegistrationMembershipListPageSizeAction(pageSize);
  };

  handleMembershipTableList = async (page, yearRefId) => {
    await this.props.setRegistrationMembershipListPageNumberAction(page);
    let { sortBy, sortOrder } = this.state;
    let { regMembershipFeeListPageSize } = this.props.registrationState;
    regMembershipFeeListPageSize = regMembershipFeeListPageSize ? regMembershipFeeListPageSize : 10;
    let offset = page ? regMembershipFeeListPageSize * (page - 1) : 0;
    this.setState({
      offset,
      currentPage: page,
    });
    this.props.regMembershipListAction(
      offset,
      regMembershipFeeListPageSize,
      yearRefId,
      sortBy,
      sortOrder,
    );
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.membershipFees}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  yearChange = yearRefId => {
    this.props.setYearRefId(yearRefId);
    this.setState({ yearRefId });
    this.handleMembershipTableList(1, yearRefId);
  };

  dropdownView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-2">
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  className="year-select reg-filter-select-year ml-2"
                  style={{ width: 90 }}
                  value={this.state.yearRefId}
                  onChange={e => this.yearChange(e)}
                >
                  {this.props.appState.yearList.map(item => (
                    <Option key={'year_' + item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            {!isAssociation && (
              <div
                className="col-sm d-flex align-items-center justify-content-end pb-3"
                onClick={() => this.props.clearReducerDataAction('getMembershipProductDetails')}
              >
                <NavLink
                  to={{ pathname: `/registrationMembershipFee`, state: { id: null, addNew: true } }}
                  className="text-decoration-none"
                >
                  <Button className="primary-add-product" type="primary">
                    + {AppConstants.addMembershipProduct}
                  </Button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  contentView = () => {
    const {
      regMembershipFeeListTotalCount,
      regMembershipFeeListData,
      regMembershipFeeListPage,
      onLoad,
      regMembershipFeeListPageSize,
    } = this.props.registrationState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={regMembershipFeeListData}
            pagination={false}
            loading={onLoad && true}
            rowKey={(record, index) => record.membershipProductId + index}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={regMembershipFeeListPage}
            defaultCurrent={regMembershipFeeListPage}
            defaultPageSize={regMembershipFeeListPageSize}
            total={regMembershipFeeListTotalCount}
            onChange={page => this.handleMembershipTableList(page, this.state.yearRefId)}
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
        <InnerHorizontalMenu menu="registration" regSelectedKey="4" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
            <Loader visible={this.state.loading} />
          </Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      regMembershipListAction,
      regMembershipListDeleteAction,
      clearReducerDataAction,
      setYearRefId,
      getOnlyYearListAction,
      setRegistrationMembershipListPageSizeAction,
      setRegistrationMembershipListPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    registrationState: state.RegistrationState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationMembershipList);

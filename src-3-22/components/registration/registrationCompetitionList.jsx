import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Breadcrumb, Button, Table, Input, Select, Menu, Pagination, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Tooltip from 'react-png-tooltip';
import AppConstants from 'themes/appConstants';
import { checkUserRole, getCurrentYear } from 'util/permissions';
import { currencyFormat } from 'util/currencyFormat';
import { stringTONumber } from 'util/helpers';
import {
  setYearRefId,
  getOnlyYearListAction,
  CLEAR_OWN_COMPETITION_DATA,
} from 'store/actions/appAction';
import {
  regCompetitionListAction,
  clearCompReducerDataAction,
  regCompetitionListDeleteAction,
  regCompetitionListArchiveAction,
  setPageSizeAction,
  setPageNumberAction,
} from 'store/actions/registrationAction/competitionFeeAction';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import AppImages from 'themes/appImages';
import './product.scss';

const { Content } = Layout;
const { Option } = Select;
const { SubMenu } = Menu;
let this_Obj = null;

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_Obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_Obj.state.sortBy === key && this_Obj.state.sortOrder === 'DESC') {
    sortBy = null;
    sortOrder = null;
  }

  this_Obj.setState({ sortBy, sortOrder });
  let { pageSize } = this_Obj.props.competitionFeesState;
  pageSize = pageSize || 10;
  this_Obj.props.regCompetitionListAction(
    this_Obj.state.offset,
    pageSize,
    this_Obj.state.yearRefId,
    this_Obj.state.searchText,
    sortBy,
    sortOrder,
  );
}

function totalSeasonalFees(seasonalFees1, record) {
  let affiliateFeeStatus;
  if (
    record.childSeasonalFeeValue == null &&
    record.childSeasonalGstValue == null &&
    record.parentCreator === false
  ) {
    affiliateFeeStatus = true; // need to verify to change
  } else {
    affiliateFeeStatus = false;
  }

  const childSeasonalFee = stringTONumber(record.childSeasonalFee);
  const childSeasonalGst = stringTONumber(record.childSeasonalGst);
  const mSeasonalfee = stringTONumber(record.mSeasonalfee);
  const mSeasonalgst = stringTONumber(record.mSeasonalgst);
  const seasonalGST = stringTONumber(record.seasonalGST);
  const seasonalFees = stringTONumber(record.seasonalFees);
  const parentFees = seasonalFees + seasonalGST + mSeasonalfee + mSeasonalgst;
  const childFees = parentFees + (childSeasonalFee + childSeasonalGst);
  const fee = record.parentCreator ? parentFees : childFees;

  return affiliateFeeStatus ? (
    <span>
      {record.feeOrgId == null
        ? 'N/A'
        : record.seasonalFees == null && record.seasonalGST == null
        ? 'N/A'
        : AppConstants.affiliateFeeNotSet}
    </span>
  ) : (
    <span>
      {record.seasonalFees == null && record.seasonalGST == null && record.parentCreator === true
        ? 'N/A'
        : currencyFormat(fee)}
    </span>
  );
}

function totalCasualFees(casualFees1, record) {
  let affiliateFeeStatus;
  if (
    record.childCasualFee == null &&
    record.childCasualGst == null &&
    record.parentCreator === false
  ) {
    affiliateFeeStatus = true; // need to verify to change
  } else {
    affiliateFeeStatus = false;
  }

  const childCasualFee = stringTONumber(record.childCasualFee);
  const childCasualGst = stringTONumber(record.childCasualGst);
  const mCasualfee = stringTONumber(record.mCasualfee);
  const mCasualgst = stringTONumber(record.mCasualgst);
  const casualGST = stringTONumber(record.casualGST);
  const casualFees = stringTONumber(record.casualFees);
  const parentFees = casualFees + casualGST + mCasualfee + mCasualgst;
  const childFees = parentFees + (childCasualFee + childCasualGst);
  const fee = record.parentCreator ? parentFees : childFees;

  return affiliateFeeStatus ? (
    <span>
      {record.feeOrgId == null
        ? 'N/A'
        : record.casualFees == null && record.casualGST == null
        ? 'N/A'
        : AppConstants.affiliateFeeNotSet}
    </span>
  ) : (
    <span>
      {record.casualFees == null && record.casualGST == null && record.parentCreator === true
        ? 'N/A'
        : currencyFormat(fee)}
    </span>
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
    title: AppConstants.organiser,
    dataIndex: 'organiser',
    key: 'organiser',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: organiser => <span>{organiser === null || organiser === '' ? 'N/A' : organiser}</span>,
  },
  {
    title: AppConstants.affiliate,
    dataIndex: 'affiliateName',
    key: 'affiliateName',
    sorter: true,
    onHeaderCell: () => listeners('affiliate'),
    render: affiliateName => (
      <span>{affiliateName === null || affiliateName === '' ? 'N/A' : affiliateName}</span>
    ),
  },
  {
    title: AppConstants.membershipProduct,
    dataIndex: 'membershipProductName',
    key: 'membershipProductName',
    sorter: true,
    onHeaderCell: () => listeners('membershipProduct'),
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
    sorter: true,
    onHeaderCell: () => listeners('membershipType'),
  },
  {
    title: AppConstants.registrationDivisions,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: true,
    onHeaderCell: () => listeners('registrationDivisions'),
    render: divisionName => (
      <span>{divisionName === null || divisionName === '' ? 'N/A' : divisionName}</span>
    ),
  },
  {
    title: AppConstants.totalFeeSeasonalIncGst,
    dataIndex: 'seasonalFees',
    key: 'seasonalFees',
    render: (seasonalFees, record) => totalSeasonalFees(seasonalFees, record),
    sorter: true,
    onHeaderCell: () => listeners('totalSeasonalFee'),
  },
  {
    title: AppConstants.totalFeeSingleGameIncGst,
    dataIndex: 'casualFees',
    key: 'casualFees',
    render: (casualFees, record) => totalCasualFees(casualFees, record),
    sorter: true,
    filterDropdown: true,
    filterIcon: () => (
      <div
        className="d-flex justify-content-center align-items-center mt-10"
        style={{ width: 20, marginRight: 10 }}
      >
        <Tooltip>
          <span>{AppConstants.totalFeeMsg}</span>
        </Tooltip>
      </div>
    ),
    onHeaderCell: () => listeners('totalCasualFee'),
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
                pathname: '/registrationCompetitionFee',
                state: {
                  id: record.competitionUniqueKey,
                  affiliateOrgId: record.affiliateOrgId,
                  yearRefId: this_Obj.state.yearRefId,
                  isEdit: true,
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

class RegistrationCompetitionList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      yearRefId: null,
      deleteLoading: false,
      userRole: '',
      searchText: '',
      offset: 0,
      sortBy: null,
      sortOrder: null,
      allyearload: false,
    };

    this_Obj = this;
    this.props.CLEAR_OWN_COMPETITION_DATA();
  }

  async componentDidMount() {
    this.props.getOnlyYearListAction(this.props.appState.yearList);
    this.setState({
      allyearload: true,
    });
    checkUserRole().then(value => this.setState({ userRole: value }));
  }

  componentDidUpdate(nextProps) {
    const { competitionListAction } = this.props.competitionFeesState;
    if (this.props.competitionFeesState.onLoad === false && this.state.deleteLoading === true) {
      this.setState({
        deleteLoading: false,
      });
      this.handleCompetitionTableList(1, this.state.yearRefId, this.state.searchText);
    }
    if (this.state.allyearload === true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        let page = 1;
        let { sortBy } = this.state;
        let { sortOrder } = this.state;
        const yearId = this.props.appState.yearRefId !== -1
          ? this.props.appState.yearRefId
          : getCurrentYear(this.props.appState.yearList);
        this.props.setYearRefId(yearId);
        if (competitionListAction) {
          const { offset } = competitionListAction;
          sortBy = competitionListAction.sortBy;
          sortOrder = competitionListAction.sortOrder;
          // const { yearRefId } = competitionListAction;
          const yearRefId = JSON.parse(yearId);
          const { searchText } = competitionListAction;

          this.setState({
            offset,
            sortBy,
            sortOrder,
            yearRefId,
            searchText,
          });
          page = Math.floor(offset / 10) + 1;

          this.handleCompetitionTableList(page, yearRefId, searchText);
          this.setState({ yearRefId, allyearload: false });
        } else {
          this.handleCompetitionTableList(1, JSON.parse(yearId), this.state.searchText);
          this.setState({ yearRefId: JSON.parse(yearId), allyearload: false });
        }
      }
    }
  }

  headerView = () => (
    <div className="comp-player-grades-header-view-design">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">Competition Fees</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );

  yearChange = yearRefId => {
    this.setState({ yearRefId });
    this.props.setYearRefId(yearRefId);
    this.handleCompetitionTableList(1, yearRefId, this.state.searchText);
  };

  onChangeSearchText = e => {
    this.setState({ searchText: e.target.value });

    if (!e.target.value) {
      this.handleCompetitionTableList(1, this.state.yearRefId, e.target.value);
    }
  };

  onKeyEnterSearchText = e => {
    const code = e.keyCode || e.which;
    if (code === 13) {
      // 13 is the enter keycode
      this.handleCompetitionTableList(1, this.state.yearRefId, this.state.searchText);
    }
  };

  onClickSearchIcon = () => {
    if (this.state.searchText) {
      this.handleCompetitionTableList(1, this.state.yearRefId, this.state.searchText);
    }
  };

  dropdownView = () => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="fluid-width">
        <div className="row">
          <div className="col-sm-2">
            <div className="com-year-select-heading-view pb-3">
              <span className="year-select-heading" style={{ width: 50 }}>
                {`${AppConstants.year}:`}
              </span>
              <Select
                style={{ width: 90 }}
                className="year-select reg-filter-select-year ml-2"
                value={this.state.yearRefId}
                onChange={this.yearChange}
              >
                {this.props.appState.yearList.map(item => (
                  <Option key={`year_${item.id}`} value={item.id}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="col-sm" />

          <div className="d-flex align-items-center" style={{ marginRight: 25 }}>
            <div className="comp-product-search-inp-width pb-3">
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
          </div>

          {/* {this.state.userRole == AppConstants.admin && ( */}
          <div className="d-flex align-items-center" style={{ marginRight: '1%' }}>
            <div
              className="d-flex flex-row-reverse button-with-search pb-3"
              // className="col-sm d-flex justify-content-end"
              onClick={() => this.props.clearCompReducerDataAction('all')}
            >
              <NavLink
                to={{ pathname: '/registrationCompetitionFee', state: { id: null, isEdit: false } }}
                className="text-decoration-none"
              >
                <Button className="primary-add-product" type="primary">
                  {`+ ${AppConstants.addCompetition}`}
                </Button>
              </NavLink>
            </div>
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );

  handleShowSizeChange = async (page, pageSize) => {
    await this.props.setPageSizeAction(pageSize);
  };

  handleCompetitionTableList = async (page, yearRefId, searchText) => {
    await this.props.setPageNumberAction(page);

    const { sortBy, sortOrder } = this.state;
    let { pageSize } = this.props.competitionFeesState;
    pageSize = pageSize || 10;
    const offset = page ? pageSize * (page - 1) : 0;
    this.setState({ offset });
    this.props.regCompetitionListAction(offset, pageSize, yearRefId, searchText, sortBy, sortOrder);
  };

  contentView = () => {
    const {
      regCompetitonFeeListTotalCount,
      regCompetitionFeeListData,
      regCompetitonFeeListPage,
      onLoad,
      pageSize,
    } = this.props.competitionFeesState;

    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view table-competition">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={regCompetitionFeeListData}
            pagination={false}
            loading={onLoad === true && true}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={regCompetitonFeeListPage}
            defaultCurrent={regCompetitonFeeListPage}
            defaultPageSize={pageSize}
            showSizeChanger
            total={regCompetitonFeeListTotalCount}
            onChange={page =>
              this.handleCompetitionTableList(page, this.state.yearRefId, this.state.searchText)
            }
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

        <InnerHorizontalMenu menu="registration" regSelectedKey="7" />

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
      regCompetitionListAction,
      setYearRefId,
      getOnlyYearListAction,
      clearCompReducerDataAction,
      regCompetitionListDeleteAction,
      regCompetitionListArchiveAction,
      CLEAR_OWN_COMPETITION_DATA,
      setPageSizeAction,
      setPageNumberAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFeesState: state.CompetitionFeesState,
    appState: state.AppState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationCompetitionList);

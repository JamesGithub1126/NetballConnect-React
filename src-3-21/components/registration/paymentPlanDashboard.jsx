import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Table,
  Select,
  Menu,
  Pagination,
  Modal,
  message,
  DatePicker,
  InputNumber,
  Input,
  Tooltip,
  Form,
} from 'antd';
import './product.scss';
import { NavLink } from 'react-router-dom';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { getCurrentYear } from 'util/permissions';
import { bindActionCreators } from 'redux';
import { regDashboardListAction } from '../../store/actions/registrationAction/registrationDashboardAction';
import { setYearRefId, getOnlyYearListAction } from '../../store/actions/appAction';
import { currencyFormat } from '../../util/currencyFormat';
import { getGlobalYear, getOrganisationData } from 'util/sessionStorage';
import {
  FrequencyType,
  MembershipProductStatusEnum,
  PaymentPlanStatus,
} from 'enums/registrationEnums';
import { getMembershipProductStatus } from 'util/registrationHelper';
import registrationAxiosApi from '../../store/http/registrationHttp/registrationAxiosApi';
import history from 'util/history';
import Loader from '../../customComponents/loader';
import { ErrorType } from 'util/enums';
import { handleError } from 'util/messageHandler';
import { getOrdinalString, randomKeyGen } from 'util/helpers';
import { weekdayDef } from 'themes/dateformate';
import InputWithHead from 'customComponents/InputWithHead';
import moment from 'moment';
import ValidationConstants from 'themes/validationConstant';
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

  this_Obj.getPaymentPlanList(
    this_Obj.state.yearRefId,
    this_Obj.state.competitionUniqueKey,
    this_Obj.state.offset,
    this_Obj.state.pageSize,
    sortBy,
    sortOrder,
  );
}
const listeners = key => ({
  onClick: () => tableSort(key),
});

const columns = [
  {
    title: AppConstants.name,
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.email,
    dataIndex: 'email',
    key: 'email',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.minPercentage,
    dataIndex: 'minPercentageUpfront',
    key: 'minPercentageUpfront',
    render: minPercentageUpfront => <span>{(minPercentageUpfront * 100).toFixed(2)}</span>,
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.dueBy,
    dataIndex: 'dueDate',
    key: 'dueDate',
    render: (dueDate, record) => {
      let date = new Date(dueDate.replace('Z', '')).toLocaleDateString();
      return <span>{date}</span>;
    },
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.status,
    dataIndex: 'statusText',
    key: 'statusText',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.paidUpfront,
    dataIndex: 'paidUpfront',
    key: 'paidUpfront',
    sorter: true,
    render: (paidUpfront, record) => {
      let fee = '';
      if (paidUpfront && parseFloat(paidUpfront) > 0) {
        fee = currencyFormat(parseFloat(paidUpfront));
      }
      return <span>{fee}</span>;
    },
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.frequency,
    dataIndex: 'frequencyTypeText',
    key: 'frequencyTypeText',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.when,
    dataIndex: 'dayOfFrequency',
    key: 'dayOfFrequency',
    render: (dayOfFrequency, record) => {
      let dayText = '';
      if (record.frequencyTypeRefId > 0) {
        if (record.frequencyTypeRefId == FrequencyType.DayOfMonth) {
          dayText = getOrdinalString(dayOfFrequency);
        } else {
          dayText = weekdayDef[dayOfFrequency];
        }
      }
      return <span>{dayText}</span>;
    },
  },
  {
    title: AppConstants.starting,
    dataIndex: 'startDate',
    key: 'startDate',
    sorter: true,
    render: (startDate, record) => {
      let date = '';
      if (startDate) {
        date = new Date(startDate.replace('Z', '')).toLocaleDateString();
      }
      return <span>{date}</span>;
    },
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (isUsed, record) => {
      let notUsed = record.statusRefId == PaymentPlanStatus.NotUsed;

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
            {notUsed && (
              <>
                <Menu.Item key="1" onClick={() => this_Obj.resendEmail(record)}>
                  <span>{AppConstants.resendEmail}</span>
                </Menu.Item>
                <Menu.Item key="2" onClick={() => this_Obj.showDeleteConfirm(record.id)}>
                  <span>{AppConstants.delete}</span>
                </Menu.Item>
              </>
            )}
          </SubMenu>
        </Menu>
      );
    },
  },
];

class PaymentPlanDashboard extends Component {
  constructor(props) {
    super(props);
    this.emptyPaymentPlan = {
      name: '',
      email: '',
      minPercentageUpfront: null,
      dueDate: null,
    };
    this.state = {
      yearRefId: this.props.location.state ? this.props.location.state.yearRefId : null,
      deleteLoading: false,
      offset: 0,
      sortBy: null,
      sortOrder: null,
      allyearload: false,
      currentPage: 1,
      pageSize: 10,
      loading: false,
      paymentPlanResult: null,
      competitions: [],
      competitionUniqueKey: this.props.location.state
        ? this.props.location.state.competitionUniqueKey
        : -1,
      addPaymentPlanModalVisible: false,
      newPaymentPlan: this.emptyPaymentPlan,
      higherOrgNames: '',
      isDirectComp: false,
    };
    this_Obj = this;
    this.formRef = React.createRef();
  }

  async componentDidMount() {
    this.props.getOnlyYearListAction(this.props.appState.yearList);

    this.setState({
      allyearload: true,
    });
  }

  async componentDidUpdate(prevProps) {
    if (this.state.allyearload === true && this.props.appState.onLoad == false) {
      if (this.props.appState.yearList.length > 0) {
        let mainYearRefId = this.state.yearRefId;
        if (!mainYearRefId) {
          mainYearRefId = getGlobalYear()
            ? getGlobalYear()
            : getCurrentYear(this.props.appState.yearList);
          mainYearRefId = JSON.parse(mainYearRefId);
        }
        //const { regMembershipListAction } = this.props.registrationState;

        // if (regMembershipListAction) {
        //   let offset = regMembershipListAction.offset;
        //   sortBy = regMembershipListAction.sortBy;
        //   sortOrder = regMembershipListAction.sortOrder;
        //   let yearRefId = regMembershipListAction.yearRefId;

        //   await this.setState({ offset, sortBy, sortOrder, yearRefId, allyearload: false });
        //   let { regMembershipFeeListPageSize } = this.props.registrationState;
        //   regMembershipFeeListPageSize = regMembershipFeeListPageSize
        //     ? regMembershipFeeListPageSize
        //     : 10;
        //   page = Math.floor(offset / regMembershipFeeListPageSize) + 1;
        //   this.props.setYearRefId(yearRefId);
        //   this.getCompetitions(yearRefId);
        //   this.handleMembershipTableList(page, this.state.competitionUniqueKey);
        // } else {
        this.getCompetitions(mainYearRefId);
        this.props.setYearRefId(mainYearRefId);
        this.setState({
          yearRefId: mainYearRefId,
          allyearload: false,
        });
        //}
      }
    }
    if (this.props.dashboardState.onLoad === false && prevProps.dashboardState.onLoad == true) {
      const { regDashboardListData } = this.props.dashboardState;
      let competitionUniqueKey = this.state.competitionUniqueKey;
      let competitions = [{ competitionId: -1, competitionName: 'All' }, ...regDashboardListData];
      this.setState({ competitions: competitions });
      this.handleMembershipTableList(1, competitionUniqueKey);
      if (competitionUniqueKey != -1) {
        this.getCompetitionOrganisations(competitionUniqueKey);
      }
    }
  }
  deletePaymentPlan = async paymentPlanId => {
    try {
      let result = await registrationAxiosApi.paymentPlanDelete(paymentPlanId);
      if (result && result.status === 1) {
        message.success(result.result.data.message);
        this.handleMembershipTableList(this.state.currentPage, this.state.competitionUniqueKey);
      } else if (result && result.result.data.message) {
        message.error(result.result.data.message);
      }
    } catch (ex) {
      console.log(`Error in deletePaymentPlan ${ex}`);
    }
  };

  showDeleteConfirm = paymentPlanId => {
    let this_ = this;
    confirm({
      title: AppConstants.productDeleteConfirmMsg,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        this_.deletePaymentPlan(paymentPlanId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  handleShowSizeChange = async (page, pageSize) => {
    let offset = page ? pageSize * (page - 1) : 0;
    this.setState({ pageSize: pageSize, offset: offset, currentPage: page });
  };

  handleMembershipTableList = async (page, competitionUniqueKey) => {
    let { sortBy, sortOrder } = this.state;
    let offset = page ? this.state.pageSize * (page - 1) : 0;
    this.setState({
      currentPage: page,
      offset: offset,
    });
    this.getPaymentPlanList(
      this.state.yearRefId,
      competitionUniqueKey,
      offset,
      this.state.pageSize,
      sortBy,
      sortOrder,
    );
  };
  getCompetitions = yearRefId => {
    this.props.regDashboardListAction(0, 1000, yearRefId, null, null);
  };
  getPaymentPlanList = async (
    yearRefId,
    competitionUniqueKey,
    offset,
    pageSize,
    sortBy,
    sortOrder,
  ) => {
    try {
      this.setState({ loading: true });
      let payload = {
        yearRefId: yearRefId,
        competitionUniqueKey: competitionUniqueKey,
        paging: {
          limit: pageSize,
          offset: offset,
        },
        sortBy,
        sortOrder,
      };
      const result = await registrationAxiosApi.getPaymentPlanList(payload);
      if (result.status == 1) {
        this.setState({ paymentPlanResult: result.result.data });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
      handleError({ type: ErrorType.Error, error });
    }
  };
  getCompetitionOrganisations = async competitionUniqueKey => {
    try {
      const result = await registrationAxiosApi.getOrganisationsForCompetition(
        competitionUniqueKey,
      );
      if (result.status == 1) {
        let parentOrgs = result.result.data || [];
        const orgItem = getOrganisationData();
        let isDirectComp = false;
        let competition = this.state.competitions.find(
          x => x.competitionId == competitionUniqueKey,
        );
        if (competition) {
          isDirectComp = competition.invId == 5;
        }
        parentOrgs = parentOrgs
          .filter(x => x.organisationId != orgItem.organisationId)
          .map(x => x.name);
        this.setState({ higherOrgNames: parentOrgs.join(', '), isDirectComp: isDirectComp });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  createPaymentPlan = async payload => {
    try {
      const result = await registrationAxiosApi.createPaymentPlan(payload);
      if (result.status == 1) {
        this.handleMembershipTableList(1, this.state.competitionUniqueKey);
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };
  yearChange = yearRefId => {
    this.props.setYearRefId(yearRefId);
    this.setState({ yearRefId, competitionUniqueKey: -1 });
    this.getCompetitions(yearRefId);
    //this.handleMembershipTableList(1, yearRefId);
  };
  competitionChange = competitionUniqueKey => {
    this.setState({ competitionUniqueKey: competitionUniqueKey });
    this.handleMembershipTableList(1, competitionUniqueKey);
    if (competitionUniqueKey != -1) {
      this.getCompetitionOrganisations(competitionUniqueKey);
    }
  };
  onChangeDueDate = e => {
    let newPaymentPlan = this.state.newPaymentPlan;
    newPaymentPlan.dueDate = e.format('YYYY-MM-DD');
    this.setState({ updateUI: true });
  };
  getAddPaymentPlanMessage = () => {
    let addMessage = AppConstants.addPaymentPlanMessageTemplate;
    const orgItem = getOrganisationData();
    let registerOrgName = orgItem.name;
    let higherOrgNames = this.state.higherOrgNames;
    if (higherOrgNames == '' && this.state.isDirectComp) {
      addMessage = '';
    } else {
      addMessage = addMessage
        .replace('$registeringOrg', registerOrgName)
        .replace('$higherOrgNames', higherOrgNames);
    }
    return addMessage;
  };
  onSendEmail = () => {
    this.formRef.current
      .validateFields()
      .then(value => {
        let newPaymentPlan = this.state.newPaymentPlan;
        if (newPaymentPlan.dueDate) {
          if (new Date(newPaymentPlan.dueDate).getTime() < new Date().getTime()) {
            message.error(ValidationConstants.dueDateInFuture);
            return;
          }
        }
        let code = randomKeyGen(8);
        let payload = {
          competitionUniqueKey: this.state.competitionUniqueKey,
          name: newPaymentPlan.name,
          email: newPaymentPlan.email,
          minPercentageUpfront: newPaymentPlan.minPercentageUpfront / 100,
          dueDate: newPaymentPlan.dueDate,
          code: code,
        };
        this.createPaymentPlan(payload);
        this.setState({
          addPaymentPlanModalVisible: false,
          newPaymentPlan: { ...this.emptyPaymentPlan },
        });
        this.formRef.current.resetFields();
        let competition = this.state.competitions.find(
          x => x.competitionId == this.state.competitionUniqueKey,
        );
        this.openMailClient(newPaymentPlan, competition, code);
      })
      .catch(err => {
        console.log(err);
      });
  };
  resendEmail = record => {
    let competition = this.state.competitions.find(
      x => x.competitionId == record.competitionUniqueKey,
    );
    this.openMailClient(record, competition, record.code);
  };
  openMailClient = (newPaymentPlan, competition, code) => {
    const orgItem = getOrganisationData();
    let registerOrgName = orgItem.name;
    let mailTemplate = AppConstants.paymentPlanMailContentTemplate;
    let body = mailTemplate
      .replace('$userName', newPaymentPlan.name)
      .replace('$registeringOrg', registerOrgName)
      .replace('$competitionName', competition.competitionName)
      .replace('$link', competition.userRegistrationUrl + '&paymentPlanCode=' + code);
    body = `${body} \n  \n \nRegards,  \n${registerOrgName}`;
    let subject = AppConstants.paymentPlanMailSubject;
    let mailto = `mailto:${newPaymentPlan.email}?subject=${
      encodeURIComponent(subject) || ''
    }&body=${encodeURIComponent(body) || ''}`;
    window.open(mailto, '_blank');
  };
  onCancelPaymentPlanModal = () => {
    this.setState({
      addPaymentPlanModalVisible: false,
      newPaymentPlan: { ...this.emptyPaymentPlan },
    });
    this.formRef.current.resetFields();
  };
  onFinish = () => {};
  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };
  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.paymentPlan}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  dropdownView = () => {
    let addDisabled =
      this.state.competitionUniqueKey == -1 ||
      (this.state.higherOrgNames == '' && !this.state.isDirectComp);
    let disableTitle = AppConstants.chooseCompetition;
    if (this.state.competitionUniqueKey != -1 && this.state.higherOrgNames == '') {
      disableTitle = AppConstants.cannotAddPaymentPlan;
    }

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
            <div className="col-sm-3">
              <div className="com-year-select-heading-view pb-3">
                <span className="year-select-heading">{AppConstants.competition}:</span>
                <Select
                  className="reg-filter-select-year ml-2"
                  value={this.state.competitionUniqueKey}
                  onChange={e => this.competitionChange(e)}
                  style={{ minWidth: 250 }}
                >
                  {this.state.competitions.map(item => (
                    <Option key={'comp_' + item.competitionId} value={item.competitionId}>
                      {item.competitionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm d-flex align-items-center justify-content-end pb-3">
              {addDisabled ? (
                <Tooltip placement="top" title={disableTitle}>
                  {this.addButton(addDisabled)}
                </Tooltip>
              ) : (
                this.addButton(addDisabled)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  addButton = disabled => {
    return (
      <Button
        className="primary-add-product"
        type="primary"
        disabled={disabled}
        onClick={() => this.setState({ addPaymentPlanModalVisible: true })}
      >
        + {AppConstants.add}
      </Button>
    );
  };

  contentView = () => {
    let paymentPlanResult = this.state.paymentPlanResult;
    let total = 0;
    let data = [];
    if (paymentPlanResult) {
      total = paymentPlanResult.page.totalCount;
      data = paymentPlanResult.data;
    }
    let onLoad = this.state.loading;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={onLoad}
            rowKey={(record, index) => record.id}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            showSizeChanger
            current={this.state.currentPage}
            defaultCurrent={this.state.currentPage}
            defaultPageSize={this.state.pageSize}
            total={total}
            onChange={page => this.handleMembershipTableList(page, this.state.competitionUniqueKey)}
            onShowSizeChange={this.handleShowSizeChange}
          />
        </div>
      </div>
    );
  };
  addPaymentPlanModal = () => {
    let newPaymentPlan = this.state.newPaymentPlan;
    let addMessage = this.getAddPaymentPlanMessage();
    return (
      <Modal
        title={AppConstants.addPaymentPlan}
        visible={this.state.addPaymentPlanModalVisible}
        onCancel={() => this.onCancelPaymentPlanModal()}
        onOk={() => this.onSendEmail()}
        okText={AppConstants.sendEmail}
        cancelButtonProps={{ className: 'ant-btn-cancel-button' }}
        width={550}
      >
        <Form
          ref={this.formRef}
          autoComplete="off"
          onFinish={this.onFinish}
          noValidate="noValidate"
          onFinishFailed={this.onFinishFailed}
          preserve={false}
        >
          <p>{addMessage}</p>
          <div className="row">
            <div className="col">
              <Form.Item
                name={`planName`}
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.nameisrequired,
                  },
                ]}
              >
                <InputWithHead
                  name="name"
                  heading={AppConstants.name}
                  placeholder={AppConstants.name}
                  onChange={e => {
                    newPaymentPlan.name = e.target.value.trim();
                    this.setState({ updateUI: true });
                  }}
                  value={newPaymentPlan.name}
                />
              </Form.Item>
            </div>
            <div className="col">
              <Form.Item
                name={`email`}
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.emailField[0],
                  },
                ]}
              >
                <InputWithHead
                  name="email"
                  heading={AppConstants.email}
                  placeholder={AppConstants.email}
                  onChange={e => {
                    newPaymentPlan.email = e.target.value.trim().toLowerCase();
                    this.setState({ updateUI: true });
                  }}
                  value={newPaymentPlan.email}
                />
              </Form.Item>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <InputWithHead
                heading={AppConstants.minPercentageUpfront}
                conceptulHelp
                conceptulHelpMsg={AppConstants.minPercentageHelpText}
              />
              <Form.Item
                name={`minPercentage`}
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.minPercentageRequired,
                  },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  addonAfter="%"
                  onChange={e => {
                    let minP = e.target.value;
                    if (minP > 100) {
                      minP = 100;
                    } else if (minP < 0) {
                      minP = -minP;
                    }
                    minP = parseInt(minP * 100) / 100;
                    newPaymentPlan.minPercentageUpfront = minP;
                    this.formRef.current.setFieldsValue({ minPercentage: minP });
                    this.setState({ updateUI: true });
                  }}
                  value={newPaymentPlan.minPercentageUpfront}
                />
              </Form.Item>
            </div>
            <div className="col">
              <InputWithHead heading={AppConstants.finalDueDate} />
              <Form.Item
                name={`dueDate`}
                rules={[
                  {
                    required: true,
                    message: ValidationConstants.dueDateRequired,
                  },
                ]}
              >
                <DatePicker
                  size="default"
                  className="w-100"
                  onChange={e => this.onChangeDueDate(e)}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  name="dueDate"
                  value={newPaymentPlan.dueDate && moment(newPaymentPlan.dueDate, 'YYYY-MM-DD')}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    );
  };
  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.finance} menuName={AppConstants.finance} />
        <InnerHorizontalMenu menu="finance" finSelectedKey="27" />
        <Layout>
          {this.headerView()}
          <Content>
            {this.dropdownView()}
            {this.contentView()}
            {this.addPaymentPlanModal()}
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
      setYearRefId,
      getOnlyYearListAction,
      regDashboardListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    registrationState: state.RegistrationState,
    appState: state.AppState,
    dashboardState: state.RegistrationDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentPlanDashboard);

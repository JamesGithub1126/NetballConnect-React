import React, { Component, createRef } from 'react';
import {
  Layout,
  Breadcrumb,
  Button,
  Checkbox,
  Select,
  DatePicker,
  Form,
  message,
  Modal,
} from 'antd';
import './competition.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import InputWithHead from '../../customComponents/InputWithHead';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import history from '../../util/history';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getYearListAction, getYearAndCompetitionOwnAction } from '../../store/actions/appAction';
import {
  updateReplicateSaveObjAction,
  replicateSaveAction,
  getOldMembershipProductsByCompIdAction,
  getNewMembershipProductByYearAction,
} from '../../store/actions/competitionModuleAction/competitionDashboardAction';
import { setOwn_competition, getOrganisationData, setGlobalYear } from '../../util/sessionStorage';
import ValidationConstants from '../../themes/validationConstant';
import Loader from '../../customComponents/loader';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

class CompetitionReplicate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: 1,
      buttonSave: null,
      hasRegistration: 0,
      saveLoad: false,
    };

    this.getReference(null);
    this.formRef = createRef();
  }

  async componentDidUpdate(nextProps) {
    try {
      if (!this.props.competitionDashboardState.replicateSaveOnLoad && this.state.saveLoad) {
        this.setState({ saveLoad: false });
        if (this.props.competitionDashboardState.status == 4) {
          message.error(this.props.competitionDashboardState.replicateSaveErrorMessage);
        } else {
          await setOwn_competition(this.props.competitionDashboardState.competitionId);
          await setGlobalYear(this.props.competitionDashboardState.yearRefId);

          if (this.state.hasRegistration != 1) {
            history.push({ pathname: '/competitionOpenRegForm', state: { fromReplicate: 1 } });
          } else {
            history.push('/registrationCompetitionFee', {
              id: this.props.competitionDashboardState.competitionId,
            });
          }
        }
        this.setState({ buttonSave: null });
      }
    } catch (ex) {
      console.log('Error in componentDidUpdate::' + ex);
    }
  }

  getReference = yearId => {
    try {
      this.props.getYearAndCompetitionOwnAction(
        this.props.appState.own_YearArr,
        yearId,
        'own_competition',
      );
    } catch (ex) {
      console.log('Error in referenceApiCalls::' + ex);
    }
  };

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex align-items-center bg-transparent">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.replicateCompetition}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  onChangeDates = (value, dates) => {
    this.onChangeReplicateValue(dates, 'details', 'competitionDates');
    this.onChangeReplicateValue(dates[0], 'details', 'competitionStartDate');
    this.onChangeReplicateValue(dates[1], 'details', 'competitionEndDate');
  };

  onChangeReplicateValue = (data, key, subKey, index) => {
    this.props.updateReplicateSaveObjAction(data, key, subKey, index);
    switch (subKey) {
      case 'oldYearRefId':
        this.getReference(data);
        break;
      case 'oldCompetitionId':
        this.setHasRegistration(data);
        break;
      case 'newYearRefId':
        this.getNewMembershipProducts(data);
        break;
      default:
    }
  };

  setHasRegistration = competitionId => {
    try {
      const { all_own_CompetitionArr } = this.props.appState;
      let competition = all_own_CompetitionArr.find(x => x.competitionId === competitionId);
      if (competition) {
        this.setState({ hasRegistration: competition.hasRegistration });
        if (competition.hasRegistration === 1) {
          // this.onChangeReplicateValue(null, 'details', 'newYearRefId');
          this.formRef.current.setFieldsValue({
            [`newYearRefId`]: null,
          });
          let payload = {
            competitionUniqueKey: competition.competitionId,
            organisationUniqueKey: getOrganisationData()
              ? getOrganisationData().organisationUniqueKey
              : null,
          };
          this.props.getOldMembershipProductsByCompIdAction(payload);
        }
      }
    } catch (ex) {
      console.log('Error in setHasRegistration::' + ex);
    }
  };

  getNewMembershipProducts = yearRefId => {
    try {
      if (this.state.hasRegistration == 1) {
        let payload = {
          yearRefId,
          organisationUniqueKey: getOrganisationData()
            ? getOrganisationData().organisationUniqueKey
            : null,
        };
        this.props.getNewMembershipProductByYearAction(payload);
      }
    } catch (ex) {
      console.log('Error in getNewMembershipProducts::' + ex);
    }
  };

  checkDuplicateNewMembershipProduct = replicateSave => {
    try {
      const membershipProducts = replicateSave.membershipProducts.map(function (item) {
        return item.newProducts.membershipProductUniqueKey;
      });
      const isDuplicate = membershipProducts.some(function (item, index) {
        return membershipProducts.indexOf(item) != index;
      });
      return isDuplicate;
    } catch (ex) {
      console.log('Error in checkDuplicateNewMembershipProduct::' + ex);
    }
  };

  saveRelicate = values => {
    try {
      const { replicateSave } = this.props.competitionDashboardState;
      if (this.state.hasRegistration == 1) {
        let checkDuplicate = this.checkDuplicateNewMembershipProduct(replicateSave);
        if (checkDuplicate) {
          message.error(ValidationConstants.newMembershipDuplicateError);
          return;
        }
      }

      this.props.replicateSaveAction(replicateSave);
      this.setState({ saveLoad: true });
    } catch (ex) {
      console.log('Error in saveReplicate::' + ex);
    }
  };

  contentView = () => {
    const { own_YearArr, all_own_CompetitionArr } = this.props.appState;
    const { replicateSave, oldMembershipProducs, newMembershipProducs } =
      this.props.competitionDashboardState;
    return (
      <div className="content-view pt-5">
        <span className="form-heading">{AppConstants.replicateWhichCompetition}</span>

        <div className="fluid-width">
          <div className="row pt-4">
            <div className="col-sm-5" style={{ minWidth: 250 }}>
              <div className="row">
                <div className="col-sm-4">
                  <InputWithHead heading={AppConstants.year} />
                </div>
                <div className="col-sm">
                  <Form.Item
                    name="oldYearRefId"
                    rules={[{ required: true, message: ValidationConstants.yearIsRequired }]}
                  >
                    <Select
                      className="w-100"
                      style={{ paddingRight: 1, minWidth: 160 }}
                      onChange={year =>
                        this.onChangeReplicateValue(year, 'details', 'oldYearRefId')
                      }
                      value={replicateSave.details.oldYearRefId}
                    >
                      {own_YearArr.map(item => (
                        <Option key={'year_' + item.id} value={item.id}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="col-sm">
              <div className="row">
                <div className="col-sm-4" style={{ minWidth: 150 }}>
                  <InputWithHead heading={'Competition Name'} />
                </div>
                <div className="col-sm">
                  <Form.Item
                    name="oldCompetitionId"
                    rules={[
                      { required: true, message: ValidationConstants.competitionNameIsRequired },
                    ]}
                  >
                    <Select
                      className="w-100"
                      style={{ paddingRight: 1, minWidth: 182 }}
                      onChange={compName =>
                        this.onChangeReplicateValue(compName, 'details', 'oldCompetitionId')
                      }
                      value={replicateSave.details.oldCompetitionId}
                    >
                      {all_own_CompetitionArr.map(item => (
                        <Option
                          key={'competition_' + item.competitionId}
                          value={item.competitionId}
                        >
                          {item.competitionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className="form-heading pt-4">{AppConstants.newCompetition}</span>

        <div className="row pt-4">
          <div className="col-sm">
            <div className="row">
              <div className="col-sm-4">
                <InputWithHead heading={AppConstants.year} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name="newYearRefId"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.yearIsRequired,
                    },
                  ]}
                >
                  <Select
                    className="w-100"
                    style={{ paddingRight: 1, minWidth: 182 }}
                    onChange={year => this.onChangeReplicateValue(year, 'details', 'newYearRefId')}
                    value={replicateSave.details.newYearRefId}
                  >
                    {own_YearArr.map(item => (
                      <Option key={'year_' + item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className="row pt-4">
          <div className="col-sm">
            <div className="row">
              <div className="col-sm-4">
                <InputWithHead heading={AppConstants.competitionName} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name="competitionName"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.competitionNameIsRequired,
                    },
                  ]}
                >
                  <InputWithHead
                    auto_complete="off"
                    placeholder={AppConstants.competitionName}
                    value={replicateSave.details.competitionName}
                    onChange={e =>
                      this.onChangeReplicateValue(e.target.value, 'details', 'competitionName')
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {this.state.hasRegistration == 1 && (
          <div>
            <span className="form-heading pt-4" style={{ fontSize: 16 }}>
              {AppConstants.setMembershipProducts}
            </span>

            {(oldMembershipProducs || []).map((oldProduct, oldProductIndex) => (
              <div className="row">
                <div className="col-sm-4">
                  <InputWithHead heading={oldProduct.membershipProductName} />
                </div>
                <div className="col-sm">
                  <Form.Item
                    name={`anyUniqKey${oldProductIndex}`}
                    rules={[
                      {
                        required: true,
                        message: ValidationConstants.membershipProductIsRequired1,
                      },
                    ]}
                  >
                    <Select
                      className="w-100"
                      onChange={membershipProductUniqueKey =>
                        this.onChangeReplicateValue(
                          membershipProductUniqueKey,
                          'membershipProducts',
                          null,
                          oldProductIndex,
                        )
                      }
                      style={{ paddingRight: 1, minWidth: 182 }}
                      value={replicateSave.details.newYearRefId}
                    >
                      {(newMembershipProducs || []).map(item => (
                        <Option
                          key={'membershipProduct_' + item.membershipProductUniqueKey}
                          value={item.membershipProductUniqueKey}
                        >
                          {item.membershipProductName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="row pt-4">
          <div className="col-sm">
            <div className="row">
              <div className="col-sm-4">
                <InputWithHead heading={AppConstants.competitionDates} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name="competitionStartEndDate"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.competitionStartEndDateIsRequired,
                    },
                  ]}
                >
                  <RangePicker
                    // size="large"
                    onChange={this.onChangeDates}
                    format="DD-MM-YYYY"
                    style={{ width: '100%', minWidth: 180 }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className="row pt-4">
          <div className="col-sm">
            <div className="row">
              <div className="col-sm-4">
                <InputWithHead heading={AppConstants.registrationCloseDate} />
              </div>
              <div className="col-sm">
                <Form.Item
                  name="registrationCloseDate"
                  rules={[
                    {
                      required: true,
                      message: ValidationConstants.registrationCloseDateIsRequired,
                    },
                  ]}
                >
                  <DatePicker
                    // size="large"
                    placeholder="dd-mm-yyyy"
                    className="w-100"
                    onChange={e =>
                      this.onChangeReplicateValue(e, 'details', 'registrationCloseDate')
                    }
                    format="DD-MM-YYYY"
                    showTime={false}
                    name="dateOfBirth"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <span className="form-heading pt-4">{AppConstants.replicateSetting}</span>

        <div className="fluid-width" style={{ paddingLeft: 'inherit' }}>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.competitionLogo == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'competitionLogo',
                )
              }
            >
              {AppConstants.competitionLogo}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.competitionDetails == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'competitionDetails',
                )
              }
            >
              {AppConstants.competitionDetails}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.competitionType == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'competitionType',
                )
              }
            >
              {AppConstants.competitionType}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.nonPlayingDates == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'nonPlayingDates',
                )
              }
            >
              {AppConstants.nonPlayingDates}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.registrationTypes == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'registrationTypes',
                )
              }
            >
              {AppConstants.registrationType}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={!(replicateSave.details.replicateSettings.registrationTypes == 1)}
              checked={replicateSave.details.replicateSettings.registrationFees == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'replicateSettings',
                  'registrationFees',
                )
              }
            >
              {AppConstants.registrationFees}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              checked={replicateSave.details.replicateSettings.venues == 1}
              onChange={e =>
                this.onChangeReplicateValue(e.target.checked ? 1 : 0, 'replicateSettings', 'venues')
              }
            >
              {AppConstants.venues}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              onChange={e =>
                this.onChangeReplicateValue(e.target.checked ? 1 : 0, 'fixtures', 'fixtures')
              }
              checked={!(replicateSave.details.replicateSettings.fixtures == null)}
            >
              {AppConstants.fixtures}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={
                !(
                  replicateSave.details.replicateSettings.fixtures != null &&
                  replicateSave.details.replicateSettings.registrationTypes == 1
                )
              }
              style={{ paddingLeft: 30 }}
              checked={replicateSave.details.replicateSettings.fixtures?.divisions == 1}
              onChange={e =>
                this.onChangeReplicateValue(e.target.checked ? 1 : 0, 'fixtures', 'divisions')
              }
            >
              {AppConstants.divisions}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={
                !(
                  replicateSave.details.replicateSettings.fixtures != null &&
                  replicateSave.details.replicateSettings.registrationTypes == 1 &&
                  replicateSave.details.replicateSettings.fixtures?.divisions == 1
                )
              }
              style={{ paddingLeft: 30 }}
              checked={replicateSave.details.replicateSettings.fixtures?.grades == 1}
              onChange={e =>
                this.onChangeReplicateValue(e.target.checked ? 1 : 0, 'fixtures', 'grades')
              }
            >
              {AppConstants.grades}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={
                !(
                  replicateSave.details.replicateSettings.fixtures != null &&
                  replicateSave.details.replicateSettings.registrationTypes == 1 &&
                  replicateSave.details.replicateSettings.fixtures?.divisions == 1
                )
              }
              style={{ paddingLeft: 30 }}
              checked={replicateSave.details.replicateSettings.fixtures?.teams == 1}
              onChange={e => this.onTeamTicked(e.target.checked ? 1 : 0, 'fixtures', 'teams')}
            >
              {AppConstants.teams}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={
                !(
                  replicateSave.details.replicateSettings.fixtures != null &&
                  replicateSave.details.replicateSettings.venues == 1
                )
              }
              style={{ paddingLeft: 30 }}
              checked={replicateSave.details.replicateSettings.fixtures?.venuePreferneces == 1}
              onChange={e =>
                this.onChangeReplicateValue(
                  e.target.checked ? 1 : 0,
                  'fixtures',
                  'venuePreferneces',
                )
              }
            >
              {AppConstants.venuePreferences}
            </Checkbox>
          </div>
          <div className="row">
            <Checkbox
              className="comp-replicate-single-checkbox"
              disabled={!(replicateSave.details.replicateSettings.fixtures != null)}
              style={{ paddingLeft: 30 }}
              checked={replicateSave.details.replicateSettings.fixtures?.timeslots == 1}
              onChange={e =>
                this.onChangeReplicateValue(e.target.checked ? 1 : 0, 'fixtures', 'timeslots')
              }
            >
              {AppConstants.timeSlot}
            </Checkbox>
          </div>
        </div>
      </div>
    );
  };

  onTeamTicked = (checked, key, subKey) => {
    if (!checked) {
      this.onChangeReplicateValue(checked, key, subKey);
      return;
    }
    this.setState({ showTeamTicketConfirm: true });
  };

  teamTickedConfirm = () => {
    return (
      <Modal
        title={AppConstants.confirm}
        className="add-membership-type-modal"
        visible={this.state.showTeamTicketConfirm}
        okText={AppConstants.yes}
        onOk={() => {
          this.onChangeReplicateValue(1, 'fixtures', 'teams');
          this.setState({ showTeamTicketConfirm: false });
        }}
        cancelText={AppConstants.no}
        onCancel={() => this.setState({ showTeamTicketConfirm: false })}
      >
        <div className="pre-str">{AppConstants.teamTickConfirm}</div>
      </Modal>
    );
  };

  cancelCall = () => {
    history.push('/competitionDashboard');
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <Button
                  onClick={() => this.cancelCall()}
                  className="cancelBtnWidth"
                  type="cancel-button"
                >
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button htmlType="submit" className="open-reg-button publish-button" type="primary">
                  {AppConstants.review}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="1" />

        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            // scrollToFirstError
            onFinish={this.saveRelicate}
            noValidate="noValidate"
            onFinishFailed={this.onFinishFailed}
          >
            <Content>
              <div className="formView">{this.contentView()}</div>
              {this.teamTickedConfirm()}
            </Content>
            <Footer>{this.footerView()}</Footer>
            <Loader
              visible={
                this.props.competitionDashboardState.oldMembershipOnLoad ||
                this.props.competitionDashboardState.newMembershipOnLoad ||
                this.props.competitionDashboardState.replicateSaveOnLoad
              }
            />
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getYearListAction,
      getYearAndCompetitionOwnAction,
      updateReplicateSaveObjAction,
      replicateSaveAction,
      getOldMembershipProductsByCompIdAction,
      getNewMembershipProductByYearAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    competitionDashboardState: state.CompetitionDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionReplicate);

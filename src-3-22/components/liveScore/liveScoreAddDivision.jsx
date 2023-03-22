import React, { Component, createRef } from 'react';
import { Layout, Breadcrumb, Button, Form, Select } from 'antd';
import './liveScore.css';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getArrayFromLength,
  getTimeoutsData,
  isBasketball,
  isTimeoutsEnabled,
  timeoutsFields,
  timeoutsModes,
} from 'components/liveScore/liveScoreSettings/liveScoreSettingsUtils';
import {
  liveScoreUpdateDivisionAction,
  createDivisionAction,
} from 'store/actions/LiveScoreAction/liveScoreDivisionAction';
import history from 'util/history';
import { getLiveScoreCompetition } from 'util/sessionStorage';
import Loader from 'customComponents/loader';
import { captializedString } from 'util/helpers';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';
import AppConstants from 'themes/appConstants';
import ValidationConstants from 'themes/validationConstant';
import InputWithHead from 'customComponents/InputWithHead';
import LiveScoreSettingsTimeoutsFields from 'components/liveScore/liveScoreSettings/liveScoreSettingsTimeoutsFileds';
import { isFootball } from 'util/registrationHelper';

const { Footer, Content, Header } = Layout;
const { Option } = Select;

class LiveScoreAddDivision extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: this.props.location.state ? this.props.location.state.isEdit : false,
      tableData: this.props.location.state
        ? this.props.location.state.tableRecord
          ? this.props.location.state.tableRecord
          : null
        : null,
      loader: false,
      recordGoalAttemptArray: [
        { id: null, value: AppConstants.asPerCompetitionText },
        { id: true, value: AppConstants.yes },
        {
          id: false,
          value: AppConstants.no,
        },
      ],
      positionTrackingArray: [
        { id: null, value: AppConstants.asPerCompetitionText },
        { id: true, value: AppConstants.yes },
        {
          id: false,
          value: AppConstants.no,
        },
      ],
      playerTrackingArray: [
        { id: null, value: AppConstants.asPerCompetitionText },
        { id: 1, value: AppConstants.substitution },
        {
          id: 0,
          value: AppConstants.interchange,
        },
      ],
    };
    this.formRef = createRef();
  }

  componentDidMount() {
    if (this.state.isEdit) {
      this.props.liveScoreUpdateDivisionAction({
        data: this.state.tableData,
        key: 'isEditDivision',
      });
      this.setState({ loader: true });
      this.setInitalFiledValue();
    } else {
      this.props.liveScoreUpdateDivisionAction({ data: '', key: 'isAddDivision' });
      this.setInitalValue();
      if (getLiveScoreCompetition()) {
        const { sourceId } = JSON.parse(getLiveScoreCompetition());
        if (sourceId) {
          history.push('/matchDayDivisionList');
        }
      } else {
        history.push('/matchDayCompetitions');
      }
    }
  }

  componentDidUpdate() {
    if (this.state.load && this.props.liveScoreDivisionState.onLoad == false) {
      if (this.state.loader) {
        this.setInitalFiledValue();
        this.setState({ loader: false });
      }
    }
  }

  setInitalFiledValue() {
    const {
      name,
      divisionName,
      gradeName,
      positionTracking,
      recordGoalAttempts,
      timeouts,
      gameTimeTracking,
    } = this.props.liveScoreDivisionState;

    this.formRef.current.setFieldsValue({
      name,
      divisionName,
      gradeName,
      positionTracking,
      recordGoalAttempts,
      gameTimeTracking,
      timeouts: timeouts ? !!timeouts : timeouts,
    });
  }

  setInitalValue() {
    this.formRef.current.setFieldsValue({
      positionTracking: null,
      recordGoalAttempts: null,
      gameTimeTracking: null,
    });
  }

  headerView = () => {
    const isEdit = this.props.location.state ? this.props.location.state.isEdit : null;

    return (
      <div className="header-view">
        <Header className="form-header-view d-flex align-items-center bg-transparent">
          <div className="row">
            <div className="col-sm mt-5 d-flex align-content-center">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {isEdit ? AppConstants.editDivision : AppConstants.addDivision}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Header>
      </div>
    );
  };

  timeoutsView = () => {
    if (!isTimeoutsEnabled) return null;

    const currentTimeouts = this.props.liveScoreDivisionState.timeouts;
    const handleTimeoutsSelectChange = value => {
      this.props.liveScoreUpdateDivisionAction({
        data: value ? timeoutsModes.FOUR_QUARTERS : value,
        key: 'timeouts',
      });
    };

    return (
      <>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.timeouts} required="pb-3 pt-3" />
            <Form.Item className="formMargin pt-0" name="timeouts">
              <Select
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={val => handleTimeoutsSelectChange(val)}
                placeholder={AppConstants.timeouts}
              >
                {this.state.recordGoalAttemptArray.map(item => (
                  <Option key={`timeouts${item.id}`} value={item.id}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        <LiveScoreSettingsTimeoutsFields
          isVisible={!!currentTimeouts}
          values={this.props.liveScoreDivisionState}
          onFormChange={this.props.liveScoreUpdateDivisionAction}
          formRef={this.formRef.current}
        />
      </>
    );
  };

  /// /form view
  contentView = () => {
    // const { name, divisionName, gradeName } = this.props.liveScoreDivisionState
    const { positionTracking } = this.props.liveScoreDivisionState;
    const competition = JSON.parse(getLiveScoreCompetition());
    return (
      <div className="content-view pt-4">
        <div className="row">
          <div className="col-sm">
            <Form.Item
              className="formMargin"
              name="name"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.nameisrequired,
                },
              ]}
            >
              <InputWithHead
                auto_complete="off"
                type="text"
                required="required-field pb-0 pt-0 pb-3"
                heading={AppConstants.name}
                placeholder={AppConstants.name}
                onChange={name =>
                  this.props.liveScoreUpdateDivisionAction({
                    data: captializedString(name.target.value),
                    key: 'name',
                  })
                }
                // value={name}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    name: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <Form.Item
              className="formMargin"
              name="divisionName"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.divisionNameIsRequired,
                },
              ]}
            >
              <InputWithHead
                auto_complete="off"
                type="text"
                required="required-field pb-0 pt-0 pb-3"
                heading={AppConstants.divisionName}
                placeholder={AppConstants.divisionName}
                onChange={divisionName =>
                  this.props.liveScoreUpdateDivisionAction({
                    data: captializedString(divisionName.target.value),
                    key: 'divisionName',
                  })
                }
                // value={divisionName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    divisionName: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <Form.Item
              className="formMargin"
              name="gradeName"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.gradeIsRequired,
                },
              ]}
            >
              <InputWithHead
                auto_complete="off"
                type="text"
                required="required-field pb-0 pt-0 pb-3"
                heading={AppConstants.gradeName}
                placeholder={AppConstants.gradeName}
                onChange={gradeName =>
                  this.props.liveScoreUpdateDivisionAction({
                    data: captializedString(gradeName.target.value),
                    key: 'gradeName',
                  })
                }
                // value={gradeName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    gradeName: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
          </div>
        </div>
        {!isBasketball && (
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.positionTracking} required="pb-3 pt-3" />
              <Form.Item className="formMargin pt-0" name="positionTracking">
                <Select
                  className="w-100"
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={value =>
                    this.props.liveScoreUpdateDivisionAction({
                      data: value,
                      key: 'positionTracking',
                    })
                  }
                  placeholder={AppConstants.positionTracking}
                >
                  {this.state.positionTrackingArray.map(item => (
                    <Option key={`positionTracking_${item.id}`} value={item.id}>
                      {item.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {(competition.lineupSelectionEnabled == 1 ||
                competition.lineupSelectionEnabled == true) &&
                positionTracking === false && (
                  <span className="text-with-red-color pt-2">
                    {AppConstants.squadSelectionEnabled}
                  </span>
                )}
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.recordGoalAttempt} required="pb-3 pt-3" />
            <Form.Item className="formMargin pt-0" name="recordGoalAttempts">
              <Select
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={value =>
                  this.props.liveScoreUpdateDivisionAction({
                    data: value,
                    key: 'recordGoalAttempts',
                  })
                }
                placeholder={AppConstants.recordGoalAttempt}
              >
                {this.state.recordGoalAttemptArray.map(item => (
                  <Option key={`recordGoalAttempt_${item.id}`} value={item.id}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
        {isFootball && (
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.playerRotationLabelText} required="pb-3 pt-3" />
              <Form.Item className="formMargin pt-0" name="gameTimeTracking">
                <Select
                  className="w-100"
                  style={{ paddingRight: 1, minWidth: 182 }}
                  onChange={value =>
                    this.props.liveScoreUpdateDivisionAction({
                      data: value,
                      key: 'gameTimeTracking',
                    })
                  }
                  placeholder={AppConstants.playerRotationLabelText}
                >
                  {this.state.playerTrackingArray.map(item => (
                    <Option key={`gameTimeTracking${item.id}`} value={item.id}>
                      {item.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        )}
        {this.timeoutsView()}
      </div>
    );
  };

  onSaveClick = values => {
    const {
      name,
      divisionName,
      gradeName,
      positionTracking,
      recordGoalAttempts,
      gameTimeTracking,
      timeouts,
      timeoutsToHalves,
      timeoutsToQuarters,
    } = this.props.liveScoreDivisionState;
    const { id } = JSON.parse(getLiveScoreCompetition());
    const divisionId = this.state.tableData ? this.state.tableData.id : 0;
    const timeoutsData = getTimeoutsData({
      timeouts,
      timeoutsToHalves,
      timeoutsToQuarters,
    });

    this.props.createDivisionAction(
      name,
      divisionName,
      gradeName,
      id,
      divisionId,
      positionTracking,
      recordGoalAttempts,
      gameTimeTracking,
      timeoutsData,
    );
  };

  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <NavLink to="/matchDayDivisionList">
                <Button className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.cancel}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Button
                className="publish-button save-draft-text mr-0"
                type="primary"
                htmlType="submit"
                disabled={isSubmitting}
              >
                {AppConstants.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  handleTimeoutInput(e, fieldKey, fieldIndex) {
    const value = e.target.value.replace(/\D/g, '');
    const currentValue = this.props.liveScoreDivisionState[fieldKey];

    currentValue[fieldIndex] = value;
    this.props.liveScoreUpdateDivisionAction({
      key: fieldKey,
      data: currentValue,
    });
    this.formRef.current.setFieldsValue({
      [`${fieldKey}${fieldIndex}`]: value,
    });
  }

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.addDivision}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="9" />

        <Layout>
          <Loader visible={this.props.liveScoreDivisionState.onLoad} />

          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onSaveClick}
            noValidate="novalidate"
          >
            <Content>
              <div className="formView">
                {getLiveScoreCompetition()
                  ? this.contentView()
                  : history.push('/matchDayCompetitions')}
              </div>
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreUpdateDivisionAction,
      createDivisionAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDivisionState: state.LiveScoreDivisionState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreAddDivision);

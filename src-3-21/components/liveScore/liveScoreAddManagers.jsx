import React, { Component, createRef } from 'react';
import { Layout, Breadcrumb, Button, Form, Select, Radio, Spin, AutoComplete } from 'antd';
import './liveScore.css';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import { NavLink } from 'react-router-dom';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import ValidationConstants from '../../themes/validationConstant';
import InputWithHead from '../../customComponents/InputWithHead';
import { getliveScoreDivisions } from '../../store/actions/LiveScoreAction/liveScoreActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import history from '../../util/history';
import { getLiveScoreCompetition } from '../../util/sessionStorage';
import {
  liveScoreUpdateManagerDataAction,
  liveScoreAddEditManager,
  liveScoreManagerListAction,
  liveScoreClear,
  liveScoreManagerFilter,
  liveScoreManagerSearch,
  clearListAction,
} from '../../store/actions/LiveScoreAction/liveScoreManagerAction';
import { liveScoreScorerSearch } from '../../store/actions/LiveScoreAction/liveScoreScorerAction';
import { isArrayNotEmpty, captializedString, regexNumberExpression } from '../../util/helpers';

import Loader from '../../customComponents/loader';
import { getliveScoreTeams } from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import Tooltip from 'react-png-tooltip';
import { checkLivScoreCompIsParent } from 'util/permissions';

const { Footer, Content, Header } = Layout;
const { Option } = Select;

const OPTIONS = [];

class LiveScoreAddManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      load: false,
      tableRecord: this.props.location.state ? this.props.location.state.tableRecord : null,
      isEdit: this.props.location.state ? this.props.location.state.isEdit : null,
      loader: false,
      showOption: false,
      competition_id: null,
      teamLoad: false,
      exsitingValue: '',
      compOrgId: 0,
      liveScoreCompIsParent: false,
    };
    this.formRef = createRef();
  }

  componentDidMount() {
    if (getLiveScoreCompetition()) {
      const liveScoreCompIsParent = checkLivScoreCompIsParent();
      const { id, competitionOrganisation, competitionOrganisationId } = JSON.parse(
        getLiveScoreCompetition(),
      );
      let compOrgId = competitionOrganisation
        ? competitionOrganisation.id
        : competitionOrganisationId
        ? competitionOrganisationId
        : 0;
      this.props.liveScoreScorerSearch(8, 1, id, '');
      this.props.getliveScoreTeams(id, null, compOrgId);
      if (this.state.isEdit === true) {
        this.props.liveScoreUpdateManagerDataAction(this.state.tableRecord, 'isEditManager');
        this.setState({ loader: true });
      } else {
        this.props.liveScoreUpdateManagerDataAction('', 'isAddManager');
      }
      this.setState({
        load: true,
        competition_id: id,
        compOrgId: compOrgId,
        liveScoreCompIsParent,
      });
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  componentDidUpdate(prevProps) {
    const { managerData, managerListResult } = this.props.liveScoreManagerState;

    if (this.state.isEdit === true) {
      this.setInitialFiledValues();
    }
    if (managerListResult !== prevProps.liveScoreManagerState.managerListResult) {
      if (this.state.load === true && this.props.liveScoreManagerState.onLoad === false) {
        this.filterManagerList();
        this.setState({ load: false, loader: false });
      }
    }

    if (managerData.teams !== prevProps.liveScoreManagerState.managerData.teams) {
      if (this.state.teamLoad === true) {
        this.updateManagerTeamName(managerData.teams);

        this.setState({ teamLoad: false });
      }
    }
  }

  updateManagerTeamName(teamIds) {
    this.formRef.current.setFieldsValue({
      managerTeamName: teamIds,
    });
  }

  setInitialFiledValues() {
    const { managerData } = this.props.liveScoreManagerState;
    const selectedTeamIds = managerData.teams?.map(team => team.id);

    this.formRef.current.setFieldsValue({
      [AppConstants.firstName]: managerData.firstName,
      [AppConstants.lastName]: managerData.lastName,
      [AppConstants.emailAdd]: managerData.email,
      [AppConstants.contactNO]: managerData.mobileNumber,
      [AppConstants.selectTeam]: selectedTeamIds,
    });
  }

  filterManagerList() {
    const { managerListResult } = this.props.liveScoreManagerState;
    let managerList = isArrayNotEmpty(managerListResult) ? managerListResult : [];

    for (let i in managerList) {
      OPTIONS.push(managerList[i].firstName + ' ' + managerList[i].lastName);
    }
  }

  onChangeNumber = number => {
    if (number.length === 10) {
      this.setState({
        hasError: false,
      });
      this.props.liveScoreUpdateManagerDataAction(regexNumberExpression(number), 'mobileNumber');
    } else if (number.length < 10) {
      this.props.liveScoreUpdateManagerDataAction(regexNumberExpression(number), 'mobileNumber');
      this.setState({
        hasError: true,
      });
    }
    setTimeout(() => {
      this.setInitialFiledValues();
    }, 300);
  };

  headerView = () => {
    let isEdit = this.props.location.state ? this.props.location.state.isEdit : null;
    return (
      <div className="header-view">
        <Header className="form-header-view bg-transparent d-flex align-items-center">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {isEdit === true ? AppConstants.editManager : AppConstants.addManager}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Header>
      </div>
    );
  };

  ////form view
  managerExistingRadioButton() {
    const { managerListResult, onLoadSearch } = this.props.liveScoreManagerState;
    let managerList = isArrayNotEmpty(managerListResult) ? managerListResult : [];
    const { searchScorer } = this.props.liveScoreScorerState;
    let scorer_list = isArrayNotEmpty(searchScorer) ? searchScorer : [];
    // const { teamId } = this.props.liveScoreManagerState
    let teamData = isArrayNotEmpty(this.props.liveScoreManagerState.teamResult)
      ? this.props.liveScoreManagerState.teamResult
      : [];
    return (
      <div className="content-view pt-4">
        <div className="row">
          <div className="col-sm">
            <InputWithHead
              required="required-field pb-3 pt-3"
              heading={AppConstants.managerSearch}
            />
            <Form.Item
              name={AppConstants.team}
              rules={[{ required: true, message: ValidationConstants.searchManager }]}
            >
              <Select
                mode="multiple"
                style={{ width: '100%', height: '44px' }}
                placeholder="Select User"
                showSearch
                className="w-100"
                onSelect={(item, option) => {
                  const ManagerId = option.key;
                  // this.props.liveScoreClear()
                  this.props.clearListAction();
                  this.props.liveScoreUpdateManagerDataAction(ManagerId, 'managerSearch');
                  this.setState({ teamLoad: true });
                }}
                notFoundContent={onLoadSearch === true ? <Spin size="small" /> : null}
                onSearch={value => {
                  this.props.clearListAction();
                  this.setState({ exsitingValue: value });
                  // value
                  //     ? this.props.liveScoreManagerSearch(value, this.state.competition_id)
                  //     : this.props.liveScoreManagerListAction(5, 1, this.state.competition_id)
                  this.props.liveScoreScorerSearch(8, 1, this.state.competition_id, value);
                }}
              >
                {scorer_list.map(item => (
                  <Option key={item.id} value={item.firstName + ' ' + item.lastName}>
                    {item.nameWithNumber}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <InputWithHead required="required-field pb-3 pt-3" heading={AppConstants.team} />
            <Form.Item
              name="managerTeamName"
              rules={[{ required: true, message: ValidationConstants.teamName }]}
              className="slct-in-add-manager-livescore"
            >
              <Select
                mode="multiple"
                showSearch
                placeholder={AppConstants.selectTeam}
                className="w-100"
                onChange={teamIds => this.props.liveScoreUpdateManagerDataAction(teamIds, 'teams')}
                optionFilterProp="children"
              >
                {teamData.map(item => (
                  <Option key={'team_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
      </div>
    );
  }

  managerNewRadioBtnView() {
    const {
      // managerData,
      // teamId,
      teamResult,
    } = this.props.liveScoreManagerState;
    let teamData = isArrayNotEmpty(teamResult) ? teamResult : [];
    let hasError = this.state.hasError;
    return (
      <div className="content-view pt-4">
        <div className="row">
          <div className="col-sm">
            <Form.Item
              name={AppConstants.firstName}
              rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
            >
              <InputWithHead
                auto_complete="new-password"
                type="text"
                required="required-field pb-3 pt-3"
                heading={AppConstants.firstName}
                placeholder={AppConstants.firstName}
                onChange={firstName =>
                  this.props.liveScoreUpdateManagerDataAction(
                    captializedString(firstName.target.value),
                    'firstName',
                  )
                }
                // value={managerData.firstName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    'First Name': captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <Form.Item
              name={AppConstants.lastName}
              rules={[{ required: true, message: ValidationConstants.nameField[1] }]}
            >
              <InputWithHead
                auto_complete="off"
                // type="text"
                required="required-field pb-3 pt-3"
                heading={AppConstants.lastName}
                placeholder={AppConstants.lastName}
                onChange={lastName =>
                  this.props.liveScoreUpdateManagerDataAction(
                    captializedString(lastName.target.value),
                    'lastName',
                  )
                }
                // value={managerData.lastName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    'Last Name': captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <Form.Item
              name={AppConstants.emailAdd}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.emailField[0],
                },
                {
                  type: 'email',
                  pattern: new RegExp(AppConstants.emailExp),
                  message: ValidationConstants.email_validation,
                },
              ]}
            >
              <InputWithHead
                auto_complete="new-email"
                type="email"
                required="required-field pb-3 pt-3"
                heading={AppConstants.emailAdd}
                placeholder={AppConstants.enterEmail}
                onChange={email =>
                  this.props.liveScoreUpdateManagerDataAction(email.target.value, 'email')
                }
                // value={managerData.email}
                disabled={this.state.isEdit === true && true}
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <Form.Item
              name={AppConstants.contactNO}
              rules={[{ required: true, message: ValidationConstants.contactField }]}
              help={hasError && ValidationConstants.mobileLength}
              validateStatus={hasError ? 'error' : 'validating'}
            >
              <InputWithHead
                auto_complete="new-contact"
                // type="number"
                required="required-field pb-3 pt-3"
                heading={AppConstants.contact_No}
                placeholder={AppConstants.enterContactNo}
                maxLength={10}
                onChange={mobileNumber => this.onChangeNumber(mobileNumber.target.value)}
                // value={managerData.mobileNumber}
              />
            </Form.Item>
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.team} required="pb-3 pt-3" />
            <Form.Item
              name={AppConstants.selectTeam}
              className="slct-in-add-manager-livescore"
            >
              <Select
                mode="multiple"
                placeholder={AppConstants.selectTeam}
                className="w-100"
                onChange={teamIds => this.props.liveScoreUpdateManagerDataAction(teamIds, 'teams')}
                showSearch
                optionFilterProp="children"
              >
                {teamData.map(item => (
                  <Option key={'team_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
      </div>
    );
  }

  onButtonChage(e) {
    this.setState({ loader: true });
    this.props.liveScoreUpdateManagerDataAction(e.target.value, 'managerRadioBtn');
  }

  radioBtnContainer() {
    const { managerRadioBtn } = this.props.liveScoreManagerState;
    return (
      <div className="content-view pb-0 pt-4 row">
        <span className="applicable-to-heading ml-4 mr-3">{AppConstants.managerHeading}</span>
        <Radio.Group
          className="reg-competition-radio"
          onChange={e => this.onButtonChage(e)}
          value={managerRadioBtn}
          style={{
            overflowX: 'unset',
          }}
        >
          {/* <div className="row ml-2" style={{ marginTop: 18 }}>
                        <Radio value="new">{AppConstants.new}</Radio>
                        <Radio value="existing">{AppConstants.existing}</Radio>
                    </div> */}
          <div className="row ml-2" style={{ marginTop: 18 }}>
            <div className="d-flex align-items-center">
              <Radio style={{ marginRight: 0, paddingRight: 0 }} value="new">
                {AppConstants.new}
              </Radio>
              <div className="mt-n10 ml-n10 width-50 mt-1">
                <Tooltip>
                  <span>{AppConstants.newTeamUserMsg}</span>
                </Tooltip>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Radio style={{ marginRight: 0, paddingRight: 0 }} value="existing">
                {AppConstants.existing}
              </Radio>
              <div className="mt-n10 ml-n10 mt-1">
                <Tooltip>
                  <span>{AppConstants.existingTeamUserMsg}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        </Radio.Group>
      </div>
    );
  }

  ////form view
  contentViewForAddManager = () => {
    const { managerRadioBtn } = this.props.liveScoreManagerState;
    return (
      <div>
        {this.radioBtnContainer()}
        {managerRadioBtn === 'new'
          ? this.managerNewRadioBtnView()
          : this.managerExistingRadioButton()}
      </div>
    );
  };

  contentViewForEditManager = () => {
    return <div>{this.managerNewRadioBtnView()}</div>;
  };

  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                <NavLink to="/matchDayManagerList">
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
  };

  onSaveClick = () => {
    const { managerData, managerRadioBtn, exsitingManagerId } = this.props.liveScoreManagerState;
    const { compOrgId } = this.state;

    if (managerRadioBtn === 'new') {
      if (managerData.mobileNumber.length !== 10) {
        this.setState({
          hasError: true,
        });
      } else {
        const body = {
          firstName: managerData.firstName,
          lastName: managerData.lastName,
          mobileNumber: regexNumberExpression(managerData.mobileNumber),
          email: managerData.email.trim(),
          teams: managerData.teams,
          isAdd: !this.state.isEdit,
        };

        if (this.state.isEdit === true) {
          body.id = managerData.id;
        }

        this.props.liveScoreAddEditManager(body, compOrgId, this.state.liveScoreCompIsParent);
      }
    } else if (managerRadioBtn === 'existing') {
      const body = {
        id: exsitingManagerId,
        teams: managerData.teams,
        isAdd: !this.state.isEdit,
      };
      this.props.liveScoreAddEditManager(body, compOrgId, this.state.liveScoreCompIsParent);
    }
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />
        <Loader visible={this.props.liveScoreManagerState.loading} />
        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="4" />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onSaveClick}
            noValidate="noValidate"
          >
            <Content>
              <div className="formView">
                {this.state.isEdit === true
                  ? this.contentViewForEditManager()
                  : this.contentViewForAddManager()}
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
      getliveScoreDivisions,
      liveScoreUpdateManagerDataAction,
      liveScoreAddEditManager,
      liveScoreManagerListAction,
      liveScoreClear,
      liveScoreManagerFilter,
      liveScoreManagerSearch,
      getliveScoreTeams,
      clearListAction,
      liveScoreScorerSearch,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreState: state.LiveScoreState,
    liveScoreManagerState: state.LiveScoreManagerState,
    liveScoreScorerState: state.LiveScoreScorerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreAddManager);

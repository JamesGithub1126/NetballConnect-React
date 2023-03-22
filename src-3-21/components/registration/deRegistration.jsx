import React, { Component } from 'react';
import { Layout, Breadcrumb, Form, Select, Button, Radio, message } from 'antd';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import history from '../../util/history';
import InputWithHead from '../../customComponents/InputWithHead';
import Loader from '../../customComponents/loader';
import ValidationConstants from '../../themes/validationConstant';
import Tooltip from 'react-png-tooltip';
import {
  saveDeRegisterDataAction,
  updateDeregistrationData,
  getTransferCompetitionsAction,
  getMoveCompDataAction,
  moveCompetitionAction,
  getDeRegisterDataAction,
} from '../../store/actions/registrationAction/registrationChangeAction';
import { isArrayNotEmpty } from 'util/helpers';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

const RegistrationChangeType = {
  DeRegister: 1,
  Transfer: 2,
  MoveCompetition: 3,
};

class DeRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registrationOption: 0,
      userId: 0,
      loading: false,
      saveLoad: false,
      onMoveCompetitionLoad: false,
      regData: null,
      personal: null,
      membershipMappingId: null,
      hasDeRegisterError: false,
      hasRegisterTypeError: false,
      hasReasonTypeError: false,
      hasTransferReasonError: false,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let regData = this.props.location.state ? this.props.location.state.regData : null;
    let personal = this.props.location.state ? this.props.location.state.personal : null;
    if (personal) {
      this.setState({ userId: personal.userId });
    }
    this.setState({ regData, personal });
    let payload = null;
    if (this.props.location.state.sourceFrom == AppConstants.ownRegistration) {
      payload = {
        userId: personal.userId,
        teamId: 0,
        registrationId:
          this.props.location.state.subSourceFrom == 'RegistrationListPage'
            ? regData.registrationUniqueKey
            : regData.registrationId,
        competitionId:
          this.props.location.state.subSourceFrom == 'RegistrationListPage'
            ? regData.competitionUniqueKey
            : regData.competitionId,
        // organisationId: regData.organisationId,
        organisationId:
          this.props.location.state.subSourceFrom == 'RegistrationListPage'
            ? regData.organisationUniqueKey
            : regData.organisationId,
        // division:
        //   this.props.location.state.subSourceFrom == 'RegistrationListPage'
        //     ? regData.competitionDivisionId
        //     : regData.divisionId,
        competitionMembershipProductDivisionId:
          this.props.location.state.subSourceFrom == 'RegistrationListPage'
            ? regData.divisionId
            : regData.competitionMembershipProductDivisionId,
        membershipMappingId:
          this.props.location.state.subSourceFrom == 'RegistrationListPage'
            ? regData.membershipProductMappingId
            : regData.membershipMappingId,
        orgRegistrationParticipantId: regData.orgRegistrationParticipantId,
      };
    } else if (this.props.location.state.sourceFrom == AppConstants.teamRegistration) {
      payload = {
        userId: 0,
        teamId: regData.teamId,
        registrationId: regData.registrationUniqueKey,
        competitionId: null,
        organisationId: null,
        division: 0,
        membershipMappingId: 0,
        orgRegistrationParticipantId: null,
      };
    } else if (this.props.location.state.sourceFrom == AppConstants.teamMembers) {
      payload = {
        userId: regData.userId,
        teamId: regData.teamId,
        registrationId: regData.registrationUniqueKey,
        competitionId: regData.competitionId,
        organisationId: regData.organisationId,
        // division: regData.divisionId,
        competitionMembershipProductDivisionId: regData.competitionMembershipProductDivisionId,
        membershipMappingId: regData.membershipMappingId,
        orgRegistrationParticipantId: regData.orgRegistrationParticipantId,
      };
    }
    this.apiCall(payload);
  }

  apiCall(payload) {
    this.props.getDeRegisterDataAction(payload);
    this.setState({ loading: true });
  }

  componentDidUpdate(nextProps) {
    let RegistrationChangeState = this.props.RegistrationChangeState;
    if (
      this.state.onMoveCompetitionLoad &&
      RegistrationChangeState.onMoveCompetitionLoad == false
    ) {
      if (
        RegistrationChangeState.moveCompetitionSuccessMsg &&
        RegistrationChangeState.moveCompetitionSuccessMsg.length > 0
      ) {
        message.success(RegistrationChangeState.moveCompetitionSuccessMsg);
      }
      this.goBack();
    }
    if (this.state.saveLoad && RegistrationChangeState.onSaveLoad == false) {
      this.goBack();
    }
  }

  goBack = () => {
    let fromTeamDashboard = this.props.location.state.fromTeamDashboard
      ? this.props.location.state.fromTeamDashboard
      : false;
    let fromRegistrationListPage = this.props.location.state.subSourceFrom
      ? this.props.location.state.subSourceFrom
      : null;
    this.updateDeregistrationData(null, 'clear', 'deRegister');
    if (fromRegistrationListPage != 'RegistrationListPage') {
      if (fromTeamDashboard) {
        history.push({ pathname: '/teamRegistrations' });
      } else {
        history.push({
          pathname: '/userPersonal',
          state: { tabKey: '5', userId: this.state.userId },
        });
      }
    } else {
      history.push({ pathname: '/registration' });
    }
  };

  updateDeregistrationData = (value, key, subKey) => {
    if (key === 'regChangeTypeRefId') {
      if (value == 2) {
        //Transfer Competitions
        this.getRegChangeData(2);
      }
      if (value == 3) {
        //Move Competitions
        this.getRegChangeData(3);
      }
    }
    if (key === 'competitionUniqueKey' && subKey === 'move') {
      this.formRef.current.setFieldsValue({
        divisionId: null,
      });
    }
    this.props.updateDeregistrationData(value, key, subKey);
    if (
      key === 'deRegistrationOptionId' ||
      key === 'regChangeTypeRefId' ||
      key === 'reasonTypeRefId'
    ) {
      this.setState({
        hasDeRegisterError: false,
        hasRegisterTypeError: false,
        hasReasonTypeError: false,
        hasTransferReasonError: false,
      });
    }
  };

  getRegChangeData = regChangeTypeRefId => {
    let regData = this.state.regData;
    // let payload = {
    //   competitionId: regData.competitionId,
    //   membershipMappingId: regData.membershipMappingId,
    // };
    let payload = {
      competitionId:
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.competitionUniqueKey
          : regData.competitionId,
      membershipMappingId:
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.membershipProductMappingId
          : regData.membershipMappingId,
      organisationId:
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.organisationUniqueKey
          : regData.organisationId,
    };
    if (regChangeTypeRefId === 2) {
      this.props.getTransferCompetitionsAction(payload);
    }
    if (regChangeTypeRefId === 3) {
      this.props.getMoveCompDataAction(payload);
    }
  };

  saveDeregister = (saveData, deRegisterData) => {
    let regData = this.state.regData;
    if (this.props.location.state.sourceFrom != AppConstants.teamRegistration) {
      saveData['isTeam'] = 0;
      saveData['userId'] = deRegisterData.userId;
      //saveData['organisationId'] = regData.organisationId;
      saveData['organisationId'] =
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.organisationUniqueKey
          : regData.organisationId;
      saveData['competitionMembershipProductDivisionId'] =
        deRegisterData.competitionMembershipProductDivisionId;
      saveData['competitionId'] =
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.competitionUniqueKey
          : regData.competitionId;
      saveData['membershipMappingId'] =
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.membershipProductMappingId
          : deRegisterData.membershipMappingId;
      saveData['teamId'] = 0;
      // saveData['divisionId'] =
      //   this.props.location.state.subSourceFrom == 'RegistrationListPage'
      //     ? regData.competitionDivisionId
      //     : deRegisterData.divisionId;
      saveData['registrationId'] =
        this.props.location.state.sourceFrom == AppConstants.teamMembers ||
        this.props.location.state.subSourceFrom == 'RegistrationListPage'
          ? regData.registrationUniqueKey
          : regData.registrationId;
      saveData.orgRegistrationParticipantId = regData.orgRegistrationParticipantId;
      this.props.saveDeRegisterDataAction(saveData);
      this.setState({ saveLoad: true });
    } else {
      saveData['isTeam'] = 1;
      saveData['userId'] = 0;
      saveData['teamId'] = regData.teamId;
      saveData['registrationId'] = regData.registrationUniqueKey;
      saveData['competitionMembershipProductDivisionId'] =
        deRegisterData.competitionMembershipProductDivisionId;
      saveData.orgRegistrationParticipantId = regData.orgRegistrationParticipantId;
      this.props.saveDeRegisterDataAction(saveData);
      this.setState({ saveLoad: true });
    }
  };

  moveCompetition = (saveData, deRegisterData) => {
    let regData = this.state.regData;
    let payload = {};

    let cmpdId = deRegisterData.competitionMembershipProductDivisionId
      ? Number(deRegisterData.competitionMembershipProductDivisionId)
      : 0;

    let userDataList = new Map();
    userDataList.set(cmpdId, [
      [deRegisterData.userId],
      [Number(deRegisterData.compParticipantId)],
      [regData.orgRegistrationParticipantId],
    ]);

    payload['userDataList'] = [...userDataList.entries()];
    payload['organisationUniqueKey'] =
      this.props.location.state.subSourceFrom == 'RegistrationListPage'
        ? regData.organisationUniqueKey
        : regData.organisationId;

    payload['competitionUniqueKey'] =
      this.props.location.state.subSourceFrom == 'RegistrationListPage'
        ? regData.competitionUniqueKey
        : regData.competitionId;
    payload['membershipMappingId'] =
      this.props.location.state.subSourceFrom == 'RegistrationListPage'
        ? regData.membershipProductMappingId
        : deRegisterData.membershipMappingId;
    saveData['divisionId'] =
      this.props.location.state.subSourceFrom == 'RegistrationListPage'
        ? regData.competitionDivisionId
        : deRegisterData.divisionId;
    payload['registrationId'] =
      this.props.location.state.sourceFrom == AppConstants.teamMembers ||
      this.props.location.state.subSourceFrom == 'RegistrationListPage'
        ? regData.registrationUniqueKey
        : regData.registrationId;
    payload['newCompetitionUniqueKey'] = saveData.move.competitionUniqueKey;
    payload['newCompetitionMembershipProductDivisionId'] = saveData.move.divisionId;
    payload['isPlaying'] = deRegisterData.isPlaying;

    this.props.moveCompetitionAction(payload);
    this.setState({ onMoveCompetitionLoad: true });
  };

  saveAPIsActionCall = values => {
    let RegistrationChangeState = this.props.RegistrationChangeState;
    let saveData = JSON.parse(JSON.stringify(RegistrationChangeState.saveData));
    let deRegisterData = RegistrationChangeState.deRegisterData;
    //check if mandatory fields are misssing
    if (saveData.regChangeTypeRefId == 0 || saveData.regChangeTypeRefId == null) {
      this.setState({ hasRegisterTypeError: true });
      return;
    } else if (
      saveData.regChangeTypeRefId == RegistrationChangeType.DeRegister &&
      !saveData.deRegistrationOptionId
    ) {
      this.setState({ hasDeRegisterError: true });
      return;
    } else if (
      saveData.regChangeTypeRefId == RegistrationChangeType.DeRegister &&
      saveData.deRegistrationOptionId &&
      saveData.reasonTypeRefId == 0
    ) {
      this.setState({ hasReasonTypeError: true });
      return;
    } else if (
      saveData.regChangeTypeRefId == RegistrationChangeType.Transfer &&
      saveData.transfer.reasonTypeRefId == 0
    ) {
      this.setState({ hasTransferReasonError: true });
      return;
    } else {
      // 1 - deRegister,  2 - transfer, 3 - move
      if (
        saveData.regChangeTypeRefId === RegistrationChangeType.DeRegister ||
        saveData.regChangeTypeRefId === RegistrationChangeType.Transfer
      ) {
        this.saveDeregister(saveData, deRegisterData);
      } else if (saveData.regChangeTypeRefId === RegistrationChangeType.MoveCompetition) {
        this.moveCompetition(saveData, deRegisterData);
      }
    }
  };

  headerView = () => (
    <Header className="comp-venue-courts-header-view">
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.registrationChange}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
    </Header>
  );

  ///checkDeRegistrationOption
  checkDeRegistrationOption = (subItem, selectedOption) => {
    const {
      saveData,
      // deRegistionOther
    } = this.props.RegistrationChangeState;
    if (subItem.id == 5 && selectedOption == 5) {
      return (
        <div className="ml-5">
          <InputWithHead
            required="pt-0"
            placeholder={AppConstants.other}
            value={saveData.deRegisterOther}
            onChange={e =>
              this.updateDeregistrationData(e.target.value, 'deRegisterOther', 'deRegister')
            }
          />
        </div>
      );
    }
  };

  ////checkMainRegistrationOption
  checkMainRegistrationOption = (subItem, selectedOption) => {
    const { saveData, deRegistionOption } = this.props.RegistrationChangeState;

    if ((subItem.id == 1 && selectedOption == 1) || (subItem.id == 2 && selectedOption == 2)) {
      return (
        <div className="ml-5 pt-3">
          <InputWithHead required="pt-0" heading={AppConstants.reasonRegisterTitle} />
          {this.state.hasReasonTypeError && (
            <div className="ant-form-item-explain ant-form-item-explain-error">
              {ValidationConstants.deRegisterReasonRequired}
            </div>
          )}
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.updateDeregistrationData(e.target.value, 'reasonTypeRefId', 'deRegister')
            }
            value={saveData.reasonTypeRefId}
          >
            {(deRegistionOption || []).map(item => (
              <div key={'reasonType_' + item.id}>
                <Radio value={item.id}>{item.value}</Radio>
                {this.checkDeRegistrationOption(item, saveData.reasonTypeRefId)}
              </div>
            ))}
          </Radio.Group>
        </div>
      );
    }
  };

  //checkTransferOption
  checkTransferOption = (subItem, selectedOption) => {
    const {
      saveData,
      // transferOther
    } = this.props.RegistrationChangeState;
    if (subItem.id == 3 && selectedOption == 3) {
      return (
        <div className="ml-5">
          <InputWithHead
            required="pt-0"
            placeholder={AppConstants.other}
            value={saveData.transfer.transferOther}
            onChange={e =>
              this.updateDeregistrationData(e.target.value, 'transferOther', 'transfer')
            }
          />
        </div>
      );
    }
  };

  ///checkRegistrationOption
  checkRegistrationOption = (subItem, selectedOption, sourceFrom, deRegisterData) => {
    const {
      saveData,
      DeRegistionMainOption,
      transferOption,
      transferOrganisations,
      transferCompetitions,
      moveCompetitions,
    } = this.props.RegistrationChangeState;

    if (subItem.id == 1 && selectedOption == 1) {
      return (
        <div className="ml-5">
          <InputWithHead
            required="required-field pt-0"
            heading={AppConstants.takenCourtForTraining}
          />
          {this.state.hasDeRegisterError && (
            <div className="ant-form-item-explain ant-form-item-explain-error">
              {ValidationConstants.answerRequired}
            </div>
          )}
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.updateDeregistrationData(e.target.value, 'deRegistrationOptionId', 'deRegister')
            }
            value={saveData.deRegistrationOptionId}
          >
            {(DeRegistionMainOption || []).map(item => (
              <div key={'deRegistrationOption_' + item.id}>
                <Radio value={item.id}>{item.value}</Radio>
                {this.checkMainRegistrationOption(item, saveData.deRegistrationOptionId)}
              </div>
            ))}
          </Radio.Group>
        </div>
      );
    } else if (subItem.id == 2 && selectedOption == 2) {
      return (
        <div className="ml-5">
          {sourceFrom != AppConstants.teamRegistration && (
            <div>
              <InputWithHead
                disabled
                heading={AppConstants.membershipProduct}
                required="pb-1"
                style={{ paddingRight: 1 }}
                className="input-inside-table-venue-court team-mem_prod_type w-100"
                value={
                  (deRegisterData ? deRegisterData.membershipProduct : '') +
                  ' - ' +
                  (deRegisterData ? deRegisterData.membershipType : '')
                }
                placeholder={AppConstants.membershipProduct}
              />
            </div>
          )}

          <InputWithHead heading={AppConstants.newOrganisationName} required="required-field" />
          <Form.Item
            name="transferOrganisationId"
            rules={[{ required: true, message: ValidationConstants.organisationField }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              style={{ paddingRight: 1 }}
              required="required-field pt-0 pb-0"
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              onChange={e => this.updateDeregistrationData(e, 'organisationId', 'transfer')}
              value={saveData.transfer.organisationId}
              placeholder="Organisation Name"
            >
              {(transferOrganisations || []).map(org => (
                <Option key={'organisation_' + org.organisationId} value={org.organisationId}>
                  {org.organisationName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <InputWithHead heading={AppConstants.newCompetition_name} required="required-field" />
          <Form.Item
            name="transferCompetitionId"
            rules={[{ required: true, message: ValidationConstants.competitionField }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              style={{ paddingRight: 1 }}
              required="required-field pt-0 pb-0"
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              onChange={e => this.updateDeregistrationData(e, 'competitionId', 'transfer')}
              value={saveData.transfer.competitionId}
              placeholder="Competition Name"
            >
              {(transferCompetitions || []).map(comp => (
                <Option key={'competition_' + comp.competitionId} value={comp.competitionId}>
                  {comp.competitionName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <InputWithHead required="required-field pt-3" heading={AppConstants.reasonForTransfer} />
          {this.state.hasTransferReasonError && (
            <div className="ant-form-item-explain ant-form-item-explain-error">
              {ValidationConstants.answerRequired}
            </div>
          )}
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.updateDeregistrationData(e.target.value, 'reasonTypeRefId', 'transfer')
            }
            value={saveData.transfer.reasonTypeRefId}
          >
            {(transferOption || []).map(item => (
              <div key={'reasonType_' + item.id}>
                <Radio value={item.id}>{item.value}</Radio>
                {this.checkTransferOption(item, saveData.transfer.reasonTypeRefId)}
              </div>
            ))}
          </Radio.Group>
        </div>
      );
    } else if (subItem.id == 3 && selectedOption == 3) {
      return (
        <div className="ml-5">
          <span className="warning-msg">{AppConstants.moveCompWarningMsg}</span>
          <div>
            <InputWithHead
              disabled
              heading={AppConstants.membershipProduct}
              required="pb-1"
              style={{ paddingRight: 1 }}
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              value={
                (deRegisterData ? deRegisterData.membershipProduct : '') +
                ' - ' +
                (deRegisterData ? deRegisterData.membershipType : '')
              }
              placeholder={AppConstants.membershipProduct}
            />
          </div>

          <InputWithHead heading={AppConstants.newCompMovingTo} required="required-field" />
          <Form.Item
            name="moveCompetitionId"
            rules={[{ required: true, message: ValidationConstants.competitionField }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              style={{ paddingRight: 1 }}
              required="required-field pt-0 pb-0"
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              onChange={e => this.updateDeregistrationData(e, 'competitionUniqueKey', 'move')}
              value={saveData.move.competitionUniqueKey}
              placeholder="Competition Name"
            >
              {(moveCompetitions || []).map(comp => (
                <Option
                  key={'competition_' + comp.competitionUniqueKey}
                  value={comp.competitionUniqueKey}
                >
                  {comp.competitionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {saveData.move.competitionUniqueKey &&
          Number(deRegisterData.competitionMembershipProductDivisionId) &&
          Number(deRegisterData.competitionMembershipProductDivisionId) > 0 &&
          moveCompetitions.find(c => c.competitionUniqueKey === saveData.move.competitionUniqueKey)
            .competitionMembershipProductDivisions.length > 0 ? (
            <>
              <InputWithHead heading={AppConstants.divisionName} required="required-field" />
              <Form.Item
                name="divisionId"
                rules={[{ required: true, message: ValidationConstants.divisionNameIsRequired }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  style={{ paddingRight: 1 }}
                  required="required-field pt-0 pb-0"
                  className="input-inside-table-venue-court team-mem_prod_type w-100"
                  onChange={e => this.updateDeregistrationData(e, 'divisionId', 'move')}
                  value={saveData.move.divisionId}
                  placeholder="Division Name"
                >
                  {(
                    moveCompetitions.find(
                      x => x.competitionUniqueKey === saveData.move.competitionUniqueKey,
                    ).competitionMembershipProductDivisions || []
                  ).map(div => (
                    <Option key={'division_' + div.id} value={div.id}>
                      {div.divisionName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : null}
        </div>
      );
    }
  };

  contentView = () => {
    const { saveData, registrationSelection, deRegisterData } = this.props.RegistrationChangeState;
    let regData = this.state.regData;
    let personal = this.state.personal;
    let sourceFrom = this.props.location.state.sourceFrom;
    const isPartOfTeam = deRegisterData ? (deRegisterData.teamName ? true : false) : false;
    const hasReplications = deRegisterData ? deRegisterData.hasReplications : false;
    return (
      <div className="content-view pt-5">
        {sourceFrom != AppConstants.teamRegistration && (
          <InputWithHead
            disabled
            heading={AppConstants.username}
            required="pb-1"
            style={{ paddingRight: 1 }}
            className="input-inside-table-venue-court team-mem_prod_type w-100"
            value={deRegisterData ? deRegisterData.firstName + ' ' + deRegisterData.lastName : ''}
            placeholder="User Name"
          />
        )}
        <InputWithHead
          disabled
          style={{ paddingRight: 1 }}
          heading={AppConstants.organisationName}
          required="pb-1"
          className="input-inside-table-venue-court team-mem_prod_type w-100"
          value={deRegisterData ? deRegisterData.organisationName : ''}
          placeholder="Organisation Name"
        />

        <InputWithHead
          disabled
          heading={AppConstants.competitionName}
          required="pb-1"
          style={{ paddingRight: 1 }}
          className="input-inside-table-venue-court team-mem_prod_type w-100"
          value={deRegisterData ? deRegisterData.competitionName : ''}
          placeholder="Competition Name"
        />
        {sourceFrom != AppConstants.teamRegistration && (
          <div>
            <InputWithHead
              disabled
              heading={AppConstants.membershipProduct}
              required="pb-1"
              style={{ paddingRight: 1 }}
              className="input-inside-table-venue-court team-mem_prod_type w-100"
              value={
                (deRegisterData ? deRegisterData.membershipProduct : '') +
                ' - ' +
                (deRegisterData ? deRegisterData.membershipType : '')
              }
              placeholder={AppConstants.membershipProduct}
            />
          </div>
        )}
        <InputWithHead
          disabled
          heading={AppConstants.division}
          required="pb-1"
          style={{ paddingRight: 1 }}
          className="input-inside-table-venue-court team-mem_prod_type w-100"
          value={deRegisterData ? deRegisterData.divisionName : ''}
          placeholder={AppConstants.division}
        />

        <InputWithHead
          disabled
          heading={AppConstants.teamName}
          required="pb-1"
          style={{ paddingRight: 1 }}
          className="input-inside-table-venue-court team-mem_prod_type w-100"
          value={deRegisterData ? deRegisterData.teamName : ''}
          placeholder={AppConstants.teamName}
        />
        {sourceFrom != AppConstants.teamRegistration && (
          <InputWithHead
            disabled
            heading={AppConstants.mobileNumber}
            required="pb-1"
            placeholder={AppConstants.mobileNumber}
            value={deRegisterData ? deRegisterData.mobileNumber : ''}
          />
        )}
        {sourceFrom != AppConstants.teamRegistration && (
          <InputWithHead
            disabled
            heading={AppConstants.emailAdd}
            required="pb-1"
            placeholder={AppConstants.emailAdd}
            value={deRegisterData ? deRegisterData.email : ''}
          />
        )}

        <InputWithHead heading={AppConstants.whatRegistrationChange} />
        {this.state.hasRegisterTypeError && (
          <div className="ant-form-item-explain ant-form-item-explain-error">
            {ValidationConstants.deRegisterChangeTypeRequired}
          </div>
        )}
        <div>
          <Radio.Group
            className="reg-competition-radio"
            style={{ overflow: 'visible' }}
            onChange={e => {
              this.updateDeregistrationData(e.target.value, 'regChangeTypeRefId', 'deRegister');
            }}
            value={saveData?.regChangeTypeRefId}
          >
            {(registrationSelection || []).map(item => {
              let moveCompDisabled =
                item.value === 'Move Competition' &&
                (isPartOfTeam || sourceFrom === AppConstants.teamRegistration || hasReplications);
              return (
                <div key={`regChangeType_${item.id}`}>
                  <div className="contextualHelp-RowDirection" style={{ alignItems: 'center' }}>
                    <Radio
                      value={item.id}
                      disabled={
                        (item.value == 'Transfer' && sourceFrom == AppConstants.teamRegistration) ||
                        moveCompDisabled
                      }
                    >
                      {item.value}
                    </Radio>
                    <div className="ml-n20">
                      <Tooltip placement="bottom">
                        <span>{item.helpMsg}</span>
                      </Tooltip>
                    </div>
                  </div>
                  {this.checkRegistrationOption(
                    item,
                    saveData?.regChangeTypeRefId,
                    sourceFrom,
                    deRegisterData,
                  )}
                </div>
              );
            })}
          </Radio.Group>
        </div>
      </div>
    );
  };

  footerView = () => (
    <div className="footer-view">
      <div className="row">
        <div className="col-sm">
          <div className="reg-add-save-button">
            <Button type="cancel-button" onClick={() => this.goBack()}>
              {AppConstants.cancel}
            </Button>
          </div>
        </div>
        <div className="col-sm">
          <div className="comp-buttons-view">
            <Button className="publish-button" type="primary" htmlType="submit">
              {AppConstants.confirm}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />
        <Layout>
          <Form onFinish={this.saveAPIsActionCall} noValidate="noValidate" ref={this.formRef}>
            {this.headerView()}
            <Content>
              <Loader visible={this.props.RegistrationChangeState.onSaveLoad} />
              <div className="formView">{this.contentView()}</div>
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
      saveDeRegisterDataAction,
      updateDeregistrationData,
      getTransferCompetitionsAction,
      getMoveCompDataAction,
      moveCompetitionAction,
      getDeRegisterDataAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    RegistrationChangeState: state.RegistrationChangeState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeRegistration);

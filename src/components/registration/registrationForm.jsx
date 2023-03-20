import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Input,
  Select,
  Checkbox,
  Tree,
  DatePicker,
  Button,
  Breadcrumb,
  Form,
  Table,
  message,
  Radio,
  Tooltip,
  Modal,
} from 'antd';
import CustomTooltip from 'react-png-tooltip';
import moment from 'moment';

import './product.scss';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppUniqueId from 'themes/appUniqueId';
import AppConstants from '../../themes/appConstants';
import {
  regSaveRegistrationForm,
  getRegistrationForm,
  updateRegistrationForm,
  clearReducerDataAction,
  changeMembershipProduct,
  getMembershipproduct,
  updateProductSelection,
  updateRegistrationTypes,
  updateRegistrationLock,
  updateDisclamerText,
  isCheckedVisible,
  isReplyCheckVisible,
  addHardshipCodeAction,
  getStateRegistrationSettingByOrganisationIdAction,
} from '../../store/actions/registrationAction/registration';
import {
  getYearAndCompetitionAction,
  getCompetitionTypeListAction,
  getVenuesTypeAction,
  getRegFormAdvSettings,
  getRegistrationMethod,
} from '../../store/actions/appAction';
import AppImages from '../../themes/appImages';
import ValidationConstants from '../../themes/validationConstant';
import {
  isArrayNotEmpty,
  regexNumberExpression,
  randomKeyGen,
  deepCopyFunction,
} from '../../util/helpers';
import { checkStripeCustomerAccount } from '../../util/registrationHelper';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import { getOrganisationData } from '../../util/sessionStorage';
import { inviteTypeAction } from '../../store/actions/commonAction/commonAction';
import { REGISTRATION_QUESTIONS, MEMBERSHIP_PRODUCT_TYPE } from '../../util/enums';
const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const Mailto = ({ email, subject, body, children }) => {
  return (
    <a
      href={`mailto:${email}?subject=${encodeURIComponent(subject) || ''}&body=${
        encodeURIComponent(body) || ''
      }`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

let this_Obj = null;

const columns = [
  {
    title: '',
    dataIndex: 'division',
    key: 'division',
    render: (division, record, index) => (
      <Checkbox
        className="single-checkbox mt-1"
        data-testid={AppUniqueId.SELECT_DIVISION_NAME + index}
        checked={record.isSelected}
        disabled={this_Obj.state.isPublished}
        onChange={e => this_Obj.getSelectionofProduct(e.target.checked, record, index)}
        key={'division' + index}
      />
    ),
  },
  {
    title: AppConstants.membershipType,
    dataIndex: 'membershipProductTypeName',
    key: 'membershipProductTypeName',
  },
  {
    title: AppConstants.registrationType,
    dataIndex: 'registrationType',
    key: 'registrationType',
  },
  {
    title: AppConstants.registrationDivisions,
    dataIndex: 'divisionName',
    key: 'divisionName',
    width: '25%',
  },
  {
    title: AppConstants.lockRegistrationsImmediately,
    dataIndex: 'registrationLock',
    width: 120,
    key: 'registrationLock',
    filterDropdown: true,
    filterIcon: () => (
      <div className="mt-2">
        <CustomTooltip placement="top">
          <span>{AppConstants.regLockMsg}</span>
        </CustomTooltip>
      </div>
    ),
    render: (registrationLock, record, index) => {
      return (
        <div>
          {(record.isPlaying == 1 || record.isIndividualRegistration == 1) && (
            <Checkbox
              className="single-checkbox mt-1"
              checked={record.registrationLock == null ? false : record.registrationLock}
              onChange={e => this_Obj.getRegistrationLock(e.target.checked, record, index)}
            />
          )}
        </div>
      );
    },
  },

  {
    title: AppConstants.registrationCap,
    dataIndex: 'registrationType',
    key: 'registrationCap',
    render: (registrationCap, record, index) => {
      return (
        <div>
          {(record.isPlaying == 1 || record.isIndividualRegistration == 1) && (
            <InputWithHead
              style={{ width: '70%' }}
              placeholder=" "
              type={'number'}
              min="0"
              onChange={e =>
                this_Obj.props.updateRegistrationForm(
                  e.target.value > 0 ? e.target.value : null,
                  'membershipProductTypes',
                  record.isIndividualRegistration == 1 ? 'registrationCap' : 'teamRegistrationCap',
                  index,
                  record,
                )
              }
              value={
                record.isIndividualRegistration == 1
                  ? record.registrationCap
                  : record.teamRegistrationCap
              }
            />
          )}
        </div>
      );
    },
  },
  {
    title: AppConstants.publiclyDisplay,
    dataIndex: 'isPublic',
    width: 80,
    key: 'isPublic',
    filterDropdown: true,
    filterIcon: () => (
      <div className="mt-2">
        <CustomTooltip placement="top">
          <span>{AppConstants.publicDisplayHelpText}</span>
        </CustomTooltip>
      </div>
    ),
    render: (isPublic, record, index) => {
      return (
        <div>
          <Checkbox
            className="single-checkbox mt-1"
            checked={
              record.isIndividualRegistration == 1 ? record.isPublic == 1 : record.isTeamPublic == 1
            }
            onChange={e => this_Obj.setIsPublic(e.target.checked, record)}
          />
        </div>
      );
    },
  },
];

class RegistrationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearRefId: 1,
      firstTimeCompId: null,
      membershipCategory: 'Select',
      registrationOepn: '',
      registrationClose: '',
      registrationLock: false,
      training: false,
      trainingDaysTimes: false,
      trainingVenue: false,
      trainingVenueTime: 'trainingVenue',
      replyToContDetail: false,
      nameChecked: false,
      roleChecked: false,
      emailChecked: false,
      phoneChecked: false,
      disclaimerAdd: '',
      orgName: 'New',
      disclaimerData: [],
      regClose: '',
      regStart: '',
      payLoad: '',
      statusRefId: 1,
      registrationMethodArray: [],
      selectedMemberShipType: [],
      disclaimerText: '',
      disclaimerLink: '',
      onRegistrationLoad: false,
      onRegistrationSaveLoad: false,
      selectedInvitees: [],
      tooltipVisibleDraft: false,
      tooltipVisiblePublish: false,
      isPublished: false,
      orgRegId: 0,
      compCloseDate: null,
      compName: '',
      allYearRefId: -1,
      allCompetition: null,
      isVisible: false,
      collapseNodes: [],
    };
    this_Obj = this;
    this.props.clearReducerDataAction('getRegistrationFormDetails');
    this.getReference();
    this.formRef = React.createRef();
    this.optionalQuestions = [];
  }

  componentDidMount() {
    this.props.getYearAndCompetitionAction(this.props.appState.allYearList, null);
    let competitionId = this.props.location.state ? this.props.location.state.id : null;
    let year = this.props.location.state ? this.props.location.state.year : null;
    let orgRegId = this.props.location.state ? this.props.location.state.orgRegId : 0;
    let compCloseDate = this.props.location.state ? this.props.location.state.compCloseDate : null;
    let compName = this.props.location.state ? this.props.location.state.compName : null;

    this.setState({ orgRegId, compCloseDate, compName });

    if (competitionId !== null && year !== null) {
      this.props.getRegistrationForm(year, competitionId);
      this.setState({ onRegistrationLoad: true, yearRefId: year, firstTimeCompId: competitionId });
    } else {
      history.push('/registrationFormList');
    }
    let org = getOrganisationData();
    if (org) {
      this.props.getStateRegistrationSettingByOrganisationIdAction(org.organisationUniqueKey);
    }

    // this.props.getYearAndCompetitionAction(this.props.appState.yearList, null)
  }

  getReference() {
    this.props.getVenuesTypeAction();
    this.props.getRegistrationMethod();
    this.props.getRegFormAdvSettings();
    this.props.inviteTypeAction();
  }

  componentDidUpdate(nextProps) {
    let registrationState = this.props.registrationState;
    let allCompetitionTypeList = this.props.appState.allCompetitionTypeList;
    if (
      nextProps.registrationState.registrationFormData !== registrationState.registrationFormData
    ) {
      if (this.state.onRegistrationLoad === true && registrationState.onLoad === false) {
        this.setFieldDecoratorValues();
        this.setState({
          onRegistrationLoad: false,
          // isPublished: registrationState.registrationFormData[0].statusRefId == 2
        });
      }
    }
    if (
      this.state.onRegistrationSaveLoad === true &&
      registrationState.onRegistrationSaveLoad === false
    ) {
      this.setState({ onRegistrationSaveLoad: false });
      history.push('/registrationFormList');
    }
    if (nextProps.appState !== this.props.appState) {
      if (nextProps.appState.allCompetitionTypeList !== allCompetitionTypeList) {
        if (allCompetitionTypeList.length > 0) {
          let allCompetition = allCompetitionTypeList[0].competitionId;
          this.setState({
            allCompetition: allCompetition,
          });
        }
      }
    }
    // if (nextProps.appState !== this.props.appState) {
    //     if (nextProps.appState.competitionList !== competitionList) {
    //         if (competitionList.length > 0) {
    //             let competitionId = competitionList[0].competitionId
    //         }
    //     }
    // }
  }

  // mail client details
  mailClientView = code => {
    let affiliateName = getOrganisationData() ? getOrganisationData().name : null;
    let body = `${AppConstants.mailBodyText} \n${code}  \n \nRegards,  \n${affiliateName}`;
    return (
      <div>
        <a>
          <Mailto email="" subject={AppConstants.singleUseDiscountSubject} body={body}>
            <span
              className="input-heading-add-another"
              style={{ textDecoration: 'underline', paddingTop: 18 }}
            >
              {AppConstants.email}
            </span>
          </Mailto>
        </a>
      </div>
    );
  };

  // year change and get competition lost
  onYearChange = allYearRefId => {
    this.setState({ allCompetition: null, allYearRefId: allYearRefId });
    this.props.getYearAndCompetitionAction(this.props.appState.allYearList, allYearRefId);
    this.props.updateRegistrationForm(allYearRefId, 'inviteYearRefId');
  };

  onCompetitionChange = allCompetition => {
    this.setState({ allCompetition: allCompetition });
  };

  setFieldDecoratorValues = () => {
    let registrationFormData = this.props.registrationState.registrationFormData[0];
    let disclaimerData =
      registrationFormData.registrationDisclaimer !== null
        ? isArrayNotEmpty(registrationFormData.registrationDisclaimer)
          ? registrationFormData.registrationDisclaimer
          : []
        : [];
    this.formRef.current.setFieldsValue({
      registrationOpenDate:
        registrationFormData.registrationOpenDate !== ''
          ? moment(registrationFormData.registrationOpenDate, 'YYYY-MM-DD')
          : null,
      registrationCloseDate:
        registrationFormData.registrationCloseDate !== ''
          ? moment(registrationFormData.registrationCloseDate, 'YYYY-MM-DD')
          : null,
      email: registrationFormData.replyEmail !== '' ? registrationFormData.replyEmail : '',
    });
    disclaimerData.forEach((item, index) => {
      let disclaimerText = `disclaimerText${index}`;
      let disclaimerLink = `disclaimerLink${index}`;
      this.formRef.current.setFieldsValue({
        [disclaimerText]: item.disclaimerText,
        [disclaimerLink]: item.disclaimerLink,
      });
    });
  };

  //Registration Method
  methodSelection(value, item, formDataValue) {
    // let registrationMethodArray = isArrayNotEmpty(formDataValue.registerMethods) ? formDataValue.registerMethods : []
    let methodArr = [];
    methodArr = this.props.registrationState.selectedMethod;
    let index = methodArr.findIndex(x => x == item.id);
    if (index > -1) {
      methodArr.splice(index, 1);
    } else {
      methodArr.push(item.id);
    }
    this.props.updateRegistrationForm(methodArr, 'registerMethods');
  }

  // for add disclaimer
  addDisclaimerLink() {
    if (this.props.registrationState.registrationFormData.length > 0) {
      let formDataValue = this.props.registrationState.registrationFormData[0];
      let disclaimerData =
        formDataValue.registrationDisclaimer !== null
          ? isArrayNotEmpty(formDataValue.registrationDisclaimer)
            ? formDataValue.registrationDisclaimer
            : []
          : [];

      // let arrayCheck = formDataValue.registrationDisclaimer
      let obj = {
        orgRegistrationDisclaimerLinkId: 0,
        disclaimerLink: '',
        disclaimerText: '',
      };
      disclaimerData.push(obj);

      this.props.updateRegistrationForm(disclaimerData, 'registrationDisclaimer');
    }
  }

  // for remove disclaimer
  removeDisclaimer(e, index) {
    if (this.props.registrationState.registrationFormData.length > 0) {
      let formDataValue = this.props.registrationState.registrationFormData[0];
      let arrayCheck = formDataValue.registrationDisclaimer;
      arrayCheck.splice(index, 1);
      this.props.updateRegistrationForm(arrayCheck, 'registrationDisclaimer');
    }
  }

  /// post api
  registrationSubmit = values => {
    let SelectedProduct = JSON.parse(
      JSON.stringify(
        this.props.registrationState.registrationFormData.length !== 0
          ? this.props.registrationState.registrationFormData[0]
          : [],
      ),
    );
    let canInviteSend = this.props.registrationState.canInviteSend;

    if (SelectedProduct.replyPhone.length > 0 && SelectedProduct.replyPhone.length !== 10) {
      this.setState({
        hasError: true,
      });
    } else {
      if (
        this.state.statusRefId !== 1 &&
        canInviteSend == 1 &&
        SelectedProduct.canInviteSend == 1
      ) {
        this.setState({ visible: true });
      } else {
        if (SelectedProduct.canInviteSend == 1) {
          this.registrationSend(1);
        } else {
          this.registrationSend(0);
        }
      }
    }
  };

  registrationSend = isResend => {
    let SelectedProduct = JSON.parse(
      JSON.stringify(
        this.props.registrationState.registrationFormData.length !== 0
          ? this.props.registrationState.registrationFormData[0]
          : [],
      ),
    );
    const { reg_settings, reg_demoSetting, reg_NetballSetting, reg_QuestionsSetting } = JSON.parse(
      JSON.stringify(this.props.registrationState),
    );
    let registration_settings = [];
    if (SelectedProduct.membershipProductTypes.length > 0) {
      let phone_number =
        SelectedProduct['replyPhone'].length > 0
          ? regexNumberExpression(SelectedProduct['replyPhone'])
          : '';
      SelectedProduct['competitionUniqueKeyId'] = this.state.firstTimeCompId;
      SelectedProduct['yearRefId'] = this.state.yearRefId;
      SelectedProduct['statusRefId'] = this.state.statusRefId;
      SelectedProduct['replyPhone'] = phone_number;
      SelectedProduct['isResend'] = isResend;

      let filteredNetballSetting = this.getAvailableNetballSetting(reg_NetballSetting);

      for (let i in reg_settings) {
        registration_settings.push(reg_settings[i]);
      }
      for (let i in reg_demoSetting) {
        registration_settings.push(reg_demoSetting[i]);
      }
      for (let i in filteredNetballSetting) {
        registration_settings.push(filteredNetballSetting[i]);
      }
      for (let i in reg_QuestionsSetting) {
        registration_settings.push(reg_QuestionsSetting[i]);
      }
      SelectedProduct['registrationSettings'] = registration_settings;
      SelectedProduct['orgRegistrationId'] =
        SelectedProduct.orgRegistrationId == 0 || SelectedProduct.orgRegistrationId == null
          ? this.state.orgRegId
          : SelectedProduct.orgRegistrationId;

      //we have a seperate api for adding hardshipCodes so we are removing here
      let SelectedProductTemp = deepCopyFunction(SelectedProduct);
      delete SelectedProductTemp.hardShipCodes;

      this.props.regSaveRegistrationForm(SelectedProductTemp, this.state.statusRefId);
      this.setState({ onRegistrationSaveLoad: true });
    } else {
      message.error(ValidationConstants.pleaseSelectMembershipProduct);
    }
  };

  getAvailableNetballSetting = reg_NetballSetting => {
    //user will check umpire or coach question first ,then uncheck umpire or coach membership product type,
    const { showUmpireQuestions, showCoachQuestions, showWalkingQuestions } =
      this.getCoachUmpireStatus();
    let netballSettings = [];
    let allQuestionSettings = this.props.appState.allQuestionSettings || [];
    let removedIds = [];
    if (!showCoachQuestions) {
      //switch from coach membershiptype to non-coach membershiptype
      let coachQuestionGroup = allQuestionSettings.find(
        q => q.id == REGISTRATION_QUESTIONS.COACH_MEMBERSHIP_QUESTIONS,
      );
      if (coachQuestionGroup && coachQuestionGroup.subReferences) {
        coachQuestionGroup.subReferences.forEach(sub => removedIds.push(sub.id.toString()));
      }
    }

    if (!showUmpireQuestions) {
      //switch from umpire membershiptype to non-umpire membershiptype
      let umpireQuestionGroup = allQuestionSettings.find(
        q => q.id == REGISTRATION_QUESTIONS.UMPIRE_MEMBERSHIP_QUESTIONS,
      );
      if (umpireQuestionGroup && umpireQuestionGroup.subReferences) {
        umpireQuestionGroup.subReferences.forEach(sub => removedIds.push(sub.id.toString()));
      }
    }

    if (!showWalkingQuestions) {
      //switch from walking membershiptype to non-coach membershiptype
      let walkingQuestionGroup = allQuestionSettings.find(
        q => q.id == REGISTRATION_QUESTIONS.WALKING_MEMBERSHIP_QUESTIONS,
      );
      if (walkingQuestionGroup && walkingQuestionGroup.subReferences) {
        walkingQuestionGroup.subReferences.forEach(sub => removedIds.push(sub.id.toString()));
      }
    }

    if (removedIds.length) {
      for (let setting of reg_NetballSetting) {
        if (!removedIds.includes(setting.registrationSettingsRefId)) {
          netballSettings.push(setting);
        }
      }
      return netballSettings;
    } else {
      return reg_NetballSetting;
    }
  };

  ///for change table productType and Division selection
  getSelectionofProduct(value, record, key) {
    let allMemberProductArr = this.props.registrationState.selectedMemberShipType;
    let matchIndexValue = allMemberProductArr.findIndex(
      x => x.membershipProductId == record.membershipProductId,
    );
    if (matchIndexValue > -1) {
      if (value) {
        this.setIsPublicByType(1, record);
      } else {
        this.setIsPublicByType(0, record);
      }
      this.props.updateProductSelection(
        matchIndexValue,
        key,
        record.isSelected,
        record.registrationLock,
        record.isIndividualRegistration == 1 ? 'registrationCap' : 'teamRegistrationCap',
      );
    }
  }

  getRegistrationLock(value, record, key) {
    let allMemberProductArr = this.props.registrationState.selectedMemberShipType;
    let matchIndexValue = allMemberProductArr.findIndex(
      x => x.membershipProductId == record.membershipProductId,
    );
    if (matchIndexValue > -1) {
      this.props.updateRegistrationLock(
        matchIndexValue,
        key,
        record.isSelected,
        record.registrationLock,
      );
    }
  }
  setIsPublicByType = (isPublic, record) => {
    if (record.isIndividualRegistration == 1) {
      record.isPublic = isPublic ? 1 : 0;
    } else {
      record.isTeamPublic = isPublic ? 1 : 0;
    }
  };
  setIsPublic = (isPublic, record) => {
    this.setIsPublicByType(isPublic, record);

    if (isPublic && !record.isSelected) {
      record.isSelected = true;
    }
    this.props.updateRegistrationTypes(record);
  };

  handleModal = key => {
    if (key == 'ok') {
      this.registrationSend(1);
    } else if (key == 'cancel') {
      this.registrationSend(0);
    }

    this.setState({ visible: false });
  };

  confirmationModalView() {
    return (
      <Modal
        title={AppConstants.emailNotificationUpdate}
        visible={this.state.visible}
        onCancel={() => this.handleModal('close')}
        centered
        footer={[
          <Button
            key="Cancel"
            className="save-draft-text"
            type="save-draft-text"
            style={{ width: '100px' }}
            onClick={() => this.handleModal('cancel')}
          >
            {AppConstants.cancel}
          </Button>,
          <Button
            key="Proceed"
            onClick={() => this.handleModal('ok')}
            type="primary"
            className="open-reg-button"
          >
            Proceed
          </Button>,
        ]}
      >
        {AppConstants.regoFormConfirmMsg}
      </Modal>
    );
  }

  headerView = () => {
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <div className="row">
            <div className="col-sm d-flex align-content-center">
              <Breadcrumb separator=" > ">
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.registrationForm}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Header>
      </div>
    );
  };

  onSelectionMembershipCategory(value) {
    this.props.changeMembershipProduct(value);
  }

  onChangeRegistrationLock(value, setFieldValue) {
    this.props.updateRegistrationForm(value, 'registrationLock');
    setFieldValue('registrationLock');
  }

  addHardshipCode = orgRegistrationId => {
    if (!checkStripeCustomerAccount()) {
      message.error(AppConstants.setupWithdrawAccount);
      return;
    }
    let code = randomKeyGen(8);
    let obj = {
      id: 0,
      code: code,
      orgRegistrationId: orgRegistrationId,
      isActive: 1,
    };
    let payload = {
      hardshipCode: code,
      orgRegistrationId:
        orgRegistrationId == 0 || orgRegistrationId == null
          ? this.state.orgRegId
          : orgRegistrationId,
      isActive: 1,
    };
    this.props.updateRegistrationForm(obj, 'addHardshipCode');
    this.props.addHardshipCodeAction(payload);
  };

  onChangeSetValue = (value, index) => {
    let obj = {
      value,
      index,
    };
    this.props.updateRegistrationForm(obj, 'addHardshipCodeValueChange');
  };

  regOpenDate = () => {
    if (this.props.registrationState.registrationFormData.length > 0) {
      let formDataValue = this.props.registrationState.registrationFormData[0];
      let openDate = formDataValue.registrationOpenDate;
      moment(openDate).format('DD-MM-YYYY');
      return openDate;
    }
  };

  regCloseDate = () => {
    if (this.props.registrationState.registrationFormData.length > 0) {
      let formDataValue = this.props.registrationState.registrationFormData[0];
      let closeDate = formDataValue.registrationCloseDate;
      return closeDate;
    }
  };

  dateChange(date, key) {
    if (date !== null) {
      this.props.updateRegistrationForm(moment(date).format('YYYY-MM-DD'), key);
    } else {
      this.props.updateRegistrationForm('', key);
    }
  }

  contentView = () => {
    let formDataValue =
      this.props.registrationState.registrationFormData !== 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let fillteredProduct =
      this.props.registrationState.selectedProductName !== 0
        ? this.props.registrationState.selectedProductName
        : [];
    let productList =
      this.props.registrationState.membershipProductTypes.length !== 0
        ? this.props.registrationState.membershipProductTypes
        : [];
    let venueList = this.props.appState.venueList.length !== 0 ? this.props.appState.venueList : [];
    // let dateOpen = this.regOpenDate()
    let closeDate = moment(this.state.compCloseDate).format('YYYY-MM-DD');
    let compCLoseDate = moment(this.state.compCloseDate).format('DD-MM-YYYY');
    let defaultChecked = this.props.registrationState.defaultChecked;
    let isPublished = false; // this.state.isPublished // CM-1513
    let orgLogoUrl = getOrganisationData() ? getOrganisationData().orgLogoUrl : null;

    return (
      <div className="content-view pt-4">
        <div className="row" style={{ paddingLeft: 10, paddingBottom: 15 }}>
          <span className="form-heading pt-2 pl-2">{this.state.compName}</span>
        </div>
        <span className="user-reg-link">{`Competition Registrations close on ${compCLoseDate}`}</span>
        <div className="row">
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants.registrationOpen}
              conceptulHelp
              conceptulHelpMsg={AppConstants.regFormOpenMsg}
              marginTop={0}
            />
            <Form.Item
              name="registrationOpenDate"
              rules={[
                {
                  required: true,
                  message: ValidationConstants.registrationOpenDateIsRequired,
                },
              ]}
            >
              <DatePicker
                // size="large"
                placeholder="dd-mm-yyyy"
                data-testid={AppUniqueId.REGISTRATION_OPEN_DATE}
                className="w-100"
                onChange={e => this.dateChange(e, 'registrationOpenDate')}
                name="registrationOpenDate"
                format="DD-MM-YYYY"
                showTime={false}
                // disabledDate={this.disabledDate}
                disabledTime={this.disabledTime}
                //disabled={isPublished}
                disabledDate={
                  d => !d || d.isAfter(closeDate)
                  // || d.isSameOrBefore(dateOpen)
                }
                // value={dateOpen ? moment(dateOpen, "YYYY-MM-DD") : ''}
              />
            </Form.Item>
          </div>
          <div className="col-sm">
            <InputWithHead
              heading={AppConstants.registrationClose}
              conceptulHelp
              conceptulHelpMsg={AppConstants.regFormCloseMsg}
              marginTop={0}
            />
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
                className="w-100"
                // disabledDate={this.disabledDate}
                placeholder="dd-mm-yyyy"
                data-testid={AppUniqueId.REGISTRATION_CLOSE_DATE}
                onChange={e => this.dateChange(e, 'registrationCloseDate')}
                name={'registrationCloseDate'}
                disabledTime={this.disabledTime}
                format="DD-MM-YYYY"
                showTime={false}
                disabledDate={
                  d => !d || d.isAfter(closeDate)
                  // || d.isSameOrBefore(dateOpen)
                }
                // value={closeDate ? moment(closeDate, "YYYY-MM-DD") : ""}
              />
            </Form.Item>
          </div>
        </div>

        <InputWithHead required={'required-field'} heading={AppConstants.membershipProduct} />
        <Select
          mode="multiple"
          className="reg-form-multiple-select"
          style={{ width: '100%', padding: 1, minWidth: 182 }}
          onChange={e => this.onSelectionMembershipCategory(e)}
          value={fillteredProduct}
          placeholder="Select"
          data-testid={AppUniqueId.MEMBERSHIP_PRODUCT}
          disabled={isPublished}
        >
          {productList.map(item => (
            <Option
              data-testid={AppUniqueId.MEMBERSHIP_TYPE}
              key={'product_' + item.membershipProductId}
              value={item.membershipProductId}
            >
              {item.membershipProductName}
            </Option>
          ))}
        </Select>

        {this.props.registrationState.selectedMemberShipType.map(
          item =>
            item != undefined && (
              <div className="inside-container-view">
                <span className="form-heading pt-2 pl-2">{item.membershipProductName}</span>
                <div className="table-responsive home-dash-table-view table-competition">
                  <Table
                    rowKey={item => item.id}
                    showHeader
                    className="fees-table"
                    columns={columns}
                    dataSource={item.membershipProductTypes}
                    pagination={false}
                    Divider="false"
                  />
                </div>
              </div>
            ),
        )}
        <div className="row ml-1 d-flex align-items-center">
          <Checkbox
            className="single-checkbox pt-2"
            checked={defaultChecked.trainingVisible}
            onChange={e => this.updateTraining(e.target.checked, 'trainingVisible')}
          >
            {AppConstants.training}
          </Checkbox>
          <div className="mt-4" style={{ marginLeft: -8 }}>
            <CustomTooltip>
              <span>{AppConstants.regFormTrainingMsg}</span>
            </CustomTooltip>
          </div>
        </div>
        {defaultChecked.trainingVisible && (
          <div className="comp-open-reg-check-inpt-view">
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row">
                <div className="col-sm d-flex">
                  <Checkbox
                    className="comp-open-single-checkbox"
                    checked={defaultChecked.daysVisible}
                    onChange={e => this.updateTraining(e.target.checked, 'daysVisible')}
                  >
                    {AppConstants.trainingDaysAndTimes}
                  </Checkbox>
                </div>
                {defaultChecked.daysVisible === true && (
                  <div className="col-sm">
                    <TextArea
                      name="trainingDaysAndTimes"
                      auto_complete="new-trainingDay"
                      placeholder={AppConstants.trainingDaysAndTimes}
                      allowClear
                      onChange={e =>
                        this.props.updateRegistrationForm(e.target.value, 'trainingDaysAndTimes')
                      }
                      value={formDataValue ? formDataValue.trainingDaysAndTimes : ''}
                      defaultValue={AppConstants.usuallyThursdays}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row" style={{ height: 56 }}>
                <div className="col-sm d-flex">
                  <Checkbox
                    className="comp-open-single-checkbox"
                    onChange={e => this.updateTraining(e.target.checked, 'venueVisible')}
                    checked={defaultChecked.venueVisible}
                  >
                    {AppConstants.trainingVenue}
                  </Checkbox>
                </div>
              </div>

              {defaultChecked.venueVisible && (
                <div className="row">
                  <div className="col-sm">
                    <Radio.Group
                      className="reg-competition-radio"
                      disabled={isPublished}
                      onChange={e => this.chooseTrainingVenueInputFormat(e)}
                      value={
                        defaultChecked.venueListVisible
                          ? 0
                          : defaultChecked.venueTextVisible
                          ? 1
                          : null
                      }
                    >
                      <Radio key={0} value={0}>
                        {AppConstants.selectExistingVenue}
                      </Radio>
                      <Radio key={1} value={1}>
                        {AppConstants.specifyAlternateVenue}
                      </Radio>
                    </Radio.Group>
                  </div>
                  {defaultChecked.venueListVisible ? (
                    <div className="col-sm">
                      <Select
                        showSearch
                        name="trainingVenueId"
                        className="w-100"
                        style={{ paddingRight: 1, minWidth: 182 }}
                        onChange={trainingVenueId =>
                          this.props.updateRegistrationForm(trainingVenueId, 'trainingVenueId')
                        }
                        value={formDataValue ? formDataValue.trainingVenueId : null}
                        placeholder="Select"
                        filterOption={(input, option) =>
                          option.children.toLocaleLowerCase().indexOf(input.toLocaleLowerCase()) >=
                          0
                        }
                      >
                        {venueList.map(item => (
                          <Option key={'venue_' + item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  ) : defaultChecked.venueTextVisible ? (
                    <div className="col-sm">
                      <Input
                        name="trainingVenueText"
                        placeholder="Venue Name"
                        className="w-100"
                        style={{ paddingRight: 1, minWidth: 182 }}
                        allowClear
                        onChange={e =>
                          this.props.updateRegistrationForm(e.target.value, 'trainingVenueText')
                        }
                        value={formDataValue ? formDataValue.trainingVenueText : ''}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
        <InputWithHead
          heading={AppConstants.specialNote}
          conceptulHelp
          conceptulHelpMsg={AppConstants.regFormSpecialNoteMsg}
          marginTop={0}
        />

        <TextArea
          placeholder={AppConstants.addShortNotes_registering}
          allowClear
          name="specialNote"
          onChange={specialNote =>
            this.props.updateRegistrationForm(specialNote.target.value, 'specialNote')
          }
          value={formDataValue ? formDataValue.specialNote : null}
        />

        <InputWithHead
          heading={AppConstants.photos}
          conceptulHelp
          conceptulHelpMsg={AppConstants.regFormPhotoMsg}
          marginTop={0}
        />
        {(formDataValue.organisationPhotos == null ||
          formDataValue.organisationPhotos.length === 0) &&
        orgLogoUrl == null ? (
          <span>{AppConstants.noPhotosAvailable}</span>
        ) : (
          <div className="org-photos">
            {orgLogoUrl != null && (
              <div>
                <div>
                  <img
                    src={orgLogoUrl}
                    alt=""
                    height={125}
                    width={125}
                    style={{ borderRadius: 0, marginLeft: 0 }}
                    name="image"
                    onError={ev => {
                      ev.target.src = AppImages.circleImage;
                    }}
                  />
                </div>
                <div className="photo-type">{AppConstants.logo}</div>
              </div>
            )}
            {(formDataValue.organisationPhotos || []).map(ph => (
              <div key={ph.organisationPhotoId}>
                <div>
                  <img
                    src={ph.photoUrl}
                    alt=""
                    height={125}
                    width={125}
                    style={{ borderRadius: 0, marginLeft: 0 }}
                    name="image"
                    onError={ev => {
                      ev.target.src = AppImages.circleImage;
                    }}
                  />
                </div>
                <div className="photo-type">{ph.photoType}</div>
              </div>
            ))}
            {/* {(formDataValue.organisationPhotos == null ||
                        formDataValue.organisationPhotos == undefined ||
                        formDataValue.organisationPhotos.length === 0) ?
                            <span>{AppConstants.noPhotosAvailable}</span> : null} */}
          </div>
        )}
      </div>
    );
  };

  ///update training check box
  updateTraining(checked, key) {
    this.props.isCheckedVisible(checked, key);
  }

  chooseTrainingVenueInputFormat(e) {
    if (e.target.value == 0) {
      this.props.isCheckedVisible(true, 'venueListVisible');
    } else if (e.target.value == 1) {
      this.props.isCheckedVisible(true, 'venueTextVisible');
    }
  }

  // update reply check handle
  checkReplyTocontact(checked, key) {
    this.props.isReplyCheckVisible(checked, key);
  }

  // change number
  changeNumber = number => {
    if (number.length === 10) {
      this.setState({
        hasError: false,
      });
      this.props.updateRegistrationForm(regexNumberExpression(number), 'replyPhone');
    } else if (number.length < 10) {
      this.props.updateRegistrationForm(regexNumberExpression(number), 'replyPhone');
      this.setState({
        hasError: true,
      });
    }
    setTimeout(() => {
      this.setFieldDecoratorValues();
    }, 500);
  };

  ///reply to contact details view
  replyContactDetailsView = () => {
    let defaultChecked = this.props.registrationState.defaultChecked;
    let formDataValue =
      this.props.registrationState.registrationFormData !== 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let hasError = this.state.hasError;
    return (
      <div className="fees-view">
        <div className="row ml-1 d-flex align-items-center">
          <Checkbox
            className="single-checkbox mt-0"
            checked={defaultChecked.replyContactVisible}
            onChange={e => this.checkReplyTocontact(e.target.checked, 'replyContactVisible')}
            data-testid={AppUniqueId.REPLY_TO_CONTACT_DETAILS}
          >
            {AppConstants.replyToContactDetails}
          </Checkbox>
          <div style={{ marginTop: -8, marginLeft: -8 }}>
            <CustomTooltip>
              <span>{AppConstants.replyContactDetailMsg}</span>
            </CustomTooltip>
          </div>
        </div>
        {defaultChecked.replyContactVisible === true && (
          <div className="comp-open-reg-check-inpt-view">
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row" style={{ height: 56 }}>
                <div className="col-sm d-flex">
                  <Checkbox
                    className="comp-open-single-checkbox"
                    checked={defaultChecked.replyName}
                    onChange={e => this.checkReplyTocontact(e.target.checked, 'replyName')}
                    data-testid={AppUniqueId.REPLY_NAME}
                  >
                    {AppConstants.name}
                  </Checkbox>
                </div>
                {defaultChecked.replyName === true && (
                  <div className="col-sm">
                    <InputWithHead
                      auto_complete="off"
                      placeholder="Name"
                      onChange={e => this.props.updateRegistrationForm(e.target.value, 'replyName')}
                      value={formDataValue ? formDataValue.replyName : ''}
                      data-testid={AppUniqueId.REPLY_NAME}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row" style={{ height: 56 }}>
                <div className="col-sm d-flex">
                  <Checkbox
                    className="single-checkbox"
                    checked={defaultChecked.replyRole}
                    onChange={e => this.checkReplyTocontact(e.target.checked, 'replyRole')}
                    data-testid={AppUniqueId.REPLY_ROLE}
                  >
                    {AppConstants.role}
                  </Checkbox>
                </div>
                {defaultChecked.replyRole === true && (
                  <div className="col-sm">
                    <InputWithHead
                      auto_complete="off"
                      placeholder={AppConstants.role}
                      onChange={e => this.props.updateRegistrationForm(e.target.value, 'replyRole')}
                      value={formDataValue ? formDataValue.replyRole : ''}
                      data-testid={AppUniqueId.REPLY_ROLE}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row" style={{ height: 56 }}>
                <div className="col-sm d-flex">
                  <Checkbox
                    className="single-checkbox"
                    checked={defaultChecked.replyEmail}
                    onChange={e => this.checkReplyTocontact(e.target.checked, 'replyEmail')}
                    data-testid={AppUniqueId.REPLY_EMAIL}
                  >
                    {AppConstants.email}
                  </Checkbox>
                </div>
                {defaultChecked.replyEmail === true && (
                  <div className="col-sm">
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          type: 'email',
                          pattern: new RegExp(AppConstants.emailExp),
                          message: ValidationConstants.email_validation,
                        },
                      ]}
                    >
                      <InputWithHead
                        auto_complete="off"
                        placeholder={AppConstants.email}
                        onChange={e =>
                          this.props.updateRegistrationForm(e.target.value, 'replyEmail')
                        }
                        value={formDataValue ? formDataValue.replyEmail : ''}
                        data-testid={AppUniqueId.REPLY_EMAIL}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
            </div>
            <div className="fluid-width" style={{ marginTop: 15 }}>
              <div className="row" style={{ height: 56 }}>
                <div className="col-sm d-flex">
                  <Checkbox
                    className="single-checkbox"
                    checked={defaultChecked.replyPhone}
                    onChange={e => this.checkReplyTocontact(e.target.checked, 'replyPhone')}
                    data-testid={AppUniqueId.REPLY_PHONE}
                  >
                    {AppConstants.phone}
                  </Checkbox>
                </div>
                {defaultChecked.replyPhone === true && (
                  <div className="col-sm">
                    <Form.Item
                      help={hasError && ValidationConstants.mobileLength}
                      validateStatus={hasError ? 'error' : 'validating'}
                    >
                      <InputWithHead
                        // type="number"
                        auto_complete="off"
                        maxLength={10}
                        placeholder={AppConstants.phone}
                        onChange={e => this.changeNumber(e.target.value)}
                        value={formDataValue ? formDataValue.replyPhone : ''}
                        data-testid={AppUniqueId.REPLY_PHONE}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  onChangeRegistrationMethod = value => {
    if (this.props.registrationState.registrationFormData.length > 0) {
      let formDataValue = this.props.registrationState.registrationFormData[0];
      if (formDataValue.registerMethods !== null) {
        let matchIndex = formDataValue.registerMethods.findIndex(
          x => x.registrationMethodRefId == value.id,
        );
        if (matchIndex > -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  ///how user register view
  UserRegisterView = () => {
    let formDataValue =
      this.props.registrationState.registrationFormData !== 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let registrationMethod =
      this.props.appState.regMethod.length !== 0 ? this.props.appState.regMethod : [];
    let isPublished = false; // this.state.isPublished // CM-1513
    return (
      <div className="discount-view pt-5">
        <div className="row ml-1">
          <span className="form-heading">{AppConstants.how_users_Register}</span>
          <div className="mt-0 ml-n2">
            <CustomTooltip>
              <span>{AppConstants.howUserRegisterMsg}</span>
            </CustomTooltip>
          </div>
        </div>
        <div className="checkbox-row-wise">
          {registrationMethod.map((item, index) => (
            <Checkbox
              className="single-checkbox"
              name="registerMethods"
              checked={this.onChangeRegistrationMethod(item, index)}
              onChange={e => this.methodSelection(e, item, formDataValue)}
              key={'methods' + index}
              disabled={isPublished}
            >
              {item.description}
            </Checkbox>
          ))}
        </div>
      </div>
    );
  };

  // for change and update tree props
  onTreeSelected(itemValue, selectedInvitees) {
    // let selectedInvitees = this.props.registrationState.selectedInvitees
    let upcomingData = [...itemValue];
    this.props.updateRegistrationForm(upcomingData, 'registrationSettings');
  }

  onDemoTreeSelected(itemValue, selectedInvitees) {
    let upcomingData = [...itemValue];
    this.props.updateRegistrationForm(upcomingData, 'demographicSettings');
  }

  onNetballTreeSelected = (itemValue, { checked, checkedNodes, node, event, halfCheckedKeys }) => {
    let upcomingData = [...itemValue];
    this.props.updateRegistrationForm(upcomingData, 'NetballQuestions');
  };

  onOtherTreeSelected(itemValue, selectedInvitees) {
    let upcomingData = [...itemValue];

    this.props.updateRegistrationForm(upcomingData, 'OtherQuestions');
  }

  makeSeletedArr(formDataValue) {
    if (formDataValue) {
      let arr = formDataValue.registrationSettings;
      let selectedInvitees = [];
      if (arr.length > 0) {
        for (let i in arr) {
          selectedInvitees.push(arr[i].registrationSettingsRefId);
        }
      }

      return selectedInvitees;
    } else {
      return [];
    }
  }

  getCoachUmpireStatus = () => {
    let selectedMemberShipType = this.props.registrationState.selectedMemberShipType || [];
    let showUmpireQuestions = false;
    let showCoachQuestions = false;
    let showWalkingQuestions = false;
    for (let membership of selectedMemberShipType) {
      let membershipProductTypes = membership.membershipProductTypes || [];
      let umpireIndex = membershipProductTypes.findIndex(t => t.isSelected && t.isOfficial);
      let coachIndex = membershipProductTypes.findIndex(
        t => t.isSelected && t.orginalMembershipProductTypeId == MEMBERSHIP_PRODUCT_TYPE.COACH,
      );

      let walkingIndex = membershipProductTypes.findIndex(
        t =>
          t.isSelected &&
          t.orginalMembershipProductTypeId == MEMBERSHIP_PRODUCT_TYPE.PLAYER_WALKING_NETBALL,
      );

      if (walkingIndex > -1) {
        showWalkingQuestions = true;
      }

      if (umpireIndex > -1) {
        showUmpireQuestions = true;
      }
      if (coachIndex > -1) {
        showCoachQuestions = true;
      }
      if (showUmpireQuestions && showCoachQuestions && showWalkingQuestions) break;
    }
    return { showUmpireQuestions, showCoachQuestions, showWalkingQuestions };
  };

  getAffiliateQuestions = () => {};

  getOptionalQuestions = () => {
    // if (!this.optionalQuestions.length) {
    //  let optionals = [];
    const { showUmpireQuestions, showCoachQuestions, showWalkingQuestions } =
      this.getCoachUmpireStatus();

    let allQuestionSettings = this.props.appState.allQuestionSettings || [];
    let stateRegistrationSettings = this.props.registrationState.stateRegistrationSettings || [];
    let optionalSettingIds = stateRegistrationSettings
      .filter(setting => setting.isAffiliateChoosing == 1)
      .map(setting => setting.registrationSettingRefId);
    let treedata = [];

    let filterQuestions = allQuestionSettings.filter(
      setting => setting.id != REGISTRATION_QUESTIONS.SHOP,
    );
    if (!showUmpireQuestions) {
      filterQuestions = filterQuestions.filter(
        q => q.id != REGISTRATION_QUESTIONS.UMPIRE_MEMBERSHIP_QUESTIONS,
      );
    }

    if (!showCoachQuestions) {
      filterQuestions = filterQuestions.filter(
        q => q.id != REGISTRATION_QUESTIONS.COACH_MEMBERSHIP_QUESTIONS,
      );
    }

    if (!showWalkingQuestions) {
      filterQuestions = filterQuestions.filter(
        q => q.id != REGISTRATION_QUESTIONS.WALKING_MEMBERSHIP_QUESTIONS,
      );
    }
    let checkWithNumber = null;
    filterQuestions.forEach(question => {
      let subRefs = question.subReferences || [];
      let node = {
        title: question.description,
        key: question.id.toString(),
        children: [],
        checkable: false,
        isLeaf: false,
      };
      for (let sub of subRefs) {
        if (optionalSettingIds.includes(sub.id)) {
          node.children.push({
            title: sub.description,
            key: sub.id.toString(),
            checkable: true,
            isLeaf: true,
          });
        }
      }
      treedata.push(node);
    });

    this.optionalQuestions = treedata.filter(t => t.children.length);
    //}
    return this.optionalQuestions;
  };

  onExpand = (expandedKeys, { expanded, node }) => {
    let { collapseNodes } = this.state;
    if (!expanded) {
      collapseNodes.push(node.key);
    } else {
      collapseNodes = collapseNodes.filter(n => n != node.key);
    }
    this.setState({ collapseNodes: [...collapseNodes] });
  };

  ///advance  setting view
  advancedSettingView = () => {
    /*  let registrationAdvanceSetting =
      this.props.appState.formSettings !== 0 ? this.props.appState.formSettings : [];
    let netballQuestionsSetting =
      this.props.appState.netballQuestionsSetting !== 0
        ? this.props.appState.netballQuestionsSetting
        : []; */
    let allQuestionSettings = this.props.appState.allQuestionSettings || [];
    let stateRegistrationSettings = this.props.registrationState.stateRegistrationSettings || [];

    let optionalSettingIds = stateRegistrationSettings
      .filter(setting => setting.isAffiliateChoosing == 1)
      .map(setting => setting.registrationSettingRefId);

    let registrationAdvanceSetting = [
      ...allQuestionSettings.filter(setting => setting.id == REGISTRATION_QUESTIONS.SHOP),
    ];

    let netballQuestionsSetting = [
      ...allQuestionSettings.filter(setting => optionalSettingIds.includes(setting.id)),
    ];

    let optionalQuestionData = this.getOptionalQuestions();
    let defaultExpandedKeys = [];
    const { collapseNodes } = this.state;
    allQuestionSettings.forEach(q => {
      let refId = q.id.toString();
      if (q.id != REGISTRATION_QUESTIONS.SHOP && !collapseNodes.includes(refId)) {
        defaultExpandedKeys.push(refId);
      }
    });

    const {
      selectedInvitees,
      // selectedDemographic,
      // SelectedOtherQuestions,
      selectedNetballQuestions,
    } = this.props.registrationState;
    let isPublished = false; // this.state.isPublished // CM-1513
    let inviteesExpend =
      selectedInvitees.includes('2') ||
      selectedInvitees.includes('3') ||
      selectedInvitees.includes('4') ||
      selectedInvitees.includes(2) ||
      selectedInvitees.includes(3) ||
      selectedInvitees.includes(4)
        ? '1'
        : null;
    // let netballExpend = (selectedNetballQuestions.includes("7") || selectedNetballQuestions.includes(7)) ? "5" : null

    return (
      <div className="discount-view pt-5">
        {optionalQuestionData.length ? (
          <>
            <div className="row ml-1">
              <span className="form-heading">{AppConstants.additionalQuestions}</span>
              <div className="mt-2">
                <CustomTooltip>
                  <span>{AppConstants.additionQuesMsg}</span>
                </CustomTooltip>
              </div>
            </div>

            <div className="inside-container-view">
              <span className="setting-heading">{AppConstants.registrationQuestions}</span>
              <Tree
                style={{ flexDirection: 'column' }}
                checkable
                /* className="tree-government-rebate tree-selection-icon" */
                defaultExpandAll={true}
                autoExpandParent={true}
                expandedKeys={defaultExpandedKeys}
                disabled={isPublished}
                checkedKeys={[...selectedNetballQuestions]}
                onCheck={this.onNetballTreeSelected}
                onExpand={this.onExpand}
                treeData={optionalQuestionData}
              />
            </div>
          </>
        ) : null}

        <span className="form-heading pt-5">{AppConstants.advancedSettings}</span>

        <div className="inside-container-view">
          <Tree
            className="tree-government-rebate tree-selection-icon"
            style={{ flexDirection: 'column' }}
            checkable
            expandedKeys={[inviteesExpend]}
            disabled={isPublished}
            defaultCheckedKeys={[]}
            checkedKeys={[...selectedInvitees]}
            onCheck={e => this.onTreeSelected(e, selectedInvitees)}
            data-testid={AppUniqueId.REG_ADVANCED_SETTINGS_SHOP}
          >
            {this.ShowAdvancedSettingSettingTree(registrationAdvanceSetting)}
          </Tree>
        </div>
      </div>
    );
  };

  ShowAdvancedSettingSettingTree = tree => {
    const { TreeNode } = Tree;
    return tree.map((item, catIndex) => {
      return (
        <TreeNode title={this.advancedNode(item)} key={item.id}>
          {this.showSubAdvancedNode(item, catIndex)}
        </TreeNode>
      );
    });
  };

  advancedNode = item => {
    return (
      <span className="d-block" style={{ marginTop: 4 }}>
        {item.description}
      </span>
    );
  };

  showSubAdvancedNode(item) {
    const { TreeNode } = Tree;
    return item.subReferences.map(inItem => {
      return <TreeNode title={this.makeSubAdvancedNode(inItem)} key={inItem.id} />;
    });
  }

  makeSubAdvancedNode(item) {
    return <span>{item.description}</span>;
  }

  disclamerText(textBody, index, key) {
    this.props.updateDisclamerText(textBody, index, key);
  }

  //disclaimer view
  disclaimerView = () => {
    let registrationData =
      this.props.registrationState.registrationFormData.length > 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let disclaimerData =
      registrationData.registrationDisclaimer !== null
        ? isArrayNotEmpty(registrationData.registrationDisclaimer)
          ? registrationData.registrationDisclaimer
          : []
        : [];
    let isPublished = false; //this.state.isPublished; // CM-1513
    return (
      <div className="discount-view pt-5">
        <span className="form-heading">{AppConstants.disclaimers}</span>

        {disclaimerData.map((item, index) => (
          <div className="inside-container-view">
            <div
              className="transfer-image-view pt-0"
              onClick={e => (!isPublished ? this.removeDisclaimer(e, index) : null)}
            >
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text">{AppConstants.remove}</span>
            </div>
            <Form.Item
              name={`disclaimerText${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.disclaimersIsRequired,
                },
              ]}
            >
              <InputWithHead
                required="required-field pb-0 pt-0"
                heading={AppConstants.disclaimers}
                placeholder={AppConstants.disclaimers}
                onChange={e => this.disclamerText(e.target.value, index, 'disclaimerText')}
                disabled={isPublished}
                // value={disclaimerData.registrationDisclaimer[index].disclaimerText}
              />
            </Form.Item>
            <Form.Item
              name={`disclaimerLink${index}`}
              rules={[
                {
                  required: true,
                  message: ValidationConstants.DisclaimerLinkIsRequired,
                },
              ]}
            >
              <InputWithHead
                required="required-field pb-0"
                heading={AppConstants.disclaimerLink}
                placeholder={AppConstants.disclaimerLink}
                onChange={e => this.disclamerText(e.target.value, index, 'disclaimerLink')}
                disabled={isPublished}
                // value={disclaimerData.registrationDisclaimer[index].disclaimerLink}
              />
            </Form.Item>
          </div>
        ))}
        <span
          className="input-heading-add-another"
          onClick={() => (!isPublished ? this.addDisclaimerLink() : null)}
        >
          + {AppConstants.addAnotherDisclaimerLink}
        </span>
      </div>
    );
  };

  // Send invite to
  sendInviteToView = () => {
    const registrationFormData = this.props.registrationState.registrationFormData[0];
    let { inviteTypeData } = this.props.commonReducerState;
    let isPublished = false; //this.state.isPublished; // CM-1513

    return (
      <div className="discount-view pt-5">
        <span className="form-heading pb-2">{AppConstants.sendInvitesTo}</span>
        <InputWithHead heading={AppConstants.invite} />
        <Radio.Group
          className="reg-competition-radio pb-5"
          disabled={isPublished}
          onChange={e => this.props.updateRegistrationForm(e.target.value, 'canInviteSend')}
          value={registrationFormData.canInviteSend}
        >
          <Radio key={1} value={1} data-testid={AppUniqueId.REG_SEND_EMAIL}>
            {AppConstants.send}
          </Radio>
          <Radio key={0} value={0} data-testid={AppUniqueId.REG_NO_SEND_EMAIL}>
            {AppConstants.noSend}
          </Radio>
        </Radio.Group>
        {registrationFormData.canInviteSend == 1 && (
          <div>
            <div className="fluid-width">
              <div className="row">
                <div className="col-sm-3" style={{ marginRight: 25 }}>
                  <div className="w-ft d-flex flex-row align-items-center">
                    <span className="year-select-heading">{AppConstants.year}:</span>
                    <Select
                      name="yearRefId"
                      className="year-select reg-filter-select"
                      style={{ marginLeft: 25, minWidth: 100 }}
                      disabled={isPublished}
                      onChange={yearRefId => this.onYearChange(yearRefId)}
                      value={registrationFormData.inviteYearRefId}
                      // value={formDataValue ? formDataValue.yearRefId ? formDataValue.yearRefId : 1 : 1}
                    >
                      {this.props.appState.allYearList.map(item => (
                        <Option key={'year_' + item.id} value={item.id}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div
                    className="w-ft d-flex flex-row align-items-center"
                    style={{ marginRight: 50 }}
                  >
                    <span className="year-select-heading">{AppConstants.competition}:</span>
                    <Select
                      style={{ marginLeft: 25, minWidth: 160 }}
                      name="competition"
                      className="year-select reg-filter-select1"
                      disabled={isPublished}
                      onChange={e => this.props.updateRegistrationForm(e, 'inviteCompetitionId')}
                      value={
                        registrationFormData.inviteCompetitionId != null
                          ? registrationFormData.inviteCompetitionId.toString()
                          : '0'
                      }
                    >
                      {this.props.appState.allCompetitionTypeList.map(item => (
                        <Option
                          key={'competition_' + item.competitionId}
                          value={item.competitionId}
                        >
                          {item.competitionName}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <InputWithHead heading={AppConstants.inviteType} />
            <Radio.Group
              className="reg-competition-radio"
              disabled={isPublished}
              onChange={e => this.props.updateRegistrationForm(e.target.value, 'inviteTypeRefId')}
              value={registrationFormData.inviteTypeRefId}
            >
              {(inviteTypeData || []).map(fix => (
                <Radio key={'inviteType_' + fix.id} value={fix.id}>
                  {fix.description}
                </Radio>
              ))}
            </Radio.Group>
            <InputWithHead heading={AppConstants.gender} />
            <Radio.Group
              className="reg-competition-radio"
              disabled={isPublished}
              value={registrationFormData.genderRefId}
              onChange={e => this.props.updateRegistrationForm(e.target.value, 'genderRefId')}
            >
              <Radio value={2}>{AppConstants.male}</Radio>
              <Radio value={1}> {AppConstants.female}</Radio>
              <Radio value={3}>{AppConstants.both}</Radio>
            </Radio.Group>
            <InputWithHead heading={AppConstants.dOB} />
            <Radio.Group
              className="reg-competition-radio"
              disabled={isPublished}
              value={registrationFormData.dobPreferenceRefId}
              onChange={e =>
                this.props.updateRegistrationForm(e.target.value, 'dobPreferenceRefId')
              }
            >
              <Radio
                className="dob-pref-radio-inner-heading"
                style={{ marginBottom: 10 }}
                value={1}
              >
                {AppConstants.NoDobPreference}
              </Radio>
              <Radio className="dob-pref-radio-inner-heading" value={2}>
                {AppConstants.DobPreference}
              </Radio>
            </Radio.Group>
            {registrationFormData.dobPreferenceRefId == 2 && (
              <div>
                <div className="d-flex" style={{ marginLeft: 23 }}>
                  <span className="applicable-to-datepicker-col">{AppConstants.DobMoreThan}</span>
                  <div className="dob-pref-date-picker">
                    <DatePicker
                      // size="large"
                      placeholder="dd-mm-yyyy"
                      className="w-100"
                      onChange={e => this.dateChange(e, 'dobPreferenceMoreThan')}
                      name="dobPreferenceMoreThan"
                      format="DD-MM-YYYY"
                      showTime={false}
                      disabled={isPublished}
                      disabledDate={
                        registrationFormData.dobPreferenceLessThan == null
                          ? false
                          : d => !d || d.isAfter(registrationFormData.dobPreferenceLessThan)
                      }
                      value={
                        registrationFormData.dobPreferenceMoreThan == null ||
                        registrationFormData.dobPreferenceMoreThan == ''
                          ? ''
                          : moment(registrationFormData.dobPreferenceMoreThan, 'YYYY-MM-DD')
                      }
                    />
                  </div>
                </div>
                <div className="d-flex" style={{ marginLeft: 23 }}>
                  <span className="applicable-to-datepicker-col">{AppConstants.DobLessThan}</span>
                  <div className="dob-pref-date-picker" style={{ marginLeft: 9 }}>
                    <DatePicker
                      // size="large"
                      className="w-100"
                      placeholder="dd-mm-yyyy"
                      onChange={e => this.dateChange(e, 'dobPreferenceLessThan')}
                      name="dobPreferenceLessThan"
                      disabledTime={this.disabledTime}
                      format="DD-MM-YYYY"
                      disabled={isPublished}
                      showTime={false}
                      disabledDate={
                        registrationFormData.dobPreferenceMoreThan == null
                          ? false
                          : d => !d || d.isSameOrBefore(registrationFormData.dobPreferenceMoreThan)
                      }
                      // || d.isSameOrBefore(dateOpen)
                      // value={closeDate ? moment(closeDate, "YYYY-MM-DD") : ""}
                      value={
                        registrationFormData.dobPreferenceLessThan == null ||
                        registrationFormData.dobPreferenceLessThan == ''
                          ? ''
                          : moment(registrationFormData.dobPreferenceLessThan, 'YYYY-MM-DD')
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  hardshipCodeView = () => {
    const { hardShipCodes, orgRegistrationId } =
      this.props.registrationState.registrationFormData[0];
    let hardShipCodesList = hardShipCodes == null ? [] : hardShipCodes;
    // let isPublished = this.state.isPublished;
    return (
      <div className="discount-view pt-5">
        <span className="form-heading pb-2">{AppConstants.singleUseDiscount}</span>
        <div>
          <span>{AppConstants.discountNote}</span>
        </div>
        {hardShipCodesList.map(item => (
          <div>
            <div className="d-flex" style={{ marginTop: '13px' }}>
              <div
                className={item.isActive == 0 ? 'hardshipcode-text-active' : 'hardshipcode-text'}
              >
                {item.code}
              </div>

              {item.isActive == 1 && <div>{this.mailClientView(item.code)}</div>}
            </div>
          </div>
        ))}

        {/* {!isPublished && */}
        <span
          className="input-heading-add-another"
          onClick={e => this.addHardshipCode(orgRegistrationId)}
        >
          +{AppConstants.addCode}
        </span>
        {/* } */}
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    let registrationData =
      this.props.registrationState.registrationFormData.length > 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let statusRefId = registrationData.statusRefId;
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm-3">
              <div className="reg-add-save-button">
                {/* <Button type="cancel-button">{AppConstants.delete}</Button> */}
              </div>
            </div>
            <div className="col-sm-9">
              <div className="comp-buttons-view">
                <Tooltip
                  className="h-100"
                  onMouseEnter={() => this.setState({ tooltipVisibleDraft: statusRefId == 2 })}
                  onMouseLeave={() => this.setState({ tooltipVisibleDraft: false })}
                  visible={this.state.tooltipVisibleDraft}
                  title={ValidationConstants.compRegHaveBeenSent}
                >
                  <Button
                    className="save-draft-text"
                    type="save-draft-text"
                    htmlType="submit"
                    disabled={statusRefId == 2}
                    onClick={() => this.setState({ statusRefId: 1 })}
                  >
                    {AppConstants.saveAsDraft}
                  </Button>
                </Tooltip>

                <Button
                  className="save-draft-text"
                  type="save-draft-text"
                  onClick={() =>
                    this.navigateToEndUserRegistration(registrationData.userRegistrationUrl)
                  }
                >
                  {AppConstants.preview}
                </Button>
                {/* <Tooltip style={{ height: '100%' }}
                                    onMouseEnter={() => this.setState({ tooltipVisiblePublish: statusRefId == 2 })}
                                    onMouseLeave={() => this.setState({ tooltipVisiblePublish: false })}
                                    visible={this.state.tooltipVisiblePublish}
                                    title={ValidationConstants.compRegHaveBeenSent}> */}
                <Button
                  className="open-reg-button"
                  data-testid={AppUniqueId.OPEN_REGISTRATION_BUTTON}
                  htmlType="submit"
                  type="primary"
                  onClick={() => this.setState({ statusRefId: 2 })}
                  // disabled={statusRefId == 2}
                  // style={{ height: statusRefId == 2 ? "100%" : null, borderRadius: statusRefId == 2 ? 5 : null }}
                >
                  {statusRefId == 2 ? AppConstants.update : AppConstants.openRegistrations}
                </Button>
                {/* </Tooltip> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  navigateToEndUserRegistration = url => {
    let regUrl = url + '&sourceSystem=WebAdmin';
    window.open(regUrl, '_blank');
  };

  userRegisrationLinkView = () => {
    let formDataValue =
      this.props.registrationState.registrationFormData !== 0
        ? this.props.registrationState.registrationFormData[0]
        : [];
    let statusRefId = formDataValue.statusRefId;
    return (
      <div>
        {statusRefId == 2 && (
          <div className="formView">
            <div className="content-view pt-4 mb-20">
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.endUserRegistrationUrl} />
                  <div>
                    <a
                      className="user-reg-link"
                      href={formDataValue.userRegistrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formDataValue.userRegistrationUrl}
                    </a>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm">
                  <InputWithHead heading={AppConstants.hiddenEndUserRegistrationUrl} />
                  <div>
                    <a
                      className="user-reg-link"
                      href={formDataValue.hiddenUserRegistrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formDataValue.hiddenUserRegistrationUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  render() {
    const { isHardshipEnabled } = this.props.registrationState.registrationFormData[0];
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.registration}
          menuName={AppConstants.registration}
        />

        <InnerHorizontalMenu menu="registration" regSelectedKey="3" />

        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.registrationSubmit}
            noValidate="noValidate"
            onFinishFailed={this.onFinishFailed}
          >
            {/* {this.dropdownView()} */}
            <Content>
              {this.userRegisrationLinkView()}
              <div className="formView">{this.contentView()}</div>
              <div className="formView">{this.replyContactDetailsView()}</div>
              {/* <div className="formView">{this.UserRegisterView()}</div> */}
              <div className="formView">{this.advancedSettingView()}</div>
              <div className="formView">{this.sendInviteToView()}</div>
              {isHardshipEnabled == 1 && <div className="formView">{this.hardshipCodeView()}</div>}
              {/* <div className="formView">{this.disclaimerView()}</div> */}

              <Loader
                visible={
                  this.state.onRegistrationLoad ||
                  this.props.appState.onLoad ||
                  this.props.registrationState.onLoad ||
                  this.props.registrationState.onRegistrationSaveLoad
                }
              />
            </Content>
            <Footer>{this.footerView()}</Footer>
            {this.confirmationModalView()}
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getYearAndCompetitionAction,
      getVenuesTypeAction,
      getCompetitionTypeListAction,
      regSaveRegistrationForm,
      getRegFormAdvSettings,
      getRegistrationMethod,
      getMembershipproduct,
      getRegistrationForm,
      updateRegistrationForm,
      clearReducerDataAction,
      changeMembershipProduct,
      updateProductSelection,
      updateRegistrationTypes,
      updateRegistrationLock,
      updateDisclamerText,
      isCheckedVisible,
      isReplyCheckVisible,
      inviteTypeAction,
      addHardshipCodeAction,
      getStateRegistrationSettingByOrganisationIdAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    registrationState: state.RegistrationState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationForm);

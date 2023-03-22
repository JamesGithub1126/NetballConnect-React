import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Button,
  Select,
  Form,
  Modal,
  Checkbox,
  message,
  Tabs,
  Table,
  Radio,
  Input,
  Space,
  Row,
  Col,
  DatePicker,
  InputNumber,
} from 'antd';

import './user.css';
import {
  getAffiliateToOrganisationAction,
  saveAffiliateAction,
  updateOrgAffiliateAction,
  getUreAction,
  getRoleAction,
  getAffiliateOurOrganisationIdAction,
  getOrganisationDetailByOrganisationIdAction,
  getOrganisationPhotoAction,
  saveOrganisationPhotoAction,
  deleteOrganisationPhotoAction,
  deleteOrgContact,
  updateCharityValue,
  updateCharityAction,
  updateTermsAndConditionAction,
  saveAffiliateFinderAction,
  loadRegSettingLinksAction,
  getAffiliatesListingAction,
} from 'store/actions/userAction/userAction';
import {
  getCommonRefData,
  getPhotoTypeAction,
  getDaysListAction,
  getGenderAction,
  getGenericCommonReference,
} from 'store/actions/commonAction/commonAction';
import { getNewMembershipProductByYearAction } from '../../store/actions/competitionModuleAction/competitionDashboardAction';
import {
  saveRegistrationSettingAction,
  getStateRegistrationSettingByOrganisationIdAction,
  getMembershipTypeMappingByOrganisationIdAction,
} from 'store/actions/registrationAction/registration';
import { getDefaultCompFeesMembershipProducForMultipleYear } from '../../store/actions/registrationAction/competitionFeeAction';
import {
  getOnlyYearListAction,
  getVenuesTypeAction,
  getMembershipProductCategoryTypesAction,
} from 'store/actions/appAction';
import { getNextYear, getCurrentYear } from 'util/permissions';
import { getUserId, getOrganisationData } from 'util/sessionStorage';
import {
  captializedString,
  isArrayNotEmpty,
  isImageFormatValid,
  isImageSizeValid,
  isNotNullOrEmptyString,
} from 'util/helpers';
import InputWithHead from '../../customComponents/InputWithHead';
import RegistrationSetting from './RegistrationSetting/index';
import Integration from './Integration';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import Loader from '../../customComponents/loader';
import ImageLoader from '../../customComponents/ImageLoader';
import PlacesAutocomplete from '../competition/elements/PlaceAutoComplete';
import { randomKeyGen } from 'util/helpers';
import { GENDER } from 'util/enums';
import moment from 'moment';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import * as _ from 'lodash';
import CustomToolTip from 'react-png-tooltip';
import { StateBorrowRuleRef } from 'enums/enums';
import { getTransactionFeeMsg, isMembershipConcurrencyRuleEnabled } from 'util/registrationHelper';
import AppUniqueId from 'themes/appUniqueId';
const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

let _this = null;
const columns = [
  {
    dataIndex: 'photoUrl',
    key: 'photoUrl',
    render: (photoUrl, record) => (
      <div>
        {_this.state.isEditable && _this.photosRemoveBtnView(record)}
        {_this.photosImageView(photoUrl, record)}
      </div>
    ),
  },
];

const TabKey = {
  General: '1',
  Photos: '2',
  TermsAndCond: '3',
  Charity: '4',
  AffiliateFinder: '5',
  RegistrationSetting: '6',
  Integrations: '7',
};

class UserOurOrganization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      loggedInuserOrgTypeRefId: 0,
      loading: false,
      photoLoading: false,
      photoDeleteLoading: false,
      buttonPressed: '',
      getDataLoading: false,
      deleteModalVisible: false,
      currentIndex: 0,
      image: null,
      isSameUserEmailId: '',
      isSameUserEmailChanged: false,
      organisationTabKey: TabKey.General,
      timeout: null,
      orgPhotosImg: null,
      orgPhotosImgSend: null,
      imageError: '',
      tableRecord: null,
      isEditView: false,
      orgPhotoModalVisible: false,
      isEditable: true,
      sourcePage: 'AFF',
      termsAndCondititionFile: this.props.userState.termsAndCondititionFile ?? null,
      stateTermsAndCondititionFile: this.props.userState.stateTermsAndCondititionFile ?? null,
      organisationTypeRefId: 0,
      affiliateAddressError: '',
      whatIsTheLowestOrgThatCanAddChild: 3,
      whatIsTheLowestOrgThatCanAddVenue: 4,
      isRestrictedToLinkedVenues: 0,
      membershipProducts: [],
      newMembershipOnLoad: false,
      stateBorrowRuleRefId: 1,
      defaultUmpireAvailability: 1,
      borrowableMembershipMappingIds: [],
      showButton: false,
      allowEndUserRegistrationChange: true,
      allowPlayerReplication: false,
      percentageTxnFeeOrganisation: 0,
      transactionFeeMsg: '',
      isConcurrencyRuleChecked: false,
    };
    _this = this;
    this.props.getCommonRefData();
    this.props.getRoleAction();
    this.props.getDaysListAction();
    this.props.getGenderAction();
    this.props.getVenuesTypeAction('all');
    this.props.getGenericCommonReference({ RegistrationSettings: 'RegistrationSettings' });
    this.formRef = React.createRef();
  }

  async componentDidMount() {
    if (this.props.location.state !== null && this.props.location.state !== undefined) {
      //const { isEditable } = this.props.location.state;
      const { affiliateOrgId } = this.props.location.state;
      const { sourcePage } = this.props.location.state;
      const { organisationTypeRefId } = this.props.location.state;
      const isEditable =
        affiliateOrgId ===
        JSON.parse(localStorage.getItem('setOrganisationData')).organisationUniqueKey
          ? true
          : false;
      await this.setState({
        organisationId: affiliateOrgId,
        isEditable,
        sourcePage,
        organisationTypeRefId,
      });
    }

    const organisationData = localStorage.getItem('setOrganisationData');
    if (organisationData) {
      const { organisationUniqueKey } = JSON.parse(organisationData);
      this.props.loadRegSettingLinksAction(organisationUniqueKey);
      this.props.getAffiliatesListingAction({
        organisationId: organisationUniqueKey,
        affiliatedToOrgId: -1,
        organisationTypeRefId: -1,
        statusRefId: -1,
        paging: { limit: 10000, offset: 0 },
        stateOrganisations: true,
      });
    }

    await this.referenceCalls(this.state.organisationId);
    await this.apiCalls(this.state.organisationId);
    this.props.getOnlyYearListAction(this.props.appState.yearList);
  }

  componentDidUpdate(nextProps) {
    const { userState, competitionDashboardState } = this.props;
    const { affiliateTo } = this.props.userState;
    const { affiliateOurOrg } = this.props.userState;
    const { newMembershipOnLoad } = this.state;
    const obj = { organisationId: this.state.organisationId };
    if (userState.onLoad === false && this.state.loading === true) {
      if (!userState.error) {
        this.setState({
          loading: false,
        });
      }
      if (userState.status === 1 && this.state.buttonPressed === 'save') {
        if (this.state.isSameUserEmailChanged) {
          this.logout();
        } else {
          // history.push('/userAffiliatesList');
        }
      }
    }

    if (nextProps.userState !== userState) {
      if (userState.onSaveOrgPhotoLoad === false && this.state.photoLoading === true) {
        this.setState({
          isEditView: false,
          orgPhotosImg: null,
          orgPhotosImgSend: null,
          buttonPressed: '',
          photoLoading: false,
          termsAndCondititionFile: this.props.userState.termsAndCondititionFile ?? null,
          stateTermsAndCondititionFile: this.props.userState.stateTermsAndCondititionFile ?? null,
        });

        this.props.getOrganisationPhotoAction(obj);
      }
      if (userState.onDeleteOrgPhotoLoad === false && this.state.photoDeleteLoading === true) {
        this.setState({
          isEditView: false,
          orgPhotosImg: null,
          orgPhotosImgSend: null,
          buttonPressed: '',
          photoDeleteLoading: false,
        });
        this.props.getOrganisationPhotoAction(obj);
      }
    }
    if (nextProps.competitionDashboardState !== competitionDashboardState) {
      if (newMembershipOnLoad === true && competitionDashboardState.newMembershipOnLoad === false) {
        this.setState({
          membershipProducts: this.formatMembershipData(
            competitionDashboardState.newMembershipProducs,
          ),
        });
        this.setState({ newMembershipOnLoad: false });
      }
    }

    if (this.state.buttonPressed === 'cancel') {
      if (this.state.sourcePage === 'DIR') {
        history.push('/affiliateDirectory');
      } else {
        history.push('/userAffiliatesList');
      }
    }

    if (nextProps.userState.affiliateTo !== affiliateTo) {
      if (userState.affiliateToOnLoad === false) {
        if (affiliateTo.organisationName !== '' && affiliateTo.organisationTypeRefId !== 0) {
          this.setState({
            loggedInuserOrgTypeRefId: affiliateTo.organisationTypeRefId,
            organisationName: affiliateTo.organisationName,
          });
        }
      }
    }

    if (nextProps.userState.affiliateOurOrg !== affiliateOurOrg) {
      if (userState.affiliateOurOrgOnLoad === false) {
        if (affiliateOurOrg.name !== '' && affiliateOurOrg.organisationTypeRefId !== 0) {
          let isConcurrencyRuleChecked = affiliateOurOrg.concurrentMembershipProductCategoryRefIds
            ? true
            : false;
          this.setState({
            whatIsTheLowestOrgThatCanAddChild: affiliateOurOrg.whatIsTheLowestOrgThatCanAddChild,
            whatIsTheLowestOrgThatCanAddVenue: affiliateOurOrg.whatIsTheLowestOrgThatCanAddVenue,
            isRestrictedToLinkedVenues: affiliateOurOrg.isRestrictedToLinkedVenues,
            stateBorrowRuleRefId: affiliateOurOrg.stateBorrowRuleRefId,
            borrowableMembershipMappingIds: affiliateOurOrg.borrowableMembershipMappingIds,
            allowEndUserRegistrationChange: affiliateOurOrg.allowEndUserRegistrationChange,
            defaultUmpireAvailability: affiliateOurOrg.defaultUmpireAvailability,
            allowPlayerReplication: affiliateOurOrg.allowPlayerReplication,
            percentageTxnFeeOrganisation: parseInt(affiliateOurOrg.percentageTxnFeeOrganisation),
            isConcurrencyRuleChecked: isConcurrencyRuleChecked,
          });
          this.setTransactionFeeMsg(affiliateOurOrg.transactionFee);
        }
      }
    }

    if (nextProps.userState !== userState) {
      if (userState.affiliateOurOrgOnLoad === false && this.state.getDataLoading) {
        this.setState({
          getDataLoading: false,
        });
        this.setFormFieldValue();
      }
    }
    //this.getMembershipDetails();
  }
  setTransactionFeeMsg = feeStructure => {
    let msg = getTransactionFeeMsg(feeStructure);
    this.setState({ transactionFeeMsg: msg });
  };

  formatMembershipData = data => {
    let result = _.flatten(
      data.map(mp => {
        return mp.membershipProductTypes
          .filter(mpt => mpt.isPlaying === 1)
          .map(mpt => {
            return {
              membershipProductId: mp.id,
              membershipProductName: mp.membershipProductName,
              membershipProductTypeMappingId: mpt.membershipProductTypeMappingId,
              membershipProductTypeName: mpt.membershipProductTypeName,
              yearRefId: mp.yearRefId,
              yearName: mp.yearName,
              yearSortOrder: mp.yearSortOrder,
            };
          });
      }),
    );

    result = result.sort((a, b) => {
      return b.yearRefId - a.yearRefId !== 0
        ? b.yearRefId - a.yearRefId
        : a.membershipProductName.localeCompare(b.membershipProductName) !== 0
        ? a.membershipProductName.localeCompare(b.membershipProductName)
        : a.membershipProductTypeName.localeCompare(b.membershipProductTypeName);
    });
    return result;
  };

  //filter currently commented out due to being broken.
  getMembershipColumnComplex = data => {
    return [
      {
        title: 'Year',
        dataIndex: 'yearRefId',
        render: (value, record) => record.yearName,
        sorter: { compare: (a, b) => a.yearRefId - b.yearRefId, multiple: 3 },
        width: '20%',
        /*  filters: _.uniqBy(
          data.map(d => {
            return { value: d.yearRefId, text: d.yearName };
          }),
          'value',
        ), */
        // specify the condition of filtering result
        // here is that finding the name started with `value`
        //onFilter: (value, record) => record.yearRefId === value,
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Product',
        dataIndex: 'membershipProductId',
        render: (value, record) => record.membershipProductName,
        sorter: {
          compare: (a, b) => a.membershipProductName.localeCompare(b.membershipProductName),
          multiple: 2,
        },
        width: '40%',
        /* filters: _.uniqBy(
          data.map(d => {
            return { value: d.membershipProductId, text: d.membershipProductName };
          }),
          'value',
        ),
        onFilter: (value, record) => record.membershipProductId === value, */
      },
      {
        title: 'Type',
        dataIndex: 'membershipProductTypeMappingId',
        render: (value, record) => record.membershipProductTypeName,
        sorter: {
          compare: (a, b) => a.membershipProductTypeName.localeCompare(b.membershipProductTypeName),
          multiple: 1,
        },
        width: '40%',
        /* filters: _.uniqBy(
          data.map(d => {
            return { value: d.membershipProductTypeMappingId, text: d.membershipProductTypeName };
          }),
          'value',
        ),
        onFilter: (value, record) => record.membershipProductTypeMappingId === value, */
      },
    ];
  };

  getMembershipColumnSimple = data => {
    return [
      {
        dataIndex: 'membershipProductTypeMappingId',
        render: (value, record) =>
          `${record.yearName} - ${record.membershipProductName} - ${record.membershipProductTypeName}`,
      },
    ];
  };
  getMembershipProducts = () => {
    try {
      let payload = {
        yearRefId: null,
        organisationUniqueKey: getOrganisationData()
          ? getOrganisationData().organisationUniqueKey
          : null,
      };
      this.props.getNewMembershipProductByYearAction(payload);
    } catch (ex) {
      console.log('Error in getMembershipProducts in Our Organisation::' + ex);
    }
  };

  onChangeSetWhoCanAddAffiliate = e => {
    this.setState({
      whatIsTheLowestOrgThatCanAddChild: e.target.value,
    });
  };

  onChangeSetWhoCanAddVenue = e => {
    this.setState({
      whatIsTheLowestOrgThatCanAddVenue: e.target.value,
    });
  };

  onChangeRestrictedToLinkedVenues = e => {
    this.setState({
      isRestrictedToLinkedVenues: e.target.value,
    });
  };

  onChangePlayerBorrowingRule = e => {
    this.setState({
      stateBorrowRuleRefId: e.target.value,
    });
  };

  onChangeWhoPayTransactionFee = e => {
    if (e.target.value == 1) {
      let organisationData = getOrganisationData();
      if (
        !organisationData ||
        !organisationData.stripeCustomerAccountId ||
        !organisationData.stripeBecsMandateId
      ) {
        message.error(AppConstants.setupStripeForWithdrawalsMsg);
        return;
      }
    }
    this.setState({
      percentageTxnFeeOrganisation: e.target.value,
    });
  };
  logout = () => {
    try {
      localStorage.clear();
      history.push('/login');
    } catch (error) {
      console.log(`Error${error}`);
    }
  };

  referenceCalls = organisationId => {
    this.props.getPhotoTypeAction();
    this.props.getAffiliateToOrganisationAction(organisationId);
  };

  apiCalls = async organisationId => {
    await this.props.getAffiliateOurOrganisationIdAction(organisationId);
    await this.props.getOrganisationDetailByOrganisationIdAction(organisationId);
    this.props.getStateRegistrationSettingByOrganisationIdAction(organisationId);
    this.props.getMembershipTypeMappingByOrganisationIdAction(organisationId);
    this.getMembershipProducts();
    if (this.props.appState.membershipProductCategory.length === 0) {
      this.props.getMembershipProductCategoryTypesAction();
    }
    this.setState({ newMembershipOnLoad: true });
    this.setState({ getDataLoading: true });
  };

  getMembershipDetails = async () => {
    const { yearList } = this.props.appState;
    const { multipleDefaultCompFeesMembershipProduct, onLoadMultipleMembership } =
      this.props.competitionFeesState;
    if (
      isArrayNotEmpty(yearList) &&
      !isArrayNotEmpty(multipleDefaultCompFeesMembershipProduct) &&
      !onLoadMultipleMembership
    ) {
      let hasRegistration = 1;
      const nextYearRefId = getNextYear(yearList);
      const yearRefIds = [getCurrentYear(yearList)];
      nextYearRefId !== -1 && yearRefIds.push(nextYearRefId);
      this.props.getDefaultCompFeesMembershipProducForMultipleYear(hasRegistration, yearRefIds);
    }
  };

  setFormFieldValue = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    this.formRef.current.setFieldsValue({
      name: affiliate.name,
      addressOne: affiliate.street1,
      suburb: affiliate.suburb,
      stateRefId: affiliate.stateRefId,
      postcode: affiliate.postalCode,
      email: affiliate.email,
      phoneNo: affiliate.phoneNo,
      lat: affiliate.lat,
      lng: affiliate.lng,
    });

    const { contacts } = affiliate;
    if (contacts === null || contacts === undefined || contacts === '') {
      this.addContact();
    }

    if (contacts !== null && contacts !== undefined) {
      this.updateContactFormFields(contacts);
    }
  };

  onChangeSetValue = (val, key) => {
    this.props.updateOrgAffiliateAction(val, key);
  };

  addContact = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const { contacts } = affiliate;
    const obj = {
      userId: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      isSameUser: true,
      permissions: [],
    };
    if (contacts !== undefined && contacts !== null) {
      contacts.push(obj);
      this.props.updateOrgAffiliateAction(contacts, 'contacts');
    }
  };

  deleteContact = index => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const { contacts } = affiliate;
    if (contacts !== null && contacts !== undefined) {
      const contact = contacts[index];
      if (contact.userId > 0) {
        this.setState({ deleteModalVisible: true, currentIndex: index });
      } else {
        contacts.splice(index, 1);
        this.updateContactFormFields(contacts);
        this.props.updateOrgAffiliateAction(contacts, 'contacts');
      }
    }
  };

  removeModalHandle = key => {
    if (key === 'ok') {
      this.removeContact(this.state.currentIndex);
      this.setState({ deleteModalVisible: false });
    } else {
      this.setState({ deleteModalVisible: false });
    }
  };

  removeContact = index => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const { contacts } = affiliate;
    if (contacts !== null && contacts !== undefined) {
      const contact = contacts[index];
      contacts.splice(index, 1);
      this.updateContactFormFields(contacts);
      this.props.updateOrgAffiliateAction(contacts, 'contacts');
      const obj = {
        id: contact.userId,
        organisationId: this.state.organisationId,
      };
      this.props.deleteOrgContact(obj);
    }
  };

  updateContactFormFields = contacts => {
    contacts.forEach((item, index) => {
      this.formRef.current.setFieldsValue({
        [`firstName${index}`]: item.firstName,
        [`lastName${index}`]: item.lastName,
        [`email${index}`]: item.email,
        [`mobileNumber${index}`]: item.mobileNumber,
      });
      item.isSameUser = getUserId() === item.userId;
      if (item.userId === getUserId()) {
        this.setState({ isSameUserEmailId: item.email });
      }
      const { permissions } = item;
      permissions.forEach(perm => {
        this.formRef.current.setFieldsValue({
          [`permissions${index}`]: perm.roleId,
        });
      });
    });
  };

  onChangeContactSetValue = (val, key, index) => {
    const { contacts } = this.props.userState.affiliateOurOrg;
    const contact = contacts[index];
    if (key === 'roles') {
      let userRoleEntityId = 0;
      const userRoleEntity = contact.permissions.find(x => x);
      if (userRoleEntity !== null && userRoleEntity !== undefined && userRoleEntity !== '') {
        userRoleEntityId = userRoleEntity.userRoleEntityId;
      }
      const permissions = [];
      const obj = {
        userRoleEntityId,
        roleId: val,
      };
      permissions.push(obj);
      contact.permissions = permissions;
    } else if (key === 'email') {
      if (contact.isSameUser && contact.userId !== 0) {
        if (val !== this.state.isSameUserEmailId) {
          this.setState({ isSameUserEmailChanged: true });
        } else {
          this.setState({ isSameUserEmailChanged: false });
        }
      }
      contact[key] = val;
    } else {
      contact[key] = val;
    }
    contact.dirty = true;

    this.props.updateOrgAffiliateAction(contacts, 'contacts');
  };

  setImage = data => {
    if (data.files[0] !== undefined) {
      const file = data.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      const imageSizeValid = isImageSizeValid(file.size);
      const isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }
      this.setState({ image: data.files[0] });
      this.props.updateOrgAffiliateAction(URL.createObjectURL(data.files[0]), 'logoUrl');
      this.props.updateOrgAffiliateAction(data.files[0], 'organisationLogo');
      this.props.updateOrgAffiliateAction(0, 'organisationLogoId');
    }
  };

  selectImage() {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  }

  logoIsDefaultOnchange = (value, key) => {
    this.props.updateOrgAffiliateAction(value, key);
  };

  onSelectPhotos = data => {
    const fileInput = document.getElementById('photos-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  };

  setPhotosImage = data => {
    if (data.files[0] !== undefined) {
      const file = data.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      const imageSizeValid = isImageSizeValid(file.size);
      const isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }
      const tableRow = this.state.tableRecord;
      tableRow.photoUrl = null;
      this.setState({
        tableRecord: tableRow,
        orgPhotosImgSend: data.files[0],
        orgPhotosImg: URL.createObjectURL(data.files[0]),
        timeout: 2000,
      });
      setTimeout(() => {
        this.setState({ timeout: null });
      }, 1000);
    }
  };

  tabCallBack = key => {
    this.setState({ organisationTabKey: key });
    if (key === TabKey.Photos) {
      const obj = { organisationId: this.state.organisationId };
      this.setState({ isEditView: false });
      this.props.getOrganisationPhotoAction(obj);
    }
  };

  editPhotos = async record => {
    await this.setState({ tableRecord: record, isEditView: true });

    this.formRef.current.setFieldsValue({
      photoTypeRefId: record.photoTypeRefId,
    });
  };

  removePhoto = () => {
    const obj = this.state.tableRecord;
    obj.photoUrl = null;
    this.setState({ orgPhotosImg: null, orgPhotosImgSend: null, tableRecord: obj });
  };

  deletePhotos = async record => {
    await this.setState({ tableRecord: record, orgPhotoModalVisible: true });
  };

  addPhoto = () => {
    try {
      const obj = {
        id: 0,
        photoTypeRefId: null,
        photoUrl: null,
      };
      this.setState({
        isEditView: true,
        tableRecord: obj,
        orgPhotosImg: null,
        orgPhotosImgSend: null,
      });
      this.formRef.current.setFieldsValue({
        photoTypeRefId: null,
      });
    } catch (ex) {
      console.log(`Error in addPhoto::${ex}`);
    }
  };

  cancelEditView = () => {
    const obj = {
      id: 0,
      photoTypeRefId: null,
      photoUrl: null,
    };

    this.setState({
      isEditView: false,
      tableRecord: obj,
      orgPhotosImg: null,
      orgPhotosImgSend: null,
    });
  };

  setOrgPhotoValue = e => {
    const obj = this.state.tableRecord;
    obj.photoTypeRefId = e;
    this.setState({ tableRecord: obj });
  };

  deleteOrgPhotoModalHandle = key => {
    if (key === 'ok') {
      const payload = {
        id: this.state.tableRecord.id,
      };
      this.setState({ photoDeleteLoading: true, buttonPressed: 'deletePhotos' });
      this.props.deleteOrganisationPhotoAction(payload);
    }

    this.setState({ orgPhotoModalVisible: false });
  };

  handleForce = data => {
    this.setState({ termsAndCondititionFile: data.target.files[0] });
  };

  handleForceState = data => {
    this.setState({ stateTermsAndCondititionFile: data.target.files[0] });
  };

  onChangesetCharity = (value, index, key) => {
    this.props.updateCharityValue(value, index, key);
  };

  saveAffiliate = async values => {
    const tabKey = this.state.organisationTabKey;
    let { borrowableMembershipMappingIds, allowEndUserRegistrationChange, allowPlayerReplication } =
      this.state;
    if (this.state.affiliateAddressError) {
      message.error(this.state.affiliateAddressError);
      return;
    }

    if (tabKey === TabKey.General) {
      const affiliate = this.props.userState.affiliateOurOrg;

      if (
        affiliate.contacts === null ||
        affiliate.contacts === undefined ||
        affiliate.contacts.length === 0
      ) {
        message.error(ValidationConstants.affiliateContactRequired[0]);
      } else {
        const data = affiliate.contacts.find(x => x.permissions.find(y => y.roleId === 2));
        if (data === undefined || data === null || data === '') {
          message.error(ValidationConstants.affiliateContactRequired[0]);
        } else {
          let changedList = affiliate.contacts.filter(c => c.dirty);
          const contacts = JSON.stringify(changedList);

          const formData = new FormData();

          if (this.state.image != null) {
            affiliate.organisationLogo = this.state.image;
            affiliate.organisationLogoId = 0;
          }
          // let termsAndConditionsValue = null;
          // if(affiliate.termsAndConditionsRefId == 1){
          //     termsAndConditionsValue = affiliate.termsAndConditionsLink;
          // }
          // if(this.state.termsAndCondititionFile == null && affiliate.termsAndConditionsRefId == 2){
          //     termsAndConditionsValue = affiliate.termsAndConditionsFile;
          // }

          formData.append('email', affiliate.email ? affiliate.email : '');
          formData.append('organisationLogo', this.state.image);
          formData.append('organisationLogoId', affiliate.organisationLogoId);
          formData.append('affiliateId', affiliate.affiliateId);
          formData.append('affiliateOrgId', affiliate.affiliateOrgId);
          formData.append('organisationTypeRefId', affiliate.organisationTypeRefId);
          formData.append('affiliatedToOrgId', affiliate.affiliatedToOrgId);
          formData.append(
            'organisationId',
            getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
          );
          formData.append('name', affiliate.name);
          formData.append('street1', affiliate.street1);
          formData.append('street2', affiliate.street2);
          formData.append('suburb', affiliate.suburb);
          formData.append('phoneNo', affiliate.phoneNo);
          formData.append('city', affiliate.city);
          formData.append('postalCode', affiliate.postalCode);
          formData.append('stateRefId', affiliate.stateRefId);
          formData.append('lat', affiliate.lat);
          formData.append('lng', affiliate.lng);
          formData.append(
            'whatIsTheLowestOrgThatCanAddChild',
            this.state.whatIsTheLowestOrgThatCanAddChild,
          );
          formData.append(
            'whatIsTheLowestOrgThatCanAddVenue',
            this.state.whatIsTheLowestOrgThatCanAddVenue,
          );
          formData.append('isRestrictedToLinkedVenues', this.state.isRestrictedToLinkedVenues);
          formData.append('stateBorrowRuleRefId', this.state.stateBorrowRuleRefId);
          formData.append('defaultUmpireAvailability', this.state.defaultUmpireAvailability);
          formData.append(
            'borrowableMembershipMappingIds',
            this.state.stateBorrowRuleRefId === StateBorrowRuleRef.StateDecides
              ? JSON.stringify(borrowableMembershipMappingIds)
              : '[]',
          );
          formData.append('allowEndUserRegistrationChange', allowEndUserRegistrationChange);
          formData.append('logoIsDefault', affiliate.logoIsDefault ? 1 : 0);
          formData.append('contacts', contacts);
          formData.append('allowPlayerReplication', allowPlayerReplication);
          formData.append('percentageTxnFeeOrganisation', this.state.percentageTxnFeeOrganisation);
          formData.append(
            'concurrentMembershipProductCategoryRefIds',
            affiliate.concurrentMembershipProductCategoryRefIds
              ? JSON.stringify(affiliate.concurrentMembershipProductCategoryRefIds)
              : '[]',
          );
          formData.append(
            'concurrentNumberOfOrganisations',
            affiliate.concurrentNumberOfOrganisations,
          );
          formData.append(
            'concurrentNumberOfRegistrations',
            affiliate.concurrentNumberOfRegistrations,
          );
          this.setState({ loading: true });
          this.props.saveAffiliateAction(formData);
        }
      }
    } else if (tabKey === TabKey.Photos) {
      const tableRowData = this.state.tableRecord;
      const formData = new FormData();
      if (this.state.orgPhotosImgSend === null && tableRowData.photoUrl === null) {
        message.error(ValidationConstants.organisationPhotoRequired);
        return;
      }
      formData.append('organisationPhoto', this.state.orgPhotosImgSend);
      formData.append('organisationPhotoId', tableRowData.id);
      formData.append('photoTypeRefId', tableRowData.photoTypeRefId);
      formData.append('photoUrl', tableRowData.photoUrl);
      formData.append(
        'organisationId',
        getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      );

      this.setState({ photoLoading: true });
      this.props.saveOrganisationPhotoAction(formData);
    }
  };

  updateTermsAndCondition = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const formData = new FormData();
    let filesArray = [];
    filesArray['termsAndCondition'] = this.state.termsAndCondititionFile;
    filesArray['stateTermsAndCondition'] = this.state.stateTermsAndCondititionFile;
    let termsAndConditionsValue = null;
    let stateTermsAndConditionsValue = null;
    if (affiliate.termsAndConditionsRefId === 1) {
      termsAndConditionsValue = affiliate.termsAndConditionsLink;
    }
    if (this.state.termsAndCondititionFile == null && affiliate.termsAndConditionsRefId === 2) {
      termsAndConditionsValue = affiliate.termsAndConditionsFile;
    }
    if (affiliate.stateTermsAndConditionsRefId === 1) {
      stateTermsAndConditionsValue = affiliate.stateTermsAndConditionsLink;
    }
    if (
      this.state.termsAndCondititionFile == null &&
      affiliate.stateTermsAndConditionsRefId === 2
    ) {
      stateTermsAndConditionsValue = affiliate.stateTermsAndConditionsFile;
    }
    let pdfStatus = 0;
    if (filesArray['termsAndCondition']) pdfStatus = 1;
    if (filesArray['stateTermsAndCondition']) pdfStatus = 2;
    if (filesArray['termsAndCondition'] && filesArray['stateTermsAndCondition']) pdfStatus = 3;

    formData.append(
      'organisationId',
      getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
    );
    formData.append('termsAndConditionsRefId', affiliate.termsAndConditionsRefId);
    formData.append('termsAndConditions', termsAndConditionsValue || '');
    formData.append('stateTermsAndConditionsRefId', affiliate.stateTermsAndConditionsRefId);
    formData.append('stateTermsAndConditions', stateTermsAndConditionsValue || '');
    formData.append('termsAndCondition[]', filesArray['termsAndCondition']);
    formData.append('termsAndCondition[]', filesArray['stateTermsAndCondition']);
    formData.append('pdfStatus', pdfStatus);

    this.setState({ loading: true });
    this.props.updateTermsAndConditionAction(formData);
    this.setState({ termsAndCondititionFile: null, stateTermsAndCondititionFile: null });
  };

  updateCharity = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const charityRoundUpArr = affiliate.charityRoundUp.filter(x => x.isSelected);

    const payload = {
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      charityRoundUp: charityRoundUpArr,
      charity: affiliate.charity,
    };
    this.setState({ loading: true });
    this.props.updateCharityAction(payload);
  };

  updateAffiliateFinder = async () => {
    if (!getOrganisationData().organisationUniqueKey) {
      return;
    }
    let affiliateFinderBody = null;
    if (this.affiliateFinder) {
      let affilidateForm = await this.affiliateFinder.getAffiliateFinderForm();
      if (!affilidateForm.success) {
        return;
      }
      affiliateFinderBody = affilidateForm.values;
    }
    const formData = new FormData();
    formData.append('organisationId', getOrganisationData().organisationUniqueKey);
    affiliateFinderBody != null &&
      formData.append('affiliateFinder', JSON.stringify(affiliateFinderBody));

    this.setState({ loading: true });
    this.props.saveAffiliateFinderAction({
      organisationId: getOrganisationData().organisationUniqueKey,
      affiliateFinder: affiliateFinderBody,
    });
  };

  updateRegistrationSettings = () => {
    const { regSettingLinks } = this.props.userState;
    let formBody = null;
    if (this.regSettingRef) {
      let formResult = this.regSettingRef.getFormValues();
      formBody = formResult.values;
    }

    this.setState({ loading: true });
    this.props.saveRegistrationSettingAction({
      organisationId: getOrganisationData().organisationId,
      stateRegistrationSettings: formBody,
      regSettingLinks,
    });
  };

  updateIntegrationSettings = async () => {
    if (this.integrationRef) {
      this.integrationRef.submit();
    }
  };

  headerView = () => (
    <div className="header-view">
      <Header className="form-header-view d-flex align-items-center bg-transparent">
        {this.state.sourcePage === 'AFF' ? (
          <Breadcrumb separator=" > ">
            <NavLink to="/userAffiliatesList">
              <Breadcrumb.Item separator=" > " className="breadcrumb-product">
                {AppConstants.affiliates}
              </Breadcrumb.Item>
            </NavLink>
            {/* <Breadcrumb.Item className="breadcrumb-product">{AppConstants.user}</Breadcrumb.Item> */}
            <Breadcrumb.Item className="breadcrumb-add">
              {AppConstants.ourOrganisation}
            </Breadcrumb.Item>
          </Breadcrumb>
        ) : (
          <NavLink to="/affiliatedirectory">
            <span className="breadcrumb-product">{AppConstants.affiliates}</span>
          </NavLink>
        )}
      </Header>
    </div>
  );

  handlePlacesAutocomplete = data => {
    const { stateList } = this.props.commonReducerState;
    const address = data;

    if (!address || !address.addressOne || !address.suburb) {
      this.setState({
        affiliateAddressError: ValidationConstants.affiliateAddressDetailError,
      });
    } else {
      this.setState({
        affiliateAddressError: '',
      });
    }

    this.setState({
      affiliateAddress: address,
    });

    const stateRefId =
      stateList.length > 0 && address.state
        ? stateList.find(state => state.name === address.state).id
        : null;

    this.formRef.current.setFieldsValue({
      stateRefId,
      addressOne: address.addressOne || null,
      suburb: address.suburb || null,
      postcode: address.postcode || null,
      lat: address.lat,
      lng: address.lng,
    });

    if (address.addressOne) {
      this.props.updateOrgAffiliateAction(stateRefId, 'stateRefId');
      this.props.updateOrgAffiliateAction(address.addressOne, 'street1');
      this.props.updateOrgAffiliateAction(address.suburb, 'suburb');
      this.props.updateOrgAffiliateAction(address.postcode, 'postalCode');
      this.props.updateOrgAffiliateAction(address.lat, 'lat');
      this.props.updateOrgAffiliateAction(address.lng, 'lng');
    }
  };

  onborrowSelectChange = (borrowableMembershipMappingIds, selectedRows) => {
    this.setState({ borrowableMembershipMappingIds });
  };

  onAllowUserRegChangeUpdate = e => {
    this.setState({ allowEndUserRegistrationChange: e.target.checked });
  };

  onAllowPlayerReplicationUpdate = e => {
    this.setState({ allowPlayerReplication: e.target.checked });
  };
  onApplyConcurrencyRuleChange = (e, affiliate) => {
    affiliate.concurrentMembershipProductCategoryRefIds = [];
    this.setState({ isConcurrencyRuleChecked: e.target.checked });
  };
  onAllowedMembershipCategoryTypeChange = (e, affiliate) => {
    affiliate.concurrentMembershipProductCategoryRefIds = e;
    this.setState({ updateUI: true });
  };
  onNoOfOrganisationChange = (e, affiliate) => {
    affiliate.concurrentNumberOfOrganisations = e;
    this.setState({ updateUI: true });
  };
  onNoOfRegistrationChange = (e, affiliate) => {
    affiliate.concurrentNumberOfRegistrations = e;
    this.setState({ updateUI: true });
  };

  contentView = () => {
    const affiliateToData = this.props.userState.affiliateTo;
    const affiliate = this.props.userState.affiliateOurOrg;
    const { stateList } = this.props.commonReducerState;
    const {
      borrowableMembershipMappingIds,
      allowEndUserRegistrationChange,
      allowPlayerReplication,
    } = this.state;
    const rowSelection = {
      selectedRowKeys: borrowableMembershipMappingIds,
      onChange: this.onborrowSelectChange,
      hideSelectAll: true,
    };
    if (affiliate.organisationTypeRefId === 0) {
      if (
        affiliateToData.organisationTypes !== undefined &&
        affiliateToData.organisationTypes.length > 0
      )
        affiliate.organisationTypeRefId = affiliateToData.organisationTypes[0].id;
    }

    const state =
      stateList.length > 0 && affiliate.stateRefId
        ? stateList.find(state => state.id === affiliate.stateRefId).name
        : null;

    const defaultAffiliateAddress = `${affiliate.street1 ? `${affiliate.street1},` : ''} ${
      affiliate.suburb ? `${affiliate.suburb},` : ''
    } ${state ? `${state},` : ''} Australia`;

    const isValidate = !affiliate.suburb;

    let showCurrencyRule =
      affiliate.organisationTypeRefId === 1 && isMembershipConcurrencyRuleEnabled;
    return (
      <div className="content-view pt-4">
        <Form.Item
          name="name"
          rules={[{ required: true, message: ValidationConstants.nameField[2] }]}
        >
          <InputWithHead
            auto_complete="off"
            required="required-field pt-0"
            heading={AppConstants.organisationName}
            placeholder={AppConstants.organisationName}
            onChange={e => this.onChangeSetValue(e.target.value, 'name')}
            disabled={!this.state.isEditable}
            value={affiliate.name}
          />
        </Form.Item>
        <InputWithHead required="required-field" heading={AppConstants.organisationLogo} />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div
                className="reg-competition-logo-view"
                onClick={this.state.isEditable ? () => this.selectImage() : null}
              >
                <label>
                  {/* <input
                                        src={affiliate.logoUrl == null ? AppImages.circleImage : affiliate.logoUrl}
                                        // alt=""
                                        height="120"
                                        width="120"
                                        type="image"
                                        disabled={!this.state.isEditable}
                                        style={{ borderRadius: 60, height: 120, widows: 120 }}
                                        name="image"
                                        onError={ev => {
                                            ev.target.src = AppImages.circleImage;
                                        }}
                                    /> */}
                  <img
                    src={affiliate.logoUrl == null ? AppImages.circleImage : affiliate.logoUrl}
                    height="120"
                    width="120"
                    style={{
                      borderRadius: 60,
                    }}
                    alt=""
                  />
                </label>
              </div>
              <input
                type="file"
                id="user-pic"
                className="d-none"
                onChange={evt => this.setImage(evt.target)}
                onClick={event => {
                  event.target.value = null;
                }}
              />
            </div>
            <div className="col-sm d-flex justify-content-center align-items-start flex-column">
              <Checkbox
                className="single-checkbox"
                // defaultChecked={false}
                checked={affiliate.logoIsDefault}
                disabled={!this.state.isEditable}
                onChange={e => this.logoIsDefaultOnchange(e.target.checked, 'logoIsDefault')}
              >
                {AppConstants.saveAsDefault}
              </Checkbox>

              {/* {this.state.isSetDefault && <Checkbox
                                className="single-checkbox ml-0"
                                checked={this.state.logoSetDefault}
                                onChange={e =>
                                    this.logoSaveAsDefaultOnchange(e.target.checked, "logoIsDefault")
                                }
                            >
                                {AppConstants.saveAsDefault}
                            </Checkbox>} */}
            </div>
          </div>
          <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
        </div>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.organisationType} />
          </div>
          <div className="col-sm d-flex align-items-center">
            <InputWithHead heading={affiliate.organisationTypeRefName} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.affiliatedTo} />
          </div>
          <div className="col-sm d-flex align-items-center">
            <InputWithHead heading={affiliate.affiliatedToOrgName} />
          </div>
        </div>

        <Form.Item
          className="formLineHeight"
          name="affiliateAddress"
          rules={[
            {
              required: isValidate,
              message: AppConstants.addressSearch,
            },
          ]}
        >
          <PlacesAutocomplete
            defaultValue={defaultAffiliateAddress}
            heading={AppConstants.affiliateAddressAddressSelect}
            required
            disabled={!this.state.isEditable}
            error={this.state.affiliateAddressError}
            onSetData={this.handlePlacesAutocomplete}
          />
        </Form.Item>

        <div className="row">
          <div className="col-sm">
            <Form.Item name="lat" noStyle>
              <Input hidden />
            </Form.Item>
          </div>
          <div className="col-sm ">
            <Form.Item name="lng" noStyle>
              <Input hidden />
            </Form.Item>
          </div>
        </div>
        <Form.Item
          name="phoneNo"
          rules={[{ required: true, message: ValidationConstants.phoneNumberRequired }]}
        >
          <InputWithHead
            auto_complete="new-phone"
            required="required-field"
            maxLength={10}
            heading={AppConstants.phoneNumber}
            placeholder={AppConstants.phoneNumber}
            onChange={e => this.onChangeSetValue(e.target.value, 'phoneNo')}
            value={affiliate.phoneNo}
            disabled={!this.state.isEditable}
          />
        </Form.Item>

        <Form.Item
          name="email"
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
            heading={AppConstants.email}
            required="required-field"
            placeholder={AppConstants.email}
            onChange={e => this.onChangeSetValue(e.target.value, 'email')}
            value={affiliate.email}
            disabled={!this.state.isEditable}
            auto_complete="new-email"
          />
        </Form.Item>
        {affiliate.organisationTypeRefId === 2 && (
          <Form.Item>
            <InputWithHead heading={AppConstants.whoCanAddOrganisation} />
            <Radio.Group
              onChange={this.onChangeSetWhoCanAddAffiliate}
              value={this.state.whatIsTheLowestOrgThatCanAddChild}
            >
              <Space direction="vertical">
                <Radio data-testid={AppUniqueId.ADD_ORGANIZATION_EACH_LEVEL_HIERARCHY} value={3}>
                  {AppConstants.eachLevelOfHierarchy}
                </Radio>
                <Radio data-testid={AppUniqueId.ADD_ORGANIZATION_OUR_ORGANIZATION} value={2}>
                  {AppConstants.ourOrganisationOnly}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
        {affiliate.organisationTypeRefId === 2 && (
          <Form.Item>
            <InputWithHead heading={AppConstants.whoCanAddVenue} />
            <Radio.Group
              onChange={this.onChangeSetWhoCanAddVenue}
              value={this.state.whatIsTheLowestOrgThatCanAddVenue}
            >
              <Space direction="vertical">
                <Radio data-testid={AppUniqueId.ADD_VENU_EACH_LEVEL_HIERARCHY} value={4}>
                  {AppConstants.eachLevelOfHierarchy}
                </Radio>
                <Radio data-testid={AppUniqueId.ADD_VENU_OUR_ORGANIZATION} value={2}>
                  {AppConstants.ourOrganisationOnly}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
        {affiliate.organisationTypeRefId === 2 && (
          <Form.Item>
            <InputWithHead heading={AppConstants.whoCanSeeVenue} />
            <Radio.Group
              onChange={this.onChangeRestrictedToLinkedVenues}
              value={this.state.isRestrictedToLinkedVenues}
            >
              <Space direction="vertical">
                <Radio data-testid={AppUniqueId.SEE_VENU_ALL_ORGANIZATION} value={0}>
                  {AppConstants.allOrganisation}
                </Radio>
                <Radio data-testid={AppUniqueId.SEE_VENU_ONLY_LINKED_ORGANIZATION} value={1}>
                  {AppConstants.onlyLinkedOrganisation}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
        {affiliate.organisationTypeRefId === 2 && (
          <>
            <InputWithHead heading={AppConstants.playerReplicationRules} />
            <Form.Item>
              <Checkbox
                className="font-weight-normal"
                checked={allowPlayerReplication}
                onChange={this.onAllowPlayerReplicationUpdate}
                data-testid={AppUniqueId.PLAYER_REPLICATE}
              >
                {AppConstants.allowPlayerReplicationState}
              </Checkbox>
            </Form.Item>
          </>
        )}
        {affiliate.organisationTypeRefId === 2 && (
          <Form.Item>
            <InputWithHead heading={AppConstants.playerBorrowingRules} />
            <Radio.Group
              onChange={this.onChangePlayerBorrowingRule}
              value={this.state.stateBorrowRuleRefId}
            >
              <Space direction="vertical">
                <Radio
                  data-testid={AppUniqueId.PLAYER_BORROW_BY_COMPETITION_ORGANIZER}
                  value={StateBorrowRuleRef.CompOrganiserDecides}
                >
                  {AppConstants.compOrganiserDecidesMsg}
                </Radio>
                <Radio
                  data-testid={AppUniqueId.PLAYER_BORROW_STATE_WIDE}
                  value={StateBorrowRuleRef.StateDecides}
                >
                  {AppConstants.stateDecidesMsg}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
        {affiliate.organisationTypeRefId === 2 &&
          this.state.stateBorrowRuleRefId === StateBorrowRuleRef.StateDecides && (
            <Form.Item>
              <Table
                className="org-borrow-mem-table"
                rowSelection={rowSelection}
                columns={this.getMembershipColumnComplex(this.state.membershipProducts)}
                dataSource={this.state.membershipProducts}
                rowKey="membershipProductTypeMappingId"
                loading={this.state.newMembershipOnLoad}
                //pagination={false}
                //showHeader={false}
                size="small"
              />
            </Form.Item>
          )}
        {affiliate.organisationTypeRefId === 2 && (
          <Form.Item>
            <InputWithHead heading={AppConstants.defaultUmpireAvailability} />
            <Radio.Group
              onChange={e => this.setState({ defaultUmpireAvailability: e.target.value })}
              value={this.state.defaultUmpireAvailability}
            >
              <Space direction="vertical">
                <Radio value={1}>{AppConstants.available}</Radio>
                <Radio value={0}>{AppConstants.unavailable}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
        {affiliate.organisationTypeRefId === 2 && (
          <>
            <InputWithHead heading={AppConstants.endUserSettings} />
            <Form.Item>
              <Checkbox
                className="font-weight-normal"
                data-testid={AppUniqueId.SUBMIT_REGISTRATION_CHANGE_REQUEST}
                checked={allowEndUserRegistrationChange}
                onChange={this.onAllowUserRegChangeUpdate}
              >
                {AppConstants.allowRegistrationChange}
              </Checkbox>
            </Form.Item>
          </>
        )}

        <Form.Item>
          <InputWithHead heading={AppConstants.whoPayTransactionFee} />
          <Radio.Group
            onChange={this.onChangeWhoPayTransactionFee}
            value={this.state.percentageTxnFeeOrganisation}
          >
            <Space direction="vertical">
              <Radio data-testid={AppUniqueId.TRANSACTION_FEES_REGISTERING_PARTICIPANT} value={0}>
                {AppConstants.registeringParticipant}
              </Radio>
              <Radio data-testid={AppUniqueId.TRANSACTION_FEES_OUR_ORGANIZATION} value={1}>
                {AppConstants.ourOrganisation}
                <CustomToolTip>
                  <span>{this.state.transactionFeeMsg}</span>
                </CustomToolTip>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {showCurrencyRule && (
          <>
            <Form.Item>
              <InputWithHead heading={AppConstants.concurrencyRules} />
              <Checkbox
                className="single-checkbox mt-3"
                checked={this.state.isConcurrencyRuleChecked}
                onChange={e => this.onApplyConcurrencyRuleChange(e, affiliate)}
              >
                {AppConstants.applyConcurrencyRule}
              </Checkbox>
            </Form.Item>
            {this.state.isConcurrencyRuleChecked && (
              <Form.Item>
                <div className="row mt-3">
                  <div
                    className="col-md-5 d-flex align-items-center"
                    style={{ paddingLeft: '47px' }}
                  >
                    {AppConstants.applyConcurrencyMembershipProductCategory}
                  </div>
                  <div className="col-md-7">
                    <Select
                      // style={{ width: '100%', paddingRight: 1 }}
                      onChange={e => this.onAllowedMembershipCategoryTypeChange(e, affiliate)}
                      value={
                        affiliate.concurrentMembershipProductCategoryRefIds
                          ? affiliate.concurrentMembershipProductCategoryRefIds
                          : []
                      }
                      mode="multiple"
                    >
                      {this.props.appState.membershipProductCategory.map(item => (
                        <Option key={item.id} value={parseInt(item.id)}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Form.Item>
            )}
            <Form.Item>
              <div className="row mt-3">
                <div className="col-md-6 d-flex align-items-center">
                  {AppConstants.numberOfOrganisationsWithinSeason}
                </div>
                <div className="col-md-2">
                  <InputNumber
                    className="text-center"
                    min={1}
                    onChange={e => this.onNoOfOrganisationChange(e, affiliate)}
                    value={affiliate.concurrentNumberOfOrganisations}
                  />
                </div>
              </div>
            </Form.Item>
            <Form.Item>
              <div className="row mt-3">
                <div className="col-md-6 d-flex align-items-center">
                  {AppConstants.numberOfRegistrationsWithinSeason}
                </div>
                <div className="col-md-2">
                  <InputNumber
                    className="text-center"
                    min={1}
                    onChange={e => this.onNoOfRegistrationChange(e, affiliate)}
                    value={affiliate.concurrentNumberOfRegistrations}
                  />
                </div>
              </div>
            </Form.Item>
          </>
        )}
      </div>
    );
  };

  contacts = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const roles = this.props.userState.roles.filter(x => x.applicableToWeb === 1);
    return (
      <div className="discount-view pt-5">
        <span className="form-heading">{AppConstants.contacts}</span>
        {(affiliate.contacts || []).map((item, index) => (
          <div className="prod-reg-inside-container-view pt-4" key={`Contact${index + 1}`}>
            <div className="row">
              <div className="col-sm">
                <span className="user-contact-heading">{AppConstants.contact + (index + 1)}</span>
              </div>
              {!this.state.isEditable || affiliate.contacts.length === 1 ? null : (
                <div
                  className="transfer-image-view pointer"
                  onClick={() => this.deleteContact(index)}
                >
                  <span className="user-remove-btn">
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </span>
                  <span className="user-remove-text">{AppConstants.remove}</span>
                </div>
              )}
            </div>

            <Form.Item
              name={`firstName${index}`}
              rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
            >
              <InputWithHead
                auto_complete="new-firstName"
                required="required-field"
                heading={AppConstants.firstName}
                placeholder={AppConstants.firstName}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'firstName', index)}
                // value={item.firstName}
                value={item.firstName}
                disabled={!this.state.isEditable}
              />
            </Form.Item>

            <InputWithHead
              heading={AppConstants.middleName}
              placeholder={AppConstants.middleName}
              onChange={e => this.onChangeContactSetValue(e.target.value, 'middleName', index)}
              value={item.middleName}
              disabled={!this.state.isEditable}
              auto_complete="new-middleName"
              // required="pt-0"
            />

            <Form.Item
              name={`lastName${index}`}
              rules={[{ required: true, message: ValidationConstants.nameField[1] }]}
            >
              <InputWithHead
                required="required-field "
                heading={AppConstants.lastName}
                placeholder={AppConstants.lastName}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'lastName', index)}
                value={item.lastName}
                disabled={!this.state.isEditable}
                auto_complete="new-lastName"
              />
            </Form.Item>

            <Form.Item
              name={`email${index}`}
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
                required="required-field"
                heading={AppConstants.email}
                placeholder={AppConstants.email}
                disabled={!item.isSameUser || !this.state.isEditable}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'email', index)}
                // value={item.email}
                value={item.email}
              />
            </Form.Item>
            {item.isSameUser && this.state.isSameUserEmailChanged && (
              <div className="same-user-validation">{ValidationConstants.emailField[2]}</div>
            )}

            <Form.Item
              name={`mobileNumber${index}`}
              rules={[{ required: true, message: ValidationConstants.phoneNumberRequired }]}
            >
              <InputWithHead
                required="required-field"
                heading={AppConstants.phoneNumber}
                placeholder={AppConstants.phoneNumber}
                onChange={e => this.onChangeContactSetValue(e.target.value, 'mobileNumber', index)}
                /*  value={item.mobileNumber} */
                maxLength={10}
                disabled={!this.state.isEditable}
                auto_complete="new-phoneNumber"
              />
            </Form.Item>

            {this.state.isEditable && (
              <div>
                <InputWithHead
                  heading={AppConstants.permissionLevel}
                  conceptulHelp
                  conceptulHelpMsg={AppConstants.ourOrgPermissionLevelMsg}
                  marginTop={5}
                />
                <Form.Item
                  name={`permissions${index}`}
                  rules={[{ required: true, message: ValidationConstants.rolesField[0] }]}
                >
                  <Select
                    style={{ width: '100%', paddingRight: 1 }}
                    onChange={e => this.onChangeContactSetValue(e, 'roles', index)}
                    value={item.roleId}
                  >
                    {(roles || []).map(role => (
                      <Option key={`role_${role.id}`} value={role.id}>
                        {role.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            )}
          </div>
        ))}
        {this.deleteConfirmModalView()}
        {this.state.isEditable && (
          <div className="transfer-image-view mt-2 pointer" onClick={() => this.addContact()}>
            <span className="user-remove-text">+ {AppConstants.addContact}</span>
          </div>
        )}
        {/* {(userState.error && userState.status == 4) && (
                    <div style={{ color: 'red' }}>{userState.error.result.data.message}</div>
                )} */}
      </div>
    );
  };

  affiliateFinderView = () => {
    const { onloadOrgDetail, affiliateFinder, affiliateOurOrg } = this.props.userState;
    let org = getOrganisationData();
    let appState = this.props.appState;
    let venueList = appState.venueList || [];
    const contacts = affiliateOurOrg.contacts || [];
    const { weekDays = [], genderData = [] } = this.props.commonReducerState;
    let isState = org && org.organisationTypeRefId === 2;
    return (
      <AffiliateFinder
        contacts={contacts}
        affiliateFinder={affiliateFinder}
        weekDays={weekDays}
        genderData={genderData}
        onFinderRef={this.onFinderRef}
        venueList={venueList}
        onloadOrgDetail={onloadOrgDetail}
        isState={isState}
      />
    );
  };

  onFinderRef = finder => {
    this.affiliateFinder = finder;
  };

  registrationSettingView = () => {
    let { stateRegistrationSettings, onloadRegSettings, membershipTypeMappings } =
      this.props.registrationState;
    let { onGenericLoad, RegistrationSettings = [] } = this.props.commonReducerState;
    if (!isArrayNotEmpty(RegistrationSettings)) {
      RegistrationSettings = [];
    }

    if (!isArrayNotEmpty(stateRegistrationSettings)) {
      stateRegistrationSettings = [];
    }

    if (!isArrayNotEmpty(membershipTypeMappings)) {
      membershipTypeMappings = [];
    }

    return (
      <RegistrationSetting
        questions={RegistrationSettings || []}
        registrationSettings={stateRegistrationSettings || []}
        onRegSettingRef={this.onRegSettingRef}
        onGenericLoad={onGenericLoad}
        onloadRegSettings={onloadRegSettings}
        membershipTypeMappings={membershipTypeMappings || []}
      />
    );
  };

  onRegSettingRef = setting => {
    this.regSettingRef = setting;
  };

  onIntegrationRef = setting => {
    this.integrationRef = setting;
  };

  integrationRef = null;
  toggleButton = visible => {
    this.setState({ showButton: visible });
  };
  integrationSettingView = () => {
    return <Integration onRef={this.onIntegrationRef} toggleButton={this.toggleButton} />;
  };

  termsAndConditionsView = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    return (
      <>
        <div className="discount-view pt-5">
          <span className="form-heading">{AppConstants.termsAndConditions}</span>
          <Radio.Group
            className="reg-competition-radio"
            onChange={e => this.onChangeSetValue(e.target.value, 'termsAndConditionsRefId')}
            value={affiliate.termsAndConditionsRefId}
          >
            <Radio value={2}>{AppConstants.fileUploadPdf}</Radio>
            {affiliate.termsAndConditionsRefId === 2 && (
              <div className="pl-5 pb-5 pt-4">
                <label className="pt-2">
                  <input
                    className="pt-2 pb-2 pointer"
                    type="file"
                    id="teamImport"
                    ref={input => {
                      this.filesInput = input;
                    }}
                    name="file"
                    // icon="file text outline"
                    // iconPosition="left"
                    // label="Upload PDF"
                    // labelPosition="right"
                    placeholder="UploadPDF..."
                    onChange={this.handleForce}
                    accept=".pdf"
                  />
                  <div className="pt-4">
                    <div className="row">
                      <div className="col-sm" style={{ whiteSpace: 'break-spaces' }}>
                        <a
                          className="user-reg-link"
                          href={affiliate.termsAndConditions}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {affiliate.termsAndConditionsFile}
                        </a>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            )}
            <Radio value={1}>{AppConstants.link}</Radio>
            {affiliate.termsAndConditionsRefId === 1 && (
              <div className=" pl-5 pb-5">
                <InputWithHead
                  auto_complete="new-termsAndConditions"
                  placeholder={AppConstants.termsAndConditions}
                  value={affiliate.termsAndConditionsLink}
                  onChange={e => this.onChangeSetValue(e.target.value, 'termsAndConditionsLink')}
                />
              </div>
            )}
          </Radio.Group>
        </div>

        {((getOrganisationData() &&
          getOrganisationData().organisationTypeRefId === 2 &&
          this.state.sourcePage !== 'DIR') ||
          (this.state.organisationTypeRefId === 2 && this.state.sourcePage === 'DIR')) && (
          <div className="discount-view pt-5">
            <span className="form-heading">{AppConstants.stateTermsAndConditions}</span>
            <Radio.Group
              className="reg-competition-radio"
              onChange={e => this.onChangeSetValue(e.target.value, 'stateTermsAndConditionsRefId')}
              value={affiliate.stateTermsAndConditionsRefId}
            >
              <Radio value={2}>{AppConstants.fileUploadPdf}</Radio>
              {affiliate.stateTermsAndConditionsRefId === 2 && (
                <div className="pl-5 pb-5 pt-4">
                  {affiliate.stateTermsAndConditionsFile}
                  <label className="pt-2">
                    <input
                      className="pt-2 pb-2 pointer"
                      type="file"
                      id="teamImport"
                      ref={input => {
                        this.filesInput = input;
                      }}
                      name="file"
                      // icon="file text outline"
                      // iconPosition="left"
                      // label="Upload PDF"
                      // labelPosition="right"
                      placeholder="UploadPDF..."
                      onChange={this.handleForceState}
                      accept=".pdf"
                    />
                    <div className="pt-4">
                      <div className="row">
                        <div className="col-sm" style={{ whiteSpace: 'break-spaces' }}>
                          <a
                            className="user-reg-link"
                            href={affiliate.stateTermsAndConditions}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {affiliate.stateTermsAndConditionsFile}
                          </a>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              )}
              <Radio value={1}>{AppConstants.link}</Radio>
              {affiliate.stateTermsAndConditionsRefId === 1 && (
                <div className=" pl-5 pb-5">
                  <InputWithHead
                    auto_complete="new-termsAndConditions"
                    placeholder={AppConstants.stateTermsAndConditions}
                    value={affiliate.stateTermsAndConditionsLink}
                    onChange={e =>
                      this.onChangeSetValue(e.target.value, 'stateTermsAndConditionsLink')
                    }
                  />
                </div>
              )}
            </Radio.Group>
          </div>
        )}
      </>
    );
  };

  deleteConfirmModalView = () => (
    <div>
      <Modal
        title="Affiliate"
        visible={this.state.deleteModalVisible}
        onOk={() => this.removeModalHandle('ok')}
        onCancel={() => this.removeModalHandle('cancel')}
      >
        <p>Are you sure you want to remove the contact?</p>
      </Modal>
    </div>
  );

  /// /// Photos//////
  photosHeaderView = () => (
    <Header
      className="comp-venue-courts-header-view"
      style={{ paddingLeft: '4%', paddingRight: '4%', paddingTop: '3%' }}
    >
      <div className="row">
        <div className="col-sm d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.photos}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {this.state.isEditable && (
          <div className="col-sm live-form-view-button-container d-flex justify-content-end">
            <Button
              className="primary-add-comp-form"
              type="primary"
              onClick={() => this.addPhoto()}
            >
              {`+ ${AppConstants.addPhoto}`}
            </Button>
          </div>
        )}
      </div>
    </Header>
  );

  photosEditHeaderView = () => {
    const { id } = this.state.tableRecord;
    return (
      <Header
        className="comp-venue-courts-header-view"
        style={{ paddingLeft: '4%', paddingRight: '4%', paddingTop: '3%' }}
      >
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {id !== 0 ? AppConstants.editPhoto : AppConstants.addPhoto}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
    );
  };

  photosListView = () => {
    const { orgPhotosList } = this.props.userState;
    return (
      <div className="content-view">
        <Table
          className="home-dashboard-table"
          // loading={this.props.userState.onLoad && true}
          columns={columns}
          dataSource={orgPhotosList}
          showHeader={false}
          pagination={false}
        />
      </div>
    );
  };

  photosRemoveBtnView = record => (
    <div className="mb-3">
      {/* <div className="col-sm"> */}
      <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
        <Button
          onClick={() => this.editPhotos(record)}
          className="primary-add-comp-form ml-5"
          type="primary"
        >
          {AppConstants.edit}
        </Button>
        <Button
          onClick={() => this.deletePhotos(record)}
          className="primary-add-comp-form ml-5"
          type="primary"
        >
          {AppConstants.remove}
        </Button>
      </div>
    </div>
    // </div>
  );

  photosImageView(photosUrl, record) {
    return (
      <div>
        <div>
          <ImageLoader
            className="banner-image"
            height
            width
            borderRadius
            timeout={this.state.timeout}
            src={photosUrl}
          />
        </div>
        <div className="row">
          <div className="col-sm pt-1">
            <InputWithHead heading={AppConstants.category} />
            <span>{record.photoType}</span>
          </div>
        </div>
      </div>
    );
  }

  photosAddEditView = () => {
    try {
      const photoUrl = this.state.tableRecord != null ? this.state.tableRecord.photoUrl : null;
      const { photoTypeData } = this.props.commonReducerState;
      return (
        <div className="content-view pt-2">
          <ImageLoader
            className="banner-image"
            height
            width
            borderRadius
            timeout={this.state.timeout}
            src={photoUrl || this.state.orgPhotosImg}
          />
          <div>
            <div className="row">
              <div className="col-sm">
                <span className="user-contact-heading required-field">
                  {AppConstants.uploadImage}
                </span>
                <div onClick={this.onSelectPhotos} />
                <input
                  required="pb-0"
                  type="file"
                  id="photos-pic"
                  accept="image/*"
                  onChange={evt => {
                    this.setPhotosImage(evt.target);
                  }}
                  onClick={event => (event.target.value = null)}
                />
                <span className="form-err">{this.state.imageError}</span>
              </div>
              <div className="col-sm pt-1">
                <InputWithHead heading={AppConstants.category} required="required-field" />
                <Form.Item
                  name="photoTypeRefId"
                  rules={[{ required: true, message: ValidationConstants.photoTypeRequired }]}
                >
                  <Select
                    style={{ width: '100%', paddingRight: 1 }}
                    onChange={e => this.setOrgPhotoValue(e)}
                    value={this.state.tableRecord.photoTypeRefId}
                  >
                    {(photoTypeData || []).map(photo => (
                      <Option key={`photoType_${photo.id}`} value={photo.id}>
                        {photo.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
          <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
        </div>
      );
    } catch (ex) {
      console.log(`Error in photosAddEditView::${ex}`);
    }
  };

  photosEditViewRemoveBtnView = () => (
    <div className="comp-player-grades-header-drop-down-view">
      <div className="col-sm">
        <div className="comp-dashboard-botton-view-mobile d-flex align-items-center justify-content-end w-100">
          <Button
            onClick={() => this.removePhoto()}
            className="primary-add-comp-form ml-5"
            type="primary"
          >
            {AppConstants.remove}
          </Button>
        </div>
      </div>
    </div>
  );

  photosEditViewFooterView = isSubmitting => {
    const { tableRecord } = this.state;
    return (
      <div className="fluid-width">
        <div className="footer-view" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <Button type="cancel-button" onClick={() => this.cancelEditView()}>
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button
                  className="user-approval-button"
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                  onClick={() => this.setState({ buttonPressed: 'savePhotos' })}
                >
                  {tableRecord.id === 0 ? AppConstants.add : AppConstants.updateAffiliates}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  orgPhotoDeleteConfirmModalView = () => (
    <div>
      <Modal
        title="Organisation Photos"
        visible={this.state.orgPhotoModalVisible}
        onOk={() => this.deleteOrgPhotoModalHandle('ok')}
        onCancel={() => this.deleteOrgPhotoModalHandle('cancel')}
      >
        <p>Are you sure you want to remove the organisation photo?</p>
      </Modal>
    </div>
  );

  /// ///charity voucher view
  charityVoucherView = () => {
    const affiliate = this.props.userState.affiliateOurOrg;
    const { charityRoundUp } = affiliate;
    const checkCharityArray = affiliate.charity;

    return (
      <div className="advanced-setting-view pt-5">
        {(checkCharityArray || []).map((item, index) => (
          <div key={index}>
            <InputWithHead
              auto_complete="new-title"
              heading={AppConstants.title}
              placeholder={AppConstants.title}
              value={item.name}
              disabled={!this.state.isEditable}
              onChange={e =>
                this.onChangesetCharity(captializedString(e.target.value), index, 'name')
              }
            />
            <InputWithHead heading={AppConstants.description} />
            <TextArea
              placeholder={AppConstants.addCharityDescription}
              value={item.description}
              allowClear
              disabled={!this.state.isEditable}
              onChange={e => this.onChangesetCharity(e.target.value, index, 'description')}
            />
          </div>
        ))}
        <div className="inside-container-view">
          <span className="form-heading">{AppConstants.roundUp}</span>
          {charityRoundUp.map((item, index) => (
            <div className="row ml-0" key={index}>
              <Checkbox
                className="single-checkbox mt-3"
                checked={item.isSelected}
                disabled={!this.state.isEditable}
                onChange={e => this.onChangesetCharity(e.target.checked, index, 'charityRoundUp')}
              >
                {item.description}
              </Checkbox>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /// ///////////End Photos ///////////////////
  /// footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <Button
                type="cancel-button"
                onClick={() => this.setState({ buttonPressed: 'cancel' })}
              >
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          {this.state.isEditable && (
            <div className="col-sm">
              {this.state.organisationTabKey === TabKey.General && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="submit"
                    data-testid="update_Settings"
                    disabled={isSubmitting}
                    onClick={() => this.setState({ buttonPressed: 'save' })}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}
              {this.state.organisationTabKey === TabKey.TermsAndCond && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="button"
                    disabled={isSubmitting}
                    onClick={() => this.updateTermsAndCondition()}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}
              {this.state.organisationTabKey === TabKey.Charity && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="button"
                    disabled={isSubmitting}
                    onClick={() => this.updateCharity()}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}

              {this.state.organisationTabKey === TabKey.AffiliateFinder && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="button"
                    disabled={isSubmitting}
                    onClick={() => this.updateAffiliateFinder()}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}

              {this.state.organisationTabKey === TabKey.RegistrationSetting && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="button"
                    loading={this.state.loading}
                    disabled={isSubmitting}
                    onClick={() => this.updateRegistrationSettings()}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}
              {this.state.organisationTabKey === TabKey.Integrations && (
                <div className="comp-buttons-view">
                  <Button
                    className="user-approval-button"
                    type="primary"
                    htmlType="button"
                    loading={this.state.loading}
                    disabled={isSubmitting}
                    onClick={() => this.updateIntegrationSettings()}
                  >
                    {AppConstants.updateAffiliates}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  render() {
    const { userState, registrationState } = this.props;
    let org = getOrganisationData();
    const { onloadOrgDetail } = this.props.userState;
    const photoUrl = this.state.tableRecord != null ? this.state.tableRecord.photoUrl : null;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <InnerHorizontalMenu menu="user" userSelectedKey="3" />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAffiliate}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              <div className="tab-view">
                <Tabs activeKey={this.state.organisationTabKey} onChange={this.tabCallBack}>
                  <TabPane tab={AppConstants.general} key={TabKey.General}>
                    <div className="tab-formView mt-5">{this.contentView()}</div>
                    <div className="tab-formView mt-5">{this.contacts()}</div>
                  </TabPane>
                  <TabPane tab={AppConstants.photos} key={TabKey.Photos}>
                    <div>{AppConstants.orgPhotosText}</div>
                    <div className="tab-formView mt-5">
                      {!this.state.isEditView ? (
                        <div>
                          {this.photosHeaderView()}
                          {this.photosListView()}
                        </div>
                      ) : (
                        <div>
                          {this.photosEditHeaderView()}
                          {(photoUrl || this.state.orgPhotosImg) &&
                            this.photosEditViewRemoveBtnView()}
                          {this.photosAddEditView()}
                        </div>
                      )}
                    </div>
                    {this.state.isEditView && <div>{this.photosEditViewFooterView()}</div>}
                    {this.orgPhotoDeleteConfirmModalView()}
                  </TabPane>
                  {this.state.isEditable ? (
                    <TabPane tab={AppConstants.termsAndCond} key={TabKey.TermsAndCond}>
                      <div className="tab-formView mt-5">{this.termsAndConditionsView()}</div>
                    </TabPane>
                  ) : null}
                  {((getOrganisationData() &&
                    getOrganisationData().organisationTypeRefId === 2 &&
                    this.state.sourcePage !== 'DIR') ||
                    (this.state.organisationTypeRefId === 2 &&
                      this.state.sourcePage === 'DIR')) && (
                    <TabPane tab={AppConstants.charity} key={TabKey.Charity}>
                      <div className="tab-formView mt-5">{this.charityVoucherView()}</div>
                    </TabPane>
                  )}
                  {!onloadOrgDetail &&
                    process.env.REACT_APP_AFFILIATE_FINDER === 'true' &&
                    getOrganisationData() && (
                      <TabPane tab={AppConstants.affiliateFinder} key={TabKey.AffiliateFinder}>
                        <div className="tab-formView mt-5">{this.affiliateFinderView()}</div>
                      </TabPane>
                    )}
                  {!org || org.organisationTypeRefId !== 2 ? null : (
                    <TabPane
                      tab={AppConstants.registrationQuestions}
                      key={TabKey.RegistrationSetting}
                    >
                      <div className="tab-formView mt-5">{this.registrationSettingView()}</div>
                    </TabPane>
                  )}
                  <TabPane tab={AppConstants.integrations} key={TabKey.Integrations}>
                    <div>{this.integrationSettingView()}</div>
                  </TabPane>
                </Tabs>
              </div>
              <Loader
                visible={
                  registrationState.onloadRegSettings ||
                  userState.onLoad ||
                  userState.onRegSettingLinkLoad ||
                  userState.onLoadAffiliates
                }
              />
            </Content>
            {(this.state.organisationTabKey === TabKey.General ||
              this.state.organisationTabKey === TabKey.TermsAndCond ||
              this.state.organisationTabKey === TabKey.Charity ||
              this.state.organisationTabKey === TabKey.AffiliateFinder ||
              this.state.organisationTabKey === TabKey.RegistrationSetting ||
              (this.state.showButton && this.state.organisationTabKey === TabKey.Integrations)) && (
              <Footer>{this.footerView()}</Footer>
            )}
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getAffiliateToOrganisationAction,
      saveAffiliateAction,
      updateOrgAffiliateAction,
      getAffiliateOurOrganisationIdAction,
      getOrganisationDetailByOrganisationIdAction,
      getCommonRefData,
      getUreAction,
      getRoleAction,
      getPhotoTypeAction,
      getOrganisationPhotoAction,
      getDaysListAction,
      getGenderAction,
      loadRegSettingLinksAction,
      getAffiliatesListingAction,
      saveOrganisationPhotoAction,
      deleteOrganisationPhotoAction,
      deleteOrgContact,
      updateCharityValue,
      updateCharityAction,
      updateTermsAndConditionAction,
      getDefaultCompFeesMembershipProducForMultipleYear,
      getOnlyYearListAction,
      getVenuesTypeAction,
      saveAffiliateFinderAction,
      getGenericCommonReference,
      saveRegistrationSettingAction,
      getStateRegistrationSettingByOrganisationIdAction,
      getMembershipTypeMappingByOrganisationIdAction,
      getNewMembershipProductByYearAction,
      getMembershipProductCategoryTypesAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
    competitionFeesState: state.CompetitionFeesState,
    registrationState: state.RegistrationState,
    competitionDashboardState: state.CompetitionDashboardState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserOurOrganization);

class AffiliateFinder extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organisationParticipantCriterias: [{ dobTo: null, dobFrom: null, genderRefId: null }],
      membershipProducts: [],
    };
    this.initializedForm = false;
  }

  componentDidMount() {
    if (this.props.onFinderRef) {
      this.props.onFinderRef(this);
    }
    this.initialForm();
    let organisation = getOrganisationData();
    if (organisation) {
      UserAxiosApi.organisationMembershipsByOrganisationId(organisation.organisationUniqueKey)
        .then(resp => {
          if (resp.status === 1) {
            let memberships = resp.result.data || [];
            if (!memberships.length) memberships.push('');
            this.setState({ membershipProducts: memberships }, () => {
              let formobj = {};

              memberships.forEach((m, i) => {
                formobj[`membership_${i}`] = m;
              });
              this.affiliateFormRef.current.setFieldsValue(formobj);
            });
          }
          console.log(resp);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  componentDidUpdate() {
    this.initialForm();
  }

  initialForm = () => {
    if (!this.props.onloadOrgDetail && this.props.affiliateFinder && !this.initializedForm) {
      let {
        membershipFormat = [],
        organisationParticipantCriterias = [],
        website,
        ...formValue
      } = this.props.affiliateFinder;
      let participantsCriterias = [];

      formValue.userIds = formValue.userIds || [];
      formValue.venueIds = formValue.venueIds || [];
      if (organisationParticipantCriterias.length) {
        organisationParticipantCriterias.forEach(uc => {
          uc.dobFrom && (uc.dobFrom = moment(uc.dobFrom));
          uc.dobTo && (uc.dobTo = moment(uc.dobTo));
        });
        organisationParticipantCriterias.forEach(am => {
          am.key = randomKeyGen(32);
          participantsCriterias.push({ ...am });
        });
      } else {
        participantsCriterias = [{ dobTo: null, dobFrom: null, genderRefId: null }];
      }
      this.setState({
        organisationParticipantCriterias: participantsCriterias,
        membershipProducts: membershipFormat,
      });

      if (website && website.indexOf('://') > -1) {
        website = website.substr(website.indexOf('://') + 3);
        formValue.website = website;
      }
      formValue.membershipFormat = membershipFormat;

      this.affiliateFormRef.current.setFieldsValue(formValue);
      this.initializedForm = true;
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.affiliateFinder && nextProps.affiliateFinder !== this.props.affiliateFinder) {
      let {
        membershipFormat = [],
        organisationParticipantCriterias = [],
        user,
        website,
        ...formValue
      } = nextProps.affiliateFinder;

      let participantsCriterias = [];
      if (organisationParticipantCriterias.length) {
        organisationParticipantCriterias.forEach(uc => {
          uc.dobFrom && (uc.dobFrom = moment(uc.dobFrom));
          uc.dobTo && (uc.dobTo = moment(uc.dobTo));
        });
        organisationParticipantCriterias.forEach(am => {
          am.key = randomKeyGen(32);
          participantsCriterias.push({ ...am });
        });
        // this.setState({ organisationParticipantCriterias });
      }
      this.setState({
        organisationParticipantCriterias: participantsCriterias,
        membershipProducts: membershipFormat,
      });

      if (website && website.indexOf('://') > -1) {
        website = website.substr(website.indexOf('://') + 3);
        formValue.website = website;
      }
      formValue.membershipFormat = membershipFormat;

      this.affiliateFormRef.current.setFieldsValue(formValue);
    }
  }

  //#region method
  getAffiliateFinderForm = async () => {
    return await this.affiliateFormRef.current
      .validateFields()
      .then(values => {
        let criterias = [];
        const { organisationParticipantCriterias } = this.state;
        organisationParticipantCriterias.forEach(criteria => {
          let hasValue = false;
          let { dobFrom, dobTo, genderRefId, id } = criteria;
          if (dobTo) {
            dobTo = dobTo.format('YYYY-MM-DD');
            hasValue = true;
          }
          if (dobFrom) {
            dobFrom = dobFrom.format('YYYY-MM-DD');
            hasValue = true;
          }
          if (genderRefId) {
            hasValue = true;
          }
          if (hasValue) {
            criterias.push({ dobFrom, dobTo, genderRefId, id });
          }
        });

        if (values.website) values.website = `https://${values.website}`;

        values.organisationParticipantCriterias = criterias;
        if (this.props.isState) {
          let memberships = [];
          this.state.membershipProducts.forEach((m, i) => {
            let membership = this.affiliateFormRef.current.getFieldValue(`membership_${i}`);
            if (membership) memberships.push(membership);
          });
          values.membershipFormat = memberships;
        }
        return { success: true, values };
      })
      .catch(err => {
        let errorFields = err.errorFields || [];
        let error = errorFields.find(err => err.errors.length);
        if (error) {
          this.affiliateFormRef.current.scrollToField(error.name[0]);
          return { success: false };
        }
        //console.log(err);
      });
  };

  //#endregion

  //#region  event

  addParticipantCriterias = () => {
    const { organisationParticipantCriterias } = this.state;
    organisationParticipantCriterias.push({
      dobTo: null,
      dobFrom: null,
      genderRefId: null,
      key: randomKeyGen(32),
    });
    this.setState({ organisationParticipantCriterias: [...organisationParticipantCriterias] });
  };

  addMembershipCriterias = () => {
    const { membershipProducts } = this.state;
    membershipProducts.push('');
    this.setState({ membershipProducts: [...membershipProducts] });
  };

  removeAvaibleMember = item => {
    const { organisationParticipantCriterias } = this.state;
    let index = organisationParticipantCriterias.findIndex(am => am.key === item.key);
    if (index > -1) {
      organisationParticipantCriterias.splice(index, 1);
      this.setState({ organisationParticipantCriterias: [...organisationParticipantCriterias] });
    }
  };

  onParticipantCriteriasChanged = (value, item, fieldName) => {
    const { organisationParticipantCriterias } = this.state;
    let criteria = organisationParticipantCriterias.find(c => c.key === item.key);
    if (criteria) {
      criteria[fieldName] = value;
      this.setState({ organisationParticipantCriterias: [...organisationParticipantCriterias] });
    }
  };

  handleMembershipChange = value => {
    console.log(value);
  };

  removeMembership = item => {
    let membershipProducts = this.state.membershipProducts;
    membershipProducts = membershipProducts.filter(m => m !== item);
    this.setState({ membershipProducts: [...membershipProducts] });
  };

  onMembershipChanged = (e, index) => {
    const { membershipProducts } = this.state;
    membershipProducts[index] = e.target.value;
    this.setState({ membershipProducts: [...membershipProducts] });
  };

  //#endregion

  //#region  render part of view

  ParticipantCriteriasView(item, index) {
    let genderData = this.props.genderData || [];
    genderData = genderData.filter(g => g.id === GENDER.MALE || g.id === GENDER.FEMALE);
    return (
      <div className="fluid-width mt-3" key={item.key}>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.dobFrom} />
            {/* <Form.Item name={`dobFrom_${item.key}`}> */}
            <DatePicker
              className="comp-dashboard-botton-view-mobile w-100"
              size="default"
              placeholder="dd-mm-yyyy"
              disabledDate={currentdate => {
                if (item.dobTo) {
                  return currentdate > item.dobTo;
                }
                return false;
              }}
              onChange={date => this.onParticipantCriteriasChanged(date, item, 'dobFrom')}
              format="DD-MM-YYYY"
              showTime={false}
              value={item.dobFrom}
            />
            {/* </Form.Item> */}
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.dobTo} />
            {/*  <Form.Item name={`dobTo_${item.key}`}> */}
            <DatePicker
              className="comp-dashboard-botton-view-mobile w-100"
              size="default"
              placeholder="dd-mm-yyyy"
              disabledDate={currentdate => {
                if (item.dobFrom) {
                  return currentdate < item.dobFrom;
                }
                return false;
              }}
              onChange={date => {
                this.onParticipantCriteriasChanged(date, item, 'dobTo');
              }}
              format="DD-MM-YYYY"
              showTime={false}
              value={item.dobTo && moment(item.dobTo, 'YYYY-MM-DD')}
            />
            {/*   </Form.Item> */}
          </div>
          <div className="col-sm-4">
            <InputWithHead heading={AppConstants.gender} />
            {/* <Form.Item name="genderRefId"> */}
            <Radio.Group
              onChange={e =>
                this.onParticipantCriteriasChanged(e.target.value, item, 'genderRefId')
              }
              value={item.genderRefId}
            >
              {(genderData || []).map(gender => (
                <Radio key={`gender_${gender.id}`} value={gender.id}>
                  {gender.description}
                </Radio>
              ))}
            </Radio.Group>
            {/* </Form.Item> */}
          </div>
          <div
            className="col-sm-2 transfer-image-view"
            onClick={this.removeAvaibleMember.bind(this, item)}
          >
            <a className="transfer-image-view">
              <span className="user-remove-btn">
                <i className="fa fa-trash-o" aria-hidden="true" />
              </span>
              <span className="user-remove-text mr-0">{AppConstants.remove}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderFeeRange = () => {
    return (
      <>
        <InputWithHead heading={AppConstants.competitionFeeRange} required="required-field" />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <Form.Item
                name="minFee"
                rules={[{ required: true, message: ValidationConstants.minFeeRequired }]}
              >
                <InputNumber min={0} placeholder={AppConstants.minimum} />
              </Form.Item>
            </div>
            <div className="col-sm">
              <Form.Item
                name="maxFee"
                rules={[{ required: true, message: ValidationConstants.maxFeeRequired }]}
              >
                <InputNumber min={0} placeholder={AppConstants.maximum} />
              </Form.Item>
            </div>
          </div>
        </div>
      </>
    );
  };

  renderMemberships = () => {
    const membershipProducts = this.state.membershipProducts;
    if (this.props.isState) {
      return (
        <div className="inside-container-view pt-4">
          <InputWithHead required="pb-1" heading={AppConstants.registerMembershipType} />
          {membershipProducts &&
            membershipProducts.map((item, index) => (
              <div className="fluid-width mt-3" key={`${item}_index_${index}`}>
                <div className="row">
                  <div className="col-sm">
                    <Form.Item name={`membership_${index}`}>
                      <InputWithHead
                        auto_complete="off"
                        required="required-field pt-0"
                        placeholder={AppConstants.selectMembershipProductType}
                        value={item}
                      />
                    </Form.Item>
                  </div>

                  <div
                    className="col-sm-2 transfer-image-view"
                    onClick={this.removeMembership.bind(this, item)}
                  >
                    <a className="transfer-image-view">
                      <span className="user-remove-btn">
                        <i className="fa fa-trash-o" aria-hidden="true" />
                      </span>
                      <span className="user-remove-text mr-0">{AppConstants.remove}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          <a>
            <span
              onClick={() => this.addMembershipCriterias()}
              className="input-heading-add-another"
            >
              + {AppConstants.addAnother}
            </span>
          </a>
        </div>
      );
    } else {
      return (
        <>
          <InputWithHead required="required-field" heading={AppConstants.registerMembershipType} />
          <Form.Item
            name="membershipFormat"
            rules={[{ required: true, message: ValidationConstants.membershiptypeRequired }]}
          >
            <Select
              mode="multiple"
              onChange={this.handleMembershipChange}
              tokenSeparators={[',']}
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              placeholder={AppConstants.selectMembershipProductType}
            >
              {membershipProducts.map(item => (
                <Option key={`membership_${item}`} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      );
    }
  };

  //#endregion

  affiliateFormRef = React.createRef();
  render() {
    const contacts = this.props.contacts;
    const venueList = this.props.venueList;
    const weekDays = this.props.weekDays || [];
    const { organisationParticipantCriterias } = this.state;
    let registrationUrl = process.env.REACT_APP_URL_WEB_USER_REGISTRATION;
    let affiliateFinderUrl = null;
    if (registrationUrl) {
      affiliateFinderUrl = registrationUrl.endsWith('/')
        ? `${registrationUrl}finder`
        : `${registrationUrl}/finder`;
    }
    return (
      <>
        {affiliateFinderUrl ? (
          <div className="discount-view pt-5 link-area">
            <div className="row ">
              <div className="col-sm-12 ">
                <InputWithHead heading={AppConstants.affiliateFinderLink} />
                <div>
                  <a
                    className="user-reg-link"
                    href={affiliateFinderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {affiliateFinderUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <Form
          ref={this.affiliateFormRef}
          autoComplete="off"
          onFinish={this.saveAffiliate}
          onFinishFailed={err => {
            this.affiliateFormRef.current.scrollToField(err.errorFields[0].name);
          }}
        >
          <div className="discount-view pt-5">
            <InputWithHead heading={AppConstants.aboutUs} required="required-field" />
            <Form.Item
              name="aboutUs"
              rules={[{ required: true, message: ValidationConstants.aboutUsFieldRequired }]}
            >
              <TextArea allowClear rows={3} />
            </Form.Item>

            <div className="row">
              <div className="col-sm-12">
                <InputWithHead heading={AppConstants.trainingDays} />
                <Form.Item
                  name="trainingDays"
                  rules={[{ required: false, message: ValidationConstants.trainingDaysRequired }]}
                >
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder={AppConstants.trainingDays}
                  >
                    {weekDays.map(item => (
                      <Option key={item.id} value={item.id}>
                        {' '}
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-sm d-flex align-items-center" />
            </div>

            <div className="row">
              <div className="col-sm-12">
                <InputWithHead heading={AppConstants.playingDays} required="required-field" />
                <Form.Item
                  name="playingDays"
                  rules={[{ required: true, message: ValidationConstants.playingDaysRequired }]}
                >
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder={AppConstants.playingDays}
                  >
                    {weekDays.map(item => (
                      <Option key={item.id} value={item.id}>
                        {' '}
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-sm d-flex align-items-center" />
            </div>

            <InputWithHead heading={AppConstants.website} />
            <Form.Item name="website">
              <Input addonBefore="https://" />
            </Form.Item>

            {this.renderFeeRange()}

            <InputWithHead heading={AppConstants.contact} />
            <Form.Item name="userIds">
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                placeholder={AppConstants.selectContacts}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {contacts.map(lang => (
                  <Option key={lang.userId} value={lang.userId}>
                    {`${lang.firstName} ${lang.lastName}(${lang.email})`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <InputWithHead heading={AppConstants.venue} />
            <Form.Item name="venueIds">
              <Select
                mode="multiple"
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                placeholder={AppConstants.selectVenue}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {venueList.map(item => (
                  <Option key={'venue_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="inside-container-view pt-4">
              <InputWithHead required="pb-1" heading={AppConstants.whoCanPlayCompetition} />
              {organisationParticipantCriterias &&
                organisationParticipantCriterias.map((item, index) =>
                  this.ParticipantCriteriasView(item, index),
                )}
              <a>
                <span
                  onClick={() => this.addParticipantCriterias()}
                  className="input-heading-add-another"
                >
                  + {AppConstants.addAnother}
                </span>
              </a>
            </div>

            {this.renderMemberships()}

            <Form.Item name="id" noStyle>
              <Input hidden />
            </Form.Item>
          </div>
        </Form>
      </>
    );
  }
}

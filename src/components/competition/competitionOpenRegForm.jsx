import React, { Component, createRef } from 'react';
import {
  Layout,
  Breadcrumb,
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  Table,
  Radio,
  Tabs,
  Form,
  Modal,
  message,
  Tooltip,
  InputNumber,
  Popover,
} from 'antd';
import InputWithHead from '../../customComponents/InputWithHead';
import { captializedString, isImageFormatValid, isImageSizeValid } from '../../util/helpers';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getAllCompetitionFeesDeatilsAction,
  saveCompetitionFeesDetailsAction,
  getDefaultCompFeesMembershipProductTabAction,
  saveCompetitionFeesDivisionAction,
  divisionTableDataOnchangeAction,
  addRemoveDivisionAction,
  paymentFeeDeafault,
  paymentSeasonalFee,
  paymentPerMatch,
  add_editcompetitionFeeDeatils,
  competitionDiscountTypesAction,
  regCompetitionListDeleteAction,
  getDefaultCharity,
  getDefaultCompFeesLogoAction,
  clearCompReducerDataAction,
  removeCompetitionDivisionAction,
  onInviteesSearchAction,
} from '../../store/actions/registrationAction/competitionFeeAction';
import {
  competitionFeeInit,
  getVenuesTypeAction,
  getCommonDiscountTypeTypeAction,
  getYearListAction,
  getCompetitionTypeListAction,
  getYearAndCompetitionOwnAction,
  searchVenueList,
  clearFilter,
  getYearAndCompetitionParticipateAction,
} from '../../store/actions/appAction';
import { getAffiliateOurOrganisationIdAction } from '../../store/actions/userAction/userAction';
import moment from 'moment';
import history from '../../util/history';
import ValidationConstants from '../../themes/validationConstant';
import { NavLink } from 'react-router-dom';
import {
  set_competition,
  get_competition,
  get_competitionStatus,
  set_competitionStatus,
  set_competitionFinalRefId,
  setGlobalYear,
  getGlobalYear,
  getOrganisationData,
} from '../../util/sessionStorage';
import Loader from '../../customComponents/loader';
import { venueListAction } from '../../store/actions/commonAction/commonAction';
import CustomToolTip from 'react-png-tooltip';
import { fixtureTemplateRoundsAction } from '../../store/actions/competitionModuleAction/competitionDashboardAction';
import { getDrawsRoundsAction } from '../../store/actions/competitionModuleAction/competitionMultiDrawsAction';
import AppUniqueId from '../../themes/appUniqueId';
import { getCurrentYear } from 'util/permissions';
import PreferenceTab from './elements/Preference';
import {
  callDeleteDraws,
  callCheckDivisionName,
  callRestoreDeletedDivision,
} from 'util/drawHelper';
import { getOnlyYearListAction } from '../../store/actions/appAction';
import RegInviteesView from '../../customComponents/RegInviteesView/regInviteesView';
import GradePoolNames from './gradePoolNames';
import getCompetitionPermissions from './helper/getCompetitionPermissions';

const { Header, Footer, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;
let this_Obj = null;

const divisionTableColumns = [
  {
    title: AppConstants.divisionName,
    dataIndex: 'divisionName',
    key: 'divisionName',
    render: (divisionName, record, index) => (
      <Form.Item
        name={`divisionName${record.parentIndex}${index}`}
        rules={[{ required: true, message: ValidationConstants.divisionName }]}
      >
        <Popover content={divisionName}>
          <div>
            <Input
              className="input-inside-table-fees"
              data-testid={AppUniqueId.DIVISION_NAME}
              required="required-field pt-0 pb-0"
              value={divisionName}
              onChange={e =>
                this_Obj.divisionTableDataOnchange(e.target.value, record, index, 'divisionName')
              }
              onBlur={() => this_Obj.checkDivisionName(index, record)}
              disabled={!this_Obj.state.permissionState?.division?.enabled}
            />
          </div>
        </Popover>
      </Form.Item>
    ),
  },
  {
    title: AppConstants.genderRestriction,
    dataIndex: 'genderRestriction',
    key: AppUniqueId.div_gender_chkbox,
    filterDropdown: true,
    filterIcon: () => (
      <CustomToolTip placement="top">
        <span>{AppConstants.genderRestrictionMsg}</span>
      </CustomToolTip>
    ),
    render: (genderRestriction, record, index) => (
      <div>
        <Checkbox
          className="single-checkbox mt-1"
          disabled={!this_Obj.state.permissionState?.division?.enabled}
          checked={genderRestriction}
          onChange={e =>
            this_Obj.divisionTableDataOnchange(e.target.checked, record, index, 'genderRestriction')
          }
        />
      </div>
    ),
  },
  {
    dataIndex: 'genderRefId',
    key: AppUniqueId.div_gender_refid,
    render: (genderRefId, record, index) =>
      record.genderRestriction && (
        <Form.Item
          name={`genderRefId${record.parentIndex}${index}`}
          rules={[{ required: true, message: ValidationConstants.genderRestriction }]}
        >
          <Select
            className="division-age-select w-100"
            style={{ minWidth: 120 }}
            onChange={genderRefId =>
              this_Obj.divisionTableDataOnchange(genderRefId, record, index, 'genderRefId')
            }
            value={genderRefId}
            placeholder="Select"
            disabled={!this_Obj.state.permissionState?.division?.enabled}
          >
            {this_Obj.props.commonReducerState.genderDataEnum.map(item => (
              <Option key={'gender_' + item.id} value={item.id}>
                {item.description}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ),
  },
  {
    title: AppConstants.ageRestrictions,
    dataIndex: 'ageRestriction',
    key: AppUniqueId.div_ageres_chkbox,
    filterDropdown: true,
    filterIcon: () => (
      <CustomToolTip placement="top">
        <span>{AppConstants.ageRestrictionMsg}</span>
      </CustomToolTip>
    ),
    render: (ageRestriction, record, index) => (
      <div>
        <Checkbox
          className="single-checkbox mt-1"
          checked={ageRestriction}
          onChange={e =>
            this_Obj.divisionTableDataOnchange(e.target.checked, record, index, 'ageRestriction')
          }
          disabled={!this_Obj.state.permissionState?.division?.enabled}
        />
      </div>
    ),
  },
  {
    title: AppConstants.dobFrom,
    dataIndex: 'fromDate',
    key: AppUniqueId.div_ageres_fromdate,
    width: '25%',
    render: (fromDate, record, index) => (
      <Form.Item
        name={`fromDate${record.parentIndex}${index}`}
        rules={[
          { required: record.ageRestriction, message: ValidationConstants.pleaseSelectDOBFrom },
        ]}
      >
        <DatePicker
          size="default"
          className="comp-venue-time-datepicker w-100"
          style={{ minWidth: 135 }}
          onChange={date =>
            this_Obj.divisionTableDataOnchange(
              moment(date).format('YYYY-MM-DD'),
              record,
              index,
              'fromDate',
            )
          }
          format="DD-MM-YYYY"
          placeholder="dd-mm-yyyy"
          showTime={false}
          disabled={!record.ageRestriction || !this_Obj.state.permissionState?.division?.enabled}
          value={fromDate !== null && moment(fromDate)}
          disabledDate={d => !d || d.isSameOrAfter(record.toDate)}
        />
      </Form.Item>
    ),
  },
  {
    title: AppConstants.dobTo,
    dataIndex: 'toDate',
    width: '25%',
    key: AppUniqueId.div_ageres_todate,
    render: (toDate, record, index) => (
      <Form.Item
        name={`toDate${record.parentIndex}${index}`}
        rules={[
          { required: record.ageRestriction, message: ValidationConstants.PleaseSelectDOBTo },
        ]}
      >
        <DatePicker
          size="default"
          className="comp-venue-time-datepicker w-100"
          style={{ minWidth: 135 }}
          onChange={date =>
            this_Obj.divisionTableDataOnchange(
              moment(date).format('YYYY-MM-DD'),
              record,
              index,
              'toDate',
            )
          }
          format="DD-MM-YYYY"
          placeholder="dd-mm-yyyy"
          showTime={false}
          disabled={!record.ageRestriction || !this_Obj.state.permissionState?.division?.enabled}
          value={toDate !== null && moment(toDate)}
          disabledDate={d => moment(record.fromDate).isSameOrAfter(d, 'day')}
        />
      </Form.Item>
    ),
  },
  {
    title: '',
    dataIndex: 'clear',
    key: 'clear',
    render: (clear, record, index) => {
      const disabled = !this_Obj.state.permissionState?.division?.delete?.enabled;

      return disabled ? null : (
        <span className="d-flex justify-content-center w-100 pointer">
          <img
            className="dot-image"
            src={AppImages.redCross}
            alt=""
            width="16"
            height="16"
            onClick={() => (!disabled ? this_Obj.addRemoveDivision(index, record, 'remove') : null)}
          />
        </span>
      );
    },
  },
];

const TabKey = {
  Details: '1',
  Divisions: '2',
  Preferences: '3',
};
class CompetitionOpenRegForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: null,
      yearRefId: null,
      value: 'NETSETGO',
      division: 'Division',
      sourceModule: 'COMP',
      competitionTabKey: TabKey.Details,
      profileImage: null,
      image: null,
      loading: false,
      getDataLoading: false,
      statusRefId: 1,
      visible: false,
      buttonPressed: 'next',
      logoIsDefault: false,
      logoSetDefault: false,
      logoUrl: '',
      isSetDefaul: false,
      competitionIsUsed: false,
      firstTimeCompId: '',
      organisationTypeRefId: 0,
      isCompCreator: false,
      isPublished: false,
      isRegClosed: false,
      permissionState: {},
      tooltipVisibleDelete: false,
      tooltipVisibleDraft: false,
      tooltipVisiblePublish: false,
      deleteDivModalVisible: false,
      competitionDivisionId: null,
      deleteLoading: false,
      divisionChecking: false,
      competitionStatus: 0,
      divisionState: false,
      nextButtonClicked: false,
      deleteDrawsState: {
        actionRefId: 0,
        roundId: null,
      },
      validateCompetitionDivisionlVisible: false,
      deletedDivisionName: null,
      maximumPlayers: null,
      zeroErrorMsg: {
        view: false,
        message: '',
      },
      selectedDivision: {
        divisionName: '',
        record: {},
        index: '',
      },
      IsCompleteAddDivision: true,
    };
    this_Obj = this;
    this.props.clearCompReducerDataAction('all');
    this.formRef = createRef();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    let orgData = getOrganisationData() ? getOrganisationData() : null;
    const key = this.props.location?.state?.key;
    this.setState({ organisationTypeRefId: orgData.organisationTypeRefId, key: key });
    this.getReference();
    this.setDetailsFieldValue();
    const orgUniqueKey = JSON.parse(
      localStorage.getItem('setOrganisationData'),
    ).organisationUniqueKey;
    this.apiCalls(orgUniqueKey);
    const isNewComp = this.checkIsNewComp();
    const permissions = getCompetitionPermissions(isNewComp); //disable fields on initial page load
    this.setState({ permissionState: permissions, isCompCreator: isNewComp });
  }

  getYearAndCompetition(yearId) {
    const key = this.props.location?.state?.key;
    const { participate_YearArr, own_YearArr } = this.props.appState;
    if (key === 'part') {
      this.props.getYearAndCompetitionParticipateAction(
        participate_YearArr,
        yearId,
        'participate_competition',
      );
    } else {
      this.props.getYearAndCompetitionOwnAction(own_YearArr, yearId, 'own_competition');
    }
  }

  async componentDidUpdate(nextProps) {
    const { key, firstTimeCompId } = this.state;
    const nextPropsCompetitionArr =
      key === 'part'
        ? nextProps.appState.participate_CompetitionArr
        : nextProps.appState.all_own_CompetitionArr;
    const competitionTypeList =
      key === 'part'
        ? this.props.appState.participate_CompetitionArr
        : this.props.appState.all_own_CompetitionArr;

    const yearArr =
      key === 'part' ? this.props.appState.participate_YearArr : this.props.appState.own_YearArr;

    let competitionFeesState = this.props.competitionFeesState;

    if (competitionFeesState.onLoad === false && this.state.loading === true) {
      this.setState({ loading: false });
      if (!competitionFeesState.error) {
        this.setState({
          competitionTabKey: JSON.stringify(JSON.parse(this.state.competitionTabKey) + 1),
          logoSetDefault: false,
          image: null,
        });
      }
      if (
        this.state.buttonPressed === 'save' ||
        this.state.buttonPressed === 'publish' ||
        this.state.buttonPressed === 'delete'
      ) {
        history.push('/competitionDashboard');
      }
    }

    if (nextProps.competitionFeesState !== competitionFeesState) {
      if (competitionFeesState.addInviteesLoad !== nextProps.competitionFeesState.addInviteesLoad) {
        this.getMembershipDetails(this.state.yearRefId);
      }
      if (competitionFeesState.getCompAllDataOnLoad === false && this.state.getDataLoading) {
        if (competitionFeesState.competitionId) {
          this.callAnyorgSearchApi();
        }
        let isPublished = competitionFeesState.competitionDetailData.statusRefId == 2;

        let registrationCloseDate =
          competitionFeesState.competitionDetailData.registrationCloseDate &&
          moment(competitionFeesState.competitionDetailData.registrationCloseDate);
        let isRegClosed = registrationCloseDate
          ? !registrationCloseDate.isSameOrAfter(moment())
          : false;

        let creatorId = competitionFeesState.competitionCreator;
        let hasRegistration = competitionFeesState.hasRegistration;
        let orgData = getOrganisationData() ? getOrganisationData() : null;
        let organisationUniqueKey = orgData ? orgData.organisationUniqueKey : 0;
        let isCompCreator = creatorId == organisationUniqueKey;
        const isNewComp = this.checkIsNewComp();
        let drawsPublished = this.state.competitionStatus == 1;
        const permissions = getCompetitionPermissions(
          isNewComp,
          firstTimeCompId,
          hasRegistration,
          isPublished,
          drawsPublished,
          isCompCreator,
          false,
        );

        this.setState({
          getDataLoading: false,
          profileImage: competitionFeesState.competitionDetailData.competitionLogoUrl,
          competitionIsUsed: competitionFeesState.competitionDetailData.isUsed,
          isPublished,
          isRegClosed,
          isCompCreator,
          permissionState: permissions,
        });
        this.setDetailsFieldValue();
      }

      if (competitionFeesState.deleteDivisionLoad == false && this.state.deleteLoading) {
        this.setState({ deleteLoading: false });
        this.setDivisionFormFields();
      }
    }
    if (nextProps.appState !== this.props.appState) {
      if (nextProps.appState.yearList !== this.props.appState.yearList) {
        if (this.props.appState.yearList.length > 0) {
          let yearRefId = getGlobalYear()
            ? JSON.parse(getGlobalYear())
            : getCurrentYear(this.props.appState.yearList);

          this.props.add_editcompetitionFeeDeatils(yearRefId, 'yearRefId');
          this.setDetailsFieldValue();
          setGlobalYear(yearRefId);

          this.setState({ yearRefId: yearRefId });
        }
      }

      if (nextPropsCompetitionArr !== competitionTypeList) {
        if (competitionTypeList.length > 0) {
          let screenKey = this.props.location.state ? this.props.location.state.screenKey : null;
          let fromReplicate = this.props.location.state
            ? this.props.location.state.fromReplicate
            : null;
          let competitionId = null;
          let statusRefId = null;
          let competitionStatus = null;
          let finalTypeRefId = null;

          if (screenKey === 'compDashboard' || fromReplicate == 1) {
            competitionId = get_competition(key);
            competitionId = !competitionId ? this.props.location.state.id : null;
            let compIndex = competitionTypeList.findIndex(x => x.competitionId == competitionId);
            competitionId = compIndex > -1 ? competitionId : competitionTypeList[0].competitionId;
            statusRefId =
              compIndex > -1
                ? competitionTypeList[compIndex].statusRefId
                : competitionTypeList[0].statusRefId;
            competitionStatus = competitionTypeList[compIndex]
              ? competitionTypeList[compIndex].competitionStatus
              : 0;
            set_competitionStatus(key, undefined);
            set_competition(key, undefined);
            set_competitionFinalRefId(key, undefined);
          } else {
            competitionId = competitionTypeList[0].competitionId;
            statusRefId = competitionTypeList[0].statusRefId;
            competitionStatus = competitionTypeList[0].competitionStatus;
            finalTypeRefId = competitionTypeList[0].finalTypeRefId;
          }

          //set year data
          let yearRefId = getGlobalYear()
            ? getGlobalYear()
            : yearArr.length > 0 && getCurrentYear(yearArr);

          this.props.add_editcompetitionFeeDeatils(yearRefId, 'yearRefId');
          this.setDetailsFieldValue();
          setGlobalYear(yearRefId);

          //get comp details
          this.props.getAllCompetitionFeesDeatilsAction(
            competitionId,
            null,
            this.state.sourceModule,
            null,
            yearRefId,
          );
          this.props.getDrawsRoundsAction(yearRefId, competitionId);
          if (competitionStatus == 2) {
            //ispublished
            set_competitionStatus(key, statusRefId); //drawsPublish
            set_competition(key, competitionId);
            set_competitionFinalRefId(key, finalTypeRefId);
          }

          this.setState({
            getDataLoading: true,
            firstTimeCompId: competitionId,
            competitionStatus: statusRefId,
            yearRefId: JSON.parse(yearRefId),
          });
        } else {
          // Clear form values
          this.formRef.current.setFieldsValue({
            competition_name: '',
            selectedVenues: [],
          });
        }
      }
    }

    if (competitionFeesState.onLoad === false && this.state.divisionState === true) {
      setTimeout(() => {
        this.setDetailsFieldValue();
      }, 100);
      this.setState({ divisionState: false });
    }

    if (competitionFeesState.onLoad === false && this.state.loading === true) {
      if (!competitionFeesState.error) {
        if (this.state.nextButtonClicked === true) {
          this.setState({
            nextButtonClicked: false,
            loading: false,
          });
          await setGlobalYear(this.state.yearRefId);
          await set_competition(key, this.props.competitionFeesState.competitionId);
          await set_competitionStatus(key, this.state.statusRefId);
          let hasPreferenceTab =
            process.env.REACT_APP_TEAM_PREFERENCES_FOR_DRAW === 'true' && this.state.isCompCreator;
          if (!hasPreferenceTab) {
            this.gotoPlayerGrading();
          }
        } else {
          this.setState({
            loading: false,
          });
        }
      } else {
        this.setState({
          nextButtonClicked: false,
          loading: false,
        });
      }
    }
  }

  ////all the api calls
  apiCalls = organisationId => {
    this.props.getOnlyYearListAction();
    this.props.getDefaultCompFeesLogoAction();
    this.props.competitionDiscountTypesAction();
    this.props.competitionFeeInit();
    this.props.paymentFeeDeafault();
    this.props.paymentSeasonalFee();
    this.props.paymentPerMatch();
    this.props.getCommonDiscountTypeTypeAction();
    this.props.getVenuesTypeAction('all');
    this.props.fixtureTemplateRoundsAction();
    if (organisationId) this.props.getAffiliateOurOrganisationIdAction(organisationId);
    // this.props.venueListAction();
  };

  callAnyorgSearchApi = () => {
    this.props.onInviteesSearchAction('', 3);
    this.props.onInviteesSearchAction('', 4);
  };

  getMembershipDetails = yearRefId => {
    const { competitionDetailData } = this.props.competitionFeesState;
    let affiliateOrgId = this.props.location.state
      ? this.props.location.state.affiliateOrgId
      : null;
    let competitionId = competitionDetailData.competitionUniqueKey;
    if (competitionId !== null) {
      let hasRegistration = competitionDetailData.hasRegistration ?? 0;
      this.props.getAllCompetitionFeesDeatilsAction(
        competitionId,
        hasRegistration,
        'COMP',
        affiliateOrgId,
        yearRefId,
      );
      this.setState({ getDataLoading: true });
    }
  };

  checkIsNewComp = () => {
    const { isNewComp } = this.props.location.state ?? { isNewComp: false };
    return isNewComp;
  };

  getReference() {
    let yearRefId = getGlobalYear();
    const isNewComp = this.checkIsNewComp();
    const { key } = this.state;
    const { participate_CompetitionArr, all_own_CompetitionArr, participate_YearArr, own_YearArr } =
      this.props.appState;
    const competitionArr = key === 'part' ? participate_CompetitionArr : all_own_CompetitionArr;
    const yearArr = key === 'part' ? participate_YearArr : own_YearArr;
    if (isNewComp && yearRefId) {
      this.props.add_editcompetitionFeeDeatils(yearRefId, 'yearRefId');
      this.setDetailsFieldValue();
      this.setState({
        yearRefId: JSON.parse(yearRefId),
      });
      return;
    }
    let storedCompetitionId = get_competition(key);
    let storedCompetitionStatus = get_competitionStatus(key);
    // let storedfinalTypeRefId = getOwn_CompetitionFinalRefId()
    let propsData = yearArr.length > 0 ? yearArr : undefined;
    let compData = competitionArr.length > 0 ? competitionArr : undefined;
    let fromReplicate = this.props.location.state ? this.props.location.state.fromReplicate : null;

    if (fromReplicate != 1) {
      if (storedCompetitionId && yearRefId && propsData && compData) {
        this.props.getAllCompetitionFeesDeatilsAction(
          storedCompetitionId,
          null,
          this.state.sourceModule,
          null,
          JSON.parse(yearRefId),
        );
        this.setState({
          yearRefId: JSON.parse(yearRefId),
          firstTimeCompId: storedCompetitionId,
          competitionStatus: storedCompetitionStatus,
          getDataLoading: true,
        });
      } else if (yearRefId) {
        this.getYearAndCompetition(yearRefId);
      } else {
        this.getYearAndCompetition(null);
      }
    } else {
      this.getYearAndCompetition(yearRefId);
    }
  }

  setDetailsFieldValue() {
    let compFeesState = this.props.competitionFeesState;
    if (!this.formRef.current) {
      return;
    }
    this.formRef.current.setFieldsValue({
      competition_name: compFeesState.competitionDetailData.competitionName,
      yearRefId: compFeesState.competitionDetailData.yearRefId,
      competitionTypeRefId: compFeesState.competitionDetailData.competitionTypeRefId,
      competitionFormatRefId: compFeesState.competitionDetailData.competitionFormatRefId,
      selectedVenues: compFeesState.selectedVenues,
      startDate:
        compFeesState.competitionDetailData.startDate &&
        moment(compFeesState.competitionDetailData.startDate),
      endDate:
        compFeesState.competitionDetailData.endDate &&
        moment(compFeesState.competitionDetailData.endDate),
      finalTypeRefId: compFeesState.competitionDetailData.finalTypeRefId,
      allowPlayerReplication: compFeesState.competitionDetailData.allowPlayerReplication,
      playerPublishTypeRefId: compFeesState.competitionDetailData.playerPublishTypeRefId,
    });
    let data = this.props.competitionFeesState.competionDiscountValue;
    let discountData =
      data && data.competitionDiscounts !== null ? data.competitionDiscounts[0].discounts : [];
    discountData.forEach((item, index) => {
      let competitionMembershipProductTypeId = `competitionMembershipProductTypeId${index}`;
      let membershipProductUniqueKey = `membershipProductUniqueKey${index}`;
      this.formRef.current.setFieldsValue({
        [competitionMembershipProductTypeId]: item.competitionMembershipProductTypeId,
        [membershipProductUniqueKey]: item.membershipProductUniqueKey,
      });
    });

    this.setDivisionFormFields();
  }

  setDivisionFormFields = () => {
    let divisionData = this.props.competitionFeesState.competitionDivisionsData;
    let divisionArray = divisionData !== null ? divisionData : [];
    divisionArray.forEach((item, index) => {
      item.divisions.forEach((divItem, divIndex) => {
        let divisionName = `divisionName${index}${divIndex}`;
        let genderRefId = `genderRefId${index}${divIndex}`;
        let fromDate = `fromDate${index}${divIndex}`;
        let toDate = `toDate${index}${divIndex}`;
        this.formRef.current.setFieldsValue({
          [divisionName]: divItem.divisionName,
          [genderRefId]: divItem.genderRefId ? divItem.genderRefId : [],
          [fromDate]: divItem.fromDate && moment(divItem.fromDate),
          [toDate]: divItem.toDate && moment(divItem.toDate),
        });
      });
    });
  };

  checkDivisionEmpty(data) {
    for (let i in data) {
      if (data[i].isPlayingStatus && data[i].divisions.length === 0) {
        return true;
      }
    }
  }

  filterCompetitionGradeNamingDivisions(compState) {
    let competitionGradeNamingDivisions = compState.competitionGradePoolsData;
    let templates = competitionGradeNamingDivisions.map(compGradeNamingDivision => {
      let competitionFormatTemplateId = compGradeNamingDivision.compGradeNamingTemplateId;
      if (competitionFormatTemplateId < 0) {
        compGradeNamingDivision.compGradeNamingTemplateId = 0;
      }

      const selectedDivisions = compGradeNamingDivision.selectedDivisions;
      let divisions = compGradeNamingDivision.divisions;
      let divArr = [];

      for (let j in selectedDivisions) {
        let matchDivision = divisions.find(x => x.competitionDivisionId === selectedDivisions[j]);
        if (matchDivision) {
          divArr.push({
            competitionGradeNamingDivisionId: matchDivision.competitionGradeNamingDivisionId,
            competitionDivisionId: matchDivision.competitionDivisionId,
          });
        }
      }

      return {
        ...compGradeNamingDivision,
        divisions: divArr,
        allDivisions: compState.isAllDivisionChecked,
      };
    });
    if (templates.length == 1) {
      let namingDiv = templates[0];
      if (
        !namingDiv.gradeTypeRefId &&
        namingDiv.selectedDivisions.length == 0 &&
        !namingDiv.allDivisions
      ) {
        //no template
        templates = [];
      }
    }
    return templates;
  }

  saveAPIsActionCall = values => {
    const { key } = this.state;
    let tabKey = this.state.competitionTabKey;
    let compFeesState = this.props.competitionFeesState;
    let competitionId = compFeesState.competitionId;
    let postData = compFeesState.competitionDetailData;
    let nonPlayingDate = JSON.stringify(postData.nonPlayingDates);
    let venue = JSON.stringify(compFeesState.postVenues);
    const competitionArr =
      key === 'part'
        ? this.props.appState.participate_CompetitionArr
        : this.props.appState.all_own_CompetitionArr;
    //invitees
    let invitees = [];
    let anyOrgAffiliateArr = [];
    if (
      compFeesState.associationChecked &&
      compFeesState.anyOrgAssociationArr[0].inviteesOrg.length > 0
    ) {
      anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgAssociationArr);
    }
    if (compFeesState.clubChecked && compFeesState.anyOrgClubArr[0].inviteesOrg.length > 0) {
      anyOrgAffiliateArr = anyOrgAffiliateArr.concat(compFeesState.anyOrgClubArr);
    }
    if (compFeesState.affiliateArray != null && compFeesState.affiliateArray.length > 0) {
      invitees = compFeesState.affiliateArray.concat(anyOrgAffiliateArr);
    } else if (anyOrgAffiliateArr != null && anyOrgAffiliateArr.length > 0) {
      invitees = anyOrgAffiliateArr;
    }

    if (tabKey == TabKey.Details) {
      if (compFeesState.competitionDetailData.competitionLogoUrl !== null && invitees.length > 0) {
        let formData = new FormData();
        formData.append('competitionUniqueKey', competitionId);
        formData.append('name', postData.competitionName);
        formData.append('yearRefId', postData.yearRefId);
        formData.append('description', postData.description);
        formData.append('competitionTypeRefId', postData.competitionTypeRefId);
        formData.append('competitionFormatRefId', postData.competitionFormatRefId);
        formData.append('finalTypeRefId', postData.finalTypeRefId);
        formData.append('startDate', postData.startDate);
        formData.append('endDate', postData.endDate);
        if (postData.roundInDays !== null && postData.roundInDays !== '')
          formData.append('roundInDays', postData.roundInDays);
        if (postData.roundInHours !== null && postData.roundInHours !== '')
          formData.append('roundInHours', postData.roundInHours);
        if (postData.roundInMins !== null && postData.roundInMins !== '')
          formData.append('roundInMins', postData.roundInMins);
        if (postData.minimunPlayers !== null && postData.minimunPlayers !== '')
          formData.append('minimunPlayers', postData.minimunPlayers);
        if (postData.maximumPlayers !== '0')
          formData.append('maximumPlayers', postData.maximumPlayers);
        formData.append('venues', venue);
        formData.append('registrationCloseDate', postData.registrationCloseDate);
        formData.append('statusRefId', this.state.isPublished ? 2 : this.state.statusRefId);
        formData.append('nonPlayingDates', nonPlayingDate);
        formData.append('invitees', JSON.stringify(invitees));
        formData.append('logoSetAsDefault', this.state.logoSetDefault);
        formData.append('hasRegistration', postData.hasRegistration);
        formData.append('playerPublishTypeRefId', postData.playerPublishTypeRefId);
        if (this.state.logoSetDefault) {
          formData.append('organisationLogoId', compFeesState.defaultCompFeesOrgLogoData.id);
        }
        if (postData.logoIsDefault) {
          formData.append(
            'competitionLogoId',
            postData.competitionLogoId ? postData.competitionLogoId : 0,
          );
          formData.append('logoFileUrl', compFeesState.defaultCompFeesOrgLogo);
          formData.append('competition_logo', compFeesState.defaultCompFeesOrgLogo);
        } else {
          if (this.state.image !== null) {
            formData.append('competition_logo', this.state.image);
            formData.append(
              'competitionLogoId',
              postData.competitionLogoId ? postData.competitionLogoId : 0,
            );
          } else {
            formData.append(
              'competitionLogoId',
              postData.competitionLogoId ? postData.competitionLogoId : 0,
            );
            formData.append('logoFileUrl', postData.competitionLogoUrl);
            // formData.append("competition_logo", compFeesState.defaultCompFeesOrgLogo)
          }
        }
        formData.append('logoIsDefault', postData.logoIsDefault);

        if (this.state.image) {
          formData.append('uploadFileType', 1);
        }

        formData.append('allowPlayerReplication', postData.allowPlayerReplication);

        this.props.saveCompetitionFeesDetailsAction(
          formData,
          compFeesState.defaultCompFeesOrgLogoData.id,
          this.state.sourceModule,
        );
        set_competitionFinalRefId(key, postData.finalTypeRefId);
        this.setState({ loading: true, divisionState: true });
      } else {
        if (invitees.length === 0) {
          message.error(ValidationConstants.pleaseSelectRegInvitees);
        }
        if (compFeesState.competitionDetailData.competitionLogoUrl == null) {
          message.error(ValidationConstants.competitionLogoIsRequired);
        }
      }
    } else if (tabKey == TabKey.Divisions) {
      let divisionArrayData = compFeesState.competitionDivisionsData;
      let finalDivisionArray = [];
      for (let i in divisionArrayData) {
        finalDivisionArray = [...finalDivisionArray, ...divisionArrayData[i].divisions];
      }
      for (let div of finalDivisionArray) {
        if (!div.divisionName) {
          message.error(ValidationConstants.divisionName);
          return false;
        }
      }
      let payload = finalDivisionArray;
      let finalDivisionPayload = {
        statusRefId: this.state.isPublished ? 2 : this.state.statusRefId,
        divisions: payload,
        sourceModule: this.state.sourceModule,
        competitionGradeNamingDivisions: this.filterCompetitionGradeNamingDivisions(compFeesState),
      };
      if (this.checkDivisionEmpty(divisionArrayData)) {
        message.error(ValidationConstants.pleaseAddDivisionForMembershipProduct);
        return;
      }

      for (let template of finalDivisionPayload.competitionGradeNamingDivisions) {
        if (!template.allDivisions && template.selectedDivisions.length == 0) {
          message.error(ValidationConstants.selectDivisionsForNamingFormat);
          return;
        }
        if (!template.gradeTypeRefId) {
          message.error(ValidationConstants.selectNamingFormat);
          return;
        }
      }
      this.props.saveCompetitionFeesDivisionAction(finalDivisionPayload, competitionId);
      this.setState({ loading: true });
    } else if (tabKey == TabKey.Preferences) {
      this.preferenceRef.showSavePreferenceConfirm(result => {
        if (result) {
          let competitionList = competitionArr;
          let compExist = competitionList.find(x => x.competitionId == this.state.firstTimeCompId);
          if (compExist) {
            compExist.allowTeamPreferences = result.allowTeamPreferences;
            compExist.preferencesSetByRefId = result.preferencesSetByRefId;
          }
          this.gotoPlayerGrading();
        }
      });
    }
  };
  gotoPlayerGrading = () => {
    let fromReplicate = this.props.location.state ? this.props.location.state.fromReplicate : null;
    history.push('/competitionPlayerGrades', { fromReplicate: fromReplicate });
  };

  divisionTableDataOnchange(checked, record, index, keyword) {
    this.props.divisionTableDataOnchangeAction(checked, record, index, keyword);
    this.setState({ divisionState: true });
  }

  async checkDivisionName(index, record) {
    if (record.divisionName == '') {
      this.setState({ IsCompleteAddDivision: false });
    } else {
      this.setState({ divisionChecking: true });
      const result = await callCheckDivisionName(this.state.firstTimeCompId, record.divisionName);
      if (result && result.length > 0) {
        this.setState({ IsCompleteAddDivision: false });
        this.setState({
          validateCompetitionDivisionlVisible: true,
          deletedDivisionName: record.divisionName,
          selectedDivision: {
            divisionName: record.divisionName,
            record: record,
            index: index,
          },
        });
      } else {
        this.setState({ IsCompleteAddDivision: true });
      }
      this.setState({ divisionChecking: false });
    }
  }

  handleValidateDivision = key => {
    if (key === 'ok') {
      const result = callRestoreDeletedDivision(
        this.state.firstTimeCompId,
        this.state.deletedDivisionName,
      );
      this.setState({ IsCompleteAddDivision: true });
    } else {
      this.setState({ IsCompleteAddDivision: false });
    }
    this.setState({ validateCompetitionDivisionlVisible: false });
  };

  dateOnChangeFrom = (date, key) => {
    if (date !== null) {
      this.props.add_editcompetitionFeeDeatils(moment(date).format('YYYY-MM-DD'), key);
    }
  };

  headerView = () => {
    const isNewComp = this.checkIsNewComp();
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          {isNewComp ? (
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.addCompetition}
              </Breadcrumb.Item>
            </Breadcrumb>
          ) : (
            <>
              <Breadcrumb separator="">
                <Breadcrumb.Item className="breadcrumb-add">
                  {AppConstants.competitionDetails}
                </Breadcrumb.Item>
              </Breadcrumb>
              {
                <div className="mt-n20">
                  <CustomToolTip placement="top">
                    <span>{AppConstants.compDetailsMsg}</span>
                  </CustomToolTip>
                </div>
              }
            </>
          )}
        </Header>
      </div>
    );
  };

  regCompetitionFeeNavigationView = competitionId => {
    return (
      <div className="mb-5">
        <div className="formView">
          <div className="content-view pt-3">
            <div className="row-view-text">
              <span className="registation-screen-nav-text">
                {AppConstants.toEditRegistrationDetails}
              </span>
              <span
                className="registation-screen-nav-text-appColor pointer ml-5"
                data-testid={AppUniqueId.REGISTRATION_AREA}
                onClick={() => history.push('/registrationCompetitionFee', { id: competitionId })}
                style={{ textDecoration: 'underline' }}
              >
                {AppConstants.registrationArea}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // year change and get competition lost
  onYearChange(yearId) {
    const { key } = this.state;
    const permissions = getCompetitionPermissions(); //disabling fields until new data is in
    this.setState({ permissionState: permissions });
    setGlobalYear(yearId);
    set_competition(key, undefined);
    set_competitionStatus(key, undefined);
    set_competitionFinalRefId(key, undefined);
    this.props.clearCompReducerDataAction('all');
    this.getYearAndCompetition(yearId);
    // this.props.getCompetitionTypeListAction(yearRefId);
    this.setState({ firstTimeCompId: null, yearRefId: yearId, competitionStatus: 0 });
  }

  onCompetitionChange(competitionId, competitionArray) {
    const { key } = this.state;
    let competititionIndex = competitionArray.findIndex(x => x.competitionId == competitionId);
    let competitionStatus = competitionArray[competititionIndex].competitionStatus;
    let statusRefId = competitionArray[competititionIndex].statusRefId;
    let finalTypeRefId = competitionArray[competititionIndex].finalTypeRefId;
    if (competitionStatus == 2) {
      set_competition(key, competitionId);
      set_competitionStatus(key, statusRefId);
      set_competitionFinalRefId(key, finalTypeRefId);
    }
    this.props.clearCompReducerDataAction('all');
    this.props.getAllCompetitionFeesDeatilsAction(
      competitionId,
      null,
      this.state.sourceModule,
      null,
      this.state.yearRefId,
    );
    this.props.getDrawsRoundsAction(this.state.yearRefId, competitionId);
    this.setState({
      getDataLoading: true,
      firstTimeCompId: competitionId,
      competitionStatus: statusRefId,
      deleteDrawsState: {
        actionRefId: 0,
        roundId: null,
      },
    });
  }

  dropdownView = () => {
    const { key } = this.state;
    const { participate_CompetitionArr, all_own_CompetitionArr, participate_YearArr, own_YearArr } =
      this.props.appState;
    const competitionArr = key === 'part' ? participate_CompetitionArr : all_own_CompetitionArr;
    const yearArr = key === 'part' ? participate_YearArr : own_YearArr;
    return (
      <div className="comp-venue-courts-dropdown-view mt-0">
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm-3 pb-3">
              <div className="w-ft d-flex flex-row align-items-center">
                <span className="year-select-heading">{AppConstants.year}:</span>
                <Select
                  name="yearRefId"
                  className="year-select reg-filter-select-year ml-2"
                  data-testid={AppUniqueId.COMPETITION_YEAR_SELECT_BOX}
                  onChange={yearRefId => this.onYearChange(yearRefId)}
                  value={!!yearArr?.length ? this.state.yearRefId : ''}
                >
                  {yearArr.map(item => (
                    <Option
                      key={'year_' + item.id}
                      value={item.id}
                      data-testid={AppUniqueId.COMPETITION_YEAR_OPTION + item.description}
                    >
                      {item.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="col-sm-3 pb-3">
              <div
                className="w-ft d-flex flex-row align-items-center"
                style={{ minWidth: 300, marginRight: 50 }}
              >
                <span id={AppUniqueId.existing_comp_dropdown} className="year-select-heading">
                  {AppConstants.competition}:
                </span>
                <Select
                  name="competition"
                  className="year-select reg-filter-select-competition ml-2"
                  data-testid={AppUniqueId.COMPETITION_DROPDOWN}
                  onChange={competitionId =>
                    this.onCompetitionChange(competitionId, competitionArr)
                  }
                  value={JSON.parse(JSON.stringify(this.state.firstTimeCompId))}
                >
                  {competitionArr.map(item => (
                    <Option
                      key={'competition_' + item.competitionId}
                      value={item.competitionId}
                      data-testid={AppUniqueId.SELECT_COMPETITION + item.competitionName}
                    >
                      {item.competitionName}
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

  // setImage = (data) => {
  //     if (data.files[0] !== undefined) {
  //         let files_ = data.files[0].type.split("image/")
  //         let fileType = files_[1]

  //         if (data.files[0].size > AppConstants.logo_size) {
  //             message.error(AppConstants.logoImageSize);
  //             return
  //         }

  //         if (fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {
  //             this.setState({ image: data.files[0], profileImage: URL.createObjectURL(data.files[0]), isSetDefaul: true })
  //             this.props.add_editcompetitionFeeDeatils(URL.createObjectURL(data.files[0]), "competitionLogoUrl")
  //             this.props.add_editcompetitionFeeDeatils(false, "logoIsDefault")
  //         } else {
  //             message.error(AppConstants.logoType);
  //         }
  //     }
  // };

  setImage = data => {
    if (data.files[0] !== undefined) {
      let file = data.files[0];
      let extension = file.name.split('.').pop().toLowerCase();
      let imageSizeValid = isImageSizeValid(file.size);
      let isSuccess = isImageFormatValid(extension);
      if (!isSuccess) {
        message.error(AppConstants.logo_Image_Format);
        return;
      }
      if (!imageSizeValid) {
        message.error(AppConstants.logo_Image_Size);
        return;
      }
      this.setState({
        image: data.files[0],
        profileImage: URL.createObjectURL(data.files[0]),
        isSetDefaul: true,
      });
      this.props.add_editcompetitionFeeDeatils(
        URL.createObjectURL(data.files[0]),
        'competitionLogoUrl',
      );
      this.props.add_editcompetitionFeeDeatils(false, 'logoIsDefault');
    }
  };

  selectImage() {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (!!fileInput) {
      fileInput.click();
    }
  }

  /// add-edit non playing dates and name
  updateNonPlayingNames(data, index, key) {
    let detailsData = this.props.competitionFeesState;
    let array = detailsData.competitionDetailData.nonPlayingDates;
    if (key === 'name') {
      array[index].name = data;
    } else {
      array[index].nonPlayingDate = moment(data).format('YYYY-MM-DD');
    }

    this.props.add_editcompetitionFeeDeatils(array, 'nonPlayingDates');
  }

  updateMaximumPlayers(value) {
    if (value !== '0') {
      if (value === '') {
        //form input will send an empty string, setting it to null
        value = null;
      }
      this.setState({
        maximumPlayers: value,
      });
      this.props.add_editcompetitionFeeDeatils(value, 'maximumPlayers');
      this.setState({
        zeroErrorMsg: {
          view: false,
          message: '',
        },
      });
    } else {
      this.setState({
        zeroErrorMsg: {
          view: true,
          message: AppConstants.maximumPlayersValidationMessage,
        },
      });
    }
  }
  // Non playing dates view
  nonPlayingDateView(item, index) {
    const compDetailDisabled = !this.state.permissionState?.compDetails?.enabled;
    return (
      <div className="fluid-width mt-3">
        <div className="row">
          <div className="col-sm">
            <InputWithHead
              auto_complete={`new-name${index}`}
              placeholder={AppConstants.name}
              value={item.name}
              onChange={e => this.updateNonPlayingNames(e.target.value, index, 'name')}
              disabled={compDetailDisabled}
            />
          </div>
          <div className="col-sm">
            <DatePicker
              className="comp-dashboard-botton-view-mobile w-100"
              // size="large"
              placeholder="dd-mm-yyyy"
              onChange={date => this.updateNonPlayingNames(date, index, 'date')}
              format="DD-MM-YYYY"
              showTime={false}
              value={item.nonPlayingDate && moment(item.nonPlayingDate, 'YYYY-MM-DD')}
              disabled={compDetailDisabled}
            />
          </div>
          <div
            className="col-sm-2 transfer-image-view"
            onClick={() => (compDetailDisabled ? this.removeNonPlaying(index) : null)}
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

  //On selection of venue
  onSelectValues(item, detailsData) {
    this.props.add_editcompetitionFeeDeatils(item, 'venues');
    this.props.clearFilter();
  }

  //remove non playing dates
  removeNonPlaying(index) {
    if (this.state.competitionStatus == 1) {
    } else {
      this.props.add_editcompetitionFeeDeatils(index, 'nonPlayingDataRemove');
    }
  }

  ///// Add Non Playing dates
  addNonPlayingDate() {
    if (this.state.competitionStatus == 1) {
    } else {
      let nonPlayingObject = {
        competitionNonPlayingDatesId: 0,
        name: '',
        nonPlayingDate: '',
      };
      this.props.add_editcompetitionFeeDeatils(nonPlayingObject, 'nonPlayingObjectAdd');
    }
  }

  /////on change logo isdefault
  logoIsDefaultOnchange = (value, key) => {
    this.props.add_editcompetitionFeeDeatils(value, key);
    this.setState({ logoSetDefault: false, isSetDefaul: false, image: null });
  };

  ////onChange save as default logo
  logoSaveAsDefaultOnchange = (value, key) => {
    this.props.add_editcompetitionFeeDeatils(false, key);
    this.setState({ logoSetDefault: value });
  };

  // search venue
  handleSearch = (value, data) => {
    const filteredData = data.filter(memo => {
      return memo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
    });
    this.props.searchVenueList(filteredData);
  };

  setGradesAndPools = value => {
    this.props.add_editcompetitionFeeDeatils(value, 'finalTypeRefId');
  };

  setYearForNewComp = yearRefId => {
    this.props.add_editcompetitionFeeDeatils(yearRefId, 'yearRefId');
    this.setDetailsFieldValue();
    setGlobalYear(yearRefId);
    this.setState({ yearRefId: yearRefId });
  };

  selectYearForNewComp = () => {
    const { yearList } = this.props.appState;
    const isNewComp = this.checkIsNewComp();
    let competitionId = this.props.competitionFeesState.competitionId;
    return (yearList && isNewComp) || competitionId ? (
      <>
        <InputWithHead required="required-field" heading={AppConstants.year} />

        <Form.Item
          name="yearRefId"
          rules={[{ required: true, message: ValidationConstants.pleaseSelectYear }]}
        >
          <Select
            className="year-select reg-filter-select-year"
            data-testid={AppUniqueId.SELECT_COMPETITION_YEAR}
            style={{ maxWidth: 80 }}
            disabled={!isNewComp}
            onChange={e => this.setYearForNewComp(e)}
          >
            {yearList.map(item => (
              <Option
                data-testid={AppUniqueId.SELECT_COMPETITION_YEAR_OPTION + item.description}
                key={'year_' + item.id}
                value={item.id}
              >
                {item.description}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    ) : null;
  };

  ///////form content view - fee details
  contentView = () => {
    const { isCompCreator } = this.state;
    let appState = this.props.appState;
    const { affiliateOurOrg } = this.props.userState;
    // const { venueList, mainVenueList } = this.props.commonReducerState
    let detailsData = this.props.competitionFeesState;
    let defaultCompFeesOrgLogo = detailsData.defaultCompFeesOrgLogo;
    const compDetailDisabled = !this.state.permissionState?.compDetails?.enabled;
    const playerPublishOptionsDisabled =
      !this.state.permissionState?.compDetails?.playerPublishOptions?.enabled;
    return (
      <div className="content-view pt-4">
        {this.selectYearForNewComp()}
        <Form.Item
          name="competition_name"
          rules={[{ required: true, message: ValidationConstants.competitionNameIsRequired }]}
        >
          <InputWithHead
            auto_complete="off"
            required="required-field"
            heading={AppConstants.competitionName}
            placeholder={AppConstants.competitionName}
            data-testid={AppUniqueId.COMPETITION_NAME}
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(
                captializedString(e.target.value),
                'competitionName',
              )
            }
            disabled={compDetailDisabled}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                competition_name: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>

        <InputWithHead required="required-field" heading={AppConstants.competitionLogo} />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="reg-competition-logo-view" onClick={this.selectImage}>
                <label>
                  <img
                    src={
                      detailsData.competitionDetailData.competitionLogoUrl == null
                        ? AppImages.circleImage
                        : detailsData.competitionDetailData.competitionLogoUrl
                    }
                    alt=""
                    height="120"
                    width="120"
                    style={{ borderRadius: 60 }}
                    name="image"
                    data-testid={AppUniqueId.COMPETITION_LOGO}
                    onError={ev => {
                      ev.target.src = AppImages.circleImage;
                    }}
                  />
                </label>
              </div>
              <input
                disabled={compDetailDisabled}
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
              {defaultCompFeesOrgLogo !== null && (
                <Checkbox
                  className="single-checkbox"
                  data-testid={AppUniqueId.USE_DEFAULT_COMP_LOGO}
                  checked={detailsData.competitionDetailData.logoIsDefault}
                  onChange={e => this.logoIsDefaultOnchange(e.target.checked, 'logoIsDefault')}
                  disabled={compDetailDisabled}
                >
                  {AppConstants.useDefault}
                </Checkbox>
              )}

              {this.state.isSetDefaul && (
                <Checkbox
                  className="single-checkbox ml-0"
                  checked={this.state.logoSetDefault}
                  onChange={e => this.logoSaveAsDefaultOnchange(e.target.checked, 'logoIsDefault')}
                  disabled={compDetailDisabled}
                >
                  {AppConstants.useAffiliateLogo}
                </Checkbox>
              )}
            </div>
          </div>
          <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
        </div>

        <InputWithHead heading={AppConstants.description} />

        <TextArea
          placeholder={AppConstants.addShortNotes_registering}
          allowClear
          value={detailsData.competitionDetailData.description}
          onChange={e => this.props.add_editcompetitionFeeDeatils(e.target.value, 'description')}
          disabled={compDetailDisabled}
        />

        <div>
          <InputWithHead required="required-field" heading={AppConstants.venue} />
          <Form.Item
            name="selectedVenues"
            rules={[{ required: true, message: ValidationConstants.pleaseSelectVenue }]}
          >
            <Select
              id={AppUniqueId.select_Venues}
              mode="multiple"
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              onChange={venueSelection => {
                this.onSelectValues(venueSelection, detailsData);
              }}
              placeholder={AppConstants.selectVenue}
              data-testid={AppUniqueId.SELECT_COMPETITION_VENUE}
              filterOption={false}
              onSearch={value => {
                this.handleSearch(value, appState.mainVenueList);
              }}
              disabled={compDetailDisabled}
            >
              {appState.venueList.map(item => (
                <Option
                  data-testid={AppUniqueId.SELECT_COMPETITION_VENUE_OPTION + item.name}
                  key={'venue_' + item.id}
                  value={item.id}
                >
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        {affiliateOurOrg.organisationTypeRefId >
          affiliateOurOrg.whatIsTheLowestOrgThatCanAddVenue || compDetailDisabled ? null : (
          <NavLink
            to={{
              pathname: `/competitionVenueAndTimesAdd`,
              state: {
                key: AppConstants.competitionDetails,
                id: this.props.location.state ? this.props.location.state.id : null,
              },
            }}
          >
            <span className="input-heading-add-another">+{AppConstants.addVenue}</span>
          </NavLink>
        )}
        <span className="applicable-to-heading required-field">
          {AppConstants.typeOfCompetition}
        </span>
        <Form.Item
          name="competitionTypeRefId"
          rules={[{ required: true, message: ValidationConstants.pleaseSelectCompetitionType }]}
        >
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'competitionTypeRefId')
            }
            value={detailsData.competitionTypeRefId}
            disabled={compDetailDisabled}
          >
            {appState.typesOfCompetition.map(item => (
              <Radio
                data-testid={AppUniqueId.COMPETITION_TYPE + item.name}
                key={'competitionType_' + item.id}
                value={item.id}
              >
                {item.description}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <span className="applicable-to-heading required-field">
          {AppConstants.competitionFormat}
        </span>
        <Form.Item
          name="competitionFormatRefId"
          rules={[{ required: true, message: ValidationConstants.pleaseSelectCompetitionFormat }]}
        >
          <Radio.Group
            className="reg-competition-radio"
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'competitionFormatRefId')
            }
            value={detailsData.competitionFormatRefId}
            disabled={compDetailDisabled}
          >
            {appState.competitionFormatTypes.map(item => (
              <div className="contextualHelp-RowDirection" key={item.id}>
                <Radio
                  data-testid={AppUniqueId.COMPETITION_FORMAT + item.name}
                  key={item.id}
                  value={item.id}
                >
                  {item.description}
                </Radio>
                <div className="ml-n20 mt-3">
                  <CustomToolTip>
                    <span>{item.helpMsg}</span>
                  </CustomToolTip>
                </div>
              </div>
            ))}
          </Radio.Group>
        </Form.Item>

        <span className="applicable-to-heading required-field">{AppConstants.gradesOrPools}</span>
        <Form.Item
          name="finalTypeRefId"
          initialValue={detailsData.competitionDetailData.finalTypeRefId}
          rules={[{ required: true, message: ValidationConstants.pleaseSelectGradesOrPools }]}
        >
          <Radio.Group
            className="reg-competition-radio"
            onChange={e => this.setGradesAndPools(e.target.value)}
            value={detailsData.competitionDetailData.finalTypeRefId}
            disabled={compDetailDisabled}
          >
            <Radio data-testid={AppUniqueId.GRADES} value={1}>
              {AppConstants.grades}
            </Radio>
            <Radio data-testid={AppUniqueId.POOLS} value={2}>
              {AppConstants.pools}
            </Radio>
          </Radio.Group>
        </Form.Item>
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <InputWithHead heading={AppConstants.compStartDate} required="required-field" />
              <Form.Item
                name="startDate"
                rules={[{ required: true, message: ValidationConstants.startDateIsRequired }]}
              >
                <DatePicker
                  size="default"
                  className="w-100"
                  data-testid={AppUniqueId.COMPETITION_START_DATE}
                  onChange={date => this.dateOnChangeFrom(date, 'startDate')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  disabled={compDetailDisabled}
                />
              </Form.Item>
            </div>
            <div className="col-sm">
              <InputWithHead heading={AppConstants.compCloseDate} required="required-field" />
              <Form.Item
                name="endDate"
                rules={[{ required: true, message: ValidationConstants.endDateIsRequired }]}
              >
                <DatePicker
                  size="default"
                  className="w-100"
                  data-testid={AppUniqueId.COMPETITION_END_DATE}
                  onChange={date => this.dateOnChangeFrom(date, 'endDate')}
                  format="DD-MM-YYYY"
                  placeholder="dd-mm-yyyy"
                  showTime={false}
                  disabledDate={d => !d || d.isBefore(detailsData.competitionDetailData.startDate)}
                  disabled={compDetailDisabled}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <InputWithHead
          heading={
            <div>
              {AppConstants.timeBetweenRounds}
              <CustomToolTip>
                <span>{AppConstants.timeBetweenRoundTip}</span>
              </CustomToolTip>
            </div>
          }
        />
        <div className="fluid-width">
          <div className="row">
            <div id={AppUniqueId.time_rounds_days} className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.days}
                data-testid={AppUniqueId.TIME_BETWEEN_ROUNDS_DAYS}
                value={detailsData.competitionDetailData.roundInDays}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInDays')
                }
                disabled={compDetailDisabled}
                heading={AppConstants._days}
                required={'pt-0'}
              />
            </div>
            <div id={AppUniqueId.time_rounds_hrs} className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.hours}
                value={detailsData.competitionDetailData.roundInHours}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInHours')
                }
                disabled={compDetailDisabled}
                heading={AppConstants._hours}
                required={'pt-0'}
              />
            </div>
            <div id={AppUniqueId.time_rounds_mins} className="col-sm">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.mins}
                value={detailsData.competitionDetailData.roundInMins}
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'roundInMins')
                }
                disabled={compDetailDisabled}
                heading={AppConstants._minutes}
                required={'pt-0'}
              />
            </div>
          </div>
        </div>
        <div className="inside-container-view pt-4">
          <InputWithHead heading={AppConstants.nonPlayingDates} />
          {detailsData.competitionDetailData.nonPlayingDates &&
            detailsData.competitionDetailData.nonPlayingDates.map((item, index) =>
              this.nonPlayingDateView(item, index),
            )}
          {compDetailDisabled ? null : (
            <a>
              <span
                onClick={() => (compDetailDisabled ? this.addNonPlayingDate() : null)}
                className="input-heading-add-another"
              >
                + {AppConstants.addAnotherNonPlayingDate}
              </span>
            </a>
          )}
        </div>

        <InputWithHead heading={AppConstants.playerInEachTeam} />
        <div className="fluid-width">
          <div className="row">
            <div id={AppUniqueId.team_min_players} className="col-sm-6">
              <InputWithHead
                auto_complete="off"
                placeholder={AppConstants.maxNumber}
                value={
                  detailsData.competitionDetailData.maximumPlayers == '0'
                    ? ''
                    : detailsData.competitionDetailData.maximumPlayers
                }
                onChange={e => this.updateMaximumPlayers(e.target.value)}
                disabled={compDetailDisabled}
                name="maximumPlayers"
              />
            </div>
          </div>
        </div>
        <span className="error-warning-span" visible={this.state.zeroErrorMsg.view}>
          {this.state.zeroErrorMsg.message}
        </span>

        {detailsData && detailsData.stateAllowsPlayerReplication && (
          <div>
            <InputWithHead heading={AppConstants.allowPlayerReplication} />
            <Form.Item
              name="allowPlayerReplication"
              initialValue={detailsData.competitionDetailData.allowPlayerReplication}
            >
              <Radio.Group
                disabled={compDetailDisabled}
                className="reg-competition-radio"
                onChange={e =>
                  this.props.add_editcompetitionFeeDeatils(e.target.value, 'allowPlayerReplication')
                }
                value={0}
              >
                <Radio value={1}>{AppConstants.yes}</Radio>
                <Radio value={0}>{AppConstants.no}</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        )}
        <div>
          <InputWithHead heading={AppConstants.playerPublishLabel} />
          <Radio.Group
            disabled={playerPublishOptionsDisabled}
            onChange={e =>
              this.props.add_editcompetitionFeeDeatils(e.target.value, 'playerPublishTypeRefId')
            }
            value={detailsData.competitionDetailData.playerPublishTypeRefId}
          >
            <Radio data-testid={AppUniqueId.PLAYERS_TO_APPEAR_IN_MATCH_DAY1} value={1}>
              {AppConstants.playerPublishOption1}
            </Radio>
            <Radio data-testid={AppUniqueId.PLAYERS_TO_APPEAR_IN_MATCH_DAY2} value={2}>
              {AppConstants.playerPublishOption2}
            </Radio>
          </Radio.Group>
        </div>
      </div>
    );
  };

  //////add or remove another division in the division tab
  addRemoveDivision = (index, item, keyword) => {
    if (this.state.competitionStatus == 1) {
    } else {
      if (keyword === 'add') {
        this.setState({
          IsCompleteAddDivision: false,
        });
        this.props.addRemoveDivisionAction(index, item, keyword);
      } else if (item.competitionDivisionId != 0) {
        this.setState({
          deleteDivModalVisible: true,
          divisionIndex: index,
          competitionDivision: item,
        });
      } else {
        this.props.addRemoveDivisionAction(index, this.state.competitionDivision, 'removeDivision');
        this.setDivisionFormFields();
        this.setState({
          IsCompleteAddDivision: true,
        });
      }
    }
  };

  handleDeleteDivision = key => {
    let deleteDrawsState = this.state.deleteDrawsState;
    if (key === 'ok') {
      if (deleteDrawsState.actionRefId == 2 && !deleteDrawsState.roundId) {
        message.error(AppConstants.selectARound);
        return;
      }
      this.setState({ deleteLoading: true });
      if (deleteDrawsState.actionRefId == 2) {
        let drawPayload = {
          competitionUniqueKey: this.state.firstTimeCompId,
          roundId: deleteDrawsState.roundId,
          divisionId: this.state.competitionDivision.competitionDivisionId,
          divisionGradeIds: null,
        };
        callDeleteDraws(drawPayload);
      }
      let payload = {
        competitionDivisionId: this.state.competitionDivision.competitionDivisionId,
      };
      this.props.addRemoveDivisionAction(
        this.state.divisionIndex,
        this.state.competitionDivision,
        'remove',
      );
      this.props.removeCompetitionDivisionAction(payload);
    }

    deleteDrawsState.actionRefId = 0;
    deleteDrawsState.roundId = null;
    this.setState({
      deleteDivModalVisible: false,
      secondDeleteDivModalVisible: false,
      deleteLoading: false,
    });
  };

  divisionsView = () => {
    let divisionData = this.props.competitionFeesState.competitionDivisionsData;
    let divisionArray = divisionData !== null ? divisionData : [];
    const divisionsDisabled = !this.state.permissionState?.division?.enabled;
    let roundsData = [];
    if (this.props.drawsState.getDrawsRoundsData) {
      roundsData = this.props.drawsState.getDrawsRoundsData.slice(1);
    }
    let hasRounds = roundsData && roundsData.length > 0;
    let deleteDrawsState = this.state.deleteDrawsState;

    return (
      <div className="fees-view pt-5">
        <div className="contextualHelp-RowDirection">
          <span className="form-heading required-field">{AppConstants.divisions}</span>
        </div>
        {divisionArray.length === 0 && (
          <span className="applicable-to-heading pt-0">{AppConstants.please_Sel_mem_pro}</span>
        )}
        {divisionArray.map((item, index) => (
          <div key={item.competitionMembershipProductId}>
            <div className="inside-container-view">
              <span className="form-heading pt-2 pl-2">{item.membershipProductName}</span>
              {item.isPlayingStatus ? (
                <div>
                  <div className="table-responsive content-responsive">
                    <Table
                      className="fees-table"
                      columns={divisionTableColumns}
                      dataSource={[...item.divisions]}
                      pagination={false}
                      rowKey="competitionDivisionId"
                    />
                  </div>
                  {divisionsDisabled ? null : (
                    <a>
                      <span
                        id={AppUniqueId.add_div_button}
                        className="input-heading-add-another"
                        data-testid={AppUniqueId.ADD_REGISTRATION_DIVISIONS}
                        onClick={() => {
                          if (this.state.IsCompleteAddDivision)
                            this.addRemoveDivision(index, item, 'add');
                        }}
                      >
                        {this.state.IsCompleteAddDivision
                          ? '+ ' + AppConstants.addDivision
                          : AppConstants.checking}
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <span className="applicable-to-heading pt-0 pl-2">
                  {AppConstants.nonPlayerDivisionMessage}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="contextualHelp-RowDirection mt-5">
          <span className="form-heading">{AppConstants.gradesOrPools}</span>
        </div>
        <GradePoolNames disabled={!this.state.permissionState?.division?.enabled} />

        <Modal
          className="add-membership-type-modal"
          title={AppConstants.deleteDivision}
          visible={this.state.deleteDivModalVisible}
          onOk={() =>
            this.setState({ deleteDivModalVisible: false, secondDeleteDivModalVisible: true })
          }
          onCancel={() => this.handleDeleteDivision('cancel')}
        >
          <p>{AppConstants.competitionDivisionValidation}</p>
          {hasRounds && (
            <>
              <p>{AppConstants.deleteDrawsForDivision}</p>
              <Radio.Group
                className="mb-3"
                onChange={e => {
                  deleteDrawsState.actionRefId = e.target.value;
                  this.setState({ updateUI: true });
                }}
                value={deleteDrawsState.actionRefId}
              >
                <Radio key={'actionRefId_1'} value={1}>
                  {AppConstants.no}
                </Radio>
                <Radio key={'actionRefId_2'} value={2}>
                  {AppConstants.yes}
                </Radio>
              </Radio.Group>

              {hasRounds && deleteDrawsState.actionRefId == 2 && (
                <>
                  <p>{AppConstants.fromWhichRound}</p>
                  <Select
                    className="year-select reg-filter-select1"
                    style={{ maxWidth: 150, minWidth: 150 }}
                    onChange={roundId => {
                      deleteDrawsState.roundId = roundId;
                      this.setState({ updateUI: true });
                    }}
                    value={deleteDrawsState.roundId}
                  >
                    {roundsData.map(item => (
                      <Option key={'round_' + item.roundId} value={item.roundId}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </>
              )}
            </>
          )}
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.deleteDivision}
          visible={this.state.secondDeleteDivModalVisible}
          onOk={() => this.handleDeleteDivision('ok')}
          onCancel={() => this.handleDeleteDivision('cancel')}
        >
          <p>{AppConstants.secondDeleteDivisionMessage}</p>
        </Modal>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.validateCompetitionDivision}
          visible={this.state.validateCompetitionDivisionlVisible}
          onOk={() => this.handleValidateDivision('ok')}
          onCancel={() => {
            this_Obj.divisionTableDataOnchange(
              '',
              this.state.selectedDivision.record,
              this.state.selectedDivision.index,
              'divisionName',
            );
            this.handleValidateDivision('cancel');
          }}
          okText={AppConstants.yes}
          cancelText={AppConstants.no}
        >
          <p>{AppConstants.addDivisionWithSameNameMessage}</p>
        </Modal>
      </div>
    );
  };

  //////delete the membership product
  showDeleteConfirm = () => {
    let competitionId = this.props.competitionFeesState.competitionId;
    let this_ = this;
    confirm({
      title: AppConstants.productDeleteConfirmMsg,
      // content: 'Some descriptions',
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk() {
        if (competitionId.length > 0) {
          this_.deleteProduct(competitionId);
        }
      },
      onCancel() {},
    });
  };

  deleteProduct = competitionId => {
    this.setState({ loading: true, buttonPressed: 'delete' });
    this.props.regCompetitionListDeleteAction(competitionId);
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    const isNewComp = this.checkIsNewComp();
    const { isCompCreator } = this.state;
    let tabKey = this.state.competitionTabKey;
    let isPublished = this.state.permissionState.isPublished;
    let drawsPublished = this.state.competitionStatus == 1;
    let hasRegistration = this.props.competitionFeesState.competitionDetailData.hasRegistration;
    let isPublishButton = tabKey === TabKey.Divisions && !this.state.isPublished;
    let isSaveButton = tabKey === TabKey.Divisions && this.state.isPublished;
    let enablePublish = isPublishButton && !hasRegistration;
    let shouldPublishInRegistation = isPublishButton && hasRegistration;
    let buttonPressed = isPublishButton ? 'publish' : isSaveButton ? 'save' : 'next';
    let competitionId = this.props.competitionFeesState.competitionId;
    return (!competitionId && !isNewComp) || !isCompCreator ? null : (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="reg-add-save-button">
              {isNewComp && !!competitionId ? (
                <Tooltip
                  className="h-100"
                  onMouseEnter={() => this.setState({ tooltipVisibleDelete: isPublished })}
                  onMouseLeave={() => this.setState({ tooltipVisibleDelete: false })}
                  visible={this.state.tooltipVisibleDelete}
                  title={ValidationConstants.compIsPublished}
                >
                  <Button
                    disabled={isPublished}
                    type="cancel-button"
                    onClick={() => this.showDeleteConfirm()}
                  >
                    {AppConstants.delete}
                  </Button>
                </Tooltip>
              ) : null}
            </div>
            {isNewComp ? null : (
              <div className="col-sm">
                <div className="reg-add-save-button">
                  <Button
                    id={AppUniqueId.compdiv_cancel_button}
                    disabled={drawsPublished}
                    className="cancelBtnWidth"
                    type="cancel-button"
                    onClick={() => history.push('/competitionDashboard')}
                  >
                    {AppConstants.back}
                  </Button>
                </div>
              </div>
            )}
            <div className="col-sm">
              {drawsPublished && tabKey == TabKey.Divisions ? (
                <div className="comp-buttons-view">
                  <Tooltip
                    className="h-100"
                    onMouseEnter={() => this.setState({ tooltipVisiblePublish: true })}
                    onMouseLeave={() => this.setState({ tooltipVisiblePublish: false })}
                    visible={this.state.tooltipVisiblePublish}
                    title={AppConstants.statusPublishHover}
                  >
                    <Button
                      id={AppUniqueId.compdiv_save_button}
                      className="publish-button save-draft-text"
                      type="primary"
                      disabled={drawsPublished}
                      htmlType="submit"
                      onClick={() =>
                        this.setState({
                          statusRefId: enablePublish || isSaveButton ? 2 : 1,
                          buttonPressed: buttonPressed,
                        })
                      }
                      style={{ width: 92.5 }}
                    >
                      {tabKey === TabKey.Divisions ? AppConstants.save : AppConstants.next}
                    </Button>
                  </Tooltip>
                  {tabKey == TabKey.Divisions && (
                    <Button
                      onClick={() =>
                        this.setState({
                          nextButtonClicked: true,
                          statusRefId: enablePublish || isSaveButton ? 2 : 1,
                        })
                      }
                      className="publish-button"
                      type="primary"
                      htmlType="submit"
                      disabled={drawsPublished}
                    >
                      {AppConstants.next}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="comp-buttons-view">
                  {isNewComp ? (
                    <Tooltip
                      className="h-100"
                      onMouseEnter={() => this.setState({ tooltipVisibleDraft: isPublished })}
                      onMouseLeave={() => this.setState({ tooltipVisibleDraft: false })}
                      visible={this.state.tooltipVisibleDraft}
                      title={ValidationConstants.compIsPublished}
                    >
                      <Button
                        id={AppUniqueId.compdiv_savedraft_button}
                        className="save-draft-text"
                        type="save-draft-text"
                        disabled={isPublished}
                        htmlType="submit"
                        onClick={() => this.setState({ statusRefId: 1, buttonPressed: 'save' })}
                      >
                        {AppConstants.saveAsDraft}
                      </Button>
                    </Tooltip>
                  ) : null}
                  <Tooltip
                    className="h-100"
                    onMouseEnter={() =>
                      this.setState({
                        tooltipVisiblePublish: shouldPublishInRegistation,
                      })
                    }
                    onMouseLeave={() => this.setState({ tooltipVisiblePublish: false })}
                    visible={this.state.tooltipVisiblePublish}
                    title={
                      shouldPublishInRegistation
                        ? ValidationConstants.publishedInRegistration
                        : ValidationConstants.compIsPublished
                    }
                  >
                    <Button
                      id={AppUniqueId.compdiv_save_button}
                      className="publish-button save-draft-text"
                      data-testid={AppUniqueId.NEXT_BUTTON}
                      type="primary"
                      disabled={drawsPublished || shouldPublishInRegistation}
                      htmlType="submit"
                      onClick={() =>
                        this.setState({
                          statusRefId: enablePublish || isSaveButton ? 2 : 1,
                          buttonPressed: buttonPressed,
                        })
                      }
                      style={{ width: 92.5 }}
                    >
                      {tabKey === TabKey.Divisions
                        ? this.state.isPublished
                          ? AppConstants.save
                          : AppConstants.publish
                        : AppConstants.next}
                    </Button>
                  </Tooltip>
                  {tabKey == TabKey.Divisions && !isNewComp && (
                    <Button
                      onClick={() =>
                        this.setState({
                          nextButtonClicked: true,
                          statusRefId: enablePublish || isSaveButton ? 2 : 1,
                        })
                      }
                      htmlType="submit"
                      className="publish-button"
                      type="primary"
                      disabled={
                        drawsPublished ||
                        shouldPublishInRegistation ||
                        !this.state.IsCompleteAddDivision
                      }
                    >
                      {AppConstants.next}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  tabCallBack = key => {
    let competitionId = this.props.competitionFeesState.competitionId;
    if (competitionId !== null && competitionId.length > 0) {
      this.setState({ competitionTabKey: key, divisionState: key == TabKey.Divisions });
    }
    this.setDetailsFieldValue();
  };

  onFinishFailed = errorInfo => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  preferenceRef = null;
  onPreferenceRef = ref => {
    this.preferenceRef = ref;
  };

  render() {
    const { hasInvitedAffiliates } = this.props.competitionFeesState;
    const isNewComp = this.checkIsNewComp();
    const regInviteesViewProps = {
      organisationTypeRefId: JSON.stringify(this.state.organisationTypeRefId),
      yearRefId: this.state.yearRefId,
      regInviteesDisable: !this.state.permissionState?.compDetails?.invitees?.enabled,
      isCompCreator: this.state.isCompCreator,
    };
    let competitionId = null;
    competitionId = this.props.location.state ? this.props.location.state.id : null;
    const key = this.props.location.state ? this.props.location.state.key : null;
    let hasRegistration = this.props.competitionFeesState?.competitionDetailData?.hasRegistration;
    let showNavigateView = !this.state.isRegClosed && hasRegistration == 1;
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.competitions}
          menuName={AppConstants.competitions}
        />
        <InnerHorizontalMenu
          menu="competition"
          compSelectedKey={key === 'part' || isNewComp ? '1' : '3'}
        />
        <Layout>
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.saveAPIsActionCall}
            onFinishFailed={err => {
              this.formRef.current.scrollToField(err.errorFields[0].name);
              this.onFinishFailed();
            }}
            initialValues={{
              competitionTypeRefId: 1,
              competitionFormatRefId: 1,
            }}
            noValidate="noValidate"
          >
            {this.headerView()}
            {isNewComp || !showNavigateView
              ? null
              : this.regCompetitionFeeNavigationView(competitionId)}
            {isNewComp || !competitionId ? null : this.dropdownView()}

            <Content>
              <div className="tab-view">
                <Tabs activeKey={this.state.competitionTabKey} onChange={this.tabCallBack}>
                  <TabPane tab={AppConstants.details} key={TabKey.Details}>
                    <div className="tab-formView mt-5">{this.contentView()}</div>
                    {
                      <div className="tab-formView mt-5">
                        <RegInviteesView {...regInviteesViewProps} />
                      </div>
                    }
                  </TabPane>
                  <TabPane tab={AppConstants.divisions} key={TabKey.Divisions}>
                    <div className="tab-formView">{this.divisionsView()}</div>
                  </TabPane>
                  {process.env.REACT_APP_TEAM_PREFERENCES_FOR_DRAW === 'true' && !isNewComp ? (
                    <TabPane tab={AppConstants.preferences} key={TabKey.Preferences}>
                      <div className="tab-formView">
                        <PreferenceTab
                          hasInvitedAffiliates={hasInvitedAffiliates}
                          key={this.state.firstTimeCompId}
                          competitionId={this.state.firstTimeCompId}
                          onRef={this.onPreferenceRef}
                          formRef={this.formRef}
                          disabled={!this.state.permissionState?.preference?.enabled}
                        />
                      </div>
                    </TabPane>
                  ) : null}
                </Tabs>
              </div>
              <Loader
                visible={
                  this.props.competitionFeesState.onLoad ||
                  this.props.appState.onLoad ||
                  this.state.getDataLoading ||
                  this.props.competitionFeesState.deleteDivisionLoad
                }
              />
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
      competitionFeeInit,
      getVenuesTypeAction,
      getAllCompetitionFeesDeatilsAction,
      saveCompetitionFeesDetailsAction,
      getDefaultCompFeesMembershipProductTabAction,
      saveCompetitionFeesDivisionAction,
      divisionTableDataOnchangeAction,
      addRemoveDivisionAction,
      paymentFeeDeafault,
      paymentSeasonalFee,
      paymentPerMatch,
      add_editcompetitionFeeDeatils,
      competitionDiscountTypesAction,
      getCommonDiscountTypeTypeAction,
      regCompetitionListDeleteAction,
      getDefaultCharity,
      getYearListAction,
      getCompetitionTypeListAction,
      clearCompReducerDataAction,
      getDefaultCompFeesLogoAction,
      getYearAndCompetitionOwnAction, //own_YearArr
      getYearAndCompetitionParticipateAction,
      searchVenueList,
      venueListAction,
      clearFilter,
      removeCompetitionDivisionAction,
      fixtureTemplateRoundsAction,
      getAffiliateOurOrganisationIdAction,
      getDrawsRoundsAction,
      getOnlyYearListAction,
      onInviteesSearchAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    competitionFeesState: state.CompetitionFeesState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
    competitionManagementState: state.CompetitionManagementState,
    userState: state.UserState,
    drawsState: state.CompetitionMultiDrawsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionOpenRegForm);

import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Checkbox,
  Button,
  Radio,
  Form,
  message,
  AutoComplete,
} from 'antd';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import { getliveScoreDivisions } from '../../store/actions/LiveScoreAction/liveScoreActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ValidationConstants from '../../themes/validationConstant';
import history from '../../util/history';
import {
  liveScoreManagerListAction,
  liveScoreManagerFilter,
  liveScoreClear,
  liveScoreManagerSearch,
} from '../../store/actions/LiveScoreAction/liveScoreManagerAction';
import {
  liveScoreAddTeamform,
  liveScoreGetDivision,
  liveScoreGetAffiliate,
  liveAddNewTeam,
  liveScoreGetTeamDataAction,
} from '../../store/actions/LiveScoreAction/liveScoreTeamAction';
import Loader from '../../customComponents/loader';
// import LoaderImg from 'react-loader-spinner'
import { setTimeout } from 'timers';
import { getLiveScoreCompetition, getUmpireCompetitionData } from '../../util/sessionStorage';
import ImageLoader from '../../customComponents/ImageLoader';
import {
  // isArrayNotEmpty,
  captializedString,
  regexNumberExpression,
  isImageFormatValid,
  isImageSizeValid,
} from '../../util/helpers';
import Tooltip from 'react-png-tooltip';
import { checkLivScoreCompIsParent } from 'util/permissions';

const { Header, Footer, Content } = Layout;
const { Option } = Select;

class LiveScoreAddTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      managerData: [],
      selectedFile: null,
      profileImage: AppImages.circleImage,
      //add
      competitionSelection: AppConstants.selectCompetition,
      divisionSelection: AppConstants.selectDivision,
      affiliateSelection: AppConstants.selectAffiliate,
      teamName: '',
      firstName: '',
      lastName: '',
      contactNo: '',
      emailAddress: '',
      competitionFormat: 'roundRobin',
      isEdit: this.props.location.state ? this.props.location.state.isEdit : null,
      teamId: props.location.state ? props.location.state.teamId : null,
      load: false,
      timeout: null,
      showOption: false,
      localCompetitionID: null,
      image: null,
      loading: false,
      progress: 0,
      key: props.location.state
        ? props.location.state.key
          ? props.location.state.key
          : null
        : null,
      screenName: this.props.location.state ? this.props.location.state.screenName : null,
      screenKey: this.props.location.state ? this.props.location.state.screenKey : null,
      sourceIdAvailable: false,
      liveScoreCompIsParent: false,
      compOrgId: 0,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let sourceIdAvailable = false;
    if (this.state.screenKey == 'umpire') {
      if (getUmpireCompetitionData()) {
        if (this.state.isEdit) {
          this.props.liveScoreGetTeamDataAction(this.state.teamId);
          this.setState({ load: true });
        } else {
          this.props.liveScoreAddTeamform({ key: 'addTeam' });
        }
        const { id, sourceId, competitionOrganisation } = JSON.parse(getUmpireCompetitionData());
        let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
        sourceIdAvailable = sourceId ? true : false;
        this.setState({
          localCompetitionID: id,
          sourceIdAvailable: sourceId ? true : false,
          compOrgId: compOrgId,
        });
        this.props.liveScoreGetDivision(id);
        this.props.liveScoreGetAffiliate({ id, name: '' });
        this.props.liveScoreManagerSearch('');
      } else {
        history.push('/matchDayCompetitions');
      }
    } else {
      this.setLivScoreCompIsParent();
      if (getLiveScoreCompetition()) {
        const { id, sourceId, competitionOrganisation } = JSON.parse(getLiveScoreCompetition());
        let compOrgId = competitionOrganisation ? competitionOrganisation.id : 0;
        if (this.state.isEdit) {
          this.props.liveScoreGetTeamDataAction(this.state.teamId);
          this.setState({ load: true, localCompetitionID: id });
        } else {
          this.props.liveScoreAddTeamform({ key: 'addTeam' });
        }
        sourceIdAvailable = sourceId ? true : false;
        this.setState({
          localCompetitionID: id,
          sourceIdAvailable: sourceId ? true : false,
          compOrgId: compOrgId,
        });
        this.props.liveScoreGetDivision(id);
        this.props.liveScoreGetAffiliate({ id, name: '' });
        this.props.liveScoreManagerSearch('');
      } else {
        history.push('/matchDayCompetitions');
      }
    }
    let isEditCheck = this.props.location.state ? this.props.location.state.isEdit : false;
    if (sourceIdAvailable && isEditCheck === false) {
      history.push('/matchDayTeam');
    }
  }

  setLivScoreCompIsParent = () => {
    const liveScoreCompIsParent = checkLivScoreCompIsParent();
    this.setState({ liveScoreCompIsParent });
  };

  componentDidUpdate(nextProps) {
    let { teamManagerData } = this.props.liveScoreTeamState;

    if (this.state.isEdit) {
      if (nextProps.liveScoreTeamState !== this.props.liveScoreTeamState) {
        if (this.props.liveScoreTeamState.teamLoad == false && this.state.load) {
          this.setInitialFieldValue(teamManagerData);
          this.setState({ load: false });
        }
      }
    }
  }

  ////set initial value for all validated fields
  setInitialFieldValue(data) {
    const { selectedManager } = this.props.liveScoreTeamState;
    this.formRef.current.setFieldsValue({
      teamName: data ? data.name : null,
      teamAlias: data ? data.alias : null,
      division: data ? data.divisionId : null,
      affiliate: data && data.competitionOrganisationId,
      managerId: selectedManager,
    });
  }

  setImage_1 = data => {
    if (data.files[0] !== undefined) {
      let profileImage = URL.createObjectURL(data.files[0]);
      this.setState({ image: data.files[0], profileImage: profileImage });
      this.props.liveScoreAddTeamform({ key: 'logoUrl', data: profileImage });
    }
  };

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
      let profileImage = URL.createObjectURL(data.files[0]);
      this.setState({ image: data.files[0], profileImage: profileImage, timeout: 2000 });
      this.props.liveScoreAddTeamform({ key: 'logoUrl', data: profileImage });
      setTimeout(() => {
        this.setState({ timeout: null });
      }, 2000);
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

  onRadioSwitch(e) {
    this.props.liveScoreAddTeamform({ key: 'managerType', data: e.target.value });
    this.setState({ load: true });
  }

  headerView = () => {
    let isEdit = this.props.location.state ? this.props.location.state.isEdit : null;
    return (
      <div className="header-view">
        <Header className="form-header-view d-flex bg-transparent align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {isEdit ? AppConstants.editTeam : AppConstants.addTeam}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  radioBtnGroup(e) {
    const { selectedManager } = this.props.liveScoreTeamState;
    this.props.liveScoreAddTeamform({ key: 'managerType', data: e.target.value });
    this.formRef.current.setFieldsValue({
      managerId: selectedManager,
    });
  }

  contentView = () => {
    const {
      teamManagerData,
      affilateList,
      divisionList,
      managerType,
      // logoUrl
    } = this.props.liveScoreTeamState;
    // let name = teamManagerData.name
    let alias = teamManagerData ? teamManagerData.alias : null;
    return (
      <div className="content-view pt-4 pb-4">
        <Form.Item
          name="teamName"
          rules={[{ required: true, message: ValidationConstants.teamName }]}
        >
          <InputWithHead
            auto_complete="off"
            required="required-field pt-0 "
            heading={AppConstants.teamName}
            placeholder={AppConstants.enterTeamName}
            onChange={event => {
              this.props.liveScoreAddTeamform({
                key: 'name',
                data: captializedString(event.target.value),
              });
            }}
            // value={captializedString(name)}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                teamName: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>
        <InputWithHead
          auto_complete="off"
          heading="Team Alias"
          placeholder="Team Alias"
          conceptulHelp
          conceptulHelpMsg={AppConstants.teamAliasMsg}
          onChange={event => {
            this.props.liveScoreAddTeamform({
              key: 'alias',
              data: captializedString(event.target.value),
            });
          }}
          value={alias}
        />

        <span className="form-err">{this.state.teanmNameError}</span>

        <InputWithHead heading={AppConstants.teamLogo} required="pt-3" />
        <div className="fluid-width">
          <div className="row">
            <div className="col-sm">
              <div className="reg-competition-logo-view" onClick={this.selectImage}>
                <ImageLoader
                  timeout={this.state.timeout}
                  src={
                    teamManagerData && teamManagerData.logoUrl
                      ? teamManagerData.logoUrl
                      : AppImages.circleImage
                  }
                />
              </div>
              <input
                type="file"
                id="user-pic"
                className="d-none"
                // onChange={(evt) => {
                //     this.setImage(evt.target)
                //     this.setState({ timeout: 2000 })
                //     setTimeout(() => {
                //         this.setState({ timeout: null })
                //     }, 2000);
                // }}
                onChange={evt => this.setImage(evt.target)}
                onClick={event => {
                  event.target.value = null;
                }}
              />
              <span className="form-err">{this.state.imageError}</span>
            </div>
            <div className="col-sm d-flex align-items-center">
              <Checkbox
                className="single-checkbox"
                // defaultChecked={false}
                checked={this.props.liveScoreTeamState.isCheked}
                onChange={value => {
                  this.props.liveScoreAddTeamform({ key: 'checkBox', data: value.target.checked });
                  this.setState({ image: null });
                }}
              >
                {AppConstants.useClubLogo}
              </Checkbox>
            </div>
          </div>
          <span className="image-size-format-text">{AppConstants.imageSizeFormatText}</span>
        </div>

        <div className="row">
          <div className="col-sm">
            <InputWithHead required="required-field" heading={AppConstants.division} />
            <Form.Item
              name="division"
              rules={[{ required: true, message: ValidationConstants.divisionField }]}
            >
              <Select
                disabled={!this.state.liveScoreCompIsParent || this.state.sourceIdAvailable}
                showSearch
                optionFilterProp="children"
                className="w-100"
                style={{ paddingRight: 1, minWidth: 182 }}
                onChange={divisionSelection => {
                  this.props.liveScoreAddTeamform({ key: 'divisionId', data: divisionSelection });
                }}
                // value={teamManagerData.divisionId}
                placeholder="Select Division"
              >
                {divisionList.map(item => (
                  <Option key={'division_' + item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        <InputWithHead required="required-field" heading={AppConstants.affiliate} />
        <div>
          <Form.Item
            name="affiliate"
            rules={[{ required: true, message: ValidationConstants.affiliateField }]}
          >
            <Select
              className="w-100"
              style={{ paddingRight: 1, minWidth: 182 }}
              disabled={!this.state.liveScoreCompIsParent}
              onChange={affiliateId => {
                this.props.liveScoreAddTeamform({ key: 'organisationId', data: affiliateId });
              }}
              // value={teamManagerData.divisionId}
              placeholder="Select Affiliate"
            >
              {affilateList.map(item => (
                <Option key={'affiliate_' + item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="row">
          <span required="required-field" className="applicable-to-heading ml-4 mb-3">
            {AppConstants.manager}
          </span>
          {/* <InputWithHead required={"required-field ml-4"} heading={AppConstants.managerHeading} /> */}

          <Radio.Group
            className="reg-competition-radio"
            onChange={e => {
              this.onRadioSwitch(e);
            }}
            style={{
              overflowX: 'unset',
            }}
            value={managerType}
          >
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

              {/* <div className="d-flex align-items-center" style={{ marginLeft: -15 }}> */}
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
        {managerType == 'new' && this.managerNewRadioBtnView()}
        {managerType == 'existing' && this.managerExistingRadioBtnView()}
      </div>
    );
  };

  managerExistingRadioBtnView() {
    // let grade = this.state.managerData
    // const { selectedManager } = this.props.liveScoreTeamState
    const { managerList } = this.props.liveScoreTeamState;
    let { managerListResult } = this.props.liveScoreManagerState;
    if (managerListResult.length == 0) {
      managerListResult = managerList;
    }
    return (
      <div>
        <InputWithHead heading={AppConstants.managerSearch} required="required-field pb-0" />
        <div>
          <Form.Item
            name="managerId"
            rules={[{ required: true, message: ValidationConstants.searchManager }]}
          >
            <Select
              showSearch
              mode="multiple"
              placeholder={AppConstants.searchManager}
              className="w-100"
              onChange={e => {
                this.props.liveScoreAddTeamform({ key: 'userIds', data: e });
              }}
              onSearch={value => {
                this.props.liveScoreManagerSearch(value);
              }}
              optionFilterProp="children"
              // onSearch={(value) => {
              //     this.setState({ showOption: true })
              //     const filteredData = this.props.liveScoreManagerState.MainManagerListResult.filter(data => {
              //         return data.firstName.indexOf(value) > -1
              //     })
              //     this.props.liveScoreManagerFilter(filteredData)
              // }}
              // value={selectedManager}
            >
              {/* {this.state.showOption ?  */}
              {managerListResult.map(item => (
                <Option key={'manager_' + item.id} value={item.id}>
                  {item.nameWithNumber}
                </Option>
              ))}
              {/* : null} */}
            </Select>
          </Form.Item>
        </div>
      </div>
    );
  }

  onChangeNumber = number => {
    const {
      // selectedManager,
      teamManagerData,
    } = this.props.liveScoreTeamState;
    if (number.length === 10) {
      this.setState({
        hasError: false,
      });
      this.props.liveScoreAddTeamform({ key: 'mobileNumber', data: regexNumberExpression(number) });
    } else if (number.length < 10) {
      this.props.liveScoreAddTeamform({ key: 'mobileNumber', data: regexNumberExpression(number) });
      this.setState({
        hasError: true,
      });
    }
    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        contactNo: teamManagerData.mobileNumber,
      });
    }, 500);
  };

  managerNewRadioBtnView() {
    // const { teamManagerData } = this.props.liveScoreTeamState
    let hasError = this.state.hasError;
    return (
      <div>
        <div className="row">
          <div className="col-sm">
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
            >
              <InputWithHead
                auto_complete="new-password"
                required="required-field pt-0 pb-0"
                heading={AppConstants.firstName}
                placeholder={AppConstants.enterFirstName}
                onChange={event => {
                  this.props.liveScoreAddTeamform({
                    key: 'firstName',
                    data: captializedString(event.target.value),
                  });
                }}
                // value={teamManagerData.firstName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    firstName: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>
            <span className="form-err">{this.state.firstNameError}</span>
          </div>
          <div className="col-sm">
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: ValidationConstants.nameField[1] }]}
            >
              <InputWithHead
                auto_complete="off"
                required="required-field pt-0 pb-0"
                heading={AppConstants.lastName}
                placeholder={AppConstants.enterLastName}
                onChange={event => {
                  this.props.liveScoreAddTeamform({
                    key: 'lastName',
                    data: captializedString(event.target.value),
                  });
                }}
                // value={teamManagerData.lastName}
                onBlur={i =>
                  this.formRef.current.setFieldsValue({
                    lastName: captializedString(i.target.value),
                  })
                }
              />
            </Form.Item>

            <span className="form-err">{this.state.lastNameError}</span>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
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
                auto_complete="new-email"
                required="required-field pt-0 pb-0"
                heading={AppConstants.emailAdd}
                placeholder={AppConstants.enterEmail}
                onChange={event => {
                  this.props.liveScoreAddTeamform({ key: 'email', data: event.target.value });
                }}
                // value={teamManagerData.email}
              />
            </Form.Item>

            <span className="form-err">{this.state.emailAddressError}</span>
          </div>
          <div className="col-sm">
            <Form.Item
              name="contactNo"
              rules={[{ required: true, message: ValidationConstants.contactField }]}
              help={hasError && ValidationConstants.mobileLength}
              validateStatus={hasError ? 'error' : 'validating'}
            >
              <InputWithHead
                auto_complete="new-contact"
                required="required-field pt-0 pb-0"
                heading={AppConstants.contactNO}
                placeholder={AppConstants.enterContactNo}
                maxLength={10}
                onChange={mobileNumber => this.onChangeNumber(mobileNumber.target.value)}
                // value={teamManagerData.mobileNumber}
              />
            </Form.Item>

            <span className="form-err">{this.state.contactNoError}</span>
          </div>
        </div>
      </div>
    );
  }

  //////footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm">
              <div className="reg-add-save-button">
                <Button
                  onClick={() => history.push('/matchDayTeam')}
                  className="cancelBtnWidth"
                  type="cancel-button"
                >
                  {AppConstants.cancel}
                </Button>
              </div>
            </div>
            <div className="col-sm">
              <div className="comp-buttons-view">
                <Button
                  className="publish-button save-draft-text"
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

  handleSubmit = e => {
    let compId = null;
    if (this.state.screenKey == 'umpire') {
      const { id } = JSON.parse(getUmpireCompetitionData());
      compId = id;
    } else {
      const { id } = JSON.parse(getLiveScoreCompetition());
      compId = id;
    }

    const { mobileNumber } = this.props.liveScoreTeamState.teamManagerData;

    if (this.props.liveScoreTeamState.managerType === 'new' && mobileNumber.length !== 10) {
      this.setState({
        hasError: true,
      });
    } else {
      let {
        name,
        alias,
        // logoUrl,
        // teamLogo,
        divisionId,
        organisationId,
        userIds,
        firstName,
        lastName,
        mobileNumber,
        email,
        teamUniqueKey,
        competitionOrganisationId,
      } = this.props.liveScoreTeamState.teamManagerData;
      if (!organisationId) {
        organisationId = competitionOrganisationId;
      }
      // let isCheked = this.props.liveScoreTeamState
      let usersArray = JSON.stringify(userIds);
      if (this.props.liveScoreTeamState.managerType === 'existing') {
        const formData = new FormData();

        if (this.state.teamId !== null) {
          formData.append('id', this.state.teamId);
        }

        formData.append('name', captializedString(name));

        if (alias) {
          formData.append('alias', captializedString(alias));
        }

        if (this.state.image) {
          formData.append('logo', this.state.image);
          if (this.props.liveScoreTeamState.teamLogo) {
            formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
          }
        } else if (this.props.liveScoreTeamState.teamLogo) {
          formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
        }

        formData.append('competitionId', compId);
        formData.append('competitionOrganisationId', organisationId);
        formData.append('divisionId', divisionId);
        formData.append('userIds', usersArray);

        if (firstName && lastName && mobileNumber && email) {
          formData.append('firstName', firstName);
          formData.append('lastName', lastName);
          formData.append('mobileNumber', regexNumberExpression(mobileNumber));
          formData.append('email', email);
        }
        this.props.liveAddNewTeam(
          formData,
          this.state.teamId,
          this.state.key,
          this.state.screenKey,
          this.state.sourceIdAvailable,
          teamUniqueKey,
        );
      } else if (this.props.liveScoreTeamState.managerType === 'new') {
        const formData = new FormData();
        if (this.state.teamId) {
          formData.append('id', this.state.teamId);
        }
        formData.append('name', name);
        if (alias) {
          formData.append('alias', alias);
        }
        if (this.state.image) {
          formData.append('logo', this.state.image);
          if (this.props.liveScoreTeamState.teamLogo) {
            formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
          }
        } else if (this.props.liveScoreTeamState.teamLogo) {
          formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
        }
        formData.append('competitionId', compId);
        formData.append('competitionOrganisationId', organisationId);
        formData.append('divisionId', divisionId);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('mobileNumber', regexNumberExpression(mobileNumber));
        formData.append('email', email);
        if (userIds.length > 0) {
          formData.append('userIds', usersArray);
        }
        this.props.liveAddNewTeam(
          formData,
          this.state.teamId,
          this.state.key,
          this.state.screenKey,
          this.state.sourceIdAvailable,
          teamUniqueKey,
        );
      } else {
        // message.config({ duration: 0.9, maxCount: 1 })
        // message.error('Please select manager section.')
        const formData = new FormData();
        if (this.state.teamId) {
          formData.append('id', this.state.teamId);
        }
        formData.append('name', name);
        if (alias) {
          formData.append('alias', alias);
        }
        if (this.state.image) {
          formData.append('logo', this.state.image);
          if (this.props.liveScoreTeamState.teamLogo) {
            formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
          }
        } else if (this.props.liveScoreTeamState.teamLogo) {
          formData.append('logoUrl', this.props.liveScoreTeamState.teamLogo);
        }
        formData.append('competitionId', compId);
        formData.append('competitionOrganisationId', organisationId);
        formData.append('divisionId', divisionId);
        this.props.liveAddNewTeam(
          formData,
          this.state.teamId,
          this.state.key,
          this.state.screenKey,
          this.state.sourceIdAvailable,
          teamUniqueKey,
        );
      }
    }
  };

  /////main render method
  render() {
    const { screenName } = this.state;
    return (
      <div className="fluid-width default-bg">
        {screenName == 'userPersonal' ? (
          <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        ) : (
          <DashboardLayout
            menuHeading={AppConstants.matchDay}
            menuName={AppConstants.liveScores}
            onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
          />
        )}
        {screenName == 'userPersonal' ? (
          <InnerHorizontalMenu menu={'user'} userSelectedKey={'1'} />
        ) : (
          <InnerHorizontalMenu menu={'liveScore'} liveScoreSelectedKey={'3'} />
        )}
        <Loader visible={this.props.liveScoreTeamState.onLoad} />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.handleSubmit}
            noValidate="noValidate"
          >
            <Content>
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
      getliveScoreDivisions,
      liveScoreAddTeamform,
      liveScoreGetDivision,
      liveScoreGetAffiliate,
      liveAddNewTeam,
      liveScoreManagerListAction,
      liveScoreGetTeamDataAction,
      liveScoreManagerFilter,
      liveScoreClear,
      liveScoreManagerSearch,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreTeamState: state.LiveScoreTeamState,
    liveScoreState: state.LiveScoreState,
    liveScoreManagerState: state.LiveScoreManagerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreAddTeam);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Breadcrumb,
  Button,
  Checkbox,
  Form,
  message,
  Modal,
} from 'antd';
import moment from 'moment';

import './user.css';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import ValidationConstants from '../../themes/validationConstant';
import AppImages from '../../themes/appImages';
import InputWithHead from '../../customComponents/InputWithHead';
import {
  isArrayNotEmpty,
  getAge,
  deepCopyFunction,
  captializedString,
  regexNumberExpression,
} from '../../util/helpers';
import { getGenderAction } from '../../store/actions/commonAction/commonAction';
import {
  teamMemberSaveUpdateAction,
  teamMembersSaveAction,
  getUserModulePersonalDetailsAction,
  getTeamMembersAction,
} from '../../store/actions/userAction/userAction';
import { membershipProductEndUserRegistrationAction } from '../../store/actions/registrationAction/endUserRegistrationAction';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import {
  showMemberTypeValidation,
  showMemberEmailValidation,
  showMemberDetailValidation,
  checkDobDivisionRestriction,
} from '../../util/teamMemberHelper';

const { Footer, Content } = Layout;

class AddTeamMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: this.props.location.state ? this.props.location.state.registrationTeam : null,
      teamMemberRegId: this.props.location.state ? this.props.location.state.teamMemberRegId : null,
      getMembershipProductsInfoOnLoad: false,
      teamMembersSaveOnLoad: false,
      getTeamMembersOnLoad: false,
      addTeamSaveErrorPopUpVisible: false,
      buttonSubmitted: false,
      hasErrorTeamMember: [],
      hasErrorTeamMemberParent: [],
    };
    this.props.teamMemberSaveUpdateAction(this.state.teamMemberRegId, 'teamMemberRegId');
    this.props.teamMemberSaveUpdateAction(this.state.team, 'team');
    this.formRef = React.createRef();
    this.props.getGenderAction();
    this.props.getUserModulePersonalDetailsAction({
      userId: this.state.team.userId,
      organisationId: null,
    });
  }

  componentDidMount() {
    if (this.state.teamMemberRegId) {
      this.props.getTeamMembersAction(this.state.teamMemberRegId);
      this.setState({ getTeamMembersOnLoad: true });
    }
    this.getMembershipProductsInfo();
  }

  componentDidUpdate(nextProps) {
    try {
      let userState = this.props.userState;
      if (userState != nextProps) {
        if (userState.teamMembersSaveOnLoad == false && this.state.teamMembersSaveOnLoad == true) {
          this.setState({ teamMembersSaveOnLoad: false });
          if (userState.status == 1) {
            if (userState.teamMembersSaveErrorMsg) {
              this.setState({ addTeamSaveErrorPopUpVisible: true });
            } else {
              if (userState.teamMemberRegId) {
                history.push('/teamMemberRegPayment', {
                  team: this.state.team,
                  teamMemberRegId: userState.teamMemberRegId,
                });
              }
            }
          }
        }
        if (userState.getTeamMembersOnLoad == false && this.state.getTeamMembersOnLoad == true) {
          this.setState({ getTeamMembersOnLoad: false });
          this.setTeamMembersFormFieldsValue();
        }
        if (userState.teamMemberDeletion == true) {
          this.props.teamMemberSaveUpdateAction(false, 'teamMemberDeletion');
          this.setTeamMembersFormFieldsValue();
        }
        if (userState.addTeamMember == true) {
          this.props.teamMemberSaveUpdateAction(false, 'addTeamMember');
          this.setTeamMembersFormFieldsValue();
        }
      }
    } catch (ex) {
      console.log(`Error in componentDidUpdate::${ex}`);
    }
  }

  setTeamMembersParentsFormFieldsValue = (index, parentIndex, parent) => {
    this.formRef.current.setFieldsValue({
      [`teamMemberParentFirstName${index}${parentIndex}`]: parent.firstName,
      [`teamMemberParentMiddleName${index}${parentIndex}`]: parent.middleName,
      [`teamMemberParentLastName${index}${parentIndex}`]: parent.lastName,
      [`teamMemberParentMobileNumber${index}${parentIndex}`]: parent.mobileNumber,
      [`teamMemberParentEmail${index}${parentIndex}`]: parent.email,
    });
  };

  setTeamMembersFormFieldsValue = () => {
    try {
      const { teamMembersSave } = this.props.userState;
      let teamMembers = teamMembersSave.teamMembers ? teamMembersSave.teamMembers : [];
      for (let i in teamMembers) {
        this.formRef.current.setFieldsValue({
          [`teamMemberFirstName${i}`]: teamMembers[i].firstName,
          [`teamMemberMiddleName${i}`]: teamMembers[i].middleName,
          [`teamMemberLastName${i}`]: teamMembers[i].lastName,
          [`teamMemberDateOfBirth${i}`]: teamMembers[i].dateOfBirth,
          [`teamMemberMobileNumber${i}`]: teamMembers[i].mobileNumber,
          [`teamMemberDateOfBirth${i}`]: teamMembers[i].dateOfBirth
            ? moment(teamMembers[i].dateOfBirth, 'MM-DD-YYYY')
            : null,
          [`teamMemberMobileNumber${i}`]: teamMembers[i].mobileNumber,
          [`teamMemberEmail${i}`]: teamMembers[i].email,
          [`teamMemberGenderRefId${i}`]: teamMembers[i].genderRefId,
          [`teamMemberEmergencyFirstName${i}`]: teamMembers[i].emergencyFirstName,
          [`teamMemberEmergencyLastName${i}`]: teamMembers[i].emergencyLastName,
          [`teamMemberEmergencyContactNumber${i}`]: teamMembers[i].emergencyContactNumber,
        });
        if (isArrayNotEmpty(teamMembers[i].parentOrGuardian)) {
          for (let j in teamMembers[i].parentOrGuardian) {
            this.setTeamMembersParentsFormFieldsValue(i, j, teamMembers[i].parentOrGuardian[j]);
          }
        }
      }
    } catch (ex) {
      console.log('Error in setTeamMembersFormFieldsValue::' + ex);
    }
  };

  getMembershipProductsInfo = () => {
    try {
      const payload = {
        organisationUniqueKey: this.state.team.organisationUniqueKey,
        competitionUniqueKey: this.state.team.competitionUniqueKey,
        fromAddTeamMember: 1,
      };
      this.props.membershipProductEndUserRegistrationAction(payload);
      this.setState({ getMembershipProductsInfoOnLoad: true });
    } catch (ex) {
      console.log(`Error in getMembershipProductsInfo::${ex}`);
    }
  };

  clearTeamMemberParentDetails = (teamMember, parentIndex) => {
    const { teamMembersSave } = this.props.userState;
    teamMember.parentOrGuardian[parentIndex].firstName = null;
    teamMember.parentOrGuardian[parentIndex].lastName = null;
    teamMember.parentOrGuardian[parentIndex].middleName = null;
    teamMember.parentOrGuardian[parentIndex].dateOfBirth = null;
    teamMember.parentOrGuardian[parentIndex].mobileNumber = null;
    teamMember.parentOrGuardian[parentIndex].email = null;
    this.props.teamMemberSaveUpdateAction(teamMembersSave, 'teamMembersSave');
  };

  onChangeTeamMemberSaveUpdate = (data, key, index, subIndex) => {
    const { teamMembersSave, personalData } = this.props.userState;
    if (key == 'mobileNumber') {
      if (data.length == 10) {
        this.props.teamMemberSaveUpdateAction(regexNumberExpression(data), key, index, subIndex);
        let hasError = this.state.hasErrorTeamMember;
        let obj = hasError.find(element => element.teamMemberIndex == index);
        if (obj != undefined) {
          hasError.splice(hasError.indexOf(obj), 1);
        }
        this.setState({
          hasErrorTeamMember: hasError,
        });
      } else if (data.length < 10) {
        this.props.teamMemberSaveUpdateAction(regexNumberExpression(data), key, index, subIndex);
        let hasError = this.state.hasErrorTeamMember;
        let obj = hasError.find(element => element.teamMemberIndex == index);

        if (obj == undefined) {
          hasError.push({
            error: true,
            teamMemberIndex: index,
          });
        }
        this.setState({
          hasErrorTeamMember: hasError,
        });

        if (!regexNumberExpression(data)) {
          setTimeout(() => {
            this.formRef.current.setFieldsValue({
              [`teamMemberMobileNumber${index}`]: null,
            });
          }, 300);
        }
      }
      setTimeout(() => {
        this.formRef.current.setFieldsValue({
          [`teamMemberMobileNumber${index}`]: teamMembersSave.teamMembers[index].mobileNumber,
        });
      }, 300);
    } else {
      this.props.teamMemberSaveUpdateAction(data, key, index, subIndex);
    }
    if (key === 'isRegistererAsParent') {
      if (data) {
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex][key] = data;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].firstName =
          personalData.firstName;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].lastName =
          personalData.lastName;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].middleName =
          personalData.middleName;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].email = personalData.email;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].dateOfBirth =
          personalData.dateOfBirth;
        teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].mobileNumber =
          personalData.mobileNumber;
        this.props.teamMemberSaveUpdateAction(teamMembersSave, 'teamMembersSave');
      } else {
        this.clearTeamMemberParentDetails(teamMembersSave.teamMembers[index], subIndex);
      }
      setTimeout(() => {
        this.setTeamMembersParentsFormFieldsValue(
          index,
          subIndex,
          teamMembersSave.teamMembers[index].parentOrGuardian[subIndex],
        );
      }, 500);
    }
  };

  getParentObj = () => {
    return {
      tempParentId: null,
      userId: 0,
      firstName: null,
      middleName: null,
      lastName: null,
      mobileNumber: null,
      email: null,
      street1: null,
      street2: null,
      suburb: null,
      stateRefId: null,
      countryRefId: 1,
      postalCode: null,
      isSameAddress: false,
      // selectAddressFlag: true,
      addNewAddressFlag: true,
      manualEnterAddressFlag: false,
    };
  };

  addTeamMemberParent = (key, teamMemberIndex, teamMemberParentIndex) => {
    try {
      const { teamMembersSave } = this.props.userState;
      const teamMembers = teamMembersSave?.teamMembers ? teamMembersSave?.teamMembers : [];
      const teamMember = teamMembers[teamMemberIndex];
      if (key === 'add') {
        const parentObj = deepCopyFunction(this.getParentObj());
        parentObj.tempParentId = teamMember.parentOrGuardian.length + 1;
        teamMember.parentOrGuardian.push(parentObj);
      }
      if (key === 'remove') {
        teamMember.parentOrGuardian.splice(teamMemberParentIndex, 1);
      }
      if (key === 'removeAllParent') {
        teamMember.parentOrGuardian = [];
      }
      this.props.teamMemberSaveUpdateAction(teamMembersSave, 'teamMembersSave');
    } catch (ex) {
      console.log(`Error in addTeamMemberParent::${ex}`);
    }
  };

  teamMemberAddingProcess = (dob, payingFor, teamMember, teamMemberIndex) => {
    try {
      if (getAge(dob) <= 18 && payingFor == 1) {
        if (!isArrayNotEmpty(teamMember.parentOrGuardian)) {
          this.addTeamMemberParent('add', teamMemberIndex);
        }
      } else {
        this.addTeamMemberParent('removeAllParent', teamMemberIndex);
      }
    } catch (ex) {
      console.log(`Error in teamMemberAddingProcess::${ex}`);
    }
  };

  dateConversion = (f, key, teamMember, teamMemberIndex) => {
    try {
      const date = moment(f, 'DD-MM-YYYY').format('MM-DD-YYYY');
      this.onChangeTeamMemberSaveUpdate(date, key, teamMemberIndex);
      this.teamMemberAddingProcess(date, teamMember.payingFor, teamMember, teamMemberIndex);
    } catch (ex) {
      console.log(`Error in dateConversion::${ex}`);
    }
  };

  onChangeSetTeamMemberParentValue = (data, key, index, subIndex) => {
    try {
      const { teamMembersSave } = this.props.userState;
      const teamMembers = teamMembersSave?.teamMembers ? teamMembersSave?.teamMembers : [];
      const teamMember = teamMembers[index];
      const parent = teamMember?.parentOrGuardian[subIndex];

      if (key == 'mobileNumber') {
        if (data.length == 10) {
          parent[key] = regexNumberExpression(data);
          let hasError = this.state.hasErrorTeamMemberParent;
          let obj = hasError.find(
            element =>
              element.teamMemberIndex == index && element.teamMemberParentIndex == subIndex,
          );
          if (obj != undefined) {
            hasError.splice(hasError.indexOf(obj), 1);
          }
          this.setState({
            hasErrorTeamMember: hasError,
          });
        } else if (data.length < 10) {
          parent[key] = regexNumberExpression(data);
          let hasError = this.state.hasErrorTeamMemberParent;
          let obj = hasError.find(
            element =>
              element.teamMemberIndex == index && element.teamMemberParentIndex == subIndex,
          );

          if (obj == undefined) {
            hasError.push({
              error: true,
              teamMemberIndex: index,
              teamMemberParentIndex: subIndex,
            });
          }
          this.setState({
            hasErrorTeamMember: hasError,
          });

          if (!regexNumberExpression(data)) {
            setTimeout(() => {
              this.formRef.current.setFieldsValue({
                [`teamMemberParentMobileNumber${index}${subIndex}`]: null,
              });
            }, 300);
          }
        }
        setTimeout(() => {
          this.formRef.current.setFieldsValue({
            [`teamMemberParentMobileNumber${index}${subIndex}`]:
              teamMembersSave.teamMembers[index].parentOrGuardian[subIndex].mobileNumber,
          });
        }, 300);
      } else {
        parent[key] = data;
      }
      this.props.teamMemberSaveUpdateAction(teamMembersSave, 'teamMembersSave');
    } catch (ex) {
      console.log(`Error in onChangeSetTeamMemberParentValue::${ex}`);
    }
  };

  getDivisions = () => {
    try {
      const { membershipProductInfo } = this.props.userState;
      const { team } = this.state;
      const membershipProducts = membershipProductInfo[0].competitions[0].membershipProducts;
      const membershipProduct = membershipProducts.find(
        x =>
          x.competitionMembershipProductId == team.competitionMembershipProductId &&
          x.competitionMembershipProductTypeId == team.competitionMembershipProductTypeId,
      );
      const division = membershipProduct.divisions.find(
        x =>
          x.competitionMembershipProductDivisionId == team.competitionMembershipProductDivisionId,
      );
      if (division) {
        return [
          {
            divisionName: division.divisionName,
            competitionMembershipProductTypeId: division.competitionMembershipProductTypeId,
            competitionMembershipProductDivisionId: division.competitionMembershipProductDivisionId,
            fromDate: division.fromDate,
            toDate: division.toDate,
            genderRefId: division.genderRefId,
          },
        ];
      }
    } catch (ex) {
      console.log(`Error in getDivisions::${ex}`);
    }
  };

  getUpdateTeamMembersSave = teamMembersSave => {
    try {
      const { personalData } = this.props.userState;
      teamMembersSave.divisions = this.getDivisions();
      teamMembersSave.organisationId = this.state.team.organisationUniqueKey;
      teamMembersSave.competitionId = this.state.team.competitionUniqueKey;
      teamMembersSave.teamId = this.state.team.teamId;
      teamMembersSave.teamName = this.state.team.teamName;
      teamMembersSave.registeringPersonUserId = this.state.team.userId;
      teamMembersSave.name = this.state.team.name;
      teamMembersSave.mobileNumber = personalData.mobileNumber;
      teamMembersSave.registrationId = this.state.team.registrationUniqueKey;
      teamMembersSave.competitionMembershipProductDivisionId =
        this.state.team.competitionMembershipProductDivisionId;
      teamMembersSave.firstName = personalData.firstName;
      teamMembersSave.lastName = personalData.lastName;
      teamMembersSave.email = personalData.email;
      return teamMembersSave;
    } catch (ex) {
      console.log(`Error in getUpdatedTeamMembersSave::${ex}`);
    }
  };

  checkIsPlayer = membershipProductTypes => {
    try {
      let exist = false;
      const isPlayer = membershipProductTypes.find(x => x.isPlayer == 1 && x.isChecked == true);
      if (isPlayer) {
        exist = true;
      }
      return exist;
    } catch (ex) {
      console.log('Error in checkIsPlayer::' + ex);
    }
  };

  checkGenderDivisionRestriction = teamMembersSaveTemp => {
    try {
      const { membershipProductInfo } = this.props.userState;
      let competitionName = '';
      for (let org of membershipProductInfo) {
        const competition = org.competitions.find(
          x => x.competitionUniqueKey == teamMembersSaveTemp.competitionId,
        );
        if (competition) {
          competitionName = competition.competitionName;
        }
      }
      const selectedDivision = teamMembersSaveTemp.divisions[0];
      const gender =
        selectedDivision.genderRefId == 1
          ? 'Female'
          : selectedDivision.genderRefId == 2
          ? 'Male'
          : 'Non-binary';
      let personNames = [];
      let errorMessage = '';
      if (isArrayNotEmpty(teamMembersSaveTemp.teamMembers)) {
        for (let member of teamMembersSaveTemp.teamMembers) {
          const isPlayer = this.checkIsPlayer(member.membershipProductTypes);
          if (isPlayer) {
            const genderRefId = member.genderRefId;
            if (selectedDivision.genderRefId) {
              if (
                genderRefId <= 2 &&
                genderRefId != selectedDivision.genderRefId &&
                member.payingFor == 1
              ) {
                const name = member.firstName + ' ' + member.lastName;
                personNames = personNames.filter(x => x != name);
                personNames.push(name);
              }
            }
          }
        }
      }

      if (isArrayNotEmpty(personNames)) {
        let personsString = '';
        for (let i in personNames) {
          personsString += personNames[i] + (personNames.length - 1 != i ? ' and ' : ' ');
        }
        errorMessage =
          competitionName +
          ' is a ' +
          gender +
          ' only competition.' +
          personsString +
          ' is not allowed to register to this competition.';
      }

      return errorMessage;
    } catch (ex) {
      console.log('Error in checkGenderDivisionRestriction::' + ex);
    }
  };
  onCancelClick = () => {
    history.push('/userPersonal', { userId: this.state.team.userId });
  };
  onSaveClick = () => {
    try {
      const { teamMembersSave } = this.props.userState;
      for (let teamMember of teamMembersSave.teamMembers) {
        if (showMemberTypeValidation(teamMember)) {
          message.error(AppConstants.pleaseReview);
          this.setState({ buttonSubmitted: true });
          return;
        }
      }
      if (showMemberEmailValidation(teamMembersSave)) {
        message.error(AppConstants.duplicateTeamMemberEmail);
        return;
      }
      if (showMemberDetailValidation(teamMembersSave)) {
        message.error(AppConstants.duplicateTeamMemberDetails);
        return;
      }
      const teamMembersSaveTemp = this.getUpdateTeamMembersSave(teamMembersSave);
      const isGenderDivisionRestrictionError =
        this.checkGenderDivisionRestriction(teamMembersSaveTemp);
      if (isGenderDivisionRestrictionError != '') {
        message.error(isGenderDivisionRestrictionError);
        return;
      }
      if (teamMembersSave.teamMembers != null && teamMembersSave.teamMembers.length > 0) {
        for (let teamMember of teamMembersSave.teamMembers) {
          if (teamMember.mobileNumber && teamMember.mobileNumber.length != 10) {
            message.error(AppConstants.pleaseReview);
            this.state.hasErrorTeamMember.push({
              error: true,
              teamMemberIndex: teamMember.key,
            });
            this.setState({
              hasErrorTeamMember: this.state.hasErrorTeamMember,
            });
            return false;
          }
          if (teamMember.payingFor == 0 && !teamMember.mobileNumber && !teamMember.email) {
            message.error(AppConstants.pleaseEnterMobileOrEmailForTeamMember);
            return false;
          }
        }
      }
      const isDobDivisionRestrictionError = checkDobDivisionRestriction(teamMembersSaveTemp);
      if (isDobDivisionRestrictionError != '') {
        message.error(isDobDivisionRestrictionError);
        return;
      }
      this.props.teamMembersSaveAction(teamMembersSaveTemp);
      this.setState({ teamMembersSaveOnLoad: true });
    } catch (ex) {
      console.log('Error in onSaveClick::' + ex);
    }
  };

  addTeamSaveErrorPopUp = () => {
    let userState = this.props.userState;
    let errorMsg = userState.teamMembersSaveErrorMsg;
    return (
      <div>
        <Modal
          className="add-membership-type-modal"
          title={AppConstants.userDetailsInvalid}
          visible={this.state.addTeamSaveErrorPopUpVisible}
          onCancel={() => this.setState({ addTeamSaveErrorPopUpVisible: false })}
          footer={[
            <Button onClick={() => this.setState({ addTeamSaveErrorPopUpVisible: false })}>
              {AppConstants.ok}
            </Button>,
          ]}
        >
          {(errorMsg || []).map((item, index) => (
            <p key={index}> {item}</p>
          ))}
        </Modal>
      </div>
    );
  };

  headerView = () => {
    return (
      <div className="comp-player-grades-header-view-design mb-5">
        <div className="row add-team-member-head-center-align">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">
                {AppConstants.addTeamMembers}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };

  teamMemberParentOrGuardianView = (
    parent,
    parentIndex,
    teamMember,
    teamMemberIndex,
    getFieldDecorator,
  ) => {
    try {
      let hasErrorTeamMemberParentviaIndex = this.state.hasErrorTeamMemberParent.find(
        element =>
          element.teamMemberParentIndex == parentIndex &&
          element.teamMemberIndex == teamMemberIndex,
      );
      let hasError = false;
      if (hasErrorTeamMemberParentviaIndex != undefined) {
      }
      hasError = hasErrorTeamMemberParentviaIndex.error;
      return (
        <div>
          <div key={'parent' + parentIndex} className="light-grey-border-box">
            {teamMember.parentOrGuardian.length != 1 && (
              <div
                className="orange-action-txt"
                style={{ marginTop: '30px' }}
                onClick={() => {
                  this.addTeamMemberParent('remove', teamMemberIndex, parentIndex);
                }}
              >
                {AppConstants.cancel}
              </div>
            )}
            <div
              className="form-heading"
              style={
                teamMember.parentOrGuardian.length != 1
                  ? { paddingBottom: '0px', marginTop: '10px' }
                  : { paddingBottom: '0px', marginTop: '30px' }
              }
            >
              {AppConstants.newParentOrGuardian}
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-6">
                <Form.Item
                  name={`teamMemberParentFirstName${teamMemberIndex}${parentIndex}`}
                  rules={[
                    { required: true, message: ValidationConstants.nameField[4] },
                    {
                      validator: (_, value) => {
                        const noSpaceValue = value.replace(/\s+/g, '');
                        if (value === '') {
                          return Promise.reject();
                        } else if (noSpaceValue === '') {
                          return Promise.reject(new Error(ValidationConstants.nameField[4]));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.firstName}
                    placeholder={AppConstants.firstName}
                    onChange={e =>
                      this.onChangeSetTeamMemberParentValue(
                        captializedString(e.target.value),
                        'firstName',
                        teamMemberIndex,
                        parentIndex,
                      )
                    }
                    setFieldsValue={parent.firstName}
                    onBlur={i =>
                      this.formRef.current.setFieldsValue({
                        [`teamMemberParentFirstName${teamMemberIndex}${parentIndex}`]:
                          captializedString(i.target.value),
                      })
                    }
                  />
                </Form.Item>
              </div>
              <div className="col-sm-12 col-md-6">
                <Form.Item
                  name={`teamMemberParentMiddleName${teamMemberIndex}${parentIndex}`}
                  rules={[{ required: false }]}
                >
                  <InputWithHead
                    heading={AppConstants.middleName}
                    placeholder={AppConstants.middleName}
                    onChange={e =>
                      this.onChangeSetTeamMemberParentValue(
                        captializedString(e.target.value),
                        'middleName',
                        teamMemberIndex,
                        parentIndex,
                      )
                    }
                    setFieldsValue={parent.middleName}
                    onBlur={i =>
                      this.formRef.current.setFieldsValue({
                        [`teamMemberParentMiddleName${teamMemberIndex}${parentIndex}`]:
                          captializedString(i.target.value),
                      })
                    }
                  />
                </Form.Item>
              </div>
              <div className="col-sm-12 col-md-12">
                <Form.Item
                  name={`teamMemberParentLastName${teamMemberIndex}${parentIndex}`}
                  rules={[
                    { required: true, message: ValidationConstants.nameField[1] },
                    {
                      validator: (_, value) => {
                        const noSpaceValue = value.replace(/\s+/g, '');
                        if (value === '') {
                          return Promise.reject();
                        } else if (noSpaceValue === '') {
                          return Promise.reject(new Error(ValidationConstants.nameField[1]));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.lastName}
                    placeholder={AppConstants.lastName}
                    onChange={e =>
                      this.onChangeSetTeamMemberParentValue(
                        captializedString(e.target.value),
                        'lastName',
                        teamMemberIndex,
                        parentIndex,
                      )
                    }
                    setFieldsValue={parent.lastName}
                    onBlur={i =>
                      this.formRef.current.setFieldsValue({
                        [`teamMemberParentLastName${teamMemberIndex}${parentIndex}`]:
                          captializedString(i.target.value),
                      })
                    }
                  />
                </Form.Item>
              </div>
              <div className="col-sm-6">
                <Form.Item
                  name={`teamMemberParentMobileNumber${teamMemberIndex}${parentIndex}`}
                  rules={[{ required: true, message: ValidationConstants.contactField }]}
                  help={hasError ? hasError && ValidationConstants.mobileLength : undefined}
                  validateStatus={hasError ? (hasError ? 'error' : 'validating') : undefined}
                >
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.mobile}
                    placeholder={AppConstants.mobile}
                    onChange={e =>
                      this.onChangeSetTeamMemberParentValue(
                        e.target.value,
                        'mobileNumber',
                        teamMemberIndex,
                        parentIndex,
                      )
                    }
                    setFieldsValue={parent.mobileNumber}
                    maxLength={10}
                  />
                </Form.Item>
              </div>
              <div className="col-sm-6">
                <Form.Item
                  name={`teamMemberParentEmail${teamMemberIndex}${parentIndex}`}
                  rules={[
                    { required: true, message: ValidationConstants.emailField[0] },
                    {
                      type: 'email',
                      pattern: new RegExp(AppConstants.emailExp),
                      message: ValidationConstants.email_validation,
                    },
                  ]}
                >
                  <InputWithHead
                    required="required-field"
                    heading={AppConstants.email}
                    placeholder={AppConstants.email}
                    onChange={e =>
                      this.onChangeSetTeamMemberParentValue(
                        e.target.value,
                        'email',
                        teamMemberIndex,
                        parentIndex,
                      )
                    }
                    setFieldsValue={parent.email}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (ex) {
      console.log('Error in teamMemberParentGuardianView::' + ex);
    }
  };

  teamMemberEmergencyContactView = (teamMember, teamMemberIndex, getFieldDecorator) => {
    try {
      return (
        <div className="registration-form-view">
          <div className="form-heading">{AppConstants.emergencyContact}</div>
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <Form.Item
                name={`teamMemberEmergencyFirstName${teamMemberIndex}`}
                rules={[{ required: true, message: ValidationConstants.nameField[0] }]}
              >
                <InputWithHead
                  required="required-field"
                  heading={AppConstants.firstName}
                  placeholder={AppConstants.firstName}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      e.target.value,
                      'emergencyFirstName',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.emergencyFirstName}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberEmergencyFirstName${teamMemberIndex}`]: captializedString(
                        i.target.value,
                      ),
                    })
                  }
                />
              </Form.Item>
            </div>
            <div className="col-sm-12 col-md-6">
              <Form.Item
                name={`teamMemberEmergencyLastName${teamMemberIndex}`}
                rules={[{ required: true, message: ValidationConstants.nameField[1] }]}
              >
                <InputWithHead
                  required="required-field"
                  heading={AppConstants.lastName}
                  placeholder={AppConstants.lastName}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      e.target.value,
                      'emergencyLastName',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.emergencyLastName}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberEmergencyLastName${teamMemberIndex}`]: captializedString(
                        i.target.value,
                      ),
                    })
                  }
                />
              </Form.Item>
            </div>
            <div className="col-sm-12 col-md-6">
              <Form.Item
                name={`teamMemberEmergencyContactNumber${teamMemberIndex}`}
                rules={[{ required: true, message: ValidationConstants.pleaseEnterMobileNumber }]}
              >
                <InputWithHead
                  required="required-field"
                  heading={AppConstants.mobileNumber}
                  placeholder={AppConstants.mobileNumber}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      e.target.value,
                      'emergencyContactNumber',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.emergencyContactNumber}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberEmergencyContactNumber${teamMemberIndex}`]: captializedString(
                        i.target.value,
                      ),
                    })
                  }
                  maxLength={10}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      );
    } catch (ex) {
      console.log('Error in emergencyContactView::' + ex);
    }
  };

  teamMemberView = (teamMember, teamMemberIndex) => {
    try {
      const { genderData } = this.props.commonReducerState;
      const { teamMembersSave, personalData } = this.props.userState;
      const teamMembers = teamMembersSave?.teamMembers ? teamMembersSave?.teamMembers : [];
      const dateOfBirth = personalData.dateOfBirth
        ? moment(personalData.dateOfBirth, 'YYYY-MM-DD').format('MM-DD-YYYY')
        : null;
      let hasErrorTeamMemberviaIndex = this.state.hasErrorTeamMember.find(
        element => element.teamMemberIndex == teamMemberIndex,
      );
      let hasError = false;
      if (hasErrorTeamMemberviaIndex != undefined) {
        hasError = hasErrorTeamMemberviaIndex.error;
      }
      return (
        <div className="light-grey-border-box mt-0">
          <div style={{ display: 'flex', marginTop: '30px' }}>
            <div className="form-heading">{AppConstants.teamMember}</div>
            {teamMembers.length > 1 && (
              <img
                onClick={() => {
                  this.onChangeTeamMemberSaveUpdate(null, 'teamMember', teamMemberIndex);
                }}
                style={{ marginLeft: 'auto', width: '25px' }}
                src={AppImages.removeIcon}
                alt=""
              />
            )}
          </div>
          <InputWithHead heading={AppConstants.type} required="required-field" />
          {(teamMember.membershipProductTypes || []).map(product => (
            <Checkbox
              className="py-2"
              checked={product.isChecked}
              key={product.competitionMembershipProductTypeId}
              onChange={e => {
                const prodIndexTemp = teamMember.membershipProductTypes.findIndex(
                  x =>
                    x.competitionMembershipProductTypeId ===
                      product.competitionMembershipProductTypeId &&
                    x.competitionMembershipProductId === product.competitionMembershipProductId,
                );
                this.onChangeTeamMemberSaveUpdate(
                  e.target.checked,
                  'membershipProductTypes',
                  teamMemberIndex,
                  prodIndexTemp,
                );
              }}
            >
              {product.name}
            </Checkbox>
          ))}
          {showMemberTypeValidation(teamMember) && this.state.buttonSubmitted && (
            <div style={{ color: 'var(--app-red)' }}>
              {ValidationConstants.memberTypeIsRequired}
            </div>
          )}

          {/* <InputWithHead heading={AppConstants.gender} required="required-field" />
          <Form.Item
            name={`teamMemberGenderRefId${teamMemberIndex}`}
            rules={[{ required: true, message: ValidationConstants.genderField }]}
          >
            <Radio.Group
              className="registration-radio-group"
              onChange={e =>
                this.onChangeTeamMemberSaveUpdate(e.target.value, 'genderRefId', teamMemberIndex)
              }
              setFieldsValue={teamMember.genderRefId}
            >
              {(genderData || []).map(gender => (
                <Radio key={gender.id} value={gender.id}>
                  {gender.description}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item> */}
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.firstName} required="required-field" />
              <Form.Item
                name={`teamMemberFirstName${teamMemberIndex}`}
                rules={[
                  { required: true, message: ValidationConstants.nameField[4] },
                  {
                    validator: (_, value) => {
                      const noSpaceValue = value?.replace(/\s+/g, '');
                      if (value === '') {
                        return Promise.reject();
                      } else if (noSpaceValue === '') {
                        return Promise.reject(new Error(ValidationConstants.nameField[4]));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputWithHead
                  placeholder={AppConstants.firstName}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      captializedString(e.target.value).trim(),
                      'firstName',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.firstName}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberFirstName${teamMemberIndex}`]: captializedString(
                        i.target.value,
                      ).trim(),
                    })
                  }
                />
              </Form.Item>
            </div>
            {/* <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.middleName} />
              <Form.Item
                name={`teamMemberMiddleName${teamMemberIndex}`}
                rules={[{ required: false }]}
              >
                <InputWithHead
                  placeholder={AppConstants.middleName}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      captializedString(e.target.value),
                      'middleName',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.middleName}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberMiddleName${teamMemberIndex}`]: captializedString(i.target.value),
                    })
                  }
                />
              </Form.Item>
            </div> */}
            <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.lastName} />
              <Form.Item
                name={`teamMemberLastName${teamMemberIndex}`}
                rules={[
                  { required: false, message: ValidationConstants.nameField[1] },
                  {
                    validator: (_, value) => {
                      const noSpaceValue = value?.replace(/\s+/g, '');
                      if (value === '') {
                        return Promise.reject();
                      } else if (noSpaceValue === '') {
                        return Promise.reject(new Error(ValidationConstants.nameField[1]));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputWithHead
                  placeholder={AppConstants.lastName}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      captializedString(e.target.value),
                      'lastName',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.lastName}
                  onBlur={i =>
                    this.formRef.current.setFieldsValue({
                      [`teamMemberLastName${teamMemberIndex}`]: captializedString(i.target.value),
                    })
                  }
                />
              </Form.Item>
            </div>
            {/* <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.dob} required="required-field" />
              <Form.Item
                name={`teamMemberDateOfBirth${teamMemberIndex}`}
                rules={[{ required: true, message: ValidationConstants.dateOfBirth }]}
              >
                <DatePicker
                  size="large"
                  placeholder="dd-mm-yyyy"
                  style={{ width: '100%' }}
                  onChange={(e, f) =>
                    this.dateConversion(f, 'dateOfBirth', teamMember, teamMemberIndex)
                  }
                  format="DD-MM-YYYY"
                  showTime={false}
                  name="dateOfBirth"
                />
              </Form.Item>
            </div> */}
            <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.mobileNumber} />
              <Form.Item
                name={`teamMemberMobileNumber${teamMemberIndex}`}
                rules={[{ required: false, message: ValidationConstants.contactField }]}
                help={hasError ? hasError && ValidationConstants.mobileLength : undefined}
                validateStatus={hasError ? (hasError ? 'error' : 'validating') : undefined}
              >
                <InputWithHead
                  placeholder={AppConstants.mobileNumber}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      regexNumberExpression(e.target.value),
                      'mobileNumber',
                      teamMemberIndex,
                    )
                  }
                  setFieldsValue={teamMember.mobileNumber}
                  maxLength={10}
                />
              </Form.Item>
            </div>
            <div className="col-sm-12 col-md-6">
              <InputWithHead heading={AppConstants.email} />
              <Form.Item
                name={`teamMemberEmail${teamMemberIndex}`}
                rules={[
                  { required: false, message: ValidationConstants.emailField[0] },
                  {
                    type: 'email',
                    pattern: new RegExp(AppConstants.emailExp),
                    message: ValidationConstants.email_validation,
                  },
                ]}
              >
                <InputWithHead
                  placeholder={AppConstants.email}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(e.target.value, 'email', teamMemberIndex)
                  }
                  setFieldsValue={teamMember.email}
                />
              </Form.Item>
            </div>
          </div>
          {/* {teamMember.membershipProductTypes.find(x => x.isChecked == true) && (
                        <Checkbox
                            className="single-checkbox"
                            checked={teamMember.payingFor == 1}
                            onChange={e => {
                                this.onChangeTeamMemberSaveUpdate(e.target.checked ? 1 : 0, "payingFor", teamMemberIndex)
                                this.teamMemberAddingProcess(teamMember.dateOfBirth, e.target.checked ? 1 : 0, teamMember, teamMemberIndex)
                            }}
                        >
                            {AppConstants.payingForMember}
                        </Checkbox>
                    )} */}
          {isArrayNotEmpty(teamMember.parentOrGuardian) && (
            <div>
              <div className="form-heading" style={{ paddingBottom: '0px', marginTop: 20 }}>
                {AppConstants.parentOrGuardianDetail}
              </div>
              {getAge(dateOfBirth) > 18 && (
                <Checkbox
                  className="single-checkbox"
                  checked={teamMember.isRegistererAsParent == 1}
                  onChange={e =>
                    this.onChangeTeamMemberSaveUpdate(
                      e.target.checked ? 1 : 0,
                      'isRegistererAsParent',
                      teamMemberIndex,
                      0,
                    )
                  }
                >
                  {AppConstants.teamMemberParentCheck}
                </Checkbox>
              )}
              {(teamMember.parentOrGuardian || []).map((parent, parentIndex) => (
                <div>
                  {this.teamMemberParentOrGuardianView(
                    parent,
                    parentIndex,
                    teamMember,
                    teamMemberIndex,
                  )}
                </div>
              ))}
              <div
                className="orange-action-txt"
                style={{ marginTop: '10px' }}
                onClick={() => {
                  this.addTeamMemberParent('add', teamMemberIndex);
                }}
              >
                + {AppConstants.addNewParentGuardian}
              </div>
            </div>
          )}
          {getAge(moment(teamMember.dateOfBirth).format('MM-DD-YYYY')) > 18 &&
            teamMember.payingFor == 1 && (
              <div>
                {teamMember.dateOfBirth && (
                  <div>{this.teamMemberEmergencyContactView(teamMember, teamMemberIndex)}</div>
                )}
              </div>
            )}
        </div>
      );
    } catch (ex) {
      console.log('Error in teamMemberView::' + ex);
    }
  };

  contentView = getFieldDecorator => {
    const { teamMembersSave } = this.props.userState;
    const teamMembers = teamMembersSave?.teamMembers ? teamMembersSave?.teamMembers : [];
    return (
      <div className="content-view">
        {(teamMembers || []).map((teamMember, teamMemberIndex) => {
          return (
            <div className="mb-5">
              {this.teamMemberView(teamMember, teamMemberIndex, getFieldDecorator)}
            </div>
          );
        })}
        <div
          className="orange-action-txt"
          style={{ marginTop: '25px' }}
          onClick={() => this.onChangeTeamMemberSaveUpdate(null, 'teamMember')}
        >
          <span className="add-another-button-border">+ {AppConstants.addTeamMember}</span>
        </div>
      </div>
    );
  };

  footerView = () => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm">
            <div className="reg-add-save-button">
              <Button type="cancel-button" onClick={this.onCancelClick}>
                {AppConstants.cancel}
              </Button>
            </div>
          </div>
          <div className="col-sm">
            <div className="comp-buttons-view">
              <Form.Item>
                <Button className="user-approval-button" type="primary" htmlType="submit">
                  {AppConstants.save}
                </Button>
              </Form.Item>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout menuHeading={AppConstants.user} menuName={AppConstants.user} />
        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            onFinish={this.onSaveClick}
            onFinishFailed={() => {
              message.error(ValidationConstants.requiredMessage);
            }}
            noValidate="noValidate"
          >
            <Content>
              <div className="formView">{this.contentView()}</div>
              <Loader
                visible={
                  this.state.teamMembersSaveOnLoad ||
                  this.state.getTeamMembersOnLoad ||
                  this.props.userState.onMembershipLoad
                }
              />
              {this.addTeamSaveErrorPopUp()}
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
      getGenderAction,
      teamMemberSaveUpdateAction,
      teamMembersSaveAction,
      getUserModulePersonalDetailsAction,
      membershipProductEndUserRegistrationAction,
      getTeamMembersAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    commonReducerState: state.CommonReducerState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddTeamMember);

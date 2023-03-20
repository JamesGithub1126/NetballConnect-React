import { Button, message, Modal } from 'antd';
import React, { Component } from 'react';
import InputWithHead from '../../../customComponents/InputWithHead';
import AppConstants from '../../../themes/appConstants';
import ValidationConstants from '../../../themes/validationConstant';
import { isEmailValid, regexNumberExpression } from '../../../util/helpers';

export default class SendTeamMemberInviteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  sendInvite = teamMember => {
    if (!teamMember.mobileNumber && !teamMember.email) {
      message.error(AppConstants.pleaseEnterMobileOrEmailForTeamMember);
      return;
    }
    if (teamMember.mobileNumber) {
      if (teamMember.mobileNumber.length > 0 && teamMember.mobileNumber.length != 10) {
        message.error(ValidationConstants.mobileLength);
        return;
      }
      if (!regexNumberExpression(teamMember.mobileNumber)) {
        message.error(ValidationConstants.mobileLength);
        return;
      }
    }
    if (teamMember.email) {
      let isValid = isEmailValid(teamMember.email);
      if (!isValid) {
        message.error(ValidationConstants.email_validation);
        return;
      }
    }
    this.props.setFormState({ showSendInviteModal: false });
    this.props.sendInviteAgain(teamMember);
  };
  render() {
    const { teamMember, setFormState } = this.props;
    try {
      return (
        <div>
          <Modal
            className="add-membership-type-modal"
            title={AppConstants.sendInviteAgain}
            visible={this.props.showSendInviteModal}
            onCancel={() => setFormState({ showSendInviteModal: false })}
            footer={[
              <Button
                className="ant-btn-cancel-button"
                onClick={() => setFormState({ showSendInviteModal: false })}
              >
                {AppConstants.cancel}
              </Button>,
              <Button
                className="user-approval-button"
                onClick={() => {
                  this.sendInvite(teamMember);
                }}
              >
                {AppConstants.send}
              </Button>,
            ]}
          >
            <div className="row">
              <div className="col-sm-12">
                <InputWithHead heading={AppConstants.email} />
                <InputWithHead
                  name="email"
                  placeholder={AppConstants.email}
                  onChange={e => {
                    teamMember.email = e.target.value.trim().toLowerCase();
                    this.setState({ updateUI: true });
                  }}
                  value={teamMember?.email}
                />
              </div>
              <div className="col-sm-12">
                <InputWithHead heading={AppConstants.mobileNumber} />
                <InputWithHead
                  placeholder={AppConstants.mobileNumber}
                  onChange={e => {
                    let number = e.target.value.trim();
                    if (!number || regexNumberExpression(number)) {
                      teamMember.mobileNumber = regexNumberExpression(number);
                      this.setState({ updateUI: true });
                    }
                  }}
                  value={teamMember?.mobileNumber}
                  maxLength={10}
                />
              </div>
            </div>
          </Modal>
        </div>
      );
    } catch (ex) {
      console.log('Error in SendTeamMemberInviteModal::' + ex);
    }
  }
}

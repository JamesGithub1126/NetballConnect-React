import React, { Component } from 'react';
import { Button, Modal, DatePicker, Form } from 'antd';
import moment from 'moment';
import '../user.css';
import AppConstants from 'themes/appConstants';
import { getOrganisationData } from 'util/sessionStorage';
import { ErrorType } from 'util/enums';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import { handleError } from 'util/messageHandler';
import ValidationConstant from 'themes/validationConstant';

export default class MembershipExpiryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMembershipExpiredModal: false,
      membershipExpiryId: null,
      buttonLoading: false,
    };
    this.registerRecord = this.props.registerRecord;
  }

  expiredFormRef = React.createRef();

  async componentDidMount() {
    let record = this.registerRecord;
    if (record.membershipExpiryDate) {
      this.expiredFormRef.current.setFieldsValue({
        membershipExpiryDate: moment(record.membershipExpiryDate),
      });
    }
  }

  excuteUpdate = async expiryDate => {
    try {
      const organisationId = getOrganisationData()
        ? getOrganisationData().organisationUniqueKey
        : null;
      const data = {
        id: this.registerRecord.membershipExpiryId,
        expiryDate,
        section: 'expiryDate',
        organisationId,
      };
      this.setState({ buttonLoading: true });
      let result = await UserAxiosApi.updateUserProfile(data);

      if (result.status === 1) {
        this.props.closeModal({ success: true });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
  };

  updateMembershipExpiredDate = async () => {
    this.expiredFormRef.current
      .validateFields()
      .then(values => {
        this.excuteUpdate(values.membershipExpiryDate.format('YYYY-MM-DD'));
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return (
      <Modal
        title={AppConstants.updateMembershipExpiry}
        visible={true}
        onCancel={() => this.props.closeModal({ success: false })}
        maskClosable={false}
        ref={this.expiredFormRef}
        footer={[
          <Button
            disabled={this.state.buttonLoading}
            onClick={() => this.props.closeModal({ success: false })}
          >
            {AppConstants.cancel}
          </Button>,
          <Button
            style={{ backgroundColor: '#ff8237', borderColor: '#ff8237', color: 'white' }}
            onClick={this.updateMembershipExpiredDate}
            loading={this.state.buttonLoading}
          >
            {AppConstants.ok}
          </Button>,
        ]}
        centered
      >
        <Form ref={this.expiredFormRef} autoComplete="off" noValidate="noValidate">
          <div>
            <span className="required-field">{AppConstants.membershipExpiryDate}</span>
            <Form.Item
              name="membershipExpiryDate"
              rules={[{ required: true, message: ValidationConstant.expireDateMessage }]}
            >
              <DatePicker />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    );
  }
}

import React from 'react';
import { Modal, Select } from 'antd';
import AppImages from '../themes/appImages';
import AppConstants from '../themes/appConstants';
import { getImpersonation } from '../util/sessionStorage';
import './wizard.css';

const { Option } = Select;

class RegistrationWizardModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeCompId: 'manu',
    };
    // this.props.clearYearCompetitionAction()
    // this.props.getCommonRefData()
  }

  render() {
    const {
      competitionStatus,
      registrationStatus,
      competitionClick,
      registrationClick,
      publishStatus,
      stripeConnectURL,
      stripeConnected,
      competitionId,
      competitionChange,
      wizardCompetition,
      // heading,
      // placeholder,
      // name,
      // handleBlur,
      modalTitle,
      // visible,
      onOK,
      onCancel,
      // ownnerComment,
      // affilateComment
    } = this.props;
    let isImpersonation = getImpersonation();
    let showStripe = isImpersonation !== 'true' && !stripeConnected ? true : false;
    return (
      <div style={{ backgroundColor: 'red' }}>
        <Modal
          {...this.props}
          className="add-membership-type-modal"
          title={modalTitle}
          visible={this.props.visible}
          onOk={onOK}
          onCancel={onCancel}
          cancelButtonProps={{ style: { display: 'none' } }}
          okButtonProps={{ style: { display: 'none' } }}
          maskClosable
        >
          <div className="col-sm pl-0 pb-2">
            <div className="reg-filter-col-cont">
              <span className="year-select-heading">{AppConstants.competition}:</span>
              <Select
                className="year-select reg-filter-select1 ml-2"
                style={{ width: '70%' }}
                onChange={competitionChange}
                value={competitionId}
              >
                {wizardCompetition.map(item => (
                  <Option key={'competition_' + item.competitionId} value={item.competitionId}>
                    {item.competitionName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="wizard_div" style={{ minHeight: !showStripe ? 100 : 140, marginTop: 20 }}>
            <div className="row">
              <div className="col-sm pl-0 pb-2">
                <div className="col-sm-6 d-flex justify-content-start">
                  <span className="comment-heading">Step</span>
                </div>
                <div className="col-sm-6 d-flex justify-content-end" style={{ paddingRight: 5 }}>
                  <span className="comment-heading">Status</span>
                </div>
              </div>
            </div>

            {!stripeConnected && (
              <div className="row w-100">
                <div className="col-sm-1 serialView pb-2">
                  <span className="comment-heading">{'1'} </span>
                </div>
                <div className="col-sm setupView pb-2">
                  <span className="comment-heading">{AppConstants.setup} </span>
                  <a href={stripeConnectURL} className="stripe-connect">
                    <span
                      className="comment-heading"
                      style={{ textDecoration: 'underline', cursor: 'pointer', color: '#FF8237' }}
                    >
                      {AppConstants.setupStripe}
                    </span>
                  </a>
                </div>
              </div>
            )}

            <div className="row w-100">
              <div className="col-sm-1 serialView pb-2">
                <span className="comment-heading">{showStripe ? '2' : '1'} </span>
              </div>
              <div className="col-sm-10 setupView pb-2 ">
                <span className="comment-heading">{AppConstants.set} </span>

                <span
                  className="comment-heading"
                  onClick={competitionClick}
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: '#FF8237' }}
                >
                  {AppConstants.competitionFees}
                </span>
              </div>
              <div className="col-sm-1 tickView pb-2 pl-0">
                {competitionStatus && <img src={AppImages.tick} alt="" className="export-image" />}
              </div>
            </div>
            <div className="row w-100">
              <div className="col-sm-1 serialView pb-2">
                <span className="comment-heading">{showStripe ? '3' : '2'} </span>
              </div>
              <div className="col-sm-10 setupView pb-2 ">
                <span disabled={publishStatus == 2} className="comment-heading">
                  {AppConstants.createPublish}{' '}
                </span>

                <span
                  onClick={registrationClick}
                  className="comment-heading"
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: '#FF8237' }}
                >
                  {AppConstants.registrationForm}
                </span>
              </div>
              <div className="col-sm-1 tickView pb-2 pl-0">
                {registrationStatus && <img src={AppImages.tick} alt="" className="export-image" />}

                {/* </div> */}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default RegistrationWizardModel;

import React, { Component } from 'react';
import { Table, Pagination, Menu, Popover } from 'antd';
import moment from 'moment';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { getOrganisationData } from 'util/sessionStorage';
import { isReadOnlyRole } from 'util/permissions';
import { isArrayNotEmpty } from 'util/helpers';
import { ErrorType, OrganisationType } from 'util/enums';
import { handleError } from 'util/messageHandler';
import MembershipExpiryModal from '../modal/membershipExpiryModal';
import UserAxiosApi from 'store/http/userHttp/userAxiosApi';
import { getOrgLevelName } from 'util/registrationHelper';
import { InfoCircleOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;

class UserMembership extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      showMembershipExpiredModal: false,
      membershipExpiryId: null,
      buttonLoading: false,
      loading: false,
      memberships: [],
      currentPage: 1,
      limit: 10,
      total: 0,
      onTransferUserRegistrationLoad: this.props.onTransferUserRegistrationLoad,
    };

    this.handleColumns();
  }

  componentWillMount() {}

  async componentDidMount() {
    this.apiCalls(this.state.userId);
  }

  async componentDidUpdate() {
    let { onTransferUserRegistrationLoad } = this.state;
    if (this.props.onTransferUserRegistrationLoad !== onTransferUserRegistrationLoad) {
      this.setState({ onTransferUserRegistrationLoad: this.props.onTransferUserRegistrationLoad });
    }
    if (
      onTransferUserRegistrationLoad === true &&
      this.props.onTransferUserRegistrationLoad === false
    ) {
      await this.apiCalls(this.state.userId);
    }
  }

  apiCalls = async () => {
    try {
      this.setState({ loading: true });
      const { userId, currentPage, limit } = this.state;
      const offset = currentPage ? 10 * (currentPage - 1) : 0;
      let result = await UserAxiosApi.getUserMemberships({ userId, limit, offset });
      if (result.status === 1) {
        let { dataSource, totalCount } = result.result.data;
        if (!isArrayNotEmpty(dataSource)) {
          dataSource = [];
          totalCount = 0;
        }
        this.setState({ dataSource, total: totalCount });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  //#region  update membership expired date
  openMembershipExpiredModal = record => {
    this.setState({ showMembershipExpiredModal: true, registerRecord: record });
  };

  closeMembershipExpireModal = async ({ success }) => {
    this.setState({ showMembershipExpiredModal: false });
    if (success) {
      this.apiCalls();
    }
  };

  onTableChange = async page => {
    this.setState({ currentPage: page }, () => {
      this.apiCalls();
    });
  };
  //#endregion

  render() {
    const { loading, dataSource, currentPage, total } = this.state;
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="user-module-row-heading">{AppConstants.memberships}</div>
          <div className="table-responsive home-dash-table-view">
            <Table
              className="home-dashboard-table"
              columns={this.columns}
              dataSource={dataSource}
              pagination={false}
              loading={loading}
              rowKey="membershipExpiryId"
            />
          </div>
          <div className="d-flex justify-content-end">
            <Pagination
              className="antd-pagination pb-3"
              current={currentPage}
              total={total}
              onChange={page => this.onTableChange(page)}
              showSizeChanger={false}
            />
          </div>
        </div>
        {this.state.showMembershipExpiredModal ? (
          <MembershipExpiryModal
            registerRecord={this.state.registerRecord}
            closeModal={this.closeMembershipExpireModal}
          />
        ) : null}
      </div>
    );
  }

  handleColumns = () => {
    this.columns = [
      {
        title: AppConstants.year,
        dataIndex: 'year',
        key: 'year',
      },
      {
        title: AppConstants.membershipProduct,
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: AppConstants.type,
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: AppConstants.expiry,
        dataIndex: 'membershipExpiryDate',
        key: 'membershipExpiryDate',
        render: (membershipExpiryDate, record) => (
          <span>
            {membershipExpiryDate != null
              ? moment(membershipExpiryDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
              : ''}
          </span>
        ),
      },
      {
        title: AppConstants.amount,
        dataIndex: 'amount',
        key: 'amount',
        render: (amount, record) => {
          let hasTooltip =
            record.linkedMembershipExpires && record.linkedMembershipExpires.length > 1;
          if (hasTooltip) {
            record.linkedMembershipExpires = record.linkedMembershipExpires.sort((a, b) => {
              return a.membershipOrgRefType - b.membershipOrgRefType;
            });
            return (
              <Popover
                content={record.linkedMembershipExpires.map(x => (
                  <div className="row nowrap">
                    <div className="col-md-7">{getOrgLevelName(x.membershipOrgRefType)}</div>
                    <div className="col-md-5">{'$' + x.amount}</div>
                  </div>
                ))}
              >
                <span>{`$${amount}`}</span> <InfoCircleOutlined className="info-icon v-baseline" />
              </Popover>
            );
          } else {
            return <span>{amount ? `$${amount}` : ''}</span>;
          }
        },
      },
      {
        title: AppConstants.status,
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive, record) => (
          <span className="membership-status">
            {isActive == 1 ? AppConstants.active : AppConstants.inActive}
          </span>
        ),
      },
    ];

    if (!isReadOnlyRole()) {
      this.columns.push({
        title: AppConstants.action,
        dataIndex: 'action',
        key: 'action',
        render: (regForm, e) => {
          const organisation = getOrganisationData();
          const organisationTypeRefId = organisation?.organisationTypeRefId;
          return organisationTypeRefId == OrganisationType.State && e.membershipExpiryDate ? (
            <Menu
              className="action-triple-dot-submenu"
              theme="light"
              mode="horizontal"
              style={{ lineHeight: '25px' }}
            >
              <SubMenu
                key="sub1"
                title={
                  <img
                    className="dot-image"
                    src={AppImages.moreTripleDot}
                    alt=""
                    width="16"
                    height="16"
                  />
                }
              >
                <Menu.Item key="10" onClick={this.openMembershipExpiredModal.bind(this, e)}>
                  <span>{AppConstants.edit}</span>
                </Menu.Item>
              </SubMenu>
            </Menu>
          ) : null;
        },
      });
    }
  };
}

export default UserMembership;

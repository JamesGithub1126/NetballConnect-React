import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, Modal, Table, Menu, Pagination, Select, message } from 'antd';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
// import moment from "moment";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  liveScoreSingleGameListAction,
  liveScoreSingleGameRedeemPayAction,
  clearSingleGameDataList,
  setSingleGamePageSizeAction,
} from '../../store/actions/LiveScoreAction/liveScoreDashboardAction';
// import ValidationConstants from "../../themes/validationConstant";
import history from '../../util/history';
import Loader from '../../customComponents/loader';
import {
  getLiveScoreCompetition,
  // getKeyForStateWideMessage,
  getOrganisationData,
} from '../../util/sessionStorage';
import { liveScoreMatchListAction } from '../../store/actions/LiveScoreAction/liveScoreMatchAction';

import { NavLink } from 'react-router-dom';
import ValidationConstants from '../../themes/validationConstant';
import { antdColSort } from '../../util/helpers';

const { Header, Content } = Layout;
const { Option } = Select;
let this_Obj = null;

function tableSort(a, b, key) {
  let stringA = JSON.stringify(a[key]);
  let stringB = JSON.stringify(b[key]);
  return stringA.localeCompare(stringB);
}

function checkSorting(a, b, key) {
  if (a[key] && b[key]) {
    return a[key].length - b[key].length;
  }
}

const columns = [
  {
    title: AppConstants.firstName,
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: antdColSort('firstName', 'string'),
  },
  {
    title: AppConstants.lastName,
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: antdColSort('lastName', 'string'),
  },
  {
    title: AppConstants.linked,
    dataIndex: 'linked',
    key: 'linked',
    sorter: antdColSort('linked', 'string'),
  },
  {
    title: AppConstants.competitionMembershipProductDivisionName,
    dataIndex: 'divisionName',
    key: 'divisionName',
    sorter: antdColSort('divisionName', 'string'),
  },
  /*   {
    title: AppConstants.grade,
    dataIndex: 'grade',
    key: 'grade',
    sorter: (a, b) => checkSorting(a, b, 'grade'),
  },
  {
    title: AppConstants.team,
    dataIndex: 'teamName',
    key: 'team',
    sorter: (a, b) => checkSorting(a, b, 'team'),
  }, */
  {
    title: AppConstants.purchased,
    dataIndex: 'matchesCount',
    key: 'matchesCount',
    sorter: antdColSort('matchesCount', 'number'),
  },
  {
    title: AppConstants.available,
    dataIndex: 'status',
    key: 'status',
    render: (status, record) => <span>{record.matchesCount - record.redeemedMatchCount}</span>,
    sorter: {
      compare: (a, b) =>
        a.matchesCount - a.redeemedMatchCount - (b.matchesCount - b.redeemedMatchCount),
      multiple: 1,
    },
  },
  {
    title: AppConstants.action,
    dataIndex: 'action',
    key: 'action',
    render: (data, record) => (
      <Menu
        className="action-triple-dot-submenu"
        theme="light"
        mode="horizontal"
        style={{ lineHeight: '25px' }}
      >
        <Menu.SubMenu
          key="sub1"
          style={{ borderBottomStyle: 'solid', borderBottom: 0 }}
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
          {
            <Menu.Item key="1" onClick={() => this_Obj.showRedeemModal('show', record)}>
              <span>{AppConstants.redeemRemove}</span>
            </Menu.Item>
          }
          {(record.isDirectComp && false) ? ( // - can only cash pay if it's direct comp (for now)
            <Menu.Item key="2" onClick={() => this_Obj.showPayModal('show', record)}>
              <span>{AppConstants.pay}</span>
            </Menu.Item>
          ) : null}
        </Menu.SubMenu>
      </Menu>
    ),
  },
];

class LiveScoreSingleGameFee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false,
      redeemModalVisible: false,
      payModalVisible: false,
      gamesToRedeem: 0,
      gamesToPay: 0,
      singleGameRecord: null,
      matchesToRedeem: [],
    };
    this.formRef = React.createRef();
    this_Obj = this;
  }

  componentDidMount() {
    this.props.clearSingleGameDataList();
    this.getLivescoreGameList(1);
    let competition = JSON.parse(getLiveScoreCompetition());
    this.props.liveScoreMatchListAction(
      competition.id,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
    );
  }

  getLivescoreGameList(page) {
    const { liveScoreSingleGameListPageSize } = this.props.liveScoreDashboardState;
    const limit = liveScoreSingleGameListPageSize ?? 10;
    const { uniqueKey } = JSON.parse(getLiveScoreCompetition());
    const { organisationUniqueKey } = getOrganisationData() || {};
    let payload = {
      competitionId: uniqueKey,
      organisationId: organisationUniqueKey,
      paging: {
        limit: limit,
        offset: page ? limit * (page - 1) : 0,
      },
    };

    this.props.liveScoreSingleGameListAction(payload);
  }

  componentDidUpdate(nextProps) {
    if (
      this.state.load === true &&
      this.props.liveScoreDashboardState.onSingleGameRedeemPayLoad === false
    ) {
      this.getLivescoreGameList(1);
      this.setState({ load: false });
    }
  }

  handleFocus(e) {
    e.currentTarget.select();
  }

  handlePageChange = async (page, pageSize) => {
    await this.props.setSingleGamePageSizeAction(pageSize ?? 10);
    this.getLivescoreGameList(page);
  };

  showRedeemModal = (key, record) => {
    const { matchesToRedeem } = this.state;
    let matchesCount = record?.matchesCount ? record.matchesCount : 0;
    if (key === 'show') {
      this.setState({
        redeemModalVisible: true,
        singleGameRecord: record,
        matchesToRedeem: record.matchIds,
      });
    } else if (key === 'ok') {
      if (matchesToRedeem.length > matchesCount) {
        message.error(ValidationConstants.redeemExceeded);
        return;
      }
      let payload = {
        userId: record.userId,
        livescorePlayerId: record.livescorePlayerId,
        organisationId: record.organisationId,
        competitionId: record.competitionId,
        membershipProductMappingId: record.membershipProductMappingId,
        competitionMembershipProductDivisionId: record.competitionMembershipProductDivisionId,
        registrationId: record.registrationId,
        singleGameRedeemId: record.singleGameRedeemId,
        redeemedMatchCount: matchesToRedeem.length,
        matchIds: matchesToRedeem,
        processType: 'redeem',
      };

      this.props.liveScoreSingleGameRedeemPayAction(payload);
      this.setState({
        redeemModalVisible: false,
        load: true,
        gamesToRedeem: 0,
        matchesToRedeem: [],
      });
    } else {
      this.setState({ redeemModalVisible: false, gamesToRedeem: 0, matchesToRedeem: [] });
    }
  };

  showPayModal = (key, record) => {
    const { matchesToRedeem } = this.state;
    if (key === 'show') {
      this.setState({
        payModalVisible: true,
        singleGameRecord: record,
        matchesToRedeem: record.matchIds,
      });
    } else if (key === 'ok') {
      let record = this.state.singleGameRecord;
      let payload = {
        userId: record.userId,
        livescorePlayerId: record.livescorePlayerId,
        organisationId: record.organisationId,
        competitionId: record.competitionId,
        membershipProductMappingId: record.membershipProductMappingId,
        competitionMembershipProductDivisionId: record.competitionMembershipProductDivisionId,
        registrationId: record.registrationId,
        gamesToPay: this.state.gamesToPay,
        singleGameRedeemId: record.singleGameRedeemId,
        redeemedMatchCount: matchesToRedeem.length,
        matchIds: matchesToRedeem,
        processType: 'pay',
      };

      this.props.liveScoreSingleGameRedeemPayAction(payload);
      this.setState({ payModalVisible: false, load: true, gamesToPay: 0, matchesToRedeem: [] });
    } else {
      this.setState({ payModalVisible: false, gamesToPay: 0, matchesToRedeem: [] });
    }
  };

  redeemModalView() {
    let { matchesToRedeem } = this.state;
    let record = this.state.singleGameRecord;
    let matchesCount = record?.matchesCount ? record.matchesCount : 0;
    let { liveScoreMatchList } = this.props.liveScoreMatchListState;
    liveScoreMatchList = liveScoreMatchList ? liveScoreMatchList : [];

    return (
      <Modal
        title="Redeem"
        visible={this.state.redeemModalVisible}
        onCancel={() => this.showRedeemModal('cancel')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        onOk={() => this.showRedeemModal('ok', record)}
        centered
      >
        <div>
          {' '}
          {AppConstants.gamesPaid} : {matchesCount}
        </div>
        <div>
          {' '}
          {AppConstants.gamesToRedeem} :{' '}
          <span style={matchesToRedeem.length > matchesCount ? { color: 'red' } : {}}>
            {matchesToRedeem.length}
          </span>
        </div>
        <InputWithHead required="pb-0" heading={AppConstants.redeemedMatches} />
        <Select
          mode="multiple"
          placeholder={AppConstants.gamesToRedeem}
          style={{ width: '100%' }}
          value={matchesToRedeem}
          onChange={matchesToRedeem => this_Obj.setState({ matchesToRedeem })}
        >
          {liveScoreMatchList.map(item => (
            <Option key={item.id} value={item.id}>
              {item.id}
            </Option>
          ))}
        </Select>
      </Modal>
    );
  }

  payModalView() {
    return (
      <Modal
        title="Pay"
        visible={this.state.payModalVisible}
        onCancel={() => this.showPayModal('cancel')}
        okButtonProps={{ style: { backgroundColor: '#ff8237', borderColor: '#ff8237' } }}
        okText="Save"
        onOk={() => this.showPayModal('ok')}
        centered
      >
        <div> {AppConstants.howManyGames}</div>
        <InputWithHead
          placeholder={AppConstants.totalGames}
          value={this.state.gamesToPay}
          onChange={e => this.setState({ gamesToPay: e.target.value })}
          onFocus={e => this.handleFocus(e)}
          type="number"
        />
      </Modal>
    );
  }

  headerView = () => {
    // let isEdit = this.props.location.state ? this.props.location.state.isEdit : null
    return (
      <div>
        <Header className="comp-player-grades-header-drop-down-view bg-transparent d-flex align-items-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {/* {isEdit ? AppConstants.editNews : AppConstants.addNews} */}
              {AppConstants.singleGameFees}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  contentView = () => {
    const {
      singleGameDataList,
      liveScoreSingleGameListPage,
      liveScoreSingleGameListTotalCount,
      liveScoreSingleGameListPageSize,
    } = this.props.liveScoreDashboardState;
    const { isFetchingMatchList } = this.props.liveScoreMatchListState;
    return (
      <div className="comp-dash-table-view mt-2">
        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={singleGameDataList}
            rowKey={record =>
              '' + record.livescorePlayerId ??
              '' +
                record.userId +
                record.registrationId +
                record.competitionMembershipProductDivisionId +
                record.membershipProductMappingId
            }
            pagination={false}
            loading={
              (this.props.liveScoreDashboardState.onSingleGameLoad && true) || isFetchingMatchList
            }
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            showSizeChanger
            className="antd-pagination"
            current={liveScoreSingleGameListPage}
            defaultCurrent={liveScoreSingleGameListPage}
            defaultPageSize={liveScoreSingleGameListPageSize}
            total={liveScoreSingleGameListTotalCount}
            onChange={(page, pageSize) => this.handlePageChange(page, pageSize)}
          />
        </div>
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = isSubmitting => {
    return (
      <div className="fluid-width">
        <div className="footer-view">
          <div className="row">
            <div className="col-sm pl-3">
              <div className="reg-add-save-button">
                {/* <Button onClick={() => history.push(this.state.key === 'dashboard' ? 'liveScoreDashboard' : '/matchDayNewsList')} type="cancel-button">{AppConstants.cancel}</Button> */}
                <NavLink
                  to={{
                    pathname:
                      this.state.key === 'dashboard' ? '/matchDayDashboard' : '/matchDayNewsList',
                    state: { screenKey: this.state.screenKey },
                  }}
                >
                  <Button className="cancelBtnWidth" type="cancel-button">
                    {AppConstants.cancel}
                  </Button>
                </NavLink>
              </div>
            </div>
            <div className="col-sm pr-3">
              <div className="comp-buttons-view">
                <Button
                  className="publish-button save-draft-text mr-0"
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                >
                  {AppConstants.next}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    // let stateWideMsg = getKeyForStateWideMessage()
    return (
      <div className="fluid-width default-bg" style={{ paddingBottom: 10 }}>
        <Loader visible={this.props.liveScoreDashboardState.onSingleGameLoad} />
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="payments_2" />

        {/* {stateWideMsg ?
                <div>
                    <InnerHorizontalMenu menu="liveScoreNews" liveScoreNewsSelectedKey="21" />
                </div>
                 :
                <div>
                    <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey={this.state.key === 'dashboard' ? '1' : "21"} />
                </div>
                    } */}

        <Layout>
          {this.headerView()}
          <Content>
            {this.contentView()}
            {this.redeemModalView()}
            {this.payModalView()}
          </Content>
          {/* <Footer>{this.footerView()}</Footer> */}
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      liveScoreSingleGameListAction,
      liveScoreSingleGameRedeemPayAction,
      liveScoreMatchListAction,
      clearSingleGameDataList,
      setSingleGamePageSizeAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    liveScoreDashboardState: state.LiveScoreDashboardState,
    liveScoreMatchListState: state.LiveScoreMatchState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreSingleGameFee);

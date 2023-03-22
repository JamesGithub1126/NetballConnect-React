import React, { Component } from 'react';
import { Table, Pagination } from 'antd';
import { NavLink } from 'react-router-dom';
import AppConstants from '../../../themes/appConstants';
import { isArrayNotEmpty } from '../../../util/helpers';
import RegistrationAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';
import { handleError } from 'util/messageHandler';
import { ErrorType } from 'util/enums';
import { currencyFormat } from 'util/currencyFormat';
export default class TeamSpecificMatchFee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      offset: 0,
      limit: 10,
      page: 1,
      total: 0,
      sortBy: null,
      sortOrder: null,
      loading: false,
      exporting: false,
    };
    this.selectedTeam = this.props.selectedTeam;
    this.columns = this.getColumns();
  }

  async componentDidMount() {
    this.getDataSource();
  }

  componentWillReceiveProps(nextProps) {
    const {
      roundName: roundNameNew,
      divisionId: divisionIdNew,
      competitionId: competitionIdNew,
      searchText: searchTextNew,
    } = nextProps.query;
    const { roundName, divisionId, competitionId, searchText } = this.props.query;
    if (
      roundNameNew !== roundName ||
      divisionIdNew !== divisionId ||
      competitionIdNew !== competitionId ||
      searchTextNew !== searchText
    ) {
      this.setState({ page: 1 }, () => this.getDataSource());
    }
  }

  getPayload = () => {
    const { sortBy, sortOrder } = this.state;
    const { competitionId, divisionId, roundName, teamId, searchText } = this.props.query;
    if (!competitionId) {
      return null;
    }
    let page = this.state.page;
    const limit = this.limit;
    let offset = 10 * (page - 1);
    const body = {
      competitionId,
      divisionId,
      roundName,
      teamId,
      searchText,
      sortBy,
      sortOrder,
      isTeamQuery: false,
      paging: {
        limit,
        offset,
      },
    };
    return body;
  };

  getDataSource = async () => {
    const body = this.getPayload();
    if (!body) {
      return;
    }
    this.setState({ loading: true });
    try {
      const result = await RegistrationAxiosApi.getTeamPerMatchFeeList(body);
      if (result.status === 1) {
        let {
          dataList: dataSource = [],
          page: { totalCount: total },
        } = result.result.data;
        if (!isArrayNotEmpty(dataSource)) {
          dataSource = [];
        } else {
          for (let item of dataSource) {
            if (isArrayNotEmpty(item.matchfeeinfo)) {
              let feeinfo = item.matchfeeinfo[0];
              item.isPaid = feeinfo.isPaid;
              item.payerFirstName = feeinfo.payerFirstName;
              item.payerLastName = feeinfo.payerLastName;
              item.paidBy = feeinfo.paidBy;
              item.startTime = item.startTime ? new Date(item.startTime).toLocaleString() : null;
              item.vs = feeinfo.teamVs;
              item.result = feeinfo.resultCode;
            }
            item.feeIncGST = currencyFormat(item.feeIncGST);
          }
        }

        this.setState({ dataSource, total });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  contentView = () => {
    const { page, dataSource, total, loading } = this.state;
    const { teamName: name } = this.selectedTeam;

    return (
      <div className="match-fee-table-view mt-4">
        <div className="team-name">
          {AppConstants.team}:&nbsp;&nbsp;{name}
        </div>
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={loading}
            className="home-dashboard-table"
            columns={this.columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => 'matchId' + record.matchId}
          />
        </div>
        <div className="d-flex justify-content-end">
          <Pagination
            className="antd-pagination"
            current={page}
            total={total}
            onChange={p => this.setState({ page: p }, () => this.getDataSource())}
            showSizeChanger={false}
            pageSize={10}
          />
        </div>
      </div>
    );
  };

  render() {
    return <div className="fluid-width default-bg">{this.contentView()}</div>;
  }

  onColumnSort = key => {
    let sortBy = key;
    let sortOrder = null;
    if (this.state.sortBy !== key) {
      sortOrder = 'ASC';
    } else if (this.state.sortBy === key && this.state.sortOrder === 'ASC') {
      sortOrder = 'DESC';
    } else if (this.state.sortBy === key && this.state.sortOrder === 'DESC') {
      sortBy = sortOrder = null;
    }
    this.setState({ sortBy, sortOrder }, () => this.getDataSource());
  };

  getColumns = () => {
    return [
      {
        title: AppConstants.tableMatchID,
        dataIndex: 'matchId',
        key: 'matchId',
      },
      {
        title: AppConstants.startTime,
        dataIndex: 'startTime',
        key: 'startTime',
        sorter: true,
        onHeaderCell: () => ({
          onClick: () => this.onColumnSort('startTime'),
        }),
      },
      {
        title: AppConstants.vs,
        dataIndex: 'vs',
        key: 'vs',
      },
      {
        title: AppConstants.result,
        dataIndex: 'result',
        key: 'result',
      },
      {
        title: AppConstants.payer,
        dataIndex: 'payer',
        key: 'payer',
        render: (firstName, record) => {
          return record.paidBy ? (
            <NavLink to={{ pathname: '/userPersonal', state: { userId: record.paidBy } }}>
              <span className="input-heading-add-another pt-0">
                {record.payerFirstName + ' ' + record.payerLastName}
              </span>
            </NavLink>
          ) : (
            <span className="input-heading-add-another pt-0"></span>
          );
        },
      },

      {
        title: AppConstants.feeIncGST,
        dataIndex: 'feeIncGST',
        key: 'feeIncGST',
        sorter: true,
        onHeaderCell: () => ({
          onClick: () => this.onColumnSort('feeIncGST'),
        }),
      },

      {
        title: AppConstants.status,
        dataIndex: 'isPaid',
        key: 'isPaid',
        //sorter: true,
        onHeaderCell: () => ({
          onClick: () => this.onColumnSort('isPaid'),
        }),
        render: (isPaid, record) => {
          return record.isPaid ? (
            <span>{AppConstants.paid}</span>
          ) : (
            <span>{AppConstants.notPaid}</span>
          );
        },
      },

      /* {
        title: AppConstants.actions,
        dataIndex: 'actions',
        key: 'actions',
      }, */
    ];
  };
}

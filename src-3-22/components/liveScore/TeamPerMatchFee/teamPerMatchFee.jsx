import React, { Component } from 'react';
import { Table, Pagination } from 'antd';
import AppConstants from '../../../themes/appConstants';
import { isArrayNotEmpty } from '../../../util/helpers';
import RegistrationAxiosApi from 'store/http/registrationHttp/registrationAxiosApi';
import { handleError } from 'util/messageHandler';
import { ErrorType } from 'util/enums';
import { currencyFormat } from 'util/currencyFormat';

export default class TeamFeePerMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      limit: 10,
      page: 1,
      total: 0,
      sortBy: null,
      sortOrder: null,
      loading: false,
      sum: { paidCount: 0, paidAmount: 0, owingCount: 0, owingAmount: 0 },
    };
    this.columns = this.getColumns();
    this.limit = 10;
  }

  async componentDidMount() {
    if (this.props.query.competitionId) {
      this.getDataSource();
    }
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

  getDataSource = async () => {
    this.setState({ loading: true });
    const { competitionId, divisionId, roundName, searchText } = this.props.query;
    if (!competitionId) {
      return;
    }
    let page = this.state.page;
    const limit = this.limit;
    let offset = 10 * (page - 1);
    const body = {
      competitionId,
      divisionId,
      roundName,
      searchText,
      isTeamQuery: true,
      paging: {
        limit,
        offset,
      },
    };
    try {
      const result = await RegistrationAxiosApi.getTeamPerMatchFeeList(body);
      if (result.status === 1) {
        let {
          dataList: dataSource = [],
          page: { totalCount: total },
          statistics: { paidAmount = 0, paidCount = 0, owingAmount = 0, owingCount = 0 },
        } = result.result.data;
        if (!isArrayNotEmpty(dataSource)) {
          dataSource = [];
        }
        let sum = { paidAmount, paidCount, owingAmount, owingCount };

        this.setState({ dataSource, total, sum });
      } else {
        handleError({ result, type: ErrorType.Failed });
      }
    } catch (error) {
      handleError({ type: ErrorType.Error, error });
    }
    this.setState({ loading: false });
  };

  goToTeamDetail = record => {
    if (this.props.onHandleTeamClick) {
      this.props.onHandleTeamClick(record);
    }
  };

  contentView = () => {
    const { page, dataSource, total, loading } = this.state;

    return (
      <div className="match-fee-table-view mt-4">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={loading}
            className="home-dashboard-table"
            columns={this.columns}
            dataSource={dataSource}
            pagination={false}
            rowKey={record => 'team' + record.teamId}
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

  summaryView = () => {
    const { paidAmount, paidCount, owingAmount, owingCount } = this.state.sum;
    return (
      <div className="comp-dash-table-view mt-2">
        <div>
          <div className="row">
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-3">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.paidNum}</div>
                <div className="reg-payment-price-text">{paidCount}</div>
              </div>
            </div>
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-3">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.paidMoney}</div>
                <div className="reg-payment-price-text">{currencyFormat(paidAmount)}</div>
              </div>
            </div>
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-3">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.owingNum}</div>

                <div className="reg-payment-price-text">{owingCount}</div>
              </div>
            </div>
            <div className="col-xs-12 col-md-6 col-sm-6 col-lg-3">
              <div className="registration-count">
                <div className="reg-payment-paid-reg-text">{AppConstants.owingMoney}</div>
                <div className="reg-payment-price-text">{currencyFormat(owingAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        {this.summaryView()}
        {this.contentView()}
      </div>
    );
  }

  getColumns = () => {
    return [
      {
        title: AppConstants.team,
        dataIndex: 'teamName',
        key: 'teamName',
        render: (name, record, index) => (
          <div>
            <a
              className="input-heading-add-another pt-0"
              onClick={this.goToTeamDetail.bind(this, record)}
            >
              {name}
            </a>
          </div>
        ),
      },
      {
        title: AppConstants.played,
        dataIndex: 'isPlayedCount',
        key: 'isPlayedCount',
      },
      {
        title: AppConstants.paidNum,
        dataIndex: 'paidCount',
        key: 'paidCount',
      },
      {
        title: AppConstants.paidMoney,
        dataIndex: 'paidAmount',
        key: 'paidAmount',
        render: (paidAmount, record, index) => currencyFormat(paidAmount),
      },
      {
        title: AppConstants.owingNum,
        dataIndex: 'owingCount',
        key: 'owingCount',
      },
      {
        title: AppConstants.owingMoney,
        dataIndex: 'owingAmount',
        key: 'owingAmount',
        render: (owingAmount, record, index) => currencyFormat(owingAmount),
      },
    ];
  };
}

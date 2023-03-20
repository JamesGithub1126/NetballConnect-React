import React, { Component } from 'react';
import { Layout, Button, Table, Breadcrumb } from 'antd';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { liveScoreNewsListAction } from '../../store/actions/LiveScoreAction/liveScoreNewsAction';
import { liveScore_formateDate, liveScore_MatchFormate } from '../../themes/dateformate';
import AppImages from '../../themes/appImages';
import history from '../../util/history';
import { getKeyForStateWideMessage, getLiveScoreCompetition } from '../../util/sessionStorage';

const { Content } = Layout;
let this_obj = null;

const listeners = key => ({
  onClick: () => tableSort(key),
});

function tableSort(key) {
  let sortBy = key;
  let sortOrder = null;
  if (this_obj.state.sortBy !== key) {
    sortOrder = 'ASC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'ASC') {
    sortOrder = 'DESC';
  } else if (this_obj.state.sortBy === key && this_obj.state.sortOrder === 'DESC') {
    sortBy = null;
    sortOrder = null;
  }

  const { id } = JSON.parse(getLiveScoreCompetition());
  this_obj.props.liveScoreNewsListAction(id, sortBy, sortOrder);

  this_obj.setState({ sortBy, sortOrder });
}

////columens data

// function checkSorting(a, b, key) {
//   if (a[key] && b[key]) {
//     return a[key].length - b[key].length;
//   }
// }

// /////function to sort table column
// function tableSort(a, b, key) {
//   //if (a[key] && b[key]) {
//   let stringA = JSON.stringify(a[key]);
//   let stringB = JSON.stringify(b[key]);
//   return stringA.localeCompare(stringB);
//   //}
// }

// compare dates

function checkDate(expiryDate, publishedDate) {
  // let currentDate = new Date()
  // if (expiryDate && publishedDate) {
  //     let expiryFormate = new Date(expiryDate)
  //     if (expiryFormate > currentDate || expiryFormate === currentDate) {
  //         return 'green'
  //     } else return 'grey'
  // } else if (publishedDate) {
  //     return 'green'
  // } else if (expiryDate) {
  //     let expiryFormate = new Date(expiryDate)
  //     if (expiryFormate > currentDate || expiryFormate === currentDate) {
  //         return 'green'
  //     } else if (expiryFormate < currentDate) {
  //         return 'grey'
  //     } else return 'red'
  // } else return 'red'

  let currentDate = new Date();
  if (expiryDate && publishedDate) {
    let expiryFormate = new Date(expiryDate);
    if (expiryFormate > currentDate || expiryFormate === currentDate) {
      return 'green';
    } else {
      return 'grey';
    }
  } else if (publishedDate) {
    if (expiryDate) {
      let expiryFormate = new Date(expiryDate);
      if (expiryFormate > currentDate || expiryFormate === currentDate) {
        return 'green';
      } else {
        return 'grey';
      }
    } else {
      return 'green';
    }
  } else {
    return 'red';
  }
}

const columns = [
  {
    title: AppConstants.title,
    dataIndex: 'title',
    key: 'title',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: (title, record) => (
      <NavLink
        to={{
          pathname: '/matchDayNewsView',
          state: { item: record },
        }}
      >
        <span className="input-heading-add-another pt-0">{title}</span>
      </NavLink>
    ),
  },
  {
    title: AppConstants.author,
    dataIndex: 'author',
    key: 'author',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  {
    title: AppConstants.expiry,
    dataIndex: 'news_expire_date',
    key: 'news_expire_date',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: news_expire_date => (
      <span>{news_expire_date ? liveScore_MatchFormate(news_expire_date) : ''}</span>
    ),
  },
  {
    title: AppConstants.recipients,
    dataIndex: 'recipients',
    key: 'recipients',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
  },
  // {
  //     title: AppConstants.published,
  //     dataIndex: 'published_at',
  //     key: 'published_at',
  //     sorter: (a, b) => checkSorting(a, b, 'published_at'),
  //     render: published_at =>
  //         <span className="d-flex justify-content-center w-50">
  //             {published_at && liveScore_formateDate(published_at)}
  //         </span>,
  // },
  {
    title: AppConstants.published,
    dataIndex: 'isActive',
    key: 'isActive',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: isActive => <span>{isActive === 1 ? 'Yes' : 'NO'}</span>,
  },
  {
    title: AppConstants.publishedDate,
    dataIndex: 'published_at',
    key: 'published_at',
    render: published_at => <span>{published_at && liveScore_formateDate(published_at)}</span>,
    // sorter: (a, b) => tableSort(a, b, 'Published_date'),
  },
  {
    title: AppConstants.notification,
    dataIndex: 'isNotification',
    key: 'isNotification',
    sorter: true,
    onHeaderCell: ({ dataIndex }) => listeners(dataIndex),
    render: isNotification => <span>{isNotification === 1 ? 'Yes' : 'NO'}</span>,
  },
  {
    title: AppConstants.active,
    dataIndex: 'news_expire_date',
    key: 'news_expire_date_Active',
    // sorter: (a, b) => a.news_expire_date.length - b.news_expire_date.length,
    render: (news_expire_date, record) => (
      <span className="d-flex justify-content-center w-50">
        <img
          className="dot-image"
          src={
            checkDate(news_expire_date, record.published_at) === 'green'
              ? AppImages.greenDot
              : checkDate(news_expire_date, record.published_at) === 'grey'
              ? AppImages.greyDot
              : AppImages.redDot
          }
          alt=""
          width="12"
          height="12"
        />
      </span>
    ),
  },
];

class LiveScoreNewsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenKey: props.location
        ? props.location.state
          ? props.location.state.screenKey
            ? props.location.state.screenKey
            : null
          : null
        : null,
      sortBy: null,
      sortOrder: null,
    };
    this_obj = this;
  }

  componentDidMount() {
    let stateWideMsg = getKeyForStateWideMessage();
    const { sortBy, sortOrder } = this.state;

    if (stateWideMsg) {
      this.props.liveScoreNewsListAction(1, sortBy, sortOrder);
    } else if (getLiveScoreCompetition()) {
      const { id } = JSON.parse(getLiveScoreCompetition());
      this.props.liveScoreNewsListAction(id, sortBy, sortOrder);
    } else {
      history.push('/matchDayCompetitions');
    }
  }

  headerView = () => {
    return (
      <div className="comp-player-grades-header-drop-down-view mt-4">
        <div className="row">
          <div className="col-sm d-flex align-content-center">
            <Breadcrumb separator=" > ">
              <Breadcrumb.Item className="breadcrumb-add">{AppConstants.newsList}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="col-sm d-flex justify-content-end w-100 flex-row align-items-center">
            <div className="row">
              <div className="col-sm">
                <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                  <NavLink
                    to={{
                      pathname: '/matchDayAddNews',
                      state: { key: 'List', item: null, screenKey: this.state.screenKey },
                    }}
                  >
                    <Button className="primary-add-comp-form" type="primary">
                      + {AppConstants.addNews}
                    </Button>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ////////tableView view for Umpire list
  tableView = () => {
    const { liveScoreNewsState } = this.props;
    let newsData = liveScoreNewsState ? liveScoreNewsState.liveScoreNewsListData : [];
    let stateWideMsg = getKeyForStateWideMessage();
    return (
      <div className="comp-dash-table-view mt-4 pb-5">
        <div className="table-responsive home-dash-table-view">
          <Table
            loading={this.props.liveScoreNewsState.onLoad}
            className="home-dashboard-table"
            columns={columns}
            dataSource={newsData}
            pagination={false}
            rowKey={record => 'newsData' + record.id}
          />
        </div>

        {stateWideMsg && this.footerView()}
      </div>
    );
  };

  //////footer view containing all the buttons like submit and cancel
  footerView = () => {
    return (
      <div className="fluid-width paddingBottom56px">
        <div className="row">
          <div className="col-sm-3 mt-5">
            <div className="reg-add-save-button">
              <NavLink to="/matchDayCompetitions">
                <Button className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.back}
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let stateWideMsg = getKeyForStateWideMessage();
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.matchDay}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        {stateWideMsg ? (
          <InnerHorizontalMenu menu={'liveScoreNews'} liveScoreNewsSelectedKey="21" />
        ) : (
          <InnerHorizontalMenu menu="liveScore" liveScoreSelectedKey="21" />
        )}
        <Layout>
          {this.headerView()}
          <Content>{this.tableView()}</Content>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ liveScoreNewsListAction }, dispatch);
}

function mapStateToProps(state) {
  return {
    liveScoreNewsState: state.LiveScoreNewsState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveScoreNewsList);

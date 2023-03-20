import React, { useEffect } from 'react';
import { NavLink, Redirect, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, Layout } from 'antd';

import AppConstants from 'themes/appConstants';
import PrivateRoute from 'util/protectedRoute';
import { getUserProfileAction } from 'store/actions/userAction/userAction';
import lazyLoad from 'components/lazyLoad';
import Loader from 'customComponents/loader';
import DashboardLayout from '../dashboardLayout';
import InnerHorizontalMenu from '../innerHorizontalMenu';
import Profile from './Profile';
import Password from './Password';

const { Header, Footer, Content } = Layout;

function Account(props) {
  const {
    location: { pathname },
    appState,
    userState,
    getUserProfileAction,
  } = props;

  useEffect(() => {
    if (!userState.isProfileLoaded) {
      getUserProfileAction();
    }
  }, [userState.isProfileLoaded, getUserProfileAction]);

  return (
    <div className="fluid-width default-bg">
      <DashboardLayout menuHeading={AppConstants.account} menuName={AppConstants.account} />

      <InnerHorizontalMenu
        menu="account"
        selectedKey={pathname === '/account/profile' ? '1' : '2'}
      />

      <Layout>
        <Content className="container">
          <div className="fluid-width">
            <div className="row">
              <div className="col-sm">
                <Header
                  className="form-header-view d-flex align-items-center"
                  style={{
                    paddingLeft: 0,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Breadcrumb separator=" > ">
                    <NavLink to={pathname}>
                      <div className="breadcrumb-product">
                        {pathname === '/account/profile'
                          ? AppConstants.profileHeader
                          : AppConstants.passwordHeader}
                      </div>
                    </NavLink>
                  </Breadcrumb>
                </Header>
              </div>
            </div>

            <Switch>
              <PrivateRoute exact path="/account/profile" component={lazyLoad(Profile)} />
              <PrivateRoute exact path="/account/password" component={lazyLoad(Password)} />

              <Redirect to="/account/profile" />
            </Switch>

            <Loader visible={appState.onLoad || userState.onLoad} />

            <Footer />
          </div>
        </Content>
      </Layout>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUserProfileAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    appState: state.AppState,
    userState: state.UserState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);

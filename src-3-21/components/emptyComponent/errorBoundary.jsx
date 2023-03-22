import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import AppImages from 'themes/appImages';
import AppConstants from 'themes/appConstants';
import history from 'util/history';
import DashboardLayout from 'pages/dashboardLayout';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.REACT_APP_FRIENDLY_ERROR === 'true') {
      this.setState({
        error,
        errorInfo,
      });
    }
  }

  static getDerivedStateFromError(error) {
    if (process.env.REACT_APP_FRIENDLY_ERROR === 'true') {
      return { hasError: true };
    }
  }

  navigateToHome = () => {
    history.push('/');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <DashboardLayout isManuNotVisible />

          <div className="error-boundry-main-div">
            <img src={AppImages.wentWrong} alt="" className="went-wrong-img" />
            <Button className="open-reg-button mt-5" type="primary" onClick={this.navigateToHome}>
              {AppConstants.backToHome}
            </Button>
          </div>

          {/*
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    */}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

ErrorBoundary.defaultProps = {
  children: null,
};

export default ErrorBoundary;

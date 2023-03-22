import React, { Component } from 'react';
// import { Button } from 'antd';

import AppImages from 'themes/appImages';

class NotFound extends Component {
  // goHome = () => {
  //     if (this.props.auth) {
  //         this.props.history.push("/home");
  //     } else {
  //         this.props.history.push("/login");
  //     }
  // }

  render() {
    return (
      <div className="container-fluid not-found w-100 vh-100 d-flex">
        <img src={AppImages.notFound404} alt="not found" />
        {/* <Button type="primary" onClick={this.goHome}>
                  GO BACK
                </Button> */}
      </div>
    );
  }
}

export default NotFound;

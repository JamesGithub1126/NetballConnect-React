import React from 'react';

class HeadDescription extends React.Component {
  render() {
    const { heading, desc } = this.props;
    return (
      <div className="row">
        <div className="col-sm">
          {heading && <span className="custom-heading-text">{heading}</span>}
        </div>
        <div className="col-sm">{desc && <span className="head-decription-text">{desc}</span>}</div>
      </div>
    );
  }
}

export default HeadDescription;

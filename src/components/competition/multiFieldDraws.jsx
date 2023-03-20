import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Button, Breadcrumb, Popover } from 'antd';
import _ from 'lodash';
import RGL, { WidthProvider } from 'react-grid-layout';

import AppConstants from 'themes/appConstants';
import history from 'util/history';
import { locationArr, timeSlots, drawsArray, lagendsArray } from 'mocks/multiDraws';
import InnerHorizontalMenu from 'pages/innerHorizontalMenu';
import DashboardLayout from 'pages/dashboardLayout';

const ReactGridLayout = WidthProvider(RGL);
const screenWidth = window.innerWidth * 0.5;
const perColumn = screenWidth / 5;

const { Footer } = Layout;
const content = (
  <div style={{ padding: 10 }}>
    <p>1-a Waverley V Cromer</p>
    <p>1-b Peninsula V Harbord</p>
    <p>1-c Newport V Manly</p>
    <p>1-d Allambie V Narrabeen</p>
  </div>
);

class MultiFieldDraws extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multiDrawsArray: drawsArray,
    };
  }

  componentDidMount() {}

  headerView = () => (
    <div className="comp-player-grades-header-drop-down-view mt-4">
      <div className="row">
        <div className="col-sm pt-1 d-flex align-content-center">
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">{AppConstants.draws}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-sm-8 d-flex flex-row align-items-center justify-content-end w-100">
          <div className="row">
            <div className="col-sm pt-1">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button className="primary-add-comp-form" type="primary">
                  {AppConstants.edit}
                </Button>
              </div>
            </div>

            <div className="col-sm pt-1">
              <div className="comp-dashboard-botton-view-mobile w-100 d-flex flex-row align-items-center justify-content-end">
                <Button className="primary-add-comp-form" type="primary">
                  {AppConstants.exception}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="inbox-name-text">Manly Warringah Winter 2020</span>
    </div>
  );

  visibleTooltip = (item, index, value) => {
    // TODO: why do we need this assignment?
    const this_ = this;
    const array = this_.state.multiDrawsArray;
    array[index].visible = value;

    this_.setState({ multiDrawsArray: array });
  };

  // slots
  generateDOM = () => {
    // Generate items with properties from the layout, rather than pass the layout directly
    const layout = this.generateLayout();
    return _.map(layout, l => (
      <div
        style={{
          backgroundColor: l.color,
          borderRadius: 5,
        }}
        className="div-styles d-flex justify-content-center align-items-center"
        key={l.i}
        data-grid={l}
      >
        {l.whiteArea.map(() => (
          <Popover content={content} trigger="click">
            <div className="bg-white" key={1} style={{ height: 5, width: 15, margin: 2.5 }} />
          </Popover>
        ))}
      </div>
    ));
  };

  // drag layout view
  generateLayout = () => {
    // TODO: why do we need this assignment?
    const this_ = this;
    return _.map(this_.state.multiDrawsArray, (item, i) => {
      const { minW } = item;
      const { minH } = item;
      const { maxW } = item;
      const { maxH } = item;
      const w = item.normalW;
      const y = item.normalH;
      return {
        x: item.x,
        y: item.y,
        w,
        h: y,
        i: i.toString(),
        minW,
        maxW,
        minH,
        maxH,
        color: item.color,
        visible: item.visible,
        index: i,
        whiteArea: item.whiteArea,
      };
    });
  };

  onLayoutChange = layout => {
    this.props.onLayoutChange(layout);
  };

  containerView = () => (
    <div>
      <div className="d-flex flex-row align-items-end" style={{ height: 70, paddingBottom: 10 }}>
        <div style={{ paddingLeft: 100 }} />
        <div className="d-flex flex-row" style={{ width: screenWidth - perColumn }}>
          {timeSlots.map((item, index) => (
            <div className="d-flex align-items-center" style={{ width: perColumn }}>
              <div className="d-flex flex-column" style={{ paddingLeft: 10 }}>
                {index === 0 ? <span>{item.day}</span> : <span style={{ paddingTop: 14 }} />}
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="d-flex flex-row">
        <div
          className="d-flex flex-column align-items-center"
          style={{ paddingLeft: 50, paddingRight: 10 }}
        >
          {locationArr.map((item, index) => (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: 30,
                marginTop: index === 0 ? 0 : 10,
                backgroundColor: item.color,
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <div style={{ width: screenWidth - perColumn }}>
          <ReactGridLayout
            containerPadding={[0, 0]}
            margin={[10, 10]}
            onLayoutChange={this.onLayoutChange}
            {...this.props}
            preventCollision
            compactType={null}
            rowHeight={30}
          >
            {this.generateDOM()}
          </ReactGridLayout>
        </div>
      </div>
      <div className="mt-5 d-flex flex-row" style={{ paddingLeft: 50 }}>
        {lagendsArray.map(subItem => (
          <div className="legend-color-text-div">
            <div>
              <div className="legend-color-div" style={{ backgroundColor: subItem.colorCode }} />
            </div>
            <div className="legend-text-div">
              <span className="legend-text">{`${subItem.divisionName}-${subItem.gradeName}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // footer view containing all the buttons like submit and cancel
  footerView = () => (
    <div className="fluid-width mt-5">
      <div className="row">
        <div className="col-sm">
          <div className="reg-add-save-button">
            <Button type="cancel-button" onClick={() => console.log('cancel')}>
              {AppConstants.cancel}
            </Button>
          </div>
        </div>
        <div className="col-sm">
          <div className="comp-buttons-view">
            <Button className="publish-button" type="primary" htmlType="submit">
              {AppConstants.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div className="fluid-width default-bg">
        <DashboardLayout
          menuHeading={AppConstants.draws}
          menuName={AppConstants.liveScores}
          onMenuHeadingClick={() => history.push('./matchDayCompetitions')}
        />

        <InnerHorizontalMenu menu="competition" compSelectedKey="18" />

        <Layout>
          {this.headerView()}
          {this.containerView()}
          <Footer>{this.footerView()}</Footer>
        </Layout>
      </div>
    );
  }
}

MultiFieldDraws.propTypes = {
  isDraggable: PropTypes.bool,
  autoSize: PropTypes.bool,
  rowHeight: PropTypes.number,
  cols: PropTypes.number,
  onLayoutChange: PropTypes.func,
};

MultiFieldDraws.defaultProps = {
  isDraggable: true,
  autoSize: true,
  rowHeight: 30,
  cols: 50,
  onLayoutChange: () => {},
};

export default MultiFieldDraws;

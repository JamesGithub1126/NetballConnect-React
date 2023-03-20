import React, { Component, PureComponent } from 'react';
import {
  Layout,
  Button,
  Tooltip,
  Menu,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  message,
  Spin,
  Modal,
  Radio,
} from 'antd';
import { NavLink } from 'react-router-dom';
import AppImages from 'themes/appImages';

const { SubMenu } = Menu;

class DrawActionMenuTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(nextProps) {}

  componentDidMount() {}

  render() {
    let slotObject = this.props.slotObject;
    let disabledStatus = this.props.disabledStatus;
    let courtData = this.props.courtData;
    let dateItem = this.props.dateItem;
    let timeRestrictionsSchedule = this.props.timeRestrictionsSchedule;
    let isDayInPast = this.props.isDayInPast;
    let isAxisInverted = this.props.isAxisInverted;
    let menuMarginLeft = this.props.menuMarginLeft;

    return (
      <>
        {slotObject.drawsId !== null && (
          <div
            // className="box-exception"
            className="position-absolute"
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              minWidth: 16,
              ...(isAxisInverted
                ? {
                    top: '50%',
                    left: menuMarginLeft,
                    transform: 'translateY(-50%)',
                  }
                : {
                    top: menuMarginLeft,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }),
            }}
          >
            {!timeRestrictionsSchedule.isUnavailable && !isDayInPast && (
              <Menu
                className="action-triple-dot-draws"
                theme="light"
                mode="horizontal"
                style={{
                  lineHeight: '16px',
                  borderBottom: 0,
                  cursor: disabledStatus && 'no-drop',
                }}
              >
                <SubMenu
                  disabled={disabledStatus}
                  className="m-0 d-flex justify-content-center"
                  key="sub1"
                  title={
                    <div>
                      {slotObject.isLocked == 1 ? (
                        <img
                          className="dot-image"
                          src={AppImages.drawsLock}
                          alt=""
                          width="16"
                          height="10"
                        />
                      ) : (
                        <img
                          className="dot-image"
                          src={AppImages.moreTripleDot}
                          alt=""
                          width="16"
                          height="10"
                          style={{
                            transform: isAxisInverted ? 'rotate(-90deg)' : 'none',
                          }}
                        />
                      )}
                    </div>
                  }
                >
                  {slotObject.isLocked == 1 && (
                    <Menu.Item
                      key="1"
                      onClick={() =>
                        this.props.firstTimeCompId == '-1' || this.props.filterDates
                          ? this.props.unlockDraws(slotObject.drawsId, '1', courtData.venueCourtId)
                          : this.props.unlockDraws(
                              slotObject.drawsId,
                              dateItem.roundId,
                              courtData.venueCourtId,
                            )
                      }
                    >
                      <div className="d-flex">
                        <span>Unlock</span>
                      </div>
                    </Menu.Item>
                  )}
                  <Menu.Item key="2">
                    <NavLink
                      to={{
                        pathname: `/competitionException`,
                        state: {
                          drawsObj: slotObject,
                          yearRefId: this.props.yearRefId,
                          competitionId: this.props.firstTimeCompId,
                          organisationId: this.props.organisationId,
                        },
                      }}
                    >
                      <span>Exception</span>
                    </NavLink>
                  </Menu.Item>
                </SubMenu>
              </Menu>
            )}
          </div>
        )}
      </>
    );
  }
}

export default DrawActionMenuTimeline;

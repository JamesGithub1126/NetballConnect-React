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
import AppConstants from 'themes/appConstants';
import { callDeleteDraw, callUnlockDraw } from 'util/drawHelper';

const { SubMenu } = Menu;
const { confirm } = Modal;

const DrawActionMenu = props => {
  let slotObject = props.slotObject;
  let disabledStatus = props.disabledStatus;
  let courtData = props.courtData;
  let dateItem = props.dateItem;
  let topMargin = props.topMargin;
  let menuMarginLeft = props.menuMarginLeft;
  let isAxisInverted = props.isAxisInverted;

  const deleteDraw = async drawsId => {
    let body = {
      drawsId,
    };
    confirm({
      title: AppConstants.deleteMatchConfirm,
      okText: AppConstants.yes,
      okType: AppConstants.primary,
      cancelText: AppConstants.no,
      onOk: async () => {
        await callDeleteDraw(body);
        props.getCompetitionDrawsAction(
          props.yearRefId,
          props.firstTimeCompId,
          props.venueId,
          props.roundId,
          props.organisation_Id,
          null,
          null,
          props.applyDateFilter,
        );
      },
      onCancel() {},
    });
  };
  const unLockDraw = async () => {
    let notInDraw = slotObject.outOfCompetitionDate === 1 || slotObject.outOfRoundDate === 1;
    if (notInDraw) {
      await callUnlockDraw(slotObject.drawsId);
      slotObject.isLocked = 0;
      // let roundsData = props.drawsState.getRoundsDrawsdata;
      // let roundIndex = 0;
      // if (props.isCompByRound) {
      //   roundIndex = roundsData.findIndex(x => x.roundId === dateItem.roundId);
      // }
      // const notInDraws = roundsData[roundIndex].notInDraws;
      // let originalSlot = notInDraws.find(x => x.drawsId == slotObject.drawsId);
      // originalSlot.isLocked = 0;
    } else {
      props.firstTimeCompId == '-1' || props.filterDates
        ? props.unlockDraws(slotObject.drawsId, '1', courtData.venueCourtId)
        : props.unlockDraws(slotObject.drawsId, dateItem.roundId, courtData.venueCourtId);
    }
  };

  return (
    <>
      {slotObject.drawsId !== null && (
        <div
          className="box-exception"
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            ...(isAxisInverted
              ? {
                  left: topMargin,
                  minWidth: 15,
                  width: 15,
                  height: 100,
                }
              : {
                  top: topMargin,
                  marginLeft: menuMarginLeft,
                }),
          }}
        >
          <Menu
            className={`action-triple-dot-draws ${isAxisInverted ? 'draw-vertical-menu' : ''}`}
            theme="light"
            mode={isAxisInverted ? 'vertical' : 'horizontal'}
            expandIcon={() => null}
            style={{
              lineHeight: '16px',
              borderBottom: 0,
              cursor: disabledStatus && 'no-drop',
              display: slotObject.isLocked !== 1 && 'flex',
              justifyContent: slotObject.isLocked !== 1 && 'center',
              ...(isAxisInverted
                ? { borderRight: 0, height: 100, alignItems: slotObject.isLocked !== 1 && 'center' }
                : {}),
            }}
          >
            <SubMenu
              disabled={disabledStatus}
              //style={{ ...(isAxisInverted ? { height: 100 } : {}) }}
              key="sub1"
              title={
                slotObject.isLocked == 1 ? (
                  <div
                    className="d-flex justify-content-around"
                    style={{
                      ...(isAxisInverted
                        ? { height: 100, flexDirection: 'column' }
                        : { width: 80, maxWidth: 80 }),
                    }}
                  >
                    {/* <img
                      className="dot-image"
                      src={AppImages.drawsLock}
                      alt=""
                      width="16"
                      height="10"
                    /> */}
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
                  </div>
                ) : (
                  <div>
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
                  </div>
                )
              }
            >
              {slotObject.isLocked == 1 && (
                <Menu.Item key="1" onClick={() => unLockDraw()}>
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
                      yearRefId: props.yearRefId,
                      competitionId: props.firstTimeCompId,
                      organisationId: props.organisationId,
                    },
                  }}
                >
                  <span>Exception</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item
                key="3"
                onClick={() =>
                  props.firstTimeCompId == '-1' || props.filterDates
                    ? deleteDraw(slotObject.drawsId)
                    : deleteDraw(slotObject.drawsId)
                }
              >
                <div className="d-flex">
                  <span>{AppConstants.deleteMatch}</span>
                </div>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
      )}
    </>
  );
};

export default DrawActionMenu;

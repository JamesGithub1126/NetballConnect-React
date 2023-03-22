/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
  Layout,
  Breadcrumb,
  Select,
  Button,
  DatePicker,
  TimePicker,
  Form,
  Modal,
  Spin,
  Checkbox,
  message,
  Radio,
} from 'antd';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';

import draftToHtml from 'draftjs-to-html';
import ImageLoader from '../../customComponents/ImageLoader';
import InputWithHead from '../../customComponents/InputWithHead';
import InnerHorizontalMenu from '../../pages/innerHorizontalMenu';
import DashboardLayout from '../../pages/dashboardLayout';
import AppConstants from '../../themes/appConstants';
import AppImages from '../../themes/appImages';
import ValidationConstants from '../../themes/validationConstant';

import { getOrganisationData } from '../../util/sessionStorage';
import { isArrayNotEmpty, captializedString } from '../../util/helpers';
import {
  getAffiliatesListingAction,
  filterByRelations,
  getAffiliateToOrganisationAction,
  clearListAction,
  getUserDashboardTextualAction,
  getRoleAction,
  getUsersByIds,
} from '../../store/actions/userAction/userAction';

import {
  refreshCommunicationModuleDataAction,
  addCommunicationAction,
} from '../../store/actions/communicationAction/communicationAction';
import Loader from '../../customComponents/loader';
import history from '../../util/history';
import { getOnlyYearListAction } from '../../store/actions/appAction';
import Compress from 'react-image-file-resizer';
const { Header, Footer, Content } = Layout;
const { Option } = Select;

class AddCommunication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      body: '',
      author: '',
      expiryDate: null,
      expiryTime: null,
      toOrganisationIds: [],
      toUserRoleIds: [],
      toUserIds: [],
      imageUrl: null,
      videoUrl: null,
      image: null,
      imageSelection: AppImages.circleImage,
      videoSelection: AppImages.circleImage,
      isEdit: props.location.state ? props.location.state.isEdit : false,
      visible: false,
      imageTimeout: null,
      videoTimeout: null,
      screenKey: props.location?.state?.screenKey,
      key: props.location?.state?.key,
      crossImageIcon: false,
      crossVideoIcon: false,
      organisationId: getOrganisationData() ? getOrganisationData().organisationUniqueKey : null,
      yearRefId: -1,
      competitionUniqueKey: '-1',
      roleId: -1,
      genderRefId: -1,
      linkedEntityId: '-1',
      dobFrom: '-1',
      dobTo: '-1',
      postCode: '-1',
      allOrg: true,
      individualOrg: false,
      allUser: true,
      selectedRoles: false,
      individualUsers: false,
      isFetchedUsersData: false,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let name;
    if (getOrganisationData()) {
      name = getOrganisationData().name;
    } else {
      name = 'World sport action';
    }

    this.props.getRoleAction();
    this.props.getOnlyYearListAction();

    this.setState({ getDataLoading: false, author: name });
    this.formRef.current.setFieldsValue({
      author: name,
    });

    if (this.state.isEdit === true) {
      this.setState({
        imageUrl: this.props.location.state.item.imageUrl,
        videoUrl: this.props.location.state.item.videoUrl,
        author: name,
      });
      this.setInitialFilledValue(this.props.location.state.item, name);
    } else {
      this.props.refreshCommunicationModuleDataAction();
    }

    this.props.getAffiliatesListingAction({
      organisationId: getOrganisationData().organisationUniqueKey,
      affiliatedToOrgId: -1,
      organisationTypeRefId: -1,
      statusRefId: -1,
      paging: { limit: -1, offset: 0 },
      stateOrganisations: false,
      affiliateListByParent: true,
      parentId: getOrganisationData().organisationId,
    });
  }

  componentDidUpdate(prevProps) {
    const { communicationState } = this.props;

    if (prevProps.communicationState !== communicationState) {
      if (
        prevProps.communicationState.addSuccess !== communicationState.addSuccess &&
        communicationState.addSuccess
      ) {
        history.push({
          pathname: '/communicationView',
          state: {
            item: communicationState.addedCommunication,
            id: this.state.key,
            screenKey: this.state.screenKey,
          },
        });
      }
    }
  }

  handleChangeState(field, value) {
    this.setState({
      [field]: value,
    });
  }

  onEditorStateChange = editorState => {
    const body = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    this.setState({
      editorState,
      body,
    });
  };

  setInitialFilledValue(data, author) {
    this.formRef.current.setFieldsValue({
      communicationTitle: data.title,
      author: data.author ? data.author : author,
    });

    const finalBody = data ? (data.body ? data.body : '') : '';

    const html = finalBody;
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.setState({
        editorState,
        body: data.body,
      });
    }

    if (data.expiryDate) {
      const expiryDate = moment(data.expiryDate).format('YYYY-MM-DD');
      const expiryTime = moment(data.expiryDate).format('HH:mm');

      this.setState({
        expiryDate,
        expiryTime,
      });
    }

    const toOrganisationIds = data.toOrganisationIds ? data.toOrganisationIds.split(',') : [];
    const toUserRoleIds = data.toUserRoleIds
      ? data.toUserRoleIds.split(',').map(id => parseInt(id, 10))
      : [];
    let toUserIds = [];
    if (data.toUserIds) {
      if (Array.isArray(data.toUserIds)) {
        toUserIds = data.toUserIds;
      } else if (data.toUserIds.startsWith('[')) {
        toUserIds = JSON.parse(data.toUserIds);
      } else {
        toUserIds = data.toUserIds.split(',');
      }
    }
    toUserIds = toUserIds.map(id => parseInt(id, 10));
    if (data.toUserIds) {
      this.props.getUsersByIds(toUserIds);
    }

    this.setState({
      title: data.title || '',
      allUser: !(data.toUserIds || data.toUserRoleIds),
      selectedRoles: !!data.toUserRoleIds,
      individualUsers: !!data.toUserIds,
      allOrg: !data.toOrganisationIds,
      individualOrg: !!data.toOrganisationIds,
      toUserIds,
      toOrganisationIds,
      toUserRoleIds,
      yearRefId: data.yearRefId,
    });
  }

  /// method to show modal view after click
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  /// method to hide modal view after ok click
  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  /// method to hide modal view after click on cancle button
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  /// method to setimage
  setImage = data => {
    this.setState({ imageSelection: null, image: null, imageUrl: null });
    this.setState({});

    const editData = this.state;

    if (data.files[0] !== undefined) {
      if (this.state.isEdit) {
        editData.imageUrl = '';
      }

      this.setState({ image: data.files[0], imageSelection: URL.createObjectURL(data.files[0]) });
    }
  };

  /// method to open file to select image
  selectImage() {
    const fileInput = document.getElementById('user-pic');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    if (fileInput) {
      fileInput.click();
    }
  }

  /// /method to setVideo
  setVideo = data => {
    this.setState({
      video: null,
      videoSelection: '',
      crossVideoIcon: false,
      videoUrl: null,
    });

    if (data.files[0] !== undefined) {
      if (data.files[0].size > AppConstants.video_size) {
        message.error(AppConstants.videoSize);
        return;
      }
      this.setState({
        videoTimeout: 2000,
        crossVideoIcon: false,
        video: data.files[0],
        videoSelection: URL.createObjectURL(data.files[0]),
      });
      setTimeout(() => {
        this.setState({ videoTimeout: null, crossVideoIcon: true });
      }, 2000);

      if (this.state.isEdit) {
        this.setState({ videoUrl: null });
      }
    }
  };

  /// method to open file to select video
  // eslint-disable-next-line class-methods-use-this
  selectVideo() {
    const fileInput = document.getElementById('user-vdo');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'video/*');
    if (fileInput) {
      fileInput.click();
    }
  }

  // On change title
  onChangeTitle(title) {
    this.setState({ title });
  }

  /// /modal view
  ModalView() {
    return (
      <Modal
        // title="WSA 1"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        centered
        width={0}
        height={0}
        closable={false}
      >
        <Spin size="large" />
      </Modal>
    );
  }

  /// view for breadcrumb
  headerView = () => {
    const isEdit = this.props.location.state ? this.props.location.state.isEdit : null;
    return (
      <div className="header-view">
        <Header
          className="form-header-view"
          style={{
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Breadcrumb separator=" > ">
            <Breadcrumb.Item className="breadcrumb-add">
              {isEdit ? AppConstants.editCommunication : AppConstants.addCommunication}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
      </div>
    );
  };

  /// Manager and Scorer view
  scorerView = () => {
    const { scorerListResult } = this.props.liveScoreState;
    const scorerList = isArrayNotEmpty(scorerListResult) ? scorerListResult : [];

    return (
      <div className="row">
        <div className="col-sm">
          <InputWithHead required="pb-0" heading={AppConstants.scorerHeading} />
          <Select
            mode="tags"
            placeholder={AppConstants.searchScorer}
            style={{ width: '100%' }}
            // onChange={(scorerId) => this.props.liveScoreUpdateNewsAction(scorerId, "title")}
            // value={editData.title}
          >
            {scorerList.map(item => (
              <Option key={`scorer_${item.firstName}`} value={item.firstName}>
                {item.nameWithNumber}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };

  /// Manager and Scorer view
  managerView = () => {
    const { managerListResult } = this.props.liveScoreManagerState;
    const managerList = isArrayNotEmpty(managerListResult) ? managerListResult : [];

    return (
      <div className="row">
        <div className="col-sm">
          <InputWithHead required="pb-0" heading={AppConstants.managerHeading} />
          <Select
            mode="tags"
            placeholder="Select Manager"
            style={{ width: '100%' }}
            // onChange={e => this.venueChange(e)}
            // value={this.state.venue === [] ? AppConstants.selectVenue : this.state.venue}
          >
            {managerList.map(item => (
              <Option key={`manager_${item.firstName}`} value={item.firstName}>
                {`${item.firstName} ${item.lastName}`}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };

  onFileResize = e => {
    const file = e.target.files[0];
    Compress.imageFileResizer(
      file, // the file from input
      file.width, // width
      300, // height
      'JPEG', // compress format WEBP, JPEG, PNG
      100, // quality
      0, // rotation
      blob => {
        this.setState({ image: blob });
      },
      'blob', // blob or base64 default base64
    );
  };

  deleteImage() {
    this.setState({
      image: null,
      imageSelection: AppImages.circleImage,
      crossImageIcon: false,
      imageUrl: null,
    });
  }

  deleteVideo() {
    this.setState({
      video: null,
      videoSelection: AppImages.circleImage,
      crossVideoIcon: false,
      videoUrl: null,
    });
  }

  contentView = () => {
    const { expiryDate, expiryTime, imageUrl, videoUrl } = this.state;
    const editData = this.state;

    return (
      <div className="content-view pt-4">
        <Form.Item
          name="communicationTitle"
          rules={[{ required: true, message: ValidationConstants.communicationValidation[0] }]}
        >
          <InputWithHead
            required="required-field pt-0"
            heading={AppConstants.communicationTitle}
            placeholder={AppConstants.enterCommunicationTitle}
            name="communicationTitle"
            onChange={event => this.setState({ title: captializedString(event.target.value) })}
            value={editData.title}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                communicationTitle: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>
        <InputWithHead heading={AppConstants.communicationBody} />
        <div className="fluid-width mt-2" style={{ border: '1px solid rgb(212, 212, 212)' }}>
          <div className="livescore-editor-news col-sm">
            <Editor
              editorState={this.state.editorState}
              editorClassName="newsDetailEditor"
              placeholder={AppConstants.communicationBody}
              onEditorStateChange={this.onEditorStateChange}
              toolbar={{
                options: [
                  'inline',
                  'blockType',
                  'fontSize',
                  'fontFamily',
                  'list',
                  'textAlign',
                  'colorPicker',
                  'link',
                  'embedded',
                  'emoji',
                  'remove',
                  'history',
                ],
                inline: { inDropdown: true },
                list: { inDropdown: true },
                textAlign: { inDropdown: true },
                link: { inDropdown: true },
                history: { inDropdown: true },
              }}
            />
          </div>
        </div>
        <Form.Item
          name="author"
          rules={[{ required: true, message: ValidationConstants.communicationValidation[1] }]}
        >
          <InputWithHead
            required="required-field pt-4"
            heading={AppConstants.author}
            placeholder={AppConstants.enterAuthor}
            name="authorName"
            onChange={event => this.setState({ author: captializedString(event.target.value) })}
            onBlur={i =>
              this.formRef.current.setFieldsValue({
                author: captializedString(i.target.value),
              })
            }
          />
        </Form.Item>
        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.communicationImage} />
            <div className="reg-competition-logo-view" onClick={this.selectImage}>
              <ImageLoader
                timeout={this.state.imageTimeout}
                src={imageUrl || this.state.imageSelection}
              />
            </div>
            <div>
              <input
                type="file"
                id="user-pic"
                style={{ display: 'none' }}
                onChange={event => {
                  this.setImage(event.target, 'evt.target');
                  this.onFileResize(event);
                  this.setState({ imageTimeout: 2000, crossImageIcon: false });
                  setTimeout(() => {
                    this.setState({ imageTimeout: null, crossImageIcon: true });
                  }, 2000);
                }}
                onClick={event => {
                  // eslint-disable-next-line no-param-reassign
                  event.target.value = null;
                }}
              />

              <div style={{ position: 'absolute', bottom: 65, left: 150 }}>
                {(this.state.crossImageIcon || imageUrl) && (
                  <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
                    <img
                      className="dot-image"
                      src={AppImages.redCross}
                      alt=""
                      width="16"
                      height="16"
                      onClick={() => this.deleteImage()}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.communicationVideo} />
            <div className="reg-competition-logo-view" onClick={this.selectVideo}>
              {videoUrl ||
              (!!this.state.videoSelection &&
                this.state.videoSelection !== AppImages.circleImage) ? (
                <ImageLoader
                  timeout={this.state.videoTimeout}
                  video
                  poster={
                    videoUrl ||
                    (!!this.state.videoSelection &&
                      this.state.videoSelection !== AppImages.circleImage)
                      ? ''
                      : AppImages.circleImage
                  }
                  src={videoUrl || this.state.videoSelection}
                />
              ) : (
                <ImageLoader timeout={this.state.imageTimeout} src={AppImages.circleImage} />
              )}
            </div>
            <input
              type="file"
              id="user-vdo"
              style={{ display: 'none' }}
              onChange={event => {
                this.setVideo(event.target, 'evt.target');
              }}
              onClick={event => {
                // eslint-disable-next-line no-param-reassign
                event.target.value = null;
              }}
            />
            <div style={{ position: 'absolute', bottom: 65, left: 150 }}>
              {(this.state.crossVideoIcon || videoUrl) && (
                <span className="user-remove-btn pl-2" style={{ cursor: 'pointer' }}>
                  <img
                    className="dot-image"
                    src={AppImages.redCross}
                    alt=""
                    width="16"
                    height="16"
                    onClick={() => this.deleteVideo()}
                  />
                </span>
              )}
            </div>
            <span className="video_Message">{AppConstants.videoSizeMessage}</span>
          </div>
        </div>

        <div className="row">
          <div className="col-sm">
            <InputWithHead heading={AppConstants.communicationExpiryDate} />
            <DatePicker
              style={{ width: '100%' }}
              onChange={date => this.setState({ expiryDate: date })}
              format="DD-MM-YYYY"
              value={expiryDate ? moment(expiryDate) : ''}
              showTime={false}
              placeholder="dd-mm-yyyy"
            />
          </div>
          <div className="col-sm">
            <InputWithHead heading={AppConstants.communicationExpiryTime} />
            <TimePicker
              className="comp-venue-time-timepicker"
              style={{ width: '100%' }}
              format="HH:mm"
              value={expiryTime && moment(expiryTime, 'HH:mm')}
              onChange={time => this.setState({ expiryTime: time })}
              onBlur={e => {
                this.setState({ expiryTime: e.target.value && moment(e.target.value, 'HH:mm') });
              }}
              placeholder="Select Time"
            />
          </div>
        </div>

        {this.stateWideMsgView()}
      </div>
    );
  };

  userSearchApi(searchText) {
    this.setState({ isFetchedUsersData: true });

    const {
      yearRefId,
      competitionUniqueKey,
      roleId,
      genderRefId,
      organisationId,
      toOrganisationIds,
      dobFrom,
      dobTo,
      postCode,
    } = this.state;

    const filter = {
      organisationId,
      yearId: yearRefId,
      competitionUniqueKey,
      roleId,
      genderRefId,
      linkedEntityId: '-1',
      dobFrom,
      dobTo,
      postCode,
      searchText,
      paging: {
        limit: 100,
        offset: 0,
      },
      isSearchByTeam: 0,
    };

    this.props.getUserDashboardTextualAction(filter);
  }

  stateWideMsgView() {
    const { allOrg, individualOrg, individualUsers, allUser, selectedRoles, isFetchedUsersData } =
      this.state;

    const {
      impersonationList,
      affiliatesByParentList,
      usersByIdsList,
      userDashboardTextualList,
      onLoadSearch,
      onTextualLoad,
    } = this.props.userState;

    const impersonationListData = isArrayNotEmpty(impersonationList) ? impersonationList : [];
    const affiliateToData =
      impersonationListData.length > 0
        ? impersonationListData.map(aff => {
            const orgId = affiliatesByParentList.find(
              item => item.id === aff.affiliateId,
            )?.affiliateOrgId;
            return {
              ...aff,
              orgId,
            };
          })
        : [];
    const organisationListData =
      affiliateToData.length > 0
        ? affiliateToData.map(aff => ({
            orgId: aff.affiliateOrgId,
            name: aff.affiliateName,
            id: aff.orgId,
          }))
        : [];
    if (
      getOrganisationData() &&
      !organisationListData.find(item => item.orgId === getOrganisationData().organisationUniqueKey)
    ) {
      organisationListData.push({
        orgId: getOrganisationData().organisationUniqueKey,
        name: getOrganisationData().name,
        id: getOrganisationData().organisationId,
      });
    }

    const userDefaultData = !isFetchedUsersData
      ? usersByIdsList.map(user => ({
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }))
      : [];

    const userData = isArrayNotEmpty(userDashboardTextualList)
      ? userDashboardTextualList
      : userDefaultData;

    const selectedRoleArray = [
      { label: AppConstants.admin, value: 'admin' },
      { label: AppConstants.coaches, value: 'coach' },
      { label: AppConstants.managers, value: 'manager' },
      { label: AppConstants.players, value: 'player' },
      { label: AppConstants.playersRegistered, value: 'player_candidate' },
      { label: AppConstants.umpires, value: 'umpire' },
    ];

    return (
      <div>
        <InputWithHead heading={`${AppConstants.organisation}(s)`} />
        <div className="d-flex flex-column">
          <Radio
            className="mt-3"
            onChange={() => {
              this.setState({
                allOrg: true,
                individualOrg: false,
                toOrganisationIds: [],
              });
            }}
            checked={allOrg}
          >
            {AppConstants.allOrganisation}
          </Radio>
          <Radio
            className="mt-3"
            onChange={() => {
              this.setState({
                allOrg: false,
                individualOrg: true,
                toOrganisationIds: [],
              });
            }}
            checked={individualOrg}
          >
            {`${AppConstants.individualOrganisation}(s)`}
          </Radio>
        </div>

        {individualOrg && (
          <div className="mt-3">
            <Select
              className="ml-5"
              mode="multiple"
              style={{ width: '97%', height: '44px' }}
              placeholder={AppConstants.selectOrganisation}
              onChange={value => {
                this.setState({
                  toOrganisationIds: value,
                });
              }}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={onLoadSearch === true ? <Spin size="small" /> : null}
              value={this.state.toOrganisationIds}
            >
              {organisationListData.length > 0 &&
                organisationListData.map((org, index) => (
                  <Option key={`${org.orgId}_${index}`} value={org.id?.toString()}>
                    {org.name}
                  </Option>
                ))}
            </Select>
          </div>
        )}

        <InputWithHead heading={AppConstants.recipients} />
        <div className="mt-3" style={{ display: 'flex', alignItems: 'center' }}>
          <Radio
            onChange={() => {
              this.setState({
                allUser: true,
                toUserRoleIds: [],
                selectedRoles: false,
                individualUsers: false,
              });
            }}
            checked={allUser}
          >
            All Users
          </Radio>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Radio
            className="mt-3"
            onChange={() => {
              this.setState({
                allUser: false,
                toUserIds: [],
                selectedRoles: true,
                individualUsers: false,
              });
            }}
            checked={selectedRoles}
          >
            Selected Role(s)
          </Radio>
        </div>

        <div className="col-sm">
          {selectedRoles && (
            <Checkbox.Group
              value={this.props.userState.roles
                .filter(role => this.state.toUserRoleIds.includes(role.id))
                .map(role => role.name.toLowerCase())}
              onChange={value => {
                const selected =
                  value.length > 0
                    ? value
                        .map(item => {
                          const role = this.props.userState.roles.find(
                            rol => rol.name.toLowerCase() === item.toLowerCase(),
                          );
                          return role?.id;
                        })
                        .filter(item => item)
                    : [];
                this.setState({
                  toUserRoleIds: selected,
                });
              }}
            >
              {selectedRoleArray.map(item => (
                <div key={item.value}>
                  <Checkbox className="single-checkbox-radio-style pt-4 ml-0" value={item.value}>
                    {item.label}
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Radio
            className="mt-3"
            onChange={() => {
              this.setState({
                allUser: false,
                selectedRoles: false,
                toUserRoleIds: [],
                individualUsers: true,
              });
            }}
            checked={individualUsers}
          >
            Individual User(s)
          </Radio>
        </div>

        {individualUsers && (
          <div className="mt-3">
            <Select
              className="ml-5"
              mode="multiple"
              style={{ width: '97%', height: '44px' }}
              placeholder="Select User"
              filterOption={false}
              onChange={value => {
                this.setState({
                  toUserIds: value,
                });
              }}
              notFoundContent={onTextualLoad === true ? <Spin size="small" /> : null}
              onSearch={value => {
                this.setState({ userValue: value });
                if (value && value.length > 2) {
                  this.userSearchApi(value);
                }
              }}
              defaultValue={
                !isFetchedUsersData && userDefaultData
                  ? userDefaultData.map(usr => usr.userId)
                  : this.state.toUserIds
              }
              value={this.state.toUserIds}
            >
              {userData.length > 0 &&
                userData.map(item => (
                  <Option key={item.userId} value={item.userId}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </div>
        )}

        <InputWithHead heading={AppConstants.year} />
        <div className="mt-3">
          <Select
            name="yearRefId"
            className="year-select user-filter-select-drop"
            onChange={refId => {
              this.setState({ yearRefId: refId });
            }}
            value={this.state.yearRefId}
          >
            <Option key={-1} value={-1}>
              {AppConstants.all}
            </Option>
            {this.props.appState.yearList.length > 0 &&
              this.props.appState.yearList.map(item => (
                <Option key={`year_${item.id}`} value={item.id}>
                  {item.description}
                </Option>
              ))}
          </Select>
        </div>
      </div>
    );
  }

  onSaveButton = () => {
    const mediaArray = [this.state.image, this.state.video].filter(media => media);
    const expiryDate = this.state.expiryDate
      ? moment(this.state.expiryDate).format('YYYY-MM-DD')
      : '';
    const expiryTime = this.state.expiryTime ? (this.state.expiryTime) : '';
    const postDate = expiryDate ? moment(expiryDate).set({
      hour: moment(expiryTime).hours(),
      minute: moment(expiryTime).minutes(),
    }):null;
    let toUserIds = this.state.individualUsers ? JSON.stringify(this.state.toUserIds) : '';
    const payload = {
      id: this.state.isEdit ? this.props.location.state.item.id : null,
      title: this.state.title,
      author: this.state.author,
      body: this.state.body,
      key: this.state.key,
      mediaArray,
      expiryDate: postDate,
      organisationId: getOrganisationData().organisationId,
      toOrganisationIds: this.state.individualOrg ? this.state.toOrganisationIds : [],
      toUserRoleIds: this.state.selectedRoles ? this.state.toUserRoleIds : [],
      yearRefId: this.state.yearRefId,
      toUserIds: toUserIds,
      imageUrl: this.state.imageUrl,
      videoUrl: this.state.videoUrl,
    };

    this.props.addCommunicationAction(payload);
  };

  footerView = isSubmitting => (
    <div className="fluid-width">
      <div className="footer-view">
        <div className="row">
          <div className="col-sm pl-3">
            <div className="reg-add-save-button">
              <NavLink
                to={{
                  pathname: '/communicationList',
                  state: { screenKey: this.state.screenKey },
                }}
              >
                <Button className="cancelBtnWidth" type="cancel-button">
                  {AppConstants.cancel}
                </Button>
              </NavLink>
            </div>
          </div>
          <div className="col-sm pr-3">
            <div className="comp-buttons-view">
              <Button
                className="publish-button save-draft-text mr-0"
                type="primary"
                htmlType="submit"
                disabled={isSubmitting}
              >
                {AppConstants.next}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  onFinishFailed = () => {
    message.config({ maxCount: 1, duration: 1.5 });
    message.error(ValidationConstants.plzReviewPage);
  };

  render() {
    return (
      <div className="fluid-width default-bg">
        <Loader
          visible={
            this.props.userState.onImpersonationLoad ||
            this.props.userState.onLoad ||
            this.props.communicationState.onLoad
          }
        />
        <DashboardLayout
          menuHeading={AppConstants.Communication}
          menuName={AppConstants.Communication}
        />

        <InnerHorizontalMenu menu="communication" userSelectedKey="1" />

        <Layout>
          {this.headerView()}
          <Form
            ref={this.formRef}
            autoComplete="off"
            noValidate="noValidate"
            onFinish={this.onSaveButton}
            onFinishFailed={this.onFinishFailed}
          >
            <Content>
              <div className="formView">{this.contentView()}</div>
            </Content>
            <Footer>{this.footerView()}</Footer>
          </Form>
        </Layout>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getRoleAction,
      getAffiliatesListingAction,
      refreshCommunicationModuleDataAction,
      getAffiliateToOrganisationAction,
      clearListAction,
      getUserDashboardTextualAction,
      filterByRelations,
      addCommunicationAction,
      getUsersByIds,
      getOnlyYearListAction,
    },
    dispatch,
  );
}

function mapStateToProps(state) {
  return {
    userState: state.UserState,
    appState: state.AppState,
    communicationState: state.CommunicationState,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCommunication);

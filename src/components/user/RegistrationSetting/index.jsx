import React from 'react';
import { Table, Radio } from 'antd';
import AppConstants from '../../../themes/appConstants';
import './style.css';
import { getUserRoleId } from 'util/permissions';
import {
  UserRole,
  REGISTRATION_QUESTION_CHOICE,
  REGISTRATION_QUESTIONS,
  MEMBERSHIP_PRODUCT_TYPE,
} from 'util/enums';
import { randomKeyGen } from 'util/helpers';
import RegistrationSettingLink from './registrationSettingLink';

export default class RegistrationSetting extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      registrationSettings: [],
      questions: [],
    };
    this.columns = this.getColumns();
    this.groupColumns = this.getGroupColumns();
    this.initializedForm = false;
    let settings = this.props.registrationSettings;
    const { datasource } = this.getDatasource(settings);
    let expandedRowKeys = [];
    if (datasource.length) {
      expandedRowKeys = [datasource[0].key];
    }
    this.state = {
      questions: datasource,
      expandedRowKeys,
    };
  }

  componentDidMount() {
    if (this.props.onRegSettingRef) {
      this.props.onRegSettingRef(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.registrationSettings &&
      nextProps.registrationSettings.length != this.props.registrationSettings.length
    ) {
      const { datasource } = this.getDatasource(nextProps.registrationSettings);
      let expandedRowKeys = [];
      if (datasource.length) {
        expandedRowKeys = [datasource[0].key];
      }
      this.state = {
        questions: datasource,
        expandedRowKeys,
      };
    }
  }

  //#region method
  getFormValues = () => {
    const { questions } = this.state;
    const regSettings = [];
    questions.forEach(group => {
      let selectedQuestions = group.subReference.filter(
        q => q.choice != REGISTRATION_QUESTION_CHOICE.DONT_ASK,
      );
      for (let question of selectedQuestions) {
        regSettings.push({
          isQuestionMandatory: question.choice == REGISTRATION_QUESTION_CHOICE.ASK,
          isAffiliateChoosing:
            question.choice == REGISTRATION_QUESTION_CHOICE.IS_AFFILIATE_CHOOSING,
          registrationSettingRefId: question.id,
        });
      }
    });

    return { values: regSettings };
  };

  getChoice = (choice, question) => {
    let finalChoice = choice;
    //ITC Clearance should always be mandatory
    if (question.id === REGISTRATION_QUESTIONS.ITC_CLEARANCE_QUESTIONS) {
      finalChoice = REGISTRATION_QUESTION_CHOICE.ASK;
    }
    return finalChoice;
  };

  getDatasource = settings => {
    let questions = this.props.questions;
    let membershipTypeMappings = this.props.membershipTypeMappings || [];
    questions = questions.filter(q => q.id != REGISTRATION_QUESTIONS.SHOP);
    let allQuestions = [];
    let datasource = [];
    let childrenChechNumber = null;
    questions.forEach(question => {
      const { subReferences, ...others } = question;
      let group = { ...others, subReference: [], key: randomKeyGen(36) };
      if (subReferences && subReferences.length) {
        subReferences.forEach(sub => {
          const { subReferences: secondLevelRefs, ...secondLevelQuestion } = sub;

          let setting = settings.find(s => s.registrationSettingRefId == sub.id);
          let choice = REGISTRATION_QUESTION_CHOICE.DONT_ASK;
          let disabledAffiliate = false;

          if (setting) {
            if (setting.isQuestionMandatory) {
              choice = REGISTRATION_QUESTION_CHOICE.ASK;
            } else if (setting.isAffiliateChoosing) {
              choice = REGISTRATION_QUESTION_CHOICE.IS_AFFILIATE_CHOOSING;
            }
          }
          if (sub.id == REGISTRATION_QUESTIONS.MEMBERSHIP_TYPE_CHILDREN_CHECK_NUMBER) {
            let coachtype = membershipTypeMappings.find(
              m =>
                m.isChildrenCheckNumber == 1,
            );
            if (coachtype) {
              choice = REGISTRATION_QUESTION_CHOICE.ASK;
              disabledAffiliate = true;
            }
          }

          let secondQuestion = {
            ...secondLevelQuestion,
            choice: this.getChoice(choice, question),
            key: randomKeyGen(36),
            disabledAffiliate,
            parentId: question.id,
          };
          group.subReference.push(secondQuestion);
          if (secondLevelRefs && secondLevelRefs.length) {
            secondLevelRefs.forEach(third => {
              const { subReferences: thirdLevelRefs, ...thirdLevelQuestion } = third;
              let thirdsetting = settings.find(s => s.registrationSettingRefId == third.id);
              let thirdchoice = REGISTRATION_QUESTION_CHOICE.DONT_ASK;
              if (thirdsetting) {
                if (thirdsetting.isQuestionMandatory) {
                  thirdchoice = REGISTRATION_QUESTION_CHOICE.ASK;
                } else if (thirdsetting.isAffiliateChoosing) {
                  thirdchoice = REGISTRATION_QUESTION_CHOICE.IS_AFFILIATE_CHOOSING;
                }
              }
              let thirdQuestion = {
                ...thirdLevelQuestion,
                choice: thirdchoice,
                key: randomKeyGen(36),
              };
              group.subReference.push(thirdQuestion);
            });
          }
        });
      }
      datasource.push(group);
    });

    return { datasource };
  };

  expandedRowRender = record => {
    return <Table columns={this.columns} dataSource={record.subReference} pagination={false} />;
  };

  //#endregion

  //#region  event

  onMandatoryChanged = (id, e) => {
    const { questions } = this.state;
    let question = questions.find(q => q.id == id);
    for (let group of questions) {
      let question = group.subReference.find(sub => sub.id == id);
      if (question) {
        question.choice = e.target.value;
      }
    }
    this.setState({ questions: [...questions] });
  };

  onExpand = (expanded, record) => {
    if (!expanded) {
      this.setState({ expandedRowKeys: [] });
    } else {
      this.setState({ expandedRowKeys: [record.key] });
    }
  };

  //#endregion

  regSettingFormRef = React.createRef();

  findQuestion(name) {
    const { questions } = this.state;
    for (let group of questions) {
      const question = group.subReference?.find(x => x.name === name);
      if (question) {
        return question;
      }
    }
    return null;
  }

  render() {
    const { questions } = this.state;
    const userRoleId = getUserRoleId();
    const teamFollowQuestion =
      userRoleId === UserRole.Admin ? this.findQuestion('team_you_follow') : null;

    return (
      <div className="reg-question-view">
        <div className="fees-view reg-question-card">
          <span className="form-heading">{AppConstants.registrationQuestions}</span>
          <div className="table-responsive reg-question">
            <Table
              loading={this.props.onGenericLoad || this.props.onloadRegSettings}
              rowClassName="question-table-row"
              columns={this.groupColumns}
              dataSource={questions}
              showHeader={false}
              expandable={{
                defaultExpandAllRows: false,
                expandedRowRender: this.expandedRowRender,
                /* expandedRowKeys, */
                /* onExpand: this.onExpand, */
              }}
            />
          </div>
        </div>
        <div className="fees-view reg-question-card mt-5">
          {teamFollowQuestion && teamFollowQuestion.choice === 1 && (
            <RegistrationSettingLink registrationSettingRefId={REGISTRATION_QUESTIONS.SHOP} />
          )}
        </div>
      </div>
    );
  }

  getColumns = () => {
    return [
      {
        title: AppConstants.question,
        dataIndex: 'description',
        ellipsis: true,
        key: 'description',
        width: '60%',
        render: text => <a>{text}</a>,
      },
      {
        title: AppConstants.action,
        dataIndex: 'isQuestionMandatory',
        width: '40%',
        key: 'isQuestionMandatory',
        render: (text, record) => {
          let disabled = false;
          if (record.parentId === REGISTRATION_QUESTIONS.ITC_CLEARANCE_QUESTIONS) {
            disabled = true;
          }
          return (
            <Radio.Group
              onChange={this.onMandatoryChanged.bind(this, record.id)}
              value={record.choice}
              disabled={disabled}
            >
              <Radio value={REGISTRATION_QUESTION_CHOICE.DONT_ASK}>
                {AppConstants.questionDontAsk}
              </Radio>
              <Radio value={REGISTRATION_QUESTION_CHOICE.ASK}>{AppConstants.questionAsk}</Radio>
              <Radio
                value={REGISTRATION_QUESTION_CHOICE.IS_AFFILIATE_CHOOSING}
                disabled={record.disabledAffiliate}
              >
                {AppConstants.questionIsAffiliateChoosing}
              </Radio>
            </Radio.Group>
          );
        },
      },
    ];
  };

  getGroupColumns = () => {
    return [
      {
        title: AppConstants.registrationQuestions,
        dataIndex: 'description',
        ellipsis: true,
        key: 'description',
        width: '100%',
        render: text => <a>{text}</a>,
      },
    ];
  };
}

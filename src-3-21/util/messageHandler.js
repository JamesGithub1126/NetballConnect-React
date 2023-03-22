import { message } from 'antd';
import ValidationConstants from '../themes/validationConstant';
import { ErrorType } from './enums';
import AppConstants from 'themes/appConstants';
const ERROR_MESSAGE_KEY_401 = 'error_message_key_401';
const UNAUTHORIZED_STATUS = 401;
const ERROR_DURATION = 2;

const error = ({ content, status }) => {
  if (status == UNAUTHORIZED_STATUS) {
    message.error({
      content: content ?? ValidationConstants.messageStatus401,
      key: ERROR_MESSAGE_KEY_401,
      duration: ERROR_DURATION,
    });
  } else if (content) {
    message.error(content);
  }
};

const config = ({ duration = 1.5, maxCount = 1 }) => {
  message.config({ duration, maxCount });
};

const handleError = ({ result, error, type }) => {
  if (type == ErrorType.Failed) {
    const msg = result.result.data ? result.result.data.message : AppConstants.somethingWentWrong;
    message.config({
      duration: 1.5,
      maxCount: 1,
    });
    message.error(msg);
  } else if (type == ErrorType.Error) {
    if (error.status === 400) {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      message.error(error && error.error ? error.error : AppConstants.somethingWentWrong);
    } else {
      message.config({
        duration: 1.5,
        maxCount: 1,
      });
      console.log(error);
      message.error(AppConstants.somethingWentWrong);
    }
  }
};

export { error, config, handleError };

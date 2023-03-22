import React from 'react';
import { Input, Modal } from 'antd';
import moment from 'moment';

import Loader from './loader';

const { TextArea } = Input;

class PlayerCommentModal extends React.Component {
  render() {
    const {
      commentList,
      commentLoad,
      placeholder,
      name,
      handleBlur,
      // finalGradeId,
      onChange,
      type,
      value,
      modalTitle,
    } = this.props;
    return (
      <div style={{ backgroundColor: 'red' }}>
        <Modal
          {...this.props}
          className="add-membership-type-modal"
          title={modalTitle}
          // cancelButtonProps={{ style: { display: finalGradeId !== null && 'none' } }}
        >
          <div style={{ overflow: 'auto', minHeight: 50, maxHeight: 200, padding: 10 }}>
            <Loader visible={commentLoad} />
            {commentList.map(commentItem => (
              <div className="col-sm pl-0 pb-2">
                <span style={{ paddingRight: 2 }} className="comment-heading font-weight-bold">
                  {commentItem.createdByName} {'('}
                  {commentItem.organisationName}
                  {')'}{' '}
                </span>
                <span style={{ paddingRight: 2 }} className="comment-heading font-weight-bold">
                  {'('}
                  {moment(commentItem.createdOn).format('DD-MM-YYYY HH:mm')}
                  {')'} {':'}
                  {'   '}
                </span>
                <span className="comment-heading">{commentItem.comment}</span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <TextArea
              className="textAreaInput"
              placeholder={placeholder}
              allowClear
              name={name}
              // handleChange={(name) => alert(name)}
              onBlur={handleBlur}
              onChange={onChange}
              type={type}
              value={value}
              // defaultValue="xyz"
              {...this.props}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

export default PlayerCommentModal;

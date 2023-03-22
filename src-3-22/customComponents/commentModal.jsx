import React from 'react';
import { Input, Modal } from 'antd';
import moment from 'moment';

import Loader from './loader';

const { TextArea } = Input;

class CommentModal extends React.Component {
  render() {
    const {
      commentList,
      commentLoad,
      placeholder,
      name,
      handleBlur,
      // finalGradeId,
      // owner,
      // proposedGradeID,
      // OwnCreatedComment,
      // affilateCreatedComment,
      // affilate,
      onChange,
      type,
      value,
      modalTitle,
      // ownnerComment,
      // affilateComment,
    } = this.props;
    return (
      <div className="bg-danger">
        <Modal className="add-membership-type-modal" title={modalTitle} {...this.props}>
          <div
            className="over"
            style={{
              minHeight: 50,
              maxHeight: 200,
              padding: 10,
              overflow: 'auto',
            }}
          >
            <Loader visible={commentLoad} />
            {commentList.map(commentItem => (
              <div className="col-sm pl-0 pb-2">
                <span className="comment-heading font-weight-bold pr-2">
                  {commentItem.createdByName} {'('}
                  {commentItem.organisationName}
                  {')'}{' '}
                </span>
                <span className="comment-heading font-weight-bold pr-2">
                  {'('}
                  {moment(commentItem.createdOn).format('DD-MM-YYYY HH:mm')}
                  {')'} {':'}
                  {'   '}
                </span>
                <span className="comment-heading">{commentItem.comment}</span>
              </div>
            ))}
          </div>
          {/* {finalGradeId !== null && owner && (
                        <div>
                            <div className="col-sm pl-0 pb-2">
                                {owner !== null && (
                                    <span style={{ fontSize: 18 }} className="comment-heading font-weight-bold pr-2">{owner}{" "}</span>
                                )}
                                {OwnCreatedComment !== null && (
                                    <span style={{ fontSize: 18 }} className="comment-heading font-weight-bold pr-2">{"("}{OwnCreatedComment}{")"}{" "}{":"}{"   "}</span>
                                )}
                                {ownnerComment !== null && (
                                    <span className="comment-heading">{ownnerComment}</span>
                                )}
                            </div>
                            <div>
                            </div>
                        </div>
                    )}
                    {proposedGradeID !== null && affilate && (
                        <div className="col-sm pl-0 pb-2">
                            {affilate !== null && (
                                <span style={{ fontSize: 18 }} className="comment-heading font-weight-bold pr-2">{affilate}{" "}</span>
                            )}
                            {affilateCreatedComment !== null && (
                                <span style={{ fontSize: 18 }} className="comment-heading font-weight-bold pr-2">{"("}{affilateCreatedComment}{')'}{" "}{":"}{"   "}</span>
                            )}
                            {affilateComment !== null && (
                                <span className="comment-heading">{affilateComment}</span>
                            )}
                        </div>
                    )} */}
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

export default CommentModal;

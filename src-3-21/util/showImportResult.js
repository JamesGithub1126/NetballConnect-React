import React from 'react';
import { Modal, Table } from 'antd';

import AppConstants from 'themes/appConstants';

const { success } = Modal;

// const errLine = (key, error) => (
//     <div key={key}>
//         <div
//             style={{
//                 minWidth: 'max-content',
//                 color: 'red',
//             }}
//         >
//             {`${key}: `}
//         </div>
//         <div>{error.message.map((msg, index) => (<p key={index * index}>{msg}</p>))}</div>
//     </div>
// );

// const showContent = (errors) => {
//     const keys = Object.keys(errors);

//     return (
//         <div style={{ maxHeight: '200px', overflow: 'auto' }}>
//             {keys.length === 0 ? (
//                 <h3>No issue is occurred.</h3>
//             ) : (
//                 keys.map((key) => errLine(key, errors[key]))
//             )}
//         </div>
//     );
// };

export const receiptImportResult = result => {
  const resData = result.data.data;
  const resMsg = result.data.message;
  const resErr = result.data.error;

  success({
    title: resMsg,
    // content: showContent(resErr),
    type: Object.keys(resErr).length === 0 ? 'success' : resData.length === 0 ? 'error' : 'warning',
    okText: AppConstants.ok,
    okType: AppConstants.primary,
    okButtonProps: { className: 'ant-btn primary-add-comp-form ant-btn-primary' },
    cancelButtonProps: { className: 'hide' },
    onOk() {},
  });
};

export const showInvalidData = (cols, importResult) => {
  const columns = [
    {
      title: AppConstants.line,
      dataIndex: 'index',
      key: 'index',
    },
    ...cols,
    {
      title: AppConstants.errorMessage,
      dataIndex: 'message',
      key: 'message',
      className: 'error-message-column',
      align: 'center',
      render: mes => (
        <>
          {mes.map((m, index) => (
            <p
              key={`message_${index}`}
              style={{
                marginBottom: 0,
                color: 'red',
              }}
            >
              {m}
            </p>
          ))}
        </>
      ),
    },
  ];

  const importRes =
    importResult && Object.keys(importResult.rawData).length > 0 ? importResult.rawData : [];

  if (importRes.length === 0) {
    return <></>;
  }

  const errorMes =
    importResult && Object.keys(importResult.error).length > 0 ? importResult.error : {};

  return (
    <div className="formView mt-3">
      <div className="content-view">
        <span className="input-heading">{AppConstants.invalidRecords}</span>

        <div className="table-responsive home-dash-table-view">
          <Table
            className="home-dashboard-table"
            columns={columns}
            dataSource={Object.keys(errorMes).map(key => {
              const rowNum = key.split(' ')[1];
              return {
                ...importRes[rowNum - 2],
                index: rowNum,
                message: errorMes[key].message,
              };
            })}
            rowKey={record => record.index}
          />
        </div>
      </div>
    </div>
  );
};

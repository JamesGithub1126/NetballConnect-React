import { message } from 'antd';
import { ConfirmModal } from 'customComponents/confirmModal';
import { RegistrationUserRoles } from 'enums/registrationEnums';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { liveScoreCoachListAction } from 'store/actions/LiveScoreAction/liveScoreCoachAction';
import LiveScoreAxiosApi from 'store/http/liveScoreHttp/liveScoreAxiosApi';
import AppConstants from 'themes/appConstants';

const LiveScoreDeleteCoachModal = ({
  triggerModalVisibility,
  coachRecord,
  competitionId,
  competitionDetails,
  coachState,
}) => {
  const dispatch = useDispatch();
  console.log(coachState);
  const handleOnOkButtonClicked = async () => {
    try {
      const { result } = await LiveScoreAxiosApi.deleteCoaches({
        record: coachRecord,
        compId: competitionId,
        role: RegistrationUserRoles.Coach,
      });
      await triggerModalVisibility();
      if (result.data.status === 'error') {
        message.error(result.data.message, 1);
      } else {
        message.success(result.data.message, 1);
        coachState.pageSize = coachState.pageSize ? coachState.pageSize : 10;
        dispatch(
          liveScoreCoachListAction(
            17,
            competitionDetails.compOrgId,
            competitionDetails.searchText,
            competitionDetails.offset,
            coachState.pageSize,
            competitionDetails.sortBy,
            competitionDetails.sortOrder,
            competitionDetails.liveScoreCompIsParent,
            competitionDetails.competitionId,
          ),
        );
      }
    } catch (err) {
      await message.error(AppConstants.somethingWentWrong, 1);
    }
  };
  return (
    <ConfirmModal
      confirmText={AppConstants.confirm}
      content={AppConstants.deleteCoachConfirmMsg}
      title={AppConstants.modalProceedMsg}
      visible="true"
      onOk={() => handleOnOkButtonClicked()}
      onCancel={() => triggerModalVisibility()}
      okText={AppConstants.ok}
      cancelText={AppConstants.cancel}
    />
  );
};

export default LiveScoreDeleteCoachModal;

import ApiConstants from '../../../themes/apiConstants';
import { MatchUmpirePaymentStatus } from '../../../enums/enums';
import { cloneDeep } from 'lodash';

const initialState = {
  onLoad: false,
  error: null,
  result: [],
  status: 0,
  initialPaymentData: [],
  umpirePaymentList: [],
  totalCount: 1,
  currentPage: 1,
  pageSize: 10,
  paymentTransferPostData: [],
  onPaymentLoad: false,
  umpirePaymentObject: null,
  adminList: [],
};

function getFilterUmpirePayment(umpirePaymentArr) {
  return umpirePaymentArr.map(payment => ({
    ...payment,
    markedForPayment:
      payment.paymentStatusRefId === MatchUmpirePaymentStatus.Paid ||
      payment.paymentStatusRefId === MatchUmpirePaymentStatus.Approved,
  }));
}

function createTransfer(umpirePayment) {
  return {
    userId: umpirePayment.userId,
    id: umpirePayment.id,
    authorizer2Id: umpirePayment.authorizer2Id,
    stripeId: umpirePayment.user.stripeAccountId,
    competitionOrganisationId: umpirePayment.competitionOrganisationId,
    paymentStatusRefId: umpirePayment.paymentStatusRefId,
    amount: umpirePayment.amount,
    extraAmount: umpirePayment.extraAmount,
    markedForPayment: !!umpirePayment.markedForPayment,
  };
}

function getPaymentTransferFilterData(umpirePaymentArr) {
  return umpirePaymentArr
    .filter(
      umpirePayment =>
        umpirePayment.paymentStatusRefId === MatchUmpirePaymentStatus.Approved ||
        umpirePayment.paymentStatusRefId === MatchUmpirePaymentStatus.Paid,
    )
    .map(umpirePayment => createTransfer(umpirePayment));
}

function getAllSelectedBoxData(umpirePaymentArr) {
  return umpirePaymentArr.filter(
    payment => payment.paymentStatusRefId === MatchUmpirePaymentStatus.Approved,
  );
}

function updateUmpirePaymentData(state, action) {
  const { data, key, umpireId } = action.data;
  let paymentTransferPostData = [...state.paymentTransferPostData];
  let umpirePaymentList = [...state.umpirePaymentList];
  const umpireIdx = umpirePaymentList.findIndex(u => u.id === umpireId);
  let umpire = umpirePaymentList[umpireIdx];
  umpire[key] = data;

  let initalUmpire = state.initialPaymentData.find(a => a.id === umpire.id);

  const idx = paymentTransferPostData.findIndex(u => u.id === initalUmpire.id);

  if (idx > -1) {
    if (initalUmpire[key] === data) {
      paymentTransferPostData.splice(idx, 1);
      umpirePaymentList[umpireIdx] = cloneDeep(initalUmpire);
    } else {
      paymentTransferPostData[idx][key] = data;
    }
  } else if (initalUmpire[key] !== data) {
    paymentTransferPostData.push(createTransfer(umpire));
  }

  return {
    umpirePaymentList: cloneDeep(umpirePaymentList),
    paymentTransferPostData: cloneDeep(paymentTransferPostData),
  };
}

function umpirePaymentState(state = initialState, action) {
  switch (action.type) {
    case ApiConstants.API_GET_UMPIRE_PAYMENT_DATA_LOAD:
      return { ...state, onPaymentLoad: true, umpirePaymentObject: action, initialPaymentData: [] };

    case ApiConstants.API_GET_UMPIRE_PAYMENT_DATA_SUCCESS:
      let result = action.result.players;
      let filterUmpirePayment = getFilterUmpirePayment(result);
      const initialPaymentData = cloneDeep(filterUmpirePayment);
      return {
        ...state,
        onPaymentLoad: false,
        umpirePaymentList: filterUmpirePayment,
        paymentTransferPostData: [],
        totalCount: action.result?.page?.totalCount,
        currentPage: action.result?.page?.currentPage,
        status: action.status,
        initialPaymentData: initialPaymentData,
      };

    case ApiConstants.API_UMPIRE_PAYMENT_RESET_LIST:
      return {
        ...state,
        umpirePaymentList: [],
        totalCount: 0,
      };

    case ApiConstants.API_UPDATE_UMPIRE_PAYMENT_DATA:
      const { key } = action.data;
      switch (key) {
        case 'competitionOrganisationId':
        case 'markedForPayment':
        case 'authorizer2Id': {
          const { umpirePaymentList, paymentTransferPostData } = updateUmpirePaymentData(
            state,
            action,
          );
          return {
            ...state,
            umpirePaymentList,
            paymentTransferPostData,
          };
        }

        case 'clearData': {
          const clearedPayments = state.umpirePaymentList.map(payment =>
            payment.paymentStatusRefId === MatchUmpirePaymentStatus.NotApproved
              ? { ...payment, markedForPayment: false }
              : payment,
          );

          return {
            ...state,
            paymentTransferPostData: [],
            initialPaymentData: [],
            umpirePaymentList: clearedPayments,
          };
        }
        default:
          return { ...state };
      }

    case ApiConstants.API_UMPIRE_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onPaymentLoad: false,
      };
    case ApiConstants.API_UMPIRE_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onPaymentLoad: false,
      };

    case ApiConstants.API_UMPIRE_PAYMENT_TRANSFER_DATA_LOAD:
      return { ...state, onPaymentLoad: true, paymentTransferPostData: [] };

    case ApiConstants.API_UMPIRE_PAYMENT_TRANSFER_DATA_SUCCESS:
      return { ...state, onPaymentLoad: false };

    case ApiConstants.API_UMPIRE_PAYMENT_ACTION_LOAD:
      return { ...state, onPaymentLoad: true, initialPaymentData: [], paymentTransferPostData: [] };

    case ApiConstants.API_UMPIRE_PAYMENT_ACTION_SUCCESS:
      const { matchUmpire } = action.result;
      if (matchUmpire) {
        const umpirePaymentList = cloneDeep(state.umpirePaymentList);
        const index = umpirePaymentList.findIndex(item => item.id === matchUmpire.id);
        umpirePaymentList[index] = matchUmpire;
        const filterUmpirePayment = getFilterUmpirePayment(umpirePaymentList);

        return {
          ...state,
          onPaymentLoad: false,
          umpirePaymentList: filterUmpirePayment,
          initialPaymentData: cloneDeep(filterUmpirePayment),
          paymentTransferPostData: [],
        };
      }
      return { ...state, onPaymentLoad: false };

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.umpirePaymentObject = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_UMPIRE_PAYMENT_EXPORT_FILE_LOAD:
      return { ...state, onPaymentLoad: true };

    case ApiConstants.API_UMPIRE_PAYMENT_EXPORT_FILE_SUCCESS:
      return { ...state, onPaymentLoad: false };

    case ApiConstants.SET_UMPIRE_PAYMENT_LIST_PAGE_SIZE:
      return { ...state, pageSize: action.pageSize || 10 };

    case ApiConstants.SET_UMPIRE_ROSTER_LIST_PAGE_CURRENT_NUMBER:
      return { ...state, currentPage: action.pageNum };

    case ApiConstants.API_GET_ADMIN_LIST_DATA_LOAD:
      return { ...state, onLoad: true };

    case ApiConstants.API_GET_ADMIN_LIST_DATA_SUCCESS:
      return { ...state, onLoad: false, adminList: action.result };

    case ApiConstants.API_UMPIRE_PAYMENT_UPDATE_EXTRA_AMOUNT: {
      const { matchUmpires, umpireId, extraAmount, isBulk } = action.payload;
      let transferPostData = [];
      const umpirePaymentList = [...state.umpirePaymentList];
      if (umpireId) {
        transferPostData = [...state.paymentTransferPostData];
        let currUmpire = umpirePaymentList.find(u => u.id === umpireId);
        let currTransfer = transferPostData.find(tp => tp.id === umpireId);
        if (currUmpire && currTransfer) {
          currUmpire.extraAmount = extraAmount;
          currTransfer.extraAmount = extraAmount;
        }
      } else {
        for (let umpire of matchUmpires) {
          let foundUmpire = umpirePaymentList.find(u => u.id === umpire.id);
          if (foundUmpire) {
            if (isBulk) {
              foundUmpire.extraAmount = extraAmount;
            }
            transferPostData.push(createTransfer(foundUmpire));
          }
        }
      }
      return {
        ...state,
        umpirePaymentList: cloneDeep(umpirePaymentList),
        paymentTransferPostData: transferPostData,
      };
    }

    case ApiConstants.API_UMPIRE_PAYMENT_BULK_UPDATE_AUTHORIZER2: {
      const { matchUmpires, bulkAuthorizer2Id } = action.payload;
      const umpirePaymentList = [...state.umpirePaymentList];
      let transferPostData = [];
      for (let umpire of matchUmpires) {
        let foundUmpire = umpirePaymentList.find(u => u.id === umpire.id);
        if (foundUmpire) {
          foundUmpire.authorizer2Id = bulkAuthorizer2Id;
          transferPostData.push(createTransfer(foundUmpire));
        }
      }
      return {
        ...state,
        umpirePaymentList: cloneDeep(umpirePaymentList),
        paymentTransferPostData: transferPostData,
      };
    }

    case ApiConstants.API_UMPIRE_YEAR_CHANGED:
      return {
        ...state,
        umpirePaymentList: [],
      };

    case ApiConstants.API_UMPIRE_PAYMENT_RESTORE_INITAL_DATA: {
      return {
        ...state,
        umpirePaymentList: cloneDeep(state.initialPaymentData),
        paymentTransferPostData: [],
      };
    }

    default:
      return state;
  }
}

export default umpirePaymentState;

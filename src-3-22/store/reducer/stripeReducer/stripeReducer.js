import ApiConstants from '../../../themes/apiConstants';
import { isArrayNotEmpty } from '../../../util/helpers';
import { setOrganisationData, getOrganisationData } from '../../../util/sessionStorage';
// import AppConstants from "../../../themes/appConstants";

const initialState = {
  onLoad: false,
  error: null,
  result: null,
  status: 0,
  accountBalance: null,
  stripeLoginLink: null,
  stripeTransferList: [],
  stripeTransferListPage: 1,
  stripeTransferListTotalCount: 1,
  stripePayoutList: [],
  stripePayoutListTotalCount: 1,
  stripePayoutListPage: 1,
  stripeRefundList: [],
  stripeRefundListTotalCount: 1,
  stripeRefundListPage: 1,
  stripeTransactionPayoutList: [],
  stripeTransactionPayoutListTotalCount: 1,
  stripeTransactionPayoutListPage: 1,
  getInvoicedata: [],
  charityRoundUpFilter: [],
  subTotalFees: 0,
  subTotalGst: 0,
  paymentListData: [],
  paymentListPage: 1,
  paymentListPageSize: 10,
  paymentListTotalCount: 1,
  paymentDashboardListAction: null,
  paymentCompetitionList: [],
  invoiceId: null,
  transactionId: null,
  getAffiliteDetailData: [],
  invoiceData: null,
  participantSummaryList: [],
  participantCompetitionList: [],
  participantSummaryListTotalCount: 1,
  participantSummaryListPage: 1,
  participantSummaryListPageSize: 10,
  numberOfRegistrations: 0,
  totalRevenue: 0,
  totalPaid: 0,
  totalPending: 0,
  financialSummaryData: {},
  membershipProducts: [],
};

//for making charity roundup array
// function getCharityRoundUpArray(allData) {
//     let getCharityRoundUpArray = []
//     let feesAllData = allData[0].fees
//     for (let i in feesAllData) {
//         let charityObj = {
//             competitionId: feesAllData[i].competitionDetail.competitionId,
//             competitionName: feesAllData[i].competitionDetail.competitionName,
//             charityTitle: isArrayNotEmpty(feesAllData[i].charityDetail) ? feesAllData[i].charityDetail[0].roundUpName : "N/A",
//             roundUpDescription: isArrayNotEmpty(feesAllData[i].charityDetail) ? feesAllData[i].charityDetail[0].roundUpDescription : "N/A",
//             charityDetail: isArrayNotEmpty(feesAllData[i].charityDetail) ? feesAllData[i].charityDetail : [],
//         }
//         let competitionIdIndex = getCharityRoundUpArray.findIndex(x => x.competitionId == feesAllData[i].competitionDetail.competitionId)
//         if (competitionIdIndex === -1) {
//             getCharityRoundUpArray.push(charityObj)
//         }

//     }
//     let charityNoneObject = {
//         competitionId: 0,
//         competitionName: "None",
//         charityTitle: "None",
//         roundUpDescription: "",
//         charityDetail: [],
//     }
//     getCharityRoundUpArray.push(charityNoneObject)
//     return getCharityRoundUpArray
// }

//for calculating subtotal
// function calculateSubTotal(allData) {
//     let fees_All_Data = allData[0].fees
//     let resultData = {
//         invoiceSubtotal: 0,
//         invoiceGstTotal: 0
//     }
//     for (let i in fees_All_Data) {

//         if (fees_All_Data[i].totalAmount.affiliateFees && fees_All_Data[i].totalAmount.affiliateGst) {
//             resultData.invoiceSubtotal = Number(resultData.invoiceSubtotal) + Number(fees_All_Data[i].totalAmount.affiliateFees) +
//                 Number(fees_All_Data[i].totalAmount.competitionFees) + Number(fees_All_Data[i].totalAmount.membershipFees)

//             resultData.invoiceGstTotal = Number(resultData.invoiceGstTotal) + Number(fees_All_Data[i].totalAmount.affiliateGst) +
//                 Number(fees_All_Data[i].totalAmount.competitionGst) + Number(fees_All_Data[i].totalAmount.membershipGst)
//         }
//         else {
//             resultData.invoiceSubtotal = Number(resultData.invoiceSubtotal) +
//                 Number(fees_All_Data[i].totalAmount.competitionFees) + Number(fees_All_Data[i].totalAmount.membershipFees)

//             resultData.invoiceGstTotal = Number(resultData.invoiceGstTotal) +
//                 Number(fees_All_Data[i].totalAmount.competitionGst) + Number(fees_All_Data[i].totalAmount.membershipGst)
//         }

//     }
//     return resultData
// }

function getAffiliteDetailArray(allData) {
  let getAffiliteDetailArray = [];
  getAffiliteDetailArray = allData.organisationInfo;
  // let orgMap = new Map();
  // allData.compParticipants.forEach(item => {
  //   item.membershipProducts.forEach(mem => {
  //     if (isNullOrUndefined(mem.fees.membershipFee)) {
  //       let key = mem.fees.membershipFee.organisationId;
  //       if (orgMap.get(key) == undefined) {
  //         let obj = {
  //           organisationId: mem.fees.membershipFee.organisationId,
  //           organisationName: mem.fees.membershipFee.name,
  //           organiationEmailId: mem.fees.membershipFee.emailId,
  //           organiationPhoneNo: mem.fees.membershipFee.phoneNo,
  //         };
  //         getAffiliteDetailArray.push(obj);
  //         orgMap.set(key, obj);
  //       }
  //     }
  //     if (isNullOrUndefined(mem.fees.affiliateFee)) {
  //       let key = mem.fees.affiliateFee.organisationId;
  //       if (orgMap.get(key) == undefined) {
  //         let obj = {
  //           organisationId: mem.fees.affiliateFee.organisationId,
  //           organisationName: mem.fees.affiliateFee.name,
  //           organiationEmailId: mem.fees.affiliateFee.emailId,
  //           organiationPhoneNo: mem.fees.affiliateFee.phoneNo,
  //         };
  //         getAffiliteDetailArray.push(obj);
  //         orgMap.set(key, obj);
  //       }
  //     }
  //     if (isNullOrUndefined(mem.fees.competitionOrganisorFee)) {
  //       let key = mem.fees.competitionOrganisorFee.organisationId;
  //       if (orgMap.get(key) == undefined) {
  //         let obj = {
  //           organisationId: mem.fees.competitionOrganisorFee.organisationId,
  //           organisationName: mem.fees.competitionOrganisorFee.name,
  //           organiationEmailId: mem.fees.competitionOrganisorFee.emailId,
  //           organiationPhoneNo: mem.fees.competitionOrganisorFee.phoneNo,
  //         };
  //         getAffiliteDetailArray.push(obj);
  //         orgMap.set(key, obj);
  //       }
  //     }
  //   });
  // });
  return getAffiliteDetailArray;
}

function stripe(state = initialState, action) {
  switch (action.type) {
    ///******fail and error handling */
    case ApiConstants.API_STRIPE_API_FAIL:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onExportLoad: false,
        refundAmountLoad: false,
      };
    case ApiConstants.API_STRIPE_API_ERROR:
      return {
        ...state,
        onLoad: false,
        error: action.error,
        status: action.status,
        onExportLoad: false,
        refundAmountLoad: false,
      };

    //////stripe payment account balance API
    case ApiConstants.API_STRIPE_ACCOUNT_BALANCE_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_STRIPE_ACCOUNT_BALANCE_API_SUCCESS:
      return {
        ...state,
        accountBalance: action.result,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ////////For stripe charging payment API
    case ApiConstants.API_STRIPE_CHARGING_PAYMENT_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_STRIPE_CHARGING_PAYMENT_API_SUCCESS:
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ///////save stripe account
    case ApiConstants.API_SAVE_STRIPE_ACCOUNT_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_SAVE_STRIPE_ACCOUNT_API_SUCCESS:
      let orgData = isArrayNotEmpty(action.result.organisationId)
        ? action.result.organisationId[0]
        : getOrganisationData();
      setOrganisationData(orgData);
      return {
        ...state,
        onLoad: false,
        status: action.status,
        error: null,
      };

    //////stripe login link
    case ApiConstants.API_GET_STRIPE_LOGIN_LINK_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STRIPE_LOGIN_LINK_API_SUCCESS:
      return {
        ...state,
        stripeLoginLink: action.result,
        onLoad: false,
        status: action.status,
        error: null,
      };

    /////stripe payments transfer list
    case ApiConstants.API_GET_STRIPE_PAYMENTS_TRANSFER_LIST_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STRIPE_PAYMENTS_TRANSFER_LIST_API_SUCCESS:
      let transferListData = action.result;
      return {
        ...state,
        stripeTransferList: isArrayNotEmpty(transferListData.transfers)
          ? transferListData.transfers
          : [],
        stripeTransferListTotalCount: transferListData.totalCount,
        stripeTransferListPage: action.page,
        onLoad: false,
        status: action.status,
        error: null,
      };

    /////stripe payout list
    case ApiConstants.API_GET_STRIPE_PAYOUT_LIST_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STRIPE_PAYOUT_LIST_API_SUCCESS:
      let payoutListData = action.result;
      return {
        ...state,
        stripePayoutList: isArrayNotEmpty(payoutListData.payouts) ? payoutListData.payouts : [],
        stripePayoutListTotalCount: payoutListData.totalCount,
        stripePayoutListPage: action.page,
        onLoad: false,
        status: action.status,
        error: null,
      };

    case ApiConstants.API_GET_STRIPE_REFUND_LIST_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STRIPE_REFUND_LIST_API_SUCCESS:
      let refundListData = action.result;
      return {
        ...state,
        stripeRefundList: isArrayNotEmpty(refundListData.refunds) ? refundListData.refunds : [],
        stripeRefundListTotalCount: refundListData.totalCount,
        stripeRefundListPage: action.page,
        onLoad: false,
        status: action.status,
        error: null,
      };

    /////stripe single payout transaction list
    case ApiConstants.API_GET_STRIPE_TRANSACTION_PAYOUT_LIST_API_LOAD:
      return { ...state, onLoad: true, error: null };

    case ApiConstants.API_GET_STRIPE_TRANSACTION_PAYOUT_LIST_API_SUCCESS:
      let payoutTransactionListData = action.result;
      return {
        ...state,
        stripeTransactionPayoutList: isArrayNotEmpty(payoutTransactionListData.payoutTransfers)
          ? payoutTransactionListData.payoutTransfers
          : [],
        stripeTransactionPayoutListTotalCount: payoutTransactionListData.totalCount,
        stripeTransactionPayoutListPage: action.page,
        onLoad: false,
        status: action.status,
        error: null,
      };

    ///get invoice
    // case ApiConstants.API_GET_INVOICE_LOAD:
    //     return {
    //         ...state,
    //         onLoad: true,
    //         error: null,

    //     }

    // case ApiConstants.API_GET_INVOICE_SUCCESS:
    //     let invoicedata = isArrayNotEmpty(action.result) ? action.result : []
    //     let charityRoundUpData = getCharityRoundUpArray(invoicedata)
    //     let calculateSubTotalData = calculateSubTotal(invoicedata)
    //     state.subTotalFees = calculateSubTotalData.invoiceSubtotal
    //     state.subTotalGst = calculateSubTotalData.invoiceGstTotal
    //     state.charityRoundUpFilter = charityRoundUpData
    //     state.getInvoicedata = action.result
    //     return {
    //         ...state,
    //         onLoad: false,
    //     }
    ///get invoice
    case ApiConstants.API_GET_SHOP_INVOICE_LOAD:
    case ApiConstants.API_GET_INVOICE_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_GET_SHOP_INVOICE_SUCCESS: {
      state.invoiceData = action.result;
      return {
        ...state,
        onLoad: false,
      };
    }

    case ApiConstants.API_GET_INVOICE_SUCCESS:
      state.invoiceData = action.result;
      state.getAffiliteDetailData = getAffiliteDetailArray(action.result);
      return {
        ...state,
        onLoad: false,
      };

    ///payment listing
    case ApiConstants.API_PAYMENT_TYPE_LIST_LOAD:
      return { ...state, onLoad: true, paymentDashboardListAction: action };

    case ApiConstants.API_PAYMENT_TYPE_LIST_SUCCESS:
      let paymentData = action.result;
      return {
        ...state,
        onLoad: false,
        paymentListData: paymentData.transactions,
        paymentCompetitionList: paymentData.competitionList,
        paymentListTotalCount: paymentData.page.totalCount,
        paymentListPage: paymentData.page ? paymentData.page.currentPage : 1,
      };

    case ApiConstants.API_PAYMENT_TYPE_LIST_CLEAR:
      return {
        ...state,
        paymentListData: [],
        paymentCompetitionList: [],
        paymentListTotalCount: 0,
        paymentListPage: 1,
      };

    case ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_LOAD:
      return { ...state, onExportLoad: true };

    case ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_SUCCESS:
      return {
        ...state,
        onExportLoad: false,
      };

    case ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_TRANSACTIONS_LOAD:
      return { ...state, onExportLoad: true };

    case ApiConstants.API_PAYMENT_DASHBOARD_EXPORT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        onExportLoad: false,
      };

    case ApiConstants.API_STRIPE_TRANSACTION_PAYOUT_LIST_EXPORT_LOAD: {
      return {
        ...state,
        onExportLoad: true,
      };
    }
    case ApiConstants.API_STRIPE_TRANSACTION_PAYOUT_LIST_EXPORT_SUCCESS: {
      return {
        ...state,
        onExportLoad: false,
      };
    }

    case ApiConstants.ONCHANGE_COMPETITION_CLEAR_DATA_FROM_LIVESCORE:
      state.paymentDashboardListAction = null;
      return { ...state, onLoad: false };

    case ApiConstants.API_GET_INVOICE_STATUS_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.API_GET_INVOICE_STATUS_SUCCESS:
      let getInvoiceStatusSuccessData = action.result.data;
      state.invoiceId = getInvoiceStatusSuccessData ? getInvoiceStatusSuccessData.invoiceId : 0;
      state.transactionId = getInvoiceStatusSuccessData
        ? getInvoiceStatusSuccessData.transactionId
          ? getInvoiceStatusSuccessData.transactionId
          : 0
        : 0;
      return {
        ...state,
        onLoad: false,
        error: null,
      };
    case ApiConstants.API_EXPORT_PAYMENT_DASHBOARD_LOAD:
      return { ...state, onExportLoad: true };

    case ApiConstants.API_EXPORT_PAYMENT_DASHBOARD_SUCCESS:
      return {
        ...state,
        onExportLoad: false,
      };

    case ApiConstants.SET_PAYMENT_DASHBOARD_LIST_PAGE_SIZE:
      return {
        ...state,
        paymentListPageSize: action.pageSize,
      };

    case ApiConstants.SET_PAYMENT_DASHBOARD_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        paymentListPage: action.pageNum,
      };

    case ApiConstants.API_PARTIAL_REFUND_AMOUNT_LOAD:
      return { ...state, refundAmountLoad: true };

    case ApiConstants.API_PARTIAL_REFUND_AMOUNT_SUCCESS:
      return {
        ...state,
        refundAmountLoad: false,
        error: null,
        status: action.status,
      };

    case ApiConstants.API_PARTICIPANT_SUMMARY_LIST_LOAD:
      return { ...state, onLoad: true, paymentDashboardListAction: action };

    case ApiConstants.API_PARTICIPANT_SUMMARY_LIST_SUCCESS:
      let participantSummary = action.result;
      return {
        ...state,
        onLoad: false,
        participantSummaryList: participantSummary.participantSummary,
        participantCompetitionList: participantSummary.competitionList,
        participantSummaryListTotalCount: participantSummary.page.totalCount,
        participantSummaryListPage: participantSummary.page
          ? participantSummary.page.currentPage
          : 1,
        // uniqueRegistrants: participantSummary.uniqueRegistrants,
        numberOfRegistrations: participantSummary.numberOfRegistrations,
        // grossRegistrationValue: participantSummary.grossRegistrationValue,
        totalRevenue: participantSummary.totalRevenue,
        totalPaid: participantSummary.totalPaid,
        totalPending: participantSummary.totalPending,
        membershipProducts: participantSummary.membershipProducts,
        grossRegistrationValue: participantSummary.grossRegistrationValue,
        uniqueRegistrants: participantSummary.uniqueRegistrants,
      };

    case ApiConstants.SET_PARTICIPANT_SUMMARY_LIST_PAGE_SIZE:
      return {
        ...state,
        participantSummaryListPageSize: action.pageSize,
      };

    case ApiConstants.SET_PARTICIPANT_SUMMARY_LIST_PAGE_CURRENT_NUMBER:
      return {
        ...state,
        participantSummaryListPage: action.pageNum,
      };

    case ApiConstants.CLEAR_INVOICE_DATA: {
      return { ...initialState };
    }

    case ApiConstants.GET_FINANCIAL_SUMMARY_LOAD:
      return {
        ...state,
        onLoad: true,
        error: null,
      };

    case ApiConstants.GET_FINANCIAL_SUMMARY_SUCCESS:
      return {
        ...state,
        onLoad: false,
        financialSummaryData: action.result,
      };

    default:
      return state;
  }
}

export default stripe;

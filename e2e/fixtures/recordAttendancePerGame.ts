import { getJsonfromSheet } from '../utils/convertGoogleSheet_to_Json';

export interface RecordAttendance {
  recordAttendance: any;
}
export const record_attendance: RecordAttendance = {
  recordAttendance: getJsonfromSheet(5).then(record_Attendance => {
    return record_Attendance;
  }),
};

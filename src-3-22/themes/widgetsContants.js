// REVENUE_DATE_RANGES will be used for revenue widget card
export const REVENUE_DATE_RANGES = {
  // today: {
  //   id: 'today',
  //   description: 'Today',
  //   lastPeriodDescription: 'Last hour',
  //   thisPeriodDescription: 'This hour',
  // },
  last_7_days: {
    id: 'last_7_days',
    description: 'Last 7 days',
    lastPeriodDescription: '2 days ago',
    thisPeriodDescription: 'Yesterday',
  },
  last_4_weeks: {
    id: 'last_4_weeks',
    description: 'Last 4 weeks',
    lastPeriodDescription: 'Previous 7 days',
    thisPeriodDescription: 'Current 7 days',
  },
  last_3_months: {
    id: 'last_3_months',
    description: 'Last 3 months',
    lastPeriodDescription: 'Previous 30 days',
    thisPeriodDescription: 'Current 30 days',
  },
  last_year: {
    id: 'last_year',
    description: 'Last year',
    lastPeriodDescription: 'Previous 90 days',
    thisPeriodDescription: 'Current 90 days',
  },
  month_to_date: {
    id: 'month_to_date',
    description: 'Month to date',
    lastPeriodDescription: 'Last month',
    thisPeriodDescription: 'Month to date last year',
  },
  quarter_to_date: {
    id: 'quarter_to_date',
    description: 'Quarter to date',
    lastPeriodDescription: 'Last quarter',
    thisPeriodDescription: 'Quarter to date last year',
  },
  year_to_date: {
    id: 'year_to_date',
    description: 'Year to date',
    lastPeriodDescription: 'Last year',
    thisPeriodDescription: 'Year to date last year',
  },
  all_time: {
    id: 'all_time',
    description: 'All time',
    lastPeriodDescription: '',
    thisPeriodDescription: '',
  },
};

// REGISTRATIONS_DATE_RANGES will be used for registrations widget line chart
export const LINE_CHART_DATE_RANGES = {
  // today: {
  //     id: 'today',
  //     description: 'Today',
  //     lastPeriodDescription: 'Yesterday',
  // },
  last_7_days: {
    id: 'last_7_days',
    description: 'Last 7 days',
    lastPeriodDescription: 'Previous 7 days',
    format: 'DD MMM',
  },
  last_4_weeks: {
    id: 'last_4_weeks',
    description: 'Last 4 weeks',
    lastPeriodDescription: 'Previous 4 weeks',
    format: 'DD MMM',
  },
  last_3_months: {
    id: 'last_3_months',
    description: 'Last 3 months',
    lastPeriodDescription: 'Previous 3 months',
    format: 'MMM YYYY',
  },
  last_year: {
    id: 'last_year',
    description: 'Last 12 months',
    lastPeriodDescription: 'Previous 12 months',
    format: 'MMM YYYY',
  },
  month_to_date: {
    id: 'month_to_date',
    description: 'Month to date',
    lastPeriodDescription: 'This period last year',
    format: 'DD MMM',
  },
  quarter_to_date: {
    id: 'quarter_to_date',
    description: 'Quarter to date',
    lastPeriodDescription: 'This period last year',
    format: 'DD MMM',
  },
  year_to_date: {
    id: 'year_to_date',
    description: 'Year to date',
    lastPeriodDescription: 'This period last year',
    format: 'MMM YYYY',
  },
  all_time: {
    id: 'all_time',
    description: 'All time',
    lastPeriodDescription: '',
    format: 'YYYY',
  },
};

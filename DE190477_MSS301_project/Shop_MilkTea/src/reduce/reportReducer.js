/**
 * Action Types cho Report Reducer
 */
export const REPORT_ACTION_TYPES = {
  REPORT_START: 'REPORT_START',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_DATE_FILTER: 'SET_DATE_FILTER',
  REPORT_FAILURE: 'REPORT_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Trạng thái khởi tạo cho Report
 */
export const initialReportState = {
  dashboardData: null,
  summary: null,
  dateFilter: '30days', // 'today' | '7days' | '30days'
  loading: false,
  error: null,
};

/**
 * Report Reducer - Quản lý state báo cáo và phân tích dữ liệu kinh doanh
 */
export function reportReducer(state, action) {
  switch (action.type) {
    case REPORT_ACTION_TYPES.REPORT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case REPORT_ACTION_TYPES.SET_DASHBOARD_DATA:
      return {
        ...state,
        loading: false,
        dashboardData: action.payload,
        summary: action.payload?.summary || state.summary,
        error: null,
      };

    case REPORT_ACTION_TYPES.SET_SUMMARY:
      return {
        ...state,
        loading: false,
        summary: action.payload,
        error: null,
      };

    case REPORT_ACTION_TYPES.SET_DATE_FILTER:
      return {
        ...state,
        dateFilter: action.payload,
      };

    case REPORT_ACTION_TYPES.REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REPORT_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export default reportReducer;

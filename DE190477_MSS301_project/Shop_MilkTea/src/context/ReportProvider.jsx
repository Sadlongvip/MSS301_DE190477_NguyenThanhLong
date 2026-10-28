import React, { useReducer, useCallback, useEffect } from 'react';
import { ReportContext } from './ReportContext';
import {
  reportReducer,
  initialReportState,
  REPORT_ACTION_TYPES,
} from '../reduce/reportReducer';
import reportService from '../service/reportService';

/**
 * ReportProvider - Nơi DUY NHẤT gọi API từ reportService
 * và điều phối state qua reportReducer.
 * Các UI Component tuyệt đối không gọi trực tiếp reportService.
 */
export function ReportProvider({ children }) {
  const [state, dispatch] = useReducer(reportReducer, initialReportState);

  /**
   * Tính toán startDate và endDate theo filter
   */
  const getDateRange = (filterKey) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = null;

    if (filterKey === 'today') {
      start = end;
    } else if (filterKey === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      start = past.toISOString().split('T')[0];
    } else if (filterKey === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      start = past.toISOString().split('T')[0];
    }
    return { startDate: start, endDate: end };
  };

  /**
   * Tải toàn bộ báo cáo Dashboard
   */
  const fetchDashboardReport = useCallback(async (filter = state.dateFilter) => {
    dispatch({ type: REPORT_ACTION_TYPES.REPORT_START });
    try {
      const { startDate, endDate } = getDateRange(filter);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.topLimit = 10;

      const data = await reportService.getDashboardReport(params);
      dispatch({
        type: REPORT_ACTION_TYPES.SET_DASHBOARD_DATA,
        payload: data,
      });
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Không thể tải báo cáo hệ thống';
      dispatch({
        type: REPORT_ACTION_TYPES.REPORT_FAILURE,
        payload: msg,
      });
      return { success: false, error: msg };
    }
  }, [state.dateFilter]);

  /**
   * Thay đổi bộ lọc thời gian
   */
  const changeDateFilter = useCallback((newFilter) => {
    dispatch({
      type: REPORT_ACTION_TYPES.SET_DATE_FILTER,
      payload: newFilter,
    });
    fetchDashboardReport(newFilter);
  }, [fetchDashboardReport]);

  /**
   * Xuất file CSV báo cáo đơn hàng
   */
  const exportOrdersReportCsv = useCallback(async (filter = state.dateFilter, status = null) => {
    try {
      const { startDate, endDate } = getDateRange(filter);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status && status !== 'ALL') params.status = status;
      await reportService.exportOrdersReportCsv(params);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Lỗi khi xuất file báo cáo đơn hàng' };
    }
  }, [state.dateFilter]);

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    dispatch({ type: REPORT_ACTION_TYPES.CLEAR_ERROR });
  }, []);

  const value = {
    // Trạng thái từ Reducer
    dashboardData: state.dashboardData,
    summary: state.summary,
    dateFilter: state.dateFilter,
    loading: state.loading,
    error: state.error,

    // Cổng duy nhất gọi API
    fetchDashboardReport,
    changeDateFilter,
    exportOrdersReportCsv,
    clearError,
  };


  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export default ReportProvider;

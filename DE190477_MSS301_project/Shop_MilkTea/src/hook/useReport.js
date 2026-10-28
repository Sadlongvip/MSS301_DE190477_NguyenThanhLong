import { useContext } from 'react';
import { ReportContext } from '../context/ReportContext';

/**
 * Custom Hook truy xuất trạng thái và dữ liệu báo cáo thống kê
 */
export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport phải được sử dụng bên trong ReportProvider');
  }
  return context;
}

export default useReport;
